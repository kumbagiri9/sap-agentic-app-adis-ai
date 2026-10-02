import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Code, 
  Lock, 
  FileCode, 
  Database, 
  Globe, 
  Key, 
  Terminal, 
  CheckCircle2, 
  Wrench, 
  Sparkles, 
  ArrowRight, 
  Check, 
  Copy, 
  Eye, 
  ExternalLink,
  Shield,
  FileSpreadsheet
} from 'lucide-react';

interface Props {
  data: any;
}

export const AbapSecurityAnalysisCard: React.FC<Props> = ({ data }) => {
  const [activeSeverity, setActiveSeverity] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM'>('ALL');
  const [selectedVulnerability, setSelectedVulnerability] = useState<string | null>(null);
  const [appliedFixes, setAppliedFixes] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!data) return null;

  const vulnerabilities = data.vulnerabilities || [];
  const targetObject = data.targetObject || 'ZUSER_EXPORT';
  const score = data.securityScore ?? 38;

  const filteredVulnerabilities = vulnerabilities.filter((v: any) => {
    if (activeSeverity === 'ALL') return true;
    return v.severity === activeSeverity;
  });

  const handleApplyFix = (id: string) => {
    setAppliedFixes(prev => ({ ...prev, [id]: true }));
  };

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getVulnerabilityIcon = (type: string) => {
    switch (type) {
      case 'MISSING_AUTHORIZATION_CHECK':
        return <Lock className="w-4 h-4 text-rose-400" />;
      case 'UNSAFE_DYNAMIC_SQL':
        return <Database className="w-4 h-4 text-purple-400" />;
      case 'UNRESTRICTED_FILE_ACCESS':
        return <FileSpreadsheet className="w-4 h-4 text-amber-400" />;
      case 'INSECURE_RFC_CALL':
        return <Globe className="w-4 h-4 text-cyan-400" />;
      case 'HARDCODED_CREDENTIALS':
        return <Key className="w-4 h-4 text-rose-400" />;
      case 'UNSAFE_EXTERNAL_COMMAND':
        return <Terminal className="w-4 h-4 text-orange-400" />;
      case 'DIRECT_TABLE_UPDATE':
        return <Database className="w-4 h-4 text-amber-400" />;
      case 'WEAK_INPUT_VALIDATION':
        return <Code className="w-4 h-4 text-blue-400" />;
      default:
        return <ShieldAlert className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 font-sans my-4">
      {/* HEADER SECTION */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950/80 to-slate-900 p-6 border-b border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-rose-600/20 border border-rose-500/30 rounded-xl text-rose-400 shadow-lg shadow-rose-950/40">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold tracking-tight text-white">
                  ABAP Code Security Audit
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-rose-400 animate-pulse" />
                  S/4HANA Security Inspector
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Audited Object: <span className="font-mono font-bold text-cyan-300">{targetObject}</span> • Type: <span className="font-mono text-amber-300">{data.targetObjectType || 'PROG'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 px-4 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Security Score</span>
              <span className={`text-xl font-extrabold ${score < 50 ? 'text-rose-400' : score < 75 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {score} / 100
              </span>
            </div>
            <span className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5 shadow-lg shadow-rose-950/30">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              {data.riskLevel || 'CRITICAL_SECURITY_RISK'}
            </span>
          </div>
        </div>

        {/* SUMMARY BAR */}
        <div className="mt-5 bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <p className="text-sm font-medium text-slate-200 leading-relaxed">
            {data.summary}
          </p>
          <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-slate-800 text-xs">
            <span className="text-slate-400 font-semibold">Detected Security Vulnerabilities:</span>
            <span className="px-2.5 py-0.5 rounded-full font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              {data.vulnerabilityCounts?.critical || 0} Critical
            </span>
            <span className="px-2.5 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {data.vulnerabilityCounts?.high || 0} High
            </span>
            <span className="px-2.5 py-0.5 rounded-full font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {data.vulnerabilityCounts?.medium || 0} Medium
            </span>
            <span className="ml-auto text-slate-400 font-mono text-[11px]">
              Compliance: SAP Security Baseline 2026
            </span>
          </div>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex border-b border-slate-800 bg-slate-900/50 px-4 pt-3 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveSeverity('ALL')}
          className={`px-4 py-2 text-xs font-bold rounded-t-xl border-t border-x transition-colors ${
            activeSeverity === 'ALL'
              ? 'bg-slate-950 border-slate-800 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          All Vulnerabilities ({vulnerabilities.length})
        </button>
        <button
          onClick={() => setActiveSeverity('CRITICAL')}
          className={`px-4 py-2 text-xs font-bold rounded-t-xl border-t border-x transition-colors ${
            activeSeverity === 'CRITICAL'
              ? 'bg-slate-950 border-slate-800 text-rose-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Critical ({data.vulnerabilityCounts?.critical || 0})
        </button>
        <button
          onClick={() => setActiveSeverity('HIGH')}
          className={`px-4 py-2 text-xs font-bold rounded-t-xl border-t border-x transition-colors ${
            activeSeverity === 'HIGH'
              ? 'bg-slate-950 border-slate-800 text-amber-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          High ({data.vulnerabilityCounts?.high || 0})
        </button>
        <button
          onClick={() => setActiveSeverity('MEDIUM')}
          className={`px-4 py-2 text-xs font-bold rounded-t-xl border-t border-x transition-colors ${
            activeSeverity === 'MEDIUM'
              ? 'bg-slate-950 border-slate-800 text-blue-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Medium ({data.vulnerabilityCounts?.medium || 0})
        </button>
      </div>

      {/* VULNERABILITY LIST */}
      <div className="p-6 space-y-6">
        {filteredVulnerabilities.map((vuln: any) => {
          const isFixed = appliedFixes[vuln.id];

          return (
            <div 
              key={vuln.id}
              className={`bg-slate-900 border rounded-xl overflow-hidden transition-all ${
                isFixed ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* VULNERABILITY HEADER */}
              <div className="p-4 bg-slate-950/80 border-b border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                    {getVulnerabilityIcon(vuln.vulnerabilityType)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white">{vuln.title}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        vuln.severity === 'CRITICAL' 
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : vuln.severity === 'HIGH'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {vuln.severity}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                        {vuln.cweId}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 font-mono">
                      Location: <span className="text-cyan-300 font-bold">{vuln.location}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isFixed ? (
                    <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Remediation Applied
                    </span>
                  ) : (
                    <button
                      onClick={() => handleApplyFix(vuln.id)}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5 shadow-lg shadow-rose-950/40 transition-colors"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      Auto-Remediate Vulnerability
                    </button>
                  )}
                </div>
              </div>

              {/* DETAILS BODY */}
              <div className="p-4 space-y-4 text-xs">
                {/* IMPACT */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                  <span className="font-bold text-rose-300 uppercase tracking-wider block text-[10px] mb-1">
                    Risk & Threat Impact
                  </span>
                  <p className="text-slate-300 leading-relaxed">{vuln.impact}</p>
                </div>

                {/* SIDE-BY-SIDE CODE COMPARISON */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* VULNERABLE CODE */}
                  <div className="bg-slate-950 rounded-lg border border-rose-900/40 overflow-hidden">
                    <div className="bg-rose-950/40 px-3 py-2 border-b border-rose-900/40 flex items-center justify-between">
                      <span className="font-bold text-rose-300 flex items-center gap-1.5 text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        Vulnerable ABAP Code
                      </span>
                      <button
                        onClick={() => handleCopyCode(`vuln-${vuln.id}`, vuln.vulnerableCode)}
                        className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
                      >
                        {copiedId === `vuln-${vuln.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        Copy
                      </button>
                    </div>
                    <pre className="p-3 text-[11px] font-mono text-rose-200/90 overflow-x-auto whitespace-pre leading-relaxed bg-slate-950">
                      {vuln.vulnerableCode}
                    </pre>
                  </div>

                  {/* REMEDIATED CODE */}
                  <div className="bg-slate-950 rounded-lg border border-emerald-900/40 overflow-hidden">
                    <div className="bg-emerald-950/40 px-3 py-2 border-b border-emerald-900/40 flex items-center justify-between">
                      <span className="font-bold text-emerald-300 flex items-center gap-1.5 text-[11px]">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        Remediated Secure ABAP Code
                      </span>
                      <button
                        onClick={() => handleCopyCode(`rem-${vuln.id}`, vuln.remediatedCode)}
                        className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
                      >
                        {copiedId === `rem-${vuln.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        Copy
                      </button>
                    </div>
                    <pre className="p-3 text-[11px] font-mono text-emerald-200/90 overflow-x-auto whitespace-pre leading-relaxed bg-slate-950">
                      {vuln.remediatedCode}
                    </pre>
                  </div>
                </div>

                {/* RECOMMENDATION */}
                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-400 shrink-0" />
                    <span className="text-slate-300 font-medium">
                      <strong className="text-purple-300">Recommendation:</strong> {vuln.recommendation}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
