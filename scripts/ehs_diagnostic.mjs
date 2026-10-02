// EHS diagnostic — live tests the new S/4HANA EHS (Environment, Health & Safety) module across
// Incident Management, Risk Assessment, Chemical/Product Compliance (GHS), Approved Chemicals,
// Listed Substances, Compliance Requirement Results, Waste Management, Permits, plus honest
// disclosures for OSHA/Dangerous Goods/Product Compliance Logistics Document.
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
  // Incident Management
  'Show all EHS incidents.',
  'Show open incidents.',
  'Show near-miss safety observations.',
  // Risk Assessment
  'Show workplace risk assessments.',
  'Show EHS risk levels.',
  // Chemical / Product Compliance (GHS)
  'Show chemical product compliance materials.',
  'Show GHS classification for materials.',
  // Approved Chemicals
  'Show the approved chemicals list.',
  'Show chemical inventory for workplace safety.',
  // Listed Substances
  'Show listed regulatory substances.',
  'Show substance details for CAS number 50-00-0.',
  // Compliance Requirement Results
  'Show compliance requirement results.',
  'Check product marketability.',
  'Show supplier compliance check.',
  // Waste Management
  'Show waste streams.',
  'Show waste transportation documents.',
  // Permits
  'Show my permits.',
  'Show safety instructions.',
  // Honest-disclosure-only categories
  'Show OSHA 301 injury and illness report.',
  'Show dangerous goods classification.',
  'Check transport permission for dangerous goods.',
  'Can we ship Sales Order 50001234 to Germany?',
  'Show safety data sheet document for a material.',
  'Show GHS label for a material.',
];

const NEW_MODULE_MARKERS = [
  'EHHSS_MANAGE_INCIDENT', 'C_EHSRISKASSESSMENT', 'EHS_SDS_GHS_CLFN', 'EHS_APPROVEDCHEMICALSLIST',
  'EHS_FND_SUBSTANCE', 'EHS_PMA_CRR_MAN', 'UI_WASTESTREAM', 'C_EHSMYPERMITSTP', 'EHHSS_FDP_OSHA_301',
  'Dangerous Goods', 'ProdCmplncLogisticsDocument', 'API_SAFETYDATASHEETASSESSMENT', 'GHS Labeling',
  'not deployed', 'not implemented', 'reachable', 'real'
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
  const hasMarker = NEW_MODULE_MARKERS.some(m => r.text.includes(m)) || r.toolNames.some(n => /Ehs/i.test(n || ''));
  const status = !isUnavailableError && hasMarker ? 'PASS' : 'FAIL';
  if (status === 'PASS') pass++; else { fail++; failures.push(q); }
  console.log(`[${i + 1}/${questions.length}] ${status} (tools=${r.toolCount}${r.toolNames.length ? ':' + r.toolNames.join(',') : ''}) :: ${q}`);
  console.log(`    -> ${r.text}`);
}
console.log(`\n=== EHS DIAGNOSTIC RESULTS: ${pass} PASS / ${fail} FAIL / ${questions.length} total ===`);
if (failures.length) {
  console.log('\nFAILED QUESTIONS:');
  failures.forEach(f => console.log('  - ' + f));
}
