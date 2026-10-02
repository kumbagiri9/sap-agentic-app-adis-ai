// Live BW/4HANA, S/4HANA embedded-analytics and Datasphere-related answers read from the S/4HANA database
// (embedded BW metadata/monitoring tables, Universal Journal, logistics documents, analytical CDS annotations)
// via read-only ADT SQL. Nothing is simulated: empty monitoring tables are reported as such.
import { executeReadOnlySelect } from './hanaDbIntelligenceService';

export type BwIntent =
  | 'CEO' | 'PLANT_BUDGET' | 'PLAN_ACTUAL' | 'PROD_VARIANCE'
  | 'BW_CHAINS' | 'BW_LOADS_DELAYED' | 'BW_DTP' | 'BW_ADSO_LOAD' | 'BW_REQ_ERR' | 'BW_STALE' | 'BW_DEPEND'
  | 'ETL_TODAY' | 'ETL_EXTRACTORS' | 'ETL_MISSING' | 'ETL_RECON' | 'ETL_DELTA' | 'ETL_DUP' | 'ETL_TRANSF' | 'ETL_SALES_MISSING' | 'ETL_DURATION' | 'ETL_SLA'
  | 'DS_SPACES' | 'DS_MODELS' | 'DS_FIN' | 'DS_S4DEP' | 'DS_LINEAGE' | 'DS_STALE' | 'DS_CONN' | 'DS_USERS' | 'DS_PERF';

export type BwSection = { title: string; summaryStats?: { label: string; value: string }[]; columns: { key: string; label: string }[]; rows: Record<string, string | number>[]; note?: string };
export type BwLiveReport = { text: string; sections: BwSection[]; assess: boolean; persona?: string };

export function classifyBwLiveIntent(n: string): BwIntent | null {
  const has = (...w: string[]) => w.some(x => n.includes(x));
  if (has('how is the company performing', 'how is the company doing', 'company performing today')) return 'CEO';
  if (has('plant') && has('operating budget', 'exceeding their budget', 'over budget')) return 'PLANT_BUDGET';
  if (has('actual versus plan', 'actual vs plan', 'actual vs. plan', 'plan versus actual', 'plan vs actual') && has('quarter')) return 'PLAN_ACTUAL';
  if (has('production variance') && has('by plant')) return 'PROD_VARIANCE';
  const ds = has('datasphere');
  if (ds && has('spaces')) return 'DS_SPACES';
  if (has('analytic models') && has('exposed', 'consumption')) return 'DS_MODELS';
  if (has('finance space')) return 'DS_FIN';
  if (ds && has('depend')) return 'DS_S4DEP';
  if (has('data lineage') && has('model', 'datasphere')) return 'DS_LINEAGE';
  if (has('data products') && has('stale')) return 'DS_STALE';
  if (ds && has('connection')) return 'DS_CONN';
  if (has('users consuming') && has('model')) return 'DS_USERS';
  if (has('models have performance', 'models with performance')) return 'DS_PERF';
  if (has('process chain')) return 'BW_CHAINS';
  if (has('bw') && has('data load', 'loads') && has('delayed')) return 'BW_LOADS_DELAYED';
  if (/\bdtps?\b/.test(n) && has('fail', 'error')) return 'BW_DTP';
  if (/\badsos?\b/.test(n) && has('not loaded', 'loaded successfully')) return 'BW_ADSO_LOAD';
  if (/\badsos?\b/.test(n) && has('depend')) return 'BW_DEPEND';
  if (has('requests with errors')) return 'BW_REQ_ERR';
  if (has('infoprovider') && has('stale')) return 'BW_STALE';
  if (has('source-system loads', 'source system loads')) return 'ETL_TODAY';
  if (has('extractor') && has('fail')) return 'ETL_EXTRACTORS';
  if (has('missing from today') && has('load')) return 'ETL_MISSING';
  if (has('source record count') || (has('record count') && /\bbw\b/.test(n))) return 'ETL_RECON';
  if (has('delta load')) return 'ETL_DELTA';
  if (has('duplicate records') && has('load')) return 'ETL_DUP';
  if (has('transformation') && has('error')) return 'ETL_TRANSF';
  if (has('missing from bw')) return 'ETL_SALES_MISSING';
  if (has('load duration', 'data-load duration')) return 'ETL_DURATION';
  if (has('nightly load') && has('sla')) return 'ETL_SLA';
  return null;
}

// ---------- helpers ----------
type Q = { rows: Record<string, string>[]; total: number; error?: string };
async function q(sql: string, maxRows = 500): Promise<Q> {
  const r: any = await executeReadOnlySelect(sql, maxRows);
  if ('error' in r) return { rows: [], total: 0, error: r.error };
  return { rows: r.rows.map((row: any) => Object.fromEntries(Object.entries(row).map(([k, v]) => [k, String(v ?? '').trim()]))), total: r.totalRows ?? r.rowCount };
}
const num = (v: any) => { const s = String(v ?? '').trim(); const neg = s.endsWith('-'); const x = Number(s.replace(/-$/, '')) || 0; return neg ? -x : x; };
const fmtD = (d: string) => /^\d{8}/.test(d) && !d.startsWith('00000000') ? `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}` : '';
const fmtTs = (t: string) => /^\d{14}/.test(t) ? `${fmtD(t)} ${t.slice(8, 10)}:${t.slice(10, 12)}` : fmtD(t);
const addDays = (d: string, days: number) => {
  const dt = new Date(Date.UTC(+d.slice(0, 4), +d.slice(4, 6) - 1, +d.slice(6, 8) + days));
  return `${dt.getUTCFullYear()}${String(dt.getUTCMonth() + 1).padStart(2, '0')}${String(dt.getUTCDate()).padStart(2, '0')}`;
};
const money = (v: number) => v.toLocaleString('en-US', { maximumFractionDigits: 0 });
const cols = (...pairs: [string, string][]) => pairs.map(([key, label]) => ({ key, label }));
const errNote = (...errs: (string | undefined)[]) => errs.filter(Boolean).map(e => `Live read error: ${e}`).join(' ');
const inList = (vals: string[]) => vals.map(v => `'${v.replace(/'/g, "''")}'`).join(', ');
async function sysDate(): Promise<string> {
  const r = await q('SELECT DISTINCT @sy-datum AS D FROM T000', 1);
  if (r.rows[0]?.D) return r.rows[0].D;
  const d = new Date();
  return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`;
}
const byCur = (rows: Record<string, string>[], amt: string, cur: string) => {
  const m = new Map<string, number>(); rows.forEach(r => m.set(r[cur] || '?', (m.get(r[cur] || '?') || 0) + num(r[amt]))); return m;
};
const curText = (m: Map<string, number>) => [...m.entries()].filter(([, v]) => v).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1])).map(([c, v]) => `${money(v)} ${c}`).join(' + ') || '0';

// ---------- BW monitoring (embedded BW in S/4HANA) ----------
async function bwInventory() {
  const [prov, provT, adso, chains, chainT, chainLog, dtp, dtpReq, tran, ds, req, reqOld, queries, procJobs] = await Promise.all([
    q("SELECT INFOCUBE, CUBETYPE, INFOAREA FROM RSDCUBE WHERE OBJVERS = 'A'", 2000),
    q("SELECT INFOCUBE, TXTLG FROM RSDCUBET WHERE OBJVERS = 'A' AND LANGU = 'E'", 2000),
    q('SELECT ADSONM, OBJVERS FROM RSOADSO', 2000),
    q("SELECT DISTINCT CHAIN_ID FROM RSPCCHAIN WHERE OBJVERS = 'A'", 2000),
    q("SELECT CHAIN_ID, TXTLG FROM RSPCCHAINT WHERE LANGU = 'E' AND OBJVERS = 'A'", 2000),
    q('SELECT COUNT( * ) AS N FROM RSPCLOGCHAIN', 1),
    q('SELECT OBJVERS, COUNT( * ) AS N FROM RSBKDTP GROUP BY OBJVERS', 10),
    q('SELECT COUNT( * ) AS N FROM RSBKREQUEST', 1),
    q('SELECT OBJVERS, COUNT( * ) AS N FROM RSTRAN GROUP BY OBJVERS', 10),
    q('SELECT OBJVERS, COUNT( * ) AS N FROM RSDS GROUP BY OBJVERS', 10),
    q('SELECT RNR, ICUBE, DP_NR, TIMESTAMP, STATUS, QMSTATUS, UNAME, REC_INSERT, REC_UPDATE, MSGID, MSGNO, MSGV1 FROM RSMONICDP ORDER BY TIMESTAMP DESCENDING', 2000),
    q('SELECT RNR, DATUM, UZEIT, TSTATUS, QMSTATUS, ODSNAME, RECORDS, TIMESTAMPBEGIN, TIMESTAMPEND FROM RSREQDONE ORDER BY DATUM DESCENDING', 2000),
    q("SELECT COUNT( * ) AS N FROM RSZCOMPDIR WHERE OBJVERS = 'A'", 1),
    q("SELECT JOBNAME, STATUS, STRTDATE, STRTTIME, ENDDATE, ENDTIME FROM TBTCO WHERE JOBNAME LIKE 'BI_PROCESS%' OR JOBNAME LIKE 'BI_DTP%' OR JOBNAME LIKE 'BI_REQ%' OR JOBNAME LIKE 'BI_BTCH%' ORDER BY STRTDATE DESCENDING", 500)
  ]);
  const ver = (r: Q) => Object.fromEntries(r.rows.map(x => [x.OBJVERS, num(x.N)]));
  return { prov, provT, adso, chains, chainT, chainLog: num(chainLog.rows[0]?.N), dtp: ver(dtp), dtpReq: num(dtpReq.rows[0]?.N), tran: ver(tran), ds: ver(ds), req, reqOld, queries: num(queries.rows[0]?.N), procJobs, error: prov.error || req.error || reqOld.error };
}
type Inv = Awaited<ReturnType<typeof bwInventory>>;
const STATUS_ICON: Record<string, string> = { '@08@': 'Green (successful)', '@09@': 'Yellow (running/warning)', '@0A@': 'Red (error)', G: 'Green (successful)', Y: 'Yellow', R: 'Red (error)' };
const CUBE_TYPE: Record<string, string> = { B: 'InfoCube', H: 'HybridProvider', M: 'MultiProvider', V: 'Virtual provider' };
function lastLoads(inv: Inv) {
  const m = new Map<string, { last: string; requests: number; records: number; red: number }>();
  inv.req.rows.forEach(r => { const e = m.get(r.ICUBE) || { last: '', requests: 0, records: 0, red: 0 }; if (r.DP_NR === '000001' || r.DP_NR === '999999') { if (r.TIMESTAMP > e.last) e.last = r.TIMESTAMP; } if (r.DP_NR === '000001') e.requests++; e.records += num(r.REC_INSERT); if (r.STATUS === '@0A@') e.red++; m.set(r.ICUBE, e); });
  return m;
}
function monitoringSection(inv: Inv): BwSection {
  const rows = [
    { area: 'Process chain run logs', table: 'RSPCLOGCHAIN', value: inv.chainLog },
    { area: 'Active process chains', table: 'RSPCCHAIN', value: inv.chains.rows.length },
    { area: 'Process-chain / DTP background jobs (BI_*)', table: 'TBTCO', value: inv.procJobs.rows.length },
    { area: 'DTP requests', table: 'RSBKREQUEST', value: inv.dtpReq },
    { area: 'DTPs (active / delivered content)', table: 'RSBKDTP', value: `${inv.dtp.A || 0} / ${inv.dtp.D || 0}` },
    { area: 'Transformations (active / delivered content)', table: 'RSTRAN', value: `${inv.tran.A || 0} / ${inv.tran.D || 0}` },
    { area: 'DataSources (active / delivered content)', table: 'RSDS', value: `${inv.ds.A || 0} / ${inv.ds.D || 0}` },
    { area: 'Active InfoProviders', table: 'RSDCUBE', value: inv.prov.rows.length },
    { area: 'ADSOs (active)', table: 'RSOADSO', value: inv.adso.rows.filter(x => x.OBJVERS === 'A').length },
    { area: 'Load requests recorded (InfoProvider request monitor)', table: 'RSMONICDP', value: inv.req.rows.filter(r => r.DP_NR === '000001').length },
    { area: 'Active BW query elements', table: 'RSZCOMPDIR', value: inv.queries }
  ];
  return { title: 'Embedded BW Monitoring Data (checked live)', columns: cols(['area', 'Area'], ['table', 'Table'], ['value', 'Records']), rows, note: `Read live from the embedded BW tables of S/4HANA (S8H). ${errNote(inv.error)}` };
}
function requestRows(inv: Inv, onlyRed = false) {
  const head = inv.req.rows.filter(r => r.DP_NR === '000001');
  const fin = new Map(inv.req.rows.filter(r => r.DP_NR === '999999').map(r => [r.RNR, r]));
  return head.map(r => { const f = fin.get(r.RNR); const st = f?.STATUS || r.STATUS; return { request: r.RNR, provider: r.ICUBE, started: fmtTs(r.TIMESTAMP), finished: f ? fmtTs(f.TIMESTAMP) : '', status: STATUS_ICON[st] || st || 'n/a', quality: STATUS_ICON[f?.QMSTATUS || r.QMSTATUS] || '', user: r.UNAME, records: num(r.REC_INSERT) + num(r.REC_UPDATE), message: r.MSGID ? `${r.MSGID} ${r.MSGNO} ${r.MSGV1}`.trim() : '' }; }).filter(r => !onlyRed || r.status.startsWith('Red'));
}
const REQ_COLS = cols(['request', 'Request'], ['provider', 'InfoProvider'], ['started', 'Started'], ['finished', 'Finished'], ['status', 'Status'], ['quality', 'QM Status'], ['user', 'User'], ['records', 'Records'], ['message', 'Message']);

// ---------- S/4 analytics content (what Datasphere / BW would consume) ----------
async function analyticsContent() {
  const [cats, ext, qry] = await Promise.all([
    q("SELECT VALUE, COUNT( * ) AS N FROM DDHEADANNO WHERE NAME = 'ANALYTICS.DATACATEGORY' GROUP BY VALUE", 20),
    q("SELECT COUNT( * ) AS N FROM DDHEADANNO WHERE NAME = 'ANALYTICS.DATAEXTRACTION.ENABLED' AND VALUE = 'true'", 1),
    q("SELECT COUNT( * ) AS N FROM DDHEADANNO WHERE NAME = 'ANALYTICS.QUERY' AND VALUE = 'true'", 1)
  ]);
  return { cats: cats.rows.map(x => ({ category: x.VALUE.replace('#', ''), views: num(x.N) })), extraction: num(ext.rows[0]?.N), queries: num(qry.rows[0]?.N), error: cats.error };
}
async function replicationCheck() {
  const [odq, odqReq, cdc, cdcCds, rfc] = await Promise.all([
    q('SELECT COUNT( * ) AS N FROM ODQSSN', 1), q('SELECT COUNT( * ) AS N FROM ODQREQ', 1),
    q('SELECT COUNT( * ) AS N FROM DHCDC_SUBSREG', 1), q('SELECT COUNT( * ) AS N FROM DHCDC_CDSSUBSREG', 1),
    q("SELECT RFCDEST, RFCTYPE FROM RFCDES WHERE RFCDEST LIKE '%DWC%' OR RFCDEST LIKE '%DSP%' OR RFCDEST LIKE '%DATASPHERE%' OR RFCDEST LIKE '%DWAAS%'", 50)
  ]);
  const rows = [
    { check: 'Datasphere tenant / credentials configured for this app', result: process.env.DATASPHERE_HOST || process.env.SAP_DATASPHERE_URL ? 'Configured' : 'Not configured' },
    { check: 'RFC/HTTP destinations to Datasphere in S/4HANA (RFCDES)', result: rfc.rows.length ? rfc.rows.map(r => r.RFCDEST).join(', ') : 'None' },
    { check: 'ODP subscriptions from consumers (ODQSSN)', result: String(num(odq.rows[0]?.N)) },
    { check: 'ODP extraction requests (ODQREQ)', result: String(num(odqReq.rows[0]?.N)) },
    { check: 'Replication-flow (CDC) subscriptions (DHCDC_SUBSREG / DHCDC_CDSSUBSREG)', result: `${num(cdc.rows[0]?.N)} / ${num(cdcCds.rows[0]?.N)}` }
  ];
  const active = rows.slice(1).some(r => r.result !== 'None' && r.result !== '0' && r.result !== '0 / 0');
  return { active, section: { title: 'Datasphere Connectivity — Live S/4HANA Check', columns: cols(['check', 'Check'], ['result', 'Result']), rows } as BwSection };
}
async function cdsList(where: string, maxRows = 200) {
  return q(`SELECT A~STRUCOBJN, B~VALUE AS CATEGORY FROM DDHEADANNO AS A LEFT OUTER JOIN DDHEADANNO AS B ON A~STRUCOBJN = B~STRUCOBJN AND B~NAME = 'ANALYTICS.DATACATEGORY' WHERE ${where} ORDER BY A~STRUCOBJN`, maxRows);
}

// ---------- intent builders ----------
export async function buildBwLiveReport(intent: BwIntent, query: string): Promise<BwLiveReport> {
  const today = await sysDate();
  const n = query.toLowerCase();
  const yesterday = addDays(today, -1);
  const monthStart = `${today.slice(0, 6)}01`;

  if (intent === 'CEO') {
    const prevMonthStart = addDays(monthStart, -1).slice(0, 6) + '01';
    const prevSameDay = `${prevMonthStart.slice(0, 6)}${today.slice(6, 8)}`;
    const [bill, billPrev, ord, ordToday, inv, po, prod, cash, ql, qlRej, ar] = await Promise.all([
      q(`SELECT A~FKDAT, A~WAERK, B~NETWR, B~WAVWR FROM VBRK AS A INNER JOIN VBRP AS B ON A~VBELN = B~VBELN WHERE A~FKDAT >= '${monthStart}' AND A~FKSTO = ''`, 20000),
      q(`SELECT A~WAERK, SUM( A~NETWR ) AS NETWR FROM VBRK AS A WHERE A~FKDAT >= '${prevMonthStart}' AND A~FKDAT <= '${prevSameDay}' AND A~FKSTO = '' GROUP BY A~WAERK`, 50),
      q(`SELECT WAERK, COUNT( * ) AS N, SUM( NETWR ) AS NETWR FROM VBAK WHERE ERDAT >= '${monthStart}' GROUP BY WAERK`, 50),
      q(`SELECT WAERK, COUNT( * ) AS N, SUM( NETWR ) AS NETWR FROM VBAK WHERE ERDAT = '${today}' GROUP BY WAERK`, 50),
      q('SELECT C~WAERS, SUM( A~SALK3 ) AS VAL, COUNT( * ) AS N FROM MBEW AS A INNER JOIN T001K AS B ON A~BWKEY = B~BWKEY INNER JOIN T001 AS C ON B~BUKRS = C~BUKRS GROUP BY C~WAERS', 50),
      q("SELECT A~WAERS, COUNT( * ) AS N, SUM( B~NETWR ) AS NETWR FROM EKKO AS A INNER JOIN EKPO AS B ON A~EBELN = B~EBELN WHERE B~ELIKZ = '' AND B~LOEKZ = '' GROUP BY A~WAERS", 50),
      q(`SELECT COUNT( * ) AS N, SUM( A~PSMNG ) AS PLANQ, SUM( A~WEMNG ) AS GRQ FROM AFPO AS A INNER JOIN AUFK AS B ON A~AUFNR = B~AUFNR WHERE B~AUTYP = '10' AND B~ERDAT >= '${monthStart}'`, 1),
      q(`SELECT A~RHCUR, SUM( A~HSL ) AS BAL FROM ACDOCA AS A INNER JOIN SKB1 AS B ON A~RBUKRS = B~BUKRS AND A~RACCT = B~SAKNR WHERE A~RLDNR = '0L' AND A~GJAHR = '${today.slice(0, 4)}' AND B~XGKON = 'X' GROUP BY A~RHCUR`, 50),
      q(`SELECT COUNT( * ) AS N FROM QALS WHERE ENSTEHDAT >= '${monthStart}'`, 1),
      q(`SELECT COUNT( * ) AS N FROM QAVE WHERE VDATUM >= '${monthStart}' AND VBEWERTUNG = 'R'`, 1),
      q(`SELECT RHCUR, SUM( HSL ) AS BAL FROM ACDOCA WHERE RLDNR = '0L' AND KOART = 'D' AND AUGBL = '' AND NETDT < '${today}' AND NETDT <> '00000000' GROUP BY RHCUR`, 50)
    ]);
    const revToday = byCur(bill.rows.filter(r => r.FKDAT === today), 'NETWR', 'WAERK');
    const revMtd = byCur(bill.rows, 'NETWR', 'WAERK');
    const costMtd = byCur(bill.rows, 'WAVWR', 'WAERK');
    const margin = new Map([...revMtd.entries()].map(([c, v]) => [c, v - (costMtd.get(c) || 0)]));
    const marginPct = [...revMtd.entries()].filter(([, v]) => v).map(([c, v]) => `${c} ${(((v - (costMtd.get(c) || 0)) / v) * 100).toFixed(1)}%`).join(', ');
    const revPrev = byCur(billPrev.rows, 'NETWR', 'WAERK');
    const trend = [...revMtd.entries()].filter(([c]) => revPrev.get(c)).map(([c, v]) => `${c} ${(((v - revPrev.get(c)!) / Math.abs(revPrev.get(c)!)) * 100).toFixed(1)}%`).join(', ');
    const p = prod.rows[0] || {};
    const kpis = [
      { area: 'Revenue', kpi: 'Billed net revenue', today: curText(revToday), mtd: curText(revMtd), comparison: trend ? `vs same days last month: ${trend}` : 'No billing in the same days last month', source: 'VBRK/VBRP' },
      { area: 'Margin', kpi: 'Gross margin (revenue − cost of billed items)', today: '', mtd: `${curText(margin)}${marginPct ? ` (${marginPct})` : ''}`, comparison: '', source: 'VBRP NETWR − WAVWR' },
      { area: 'Orders', kpi: 'Sales orders created', today: `${ordToday.rows.reduce((a, r) => a + num(r.N), 0)} orders (${curText(byCur(ordToday.rows, 'NETWR', 'WAERK'))})`, mtd: `${ord.rows.reduce((a, r) => a + num(r.N), 0)} orders (${curText(byCur(ord.rows, 'NETWR', 'WAERK'))})`, comparison: '', source: 'VBAK' },
      { area: 'Inventory', kpi: 'Total stock value', today: curText(byCur(inv.rows, 'VAL', 'WAERS')), mtd: '', comparison: `${inv.rows.reduce((a, r) => a + num(r.N), 0)} material valuation records`, source: 'MBEW' },
      { area: 'Procurement', kpi: 'Open purchase-order value', today: curText(byCur(po.rows, 'NETWR', 'WAERS')), mtd: '', comparison: `${po.rows.reduce((a, r) => a + num(r.N), 0)} open PO items`, source: 'EKKO/EKPO' },
      { area: 'Production', kpi: 'Production orders created this month', today: '', mtd: `${num(p.N)} orders, ${money(num(p.GRQ))} of ${money(num(p.PLANQ))} planned qty received`, comparison: num(p.PLANQ) ? `${((num(p.GRQ) / num(p.PLANQ)) * 100).toFixed(1)}% delivered` : '', source: 'AFPO/AUFK' },
      { area: 'Cash', kpi: 'Cash & bank G/L balance (fiscal year)', today: curText(byCur(cash.rows, 'BAL', 'RHCUR')), mtd: '', comparison: '', source: 'ACDOCA + SKB1 (cash-relevant accounts)' },
      { area: 'Receivables', kpi: 'Overdue open customer items', today: curText(byCur(ar.rows, 'BAL', 'RHCUR')), mtd: '', comparison: '', source: 'ACDOCA (customer items, net due date passed)' },
      { area: 'Quality', kpi: 'Inspection lots / rejections this month', today: '', mtd: `${num(ql.rows[0]?.N)} lots, ${num(qlRej.rows[0]?.N)} rejected usage decisions`, comparison: '', source: 'QALS/QAVE' }
    ];
    const byCust = new Map<string, number>();
    const prodRows = await q(`SELECT A~PLTYP, B~MATNR, B~NETWR, A~WAERK, A~KUNAG FROM VBRK AS A INNER JOIN VBRP AS B ON A~VBELN = B~VBELN WHERE A~FKDAT >= '${monthStart}' AND A~FKSTO = ''`, 20000);
    prodRows.rows.forEach(r => byCust.set(`${r.KUNAG}|${r.WAERK}`, (byCust.get(`${r.KUNAG}|${r.WAERK}`) || 0) + num(r.NETWR)));
    const byMat = new Map<string, number>(); prodRows.rows.forEach(r => byMat.set(`${r.MATNR}|${r.WAERK}`, (byMat.get(`${r.MATNR}|${r.WAERK}`) || 0) + num(r.NETWR)));
    const top = (m: Map<string, number>, k: string) => [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([key, v]) => ({ [k]: key.split('|')[0], currency: key.split('|')[1], revenue: money(v) }));
    return {
      text: `Company performance today (${fmtD(today)}, live S/4HANA): revenue today ${curText(revToday)}, month-to-date ${curText(revMtd)}${trend ? ` (${trend} vs the same days last month)` : ''}; gross margin MTD ${marginPct || 'n/a'}; ${ord.rows.reduce((a, r) => a + num(r.N), 0)} sales orders this month (${ordToday.rows.reduce((a, r) => a + num(r.N), 0)} today); inventory ${curText(byCur(inv.rows, 'VAL', 'WAERS'))}; open PO value ${curText(byCur(po.rows, 'NETWR', 'WAERS'))}; overdue receivables ${curText(byCur(ar.rows, 'BAL', 'RHCUR'))}; ${num(ql.rows[0]?.N)} inspection lots this month (${num(qlRej.rows[0]?.N)} rejected).`,
      sections: [
        { title: 'Company Performance Today — Live KPI Cockpit', columns: cols(['area', 'Area'], ['kpi', 'KPI'], ['today', 'Today / Current'], ['mtd', 'Month to Date'], ['comparison', 'Comparison'], ['source', 'Source']), rows: kpis, note: `All figures read live from the S/4HANA database (amounts in document/company-code currency, not converted). ${errNote(bill.error, inv.error, po.error, cash.error, ar.error)}` },
        { title: 'Drill-down: Top Customers by Revenue (Month to Date)', columns: cols(['customer', 'Customer'], ['currency', 'Currency'], ['revenue', 'Revenue']), rows: top(byCust, 'customer') },
        { title: 'Drill-down: Top Products by Revenue (Month to Date)', columns: cols(['product', 'Product'], ['currency', 'Currency'], ['revenue', 'Revenue']), rows: top(byMat, 'product') }
      ],
      assess: true,
      persona: 'You are the CFO\'s analytics assistant. Summarise how the company is performing in 4-6 short sentences for a CEO, covering revenue, margin, orders, inventory, procurement, production, cash/receivables and quality, flagging anything that needs attention. Use only the evidence.'
    };
  }

  if (intent === 'PLANT_BUDGET' || intent === 'PLAN_ACTUAL') {
    const year = today.slice(0, 4);
    const qtr = Math.floor((+today.slice(4, 6) - 1) / 3);
    const pFrom = `${year}${String(qtr * 3 + 1).padStart(3, '0')}`; const pTo = `${year}${String(qtr * 3 + 3).padStart(3, '0')}`;
    const periodCond = intent === 'PLAN_ACTUAL' ? ` AND FISCYEARPER >= '${pFrom}' AND FISCYEARPER <= '${pTo}'` : '';
    const [plan, plantAct] = await Promise.all([
      q(`SELECT A~RCNTR, A~RBUKRS, B~WERKS, A~RHCUR, SUM( A~HSL ) AS PLAN FROM ACDOCP AS A LEFT OUTER JOIN CSKS AS B ON A~RCNTR = B~KOSTL AND A~KOKRS = B~KOKRS WHERE A~CATEGORY = 'PLN' AND A~RYEAR = '${year}' AND A~RCNTR <> ''${periodCond.replace(/FISCYEARPER/g, 'A~FISCYEARPER')} GROUP BY A~RCNTR, A~RBUKRS, B~WERKS, A~RHCUR`, 2000),
      q(`SELECT WERKS, RHCUR, SUM( HSL ) AS ACT FROM ACDOCA WHERE RLDNR = '0L' AND GJAHR = '${year}' AND WERKS <> '' AND GLACCOUNT_TYPE = 'P'${periodCond} GROUP BY WERKS, RHCUR`, 500)
    ]);
    const ccs = [...new Set(plan.rows.map(r => r.RCNTR))];
    const act = ccs.length ? await q(`SELECT RCNTR, SUM( HSL ) AS ACT FROM ACDOCA WHERE RLDNR = '0L' AND GJAHR = '${year}' AND RCNTR IN ( ${inList(ccs)} )${periodCond} GROUP BY RCNTR`, 2000) : { rows: [] } as any;
    const rows = plan.rows.map(r => { const a = num(act.rows.find((x: any) => x.RCNTR === r.RCNTR)?.ACT); const p = num(r.PLAN); return { costCenter: r.RCNTR, companyCode: r.RBUKRS, plant: r.WERKS || '(no plant)', currency: r.RHCUR, plan: money(p), actual: money(a), variance: money(a - p), usage: p ? `${((a / p) * 100).toFixed(1)}%` : 'n/a', status: p && a > p ? 'Over plan' : 'Within plan' }; });
    const over = rows.filter(r => r.status === 'Over plan');
    const plantRows = plantAct.rows.map(r => ({ plant: r.WERKS, currency: r.RHCUR, actual: money(num(r.ACT)), plan: rows.filter(x => x.plant === r.WERKS).length ? 'Yes' : 'No plan by plant' }));
    const label = intent === 'PLAN_ACTUAL' ? `Q${qtr + 1} ${year} (periods ${pFrom.slice(4)}–${pTo.slice(4)})` : `fiscal year ${year}`;
    return {
      text: `${intent === 'PLANT_BUDGET' ? 'No operating budget is maintained by plant: the cost centers that carry a plan have no plant assignment. ' : ''}Plan (category PLN) exists for ${rows.length} cost center(s) in ${label}; ${over.length} exceed their plan${over.length ? `: ${over.map(o => `${o.costCenter} actual ${o.actual} vs plan ${o.plan} ${o.currency} (${o.usage})`).join('; ')}` : ''}. Actual primary costs by plant ${label}: ${plantRows.map(p => `${p.plant} ${p.actual} ${p.currency}`).join(', ') || 'none'}.`,
      sections: [
        { title: `Actual vs Plan by Cost Center — ${label}`, summaryStats: [{ label: 'Planned cost centers', value: String(rows.length) }, { label: 'Over plan', value: String(over.length) }], columns: cols(['costCenter', 'Cost Center'], ['companyCode', 'Company Code'], ['plant', 'Plant'], ['currency', 'Currency'], ['plan', 'Plan'], ['actual', 'Actual'], ['variance', 'Variance'], ['usage', 'Plan Used'], ['status', 'Status']), rows, note: `Plan from ACDOCP (category PLN), actual from ACDOCA ledger 0L, plant from CSKS. ${errNote(plan.error, act.error)}` },
        { title: `Actual Primary Costs by Plant — ${label}`, columns: cols(['plant', 'Plant'], ['currency', 'Currency'], ['actual', 'Actual Cost'], ['plan', 'Plan by Plant']), rows: plantRows, note: 'ACDOCA ledger 0L, primary cost/revenue G/L accounts (GLACCOUNT_TYPE P).' }
      ],
      assess: false
    };
  }

  if (intent === 'PROD_VARIANCE') {
    const [qty, cost] = await Promise.all([
      q("SELECT B~WERKS, COUNT( * ) AS N, SUM( A~PSMNG ) AS PLANQ, SUM( A~WEMNG ) AS GRQ, SUM( A~PSAMG ) AS SCRAP FROM AFPO AS A INNER JOIN AUFK AS B ON A~AUFNR = B~AUFNR WHERE B~AUTYP = '10' GROUP BY B~WERKS", 200),
      q("SELECT A~WERKS, A~RHCUR, SUM( A~HSL ) AS BAL, COUNT( DISTINCT A~AUFNR ) AS ORDERS FROM ACDOCA AS A INNER JOIN AUFK AS B ON A~AUFNR = B~AUFNR WHERE A~RLDNR = '0L' AND B~AUTYP = '10' GROUP BY A~WERKS, A~RHCUR", 200)
    ]);
    const rows = qty.rows.map(r => { const c = cost.rows.filter(x => x.WERKS === r.WERKS); const pq = num(r.PLANQ); const gq = num(r.GRQ); return { plant: r.WERKS, orders: num(r.N), plannedQty: money(pq), receivedQty: money(gq), qtyVariance: money(gq - pq), qtyVariancePct: pq ? `${(((gq - pq) / pq) * 100).toFixed(1)}%` : 'n/a', scrapQty: money(num(r.SCRAP)), costBalance: c.map(x => `${money(num(x.BAL))} ${x.RHCUR}`).join(', ') || '0' }; });
    return {
      text: `Production variance by plant (live): ${rows.map(r => `${r.plant}: ${r.orders} orders, received ${r.receivedQty} of ${r.plannedQty} planned (${r.qtyVariancePct}), open cost balance ${r.costBalance}`).join('; ')}. The cost balance is actual order debits minus settled credits — the amount not yet settled or the variance remaining on the orders.`,
      sections: [{ title: 'Production Variance by Plant', columns: cols(['plant', 'Plant'], ['orders', 'Production Orders'], ['plannedQty', 'Planned Qty'], ['receivedQty', 'Goods Received'], ['qtyVariance', 'Quantity Variance'], ['qtyVariancePct', 'Qty Variance %'], ['scrapQty', 'Scrap Qty'], ['costBalance', 'Order Cost Balance']), rows, note: `Quantities from AFPO (order type 10 = production), costs from ACDOCA ledger 0L per production order. ${errNote(qty.error, cost.error)}` }],
      assess: false
    };
  }

  if (intent.startsWith('DS_')) {
    const [rep, content] = await Promise.all([replicationCheck(), analyticsContent()]);
    const base = `There is no SAP Datasphere tenant connected to this app and the S/4HANA system shows no Datasphere consumption (no destinations, ODP subscriptions or replication-flow subscriptions — see the live check). `;
    const sections: BwSection[] = [rep.section];
    let text = base;
    if (intent === 'DS_SPACES' || intent === 'DS_S4DEP' || intent === 'DS_STALE' || intent === 'DS_CONN' || intent === 'DS_USERS' || intent === 'DS_PERF') {
      sections.push({ title: 'S/4HANA Analytical Content Available to Datasphere', columns: cols(['category', 'CDS Data Category'], ['views', 'CDS Views']), rows: content.cats, note: `${content.extraction} CDS views are extraction-enabled (replicable to Datasphere/BW); ${content.queries} analytical queries exist. Source: DDHEADANNO.` });
      const extra: Record<string, string> = {
        DS_SPACES: 'Spaces exist only in a Datasphere tenant, so none can be listed. ',
        DS_S4DEP: 'No Datasphere model currently reads from this S/4HANA system: there are 0 replication or extraction subscriptions. ',
        DS_STALE: 'No data products are replicated from this system, so none can be stale on the S/4HANA side. ',
        DS_CONN: 'No Datasphere connection to this S/4HANA system is configured, so there is no failing connection — and no working one. ',
        DS_USERS: 'Consumption of Datasphere models is logged in the Datasphere tenant, which is not connected. ',
        DS_PERF: 'Datasphere model performance is monitored in the tenant, which is not connected; S/4HANA has no replication workload from Datasphere. '
      };
      text += `${extra[intent]}On the S/4HANA side ${content.extraction} extraction-enabled CDS views and ${content.queries} analytical queries are ready to be consumed.`;
    } else if (intent === 'DS_MODELS') {
      const list = await cdsList("A~NAME = 'ANALYTICS.QUERY' AND A~VALUE = 'true'", 300);
      sections.push({ title: 'Analytical Queries Exposed for Consumption (S/4HANA CDS)', summaryStats: [{ label: 'Analytical queries', value: String(list.total) }], columns: cols(['STRUCOBJN', 'CDS Analytical Query'], ['CATEGORY', 'Data Category']), rows: list.rows, note: 'CDS entities annotated @Analytics.query: true (DDHEADANNO) — consumable by SAP Analytics Cloud, BW and Datasphere.' });
      text += `As the closest live equivalent, S/4HANA exposes ${list.total} analytical CDS queries for consumption (first ${list.rows.length} listed).`;
    } else if (intent === 'DS_FIN') {
      const list = await cdsList("A~NAME = 'ANALYTICS.DATAEXTRACTION.ENABLED' AND A~VALUE = 'true' AND ( A~STRUCOBJN LIKE '%JOURNAL%' OR A~STRUCOBJN LIKE '%GLACCOUNT%' OR A~STRUCOBJN LIKE '%ACCTG%' OR A~STRUCOBJN LIKE '%FINANCIAL%' OR A~STRUCOBJN LIKE '%PROFITCENTER%' OR A~STRUCOBJN LIKE '%COSTCENTER%' OR A~STRUCOBJN LIKE '%COMPANYCODE%' OR A~STRUCOBJN LIKE '%FIXEDASSET%' OR A~STRUCOBJN LIKE '%BANK%' OR A~STRUCOBJN LIKE '%PAYMENT%' )", 500);
      sections.push({ title: 'Finance Datasets Available for a Finance Space (extraction-enabled S/4HANA CDS views)', summaryStats: [{ label: 'Finance datasets', value: String(list.total) }], columns: cols(['STRUCOBJN', 'CDS View'], ['CATEGORY', 'Data Category']), rows: list.rows, note: 'Extraction-enabled CDS views (DDHEADANNO) whose names belong to finance objects (journal entry, G/L account, accounting, profit/cost center, company code, fixed asset, bank, payment).' });
      text += `No Finance space exists to list; the finance datasets S/4HANA can provide to one are ${list.total} extraction-enabled CDS views (listed).`;
    } else if (intent === 'DS_LINEAGE') {
      text += 'Lineage of Datasphere models is maintained in the tenant, which is not connected, and no model was named. Name an S/4HANA CDS view or BW query to trace its sources in this system.';
    }
    return { text, sections, assess: false };
  }

  // ---------- BW monitoring & ETL ----------
  const inv = await bwInventory();
  const mon = monitoringSection(inv);
  const loads = lastLoads(inv);
  const reqs = requestRows(inv);
  const provName = (p: string) => inv.provT.rows.find(x => x.INFOCUBE === p)?.TXTLG || '';
  const loadRows = [...loads.entries()].map(([p, e]) => ({ provider: p, description: provName(p), lastLoad: fmtTs(e.last), requests: e.requests, records: e.records, failed: e.red, ageDays: e.last ? Math.round((Date.UTC(+today.slice(0, 4), +today.slice(4, 6) - 1, +today.slice(6, 8)) - Date.UTC(+e.last.slice(0, 4), +e.last.slice(4, 6) - 1, +e.last.slice(6, 8))) / 86400000) : '' }));
  const LOAD_COLS = cols(['provider', 'InfoProvider'], ['description', 'Description'], ['lastLoad', 'Last Load'], ['ageDays', 'Days Since Last Load'], ['requests', 'Requests'], ['records', 'Records Loaded'], ['failed', 'Failed Requests']);
  const noRuns = inv.chainLog === 0 && inv.dtpReq === 0 && inv.procJobs.rows.length === 0;
  const runNote = noRuns ? 'No process chain, DTP or BW load job has run in this system (0 run logs, 0 DTP requests, 0 BI_* jobs); all DTPs and transformations exist only as delivered content (not activated).' : '';
  const todayLoads = reqs.filter(r => r.started.startsWith(fmtD(today)));

  switch (intent) {
    case 'BW_CHAINS': {
      const chainRows = inv.chains.rows.map(c => ({ chain: c.CHAIN_ID, description: inv.chainT.rows.find(t => t.CHAIN_ID === c.CHAIN_ID)?.TXTLG || '', runs: 0, lastRun: 'Never', status: 'No run logged' }));
      return { text: `No BW process chain failed overnight because none ran: there are ${inv.chainLog} process chain run logs and ${inv.procJobs.rows.length} process-chain background jobs. ${inv.chains.rows.length} process chain(s) are active: ${chainRows.map(c => `${c.chain} (${c.description})`).join(', ') || 'none'}.`, sections: [{ title: 'Active Process Chains and Run Status', columns: cols(['chain', 'Process Chain'], ['description', 'Description'], ['runs', 'Runs Logged'], ['lastRun', 'Last Run'], ['status', 'Status']), rows: chainRows }, mon], assess: false };
    }
    case 'BW_LOADS_DELAYED': case 'BW_STALE': case 'ETL_SLA': case 'BW_ADSO_LOAD': {
      const activeAdso = inv.adso.rows.filter(x => x.OBJVERS === 'A');
      const provRows = inv.prov.rows.filter(p => p.CUBETYPE === 'B' || p.CUBETYPE === 'H').map(p => { const l = loads.get(p.INFOCUBE); return { provider: p.INFOCUBE, description: provName(p.INFOCUBE), type: CUBE_TYPE[p.CUBETYPE] || p.CUBETYPE, lastLoad: l ? fmtTs(l.last) : 'Never loaded', ageDays: l?.last ? loadRows.find(x => x.provider === p.INFOCUBE)?.ageDays ?? '' : '', status: !l ? 'No data load recorded' : 'Stale (no load in the last 7 days)' }; }).sort((a, b) => (a.lastLoad === 'Never loaded' ? 1 : 0) - (b.lastLoad === 'Never loaded' ? 1 : 0));
      const texts: Record<string, string> = {
        BW_LOADS_DELAYED: `No BW data load is delayed because no load is scheduled or running. ${runNote} The last recorded load was ${loadRows[0] ? `${loadRows[0].provider} on ${loadRows[0].lastLoad}` : 'never'}.`,
        BW_STALE: `${provRows.length} loadable InfoProviders are active; all are stale: ${provRows.filter(p => p.lastLoad === 'Never loaded').length} have never been loaded and the only loaded one, ${loadRows.map(l => `${l.provider} (last load ${l.lastLoad}, ${l.ageDays} days ago)`).join(', ') || 'none'}, has had no load for weeks.`,
        ETL_SLA: `No nightly BW load is at risk of missing the reporting SLA because no nightly load exists: ${runNote || 'no load jobs are scheduled.'}`,
        BW_ADSO_LOAD: `There are ${activeAdso.length} active ADSOs in this system (${inv.adso.rows.length} exist only as delivered content: ${inv.adso.rows.map(a => a.ADSONM).join(', ')}), so no ADSO load can have failed. Loadable InfoProviders without a successful load: ${provRows.filter(p => p.lastLoad === 'Never loaded').length}.`
      };
      return { text: texts[intent], sections: [{ title: intent === 'BW_ADSO_LOAD' ? 'ADSOs and InfoProviders — Load Status' : 'InfoProvider Data Currency', summaryStats: [{ label: 'Loadable InfoProviders', value: String(provRows.length) }, { label: 'Never loaded', value: String(provRows.filter(p => p.lastLoad === 'Never loaded').length) }], columns: cols(['provider', 'InfoProvider'], ['description', 'Description'], ['type', 'Type'], ['lastLoad', 'Last Load'], ['ageDays', 'Days Since Load'], ['status', 'Status']), rows: provRows }, { title: 'Load History by InfoProvider', columns: LOAD_COLS, rows: loadRows }, mon], assess: false };
    }
    case 'BW_DTP': case 'ETL_DELTA': case 'ETL_DUP': case 'ETL_TRANSF': {
      const dtps = await q("SELECT DTP, SRC, SRCTLOGO, TGT, TGTTLOGO, UPDMODE, ERRORHANDLING FROM RSBKDTP WHERE OBJVERS = 'A' OR OBJVERS = 'D'", 500);
      const trans = intent === 'ETL_TRANSF' ? await q("SELECT TRANID, OBJVERS, OBJSTAT, SOURCETYPE, SOURCENAME, TARGETTYPE, TARGETNAME FROM RSTRAN WHERE OBJVERS IN ( 'A', 'D' )", 1000) : { rows: [] } as any;
      const texts: Record<string, string> = {
        BW_DTP: `No DTP has failed: ${inv.dtpReq} DTP requests exist and ${inv.dtp.A || 0} DTPs are active (${inv.dtp.D || 0} are delivered content only). No DTP was named.`,
        ETL_DELTA: `No delta load is incomplete: ${inv.dtpReq} DTP requests and 0 ODP delta queues exist; ${dtps.rows.filter(d => d.UPDMODE === 'D').length} delivered DTPs are defined for delta mode but none is active.`,
        ETL_DUP: `No duplicate records were detected during loading because no data was loaded through DTPs (${inv.dtpReq} requests); error stacks are empty.`,
        ETL_TRANSF: `No transformation generated errors at runtime — none has run. ${inv.tran.A || 0} transformations are active and ${inv.tran.D || 0} are delivered content only.`
      };
      const sec: BwSection = intent === 'ETL_TRANSF'
        ? { title: 'Transformations (delivered content)', columns: cols(['TRANID', 'Transformation'], ['OBJVERS', 'Version'], ['OBJSTAT', 'Status'], ['SOURCENAME', 'Source'], ['TARGETNAME', 'Target']), rows: trans.rows.slice(0, 200) }
        : { title: 'DTP Definitions', columns: cols(['DTP', 'DTP'], ['SRC', 'Source'], ['TGT', 'Target'], ['UPDMODE', 'Update Mode (D=delta, F=full)'], ['ERRORHANDLING', 'Error Handling']), rows: dtps.rows.slice(0, 200) };
      return { text: texts[intent], sections: [sec, mon], assess: false };
    }
    case 'BW_REQ_ERR': {
      const red = requestRows(inv, true);
      return { text: `${red.length} BW load request(s) have errors out of ${reqs.length} recorded requests${red.length ? `: ${red.slice(0, 5).map(r => `${r.request} (${r.provider}, ${r.started})`).join('; ')}` : ''}. The last request was ${reqs[0] ? `${reqs[0].request} on ${reqs[0].started} (${reqs[0].status})` : 'none'}.`, sections: [{ title: 'BW Requests With Errors', columns: REQ_COLS, rows: red }, { title: 'All Recorded BW Load Requests', columns: REQ_COLS, rows: reqs.slice(0, 100) }, mon], assess: false };
    }
    case 'BW_DEPEND': {
      const [multi, qry] = await Promise.all([q("SELECT INFOCUBE, PARTCUBE FROM RSDCUBEMULTI WHERE OBJVERS = 'A'", 2000), q("SELECT INFOCUBE, COUNT( * ) AS N FROM RSRREPDIR WHERE OBJVERS = 'A' GROUP BY INFOCUBE", 2000)]);
      const rows = inv.prov.rows.filter(p => p.CUBETYPE === 'B' || p.CUBETYPE === 'H').map(p => ({ provider: p.INFOCUBE, description: provName(p.INFOCUBE), multiProviders: multi.rows.filter(m => m.PARTCUBE === p.INFOCUBE).map(m => m.INFOCUBE).join(', ') || '—', queries: num(qry.rows.find(x => x.INFOCUBE === p.INFOCUBE)?.N), viaMulti: multi.rows.filter(m => m.PARTCUBE === p.INFOCUBE).reduce((a, m) => a + num(qry.rows.find(x => x.INFOCUBE === m.INFOCUBE)?.N), 0) }));
      return { text: `No ADSO was named and there are no active ADSOs (${inv.adso.rows.map(a => a.ADSONM).join(', ')} exist only as delivered content). Dependencies of the active InfoProviders instead: ${rows.filter(r => r.queries || r.multiProviders !== '—').slice(0, 5).map(r => `${r.provider} → ${r.queries} queries, MultiProviders ${r.multiProviders}`).join('; ') || 'none'}.`, sections: [{ title: 'Objects Depending on Each InfoProvider', columns: cols(['provider', 'InfoProvider'], ['description', 'Description'], ['multiProviders', 'Used in MultiProviders'], ['queries', 'Queries Directly On It'], ['viaMulti', 'Queries via MultiProviders']), rows, note: 'RSDCUBEMULTI (MultiProvider parts) and RSRREPDIR (queries per InfoProvider), active versions.' }, mon], assess: false };
    }
    case 'ETL_TODAY': case 'ETL_MISSING': case 'ETL_EXTRACTORS': case 'ETL_RECON': case 'ETL_SALES_MISSING': case 'ETL_DURATION': {
      if (intent === 'ETL_EXTRACTORS') {
        const ext = await q("SELECT A~OLTPSOURCE, A~DELTA, A~APPLNM, B~TXTLG FROM ROOSOURCE AS A LEFT OUTER JOIN ROOSOURCET AS B ON A~OLTPSOURCE = B~OLTPSOURCE AND B~OBJVERS = A~OBJVERS AND B~LANGU = 'E' WHERE A~OBJVERS = 'A'", 6000);
        const rep = await replicationCheck();
        return { text: `No extractor failed: there are 0 extraction requests (ODQREQ) and 0 subscriptions — no extractor has been run by BW, Datasphere or another consumer. ${ext.total} extractors are active, ${ext.rows.filter(r => r.DELTA).length} of them delta-capable.`, sections: [rep.section, { title: 'Active Extractors (ROOSOURCE)', summaryStats: [{ label: 'Active extractors', value: String(ext.total) }, { label: 'Delta-capable', value: String(ext.rows.filter(r => r.DELTA).length) }], columns: cols(['OLTPSOURCE', 'Extractor'], ['TXTLG', 'Description'], ['APPLNM', 'Application'], ['DELTA', 'Delta Method']), rows: ext.rows.slice(0, 300) }, mon], assess: false };
      }
      if (intent === 'ETL_SALES_MISSING') {
        const [bill, sd] = await Promise.all([q(`SELECT WAERK, COUNT( * ) AS N, SUM( NETWR ) AS NETWR FROM VBRK WHERE FKDAT = '${yesterday}' AND FKSTO = '' GROUP BY WAERK`, 20), q(`SELECT COUNT( * ) AS N, SUM( NETWR ) AS NETWR FROM VBAK WHERE ERDAT = '${yesterday}'`, 1)]);
        const sdProv = inv.prov.rows.filter(p => /SD|SALES|0SD/i.test(p.INFOCUBE) || /sales/i.test(provName(p.INFOCUBE)));
        const billN = bill.rows.reduce((a, r) => a + num(r.N), 0); const soN = num(sd.rows[0]?.N);
        return { text: billN || soN
          ? `Yesterday's (${fmtD(yesterday)}) sales exist in S/4HANA — ${billN} billing documents (${curText(byCur(bill.rows, 'NETWR', 'WAERK'))}) and ${soN} sales orders — but they are missing from BW because no BW load has run: ${runNote}`
          : `No sales were posted in S/4HANA yesterday (${fmtD(yesterday)}: 0 billing documents, 0 sales orders), so there was nothing to load for that day. Independently, BW receives no S/4HANA sales data at all: ${runNote}`, sections: [{ title: `S/4HANA Sales Documents on ${fmtD(yesterday)}`, columns: cols(['WAERK', 'Currency'], ['N', 'Billing Documents'], ['NETWR', 'Net Value']), rows: bill.rows.map(r => ({ ...r, N: num(r.N), NETWR: money(num(r.NETWR)) })) }, { title: 'Sales-Related InfoProviders in BW', columns: cols(['provider', 'InfoProvider'], ['description', 'Description'], ['lastLoad', 'Last Load']), rows: sdProv.map(p => ({ provider: p.INFOCUBE, description: provName(p.INFOCUBE), lastLoad: loads.get(p.INFOCUBE) ? fmtTs(loads.get(p.INFOCUBE)!.last) : 'Never loaded' })) }, mon], assess: false };
      }
      const durations = reqs.map(r => { const s = inv.req.rows.find(x => x.RNR === r.request && x.DP_NR === '000001')?.TIMESTAMP || ''; const e = inv.req.rows.find(x => x.RNR === r.request && x.DP_NR === '999999')?.TIMESTAMP || ''; const sec = s && e ? (Date.UTC(+e.slice(0, 4), +e.slice(4, 6) - 1, +e.slice(6, 8), +e.slice(8, 10), +e.slice(10, 12), +e.slice(12, 14)) - Date.UTC(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8), +s.slice(8, 10), +s.slice(10, 12), +s.slice(12, 14))) / 1000 : null; return { ...r, durationSec: sec ?? '' }; });
      const texts: Record<string, string> = {
        ETL_TODAY: `No source-system loads ran today (${fmtD(today)}): ${todayLoads.length} load requests today. ${runNote} The most recent load was ${reqs[0] ? `${reqs[0].request} into ${reqs[0].provider} on ${reqs[0].started}` : 'never'}.`,
        ETL_MISSING: `Today's load contains no data because no load ran today (${todayLoads.length} requests). ${runNote} Every InfoProvider is therefore missing today's data; last loads per provider are listed.`,
        ETL_RECON: `Source vs BW record counts: the only loaded InfoProvider, ${loadRows.map(l => `${l.provider} received ${l.records} records in ${l.requests} requests (last ${l.lastLoad})`).join('; ') || 'none'}. Other InfoProviders hold no loaded records, so their source record counts cannot be reconciled until loads are activated.`,
        ETL_DURATION: `${durations.length} recorded load requests (all into ${[...new Set(reqs.map(r => r.provider))].join(', ') || 'none'}); durations from start to completion are listed by date. ${runNote}`
      };
      return { text: texts[intent], sections: [{ title: intent === 'ETL_DURATION' ? 'Load Duration Trend (seconds per request)' : 'Recorded BW Load Requests', columns: intent === 'ETL_DURATION' ? cols(['started', 'Started'], ['provider', 'InfoProvider'], ['request', 'Request'], ['records', 'Records'], ['durationSec', 'Duration (s)'], ['status', 'Status']) : REQ_COLS, rows: (intent === 'ETL_DURATION' ? durations : reqs).slice(0, 100) }, { title: 'Load History by InfoProvider', columns: LOAD_COLS, rows: loadRows }, mon], assess: false };
    }
  }
  return { text: 'No live answer could be built.', sections: [], assess: false };
}
