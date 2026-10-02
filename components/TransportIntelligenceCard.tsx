import React, { useState } from 'react';
import { 
  GitBranch, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle, 
  Code, 
  Layers, 
  Cpu, 
  Terminal, 
  FileText, 
  ArrowRight, 
  RefreshCw, 
  Search, 
  Clock, 
  Zap, 
  AlertOctagon, 
  Check, 
  Copy, 
  ExternalLink 
} from 'lucide-react';

interface Props {
  data: any;
}

export const TransportIntelligenceCard: React.FC<Props> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'safety' | 'locator' | 'changes' | 'dependencies' | 'versions' | 'incident' | 'overlaps' | 'syntax'>('safety');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  if (!data) return null;

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const isBlocked = data.productionSafetyGovernance?.overallVerdict === 'BLOCKED_HIGH_RISK';

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 font-sans my-4">
      {/* HEADER BAR */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 border-b border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-400">
              <GitBranch className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold tracking-tight text-white">
                  ABAP Transport Intelligence & Deployment Governance
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                  Basis Transport Agent Collaboration
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Transport Request: <span className="font-mono font-bold text-amber-300">{data.targetTransport}</span> • Object: <span className="font-mono font-bold text-cyan-300">{data.targetObject}</span>
              </p>
            </div>
          </div>

          {/* VERDICT BADGE */}
          <div className="flex items-center gap-2">
            {isBlocked ? (
              <span className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5 shadow-lg shadow-rose-950/30">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                BLOCKED: HIGH DEPLOYMENT RISK
              </span>
            ) : (
              <span className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 shadow-lg shadow-emerald-950/30">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                SAFE FOR PRODUCTION IMPORT
              </span>
            )}
          </div>
        </div>

        {/* SYSTEM CONTEXT BAR */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
            <span className="text-xs font-semibold text-slate-400 block">DEV System</span>
            <span className="text-sm font-bold text-blue-300 font-mono">{data.systemContext?.devSystem || 'S4H Client 100'}</span>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
            <span className="text-xs font-semibold text-slate-400 block">QA System</span>
            <span className="text-sm font-bold text-purple-300 font-mono">{data.systemContext?.qaSystem || 'S4Q Client 200'}</span>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
            <span className="text-xs font-semibold text-slate-400 block">PRD System Target</span>
            <span className="text-sm font-bold text-emerald-300 font-mono">{data.systemContext?.prdSystem || 'S4P Client 800'}</span>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex border-b border-slate-800 bg-slate-900/50 px-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('safety')}
          className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'safety' ? 'border-blue-500 text-blue-400 bg-blue-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Production Safety Gates</span>
        </button>

        <button
          onClick={() => setActiveTab('locator')}
          className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'locator' ? 'border-blue-500 text-blue-400 bg-blue-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Which Transport Contains Object?</span>
        </button>

        <button
          onClick={() => setActiveTab('changes')}
          className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'changes' ? 'border-blue-500 text-blue-400 bg-blue-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>What Changed?</span>
        </button>

        <button
          onClick={() => setActiveTab('dependencies')}
          className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'dependencies' ? 'border-blue-500 text-blue-400 bg-blue-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Dependent Objects</span>
        </button>

        <button
          onClick={() => setActiveTab('versions')}
          className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'versions' ? 'border-blue-500 text-blue-400 bg-blue-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          <span>Compare DEV & QA Versions</span>
        </button>

        <button
          onClick={() => setActiveTab('incident')}
          className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'incident' ? 'border-blue-500 text-blue-400 bg-blue-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Production Incident Link</span>
        </button>

        <button
          onClick={() => setActiveTab('overlaps')}
          className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'overlaps' ? 'border-blue-500 text-blue-400 bg-blue-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Overlapping Transports</span>
        </button>

        <button
          onClick={() => setActiveTab('syntax')}
          className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'syntax' ? 'border-blue-500 text-blue-400 bg-blue-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Syntax & Compilation Log</span>
        </button>
      </div>

      {/* TAB CONTENT */}
      <div className="p-6">
        {/* 1. SAFETY GATES TAB */}
        {activeTab === 'safety' && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
              <h3 className="text-md font-bold text-white mb-2 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
                Deployment Governance Safety Check
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {data.summary}
              </p>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.productionSafetyGovernance?.governanceGates?.map((gate: any, idx: number) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-200">{gate.gateName}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        gate.status === 'PASSED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        gate.status === 'WARNING' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {gate.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">{gate.details}</p>
                  </div>
                ))}
              </div>

              {data.productionSafetyGovernance?.remediationPathToProd && (
                <div className="mt-4 bg-amber-950/40 border border-amber-800/50 rounded-lg p-3.5">
                  <span className="text-xs font-bold text-amber-300 block mb-1">Required Remediation Path Before Release to PRD:</span>
                  <p className="text-xs text-amber-200/90 font-mono">{data.productionSafetyGovernance.remediationPathToProd}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. WHICH TRANSPORT CONTAINS OBJECT? */}
        {activeTab === 'locator' && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
              <h3 className="text-md font-bold text-white mb-3 flex items-center gap-2">
                <Search className="w-5 h-5 text-cyan-400" />
                Transport Locator for Object <span className="font-mono text-cyan-300">{data.objectTransportLocator?.objectName}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Primary Transport</span>
                  <span className="text-sm font-bold text-amber-300 font-mono">{data.objectTransportLocator?.activeTransport}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Owner</span>
                  <span className="text-sm font-bold text-slate-200">{data.objectTransportLocator?.owner}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Transport Status</span>
                  <span className="text-sm font-bold text-emerald-300">{data.objectTransportLocator?.transportStatus}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Package</span>
                  <span className="text-sm font-bold text-slate-200 font-mono">{data.objectTransportLocator?.package}</span>
                </div>
              </div>

              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Transports History containing this object:</h4>
              <div className="space-y-2 mb-5">
                {data.objectTransportLocator?.allTransportsContainingObject?.map((tr: any, idx: number) => (
                  <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-mono font-bold text-amber-300 text-sm mr-2">{tr.transportId}</span>
                      <span className="text-xs text-slate-300">{tr.description}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400">By: {tr.owner}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-blue-300 font-semibold">{tr.status}</span>
                    </div>
                  </div>
                ))}
              </div>

              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Contained Objects inside Transport <span className="font-mono text-amber-300">{data.targetTransport}</span>:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {data.objectTransportLocator?.containedObjectsInTransport?.map((obj: any, idx: number) => (
                  <div key={idx} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono font-bold text-cyan-300 mr-2">{obj.type} {obj.name}</span>
                      <p className="text-[11px] text-slate-400">{obj.description}</p>
                    </div>
                    <span className="px-1.5 py-0.5 text-[10px] bg-slate-800 text-slate-300 rounded font-mono">{obj.pgmid}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. WHAT CHANGED? */}
        {activeTab === 'changes' && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
              <h3 className="text-md font-bold text-white mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                Delta & Code Change Analysis for Transport <span className="font-mono text-amber-300">{data.transportDeltaAnalysis?.transportId}</span>
              </h3>
              <p className="text-xs text-slate-300 mb-4">{data.transportDeltaAnalysis?.summaryOfChanges}</p>

              <div className="space-y-3">
                {data.transportDeltaAnalysis?.objectLevelDiffs?.map((diff: any, idx: number) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono font-bold text-cyan-300 text-sm">{diff.objectName}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-emerald-400">+{diff.linesAdded} lines</span>
                        <span className="text-xs font-mono text-rose-400">-{diff.linesDeleted} lines</span>
                        <span className="px-2 py-0.5 bg-blue-900/40 text-blue-300 border border-blue-700/50 rounded text-[10px] font-semibold">{diff.changeType}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 font-mono bg-slate-900 p-2.5 rounded border border-slate-800">{diff.details}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. DEPENDENT OBJECTS */}
        {activeTab === 'dependencies' && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
              <h3 className="text-md font-bold text-white mb-3 flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-400" />
                Object Dependency & Impact Graph
              </h3>

              <div className="space-y-3 mb-5">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Direct ABAP Caller Dependencies:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {data.dependencyGraphAnalysis?.directDependents?.map((dep: any, idx: number) => (
                    <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="font-mono font-bold text-cyan-300 text-sm">{dep.objectName}</span>
                        <p className="text-[11px] text-slate-400">{dep.category} ({dep.type})</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        dep.risk === 'HIGH' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        Risk: {dep.risk}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Interfaces & Background Job Impacts:</h4>
                {data.dependencyGraphAnalysis?.interfaceConsumers?.map((itf: any, idx: number) => (
                  <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
                    <span className="font-bold text-purple-300">{itf.interfaceName}:</span> <span className="text-slate-300">{itf.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 5. COMPARE DEV AND QA VERSIONS */}
        {activeTab === 'versions' && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
              <h3 className="text-md font-bold text-white mb-3 flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-blue-400" />
                Multi-Environment Version Comparison Matrix
              </h3>

              <div className="space-y-3 mb-4">
                {data.environmentVersionMatrix?.versions?.map((ver: any, idx: number) => (
                  <div key={idx} className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <span className="text-sm font-bold text-white block">{ver.environment}</span>
                      <span className="text-xs font-mono text-cyan-300">{ver.version}</span>
                      <span className="text-xs text-slate-400 block mt-0.5">TR: <span className="text-amber-300 font-mono">{ver.transport}</span> • By: {ver.changedBy}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block">Clean Core Index</span>
                        <span className="text-sm font-bold text-emerald-400">{ver.cleanCoreScore}%</span>
                      </div>
                      <span className="px-2.5 py-1 rounded text-xs font-bold bg-slate-800 text-slate-200">{ver.status}</span>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs font-mono text-slate-300 bg-slate-950 p-3 rounded border border-slate-800">
                {data.environmentVersionMatrix?.codeDiffSummary}
              </p>
            </div>
          </div>
        )}

        {/* 6. INCIDENT CORRELATION LINK */}
        {activeTab === 'incident' && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
              <h3 className="text-md font-bold text-white mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                Production Incident & Short Dump Correlation Analysis
              </h3>

              {data.incidentCorrelationEngine?.causalCorrelationConfirmed ? (
                <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertOctagon className="w-4 h-4 text-rose-400" />
                      CONFIRMED INCIDENT CAUSE
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/30 text-rose-200">
                      100% Correlation Confidence
                    </span>
                  </div>

                  <p className="text-xs text-rose-100 font-mono">
                    Dump ID: {data.incidentCorrelationEngine.linkedDumpId} ({data.incidentCorrelationEngine.exceptionClass}) at line {data.incidentCorrelationEngine.failingLine} in program {data.incidentCorrelationEngine.programName}.
                  </p>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {data.incidentCorrelationEngine.rootCauseExplanation}
                  </p>

                  <div className="bg-slate-950 p-3 rounded border border-slate-800 text-xs font-mono text-emerald-300">
                    Suggested Fix: {data.incidentCorrelationEngine.suggestedRemediation}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400">No production dump correlated with this transport.</p>
              )}
            </div>
          </div>
        )}

        {/* 7. OVERLAPPING TRANSPORTS */}
        {activeTab === 'overlaps' && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
              <h3 className="text-md font-bold text-white mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                Transport Conflict & Overlap Detector
              </h3>

              <div className="space-y-3">
                {data.overlapConflictDetector?.overlappingPairs?.map((pair: any, idx: number) => (
                  <div key={idx} className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-cyan-300 text-sm">Object: {pair.objectName}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {pair.conflictRisk}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                      <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Transport A:</span>
                        <span className="text-amber-300 font-bold">{pair.transportA}</span> ({pair.ownerA}) • {pair.statusA}
                      </div>
                      <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Transport B:</span>
                        <span className="text-cyan-300 font-bold">{pair.transportB}</span> ({pair.ownerB}) • {pair.statusB}
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 bg-slate-900/60 p-2 rounded text-[11px]">
                      <span className="font-bold text-amber-300">Governance Recommendation:</span> {pair.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 8. SYNTAX & COMPILATION ERRORS */}
        {activeTab === 'syntax' && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
              <h3 className="text-md font-bold text-white mb-3 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-rose-400" />
                Transport Import Syntax Diagnostics & Automated Quick-Fix
              </h3>

              <div className="space-y-4">
                {data.transportSyntaxErrorDiagnostics?.errors?.map((err: any, idx: number) => (
                  <div key={idx} className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-rose-400 text-xs">{err.errorCode}: {err.objectName} (Line {err.line})</span>
                      <button 
                        onClick={() => handleCopyCode(`err-${idx}`, err.quickFixSnippet)}
                        className="px-2 py-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 rounded text-xs flex items-center gap-1 border border-blue-500/30"
                      >
                        {copiedCodeId === `err-${idx}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        Copy Fix Snippet
                      </button>
                    </div>

                    <p className="text-xs text-slate-300 font-mono bg-slate-900 p-2.5 rounded border border-slate-800">
                      {err.message}
                    </p>

                    <div className="bg-slate-900/90 p-2.5 rounded border border-emerald-900/50 text-xs font-mono text-emerald-300">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans mb-1">Quick-Fix Recommendation:</span>
                      {err.quickFixSnippet}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
