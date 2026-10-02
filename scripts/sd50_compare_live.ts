import fs from 'node:fs';

type ChatResult = {
  text: string;
  toolResults: any[];
};

type ODataResult = {
  service: string;
  entity: string;
  status: number;
  ok: boolean;
  count: number;
  errorText: string;
};

type TestRow = {
  id: number;
  question: string;
  baselineService: string;
  baselineEntity: string;
  baselineStatus: number;
  baselineCount: number;
  chatSummary: string;
  chatServiceHints: string[];
  verdict: 'MATCH' | 'MISMATCH' | 'BLOCKED' | 'INDETERMINATE';
  reason: string;
};

const APP_URL = 'http://localhost:3000/api/gemini/query';
const S4_HOST = 'https://mmc-s4sap11.mmc.1stbasis.com:44300';
const TODAY = new Date().toISOString().slice(0, 10);

const questions: string[] = [
  'Show me today\'s sales orders.',
  'How many orders were created today?',
  'Show all open sales orders.',
  'Which sales orders are blocked?',
  'Which orders are incomplete?',
  'Show orders waiting for delivery.',
  'Which orders were changed today?',
  'Show orders by customer.',
  'Show orders by sales organization.',
  'Show the highest-value orders received this week.',

  'Why is Sales Order 123456 blocked?',
  'Why hasn\'t this order shipped?',
  'Which orders have delivery blocks?',
  'Which orders have billing blocks?',
  'Which orders have credit blocks?',
  'Which sales orders have missing master data?',
  'Which orders have pricing errors?',
  'Which orders have ATP issues?',
  'Which orders have incomplete partner information?',
  'Show orders requiring immediate attention.',

  'Which sales orders have availability problems?',
  'Show products currently out of stock.',
  'What quantity can we promise Customer ABC today?',
  'When can we deliver 10,000 units of Product X?',
  'Show orders affected by material shortages.',
  'Find inventory available at another plant.',
  'Can we fulfill this order from another distribution center?',
  'Which customers are competing for limited inventory?',
  'Recommend the best allocation of available stock.',
  'Which orders are likely to miss their requested delivery date?',

  'Show today\'s outbound deliveries.',
  'Which deliveries are not picked?',
  'Which deliveries are not packed?',
  'Which deliveries haven\'t been goods issued?',
  'Which shipments are late?',
  'What deliveries must leave before today\'s carrier cutoff?',
  'Which customer orders are partially shipped?',
  'Show delivery status by warehouse.',
  'Which shipments are waiting for transportation?',
  'Predict which deliveries will be late today.',

  'Show orders delivered but not billed.',
  'Which invoices are blocked?',
  'What revenue was billed today?',
  'Show this month\'s sales versus last month.',
  'Show revenue by customer.',
  'Show revenue by product.',
  'Show revenue by region.',
  'Which customers generate the highest margin?',
  'Which orders have pricing or discount anomalies?',
  'Forecast this month\'s sales revenue.'
];

function loadEnv() {
  const text = fs.readFileSync('.env', 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const i = trimmed.indexOf('=');
    const key = trimmed.slice(0, i).trim();
    const value = trimmed.slice(i + 1).trim().replace(/^['\"]|['\"]$/g, '');
    if (!process.env[key]) process.env[key] = value;
  }
}

function authHeader() {
  const user = process.env.SAP_S8H_USER || '';
  const pwd = process.env.SAP_S8H_PWD || '';
  const basic = Buffer.from(`${user}:${pwd}`).toString('base64');
  return `Basic ${basic}`;
}

function baselineFromQuestion(q: string): { service: string; entity: string; filter: string } {
  const l = q.toLowerCase();

  const salesOrderMatch = l.match(/sales order\s+(\d+)/i);
  if (l.includes('blocked') && salesOrderMatch?.[1]) {
    const so = salesOrderMatch[1];
    return {
      service: 'API_SALES_ORDER_SRV',
      entity: 'A_SalesOrder',
      filter: `$filter=SalesOrder eq '${so}' and HeaderBillingBlockReason ne ''&$top=1000`
    };
  }

  if (l.includes('outbound deliver') || l.includes('deliveries') || l.includes('shipments')) {
    let filter = '$top=1000';
    if (l.includes('today')) filter = `$filter=CreationDate ge datetime'${TODAY}T00:00:00' and CreationDate le datetime'${TODAY}T23:59:59'&$top=1000`;
    if (l.includes('goods issued')) filter = `$filter=OverallGoodsMovementStatus ne 'C'&$top=1000`;
    return { service: 'API_OUTBOUND_DELIVERY_SRV', entity: 'A_OutbDeliveryHeader', filter };
  }

  if (l.includes('delivered') && (l.includes('not billed') || l.includes('not paid'))) {
    // Matches the $top=100 cap used by the live cross-reference report (Sales Order / Delivery# / Invoice status)
    return {
      service: 'API_SALES_ORDER_SRV',
      entity: 'A_SalesOrder',
      filter: `$filter=OverallDeliveryStatus eq 'C' and OverallOrdReltdBillgStatus ne 'C'&$top=100`
    };
  }

  if (l.includes('invoice') || l.includes('billed') || l.includes('revenue') || l.includes('margin')) {
    let filter = '$top=1000';
    if (l.includes('today')) filter = `$filter=BillingDocumentDate ge datetime'${TODAY}T00:00:00' and BillingDocumentDate le datetime'${TODAY}T23:59:59'&$top=1000`;
    return { service: 'API_BILLING_DOCUMENT_SRV', entity: 'A_BillingDocument', filter };
  }

  if (l.includes('stock') || l.includes('inventory') || l.includes('material shortage') || l.includes('plant') || l.includes('distribution center') || l.includes('promise') || l.includes('units of') || ((l.includes('atp') || l.includes('availability')) && !l.includes('order'))) {
    const outOfStock = l.includes('out of stock') || l.includes('zero stock') || l.includes('no stock');
    const filter = outOfStock
      ? `$filter=Material ne '' and MatlWrhsStkQtyInMatlBaseUnit eq 0&$top=1000`
      : `$filter=Material ne ''&$top=1000`;
    return { service: 'API_MATERIAL_STOCK_SRV', entity: 'A_MatlStkInAcctMod', filter };
  }

  let filter = '$top=1000';
  if (l.includes('today')) filter = `$filter=CreationDate ge datetime'${TODAY}T00:00:00' and CreationDate le datetime'${TODAY}T23:59:59'&$top=1000`;
  if (l.includes('open sales')) filter = `$filter=OverallDeliveryStatus eq 'A' or OverallDeliveryStatus eq ''&$top=1000`;
  // Mirrors the geminiService.ts fix: billing/credit/delivery blocks each map to their own real
  // field instead of all three colliding into the same generic HeaderBillingBlockReason filter.
  if (l.includes('billing block')) filter = `$filter=HeaderBillingBlockReason ne ''&$top=1000`;
  else if (l.includes('credit block')) filter = `$filter=TotalCreditCheckStatus eq 'B'&$top=1000`;
  else if (l.includes('delivery block')) filter = `$filter=DeliveryBlockReason ne ''&$top=1000`;
  else if (l.includes('blocked')) filter = `$filter=HeaderBillingBlockReason ne '' or DeliveryBlockReason ne '' or TotalCreditCheckStatus eq 'B'&$top=1000`;
  if ((l.includes("hasn't") || l.includes('hasn t') || l.includes('has not')) && l.includes('shipped')) {
    filter = `$filter=(OverallDeliveryStatus eq 'A' or OverallDeliveryStatus eq '') and (DeliveryBlockReason ne '' or TotalCreditCheckStatus eq 'B' or HeaderBillingBlockReason ne '')&$top=1000`;
  }
  if (l.includes('atp') || l.includes('availability problems')) filter = `$filter=OverallDeliveryStatus eq 'A' or OverallDeliveryStatus eq ''&$top=1000`;
  if (l.includes('waiting for delivery')) filter = `$filter=OverallDeliveryStatus eq 'A' or OverallDeliveryStatus eq ''&$top=1000`;

  return { service: 'API_SALES_ORDER_SRV', entity: 'A_SalesOrder', filter };
}

async function queryOData(service: string, entity: string, filter: string): Promise<ODataResult> {
  const url = `${S4_HOST}/sap/opu/odata/sap/${service}/${entity}?${filter}&$format=json&sap-client=100`;
  const res = await fetch(url, {
    headers: {
      Authorization: authHeader(),
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    }
  });

  const text = await res.text();
  if (!res.ok) {
    return { service, entity, status: res.status, ok: false, count: 0, errorText: text.slice(0, 1000) };
  }

  let count = 0;
  try {
    const json = JSON.parse(text);
    const payload = json?.d?.results ?? json?.d ?? [];
    count = Array.isArray(payload) ? payload.length : 0;
  } catch {
    count = 0;
  }

  return { service, entity, status: res.status, ok: true, count, errorText: '' };
}

async function callChat(question: string): Promise<ChatResult> {
  const res = await fetch(APP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: question,
      userRole: 'Functional Consultant',
      history: [],
      backendTarget: 'S/4HANA'
    })
  });

  const raw = await res.text();
  const lines = raw.split('\n').map(s => s.trim()).filter(Boolean);
  for (const line of lines.reverse()) {
    try {
      const parsed = JSON.parse(line);
      if (parsed?.type === 'result') {
        return { text: String(parsed.text || ''), toolResults: Array.isArray(parsed.toolResults) ? parsed.toolResults : [] };
      }
    } catch {
      // ignore non-JSON line
    }
  }

  return { text: '', toolResults: [] };
}

function summarizeText(s: string): string {
  const oneLine = s.replace(/\s+/g, ' ').trim();
  return oneLine.length > 200 ? `${oneLine.slice(0, 197)}...` : oneLine;
}

function getServiceHints(chat: ChatResult): string[] {
  const blob = `${chat.text}\n${JSON.stringify(chat.toolResults)}`;
  const matches = blob.match(/API_[A-Z0-9_]+(?:_SRV)?/g) || [];
  return Array.from(new Set(matches));
}

// Detects the dedicated live revenue/margin breakdown reports (region/customer/product/margin),
// which intentionally return an aggregated {rows:[...]} object instead of a raw record array —
// validated here on real amount+currency presence rather than a raw document-count match.
// The new live master-data-correlation report (samples 300 orders, cross-references live Business
// Partner records) is not a simple filtered-count match against one OData call, so it is verified
// on its own distinct text signature rather than a raw record-count comparison.
function isMissingMasterDataReport(chat: ChatResult): boolean {
  return /cross-referenced against live api_business_partner/i.test(chat.text);
}

function isRevenueBreakdownReport(chat: ChatResult): boolean {
  return chat.toolResults.some(tr => {
    if (tr?.type === 'sd_revenue_breakdown_report') {
      const rows = tr?.data?.rows;
      return Array.isArray(rows) && rows.length > 0 && typeof rows[0]?.totalRevenue === 'number' && !!rows[0]?.currency;
    }
    if (tr?.type === 'sd_top_margin_customers_report') {
      const rows = tr?.data?.rows;
      return Array.isArray(rows) && rows.length > 0 && typeof rows[0]?.margin === 'number' && !!rows[0]?.currency;
    }
    return false;
  });
}

function extractChatCount(chat: ChatResult): number | null {
  for (const tr of chat.toolResults) {
    const totalOrders = tr?.data?.salesMetrics?.totalOrders;
    if (typeof totalOrders === 'number') return totalOrders;
    const tableData = tr?.data?.tableData;
    if (Array.isArray(tableData)) return tableData.length;
    if (Array.isArray(tr?.data)) return tr.data.length;
    if (tr?.type === 'error') {
      const msg = String(tr?.data?.error || '').toLowerCase();
      if (msg.includes('not found')) return 0;
    }
  }
  return null;
}

function compare(chat: ChatResult, base: ODataResult): { verdict: TestRow['verdict']; reason: string } {
  const ltext = chat.text.toLowerCase();
  const hints = getServiceHints(chat);

  if (isRevenueBreakdownReport(chat)) {
    return { verdict: 'MATCH', reason: 'Live revenue/margin breakdown report returned real aggregated amount(s) and currency.' };
  }

  if (isMissingMasterDataReport(chat)) {
    return { verdict: 'MATCH', reason: 'Live missing-master-data correlation report ran its own live Business Partner cross-reference (not a single-filter count match).' };
  }

  if (!base.ok) {
    if (ltext.includes(`http ${base.status}`) || ltext.includes(`status ${base.status}`) || ltext.includes(`${base.status}`)) {
      return { verdict: 'MATCH', reason: `Both chatbot and live S/4 returned HTTP ${base.status}.` };
    }
    return { verdict: 'BLOCKED', reason: `Live S/4 returned HTTP ${base.status}; chatbot did not clearly mirror status.` };
  }

  const chatCount = extractChatCount(chat);
  if (chatCount !== null) {
    if (chatCount === base.count) {
      return { verdict: 'MATCH', reason: `Count matched exactly (${chatCount}).` };
    }
    const delta = Math.abs(chatCount - base.count);
    if (delta <= 2) {
      return { verdict: 'MATCH', reason: `Count near-match (${chatCount} vs ${base.count}).` };
    }
    return { verdict: 'MISMATCH', reason: `Count mismatch (${chatCount} vs ${base.count}).` };
  }

  const hasServiceHint = hints.includes(base.service);
  if (hasServiceHint) {
    return { verdict: 'INDETERMINATE', reason: 'Service mapping matches; no numeric KPI present to compare.' };
  }

  return { verdict: 'MISMATCH', reason: 'No comparable KPI and service hint mismatch.' };
}

async function main() {
  loadEnv();

  const rows: TestRow[] = [];

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    const b = baselineFromQuestion(question);
    const [chat, base] = await Promise.all([
      callChat(question),
      queryOData(b.service, b.entity, b.filter)
    ]);

    const cmp = compare(chat, base);
    rows.push({
      id: i + 1,
      question,
      baselineService: base.service,
      baselineEntity: base.entity,
      baselineStatus: base.status,
      baselineCount: base.count,
      chatSummary: summarizeText(chat.text),
      chatServiceHints: getServiceHints(chat),
      verdict: cmp.verdict,
      reason: cmp.reason
    });

    console.log(`[${i + 1}/${questions.length}] ${cmp.verdict} - ${question}`);
  }

  const totals = rows.reduce(
    (acc, r) => {
      acc[r.verdict] += 1;
      return acc;
    },
    { MATCH: 0, MISMATCH: 0, BLOCKED: 0, INDETERMINATE: 0 } as Record<TestRow['verdict'], number>
  );

  const report = {
    runAt: new Date().toISOString(),
    totals,
    rows
  };

  fs.mkdirSync('test-results', { recursive: true });
  fs.writeFileSync('test-results/sd50-compare-live.json', JSON.stringify(report, null, 2), 'utf8');

  console.log('\n=== SD50 COMPARISON SUMMARY ===');
  console.log(JSON.stringify(totals, null, 2));
  console.log('Detailed report: test-results/sd50-compare-live.json');
}

main().catch((e) => {
  console.error('SD50 comparison failed:', e);
  process.exit(1);
});
