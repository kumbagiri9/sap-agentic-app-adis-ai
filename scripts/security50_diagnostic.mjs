// Security50 diagnostic — live tests the full "50 Natural-Language Questions for an SAP Security
// AI Agent" list (Users & Access / Roles & Authorizations / Segregation of Duties / Privileged &
// Firefighter Access / Audit-Compliance & Risk, 10 each) against the new S/4HANA Security module.
const APP_URL = 'http://localhost:3000/api/gemini/query';
async function callChat(question) {
  const res = await fetch(APP_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: question, userRole: 'Functional Consultant', history: [], backendTarget: 'BOTH' }) });
  const raw = await res.text();
  const lines = raw.split('\n').map(s => s.trim()).filter(Boolean);
  for (const line of lines.reverse()) {
    try { const parsed = JSON.parse(line); if (parsed?.type === 'result') return { text: parsed.text || '', toolCount: (parsed.toolResults || []).length, toolNames: (parsed.toolResults || []).map(t => t.toolName || t.type) }; } catch {}
  }
  return { text: '', toolCount: 0, toolNames: [] };
}

const questions = [
  // Users & Access
  'Show all active users in PRD.',
  'Which users are locked?',
  'Which users have not logged in for 90 days?',
  'Show users created this week.',
  'Which users have expired passwords?',
  'Which users have access after their termination date?',
  'Show users with multiple dialog accounts.',
  'Which service or technical users are interactive?',
  'Show users by company code, plant, or business unit.',
  'Which user accounts need immediate review?',
  // Roles & Authorizations
  'What roles does User ABC have?',
  'Why does this user have access to transaction VA02?',
  'Which roles provide access to FB60?',
  'Show users with SAP_ALL.',
  'Show users with SAP_NEW.',
  'Which roles contain critical authorization objects?',
  'Show composite roles assigned to this user.',
  'Which roles were changed recently?',
  'Which users received new production access this week?',
  "Compare this user's access with another user in the same job role.",
  // Segregation of Duties (SoD)
  'Show all current SoD conflicts.',
  'Which users can both create and pay vendors?',
  'Who can create purchase orders and approve them?',
  'Which users can create and post journal entries?',
  'Show users with conflicting procurement and payment access.',
  'Which SoD violations are high risk?',
  'Which conflicts have mitigating controls?',
  'Which mitigating controls have expired?',
  'Show new SoD conflicts introduced this week.',
  'Which role changes would remove the largest number of SoD risks?',
  // Privileged & Firefighter Access
  'Show all firefighter users.',
  'Who used firefighter access today?',
  'What did User ABC do during firefighter access?',
  'Show unreviewed firefighter sessions.',
  'Which privileged users performed sensitive transactions?',
  'Show emergency-access activity from the last 24 hours.',
  'Which firefighter IDs are assigned to too many users?',
  'Which emergency-access sessions lacked approval?',
  'Show privileged actions affecting finance or payroll.',
  'Which emergency-access activities require investigation?',
  // Audit, Compliance & Risk
  'Show failed login attempts.',
  'Which users are generating repeated authorization failures?',
  'Show critical SU53 failures.',
  'Which users accessed sensitive financial data today?',
  'Show role changes made directly in production.',
  'Which users have excessive access compared with their peers?',
  'Show dormant privileged accounts.',
  'Which security controls are currently failing?',
  'What are our highest SAP security risks today?',
  'What should the security team remediate first?',
];

// Markers that indicate the NEW Security module actually handled the question (real data or a
// precise honest disclosure) rather than falling through to an old pre-existing broken/mock tool.
// NOTE: disclosure wording was rewritten to plain/layman language (no technical service names,
// HTTP codes, or transaction codes) — markers below match that plain phrasing plus real-data markers.
const NEW_MODULE_MARKERS = [
  'APS_IAM_API', 'not published', 'BC_SAIS', 'APS_CHANGE_DOCUMENTS_SRV', 'Security Audit Information System',
  'Firefighter', 'firefighter', 'Emergency-Access', 'emergency access', 'Segregation of Duties', 'SoD',
  'not deployed', 'not connected', 'classic ABAP-only', 'no released', 'no live', 'Read Access Logging',
  'Communication Management', 'Certificate/Trust', 'API_BUSINESS_PARTNER', 'STAUTHTRACE', 'GRC',
  'will not make anything up', 'will not make up any of this', 'nothing genuine to show', 'cannot reach',
  'cannot pull live data', 'cannot pull real', 'no real data source', 'is not connected here',
  'do not have any real', 'do not have real data', 'has not been switched on', 'I am not able to pull real'
];

async function ask(query) {
  try {
    const r = await callChat(query);
    return { toolCount: r.toolCount, toolNames: r.toolNames, text: (r.text || '').slice(0, 260).replace(/\n/g, ' ') };
  } catch (e) {
    return { toolCount: 0, toolNames: [], text: String(e).slice(0, 200) };
  }
}

let pass = 0, fail = 0;
const failures = [];
for (let i = 0; i < questions.length; i++) {
  const q = questions[i];
  const r = await ask(q);
  const isUnavailableError = /LIVE_SAP_UNAVAILABLE|fetch failed|ENOTFOUND|no text/i.test(r.text);
  const hasMarker = NEW_MODULE_MARKERS.some(m => r.text.includes(m)) || r.toolNames.some(n => /Security|Hr|basisLiveData/i.test(n || ''));
  const status = !isUnavailableError && hasMarker ? 'PASS' : 'FAIL';
  if (status === 'PASS') pass++; else { fail++; failures.push(q); }
  console.log(`[${i + 1}/${questions.length}] ${status} (tools=${r.toolCount}${r.toolNames.length ? ':' + r.toolNames.join(',') : ''}) :: ${q}`);
  console.log(`    -> ${r.text}`);
}
console.log(`\n=== SECURITY50 RESULTS: ${pass} PASS / ${fail} FAIL / ${questions.length} total ===`);
if (failures.length) {
  console.log('\nFAILED QUESTIONS:');
  failures.forEach(f => console.log('  - ' + f));
}
