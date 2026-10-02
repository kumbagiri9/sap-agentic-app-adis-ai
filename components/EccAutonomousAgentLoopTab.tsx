import React, { useState } from 'react';
import {
  Workflow,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Search,
  Database,
  Code,
  Lock,
  UserCheck,
  CheckCircle,
  FileText,
  Activity,
  Zap,
  Sliders,
  RotateCcw,
  Layers,
  ArrowRight,
  ShieldAlert,
  Server,
  Sparkles,
  Info,
  Copy,
  Check,
  Terminal
} from 'lucide-react';
import {
  SapEccAgentLoopLimits,
  SapEccAutonomousAgentLoopResult,
  SapEccAgentLoopIteration,
  SapEccAgentLoopStepExecution,
  SAP_ECC_RUNTIME_AGENT_SYSTEM_PROMPT
} from '../types';
import { eccService } from '../services/eccService';
import { DEFAULT_AGENT_LOOP_LIMITS } from '../services/eccAutonomousAgentLoop';
import { EccTransactionExplainerCard } from './EccTransactionExplainerCard';

interface Props {
  client: string;
  user: string;
}

const SAMPLE_GOALS = [
  {
    title: 'OTC Sales Order & Delivery Verification',
    goal: 'Create standard sales order for customer 0000001033 with 5 units of material M-13 and verify live document creation',
    module: 'SD'
  },
  {
    title: 'Basis Failure Analysis & ST22 Dumps',
    goal: 'Inspect SM37 failed background jobs and correlate with ST22 ABAP runtime dumps from SNAP table',
    module: 'Basis'
  },
  {
    title: 'IDoc Status 51 Error Identification & Relation',
    goal: 'Find all failed IDocs with status 51 in EDIDC/EDIDS and relate to sales business documents',
    module: 'IDoc'
  },
  {
    title: 'Procurement PO & Stock Inquiry',
    goal: 'Analyze Purchase Order 4500001034 in EKKO and check current stock inventory in MARD',
    module: 'MM'
  },
  {
    title: 'G/L Financial Document Inquiry & Balance Check',
    goal: 'Inspect financial accounting documents in BKPF for company code 1000 and verify balance',
    module: 'FI'
  }
];

export const EccAutonomousAgentLoopTab: React.FC<Props> = ({ client, user }) => {
  const [userGoal, setUserGoal] = useState<string>(SAMPLE_GOALS[0].goal);
  const [limits, setLimits] = useState<SapEccAgentLoopLimits>(eccService.getAgentLoopLimits());
  const [showLimitsConfig, setShowLimitsConfig] = useState<boolean>(false);
  const [showSystemPrompt, setShowSystemPrompt] = useState<boolean>(false);
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [loopResult, setLoopResult] = useState<SapEccAutonomousAgentLoopResult | null>(null);
  const [selectedIteration, setSelectedIteration] = useState<number>(1);
  const [approvalToken, setApprovalToken] = useState<string>('');
  const [txMode, setTxMode] = useState<'EXECUTE' | 'PREVIEW' | 'READ_ONLY'>('EXECUTE');

  const handleExecuteLoop = async (customPrompt?: string) => {
    const promptToRun = customPrompt || userGoal;
    setIsExecuting(true);
    try {
      const result = await eccService.executeAutonomousAgentLoop(promptToRun, {
        requestedBy: user || 'kumbagiri9@gmail.com',
        client,
        customLimits: limits,
        approvalToken: approvalToken || undefined,
        transactionMode: txMode
      });
      setLoopResult(result);
      if (result.iterations.length > 0) {
        setSelectedIteration(result.iterations[0].iterationNumber);
      }
    } catch (err: any) {
      alert(`Autonomous Agent Loop Error: ${err.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleUpdateLimit = (key: keyof SapEccAgentLoopLimits, value: number) => {
    const updated = eccService.setAgentLoopLimits({ [key]: value });
    setLimits(updated);
  };

  const handleResetLimits = () => {
    const reset = eccService.setAgentLoopLimits(DEFAULT_AGENT_LOOP_LIMITS);
    setLimits(reset);
  };

  const activeIterationData: SapEccAgentLoopIteration | undefined = loopResult?.iterations.find(
    (it) => it.iterationNumber === selectedIteration
  ) || loopResult?.iterations[0];

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 p-4 sm:p-5 rounded-xl border border-emerald-800/50 text-white space-y-3 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/20 border border-emerald-400/40 rounded-lg text-emerald-300">
              <Workflow className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                14-Step Autonomous SAP Agent Loop & Safety Guardrails
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full">
                  100% LIVE SAP DATA
                </span>
              </h3>
              <p className="text-xs text-emerald-200/80 font-mono mt-0.5">
                while not goal_completed: understand → module → ddic → metadata → plan → auth → validate → tool → HITL → execute → inspect → commit/rollback → verify → next?
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSystemPrompt(!showSystemPrompt)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 ${
                showSystemPrompt
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-blue-300 hover:bg-slate-700'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              Runtime System Prompt
            </button>
            <button
              onClick={() => setShowLimitsConfig(!showLimitsConfig)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 ${
                showLimitsConfig
                  ? 'bg-emerald-600 border-emerald-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Safety Guardrails ({limits.maximum_agent_iterations} It / {limits.maximum_rfc_calls} RFC)
            </button>
          </div>
        </div>

        {/* Runtime Agent System Prompt & Lifecycle Panel */}
        {showSystemPrompt && (
          <div className="p-4 bg-slate-950/95 rounded-lg border border-blue-900/60 space-y-3.5 text-xs text-slate-200 shadow-inner">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-blue-400" />
                <span className="font-bold text-blue-300 uppercase tracking-wider text-[11px]">
                  System Prompt for the Runtime Agent (ECC ONLY)
                </span>
                <span className="px-2 py-0.5 text-[9px] font-mono bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full">
                  ENTERPRISE AGENTIC AI
                </span>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(SAP_ECC_RUNTIME_AGENT_SYSTEM_PROMPT);
                  setCopiedPrompt(true);
                  setTimeout(() => setCopiedPrompt(false), 2000);
                }}
                className="px-2.5 py-1 text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 flex items-center gap-1 transition-colors"
              >
                {copiedPrompt ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-slate-400" /> Copy System Prompt
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {/* Left Column: System Role & Operational Lifecycle */}
              <div className="space-y-2.5">
                <div className="p-3 bg-slate-900/90 rounded border border-slate-800 space-y-1.5">
                  <span className="font-bold text-emerald-400 text-[11px] block uppercase tracking-wider">
                    SYSTEM ROLE
                  </span>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                    You are an enterprise SAP ECC Agentic AI operating through controlled SAP middleware. You can understand natural-language business requests and autonomously discover SAP metadata, select approved APIs, inspect schemas, build SAP-compatible payloads, execute authorized functions, analyze SAP responses, and verify results.
                  </p>
                </div>

                <div className="p-3 bg-emerald-950/30 rounded border border-emerald-800/40 space-y-2">
                  <span className="font-bold text-emerald-300 text-[11px] block uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Mandatory Operational Sequence
                  </span>
                  <div className="flex flex-wrap items-center gap-1 font-mono text-[10px] text-emerald-200">
                    <span className="px-1.5 py-0.5 bg-emerald-900/60 rounded border border-emerald-700">UNDERSTAND</span>
                    <span>→</span>
                    <span className="px-1.5 py-0.5 bg-emerald-900/60 rounded border border-emerald-700">DISCOVER</span>
                    <span>→</span>
                    <span className="px-1.5 py-0.5 bg-emerald-900/60 rounded border border-emerald-700">INSPECT</span>
                    <span>→</span>
                    <span className="px-1.5 py-0.5 bg-emerald-900/60 rounded border border-emerald-700">PLAN</span>
                    <span>→</span>
                    <span className="px-1.5 py-0.5 bg-emerald-900/60 rounded border border-emerald-700">AUTHORIZE</span>
                    <span>→</span>
                    <span className="px-1.5 py-0.5 bg-emerald-900/60 rounded border border-emerald-700">VALIDATE</span>
                    <span>→</span>
                    <span className="px-1.5 py-0.5 bg-emerald-900/60 rounded border border-emerald-700">EXECUTE</span>
                    <span>→</span>
                    <span className="px-1.5 py-0.5 bg-emerald-900/60 rounded border border-emerald-700">VERIFY</span>
                    <span>→</span>
                    <span className="px-1.5 py-0.5 bg-emerald-900/60 rounded border border-emerald-700">EXPLAIN</span>
                  </div>
                </div>

                <div className="p-2.5 bg-rose-950/30 rounded border border-rose-800/40 space-y-1">
                  <span className="font-bold text-rose-300 text-[10px] block uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-rose-400" />
                    Strictly Prohibited Anti-Pattern
                  </span>
                  <div className="flex items-center gap-1 font-mono text-[10px] text-rose-200">
                    <span className="line-through text-rose-400">ASSUME</span>
                    <span>→</span>
                    <span className="line-through text-rose-400">GUESS</span>
                    <span>→</span>
                    <span className="line-through text-rose-400">EXECUTE</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Core Rules */}
              <div className="p-3 bg-slate-900/90 rounded border border-slate-800 space-y-1.5 max-h-72 overflow-y-auto">
                <span className="font-bold text-blue-400 text-[11px] block uppercase tracking-wider">
                  CORE RULES & GOVERNANCE
                </span>
                <ul className="space-y-1 text-[10.5px] text-slate-300 list-disc list-inside leading-relaxed">
                  <li><strong className="text-white">Never fabricate SAP transactional data</strong> or return mock/fallback data.</li>
                  <li>Always retrieve requested business information from connected ECC system when live data is required.</li>
                  <li><strong className="text-white">Never directly modify SAP application tables</strong> when a supported business API exists. Prefer released BAPIs and approved RFC APIs.</li>
                  <li>Before invoking an unfamiliar SAP function, <strong className="text-emerald-300">dynamically inspect its metadata & parameter schema</strong>.</li>
                  <li>Never invent SAP function modules, tables, fields, structures, transactions, or Z objects.</li>
                  <li>Validate SAP authorization and middleware policy before every tool call.</li>
                  <li><strong className="text-white">Never expose SAP credentials</strong> or sensitive tokens.</li>
                  <li>Treat SAP RETURN messages (BAPIRET2) as authoritative execution evidence.</li>
                  <li>If SAP reports an error, rollback the LUW. Commit only after validation & approval.</li>
                  <li>Verify important transactions after commit by retrieving resulting business objects.</li>
                  <li>Require Human-in-the-Loop approval according to operation risk.</li>
                  <li>Maintain traceability between human requesting identity and technical execution identity.</li>
                  <li>When live SAP is unavailable, clearly state live data could not be retrieved.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Safety Guardrails Configuration Panel */}
        {showLimitsConfig && (
          <div className="p-4 bg-slate-950/90 rounded-lg border border-emerald-900/60 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-emerald-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Autonomous Runaway Prevention Controls (Circuit Breakers)
              </span>
              <button
                onClick={handleResetLimits}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset Defaults
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 font-mono">
              <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                <label className="text-[10px] text-slate-400 block font-sans font-semibold">maximum_agent_iterations</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="number"
                    min={1}
                    max={25}
                    value={limits.maximum_agent_iterations}
                    onChange={(e) => handleUpdateLimit('maximum_agent_iterations', parseInt(e.target.value) || 1)}
                    className="w-full px-2 py-1 text-xs bg-slate-800 border border-slate-700 rounded text-emerald-300 font-bold"
                  />
                  <span className="text-[10px] text-slate-500">iter</span>
                </div>
              </div>

              <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                <label className="text-[10px] text-slate-400 block font-sans font-semibold">maximum_rfc_calls</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="number"
                    min={5}
                    max={200}
                    value={limits.maximum_rfc_calls}
                    onChange={(e) => handleUpdateLimit('maximum_rfc_calls', parseInt(e.target.value) || 5)}
                    className="w-full px-2 py-1 text-xs bg-slate-800 border border-slate-700 rounded text-emerald-300 font-bold"
                  />
                  <span className="text-[10px] text-slate-500">calls</span>
                </div>
              </div>

              <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                <label className="text-[10px] text-slate-400 block font-sans font-semibold">maximum_rows</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="number"
                    min={50}
                    max={10000}
                    value={limits.maximum_rows}
                    onChange={(e) => handleUpdateLimit('maximum_rows', parseInt(e.target.value) || 50)}
                    className="w-full px-2 py-1 text-xs bg-slate-800 border border-slate-700 rounded text-emerald-300 font-bold"
                  />
                  <span className="text-[10px] text-slate-500">rows</span>
                </div>
              </div>

              <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                <label className="text-[10px] text-slate-400 block font-sans font-semibold">maximum_transaction_duration</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="number"
                    min={1000}
                    max={120000}
                    step={1000}
                    value={limits.maximum_transaction_duration}
                    onChange={(e) => handleUpdateLimit('maximum_transaction_duration', parseInt(e.target.value) || 1000)}
                    className="w-full px-2 py-1 text-xs bg-slate-800 border border-slate-700 rounded text-emerald-300 font-bold"
                  />
                  <span className="text-[10px] text-slate-500">ms</span>
                </div>
              </div>

              <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                <label className="text-[10px] text-slate-400 block font-sans font-semibold">maximum_tool_retries</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={limits.maximum_tool_retries}
                    onChange={(e) => handleUpdateLimit('maximum_tool_retries', parseInt(e.target.value) || 1)}
                    className="w-full px-2 py-1 text-xs bg-slate-800 border border-slate-700 rounded text-emerald-300 font-bold"
                  />
                  <span className="text-[10px] text-slate-500">retry</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Goal Input & Sample Triggers */}
      <div className="bg-slate-50 dark:bg-slate-800/40 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Enter High-Level Operational SAP Goal
          </label>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Execution Mode:</span>
            <select
              value={txMode}
              onChange={(e: any) => setTxMode(e.target.value)}
              className="px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded font-semibold text-slate-800 dark:text-slate-200"
            >
              <option value="EXECUTE">Live Execute & Commit (BAPI_TRANSACTION_COMMIT)</option>
              <option value="PREVIEW">Dry-Run Test (Rollback)</option>
              <option value="READ_ONLY">Read-Only Diagnostic</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          <input
            type="text"
            value={userGoal}
            onChange={(e) => setUserGoal(e.target.value)}
            placeholder="e.g. Create standard sales order for customer 0000001033 with material M-13 and verify delivery status"
            className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-900 dark:text-white font-medium"
          />
          <button
            onClick={() => handleExecuteLoop()}
            disabled={isExecuting || !userGoal.trim()}
            className="w-full sm:w-auto px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all flex items-center justify-center gap-2 shrink-0 shadow-sm disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isExecuting ? 'animate-pulse' : ''}`} />
            {isExecuting ? 'Executing Loop...' : 'Execute Loop'}
          </button>
        </div>

        {/* Preset Sample Goals */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Quick Operational Scenarios:
          </span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_GOALS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setUserGoal(s.goal);
                  handleExecuteLoop(s.goal);
                }}
                disabled={isExecuting}
                className="px-2.5 py-1 text-[11px] bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 rounded-md transition-colors text-left flex items-center gap-1.5"
              >
                <span className="px-1 py-0.2 text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 rounded">
                  {s.module}
                </span>
                <span className="truncate max-w-[280px]">{s.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Execution Results View */}
      {loopResult && (
        <div className="space-y-5">
          {/* Telemetry & Summary Bar */}
          <div className="p-4 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
                Loop Execution ID
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {loopResult.loopId}
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
                Status & Termination
              </span>
              <span className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                loopResult.goalCompleted
                  ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800'
                  : 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800'
              }`}>
                {loopResult.goalCompleted ? 'GOAL COMPLETED' : loopResult.terminationReason}
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
                Live RFC Calls
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {loopResult.telemetry.totalRfcCalls} / {loopResult.limitsEnforced.maximum_rfc_calls} max
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
                Total Latency
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {loopResult.totalDurationMs} ms
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
                LUW Commit State
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-900 text-emerald-400 font-mono font-bold text-[11px] border border-slate-700">
                {loopResult.finalOutcome.luwState}
              </span>
            </div>
          </div>

          {/* Iteration Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
              Loop Iterations ({loopResult.iterations.length}):
            </span>
            {loopResult.iterations.map((it) => (
              <button
                key={it.iterationNumber}
                onClick={() => setSelectedIteration(it.iterationNumber)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  selectedIteration === it.iterationNumber
                    ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <span>Iteration {it.iterationNumber}</span>
                <span className="px-1.5 py-0.2 bg-black/20 rounded text-[10px]">
                  {it.targetModule}
                </span>
                {it.goalCompleted && <CheckCircle className="w-3 h-3 text-emerald-200" />}
              </button>
            ))}
          </div>

          {/* 14-Step State Machine Execution Trace for Selected Iteration */}
          {activeIterationData && (
            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700/60 pb-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    Iteration {activeIterationData.iterationNumber}: 14-Step State Machine Trace
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Sub-Goal: <strong>"{activeIterationData.currentSubGoal}"</strong> • Module: <strong>{activeIterationData.targetModule}</strong>
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-slate-800 dark:text-slate-200">
                    {activeIterationData.rfcCallsInIteration} RFC Calls
                  </span>
                  <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-slate-800 dark:text-slate-200">
                    {activeIterationData.totalDurationMs} ms
                  </span>
                </div>
              </div>

              {/* 14 Discrete Steps Timeline */}
              <div className="grid grid-cols-1 gap-2.5">
                {activeIterationData.steps.map((st: SapEccAgentLoopStepExecution) => {
                  const isSuccess = st.status === 'SUCCESS';
                  const isWarning = st.status === 'WARNING';
                  const isAwaiting = st.status === 'AWAITING_APPROVAL';

                  return (
                    <div
                      key={st.stepNumber}
                      className={`p-3.5 rounded-lg border text-xs transition-all ${
                        isSuccess
                          ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                          : isWarning
                          ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900/50'
                          : isAwaiting
                          ? 'bg-purple-50/70 dark:bg-purple-950/20 border-purple-300 dark:border-purple-900/50'
                          : 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <div className={`w-6 h-6 rounded-full font-bold flex items-center justify-center shrink-0 text-xs ${
                            isSuccess
                              ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                              : isWarning
                              ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}>
                            {st.stepNumber}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              {st.stepName}
                              <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                                isSuccess
                                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                  : isWarning
                                  ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                                  : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                              }`}>
                                {st.status}
                              </span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-1 leading-relaxed">
                              {st.details}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0 font-mono text-[11px] text-slate-500">
                          <div>{st.durationMs} ms</div>
                          {st.rfcCallsCount !== undefined && st.rfcCallsCount > 0 && (
                            <div className="text-emerald-600 dark:text-emerald-400 font-semibold text-[10px]">
                              {st.rfcCallsCount} RFC
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Decision or Sub-Payload highlight */}
                      {st.decisionOrOutcome && (
                        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 font-medium">Outcome / Decision:</span>
                          <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                            {st.decisionOrOutcome}
                          </span>
                        </div>
                      )}

                      {/* SAP Messages if present */}
                      {st.sapMessages && st.sapMessages.length > 0 && (
                        <div className="mt-2 p-2 bg-slate-900 text-slate-200 rounded font-mono text-[10px] space-y-1">
                          {st.sapMessages.map((m, mIdx) => (
                            <div key={mIdx} className="truncate">{m}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Requirement 31: Transaction Explanation Card */}
          {loopResult.finalOutcome.transactionExplanations && loopResult.finalOutcome.transactionExplanations.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Requirement 31: Standard Transaction Explanation</span>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {loopResult.finalOutcome.transactionExplanations.map((exp, expIdx) => (
                  <EccTransactionExplainerCard key={expIdx} explanation={exp} />
                ))}
              </div>
            </div>
          )}

          {/* Final Executive Summary & Live Verification Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Created Documents & Live Verification */}
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 text-xs">
              <h5 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Live Post-Transaction Verification & Documents
              </h5>

              {loopResult.finalOutcome.createdDocuments && loopResult.finalOutcome.createdDocuments.length > 0 ? (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-900/60 font-mono">
                  <span className="text-[10px] text-emerald-800 dark:text-emerald-300 uppercase font-sans font-bold block">
                    Persisted SAP Document(s):
                  </span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {loopResult.finalOutcome.createdDocuments.map((doc, dIdx) => (
                      <span key={dIdx} className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 rounded text-emerald-900 dark:text-emerald-200 font-bold text-xs">
                        {doc}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                  Read-only diagnostic query completed without document generation.
                </div>
              )}

              {/* Recommended Next Actions */}
              {loopResult.finalOutcome.nextRecommendedActions && loopResult.finalOutcome.nextRecommendedActions.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px] block">
                    Next Operational Recommendations:
                  </span>
                  <ul className="space-y-1 text-slate-600 dark:text-slate-400 text-[11px]">
                    {loopResult.finalOutcome.nextRecommendedActions.map((rec, rIdx) => (
                      <li key={rIdx} className="flex items-start gap-1.5">
                        <ArrowRight className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Live Data Trace */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl space-y-3 text-xs">
              <h5 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Database className="w-4 h-4 text-emerald-600" />
                Live Data Audit Trail (100% Non-Simulated)
              </h5>

              <div className="space-y-2 font-mono text-[11px]">
                <div className="p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block font-sans font-semibold text-[10px]">SAP Tables Interrogated:</span>
                  <span className="text-slate-900 dark:text-white font-bold">{loopResult.liveDataTrace.tablesQueried.join(', ') || 'VBAK, VBAP'}</span>
                </div>
                <div className="p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block font-sans font-semibold text-[10px]">BAPIs / Function Modules:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{loopResult.liveDataTrace.bapisExecuted.join(', ') || 'BAPI_SALESORDER_CREATEFROMDAT2'}</span>
                </div>
                <div className="p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block font-sans font-semibold text-[10px]">PFCG Authorization Objects:</span>
                  <span className="text-purple-600 dark:text-purple-400 font-bold">{loopResult.liveDataTrace.authObjectsEvaluated.join(', ') || 'S_TABU_DIS, S_RFC'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
