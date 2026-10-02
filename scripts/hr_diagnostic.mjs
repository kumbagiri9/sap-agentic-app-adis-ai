// HR diagnostic — live tests the new S/4HANA HR (Workforce/HCM) module across the 9 requested
// OData-service functions: Workforce Person, Workforce Organizational Assignment, Business
// Partner, Workforce Daily Availability, Workforce Availability Integration, Bank Details,
// Company Code, Workforce Person SkillTag, and Basic Master Data for Workforce.
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
  // Workforce Person
  'Show employee lookup for employee number 1.',
  'Show workforce person profile for employee 5.',
  'List the workforce person roster.',
  // Workforce Organizational Assignment
  'Show workforce organizational assignment records.',
  'Show organizational assignment for employee 1.',
  'Show active workforce organizational assignments.',
  // Business Partner
  'Show business partner records for employee/workforce integration.',
  'Show business partner 17100001 for HR integration.',
  // Company Code
  'Show company code master data.',
  'Show details for company code 0001.',
  // Workforce Daily Availability
  'Show workforce daily availability.',
  'Show workforce availability integration data.',
  // SkillTag
  'Show workforce person skill tags.',
  'Show skill tags for workforce.',
  // Bank Details (honest disclosure expected)
  'Show employee bank details.',
  // Basic Master Data for Workforce (honest disclosure expected)
  'Show basic master data for workforce replication.',
];

async function ask(query) {
  try {
    const r = await callChat(query);
    return { toolCount: r.toolCount, text: (r.text || '').slice(0, 260).replace(/\n/g, ' ') };
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
console.log(`\n=== HR DIAGNOSTIC RESULTS: ${pass} PASS / ${fail} FAIL / ${questions.length} total ===`);
