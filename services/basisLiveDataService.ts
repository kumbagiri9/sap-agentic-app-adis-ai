// Live SAP Basis answers read directly from the S/4HANA database via ADT Open SQL (read-only).
// Every figure comes from a live table; nothing is cached, simulated or hardcoded.
import { executeReadOnlySelect, fetchLiveSystemInformation } from './hanaDbIntelligenceService';
import { spawn } from 'child_process';
import path from 'path';

export type BasisIntent =
  | 'KERNEL_VERSION' | 'LOCK_ENTRIES'
  | 'ALERTS' | 'RESPONSE_TIME' | 'EXPENSIVE_TX' | 'OVERLOADED' | 'ENQUEUE' | 'TOP_PROBLEMS' | 'FIX_FIRST'
  | 'JOBS_FAILED_OVERNIGHT' | 'JOBS_FAILED' | 'JOB_WHY' | 'JOBS_LONG_RUNNING' | 'JOBS_DELAYED' | 'JOBS_NOT_STARTED'
  | 'JOBS_RUNTIME_EXCEEDED' | 'JOBS_TONIGHT' | 'JOBS_RESTARTABLE' | 'JOB_RESTART' | 'JOBS_SLA'
  | 'DUMPS_REPEATED' | 'DUMPS_LIST' | 'SYSLOG' | 'ERRORS_AFTER_TRANSPORT' | 'UPDATE_FAILURES' | 'ERRORS_BUSINESS'
  | 'CORRELATE' | 'ROOT_CAUSE_TODAY' | 'IMMEDIATE_ACTION'
  | 'WHY_SLOW' | 'WP_STUCK' | 'RESOURCE_CONSUMERS' | 'WP_UTIL' | 'MEMORY' | 'LAYER_ANALYSIS' | 'COMPARE_DAYS' | 'CAPACITY'
  | 'USERS_LOCKED' | 'FAILED_LOGINS' | 'TECH_USER_AUTH' | 'RFC_FAILING' | 'SM58' | 'QRFC' | 'CERT_EXPIRY'
  | 'INTERFACES_DOWN' | 'PRIVILEGED' | 'AUDIT_RISKS';

export type BasisSection = {
  title: string;
  summaryStats?: { label: string; value: string }[];
  columns: { key: string; label: string }[];
  rows: Record<string, string | number>[];
  note?: string;
  pageSize?: number;
  downloadable?: boolean;
};
export type BasisLiveReport = { text: string; sections: BasisSection[]; assess: boolean };

export function classifyBasisLiveIntent(n: string): BasisIntent | null {
  const has = (...w: string[]) => w.some(x => n.includes(x));
  if (/\bkernel\b/.test(n) && has('version', 'release', 'patch level', 'patch', 'current', 'which', 'what', 'details', 'information', 'info') && !has('upgrade', 'install', 'apply', 'update the', 'download')) return 'KERNEL_VERSION';
  if ((/\blocks\b/.test(n) || has('lock entries', 'lock entry', 'lock table', 'sm12', 'enqueue entries', 'enqueue table')) && !has('issue', 'problem', 'unlock', 'locked user', 'users locked', 'user lock')) return 'LOCK_ENTRIES';
  const job = /\bjobs?\b/.test(n);
  if (job) {
    if (/why did job\s+\S+\s+fail/.test(n)) return 'JOB_WHY';
    if (has('overnight') && has('fail')) return 'JOBS_FAILED_OVERNIGHT';
    if (has('long-running', 'long running', 'longrunning')) return 'JOBS_LONG_RUNNING';
    if (has('normal runtime') || (has('exceed') && has('runtime'))) return 'JOBS_RUNTIME_EXCEEDED';
    if (has('sla')) return 'JOBS_SLA';
    if (has('did not start', 'didn\'t start', 'not started')) return 'JOBS_NOT_STARTED';
    if (has('delayed')) return 'JOBS_DELAYED';
    if (has('tonight')) return 'JOBS_TONIGHT';
    if (has('safely') && has('restart')) return 'JOBS_RESTARTABLE';
    if (/\brestart\b/.test(n) && has('fail')) return 'JOB_RESTART';
    if (has('correlate') && has('dump', 'transport')) return 'CORRELATE';
    if (/\b(fail(ed|ing|ures?)?|cancell?ed|aborted|terminated)\b/.test(n) && !has('predict', 'sla', 'restart', 'why')) return 'JOBS_FAILED';
  }
  if (has('correlate') && has('dump') && has('transport')) return 'CORRELATE';
  if (has('critical alert')) return 'ALERTS';
  if (has('most expensive') && has('transaction')) return 'EXPENSIVE_TX';
  if (has('response time') && has('system', 'transaction', 'highest')) return 'RESPONSE_TIME';
  if (has('overloaded') && has('application server', 'app server')) return 'OVERLOADED';
  if (has('enqueue') || (has('lock issue', 'lock problem'))) return 'ENQUEUE';
  if (has('technical problem')) return 'TOP_PROBLEMS';
  if (has('basis team') && has('fix')) return 'FIX_FIRST';
  if (has('dump') && has('repeated', 'recurring', 'occurring again')) return 'DUMPS_REPEATED';
  if (has('sm21', 'system log')) return 'SYSLOG';
  if (has('after the latest transport', 'after the last transport')) return 'ERRORS_AFTER_TRANSPORT';
  if (has('sm13', 'update failure')) return 'UPDATE_FAILURES';
  if (has('impacting business transaction', 'affecting business transaction')) return 'ERRORS_BUSINESS';
  if (has('root cause') && has('error') && has('today')) return 'ROOT_CAUSE_TODAY';
  if (has('require immediate action', 'need immediate action', 'requires immediate action')) return 'IMMEDIATE_ACTION';
  if (has('running slowly', 'running slow', 'sap slow') && has('sap', 'system')) return 'WHY_SLOW';
  if (has('work process') && has('stuck', 'hanging', 'hung')) return 'WP_STUCK';
  if (has('work process utili')) return 'WP_UTIL';
  if (has('consuming the most resources') || (has('resource') && has('consum') && has('user', 'program'))) return 'RESOURCE_CONSUMERS';
  if (has('memory bottleneck')) return 'MEMORY';
  if (has('hana, network', 'hana or network') || (has('custom abap') && has('network'))) return 'LAYER_ANALYSIS';
  if (has('compare') && has('performance') && has('yesterday')) return 'COMPARE_DAYS';
  if (has('system capacity')) return 'CAPACITY';
  if (has('users are locked', 'locked users')) return 'USERS_LOCKED';
  if (has('failed login', 'failed logon', 'login attempt', 'logon attempt')) return 'FAILED_LOGINS';
  if (has('technical user') && has('authenticat', 'logon', 'login')) return 'TECH_USER_AUTH';
  if (has('rfc destination') && has('fail', 'error')) return 'RFC_FAILING';
  if (has('sm58')) return 'SM58';
  if (has('qrfc')) return 'QRFC';
  if (has('certificate') && has('expir') && !has('quality', 'safety', 'supplier')) return 'CERT_EXPIRY';
  if (has('interface') && has('unavailable', 'down')) return 'INTERFACES_DOWN';
  if (has('privileged account')) return 'PRIVILEGED';
  if (has('audit risk') && has('basis')) return 'AUDIT_RISKS';
  // ST22-named and explain/code-generation requests stay with the ABAP agent.
  if (/\bdumps?\b/.test(n) && !has('st22', 'explain', 'write', 'generate', 'create', 'abap code', 'abap program', 'heap dump', 'core dump', 'database dump')) return 'DUMPS_LIST';
  return null;
}

// ---------- live query helpers ----------
type Q = { rows: Record<string, string>[]; total: number; error?: string };
async function q(sql: string, maxRows = 500): Promise<Q> {
  const r: any = await executeReadOnlySelect(sql, maxRows);
  if ('error' in r) return { rows: [], total: 0, error: r.error };
  return { rows: r.rows.map((row: any) => Object.fromEntries(Object.entries(row).map(([k, v]) => [k, String(v ?? '').trim()]))), total: r.totalRows ?? r.rowCount };
}
const num = (v: any) => Number(String(v ?? '').trim()) || 0;
const fmtD = (d: string) => /^\d{8}$/.test(d) && d !== '00000000' ? `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6)}` : (d === '00000000' ? '' : d);
const fmtT = (t: string) => /^\d{6}$/.test(t) ? `${t.slice(0, 2)}:${t.slice(2, 4)}:${t.slice(4)}` : t;
const addDays = (d: string, days: number) => {
  const dt = new Date(Date.UTC(+d.slice(0, 4), +d.slice(4, 6) - 1, +d.slice(6, 8) + days));
  return `${dt.getUTCFullYear()}${String(dt.getUTCMonth() + 1).padStart(2, '0')}${String(dt.getUTCDate()).padStart(2, '0')}`;
};
const secsOf = (t: string) => num(t.slice(0, 2)) * 3600 + num(t.slice(2, 4)) * 60 + num(t.slice(4, 6));
const hhmmss = (s: number) => `${String(Math.floor(s / 3600)).padStart(2, '0')}${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}${String(s % 60).padStart(2, '0')}`;
const dur = (s: number) => s >= 3600 ? `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m` : s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`;
const inList = (vals: string[]) => vals.map(v => `'${v.replace(/'/g, "''")}'`).join(', ');
const cols = (...pairs: [string, string][]) => pairs.map(([key, label]) => ({ key, label }));

// Live lock table (SM12): ENQUEUE_READ through the read-only S/4HANA RFC bridge (SAProuter); lock entries live
// in the enqueue server's memory, not in any database table.
async function readLiveLockTable(client: string): Promise<{ rows: Record<string, any>[]; number: number; error?: string }> {
  const payload = JSON.stringify({ action: 'execute_function', functionName: 'ENQUEUE_READ', importParams: { GCLIENT: client, GUNAME: '*', GNAME: '', GARG: '' }, exportParamNames: ['NUMBER', 'SUBRC'], outputTableNames: ['ENQ'] });
  const python = process.env.SAP_ECC_PYTHON || 'python';
  const bridge = path.resolve(process.cwd(), 'services', 'sap_s4_rfc_bridge.py');
  let lastError = '';
  for (let attempt = 1; attempt <= 4; attempt++) {
    const out = await new Promise<{ stdout: string; stderr: string; code: number | null; err?: string }>(resolve => {
      const child = spawn(python, [bridge], { env: process.env, windowsHide: true });
      let stdout = ''; let stderr = '';
      const timer = setTimeout(() => { child.kill(); resolve({ stdout, stderr, code: null, err: 'RFC call timed out after 90 s' }); }, 90_000);
      child.stdout.on('data', d => { stdout += d; });
      child.stderr.on('data', d => { stderr += d; });
      child.on('error', e => { clearTimeout(timer); resolve({ stdout, stderr, code: null, err: e.message }); });
      child.on('close', code => { clearTimeout(timer); resolve({ stdout, stderr, code }); });
      child.stdin.end(payload);
    });
    let res: any = null;
    try { res = JSON.parse(out.stdout.trim()); } catch { /* handled below */ }
    if (res?.ok) return { rows: res.result?.outputTables?.ENQ || [], number: num(res.result?.exportParams?.NUMBER) };
    lastError = res?.error || out.err || out.stderr.trim() || `RFC bridge exited with code ${out.code}`;
    if (!/Member not found|DISP_E_MEMBERNOTFOUND|-2147352573/i.test(lastError)) break;
    await new Promise(r => setTimeout(r, 400 * attempt));
  }
  return { rows: [], number: 0, error: lastError };
}
const rfcDate = (v: any) => { const m = String(v ?? '').match(/^(\d{4})-?(\d{2})-?(\d{2})/); return m ? `${m[1]}${m[2]}${m[3]}` : ''; };
const rfcTime = (v: any) => { const s = String(v ?? ''); const m = s.match(/(\d{2}):(\d{2}):(\d{2})/) || s.match(/^(\d{2})(\d{2})(\d{2})$/); return m ? `${m[1]}${m[2]}${m[3]}` : ''; };

async function sysNow(): Promise<{ date: string; time: string }> {
  const r = await q('SELECT DISTINCT @sy-datum AS D, @sy-uzeit AS T FROM T000', 1);
  if (r.rows[0]) return { date: r.rows[0].D, time: r.rows[0].T };
  const d = new Date();
  return { date: `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`, time: hhmmss(d.getUTCHours() * 3600 + d.getUTCMinutes() * 60 + d.getUTCSeconds()) };
}

// SM37 status codes (SAP standard, domain has no fixed-value texts in this system).
const JOB_STATUS: Record<string, string> = { A: 'Cancelled', F: 'Finished', R: 'Active', S: 'Released', P: 'Scheduled', Y: 'Ready', Z: 'Released/Suspended' };
const RT = 'DATS_DAYS_BETWEEN( STRTDATE, ENDDATE ) * 86400 + CAST( SUBSTRING( ENDTIME, 1, 2 ) AS INT4 ) * 3600 + CAST( SUBSTRING( ENDTIME, 3, 2 ) AS INT4 ) * 60 + CAST( SUBSTRING( ENDTIME, 5, 2 ) AS INT4 ) - ( CAST( SUBSTRING( STRTTIME, 1, 2 ) AS INT4 ) * 3600 + CAST( SUBSTRING( STRTTIME, 3, 2 ) AS INT4 ) * 60 + CAST( SUBSTRING( STRTTIME, 5, 2 ) AS INT4 ) )';

async function jobRuntimeStats(fromDate: string, toDate?: string): Promise<Q> {
  return q(`SELECT JOBNAME, COUNT( * ) AS RUNS, SUM( ${RT} ) AS TOTAL_SEC, MAX( ${RT} ) AS MAX_SEC FROM TBTCO WHERE STATUS = 'F' AND STRTDATE >= '${fromDate}'${toDate ? ` AND STRTDATE <= '${toDate}'` : ''} GROUP BY JOBNAME ORDER BY MAX_SEC DESCENDING`, 3000);
}

// SNAP_BEG.FLIST is a sequence of <2-char key><3-digit length><value>; FC = runtime error, AP = program.
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
type Dump = { date: string; time: string; user: string; host: string; error: string; program: string };
async function dumps(fromDate: string, toDate?: string, maxRows = 3000): Promise<{ list: Dump[]; total: number; error?: string }> {
  const r = await q(`SELECT DATUM, UZEIT, UNAME, AHOST, FLIST FROM SNAP_BEG WHERE SEQNO = '000' AND DATUM >= '${fromDate}'${toDate ? ` AND DATUM <= '${toDate}'` : ''} ORDER BY DATUM DESCENDING, UZEIT DESCENDING`, maxRows);
  return {
    list: r.rows.map(x => { const f = parseFlist(x.FLIST || ''); return { date: x.DATUM, time: x.UZEIT, user: x.UNAME, host: x.AHOST, error: f.FC || '(unknown)', program: f.AP || '' }; }),
    total: r.total, error: r.error
  };
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
const DUMP_COLS = cols(['error', 'Runtime Error'], ['program', 'Program'], ['count', 'Dumps'], ['users', 'Users Affected'], ['firstSeen', 'First Seen'], ['lastSeen', 'Last Seen']);

// CCMS alert values: 3 = red, 2 = yellow (CCMS convention; the domain has no fixed-value texts).
type Alert = { date: string; time: string; system: string; object: string; attribute: string; severity: string; open: boolean; message: string };
async function alerts(fromDate: string, opts: { redOnly?: boolean; objects?: string[] } = {}): Promise<{ list: Alert[]; total: number; error?: string }> {
  const where = [`ALERTDATE >= '${fromDate}'`, `OBJECTNAME NOT LIKE 'CD$%'`, opts.redOnly ? `VALUE = '3'` : `VALUE IN ( '2', '3' )`];
  if (opts.objects?.length) where.push(`OBJECTNAME IN ( ${inList(opts.objects)} )`);
  // Arguments 1/3 of 'Security' alerts contain characters the ADT XML serializer rejects (verified live).
  const r = await q(`SELECT ALERTDATE, ALERTTIME, MTMCNAME, OBJECTNAME, FIELDNAME, VALUE, GONEDATE, MSGTEXT, CASE WHEN OBJECTNAME = 'Security' THEN ' ' ELSE MSGARG1 END AS MSGARG1, MSGARG2, CASE WHEN OBJECTNAME = 'Security' THEN ' ' ELSE MSGARG3 END AS MSGARG3, MSGARG4 FROM ALALERTDB WHERE ${where.join(' AND ')} ORDER BY ALERTDATE DESCENDING, ALERTTIME DESCENDING`, 3000);
  return {
    list: r.rows.map(x => ({
      date: x.ALERTDATE, time: x.ALERTTIME, system: x.MTMCNAME, object: x.OBJECTNAME, attribute: x.FIELDNAME,
      severity: x.VALUE === '3' ? 'Red' : 'Yellow', open: x.GONEDATE === '00000000' || !x.GONEDATE,
      message: (x.MSGTEXT || '').replace(/&([1-4])/g, (_, i) => x[`MSGARG${i}`] || '').replace(/\s+/g, ' ').trim()
    })),
    total: r.total, error: r.error
  };
}
function groupAlerts(list: Alert[]) {
  const m = new Map<string, { system: string; object: string; attribute: string; severity: string; count: number; open: number; last: string; lastMessage: string }>();
  for (const a of list) {
    const k = `${a.system}|${a.object}|${a.attribute}|${a.severity}`;
    const e = m.get(k) || { system: a.system, object: a.object, attribute: a.attribute, severity: a.severity, count: 0, open: 0, last: '', lastMessage: '' };
    e.count++; if (a.open) e.open++;
    const ts = `${a.date}${a.time}`; if (ts > e.last) { e.last = ts; e.lastMessage = a.message; }
    m.set(k, e);
  }
  return [...m.values()].sort((a, b) => (b.severity === 'Red' ? 1 : 0) - (a.severity === 'Red' ? 1 : 0) || b.count - a.count)
    .map(e => ({ ...e, last: `${fmtD(e.last.slice(0, 8))} ${fmtT(e.last.slice(8))}` }));
}
const ALERT_GROUP_COLS = cols(['severity', 'Severity'], ['system', 'Monitored Component'], ['object', 'Object'], ['attribute', 'Attribute'], ['count', 'Alerts'], ['open', 'Still Open'], ['last', 'Last Alert'], ['lastMessage', 'Last Message']);
const ALERT_COLS = cols(['date', 'Date'], ['time', 'Time'], ['severity', 'Severity'], ['system', 'Component'], ['object', 'Object'], ['attribute', 'Attribute'], ['message', 'Message'], ['status', 'Status']);
const alertRow = (a: Alert) => ({ date: fmtD(a.date), time: fmtT(a.time), severity: a.severity, system: a.system, object: a.object, attribute: a.attribute, message: a.message, status: a.open ? 'Open' : 'Closed' });

async function osHistory() {
  const r = await q('SELECT SERVER, ADATE, CPUUSERAVG, CPUSYSTAVG, CPUIDLEAVG, PAGINAVG, PAGEOUTAVG, MAXSWAPSIZ, MINSWAPFRE FROM OSMON ORDER BY ADATE DESCENDING', 500);
  return {
    list: r.rows.map(x => ({
      server: x.SERVER, date: x.ADATE, cpu: 100 - num(x.CPUIDLEAVG), cpuUser: num(x.CPUUSERAVG), cpuSystem: num(x.CPUSYSTAVG),
      pagedIn: num(x.PAGINAVG), pagesOut: num(x.PAGEOUTAVG),
      swapUsed: num(x.MAXSWAPSIZ) > 0 ? Math.round(((num(x.MAXSWAPSIZ) - num(x.MINSWAPFRE)) / num(x.MAXSWAPSIZ)) * 1000) / 10 : 0
    })), error: r.error
  };
}
const OS_COLS = cols(['server', 'Server'], ['date', 'Date'], ['cpu', 'CPU Used %'], ['cpuUser', 'CPU User %'], ['cpuSystem', 'CPU System %'], ['swapUsed', 'Swap Used %'], ['pagedIn', 'Avg Paged In (KB)'], ['pagesOut', 'Pages Out / Hour']);

async function failedJobs(where: string, maxRows = 500) {
  return q(`SELECT JOBNAME, JOBCOUNT, STATUS, SDLUNAME, STRTDATE, STRTTIME, ENDDATE, ENDTIME, EXECSERVER, JOBCLASS, PERIODIC FROM TBTCO WHERE ${where} ORDER BY ENDDATE DESCENDING, ENDTIME DESCENDING`, maxRows);
}
const jobRow = (x: Record<string, string>) => ({
  job: x.JOBNAME, count: x.JOBCOUNT, status: JOB_STATUS[x.STATUS] || x.STATUS, user: x.SDLUNAME,
  start: `${fmtD(x.STRTDATE || x.SDLSTRTDT || '')} ${fmtT(x.STRTTIME || x.SDLSTRTTM || '')}`.trim(), end: `${fmtD(x.ENDDATE || '')} ${fmtT(x.ENDTIME || '')}`.trim(),
  server: x.EXECSERVER || '', jobClass: x.JOBCLASS || '', periodic: x.PERIODIC === 'X' ? 'Yes' : 'No'
});
const JOB_COLS = cols(['job', 'Job Name'], ['count', 'Job Count'], ['status', 'Status'], ['user', 'Scheduled By'], ['start', 'Start'], ['end', 'End'], ['server', 'Server'], ['jobClass', 'Class'], ['periodic', 'Periodic']);

async function updateFailures(fromDate?: string) {
  return q(`SELECT A~VBKEY, A~VBUSR, A~VBDATE, A~VBTCODE, A~VBRC, A~VBREPORT, B~VBFUNC, B~ARBGB, B~MSGNR FROM VBHDR AS A LEFT OUTER JOIN VBERROR AS B ON A~VBKEY = B~VBKEY WHERE A~VBRC <> 0${fromDate ? ` AND A~VBDATE >= '${fromDate}000000'` : ''} ORDER BY A~VBDATE DESCENDING`, 500);
}
const updRow = (x: Record<string, string>) => ({ date: `${fmtD(x.VBDATE.slice(0, 8))} ${fmtT(x.VBDATE.slice(8, 14))}`, user: x.VBUSR, tcode: x.VBTCODE, report: x.VBREPORT, func: x.VBFUNC, message: x.ARBGB ? `${x.ARBGB} ${x.MSGNR}` : '', rc: x.VBRC });
const UPD_COLS = cols(['date', 'Date/Time'], ['user', 'User'], ['tcode', 'Transaction'], ['report', 'Program'], ['func', 'Update Function'], ['message', 'Message Class/No.'], ['rc', 'Return Code']);

async function rfcErrors(fromDate?: string) {
  return q(`SELECT ARFCDEST, ARFCSTATE, ARFCFNAM, ARFCMSG, ARFCDATUM, ARFCUZEIT, ARFCUSER, ARFCTCODE FROM ARFCSSTATE WHERE ARFCSTATE IN ( 'SYSFAIL', 'CPICERR', 'SYSLOAD', 'NOSEND' )${fromDate ? ` AND ARFCDATUM >= '${fromDate}'` : ''} ORDER BY ARFCDATUM DESCENDING, ARFCUZEIT DESCENDING`, 2000);
}
function groupRfc(rows: Record<string, string>[]) {
  const m = new Map<string, { destination: string; state: string; calls: number; lastDate: string; lastMessage: string; functions: Set<string> }>();
  for (const x of rows) {
    const k = `${x.ARFCDEST}|${x.ARFCSTATE}`;
    const e = m.get(k) || { destination: x.ARFCDEST, state: x.ARFCSTATE, calls: 0, lastDate: '', lastMessage: '', functions: new Set<string>() };
    e.calls++; e.functions.add(x.ARFCFNAM);
    const ts = `${x.ARFCDATUM}${x.ARFCUZEIT}`; if (ts > e.lastDate) { e.lastDate = ts; e.lastMessage = x.ARFCMSG; }
    m.set(k, e);
  }
  return [...m.values()].sort((a, b) => b.calls - a.calls).map(e => ({ destination: e.destination || '(blank)', state: e.state, calls: e.calls, functions: [...e.functions].slice(0, 3).join(', '), lastDate: `${fmtD(e.lastDate.slice(0, 8))} ${fmtT(e.lastDate.slice(8))}`, lastMessage: e.lastMessage }));
}
const RFC_GROUP_COLS = cols(['destination', 'RFC Destination'], ['state', 'State'], ['calls', 'Failed Calls'], ['functions', 'Function Modules'], ['lastDate', 'Last Failure'], ['lastMessage', 'Last Error Message']);

async function qrfcProblems() {
  const [i, o] = await Promise.all([
    q("SELECT QNAME, DEST, QSTATE, ERRMESS, QRFCUSER, QRFCDATUM, QRFCUZEIT FROM TRFCQIN WHERE QSTATE <> 'READY' ORDER BY QRFCDATUM DESCENDING", 500),
    q("SELECT QNAME, DEST, QSTATE, ERRMESS, QRFCUSER, QRFCDATUM, QRFCUZEIT FROM TRFCQOUT WHERE QSTATE <> 'READY' ORDER BY QRFCDATUM DESCENDING", 500)
  ]);
  const map = (dir: string, rows: Record<string, string>[]) => rows.map(x => ({ direction: dir, queue: x.QNAME, destination: x.DEST, state: x.QSTATE, error: x.ERRMESS, user: x.QRFCUSER, date: `${fmtD(x.QRFCDATUM)} ${fmtT(x.QRFCUZEIT)}` }));
  return { rows: [...map('Inbound', i.rows), ...map('Outbound', o.rows)], inTotal: i.total, outTotal: o.total, error: i.error || o.error };
}
const QRFC_COLS = cols(['direction', 'Direction'], ['queue', 'Queue'], ['destination', 'Destination'], ['state', 'State'], ['error', 'Error Message'], ['user', 'User'], ['date', 'Date/Time']);

async function userTexts() {
  const r = await q("SELECT A~FIELDNAME, B~DOMVALUE_L, B~DDTEXT FROM DD03L AS A INNER JOIN DD07T AS B ON A~DOMNAME = B~DOMNAME WHERE A~TABNAME = 'USR02' AND A~FIELDNAME IN ( 'UFLAG', 'USTYP' ) AND A~AS4LOCAL = 'A' AND B~DDLANGUAGE = 'E' AND B~AS4LOCAL = 'A'", 50);
  const lockBits = r.rows.filter(x => x.FIELDNAME === 'UFLAG' && num(x.DOMVALUE_L) > 0).map(x => ({ bit: num(x.DOMVALUE_L), text: x.DDTEXT }));
  const types = Object.fromEntries(r.rows.filter(x => x.FIELDNAME === 'USTYP').map(x => [x.DOMVALUE_L, x.DDTEXT]));
  return { lockText: (uflag: number) => lockBits.filter(b => (uflag & b.bit) === b.bit).map(b => b.text).join('; ') || (uflag ? `Lock code ${uflag}` : 'Not locked'), types };
}
const USER_COLS = cols(['user', 'User'], ['type', 'User Type'], ['lock', 'Lock Status'], ['failedLogons', 'Failed Logons'], ['lastLogon', 'Last Logon'], ['validTo', 'Valid To'], ['pwdChanged', 'Password Changed']);

// ---------- intent builders ----------
export async function buildBasisLiveReport(intent: BasisIntent, query: string): Promise<BasisLiveReport> {
  const now = await sysNow();
  const today = now.date; const yesterday = addDays(today, -1);
  const d7 = addDays(today, -7); const d30 = addDays(today, -30);
  const errNote = (...errs: (string | undefined)[]) => errs.filter(Boolean).map(e => `Live read error: ${e}`).join(' ');

  switch (intent) {
    case 'LOCK_ENTRIES': {
      const client = '100';
      const [enq, modes] = await Promise.all([
        readLiveLockTable(client),
        q("SELECT DOMVALUE_L, DDTEXT FROM DD07T WHERE DOMNAME = 'ENQMODE' AND DDLANGUAGE = 'E'", 50)
      ]);
      if (enq.error) {
        return { text: `The live lock table (SM12) could not be read from the S/4HANA enqueue server: ${enq.error}`, sections: [], assess: false };
      }
      const modeText = new Map(modes.rows.map(m => [m.DOMVALUE_L, m.DDTEXT] as [string, string]));
      const tables = [...new Set(enq.rows.map(r => String(r.GNAME || '').trim()).filter(t => t && !t.startsWith('!')))];
      const comp = new Map<string, string>();
      if (tables.length) {
        const c = await q(`SELECT t~OBJ_NAME, d~PS_POSID FROM TADIR AS t INNER JOIN TDEVC AS v ON v~DEVCLASS = t~DEVCLASS INNER JOIN DF14L AS d ON d~FCTR_ID = v~COMPONENT WHERE t~PGMID = 'R3TR' AND t~OBJECT = 'TABL' AND t~OBJ_NAME IN ( ${inList(tables)} )`, 500);
        c.rows.forEach(x => { if (!comp.has(x.OBJ_NAME) && x.PS_POSID) comp.set(x.OBJ_NAME, x.PS_POSID); });
      }
      const nowSecs = (dt: string, tm: string) => Date.UTC(+dt.slice(0, 4), +dt.slice(4, 6) - 1, +dt.slice(6, 8)) / 1000 + secsOf(tm);
      const sysSecs = nowSecs(today, now.time);
      const locks = enq.rows.map(r => {
        const d = rfcDate(r.GTDATE); const t = rfcTime(r.GTTIME);
        const table = String(r.GNAME || '').trim();
        const mode = String(r.GMODE || '').trim();
        return {
          sortKey: `${d}${t}`, ageSecs: d ? Math.max(0, sysSecs - nowSecs(d, t)) : 0,
          lockTime: `${fmtD(d)} ${fmtT(t)}`.trim(), client: String(r.GCLIENT || '').trim(), user: String(r.GUNAME || '').trim(),
          component: comp.get(table) || '', mode: mode ? `${mode}${modeText.get(mode) ? ` (${modeText.get(mode)})` : ''}` : '',
          dialog: num(r.GUSE), update: num(r.GUSEVB), table, argument: String(r.GARG || '').trim(), tcode: String(r.GTCODE || '').trim(),
          backup: String(r.GBCKTYPE || '').trim(), owner: [String(r.GTHOST || '').replace(/\.+$/, '').trim(), r.GTWP ? `WP ${String(r.GTWP).trim()}` : ''].filter(Boolean).join(' / ')
        };
      }).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
      const byUser = new Map<string, { count: number; oldest: string; tables: Set<string> }>();
      const byTable = new Map<string, { count: number; users: Set<string>; component: string }>();
      locks.forEach(l => {
        const u = byUser.get(l.user) || { count: 0, oldest: l.lockTime, tables: new Set<string>() }; u.count++; u.tables.add(l.table); byUser.set(l.user, u);
        const tb = byTable.get(l.table) || { count: 0, users: new Set<string>(), component: l.component }; tb.count++; tb.users.add(l.user); byTable.set(l.table, tb);
      });
      const oldDay = locks.filter(l => l.ageSecs > 86400);
      const oldest = locks[0];
      const LOCK_COLS = cols(['lockTime', 'Lock Time'], ['client', 'Client'], ['user', 'User Name'], ['component', 'Application Component'], ['mode', 'Mode'], ['dialog', 'Dialog Counter'], ['update', 'Update Counter'], ['table', 'Table Name'], ['argument', 'Lock Argument'], ['tcode', 'Transaction'], ['backup', 'Backup'], ['owner', 'Owner (Host / WP)']);
      return {
        text: locks.length
          ? `${locks.length} lock entr${locks.length === 1 ? 'y is' : 'ies are'} currently held in client ${client} by ${byUser.size} user(s) on ${byTable.size} lock table(s). ${oldest ? `The oldest lock dates from ${oldest.lockTime} (${oldest.user}, ${oldest.table}). ` : ''}${oldDay.length} lock(s) are older than 24 hours and may be stale. Top holders: ${[...byUser.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, 3).map(([u, v]) => `${u} (${v.count})`).join(', ')}.`
          : `No lock entries are currently held in client ${client} (the live enqueue table is empty).`,
        sections: [
          { title: `Current Lock Entries (SM12) \u2014 Client ${client}`, summaryStats: [{ label: 'Lock entries', value: String(locks.length) }, { label: 'Users', value: String(byUser.size) }, { label: 'Lock tables', value: String(byTable.size) }, { label: 'Older than 24h', value: String(oldDay.length) }],
            columns: LOCK_COLS, rows: locks.map(({ sortKey, ageSecs, ...rest }) => rest), pageSize: 25, downloadable: true,
            note: `Read live from the S/4HANA enqueue server with function module ENQUEUE_READ (the data behind SM12), all users, client ${client}. Mode texts from domain ENQMODE; application component from the lock table's package (TADIR/TDEVC/DF14L). ${errNote(modes.error)}`.trim() },
          { title: 'Lock Entries by User', columns: cols(['user', 'User Name'], ['count', 'Lock Entries'], ['tables', 'Lock Tables'], ['oldest', 'Oldest Lock']), downloadable: true, pageSize: 25,
            rows: [...byUser.entries()].sort((a, b) => b[1].count - a[1].count).map(([user, v]) => ({ user, count: v.count, tables: [...v.tables].join(', '), oldest: v.oldest })) },
          { title: 'Lock Entries by Table', columns: cols(['table', 'Table Name'], ['component', 'Application Component'], ['count', 'Lock Entries'], ['users', 'Users']), downloadable: true, pageSize: 25,
            rows: [...byTable.entries()].sort((a, b) => b[1].count - a[1].count).map(([table, v]) => ({ table, component: v.component, count: v.count, users: [...v.users].join(', ') })) }
        ],
        assess: false
      };
    }
    case 'KERNEL_VERSION': {
      const [info, comps] = await Promise.all([
        fetchLiveSystemInformation(),
        q("SELECT COMPONENT, RELEASE, EXTRELEASE, COMP_TYPE FROM CVERS WHERE COMPONENT IN ('SAP_BASIS','S4CORE','SAP_ABA')", 10)
      ]);
      const a = info.adt; const r = info.rfc;
      const prop = (label: string, value: string | undefined, source: string) => value ? { property: label, value, source } : null;
      const ADT = 'ADT System Information';
      const RFC = 'RFC_SYSTEM_INFO (/sap/public/info)';
      const rows = [
        prop('Application Server Instance', a.ApplicationServerName || r.RFCDEST, a.ApplicationServerName ? ADT : RFC),
        prop('SAP System ID', r.RFCSYSID, RFC),
        prop('SAP Kernel Release', a.KernelRelease || r.RFCKERNRL, a.KernelRelease ? ADT : RFC),
        prop('Kernel Patch Level', a.KernelPatchLevel, ADT),
        prop('Kernel Kind', a.KernelKind, ADT),
        prop('Kernel Compiled (platform, compiler, date)', a.KernelCompilationDate, ADT),
        prop('SAP Release (SAP_BASIS)', r.RFCSAPRL, RFC),
        prop('Database System', [a.DBSystem || r.RFCDBSYS, a.DBName].filter(Boolean).join(' '), ADT),
        prop('Database Release', a.DBRelease, ADT),
        prop('Database Client Library', a.DBLibrary, ADT),
        prop('Database Host', a.DBServer || r.RFCDBHOST, a.DBServer ? ADT : RFC),
        prop('Database Schema', a.DBSchema, ADT),
        prop('Operating System', [a.OSName || r.RFCOPSYS, a.OSVersion].filter(Boolean).join(' '), ADT),
        prop('Machine Type', a.MachineType, ADT),
        prop('Host Name', a.NodeName || r.RFCHOST2, a.NodeName ? ADT : RFC),
        prop('Unicode System', a.UnicodeSystem, ADT),
        ...comps.rows.map(c => prop(`Software Component ${c.COMPONENT}`, `Release ${c.RELEASE}${c.EXTRELEASE ? `, SP ${c.EXTRELEASE}` : ''}`, 'CVERS'))
      ].filter(Boolean) as Record<string, string>[];
      const release = a.KernelRelease || r.RFCKERNRL;
      const notAuth = a.NotAuthorizedKernel === 'true';
      const text = release
        ? `The current SAP kernel on ${r.RFCSYSID || 'the connected system'} (application server ${a.ApplicationServerName || r.RFCDEST || 'n/a'}) is kernel release ${release}${a.KernelPatchLevel ? `, patch level ${a.KernelPatchLevel}` : ''}${a.KernelKind ? ` (${a.KernelKind} kernel)` : ''}${a.KernelCompilationDate ? `, built ${a.KernelCompilationDate}` : ''}. Database client library: ${a.DBLibrary || 'n/a'}; database ${a.DBSystem || r.RFCDBSYS || ''} release ${a.DBRelease || 'n/a'}; SAP release ${r.RFCSAPRL || 'n/a'}.`
        : `The kernel version could not be read from the live system${notAuth ? ' (the connection user is not authorized to read kernel information)' : ''}. ${info.errors.join(' ')}`.trim();
      return {
        text,
        sections: [{
          title: `SAP Kernel and Release Information — ${a.ApplicationServerName || r.RFCDEST || 'Application Server'}`,
          summaryStats: [{ label: 'Kernel release', value: release || 'n/a' }, { label: 'Kernel patch level', value: a.KernelPatchLevel || 'n/a' }, { label: 'SAP release', value: r.RFCSAPRL || 'n/a' }, { label: 'Database', value: `${a.DBSystem || r.RFCDBSYS || ''} ${a.DBRelease || ''}`.trim() || 'n/a' }],
          columns: cols(['property', 'Property'], ['value', 'Value'], ['source', 'Source']),
          rows,
          note: `Read live from the connected application server via the ADT system information service (the same data as SM51 release information), /sap/public/info and table CVERS. ${errNote(...info.errors, comps.error)}`.trim()
        }],
        assess: false
      };
    }
    case 'ALERTS': {
      const a = await alerts(d7, { redOnly: true });
      const g = groupAlerts(a.list); const open = a.list.filter(x => x.open).length;
      const last = a.list[0];
      return {
        text: a.list.length
          ? `${a.list.length} critical (red) CCMS alerts were raised in the last 7 days across ${new Set(a.list.map(x => x.system)).size} monitored component(s); ${open} are still open. Most frequent: ${g.slice(0, 3).map(x => `${x.object}/${x.attribute} on ${x.system} (${x.count})`).join('; ')}. Latest alert: ${fmtD(last.date)} ${fmtT(last.time)} — ${last.message || `${last.object} ${last.attribute}`}.`
          : `No critical (red) CCMS alerts were raised in the last 7 days. ${errNote(a.error)}`,
        sections: [{ title: 'Critical CCMS Alerts — Last 7 Days (ALALERTDB)', summaryStats: [{ label: 'Red alerts', value: String(a.list.length) }, { label: 'Still open', value: String(open) }, { label: 'Components', value: String(new Set(a.list.map(x => x.system)).size) }], columns: ALERT_GROUP_COLS, rows: g, note: `Source: CCMS alert database ALALERTDB (read live), red alerts from ${fmtD(d7)}; enterprise-search change-pointer alerts (CD$*) excluded. ${errNote(a.error)}` }],
        assess: false
      };
    }
    case 'RESPONSE_TIME': case 'EXPENSIVE_TX': {
      const [a, jobs] = await Promise.all([
        alerts(d30, { objects: ['Dialog', 'DatabaseSelect', 'DatabaseUpdate'] }),
        intent === 'EXPENSIVE_TX' ? jobRuntimeStats(today) : Promise.resolve(null as any)
      ]);
      const rt = a.list.filter(x => /ResponseTime|LongRunners|ServerTime/i.test(x.attribute));
      const bySrv = new Map<string, number>(); rt.forEach(x => bySrv.set(x.system, (bySrv.get(x.system) || 0) + 1));
      const sections: BasisSection[] = [{ title: 'Response-Time Alerts — Last 30 Days (CCMS)', summaryStats: [{ label: 'Response-time alerts', value: String(rt.length) }, ...[...bySrv.entries()].map(([s, c]) => ({ label: s, value: `${c} alerts` }))], columns: ALERT_COLS, rows: rt.slice(0, 200).map(alertRow), note: 'Response-time threshold alerts (dialog, HTTP, RFC, long runners, database server time) raised by the CCMS monitor, read live from ALALERTDB. Per-transaction response-time statistics (ST03N/STAD) are held in compressed workload collector clusters that cannot be read with SQL, so transaction-level averages are not shown.' }];
      if (jobs) sections.push({ title: 'Heaviest Background Workload Today (TBTCO)', columns: cols(['job', 'Job Name'], ['runs', 'Runs Today'], ['maxRuntime', 'Longest Run'], ['totalRuntime', 'Total Runtime']), rows: jobs.rows.slice(0, 20).map((x: any) => ({ job: x.JOBNAME, runs: num(x.RUNS), maxRuntime: dur(num(x.MAX_SEC)), totalRuntime: dur(num(x.TOTAL_SEC)) })), note: 'Finished background jobs started today, ranked by longest runtime.' });
      const worst = [...bySrv.entries()].sort((x, y) => y[1] - x[1])[0];
      return {
        text: rt.length
          ? `${rt.length} response-time alerts were raised in the last 30 days${worst ? `; ${worst[0]} has the most (${worst[1]})` : ''}. Latest: ${fmtD(rt[0].date)} ${fmtT(rt[0].time)} ${rt[0].attribute} — ${rt[0].message}.${intent === 'EXPENSIVE_TX' ? ` Per-transaction cost statistics are not readable with SQL; the heaviest measurable workload today is background jobs${jobs?.rows[0] ? ` (longest: ${jobs.rows[0].JOBNAME}, ${dur(num(jobs.rows[0].MAX_SEC))})` : ''}.` : ' Per-transaction response times are stored in compressed workload clusters and cannot be read with SQL.'}`
          : `No response-time alerts were raised in the last 30 days. ${errNote(a.error)}`,
        sections, assess: false
      };
    }
    case 'OVERLOADED': case 'WP_UTIL': {
      const [os, a, running, srv] = await Promise.all([
        osHistory(), alerts(d7, { objects: ['CPU', 'Dialog', 'BackgroundService', 'R3MemMgmtResources', 'Memory'] }),
        q("SELECT EXECSERVER, COUNT( * ) AS N FROM TBTCO WHERE STATUS = 'R' GROUP BY EXECSERVER", 50),
        q('SELECT NAME, HOST, HOSTSHORT FROM SAPWLSERV', 50)
      ]);
      const servers = srv.rows.length ? srv.rows : [...new Set(os.list.map(x => x.server))].map(s => ({ NAME: s, HOST: s, HOSTSHORT: s }));
      const rows = servers.map(s => {
        const osLatest = os.list.find(x => x.server === s.HOSTSHORT);
        const al = a.list.filter(x => x.system === s.NAME);
        return {
          server: s.NAME, host: s.HOST, cpuLatest: osLatest ? `${osLatest.cpu}% (${fmtD(osLatest.date)})` : 'n/a',
          swapUsed: osLatest ? `${osLatest.swapUsed}%` : 'n/a', runningJobs: num(running.rows.find(r => s.NAME.startsWith(r.EXECSERVER) || r.EXECSERVER === s.NAME)?.N),
          cpuAlerts: al.filter(x => x.object === 'CPU').length, responseAlerts: al.filter(x => x.object === 'Dialog').length,
          wpAlerts: al.filter(x => x.object === 'BackgroundService').length, memoryAlerts: al.filter(x => /Mem/i.test(x.object)).length
        };
      });
      const wpAlerts = a.list.filter(x => x.object === 'BackgroundService');
      const sections: BasisSection[] = [{ title: intent === 'WP_UTIL' ? 'Work Process Load Indicators per Server' : 'Application Server Load (Live)', columns: cols(['server', 'Instance'], ['host', 'Host'], ['cpuLatest', 'CPU Used (latest day)'], ['swapUsed', 'Swap Used'], ['runningJobs', 'Background Jobs Running Now'], ['cpuAlerts', 'CPU Alerts (7d)'], ['responseAlerts', 'Response-Time Alerts (7d)'], ['wpAlerts', 'Free Work Process Alerts (7d)'], ['memoryAlerts', 'Memory Alerts (7d)']), rows, note: `Sources: OSMON (OS collector), TBTCO (jobs with status Active right now), ALALERTDB (CCMS alerts since ${fmtD(d7)}), SAPWLSERV (servers). The live work-process table (SM50) lives in shared memory and is not stored in the database.` }];
      if (wpAlerts.length) sections.push({ title: 'Free Background Work Process Alerts (CCMS)', columns: ALERT_COLS, rows: wpAlerts.map(alertRow) });
      return {
        text: `${rows.length} application server(s): ${rows.map(r => `${r.server} — CPU ${r.cpuLatest}, ${r.runningJobs} background jobs running now, ${r.cpuAlerts} CPU / ${r.responseAlerts} response-time / ${r.wpAlerts} free-work-process alerts in the last 7 days`).join('; ')}.`,
        sections, assess: true
      };
    }
    case 'ENQUEUE': {
      const [a, d] = await Promise.all([alerts(d30, { objects: ['Enqueue'] }), dumps(d30)]);
      const lockDumps = groupDumps(d.list.filter(x => /ENQUEUE|FOREIGN_LOCK|LOCK/i.test(x.error)));
      return {
        text: `${a.list.length} enqueue alerts in the last 30 days${a.list[0] ? ` (latest ${fmtD(a.list[0].date)} ${fmtT(a.list[0].time)}: ${a.list[0].attribute} — ${a.list[0].message})` : ''}, and ${lockDumps.reduce((s, x) => s + x.count, 0)} lock-related runtime errors. Current lock entries (SM12) are held in the enqueue server's memory and are not stored in the database.`,
        sections: [
          { title: 'Enqueue Server Alerts — Last 30 Days (CCMS)', summaryStats: [{ label: 'Enqueue alerts', value: String(a.list.length) }, { label: 'Still open', value: String(a.list.filter(x => x.open).length) }], columns: ALERT_COLS, rows: a.list.map(alertRow), note: errNote(a.error) },
          { title: 'Lock-Related Runtime Errors — Last 30 Days (SNAP_BEG)', columns: DUMP_COLS, rows: lockDumps, note: errNote(d.error) }
        ], assess: false
      };
    }
    case 'TOP_PROBLEMS': {
      const d = await dumps(d7);
      const g = groupDumps(d.list).slice(0, 5);
      return {
        text: d.list.length ? `Top ${g.length} technical problems in the last 7 days (${d.list.length} runtime errors in total): ${g.map((x, i) => `${i + 1}. ${x.error} in ${x.program || 'n/a'} — ${x.count} dumps, ${x.users} user(s)`).join('; ')}.` : `No runtime errors in the last 7 days. ${errNote(d.error)}`,
        sections: [{ title: 'Top 5 Technical Problems — Last 7 Days (ST22 / SNAP_BEG)', summaryStats: [{ label: 'Dumps (7 days)', value: String(d.list.length) }, { label: 'Distinct problems', value: String(groupDumps(d.list).length) }], columns: DUMP_COLS, rows: g, note: errNote(d.error) }],
        assess: true
      };
    }
    case 'FIX_FIRST': case 'IMMEDIATE_ACTION': case 'ROOT_CAUSE_TODAY': {
      const from = intent === 'ROOT_CAUSE_TODAY' ? today : d7;
      const [d, jobs, rfc, upd, a, qr] = await Promise.all([
        dumps(today), failedJobs(`STATUS = 'A' AND ENDDATE >= '${from}'`), rfcErrors(from), updateFailures(from), alerts(d7, { redOnly: true }), qrfcProblems()
      ]);
      const dg = groupDumps(d.list);
      const jobGroups = new Map<string, number>(); jobs.rows.forEach(x => jobGroups.set(x.JOBNAME, (jobGroups.get(x.JOBNAME) || 0) + 1));
      const openRed = a.list.filter(x => x.open);
      const issues = [
        ...dg.slice(0, 5).map(x => ({ area: 'Runtime error (ST22)', issue: `${x.error} in ${x.program}`, count: x.count, impact: `${x.users} user(s)`, lastSeen: x.lastSeen })),
        ...[...jobGroups.entries()].sort((x, y) => y[1] - x[1]).slice(0, 5).map(([j, c]) => ({ area: 'Cancelled background job', issue: j, count: c, impact: 'Job cancelled', lastSeen: jobRow(jobs.rows.find(x => x.JOBNAME === j)!).end })),
        ...groupRfc(rfc.rows).slice(0, 3).map(x => ({ area: 'RFC failure (SM58)', issue: `${x.destination}: ${x.lastMessage}`, count: x.calls, impact: x.state, lastSeen: x.lastDate })),
        ...(upd.rows.length ? [{ area: 'Update failure (SM13)', issue: upd.rows.map(x => x.VBREPORT).filter((v, i, s) => s.indexOf(v) === i).slice(0, 3).join(', '), count: upd.rows.length, impact: 'Posted data not saved', lastSeen: updRow(upd.rows[0]).date }] : []),
        ...(qr.rows.length ? [{ area: 'qRFC queue error', issue: qr.rows.map(x => x.queue).slice(0, 3).join(', '), count: qr.rows.length, impact: 'Queue blocked', lastSeen: qr.rows[0].date }] : []),
        ...groupAlerts(openRed).slice(0, 3).map(x => ({ area: 'Open red CCMS alert', issue: `${x.object} ${x.attribute}`, count: x.open, impact: x.system, lastSeen: x.last }))
      ];
      const scope = intent === 'ROOT_CAUSE_TODAY' ? 'today' : 'last 7 days (dumps: today)';
      return {
        text: `Live issue list (${scope}): ${d.list.length} runtime errors today, ${jobs.rows.length} cancelled jobs, ${rfc.rows.length} failed RFC calls, ${upd.rows.length} update failures, ${qr.rows.length} qRFC queue errors, ${openRed.length} open red alerts.`,
        sections: [
          { title: intent === 'ROOT_CAUSE_TODAY' ? "Today's Errors — Live Evidence" : 'Open Basis Issues — Live Evidence', summaryStats: [{ label: 'Dumps today', value: String(d.list.length) }, { label: 'Cancelled jobs', value: String(jobs.rows.length) }, { label: 'Failed RFC calls', value: String(rfc.rows.length) }, { label: 'Update failures', value: String(upd.rows.length) }, { label: 'qRFC errors', value: String(qr.rows.length) }, { label: 'Open red alerts', value: String(openRed.length) }], columns: cols(['area', 'Area'], ['issue', 'Issue'], ['count', 'Occurrences'], ['impact', 'Impact'], ['lastSeen', 'Last Seen']), rows: issues, note: `Sources: SNAP_BEG, TBTCO, ARFCSSTATE, VBHDR/VBERROR, TRFCQIN/TRFCQOUT, ALALERTDB (all read live). ${errNote(d.error, jobs.error, rfc.error, upd.error, a.error, qr.error)}` },
          { title: "Today's Runtime Errors by Type", columns: DUMP_COLS, rows: dg }
        ],
        assess: true
      };
    }
    case 'JOBS_FAILED_OVERNIGHT': {
      const r = await failedJobs(`STATUS = 'A' AND ( ( ENDDATE = '${yesterday}' AND ENDTIME >= '180000' ) OR ( ENDDATE = '${today}' AND ENDTIME <= '080000' ) )`);
      const names = new Map<string, number>(); r.rows.forEach(x => names.set(x.JOBNAME, (names.get(x.JOBNAME) || 0) + 1));
      return {
        text: r.rows.length ? `${r.rows.length} background jobs were cancelled overnight (${fmtD(yesterday)} 18:00 to ${fmtD(today)} 08:00), ${names.size} distinct job(s): ${[...names.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([j, c]) => `${j} (${c})`).join(', ')}.` : `No background jobs were cancelled overnight (${fmtD(yesterday)} 18:00 to ${fmtD(today)} 08:00). ${errNote(r.error)}`,
        sections: [{ title: 'Jobs Cancelled Overnight (TBTCO)', summaryStats: [{ label: 'Cancelled runs', value: String(r.rows.length) }, { label: 'Distinct jobs', value: String(names.size) }], columns: JOB_COLS, rows: r.rows.map(jobRow), note: `Status "Cancelled" (A) with end time between ${fmtD(yesterday)} 18:00 and ${fmtD(today)} 08:00 system time. ${errNote(r.error)}` }],
        assess: false
      };
    }
    case 'JOBS_FAILED': {
      const n = query.toLowerCase();
      const [from, to, label] = n.includes('yesterday') ? [yesterday, yesterday, 'yesterday'] : n.includes('today') ? [today, today, 'today'] : n.includes('month') || n.includes('30 days') ? [d30, today, 'in the last 30 days'] : [d7, today, 'in the last 7 days'];
      const r = await failedJobs(`STATUS = 'A' AND ENDDATE >= '${from}' AND ENDDATE <= '${to}'`, 3000);
      const g = new Map<string, { runs: Record<string, string>[] }>();
      r.rows.forEach(x => { const e = g.get(x.JOBNAME) || { runs: [] }; e.runs.push(x); g.set(x.JOBNAME, e); });
      const ranked = [...g.entries()].sort((a, b) => b[1].runs.length - a[1].runs.length);
      const latestRuns = ranked.slice(0, 40).map(([, e]) => e.runs[0]);
      const steps = latestRuns.length ? await q(`SELECT JOBNAME, JOBCOUNT, STEPCOUNT, PROGNAME, VARIANT FROM TBTCP WHERE JOBCOUNT IN ( ${inList([...new Set(latestRuns.map(x => x.JOBCOUNT))])} )`, 500) : { rows: [], total: 0 } as Q;
      const progOf = (x: Record<string, string>) => steps.rows.filter(s => s.JOBNAME === x.JOBNAME && s.JOBCOUNT === x.JOBCOUNT).map(s => `${s.PROGNAME}${s.VARIANT ? ` (${s.VARIANT})` : ''}`).join(', ');
      const summary = ranked.map(([job, e]) => ({ job, failures: e.runs.length, program: progOf(e.runs[0]), user: e.runs[0].SDLUNAME, lastFailure: `${fmtD(e.runs[0].ENDDATE)} ${fmtT(e.runs[0].ENDTIME)}`, periodic: e.runs[0].PERIODIC === 'X' ? 'Yes' : 'No' }));
      return {
        text: r.rows.length
          ? `${r.rows.length} background job runs failed (status Cancelled) ${label}, across ${g.size} distinct job(s). Most frequent: ${summary.slice(0, 5).map(x => `${x.job} (${x.failures}×${x.program ? `, program ${x.program}` : ''})`).join('; ')}. Latest failure: ${r.rows[0].JOBNAME} at ${fmtD(r.rows[0].ENDDATE)} ${fmtT(r.rows[0].ENDTIME)}.`
          : `No background jobs failed ${label}. ${errNote(r.error)}`,
        sections: [
          { title: `Failed Jobs (${label.replace(/^in the /, '')}) — by Job (TBTCO/TBTCP)`, summaryStats: [{ label: 'Failed runs', value: String(r.rows.length) }, { label: 'Distinct jobs', value: String(g.size) }], columns: cols(['job', 'Job Name'], ['failures', 'Failed Runs'], ['program', 'Step Program (Variant)'], ['user', 'Scheduled By'], ['lastFailure', 'Last Failure'], ['periodic', 'Periodic']), rows: summary, note: `Status "Cancelled" (A) with end date ${fmtD(from)}${from !== to ? ` to ${fmtD(to)}` : ''}, read live. ${errNote(r.error, steps.error)}` },
          { title: 'Failed Job Runs', columns: JOB_COLS, rows: r.rows.slice(0, 300).map(jobRow) }
        ],
        assess: false
      };
    }
    case 'JOB_WHY': {
      const name = (query.match(/job\s+([A-Za-z0-9_\/\-]+)\s+fail/i)?.[1] || '').toUpperCase();
      const runs = await q(`SELECT JOBNAME, JOBCOUNT, STATUS, SDLUNAME, SDLSTRTDT, SDLSTRTTM, STRTDATE, STRTTIME, ENDDATE, ENDTIME, EXECSERVER, JOBCLASS, PERIODIC FROM TBTCO WHERE JOBNAME = '${name.replace(/'/g, "''")}' ORDER BY SDLSTRTDT DESCENDING, SDLSTRTTM DESCENDING`, 50);
      if (!runs.rows.length) {
        const similar = await q(`SELECT JOBNAME, COUNT( * ) AS RUNS, MAX( SDLSTRTDT ) AS LASTD FROM TBTCO WHERE JOBNAME LIKE '%${name.replace(/[^A-Z0-9_]/g, '').slice(0, 12)}%' AND SDLSTRTDT >= '${d30}' GROUP BY JOBNAME`, 20);
        return {
          text: `No background job named ${name} exists in the job table (TBTCO), so there is no failed run to analyse.${similar.rows.length ? ` Similarly named jobs in the last 30 days: ${similar.rows.map(x => x.JOBNAME).join(', ')}.` : ''} ${errNote(runs.error)}`,
          sections: [{ title: `Jobs Similar to ${name} — Last 30 Days`, columns: cols(['JOBNAME', 'Job Name'], ['RUNS', 'Runs'], ['LASTD', 'Last Scheduled']), rows: similar.rows.map(x => ({ ...x, LASTD: fmtD(x.LASTD) })) }],
          assess: false
        };
      }
      const failed = runs.rows.find(x => x.STATUS === 'A');
      const sections: BasisSection[] = [{ title: `Run History of ${name} (TBTCO)`, columns: JOB_COLS, rows: runs.rows.map(jobRow) }];
      if (failed) {
        const [steps, jd] = await Promise.all([
          q(`SELECT STEPCOUNT, PROGNAME, VARIANT, AUTHCKNAM FROM TBTCP WHERE JOBNAME = '${name}' AND JOBCOUNT = '${failed.JOBCOUNT}' ORDER BY STEPCOUNT`, 50),
          dumps(failed.ENDDATE || failed.STRTDATE, failed.ENDDATE || failed.STRTDATE)
        ]);
        const related = jd.list.filter(x => x.user === failed.SDLUNAME || x.user === steps.rows[0]?.AUTHCKNAM);
        sections.push({ title: 'Steps of the Failed Run (TBTCP)', columns: cols(['STEPCOUNT', 'Step'], ['PROGNAME', 'Program'], ['VARIANT', 'Variant'], ['AUTHCKNAM', 'Step User']), rows: steps.rows });
        sections.push({ title: 'Runtime Errors on the Failure Date by the Job User', columns: cols(['date', 'Date'], ['time', 'Time'], ['error', 'Runtime Error'], ['program', 'Program'], ['user', 'User']), rows: related.map(x => ({ ...x, date: fmtD(x.date), time: fmtT(x.time) })), note: 'The job log text itself is stored in the file system, not in the database.' });
      }
      return { text: failed ? `${name} was last cancelled on ${fmtD(failed.ENDDATE)} ${fmtT(failed.ENDTIME)} (job count ${failed.JOBCOUNT}, user ${failed.SDLUNAME}).` : `${name} has ${runs.rows.length} run(s) in the job table and none of them are cancelled; latest status: ${JOB_STATUS[runs.rows[0].STATUS] || runs.rows[0].STATUS}.`, sections, assess: !!failed };
    }
    case 'JOBS_LONG_RUNNING': case 'WP_STUCK': {
      const [act, stats, a] = await Promise.all([
        q("SELECT JOBNAME, JOBCOUNT, STATUS, SDLUNAME, STRTDATE, STRTTIME, EXECSERVER, JOBCLASS, WPNUMBER FROM TBTCO WHERE STATUS = 'R' ORDER BY STRTDATE ASCENDING, STRTTIME ASCENDING", 500),
        jobRuntimeStats(d7), alerts(d7, { objects: ['Dialog', 'BackgroundService'] })
      ]);
      const nowSec = DATE_SECS(today, now.time);
      const active = act.rows.map(x => ({ ...jobRow(x), wp: x.WPNUMBER, runningFor: dur(Math.max(0, nowSec - DATE_SECS(x.STRTDATE, x.STRTTIME))), secs: nowSec - DATE_SECS(x.STRTDATE, x.STRTTIME) }))
        .sort((x, y) => y.secs - x.secs);
      const stuck = active.filter(x => x.secs >= 3600);
      const longRunnerAlerts = a.list.filter(x => /LongRunners|FreeBPWP/i.test(x.attribute));
      const sections: BasisSection[] = [
        { title: 'Background Jobs Running Right Now (TBTCO status Active)', summaryStats: [{ label: 'Running now', value: String(active.length) }, { label: 'Running > 1 hour', value: String(stuck.length) }], columns: cols(['job', 'Job Name'], ['count', 'Job Count'], ['user', 'Scheduled By'], ['start', 'Started'], ['runningFor', 'Running For'], ['server', 'Server'], ['wp', 'Work Process']), rows: active.map(({ secs, ...r }) => r) },
        { title: 'Longest Finished Runs — Last 7 Days', columns: cols(['job', 'Job Name'], ['runs', 'Runs'], ['maxRuntime', 'Longest Run'], ['avgRuntime', 'Average Run']), rows: stats.rows.slice(0, 20).map(x => ({ job: x.JOBNAME, runs: num(x.RUNS), maxRuntime: dur(num(x.MAX_SEC)), avgRuntime: dur(Math.round(num(x.TOTAL_SEC) / Math.max(1, num(x.RUNS)))) })) }
      ];
      if (longRunnerAlerts.length) sections.push({ title: 'Long-Runner / Free Work Process Alerts (CCMS, 7 days)', columns: ALERT_COLS, rows: longRunnerAlerts.map(alertRow) });
      return {
        text: intent === 'WP_STUCK'
          ? `${stuck.length} background work process(es) are occupied by jobs running longer than 1 hour${stuck[0] ? ` (longest: ${stuck[0].job}, ${stuck[0].runningFor} on WP ${stuck[0].wp})` : ''}; ${active.length} jobs are running in total. ${longRunnerAlerts.length} long-runner/free-work-process alerts in the last 7 days. Dialog work-process states (SM50) are held in shared memory and are not stored in the database.`
          : `${active.length} background jobs are running right now${active[0] ? `; the longest has been running for ${active[0].runningFor} (${active[0].job})` : ''}. Longest finished run in the last 7 days: ${stats.rows[0] ? `${stats.rows[0].JOBNAME} (${dur(num(stats.rows[0].MAX_SEC))})` : 'n/a'}.`,
        sections, assess: intent === 'WP_STUCK'
      };
    }
    case 'JOBS_DELAYED': case 'JOBS_NOT_STARTED': {
      const r = await q(`SELECT JOBNAME, JOBCOUNT, STATUS, SDLUNAME, SDLSTRTDT, SDLSTRTTM, JOBCLASS, PERIODIC, EVENTID FROM TBTCO WHERE STATUS IN ( 'S', 'Y', 'Z' ) AND EVENTID = ' ' AND SDLSTRTDT > '19000101' AND ( SDLSTRTDT < '${today}' OR ( SDLSTRTDT = '${today}' AND SDLSTRTTM < '${now.time}' ) ) ORDER BY SDLSTRTDT ASCENDING, SDLSTRTTM ASCENDING`, 1000);
      const nowSec = DATE_SECS(today, now.time);
      const rows = r.rows.map(x => ({ job: x.JOBNAME, count: x.JOBCOUNT, status: JOB_STATUS[x.STATUS] || x.STATUS, jobClass: x.JOBCLASS, user: x.SDLUNAME, planned: `${fmtD(x.SDLSTRTDT)} ${fmtT(x.SDLSTRTTM)}`, overdueBy: dur(Math.max(0, nowSec - DATE_SECS(x.SDLSTRTDT, x.SDLSTRTTM))), periodic: x.PERIODIC === 'X' ? 'Yes' : 'No' }));
      const critical = rows.filter(x => x.jobClass === 'A');
      const shown = intent === 'JOBS_NOT_STARTED' ? [...critical, ...rows.filter(x => x.jobClass !== 'A')] : rows;
      return {
        text: intent === 'JOBS_NOT_STARTED'
          ? `${critical.length} high-priority (class A) job(s) and ${rows.length} jobs in total are released but did not start at their planned time${critical[0] ? `; e.g. ${critical[0].job} planned ${critical[0].planned}` : ''}.`
          : `${rows.length} released job(s) are past their planned start time and have not started${rows[0] ? `; the oldest is ${rows[0].job}, planned ${rows[0].planned} (overdue by ${rows[0].overdueBy})` : ''}. ${errNote(r.error)}`,
        sections: [{ title: intent === 'JOBS_NOT_STARTED' ? 'Jobs That Did Not Start (class A first)' : 'Delayed Jobs — Past Planned Start, Not Started', summaryStats: [{ label: 'Not started', value: String(rows.length) }, { label: 'Class A (high priority)', value: String(critical.length) }, { label: 'System time', value: `${fmtD(today)} ${fmtT(now.time)}` }], columns: cols(['job', 'Job Name'], ['count', 'Job Count'], ['status', 'Status'], ['jobClass', 'Class'], ['user', 'Scheduled By'], ['planned', 'Planned Start'], ['overdueBy', 'Overdue By'], ['periodic', 'Periodic']), rows: shown, note: `Jobs with status Released/Ready/Suspended whose planned start (TBTCO SDLSTRTDT/SDLSTRTTM) is before the current system time. Job class A = high priority. ${errNote(r.error)}` }],
        assess: false
      };
    }
    case 'JOBS_RUNTIME_EXCEEDED': case 'JOBS_SLA': case 'RESOURCE_CONSUMERS': {
      const [base, recent] = await Promise.all([jobRuntimeStats(d30, addDays(today, -8)), jobRuntimeStats(d7)]);
      const baseMap = new Map(base.rows.map(x => [x.JOBNAME, { runs: num(x.RUNS), avg: num(x.TOTAL_SEC) / Math.max(1, num(x.RUNS)) }]));
      if (intent === 'RESOURCE_CONSUMERS') {
        const byUser = await q(`SELECT SDLUNAME, COUNT( * ) AS RUNS, SUM( ${RT} ) AS TOTAL_SEC FROM TBTCO WHERE STATUS = 'F' AND STRTDATE >= '${d7}' GROUP BY SDLUNAME ORDER BY TOTAL_SEC DESCENDING`, 50);
        const topJobs = [...recent.rows].sort((a, b) => num(b.TOTAL_SEC) - num(a.TOTAL_SEC)).slice(0, 20);
        return {
          text: `Largest background runtime consumers in the last 7 days — programs/jobs: ${topJobs.slice(0, 3).map(x => `${x.JOBNAME} (${dur(num(x.TOTAL_SEC))} over ${num(x.RUNS)} runs)`).join(', ')}; users: ${byUser.rows.slice(0, 3).map(x => `${x.SDLUNAME} (${dur(num(x.TOTAL_SEC))})`).join(', ')}.`,
          sections: [
            { title: 'Top Jobs by Total Runtime — Last 7 Days', columns: cols(['job', 'Job Name'], ['runs', 'Runs'], ['total', 'Total Runtime'], ['max', 'Longest Run']), rows: topJobs.map(x => ({ job: x.JOBNAME, runs: num(x.RUNS), total: dur(num(x.TOTAL_SEC)), max: dur(num(x.MAX_SEC)) })) },
            { title: 'Top Users by Background Runtime — Last 7 Days', columns: cols(['SDLUNAME', 'User'], ['RUNS', 'Job Runs'], ['total', 'Total Runtime']), rows: byUser.rows.slice(0, 20).map(x => ({ ...x, total: dur(num(x.TOTAL_SEC)) })), note: 'Dialog CPU/memory per user (ST03N/STAD) is kept in compressed workload clusters that cannot be read with SQL; background job runtime is the measurable resource usage.' }
          ], assess: false
        };
      }
      const cmp = recent.rows.map(x => {
        const b = baseMap.get(x.JOBNAME); const avgRecent = num(x.TOTAL_SEC) / Math.max(1, num(x.RUNS));
        return { job: x.JOBNAME, recentRuns: num(x.RUNS), recentAvg: Math.round(avgRecent), recentMax: num(x.MAX_SEC), baseRuns: b?.runs || 0, baseAvg: Math.round(b?.avg || 0) };
      }).filter(x => x.baseRuns >= 3 && x.baseAvg >= 30);
      const flagged = intent === 'JOBS_RUNTIME_EXCEEDED'
        ? cmp.filter(x => x.recentMax > 2 * x.baseAvg).sort((a, b) => b.recentMax / b.baseAvg - a.recentMax / a.baseAvg)
        : cmp.filter(x => x.recentAvg > 1.5 * x.baseAvg && x.recentRuns >= 2).sort((a, b) => b.recentAvg / b.baseAvg - a.recentAvg / a.baseAvg);
      const rows = flagged.slice(0, 50).map(x => ({ job: x.job, normal: dur(x.baseAvg), baseRuns: x.baseRuns, recentAvg: dur(x.recentAvg), recentMax: dur(x.recentMax), recentRuns: x.recentRuns, factor: `${(Math.round(((intent === 'JOBS_SLA' ? x.recentAvg : x.recentMax) / x.baseAvg) * 10) / 10)}x` }));
      return {
        text: intent === 'JOBS_RUNTIME_EXCEEDED'
          ? `${flagged.length} job(s) ran more than twice their normal runtime in the last 7 days${rows[0] ? `; worst: ${rows[0].job} took ${rows[0].recentMax} vs a normal ${rows[0].normal} (${rows[0].factor})` : ''}.`
          : `${flagged.length} job(s) show runtimes trending more than 50% above their normal level in the last 7 days and are the most likely to miss their SLA${rows[0] ? `; highest risk: ${rows[0].job} (${rows[0].recentAvg} now vs ${rows[0].normal} normally)` : ''}.`,
        sections: [{ title: intent === 'JOBS_RUNTIME_EXCEEDED' ? 'Jobs Exceeding Their Normal Runtime' : 'Jobs at Risk of Missing Their SLA (runtime trend)', summaryStats: [{ label: 'Jobs compared', value: String(cmp.length) }, { label: 'Flagged', value: String(flagged.length) }], columns: cols(['job', 'Job Name'], ['normal', 'Normal Avg (8–30 days ago)'], ['baseRuns', 'Baseline Runs'], ['recentAvg', 'Avg Last 7 Days'], ['recentMax', 'Longest Last 7 Days'], ['recentRuns', 'Runs Last 7 Days'], ['factor', 'Factor']), rows, note: `Runtimes computed live from TBTCO start/end timestamps of finished runs. Baseline = ${fmtD(d30)} to ${fmtD(addDays(today, -8))}; recent = since ${fmtD(d7)}. Jobs with fewer than 3 baseline runs or a baseline under 30 seconds are excluded. ${errNote(base.error, recent.error)}` }],
        assess: intent === 'JOBS_SLA'
      };
    }
    case 'JOBS_TONIGHT': {
      const tomorrow = addDays(today, 1);
      const r = await q(`SELECT JOBNAME, JOBCOUNT, STATUS, SDLUNAME, SDLSTRTDT, SDLSTRTTM, JOBCLASS, PERIODIC FROM TBTCO WHERE STATUS IN ( 'S', 'P', 'Z', 'Y' ) AND ( ( SDLSTRTDT = '${today}' AND SDLSTRTTM >= '180000' ) OR ( SDLSTRTDT = '${tomorrow}' AND SDLSTRTTM < '060000' ) ) ORDER BY SDLSTRTDT ASCENDING, SDLSTRTTM ASCENDING`, 2000);
      const names = new Set(r.rows.map(x => x.JOBNAME));
      return {
        text: `${r.total} job run(s) (${names.size} distinct jobs) are scheduled for tonight (${fmtD(today)} 18:00 to ${fmtD(tomorrow)} 06:00)${r.rows[0] ? `, starting with ${r.rows[0].JOBNAME} at ${fmtT(r.rows[0].SDLSTRTTM)}` : ''}. ${errNote(r.error)}`,
        sections: [{ title: 'Jobs Scheduled for Tonight (TBTCO)', summaryStats: [{ label: 'Scheduled runs', value: String(r.total) }, { label: 'Distinct jobs', value: String(names.size) }, { label: 'Class A', value: String(r.rows.filter(x => x.JOBCLASS === 'A').length) }], columns: cols(['job', 'Job Name'], ['count', 'Job Count'], ['status', 'Status'], ['planned', 'Planned Start'], ['user', 'Scheduled By'], ['jobClass', 'Class'], ['periodic', 'Periodic']), rows: r.rows.map(x => ({ job: x.JOBNAME, count: x.JOBCOUNT, status: JOB_STATUS[x.STATUS] || x.STATUS, planned: `${fmtD(x.SDLSTRTDT)} ${fmtT(x.SDLSTRTTM)}`, user: x.SDLUNAME, jobClass: x.JOBCLASS, periodic: x.PERIODIC === 'X' ? 'Yes' : 'No' })), note: `Tonight = ${fmtD(today)} 18:00 to ${fmtD(tomorrow)} 06:00 system time.` }],
        assess: false
      };
    }
    case 'JOBS_RESTARTABLE': case 'JOB_RESTART': {
      const failed = await q(`SELECT JOBNAME, COUNT( * ) AS FAILS, MAX( ENDDATE ) AS LASTFAIL FROM TBTCO WHERE STATUS = 'A' AND ENDDATE >= '${d7}' GROUP BY JOBNAME ORDER BY FAILS DESCENDING`, 500);
      const names = failed.rows.map(x => x.JOBNAME).slice(0, 150);
      const later = names.length ? await q(`SELECT JOBNAME, MAX( ENDDATE ) AS LASTOK, COUNT( * ) AS OKRUNS FROM TBTCO WHERE STATUS = 'F' AND ENDDATE >= '${d7}' AND JOBNAME IN ( ${inList(names)} ) GROUP BY JOBNAME`, 500) : { rows: [] as Record<string, string>[], total: 0 };
      const periodic = names.length ? await q(`SELECT DISTINCT JOBNAME FROM TBTCO WHERE PERIODIC = 'X' AND STATUS IN ( 'S', 'P' ) AND JOBNAME IN ( ${inList(names)} )`, 500) : { rows: [] as Record<string, string>[], total: 0 };
      const okMap = new Map(later.rows.map(x => [x.JOBNAME, x]));
      const perSet = new Set(periodic.rows.map(x => x.JOBNAME));
      const rows = failed.rows.map(x => {
        const ok = okMap.get(x.JOBNAME);
        const recovered = ok && ok.LASTOK >= x.LASTFAIL;
        return { job: x.JOBNAME, fails: num(x.FAILS), lastFail: fmtD(x.LASTFAIL), successfulRuns: num(ok?.OKRUNS), lastSuccess: fmtD(ok?.LASTOK || ''), periodic: perSet.has(x.JOBNAME) ? 'Yes (next run scheduled)' : 'No',
          assessment: recovered ? 'Later run succeeded — restart usually not needed' : ok ? 'Succeeds intermittently — restart after checking the cause' : 'Fails every time — fix the cause before restarting' };
      });
      return {
        text: `${rows.length} job(s) were cancelled in the last 7 days: ${rows.filter(r => r.assessment.startsWith('Later')).length} already ran successfully afterwards, ${rows.filter(r => r.assessment.startsWith('Succeeds')).length} succeed intermittently (restart candidates after a check), ${rows.filter(r => r.assessment.startsWith('Fails')).length} fail every time (fix before restart).${intent === 'JOB_RESTART' ? ' This connection is read-only, so the restart itself must be done in SM37 after validation.' : ''}`,
        sections: [{ title: 'Cancelled Jobs — Restart Validation (last 7 days)', summaryStats: [{ label: 'Cancelled jobs', value: String(rows.length) }, { label: 'Already recovered', value: String(rows.filter(r => r.assessment.startsWith('Later')).length) }, { label: 'Always failing', value: String(rows.filter(r => r.assessment.startsWith('Fails')).length) }], columns: cols(['job', 'Job Name'], ['fails', 'Cancelled Runs'], ['lastFail', 'Last Cancelled'], ['successfulRuns', 'Successful Runs'], ['lastSuccess', 'Last Success'], ['periodic', 'Periodic'], ['assessment', 'Restart Assessment']), rows, note: `Validation uses live TBTCO history since ${fmtD(d7)}: whether the same job finished successfully after its last cancellation and whether a periodic successor is scheduled. ${errNote(failed.error)}` }],
        assess: intent === 'JOB_RESTART'
      };
    }
    case 'DUMPS_REPEATED': {
      const d = await dumps(d30);
      const g = groupDumps(d.list).filter(x => x.count > 1);
      return {
        text: `${g.length} runtime errors occurred repeatedly in the last 30 days (${d.list.length} dumps in total)${g[0] ? `; the most frequent is ${g[0].error} in ${g[0].program} (${g[0].count} times, ${g[0].users} user(s), last ${g[0].lastSeen})` : ''}. ${errNote(d.error)}`,
        sections: [{ title: 'Repeated ABAP Runtime Errors — Last 30 Days (ST22)', summaryStats: [{ label: 'Dumps (30 days)', value: String(d.list.length) }, { label: 'Repeating errors', value: String(g.length) }], columns: DUMP_COLS, rows: g, note: 'Grouped by runtime error and program from SNAP_BEG, read live.' }],
        assess: false
      };
    }
    case 'DUMPS_LIST': {
      const n = query.toLowerCase();
      const [from, label] = /\btoday\b/.test(n) ? [today, 'today'] : /yesterday/.test(n) ? [yesterday, 'since yesterday'] : /month|30 days/.test(n) ? [d30, 'in the last 30 days'] : [d7, 'in the last 7 days'];
      const d = await dumps(from);
      const g = groupDumps(d.list);
      return {
        text: d.list.length
          ? `Yes — ${d.list.length} ABAP runtime error(s) (ST22 dumps) occurred ${label}, ${g.length} distinct error type(s). Latest: ${g.length ? `${fmtD(d.list[0].date)} ${fmtT(d.list[0].time)} ${d.list[0].error} in ${d.list[0].program || 'n/a'} (user ${d.list[0].user})` : ''}. Most frequent: ${g.slice(0, 3).map(x => `${x.error} in ${x.program || 'n/a'} (${x.count})`).join('; ')}.`
          : `No ABAP runtime errors (ST22 dumps) occurred ${label}. ${errNote(d.error)}`.trim(),
        sections: [
          { title: `ABAP Runtime Errors (ST22) — ${label.replace(/^in the /, '').replace(/^./, c => c.toUpperCase())}`, summaryStats: [{ label: 'Dumps', value: String(d.list.length) }, { label: 'Distinct errors', value: String(g.length) }, { label: 'Users affected', value: String(new Set(d.list.map(x => x.user)).size) }], columns: DUMP_COLS, rows: g, note: `Read live from the dump table SNAP_BEG since ${fmtD(from)}. ${errNote(d.error)}`.trim() },
          { title: 'Dump Details', columns: cols(['date', 'Date'], ['time', 'Time'], ['error', 'Runtime Error'], ['program', 'Program'], ['user', 'User'], ['host', 'Server']), rows: d.list.slice(0, 300).map(x => ({ ...x, date: fmtD(x.date), time: fmtT(x.time) })) }
        ],
        assess: false
      };
    }
    case 'SYSLOG': {
      const a = await alerts(d30, { objects: ['R3Syslog', 'Security', 'AbapSql'] });
      const red = a.list.filter(x => x.severity === 'Red');
      return {
        text: `${a.list.length} system-log alerts were forwarded to the CCMS monitor in the last 30 days, ${red.length} of them critical (red)${red[0] ? `; latest critical: ${fmtD(red[0].date)} ${fmtT(red[0].time)} ${red[0].attribute} — ${red[0].message}` : ''}. ${errNote(a.error)}`,
        sections: [
          { title: 'Critical System Log (SM21) Alerts — Last 30 Days', summaryStats: [{ label: 'Syslog alerts', value: String(a.list.length) }, { label: 'Critical (red)', value: String(red.length) }], columns: ALERT_GROUP_COLS, rows: groupAlerts(a.list) },
          { title: 'System Log Alert Details', columns: ALERT_COLS, rows: a.list.slice(0, 200).map(alertRow), note: 'SM21 messages reach the database through the CCMS system-log monitor (ALALERTDB); the raw SM21 log files themselves are on the application server file system.' }
        ], assess: false
      };
    }
    case 'ERRORS_AFTER_TRANSPORT': {
      const tp = await q("SELECT TRKORR, TRTIME, RETCODE, TRSTEP, TRUSER FROM TPALOG WHERE TRKORR <> 'ALL' ORDER BY TRTIME DESCENDING", 20);
      const last = tp.rows[0];
      if (!last) return { text: `No transport import is recorded in the import log (TPALOG). ${errNote(tp.error)}`, sections: [], assess: false };
      const tDate = last.TRTIME.slice(0, 8); const tTime = last.TRTIME.slice(8, 14);
      const d = await dumps(addDays(tDate, -7));
      const before = new Set(d.list.filter(x => `${x.date}${x.time}` < last.TRTIME).map(x => `${x.error}|${x.program}`));
      const after = d.list.filter(x => `${x.date}${x.time}` >= last.TRTIME);
      const g = groupDumps(after).map(x => ({ ...x, isNew: before.has(`${x.error}|${x.program}`) ? 'Seen before transport' : 'NEW since transport' }));
      const newOnes = g.filter(x => x.isNew.startsWith('NEW'));
      return {
        text: `The latest transport import was ${last.TRKORR} on ${fmtD(tDate)} ${fmtT(tTime)} (return code ${last.RETCODE}). Since then ${after.length} runtime errors occurred; ${newOnes.length} error type(s) did not occur in the 7 days before the import${newOnes[0] ? `, e.g. ${newOnes[0].error} in ${newOnes[0].program} (${newOnes[0].count}x)` : ''}.`,
        sections: [
          { title: `Runtime Errors Since Transport ${last.TRKORR}`, summaryStats: [{ label: 'Transport', value: last.TRKORR }, { label: 'Imported', value: `${fmtD(tDate)} ${fmtT(tTime)}` }, { label: 'Dumps since', value: String(after.length) }, { label: 'New error types', value: String(newOnes.length) }], columns: [...DUMP_COLS, { key: 'isNew', label: 'New?' }], rows: g },
          { title: 'Latest Transport Import Steps (TPALOG)', columns: cols(['TRKORR', 'Transport'], ['time', 'Time'], ['TRSTEP', 'Step'], ['RETCODE', 'Return Code'], ['TRUSER', 'User']), rows: tp.rows.map(x => ({ ...x, time: `${fmtD(x.TRTIME.slice(0, 8))} ${fmtT(x.TRTIME.slice(8, 14))}` })) }
        ], assess: false
      };
    }
    case 'UPDATE_FAILURES': {
      const u = await updateFailures();
      return {
        text: u.rows.length ? `${u.rows.length} failed update records are in SM13${u.rows[0] ? `; the latest is from ${updRow(u.rows[0]).date} by ${u.rows[0].VBUSR} in ${u.rows[0].VBREPORT}` : ''}.` : `No failed update records in SM13. ${errNote(u.error)}`,
        sections: [{ title: 'Update Failures (SM13 — VBHDR/VBERROR)', summaryStats: [{ label: 'Failed updates', value: String(u.rows.length) }, { label: 'Users', value: String(new Set(u.rows.map(x => x.VBUSR)).size) }], columns: UPD_COLS, rows: u.rows.map(updRow), note: errNote(u.error) }],
        assess: false
      };
    }
    case 'ERRORS_BUSINESS': {
      const [u, d] = await Promise.all([updateFailures(d30), dumps(d7)]);
      const biz = groupDumps(d.list.filter(x => x.program && !/^(SAPMSSY|SAPLSTRD|SAPMHTTP|CL_ABAP_|SAPLSDB|SAPLARFC|SAPLSPO)/.test(x.program)));
      return {
        text: `${u.rows.length} failed updates (last 30 days) left business postings unsaved${u.rows.length ? ` — transactions: ${[...new Set(u.rows.map(x => x.VBTCODE).filter(Boolean))].join(', ') || 'n/a'}` : ''}; ${biz.reduce((s, x) => s + x.count, 0)} runtime errors in application programs in the last 7 days hit ${new Set(d.list.map(x => x.user)).size} user(s).`,
        sections: [
          { title: 'Failed Updates (business postings not saved) — Last 30 Days', columns: UPD_COLS, rows: u.rows.map(updRow) },
          { title: 'Runtime Errors in Application Programs — Last 7 Days', columns: DUMP_COLS, rows: biz, note: 'Kernel/system framework programs are excluded so the list shows errors in business application code.' }
        ], assess: true
      };
    }
    case 'CORRELATE': {
      const startSec = secsOf(now.time) - 4 * 3600;
      const fromDate = startSec < 0 ? yesterday : today; const fromTime = hhmmss(startSec < 0 ? startSec + 86400 : startSec);
      const tsFrom = `${fromDate}${fromTime}`;
      const [d, jobs, tp, tr] = await Promise.all([
        dumps(fromDate), q(`SELECT JOBNAME, JOBCOUNT, STATUS, SDLUNAME, ENDDATE, ENDTIME FROM TBTCO WHERE STATUS = 'A' AND ENDDATE >= '${fromDate}' ORDER BY ENDDATE DESCENDING, ENDTIME DESCENDING`, 2000),
        q(`SELECT TRKORR, TRTIME, TRSTEP, RETCODE, TRUSER FROM TPALOG WHERE TRTIME >= '${tsFrom}' AND TRKORR <> 'ALL'`, 200),
        q(`SELECT TRKORR, TRSTATUS, AS4USER, AS4DATE, AS4TIME FROM E070 WHERE AS4DATE >= '${fromDate}'`, 500)
      ]);
      const inWin = (dt: string, tm: string) => `${dt}${tm}` >= tsFrom;
      const ev = [
        ...d.list.filter(x => inWin(x.date, x.time)).map(x => ({ ts: `${x.date}${x.time}`, type: 'Dump', item: `${x.error} in ${x.program}`, user: x.user, detail: x.host })),
        ...jobs.rows.filter(x => x.STATUS === 'A' && inWin(x.ENDDATE, x.ENDTIME)).map(x => ({ ts: `${x.ENDDATE}${x.ENDTIME}`, type: 'Job cancelled', item: x.JOBNAME, user: x.SDLUNAME, detail: x.JOBCOUNT })),
        ...tp.rows.map(x => ({ ts: x.TRTIME, type: 'Transport import', item: x.TRKORR, user: x.TRUSER, detail: `step ${x.TRSTEP}, rc ${x.RETCODE}` })),
        ...tr.rows.filter(x => inWin(x.AS4DATE, x.AS4TIME)).map(x => ({ ts: `${x.AS4DATE}${x.AS4TIME}`, type: 'Transport request changed', item: x.TRKORR, user: x.AS4USER, detail: `status ${x.TRSTATUS}` }))
      ].sort((a, b) => b.ts.localeCompare(a.ts)).map(x => ({ time: `${fmtD(x.ts.slice(0, 8))} ${fmtT(x.ts.slice(8, 14))}`, type: x.type, item: x.item, user: x.user, detail: x.detail }));
      const fin = await q(`SELECT COUNT( * ) AS N FROM TBTCO WHERE STATUS = 'F' AND ( ( ENDDATE = '${fromDate}' AND ENDTIME >= '${fromTime}' ) OR ENDDATE > '${fromDate}' )`, 1);
      const finished = num(fin.rows[0]?.N);
      const c = (t: string) => ev.filter(x => x.type === t).length;
      return {
        text: `Last 4 hours (since ${fmtD(fromDate)} ${fmtT(fromTime)} system time): ${c('Dump')} dumps, ${c('Job cancelled')} cancelled jobs (${finished} finished normally), ${c('Transport import')} transport import steps and ${c('Transport request changed')} transport request changes.`,
        sections: [{ title: 'Timeline — Dumps, Jobs and Transports (last 4 hours)', summaryStats: [{ label: 'Dumps', value: String(c('Dump')) }, { label: 'Cancelled jobs', value: String(c('Job cancelled')) }, { label: 'Finished jobs', value: String(finished) }, { label: 'Transport events', value: String(c('Transport import') + c('Transport request changed')) }], columns: cols(['time', 'Time'], ['type', 'Event'], ['item', 'Object'], ['user', 'User'], ['detail', 'Detail']), rows: ev, note: `Sources: SNAP_BEG, TBTCO, TPALOG, E070 (read live). ${errNote(d.error, jobs.error, tp.error, tr.error)}` }],
        assess: true
      };
    }
    case 'WHY_SLOW': case 'MEMORY': case 'LAYER_ANALYSIS': case 'CAPACITY': case 'COMPARE_DAYS': {
      const [os, a, d] = await Promise.all([osHistory(), alerts(d30), dumps(intent === 'COMPARE_DAYS' ? yesterday : d7)]);
      const sections: BasisSection[] = [];
      let text = '';
      if (intent === 'MEMORY') {
        const memAlerts = a.list.filter(x => /Mem|Swap|Heap|Pages/i.test(`${x.object} ${x.attribute}`));
        const memDumps = groupDumps(d.list.filter(x => /MEMORY|TSV_TNEW|NO_ROLL|STORAGE|PAGE_ALLOC|NO_MORE/i.test(x.error)));
        const latest = os.list[0];
        text = `Latest OS data (${latest ? fmtD(latest.date) : 'n/a'}): swap used ${latest?.swapUsed ?? 'n/a'}%, average paging in ${latest?.pagedIn ?? 'n/a'} KB and ${latest?.pagesOut ?? 'n/a'} pages out per hour. ${memAlerts.length} memory-related CCMS alerts in the last 30 days and ${memDumps.reduce((s, x) => s + x.count, 0)} memory-related runtime errors in the last 7 days.`;
        sections.push({ title: 'Memory-Related CCMS Alerts — Last 30 Days', columns: ALERT_GROUP_COLS, rows: groupAlerts(memAlerts) });
        sections.push({ title: 'Memory-Related Runtime Errors — Last 7 Days', columns: DUMP_COLS, rows: memDumps });
        sections.push({ title: 'OS Paging and Swap History (OSMON)', columns: OS_COLS, rows: os.list.map(x => ({ ...x, date: fmtD(x.date) })) });
      } else if (intent === 'LAYER_ANALYSIS') {
        const layer = (x: Dump) => /^(Z|Y|\/Z|\/Y|LZ|LY|SAPLZ|SAPLY|SAPMZ|SAPMY)/.test(x.program) ? 'Custom ABAP' : /DBSQL|DBIF|SQL|HDB|DB_|DATABASE/i.test(x.error) ? 'Database / HANA' : /RFC|CPIC|CALL_FUNCTION|HTTP|ICM|CONNECT|COMMUNICATION|TIMEOUT/i.test(x.error) ? 'Network / RFC' : 'SAP standard ABAP';
        const counts = new Map<string, number>(); d.list.forEach(x => counts.set(layer(x), (counts.get(layer(x)) || 0) + 1));
        const dbAlerts = a.list.filter(x => /Database|AbapSql/i.test(`${x.object} ${x.attribute}`));
        const netAlerts = a.list.filter(x => /^(eth|lo)/i.test(x.object) || /Packets/i.test(x.attribute));
        const rfc = await rfcErrors(d7);
        const rows = ['Custom ABAP', 'SAP standard ABAP', 'Database / HANA', 'Network / RFC'].map(l => ({ layer: l, dumps: counts.get(l) || 0, alerts: l === 'Database / HANA' ? dbAlerts.length : l === 'Network / RFC' ? netAlerts.length : 0, rfcFailures: l === 'Network / RFC' ? rfc.rows.length : 0, top: groupDumps(d.list.filter(x => layer(x) === l))[0] ? `${groupDumps(d.list.filter(x => layer(x) === l))[0].error} in ${groupDumps(d.list.filter(x => layer(x) === l))[0].program}` : '' }));
        text = `Last 7 days by layer: ${rows.map(r => `${r.layer} ${r.dumps} dumps${r.alerts ? ` + ${r.alerts} alerts` : ''}${r.rfcFailures ? ` + ${r.rfcFailures} failed RFC calls` : ''}`).join('; ')}. Latest CPU: ${os.list[0] ? `${os.list[0].cpu}%` : 'n/a'}.`;
        sections.push({ title: 'Problem Distribution by Layer — Last 7 Days', columns: cols(['layer', 'Layer'], ['dumps', 'Runtime Errors'], ['alerts', 'CCMS Alerts (30d)'], ['rfcFailures', 'Failed RFC Calls'], ['top', 'Top Error']), rows, note: 'Custom ABAP = programs in the customer namespace (Z*/Y*); Database/HANA = SQL/database-interface errors and database alerts; Network/RFC = communication errors, failed RFC calls and network-interface alerts.' });
        sections.push({ title: 'Database and Network Alerts — Last 30 Days', columns: ALERT_GROUP_COLS, rows: groupAlerts([...dbAlerts, ...netAlerts]) });
      } else if (intent === 'CAPACITY') {
        const series = [...os.list].reverse();
        const n = series.length; const xs = series.map((_, i) => i); const ys = series.map(x => x.cpu);
        const mx = xs.reduce((s, v) => s + v, 0) / Math.max(1, n); const my = ys.reduce((s, v) => s + v, 0) / Math.max(1, n);
        const slope = n > 1 ? xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0) / xs.reduce((s, x) => s + (x - mx) ** 2, 0) : 0;
        const current = ys[n - 1] ?? 0; const days80 = slope > 0 ? Math.ceil((80 - current) / slope) : null;
        const vol = await q(`SELECT ENDDATE, COUNT( * ) AS N FROM TBTCO WHERE STATUS = 'F' AND ENDDATE >= '${d30}' GROUP BY ENDDATE ORDER BY ENDDATE`, 100);
        text = `CPU averaged ${Math.round(my)}% over the last ${n} days (latest ${current}%, peak ${Math.max(...ys, 0)}%), with a trend of ${slope >= 0 ? '+' : ''}${Math.round(slope * 100) / 100} percentage points per day. ${days80 !== null && days80 > 0 ? `At this rate CPU would reach 80% in about ${days80} days.` : 'At the current trend CPU is not heading towards a critical level.'} Latest swap usage ${os.list[0]?.swapUsed ?? 'n/a'}%.`;
        sections.push({ title: 'CPU Capacity Trend (OSMON)', summaryStats: [{ label: 'Avg CPU', value: `${Math.round(my)}%` }, { label: 'Trend / day', value: `${Math.round(slope * 100) / 100} pp` }, { label: 'Days to 80% CPU', value: days80 !== null && days80 > 0 ? String(days80) : 'Not on current trend' }], columns: OS_COLS, rows: os.list.map(x => ({ ...x, date: fmtD(x.date) })), note: 'Linear trend fitted to the live daily CPU averages; a rule-based projection, not a machine-learning forecast.' });
        sections.push({ title: 'Background Job Volume per Day (TBTCO)', columns: cols(['date', 'Date'], ['N', 'Finished Jobs']), rows: vol.rows.map(x => ({ date: fmtD(x.ENDDATE), N: num(x.N) })) });
      } else if (intent === 'COMPARE_DAYS') {
        // Cancelled jobs can lack start/end dates, so runtime is summed over finished jobs only.
        const dayStats = async (day: string) => {
          const [f, a] = await Promise.all([
            q(`SELECT COUNT( * ) AS N, SUM( ${RT} ) AS SECS FROM TBTCO WHERE STATUS = 'F' AND STRTDATE = '${day}'`, 1),
            q(`SELECT COUNT( * ) AS N FROM TBTCO WHERE STATUS = 'A' AND SDLSTRTDT = '${day}'`, 1)
          ]);
          return { rows: [{ STATUS: 'F', N: f.rows[0]?.N || '0', SECS: f.rows[0]?.SECS || '0' }, { STATUS: 'A', N: a.rows[0]?.N || '0', SECS: '0' }], total: 2, error: f.error || a.error } as Q;
        };
        const [jt, jy] = await Promise.all([dayStats(today), dayStats(yesterday)]);
        const cnt = (r: Q, s: string, f: 'N' | 'SECS') => num(r.rows.find(x => x.STATUS === s)?.[f]);
        const cutoff = now.time;
        const dT = d.list.filter(x => x.date === today).length; const dY = d.list.filter(x => x.date === yesterday).length;
        const dYsame = d.list.filter(x => x.date === yesterday && x.time <= cutoff).length;
        const aT = a.list.filter(x => x.date === today).length; const aY = a.list.filter(x => x.date === yesterday).length;
        const osT = os.list.find(x => x.date === yesterday); const osY = os.list.find(x => x.date === addDays(today, -2));
        const rows = [
          { metric: 'Runtime errors (dumps)', today: dT, yesterday: `${dY} (full day) / ${dYsame} (same time)` },
          { metric: 'Cancelled background jobs', today: cnt(jt, 'A', 'N'), yesterday: cnt(jy, 'A', 'N') },
          { metric: 'Finished background jobs', today: cnt(jt, 'F', 'N'), yesterday: cnt(jy, 'F', 'N') },
          { metric: 'Average job runtime', today: dur(Math.round(cnt(jt, 'F', 'SECS') / Math.max(1, cnt(jt, 'F', 'N')))), yesterday: dur(Math.round(cnt(jy, 'F', 'SECS') / Math.max(1, cnt(jy, 'F', 'N')))) },
          { metric: 'CCMS alerts (yellow + red)', today: aT, yesterday: aY },
          { metric: 'CPU used (OS collector, daily)', today: osT ? `${osT.cpu}% (${fmtD(osT.date)}, latest collected)` : 'n/a', yesterday: osY ? `${osY.cpu}% (${fmtD(osY.date)})` : 'n/a' }
        ];
        text = `Today so far vs yesterday: ${dT} dumps vs ${dYsame} by the same time yesterday (${dY} for the full day); ${cnt(jt, 'A', 'N')} vs ${cnt(jy, 'A', 'N')} cancelled jobs; ${cnt(jt, 'F', 'N')} vs ${cnt(jy, 'F', 'N')} finished jobs.`;
        sections.push({ title: `Performance Comparison — ${fmtD(today)} vs ${fmtD(yesterday)}`, columns: cols(['metric', 'Metric'], ['today', 'Today'], ['yesterday', 'Yesterday']), rows, note: `Today's figures run up to the current system time ${fmtT(cutoff)}. The OS collector writes one row per completed day, so CPU compares the two latest collected days. ${errNote(jt.error, jy.error)}` });
      } else {
        const latest = os.list[0];
        const rt = a.list.filter(x => /ResponseTime|LongRunners|ServerTime|5minLoadAverage|Heap|Swap|FreeBPWP/i.test(x.attribute));
        const running = await q("SELECT COUNT( * ) AS N FROM TBTCO WHERE STATUS = 'R'", 1);
        const today0 = d.list.filter(x => x.date === today).length;
        text = `Live indicators: CPU ${latest ? `${latest.cpu}% on ${fmtD(latest.date)}` : 'n/a'}, swap ${latest?.swapUsed ?? 'n/a'}%, ${num(running.rows[0]?.N)} background jobs running now, ${today0} runtime errors today, ${rt.length} response-time/load/memory alerts in the last 30 days${rt[0] ? ` (latest ${fmtD(rt[0].date)}: ${rt[0].attribute} — ${rt[0].message})` : ''}.`;
        sections.push({ title: 'Performance-Related CCMS Alerts — Last 30 Days', columns: ALERT_GROUP_COLS, rows: groupAlerts(rt) });
        sections.push({ title: "Today's Runtime Errors", columns: DUMP_COLS, rows: groupDumps(d.list.filter(x => x.date === today)) });
        sections.push({ title: 'OS Load History (OSMON)', columns: OS_COLS, rows: os.list.slice(0, 14).map(x => ({ ...x, date: fmtD(x.date) })) });
      }
      if (sections[0]) sections[0].note = `${sections[0].note ? `${sections[0].note} ` : ''}${errNote(os.error, a.error, d.error)}`.trim();
      return { text, sections, assess: true };
    }
    case 'USERS_LOCKED': case 'FAILED_LOGINS': case 'TECH_USER_AUTH': {
      const t = await userTexts();
      const where = intent === 'USERS_LOCKED' ? 'UFLAG <> 0' : intent === 'FAILED_LOGINS' ? 'LOCNT > 0' : `USTYP IN ( 'B', 'S', 'C' ) AND ( LOCNT > 0 OR UFLAG <> 0 OR ( GLTGB <> '00000000' AND GLTGB < '${today}' ) )`;
      const r = await q(`SELECT BNAME, USTYP, UFLAG, LOCNT, TRDAT, LTIME, GLTGB, PWDCHGDATE FROM USR02 WHERE ${where} ORDER BY LOCNT DESCENDING, BNAME ASCENDING`, 1000);
      const rows = r.rows.map(x => ({ user: x.BNAME, type: t.types[x.USTYP] || x.USTYP, lock: t.lockText(num(x.UFLAG)), failedLogons: num(x.LOCNT), lastLogon: `${fmtD(x.TRDAT)} ${x.TRDAT !== '00000000' ? fmtT(x.LTIME) : '(never)'}`.trim(), validTo: fmtD(x.GLTGB) || 'Unlimited', pwdChanged: fmtD(x.PWDCHGDATE) || 'Never' }));
      const byLock = new Map<string, number>(); rows.forEach(x => byLock.set(x.lock, (byLock.get(x.lock) || 0) + 1));
      const title = intent === 'USERS_LOCKED' ? 'Locked Users (USR02)' : intent === 'FAILED_LOGINS' ? 'Users with Failed Logon Attempts (USR02)' : 'Technical Users with Authentication Problems (USR02)';
      const text = intent === 'USERS_LOCKED'
        ? `${rows.length} users are locked: ${[...byLock.entries()].map(([k, v]) => `${v} ${k}`).join('; ')}.`
        : intent === 'FAILED_LOGINS'
          ? `${rows.length} user(s) currently have failed logon attempts recorded (failed-logon counter > 0)${rows[0] ? `; highest: ${rows[0].user} with ${rows[0].failedLogons}` : ''}; ${rows.filter(x => /Incorrect Logon/i.test(x.lock)).length} of them are locked because of incorrect logons.`
          : `${rows.length} system/service/communication user(s) have authentication problems (locked, failed logons, or expired validity)${rows[0] ? `, e.g. ${rows[0].user} (${rows[0].lock}, ${rows[0].failedLogons} failed logons)` : ''}.`;
      return { text: `${text} ${errNote(r.error)}`.trim(), sections: [{ title, summaryStats: [{ label: 'Users', value: String(rows.length) }, ...[...byLock.entries()].slice(0, 4).map(([k, v]) => ({ label: k, value: String(v) }))], columns: USER_COLS, rows, note: 'Lock reasons and user types are decoded with their live dictionary texts (DD07T). Individual failed-logon events are recorded in the Security Audit Log, which has no entries in this system; the counter shows current consecutive failures per user.' }], assess: false };
    }
    case 'RFC_FAILING': case 'SM58': case 'INTERFACES_DOWN': {
      const [rfc, qr] = await Promise.all([intent === 'SM58' ? q('SELECT ARFCDEST, ARFCSTATE, ARFCFNAM, ARFCMSG, ARFCDATUM, ARFCUZEIT, ARFCUSER, ARFCTCODE FROM ARFCSSTATE ORDER BY ARFCDATUM DESCENDING, ARFCUZEIT DESCENDING', 2000) : rfcErrors(intent === 'INTERFACES_DOWN' ? d30 : undefined), intent === 'INTERFACES_DOWN' ? qrfcProblems() : Promise.resolve(null as any)]);
      const g = groupRfc(rfc.rows);
      const sections: BasisSection[] = [{ title: intent === 'SM58' ? 'Transactional RFC Queue (SM58 — ARFCSSTATE)' : 'Failing RFC Destinations (ARFCSSTATE)', summaryStats: [{ label: intent === 'SM58' ? 'Queued tRFC calls' : 'Failed calls', value: String(rfc.total) }, { label: 'Destinations', value: String(g.length) }], columns: RFC_GROUP_COLS, rows: g, note: errNote(rfc.error) }];
      if (intent === 'SM58') sections.push({ title: 'Latest tRFC Entries', columns: cols(['date', 'Date/Time'], ['ARFCDEST', 'Destination'], ['ARFCSTATE', 'State'], ['ARFCFNAM', 'Function'], ['ARFCUSER', 'User'], ['ARFCMSG', 'Message']), rows: rfc.rows.slice(0, 200).map(x => ({ ...x, date: `${fmtD(x.ARFCDATUM)} ${fmtT(x.ARFCUZEIT)}` })) });
      if (qr) sections.push({ title: 'qRFC Queues in Error', columns: QRFC_COLS, rows: qr.rows });
      const text = intent === 'SM58'
        ? `${rfc.total} transactional RFC calls are waiting in SM58 across ${g.length} destination/state combination(s)${g[0] ? `; most: ${g[0].destination} (${g[0].state}, ${g[0].calls} calls, last error "${g[0].lastMessage}")` : ''}.`
        : intent === 'INTERFACES_DOWN'
          ? `${g.length} RFC destination(s) had communication/system failures in the last 30 days${g[0] ? ` (e.g. ${g[0].destination}: ${g[0].calls} failed calls, last ${g[0].lastDate})` : ''}, and ${qr?.rows.length || 0} qRFC queue(s) are in error${qr?.rows[0] ? ` (e.g. ${qr.rows[0].queue} → ${qr.rows[0].destination})` : ''}.`
          : `${g.length} RFC destination(s) have failed calls (${rfc.total} failed calls in total)${g[0] ? `; most affected: ${g[0].destination} — ${g[0].calls} calls, last "${g[0].lastMessage}" on ${g[0].lastDate}` : ''}.`;
      return { text, sections, assess: false };
    }
    case 'QRFC': {
      const qr = await qrfcProblems();
      const byQ = new Map<string, number>(); qr.rows.forEach(x => byQ.set(`${x.direction}|${x.queue}|${x.state}`, (byQ.get(`${x.direction}|${x.queue}|${x.state}`) || 0) + 1));
      return {
        text: `${qr.rows.filter(x => x.direction === 'Inbound').length} inbound and ${qr.rows.filter(x => x.direction === 'Outbound').length} outbound qRFC entries are not in READY state${qr.rows[0] ? `; e.g. ${qr.rows[0].direction} queue ${qr.rows[0].queue} (${qr.rows[0].state}): ${qr.rows[0].error}` : ''}. ${errNote(qr.error)}`,
        sections: [{ title: 'qRFC Problems — Inbound (SMQ2) and Outbound (SMQ1)', summaryStats: [{ label: 'Inbound in error', value: String(qr.rows.filter(x => x.direction === 'Inbound').length) }, { label: 'Outbound in error', value: String(qr.rows.filter(x => x.direction === 'Outbound').length) }, { label: 'Queues affected', value: String(byQ.size) }], columns: QRFC_COLS, rows: qr.rows, note: 'Entries from TRFCQIN/TRFCQOUT whose state is not READY, read live.' }],
        assess: false
      };
    }
    case 'CERT_EXPIRY': {
      const in30 = addDays(today, 30);
      const r = await q('SELECT NAME, CAT, DESCRIPT, ID, VALID_FROM, VALID_TO FROM STRUSTCERT ORDER BY VALID_TO ASCENDING', 500);
      const soon = r.rows.filter(x => x.VALID_TO >= today && x.VALID_TO <= in30);
      const expired = r.rows.filter(x => x.VALID_TO < today);
      const next = r.rows.find(x => x.VALID_TO > in30);
      const status = (x: Record<string, string>) => x.VALID_TO < today ? 'Expired' : x.VALID_TO <= in30 ? 'Expires within 30 days' : 'Valid';
      return {
        text: `${soon.length} certificate(s) in the certificate list expire within the next 30 days (${fmtD(today)} to ${fmtD(in30)}). ${expired.length} of ${r.rows.length} are already expired${next ? `; the next to expire is ${next.DESCRIPT} on ${fmtD(next.VALID_TO)}` : ''}. ${errNote(r.error)}`,
        sections: [{ title: 'Certificate Validity (STRUSTCERT)', summaryStats: [{ label: 'Certificates', value: String(r.rows.length) }, { label: 'Expiring ≤ 30 days', value: String(soon.length) }, { label: 'Already expired', value: String(expired.length) }], columns: cols(['status', 'Status'], ['DESCRIPT', 'Certificate'], ['NAME', 'Name'], ['CAT', 'Category'], ['from', 'Valid From'], ['to', 'Valid To'], ['ID', 'Subject']), rows: [...r.rows].sort((a, b) => (status(a) === 'Expires within 30 days' ? -1 : 0) - (status(b) === 'Expires within 30 days' ? -1 : 0)).map(x => ({ ...x, status: status(x), from: fmtD(x.VALID_FROM), to: fmtD(x.VALID_TO) })), note: 'Validity dates of the certificate list maintained in the trust manager, read live from STRUSTCERT. Certificates stored only inside PSE files are binary and not readable with SQL.' }],
        assess: false
      };
    }
    case 'PRIVILEGED': case 'AUDIT_RISKS': {
      const t = await userTexts();
      const [prof, star, users, sec] = await Promise.all([
        q("SELECT A~BNAME, A~PROFILE, B~USTYP, B~UFLAG, B~TRDAT, B~GLTGB FROM UST04 AS A INNER JOIN USR02 AS B ON A~BNAME = B~BNAME WHERE A~PROFILE IN ( 'SAP_ALL', 'SAP_NEW' )", 1000),
        q(`SELECT DISTINCT A~UNAME, A~AGR_NAME FROM AGR_USERS AS A INNER JOIN AGR_1251 AS B ON A~AGR_NAME = B~AGR_NAME WHERE B~OBJECT = 'S_TCODE' AND B~FIELD = 'TCD' AND B~LOW = '*' AND B~DELETED = '' AND A~FROM_DAT <= '${today}' AND A~TO_DAT >= '${today}'`, 1000),
        intent === 'AUDIT_RISKS' ? q('SELECT BNAME, USTYP, UFLAG, TRDAT, GLTGB, PWDCHGDATE FROM USR02', 2000) : Promise.resolve({ rows: [], total: 0 } as Q),
        intent === 'AUDIT_RISKS' ? alerts(d30, { objects: ['Security'] }) : Promise.resolve(null as any)
      ]);
      const active = (x: Record<string, string>) => num(x.UFLAG) === 0 && (x.GLTGB === '00000000' || x.GLTGB >= today);
      const privMap = new Map<string, { user: string; type: string; lock: string; lastLogon: string; access: Set<string> }>();
      prof.rows.forEach(x => { const e = privMap.get(x.BNAME) || { user: x.BNAME, type: t.types[x.USTYP] || x.USTYP, lock: t.lockText(num(x.UFLAG)), lastLogon: fmtD(x.TRDAT) || 'Never', access: new Set<string>() }; e.access.add(`Profile ${x.PROFILE}`); privMap.set(x.BNAME, e); });
      star.rows.forEach(x => { const e = privMap.get(x.UNAME) || { user: x.UNAME, type: '', lock: '', lastLogon: '', access: new Set<string>() }; e.access.add(`Role ${x.AGR_NAME} (all transactions)`); privMap.set(x.UNAME, e); });
      const priv = [...privMap.values()].map(e => ({ ...e, access: [...e.access].join(', ') }));
      const d90 = addDays(today, -90);
      if (intent === 'PRIVILEGED' && /dormant|inactive|unused/i.test(query)) {
        const lastLogon = new Map(prof.rows.map(x => [x.BNAME, x.TRDAT]));
        const star2 = star.rows.length ? await q(`SELECT BNAME, TRDAT FROM USR02 WHERE BNAME IN ( ${inList([...new Set(star.rows.map(x => x.UNAME))].slice(0, 300))} )`, 1000) : { rows: [] as Record<string, string>[], total: 0 };
        star2.rows.forEach(x => lastLogon.set(x.BNAME, x.TRDAT));
        const dormant = priv.filter(p => { const t2 = lastLogon.get(p.user) || '00000000'; return t2 === '00000000' || t2 < d90; })
          .map(p => ({ ...p, lastLogon: fmtD(lastLogon.get(p.user) || '') || 'Never' }));
        return {
          text: `${dormant.length} privileged account(s) have not logged on since ${fmtD(d90)} (or never): ${dormant.slice(0, 8).map(p => `${p.user} (${p.lastLogon})`).join(', ')}.`,
          sections: [{ title: 'Dormant Privileged Accounts (no logon for 90+ days)', summaryStats: [{ label: 'Dormant privileged users', value: String(dormant.length) }, { label: 'All privileged users', value: String(priv.length) }], columns: cols(['user', 'User'], ['type', 'User Type'], ['lock', 'Lock Status'], ['lastLogon', 'Last Logon'], ['access', 'Privileged Access']), rows: dormant, note: `Privileged = SAP_ALL/SAP_NEW profile (UST04) or a role granting all transactions (AGR_1251 S_TCODE = *); last logon from USR02, read live. ${errNote(prof.error, star.error)}` }],
          assess: false
        };
      }
      const activePriv = prof.rows.filter(active);
      const sections: BasisSection[] = [{ title: 'Privileged Accounts (SAP_ALL / SAP_NEW / all-transaction roles)', summaryStats: [{ label: 'Privileged users', value: String(priv.length) }, { label: 'SAP_ALL/SAP_NEW active & unlocked', value: String(new Set(activePriv.map(x => x.BNAME)).size) }, { label: 'All-transaction role users', value: String(new Set(star.rows.map(x => x.UNAME)).size) }], columns: cols(['user', 'User'], ['type', 'User Type'], ['lock', 'Lock Status'], ['lastLogon', 'Last Logon'], ['access', 'Privileged Access']), rows: priv, note: `Sources: UST04 (profiles), AGR_USERS + AGR_1251 (roles with S_TCODE = *), USR02 — read live. ${errNote(prof.error, star.error)}` }];
      let text = `${priv.length} accounts hold privileged access: ${new Set(prof.rows.map(x => x.BNAME)).size} with SAP_ALL/SAP_NEW (${new Set(activePriv.map(x => x.BNAME)).size} active and unlocked) and ${new Set(star.rows.map(x => x.UNAME)).size} through roles granting all transactions.`;
      if (intent === 'AUDIT_RISKS') {
        const all = users.rows;
        const defaults = all.filter(x => ['SAP*', 'DDIC', 'EARLYWATCH', 'TMSADM', 'SAPCPIC'].includes(x.BNAME));
        const dormantPriv = activePriv.filter(x => x.TRDAT !== '00000000' && x.TRDAT < d90);
        const neverLogged = all.filter(x => x.USTYP === 'A' && active(x) && x.TRDAT === '00000000');
        const oldPwd = all.filter(x => x.USTYP === 'A' && active(x) && x.PWDCHGDATE !== '00000000' && x.PWDCHGDATE < d90);
        const risks = [
          { risk: 'Active, unlocked users with SAP_ALL/SAP_NEW', count: new Set(activePriv.map(x => x.BNAME)).size, examples: [...new Set(activePriv.map(x => x.BNAME))].slice(0, 8).join(', ') },
          { risk: 'Privileged users not logged on for 90+ days', count: new Set(dormantPriv.map(x => x.BNAME)).size, examples: [...new Set(dormantPriv.map(x => x.BNAME))].slice(0, 8).join(', ') },
          { risk: 'Standard SAP users that are unlocked', count: defaults.filter(x => num(x.UFLAG) === 0).length, examples: defaults.filter(x => num(x.UFLAG) === 0).map(x => x.BNAME).join(', ') },
          { risk: 'Dialog users never logged on (still valid)', count: neverLogged.length, examples: neverLogged.slice(0, 8).map(x => x.BNAME).join(', ') },
          { risk: 'Dialog users with password older than 90 days', count: oldPwd.length, examples: oldPwd.slice(0, 8).map(x => x.BNAME).join(', ') },
          { risk: 'Security CCMS alerts (30 days)', count: sec?.list.length || 0, examples: sec?.list.slice(0, 3).map((x: Alert) => x.message).join(' | ') || '' }
        ];
        sections.unshift({ title: 'Basis Audit Risk Summary', summaryStats: risks.slice(0, 4).map(r => ({ label: r.risk, value: String(r.count) })), columns: cols(['risk', 'Risk'], ['count', 'Count'], ['examples', 'Examples']), rows: risks, note: `Checks run live on USR02, UST04, AGR_USERS/AGR_1251 and ALALERTDB. 90-day threshold from ${fmtD(d90)}.` });
        sections.push({ title: 'Standard SAP Users', columns: USER_COLS, rows: defaults.map(x => ({ user: x.BNAME, type: t.types[x.USTYP] || x.USTYP, lock: t.lockText(num(x.UFLAG)), failedLogons: '', lastLogon: fmtD(x.TRDAT) || 'Never', validTo: fmtD(x.GLTGB) || 'Unlimited', pwdChanged: fmtD(x.PWDCHGDATE) || 'Never' })) });
        text = `Basis audit risks found live: ${risks.filter(r => r.count > 0).map(r => `${r.count} ${r.risk.toLowerCase()}`).join('; ')}.`;
      }
      return { text, sections, assess: intent === 'AUDIT_RISKS' };
    }
  }
}

function DATE_SECS(date: string, time: string): number {
  if (!/^\d{8}$/.test(date) || date === '00000000') return 0;
  return Date.UTC(+date.slice(0, 4), +date.slice(4, 6) - 1, +date.slice(6, 8)) / 1000 + secsOf(time || '000000');
}
