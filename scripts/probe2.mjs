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
  let body; try { body = await res.json(); } catch { body = await res.text(); }
  return { status, body };
}
(async () => {
  const out = [];
  const r1 = await get(`${BASE}/API_JOURNALENTRYITEMBASIC_SRV/A_JournalEntryItemBasic?$select=CompanyCode,ChartOfAccounts,GLAccount,LedgerFiscalYear,FiscalPeriod,FiscalYearPeriod,AmountInCompanyCodeCurrency,CompanyCodeCurrency&$top=5&$format=json`);
  out.push('SAMPLE:', r1.status, JSON.stringify(r1.body?.d?.results || r1.body, null, 2));

  for (const yr of ['2026', '2025', '2024']) {
    const r = await get(`${BASE}/API_JOURNALENTRYITEMBASIC_SRV/A_JournalEntryItemBasic/$count?$filter=LedgerFiscalYear eq '${yr}'`);
    out.push(`COUNT LedgerFiscalYear=${yr}: status=${r.status} body=${JSON.stringify(r.body).slice(0,200)}`);
  }
  const r2 = await get(`${BASE}/API_JOURNALENTRYITEMBASIC_SRV/A_JournalEntryItemBasic?$select=CompanyCode&$top=1&$orderby=LedgerFiscalYear desc&$format=json`);
  out.push('LATEST FY SAMPLE', r2.status, JSON.stringify(r2.body?.d?.results || r2.body));

  fs.writeFileSync('probe2.txt', out.join('\n\n'), 'utf8');
  console.log('done, wrote probe2.txt, length', out.join('\n').length);
})();
