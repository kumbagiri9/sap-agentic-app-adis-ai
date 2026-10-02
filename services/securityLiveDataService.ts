// Live SAP security answers read from the S/4HANA user, role and authorization tables (read-only ADT SQL).
// SoD and critical-authorization checks evaluate the real role authorizations (AGR_1251/AGR_USERS/UST04);
// the rule definitions below are documented SAP best-practice rule sets, the results are computed live.
import { executeReadOnlySelect } from './hanaDbIntelligenceService';

export type SecurityIntent =
  | 'ACTIVE_USERS' | 'DORMANT_USERS' | 'USERS_CREATED' | 'PWD_EXPIRED' | 'TERMINATED_ACCESS' | 'MULTI_DIALOG' | 'TECH_INTERACTIVE'
  | 'USERS_BY_ORG' | 'ACCOUNTS_REVIEW' | 'USER_ROLES' | 'TCODE_ACCESS' | 'SAP_ALL' | 'SAP_NEW' | 'CRITICAL_AUTH' | 'COMPOSITE'
  | 'ROLES_CHANGED' | 'NEW_ACCESS' | 'COMPARE_USERS' | 'SOD_ALL' | 'SOD_RULE' | 'SOD_HIGH' | 'MITIGATED' | 'MITIGATION_EXPIRED'
  | 'SOD_NEW' | 'SOD_ROLE_FIX' | 'FF_USERS' | 'FF_ACTIVITY' | 'FF_USER_ACTIVITY' | 'FF_UNREVIEWED' | 'PRIV_SENSITIVE' | 'FF_SHARED'
  | 'FF_NO_APPROVAL' | 'PRIV_FIN' | 'FF_INVESTIGATE' | 'AUTH_FAILURES' | 'SENSITIVE_FIN' | 'ROLE_CHANGES_PROD' | 'EXCESSIVE'
  | 'CONTROLS' | 'TOP_RISKS' | 'REMEDIATE';

export type SecuritySection = { title: string; summaryStats?: { label: string; value: string }[]; columns: { key: string; label: string }[]; rows: Record<string, string | number>[]; note?: string };
export type SecurityLiveReport = { text: string; sections: SecuritySection[]; assess: boolean; persona?: string };

export function classifySecurityLiveIntent(n: string): SecurityIntent | null {
  const has = (...w: string[]) => w.some(x => n.includes(x));
  const ff = has('firefighter', 'emergency-access', 'emergency access', 'fire fighter');
  if (ff || has('privileged users performed', 'privileged actions')) {
    if (has('what did') && /\buser\s+\S+/.test(n)) return 'FF_USER_ACTIVITY';
    if (has('unreviewed')) return 'FF_UNREVIEWED';
    if (has('too many')) return 'FF_SHARED';
    if (has('approval')) return 'FF_NO_APPROVAL';
    if (has('investigat')) return 'FF_INVESTIGATE';
    if (has('privileged actions') && has('finance', 'payroll')) return 'PRIV_FIN';
    if (has('privileged users performed', 'sensitive transaction')) return 'PRIV_SENSITIVE';
    if (has('today', '24 hours', 'last 24', 'activity', 'who used')) return 'FF_ACTIVITY';
    if (ff && has('users', 'ids', 'show all', 'list')) return 'FF_USERS';
  }
  if (has('mitigating control')) return has('expired') ? 'MITIGATION_EXPIRED' : 'MITIGATED';
  const sod = /\bsod\b/.test(n) || has('segregation of duties');
  if (sod && has('role change')) return 'SOD_ROLE_FIX';
  if (sod && has('new', 'introduced') && has('week', 'today')) return 'SOD_NEW';
  if (sod && has('high risk', 'critical')) return 'SOD_HIGH';
  if (sod && has('conflict', 'violation')) return 'SOD_ALL';
  if ((has('create') && has('pay') && has('vendor')) || (has('create') && has('purchase order') && has('approve')) || (has('create') && has('post') && has('journal entr')) || (has('procurement') && has('payment') && has('conflict'))) return 'SOD_RULE';
  if ((has('all active users', 'list active users', 'active users in', 'list of active users') || (/\bactive (?:sap )?users?\b/.test(n) && has('show', 'list', 'display', 'give', 'get', 'which', 'who are'))) && !has('number of', 'how many')) return 'ACTIVE_USERS';
  if (has('not logged in', 'not logged on', 'have not logged')) return 'DORMANT_USERS';
  if (has('users created')) return 'USERS_CREATED';
  if (has('expired password')) return 'PWD_EXPIRED';
  if (has('termination', 'terminated', 'leaver')) return 'TERMINATED_ACCESS';
  if (has('multiple dialog', 'more than one dialog')) return 'MULTI_DIALOG';
  if (has('service', 'technical') && has('interactive')) return 'TECH_INTERACTIVE';
  if (has('users by') && has('company code', 'plant', 'business unit')) return 'USERS_BY_ORG';
  if (has('user accounts') && has('review')) return 'ACCOUNTS_REVIEW';
  if (/what roles does user\s+\S+/.test(n) || /roles (?:assigned to|of) user\s+\S+/.test(n)) return 'USER_ROLES';
  if (/(access to|provide access|provides access|grant access)\s+(?:transaction\s+|t-?code\s+)?[a-z][a-z0-9_\/-]{1,19}\b/.test(n) && has('role', 'why does', 'who has', 'which users')) return 'TCODE_ACCESS';
  if (/\bsap_all\b/.test(n) && has('user')) return 'SAP_ALL';
  if (/\bsap_new\b/.test(n) && has('user')) return 'SAP_NEW';
  if (has('critical authorization object', 'critical authorisation object')) return 'CRITICAL_AUTH';
  if (has('composite role')) return 'COMPOSITE';
  if (has('role changes') && has('directly in production', 'in production')) return 'ROLE_CHANGES_PROD';
  if (has('roles') && has('changed recently', 'were changed', 'recently changed')) return 'ROLES_CHANGED';
  if (has('new production access', 'received new') && has('access')) return 'NEW_ACCESS';
  if (has('compare') && has("user's access", 'user access', 'access with another')) return 'COMPARE_USERS';
  if (has('authorization failure', 'authorisation failure', 'su53')) return 'AUTH_FAILURES';
  if (has('sensitive financial data')) return 'SENSITIVE_FIN';
  if (has('excessive access')) return 'EXCESSIVE';
  if (has('security control') && has('failing', 'failed')) return 'CONTROLS';
  if (has('security risk') && has('highest', 'top', 'today')) return 'TOP_RISKS';
  if (has('security team') && has('remediate', 'fix first')) return 'REMEDIATE';
  return null;
}

// ---------- live helpers ----------
type Q = { rows: Record<string, string>[]; total: number; error?: string };
async function q(sql: string, maxRows = 500): Promise<Q> {
  const r: any = await executeReadOnlySelect(sql, maxRows);
  if ('error' in r) return { rows: [], total: 0, error: r.error };
  return { rows: r.rows.map((row: any) => Object.fromEntries(Object.entries(row).map(([k, v]) => [k, String(v ?? '').trim()]))), total: r.totalRows ?? r.rowCount };
}
const num = (v: any) => Number(String(v ?? '').trim()) || 0;
const fmtD = (d: string) => /^\d{8}$/.test(d) && d !== '00000000' ? `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6)}` : '';
const addDays = (d: string, days: number) => {
  const dt = new Date(Date.UTC(+d.slice(0, 4), +d.slice(4, 6) - 1, +d.slice(6, 8) + days));
  return `${dt.getUTCFullYear()}${String(dt.getUTCMonth() + 1).padStart(2, '0')}${String(dt.getUTCDate()).padStart(2, '0')}`;
};
const weekStart = (d: string) => { const dt = new Date(Date.UTC(+d.slice(0, 4), +d.slice(4, 6) - 1, +d.slice(6, 8))); return addDays(d, -((dt.getUTCDay() + 6) % 7)); };
const inList = (vals: string[]) => vals.map(v => `'${v.replace(/'/g, "''")}'`).join(', ');
const cols = (...pairs: [string, string][]) => pairs.map(([key, label]) => ({ key, label }));
const errNote = (...errs: (string | undefined)[]) => errs.filter(Boolean).map(e => `Live read error: ${e}`).join(' ');
const uniq = <T,>(a: T[]) => [...new Set(a)];

async function sysDate(): Promise<string> {
  const r = await q('SELECT DISTINCT @sy-datum AS D FROM T000', 1);
  if (r.rows[0]?.D) return r.rows[0].D;
  const d = new Date();
  return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`;
}

type User = { name: string; type: string; typeText: string; group: string; uflag: number; lock: string; validFrom: string; validTo: string; created: string; creator: string; lastLogon: string; failed: number; pwdState: string; pwdChanged: string; fullName: string; dept: string; company: string; kostl: string };
const PWD_STATE: Record<string, string> = {};
async function loadUsers(): Promise<{ list: User[]; error?: string }> {
  const [u, t] = await Promise.all([
    q('SELECT A~BNAME, A~USTYP, A~CLASS, A~UFLAG, A~GLTGV, A~GLTGB, A~ERDAT, A~ANAME, A~TRDAT, A~LOCNT, A~PWDSTATE, A~PWDCHGDATE, B~NAME_FIRST, B~NAME_LAST, B~DEPARTMENT, B~COMPANY, B~KOSTL FROM USR02 AS A LEFT OUTER JOIN USER_ADDR AS B ON A~BNAME = B~BNAME', 5000),
    q("SELECT A~FIELDNAME, B~DOMVALUE_L, B~DDTEXT FROM DD03L AS A INNER JOIN DD07T AS B ON A~DOMNAME = B~DOMNAME WHERE A~TABNAME = 'USR02' AND A~FIELDNAME IN ( 'UFLAG', 'USTYP', 'PWDSTATE' ) AND A~AS4LOCAL = 'A' AND B~DDLANGUAGE = 'E' AND B~AS4LOCAL = 'A'", 100)
  ]);
  const lockBits = t.rows.filter(x => x.FIELDNAME === 'UFLAG' && num(x.DOMVALUE_L) > 0).map(x => ({ bit: num(x.DOMVALUE_L), text: x.DDTEXT }));
  const types = Object.fromEntries(t.rows.filter(x => x.FIELDNAME === 'USTYP').map(x => [x.DOMVALUE_L, x.DDTEXT]));
  t.rows.filter(x => x.FIELDNAME === 'PWDSTATE').forEach(x => { PWD_STATE[x.DOMVALUE_L] = x.DDTEXT; });
  const seen = new Set<string>();
  const list = u.rows.filter(x => !seen.has(x.BNAME) && seen.add(x.BNAME)).map(x => {
    const uflag = num(x.UFLAG);
    return {
      name: x.BNAME, type: x.USTYP, typeText: types[x.USTYP] || x.USTYP, group: x.CLASS, uflag,
      lock: lockBits.filter(b => (uflag & b.bit) === b.bit).map(b => b.text).join('; ') || (uflag ? `Lock code ${uflag}` : 'Not locked'),
      validFrom: x.GLTGV, validTo: x.GLTGB, created: x.ERDAT, creator: x.ANAME, lastLogon: x.TRDAT, failed: num(x.LOCNT), pwdState: x.PWDSTATE, pwdChanged: x.PWDCHGDATE,
      fullName: [x.NAME_FIRST, x.NAME_LAST].filter(Boolean).join(' '), dept: x.DEPARTMENT, company: x.COMPANY, kostl: x.KOSTL
    };
  });
  return { list, error: u.error };
}
const isValid = (u: User, today: string) => (!u.validFrom || u.validFrom === '00000000' || u.validFrom <= today) && (!u.validTo || u.validTo === '00000000' || u.validTo >= today);
const isActive = (u: User, today: string) => u.uflag === 0 && isValid(u, today);
const userRow = (u: User) => ({ user: u.name, name: u.fullName, type: u.typeText, group: u.group, lock: u.lock, lastLogon: fmtD(u.lastLogon) || 'Never', created: fmtD(u.created), validTo: fmtD(u.validTo) || 'Unlimited' });
const USER_COLS = cols(['user', 'User'], ['name', 'Name'], ['type', 'User Type'], ['group', 'User Group'], ['lock', 'Lock Status'], ['lastLogon', 'Last Logon'], ['created', 'Created'], ['validTo', 'Valid To']);

type Assign = { role: string; user: string; from: string; to: string; changed: string; viaComposite: boolean };
async function loadAssignments(): Promise<{ list: Assign[]; error?: string }> {
  const r = await q('SELECT AGR_NAME, UNAME, FROM_DAT, TO_DAT, CHANGE_DAT, COL_FLAG FROM AGR_USERS', 20000);
  return { list: r.rows.map(x => ({ role: x.AGR_NAME, user: x.UNAME, from: x.FROM_DAT, to: x.TO_DAT, changed: x.CHANGE_DAT, viaComposite: x.COL_FLAG === 'X' })), error: r.error };
}
const assignActive = (a: Assign, today: string) => (!a.from || a.from <= today) && (!a.to || a.to === '00000000' || a.to >= today);

async function loadProfiles(names: string[]) {
  return q(`SELECT BNAME, PROFILE FROM UST04 WHERE PROFILE IN ( ${inList(names)} )`, 2000);
}

// S_TCODE grants per role for a list of transactions (exact values, wildcards and ranges).
type Grant = { role: string; value: string };
async function tcodeGrants(tcodes: string[]): Promise<{ by: Map<string, Grant[]>; error?: string }> {
  const [exact, patt] = await Promise.all([
    q(`SELECT AGR_NAME, LOW FROM AGR_1251 WHERE OBJECT = 'S_TCODE' AND FIELD = 'TCD' AND DELETED <> 'X' AND LOW IN ( ${inList(tcodes)} )`, 20000),
    q("SELECT AGR_NAME, LOW, HIGH FROM AGR_1251 WHERE OBJECT = 'S_TCODE' AND FIELD = 'TCD' AND DELETED <> 'X' AND ( LOW LIKE '%*%' OR HIGH <> '' )", 20000)
  ]);
  const by = new Map<string, Grant[]>(tcodes.map(t => [t, []]));
  exact.rows.forEach(x => by.get(x.LOW)?.push({ role: x.AGR_NAME, value: x.LOW }));
  for (const x of patt.rows) for (const t of tcodes) {
    const hit = x.HIGH ? t >= x.LOW.replace(/\*.*$/, '') && t <= x.HIGH : t.startsWith(x.LOW.replace(/\*.*$/, ''));
    if (hit) by.get(t)!.push({ role: x.AGR_NAME, value: x.HIGH ? `${x.LOW}–${x.HIGH}` : x.LOW });
  }
  return { by, error: exact.error || patt.error };
}

// ---------- SoD ----------
// Generic SAP SoD rule set (function = transactions); results are evaluated against the live role authorizations.
const FUNCTIONS: Record<string, { label: string; tcodes: string[] }> = {
  VENDOR_MAINT: { label: 'Maintain vendor master', tcodes: ['XK01', 'XK02', 'FK01', 'FK02', 'MK01', 'MK02', 'BP'] },
  VENDOR_INVOICE: { label: 'Enter vendor invoice', tcodes: ['FB60', 'MIRO', 'F-43', 'FV60'] },
  PAYMENT: { label: 'Execute vendor payments', tcodes: ['F110', 'F-53', 'F-58', 'FBZ2', 'F111'] },
  PO_CREATE: { label: 'Create / change purchase order', tcodes: ['ME21N', 'ME21', 'ME22N', 'ME22'] },
  PO_RELEASE: { label: 'Approve (release) purchase order', tcodes: ['ME28', 'ME29N', 'ME29'] },
  GOODS_RECEIPT: { label: 'Post goods receipt', tcodes: ['MIGO', 'MB01'] },
  JE_PARK: { label: 'Create (park) journal entry', tcodes: ['FV50', 'FBV1', 'F-65'] },
  JE_POST: { label: 'Post journal entry', tcodes: ['FBV0', 'FB50', 'F-02', 'FB01'] },
  CUSTOMER_MAINT: { label: 'Maintain customer master', tcodes: ['XD01', 'XD02', 'FD01', 'FD02', 'VD01', 'VD02'] },
  CUSTOMER_PAYMENT: { label: 'Post incoming payment / clear customer', tcodes: ['F-28', 'F-32', 'FB75'] },
  USER_ADMIN: { label: 'Administer users and roles', tcodes: ['SU01', 'SU10', 'PFCG'] },
  FIN_POSTING: { label: 'Post financial documents', tcodes: ['FB01', 'FB50', 'F-02', 'FB60', 'FB70'] }
};
type SodRule = { id: string; name: string; a: string; b: string; risk: 'Critical' | 'High' | 'Medium'; area: 'P2P' | 'R2R' | 'O2C' | 'Basis' };
const SOD_RULES: SodRule[] = [
  { id: 'P2P01', name: 'Maintain vendor & pay vendor', a: 'VENDOR_MAINT', b: 'PAYMENT', risk: 'Critical', area: 'P2P' },
  { id: 'P2P02', name: 'Maintain vendor & enter vendor invoice', a: 'VENDOR_MAINT', b: 'VENDOR_INVOICE', risk: 'High', area: 'P2P' },
  { id: 'P2P03', name: 'Create & approve purchase order', a: 'PO_CREATE', b: 'PO_RELEASE', risk: 'High', area: 'P2P' },
  { id: 'P2P04', name: 'Create purchase order & pay vendor', a: 'PO_CREATE', b: 'PAYMENT', risk: 'High', area: 'P2P' },
  { id: 'P2P05', name: 'Enter vendor invoice & pay vendor', a: 'VENDOR_INVOICE', b: 'PAYMENT', risk: 'High', area: 'P2P' },
  { id: 'P2P06', name: 'Create purchase order & post goods receipt', a: 'PO_CREATE', b: 'GOODS_RECEIPT', risk: 'Medium', area: 'P2P' },
  { id: 'R2R01', name: 'Create & post journal entries', a: 'JE_PARK', b: 'JE_POST', risk: 'Medium', area: 'R2R' },
  { id: 'O2C01', name: 'Maintain customer & post incoming payments', a: 'CUSTOMER_MAINT', b: 'CUSTOMER_PAYMENT', risk: 'High', area: 'O2C' },
  { id: 'BAS01', name: 'Administer users/roles & post financial documents', a: 'USER_ADMIN', b: 'FIN_POSTING', risk: 'Critical', area: 'Basis' }
];
type Conflict = { user: User; rule: SodRule; aVia: string[]; bVia: string[]; aRoles: string[]; bRoles: string[] };
type SodData = { conflicts: Conflict[]; users: User[]; assigns: Assign[]; sapAll: Set<string>; roleChanged: Map<string, string>; today: string; error?: string };
async function computeSod(rules = SOD_RULES): Promise<SodData> {
  const today = await sysDate();
  const fnIds = uniq(rules.flatMap(r => [r.a, r.b]));
  const tcodes = uniq(fnIds.flatMap(f => FUNCTIONS[f].tcodes));
  const [us, as, prof, grants, agd] = await Promise.all([loadUsers(), loadAssignments(), loadProfiles(['SAP_ALL']), tcodeGrants(tcodes), q('SELECT AGR_NAME, CHANGE_DAT FROM AGR_DEFINE', 20000)]);
  const sapAll = new Set(prof.rows.map(x => x.BNAME));
  const roleChanged = new Map(agd.rows.map(x => [x.AGR_NAME, x.CHANGE_DAT]));
  const rolesOf = new Map<string, string[]>();
  as.list.filter(a => assignActive(a, today)).forEach(a => rolesOf.set(a.user, [...(rolesOf.get(a.user) || []), a.role]));
  const fnAccess = (u: User, fn: string) => {
    if (sapAll.has(u.name)) return { via: ['SAP_ALL profile'], roles: ['SAP_ALL'] };
    const roles = new Set(rolesOf.get(u.name) || []);
    const via: string[] = []; const rs = new Set<string>();
    for (const t of FUNCTIONS[fn].tcodes) for (const g of grants.by.get(t) || []) if (roles.has(g.role)) { via.push(`${t} via ${g.role}${g.value !== t ? ` (${g.value})` : ''}`); rs.add(g.role); }
    return { via: uniq(via), roles: [...rs] };
  };
  const conflicts: Conflict[] = [];
  for (const u of us.list.filter(u => isActive(u, today) && u.type === 'A')) for (const r of rules) {
    const a = fnAccess(u, r.a); if (!a.via.length) continue;
    const b = fnAccess(u, r.b); if (!b.via.length) continue;
    conflicts.push({ user: u, rule: r, aVia: a.via, bVia: b.via, aRoles: a.roles, bRoles: b.roles });
  }
  return { conflicts, users: us.list, assigns: as.list, sapAll, roleChanged, today, error: us.error || as.error || grants.error };
}
const RISK_RANK = { Critical: 3, High: 2, Medium: 1 } as const;
const conflictRow = (c: Conflict) => ({ user: c.user.name, name: c.user.fullName, ruleId: c.rule.id, rule: c.rule.name, risk: c.rule.risk, functionA: `${FUNCTIONS[c.rule.a].label}: ${c.aVia.slice(0, 3).join('; ')}${c.aVia.length > 3 ? ` (+${c.aVia.length - 3})` : ''}`, functionB: `${FUNCTIONS[c.rule.b].label}: ${c.bVia.slice(0, 3).join('; ')}${c.bVia.length > 3 ? ` (+${c.bVia.length - 3})` : ''}`, mitigation: 'None recorded' });
const CONFLICT_COLS = cols(['user', 'User'], ['name', 'Name'], ['ruleId', 'Rule'], ['rule', 'Conflict'], ['risk', 'Risk'], ['functionA', 'Access 1 (how)'], ['functionB', 'Access 2 (how)'], ['mitigation', 'Mitigating Control']);
const RULE_NOTE = `SoD rule set evaluated live (transaction authorizations S_TCODE in the users' active roles, plus SAP_ALL): ${SOD_RULES.map(r => `${r.id} ${FUNCTIONS[r.a].tcodes.join('/')} vs ${FUNCTIONS[r.b].tcodes.join('/')}`).join('; ')}. Active, unlocked dialog users only; Fiori app (S_SERVICE) and organisational-level restrictions are not evaluated.`;

// ---------- privileged users & change activity ----------
const CRITICAL_CHECKS: { object: string; label: string; test: (f: Record<string, string[]>) => boolean }[] = [
  { object: 'S_TCODE', label: 'All transactions (S_TCODE *)', test: f => (f.TCD || []).includes('*') },
  { object: 'S_DEVELOP', label: 'Debug & replace (change values in debugger)', test: f => anyOf(f.OBJTYPE, ['*', 'DEBUG']) && anyOf(f.ACTVT, ['*', '02']) },
  { object: 'S_TABU_DIS', label: 'Change all tables (S_TABU_DIS *)', test: f => anyOf(f.ACTVT, ['*', '02']) && anyOf(f.DICBERCLS, ['*']) },
  { object: 'S_TABU_NAM', label: 'Change all tables (S_TABU_NAM *)', test: f => anyOf(f.ACTVT, ['*', '02']) && anyOf(f.TABLE, ['*']) },
  { object: 'S_USER_GRP', label: 'Create/change users', test: f => anyOf(f.ACTVT, ['*', '01', '02']) && anyOf(f.CLASS, ['*']) },
  { object: 'S_USER_AGR', label: 'Create/change roles', test: f => anyOf(f.ACTVT, ['*', '01', '02']) && anyOf(f.ACT_GROUP, ['*']) },
  { object: 'S_USER_PRO', label: 'Create/change profiles', test: f => anyOf(f.ACTVT, ['*', '01', '02']) && anyOf(f.PROFILE, ['*']) },
  { object: 'S_RFC', label: 'Call any RFC function', test: f => anyOf(f.RFC_NAME, ['*']) && anyOf(f.ACTVT, ['*', '16']) },
  { object: 'S_PROGRAM', label: 'Run any program', test: f => anyOf(f.P_GROUP, ['*']) && anyOf(f.P_ACTION, ['*', 'SUBMIT', 'BTCSUBMIT']) },
  { object: 'S_ADMI_FCD', label: 'All system administration functions', test: f => anyOf(f.S_ADMI_FCD, ['*']) },
  { object: 'S_BTCH_ADM', label: 'Background job administrator', test: f => anyOf(f.BTCADMIN, ['Y', '*']) },
  { object: 'S_CTS_ADMI', label: 'Transport administration', test: f => anyOf(f.CTS_ADMFCT, ['*']) }
];
function anyOf(vals: string[] | undefined, wanted: string[]) { return !!vals?.some(v => wanted.includes(v)); }
async function criticalRoles(): Promise<{ hits: { role: string; object: string; label: string }[]; error?: string }> {
  const r = await q(`SELECT AGR_NAME, OBJECT, AUTH, FIELD, LOW FROM AGR_1251 WHERE DELETED <> 'X' AND OBJECT IN ( ${inList(CRITICAL_CHECKS.map(c => c.object))} ) AND LOW IN ( '*', '01', '02', '16', 'DEBUG', 'Y', 'SUBMIT', 'BTCSUBMIT' )`, 50000);
  const auths = new Map<string, { role: string; object: string; f: Record<string, string[]> }>();
  r.rows.forEach(x => { const k = `${x.AGR_NAME}|${x.OBJECT}|${x.AUTH}`; const e = auths.get(k) || { role: x.AGR_NAME, object: x.OBJECT, f: {} }; (e.f[x.FIELD] ||= []).push(x.LOW); auths.set(k, e); });
  const hits = new Map<string, { role: string; object: string; label: string }>();
  for (const a of auths.values()) for (const c of CRITICAL_CHECKS.filter(c => c.object === a.object)) if (c.test(a.f)) hits.set(`${a.role}|${c.label}`, { role: a.role, object: c.object, label: c.label });
  return { hits: [...hits.values()], error: r.error };
}
type Priv = { user: User; reasons: string[] };
async function privilegedUsers(today: string, users: User[], assigns: Assign[]): Promise<{ list: Priv[]; error?: string }> {
  const [prof, crit] = await Promise.all([loadProfiles(['SAP_ALL', 'SAP_NEW']), criticalRoles()]);
  const reasons = new Map<string, Set<string>>();
  const add = (u: string, r: string) => reasons.set(u, (reasons.get(u) || new Set<string>()).add(r));
  prof.rows.forEach(x => add(x.BNAME, `${x.PROFILE} profile`));
  const critByRole = new Map<string, string[]>(); crit.hits.forEach(h => critByRole.set(h.role, [...(critByRole.get(h.role) || []), h.label]));
  assigns.filter(a => assignActive(a, today) && critByRole.has(a.role)).forEach(a => critByRole.get(a.role)!.forEach(l => add(a.user, `${l} (${a.role})`)));
  const rank = (p: Priv) => (p.reasons.some(r => r.startsWith('SAP_ALL')) ? 1000 : 0) + p.reasons.length;
  return { list: users.filter(u => reasons.has(u.name)).map(u => ({ user: u, reasons: [...reasons.get(u.name)!] })).sort((a, b) => rank(b) - rank(a)), error: prof.error || crit.error };
}
async function changeDocs(where: string, maxRows = 5000) {
  return q(`SELECT OBJECTCLAS, OBJECTID, CHANGENR, USERNAME, UDATE, UTIME, TCODE FROM CDHDR WHERE ${where} ORDER BY UDATE DESCENDING, UTIME DESCENDING`, maxRows);
}
const FIN_CLASSES = ['BELEG', 'BELEGR', 'KRED', 'DEBI', 'SACH', 'BANK', 'ANLA', 'KOSTL', 'KSTAR', 'FI_PAYRQ', 'PAYR', 'REGUH', 'FINS_SACH', 'BUPA_BUP', 'BUPA_BKK', 'FIPAYM', 'KONDA', 'PERS', 'PA_PERSON', 'HRPAD'];
const isFinPayroll = (x: Record<string, string>) => FIN_CLASSES.includes(x.OBJECTCLAS) || /^(F|PA|PC|PU|PE)/.test(x.TCODE);
const fmtT = (t: string) => /^\d{6}$/.test(t) ? `${t.slice(0, 2)}:${t.slice(2, 4)}:${t.slice(4)}` : t;
const cdRow = (x: Record<string, string>) => ({ user: x.USERNAME, date: `${fmtD(x.UDATE)} ${fmtT(x.UTIME)}`, tcode: x.TCODE, objectClass: x.OBJECTCLAS, object: x.OBJECTID, changeNo: x.CHANGENR });
const CD_COLS = cols(['user', 'User'], ['date', 'Date/Time'], ['tcode', 'Transaction'], ['objectClass', 'Object Class'], ['object', 'Object'], ['changeNo', 'Change Doc No.']);

async function emergencyAccessCheck() {
  const [grac, ffUsers, sal] = await Promise.all([
    q("SELECT TABNAME FROM DD02L WHERE AS4LOCAL = 'A' AND TABCLASS = 'TRANSP' AND ( TABNAME LIKE 'GRACFF%' OR TABNAME LIKE 'GRACFFLOG%' OR TABNAME LIKE 'GRACMIT%' OR TABNAME LIKE 'GRFN%' )", 50),
    q("SELECT BNAME FROM USR02 WHERE BNAME LIKE 'FF%' OR BNAME LIKE '%FIRE%' OR BNAME LIKE '%EMERG%' OR CLASS LIKE '%FIRE%' OR CLASS LIKE 'FF%'", 100),
    q('SELECT COUNT( * ) AS N FROM RSAU_BUF_DATA', 1)
  ]);
  const rows = [
    { check: 'GRC Access Control firefighter / mitigation tables (GRACFF*, GRACMIT*, GRFN*)', result: grac.rows.length ? grac.rows.map(x => x.TABNAME).join(', ') : 'Not installed (0 tables)' },
    { check: 'Firefighter-style user IDs (FF*, *FIRE*, *EMERG*, user group FIRE*/FF*)', result: ffUsers.rows.length ? ffUsers.rows.map(x => x.BNAME).join(', ') : 'None found' },
    { check: 'Security Audit Log entries stored in the database (RSAU_BUF_DATA)', result: String(num(sal.rows[0]?.N)) }
  ];
  return { installed: grac.rows.length > 0, ffIds: ffUsers.rows.map(x => x.BNAME), salRows: num(sal.rows[0]?.N), section: { title: 'Emergency Access (Firefighter) — Live System Check', columns: cols(['check', 'Check'], ['result', 'Result']), rows } as SecuritySection };
}

// ---------- intent builders ----------
export async function buildSecurityLiveReport(intent: SecurityIntent, query: string): Promise<SecurityLiveReport> {
  const today = await sysDate();
  const n = query.toLowerCase();
  const STOP = ['THIS', 'THAT', 'HAVE', 'HAS', 'WITH', 'IN', 'AND', 'OR', 'THE', 'IS', 'CAN', 'DOES', 'DID', 'ID', 'IDS', 'GROUP', 'TYPE', 'ROLE', 'ROLES', 'ACCESS', 'ACCOUNT', 'ACCOUNTS', 'DO', 'FOR', 'TO'];
  const realName = [...query.matchAll(/\buser\s+([A-Za-z0-9_.*-]{2,12})\b/gi)].map(m => m[1].toUpperCase()).find(x => !STOP.includes(x)) || '';

  switch (intent) {
    case 'ACTIVE_USERS': {
      const us = await loadUsers();
      const act = us.list.filter(u => isActive(u, today));
      const byType = new Map<string, number>(); act.forEach(u => byType.set(u.typeText, (byType.get(u.typeText) || 0) + 1));
      const sys = n.includes('prd') || n.includes('production') ? ' The connected system is S8H client 100 (client role: demo/test, not a PRD system); these are its users.' : '';
      return {
        text: `${act.length} of ${us.list.length} users are active (not locked and within their validity period): ${[...byType.entries()].map(([t, c]) => `${c} ${t}`).join(', ')}. ${act.filter(u => u.lastLogon >= addDays(today, -30)).length} of them logged on in the last 30 days.${sys}`,
        sections: [{ title: 'Active Users (USR02)', summaryStats: [{ label: 'Active users', value: String(act.length) }, { label: 'All users', value: String(us.list.length) }, ...[...byType.entries()].map(([t, c]) => ({ label: t, value: String(c) }))], columns: USER_COLS, rows: act.sort((a, b) => b.lastLogon.localeCompare(a.lastLogon)).map(userRow), note: `Active = lock flag 0 and today within valid-from/valid-to. ${errNote(us.error)}` }],
        assess: false
      };
    }
    case 'DORMANT_USERS': {
      const days = num(n.match(/(\d+)\s*days/)?.[1]) || 90;
      const us = await loadUsers();
      const cut = addDays(today, -days);
      const dormant = us.list.filter(u => isActive(u, today) && (!u.lastLogon || u.lastLogon === '00000000' || u.lastLogon < cut));
      const never = dormant.filter(u => !u.lastLogon || u.lastLogon === '00000000').length;
      return {
        text: `${dormant.length} active (unlocked) users have not logged on for ${days} days or more (last logon before ${fmtD(cut)}); ${never} have never logged on. ${dormant.filter(u => u.type === 'A').length} of them are dialog users and should be locked or reviewed.`,
        sections: [{ title: `Users Without Logon for ${days}+ Days`, summaryStats: [{ label: 'Dormant active users', value: String(dormant.length) }, { label: 'Never logged on', value: String(never) }, { label: 'Dialog users', value: String(dormant.filter(u => u.type === 'A').length) }], columns: USER_COLS, rows: dormant.sort((a, b) => a.lastLogon.localeCompare(b.lastLogon)).map(userRow), note: `Last logon date USR02-TRDAT; locked or expired users excluded. ${errNote(us.error)}` }],
        assess: false
      };
    }
    case 'USERS_CREATED': {
      const from = n.includes('today') ? today : n.includes('month') ? addDays(today, -30) : weekStart(today);
      const us = await loadUsers();
      const list = us.list.filter(u => u.created >= from).sort((a, b) => b.created.localeCompare(a.created));
      return {
        text: list.length ? `${list.length} user(s) were created since ${fmtD(from)}: ${list.slice(0, 10).map(u => `${u.name} (${fmtD(u.created)}, by ${u.creator})`).join(', ')}.` : `No users were created since ${fmtD(from)}. The most recent user creation was ${[...us.list].sort((a, b) => b.created.localeCompare(a.created))[0]?.name || 'n/a'} on ${fmtD([...us.list].sort((a, b) => b.created.localeCompare(a.created))[0]?.created || '')}.`,
        sections: [{ title: `Users Created Since ${fmtD(from)}`, columns: cols(['user', 'User'], ['name', 'Name'], ['type', 'User Type'], ['created', 'Created'], ['creator', 'Created By'], ['lock', 'Lock Status'], ['lastLogon', 'Last Logon']), rows: (list.length ? list : [...us.list].sort((a, b) => b.created.localeCompare(a.created)).slice(0, 10)).map(u => ({ ...userRow(u), creator: u.creator })), note: list.length ? 'USR02 creation date/creator, read live.' : 'No creations in the period — the 10 most recently created users are shown instead.' }],
        assess: false
      };
    }
    case 'PWD_EXPIRED': {
      const us = await loadUsers();
      const flagged = us.list.filter(u => ['1', '2', '3'].includes(u.pwdState));
      const old = us.list.filter(u => isActive(u, today) && u.type === 'A' && u.pwdChanged && u.pwdChanged !== '00000000' && u.pwdChanged < addDays(today, -180));
      const byState = new Map<string, number>(); us.list.forEach(u => byState.set(u.pwdState, (byState.get(u.pwdState) || 0) + 1));
      return {
        text: `${us.list.filter(u => u.pwdState === '2').length} users have an expired password (status 2) and ${us.list.filter(u => u.pwdState === '1').length} have an initial password that must be changed; ${flagged.length} in total must change their password at next logon. In addition, ${old.length} active dialog users have not changed their password for more than 180 days.`,
        sections: [
          { title: 'Users Who Must Change Their Password', columns: cols(['user', 'User'], ['type', 'User Type'], ['status', 'Password Status'], ['changed', 'Password Last Changed'], ['lastLogon', 'Last Logon'], ['lock', 'Lock Status']), rows: flagged.map(u => ({ user: u.name, type: u.typeText, status: PWD_STATE[u.pwdState] || u.pwdState, changed: fmtD(u.pwdChanged), lastLogon: fmtD(u.lastLogon) || 'Never', lock: u.lock })) },
          { title: 'Active Dialog Users With Passwords Older Than 180 Days', columns: cols(['user', 'User'], ['changed', 'Password Last Changed'], ['lastLogon', 'Last Logon']), rows: old.sort((a, b) => a.pwdChanged.localeCompare(b.pwdChanged)).map(u => ({ user: u.name, changed: fmtD(u.pwdChanged), lastLogon: fmtD(u.lastLogon) || 'Never' })) },
          { title: 'Password Status Distribution', columns: cols(['status', 'Password Status'], ['users', 'Users']), rows: [...byState.entries()].map(([s, c]) => ({ status: PWD_STATE[s] || s, users: c })), note: 'USR02-PWDSTATE with domain texts; the expiry period itself is a profile parameter not stored in the database.' }
        ],
        assess: false
      };
    }
    case 'TERMINATED_ACCESS': {
      const [us, as, hr] = await Promise.all([loadUsers(), loadAssignments(), q(`SELECT A~PERNR, A~USRID, B~BEGDA FROM PA0105 AS A INNER JOIN PA0000 AS B ON A~PERNR = B~PERNR WHERE A~SUBTY = '0001' AND B~STAT2 = '0' AND B~BEGDA <= '${today}' AND B~ENDDA >= '${today}'`, 500)]);
      const expired = us.list.filter(u => u.validTo && u.validTo !== '00000000' && u.validTo < today);
      const rows = expired.map(u => { const roles = as.list.filter(a => a.user === u.name && assignActive(a, today)); return { user: u.name, name: u.fullName, validTo: fmtD(u.validTo), lock: u.lock, activeRoles: roles.length, roles: roles.slice(0, 6).map(r => r.role).join(', '), lastLogon: fmtD(u.lastLogon) || 'Never' }; }).filter(r => r.activeRoles > 0 || r.lock === 'Not locked');
      const hrRows = hr.rows.map(x => { const u = us.list.find(z => z.name === x.USRID.toUpperCase()); return { pernr: x.PERNR, user: x.USRID, leftOn: fmtD(x.BEGDA), lock: u?.lock || 'User not found', activeRoles: as.list.filter(a => a.user === x.USRID.toUpperCase() && assignActive(a, today)).length }; }).filter(r => r.lock === 'Not locked' || r.activeRoles > 0);
      return {
        text: `${rows.length} user account(s) whose validity has ended still keep active role assignments or are not locked${rows[0] ? ` (e.g. ${rows.slice(0, 5).map(r => `${r.user}, valid to ${r.validTo}, ${r.activeRoles} roles`).join('; ')})` : ''}. HR check: ${hrRows.length} withdrawn employee(s) linked to a user (infotype 0105) still have access${hr.error ? ' (HR read failed)' : ''}.`,
        sections: [
          { title: 'Accounts Past Their End Date That Still Have Access', columns: cols(['user', 'User'], ['name', 'Name'], ['validTo', 'Valid To'], ['lock', 'Lock Status'], ['activeRoles', 'Active Roles'], ['roles', 'Roles'], ['lastLogon', 'Last Logon']), rows, note: 'USR02 validity end (GLTGB) compared with active AGR_USERS assignments.' },
          { title: 'Withdrawn Employees With an SAP User (HR Infotype 0000/0105)', columns: cols(['pernr', 'Personnel No.'], ['user', 'User'], ['leftOn', 'Withdrawn Since'], ['lock', 'Lock Status'], ['activeRoles', 'Active Roles']), rows: hrRows, note: `Employment status 0 (withdrawn) in PA0000 linked to users via PA0105 subtype 0001. ${errNote(hr.error)}` }
        ],
        assess: false
      };
    }
    case 'MULTI_DIALOG': {
      const us = await loadUsers();
      const by = new Map<string, User[]>();
      us.list.filter(u => u.type === 'A' && u.fullName.trim()).forEach(u => { const k = u.fullName.trim().toUpperCase(); by.set(k, [...(by.get(k) || []), u]); });
      const dup = [...by.entries()].filter(([, l]) => l.length > 1).sort((a, b) => b[1].length - a[1].length);
      return {
        text: dup.length ? `${dup.length} person name(s) own more than one dialog account (${dup.reduce((a, [, l]) => a + l.length, 0)} accounts in total): ${dup.slice(0, 5).map(([nm, l]) => `${nm} (${l.map(u => u.name).join(', ')})`).join('; ')}.` : 'No person owns more than one dialog account (matched on first and last name in the user address data).',
        sections: [{ title: 'Persons With Multiple Dialog Accounts', columns: cols(['person', 'Person'], ['accounts', 'Accounts'], ['users', 'User IDs'], ['active', 'Active'], ['lastLogons', 'Last Logons']), rows: dup.map(([nm, l]) => ({ person: nm, accounts: l.length, users: l.map(u => u.name).join(', '), active: l.filter(u => isActive(u, today)).length, lastLogons: l.map(u => `${u.name}: ${fmtD(u.lastLogon) || 'never'}`).join('; ') })), note: `Dialog users (type A) grouped by first + last name from USER_ADDR; ${us.list.filter(u => u.type === 'A' && !u.fullName.trim()).length} dialog users have no name maintained and cannot be matched.` }],
        assess: false
      };
    }
    case 'TECH_INTERACTIVE': {
      const [us, rfc, jobs] = await Promise.all([loadUsers(), q("SELECT RFCDEST, RFCOPTIONS FROM RFCDES WHERE RFCOPTIONS LIKE '%U=%'", 2000), q('SELECT AUTHCKNAM, COUNT( * ) AS N FROM TBTCP GROUP BY AUTHCKNAM', 500)]);
      const rfcUsers = new Map<string, string[]>();
      rfc.rows.forEach(x => { const m = /(?:^|,)U=([^,]+)/.exec(x.RFCOPTIONS); if (m) rfcUsers.set(m[1].toUpperCase(), [...(rfcUsers.get(m[1].toUpperCase()) || []), x.RFCDEST]); });
      const jobUsers = new Map(jobs.rows.map(x => [x.AUTHCKNAM, num(x.N)]));
      const rows = us.list.filter(u => u.type === 'A' && (rfcUsers.has(u.name) || (jobUsers.has(u.name) && !u.fullName))).map(u => ({ user: u.name, type: u.typeText, usedBy: [rfcUsers.has(u.name) ? `RFC destinations: ${rfcUsers.get(u.name)!.slice(0, 4).join(', ')}${rfcUsers.get(u.name)!.length > 4 ? ' …' : ''}` : '', jobUsers.has(u.name) ? `${jobUsers.get(u.name)} job steps` : ''].filter(Boolean).join('; '), lock: u.lock, lastLogon: fmtD(u.lastLogon) || 'Never', recommendation: 'Change to user type System (B) or Service (S)' }));
      const nonDialog = us.list.filter(u => u.type !== 'A');
      return {
        text: `${rows.length} technical account(s) are defined as interactive dialog users although they are used technically (as RFC destination logon users or as nameless background-job users): ${rows.slice(0, 8).map(r => r.user).join(', ') || 'none'}. ${nonDialog.length} accounts are correctly non-interactive (system/communication/service types).`,
        sections: [
          { title: 'Technical Accounts Defined as Dialog (Interactive) Users', columns: cols(['user', 'User'], ['type', 'User Type'], ['usedBy', 'Technical Usage'], ['lock', 'Lock Status'], ['lastLogon', 'Last Logon'], ['recommendation', 'Recommendation']), rows, note: 'Technical usage from RFC destinations (RFCDES logon user) and background job steps (TBTCP) of users without a person name; user types from USR02.' },
          { title: 'Non-Interactive Accounts', columns: USER_COLS, rows: nonDialog.map(userRow) }
        ],
        assess: false
      };
    }
    case 'USERS_BY_ORG': {
      const [us, par] = await Promise.all([loadUsers(), q("SELECT BNAME, PARID, PARVA FROM USR05 WHERE PARID IN ( 'BUK', 'WRK', 'VKO', 'EKO', 'KOK', 'GSB' )", 5000)]);
      const p = (u: string, id: string) => par.rows.filter(x => x.BNAME === u && x.PARID === id).map(x => x.PARVA).join(', ');
      const rows = us.list.filter(u => isActive(u, today)).map(u => ({ user: u.name, name: u.fullName, companyCode: p(u.name, 'BUK'), plant: p(u.name, 'WRK'), salesOrg: p(u.name, 'VKO'), purchOrg: p(u.name, 'EKO'), businessArea: p(u.name, 'GSB'), department: u.dept, company: u.company, costCenter: u.kostl })).filter(r => r.companyCode || r.plant || r.salesOrg || r.purchOrg || r.businessArea || r.department || r.company || r.costCenter);
      const agg = (k: 'companyCode' | 'plant') => { const m = new Map<string, number>(); rows.forEach(r => String(r[k]).split(', ').filter(Boolean).forEach(v => m.set(v, (m.get(v) || 0) + 1))); return [...m.entries()].sort((a, b) => b[1] - a[1]); };
      return {
        text: `${rows.length} active users have an organisational assignment. By company code: ${agg('companyCode').map(([v, c]) => `${v} (${c})`).join(', ') || 'none'}; by plant: ${agg('plant').map(([v, c]) => `${v} (${c})`).join(', ') || 'none'}.`,
        sections: [{ title: 'Users by Company Code, Plant and Business Unit', columns: cols(['user', 'User'], ['name', 'Name'], ['companyCode', 'Company Code'], ['plant', 'Plant'], ['salesOrg', 'Sales Org'], ['purchOrg', 'Purch. Org'], ['businessArea', 'Business Area'], ['department', 'Department'], ['company', 'Company'], ['costCenter', 'Cost Center']), rows, note: 'User parameters (USR05: BUK, WRK, VKO, EKO, GSB) and user address data (USER_ADDR department/company/cost center). Role-level organisational restrictions are not shown here.' }],
        assess: false
      };
    }
    case 'USER_ROLES': case 'COMPOSITE': {
      const [us, as, agrs, txt] = await Promise.all([loadUsers(), loadAssignments(), q('SELECT AGR_NAME, CHILD_AGR FROM AGR_AGRS', 20000), q("SELECT AGR_NAME, TEXT FROM AGR_TEXTS WHERE SPRAS = 'E' AND LINE = '00000'", 20000)]);
      const composites = new Set(agrs.rows.map(x => x.AGR_NAME));
      const text = (r: string) => txt.rows.find(x => x.AGR_NAME === r)?.TEXT || '';
      if (intent === 'USER_ROLES' || realName) {
        const u = us.list.find(x => x.name === realName);
        if (!u) {
          const similar = us.list.filter(x => realName && x.name.includes(realName)).map(x => x.name);
          return { text: `User ${realName || '(none given)'} does not exist in the connected system (S8H client 100), so it has no roles.${similar.length ? ` Similar user IDs: ${similar.join(', ')}.` : ''} Name an existing user ID to see its roles.`, sections: [{ title: `User Lookup — ${realName}`, columns: cols(['check', 'Check'], ['result', 'Result']), rows: [{ check: `USR02 entry for ${realName}`, result: 'Not found' }, { check: 'Users checked', result: String(us.list.length) }, { check: 'Similar user IDs', result: similar.join(', ') || 'None' }] }], assess: false };
        }
        const mine = as.list.filter(a => a.user === u.name);
        const rows = mine.map(a => ({ role: a.role, description: text(a.role), kind: composites.has(a.role) ? 'Composite role' : a.viaComposite ? 'Single role (from composite)' : 'Single role', from: fmtD(a.from), to: fmtD(a.to), status: assignActive(a, today) ? 'Active' : 'Expired' })).filter(r => intent === 'USER_ROLES' || r.kind === 'Composite role');
        return { text: `User ${u.name}${u.fullName ? ` (${u.fullName})` : ''} has ${rows.length} ${intent === 'COMPOSITE' ? 'composite ' : ''}role assignment(s), ${rows.filter(r => r.status === 'Active').length} active. ${u.lock !== 'Not locked' ? `The user is locked (${u.lock}).` : ''}`, sections: [{ title: `Roles of ${u.name}`, columns: cols(['role', 'Role'], ['description', 'Description'], ['kind', 'Type'], ['from', 'Valid From'], ['to', 'Valid To'], ['status', 'Status']), rows, note: 'AGR_USERS / AGR_AGRS / AGR_TEXTS read live.' }], assess: false };
      }
      const rows = as.list.filter(a => composites.has(a.role) && !a.viaComposite).map(a => ({ user: a.user, role: a.role, description: text(a.role), children: agrs.rows.filter(x => x.AGR_NAME === a.role).length, from: fmtD(a.from), to: fmtD(a.to), status: assignActive(a, today) ? 'Active' : 'Expired' }));
      return {
        text: `No specific user was named, so all composite-role assignments are shown: ${rows.length} assignment(s) of ${uniq(rows.map(r => r.role)).length} composite role(s) to ${uniq(rows.map(r => r.user)).length} user(s). Name a user (e.g. "composite roles assigned to user ${rows[0]?.user || 'XYZ'}") to filter.`,
        sections: [{ title: 'Composite Roles Assigned to Users', columns: cols(['user', 'User'], ['role', 'Composite Role'], ['description', 'Description'], ['children', 'Single Roles Inside'], ['from', 'Valid From'], ['to', 'Valid To'], ['status', 'Status']), rows, note: `${composites.size} composite roles exist (AGR_AGRS).` }],
        assess: false
      };
    }
    case 'TCODE_ACCESS': {
      const tcode = ((query.match(/(?:transaction|t-?code)\s+([A-Za-z][A-Za-z0-9_\/-]{1,19})\b/i) || query.match(/access to\s+([A-Za-z][A-Za-z0-9_\/-]{1,19})\b/i))?.[1] || '').toUpperCase();
      const [grants, us, as, prof, agrs] = await Promise.all([tcodeGrants([tcode]), loadUsers(), loadAssignments(), loadProfiles(['SAP_ALL']), q('SELECT AGR_NAME, CHILD_AGR FROM AGR_AGRS', 20000)]);
      const g = grants.by.get(tcode) || [];
      const roles = uniq(g.map(x => x.role));
      const parents = (r: string) => agrs.rows.filter(x => x.CHILD_AGR === r).map(x => x.AGR_NAME);
      const roleRows = roles.map(r => ({ role: r, value: uniq(g.filter(x => x.role === r).map(x => x.value)).join(', '), composites: parents(r).join(', '), users: uniq(as.list.filter(a => a.role === r && assignActive(a, today)).map(a => a.user)).length }));
      const userRows: Record<string, string | number>[] = [];
      for (const u of us.list.filter(u => isActive(u, today))) {
        const via = as.list.filter(a => a.user === u.name && assignActive(a, today) && roles.includes(a.role));
        if (via.length || prof.rows.some(p => p.BNAME === u.name)) userRows.push({ user: u.name, name: u.fullName, path: [...via.map(a => `${a.role}${a.viaComposite ? ` (inside composite ${parents(a.role).filter(p => as.list.some(x => x.user === u.name && x.role === p)).join('/') || 'role'})` : ''} — S_TCODE ${uniq(g.filter(x => x.role === a.role).map(x => x.value)).join(', ')}`), ...(prof.rows.some(p => p.BNAME === u.name) ? ['SAP_ALL profile'] : [])].join('; ') });
      }
      const why = n.includes('why');
      return {
        text: `${roles.length} role(s) grant transaction ${tcode} (authorization S_TCODE)${roles.length ? `: ${roleRows.sort((a, b) => b.users - a.users).slice(0, 6).map(r => `${r.role} (${r.users} users)`).join(', ')}` : ''}. ${userRows.length} active user(s) can start ${tcode}${why ? '; the table shows for each user exactly which role (and composite role) gives the access' : ''}. ${why && !realName ? 'No specific user was named, so all users are explained.' : ''}`,
        sections: [
          ...(why ? [{ title: `Why Users Can Run ${tcode} — Access Path`, columns: cols(['user', 'User'], ['name', 'Name'], ['path', 'Access Path (role — authorization value)']), rows: realName ? userRows.filter(r => r.user === realName) : userRows }] : []),
          { title: `Roles Granting ${tcode}`, summaryStats: [{ label: 'Roles', value: String(roles.length) }, { label: 'Users with access', value: String(userRows.length) }], columns: cols(['role', 'Role'], ['value', 'S_TCODE Value'], ['composites', 'Contained in Composite Roles'], ['users', 'Active Users']), rows: roleRows, note: `Exact, wildcard and range values of S_TCODE-TCD in AGR_1251 (deleted entries excluded); users via AGR_USERS; SAP_ALL holders also have access. ${errNote(grants.error)}` },
          ...(!why ? [{ title: `Users Who Can Run ${tcode}`, columns: cols(['user', 'User'], ['name', 'Name'], ['path', 'Access Path']), rows: userRows }] : [])
        ],
        assess: false
      };
    }
    case 'SAP_ALL': case 'SAP_NEW': {
      const prof = intent;
      const [p, us] = await Promise.all([loadProfiles([prof]), loadUsers()]);
      const rows = uniq(p.rows.map(x => x.BNAME)).map(b => { const u = us.list.find(x => x.name === b); return u ? { ...userRow(u), failed: u.failed } : { user: b, name: '', type: '', group: '', lock: 'User master missing', lastLogon: '', created: '', validTo: '' }; });
      const active = rows.filter(r => r.lock === 'Not locked');
      return {
        text: `${rows.length} users hold the ${prof} profile; ${active.length} are unlocked${active.length ? ` (${active.map(r => r.user).join(', ')})` : ''}. ${rows.filter(r => r.type === 'Dialog').length} are dialog users.${prof === 'SAP_ALL' ? ' SAP_ALL grants every authorization and should be limited to emergency/system accounts.' : ' SAP_NEW is an upgrade-compatibility profile and should not be assigned permanently.'}`,
        sections: [{ title: `Users With ${prof} (UST04)`, summaryStats: [{ label: 'Users', value: String(rows.length) }, { label: 'Unlocked', value: String(active.length) }], columns: USER_COLS, rows, note: `Profile assignments UST04, user status USR02. ${errNote(p.error)}` }],
        assess: false
      };
    }
    case 'CRITICAL_AUTH': {
      const [crit, as] = await Promise.all([criticalRoles(), loadAssignments()]);
      const byRole = new Map<string, string[]>(); crit.hits.forEach(h => byRole.set(h.role, [...(byRole.get(h.role) || []), h.label]));
      const rows = [...byRole.entries()].map(([role, labels]) => { const users = uniq(as.list.filter(a => a.role === role && assignActive(a, today)).map(a => a.user)); return { role, critical: labels.join('; '), count: labels.length, users: users.length, assignedTo: users.slice(0, 8).join(', ') }; }).sort((a, b) => b.users - a.users || b.count - a.count);
      const byObj = CRITICAL_CHECKS.map(c => ({ authorization: c.label, object: c.object, roles: crit.hits.filter(h => h.label === c.label).length }));
      return {
        text: `${rows.length} roles contain critical authorizations; ${rows.filter(r => r.users > 0).length} of them are assigned to users. Most widespread: ${rows.slice(0, 5).map(r => `${r.role} (${r.users} users: ${r.critical.split('; ')[0]})`).join('; ')}.`,
        sections: [
          { title: 'Roles With Critical Authorization Objects', summaryStats: [{ label: 'Critical roles', value: String(rows.length) }, { label: 'Assigned to users', value: String(rows.filter(r => r.users > 0).length) }], columns: cols(['role', 'Role'], ['critical', 'Critical Authorizations'], ['count', 'Critical Items'], ['users', 'Active Users'], ['assignedTo', 'Users (first 8)']), rows, note: `Evaluated from AGR_1251 field values per authorization (deleted entries excluded). ${errNote(crit.error)}` },
          { title: 'Critical Authorization Checks', columns: cols(['authorization', 'Critical Authorization'], ['object', 'Object'], ['roles', 'Roles Containing It']), rows: byObj }
        ],
        assess: false
      };
    }
    case 'ROLES_CHANGED': case 'ROLE_CHANGES_PROD': {
      const from = addDays(today, intent === 'ROLES_CHANGED' ? -30 : -90);
      const [r, cl] = await Promise.all([q(`SELECT AGR_NAME, CHANGE_USR, CHANGE_DAT, CHANGE_TIM, CREATE_USR, CREATE_DAT FROM AGR_DEFINE WHERE CHANGE_DAT >= '${from}' ORDER BY CHANGE_DAT DESCENDING, CHANGE_TIM DESCENDING`, 2000), q('SELECT MANDT, CCCATEGORY FROM T000', 100)]);
      const names = r.rows.map(x => x.AGR_NAME);
      const tr = names.length ? await q(`SELECT A~OBJ_NAME, A~TRKORR, B~AS4DATE, B~TRSTATUS FROM E071 AS A INNER JOIN E070 AS B ON A~TRKORR = B~TRKORR WHERE A~OBJECT = 'ACGR' AND A~OBJ_NAME IN ( ${inList(names.slice(0, 300))} )`, 5000) : { rows: [] } as any;
      const [as] = await Promise.all([loadAssignments()]);
      const rows = r.rows.map(x => { const t = tr.rows.filter((e: any) => e.OBJ_NAME === x.AGR_NAME && e.AS4DATE >= x.CHANGE_DAT); return { role: x.AGR_NAME, changedBy: x.CHANGE_USR, changedOn: `${fmtD(x.CHANGE_DAT)} ${fmtT(x.CHANGE_TIM)}`, created: `${fmtD(x.CREATE_DAT)} by ${x.CREATE_USR}`, transport: t.map((e: any) => e.TRKORR).join(', ') || 'Not transported', users: uniq(as.list.filter(a => a.role === x.AGR_NAME && assignActive(a, today)).map(a => a.user)).length }; });
      const direct = rows.filter(x => x.transport === 'Not transported');
      const cat: Record<string, string> = { P: 'Production', T: 'Test', C: 'Customizing', D: 'Demo', E: 'Training/Education', S: 'SAP reference' };
      const clientCat = cl.rows.find(x => x.MANDT === '100')?.CCCATEGORY || '';
      const clientRole = cat[clientCat] || clientCat || 'unknown';
      if (intent === 'ROLE_CHANGES_PROD') return {
        text: `The connected client 100 is classified as "${clientRole}"${clientCat === 'P' ? '' : ' (not a production client)'}. In the last 90 days ${rows.length} roles were changed here and ${direct.length} of those changes were made directly in this system without being recorded in a transport request: ${direct.slice(0, 6).map(d => `${d.role} (${d.changedOn}, ${d.changedBy})`).join('; ') || 'none'}.`,
        sections: [{ title: 'Role Changes Made Directly in the System (no transport)', summaryStats: [{ label: 'Roles changed (90d)', value: String(rows.length) }, { label: 'Changed without transport', value: String(direct.length) }, { label: 'Client role', value: clientRole }], columns: cols(['role', 'Role'], ['changedBy', 'Changed By'], ['changedOn', 'Changed On'], ['users', 'Active Users'], ['transport', 'Transport']), rows: direct, note: 'AGR_DEFINE change stamps compared with transport entries (E071 object ACGR, E070 date on/after the change); client role from T000.' }],
        assess: false
      };
      return {
        text: `${rows.length} roles were changed in the last 30 days${rows.length ? `; most recent: ${rows.slice(0, 5).map(x => `${x.role} (${x.changedOn}, ${x.changedBy})`).join('; ')}` : ''}. ${direct.length} of these changes are not in any transport request.`,
        sections: [{ title: 'Roles Changed in the Last 30 Days (AGR_DEFINE)', summaryStats: [{ label: 'Roles changed', value: String(rows.length) }, { label: 'Not transported', value: String(direct.length) }], columns: cols(['role', 'Role'], ['changedBy', 'Changed By'], ['changedOn', 'Changed On'], ['created', 'Created'], ['users', 'Active Users'], ['transport', 'Transport']), rows, note: `Role change stamps from AGR_DEFINE; transports from E071/E070. ${errNote(r.error)}` }],
        assess: false
      };
    }
    case 'NEW_ACCESS': {
      const from = n.includes('today') ? today : n.includes('month') ? addDays(today, -30) : weekStart(today);
      const [as, us] = await Promise.all([loadAssignments(), loadUsers()]);
      const rows = as.list.filter(a => a.changed >= from || a.from >= from).map(a => { const u = us.list.find(x => x.name === a.user); return { user: a.user, name: u?.fullName || '', role: a.role, from: fmtD(a.from), to: fmtD(a.to), changed: fmtD(a.changed), viaComposite: a.viaComposite ? 'Yes' : '' }; }).sort((a, b) => b.changed.localeCompare(a.changed));
      return {
        text: rows.length ? `${uniq(rows.map(r => r.user)).length} user(s) received ${rows.length} new or changed role assignment(s) since ${fmtD(from)}: ${uniq(rows.map(r => r.user)).slice(0, 8).join(', ')}.` : `No role assignments were added or changed since ${fmtD(from)}. Latest assignment change: ${[...as.list].sort((a, b) => b.changed.localeCompare(a.changed))[0]?.user || 'n/a'} on ${fmtD([...as.list].sort((a, b) => b.changed.localeCompare(a.changed))[0]?.changed || '')}.`,
        sections: [{ title: `New Access Since ${fmtD(from)} (Role Assignments)`, columns: cols(['user', 'User'], ['name', 'Name'], ['role', 'Role'], ['from', 'Valid From'], ['to', 'Valid To'], ['changed', 'Assigned/Changed On'], ['viaComposite', 'Via Composite']), rows: rows.length ? rows : [...as.list].sort((a, b) => b.changed.localeCompare(a.changed)).slice(0, 15).map(a => ({ user: a.user, name: '', role: a.role, from: fmtD(a.from), to: fmtD(a.to), changed: fmtD(a.changed), viaComposite: a.viaComposite ? 'Yes' : '' })), note: rows.length ? 'AGR_USERS assignment change date / valid-from, read live.' : 'No assignments in the period — the 15 most recent assignment changes are shown.' }],
        assess: false
      };
    }
    case 'COMPARE_USERS': case 'EXCESSIVE': {
      const [us, as, prof] = await Promise.all([loadUsers(), loadAssignments(), loadProfiles(['SAP_ALL'])]);
      const act = us.list.filter(u => isActive(u, today) && u.type === 'A');
      const roleSet = new Map(act.map(u => [u.name, new Set(as.list.filter(a => a.user === u.name && assignActive(a, today)).map(a => a.role))]));
      const peerKey = (u: User) => u.dept || u.group || '(no group)';
      const groups = new Map<string, User[]>(); act.forEach(u => groups.set(peerKey(u), [...(groups.get(peerKey(u)) || []), u]));
      const median = (a: number[]) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };
      if (intent === 'EXCESSIVE') {
        const rows: Record<string, string | number>[] = [];
        for (const [g, members] of groups) {
          if (members.length < 3) continue;
          const counts = members.map(m => roleSet.get(m.name)!.size); const med = median(counts);
          const common = new Map<string, number>(); members.forEach(m => roleSet.get(m.name)!.forEach(r => common.set(r, (common.get(r) || 0) + 1)));
          for (const m of members) {
            const c = roleSet.get(m.name)!.size; const extra = [...roleSet.get(m.name)!].filter(r => (common.get(r) || 0) <= Math.max(1, members.length * 0.2));
            const sapAll = prof.rows.some(p => p.BNAME === m.name);
            if (sapAll || (c >= Math.max(2 * med, med + 5) && c > 0)) rows.push({ user: m.name, name: m.fullName, peerGroup: g, peers: members.length, roles: c, peerMedian: med, sapAll: sapAll ? 'Yes' : '', uncommonRoles: extra.slice(0, 8).join(', ') });
          }
        }
        rows.sort((a, b) => (b.sapAll ? 1 : 0) - (a.sapAll ? 1 : 0) || (b.roles as number) - (a.roles as number));
        return {
          text: `${rows.length} active dialog user(s) have clearly more access than their peers (at least twice the peer median role count, or SAP_ALL): ${rows.slice(0, 6).map(r => `${r.user} (${r.roles} roles vs median ${r.peerMedian} in ${r.peerGroup}${r.sapAll ? ', SAP_ALL' : ''})`).join('; ')}.`,
          sections: [{ title: 'Users With Excessive Access Compared With Peers', columns: cols(['user', 'User'], ['name', 'Name'], ['peerGroup', 'Peer Group'], ['peers', 'Peers'], ['roles', 'Active Roles'], ['peerMedian', 'Peer Median'], ['sapAll', 'SAP_ALL'], ['uncommonRoles', 'Roles Few Peers Have']), rows, note: 'Peer group = department (USER_ADDR) or user group (USR02-CLASS); groups with fewer than 3 users skipped. Active role assignments from AGR_USERS.' }],
          assess: false
        };
      }
      const names = [...query.matchAll(/\buser\s+([A-Za-z0-9_.-]{2,12})\b/gi)].map(m => m[1].toUpperCase()).filter(x => !['ACCESS', 'IN', 'THIS'].includes(x));
      let a: User | undefined; let b: User | undefined; let reason = '';
      if (names.length >= 2) { a = act.find(u => u.name === names[0]); b = act.find(u => u.name === names[1]); reason = 'the two named users'; }
      if (!a || !b) {
        const big = [...groups.entries()].filter(([, m]) => m.length >= 3).sort((x, y) => y[1].length - x[1].length)[0];
        if (big) {
          const common = new Map<string, number>(); big[1].forEach(m => roleSet.get(m.name)!.forEach(r => common.set(r, (common.get(r) || 0) + 1)));
          const typical = new Set([...common.entries()].filter(([, c]) => c >= big[1].length / 2).map(([r]) => r));
          const dev = (u: User) => [...roleSet.get(u.name)!].filter(r => !typical.has(r)).length + [...typical].filter(r => !roleSet.get(u.name)!.has(r)).length;
          const sorted = [...big[1]].sort((x, y) => dev(y) - dev(x));
          a = sorted[0]; b = sorted[sorted.length - 1];
          reason = `no users were named, so in the largest peer group "${big[0]}" (${big[1].length} users) the user deviating most from the group's typical access (${a.name}) is compared with the most typical member (${b.name})`;
        }
      }
      if (!a || !b) return { text: 'No two comparable active users were found.', sections: [], assess: false };
      const ra = roleSet.get(a.name)!; const rb = roleSet.get(b.name)!;
      const all = uniq([...ra, ...rb]).sort();
      const rows = all.map(r => ({ role: r, [a!.name]: ra.has(r) ? 'Yes' : '', [b!.name]: rb.has(r) ? 'Yes' : '', difference: ra.has(r) && rb.has(r) ? 'Both' : ra.has(r) ? `Only ${a!.name}` : `Only ${b!.name}` }));
      return {
        text: `${reason === 'the two named users' ? 'Compared the two named users' : reason[0].toUpperCase() + reason.slice(1)}: ${a.name} has ${ra.size} active roles, ${b.name} has ${rb.size}; ${all.filter(r => ra.has(r) && rb.has(r)).length} are shared, ${[...ra].filter(r => !rb.has(r)).length} only ${a.name}, ${[...rb].filter(r => !ra.has(r)).length} only ${b.name}. Name two users (e.g. "compare user X with user Y") for a specific comparison.`,
        sections: [{ title: `Access Comparison — ${a.name} vs ${b.name}`, columns: cols(['role', 'Role'], [a.name, a.name], [b.name, b.name], ['difference', 'Difference']), rows: rows.sort((x, y) => String(x.difference).localeCompare(String(y.difference))), note: `Peer group by department/user group; active AGR_USERS assignments. SAP_ALL: ${a.name} ${prof.rows.some(p => p.BNAME === a!.name) ? 'yes' : 'no'}, ${b.name} ${prof.rows.some(p => p.BNAME === b!.name) ? 'yes' : 'no'}.` }],
        assess: false
      };
    }
    case 'SOD_ALL': case 'SOD_RULE': case 'SOD_HIGH': case 'MITIGATED': case 'MITIGATION_EXPIRED': case 'SOD_NEW': case 'SOD_ROLE_FIX': {
      let rules = SOD_RULES;
      if (intent === 'SOD_RULE') {
        if (n.includes('purchase order')) rules = SOD_RULES.filter(r => r.id === 'P2P03');
        else if (n.includes('journal')) rules = SOD_RULES.filter(r => r.id === 'R2R01');
        else if (n.includes('procurement')) rules = SOD_RULES.filter(r => ['P2P04', 'P2P05', 'P2P01'].includes(r.id));
        else rules = SOD_RULES.filter(r => ['P2P01', 'P2P05'].includes(r.id));
      }
      const sod = await computeSod(rules);
      let list = sod.conflicts;
      const ruleSummary = rules.map(r => ({ rule: `${r.id} ${r.name}`, risk: r.risk, users: uniq(list.filter(c => c.rule.id === r.id).map(c => c.user.name)).length }));
      const base = { summaryStats: [{ label: 'Conflicts', value: String(list.length) }, { label: 'Users in conflict', value: String(uniq(list.map(c => c.user.name)).length) }, { label: 'Critical/High', value: String(list.filter(c => c.rule.risk !== 'Medium').length) }] };
      const errs = errNote(sod.error);
      if (intent === 'SOD_HIGH') list = list.filter(c => c.rule.risk !== 'Medium');
      if (intent === 'SOD_NEW') {
        const from = weekStart(sod.today);
        list = list.filter(c => [...c.aRoles, ...c.bRoles].some(r => (sod.roleChanged.get(r) || '') >= from || sod.assigns.some(a => a.user === c.user.name && a.role === r && (a.changed >= from || a.from >= from))) || (c.user.created >= from));
      }
      if (intent === 'SOD_ROLE_FIX') {
        const impact = new Map<string, { removes: number; users: Set<string>; rules: Set<string> }>();
        for (const c of list) {
          for (const side of [c.aRoles, c.bRoles]) if (side.length === 1 && side[0] !== 'SAP_ALL') {
            const e = impact.get(side[0]) || { removes: 0, users: new Set<string>(), rules: new Set<string>() };
            e.removes++; e.users.add(c.user.name); e.rules.add(c.rule.id); impact.set(side[0], e);
          }
        }
        const rows = [...impact.entries()].map(([role, e]) => ({ role, conflictsRemoved: e.removes, users: e.users.size, rules: [...e.rules].join(', ') })).sort((a, b) => b.conflictsRemoved - a.conflictsRemoved);
        const sapAllConf = list.filter(c => c.aRoles.includes('SAP_ALL')).length;
        return {
          text: `${list.length} SoD conflicts exist. Changing these roles removes the most risks: ${rows.slice(0, 5).map(r => `${r.role} (−${r.conflictsRemoved} conflicts, ${r.users} users, rules ${r.rules})`).join('; ') || 'none'}.${sapAllConf ? ` ${sapAllConf} conflicts come from SAP_ALL and disappear only by removing that profile.` : ''}`,
          sections: [{ title: 'Role Changes With the Largest SoD Risk Reduction', ...base, columns: cols(['role', 'Role'], ['conflictsRemoved', 'Conflicts Removed'], ['users', 'Users Affected'], ['rules', 'Rules']), rows, note: 'A role counts when it is the only source of one side of a conflict, so removing the conflicting transactions from it (or the assignment) resolves that conflict.' }, { title: 'SoD Rules Evaluated', columns: cols(['rule', 'Rule'], ['risk', 'Risk'], ['users', 'Users in Conflict']), rows: ruleSummary, note: RULE_NOTE }],
          assess: false
        };
      }
      if (intent === 'MITIGATED' || intent === 'MITIGATION_EXPIRED') {
        const ea = await emergencyAccessCheck();
        const mitTables = ea.section.rows[0].result;
        return {
          text: `No mitigating controls are recorded in this system: GRC Access Control (where mitigating controls and their validity are maintained) is not installed (${mitTables}). ${intent === 'MITIGATION_EXPIRED' ? 'There are therefore no mitigation assignments that could have expired; ' : ''}all ${list.length} current SoD conflicts for ${uniq(list.map(c => c.user.name)).length} users are unmitigated.`,
          sections: [{ title: 'Mitigation Repository Check', columns: cols(['check', 'Check'], ['result', 'Result']), rows: [ea.section.rows[0]] }, { title: 'Current SoD Conflicts — Mitigation Status', ...base, columns: CONFLICT_COLS, rows: list.map(conflictRow), note: RULE_NOTE }],
          assess: false
        };
      }
      const title = intent === 'SOD_HIGH' ? 'High-Risk SoD Violations' : intent === 'SOD_NEW' ? `SoD Conflicts Introduced Since ${fmtD(weekStart(sod.today))}` : intent === 'SOD_RULE' ? `SoD Conflicts — ${rules.map(r => r.name).join(' / ')}` : 'Current SoD Conflicts';
      const byRisk = (r: string) => list.filter(c => c.rule.risk === r).length;
      list.sort((a, b) => RISK_RANK[b.rule.risk] - RISK_RANK[a.rule.risk] || a.user.name.localeCompare(b.user.name));
      return {
        text: list.length
          ? `${list.length} SoD conflict(s) for ${uniq(list.map(c => c.user.name)).length} active dialog user(s)${intent === 'SOD_NEW' ? ` introduced since ${fmtD(weekStart(sod.today))} (new role assignment or changed role)` : ''}: ${byRisk('Critical')} critical, ${byRisk('High')} high, ${byRisk('Medium')} medium. ${intent === 'SOD_RULE' ? `Users: ${uniq(list.map(c => c.user.name)).slice(0, 12).join(', ')}.` : `Top: ${list.slice(0, 4).map(c => `${c.user.name} — ${c.rule.name}`).join('; ')}.`} ${list.filter(c => c.aRoles.includes('SAP_ALL')).length} come from the SAP_ALL profile. None have a recorded mitigating control.`
          : `No ${intent === 'SOD_NEW' ? 'new ' : ''}SoD conflicts were found for active dialog users under the evaluated rules${intent === 'SOD_NEW' ? ` since ${fmtD(weekStart(sod.today))}` : ''}. ${errs}`,
        sections: [{ title, ...base, columns: CONFLICT_COLS, rows: list.map(conflictRow), note: RULE_NOTE }, { title: 'SoD Rules Evaluated', columns: cols(['rule', 'Rule'], ['risk', 'Risk'], ['users', 'Users in Conflict']), rows: ruleSummary }],
        assess: false
      };
    }
    case 'FF_USERS': case 'FF_ACTIVITY': case 'FF_USER_ACTIVITY': case 'FF_UNREVIEWED': case 'PRIV_SENSITIVE': case 'FF_SHARED': case 'FF_NO_APPROVAL': case 'PRIV_FIN': case 'FF_INVESTIGATE': {
      const [ea, us, as] = await Promise.all([emergencyAccessCheck(), loadUsers(), loadAssignments()]);
      const priv = await privilegedUsers(today, us.list, as.list);
      const pnames = priv.list.map(p => p.user.name);
      const ffNote = ea.installed ? '' : 'Firefighter (GRC emergency access management) is not installed in this system — there are no firefighter IDs, sessions, reason codes or reviews. ';
      const privRows = priv.list.map(p => ({ ...userRow(p.user), reasons: p.reasons.slice(0, 4).join('; ') }));
      const PRIV_COLS = [...USER_COLS, { key: 'reasons', label: 'Privilege Source' }];
      if (intent === 'FF_USERS' || intent === 'FF_SHARED') {
        const active = priv.list.filter(p => isActive(p.user, today));
        return {
          text: `${ffNote}${ea.ffIds.length ? `Firefighter-style IDs found: ${ea.ffIds.join(', ')}. ` : ''}The emergency-capable (privileged) accounts are ${priv.list.length} users holding SAP_ALL/SAP_NEW or critical authorizations, ${active.length} of them unlocked: ${active.slice(0, 10).map(p => p.user.name).join(', ')}.${intent === 'FF_SHARED' ? ' Because no firefighter-ID-to-owner assignments exist, sharing cannot be measured; any shared use of these accounts would be invisible.' : ''}`,
          sections: [ea.section, { title: 'Privileged / Emergency-Capable Accounts', summaryStats: [{ label: 'Privileged accounts', value: String(priv.list.length) }, { label: 'Unlocked', value: String(active.length) }], columns: PRIV_COLS, rows: privRows, note: 'SAP_ALL/SAP_NEW (UST04) or roles with critical authorizations (AGR_1251) assigned via AGR_USERS.' }],
          assess: false
        };
      }
      let from = addDays(today, -7); let label = 'last 7 days';
      if (n.includes('today')) { from = today; label = 'today'; } else if (n.includes('24 hours')) { from = addDays(today, -1); label = 'last 24 hours'; }
      const target = intent === 'FF_USER_ACTIVITY' ? [realName] : pnames;
      if (intent === 'FF_USER_ACTIVITY' && !us.list.some(u => u.name === realName)) {
        return { text: `${ffNote}User ${realName} does not exist in the connected system, so there is no activity to show. Name an existing user ID to see its change activity.`, sections: [ea.section, { title: `User Lookup — ${realName}`, columns: cols(['check', 'Check'], ['result', 'Result']), rows: [{ check: `USR02 entry for ${realName}`, result: 'Not found' }] }], assess: false };
      }
      const cd = target.length ? await changeDocs(`UDATE >= '${intent === 'FF_USER_ACTIVITY' ? addDays(today, -30) : from}' AND USERNAME IN ( ${inList(target.slice(0, 200))} )`) : { rows: [] } as any;
      let docs: Record<string, string>[] = cd.rows;
      if (intent === 'PRIV_FIN') docs = docs.filter(isFinPayroll);
      const logonsToday = priv.list.filter(p => p.user.lastLogon >= from);
      const byUser = new Map<string, number>(); docs.forEach(d => byUser.set(d.USERNAME, (byUser.get(d.USERNAME) || 0) + 1));
      const byTc = new Map<string, number>(); docs.forEach(d => byTc.set(`${d.TCODE || '(no tcode)'} / ${d.OBJECTCLAS}`, (byTc.get(`${d.TCODE || '(no tcode)'} / ${d.OBJECTCLAS}`) || 0) + 1));
      const investigate = docs.filter(d => ['SAP*', 'DDIC', 'SAP_SYSTEM'].includes(d.USERNAME) || isFinPayroll(d));
      const sections: SecuritySection[] = [ea.section];
      if (intent === 'FF_INVESTIGATE') sections.push({ title: 'Privileged Activity Requiring Investigation', columns: CD_COLS, rows: investigate.map(cdRow), note: 'Changes by default/system accounts (SAP*, DDIC, SAP_SYSTEM) or to finance/payroll objects by privileged users.' });
      sections.push({ title: intent === 'FF_USER_ACTIVITY' ? `Change Activity of ${realName} (Last 30 Days)` : `Privileged-User Change Activity — ${label}`, summaryStats: [{ label: 'Changes', value: String(docs.length) }, { label: 'Users', value: String(byUser.size) }], columns: CD_COLS, rows: docs.slice(0, 300).map(cdRow), note: 'Change documents (CDHDR) created by privileged users — the database record of what they changed. Display-only activity is not logged in the database.' });
      if (intent !== 'FF_USER_ACTIVITY') sections.push({ title: 'Activity by Transaction / Object', columns: cols(['tcode', 'Transaction / Object Class'], ['count', 'Changes']), rows: [...byTc.entries()].sort((a, b) => b[1] - a[1]).map(([tcode, count]) => ({ tcode, count })) });
      if (intent === 'FF_ACTIVITY' || intent === 'FF_UNREVIEWED' || intent === 'FF_NO_APPROVAL') sections.push({ title: `Privileged Accounts Logged On — ${label}`, columns: PRIV_COLS, rows: logonsToday.map(p => ({ ...userRow(p.user), reasons: p.reasons.slice(0, 4).join('; ') })) });
      const extra = intent === 'FF_UNREVIEWED' ? 'No session review workflow exists, so every privileged action below is unreviewed. ' : intent === 'FF_NO_APPROVAL' ? 'No emergency-access request/approval records exist, so none of the privileged activity below was approved through a firefighter process. ' : '';
      return {
        text: `${ffNote}${extra}${intent === 'FF_USER_ACTIVITY' ? `User ${realName} created ${docs.length} change document(s) in the last 30 days.` : `Closest live evidence — privileged users (SAP_ALL/critical authorizations): ${docs.length} change document(s) by ${byUser.size} privileged user(s) ${label}${intent === 'PRIV_FIN' ? ' affecting finance or payroll objects' : ''}${byUser.size ? ` (${[...byUser.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([u, c]) => `${u}: ${c}`).join(', ')})` : ''}; ${logonsToday.length} privileged account(s) logged on ${label}.${intent === 'FF_INVESTIGATE' ? ` ${investigate.length} actions need investigation (default/system accounts or finance/payroll changes).` : ''}`}`,
        sections, assess: false
      };
    }
    case 'AUTH_FAILURES': {
      const [ea, us, sal] = await Promise.all([emergencyAccessCheck(), loadUsers(), q('SELECT PROFNAME, SLOTNO, CLASSES, SEVERITY, CLIENT, UNAME, CUNAME, CDATE FROM RSAUPROF', 100)]);
      const failed = us.list.filter(u => u.failed > 0).sort((a, b) => b.failed - a.failed);
      const isSu53 = n.includes('su53');
      return {
        text: `Authorization-check failures are not recorded in this system's database: the Security Audit Log has ${ea.salRows} stored entries, and ${isSu53 ? 'SU53 shows only the last failed check per user in memory (it is not stored)' : 'SU53 data is held in memory only'}, so there is no history of authorization failures to report. Related live evidence: ${failed.length} user(s) currently have failed logon attempts (authentication, not authorization) — ${failed.slice(0, 5).map(u => `${u.name}: ${u.failed}`).join(', ') || 'none'}. Activate Security Audit Log event classes for failed authorization checks (AU-events) with database storage to capture this.`,
        sections: [
          { title: 'Authorization-Failure Data Sources (checked live)', columns: cols(['check', 'Check'], ['result', 'Result']), rows: [ea.section.rows[2], { check: 'Security Audit Log filter slots configured (RSAUPROF)', result: String(sal.rows.length) }, { check: 'SU53 last-failed-check buffer', result: 'Held in user memory only, not in the database' }] },
          { title: 'Users With Failed Logon Attempts (USR02)', columns: cols(['user', 'User'], ['failed', 'Failed Logons'], ['lock', 'Lock Status'], ['lastLogon', 'Last Logon']), rows: failed.map(u => ({ user: u.name, failed: u.failed, lock: u.lock, lastLogon: fmtD(u.lastLogon) || 'Never' })) }
        ],
        assess: false
      };
    }
    case 'SENSITIVE_FIN': {
      const [bk, cd, ral] = await Promise.all([
        q(`SELECT USNAM, TCODE, BLART, COUNT( * ) AS N FROM BKPF WHERE CPUDT = '${today}' GROUP BY USNAM, TCODE, BLART`, 2000),
        changeDocs(`UDATE = '${today}' AND OBJECTCLAS IN ( ${inList(FIN_CLASSES)} )`),
        q('SELECT COUNT( * ) AS N FROM SRAL_CONFIG', 1)
      ]);
      const users = uniq([...bk.rows.map(x => x.USNAM), ...cd.rows.map(x => x.USERNAME)]);
      return {
        text: `${users.length} user(s) worked with financial data today: ${bk.rows.reduce((a, x) => a + num(x.N), 0)} accounting documents were posted by ${uniq(bk.rows.map(x => x.USNAM)).length} user(s) and ${cd.rows.length} changes were made to financial master data/documents by ${uniq(cd.rows.map(x => x.USERNAME)).length} user(s) (${users.slice(0, 10).join(', ')}). Pure display access is only captured by Read Access Logging: ${num(ral.rows[0]?.N)} RAL configurations exist but no read-access log records are stored, so read-only viewing cannot be listed.`,
        sections: [
          { title: "Financial Postings Today (BKPF)", columns: cols(['USNAM', 'User'], ['TCODE', 'Transaction'], ['BLART', 'Doc Type'], ['N', 'Documents']), rows: bk.rows.map(x => ({ ...x, N: num(x.N) })), note: `Accounting documents entered on ${fmtD(today)}.` },
          { title: 'Changes to Financial Data Today (CDHDR)', columns: CD_COLS, rows: cd.rows.map(cdRow), note: `Object classes: ${FIN_CLASSES.join(', ')}.` }
        ],
        assess: false
      };
    }
    case 'ACCOUNTS_REVIEW': case 'CONTROLS': case 'TOP_RISKS': case 'REMEDIATE': {
      const [us, as, sod, ea, ral] = await Promise.all([loadUsers(), loadAssignments(), computeSod(), emergencyAccessCheck(), q('SELECT COUNT( * ) AS N FROM SRAL_RECORD', 1)]);
      const priv = await privilegedUsers(today, us.list, as.list);
      const act = us.list.filter(u => isActive(u, today));
      const sapAllDialog = priv.list.filter(p => p.reasons.some(r => r.startsWith('SAP_ALL')) && isActive(p.user, today) && p.user.type === 'A');
      const defaults = ['SAP*', 'DDIC', 'TMSADM', 'EARLYWATCH', 'SAPCPIC'].map(x => us.list.find(u => u.name === x)).filter(Boolean) as User[];
      const defaultsOpen = defaults.filter(u => u.uflag === 0 && u.type === 'A');
      const dormant = act.filter(u => u.type === 'A' && (!u.lastLogon || u.lastLogon === '00000000' || u.lastLogon < addDays(today, -90)));
      const dormantPriv = priv.list.filter(p => dormant.includes(p.user));
      const initialPwd = act.filter(u => u.pwdState === '1');
      const expiredWithRoles = us.list.filter(u => u.validTo && u.validTo !== '00000000' && u.validTo < today && as.list.some(a => a.user === u.name && assignActive(a, today)));
      const failedLogons = us.list.filter(u => u.failed > 0);
      const sodUsers = uniq(sod.conflicts.map(c => c.user.name));
      const criticalSod = sod.conflicts.filter(c => c.rule.risk === 'Critical');
      const controls = [
        { control: 'SAP_ALL not assigned to active dialog users', severity: 'Critical', failing: sapAllDialog.length, evidence: sapAllDialog.map(p => p.user.name).join(', '), action: 'Remove SAP_ALL; use role-based or emergency access' },
        { control: 'Default users (SAP*, DDIC, TMSADM, EARLYWATCH) locked or non-dialog', severity: 'Critical', failing: defaultsOpen.length, evidence: defaultsOpen.map(u => u.name).join(', '), action: 'Lock default users or change them to system type' },
        { control: 'No critical SoD conflicts', severity: 'Critical', failing: criticalSod.length, evidence: `${uniq(criticalSod.map(c => c.user.name)).length} users: ${uniq(criticalSod.map(c => c.user.name)).slice(0, 8).join(', ')}`, action: 'Remove conflicting access or define mitigating controls' },
        { control: 'No SoD conflicts (all rules)', severity: 'High', failing: sod.conflicts.length, evidence: `${sodUsers.length} users`, action: 'Redesign roles with the largest conflict counts' },
        { control: 'Privileged accounts actively used (no dormant privileged accounts)', severity: 'High', failing: dormantPriv.length, evidence: dormantPriv.map(p => p.user.name).slice(0, 10).join(', '), action: 'Lock dormant privileged accounts' },
        { control: 'Dormant dialog users (90 days) locked', severity: 'Medium', failing: dormant.length, evidence: `${dormant.length} active dialog users without logon for 90+ days`, action: 'Lock or delete dormant users' },
        { control: 'Accounts past their end date have no active roles', severity: 'High', failing: expiredWithRoles.length, evidence: expiredWithRoles.map(u => u.name).slice(0, 10).join(', '), action: 'Remove role assignments of expired accounts' },
        { control: 'No active users with initial passwords', severity: 'Medium', failing: initialPwd.length, evidence: initialPwd.map(u => u.name).join(', '), action: 'Force password change or lock' },
        { control: 'Security Audit Log records stored and reviewable', severity: 'High', failing: ea.salRows === 0 ? 1 : 0, evidence: `${ea.salRows} stored audit log records`, action: 'Activate Security Audit Log with database storage' },
        { control: 'Read Access Logging records sensitive reads', severity: 'Medium', failing: num(ral.rows[0]?.N) === 0 ? 1 : 0, evidence: `${num(ral.rows[0]?.N)} read-access log records`, action: 'Activate RAL configurations for sensitive data' },
        { control: 'Emergency access (firefighter) controlled', severity: 'High', failing: ea.installed ? 0 : 1, evidence: ea.installed ? 'GRC tables present' : 'No emergency-access management installed', action: 'Introduce firefighter / emergency access management' },
        { control: 'No users with failed logon attempts pending', severity: 'Low', failing: failedLogons.length, evidence: failedLogons.map(u => `${u.name} (${u.failed})`).slice(0, 8).join(', '), action: 'Review failed logons for brute-force attempts' }
      ].map(c => ({ ...c, status: c.failing ? 'FAILING' : 'Passing' }));
      const sevW: Record<string, number> = { Critical: 100, High: 30, Medium: 10, Low: 3 };
      const ranked = controls.filter(c => c.failing).sort((a, b) => sevW[b.severity] - sevW[a.severity] || b.failing - a.failing);
      if (intent === 'ACCOUNTS_REVIEW') {
        const flags = new Map<string, string[]>(); const add = (u: string, f: string) => flags.set(u, [...(flags.get(u) || []), f]);
        sapAllDialog.forEach(p => add(p.user.name, 'SAP_ALL on active dialog user'));
        defaultsOpen.forEach(u => add(u.name, 'Default user unlocked'));
        uniq(criticalSod.map(c => c.user.name)).forEach(u => add(u, 'Critical SoD conflict'));
        dormantPriv.forEach(p => add(p.user.name, 'Dormant privileged account'));
        expiredWithRoles.forEach(u => add(u.name, 'Expired account with active roles'));
        initialPwd.forEach(u => add(u.name, 'Initial password not changed'));
        us.list.filter(u => u.failed >= 3).forEach(u => add(u.name, `${u.failed} failed logons`));
        const rows = [...flags.entries()].map(([u, f]) => { const x = us.list.find(z => z.name === u); return { user: u, name: x?.fullName || '', type: x?.typeText || '', lock: x?.lock || '', lastLogon: fmtD(x?.lastLogon || '') || 'Never', reasons: f.join('; '), findings: f.length }; }).sort((a, b) => b.findings - a.findings);
        return {
          text: `${rows.length} user accounts need immediate review: ${rows.slice(0, 8).map(r => `${r.user} (${r.reasons})`).join('; ')}.`,
          sections: [{ title: 'User Accounts Needing Immediate Review', columns: cols(['user', 'User'], ['name', 'Name'], ['type', 'User Type'], ['lock', 'Lock Status'], ['lastLogon', 'Last Logon'], ['findings', 'Findings'], ['reasons', 'Why']), rows, note: 'Findings computed live from USR02, UST04, AGR_USERS/AGR_1251 (SoD) and user validity.' }],
          assess: false
        };
      }
      const failing = controls.filter(c => c.failing);
      return {
        text: intent === 'CONTROLS'
          ? `${failing.length} of ${controls.length} security controls are currently failing: ${failing.map(c => `${c.control} (${c.failing})`).join('; ')}.`
          : `${intent === 'REMEDIATE' ? 'Remediation priority (by severity, then number of findings)' : 'Highest SAP security risks today'}: ${ranked.slice(0, 5).map((c, i) => `${i + 1}. ${c.control} — ${c.failing} finding(s)${c.evidence ? ` (${c.evidence.slice(0, 80)})` : ''}`).join(' ')}`,
        sections: [{ title: intent === 'CONTROLS' ? 'Security Controls — Live Status' : 'SAP Security Risks — Prioritised', summaryStats: [{ label: 'Controls checked', value: String(controls.length) }, { label: 'Failing', value: String(failing.length) }, { label: 'Critical failing', value: String(failing.filter(c => c.severity === 'Critical').length) }], columns: cols(['control', 'Control'], ['severity', 'Severity'], ['status', 'Status'], ['failing', 'Findings'], ['evidence', 'Evidence'], ['action', 'Remediation']), rows: intent === 'CONTROLS' ? controls : ranked, note: 'Every control is evaluated live: USR02/UST04/AGR_USERS/AGR_1251 (users, SAP_ALL, SoD), RSAU_BUF_DATA (Security Audit Log), SRAL_RECORD (Read Access Logging), DD02L (GRC components).' }],
        assess: intent === 'REMEDIATE' || intent === 'TOP_RISKS',
        persona: 'You are an SAP security lead. Give a prioritised remediation plan (numbered, 4-6 items) based only on the failing controls and evidence, naming the concrete users/roles and the action for each.'
      };
    }
  }
}
