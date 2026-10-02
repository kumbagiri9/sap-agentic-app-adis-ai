// Verifies the new MM Autonomous Actions + flagship diagnostics.
const BASE = 'http://localhost:3000/api/gemini/query';

const questions = [
  "Create a material master for material MAT-9001, description \"Industrial Bracket Assembly\".",
  "Create purchase order for 10000 units of material MZ-TG-Y200, plant 1710, supplier BP-100450.",
  "Update source list for material MZ-TG-Y200 in plant 1710, supplier BP-100450.",
  "Maintain purchasing info record for material MZ-TG-Y200, supplier BP-100450.",
  "Generate an inventory report for plant 1710.",
  "Why did production stop for Material MZ-TG-Y200?",
  "Reprocess failed procurement interfaces."
];

for (const query of questions) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, userRole: 'Functional Consultant', history: [], backendTarget: 'BOTH' })
  });
  const raw = await res.text();
  const lines = raw.split('\n').filter(l => l.trim());
  let last = null;
  for (const line of lines) {
    try { const parsed = JSON.parse(line); if (parsed.type === 'result') last = parsed; } catch {}
  }
  console.log('=== QUERY:', query);
  if (last) {
    console.log('TYPE:', last.toolResults?.[0]?.type);
    console.log('TEXT:', (last.text || '').slice(0, 700));
  } else {
    console.log('NO RESULT LINE FOUND. Raw tail:', raw.slice(-500));
  }
  console.log('---');
}
