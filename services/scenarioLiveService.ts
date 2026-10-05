// Cross-module business scenarios answered from live S/4HANA tables (read-only ADT SQL):
// receivables follow-up, bank balances, disputes vs credit limits, make-or-buy, BOM explosion, where-used,
// suppliers, demand forecast, stock-out sales impact, scheduling bottlenecks, user activity, inventory analysis,
// supplier-delay impact and blocked AP invoices. Every number comes from the live tables; nothing is estimated.
import { executeReadOnlySelect } from './hanaDbIntelligenceService';

type Row = Record<string, string>;
type Col = { key: string; label: string };
export type ScenarioResult = { text: string; toolResults: any[] };
export type LlmFn = (systemInstruction: string, prompt: string) => Promise<string>;
export type ScenarioIntent =
  | 'AR_OVERDUE_FOLLOWUP' | 'BANK_BALANCES' | 'DISPUTE_CREDIT' | 'MAKE_OR_BUY' | 'BOM_COMPONENTS' | 'WHERE_USED'
  | 'SUPPLIERS_OF' | 'MATERIAL_FORECAST' | 'STOCKOUT_SALES_IMPACT' | 'SCHEDULING_BOTTLENECKS' | 'USER_ACTIVITY'
  | 'CREATE_SO_VALIDATION' | 'INVENTORY_ANALYSIS' | 'SUPPLY_DELAY_IMPACT' | 'AP_BLOCKED_ANALYSIS';

const AGENT_FI = 'S/4HANA Finance Live Agent';
const AGENT_SCM = 'S/4HANA Supply Chain Live Agent';
const AGENT_SEC = 'S/4HANA User Activity Agent';
const AGENT_SD = 'S/4HANA Sales Order Agent';

// ---------- helpers ----------
const lit = (s: string) => `'${String(s).replace(/'/g, "''")}'`;
// ADT data preview prints negative numbers with a trailing minus.
const num = (v: any) => { const s = String(v ?? '').trim(); const neg = /-$/.test(s); const n = Number(s.replace(/-$/, '')); return Number.isFinite(n) ? (neg ? -n : n) : 0; };
const fmt = (n: number, d = 2) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const int = (n: number) => Math.round(n).toLocaleString('en-US');
const ymd = (d: Date) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
const iso = (s: string) => /^\d{8}$/.test(s) && s !== '00000000' ? `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6)}` : '\u2014';
const toDate = (s: string) => new Date(Number(s.slice(0, 4)), Number(s.slice(4, 6)) - 1, Number(s.slice(6, 8)));
const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const daysBetween = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / 86400000);
const stripZeros = (s: string) => /^0+\d+$/.test(s) ? s.replace(/^0+/, '') : s;
const today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };

async function sel(sql: string, max = 5000): Promise<Row[]> {
  const r = await executeReadOnlySelect(sql, max);
  if ('error' in r) throw new Error(r.error);
  return r.rows.map((row: any) => Object.fromEntries(Object.entries(row).map(([k, v]) => [k, String(v ?? '').trim()])));
}
async function selIn(values: string[], build: (inList: string) => string, max = 5000, chunk = 80): Promise<Row[]> {
  const out: Row[] = [];
  const uniq = [...new Set(values.filter(Boolean))];
  for (let i = 0; i < uniq.length; i += chunk) out.push(...await sel(build(uniq.slice(i, i + chunk).map(lit).join(', ')), max));
  return out;
}
function section(agent: string, title: string, columns: Col[], rows: Row[] | any[], summaryStats: { label: string; value: string }[] = [], note = '') {
  return {
    type: 'mm_live_report', toolName: 'scenarioLiveData', agentName: agent,
    data: { reportTitle: title, summaryStats, columns, rows, note, ...(rows.length > 25 ? { pageSize: 25, downloadable: true } : {}) }
  };
}
function unavailable(agent: string, service: string, reason: string): ScenarioResult {
  return { text: `This request could not be completed from the live system: ${reason} No mock or estimated data is substituted.`, toolResults: [{ type: 'fico_service_unavailable', toolName: 'scenarioLiveData', agentName: agent, data: { service, reason } }] };
}

async function materialTexts(matnrs: string[]): Promise<Map<string, string>> {
  const rows = await selIn(matnrs, l => `SELECT MATNR, MAKTX FROM MAKT WHERE SPRAS = 'E' AND MATNR IN ( ${l} )`);
  return new Map(rows.map(r => [r.MATNR, r.MAKTX]));
}
async function vendorNames(lifnrs: string[]): Promise<Map<string, string>> {
  const rows = await selIn(lifnrs, l => `SELECT LIFNR, NAME1 FROM LFA1 WHERE LIFNR IN ( ${l} )`);
  return new Map(rows.map(r => [r.LIFNR, r.NAME1]));
}
async function customerNames(kunnrs: string[]): Promise<Map<string, string>> {
  const rows = await selIn(kunnrs, l => `SELECT KUNNR, NAME1 FROM KNA1 WHERE KUNNR IN ( ${l} )`);
  return new Map(rows.map(r => [r.KUNNR, r.NAME1]));
}

// ---------- entity extraction ----------
const STOP = /^(19|20)\d{2}$|^\d{1,2}$|^S4(HANA)?$|^ECC\d*$|^\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}$/i;
export function extractIdAfter(query: string, keywords: string[]): string | null {
  for (const k of keywords) {
    const m = new RegExp(`\\b${k}s?\\b\\s*(?:number|no\\.?|#|id)?\\s*[:#]?\\s*([A-Za-z0-9][A-Za-z0-9_\\-/@.]*[A-Za-z0-9])`, 'i').exec(query);
    if (m && /\d/.test(m[1]) && !STOP.test(m[1])) return m[1].toUpperCase();
  }
  return null;
}
export function extractMaterialToken(query: string): string | null {
  const after = extractIdAfter(query, ['material', 'component', 'product', 'part', 'item', 'manufacture', 'of', 'for']);
  if (after) return after;
  const cands = [...query.matchAll(/\b([A-Za-z]{1,10}[-_]?[A-Za-z0-9]*\d[A-Za-z0-9_-]*)\b/g)].map(m => m[1]).filter(t => !STOP.test(t) && !/^(PPDS|S4|ABAP|CDS|RAP)$/i.test(t));
  return cands[0] ? cands[0].toUpperCase() : null;
}
const extractPlant = (q: string) => /\bplant\s*[:#]?\s*([A-Z0-9]{4})\b/i.exec(q)?.[1]?.toUpperCase() || null;

type MaterialHit = { matnr: string; text: string; mtart: string; meins: string };
async function resolveMaterial(token: string): Promise<MaterialHit | null> {
  const cands = [token.toUpperCase()];
  if (/^\d+$/.test(token)) cands.push(token.padStart(18, '0'));
  const rows = await sel(`SELECT A~MATNR, A~MTART, A~MEINS, B~MAKTX FROM MARA AS A LEFT OUTER JOIN MAKT AS B ON B~MATNR = A~MATNR AND B~SPRAS = 'E' WHERE A~MATNR IN ( ${cands.map(lit).join(', ')} )`, 5);
  return rows[0] ? { matnr: rows[0].MATNR, text: rows[0].MAKTX || '', mtart: rows[0].MTART, meins: rows[0].MEINS } : null;
}
// Real materials whose number or description resembles the requested one.
async function similarMaterials(token: string): Promise<Row[]> {
  const t = token.toUpperCase();
  const parts = t.split(/[-_]/).filter(p => p.length >= 3 && p !== t);
  const cond = [`A~MATNR LIKE ${lit(`%${t}%`)}`, `B~MAKTG LIKE ${lit(`%${t}%`)}`, ...parts.map(p => /^\d+$/.test(p) ? `A~MATNR LIKE ${lit(`%${p}`)}` : `A~MATNR LIKE ${lit(`${p}%`)}`)].join(' OR ');
  const rows = await sel(`SELECT A~MATNR, A~MTART, B~MAKTX FROM MARA AS A LEFT OUTER JOIN MAKT AS B ON B~MATNR = A~MATNR AND B~SPRAS = 'E' WHERE ${cond}`, 10).catch(() => [] as Row[]);
  return rows.map(r => ({ ...r, MATNR: stripZeros(r.MATNR) }));
}
async function notFoundMaterial(token: string, agent: string, purpose: string, examples: Row[], exampleCols: Col[], exampleTitle: string): Promise<ScenarioResult> {
  const similar = await similarMaterials(token);
  const toolResults: any[] = [];
  if (similar.length) toolResults.push(section(agent, `Materials resembling "${token}"`, [{ key: 'MATNR', label: 'Material' }, { key: 'MAKTX', label: 'Description' }, { key: 'MTART', label: 'Type' }], similar));
  if (examples.length) toolResults.push(section(agent, exampleTitle, exampleCols, examples));
  return {
    text: `Material ${token} does not exist in the connected S/4HANA system (checked the material master MARA live), so ${purpose} cannot be determined for it. ${similar.length ? `Materials with a similar number or description: ${similar.slice(0, 5).map(r => r.MATNR).join(', ')}. ` : 'No material with a similar number or description exists either. '}${examples.length ? `Real materials you can ask the same question about are listed below (e.g. ${examples.slice(0, 3).map(r => r.MATNR).join(', ')}).` : ''}`,
    toolResults
  };
}

// ---------- intent classification ----------
export function classifyScenarioIntent(query: string): ScenarioIntent | null {
  const n = query.toLowerCase().replace(/\s+/g, ' ');
  if (/\b(overdue|past[- ]due)\b.*\breceivables?\b|\breceivables?\b.*\b(overdue|past[- ]due)\b/.test(n) && /(follow[- ]?up|e-?mails?|draft|dunning|credit risk)/.test(n)) return 'AR_OVERDUE_FOLLOWUP';
  if (/\bbank accounts?\b/.test(n) && /\bbalances?\b/.test(n)) return 'BANK_BALANCES';
  if (/\bdisputes?\b/.test(n) && /(credit limit|utili[sz]ation|write[- ]?offs?)/.test(n)) return 'DISPUTE_CREDIT';
  if (/\b(procured|purchased|bought|externally procured)\b.*\b(or|vs\.?|versus)\b.*\b(manufactured|produced|made|in[- ]house)\b|\b(make[- ]or[- ]buy|procurement type)\b/.test(n) && extractMaterialToken(query)) return 'MAKE_OR_BUY';
  if (/\b(blocked|on hold)\b.*\b(ap|supplier|vendor)?\s*invoices?\b/.test(n) && /(3-way|three[- ]way|root cause|unblock|discount)/.test(n)) return 'AP_BLOCKED_ANALYSIS';
  if (/\b(delay notification|delivery (?:is |was )?(?:pushed|delayed|moved)|pushing (?:our )?(?:next )?delivery|delayed by \d+ days|out by \d+ days)\b/.test(n) && /\bmaterial\b/.test(n)) return 'SUPPLY_DELAY_IMPACT';
  if (/\b(ppds|detailed scheduling)\b/.test(n) || (/\bbottlenecks?\b/.test(n) && /must[- ]arrive/.test(n))) return 'SCHEDULING_BOTTLENECKS';
  if (/\b(run out|stock[- ]?out|overconsum\w*|out of stock)\b/.test(n) && /\b(sales|customer orders?|orders)\b/.test(n) && /\b(impact|affect)/.test(n) && extractMaterialToken(query)) return 'STOCKOUT_SALES_IMPACT';
  if (/\bforecast\b/.test(n) && /\b(component|material|part)\b/.test(n) && extractIdAfter(query, ['component', 'material', 'part'])) return 'MATERIAL_FORECAST';
  if (/\bwho (supplies|provides|sells|delivers)\b|\b(suppliers?|vendors?) (of|for) (component|material|part)\b/.test(n) && extractMaterialToken(query)) return 'SUPPLIERS_OF';
  if (/\b(what|which) (other )?(materials?|products?|assemblies|boms?|parents?)\b.*\b(have|has|use|uses|contain|contains|include|includes|consume|consumes)\b.*\b(component|material|part)\b/.test(n) || /\bwhere[- ]used\b/.test(n)) {
    if (extractIdAfter(query, ['component', 'material', 'part', 'for', 'of'])) return 'WHERE_USED';
  }
  if (/\bcomponents?\b/.test(n) && /\b(manufactur\w*|produc\w*|make|build|assembl\w*)\b/.test(n) && extractMaterialToken(query)) return 'BOM_COMPONENTS';
  if (/\bperformance of (the )?user\b|\buser\b.*\bperformance\b|\bsummari[sz]e\b.*\buser\b/.test(n) && /\b[A-Z][A-Z0-9_@.]{2,}\b/.test(query)) return 'USER_ACTIVITY';
  if (/\bcreate (a |an |new )?sales order\b/.test(n) && /\bcustomer\b/.test(n) && /\bfor \d+(\.\d+)? (?:[a-z]{1,3} )?[A-Za-z]*[-_]?[A-Za-z0-9]*\d/i.test(query)) return 'CREATE_SO_VALIDATION';
  if (/\binventory (analysis|analytics|health|overview|assessment)\b/.test(n)) return 'INVENTORY_ANALYSIS';
  return null;
}

// ================= FINANCE =================
type OpenItem = Row & { due: Date; daysOverdue: number; amount: number };
function netDueDate(r: Row): Date {
  const base = toDate(r.ZFBDT && r.ZFBDT !== '00000000' ? r.ZFBDT : r.BLDAT || r.BUDAT);
  const days = num(r.ZBD3T) || num(r.ZBD2T) || num(r.ZBD1T);
  return addDays(base, days);
}

export async function buildArOverdueFollowUp(query: string, llm: LlmFn): Promise<ScenarioResult> {
  try {
    const t = today();
    const items = await sel(`SELECT KUNNR, BUKRS, BELNR, GJAHR, BUZEI, BUDAT, BLDAT, ZFBDT, ZBD1T, ZBD2T, ZBD3T, WRBTR, WAERS, SHKZG, XBLNR FROM BSID`, 20000);
    const open: OpenItem[] = items.map(r => {
      const due = netDueDate(r);
      return { ...r, due, daysOverdue: daysBetween(due, t), amount: (r.SHKZG === 'H' ? -1 : 1) * num(r.WRBTR) } as OpenItem;
    });
    const overdue = open.filter(r => r.daysOverdue > 0 && r.amount > 0);
    const byCust = new Map<string, { kunnr: string; cur: string; amount: number; items: OpenItem[]; maxDays: number }>();
    overdue.forEach(r => {
      const k = `${r.KUNNR}|${r.WAERS}`;
      const e = byCust.get(k) || { kunnr: r.KUNNR, cur: r.WAERS, amount: 0, items: [], maxDays: 0 };
      e.amount += r.amount; e.items.push(r); e.maxDays = Math.max(e.maxDays, r.daysOverdue);
      byCust.set(k, e);
    });
    const top = [...byCust.values()].sort((a, b) => b.amount - a.amount).slice(0, 10);
    if (!top.length) return { text: `There are ${int(open.length)} open customer items in the live accounts receivable (BSID), and none is past its net due date today (${iso(ymd(t))}).`, toolResults: [] };
    const kunnrs = top.map(c => c.kunnr);
    const [names, credit, risk, totalsRows, mails] = await Promise.all([
      customerNames(kunnrs),
      selIn(kunnrs, l => `SELECT PARTNER, CREDIT_SGMNT, CREDIT_LIMIT, XBLOCKED, XCRITICAL FROM UKMBP_CMS_SGM WHERE PARTNER IN ( ${l} )`),
      selIn(kunnrs, l => `SELECT PARTNER, RISK_CLASS, OWN_RATING FROM UKMBP_CMS WHERE PARTNER IN ( ${l} )`),
      selIn(kunnrs, l => `SELECT KUNNR, WAERS, SHKZG, SUM( WRBTR ) AS AMT FROM BSID WHERE KUNNR IN ( ${l} ) GROUP BY KUNNR, WAERS, SHKZG`),
      selIn(kunnrs, l => `SELECT A~KUNNR, B~SMTP_ADDR FROM KNA1 AS A INNER JOIN ADR6 AS B ON B~ADDRNUMBER = A~ADRNR WHERE A~KUNNR IN ( ${l} )`).catch(() => [] as Row[])
    ]);
    const openTotal = new Map<string, number>();
    totalsRows.forEach(r => { const k = `${r.KUNNR}|${r.WAERS}`; openTotal.set(k, (openTotal.get(k) || 0) + (r.SHKZG === 'H' ? -1 : 1) * num(r.AMT)); });
    const rows = top.map((c, i) => {
      const limits = credit.filter(x => x.PARTNER === c.kunnr && num(x.CREDIT_LIMIT) > 0);
      const limit = limits.length ? Math.max(...limits.map(x => num(x.CREDIT_LIMIT))) : 0;
      const rk = risk.find(x => x.PARTNER === c.kunnr);
      const critical = credit.some(x => x.PARTNER === c.kunnr && (x.XCRITICAL === 'X' || x.XBLOCKED === 'X'));
      const exposure = openTotal.get(`${c.kunnr}|${c.cur}`) || c.amount;
      const util = limit ? exposure / limit * 100 : null;
      // Risk score: overdue age, live risk class, critical/blocked flag and limit utilization (each from live data).
      const score = Math.min(c.maxDays, 365) / 365 * 40 + (rk?.RISK_CLASS && rk.RISK_CLASS >= 'C' ? 25 : rk?.RISK_CLASS === 'B' ? 12 : 0) + (critical ? 15 : 0) + (util !== null ? Math.min(util, 150) / 150 * 20 : 0);
      return {
        rank: String(i + 1), customer: stripZeros(c.kunnr), name: names.get(c.kunnr) || '\u2014', overdue: `${fmt(c.amount)} ${c.cur}`, items: String(c.items.length),
        oldest: `${int(c.maxDays)} days`, riskClass: rk?.RISK_CLASS || '\u2014', creditLimit: limit ? `${fmt(limit)}` : 'not set',
        utilization: util !== null ? `${util.toFixed(1)}%` : '\u2014', flags: critical ? 'Critical / blocked in credit mgmt' : '\u2014', riskScore: score.toFixed(0),
        email: mails.find(m => m.KUNNR === c.kunnr)?.SMTP_ADDR || '', _c: c, _score: score
      };
    });
    const highest = [...rows].sort((a, b) => b._score - a._score).slice(0, 3);
    let drafts = '';
    try {
      drafts = await llm(
        'You are an accounts-receivable collections specialist. Draft one short, professional, personalized follow-up email per account given. Use ONLY the facts provided (customer name, invoice references, amounts, currencies, days overdue, risk). Tone: courteous for moderate risk, firmer and requesting a payment date for high risk. Never invent amounts, dates, names, phone numbers or payment terms. Address the customer by name; if no email address is given, write "To: (no email address on the customer master)". Sign as "Accounts Receivable Team". Separate emails with a line "---". Plain text, no markdown headings.',
        JSON.stringify(highest.map(r => ({
          customer: r.customer, name: r.name, email: r.email || null, totalOverdue: r.overdue, oldestDaysOverdue: r.oldest, riskClass: r.riskClass, creditUtilization: r.utilization,
          invoices: r._c.items.sort((a, b) => b.daysOverdue - a.daysOverdue).slice(0, 5).map(it => ({ document: it.BELNR, reference: it.XBLNR || null, amount: `${fmt(it.amount)} ${it.WAERS}`, dueDate: iso(ymd(it.due)), daysOverdue: it.daysOverdue }))
        })))
      );
    } catch { drafts = ''; }
    const cols: Col[] = [
      { key: 'rank', label: '#' }, { key: 'customer', label: 'Customer' }, { key: 'name', label: 'Name' }, { key: 'overdue', label: 'Overdue Amount' }, { key: 'items', label: 'Overdue Items' },
      { key: 'oldest', label: 'Oldest Overdue' }, { key: 'riskClass', label: 'Risk Class' }, { key: 'creditLimit', label: 'Credit Limit' }, { key: 'utilization', label: 'Limit Utilization' },
      { key: 'flags', label: 'Credit Flags' }, { key: 'riskScore', label: 'Risk Score (0-100)' }
    ];
    const itemRows = top.flatMap(c => c.items.sort((a, b) => b.daysOverdue - a.daysOverdue).slice(0, 5).map(it => ({ customer: stripZeros(c.kunnr), document: it.BELNR, year: it.GJAHR, companyCode: it.BUKRS, reference: it.XBLNR || '\u2014', amount: `${fmt(it.amount)} ${it.WAERS}`, dueDate: iso(ymd(it.due)), daysOverdue: String(it.daysOverdue) })));
    const text = `Top ${top.length} overdue receivables from the live open customer items (BSID, ${int(overdue.length)} items past their net due date as of ${iso(ymd(t))}): ${rows.slice(0, 3).map(r => `${r.name} (${r.customer}) ${r.overdue}, oldest ${r.oldest}`).join('; ')}. Highest credit risk (live risk class, credit-management flags, limit utilization and overdue age): ${highest.map(r => `${r.name} (score ${r.riskScore})`).join(', ')}.${drafts ? `\n\nDraft follow-up emails (drafts only \u2014 nothing has been sent):\n\n${drafts}` : ''}`;
    return {
      text,
      toolResults: [
        section(AGENT_FI, 'Top 10 Overdue Receivables with Credit Risk', cols, rows.map(({ _c, _score, email, ...r }) => r), [
          { label: 'Overdue items', value: int(overdue.length) }, { label: 'Customers overdue', value: int(byCust.size) }, { label: 'As of', value: iso(ymd(t)) }
        ], 'Net due date = baseline date + payment-term days (ZFBDT + ZBD3T/ZBD2T/ZBD1T) from the live open items. Risk score combines overdue age (40), live risk class (25), critical/blocked flag (15) and credit-limit utilization (20). Amounts are in document currency and are not converted.'),
        section(AGENT_FI, 'Overdue Invoices of the Top 10 Accounts', [
          { key: 'customer', label: 'Customer' }, { key: 'document', label: 'Document' }, { key: 'year', label: 'Year' }, { key: 'companyCode', label: 'Company Code' }, { key: 'reference', label: 'Reference' },
          { key: 'amount', label: 'Amount' }, { key: 'dueDate', label: 'Net Due Date' }, { key: 'daysOverdue', label: 'Days Overdue' }
        ], itemRows)
      ]
    };
  } catch (e: any) { return unavailable(AGENT_FI, 'Accounts Receivable', e?.message || String(e)); }
}

export async function buildBankBalances(): Promise<ScenarioResult> {
  try {
    const accts = await sel(`SELECT A~BUKRS, A~HBKID, A~HKTID, A~HKONT, A~WAERS, B~BANKS, B~BANKL FROM T012K AS A LEFT OUTER JOIN T012 AS B ON B~BUKRS = A~BUKRS AND B~HBKID = A~HBKID`, 1000);
    if (!accts.length) return { text: 'No house bank accounts are defined in the connected S/4HANA system (table T012K is empty).', toolResults: [] };
    const ledger = (await sel(`SELECT RLDNR FROM FINSC_LEDGER WHERE XLEADING = 'X'`, 5).catch(() => []))[0]?.RLDNR || '0L';
    const glList = [...new Set(accts.map(a => a.HKONT))];
    const bal = await selIn(glList, l => `SELECT RBUKRS, RACCT, RHCUR, RWCUR, SUM( HSL ) AS HSL, SUM( WSL ) AS WSL, MAX( BUDAT ) AS LAST FROM ACDOCA WHERE RLDNR = ${lit(ledger)} AND RACCT IN ( ${l} ) GROUP BY RBUKRS, RACCT, RHCUR, RWCUR`);
    const rows = accts.map(a => {
      const b = bal.filter(x => x.RBUKRS === a.BUKRS && x.RACCT === a.HKONT);
      const lc = b.reduce((s, x) => s + num(x.HSL), 0);
      const lcCur = b[0]?.RHCUR || '';
      const inAcctCur = b.filter(x => x.RWCUR === a.WAERS).reduce((s, x) => s + num(x.WSL), 0);
      return {
        companyCode: a.BUKRS, houseBank: a.HBKID, accountId: a.HKTID, bank: [a.BANKS, a.BANKL].filter(Boolean).join(' ') || '\u2014', glAccount: stripZeros(a.HKONT),
        currency: a.WAERS, balance: b.length ? `${fmt(inAcctCur)} ${a.WAERS}` : 'no postings', balanceLc: b.length ? `${fmt(lc)} ${lcCur}` : '\u2014', lastPosting: b.length ? iso(b.map(x => x.LAST).sort().pop() || '') : '\u2014',
        _cur: a.WAERS, _amt: inAcctCur, _has: b.length > 0
      };
    }).sort((x, y) => Math.abs(y._amt) - Math.abs(x._amt));
    const totals = new Map<string, number>();
    rows.filter(r => r._has).forEach(r => totals.set(r._cur, (totals.get(r._cur) || 0) + r._amt));
    const withBal = rows.filter(r => r._has);
    return {
      text: `${accts.length} house bank accounts are defined (T012K); ${withBal.length} have postings on their G/L account in the leading ledger ${ledger} (ACDOCA). Balance totals by account currency: ${[...totals.entries()].map(([c, v]) => `${fmt(v)} ${c}`).join('; ') || 'none'}. Largest: ${withBal.slice(0, 3).map(r => `${r.companyCode}/${r.houseBank}/${r.accountId} ${r.balance}`).join('; ') || 'none'}.`,
      toolResults: [section(AGENT_FI, 'Bank Account Balances (G/L, live)', [
        { key: 'companyCode', label: 'Company Code' }, { key: 'houseBank', label: 'House Bank' }, { key: 'accountId', label: 'Account ID' }, { key: 'bank', label: 'Bank Country / Key' },
        { key: 'glAccount', label: 'G/L Account' }, { key: 'currency', label: 'Account Currency' }, { key: 'balance', label: 'Balance (Account Currency)' }, { key: 'balanceLc', label: 'Balance (Company Code Currency)' }, { key: 'lastPosting', label: 'Last Posting' }
      ], rows.map(({ _cur, _amt, _has, ...r }) => r), [{ label: 'House bank accounts', value: String(accts.length) }, { label: 'With postings', value: String(withBal.length) }, ...[...totals.entries()].map(([c, v]) => ({ label: `Total ${c}`, value: fmt(v) }))],
      `Book balance = sum of all postings on the bank G/L account in ledger ${ledger} (ACDOCA), not the bank statement balance. Bank clearing/sub-accounts are not included.`)]
    };
  } catch (e: any) { return unavailable(AGENT_FI, 'Bank Accounts', e?.message || String(e)); }
}

export async function buildDisputeCreditReview(query: string): Promise<ScenarioResult> {
  try {
    const threshold = Number(/(\d{1,3})\s*%/.exec(query)?.[1] || 90);
    const cases = await sel(`SELECT A~CASE_GUID, A~FIN_KUNNR, A~FIN_BUKRS, A~FIN_ORIGINAL_AMT, A~FIN_DISPUTED_AMT, A~FIN_PAID_AMT, A~FIN_CREDITED_AMT, A~FIN_WRT_OFF_AMT, A~FIN_NOT_SOLV_AMT, A~FIN_DISPUTE_CURR, B~EXT_KEY, B~CASE_TITLE, B~REASON_CODE, B~PRIORITY, B~CREATE_TIME, B~CLOSING_TIME, B~PROCESSOR, B~STAT_ORDERNO FROM UDMCASEATTR00 AS A INNER JOIN SCMG_T_CASE_ATTR AS B ON B~CASE_GUID = A~CASE_GUID`, 5000);
    const isOpen = (c: Row) => num(c.FIN_DISPUTED_AMT) > 0 && (!c.CLOSING_TIME || /^0+$/.test(c.CLOSING_TIME.replace(/\D/g, '')));
    const open = cases.filter(isOpen);
    const closed = cases.filter(c => !isOpen(c) && num(c.FIN_ORIGINAL_AMT) > 0);
    const kunnrs = [...new Set(cases.map(c => c.FIN_KUNNR).filter(Boolean))];
    const [limits, arRows, soRows, names] = await Promise.all([
      selIn(kunnrs, l => `SELECT PARTNER, CREDIT_SGMNT, CREDIT_LIMIT FROM UKMBP_CMS_SGM WHERE PARTNER IN ( ${l} )`),
      selIn(kunnrs, l => `SELECT KUNNR, SHKZG, SUM( DMBTR ) AS AMT FROM BSID WHERE KUNNR IN ( ${l} ) GROUP BY KUNNR, SHKZG`),
      selIn(kunnrs, l => `SELECT A~KUNNR, SUM( B~NETWR ) AS AMT FROM VBAK AS A INNER JOIN VBAP AS B ON B~VBELN = A~VBELN WHERE A~KUNNR IN ( ${l} ) AND B~ABGRU = ' ' AND B~GBSTA <> 'C' GROUP BY A~KUNNR`).catch(() => [] as Row[]),
      customerNames(kunnrs)
    ]);
    const custInfo = new Map(kunnrs.map(k => {
      const lim = Math.max(0, ...limits.filter(x => x.PARTNER === k).map(x => num(x.CREDIT_LIMIT)));
      const ar = arRows.filter(x => x.KUNNR === k).reduce((s, x) => s + (x.SHKZG === 'H' ? -1 : 1) * num(x.AMT), 0);
      const so = num(soRows.find(x => x.KUNNR === k)?.AMT);
      const exposure = ar + so;
      return [k, { limit: lim, ar, so, exposure, util: lim > 0 ? exposure / lim * 100 : null }];
    }));
    // Historical settlement pattern per customer from closed disputes: share written off vs credited vs paid.
    const history = new Map<string, { n: number; orig: number; wo: number; cr: number; paid: number; maxWo: number }>();
    closed.forEach(c => {
      const h = history.get(c.FIN_KUNNR) || { n: 0, orig: 0, wo: 0, cr: 0, paid: 0, maxWo: 0 };
      h.n++; h.orig += num(c.FIN_ORIGINAL_AMT); h.wo += num(c.FIN_WRT_OFF_AMT); h.cr += num(c.FIN_CREDITED_AMT); h.paid += num(c.FIN_PAID_AMT); h.maxWo = Math.max(h.maxWo, num(c.FIN_WRT_OFF_AMT));
      history.set(c.FIN_KUNNR, h);
    });
    const allHist = [...history.values()].reduce((a, h) => ({ orig: a.orig + h.orig, wo: a.wo + h.wo, cr: a.cr + h.cr, paid: a.paid + h.paid }), { orig: 0, wo: 0, cr: 0, paid: 0 });
    const rows = open.map(c => {
      const ci = custInfo.get(c.FIN_KUNNR) || { limit: 0, ar: 0, so: 0, exposure: 0, util: null as number | null };
      const h = history.get(c.FIN_KUNNR);
      const amt = num(c.FIN_DISPUTED_AMT);
      const woShare = h && h.orig ? (h.wo + h.cr) / h.orig : (allHist.orig ? (allHist.wo + allHist.cr) / allHist.orig : 0);
      const writeOff = woShare >= 0.5 && (h ? amt <= Math.max(h.maxWo, h.orig / Math.max(1, h.n)) : amt <= 500);
      return {
        caseId: stripZeros(c.EXT_KEY) || c.CASE_GUID.slice(0, 10), customer: stripZeros(c.FIN_KUNNR), name: names.get(c.FIN_KUNNR) || '\u2014', title: c.CASE_TITLE || '\u2014', reason: c.REASON_CODE || '\u2014',
        disputed: `${fmt(amt)} ${c.FIN_DISPUTE_CURR}`, creditLimit: ci.limit ? fmt(ci.limit) : 'not set', exposure: fmt(ci.exposure), utilization: ci.util !== null ? `${ci.util.toFixed(1)}%` : '\u2014',
        history: h ? `${h.n} closed: ${fmt((h.wo + h.cr) / Math.max(h.orig, 0.01) * 100, 0)}% written off/credited, ${fmt(h.paid / Math.max(h.orig, 0.01) * 100, 0)}% paid` : 'no closed disputes (company-wide pattern used)',
        suggestion: writeOff ? 'Write off' : 'Pursue / negotiate', _amt: amt, _util: ci.util
      };
    }).sort((a, b) => b._amt - a._amt);
    const over = rows.filter(r => r._util !== null && r._util > threshold);
    const shown = over.length ? over : rows;
    const cols: Col[] = [
      { key: 'caseId', label: 'Dispute Case' }, { key: 'customer', label: 'Customer' }, { key: 'name', label: 'Name' }, { key: 'title', label: 'Title' }, { key: 'reason', label: 'Reason' },
      { key: 'disputed', label: 'Disputed Amount' }, { key: 'creditLimit', label: 'Credit Limit' }, { key: 'exposure', label: 'Credit Exposure' }, { key: 'utilization', label: 'Utilization' },
      { key: 'history', label: 'Settlement History' }, { key: 'suggestion', label: 'Suggestion' }
    ];
    const text = over.length
      ? `${over.length} open dispute case(s) belong to customers whose credit-limit utilization is over ${threshold}%, prioritized by disputed value: ${over.slice(0, 5).map(r => `${r.caseId} ${r.name} ${r.disputed} (${r.utilization})`).join('; ')}. Suggested write-offs based on historical settlement patterns: ${over.filter(r => r.suggestion === 'Write off').map(r => r.caseId).join(', ') || 'none'}.`
      : `No open dispute case belongs to a customer with credit-limit utilization over ${threshold}% (${open.length} open dispute case(s) checked live; utilization = open receivables + open sales orders against the live credit limit). All open disputes are listed below by disputed value with each customer's utilization and a write-off suggestion; ${rows.filter(r => r.suggestion === 'Write off').length} qualify for write-off based on historical settlement patterns.`;
    return {
      text,
      toolResults: [section(AGENT_FI, over.length ? `Open Disputes \u2014 Customers over ${threshold}% Credit Utilization` : 'Open Disputes with Credit Utilization', cols, shown.map(({ _amt, _util, ...r }) => r), [
        { label: 'Open disputes', value: String(open.length) }, { label: `Over ${threshold}% utilization`, value: String(over.length) }, { label: 'Closed disputes (history)', value: String(closed.length) },
        { label: 'Company-wide written off/credited', value: allHist.orig ? `${fmt((allHist.wo + allHist.cr) / allHist.orig * 100, 0)}%` : '\u2014' }
      ], 'Disputes: FSCM Dispute Management (UDMCASEATTR00 + SCMG_T_CASE_ATTR). Credit limit: Credit Management (UKMBP_CMS_SGM, highest segment limit). Exposure = open receivables (BSID) + open sales order value (VBAP). Write-off rule: suggest write-off when the customer historically settled at least 50% of disputed value by write-off or credit and the open amount is not larger than its typical settled case; otherwise pursue.')]
    };
  } catch (e: any) { return unavailable(AGENT_FI, 'Dispute Management', e?.message || String(e)); }
}

export async function buildApBlockedAnalysis(query: string): Promise<ScenarioResult> {
  try {
    const t = today();
    const windowDays = Number(/next\s+(\d{1,3})\s+days/i.exec(query)?.[1] || 14);
    const windowEnd = addDays(t, windowDays);
    const dm = /(\d{1,2})\/(\d{1,2})\/(\d{2,4})/.exec(query);
    const clearBy = dm ? new Date(Number(dm[3].length === 2 ? `20${dm[3]}` : dm[3]), Number(dm[1]) - 1, Number(dm[2])) : null;
    const vendor = extractIdAfter(query, ['vendor', 'supplier']);
    const blocked = await sel(`SELECT A~BELNR, A~GJAHR, A~BUKRS, A~LIFNR, A~FAELL, A~MRM_ZLSPR, B~ZFBDT, B~ZBD1T, B~ZBD1P, B~ZBD2T, B~ZBD2P, B~RMWWR, B~WAERS, B~XBLNR, B~BLDAT FROM RBKP_BLOCKED AS A INNER JOIN RBKP AS B ON B~BELNR = A~BELNR AND B~GJAHR = A~GJAHR${vendor ? ` WHERE A~LIFNR = ${lit(/^\d+$/.test(vendor) ? vendor.padStart(10, '0') : vendor)}` : ''}`, 5000);
    if (!blocked.length) return { text: `There are no blocked supplier invoices${vendor ? ` for vendor ${vendor}` : ''} in the live invoice-verification block list (RBKP_BLOCKED).`, toolResults: [] };
    const keys = blocked.map(b => `${b.BELNR}${b.GJAHR}`);
    const items = await selIn(blocked.map(b => b.BELNR), l => `SELECT BELNR, GJAHR, BUZEI, EBELN, EBELP, MATNR, MENGE, BSTME, WRBTR, SPGRP, SPGRM, SPGRT, SPGRG, SPGRS, SPGRQ, SPGRC FROM RSEG WHERE BELNR IN ( ${l} )`);
    const myItems = items.filter(i => keys.includes(`${i.BELNR}${i.GJAHR}`));
    const poKeys = [...new Set(myItems.map(i => i.EBELN).filter(Boolean))];
    const [po, gr, names] = await Promise.all([
      selIn(poKeys, l => `SELECT EBELN, EBELP, NETPR, PEINH, MENGE, MEINS FROM EKPO WHERE EBELN IN ( ${l} )`),
      selIn(poKeys, l => `SELECT EBELN, EBELP, SHKZG, SUM( MENGE ) AS QTY FROM EKBE WHERE VGABE = '1' AND EBELN IN ( ${l} ) GROUP BY EBELN, EBELP, SHKZG`),
      vendorNames([...new Set(blocked.map(b => b.LIFNR))])
    ]);
    const grQty = (e: string, p: string) => gr.filter(g => g.EBELN === e && g.EBELP === p).reduce((s, g) => s + (g.SHKZG === 'H' ? -1 : 1) * num(g.QTY), 0);
    const analyse = (b: Row) => {
      const its = myItems.filter(i => i.BELNR === b.BELNR && i.GJAHR === b.GJAHR);
      const causes: string[] = []; const steps: string[] = [];
      its.forEach(i => {
        const p = po.find(x => x.EBELN === i.EBELN && x.EBELP === i.EBELP);
        const poPrice = p ? num(p.NETPR) / Math.max(1, num(p.PEINH)) : 0;
        const invPrice = num(i.MENGE) ? num(i.WRBTR) / num(i.MENGE) : 0;
        const received = i.EBELN ? grQty(i.EBELN, i.EBELP) : 0;
        if (i.SPGRP || (p && poPrice && Math.abs(invPrice - poPrice) / poPrice > 0.005)) { causes.push(`Price variance on PO ${i.EBELN}/${stripZeros(i.EBELP)}: invoiced ${fmt(invPrice)} vs PO ${fmt(poPrice)} per unit`); steps.push(`Confirm the price with the buyer; either update PO ${i.EBELN} item ${stripZeros(i.EBELP)} price or accept the variance, then release the invoice in MRBR`); }
        if (i.SPGRM || (i.EBELN && num(i.MENGE) > received + 0.0001)) { causes.push(`Quantity variance on PO ${i.EBELN}/${stripZeros(i.EBELP)}: invoiced ${fmt(num(i.MENGE), 3)} vs goods received ${fmt(received, 3)} ${i.BSTME}`); steps.push(`Post the missing goods receipt (MIGO) for PO ${i.EBELN} item ${stripZeros(i.EBELP)} or request a credit memo for ${fmt(num(i.MENGE) - received, 3)} ${i.BSTME}; the block is lifted automatically when quantities match`); }
        if (i.SPGRT) { causes.push(`Schedule (date) variance on PO ${i.EBELN}/${stripZeros(i.EBELP)}`); steps.push('Review the delivery date variance with purchasing and release in MRBR'); }
        if (i.SPGRG) { causes.push(`Order price quantity variance on PO ${i.EBELN}/${stripZeros(i.EBELP)}`); steps.push('Correct the order price unit quantity on the PO or GR and release in MRBR'); }
        if (i.SPGRS) { causes.push('Item amount block (amount above tolerance for items without PO reference)'); steps.push('Have an authorized approver review the amount and release in MRBR'); }
        if (i.SPGRC) { causes.push('Quality inspection block (inspection lot not yet accepted)'); steps.push('Complete the usage decision for the inspection lot; the invoice is then released automatically'); }
        if (i.SPGRQ) { causes.push('Manual block on the item'); steps.push('Ask the person who set the manual block to confirm, then release in MRBR'); }
      });
      if (!causes.length) { causes.push(b.MRM_ZLSPR === 'M' ? 'Manual payment block on the invoice header' : b.MRM_ZLSPR === 'S' ? 'Stochastic (random) block' : 'Blocked for variances (no item-level variance remains \u2014 tolerances may have changed since posting)'); steps.push(b.MRM_ZLSPR === 'M' ? 'Confirm with the AP clerk who set the block and remove the payment block' : 'Re-run automatic release in MRBR; if still blocked, review tolerances with purchasing'); }
      const d1 = addDays(toDate(b.ZFBDT || b.BLDAT), num(b.ZBD1T));
      const disc = num(b.RMWWR) * num(b.ZBD1P) / 100;
      return { causes: [...new Set(causes)], steps: [...new Set(steps)], discDeadline: d1, discount: disc };
    };
    const enriched = blocked.map(b => ({ b, a: analyse(b), due: toDate(b.FAELL) }));
    const inWindow = enriched.filter(e => e.due >= t && e.due <= windowEnd);
    const target = inWindow.length ? inWindow : enriched;
    const discTotals = new Map<string, { available: number; lost: number }>();
    target.forEach(e => {
      if (!e.a.discount) return;
      const k = e.b.WAERS; const x = discTotals.get(k) || { available: 0, lost: 0 };
      if (clearBy && clearBy <= e.a.discDeadline) x.available += e.a.discount; else x.lost += e.a.discount;
      discTotals.set(k, x);
    });
    const rows = target.sort((x, y) => num(y.b.RMWWR) - num(x.b.RMWWR)).map(e => ({
      invoice: `${e.b.BELNR}/${e.b.GJAHR}`, vendor: stripZeros(e.b.LIFNR), name: names.get(e.b.LIFNR) || '\u2014', amount: `${fmt(num(e.b.RMWWR))} ${e.b.WAERS}`, dueDate: iso(e.b.FAELL),
      block: e.b.MRM_ZLSPR === 'A' ? 'Variance (auto)' : e.b.MRM_ZLSPR === 'M' ? 'Manual' : e.b.MRM_ZLSPR === 'S' ? 'Stochastic' : e.b.MRM_ZLSPR || '\u2014',
      rootCause: e.a.causes.join(' | '), nextStep: e.a.steps.join(' | '),
      discount: e.a.discount ? `${fmt(e.a.discount)} ${e.b.WAERS} (${fmt(num(e.b.ZBD1P), 1)}% until ${iso(ymd(e.a.discDeadline))})` : 'none'
    }));
    const clearTxt = clearBy ? `If cleared by ${iso(ymd(clearBy))}: ${[...discTotals.entries()].map(([c, v]) => `${fmt(v.available)} ${c} of early-payment discount can still be taken and ${fmt(v.lost)} ${c} is already lost (discount deadline before that date)`).join('; ') || 'no cash-discount terms on these invoices'}${clearBy < t ? ` (note: ${iso(ymd(clearBy))} is already in the past)` : ''}.` : `Early-payment discounts on these invoices: ${[...discTotals.entries()].map(([c, v]) => `${fmt(v.available + v.lost)} ${c}`).join('; ') || 'none'}.`;
    const text = `${inWindow.length ? `${inWindow.length} blocked supplier invoice(s)${vendor ? ` for vendor ${vendor}` : ''} are due between ${iso(ymd(t))} and ${iso(ymd(windowEnd))}.` : `No blocked supplier invoice${vendor ? ` for vendor ${vendor}` : ''} is due in the next ${windowDays} days (${iso(ymd(t))} to ${iso(ymd(windowEnd))}); all ${blocked.length} currently blocked invoices are already past their due date and are analysed instead.`} Root causes found: ${[...new Set(target.flatMap(e => e.a.causes.map(c => c.split(' on PO')[0].split(':')[0])))].join(', ')}. ${clearTxt}`;
    return {
      text,
      toolResults: [section(AGENT_FI, inWindow.length ? `Blocked AP Invoices Due in the Next ${windowDays} Days` : 'Blocked AP Invoices (none due in the window \u2014 all past due)', [
        { key: 'invoice', label: 'Invoice' }, { key: 'vendor', label: 'Vendor' }, { key: 'name', label: 'Name' }, { key: 'amount', label: 'Gross Amount' }, { key: 'dueDate', label: 'Net Due Date' },
        { key: 'block', label: 'Block Type' }, { key: 'rootCause', label: '3-Way Match Root Cause' }, { key: 'nextStep', label: 'Step to Unblock' }, { key: 'discount', label: 'Cash Discount' }
      ], rows, [
        { label: 'Blocked invoices', value: String(blocked.length) }, { label: `Due in next ${windowDays} days`, value: String(inWindow.length) },
        ...[...discTotals.entries()].flatMap(([c, v]) => clearBy ? [{ label: `Discount still available ${c}`, value: fmt(v.available) }, { label: `Discount lost ${c}`, value: fmt(v.lost) }] : [{ label: `Discount ${c}`, value: fmt(v.available + v.lost) }])
      ], 'Blocked invoices: RBKP_BLOCKED + RBKP (terms, gross amount). Root cause from the item blocking reasons (RSEG) and a live comparison of invoice vs PO price (EKPO) and invoiced vs received quantity (EKBE goods receipts). Discount = gross amount x first cash-discount % (ZBD1P), deadline = baseline date + ZBD1T days.')]
    };
  } catch (e: any) { return unavailable(AGENT_FI, 'Invoice Verification', e?.message || String(e)); }
}

// ================= SUPPLY CHAIN =================
const SAMPLE_COLS: Col[] = [{ key: 'MATNR', label: 'Material' }, { key: 'MAKTX', label: 'Description' }, { key: 'INFO', label: 'Why it qualifies' }];

async function exampleMaterialsWithBom(): Promise<Row[]> {
  const r = await sel(`SELECT A~MATNR, A~WERKS, COUNT( * ) AS ITEMS FROM MAST AS A INNER JOIN STPO AS B ON B~STLNR = A~STLNR WHERE B~STLTY = 'M' AND A~WERKS <> ' ' GROUP BY A~MATNR, A~WERKS ORDER BY ITEMS DESCENDING`, 8).catch(() => []);
  const t = await materialTexts(r.map(x => x.MATNR));
  return r.map(x => ({ MATNR: x.MATNR, MAKTX: t.get(x.MATNR) || '', INFO: `BOM in plant ${x.WERKS} with ${num(x.ITEMS)} items` }));
}
async function exampleSharedComponents(): Promise<Row[]> {
  const r = await sel(`SELECT B~IDNRK, COUNT( DISTINCT A~MATNR ) AS PARENTS FROM MAST AS A INNER JOIN STPO AS B ON B~STLNR = A~STLNR WHERE B~STLTY = 'M' AND B~IDNRK <> ' ' GROUP BY B~IDNRK ORDER BY PARENTS DESCENDING`, 8).catch(() => []);
  const t = await materialTexts(r.map(x => x.IDNRK));
  return r.map(x => ({ MATNR: x.IDNRK, MAKTX: t.get(x.IDNRK) || '', INFO: `component in ${num(x.PARENTS)} BOMs` }));
}
async function exampleSuppliedMaterials(): Promise<Row[]> {
  const r = await sel(`SELECT MATNR, COUNT( DISTINCT LIFNR ) AS N FROM EINA WHERE LOEKZ = ' ' AND MATNR <> ' ' GROUP BY MATNR ORDER BY N DESCENDING`, 8).catch(() => []);
  const t = await materialTexts(r.map(x => x.MATNR));
  return r.map(x => ({ MATNR: x.MATNR, MAKTX: t.get(x.MATNR) || '', INFO: `${num(x.N)} supplier info record(s)` }));
}
async function exampleDemandMaterials(): Promise<Row[]> {
  const r = await sel(`SELECT MATNR, COUNT( * ) AS N FROM RESB WHERE XLOEK = ' ' AND KZEAR = ' ' AND BDTER >= ${lit(ymd(today()))} GROUP BY MATNR ORDER BY N DESCENDING`, 8).catch(() => []);
  const t = await materialTexts(r.map(x => x.MATNR));
  return r.map(x => ({ MATNR: x.MATNR, MAKTX: t.get(x.MATNR) || '', INFO: `${num(x.N)} open future requirement(s)` }));
}

const BESKZ_TEXT: Record<string, string> = { E: 'Manufactured in-house', F: 'Procured externally', X: 'Both (in-house and external)' };

export async function buildMakeOrBuy(query: string): Promise<ScenarioResult> {
  const token = extractMaterialToken(query)!;
  try {
    const mat = await resolveMaterial(token);
    if (!mat) return notFoundMaterial(token, AGENT_SCM, 'its procurement type (make or buy)', await exampleMaterialsWithBom(), SAMPLE_COLS, 'Real materials with procurement data');
    const plant = extractPlant(query);
    const [marc, bom, eina, prod, pos] = await Promise.all([
      sel(`SELECT WERKS, BESKZ, SOBSL, DISMM, DISPO, PLIFZ, DZEIT, EKGRP FROM MARC WHERE MATNR = ${lit(mat.matnr)}${plant ? ` AND WERKS = ${lit(plant)}` : ''}`, 100),
      sel(`SELECT WERKS, COUNT( * ) AS N FROM MAST WHERE MATNR = ${lit(mat.matnr)} GROUP BY WERKS`, 100),
      sel(`SELECT COUNT( DISTINCT LIFNR ) AS N FROM EINA WHERE MATNR = ${lit(mat.matnr)} AND LOEKZ = ' '`, 1),
      sel(`SELECT B~WERKS, COUNT( * ) AS N FROM AFPO AS B WHERE B~MATNR = ${lit(mat.matnr)} GROUP BY B~WERKS`, 100).catch(() => [] as Row[]),
      sel(`SELECT WERKS, COUNT( * ) AS N FROM EKPO WHERE MATNR = ${lit(mat.matnr)} AND LOEKZ = ' ' GROUP BY WERKS`, 100)
    ]);
    const sobsl = [...new Set(marc.map(m => m.SOBSL).filter(Boolean))];
    const sobslText = sobsl.length ? await sel(`SELECT WERKS, SOBSL, LTEXT FROM T460T WHERE SPRAS = 'E' AND SOBSL IN ( ${sobsl.map(lit).join(', ')} )`, 200).catch(() => [] as Row[]) : [];
    const rows = marc.map(m => ({
      plant: m.WERKS, procurement: `${m.BESKZ || '\u2014'} \u2014 ${BESKZ_TEXT[m.BESKZ] || 'not maintained'}`,
      special: m.SOBSL ? `${m.SOBSL} ${sobslText.find(s => s.WERKS === m.WERKS && s.SOBSL === m.SOBSL)?.LTEXT || ''}`.trim() : '\u2014',
      mrpType: m.DISMM || '\u2014', controller: m.DISPO || '\u2014', inhouseDays: m.DZEIT || '0', deliveryDays: m.PLIFZ || '0',
      bom: bom.some(b => b.WERKS === m.WERKS) ? 'Yes' : 'No', prodOrders: String(num(prod.find(p => p.WERKS === m.WERKS)?.N)), purchaseOrders: String(num(pos.find(p => p.WERKS === m.WERKS)?.N))
    }));
    if (!rows.length) return { text: `Material ${mat.matnr} (${mat.text}) exists but has no plant data (MARC), so no procurement type is maintained for any plant.`, toolResults: [] };
    const kinds = [...new Set(marc.map(m => BESKZ_TEXT[m.BESKZ] || 'not maintained'))];
    return {
      text: `${mat.matnr} (${mat.text || mat.mtart}) is ${kinds.length === 1 ? kinds[0].toLowerCase() : `maintained differently per plant: ${rows.map(r => `${r.plant}: ${r.procurement.split(' \u2014 ')[1].toLowerCase()}`).join(', ')}`}, according to the live MRP view (MARC procurement type). Evidence: ${rows.map(r => `plant ${r.plant} \u2014 BOM ${r.bom.toLowerCase()}, ${r.prodOrders} production order(s), ${r.purchaseOrders} purchase order item(s)`).join('; ')}; ${num(eina[0]?.N)} supplier info record(s).`,
      toolResults: [section(AGENT_SCM, `Make or Buy \u2014 ${mat.matnr} ${mat.text}`, [
        { key: 'plant', label: 'Plant' }, { key: 'procurement', label: 'Procurement Type' }, { key: 'special', label: 'Special Procurement' }, { key: 'mrpType', label: 'MRP Type' }, { key: 'controller', label: 'MRP Controller' },
        { key: 'inhouseDays', label: 'In-house Prod. Time (days)' }, { key: 'deliveryDays', label: 'Planned Deliv. Time (days)' }, { key: 'bom', label: 'BOM' }, { key: 'prodOrders', label: 'Production Orders' }, { key: 'purchaseOrders', label: 'PO Items' }
      ], rows, [], 'Procurement type from the material master MRP view (MARC-BESKZ): E = in-house production, F = external procurement, X = both. Production and purchase order counts show actual history.')]
    };
  } catch (e: any) { return unavailable(AGENT_SCM, 'Material Master', e?.message || String(e)); }
}

type BomLine = { level: number; parent: string; item: string; component: string; qty: number; unit: string; category: string };
async function explodeBom(matnr: string, plant: string | null, maxLevels = 4): Promise<{ plant: string; alt: string; usage: string; lines: BomLine[] } | null> {
  const heads = await sel(`SELECT WERKS, STLAN, STLNR, STLAL FROM MAST WHERE MATNR = ${lit(matnr)}${plant ? ` AND WERKS = ${lit(plant)}` : ''}`, 50);
  if (!heads.length) return null;
  const head = heads.sort((a, b) => (a.STLAN === '1' ? 0 : 1) - (b.STLAN === '1' ? 0 : 1) || a.STLAL.localeCompare(b.STLAL) || (a.WERKS ? 0 : 1) - (b.WERKS ? 0 : 1))[0];
  const lines: BomLine[] = [];
  const itemsOf = async (stlnr: string, stlal: string) => {
    const rows = await sel(`SELECT P~POSNR, P~IDNRK, P~MENGE, P~MEINS, P~POSTP, P~DATUV, P~STLKN FROM STAS AS S INNER JOIN STPO AS P ON P~STLTY = S~STLTY AND P~STLNR = S~STLNR AND P~STLKN = S~STLKN WHERE S~STLTY = 'M' AND S~STLNR = ${lit(stlnr)} AND S~STLAL = ${lit(stlal)} AND S~LKENZ = ' ' AND P~DATUV <= ${lit(ymd(today()))}`, 2000);
    const latest = new Map<string, Row>();
    rows.forEach(r => { const prev = latest.get(r.STLKN); if (!prev || r.DATUV > prev.DATUV) latest.set(r.STLKN, r); });
    const unique = new Map<string, Row>();
    [...latest.values()].forEach(r => { const k = `${r.POSNR}|${r.IDNRK}`; const prev = unique.get(k); if (!prev || r.DATUV > prev.DATUV) unique.set(k, r); });
    return [...unique.values()].filter(r => r.IDNRK).sort((a, b) => a.POSNR.localeCompare(b.POSNR));
  };
  let frontier = [{ matnr, stlnr: head.STLNR, stlal: head.STLAL, level: 1 }];
  const seen = new Set([matnr]);
  while (frontier.length && lines.length < 400) {
    const next: typeof frontier = [];
    for (const f of frontier) {
      const items = await itemsOf(f.stlnr, f.stlal);
      items.forEach(i => lines.push({ level: f.level, parent: f.matnr, item: i.POSNR, component: i.IDNRK, qty: num(i.MENGE), unit: i.MEINS, category: i.POSTP }));
      if (f.level >= maxLevels) continue;
      const subs = items.map(i => i.IDNRK).filter(c => !seen.has(c));
      subs.forEach(c => seen.add(c));
      const subHeads = await selIn(subs, l => `SELECT MATNR, WERKS, STLAN, STLNR, STLAL FROM MAST WHERE MATNR IN ( ${l} ) AND WERKS = ${lit(head.WERKS)}`);
      subs.forEach(c => { const h = subHeads.filter(x => x.MATNR === c).sort((a, b) => a.STLAL.localeCompare(b.STLAL))[0]; if (h) next.push({ matnr: c, stlnr: h.STLNR, stlal: h.STLAL, level: f.level + 1 }); });
    }
    frontier = next;
  }
  // Order as an indented tree: each parent's children directly below it.
  const ordered: BomLine[] = [];
  const walk = (parent: string, level: number) => lines.filter(l => l.parent === parent && l.level === level).forEach(l => { ordered.push(l); walk(l.component, level + 1); });
  walk(matnr, 1);
  return { plant: head.WERKS, alt: head.STLAL, usage: head.STLAN, lines: ordered };
}

export async function buildBomComponents(query: string): Promise<ScenarioResult> {
  const token = extractMaterialToken(query)!;
  try {
    const mat = await resolveMaterial(token);
    if (!mat) return notFoundMaterial(token, AGENT_SCM, 'its bill of materials', await exampleMaterialsWithBom(), SAMPLE_COLS, 'Real materials that have a BOM');
    const bom = await explodeBom(mat.matnr, extractPlant(query));
    if (!bom) return { text: `Material ${mat.matnr} (${mat.text}) exists but has no bill of materials in any plant (MAST), so it is not manufactured from components in this system.`, toolResults: [] };
    const comps = [...new Set(bom.lines.map(l => l.component))];
    const [texts, marc, stock] = await Promise.all([
      materialTexts(comps),
      bom.plant ? selIn(comps, l => `SELECT MATNR, BESKZ FROM MARC WHERE WERKS = ${lit(bom.plant)} AND MATNR IN ( ${l} )`) : Promise.resolve([] as Row[]),
      bom.plant ? selIn(comps, l => `SELECT MATNR, SUM( LABST ) AS QTY FROM MARD WHERE WERKS = ${lit(bom.plant)} AND MATNR IN ( ${l} ) GROUP BY MATNR`) : Promise.resolve([] as Row[])
    ]);
    const rows = bom.lines.map(l => ({
      level: `${'\u00b7 '.repeat(l.level - 1)}${l.level}`, item: l.item, component: l.component, description: texts.get(l.component) || '\u2014', qty: fmt(l.qty, 3), unit: l.unit,
      category: l.category === 'L' ? 'Stock item' : l.category === 'N' ? 'Non-stock' : l.category || '\u2014',
      procurement: BESKZ_TEXT[marc.find(m => m.MATNR === l.component)?.BESKZ || ''] || '\u2014', stock: stock.find(s => s.MATNR === l.component) ? fmt(num(stock.find(s => s.MATNR === l.component)!.QTY), 3) : '0.000'
    }));
    const top = bom.lines.filter(l => l.level === 1);
    return {
      text: `${mat.matnr} (${mat.text}) is built from ${top.length} direct component(s)${bom.lines.length > top.length ? ` and ${bom.lines.length - top.length} lower-level component line(s) across ${Math.max(...bom.lines.map(l => l.level))} levels` : ''} (BOM usage ${bom.usage}, alternative ${bom.alt}${bom.plant ? `, plant ${bom.plant}` : ''}): ${top.slice(0, 8).map(l => `${l.component} ${fmt(l.qty, 3).replace(/\.?0+$/, '')} ${l.unit}`).join(', ')}${top.length > 8 ? ', ...' : ''}.`,
      toolResults: [section(AGENT_SCM, `Components to Manufacture ${mat.matnr} ${mat.text}`, [
        { key: 'level', label: 'Level' }, { key: 'item', label: 'Item' }, { key: 'component', label: 'Component' }, { key: 'description', label: 'Description' }, { key: 'qty', label: 'Qty per Parent' },
        { key: 'unit', label: 'Unit' }, { key: 'category', label: 'Item Category' }, { key: 'procurement', label: 'Make / Buy' }, { key: 'stock', label: `Unrestricted Stock${bom.plant ? ` (${bom.plant})` : ''}` }
      ], rows, [{ label: 'Direct components', value: String(top.length) }, { label: 'Total lines (multi-level)', value: String(bom.lines.length) }, { label: 'Plant', value: bom.plant || 'all plants' }],
      'Multi-level BOM explosion from the live BOM tables (MAST, STAS, STPO), current valid item versions only; sub-assemblies are exploded with their own BOM in the same plant.')]
    };
  } catch (e: any) { return unavailable(AGENT_SCM, 'Bill of Materials', e?.message || String(e)); }
}

async function whereUsedLevels(matnr: string, levels = 3): Promise<{ level: number; component: string; parent: string; plant: string; qty: number; unit: string }[]> {
  const out: { level: number; component: string; parent: string; plant: string; qty: number; unit: string }[] = [];
  let frontier = [matnr];
  const seen = new Set([matnr]);
  for (let level = 1; level <= levels && frontier.length; level++) {
    const rows = await selIn(frontier, l => `SELECT P~IDNRK, M~MATNR, M~WERKS, P~MENGE, P~MEINS FROM STPO AS P INNER JOIN MAST AS M ON M~STLNR = P~STLNR WHERE P~STLTY = 'M' AND P~IDNRK IN ( ${l} )`);
    const next: string[] = [];
    const key = new Set<string>();
    rows.forEach(r => {
      const k = `${r.IDNRK}|${r.MATNR}|${r.WERKS}`; if (key.has(k)) return; key.add(k);
      out.push({ level, component: r.IDNRK, parent: r.MATNR, plant: r.WERKS, qty: num(r.MENGE), unit: r.MEINS });
      if (!seen.has(r.MATNR)) { seen.add(r.MATNR); next.push(r.MATNR); }
    });
    frontier = next;
  }
  return out;
}

export async function buildWhereUsed(query: string): Promise<ScenarioResult> {
  const token = extractIdAfter(query, ['component', 'material', 'part', 'for', 'of'])!;
  try {
    const mat = await resolveMaterial(token);
    if (!mat) return notFoundMaterial(token, AGENT_SCM, 'where it is used', await exampleSharedComponents(), SAMPLE_COLS, 'Real components used in several BOMs');
    const used = await whereUsedLevels(mat.matnr);
    if (!used.length) return { text: `Component ${mat.matnr} (${mat.text}) is not used in any bill of materials in the connected system (where-used on STPO returned nothing).`, toolResults: [] };
    const texts = await materialTexts([...new Set(used.map(u => u.parent))]);
    const direct = [...new Set(used.filter(u => u.level === 1).map(u => u.parent))];
    const rows = used.map(u => ({ level: String(u.level), parent: u.parent, description: texts.get(u.parent) || '\u2014', plant: u.plant || 'all', via: u.component, qty: `${fmt(u.qty, 3)} ${u.unit}` }));
    return {
      text: `Component ${mat.matnr} (${mat.text}) is used directly in ${direct.length} material(s): ${direct.slice(0, 10).join(', ')}${direct.length > 10 ? ', ...' : ''}.${used.some(u => u.level > 1) ? ` Through those assemblies it also goes into ${new Set(used.filter(u => u.level > 1).map(u => u.parent)).size} higher-level material(s).` : ''}`,
      toolResults: [section(AGENT_SCM, `Where-Used \u2014 ${mat.matnr} ${mat.text}`, [
        { key: 'level', label: 'Level' }, { key: 'parent', label: 'Material Using It' }, { key: 'description', label: 'Description' }, { key: 'plant', label: 'Plant' }, { key: 'via', label: 'Via Component' }, { key: 'qty', label: 'Qty per Parent' }
      ], rows, [{ label: 'Direct parents', value: String(direct.length) }, { label: 'All levels', value: String(new Set(used.map(u => u.parent)).size) }], 'Where-used list from the live BOM item table (STPO) joined to the BOM header (MAST), up to 3 levels.')]
    };
  } catch (e: any) { return unavailable(AGENT_SCM, 'Bill of Materials', e?.message || String(e)); }
}

export async function buildSuppliersOf(query: string): Promise<ScenarioResult> {
  const token = extractMaterialToken(query)!;
  try {
    const mat = await resolveMaterial(token);
    if (!mat) return notFoundMaterial(token, AGENT_SCM, 'its suppliers', await exampleSuppliedMaterials(), SAMPLE_COLS, 'Real materials with suppliers');
    const [eord, info, poh] = await Promise.all([
      sel(`SELECT WERKS, LIFNR, VDATU, BDATU, FLIFN, NOTKZ FROM EORD WHERE MATNR = ${lit(mat.matnr)}`, 200),
      sel(`SELECT A~LIFNR, A~INFNR, B~EKORG, B~WERKS, B~NETPR, B~PEINH, B~WAERS, B~APLFZ, B~MINBM FROM EINA AS A LEFT OUTER JOIN EINE AS B ON B~INFNR = A~INFNR WHERE A~MATNR = ${lit(mat.matnr)} AND A~LOEKZ = ' '`, 200),
      sel(`SELECT K~LIFNR, COUNT( * ) AS N, MAX( K~BEDAT ) AS LAST, SUM( P~MENGE ) AS QTY FROM EKKO AS K INNER JOIN EKPO AS P ON P~EBELN = K~EBELN WHERE P~MATNR = ${lit(mat.matnr)} AND P~LOEKZ = ' ' GROUP BY K~LIFNR`, 200)
    ]);
    const lifnrs = [...new Set([...eord.map(e => e.LIFNR), ...info.map(i => i.LIFNR), ...poh.map(p => p.LIFNR)].filter(Boolean))];
    if (!lifnrs.length) return { text: `No supplier is recorded for ${mat.matnr} (${mat.text}): no source list entry, no purchasing info record and no purchase order exists for it.`, toolResults: [] };
    const names = await vendorNames(lifnrs);
    const todayS = ymd(today());
    const rows = lifnrs.map(l => {
      const e = eord.filter(x => x.LIFNR === l);
      const i = info.filter(x => x.LIFNR === l);
      const p = poh.find(x => x.LIFNR === l);
      const validSrc = e.filter(x => x.VDATU <= todayS && x.BDATU >= todayS);
      return {
        supplier: stripZeros(l), name: names.get(l) || '\u2014',
        sourceList: e.length ? `${validSrc.length ? 'Valid' : 'Expired'}${e.some(x => x.FLIFN === 'X') ? ', fixed source' : ''}${e.some(x => x.NOTKZ === 'X') ? ', blocked' : ''} (${[...new Set(e.map(x => x.WERKS))].join(', ')})` : '\u2014',
        infoRecord: i.length ? i.map(x => x.INFNR).filter((v, k, a) => a.indexOf(v) === k).join(', ') : '\u2014',
        price: i.find(x => num(x.NETPR) > 0) ? i.filter(x => num(x.NETPR) > 0).map(x => `${fmt(num(x.NETPR))} ${x.WAERS}/${num(x.PEINH) || 1}`).slice(0, 2).join('; ') : '\u2014',
        leadTime: i.find(x => num(x.APLFZ) > 0) ? `${num(i.find(x => num(x.APLFZ) > 0)!.APLFZ)} days` : '\u2014',
        poItems: String(num(p?.N)), lastPo: p ? iso(p.LAST) : '\u2014', _rank: (validSrc.length ? 100 : 0) + (e.some(x => x.FLIFN === 'X') ? 50 : 0) + num(p?.N)
      };
    }).sort((a, b) => b._rank - a._rank);
    return {
      text: `${mat.matnr} (${mat.text}) is supplied by ${rows.length} supplier(s): ${rows.slice(0, 5).map(r => `${r.name} (${r.supplier})${r.sourceList.startsWith('Valid') ? ', valid source list' : ''}${r.sourceList.includes('fixed') ? ', fixed source' : ''}${num(r.poItems) ? `, ${r.poItems} PO item(s), last ${r.lastPo}` : ''}`).join('; ')}.`,
      toolResults: [section(AGENT_SCM, `Suppliers of ${mat.matnr} ${mat.text}`, [
        { key: 'supplier', label: 'Supplier' }, { key: 'name', label: 'Name' }, { key: 'sourceList', label: 'Source List' }, { key: 'infoRecord', label: 'Info Record' }, { key: 'price', label: 'Net Price / Unit' },
        { key: 'leadTime', label: 'Planned Lead Time' }, { key: 'poItems', label: 'PO Items' }, { key: 'lastPo', label: 'Last PO Date' }
      ], rows.map(({ _rank, ...r }) => r), [{ label: 'Suppliers', value: String(rows.length) }], 'Sources: source list (EORD), purchasing info records (EINA/EINE) and purchase order history (EKKO/EKPO), all read live.')]
    };
  } catch (e: any) { return unavailable(AGENT_SCM, 'Sources of Supply', e?.message || String(e)); }
}

const weekKey = (d: Date) => { const x = new Date(d); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return ymd(x); };

export async function buildMaterialForecast(query: string): Promise<ScenarioResult> {
  const token = extractIdAfter(query, ['component', 'material', 'part'])!;
  try {
    const mat = await resolveMaterial(token);
    if (!mat) return notFoundMaterial(token, AGENT_SCM, 'its demand forecast', await exampleDemandMaterials(), SAMPLE_COLS, 'Real materials with open future demand');
    const t = today();
    const from12 = ymd(addDays(t, -365));
    const [pir, resb, hist] = await Promise.all([
      sel(`SELECT A~WERKS, A~VERSB, B~PDATU, B~PLNMG, B~MEINS FROM PBIM AS A INNER JOIN PBED AS B ON B~BDZEI = A~BDZEI WHERE A~MATNR = ${lit(mat.matnr)} AND B~PDATU >= ${lit(ymd(t))} AND A~VERVS = 'X'`, 500).catch(() => sel(`SELECT A~WERKS, A~VERSB, B~PDATU, B~PLNMG, B~MEINS FROM PBIM AS A INNER JOIN PBED AS B ON B~BDZEI = A~BDZEI WHERE A~MATNR = ${lit(mat.matnr)} AND B~PDATU >= ${lit(ymd(t))}`, 500)),
      sel(`SELECT WERKS, BDTER, BDMNG, ENMNG, MEINS, AUFNR FROM RESB WHERE MATNR = ${lit(mat.matnr)} AND XLOEK = ' ' AND KZEAR = ' ' AND BDTER >= ${lit(ymd(t))}`, 5000),
      sel(`SELECT SUBSTRING( BUDAT, 1, 6 ) AS PERIOD, SUM( STOCK_QTY ) AS QTY FROM MATDOC WHERE MATNR = ${lit(mat.matnr)} AND RECORD_TYPE = 'MDOC' AND CANCELLED = ' ' AND SHKZG = 'H' AND BUDAT >= ${lit(from12)} AND BWART IN ( '201', '221', '231', '241', '251', '261', '281', '291', '601', '633', '643' ) GROUP BY SUBSTRING( BUDAT, 1, 6 )`, 100).catch(() => [] as Row[])
    ]);
    const weeks = new Map<string, { pir: number; dep: number }>();
    pir.forEach(p => { const k = weekKey(toDate(p.PDATU)); const e = weeks.get(k) || { pir: 0, dep: 0 }; e.pir += num(p.PLNMG); weeks.set(k, e); });
    resb.forEach(r => { const k = weekKey(toDate(r.BDTER)); const e = weeks.get(k) || { pir: 0, dep: 0 }; e.dep += Math.max(0, num(r.BDMNG) - num(r.ENMNG)); weeks.set(k, e); });
    const months = hist.map(h => ({ p: h.PERIOD, q: Math.abs(num(h.QTY)) })).sort((a, b) => a.p.localeCompare(b.p));
    const last6 = months.slice(-6);
    const avgMonthly = last6.length ? last6.reduce((s, m) => s + m.q, 0) / 6 : 0;
    const rows = [...weeks.entries()].sort((a, b) => a[0].localeCompare(b[0])).slice(0, 26).map(([w, e]) => ({ week: `Week of ${iso(w)}`, pir: fmt(e.pir, 3), dependent: fmt(e.dep, 3), total: fmt(e.pir + e.dep, 3) }));
    const totalPir = pir.reduce((s, p) => s + num(p.PLNMG), 0);
    const totalDep = resb.reduce((s, r) => s + Math.max(0, num(r.BDMNG) - num(r.ENMNG)), 0);
    const next4 = [...weeks.entries()].filter(([w]) => toDate(w) < addDays(t, 28)).reduce((s, [, e]) => s + e.pir + e.dep, 0);
    const unit = pir[0]?.MEINS || resb[0]?.MEINS || mat.meins;
    const toolResults = [section(AGENT_SCM, `Demand Forecast \u2014 ${mat.matnr} ${mat.text}`, [
      { key: 'week', label: 'Week' }, { key: 'pir', label: `Planned Independent Req. (${unit})` }, { key: 'dependent', label: `Dependent Req. (${unit})` }, { key: 'total', label: `Total Demand (${unit})` }
    ], rows, [{ label: 'PIR quantity (future)', value: `${fmt(totalPir, 3)} ${unit}` }, { label: 'Open dependent req.', value: `${fmt(totalDep, 3)} ${unit}` }, { label: 'Next 4 weeks', value: `${fmt(next4, 3)} ${unit}` }, { label: 'Avg monthly consumption (last 6 months)', value: `${fmt(avgMonthly, 3)} ${unit}` }],
    'Forecast demand = planned independent requirements (PBIM/PBED) plus open dependent requirements from production/reservations (RESB), bucketed by week. Consumption history = goods issues in the material documents (MATDOC) of the last 12 months.')];
    if (months.length) toolResults.push(section(AGENT_SCM, `Consumption History \u2014 ${mat.matnr}`, [{ key: 'period', label: 'Month' }, { key: 'qty', label: `Goods Issued (${unit})` }], months.map(m => ({ period: `${m.p.slice(0, 4)}-${m.p.slice(4)}`, qty: fmt(m.q, 3) }))));
    return {
      text: `Forecast for ${mat.matnr} (${mat.text}): ${totalPir ? `${fmt(totalPir, 3)} ${unit} of planned independent requirements` : 'no planned independent requirements (demand plan) exist'} and ${fmt(totalDep, 3)} ${unit} of open dependent requirements from future production/reservations${resb.length ? ` (${resb.length} requirement(s), ${iso(resb.map(r => r.BDTER).sort()[0])} to ${iso(resb.map(r => r.BDTER).sort().pop()!)})` : ''}. Next 4 weeks: ${fmt(next4, 3)} ${unit}. ${months.length ? `Average consumption over the last 6 months: ${fmt(avgMonthly, 3)} ${unit} per month.` : 'No goods issues were posted in the last 12 months.'}`,
      toolResults
    };
  } catch (e: any) { return unavailable(AGENT_SCM, 'Demand Planning', e?.message || String(e)); }
}

export async function buildStockoutSalesImpact(query: string): Promise<ScenarioResult> {
  const token = extractMaterialToken(query)!;
  try {
    const mat = await resolveMaterial(token);
    if (!mat) return notFoundMaterial(token, AGENT_SCM, 'the sales impact of a stock-out', await exampleSharedComponents(), SAMPLE_COLS, 'Real components used in several products');
    const t = today();
    // "This week" = the next 7 days, so a question asked late in the week still covers a full week.
    const weekEnd = addDays(t, 6);
    const horizon = addDays(t, 21);
    const used = await whereUsedLevels(mat.matnr);
    const parents = [...new Set(used.map(u => u.parent))];
    const [stock, resb, soItems] = await Promise.all([
      sel(`SELECT WERKS, SUM( LABST ) AS QTY FROM MARD WHERE MATNR = ${lit(mat.matnr)} GROUP BY WERKS`, 100),
      sel(`SELECT WERKS, BDTER, BDMNG, ENMNG, AUFNR FROM RESB WHERE MATNR = ${lit(mat.matnr)} AND XLOEK = ' ' AND KZEAR = ' ' AND BDTER >= ${lit(ymd(t))} AND BDTER <= ${lit(ymd(horizon))}`, 2000),
      selIn([mat.matnr, ...parents], l => `SELECT A~VBELN, A~KUNNR, A~AUART, A~VDATU, B~POSNR, B~MATNR, B~KWMENG, B~VRKME, B~NETWR, B~WAERK, B~WERKS FROM VBAK AS A INNER JOIN VBAP AS B ON B~VBELN = A~VBELN WHERE B~MATNR IN ( ${l} ) AND B~ABGRU = ' ' AND B~GBSTA <> 'C'`)
    ]);
    const lines = await selIn([...new Set(soItems.map(s => s.VBELN))], l => `SELECT VBELN, POSNR, MIN( EDATU ) AS EDATU FROM VBEP WHERE VBELN IN ( ${l} ) GROUP BY VBELN, POSNR`);
    const [names, texts] = await Promise.all([customerNames([...new Set(soItems.map(s => s.KUNNR))]), materialTexts([...new Set(soItems.map(s => s.MATNR))])]);
    const thisWeek = resb.filter(r => toDate(r.BDTER) <= weekEnd).reduce((s, r) => s + Math.max(0, num(r.BDMNG) - num(r.ENMNG)), 0);
    const onHand = stock.reduce((s, x) => s + num(x.QTY), 0);
    const rows = soItems.map(s => {
      const ed = lines.find(l => l.VBELN === s.VBELN && l.POSNR === s.POSNR)?.EDATU || s.VDATU;
      const d = ed && ed !== '00000000' ? toDate(ed) : null;
      const risk = d && d <= addDays(t, 14) ? 'High \u2014 due within 2 weeks' : d && d <= horizon ? 'Medium \u2014 due within 3 weeks' : 'Low \u2014 later or overdue';
      return {
        order: stripZeros(s.VBELN), item: stripZeros(s.POSNR), customer: `${names.get(s.KUNNR) || ''} (${stripZeros(s.KUNNR)})`, material: s.MATNR, description: texts.get(s.MATNR) || '\u2014',
        via: s.MATNR === mat.matnr ? 'Sold directly' : `Contains ${mat.matnr}`, qty: `${fmt(num(s.KWMENG), 3)} ${s.VRKME}`, value: `${fmt(num(s.NETWR))} ${s.WAERK}`, requested: iso(ed || ''),
        risk, _v: num(s.NETWR), _c: s.WAERK, _r: risk.startsWith('High') ? 0 : risk.startsWith('Medium') ? 1 : 2
      };
    }).sort((a, b) => a._r - b._r || b._v - a._v);
    const atRisk = new Map<string, number>();
    rows.filter(r => r._r < 2).forEach(r => atRisk.set(r._c, (atRisk.get(r._c) || 0) + r._v));
    return {
      text: `If ${mat.matnr} (${mat.text}) runs out this week: on-hand stock is ${fmt(onHand, 3)} ${mat.meins} and open requirements due by ${iso(ymd(weekEnd))} are ${fmt(thisWeek, 3)} ${mat.meins}. It goes into ${parents.length} product(s); ${rows.length} open sales order item(s) for ${mat.matnr} or those products could be impacted, ${rows.filter(r => r._r === 0).length} of them due within 2 weeks. Revenue at risk in the next 3 weeks: ${[...atRisk.entries()].map(([c, v]) => `${fmt(v)} ${c}`).join('; ') || 'none'}.`,
      toolResults: [section(AGENT_SCM, `Sales Orders Impacted by a Stock-out of ${mat.matnr}`, [
        { key: 'order', label: 'Sales Order' }, { key: 'item', label: 'Item' }, { key: 'customer', label: 'Customer' }, { key: 'material', label: 'Material' }, { key: 'description', label: 'Description' },
        { key: 'via', label: 'Link to Component' }, { key: 'qty', label: 'Order Qty' }, { key: 'value', label: 'Net Value' }, { key: 'requested', label: 'Requested Delivery' }, { key: 'risk', label: 'Impact Risk' }
      ], rows.map(({ _v, _c, _r, ...r }) => r), [
        { label: 'On-hand stock', value: `${fmt(onHand, 3)} ${mat.meins}` }, { label: 'Requirements this week', value: `${fmt(thisWeek, 3)} ${mat.meins}` }, { label: 'Products using it', value: String(parents.length) }, { label: 'Open SO items', value: String(rows.length) }
      ], 'Products containing the component come from a 3-level where-used on the live BOMs; open sales order items (VBAK/VBAP, not rejected, not completed) for those products are ranked by requested delivery date (VBEP).')]
    };
  } catch (e: any) { return unavailable(AGENT_SCM, 'Sales Impact', e?.message || String(e)); }
}

const toHours = (v: number, unit: string) => unit === 'MIN' ? v / 60 : unit === 'S' || unit === 'SEC' ? v / 3600 : v;

export async function buildSchedulingBottlenecks(query: string): Promise<ScenarioResult> {
  try {
    const t = today();
    const nextMon = addDays(t, ((8 - t.getDay()) % 7) || 7);
    const nextSun = addDays(nextMon, 6);
    const [ppds, kbed, kako, orders, late] = await Promise.all([
      sel(`SELECT COUNT( * ) AS N FROM /SAPAPO/ORDKEY`, 1).catch(() => [] as Row[]),
      sel(`SELECT KAPID, FSTAD, KEINH, SUM( KBEASOLL ) AS LOAD FROM KBED WHERE FSTAD >= ${lit(ymd(nextMon))} AND FSTAD <= ${lit(ymd(nextSun))} GROUP BY KAPID, FSTAD, KEINH`, 5000),
      sel(`SELECT KAPID, WERKS, NAME, BEGZT, ENDZT, PAUSE, NGRAD, AZNOR FROM KAKO`, 5000),
      sel(`SELECT K~AUFNR, K~GSTRP, K~GLTRP, P~MATNR, P~PSMNG, P~MEINS, P~KDAUF, P~KDPOS, P~PWERK FROM AFKO AS K INNER JOIN AFPO AS P ON P~AUFNR = K~AUFNR WHERE K~GSTRP <= ${lit(ymd(nextSun))} AND K~GLTRP >= ${lit(ymd(nextMon))}`, 5000),
      sel(`SELECT K~AUFNR, K~GSTRP, K~GLTRP, P~MATNR, P~PSMNG, P~WEMNG, P~KDAUF, A~PHAS1, A~PHAS2 FROM AFKO AS K INNER JOIN AFPO AS P ON P~AUFNR = K~AUFNR INNER JOIN AUFK AS A ON A~AUFNR = K~AUFNR WHERE K~GLTRP < ${lit(ymd(t))} AND A~PHAS2 = ' ' AND A~PHAS3 = ' ' AND P~WEMNG < P~PSMNG`, 2000).catch(() => [] as Row[])
    ]);
    const cap = new Map(kako.map(k => [k.KAPID, k]));
    const availPerDay = (k?: Row) => k ? Math.max(0, (num(k.ENDZT) - num(k.BEGZT) - num(k.PAUSE)) / 3600) * (num(k.NGRAD) || 100) / 100 * (num(k.AZNOR) || 1) : 0;
    const loadRows = kbed.map(r => {
      const k = cap.get(r.KAPID); const load = toHours(num(r.LOAD), r.KEINH || 'H'); const avail = availPerDay(k);
      return { capacity: k?.NAME || r.KAPID, plant: k?.WERKS || '\u2014', date: iso(r.FSTAD), load: fmt(load, 1), available: fmt(avail, 1), utilization: avail ? `${(load / avail * 100).toFixed(0)}%` : 'no capacity', status: avail && load > avail ? 'Bottleneck' : avail ? 'OK' : 'No available capacity defined', _u: avail ? load / avail : 99 };
    }).sort((a, b) => b._u - a._u);
    const bottlenecks = loadRows.filter(r => r.status !== 'OK');
    const soKeys = orders.filter(o => o.KDAUF).map(o => o.KDAUF);
    const sched = await selIn([...new Set(soKeys)], l => `SELECT VBELN, POSNR, MIN( EDATU ) AS EDATU FROM VBEP WHERE VBELN IN ( ${l} ) GROUP BY VBELN, POSNR`);
    const mustArrive = orders.filter(o => o.KDAUF).map(o => {
      const due = sched.find(s => s.VBELN === o.KDAUF && s.POSNR === o.KDPOS)?.EDATU;
      return { order: stripZeros(o.AUFNR), material: o.MATNR, salesOrder: `${stripZeros(o.KDAUF)}/${stripZeros(o.KDPOS)}`, finish: iso(o.GLTRP), mustArriveBy: iso(due || ''), status: due && o.GLTRP > due ? `Late by ${daysBetween(toDate(due), toDate(o.GLTRP))} day(s)` : due ? 'On time' : 'No requested date', _late: !!(due && o.GLTRP > due) };
    }).sort((a, b) => Number(b._late) - Number(a._late));
    const lateMust = mustArrive.filter(m => m._late);
    const lastLoad = kbed.length ? '' : (await sel(`SELECT MAX( FSTAD ) AS D FROM KBED`, 1).catch(() => [] as Row[]))[0]?.D;
    const toolResults: any[] = [
      section(AGENT_SCM, `Capacity Load Next Week (${iso(ymd(nextMon))} to ${iso(ymd(nextSun))})`, [
        { key: 'capacity', label: 'Capacity / Work Center' }, { key: 'plant', label: 'Plant' }, { key: 'date', label: 'Date' }, { key: 'load', label: 'Required (h)' }, { key: 'available', label: 'Available (h/day)' }, { key: 'utilization', label: 'Utilization' }, { key: 'status', label: 'Status' }
      ], loadRows.map(({ _u, ...r }) => r), [{ label: 'Capacity requirements next week', value: String(kbed.length) }, { label: 'Bottleneck days', value: String(bottlenecks.length) }, { label: 'PP/DS orders (order keys)', value: ppds[0] ? int(num(ppds[0].N)) : '\u2014' }],
      'Required capacity from the live capacity requirements (KBED) per capacity and day, against available capacity per workday from the capacity header (KAKO: shift length minus breaks x utilization x number of individual capacities).'),
      section(AGENT_SCM, 'Orders Against Must-Arrive-By Dates', [{ key: 'order', label: 'Production Order' }, { key: 'material', label: 'Material' }, { key: 'salesOrder', label: 'Sales Order / Item' }, { key: 'finish', label: 'Scheduled Finish' }, { key: 'mustArriveBy', label: 'Must-Arrive-By (Requested)' }, { key: 'status', label: 'Status' }], mustArrive.map(({ _late, ...r }) => r)),
      section(AGENT_SCM, 'Scheduling Anomalies \u2014 Orders Past Their Finish Date, Not Delivered', [{ key: 'order', label: 'Production Order' }, { key: 'material', label: 'Material' }, { key: 'start', label: 'Scheduled Start' }, { key: 'finish', label: 'Scheduled Finish' }, { key: 'delivered', label: 'Delivered / Planned' }, { key: 'released', label: 'Released' }],
        late.slice(0, 200).map(o => ({ order: stripZeros(o.AUFNR), material: o.MATNR, start: iso(o.GSTRP), finish: iso(o.GLTRP), delivered: `${fmt(num(o.WEMNG), 3)} / ${fmt(num(o.PSMNG), 3)}`, released: o.PHAS1 === 'X' ? 'Yes' : 'No' })))
    ];
    const text = `Next week (${iso(ymd(nextMon))} to ${iso(ymd(nextSun))}): ${kbed.length ? `${kbed.length} capacity requirement bucket(s) are scheduled; ${bottlenecks.length ? `${bottlenecks.length} are over available capacity \u2014 bottlenecks at ${[...new Set(bottlenecks.map(b => b.capacity))].slice(0, 5).join(', ')}` : 'no work center is loaded above its available capacity'}.` : `no capacity requirements are scheduled on any work center${lastLoad ? ` (the latest scheduled capacity requirement is on ${iso(lastLoad)})` : ''}, so no machine bottleneck exists for that week.`} ${orders.length} production order(s) run during the week; ${lateMust.length ? `${lateMust.length} finish after their sales order's must-arrive-by date: ${lateMust.slice(0, 5).map(m => `${m.order} (SO ${m.salesOrder}, ${m.status.toLowerCase()})`).join(', ')}` : 'none is scheduled to finish after its sales order\'s requested delivery date'}. Anomalies: ${late.length} production order(s) are past their scheduled finish date and not fully delivered${late.length ? ` (${late.filter(o => o.PHAS1 !== 'X').length} of them never released)` : ''}.${ppds[0] ? ` PP/DS is active (${int(num(ppds[0].N))} order keys); its detailed schedule lives in liveCache, so this check uses the capacity requirements and order dates stored in the database.` : ''}`;
    return { text, toolResults };
  } catch (e: any) { return unavailable(AGENT_SCM, 'Capacity Planning', e?.message || String(e)); }
}

export async function buildSupplyDelayImpact(query: string, llm: LlmFn): Promise<ScenarioResult> {
  const token = extractIdAfter(query, ['material', 'component', 'part']) || extractMaterialToken(query)!;
  const delay = Number(/(\d{1,3})\s*days?/i.exec(query)?.[1] || 0);
  try {
    const mat = await resolveMaterial(token);
    if (!mat) return notFoundMaterial(token, AGENT_SCM, 'the impact of the supplier delay', await exampleDemandMaterials(), SAMPLE_COLS, 'Real raw materials with open requirements you can analyse instead');
    const t = today();
    const window = addDays(t, 14);
    const [stockAll, resb, poLines, info] = await Promise.all([
      sel(`SELECT WERKS, LGORT, LABST FROM MARD WHERE MATNR = ${lit(mat.matnr)} AND LABST > 0`, 500),
      sel(`SELECT WERKS, BDTER, BDMNG, ENMNG, AUFNR, PLNUM, RSNUM, RSPOS FROM RESB WHERE MATNR = ${lit(mat.matnr)} AND XLOEK = ' ' AND KZEAR = ' ' AND BDTER >= ${lit(ymd(t))} AND BDTER <= ${lit(ymd(addDays(window, delay)))}`, 2000),
      sel(`SELECT P~EBELN, P~EBELP, P~WERKS, K~LIFNR, E~EINDT, E~MENGE, E~WEMNG, P~NETPR, P~PEINH FROM EKPO AS P INNER JOIN EKKO AS K ON K~EBELN = P~EBELN INNER JOIN EKET AS E ON E~EBELN = P~EBELN AND E~EBELP = P~EBELP WHERE P~MATNR = ${lit(mat.matnr)} AND P~LOEKZ = ' ' AND P~ELIKZ = ' ' AND E~MENGE > E~WEMNG`, 500),
      sel(`SELECT A~LIFNR, B~NETPR, B~PEINH, B~WAERS, B~APLFZ, B~WERKS FROM EINA AS A LEFT OUTER JOIN EINE AS B ON B~INFNR = A~INFNR WHERE A~MATNR = ${lit(mat.matnr)} AND A~LOEKZ = ' '`, 200)
    ]);
    const plant = extractPlant(query) || resb[0]?.WERKS || poLines[0]?.WERKS || stockAll[0]?.WERKS || '';
    const nextDelivery = poLines.filter(p => !plant || p.WERKS === plant).sort((a, b) => a.EINDT.localeCompare(b.EINDT))[0];
    // An overdue open delivery is expected now at the earliest, so the delay counts from today.
    const baseDate = nextDelivery && toDate(nextDelivery.EINDT) > t ? toDate(nextDelivery.EINDT) : t;
    const newDate = addDays(baseDate, delay);
    const plantStock = stockAll.filter(s => s.WERKS === plant).reduce((s, x) => s + num(x.LABST), 0);
    const demandRows = resb.filter(r => r.WERKS === plant && toDate(r.BDTER) <= newDate);
    const demand = demandRows.reduce((s, r) => s + Math.max(0, num(r.BDMNG) - num(r.ENMNG)), 0);
    const otherReceipts = poLines.filter(p => p.WERKS === plant && p !== nextDelivery && toDate(p.EINDT) <= newDate).reduce((s, p) => s + num(p.MENGE) - num(p.WEMNG), 0);
    const deficit = Math.max(0, demand - plantStock - otherReceipts);
    // 1. Impacted production orders (released and planned) and customer orders
    const inWin = resb.filter(r => toDate(r.BDTER) <= window);
    const aufnrs = [...new Set(inWin.filter(r => r.AUFNR).map(r => r.AUFNR))];
    const plnums = [...new Set(inWin.filter(r => !r.AUFNR && r.PLNUM).map(r => r.PLNUM))];
    const [prodOrders, plannedOrders] = await Promise.all([
      selIn(aufnrs, l => `SELECT K~AUFNR, K~GSTRP, K~GLTRP, P~MATNR, P~PSMNG, P~MEINS, P~KDAUF, P~KDPOS FROM AFKO AS K INNER JOIN AFPO AS P ON P~AUFNR = K~AUFNR WHERE K~AUFNR IN ( ${l} )`),
      selIn(plnums, l => `SELECT PLNUM, MATNR, GSMNG, MEINS, PSTTR, PEDTR, KDAUF, KDPOS FROM PLAF WHERE PLNUM IN ( ${l} )`).catch(() => [] as Row[])
    ]);
    const orders = [
      ...prodOrders.map(o => ({ kind: 'Production order', id: o.AUFNR, MATNR: o.MATNR, qty: num(o.PSMNG), meins: o.MEINS, start: o.GSTRP, finish: o.GLTRP, KDAUF: o.KDAUF, KDPOS: o.KDPOS, need: (r: Row) => r.AUFNR === o.AUFNR })),
      ...plannedOrders.map(o => ({ kind: 'Planned order', id: o.PLNUM, MATNR: o.MATNR, qty: num(o.GSMNG), meins: o.MEINS, start: o.PSTTR, finish: o.PEDTR, KDAUF: o.KDAUF, KDPOS: o.KDPOS, need: (r: Row) => !r.AUFNR && r.PLNUM === o.PLNUM }))
    ];
    const parents = [...new Set(orders.map(o => o.MATNR))];
    const soItems = await selIn([...new Set([mat.matnr, ...parents])], l => `SELECT A~VBELN, A~KUNNR, B~POSNR, B~MATNR, B~KWMENG, B~VRKME, B~NETWR, B~WAERK, B~LPRIO FROM VBAK AS A INNER JOIN VBAP AS B ON B~VBELN = A~VBELN WHERE B~MATNR IN ( ${l} ) AND B~ABGRU = ' ' AND B~GBSTA <> 'C'`);
    const soDates = await selIn([...new Set(soItems.map(s => s.VBELN))], l => `SELECT VBELN, POSNR, MIN( EDATU ) AS EDATU FROM VBEP WHERE VBELN IN ( ${l} ) GROUP BY VBELN, POSNR`);
    const soInWindow = soItems.map(s => ({ ...s, EDATU: soDates.find(d => d.VBELN === s.VBELN && d.POSNR === s.POSNR)?.EDATU || '' }))
      .filter(s => s.EDATU && s.EDATU >= ymd(t) && s.EDATU <= ymd(window))
      .sort((a, b) => (a.LPRIO || '99').localeCompare(b.LPRIO || '99') || num(b.NETWR) - num(a.NETWR));
    // 2. Substitute stock and alternative materials
    const [marc, altItems, prices] = await Promise.all([
      sel(`SELECT WERKS, NFMAT FROM MARC WHERE MATNR = ${lit(mat.matnr)} AND NFMAT <> ' '`, 20).catch(() => [] as Row[]),
      sel(`SELECT P~STLNR, P~ALPGR FROM STPO AS P WHERE P~STLTY = 'M' AND P~IDNRK = ${lit(mat.matnr)} AND P~ALPGR <> ' '`, 100).catch(() => [] as Row[]),
      sel(`SELECT MATNR, BWKEY, VERPR, STPRS, VPRSV, PEINH FROM MBEW WHERE BWTAR = ' ' AND MATNR IN ( ${[mat.matnr, ...parents].map(lit).join(', ')} )`, 500).catch(() => [] as Row[])
    ]);
    let altMats: string[] = marc.map(m => m.NFMAT);
    if (altItems.length) {
      const sib = await selIn([...new Set(altItems.map(a => a.STLNR))], l => `SELECT STLNR, ALPGR, IDNRK FROM STPO WHERE STLTY = 'M' AND STLNR IN ( ${l} ) AND ALPGR <> ' '`);
      altMats.push(...sib.filter(s => altItems.some(a => a.STLNR === s.STLNR && a.ALPGR === s.ALPGR) && s.IDNRK !== mat.matnr).map(s => s.IDNRK));
    }
    altMats = [...new Set(altMats)];
    const altStock = await selIn(altMats, l => `SELECT MATNR, WERKS, SUM( LABST ) AS QTY FROM MARD WHERE MATNR IN ( ${l} ) AND LABST > 0 GROUP BY MATNR, WERKS`);
    const otherPlants = stockAll.filter(s => s.WERKS !== plant);
    // 3. Financial impact of the three options from live prices and order values
    const unitCost = (m: string) => { const r = prices.find(x => x.MATNR === m && num(x.STPRS) + num(x.VERPR) > 0); return r ? (r.VPRSV === 'S' ? num(r.STPRS) : num(r.VERPR)) / Math.max(1, num(r.PEINH)) : 0; };
    const currentVendor = nextDelivery?.LIFNR;
    const curPrice = nextDelivery ? num(nextDelivery.NETPR) / Math.max(1, num(nextDelivery.PEINH)) : 0;
    const backups = info.filter(i => i.LIFNR !== currentVendor && num(i.NETPR) > 0).map(i => ({ lifnr: i.LIFNR, price: num(i.NETPR) / Math.max(1, num(i.PEINH)), cur: i.WAERS, lead: num(i.APLFZ) })).sort((a, b) => a.price - b.price);
    const vnames = await vendorNames([...new Set([...backups.map(b => b.lifnr), currentVendor || ''].filter(Boolean))]);
    const cnames = await customerNames([...new Set(soInWindow.map(s => s.KUNNR))]);
    const revenueAtRisk = new Map<string, number>();
    soInWindow.forEach(s => revenueAtRisk.set(s.WAERK, (revenueAtRisk.get(s.WAERK) || 0) + num(s.NETWR)));
    const options = {
      expedite: backups.length ? backups.map(b => ({ supplier: `${vnames.get(b.lifnr) || ''} (${stripZeros(b.lifnr)})`, unitPrice: `${fmt(b.price)} ${b.cur}`, leadTimeDays: b.lead || null, feasibleBeforeShortage: b.lead ? addDays(t, b.lead) <= newDate : null, extraMaterialCost: curPrice ? `${fmt((b.price - curPrice) * deficit)} ${b.cur}` : 'current price unknown' })) : 'no alternative supplier info record exists',
      resequence: { ordersAffected: orders.length, outputValueDelayed: `${fmt(orders.reduce((s, o) => s + o.qty * unitCost(o.MATNR), 0))} (at standard/moving price)` },
      absorbPenalties: { customerOrderItemsAffected: soInWindow.length, revenueAtRisk: [...revenueAtRisk.entries()].map(([c, v]) => `${fmt(v)} ${c}`), penaltyTerms: 'no late-delivery penalty conditions are stored in SAP for these orders' }
    };
    const facts = {
      material: `${mat.matnr} ${mat.text}`, plant, delayDays: delay, delayedDelivery: nextDelivery ? { po: `${nextDelivery.EBELN}/${stripZeros(nextDelivery.EBELP)}`, supplier: vnames.get(currentVendor || '') || currentVendor, originalDate: iso(nextDelivery.EINDT), newDate: iso(ymd(newDate)), openQty: num(nextDelivery.MENGE) - num(nextDelivery.WEMNG) } : null,
      stockAtPlant: plantStock, demandUntilNewDate: demand, otherReceiptsBeforeNewDate: otherReceipts, deficit, unit: mat.meins,
      stockInOtherPlants: otherPlants.map(s => ({ plant: s.WERKS, storageLocation: s.LGORT, qty: num(s.LABST) })), alternativeMaterials: altStock.map(a => ({ material: a.MATNR, plant: a.WERKS, qty: num(a.QTY) })), options
    };
    let recommendation = '';
    try {
      recommendation = await llm(
        'You are an SAP supply chain planner. Using ONLY the JSON facts, (1) recommend the optimal option among expediting from a backup vendor, resequencing production, or absorbing late-delivery penalties, explaining the net profitability reasoning with the given numbers and naming any cost that is not available in SAP as an assumption the user must confirm. If the deficit is 0, say plainly that current stock covers the demand until the delayed delivery arrives, so no costly mitigation is needed and the best option is to absorb the delay and monitor; (2) draft 2-4 concise change requests for approval (title, what changes, quantity/date, document references, approver role). Label them "Draft change request" \u2014 nothing is executed. Never invent prices, dates, penalties or document numbers. Plain text, short sections.',
        JSON.stringify(facts)
      );
    } catch { recommendation = ''; }
    const prodRows = orders.map(o => ({ type: o.kind, order: stripZeros(o.id), material: o.MATNR, qty: `${fmt(o.qty, 3)} ${o.meins}`, start: iso(o.start), finish: iso(o.finish), salesOrder: o.KDAUF ? `${stripZeros(o.KDAUF)}/${stripZeros(o.KDPOS)}` : 'make-to-stock', componentNeed: `${fmt(resb.filter(o.need).reduce((s, r) => s + Math.max(0, num(r.BDMNG) - num(r.ENMNG)), 0), 3)} ${mat.meins}` }));
    const soRows = soInWindow.map(s => ({ order: stripZeros(s.VBELN), item: stripZeros(s.POSNR), customer: `${cnames.get(s.KUNNR) || ''} (${stripZeros(s.KUNNR)})`, material: s.MATNR, priority: s.LPRIO || '\u2014', requested: iso(s.EDATU), value: `${fmt(num(s.NETWR))} ${s.WAERK}` }));
    const subRows = [
      ...otherPlants.map(s => ({ type: 'Same material, other plant', material: mat.matnr, plant: s.WERKS, location: s.LGORT, qty: `${fmt(num(s.LABST), 3)} ${mat.meins}` })),
      ...altStock.map(a => ({ type: 'Alternative / follow-up material (compliance to be confirmed)', material: a.MATNR, plant: a.WERKS, location: '\u2014', qty: fmt(num(a.QTY), 3) }))
    ];
    const delivTxt = nextDelivery
      ? `the next open delivery (PO ${nextDelivery.EBELN}/${stripZeros(nextDelivery.EBELP)}, ${fmt(num(nextDelivery.MENGE) - num(nextDelivery.WEMNG), 3)} ${mat.meins}) ${toDate(nextDelivery.EINDT) > t ? `moves from ${iso(nextDelivery.EINDT)} to ${iso(ymd(newDate))}` : `was already due on ${iso(nextDelivery.EINDT)} and is now expected on ${iso(ymd(newDate))}`}`
      : `no open purchase order delivery exists, so the shortfall window runs to ${iso(ymd(newDate))}`;
    const text = `Supplier delay of ${delay} days on ${mat.matnr} (${mat.text})${plant ? ` in plant ${plant}` : ''}: ${delivTxt}. Stock ${fmt(plantStock, 3)} vs demand ${fmt(demand, 3)} ${mat.meins} until then \u2014 deficit ${fmt(deficit, 3)} ${mat.meins}. Impacted in the next two weeks: ${prodOrders.length} production order(s), ${plannedOrders.length} planned order(s) and ${soInWindow.length} customer order item(s) (revenue ${[...revenueAtRisk.entries()].map(([c, v]) => `${fmt(v)} ${c}`).join('; ') || 'none'}). Substitute stock: ${otherPlants.length ? `${fmt(otherPlants.reduce((s, x) => s + num(x.LABST), 0), 3)} ${mat.meins} in other plants` : 'none in other plants'}${altStock.length ? `, ${altStock.length} alternative material stock(s)` : ''}.${recommendation ? `\n\n${recommendation}` : ''}`;
    return {
      text,
      toolResults: [
        section(AGENT_SCM, `1. Production and Planned Orders Impacted (next 2 weeks) \u2014 ${mat.matnr}`, [{ key: 'type', label: 'Type' }, { key: 'order', label: 'Order' }, { key: 'material', label: 'Product' }, { key: 'qty', label: 'Order Qty' }, { key: 'start', label: 'Start' }, { key: 'finish', label: 'Finish' }, { key: 'salesOrder', label: 'Sales Order' }, { key: 'componentNeed', label: `Need of ${mat.matnr}` }], prodRows,
          [{ label: 'Deficit', value: `${fmt(deficit, 3)} ${mat.meins}` }, { label: 'Stock at plant', value: `${fmt(plantStock, 3)} ${mat.meins}` }, { label: 'Demand until new date', value: `${fmt(demand, 3)} ${mat.meins}` }]),
        section(AGENT_SCM, '1. Customer Orders Impacted (next 2 weeks, by priority)', [{ key: 'order', label: 'Sales Order' }, { key: 'item', label: 'Item' }, { key: 'customer', label: 'Customer' }, { key: 'material', label: 'Material' }, { key: 'priority', label: 'Delivery Priority' }, { key: 'requested', label: 'Requested Date' }, { key: 'value', label: 'Net Value' }], soRows),
        section(AGENT_SCM, '2. Substitute Stock and Alternative Materials', [{ key: 'type', label: 'Type' }, { key: 'material', label: 'Material' }, { key: 'plant', label: 'Plant' }, { key: 'location', label: 'Storage Location' }, { key: 'qty', label: 'Unrestricted Qty' }], subRows,
          [], 'Alternative materials come from the follow-up material (MARC-NFMAT) and alternative item groups in the BOMs (STPO-ALPGR). Regulatory compliance of an alternative is not stored in SAP and must be confirmed.'),
        section(AGENT_SCM, '3. Financial Impact Inputs', [{ key: 'option', label: 'Option' }, { key: 'detail', label: 'Live Figures' }], [
          { option: 'Expedite from backup vendor', detail: Array.isArray(options.expedite) ? options.expedite.map(o => `${o.supplier}: ${o.unitPrice}/unit, lead time ${o.leadTimeDays ?? 'n/a'} days, extra material cost ${o.extraMaterialCost}`).join(' | ') : options.expedite },
          { option: 'Resequence production', detail: `${orders.length} order(s); delayed output value ${options.resequence.outputValueDelayed}` },
          { option: 'Absorb late-delivery penalties', detail: `${soInWindow.length} order item(s); revenue at risk ${options.absorbPenalties.revenueAtRisk.join('; ') || '0'}; ${options.absorbPenalties.penaltyTerms}` }
        ])
      ]
    };
  } catch (e: any) { return unavailable(AGENT_SCM, 'Supply Disruption Analysis', e?.message || String(e)); }
}

export async function buildInventoryAnalysis(query: string): Promise<ScenarioResult> {
  const plant = extractPlant(query) || '1710';
  try {
    const t001 = await sel(`SELECT W~WERKS, W~NAME1, W~BWKEY, K~BUKRS, C~WAERS FROM T001W AS W LEFT OUTER JOIN T001K AS K ON K~BWKEY = W~BWKEY LEFT OUTER JOIN T001 AS C ON C~BUKRS = K~BUKRS WHERE W~WERKS = ${lit(plant)}`, 1);
    if (!t001.length) return { text: `Plant ${plant} does not exist in the connected S/4HANA system (T001W).`, toolResults: [] };
    const { NAME1: plantName, BWKEY: bwkey, WAERS: cur } = t001[0];
    const [stock, val, lastMove] = await Promise.all([
      sel(`SELECT D~MATNR, D~LGORT, D~LABST, D~INSME, D~SPEME, A~MTART, A~MEINS FROM MARD AS D INNER JOIN MARA AS A ON A~MATNR = D~MATNR WHERE D~WERKS = ${lit(plant)}`, 50000),
      sel(`SELECT MATNR, LBKUM, SALK3, VPRSV, VERPR, STPRS, PEINH FROM MBEW WHERE BWKEY = ${lit(bwkey)} AND BWTAR = ' '`, 50000),
      sel(`SELECT MATNR, MAX( BUDAT ) AS LAST FROM MATDOC WHERE WERKS = ${lit(plant)} AND RECORD_TYPE = 'MDOC' AND CANCELLED = ' ' GROUP BY MATNR`, 50000).catch(() => [] as Row[])
    ]);
    const byMat = new Map<string, { labst: number; insme: number; speme: number; mtart: string; meins: string }>();
    stock.forEach(s => { const e = byMat.get(s.MATNR) || { labst: 0, insme: 0, speme: 0, mtart: s.MTART, meins: s.MEINS }; e.labst += num(s.LABST); e.insme += num(s.INSME); e.speme += num(s.SPEME); byMat.set(s.MATNR, e); });
    const valMap = new Map(val.map(v => [v.MATNR, v]));
    const lastMap = new Map(lastMove.map(m => [m.MATNR, m.LAST]));
    const t = today();
    const price = (m: string) => { const v = valMap.get(m); return v ? (v.VPRSV === 'S' ? num(v.STPRS) : num(v.VERPR)) / Math.max(1, num(v.PEINH)) : 0; };
    const mats = [...byMat.entries()].map(([m, e]) => {
      const total = e.labst + e.insme + e.speme;
      const v = valMap.get(m);
      const value = v && num(v.LBKUM) ? num(v.SALK3) * Math.min(1, total / num(v.LBKUM)) : total * price(m);
      const last = lastMap.get(m) || '';
      return { m, ...e, total, value, last, idle: last ? daysBetween(toDate(last), t) : 9999 };
    });
    const inStock = mats.filter(x => x.total > 0);
    const totalValue = inStock.reduce((s, x) => s + x.value, 0);
    const blockedValue = inStock.reduce((s, x) => s + (x.total ? x.value * (x.insme + x.speme) / x.total : 0), 0);
    const slow = inStock.filter(x => x.idle > 180).sort((a, b) => b.value - a.value);
    const slowValue = slow.reduce((s, x) => s + x.value, 0);
    const zero = mats.filter(x => x.total === 0).length;
    const texts = await materialTexts([...inStock.sort((a, b) => b.value - a.value).slice(0, 15).map(x => x.m), ...slow.slice(0, 15).map(x => x.m)]);
    const byType = new Map<string, { n: number; value: number }>();
    inStock.forEach(x => { const e = byType.get(x.mtart) || { n: 0, value: 0 }; e.n++; e.value += x.value; byType.set(x.mtart, e); });
    const bySloc = new Map<string, { n: number; blocked: number }>();
    stock.filter(s => num(s.LABST) + num(s.INSME) + num(s.SPEME) > 0).forEach(s => { const e = bySloc.get(s.LGORT) || { n: 0, blocked: 0 }; e.n++; if (num(s.INSME) + num(s.SPEME) > 0) e.blocked++; bySloc.set(s.LGORT, e); });
    const top = [...inStock].sort((a, b) => b.value - a.value).slice(0, 15);
    const share = (v: number) => totalValue ? `${(v / totalValue * 100).toFixed(1)}%` : '\u2014';
    return {
      text: `Live inventory analysis for plant ${plant} (${plantName}): ${int(inStock.length)} materials in stock worth ${fmt(totalValue)} ${cur}; top 15 materials hold ${share(top.reduce((s, x) => s + x.value, 0))} of the value. ${int(slow.length)} materials (${fmt(slowValue)} ${cur}, ${share(slowValue)}) have had no goods movement for over 180 days; ${fmt(blockedValue)} ${cur} sits in quality-inspection or blocked stock; ${int(zero)} storage-location records are at zero.`,
      toolResults: [
        section(AGENT_SCM, `Inventory Value by Material Type \u2014 Plant ${plant}`, [{ key: 'type', label: 'Material Type' }, { key: 'n', label: 'Materials in Stock' }, { key: 'value', label: `Stock Value (${cur})` }, { key: 'share', label: 'Share' }],
          [...byType.entries()].sort((a, b) => b[1].value - a[1].value).map(([k, e]) => ({ type: k, n: String(e.n), value: fmt(e.value), share: share(e.value) })),
          [{ label: 'Materials in stock', value: int(inStock.length) }, { label: `Total value (${cur})`, value: fmt(totalValue) }, { label: `Slow/non-moving >180d (${cur})`, value: fmt(slowValue) }, { label: `QI + blocked (${cur})`, value: fmt(blockedValue) }, { label: 'Zero-stock records', value: int(zero) }],
          'Quantities from the storage-location stock (MARD: unrestricted, quality inspection, blocked); value from the material valuation (MBEW total value, prorated to the stock shown) for the plant valuation area; last movement from the material documents (MATDOC).'),
        section(AGENT_SCM, `Top 15 Materials by Stock Value \u2014 Plant ${plant}`, [{ key: 'material', label: 'Material' }, { key: 'description', label: 'Description' }, { key: 'qty', label: 'Total Qty' }, { key: 'value', label: `Value (${cur})` }, { key: 'share', label: 'Share' }, { key: 'last', label: 'Last Movement' }],
          top.map(x => ({ material: x.m, description: texts.get(x.m) || '\u2014', qty: `${fmt(x.total, 3)} ${x.meins}`, value: fmt(x.value), share: share(x.value), last: iso(x.last) }))),
        section(AGENT_SCM, `Slow / Non-Moving Stock (no movement > 180 days) \u2014 Plant ${plant}`, [{ key: 'material', label: 'Material' }, { key: 'description', label: 'Description' }, { key: 'qty', label: 'Total Qty' }, { key: 'value', label: `Value (${cur})` }, { key: 'idle', label: 'Days Without Movement' }],
          slow.slice(0, 100).map(x => ({ material: x.m, description: texts.get(x.m) || '\u2014', qty: `${fmt(x.total, 3)} ${x.meins}`, value: fmt(x.value), idle: x.idle === 9999 ? 'never moved' : int(x.idle) }))),
        section(AGENT_SCM, `Stock by Storage Location \u2014 Plant ${plant}`, [{ key: 'sloc', label: 'Storage Location' }, { key: 'n', label: 'Material Records with Stock' }, { key: 'blocked', label: 'With QI/Blocked Stock' }],
          [...bySloc.entries()].sort((a, b) => b[1].n - a[1].n).map(([k, e]) => ({ sloc: k, n: String(e.n), blocked: String(e.blocked) })))
      ]
    };
  } catch (e: any) { return unavailable(AGENT_SCM, 'Inventory Management', e?.message || String(e)); }
}

// ================= USERS / SALES =================
export async function buildUserActivity(query: string): Promise<ScenarioResult> {
  const token = (/\buser\s+([A-Za-z0-9_@.\-]{3,})/i.exec(query)?.[1] || /\b([A-Z][A-Z0-9]*_[A-Z0-9_]+)\b/.exec(query)?.[1] || '').toUpperCase();
  try {
    // The data preview raises an exception instead of returning no rows for an unknown user; a readable USR02 proves the user is simply absent.
    const u = token ? await sel(`SELECT BNAME, USTYP, CLASS, GLTGV, GLTGB, TRDAT, LTIME, UFLAG, ERDAT FROM USR02 WHERE BNAME = ${lit(token)}`, 1).catch(async e => {
      const c = await sel(`SELECT COUNT( * ) AS N FROM USR02`, 1).catch(() => { throw e; });
      if (!num(c[0]?.N)) throw e;
      return [] as Row[];
    }) : [];
    if (!u.length) {
      const parts = token.split(/[_@.\-]/).filter(p => p.length >= 3);
      const similar = parts.length ? await sel(`SELECT BNAME, USTYP, TRDAT FROM USR02 WHERE ${parts.map(p => `BNAME LIKE ${lit(`%${p}%`)}`).join(' OR ')}`, 15).catch(() => [] as Row[]) : [];
      return {
        text: `User ${token || '(none given)'} does not exist in the connected S/4HANA system (checked the user master USR02 live), so no activity or performance can be summarized for it.${similar.length ? ` Existing users with a similar name: ${similar.map(s => s.BNAME).join(', ')}.` : ''}`,
        toolResults: similar.length ? [section(AGENT_SEC, `Users resembling "${token}"`, [{ key: 'BNAME', label: 'User' }, { key: 'USTYP', label: 'Type' }, { key: 'TRDAT', label: 'Last Logon' }], similar.map(s => ({ ...s, TRDAT: iso(s.TRDAT) })))] : []
      };
    }
    const user = u[0];
    const since = ymd(addDays(today(), -90));
    const count = (sql: string) => sel(sql, 1).then(r => num(r[0]?.N)).catch(() => -1);
    const [roles, fi, so, po, gm, chg, person] = await Promise.all([
      sel(`SELECT AGR_NAME, FROM_DAT, TO_DAT FROM AGR_USERS WHERE UNAME = ${lit(token)}`, 500).catch(() => [] as Row[]),
      count(`SELECT COUNT( * ) AS N FROM BKPF WHERE USNAM = ${lit(token)} AND CPUDT >= ${lit(since)}`),
      count(`SELECT COUNT( * ) AS N FROM VBAK WHERE ERNAM = ${lit(token)} AND ERDAT >= ${lit(since)}`),
      count(`SELECT COUNT( * ) AS N FROM EKKO WHERE ERNAM = ${lit(token)} AND AEDAT >= ${lit(since)}`),
      count(`SELECT COUNT( * ) AS N FROM MKPF WHERE USNAM = ${lit(token)} AND CPUDT >= ${lit(since)}`),
      count(`SELECT COUNT( * ) AS N FROM CDHDR WHERE USERNAME = ${lit(token)} AND UDATE >= ${lit(since)}`),
      sel(`SELECT A~PERNR, B~ENAME, B~ORGEH, B~PLANS FROM PA0105 AS A INNER JOIN PA0001 AS B ON B~PERNR = A~PERNR WHERE A~USRTY = '0001' AND A~USRID = ${lit(token)}`, 1).catch(() => [] as Row[])
    ]);
    const todayS = ymd(today());
    const activeRoles = roles.filter(r => r.TO_DAT >= todayS);
    const rows = [
      { metric: 'User type', value: { A: 'Dialog', B: 'System', C: 'Communication', L: 'Reference', S: 'Service' }[user.USTYP] || user.USTYP },
      { metric: 'Status', value: user.UFLAG === '0' ? 'Active (not locked)' : `Locked (flag ${user.UFLAG})` },
      { metric: 'Valid', value: `${iso(user.GLTGV)} to ${iso(user.GLTGB)}` },
      { metric: 'Last logon', value: `${iso(user.TRDAT)} ${user.LTIME ? user.LTIME.replace(/(\d{2})(\d{2})(\d{2})/, '$1:$2:$3') : ''}`.trim() },
      { metric: 'Active roles', value: String(activeRoles.length) },
      { metric: 'Accounting documents posted (90 days)', value: fi < 0 ? 'n/a' : int(fi) },
      { metric: 'Sales orders created (90 days)', value: so < 0 ? 'n/a' : int(so) },
      { metric: 'Purchase orders created (90 days)', value: po < 0 ? 'n/a' : int(po) },
      { metric: 'Material documents posted (90 days)', value: gm < 0 ? 'n/a' : int(gm) },
      { metric: 'Change documents (90 days)', value: chg < 0 ? 'n/a' : int(chg) },
      ...(person[0] ? [{ metric: 'Linked employee', value: `${stripZeros(person[0].PERNR)} ${person[0].ENAME}` }] : [])
    ];
    const total = [fi, so, po, gm, chg].filter(x => x > 0).reduce((s, x) => s + x, 0);
    return {
      text: `User ${token}: ${rows[0].value.toLowerCase()} user, ${rows[1].value.toLowerCase()}, last logon ${rows[3].value || 'never'}, ${activeRoles.length} active role(s). Activity in the last 90 days: ${total ? `${int(total)} business transactions/changes (accounting ${fi < 0 ? 'n/a' : fi}, sales orders ${so < 0 ? 'n/a' : so}, purchase orders ${po < 0 ? 'n/a' : po}, material documents ${gm < 0 ? 'n/a' : gm}, change documents ${chg < 0 ? 'n/a' : chg})` : 'no business documents created or changed'}.${person[0] ? ` Linked to employee ${person[0].ENAME}.` : ' No employee record (HR infotype 0105) is linked to this user, so HR performance appraisal data is not available for it.'}`,
      toolResults: [
        section(AGENT_SEC, `User Activity Summary \u2014 ${token}`, [{ key: 'metric', label: 'Measure' }, { key: 'value', label: 'Value' }], rows, [], 'User master (USR02), role assignments (AGR_USERS) and documents created or changed by the user in the last 90 days (BKPF, VBAK, EKKO, MKPF, CDHDR). System workload statistics (ST03N) are not stored in readable tables.'),
        ...(activeRoles.length ? [section(AGENT_SEC, `Active Roles \u2014 ${token}`, [{ key: 'AGR_NAME', label: 'Role' }, { key: 'FROM_DAT', label: 'Valid From' }, { key: 'TO_DAT', label: 'Valid To' }], activeRoles.map(r => ({ ...r, FROM_DAT: iso(r.FROM_DAT), TO_DAT: iso(r.TO_DAT) })))] : [])
      ]
    };
  } catch (e: any) { return unavailable(AGENT_SEC, 'User Master', e?.message || String(e)); }
}

// Returns null when customer and material both exist, so the regular sales-order creation flow continues.
export async function validateSalesOrderRequest(query: string): Promise<ScenarioResult | null> {
  const cust = extractIdAfter(query, ['customer', 'sold-to', 'sold to']);
  const m = /\bfor\s+(\d+(?:\.\d+)?)\s+(?:(?:pcs?|ea|each|units?|st|pc)\s+)?(?:of\s+)?(?:material\s+)?([A-Za-z0-9][A-Za-z0-9_\-]*\d[A-Za-z0-9_\-]*)/i.exec(query);
  if (!cust || !m) return null;
  const qty = m[1]; const matTok = m[2].toUpperCase();
  try {
    const custCands = [cust, /^\d+$/.test(cust) ? cust.padStart(10, '0') : ''].filter(Boolean);
    const [kna1, mat] = await Promise.all([sel(`SELECT KUNNR, NAME1 FROM KNA1 WHERE KUNNR IN ( ${custCands.map(lit).join(', ')} )`, 1), resolveMaterial(matTok)]);
    if (kna1.length && mat) return null;
    const problems: string[] = [];
    const toolResults: any[] = [];
    if (!kna1.length) {
      const parts = cust.split(/[-_]/).filter(p => p.length >= 2);
      const similar = await sel(`SELECT KUNNR, NAME1, ORT01, LAND1 FROM KNA1 WHERE ${[cust, ...parts].map(p => `KUNNR LIKE ${lit(`%${p}%`)} OR SORTL LIKE ${lit(`%${p}%`)}`).join(' OR ')}`, 10).catch(() => [] as Row[]);
      problems.push(`customer ${cust} does not exist (customer master KNA1)`);
      if (similar.length) toolResults.push(section(AGENT_SD, `Customers resembling "${cust}"`, [{ key: 'KUNNR', label: 'Customer' }, { key: 'NAME1', label: 'Name' }, { key: 'ORT01', label: 'City' }, { key: 'LAND1', label: 'Country' }], similar.map(s => ({ ...s, KUNNR: stripZeros(s.KUNNR) }))));
    }
    if (!mat) {
      const similar = await similarMaterials(matTok);
      problems.push(`material ${matTok} does not exist (material master MARA)`);
      if (similar.length) toolResults.push(section(AGENT_SD, `Materials resembling "${matTok}"`, [{ key: 'MATNR', label: 'Material' }, { key: 'MAKTX', label: 'Description' }, { key: 'MTART', label: 'Type' }], similar));
    }
    return {
      text: `The sales order for ${qty} x ${matTok} for customer ${cust} was not created: ${problems.join(' and ')} in the connected S/4HANA system. No order number was generated. Please use an existing customer and material${toolResults.length ? ' \u2014 similar existing entries are listed below' : ''}, e.g. "Create a sales order for customer 17100001 for 1 TG11".`,
      toolResults
    };
  } catch { return null; }
}

// ---------- dispatcher ----------
export async function runScenario(intent: ScenarioIntent, query: string, llm: LlmFn): Promise<ScenarioResult | null> {
  const r = await runScenarioRaw(intent, query, llm);
  // Keep the first table even when empty (it carries the summary); drop other empty tables.
  if (r) r.toolResults = r.toolResults.filter((t, i) => i === 0 || t.type !== 'mm_live_report' || (Array.isArray(t.data?.rows) && t.data.rows.length > 0));
  return r;
}

async function runScenarioRaw(intent: ScenarioIntent, query: string, llm: LlmFn): Promise<ScenarioResult | null> {
  switch (intent) {
    case 'AR_OVERDUE_FOLLOWUP': return buildArOverdueFollowUp(query, llm);
    case 'BANK_BALANCES': return buildBankBalances();
    case 'DISPUTE_CREDIT': return buildDisputeCreditReview(query);
    case 'MAKE_OR_BUY': return buildMakeOrBuy(query);
    case 'BOM_COMPONENTS': return buildBomComponents(query);
    case 'WHERE_USED': return buildWhereUsed(query);
    case 'SUPPLIERS_OF': return buildSuppliersOf(query);
    case 'MATERIAL_FORECAST': return buildMaterialForecast(query);
    case 'STOCKOUT_SALES_IMPACT': return buildStockoutSalesImpact(query);
    case 'SCHEDULING_BOTTLENECKS': return buildSchedulingBottlenecks(query);
    case 'USER_ACTIVITY': return buildUserActivity(query);
    case 'CREATE_SO_VALIDATION': return validateSalesOrderRequest(query);
    case 'INVENTORY_ANALYSIS': return buildInventoryAnalysis(query);
    case 'SUPPLY_DELAY_IMPACT': return buildSupplyDelayImpact(query, llm);
    case 'AP_BLOCKED_ANALYSIS': return buildApBlockedAnalysis(query);
  }
}

export const SCENARIO_AGENT: Record<ScenarioIntent, string> = {
  AR_OVERDUE_FOLLOWUP: AGENT_FI, BANK_BALANCES: AGENT_FI, DISPUTE_CREDIT: AGENT_FI, AP_BLOCKED_ANALYSIS: AGENT_FI,
  MAKE_OR_BUY: AGENT_SCM, BOM_COMPONENTS: AGENT_SCM, WHERE_USED: AGENT_SCM, SUPPLIERS_OF: AGENT_SCM, MATERIAL_FORECAST: AGENT_SCM,
  STOCKOUT_SALES_IMPACT: AGENT_SCM, SCHEDULING_BOTTLENECKS: AGENT_SCM, INVENTORY_ANALYSIS: AGENT_SCM, SUPPLY_DELAY_IMPACT: AGENT_SCM,
  USER_ACTIVITY: AGENT_SEC, CREATE_SO_VALIDATION: AGENT_SD
};
