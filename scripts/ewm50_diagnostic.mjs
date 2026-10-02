async function call(q, backendTarget = 'BOTH') {
  const res = await fetch('http://localhost:3000/api/gemini/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: q, userRole: 'Functional Consultant', history: [], backendTarget })
  });
  const raw = await res.text();
  const lines = raw.split('\n').map(s => s.trim()).filter(Boolean);
  for (const line of lines.reverse()) {
    try {
      const parsed = JSON.parse(line);
      if (parsed?.type === 'result') return { text: parsed.text || '', type: parsed.toolResults?.[0]?.type || '', toolName: parsed.toolResults?.[0]?.toolName || '', data: parsed.toolResults?.[0]?.data };
    } catch {}
  }
  return { text: '', type: '' };
}

const questions = [
  "Show today's warehouse workload.",
  'How many inbound deliveries are pending?',
  'How many outbound deliveries are waiting for picking?',
  'Which warehouse tasks are overdue?',
  'Show all open warehouse orders.',
  'Which bins are currently blocked?',
  'What is the current warehouse utilization?',
  "Show today's goods receipt volume.",
  "Show today's goods issue volume.",
  'Which warehouse areas have the highest workload?',
  'Show inbound deliveries arriving today.',
  'Which inbound deliveries are delayed?',
  'What goods are waiting for putaway?',
  'Which materials have not been put away yet?',
  'Show putaway tasks older than two hours.',
  'Which inbound deliveries have quantity differences?',
  'Which vendors have the most receiving discrepancies?',
  'Recommend putaway bins for incoming stock.',
  'Which inbound shipments need quality inspection?',
  'Show dock appointments and expected arrival times.',
  'Show outbound deliveries due today.',
  'Which deliveries are not fully picked?',
  'Which orders are waiting for packing?',
  'Which shipments are at risk of missing cutoff time?',
  'Show all partially picked deliveries.',
  'Which customer orders have stock shortages?',
  'Which outbound deliveries are blocked?',
  'Recommend the best picking sequence.',
  'Show priority shipments that must leave today.',
  'Which deliveries are ready for goods issue?',
  'Show current stock by warehouse and storage bin.',
  'Where is material 100123 stored?',
  'Which materials are below minimum stock?',
  'Show excess inventory by storage type.',
  'Which materials have not moved in 90 days?',
  'Show batch inventory and expiration dates.',
  'Which storage bins have negative or inconsistent stock?',
  'Show available stock versus allocated stock.',
  'Identify inventory discrepancies.',
  'Which materials require cycle counting?',
  'Which warehouse areas are overloaded?',
  'Which workers have the highest open task count?',
  'Show picking productivity today.',
  "Compare warehouse productivity with yesterday.",
  "Predict today's picking backlog.",
  'Which process step is causing the biggest delay?',
  'Show utilization by storage type.',
  "Predict tomorrow's labor requirement.",
  'Recommend workload balancing across warehouse zones.',
  'Which operations should be prioritized right now?'
];

function summarize(s) {
  const oneLine = (s || '').replace(/\s+/g, ' ').trim();
  return oneLine.length > 200 ? `${oneLine.slice(0, 197)}...` : oneLine;
}

async function main() {
  const rows = [];
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const r = await call(q);
    const ltext = (r.text || '').toLowerCase();
    const isBlank = !r.text || !r.text.trim() || ltext.includes('returned no text');
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
    rows.push({ id: i + 1, q, type: r.type, toolName: r.toolName, verdict, rowCount: r.data?.rows?.length ?? null, textPreview: summarize(r.text) });
    console.log(`[${i + 1}/50] ${verdict} (${r.type}) :: ${q}`);
  }
  const totals = {};
  for (const r of rows) totals[r.verdict.split(':')[0]] = (totals[r.verdict.split(':')[0]] || 0) + 1;
  console.log('\n=== EWM50 SUMMARY ===');
  console.log(JSON.stringify(totals, null, 2));
  const fs = await import('node:fs');
  fs.mkdirSync('test-results', { recursive: true });
  fs.writeFileSync('test-results/ewm50-baseline.json', JSON.stringify(rows, null, 2));
}
main().catch(e => { console.error(e); process.exit(1); });
