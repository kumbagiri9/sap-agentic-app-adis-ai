import fs from 'node:fs';

function loadEnv() {
  const text = fs.readFileSync('.env', 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#') || !t.includes('=')) continue;
    const i = t.indexOf('=');
    const k = t.slice(0, i).trim();
    const v = t.slice(i + 1).trim().replace(/^['"]|['"]$/g, '');
    if (!process.env[k]) process.env[k] = v;
  }
}
loadEnv();

const APP_URL = 'http://localhost:3000/api/gemini/query';

async function callChat(question) {
  const res = await fetch(APP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: question, userRole: 'Functional Consultant', history: [], backendTarget: 'BOTH' })
  });
  const raw = await res.text();
  const lines = raw.split('\n').map(s => s.trim()).filter(Boolean);
  for (const line of lines.reverse()) {
    try {
      const parsed = JSON.parse(line);
      if (parsed?.type === 'result') return { text: parsed.text || '', type: parsed.toolResults?.[0]?.type || '', data: parsed.toolResults?.[0]?.data };
    } catch {}
  }
  return { text: '', type: '' };
}

const questions = [
  // General Finance (FI)
  "Show today's financial summary.",
  'What is our current cash position?',
  "Show today's revenue by company code.",
  "What are today's expenses?",
  "Compare this month's revenue with last month.",
  'Show profit and loss for this month.',
  'Display the balance sheet as of today.',
  'What are our biggest operating expenses?',
  'Which GL accounts had unusual activity today?',
  'Show all financial postings made today.',
  // Accounts Payable (AP)
  'Show overdue vendor invoices.',
  'Which vendor payments are due today?',
  'Display blocked invoices awaiting approval.',
  'Why is invoice 5100001234 blocked?',
  'Show vendor aging analysis.',
  "Which vendors haven't been paid in the last 30 days?",
  'Create a payment proposal for this week.',
  'Show duplicate invoice candidates.',
  'Identify vendor payment discounts we can still capture.',
  'Predict upcoming cash requirements for vendor payments.',
  // Accounts Receivable (AR)
  'Show overdue customer invoices.',
  'Which customers are at risk of late payment?',
  'Display customer aging report.',
  'Which invoices are disputed?',
  "Show today's incoming customer payments.",
  'Identify customers exceeding their credit limit.',
  'Predict bad debt risk by customer.',
  'Show unapplied customer payments.',
  'Recommend collection priorities.',
  "Forecast next month's customer cash collections.",
  // General Ledger (GL)
  'Show all journal entries posted today.',
  'Which journal entries require approval?',
  'Find manual journal postings over $100,000.',
  'Show unbalanced journal entries.',
  'Display all postings for GL account 400000.',
  'Compare actual vs budget for this cost center.',
  'Identify unusual GL account movements.',
  'Explain why office supply expenses increased this month.',
  'Show recurring journal entries due today.',
  'Recommend correcting entries for posting errors.',
  // Cost Controlling (CO)
  'Show actual vs planned costs by cost center.',
  'Which cost centers exceeded their budget?',
  'Show internal order costs.',
  'Display profitability by product.',
  'Which products have the highest manufacturing cost?',
  'Show production variance analysis.',
  'Explain cost overruns this month.',
  'Forecast month-end costs.',
  'Recommend cost reduction opportunities.',
  'Show profitability by customer, product, and region.'
];

function classify(r) {
  const text = r.text || '';
  if (/LIVE_SAP_UNAVAILABLE|fetch failed|ENOTFOUND|no text|Cannot read properties/i.test(text)) return 'ERROR';
  if (!text || text.trim().length === 0) return 'BLANK';
  if (r.type === 'fico_service_unavailable') return 'HONEST_UNAVAILABLE';
  return 'LIVE';
}

const results = [];
for (let i = 0; i < questions.length; i++) {
  const q = questions[i];
  let r;
  try { r = await callChat(q); } catch (e) { r = { text: String(e), type: '' }; }
  const status = classify(r);
  results.push({ q, status, type: r.type, text: (r.text || '').slice(0, 260).replace(/\n/g, ' ') });
  console.log(`[${i + 1}/${questions.length}] ${status} (${r.type || 'no-type'}) :: ${q}`);
  console.log(`    -> ${(r.text || '').slice(0, 260).replace(/\n/g, ' ')}`);
}

const tally = results.reduce((acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc; }, {});
console.log('\n=== FICO50 SUMMARY ===');
console.log(JSON.stringify(tally, null, 2));
fs.writeFileSync('test-results/fico50-diagnostic.json', JSON.stringify(results, null, 2));
console.log('Detailed report: test-results/fico50-diagnostic.json');
