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
  // Code Analysis
  'Explain what this ABAP program Z170_PLANT_LIST does.',
  'Show all custom Z programs changed this week.',
  'Which custom objects are used by Sales Order processing?',
  'Find where table VBAK is referenced.',
  'Which programs update table Z000035_ATIRC?',
  'Show unused custom code.',
  'Which programs have hard-coded values?',
  'Which custom objects have no documentation?',
  'Find duplicate logic across Z programs.',
  'Which custom objects are highest risk?',
  // Debugging & Error Analysis
  'Why did this ABAP program dump?',
  'Explain this ST22 dump in plain English.',
  'Find the line of code causing the error.',
  'Why is this internal table empty?',
  'Why is this SELECT returning no data?',
  'Why is this BAPI call failing?',
  'Why is this IDoc processing program failing?',
  'Why is this background job terminating?',
  'Show recent errors related to this program.',
  'Recommend the safest fix for this defect.',
  // Performance Optimization
  'Which custom ABAP programs are slowest?',
  'Find SELECT statements causing performance problems.',
  'Show programs using SELECT inside LOOP.',
  'Which programs are doing full-table scans?',
  'Find unnecessary nested loops.',
  'Which custom reports consume the most database time?',
  "Analyze this SQL statement for HANA performance: SELECT * FROM vbak INTO TABLE lt_vbak.",
  'Recommend how to optimize this program.',
  'Which code should use CDS instead of traditional SELECTs?',
  'Compare runtime before and after this change.',
  // Development & Code Generation
  'Create an ABAP report for sales orders by customer.',
  'Create a CDS view for open purchase orders.',
  'Generate an ALV report for material stock.',
  'Create an OData service for this business object.',
  'Build an ABAP class for this requirement.',
  'Create a BAdI implementation for this enhancement.',
  'Generate unit tests for this class.',
  'Create an ABAP RAP service for this application.',
  'Create code to call this REST API.',
  'Convert this procedural program to object-oriented ABAP.',
  // S/4HANA Modernization
  'Which custom programs are not S/4HANA compatible?',
  'Show code using obsolete tables or transactions.',
  'Find custom code affected by simplified data models.',
  'Which SELECT statements should be replaced with CDS views?',
  'Find direct database updates that should be removed.',
  'Which custom objects will fail after S/4HANA migration?',
  'Analyze ATC findings for this package.',
  'Prioritize custom-code remediation.',
  'Convert this ECC ABAP logic for S/4HANA.',
  'Estimate effort to modernize this custom application.',
];

let ok = 0, blank = 0, error = 0;
const results = [];
for (const q of questions) {
  const r = await callChat(q);
  const isBlank = !r.text || r.text.trim().length === 0;
  const isError = /internal server error|unexpected token|is not a function|cannot read propert/i.test(r.text);
  results.push({ q, type: r.type, text: r.text.slice(0, 180) });
  if (isBlank) blank++; else if (isError) error++; else ok++;
}

for (const r of results) {
  console.log(`\nQ: ${r.q}\n  type=${r.type}\n  text=${r.text}`);
}
console.log(`\n\nSUMMARY: OK=${ok}, BLANK=${blank}, ERROR=${error}, total=${questions.length}`);
