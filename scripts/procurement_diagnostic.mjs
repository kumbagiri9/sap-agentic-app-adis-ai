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
  'Show all purchase scheduling agreements.',
  'Show open scheduling agreement lines.',
  'Show all requests for quotation.',
  'Show open RFQs.',
  'Show supplier quotations.',
  'Show the highest value supplier quotations.',
  'Show purchasing info records.',
  'Show purchasing info records for a regular supplier.',
  'Show purchasing groups.',
  'Show purchasing organizations.',
  'Show supplier company master data.',
  'Show blocked suppliers.',
  'Show business partner addresses.',
  'Show the plant master.',
  'List all plants.',
  'Show storage location master.',
  'Show invoice verification status.',
  'Show supplier payment status.',
];

let live = 0, honestEmpty = 0, blank = 0, error = 0;
for (const q of questions) {
  const r = await callChat(q);
  const isBlank = !r.text || r.text.trim().length === 0;
  const isError = /error|exception/i.test(r.text) && !/no service found/i.test(r.text);
  console.log(`\nQ: ${q}\n  type=${r.type}\n  text=${r.text.slice(0, 220)}`);
  if (isBlank) { blank++; console.log('  => BLANK'); }
  else if (isError) { error++; console.log('  => ERROR'); }
  else { live++; console.log('  => OK'); }
}
console.log(`\n\nSUMMARY: OK(non-blank/non-error)=${live}, BLANK=${blank}, ERROR=${error}, total=${questions.length}`);
