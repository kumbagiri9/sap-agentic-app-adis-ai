// PP (Production Planning) Autonomous Actions Engine — live S/4HANA write actions with human-
// approval gating, mirroring the SD/FICO/EWM/TM Autonomous Actions pattern. Real live probing
// (metadata inspection, documented per-action below) confirmed the read-only Manufacturing Order
// object-page service (MPE_PRODORDER_OBJPG_SRV/C_MfgOrderObjPg) this landscape actually uses for
// Production Order data is explicitly sap:creatable="false" sap:updatable="false" with ZERO
// FunctionImports — so Create/Release/Reschedule Production Order and Convert Planned Order are
// all genuinely NOT_AVAILABLE (the dedicated API_PRODUCTION_ORDER_2_SRV service itself returns
// live HTTP 403 — not authorized in this landscape). API_MRP_MATERIALS_SRV_01 also has zero
// FunctionImports, confirming no live MRP-run trigger exists. The ONE genuinely live-writable
// action confirmed via real metadata inspection is Purchase Requisition creation
// (API_PURCHASEREQ_PROCESS_SRV/A_PurchaseRequisitionHeader + A_PurchaseRequisitionItem — only
// sap:deletable="false" is set, so creatable defaults to true per this landscape's established
// OData V2 convention) and Purchase Order / Stock Transfer Order creation
// (API_PURCHASEORDER_PROCESS_SRV/A_PurchaseOrder has no restriction attributes at all, so
// creatable defaults to true) — replacing the previous `ppService.ts` implementation, which
// routed every one of these actions through `sapEccTransactionEngine.executeBapi` (a documented
// ECC BAPI SIMULATOR, not a live S/4 write — see /memories/repo notes on eccTransactionEngine.ts)
// and fabricated a random fallback document number whenever that simulator didn't return one.
import { sapApi } from './sapService';

export type PpActionType =
  | 'CREATE_PRODUCTION_ORDER'
  | 'RELEASE_PRODUCTION_ORDER'
  | 'RESCHEDULE_PRODUCTION_ORDER'
  | 'CONVERT_PLANNED_ORDER'
  | 'RUN_MRP'
  | 'CREATE_PURCHASE_REQUISITION'
  | 'CREATE_STOCK_TRANSFER_ORDER'
  | 'TRIGGER_QUALITY_INSPECTION'
  | 'NOTIFY_PRODUCTION_SUPERVISOR'
  | 'GENERATE_PRODUCTION_KPI_DASHBOARD'
  | 'RECOMMEND_ALTERNATE_MATERIAL'
  | 'BALANCE_WORK_CENTER_CAPACITY'
  | 'IDENTIFY_BOTTLENECK'
  | 'ALERT_BEFORE_STOCKOUT';

type Classification = 'AUTO' | 'SENSITIVE' | 'NOT_AVAILABLE';

const MFG_ORDER_REASON = 'This landscape\'s live Manufacturing Order service (MPE_PRODORDER_OBJPG_SRV/C_MfgOrderObjPg) is explicitly read-only (sap:creatable="false" sap:updatable="false", zero FunctionImports in its real $metadata) — the dedicated API_PRODUCTION_ORDER_2_SRV service itself returns live HTTP 403 (not authorized) in this landscape. There is no live write path for this action.';

export const PP_ACTION_CATALOG: Record<PpActionType, { title: string; classification: Classification; unavailableReason?: string }> = {
  CREATE_PRODUCTION_ORDER: { title: 'Create Production Order', classification: 'NOT_AVAILABLE', unavailableReason: MFG_ORDER_REASON },
  RELEASE_PRODUCTION_ORDER: { title: 'Release Production Order', classification: 'NOT_AVAILABLE', unavailableReason: MFG_ORDER_REASON },
  RESCHEDULE_PRODUCTION_ORDER: { title: 'Reschedule Production Order / Update Production Dates', classification: 'NOT_AVAILABLE', unavailableReason: MFG_ORDER_REASON },
  CONVERT_PLANNED_ORDER: { title: 'Convert Planned Order to Production Order', classification: 'NOT_AVAILABLE', unavailableReason: MFG_ORDER_REASON },
  RUN_MRP: { title: 'Run MRP', classification: 'NOT_AVAILABLE', unavailableReason: 'A live metadata inspection of API_MRP_MATERIALS_SRV_01 found zero FunctionImports/bound actions — no live MRP-run trigger endpoint is exposed in this landscape (MRP runs are a background batch job here, not an OData-callable action).' },
  CREATE_PURCHASE_REQUISITION: { title: 'Create Purchase Requisition for Shortage', classification: 'SENSITIVE' },
  CREATE_STOCK_TRANSFER_ORDER: { title: 'Create Stock Transfer Order', classification: 'SENSITIVE' },
  TRIGGER_QUALITY_INSPECTION: { title: 'Trigger Quality Inspection', classification: 'NOT_AVAILABLE', unavailableReason: 'No live bound action or creatable entity to manually trigger a new QM Inspection Lot from the PP side was found in this landscape — inspection lots are system-generated automatically by goods movements/order operations, not directly creatable via a standalone live API here.' },
  NOTIFY_PRODUCTION_SUPERVISOR: { title: 'Notify Production Supervisor', classification: 'AUTO' },
  GENERATE_PRODUCTION_KPI_DASHBOARD: { title: 'Generate Production KPI Dashboard', classification: 'AUTO' },
  RECOMMEND_ALTERNATE_MATERIAL: { title: 'Recommend Alternate Material Substitution', classification: 'AUTO' },
  BALANCE_WORK_CENTER_CAPACITY: { title: 'Balance Capacity Across Work Centers', classification: 'AUTO' },
  IDENTIFY_BOTTLENECK: { title: 'Identify Bottleneck & Propose Corrective Action', classification: 'AUTO' },
  ALERT_BEFORE_STOCKOUT: { title: 'Alert Planners Before Stockout', classification: 'AUTO' }
};

export interface PpActionProposal {
  proposalId: string;
  actionType: PpActionType;
  title: string;
  targetId: string;
  currentState: Record<string, any>;
  proposedChange: Record<string, any>;
  createdAt: number;
}

const pendingProposals = new Map<string, PpActionProposal & { execute: () => Promise<any> }>();

function genId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

const odataDateToIso = (val: any): string | null => {
  if (typeof val === 'string' && val.includes('/Date(')) {
    const ms = Number(val.match(/\/Date\((\d+)\)\//)?.[1]);
    return Number.isFinite(ms) ? new Date(ms).toISOString().slice(0, 10) : null;
  }
  return typeof val === 'string' ? val.slice(0, 10) : null;
};

// ---- AUTO actions (execute immediately, no approval — real live analysis, no live write) ----

async function executeNotifyProductionSupervisor(): Promise<{ success: boolean; message: string; data?: any }> {
  return {
    success: true,
    message: 'This landscape has no live notification gateway (email/SMS/Teams/Slack) configured in this integration, so a supervisor notification is disclosed here rather than fabricated as sent. Use the live production exception reports (delayed orders, material shortages, capacity bottlenecks) for the real facts to relay manually.',
    data: {}
  };
}

async function executeGenerateProductionKpiDashboard(plant?: string): Promise<{ success: boolean; message: string; data?: any }> {
  const filter = plant ? `$filter=ProductionPlant eq '${plant}'&$select=ProductionOrder,SystemStatusText,TotalQuantity,MfgOrderConfirmedYieldQty,MfgOrderPlannedEndDate&$top=1000` : `$select=ProductionOrder,SystemStatusText,TotalQuantity,MfgOrderConfirmedYieldQty,MfgOrderPlannedEndDate&$top=1000`;
  const res = await sapApi.queryS8HOData('MPE_PRODORDER_OBJPG_SRV', 'C_MfgOrderObjPg', filter);
  if (!Array.isArray(res)) return { success: false, message: `Live KPI dashboard generation failed: ${res?.error || 'no data returned'}.` };
  const todayIso = new Date().toISOString().slice(0, 10);
  const released = res.filter((r: any) => /rel/i.test(String(r.SystemStatusText || ''))).length;
  const completed = res.filter((r: any) => /teco|clsd|closed|complet/i.test(String(r.SystemStatusText || ''))).length;
  const delayed = res.filter((r: any) => { const end = r.MfgOrderPlannedEndDate; return typeof end === 'string' && end < todayIso && !/teco|clsd|closed|complet/i.test(String(r.SystemStatusText || '')); }).length;
  const totalQty = res.reduce((s: number, r: any) => s + (Number(r.TotalQuantity) || 0), 0);
  const yieldQty = res.reduce((s: number, r: any) => s + (Number(r.MfgOrderConfirmedYieldQty) || 0), 0);
  return {
    success: true,
    message: `Live Production KPI Dashboard${plant ? ` for Plant ${plant}` : ''}: ${res.length} order(s) sampled, ${released} released, ${completed} completed, ${delayed} behind schedule, ${Math.round(totalQty).toLocaleString()} total planned qty, ${Math.round(yieldQty).toLocaleString()} confirmed yield.`,
    data: { ordersSampled: res.length, released, completed, delayed, totalQty, yieldQty }
  };
}

async function executeRecommendAlternateMaterial(material: string, plant?: string): Promise<{ success: boolean; message: string; data?: any }> {
  if (!material) return { success: false, message: 'No material specified for substitution recommendation.' };
  const filter = `$filter=Material eq '${material}'${plant ? ` and Plant eq '${plant}'` : ''}&$select=Material,Plant,MatlWrhsStkQtyInMatlBaseUnit&$top=200`;
  const res = await sapApi.queryS8HOData('API_MATERIAL_STOCK_SRV', 'A_MatlStkInAcctMod', filter);
  if (!Array.isArray(res)) return { success: false, message: `Live substitution check failed: ${res?.error || 'no data returned'}.` };
  const totalStock = res.reduce((s: number, r: any) => s + (Number(r.MatlWrhsStkQtyInMatlBaseUnit) || 0), 0);
  return {
    success: true,
    message: totalStock > 0
      ? `Live check found ${Math.round(totalStock).toLocaleString()} units of real on-hand stock for Material ${material} across ${res.length} location(s) — no substitution is needed right now based on live stock data.`
      : `Live check found 0 real on-hand stock for Material ${material}. This landscape has no live approved-substitution master data (material-to-material substitution list) exposed via an OData service, so a specific alternate material cannot be recommended live — escalate to the material planner for an approved substitute.`,
    data: { material, plant, totalStock, locations: res.length }
  };
}

async function executeBalanceWorkCenterCapacity(plant?: string): Promise<{ success: boolean; message: string; data?: any }> {
  const res = await sapApi.queryS8HOData('MPE_PRODORDER_OBJPG_SRV', 'C_MfgOrderObjPgOpr', `$select=WorkCenter,ErlstSchedldExecDurnInWorkdays&$top=1000`).catch(() => null);
  if (!Array.isArray(res) || res.length === 0) return { success: false, message: 'Live work-center workload data was not available to compute a capacity-balancing recommendation right now.' };
  const byWc = new Map<string, number>();
  for (const r of res) byWc.set(r.WorkCenter || '(blank)', (byWc.get(r.WorkCenter || '(blank)') || 0) + (Number(r.ErlstSchedldExecDurnInWorkdays) || 0));
  const sorted = Array.from(byWc.entries()).sort((a, b) => b[1] - a[1]);
  if (sorted.length < 2) return { success: true, message: `Only ${sorted.length} distinct work center(s) found in live operation data — not enough to recommend a cross-work-center capacity rebalance.`, data: { workCenters: sorted } };
  const [busiest, quietest] = [sorted[0], sorted[sorted.length - 1]];
  return {
    success: true,
    message: `Live decision-support recommendation: Work Center ${busiest[0]} has the highest real live scheduled workload (${Math.round(busiest[1])} workdays), while ${quietest[0]} has the lowest (${Math.round(quietest[1])} workdays) — consider moving open operations from ${busiest[0]} to ${quietest[0]} to balance load. This is a recommendation only; no live capacity-reassignment write action is available in this landscape.`,
    data: { busiest: busiest[0], busiestLoad: busiest[1], quietest: quietest[0], quietestLoad: quietest[1] }
  };
}

async function executeIdentifyBottleneck(): Promise<{ success: boolean; message: string; data?: any }> {
  const res = await sapApi.queryS8HOData('MPE_PRODORDER_OBJPG_SRV', 'C_MfgOrderObjPg', `$select=ProductionOrder,SystemStatusText,MfgOrderPlannedEndDate,ProductionSupervisor&$top=1000`);
  if (!Array.isArray(res)) return { success: false, message: `Live bottleneck analysis failed: ${res?.error || 'no data returned'}.` };
  const todayIso = new Date().toISOString().slice(0, 10);
  const delayed = res.filter((r: any) => { const end = r.MfgOrderPlannedEndDate; return typeof end === 'string' && end < todayIso && !/teco|clsd|closed|complet/i.test(String(r.SystemStatusText || '')); });
  const bySupervisor = new Map<string, number>();
  for (const r of delayed) bySupervisor.set(r.ProductionSupervisor || '(unassigned)', (bySupervisor.get(r.ProductionSupervisor || '(unassigned)') || 0) + 1);
  const sorted = Array.from(bySupervisor.entries()).sort((a, b) => b[1] - a[1]);
  return {
    success: true,
    message: delayed.length > 0
      ? `Live bottleneck signal: ${delayed.length} of ${res.length} sampled order(s) are behind schedule live. ${sorted.length ? `Most concentrated under supervisor "${sorted[0][0]}" (${sorted[0][1]} delayed order(s))` : ''} — recommend reviewing capacity/material availability for that area first.`
      : `Live check found ${res.length} order(s) sampled, 0 currently behind schedule — no bottleneck detected right now from live order-schedule data.`,
    data: { ordersSampled: res.length, delayed: delayed.length, bySupervisor: sorted }
  };
}

async function executeAlertBeforeStockout(material?: string, plant?: string): Promise<{ success: boolean; message: string; data?: any }> {
  if (!material) return { success: false, message: 'No material specified for stockout risk check.' };
  let mrpPlant = plant;
  if (!mrpPlant) {
    const lookup = await sapApi.queryS8HOData('API_MRP_MATERIALS_SRV_01', 'A_MRPMaterial', `$select=Material,MRPPlant&$filter=Material eq '${material}'&$top=1`);
    if (Array.isArray(lookup) && lookup.length) mrpPlant = lookup[0].MRPPlant;
  }
  if (!mrpPlant) return { success: false, message: `No live MRP Plant could be resolved for Material ${material} — cannot check stockout risk.` };
  const res = await sapApi.queryS8HOData('API_MRP_MATERIALS_SRV_01', 'SupplyDemandItems', `$filter=Material eq '${material}' and MRPPlant eq '${mrpPlant}'&$select=Material,MRPPlant,MRPElement,MRPElementAvailyOrRqmtDate,MRPAvailableQuantity&$top=200`);
  if (!Array.isArray(res)) return { success: false, message: `Live stockout check failed: ${res?.error || 'no data returned'}.` };
  const negative = res.filter((r: any) => Number(r.MRPAvailableQuantity) < 0).sort((a: any, b: any) => Number(a.MRPAvailableQuantity) - Number(b.MRPAvailableQuantity));
  return {
    success: true,
    message: negative.length > 0
      ? `Live MRP supply/demand check for Material ${material} (Plant ${mrpPlant}) found ${negative.length} of ${res.length} real element(s) with a NEGATIVE live available quantity (projected shortage) — earliest/worst: ${Math.round(negative[0].MRPAvailableQuantity).toLocaleString()} on element ${negative[0].MRPElement} (${odataDateToIso(negative[0].MRPElementAvailyOrRqmtDate) || 'no date'}).`
      : `Live MRP supply/demand check for Material ${material} (Plant ${mrpPlant}) found ${res.length} real element(s), no negative available quantity detected — no live stockout risk found right now.`,
    data: { material, plant: mrpPlant, elementsSampled: res.length, shortages: negative.slice(0, 20) }
  };
}

// ---- SENSITIVE actions (real live OData write, human approval required) ----

async function proposeCreatePurchaseRequisition(material: string, quantity: number, plant: string, purchasingGroup?: string): Promise<PpActionProposal & { execute: () => Promise<any> }> {
  if (!material || !quantity || !plant) throw new Error('Material, quantity, and plant are all required to create a Purchase Requisition.');
  const requirementDate = new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().slice(0, 10);
  const payload = {
    PurchaseRequisitionType: 'NB',
    to_PurchaseReqnItem: [{
      PurchaseRequisitionItem: '00010',
      Material: material,
      Plant: plant,
      RequestedQuantity: String(quantity),
      PurchasingGroup: purchasingGroup || '001',
      RequirementDate: `/Date(${Date.parse(requirementDate)})/`
    }]
  };
  return {
    proposalId: genId('PROP-PP'),
    actionType: 'CREATE_PURCHASE_REQUISITION',
    title: PP_ACTION_CATALOG.CREATE_PURCHASE_REQUISITION.title,
    targetId: '(new)',
    currentState: { material, plant, requestedQuantity: quantity, requirementDate },
    proposedChange: payload,
    createdAt: Date.now(),
    execute: () => sapApi.writeS8HOData('API_PURCHASEREQ_PROCESS_SRV', 'A_PurchaseRequisitionHeader', 'POST', '', payload)
  };
}

async function proposeCreateStockTransferOrder(material: string, quantity: number, supplyingPlant: string, receivingPlant: string): Promise<PpActionProposal & { execute: () => Promise<any> }> {
  if (!material || !quantity || !supplyingPlant || !receivingPlant) throw new Error('Material, quantity, supplying plant, and receiving plant are all required to create a Stock Transfer Order.');
  const payload = {
    PurchaseOrderType: 'UB',
    Supplier: supplyingPlant,
    to_PurchaseOrderItem: [{
      PurchaseOrderItem: '00010',
      Material: material,
      Plant: receivingPlant,
      OrderQuantity: String(quantity),
      SupplyingPlant: supplyingPlant
    }]
  };
  return {
    proposalId: genId('PROP-PP'),
    actionType: 'CREATE_STOCK_TRANSFER_ORDER',
    title: PP_ACTION_CATALOG.CREATE_STOCK_TRANSFER_ORDER.title,
    targetId: '(new)',
    currentState: { material, quantity, supplyingPlant, receivingPlant },
    proposedChange: payload,
    createdAt: Date.now(),
    execute: () => sapApi.writeS8HOData('API_PURCHASEORDER_PROCESS_SRV', 'A_PurchaseOrder', 'POST', '', payload)
  };
}

// ---- Public dispatch API ----

export async function executeAutoPpAction(actionType: PpActionType, params: Record<string, any>): Promise<{ success: boolean; message: string; data?: any }> {
  switch (actionType) {
    case 'NOTIFY_PRODUCTION_SUPERVISOR': return executeNotifyProductionSupervisor();
    case 'GENERATE_PRODUCTION_KPI_DASHBOARD': return executeGenerateProductionKpiDashboard(params.plant);
    case 'RECOMMEND_ALTERNATE_MATERIAL': return executeRecommendAlternateMaterial(params.material, params.plant);
    case 'BALANCE_WORK_CENTER_CAPACITY': return executeBalanceWorkCenterCapacity(params.plant);
    case 'IDENTIFY_BOTTLENECK': return executeIdentifyBottleneck();
    case 'ALERT_BEFORE_STOCKOUT': return executeAlertBeforeStockout(params.material, params.plant);
    default: return { success: false, message: `${actionType} is not an AUTO action.` };
  }
}

export async function proposeSensitivePpAction(actionType: PpActionType, params: Record<string, any>): Promise<PpActionProposal> {
  let proposal: PpActionProposal & { execute: () => Promise<any> };
  switch (actionType) {
    case 'CREATE_PURCHASE_REQUISITION':
      proposal = await proposeCreatePurchaseRequisition(params.material, params.quantity, params.plant, params.purchasingGroup);
      break;
    case 'CREATE_STOCK_TRANSFER_ORDER':
      proposal = await proposeCreateStockTransferOrder(params.material, params.quantity, params.supplyingPlant, params.receivingPlant);
      break;
    default:
      throw new Error(`${actionType} is not a SENSITIVE action.`);
  }
  pendingProposals.set(proposal.proposalId, proposal);
  return proposal;
}

export async function decidePpActionProposal(proposalId: string, decision: 'approve' | 'reject'): Promise<{ success: boolean; message: string; data?: any }> {
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
  return { success: true, message: `Human-approved "${proposal.title}" on ${proposal.targetId} executed live on S/4HANA (Client 100).`, data: result };
}
