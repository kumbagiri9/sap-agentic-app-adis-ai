// Runs the 50 Basis questions through the regular chat (no prefix) and classifies each response as
// LIVE (real data returned) or NOT_LIVE (disclosure/error). Usage: node scripts/basis50_live_diagnostic.mjs <out.jsonl> [basis|abap]
import fs from 'node:fs';

const BASIS_QUESTIONS = [
  'Is the SAP production system healthy right now?', 'Which SAP systems have critical alerts?',
  'Show CPU, memory, and disk utilization across all application servers.', 'Are any SAP instances or services down?',
  'Which system has the highest response time?', 'Show the current number of active users.',
  'Which application server is overloaded?', 'Are there any enqueue or lock issues?',
  'Show the top five technical problems affecting users.', 'What should the Basis team fix first today?',
  'Which jobs failed overnight?', 'Why did job Z_MONTH_END fail?', 'Show long-running background jobs.',
  'Which jobs are delayed?', 'Which critical jobs did not start?', 'Which jobs are exceeding their normal runtime?',
  'Show jobs scheduled for tonight.', 'Which failed jobs can safely be restarted?', 'Restart this failed job after validation.',
  'Predict which jobs are likely to miss their SLA.',
  "Show today's ST22 dumps.", 'Which ABAP dumps are occurring repeatedly?', 'Explain this ST22 dump in plain English.',
  'Show critical SM21 system log errors.', 'Which errors started after the latest transport?', 'Show update failures from SM13.',
  'Which technical errors are impacting business transactions?', 'Correlate dumps, jobs, and transports from the last four hours.',
  "What is the most likely root cause of today's errors?", 'Which errors require immediate action?',
  'Why is SAP running slowly?', 'Which transactions have the highest response time?', 'Show the most expensive SAP transactions today.',
  'Which work processes are stuck?', 'Which users or programs are consuming the most resources?',
  'Show work process utilization across servers.', 'Are there memory bottlenecks?',
  'Is the problem in SAP, HANA, network, or custom ABAP?', "Compare today's performance with yesterday.",
  'Predict when system capacity could become critical.',
  'Which users are locked?', 'Show failed login attempts.', 'Which technical users have authentication problems?',
  'Which RFC destinations are failing?', 'Show queued transactions in SM58.', 'Show inbound and outbound qRFC problems.',
  'Which certificates expire within the next 30 days?', 'Which interfaces are currently unavailable?',
  'Which privileged accounts require review?', 'Show Basis-related audit risks.'
];
const ABAP_QUESTIONS = [
  'Explain what this ABAP program does.', 'Show all custom Z programs changed this week.', 'Which custom objects are used by Sales Order processing?',
  'Find where table VBAK is referenced.', 'Which programs update this custom table?', 'Show unused custom code.',
  'Which programs have hard-coded values?', 'Which custom objects have no documentation?', 'Find duplicate logic across Z programs.',
  'Which custom objects are highest risk?',
  'Why did this ABAP program dump?', 'Explain this ST22 dump in plain English.', 'Find the line of code causing the error.',
  'Why is this internal table empty?', 'Why is this SELECT returning no data?', 'Why is this BAPI call failing?',
  'Why is this IDoc processing program failing?', 'Why is this background job terminating?', 'Show recent errors related to this program.',
  'Recommend the safest fix for this defect.',
  'Which custom ABAP programs are slowest?', 'Find SELECT statements causing performance problems.', 'Show programs using SELECT inside LOOP.',
  'Which programs are doing full-table scans?', 'Find unnecessary nested loops.', 'Which custom reports consume the most database time?',
  'Analyze this SQL statement for HANA performance.', 'Recommend how to optimize this program.',
  'Which code should use CDS instead of traditional SELECTs?', 'Compare runtime before and after this change.',
  'Create an ABAP report for sales orders by customer.', 'Create a CDS view for open purchase orders.', 'Generate an ALV report for material stock.',
  'Create an OData service for this business object.', 'Build an ABAP class for this requirement.', 'Create a BAdI implementation for this enhancement.',
  'Generate unit tests for this class.', 'Create an ABAP RAP service for this application.', 'Create code to call this REST API.',
  'Convert this procedural program to object-oriented ABAP.',
  'Which custom programs are not S/4HANA compatible?', 'Show code using obsolete tables or transactions.',
  'Find custom code affected by simplified data models.', 'Which SELECT statements should be replaced with CDS views?',
  'Find direct database updates that should be removed.', 'Which custom objects will fail after S/4HANA migration?',
  'Analyze ATC findings for this package.', 'Prioritize custom-code remediation.', 'Convert this ECC ABAP logic for S/4HANA.',
  'Estimate effort to modernize this custom application.'
];
const SECURITY_QUESTIONS = [
  'Show all active users in PRD.', 'Which users are locked?', 'Which users have not logged in for 90 days?', 'Show users created this week.',
  'Which users have expired passwords?', 'Which users have access after their termination date?', 'Show users with multiple dialog accounts.',
  'Which service or technical users are interactive?', 'Show users by company code, plant, or business unit.', 'Which user accounts need immediate review?',
  'What roles does User ABC have?', 'Why does this user have access to transaction VA02?', 'Which roles provide access to FB60?', 'Show users with SAP_ALL.',
  'Show users with SAP_NEW.', 'Which roles contain critical authorization objects?', 'Show composite roles assigned to this user.',
  'Which roles were changed recently?', 'Which users received new production access this week?', "Compare this user's access with another user in the same job role.",
  'Show all current SoD conflicts.', 'Which users can both create and pay vendors?', 'Who can create purchase orders and approve them?',
  'Which users can create and post journal entries?', 'Show users with conflicting procurement and payment access.', 'Which SoD violations are high risk?',
  'Which conflicts have mitigating controls?', 'Which mitigating controls have expired?', 'Show new SoD conflicts introduced this week.',
  'Which role changes would remove the largest number of SoD risks?',
  'Show all firefighter users.', 'Who used firefighter access today?', 'What did User ABC do during firefighter access?', 'Show unreviewed firefighter sessions.',
  'Which privileged users performed sensitive transactions?', 'Show emergency-access activity from the last 24 hours.', 'Which firefighter IDs are assigned to too many users?',
  'Which emergency-access sessions lacked approval?', 'Show privileged actions affecting finance or payroll.', 'Which emergency-access activities require investigation?',
  'Show failed login attempts.', 'Which users are generating repeated authorization failures?', 'Show critical SU53 failures.',
  'Which users accessed sensitive financial data today?', 'Show role changes made directly in production.', 'Which users have excessive access compared with their peers?',
  'Show dormant privileged accounts.', 'Which security controls are currently failing?', 'What are our highest SAP security risks today?',
  'What should the security team remediate first?'
];
const BW_QUESTIONS = [
  "Show today's revenue.", "Compare this month's revenue with last month.", 'Show sales by region, product, and customer.', 'What are our top five products by revenue?',
  'Which customers are declining?', 'Show gross margin by business unit.', 'Which plants are exceeding their operating budget?', 'Show actual versus plan for this quarter.',
  'Why did revenue decrease this week?', 'What business KPIs require immediate attention?', 'How is the company performing today?',
  'Show BW process chains that failed overnight.', 'Which BW data loads are delayed?', 'Why did this DTP fail?', 'Which ADSOs have not loaded successfully?',
  'Show requests with errors.', 'Which InfoProviders have stale data?', 'When was this BW query last refreshed?', 'Show BW query runtime performance.',
  'Which queries are running slowly?', 'Which BW objects depend on this ADSO?',
  "Show today's source-system loads.", 'Which extractors failed?', "What data is missing from today's load?", 'Compare source record count with BW record count.',
  'Which delta loads are incomplete?', 'Show duplicate records detected during loading.', 'Which transformations generated errors?', "Why are yesterday's sales missing from BW?",
  'Show data-load duration trends.', 'Predict which nightly loads may miss the reporting SLA.',
  'Show current sales orders directly from S/4HANA.', 'Compare S/4 operational data with BW reporting data.', 'Which S/4 KPIs changed significantly today?',
  'Show open purchase-order value by plant.', 'Show current inventory valuation.', 'Show production variance by plant.', 'Show overdue customer receivables.',
  'Show supplier delivery performance.', 'Which S/4 analytical CDS views are used for this report?', 'Explain why this KPI differs between S/4 and BW.',
  'Show the available Datasphere spaces.', 'Which analytic models are exposed for consumption?', 'Show datasets available in the Finance space.',
  'Which Datasphere models depend on S/4HANA?', 'Show data lineage for this analytical model.', 'Which data products are stale?', 'Which Datasphere connections are failing?',
  'Show users consuming this analytical model.', 'Which models have performance issues?', 'What data-quality problems require attention today?'
];
const TM_QUESTIONS = [
  'Show all freight units created today.', 'Which freight units are not yet planned?', 'Show shipments scheduled for today.', 'Which transportation orders are delayed?',
  'Which loads are not assigned to a carrier?', 'Which shipments are missing equipment?', 'Show freight orders by plant, shipping point, or region.',
  'Which shipments are at risk of missing delivery dates?', "Show today's transportation workload.", 'What transportation issues need immediate attention?',
  'Which carriers are performing best?', 'Which carriers have the highest delay rate?', 'Compare carriers by cost and service level.', 'Which carrier should we use for this shipment?',
  'Which carriers have available capacity today?', 'Which carriers are rejecting tenders?', 'Show carrier acceptance rates.', 'Which carriers are consistently late?',
  'Which carriers have the highest freight claims?', 'Recommend alternate carriers for delayed shipments.',
  "Show transportation cost for today's shipments.", 'Which lanes have the highest freight cost?', 'Compare planned freight cost with actual cost.',
  'Which carriers have increased rates recently?', 'Show transportation spend by carrier.', 'Show transportation spend by lane.', 'Which shipments exceeded expected freight cost?',
  'Find freight cost-saving opportunities.', 'Which routes have excessive accessorial charges?', 'Forecast transportation spend for this month.',
  'Which shipments have not departed?', 'Which trucks are late arriving at the warehouse?', 'Show shipments currently in transit.', 'Which deliveries are expected to arrive late?',
  'Show missed pickup appointments.', 'Which freight orders have execution exceptions?', 'Which shipments are waiting at the dock?', 'Show proof-of-delivery exceptions.',
  'Which shipments have detention or demurrage risk?', 'Which customers are affected by transportation delays?',
  'What is the best route for this shipment?', 'Can we consolidate these deliveries into one load?', 'Which loads are underutilized?', 'Show trailer utilization.',
  'Which lanes should be consolidated?', 'Can we reduce empty miles?', 'Which warehouses are causing transportation delays?', "Predict tomorrow's transportation capacity shortage.",
  'Recommend the optimal transportation plan.', 'What actions can reduce logistics cost today?'
];
const QUESTIONS = process.argv[3] === 'abap' ? ABAP_QUESTIONS : process.argv[3] === 'security' ? SECURITY_QUESTIONS : process.argv[3] === 'bw' ? BW_QUESTIONS : process.argv[3] === 'tm' ? TM_QUESTIONS : BASIS_QUESTIONS;
const NOT_LIVE_TYPES = new Set(['fico_service_unavailable', 'hana_db_unavailable', 'error', 'live_sap_unavailable']);

async function ask(query) {
  const res = await fetch('http://localhost:3000/api/gemini/query', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, userRole: 'Administrator', backendTarget: 'BOTH' })
  });
  const events = (await res.text()).split('\n').map(l => l.replace(/^data:\s*/, '').trim()).filter(Boolean)
    .map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
  const final = [...events].reverse().find(e => e.text !== undefined || e.toolResults || e.result) || {};
  return final.result || final.data || final;
}

const out = process.argv[2] || 'test-results/basis50_live.jsonl';
fs.writeFileSync(out, '');
let idx = 0;
const tally = { LIVE: 0, NOT_LIVE: 0 };
async function worker() {
  while (idx < QUESTIONS.length) {
    const i = idx++; const q = QUESTIONS[i];
    let rec;
    try {
      const r = await ask(q);
      const tr = (r.toolResults || [])[0] || {};
      const text = String(r.text || '');
      const rows = tr.data?.rows?.length ?? tr.data?.rowCount ?? null;
      const live = !!tr.type && !NOT_LIVE_TYPES.has(tr.type) && !/not available live|cannot be answered from the live|returned no text|returned 0 real/i.test(text);
      rec = { n: i + 1, q, verdict: live ? 'LIVE' : 'NOT_LIVE', type: tr.type || null, tool: tr.toolName || null, rows, sql: tr.data?.sql || tr.data?.executedSql || null, text: text.slice(0, 1200) };
    } catch (e) { rec = { n: i + 1, q, verdict: 'NOT_LIVE', type: 'exception', text: String(e?.message || e) }; }
    tally[rec.verdict]++;
    fs.appendFileSync(out, JSON.stringify(rec) + '\n');
    console.log(`[${rec.n}] ${rec.verdict} ${rec.type} - ${q}`);
  }
}
await Promise.all([worker(), worker(), worker()]);
console.log('SUMMARY', JSON.stringify(tally));
