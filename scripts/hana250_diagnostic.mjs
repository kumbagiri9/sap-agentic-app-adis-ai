import fs from 'node:fs';

const allSources = {
  SD: 'scripts/sd50_compare_live.ts',
  MM: 'scripts/mm50_diagnostic.mjs',
  PP: 'scripts/pp50_diagnostic.mjs',
  QM: 'scripts/qm50_diagnostic.mjs',
  EWM: 'scripts/ewm50_diagnostic.mjs',
  FICO: 'scripts/fico50_diagnostic.mjs',
  BASIS: 'scripts/basis50_compare_live.ts',
  SECURITY: 'scripts/security50_diagnostic.mjs'
};
const OUT = process.argv[2] || 'test-results/hana250_run.jsonl';
const selected = (process.argv[3] || 'SD,MM,PP,QM,EWM').split(',').map(s => s.trim().toUpperCase());
const sources = Object.fromEntries(selected.map(m => [m, allSources[m]]));

function extractQuestions(file) {
  const text = fs.readFileSync(file, 'utf8');
  const start = text.search(/const\s+questions[^=]*=\s*\[/);
  const open = text.indexOf('[', text.indexOf('=', start));
  let depth = 0, end = open;
  for (let i = open; i < text.length; i++) {
    if (text[i] === '[') depth++;
    else if (text[i] === ']') { depth--; if (depth === 0) { end = i; break; } }
  }
  const body = text.slice(open + 1, end).split('\n').filter(l => !l.trim().startsWith('//')).join('\n');
  const str = `"((?:[^"\\\\]|\\\\.)*)"|'((?:[^'\\\\]|\\\\.)*)'`;
  const re = /\bq\s*:/.test(body) ? new RegExp(`\\bq\\s*:\\s*(?:${str})`, 'g') : new RegExp(str, 'g');
  return [...body.matchAll(re)].map(m => (m[1] ?? m[2]).replace(/\\(.)/g, '$1'));
}

const jobs = [];
for (const [mod, file] of Object.entries(sources)) for (const q of extractQuestions(file)) jobs.push({ mod, q });
fs.writeFileSync(OUT, '');
console.log(`Loaded ${jobs.length} questions`);

async function runOne({ mod, q }) {
  const started = Date.now();
  let rec;
  try {
    const res = await fetch('http://localhost:3000/api/gemini/query', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: `HANA DB Intelligence: ${q}`, userRole: 'Administrator', backendTarget: 'BOTH' })
    });
    const text = await res.text();
    const line = text.split('\n').reverse().find(l => l.includes('"type":"result"'));
    const r = line ? JSON.parse(line) : null;
    const tr = r?.toolResults?.[0];
    const d = tr?.data || {};
    rec = { mod, q, type: tr?.type || 'none', sql: d.sqlExecuted || d.plannedSql || d.sql || '', totalRows: d.totalRows ?? null, reason: d.reason || '', text: (r?.text || '').slice(0, 400) };
  } catch (e) {
    rec = { mod, q, type: 'harness_error', reason: String(e?.message || e) };
  }
  rec.ms = Date.now() - started;
  fs.appendFileSync(OUT, JSON.stringify(rec) + '\n');
}

const CONCURRENCY = 3;
let idx = 0;
await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
  while (idx < jobs.length) { const job = jobs[idx++]; await runOne(job); }
}));
fs.appendFileSync(OUT, JSON.stringify({ done: true }) + '\n');
