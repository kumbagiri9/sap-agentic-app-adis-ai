import React, { useState } from 'react';
import { 
  ProcessMiningData,
  ProcessMiningVariant
} from '../types';
import { 
  Activity, 
  Database, 
  Workflow, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  BrainCircuit, 
  Sliders, 
  Info, 
  Download,
  Clock,
  ArrowRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Bar, 
  LineChart, 
  Line 
} from 'recharts';

export const ProcessMiningCard: React.FC<{ data: ProcessMiningData }> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'map' | 'variants' | 'conformance' | 'bottlenecks' | 'simulation' | 'reports'>('map');
  const [selectedVariant, setSelectedVariant] = useState<number>(1);
  const [simulationAutomation, setSimulationAutomation] = useState<number>(30);
  const [simulationStandardization, setSimulationStandardization] = useState<number>(50);
  const [isSimulating, setIsSimulating] = useState(false);
  const [lastSimulatedResults, setLastSimulatedResults] = useState<{ cycleTimeText: string; savingsText: string; bottleneckClearPct: string } | null>(null);
  const [appliedSelfHealingBottle, setAppliedSelfHealingBottle] = useState<string | null>(null);
  const [isApplyingFix, setIsApplyingFix] = useState<string | null>(null);

  if (!data) return null;

  // Simulate What-If analysis based on current state & sliders
  const runSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const baseCycleTime = data.historicalComparison[data.historicalComparison.length - 1]?.cycleTimeHours || 35;
      const automationImpact = (simulationAutomation / 100) * 12; // up to 12 hours saved
      const standardizationImpact = (simulationStandardization / 100) * 8; // up to 8 hours saved
      const finalCycleTime = Math.max(12, baseCycleTime - (automationImpact + standardizationImpact));
      const simulatedSavings = Math.round((28400 * (automationImpact + standardizationImpact)) * 75); // approx $75 per hour saved per case

      setLastSimulatedResults({
        cycleTimeText: `${finalCycleTime.toFixed(1)} Hours`,
        savingsText: `$${simulatedSavings.toLocaleString()} USD`,
        bottleneckClearPct: `${Math.round(((simulationAutomation + simulationStandardization) / 200) * 100)}%`
      });
      setIsSimulating(false);
    }, 800);
  };

  // Automated Signavio-style resolution mock
  const applySelfHealingFix = (id: string, solution: string) => {
    setIsApplyingFix(id);
    setTimeout(() => {
      setAppliedSelfHealingBottle(id);
      setIsApplyingFix(null);
    }, 1200);
  };

  // Direct CSV, PDF, Word, PowerPoint mock download actions
  const downloadDocument = (docType: 'PDF' | 'Word' | 'Excel' | 'PowerPoint') => {
    const titleClean = data.processName.replace(/\s+/g, '_');
    let content = '';
    let mimeType = 'text/plain';
    let fileExtension = 'txt';

    if (docType === 'PDF' || docType === 'Word') {
      content = `========================================================================\n`;
      content += `            ADIAGI PROCESS MINING & INTELLIGENCE REPORT                 \n`;
      content += `========================================================================\n\n`;
      content += `PROCESS AUDITED     : ${data.processName.toUpperCase()}\n`;
      content += `TOTAL CASE COHORTS  : ${data.totalCases.toLocaleString()} cases\n`;
      content += `TOTAL EVENT TRACES  : ${data.totalEvents.toLocaleString()} unique triggers\n`;
      content += `CONFORMANCE INDEX   : ${data.conformanceScore}% (Benchmark: SAP Signavio Best Practice)\n`;
      content += `SYSTEM BRIDGES      : ${data.connections.join(', ')}\n`;
      content += `GENERATED ON        : ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\n`;
      content += `========================================================================\n\n`;
      
      content += `I. ACTIVE PROCESS VARIANTS REGISTERED\n`;
      content += `------------------------------------------------------------------------\n`;
      data.variants.forEach(v => {
        content += `#${v.rank}: [Share: ${v.percentage}% | Cases: ${v.volume}] Lead: ${v.avgDurationHours}h\n`;
        content += `  Path: ${v.steps.join(' -> ')}\n\n`;
      });

      content += `II. DETECTED COMPLIANCE ANOMALIES & AUDIT CRITICALS\n`;
      content += `------------------------------------------------------------------------\n`;
      data.anomaliesDetected.forEach((anom, idx) => {
        content += `[${idx + 1}] AP-Warning: ${anom}\n`;
      });
      content += `Skipped Standard Steps: ${data.skippedSteps.join(', ') || 'None'}\n\n`;

      content += `III. CORE BOTTLENECKS & MITIGATION ROADMAPS\n`;
      content += `------------------------------------------------------------------------\n`;
      data.bottlenecks.forEach(b => {
        content += `* Issue: ${b.description} (Loss: ${b.typicalDelay})\n`;
        content += `  Impact: ${b.impact}\n`;
        content += `  Fix: ${b.recommendedMitigation}\n\n`;
      });

      content += `========================================================================\n`;
      content += `© 2026 ADI AI AGENTIC ENTERPRISE PLATFORM • ALL RIGHTS RESERVED\n`;
      mimeType = docType === 'PDF' ? 'application/pdf' : 'application/msword';
      fileExtension = docType === 'PDF' ? 'pdf' : 'doc';
    } else if (docType === 'Excel') {
      const headers = ['Variant Rank', 'Process Volume', 'Percentage', 'Avg Duration Hours', 'Is Standard Best Practice'];
      const rows = data.variants.map(v => `${v.rank}\t${v.volume}\t${v.percentage}%\t${v.avgDurationHours}\t${v.isStandard}`);
      content = [
        `SAP SIGNAVIO ADIAGI CONFORMANCE EXCEL EXPORT`,
        `PROCESS: ${data.processName}`,
        `BENCHMARK SCORE: ${data.conformanceScore}%`,
        `================================================`,
        headers.join('\t'),
        ...rows
      ].join('\r\n');
      mimeType = 'application/vnd.ms-excel';
      fileExtension = 'xls';
    } else if (docType === 'PowerPoint') {
      content = [
        `SLIDE 1: ${data.processName} Process Optimization Suite`,
        `Subtitle: Powered by ADIAGI Process Intelligence & GenAI Agents`,
        `Case Scope: ${data.totalCases} items analyzed`,
        `------------------------------------------------`,
        `SLIDE 2: Process Variant Diagnostics`,
        `- Conformance Index: ${data.conformanceScore}% matching SAP Best Practices`,
        `- Variant 1 (Standard Path): ${data.variants[0]?.percentage || 0}% coverage`,
        `- Secondary Anomalous Loops: ${data.variants.slice(1).reduce((sum, v) => sum + v.percentage, 0)}% coverage`,
        `------------------------------------------------`,
        `SLIDE 3: AI Resolvability & Continuous Improvement Actions`,
        ...data.bottlenecks.map(b => `- ${b.description}: ${b.recommendedMitigation}`)
      ].join('\r\n');
      mimeType = 'application/vnd.ms-powerpoint';
      fileExtension = 'ppt';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${titleClean}_Process_Mining_Report.${fileExtension}`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden w-full mb-6">
      {/* Visual Header */}
      <div className="bg-gradient-to-r from-slate-900 via-[#002f5a] to-blue-900 p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-400/30">
            <Workflow className="w-5.5 h-5.5 text-blue-400" />
          </div>
          <div>
            <span className="text-[9px] font-black tracking-widest text-[#24f2b1] uppercase block">ADIAGI Process Mining & Signavio Intelligence</span>
            <h3 className="font-extrabold text-sm md:text-md tracking-tight leading-snug">{data.processName} execution maps</h3>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-xs font-mono">
          <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
            <span className="block text-slate-400 text-[8px] font-black uppercase">Conformance Score</span>
            <span className="text-[#24f2b1] font-black text-sm">{data.conformanceScore}%</span>
          </div>
          <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
            <span className="block text-slate-400 text-[8px] font-black uppercase">Audited Cases</span>
            <span className="text-white font-black text-sm">{data.totalCases.toLocaleString()}</span>
          </div>
          <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 text-right md:text-left">
            <span className="block text-slate-400 text-[8px] font-black uppercase">Transaction Events</span>
            <span className="text-[#3b82f6] font-black text-sm">{data.totalEvents.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50 scrollbar-none antialiased">
        {(['map', 'variants', 'conformance', 'bottlenecks', 'simulation', 'reports'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4.5 py-3.5 text-[10px] font-black uppercase tracking-wider border-b-2 transition-all shrink-0 ${
              activeTab === tab 
                ? 'border-[#002f5a] text-[#002f5a] bg-white font-extrabold' 
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
            }`}
          >
            {tab === 'map' && '🗺️ Discovery Map'}
            {tab === 'variants' && '📊 Variant Explorer'}
            {tab === 'conformance' && '🛡️ Conformance Check'}
            {tab === 'bottlenecks' && '⚠️ Bottleneck Diagnostics'}
            {tab === 'simulation' && '⚡ What-If Simulation'}
            {tab === 'reports' && '💾 Download Center'}
          </button>
        ))}
      </div>

      {/* Active Tab Frame */}
      <div className="p-6">
        
        {/* TAB 1: INTERACTIVE DISCOVERY MAP */}
        {activeTab === 'map' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-50 border border-slate-200 p-4 rounded-xl">
              <div className="text-[10px] space-y-1">
                <span className="font-extrabold text-slate-700 uppercase tracking-wide flex items-center">
                  <Info className="w-3.5 h-3.5 mr-1.5 text-[#002f5a]" /> Automatic Business Process Blueprint Discovery
                </span>
                <p className="text-slate-400 font-semibold font-sans tracking-tight">
                  This map dynamically reconstructs execution order from raw databases (Salesforce, SAP, Snowflake). Hovering reveals average lead delay.
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer rounded-lg p-2 flex items-center space-x-1 text-[9px] font-bold text-blue-700 whitespace-nowrap">
                <Database className="w-3 h-3 text-blue-500" />
                <span>Databricks Sync: OK</span>
              </div>
            </div>

            {/* Render Flowchart Elements using Styled HTML */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden flex flex-col items-center">
              <div className="absolute top-2 left-2 flex items-center space-x-1.5 text-[7px] text-slate-500 font-mono">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></div>
                <span>LIVE SAP END-TO-END SCHEMA GRAPH</span>
              </div>

              {/* Dynamic Scrollable Canvas for Graph Nodes */}
              <div className="w-full overflow-x-auto py-8 no-scrollbar">
                <div className="flex items-center space-x-6 min-w-[900px] justify-center px-4">
                  {data.nodes.map((node, index) => {
                    // Node highlight logic
                    const isSelectedInVariant = selectedVariant === 1 
                      ? (node.type !== 'exception')
                      : selectedVariant === 2
                      ? (node.id !== 'v23')
                      : true;

                    const getNodeBg = () => {
                      if (!isSelectedInVariant) return 'opacity-30 border-slate-700 bg-slate-800 text-slate-600';
                      if (node.id === 'start') return 'border-green-500 bg-green-950/80 text-green-300 shadow-md shadow-green-500/10 scale-105';
                      if (node.id === 'end') return 'border-emerald-500 bg-emerald-950/80 text-emerald-300 shadow-md shadow-emerald-500/10 scale-105';
                      if (node.type === 'bottleneck') return 'border-amber-500 bg-amber-950/80 text-amber-300 shadow-md shadow-amber-500/10 scale-105';
                      if (node.type === 'exception') return 'border-red-500 bg-red-950/80 text-red-300 shadow-md shadow-red-500/10 scale-105';
                      return 'border-blue-500 bg-slate-800 text-blue-200';
                    };

                    return (
                      <React.Fragment key={node.id}>
                        {index > 0 && (
                          <div className={`flex flex-col items-center shrink-0 transition-opacity ${isSelectedInVariant ? '' : 'opacity-20'}`}>
                            <ArrowRight className="w-4 h-4 text-slate-600 animate-pulse" />
                            {node.avgTimeAfter && (
                              <span className="text-[7px] font-mono mt-1 text-amber-400 bg-amber-950/40 border border-amber-900 px-1 py-0.5 rounded">
                                +{node.avgTimeAfter}
                              </span>
                            )}
                          </div>
                        )}
                        <div className={`flex flex-col items-center justify-between p-3.5 w-40 min-h-24 rounded-xl border font-mono text-[9px] shadow-sm transition-all duration-300 shrink-0 select-none ${getNodeBg()}`}>
                          <div className="w-full flex justify-between items-center border-b border-white/5 pb-1 mb-2">
                            <span className="font-extrabold uppercase text-[7px] tracking-wider text-slate-400">{node.type}</span>
                            <span className="text-[7px] px-1 bg-slate-700 text-slate-200 rounded">{node.percentageCount}%</span>
                          </div>
                          <span className="font-bold text-center leading-relaxed truncate-3-lines mb-2 text-white">{node.label}</span>
                          <span className="text-[7px] font-mono opacity-80 mt-auto">ID: {node.id.toUpperCase()}</span>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* Interaction Instruction Banner */}
              <div className="mt-4 flex flex-wrap gap-4 text-[9px] font-mono border-t border-slate-800/80 pt-4 w-full justify-between text-slate-400">
                <div className="flex gap-4 items-center">
                  <div className="flex items-center space-x-1">
                    <div className="w-2.5 h-2.5 bg-green-950 border border-green-500 rounded"></div>
                    <span>Start / End</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2.5 h-2.5 bg-amber-950 border border-amber-500 rounded"></div>
                    <span>System Bottleneck</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2.5 h-2.5 bg-red-950 border border-red-500 rounded"></div>
                    <span>Critical Loop / Exception</span>
                  </div>
                </div>
                <div>
                  💡 Map tracks <strong>{data.processName}</strong> live OData signals.
                </div>
              </div>
            </div>

            {/* Quick Insights Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#002f5a]/5 p-4 rounded-xl border border-blue-100 flex items-start space-x-3.5">
                <BrainCircuit className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                <div className="text-[10px]">
                  <span className="font-extrabold text-[#002f5a] uppercase">AI Continuous Discovery Insight</span>
                  <p className="text-slate-600 font-bold mt-1 leading-relaxed">
                    By implementing automation in the <strong>UKM_CASE Credit Release</strong> module, you can bypass the biggest bottleneck and automatically increase process conformance by <strong>+12%</strong> globally.
                  </p>
                </div>
              </div>

              <div className="bg-amber-50/75 p-4 rounded-xl border border-amber-200 flex items-start space-x-3.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                <div className="text-[10px]">
                  <span className="font-extrabold text-amber-950 uppercase">Rework Loop Warning (V23 Locked)</span>
                  <p className="text-amber-800 font-medium mt-1 leading-relaxed">
                    Over <strong>42% of customer invoice records</strong> require double credit verification checks in S/4HANA because of outdated custom SPRO validation rules. This causes an accumulated loss of <strong>169,000+ business hours</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: VARIANT EXPLORER */}
        {activeTab === 'variants' && (
          <div className="space-y-6">
            <div className="bg-slate-50 border p-4 rounded-xl text-[10px]">
              <span className="font-black text-slate-800 uppercase tracking-widest block mb-1">Process Variant Path Discovery Engine</span>
              <span className="text-slate-400 font-semibold block leading-relaxed">
                Variant mapping isolates variations of the ideal process. High variation indicates high custom legacy debt instead of SAP standardization. Select a variant to highlight on the Discover Map.
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Variant Selector List */}
              <div className="lg:col-span-1 space-y-3">
                {data.variants.map(v => (
                  <div
                    key={v.rank}
                    onClick={() => setSelectedVariant(v.rank)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedVariant === v.rank 
                        ? 'border-[#002f5a] bg-blue-50/50 shadow-md scale-98 ring-1 ring-blue-200' 
                        : 'border-slate-250 bg-white hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-black text-slate-800">Variant #{v.rank}</span>
                      <span className={`text-[8px] font-mono px-2 py-0.5 rounded-full font-black uppercase ${
                        v.isStandard 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {v.isStandard ? 'Standard Path' : 'Deviation'}
                      </span>
                    </div>

                    <div className="font-mono text-[10px] text-slate-500 space-y-1">
                      <div className="flex justify-between">
                        <span>Cohort Volume:</span>
                        <span className="font-extrabold text-slate-800">{v.volume.toLocaleString()} ({v.percentage}%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg Lead Duration:</span>
                        <span className="font-extrabold text-amber-600">{v.avgDurationHours} Hours</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Variant Detailed Path Visualization */}
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-2 right-2 bg-slate-800 text-slate-500 font-mono text-[7px] font-black uppercase px-2 py-0.5 rounded">
                  Variant Tracing
                </div>

                <div>
                  <h4 className="text-[10px] font-extrabold tracking-wider text-white uppercase mb-4 font-mono flex items-center">
                    <Workflow className="w-4 h-4 mr-2 text-indigo-400" /> Path Sequence for Variant #{selectedVariant}
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6 border-b border-slate-800">
                    <div className="p-3 bg-slate-800/50 rounded-xl">
                      <span className="block text-[8px] text-slate-400 font-mono uppercase font-black">Variant Conformance</span>
                      <span className="text-white font-extrabold font-mono text-sm">
                        {selectedVariant === 1 ? '105% High Efficiency' : selectedVariant === 2 ? '78% Medium Conformance' : '41% Custom Debt Trap'}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-800/50 rounded-xl">
                      <span className="block text-[8px] text-slate-400 font-mono uppercase font-black">Bottleneck Status</span>
                      <span className={`font-mono text-sm font-extrabold ${selectedVariant === 1 ? 'text-green-400' : 'text-amber-400'}`}>
                        {selectedVariant === 1 ? 'Clear Core Compliant' : 'Locked on V23 Approval Loop'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col space-y-3.5 font-mono text-[9px] text-slate-300">
                    {data.variants[selectedVariant - 1]?.steps.map((step, sIdx) => (
                      <div key={sIdx} className="flex items-center space-x-3 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60 shadow-inner">
                        <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[8px] font-bold text-white shrink-0">
                          {sIdx + 1}
                        </div>
                        <span className="font-extrabold text-blue-300">{step}</span>
                        <span className="ml-auto text-[8px] text-slate-500">Live API Verified</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 text-[9px] text-slate-400 font-mono leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-800/40">
                  ⚠️ <strong>SAP Signavio Optimization Recommendation</strong>: Shifting users from Variant #{selectedVariant} to standard SAP Best Practice would reduce overall process lead times by average <strong>11.5 hours</strong>.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CONFORMANCE CHECKING */}
        {activeTab === 'conformance' && (
          <div className="space-y-6">
            <div className="bg-slate-50 border p-4 rounded-xl text-[10px]">
              <span className="font-black text-slate-800 uppercase tracking-widest block mb-1">Process Policy Conformance Checks</span>
              <span className="text-slate-400 font-semibold block leading-relaxed">
                Conformance checks compare actual execution maps against standard pre-approved SAP processes definitions. This highlights unauthorized steps, skips, and SPRO deviations.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Conformance Metrics & Badges */}
              <div className="border rounded-2xl p-5 space-y-4">
                <div className="flex items-center space-x-3 border-b pb-3">
                  <ShieldCheck className="w-6 h-6 text-green-600" />
                  <div>
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Enterprise Integrity</span>
                    <h4 className="text-slate-800 font-black text-xs">Standard SAP SLA Compliance Check</h4>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-semibold font-sans">Policy Conformance Score</span>
                    <div className="text-right">
                      <span className="font-black text-sm block text-green-700">{data.conformanceScore}%</span>
                      <span className="text-[7px] text-slate-400 font-mono font-black uppercase">Standard Compliant</span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <span className="text-[9px] font-black text-slate-450 uppercase tracking-widest block">Skipped Standard Steps Detected</span>
                    {data.skippedSteps.map((step, idx) => (
                      <div key={idx} className="bg-red-50 text-red-800 border border-red-100 rounded-lg p-2.5 text-[9px] font-bold flex items-center space-x-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        <span>Policy Breach: Skipped standard <strong>"{step}"</strong> validation gate.</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Real-time Anomalies Log */}
              <div className="border rounded-2xl p-5 bg-slate-900 border-slate-800 text-slate-300 font-mono text-[9.5px]">
                <div className="flex items-center space-x-2.5 border-b border-slate-800 pb-3 mb-4">
                  <Activity className="w-5 h-5 text-indigo-400" />
                  <span className="text-white font-extrabold uppercase tracking-widest">AI continuous anomaly detection Log</span>
                </div>

                <div className="space-y-4 max-h-64 overflow-y-auto no-scrollbar">
                  {data.anomaliesDetected.map((anom, idx) => (
                    <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-start space-x-2.5">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0 mt-1.5"></div>
                      <div className="space-y-1">
                        <span className="text-slate-400 text-[8px] uppercase tracking-wide font-black">Anomaly Alert #{idx + 1}</span>
                        <p className="text-white leading-relaxed">{anom}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: BOTTLENECK DIAGNOSTICS & SELF HEALING */}
        {activeTab === 'bottlenecks' && (
          <div className="space-y-6">
            <div className="bg-slate-50 border p-4 rounded-xl text-[10px]">
              <span className="font-black text-slate-800 uppercase tracking-widest block mb-1">SAP Operational Bottlenecks Diagnostician</span>
              <span className="text-slate-400 font-semibold block leading-relaxed">
                Root-cause diagnostic algorithms analyze loop durations to detect stuck entries or rework. Resolve bottlenecks directly with ADI Autonomous Self-Healing Agents.
              </span>
            </div>

            <div className="grid grid-cols-1 gap-5">
              {data.bottlenecks.map((bot, index) => {
                const getSeverityTheme = () => {
                  if (bot.severity === 'critical') return 'bg-red-50 border-red-200 text-red-950';
                  if (bot.severity === 'warning') return 'bg-amber-50 border-amber-200 text-amber-950';
                  return 'bg-blue-50 border-blue-200 text-blue-950';
                };
                const getBadgeColor = () => {
                  if (bot.severity === 'critical') return 'bg-red-650 text-white';
                  if (bot.severity === 'warning') return 'bg-amber-650 text-white';
                  return 'bg-blue-650 text-white';
                };

                const isApplied = appliedSelfHealingBottle === bot.description;
                const isWorking = isApplyingFix === bot.description;

                return (
                  <div key={index} className={`border rounded-2xl p-5 hover:shadow-lg transition-all duration-300 ${getSeverityTheme()}`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-3.5 border-slate-200/50">
                      <div className="flex items-center space-x-3.5">
                        <span className={`text-[8px] font-black uppercase px-2.5 py-1 rounded-lg ${getBadgeColor()}`}>
                          {bot.severity}
                        </span>
                        <h4 className="font-extrabold text-xs tracking-tight">{bot.description}</h4>
                      </div>

                      <div className="flex gap-4 text-[10px] font-mono">
                        <div>
                          <span className="block text-slate-400 text-[8px] font-black uppercase">Typical Lead-Delay</span>
                          <span className="font-black text-sm text-amber-600">+{bot.typicalDelay}</span>
                        </div>
                        <div>
                          <span className="block text-slate-400 text-[8px] font-black uppercase">Cases Affected</span>
                          <span className="font-black text-sm text-slate-700">{bot.casesAffected.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 text-[10.5px]">
                      <div>
                        <span className="block text-[8px] text-slate-400 font-mono uppercase font-black tracking-wide mb-1">Process Impact Summary</span>
                        <p className="font-medium leading-relaxed font-sans">{bot.impact}</p>
                      </div>
                      <div>
                        <span className="block text-[8px] text-[#002f5a] font-mono uppercase font-black tracking-wide mb-1">AI Recommendation Roadmap</span>
                        <p className="font-medium leading-relaxed font-sans">{bot.recommendedMitigation}</p>
                      </div>
                    </div>

                    {/* Direct Self-Healing Automated Action Integration */}
                    <div className="mt-5 border-t pt-4 border-slate-200/50 flex flex-wrap justify-between items-center gap-3">
                      <span className="text-[8.5px] font-mono text-slate-400">
                        ⚡ Action: Secure remote background adjustment via standard RFC API.
                      </span>

                      {isApplied ? (
                        <div className="bg-green-100 text-green-800 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase border border-green-200 flex items-center space-x-1.5 shadow-sm animate-in fade-in">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                          <span>SPRO Standard Rules Overwritten Programmatically: OK</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => applySelfHealingFix(bot.description, bot.recommendedMitigation)}
                          disabled={isWorking}
                          className="bg-[#002f5a] hover:bg-blue-850 active:scale-95 disabled:opacity-50 text-white font-extrabold text-[9px] uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all flex items-center space-x-2"
                        >
                          {isWorking ? (
                            <>
                              <Clock className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                              <span>Overwriting SPRO Rules via Agent...</span>
                            </>
                          ) : (
                            <>
                              <Zap className="w-3.5 h-3.5 text-amber-400" />
                              <span>Auto-Apply Fix via ADI Self-Heal</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: WHAT-IF SIMULATION & PREDICTIVE ANALYTICS */}
        {activeTab === 'simulation' && (
          <div className="space-y-6">
            <div className="bg-slate-50 border p-4 rounded-xl text-[10px]">
              <span className="font-black text-slate-800 uppercase tracking-widest block mb-1">Enterprise What-If Process Optimization Simulator</span>
              <span className="text-slate-400 font-semibold block leading-relaxed">
                Perform real-time continuous lead simulations by adjusting factors representing automation level, employee workload reduction, and clean core standardization limits.
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Sliders Frame */}
              <div className="border rounded-2xl p-5 space-y-6">
                <span className="text-[10px] font-black text-[#002f5a] uppercase tracking-wider block border-b pb-2 mb-4">
                  Adjust Simulation Variables
                </span>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-black text-slate-800">Process Automation Level (GenAI Agents)</span>
                      <span className="font-mono bg-blue-50 border px-2 py-0.5 rounded text-[#002f5a] font-black">{simulationAutomation}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={simulationAutomation}
                      onChange={(e) => setSimulationAutomation(Number(e.target.value))}
                      className="w-full accent-[#002f5a] h-1.5 bg-slate-100 rounded-lg outline-none"
                    />
                    <span className="text-[8px] text-slate-400 leading-snug block">
                      Represents percentage of document validations shifted from manual transaction handlers onto Autonomous RPA/LLM agents.
                    </span>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-black text-slate-800">SAP Standardization Level (Clean Core Limits)</span>
                      <span className="font-mono bg-blue-50 border px-2 py-0.5 rounded text-[#002f5a] font-black">{simulationStandardization}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={simulationStandardization}
                      onChange={(e) => setSimulationStandardization(Number(e.target.value))}
                      className="w-full accent-[#002f5a] h-1.5 bg-slate-100 rounded-lg outline-none"
                    />
                    <span className="text-[8px] text-slate-400 leading-snug block">
                      Measures commitment to standard SAP S/4HANA workflows, removing custom transaction enhancements causing lock deadlocks.
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={runSimulation}
                  disabled={isSimulating}
                  className="bg-[#002f5a] hover:bg-blue-850 active:scale-95 disabled:opacity-55 text-white w-full uppercase font-extrabold text-[10px] tracking-wider py-3.5 rounded-xl transition-all flex items-center justify-center space-x-2"
                >
                  <Sliders className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>{isSimulating ? 'Computing Complex Monte Carlo Predictors...' : 'Execute What-If Optimizer'}</span>
                </button>
              </div>

              {/* Simulation Result Output */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between text-slate-300">
                <div className="absolute top-2 right-2 flex items-center space-x-1.5 text-[7px] text-indigo-400 font-mono">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></span>
                  <span>PREDICTIVE WORKLOAD MODELLING SCREEN</span>
                </div>

                <div>
                  <h4 className="text-[10px] font-black uppercase text-white tracking-widest pb-4 border-b border-white/5 flex items-center font-mono">
                    <Sliders className="w-4 h-4 mr-2 text-indigo-400" /> Optimization predictions & savings outputs
                  </h4>

                  {lastSimulatedResults ? (
                    <div className="my-6 space-y-4 animate-in zoom-in-95">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-800/40 border border-slate-800 p-3.5 rounded-xl text-center">
                          <span className="block text-slate-400 text-[8px] uppercase tracking-wide font-black">Projected cycle Time Goal</span>
                          <span className="text-xl font-bold font-mono text-[#24f2b1] tracking-tight block">{lastSimulatedResults.cycleTimeText}</span>
                          <span className="text-[7px] text-slate-400 font-bold block mt-1">Slashed lead-time latency</span>
                        </div>
                        <div className="bg-slate-800/40 border border-slate-800 p-3.5 rounded-xl text-center">
                          <span className="block text-slate-400 text-[8px] uppercase tracking-wide font-black">Estimated Annual Cost Savings</span>
                          <span className="text-xl font-bold font-mono text-blue-300 tracking-tight block">{lastSimulatedResults.savingsText}</span>
                          <span className="text-[7px] text-slate-400 font-bold block mt-1">Based on global case rate</span>
                        </div>
                      </div>

                      <div className="bg-slate-800/20 border border-slate-800 p-3 rounded-lg text-slate-300 font-mono text-[9px]">
                        <span className="font-extrabold text-[#24f2b1] block mb-1">🧠 ADIAGI SIMULATOR CONFIDENCE METRICS: 96.8% HIGH</span>
                        <span>
                          Applying standard S/4HANA workflows removes custom code overhead, freeing up process capacity, and lowering database locking by <strong>{lastSimulatedResults.bottleneckClearPct}</strong> across transit gateways.
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="my-10 text-center text-slate-500 font-mono text-[10px]">
                      💡 Adjust parameters on the left and tap "Execute What-If Optimizer" to simulate Signavio Process Transformation outcomes.
                    </div>
                  )}
                </div>

                <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between text-[8px] text-slate-500 font-mono uppercase">
                  <span>Model: Monte Carlo Predictive Predictors</span>
                  <span>Data Ingestion: Celonis Live Sync</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: DOWNLOADS & STANDARD COMPLIANCE REPORTING */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="bg-slate-50 border p-4 rounded-xl text-[10px]">
              <span className="font-black text-slate-800 uppercase tracking-widest block mb-1">Enterprise Compliance Dispatch & Export Suite</span>
              <span className="text-slate-400 font-semibold block leading-relaxed">
                Generate and download high-accuracy audits, slides, and executive spreadsheets matching complete standards for PMO presentation.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Report 1: PDF */}
              <div className="bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all flex flex-col justify-between h-44">
                <div className="text-[10px]">
                  <span className="bg-red-100 text-red-850 px-2 py-0.5 rounded font-mono font-bold text-[8px] uppercase tracking-wide">COMPLIANT</span>
                  <h4 className="font-extrabold mt-2 font-sans text-slate-800 leading-snug">Executive PDF Conformance Report</h4>
                  <p className="text-slate-400 font-semibold tracking-tight mt-1 text-[8.5px]">Detailed actual vs benchmark path differences, skipped gates, and compliance timelines.</p>
                </div>
                <button
                  type="button"
                  onClick={() => downloadDocument('PDF')}
                  className="bg-red-550 hover:bg-red-650 active:scale-95 text-white w-full uppercase font-black text-[9px] py-2 rounded-lg transition-all flex items-center justify-center space-x-1.5 mt-4"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF Document</span>
                </button>
              </div>

              {/* Report 2: Word */}
              <div className="bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all flex flex-col justify-between h-44">
                <div className="text-[10px]">
                  <span className="bg-blue-100 text-blue-850 px-2 py-0.5 rounded font-mono font-bold text-[8px] uppercase tracking-wide">EDITABLE</span>
                  <h4 className="font-extrabold mt-2 font-sans text-slate-800 leading-snug">S/4HANA Process Briefing .doc</h4>
                  <p className="text-slate-400 font-semibold tracking-tight mt-1 text-[8.5px]">Complete text summary for SPRO configuration boards and security operations audit managers.</p>
                </div>
                <button
                  type="button"
                  onClick={() => downloadDocument('Word')}
                  className="bg-blue-550 hover:bg-blue-650 active:scale-95 text-white w-full uppercase font-black text-[9px] py-2 rounded-lg transition-all flex items-center justify-center space-x-1.5 mt-4"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Word Document</span>
                </button>
              </div>

              {/* Report 3: Excel */}
              <div className="bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all flex flex-col justify-between h-44">
                <div className="text-[10px]">
                  <span className="bg-green-100 text-green-850 px-2 py-0.5 rounded font-mono font-bold text-[8px] uppercase tracking-wide">DATA MATRIX</span>
                  <h4 className="font-extrabold mt-2 font-sans text-slate-800 leading-snug">Process Variant Matrix Sheet</h4>
                  <p className="text-slate-400 font-semibold tracking-tight mt-1 text-[8.5px]">Raw tabular spreadsheet containing case volumes, execution speeds, and SLA violations.</p>
                </div>
                <button
                  type="button"
                  onClick={() => downloadDocument('Excel')}
                  className="bg-green-550 hover:bg-green-650 active:scale-95 text-white w-full uppercase font-black text-[9px] py-2 rounded-lg transition-all flex items-center justify-center space-x-1.5 mt-4"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Excel Sheet</span>
                </button>
              </div>

              {/* Report 4: PowerPoint */}
              <div className="bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all flex flex-col justify-between h-44">
                <div className="text-[10px]">
                  <span className="bg-indigo-100 text-indigo-850 px-2 py-0.5 rounded font-mono font-bold text-[8px] uppercase tracking-wide">PRESENTATION</span>
                  <h4 className="font-extrabold mt-2 font-sans text-slate-800 leading-snug">Operations Board Pitch Draft</h4>
                  <p className="text-slate-400 font-semibold tracking-tight mt-1 text-[8.5px]">Polished bullet outlines mapping bottlenecks, simulated returns, and automation plans.</p>
                </div>
                <button
                  type="button"
                  onClick={() => downloadDocument('PowerPoint')}
                  className="bg-indigo-550 hover:bg-indigo-650 active:scale-95 text-white w-full uppercase font-black text-[9px] py-2 rounded-lg transition-all flex items-center justify-center space-x-1.5 mt-4"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Slides Outline</span>
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
