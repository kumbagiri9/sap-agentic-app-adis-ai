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
  'Discover ABAP classes starting with Z2UI5.',
  'List ABAP programs named Z170*.',
  'Find function modules named ZEMP*.',
  'Show CDS views named ZI_WOUNLOCK*.',
  'Show RAP business objects named Z006*.',
  'Show service definitions named ZCDS_SD*.',
  'Show service bindings named ZCDS_SB*.',
  'List SEGW projects / OData services named Z006*.',
  'Show ABAP packages named ZDATALOAD*.',
  'Show enhancement implementations named ZHCMFAB*.',
  'Show message classes named ZDEMO*.',
  'Does object Z170_PLANT_LIST exist?',
  'Show OData $metadata for ZCDS_SD_WO_UNLOCK_CONF.',
  'Show DDIC table Z000035_ATIRC.',
];

let ok = 0, blank = 0, error = 0;
for (const q of questions) {
  const r = await callChat(q);
  const isBlank = !r.text || r.text.trim().length === 0;
  console.log(`\nQ: ${q}\n  type=${r.type}\n  text=${r.text.slice(0, 220)}`);
  if (isBlank) { blank++; console.log('  => BLANK'); } else { ok++; console.log('  => OK'); }
}
console.log(`\n\nSUMMARY: OK=${ok}, BLANK=${blank}, total=${questions.length}`);
