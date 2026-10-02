// Live SAP TM answers read from the embedded S/4HANA TM tables (freight units/orders, stops, execution events,
// items, charges, settlements, locations, rates) via read-only ADT SQL. Nothing is simulated: empty tables are
// reported as such and every status text, unit factor and currency precision is read live from the dictionary.
import { executeReadOnlySelect } from './hanaDbIntelligenceService';

export type TmIntent =
  | 'FU_TODAY' | 'FU_UNPLANNED' | 'SHIP_TODAY' | 'TO_DELAYED' | 'NO_CARRIER' | 'MISSING_EQUIP' | 'FO_BY_LOC' | 'AT_RISK' | 'WORKLOAD' | 'ISSUES'
  | 'CARRIER_BEST' | 'CARRIER_DELAY_RATE' | 'CARRIER_COMPARE' | 'CARRIER_FOR_SHIPMENT' | 'CARRIER_CAPACITY' | 'CARRIER_REJECT' | 'CARRIER_ACCEPT' | 'CARRIER_LATE' | 'CLAIMS' | 'ALT_CARRIER'
  | 'COST_TODAY' | 'LANE_COST' | 'PLAN_VS_ACTUAL' | 'RATE_INCREASE' | 'SPEND_CARRIER' | 'SPEND_LANE' | 'COST_EXCEEDED' | 'SAVINGS' | 'ACCESSORIAL' | 'SPEND_FORECAST'
  | 'NOT_DEPARTED' | 'TRUCKS_LATE' | 'IN_TRANSIT' | 'MISSED_PICKUP' | 'EXEC_EXCEPTIONS' | 'WAITING_DOCK' | 'POD' | 'DETENTION' | 'CUSTOMERS_AFFECTED'
  | 'BEST_ROUTE' | 'CONSOLIDATE' | 'UNDERUTILIZED' | 'TRAILER_UTIL' | 'LANES_CONSOLIDATE' | 'EMPTY_MILES' | 'WH_DELAYS' | 'CAPACITY_SHORTAGE' | 'OPTIMAL_PLAN' | 'REDUCE_COST';

export type TmSection = { title: string; summaryStats?: { label: string; value: string }[]; columns: { key: string; label: string }[]; rows: Record<string, string | number>[]; note?: string };
export type TmLiveReport = { text: string; sections: TmSection[]; assess: boolean; persona?: string };

export function classifyTmLiveIntent(n: string): TmIntent | null {
  const has = (...w: string[]) => w.some(x => n.includes(x));
  const shipment = has('shipment');
  const carrier = has('carrier');
  if (has('freight unit') && has('created today', 'today')) return 'FU_TODAY';
  if (has('freight unit') && has('not yet planned', 'unplanned', 'not planned')) return 'FU_UNPLANNED';
  if (shipment && has('scheduled for today', 'scheduled today')) return 'SHIP_TODAY';
  if (has('transportation order', 'freight order') && has('delayed')) return 'TO_DELAYED';
  if (has('not assigned to a carrier', 'without a carrier', 'no carrier assigned')) return 'NO_CARRIER';
  if ((shipment || has('freight order')) && has('missing equipment', 'without equipment')) return 'MISSING_EQUIP';
  if (has('freight order') && has('by plant', 'shipping point', 'by region')) return 'FO_BY_LOC';
  if (shipment && has('at risk') && has('deliver')) return 'AT_RISK';
  if (has('transportation workload')) return 'WORKLOAD';
  if (has('transportation issues', 'transportation problems')) return 'ISSUES';
  if (carrier && has('performing best', 'best performing', 'best-performing')) return 'CARRIER_BEST';
  if (carrier && has('delay rate')) return 'CARRIER_DELAY_RATE';
  if (has('compare carriers')) return 'CARRIER_COMPARE';
  if (has('which carrier should', 'carrier should we use')) return 'CARRIER_FOR_SHIPMENT';
  if (carrier && has('available capacity')) return 'CARRIER_CAPACITY';
  if (carrier && has('rejecting tender', 'reject tender', 'tender rejection')) return 'CARRIER_REJECT';
  if (carrier && has('acceptance rate')) return 'CARRIER_ACCEPT';
  if (carrier && has('consistently late')) return 'CARRIER_LATE';
  if (has('freight claim')) return 'CLAIMS';
  if (has('alternate carrier', 'alternative carrier')) return 'ALT_CARRIER';
  if (has('transportation cost', 'freight cost') && has('today')) return 'COST_TODAY';
  if (has('lanes') && has('highest freight cost')) return 'LANE_COST';
  if (has('planned freight cost')) return 'PLAN_VS_ACTUAL';
  if (carrier && has('increased rates', 'rate increase')) return 'RATE_INCREASE';
  if (has('transportation spend by carrier', 'freight spend by carrier')) return 'SPEND_CARRIER';
  if (has('transportation spend by lane', 'freight spend by lane')) return 'SPEND_LANE';
  if (shipment && has('exceeded expected freight cost')) return 'COST_EXCEEDED';
  if (has('freight cost-saving', 'freight cost saving')) return 'SAVINGS';
  if (has('accessorial')) return 'ACCESSORIAL';
  if (has('forecast') && has('transportation spend', 'freight spend')) return 'SPEND_FORECAST';
  if (shipment && has('not departed')) return 'NOT_DEPARTED';
  if (has('truck') && has('late arriving')) return 'TRUCKS_LATE';
  if (shipment && has('in transit')) return 'IN_TRANSIT';
  if (has('missed pickup', 'missed pick-up')) return 'MISSED_PICKUP';
  if (has('freight order') && has('execution exception')) return 'EXEC_EXCEPTIONS';
  if (shipment && has('waiting at the dock')) return 'WAITING_DOCK';
  if (has('proof-of-delivery', 'proof of delivery')) return 'POD';
  if (has('detention', 'demurrage')) return 'DETENTION';
  if (has('customers') && has('affected by transportation')) return 'CUSTOMERS_AFFECTED';
  if (has('best route')) return 'BEST_ROUTE';
  if (has('consolidate these deliveries', 'consolidate deliveries')) return 'CONSOLIDATE';
  if (has('loads') && has('underutilized', 'under-utilized')) return 'UNDERUTILIZED';
  if (has('trailer utilization')) return 'TRAILER_UTIL';
  if (has('lanes') && has('consolidated', 'consolidate')) return 'LANES_CONSOLIDATE';
  if (has('empty miles')) return 'EMPTY_MILES';
  if (has('warehouses') && has('transportation delay')) return 'WH_DELAYS';
  if (has('transportation capacity shortage')) return 'CAPACITY_SHORTAGE';
  if (has('optimal transportation plan')) return 'OPTIMAL_PLAN';
  if (has('reduce logistics cost')) return 'REDUCE_COST';
  return null;
}

// ---------- helpers ----------
type Q = { rows: Record<string, string>[]; total: number; error?: string };
async function q(sql: string, maxRows = 3000): Promise<Q> {
  const r: any = await executeReadOnlySelect(sql, maxRows);
  if ('error' in r) return { rows: [], total: 0, error: r.error };
  return { rows: r.rows.map((row: any) => Object.fromEntries(Object.entries(row).map(([k, v]) => [k, String(v ?? '').trim()]))), total: r.totalRows ?? r.rowCount };
}
const num = (v: any) => { const s = String(v ?? '').trim(); const neg = s.endsWith('-'); const x = Number(s.replace(/-$/, '')) || 0; return neg ? -x : x; };
const strip = (id: string) => (id || '').replace(/^0+(?=.)/, '');
const cols = (...pairs: [string, string][]) => pairs.map(([key, label]) => ({ key, label }));
const money = (v: number) => v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmt1 = (v: number) => (Math.round(v * 10) / 10).toLocaleString('en-US');
const dur = (h: number) => Math.abs(h) >= 48 ? `${fmt1(h / 24)} days` : `${fmt1(h)} h`;
const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 1000) / 10}%` : 'n/a');
const tsMs = (t: string) => /^\d{14}$/.test(t || '') && !t.startsWith('0000') ? Date.UTC(+t.slice(0, 4), +t.slice(4, 6) - 1, +t.slice(6, 8), +t.slice(8, 10), +t.slice(10, 12), +t.slice(12, 14)) : null;
const HOUR = 3600000;
const median = (a: number[]) => { if (!a.length) return 0; const s = [...a].sort((x, y) => x - y); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const errNote = (...errs: (string | undefined)[]) => errs.filter(Boolean).map(e => `Live read error: ${e}`).join(' ');

type Tor = {
  key: string; id: string; cat: string; type: string; lc: string; plan: string; exec: string; dlv: string; conf: string; tsp: string; shipper: string; consignee: string;
  mtr: string; weiKg: number; capKg: number; vol: number; volCap: number; util: number; utilMass: number; utilVol: number; created: number | null; blkPlan: string; blkExec: string;
  distKm: number; emptyKm: number; baseId: string; baseTco: string; invBlock: string;
};
type Stop = { key: string; parent: string; seq: string; cat: string; loc: string; plan: number | null; reqEnd: number | null; appt: number | null; door: string };
type Ev = { parent: string; stop: string; code: string; at: number | null; reason: string; discrepancy: string; loc: string; revoked: string };
type Item = { parent: string; cat: string; fuRoot: string; resId: string; plate: string; mtr: string; plant: string; damaged: string };

async function loadTm() {
  const [sys, roots, stops, evs, items, chg, chgEl, sf, sfDoc, texts, locs, units, curDec, amtDec, tcet, dlv, pdstkTxt, tenders, alloc, sfItm] = await Promise.all([
    q('SELECT DISTINCT @sy-datum AS D, @sy-uzeit AS T FROM T000', 1),
    q(`SELECT DB_KEY, TOR_ID, TOR_CAT, TOR_TYPE, LIFECYCLE, PLAN_STATUS_ROOT, EXECUTION, DELIVERY, CONFIRMATION, TSPID, SHIPPERID, CONSIGNEEID, MTR,
 GRO_WEI_VAL, GRO_WEI_UNI, GRO_WEI_VALCAP, GRO_WEI_UNICAP, GRO_VOL_VAL, GRO_VOL_UNI, GRO_VOL_VALCAP, GRO_VOL_UNICAP, MAX_UTIL, MAX_UTIL_MASS, MAX_UTIL_VOLUME,
 CREATED_ON, BLK_PLAN, BLK_EXEC, TOTAL_DISTANCE_KM, TOTAL_EMPTY_MILE_DIST_KM, BASE_BTD_ID, BASE_BTD_TCO, INV_BLOCK FROM /SCMTMS/D_TORROT`),
    q('SELECT DB_KEY, PARENT_KEY, STOP_SEQ_POS, STOP_CAT, LOG_LOCID, PLAN_TRANS_TIME, ASSGN_START, REQ_START, REQ_END, APPOINTMENT_START, WH_DOOR FROM /SCMTMS/D_TORSTP'),
    q('SELECT PARENT_KEY, TORSTOPUUID, EVENT_CODE, ACTUAL_DATE, EVENT_REASON_CODE, DISCREPANCY, EXT_LOC_ID, EVENT_REVOKED FROM /SCMTMS/D_TOREXE'),
    q('SELECT PARENT_KEY, ITEM_CAT, FU_ROOT_KEY, RES_ID, PLATENUMBER, MTR, ERP_PLANT_ID, DAMAGED FROM /SCMTMS/D_TORITE'),
    q('SELECT DB_KEY, HOST_KEY, NET_AMOUNT, DOC_CURRENCY, CALC_STATUS FROM /SCMTMS/D_TCHRGR'),
    q('SELECT c~HOST_KEY, e~TCET084, e~AMOUNT, e~CURRCODE016 FROM /SCMTMS/D_TCHRGE AS e INNER JOIN /SCMTMS/D_TCHRGR AS c ON c~DB_KEY = e~ROOT_KEY'),
    q('SELECT DB_KEY, SFIR_ID, TSP_ID, LIFECYCLE, NET_INV_AMOUNT, INV_AMOUNT_CURR, CREATED_ON, BLOCK, INVDISP_RES_STATUS FROM /SCMTMS/D_SF_ROT'),
    q('SELECT PARENT_KEY, BTD_ID, BTD_TCO FROM /SCMTMS/D_SF_DOC'),
    q(`SELECT DOMNAME, DOMVALUE_L, DDTEXT FROM DD07T WHERE DDLANGUAGE = 'E'
 AND DOMNAME IN ('/SCMTMS/TOR_LC_STATUS','/SCMTMS/TOR_EXECUTION_STATUS','/SCMTMS/TOR_CONFIRM_STATUS','/SCMTMS/TOR_PLN_STATUS','/SCMTMS/DELIVERY_STATUS','/SAPAPO/C_LOCTYPE',
 '/SCMTMS/BLOCK_STATUS','/SCMTMS/SFIR_LC_STATUS','/SCMTMS/INV_DISPUTE_RES_STATUS')`, 500),
    q('SELECT l~LOCNO, l~LOCTYPE, a~NAME1, a~CITY1, a~REGION, a~COUNTRY FROM /SAPAPO/LOC AS l LEFT OUTER JOIN ADRC AS a ON a~ADDRNUMBER = l~ADRNUMMER'),
    q('SELECT MSEHI, ZAEHL, NENNR, EXP10 FROM T006 WHERE DIMID IN ( SELECT DIMID FROM T006 WHERE MSEHI = \'KG\' )', 500),
    q('SELECT CURRKEY, CURRDEC FROM TCURX', 500),
    q(`SELECT TABNAME, FIELDNAME, DECIMALS FROM DD03L WHERE AS4LOCAL = 'A'
 AND ( ( TABNAME = '/SCMTMS/D_TCHRGR' AND FIELDNAME = 'NET_AMOUNT' ) OR ( TABNAME = '/SCMTMS/D_TCHRGE' AND FIELDNAME = 'AMOUNT' )
 OR ( TABNAME = '/SCMTMS/D_SF_ROT' AND FIELDNAME = 'NET_INV_AMOUNT' ) )`, 10),
    q('SELECT TCET084, LEAD_CHRG_TYPE FROM /SCMTMS/C_TCET', 500),
    q(`SELECT r~DB_KEY, k~VBELN, k~LFDAT, k~WADAT, k~WADAT_IST, k~KUNNR, k~VSTEL, k~PDSTK FROM /SCMTMS/D_TORROT AS r
 INNER JOIN LIKP AS k ON k~VBELN = substring( r~BASE_BTD_ID, 26, 10 ) WHERE r~TOR_CAT = 'FU'`),
    q(`SELECT t~DOMVALUE_L, t~DDTEXT FROM DD03L AS f INNER JOIN DD07T AS t ON t~DOMNAME = f~DOMNAME
 WHERE f~TABNAME = 'LIKP' AND f~FIELDNAME = 'PDSTK' AND t~DDLANGUAGE = 'E'`, 50),
    q('SELECT COUNT( * ) AS N FROM /SCMTMS/D_TORTEN', 1),
    q('SELECT COUNT( * ) AS N FROM /SCMTMS/D_TORALC', 1),
    q('SELECT PARENT_KEY, TOR_ROOT_KEY, DISPUTED, IS_CANCELLED FROM /SCMTMS/D_SF_ITM')
  ]);
  const sysD = sys.rows[0]?.D || '';
  const sysT = sys.rows[0]?.T || '000000';
  const nowMs = Date.now();
  const sysLocal = /^\d{8}$/.test(sysD) ? Date.UTC(+sysD.slice(0, 4), +sysD.slice(4, 6) - 1, +sysD.slice(6, 8), +sysT.slice(0, 2), +sysT.slice(2, 4), +sysT.slice(4, 6)) : nowMs;
  // System time zone offset derived from the live system clock (rounded to 15 minutes).
  const offMs = Math.round((sysLocal - nowMs) / 900000) * 900000;
  const localDay = (ms: number | null) => { if (ms == null) return ''; const d = new Date(ms + offMs); return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`; };
  const show = (ms: number | null) => { if (ms == null) return ''; const d = new Date(ms + offMs).toISOString(); return `${d.slice(0, 10)} ${d.slice(11, 16)}`; };
  const dayShift = (d: string, k: number) => { const x = new Date(Date.UTC(+d.slice(0, 4), +d.slice(4, 6) - 1, +d.slice(6, 8) + k)); return `${x.getUTCFullYear()}${String(x.getUTCMonth() + 1).padStart(2, '0')}${String(x.getUTCDate()).padStart(2, '0')}`; };
  const showDay = (d: string) => /^\d{8}$/.test(d) && d !== '00000000' ? `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}` : '';

  const txt = new Map<string, string>();
  texts.rows.forEach(r => txt.set(`${r.DOMNAME}|${r.DOMVALUE_L}`, r.DDTEXT));
  const t = (dom: string, v: string) => txt.get(`/SCMTMS/${dom}|${v}`) || v || '';
  const unitKg = new Map<string, number>();
  units.rows.forEach(u => unitKg.set(u.MSEHI, (num(u.ZAEHL) / (num(u.NENNR) || 1)) * Math.pow(10, num(u.EXP10))));
  const kg = (v: string, u: string) => num(v) * (unitKg.get(u) ?? 0);
  const curDecimals = new Map(curDec.rows.map(r => [r.CURRKEY, num(r.CURRDEC)] as [string, number]));
  const fieldDec = new Map(amtDec.rows.map(r => [`${r.TABNAME}.${r.FIELDNAME}`, num(r.DECIMALS)] as [string, number]));
  // CURR fields are stored with the dictionary precision; the real amount depends on the currency's decimals (TCURX, default 2).
  const amount = (field: string, v: string, cur: string) => num(v) * Math.pow(10, (fieldDec.get(field) ?? 2) - (curDecimals.get(cur) ?? 2));

  const tors: Tor[] = roots.rows.map(r => ({
    key: r.DB_KEY, id: strip(r.TOR_ID), cat: r.TOR_CAT, type: r.TOR_TYPE, lc: r.LIFECYCLE, plan: r.PLAN_STATUS_ROOT, exec: r.EXECUTION, dlv: r.DELIVERY, conf: r.CONFIRMATION,
    tsp: r.TSPID, shipper: r.SHIPPERID, consignee: r.CONSIGNEEID, mtr: r.MTR, weiKg: kg(r.GRO_WEI_VAL, r.GRO_WEI_UNI), capKg: kg(r.GRO_WEI_VALCAP, r.GRO_WEI_UNICAP),
    vol: num(r.GRO_VOL_VAL), volCap: r.GRO_VOL_UNI === r.GRO_VOL_UNICAP ? num(r.GRO_VOL_VALCAP) : 0, util: num(r.MAX_UTIL), utilMass: num(r.MAX_UTIL_MASS), utilVol: num(r.MAX_UTIL_VOLUME),
    created: tsMs(r.CREATED_ON), blkPlan: r.BLK_PLAN, blkExec: r.BLK_EXEC, distKm: num(r.TOTAL_DISTANCE_KM), emptyKm: num(r.TOTAL_EMPTY_MILE_DIST_KM), baseId: strip(r.BASE_BTD_ID), baseTco: r.BASE_BTD_TCO, invBlock: r.INV_BLOCK
  }));
  const byKey = new Map(tors.map(x => [x.key, x]));
  const stopList: Stop[] = stops.rows.map(s => ({ key: s.DB_KEY, parent: s.PARENT_KEY, seq: s.STOP_SEQ_POS, cat: s.STOP_CAT, loc: s.LOG_LOCID, plan: tsMs(s.PLAN_TRANS_TIME) ?? tsMs(s.ASSGN_START) ?? tsMs(s.REQ_START), reqEnd: tsMs(s.REQ_END), appt: tsMs(s.APPOINTMENT_START), door: s.WH_DOOR }));
  const stopsOf = new Map<string, Stop[]>();
  stopList.forEach(s => { const a = stopsOf.get(s.parent) || []; a.push(s); stopsOf.set(s.parent, a); });
  const evList: Ev[] = evs.rows.map(e => ({ parent: e.PARENT_KEY, stop: e.TORSTOPUUID, code: e.EVENT_CODE, at: tsMs(e.ACTUAL_DATE), reason: e.EVENT_REASON_CODE, discrepancy: e.DISCREPANCY, loc: e.EXT_LOC_ID, revoked: e.EVENT_REVOKED }));
  const evOf = new Map<string, Ev[]>();
  evList.forEach(e => { const a = evOf.get(e.parent) || []; a.push(e); evOf.set(e.parent, a); });
  const itemList: Item[] = items.rows.map(i => ({ parent: i.PARENT_KEY, cat: i.ITEM_CAT, fuRoot: i.FU_ROOT_KEY, resId: i.RES_ID, plate: i.PLATENUMBER, mtr: i.MTR, plant: i.ERP_PLANT_ID, damaged: i.DAMAGED }));
  const itemsOf = new Map<string, Item[]>();
  itemList.forEach(i => { const a = itemsOf.get(i.parent) || []; a.push(i); itemsOf.set(i.parent, a); });
  const foOfFu = new Map<string, string>();
  // A freight unit is assigned to a freight order when an item of the order points to the unit's root.
  itemList.filter(i => i.fuRoot && i.fuRoot !== i.parent && byKey.get(i.parent)?.cat !== 'FU' && byKey.get(i.fuRoot)?.cat === 'FU').forEach(i => foOfFu.set(i.fuRoot, i.parent));

  const leadTypes = new Set(tcet.rows.filter(r => r.LEAD_CHRG_TYPE === 'X').map(r => r.TCET084));
  const chargeOf = new Map<string, { amt: number; cur: string; calc: string }>();
  chg.rows.forEach(c => { const e = chargeOf.get(c.HOST_KEY) || { amt: 0, cur: c.DOC_CURRENCY, calc: c.CALC_STATUS }; e.amt += amount('/SCMTMS/D_TCHRGR.NET_AMOUNT', c.NET_AMOUNT, c.DOC_CURRENCY); chargeOf.set(c.HOST_KEY, e); });
  const elements = chgEl.rows.map(e => ({ host: e.HOST_KEY, type: e.TCET084, amt: amount('/SCMTMS/D_TCHRGE.AMOUNT', e.AMOUNT, e.CURRCODE016), cur: e.CURRCODE016 }));
  const sfDocs = new Map<string, { btd: string; tco: string }[]>();
  sfDoc.rows.forEach(d => { const a = sfDocs.get(d.PARENT_KEY) || []; a.push({ btd: strip(d.BTD_ID), tco: d.BTD_TCO }); sfDocs.set(d.PARENT_KEY, a); });
  const sfTors = new Map<string, { tors: Set<string>; disputed: number }>();
  sfItm.rows.filter(i => i.IS_CANCELLED !== 'X').forEach(i => { const e = sfTors.get(i.PARENT_KEY) || { tors: new Set<string>(), disputed: 0 }; if (byKey.has(i.TOR_ROOT_KEY)) e.tors.add(i.TOR_ROOT_KEY); if (i.DISPUTED === 'X') e.disputed++; sfTors.set(i.PARENT_KEY, e); });
  const settlements = sf.rows.map(s => ({ id: strip(s.SFIR_ID), tsp: s.TSP_ID, lc: t('SFIR_LC_STATUS', s.LIFECYCLE), amt: amount('/SCMTMS/D_SF_ROT.NET_INV_AMOUNT', s.NET_INV_AMOUNT, s.INV_AMOUNT_CURR), cur: s.INV_AMOUNT_CURR, created: tsMs(s.CREATED_ON),
    tors: [...(sfTors.get(s.DB_KEY)?.tors || [])], disputedItems: sfTors.get(s.DB_KEY)?.disputed || 0,
    block: s.BLOCK && !/not blocked/i.test(t('BLOCK_STATUS', s.BLOCK)) ? t('BLOCK_STATUS', s.BLOCK) : '', dispute: s.INVDISP_RES_STATUS ? t('INV_DISPUTE_RES_STATUS', s.INVDISP_RES_STATUS) : '', docs: sfDocs.get(s.DB_KEY) || [] }));

  const locMap = new Map<string, { type: string; name: string; city: string; region: string; country: string }>();
  locs.rows.forEach(l => { if (!locMap.has(l.LOCNO)) locMap.set(l.LOCNO, { type: txt.get(`/SAPAPO/C_LOCTYPE|${l.LOCTYPE}`) || l.LOCTYPE, name: l.NAME1, city: l.CITY1, region: l.REGION, country: l.COUNTRY }); });
  const locLabel = (id: string) => { const l = locMap.get(id); if (!id) return ''; if (!l) return id; const place = [l.city, l.region, l.country].filter(Boolean).join(', '); return `${id}${l.name ? ` ${l.name}` : ''}${place ? ` (${place})` : ''}`; };

  const dlvOf = new Map<string, Record<string, string>>();
  dlv.rows.forEach(d => dlvOf.set(d.DB_KEY, d));

  const bpIds = [...new Set(tors.flatMap(x => [x.tsp, x.consignee, x.shipper]).concat(settlements.map(s => s.tsp)).concat(dlv.rows.map(d => d.KUNNR)).filter(Boolean))];
  const bpNames = new Map<string, string>();
  for (let i = 0; i < bpIds.length; i += 150) {
    const r = await q(`SELECT PARTNER, NAME_ORG1, NAME_FIRST, NAME_LAST FROM BUT000 WHERE PARTNER IN ( ${bpIds.slice(i, i + 150).map(v => `'${v.replace(/'/g, "''")}'`).join(', ')} )`, 300);
    r.rows.forEach(b => bpNames.set(b.PARTNER, b.NAME_ORG1 || `${b.NAME_FIRST} ${b.NAME_LAST}`.trim()));
  }
  const bp = (id: string) => id ? `${strip(id)}${bpNames.get(id) ? ` ${bpNames.get(id)}` : ''}` : '';

  const lcText = (x: Tor) => t('TOR_LC_STATUS', x.lc);
  const isClosed = (x: Tor) => /complet|cancel/i.test(lcText(x));
  const isCanceled = (x: Tor) => /cancel/i.test(lcText(x)) || /cancel/i.test(t('TOR_EXECUTION_STATUS', x.exec));
  const firstStop = (x: Tor) => (stopsOf.get(x.key) || []).find(s => s.seq === 'F');
  const lastStop = (x: Tor) => (stopsOf.get(x.key) || []).find(s => s.seq === 'L');
  const evAt = (x: Tor, codes: string[], stop?: Stop, latest = false) => {
    const list = (evOf.get(x.key) || []).filter(e => codes.includes(e.code) && e.at != null && e.revoked !== 'X');
    const atStop = stop ? list.filter(e => e.stop === stop.key) : [];
    const use = atStop.length ? atStop : list;
    if (!use.length) return null;
    return use.reduce((m, e) => (latest ? (e.at! > m ? e.at! : m) : (e.at! < m ? e.at! : m)), use[0].at!);
  };
  const DEP = ['DEPARTURE', 'EP_DEPARTURE', 'LAST_DEPARTURE'];
  const ARR = ['ARRIV_DEST'];

  const view = (x: Tor) => {
    const f = firstStop(x); const l = lastStop(x);
    const plannedDep = f?.plan ?? null; const plannedArr = l?.plan ?? l?.reqEnd ?? null;
    const actDep = evAt(x, DEP, f); const actArr = evAt(x, ARR, l, true);
    const open = !isClosed(x);
    const depDelayH = actDep != null && plannedDep != null ? (actDep - plannedDep) / HOUR : (open && actDep == null && plannedDep != null && plannedDep < nowMs ? (nowMs - plannedDep) / HOUR : null);
    const arrDelayH = actArr != null && plannedArr != null ? (actArr - plannedArr) / HOUR : (open && actArr == null && plannedArr != null && plannedArr < nowMs ? (nowMs - plannedArr) / HOUR : null);
    const ch = chargeOf.get(x.key);
    const res = (itemsOf.get(x.key) || []).filter(i => i.cat === 'AVR' || i.cat === 'PVR');
    const vehicle = res.map(i => [i.resId, i.plate].filter(Boolean).join(' ')).filter(Boolean).join(', ');
    const mtr = x.mtr || res.map(i => i.mtr).find(Boolean) || '';
    const fus = [...foOfFu.values()].filter(k => k === x.key).length;
    const weightPct = x.capKg > 0 ? (x.weiKg / x.capKg) * 100 : 0;
    const volPct = x.volCap > 0 ? (x.vol / x.volCap) * 100 : 0;
    const utilPct = Math.max(weightPct, volPct);
    return {
      x, f, l, plannedDep, plannedArr, actDep, actArr, open, depDelayH, arrDelayH, depLate: depDelayH != null && depDelayH > 0, arrLate: arrDelayH != null && arrDelayH > 0,
      depOverdue: open && actDep == null && plannedDep != null && plannedDep < nowMs, arrOverdue: open && actArr == null && plannedArr != null && plannedArr < nowMs,
      origin: f?.loc || '', dest: l?.loc || '', lane: `${f?.loc || '?'} -> ${l?.loc || '?'}`, cost: ch?.amt ?? null, cur: ch?.cur || '', calc: ch?.calc || '', vehicle, mtr, fus, utilPct, weightPct, volPct,
      inTransit: open && actDep != null && actArr == null
    };
  };
  type V = ReturnType<typeof view>;
  const fos = tors.filter(x => x.cat === 'TO');
  const fus = tors.filter(x => x.cat === 'FU');
  const foViews = fos.map(view);
  const fuViews = fus.map(view);
  const laneLabel = (v: V) => `${locLabel(v.origin) || '?'} -> ${locLabel(v.dest) || '?'}`;
  const foRow = (v: V) => ({
    order: v.x.id, type: v.x.type, status: lcText(v.x), execution: t('TOR_EXECUTION_STATUS', v.x.exec), carrier: bp(v.x.tsp) || '(none)', from: locLabel(v.origin), to: locLabel(v.dest),
    plannedDeparture: show(v.plannedDep), actualDeparture: show(v.actDep), plannedArrival: show(v.plannedArr), actualArrival: show(v.actArr)
  });
  const FO_COLS = cols(['order', 'Freight Order'], ['type', 'Type'], ['status', 'Lifecycle'], ['execution', 'Execution'], ['carrier', 'Carrier'], ['from', 'From'], ['to', 'To'],
    ['plannedDeparture', 'Planned Departure'], ['actualDeparture', 'Actual Departure'], ['plannedArrival', 'Planned Arrival'], ['actualArrival', 'Actual Arrival']);
  const fuRow = (v: V) => {
    const d = dlvOf.get(v.x.key);
    const fo = foOfFu.get(v.x.key);
    return {
      unit: v.x.id, type: v.x.type, status: lcText(v.x), planning: t('TOR_PLN_STATUS', v.x.plan), execution: t('TOR_EXECUTION_STATUS', v.x.exec), freightOrder: fo ? byKey.get(fo)?.id || '' : '',
      shipper: bp(v.x.shipper), consignee: bp(v.x.consignee), from: locLabel(v.origin), to: locLabel(v.dest), weightKg: fmt1(v.x.weiKg), created: show(v.x.created),
      delivery: d ? strip(d.VBELN) : (v.x.baseId ? `${v.x.baseId} (type ${v.x.baseTco})` : ''), deliveryDate: d ? showDay(d.LFDAT) : ''
    };
  };
  const FU_COLS = cols(['unit', 'Freight Unit'], ['type', 'Type'], ['status', 'Lifecycle'], ['planning', 'Planning'], ['execution', 'Execution'], ['freightOrder', 'Freight Order'],
    ['shipper', 'Shipper'], ['consignee', 'Consignee'], ['from', 'From'], ['to', 'To'], ['weightKg', 'Gross Wt (kg)'], ['created', 'Created'], ['delivery', 'Base Document'], ['deliveryDate', 'Delivery Date']);

  // Carrier scorecard from real freight orders, events and charges.
  const scorecard = () => {
    const m = new Map<string, { carrier: string; orders: number; executed: number; measured: number; late: number; delaySum: number; confirmed: number; rejected: number; noConf: number; cost: number; costCur: Set<string>; kg: number; costed: number; active: number }>();
    foViews.filter(v => v.x.tsp && !isCanceled(v.x)).forEach(v => {
      const e = m.get(v.x.tsp) || { carrier: bp(v.x.tsp), orders: 0, executed: 0, measured: 0, late: 0, delaySum: 0, confirmed: 0, rejected: 0, noConf: 0, cost: 0, costCur: new Set<string>(), kg: 0, costed: 0, active: 0 };
      e.orders++;
      if (/execut|complet/i.test(`${t('TOR_EXECUTION_STATUS', v.x.exec)} ${lcText(v.x)}`)) e.executed++;
      if (v.open) e.active++;
      const d = v.arrDelayH ?? v.depDelayH;
      if (d != null) { e.measured++; if (d > 0) { e.late++; e.delaySum += d; } }
      const c = t('TOR_CONFIRM_STATUS', v.x.conf);
      if (/^confirmed/i.test(c)) e.confirmed++; else if (/rejected/i.test(c)) e.rejected++; else e.noConf++;
      if (v.cost != null && v.cost > 0) { e.cost += v.cost; e.costCur.add(v.cur); e.costed++; e.kg += v.x.weiKg; }
      m.set(v.x.tsp, e);
    });
    return [...m.entries()].map(([id, e]) => ({
      id, carrier: e.carrier, orders: e.orders, active: e.active, executed: e.executed, measured: e.measured, late: e.late,
      onTimeRate: e.measured ? ((e.measured - e.late) / e.measured) * 100 : null, delayRate: e.measured ? (e.late / e.measured) * 100 : null,
      avgDelayH: e.late ? e.delaySum / e.late : 0, confirmed: e.confirmed, rejected: e.rejected, noConf: e.noConf,
      acceptRate: e.confirmed + e.rejected ? (e.confirmed / (e.confirmed + e.rejected)) * 100 : null,
      spend: e.cost, cur: [...e.costCur].join('/'), costPerOrder: e.costed ? e.cost / e.costed : null, costPerTon: e.kg > 0 ? e.cost / (e.kg / 1000) : null
    }));
  };
  type Score = ReturnType<typeof scorecard>[number];
  const scoreRow = (s: Score) => ({
    carrier: s.carrier, orders: s.orders, active: s.active, executed: s.executed, measured: s.measured, late: s.late,
    onTime: s.onTimeRate == null ? 'n/a' : `${fmt1(s.onTimeRate)}%`, delayRate: s.delayRate == null ? 'n/a' : `${fmt1(s.delayRate)}%`, avgDelay: s.late ? dur(s.avgDelayH) : '',
    confirmed: s.confirmed, rejected: s.rejected, noConf: s.noConf, spend: s.spend ? `${money(s.spend)} ${s.cur}` : '0', costPerOrder: s.costPerOrder == null ? 'n/a' : money(s.costPerOrder), costPerTon: s.costPerTon == null ? 'n/a' : money(s.costPerTon)
  });
  const SCORE_COLS = cols(['carrier', 'Carrier'], ['orders', 'Freight Orders'], ['active', 'Open'], ['executed', 'Executed'], ['measured', 'Timed'], ['late', 'Late'], ['onTime', 'On-Time %'],
    ['delayRate', 'Delay Rate'], ['avgDelay', 'Avg Delay (late)'], ['confirmed', 'Confirmed'], ['rejected', 'Rejected'], ['noConf', 'No Confirmation'], ['spend', 'Charges'], ['costPerOrder', 'Cost / Order'], ['costPerTon', 'Cost / Ton']);

  return {
    sysD, nowMs, offMs, localDay, show, showDay, dayShift, t, tors, fos, fus, foViews, fuViews, byKey, stopsOf, evOf, evList, itemList, itemsOf, foOfFu, chargeOf, elements, leadTypes, settlements,
    locMap, locLabel, laneLabel, dlvOf, bp, lcText, isClosed, isCanceled, foRow, FO_COLS, fuRow, FU_COLS, scorecard, scoreRow, SCORE_COLS, pdstkText: new Map(pdstkTxt.rows.map(r => [r.DOMVALUE_L, r.DDTEXT] as [string, string])),
    tenders: num(tenders.rows[0]?.N), allocations: num(alloc.rows[0]?.N), tendersErr: tenders.error, allocErr: alloc.error,
    error: roots.error || stops.error || evs.error || items.error || chg.error || sf.error || locs.error || dlv.error
  };
}
type Tm = Awaited<ReturnType<typeof loadTm>>;
type V = Tm['foViews'][number];

const SOURCE = 'Read live from the embedded S/4HANA TM tables (/SCMTMS/D_TORROT freight orders/units, D_TORSTP stops, D_TOREXE execution events, D_TORITE items, D_TCHRGR/D_TCHRGE charges, D_SF_ROT settlements) with LIKP deliveries and /SAPAPO/LOC locations.';
const note = (tm: Tm, extra = '') => `${extra ? `${extra} ` : ''}${SOURCE} Times are shown in the system's local time. ${errNote(tm.error)}`.trim();
const sec = (title: string, columns: TmSection['columns'], rows: TmSection['rows'], summaryStats?: TmSection['summaryStats'], n?: string): TmSection => ({ title, columns, rows, summaryStats, note: n });

function laneStats(tm: Tm, list: V[]) {
  const m = new Map<string, { lane: string; orders: number; carriers: Set<string>; cost: number; cur: Set<string>; costed: number; kg: number; util: number[]; transit: number[] }>();
  list.forEach(v => {
    const k = `${v.origin}|${v.dest}`;
    const e = m.get(k) || { lane: tm.laneLabel(v), orders: 0, carriers: new Set<string>(), cost: 0, cur: new Set<string>(), costed: 0, kg: 0, util: [], transit: [] };
    e.orders++;
    if (v.x.tsp) e.carriers.add(tm.bp(v.x.tsp));
    if (v.cost != null && v.cost > 0) { e.cost += v.cost; e.cur.add(v.cur); e.costed++; e.kg += v.x.weiKg; }
    if (v.utilPct > 0) e.util.push(v.utilPct);
    if (v.actDep != null && v.actArr != null && v.actArr > v.actDep) e.transit.push((v.actArr - v.actDep) / HOUR);
    m.set(k, e);
  });
  return [...m.entries()].map(([key, e]) => ({ key, ...e, carrierList: [...e.carriers].join('; '), curText: [...e.cur].join('/'), costPerTon: e.kg > 0 ? e.cost / (e.kg / 1000) : null, avgUtil: e.util.length ? e.util.reduce((a, b) => a + b, 0) / e.util.length : null, avgTransitH: e.transit.length ? e.transit.reduce((a, b) => a + b, 0) / e.transit.length : null }));
}
const LANE_COLS = cols(['lane', 'Lane (From -> To)'], ['orders', 'Freight Orders'], ['carriers', 'Carriers'], ['charges', 'Charges'], ['costPerOrder', 'Cost / Order'], ['costPerTon', 'Cost / Ton'], ['avgUtil', 'Avg Utilization'], ['transit', 'Avg Transit']);
const laneRow = (l: ReturnType<typeof laneStats>[number]) => ({
  lane: l.lane, orders: l.orders, carriers: l.carrierList || '(none)', charges: l.cost ? `${money(l.cost)} ${l.curText}` : '0', costPerOrder: l.costed ? money(l.cost / l.costed) : 'n/a',
  costPerTon: l.costPerTon == null ? 'n/a' : money(l.costPerTon), avgUtil: l.avgUtil == null ? 'n/a' : `${fmt1(l.avgUtil)}%`, transit: l.avgTransitH == null ? 'n/a' : dur(l.avgTransitH)
});

const delayed = (tm: Tm) => tm.foViews.filter(v => !tm.isCanceled(v.x) && (v.depLate || v.arrLate));
const delayRow = (tm: Tm, v: V) => ({ ...tm.foRow(v), depDelay: v.depDelayH == null ? '' : `${dur(v.depDelayH)}${v.depOverdue ? ' (not departed)' : ''}`, arrDelay: v.arrDelayH == null ? '' : `${dur(v.arrDelayH)}${v.arrOverdue ? ' (not arrived)' : ''}` });
const DELAY_COLS = (tm: Tm) => [...tm.FO_COLS, ...cols(['depDelay', 'Departure Delay'], ['arrDelay', 'Arrival Delay'])];
const fuOpen = (tm: Tm) => tm.fuViews.filter(v => !tm.isClosed(v.x));
const unplannedFus = (tm: Tm) => fuOpen(tm).filter(v => /not planned/i.test(tm.t('TOR_PLN_STATUS', v.x.plan)));
const pickTarget = (tm: Tm, query: string) => {
  const ids = (query.match(/\b\d{3,20}\b/g) || []).map(strip);
  return ids.length ? [...tm.foViews, ...tm.fuViews].filter(v => ids.includes(v.x.id)) : [];
};

// ---------- builders ----------
export async function buildTmLiveReport(intent: TmIntent, query: string): Promise<TmLiveReport> {
  const tm = await loadTm();
  if (!tm.tors.length) {
    return { text: `No live TM documents could be read from /SCMTMS/D_TORROT. ${errNote(tm.error)}`.trim(), sections: [], assess: false };
  }
  const today = tm.sysD;
  const tomorrow = tm.dayShift(today, 1);
  const todayTxt = tm.showDay(today);
  const activeFos = tm.foViews.filter(v => !tm.isClosed(v.x));
  const scores = () => tm.scorecard();
  const r = (text: string, sections: TmSection[], assess = false, persona?: string): TmLiveReport => ({ text, sections, assess, persona });
  const CARRIER_PERSONA = 'You are an SAP TM transportation manager. Answer in 3-6 sentences with concrete carrier names and figures from the evidence.';

  switch (intent) {
    case 'FU_TODAY': {
      const list = tm.fuViews.filter(v => tm.localDay(v.x.created) === today).sort((a, b) => (b.x.created || 0) - (a.x.created || 0));
      const last = [...tm.fuViews].sort((a, b) => (b.x.created || 0) - (a.x.created || 0))[0];
      const text = list.length
        ? `${list.length} freight unit(s) were created today (${todayTxt}): ${list.slice(0, 8).map(v => v.x.id).join(', ')}${list.length > 8 ? ', ...' : ''}. ${list.filter(v => /not planned/i.test(tm.t('TOR_PLN_STATUS', v.x.plan))).length} of them are not yet planned.`
        : `No freight units were created today (${todayTxt}). The most recent freight unit is ${last?.x.id || 'n/a'}, created ${tm.show(last?.x.created ?? null)}.`;
      return r(text, [sec(`Freight Units Created Today (${todayTxt})`, tm.FU_COLS, list.map(tm.fuRow), [{ label: 'Created today', value: String(list.length) }, { label: 'Freight units in system', value: String(tm.fus.length) }], note(tm))]);
    }
    case 'FU_UNPLANNED': {
      const list = unplannedFus(tm).sort((a, b) => (b.x.created || 0) - (a.x.created || 0));
      const kgSum = list.reduce((a, v) => a + v.x.weiKg, 0);
      const overdue = list.filter(v => { const d = tm.dlvOf.get(v.x.key); return d && d.LFDAT && d.LFDAT < today; }).length;
      return r(`${list.length} open freight unit(s) are not yet planned (${fmt1(kgSum)} kg gross). ${overdue} of them belong to deliveries whose delivery date has already passed.`,
        [sec('Freight Units Not Yet Planned', tm.FU_COLS, list.map(tm.fuRow), [{ label: 'Not planned', value: String(list.length) }, { label: 'Gross weight (kg)', value: fmt1(kgSum) }, { label: 'Delivery date passed', value: String(overdue) }], note(tm, 'Planning status from /SCMTMS/D_TORROT-PLAN_STATUS_ROOT; completed and canceled units excluded.'))]);
    }
    case 'SHIP_TODAY': {
      const list = tm.foViews.filter(v => !tm.isCanceled(v.x) && (tm.localDay(v.plannedDep) === today || tm.localDay(v.plannedArr) === today));
      const fuToday = fuOpen(tm).filter(v => { const d = tm.dlvOf.get(v.x.key); return tm.localDay(v.plannedDep) === today || (d && d.WADAT === today); });
      const next = activeFos.filter(v => v.plannedDep != null && v.plannedDep > tm.nowMs).sort((a, b) => a.plannedDep! - b.plannedDep!)[0];
      const text = list.length
        ? `${list.length} freight order(s) are scheduled to depart or arrive today (${todayTxt}); ${fuToday.length} freight unit(s) are due for pickup today.`
        : `No freight orders are scheduled to depart or arrive today (${todayTxt}). ${fuToday.length} freight unit(s) are due for pickup today${fuToday.length ? ' but are not on a freight order scheduled for today' : ''}. ${next ? `The next scheduled departure is freight order ${next.x.id} on ${tm.show(next.plannedDep)}.` : 'No future departures are planned.'}`;
      return r(text, [
        sec(`Freight Orders Scheduled Today (${todayTxt})`, tm.FO_COLS, list.map(tm.foRow), [{ label: 'Freight orders today', value: String(list.length) }, { label: 'Freight units due today', value: String(fuToday.length) }], note(tm)),
        ...(fuToday.length ? [sec('Freight Units Due for Pickup Today', tm.FU_COLS, fuToday.map(tm.fuRow))] : [])
      ]);
    }
    case 'TO_DELAYED': {
      const list = delayed(tm).sort((a, b) => Math.max(b.depDelayH || 0, b.arrDelayH || 0) - Math.max(a.depDelayH || 0, a.arrDelayH || 0));
      const open = list.filter(v => v.open);
      return r(`${list.length} freight order(s) are delayed against their planned stop times: ${open.length} are still open (${open.filter(v => v.depOverdue).length} have not departed although the planned departure has passed) and ${list.length - open.length} were executed late.`,
        [sec('Delayed Freight Orders', DELAY_COLS(tm), list.map(v => delayRow(tm, v)), [{ label: 'Delayed', value: String(list.length) }, { label: 'Still open', value: String(open.length) }, { label: 'Freight orders', value: String(tm.fos.length) }], note(tm, 'Delay = actual departure/arrival event (D_TOREXE) after the planned stop time (D_TORSTP), or planned time passed without the event.'))]);
    }
    case 'NO_CARRIER': {
      const list = activeFos.filter(v => !v.x.tsp);
      return r(list.length ? `${list.length} open freight order(s) have no carrier assigned: ${list.map(v => v.x.id).join(', ')}.` : 'Every open freight order has a carrier assigned.',
        [sec('Open Freight Orders Without a Carrier', tm.FO_COLS, list.map(tm.foRow), [{ label: 'Without carrier', value: String(list.length) }, { label: 'Open freight orders', value: String(activeFos.length) }], note(tm))]);
    }
    case 'MISSING_EQUIP': {
      const list = activeFos.filter(v => !v.mtr || !v.vehicle);
      const rows = list.map(v => ({ ...tm.foRow(v), meansOfTransport: v.mtr || '(missing)', vehicle: v.vehicle || '(no vehicle/trailer resource)' }));
      return r(`${list.length} of ${activeFos.length} open freight order(s) are missing equipment: ${list.filter(v => !v.mtr).length} have no means of transport and ${list.filter(v => !v.vehicle).length} have no vehicle or trailer resource assigned.`,
        [sec('Open Freight Orders Missing Equipment', [...tm.FO_COLS, ...cols(['meansOfTransport', 'Means of Transport'], ['vehicle', 'Vehicle Resource'])], rows, [{ label: 'Missing equipment', value: String(list.length) }], note(tm, 'Equipment = means of transport on the order plus vehicle/trailer resource items (ITEM_CAT AVR/PVR with resource ID or plate number).'))]);
    }
    case 'FO_BY_LOC': {
      const m = new Map<string, { origin: string; type: string; region: string; orders: number; open: number; plants: Set<string> }>();
      tm.foViews.filter(v => !tm.isCanceled(v.x)).forEach(v => {
        const loc = tm.locMap.get(v.origin);
        const plants = new Set((tm.itemsOf.get(v.x.key) || []).map(i => i.plant).filter(Boolean));
        tm.fuViews.filter(f => tm.foOfFu.get(f.x.key) === v.x.key).forEach(f => (tm.itemsOf.get(f.x.key) || []).forEach(i => i.plant && plants.add(i.plant)));
        const k = v.origin || '?';
        const e = m.get(k) || { origin: tm.locLabel(v.origin) || '(no source stop)', type: loc?.type || '', region: loc ? [loc.region, loc.country].filter(Boolean).join(', ') : '', orders: 0, open: 0, plants: new Set<string>() };
        e.orders++; if (v.open) e.open++; plants.forEach(p => e.plants.add(p));
        m.set(k, e);
      });
      const rows = [...m.values()].sort((a, b) => b.orders - a.orders).map(e => ({ origin: e.origin, type: e.type, region: e.region, plants: [...e.plants].join(', '), orders: e.orders, open: e.open }));
      const dm = new Map<string, number>();
      tm.foViews.filter(v => !tm.isCanceled(v.x)).forEach(v => { const l = tm.locMap.get(v.dest); const k = l ? [l.region, l.country].filter(Boolean).join(', ') || v.dest : v.dest || '?'; dm.set(k, (dm.get(k) || 0) + 1); });
      return r(`Freight orders by source location: ${rows.slice(0, 5).map(x => `${x.origin}: ${x.orders}`).join('; ')}.`, [
        sec('Freight Orders by Source Location / Shipping Point', cols(['origin', 'Source Location'], ['type', 'Location Type'], ['region', 'Region'], ['plants', 'Plants'], ['orders', 'Freight Orders'], ['open', 'Open']), rows, undefined, note(tm, 'Plants come from the freight order and freight unit items (ERP_PLANT_ID).')),
        sec('Freight Orders by Destination Region', cols(['region', 'Destination Region'], ['orders', 'Freight Orders']), [...dm.entries()].sort((a, b) => b[1] - a[1]).map(([region, orders]) => ({ region, orders })))
      ]);
    }
    case 'AT_RISK': {
      const horizon = tm.nowMs + 48 * HOUR;
      const fo = activeFos.filter(v => v.actArr == null && v.plannedArr != null && v.plannedArr < horizon).sort((a, b) => a.plannedArr! - b.plannedArr!);
      const fu = unplannedFus(tm).filter(v => { const d = tm.dlvOf.get(v.x.key); return d && d.LFDAT && d.LFDAT <= tm.dayShift(today, 2); });
      return r(`${fo.length} open freight order(s) have not arrived and are planned to arrive before ${tm.show(horizon)} or are already past their planned arrival (${fo.filter(v => v.arrOverdue).length} overdue). In addition, ${fu.length} unplanned freight unit(s) belong to deliveries due by ${tm.showDay(tm.dayShift(today, 2))}.`, [
        sec('Freight Orders at Risk of Missing the Delivery Date', DELAY_COLS(tm), fo.map(v => delayRow(tm, v)), [{ label: 'Freight orders at risk', value: String(fo.length) }, { label: 'Overdue', value: String(fo.filter(v => v.arrOverdue).length) }, { label: 'Unplanned units due', value: String(fu.length) }], note(tm, 'At risk = not yet arrived and planned arrival within 48 hours or already passed.')),
        sec('Unplanned Freight Units with Delivery Date Due or Passed', tm.FU_COLS, fu.map(tm.fuRow))
      ]);
    }
    case 'WORKLOAD': {
      const created = tm.fuViews.filter(v => tm.localDay(v.x.created) === today).length;
      const foCreated = tm.foViews.filter(v => tm.localDay(v.x.created) === today).length;
      const depToday = tm.foViews.filter(v => tm.localDay(v.plannedDep) === today).length;
      const arrToday = tm.foViews.filter(v => tm.localDay(v.plannedArr) === today).length;
      const evToday = tm.evList.filter(e => tm.localDay(e.at) === today);
      const evByCode = new Map<string, number>(); evToday.forEach(e => evByCode.set(e.code, (evByCode.get(e.code) || 0) + 1));
      const dueToday = fuOpen(tm).filter(v => tm.dlvOf.get(v.x.key)?.WADAT === today).length;
      const rows = [
        { item: 'Freight units created today', value: created }, { item: 'Freight orders created today', value: foCreated }, { item: 'Freight units with goods issue planned today', value: dueToday },
        { item: 'Freight orders planned to depart today', value: depToday }, { item: 'Freight orders planned to arrive today', value: arrToday }, { item: 'Execution events recorded today', value: evToday.length },
        { item: 'Open freight units not yet planned', value: unplannedFus(tm).length }, { item: 'Open freight orders', value: activeFos.length }, { item: 'Open freight orders in transit', value: activeFos.filter(v => v.inTransit).length }
      ];
      return r(`Today's transportation workload (${todayTxt}): ${created} freight unit(s) and ${foCreated} freight order(s) created, ${evToday.length} execution event(s) recorded, ${depToday} departure(s) and ${arrToday} arrival(s) planned, ${unplannedFus(tm).length} open freight unit(s) still waiting for planning.`, [
        sec(`Transportation Workload ${todayTxt}`, cols(['item', 'Measure'], ['value', 'Count']), rows, undefined, note(tm)),
        sec('Execution Events Recorded Today', cols(['event', 'Event'], ['count', 'Count']), [...evByCode.entries()].sort((a, b) => b[1] - a[1]).map(([event, count]) => ({ event, count })))
      ]);
    }
    case 'ISSUES': {
      const del = delayed(tm).filter(v => v.open);
      const noCarrier = activeFos.filter(v => !v.x.tsp);
      const unconfirmed = activeFos.filter(v => v.x.tsp && /no confirmation|update sent/i.test(tm.t('TOR_CONFIRM_STATUS', v.x.conf)));
      const rejected = tm.foViews.filter(v => /rejected/i.test(tm.t('TOR_CONFIRM_STATUS', v.x.conf)));
      const blocked = tm.tors.filter(x => !tm.isClosed(x) && (x.blkExec || x.blkPlan || x.invBlock));
      const unplanned = unplannedFus(tm);
      const unplannedLate = unplanned.filter(v => { const d = tm.dlvOf.get(v.x.key); return d && d.LFDAT && d.LFDAT < today; });
      const noCharge = activeFos.filter(v => v.cost == null || v.cost === 0);
      const rows = [
        { issue: 'Open freight orders delayed (late or overdue departure/arrival)', count: del.length, examples: del.slice(0, 5).map(v => v.x.id).join(', ') },
        { issue: 'Unplanned freight units whose delivery date has passed', count: unplannedLate.length, examples: unplannedLate.slice(0, 5).map(v => v.x.id).join(', ') },
        { issue: 'Open freight units not yet planned', count: unplanned.length, examples: unplanned.slice(0, 5).map(v => v.x.id).join(', ') },
        { issue: 'Open freight orders without a carrier', count: noCarrier.length, examples: noCarrier.slice(0, 5).map(v => v.x.id).join(', ') },
        { issue: 'Open freight orders without carrier confirmation', count: unconfirmed.length, examples: unconfirmed.slice(0, 5).map(v => v.x.id).join(', ') },
        { issue: 'Freight orders rejected by the carrier', count: rejected.length, examples: rejected.slice(0, 5).map(v => v.x.id).join(', ') },
        { issue: 'Open documents with planning/execution/invoicing block', count: blocked.length, examples: blocked.slice(0, 5).map(x => x.id).join(', ') },
        { issue: 'Open freight orders without calculated charges', count: noCharge.length, examples: noCharge.slice(0, 5).map(v => v.x.id).join(', ') }
      ];
      const top = rows.filter(x => x.count).sort((a, b) => b.count - a.count);
      return r(`Transportation issues needing attention: ${top.map(x => `${x.issue.toLowerCase()}: ${x.count}`).join('; ') || 'none found'}.`, [
        sec('Transportation Issues Requiring Attention', cols(['issue', 'Issue'], ['count', 'Count'], ['examples', 'Examples']), rows, undefined, note(tm)),
        sec('Delayed Open Freight Orders', DELAY_COLS(tm), del.slice(0, 50).map(v => delayRow(tm, v)))
      ], true, 'You are an SAP TM control-tower lead. Prioritize the 3 most urgent actions in 3-6 sentences.');
    }
    case 'CARRIER_BEST': case 'CARRIER_DELAY_RATE': case 'CARRIER_LATE': case 'CARRIER_COMPARE': {
      const s = scores();
      let list = [...s];
      let title = 'Carrier Scorecard';
      let text = '';
      if (intent === 'CARRIER_BEST') {
        list.sort((a, b) => (b.onTimeRate ?? -1) - (a.onTimeRate ?? -1) || b.executed - a.executed);
        const best = list.filter(x => x.measured > 0);
        text = best.length ? `Best-performing carriers by on-time rate: ${best.slice(0, 3).map(x => `${x.carrier} (${fmt1(x.onTimeRate!)}% on time over ${x.measured} timed orders, ${x.executed} executed)`).join('; ')}.` : 'No carrier has timed freight orders to rank.';
      } else if (intent === 'CARRIER_DELAY_RATE') {
        list.sort((a, b) => (b.delayRate ?? -1) - (a.delayRate ?? -1));
        title = 'Carrier Delay Rates';
        text = `Highest delay rates: ${list.filter(x => x.measured).slice(0, 3).map(x => `${x.carrier} ${fmt1(x.delayRate!)}% (${x.late} of ${x.measured})`).join('; ') || 'none measured'}.`;
      } else if (intent === 'CARRIER_LATE') {
        list = list.filter(x => x.measured >= 2 && (x.delayRate ?? 0) >= 50).sort((a, b) => (b.delayRate ?? 0) - (a.delayRate ?? 0));
        title = 'Carriers Late on at Least Half of Their Freight Orders';
        text = list.length ? `${list.length} carrier(s) are consistently late (late on at least 50% of at least 2 timed freight orders): ${list.map(x => `${x.carrier} ${fmt1(x.delayRate!)}% (${x.late}/${x.measured})`).join('; ')}.` : 'No carrier is late on at least half of two or more timed freight orders.';
      } else {
        list.sort((a, b) => b.orders - a.orders);
        title = 'Carrier Cost and Service Level Comparison';
        text = `Carrier comparison: ${list.slice(0, 5).map(x => `${x.carrier}: ${x.onTimeRate == null ? 'no timed orders' : `${fmt1(x.onTimeRate)}% on time`}, ${x.costPerOrder == null ? 'no charges' : `${money(x.costPerOrder)} ${x.cur} per order`}`).join('; ')}.`;
      }
      return r(text, [sec(title, tm.SCORE_COLS, list.map(tm.scoreRow), [{ label: 'Carriers', value: String(s.length) }, { label: 'Freight orders with carrier', value: String(s.reduce((a, b) => a + b.orders, 0)) }],
        note(tm, 'On time = actual arrival (or departure if no arrival) not later than the planned stop time; open orders past their plan count as late. Confirmation status from the carrier response on the freight order.'))], intent === 'CARRIER_COMPARE', CARRIER_PERSONA);
    }
    case 'CARRIER_ACCEPT': {
      const s = scores().sort((a, b) => b.orders - a.orders);
      const conf = s.reduce((a, b) => a + b.confirmed, 0); const rej = s.reduce((a, b) => a + b.rejected, 0);
      return r(`Carrier acceptance: ${conf} freight order(s) confirmed and ${rej} rejected by carriers (${pct(conf, conf + rej)} acceptance). ${s.map(x => `${x.carrier}: ${x.acceptRate == null ? `no responses (${x.noConf} awaiting)` : `${fmt1(x.acceptRate)}%`}`).join('; ')}. Tendering records: ${tm.tenders}.`,
        [sec('Carrier Acceptance Rates', cols(['carrier', 'Carrier'], ['orders', 'Freight Orders'], ['confirmed', 'Confirmed'], ['rejected', 'Rejected'], ['noConf', 'No Confirmation'], ['rate', 'Acceptance Rate']),
          s.map(x => ({ carrier: x.carrier, orders: x.orders, confirmed: x.confirmed, rejected: x.rejected, noConf: x.noConf, rate: x.acceptRate == null ? 'n/a' : `${fmt1(x.acceptRate)}%` })), undefined,
          note(tm, `Acceptance = confirmed / (confirmed + rejected) from the freight order confirmation status. Tendering table /SCMTMS/D_TORTEN has ${tm.tenders} record(s). ${errNote(tm.tendersErr)}`))]);
    }
    case 'CARRIER_REJECT': {
      const rej = tm.foViews.filter(v => /rejected/i.test(tm.t('TOR_CONFIRM_STATUS', v.x.conf)));
      const text = `${tm.tenders} tendering record(s) exist in /SCMTMS/D_TORTEN, so no tender has been sent or rejected through TM tendering. ${rej.length} freight order(s) carry a carrier rejection in their confirmation status${rej.length ? `: ${rej.map(v => `${v.x.id} (${tm.bp(v.x.tsp)})`).join(', ')}` : ''}.`;
      return r(text, [sec('Freight Orders Rejected by Carriers', [...tm.FO_COLS, ...cols(['confirmation', 'Confirmation'])], rej.map(v => ({ ...tm.foRow(v), confirmation: tm.t('TOR_CONFIRM_STATUS', v.x.conf) })), [{ label: 'Tender records', value: String(tm.tenders) }, { label: 'Rejected orders', value: String(rej.length) }], note(tm, errNote(tm.tendersErr)))]);
    }
    case 'CARRIER_CAPACITY': {
      const s = scores();
      const todayFo = tm.foViews.filter(v => !tm.isCanceled(v.x) && (tm.localDay(v.plannedDep) === today || tm.localDay(v.plannedArr) === today || v.inTransit));
      const rows = s.map(x => {
        const busy = todayFo.filter(v => v.x.tsp === x.id);
        const caps = tm.foViews.filter(v => v.x.tsp === x.id && v.x.capKg > 0).map(v => v.x.capKg);
        return { carrier: x.carrier, today: busy.length, todayOrders: busy.map(v => v.x.id).join(', '), open: x.active, history: x.orders, typicalCapKg: caps.length ? fmt1(median(caps)) : 'n/a', status: busy.length ? 'Committed today' : 'No freight order today' };
      }).sort((a, b) => a.today - b.today || b.history - a.history);
      const free = rows.filter(x => !x.today);
      return r(`No carrier capacity or allocation is maintained in this system (${tm.allocations} allocation records), so available capacity cannot be read directly. Based on live freight orders, ${free.length} of ${rows.length} carriers have no freight order departing, arriving or in transit today: ${free.map(x => x.carrier).join('; ') || 'none'}.`,
        [sec('Carrier Commitments Today', cols(['carrier', 'Carrier'], ['status', 'Today'], ['today', 'Orders Today'], ['todayOrders', 'Freight Orders Today'], ['open', 'Open Orders'], ['history', 'Orders (all time)'], ['typicalCapKg', 'Typical Vehicle Capacity (kg)']), rows, undefined, note(tm, `Allocation table /SCMTMS/D_TORALC: ${tm.allocations} record(s). ${errNote(tm.allocErr)}`))]);
    }
    case 'CLAIMS': {
      const damaged = tm.itemList.filter(i => i.damaged);
      const disc = tm.evList.filter(e => e.discrepancy);
      const disputes = tm.settlements.filter(s => s.dispute || s.block || s.disputedItems);
      const per = new Map<string, { carrier: string; damaged: number; discrepancies: number; disputes: number }>();
      const add = (tsp: string, k: 'damaged' | 'discrepancies' | 'disputes') => { const e = per.get(tsp) || { carrier: tm.bp(tsp) || '(no carrier)', damaged: 0, discrepancies: 0, disputes: 0 }; e[k]++; per.set(tsp, e); };
      damaged.forEach(i => add(tm.byKey.get(i.parent)?.tsp || '', 'damaged'));
      disc.forEach(e => add(tm.byKey.get(e.parent)?.tsp || '', 'discrepancies'));
      disputes.forEach(s => add(s.tsp, 'disputes'));
      const rows = [...per.values()].sort((a, b) => b.damaged + b.discrepancies + b.disputes - (a.damaged + a.discrepancies + a.disputes));
      return r(rows.length ? `Freight claim indicators by carrier: ${rows.map(x => `${x.carrier}: ${x.damaged} damaged item(s), ${x.discrepancies} discrepancy event(s), ${x.disputes} disputed/blocked settlement(s)`).join('; ')}.`
        : `No freight claims are recorded: 0 damaged items, 0 execution events with a discrepancy and 0 disputed or blocked freight settlements across ${tm.fos.length} freight orders and ${tm.settlements.length} settlement documents.`,
        [sec('Freight Claim Indicators by Carrier', cols(['carrier', 'Carrier'], ['damaged', 'Damaged Items'], ['discrepancies', 'Discrepancy Events'], ['disputes', 'Disputed/Blocked Settlements']), rows,
          [{ label: 'Damaged items', value: String(damaged.length) }, { label: 'Discrepancy events', value: String(disc.length) }, { label: 'Disputed settlements', value: String(disputes.length) }], note(tm, 'No separate claims document exists in TM; claims are evidenced by damaged items, discrepancy events and disputed settlements.'))]);
    }
    case 'ALT_CARRIER': case 'CARRIER_FOR_SHIPMENT': {
      const s = scores();
      const lanes = new Map<string, Map<string, { n: number; late: number; cost: number; costed: number }>>();
      tm.foViews.filter(v => v.x.tsp && !tm.isCanceled(v.x)).forEach(v => {
        const k = `${v.origin}|${v.dest}`; const m = lanes.get(k) || new Map(); const e = m.get(v.x.tsp) || { n: 0, late: 0, cost: 0, costed: 0 };
        e.n++; if (v.depLate || v.arrLate) e.late++; if (v.cost) { e.cost += v.cost; e.costed++; } m.set(v.x.tsp, e); lanes.set(k, m);
      });
      const rank = (exclude: string, laneKey: string) => {
        const lane = lanes.get(laneKey);
        return s.filter(c => c.id !== exclude).map(c => {
          const l = lane?.get(c.id);
          return { c, laneOrders: l?.n || 0, laneOnTime: l ? ((l.n - l.late) / l.n) * 100 : null, laneCost: l?.costed ? l.cost / l.costed : null };
        }).sort((a, b) => b.laneOrders - a.laneOrders || (b.c.onTimeRate ?? -1) - (a.c.onTimeRate ?? -1) || (a.c.costPerOrder ?? Infinity) - (b.c.costPerOrder ?? Infinity)).slice(0, 3);
      };
      let targets: V[];
      if (intent === 'ALT_CARRIER') targets = delayed(tm).filter(v => v.open);
      else { const p = pickTarget(tm, query); targets = p.length ? p : [...activeFos.filter(v => !v.x.tsp), ...unplannedFus(tm).slice(0, 10)]; }
      const rows = targets.slice(0, 40).map(v => {
        const alts = rank(v.x.tsp, `${v.origin}|${v.dest}`);
        return { doc: `${v.x.cat === 'FU' ? 'Freight unit' : 'Freight order'} ${v.x.id}`, lane: tm.laneLabel(v), current: tm.bp(v.x.tsp) || '(none)', delay: (v.arrDelayH ?? v.depDelayH) ? dur((v.arrDelayH ?? v.depDelayH)!) : '',
          recommended: alts.map(a => `${a.c.carrier} (${a.laneOrders ? `${a.laneOrders} on this lane, ${fmt1(a.laneOnTime!)}% on time` : `${a.c.onTimeRate == null ? 'no timed orders' : `${fmt1(a.c.onTimeRate)}% on time overall`}`}${a.c.costPerOrder != null ? `, ${money(a.c.costPerOrder)} ${a.c.cur}/order` : ''})`).join('; ') };
      });
      const text = intent === 'ALT_CARRIER'
        ? `${targets.length} open freight order(s) are delayed. Alternate carriers are ranked by experience on the same lane, then on-time rate and cost.`
        : rows.length ? `Carrier recommendation for ${rows.length} open shipment(s) without a carrier${pickTarget(tm, query).length ? '' : ' (no document number was given, so open freight orders without a carrier and the newest unplanned freight units are used)'}, ranked by lane history, on-time rate and cost.` : 'There is no open shipment without a carrier to recommend for.';
      return r(text, [
        sec(intent === 'ALT_CARRIER' ? 'Alternate Carriers for Delayed Freight Orders' : 'Recommended Carriers', cols(['doc', 'Document'], ['lane', 'Lane'], ['current', 'Current Carrier'], ['delay', 'Delay'], ['recommended', 'Recommended Carriers']), rows, undefined, note(tm)),
        sec('Carrier Scorecard', tm.SCORE_COLS, s.map(tm.scoreRow))
      ], true, CARRIER_PERSONA);
    }
    case 'COST_TODAY': {
      const list = tm.foViews.filter(v => !tm.isCanceled(v.x) && (tm.localDay(v.plannedDep) === today || tm.localDay(v.x.created) === today));
      const total = list.reduce((a, v) => a + (v.cost || 0), 0);
      const curs = [...new Set(list.map(v => v.cur).filter(Boolean))].join('/');
      const costed = list.filter(v => v.cost);
      return r(!list.length ? `No freight orders are planned to depart or were created today (${todayTxt}), so there is no transportation cost for today's shipments.`
        : !costed.length ? `${list.length} freight order(s) are planned to depart or were created today (${todayTxt}) (${list.map(v => v.x.id).join(', ')}), but none has calculated freight charges yet, so today's transportation cost is not determined.`
        : `${list.length} freight order(s) are planned to depart or were created today (${todayTxt}) with total charges of ${money(total)} ${curs}${costed.length < list.length ? `; ${list.length - costed.length} have no calculated charges yet` : ''}.`,
        [sec(`Transportation Cost of Today's Shipments (${todayTxt})`, [...tm.FO_COLS, ...cols(['charges', 'Charges'])], list.map(v => ({ ...tm.foRow(v), charges: v.cost ? `${money(v.cost)} ${v.cur}` : 'not calculated' })), [{ label: 'Shipments', value: String(list.length) }, { label: 'Charges', value: `${money(total)} ${curs}` }], note(tm))]);
    }
    case 'LANE_COST': case 'SPEND_LANE': {
      const l = laneStats(tm, tm.foViews.filter(v => !tm.isCanceled(v.x))).sort((a, b) => intent === 'LANE_COST' ? (b.costPerTon ?? -1) - (a.costPerTon ?? -1) || b.cost - a.cost : b.cost - a.cost);
      const total = l.reduce((a, b) => a + b.cost, 0);
      return r(intent === 'LANE_COST' ? `Highest-cost lanes: ${l.filter(x => x.cost).slice(0, 3).map(x => `${x.lane}: ${money(x.cost)} ${x.curText}${x.costPerTon != null ? ` (${money(x.costPerTon)} per ton)` : ''}`).join('; ') || 'no lane has charges'}.`
        : `Transportation spend by lane totals ${money(total)} across ${l.length} lanes; top lanes: ${l.filter(x => x.cost).slice(0, 3).map(x => `${x.lane}: ${money(x.cost)} ${x.curText}`).join('; ') || 'none'}.`,
        [sec(intent === 'LANE_COST' ? 'Freight Cost by Lane' : 'Transportation Spend by Lane', LANE_COLS, l.map(laneRow), [{ label: 'Lanes', value: String(l.length) }, { label: 'Total charges', value: money(total) }], note(tm, 'Charges are the calculated freight order charges (D_TCHRGR); cost per ton uses gross weight.'))]);
    }
    case 'SPEND_CARRIER': {
      const s = scores().sort((a, b) => b.spend - a.spend);
      const total = s.reduce((a, b) => a + b.spend, 0);
      const settled = new Map<string, number>(); tm.settlements.forEach(x => settled.set(x.tsp, (settled.get(x.tsp) || 0) + x.amt));
      return r(`Transportation spend by carrier: ${s.filter(x => x.spend).map(x => `${x.carrier} ${money(x.spend)} ${x.cur} (${pct(x.spend, total)})`).join('; ') || 'no charges calculated'}.`,
        [sec('Transportation Spend by Carrier', cols(['carrier', 'Carrier'], ['orders', 'Freight Orders'], ['spend', 'Calculated Charges'], ['share', 'Share'], ['settled', 'Settled (Freight Settlement)'], ['costPerOrder', 'Cost / Order']),
          s.map(x => ({ carrier: x.carrier, orders: x.orders, spend: `${money(x.spend)} ${x.cur}`, share: pct(x.spend, total), settled: money(settled.get(x.id) || 0), costPerOrder: x.costPerOrder == null ? 'n/a' : money(x.costPerOrder) })), [{ label: 'Total charges', value: money(total) }], note(tm))]);
    }
    case 'PLAN_VS_ACTUAL': case 'COST_EXCEEDED': {
      const actualOf = new Map<string, { amt: number; docs: string[]; shared: boolean }>();
      tm.settlements.filter(s => s.tors.length).forEach(s => s.tors.forEach(k => { const id = tm.byKey.get(k)!.id; const e = actualOf.get(id) || { amt: 0, docs: [], shared: false }; if (s.tors.length === 1) e.amt += s.amt; else e.shared = true; e.docs.push(s.id); actualOf.set(id, e); }));
      const rows = tm.foViews.filter(v => v.cost != null || actualOf.has(v.x.id)).map(v => {
        const a = actualOf.get(v.x.id);
        const actual = a && !a.shared && a.amt > 0 ? a.amt : null;
        const variance = actual != null && v.cost != null ? actual - v.cost : null;
        return { v, order: v.x.id, carrier: tm.bp(v.x.tsp), lane: tm.laneLabel(v), planned: v.cost ?? 0, actual, settlements: a ? `${a.docs.join(', ')}${a.shared ? ' (shared with other orders)' : ''}` : '', variance };
      });
      const lanes = laneStats(tm, tm.foViews.filter(v => !tm.isCanceled(v.x)));
      const laneCpt = new Map(lanes.map(l => [l.key, l.costPerTon]));
      if (intent === 'PLAN_VS_ACTUAL') {
        const withBoth = rows.filter(x => x.actual != null);
        const p = withBoth.reduce((a, b) => a + b.planned, 0); const ac = withBoth.reduce((a, b) => a + (b.actual || 0), 0);
        const zeroSettled = rows.filter(x => x.actual == null && x.settlements).length;
        return r(`${withBoth.length} freight order(s) have both calculated (planned) charges and a settled (actual) amount: planned ${money(p)} vs actual ${money(ac)} (variance ${money(ac - p)}${p ? `, ${pct(ac - p, p)}` : ''}). ${zeroSettled} order(s) have a freight settlement document without an amount or shared with other orders, and ${rows.length - withBoth.length - zeroSettled} order(s) with charges are not settled yet.`,
          [sec('Planned vs Actual Freight Cost', cols(['order', 'Freight Order'], ['carrier', 'Carrier'], ['lane', 'Lane'], ['planned', 'Planned Charges'], ['actual', 'Settled Amount'], ['variance', 'Variance'], ['settlements', 'Settlement Docs']),
            rows.map(x => ({ order: x.order, carrier: x.carrier, lane: x.lane, planned: money(x.planned), actual: x.actual == null ? (x.settlements ? 'no settled amount' : 'not settled') : money(x.actual), variance: x.variance == null ? '' : money(x.variance), settlements: x.settlements })),
            [{ label: 'Orders with actuals', value: String(withBoth.length) }, { label: 'Planned', value: money(p) }, { label: 'Actual', value: money(ac) }], note(tm, 'Planned = calculated freight order charges; actual = freight settlement document net amount (D_SF_ROT, linked through settlement items D_SF_ITM).'))]);
      }
      const over = rows.filter(x => (x.variance != null && x.variance > 0) || (() => { const cpt = laneCpt.get(`${x.v.origin}|${x.v.dest}`); const own = x.v.x.weiKg > 0 && x.v.cost ? x.v.cost / (x.v.x.weiKg / 1000) : null; return cpt != null && own != null && own > cpt * 1.25; })());
      return r(over.length ? `${over.length} shipment(s) exceeded the expected freight cost (settled above the calculated charges, or cost per ton more than 25% above their lane average): ${over.slice(0, 8).map(x => x.order).join(', ')}.` : 'No shipment exceeded its expected freight cost (no settlement above calculated charges and no order more than 25% above its lane cost per ton).',
        [sec('Shipments Exceeding Expected Freight Cost', cols(['order', 'Freight Order'], ['carrier', 'Carrier'], ['lane', 'Lane'], ['planned', 'Calculated Charges'], ['actual', 'Settled'], ['costPerTon', 'Cost / Ton'], ['laneAvg', 'Lane Avg / Ton']),
          over.map(x => ({ order: x.order, carrier: x.carrier, lane: x.lane, planned: money(x.planned), actual: x.actual == null ? '' : money(x.actual), costPerTon: x.v.x.weiKg > 0 && x.v.cost ? money(x.v.cost / (x.v.x.weiKg / 1000)) : 'n/a', laneAvg: laneCpt.get(`${x.v.origin}|${x.v.dest}`) == null ? 'n/a' : money(laneCpt.get(`${x.v.origin}|${x.v.dest}`)!) })),
          undefined, note(tm, 'Expected cost = calculated charges on the order and the lane average cost per ton.'))]);
    }
    case 'RATE_INCREASE': {
      const rates = await q('SELECT r~RATE_ID, r~TCET, r~CURRENCY, r~CHANGED_ON, r~CREATED_ON, b~PARTNER FROM /SCMTMS/D_TCRATE AS r LEFT OUTER JOIN BUT000 AS b ON b~PARTNER_GUID = r~CARRIER_UUID', 2000);
      const cutoff = tm.nowMs - 180 * 24 * HOUR;
      const recent = rates.rows.filter(x => (tsMs(x.CHANGED_ON) || 0) >= cutoff);
      const years = new Map<string, Map<string, { cost: number; kg: number }>>();
      tm.foViews.filter(v => v.x.tsp && v.cost && v.x.weiKg > 0).forEach(v => { const y = tm.localDay(v.plannedDep ?? v.x.created).slice(0, 4); const m = years.get(v.x.tsp) || new Map(); const e = m.get(y) || { cost: 0, kg: 0 }; e.cost += v.cost!; e.kg += v.x.weiKg; m.set(y, e); years.set(v.x.tsp, m); });
      const trend = [...years.entries()].map(([tsp, m]) => {
        const ys = [...m.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([y, e]) => ({ y, cpt: e.cost / (e.kg / 1000) }));
        const last = ys[ys.length - 1]; const prev = ys[ys.length - 2];
        return { carrier: tm.bp(tsp), history: ys.map(x => `${x.y}: ${money(x.cpt)}`).join('; '), change: prev ? ((last.cpt - prev.cpt) / prev.cpt) * 100 : null };
      }).sort((a, b) => (b.change ?? -Infinity) - (a.change ?? -Infinity));
      const up = trend.filter(x => x.change != null && x.change > 0);
      return r(`${recent.length} of ${rates.rows.length} rate table(s) were changed in the last 180 days${recent.length ? ` (${recent.slice(0, 5).map(x => `${x.RATE_ID}${x.PARTNER ? ` carrier ${tm.bp(x.PARTNER)}` : ''} on ${tm.show(tsMs(x.CHANGED_ON))}`).join('; ')})` : ''}. Based on freight order charges per ton, ${up.length ? `${up.map(x => `${x.carrier} rose ${fmt1(x.change!)}%`).join('; ')}` : 'no carrier shows a higher cost per ton in its latest year than in the year before'}.`, [
        sec('Carrier Cost per Ton by Year', cols(['carrier', 'Carrier'], ['history', 'Cost per Ton by Year'], ['change', 'Latest vs Previous Year']), trend.map(x => ({ ...x, change: x.change == null ? 'n/a (one year only)' : `${x.change > 0 ? '+' : ''}${fmt1(x.change)}%` })), undefined, note(tm, errNote(rates.error))),
        sec('Rate Tables Changed in the Last 180 Days', cols(['rate', 'Rate Table'], ['chargeType', 'Charge Type'], ['carrier', 'Carrier'], ['currency', 'Currency'], ['changed', 'Changed']), recent.map(x => ({ rate: x.RATE_ID, chargeType: x.TCET, carrier: x.PARTNER ? tm.bp(x.PARTNER) : '', currency: x.CURRENCY, changed: tm.show(tsMs(x.CHANGED_ON)) })), [{ label: 'Rate tables', value: String(rates.rows.length) }, { label: 'Changed (180 days)', value: String(recent.length) }])
      ]);
    }
    case 'ACCESSORIAL': {
      const byHost = new Map<string, { base: number; acc: number; cur: string; types: Map<string, number> }>();
      const typeTotals = new Map<string, number>(); tm.elements.forEach(e => typeTotals.set(e.type, (typeTotals.get(e.type) || 0) + e.amt));
      const leadKnown = tm.leadTypes.size > 0;
      tm.elements.forEach(e => {
        const h = byHost.get(e.host) || { base: 0, acc: 0, cur: e.cur, types: new Map<string, number>() };
        h.types.set(e.type || '(blank)', (h.types.get(e.type || '(blank)') || 0) + e.amt);
        byHost.set(e.host, h);
      });
      byHost.forEach(h => {
        const baseType = leadKnown ? null : [...h.types.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
        h.types.forEach((amt, type) => { if (leadKnown ? tm.leadTypes.has(type) : type === baseType) h.base += amt; else h.acc += amt; });
      });
      const lane = new Map<string, { lane: string; base: number; acc: number; orders: number; cur: string; types: Map<string, number> }>();
      tm.foViews.forEach(v => { const h = byHost.get(v.x.key); if (!h) return; const k = `${v.origin}|${v.dest}`; const e = lane.get(k) || { lane: tm.laneLabel(v), base: 0, acc: 0, orders: 0, cur: h.cur, types: new Map<string, number>() }; e.base += h.base; e.acc += h.acc; e.orders++; h.types.forEach((a, ty) => e.types.set(ty, (e.types.get(ty) || 0) + a)); lane.set(k, e); });
      const all = [...lane.values()]; const totBase = all.reduce((a, b) => a + b.base, 0); const totAcc = all.reduce((a, b) => a + b.acc, 0);
      const avgShare = totBase + totAcc ? totAcc / (totBase + totAcc) : 0;
      const rows = all.map(e => ({ ...e, share: e.base + e.acc ? e.acc / (e.base + e.acc) : 0 })).sort((a, b) => b.share - a.share);
      const excessive = rows.filter(x => x.share > avgShare && x.acc > 0);
      return r(`Accessorial charges are ${pct(totAcc, totAcc + totBase)} of all freight charges on average. ${excessive.length} route(s) are above that average: ${excessive.slice(0, 4).map(x => `${x.lane} ${fmt1(x.share * 100)}% (${money(x.acc)} ${x.cur})`).join('; ') || 'none'}.`,
        [sec('Accessorial Charges by Route', cols(['lane', 'Route (From -> To)'], ['orders', 'Freight Orders'], ['base', 'Base Freight'], ['acc', 'Accessorial'], ['share', 'Accessorial Share'], ['flag', 'Above Average'], ['types', 'Charge Types']),
          rows.map(x => ({ lane: x.lane, orders: x.orders, base: `${money(x.base)} ${x.cur}`, acc: `${money(x.acc)} ${x.cur}`, share: `${fmt1(x.share * 100)}%`, flag: x.share > avgShare && x.acc > 0 ? 'Yes' : '', types: [...x.types.entries()].map(([ty, a]) => `${ty} ${money(a)}`).join('; ') })),
          [{ label: 'Average accessorial share', value: `${fmt1(avgShare * 100)}%` }, { label: 'Routes above average', value: String(excessive.length) }],
          note(tm, leadKnown ? 'Base freight = charge types flagged as leading charge type (/SCMTMS/C_TCET-LEAD_CHRG_TYPE); all others are accessorial.' : 'No charge type is flagged as leading charge type in /SCMTMS/C_TCET, so the largest charge type on each freight order is treated as base freight and all others as accessorial.'))]);
    }
    case 'SPEND_FORECAST': {
      const month = today.slice(0, 6);
      const m = new Map<string, number>(); let cur = '';
      tm.foViews.filter(v => v.cost && !tm.isCanceled(v.x)).forEach(v => { const k = tm.localDay(v.plannedDep ?? v.x.created).slice(0, 6); m.set(k, (m.get(k) || 0) + v.cost!); cur = cur || v.cur; });
      const hist = [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
      const mtd = m.get(month) || 0;
      const day = +today.slice(6, 8); const dim = new Date(Date.UTC(+today.slice(0, 4), +today.slice(4, 6), 0)).getUTCDate();
      const plannedRest = activeFos.filter(v => tm.localDay(v.plannedDep).slice(0, 6) === month && tm.localDay(v.plannedDep) > today).reduce((a, v) => a + (v.cost || 0), 0);
      const last12 = hist.filter(([k]) => k < month).slice(-12);
      const avg = last12.length ? last12.reduce((a, b) => a + b[1], 0) / last12.length : 0;
      const runRate = day ? (mtd / day) * dim : 0;
      return r(`Transportation spend for ${month.slice(0, 4)}-${month.slice(4)}: ${money(mtd)} ${cur} recorded so far (day ${day} of ${dim}) plus ${money(plannedRest)} on freight orders still planned this month. A straight-line run rate gives ${money(runRate)}; the average of the last ${last12.length} month(s) with freight cost is ${money(avg)}.`,
        [sec('Monthly Transportation Spend', cols(['month', 'Month'], ['spend', 'Freight Charges']), hist.map(([k, v]) => ({ month: `${k.slice(0, 4)}-${k.slice(4)}`, spend: `${money(v)} ${cur}` })),
          [{ label: 'Month to date', value: money(mtd) }, { label: 'Planned rest of month', value: money(plannedRest) }, { label: 'Run-rate projection', value: money(runRate) }, { label: 'Avg of past months', value: money(avg) }], note(tm, 'Spend is assigned to the month of planned departure (creation date if no departure is planned).'))], true,
        'You are an SAP TM freight cost analyst. Give a forecast range for this month in 3-5 sentences using only the evidence, and state the method.');
    }
    case 'NOT_DEPARTED': {
      const list = activeFos.filter(v => v.actDep == null).sort((a, b) => (a.plannedDep ?? Infinity) - (b.plannedDep ?? Infinity));
      const overdue = list.filter(v => v.depOverdue);
      return r(`${list.length} open freight order(s) have not departed; ${overdue.length} of them are past their planned departure time.`,
        [sec('Open Freight Orders Not Yet Departed', DELAY_COLS(tm), list.map(v => delayRow(tm, v)), [{ label: 'Not departed', value: String(list.length) }, { label: 'Past planned departure', value: String(overdue.length) }], note(tm, 'Departed = a DEPARTURE execution event at the first stop.'))]);
    }
    case 'TRUCKS_LATE': {
      const own = (loc: string) => /plant|shipping point|distribution|warehouse|storage|loading|docking/i.test(tm.locMap.get(loc)?.type || '');
      const rows: Record<string, string | number>[] = [];
      tm.foViews.filter(v => !tm.isCanceled(v.x)).forEach(v => (tm.stopsOf.get(v.x.key) || []).filter(s => s.cat === 'I' && own(s.loc) && s.plan != null).forEach(s => {
        const arr = (tm.evOf.get(v.x.key) || []).filter(e => e.stop === s.key && ['ARRIV_DEST', 'ARRIVAL_DOOR', 'CHECK_IN', 'EP_ARRIVAL', 'EP_CHECK_IN'].includes(e.code) && e.at != null).map(e => e.at!).sort((a, b) => a - b)[0] ?? null;
        const late = arr != null ? (arr - s.plan!) / HOUR : (v.open && s.plan! < tm.nowMs ? (tm.nowMs - s.plan!) / HOUR : null);
        if (late != null && late > 0) rows.push({ order: v.x.id, carrier: tm.bp(v.x.tsp), warehouse: tm.locLabel(s.loc), planned: tm.show(s.plan), actual: arr ? tm.show(arr) : 'not arrived', late: dur(late), vehicle: v.vehicle || v.mtr });
      }));
      return r(rows.length ? `${rows.length} truck arrival(s) at own warehouse/plant locations are late: ${rows.slice(0, 5).map(x => `${x.order} at ${x.warehouse} (${x.late}${x.actual === 'not arrived' ? ', not arrived' : ''})`).join('; ')}.` : 'No truck arrival at an own warehouse, plant or shipping point is late against its planned stop time.',
        [sec('Late Truck Arrivals at Warehouses', cols(['order', 'Freight Order'], ['carrier', 'Carrier'], ['warehouse', 'Warehouse / Plant'], ['planned', 'Planned Arrival'], ['actual', 'Actual Arrival'], ['late', 'Late By'], ['vehicle', 'Vehicle']), rows, undefined, note(tm, 'Own locations = TM locations whose location type is plant, shipping point, distribution center, storage, loading or docking location.'))]);
    }
    case 'IN_TRANSIT': {
      const list = activeFos.filter(v => v.inTransit);
      return r(`${list.length} freight order(s) are currently in transit (departed, not yet arrived at the final stop)${list.length ? `: ${list.map(v => v.x.id).join(', ')}` : ''}.`,
        [sec('Shipments Currently in Transit', [...DELAY_COLS(tm), ...cols(['vehicle', 'Vehicle'])], list.map(v => ({ ...delayRow(tm, v), vehicle: v.vehicle || v.mtr })), [{ label: 'In transit', value: String(list.length) }], note(tm))]);
    }
    case 'MISSED_PICKUP': {
      const withAppt = tm.foViews.filter(v => v.f?.appt != null).length;
      const list = activeFos.filter(v => v.plannedDep != null && v.plannedDep < tm.nowMs && v.actDep == null && !(tm.evOf.get(v.x.key) || []).some(e => e.stop === v.f?.key && ['CHECK_IN', 'EP_CHECK_IN', 'ARRIVAL_DOOR', 'LOAD_END', 'EP_LOAD_END'].includes(e.code)));
      return r(`${withAppt ? `${withAppt} pickup stop(s) carry a booked appointment time; missed pickups` : 'No pickup appointments are booked on TM stops, so missed pickups'} are measured against the planned pickup time: ${list.length} open freight order(s) passed their planned pickup without any check-in, loading or departure event${list.length ? ` (${list.slice(0, 8).map(v => v.x.id).join(', ')})` : ''}.`,
        [sec('Missed Pickups', DELAY_COLS(tm), list.map(v => delayRow(tm, v)), [{ label: 'Missed pickups', value: String(list.length) }, { label: 'Stops with appointment', value: String(withAppt) }], note(tm))]);
    }
    case 'EXEC_EXCEPTIONS': {
      const rows: Record<string, string | number>[] = [];
      tm.foViews.filter(v => !tm.isCanceled(v.x)).forEach(v => {
        const reasons: string[] = [];
        const ex = tm.t('TOR_EXECUTION_STATUS', v.x.exec);
        if (/interrupt|not ready/i.test(ex)) reasons.push(`Execution status: ${ex}`);
        if (v.x.blkExec) reasons.push('Execution blocked');
        if (v.x.blkPlan) reasons.push('Planning blocked');
        if (v.depOverdue) reasons.push(`Departure overdue ${dur(v.depDelayH!)}`);
        else if (v.depLate) reasons.push(`Departed ${dur(v.depDelayH!)} late`);
        if (v.arrOverdue) reasons.push(`Arrival overdue ${dur(v.arrDelayH!)}`);
        else if (v.arrLate) reasons.push(`Arrived ${dur(v.arrDelayH!)} late`);
        const evs = tm.evOf.get(v.x.key) || [];
        const rev = evs.filter(e => e.revoked === 'X' || e.code === 'RECALL_EVENT').length; if (rev) reasons.push(`${rev} revoked/recalled event(s)`);
        const disc = evs.filter(e => e.discrepancy || e.reason).length; if (disc) reasons.push(`${disc} event(s) with reason/discrepancy`);
        if (reasons.length) rows.push({ order: v.x.id, carrier: tm.bp(v.x.tsp), status: `${tm.lcText(v.x)} / ${ex}`, lane: tm.laneLabel(v), exceptions: reasons.join('; ') });
      });
      return r(`${rows.length} freight order(s) have execution exceptions (delays, blocks, interrupted status or revoked/recalled events).`,
        [sec('Freight Orders with Execution Exceptions', cols(['order', 'Freight Order'], ['carrier', 'Carrier'], ['status', 'Status'], ['lane', 'Lane'], ['exceptions', 'Exceptions']), rows, [{ label: 'With exceptions', value: String(rows.length) }], note(tm))]);
    }
    case 'WAITING_DOCK': case 'DETENTION': {
      const IN = ['CHECK_IN', 'ARRIVAL_DOOR', 'EP_CHECK_IN'];
      const OUT = ['CHECK_OUT', 'DEPARTURE_DOOR', 'EP_CHECK_OUT', 'DEPARTURE', 'EP_DEPARTURE', 'LAST_DEPARTURE'];
      const visits: { v: V; stop: string; loc: string; inAt: number; outAt: number | null; dwellH: number; waiting: boolean }[] = [];
      tm.foViews.filter(v => !tm.isCanceled(v.x)).forEach(v => {
        const evs = tm.evOf.get(v.x.key) || [];
        const stops = new Set(evs.filter(e => IN.includes(e.code)).map(e => e.stop));
        stops.forEach(st => {
          const ins = evs.filter(e => e.stop === st && IN.includes(e.code) && e.at != null).map(e => e.at!).sort((a, b) => a - b);
          const outs = evs.filter(e => e.stop === st && OUT.includes(e.code) && e.at != null).map(e => e.at!).sort((a, b) => a - b);
          if (!ins.length) return;
          const inAt = ins[0]; const outAt = outs.filter(o => o >= inAt).pop() ?? null;
          const waiting = outAt == null && v.open;
          const loc = (tm.stopsOf.get(v.x.key) || []).find(s => s.key === st)?.loc || evs.find(e => e.stop === st)?.loc || '';
          visits.push({ v, stop: st, loc, inAt, outAt, dwellH: ((outAt ?? tm.nowMs) - inAt) / HOUR, waiting });
        });
      });
      const row = (x: typeof visits[number]) => ({ order: x.v.x.id, carrier: tm.bp(x.v.x.tsp), location: tm.locLabel(x.loc), checkIn: tm.show(x.inAt), checkOut: x.outAt ? tm.show(x.outAt) : 'still at dock', dwell: dur(x.dwellH), vehicle: x.v.vehicle || x.v.mtr });
      const VCOLS = cols(['order', 'Freight Order'], ['carrier', 'Carrier'], ['location', 'Location'], ['checkIn', 'Checked In'], ['checkOut', 'Checked Out'], ['dwell', 'Dwell Time'], ['vehicle', 'Vehicle']);
      if (intent === 'WAITING_DOCK') {
        const w = visits.filter(x => x.waiting).sort((a, b) => b.dwellH - a.dwellH);
        return r(w.length ? `${w.length} shipment(s) are checked in at a dock/door without a check-out or departure: ${w.slice(0, 6).map(x => `${x.v.x.id} at ${tm.locLabel(x.loc)} for ${dur(x.dwellH)}`).join('; ')}.` : `No open shipment is waiting at a dock: every check-in/door arrival of an open freight order has a matching check-out or departure (${visits.length} dock visits recorded).`,
          [sec('Shipments Waiting at the Dock', VCOLS, w.map(row), [{ label: 'Waiting now', value: String(w.length) }, { label: 'Dock visits recorded', value: String(visits.length) }], note(tm, 'Waiting = CHECK_IN/ARRIVAL_DOOR event without a later CHECK_OUT/DEPARTURE_DOOR/DEPARTURE event at the same stop.'))]);
      }
      const med = median(visits.filter(x => x.outAt).map(x => x.dwellH));
      const risk = visits.filter(x => x.dwellH > 2).sort((a, b) => b.dwellH - a.dwellH);
      return r(`${visits.length} dock visit(s) recorded; median dwell ${fmt1(med)} h. ${risk.length} visit(s) exceeded 2 hours (${risk.filter(x => x.waiting).length} still at the dock), which is where detention or demurrage charges would arise: ${risk.slice(0, 5).map(x => `${x.v.x.id} ${dur(x.dwellH)}`).join('; ') || 'none'}.`,
        [sec('Detention / Demurrage Risk (Dwell Time at Stops)', VCOLS, risk.map(row), [{ label: 'Dock visits', value: String(visits.length) }, { label: 'Median dwell', value: `${fmt1(med)} h` }, { label: 'Over 2 hours', value: String(risk.length) }],
          note(tm, 'No free-time or detention terms are maintained on the freight orders, so 2 hours of dwell is used as the risk threshold. Dwell = check-in to check-out/departure at the same stop.'))]);
    }
    case 'POD': {
      const rows = tm.fuViews.map(v => ({ v, d: tm.dlvOf.get(v.x.key) })).filter(x => x.d && x.d.WADAT_IST && x.d.WADAT_IST !== '00000000' && x.d.PDSTK && x.d.PDSTK !== 'C');
      const execNotDelivered = tm.foViews.filter(v => /executed/i.test(tm.t('TOR_EXECUTION_STATUS', v.x.exec)) && /not delivered/i.test(tm.t('DELIVERY_STATUS', v.x.dlv)));
      const all = await q("SELECT PDSTK, COUNT( * ) AS N FROM LIKP WHERE PDSTK <> '' GROUP BY PDSTK", 10);
      return r(`${rows.length} TM-relevant delivery(ies) have goods issue posted but proof of delivery is not confirmed (POD status ${[...new Set(rows.map(x => tm.pdstkText.get(x.d!.PDSTK) || x.d!.PDSTK))].join('/') || 'n/a'}). ${execNotDelivered.length} executed freight order(s) still show delivery status "Not Delivered". System-wide POD status on deliveries: ${all.rows.map(x => `${tm.pdstkText.get(x.PDSTK) || x.PDSTK}: ${num(x.N)}`).join('; ') || 'none'}.`, [
        sec('Proof-of-Delivery Exceptions (TM Deliveries)', cols(['delivery', 'Delivery'], ['unit', 'Freight Unit'], ['customer', 'Customer'], ['gi', 'Goods Issue'], ['deliveryDate', 'Delivery Date'], ['pod', 'POD Status'], ['days', 'Days Since GI']),
          rows.map(x => ({ delivery: strip(x.d!.VBELN), unit: x.v.x.id, customer: tm.bp(x.d!.KUNNR), gi: tm.showDay(x.d!.WADAT_IST), deliveryDate: tm.showDay(x.d!.LFDAT), pod: tm.pdstkText.get(x.d!.PDSTK) || x.d!.PDSTK, days: Math.round((Date.UTC(+today.slice(0, 4), +today.slice(4, 6) - 1, +today.slice(6, 8)) - Date.UTC(+x.d!.WADAT_IST.slice(0, 4), +x.d!.WADAT_IST.slice(4, 6) - 1, +x.d!.WADAT_IST.slice(6, 8))) / 86400000) })),
          [{ label: 'POD outstanding', value: String(rows.length) }, { label: 'Executed but not delivered', value: String(execNotDelivered.length) }], note(tm, `POD status from LIKP-PDSTK. ${errNote(all.error)}`)),
        sec('Executed Freight Orders Still "Not Delivered"', tm.FO_COLS, execNotDelivered.map(tm.foRow))
      ]);
    }
    case 'CUSTOMERS_AFFECTED': {
      const m = new Map<string, { customer: string; orders: Set<string>; units: Set<string>; maxDelay: number }>();
      const add = (cust: string, doc: string, kind: 'orders' | 'units', d: number) => { if (!cust) return; const e = m.get(cust) || { customer: tm.bp(cust), orders: new Set<string>(), units: new Set<string>(), maxDelay: 0 }; e[kind].add(doc); e.maxDelay = Math.max(e.maxDelay, d); m.set(cust, e); };
      delayed(tm).filter(v => v.open).forEach(v => {
        const d = Math.max(v.depDelayH || 0, v.arrDelayH || 0);
        add(v.x.consignee, v.x.id, 'orders', d);
        tm.fuViews.filter(f => tm.foOfFu.get(f.x.key) === v.x.key).forEach(f => add(f.x.consignee || tm.dlvOf.get(f.x.key)?.KUNNR || '', f.x.id, 'units', d));
      });
      unplannedFus(tm).forEach(v => { const dl = tm.dlvOf.get(v.x.key); if (dl && dl.LFDAT && dl.LFDAT < today) add(v.x.consignee || dl.KUNNR, v.x.id, 'units', (tm.nowMs - Date.UTC(+dl.LFDAT.slice(0, 4), +dl.LFDAT.slice(4, 6) - 1, +dl.LFDAT.slice(6, 8))) / HOUR); });
      const rows = [...m.values()].sort((a, b) => b.orders.size + b.units.size - (a.orders.size + a.units.size)).map(e => ({ customer: e.customer, orders: e.orders.size, units: e.units.size, docs: [...e.orders, ...e.units].slice(0, 8).join(', '), maxDelay: `${fmt1(e.maxDelay / 24)} days` }));
      return r(`${rows.length} customer(s) are affected by transportation delays (delayed open freight orders or unplanned freight units past their delivery date): ${rows.slice(0, 5).map(x => `${x.customer} (${x.orders} order(s), ${x.units} unit(s))`).join('; ') || 'none'}.`,
        [sec('Customers Affected by Transportation Delays', cols(['customer', 'Customer'], ['orders', 'Delayed Freight Orders'], ['units', 'Affected Freight Units'], ['docs', 'Documents'], ['maxDelay', 'Max Delay']), rows, [{ label: 'Customers affected', value: String(rows.length) }], note(tm))]);
    }
    case 'BEST_ROUTE': {
      const p = pickTarget(tm, query);
      const target = p[0] || unplannedFus(tm).filter(v => v.origin && v.dest).sort((a, b) => (b.x.created || 0) - (a.x.created || 0))[0];
      if (!target) return r('There is no open shipment with a known origin and destination to route.', []);
      const hist = tm.foViews.filter(v => v.origin === target.origin && v.dest === target.dest && !tm.isCanceled(v.x) && v.x.key !== target.x.key);
      const opts = new Map<string, { carrier: string; mtr: string; n: number; transit: number[]; planned: number[]; cost: number[]; stops: number[]; km: number[] }>();
      hist.forEach(v => { const k = `${v.x.tsp}|${v.mtr}`; const e = opts.get(k) || { carrier: tm.bp(v.x.tsp) || '(none)', mtr: v.mtr, n: 0, transit: [], planned: [], cost: [], stops: [], km: [] }; e.n++; if (v.actDep && v.actArr && v.actArr > v.actDep) e.transit.push((v.actArr - v.actDep) / HOUR); if (v.plannedDep && v.plannedArr && v.plannedArr > v.plannedDep) e.planned.push((v.plannedArr - v.plannedDep) / HOUR); if (v.cost) e.cost.push(v.cost); if (v.x.distKm > 0) e.km.push(v.x.distKm); e.stops.push((tm.stopsOf.get(v.x.key) || []).length); opts.set(k, e); });
      const rows = [...opts.values()].map(e => ({ carrier: e.carrier, mtr: e.mtr, orders: e.n, distance: e.km.length ? `${fmt1(median(e.km))} km` : 'n/a', plannedTransit: e.planned.length ? dur(median(e.planned)) : 'n/a', actualTransit: e.transit.length ? dur(median(e.transit)) : 'n/a', cost: e.cost.length ? money(median(e.cost)) : 'n/a', stops: e.stops.length ? fmt1(median(e.stops)) : '' }));
      const withKm = [...opts.values()].some(e => e.km.length);
      return r(`Route options for ${target.x.cat === 'FU' ? 'freight unit' : 'freight order'} ${target.x.id} from ${tm.locLabel(target.origin)} to ${tm.locLabel(target.dest)}: ${hist.length} past freight order(s) used this lane with ${rows.length} carrier/vehicle combination(s)${withKm ? '' : '; none of them has a TM-determined distance, so options are compared on transit time, stops and cost'}.`,
        [sec(`Route Options ${tm.locLabel(target.origin)} -> ${tm.locLabel(target.dest)}`, cols(['carrier', 'Carrier'], ['mtr', 'Means of Transport'], ['orders', 'Past Orders'], ['distance', 'Distance (median)'], ['plannedTransit', 'Planned Transit (median)'], ['actualTransit', 'Actual Transit (median)'], ['stops', 'Stops'], ['cost', 'Cost (median)']), rows, undefined, note(tm)),
          sec('Shipment', tm.FU_COLS, [tm.fuRow(target)])], true, 'You are an SAP TM transportation planner. Recommend the best route/carrier option in 3-5 sentences using only the evidence.');
    }
    case 'CONSOLIDATE': case 'LANES_CONSOLIDATE': case 'OPTIMAL_PLAN': case 'CAPACITY_SHORTAGE': case 'REDUCE_COST': case 'SAVINGS': case 'UNDERUTILIZED': case 'TRAILER_UTIL': case 'EMPTY_MILES': case 'WH_DELAYS':
      return buildNetwork(tm, intent, query, today, tomorrow);
    default:
      return r('This transportation question is not mapped.', []);
  }
}

function buildNetwork(tm: Tm, intent: TmIntent, query: string, today: string, tomorrow: string): TmLiveReport {
  const r = (text: string, sections: TmSection[], assess = false, persona?: string): TmLiveReport => ({ text, sections, assess, persona });
  const caps = tm.foViews.filter(v => v.x.capKg > 0).map(v => v.x.capKg);
  const typicalCap = median(caps);
  const groups = () => {
    const sel = pickTarget(tm, query).filter(v => v.x.cat === 'FU');
    const pool = sel.length ? sel : unplannedFus(tm);
    const m = new Map<string, { lane: string; origin: string; dest: string; units: V[]; kg: number; dates: Set<string> }>();
    pool.forEach(v => { const k = `${v.origin}|${v.dest}`; const e = m.get(k) || { lane: tm.laneLabel(v), origin: v.origin, dest: v.dest, units: [], kg: 0, dates: new Set<string>() }; e.units.push(v); e.kg += v.x.weiKg; const d = tm.dlvOf.get(v.x.key); if (d?.LFDAT) e.dates.add(tm.showDay(d.LFDAT)); m.set(k, e); });
    return { selected: sel.length > 0, list: [...m.values()].sort((a, b) => b.units.length - a.units.length) };
  };
  const scores = tm.scorecard();
  const bestCarrier = (origin: string, dest: string) => {
    const lane = tm.foViews.filter(v => v.origin === origin && v.dest === dest && v.x.tsp && !tm.isCanceled(v.x));
    const cnt = new Map<string, number>(); lane.forEach(v => cnt.set(v.x.tsp, (cnt.get(v.x.tsp) || 0) + 1));
    const ranked = scores.map(s => ({ s, lane: cnt.get(s.id) || 0 })).sort((a, b) => b.lane - a.lane || (b.s.onTimeRate ?? -1) - (a.s.onTimeRate ?? -1) || (a.s.costPerOrder ?? Infinity) - (b.s.costPerOrder ?? Infinity));
    return ranked[0] ? `${ranked[0].s.carrier}${ranked[0].lane ? ` (${ranked[0].lane} past orders on lane)` : ''}` : '(no carrier history)';
  };
  const GROUP_COLS = cols(['lane', 'Lane (From -> To)'], ['units', 'Freight Units'], ['kg', 'Gross Wt (kg)'], ['vehicles', 'Vehicles Needed'], ['dates', 'Delivery Dates'], ['carrier', 'Suggested Carrier'], ['docs', 'Freight Units']);
  const groupRow = (g: ReturnType<typeof groups>['list'][number]) => ({ lane: g.lane, units: g.units.length, kg: fmt1(g.kg), vehicles: typicalCap ? Math.max(1, Math.ceil(g.kg / typicalCap)) : 'n/a', dates: [...g.dates].sort().slice(0, 4).join(', '), carrier: bestCarrier(g.origin, g.dest), docs: g.units.slice(0, 10).map(v => v.x.id).join(', ') });
  const util = tm.foViews.filter(v => !tm.isCanceled(v.x) && (v.x.capKg > 0 || v.x.volCap > 0));
  const utilRow = (v: V) => ({ order: v.x.id, carrier: tm.bp(v.x.tsp), lane: tm.laneLabel(v), mtr: v.mtr, vehicle: v.vehicle, weight: `${fmt1(v.x.weiKg)} / ${fmt1(v.x.capKg)} kg`, mass: v.x.capKg ? `${fmt1(v.weightPct)}%` : 'n/a', volume: v.x.volCap ? `${fmt1(v.volPct)}%` : 'n/a', util: `${fmt1(v.utilPct)}%` });
  const UTIL_COLS = cols(['order', 'Freight Order'], ['carrier', 'Carrier'], ['lane', 'Lane'], ['mtr', 'Means of Transport'], ['vehicle', 'Vehicle'], ['weight', 'Load / Capacity'], ['mass', 'Weight Util.'], ['volume', 'Volume Util.'], ['util', 'Utilization (max)']);
  const under = util.filter(v => v.utilPct < 50).sort((a, b) => a.utilPct - b.utilPct);
  const capNote = `Capacity from the freight order vehicle capacity (GRO_WEI_VALCAP); ${caps.length} freight orders carry a capacity, median ${fmt1(typicalCap)} kg.`;

  switch (intent) {
    case 'CONSOLIDATE': {
      const g = groups();
      const cand = g.list.filter(x => x.units.length > 1);
      return r(`${g.selected ? 'For the given freight units' : `Among ${unplannedFus(tm).length} unplanned freight units`}, ${cand.length} lane(s) have more than one unit that can be consolidated into one load: ${cand.slice(0, 4).map(x => `${x.lane}: ${x.units.length} units, ${fmt1(x.kg)} kg (${typicalCap ? Math.max(1, Math.ceil(x.kg / typicalCap)) : 'n/a'} vehicle(s))`).join('; ') || 'none'}.`,
        [sec('Consolidation Candidates (Unplanned Freight Units by Lane)', GROUP_COLS, cand.map(groupRow), [{ label: 'Lanes with 2+ units', value: String(cand.length) }, { label: 'Typical vehicle capacity', value: `${fmt1(typicalCap)} kg` }], note(tm, capNote))]);
    }
    case 'LANES_CONSOLIDATE': {
      const l = laneStats(tm, tm.foViews.filter(v => !tm.isCanceled(v.x)));
      const g = groups().list;
      const rows = l.map(x => ({ ...laneRow(x), pending: g.find(y => `${y.origin}|${y.dest}` === x.key)?.units.length || 0, reason: [x.orders > 1 && x.avgUtil != null && x.avgUtil < 50 ? 'low average utilization' : '', (g.find(y => `${y.origin}|${y.dest}` === x.key)?.units.length || 0) > 1 ? 'several unplanned units waiting' : '', x.carriers.size > 1 ? 'served by several carriers' : ''].filter(Boolean).join('; ') })).filter(x => x.reason).sort((a, b) => b.pending - a.pending || b.orders - a.orders);
      return r(`${rows.length} lane(s) are candidates for consolidation: ${rows.slice(0, 4).map(x => `${x.lane} (${x.reason})`).join('; ') || 'none'}.`,
        [sec('Lanes to Consolidate', [...LANE_COLS, ...cols(['pending', 'Unplanned Units'], ['reason', 'Why'])], rows, undefined, note(tm, 'Low utilization = average under 50% of vehicle capacity.'))], true, 'You are an SAP TM network planner. Recommend which lanes to consolidate first in 3-5 sentences using only the evidence.');
    }
    case 'UNDERUTILIZED':
      return r(`${under.length} of ${util.length} freight order(s) with a known capacity are loaded below 50%: ${under.slice(0, 5).map(v => `${v.x.id} ${fmt1(v.utilPct)}%`).join('; ') || 'none'}.`,
        [sec('Underutilized Loads (below 50%)', UTIL_COLS, under.map(utilRow), [{ label: 'Underutilized', value: String(under.length) }, { label: 'With capacity data', value: String(util.length) }], note(tm, `${capNote} Utilization = higher of weight and volume utilization (load vs vehicle capacity on the freight order).`))]);
    case 'TRAILER_UTIL': {
      const avg = util.length ? util.reduce((a, v) => a + v.utilPct, 0) / util.length : 0;
      const trailers = tm.itemList.filter(i => i.cat === 'PVR');
      return r(`${util.length} freight order(s) carry vehicle capacity data; average utilization ${fmt1(avg)}%, ${under.length} below 50%. ${trailers.length} trailer resource item(s) are recorded.`,
        [sec('Trailer / Vehicle Utilization', UTIL_COLS, [...util].sort((a, b) => b.utilPct - a.utilPct).map(utilRow), [{ label: 'Average utilization', value: `${fmt1(avg)}%` }, { label: 'Trailer items', value: String(trailers.length) }], note(tm, capNote))]);
    }
    case 'EMPTY_MILES': {
      const dist = tm.fos.reduce((a, x) => a + x.distKm, 0); const empty = tm.fos.reduce((a, x) => a + x.emptyKm, 0);
      const l = laneStats(tm, tm.foViews.filter(v => !tm.isCanceled(v.x)));
      const keys = new Set(l.map(x => x.key));
      const oneWay = l.filter(x => { const [o, d] = x.key.split('|'); return !keys.has(`${d}|${o}`); });
      return r(`Total distance recorded on freight orders: ${fmt1(dist)} km, empty distance: ${fmt1(empty)} km${dist === 0 ? ' — TM distance determination has not been run on these orders, so empty miles cannot be measured directly' : empty === 0 ? ' — no empty-mile distance has been determined on any order, so empty running is not measured directly' : ''}. ${oneWay.length} of ${l.length} lanes have no return (backhaul) freight order, which is where trucks run back empty and backhaul loads would reduce empty miles.`,
        [sec('Lanes Without Backhaul', LANE_COLS, oneWay.map(laneRow), [{ label: 'Distance recorded', value: `${fmt1(dist)} km` }, { label: 'Empty distance', value: `${fmt1(empty)} km` }, { label: 'One-way lanes', value: String(oneWay.length) }], note(tm))], true, 'You are an SAP TM network planner. Suggest how to reduce empty miles in 3-5 sentences using only the evidence.');
    }
    case 'WH_DELAYS': {
      const m = new Map<string, { loc: string; orders: number; late: number; overdue: number; delays: number[]; load: number[] }>();
      tm.foViews.filter(v => !tm.isCanceled(v.x) && v.origin).forEach(v => {
        const e = m.get(v.origin) || { loc: tm.locLabel(v.origin), orders: 0, late: 0, overdue: 0, delays: [], load: [] };
        e.orders++; if (v.depLate) { e.late++; e.delays.push(v.depDelayH!); } if (v.depOverdue) e.overdue++;
        const evs = tm.evOf.get(v.x.key) || [];
        const rs = evs.filter(x => x.code === 'READY_LOAD' && x.at).map(x => x.at!).sort((a, b) => a - b)[0]; const le = evs.filter(x => ['LOAD_END', 'EP_LOAD_END'].includes(x.code) && x.at).map(x => x.at!).sort((a, b) => b - a)[0];
        if (rs && le && le > rs) e.load.push((le - rs) / HOUR);
        m.set(v.origin, e);
      });
      const rows = [...m.values()].sort((a, b) => b.late - a.late).map(e => ({ warehouse: e.loc, type: '', orders: e.orders, late: e.late, overdue: e.overdue, lateRate: pct(e.late, e.orders), avgDelay: e.delays.length ? dur(e.delays.reduce((a, b) => a + b, 0) / e.delays.length) : '', loading: e.load.length ? dur(median(e.load)) : 'n/a' }));
      return r(`Departure delays by shipping location: ${rows.filter(x => x.late).slice(0, 4).map(x => `${x.warehouse}: ${x.late} of ${x.orders} late (${x.overdue} not yet departed)`).join('; ') || 'no location has late departures'}.`,
        [sec('Warehouses / Shipping Points Causing Transportation Delays', cols(['warehouse', 'Warehouse / Shipping Point'], ['orders', 'Freight Orders'], ['late', 'Late Departures'], ['overdue', 'Not Departed (overdue)'], ['lateRate', 'Late Rate'], ['avgDelay', 'Avg Departure Delay'], ['loading', 'Median Loading Time']), rows, undefined, note(tm, 'Loading time = READY_LOAD to LOAD_END execution events.'))]);
    }
    case 'CAPACITY_SHORTAGE': {
      const demand = fuOpen(tm).filter(v => { const d = tm.dlvOf.get(v.x.key); return tm.localDay(v.plannedDep) === tomorrow || d?.WADAT === tomorrow; });
      const backlog = unplannedFus(tm).filter(v => { const d = tm.dlvOf.get(v.x.key); return d?.WADAT && d.WADAT < tomorrow; });
      const supply = tm.foViews.filter(v => !tm.isCanceled(v.x) && tm.localDay(v.plannedDep) === tomorrow);
      const dKg = demand.reduce((a, v) => a + v.x.weiKg, 0); const bKg = backlog.reduce((a, v) => a + v.x.weiKg, 0);
      const sKg = supply.reduce((a, v) => a + (v.x.capKg || 0), 0);
      const gap = dKg + bKg - sKg;
      return r(`Tomorrow (${tm.showDay(tomorrow)}): ${demand.length} freight unit(s) (${fmt1(dKg)} kg) are due for pickup and ${backlog.length} unplanned unit(s) (${fmt1(bKg)} kg) are already overdue, against ${supply.length} freight order(s) planned to depart with ${fmt1(sKg)} kg capacity. ${gap > 0 ? `That is a shortage of about ${fmt1(gap)} kg, roughly ${typicalCap ? Math.ceil(gap / typicalCap) : 'n/a'} vehicle(s) at the typical capacity of ${fmt1(typicalCap)} kg.` : 'Planned capacity covers the demand.'}`,
        [sec(`Capacity Demand vs Supply for ${tm.showDay(tomorrow)}`, cols(['item', 'Measure'], ['value', 'Value']), [
          { item: 'Freight units due tomorrow', value: demand.length }, { item: 'Weight due tomorrow (kg)', value: fmt1(dKg) }, { item: 'Overdue unplanned freight units', value: backlog.length }, { item: 'Overdue weight (kg)', value: fmt1(bKg) },
          { item: 'Freight orders departing tomorrow', value: supply.length }, { item: 'Planned capacity (kg)', value: fmt1(sKg) }, { item: 'Shortage (kg)', value: gap > 0 ? fmt1(gap) : '0' }, { item: 'Typical vehicle capacity (kg)', value: fmt1(typicalCap) }
        ], undefined, note(tm, `Demand = open freight units with planned pickup or delivery goods issue date tomorrow. ${capNote}`)),
        sec('Freight Units Due Tomorrow', tm.FU_COLS, demand.map(tm.fuRow))], true, 'You are an SAP TM capacity planner. Give the capacity outlook for tomorrow in 3-5 sentences using only the evidence.');
    }
    case 'OPTIMAL_PLAN': {
      const g = groups().list;
      const kg = g.reduce((a, b) => a + b.kg, 0);
      return r(`Transportation plan for ${unplannedFus(tm).length} unplanned freight units (${fmt1(kg)} kg) on ${g.length} lane(s): ${g.slice(0, 4).map(x => `${x.lane}: ${x.units.length} unit(s) in ${typicalCap ? Math.max(1, Math.ceil(x.kg / typicalCap)) : 'n/a'} vehicle(s) with ${bestCarrier(x.origin, x.dest)}`).join('; ')}.`,
        [sec('Proposed Plan by Lane', GROUP_COLS, g.map(groupRow), [{ label: 'Unplanned units', value: String(unplannedFus(tm).length) }, { label: 'Lanes', value: String(g.length) }, { label: 'Vehicles needed', value: String(g.reduce((a, x) => a + (typicalCap ? Math.max(1, Math.ceil(x.kg / typicalCap)) : 0), 0)) }], note(tm, `Suggested carrier = most past orders on the lane, then best on-time rate and lowest cost. ${capNote}`)),
          sec('Carrier Scorecard', tm.SCORE_COLS, scores.map(tm.scoreRow))], true, 'You are an SAP TM transportation planner. Recommend the optimal plan in 4-6 sentences using only the evidence.');
    }
    case 'SAVINGS': case 'REDUCE_COST': {
      const l = laneStats(tm, tm.foViews.filter(v => !tm.isCanceled(v.x)));
      const multi = l.filter(x => x.carriers.size > 1);
      const laneSav: Record<string, string | number>[] = [];
      multi.forEach(x => {
        const per = new Map<string, { cost: number; kg: number }>();
        tm.foViews.filter(v => `${v.origin}|${v.dest}` === x.key && v.cost && v.x.weiKg > 0 && v.x.tsp).forEach(v => { const e = per.get(v.x.tsp) || { cost: 0, kg: 0 }; e.cost += v.cost!; e.kg += v.x.weiKg; per.set(v.x.tsp, e); });
        const cpt = [...per.entries()].map(([id, e]) => ({ id, cpt: e.cost / (e.kg / 1000), cost: e.cost, kg: e.kg })).sort((a, b) => a.cpt - b.cpt);
        if (cpt.length > 1) { const cheap = cpt[0]; const saving = cpt.slice(1).reduce((a, c) => a + (c.cpt - cheap.cpt) * (c.kg / 1000), 0); if (saving > 0) laneSav.push({ action: `Move lane ${x.lane} to ${tm.bp(cheap.id)}`, basis: cpt.map(c => `${tm.bp(c.id)} ${money(c.cpt)}/t`).join('; '), saving: money(saving) }); }
      });
      const g = groups().list.filter(x => x.units.length > 1);
      const noCharge = tm.foViews.filter(v => v.open && (v.cost == null || v.cost === 0));
      const rows = [
        ...laneSav,
        ...g.slice(0, 10).map(x => ({ action: `Consolidate ${x.units.length} unplanned freight units on ${x.lane}`, basis: `${fmt1(x.kg)} kg fits ${typicalCap ? Math.max(1, Math.ceil(x.kg / typicalCap)) : 'n/a'} vehicle(s) instead of ${x.units.length} separate shipments`, saving: '' })),
        ...under.slice(0, 10).map(v => ({ action: `Fill or combine underutilized freight order ${v.x.id}`, basis: `${fmt1(v.utilPct)}% utilized on ${tm.laneLabel(v)}`, saving: '' })),
        ...(noCharge.length ? [{ action: `Calculate charges on ${noCharge.length} open freight order(s)`, basis: `No calculated charges: ${noCharge.slice(0, 6).map(v => v.x.id).join(', ')}`, saving: '' }] : [])
      ];
      return r(`${rows.length} freight cost-saving opportunities found: ${laneSav.length} carrier switch(es) on lanes served by several carriers, ${g.length} consolidation(s) of unplanned freight units, ${under.length} underutilized load(s)${noCharge.length ? `, and ${noCharge.length} open order(s) without calculated charges` : ''}.`,
        [sec(intent === 'SAVINGS' ? 'Freight Cost-Saving Opportunities' : 'Actions to Reduce Logistics Cost Today', cols(['action', 'Action'], ['basis', 'Live Basis'], ['saving', 'Estimated Saving']), rows, undefined, note(tm, `Carrier-switch savings = cost per ton difference to the cheapest carrier on the same lane applied to the volume shipped. ${capNote}`))],
        true, 'You are an SAP TM logistics cost manager. Rank the top actions in 3-6 sentences using only the evidence.');
    }
    default:
      return r('This transportation question is not mapped.', []);
  }
}
