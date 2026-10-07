// VA01 "Create Standard Order" for the chat GUI screen: live value helps, live master-data checks and the live create
// through API_SALES_ORDER_SRV. Runs on the server only, so SAP credentials never reach the browser.
import { executeReadOnlySelect } from './hanaDbIntelligenceService';
import { sapApi } from './sapService';

type Row = Record<string, string>;
const lit = (s: string) => `'${String(s).replace(/'/g, "''")}'`;
const alphaCustomer = (id: string) => /^\d+$/.test(id) ? id.padStart(10, '0') : id.toUpperCase();
const alphaMaterial = (id: string) => /^\d+$/.test(id) ? id.padStart(18, '0') : id.toUpperCase();
const odataDate = (iso?: string) => (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso) ? `/Date(${Date.parse(`${iso}T00:00:00Z`)})/` : undefined);

async function sel(sql: string, max = 500): Promise<Row[]> {
  const r = await executeReadOnlySelect(sql, max);
  if ('error' in r) throw new Error(r.error);
  return r.rows.map((row: any) => Object.fromEntries(Object.entries(row).map(([k, v]) => [k, String(v ?? '').trim()])));
}

export async function getVa01ValueHelps() {
  const [areas, orgs, chans, divs, types, convs, dBlocks, bBlocks, terms, incos] = await Promise.all([
    sel('SELECT VKORG, VTWEG, SPART FROM TVTA', 2000),
    sel(`SELECT VKORG, VTEXT FROM TVKOT WHERE SPRAS = 'E'`),
    sel(`SELECT VTWEG, VTEXT FROM TVTWT WHERE SPRAS = 'E'`),
    sel(`SELECT SPART, VTEXT FROM TSPAT WHERE SPRAS = 'E'`),
    sel(`SELECT A~AUART, B~BEZEI FROM TVAK AS A INNER JOIN TVAKT AS B ON A~AUART = B~AUART WHERE B~SPRAS = 'E' AND A~VBTYP = 'C'`, 2000),
    // Order types are stored internally (e.g. TA) and entered in their language-dependent form (e.g. OR).
    sel(`SELECT AUART, AUART_SPR FROM TAUUM WHERE SPRAS = 'E'`, 2000),
    sel(`SELECT LIFSP, VTEXT FROM TVLST WHERE SPRAS = 'E'`),
    sel(`SELECT FAKSP, VTEXT FROM TVFST WHERE SPRAS = 'E'`),
    sel(`SELECT ZTERM, VTEXT FROM TVZBT WHERE SPRAS = 'E'`, 2000),
    sel(`SELECT INCO1, BEZEI FROM TINCT WHERE SPRAS = 'E'`)
  ]);
  const external = new Map(convs.map(c => [c.AUART, c.AUART_SPR]));
  types.forEach(t => { t.AUART = external.get(t.AUART) || t.AUART; });
  const t = (rows: Row[], k: string, v: string) => new Map(rows.map(r => [r[k], r[v]]));
  const orgT = t(orgs, 'VKORG', 'VTEXT'), chT = t(chans, 'VTWEG', 'VTEXT'), dvT = t(divs, 'SPART', 'VTEXT');
  const opt = (rows: Row[], k: string, v: string) => rows.filter(r => r[k]).map(r => ({ code: r[k], text: r[v] || '' })).sort((a, b) => a.code.localeCompare(b.code));
  return {
    salesAreas: areas.map(a => ({ salesOrg: a.VKORG, distChannel: a.VTWEG, division: a.SPART, text: [orgT.get(a.VKORG), chT.get(a.VTWEG), dvT.get(a.SPART)].filter(Boolean).join(' \u00b7 ') }))
      .sort((a, b) => `${a.salesOrg}${a.distChannel}${a.division}`.localeCompare(`${b.salesOrg}${b.distChannel}${b.division}`)),
    orderTypes: opt(types, 'AUART', 'BEZEI'),
    deliveryBlocks: opt(dBlocks, 'LIFSP', 'VTEXT'),
    billingBlocks: opt(bBlocks, 'FAKSP', 'VTEXT'),
    paymentTerms: opt(terms, 'ZTERM', 'VTEXT'),
    incoterms: opt(incos, 'INCO1', 'BEZEI')
  };
}

export async function checkVa01Entity(kind: string, id: string, salesOrg?: string, distChannel?: string, division?: string) {
  const area = salesOrg && distChannel && division;
  if (kind === 'customer') {
    const kunnr = alphaCustomer(id.trim());
    const [cust] = await sel(`SELECT KUNNR, NAME1, ORT01, LAND1 FROM KNA1 WHERE KUNNR = ${lit(kunnr)}`, 1);
    if (!cust) return { found: false, message: `Customer ${id} does not exist in the customer master (KNA1).` };
    const [sa] = area ? await sel(`SELECT ZTERM, INCO1, INCO2 FROM KNVV WHERE KUNNR = ${lit(kunnr)} AND VKORG = ${lit(salesOrg!)} AND VTWEG = ${lit(distChannel!)} AND SPART = ${lit(division!)}`, 1) : [];
    return {
      found: true, name: cust.NAME1, city: cust.ORT01, country: cust.LAND1,
      inSalesArea: area ? !!sa : null,
      paymentTerms: sa?.ZTERM || '', incoterms: sa?.INCO1 || '', incotermsLocation: sa?.INCO2 || '',
      message: area && !sa ? `Customer ${id} is not maintained for sales area ${salesOrg}/${distChannel}/${division} (KNVV).` : ''
    };
  }
  if (kind === 'material') {
    const matnr = alphaMaterial(id.trim());
    const [mat] = await sel(`SELECT A~MATNR, A~MEINS, B~MAKTX FROM MARA AS A LEFT OUTER JOIN MAKT AS B ON A~MATNR = B~MATNR AND B~SPRAS = 'E' WHERE A~MATNR = ${lit(matnr)}`, 1);
    if (!mat) return { found: false, message: `Material ${id} does not exist in the material master (MARA).` };
    const [sales] = salesOrg && distChannel ? await sel(`SELECT DWERK FROM MVKE WHERE MATNR = ${lit(matnr)} AND VKORG = ${lit(salesOrg)} AND VTWEG = ${lit(distChannel)}`, 1) : [];
    return {
      found: true, description: mat.MAKTX, unit: mat.MEINS,
      inSalesArea: salesOrg && distChannel ? !!sales : null, plant: sales?.DWERK || '',
      message: salesOrg && distChannel && !sales ? `Material ${id} is not maintained for sales org ${salesOrg} / channel ${distChannel} (MVKE).` : ''
    };
  }
  return { found: false, message: `Unknown check type "${kind}".` };
}

export interface Va01Input {
  orderType: string; salesOrg: string; distChannel: string; division: string;
  soldTo: string; shipTo?: string; custRef?: string; custRefDate?: string; reqDelivDate?: string;
  deliveryBlock?: string; billingBlock?: string; paymentTerms?: string; incoterms?: string; incotermsLocation?: string;
  items: { material: string; quantity: string | number; plant?: string }[];
}

export async function createVa01SalesOrder(input: Va01Input) {
  const missing: string[] = [];
  if (!input.orderType) missing.push('Order Type');
  if (!input.salesOrg || !input.distChannel || !input.division) missing.push('Sales Area');
  if (!input.soldTo?.trim()) missing.push('Sold-to Party');
  const items = (input.items || []).filter(i => String(i.material || '').trim());
  if (!items.length) missing.push('at least one item with a Material');
  if (items.some(i => !(Number(i.quantity) > 0))) missing.push('an Order Quantity greater than 0 for every item');
  if (missing.length) return { success: false, message: `Please fill in: ${missing.join(', ')}.` };

  const payload: Record<string, any> = {
    SalesOrderType: input.orderType,
    SalesOrganization: input.salesOrg,
    DistributionChannel: input.distChannel,
    OrganizationDivision: input.division,
    SoldToParty: input.soldTo.trim(),
    ...(input.custRef ? { PurchaseOrderByCustomer: input.custRef.trim() } : {}),
    ...(odataDate(input.custRefDate) ? { CustomerPurchaseOrderDate: odataDate(input.custRefDate) } : {}),
    ...(odataDate(input.reqDelivDate) ? { RequestedDeliveryDate: odataDate(input.reqDelivDate) } : {}),
    ...(input.deliveryBlock ? { DeliveryBlockReason: input.deliveryBlock } : {}),
    ...(input.billingBlock ? { HeaderBillingBlockReason: input.billingBlock } : {}),
    ...(input.paymentTerms ? { CustomerPaymentTerms: input.paymentTerms } : {}),
    ...(input.incoterms ? { IncotermsClassification: input.incoterms } : {}),
    ...(input.incotermsLocation ? { IncotermsLocation1: input.incotermsLocation.trim() } : {}),
    ...(input.shipTo?.trim() ? { to_Partner: [{ PartnerFunction: 'SH', Customer: input.shipTo.trim() }] } : {}),
    to_Item: items.map((i, idx) => ({
      SalesOrderItem: String((idx + 1) * 10),
      Material: String(i.material).trim(),
      RequestedQuantity: String(i.quantity),
      ...(i.plant?.trim() ? { ProductionPlant: i.plant.trim() } : {})
    }))
  };

  const res = await sapApi.writeS8HOData('API_SALES_ORDER_SRV', 'A_SalesOrder', 'POST', '', payload);
  if (!res?.success) return { success: false, message: `S/4HANA rejected the sales order: ${res?.error || 'unknown error'}. No order was created.`, payload };
  const salesOrder = String(res.data?.SalesOrder || '');
  if (!salesOrder) return { success: false, message: 'S/4HANA returned no sales order number, so the creation could not be confirmed.', payload };

  // Re-read the created order so the screen shows what S/4HANA actually stored (pricing, confirmation, status).
  const header = await sapApi.queryS8HOData('API_SALES_ORDER_SRV', 'A_SalesOrder', `$filter=SalesOrder eq '${salesOrder}'&$select=SalesOrder,SalesOrderType,SoldToParty,TotalNetAmount,TransactionCurrency,OverallSDProcessStatus,TotalCreditCheckStatus,DeliveryBlockReason,HeaderBillingBlockReason,RequestedDeliveryDate,CreatedByUser,CreationDate`);
  const lines = await sapApi.queryS8HOData('API_SALES_ORDER_SRV', 'A_SalesOrderItem', `$filter=SalesOrder eq '${salesOrder}'&$select=SalesOrderItem,Material,SalesOrderItemText,RequestedQuantity,RequestedQuantityUnit,ConfdDelivQtyInOrderQtyUnit,NetAmount,TransactionCurrency,SalesOrderItemCategory,ProductionPlant`);
  return {
    success: true,
    salesOrder,
    header: Array.isArray(header) ? header[0] || res.data : res.data,
    items: Array.isArray(lines) ? lines : [],
    message: `Standard Order ${salesOrder} has been saved in S/4HANA.`
  };
}
