// Verifies the new BW Data Reconciliation + Executive Supply-Chain Report + stale-dashboard features.
const BASE = 'http://localhost:3000/api/gemini/query';

const questions = [
  "Are BW numbers aligned with S/4?",
  "Give me a weekly executive supply-chain report.",
  "Why is today's finance dashboard showing yesterday's numbers?",
  "Why did revenue decline this week?",
  "List available BW queries for sales."
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
