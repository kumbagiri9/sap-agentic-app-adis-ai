// KPI dashboard (tiles, trend, top-N, share, insights) derived from the live rows a report already returned.
// Only computes over real returned rows; never adds or estimates values.
const REPORT_RE = /\b(reports?|dashboards?|charts?|graphs?|kpis?|visuali[sz]e|visuali[sz]ation|analytics)\b/i;

type Row = Record<string, any>;
export type KpiTile = { label: string; value: string; hint?: string };
export type KpiDashboard = {
  title: string; subtitle: string; tiles: KpiTile[];
  trend?: { title: string; points: { period: string; amount: number; count: number }[]; amountLabel: string };
  top?: { title: string; items: { name: string; value: number }[]; valueLabel: string };
  share?: { title: string; slices: { name: string; value: number }[]; valueLabel: string };
  insights: string[]; note: string;
  meta?: ReportMeta;
  exportTable?: { columns: { key: string; label: string }[]; rows: Row[]; caption: string };
};
export type ReportMeta = {
  scope: string; totalRecords: number; recordLabel: string; filters: string[]; dateRange?: string;
  sourceSystem: string; dataTimestamp: string; detailShown: number; aggregateQueries?: string[];
};

const ID_KEY = /(number|^id$|id$|document|item|rank|^order$|invoice$|delivery$|^material$|^product$|^po$|^so$)/i;
const AMOUNT_KEY = /(amount|value|net|sales|revenue|price|cost|total|spend|worth)/i;

function parseNum(v: any): number {
  if (typeof v === 'number') return v;
  const s = String(v ?? '').trim();
  const m = /^(-?[\d,]+(?:\.\d+)?)(?:\s*\S{1,6})?$/.exec(s);
  return m ? Number(m[1].replace(/,/g, '')) : NaN;
}
function parseCurrencySuffix(v: any): string {
  return /^-?[\d,]+(?:\.\d+)?\s+([A-Z]{3})$/.exec(String(v ?? '').trim())?.[1] || '';
}
function parseDate(v: any): string | null {
  const s = String(v ?? '').trim();
  let m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = /^((?:19|20)\d{2})(\d{2})(\d{2})$/.exec(s);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = /\/Date\((-?\d+)/.exec(s);
  return m ? new Date(Number(m[1])).toISOString().slice(0, 10) : null;
}
const pretty = (k: string) => k.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ').replace(/^./, c => c.toUpperCase());
const fmt = (n: number, d = 2) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

export function wantsKpiDashboard(query: string): boolean {
  return REPORT_RE.test(query);
}

export function buildKpiDashboard(query: string, toolResults: any[]): any | null {
  if (!wantsKpiDashboard(query) || toolResults.some(r => r?.type === 'live_kpi_dashboard')) return null;
  const sets = toolResults.filter(r => ['mm_live_report', 'live_odata_records', 'hana_db_intelligence_report'].includes(r?.type)).map(r => {
    const rows = Array.isArray(r?.data) ? r.data : Array.isArray(r?.data?.rows) ? r.data.rows : Array.isArray(r?.data?.results) ? r.data.results : null;
    return { r, rows: (rows || []).filter((x: any) => x && typeof x === 'object' && !Array.isArray(x)) as Row[] };
  }).filter(s => s.rows.length >= 2);
  if (!sets.length) return null;
  const { r: source, rows } = sets.sort((a, b) => b.rows.length - a.rows.length)[0];
  const labelOf = (k: string) => (Array.isArray(source?.data?.columns) ? source.data.columns.find((c: any) => c.key === k)?.label : '') || pretty(k);
  const keys = [...new Set(rows.slice(0, 50).flatMap(x => Object.keys(x)))].filter(k => k !== '__metadata' && !/^to_/.test(k));
  const share80 = (k: string, f: (v: any) => boolean) => rows.filter(x => x[k] !== undefined && x[k] !== null && x[k] !== '' && x[k] !== '\u2014').filter(x => f(x[k])).length >= rows.length * 0.8;
  const distinct = (k: string) => new Set(rows.map(x => String(x[k] ?? ''))).size;

  const dateCols = keys.filter(k => share80(k, v => !!parseDate(v)));
  const context = `${source?.data?.reportTitle || ''} ${source?.data?.note || ''} ${toolResults.map(r => r?.data?.reportTitle || '').join(' ')}`.toLowerCase();
  const dateScore = (k: string) => (context.includes(k.toLowerCase()) || context.includes(labelOf(k).toLowerCase()) ? 2 : 0)
    + (/creat/i.test(k) && /creat/.test(context) ? 2 : 0) + (/date/i.test(k) ? 1 : 0);
  const dateCol = dateCols.sort((a, b) => dateScore(b) - dateScore(a))[0];
  const MEASURE_KEY = /(amount|value|net|sales|revenue|price|cost|total|spend|worth|quantity|qty|count|weight|volume|days|hours|percent|rate|stock|share|invoices|customers|orders|documents|deliveries|records|lines|users)/i;
  const STRONG_MEASURE = /(amount|value|price|cost|quantity|qty|total|revenue|spend|weight|volume|netwr|net\s|count|percent|rate)/i;
  const IDENT = /(document|number|\bno\.?$|\bid\b|party|customer$|supplier$|vendor$|\bmaterial$|plant|^order$|currency|unit$|type$|group$|category$)/i;
  const isIdent = (k: string) => (IDENT.test(k) || IDENT.test(labelOf(k))) && !STRONG_MEASURE.test(k) && !STRONG_MEASURE.test(labelOf(k));
  // Integer-only columns without a measure name (ship-to, plant, document numbers) are identifiers, not measures.
  const numericCols = keys.filter(k => k !== dateCol && !/^rank$/i.test(k) && !isIdent(k) && share80(k, v => Number.isFinite(parseNum(v)))
    && (MEASURE_KEY.test(k) || MEASURE_KEY.test(labelOf(k)) || rows.some(x => /\.\d/.test(String(x[k] ?? ''))))
    && !(ID_KEY.test(k) && !MEASURE_KEY.test(k) && distinct(k) >= rows.length * 0.9));
  const amountCol = numericCols.find(k => AMOUNT_KEY.test(k) || AMOUNT_KEY.test(labelOf(k)))
    || numericCols.sort((a, b) => rows.reduce((s, x) => s + Math.abs(parseNum(x[b]) || 0), 0) - rows.reduce((s, x) => s + Math.abs(parseNum(x[a]) || 0), 0))[0];
  const currencyCol = keys.find(k => /currency|curr$|^waer/i.test(k) || /currency/i.test(labelOf(k)));
  const currencyOf = (x: Row) => (currencyCol ? String(x[currencyCol] || '') : '') || (amountCol ? parseCurrencySuffix(x[amountCol]) : '');
  const curTotals = new Map<string, number>();
  rows.forEach(x => { const c = currencyOf(x); if (amountCol && Number.isFinite(parseNum(x[amountCol]))) curTotals.set(c, (curTotals.get(c) || 0) + parseNum(x[amountCol])); });
  const mainCur = [...curTotals.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || '';
  const mainRows = amountCol && curTotals.size > 1 ? rows.filter(x => currencyOf(x) === mainCur) : rows;
  const amountLabel = amountCol ? `${labelOf(amountCol)}${mainCur ? ` (${mainCur})` : ''}` : 'Records';
  const val = (x: Row) => amountCol ? (parseNum(x[amountCol]) || 0) : 1;

  const catCols = keys.filter(k => k !== dateCol && k !== amountCol && k !== currencyCol && !numericCols.includes(k)
    && rows.every(x => typeof x[k] !== 'object') && distinct(k) >= 2 && distinct(k) <= Math.max(2, Math.min(40, rows.length * 0.9)));
  const idCandidates = keys.filter(k => k !== dateCol && k !== amountCol && !/^rank$/i.test(k) && !numericCols.includes(k) && distinct(k) >= rows.length * 0.9);
  const idCol = idCandidates.find(k => /material|product|customer|supplier|vendor|name/i.test(k)) || idCandidates.find(k => ID_KEY.test(k));
  const topCol = catCols.find(k => /customer|party|supplier|vendor|material|product|plant|user|carrier|sold/i.test(k)) || catCols[0] || idCol;
  const shareCol = catCols.find(k => k !== topCol && /status|type|category|group|plant|currency|class|priority|stock/i.test(k)) || catCols.find(k => k !== topCol);

  const tiles: KpiTile[] = [{ label: 'Records', value: rows.length.toLocaleString('en-US') }];
  if (amountCol) {
    const amounts = mainRows.map(val);
    const total = amounts.reduce((a, b) => a + b, 0);
    tiles.push({ label: /^total\b/i.test(labelOf(amountCol)) ? labelOf(amountCol) : `Total ${labelOf(amountCol)}`, value: `${fmt(total)}${mainCur ? ` ${mainCur}` : ''}`, hint: curTotals.size > 1 ? `${mainCur} only; other currencies listed below` : undefined });
    tiles.push({ label: 'Average', value: `${fmt(total / Math.max(1, amounts.length))}${mainCur ? ` ${mainCur}` : ''}` });
    tiles.push({ label: 'Largest', value: `${fmt(Math.max(...amounts))}${mainCur ? ` ${mainCur}` : ''}` });
  }
  if (topCol && topCol !== idCol) tiles.push({ label: `Distinct ${labelOf(topCol)}`, value: distinct(topCol).toLocaleString('en-US') });
  const dates = dateCol ? rows.map(x => parseDate(x[dateCol])).filter(Boolean).sort() as string[] : [];
  if (dates.length) tiles.push({ label: `${labelOf(dateCol!)} range`, value: dates[0] === dates[dates.length - 1] ? dates[0] : `${dates[0]} \u2192 ${dates[dates.length - 1]}` });

  const dash: KpiDashboard = {
    title: `KPI Dashboard \u2014 ${source?.data?.reportTitle || toolResults.find(r => r?.data?.reportTitle)?.data?.reportTitle || 'Live Report'}`,
    subtitle: `${rows.length.toLocaleString('en-US')} live record(s)${Number(source?.data?.totalRows) > rows.length ? ` (first ${rows.length.toLocaleString('en-US')} of ${Number(source.data.totalRows).toLocaleString('en-US')} matching)` : ''} from ${source?.toolName || 'the live SAP system'}`,
    tiles, insights: [],
    note: `Computed only from the ${rows.length} live record(s) returned for this question${curTotals.size > 1 ? `; amounts are not converted between currencies (charts use ${mainCur})` : ''}.`
  };

  if (dateCol) {
    const byMonth = new Map<string, { amount: number; count: number }>();
    mainRows.forEach(x => { const d = parseDate(x[dateCol]); if (!d) return; const k = d.slice(0, 7); const e = byMonth.get(k) || { amount: 0, count: 0 }; e.amount += val(x); e.count++; byMonth.set(k, e); });
    const points = [...byMonth.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([period, e]) => ({ period, amount: Math.round(e.amount * 100) / 100, count: e.count }));
    if (points.length >= 1) {
      dash.trend = { title: `${amountCol ? labelOf(amountCol) : 'Records'} by month`, points, amountLabel };
      const best = [...points].sort((a, b) => b.amount - a.amount)[0];
      dash.insights.push(`Highest month: ${best.period} with ${amountCol ? `${fmt(best.amount)}${mainCur ? ` ${mainCur}` : ''} (${best.count} record(s))` : `${best.count} record(s)`}.`);
    }
  }
  if (topCol) {
    const byCat = new Map<string, number>();
    mainRows.forEach(x => { const k = String(x[topCol] ?? '\u2014'); byCat.set(k, (byCat.get(k) || 0) + val(x)); });
    const items = [...byCat.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }));
    dash.top = { title: `Top ${items.length} ${labelOf(topCol)} by ${amountCol ? labelOf(amountCol) : 'records'}`, items, valueLabel: amountLabel };
    const sum = [...byCat.values()].reduce((a, b) => a + b, 0);
    if (items.length && sum) dash.insights.push(`${labelOf(topCol)} ${items[0].name} accounts for ${(items[0].value / sum * 100).toFixed(1)}% of ${amountCol ? labelOf(amountCol).toLowerCase() : 'records'}; the top ${Math.min(3, items.length)} together ${(items.slice(0, 3).reduce((a, b) => a + b.value, 0) / sum * 100).toFixed(1)}%.`);
  }
  const shareKey = shareCol || (curTotals.size > 1 ? currencyCol : undefined);
  if (shareKey) {
    const byS = new Map<string, number>();
    rows.forEach(x => { const k = String(x[shareKey] ?? '\u2014') || '\u2014'; byS.set(k, (byS.get(k) || 0) + 1); });
    const sorted = [...byS.entries()].sort((a, b) => b[1] - a[1]);
    const slices = sorted.slice(0, 6).map(([name, value]) => ({ name, value }));
    const rest = sorted.slice(6).reduce((a, b) => a + b[1], 0);
    if (rest) slices.push({ name: 'Other', value: rest });
    dash.share = { title: `Records by ${labelOf(shareKey)}`, slices, valueLabel: 'Records' };
    dash.insights.push(`Most common ${labelOf(shareKey).toLowerCase()}: ${slices[0].name} (${slices[0].value} of ${rows.length}).`);
  }
  if (curTotals.size > 1) dash.insights.push(`Totals by currency: ${[...curTotals.entries()].map(([c, v]) => `${fmt(v)} ${c || '(none)'}`).join('; ')}.`);
  const result = { type: 'live_kpi_dashboard', toolName: source?.toolName || 'liveReport', agentName: source?.agentName || 'Report Analytics', data: dash };
  // Not serialized to the client: which source rows and columns the dashboard was derived from.
  Object.defineProperty(result, 'source', { value: source, enumerable: false });
  Object.defineProperty(result, 'roles', { value: { dateCol, amountCol, currencyCol, topCol, shareCol: shareKey, idCol }, enumerable: false });
  return result;
}
