import express from "express";
import http from "http";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { createProxyMiddleware } from "http-proxy-middleware";
import { idocService } from "./services/idocService";
import { eccService } from "./services/eccService";
import { sapEccTableGateway } from "./services/eccTableGateway";
import { nativeEccRfcTableReader } from "./services/eccNativeRfcReader";

async function startServer() {
  // Try to load any local env variables from .env if running standalone/dev mode
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      envContent.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const firstEquals = trimmed.indexOf('=');
          const key = trimmed.slice(0, firstEquals).trim();
          let val = trimmed.slice(firstEquals + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (key && !process.env[key]) {
            process.env[key] = val;
          }
        }
      });
      console.log("[ENV] Read raw configuration parameters securely.");
    }
  } catch (e) {
    console.warn("[ENV] Statically parsing local .env file failed. Handled by framework environment mapping.");
  }

  sapEccTableGateway.setLiveTableReader(nativeEccRfcTableReader);

  const { processSapQuery, isSimulatedTool } = await import("./services/geminiService");
  const { buildAnswerProvenance } = await import("./services/answerProvenance");

  // Persistent audit trail (one JSON line per answered question, one file per day).
  const auditDir = path.resolve(process.cwd(), 'logs', 'audit');
  const appendAudit = (entry: Record<string, unknown>) => {
    fs.promises.mkdir(auditDir, { recursive: true })
      .then(() => fs.promises.appendFile(path.join(auditDir, `audit-${String(entry.timestamp).slice(0, 10)}.jsonl`), JSON.stringify(entry) + '\n', 'utf-8'))
      .catch(err => console.error('[AUDIT LOG WRITE ERROR]', err));
  };

  // Bypass Node TLS unauthorized certificate rejection for S/4HANA OData connection
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  const app = express();
  const httpServer = http.createServer(app);
  const PORT = Number(process.env.PORT || 3000);

  // Dynamic Salesforce URL determination
  const salesforceRaw = process.env.SALESFORCE_INSTANCE_URL || 'https://login.salesforce.com';
  let salesforceUrl = salesforceRaw.trim().replace(/\/+$/, '');
  if (salesforceUrl.includes('.lightning.force.com')) {
    salesforceUrl = salesforceUrl.replace('.lightning.force.com', '.my.salesforce.com');
  }

  // Set up reverse proxies for Salesforce and SAP system APIs before any body-parsing middleware
  app.use(
    '/api/salesforce-proxy',
    createProxyMiddleware({
      target: salesforceUrl,
      changeOrigin: true,
      secure: false,
      pathRewrite: { '^/api/salesforce-proxy': '' },
    })
  );

  app.use(
    '/api/sap-s8h-proxy',
    createProxyMiddleware({
      target: 'https://mmc-s4sap11.mmc.1stbasis.com:44300',
      changeOrigin: true,
      secure: false,
      pathRewrite: { '^/api/sap-s8h-proxy': '' },
    })
  );

  // SAP ECC (Instance 85 on s1.myerplabs.com) reverse proxy with AI_AGENT RFC credentials
  const eccHost = process.env.SAP_ECC_HOST || 's1.myerplabs.com';
  const eccPort = process.env.SAP_ECC_PORT || '8085';
  const eccUser = process.env.SAP_ECC_USER || 'AI_AGENT';
  const eccPwd = process.env.SAP_ECC_PASSWORD || '';
  const eccBasicAuth = 'Basic ' + Buffer.from(`${eccUser}:${eccPwd}`).toString('base64');

  app.use(
    '/api/sap-ecc-proxy',
    createProxyMiddleware({
      target: `http://${eccHost}:${eccPort}`,
      changeOrigin: true,
      secure: false,
      headers: {
        'Authorization': eccBasicAuth
      },
      pathRewrite: { '^/api/sap-ecc-proxy': '' },
    })
  );

  // Parse incoming JSON body payloads with safety limits for base64 screenshots and documents
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Handle payload too large errors gracefully from body-parser
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err && (err.status === 413 || err.type === 'entity.too.large')) {
      return res.status(413).json({ error: "Payload too large." });
    }
    next(err);
  });

  // Full-stack secure Gemini API route
  app.post("/api/gemini/query", async (req, res) => {
    const { query, userRole, history, images, backendTarget } = req.body;

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    const startedAt = Date.now();

    try {
      const response = await processSapQuery(
        query,
        userRole,
        history,
        (name, action) => {
          res.write(JSON.stringify({ type: 'agent_update', name, action }) + '\n');
        },
        images,
        backendTarget
      );

      // Final pipeline stage: Audit Log — record the completed query/response cycle
      const auditEntry = {
        timestamp: new Date().toISOString(),
        userRole,
        backendTarget,
        query: typeof query === 'string' ? query.slice(0, 300) : '',
        toolCount: Array.isArray(response.toolResults) ? response.toolResults.length : 0
      };
      console.log('[AUDIT LOG]', JSON.stringify(auditEntry));
      let provenance = null;
      try {
        provenance = buildAnswerProvenance(typeof query === 'string' ? query : '', response, Date.now() - startedAt, isSimulatedTool);
      } catch (provErr) {
        console.error('[ANSWER PROVENANCE ERROR]', provErr);
      }
      appendAudit({
        ...auditEntry,
        status: 'answered',
        durationMs: Date.now() - startedAt,
        answerKind: provenance?.kind,
        channel: provenance?.channel,
        records: provenance?.records,
        tools: Array.isArray(response.toolResults) ? [...new Set(response.toolResults.map((r: any) => r?.toolName).filter(Boolean))] : []
      });
      res.write(JSON.stringify({
        type: 'agent_update',
        name: 'Audit Log',
        action: `Recorded audit trail entry for this query/response cycle (role: ${userRole}, backend: ${backendTarget}, tool results: ${auditEntry.toolCount}).`
      }) + '\n');

      res.write(JSON.stringify({ 
        type: 'result', 
        text: response.text, 
        toolResults: response.toolResults,
        provenance
      }) + '\n');
      res.end();
    } catch (error) {
      console.error("Backend error in processSapQuery routing:", error);
      appendAudit({
        timestamp: new Date().toISOString(),
        userRole,
        backendTarget,
        query: typeof query === 'string' ? query.slice(0, 300) : '',
        status: 'failed',
        durationMs: Date.now() - startedAt,
        error: String((error as any)?.message || error).slice(0, 300)
      });
      res.write(JSON.stringify({
        type: 'result',
        text: "I encountered an error connecting to the SAP Core Gateway. Please verify the environment credentials.",
        toolResults: []
      }) + '\n');
      res.end();
    }
  });

  // Recent audit trail entries (newest first) for administrators.
  app.get("/api/audit/recent", async (req, res) => {
    if (req.get('x-user-role') !== 'Administrator') return res.status(403).json({ error: 'Administrator role required.' });
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 500);
    try {
      const files = (await fs.promises.readdir(auditDir).catch(() => [] as string[])).filter(f => /^audit-\d{4}-\d{2}-\d{2}\.jsonl$/.test(f)).sort().reverse();
      const entries: unknown[] = [];
      for (const f of files) {
        const lines = (await fs.promises.readFile(path.join(auditDir, f), 'utf-8')).split('\n').filter(Boolean).reverse();
        for (const line of lines) {
          try { entries.push(JSON.parse(line)); } catch { /* skip malformed line */ }
          if (entries.length >= limit) break;
        }
        if (entries.length >= limit) break;
      }
      res.json({ entries });
    } catch (err) {
      res.status(500).json({ error: 'Audit trail could not be read.' });
    }
  });

  // IDocs API routes to synchronize IDoc state between backend and frontend
  app.get("/api/idocs/state", (req, res) => {
    res.json(idocService.getState());
  });

  app.post("/api/idocs/update-status", async (req, res) => {
    const { idocId, newStatus } = req.body;
    const result = await idocService.updateIdocStatus(idocId, newStatus);
    res.json(result);
  });

  app.post("/api/idocs/update-field-data", async (req, res) => {
    const { idocId, segmentName, fieldsToUpdate, newStatus } = req.body;
    const result = await idocService.updateIdocFieldData(idocId, segmentName, fieldsToUpdate, newStatus);
    res.json(result);
  });

  app.post("/api/idocs/reprocess", async (req, res) => {
    const { idocId, currentUserEmail } = req.body;
    const result = await idocService.reprocessIdoc(idocId, currentUserEmail);
    res.json(result);
  });

  app.post("/api/idocs/create-rfc", (req, res) => {
    const { name } = req.body;
    idocService.createRfcDestination(name);
    res.json({ success: true });
  });

  app.post("/api/idocs/add-spro-mapping", (req, res) => {
    const { glAccount, costCenter } = req.body;
    idocService.addSproMapping(glAccount, costCenter);
    res.json({ success: true });
  });

  app.post("/api/idocs/audit-log", (req, res) => {
    const { log } = req.body;
    idocService.addAuditLog(log);
    res.json({ success: true });
  });

  // Cross-module live update agent — human approval decision on a proposed field change (audited).
  app.post("/api/live-update/decide", async (req, res) => {
    const { proposalId, decision } = req.body;
    const { decideLiveUpdateProposal } = await import("./services/liveUpdateService");
    const result = await decideLiveUpdateProposal(String(proposalId || ''), decision === 'approve' ? 'approve' : 'reject');
    appendAudit({ timestamp: new Date().toISOString(), event: 'live_update_decision', proposalId, decision, success: result.success, message: result.message.slice(0, 400) });
    res.json(result);
  });

  // SD Autonomous Actions — human approval decision on a live S/4HANA write proposal
  app.post("/api/sd-action/decide", async (req, res) => {
    const { proposalId, decision } = req.body;
    const { decideSdActionProposal } = await import("./services/sdAutonomousActionsService");
    const result = await decideSdActionProposal(proposalId, decision);
    res.json(result);
  });

  // VA01 Create Standard Order screen: live value helps, master-data checks and the live create (audited).
  app.get("/api/s4/va01/value-help", async (_req, res) => {
    try {
      const { getVa01ValueHelps } = await import("./services/va01Service");
      res.json({ success: true, ...(await getVa01ValueHelps()) });
    } catch (e: any) {
      res.json({ success: false, message: e?.message || String(e) });
    }
  });
  app.post("/api/s4/va01/check", async (req, res) => {
    try {
      const { kind, id, salesOrg, distChannel, division } = req.body || {};
      const { checkVa01Entity } = await import("./services/va01Service");
      res.json(await checkVa01Entity(String(kind || ''), String(id || ''), salesOrg, distChannel, division));
    } catch (e: any) {
      res.json({ found: false, message: e?.message || String(e) });
    }
  });
  app.post("/api/s4/va01/create", async (req, res) => {
    try {
      const { createVa01SalesOrder } = await import("./services/va01Service");
      const result = await createVa01SalesOrder(req.body || {});
      appendAudit({ timestamp: new Date().toISOString(), event: 'va01_create_sales_order', success: result.success, salesOrder: (result as any).salesOrder || null, soldTo: req.body?.soldTo, message: String(result.message || '').slice(0, 400) });
      res.json(result);
    } catch (e: any) {
      res.json({ success: false, message: e?.message || String(e) });
    }
  });

  // FICO Autonomous Actions — human approval decision on a live S/4HANA write proposal
  app.post("/api/fico-action/decide", async (req, res) => {
    const { proposalId, decision } = req.body;
    const { decideFicoActionProposal } = await import("./services/ficoAutonomousActionsService");
    const result = await decideFicoActionProposal(proposalId, decision);
    res.json(result);
  });

  // EWM/WM Autonomous Actions — human approval decision on a live embedded EWM write proposal
  app.post("/api/ewm-action/decide", async (req, res) => {
    const { proposalId, decision } = req.body;
    const { decideEwmActionProposal } = await import("./services/ewmAutonomousActionsService");
    const result = await decideEwmActionProposal(proposalId, decision);
    res.json(result);
  });

  // SAP TM Autonomous Actions — human approval decision on a live embedded TM write proposal
  app.post("/api/tm-action/decide", async (req, res) => {
    const { proposalId, decision } = req.body;
    const { decideTmActionProposal } = await import("./services/tmAutonomousActionsService");
    const result = await decideTmActionProposal(proposalId, decision);
    res.json(result);
  });

  // SAP PP Autonomous Actions — human approval decision on a live S/4HANA write proposal
  app.post("/api/pp-action/decide", async (req, res) => {
    const { proposalId, decision } = req.body;
    const { decidePpActionProposal } = await import("./services/ppAutonomousActionsService");
    const result = await decidePpActionProposal(proposalId, decision);
    res.json(result);
  });

  // SAP MM Autonomous Actions — human approval decision on a live S/4HANA write proposal
  app.post("/api/mm-action/decide", async (req, res) => {
    const { proposalId, decision } = req.body;
    const { decideMmActionProposal } = await import("./services/mmAutonomousActionsService");
    const result = await decideMmActionProposal(proposalId, decision);
    res.json(result);
  });

  // SAP QM Autonomous Actions — human approval decision on a live S/4HANA write proposal
  app.post("/api/qm-action/decide", async (req, res) => {
    const { proposalId, decision } = req.body;
    const { decideQmActionProposal } = await import("./services/qmAutonomousActionsService");
    const result = await decideQmActionProposal(proposalId, decision);
    res.json(result);
  });

  // SAP HR Autonomous Actions — human approval decision on a live S/4HANA write proposal
  app.post("/api/hr-action/decide", async (req, res) => {
    const { proposalId, decision } = req.body;
    const { decideHrActionProposal } = await import("./services/hrAutonomousActionsService");
    const result = await decideHrActionProposal(proposalId, decision);
    res.json(result);
  });

  // SAP ECC AI Agent API routes
  app.get("/api/ecc/status", (req, res) => {
    const status = eccService.getSystemStatus();
    res.json(status);
  });

  app.get("/api/ecc/ping", async (req, res) => {
    const result = await eccService.verifyLiveConnection();
    res.json(result);
  });

  // Real live S/4HANA (S8H) Gateway reachability check — credentials stay server-side only,
  // never sent to the browser (rules.md: no live credential exposure to the client bundle).
  app.get("/api/s8h/ping", async (req, res) => {
    const start = Date.now();
    try {
      const username = process.env.SAP_S8H_USER || 'STUDENT069';
      const password = process.env.SAP_S8H_PWD || '';
      const authHeader = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');
      const response = await fetch('https://mmc-s4sap11.mmc.1stbasis.com:44300/sap/opu/odata/IWFND/CATALOGSERVICE;v=2/ServiceCollection?$top=1&$format=json&sap-client=100', {
        method: 'GET',
        headers: { 'Authorization': authHeader, 'Accept': 'application/json' }
      });
      const latencyMs = Date.now() - start;
      res.json({ success: response.ok, status: response.status, latencyMs, message: response.ok ? `Live connection to SAP S/4HANA (S8H, Client 100) verified in ${latencyMs}ms.` : `Live probe returned HTTP ${response.status} \u2014 connection not verified.` });
    } catch (err: any) {
      res.json({ success: false, status: 0, latencyMs: Date.now() - start, message: `Live probe failed: ${err?.message || String(err)}.` });
    }
  });

  app.get("/api/ecc/report", (req, res) => {
    const report = eccService.getAutonomousReport();
    res.json(report);
  });

  app.get("/api/ecc/transactions", (req, res) => {
    const module = (req.query.module as string) || 'ALL';
    const txs = eccService.getTransactions(module);
    res.json(txs);
  });

  app.get("/api/ecc/tcode-url", (req, res) => {
    const tcode = (req.query.tcode as string) || 'VA03';
    const client = (req.query.client as string) || '800';
    const url = eccService.generateTcodeUrl(tcode, client);
    res.json({ tcode, client, url });
  });

  // SAP ECC SD (Sales & Distribution) Specialized API Routes
  app.get("/api/ecc/sd/dashboard-report", (req, res) => {
    const report = eccService.getSdAgentDashboardReport();
    res.json(report);
  });

  app.get("/api/ecc/sd/sales-orders", (req, res) => {
    const customer = req.query.customer as string;
    const salesOrg = req.query.salesOrg as string;
    const docType = req.query.docType as string;
    const status = req.query.status as string;
    const search = req.query.search as string;
    const orders = eccService.getSalesOrders({ customer, salesOrg, docType, status, search });
    res.json(orders);
  });

  app.get("/api/ecc/sd/sales-order/:orderId", (req, res) => {
    const order = eccService.getSalesOrderDetail(req.params.orderId);
    if (!order) {
      return res.status(404).json({ error: `Sales Order ${req.params.orderId} not found in SAP ECC Client 800` });
    }
    res.json(order);
  });

  app.get("/api/ecc/sd/deliveries", (req, res) => {
    const shippingPoint = req.query.shippingPoint as string;
    const customer = req.query.customer as string;
    const status = req.query.status as string;
    const deliveries = eccService.getDeliveries({ shippingPoint, customer, status });
    res.json(deliveries);
  });

  app.get("/api/ecc/sd/delivery/:deliveryNo", (req, res) => {
    const delivery = eccService.getDeliveryDetail(req.params.deliveryNo);
    if (!delivery) {
      return res.status(404).json({ error: `Outbound Delivery ${req.params.deliveryNo} not found in SAP ECC Client 800` });
    }
    res.json(delivery);
  });

  app.get("/api/ecc/sd/billing-docs", (req, res) => {
    const payer = req.query.payer as string;
    const status = req.query.status as string;
    const billingDocs = eccService.getBillingDocuments({ payer, status });
    res.json(billingDocs);
  });

  app.get("/api/ecc/sd/billing-doc/:docNo", (req, res) => {
    const doc = eccService.getBillingDocumentDetail(req.params.docNo);
    if (!doc) {
      return res.status(404).json({ error: `Billing Document ${req.params.docNo} not found in SAP ECC Client 800` });
    }
    res.json(doc);
  });

  app.get("/api/ecc/sd/customer/:customerNo", (req, res) => {
    const customer = eccService.getCustomerMaster(req.params.customerNo);
    if (!customer) {
      return res.status(404).json({ error: `Customer ${req.params.customerNo} not found in SAP ECC Client 800` });
    }
    res.json(customer);
  });

  app.get("/api/ecc/sd/customers", (req, res) => {
    const search = req.query.search as string;
    const customers = eccService.getCustomersList(search);
    res.json(customers);
  });

  app.get("/api/ecc/sd/atp-check", (req, res) => {
    const material = (req.query.material as string) || 'DPC-100';
    const plant = (req.query.plant as string) || '1000';
    const qty = req.query.qty ? parseFloat(req.query.qty as string) : 10;
    const date = req.query.date as string;
    const atpResult = eccService.checkAtpAvailability(material, plant, qty, date);
    res.json(atpResult);
  });

  app.get("/api/ecc/sd/document-flow/:docNo", (req, res) => {
    const flow = eccService.getDocumentFlow(req.params.docNo);
    res.json(flow);
  });

  app.get("/api/ecc/sd/customizing-audit", (req, res) => {
    const topic = req.query.topic as string;
    const config = eccService.getSdCustomizing(topic);
    res.json(config);
  });

  app.get("/api/ecc/sd/otc-360/:orderId", (req, res) => {
    const otc = eccService.getOtc360View(req.params.orderId);
    res.json(otc);
  });

  app.get("/api/ecc/sd/customer-360/:customerNo", (req, res) => {
    const c360 = eccService.getCustomer360View(req.params.customerNo);
    res.json(c360);
  });

  app.get("/api/ecc/sd/analytics", (req, res) => {
    const timeframe = req.query.timeframe as string;
    const salesOrg = req.query.salesOrg as string;
    const analytics = eccService.getSdAnalytics({ timeframe, salesOrg });
    res.json(analytics);
  });

  app.get("/api/ecc/sd/returns", (req, res) => {
    const customerNo = req.query.customerNo as string;
    const status = req.query.status as string;
    const returns = eccService.queryReturnOrders({ customerNo, status });
    res.json(returns);
  });

  app.post("/api/ecc/sd/action/propose", (req, res) => {
    const proposal = eccService.proposeSdAction(req.body);
    res.json(proposal);
  });

  app.post("/api/ecc/sd/action/execute", (req, res) => {
    const { proposalId, approvalToken } = req.body;
    try {
      const result = eccService.executeSdAction(proposalId, approvalToken);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.get("/api/ecc/sd/explain-delay/:orderId", (req, res) => {
    const explanation = eccService.explainOrderBlockOrDelay(req.params.orderId);
    res.json(explanation);
  });

  app.get("/api/ecc/sd/explain-pricing/:orderId", (req, res) => {
    const itemNo = req.query.itemNo ? parseInt(req.query.itemNo as string, 10) : undefined;
    const pricing = eccService.explainPricingConditions(req.params.orderId, itemNo);
    res.json(pricing);
  });

  // =========================================================================
  // SAP ECC 6.0 Autonomous Metadata-Driven Agentic Engine API Routes
  // =========================================================================

  // Step 1: Dynamic Discovery (The Explorer) - DD02T, DD03L, TFDIR
  app.all("/api/ecc/agent/discover-metadata", (req, res) => {
    const query = (req.method === 'POST' ? req.body.query : req.query.query) || '';
    const module = (req.method === 'POST' ? req.body.module : req.query.module) as string;
    const objectType = (req.method === 'POST' ? req.body.objectType : req.query.objectType) || 'ALL';
    const result = eccService.discoverMetadata(query, module, objectType);
    res.json(result);
  });

  // Step 1: BAPI Schema Inspector (The Inspector) - FUPARAREF, DESO
  app.all("/api/ecc/agent/bapi-schema", (req, res) => {
    const bapiName = (req.method === 'POST' ? req.body.bapiName : req.query.bapiName) || 'BAPI_SALESORDER_CREATEFROMDAT2';
    const result = eccService.getBapiSchema(bapiName);
    res.json(result);
  });

  // Step 1 & 2: Universal Table Reader (RFC_READ_TABLE with Safety Interceptor)
  app.post("/api/ecc/agent/read-table", (req, res) => {
    const { tableName, fields, options, rowCount, rowSkip } = req.body;
    try {
      const result = eccService.readTable(tableName, fields, options, rowCount, rowSkip);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Step 2: Transactional BAPI Executor (State Manager with COMMIT/ROLLBACK)
  app.post("/api/ecc/agent/execute-bapi", (req, res) => {
    const { bapiName, importParams, tableParams, autoCommit } = req.body;
    try {
      const result = eccService.executeBapi(bapiName, importParams, tableParams, autoCommit !== false);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Step 3: ABAP Engine - Read Program / User Exit Source (RPY_PROGRAM_READ)
  app.all("/api/ecc/agent/read-abap-code", (req, res) => {
    const programName = (req.method === 'POST' ? req.body.programName : req.query.programName) || 'MV45AFZZ';
    const includeName = (req.method === 'POST' ? req.body.includeName : req.query.includeName) as string;
    const result = eccService.readAbapCode(programName, includeName);
    res.json(result);
  });

  // Step 3: ABAP Engine - Write & Activate ABAP Code (TR_FOREIGN_LOCK -> RPY_PROGRAM_UPDATE -> RS_WORKING_OBJECTS_ACTIVATE)
  app.post("/api/ecc/agent/write-abap-code", (req, res) => {
    const { programName, sourceCode, transportRequest, autoActivate } = req.body;
    try {
      const result = eccService.writeAbapCode(programName, sourceCode, transportRequest, autoActivate !== false);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Serve the frontend application
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: false
      },
      appType: "spa",
    });
    app.use(vite.middlewares);

    app.use('*all', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        if (vite && vite.ssrFixStacktrace) {
          vite.ssrFixStacktrace(e);
        }
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT} with S/4HANA OData & Salesforce Proxies active.`);
  });
}

startServer();
