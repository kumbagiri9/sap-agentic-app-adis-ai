import React, { useState } from 'react';
import { 
  Bot, 
  Workflow, 
  Cpu, 
  Code, 
  Bug, 
  Zap, 
  PlusCircle, 
  TestTube, 
  ArrowUpRight, 
  ShieldCheck, 
  Truck, 
  FileText, 
  CheckCircle2, 
  Activity, 
  Layers, 
  Sparkles, 
  ArrowRight, 
  Gauge, 
  GitBranch, 
  RefreshCw, 
  Sliders, 
  Database,
  Terminal,
  Server
} from 'lucide-react';

interface Props {
  data: any;
}

export const MultiAgentAbapArchitectureCard: React.FC<Props> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'AGENTS' | 'TRACE' | 'GOVERNANCE'>('AGENTS');
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  if (!data) return null;

  const orchestrator = data.orchestratorState || {};
  const agents = data.agents || [];
  const trace = data.collaborationWorkflow || {};
  const health = data.systemHealth || {};

  const getAgentIcon = (id: string) => {
    switch (id) {
      case 'AGENT_ORCHESTRATOR': return <Workflow className="w-5 h-5 text-sky-400" />;
      case 'AGENT_CODE_ANALYSIS': return <Code className="w-5 h-5 text-indigo-400" />;
      case 'AGENT_DEBUGGING': return <Bug className="w-5 h-5 text-rose-400" />;
      case 'AGENT_PERFORMANCE': return <Zap className="w-5 h-5 text-amber-400" />;
      case 'AGENT_CODE_GENERATION': return <PlusCircle className="w-5 h-5 text-emerald-400" />;
      case 'AGENT_TEST': return <TestTube className="w-5 h-5 text-purple-400" />;
      case 'AGENT_S4_MIGRATION': return <ArrowUpRight className="w-5 h-5 text-cyan-400" />;
      case 'AGENT_SECURITY': return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      case 'AGENT_TRANSPORT': return <Truck className="w-5 h-5 text-amber-400" />;
      case 'AGENT_DOCUMENTATION': return <FileText className="w-5 h-5 text-blue-400" />;
      default: return <Bot className="w-5 h-5 text-slate-400" />;
    }
  };

  const getAgentBadgeColor = (category: string) => {
    switch (category) {
      case 'CORE_ORCHESTRATION': return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
      case 'CODE_INTELLIGENCE': return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'RUNTIME_DIAGNOSTICS': return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'OPTIMIZATION_ENGINE': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'DEVELOPMENT_CREATION': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'QUALITY_ASSURANCE': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'LANDSCAPE_TRANSFORMATION': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'CYBERSECURITY_GOVERNANCE': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'RELEASE_MANAGEMENT': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'KNOWLEDGE_ENGINE': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const selectedAgent = agents.find((a: any) => a.id === selectedAgentId);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 font-sans my-4">
      {/* HEADER BAR */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950/80 to-slate-900 p-6 border-b border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-sky-600/20 border border-sky-500/30 rounded-xl text-sky-400 shadow-lg shadow-sky-950/40">
              <Cpu className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold tracking-tight text-white">
                  Multi-Agent SAP ABAP Architecture
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
                  10 Agents Synchronized
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                System: <span className="font-mono font-bold text-cyan-300">{health.s4HanaSystem || 'S4H Client 100'}</span> • Release: <span className="font-mono text-amber-300">{health.sapRelease || 'S/4HANA 2023 FPS02'}</span> • Tier: <span className="font-mono text-emerald-400">Tier-1 Clean Core</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex items-center gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Pipeline ID</span>
                <span className="font-mono text-sky-300 font-bold">{orchestrator.activeTaskPipelineId}</span>
              </div>
              <div className="h-6 w-px bg-slate-800"></div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Latency</span>
                <span className="font-mono text-emerald-400 font-bold">{orchestrator.delegationLatencyMs} ms</span>
              </div>
            </div>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="mt-4 bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-300 leading-relaxed flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
            <span>{data.summary}</span>
          </div>
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 shrink-0">
            STMS GREEN
          </span>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex border-b border-slate-800 bg-slate-900/50 px-4 pt-3 gap-2 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('AGENTS')}
          className={`px-4 py-2.5 rounded-t-xl border-t border-x flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'AGENTS' ? 'bg-slate-950 border-slate-800 text-sky-300' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bot className="w-4 h-4 text-sky-400" />
          10 Specialized Agents ({agents.length})
        </button>
        <button
          onClick={() => setActiveTab('TRACE')}
          className={`px-4 py-2.5 rounded-t-xl border-t border-x flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'TRACE' ? 'bg-slate-950 border-slate-800 text-sky-300' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <GitBranch className="w-4 h-4 text-indigo-400" />
          Multi-Agent Workflow Trace
        </button>
        <button
          onClick={() => setActiveTab('GOVERNANCE')}
          className={`px-4 py-2.5 rounded-t-xl border-t border-x flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'GOVERNANCE' ? 'bg-slate-950 border-slate-800 text-sky-300' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Clean Core Governance
        </button>
      </div>

      {/* CONTENT SECTIONS */}
      <div className="p-6">
        {/* TAB 1: 10 SPECIALIZED AGENTS GRID */}
        {activeTab === 'AGENTS' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agents.map((agent: any) => {
                const isSelected = selectedAgentId === agent.id;
                return (
                  <div
                    key={agent.id}
                    onClick={() => setSelectedAgentId(isSelected ? null : agent.id)}
                    className={`bg-slate-900 border rounded-xl p-4 cursor-pointer transition-all hover:scale-[1.01] ${
                      isSelected ? 'border-sky-500 shadow-lg shadow-sky-950/50 bg-slate-900/90' : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg">
                          {getAgentIcon(agent.id)}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-white">{agent.name}</h3>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${getAgentBadgeColor(agent.category)}`}>
                            {agent.category}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] text-slate-400 font-mono">Health</span>
                        <span className="font-mono text-xs font-bold text-emerald-400">{agent.healthScore}%</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed mb-3 line-clamp-2">
                      {agent.roleDescription}
                    </p>

                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 mb-3 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Current Focus</span>
                      <p className="text-[11px] text-cyan-200 font-mono line-clamp-2">
                        {agent.currentFocusTask}
                      </p>
                    </div>

                    <div className="border-t border-slate-800/80 pt-2 flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Status: <strong className="text-emerald-400">{agent.status}</strong></span>
                      <span className="text-sky-400 font-bold flex items-center gap-1">
                        View Details <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* DETAILED AGENT DRILL-DOWN PANEL */}
            {selectedAgent && (
              <div className="bg-slate-900 border border-sky-500/50 rounded-2xl p-6 space-y-4 shadow-xl shadow-sky-950/30">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-sky-500/20 border border-sky-500/30 rounded-xl text-sky-400">
                      {getAgentIcon(selectedAgent.id)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{selectedAgent.name}</h3>
                      <p className="text-xs text-slate-400">{selectedAgent.roleDescription}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedAgentId(null)}
                    className="text-xs text-slate-400 hover:text-white px-3 py-1 rounded bg-slate-950 border border-slate-800"
                  >
                    Close Inspector
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <h4 className="font-bold text-sky-300 uppercase tracking-wider mb-2.5 text-[11px]">Core Agent Capabilities</h4>
                    <ul className="space-y-2">
                      {selectedAgent.capabilities?.map((cap: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{cap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <h4 className="font-bold text-emerald-300 uppercase tracking-wider mb-2.5 text-[11px]">Live S/4HANA Metrics</h4>
                    <div className="grid grid-cols-2 gap-3 font-mono text-[11px]">
                      {Object.entries(selectedAgent.liveMetrics || {}).map(([key, val]: [string, any], idx: number) => (
                        <div key={idx} className="bg-slate-900 p-2.5 rounded border border-slate-800">
                          <span className="text-[10px] text-slate-400 uppercase block truncate">{key}</span>
                          <span className="text-sky-300 font-bold">{String(val)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MULTI-AGENT WORKFLOW TRACE */}
        {activeTab === 'TRACE' && (
          <div className="space-y-4">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">{trace.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{trace.scenario}</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Synchronized Multi-Agent Execution
              </span>
            </div>

            <div className="relative border-l-2 border-slate-800 ml-4 space-y-4 pl-6 py-2">
              {trace.steps?.map((step: any, idx: number) => (
                <div key={idx} className="relative bg-slate-900 p-4 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-colors">
                  <div className="absolute -left-[31px] top-4 w-5 h-5 rounded-full bg-slate-950 border-2 border-sky-500 flex items-center justify-center font-mono text-[10px] font-bold text-sky-300">
                    {step.stepNumber}
                  </div>

                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-sky-300">{step.agentName}</span>
                      <span className="text-[10px] font-mono text-slate-500">({step.agentId})</span>
                    </div>
                    <span className="px-2 py-0.5 text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded">
                      COMPLETED
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {step.action}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CLEAN CORE GOVERNANCE */}
        {activeTab === 'GOVERNANCE' && (
          <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Clean Core Governance & Architectural Rules</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                100% Compliant
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-sky-300 text-[11px] uppercase tracking-wider">Tier-1 Clean Core Mandates</h4>
                <ul className="space-y-1.5 text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Strict usage of released CDS views (I_SalesOrder, I_MaterialStock) instead of raw DB tables.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Mandatory AUTHORITY-CHECK validation on all exposed OData services & class methods.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Zero hardcoded client numbers or credentials; dynamic system parameter resolution.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-amber-300 text-[11px] uppercase tracking-wider">Automated Multi-Agent Guardrails</h4>
                <ul className="space-y-1.5 text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>ST05 SQL trace gating: no full table scans allowed before code commitment.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>AUnit test coverage threshold set to 90%+ for all custom Z-package object creations.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>STMS transport dependency tracking prevents collision and sequence errors in cutover.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
