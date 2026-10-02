const APP_URL = 'http://localhost:3000/api/gemini/query';
const DECIDE_URL = 'http://localhost:3000/api/fico-action/decide';

async function callChat(question) {
  const res = await fetch(APP_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: question, userRole: 'Functional Consultant', history: [], backendTarget: 'BOTH' }) });
  const raw = await res.text();
  const lines = raw.split('\n').map(s => s.trim()).filter(Boolean);
  for (const line of lines.reverse()) {
    try { const parsed = JSON.parse(line); if (parsed?.type === 'result') return { text: parsed.text || '', type: parsed.toolResults?.[0]?.type || '', data: parsed.toolResults?.[0]?.data }; } catch {}
  }
  return { text: '', type: '' };
}

async function decide(proposalId, decision) {
  const res = await fetch(DECIDE_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ proposalId, decision }) });
  return res.json();
}

// 1) Build a Create Vendor Invoice proposal, then REJECT it (verify reject path, no live write).
const p1 = await callChat('Create a vendor invoice for vendor 17300001 amount 500 USD.');
console.log('=== Create Vendor Invoice proposal ===');
console.log('proposalId:', p1.data?.proposalId, 'proposedChange:', JSON.stringify(p1.data?.proposedChange));
const rejectResult = await decide(p1.data?.proposalId, 'reject');
console.log('REJECT result:', JSON.stringify(rejectResult));

// 2) Build a Release Blocked Vendor Invoice proposal, then APPROVE it (real live write).
const p2 = await callChat('Release blocked vendor invoice 5100000131.');
console.log('\n=== Release Blocked Vendor Invoice proposal ===');
console.log('proposalId:', p2.data?.proposalId, 'target:', p2.data?.targetId, 'currentState:', JSON.stringify(p2.data?.currentState));
const approveResult = await decide(p2.data?.proposalId, 'approve');
console.log('APPROVE result:', JSON.stringify(approveResult));
