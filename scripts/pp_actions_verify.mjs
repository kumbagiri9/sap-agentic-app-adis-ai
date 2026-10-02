// Verifies the new PP Autonomous Actions + human-approval framework.
const BASE = 'http://localhost:3000/api/gemini/query';

const questions = [
  "Create a production order for material MZ-TG-Y200, quantity 100, plant 1710.",
  "Release production order 60000123.",
  "Run MRP for plant 1710.",
  "Create purchase requisition for material MZ-TG-Y200, quantity 100, plant 1710.",
  "Generate a production KPI dashboard for plant 1710.",
  "Identify the bottleneck in production.",
  "Alert planners before stockout for material MZ-TG-Y200."
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
    console.log('TEXT:', (last.text || '').slice(0, 600));
  } else {
    console.log('NO RESULT LINE FOUND. Raw tail:', raw.slice(-500));
  }
  console.log('---');
}
