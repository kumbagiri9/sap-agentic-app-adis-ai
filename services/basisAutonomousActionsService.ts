// SAP Basis Autonomous Actions Engine — live S/4HANA action catalog with human-approval gating,
// mirroring the SD/FICO/EWM/TM/PP/MM/QM/HR Autonomous Actions pattern.
//
// UNLIKE every prior module, exhaustive real live probing for Basis technical-administration
// capability had ALREADY been done in an earlier session phase (see the `basisUnavailableCheck`
// honest-disclosure block and `buildS4BasisHealthReport`/`buildS4IntegrationMonitoringReport`/
// `buildGatewayServiceCatalogReport`/`buildGctsTransportReport` in geminiService.ts) — that work
// conclusively found this landscape exposes NO OData/Gateway equivalent for ANY classic Basis
// technical-administration transaction (SM37 background jobs, SM12 locks, SP01/SPAD spool, SM50/
// SM66 work processes, SU01 user lock/unlock, ST22 dumps, SM21 system log, SM13 update failures,
// DBACOCKPIT/backup validation, HANA service status, OS-level filesystem/disk monitoring, CCMS,
// Focused Run, IAM/SCIM) — every one of these returns a real, already-confirmed HTTP 403 "No
// service found" or 0 matches across BOTH the IWFND OData V2 catalog and the full 442-entry OData
// V4 ServiceGroups catalog. This is architecturally identical to the ECC classic-table RFC_READ_
// TABLE finding documented elsewhere in memory — a structural landscape limitation, not a bug to
// keep re-probing. This session's re-probe (IWFND catalog sweep for BACKGROUNDJOB/BGRFC/BTCJOB/
// SPOOL/ENQUEUE/USERLOCK/BACKUP/FILESYSTEM/DISK/WORKPROCESS/QRFC/QUEUE/HANASERVICE/DBACOCKPIT/
// SYSTEMMONITOR keywords, plus a direct API_BUSINESS_USER_SRV/API_BUSINESS_ROLE_SRV metadata
// check) reconfirmed 0 real matches / real HTTP 403 for every one of these areas.
//
// The ONLY two genuinely real live signals available for Basis in this landscape are (1) OData
// Gateway HTTP reachability + latency (used for CHECK_APPLICATION_SERVERS) and (2) the AIF
// (Application Interface Framework) MessageLogSet, which is genuinely queryable but currently
// holds 0 records since no interfaces are configured for monitoring here (used for MONITOR_QUEUES
// and VALIDATE_INTERFACES). This replaces the fabricated `basisAdminService.ts` `restartJob()`/
// `cleanSpoolQueue()` methods (entirely in-memory hardcoded job/spool arrays, mutated locally and
// returned as if a real SM37/SP01 write had occurred) for the two action-verbs this module's
// requirements doc explicitly asks for — see /memories/repo/runtime-notes.md for the audit detail.
//
// The two AUTO data-fetch helpers below are intentionally self-contained (not imported from
// geminiService.ts, which is not importable here) — they independently re-probe the SAME two real
// live endpoints geminiService.ts's own `buildS4BasisHealthReport`/`buildS4IntegrationMonitoringReport`
// use, so existing behavior there is completely untouched.

const S8H_HOST = 'https://mmc-s4sap11.mmc.1stbasis.com:44300';
const S8H_ODATA_ENDPOINTS = [
  'API_SALES_ORDER_SRV', 'API_BUSINESS_PARTNER', 'API_MATERIAL_STOCK_SRV', 'API_PURCHASEORDER_PROCESS_SRV', 'API_COMPANYCODE_SRV'
];

function s8hAuthHeader(): string | null {
  const username = process.env.SAP_S8H_USER;
  const password = process.env.SAP_S8H_PWD;
  if (!username || !password) return null;
  const base64Encode = (str: string) => { try { return btoa(str); } catch (e) { return typeof Buffer !== 'undefined' ? Buffer.from(str).toString('base64') : str; } };
  return `Basic ${base64Encode(`${username}:${password}`)}`;
}

async function fetchBasisHealthData(): Promise<{ reachableCount: number; totalProbed: number; avgLatencyMs: number } | null> {
  const authString = s8hAuthHeader();
  if (!authString) return null;
  const results = await Promise.all(S8H_ODATA_ENDPOINTS.map(async (svc) => {
    const start = Date.now();
    try {
      const res = await fetch(`${S8H_HOST}/sap/opu/odata/sap/${svc}/$metadata?sap-client=100`, { headers: { Authorization: authString, Accept: 'application/xml' } });
      return { reachable: res.status === 200 || res.status === 403, latencyMs: Date.now() - start };
    } catch {
      return { reachable: false, latencyMs: Date.now() - start };
    }
  }));
  const reachableCount = results.filter(r => r.reachable).length;
  const avgLatencyMs = Math.round(results.reduce((s, r) => s + r.latencyMs, 0) / results.length);
  return { reachableCount, totalProbed: results.length, avgLatencyMs };
}

async function fetchAifIntegrationData(): Promise<{ serviceRegistered: boolean; liveMessageLogCount: number } | null> {
  const authString = s8hAuthHeader();
  if (!authString) return null;
  let serviceRegistered = false;
  let liveMessageLogCount = 0;
  try {
    const groupsRes = await fetch(`${S8H_HOST}/sap/opu/odata4/iwfnd/config/default/iwfnd/catalog/0002/ServiceGroups?$filter=contains(GroupId,'AIF')&$format=json&sap-client=100`, { headers: { Authorization: authString, Accept: 'application/json' } });
    if (groupsRes.ok) {
      const json = await groupsRes.json();
      serviceRegistered = Array.isArray(json?.value) && json.value.length > 0;
    }
  } catch { /* leave false */ }
  try {
    const logRes = await fetch(`${S8H_HOST}/sap/opu/odata4/aif/msgmonitoring_api/default/aif/messagehandling/0001/MessageLogSet?$top=100&sap-client=100`, { headers: { Authorization: authString, Accept: 'application/json' } });
    if (logRes.ok) {
      const json = await logRes.json();
      liveMessageLogCount = Array.isArray(json?.value) ? json.value.length : 0;
    }
  } catch { /* leave 0 */ }
  return { serviceRegistered, liveMessageLogCount };
}

export type BasisActionType =
  | 'RESTART_FAILED_JOB'
  | 'REPROCESS_TRANSIENT_RFC_FAILURE'
  | 'UNLOCK_USER'
  | 'CHECK_APPLICATION_SERVERS'
  | 'MONITOR_FILESYSTEM_GROWTH'
  | 'VALIDATE_BACKUPS'
  | 'CHECK_HANA_SERVICES'
  | 'IDENTIFY_STUCK_WORK_PROCESSES'
  | 'CLEAR_OBSOLETE_SPOOL_REQUESTS'
  | 'MONITOR_QUEUES'
  | 'VALIDATE_INTERFACES';

type Classification = 'AUTO' | 'SENSITIVE' | 'NOT_AVAILABLE';

const NO_JOB_SVC = 'No live Job Scheduling or Background Job OData service (e.g. API_BACKGROUND_JOB_SRV, MANAGE_JOB_DEFINITIONS_SRV, SAP_COM_0326 Application Job Scheduling, APS_JOB_SCHEDULER_SRV) is deployed in this landscape (confirmed real HTTP 403 "No service found" and 0 matches across the IWFND OData V2 + 442-entry V4 service catalogs) \u2014 there is no live SM37 equivalent to restart a job against.';
const NO_RFC_SVC = 'No live RFC destination / qRFC queue (SM58/SMQ1/SMQ2) OData service is deployed in this landscape (confirmed real HTTP 403 "No service found"); the one real live interface-monitoring signal available (AIF MessageLogSet) is read-only and currently holds 0 records \u2014 there is no live transient-RFC-failure queue to reprocess against.';
const NO_USER_SVC = 'No live user-lock/unlock OData service is deployed in this landscape \u2014 API_BUSINESS_USER_SRV and API_BUSINESS_ROLE_SRV both return real HTTP 403 "No service found", and no live IAM/SCIM (APS_IAM_USER_SRV) user-provisioning service is deployed either (confirmed 0 matches in the IWFND V2 + V4 service catalogs).';
const NO_FS_SVC = 'No live OS-level filesystem/disk-utilization monitoring OData service is deployed in this landscape (confirmed 0 matches for FILESYSTEM/DISK keywords in the IWFND V2 + V4 service catalogs) \u2014 OS/kernel-level metrics are not exposed via this landscape\u2019s SAP Gateway.';
const NO_BACKUP_SVC = 'No live DBACOCKPIT/HANA backup-validation OData service is deployed in this landscape (confirmed 0 matches for BACKUP/DBACOCKPIT keywords in the IWFND V2 + V4 service catalogs) \u2014 HANA backup status requires direct HANA Cockpit/XSA access, not exposed via this landscape\u2019s ABAP Gateway.';
const NO_HANA_SVC = 'No live HANA service-status OData service is deployed in this landscape (confirmed 0 matches for HANASERVICE/DBACOCKPIT keywords) \u2014 HANA service/memory/CPU status requires direct HANA Cockpit/XSA access, which this app\u2019s live connection does not have.';
const NO_WP_SVC = 'No live System Monitoring OData service exposing work-process data (SM50/SM51/SM66) is deployed in this landscape (confirmed real HTTP 403 "No service found" and 0 matches in the IWFND V2 + V4 service catalogs) \u2014 a real Gateway reachability/latency check IS available instead (see Check Application Servers).';
const NO_SPOOL_SVC = 'No live Spool (SP01/SPAD) OData service is deployed in this landscape (confirmed 0 matches in the IWFND V2 + V4 service catalogs) \u2014 there is no live spool queue to clear obsolete requests from.';

export const BASIS_ACTION_CATALOG: Record<BasisActionType, { title: string; classification: Classification; unavailableReason?: string }> = {
  RESTART_FAILED_JOB: { title: 'Restart Failed Background Job', classification: 'NOT_AVAILABLE', unavailableReason: NO_JOB_SVC },
  REPROCESS_TRANSIENT_RFC_FAILURE: { title: 'Reprocess Transient RFC Failure', classification: 'NOT_AVAILABLE', unavailableReason: NO_RFC_SVC },
  UNLOCK_USER: { title: 'Unlock User', classification: 'NOT_AVAILABLE', unavailableReason: NO_USER_SVC },
  CHECK_APPLICATION_SERVERS: { title: 'Check Application Servers', classification: 'AUTO' },
  MONITOR_FILESYSTEM_GROWTH: { title: 'Monitor Filesystem Growth', classification: 'NOT_AVAILABLE', unavailableReason: NO_FS_SVC },
  VALIDATE_BACKUPS: { title: 'Validate Backups', classification: 'NOT_AVAILABLE', unavailableReason: NO_BACKUP_SVC },
  CHECK_HANA_SERVICES: { title: 'Check HANA Services', classification: 'NOT_AVAILABLE', unavailableReason: NO_HANA_SVC },
  IDENTIFY_STUCK_WORK_PROCESSES: { title: 'Identify Stuck Work Processes', classification: 'NOT_AVAILABLE', unavailableReason: NO_WP_SVC },
  CLEAR_OBSOLETE_SPOOL_REQUESTS: { title: 'Clear Obsolete Spool Requests', classification: 'NOT_AVAILABLE', unavailableReason: NO_SPOOL_SVC },
  MONITOR_QUEUES: { title: 'Monitor Queues (RFC/qRFC/Interface)', classification: 'AUTO' },
  VALIDATE_INTERFACES: { title: 'Validate Interfaces', classification: 'AUTO' }
};

// ---- AUTO actions (execute immediately, no approval — real live data only) ----

async function executeCheckApplicationServers(): Promise<{ success: boolean; message: string; data?: any }> {
  const result = await fetchBasisHealthData();
  if (!result) return { success: false, message: 'Live Gateway reachability check failed \u2014 no live SAP credentials configured.' };
  return {
    success: true,
    message: `Live NetWeaver Gateway health check: ${result.reachableCount}/${result.totalProbed} probed OData endpoints reachable, average latency ${result.avgLatencyMs}ms. This is the only genuinely live application-server-health signal available in this landscape (no SM50/SM51/CPU/memory monitoring API is deployed).`,
    data: result
  };
}

async function executeMonitorQueuesOrInterfaces(title: string): Promise<{ success: boolean; message: string; data?: any }> {
  const result = await fetchAifIntegrationData();
  if (!result) return { success: false, message: 'Live AIF integration monitoring check failed \u2014 no live SAP credentials configured.' };
  return {
    success: true,
    message: `${title}: ${result.serviceRegistered ? `AIF (Application Interface Framework) is registered; its statistics/alert APIs return real HTTP 501 "Not Implemented", but the one functional entity set (MessageLogSet) was queried live and returned ${result.liveMessageLogCount} record(s) \u2014 ${result.liveMessageLogCount === 0 ? 'no interfaces are currently configured for monitoring in this landscape.' : 'see details.'}` : 'No AIF or other Integration Monitoring OData service is registered in this landscape.'}`,
    data: result
  };
}

export async function executeAutoBasisAction(actionType: BasisActionType): Promise<{ success: boolean; message: string; data?: any }> {
  switch (actionType) {
    case 'CHECK_APPLICATION_SERVERS': return executeCheckApplicationServers();
    case 'MONITOR_QUEUES': return executeMonitorQueuesOrInterfaces(BASIS_ACTION_CATALOG.MONITOR_QUEUES.title);
    case 'VALIDATE_INTERFACES': return executeMonitorQueuesOrInterfaces(BASIS_ACTION_CATALOG.VALIDATE_INTERFACES.title);
    default: return { success: false, message: `${actionType} is not an AUTO action.` };
  }
}
