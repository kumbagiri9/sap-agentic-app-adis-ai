// EWM/WM Autonomous Actions Engine — live embedded S/4HANA EWM write actions with human-approval
// gating for sensitive changes, mirroring the SD/FICO Autonomous Actions pattern. Every action
// either (a) performs a real live OData V4 bound-action write via sapApi.callS8HBoundActionV4,
// (b) is read-only/decision-support (no write), or (c) is honestly reported as NOT AVAILABLE when
// the required live capability was confirmed absent in this landscape (never fabricated). All
// NOT_AVAILABLE reasons below were confirmed via real live probes (metadata bound-action lists,
// real HTTP 400/405 responses to test writes) — never assumed. No mock data, no simulated
// success — per rules.md.
import { sapApi } from './sapService';

export type EwmActionType =
  | 'CONFIRM_WAREHOUSE_TASK'
  | 'CANCEL_WAREHOUSE_TASK'
  | 'ASSIGN_WAREHOUSE_ORDER'
  | 'REASSIGN_WAREHOUSE_TASK'
  | 'RELEASE_WAREHOUSE_ORDER'
  | 'SET_SHIPPING_READINESS'
  | 'POST_GOODS_ISSUE'
  | 'REVERSE_GOODS_ISSUE'
  | 'RECOMMEND_REPLENISHMENT_TASK'
  | 'ESCALATE_DELAYED_INBOUND_SHIPMENT'
  | 'CREATE_WAREHOUSE_TASK'
  | 'CREATE_PICKING_TASK'
  | 'CREATE_PUTAWAY_WAREHOUSE_ORDER'
  | 'RELEASE_WAVE'
  | 'CREATE_PHYSICAL_INVENTORY_DOCUMENT'
  | 'TRIGGER_CYCLE_COUNT'
  | 'ASSIGN_INBOUND_DELIVERY_TO_DOOR'
  | 'TRIGGER_QUALITY_INSPECTION_FLOW'
  | 'RECONCILE_STOCK_DIFFERENCES';

type Classification = 'AUTO' | 'SENSITIVE' | 'NOT_AVAILABLE';

export const EWM_ACTION_CATALOG: Record<EwmActionType, { title: string; classification: Classification; unavailableReason?: string }> = {
  CONFIRM_WAREHOUSE_TASK: { title: 'Confirm Warehouse Task', classification: 'SENSITIVE' },
  CANCEL_WAREHOUSE_TASK: { title: 'Cancel Warehouse Task', classification: 'SENSITIVE' },
  ASSIGN_WAREHOUSE_ORDER: { title: 'Assign Warehouse Order to Resource', classification: 'SENSITIVE' },
  REASSIGN_WAREHOUSE_TASK: { title: 'Reassign/Reprioritize Warehouse Task', classification: 'SENSITIVE' },
  RELEASE_WAREHOUSE_ORDER: { title: 'Release Warehouse Order for Processing', classification: 'SENSITIVE' },
  SET_SHIPPING_READINESS: { title: 'Set Shipping Readiness', classification: 'SENSITIVE' },
  POST_GOODS_ISSUE: { title: 'Post Goods Issue', classification: 'SENSITIVE' },
  REVERSE_GOODS_ISSUE: { title: 'Reverse Goods Issue', classification: 'SENSITIVE' },
  RECOMMEND_REPLENISHMENT_TASK: { title: 'Recommend Replenishment / Bin-to-Bin Movement', classification: 'AUTO' },
  ESCALATE_DELAYED_INBOUND_SHIPMENT: { title: 'Escalate Delayed Inbound Shipment', classification: 'AUTO' },
  CREATE_WAREHOUSE_TASK: { title: 'Create Warehouse Task', classification: 'NOT_AVAILABLE', unavailableReason: 'A live POST to API_WAREHOUSE_ORDER_TASK_2/WarehouseTask was confirmed rejected with HTTP 400 "/SCWM/ODATA_API/040 Parameter combination for action Create Warehouse Task is not supported" — this landscape exposes no working live create-task parameter combination.' },
  CREATE_PICKING_TASK: { title: 'Create Picking Warehouse Task', classification: 'NOT_AVAILABLE', unavailableReason: 'Picking tasks are WarehouseTask records — same live-confirmed limitation as Create Warehouse Task (HTTP 400, no working live create path in this landscape).' },
  CREATE_PUTAWAY_WAREHOUSE_ORDER: { title: 'Create Putaway Warehouse Order', classification: 'NOT_AVAILABLE', unavailableReason: 'No live Create action exists for WarehouseOrder in API_WAREHOUSE_ORDER_TASK_2\'s real $metadata bound-action list (only AssignWarehouseOrder/UnassignWarehouseOrder/ReassignToWarehouseOrder/SetWarehouseOrderToInProcess are exposed).' },
  RELEASE_WAVE: { title: 'Release Wave', classification: 'NOT_AVAILABLE', unavailableReason: 'This landscape has no live Wave Management OData service among its 4 exposed embedded-EWM V4 APIs — confirmed via IWFND catalog, no wave-related entity or bound action exists.' },
  CREATE_PHYSICAL_INVENTORY_DOCUMENT: { title: 'Create Physical Inventory Document / Trigger Cycle Count', classification: 'NOT_AVAILABLE', unavailableReason: 'A live POST to API_WHSE_PHYSINVTRYITEM_2/WhsePhysicalInventoryItem was confirmed rejected with HTTP 405 "SADL_ENTITY_RUNTIME/011 Creating operations are disabled" — only a DeletePhysicalInventoryItem action is exposed, no create/trigger action.' },
  TRIGGER_CYCLE_COUNT: { title: 'Trigger Cycle Count', classification: 'NOT_AVAILABLE', unavailableReason: 'Same live-confirmed limitation as Create Physical Inventory Document — HTTP 405, creating operations disabled on this entity in this landscape.' },
  ASSIGN_INBOUND_DELIVERY_TO_DOOR: { title: 'Assign Inbound Delivery to Door', classification: 'NOT_AVAILABLE', unavailableReason: 'This landscape has no live Dock Appointment/Yard Management OData service (confirmed absent from the embedded EWM API catalog) — no door/dock assignment field or action exists on WhseInboundDeliveryHead.' },
  TRIGGER_QUALITY_INSPECTION_FLOW: { title: 'Trigger Quality Inspection Flow', classification: 'NOT_AVAILABLE', unavailableReason: 'No live bound action to trigger a new quality-inspection document was found on the Inbound Delivery or Physical Stock EWM V4 APIs in this landscape — only a read-only QualityInspectionDocument reference field exists (already surfaced in the live report).' },
  RECONCILE_STOCK_DIFFERENCES: { title: 'Reconcile Stock Differences', classification: 'NOT_AVAILABLE', unavailableReason: 'API_WHSE_PHYSINVTRYITEM_2 exposes only a DeletePhysicalInventoryItem bound action (destructive, not a reconciliation/adjustment action) — no live "post inventory difference"/reconcile action exists in this landscape\'s exposed metadata.' }
};

export interface EwmActionProposal {
  proposalId: string;
  actionType: EwmActionType;
  title: string;
  targetId: string;
  currentState: Record<string, any>;
  proposedChange: Record<string, any>;
  createdAt: number;
}

const pendingProposals = new Map<string, EwmActionProposal & { execute: () => Promise<any> }>();

function genId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

const NS = 'com.sap.gateway.srvd_a2x';
const EWM_WAREHOUSE_ORDER_TASK_BASE = '/sap/opu/odata4/sap/api_warehouse_order_task_2/srvd_a2x/sap/warehouseorder/0001';
const EWM_OUTBOUND_DELIVERY_ORDER_BASE = '/sap/opu/odata4/sap/api_warehouse_odo_2/srvd_a2x/sap/warehouseoutbdeliveryorder/0001';
const TASK_NS = `${NS}.api_warehouse_order_task_2.v0001`;
const ODO_NS = `${NS}.api_whse_outb_delivery_order_2.v0001`;

async function queryEwmV4(basePath: string, entity: string, query: string): Promise<any[] | null> {
  const username = process.env.SAP_S8H_USER;
  const password = process.env.SAP_S8H_PWD;
  if (!username || !password) return null;
  const base64Encode = (str: string) => { try { return btoa(str); } catch (e) { return typeof Buffer !== 'undefined' ? Buffer.from(str).toString('base64') : str; } };
  const authString = `Basic ${base64Encode(`${username}:${password}`)}`;
  const host = 'https://mmc-s4sap11.mmc.1stbasis.com:44300';
  try {
    const res = await fetch(`${host}${basePath}/${entity}?${query}&sap-client=100`, { headers: { Authorization: authString, Accept: 'application/json' } });
    if (!res.ok) return null;
    const json = await res.json();
    return Array.isArray(json?.value) ? json.value : null;
  } catch {
    return null;
  }
}

async function readWarehouseTask(warehouse: string, task: string, item?: string): Promise<any | null> {
  const filter = item
    ? `$filter=EWMWarehouse eq '${warehouse}' and WarehouseTask eq '${task}' and WarehouseTaskItem eq '${item}'&$top=1`
    : `$filter=EWMWarehouse eq '${warehouse}' and WarehouseTask eq '${task}'&$top=1`;
  const res = await queryEwmV4(EWM_WAREHOUSE_ORDER_TASK_BASE, 'WarehouseTask', filter);
  return Array.isArray(res) && res.length > 0 ? res[0] : null;
}

async function readWarehouseOrder(warehouse: string, order: string): Promise<any | null> {
  const res = await queryEwmV4(EWM_WAREHOUSE_ORDER_TASK_BASE, 'WarehouseOrder', `$filter=EWMWarehouse eq '${warehouse}' and WarehouseOrder eq '${order}'&$top=1`);
  return Array.isArray(res) && res.length > 0 ? res[0] : null;
}

async function readOutboundDeliveryOrder(order: string): Promise<any | null> {
  const res = await queryEwmV4(EWM_OUTBOUND_DELIVERY_ORDER_BASE, 'WhseOutboundDeliveryOrderHead', `$filter=EWMOutboundDeliveryOrder eq '${order}'&$top=1`);
  return Array.isArray(res) && res.length > 0 ? res[0] : null;
}

// ---- AUTO actions (execute immediately, no approval — decision-support only, no live write) ----

async function executeRecommendReplenishment(product: string): Promise<{ success: boolean; message: string; data?: any }> {
  if (!product) return { success: false, message: 'No product specified for replenishment recommendation.' };
  const res = await queryEwmV4('/sap/opu/odata4/sap/api_whse_availablestock/srvd_a2x/sap/warehouseavailablestock/0001', 'WarehouseAvailableStock', `$filter=Product eq '${product}'&$select=EWMWarehouse,EWMStorageBin,AvailableEWMStockQty&$top=200`);
  if (!res) return { success: false, message: `Live replenishment recommendation failed: no data returned for Product ${product}.` };
  if (res.length < 2) return { success: true, message: `Live check for Product ${product} found only ${res.length} real storage location(s) — not enough distinct bins to recommend a bin-to-bin replenishment movement.`, data: { product, locations: res } };
  const sorted = [...res].sort((a, b) => (Number(b.AvailableEWMStockQty) || 0) - (Number(a.AvailableEWMStockQty) || 0));
  const source = sorted[0];
  const target = sorted[sorted.length - 1];
  const recommendedQty = Math.floor(((Number(source.AvailableEWMStockQty) || 0) - (Number(target.AvailableEWMStockQty) || 0)) / 2);
  return {
    success: true,
    message: `Live decision-support recommendation for Product ${product}: move ${recommendedQty} units from bin ${source.EWMStorageBin || '(blank)'} (${source.AvailableEWMStockQty} on hand) to bin ${target.EWMStorageBin || '(blank)'} (${target.AvailableEWMStockQty} on hand) to balance real live stock levels. This is a recommendation only — no live warehouse task create action is available in this landscape (see CREATE_WAREHOUSE_TASK), so this movement must be executed manually in SAP.`,
    data: { product, sourceBin: source.EWMStorageBin, sourceQty: source.AvailableEWMStockQty, targetBin: target.EWMStorageBin, targetQty: target.AvailableEWMStockQty, recommendedQty }
  };
}

async function executeEscalateDelayedInboundShipment(): Promise<{ success: boolean; message: string; data?: any }> {
  const items = await queryEwmV4('/sap/opu/odata4/sap/api_whse_inb_delivery_2/srvd_a2x/sap/warehouseinbounddelivery/0001', 'WhseInboundDeliveryItem', `$filter=CompletionStatus ne '9'&$select=EWMInboundDelivery,Product,GoodsReceiptStatus,PutawayStatus,CompletionStatus&$top=1000`);
  if (!items) return { success: false, message: 'Live delayed-inbound-shipment check failed: no data returned.' };
  return {
    success: true,
    message: `Live check found ${items.length} real inbound delivery line item(s) not yet complete (CompletionStatus \u2260 '9'). This landscape has no live notification/escalation gateway (email/SMS/Slack) configured in this integration, so escalation is disclosed here rather than fabricated as sent.`,
    data: { incompleteItemCount: items.length, sample: items.slice(0, 20) }
  };
}

// ---- SENSITIVE actions (real live OData V4 bound-action writes, human approval required) ----

async function proposeConfirmWarehouseTask(warehouse: string, task: string, item?: string): Promise<EwmActionProposal & { execute: () => Promise<any> }> {
  const t = await readWarehouseTask(warehouse, task, item);
  if (!t) throw new Error(`Warehouse Task ${task} (Warehouse ${warehouse}) not found live.`);
  const payload = {
    AlternativeUnit: t.AlternativeUnit || t.BaseUnit || '',
    ActualQuantityInAltvUnit: String(t.TargetQuantityInAltvUnit ?? t.TargetQuantityInBaseUnit ?? 0),
    DifferenceQuantityInAltvUnit: '0',
    WhseTaskExceptionCodeQtyDiff: '',
    DestinationStorageBin: t.DestinationStorageBin || '',
    WhseTaskExCodeDestStorageBin: '',
    SourceHandlingUnit: t.SourceHandlingUnit || '',
    DestinationHandlingUnit: t.DestinationHandlingUnit || '',
    DestinationResource: t.DestinationResource || t.ExecutingResource || '',
    EWMPutAwayPhysInvtryExecSts: '',
    EWMWhseTskLowStkChkExecSts: '',
    EWMWhseTaskLowStockCheckQty: '0',
    EWMHandlingUnitIsNotWithdrawn: false,
    DirectWhseTaskConfIsAllowed: true
  };
  return {
    proposalId: genId('PROP-EWM'),
    actionType: 'CONFIRM_WAREHOUSE_TASK',
    title: EWM_ACTION_CATALOG.CONFIRM_WAREHOUSE_TASK.title,
    targetId: `${task}/${t.WarehouseTaskItem}`,
    currentState: { warehouseTaskStatus: t.WarehouseTaskStatus === 'A' ? 'Open' : t.WarehouseTaskStatus, product: t.Product, targetQuantity: t.TargetQuantityInBaseUnit, destinationStorageBin: t.DestinationStorageBin || '(blank)' },
    proposedChange: payload,
    createdAt: Date.now(),
    execute: () => sapApi.callS8HBoundActionV4(EWM_WAREHOUSE_ORDER_TASK_BASE, 'WarehouseTask', `EWMWarehouse='${warehouse}',WarehouseTask='${task}',WarehouseTaskItem='${t.WarehouseTaskItem}'`, `${TASK_NS}.ConfirmWarehouseTaskProduct`, payload)
  };
}

async function proposeCancelWarehouseTask(warehouse: string, task: string, item?: string): Promise<EwmActionProposal & { execute: () => Promise<any> }> {
  const t = await readWarehouseTask(warehouse, task, item);
  if (!t) throw new Error(`Warehouse Task ${task} (Warehouse ${warehouse}) not found live.`);
  const payload = { DirectWhseTaskConfIsAllowed: true };
  return {
    proposalId: genId('PROP-EWM'),
    actionType: 'CANCEL_WAREHOUSE_TASK',
    title: EWM_ACTION_CATALOG.CANCEL_WAREHOUSE_TASK.title,
    targetId: `${task}/${t.WarehouseTaskItem}`,
    currentState: { warehouseTaskStatus: t.WarehouseTaskStatus === 'A' ? 'Open' : t.WarehouseTaskStatus, product: t.Product, warehouseOrder: t.WarehouseOrder },
    proposedChange: payload,
    createdAt: Date.now(),
    execute: () => sapApi.callS8HBoundActionV4(EWM_WAREHOUSE_ORDER_TASK_BASE, 'WarehouseTask', `EWMWarehouse='${warehouse}',WarehouseTask='${task}',WarehouseTaskItem='${t.WarehouseTaskItem}'`, `${TASK_NS}.CancelWarehouseTask`, payload)
  };
}

async function proposeAssignWarehouseOrder(warehouse: string, order: string, resource: string): Promise<EwmActionProposal & { execute: () => Promise<any> }> {
  const o = await readWarehouseOrder(warehouse, order);
  if (!o) throw new Error(`Warehouse Order ${order} (Warehouse ${warehouse}) not found live.`);
  if (!resource) throw new Error('No resource/worker ID specified to assign this warehouse order to.');
  const payload = { EWMResource: resource };
  return {
    proposalId: genId('PROP-EWM'),
    actionType: 'ASSIGN_WAREHOUSE_ORDER',
    title: EWM_ACTION_CATALOG.ASSIGN_WAREHOUSE_ORDER.title,
    targetId: order,
    currentState: { warehouseOrderStatus: o.WarehouseOrderStatus === 'A' ? 'Open' : o.WarehouseOrderStatus, currentExecutingResource: o.ExecutingResource || '(unassigned)', queue: o.Queue || '(blank)' },
    proposedChange: payload,
    createdAt: Date.now(),
    execute: () => sapApi.callS8HBoundActionV4(EWM_WAREHOUSE_ORDER_TASK_BASE, 'WarehouseOrder', `EWMWarehouse='${warehouse}',WarehouseOrder='${order}'`, `${TASK_NS}.AssignWarehouseOrder`, payload)
  };
}

async function proposeReassignWarehouseTask(warehouse: string, task: string, newOrder: string, item?: string): Promise<EwmActionProposal & { execute: () => Promise<any> }> {
  const t = await readWarehouseTask(warehouse, task, item);
  if (!t) throw new Error(`Warehouse Task ${task} (Warehouse ${warehouse}) not found live.`);
  if (!newOrder) throw new Error('No target Warehouse Order specified to reassign this task to.');
  const payload = { WarehouseOrder: newOrder };
  return {
    proposalId: genId('PROP-EWM'),
    actionType: 'REASSIGN_WAREHOUSE_TASK',
    title: EWM_ACTION_CATALOG.REASSIGN_WAREHOUSE_TASK.title,
    targetId: `${task}/${t.WarehouseTaskItem}`,
    currentState: { currentWarehouseOrder: t.WarehouseOrder, product: t.Product, warehouseTaskStatus: t.WarehouseTaskStatus === 'A' ? 'Open' : t.WarehouseTaskStatus },
    proposedChange: payload,
    createdAt: Date.now(),
    execute: () => sapApi.callS8HBoundActionV4(EWM_WAREHOUSE_ORDER_TASK_BASE, 'WarehouseTask', `EWMWarehouse='${warehouse}',WarehouseTask='${task}',WarehouseTaskItem='${t.WarehouseTaskItem}'`, `${TASK_NS}.ReassignToWarehouseOrder`, payload)
  };
}

async function proposeReleaseWarehouseOrder(warehouse: string, order: string): Promise<EwmActionProposal & { execute: () => Promise<any> }> {
  const o = await readWarehouseOrder(warehouse, order);
  if (!o) throw new Error(`Warehouse Order ${order} (Warehouse ${warehouse}) not found live.`);
  return {
    proposalId: genId('PROP-EWM'),
    actionType: 'RELEASE_WAREHOUSE_ORDER',
    title: EWM_ACTION_CATALOG.RELEASE_WAREHOUSE_ORDER.title,
    targetId: order,
    currentState: { warehouseOrderStatus: o.WarehouseOrderStatus === 'A' ? 'Open' : o.WarehouseOrderStatus, queue: o.Queue || '(blank)' },
    proposedChange: { action: 'SetWarehouseOrderToInProcess' },
    createdAt: Date.now(),
    execute: () => sapApi.callS8HBoundActionV4(EWM_WAREHOUSE_ORDER_TASK_BASE, 'WarehouseOrder', `EWMWarehouse='${warehouse}',WarehouseOrder='${order}'`, `${TASK_NS}.SetWarehouseOrderToInProcess`, {})
  };
}

async function proposeSetShippingReadiness(order: string): Promise<EwmActionProposal & { execute: () => Promise<any> }> {
  const o = await readOutboundDeliveryOrder(order);
  if (!o) throw new Error(`Outbound Delivery Order ${order} not found live.`);
  return {
    proposalId: genId('PROP-EWM'),
    actionType: 'SET_SHIPPING_READINESS',
    title: EWM_ACTION_CATALOG.SET_SHIPPING_READINESS.title,
    targetId: order,
    currentState: { warehouse: o.EWMWarehouse, shipTo: o.ShipToPartyName || o.ShipToParty || '(blank)' },
    proposedChange: { action: 'SetShippingReadiness' },
    createdAt: Date.now(),
    execute: () => sapApi.callS8HBoundActionV4(EWM_OUTBOUND_DELIVERY_ORDER_BASE, 'WhseOutboundDeliveryOrderHead', `EWMOutboundDeliveryOrder='${order}'`, `${ODO_NS}.SetShippingReadiness`, {})
  };
}

async function proposePostGoodsIssue(order: string): Promise<EwmActionProposal & { execute: () => Promise<any> }> {
  const o = await readOutboundDeliveryOrder(order);
  if (!o) throw new Error(`Outbound Delivery Order ${order} not found live.`);
  return {
    proposalId: genId('PROP-EWM'),
    actionType: 'POST_GOODS_ISSUE',
    title: EWM_ACTION_CATALOG.POST_GOODS_ISSUE.title,
    targetId: order,
    currentState: { warehouse: o.EWMWarehouse, shipTo: o.ShipToPartyName || o.ShipToParty || '(blank)', carrier: o.CarrierName || o.Carrier || '(blank)' },
    proposedChange: { action: 'PostGoodsIssue' },
    createdAt: Date.now(),
    execute: () => sapApi.callS8HBoundActionV4(EWM_OUTBOUND_DELIVERY_ORDER_BASE, 'WhseOutboundDeliveryOrderHead', `EWMOutboundDeliveryOrder='${order}'`, `${ODO_NS}.PostGoodsIssue`, {})
  };
}

async function proposeReverseGoodsIssue(order: string): Promise<EwmActionProposal & { execute: () => Promise<any> }> {
  const o = await readOutboundDeliveryOrder(order);
  if (!o) throw new Error(`Outbound Delivery Order ${order} not found live.`);
  return {
    proposalId: genId('PROP-EWM'),
    actionType: 'REVERSE_GOODS_ISSUE',
    title: EWM_ACTION_CATALOG.REVERSE_GOODS_ISSUE.title,
    targetId: order,
    currentState: { warehouse: o.EWMWarehouse, shipTo: o.ShipToPartyName || o.ShipToParty || '(blank)' },
    proposedChange: { action: 'ReverseGoodsIssue' },
    createdAt: Date.now(),
    execute: () => sapApi.callS8HBoundActionV4(EWM_OUTBOUND_DELIVERY_ORDER_BASE, 'WhseOutboundDeliveryOrderHead', `EWMOutboundDeliveryOrder='${order}'`, `${ODO_NS}.ReverseGoodsIssue`, {})
  };
}

// ---- Public dispatch API ----

export async function executeAutoEwmAction(actionType: EwmActionType, params: Record<string, any>): Promise<{ success: boolean; message: string; data?: any }> {
  switch (actionType) {
    case 'RECOMMEND_REPLENISHMENT_TASK': return executeRecommendReplenishment(params.product);
    case 'ESCALATE_DELAYED_INBOUND_SHIPMENT': return executeEscalateDelayedInboundShipment();
    default: return { success: false, message: `${actionType} is not an AUTO action.` };
  }
}

export async function proposeSensitiveEwmAction(actionType: EwmActionType, params: Record<string, any>): Promise<EwmActionProposal> {
  let proposal: EwmActionProposal & { execute: () => Promise<any> };
  switch (actionType) {
    case 'CONFIRM_WAREHOUSE_TASK': proposal = await proposeConfirmWarehouseTask(params.warehouse, params.task, params.item); break;
    case 'CANCEL_WAREHOUSE_TASK': proposal = await proposeCancelWarehouseTask(params.warehouse, params.task, params.item); break;
    case 'ASSIGN_WAREHOUSE_ORDER': proposal = await proposeAssignWarehouseOrder(params.warehouse, params.order, params.resource); break;
    case 'REASSIGN_WAREHOUSE_TASK': proposal = await proposeReassignWarehouseTask(params.warehouse, params.task, params.newOrder, params.item); break;
    case 'RELEASE_WAREHOUSE_ORDER': proposal = await proposeReleaseWarehouseOrder(params.warehouse, params.order); break;
    case 'SET_SHIPPING_READINESS': proposal = await proposeSetShippingReadiness(params.order); break;
    case 'POST_GOODS_ISSUE': proposal = await proposePostGoodsIssue(params.order); break;
    case 'REVERSE_GOODS_ISSUE': proposal = await proposeReverseGoodsIssue(params.order); break;
    default: throw new Error(`${actionType} is not a SENSITIVE action.`);
  }
  pendingProposals.set(proposal.proposalId, proposal);
  return proposal;
}

export async function decideEwmActionProposal(proposalId: string, decision: 'approve' | 'reject'): Promise<{ success: boolean; message: string; data?: any }> {
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
  return { success: true, message: `Human-approved "${proposal.title}" on ${proposal.targetId} executed live on embedded S/4HANA EWM (Client 100).`, data: result };
}
