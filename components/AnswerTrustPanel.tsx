import React, { useState } from 'react';

interface AnswerProvenance {
  kind: 'live' | 'system' | 'knowledge' | 'not_available' | 'error' | 'demo';
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

const STYLE: Record<AnswerProvenance['kind'], { label: string; icon: string; box: string; badge: string }> = {
  live: { label: 'Live SAP data', icon: 'fa-solid fa-circle-check', box: 'border-emerald-200 bg-emerald-50/60', badge: 'bg-emerald-600 text-white' },
  system: { label: 'SAP system tools', icon: 'fa-solid fa-server', box: 'border-sky-200 bg-sky-50/60', badge: 'bg-sky-600 text-white' },
  knowledge: { label: 'SAP know-how', icon: 'fa-solid fa-book-open', box: 'border-indigo-200 bg-indigo-50/60', badge: 'bg-indigo-600 text-white' },
  not_available: { label: 'Not available live', icon: 'fa-solid fa-circle-info', box: 'border-amber-200 bg-amber-50/70', badge: 'bg-amber-500 text-white' },
  error: { label: 'Could not reach SAP', icon: 'fa-solid fa-plug-circle-xmark', box: 'border-rose-200 bg-rose-50/70', badge: 'bg-rose-600 text-white' },
  demo: { label: 'Demo content', icon: 'fa-solid fa-flask', box: 'border-violet-200 bg-violet-50/70', badge: 'bg-violet-600 text-white' }
};

// "Where did this answer come from" strip shown under an assistant answer, written for non-technical users.
export const AnswerTrustPanel: React.FC<{ provenance?: AnswerProvenance; onAsk?: (question: string) => void }> = ({ provenance, onAsk }) => {
  const [open, setOpen] = useState(false);
  if (!provenance || !STYLE[provenance.kind]) return null;
  const s = STYLE[provenance.kind];
  const time = (() => { const d = new Date(provenance.answeredAt); return isNaN(d.getTime()) ? '' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); })();
  const facts = [
    provenance.system,
    provenance.channel,
    typeof provenance.records === 'number' && (provenance.kind === 'live' || provenance.kind === 'system') ? `${provenance.records.toLocaleString()} row(s) shown` : '',
    time ? `at ${time}` : '',
    provenance.durationMs ? `took ${(provenance.durationMs / 1000).toFixed(1)}s` : ''
  ].filter(Boolean);

  return (
    <div className={`mt-1 rounded-xl border ${s.box} px-4 py-3 text-slate-700`} aria-label="Where this answer came from">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${s.badge}`}>
          <i className={s.icon} aria-hidden="true"></i>{s.label}
        </span>
        <span className="text-[13px] font-semibold text-slate-800">{provenance.headline}</span>
      </div>
      {facts.length > 0 && <div className="mt-1.5 text-[11px] text-slate-500">{facts.join(' \u00b7 ')}</div>}
      {provenance.whatYouCanDo && (
        <div className="mt-2 text-[12.5px] text-slate-700"><span className="font-bold">What you can do: </span>{provenance.whatYouCanDo}</div>
      )}
      {provenance.suggestions?.length > 0 && onAsk && (
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500">You can also ask:</span>
          {provenance.suggestions.map(q => (
            <button key={q} type="button" onClick={() => onAsk(q)} className="rounded-full border border-slate-300 bg-white px-3 py-1 text-[11.5px] font-medium text-slate-700 hover:border-blue-400 hover:text-blue-700 cursor-pointer">
              {q}
            </button>
          ))}
        </div>
      )}
      {provenance.sources?.length > 0 && (
        <div className="mt-2">
          <button type="button" onClick={() => setOpen(o => !o)} className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 cursor-pointer" aria-expanded={open}>
            <i className={`fa-solid ${open ? 'fa-chevron-up' : 'fa-chevron-down'} mr-1`} aria-hidden="true"></i>Technical details
          </button>
          {open && (
            <ul className="mt-1.5 list-disc pl-5 text-[11px] text-slate-500">
              {provenance.sources.map(src => <li key={src}>{src}</li>)}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
