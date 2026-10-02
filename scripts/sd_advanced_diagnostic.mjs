const APP_URL = 'http://localhost:3000/api/gemini/query';

async function callChat(question) {
  const res = await fetch(APP_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: question, userRole: 'Functional Consultant', history: [], backendTarget: 'BOTH' }) });
  const raw = await res.text();
  const lines = raw.split('\n').map(s => s.trim()).filter(Boolean);
  for (const line of lines.reverse()) {
    try { const parsed = JSON.parse(line); if (parsed?.type === 'result') return { text: parsed.text || '', type: parsed.toolResults?.[0]?.type || '', data: parsed.toolResults?.[0]?.data }; } catch {}
  }
  return { text: '', type: '' };
}

const questions = [
  'Create an order for Customer 1 for 5 units of Product TG0002, requested delivery in 30 days.',
  'Customer needs 1000 EA of a material, resolve ATP across plants.',
  'Why did Customer ABC receive this price?',
  'Compare this price with the customer previous order.',
  'Find orders with unusually high discounts.',
  'Which sales representatives are giving excessive discounts?',
  'What would the margin be if we gave another 5% discount?',
  'Which customers are receiving below-margin pricing?',
  'Which customers are creating financial risk?',
  'What is preventing us from converting orders into revenue?',
  'What sales orders are likely to be late next week?',
  'How can we increase recognized revenue before month end?',
  'Why can\'t we ship Customer ABC order today?',
  'What should the sales organization focus on today?',
];

for (let i = 0; i < questions.length; i++) {
  const q = questions[i];
  const r = await callChat(q);
  console.log(`[${i + 1}/${questions.length}] type=${r.type || 'none'} :: ${q}`);
  console.log(`    -> ${(r.text || '').slice(0, 300).replace(/\n/g, ' ')}`);
}
