// QM diagnostic — live tests the core SAP QM (Quality Management) capabilities.
const APP_URL = 'http://localhost:3000/api/gemini/query';
async function callChat(question) {
  const res = await fetch(APP_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: question, userRole: 'Functional Consultant', history: [], backendTarget: 'BOTH' }) });
  const raw = await res.text();
  const lines = raw.split('\n').map(s => s.trim()).filter(Boolean);
  for (const line of lines.reverse()) {
    try { const parsed = JSON.parse(line); if (parsed?.type === 'result') return { text: parsed.text || '', toolCount: (parsed.toolResults || []).length }; } catch {}
  }
  return { text: '', toolCount: 0 };
}

const questions = [
  'Show inspection lots.',
  'Show inspection lots pending usage decision.',
  'Show usage decisions.',
  'Show overdue usage decisions.',
  'Show quality notifications.',
  'Show open quality notifications.',
  'Show quality info records.',
  'Show blocked quality info records.',
  'Show master inspection characteristics.',
  'Show quantitative inspection characteristics.',
  'Show inspection plans.',
  'Show defects.',
  'Show critical defects.',
  'Show quality tasks.',
  'Show open quality tasks.',
  'Show quality control charts.',
  'Show control charts with deviations.',
  'Show quality certificates in procurement.',
  'Show supplier quality performance.',
];

async function ask(query) {
  try {
    const r = await callChat(query);
    return { toolCount: r.toolCount, text: (r.text || '').slice(0, 220).replace(/\n/g, ' ') };
  } catch (e) {
    return { toolCount: 0, text: String(e).slice(0, 200) };
  }
}

let pass = 0, fail = 0;
for (let i = 0; i < questions.length; i++) {
  const q = questions[i];
  const r = await ask(q);
  const isUnavailableError = /LIVE_SAP_UNAVAILABLE|fetch failed|ENOTFOUND|no text/i.test(r.text);
  const status = !isUnavailableError && (r.toolCount > 0 || (r.text && r.text.length > 30)) ? 'PASS' : 'FAIL';
  if (status === 'PASS') pass++; else fail++;
  console.log(`[${i + 1}/${questions.length}] ${status} (tools=${r.toolCount}) :: ${q}`);
  console.log(`    -> ${r.text}`);
}
console.log(`\n=== QM DIAGNOSTIC RESULTS: ${pass} PASS / ${fail} FAIL / ${questions.length} total ===`);
