// Cross-module live update agent: any field change on a released S/4HANA OData entity, validated against the live
// $metadata (entity set and property must be updatable), shown as current vs proposed, and written only after human approval.
import { sapApi } from './sapService';

export type UpdateTarget = { id: string; module: string; label: string; service: string; entitySet: string; synonyms: string };

// Entity sets confirmed updatable in this landscape's live $metadata (2026-10-03 probe); re-validated on every request.
export const UPDATE_TARGETS: UpdateTarget[] = [
  { id: 'SALES_ORDER', module: 'SD', label: 'Sales order (header)', service: 'API_SALES_ORDER_SRV', entitySet: 'A_SalesOrder', synonyms: 'sales order, SO, customer PO reference, requested delivery date, delivery block, billing block, incoterms, payment terms' },
  { id: 'SALES_ORDER_ITEM', module: 'SD', label: 'Sales order item', service: 'API_SALES_ORDER_SRV', entitySet: 'A_SalesOrderItem', synonyms: 'sales order item/line, order quantity, rejection reason, item plant, item delivery block' },
  { id: 'SALES_CONTRACT', module: 'SD', label: 'Sales contract', service: 'API_SALES_CONTRACT_SRV', entitySet: 'A_SalesContract', synonyms: 'sales contract, validity' },
  { id: 'OUTBOUND_DELIVERY', module: 'SD/LE', label: 'Outbound delivery (header)', service: 'API_OUTBOUND_DELIVERY_SRV', entitySet: 'A_OutbDeliveryHeader', synonyms: 'outbound delivery header, planned goods issue date, delivery date, loading date, bill of lading' },
  { id: 'OUTBOUND_DELIVERY_ITEM', module: 'SD/LE', label: 'Outbound delivery item', service: 'API_OUTBOUND_DELIVERY_SRV', entitySet: 'A_OutbDeliveryItem', synonyms: 'delivery item, delivery quantity, batch, storage location' },
  { id: 'BUSINESS_PARTNER', module: 'MDG/BP', label: 'Business partner', service: 'API_BUSINESS_PARTNER', entitySet: 'A_BusinessPartner', synonyms: 'business partner, BP, name, search term, blocked, language' },
  { id: 'CUSTOMER', module: 'SD/FI', label: 'Customer (general data)', service: 'API_BUSINESS_PARTNER', entitySet: 'A_Customer', synonyms: 'customer master, posting/order/delivery/billing block, customer account group' },
  { id: 'CUSTOMER_SALES_AREA', module: 'SD', label: 'Customer sales area data', service: 'API_BUSINESS_PARTNER', entitySet: 'A_CustomerSalesArea', synonyms: 'customer sales area, sales organization data, shipping condition, incoterms, payment terms, currency, customer group' },
  { id: 'SUPPLIER', module: 'MM/FI', label: 'Supplier (general data)', service: 'API_BUSINESS_PARTNER', entitySet: 'A_Supplier', synonyms: 'supplier, vendor, posting block, purchasing block' },
  { id: 'SUPPLIER_COMPANY', module: 'FI', label: 'Supplier company code data', service: 'API_BUSINESS_PARTNER', entitySet: 'A_SupplierCompany', synonyms: 'vendor company code, payment terms, payment block, reconciliation account, payment methods' },
  { id: 'PURCHASE_ORDER', module: 'MM', label: 'Purchase order (header)', service: 'API_PURCHASEORDER_PROCESS_SRV', entitySet: 'A_PurchaseOrder', synonyms: 'purchase order header, PO, payment terms, incoterms, supplier, purchasing group' },
  { id: 'PURCHASE_ORDER_ITEM', module: 'MM', label: 'Purchase order item', service: 'API_PURCHASEORDER_PROCESS_SRV', entitySet: 'A_PurchaseOrderItem', synonyms: 'PO item/line, order quantity, net price, plant, storage location, delivery completed' },
  { id: 'PURCHASE_REQUISITION_ITEM', module: 'MM', label: 'Purchase requisition item', service: 'API_PURCHASEREQ_PROCESS_SRV', entitySet: 'A_PurchaseRequisitionItem', synonyms: 'purchase requisition, PR item, requested quantity, delivery date, valuation price' },
  { id: 'PURCHASE_CONTRACT', module: 'MM', label: 'Purchase contract', service: 'API_PURCHASECONTRACT_PROCESS_SRV', entitySet: 'A_PurchaseContract', synonyms: 'purchase contract, outline agreement, validity end, target value' },
  { id: 'PRODUCT', module: 'MM/MDG', label: 'Product / material (general data)', service: 'API_PRODUCT_SRV', entitySet: 'A_Product', synonyms: 'material master, product, gross/net weight, material group, base unit, old material number' },
  { id: 'PRODUCT_PLANT', module: 'MM/PP', label: 'Product plant data', service: 'API_PRODUCT_SRV', entitySet: 'A_ProductPlant', synonyms: 'material plant data, MRP type, MRP controller, lot size, safety stock, purchasing group, profit center' },
  { id: 'PRODUCT_DESCRIPTION', module: 'MM/MDG', label: 'Product description', service: 'API_PRODUCT_SRV', entitySet: 'A_ProductDescription', synonyms: 'material description, product text' },
  { id: 'PRODUCT_SALES', module: 'SD', label: 'Product sales data', service: 'API_PRODUCT_SRV', entitySet: 'A_ProductSalesDelivery', synonyms: 'material sales org data, minimum order quantity, delivery unit, item category group' },
  { id: 'PRODUCTION_ORDER', module: 'PP', label: 'Production order', service: 'API_PRODUCTION_ORDER_2_SRV', entitySet: 'A_ProductionOrder_2', synonyms: 'production order, manufacturing order, scheduled start/end, order quantity' },
  { id: 'MAINTENANCE_NOTIFICATION', module: 'PM', label: 'Maintenance notification', service: 'API_MAINTNOTIFICATION', entitySet: 'MaintenanceNotification', synonyms: 'maintenance notification, PM notification, priority, description, reported by' },
  { id: 'MAINTENANCE_ORDER', module: 'PM', label: 'Maintenance order', service: 'API_MAINTENANCEORDER', entitySet: 'MaintenanceOrder', synonyms: 'maintenance order, PM order, priority, basic start/end date, description' },
  { id: 'EQUIPMENT', module: 'PM', label: 'Equipment', service: 'API_EQUIPMENT', entitySet: 'Equipment', synonyms: 'equipment master, equipment description, manufacturer, serial number' },
  // Read-only in this landscape's API (checked live each time); listed so such requests get an honest answer.
  { id: 'SUPPLIER_INVOICE', module: 'FI', label: 'Supplier invoice', service: 'API_SUPPLIERINVOICE_PROCESS_SRV', entitySet: 'A_SupplierInvoice', synonyms: 'supplier/vendor invoice, invoice amount, payment block of an invoice' },
  { id: 'BILLING_DOCUMENT', module: 'SD/FI', label: 'Billing document', service: 'API_BILLING_DOCUMENT_SRV', entitySet: 'A_BillingDocument', synonyms: 'billing document, customer invoice' },
  { id: 'GL_ACCOUNT', module: 'FI', label: 'G/L account', service: 'API_GLACCOUNTINCHARTOFACCOUNTS_SRV', entitySet: 'A_GLAccountInChartOfAccounts', synonyms: 'general ledger account, GL account' }
];

export type PropMeta = { name: string; type: string; label: string; maxLength?: number; updatable: boolean };
export type EntityMeta = { updatable: boolean; keys: PropMeta[]; props: PropMeta[] };

const metaCache = new Map<string, { at: number; meta: EntityMeta | { error: string } }>();

function authHeader(): string | null {
  const u = process.env.SAP_S8H_USER, p = process.env.SAP_S8H_PWD;
  return u && p ? `Basic ${Buffer.from(`${u}:${p}`).toString('base64')}` : null;
}

export async function fetchEntityMeta(t: UpdateTarget): Promise<EntityMeta | { error: string }> {
  const cacheKey = `${t.service}/${t.entitySet}`;
  const hit = metaCache.get(cacheKey);
  if (hit && Date.now() - hit.at < 30 * 60 * 1000) return hit.meta;
  const auth = authHeader();
  if (!auth) return { error: 'SAP S/4HANA credentials are not configured.' };
  let meta: EntityMeta | { error: string };
  try {
    const res = await fetch(`https://mmc-s4sap11.mmc.1stbasis.com:44300/sap/opu/odata/sap/${t.service}/$metadata?sap-client=100`, { headers: { Authorization: auth } });
    if (!res.ok) {
      meta = { error: `the SAP service ${t.service} is not available in this system (HTTP ${res.status})` };
    } else {
      const md = await res.text();
      const set = md.match(new RegExp(`<EntitySet Name="${t.entitySet}"[^>]*>`));
      const typeName = set?.[0].match(/EntityType="[^"]*\.([^".]+)"/)?.[1];
      const et = typeName ? md.match(new RegExp(`<EntityType Name="${typeName}"[\\s\\S]*?</EntityType>`))?.[0] : undefined;
      if (!set || !et) {
        meta = { error: `entity ${t.entitySet} was not found in ${t.service}` };
      } else {
        const keyNames = [...(et.match(/<Key>[\s\S]*?<\/Key>/)?.[0] || '').matchAll(/Name="([^"]+)"/g)].map(m => m[1]);
        const props: PropMeta[] = [...et.matchAll(/<Property [^>]*>/g)].map(m => {
          const p = m[0];
          const attr = (a: string) => p.match(new RegExp(`${a}="([^"]*)"`))?.[1];
          return { name: attr('Name') || '', type: attr('Type') || '', label: attr('sap:label') || '', maxLength: attr('MaxLength') ? Number(attr('MaxLength')) : undefined, updatable: !/sap:updatable="false"/.test(p) };
        });
        meta = { updatable: !/sap:updatable="false"/.test(set[0]), keys: props.filter(p => keyNames.includes(p.name)), props: props.filter(p => !keyNames.includes(p.name)) };
      }
    }
  } catch (e: any) {
    meta = { error: e?.message || String(e) };
  }
  metaCache.set(cacheKey, { at: Date.now(), meta });
  return meta;
}

const odataDate = (v: any) => {
  const m = /\/Date\((-?\d+)/.exec(String(v || ''));
  return m ? new Date(Number(m[1])).toISOString().slice(0, 10) : v;
};

// Converts a user-supplied value to the OData V2 JSON representation of the property's Edm type.
export function toODataValue(prop: PropMeta, raw: string): { value?: any; error?: string } {
  const v = String(raw ?? '').trim();
  switch (prop.type) {
    case 'Edm.Decimal': case 'Edm.Double': case 'Edm.Single': {
      const num = Number(v.replace(/,/g, ''));
      return Number.isFinite(num) ? { value: prop.type === 'Edm.Decimal' ? String(num) : num } : { error: `"${v}" is not a number` };
    }
    case 'Edm.Int16': case 'Edm.Int32': case 'Edm.Int64': case 'Edm.Byte': case 'Edm.SByte': {
      const num = Number(v);
      return Number.isInteger(num) ? { value: prop.type === 'Edm.Int64' ? String(num) : num } : { error: `"${v}" is not a whole number` };
    }
    case 'Edm.Boolean': {
      if (/^(true|yes|x|1|on|set)$/i.test(v)) return { value: true };
      if (/^(false|no|0|off|blank|clear|none|'')$/i.test(v) || v === '') return { value: false };
      return { error: `"${v}" is not yes/no` };
    }
    case 'Edm.DateTime': {
      const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(v) ? `${v}T00:00:00Z` : v);
      return isNaN(d.getTime()) ? { error: `"${v}" is not a date` } : { value: `/Date(${Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())})/` };
    }
    case 'Edm.DateTimeOffset': {
      const d = new Date(v);
      return isNaN(d.getTime()) ? { error: `"${v}" is not a date/time` } : { value: d.toISOString() };
    }
    case 'Edm.Time': {
      const m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(v);
      return m ? { value: `PT${m[1].padStart(2, '0')}H${m[2]}M${(m[3] || '00')}S` } : { error: `"${v}" is not a time (HH:MM)` };
    }
    default: {
      const s = /^(blank|clear|none|empty|remove)$/i.test(v) ? '' : v;
      if (prop.maxLength && s.length > prop.maxLength) return { error: `"${s}" is longer than ${prop.maxLength} characters` };
      return { value: s };
    }
  }
}

// Finds the live record by its key values (as given, then zero-padded for numeric keys) and returns its exact key predicate.
export async function readLiveRecord(t: UpdateTarget, meta: EntityMeta, keyValues: Record<string, string>): Promise<{ record: any; keyPredicate: string } | { error: string }> {
  const keys = meta.keys.filter(k => keyValues[k.name] !== undefined && String(keyValues[k.name]).trim() !== '');
  if (!keys.length) return { error: `please name the ${meta.keys.map(k => k.label || k.name).join(' and ')}` };
  const variants = (k: PropMeta) => {
    const v = String(keyValues[k.name]).trim().replace(/'/g, "''");
    const out = [v];
    if (/^\d+$/.test(v) && k.maxLength && v.length < k.maxLength) out.push(v.padStart(k.maxLength, '0'));
    return out;
  };
  const combos = keys.reduce<string[][]>((acc, k) => acc.flatMap(a => variants(k).map(v => [...a, `${k.name} eq '${v}'`])), [[]]);
  for (const combo of combos) {
    const res = await sapApi.queryS8HOData(t.service, t.entitySet, `$filter=${combo.join(' and ')}&$top=5`);
    if (res?.error) return { error: String(res.error) };
    if (Array.isArray(res) && res.length) {
      const record = res.length > 1 && res[0].ValidityEndDate !== undefined
        ? [...res].sort((a: any, b: any) => String(b.ValidityEndDate).localeCompare(String(a.ValidityEndDate)))[0]
        : res[0];
      if (res.length > 1 && keys.length < meta.keys.length && record.ValidityEndDate === undefined) {
        return { error: `more than one ${t.label} matches; please also name the ${meta.keys.filter(k => !keys.includes(k)).map(k => k.label || k.name).join(' and ')}` };
      }
      const uri = String(record?.__metadata?.uri || record?.__metadata?.id || '');
      const keyPredicate = uri.slice(uri.lastIndexOf('(') + 1, uri.lastIndexOf(')'));
      if (!keyPredicate) return { error: 'the record key could not be read from the live response' };
      return { record, keyPredicate };
    }
  }
  return { error: `no ${t.label} ${keys.map(k => String(keyValues[k.name])).join(' / ')} exists in the live system` };
}

export interface LiveUpdateProposal {
  proposalId: string;
  actionType: string;
  title: string;
  targetId: string;
  currentState: Record<string, any>;
  proposedChange: Record<string, any>;
  createdAt: number;
}

const pending = new Map<string, LiveUpdateProposal & { target: UpdateTarget; keyPredicate: string; payload: Record<string, any> }>();

export function registerLiveUpdateProposal(target: UpdateTarget, keyPredicate: string, record: any, changes: { prop: PropMeta; value: any; display: string }[]): LiveUpdateProposal {
  const proposalId = `PROP-UPD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const label = (p: PropMeta) => `${p.label || p.name} (${p.name})`;
  const proposal = {
    proposalId,
    actionType: `UPDATE_${target.id}`,
    title: `Update ${target.label} [${target.module}]`,
    targetId: `${target.entitySet}(${keyPredicate})`,
    currentState: Object.fromEntries(changes.map(c => [label(c.prop), odataDate(record[c.prop.name]) ?? '(empty)'])),
    proposedChange: Object.fromEntries(changes.map(c => [label(c.prop), c.display])),
    createdAt: Date.now(),
    target, keyPredicate,
    payload: Object.fromEntries(changes.map(c => [c.prop.name, c.value]))
  };
  pending.set(proposalId, proposal);
  const { target: _t, keyPredicate: _k, payload: _p, ...publicPart } = proposal;
  return publicPart;
}

export async function decideLiveUpdateProposal(proposalId: string, decision: 'approve' | 'reject'): Promise<{ success: boolean; message: string; data?: any }> {
  const p = pending.get(proposalId);
  if (!p) return { success: false, message: `Proposal ${proposalId} not found or already decided.` };
  pending.delete(proposalId);
  if (decision === 'reject') return { success: true, message: `Rejected: ${p.title} on ${p.targetId}. No change was made in SAP.` };
  const result = await sapApi.writeS8HOData(p.target.service, p.target.entitySet, 'PATCH', p.keyPredicate, p.payload);
  if (result?.success === false || result?.error) {
    return { success: false, message: `SAP S/4HANA rejected the update of ${p.target.label} ${p.keyPredicate}: ${result?.error || 'unknown error'}. Nothing was changed.`, data: result };
  }
  const check = await sapApi.queryS8HOData(p.target.service, `${p.target.entitySet}(${p.keyPredicate})`, '');
  const after = check && !check.error ? (Array.isArray(check) ? check[0] : check) : null;
  const confirmed = after ? Object.keys(p.payload).map(k => `${k} = ${odataDate(after[k])}`).join(', ') : '';
  return { success: true, message: `Approved and executed live on S/4HANA (client 100): ${p.title} ${p.keyPredicate} updated.${confirmed ? ` Read back from SAP: ${confirmed}.` : ''}`, data: result };
}
