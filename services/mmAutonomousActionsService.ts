// SAP MM Autonomous Actions Engine — live S/4HANA write actions with human-approval gating,
// mirroring the SD/FICO/EWM/TM/PP Autonomous Actions pattern. Real live metadata probing
// (documented per-action below) found this landscape's real A_Product, A_ProductPlant,
// A_MaterialDocumentHeader, and A_PurchaseOrder entities are all genuinely creatable (only
// sap:deletable="false"/no restriction attributes present — creatable defaults to true per this
// landscape's established OData V2 convention), while API_PURCHASINGINFORECORD_SRV and
// API_SRC_LIST_SRV both return live HTTP 403 (not deployed) and no live Reservation-creation
// entity was found in API_MATERIAL_STOCK_SRV. This replaces the previous `mmService.ts`
// implementation, which fabricated every one of these actions (hardcoded document numbers like
// `4500021980`/`5000201950` returned unconditionally, or a random real PO number from an
// unrelated `$top=1` query misappropriated to look like a fresh create result — see
// /memories/repo/runtime-notes.md for the audit detail).
import { sapApi } from './sapService';

export type MmActionType =
  | 'CREATE_MATERIAL_MASTER'
  | 'EXTEND_MATERIAL_TO_PLANT'
  | 'CREATE_PURCHASE_REQUISITION'
  | 'CONVERT_PR_TO_PO'
  | 'CREATE_PURCHASE_ORDER'
  | 'CHANGE_PURCHASE_ORDER'
  | 'CREATE_STOCK_TRANSFER_ORDER'
  | 'PERFORM_GOODS_RECEIPT'
  | 'PERFORM_GOODS_ISSUE'
  | 'TRANSFER_STOCK_BETWEEN_PLANTS'
  | 'CREATE_RESERVATION'
  | 'UPDATE_SOURCE_LIST'
  | 'MAINTAIN_PURCHASING_INFO_RECORD'
  | 'MAINTAIN_QUOTA_ARRANGEMENT'
  | 'GENERATE_INVENTORY_REPORT'
  | 'TRIGGER_PHYSICAL_INVENTORY'
  | 'REPROCESS_PROCUREMENT_INTERFACES';

type Classification = 'AUTO' | 'SENSITIVE' | 'NOT_AVAILABLE';

export const MM_ACTION_CATALOG: Record<MmActionType, { title: string; classification: Classification; unavailableReason?: string }> = {
  CREATE_MATERIAL_MASTER: { title: 'Create Material Master', classification: 'SENSITIVE' },
  EXTEND_MATERIAL_TO_PLANT: { title: 'Extend Material to New Plant', classification: 'SENSITIVE' },
  CREATE_PURCHASE_REQUISITION: { title: 'Create Purchase Requisition', classification: 'SENSITIVE' },
  CONVERT_PR_TO_PO: { title: 'Convert PR to Purchase Order', classification: 'SENSITIVE' },
  CREATE_PURCHASE_ORDER: { title: 'Create Purchase Order', classification: 'SENSITIVE' },
  CHANGE_PURCHASE_ORDER: { title: 'Change Purchase Order', classification: 'SENSITIVE' },
  CREATE_STOCK_TRANSFER_ORDER: { title: 'Create Stock Transfer Order', classification: 'SENSITIVE' },
  PERFORM_GOODS_RECEIPT: { title: 'Perform Goods Receipt', classification: 'SENSITIVE' },
  PERFORM_GOODS_ISSUE: { title: 'Perform Goods Issue', classification: 'SENSITIVE' },
  TRANSFER_STOCK_BETWEEN_PLANTS: { title: 'Transfer Stock Between Plants', classification: 'SENSITIVE' },
  CREATE_RESERVATION: { title: 'Create Reservation', classification: 'NOT_AVAILABLE', unavailableReason: 'No live Reservation-creation entity was found in this landscape\'s real API_MATERIAL_STOCK_SRV metadata (no "Reservation" entity set exists there), and no dedicated Reservation OData service (e.g. API_MATERIALRESERVATION) was found live either.' },
  UPDATE_SOURCE_LIST: { title: 'Update Source List', classification: 'NOT_AVAILABLE', unavailableReason: 'No live Source List OData service is deployed in this landscape (API_SRC_LIST_SRV returns real HTTP 403 "No service found").' },
  MAINTAIN_PURCHASING_INFO_RECORD: { title: 'Maintain Purchasing Info Record', classification: 'NOT_AVAILABLE', unavailableReason: 'No live Purchasing Info Record OData service is deployed in this landscape (API_PURCHASINGINFORECORD_SRV returns real HTTP 403 "No service found").' },
  MAINTAIN_QUOTA_ARRANGEMENT: { title: 'Maintain Quota Arrangement', classification: 'NOT_AVAILABLE', unavailableReason: 'No live Quota Arrangement OData service was found deployed in this landscape during this session\'s live probing.' },
  GENERATE_INVENTORY_REPORT: { title: 'Generate Inventory Report', classification: 'AUTO' },
  TRIGGER_PHYSICAL_INVENTORY: { title: 'Trigger Physical Inventory', classification: 'NOT_AVAILABLE', unavailableReason: 'No live Physical Inventory Document creation API was found deployed among this landscape\'s exposed MM OData services during this session\'s live probing.' },
  REPROCESS_PROCUREMENT_INTERFACES: { title: 'Reprocess Failed Procurement Interfaces', classification: 'AUTO' }
};

export interface MmActionProposal {
  proposalId: string;
  actionType: MmActionType;
  title: string;
  targetId: string;
  currentState: Record<string, any>;
  proposedChange: Record<string, any>;
  createdAt: number;
}

const pendingProposals = new Map<string, MmActionProposal & { execute: () => Promise<any> }>();

function genId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

// ---- AUTO actions (execute immediately, no approval — real live data, no live write) ----

async function executeGenerateInventoryReport(material?: string, plant?: string): Promise<{ success: boolean; message: string; data?: any }> {
  const conditions: string[] = [];
  if (material) conditions.push(`Material eq '${material}'`);
  if (plant) conditions.push(`Plant eq '${plant}'`);
  const filter = conditions.length ? `$filter=${conditions.join(' and ')}&$select=Material,Plant,StorageLocation,Batch,MatlWrhsStkQtyInMatlBaseUnit,InventoryStockType&$top=1000` : `$select=Material,Plant,StorageLocation,Batch,MatlWrhsStkQtyInMatlBaseUnit,InventoryStockType&$top=1000`;
  const res = await sapApi.queryS8HOData('API_MATERIAL_STOCK_SRV', 'A_MatlStkInAcctMod', filter);
  if (!Array.isArray(res)) return { success: false, message: `Live inventory report failed: ${res?.error || 'no data returned'}.` };
  const totalQty = res.reduce((s: number, r: any) => s + (Number(r.MatlWrhsStkQtyInMatlBaseUnit) || 0), 0);
  const byPlant = new Map<string, number>();
  for (const r of res) byPlant.set(r.Plant || '(blank)', (byPlant.get(r.Plant || '(blank)') || 0) + (Number(r.MatlWrhsStkQtyInMatlBaseUnit) || 0));
  return {
    success: true,
    message: `Live Inventory Report${material ? ` for Material ${material}` : ''}${plant ? ` in Plant ${plant}` : ''}: ${res.length} real stock record(s) sampled across ${byPlant.size} plant(s), total quantity ${Math.round(totalQty).toLocaleString()}.`,
    data: { recordsSampled: res.length, totalQty, byPlant: Array.from(byPlant.entries()).map(([p, qty]) => ({ plant: p, qty })) }
  };
}

async function executeReprocessProcurementInterfaces(): Promise<{ success: boolean; message: string; data?: any }> {
  const res = await sapApi.queryS8HOData('API_IDOC_TRACK_SRV', 'IdocTrack', `$filter=Direction eq '2' and Status eq '51'&$top=200`).catch(() => null);
  if (Array.isArray(res)) {
    return {
      success: true,
      message: `Live check found ${res.length} real inbound IDoc(s) currently in error status 51 (candidates for procurement-interface reprocessing). This landscape's live IDoc reprocess capability is available via the existing IDoc reprocessing feature — no fabricated reprocess-success count is reported here.`,
      data: { failedCount: res.length }
    };
  }
  return {
    success: true,
    message: 'Live check for failed procurement interface IDocs (status 51) could not be confirmed against a live IDoc tracking service in this landscape right now \u2014 no fabricated reprocess result is substituted.',
    data: {}
  };
}

// ---- SENSITIVE actions (real live OData write, human approval required) ----

async function proposeCreateMaterialMaster(material: string, description: string, materialType: string, baseUnit: string): Promise<MmActionProposal & { execute: () => Promise<any> }> {
  if (!material || !description) throw new Error('Material number and description are required to create a Material Master.');
  const payload = {
    Product: material,
    ProductType: materialType || 'FERT',
    ProductGroup: '01',
    BaseUnit: baseUnit || 'EA',
    to_ProductDescription: [{ Language: 'EN', ProductDescription: description }]
  };
  return {
    proposalId: genId('PROP-MM'),
    actionType: 'CREATE_MATERIAL_MASTER',
    title: MM_ACTION_CATALOG.CREATE_MATERIAL_MASTER.title,
    targetId: material,
    currentState: { note: 'No existing live Material Master record was checked for a conflicting Product number — this is a new material create request.' },
    proposedChange: payload,
    createdAt: Date.now(),
    execute: () => sapApi.writeS8HOData('API_PRODUCT_SRV', 'A_Product', 'POST', '', payload)
  };
}

async function proposeExtendMaterialToPlant(material: string, plant: string): Promise<MmActionProposal & { execute: () => Promise<any> }> {
  if (!material || !plant) throw new Error('Material and target plant are both required to extend a material to a new plant.');
  const existing = await sapApi.queryS8HOData('API_PRODUCT_SRV', 'A_ProductPlant', `$filter=Product eq '${material}' and Plant eq '${plant}'&$top=1`);
  const alreadyExtended = Array.isArray(existing) && existing.length > 0;
  const payload = { Product: material, Plant: plant, MRPType: 'ND', ProfitCenter: '' };
  return {
    proposalId: genId('PROP-MM'),
    actionType: 'EXTEND_MATERIAL_TO_PLANT',
    title: MM_ACTION_CATALOG.EXTEND_MATERIAL_TO_PLANT.title,
    targetId: `${material}/${plant}`,
    currentState: { alreadyExtendedToPlant: alreadyExtended },
    proposedChange: payload,
    createdAt: Date.now(),
    execute: () => alreadyExtended
      ? Promise.resolve({ success: false, error: `Material ${material} is already live-extended to Plant ${plant} — no duplicate extension performed.` })
      : sapApi.writeS8HOData('API_PRODUCT_SRV', 'A_ProductPlant', 'POST', '', payload)
  };
}

async function proposeCreatePurchaseRequisition(material: string, quantity: number, plant: string): Promise<MmActionProposal & { execute: () => Promise<any> }> {
  if (!material || !quantity || !plant) throw new Error('Material, quantity, and plant are all required to create a Purchase Requisition.');
  const requirementDate = new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().slice(0, 10);
  const payload = {
    PurchaseRequisitionType: 'NB',
    to_PurchaseReqnItem: [{ PurchaseRequisitionItem: '00010', Material: material, Plant: plant, RequestedQuantity: String(quantity), PurchasingGroup: '001', RequirementDate: `/Date(${Date.parse(requirementDate)})/` }]
  };
  return {
    proposalId: genId('PROP-MM'),
    actionType: 'CREATE_PURCHASE_REQUISITION',
    title: MM_ACTION_CATALOG.CREATE_PURCHASE_REQUISITION.title,
    targetId: '(new)',
    currentState: { material, plant, requestedQuantity: quantity, requirementDate },
    proposedChange: payload,
    createdAt: Date.now(),
    execute: () => sapApi.writeS8HOData('API_PURCHASEREQ_PROCESS_SRV', 'A_PurchaseRequisitionHeader', 'POST', '', payload)
  };
}

async function readPurchaseRequisition(prNumber: string): Promise<any | null> {
  const res = await sapApi.queryS8HOData('API_PURCHASEREQ_PROCESS_SRV', 'A_PurchaseRequisitionItem', `$filter=PurchaseRequisition eq '${prNumber}'&$top=1`);
  return Array.isArray(res) && res.length ? res[0] : null;
}

async function proposeConvertPrToPo(prNumber: string, supplier: string): Promise<MmActionProposal & { execute: () => Promise<any> }> {
  if (!prNumber || !supplier) throw new Error('Purchase Requisition number and Supplier are both required to convert a PR to a PO.');
  const item = await readPurchaseRequisition(prNumber);
  if (!item) throw new Error(`Purchase Requisition ${prNumber} not found live.`);
  const payload = {
    PurchaseOrderType: 'NB',
    Supplier: supplier,
    to_PurchaseOrderItem: [{
      PurchaseOrderItem: '00010',
      Material: item.Material,
      Plant: item.Plant,
      OrderQuantity: String(item.RequestedQuantity || 1),
      PurchaseRequisition: prNumber,
      PurchaseRequisitionItem: item.PurchaseRequisitionItem
    }]
  };
  return {
    proposalId: genId('PROP-MM'),
    actionType: 'CONVERT_PR_TO_PO',
    title: MM_ACTION_CATALOG.CONVERT_PR_TO_PO.title,
    targetId: prNumber,
    currentState: { material: item.Material, plant: item.Plant, requestedQuantity: item.RequestedQuantity },
    proposedChange: payload,
    createdAt: Date.now(),
    execute: () => sapApi.writeS8HOData('API_PURCHASEORDER_PROCESS_SRV', 'A_PurchaseOrder', 'POST', '', payload)
  };
}

async function proposeCreatePurchaseOrder(material: string, quantity: number, plant: string, supplier: string): Promise<MmActionProposal & { execute: () => Promise<any> }> {
  if (!material || !quantity || !plant || !supplier) throw new Error('Material, quantity, plant, and supplier are all required to create a Purchase Order.');
  const payload = {
    PurchaseOrderType: 'NB',
    Supplier: supplier,
    to_PurchaseOrderItem: [{ PurchaseOrderItem: '00010', Material: material, Plant: plant, OrderQuantity: String(quantity) }]
  };
  return {
    proposalId: genId('PROP-MM'),
    actionType: 'CREATE_PURCHASE_ORDER',
    title: MM_ACTION_CATALOG.CREATE_PURCHASE_ORDER.title,
    targetId: '(new)',
    currentState: { material, plant, quantity, supplier },
    proposedChange: payload,
    createdAt: Date.now(),
    execute: () => sapApi.writeS8HOData('API_PURCHASEORDER_PROCESS_SRV', 'A_PurchaseOrder', 'POST', '', payload)
  };
}

async function proposeChangePurchaseOrder(poNumber: string, newQuantity: number): Promise<MmActionProposal & { execute: () => Promise<any> }> {
  if (!poNumber || !newQuantity) throw new Error('Purchase Order number and a new quantity are both required.');
  const items = await sapApi.queryS8HOData('API_PURCHASEORDER_PROCESS_SRV', 'A_PurchaseOrderItem', `$filter=PurchaseOrder eq '${poNumber}'&$top=1`);
  const item = Array.isArray(items) && items.length ? items[0] : null;
  if (!item) throw new Error(`Purchase Order ${poNumber} not found live.`);
  return {
    proposalId: genId('PROP-MM'),
    actionType: 'CHANGE_PURCHASE_ORDER',
    title: MM_ACTION_CATALOG.CHANGE_PURCHASE_ORDER.title,
    targetId: poNumber,
    currentState: { currentQuantity: item.OrderQuantity, material: item.Material },
    proposedChange: { OrderQuantity: String(newQuantity) },
    createdAt: Date.now(),
    execute: () => sapApi.writeS8HOData('API_PURCHASEORDER_PROCESS_SRV', 'A_PurchaseOrderItem', 'PATCH', `PurchaseOrder='${poNumber}',PurchaseOrderItem='${item.PurchaseOrderItem}'`, { OrderQuantity: String(newQuantity) })
  };
}

async function proposeCreateStockTransferOrder(material: string, quantity: number, supplyingPlant: string, receivingPlant: string): Promise<MmActionProposal & { execute: () => Promise<any> }> {
  if (!material || !quantity || !supplyingPlant || !receivingPlant) throw new Error('Material, quantity, supplying plant, and receiving plant are all required to create a Stock Transfer Order.');
  const payload = {
    PurchaseOrderType: 'UB',
    Supplier: supplyingPlant,
    to_PurchaseOrderItem: [{ PurchaseOrderItem: '00010', Material: material, Plant: receivingPlant, OrderQuantity: String(quantity), SupplyingPlant: supplyingPlant }]
  };
  return {
    proposalId: genId('PROP-MM'),
    actionType: 'CREATE_STOCK_TRANSFER_ORDER',
    title: MM_ACTION_CATALOG.CREATE_STOCK_TRANSFER_ORDER.title,
    targetId: '(new)',
    currentState: { material, quantity, supplyingPlant, receivingPlant },
    proposedChange: payload,
    createdAt: Date.now(),
    execute: () => sapApi.writeS8HOData('API_PURCHASEORDER_PROCESS_SRV', 'A_PurchaseOrder', 'POST', '', payload)
  };
}

async function proposeGoodsMovement(actionType: 'PERFORM_GOODS_RECEIPT' | 'PERFORM_GOODS_ISSUE' | 'TRANSFER_STOCK_BETWEEN_PLANTS', material: string, quantity: number, plant: string, opts: { poNumber?: string; storageLocation?: string; targetPlant?: string; costCenter?: string }): Promise<MmActionProposal & { execute: () => Promise<any> }> {
  if (!material || !quantity || !plant) throw new Error('Material, quantity, and plant are all required for a goods movement.');
  const movementType = actionType === 'PERFORM_GOODS_RECEIPT' ? '101' : actionType === 'PERFORM_GOODS_ISSUE' ? '261' : '301';
  const item: Record<string, any> = {
    Material: material,
    Plant: plant,
    GoodsMovementType: movementType,
    QuantityInEntryUnit: String(quantity),
    EntryUnit: 'EA',
    ...(opts.storageLocation ? { StorageLocation: opts.storageLocation } : {}),
    ...(opts.poNumber ? { PurchaseOrder: opts.poNumber, PurchaseOrderItem: '00010' } : {}),
    ...(opts.costCenter ? { CostCenter: opts.costCenter } : {}),
    ...(actionType === 'TRANSFER_STOCK_BETWEEN_PLANTS' && opts.targetPlant ? { ReceivingPlant: opts.targetPlant } : {})
  };
  const payload = {
    PostingDate: `/Date(${Date.now()})/`,
    to_MaterialDocumentItem: [item]
  };
  return {
    proposalId: genId('PROP-MM'),
    actionType,
    title: MM_ACTION_CATALOG[actionType].title,
    targetId: opts.poNumber || material,
    currentState: { material, plant, quantity, movementType, ...opts },
    proposedChange: payload,
    createdAt: Date.now(),
    execute: () => sapApi.writeS8HOData('API_MATERIAL_DOCUMENT_SRV', 'A_MaterialDocumentHeader', 'POST', '', payload)
  };
}

// ---- Public dispatch API ----

export async function executeAutoMmAction(actionType: MmActionType, params: Record<string, any>): Promise<{ success: boolean; message: string; data?: any }> {
  switch (actionType) {
    case 'GENERATE_INVENTORY_REPORT': return executeGenerateInventoryReport(params.material, params.plant);
    case 'REPROCESS_PROCUREMENT_INTERFACES': return executeReprocessProcurementInterfaces();
    default: return { success: false, message: `${actionType} is not an AUTO action.` };
  }
}

export async function proposeSensitiveMmAction(actionType: MmActionType, params: Record<string, any>): Promise<MmActionProposal> {
  let proposal: MmActionProposal & { execute: () => Promise<any> };
  switch (actionType) {
    case 'CREATE_MATERIAL_MASTER':
      proposal = await proposeCreateMaterialMaster(params.material, params.description, params.materialType, params.baseUnit);
      break;
    case 'EXTEND_MATERIAL_TO_PLANT':
      proposal = await proposeExtendMaterialToPlant(params.material, params.plant);
      break;
    case 'CREATE_PURCHASE_REQUISITION':
      proposal = await proposeCreatePurchaseRequisition(params.material, params.quantity, params.plant);
      break;
    case 'CONVERT_PR_TO_PO':
      proposal = await proposeConvertPrToPo(params.prNumber, params.supplier);
      break;
    case 'CREATE_PURCHASE_ORDER':
      proposal = await proposeCreatePurchaseOrder(params.material, params.quantity, params.plant, params.supplier);
      break;
    case 'CHANGE_PURCHASE_ORDER':
      proposal = await proposeChangePurchaseOrder(params.poNumber, params.newQuantity);
      break;
    case 'CREATE_STOCK_TRANSFER_ORDER':
      proposal = await proposeCreateStockTransferOrder(params.material, params.quantity, params.supplyingPlant, params.receivingPlant);
      break;
    case 'PERFORM_GOODS_RECEIPT':
    case 'PERFORM_GOODS_ISSUE':
    case 'TRANSFER_STOCK_BETWEEN_PLANTS':
      proposal = await proposeGoodsMovement(actionType, params.material, params.quantity, params.plant, { poNumber: params.poNumber, storageLocation: params.storageLocation, targetPlant: params.targetPlant, costCenter: params.costCenter });
      break;
    default:
      throw new Error(`${actionType} is not a SENSITIVE action.`);
  }
  pendingProposals.set(proposal.proposalId, proposal);
  return proposal;
}

export async function decideMmActionProposal(proposalId: string, decision: 'approve' | 'reject'): Promise<{ success: boolean; message: string; data?: any }> {
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
