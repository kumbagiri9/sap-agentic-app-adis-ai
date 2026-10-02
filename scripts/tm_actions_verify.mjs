// Verifies the new TM Autonomous Actions + Late Shipment Diagnosis + Control Tower features.
const BASE = 'http://localhost:3000/api/gemini/query';

const questions = [
  "Create a freight order for this shipment.",
  "Trigger tendering for this load.",
  "Calculate freight charges for this shipment.",
  "Schedule pickup appointment at docking location DOCK01.",
  "What is happening across my transportation network right now?",
  "Why is order 5715 late?",
  "Show freight charges by type."
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
