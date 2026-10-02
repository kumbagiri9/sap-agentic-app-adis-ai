// SAP TM Autonomous Actions Engine — live embedded S/4HANA TM write actions with human-approval
// gating, mirroring the SD/FICO/EWM Autonomous Actions pattern. Real exhaustive live probing
// (full IWFND V2+V4 catalog sweep, documented in geminiService.ts's TM section header comment)
// confirmed this landscape has ZERO live Freight Order / Freight Unit / Transportation Order
// document CRUD OData service deployed (API_FREIGHTORDER, API_FREIGHTUNIT, API_TRANSPFREIGHT-
// AGREEMENT, API_TRANSPRATETABLE all 0 catalog matches) and the Freight RFQ/Tendering entity has
// creating operations explicitly disabled (confirmed real HTTP 405). This means the vast
// majority of the requested "Autonomous SAP TM Actions" have NO live backing document object in
// this landscape and are honestly reported NOT_AVAILABLE — never fabricated with a fake document
// ID (the previous implementation in tmService.ts's executeAutonomousTmAction did exactly that,
// with Math.random()-generated Freight Order/Unit/Settlement numbers; this service replaces it).
// The ONE genuinely live-writable TM-adjacent capability confirmed via direct probe is Carrier
// Dock Appointment Scheduling (DAS_CARRIER_ACCESS_SRV/AppointmentSet — real HTTP 400 "Enter a
// docking location or a loading point" on an incomplete test POST, confirming a real, working
// create path once required fields are supplied).

export type TmActionType =
  | 'CREATE_FREIGHT_UNIT'
  | 'CREATE_FREIGHT_ORDER'
  | 'PLAN_TRANSPORTATION'
  | 'ASSIGN_CARRIER'
  | 'TRIGGER_TENDERING'
  | 'RE_TENDER_REJECTED_LOAD'
  | 'CONSOLIDATE_FREIGHT_UNITS'
  | 'SPLIT_SHIPMENT'
  | 'REASSIGN_CARRIER'
  | 'CHANGE_ROUTE'
  | 'UPDATE_TRANSPORTATION_DATES'
  | 'SCHEDULE_PICKUP_APPOINTMENT'
  | 'TRIGGER_DELIVERY_NOTIFICATION'
  | 'CALCULATE_FREIGHT_CHARGES'
  | 'CREATE_SETTLEMENT_DOCUMENT'
  | 'REPROCESS_FAILED_INTERFACES'
  | 'ESCALATE_SHIPMENT_EXCEPTION';

type Classification = 'AUTO' | 'SENSITIVE' | 'NOT_AVAILABLE';

const NO_DOC_REASON = 'No live Freight Order / Freight Unit / Transportation Order document OData service (API_FREIGHTORDER, API_FREIGHTUNIT) is deployed in this landscape — confirmed 0 matches in a full live sweep of both the IWFND OData V2 and V4 service catalogs (direct guessed-name probes also returned real HTTP 403 "No service found"). There is no live document to act on, so this action cannot be executed live.';

export const TM_ACTION_CATALOG: Record<TmActionType, { title: string; classification: Classification; unavailableReason?: string }> = {
  CREATE_FREIGHT_UNIT: { title: 'Create Freight Unit', classification: 'NOT_AVAILABLE', unavailableReason: NO_DOC_REASON },
  CREATE_FREIGHT_ORDER: { title: 'Create Freight Order', classification: 'NOT_AVAILABLE', unavailableReason: NO_DOC_REASON },
  PLAN_TRANSPORTATION: { title: 'Plan Transportation', classification: 'NOT_AVAILABLE', unavailableReason: NO_DOC_REASON },
  ASSIGN_CARRIER: { title: 'Assign Carrier', classification: 'NOT_AVAILABLE', unavailableReason: NO_DOC_REASON },
  TRIGGER_TENDERING: { title: 'Trigger Tendering', classification: 'NOT_AVAILABLE', unavailableReason: `A live POST to UI_COLLABNAPPLFREIGHTRFQ/C_CollabnApplFreightRFQ was confirmed rejected with HTTP 405 "CX_SADL_ENTITY_CUD_DISABLED Creating operations are disabled" — no live tendering-creation path exists in this landscape.` },
  RE_TENDER_REJECTED_LOAD: { title: 'Re-tender Rejected Load', classification: 'NOT_AVAILABLE', unavailableReason: NO_DOC_REASON },
  CONSOLIDATE_FREIGHT_UNITS: { title: 'Consolidate Freight Units', classification: 'NOT_AVAILABLE', unavailableReason: NO_DOC_REASON },
  SPLIT_SHIPMENT: { title: 'Split Shipment', classification: 'NOT_AVAILABLE', unavailableReason: NO_DOC_REASON },
  REASSIGN_CARRIER: { title: 'Reassign Carrier', classification: 'NOT_AVAILABLE', unavailableReason: NO_DOC_REASON },
  CHANGE_ROUTE: { title: 'Change Route', classification: 'NOT_AVAILABLE', unavailableReason: NO_DOC_REASON },
  UPDATE_TRANSPORTATION_DATES: { title: 'Update Transportation Dates', classification: 'NOT_AVAILABLE', unavailableReason: NO_DOC_REASON },
  SCHEDULE_PICKUP_APPOINTMENT: { title: 'Schedule Pickup Appointment', classification: 'SENSITIVE' },
  TRIGGER_DELIVERY_NOTIFICATION: { title: 'Trigger Delivery Notification', classification: 'AUTO' },
  CALCULATE_FREIGHT_CHARGES: { title: 'Calculate Freight Charges', classification: 'NOT_AVAILABLE', unavailableReason: 'No live charge-calculation bound action was found on this landscape\'s real Freight/Transportation Charge Element service (UI_FREIGHTORDER_ACCR/C_FrtOrdAccrChrgElmnt is read-only, sourced from already-settled documents) — ask "show freight charges by type" instead for real historical charge data.' },
  CREATE_SETTLEMENT_DOCUMENT: { title: 'Create Settlement Document', classification: 'NOT_AVAILABLE', unavailableReason: NO_DOC_REASON },
  REPROCESS_FAILED_INTERFACES: { title: 'Reprocess Failed Transportation Interfaces', classification: 'NOT_AVAILABLE', unavailableReason: NO_DOC_REASON },
  ESCALATE_SHIPMENT_EXCEPTION: { title: 'Escalate Shipment Exception', classification: 'AUTO' }
};

export interface TmActionProposal {
  proposalId: string;
  actionType: TmActionType;
  title: string;
  targetId: string;
  currentState: Record<string, any>;
  proposedChange: Record<string, any>;
  createdAt: number;
}

const pendingProposals = new Map<string, TmActionProposal & { execute: () => Promise<any> }>();

function genId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

const DAS_CARRIER_ACCESS_BASE = 'scwm/DAS_CARRIER_ACCESS_SRV';

// DAS_CARRIER_ACCESS_SRV lives under the `/sap/opu/odata/scwm/` namespace (not the `/sap/opu/
// odata/sap/` namespace sapApi.writeS8HOData assumes), so it needs its own CSRF-handshake write
// helper — same proven pattern (GET $metadata with x-csrf-token: fetch, then POST with that
// token + cookies), just with the correct base path.
async function writeDasCarrierAccess(entitySet: string, payload: Record<string, any>): Promise<any> {
  const username = process.env.SAP_S8H_USER;
  const password = process.env.SAP_S8H_PWD;
  if (!username || !password) return { success: false, error: '[LIVE SAP REQUIRED] SAP S/4HANA credentials are not configured.' };
  const base64Encode = (str: string) => { try { return btoa(str); } catch (e) { return typeof Buffer !== 'undefined' ? Buffer.from(str).toString('base64') : str; } };
  const authString = `Basic ${base64Encode(`${username}:${password}`)}`;
  const host = 'https://mmc-s4sap11.mmc.1stbasis.com:44300';
  try {
    const metadataUrl = `${host}/sap/opu/odata/${DAS_CARRIER_ACCESS_BASE}/$metadata?sap-client=100`;
    const headRes = await fetch(metadataUrl, { method: 'GET', headers: { 'Authorization': authString, 'x-csrf-token': 'fetch' } });
    if (!headRes.ok && headRes.status !== 200) return { success: false, error: `Failed to establish CSRF session: HTTP ${headRes.status} ${headRes.statusText}` };
    const csrfToken = headRes.headers.get('x-csrf-token') || '';
    const rawCookies = headRes.headers.getSetCookie ? headRes.headers.getSetCookie() : [headRes.headers.get('set-cookie')];
    const cookieHeader = (rawCookies || []).filter(Boolean).map((c: string) => c.split(';')[0]).join('; ');
    const url = `${host}/sap/opu/odata/${DAS_CARRIER_ACCESS_BASE}/${entitySet}?sap-client=100`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Authorization': authString, 'Content-Type': 'application/json', 'Accept': 'application/json', 'x-csrf-token': csrfToken, 'Cookie': cookieHeader },
      body: JSON.stringify(payload)
    });
    const text = await res.text();
    let data: any = {};
    try { data = text ? JSON.parse(text) : {}; } catch (e) { data = { raw: text }; }
    if (res.ok || res.status === 201 || res.status === 204) return { success: true, status: res.status, data: data.d || data };
    const errMsg = data?.error?.message?.value || data?.error?.message || data?.raw || `HTTP ${res.status} ${res.statusText}`;
    return { success: false, status: res.status, error: errMsg };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

// ---- AUTO actions (execute immediately, no approval — real live check, no live write path) ----

async function executeTriggerDeliveryNotification(): Promise<{ success: boolean; message: string; data?: any }> {
  return {
    success: true,
    message: 'This landscape has no live notification/escalation gateway (email/SMS/carrier-portal push) configured in this integration, so a delivery notification is disclosed here rather than fabricated as sent. No live Delivery/Freight Order document exists to attach a notification event to in any case (see CREATE_FREIGHT_ORDER).',
    data: {}
  };
}

async function executeEscalateShipmentException(): Promise<{ success: boolean; message: string; data?: any }> {
  return {
    success: true,
    message: 'This landscape has no live notification/escalation gateway configured in this integration, so escalation is disclosed here rather than fabricated as sent. Use the live Shipment Late-Delivery Root-Cause Diagnosis (ask "why is Customer X\'s shipment late?") for the real underlying facts to escalate manually.',
    data: {}
  };
}

// ---- SENSITIVE actions (real live OData write, human approval required) ----

async function proposeSchedulePickupAppointment(dockingLocation: string, carrier: string, requestedStartIso: string, requestedFinishIso: string): Promise<TmActionProposal & { execute: () => Promise<any> }> {
  if (!dockingLocation) throw new Error('No docking location or loading point specified for the pickup appointment.');
  const payload: Record<string, any> = {
    Dockloc: dockingLocation,
    Category: '1',
    ...(carrier ? { Carrier: carrier } : {}),
    ...(requestedStartIso ? { ReqStartTime: requestedStartIso } : {}),
    ...(requestedFinishIso ? { ReqFinishTime: requestedFinishIso } : {})
  };
  return {
    proposalId: genId('PROP-TM'),
    actionType: 'SCHEDULE_PICKUP_APPOINTMENT',
    title: TM_ACTION_CATALOG.SCHEDULE_PICKUP_APPOINTMENT.title,
    targetId: `${dockingLocation}${carrier ? `/${carrier}` : ''}`,
    currentState: { note: 'No existing live appointment at this docking location was checked for conflicts — this is a new appointment request.' },
    proposedChange: payload,
    createdAt: Date.now(),
    execute: () => writeDasCarrierAccess('AppointmentSet', payload)
  };
}

// ---- Public dispatch API ----

export async function executeAutoTmAction(actionType: TmActionType): Promise<{ success: boolean; message: string; data?: any }> {
  switch (actionType) {
    case 'TRIGGER_DELIVERY_NOTIFICATION': return executeTriggerDeliveryNotification();
    case 'ESCALATE_SHIPMENT_EXCEPTION': return executeEscalateShipmentException();
    default: return { success: false, message: `${actionType} is not an AUTO action.` };
  }
}

export async function proposeSensitiveTmAction(actionType: TmActionType, params: Record<string, any>): Promise<TmActionProposal> {
  let proposal: TmActionProposal & { execute: () => Promise<any> };
  switch (actionType) {
    case 'SCHEDULE_PICKUP_APPOINTMENT':
      proposal = await proposeSchedulePickupAppointment(params.dockingLocation, params.carrier, params.requestedStartIso, params.requestedFinishIso);
      break;
    default:
      throw new Error(`${actionType} is not a SENSITIVE action.`);
  }
  pendingProposals.set(proposal.proposalId, proposal);
  return proposal;
}

export async function decideTmActionProposal(proposalId: string, decision: 'approve' | 'reject'): Promise<{ success: boolean; message: string; data?: any }> {
  const proposal = pendingProposals.get(proposalId);
  if (!proposal) {
    return { success: false, message: `Proposal ${proposalId} not found or already decided.` };
  }
  pendingProposals.delete(proposalId);

  if (decision === 'reject') {
    return { success: true, message: `Proposal ${proposalId} (${proposal.title} on ${proposal.targetId}) was rejected by human approver. No live change was made.` };
  }

  const result = await proposal.execute();
  if (result?.success === false || result?.error) {
    return { success: false, message: `Live S/4HANA rejected "${proposal.title}" on ${proposal.targetId}: ${result?.error || 'unknown error'}.`, data: result };
  }
  return { success: true, message: `Human-approved "${proposal.title}" on ${proposal.targetId} executed live on embedded S/4HANA TM (Client 100).`, data: result };
}
