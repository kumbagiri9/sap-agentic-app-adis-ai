import fs from 'node:fs';
const file = process.argv[2] || 'test-results/hana250_join.jsonl';
const recs = fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l)).filter(r => !r.done);
const classify = r => {
  if (r.type === 'hana_db_intelligence_report') return 'LIVE';
  const s = `${r.reason} ${r.text}`;
  if (/authorization/i.test(s)) return 'FAIL_AUTH';
  if (/could not construct a safe query|cannot be answered from the live SAP database/i.test(s)) return 'FAIL_NO_PLAN';
  if (/not all of which were|NOT among the live-confirmed/i.test(s)) return 'FAIL_UNKNOWN_TABLE';
  if (/unknown column|unknown field|is not a column/i.test(s)) return 'FAIL_BAD_COLUMN';
  if (/Validation Agent rejected/i.test(s)) return 'FAIL_VALIDATION';
  if (/could not execute the query/i.test(s)) return 'FAIL_SQL_ERROR';
  return `OTHER(${r.type})`;
};
const byMod = {};
const byClass = {};
let joins = 0, liveJoins = 0, liveEmpty = 0;
for (const r of recs) {
  const c = classify(r);
  (byMod[r.mod] ||= {})[c] = (byMod[r.mod][c] || 0) + 1;
  byClass[c] = (byClass[c] || 0) + 1;
  if (/\bJOIN\b/i.test(r.sql || '')) { joins++; if (c === 'LIVE') liveJoins++; }
  if (c === 'LIVE' && r.totalRows === 0) liveEmpty++;
}
console.log(`Total: ${recs.length}`);
console.log('By class:', byClass);
for (const [m, v] of Object.entries(byMod)) console.log(m, v);
console.log(`Queries using JOIN: ${joins} (live: ${liveJoins}); LIVE with 0 rows: ${liveEmpty}`);
if (process.argv.includes('--failures')) {
  for (const r of recs) {
    const c = classify(r);
    if (c !== 'LIVE') console.log(`[${r.mod}] ${c} | ${r.q} | ${(r.reason || r.text).slice(0, 160)}`);
  }
}
