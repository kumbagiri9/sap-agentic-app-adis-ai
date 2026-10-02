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
  // Executive & Business Analytics (1-10)
  "Show today's revenue.",
  "Compare this month's revenue with last month.",
  'Show sales by region, product, and customer.',
  'What are our top five products by revenue?',
  'Which customers are declining?',
  'Show gross margin by business unit.',
  'Which plants are exceeding their operating budget?',
  'Show actual versus plan for this quarter.',
  'Why did revenue decrease this week?',
  'What business KPIs require immediate attention?',
  // BW/4HANA Questions (11-20)
  'Show BW process chains that failed overnight.',
  'Which BW data loads are delayed?',
  'Why did this DTP fail?',
  'Which ADSOs have not loaded successfully?',
  'Show requests with errors.',
  'Which InfoProviders have stale data?',
  'When was this BW query last refreshed?',
  'Show BW query runtime performance.',
  'Which queries are running slowly?',
  'Which BW objects depend on this ADSO?',
  // BW Data Load & ETL Questions (21-30)
  "Show today's source-system loads.",
  'Which extractors failed?',
  'What data is missing from today\'s load?',
  'Compare source record count with BW record count.',
  'Which delta loads are incomplete?',
  'Show duplicate records detected during loading.',
  'Which transformations generated errors?',
  "Why are yesterday's sales missing from BW?",
  'Show data-load duration trends.',
  'Predict which nightly loads may miss the reporting SLA.',
  // S/4HANA Embedded Analytics (31-40)
  'Show current sales orders directly from S/4HANA.',
  'Compare S/4 operational data with BW reporting data.',
  'Which S/4 KPIs changed significantly today?',
  'Show open purchase-order value by plant.',
  'Show current inventory valuation.',
  'Show production variance by plant.',
  'Show overdue customer receivables.',
  'Show supplier delivery performance.',
  'Which S/4 analytical CDS views are used for this report?',
  'Explain why this KPI differs between S/4 and BW.',
  // SAP Datasphere Questions (41-50)
  'Show the available Datasphere spaces.',
  'Which analytic models are exposed for consumption?',
  'Show datasets available in the Finance space.',
  'Which Datasphere models depend on S/4HANA?',
  'Show data lineage for this analytical model.',
  'Which data products are stale?',
  'Which Datasphere connections are failing?',
  'Show users consuming this analytical model.',
  'Which models have performance issues?',
  'What data-quality problems require attention today?'
];

function classify(res) {
  if (!res.text && !res.type) return 'BLANK';
  if (res.type === 'bw_query_visual_report' || res.type === 'mm_live_report') {
    const rows = res.data?.rows;
    if (Array.isArray(rows)) return 'LIVE';
    return 'LIVE';
  }
  if (res.type === 'fico_service_unavailable') return 'HONEST_UNAVAILABLE';
  if (!res.text) return 'BLANK';
  if (/error|exception|stack/i.test(res.text) && !/no service found|not available|not deployed/i.test(res.text)) return 'RAW_ERROR';
  return `OTHER(${res.type || 'no-type'})`;
}

async function main() {
  const results = [];
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    try {
      const res = await callChat(q);
      const cls = classify(res);
      results.push({ idx: i + 1, question: q, class: cls, type: res.type, textPreview: (res.text || '').slice(0, 140) });
      console.log(`[${i + 1}/50] ${cls} (${res.type || 'NONE'}) :: ${q}`);
    } catch (e) {
      results.push({ idx: i + 1, question: q, class: 'ERROR', error: e.message });
      console.log(`[${i + 1}/50] ERROR :: ${q} :: ${e.message}`);
    }
  }
  const summary = {};
  for (const r of results) summary[r.class] = (summary[r.class] || 0) + 1;
  console.log('\n=== BW50 SUMMARY ===');
  console.log(JSON.stringify(summary, null, 2));
  fs.mkdirSync('test-results', { recursive: true });
  fs.writeFileSync('test-results/bw50-baseline.json', JSON.stringify(results, null, 2));
}

main();
