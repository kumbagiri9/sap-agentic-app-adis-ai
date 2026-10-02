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
  'Show details of Material MAT-1001.',
  'Which materials were created this week?',
  'Which materials are inactive?',
  'Show materials missing MRP data.',
  'Which materials have incomplete master data?',
  'Show obsolete materials.',
  "Which materials haven't been used in the last 12 months?",
  'Compare Material A and Material B.',
  'Show duplicate material master records.',
  'Recommend material master cleanup opportunities.',
  'Show current inventory by plant.',
  'Which materials are below minimum stock?',
  'Which materials are overstocked?',
  'Show stock available across all plants.',
  'Which materials have negative inventory?',
  'Show slow-moving inventory.',
  'Show non-moving inventory.',
  'Which materials will stock out within the next 7 days?',
  'Show inventory valuation by plant.',
  'Recommend inventory optimization opportunities.',
  'Show all open Purchase Requisitions.',
  'Show all open Purchase Orders.',
  'Which purchase orders are overdue?',
  'Which purchase orders require approval?',
  'Which purchase orders have delivery delays?',
  'Show urgent procurement requests.',
  'Which suppliers have delayed deliveries?',
  'Show purchase order price variances.',
  'Which POs are waiting for Goods Receipt?',
  'Show procurement spend by supplier.',
  "Show today's Goods Receipts.",
  "Show today's Goods Issues.",
  'Which Goods Receipts failed?',
  'Show blocked stock.',
  'Which materials are in Quality Inspection stock?',
  'Show stock transfer orders.',
  'Which transfer orders are delayed?',
  'Show material movements today.',
  'Show return deliveries.',
  'Which material documents have posting errors?',
  'Show supplier performance.',
  'Which vendors have the highest delivery delays?',
  'Which vendors provide Material X?',
  'Compare supplier prices.',
  'Show supplier quality ratings.',
  'Which suppliers should we avoid?',
  'Show contract utilization.',
  'Which suppliers have expiring contracts?',
  "Predict next month's procurement demand.",
  'Which procurement issues require immediate attention?'
];

function summarize(s) {
  const oneLine = (s || '').replace(/\s+/g, ' ').trim();
  return oneLine.length > 200 ? `${oneLine.slice(0, 197)}...` : oneLine;
}

async function main() {
  const rows = [];
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const r = await callChat(q);
    const ltext = r.text.toLowerCase();
    const isBlank = !r.text.trim() || ltext.includes('returned no text');
    const isLive = r.type === 'mm_live_report';
    const isHonestUnavailable = r.type === 'fico_service_unavailable';
    const isSuspectFabricated = ltext.includes('live sap query') && ltext.includes('returned') && ltext.includes('record') && r.type !== 'mm_live_report';
    const isError = r.type === 'error';
    let verdict = 'UNKNOWN';
    if (isBlank) verdict = 'BLANK';
    else if (isSuspectFabricated) verdict = 'SUSPECT_FABRICATED';
    else if (isError) verdict = 'RAW_ERROR';
    else if (isLive) verdict = 'LIVE';
    else if (isHonestUnavailable) verdict = 'HONEST_UNAVAILABLE';
    else verdict = 'OTHER:' + r.type;
    rows.push({ id: i + 1, q, type: r.type, verdict, rowCount: r.data?.rows?.length ?? null, textPreview: summarize(r.text) });
    console.log(`[${i + 1}/50] ${verdict} (${r.type}) :: ${q}`);
  }
  const totals = {};
  for (const r of rows) totals[r.verdict.split(':')[0]] = (totals[r.verdict.split(':')[0]] || 0) + 1;
  console.log('\n=== MM50 SUMMARY ===');
  console.log(JSON.stringify(totals, null, 2));
  fs.mkdirSync('test-results', { recursive: true });
  fs.writeFileSync('test-results/mm50-baseline.json', JSON.stringify(rows, null, 2));
}
main().catch(e => { console.error(e); process.exit(1); });
