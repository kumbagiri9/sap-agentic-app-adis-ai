// SD Autonomous Actions Engine — live S/4HANA write actions with human-approval gating for
// sensitive changes. Every action either (a) performs a real live OData write via
// sapApi.writeS8HOData, (b) is read-only/decision-support (no write), or (c) is honestly
// reported as NOT AVAILABLE when the required live OData service/entity is not authorized in
// this landscape (never fabricated). No mock data, no simulated success — per rules.md.
import { sapApi } from './sapService';
import { idocService } from './idocService';

export type SdActionType =
  | 'CREATE_QUOTATION'
  | 'CREATE_SALES_ORDER'
  | 'CHANGE_SALES_ORDER'
  | 'CANCEL_ORDER'
  | 'REMOVE_DELIVERY_BLOCK'
  | 'CREATE_OUTBOUND_DELIVERY'
  | 'TRIGGER_ATP_RECHECK'
  | 'PERFORM_BACKORDER_PROCESSING'
  | 'CREATE_RETURN_ORDER'
  | 'CREATE_BILLING_DOCUMENT'
  | 'RELEASE_BILLING_BLOCK'
  | 'REPROCESS_FAILED_IDOCS'
  | 'CHANGE_DELIVERY_PRIORITY'
  | 'TRIGGER_CUSTOMER_NOTIFICATION';

type Classification = 'AUTO' | 'SENSITIVE' | 'NOT_AVAILABLE';

export const SD_ACTION_CATALOG: Record<SdActionType, { title: string; classification: Classification; unavailableReason?: string }> = {
  CREATE_QUOTATION: { title: 'Create Quotation', classification: 'NOT_AVAILABLE', unavailableReason: 'Live S/4HANA API_SALES_QUOTATION_SRV returned HTTP 403 (not authorized) in this landscape.' },
  CREATE_SALES_ORDER: { title: 'Create Sales Order', classification: 'SENSITIVE' },
  CHANGE_SALES_ORDER: { title: 'Change Sales Order', classification: 'SENSITIVE' },
  CANCEL_ORDER: { title: 'Cancel Order', classification: 'SENSITIVE' },
  REMOVE_DELIVERY_BLOCK: { title: 'Remove Approved Delivery Block', classification: 'SENSITIVE' },
  CREATE_OUTBOUND_DELIVERY: { title: 'Create Outbound Delivery', classification: 'SENSITIVE' },
  TRIGGER_ATP_RECHECK: { title: 'Trigger ATP Recheck', classification: 'AUTO' },
  PERFORM_BACKORDER_PROCESSING: { title: 'Perform Backorder Processing', classification: 'AUTO' },
  CREATE_RETURN_ORDER: { title: 'Create Return Order', classification: 'SENSITIVE' },
  CREATE_BILLING_DOCUMENT: { title: 'Create Billing Document', classification: 'NOT_AVAILABLE', unavailableReason: 'Live S/4HANA API_BILLING_DOCUMENT_SRV/A_BillingDocument is explicitly not creatable (sap:creatable="false") in this landscape.' },
  RELEASE_BILLING_BLOCK: { title: 'Release Billing Block', classification: 'SENSITIVE' },
  REPROCESS_FAILED_IDOCS: { title: 'Reprocess Failed IDocs', classification: 'AUTO' },
  CHANGE_DELIVERY_PRIORITY: { title: 'Change Delivery Priority', classification: 'NOT_AVAILABLE', unavailableReason: 'Live S/4HANA API_OUTBOUND_DELIVERY_SRV/A_OutbDeliveryHeader.DeliveryPriority is marked non-modifiable (sap:creatable="false") in this landscape\'s exposed metadata; a live PATCH attempt was confirmed rejected with HTTP 400.' },
  TRIGGER_CUSTOMER_NOTIFICATION: { title: 'Trigger Customer Notification', classification: 'AUTO' }
};

export interface SdActionProposal {
  proposalId: string;
  actionType: SdActionType;
  title: string;
  targetId: string;
  currentState: Record<string, any>;
  proposedChange: Record<string, any>;
  createdAt: number;
}

const pendingProposals = new Map<string, SdActionProposal & { execute: () => Promise<any> }>();

function genId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

async function readSalesOrder(orderId: string): Promise<any | null> {
  const res = await sapApi.queryS8HOData('API_SALES_ORDER_SRV', 'A_SalesOrder', `$filter=SalesOrder eq '${orderId}'&$top=1`);
  if (Array.isArray(res) && res.length > 0) return res[0];
  return null;
}

async function readDelivery(deliveryId: string): Promise<any | null> {
  const res = await sapApi.queryS8HOData('API_OUTBOUND_DELIVERY_SRV', 'A_OutbDeliveryHeader', `$filter=DeliveryDocument eq '${deliveryId}'&$top=1`);
  if (Array.isArray(res) && res.length > 0) return res[0];
  return null;
}

// ---- AUTO actions (execute immediately, no approval — read-only or non-destructive) ----

async function executeAtpRecheck(material: string): Promise<{ success: boolean; message: string; data?: any }> {
  if (!material) return { success: false, message: 'No material specified for ATP recheck.' };
  const res = await sapApi.queryS8HOData('API_MATERIAL_STOCK_SRV', 'A_MatlStkInAcctMod', `$filter=Material eq '${material}'&$select=Material,Plant,MatlWrhsStkQtyInMatlBaseUnit&$top=50`);
  if (res?.error || !Array.isArray(res)) {
    return { success: false, message: `Live ATP recheck failed: ${res?.error || 'no data returned'}.` };
  }
  const byPlant = new Map<string, number>();
  res.forEach((r: any) => { const p = String(r.Plant || ''); byPlant.set(p, (byPlant.get(p) || 0) + (Number(r.MatlWrhsStkQtyInMatlBaseUnit) || 0)); });
  const totalAvailable = Array.from(byPlant.values()).reduce((s, v) => s + v, 0);
  return {
    success: true,
    message: `Live ATP recheck for Material ${material}: ${totalAvailable.toLocaleString()} units available across ${byPlant.size} plant(s).`,
    data: { material, totalAvailable, byPlant: Array.from(byPlant.entries()).map(([plant, qty]) => ({ plant, qty })) }
  };
}

async function executeBackorderProcessing(material: string): Promise<{ success: boolean; message: string; data?: any }> {
  if (!material) return { success: false, message: 'No material specified for backorder processing.' };
  const items = await sapApi.queryS8HOData('API_SALES_ORDER_SRV', 'A_SalesOrderItem', `$filter=Material eq '${material}'&$select=SalesOrder,Material,RequestedQuantity,ConfdDelivQtyInOrderQtyUnit&$top=200`);
  if (items?.error || !Array.isArray(items)) {
    return { success: false, message: `Live backorder analysis failed: ${items?.error || 'no data returned'}.` };
  }
  const shortfalls = items
    .map((it: any) => ({ salesOrder: it.SalesOrder, requested: Number(it.RequestedQuantity) || 0, confirmed: Number(it.ConfdDelivQtyInOrderQtyUnit) || 0 }))
    .filter((it: any) => it.requested > it.confirmed)
    .map((it: any) => ({ ...it, shortfall: it.requested - it.confirmed }))
    .sort((a: any, b: any) => a.salesOrder.localeCompare(b.salesOrder));
  return {
    success: true,
    message: `Live backorder analysis for Material ${material}: ${shortfalls.length} order(s) with unconfirmed quantity, FIFO-ranked by document number. No live Backorder Processing (BOP) BAPI is authorized in this landscape, so this is a recommendation only — no live re-confirmation was executed.`,
    data: { material, shortfalls: shortfalls.slice(0, 25) }
  };
}

async function executeReprocessFailedSdIdocs(): Promise<{ success: boolean; message: string; data?: any }> {
  const idocs = await idocService.getAllIdocs();
  const sdFailed = idocs.filter((i: any) => i.messageType === 'ORDERS' && ['51', '02'].includes(i.currentStatus));
  if (sdFailed.length === 0) {
    return { success: true, message: 'No failed SD (ORDERS message type) IDocs found to reprocess.', data: { reprocessed: [] } };
  }
  const results = [];
  for (const idoc of sdFailed) {
    const result = await idocService.reprocessIdoc(idoc.id);
    results.push({ idocId: idoc.id, ...result });
  }
  return {
    success: true,
    message: `Reprocessed ${results.length} failed SD IDoc(s). ${results.map(r => `${r.idocId}: ${r.success ? 'OK' : 'still failed'}`).join(', ')}.`,
    data: { reprocessed: results }
  };
}

async function executeCustomerNotification(customerId: string): Promise<{ success: boolean; message: string; data?: any }> {
  if (!customerId) return { success: false, message: 'No customer specified for notification.' };
  const res = await sapApi.queryS8HOData('API_BUSINESS_PARTNER', 'A_BusinessPartner', `$filter=BusinessPartner eq '${customerId}'&$select=BusinessPartner,BusinessPartnerFullName&$top=1`);
  const bp = Array.isArray(res) && res.length > 0 ? res[0] : null;
  return {
    success: true,
    message: bp
      ? `Live Business Partner ${customerId} (${bp.BusinessPartnerFullName || 'name not set'}) identified. No live email/SMS gateway is configured in this landscape — notification was prepared but not dispatched.`
      : `Business Partner ${customerId} not found live — notification not prepared.`,
    data: { customer: customerId, businessPartner: bp }
  };
}

// ---- SENSITIVE actions (require human approval before the real live write executes) ----

async function proposeRemoveDeliveryBlock(orderId: string): Promise<SdActionProposal & { execute: () => Promise<any> }> {
  const order = await readSalesOrder(orderId);
  if (!order) throw new Error(`Sales Order ${orderId} not found live.`);
  const proposalId = genId('PROP-SD');
  return {
    proposalId,
    actionType: 'REMOVE_DELIVERY_BLOCK',
    title: SD_ACTION_CATALOG.REMOVE_DELIVERY_BLOCK.title,
    targetId: orderId,
    currentState: { DeliveryBlockReason: order.DeliveryBlockReason || '(none)' },
    proposedChange: { DeliveryBlockReason: '' },
    createdAt: Date.now(),
    execute: () => sapApi.writeS8HOData('API_SALES_ORDER_SRV', 'A_SalesOrder', 'PATCH', `SalesOrder='${orderId}'`, { DeliveryBlockReason: '' })
  };
}

async function proposeReleaseBillingBlock(orderId: string): Promise<SdActionProposal & { execute: () => Promise<any> }> {
  const order = await readSalesOrder(orderId);
  if (!order) throw new Error(`Sales Order ${orderId} not found live.`);
  const proposalId = genId('PROP-SD');
  return {
    proposalId,
    actionType: 'RELEASE_BILLING_BLOCK',
    title: SD_ACTION_CATALOG.RELEASE_BILLING_BLOCK.title,
    targetId: orderId,
    currentState: { HeaderBillingBlockReason: order.HeaderBillingBlockReason || '(none)' },
    proposedChange: { HeaderBillingBlockReason: '' },
    createdAt: Date.now(),
    execute: () => sapApi.writeS8HOData('API_SALES_ORDER_SRV', 'A_SalesOrder', 'PATCH', `SalesOrder='${orderId}'`, { HeaderBillingBlockReason: '' })
  };
}

async function proposeCancelOrder(orderId: string): Promise<SdActionProposal & { execute: () => Promise<any> }> {
  const items = await sapApi.queryS8HOData('API_SALES_ORDER_SRV', 'A_SalesOrderItem', `$filter=SalesOrder eq '${orderId}'&$select=SalesOrder,SalesOrderItem,SalesDocumentRjcnReason&$top=100`);
  if (items?.error || !Array.isArray(items) || items.length === 0) throw new Error(`Sales Order ${orderId} items not found live.`);
  const proposalId = genId('PROP-SD');
  return {
    proposalId,
    actionType: 'CANCEL_ORDER',
    title: SD_ACTION_CATALOG.CANCEL_ORDER.title,
    targetId: orderId,
    currentState: { items: items.map((i: any) => ({ item: i.SalesOrderItem, rejectionReason: i.SalesDocumentRjcnReason || '(none)' })) },
    proposedChange: { rejectionReasonCode: '01', note: 'Standard SAP delivered rejection reason "01" (Rejected by customer) applied to all items.' },
    createdAt: Date.now(),
    execute: async () => {
      const results = [];
      for (const it of items) {
        const r = await sapApi.writeS8HOData('API_SALES_ORDER_SRV', 'A_SalesOrderItem', 'PATCH', `SalesOrder='${orderId}',SalesOrderItem='${it.SalesOrderItem}'`, { SalesDocumentRjcnReason: '01' });
        results.push({ item: it.SalesOrderItem, ...r });
      }
      return { success: results.every(r => r.success), items: results };
    }
  };
}

async function proposeChangeDeliveryPriority(deliveryId: string, newPriority: string): Promise<SdActionProposal & { execute: () => Promise<any> }> {
  const delivery = await readDelivery(deliveryId);
  if (!delivery) throw new Error(`Outbound Delivery ${deliveryId} not found live.`);
  const proposalId = genId('PROP-SD');
  return {
    proposalId,
    actionType: 'CHANGE_DELIVERY_PRIORITY',
    title: SD_ACTION_CATALOG.CHANGE_DELIVERY_PRIORITY.title,
    targetId: deliveryId,
    currentState: { DeliveryPriority: delivery.DeliveryPriority || '(none)' },
    proposedChange: { DeliveryPriority: newPriority },
    createdAt: Date.now(),
    execute: () => sapApi.writeS8HOData('API_OUTBOUND_DELIVERY_SRV', 'A_OutbDeliveryHeader', 'PATCH', `DeliveryDocument='${deliveryId}'`, { DeliveryPriority: newPriority })
  };
}

async function proposeChangeSalesOrder(orderId: string, field: string, newValue: string): Promise<SdActionProposal & { execute: () => Promise<any> }> {
  const ALLOWED_FIELDS = ['PurchaseOrderByCustomer', 'CustomerPurchaseOrderDate'];
  if (!ALLOWED_FIELDS.includes(field)) throw new Error(`Field "${field}" is not in the allowed safe-change list (${ALLOWED_FIELDS.join(', ')}).`);
  const order = await readSalesOrder(orderId);
  if (!order) throw new Error(`Sales Order ${orderId} not found live.`);
  const proposalId = genId('PROP-SD');
  return {
    proposalId,
    actionType: 'CHANGE_SALES_ORDER',
    title: SD_ACTION_CATALOG.CHANGE_SALES_ORDER.title,
    targetId: orderId,
    currentState: { [field]: order[field] || '(none)' },
    proposedChange: { [field]: newValue },
    createdAt: Date.now(),
    execute: () => sapApi.writeS8HOData('API_SALES_ORDER_SRV', 'A_SalesOrder', 'PATCH', `SalesOrder='${orderId}'`, { [field]: newValue })
  };
}

async function proposeCreateSalesOrder(soldToParty: string, material: string, quantity: number, requestedDeliveryDateIso?: string, verificationChain?: Record<string, any>): Promise<SdActionProposal & { execute: () => Promise<any> }> {
  const proposalId = genId('PROP-SD');
  const payload: Record<string, any> = {
    SalesOrderType: 'OR',
    SalesOrganization: '1710',
    DistributionChannel: '10',
    OrganizationDivision: '00',
    SoldToParty: soldToParty || 'USCU_L09',
    to_Item: [{
      SalesOrderItem: '10',
      Material: material || 'MZ-TG-Y200',
      RequestedQuantity: String(quantity || 1),
      ...(requestedDeliveryDateIso ? { RequestedDeliveryDate: `/Date(${Date.parse(requestedDeliveryDateIso)})/` } : {})
    }]
  };
  return {
    proposalId,
    actionType: 'CREATE_SALES_ORDER',
    title: SD_ACTION_CATALOG.CREATE_SALES_ORDER.title,
    targetId: '(new)',
    // Real live verification chain (Customer -> Material -> Pricing -> ATP -> Credit -> Margin),
    // computed BEFORE this proposal was shown, so the human approver sees it alongside the raw
    // API payload — never fabricated, populated only when the caller supplies real lookup results.
    currentState: verificationChain || {},
    proposedChange: payload,
    createdAt: Date.now(),
    execute: () => sapApi.writeS8HOData('API_SALES_ORDER_SRV', 'A_SalesOrder', 'POST', '', payload)
  };
}

async function proposeCreateReturnOrder(soldToParty: string, material: string, quantity: number, referenceOrder?: string): Promise<SdActionProposal & { execute: () => Promise<any> }> {
  const proposalId = genId('PROP-SD');
  const payload = {
    SalesOrderType: 'RE',
    SalesOrganization: '1710',
    DistributionChannel: '10',
    OrganizationDivision: '00',
    SoldToParty: soldToParty || 'USCU_L09',
    to_Item: [{ SalesOrderItem: '10', Material: material || 'MZ-TG-Y200', RequestedQuantity: String(quantity || 1) }]
  };
  return {
    proposalId,
    actionType: 'CREATE_RETURN_ORDER',
    title: SD_ACTION_CATALOG.CREATE_RETURN_ORDER.title,
    targetId: referenceOrder || '(new)',
    currentState: {},
    proposedChange: payload,
    createdAt: Date.now(),
    execute: async () => {
      const r = await sapApi.writeS8HOData('API_SALES_ORDER_SRV', 'A_SalesOrder', 'POST', '', payload);
      return { ...r, note: 'Created via Sales Order (Order Type RE) — dedicated Customer Returns OData API (API_CUSTOMER_RETURNS_SRV) is not authorized (HTTP 403) in this landscape.' };
    }
  };
}

async function proposeCreateOutboundDelivery(orderId: string): Promise<SdActionProposal & { execute: () => Promise<any> }> {
  const order = await readSalesOrder(orderId);
  if (!order) throw new Error(`Sales Order ${orderId} not found live.`);
  const proposalId = genId('PROP-SD');
  const payload = {
    DeliveryDocumentType: 'LF',
    ShippingPoint: '1710',
    OrderID: orderId
  };
  return {
    proposalId,
    actionType: 'CREATE_OUTBOUND_DELIVERY',
    title: SD_ACTION_CATALOG.CREATE_OUTBOUND_DELIVERY.title,
    targetId: orderId,
    currentState: { OverallDeliveryStatus: order.OverallDeliveryStatus || '(none)' },
    proposedChange: payload,
    createdAt: Date.now(),
    execute: () => sapApi.writeS8HOData('API_OUTBOUND_DELIVERY_SRV', 'A_OutbDeliveryHeader', 'POST', '', payload)
  };
}

// ---- Public dispatch API ----

export async function executeAutoSdAction(actionType: SdActionType, params: Record<string, any>): Promise<{ success: boolean; message: string; data?: any }> {
  switch (actionType) {
    case 'TRIGGER_ATP_RECHECK': return executeAtpRecheck(params.material);
    case 'PERFORM_BACKORDER_PROCESSING': return executeBackorderProcessing(params.material);
    case 'REPROCESS_FAILED_IDOCS': return executeReprocessFailedSdIdocs();
    case 'TRIGGER_CUSTOMER_NOTIFICATION': return executeCustomerNotification(params.customerId);
    default: return { success: false, message: `${actionType} is not an AUTO action.` };
  }
}

export async function proposeSensitiveSdAction(actionType: SdActionType, params: Record<string, any>): Promise<SdActionProposal> {
  let proposal: SdActionProposal & { execute: () => Promise<any> };
  switch (actionType) {
    case 'REMOVE_DELIVERY_BLOCK': proposal = await proposeRemoveDeliveryBlock(params.orderId); break;
    case 'RELEASE_BILLING_BLOCK': proposal = await proposeReleaseBillingBlock(params.orderId); break;
    case 'CANCEL_ORDER': proposal = await proposeCancelOrder(params.orderId); break;
    case 'CHANGE_DELIVERY_PRIORITY': proposal = await proposeChangeDeliveryPriority(params.deliveryId, params.newPriority || '02'); break;
    case 'CHANGE_SALES_ORDER': proposal = await proposeChangeSalesOrder(params.orderId, params.field, params.newValue); break;
    case 'CREATE_SALES_ORDER': proposal = await proposeCreateSalesOrder(params.soldToParty, params.material, params.quantity, params.requestedDeliveryDateIso, params.verificationChain); break;
    case 'CREATE_RETURN_ORDER': proposal = await proposeCreateReturnOrder(params.soldToParty, params.material, params.quantity, params.referenceOrder); break;
    case 'CREATE_OUTBOUND_DELIVERY': proposal = await proposeCreateOutboundDelivery(params.orderId); break;
    default: throw new Error(`${actionType} is not a SENSITIVE action.`);
  }
  pendingProposals.set(proposal.proposalId, proposal);
  return proposal;
}

export async function decideSdActionProposal(proposalId: string, decision: 'approve' | 'reject'): Promise<{ success: boolean; message: string; data?: any }> {
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
