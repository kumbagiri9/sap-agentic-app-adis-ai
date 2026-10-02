// Verifies the new EWM Autonomous Actions + Exception Management + Predictive capacity features.
const BASE = 'http://localhost:3000/api/gemini/query';

const questions = [
  "Will we finish today's outbound orders before carrier cutoff?",
  "Recommend a replenishment task for product TG0002.",
  "Escalate delayed inbound shipments.",
  "Create a warehouse task for product TG0002 in warehouse 1710.",
  "Release wave for outbound deliveries.",
  "Trigger a cycle count for warehouse 1710.",
  "Reconcile stock differences in warehouse 1710."
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
