import fs from 'node:fs';
import https from 'node:https';

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
const agent = new https.Agent({ rejectUnauthorized: false });

async function get(pathAndQuery) {
  const url = `${BASE}${pathAndQuery}`;
  try {
    const res = await fetch(url, { headers: { Authorization: auth, Accept: 'application/json' }, agent });
    const status = res.status;
    let body;
    try { body = await res.text(); } catch { body = ''; }
    return { status, body: body.slice(0, 500) };
  } catch (e) {
    return { status: 'ERR', body: String(e).slice(0, 300) };
  }
}

const candidates = [
  '/API_CUSTOMERINVOICE_PROCESS_SRV/$metadata',
  '/API_OPLACCTGDOCITEMCUST_SRV/$metadata',
  '/API_ACCOUNTINGDOCUMENTITEMCUST_SRV/$metadata',
  '/API_RECV_ACCOUNT_SRV/$metadata',
  '/API_CUSTOMER_SRV/$metadata',
  '/API_CUSTOMER_INVOICE_SRV/$metadata',
  '/API_COLLECTIVE_BILL_SRV/$metadata',
  '/API_DUNNING_SRV/$metadata',
  '/API_CREDITMGMT_BASIC_SRV/$metadata',
  '/API_CREDITMGMT_SCORE_SRV/$metadata',
  '/API_CASHDISCOUNT_SRV/$metadata',
  '/API_CUSTOMERRETURNS_SRV/$metadata',
];

(async () => {
  console.log('=== AR/Customer candidate service probes ===');
  for (const c of candidates) {
    const r = await get(c);
    console.log(c, '->', r.status, r.status !== 200 ? r.body.replace(/\n/g, ' ').slice(0, 160) : 'OK');
  }

  console.log('\n=== A_JournalEntryItemBasic full metadata (field names) ===');
  const meta = await get('/API_JOURNALENTRYITEMBASIC_SRV/$metadata');
  if (meta.status === 200) {
    // crude extraction of Property Name= occurrences within the A_JournalEntryItemBasicType
    fs.writeFileSync('test-results/je_item_basic_metadata.xml', meta.body);
    console.log('metadata status 200, saved partial to test-results/je_item_basic_metadata.xml (truncated by probe)');
  } else {
    console.log('metadata status', meta.status);
  }

  console.log('\n=== Full metadata fetch without truncation (raw https) ===');
  const fullMetaUrl = `${BASE}/API_JOURNALENTRYITEMBASIC_SRV/$metadata`;
  const res2 = await fetch(fullMetaUrl, { headers: { Authorization: auth, Accept: 'application/xml' }, agent });
  const fullBody = await res2.text();
  fs.writeFileSync('test-results/je_item_basic_metadata_full.xml', fullBody);
  const props = [...fullBody.matchAll(/<Property Name="([^"]+)"/g)].map(m => m[1]);
  console.log('Distinct property names on this service:', [...new Set(props)].join(', '));
})();
