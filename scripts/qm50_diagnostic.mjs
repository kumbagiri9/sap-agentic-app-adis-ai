// QM50 diagnostic — live tests the 50 literal QM50 natural-language questions.
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
  // Quality Inspections (10)
  'Show all inspection lots created today.',
  'Which inspection lots are pending?',
  'Which inspection lots are overdue?',
  'Show lots waiting for quality decisions.',
  'Which inspection lots failed today?',
  'Show inspection results by plant.',
  'Which materials have the highest rejection rate?',
  'Show inspections waiting for sample collection.',
  'Which inspection characteristics are failing most often?',
  'Which inspection lots require immediate attention?',
  // Defects & Non-Conformance (10)
  'Show all open quality notifications.',
  'Which quality notifications are overdue?',
  'Show recurring defects.',
  'Which products have the highest defect rate?',
  'Show supplier-related defects.',
  'Which customer complaints remain unresolved?',
  'Show production defects by work center.',
  'Which defects are affecting shipments?',
  'Show critical non-conformance reports.',
  'Explain why Product X failed inspection.',
  // Quality Notifications & Corrective Actions (10)
  'Show all CAPA (Corrective and Preventive Actions).',
  'Which CAPAs are overdue?',
  'Which corrective actions are incomplete?',
  'Show root causes for this defect.',
  'Which defects occurred again after corrective action?',
  'Which quality notifications require escalation?',
  'Show quality notification history by supplier.',
  'Which quality actions have the highest business impact?',
  'Recommend corrective actions for this issue.',
  'Which quality problems should management address first?',
  // Supplier Quality (10)
  'Show supplier quality ratings.',
  'Which suppliers have the highest defect rates?',
  'Which suppliers consistently fail inspections?',
  'Compare supplier quality performance.',
  'Which suppliers require audits?',
  'Show incoming inspection failures by supplier.',
  'Recommend the best supplier based on quality.',
  'Which suppliers are improving?',
  'Which supplier is causing production delays?',
  'Predict supplier quality risks.',
  // Compliance & Quality Analytics (10)
  'Show First Pass Yield (FPY).',
  'Show Scrap Rate by plant.',
  'Show Rework Rate by production line.',
  'Which products have the highest Cost of Poor Quality?',
  'Show customer complaint trends.',
  'Which quality KPIs are outside target?',
  'Predict future quality issues.',
  'Which products are likely to fail inspection?',
  'Show quality audit findings.',
  "What are today's highest quality risks?",
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
  console.log(`[${i + 1}/50] ${status} (tools=${r.toolCount}) :: ${q}`);
  console.log(`    -> ${r.text}`);
}
console.log(`\n=== QM50 RESULTS: ${pass} PASS / ${fail} FAIL / 50 total ===`);
