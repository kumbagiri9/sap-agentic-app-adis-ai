import { LIVE_INTENT_CATALOG, type LiveModule } from './liveIntentCatalog';

export type AnswerKind = 'live' | 'system' | 'knowledge' | 'not_available' | 'error' | 'demo';

export interface AnswerProvenance {
  kind: AnswerKind;
  headline: string;
  system?: string;
  channel?: string;
  records?: number;
  sources: string[];
  whatYouCanDo?: string;
  suggestions: string[];
  answeredAt: string;
  durationMs: number;
}

type Result = { text: string; toolResults: any[] };

const KNOWLEDGE_TYPES = new Set(['gui_card', 'ecc_transactions', 'kb_search', 'download_doc', 'ecc_tcode_launcher']);
const UNAVAILABLE_TYPES = new Set(['fico_service_unavailable', 'hana_db_unavailable']);
const SQL_TOOLS = new Set(['basisLiveData', 'securityLiveData', 'bwLiveData', 'tmLiveData', 'abapLiveData', 'hanaDbIntelligence']);
const MODULE_BY_TOOL: Record<string, LiveModule> = { basisLiveData: 'BASIS', securityLiveData: 'SECURITY', bwLiveData: 'BW', tmLiveData: 'TM', abapLiveData: 'ABAP', queryAdtRaw: 'ABAP' };

function isEcc(r: any): boolean {
  return /ecc/i.test(r?.toolName || '') || /ecc/i.test(r?.agentName || '') || /^ecc_/i.test(r?.type || '');
}

function channelOf(r: any): string | undefined {
  const name = String(r?.toolName || '');
  if (isEcc(r)) return 'SAP ECC remote function call (RFC)';
  if (SQL_TOOLS.has(name)) return 'Read-only database query';
  if (name === 'queryAdtRaw') return 'SAP development repository (ADT)';
  if (/odata|^query(live)?s8h|^query(ewm|tm|bw)v|gateway|userservice/i.test(name)) return 'SAP OData API';
  return undefined;
}

function recordCount(r: any): number {
  const d = r?.data;
  const arr = Array.isArray(d) ? d : [d?.rows, d?.results, d?.records, d?.items, d?.idocs, d?.dataRows].find(Array.isArray);
  return Array.isArray(arr) ? arr.length : 0;
}

function plainReason(text: string, ecc: boolean): string {
  if (/logon failed|connection status \d|rfc[_ ]read_table failed|rfc.*(failed|error)/i.test(text)) {
    return `I could not log on to the ${ecc ? 'SAP ECC' : 'SAP'} system just now, so no data was read and nothing was changed. Try again in a few minutes; if it keeps happening, ask your SAP Basis team to check the system connection and the technical user.`;
  }
  if (/timed? ?out|etimedout|econnrefused|enotfound|gateway timeout/i.test(text)) {
    return 'The SAP system did not respond in time, so no data was read. Try again in a few minutes; if it keeps happening, ask your SAP Basis team whether the system is up.';
  }
  if (/\b429\b|quota|resource_exhausted|rate limit/i.test(text)) {
    return 'The AI service is busy right now. Wait a minute and ask again.';
  }
  if (/403|no service found|not deployed|not activated|not authori[sz]ed|not installed|not connected/i.test(text)) {
    return 'Your SAP system does not provide this information (the SAP service for it is not switched on or not authorized for this app). Nothing was made up. If you need it, ask your SAP Basis team to activate it.';
  }
  return 'The connected SAP system has no live source for this question, so no answer was invented. Try asking about a specific document, transaction or report.';
}

function pickSuggestions(modules: LiveModule[], query: string): string[] {
  if (!modules.length) return [];
  const q = query.trim().toLowerCase().replace(/[?.!]+$/, '');
  const pool = LIVE_INTENT_CATALOG.filter(e => modules.includes(e.module))
    .map(e => e.examples[0])
    .filter(ex => !/\bthis\b|\bthese\b|\buser\s+[a-z0-9_]+\b/i.test(ex) && ex.toLowerCase().replace(/[?.!]+$/, '') !== q);
  if (!pool.length) return [];
  let seed = 0;
  for (const c of q) seed = (seed * 31 + c.charCodeAt(0)) >>> 0;
  const out: string[] = [];
  for (let i = 0; out.length < Math.min(3, pool.length) && i < pool.length * 2; i++) {
    const s = pool[(seed + i * 7) % pool.length];
    if (!out.includes(s)) out.push(s);
  }
  return out;
}

// Plain-language "where did this answer come from" summary, built only from what the request actually returned.
export function buildAnswerProvenance(query: string, result: Result, durationMs: number, isSimulatedTool: (name?: string) => boolean): AnswerProvenance {
  const results = Array.isArray(result?.toolResults) ? result.toolResults : [];
  const text = String(result?.text || '');
  const base = { answeredAt: new Date().toISOString(), durationMs, sources: [] as string[], suggestions: [] as string[] };
  const ecc = results.some(isEcc) || /\bin ecc\b|\bfrom ecc\b|\becc\b.*client 800/i.test(query);
  const system = ecc ? 'SAP ECC 6.0 (client 800)' : 'SAP S/4HANA (client 100)';
  const modules = [...new Set(results.map(r => MODULE_BY_TOOL[r?.toolName]).filter(Boolean))] as LiveModule[];
  const sources = [...new Set(results.map(r => r?.data?.reportTitle || r?.data?.service || r?.toolName).filter(Boolean).map(String))].slice(0, 8);

  if (results.some(r => isSimulatedTool(r?.toolName))) {
    return { ...base, kind: 'demo', headline: 'Part of this answer is illustrative demo content, not data from your SAP system.', system, sources, whatYouCanDo: 'Use the figures only as an example. Ask about a specific document, transaction or report to get live data.' };
  }

  const errorResult = results.find(r => r?.type === 'error');
  const liveResults = results.filter(r => r?.type !== 'error' && !UNAVAILABLE_TYPES.has(r?.type) && !KNOWLEDGE_TYPES.has(r?.type) && r?.data);
  if ((errorResult && !liveResults.length) || /^\[LIVE_SAP_UNAVAILABLE\]|^live sap request could not be completed/i.test(text)) {
    const reasonText = `${text} ${errorResult?.data?.error || ''}`;
    return { ...base, kind: 'error', headline: `The ${ecc ? 'SAP ECC' : 'SAP'} system could not be reached for this question.`, system, sources, whatYouCanDo: plainReason(reasonText, ecc) };
  }

  if (results.length && results.every(r => UNAVAILABLE_TYPES.has(r?.type))) {
    const reasonText = `${text} ${results.map(r => r?.data?.reason || '').join(' ')}`;
    return { ...base, kind: 'not_available', headline: 'This information is not available live in your SAP system, so nothing was made up.', system, sources, whatYouCanDo: plainReason(reasonText, ecc), suggestions: pickSuggestions(modules, query) };
  }

  if (liveResults.length) {
    // Sections of one report (e.g. totals plus breakdowns) overlap, so the largest table is the record count.
    const records = liveResults.reduce((m, r) => Math.max(m, recordCount(r)), 0);
    const channels = [...new Set(liveResults.map(channelOf).filter(Boolean))] as string[];
    const where = ecc ? 'your SAP ECC system' : 'your S/4HANA system';
    const known = channels.length > 0;
    return {
      ...base,
      kind: known ? 'live' : 'system',
      headline: known
        ? (records > 0 ? `Answered from live data read from ${where} just now (${records.toLocaleString()} row(s) shown).` : `Checked ${where} live just now: no matching records were found (this is a real result, not an error).`)
        : `Answered using SAP system tools on ${where}.`,
      system,
      channel: channels.join(' + ') || undefined,
      records,
      sources,
      suggestions: pickSuggestions(modules, query)
    };
  }

  return {
    ...base,
    kind: 'knowledge',
    headline: 'Answered from general SAP know-how (how SAP works), not from your system\u2019s business data.',
    system: ecc ? 'SAP ECC 6.0' : undefined,
    sources,
    whatYouCanDo: 'Steps, T-codes and field names follow SAP standard; your company\u2019s configuration may differ slightly.'
  };
}
