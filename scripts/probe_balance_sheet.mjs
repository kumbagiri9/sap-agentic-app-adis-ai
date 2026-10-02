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

const BASE = process.env.SAP_S8H_BASE_URL;
const USER = process.env.SAP_S8H_USER;
const PWD = process.env.SAP_S8H_PWD;
const auth = 'Basic ' + Buffer.from(`${USER}:${PWD}`).toString('base64');

async function get(url) {
  const res = await fetch(url, { headers: { Authorization: auth, Accept: 'application/json' } });
  const status = res.status;
  let body;
  try { body = await res.json(); } catch { body = await res.text(); }
  return { status, body };
}

(async () => {
  console.log('--- A_JournalEntryItemBasic sample (amount + GL account) ---');
  const r1 = await get(`${BASE}/API_JOURNALENTRYITEMBASIC_SRV/A_JournalEntryItemBasic?$select=CompanyCode,GLAccount,GLAccountName,FiscalYear,FiscalPeriod,AmountInCompanyCodeCurrency,CompanyCodeCurrency,DebitCreditCode&$top=10&$format=json`);
  console.log('status', r1.status);
  console.log(JSON.stringify(r1.body?.d?.results || r1.body, null, 2).slice(0, 3000));

  console.log('\n--- Real record count ---');
  const r2 = await get(`${BASE}/API_JOURNALENTRYITEMBASIC_SRV/A_JournalEntryItemBasic/$count`);
  console.log('status', r2.status, 'count', r2.body);

  console.log('\n--- Non-zero amount check (sample 50, filter ne 0) ---');
  const r3 = await get(`${BASE}/API_JOURNALENTRYITEMBASIC_SRV/A_JournalEntryItemBasic?$select=GLAccount,AmountInCompanyCodeCurrency&$filter=AmountInCompanyCodeCurrency ne 0&$top=10&$format=json`);
  console.log('status', r3.status);
  console.log(JSON.stringify(r3.body?.d?.results || r3.body, null, 2).slice(0, 2000));

  console.log('\n--- A_GLAccountInChartOfAccounts distinct GLAccountType sample ---');
  const r4 = await get(`${BASE}/API_GLACCOUNTINCHARTOFACCOUNTS_SRV/A_GLAccountInChartOfAccounts?$select=GLAccount,GLAccountType,IsBalanceSheetAccount,IsProfitLossAccount&$top=15&$format=json`);
  console.log('status', r4.status);
  console.log(JSON.stringify(r4.body?.d?.results || r4.body, null, 2).slice(0, 2500));
})();
