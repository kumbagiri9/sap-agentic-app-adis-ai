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

async function ask(question) {
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
      if (parsed?.type === 'result') return parsed;
    } catch {}
  }
  return null;
}

(async () => {
  for (const q of [
    'Display the balance sheet as of today',
    'Show profit and loss for this year',
    'Show balance sheet for company code 2901'
  ]) {
    const r = await ask(q);
    console.log('=====', q, '=====');
    console.log('text:', r?.text?.slice(0, 400));
    const tr = r?.toolResults?.[0];
    console.log('type:', tr?.type);
    if (tr?.data?.summaryStats) console.log('summaryStats:', JSON.stringify(tr.data.summaryStats));
    if (tr?.data?.rows) console.log('rowCount:', tr.data.rows.length, 'sample:', JSON.stringify(tr.data.rows.slice(0, 3)));
    console.log('');
  }
})();
