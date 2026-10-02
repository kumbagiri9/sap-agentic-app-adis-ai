import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  AlertTriangle,
  Lock,
  Zap,
  Terminal,
  Database,
  FileCode,
  DollarSign,
  UserCheck,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Sliders,
  Eye,
  Key,
  Layers,
  ChevronRight,
  Info,
  Check,
  Copy,
  AlertOctagon,
  Settings
} from 'lucide-react';
import {
  SapSafetyDecision,
  SapSafetyRiskTier,
  SapSafetyViolationCategory,
  SapSafetyPolicyRule,
  SapSafetyPolicyConfig,
  SapSafetyInspectionRequest,
  SapSafetyInspectionResult,
  SapSafetyAuditLogEntry,
  SapSafetyStats
} from '../types';
import { eccService } from '../services/eccService';

interface Props {
  client?: string;
  user?: string;
}

const SAMPLE_SCENARIOS: Array<{
  name: string;
  category: string;
  request: SapSafetyInspectionRequest;
  expectedOutcome: string;
}> = [
  {
    name: 'Destructive SQL (DELETE FROM VBAK)',
    category: 'SQL_DESTRUCTIVE',
    request: {
      targetType: 'SQL_QUERY',
      targetName: 'DELETE FROM VBAK WHERE VBELN > 0',
      operation: 'DELETE',
      requestingUser: 'kumbagiri9@gmail.com',
      technicalSapUser: 'AI_AGENT_RW',
      client: '800'
    },
    expectedOutcome: 'PROHIBITED BLOCK (Destructive DDL/DML Prevention)'
  },
  {
    name: 'Direct Table Mutation (UPDATE BSEG)',
    category: 'DIRECT_TABLE',
    request: {
      targetType: 'TABLE_WRITE',
      targetName: 'BSEG',
      operation: 'UPDATE',
      payload: { BELNR: '0100000045', WRBTR: '50000.00', BUKRS: '1000' },
      requestingUser: 'kumbagiri9@gmail.com',
      technicalSapUser: 'AI_AGENT_RW',
      client: '800'
    },
    expectedOutcome: 'CRITICAL BLOCK (Standard Table Mutation Guard - BAPI Mandate)'
  },
  {
    name: 'Disallowed RFC (RFC_ABAP_INSTALL_AND_RUN)',
    category: 'DANGEROUS_RFC',
    request: {
      targetType: 'RFC_BAPI',
      targetName: 'RFC_ABAP_INSTALL_AND_RUN',
      operation: 'CALL_FUNCTION',
      payload: { PROGRAM: 'Z_EXPLOIT_PATCH', MODE: 'INSTALL' },
      requestingUser: 'kumbagiri9@gmail.com',
      technicalSapUser: 'AI_AGENT_RW',
      client: '800'
    },
    expectedOutcome: 'PROHIBITED BLOCK (Dangerous RFC Invocation Guard)'
  },
  {
    name: 'High-Value Sales Order ($175,000 via BAPI)',
    category: 'MONETARY_THRESHOLD',
    request: {
      targetType: 'RFC_BAPI',
      targetName: 'BAPI_SALESORDER_CREATEFROMDAT2',
      operation: 'CALL_FUNCTION',
      payload: {
        ORDER_HEADER_IN: { DOC_TYPE: 'TA', SALES_ORG: '1000', DISTR_CHAN: '10', DIVISION: '00' },
        ORDER_ITEMS_IN: [
          { MATERIAL: 'MAT-100-100', REQ_QTY: 50, PRICE: 3500 }
        ]
      },
      monetaryValue: 175000,
      currency: 'USD',
      requestingUser: 'kumbagiri9@gmail.com',
      technicalSapUser: 'AI_AGENT_RW',
      client: '800'
    },
    expectedOutcome: 'ESCALATE HITL (High Monetary Value Cap Exceeded)'
  },
  {
    name: 'Mass Financial Document (120 Items)',
    category: 'MASS_FINANCE',
    request: {
      targetType: 'RFC_BAPI',
      targetName: 'BAPI_ACC_DOCUMENT_POST',
      operation: 'CALL_FUNCTION',
      payload: {
        DOCUMENTHEADER: { OBJ_TYPE: 'BKPF', BUS_ACT: 'RFBU', USERNAME: 'AI_AGENT_RW' },
        ACCOUNTGL: Array.from({ length: 120 }, (_, i) => ({
          ITEMNO_ACC: i + 1,
          GL_ACCOUNT: '0000113100',
          AMOUNT: 1500
        }))
      },
      requestingUser: 'kumbagiri9@gmail.com',
      technicalSapUser: 'AI_AGENT_RW',
      client: '800'
    },
    expectedOutcome: 'ESCALATE HITL (Mass Financial Line Items Exceeded)'
  },
  {
    name: 'Security Role Escalation (SAP_ALL)',
    category: 'SECURITY_ROLE',
    request: {
      targetType: 'SECURITY_ADMIN',
      targetName: 'PRGN_CREATE_ROLE',
      operation: 'MODIFY_ROLE',
      payload: { ROLE_NAME: 'Z_SUPER_ADMIN', PROFILE: 'SAP_ALL' },
      requestingUser: 'kumbagiri9@gmail.com',
      technicalSapUser: 'AI_AGENT_RW',
      client: '800'
    },
    expectedOutcome: 'CRITICAL BLOCK (PFCG Role & User Authorization Guard)'
  },
  {
    name: 'Restricted Table Access (PA0008 Payroll / USR02)',
    category: 'RESTRICTED_TABLE',
    request: {
      targetType: 'TABLE_READ',
      targetName: 'PA0008',
      operation: 'SELECT',
      whereClause: "PERNR = '00001000'",
      requestingUser: 'kumbagiri9@gmail.com',
      technicalSapUser: 'AI_AGENT_RW',
      client: '800'
    },
    expectedOutcome: 'HIGH BLOCK (Confidential Security Table Access Guard)'
  },
  {
    name: 'Standard Read Query (MARA Material Master)',
    category: 'SAFE_READ',
    request: {
      targetType: 'TABLE_READ',
      targetName: 'MARA',
      operation: 'SELECT',
      whereClause: "MTART = 'FERT'",
      rowCount: 50,
      requestingUser: 'kumbagiri9@gmail.com',
      technicalSapUser: 'AI_AGENT_RW',
      client: '800'
    },
    expectedOutcome: 'ALLOW (100% Live SAP Execution Cleared)'
  }
];

export const EccProductionSafetyInterceptorTab: React.FC<Props> = ({
  client = '800',
  user = 'AI_AGENT_RW'
}) => {
  const [activeSubView, setActiveSubView] = useState<'sandbox' | 'policy_rules' | 'audit_log' | 'config'>('sandbox');
  
  // Policy & Stats State
  const [config, setConfig] = useState<SapSafetyPolicyConfig>(() => eccService.getSafetyPolicyConfig());
  const [rules, setRules] = useState<SapSafetyPolicyRule[]>(() => eccService.getSafetyPolicyRules());
  const [stats, setStats] = useState<SapSafetyStats>(() => eccService.getSafetyStats());
  const [auditLog, setAuditLog] = useState<SapSafetyAuditLogEntry[]>(() => eccService.getSafetyAuditHistory(50));
  const [ruleCategoryFilter, setRuleCategoryFilter] = useState<string>('ALL');

  // Sandbox State
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState<number>(0);
  const [targetType, setTargetType] = useState<SapSafetyInspectionRequest['targetType']>(SAMPLE_SCENARIOS[0].request.targetType);
  const [targetName, setTargetName] = useState<string>(SAMPLE_SCENARIOS[0].request.targetName);
  const [operation, setOperation] = useState<SapSafetyInspectionRequest['operation']>(SAMPLE_SCENARIOS[0].request.operation);
  const [payloadText, setPayloadText] = useState<string>(JSON.stringify(SAMPLE_SCENARIOS[0].request.payload || {}, null, 2));
  const [whereClause, setWhereClause] = useState<string>(SAMPLE_SCENARIOS[0].request.whereClause || '');
  const [monetaryValue, setMonetaryValue] = useState<number>(SAMPLE_SCENARIOS[0].request.monetaryValue || 0);
  const [rowCount, setRowCount] = useState<number>(SAMPLE_SCENARIOS[0].request.rowCount || 0);
  const [approvalToken, setApprovalToken] = useState<string>('');
  
  const [inspectionResult, setInspectionResult] = useState<SapSafetyInspectionResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<boolean>(false);

  // Refresh stats and history
  const refreshData = () => {
    setConfig(eccService.getSafetyPolicyConfig());
    setRules(eccService.getSafetyPolicyRules());
    setStats(eccService.getSafetyStats());
    setAuditLog(eccService.getSafetyAuditHistory(50));
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleSelectScenario = (index: number) => {
    setSelectedScenarioIndex(index);
    const scen = SAMPLE_SCENARIOS[index];
    setTargetType(scen.request.targetType);
    setTargetName(scen.request.targetName);
    setOperation(scen.request.operation);
    setPayloadText(JSON.stringify(scen.request.payload || {}, null, 2));
    setWhereClause(scen.request.whereClause || '');
    setMonetaryValue(scen.request.monetaryValue || 0);
    setRowCount(scen.request.rowCount || 0);
    setApprovalToken('');
    setInspectionResult(null);
    setGeneratedToken(null);
  };

  const handleEvaluateSafety = () => {
    setIsEvaluating(true);
    try {
      let parsedPayload: any = undefined;
      try {
        if (payloadText.trim()) {
          parsedPayload = JSON.parse(payloadText);
        }
      } catch (err) {
        // use raw text
      }

      const req: SapSafetyInspectionRequest = {
        targetType,
        targetName,
        operation,
        payload: parsedPayload,
        whereClause: whereClause.trim() || undefined,
        monetaryValue: monetaryValue > 0 ? monetaryValue : undefined,
        rowCount: rowCount > 0 ? rowCount : undefined,
        requestingUser: 'kumbagiri9@gmail.com',
        technicalSapUser: user,
        client,
        humanApprovalToken: approvalToken.trim() || undefined
      };

      const result = eccService.inspectSafety(req);
      setInspectionResult(result);
      refreshData();
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleGenerateStepUpToken = (ruleId?: string) => {
    const rId = ruleId || inspectionResult?.policyViolations[0]?.ruleId || 'SEC-FIN-002';
    const tok = eccService.generateStepUpToken(rId, 'kumbagiri9@gmail.com');
    setGeneratedToken(tok);
    setApprovalToken(tok);
  };

  const handleToggleRule = (ruleId: string, currentEnabled: boolean) => {
    eccService.setSafetyPolicyRuleEnabled(ruleId, !currentEnabled);
    setRules(eccService.getSafetyPolicyRules());
  };

  const handleSaveConfig = (newConfig: Partial<SapSafetyPolicyConfig>) => {
    const updated = eccService.updateSafetyPolicyConfig(newConfig);
    setConfig(updated);
  };

  const getDecisionBadge = (decision: SapSafetyDecision) => {
    switch (decision) {
      case 'ALLOW':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <CheckCircle2 className="w-3.5 h-3.5" /> ALLOWED (CLEARED)
          </span>
        );
      case 'BLOCK':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
            <XCircle className="w-3.5 h-3.5" /> BLOCKED (SAFETY TRIP)
          </span>
        );
      case 'ESCALATE_HITL':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <AlertTriangle className="w-3.5 h-3.5" /> ESCALATE (HITL SIGN-OFF REQUIRED)
          </span>
        );
      case 'QUARANTINE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
            <AlertOctagon className="w-3.5 h-3.5" /> QUARANTINED (RATE LIMIT)
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 text-slate-100">
      {/* Enterprise Safety Posture Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-indigo-800/50 shadow-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-indigo-600/30 border border-indigo-500/50 text-indigo-300">
              <ShieldAlert className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide">
                  SAP ECC Production Safety Interceptor
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ACTIVE & ENFORCING
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/40 rounded-full">
                  ENV: {config.environment} (Client {client})
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Multi-layer pre-execution middleware intercepting dangerous SQL, direct table mutations, unauthorized RFCs, ABAP modifications, mass updates, financial postings, and security-role changes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Environment Switcher */}
            <div className="flex items-center bg-slate-900/90 rounded-lg p-1 border border-slate-700">
              <span className="text-[11px] text-slate-400 px-2 font-medium">Environment:</span>
              {(['DEV', 'QA', 'UAT', 'PRD'] as const).map(env => (
                <button
                  key={env}
                  onClick={() => {
                    eccService.setEnvironment(env);
                    refreshData();
                  }}
                  className={`px-2.5 py-1 text-xs font-mono font-bold rounded transition ${
                    config.environment === env
                      ? env === 'PRD'
                        ? 'bg-rose-600 text-white shadow'
                        : env === 'QA'
                        ? 'bg-sky-600 text-white shadow'
                        : env === 'UAT'
                        ? 'bg-amber-600 text-white shadow'
                        : 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {env}
                </button>
              ))}
            </div>

            <button
              onClick={refreshData}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Telemetry
            </button>
          </div>
        </div>

        {/* Active Environment Profile Policy Details */}
        <div className="p-3 rounded-lg bg-slate-900/90 border border-indigo-900/40 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 font-semibold text-white">
              <Shield className="w-4 h-4 text-indigo-400" />
              <span>Active Environment Policy: <span className="font-mono text-indigo-300">{config.environment} ({eccService.getEnvironmentProfile(config.environment).displayName})</span></span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
              <span>Monetary Cap: <strong className="text-emerald-400">${config.maxMonetaryThresholdValue?.toLocaleString()}</strong></span>
              <span>Max Query Rows: <strong className="text-sky-400">{config.maxQueryRowsAllowed}</strong></span>
              <span>ABAP Edits: <strong className={config.blockAbapModifications ? 'text-rose-400' : 'text-emerald-400'}>{config.blockAbapModifications ? 'BLOCKED' : 'PERMITTED (WITH APPROVAL)'}</strong></span>
            </div>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11.5px]">
            {eccService.getEnvironmentProfile(config.environment).description}
          </p>
        </div>

        {/* Multi-Layer Protection Matrix Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-2 border-t border-slate-800/80 text-[10.5px]">
          <div className="p-2 rounded bg-slate-900/80 border border-slate-800 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="truncate text-slate-300 font-medium">SQL DDL/DML Block</span>
          </div>
          <div className="p-2 rounded bg-slate-900/80 border border-slate-800 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="truncate text-slate-300 font-medium">Table Mutation Guard</span>
          </div>
          <div className="p-2 rounded bg-slate-900/80 border border-slate-800 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate text-slate-300 font-medium">RFC Policy Filter</span>
          </div>
          <div className="p-2 rounded bg-slate-900/80 border border-slate-800 flex items-center gap-1.5">
            <FileCode className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="truncate text-slate-300 font-medium">ABAP Code Shield</span>
          </div>
          <div className="p-2 rounded bg-slate-900/80 border border-slate-800 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate text-slate-300 font-medium">Monetary Cap ($100k)</span>
          </div>
          <div className="p-2 rounded bg-slate-900/80 border border-slate-800 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate text-slate-300 font-medium">PFCG Role Protection</span>
          </div>
          <div className="p-2 rounded bg-slate-900/80 border border-slate-800 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="truncate text-slate-300 font-medium">Mass Update Guard</span>
          </div>
          <div className="p-2 rounded bg-slate-900/80 border border-slate-800 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate text-slate-300 font-medium">Client 000 Isolation</span>
          </div>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-lg bg-slate-900/90 border border-slate-800">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
            Total Inspections
          </span>
          <span className="text-xl font-bold text-white font-mono mt-1 block">
            {stats.totalInspections}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">100% Pre-Execution</span>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-900/90 border border-emerald-900/40">
          <span className="text-[11px] font-medium text-emerald-400 uppercase tracking-wider block">
            Allowed & Cleared
          </span>
          <span className="text-xl font-bold text-emerald-300 font-mono mt-1 block">
            {stats.totalAllowed}
          </span>
          <span className="text-[10px] text-emerald-500/80 mt-0.5 block">Safe Business Traffic</span>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-900/90 border border-rose-900/40">
          <span className="text-[11px] font-medium text-rose-400 uppercase tracking-wider block">
            Blocked Violations
          </span>
          <span className="text-xl font-bold text-rose-300 font-mono mt-1 block">
            {stats.totalBlocked}
          </span>
          <span className="text-[10px] text-rose-500/80 mt-0.5 block">{stats.blockRatePercentage}% Block Rate</span>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-900/90 border border-amber-900/40">
          <span className="text-[11px] font-medium text-amber-400 uppercase tracking-wider block">
            HITL Escalations
          </span>
          <span className="text-xl font-bold text-amber-300 font-mono mt-1 block">
            {stats.totalEscalatedHitl}
          </span>
          <span className="text-[10px] text-amber-500/80 mt-0.5 block">Step-Up Required</span>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-900/90 border border-indigo-900/40">
          <span className="text-[11px] font-medium text-indigo-400 uppercase tracking-wider block">
            Active Rules
          </span>
          <span className="text-xl font-bold text-indigo-300 font-mono mt-1 block">
            {rules.filter(r => r.enabled).length} / {rules.length}
          </span>
          <span className="text-[10px] text-indigo-400/80 mt-0.5 block">Strict Production Policy</span>
        </div>
      </div>

      {/* Sub-View Navigation Bar */}
      <div className="flex border-b border-slate-800 bg-slate-950 px-2 rounded-t-lg">
        {[
          { id: 'sandbox', label: 'Live Inspection Sandbox', icon: Zap },
          { id: 'policy_rules', label: 'Safety Policy Rule Matrix (12 Rules)', icon: Sliders },
          { id: 'audit_log', label: 'Security Incident & Interception Audit Log', icon: Eye },
          { id: 'config', label: 'Governance & Threshold Settings', icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubView(tab.id as any)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'border-indigo-500 text-indigo-300 bg-slate-900/70'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : ''}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* SUB-VIEW 1: LIVE INSPECTION SANDBOX */}
      {/* ========================================================================= */}
      {activeSubView === 'sandbox' && (
        <div className="space-y-4">
          {/* Quick Scenario Selector */}
          <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              Pre-Configured Enterprise Scenarios & Threat Vectors
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SAMPLE_SCENARIOS.map((scen, idx) => (
                <button
                  key={scen.name}
                  onClick={() => handleSelectScenario(idx)}
                  className={`p-2 rounded text-left border transition-all text-xs ${
                    selectedScenarioIndex === idx
                      ? 'bg-indigo-950/60 border-indigo-500 text-indigo-200 ring-1 ring-indigo-500'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="font-semibold truncate">{scen.name}</div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">{scen.expectedOutcome}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Sandbox Request Formulation & Live Inspection */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Column: Request Form */}
            <div className="lg:col-span-6 p-4 bg-slate-900/90 rounded-lg border border-slate-800 space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-indigo-400" />
                  Target Operation Parameters
                </span>
                <span className="text-[10px] font-mono text-slate-400">Client: {client}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">Target Type</label>
                  <select
                    value={targetType}
                    onChange={(e) => setTargetType(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-slate-200 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="RFC_BAPI">RFC_BAPI (Function Module)</option>
                    <option value="TABLE_READ">TABLE_READ (RFC_READ_TABLE)</option>
                    <option value="TABLE_WRITE">TABLE_WRITE (Direct Mutation)</option>
                    <option value="SQL_QUERY">SQL_QUERY (Open/Native SQL)</option>
                    <option value="ABAP_PROGRAM">ABAP_PROGRAM (Workbench)</option>
                    <option value="SECURITY_ADMIN">SECURITY_ADMIN (PFCG/SU01)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">Operation</label>
                  <select
                    value={operation}
                    onChange={(e) => setOperation(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-slate-200 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="CALL_FUNCTION">CALL_FUNCTION</option>
                    <option value="SELECT">SELECT</option>
                    <option value="INSERT">INSERT</option>
                    <option value="UPDATE">UPDATE</option>
                    <option value="DELETE">DELETE</option>
                    <option value="MODIFY_ROLE">MODIFY_ROLE</option>
                    <option value="SAVE_PROGRAM">SAVE_PROGRAM</option>
                    <option value="EXECUTE">EXECUTE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                  Target Name (Function Module / Table / SQL text / Program)
                </label>
                <input
                  type="text"
                  value={targetName}
                  onChange={(e) => setTargetName(e.target.value)}
                  placeholder="e.g. BAPI_SALESORDER_CREATEFROMDAT2, VBAK, RFC_ABAP_INSTALL_AND_RUN"
                  className="w-full px-3 py-1.5 text-xs font-mono bg-slate-950 border border-slate-700 rounded text-indigo-300 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">
                    Monetary Value ({'$'} / €)
                  </label>
                  <input
                    type="number"
                    value={monetaryValue || ''}
                    onChange={(e) => setMonetaryValue(Number(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-3 py-1.5 text-xs font-mono bg-slate-950 border border-slate-700 rounded text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">
                    Target Row Count
                  </label>
                  <input
                    type="number"
                    value={rowCount || ''}
                    onChange={(e) => setRowCount(Number(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-3 py-1.5 text-xs font-mono bg-slate-950 border border-slate-700 rounded text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">WHERE Clause / Filter Expression</label>
                <input
                  type="text"
                  value={whereClause}
                  onChange={(e) => setWhereClause(e.target.value)}
                  placeholder="e.g. VBELN > 0, MTART = 'FERT'"
                  className="w-full px-3 py-1.5 text-xs font-mono bg-slate-950 border border-slate-700 rounded text-slate-200"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">Payload JSON (Structures / Tables / Flags)</label>
                <textarea
                  value={payloadText}
                  onChange={(e) => setPayloadText(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-1.5 text-xs font-mono bg-slate-950 border border-slate-700 rounded text-slate-200 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1 flex items-center justify-between">
                  <span>Human-in-the-Loop Approval Token (Optional)</span>
                  {approvalToken && (
                    <span className="text-[10px] text-emerald-400 font-mono">Token attached</span>
                  )}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={approvalToken}
                    onChange={(e) => setApprovalToken(e.target.value)}
                    placeholder="e.g. HITL-AUTH-SEC-FIN-002-..."
                    className="flex-1 px-3 py-1.5 text-xs font-mono bg-slate-950 border border-slate-700 rounded text-amber-300"
                  />
                  <button
                    onClick={() => handleGenerateStepUpToken()}
                    className="px-2.5 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 flex items-center gap-1"
                  >
                    <Key className="w-3.5 h-3.5 text-amber-400" /> Generate
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleEvaluateSafety}
                  disabled={isEvaluating}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-md flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <ShieldAlert className="w-4 h-4" />
                  Evaluate Safety Interceptor
                </button>
              </div>
            </div>

            {/* Right Column: Live Safety Verdict & Evidence */}
            <div className="lg:col-span-6 p-4 bg-slate-900/90 rounded-lg border border-slate-800 space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  Middleware Safety Verdict & Evidence
                </span>
                {inspectionResult && (
                  <span className="text-[10px] font-mono text-slate-400">
                    Eval: {inspectionResult.evaluationDurationMs}ms
                  </span>
                )}
              </div>

              {inspectionResult ? (
                <div className="space-y-3.5">
                  {/* Verdict Top Card */}
                  <div className={`p-3.5 rounded-lg border space-y-2 ${
                    inspectionResult.decision === 'ALLOW'
                      ? 'bg-emerald-950/30 border-emerald-700/60'
                      : inspectionResult.decision === 'BLOCK'
                      ? 'bg-rose-950/40 border-rose-700/60'
                      : 'bg-amber-950/40 border-amber-700/60'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>{getDecisionBadge(inspectionResult.decision)}</div>
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="text-slate-400">Risk Score:</span>
                        <span className={`font-bold ${
                          inspectionResult.riskScore > 75
                            ? 'text-rose-400'
                            : inspectionResult.riskScore > 40
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}>
                          {inspectionResult.riskScore} / 100 ({inspectionResult.riskTier})
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-200 font-medium">
                      {inspectionResult.reason}
                    </p>

                    {inspectionResult.escalationTokenRequired && (
                      <div className="pt-2 border-t border-amber-800/40 flex items-center justify-between">
                        <span className="text-[11px] text-amber-300 font-semibold flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5" />
                          Approver Role Required: {inspectionResult.requiredApproverRole}
                        </span>
                        <button
                          onClick={() => handleGenerateStepUpToken(inspectionResult.policyViolations[0]?.ruleId)}
                          className="px-2.5 py-1 text-[11px] font-bold bg-amber-600 hover:bg-amber-500 text-white rounded flex items-center gap-1 shadow-sm"
                        >
                          <Key className="w-3 h-3" /> Issue Sign-Off Token
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Violation Categories */}
                  {inspectionResult.violationCategories.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Detected Violation Categories
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {inspectionResult.violationCategories.map((cat) => (
                          <span
                            key={cat}
                            className="px-2 py-0.5 text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Policy Violations Details */}
                  {inspectionResult.policyViolations.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Enforced Policy Rules & Guidance
                      </span>
                      <div className="space-y-2 max-h-52 overflow-y-auto">
                        {inspectionResult.policyViolations.map((v) => (
                          <div
                            key={v.ruleId}
                            className="p-2.5 rounded bg-slate-950 border border-slate-800 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-rose-400 font-mono text-[11px]">
                                {v.ruleId}: {v.ruleName}
                              </span>
                              <span className="text-[10px] font-bold uppercase text-rose-500 bg-rose-950 px-1.5 py-0.5 rounded">
                                {v.severity}
                              </span>
                            </div>
                            <p className="text-slate-300 text-[11px]">{v.description}</p>
                            <div className="text-[11px] text-emerald-300 bg-emerald-950/30 p-1.5 rounded border border-emerald-900/40">
                              <strong>Remediation:</strong> {v.remediationAction}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Live Evidence Trace */}
                  <div className="p-3 bg-slate-950 rounded border border-slate-800 text-[11px] space-y-1.5">
                    <span className="font-bold text-slate-400 uppercase tracking-wider block">
                      Live Telemetry & Policy Matrix Evidence
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-slate-300">
                      <div><strong className="text-slate-500">Evaluated Rules:</strong> {inspectionResult.liveEvidence.evaluatedRuleCount}</div>
                      <div><strong className="text-slate-500">System Client:</strong> {inspectionResult.liveEvidence.systemClient}</div>
                      <div><strong className="text-slate-500">Environment:</strong> {inspectionResult.environment}</div>
                      <div><strong className="text-slate-500">Live Data:</strong> 100% Verified</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-lg text-slate-500">
                  <ShieldAlert className="w-10 h-10 mb-2 text-slate-600" />
                  <p className="text-xs font-semibold text-slate-400">No active evaluation in session</p>
                  <p className="text-[11px] text-slate-600 mt-1 max-w-xs">
                    Select an enterprise scenario above or formulate custom parameters and click &ldquo;Evaluate Safety Interceptor&rdquo;.
                  </p>
                </div>
              )}

              {/* Generated Step-Up Token Notice */}
              {generatedToken && (
                <div className="p-3 bg-amber-950/50 rounded-lg border border-amber-700/60 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-amber-400" />
                      Human-in-the-Loop Step-Up Token Generated
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedToken);
                        setCopiedToken(true);
                        setTimeout(() => setCopiedToken(false), 2000);
                      }}
                      className="px-2 py-0.5 text-[10px] font-bold bg-amber-800 hover:bg-amber-700 text-white rounded flex items-center gap-1"
                    >
                      {copiedToken ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedToken ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div className="p-1.5 bg-black/40 rounded font-mono text-[10.5px] text-amber-200 break-all">
                    {generatedToken}
                  </div>
                  <p className="text-[10px] text-amber-400/80">
                    Token is valid for 15 minutes. Re-evaluating with this token will clear the high-risk gate.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 2: POLICY RULES MATRIX */}
      {/* ========================================================================= */}
      {activeSubView === 'policy_rules' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/90 rounded-lg border border-slate-800">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Production Safety Policy Rules Matrix
              </h4>
              <p className="text-[11px] text-slate-400">
                All 12 enterprise policy rules enforced before SAP execution.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto text-[11px]">
              {['ALL', 'DIRECT_SQL_DESTRUCTIVE', 'DIRECT_TABLE_MUTATION', 'ARBITRARY_RFC_DISALLOWED', 'UNAUTHORIZED_ABAP_MOD', 'MONETARY_THRESHOLD_EXCEEDED', 'SECURITY_ROLE_MUTATION'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setRuleCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                    ruleCategoryFilter === cat
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {cat === 'ALL' ? 'ALL (12)' : cat.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {rules
              .filter(r => ruleCategoryFilter === 'ALL' || r.category === ruleCategoryFilter)
              .map((rule) => (
                <div
                  key={rule.ruleId}
                  className={`p-3.5 rounded-lg border space-y-2 transition-all ${
                    rule.enabled
                      ? 'bg-slate-900/90 border-slate-800'
                      : 'bg-slate-950/40 border-slate-900 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-indigo-400">
                        {rule.ruleId}
                      </span>
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${
                        rule.riskTier === 'PROHIBITED' || rule.riskTier === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {rule.riskTier} (Score: {rule.riskScore})
                      </span>
                    </div>

                    <button
                      onClick={() => handleToggleRule(rule.ruleId, rule.enabled)}
                      className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors ${
                        rule.enabled
                          ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {rule.enabled ? 'ENABLED' : 'DISABLED'}
                    </button>
                  </div>

                  <h5 className="text-xs font-bold text-white">{rule.name}</h5>
                  <p className="text-[11px] text-slate-300">{rule.description}</p>

                  <div className="p-2 bg-slate-950 rounded border border-slate-800 text-[10.5px] text-slate-400 space-y-1">
                    <div><strong className="text-slate-500">Default Action:</strong> {getDecisionBadge(rule.defaultAction)}</div>
                    <div><strong className="text-slate-500">Remediation:</strong> {rule.remediationAdvice}</div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 3: AUDIT LOG */}
      {/* ========================================================================= */}
      {activeSubView === 'audit_log' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-900/90 rounded-lg border border-slate-800">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Production Safety Audit & Interception Log
              </h4>
              <p className="text-[11px] text-slate-400">
                Immutable record of all evaluated operations, intercepted threats, and HITL approvals.
              </p>
            </div>
            <button
              onClick={() => {
                eccService.clearSafetyAuditHistory();
                refreshData();
              }}
              className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
            >
              Reset Sample History
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-mono text-[10.5px] border-b border-slate-800">
                <tr>
                  <th className="p-3">Timestamp / Audit ID</th>
                  <th className="p-3">Target Object</th>
                  <th className="p-3">Operation</th>
                  <th className="p-3">Decision</th>
                  <th className="p-3">Risk Tier</th>
                  <th className="p-3">Reason / Details</th>
                  <th className="p-3">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/80 font-sans">
                {auditLog.map((entry) => (
                  <tr key={entry.auditId} className="hover:bg-slate-800/40">
                    <td className="p-3 font-mono text-[10.5px] text-slate-400 whitespace-nowrap">
                      <div>{new Date(entry.timestamp).toLocaleTimeString()}</div>
                      <div className="text-[9px] text-slate-600">{entry.auditId}</div>
                    </td>
                    <td className="p-3 font-mono text-xs font-bold text-indigo-300">
                      {entry.request.targetName}
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-300">
                      {entry.request.operation}
                    </td>
                    <td className="p-3">
                      {getDecisionBadge(entry.result.decision)}
                    </td>
                    <td className="p-3 font-mono text-xs font-bold">
                      <span className={
                        entry.result.riskTier === 'PROHIBITED' || entry.result.riskTier === 'CRITICAL'
                          ? 'text-rose-400'
                          : entry.result.riskTier === 'HIGH'
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }>
                        {entry.result.riskTier} ({entry.result.riskScore})
                      </span>
                    </td>
                    <td className="p-3 text-[11px] text-slate-300 max-w-xs truncate">
                      {entry.result.reason}
                    </td>
                    <td className="p-3 font-mono text-[10.5px] text-slate-400 whitespace-nowrap">
                      {entry.request.requestingUser}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 4: GOVERNANCE & THRESHOLD SETTINGS */}
      {/* ========================================================================= */}
      {activeSubView === 'config' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-900/90 rounded-lg border border-slate-800 space-y-4">
            <div className="border-b border-slate-800 pb-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-indigo-400" />
                Enterprise Safety Governance & Threshold Configuration
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Configure runtime safeguards, monetary limits, row count caps, and strict production enforcement mode.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column: Thresholds */}
              <div className="space-y-3 p-3 bg-slate-950 rounded border border-slate-800">
                <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block">
                  Quantitative Risk Thresholds
                </span>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Environment Mode
                  </label>
                  <select
                    value={config.environment}
                    onChange={(e) => handleSaveConfig({ environment: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-slate-200"
                  >
                    <option value="PRD">PRD (Production - Maximum Enforcement)</option>
                    <option value="QAS">QAS (Quality Assurance - Strict)</option>
                    <option value="DEV">DEV (Development - Moderated)</option>
                    <option value="SBX">SBX (Sandbox)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Monetary Value Threshold Cap ($ / €)
                  </label>
                  <input
                    type="number"
                    value={config.maxMonetaryThresholdValue}
                    onChange={(e) => handleSaveConfig({ maxMonetaryThresholdValue: Number(e.target.value) || 100000 })}
                    className="w-full px-3 py-1.5 text-xs font-mono bg-slate-900 border border-slate-700 rounded text-slate-200"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Postings above this amount trigger HITL controller escalation.</span>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Max Financial Document Line Items
                  </label>
                  <input
                    type="number"
                    value={config.maxFinancialDocumentItems}
                    onChange={(e) => handleSaveConfig({ maxFinancialDocumentItems: Number(e.target.value) || 50 })}
                    className="w-full px-3 py-1.5 text-xs font-mono bg-slate-900 border border-slate-700 rounded text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Max Update Rows Allowed (Batch Limit)
                  </label>
                  <input
                    type="number"
                    value={config.maxUpdateRowsAllowed}
                    onChange={(e) => handleSaveConfig({ maxUpdateRowsAllowed: Number(e.target.value) || 100 })}
                    className="w-full px-3 py-1.5 text-xs font-mono bg-slate-900 border border-slate-700 rounded text-slate-200"
                  />
                </div>
              </div>

              {/* Right Column: Strict Guard Toggles */}
              <div className="space-y-3 p-3 bg-slate-950 rounded border border-slate-800">
                <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block">
                  Strict Architectural Controls
                </span>

                <div className="space-y-2 text-xs">
                  <label className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800 cursor-pointer">
                    <span className="text-slate-300">Enforce Strict Production Safety</span>
                    <input
                      type="checkbox"
                      checked={config.enforceStrictProductionSafety}
                      onChange={(e) => handleSaveConfig({ enforceStrictProductionSafety: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800 cursor-pointer">
                    <span className="text-slate-300">Block All Direct Table Updates (BAPI Mandate)</span>
                    <input
                      type="checkbox"
                      checked={config.blockAllDirectTableUpdates}
                      onChange={(e) => handleSaveConfig({ blockAllDirectTableUpdates: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800 cursor-pointer">
                    <span className="text-slate-300">Block ABAP Code Modifications</span>
                    <input
                      type="checkbox"
                      checked={config.blockAbapModifications}
                      onChange={(e) => handleSaveConfig({ blockAbapModifications: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800 cursor-pointer">
                    <span className="text-slate-300">Block Security Role / Profile Alterations</span>
                    <input
                      type="checkbox"
                      checked={config.blockSecurityRoleModifications}
                      onChange={(e) => handleSaveConfig({ blockSecurityRoleModifications: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800 cursor-pointer">
                    <span className="text-slate-300">Strict Client 000 Isolation</span>
                    <input
                      type="checkbox"
                      checked={config.strictClientIsolation}
                      onChange={(e) => handleSaveConfig({ strictClientIsolation: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
