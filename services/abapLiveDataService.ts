// Live ABAP custom-code answers built from the S/4HANA repository and runtime tables (read-only
// ADT Open SQL) plus real ABAP source fetched through the ADT REST API. Nothing is cached,
// simulated or hardcoded: every program, line, dump, IDoc and finding comes from the live system.
import { executeReadOnlySelect } from './hanaDbIntelligenceService';

export type AbapLiveIntent =
  | 'EXPLAIN_RECENT' | 'TABLE_UPDATERS' | 'CUSTOM_TABLES' | 'DUPLICATES' | 'RISK'
  | 'DUMP_WHY' | 'DUMP_EXPLAIN' | 'DUMP_LINE' | 'ST22_LIST' | 'PROGRAM_ERRORS' | 'DEFECT_FIX'
  | 'ITAB_EMPTY' | 'SELECT_NO_DATA' | 'BAPI_FAIL' | 'IDOC_FAIL' | 'JOB_TERM'
  | 'SLOWEST' | 'DB_TIME' | 'RUNTIME_COMPARE' | 'SELECT_PERF' | 'ANALYZE_SQL' | 'OPTIMIZE'
  | 'S4_COMPAT' | 'OBSOLETE' | 'SIMPLIFIED' | 'FAIL_AFTER_MIGRATION' | 'CDS_REPLACE' | 'ATC';

export type AbapCodeGenTarget = 'CONVERT_OO' | 'CONVERT_S4' | 'UNIT_TESTS';

export type AbapSection = {
  title: string;
  summaryStats?: { label: string; value: string }[];
  columns: { key: string; label: string }[];
  rows: Record<string, string | number>[];
  note?: string;
};
export type AbapLiveReport = { text: string; sections: AbapSection[]; assess: boolean; persona?: string; context?: string };

const NAMED_OBJECT = /\b[ZY][A-Za-z0-9_]*[0-9_][A-Za-z0-9_]*\b/;
const namedObject = (query: string) => (query.match(NAMED_OBJECT) || [])[0]?.toUpperCase() || null;

export function classifyAbapLiveIntent(n: string, query: string): AbapLiveIntent | null {
  const has = (...w: string[]) => w.some(x => n.includes(x));
  const named = !!namedObject(query);
  const pastedSql = /\bselect\b[\s\S]+\bfrom\b/i.test(query);
  if (!named && has('explain') && has('this abap program', 'this program') && !has('dump')) return 'EXPLAIN_RECENT';
  if (!named && has('custom table') && has('update', 'modify', 'write') && has('program')) return 'TABLE_UPDATERS';
  if (!named && /\b(custom|z|y)[ -]?tables?\b|\bztables?\b/.test(n) && !has('update', 'modify', 'write', 'insert', 'delete', 'create', 'generate', 'build', 'program')) return 'CUSTOM_TABLES';
  if (has('duplicate logic', 'duplicate code') && has('program', 'abap', 'custom')) return 'DUPLICATES';
  if (has('highest risk') && has('custom object', 'custom code', 'abap', 'z program')) return 'RISK';
  if (has('dump') && has('abap program') && has('why')) return 'DUMP_WHY';
  if (has('st22') && has('dump') && has('explain', 'plain english')) return 'DUMP_EXPLAIN';
  if (has('st22') && /\bdumps?\b/.test(n) && !has('why', 'fix', 'line of code', 'write', 'generate', 'create')) return 'ST22_LIST';
  if (has('line of code') && has('error', 'dump', 'causing')) return 'DUMP_LINE';
  if (has('recent errors') && has('program')) return 'PROGRAM_ERRORS';
  if (has('fix') && has('defect') && has('safest', 'recommend') && !has('inspection', 'quality', 'notification', 'qm')) return 'DEFECT_FIX';
  if (has('internal table') && has('empty')) return 'ITAB_EMPTY';
  if (has('select') && has('no data', 'returning nothing', 'no rows') && !pastedSql) return 'SELECT_NO_DATA';
  if (/\bbapi\b/.test(n) && has('fail', 'error')) return 'BAPI_FAIL';
  if (has('idoc') && has('processing program') && has('fail', 'error')) return 'IDOC_FAIL';
  if (has('background job') && has('terminat')) return 'JOB_TERM';
  if (has('slowest') && has('abap program', 'custom abap', 'custom program')) return 'SLOWEST';
  if (has('database time') && has('report', 'program') && has('custom')) return 'DB_TIME';
  if (has('runtime') && has('before and after', 'before-and-after')) return 'RUNTIME_COMPARE';
  if (has('select statement') && has('cds') && has('replace')) return 'CDS_REPLACE';
  if (has('select statement') && has('performance')) return 'SELECT_PERF';
  if (has('sql statement') && has('hana') && !pastedSql) return 'ANALYZE_SQL';
  if (!named && has('optimize') && has('program') && !pastedSql) return 'OPTIMIZE';
  if (has('not s/4hana compatible', 'not s4hana compatible')) return 'S4_COMPAT';
  if (has('obsolete') && has('table', 'transaction') && has('code', 'program')) return 'OBSOLETE';
  if (has('simplified data model')) return 'SIMPLIFIED';
  if (has('fail after') && has('migration')) return 'FAIL_AFTER_MIGRATION';
  if (/\batc\b/.test(n) && has('finding')) return 'ATC';
  return null;
}

// Code-generation requests that say "this program/class/logic" without naming or pasting one are
// grounded on a real live object picked from the repository (the pick is always stated).
export function classifyAbapCodeGenTarget(n: string, query: string): AbapCodeGenTarget | null {
  if (namedObject(query) || /\n/.test(query.trim()) || query.length > 200) return null;
  if (n.includes('convert') && n.includes('procedural program') && (n.includes('object-oriented') || n.includes('object oriented'))) return 'CONVERT_OO';
  if (n.includes('convert') && n.includes('ecc abap') && (n.includes('s/4hana') || n.includes('s4hana'))) return 'CONVERT_S4';
  if (n.includes('unit test') && n.includes('this class') && (n.includes('generate') || n.includes('create') || n.includes('write'))) return 'UNIT_TESTS';
  return null;
}

// ---------- live access helpers ----------
type Q = { rows: Record<string, string>[]; total: number; error?: string };
async function q(sql: string, maxRows = 500): Promise<Q> {
  const r: any = await executeReadOnlySelect(sql, maxRows);
  if ('error' in r) return { rows: [], total: 0, error: r.error };
  return { rows: r.rows.map((row: any) => Object.fromEntries(Object.entries(row).map(([k, v]) => [k, String(v ?? '').trim()]))), total: r.totalRows ?? r.rowCount };
}
const ADT_HOST = 'https://mmc-s4sap11.mmc.1stbasis.com:44300';
async function adtGet(path: string): Promise<string | null> {
  const user = process.env.SAP_S8H_USER; const pwd = process.env.SAP_S8H_PWD;
  if (!user || !pwd) return null;
  try {
    const res = await fetch(`${ADT_HOST}${path}${path.includes('?') ? '&' : '?'}sap-client=100`, {
      headers: { Authorization: `Basic ${Buffer.from(`${user}:${pwd}`).toString('base64')}`, Accept: 'text/plain' },
      signal: AbortSignal.timeout(20000)
    });
    return res.ok ? await res.text() : null;
  } catch { return null; }
}
const enc = (s: string) => encodeURIComponent(s.toLowerCase());
const num = (v: any) => Number(String(v ?? '').trim()) || 0;
const fmtD = (d: string) => /^\d{8}$/.test(d) && d !== '00000000' ? `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6)}` : '';
const fmtT = (t: string) => /^\d{6}$/.test(t) ? `${t.slice(0, 2)}:${t.slice(2, 4)}:${t.slice(4)}` : t;
const addDays = (d: string, days: number) => {
  const dt = new Date(Date.UTC(+d.slice(0, 4), +d.slice(4, 6) - 1, +d.slice(6, 8) + days));
  return `${dt.getUTCFullYear()}${String(dt.getUTCMonth() + 1).padStart(2, '0')}${String(dt.getUTCDate()).padStart(2, '0')}`;
};
const inList = (vals: string[]) => vals.map(v => `'${v.replace(/'/g, "''")}'`).join(', ');
const cols = (...pairs: [string, string][]) => pairs.map(([key, label]) => ({ key, label }));
const clip = (s: string, n: number) => s.length > n ? `${s.slice(0, n - 1)}…` : s;
const errNote = (...errs: (string | undefined)[]) => errs.filter(Boolean).map(e => `Live read error: ${e}`).join(' ');
const isCustom = (name: string) => /^(Z|Y|SAPLZ|SAPLY|LZ|LY)/.test(name);
const CUSTOM_MASTER = "( A~MASTER LIKE 'Z%' OR A~MASTER LIKE 'Y%' OR A~MASTER LIKE 'SAPLZ%' OR A~MASTER LIKE 'SAPLY%' )";

async function sysDate(): Promise<string> {
  const r = await q('SELECT DISTINCT @sy-datum AS D FROM T000', 1);
  if (r.rows[0]?.D) return r.rows[0].D;
  const d = new Date();
  return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`;
}

// ---------- source retrieval ----------
type Unit = { name: string; master: string; source: string };
const classOf = (master: string) => (/^(.+?)=+CP$/.exec(master) || [])[1];

// Resolves a repository main program (report, class pool, function group) into real source units.
async function fetchUnits(master: string, expandIncludes = true): Promise<Unit[]> {
  const cls = classOf(master);
  if (cls) {
    const src = await adtGet(`/sap/bc/adt/oo/classes/${enc(cls)}/source/main`);
    return src ? [{ name: cls, master, source: src }] : [];
  }
  const fg = /^SAPL(.+)$/.exec(master);
  if (fg) {
    const fms = await q(`SELECT FUNCNAME FROM TFDIR WHERE PNAME = '${master}' ORDER BY FUNCNAME`, 6);
    const out: Unit[] = [];
    for (const f of fms.rows) {
      const src = await adtGet(`/sap/bc/adt/functions/groups/${enc(fg[1])}/fmodules/${enc(f.FUNCNAME)}/source/main`);
      if (src) out.push({ name: f.FUNCNAME, master, source: src });
    }
    return out;
  }
  const main = await adtGet(`/sap/bc/adt/programs/programs/${enc(master)}/source/main`) ?? await adtGet(`/sap/bc/adt/programs/includes/${enc(master)}/source/main`);
  if (!main) return [];
  const out: Unit[] = [{ name: master, master, source: main }];
  if (expandIncludes) {
    const incs = [...new Set([...main.matchAll(/^\s*INCLUDE\s+([ZY][A-Z0-9_\/]+)\s*\./gim)].map(m => m[1].toUpperCase()))].slice(0, 5);
    for (const inc of incs) {
      const src = await adtGet(`/sap/bc/adt/programs/includes/${enc(inc)}/source/main`);
      if (src) out.push({ name: inc, master, source: src });
    }
  }
  return out;
}

async function inBatches<T, R>(items: T[], size: number, fn: (t: T) => Promise<R>): Promise<R[]> {
  const out: R[] = [];
  for (let i = 0; i < items.length; i += size) out.push(...await Promise.all(items.slice(i, i + size).map(fn)));
  return out;
}

type ProgInfo = { name: string; subc: string; cnam: string; cdat: string; unam: string; udat: string };
const SUBC_TEXT: Record<string, string> = { '1': 'Executable program', K: 'Class pool', F: 'Function group', I: 'Include', M: 'Module pool', J: 'Interface pool', S: 'Subroutine pool' };
async function recentCustomPrograms(limit: number, subcs = ['1', 'K']): Promise<{ list: ProgInfo[]; total: number; error?: string }> {
  const r = await q(`SELECT NAME, SUBC, CNAM, CDAT, UNAM, UDAT FROM PROGDIR WHERE STATE = 'A' AND ( NAME LIKE 'Z%' OR NAME LIKE 'Y%' ) AND SUBC IN ( ${inList(subcs)} ) ORDER BY UDAT DESCENDING`, limit);
  return { list: r.rows.map(x => ({ name: x.NAME, subc: x.SUBC, cnam: x.CNAM, cdat: x.CDAT, unam: x.UNAM, udat: x.UDAT })), total: r.total, error: r.error };
}
async function programInfo(names: string[]): Promise<Map<string, ProgInfo>> {
  const m = new Map<string, ProgInfo>();
  if (!names.length) return m;
  const r = await q(`SELECT NAME, SUBC, CNAM, CDAT, UNAM, UDAT FROM PROGDIR WHERE STATE = 'A' AND NAME IN ( ${inList(names.slice(0, 200))} )`, 200);
  r.rows.forEach(x => m.set(x.NAME, { name: x.NAME, subc: x.SUBC, cnam: x.CNAM, cdat: x.CDAT, unam: x.UNAM, udat: x.UDAT }));
  return m;
}
// Live sample of real custom sources (most recently changed first).
async function recentUnits(maxPrograms: number): Promise<{ units: Unit[]; programs: ProgInfo[]; total: number; error?: string }> {
  const rec = await recentCustomPrograms(maxPrograms * 2);
  const programs: ProgInfo[] = []; const units: Unit[] = [];
  const fetched = await inBatches(rec.list, 6, async p => ({ p, u: await fetchUnits(p.name) }));
  for (const f of fetched) {
    if (!f.u.length || programs.length >= maxPrograms) continue;
    programs.push(f.p); units.push(...f.u);
  }
  return { units, programs, total: rec.total, error: rec.error };
}

// ---------- ABAP statement analysis ----------
type Stmt = { line: number; text: string; up: string };
function splitStatements(src: string): Stmt[] {
  const lines = src.split(/\r?\n/);
  const out: Stmt[] = [];
  let buf = ''; let start = -1;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (/^\*/.test(l)) continue;
    let inQ: string | null = null;
    for (let c = 0; c < l.length; c++) {
      const ch = l[c];
      if (inQ) { buf += ch; if (ch === inQ) inQ = null; continue; }
      if (ch === '"') break;
      if (ch === "'" || ch === '`' || ch === '|') { inQ = ch; if (start < 0) start = i; buf += ch; continue; }
      if (ch === '.' && !/[A-Za-z0-9_]/.test(l[c + 1] || '')) {
        const t = buf.replace(/\s+/g, ' ').trim();
        if (t) out.push({ line: start + 1, text: t, up: t.toUpperCase() });
        buf = ''; start = -1; continue;
      }
      if (start < 0 && /\S/.test(ch)) start = i;
      buf += ch;
    }
    buf += ' ';
  }
  return out;
}

type SimplInfo = { item: string; replacement: string; cds?: string };
// Publicly documented S/4HANA Simplification List items (general SAP product knowledge used only
// to interpret real live repository references; row counts and replacement objects are read live).
const SIMPLIFICATION: Record<string, SimplInfo> = {
  KONV: { item: 'SD pricing conditions moved to PRCD_ELEMENTS', replacement: 'PRCD_ELEMENTS' },
  VBUK: { item: 'SD header status table removed (status fields moved to VBAK/LIKP/VBRK)', replacement: 'VBAK' },
  VBUP: { item: 'SD item status table removed (status fields moved to VBAP/LIPS)', replacement: 'VBAP' },
  MKPF: { item: 'Inventory Management data model: material documents in MATDOC', replacement: 'MATDOC', cds: 'I_MATERIALDOCUMENTITEM_2' },
  MSEG: { item: 'Inventory Management data model: material documents in MATDOC', replacement: 'MATDOC', cds: 'I_MATERIALDOCUMENTITEM_2' },
  BSIS: { item: 'FI index tables replaced by the Universal Journal', replacement: 'ACDOCA', cds: 'I_JOURNALENTRYITEM' },
  BSAS: { item: 'FI index tables replaced by the Universal Journal', replacement: 'ACDOCA', cds: 'I_JOURNALENTRYITEM' },
  BSID: { item: 'FI index tables replaced by the Universal Journal', replacement: 'ACDOCA', cds: 'I_OPERATIONALACCTGDOCITEM' },
  BSAD: { item: 'FI index tables replaced by the Universal Journal', replacement: 'ACDOCA', cds: 'I_OPERATIONALACCTGDOCITEM' },
  BSIK: { item: 'FI index tables replaced by the Universal Journal', replacement: 'ACDOCA', cds: 'I_OPERATIONALACCTGDOCITEM' },
  BSAK: { item: 'FI index tables replaced by the Universal Journal', replacement: 'ACDOCA', cds: 'I_OPERATIONALACCTGDOCITEM' },
  GLT0: { item: 'G/L totals replaced by the Universal Journal', replacement: 'ACDOCA', cds: 'I_JOURNALENTRYITEM' },
  FAGLFLEXT: { item: 'New G/L totals replaced by the Universal Journal', replacement: 'ACDOCA', cds: 'I_JOURNALENTRYITEM' },
  FAGLFLEXA: { item: 'New G/L line items replaced by the Universal Journal', replacement: 'ACDOCA', cds: 'I_JOURNALENTRYITEM' },
  COEP: { item: 'CO line items replaced by the Universal Journal', replacement: 'ACDOCA', cds: 'I_JOURNALENTRYITEM' },
  COSP: { item: 'CO totals replaced by the Universal Journal', replacement: 'ACDOCA', cds: 'I_JOURNALENTRYITEM' },
  COSS: { item: 'CO totals replaced by the Universal Journal', replacement: 'ACDOCA', cds: 'I_JOURNALENTRYITEM' },
  ANEP: { item: 'Asset Accounting line items moved to the Universal Journal', replacement: 'ACDOCA' },
  ANEA: { item: 'Asset Accounting line items moved to the Universal Journal', replacement: 'ACDOCA' },
  ANLC: { item: 'Asset Accounting totals moved to the Universal Journal', replacement: 'ACDOCA' },
  ANLP: { item: 'Asset Accounting period values moved to the Universal Journal', replacement: 'ACDOCA' },
  CKMLCR: { item: 'Material Ledger data model moved to MLDOC / ACDOCA', replacement: 'MLDOC' },
  MLIT: { item: 'Material Ledger data model moved to MLDOC / ACDOCA', replacement: 'MLDOC' },
  S001: { item: 'LIS statistics tables no longer updated (use CDS-based analytics)', replacement: 'VBAP' },
  S012: { item: 'LIS statistics tables no longer updated (use CDS-based analytics)', replacement: 'EKPO' },
  S031: { item: 'LIS statistics tables no longer updated (use CDS-based analytics)', replacement: 'MATDOC' },
  S032: { item: 'LIS statistics tables no longer updated (use CDS-based analytics)', replacement: 'MATDOC' },
  KNVK: { item: 'Customer contact persons replaced by Business Partner relationships', replacement: 'BUT050' }
};
const SIMPL_TABLES = Object.keys(SIMPLIFICATION);

export type SelectFinding = { unit: string; master: string; line: number; stmt: string; tables: string[]; target: string; issues: string[]; score: number; where: string };
type DbWrite = { op: string; table: string; line: number };
type UnitScan = { unit: Unit; stmts: Stmt[]; selects: SelectFinding[]; nestedLoops: number; stdWrites: DbWrite[]; forms: string[]; methods: string[]; score: number };
const writeText = (w: DbWrite) => `${w.op} ${w.table} (line ${w.line})`;

// Keeps only write statements whose target is a real SAP transparent table (checked live in DD02L).
async function verifySapWrites(scans: UnitScan[]): Promise<void> {
  const names = [...new Set(scans.flatMap(s => s.stdWrites.map(w => w.table)))];
  const real = new Set<string>();
  for (let i = 0; i < names.length; i += 150) {
    const r = await q(`SELECT TABNAME FROM DD02L WHERE AS4LOCAL = 'A' AND TABCLASS = 'TRANSP' AND TABNAME IN ( ${inList(names.slice(i, i + 150))} )`, 200);
    r.rows.forEach(x => real.add(x.TABNAME));
  }
  for (const s of scans) { s.stdWrites = s.stdWrites.filter(w => real.has(w.table)); s.score += s.stdWrites.length * 4; }
}

const KEY_NUM_FIELD = /\b(KUNNR|LIFNR|VBELN|MATNR|AUFNR|EBELN|BELNR|DOCNUM|PARTNER|PERNR|QMNUM|EQUNR)\b\s*(?:=|EQ)\s*'(\d{1,9})'/i;
function scanUnit(unit: Unit): UnitScan {
  const stmts = splitStatements(unit.source);
  const selects: SelectFinding[] = [];
  let depth = 0; let nestedLoops = 0; const stdWrites: DbWrite[] = [];
  for (let i = 0; i < stmts.length; i++) {
    const s = stmts[i]; const up = s.up;
    if (/^(FORM|METHOD|ENDFORM|ENDMETHOD|FUNCTION|ENDFUNCTION)\b/.test(up)) { depth = 0; continue; }
    if (/^(LOOP\b|DO\b|WHILE\b)/.test(up)) { if (depth > 0 && /^LOOP\b/.test(up)) nestedLoops++; depth++; continue; }
    if (/^(ENDLOOP|ENDDO|ENDWHILE|ENDSELECT)\b/.test(up)) { depth = Math.max(0, depth - 1); continue; }
    const w = /^(UPDATE|MODIFY|INSERT|DELETE)\s+(?:FROM\s+|INTO\s+)?([A-Z][A-Z0-9_\/]{2,29})\b/.exec(up);
    if (w && !/^(Z|Y|LT_|GT_|LS_|GS_|IT_|ET_|CT_|WA_|L_|G_|MT_|T_)/.test(w[2]) && /\b(FROM|SET|VALUES|WHERE)\b/.test(up) && !/\bTABLE\s+@?[A-Z_]+\s*$/.test(up.split(/\bFROM\b/)[0] || '')) {
      if (!/INTO\s+TABLE|\bINDEX\b|TRANSPORTING/.test(up)) stdWrites.push({ op: w[1], table: w[2], line: s.line });
    }
    if (!/^SELECT\s/.test(up) && !/^OPEN CURSOR\b/.test(up)) continue;
    const tables = [...new Set([...up.matchAll(/\b(?:FROM|JOIN)\s+([A-Z][A-Z0-9_\/]{1,29})\b/g)].map(m => m[1]))].filter(t => !['TABLE', 'SELECT'].includes(t));
    const target = (/\b(?:INTO|APPENDING)\s+(?:CORRESPONDING\s+FIELDS\s+OF\s+)?(?:TABLE\s+)?@?(DATA\(\s*(\w+)\s*\)|[\w\-~>]+)/.exec(up) || [])[2] || (/\b(?:INTO|APPENDING)\s+(?:CORRESPONDING\s+FIELDS\s+OF\s+)?(?:TABLE\s+)?@?([\w\-~>]+)/.exec(up) || [])[1] || '';
    const intoTable = /\b(INTO|APPENDING)\s+(CORRESPONDING\s+FIELDS\s+OF\s+)?TABLE\b/.test(up);
    const single = /^SELECT\s+SINGLE\b/.test(up);
    const upTo = /\bUP\s+TO\s+\d+\s+ROWS\b/.test(up);
    const aggregateOnly = /^SELECT\s+(SINGLE\s+)?(COUNT|MAX|MIN|SUM|AVG)\s*\(/.test(up);
    const issues: string[] = []; let score = 0;
    if (depth > 0) { issues.push('Executed inside a LOOP/DO/SELECT loop (one database round-trip per iteration)'); score += 3; }
    const selectLoop = !intoTable && !single && !aggregateOnly && !/^OPEN CURSOR/.test(up) && stmts.slice(i + 1, i + 40).some(x => /^ENDSELECT\b/.test(x.up));
    if (selectLoop) { issues.push('SELECT … ENDSELECT loop (row-by-row fetch)'); score += 2; }
    if (!/\bWHERE\b/.test(up) && !single && !upTo && !aggregateOnly) { issues.push('No WHERE clause (reads the whole table)'); score += 3; }
    if (/^SELECT\s+(SINGLE\s+)?\*/.test(up)) { issues.push('SELECT * (all columns transferred)'); score += 1; }
    const fae = /FOR ALL ENTRIES IN\s+@?([\w\-]+)/.exec(up);
    if (fae) {
      const drv = fae[1].replace(/[-\[].*$/, '');
      const guarded = stmts.slice(Math.max(0, i - 8), i).some(x => x.up.includes(drv) && /(IS NOT INITIAL|IS INITIAL|LINES\s*\(|CHECK\b)/.test(x.up));
      if (!guarded) { issues.push(`FOR ALL ENTRIES on ${drv} without an empty-table check (empty driver reads ALL rows)`); score += 3; }
    }
    const simpl = tables.filter(t => SIMPLIFICATION[t]);
    if (simpl.length) { issues.push(`Reads S/4HANA simplification table ${simpl.join(', ')}`); score += 2; }
    if (/BYPASSING BUFFER/.test(up)) { issues.push('BYPASSING BUFFER'); score += 1; }
    if (tables.length >= 3) issues.push(`Joins ${tables.length} tables (${tables.join(', ')})`);
    const lit = KEY_NUM_FIELD.exec(up);
    if (lit) { issues.push(`Compares ${lit[1]} with literal '${lit[2]}' without leading zeros (internal format needs ALPHA conversion)`); score += 2; }
    if (!aggregateOnly && !selectLoop) {
      const next = stmts.slice(i + 1, i + 4).map(x => x.up).join(' ');
      const tv = target.toUpperCase();
      if (!/SY-SUBRC|IS INITIAL|IS NOT INITIAL|LINES\s*\(/.test(next) && !(tv && next.includes(tv))) { issues.push('Result not checked (no SY-SUBRC / initial check right after the SELECT)'); score += 1; }
    }
    const where = (/\bWHERE\b([\s\S]*?)(\bORDER BY\b|\bGROUP BY\b|\bINTO\b|\bUP TO\b|$)/.exec(up) || [])[1]?.trim() || '';
    selects.push({ unit: unit.name, master: unit.master, line: s.line, stmt: s.text, tables, target, issues, score, where });
  }
  const forms = stmts.filter(s => /^FORM\s/.test(s.up)).map(s => s.text.split(/\s+/)[1]);
  const methods = stmts.filter(s => /^METHOD\s/.test(s.up)).map(s => s.text.split(/\s+/)[1]);
  const score = selects.reduce((a, s) => a + s.score, 0) + nestedLoops * 3;
  return { unit, stmts, selects, nestedLoops, stdWrites, forms, methods, score };
}

// ---------- dumps ----------
function parseFlist(flist: string): Record<string, string> {
  const out: Record<string, string> = {};
  let i = 0;
  while (i + 5 <= flist.length) {
    const key = flist.slice(i, i + 2); const len = Number(flist.slice(i + 2, i + 5));
    if (!/^[A-Z0-9]{2}$/.test(key) || Number.isNaN(len)) break;
    if (!(key in out)) out[key] = flist.slice(i + 5, i + 5 + len);
    i += 5 + len;
  }
  return out;
}
type Dump = { date: string; time: string; user: string; host: string; error: string; exception: string; program: string; include: string; line: number };
async function dumps(fromDate: string, maxRows = 2000): Promise<{ list: Dump[]; error?: string }> {
  const r = await q(`SELECT DATUM, UZEIT, UNAME, AHOST, FLIST FROM SNAP_BEG WHERE SEQNO = '000' AND DATUM >= '${fromDate}' ORDER BY DATUM DESCENDING, UZEIT DESCENDING`, maxRows);
  return {
    list: r.rows.map(x => { const f = parseFlist(x.FLIST || ''); return { date: x.DATUM, time: x.UZEIT, user: x.UNAME, host: x.AHOST, error: f.FC || '(unknown)', exception: f.XC || '', program: f.AP || '', include: f.AI || '', line: num(f.AL) }; }),
    error: r.error
  };
}
const dumpIsCustom = (d: Dump) => isCustom(d.program) || isCustom(d.include);
const dumpTs = (d: Dump) => `${fmtD(d.date)} ${fmtT(d.time)}`;

// Real source lines around the failing line of a dump (program include, FM include or class method).
async function sourceAround(d: Dump, before = 12, after = 6): Promise<{ rows: { line: number; marker: string; code: string }[]; object: string; context: string } | null> {
  if (!d.include || !d.line) return null;
  let lines: string[] | null = null; let offset = 0; let object = d.include;
  const cm = /^(.+?)=*CM([0-9A-Z]{3})$/.exec(d.include);
  if (cm) {
    const idx = parseInt(cm[2], 36);
    const t = await q(`SELECT METHODNAME FROM TMDIR WHERE CLASSNAME = '${cm[1]}' AND METHODINDX = ${idx}`, 1);
    const meth = t.rows[0]?.METHODNAME;
    const src = meth ? await adtGet(`/sap/bc/adt/oo/classes/${enc(cm[1])}/source/main`) : null;
    if (!src || !meth) return null;
    lines = src.split(/\r?\n/);
    const start = lines.findIndex(l => new RegExp(`^\\s*METHOD\\s+${meth.replace(/[~\/]/g, m => `\\${m}`)}\\s*\\.`, 'i').test(l));
    if (start < 0) return null;
    offset = start; object = `${cm[1]}->${meth}`;
  } else {
    const src = await adtGet(`/sap/bc/adt/programs/includes/${enc(d.include)}/source/main`) ?? (d.include === d.program ? await adtGet(`/sap/bc/adt/programs/programs/${enc(d.program)}/source/main`) : null);
    if (!src) return null;
    lines = src.split(/\r?\n/);
  }
  const target = offset + d.line - 1;
  if (target < 0 || target >= lines.length) return null;
  const rows = [];
  for (let i = Math.max(0, target - before); i <= Math.min(lines.length - 1, target + after); i++) rows.push({ line: i - offset + 1, marker: i === target ? '>>>>>' : '', code: lines[i].replace(/\s+$/, '') || ' ' });
  const context = lines.slice(Math.max(0, target - 40), Math.min(lines.length, target + 15)).map((l, k) => `${Math.max(0, target - 40) + k - offset + 1}${Math.max(0, target - 40) + k === target ? ' >>>>>' : ''}  ${l}`).join('\n');
  return { rows, object, context };
}

function groupDumps(list: Dump[]) {
  const m = new Map<string, { error: string; program: string; count: number; users: Set<string>; first: string; last: string }>();
  for (const d of list) {
    const k = `${d.error}|${d.program}`;
    const e = m.get(k) || { error: d.error, program: d.program, count: 0, users: new Set<string>(), first: `${d.date}${d.time}`, last: `${d.date}${d.time}` };
    e.count++; e.users.add(d.user);
    const ts = `${d.date}${d.time}`; if (ts < e.first) e.first = ts; if (ts > e.last) e.last = ts;
    m.set(k, e);
  }
  return [...m.values()].sort((a, b) => b.count - a.count).map(e => ({
    error: e.error, program: e.program, count: e.count, users: e.users.size,
    firstSeen: `${fmtD(e.first.slice(0, 8))} ${fmtT(e.first.slice(8))}`, lastSeen: `${fmtD(e.last.slice(0, 8))} ${fmtT(e.last.slice(8))}`
  }));
}
const DUMP_GROUP_COLS = cols(['error', 'Runtime Error'], ['program', 'Program'], ['count', 'Dumps'], ['users', 'Users Affected'], ['firstSeen', 'First Seen'], ['lastSeen', 'Last Seen']);
const SRC_COLS = cols(['line', 'Line'], ['marker', ''], ['code', 'Source Code']);

// ---------- S/4HANA simplification usage ----------
type SimplUse = { master: string; tables: string[] };
async function simplificationUsage(): Promise<{ uses: SimplUse[]; tableStats: Map<string, { rows: number | null; tabclass: string; viewref: string; replacementExists: boolean; cdsExists: boolean }>; error?: string }> {
  const r = await q(`SELECT A~MASTER, A~TABNAME FROM D010TAB AS A WHERE A~TABNAME IN ( ${inList(SIMPL_TABLES)} ) AND ${CUSTOM_MASTER} ORDER BY A~MASTER`, 3000);
  const byMaster = new Map<string, Set<string>>();
  r.rows.forEach(x => { const s = byMaster.get(x.MASTER) || new Set<string>(); s.add(x.TABNAME); byMaster.set(x.MASTER, s); });
  const used = [...new Set(r.rows.map(x => x.TABNAME))];
  const replacements = [...new Set(used.map(t => SIMPLIFICATION[t].replacement))];
  const cdsNames = [...new Set(used.map(t => SIMPLIFICATION[t].cds).filter(Boolean) as string[])];
  const [dd, rep, cds, counts] = await Promise.all([
    used.length ? q(`SELECT TABNAME, TABCLASS, VIEWREF FROM DD02L WHERE AS4LOCAL = 'A' AND TABNAME IN ( ${inList(used)} )`, 100) : Promise.resolve({ rows: [], total: 0 } as Q),
    replacements.length ? q(`SELECT TABNAME FROM DD02L WHERE AS4LOCAL = 'A' AND TABNAME IN ( ${inList(replacements)} )`, 100) : Promise.resolve({ rows: [], total: 0 } as Q),
    cdsNames.length ? q(`SELECT DDLNAME FROM DDDDLSRC WHERE AS4LOCAL = 'A' AND DDLNAME IN ( ${inList(cdsNames)} )`, 100) : Promise.resolve({ rows: [], total: 0 } as Q),
    Promise.all(used.map(async t => ({ t, r: await q(`SELECT COUNT( * ) AS N FROM ${t}`, 1) })))
  ]);
  const tableStats = new Map<string, { rows: number | null; tabclass: string; viewref: string; replacementExists: boolean; cdsExists: boolean }>();
  for (const t of used) {
    const d = dd.rows.find(x => x.TABNAME === t);
    const c = counts.find(x => x.t === t);
    tableStats.set(t, {
      rows: c && !c.r.error ? num(c.r.rows[0]?.N) : null, tabclass: d?.TABCLASS || '', viewref: d?.VIEWREF || '',
      replacementExists: rep.rows.some(x => x.TABNAME === SIMPLIFICATION[t].replacement),
      cdsExists: !!SIMPLIFICATION[t].cds && cds.rows.some(x => x.DDLNAME === SIMPLIFICATION[t].cds)
    });
  }
  return { uses: [...byMaster.entries()].map(([master, s]) => ({ master, tables: [...s].sort() })), tableStats, error: r.error };
}
type TableStat = { rows: number | null; tabclass: string; viewref: string; replacementExists: boolean; cdsExists: boolean };
function impactOf(t: string, st?: TableStat): { level: 'Breaks' | 'Degraded' | 'Redesign'; text: string } {
  if (!st) return { level: 'Redesign', text: 'Not checked' };
  if (st.rows === 0) return { level: 'Breaks', text: `${t} holds 0 rows in this S/4HANA system — reads return nothing and writes are lost` };
  if (st.viewref) return { level: 'Degraded', text: `Redirected at runtime to compatibility view ${st.viewref} (works, slower; writes not allowed)` };
  if (st.tabclass === 'VIEW') return { level: 'Degraded', text: `${t} is now a compatibility view over the new data model (read-only)` };
  return { level: 'Redesign', text: `${t} still holds ${st.rows ?? '?'} rows but is superseded by ${SIMPLIFICATION[t].replacement}` };
}
const LEVEL_RANK = { Breaks: 3, Degraded: 2, Redesign: 1 } as const;

// ---------- intent builders ----------
export async function buildAbapLiveReport(intent: AbapLiveIntent, query: string): Promise<AbapLiveReport> {
  const today = await sysDate();
  const d7 = addDays(today, -7); const d30 = addDays(today, -30);
  const named = namedObject(query);

  switch (intent) {
    case 'EXPLAIN_RECENT': {
      const rec = await recentCustomPrograms(10, ['1']);
      let picked: ProgInfo | null = null; let units: Unit[] = [];
      for (const p of rec.list) { units = await fetchUnits(p.name); if (units.length) { picked = p; break; } }
      if (!picked) return { text: `No program was named and no recently changed custom executable program with readable source was found. ${errNote(rec.error)}`, sections: [], assess: false };
      const [title, tadir, d010] = await Promise.all([
        q(`SELECT SPRSL, TEXT FROM TRDIRT WHERE NAME = '${picked.name}'`, 20),
        q(`SELECT DEVCLASS FROM TADIR WHERE PGMID = 'R3TR' AND OBJECT = 'PROG' AND OBJ_NAME = '${picked.name}'`, 1),
        q(`SELECT A~TABNAME, B~DDTEXT FROM D010TAB AS A LEFT OUTER JOIN DD02T AS B ON A~TABNAME = B~TABNAME AND B~DDLANGUAGE = 'E' WHERE A~MASTER = '${picked.name}' ORDER BY A~TABNAME`, 200)
      ]);
      const scans = units.map(scanUnit);
      await verifySapWrites(scans);
      const stmts = scans.flatMap(s => s.stmts);
      const params = stmts.filter(s => /^(PARAMETERS|SELECT-OPTIONS)\b/.test(s.up)).map(s => s.text.replace(/^(PARAMETERS|SELECT-OPTIONS)\s*:?\s*/i, '').split(/\s+/)[0]);
      const fms = [...new Set(stmts.map(s => (/^CALL FUNCTION\s+'([^']+)'/.exec(s.up) || [])[1]).filter(Boolean) as string[])];
      const writes = scans.flatMap(s => s.stdWrites.map(writeText)).concat(stmts.filter(s => /^(UPDATE|MODIFY|INSERT|DELETE)\s+(FROM\s+)?[ZY]/.test(s.up) && /\b(FROM|SET|VALUES|WHERE)\b/.test(s.up)).map(s => `${s.text.split(/\s+/).slice(0, 3).join(' ')} (line ${s.line})`));
      const selects = scans.flatMap(s => s.selects);
      const lines = units.reduce((a, u) => a + u.source.split(/\r?\n/).length, 0);
      const t = (title.rows.find(x => x.SPRSL === 'E') || title.rows[0])?.TEXT || '';
      return {
        text: `No program name was given, so the most recently changed custom executable program was analysed: ${picked.name}${t ? ` ("${t}")` : ''}, changed by ${picked.unam} on ${fmtD(picked.udat)} (package ${tadir.rows[0]?.DEVCLASS || 'n/a'}). Its live source has ${lines} lines, ${selects.length} SELECT statement(s), ${scans.reduce((a, s) => a + s.forms.length, 0)} FORM routine(s) and ${scans.reduce((a, s) => a + s.methods.length, 0)} method(s); it reads ${d010.rows.length} table(s)${params.length ? ` and takes selection inputs ${params.join(', ')}` : ''}. Name a program (e.g. "Explain what program ${rec.list[1]?.name || picked.name} does") to analyse another one.`,
        sections: [
          { title: `Program Facts — ${picked.name}`, columns: cols(['field', 'Attribute'], ['value', 'Value']), rows: [
            { field: 'Title', value: t || '—' }, { field: 'Type', value: SUBC_TEXT[picked.subc] || picked.subc }, { field: 'Package', value: tadir.rows[0]?.DEVCLASS || '—' },
            { field: 'Created', value: `${fmtD(picked.cdat)} by ${picked.cnam}` }, { field: 'Last changed', value: `${fmtD(picked.udat)} by ${picked.unam}` },
            { field: 'Source units read', value: units.map(u => u.name).join(', ') }, { field: 'Source lines', value: lines },
            { field: 'Selection inputs', value: params.join(', ') || '—' }, { field: 'FORM routines / methods', value: [...scans.flatMap(s => s.forms), ...scans.flatMap(s => s.methods)].join(', ') || '—' },
            { field: 'Function modules called', value: fms.join(', ') || '—' }, { field: 'Database writes', value: writes.join('; ') || 'None found' }
          ], note: 'Source read live via ADT (/source/main); attributes from PROGDIR, TRDIRT and TADIR.' },
          { title: `Tables Used by ${picked.name} (D010TAB)`, columns: cols(['table', 'Table'], ['description', 'Description']), rows: d010.rows.map(x => ({ table: x.TABNAME, description: x.DDTEXT || '' })), note: 'Tables the ABAP compiler recorded for this program (where-used index D010TAB).' },
          { title: 'Other Recently Changed Custom Programs', columns: cols(['program', 'Program'], ['changedBy', 'Changed By'], ['changedOn', 'Changed On']), rows: rec.list.filter(p => p.name !== picked!.name).map(p => ({ program: p.name, changedBy: p.unam, changedOn: fmtD(p.udat) })), note: 'Ask "Explain what program <name> does" for any of these.' }
        ],
        assess: true,
        persona: 'You are a senior SAP ABAP developer. Explain in plain English what this real program does: its business purpose, inputs, main processing steps (name the real tables, routines and function modules), and outputs/updates. Use 5-8 short sentences or bullets. Only describe what the source shows.',
        context: units.map(u => `* ===== ${u.name} =====\n${u.source}`).join('\n').slice(0, 18000)
      };
    }

    case 'TABLE_UPDATERS': {
      const r = await q(`SELECT A~MASTER, B~TABNAME FROM D010TAB AS A INNER JOIN DD02L AS B ON A~TABNAME = B~TABNAME WHERE B~AS4LOCAL = 'A' AND B~TABCLASS = 'TRANSP' AND ( B~TABNAME LIKE 'Z%' OR B~TABNAME LIKE 'Y%' ) AND ${CUSTOM_MASTER}`, 5000);
      const byTable = new Map<string, Set<string>>();
      r.rows.forEach(x => { const s = byTable.get(x.TABNAME) || new Set<string>(); s.add(x.MASTER); byTable.set(x.TABNAME, s); });
      const ranked = [...byTable.entries()].sort((a, b) => b[1].size - a[1].size);
      const masters: string[] = [];
      for (const [, s] of ranked) for (const m of s) if (!masters.includes(m) && masters.length < 24) masters.push(m);
      const fetched = await inBatches(masters, 6, async m => ({ m, units: await fetchUnits(m) }));
      const hits: Record<string, string | number>[] = [];
      for (const f of fetched) for (const u of f.units) for (const s of splitStatements(u.source)) {
        const w = /^(UPDATE|MODIFY|INSERT|DELETE)\s+(?:FROM\s+|INTO\s+)?([ZY][A-Z0-9_]{1,29})\b/.exec(s.up);
        if (w && byTable.has(w[2]) && (byTable.get(w[2])!.has(f.m))) hits.push({ table: w[2], program: f.m, unit: u.name, operation: w[1], line: s.line, statement: clip(s.text, 140) });
      }
      const tablesWritten = new Set(hits.map(h => h.table));
      const texts = await q(`SELECT TABNAME, DDTEXT FROM DD02T WHERE DDLANGUAGE = 'E' AND TABNAME IN ( ${inList(ranked.slice(0, 40).map(x => x[0]))} )`, 100);
      return {
        text: `No table was named, so all custom (Z/Y) transparent tables were checked. ${byTable.size} custom tables are used by custom programs (D010TAB). The live source of the ${fetched.filter(f => f.units.length).length} programs using the most-shared tables was scanned: ${hits.length} database write statement(s) found on ${tablesWritten.size} table(s)${hits[0] ? `, e.g. ${hits.slice(0, 3).map(h => `${h.program} ${h.operation} ${h.table} (line ${h.line})`).join('; ')}` : ''}. Name a table (e.g. "Which programs update table ${ranked[0]?.[0] || 'Z…'}?") for a full where-used check.`,
        sections: [
          { title: 'Programs Writing to Custom Tables (from live source)', summaryStats: [{ label: 'Write statements', value: String(hits.length) }, { label: 'Tables written', value: String(tablesWritten.size) }, { label: 'Programs scanned', value: String(fetched.filter(f => f.units.length).length) }], columns: cols(['table', 'Custom Table'], ['program', 'Program'], ['unit', 'Source Unit'], ['operation', 'Operation'], ['line', 'Line'], ['statement', 'Statement']), rows: hits, note: 'UPDATE / MODIFY / INSERT / DELETE statements on the custom table, read from the real ADT source of each program.' },
          { title: 'Custom Tables and the Programs Using Them (D010TAB)', columns: cols(['table', 'Custom Table'], ['description', 'Description'], ['programs', 'Programs Using It'], ['written', 'Write Found in Scan']), rows: ranked.slice(0, 40).map(([t, s]) => ({ table: t, description: texts.rows.find(x => x.TABNAME === t)?.DDTEXT || '', programs: s.size, written: tablesWritten.has(t) ? 'Yes' : '' })), note: `D010TAB records every table a program references (read or write). ${errNote(r.error)}` }
        ],
        assess: false
      };
    }

    case 'CUSTOM_TABLES': {
      const t = await q("SELECT A~TABNAME, A~CONTFLAG, A~AS4USER, A~AS4DATE, B~DDTEXT FROM DD02L AS A LEFT OUTER JOIN DD02T AS B ON A~TABNAME = B~TABNAME AND B~AS4LOCAL = A~AS4LOCAL AND B~DDLANGUAGE = 'E' WHERE A~AS4LOCAL = 'A' AND A~TABCLASS = 'TRANSP' AND ( A~TABNAME LIKE 'Z%' OR A~TABNAME LIKE 'Y%' ) ORDER BY A~AS4DATE DESCENDING, A~TABNAME", 3000);
      const names = [...new Set(t.rows.map(x => x.TABNAME))];
      const [pkg, use, counts] = await Promise.all([
        names.length ? q("SELECT OBJ_NAME, DEVCLASS FROM TADIR WHERE PGMID = 'R3TR' AND OBJECT = 'TABL' AND ( OBJ_NAME LIKE 'Z%' OR OBJ_NAME LIKE 'Y%' )", 5000) : Promise.resolve({ rows: [], total: 0 } as Q),
        names.length ? q(`SELECT A~TABNAME, COUNT( DISTINCT A~MASTER ) AS PROGS FROM D010TAB AS A WHERE ( A~TABNAME LIKE 'Z%' OR A~TABNAME LIKE 'Y%' ) GROUP BY A~TABNAME`, 5000) : Promise.resolve({ rows: [], total: 0 } as Q),
        inBatches(names, 12, async n => ({ n, r: await q(`SELECT COUNT( * ) AS N FROM ${n}`, 1) }))
      ]);
      const DELIVERY: Record<string, string> = { A: 'Application', C: 'Customizing', L: 'Temporary', G: 'Customizing (protected)', E: 'Control', S: 'System', W: 'System (transport)' };
      const seen = new Set<string>();
      const rows = t.rows.filter(x => !seen.has(x.TABNAME) && seen.add(x.TABNAME)).map(x => {
        const c = counts.find(k => k.n === x.TABNAME);
        return { table: x.TABNAME, description: x.DDTEXT || '', delivery: DELIVERY[x.CONTFLAG] || x.CONTFLAG, package: pkg.rows.find(p => p.OBJ_NAME === x.TABNAME)?.DEVCLASS || '', rows: c && !c.r.error ? num(c.r.rows[0]?.N) : '', programs: num(use.rows.find(u => u.TABNAME === x.TABNAME)?.PROGS), changedBy: x.AS4USER, changedOn: fmtD(x.AS4DATE) };
      });
      const withData = rows.filter(r => typeof r.rows === 'number' && r.rows > 0).length;
      const unused = rows.filter(r => !r.programs).length;
      const biggest = [...rows].filter(r => typeof r.rows === 'number').sort((a, b) => (b.rows as number) - (a.rows as number)).slice(0, 3);
      return {
        text: rows.length
          ? `${rows.length} custom (Z/Y) database tables exist in this S/4HANA system: ${withData} contain data, ${rows.length - withData} are empty, and ${unused} are not referenced by any program. Largest: ${biggest.map(b => `${b.table} (${b.rows} rows)`).join(', ')}. Most recently changed: ${rows.slice(0, 3).map(r => `${r.table} (${r.changedOn}, ${r.changedBy})`).join(', ')}.`
          : `No custom (Z/Y) transparent tables exist in this system. ${errNote(t.error)}`,
        sections: [{ title: 'Custom Database Tables (Z/Y)', summaryStats: [{ label: 'Custom tables', value: String(rows.length) }, { label: 'With data', value: String(withData) }, { label: 'Empty', value: String(rows.length - withData) }, { label: 'Not used by any program', value: String(unused) }], columns: cols(['table', 'Table'], ['description', 'Description'], ['delivery', 'Delivery Class'], ['package', 'Package'], ['rows', 'Rows'], ['programs', 'Programs Using It'], ['changedBy', 'Last Changed By'], ['changedOn', 'Last Changed On']), rows, note: `Active transparent tables Z*/Y* from the data dictionary (DD02L/DD02T), packages from TADIR, program usage from D010TAB and row counts (client 100 for client-dependent tables) read live. ${errNote(t.error, pkg.error, use.error)}` }],
        assess: false
      };
    }

    case 'DUPLICATES': {
      const { units, programs, error } = await recentUnits(20);
      const norm = (s: Stmt) => s.up.replace(/'[^']*'/g, "'?'").replace(/\b\d+\b/g, '0').replace(/\s+/g, ' ');
      const trivial = /^(DATA|TYPES|CONSTANTS|ENDIF|ENDLOOP|ENDDO|ENDFORM|ENDMETHOD|ENDCLASS|ELSE|ENDCASE|ENDTRY|ENDSELECT|CLEAR|REFRESH|FREE|FIELD-SYMBOLS|TABLES|WRITE|SKIP|ULINE|NEW-LINE|FORMAT|INCLUDE|REPORT|PUBLIC|PRIVATE|PROTECTED|CLASS|METHODS|START-OF-SELECTION|END-OF-SELECTION|INITIALIZATION|AT SELECTION-SCREEN)\b/;
      const WIN = 5;
      const windows = new Map<string, { unit: string; master: string; line: number; sample: string }[]>();
      for (const u of units) {
        const st = splitStatements(u.source).filter(s => !trivial.test(s.up) && s.up.split(' ').length >= 3);
        for (let i = 0; i + WIN <= st.length; i++) {
          const key = st.slice(i, i + WIN).map(norm).join(' | ');
          const arr = windows.get(key) || [];
          if (!arr.some(a => a.master === u.master)) arr.push({ unit: u.name, master: u.master, line: st[i].line, sample: st[i].text });
          windows.set(key, arr);
        }
      }
      const pairs = new Map<string, { a: string; b: string; lineA: number; lineB: number; windows: number; sample: string }>();
      for (const occ of windows.values()) {
        if (occ.length < 2) continue;
        for (let i = 0; i < occ.length; i++) for (let j = i + 1; j < occ.length; j++) {
          const [x, y] = [occ[i], occ[j]].sort((p, r) => p.master.localeCompare(r.master));
          const k = `${x.master}|${y.master}`;
          const e = pairs.get(k) || { a: x.unit, b: y.unit, lineA: x.line, lineB: y.line, windows: 0, sample: x.sample };
          e.windows++; pairs.set(k, e);
        }
      }
      const rows = [...pairs.values()].sort((a, b) => b.windows - a.windows).map(p => ({ programA: p.a, lineA: p.lineA, programB: p.b, lineB: p.lineB, sharedStatements: p.windows + WIN - 1, firstShared: clip(p.sample, 120) }));
      const involved = new Set(rows.flatMap(r => [r.programA, r.programB]));
      return {
        text: rows.length
          ? `The live source of the ${programs.length} most recently changed custom programs was compared statement by statement (literals and numbers normalised). ${rows.length} program pair(s) share duplicated logic blocks (at least ${WIN} consecutive identical statements), involving ${involved.size} source units. Largest overlap: ${rows[0].programA} line ${rows[0].lineA} and ${rows[0].programB} line ${rows[0].lineB} (~${rows[0].sharedStatements} identical statements).`
          : `The live source of the ${programs.length} most recently changed custom programs was compared statement by statement; no block of ${WIN}+ identical consecutive statements is shared between programs. ${errNote(error)}`,
        sections: [{ title: 'Duplicated Logic Across Custom Programs (live source comparison)', summaryStats: [{ label: 'Programs compared', value: String(programs.length) }, { label: 'Program pairs with duplicates', value: String(rows.length) }], columns: cols(['programA', 'Program A'], ['lineA', 'Line in A'], ['programB', 'Program B'], ['lineB', 'Line in B'], ['sharedStatements', 'Identical Statements (approx.)'], ['firstShared', 'First Shared Statement']), rows: rows.slice(0, 100), note: `Compared: ${programs.map(p => p.name).join(', ')}. Declarations and block-end statements are ignored; string/number literals are normalised so copy-paste with changed constants is still detected.` }],
        assess: rows.length > 0,
        persona: 'You are a senior SAP ABAP developer. In 3-5 sentences, summarise where the duplicated logic is, what it likely does (from the first shared statement), and recommend how to consolidate it (shared class/method, function module or include). Use only the evidence.'
      };
    }

    case 'RISK': {
      const [simpl, dm, rec] = await Promise.all([simplificationUsage(), dumps(d30), recentCustomPrograms(40)]);
      const dumpBy = new Map<string, number>();
      dm.list.filter(dumpIsCustom).forEach(d => { const k = d.program; dumpBy.set(k, (dumpBy.get(k) || 0) + 1); });
      const candidates = [...new Set([...simpl.uses.map(u => u.master), ...dumpBy.keys(), ...rec.list.slice(0, 15).map(p => p.name)])].slice(0, 40);
      const info = await programInfo(candidates);
      const fetched = await inBatches(candidates, 6, async m => ({ m, scans: (await fetchUnits(m, false)).map(scanUnit) }));
      await verifySapWrites(fetched.flatMap(f => f.scans));
      const rows = fetched.map(f => {
        const st = simpl.uses.find(u => u.master === f.m)?.tables || [];
        const breaks = st.filter(t => impactOf(t, simpl.tableStats.get(t)).level === 'Breaks');
        const sel = f.scans.flatMap(s => s.selects);
        const loopSel = sel.filter(s => s.issues.some(i => i.startsWith('Executed inside'))).length;
        const noWhere = sel.filter(s => s.issues.some(i => i.startsWith('No WHERE'))).length;
        const fae = sel.filter(s => s.issues.some(i => i.startsWith('FOR ALL ENTRIES'))).length;
        const stdW = f.scans.flatMap(s => s.stdWrites).length;
        const dumpsN = dumpBy.get(f.m) || 0;
        const p = info.get(f.m);
        const recent = p && p.udat >= d30 ? 1 : 0;
        const score = dumpsN * 5 + breaks.length * 8 + (st.length - breaks.length) * 3 + loopSel * 3 + noWhere * 2 + fae * 3 + stdW * 5 + f.scans.reduce((a, s) => a + s.nestedLoops, 0) * 2 + recent * 2;
        return { program: f.m, type: SUBC_TEXT[p?.subc || ''] || p?.subc || '', changed: p ? `${fmtD(p.udat)} (${p.unam})` : '', dumps30d: dumpsN, simplTables: st.join(', ') || '—', breaksInS4: breaks.join(', ') || '—', selectInLoop: loopSel, noWhere, faeUnchecked: fae, stdTableWrites: stdW, score };
      }).filter(r => r.score > 0).sort((a, b) => b.score - a.score);
      return {
        text: rows.length
          ? `${rows.length} custom objects carry live risk signals. Highest risk: ${rows.slice(0, 3).map(r => `${r.program} (score ${r.score}: ${[r.dumps30d ? `${r.dumps30d} dumps in 30 days` : '', r.breaksInS4 !== '—' ? `reads ${r.breaksInS4} which is empty in S/4HANA` : '', r.simplTables !== '—' && r.breaksInS4 === '—' ? `uses ${r.simplTables}` : '', r.selectInLoop ? `${r.selectInLoop} SELECT-in-loop` : '', r.stdTableWrites ? `${r.stdTableWrites} direct writes to SAP tables` : ''].filter(Boolean).join(', ')})`).join('; ')}.`
          : `No custom object shows live risk signals (dumps, simplification-table use, or risky SQL patterns). ${errNote(simpl.error, dm.error)}`,
        sections: [{ title: 'Custom Object Risk Ranking (live signals)', summaryStats: [{ label: 'Objects assessed', value: String(fetched.length) }, { label: 'Objects at risk', value: String(rows.length) }, { label: 'Custom dumps (30d)', value: String([...dumpBy.values()].reduce((a, b) => a + b, 0)) }], columns: cols(['program', 'Object'], ['type', 'Type'], ['changed', 'Last Changed'], ['dumps30d', 'Dumps (30d)'], ['simplTables', 'Simplification Tables'], ['breaksInS4', 'Empty in S/4HANA'], ['selectInLoop', 'SELECT in Loop'], ['noWhere', 'SELECT w/o WHERE'], ['faeUnchecked', 'Unchecked FOR ALL ENTRIES'], ['stdTableWrites', 'Direct SAP Table Writes'], ['score', 'Risk Score']), rows: rows.slice(0, 60), note: 'Signals: runtime dumps from SNAP_BEG (30 days), S/4HANA simplification tables from D010TAB with live row counts, and SQL/write patterns from the real ADT source. Score = 5×dumps + 8×table empty in S/4 + 3×other simplification table + 3×SELECT-in-loop + 2×no-WHERE + 3×unchecked FAE + 5×SAP table write + 2×nested loop + 2 if changed in last 30 days.' }],
        assess: rows.length > 0,
        persona: 'You are a senior SAP ABAP architect. In 3-6 sentences, explain why the top objects are the highest risk (cite the concrete signals) and what to do first. Use only the evidence.'
      };
    }

    case 'DUMP_WHY': case 'DUMP_EXPLAIN': case 'DUMP_LINE': case 'DEFECT_FIX': {
      const dm = await dumps(d30);
      let list = dm.list;
      if (named) list = list.filter(d => d.program.includes(named) || d.include.includes(named));
      const custom = list.filter(dumpIsCustom);
      let target: Dump | undefined = intent === 'DUMP_EXPLAIN' ? list[0] : custom[0] || list[0];
      let pickReason = named ? `the latest dump for ${named}` : intent === 'DUMP_EXPLAIN' ? 'the most recent ST22 dump' : custom[0] ? 'the most recent dump raised in custom code' : 'the most recent dump';
      let src = target ? await sourceAround(target) : null;
      if (target && !src && intent !== 'DUMP_EXPLAIN') {
        // The latest dump's program no longer has readable source (deleted/generated) — use the latest one that does.
        const seen = new Set<string>();
        for (const d of [...custom, ...list]) {
          const k = `${d.include}|${d.line}`; if (seen.has(k) || seen.size >= 12) continue; seen.add(k);
          const s = await sourceAround(d);
          if (s) { pickReason = `the most recent ${dumpIsCustom(d) ? 'custom-code ' : ''}dump whose failing source is readable (the latest dump, ${target.error} in ${target.program}, has no readable source)`; target = d; src = s; break; }
        }
      }
      if (!target) return { text: `No runtime error (ST22 dump) was recorded in the last 30 days${named ? ` for ${named}` : ''}. ${errNote(dm.error)}`, sections: [], assess: false };
      const same = list.filter(d => d.error === target!.error && d.program === target!.program);
      const users = [...new Set(same.map(d => d.user))];
      const sections: AbapSection[] = [
        { title: `Dump Details — ${target.error}`, columns: cols(['field', 'Attribute'], ['value', 'Value']), rows: [
          { field: 'Runtime error', value: target.error }, { field: 'Exception class', value: target.exception || '—' }, { field: 'Program', value: target.program },
          { field: 'Include', value: target.include || '—' }, { field: 'Line', value: target.line || '—' }, { field: 'User', value: target.user },
          { field: 'Server', value: target.host }, { field: 'Occurred', value: dumpTs(target) },
          { field: 'Same error in this program (30d)', value: `${same.length} time(s), ${users.length} user(s), first ${dumpTs(same[same.length - 1])}` }
        ], note: `Selected ${pickReason}. Source: SNAP_BEG (ST22 dump index), read live.` }
      ];
      if (src) sections.push({ title: `Source at the Failing Line — ${src.object}`, columns: SRC_COLS, rows: src.rows, note: 'Real source read live via ADT; >>>>> marks the line recorded in the dump.' });
      sections.push({ title: 'All Dumps — Last 30 Days by Error and Program', columns: DUMP_GROUP_COLS, rows: groupDumps(list).slice(0, 30), note: `${list.length} dumps since ${fmtD(d30)}.` });
      const personas: Record<string, string> = {
        DUMP_WHY: 'You are a senior SAP ABAP developer. Explain why this program dumped: name the runtime error, exception class and the statement at the failing line, the most likely root cause shown by the code, and how to confirm it. 4-6 sentences.',
        DUMP_EXPLAIN: 'Explain this ST22 dump in plain English for a non-developer: what happened, where, who was affected, whether it keeps recurring, and what should happen next. Avoid jargon; 4-6 short sentences.',
        DUMP_LINE: 'You are a senior SAP ABAP developer. Identify the exact line and statement that caused the error (from the source marked >>>>>), explain what in that statement fails and why. 3-5 sentences.',
        DEFECT_FIX: 'You are a senior SAP ABAP developer. Recommend the SAFEST minimal fix for this defect: show the corrected ABAP for the failing statement(s) in a short abap code block, explain why it is low risk, and list 2-3 regression tests. Do not rewrite unrelated code.'
      };
      const lineTxt = src ? src.rows.find(r => r.marker)?.code.trim() : '';
      return {
        text: `${intent === 'DEFECT_FIX' ? 'The defect analysed is ' : ''}${pickReason[0].toUpperCase()}${pickReason.slice(1)}: ${target.error}${target.exception ? ` (${target.exception})` : ''} in ${target.program}${target.include ? `, include ${target.include}` : ''}${target.line ? ` line ${target.line}` : ''}, user ${target.user}, ${dumpTs(target)}. It occurred ${same.length} time(s) in the last 30 days.${lineTxt ? ` Failing statement: \`${clip(lineTxt, 160)}\`.` : ' The failing source could not be read (object deleted, generated or not authorised).'}`,
        sections, assess: true, persona: personas[intent],
        context: src ? `Source around the failing line of ${src.object}:\n${src.context}` : undefined
      };
    }

    case 'ST22_LIST': {
      const n = query.toLowerCase();
      const [from, to, label] = n.includes('yesterday') ? [addDays(today, -1), addDays(today, -1), 'yesterday'] : n.includes('today') ? [today, today, 'today'] : n.includes('month') ? [addDays(today, -30), today, 'in the last 30 days'] : [d7, today, 'in the last 7 days'];
      const dm = await dumps(from);
      let list = dm.list.filter(d => d.date <= to);
      if (named) list = list.filter(d => d.program.includes(named) || d.include.includes(named));
      const g = groupDumps(list);
      const custom = list.filter(dumpIsCustom).length;
      return {
        text: list.length
          ? `${list.length} ST22 dumps ${label}${named ? ` for ${named}` : ''} across ${g.length} error/program combination(s) and ${new Set(list.map(d => d.user)).size} user(s); ${custom} in custom code. Most frequent: ${g.slice(0, 3).map(x => `${x.error} in ${x.program} (${x.count}×)`).join('; ')}. Latest: ${list[0].error} in ${list[0].program} at ${dumpTs(list[0])} (user ${list[0].user}).`
          : `No ST22 dumps were recorded ${label}${named ? ` for ${named}` : ''}. ${errNote(dm.error)}`,
        sections: [
          { title: `ST22 Dumps ${label[0].toUpperCase()}${label.slice(1)} by Error and Program`, summaryStats: [{ label: 'Dumps', value: String(list.length) }, { label: 'Distinct errors', value: String(new Set(list.map(d => d.error)).size) }, { label: 'Custom code', value: String(custom) }], columns: DUMP_GROUP_COLS, rows: g, note: 'Source: SNAP_BEG (ST22 dump index), read live.' },
          { title: 'Dump List', columns: cols(['time', 'Date/Time'], ['error', 'Runtime Error'], ['exception', 'Exception'], ['program', 'Program'], ['include', 'Include'], ['line', 'Line'], ['user', 'User'], ['host', 'Server']), rows: list.slice(0, 200).map(d => ({ time: dumpTs(d), error: d.error, exception: d.exception, program: d.program, include: d.include, line: d.line || '', user: d.user, host: d.host })) }
        ],
        assess: false
      };
    }

    case 'PROGRAM_ERRORS': {
      const [dm, upd] = await Promise.all([
        dumps(d7),
        q(`SELECT VBREPORT, VBTCODE, VBUSR, VBDATE FROM VBHDR WHERE VBRC <> 0 ORDER BY VBDATE DESCENDING`, 500)
      ]);
      let list = dm.list;
      if (named) list = list.filter(d => d.program.includes(named) || d.include.includes(named));
      const byProg = new Map<string, { dumps: number; errors: Set<string>; last: string; users: Set<string> }>();
      list.forEach(d => { const e = byProg.get(d.program) || { dumps: 0, errors: new Set<string>(), last: '', users: new Set<string>() }; e.dumps++; e.errors.add(d.error); e.users.add(d.user); if (`${d.date}${d.time}` > e.last) e.last = `${d.date}${d.time}`; byProg.set(d.program, e); });
      const updRows = upd.rows.filter(x => !named || x.VBREPORT.includes(named));
      const updBy = new Map<string, number>(); updRows.forEach(x => updBy.set(x.VBREPORT, (updBy.get(x.VBREPORT) || 0) + 1));
      const rows = [...byProg.entries()].map(([p, e]) => ({ program: p, custom: isCustom(p) ? 'Yes' : '', dumps: e.dumps, errors: [...e.errors].join(', '), users: e.users.size, updateFailures: updBy.get(p) || 0, last: `${fmtD(e.last.slice(0, 8))} ${fmtT(e.last.slice(8))}` }))
        .sort((a, b) => (b.custom ? 1 : 0) - (a.custom ? 1 : 0) || b.dumps - a.dumps);
      return {
        text: list.length
          ? `${named ? `${named}: ` : 'No program was named, so errors for all programs are shown. '}${list.length} runtime errors (dumps) in the last 7 days across ${byProg.size} program(s)${rows.filter(r => r.custom).length ? `, ${rows.filter(r => r.custom).length} of them custom (${rows.filter(r => r.custom).slice(0, 3).map(r => `${r.program}: ${r.errors}`).join('; ')})` : ''}. Most recent: ${list[0].error} in ${list[0].program} at ${dumpTs(list[0])}. ${updRows.length} failed update request(s) are pending in SM13.`
          : `No runtime errors in the last 7 days${named ? ` for ${named}` : ''}. ${errNote(dm.error)}`,
        sections: [
          { title: `Recent Errors by Program — Last 7 Days${named ? ` (${named})` : ''}`, summaryStats: [{ label: 'Dumps', value: String(list.length) }, { label: 'Programs', value: String(byProg.size) }, { label: 'SM13 update failures', value: String(updRows.length) }], columns: cols(['program', 'Program'], ['custom', 'Custom'], ['dumps', 'Dumps'], ['errors', 'Runtime Errors'], ['users', 'Users'], ['updateFailures', 'Update Failures'], ['last', 'Last Error']), rows, note: 'Sources: SNAP_BEG (ST22) and VBHDR (SM13 update records with a non-zero return code), read live.' },
          { title: 'Latest Dumps', columns: cols(['time', 'Date/Time'], ['error', 'Runtime Error'], ['program', 'Program'], ['include', 'Include'], ['line', 'Line'], ['user', 'User']), rows: list.slice(0, 30).map(d => ({ time: dumpTs(d), error: d.error, program: d.program, include: d.include, line: d.line || '', user: d.user })) }
        ],
        assess: false
      };
    }

    case 'ITAB_EMPTY': case 'SELECT_NO_DATA': {
      let units: Unit[] = []; let picked = named || '';
      if (named) units = await fetchUnits(named);
      else {
        const rec = await recentCustomPrograms(15, ['1']);
        for (const p of rec.list) { const u = await fetchUnits(p.name); if (u.some(x => /^\s*SELECT\s/im.test(x.source))) { units = u; picked = p.name; break; } }
      }
      if (!units.length) return { text: `${named ? `No readable source was found for ${named}.` : 'No recently changed custom program with SELECT statements was found.'}`, sections: [], assess: false };
      const scans = units.map(scanUnit);
      const selects = scans.flatMap(s => s.selects);
      const allStmts = scans.flatMap(s => s.stmts.map(x => ({ ...x, unit: s.unit.name })));
      const rows = selects.map(s => {
        const tgt = s.target.toUpperCase();
        const later = tgt ? allStmts.filter(x => x.unit === s.unit && x.line > s.line && new RegExp(`^(REFRESH|CLEAR|FREE|DELETE)\\s+(TABLE\\s+)?${tgt.replace(/[^\w]/g, '')}\\b`).test(x.up)).map(x => `${x.up.split(' ')[0]} line ${x.line}`) : [];
        return { unit: s.unit, line: s.line, target: s.target || '—', tables: s.tables.join(', '), where: clip(s.where || '(none)', 120), clearedLater: later.join(', ') || '—', risks: s.issues.join('; ') || 'None detected' };
      });
      const risky = rows.filter(r => r.risks !== 'None detected' || r.clearedLater !== '—');
      return {
        text: `${named ? '' : `No program was named, so the most recently changed custom program with database reads was analysed: ${picked}. `}Its live source has ${selects.length} SELECT statement(s); ${risky.length} have patterns that can leave the result ${intent === 'ITAB_EMPTY' ? 'internal table empty' : 'empty'} (e.g. ${[...new Set(risky.flatMap(r => r.risks.split('; ')))].slice(0, 3).join('; ') || 'later CLEAR/REFRESH'}). Name the program (e.g. "... in ${picked}") to target another one.`,
        sections: [{ title: `${intent === 'ITAB_EMPTY' ? 'How Internal Tables Are Filled' : 'SELECT Statements Review'} — ${picked}`, summaryStats: [{ label: 'SELECT statements', value: String(selects.length) }, { label: 'With risks', value: String(risky.length) }], columns: cols(['unit', 'Source Unit'], ['line', 'Line'], ['target', 'Target'], ['tables', 'Tables'], ['where', 'WHERE Condition'], ['clearedLater', 'Cleared/Deleted Later'], ['risks', 'Findings']), rows, note: 'Static review of the real source read live via ADT. Actual runtime values require a debugger session; the findings show which conditions in the code can produce an empty result.' }],
        assess: true,
        persona: intent === 'ITAB_EMPTY'
          ? 'You are a senior SAP ABAP developer. Explain the most likely reasons an internal table in this real program ends up empty (restrictive WHERE, conversion-exit literals, missing FOR ALL ENTRIES guard, CLEAR/REFRESH/DELETE after filling, wrong join), citing real line numbers, and how to verify each in the debugger. 4-6 sentences.'
          : 'You are a senior SAP ABAP developer. Explain why the SELECT statements in this real program can return no data (WHERE values, ALPHA conversion, client/language, joins, empty FOR ALL ENTRIES driver, authorisation), citing real line numbers, and how to verify each. 4-6 sentences.',
        context: units.map(u => `* ===== ${u.name} =====\n${u.source}`).join('\n').slice(0, 16000)
      };
    }

    case 'BAPI_FAIL': {
      const [all51, rfc] = await Promise.all([
        q("SELECT A~DOCNUM, A~MESTYP, B~LOGDAT, B~STAMID, B~STAMNO, B~STATXT, B~STAPA1, B~STAPA2, B~STAPA3, B~STAPA4 FROM EDIDC AS A INNER JOIN EDIDS AS B ON A~DOCNUM = B~DOCNUM AND A~STATUS = B~STATUS WHERE A~STATUS = '51' ORDER BY B~LOGDAT DESCENDING", 3000),
        q("SELECT ARFCFNAM, ARFCSTATE, ARFCDEST, ARFCMSG, ARFCDATUM FROM ARFCSSTATE WHERE ARFCFNAM LIKE 'BAPI%' AND ARFCSTATE IN ( 'SYSFAIL', 'CPICERR' )", 500)
      ]);
      const types = [...new Set(all51.rows.map(x => x.MESTYP))];
      const map = types.length ? await q(`SELECT MESTYPE, OBJECTTYPE, METHOD, FNAME_INB FROM TBDBE WHERE MESTYPE IN ( ${inList(types.slice(0, 200))} )`, 500) : { rows: [], total: 0 } as Q;
      const objs = [...new Set(map.rows.map(x => x.OBJECTTYPE))];
      const bor = objs.length ? await q(`SELECT LOBJTYPE, VERB, ABAPNAME FROM SWOTLV WHERE LOBJTYPE IN ( ${inList(objs)} ) AND VERB IN ( ${inList([...new Set(map.rows.map(x => x.METHOD))])} )`, 500) : { rows: [], total: 0 } as Q;
      const err = { rows: all51.rows.filter(x => map.rows.some(m => m.MESTYPE === x.MESTYP)), error: all51.error };
      const msg = (x: Record<string, string>) => (x.STATXT || '').replace(/&(\d)/g, (_, k) => x[`STAPA${k}`] || '').replace(/&/g, '').trim();
      const g = new Map<string, { mestyp: string; message: string; count: number; last: string; sample: string; msgId: string }>();
      err.rows.forEach(x => { const k = `${x.MESTYP}|${x.STAMID}|${x.STAMNO}`; const e = g.get(k) || { mestyp: x.MESTYP, message: msg(x), count: 0, last: '', sample: x.DOCNUM, msgId: `${x.STAMID} ${x.STAMNO}` }; e.count++; if (x.LOGDAT > e.last) e.last = x.LOGDAT; g.set(k, e); });
      const rows = [...g.values()].sort((a, b) => b.count - a.count).map(e => { const m = map.rows.find(x => x.MESTYPE === e.mestyp); const fm = m ? bor.rows.find(b => b.LOBJTYPE === m.OBJECTTYPE && b.VERB === m.METHOD)?.ABAPNAME : ''; return { bapi: m ? `${fm || ''}${fm ? ' — ' : ''}${m.OBJECTTYPE}.${m.METHOD}` : '', mestyp: e.mestyp, inbound: m?.FNAME_INB || '', errors: e.count, message: e.message, msgId: e.msgId, lastError: fmtD(e.last), sampleIdoc: e.sample.replace(/^0+/, '') }; });
      return {
        text: rows.length || rfc.rows.length
          ? `${err.rows.length} BAPI calls received through ALE failed with IDoc status 51 (application error) across ${new Set(rows.map(r => r.bapi)).size} BAPI(s). Top failure: ${rows[0] ? `${rows[0].bapi} (message type ${rows[0].mestyp}) — "${rows[0].message}" (${rows[0].errors}×, last ${rows[0].lastError})` : 'n/a'}. ${rfc.rows.length} BAPI calls are stuck in tRFC (SM58).`
          : `No failed BAPI calls were found: no ALE BAPI IDocs in status 51 and no BAPI tRFC errors. ${errNote(map.error, all51.error, rfc.error)}`,
        sections: [
          { title: 'Failing BAPI Calls (ALE inbound, IDoc status 51)', summaryStats: [{ label: 'Failed BAPI IDocs', value: String(err.rows.length) }, { label: 'BAPIs affected', value: String(new Set(rows.map(r => r.bapi)).size) }, { label: 'BAPI tRFC errors (SM58)', value: String(rfc.rows.length) }], columns: cols(['bapi', 'BAPI (Function — Object.Method)'], ['mestyp', 'Message Type'], ['inbound', 'Inbound Function'], ['errors', 'Failures'], ['message', 'BAPI Return Message (latest example)'], ['msgId', 'Message Class/No.'], ['lastError', 'Last Failure'], ['sampleIdoc', 'Sample IDoc']), rows, note: 'BAPI ↔ message type mapping from TBDBE and BOR (SWOTLV); the BAPI return messages are the status-51 texts in EDIDS, read live.' },
          ...(rfc.rows.length ? [{ title: 'BAPI Calls Stuck in tRFC (SM58)', columns: cols(['func', 'Function'], ['state', 'State'], ['dest', 'Destination'], ['msg', 'Error'], ['date', 'Date']), rows: rfc.rows.map(x => ({ func: x.ARFCFNAM, state: x.ARFCSTATE, dest: x.ARFCDEST, msg: x.ARFCMSG, date: fmtD(x.ARFCDATUM) })) }] : [])
        ],
        assess: rows.length > 0,
        persona: 'You are a senior SAP integration developer. Explain why these BAPI calls fail based on their return messages, which input data must be corrected, and how to reprocess (BD87). 3-5 sentences.'
      };
    }

    case 'IDOC_FAIL': {
      const [grp, fct, recent] = await Promise.all([
        q("SELECT MESTYP, IDOCTP, DIRECT, COUNT( * ) AS N, MAX( UPDDAT ) AS LAST FROM EDIDC WHERE STATUS = '51' GROUP BY MESTYP, IDOCTP, DIRECT ORDER BY N DESCENDING", 200),
        q('SELECT MESTYP, IDOCTYP, DIRECT, FCTNAM FROM EDIFCT', 5000),
        q("SELECT A~DOCNUM, A~MESTYP, B~LOGDAT, B~STAMID, B~STAMNO, B~STATXT, B~STAPA1, B~STAPA2, B~STAPA3, B~STAPA4 FROM EDIDC AS A INNER JOIN EDIDS AS B ON A~DOCNUM = B~DOCNUM AND A~STATUS = B~STATUS WHERE A~STATUS = '51' ORDER BY B~LOGDAT DESCENDING", 2000)
      ]);
      const msg = (x: Record<string, string>) => (x.STATXT || '').replace(/&(\d)/g, (_, k) => x[`STAPA${k}`] || '').replace(/&/g, '').trim();
      const rows = grp.rows.map(x => {
        const f = fct.rows.find(e => e.MESTYP === x.MESTYP && (e.IDOCTYP === x.IDOCTP || !e.IDOCTYP) && (e.DIRECT === x.DIRECT || !e.DIRECT));
        const errs = recent.rows.filter(r => r.MESTYP === x.MESTYP);
        const top = new Map<string, { n: number; text: string }>(); errs.forEach(r => { const k = `${r.STAMID}|${r.STAMNO}`; const e = top.get(k) || { n: 0, text: `${msg(r)} [${r.STAMID} ${r.STAMNO}]` }; e.n++; top.set(k, e); });
        const topMsg = [...top.values()].sort((a, b) => b.n - a.n)[0];
        return { mestyp: x.MESTYP, idoctp: x.IDOCTP, direction: x.DIRECT === '2' ? 'Inbound' : 'Outbound', program: f?.FCTNAM || '—', errors: num(x.N), topError: topMsg ? `${topMsg.text} (${topMsg.n}×)` : '', last: fmtD(x.LAST), sample: (errs[0]?.DOCNUM || '').replace(/^0+/, '') };
      });
      const total = rows.reduce((a, r) => a + r.errors, 0);
      return {
        text: rows.length
          ? `${total} IDocs are in status 51 (application error in the processing function). ${rows.slice(0, 3).map(r => `${r.mestyp} → ${r.program}: ${r.errors} failures, mainly "${r.topError}" (last ${r.last})`).join('; ')}.`
          : `No IDocs are in status 51. ${errNote(grp.error)}`,
        sections: [{ title: 'Failing IDoc Processing Programs (status 51)', summaryStats: [{ label: 'IDocs in error', value: String(total) }, { label: 'Message types', value: String(rows.length) }], columns: cols(['mestyp', 'Message Type'], ['idoctp', 'Basic Type'], ['direction', 'Direction'], ['program', 'Processing Function (EDIFCT)'], ['errors', 'IDocs in Error'], ['topError', 'Most Frequent Error'], ['last', 'Last Error'], ['sample', 'Sample IDoc']), rows, note: 'Sources: EDIDC/EDIDS (status records, message texts with parameters filled) and EDIFCT (function module assigned to each message type), read live.' }],
        assess: rows.length > 0,
        persona: 'You are a senior SAP ALE/IDoc developer. Explain why the processing function modules fail based on the real error messages, what master/configuration data to correct, and how to reprocess (BD87). 3-5 sentences.'
      };
    }

    case 'JOB_TERM': {
      const jobs = await q(`SELECT JOBNAME, JOBCOUNT, SDLUNAME, STRTDATE, STRTTIME, ENDDATE, ENDTIME FROM TBTCO WHERE STATUS = 'A' AND ENDDATE >= '${d7}' ORDER BY ENDDATE DESCENDING, ENDTIME DESCENDING`, 1000);
      const dm = await dumps(d7);
      const dumpIn = (x: Record<string, string>, users: Set<string>) => dm.list.find(d => users.has(d.user) && `${d.date}${d.time}` >= `${x.STRTDATE}${x.STRTTIME}` && `${d.date}${d.time}` <= `${x.ENDDATE}${addTime(x.ENDTIME, 120)}`);
      const byName = new Map<string, number>(); jobs.rows.forEach(x => byName.set(x.JOBNAME, (byName.get(x.JOBNAME) || 0) + 1));
      const topNames = [...byName.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20);
      const withDumpAll = jobs.rows.filter(x => dumpIn(x, new Set([x.SDLUNAME])));
      const display = [...new Map([...withDumpAll.slice(0, 15), ...jobs.rows].map(x => [`${x.JOBNAME}|${x.JOBCOUNT}`, x])).values()].slice(0, 25)
        .sort((a, b) => `${b.ENDDATE}${b.ENDTIME}`.localeCompare(`${a.ENDDATE}${a.ENDTIME}`));
      const topSample = topNames.map(([n]) => jobs.rows.find(x => x.JOBNAME === n)!).filter(Boolean);
      const stepKeys = [...new Set([...display, ...topSample].map(x => x.JOBCOUNT))];
      const steps = stepKeys.length ? await q(`SELECT JOBNAME, JOBCOUNT, STEPCOUNT, PROGNAME, VARIANT, AUTHCKNAM FROM TBTCP WHERE JOBCOUNT IN ( ${inList(stepKeys)} )`, 1000) : { rows: [], total: 0 } as Q;
      const stepsOf = (x: Record<string, string>) => steps.rows.filter(s => s.JOBNAME === x.JOBNAME && s.JOBCOUNT === x.JOBCOUNT);
      const rows = display.map(x => {
        const st = stepsOf(x);
        const rel = dumpIn(x, new Set([x.SDLUNAME, ...st.map(s => s.AUTHCKNAM)]));
        return { job: x.JOBNAME, count: x.JOBCOUNT, user: x.SDLUNAME, start: `${fmtD(x.STRTDATE)} ${fmtT(x.STRTTIME)}`, end: `${fmtD(x.ENDDATE)} ${fmtT(x.ENDTIME)}`, steps: st.map(s => `${s.PROGNAME}${s.VARIANT ? ` (${s.VARIANT})` : ''}`).join(', ') || '—', cancellations7d: byName.get(x.JOBNAME) || 1, dump: rel ? `${rel.error} in ${rel.program}${rel.line ? ` line ${rel.line}` : ''}` : '—' };
      });
      const withDump = rows.filter(r => r.dump !== '—');
      return {
        text: jobs.rows.length
          ? `${jobs.rows.length} background jobs terminated (status Cancelled) in the last 7 days across ${byName.size} job names; most frequent: ${topNames.slice(0, 3).map(([n, c]) => `${n} (${c}×, program ${stepsOf(topSample.find(x => x.JOBNAME === n)!).map(s => s.PROGNAME).join(', ') || 'n/a'})`).join('; ')}. ${withDumpAll.length} terminations coincide with an ABAP dump by the same user${withDump[0] ? ` — e.g. ${withDump[0].job}: ${withDump[0].dump}` : ''}; the others ended without a dump, i.e. the step program stopped with an error message (visible in the job log).`
          : `No background job terminated in the last 7 days. ${errNote(jobs.error)}`,
        sections: [
          { title: 'Terminated Background Jobs (TBTCO/TBTCP)', summaryStats: [{ label: 'Cancelled (7d)', value: String(jobs.rows.length) }, { label: 'Job names', value: String(byName.size) }, { label: 'With matching dump', value: String(withDumpAll.length) }], columns: cols(['job', 'Job'], ['count', 'Job Count'], ['user', 'Scheduled By'], ['start', 'Start'], ['end', 'Terminated'], ['steps', 'Step Programs (Variant)'], ['cancellations7d', 'Cancellations (7d)'], ['dump', 'Dump During Run']), rows, note: 'Terminations with a matching dump are listed first, then the latest ones. Dumps are matched from SNAP_BEG by user and run time window. Job log texts are stored in TemSe files and are not readable with SQL.' },
          { title: 'Most Frequently Terminated Jobs (7d)', columns: cols(['job', 'Job'], ['count', 'Cancellations'], ['program', 'Step Program']), rows: topNames.map(([job, count]) => ({ job, count, program: stepsOf(topSample.find(x => x.JOBNAME === job)!).map(s => s.PROGNAME).join(', ') || '' })) }
        ],
        assess: jobs.rows.length > 0,
        persona: 'You are a senior SAP ABAP/Basis developer. Explain why these background jobs terminate, using the step programs and matching dumps; say which need code fixes versus data/variant fixes. 3-5 sentences.'
      };
    }

    case 'SLOWEST': case 'DB_TIME': case 'RUNTIME_COMPARE': {
      const [sqlm, satr, zjobs] = await Promise.all([
        q('SELECT COUNT( * ) AS N FROM SQLMD', 1), q('SELECT COUNT( * ) AS N FROM SATR_DIRECTORY', 1),
        q("SELECT A~PROGNAME, COUNT( * ) AS RUNS FROM TBTCP AS A WHERE ( A~PROGNAME LIKE 'Z%' OR A~PROGNAME LIKE 'Y%' ) GROUP BY A~PROGNAME ORDER BY RUNS DESCENDING", 200)
      ]);
      const evidence = [
        { source: 'SQL Monitor (SQLM) — per-program database time', table: 'SQLMD', records: num(sqlm.rows[0]?.N) },
        { source: 'Runtime analysis traces (SAT/SE30)', table: 'SATR_DIRECTORY', records: num(satr.rows[0]?.N) },
        { source: 'Custom programs run as background job steps', table: 'TBTCP', records: zjobs.rows.length }
      ];
      const measured = evidence.some(e => e.records > 0);
      if (intent === 'RUNTIME_COMPARE') {
        const [rec, dm] = await Promise.all([recentCustomPrograms(30), dumps(addDays(today, -60))]);
        const recent = rec.list.filter(p => p.udat >= addDays(today, -14));
        const rows = recent.map(p => {
          const pd = dm.list.filter(d => d.program === p.name);
          const before = pd.filter(d => d.date >= addDays(p.udat, -30) && d.date < p.udat).length;
          const after = pd.filter(d => d.date >= p.udat).length;
          const runs = zjobs.rows.find(z => z.PROGNAME === p.name);
          return { program: p.name, changedOn: fmtD(p.udat), changedBy: p.unam, jobRuns: runs ? num(runs.RUNS) : 0, dumpsBefore: before, dumpsAfter: after };
        });
        return {
          text: `${measured ? 'Some runtime measurements exist (see evidence).' : 'No runtime measurements are recorded for custom programs in this system: the SQL Monitor and runtime-analysis trace tables are empty and no custom program runs as a background job step, so a before/after duration cannot be computed.'} ${recent.length} custom programs changed in the last 14 days; the table compares their live stability (dumps 30 days before vs. since the change) instead. To measure runtime, activate the SQL Monitor (SQLM) or record SAT traces before and after the next change.`,
          sections: [
            { title: 'Runtime Measurement Sources (checked live)', columns: cols(['source', 'Source'], ['table', 'Table'], ['records', 'Records']), rows: evidence },
            { title: 'Recently Changed Custom Programs — Before vs. After Change', columns: cols(['program', 'Program'], ['changedOn', 'Changed On'], ['changedBy', 'Changed By'], ['jobRuns', 'Batch Runs Recorded'], ['dumpsBefore', 'Dumps 30d Before'], ['dumpsAfter', 'Dumps Since Change']), rows, note: 'Change dates from PROGDIR, dumps from SNAP_BEG, batch runs from TBTCP — all read live.' }
          ],
          assess: false
        };
      }
      const { units, programs } = await recentUnits(20);
      const scans = units.map(scanUnit);
      await verifySapWrites(scans);
      const byProg = new Map<string, { score: number; loopSel: number; noWhere: number; fae: number; nested: number; selects: number; tables: Set<string> }>();
      scans.forEach(s => {
        const e = byProg.get(s.unit.master) || { score: 0, loopSel: 0, noWhere: 0, fae: 0, nested: 0, selects: 0, tables: new Set<string>() };
        e.score += s.score; e.nested += s.nestedLoops; e.selects += s.selects.length;
        s.selects.forEach(x => { if (x.issues.some(i => i.startsWith('Executed inside'))) e.loopSel++; if (x.issues.some(i => i.startsWith('No WHERE'))) e.noWhere++; if (x.issues.some(i => i.startsWith('FOR ALL'))) e.fae++; x.tables.forEach(t => e.tables.add(t)); });
        byProg.set(s.unit.master, e);
      });
      const rows = [...byProg.entries()].map(([p, e]) => ({ program: p, selects: e.selects, selectInLoop: e.loopSel, noWhere: e.noWhere, faeUnchecked: e.fae, nestedLoops: e.nested, tables: [...e.tables].slice(0, 8).join(', '), score: e.score })).sort((a, b) => b.score - a.score);
      const zRuns = zjobs.rows.map(z => ({ program: z.PROGNAME, runs: num(z.RUNS) }));
      return {
        text: `${measured ? '' : `No runtime measurements are recorded for custom programs in this system (SQL Monitor data: ${evidence[0].records} records, SAT traces: ${evidence[1].records}, custom programs in batch steps: ${evidence[2].records}), so actual ${intent === 'DB_TIME' ? 'database time' : 'runtimes'} cannot be ranked. `}Ranking by database-access cost found in the live source of the ${programs.length} most recently changed custom programs instead: ${rows.slice(0, 3).map(r => `${r.program} (score ${r.score}: ${r.selectInLoop} SELECT-in-loop, ${r.noWhere} without WHERE, ${r.nestedLoops} nested loops)`).join('; ') || 'no costly patterns found'}. Activate the SQL Monitor (transaction SQLM) to capture real per-program database time.`,
        sections: [
          { title: 'Runtime Measurement Sources (checked live)', columns: cols(['source', 'Source'], ['table', 'Table'], ['records', 'Records']), rows: evidence },
          { title: intent === 'DB_TIME' ? 'Custom Programs by Database-Access Cost (live source)' : 'Custom Programs by Performance Risk (live source)', summaryStats: [{ label: 'Programs scanned', value: String(programs.length) }], columns: cols(['program', 'Program'], ['selects', 'SELECTs'], ['selectInLoop', 'SELECT in Loop'], ['noWhere', 'SELECT w/o WHERE'], ['faeUnchecked', 'Unchecked FAE'], ['nestedLoops', 'Nested Loops'], ['tables', 'Tables Read'], ['score', 'Cost Score']), rows, note: 'Cost score = 3×SELECT-in-loop + 3×no-WHERE + 3×unchecked FOR ALL ENTRIES + 2×SELECT…ENDSELECT + 2×simplification table + 3×nested loop + 4×direct SAP table write (+ minor findings). A static indicator, not a measured time.' },
          ...(zRuns.length ? [{ title: 'Custom Programs Executed in Background Jobs', columns: cols(['program', 'Program'], ['runs', 'Job Steps']), rows: zRuns }] : [])
        ],
        assess: false
      };
    }

    case 'SELECT_PERF': case 'ANALYZE_SQL': case 'OPTIMIZE': case 'CDS_REPLACE': {
      let units: Unit[] = []; let programs: ProgInfo[] = [];
      if (intent === 'CDS_REPLACE') {
        const simpl = await simplificationUsage();
        const masters = simpl.uses.map(u => u.master).slice(0, 20);
        const fetched = await inBatches(masters, 6, fetchUnits);
        units = fetched.flat();
        const rec = await recentUnits(10); units.push(...rec.units); programs = rec.programs;
      } else {
        const rec = await recentUnits(intent === 'SELECT_PERF' ? 25 : 20); units = rec.units; programs = rec.programs;
      }
      const scans = units.map(scanUnit);
      if (intent === 'OPTIMIZE') await verifySapWrites(scans);
      const selects = scans.flatMap(s => s.selects);
      if (intent === 'CDS_REPLACE') {
        const cands = selects.filter(s => s.tables.some(t => SIMPLIFICATION[t]) || s.tables.length >= 3 || /\b(SUM|COUNT|MAX|MIN|AVG)\s*\(/.test(s.stmt.toUpperCase()) || s.issues.some(i => i.startsWith('Executed inside') || i.startsWith('FOR ALL')));
        const cdsNames = [...new Set(cands.flatMap(s => s.tables.map(t => SIMPLIFICATION[t]?.cds).filter(Boolean) as string[]))];
        const cds = cdsNames.length ? await q(`SELECT DDLNAME FROM DDDDLSRC WHERE AS4LOCAL = 'A' AND DDLNAME IN ( ${inList(cdsNames)} )`, 50) : { rows: [] } as any;
        const rows = cands.map(s => {
          const simplT = s.tables.filter(t => SIMPLIFICATION[t]);
          const rel = simplT.map(t => SIMPLIFICATION[t].cds).find(c => c && cds.rows.some((x: any) => x.DDLNAME === c));
          const why = simplT.length ? `Reads ${simplT.join(', ')} (${SIMPLIFICATION[simplT[0]].item})` : s.tables.length >= 3 ? `${s.tables.length}-table join` : /\b(SUM|COUNT|MAX|MIN|AVG)\s*\(/.test(s.stmt.toUpperCase()) ? 'Aggregation that can be pushed down' : 'Row-by-row / FOR ALL ENTRIES access that a CDS join can replace';
          return { program: s.unit, line: s.line, tables: s.tables.join(', '), statement: clip(s.stmt, 150), reason: why, recommendation: rel ? `Use released CDS view ${rel} (exists in this system)` : simplT.length ? `Read ${SIMPLIFICATION[simplT[0]].replacement} through a CDS view entity` : 'Model the join/aggregation as a custom CDS view entity' };
        }).sort((a, b) => (b.reason.startsWith('Reads') ? 1 : 0) - (a.reason.startsWith('Reads') ? 1 : 0));
        return {
          text: rows.length
            ? `${rows.length} real SELECT statements in ${new Set(rows.map(r => r.program)).size} custom programs should move to CDS views: ${rows.filter(r => r.reason.startsWith('Reads')).length} read S/4HANA simplification tables, the rest are multi-table joins, aggregations or loop-based reads. Example: ${rows[0].program} line ${rows[0].line} — ${rows[0].reason}; ${rows[0].recommendation}.`
            : 'No SELECT statement in the scanned custom programs reads simplification tables, joins 3+ tables, aggregates or runs row-by-row.',
          sections: [{ title: 'SELECT Statements to Replace with CDS Views (live source)', summaryStats: [{ label: 'Candidates', value: String(rows.length) }, { label: 'Source units scanned', value: String(units.length) }], columns: cols(['program', 'Program'], ['line', 'Line'], ['tables', 'Tables'], ['reason', 'Why'], ['recommendation', 'Recommendation'], ['statement', 'Statement']), rows: rows.slice(0, 150), note: 'Programs referencing simplification tables are selected from D010TAB, plus the most recently changed custom programs; statements read from the real ADT source. Recommended CDS views are verified to exist live (DDDDLSRC).' }],
          assess: false
        };
      }
      if (intent === 'SELECT_PERF') {
        const rows = selects.filter(s => s.score >= 2).sort((a, b) => b.score - a.score).map(s => ({ program: s.unit, line: s.line, tables: s.tables.join(', '), issues: s.issues.join('; '), severity: s.score >= 5 ? 'High' : s.score >= 3 ? 'Medium' : 'Low', statement: clip(s.stmt, 150) }));
        return {
          text: `${selects.length} SELECT statements were analysed in the live source of the ${programs.length} most recently changed custom programs; ${rows.length} have performance problems (${rows.filter(r => r.severity === 'High').length} high). Worst: ${rows.slice(0, 3).map(r => `${r.program} line ${r.line} (${r.issues.split('; ')[0]})`).join('; ') || 'none'}.`,
          sections: [{ title: 'SELECT Statements Causing Performance Problems (live source)', summaryStats: [{ label: 'SELECTs analysed', value: String(selects.length) }, { label: 'Problematic', value: String(rows.length) }, { label: 'High severity', value: String(rows.filter(r => r.severity === 'High').length) }], columns: cols(['program', 'Program'], ['line', 'Line'], ['tables', 'Tables'], ['severity', 'Severity'], ['issues', 'Problems'], ['statement', 'Statement']), rows: rows.slice(0, 150), note: `Scanned: ${programs.map(p => p.name).join(', ')}.` }],
          assess: false
        };
      }
      if (intent === 'ANALYZE_SQL') {
        const worst = [...selects].sort((a, b) => b.score - a.score)[0];
        if (!worst) return { text: 'No SQL statement was provided and no SELECT statement was found in recently changed custom programs. Paste the statement to analyse it.', sections: [], assess: false };
        const unit = units.find(u => u.name === worst.unit)!;
        const lines = unit.source.split(/\r?\n/);
        const ctx = lines.slice(Math.max(0, worst.line - 15), worst.line + 15).map((l, i) => `${Math.max(0, worst.line - 15) + i + 1}  ${l}`).join('\n');
        const tabs = worst.tables.length ? await q(`SELECT TABNAME, TABCLASS, VIEWREF FROM DD02L WHERE AS4LOCAL = 'A' AND TABNAME IN ( ${inList(worst.tables)} )`, 20) : { rows: [] } as any;
        const counts = await Promise.all(worst.tables.slice(0, 4).map(async t => ({ t, r: await q(`SELECT COUNT( * ) AS N FROM ${t}`, 1) })));
        return {
          text: `No SQL statement was pasted, so the costliest real SELECT among ${selects.length} statements in recently changed custom programs was analysed: ${worst.unit} line ${worst.line}, reading ${worst.tables.join(', ')}. Findings: ${worst.issues.join('; ') || 'none'}.`,
          sections: [
            { title: `SQL Statement — ${worst.unit} line ${worst.line}`, columns: cols(['field', 'Attribute'], ['value', 'Value']), rows: [{ field: 'Statement', value: worst.stmt }, { field: 'Tables', value: worst.tables.join(', ') }, { field: 'WHERE', value: worst.where || '(none)' }, { field: 'Target', value: worst.target || '—' }], note: 'Read live from the ADT source.' },
            { title: 'HANA Performance Findings', columns: cols(['finding', 'Finding']), rows: (worst.issues.length ? worst.issues : ['No static anti-pattern detected']).map(f => ({ finding: f })) },
            { title: 'Tables Read by the Statement (live)', columns: cols(['table', 'Table'], ['type', 'Type'], ['redirect', 'Runtime Redirect'], ['rows', 'Rows']), rows: worst.tables.map(t => { const d = tabs.rows.find((x: any) => x.TABNAME === t); const c = counts.find(x => x.t === t); return { table: t, type: d?.TABCLASS || '', redirect: d?.VIEWREF || '—', rows: c && !c.r.error ? num(c.r.rows[0]?.N) : '' }; }) }
          ],
          assess: true,
          persona: 'You are a SAP HANA / ABAP SQL performance expert. Analyse this real statement for HANA performance (column store, pushdown, FOR ALL ENTRIES, SELECT *, loops, index/where selectivity, table sizes) and show an optimised ABAP SQL version in a short abap code block. 4-8 sentences plus code.',
          context: `Statement and surrounding source (${worst.unit}):\n${ctx}`
        };
      }
      // OPTIMIZE
      const byProg = new Map<string, UnitScan[]>();
      scans.forEach(s => byProg.set(s.unit.master, [...(byProg.get(s.unit.master) || []), s]));
      const best = [...byProg.entries()].sort((a, b) => b[1].reduce((x, s) => x + s.score, 0) - a[1].reduce((x, s) => x + s.score, 0))[0];
      if (!best) return { text: 'No program was named and no recently changed custom program with readable source was found.', sections: [], assess: false };
      const findings = best[1].flatMap(s => [...s.selects.filter(x => x.issues.length).map(x => ({ unit: x.unit, line: x.line, finding: x.issues.join('; '), statement: clip(x.stmt, 140) })), ...s.stdWrites.map(w => ({ unit: s.unit.name, line: w.line, finding: `Direct ${w.op} on SAP table ${w.table}`, statement: '' }))]);
      const nested = best[1].reduce((a, s) => a + s.nestedLoops, 0);
      return {
        text: `No program was named, so the recently changed custom program with the highest optimisation potential was chosen: ${best[0]} (${findings.length} findings${nested ? `, ${nested} nested loops` : ''}), out of ${programs.length} programs scanned.`,
        sections: [{ title: `Optimisation Findings — ${best[0]}`, columns: cols(['unit', 'Source Unit'], ['line', 'Line'], ['finding', 'Finding'], ['statement', 'Statement']), rows: findings, note: 'From the real source read live via ADT.' }],
        assess: true,
        persona: 'You are a senior SAP ABAP performance developer. Recommend concrete optimisations for this real program, ordered by impact, citing real line numbers, with one short abap code block showing the most important rewrite. Keep it practical.',
        context: best[1].map(s => `* ===== ${s.unit.name} =====\n${s.unit.source}`).join('\n').slice(0, 16000)
      };
    }

    case 'S4_COMPAT': case 'OBSOLETE': case 'SIMPLIFIED': case 'FAIL_AFTER_MIGRATION': {
      const simpl = await simplificationUsage();
      const info = await programInfo(simpl.uses.map(u => u.master));
      const progRows = simpl.uses.map(u => {
        const imps = u.tables.map(t => ({ t, ...impactOf(t, simpl.tableStats.get(t)) }));
        const worst = imps.sort((a, b) => LEVEL_RANK[b.level] - LEVEL_RANK[a.level])[0];
        const p = info.get(u.master);
        return { program: u.master, type: SUBC_TEXT[p?.subc || ''] || p?.subc || '', changed: p ? `${fmtD(p.udat)} (${p.unam})` : '', tables: u.tables.join(', '), impact: worst.level, detail: imps.map(i => i.text).join('; '), replacement: [...new Set(u.tables.map(t => SIMPLIFICATION[t].replacement))].join(', ') };
      }).sort((a, b) => LEVEL_RANK[b.impact as keyof typeof LEVEL_RANK] - LEVEL_RANK[a.impact as keyof typeof LEVEL_RANK]);
      const tableRows = [...simpl.tableStats.entries()].map(([t, st]) => ({ table: t, item: SIMPLIFICATION[t].item, programs: simpl.uses.filter(u => u.tables.includes(t)).length, rows: st.rows ?? '', redirect: st.viewref || (st.tabclass === 'VIEW' ? 'Compatibility view' : '—'), replacement: `${SIMPLIFICATION[t].replacement}${st.replacementExists ? '' : ' (not found)'}`, cds: SIMPLIFICATION[t].cds ? `${SIMPLIFICATION[t].cds}${st.cdsExists ? '' : ' (not found)'}` : '—', impact: impactOf(t, st).level })).sort((a, b) => b.programs - a.programs);
      const breaks = progRows.filter(r => r.impact === 'Breaks');
      const tableCols = cols(['table', 'Table'], ['item', 'Simplification Item'], ['programs', 'Custom Programs'], ['rows', 'Rows in S/4 Table'], ['redirect', 'Runtime Redirect'], ['replacement', 'Replacement'], ['cds', 'Released CDS View'], ['impact', 'Impact']);
      const progCols = cols(['program', 'Program'], ['type', 'Type'], ['changed', 'Last Changed'], ['tables', 'Simplification Tables Used'], ['impact', 'Impact'], ['replacement', 'Use Instead'], ['detail', 'Details']);
      const note = `Custom programs (Z*/Y*/SAPLZ*) referencing S/4HANA simplification tables from D010TAB; row counts, runtime redirects (DD02L-VIEWREF) and replacement objects read live. Impact: Breaks = table is empty in S/4HANA, Degraded = served by a read-only compatibility view, Redesign = still filled but superseded. ${errNote(simpl.error)}`;
      if (intent === 'SIMPLIFIED') {
        const items = new Map<string, { tables: Set<string>; programs: Set<string> }>();
        simpl.uses.forEach(u => u.tables.forEach(t => { const it = SIMPLIFICATION[t].item; const e = items.get(it) || { tables: new Set<string>(), programs: new Set<string>() }; e.tables.add(t); e.programs.add(u.master); items.set(it, e); }));
        const rows = [...items.entries()].map(([item, e]) => ({ item, tables: [...e.tables].join(', '), count: e.programs.size, programs: [...e.programs].slice(0, 12).join(', ') })).sort((a, b) => b.count - a.count);
        return {
          text: `${simpl.uses.length} custom programs are affected by ${rows.length} S/4HANA simplified data models: ${rows.slice(0, 4).map(r => `${r.item} (${r.count} programs)`).join('; ')}. ${breaks.length} of them read tables that are empty in this S/4HANA system.`,
          sections: [
            { title: 'Custom Code by Simplified Data Model', columns: cols(['item', 'Simplified Data Model'], ['tables', 'Old Tables'], ['count', 'Programs'], ['programs', 'Affected Programs']), rows },
            { title: 'Affected Custom Programs', columns: progCols, rows: progRows, note },
            { title: 'Simplification Tables Referenced', columns: tableCols, rows: tableRows }
          ],
          assess: false
        };
      }
      if (intent === 'OBSOLETE') {
        return {
          text: `${simpl.uses.length} custom programs use ${tableRows.length} obsolete/simplified tables: ${tableRows.slice(0, 5).map(r => `${r.table} (${r.programs} programs, ${r.impact.toLowerCase()})`).join(', ')}. ${breaks.length} programs read tables that hold no data in S/4HANA. Obsolete transaction calls are not recorded in the where-used index; use the ATC S/4HANA readiness check for those.`,
          sections: [{ title: 'Obsolete / Simplified Tables Used by Custom Code', columns: tableCols, rows: tableRows }, { title: 'Custom Programs Using Them', columns: progCols, rows: progRows, note }],
          assess: false
        };
      }
      const rows = intent === 'FAIL_AFTER_MIGRATION' ? progRows.filter(r => r.impact !== 'Redesign') : progRows;
      return {
        text: intent === 'FAIL_AFTER_MIGRATION'
          ? `${breaks.length} custom objects will functionally fail on S/4HANA because they read tables that are empty here (${[...new Set(breaks.flatMap(b => b.tables.split(', ').filter(t => simpl.tableStats.get(t)?.rows === 0)))].join(', ')}): ${breaks.slice(0, 6).map(b => b.program).join(', ')}. Another ${rows.length - breaks.length} run only through read-only compatibility views and fail if they write to them.`
          : `${simpl.uses.length} custom programs are not fully S/4HANA compatible: ${breaks.length} read tables that are empty in S/4HANA (hard failure), ${progRows.filter(r => r.impact === 'Degraded').length} rely on compatibility views, ${progRows.filter(r => r.impact === 'Redesign').length} use superseded tables. Top: ${progRows.slice(0, 4).map(r => `${r.program} (${r.tables})`).join('; ')}.`,
        sections: [{ title: intent === 'FAIL_AFTER_MIGRATION' ? 'Custom Objects That Will Fail After S/4HANA Migration' : 'Custom Programs Not S/4HANA Compatible', summaryStats: [{ label: 'Programs affected', value: String(rows.length) }, { label: 'Hard failures', value: String(breaks.length) }], columns: progCols, rows, note }, { title: 'Simplification Tables Referenced', columns: tableCols, rows: tableRows }],
        assess: false
      };
    }

    case 'ATC': {
      const r = await q('SELECT DISPLAY_ID, TITLE, COUNT_PRIO1, COUNT_PRIO2, COUNT_PRIO3, COUNT_PRIO4, SCHEDULED_BY, SCHEDULED_ON_TS, CHK_PROFILE_NAME, IS_COMPLETE FROM SATC_AC_RESULTH ORDER BY SCHEDULED_ON_TS DESCENDING', 200);
      let runs = r.rows;
      const tokens = [...new Set(runs.flatMap(x => (x.TITLE.match(/\b[ZY][A-Z0-9_\/]{2,40}\b/g) || [])))];
      const tadir = tokens.length ? await q(`SELECT OBJ_NAME, DEVCLASS FROM TADIR WHERE PGMID = 'R3TR' AND OBJ_NAME IN ( ${inList(tokens.slice(0, 150))} )`, 500) : { rows: [] } as any;
      const pkgOf = (title: string) => [...new Set((title.match(/\b[ZY][A-Z0-9_\/]{2,40}\b/g) || []).map(t => tadir.rows.find((x: any) => x.OBJ_NAME === t)?.DEVCLASS).filter(Boolean))].join(', ');
      const pkgFilter = (query.match(/\bpackage\s+([ZY$][A-Z0-9_\/$]{1,29})\b/i) || [])[1]?.toUpperCase();
      if (pkgFilter) runs = runs.filter(x => pkgOf(x.TITLE).split(', ').includes(pkgFilter));
      const ts = (v: string) => /^\d{14}$/.test(v) ? `${fmtD(v.slice(0, 8))} ${fmtT(v.slice(8))}` : v;
      const rows = runs.map(x => ({ run: x.TITLE, packages: pkgOf(x.TITLE) || '—', variant: x.CHK_PROFILE_NAME, p1: num(x.COUNT_PRIO1), p2: num(x.COUNT_PRIO2), p3: num(x.COUNT_PRIO3), p4: num(x.COUNT_PRIO4), by: x.SCHEDULED_BY, on: ts(x.SCHEDULED_ON_TS), complete: x.IS_COMPLETE === 'X' ? 'Yes' : 'No' }));
      const sum = (k: 'p1' | 'p2' | 'p3') => rows.reduce((a, x) => a + x[k], 0);
      const byVariant = new Map<string, { runs: number; p1: number; p2: number; p3: number }>();
      rows.forEach(x => { const e = byVariant.get(x.variant) || { runs: 0, p1: 0, p2: 0, p3: 0 }; e.runs++; e.p1 += x.p1; e.p2 += x.p2; e.p3 += x.p3; byVariant.set(x.variant, e); });
      const latestWithErrors = rows.find(x => x.p1 + x.p2 > 0);
      return {
        text: rows.length
          ? `${rows.length} ATC runs are stored${pkgFilter ? ` for package ${pkgFilter}` : ' (no package named — all runs shown)'}. Latest: "${rows[0].run}" on ${rows[0].on} with variant ${rows[0].variant}: ${rows[0].p1} priority-1, ${rows[0].p2} priority-2, ${rows[0].p3} priority-3 findings. ${latestWithErrors ? `Most recent run with errors: "${latestWithErrors.run}" (${latestWithErrors.variant}) — ${latestWithErrors.p1} P1 / ${latestWithErrors.p2} P2 on ${latestWithErrors.on}.` : 'No run has priority-1 or priority-2 findings.'}`
          : `No ATC runs are stored${pkgFilter ? ` for package ${pkgFilter}` : ''}. ${errNote(r.error)}`,
        sections: [
          { title: 'ATC Result Runs (SATC_AC_RESULTH)', summaryStats: [{ label: 'Runs', value: String(rows.length) }, { label: 'Priority 1', value: String(sum('p1')) }, { label: 'Priority 2', value: String(sum('p2')) }, { label: 'Priority 3', value: String(sum('p3')) }], columns: cols(['run', 'Run / Objects'], ['packages', 'Packages'], ['variant', 'Check Variant'], ['p1', 'Prio 1'], ['p2', 'Prio 2'], ['p3', 'Prio 3'], ['p4', 'Prio 4'], ['by', 'Run By'], ['on', 'Run On (UTC)'], ['complete', 'Complete']), rows, note: 'ATC result headers read live; packages resolved from TADIR for the objects named in each run. Finding-level detail is not persisted in the result table in this system.' },
          { title: 'Findings by Check Variant', columns: cols(['variant', 'Check Variant'], ['runs', 'Runs'], ['p1', 'Prio 1'], ['p2', 'Prio 2'], ['p3', 'Prio 3']), rows: [...byVariant.entries()].map(([variant, e]) => ({ variant, ...e })) }
        ],
        assess: rows.length > 0,
        persona: 'You are a senior SAP ABAP quality lead. Summarise the ATC situation from these real runs (trend, which variants produce priority-1/2 findings, which objects/packages) and what to remediate first. 3-5 sentences.'
      };
    }
  }
}

function addTime(t: string, secs: number): string {
  const s = Math.min(86399, num(t.slice(0, 2)) * 3600 + num(t.slice(2, 4)) * 60 + num(t.slice(4, 6)) + secs);
  return `${String(Math.floor(s / 3600)).padStart(2, '0')}${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}${String(s % 60).padStart(2, '0')}`;
}

// ---------- technical / functional specification document ----------
export function classifyAbapSpecRequest(n: string, query: string): string | null {
  const name = namedObject(query);
  if (!name) return null;
  return /\b(technical|functional|tech|func)\.?\s*(spec|specs|specification|specifications|design)\b|\bspecification\b|\bspec\s+doc/.test(n) ? name : null;
}

type SpecTable = { table: string; description: string; type: string; access: string; simplification: string };
export type AbapSpecFacts = {
  name: string; master: string; kind: string; title: string; pkg: string; pkgText: string; created: string; changed: string; sysDate: string;
  transports: { trkorr: string; text: string; user: string; date: string; status: string }[];
  tcodes: string[]; variants: number; jobSteps: number; dumps: ReturnType<typeof groupDumps>;
  units: { name: string; lines: number }[]; source: string;
  selection: { kind: string; name: string; definition: string }[];
  tables: SpecTable[]; structures: { name: string; description: string }[];
  functions: { name: string; description: string; exists: string }[];
  classes: string[]; transactionsCalled: string[]; submits: string[]; authChecks: string[]; events: string[]; routines: string[]; methods: string[];
  selects: SelectFinding[]; writes: { table: string; op: string; unit: string; line: number }[];
  simplification: { table: string; item: string; replacement: string; rows: number | string; redirect: string; impact: string }[];
};

export async function collectAbapSpecFacts(name: string): Promise<AbapSpecFacts | null> {
  const clsMaster = `${name.padEnd(30, '=')}CP`;
  const pd = await q(`SELECT NAME, SUBC, CNAM, CDAT, UNAM, UDAT FROM PROGDIR WHERE STATE = 'A' AND NAME IN ( ${inList([name, clsMaster, `SAPL${name}`])} )`, 3);
  const p = pd.rows.find(x => x.NAME === name) || pd.rows[0];
  if (!p) return null;
  const master = p.NAME;
  const objType = classOf(master) ? 'CLAS' : /^SAPL/.test(master) && master !== name ? 'FUGR' : 'PROG';
  const [title, tadir, d010, tr, tc, varid, jobs, dm, sysD, units] = await Promise.all([
    q(`SELECT SPRSL, TEXT FROM TRDIRT WHERE NAME = '${master}'`, 20),
    q(`SELECT DEVCLASS FROM TADIR WHERE PGMID = 'R3TR' AND OBJECT = '${objType}' AND OBJ_NAME = '${name}'`, 1),
    q(`SELECT A~TABNAME, B~TABCLASS, C~DDTEXT FROM D010TAB AS A LEFT OUTER JOIN DD02L AS B ON A~TABNAME = B~TABNAME AND B~AS4LOCAL = 'A' LEFT OUTER JOIN DD02T AS C ON A~TABNAME = C~TABNAME AND C~DDLANGUAGE = 'E' AND C~AS4LOCAL = 'A' WHERE A~MASTER = '${master}'`, 1000),
    q(`SELECT DISTINCT A~TRKORR, B~AS4USER, B~AS4DATE, B~TRSTATUS FROM E071 AS A INNER JOIN E070 AS B ON A~TRKORR = B~TRKORR WHERE A~OBJ_NAME = '${name}' ORDER BY B~AS4DATE DESCENDING`, 50),
    q(`SELECT TCODE FROM TSTC WHERE PGMNA = '${name}'`, 20),
    q(`SELECT COUNT( * ) AS N FROM VARID WHERE REPORT = '${name}'`, 1),
    q(`SELECT COUNT( * ) AS N FROM TBTCP WHERE PROGNAME = '${name}'`, 1),
    sysDate().then(d => dumps(addDays(d, -30))),
    sysDate(),
    fetchUnits(master)
  ]);
  if (!units.length) return null;
  const pkg = tadir.rows[0]?.DEVCLASS || '';
  const [pkgT, trT] = await Promise.all([
    pkg ? q(`SELECT CTEXT FROM TDEVCT WHERE DEVCLASS = '${pkg}' AND SPRAS = 'E'`, 1) : Promise.resolve({ rows: [], total: 0 } as Q),
    tr.rows.length ? q(`SELECT TRKORR, AS4TEXT FROM E07T WHERE LANGU = 'E' AND TRKORR IN ( ${inList(tr.rows.map(x => x.TRKORR))} )`, 50) : Promise.resolve({ rows: [], total: 0 } as Q)
  ]);
  const scans = units.map(scanUnit);
  const stmts = scans.flatMap(s => s.stmts.map(x => ({ ...x, unit: s.unit.name })));
  const dbTables = new Map(d010.rows.filter(x => ['TRANSP', 'VIEW', 'CLUSTER', 'POOL'].includes(x.TABCLASS)).map(x => [x.TABNAME, x]));
  const writes: AbapSpecFacts['writes'] = [];
  for (const s of stmts) {
    const w = /^(UPDATE|MODIFY|INSERT|DELETE)\s+(?:FROM\s+|INTO\s+)?([A-Z][A-Z0-9_\/]{1,29})\b/.exec(s.up);
    if (w && dbTables.has(w[2])) writes.push({ table: w[2], op: w[1], unit: s.unit, line: s.line });
  }
  const selects = scans.flatMap(s => s.selects);
  const readSet = new Set(selects.flatMap(s => s.tables));
  const writeSet = new Set(writes.map(w => w.table));
  const simplUsed = [...dbTables.keys()].filter(t => SIMPLIFICATION[t]);
  const [simplDd, simplCnt] = await Promise.all([
    simplUsed.length ? q(`SELECT TABNAME, TABCLASS, VIEWREF FROM DD02L WHERE AS4LOCAL = 'A' AND TABNAME IN ( ${inList(simplUsed)} )`, 50) : Promise.resolve({ rows: [], total: 0 } as Q),
    Promise.all(simplUsed.map(async t => ({ t, r: await q(`SELECT COUNT( * ) AS N FROM ${t}`, 1) })))
  ]);
  const simplification = simplUsed.map(t => {
    const d = simplDd.rows.find(x => x.TABNAME === t); const c = simplCnt.find(x => x.t === t);
    const st: TableStat = { rows: c && !c.r.error ? num(c.r.rows[0]?.N) : null, tabclass: d?.TABCLASS || '', viewref: d?.VIEWREF || '', replacementExists: true, cdsExists: false };
    return { table: t, item: SIMPLIFICATION[t].item, replacement: SIMPLIFICATION[t].replacement, rows: st.rows ?? '', redirect: st.viewref || (st.tabclass === 'VIEW' ? 'Compatibility view' : ''), impact: impactOf(t, st).text };
  });
  const srcUp = units.map(u => u.source).join('\n').toUpperCase();
  const inSource = (t: string) => new RegExp(`(^|[^A-Z0-9_/])${t.replace(/\//g, '\\/')}([^A-Z0-9_]|$)`).test(srcUp);
  const tables: SpecTable[] = [...dbTables.values()].filter(x => readSet.has(x.TABNAME) || writeSet.has(x.TABNAME) || inSource(x.TABNAME)).map(x => ({
    table: x.TABNAME, description: x.DDTEXT || '', type: x.TABCLASS === 'TRANSP' ? 'Transparent table' : x.TABCLASS === 'VIEW' ? 'View' : x.TABCLASS,
    access: readSet.has(x.TABNAME) && writeSet.has(x.TABNAME) ? 'Read / Write' : writeSet.has(x.TABNAME) ? 'Write' : readSet.has(x.TABNAME) ? 'Read' : 'Declared / type reference',
    simplification: SIMPLIFICATION[x.TABNAME]?.item || ''
  })).sort((a, b) => a.access.localeCompare(b.access) || a.table.localeCompare(b.table));
  const structures = d010.rows.filter(x => !dbTables.has(x.TABNAME) && inSource(x.TABNAME)).map(x => ({ name: x.TABNAME, description: x.DDTEXT || '' }));
  const fmNames = [...new Set(stmts.map(s => (/^CALL FUNCTION\s+'([^']+)'/.exec(s.up) || [])[1]).filter(Boolean) as string[])];
  const fmT = fmNames.length ? await q(`SELECT A~FUNCNAME, B~STEXT FROM TFDIR AS A LEFT OUTER JOIN TFTIT AS B ON A~FUNCNAME = B~FUNCNAME AND B~SPRAS = 'E' WHERE A~FUNCNAME IN ( ${inList(fmNames)} )`, 100) : { rows: [] } as any;
  const selection: AbapSpecFacts['selection'] = [];
  for (const s of stmts.filter(x => /^(PARAMETERS|SELECT-OPTIONS)\b/.test(x.up))) {
    const kind = s.up.startsWith('PARAMETERS') ? 'Parameter' : 'Select-option';
    s.text.replace(/^(PARAMETERS|SELECT-OPTIONS)\s*:?\s*/i, '').split(/,(?=\s*[A-Za-z_][\w]*\s)/).forEach(part => {
      const def = part.trim(); if (def) selection.push({ kind, name: def.split(/\s+/)[0], definition: def });
    });
  }
  const uniq = (re: RegExp) => [...new Set(stmts.map(s => (re.exec(s.up) || [])[1]).filter(Boolean) as string[])];
  return {
    name, master, kind: SUBC_TEXT[p.SUBC] || p.SUBC, title: (title.rows.find(x => x.SPRSL === 'E') || title.rows[0])?.TEXT || '',
    pkg, pkgText: pkgT.rows[0]?.CTEXT || '', created: `${fmtD(p.CDAT)} by ${p.CNAM}`, changed: `${fmtD(p.UDAT)} by ${p.UNAM}`, sysDate: fmtD(sysD),
    transports: tr.rows.map(x => ({ trkorr: x.TRKORR, text: trT.rows.find(t => t.TRKORR === x.TRKORR)?.AS4TEXT || '', user: x.AS4USER, date: fmtD(x.AS4DATE), status: x.TRSTATUS === 'R' ? 'Released' : x.TRSTATUS === 'D' ? 'Modifiable' : x.TRSTATUS })),
    tcodes: tc.rows.map(x => x.TCODE), variants: num(varid.rows[0]?.N), jobSteps: num(jobs.rows[0]?.N),
    dumps: groupDumps(dm.list.filter(d => d.program === master || d.include.startsWith(name))),
    units: units.map(u => ({ name: u.name, lines: u.source.split(/\r?\n/).length })), source: units.map(u => `* ===== ${u.name} =====\n${u.source}`).join('\n'),
    selection, tables, structures,
    functions: fmNames.map(f => { const r = fmT.rows.find((x: any) => x.FUNCNAME === f); return { name: f, description: r?.STEXT || '', exists: r ? 'Yes' : 'No' }; }),
    classes: [...new Set(stmts.flatMap(s => s.up.match(/\b(?:CL|ZCL|YCL|CX|IF)_[A-Z0-9_]{2,27}\b/g) || []))],
    transactionsCalled: uniq(/CALL TRANSACTION\s+'([^']+)'/), submits: uniq(/^SUBMIT\s+([A-Z0-9_\/]+)/), authChecks: uniq(/AUTHORITY-CHECK\s+OBJECT\s+'([^']+)'/),
    events: [...new Set(stmts.filter(s => /^(INITIALIZATION|AT SELECTION-SCREEN|START-OF-SELECTION|END-OF-SELECTION|TOP-OF-PAGE|LOAD-OF-PROGRAM|AT LINE-SELECTION|AT USER-COMMAND)\b/.test(s.up)).map(s => s.up.replace(/\s*\.?$/, '')))],
    routines: scans.flatMap(s => s.forms), methods: scans.flatMap(s => s.methods),
    selects, writes, simplification
  };
}

export type AbapStandardCandidate = { type: string; name: string; description?: string; fit?: string };
export async function verifyStandardCandidates(cands: AbapStandardCandidate[]): Promise<Record<string, string>[]> {
  const by = (t: string) => [...new Set(cands.filter(c => c.type === t).map(c => c.name.toUpperCase().replace(/'/g, '')))];
  const tc = by('TCODE'), fm = [...by('BAPI'), ...by('FM')], cds = by('CDS'), cl = by('CLASS'), tb = by('TABLE');
  const [tcR, fmR, cdsR, clR, tbR] = await Promise.all([
    tc.length ? q(`SELECT A~TCODE, B~TTEXT FROM TSTC AS A LEFT OUTER JOIN TSTCT AS B ON A~TCODE = B~TCODE AND B~SPRSL = 'E' WHERE A~TCODE IN ( ${inList(tc)} )`, 100) : Promise.resolve({ rows: [], total: 0 } as Q),
    fm.length ? q(`SELECT A~FUNCNAME, B~STEXT FROM TFDIR AS A LEFT OUTER JOIN TFTIT AS B ON A~FUNCNAME = B~FUNCNAME AND B~SPRAS = 'E' WHERE A~FUNCNAME IN ( ${inList(fm)} )`, 100) : Promise.resolve({ rows: [], total: 0 } as Q),
    cds.length ? q(`SELECT DDLNAME FROM DDDDLSRC WHERE AS4LOCAL = 'A' AND DDLNAME IN ( ${inList(cds)} )`, 100) : Promise.resolve({ rows: [], total: 0 } as Q),
    cl.length ? q(`SELECT CLSNAME FROM SEOCLASS WHERE CLSNAME IN ( ${inList(cl)} )`, 100) : Promise.resolve({ rows: [], total: 0 } as Q),
    tb.length ? q(`SELECT TABNAME FROM DD02L WHERE AS4LOCAL = 'A' AND TABNAME IN ( ${inList(tb)} )`, 100) : Promise.resolve({ rows: [], total: 0 } as Q)
  ]);
  return cands.map(c => {
    const n = c.name.toUpperCase().replace(/'/g, '');
    let exists = 'Not checkable in DB'; let systemText = '';
    if (c.type === 'TCODE') { const r = tcR.rows.find(x => x.TCODE === n); exists = r ? 'Yes' : 'No'; systemText = r?.TTEXT || ''; }
    else if (c.type === 'BAPI' || c.type === 'FM') { const r = fmR.rows.find(x => x.FUNCNAME === n); exists = r ? 'Yes' : 'No'; systemText = r?.STEXT || ''; }
    else if (c.type === 'CDS') exists = cdsR.rows.some(x => x.DDLNAME === n) ? 'Yes' : 'No';
    else if (c.type === 'CLASS') exists = clR.rows.some(x => x.CLSNAME === n) ? 'Yes' : 'No';
    else if (c.type === 'TABLE') exists = tbR.rows.some(x => x.TABNAME === n) ? 'Yes' : 'No';
    return { type: c.type, name: n, exists, systemText, description: c.description || '', fit: c.fit || '' };
  });
}

export type AbapSpecNarrative = {
  purpose?: string; businessProcess?: string; scope?: string; inputs?: { name: string; description: string }[]; outputs?: string[];
  processingSteps?: string[]; businessRules?: string[]; errorHandling?: string[]; assumptions?: string[]; technicalFlow?: string[];
  s4Standard?: { verdict?: string; explanation?: string; candidates?: AbapStandardCandidate[] }; recommendation?: string;
};

const esc = (s: any) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const htmlTable = (headers: string[], rows: (string | number)[][]) => rows.length
  ? `<table><tr>${headers.map(h => `<th>${esc(h)}</th>`).join('')}</tr>${rows.map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</table>`
  : '<p><em>None found in the live system.</em></p>';
const htmlList = (items?: string[]) => items?.length ? `<ul>${items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>` : '<p><em>Not determined.</em></p>';

export function renderAbapSpecDocument(f: AbapSpecFacts, ai: AbapSpecNarrative | null, verified: Record<string, string>[]): string {
  const n = ai || {};
  const aiNote = ai ? '' : '<p><em>The AI narrative could not be generated; this section is limited to the live technical facts.</em></p>';
  const inputDesc = (name: string) => n.inputs?.find(i => i.name?.toUpperCase() === name.toUpperCase())?.description || '';
  return `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head><meta charset='utf-8'><title>${esc(f.name)} Specification</title>
<style>body{font-family:Calibri,'Segoe UI',sans-serif;font-size:11pt;line-height:1.45}h1{color:#0a3d62;font-size:22pt}h2{color:#0a3d62;border-bottom:1px solid #0a3d62;margin-top:24pt}h3{color:#1e5f8c}table{border-collapse:collapse;width:100%;margin:6pt 0}th{background:#0a3d62;color:#fff;text-align:left}th,td{border:1px solid #9bb;padding:3pt 5pt;font-size:9.5pt;vertical-align:top}pre{font-family:Consolas,monospace;font-size:8pt;background:#f4f6f8;border:1px solid #ccd;padding:6pt;white-space:pre-wrap}.note{color:#555;font-size:9pt}</style></head><body>
<h1>Technical &amp; Functional Specification</h1>
<p><strong>${esc(f.name)}</strong>${f.title ? ` &mdash; ${esc(f.title)}` : ''}</p>
<p class='note'>Generated on ${esc(f.sysDate)} from the live S/4HANA system (S8H, client 100). Object attributes, tables, function modules, transports and runtime history are read live from the repository; the source code is read live via ADT. Functional narrative and the S/4HANA standard assessment are AI-derived from that real source and must be reviewed by the responsible consultant.</p>

<h2>1. Document Control</h2>
${htmlTable(['Attribute', 'Value'], [
    ['Object', f.name], ['Title', f.title || '—'], ['Object type', f.kind], ['Package', `${f.pkg || '—'}${f.pkgText ? ` (${f.pkgText})` : ''}`],
    ['Created', f.created], ['Last changed', f.changed], ['Transaction codes', f.tcodes.join(', ') || 'None assigned'],
    ['Saved variants', f.variants], ['Background job steps using it', f.jobSteps], ['Source units', f.units.map(u => `${u.name} (${u.lines} lines)`).join(', ')]
  ])}
<h3>Transport history</h3>
${htmlTable(['Request', 'Description', 'Owner', 'Date', 'Status'], f.transports.map(t => [t.trkorr, t.text, t.user, t.date, t.status]))}

<h2>2. Functional Specification</h2>${aiNote}
<h3>2.1 Purpose</h3><p>${esc(n.purpose || 'Not determined.')}</p>
<h3>2.2 Business process</h3><p>${esc(n.businessProcess || 'Not determined.')}</p>
<h3>2.3 Scope</h3><p>${esc(n.scope || 'Not determined.')}</p>
<h3>2.4 Inputs (selection screen)</h3>
${htmlTable(['Field', 'Type', 'Definition', 'Business meaning'], f.selection.map(s => [s.name, s.kind, s.definition, inputDesc(s.name)]))}
<h3>2.5 Processing steps</h3>${htmlList(n.processingSteps)}
<h3>2.6 Outputs</h3>${htmlList(n.outputs)}
<h3>2.7 Business rules</h3>${htmlList(n.businessRules)}
<h3>2.8 Error handling and messages</h3>${htmlList(n.errorHandling)}
<h3>2.9 Assumptions and open points</h3>${htmlList(n.assumptions)}

<h2>3. Technical Specification</h2>
<h3>3.1 Data model &mdash; database tables</h3>
${htmlTable(['Table', 'Description', 'Type', 'Access by program', 'S/4HANA simplification'], f.tables.map(t => [t.table, t.description, t.type, t.access, t.simplification]))}
<h3>3.2 Structures and types referenced</h3>
${htmlTable(['Name', 'Description'], f.structures.map(s => [s.name, s.description]))}
<h3>3.3 Function modules / BAPIs called</h3>
${htmlTable(['Function module', 'Description', 'Exists in system'], f.functions.map(x => [x.name, x.description, x.exists]))}
<h3>3.4 Classes and interfaces used</h3><p>${esc(f.classes.join(', ') || 'None')}</p>
<h3>3.5 Program structure</h3>
${htmlTable(['Element', 'Value'], [['Events', f.events.join(', ') || '—'], ['FORM routines', f.routines.join(', ') || '—'], ['Methods', f.methods.join(', ') || '—'], ['CALL TRANSACTION', f.transactionsCalled.join(', ') || '—'], ['SUBMIT', f.submits.join(', ') || '—'], ['AUTHORITY-CHECK objects', f.authChecks.join(', ') || 'None (no explicit authorization check)']])}
<h3>3.6 Database reads</h3>
${htmlTable(['Unit', 'Line', 'Tables', 'WHERE condition', 'Findings'], f.selects.map(s => [s.unit, s.line, s.tables.join(', '), s.where || '(none)', s.issues.join('; ') || '—']))}
<h3>3.7 Database updates</h3>
${htmlTable(['Table', 'Operation', 'Unit', 'Line'], f.writes.map(w => [w.table, w.op, w.unit, w.line]))}
<h3>3.8 Technical processing flow</h3>${htmlList(n.technicalFlow)}
<h3>3.9 Runtime errors in the last 30 days</h3>
${htmlTable(['Runtime error', 'Program', 'Dumps', 'Users', 'Last seen'], f.dumps.map(d => [d.error, d.program, d.count, d.users, d.lastSeen]))}

<h2>4. S/4HANA Assessment</h2>
<h3>4.1 Simplification items affecting this program (live)</h3>
${htmlTable(['Table', 'Simplification item', 'Replacement', 'Rows in this system', 'Runtime redirect', 'Impact'], f.simplification.map(s => [s.table, s.item, s.replacement, s.rows, s.redirect || '—', s.impact]))}
<h3>4.2 S/4HANA standard functionality</h3>
<p><strong>Assessment:</strong> ${esc(n.s4Standard?.verdict || 'Not determined')}</p><p>${esc(n.s4Standard?.explanation || '')}</p>
${htmlTable(['Type', 'Standard object', 'Exists in this system', 'System description', 'How it covers the requirement'], verified.map(v => [v.type, v.name, v.exists, v.systemText, v.fit || v.description]))}
<h3>4.3 Recommendation</h3><p>${esc(n.recommendation || 'Not determined.')}</p>

<h2>Appendix A &mdash; Source code (live)</h2>
<pre>${esc(f.source)}</pre>
</body></html>`;
}

export function abapSpecSections(f: AbapSpecFacts, verified: Record<string, string>[]): AbapSection[] {
  return [
    { title: `Program Facts — ${f.name}`, columns: cols(['field', 'Attribute'], ['value', 'Value']), rows: [
      { field: 'Title', value: f.title || '—' }, { field: 'Type', value: f.kind }, { field: 'Package', value: `${f.pkg}${f.pkgText ? ` (${f.pkgText})` : ''}` },
      { field: 'Created', value: f.created }, { field: 'Last changed', value: f.changed }, { field: 'Source lines', value: f.units.reduce((a, u) => a + u.lines, 0) },
      { field: 'Transaction codes', value: f.tcodes.join(', ') || 'None' }, { field: 'Function modules called', value: f.functions.map(x => x.name).join(', ') || '—' },
      { field: 'Transports', value: f.transports.map(t => t.trkorr).join(', ') || '—' }
    ], note: 'Read live from PROGDIR, TRDIRT, TADIR, TSTC, E070/E071 and the ADT source.' },
    { title: 'Database Tables Used', columns: cols(['table', 'Table'], ['description', 'Description'], ['access', 'Access'], ['simplification', 'S/4HANA Simplification']), rows: f.tables, note: 'From the where-used index D010TAB; access type from the real source statements.' },
    { title: 'S/4HANA Standard Functionality — Live Verification', columns: cols(['type', 'Type'], ['name', 'Standard Object'], ['exists', 'Exists in This System'], ['systemText', 'System Description'], ['fit', 'Coverage']), rows: verified, note: 'Candidates proposed by the AI from the program logic; each one was looked up live (TSTC, TFDIR, DDDDLSRC, SEOCLASS, DD02L).' }
  ];
}

// Picks the real live object a "this program/class/logic" code-generation request is grounded on.
export async function pickAbapCodeGenTarget(kind: AbapCodeGenTarget): Promise<{ name: string; section: AbapSection; reason: string } | null> {
  if (kind === 'CONVERT_S4') {
    const simpl = await simplificationUsage();
    const info = await programInfo(simpl.uses.map(u => u.master));
    const ranked = simpl.uses.filter(u => info.get(u.master)?.subc === '1' || classOf(u.master))
      .map(u => ({ u, breaks: u.tables.filter(t => simpl.tableStats.get(t)?.rows === 0).length }))
      .sort((a, b) => b.breaks - a.breaks || b.u.tables.length - a.u.tables.length);
    const pick = ranked[0];
    if (!pick) return null;
    const name = classOf(pick.u.master) || pick.u.master;
    return {
      name, reason: `No code was pasted, so ${name} was selected: it is the custom ${classOf(pick.u.master) ? 'class' : 'program'} with the most ECC-only table access (${pick.u.tables.join(', ')}).`,
      section: { title: 'Conversion Target — ECC Table Usage (live)', columns: cols(['program', 'Program'], ['tables', 'ECC/Simplification Tables'], ['impact', 'Impact in S/4HANA']), rows: ranked.slice(0, 10).map(r => ({ program: r.u.master, tables: r.u.tables.join(', '), impact: r.u.tables.map(t => impactOf(t, simpl.tableStats.get(t)).text).join('; ') })), note: 'Candidates from D010TAB; the first row was used to ground the conversion.' }
    };
  }
  if (kind === 'CONVERT_OO') {
    const rec = await recentCustomPrograms(15, ['1']);
    for (const p of rec.list) {
      const units = await fetchUnits(p.name);
      const scans = units.map(scanUnit);
      const forms = scans.flatMap(s => s.forms);
      const hasClass = scans.some(s => s.stmts.some(x => /^CLASS\s+\S+\s+DEFINITION/.test(x.up)));
      if (forms.length >= 2 && !hasClass) return {
        name: p.name, reason: `No program was named, so ${p.name} was selected: the most recently changed custom report that is purely procedural (${forms.length} FORM routines, no local classes).`,
        section: { title: `Conversion Target — ${p.name}`, columns: cols(['field', 'Attribute'], ['value', 'Value']), rows: [{ field: 'Program', value: p.name }, { field: 'Changed', value: `${fmtD(p.udat)} by ${p.unam}` }, { field: 'FORM routines', value: forms.join(', ') }, { field: 'Source lines', value: units.reduce((a, u) => a + u.source.split(/\r?\n/).length, 0) }], note: 'Source read live via ADT.' }
      };
    }
    return null;
  }
  const rec = await recentCustomPrograms(10, ['K']);
  const p = rec.list.find(x => classOf(x.name));
  if (!p) return null;
  const cls = classOf(p.name)!;
  const [meths, vis] = await Promise.all([
    q(`SELECT CMPNAME FROM SEOCOMPO WHERE CLSNAME = '${cls}' AND CMPTYPE = '1'`, 200),
    q(`SELECT CMPNAME, EXPOSURE FROM SEOCOMPODF WHERE CLSNAME = '${cls}' AND VERSION = '1'`, 500)
  ]);
  return {
    name: cls, reason: `No class was named, so ${cls} was selected: the most recently changed custom class (${fmtD(p.udat)} by ${p.unam}).`,
    section: { title: `Class Under Test — ${cls}`, columns: cols(['method', 'Method'], ['visibility', 'Visibility']), rows: meths.rows.map(m => { const e = vis.rows.find(v => v.CMPNAME === m.CMPNAME)?.EXPOSURE; return { method: m.CMPNAME, visibility: e === '2' ? 'Public' : e === '1' ? 'Protected' : e === '0' ? 'Private' : '' }; }), note: 'Methods read live from SEOCOMPO/SEOCOMPODF; the class source is used to ground the generated tests.' }
  };
}

// Verifies every repository object referenced in AI-generated ABAP against the live S/4HANA system.
export async function validateGeneratedAbapCode(text: string): Promise<AbapSection | null> {
  const code = [...text.matchAll(/```(?:abap|sql|cds)?\s*\n([\s\S]*?)```/gi)].map(m => m[1]).join('\n');
  if (!code.trim()) return null;
  const up = code.toUpperCase().replace(/"[^\n]*/g, '').replace(/^\*.*$/gm, '');
  const tables = new Set<string>(); const fields: [string, string][] = [];
  for (const m of up.matchAll(/\b(?:FROM|JOIN|UPDATE|MODIFY|INSERT\s+INTO|DELETE\s+FROM)\s+([A-Z][A-Z0-9_\/]{2,29})\b/g)) if (!/^(L[TSVO]_|G[TSV]_|IT_|ET_|WA_|LS_|LT_|DATA|TABLE|@)/.test(m[1])) tables.add(m[1]);
  for (const m of up.matchAll(/\bTYPE\s+(?:STANDARD\s+TABLE\s+OF\s+|TABLE\s+OF\s+|RANGE\s+OF\s+|REF\s+TO\s+)?([A-Z][A-Z0-9_\/]{2,29})-([A-Z][A-Z0-9_]{1,29})\b/g)) { tables.add(m[1]); fields.push([m[1], m[2]]); }
  const classes = new Set([...up.matchAll(/\b((?:CL|IF|CX)_[A-Z0-9_]{3,27})\b/g)].map(m => m[1]));
  const fms = new Set([...up.matchAll(/CALL FUNCTION\s+'([A-Z0-9_\/]+)'/g)].map(m => m[1]));
  if (!tables.size && !classes.size && !fms.size) return { title: 'Live Repository Check of the Generated Code', columns: cols(['object', 'Object'], ['kind', 'Kind'], ['exists', 'Exists in S/4HANA'], ['detail', 'Details']), rows: [], note: 'The generated code references no DDIC tables, classes or function modules that could be verified.' };
  const tl = [...tables].slice(0, 60); const cl = [...classes].slice(0, 60); const fl = [...fms].slice(0, 30);
  const [dd, dt, cds, seo, tf, df] = await Promise.all([
    tl.length ? q(`SELECT TABNAME, TABCLASS FROM DD02L WHERE AS4LOCAL = 'A' AND TABNAME IN ( ${inList(tl)} )`, 100) : Promise.resolve({ rows: [] } as any),
    tl.length ? q(`SELECT TABNAME, DDTEXT FROM DD02T WHERE DDLANGUAGE = 'E' AND TABNAME IN ( ${inList(tl)} )`, 100) : Promise.resolve({ rows: [] } as any),
    tl.length ? q(`SELECT DDLNAME FROM DDDDLSRC WHERE AS4LOCAL = 'A' AND DDLNAME IN ( ${inList(tl)} )`, 100) : Promise.resolve({ rows: [] } as any),
    cl.length ? q(`SELECT CLSNAME, CLSTYPE FROM SEOCLASS WHERE CLSNAME IN ( ${inList(cl)} )`, 100) : Promise.resolve({ rows: [] } as any),
    fl.length ? q(`SELECT FUNCNAME, PNAME FROM TFDIR WHERE FUNCNAME IN ( ${inList(fl)} )`, 100) : Promise.resolve({ rows: [] } as any),
    fields.length ? q(`SELECT TABNAME, FIELDNAME FROM DD03L WHERE AS4LOCAL = 'A' AND TABNAME IN ( ${inList([...new Set(fields.map(f => f[0]))])} ) AND FIELDNAME IN ( ${inList([...new Set(fields.map(f => f[1]))])} )`, 500) : Promise.resolve({ rows: [] } as any)
  ]);
  const rows: Record<string, string>[] = [];
  for (const t of tl) {
    const d = dd.rows.find((x: any) => x.TABNAME === t); const c = cds.rows.find((x: any) => x.DDLNAME === t);
    const simpl = SIMPLIFICATION[t];
    rows.push({ object: t, kind: c ? 'CDS view' : d ? (d.TABCLASS === 'VIEW' ? 'DDIC view' : d.TABCLASS === 'TRANSP' ? 'Table' : d.TABCLASS === 'INTTAB' ? 'Structure' : d.TABCLASS) : 'Table / view', exists: d || c ? 'Yes' : 'No', detail: [dt.rows.find((x: any) => x.TABNAME === t)?.DDTEXT, simpl ? `S/4HANA simplification: ${simpl.item}` : ''].filter(Boolean).join(' — ') || (d || c ? '' : 'Not found in this system — adjust before activation') });
  }
  for (const [t, f] of fields) {
    if (!dd.rows.some((x: any) => x.TABNAME === t)) continue;
    const ok = df.rows.some((x: any) => x.TABNAME === t && x.FIELDNAME === f);
    rows.push({ object: `${t}-${f}`, kind: 'Field', exists: ok ? 'Yes' : 'No', detail: ok ? '' : 'Field not found in the live table definition' });
  }
  for (const c of cl) { const s = seo.rows.find((x: any) => x.CLSNAME === c); rows.push({ object: c, kind: s ? (s.CLSTYPE === '1' ? 'Interface' : 'Class') : c.startsWith('IF_') ? 'Interface' : 'Class', exists: s ? 'Yes' : 'No', detail: s ? '' : 'Not found — a placeholder or name to create' }); }
  for (const f of fl) { const t = tf.rows.find((x: any) => x.FUNCNAME === f); rows.push({ object: f, kind: 'Function module', exists: t ? 'Yes' : 'No', detail: t ? `Function group program ${t.PNAME}` : 'Not found in this system' }); }
  const missing = rows.filter(r => r.exists === 'No').length;
  return { title: 'Live Repository Check of the Generated Code', summaryStats: [{ label: 'Objects referenced', value: String(rows.length) }, { label: 'Found in S/4HANA', value: String(rows.length - missing) }, { label: 'Not found', value: String(missing) }], columns: cols(['object', 'Object'], ['kind', 'Kind'], ['exists', 'Exists in S/4HANA'], ['detail', 'Details']), rows, note: 'Every table, field, class, interface and function module named in the generated code was looked up live (DD02L/DD03L/DDDDLSRC/SEOCLASS/TFDIR). "No" marks names that must be created or corrected before the code can be activated.' };
}
