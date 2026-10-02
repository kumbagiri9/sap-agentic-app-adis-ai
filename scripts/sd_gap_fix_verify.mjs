// Verifies the 3 SD gap fixes made this phase: (1) order-creation classifier no longer blocked
// by "requested delivery" phrasing + rich live verification chain, (2) multi-agent shipment
// blocker diagnosis, (3) ATP multi-plant resolution with an explicit material.
const BASE = 'http://localhost:3000/api/gemini/query';

const questions = [
  "Create an order for Customer 1 for 5 units of Product TG0002, requested delivery in 30 days.",
  "Why can't we ship order 628 today?",
  "Customer needs 1000 EA of Material TG0002, resolve ATP across plants."
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
    console.log('TEXT:', (last.text || '').slice(0, 500));
    console.log('DATA KEYS:', last.toolResults?.[0]?.data ? Object.keys(last.toolResults[0].data) : null);
  } else {
    console.log('NO RESULT LINE FOUND. Raw tail:', raw.slice(-500));
  }
  console.log('---');
}
