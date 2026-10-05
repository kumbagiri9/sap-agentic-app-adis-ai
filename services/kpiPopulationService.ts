// KPI dashboards over the complete matching dataset: the report's own FROM/WHERE is re-run in SAP as
// COUNT/SUM/GROUP BY aggregates, so totals, trends and shares never depend on how many detail rows were fetched.
import { executeReadOnlySelect } from './hanaDbIntelligenceService';
import type { KpiDashboard, KpiTile, ReportMeta } from './kpiDashboardService';

type Row = Record<string, any>;
type SelectItem = { expr: string; key: string };
type ParsedSql = { items: SelectItem[]; fromPart: string; where: string; aliasTables: Map<string, string> };

const fmt = (n: number, d = 2) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const int = (n: number) => n.toLocaleString('en-US');
// ABAP data preview prints negative numbers with a trailing minus.
const num = (v: any) => { const s = String(v ?? '').trim(); const neg = /-$/.test(s); const n = Number(s.replace(/-$/, '')); return Number.isFinite(n) ? (neg ? -n : n) : 0; };
const isoDate = (s: string) => /^\d{8}$/.test(s) ? `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6)}` : s;
const quote = (s: string) => `'${s.replace(/'/g, "''") || ' '}'`;

function parseDetailSql(raw: string): ParsedSql | null {
  const sql = String(raw || '').replace(/\s+/g, ' ').trim().replace(/\s*\.\s*$/, '');
  if (!/^SELECT\s/i.test(sql) || /^SELECT\s+(DISTINCT|SINGLE)\b/i.test(sql) || /-- combined with --/.test(raw)) return null;
  const masked = sql.replace(/'(?:[^']|'')*'/g, m => ' '.repeat(m.length));
  const depth: number[] = [];
  let d = 0;
  for (let i = 0; i < masked.length; i++) { if (masked[i] === '(') d++; depth[i] = d; if (masked[i] === ')') d--; }
  const find = (re: RegExp, start: number) => {
    const g = new RegExp(re.source, 'gi'); g.lastIndex = start;
    for (let x = g.exec(masked); x; x = g.exec(masked)) if (depth[x.index] === 0) return x.index;
    return -1;
  };
  const fromIdx = find(/\bFROM\b/, 7);
  if (fromIdx < 0 || find(/\b(GROUP\s+BY|HAVING)\b/, fromIdx) >= 0) return null;
  const endIdx = find(/\b(ORDER\s+BY|INTO|UP\s+TO)\b/, fromIdx);
  const end = endIdx >= 0 ? endIdx : sql.length;
  const whereIdx = find(/\bWHERE\b/, fromIdx);
  const hasWhere = whereIdx >= 0 && whereIdx < end;
  const fromPart = sql.slice(fromIdx, hasWhere ? whereIdx : end).trim();
  const where = hasWhere ? sql.slice(whereIdx + 5, end).trim() : '';

  const list = sql.slice(6, fromIdx);
  let parts: string[] = [];
  let start = 0;
  for (let i = 0; i < list.length; i++) if (masked[6 + i] === ',' && depth[6 + i] === 0) { parts.push(list.slice(start, i)); start = i + 1; }
  parts.push(list.slice(start));
  // Old space-separated select lists: "A~F1 A~F2 AS X".
  if (parts.length === 1 && !/\(/.test(list)) {
    const toks = list.trim().split(/\s+/);
    parts = [];
    for (let i = 0; i < toks.length; i++) {
      if (/^AS$/i.test(toks[i + 1] || '')) { parts.push(`${toks[i]} AS ${toks[i + 2]}`); i += 2; } else parts.push(toks[i]);
    }
  }
  const items: SelectItem[] = [];
  for (const p of parts.map(s => s.trim()).filter(Boolean)) {
    if (/\b(SUM|COUNT|AVG|MIN|MAX)\s*\(/i.test(p)) return null;
    const m = /^(.*?)(?:\s+AS\s+([\w/]+))?$/i.exec(p);
    if (!m) return null;
    const expr = m[1].trim();
    if (/\*/.test(expr)) return null;
    items.push({ expr, key: (m[2] || expr.split('~').pop() || expr).toUpperCase() });
  }
  const aliasTables = new Map<string, string>();
  for (const a of fromPart.matchAll(/\b(?:FROM|JOIN)\s+([A-Z_/][\w/]*)(?:\s+AS\s+([\w/]+))?/gi)) aliasTables.set((a[2] || a[1]).toUpperCase(), a[1].toUpperCase());
  return { items, fromPart, where, aliasTables };
}

function humanizeFilter(where: string, labelOfExpr: (expr: string) => string): string[] {
  if (!where) return ['None — every record in the source tables'];
  return [where
    .replace(/\b([A-Z_/][\w/]*~[\w/]+)\b/gi, m => labelOfExpr(m))
    .replace(/'((?:19|20)\d{2})(\d{2})(\d{2})'/g, '$1-$2-$3')
    .replace(/\s+/g, ' ').trim()];
}

export async function buildPopulationKpiDashboard(
  query: string,
  base: any,
  reportTable: any
): Promise<{ dashboard: any; text: string } | { error: string }> {
  const roles: Record<string, string | undefined> = { ...(base?.roles || {}) };
  const data = reportTable?.data || {};
  const parsed = parseDetailSql(data.sqlExecuted || '');
  if (!parsed) return { error: 'the report query has a shape (UNION, DISTINCT, GROUP BY or aggregates) that cannot be re-aggregated over the full dataset' };
  const columns: { key: string; label: string }[] = Array.isArray(data.columns) ? data.columns : [];
  const labelOf = (key?: string) => (key && columns.find(c => c.key.toUpperCase() === key.toUpperCase())?.label) || key || '';
  const exprOf = (key?: string) => key ? parsed.items.find(i => i.key === key.toUpperCase())?.expr : undefined;
  const labelOfExpr = (expr: string) => { const it = parsed.items.find(i => i.expr.toUpperCase() === expr.toUpperCase()); return it ? labelOf(it.key) : expr.split('~').pop() || expr; };

  // Column roles guessed from sample values are checked against the real DDIC data types before aggregating.
  const fieldOf = (expr: string) => {
    const [alias, field] = expr.includes('~') ? expr.split('~') : [[...parsed.aliasTables.keys()][0], expr];
    return { table: parsed.aliasTables.get(String(alias).toUpperCase()), field: String(field).toUpperCase() };
  };
  const simple = parsed.items.filter(i => /^[\w/]+(~[\w/]+)?$/.test(i.expr));
  const typeOf = new Map<string, string>();
  const refOf = new Map<string, { table: string; field: string }>();
  const tabs = [...new Set(simple.map(i => fieldOf(i.expr).table).filter(Boolean))] as string[];
  if (tabs.length) {
    const dd = await executeReadOnlySelect(`SELECT TABNAME, FIELDNAME, DATATYPE, REFTABLE, REFFIELD FROM DD03L WHERE TABNAME IN ( ${tabs.map(quote).join(', ')} ) AND FIELDNAME IN ( ${[...new Set(simple.map(i => fieldOf(i.expr).field))].map(quote).join(', ')} )`, 1000);
    if (!('error' in dd)) simple.forEach(i => {
      const f = fieldOf(i.expr);
      const hit = dd.rows.find((r: any) => String(r.TABNAME).trim() === f.table && String(r.FIELDNAME).trim() === f.field);
      if (!hit) return;
      typeOf.set(i.key, String(hit.DATATYPE).trim());
      if (String(hit.REFFIELD || '').trim()) refOf.set(i.key, { table: String(hit.REFTABLE).trim(), field: String(hit.REFFIELD).trim() });
    });
  }
  let curExprFromRef: string | undefined;
  if (typeOf.size) {
    const NUMERIC = /^(CURR|QUAN|DEC|INT1|INT2|INT4|INT8|FLTP|D16N|D34N|DF16_DEC|DF34_DEC)$/;
    const t = (k?: string) => (k ? typeOf.get(k.toUpperCase()) || '' : '');
    const firstOf = (type: string) => parsed.items.find(i => typeOf.get(i.key) === type)?.key;
    if (!NUMERIC.test(t(roles.amountCol))) roles.amountCol = firstOf('CURR') || firstOf('QUAN');
    const amtType = t(roles.amountCol);
    if (amtType === 'CURR') { if (t(roles.currencyCol) !== 'CUKY') roles.currencyCol = firstOf('CUKY'); }
    else if (amtType === 'QUAN') roles.currencyCol = t(roles.currencyCol) === 'UNIT' ? roles.currencyCol : firstOf('UNIT');
    else roles.currencyCol = undefined;
    // The amount's own currency/unit field from the DDIC reference, even when the report did not select it.
    const ref = roles.amountCol ? refOf.get(roles.amountCol.toUpperCase()) : undefined;
    if (ref && /^(CURR|QUAN)$/.test(amtType)) {
      const alias = [...parsed.aliasTables.entries()].find(([, tab]) => tab === ref.table)?.[0];
      const explicitAliases = parsed.items.some(i => i.expr.includes('~'));
      const refExpr = alias ? (explicitAliases ? `${alias}~${ref.field}` : ref.field) : undefined;
      const selected = parsed.items.find(i => i.expr.toUpperCase() === refExpr?.toUpperCase());
      if (selected) roles.currencyCol = selected.key;
      else if (refExpr && !roles.currencyCol) curExprFromRef = refExpr;
    }
    if (t(roles.dateCol) !== 'DATS') roles.dateCol = firstOf('DATS');
    const notDimension = (k?: string) => !k || NUMERIC.test(t(k)) || /^(CUKY|UNIT|DATS|TIMS)$/.test(t(k)) || k === roles.currencyCol;
    const dimension = (re: RegExp, except?: string) => parsed.items.find(i => i.key !== except && !notDimension(i.key) && typeOf.has(i.key) && re.test(labelOf(i.key)))?.key;
    if (notDimension(roles.topCol)) roles.topCol = dimension(/customer|party|supplier|vendor|material|plant|carrier|user|account|cost center|profit center/i);
    if (notDimension(roles.shareCol) || roles.shareCol === roles.topCol) roles.shareCol = dimension(/status|type|category|group|plant|class|priority|movement/i, roles.topCol);
  }
  const date = exprOf(roles.dateCol), amt = exprOf(roles.amountCol), cur = exprOf(roles.currencyCol) || curExprFromRef;
  const top = exprOf(roles.topCol), share = exprOf(roles.shareCol);
  const sampleRows: Row[] = Array.isArray(data.rows) ? data.rows : [];
  // The document number column (several item rows can belong to one document).
  const docItem = parsed.items.find(i => /^(VBELN|EBELN|AUFNR|BELNR|QMNUM|MBLNR|BANFN|TOR_ID|DOCNR|DOCLN|RBELN|LBLNI|PRUEFLOS|EQUNR)$/.test(i.key))
    || parsed.items.find(i => /document|doc\.|purch.*doc|order$|invoice|delivery$|notification|requisition/i.test(labelOf(i.key)) && !/item|type|categ|date|currency|status/i.test(labelOf(i.key)));
  const docCount = docItem && sampleRows.length && new Set(sampleRows.map(r => r[docItem.key])).size < sampleRows.length;
  const from = (extra?: string) => {
    const cond = [parsed.where && `( ${parsed.where} )`, extra].filter(Boolean).join(' AND ');
    return `${parsed.fromPart}${cond ? ` WHERE ${cond}` : ''}`;
  };
  const queries: string[] = [];
  const run = async (sql: string, maxRows: number) => { queries.push(sql); const r = await executeReadOnlySelect(sql, maxRows); return 'error' in r ? { error: r.error } : { rows: r.rows as Row[] }; };

  const overallSql = `SELECT COUNT( * ) AS CNT${docItem ? `, COUNT( DISTINCT ${docItem.expr} ) AS DDOC` : ''}${top ? `, COUNT( DISTINCT ${top} ) AS DTOP` : ''}${date ? `, MIN( ${date} ) AS DMIN, MAX( ${date} ) AS DMAX` : ''} ${from()}`;
  const curSql = amt ? `SELECT ${cur ? `${cur} AS CUR, ` : ''}COUNT( * ) AS CNT, SUM( ${amt} ) AS AMT, MAX( ${amt} ) AS MAXV, MIN( ${amt} ) AS MINV ${from()}${cur ? ` GROUP BY ${cur}` : ''}` : '';
  const shareSql = share ? `SELECT ${share} AS K, COUNT( * ) AS V ${from()} GROUP BY ${share} ORDER BY V DESCENDING` : '';
  const [overall, curRes, shareRes] = await Promise.all([run(overallSql, 1), curSql ? run(curSql, 1000) : null, shareSql ? run(shareSql, 6) : null]);
  if ('error' in overall) return { error: overall.error };
  if (curRes && 'error' in curRes) return { error: curRes.error };
  const o = overall.rows[0] || {};
  const total = num(o.CNT);

  // CURR amounts are stored with 2 decimals regardless of the currency; TCURX gives the real decimals.
  let factor = (_c: string) => 1;
  if (amt && cur && curRes && 'rows' in curRes && typeOf.get(String(roles.amountCol).toUpperCase()) === 'CURR') {
    const curs = [...new Set(curRes.rows.map(r => String(r.CUR || '').trim()).filter(Boolean))];
    if (curs.length) {
      const tc = await executeReadOnlySelect(`SELECT CURRKEY, CURRDEC FROM TCURX WHERE CURRKEY IN ( ${curs.map(quote).join(', ')} )`, 100);
      const dec = new Map<string, number>();
      if (!('error' in tc)) tc.rows.forEach((r: any) => dec.set(String(r.CURRKEY).trim(), num(r.CURRDEC)));
      factor = (c: string) => 10 ** (2 - (dec.has(c) ? dec.get(c)! : 2));
    }
  }
  const byCur = (curRes && 'rows' in curRes ? curRes.rows : []).map(r => {
    const c = String(r.CUR ?? '').trim();
    return { cur: c, count: num(r.CNT), amount: num(r.AMT) * factor(c), max: num(r.MAXV) * factor(c), min: num(r.MINV) * factor(c) };
  }).sort((a, b) => b.count - a.count || b.amount - a.amount);
  const main = byCur[0];
  const mainFilter = cur && main && byCur.length > 1 ? `${cur} = ${quote(main.cur)}` : undefined;
  const mainCur = main?.cur || '';
  const money = (v: number) => `${fmt(v)}${mainCur ? ` ${mainCur}` : ''}`;
  const amtLabel = labelOf(roles.amountCol);

  // Signed amounts (debits/credits, returns) can net to zero, so their positive and negative sums are shown too.
  let signed: { pos: number; neg: number } | null = null;
  if (amt && main && main.min < 0) {
    const both = (op: string) => run(`SELECT SUM( ${amt} ) AS V ${from([mainFilter, `${amt} ${op} 0`].filter(Boolean).join(' AND '))}`, 1);
    const [p, ng] = await Promise.all([both('>'), both('<')]);
    if ('rows' in p && 'rows' in ng) signed = { pos: num(p.rows[0]?.V) * factor(mainCur), neg: num(ng.rows[0]?.V) * factor(mainCur) };
  }
  // Balanced data (journal debits = credits) nets to ~0 per period, so charts use the positive side.
  const balanced = !!signed && signed.pos > 0 && Math.abs(main!.amount) < signed.pos * 0.01;
  const chartFilter = [mainFilter, balanced ? `${amt} > 0` : ''].filter(Boolean).join(' AND ') || undefined;
  const chartAmtLabel = `${amtLabel}${balanced ? ' (positive side)' : ''}`;

  const trendSql = date ? `SELECT SUBSTRING( ${date}, 1, 6 ) AS PERIOD, COUNT( * ) AS CNT${amt ? `, SUM( ${amt} ) AS AMT` : ''} ${from(chartFilter)} GROUP BY SUBSTRING( ${date}, 1, 6 )` : '';
  const topSql = top ? `SELECT ${top} AS K, ${amt ? `SUM( ${amt} )` : 'COUNT( * )'} AS V, COUNT( * ) AS CNT ${from([chartFilter, `${top} <> ' '`].filter(Boolean).join(' AND '))} GROUP BY ${top} ORDER BY V DESCENDING` : '';
  const [trendRes, topRes] = await Promise.all([trendSql ? run(trendSql, 5000) : null, topSql ? run(topSql, 10) : null]);
  let dmin = String(o.DMIN || '').trim();
  const dmax = String(o.DMAX || '').trim();
  if (date && dmin === '00000000' && /^\d{8}$/.test(dmax) && dmax !== '00000000') {
    const r2 = await run(`SELECT MIN( ${date} ) AS DMIN ${from(`${date} <> '00000000'`)}`, 1);
    if ('rows' in r2) dmin = String(r2.rows[0]?.DMIN || '').trim();
  }

  const recordLabel = docItem && docCount ? 'line records' : 'records';
  const tiles: KpiTile[] = [{ label: 'Total matching records', value: int(total), hint: docItem && docCount ? 'line items, complete dataset' : 'complete dataset' }];
  if (docItem && o.DDOC !== undefined && docCount) tiles.push({ label: `Distinct ${labelOf(docItem.key)}`, value: int(num(o.DDOC)) });
  if (main) {
    tiles.push({ label: /^total\b/i.test(amtLabel) ? amtLabel : `Total ${amtLabel}`, value: money(main.amount), hint: byCur.length > 1 ? `${int(main.count)} ${mainCur} records; other currencies in insights` : undefined });
    tiles.push({ label: 'Average per record', value: money(main.amount / Math.max(1, main.count)) });
    tiles.push({ label: 'Largest', value: money(main.max) });
    if (signed) {
      tiles.push({ label: `${amtLabel} \u2014 positive`, value: money(signed.pos), hint: 'e.g. debits' });
      tiles.push({ label: `${amtLabel} \u2014 negative`, value: money(signed.neg), hint: 'e.g. credits' });
    }
  }
  if (top && o.DTOP !== undefined) tiles.push({ label: `Distinct ${labelOf(roles.topCol)}`, value: int(num(o.DTOP)) });
  const dateRange = date && /^\d{8}$/.test(dmin) && dmin !== '00000000' ? (dmin === dmax ? isoDate(dmin) : `${isoDate(dmin)} \u2192 ${isoDate(dmax)}`) : undefined;
  if (dateRange) tiles.push({ label: `${labelOf(roles.dateCol)} range`, value: dateRange });

  const sourceSystem = String(data.sourceSystem || 'Live S/4HANA database');
  const dash: KpiDashboard = {
    title: `KPI Dashboard \u2014 ${data.reportTitle || 'Live Report'}`,
    subtitle: `${int(total)} matching ${recordLabel} \u2014 all of them aggregated live in SAP`,
    tiles, insights: [],
    note: `Every KPI, total, percentage and chart is aggregated in the SAP database (COUNT / SUM / GROUP BY) over all ${int(total)} matching ${recordLabel}; nothing is sampled or estimated.${byCur.length > 1 ? (typeOf.get(String(roles.amountCol).toUpperCase()) === 'QUAN' ? ` Quantities in different units are never added together: quantity charts use ${mainCur} records.` : ` Amounts are not converted between currencies: amount charts use ${mainCur} records.`) : ''}`
  };
  const insights: string[] = [];
  if (trendRes && 'rows' in trendRes) {
    const points = trendRes.rows.map(r => ({ p: String(r.PERIOD || '').trim(), count: num(r.CNT), amount: amt ? num(r.AMT) * factor(mainCur) : num(r.CNT) }))
      .filter(x => /^\d{6}$/.test(x.p) && x.p !== '000000').sort((a, b) => a.p.localeCompare(b.p))
      .map(x => ({ period: `${x.p.slice(0, 4)}-${x.p.slice(4)}`, amount: Math.round(x.amount * 100) / 100, count: x.count }));
    if (points.length) {
      dash.trend = { title: `${amt ? chartAmtLabel : 'Records'} by month${mainFilter ? ` (${mainCur})` : ''}`, points, amountLabel: amt ? `${chartAmtLabel}${mainCur ? ` (${mainCur})` : ''}` : 'Records' };
      const best = [...points].sort((a, b) => b.amount - a.amount)[0];
      insights.push(`Highest month: ${best.period} with ${amt ? `${money(best.amount)} (${int(best.count)} ${recordLabel})` : `${int(best.count)} ${recordLabel}`}.`);
    }
  }
  if (topRes && 'rows' in topRes && topRes.rows.length) {
    const items = topRes.rows.map(r => ({ name: String(r.K ?? '').trim() || '(blank)', value: Math.round((amt ? num(r.V) * factor(mainCur) : num(r.V)) * 100) / 100 }));
    dash.top = { title: `Top ${items.length} ${labelOf(roles.topCol)} by ${amt ? chartAmtLabel : 'records'}`, items, valueLabel: amt ? `${chartAmtLabel}${mainCur ? ` (${mainCur})` : ''}` : 'Records' };
    const denom = amt ? (balanced ? signed!.pos : main?.amount || 0) : total;
    if (denom) insights.push(`${labelOf(roles.topCol)} ${items[0].name} accounts for ${(items[0].value / denom * 100).toFixed(1)}% of ${amt ? `${chartAmtLabel.toLowerCase()}${mainCur ? ` (${mainCur})` : ''}` : 'records'}; the top ${Math.min(3, items.length)} together ${(items.slice(0, 3).reduce((a, b) => a + b.value, 0) / denom * 100).toFixed(1)}%.`);
  }
  if (shareRes && 'rows' in shareRes && shareRes.rows.length) {
    const slices = shareRes.rows.map(r => ({ name: String(r.K ?? '').trim() || '(not assigned)', value: num(r.V) }));
    const rest = total - slices.reduce((a, b) => a + b.value, 0);
    if (rest > 0) slices.push({ name: 'Other', value: rest });
    dash.share = { title: `Records by ${labelOf(roles.shareCol)}`, slices, valueLabel: 'Records' };
    insights.push(`Most common ${labelOf(roles.shareCol).toLowerCase()}: ${slices[0].name} (${int(slices[0].value)} of ${int(total)}, ${(slices[0].value / Math.max(1, total) * 100).toFixed(1)}%).`);
  }
  if (byCur.length > 1) insights.push(`Totals by ${typeOf.get(String(roles.amountCol).toUpperCase()) === 'QUAN' ? 'unit' : 'currency'}: ${byCur.map(c => `${fmt(c.amount)} ${c.cur || '(none)'} (${int(c.count)} ${recordLabel})`).join('; ')}.`);
  dash.insights = insights;

  const filters = humanizeFilter(parsed.where, labelOfExpr);
  const shown = Math.min(200, sampleRows.length);
  dash.meta = {
    scope: 'Complete matching dataset \u2014 aggregated in SAP', totalRecords: total, recordLabel, filters, dateRange,
    sourceSystem, dataTimestamp: new Date().toISOString(), detailShown: shown, aggregateQueries: queries
  } as ReportMeta;
  dash.exportTable = {
    columns, rows: sampleRows.slice(0, 5000),
    caption: sampleRows.length < total ? `Detail: first ${int(Math.min(5000, sampleRows.length))} of ${int(total)} matching ${recordLabel} (KPIs above cover all ${int(total)})` : `Detail: all ${int(total)} matching ${recordLabel}`
  };

  const text = [
    `Report on all ${int(total)} matching ${recordLabel} in ${sourceSystem}${dateRange ? `, ${labelOf(roles.dateCol)} ${dateRange.replace(' \u2192 ', ' to ')}` : ''}.`,
    docItem && docCount && o.DDOC !== undefined ? `They belong to ${int(num(o.DDOC))} distinct documents (${labelOf(docItem.key)}).` : '',
    byCur.length ? `Total ${amtLabel.toLowerCase()}: ${byCur.map(c => `${fmt(c.amount)}${c.cur ? ` ${c.cur}` : ''}`).join('; ')}${signed ? ` (${mainCur || 'main'}: positive ${fmt(signed.pos)}, negative ${fmt(signed.neg)})` : ''}.` : '',
    dash.top?.items.length ? `Top ${labelOf(roles.topCol).toLowerCase()}: ${dash.top.items[0].name} (${amt ? money(dash.top.items[0].value) : `${int(dash.top.items[0].value)} ${recordLabel}`}).` : '',
    `All KPIs and charts are aggregated over the complete dataset; the table lists ${shown < total ? `the first ${int(shown)} of ${int(total)} records` : 'every record'}.`
  ].filter(Boolean).join(' ');
  return { dashboard: { type: 'live_kpi_dashboard', toolName: base.toolName, agentName: base.agentName, data: dash }, text };
}

// Dashboards built from a live report whose rows are already the complete dataset (all pages were read).
export function attachCompleteDatasetMeta(dashboard: any, sourceSystem: string, filterNote: string, totalRecords: number, exportRows?: { columns: { key: string; label: string }[]; rows: Row[] }) {
  const dash: KpiDashboard = dashboard.data;
  const range = dash.tiles.find(t => /range$/i.test(t.label));
  dash.meta = {
    scope: 'Complete matching dataset \u2014 every page read live', totalRecords, recordLabel: 'records',
    filters: [filterNote || 'As stated in the report'], dateRange: range?.value, sourceSystem, dataTimestamp: new Date().toISOString(), detailShown: totalRecords
  };
  if (exportRows) {
    const rows = exportRows.rows.slice(0, 20000);
    dash.exportTable = { columns: exportRows.columns, rows, caption: rows.length < totalRecords ? `Detail: first ${int(rows.length)} of ${int(totalRecords)} matching records (KPIs above cover all ${int(totalRecords)})` : `Detail: all ${int(totalRecords)} matching records` };
  }
  dash.note = `All KPIs and charts are computed over all ${int(totalRecords)} matching records read live (every page); nothing is sampled or estimated.${/currenc/i.test(dash.note) ? ' Amounts are not converted between currencies.' : ''}`;
  return dashboard;
}
