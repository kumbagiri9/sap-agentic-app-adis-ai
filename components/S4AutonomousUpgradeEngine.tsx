import React, { useState } from 'react';
import {
  Zap,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Play,
  Copy,
  Check,
  Download,
  Terminal,
  Layers,
  Database,
  Cpu,
  RefreshCw,
  FileCode,
  CheckCheck,
  Sparkles,
  BookOpen,
  ArrowRight,
  Shield,
  Activity,
  Award,
  RotateCcw,
  Workflow,
  Users
} from 'lucide-react';
import {
  CompleteMigrationSuiteData,
  UpgradeWorkflowStage,
  UpgradeHumanCheckpoint
} from '../services/s4MigrationTypes';
import { s4MigrationService } from '../services/s4MigrationService';

interface S4AutonomousUpgradeEngineProps {
  data: CompleteMigrationSuiteData;
}

export const S4AutonomousUpgradeEngine: React.FC<S4AutonomousUpgradeEngineProps> = ({ data }) => {
  const engine = data.autonomousUpgradeEngine;
  
  const [subView, setSubView] = useState<'workflow' | 'architecture' | 'python_script' | 'playbook_risks'>('workflow');
  const [selectedStageId, setSelectedStageId] = useState<number>(engine?.stages[engine.activeStageIndex]?.id || 2);
  const [copiedScript, setCopiedScript] = useState(false);
  const [simulatingStep, setSimulatingStep] = useState<string | null>(null);
  const [pythonSimOutput, setPythonSimOutput] = useState<string[]>([]);
  const [isPythonRunning, setIsPythonRunning] = useState(false);
  const [approverName, setApproverName] = useState('Kumbagiri (Lead Enterprise Architect)');
  const [rejectionModalStage, setRejectionModalStage] = useState<UpgradeWorkflowStage | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [snapshotRestoring, setSnapshotRestoring] = useState(false);
  const [selectedScriptTab, setSelectedScriptTab] = useState<'script' | 'simulator'>('script');

  if (!engine) {
    return (
      <div className="p-8 text-center text-slate-400 bg-[#0c162e] rounded-xl border border-indigo-900/50">
        <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
        <p className="font-bold text-slate-200">Autonomous Upgrade Engine initializing...</p>
      </div>
    );
  }

  const activeStage = engine.stages.find(s => s.id === selectedStageId) || engine.stages[0];

  const handleCopyScript = () => {
    navigator.clipboard.writeText(engine.pythonOrchestrationScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleDownloadScript = () => {
    const blob = new Blob([engine.pythonOrchestrationScript], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sap_ecc_s4hana_upgrade_orchestrator.py';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleApproveCheckpoint = (checkpoint: UpgradeHumanCheckpoint) => {
    s4MigrationService.approveUpgradeCheckpoint(checkpoint.id, approverName);
    // Refresh local stage selection to newly active stage
    const updated = s4MigrationService.getMigrationSuiteData();
    if (updated.autonomousUpgradeEngine) {
      setSelectedStageId(updated.autonomousUpgradeEngine.stages[updated.autonomousUpgradeEngine.activeStageIndex]?.id || checkpoint.number + 1);
    }
  };

  const handleRejectCheckpoint = (stage: UpgradeWorkflowStage) => {
    setRejectionModalStage(stage);
  };

  const handleConfirmRejection = () => {
    if (rejectionModalStage) {
      s4MigrationService.rejectUpgradeCheckpoint(rejectionModalStage.humanCheckpoint.id, rejectionReasonInput || 'Governance check failed');
      setRejectionModalStage(null);
      setRejectionReasonInput('');
    }
  };

  const handleExecuteTaskSimulation = (taskId: string) => {
    setSimulatingStep(taskId);
    setTimeout(() => {
      setSimulatingStep(null);
      const task = activeStage.tasks.find(t => t.id === taskId);
      if (task) {
        task.status = 'SUCCESS';
        task.durationSeconds = Math.floor(Math.random() * 20) + 10;
        activeStage.telemetryLogs.push(`[${new Date().toISOString().replace('T', ' ').slice(0, 19)}] ⚡ Executed ${task.name} via ${task.agent}. Status: SUCCESS.`);
      }
    }, 1200);
  };

  const handleRunPythonSimulation = () => {
    setIsPythonRunning(true);
    setSelectedScriptTab('simulator');
    setPythonSimOutput([
      '================================================================================',
      '🚀 LAUNCHING AUTONOMOUS SAP ECC -> S/4HANA IN-PLACE UPGRADE ORCHESTRATOR',
      'Target: SAP S/4HANA 2023 FPS02 | Mode: Downtime-Optimized DMO (ZDM Enabled)',
      'Gateway: http://s1.myerplabs.com:8085 (Client: 800, User: AI_AGENT_RW)',
      '================================================================================',
      '[INIT] Establishing authenticated RFC & SUM tool session...'
    ]);

    const logSteps = [
      '[STAGE 1] DISCOVERY: Querying DD02T, TFDIR, and installed components (CVERS). Found SAP_APPL 618 SP16.',
      '[STAGE 1] DISCOVERY: 1,420 custom Z-objects cataloged. Interface map: 142 RFC, 28 IDoc partner profiles.',
      '[STAGE 1] HUMAN GATEWAY: Checkpoint #1 Pre-Checks Discovery verified (Signed off by Kumbagiri).',
      '[STAGE 2] READINESS: Executing /SDF/RC2023 simplification collector and remote ATC scan.',
      '[STAGE 2] READINESS: 26 critical findings identified. 18 automated Clean Core quick-fixes applied in E10K900150.',
      '[STAGE 2] HUMAN GATEWAY: 🛑 Paused for Checkpoint #2 (Remediation Plan & SUM Execution Approval)...',
      '[STAGE 2] HUMAN GATEWAY: ✅ Authorized by Transformation Lead. Resuming execution loop.',
      '[STAGE 3] SUM PREPARATION: Mounting Stack XML MP_Stack_E10_S4H2023_FPS02.xml in /usr/sap/SUM/abap.',
      '[STAGE 3] SUM PREPARATION: Creating shadow instance E10SHD on port 3200 (32GB RAM allocated).',
      '[STAGE 4] DOWNTIME START: Locking 450 dialog users in client 800. Queues SMQ1/SMQ2 drained and frozen.',
      '[STAGE 4] DOWNTIME START: SAN FlashCopy snapshot SNAP_E10_PRE_DOWNTIME created in 2.4 minutes.',
      '[STAGE 5] DMO & HANA: Parallel R3load 24-thread streaming migration to HANA 2.0 SPS07 in progress...',
      '[STAGE 5] DMO & HANA: Universal Journal conversion (FINS_MIG) complete. Trial Balance delta: $0.00.',
      '[STAGE 6] POST-UPGRADE: SPAU/SPDD finalized (100% resolved). Parallel SGEN load generation completed.',
      '[STAGE 7] FUNCTIONAL SMOKE: Live Order-to-Cash (OTC) & Procure-to-Pay (PTP) test runs passed cleanly.',
      '[STAGE 8] CUTOVER & GOLIVE: Unlocking production users, switching DNS, and activating Fiori Launchpad.',
      '🎉 [COMPLETION] SAP S/4HANA 2023 IS NOW LIVE! 24/7 Hypercare Telemetry Active. Stability Score: 99.8%.'
    ];

    logSteps.forEach((msg, idx) => {
      setTimeout(() => {
        setPythonSimOutput(prev => [...prev, msg]);
        if (idx === logSteps.length - 1) {
          setIsPythonRunning(false);
        }
      }, (idx + 1) * 600);
    });
  };

  const handleRestoreSnapshot = () => {
    setSnapshotRestoring(true);
    setTimeout(() => {
      setSnapshotRestoring(false);
      alert('SAN Storage snapshot restored to point-in-time baseline SNAP_E10_PRE_DOWNTIME. System isolated.');
    }, 1500);
  };

  return (
    <div className="w-full bg-[#080d1a] border border-indigo-900/60 rounded-2xl text-slate-200 overflow-hidden shadow-2xl font-sans">
      {/* Top Banner: In-Place Technical Upgrade Engine */}
      <div className="bg-gradient-to-r from-[#0c162e] via-[#12234e] to-[#0c162e] p-6 border-b border-indigo-900/60">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-3 flex-wrap gap-y-2">
              <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 rounded-full flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                AUTONOMOUS UPGRADE AGENT • IN-PLACE CONVERSION
              </span>
              <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                8 HUMAN-IN-THE-LOOP CHECKPOINTS
              </span>
              <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 rounded-full flex items-center gap-1">
                <Cpu className="w-3 h-3 text-cyan-400" />
                SUM 2.0 DMO & ZDM OPTIMIZED
              </span>
            </div>
            <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              SAP ECC 6.0 → SAP S/4HANA Autonomous In-Place Technical Upgrade
            </h1>
            <p className="text-xs text-slate-300 max-w-4xl leading-relaxed">
              Fully autonomous upgrade agent orchestrating system discovery, SAP Readiness Check, Simplification Item fixes, SUM 2.0 DMO execution, HANA database migration, and post-upgrade validation with 4-eyes human governance.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 self-start lg:self-center shrink-0">
            <div className="bg-[#0b1326]/90 border border-indigo-900/60 rounded-xl p-3 flex items-center space-x-3 shadow-lg">
              <div className="text-center px-2">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Source ECC</span>
                <div className="text-sm font-black text-amber-400">ECC 6.0 EhP8</div>
              </div>
              <div className="text-center px-2 border-l border-indigo-900/50">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Target Release</span>
                <div className="text-sm font-black text-emerald-400">S/4HANA 2023 FPS02</div>
              </div>
              <div className="text-center px-2 border-l border-indigo-900/50">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Downtime Window</span>
                <div className="text-sm font-black text-cyan-400">4.4h (ZDM Max)</div>
              </div>
            </div>
          </div>
        </div>

        {/* 8-Stage Progress Lifecycle Bar */}
        <div className="mt-6 pt-4 border-t border-indigo-950/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase text-indigo-300 tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              Autonomous Upgrade 8-Stage Lifecycle & Gateway Status
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Current Active Stage: <strong className="text-indigo-300 font-bold">{engine.stages[engine.activeStageIndex]?.title}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {engine.stages.map((stg) => {
              const isSelected = selectedStageId === stg.id;
              const isApproved = stg.humanCheckpoint.approved;
              const isWaiting = stg.status === 'WAITING_FOR_APPROVAL';
              const isCompleted = stg.status === 'COMPLETED';

              return (
                <button
                  key={stg.id}
                  onClick={() => setSelectedStageId(stg.id)}
                  className={`p-2.5 rounded-xl text-left transition-all border flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600/40 border-indigo-400 text-white shadow-lg shadow-indigo-950 scale-[1.02]'
                      : isCompleted
                      ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300 hover:bg-emerald-900/40'
                      : isWaiting
                      ? 'bg-amber-950/50 border-amber-500/60 text-amber-300 animate-pulse hover:bg-amber-900/50'
                      : 'bg-[#0b1326]/70 border-indigo-950/80 text-slate-400 hover:bg-indigo-950/50'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] font-black tracking-tight">Stage {stg.id}</span>
                    {isApproved ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    ) : isWaiting ? (
                      <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                    )}
                  </div>
                  <div className="mt-1 text-[10px] font-bold text-white truncate">{stg.phase}</div>
                  <div className="mt-1 flex items-center justify-between text-[9px]">
                    <span className="text-slate-400">Gate #{stg.humanCheckpoint.number}</span>
                    <span className={`font-bold ${isApproved ? 'text-emerald-400' : isWaiting ? 'text-amber-400' : 'text-slate-500'}`}>
                      {isApproved ? 'APPROVED' : isWaiting ? 'GATEWAY' : 'QUEUED'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="bg-[#070e20] px-6 py-2 border-b border-indigo-900/50 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2 text-xs flex-wrap">
          <button
            onClick={() => setSubView('workflow')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              subView === 'workflow' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-indigo-950/40'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            1. Full Autonomous Workflow & 8 Gateways
          </button>

          <button
            onClick={() => setSubView('architecture')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              subView === 'architecture' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-indigo-950/40'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            2. Agent Architecture & Dual-Engine Supervision
          </button>

          <button
            onClick={() => setSubView('python_script')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              subView === 'python_script' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-indigo-950/40'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            3. Python Orchestration Script (sap_upgrade_orchestrator.py)
          </button>

          <button
            onClick={() => setSubView('playbook_risks')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              subView === 'playbook_risks' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-indigo-950/40'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            4. End-to-End Playbook & Risk Matrix
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunPythonSimulation}
            disabled={isPythonRunning}
            className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg font-bold text-xs shadow flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isPythonRunning ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Simulating Live Python Orchestration...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Run Python Simulation</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="p-6">
        {/* ========================================================================= */}
        {/* VIEW 1: FULL AUTONOMOUS WORKFLOW & 8-CHECKPOINT COCKPIT                   */}
        {/* ========================================================================= */}
        {subView === 'workflow' && (
          <div className="space-y-6">
            {/* Active Stage Header & Human Checkpoint Action Box */}
            <div className="bg-gradient-to-r from-[#0d1e42] via-[#102450] to-[#0c162e] p-6 rounded-2xl border border-indigo-500/40 shadow-xl space-y-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[10px] font-bold rounded">
                      STAGE {activeStage.id} OF 8
                    </span>
                    <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold rounded">
                      LEAD AGENT: {activeStage.leadAgent}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                      activeStage.reversible ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}>
                      {activeStage.reversible ? 'REVERSIBLE (Pre-Downtime)' : 'POINT OF NO RETURN (Irreversible DMO)'}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-white mt-1.5">{activeStage.title}</h2>
                  <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">{activeStage.description}</p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                  {activeStage.snapshotRef && (
                    <button
                      onClick={handleRestoreSnapshot}
                      disabled={snapshotRestoring}
                      className="px-3 py-2 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      title="Trigger instantaneous SAN snapshot recovery"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      {snapshotRestoring ? 'Restoring Snapshot...' : 'Rollback Snapshot'}
                    </button>
                  )}
                </div>
              </div>

              {/* Human-in-the-Loop Checkpoint Gate Card */}
              <div className="bg-[#070e20] p-4 rounded-xl border border-amber-500/50 shadow-inner">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-indigo-900/50">
                  <div className="flex items-center space-x-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black ${
                      activeStage.humanCheckpoint.approved
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse'
                    }`}>
                      #{activeStage.humanCheckpoint.number}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                          HUMAN-IN-THE-LOOP CHECKPOINT #{activeStage.humanCheckpoint.number}
                        </span>
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                          activeStage.humanCheckpoint.approved
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {activeStage.humanCheckpoint.approved ? 'APPROVED & SIGNED OFF' : 'AWAITING MANDATORY HUMAN DECISION'}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white mt-0.5">{activeStage.humanCheckpoint.title}</h3>
                    </div>
                  </div>

                  {/* Approval Action Controls */}
                  <div className="flex items-center gap-2">
                    {!activeStage.humanCheckpoint.approved ? (
                      <>
                        <button
                          onClick={() => handleRejectCheckpoint(activeStage)}
                          className="px-3 py-2 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          Reject / Request Fix
                        </button>
                        <button
                          onClick={() => handleApproveCheckpoint(activeStage.humanCheckpoint)}
                          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-950 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Check className="w-4 h-4 text-white" />
                          <span>Authorize & Advance Stage</span>
                        </button>
                      </>
                    ) : (
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Signed Off By</span>
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {activeStage.humanCheckpoint.approvedBy} ({activeStage.humanCheckpoint.approvedAt})
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Gate Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 text-xs">
                  <div className="bg-[#0b1326] p-2.5 rounded-lg border border-indigo-950">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Mandatory Approver Role</span>
                    <p className="text-slate-200 font-bold mt-0.5">{activeStage.humanCheckpoint.mandatoryRole}</p>
                  </div>
                  <div className="bg-[#0b1326] p-2.5 rounded-lg border border-indigo-950">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Business Impact</span>
                    <p className="text-slate-300 mt-0.5">{activeStage.humanCheckpoint.businessImpact}</p>
                  </div>
                  <div className="bg-[#0b1326] p-2.5 rounded-lg border border-indigo-950">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Rollback Action</span>
                    <p className="text-amber-300 font-mono text-[11px] mt-0.5">{activeStage.humanCheckpoint.rollbackAction}</p>
                  </div>
                </div>
              </div>

              {/* Tasks & SAP Notes */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left: Tasks List */}
                <div className="lg:col-span-2 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase text-indigo-300 tracking-wider flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                      Stage {activeStage.id} Autonomous Tasks ({activeStage.tasks.length})
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">Live RFC Tool Execution</span>
                  </div>

                  <div className="space-y-2">
                    {activeStage.tasks.map((task) => (
                      <div key={task.id} className="bg-[#070e20] p-3 rounded-xl border border-indigo-900/40 space-y-2">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center space-x-2">
                            <span className="px-1.5 py-0.5 bg-indigo-950 text-indigo-400 border border-indigo-800 text-[9px] font-mono rounded">
                              {task.id}
                            </span>
                            <span className="text-xs font-bold text-white">{task.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 font-mono">Agent: <strong className="text-indigo-300">{task.agent}</strong></span>
                            <button
                              onClick={() => handleExecuteTaskSimulation(task.id)}
                              disabled={simulatingStep === task.id}
                              className="px-2 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            >
                              {simulatingStep === task.id ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <Play className="w-3 h-3" />
                              )}
                              Run Task
                            </button>
                          </div>
                        </div>

                        <div className="bg-[#040814] p-2 rounded font-mono text-[11px] text-cyan-300 border border-indigo-950 overflow-x-auto">
                          $ {task.toolCommand}
                        </div>

                        <p className="text-[11px] text-slate-300">{task.outputSummary}</p>

                        {task.logs.length > 0 && (
                          <div className="bg-[#02050e] p-2 rounded text-[10px] font-mono text-slate-400 space-y-0.5 border border-indigo-950/60 max-h-24 overflow-y-auto">
                            {task.logs.map((lg, idx) => (
                              <div key={idx} className="leading-tight">{lg}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Telemetry Stream & SAP Notes */}
                <div className="space-y-4">
                  {/* SAP Notes Box */}
                  <div className="bg-[#070e20] p-4 rounded-xl border border-indigo-900/40 space-y-2">
                    <h4 className="text-xs font-black uppercase text-indigo-300 tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                      SAP Best Practices & Notes
                    </h4>
                    <ul className="space-y-1.5 text-xs">
                      {activeStage.sapNotes.map((note, idx) => (
                        <li key={idx} className="p-2 bg-[#0b1326] rounded border border-indigo-950 text-slate-300 font-mono text-[11px] flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0" />
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Telemetry Log Feed */}
                  <div className="bg-[#070e20] p-4 rounded-xl border border-indigo-900/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase text-indigo-300 tracking-wider flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                        Stage Telemetry Log Stream
                      </h4>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    </div>

                    <div className="bg-[#030712] p-2.5 rounded-lg border border-indigo-950 font-mono text-[10px] text-slate-300 space-y-1 max-h-60 overflow-y-auto">
                      {activeStage.telemetryLogs.map((log, idx) => (
                        <div key={idx} className="leading-relaxed border-b border-indigo-950/40 pb-1">
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: AGENT ARCHITECTURE & DUAL-ENGINE SUPERVISION                      */}
        {/* ========================================================================= */}
        {subView === 'architecture' && (
          <div className="space-y-6">
            {/* Operational Lifecycle Protocol Banner */}
            <div className="bg-gradient-to-r from-[#0d1e42] to-[#0c162e] p-5 rounded-2xl border border-indigo-500/40 shadow-xl space-y-3">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Workflow className="w-4 h-4 text-indigo-400" />
                Autonomous 9-Step Operational Lifecycle Protocol
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                {engine.agentArchitecture.orchestrationLoop.map((step, idx) => (
                  <div key={idx} className="p-2.5 bg-[#070e20] rounded-lg border border-indigo-900/50 text-slate-300">
                    <strong className="text-white block">{step.split(':')[0]}</strong>
                    <span className="text-[11px] text-slate-400">{step.split(':')[1]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dual Engine Cross-Validation Architecture */}
            <div className="bg-[#070e20] p-5 rounded-2xl border border-indigo-900/50 space-y-3">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                Dual-Engine Cross-Validation Architecture (Zero-Tolerance Policy)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-[#0b1326] rounded-xl border border-indigo-900/60 space-y-2">
                  <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-[10px] font-bold rounded">ENGINE A: RUNTIME</span>
                  <h4 className="text-sm font-bold text-white">{engine.agentArchitecture.dualEngineSupervision.engineA}</h4>
                  <p className="text-slate-300 text-[11px]">
                    Directly interacts with SAP RFC endpoints, SUM tool socket APIs, and database migrations.
                  </p>
                </div>
                <div className="p-4 bg-[#0b1326] rounded-xl border border-indigo-900/60 space-y-2">
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded">ENGINE B: SUPERVISOR</span>
                  <h4 className="text-sm font-bold text-white">{engine.agentArchitecture.dualEngineSupervision.engineB}</h4>
                  <p className="text-slate-300 text-[11px]">
                    Cross-validates data dictionary invariants, financial balance sums, and enforces the 4-eyes Human Approval Gateway.
                  </p>
                </div>
              </div>
              <p className="text-xs text-amber-300 font-mono bg-amber-950/30 p-2.5 rounded-lg border border-amber-800/40">
                🔒 {engine.agentArchitecture.dualEngineSupervision.reconciliationProtocol}
              </p>
            </div>

            {/* Specialized Upgrade Agents Grid */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                Specialized Upgrade Agent Swarm (24 Roles)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {engine.agentArchitecture.agentHierarchy.map((ag, idx) => (
                  <div key={idx} className="bg-[#070e20] p-4 rounded-xl border border-indigo-900/50 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-cyan-400 font-bold">{ag.domain}</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      </div>
                      <h4 className="text-sm font-black text-white mt-1">{ag.name}</h4>
                      <p className="text-[11px] text-indigo-300 font-semibold">{ag.role}</p>
                      <p className="text-xs text-slate-300 mt-2 leading-relaxed">{ag.decisionLogic}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-indigo-950 space-y-1 text-[10px]">
                      <div className="text-slate-400">Tools: <span className="text-slate-200 font-mono">{ag.tools.join(', ')}</span></div>
                      <div className="text-slate-400">Triggers: <span className="text-amber-300 font-mono">{ag.triggers.join(', ')}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: PYTHON ORCHESTRATION SCRIPT (RUNNABLE)                            */}
        {/* ========================================================================= */}
        {subView === 'python_script' && (
          <div className="space-y-4">
            {/* Action Bar */}
            <div className="bg-[#070e20] p-4 rounded-xl border border-indigo-900/50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedScriptTab('script')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    selectedScriptTab === 'script' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5 inline mr-1" />
                  Python Script (sap_upgrade_orchestrator.py)
                </button>
                <button
                  onClick={() => setSelectedScriptTab('simulator')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    selectedScriptTab === 'simulator' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5 inline mr-1" />
                  Live Execution Console
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyScript}
                  className="px-3 py-1.5 bg-[#0b1326] hover:bg-indigo-950 text-slate-200 border border-indigo-900 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedScript ? 'Copied' : 'Copy Script'}
                </button>
                <button
                  onClick={handleDownloadScript}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download .py
                </button>
                <button
                  onClick={handleRunPythonSimulation}
                  disabled={isPythonRunning}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  Execute Simulation
                </button>
              </div>
            </div>

            {selectedScriptTab === 'script' ? (
              <div className="bg-[#030712] p-4 rounded-xl border border-indigo-950 font-mono text-xs text-slate-300 overflow-x-auto max-h-[600px] overflow-y-auto leading-relaxed">
                <pre>{engine.pythonOrchestrationScript}</pre>
              </div>
            ) : (
              <div className="bg-[#02050e] p-4 rounded-xl border border-indigo-950 font-mono text-xs text-emerald-400 space-y-1.5 max-h-[600px] overflow-y-auto">
                <div className="text-slate-400 pb-2 border-b border-indigo-950 flex items-center justify-between">
                  <span>SAP S/4HANA Autonomous Python Orchestration Terminal</span>
                  {isPythonRunning && <span className="text-amber-400 animate-pulse">Running live checks...</span>}
                </div>
                {pythonSimOutput.length === 0 ? (
                  <p className="text-slate-500 py-8 text-center">Click "Execute Simulation" to run the complete end-to-end upgrade agent logic.</p>
                ) : (
                  pythonSimOutput.map((line, idx) => (
                    <div key={idx} className={`${
                      line.includes('ERROR') ? 'text-rose-400 font-bold' :
                      line.includes('COMPLETION') || line.includes('SUCCESS') ? 'text-emerald-300 font-bold' :
                      line.includes('GATEWAY') || line.includes('Paused') ? 'text-amber-300 font-bold' :
                      'text-slate-300'
                    }`}>
                      {line}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 4: PLAYBOOK & RISK MITIGATION MATRIX                                 */}
        {/* ========================================================================= */}
        {subView === 'playbook_risks' && (
          <div className="space-y-6">
            {/* Playbook Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                End-to-End Upgrade Playbook & Technical Conversion Runbook
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {engine.upgradePlaybook.map((pb, idx) => (
                  <div key={idx} className="bg-[#070e20] p-4 rounded-xl border border-indigo-900/50 space-y-3">
                    <div>
                      <span className="text-[10px] font-mono text-indigo-400 font-bold">Phase Module {idx + 1}</span>
                      <h4 className="text-sm font-bold text-white mt-0.5">{pb.section}</h4>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Standard Steps</span>
                      <ul className="space-y-1 text-xs text-slate-300">
                        {pb.steps.map((st, sIdx) => (
                          <li key={sIdx} className="flex items-start gap-1.5">
                            <span className="text-indigo-400 font-bold">•</span>
                            <span>{st}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-[#040814] p-2.5 rounded font-mono text-[11px] text-cyan-300 border border-indigo-950 space-y-1">
                      <span className="text-[10px] text-slate-400 block font-sans uppercase font-semibold">Critical Commands</span>
                      {pb.criticalCommands.map((cmd, cIdx) => (
                        <div key={cIdx}>$ {cmd}</div>
                      ))}
                    </div>

                    <div className="text-[11px] text-amber-300 bg-amber-950/30 p-2 rounded border border-amber-900/40">
                      <strong>Contingency:</strong> {pb.contingency}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk & Mitigation Matrix */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Compliance-Ready Risk & Mitigation Matrix (RTO / RPO Aligned)
              </h3>
              <div className="overflow-x-auto bg-[#070e20] rounded-xl border border-indigo-900/50">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#0b1326] text-slate-400 border-b border-indigo-900/50 text-[10px] uppercase font-bold">
                    <tr>
                      <th className="p-3">Risk ID</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Failure Scenario</th>
                      <th className="p-3">Impact</th>
                      <th className="p-3">Trigger Signal</th>
                      <th className="p-3">Autonomous Mitigation</th>
                      <th className="p-3">RTO / RPO</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-indigo-950">
                    {engine.riskMitigationMatrix.map((rsk) => (
                      <tr key={rsk.riskId} className="hover:bg-indigo-950/30">
                        <td className="p-3 font-mono font-bold text-indigo-300">{rsk.riskId}</td>
                        <td className="p-3 text-slate-300 font-semibold">{rsk.category}</td>
                        <td className="p-3 text-slate-200 max-w-xs">{rsk.scenario}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                            rsk.impact === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {rsk.impact}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400 font-mono text-[11px]">{rsk.triggerSignal}</td>
                        <td className="p-3 text-emerald-300 text-[11px]">{rsk.autonomousMitigation}</td>
                        <td className="p-3 font-mono text-slate-400 whitespace-nowrap">
                          {rsk.rtoHours}h / {rsk.rpoHours}h
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rejection / Request Fix Modal */}
      {rejectionModalStage && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#0d162e] border border-rose-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center space-x-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">
                Reject / Request Governance Fix for Stage {rejectionModalStage.id}
              </h3>
            </div>
            <p className="text-xs text-slate-300">
              Pauses autonomous upgrade execution and logs an authoritative audit finding. Specify the remediation or compliance constraint:
            </p>
            <textarea
              value={rejectionReasonInput}
              onChange={(e) => setRejectionReasonInput(e.target.value)}
              placeholder="e.g. Unposted depreciation run for 08/2026 must be settled before downtime..."
              rows={3}
              className="w-full bg-[#070e20] border border-indigo-900 rounded-xl p-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectionModalStage(null)}
                className="px-4 py-2 bg-[#0b1326] text-slate-300 rounded-xl text-xs font-bold hover:bg-indigo-950"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRejection}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow"
              >
                Confirm Rejection & Halt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
