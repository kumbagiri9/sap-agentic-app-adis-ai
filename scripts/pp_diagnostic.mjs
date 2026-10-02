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
  const res = await fetch(APP_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: question, userRole: 'Functional Consultant', history: [], backendTarget: 'BOTH' }) });
  const raw = await res.text();
  const lines = raw.split('\n').map(s => s.trim()).filter(Boolean);
  for (const line of lines.reverse()) {
    try { const parsed = JSON.parse(line); if (parsed?.type === 'result') return { text: parsed.text || '', type: parsed.toolResults?.[0]?.type || '', data: parsed.toolResults?.[0]?.data }; } catch {}
  }
  return { text: '', type: '' };
}

const questions = [
  'Show production orders.',
  'Show production orders that are released.',
  'Show process orders.',
  'Show production order confirmations.',
  'Show planned orders.',
  'Show firm planned orders.',
  'Show the bill of materials.',
  'Show bill of materials for material SG21.',
  'Show work centers.',
  'Show production versions.',
  'Show production versions for material SG21.',
  'Show production routings.',
  'Show production routing for material 2736.',
  'Show MRP materials.',
  'Show MRP materials with safety stock.',
  'Show demand management supply and demand for material 2.',
  'Show planned independent requirements.',
  'Show kanban containers.',
  'Show empty kanban containers.',
];

let ok = 0, blank = 0;
for (const q of questions) {
  const r = await callChat(q);
  const isBlank = !r.text || r.text.trim().length === 0;
  console.log(`\nQ: ${q}\n  type=${r.type}\n  text=${r.text.slice(0, 220)}`);
  if (isBlank) { blank++; console.log('  => BLANK'); } else { ok++; console.log('  => OK'); }
}
console.log(`\n\nSUMMARY: OK=${ok}, BLANK=${blank}, total=${questions.length}`);
