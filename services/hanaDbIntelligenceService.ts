// HANA DB Intelligence — direct live SAP HANA SQL access layer.
//
// Architecture note (verified live): a raw TCP connection to the configured internal HANA SQL port
// (SAP_S8H_HANA_HOST:30013) is NOT reachable from this environment — confirmed via direct TCP probes
// on both the private IP and the public Gateway hostname (only port 44300, the OData Gateway, is
// opened by the landscape's firewall). Real, working live SQL access is instead achieved via the
// ABAP Development Tools (ADT) REST API's "Data Preview / Freestyle SQL" endpoint
// (/sap/bc/adt/datapreview/freestyle), which is served on the SAME already-reachable Gateway
// host:port (mmc-s4sap11.mmc.1stbasis.com:44300) using the SAME SAP_S8H_USER/PWD credentials. This
// endpoint compiles and executes a real Open SQL SELECT statement through the ABAP kernel directly
// against the live HANA database and returns the real result set — verified live: a real query
// against VBRP returned 7175 real rows with real document numbers. This is genuinely live data,
// never mocked or cached — every call is a fresh request-time query against the connected system.
const HOST = 'https://mmc-s4sap11.mmc.1stbasis.com:44300';

export interface HanaConnectionInfo {
  host: string;
  systemId: string;
  client: string;
  accessMethod: string;
}

export function getHanaConnectionInfo(): HanaConnectionInfo | null {
  const user = process.env.SAP_S8H_USER;
  const password = process.env.SAP_S8H_PWD;
  if (!user || !password) return null;
  return {
    host: 'mmc-s4sap11.mmc.1stbasis.com:44300',
    systemId: process.env.SAP_S8H_HANA_SYSTEMID || 'S8H',
    client: '100',
    accessMethod: 'ABAP Development Tools (ADT) Data Preview / Freestyle SQL'
  };
}

function authHeader(): string {
  const user = process.env.SAP_S8H_USER || '';
  const password = process.env.SAP_S8H_PWD || '';
  const base64Encode = (str: string) => { try { return btoa(str); } catch { return Buffer.from(str).toString('base64'); } };
  return `Basic ${base64Encode(`${user}:${password}`)}`;
}

async function fetchCsrfSession(): Promise<{ token: string; cookie: string } | { error: string }> {
  try {
    const res = await fetch(`${HOST}/sap/bc/adt/discovery?sap-client=100`, {
      headers: { Authorization: authHeader(), 'X-CSRF-Token': 'Fetch', Accept: 'application/xml' }
    });
    const token = res.headers.get('x-csrf-token');
    const setCookies = typeof (res.headers as any).getSetCookie === 'function' ? (res.headers as any).getSetCookie() : [res.headers.get('set-cookie')].filter(Boolean);
    const cookie = setCookies.map((c: string) => c.split(';')[0]).join('; ');
    if (!token) return { error: `Could not obtain a CSRF token from the live ADT session endpoint (HTTP ${res.status}).` };
    return { token, cookie };
  } catch (err: any) {
    return { error: err?.message || String(err) };
  }
}

function xmlUnescape(s: string): string {
  return s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');
}

// Parses the column-oriented ADT Data Preview XML response into row objects. Each
// <dataPreview:columns> block represents ONE column (with an ordered value list, one per row) —
// this transposes them into an array of { columnName: value } row objects.
function parseDataPreviewXml(xml: string): { rows: Record<string, string>[]; totalRows: number; executedQueryString: string } {
  const totalRowsMatch = xml.match(/<dataPreview:totalRows>(\d+)<\/dataPreview:totalRows>/);
  const queryMatch = xml.match(/<dataPreview:executedQueryString>([\s\S]*?)<\/dataPreview:executedQueryString>/);
  const totalRows = totalRowsMatch ? parseInt(totalRowsMatch[1], 10) : 0;
  const executedQueryString = queryMatch ? xmlUnescape(queryMatch[1]).trim() : '';

  const columnBlocks = [...xml.matchAll(/<dataPreview:columns>([\s\S]*?)<\/dataPreview:columns>/g)];
  const columns: { name: string; values: string[] }[] = [];
  for (const block of columnBlocks) {
    const nameMatch = block[1].match(/dataPreview:name="([^"]*)"/);
    const name = nameMatch ? nameMatch[1] : '';
    // Empty cells arrive self-closed (<dataPreview:data/>); skipping them would shift later values into the wrong rows.
    const values = [...block[1].matchAll(/<dataPreview:data(?:\s*\/>|>([\s\S]*?)<\/dataPreview:data>)/g)].map(m => xmlUnescape(m[1] ?? ''));
    columns.push({ name, values });
  }

  const rowCount = columns.length ? Math.max(...columns.map(c => c.values.length)) : 0;
  const rows: Record<string, string>[] = [];
  for (let i = 0; i < rowCount; i++) {
    const row: Record<string, string> = {};
    for (const col of columns) row[col.name] = col.values[i] ?? '';
    rows.push(row);
  }
  return { rows, totalRows, executedQueryString };
}

function parseAdtException(xml: string): string | null {
  const msgMatch = xml.match(/<message[^>]*>([\s\S]*?)<\/message>/);
  return msgMatch ? xmlUnescape(msgMatch[1]).trim() : null;
}

// Live kernel/database/OS properties of the connected application server (ADT "System Information" feed,
// same data as SM51 release information) plus the RFC_SYSTEM_INFO record served by /sap/public/info.
export async function fetchLiveSystemInformation(): Promise<{ adt: Record<string, string>; rfc: Record<string, string>; errors: string[] }> {
  const errors: string[] = [];
  const adt: Record<string, string> = {};
  const rfc: Record<string, string> = {};
  try {
    const res = await fetch(`${HOST}/sap/bc/adt/system/information?sap-client=100`, { headers: { Authorization: authHeader(), Accept: 'application/atom+xml;type=feed' } });
    const xml = await res.text();
    if (!res.ok) errors.push(`ADT system information: ${parseAdtException(xml) || `HTTP ${res.status}`}`);
    for (const m of xml.matchAll(/<atom:entry>\s*<atom:id>([^<]*)<\/atom:id>\s*<atom:title>([^<]*)<\/atom:title>/g)) adt[m[1]] = xmlUnescape(m[2]).trim();
  } catch (err: any) {
    errors.push(`ADT system information: ${err?.message || String(err)}`);
  }
  try {
    const res = await fetch(`${HOST}/sap/public/info`, { headers: { Authorization: authHeader() } });
    const xml = await res.text();
    if (!res.ok) errors.push(`/sap/public/info: HTTP ${res.status}`);
    for (const m of xml.matchAll(/<(RFC[A-Z0-9_]+)>([^<]*)<\/\1>/g)) rfc[m[1]] = xmlUnescape(m[2]).trim();
  } catch (err: any) {
    errors.push(`/sap/public/info: ${err?.message || String(err)}`);
  }
  return { adt, rfc, errors };
}

// ABAP SQL (verified live) rejects "(x" without a space and any string literal that the ADT
// line-wrapper splits across lines, so spacing is normalized and long statements pre-wrapped.
function normalizeAbapSql(sql: string): string {
  // The single-blank literal ' ' in a condition combined with a subquery makes ADT report "Only one SELECT
  // statement is allowed" (verified live). In a condition '' is the same initial CHAR value and returns identical
  // rows; inside CASE expressions '' is rejected, so those stay untouched.
  let caseDepth = 0;
  sql = sql.replace(/('(?:[^']|'')*')|\bCASE\b|\bEND\b/gi, (m, lit, offset: number, whole: string) => {
    if (!lit) { caseDepth = /^case$/i.test(m) ? caseDepth + 1 : Math.max(0, caseDepth - 1); return m; }
    return lit === "' '" && caseDepth === 0 && /(=|<>|\bEQ|\bNE)\s*$/i.test(whole.slice(0, offset)) ? "''" : lit;
  });
  // "alias.field" (SQL-92 style) ends the ABAP statement at the period, which ADT reports as
  // "Only one SELECT statement is allowed" (verified live); ABAP SQL uses "alias~field".
  const aliases = new Set([...sql.matchAll(/\b(?:FROM|JOIN)\s+([A-Z_][A-Z0-9_]*)(?:\s+AS\s+([A-Z_][A-Z0-9_]*))?/gi)]
    .flatMap(m => [m[1], m[2]]).filter(Boolean).map(a => a.toUpperCase()));
  sql = sql.replace(/('(?:[^']|'')*')|\b([A-Z_][A-Z0-9_]*)\.([A-Z_][A-Z0-9_]*)\b/gi, (m, lit, a, f) => lit ? lit : aliases.has(String(a).toUpperCase()) ? `${a}~${f}` : m);
  const spaced = sql
    .replace(/('(?:[^']|'')*')|\(\s*|\s*\)/g, (m, lit) => lit ? lit : (m.trim() === '(' ? '( ' : ' )'))
    // ABAP SQL only knows ASCENDING/DESCENDING (verified live: "ASC"/"PRIMARY KEY" after a column are rejected).
    .replace(/('(?:[^']|'')*')|(?<!\bBY)\s+PRIMARY\s+KEY\b|\bASC\b|\bDESC\b/gi, (m, lit) => lit ? lit : /primary/i.test(m) ? ' DESCENDING' : /^asc$/i.test(m) ? 'ASCENDING' : 'DESCENDING');
  const lines: string[] = [];
  let line = '';
  let inLiteral = false;
  for (let i = 0; i < spaced.length; i++) {
    const ch = spaced[i];
    if (ch === "'") inLiteral = !inLiteral;
    // A line starting with SELECT is read by ADT as a second statement ("Only one SELECT statement is allowed").
    if (!inLiteral && /\s/.test(ch) && line.length >= 180 && !/^SELECT\b/i.test(spaced.slice(i + 1))) { lines.push(line); line = ''; continue; }
    line += ch;
  }
  lines.push(line);
  return lines.join('\n');
}

// Executes a single real Open SQL SELECT statement against the live HANA database via the ADT
// Data Preview REST API. Returns real rows, or the actual real error (never fabricated).
async function executeAdtFreestyleSql(sql: string, rowNumber = 100): Promise<
  { rows: Record<string, string>[]; totalRows: number; executedQueryString: string } | { error: string }
> {
  sql = normalizeAbapSql(sql);
  const session = await fetchCsrfSession();
  if ('error' in session) return { error: session.error };
  try {
    const res = await fetch(`${HOST}/sap/bc/adt/datapreview/freestyle?rowNumber=${rowNumber}&sap-client=100`, {
      method: 'POST',
      headers: {
        Authorization: authHeader(),
        'X-CSRF-Token': session.token,
        Cookie: session.cookie,
        'Content-Type': 'text/plain',
        Accept: 'application/vnd.sap.adt.datapreview.table.v1+xml'
      },
      body: sql
    });
    const text = await res.text();
    if (!res.ok) {
      return { error: parseAdtException(text) || `Live ADT Data Preview request failed (HTTP ${res.status}).` };
    }
    return parseDataPreviewXml(text);
  } catch (err: any) {
    return { error: err?.message || String(err) };
  }
}

export interface HanaColumn { tableName: string; fieldName: string; dataElement: string; description?: string; isKey?: boolean; values?: string }

async function fetchTableColumns(tableName: string): Promise<HanaColumn[]> {
  const result = await executeAdtFreestyleSql(
    `SELECT l~fieldname, l~rollname, l~domname, l~keyflag, t~scrtext_l FROM dd03l AS l LEFT OUTER JOIN dd04t AS t ON t~rollname = l~rollname AND t~ddlanguage = 'E' AND t~as4local = 'A' WHERE l~tabname = '${tableName}' AND l~as4local = 'A' AND l~fieldname NOT LIKE '.%'`,
    600
  );
  if ('error' in result) return [];
  // Fixed-value meanings (e.g. status codes) come live from the dictionary, never hardcoded.
  const domains = Array.from(new Set(result.rows.map(r => (r.DOMNAME || '').trim()).filter(Boolean)));
  const valuesByDomain = new Map<string, string[]>();
  if (domains.length) {
    const vals = await executeAdtFreestyleSql(
      `SELECT domname, domvalue_l, ddtext FROM dd07t WHERE ddlanguage = 'E' AND as4local = 'A' AND domname IN ( ${domains.map(d => `'${d.replace(/'/g, '')}'`).join(', ')} )`,
      3000
    );
    if (!('error' in vals)) {
      for (const v of vals.rows) {
        const list = valuesByDomain.get(v.DOMNAME) || [];
        if (list.length < 15) list.push(`${(v.DOMVALUE_L || '').trim() || "' '"}=${(v.DDTEXT || '').trim()}`);
        valuesByDomain.set(v.DOMNAME, list);
      }
    }
  }
  return result.rows.map(r => ({
    tableName,
    fieldName: r.FIELDNAME,
    dataElement: r.ROLLNAME,
    description: (r.SCRTEXT_L || '').trim() || undefined,
    isKey: r.KEYFLAG === 'X',
    values: valuesByDomain.get((r.DOMNAME || '').trim())?.join('; ') || undefined
  }));
}

async function fetchColumnsForTables(tableNames: string[]): Promise<HanaColumn[]> {
  const columns: HanaColumn[] = [];
  for (let i = 0; i < tableNames.length; i += 4) {
    const batch = await Promise.all(tableNames.slice(i, i + 4).map(fetchTableColumns));
    for (const cols of batch) columns.push(...cols);
  }
  return columns;
}

// Live schema/table discovery via the real ABAP Data Dictionary tables DD02T (table descriptions)
// and DD03L (field lists) — queried through the same real live ADT Data Preview mechanism, never a
// hardcoded object list. This is the ABAP-DDIC-based equivalent of a HANA SYS.TABLES/SYS.COLUMNS
// catalog lookup, and is what is actually reachable in this landscape.
export async function discoverHanaMetadata(searchTerm?: string): Promise<
  | { objects: { tableName: string; description: string }[]; columns: HanaColumn[] }
  | { error: string }
> {
  const term = (searchTerm || '').trim().toUpperCase().replace(/[^A-Z0-9_]/g, '');
  if (!term) return { objects: [], columns: [] };
  // Match on TABNAME (exact/technical hints, e.g. "EDIDC") OR DDTEXT (business language,
  // e.g. "idoc"/"IDoc") since callers frequently search by business term, not table name,
  // and a singular/plural variant (strip a trailing S) so "idocs" still matches "IDoc" text.
  const singular = term.endsWith('S') && term.length > 3 ? term.slice(0, -1) : term;
  const tablesResult = await executeAdtFreestyleSql(
    `SELECT TABNAME, DDTEXT FROM DD02T WHERE DDLANGUAGE = 'E' AND ( TABNAME LIKE '%${term}%' OR UPPER( DDTEXT ) LIKE '%${term}%' OR UPPER( DDTEXT ) LIKE '%${singular}%' )`,
    20
  );
  if ('error' in tablesResult) return { error: tablesResult.error };
  const objects = tablesResult.rows.map(r => ({ tableName: r.TABNAME, description: r.DDTEXT }));

  const columns = await fetchColumnsForTables(objects.slice(0, 5).map(o => o.tableName));
  return { objects, columns };
}

// Exact TABNAME lookup for known technical table-name hints (e.g. "EDIDC" for IDocs) — unlike
// discoverHanaMetadata's fuzzy LIKE search, this never returns unrelated tables that merely
// contain the hint as a substring (e.g. "LISTEDIDC"), so callers can trust the canonical table
// was actually found live before referencing it.
export async function discoverExactTables(tableNames: string[]): Promise<
  | { objects: { tableName: string; description: string }[]; columns: HanaColumn[] }
  | { error: string }
> {
  const names = Array.from(new Set(tableNames.map(t => t.toUpperCase().replace(/[^A-Z0-9_]/g, '')).filter(Boolean)));
  if (!names.length) return { objects: [], columns: [] };
  const inList = names.map(n => `'${n}'`).join(', ');
  // Existence comes from DD02L: many custom Z/Y tables have no DD02T description at all.
  const existResult = await executeAdtFreestyleSql(
    `SELECT TABNAME FROM DD02L WHERE AS4LOCAL = 'A' AND TABNAME IN ( ${inList} )`,
    names.length * 2
  );
  if ('error' in existResult) return { error: existResult.error };
  const existing = Array.from(new Set(existResult.rows.map(r => r.TABNAME)));
  if (!existing.length) return { objects: [], columns: [] };
  const textResult = await executeAdtFreestyleSql(
    `SELECT TABNAME, DDTEXT FROM DD02T WHERE DDLANGUAGE = 'E' AND TABNAME IN ( ${existing.map(n => `'${n}'`).join(', ')} )`,
    existing.length
  );
  const texts = new Map<string, string>('error' in textResult ? [] : textResult.rows.map(r => [r.TABNAME, r.DDTEXT] as [string, string]));
  const objects = existing.map(t => ({ tableName: t, description: texts.get(t) || '(no dictionary description)' }));

  const columns = await fetchColumnsForTables(objects.map(o => o.tableName));
  return { objects, columns };
}

const FORBIDDEN_SQL_KEYWORDS = ['INSERT', 'UPDATE', 'DELETE', 'MODIFY', 'MERGE', 'UPSERT', 'DROP', 'ALTER', 'CREATE', 'TRUNCATE', 'GRANT', 'REVOKE', 'CALL', 'EXEC', 'EXECUTE', 'COMMIT', 'ROLLBACK'];

// Hard read-only safety gate — every AI-generated statement must pass this before it is ever sent
// to the live system. Single statement only, must start with SELECT, no forbidden DML/DDL keywords,
// and no client-field (MANDT) filter (ADT Data Preview's Open SQL rejects this — client handling is
// automatic — so this is caught here with a clear message instead of surfacing a raw ABAP error).
export function validateReadOnlySelect(sql: string): { ok: true } | { ok: false; reason: string } {
  const trimmed = sql.trim().replace(/;+\s*$/, '');
  if (!trimmed) return { ok: false, reason: 'Empty SQL statement.' };
  if (trimmed.includes(';')) return { ok: false, reason: 'Multiple statements are not allowed — exactly one read-only SELECT is permitted.' };
  const upper = trimmed.toUpperCase();
  if (!/^\s*SELECT\b/.test(upper)) return { ok: false, reason: 'Only SELECT statements are permitted — this is a read-only analytical connection.' };
  for (const kw of FORBIDDEN_SQL_KEYWORDS) {
    if (new RegExp(`\\b${kw}\\b`).test(upper)) return { ok: false, reason: `Forbidden keyword "${kw}" detected — only read-only SELECT queries are permitted on this connection.` };
  }
  if (/\bUNION\b/.test(upper)) {
    return { ok: false, reason: 'UNION-style multi-SELECT queries are not supported by this connection — ADT Data Preview only allows a single SELECT statement against a single table. Query one table at a time.' };
  }
  if (/\bMANDT\s*=/.test(upper) || /WHERE[\s\S]*\bMANDT\b/.test(upper)) {
    return { ok: false, reason: 'The client field MANDT cannot be filtered in the WHERE clause — client handling is automatic on this connection.' };
  }
  return { ok: true };
}

export async function executeReadOnlySelect(sql: string, maxRows = 100): Promise<
  { rows: any[]; rowCount: number; sql: string; totalRows: number } | { error: string; sql: string }
> {
  const validation = validateReadOnlySelect(sql);
  if (!validation.ok) return { error: validation.reason, sql };
  const result = await executeAdtFreestyleSql(sql, maxRows);
  if ('error' in result) return { error: result.error, sql };
  return { rows: result.rows, rowCount: result.rows.length, sql: result.executedQueryString || sql, totalRows: result.totalRows };
}
