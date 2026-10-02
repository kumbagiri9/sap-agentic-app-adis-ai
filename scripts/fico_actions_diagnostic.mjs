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
  'Create a journal entry for company code 1710.',
  'Reverse the incorrect journal entry 100000123.',
  'Post an accrual for company code 1710.',
  'Execute the recurring entry for this month.',
  'Reclassify account 400000 to 410000.',
  'Close the accounting period for company code 1710.',
  'Trigger a payment run for vendor payments.',
  'Clear open items for company code 1710.',
  'Create a customer invoice for customer 17100001.',
  'Create a vendor invoice for vendor 17300001 amount 500 USD.',
  'Release blocked vendor invoice 5100000131.'
];

for (let i = 0; i < questions.length; i++) {
  const q = questions[i];
  const r = await callChat(q);
  console.log(`[${i + 1}/${questions.length}] type=${r.type || 'none'} :: ${q}`);
  console.log(`    -> ${(r.text || '').slice(0, 300).replace(/\n/g, ' ')}`);
  if (r.data?.proposalId) console.log(`    proposalId: ${r.data.proposalId}, target: ${r.data.targetId}, proposedChange: ${JSON.stringify(r.data.proposedChange)}`);
}
