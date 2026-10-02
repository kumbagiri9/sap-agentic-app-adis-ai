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
  const res = await fetch(url, { headers: { Authorization: auth, Accept: 'application/xml' } });
  const status = res.status;
  const body = await res.text();
  return { status, body };
}

(async () => {
  const r = await get(`${BASE}/API_JOURNALENTRYITEMBASIC_SRV/$metadata`);
  fs.writeFileSync('probe_metadata.xml', r.body, 'utf8');
  console.log('status', r.status, 'length', r.body.length);

  // Extract EntityType properties for A_JournalEntryItemBasicType
  const m = r.body.match(/<EntityType Name="A_JournalEntryItemBasicType"[\s\S]*?<\/EntityType>/);
  if (m) {
    const props = [...m[0].matchAll(/<Property Name="([^"]+)" Type="([^"]+)"/g)].map(x => `${x[1]} (${x[2]})`);
    fs.writeFileSync('probe_props.txt', props.join('\n'), 'utf8');
    console.log('PROP_COUNT', props.length);
  } else {
    console.log('EntityType not found in metadata');
  }
})();
