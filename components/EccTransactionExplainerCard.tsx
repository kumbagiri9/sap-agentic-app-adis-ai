import React from 'react';
import { 
  CheckCircle2, 
  ShieldCheck, 
  Database, 
  Server, 
  FileText, 
  Copy, 
  ExternalLink,
  Info,
  Clock,
  UserCheck
} from 'lucide-react';
import { SapTransactionExplanation } from '../types';

interface EccTransactionExplainerCardProps {
  explanation: SapTransactionExplanation;
  compact?: boolean;
  onViewRawJson?: () => void;
}

export const EccTransactionExplainerCard: React.FC<EccTransactionExplainerCardProps> = ({
  explanation,
  compact = false,
  onViewRawJson
}) => {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = () => {
    const text = [
      `✓ Action performed: ${explanation.actionPerformed}`,
      `✓ SAP object/document number: ${explanation.sapObject.objectType} ${explanation.sapObject.documentNumber}`,
      `✓ SAP system/client: ${explanation.sapSystem.systemId} / Client ${explanation.sapSystem.client} [${explanation.sapSystem.environment}]`,
      `✓ Validation performed: ${explanation.validationPerformed.checks.join('; ')}`
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getEnvBadge = (env: string) => {
    switch (env) {
      case 'PRD':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'QA':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      case 'UAT':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'DEV':
      default:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <div id={`tx-explanation-${explanation.explanationId}`} className="bg-slate-900 border border-slate-700/80 rounded-xl p-4 shadow-lg text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white tracking-wide">Standard Transaction Explanation</span>
              <span className={`text-xs px-2 py-0.5 rounded border font-mono font-medium ${getEnvBadge(explanation.sapSystem.environment)}`}>
                {explanation.sapSystem.environment}
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono">ID: {explanation.explanationId}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1 text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition"
            title="Copy formatted 4-point explanation"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
          {onViewRawJson && (
            <button
              onClick={onViewRawJson}
              className="flex items-center gap-1 text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Standard Checks (Requirement 31) */}
      <div className="space-y-3 font-sans">
        {/* 1. Action Performed */}
        <div className="flex items-start gap-2.5 bg-slate-800/40 p-2.5 rounded-lg border border-slate-800">
          <div className="text-emerald-400 font-bold text-base leading-none mt-0.5">✓</div>
          <div className="flex-1">
            <div className="text-xs uppercase font-semibold tracking-wider text-slate-400">Action performed</div>
            <div className="text-sm font-medium text-white mt-0.5">
              {explanation.actionPerformed}
            </div>
          </div>
        </div>

        {/* 2. SAP Object / Document Number */}
        <div className="flex items-start gap-2.5 bg-slate-800/40 p-2.5 rounded-lg border border-slate-800">
          <div className="text-emerald-400 font-bold text-base leading-none mt-0.5">✓</div>
          <div className="flex-1">
            <div className="text-xs uppercase font-semibold tracking-wider text-slate-400">SAP object/document number</div>
            <div className="text-sm font-semibold text-emerald-400 font-mono mt-0.5 flex items-center gap-2">
              <span>{explanation.sapObject.documentNumber}</span>
              <span className="text-xs px-2 py-0.5 bg-slate-700 text-slate-300 rounded font-normal font-sans">
                {explanation.sapObject.objectType}
              </span>
              {explanation.sapObject.subItemsCount !== undefined && (
                <span className="text-xs text-slate-400 font-sans">({explanation.sapObject.subItemsCount} Items)</span>
              )}
            </div>
          </div>
        </div>

        {/* 3. SAP System / Client */}
        <div className="flex items-start gap-2.5 bg-slate-800/40 p-2.5 rounded-lg border border-slate-800">
          <div className="text-emerald-400 font-bold text-base leading-none mt-0.5">✓</div>
          <div className="flex-1">
            <div className="text-xs uppercase font-semibold tracking-wider text-slate-400">SAP system/client</div>
            <div className="text-sm font-mono text-white mt-0.5 flex items-center gap-2">
              <span className="font-semibold text-sky-400">{explanation.sapSystem.systemId}</span>
              <span className="text-slate-500">/</span>
              <span className="text-amber-400 font-semibold">Client {explanation.sapSystem.client}</span>
              <span className="text-xs px-1.5 py-0.5 bg-slate-800 border border-slate-700 text-slate-300 rounded">
                Env: {explanation.sapSystem.environment}
              </span>
            </div>
            <div className="text-xs text-slate-400 font-mono mt-0.5">
              Host: <span className="text-slate-300">{explanation.sapSystem.systemHost}</span> | User: <span className="text-slate-300">{explanation.sapSystem.executingUser}</span>
            </div>
          </div>
        </div>

        {/* 4. Validation Performed */}
        <div className="flex items-start gap-2.5 bg-slate-800/40 p-2.5 rounded-lg border border-slate-800">
          <div className="text-emerald-400 font-bold text-base leading-none mt-0.5">✓</div>
          <div className="flex-1">
            <div className="text-xs uppercase font-semibold tracking-wider text-slate-400">Validation performed</div>
            <div className="text-sm text-slate-200 mt-0.5 leading-relaxed">
              {explanation.validationPerformed.environmentPolicySummary}
            </div>
            {explanation.validationPerformed.checks && explanation.validationPerformed.checks.length > 0 && (
              <div className="mt-1.5 space-y-1">
                {explanation.validationPerformed.checks.map((detail, idx) => (
                  <div key={idx} className="text-xs text-slate-300 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                    <span>{detail}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer / Status Verification */}
      <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Verdict: <span className="text-emerald-400 font-semibold">{explanation.validationPerformed.safetyInterceptorVerdict}</span> (Tier: {explanation.validationPerformed.safetyRiskTier})</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>{new Date(explanation.timestamp).toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
};
