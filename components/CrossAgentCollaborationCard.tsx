import React, { useState } from 'react';
import { 
  Bot, 
  Workflow, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Zap, 
  Clock, 
  Database, 
  Server, 
  Truck, 
  Code, 
  Layers, 
  Activity, 
  ShieldAlert, 
  RefreshCw, 
  RotateCcw, 
  Sliders, 
  FileCode, 
  Sparkles,
  TrendingUp,
  Cpu
} from 'lucide-react';

interface Props {
  data: any;
}

export const CrossAgentCollaborationCard: React.FC<Props> = ({ data }) => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [remediationExecuted, setRemediationExecuted] = useState<boolean>(false);

  if (!data) return null;

  const rootCause = data.unifiedRootCause || {};
  const chain = data.collaborationChain || [];
  const remediation = data.remediationPlan || [];
  const state = data.orchestratorState || {};
  const health = data.systemHealth || {};

  const getAgentIcon = (id: string) => {
    switch (id) {
      case 'AGENT_SD': return <TrendingUp className="w-5 h-5 text-emerald-400" />;
      case 'AGENT_ABAP': return <Code className="w-5 h-5 text-sky-400" />;
      case 'AGENT_PERFORMANCE': return <Zap className="w-5 h-5 text-amber-400" />;
      case 'AGENT_HANA': return <Database className="w-5 h-5 text-purple-400" />;
      case 'AGENT_BASIS': return <Server className="w-5 h-5 text-rose-400" />;
      case 'AGENT_TRANSPORT': return <Truck className="w-5 h-5 text-cyan-400" />;
      default: return <Bot className="w-5 h-5 text-slate-400" />;
    }
  };

  const selectedChainStep = chain[activeStep] || chain[0];

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 font-sans my-4">
      {/* HEADER BAR */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950/40 to-slate-900 p-6 border-b border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-rose-600/20 border border-rose-500/30 rounded-xl text-rose-400 shadow-lg shadow-rose-950/40">
              <Workflow className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold tracking-tight text-white">
                  Cross-Agent Collaboration Diagnostic
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  Performance Spike Diagnosed
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Query: <span className="text-slate-200 font-medium">"{data.userQuery}"</span> • Confidence: <span className="font-mono text-emerald-400 font-bold">{state.confidenceScore || '99.8%'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex items-center gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Coordinating Agents</span>
                <span className="font-mono text-sky-300 font-bold">6 Specialized Agents</span>
              </div>
              <div className="h-6 w-px bg-slate-800"></div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Latency Increase</span>
                <span className="font-mono text-rose-400 font-bold">{rootCause.latencySpike}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SINGLE DEFINITIVE ROOT CAUSE HERO CARD */}
      <div className="p-6 border-b border-slate-800 bg-slate-900/40">
        <div className="bg-gradient-to-r from-rose-950/40 via-slate-900 to-amber-950/30 border border-rose-500/40 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-rose-500/20 border border-rose-500/30 rounded-lg text-rose-400 font-mono text-xs font-bold">
                ROOT CAUSE FOUND
              </span>
              <span className="text-xs text-slate-400 font-mono">TR: <strong className="text-rose-300">{rootCause.responsibleTransport}</strong> by <strong className="text-amber-300">{rootCause.responsibleUser}</strong></span>
            </div>
            <span className="text-xs font-mono text-slate-400">Deployed: {rootCause.deployTimestamp}</span>
          </div>

          <h3 className="text-base font-bold text-white leading-snug">
            {rootCause.headline}
          </h3>

          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 font-sans">
            {rootCause.details}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono pt-1">
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Transaction Impact</span>
              <span className="text-emerald-400 font-bold">VA01 Sales Order</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Latency Delta</span>
              <span className="text-rose-400 font-bold">1.25s ➔ 18.42s</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Root Cause Component</span>
              <span className="text-sky-300 font-bold">ZCL_SD_PARTNER_CREDIT_CHK</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">HANA Scanned Rows</span>
              <span className="text-purple-300 font-bold">14.82M Rows / Order</span>
            </div>
          </div>
        </div>
      </div>

      {/* SEQUENTIAL 6-AGENT COORDINATION FLOW */}
      <div className="p-6 border-b border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-sky-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              6-Agent Cross-Stack Diagnostic Flow
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Sequential Collaboration Matrix</span>
        </div>

        {/* STEP BUTTON NAVIGATION */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {chain.map((step: any, idx: number) => {
            const isActive = activeStep === idx;
            return (
              <button
                key={step.stepNumber}
                onClick={() => setActiveStep(idx)}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isActive 
                    ? 'bg-slate-900 border-sky-500 shadow-md shadow-sky-950/50 ring-1 ring-sky-500/50' 
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] font-bold text-slate-400">Step 0{step.stepNumber}</span>
                  {getAgentIcon(step.agentId)}
                </div>
                <span className="font-bold text-xs text-white line-clamp-1">{step.agentName}</span>
                <span className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{step.role}</span>
              </button>
            );
          })}
        </div>

        {/* ACTIVE AGENT STEP DRILLDOWN */}
        {selectedChainStep && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 transition-all">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg">
                  {getAgentIcon(selectedChainStep.agentId)}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">{selectedChainStep.agentName}</h4>
                  <p className="text-xs text-slate-400">{selectedChainStep.role}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {selectedChainStep.status}
              </span>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              {selectedChainStep.findings}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Impacted Objects / Layers</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedChainStep.impactedObjects?.map((obj: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/10 text-sky-300 border border-sky-500/20">
                      {obj}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px]">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Key Diagnostic Metrics</span>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  {Object.entries(selectedChainStep.metrics || {}).map(([k, v]: [string, any], i: number) => (
                    <div key={i}>
                      <span className="text-[9px] text-slate-500 block truncate uppercase">{k}</span>
                      <span className="text-amber-300 font-bold">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ACTIONABLE REMEDIATION ROADMAP */}
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Automated 3-Step Remediation Plan
            </h3>
          </div>
          {remediationExecuted ? (
            <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold rounded-lg flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Remediation Triggered & Transport Reverted
            </span>
          ) : (
            <button
              onClick={() => setRemediationExecuted(true)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/50 flex items-center gap-2 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Execute 1-Click Rollback & Refactor
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {remediation.map((item: any) => (
            <div key={item.stepNumber} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold flex items-center justify-center">
                  {item.stepNumber}
                </span>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  {item.type}
                </span>
              </div>

              <h4 className="font-bold text-sm text-white">{item.action}</h4>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{item.description}</p>

              <div className="bg-slate-950 p-2 rounded border border-slate-800 text-[10px] font-mono text-cyan-300 overflow-x-auto">
                {item.command}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
