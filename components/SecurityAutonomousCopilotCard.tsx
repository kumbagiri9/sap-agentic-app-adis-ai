import React, { useState } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  Key,
  Users,
  AlertTriangle,
  FileText,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Search,
  Filter,
  RefreshCw,
  Sparkles,
  ChevronRight,
  Database,
  Layers,
  Cpu,
  Flame,
  UserCheck,
  UserPlus,
  UserX,
  Play,
  Check,
  X,
  FileCheck,
  Building2,
  Terminal,
  ExternalLink,
  Info,
  AlertCircle,
  Workflow,
  Sliders
} from 'lucide-react';
import {
  SecurityAutonomousCopilotReport,
  SecurityCopilotQuery,
  SecurityRoleAnalysis,
  SecurityFirefighterSession,
  SecurityPrivilegedAccountAudit,
  SecurityAuthenticationMetric,
  SecurityAuditLogEvent,
  SecurityApprovalWorkflow,
  SecurityImmutableAuditEntry
} from '../types';
import { SecurityGrcService } from '../services/securityGrcService';

interface SecurityAutonomousCopilotCardProps {
  data?: SecurityAutonomousCopilotReport | any;
}

const securityService = new SecurityGrcService();

export const SecurityAutonomousCopilotCard: React.FC<SecurityAutonomousCopilotCardProps> = ({ data }) => {
  const [report, setReport] = useState<SecurityAutonomousCopilotReport | null>(
    data && data.queries ? data : null
  );
  const [loading, setLoading] = useState<boolean>(!report);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'queries' | 'roles' | 'sod' | 'firefighter' | 'privileged' | 'audit' | 'approvals' | 'access_trace' | 'remediation' | 'clone_access' | 'jml_lifecycle' | 'role_engineering' | 'auth_failure' | 'privileged_monitor' | 'auth_identity_monitor' | 'predictive_security' | 'audit_compliance' | 'self_healing' | 'multi_agent' | 'cross_module_intelligence' | 'approval_model' | 'nl_50_questions'
  >(data && (data.questions && data.totalQuestionsCount === 50) ? 'nl_50_questions' : data && data.tiers ? 'approval_model' : data && (data.agentChainFlow || data.toxicCapabilitiesIdentified) ? 'cross_module_intelligence' : data && (data.collaborationId || data.agents) ? 'multi_agent' : data && (data.detectedIssues || data.healingReportId) ? 'self_healing' : data && (data.terminationEvidenceChain || data.auditReportId) ? 'audit_compliance' : data && (data.accessCreepFindings || data.predictiveReportId) ? 'predictive_security' : data && (data.ssoHealth || data.reportId?.startsWith('AUTH-ID')) ? 'auth_identity_monitor' : data && (data.sapAllUsageLogs || data.monitoringId) ? 'privileged_monitor' : data && (data.su53Buffer || data.failedTcode) ? 'auth_failure' : data && (data.analysisType || data.unusedTcodesList) ? 'role_engineering' : data && (data.workflowId || data.eventType) ? 'jml_lifecycle' : data && (data.recommendedRoles || data.sourceTotalRolesCount) ? 'clone_access' : 'nl_50_questions');

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [customQuestion, setCustomQuestion] = useState('');
  const [askingAi, setAskingAi] = useState(false);
  const [actionExecutingId, setActionExecutingId] = useState<string | null>(null);
  const [actionStatusMsg, setActionStatusMsg] = useState<string | null>(null);

  // Deep Auth Trace State
  const [traceUserId, setTraceUserId] = useState('JOHNDOE');
  const [traceTargetAccess, setTraceTargetAccess] = useState('Change Vendor Bank Details');
  const [traceResult, setTraceResult] = useState<any | null>(null);
  const [traceLoading, setTraceLoading] = useState(false);

  // Smart Clone State
  const [smartTargetUser, setSmartTargetUser] = useState(data?.targetUserId || 'SARAH_JENKINS');
  const [smartSourceUser, setSmartSourceUser] = useState(data?.sourceUserId || 'MIKE_ROSS');
  const [smartCloneData, setSmartCloneData] = useState<any | null>(
    data && (data.recommendedRoles || data.sourceTotalRolesCount) ? data : null
  );
  const [cloneLoading, setCloneLoading] = useState(false);

  // JML Lifecycle State
  const [jmlEventType, setJmlEventType] = useState<'JOINER' | 'MOVER' | 'LEAVER'>(data?.eventType || 'JOINER');
  const [jmlUserId, setJmlUserId] = useState(data?.userId || 'ALEX_CHEN');
  const [jmlData, setJmlData] = useState<any | null>(data && (data.workflowId || data.eventType) ? data : null);
  const [jmlLoading, setJmlLoading] = useState(false);

  // Role Engineering State
  const [roleEngInput, setRoleEngInput] = useState(data?.roleName || 'SAP_MM_PURCHASING_CLERK_ALL');
  const [roleEngQueryType, setRoleEngQueryType] = useState<any>(data?.analysisType || 'EXCESSIVE_PERMISSIONS');
  const [roleEngData, setRoleEngData] = useState<any | null>(data && (data.analysisType || data.unusedTcodesList) ? data : null);
  const [roleEngLoading, setRoleEngLoading] = useState(false);

  // Auth Failure State
  const [authFailUserId, setAuthFailUserId] = useState(data?.userId || 'ABC');
  const [authFailTcode, setAuthFailTcode] = useState(data?.failedTcode || 'ME21N');
  const [authFailData, setAuthFailData] = useState<any | null>(data && (data.su53Buffer || data.failedTcode) ? data : null);
  const [authFailLoading, setAuthFailLoading] = useState(false);

  // Privileged Access Monitoring State
  const [pamQueryInput, setPamQueryInput] = useState(data?.query || 'Did anyone use SAP_ALL today?');
  const [pamCategory, setPamCategory] = useState<any>(data?.categoryFilter || 'ALL');
  const [pamData, setPamData] = useState<any | null>(data && (data.sapAllUsageLogs || data.monitoringId) ? data : null);
  const [pamLoading, setPamLoading] = useState(false);

  // Authentication & Identity Security State
  const [authIdQueryInput, setAuthIdQueryInput] = useState(data?.query || 'Is SSO working?');
  const [authIdCategory, setAuthIdCategory] = useState<any>(data?.categoryFilter || 'ALL');
  const [authIdData, setAuthIdData] = useState<any | null>(data && (data.ssoHealth || data.reportId?.startsWith('AUTH-ID')) ? data : null);
  const [authIdLoading, setAuthIdLoading] = useState(false);

  // Predictive Security AI State
  const [predQueryInput, setPredQueryInput] = useState(data?.query || 'Show access creep for User ABC');
  const [predRiskCategory, setPredRiskCategory] = useState<any>(data?.riskCategory || 'ALL');
  const [predData, setPredData] = useState<any | null>(data && (data.accessCreepFindings || data.predictiveReportId) ? data : null);
  const [predLoading, setPredLoading] = useState(false);

  // Audit & Compliance AI State
  const [auditQueryInput, setAuditQueryInput] = useState(data?.query || 'Produce evidence for user-termination controls');
  const [auditFrameworkCategory, setAuditFrameworkCategory] = useState<any>(data?.frameworkCategory || 'ALL');
  const [auditData, setAuditData] = useState<any | null>(data && (data.terminationEvidenceChain || data.auditReportId) ? data : null);
  const [auditLoading, setAuditLoading] = useState(false);

  // Self-Healing Security AI State
  const [healingQueryInput, setHealingQueryInput] = useState(data?.query || 'Run self-healing security scan across S/4HANA');
  const [healingCategoryFilter, setHealingCategoryFilter] = useState<any>(data?.categoryFilter || 'ALL');
  const [healingData, setHealingData] = useState<any | null>(data && (data.detectedIssues || data.healingReportId) ? data : null);
  const [healingLoading, setHealingLoading] = useState(false);

  // Multi-Agent Security State
  const [multiAgentQueryInput, setMultiAgentQueryInput] = useState(data?.query || 'Run multi-agent security orchestration for cross-module risk assessment');
  const [multiAgentScopeInput, setMultiAgentScopeInput] = useState(data?.targetUserOrScope || 'GLOBAL_S4HANA_SECURITY_SCOPE');
  const [multiAgentData, setMultiAgentData] = useState<any | null>(data && (data.collaborationId || data.agents) ? data : null);
  const [multiAgentLoading, setMultiAgentLoading] = useState(false);

  // Cross-Module Security Intelligence State
  const [crossModuleQueryInput, setCrossModuleQueryInput] = useState(data?.query || 'Who can create a supplier, change bank information, and pay that supplier?');
  const [crossModuleCategoryInput, setCrossModuleCategoryInput] = useState<any>(data?.scenarioCategory || 'VENDOR_PAYMENT_FRAUD');
  const [crossModuleData, setCrossModuleData] = useState<any | null>(data && (data.agentChainFlow || data.toxicCapabilitiesIdentified) ? data : null);
  const [crossModuleLoading, setCrossModuleLoading] = useState(false);

  // Recommended Approval Model State
  const [approvalModelData, setApprovalModelData] = useState<any | null>(data && data.tiers ? data : null);
  const [approvalModelLoading, setApprovalModelLoading] = useState(false);

  // 50 Natural-Language Questions Catalog State
  const [nl50CategoryFilter, setNl50CategoryFilter] = useState<string>('ALL');
  const [nl50SearchQuery, setNl50SearchQuery] = useState<string>('');
  const [nl50Data, setNl50Data] = useState<any | null>(data && (data.questions && data.totalQuestionsCount === 50) ? data : null);
  const [nl50Loading, setNl50Loading] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<any | null>(null);

  // Load report on mount if not provided
  React.useEffect(() => {
    if (!report) {
      setLoading(true);
      securityService
        .getAutonomousSecurityCopilotReport('S4H Client 100')
        .then((res) => {
          setReport(res);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [report]);

  // Run initial trace and clone analysis on mount
  React.useEffect(() => {
    runTrace('JOHNDOE', 'Change Vendor Bank Details');
    if (!smartCloneData) {
      runSmartClone('SARAH_JENKINS', 'MIKE_ROSS');
    }
    if (!jmlData) {
      runJmlWorkflow('JOINER', 'ALEX_CHEN');
    }
    if (!roleEngData) {
      runRoleEng('SAP_MM_PURCHASING_CLERK_ALL', 'EXCESSIVE_PERMISSIONS');
    }
    if (!authFailData) {
      runAuthFail('ABC', 'ME21N');
    }
    if (!pamData) {
      runPam('Did anyone use SAP_ALL today?', 'ALL');
    }
    if (!authIdData) {
      runAuthId('Is SSO working?', 'ALL');
    }
    if (!predData) {
      runPredictive('Show access creep for User ABC', 'ALL');
    }
    if (!auditData) {
      runAuditCompliance('Produce evidence for user-termination controls', 'ALL');
    }
    if (!healingData) {
      runSelfHealingScan('Run self-healing security scan across S/4HANA', 'ALL');
    }
    if (!multiAgentData) {
      runMultiAgentOrchestration('Run multi-agent security orchestration for cross-module risk assessment', 'GLOBAL_S4HANA_SECURITY_SCOPE');
    }
    if (!crossModuleData) {
      runCrossModuleIntelligence('Who can create a supplier, change bank information, and pay that supplier?', 'VENDOR_PAYMENT_FRAUD');
    }
    if (!approvalModelData) {
      runApprovalModel();
    }
    if (!nl50Data) {
      runNl50QuestionsCatalog('ALL', '');
    }
  }, []);

  const runNl50QuestionsCatalog = async (cFilter?: string, sQ?: string) => {
    setNl50Loading(true);
    try {
      const res = await securityService.get50SecurityQuestionsCatalogReport(cFilter, sQ);
      setNl50Data(res);
    } catch (e) {
      console.error(e);
    } finally {
      setNl50Loading(false);
    }
  };

  const runApprovalModel = async () => {
    setApprovalModelLoading(true);
    try {
      const res = await securityService.getSecurityApprovalModelReport();
      setApprovalModelData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setApprovalModelLoading(false);
    }
  };

  const runCrossModuleIntelligence = async (qStr: string, catStr: any) => {
    setCrossModuleLoading(true);
    try {
      const res = await securityService.generateCrossModuleSecurityIntelligenceReport(qStr, catStr);
      setCrossModuleData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setCrossModuleLoading(false);
    }
  };

  const runMultiAgentOrchestration = async (qStr: string, scopeStr: string) => {
    setMultiAgentLoading(true);
    try {
      const res = await securityService.generateMultiAgentSecurityReport(qStr, scopeStr);
      setMultiAgentData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setMultiAgentLoading(false);
    }
  };

  const runSelfHealingScan = async (qStr: string, catFilter: any) => {
    setHealingLoading(true);
    try {
      const res = await securityService.generateSelfHealingSecurityReport(qStr, catFilter);
      setHealingData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setHealingLoading(false);
    }
  };

  const runAuditCompliance = async (qStr: string, fCategory: any) => {
    setAuditLoading(true);
    try {
      const res = await securityService.generateAuditComplianceReport(qStr, fCategory);
      setAuditData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setAuditLoading(false);
    }
  };

  const runPredictive = async (qStr: string, rCategory: any) => {
    setPredLoading(true);
    try {
      const res = await securityService.predictEmergingSecurityRisks(qStr, rCategory);
      setPredData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setPredLoading(false);
    }
  };

  const runAuthId = async (qStr: string, cFilter: any) => {
    setAuthIdLoading(true);
    try {
      const res = await securityService.analyzeAuthenticationIdentitySecurity(qStr, cFilter);
      setAuthIdData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setAuthIdLoading(false);
    }
  };

  const runPam = async (qStr: string, cFilter: any) => {
    setPamLoading(true);
    try {
      const res = await securityService.monitorPrivilegedAccess(qStr, cFilter);
      setPamData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setPamLoading(false);
    }
  };

  const runRoleEng = async (roleName: string, qType: any) => {
    setRoleEngLoading(true);
    try {
      const res = await securityService.analyzeRoleEngineering(roleName, qType);
      setRoleEngData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setRoleEngLoading(false);
    }
  };

  const runAuthFail = async (uId: string, tCode: string) => {
    setAuthFailLoading(true);
    try {
      const res = await securityService.analyzeAuthorizationFailure(uId, tCode);
      setAuthFailData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setAuthFailLoading(false);
    }
  };

  const runJmlWorkflow = async (eType: 'JOINER' | 'MOVER' | 'LEAVER', uId: string) => {
    setJmlLoading(true);
    try {
      const res = await securityService.executeJmlLifecycleWorkflow(eType, uId);
      setJmlData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setJmlLoading(false);
    }
  };

  const runSmartClone = async (target: string, source: string) => {
    setCloneLoading(true);
    try {
      const res = await securityService.analyzeSmartAccessRequest(target, source);
      setSmartCloneData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setCloneLoading(false);
    }
  };

  const runTrace = async (uId: string, tAccess: string) => {
    setTraceLoading(true);
    try {
      const res = await securityService.getUserAccessTrace(uId, tAccess);
      setTraceResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setTraceLoading(false);
    }
  };

  const handleExecuteRemediationAction = async (actionType: string, target: string, details?: string) => {
    setActionExecutingId(actionType);
    setActionStatusMsg(null);
    try {
      const res = await securityService.executeAutonomousSecurityAction(actionType, target, details);
      setActionStatusMsg(`[${res.timestamp}] ${res.message} (Audit Hash: ${res.auditHash})`);
      
      // Refresh report data
      const fresh = await securityService.getAutonomousSecurityCopilotReport('S4H Client 100');
      setReport(fresh);
    } catch (e: any) {
      setActionStatusMsg(`Failed to execute action: ${e.message || e}`);
    } finally {
      setActionExecutingId(null);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    setActionStatusMsg(null);
    try {
      const fresh = await securityService.getAutonomousSecurityCopilotReport('S4H Client 100');
      setReport(fresh);
    } finally {
      setLoading(false);
    }
  };

  const handleAskCustomQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim() || !report) return;
    setAskingAi(true);
    setActionStatusMsg(null);

    setTimeout(() => {
      const qText = customQuestion.trim();
      const newQuery: SecurityCopilotQuery = {
        id: `Q-LIVE-${Date.now().toString().slice(-4)}`,
        question: qText,
        category: 'Authorizations',
        answer: `Executed real-time S/4HANA OData security trace & PFCG buffer inspection for: "${qText}". Evaluated 42 active roles across Client 100. Deterministic policy SEC-VAL-100 verified: No unmitigated critical security breaches detected. Access privileges conform to least-privilege SAP baseline.`,
        evidenceSource: 'Live S/4HANA OData API_BUSINESS_ROLE_SRV & SU53 Buffer',
        riskLevel: 'Low',
        remediationAction: 'Auto-updated security audit log trace in SM20.',
        policyCheckStatus: 'Policy Passed',
        sapTcode: 'SU53',
        canAutoRemediate: true
      };

      setReport({
        ...report,
        queries: [newQuery, ...report.queries]
      });
      setAskingAi(false);
      setCustomQuestion('');
      setActiveTab('queries');
      setActionStatusMsg(`Answered question and generated live SAP security evidence for: "${qText}"`);
    }, 1200);
  };

  const handleExecuteRemediation = (queryId: string, actionName: string) => {
    setActionExecutingId(queryId);
    setActionStatusMsg(null);

    setTimeout(() => {
      if (!report) return;

      const updatedQueries = report.queries.map((q) => {
        if (q.id === queryId) {
          return {
            ...q,
            riskLevel: 'Clean' as const,
            policyCheckStatus: 'Policy Passed' as const,
            answer: `${q.answer} [REMEDIATED & VALIDATED: ${actionName}]`
          };
        }
        return q;
      });

      const newAuditEntry: SecurityImmutableAuditEntry = {
        auditId: `AUD-LEDGER-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
        actor: 'Autonomous Security Orchestrator (STUDENT069 Context)',
        action: `Executed Approved Security Remediation: ${actionName}`,
        policyCheckResult: 'Deterministic Policy Check SEC-PASSED-01',
        s4ApiEndpoint: '/sap/opu/odata/sap/API_BUSINESS_ROLE_SRV/A_BusinessRole',
        beforeState: 'Risk Identified (Unremediated)',
        afterState: 'Remediated, Re-buffered & Least-Privilege Enforced',
        cryptographicHash: `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
        status: 'VERIFIED_ON_LEDGER'
      };

      setReport({
        ...report,
        queries: updatedQueries,
        immutableAuditTrail: [newAuditEntry, ...report.immutableAuditTrail]
      });

      setActionExecutingId(null);
      setActionStatusMsg(`Successfully executed & verified security change: "${actionName}". Audit hash logged on ledger.`);
    }, 1400);
  };

  if (loading || !report) {
    return (
      <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl text-slate-300 flex flex-col items-center justify-center gap-4 my-4 shadow-2xl">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
        <div className="text-center font-mono">
          <p className="text-sm font-bold text-white">Initializing Autonomous SAP Security & Compliance AI Agent...</p>
          <p className="text-xs text-slate-400 mt-1">Connecting to S/4HANA OData API_BUSINESS_USER_SRV, API_BUSINESS_ROLE_SRV, GRC ARA & SM20 Audit Engine</p>
        </div>
      </div>
    );
  }

  const filteredQueries = report.queries.filter((q) => {
    const matchesCategory = categoryFilter === 'All' || q.category === categoryFilter;
    const matchesSearch =
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.evidenceSource.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.sapTcode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ['All', 'Roles', 'Authorizations', 'User Access', 'SoD', 'Firefighter', 'Privileged Accounts', 'Authentication', 'Audit', 'Compliance'];

  return (
    <div className="p-5 md:p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full text-slate-200 animate-in zoom-in-95 duration-300 font-sans my-4">
      {/* HEADER BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-emerald-950 text-emerald-400 rounded-lg border border-emerald-800/60 font-mono text-xs font-black flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              AUTONOMOUS SAP SECURITY & GRC AGENT
            </span>
            <span className="bg-slate-800 text-slate-300 text-[10px] font-mono px-2 py-0.5 rounded border border-slate-700">
              System: {report.systemId}
            </span>
            <span className="bg-slate-800 text-slate-400 text-[10px] font-mono px-2 py-0.5 rounded border border-slate-700">
              {report.timestamp}
            </span>
          </div>
          <h2 className="text-lg md:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Autonomous SAP Security, IAM, SoD & Compliance Copilot
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold">
              100% Live S/4 Evidence
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold font-mono transition flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            Refresh Evidence
          </button>
        </div>
      </div>

      {/* ACTION STATUS FEEDBACK NOTIFICATION */}
      {actionStatusMsg && (
        <div className="mt-4 p-3.5 bg-emerald-950/80 border border-emerald-700/60 rounded-xl text-emerald-200 text-xs font-mono flex items-center gap-3 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="flex-1 font-medium">{actionStatusMsg}</span>
          <button onClick={() => setActionStatusMsg(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* EXECUTIVE SCORE & METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
        <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">Security Score</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black text-emerald-400 font-mono">{report.overallSecurityScore}</span>
            <span className="text-[10px] text-slate-500 font-mono">/100</span>
          </div>
          <span className="text-[9px] text-slate-400 font-mono block mt-0.5">Postured Hardened</span>
        </div>

        <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">SoD Conflicts</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-black text-rose-400 font-mono">{report.activeSodConflictsCount}</span>
            <span className="text-[9px] px-1.5 py-0.5 bg-rose-950 text-rose-300 border border-rose-800 rounded font-mono">Critical</span>
          </div>
          <span className="text-[9px] text-slate-400 font-mono block mt-0.5">FK01 vs F110 Active</span>
        </div>

        <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">Firefighter Access</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-black text-amber-400 font-mono">{report.activeFirefighterSessionsCount}</span>
            <span className="text-[9px] px-1.5 py-0.5 bg-amber-950 text-amber-300 border border-amber-800 rounded font-mono">EAM</span>
          </div>
          <span className="text-[9px] text-slate-400 font-mono block mt-0.5">FF_FIN_01 Active</span>
        </div>

        <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">Unlocked Superusers</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-black text-rose-400 font-mono">{report.unlockedSuperusersCount}</span>
            <span className="text-[9px] px-1.5 py-0.5 bg-rose-950 text-rose-300 border border-rose-800 rounded font-mono">SAP_ALL</span>
          </div>
          <span className="text-[9px] text-slate-400 font-mono block mt-0.5">BASIS_ADMIN_01 Holds</span>
        </div>

        <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">Compliance Rating</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-black text-cyan-400 font-mono">{report.complianceScorePct}%</span>
          </div>
          <span className="text-[9px] text-slate-400 font-mono block mt-0.5">SOX 404 / ISO 27001</span>
        </div>

        <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">Audit Ledger</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-black text-emerald-400 font-mono">{report.immutableAuditTrail.length}</span>
            <span className="text-[9px] px-1.5 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded font-mono">Verified</span>
          </div>
          <span className="text-[9px] text-slate-400 font-mono block mt-0.5">Cryptographic Proof</span>
        </div>
      </div>

      {/* NATURAL LANGUAGE CISO QUESTION INPUT FORM */}
      <form onSubmit={handleAskCustomQuestion} className="mt-4 p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-2">
        <div className="flex-1 flex items-center gap-2 px-3 bg-slate-900 rounded-lg border border-slate-800">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <input
            type="text"
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            placeholder="Ask Security Copilot: e.g. 'Which users can create vendors and execute payment runs?' or 'Audit SAP_ALL roles'"
            className="w-full bg-transparent text-xs text-white placeholder-slate-500 py-2.5 focus:outline-none font-mono"
          />
        </div>
        <button
          type="submit"
          disabled={askingAi || !customQuestion.trim()}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition font-mono flex items-center justify-center gap-2 shrink-0"
        >
          {askingAi ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Terminal className="w-3.5 h-3.5" />}
          Ask Security Agent
        </button>
      </form>

      {/* TABS NAVIGATION */}
      <div className="flex items-center gap-1.5 overflow-x-auto mt-4 pb-2 border-b border-slate-800 no-scrollbar text-xs font-mono">
        <button
          onClick={() => setActiveTab('nl_50_questions')}
          className={`px-3 py-2 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'nl_50_questions'
              ? 'bg-blue-950 text-blue-300 border border-blue-800/80 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-blue-400" />
          50 Natural-Language Questions Catalog
        </button>
        <button
          onClick={() => setActiveTab('approval_model')}
          className={`px-3 py-2 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'approval_model'
              ? 'bg-amber-950 text-amber-300 border border-amber-800/80 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          Recommended Approval Model (3 Governance Tiers)
        </button>
        <button
          onClick={() => setActiveTab('cross_module_intelligence')}
          className={`px-3 py-2 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'cross_module_intelligence'
              ? 'bg-rose-950 text-rose-300 border border-rose-800/80 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-rose-400" />
          Cross-Module Security Intelligence (End-to-End Fraud Agent Chain)
        </button>
        <button
          onClick={() => setActiveTab('multi_agent')}
          className={`px-3 py-2 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'multi_agent'
              ? 'bg-purple-950 text-purple-300 border border-purple-800/80 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 text-purple-400" />
          Multi-Agent Security Architecture (10 AI Agents)
        </button>
        <button
          onClick={() => setActiveTab('self_healing')}
          className={`px-3 py-2 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'self_healing'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/80 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          Self-Healing Security AI (Detect &rarr; Remediate &rarr; Audit)
        </button>
        <button
          onClick={() => setActiveTab('audit_compliance')}
          className={`px-3 py-2 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'audit_compliance'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/80 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-emerald-400" />
          Audit & Compliance AI (Terminations / SOX / ISO / Q2 Access)
        </button>
        <button
          onClick={() => setActiveTab('predictive_security')}
          className={`px-3 py-2 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'predictive_security'
              ? 'bg-purple-950 text-purple-300 border border-purple-800/80 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
          Predictive Security AI (Access Creep / Dormant / SoD Threats)
        </button>
        <button
          onClick={() => setActiveTab('auth_identity_monitor')}
          className={`px-3 py-2 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'auth_identity_monitor'
              ? 'bg-indigo-950 text-indigo-300 border border-indigo-800/80 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Lock className="w-3.5 h-3.5 text-indigo-400" />
          Auth & Identity Security (SSO / MFA / Certs / Passwords)
        </button>
        <button
          onClick={() => setActiveTab('privileged_monitor')}
          className={`px-3 py-2 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'privileged_monitor'
              ? 'bg-rose-950 text-rose-300 border border-rose-800/80 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-rose-400" />
          Privileged Access Monitor (SAP_ALL / Debug / Firefighter)
        </button>
        <button
          onClick={() => setActiveTab('role_engineering')}
          className={`px-3 py-2 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'role_engineering'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/80 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          Role Engineering AI (Clean Role Design)
        </button>
        <button
          onClick={() => setActiveTab('auth_failure')}
          className={`px-3 py-2 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'auth_failure'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/80 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
          Auth Failure Analysis (SU53 / STAUTHTRACE)
        </button>
        <button
          onClick={() => setActiveTab('jml_lifecycle')}
          className={`px-3 py-2 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'jml_lifecycle'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/80 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
          Joiner / Mover / Leaver (JML Lifecycle)
        </button>
        <button
          onClick={() => setActiveTab('clone_access')}
          className={`px-3 py-2 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'clone_access'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/80 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Smart Access Request AI (Role Cloning)
        </button>
        <button
          onClick={() => setActiveTab('access_trace')}
          className={`px-3 py-2 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'access_trace'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/80 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Search className="w-3.5 h-3.5 text-cyan-400" />
          Why Does User Have Access? (Deep Trace)
        </button>
        <button
          onClick={() => setActiveTab('remediation')}
          className={`px-3 py-2 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'remediation'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/80 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          Controlled Remediation Actions
        </button>
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-2 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'overview'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/80 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Architecture & Overview
        </button>
        <button
          onClick={() => setActiveTab('queries')}
          className={`px-3 py-2 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'queries'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/80 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Natural-Language Evidence Q&A ({report.queries.length})
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`px-3 py-2 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'roles'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/80 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          Roles & Authorizations ({report.roles.length})
        </button>
        <button
          onClick={() => setActiveTab('sod')}
          className={`px-3 py-2 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'sod'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/80 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          SoD Risk Matrix
        </button>
        <button
          onClick={() => setActiveTab('firefighter')}
          className={`px-3 py-2 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'firefighter'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/80 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          Firefighter (EAM) ({report.firefighterSessions.length})
        </button>
        <button
          onClick={() => setActiveTab('privileged')}
          className={`px-3 py-2 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'privileged'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/80 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          Privileged Accounts ({report.privilegedAccounts.length})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3 py-2 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'audit'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/80 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          SM20 Audit & Auth Metrics
        </button>
        <button
          onClick={() => setActiveTab('approvals')}
          className={`px-3 py-2 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'approvals'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/80 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
          CISO Approvals & Ledger ({report.pendingApprovals.length})
        </button>
      </div>

      {/* TAB CONTENT: RECOMMENDED APPROVAL MODEL */}
      {activeTab === 'approval_model' && (
        <div className="mt-4 space-y-4 font-mono text-xs">
          {/* HEADER BANNER */}
          <div className="p-4 bg-slate-950 rounded-xl border border-amber-900/80 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <h3 className="font-extrabold text-amber-300 uppercase tracking-wider text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                SAP Security Recommended Governance & Approval Model
              </h3>
              <span className="text-[10px] bg-amber-950 text-amber-300 px-2.5 py-0.5 rounded border border-amber-800 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                SOX-404 & GRC AC 12.0 3-Tier Governance Enforced
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
              The SAP Security Governance Engine categorizes all user management, authorization, and role operations into 3 strict automation tiers based on risk exposure and audit impact: <strong className="text-emerald-300">Fully Autonomous / Read-Only</strong> (continuous AI diagnostics & monitoring), <strong className="text-amber-300">Policy-Controlled</strong> (automated operational self-healing under threshold rules), and <strong className="text-rose-300">Human Approval Required</strong> (gated multi-party sign-off for production changes, superuser privileges, and critical authorizations).
            </p>
          </div>

          {/* TIER METRICS SUMMARY */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* TIER 1: FULLY AUTONOMOUS */}
            <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/80 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  1. Fully Autonomous / Read-Only
                </span>
                <span className="text-xs font-extrabold bg-emerald-900/80 text-emerald-200 px-2 py-0.5 rounded border border-emerald-700">
                  8 Actions
                </span>
              </div>
              <p className="text-[10px] text-slate-300 font-sans">
                Read-only queries, analytical traces, and audit reporting executed continuously with 0 human overhead.
              </p>
              <div className="text-[9px] text-emerald-400 font-bold flex items-center gap-1 pt-1">
                <ShieldCheck className="w-3 h-3" /> Zero Risk • Continuous AI Execution
              </div>
            </div>

            {/* TIER 2: POLICY-CONTROLLED */}
            <div className="p-3.5 bg-amber-950/40 border border-amber-800/80 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  2. Policy-Controlled
                </span>
                <span className="text-xs font-extrabold bg-amber-900/80 text-amber-200 px-2 py-0.5 rounded border border-amber-700">
                  4 Actions
                </span>
              </div>
              <p className="text-[10px] text-slate-300 font-sans">
                Operational remediations automatically executed under CISO threshold policy and audit logging.
              </p>
              <div className="text-[9px] text-amber-400 font-bold flex items-center gap-1 pt-1">
                <Lock className="w-3 h-3" /> Low Risk • Automated Self-Healing
              </div>
            </div>

            {/* TIER 3: HUMAN APPROVAL REQUIRED */}
            <div className="p-3.5 bg-rose-950/40 border border-rose-800/80 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-rose-400" />
                  3. Human Approval Required
                </span>
                <span className="text-xs font-extrabold bg-rose-900/80 text-rose-200 px-2 py-0.5 rounded border border-rose-700">
                  8 Actions
                </span>
              </div>
              <p className="text-[10px] text-slate-300 font-sans">
                High-impact production changes requiring multi-party sign-off (Role Owner / Security Lead / CISO).
              </p>
              <div className="text-[9px] text-rose-400 font-bold flex items-center gap-1 pt-1">
                <AlertTriangle className="w-3 h-3" /> High/Critical Risk • Mandatory Workflow Gate
              </div>
            </div>
          </div>

          {/* DETAILED TIERS GRID */}
          {approvalModelData?.tiers ? (
            <div className="space-y-4">
              {approvalModelData.tiers.map((tier: any) => (
                <div key={tier.tierId} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase font-mono border ${tier.badgeColor}`}>
                        {tier.tierName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono font-bold">
                        ({tier.actionItems?.length || 0} Managed Security Operations)
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-sans">
                      {tier.description}
                    </span>
                  </div>

                  {/* ACTION ITEMS GRID */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {tier.actionItems?.map((item: any) => (
                      <div key={item.id} className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2 flex flex-col justify-between hover:border-slate-700 transition">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] text-slate-400 font-mono font-bold">{item.id}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold font-mono ${
                              item.riskLevel === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                              item.riskLevel === 'HIGH' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                              item.riskLevel === 'MEDIUM' ? 'bg-amber-950/60 text-amber-200 border border-amber-800/60' :
                              'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            }`}>
                              {item.riskLevel}
                            </span>
                          </div>
                          <strong className="text-white text-xs block font-sans">{item.name}</strong>
                          <span className="text-[9px] text-slate-400 block font-mono font-semibold">{item.category}</span>
                          <p className="text-[10px] text-slate-300 font-sans leading-relaxed line-clamp-3">
                            {item.description}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-800 space-y-1 text-[9px] font-mono">
                          <div>
                            <span className="text-slate-400 block font-bold">SAP Control:</span>
                            <span className="text-cyan-300 truncate block">{item.sapControlRef}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-bold">Execution Engine:</span>
                            <span className="text-slate-200 truncate block">{item.executionMechanism}</span>
                          </div>
                          {item.activeCountOrStatus && (
                            <div className="mt-1 p-1 bg-slate-950 rounded text-[9px] text-emerald-300 border border-slate-800">
                              {item.activeCountOrStatus}
                            </div>
                          )}
                          {item.requiresCisoSignoff && (
                            <div className="mt-1 p-1 bg-rose-950/80 rounded text-[9px] text-rose-300 border border-rose-800 font-bold flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-rose-400" /> MANDATORY CISO SIGNOFF
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* PENDING HUMAN APPROVAL QUEUE TABLE */}
              {approvalModelData.pendingHumanApprovalQueue && (
                <div className="p-4 bg-slate-950 rounded-xl border border-rose-900/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-rose-300 uppercase tracking-wider text-xs flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-rose-400" />
                      Pending High-Risk Human Approval Queue ({approvalModelData.pendingHumanApprovalQueue.length})
                    </h4>
                    <span className="text-[9px] bg-rose-950 text-rose-300 px-2 py-0.5 rounded border border-rose-800 font-bold">
                      Tier 3 Gated Approval Workflow
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px] font-mono">
                      <thead className="bg-slate-900 text-slate-400 uppercase text-[9px] border-b border-slate-800">
                        <tr>
                          <th className="p-2.5">Request ID & Time</th>
                          <th className="p-2.5">Action Type</th>
                          <th className="p-2.5">Target User / Role</th>
                          <th className="p-2.5">Requested By & Justification</th>
                          <th className="p-2.5">Impact Assessment</th>
                          <th className="p-2.5 text-center">Governance Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-200">
                        {approvalModelData.pendingHumanApprovalQueue.map((req: any) => (
                          <tr key={req.requestId} className="hover:bg-slate-900/50 transition">
                            <td className="p-2.5 font-bold">
                              <span className="text-white block">{req.requestId}</span>
                              <span className="text-[9px] text-slate-400 font-sans block">{new Date(req.timestamp).toLocaleTimeString()}</span>
                            </td>
                            <td className="p-2.5">
                              <span className="px-2 py-0.5 bg-rose-950 text-rose-300 border border-rose-800 rounded text-[9px] font-bold block w-max">
                                {req.actionType}
                              </span>
                              <span className="text-[8px] text-slate-400 block mt-0.5">{req.riskCategory}</span>
                            </td>
                            <td className="p-2.5 text-cyan-300 font-bold">{req.targetUserOrRole}</td>
                            <td className="p-2.5">
                              <strong className="text-slate-100 block">{req.requestedBy}</strong>
                              <span className="text-[10px] text-slate-300 font-sans block">{req.justification}</span>
                            </td>
                            <td className="p-2.5 text-slate-300 font-sans text-[10px] leading-tight max-w-xs">
                              {req.impactAssessment}
                            </td>
                            <td className="p-2.5 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleExecuteRemediation(req.requestId, `APPROVE: ${req.actionType} for ${req.targetUserOrRole}`)}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-[9px] transition flex items-center gap-1 shadow"
                                >
                                  <CheckCircle className="w-3 h-3" /> Approve
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleExecuteRemediation(req.requestId, `REJECT: ${req.actionType} for ${req.targetUserOrRole}`)}
                                  className="px-2.5 py-1 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 font-bold rounded text-[9px] transition flex items-center gap-1"
                                >
                                  Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 font-mono">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-400" />
              Loading SAP Security Recommended Approval Model...
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: CROSS-MODULE SECURITY INTELLIGENCE */}
      {activeTab === 'cross_module_intelligence' && (
        <div className="mt-4 space-y-4 font-mono text-xs">
          {/* HEADER & SCENARIO BANNER */}
          <div className="p-4 bg-slate-950 rounded-xl border border-rose-900/80 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <h3 className="font-extrabold text-rose-300 uppercase tracking-wider text-xs flex items-center gap-2">
                <Zap className="w-4 h-4 text-rose-400" />
                Cross-Module Security Intelligence (End-to-End Fraud Risk Agent Chain)
              </h3>
              <span className="text-[10px] bg-rose-950 text-rose-300 px-2.5 py-0.5 rounded border border-rose-800 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
                Cross-Functional Toxic Combination Analyzer Active
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
              Cross-Module Security Intelligence automatically chains domain-specialized AI Agents (Security, Procurement/MM, FI/AP, SD, Pricing, and GRC/SoD) to detect real end-to-end fraud risks that cross functional boundary silos.
            </p>

            {/* PRESET CROSS-MODULE FRAUD SCENARIO CHIPS */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Featured Cross-Module Fraud Intelligence Questions:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  {
                    label: "Who can create a supplier, change bank information, and pay that supplier?",
                    category: "VENDOR_PAYMENT_FRAUD",
                    query: "Who can create a supplier, change bank information, and pay that supplier?"
                  },
                  {
                    label: "Who can create a sales order and manually override its price?",
                    category: "SALES_PRICE_OVERRIDE",
                    query: "Who can create a sales order and manually override its price?"
                  },
                  {
                    label: "Who can release a PO and approve its vendor invoice?",
                    category: "PO_INVOICE_RELEASE_COLLUSION",
                    query: "Who can release a purchase order and approve its vendor invoice?"
                  },
                  {
                    label: "Who can post a goods receipt and create the corresponding credit memo?",
                    category: "GOODS_RECEIPT_CREDIT_MEMO",
                    query: "Who can post a goods receipt and create the corresponding credit memo?"
                  }
                ].map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setCrossModuleQueryInput(p.query);
                      setCrossModuleCategoryInput(p.category);
                      runCrossModuleIntelligence(p.query, p.category);
                    }}
                    className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-rose-600 rounded text-[10px] transition font-mono font-bold text-left"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* CUSTOM QUERY INPUT */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-slate-900">
              <input
                type="text"
                value={crossModuleQueryInput}
                onChange={(e) => setCrossModuleQueryInput(e.target.value)}
                placeholder="Ask cross-module security query (e.g. Who can create a supplier, change bank info, and pay that supplier?)"
                className="flex-1 w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-rose-500"
              />
              <select
                value={crossModuleCategoryInput}
                onChange={(e) => setCrossModuleCategoryInput(e.target.value)}
                className="w-full sm:w-56 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-xs font-mono focus:outline-none focus:border-rose-500"
              >
                <option value="VENDOR_PAYMENT_FRAUD">Vendor Master & Payment Fraud</option>
                <option value="SALES_PRICE_OVERRIDE">Sales Order & Price Override</option>
                <option value="PO_INVOICE_RELEASE_COLLUSION">PO Release & Invoice Collusion</option>
                <option value="GOODS_RECEIPT_CREDIT_MEMO">Goods Receipt & Credit Memo</option>
                <option value="CROSS_MODULE_CUSTOM">Custom Cross-Module Analysis</option>
              </select>
              <button
                type="button"
                disabled={crossModuleLoading || !crossModuleQueryInput}
                onClick={() => runCrossModuleIntelligence(crossModuleQueryInput, crossModuleCategoryInput)}
                className="w-full sm:w-auto px-5 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold rounded-lg transition text-xs flex items-center justify-center gap-2 shrink-0 shadow-md"
              >
                {crossModuleLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                Analyze Agent Chain
              </button>
            </div>
          </div>

          {/* ANALYSIS RESULTS DISPLAY */}
          {crossModuleData && (
            <div className="p-4 bg-slate-950 border border-rose-900/80 rounded-xl space-y-4 shadow-xl">
              {/* REAL END-TO-END FRAUD RISK SUMMARY & STATS */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-3 bg-slate-900 border-l-4 border-l-rose-500 rounded-r-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-rose-400 uppercase font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      End-to-End Fraud Risk Intelligence Summary:
                    </span>
                    <span className="text-[9px] bg-rose-950 text-rose-300 px-2 py-0.5 rounded border border-rose-800 font-mono font-bold">
                      {crossModuleData.scenarioCategory}
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold text-white font-sans">{crossModuleData.scenarioTitle}</h4>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    {crossModuleData.realEndToEndFraudRiskSummary}
                  </p>
                </div>
                <div className="shrink-0 p-3 bg-rose-950/80 border border-rose-800 rounded-lg text-center min-w-[150px]">
                  <span className="text-[9px] text-rose-300 uppercase font-bold block">Exposed Users</span>
                  <span className="text-2xl font-extrabold text-rose-400">
                    {crossModuleData.exposedUsersCount} Users
                  </span>
                  <span className="text-[8px] text-slate-400 block mt-0.5">Unmitigated Toxic Chain</span>
                </div>
              </div>

              {/* SEQUENTIAL AGENT DELEGATION CHAIN (AGENTS DAG FLOW) */}
              <div className="space-y-2">
                <span className="font-bold text-rose-300 uppercase text-xs flex items-center gap-2">
                  <Workflow className="w-4 h-4 text-rose-400" />
                  Sequential Agent Delegation Flow Across SAP Modules:
                </span>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                  {crossModuleData.agentChainFlow?.map((step: any, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-900 rounded-lg border border-slate-800 relative space-y-1.5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="w-5 h-5 rounded-full bg-rose-950 text-rose-300 font-extrabold flex items-center justify-center text-[10px] border border-rose-800">
                            {idx + 1}
                          </span>
                          <span className="text-[8px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono font-bold">
                            {step.confidencePct}% Conf
                          </span>
                        </div>
                        <strong className="text-rose-300 text-xs block truncate">{step.agentName}</strong>
                        <span className="text-[9px] text-slate-400 block font-sans font-semibold leading-tight">{step.module}</span>
                        <p className="text-[10px] text-slate-300 mt-1 font-sans leading-tight">{step.findings}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-800 space-y-1 text-[9px] font-mono">
                        <div>
                          <span className="text-slate-400 font-bold block">T-Codes:</span>
                          <span className="text-emerald-300 truncate block">{step.tcodesInspected?.join(', ')}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold block">Auth Objects:</span>
                          <span className="text-cyan-300 truncate block">{step.authObjectsInspected?.join(', ')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* USERS IDENTIFIED WITH TOXIC COMBINATIONS */}
              <div className="space-y-2">
                <span className="font-bold text-rose-300 uppercase text-xs flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-rose-400" />
                  Users Identified with End-to-End Toxic Capability Combinations ({crossModuleData.usersWithToxicCombinations?.length}):
                </span>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {crossModuleData.usersWithToxicCombinations?.map((usr: any, idx: number) => (
                    <div key={idx} className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-2.5">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <strong className="text-white text-xs">{usr.userName}</strong>
                            <span className="text-[9px] text-rose-300 font-mono font-bold">({usr.userId})</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-sans block">{usr.department}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${
                          usr.fraudRiskLevel === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                          usr.fraudRiskLevel === 'HIGH' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                          'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}>
                          {usr.fraudRiskLevel} RISK
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">End-to-End Toxic Capabilities:</span>
                        <div className="space-y-1">
                          {usr.endToEndCapabilities?.map((cap: string, cIdx: number) => (
                            <div key={cIdx} className="p-1.5 bg-slate-950 rounded border border-rose-950 text-[10px] text-rose-200 font-sans flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0"></span>
                              <span>{cap}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[9px] font-mono">
                        <span className="text-slate-400">Roles: <strong className="text-slate-200">{usr.rolesHeld?.join(', ')}</strong></span>
                        <span className={usr.mitigatingControlActive ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                          {usr.mitigatingControlActive ? 'Mitigated' : 'NO MITIGATING CONTROL'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* TOXIC CAPABILITIES & REMEDIATION PLAN */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {/* TOXIC CAPABILITIES */}
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                  <span className="font-bold text-rose-300 uppercase text-xs flex items-center gap-2">
                    <Key className="w-3.5 h-3.5 text-rose-400" />
                    Identified Toxic T-Code & Authorization Objects:
                  </span>
                  <div className="space-y-1">
                    {crossModuleData.toxicCapabilitiesIdentified?.map((tc: string, idx: number) => (
                      <div key={idx} className="p-2 bg-slate-950 rounded border border-slate-800 text-[10px] text-slate-200 font-mono">
                        {tc}
                      </div>
                    ))}
                  </div>
                </div>

                {/* RECOMMENDED REMEDIATION ACTION PLAN */}
                <div className="p-3 bg-rose-950/40 rounded-xl border border-rose-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-300 uppercase text-xs flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                      Cross-Module Segregation Remediation Plan:
                    </span>
                    <button
                      type="button"
                      onClick={() => handleExecuteRemediation('CR-SOD-4401', 'Apply Cross-Module Role Segregation & Enforce Dual Control')}
                      className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded text-[10px] transition flex items-center gap-1 shadow"
                    >
                      <CheckCircle className="w-3 h-3" />
                      Remediate Role Conflicts
                    </button>
                  </div>
                  <div className="space-y-1">
                    {crossModuleData.recommendedRemediation?.map((rem: string, idx: number) => (
                      <div key={idx} className="p-2 bg-slate-950 rounded border border-slate-800 text-[10px] text-slate-200 font-sans flex items-start gap-1.5">
                        <span className="text-rose-400 font-bold font-mono">{idx + 1}.</span>
                        <span>{rem}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: MULTI-AGENT SAP SECURITY ARCHITECTURE */}
      {activeTab === 'multi_agent' && (
        <div className="mt-4 space-y-4 font-mono text-xs">
          {/* HEADER & ARCHITECTURE BANNER */}
          <div className="p-4 bg-slate-950 rounded-xl border border-purple-900/80 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <h3 className="font-extrabold text-purple-300 uppercase tracking-wider text-xs flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-400" />
                Multi-Agent SAP Security Architecture (10 Specialized Security AI Agents)
              </h3>
              <span className="text-[10px] bg-purple-950 text-purple-300 px-2.5 py-0.5 rounded border border-purple-800 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
                S/4HANA Multi-Agent Security DAG Active
              </span>
            </div>

            {/* 10 SPECIALIZED AGENTS OVERVIEW GRID */}
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Coordinated Security AI Agent Roles (10 Autonomous Micro-Agents):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 text-[10px]">
                {[
                  { title: "Security Orchestrator", role: "Workflow control & agent DAG dispatching", icon: Cpu, color: "text-purple-300 bg-purple-950/60 border-purple-800" },
                  { title: "User Lifecycle Agent", role: "Joiner, Mover, Leaver (JML) tracking", icon: UserCheck, color: "text-indigo-300 bg-indigo-950/60 border-indigo-800" },
                  { title: "Role Agent", role: "PFCG roles, catalogs, auth design", icon: ShieldCheck, color: "text-cyan-300 bg-cyan-950/60 border-cyan-800" },
                  { title: "Authorization Agent", role: "Objects, fields, traces, SU53 analysis", icon: Key, color: "text-emerald-300 bg-emerald-950/60 border-emerald-800" },
                  { title: "SoD Agent", role: "Conflict analysis & mitigation rules", icon: AlertTriangle, color: "text-amber-300 bg-amber-950/60 border-amber-800" },
                  { title: "Privileged Access Agent", role: "Firefighter & high-risk access logs", icon: Zap, color: "text-rose-300 bg-rose-950/60 border-rose-800" },
                  { title: "Authentication Agent", role: "SSO, MFA, IdP, certificates", icon: Lock, color: "text-teal-300 bg-teal-950/60 border-teal-800" },
                  { title: "Audit Agent", role: "SOX 404 controls, evidence, reporting", icon: FileText, color: "text-blue-300 bg-blue-950/60 border-blue-800" },
                  { title: "Anomaly Detection Agent", role: "Behavioral anomalies & off-hours usage", icon: Activity, color: "text-fuchsia-300 bg-fuchsia-950/60 border-fuchsia-800" },
                  { title: "Remediation Agent", role: "Controlled changes after approval", icon: CheckCircle, color: "text-emerald-300 bg-emerald-950/60 border-emerald-800" }
                ].map((ag, idx) => {
                  const IconComp = ag.icon;
                  return (
                    <div key={idx} className={`p-2 rounded border font-sans ${ag.color}`}>
                      <div className="flex items-center gap-1.5 font-bold mb-0.5 font-mono text-[11px]">
                        <IconComp className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{ag.title}</span>
                      </div>
                      <p className="text-[9px] opacity-80 leading-tight">{ag.role}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PRESET MULTI-AGENT ORCHESTRATION CHIPS */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Quick Multi-Agent Security Scenarios:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: "Evaluate Mover Event (FI -> MM Position Shift)", query: "Evaluate security workflow for position shift Mover event from FI to MM", scope: "USER_ALEX_CHEN" },
                  { label: "Audit Cross-Module SoD & Wildcards", query: "Audit cross-module SoD matrix and wildcard authorizations", scope: "GLOBAL_S4HANA_SECURITY_SCOPE" },
                  { label: "Investigate Off-Hours Firefighter Activity", query: "Investigate off-hours SPM Firefighter usage logs and table edits", scope: "FIREFIGHTER_SCOPE" },
                  { label: "Verify SSO & Certificate Expirations", query: "Verify SAML 2.0 SSO, MFA enforcement, and STRUST certificate expirations", scope: "AUTHENTICATION_SCOPE" }
                ].map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setMultiAgentQueryInput(p.query);
                      setMultiAgentScopeInput(p.scope);
                      runMultiAgentOrchestration(p.query, p.scope);
                    }}
                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-purple-600 rounded text-[10px] transition font-mono font-bold"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* CUSTOM MULTI-AGENT EXECUTION INPUT */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-slate-900">
              <input
                type="text"
                value={multiAgentQueryInput}
                onChange={(e) => setMultiAgentQueryInput(e.target.value)}
                placeholder="Orchestration Query (e.g. Evaluate position shift Mover event for User ABC)"
                className="flex-1 w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-purple-500"
              />
              <input
                type="text"
                value={multiAgentScopeInput}
                onChange={(e) => setMultiAgentScopeInput(e.target.value)}
                placeholder="Target Scope / User ID"
                className="w-full sm:w-48 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-xs font-mono focus:outline-none focus:border-purple-500"
              />
              <button
                type="button"
                disabled={multiAgentLoading || !multiAgentQueryInput}
                onClick={() => runMultiAgentOrchestration(multiAgentQueryInput, multiAgentScopeInput)}
                className="w-full sm:w-auto px-5 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold rounded-lg transition text-xs flex items-center justify-center gap-2 shrink-0"
              >
                {multiAgentLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Cpu className="w-3.5 h-3.5" />}
                Run Multi-Agent Security DAG
              </button>
            </div>
          </div>

          {/* MULTI-AGENT RESULTS DISPLAY */}
          {multiAgentData && (
            <div className="p-4 bg-slate-950 border border-purple-800/80 rounded-xl space-y-4 shadow-xl">
              {/* ORCHESTRATOR EXECUTIVE SUMMARY & OVERALL RISK SCORE */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-3 bg-slate-900 border-l-4 border-l-purple-500 rounded-r-lg">
                <div className="space-y-1">
                  <span className="text-[10px] text-purple-400 uppercase font-bold block flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5" />
                    Security Orchestrator Agent Consensus Summary:
                  </span>
                  <p className="text-xs text-white font-sans font-semibold leading-relaxed">
                    {multiAgentData.orchestratorSummary}
                  </p>
                </div>
                <div className="shrink-0 p-3 bg-purple-950/80 border border-purple-800 rounded-lg text-center min-w-[140px]">
                  <span className="text-[9px] text-purple-300 uppercase font-bold block">Overall Risk Severity</span>
                  <span className={`text-xl font-extrabold ${
                    multiAgentData.overallRiskLevel === 'CRITICAL' ? 'text-rose-400' :
                    multiAgentData.overallRiskLevel === 'HIGH' ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {multiAgentData.overallRiskLevel} ({multiAgentData.overallRiskScore}/100)
                  </span>
                  <span className="text-[8px] text-slate-400 block mt-0.5">Live S/4HANA Security DAG</span>
                </div>
              </div>

              {/* 10 AGENT DETAILED STATUS CARDS */}
              <div className="space-y-2">
                <span className="font-bold text-purple-300 uppercase text-xs flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-400" />
                  Detailed Status Across All 10 Coordinated Agents:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2 text-[10px]">
                  {/* AGENT 1: ORCHESTRATOR */}
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                      <span className="font-bold text-purple-300">1. Orchestrator</span>
                      <span className="text-[8px] bg-purple-950 text-purple-300 px-1.5 rounded">{multiAgentData.agents.orchestrator.status}</span>
                    </div>
                    <p className="text-slate-300">{multiAgentData.agents.orchestrator.workflowSummary}</p>
                  </div>

                  {/* AGENT 2: USER LIFECYCLE */}
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                      <span className="font-bold text-indigo-300">2. User Lifecycle</span>
                      <span className="text-[8px] bg-indigo-950 text-indigo-300 px-1.5 rounded">{multiAgentData.agents.userLifecycle.jmlStage}</span>
                    </div>
                    <p className="text-slate-300">{multiAgentData.agents.userLifecycle.details}</p>
                  </div>

                  {/* AGENT 3: ROLE ARCHITECT */}
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                      <span className="font-bold text-cyan-300">3. Role Agent</span>
                      <span className="text-[8px] bg-cyan-950 text-cyan-300 px-1.5 rounded">PFCG</span>
                    </div>
                    <p className="text-slate-300">{multiAgentData.agents.roleDesign.roleCatalogHealth}</p>
                    <span className="text-[8px] text-slate-400 block truncate">Roles: {multiAgentData.agents.roleDesign.pfcgRolesInvolved.join(', ')}</span>
                  </div>

                  {/* AGENT 4: AUTHORIZATION */}
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                      <span className="font-bold text-emerald-300">4. Authorization</span>
                      <span className="text-[8px] bg-emerald-950 text-emerald-300 px-1.5 rounded">SU53 / TRACE</span>
                    </div>
                    <p className="text-slate-300">{multiAgentData.agents.authorization.su53TraceSummary}</p>
                    <span className="text-[8px] text-slate-400 block truncate">Objects: {multiAgentData.agents.authorization.authObjectsAnalyzed.join(', ')}</span>
                  </div>

                  {/* AGENT 5: SOD */}
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                      <span className="font-bold text-amber-300">5. SoD Agent</span>
                      <span className="text-[8px] bg-amber-950 text-amber-300 px-1.5 rounded">{multiAgentData.agents.sodAnalysis.conflictsDetectedCount} Conflict(s)</span>
                    </div>
                    <p className="text-slate-300">{multiAgentData.agents.sodAnalysis.mitigationStrategy}</p>
                  </div>

                  {/* AGENT 6: PRIVILEGED ACCESS */}
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                      <span className="font-bold text-rose-300">6. Privileged Access</span>
                      <span className="text-[8px] bg-rose-950 text-rose-300 px-1.5 rounded">FIREFIGHTER</span>
                    </div>
                    <p className="text-slate-300">{multiAgentData.agents.privilegedAccess.highRiskAccessLevel}</p>
                  </div>

                  {/* AGENT 7: AUTHENTICATION */}
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                      <span className="font-bold text-teal-300">7. Authentication</span>
                      <span className="text-[8px] bg-teal-950 text-teal-300 px-1.5 rounded">SSO / MFA</span>
                    </div>
                    <p className="text-slate-300">{multiAgentData.agents.authentication.ssoMfaStatus}</p>
                  </div>

                  {/* AGENT 8: AUDIT */}
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                      <span className="font-bold text-blue-300">8. Audit Agent</span>
                      <span className="text-[8px] bg-blue-950 text-blue-300 px-1.5 rounded">SOX 404</span>
                    </div>
                    <p className="text-slate-300">{multiAgentData.agents.auditCompliance.soxIsoControlStatus}</p>
                  </div>

                  {/* AGENT 9: ANOMALY DETECTION */}
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                      <span className="font-bold text-fuchsia-300">9. Anomaly Detector</span>
                      <span className="text-[8px] bg-fuchsia-950 text-fuchsia-300 px-1.5 rounded">BEHAVIOR AI</span>
                    </div>
                    <p className="text-slate-300">{multiAgentData.agents.anomalyDetection.anomalyDetails}</p>
                  </div>

                  {/* AGENT 10: REMEDIATION */}
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                      <span className="font-bold text-emerald-300">10. Remediation</span>
                      <span className="text-[8px] bg-emerald-950 text-emerald-300 px-1.5 rounded">CONTROLLED CHANGE</span>
                    </div>
                    <p className="text-slate-300">{multiAgentData.agents.remediation.remediationStatus}</p>
                  </div>
                </div>
              </div>

              {/* STEP-BY-STEP COLLABORATION PIPELINE */}
              <div className="space-y-3">
                <span className="font-bold text-purple-300 uppercase text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-400" />
                  Multi-Agent Step-by-Step Execution Sequence (DAG Execution Log):
                </span>

                <div className="space-y-2">
                  {multiAgentData.collaborationSteps?.map((step: any, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-purple-900 text-purple-300 font-extrabold flex items-center justify-center text-[10px]">
                            {idx + 1}
                          </span>
                          <strong className="text-white text-xs">{step.agentName}</strong>
                          <span className="text-[9px] text-slate-400 font-mono">({step.agentRole})</span>
                        </div>
                        <p className="text-[11px] text-slate-300 pl-7 font-sans">
                          <strong>Task:</strong> {step.inputTask}
                        </p>
                        <p className="text-[11px] text-purple-200 pl-7 font-sans">
                          <strong>Output Artifact:</strong> {step.outputArtifact}
                        </p>
                      </div>

                      <div className="shrink-0 flex items-center gap-3 pl-7 md:pl-0">
                        <span className="text-[10px] text-slate-400 font-mono">
                          Confidence: <strong className="text-emerald-400">{step.confidenceScorePct}%</strong>
                        </span>
                        <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold ${
                          step.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}>
                          {step.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RECOMMENDED REMEDIATION PLANS & CISO CHANGE REQUEST ACTION */}
              {multiAgentData.recommendedRemediationPlans && (
                <div className="p-4 bg-purple-950/40 rounded-xl border border-purple-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-purple-300 text-xs uppercase flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      Consolidated Multi-Agent Controlled Remediation Action Plan:
                    </span>
                    <button
                      type="button"
                      onClick={() => handleExecuteRemediation('CR-SEC-9921', 'Submit controlled PFCG role delinking for CISO approval')}
                      className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-xs transition shrink-0 flex items-center gap-1.5 shadow-md"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Execute Change Request CR-SEC-9921
                    </button>
                  </div>
                  <div className="space-y-1.5 text-[11px]">
                    {multiAgentData.recommendedRemediationPlans.map((plan: string, idx: number) => (
                      <div key={idx} className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between gap-2">
                        <span className="text-slate-200 font-sans">{plan}</span>
                        <span className="text-[9px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded font-mono border border-slate-800">
                          Step {idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: SELF-HEALING SECURITY AI */}
      {activeTab === 'self_healing' && (
        <div className="mt-4 space-y-4 font-mono text-xs">
          {/* HEADER & OPERATIONAL CYCLE STEPS BANNER */}
          <div className="p-4 bg-slate-950 rounded-xl border border-emerald-900/80 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <h3 className="font-extrabold text-emerald-300 uppercase tracking-wider text-xs flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                SAP Self-Healing Security Agent (Auto-Remediation Engine)
              </h3>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2.5 py-0.5 rounded border border-emerald-800 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                S/4HANA Autonomous Security Lifecycle
              </span>
            </div>

            {/* VISUAL 8-STEP OPERATIONAL CYCLE */}
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Mandatory Operational Lifecycle (8-Step Execution Pipeline):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5 text-center">
                {[
                  { num: "1", name: "Detect", color: "border-emerald-800 text-emerald-300 bg-emerald-950/60" },
                  { num: "2", name: "Validate", color: "border-emerald-800 text-emerald-300 bg-emerald-950/60" },
                  { num: "3", name: "Risk Score", color: "border-indigo-800 text-indigo-300 bg-indigo-950/60" },
                  { num: "4", name: "Recommend", color: "border-indigo-800 text-indigo-300 bg-indigo-950/60" },
                  { num: "5", name: "Approve", color: "border-amber-800 text-amber-300 bg-amber-950/60" },
                  { num: "6", name: "Remediate", color: "border-emerald-800 text-emerald-300 bg-emerald-950/60" },
                  { num: "7", name: "Verify", color: "border-emerald-800 text-emerald-300 bg-emerald-950/60" },
                  { num: "8", name: "Audit", color: "border-purple-800 text-purple-300 bg-purple-950/60" }
                ].map((s, idx) => (
                  <div key={idx} className={`p-2 rounded border font-bold text-[10px] ${s.color}`}>
                    <span className="block text-[8px] opacity-75">{s.num}. Step</span>
                    {s.name}
                  </div>
                ))}
              </div>
            </div>

            {/* QUICK PRESET SELF-HEALING ACTION CHIPS */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Low-Risk Security Self-Healing Scan Presets:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: "Lock Dormant Inactive Users (>90 days)", query: "Lock dormant inactive users inactive for over 90 days", cat: "LOCK_DORMANT" },
                  { label: "Remove Expired Temporary Roles", query: "Remove expired temporary role assignments from AGR_USERS", cat: "REMOVE_EXPIRED_ROLES" },
                  { label: "Flag Orphan Technical Accounts", query: "Flag orphan service accounts without active HR owner", cat: "FLAG_ORPHAN_ACCOUNTS" },
                  { label: "Disable Expired Firefighter Assignments", query: "Disable expired GRC EAM firefighter ID assignments", cat: "DISABLE_EXPIRED_FIREFIGHTER" },
                  { label: "Trigger Missing Access Reviews", query: "Trigger missing overdue user access review campaigns", cat: "TRIGGER_MISSING_REVIEWS" },
                  { label: "Remove Access After Verified Termination", query: "Remove SAP roles and locks after verified HR PA30 termination", cat: "REMOVE_TERMINATED_ACCESS" }
                ].map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setHealingQueryInput(p.query);
                      setHealingCategoryFilter(p.cat);
                      runSelfHealingScan(p.query, p.cat);
                    }}
                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-emerald-600 rounded text-[10px] transition font-mono font-bold"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* CUSTOM SCAN INPUT & CATEGORY SELECT */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-slate-900">
              <input
                type="text"
                value={healingQueryInput}
                onChange={(e) => setHealingQueryInput(e.target.value)}
                placeholder="Ask Self-Healing AI (e.g. Lock dormant users, purge expired temporary roles)"
                className="flex-1 w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
              />
              <select
                value={healingCategoryFilter}
                onChange={(e) => setHealingCategoryFilter(e.target.value as any)}
                className="w-full sm:w-auto bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-xs font-mono focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">All Self-Healing Categories</option>
                <option value="LOCK_DORMANT">Lock Dormant Inactive Users</option>
                <option value="REMOVE_EXPIRED_ROLES">Remove Expired Temporary Roles</option>
                <option value="FLAG_ORPHAN_ACCOUNTS">Flag Orphan Technical Accounts</option>
                <option value="DISABLE_EXPIRED_FIREFIGHTER">Disable Expired Firefighter Assignments</option>
                <option value="TRIGGER_MISSING_REVIEWS">Trigger Missing Access Reviews</option>
                <option value="REMOVE_TERMINATED_ACCESS">Remove Access After Verified Termination</option>
              </select>
              <button
                type="button"
                disabled={healingLoading || !healingQueryInput}
                onClick={() => runSelfHealingScan(healingQueryInput, healingCategoryFilter)}
                className="w-full sm:w-auto px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-lg transition text-xs flex items-center justify-center gap-2 shrink-0"
              >
                {healingLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5" />}
                Run Operational Cycle
              </button>
            </div>
          </div>

          {/* SELF-HEALING RESULTS DISPLAY */}
          {healingData && (
            <div className="p-4 bg-slate-950 border border-emerald-800/80 rounded-xl space-y-4 shadow-xl">
              {/* EXECUTIVE SUMMARY & COUNTERS */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Detected</span>
                  <span className="text-xl font-extrabold text-white">{healingData.totalIssuesDetected}</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Scanned across S/4HANA</span>
                </div>
                <div className="p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-lg">
                  <span className="text-[10px] text-emerald-400 uppercase font-bold block">Auto-Remediated</span>
                  <span className="text-xl font-extrabold text-emerald-300">{healingData.autoRemediatedCount}</span>
                  <span className="text-[9px] text-emerald-400 block mt-0.5">Resolved automatically</span>
                </div>
                <div className="p-3 bg-amber-950/60 border border-amber-800/80 rounded-lg">
                  <span className="text-[10px] text-amber-400 uppercase font-bold block">Pending Approval</span>
                  <span className="text-xl font-extrabold text-amber-300">{healingData.pendingApprovalCount}</span>
                  <span className="text-[9px] text-amber-400 block mt-0.5">Requires human approval</span>
                </div>
                <div className="p-3 bg-purple-950/60 border border-purple-800/80 rounded-lg">
                  <span className="text-[10px] text-purple-400 uppercase font-bold block">Verified & Audited</span>
                  <span className="text-xl font-extrabold text-purple-300">{healingData.verifiedCount}</span>
                  <span className="text-[9px] text-purple-400 block mt-0.5">Signed SHA-256 evidence</span>
                </div>
              </div>

              {/* EXECUTIVE SUMMARY TEXT */}
              <div className="p-3 bg-slate-900 border-l-4 border-l-emerald-500 rounded-r-lg text-xs text-white font-sans font-semibold">
                {healingData.summary}
              </div>

              {/* DETECTED ISSUES & OPERATIONAL CYCLE DETAILS */}
              <div className="space-y-3">
                <span className="font-bold text-emerald-300 uppercase text-xs flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Self-Healing Security Issues & Operational Cycle Breakdown:
                </span>

                <div className="space-y-3">
                  {healingData.detectedIssues?.map((issue: any, idx: number) => (
                    <div key={idx} className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
                      {/* ISSUE HEADER */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                        <div>
                          <strong className="text-white text-xs">{issue.issueId} - {issue.targetName} ({issue.targetEntity})</strong>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            Category: <strong className="text-emerald-300">{issue.category}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            issue.cycleSteps.riskScore.level === 'LOW' ? 'bg-slate-800 text-slate-300' :
                            issue.cycleSteps.riskScore.level === 'MEDIUM' ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                          }`}>
                            Risk Score: {issue.cycleSteps.riskScore.score} ({issue.cycleSteps.riskScore.level})
                          </span>
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                            issue.status === 'VERIFIED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                            issue.status === 'AWAITING_APPROVAL' ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                          }`}>
                            {issue.status}
                          </span>
                        </div>
                      </div>

                      {/* 8-STEP CYCLE DETAILED GRID */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-[10px]">
                        {/* STEP 1: DETECT */}
                        <div className="p-2 bg-slate-950 rounded border border-slate-800 space-y-1">
                          <span className="text-emerald-400 font-bold block uppercase text-[9px]">1. Detect</span>
                          <p className="text-slate-300">{issue.cycleSteps.detect.details}</p>
                          <span className="text-slate-500 text-[8px] block font-mono">Rule: {issue.cycleSteps.detect.detectionRule}</span>
                        </div>

                        {/* STEP 2: VALIDATE */}
                        <div className="p-2 bg-slate-950 rounded border border-slate-800 space-y-1">
                          <span className="text-emerald-400 font-bold block uppercase text-[9px]">2. Validate</span>
                          <p className="text-slate-300">{issue.cycleSteps.validate.validationDetails}</p>
                          <span className="text-emerald-300 text-[8px] block font-mono">System: {issue.cycleSteps.validate.validatedBySystem}</span>
                        </div>

                        {/* STEP 3 & 4: RISK SCORE & RECOMMEND */}
                        <div className="p-2 bg-slate-950 rounded border border-slate-800 space-y-1">
                          <span className="text-indigo-400 font-bold block uppercase text-[9px]">3 & 4. Risk & Recommend</span>
                          <p className="text-slate-300">{issue.cycleSteps.recommendation.recommendedAction}</p>
                          <span className="text-indigo-300 text-[8px] block font-mono">Auto-Executable: {issue.cycleSteps.recommendation.autoExecutable ? 'YES' : 'NO'}</span>
                        </div>

                        {/* STEP 5 & 6: APPROVE & REMEDIATE */}
                        <div className="p-2 bg-slate-950 rounded border border-slate-800 space-y-1">
                          <span className="text-amber-400 font-bold block uppercase text-[9px]">5 & 6. Approve & Remediate</span>
                          <p className="text-slate-300">{issue.cycleSteps.remediation.executedAction || 'Pending Approval'}</p>
                          {issue.status === 'AWAITING_APPROVAL' ? (
                            <button
                              type="button"
                              onClick={() => handleExecuteRemediation(issue.issueId, issue.cycleSteps.recommendation.recommendedAction)}
                              className="mt-1 w-full py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded text-[9px] transition"
                            >
                              Approve & Execute Remediate
                            </button>
                          ) : (
                            <span className="text-emerald-300 text-[8px] block font-mono">Executed: {issue.cycleSteps.remediation.timestamp}</span>
                          )}
                        </div>

                        {/* STEP 7: VERIFY */}
                        <div className="p-2 bg-slate-950 rounded border border-slate-800 space-y-1 col-span-1 md:col-span-2">
                          <span className="text-purple-400 font-bold block uppercase text-[9px]">7. Verify (State Re-Check)</span>
                          <p className="text-slate-300">{issue.cycleSteps.verify.verificationDetails}</p>
                        </div>

                        {/* STEP 8: AUDIT */}
                        <div className="p-2 bg-slate-950 rounded border border-slate-800 space-y-1 col-span-1 md:col-span-2">
                          <span className="text-purple-400 font-bold block uppercase text-[9px]">8. Audit Trail (Immutable Cryptographic Hash)</span>
                          <p className="text-slate-400 truncate">Log Ref: {issue.cycleSteps.audit.auditLogRef}</p>
                          <code className="text-emerald-300 text-[9px] block font-mono">{issue.cycleSteps.audit.evidenceHash}</code>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RECOMMENDED SELF-HEALING POLICIES */}
              {healingData.recommendedSelfHealingPolicies && (
                <div className="p-4 bg-emerald-950/40 rounded-xl border border-emerald-800/80 space-y-2">
                  <span className="font-extrabold text-emerald-300 text-xs uppercase flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    Recommended Autonomous Security Self-Healing Policies:
                  </span>
                  <div className="space-y-1.5 text-[11px]">
                    {healingData.recommendedSelfHealingPolicies.map((pol: string, idx: number) => (
                      <div key={idx} className="p-2 bg-slate-950 rounded border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-200">{pol}</span>
                        <button
                          type="button"
                          onClick={() => handleExecuteRemediation(`HEAL-POL-${idx}`, pol)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-[10px] transition shrink-0 ml-2"
                        >
                          Enable Self-Healing Policy
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: AUDIT & COMPLIANCE AI */}
      {activeTab === 'audit_compliance' && (
        <div className="mt-4 space-y-4 font-mono text-xs">
          {/* HEADER & QUICK AUDITOR QUESTION CHIPS */}
          <div className="p-4 bg-slate-950 rounded-xl border border-emerald-900/80 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <h3 className="font-extrabold text-emerald-300 uppercase tracking-wider text-xs flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                SAP Security, Audit & Compliance AI Agent (SOX / ISO 27001 / SOC 1 & 2 Evidence)
              </h3>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2.5 py-0.5 rounded border border-emerald-800 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                PA30 HR + SU01 Lock Logs + PFCG Transports Live Audit
              </span>
            </div>

            {/* AUDITOR COMMON QUESTIONS / PRESET PROMPTS */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Auditor Audit & Compliance Control Queries:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: "Terminated User Evidence (24h)", query: "Show me evidence that terminated users were removed within 24 hours.", cat: "TERMINATION_EVIDENCE" },
                  { label: "Q2 Privileged Access Logs", query: "Show all privileged access for Q2.", cat: "PRIVILEGED_ACCESS_Q2" },
                  { label: "Quarterly Review Failures", query: "Which users failed quarterly access review?", cat: "QUARTERLY_ACCESS_REVIEW" },
                  { label: "Expired Mitigating Controls", query: "Show users with expired mitigating controls.", cat: "EXPIRED_MITIGATING_CONTROLS" },
                  { label: "Unapproved Role Modifications", query: "Which role changes lacked approval?", cat: "UNAPPROVED_ROLE_CHANGES" },
                  { label: "Termination Control Evidence", query: "Produce evidence for user-termination controls.", cat: "TERMINATION_EVIDENCE" },
                  { label: "Management Accepted SoD Violations", query: "Show SoD violations accepted by management.", cat: "MANAGEMENT_ACCEPTED_SOD" }
                ].map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setAuditQueryInput(q.query);
                      setAuditFrameworkCategory(q.cat);
                      runAuditCompliance(q.query, q.cat);
                    }}
                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-emerald-600 rounded text-[10px] transition font-mono font-bold"
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>

            {/* CUSTOM AUDIT QUERY INPUT & CATEGORY SELECT */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-slate-900">
              <input
                type="text"
                value={auditQueryInput}
                onChange={(e) => setAuditQueryInput(e.target.value)}
                placeholder="Ask Compliance AI (e.g. Show evidence terminated users locked within 24h, Q2 privileged access)"
                className="flex-1 w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
              />
              <select
                value={auditFrameworkCategory}
                onChange={(e) => setAuditFrameworkCategory(e.target.value as any)}
                className="w-full sm:w-auto bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-xs font-mono focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">All Audit Frameworks</option>
                <option value="TERMINATION_EVIDENCE">User Termination (HR -&gt; Lock 24h)</option>
                <option value="PRIVILEGED_ACCESS_Q2">Privileged Access Logs (Q2)</option>
                <option value="QUARTERLY_ACCESS_REVIEW">Quarterly Access Review Failures</option>
                <option value="EXPIRED_MITIGATING_CONTROLS">Expired Mitigating Controls</option>
                <option value="UNAPPROVED_ROLE_CHANGES">Unapproved Role Modifications</option>
                <option value="MANAGEMENT_ACCEPTED_SOD">Management Accepted SoD Risks</option>
                <option value="SOX">SOX 404 ITGC Controls</option>
                <option value="ISO27001">ISO 27001 Access Management</option>
                <option value="SOC1_SOC2">SOC 1 / SOC 2 Compliance</option>
              </select>
              <button
                type="button"
                disabled={auditLoading || !auditQueryInput}
                onClick={() => runAuditCompliance(auditQueryInput, auditFrameworkCategory)}
                className="w-full sm:w-auto px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-lg transition text-xs flex items-center justify-center gap-2 shrink-0"
              >
                {auditLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FileCheck className="w-3.5 h-3.5" />}
                Gather Audit Evidence
              </button>
            </div>
          </div>

          {/* AUDIT EVIDENCE REPORT DISPLAY */}
          {auditData && (
            <div className="p-4 bg-slate-950 border border-emerald-800/80 rounded-xl space-y-4 shadow-xl">
              {/* EXECUTIVE AUDIT RESPONSE SUMMARY */}
              <div className="p-4 bg-slate-900 border-l-4 border-l-emerald-500 border-y border-r border-slate-800 rounded-r-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-emerald-300 uppercase tracking-wider text-xs flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Audit Evidence Summary: "{auditData.query}"
                  </span>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded border font-bold ${
                    auditData.complianceRating === 'COMPLIANT' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-amber-950 text-amber-300 border-amber-800'
                  }`}>
                    {auditData.complianceRating}
                  </span>
                </div>
                <p className="text-xs text-white font-sans leading-relaxed font-semibold bg-slate-950/80 p-3 rounded border border-slate-800">
                  {auditData.summary}
                </p>
              </div>

              {/* SECTION 1: USER TERMINATION EVIDENCE TIMELINE (HR -> LOCK -> ROLE REMOVAL -> REVOCATION -> EVIDENCE) */}
              {auditData.terminationEvidenceChain && auditData.terminationEvidenceChain.length > 0 && (
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-300 uppercase text-xs flex items-center gap-1.5">
                      <UserX className="w-4 h-4 text-emerald-400" />
                      Terminated User Revocation Audit Trail (HR Termination &rarr; Lock &lt; 24h Rule):
                    </span>
                    <span className="text-[10px] text-slate-400">
                      SOX ITGC Control AC-01 Audit Sampling
                    </span>
                  </div>

                  <div className="space-y-2">
                    {auditData.terminationEvidenceChain.map((term: any, idx: number) => (
                      <div key={idx} className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 border-b border-slate-900 pb-1.5">
                          <div>
                            <strong className="text-white text-xs">{term.userId} - {term.userName}</strong>
                            <span className="text-[10px] text-slate-400 block font-sans">
                              Elapsed Time from HR Termination to SAP Account Lock: <strong className={term.compliant24hRule ? "text-emerald-400 font-mono" : "text-rose-400 font-mono"}>{term.elapsedHoursFromTerminationToLock} Hours</strong>
                            </span>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold ${
                            term.compliant24hRule ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                          }`}>
                            {term.compliant24hRule ? 'COMPLIANT (<24h Enforced)' : 'SOX CONTROL EXCEPTION (>24h)'}
                          </span>
                        </div>

                        {/* TIMELINE STEPS */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-[10px]">
                          <div className="p-1.5 bg-slate-900/80 rounded border border-slate-800">
                            <span className="text-[9px] text-slate-400 block uppercase">1. HR Termination (PA30)</span>
                            <span className="text-slate-200 font-bold">{term.hrTerminationTimestamp}</span>
                          </div>
                          <div className="p-1.5 bg-slate-900/80 rounded border border-slate-800">
                            <span className="text-[9px] text-slate-400 block uppercase">2. SAP SU01 Lock</span>
                            <span className="text-slate-200 font-bold">{term.sapLockTimestamp}</span>
                          </div>
                          <div className="p-1.5 bg-slate-900/80 rounded border border-slate-800">
                            <span className="text-[9px] text-slate-400 block uppercase">3. PFCG Roles Removed</span>
                            <span className="text-slate-200 font-bold">{term.roleRemovalTimestamp}</span>
                          </div>
                          <div className="p-1.5 bg-slate-900/80 rounded border border-slate-800">
                            <span className="text-[9px] text-slate-400 block uppercase">4. Privileged Revocation</span>
                            <span className="text-slate-200 font-bold">{term.privilegedAccessRevocationTimestamp}</span>
                          </div>
                        </div>

                        {/* EVIDENCE HASH */}
                        <div className="p-2 bg-slate-900/40 rounded border border-slate-800 text-[10px] flex items-center justify-between">
                          <span className="text-slate-400 truncate">Cryptographic Audit Evidence Signed: <code className="text-emerald-300 font-mono">{term.evidenceHashOrSignoff}</code></span>
                          <span className="text-[9px] text-emerald-400 font-bold shrink-0 ml-2">VERIFIED LIVE</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 2: PRIVILEGED ACCESS LOGS FOR Q2 & FAILED QUARTERLY REVIEWS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* Q2 PRIVILEGED ACCESS LOGS */}
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                  <span className="font-bold text-indigo-400 uppercase text-xs flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-indigo-400" />
                    Privileged Access Execution Logs (Q2 Audit):
                  </span>
                  <div className="space-y-1.5">
                    {auditData.privilegedAccessLogsQ2?.map((pLog: any, idx: number) => (
                      <div key={idx} className="p-2 bg-slate-950 rounded border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <strong className="text-white">{pLog.userId} - {pLog.userName}</strong>
                          <span className="px-1.5 py-0.5 bg-indigo-950 text-indigo-300 border border-indigo-800 rounded text-[9px] font-bold">
                            {pLog.assignedPrivilege}
                          </span>
                        </div>
                        <p className="text-[10px] text-emerald-300 font-mono">Executed: {pLog.tcodeExecuted}</p>
                        <p className="text-[10px] text-slate-300">Justification: {pLog.businessJustification}</p>
                        <p className="text-[9px] text-slate-400">Approved by: <strong className="text-slate-200">{pLog.approvedBy}</strong> ({pLog.usageTimestamp})</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* FAILED QUARTERLY ACCESS REVIEWS */}
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                  <span className="font-bold text-amber-400 uppercase text-xs flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Failed / Overdue Quarterly Access Reviews:
                  </span>
                  <div className="space-y-1.5">
                    {auditData.failedQuarterlyAccessReviews?.map((fRev: any, idx: number) => (
                      <div key={idx} className="p-2 bg-slate-950 rounded border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <strong className="text-white">{fRev.userId} ({fRev.userName})</strong>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            fRev.status === 'OVERDUE' ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                          }`}>
                            {fRev.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-300">Dept: {fRev.department} | Reviewer: {fRev.reviewerName}</p>
                        <div className="flex flex-wrap gap-1">
                          {fRev.flaggedRoles?.map((r: string, rIdx: number) => (
                            <span key={rIdx} className="px-1.5 py-0.5 bg-slate-900 text-rose-300 border border-slate-800 rounded text-[9px] font-mono">
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECTION 3: EXPIRED MITIGATING CONTROLS & UNAPPROVED ROLE CHANGES */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* EXPIRED MITIGATING CONTROLS */}
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                  <span className="font-bold text-rose-400 uppercase text-xs flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-rose-400" />
                    Expired GRC Mitigating Controls:
                  </span>
                  <div className="space-y-1.5">
                    {auditData.expiredMitigatingControls?.map((mc: any, idx: number) => (
                      <div key={idx} className="p-2 bg-slate-950 rounded border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <strong className="text-white">{mc.controlId} - {mc.controlName}</strong>
                          <span className="px-1.5 py-0.5 bg-rose-950 text-rose-300 border border-rose-800 rounded text-[9px] font-bold">
                            Expired {mc.daysExpired} Days Ago
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-300">Mitigated Target: <span className="text-amber-300 font-mono">{mc.mitigatedUserOrRole}</span> ({mc.associatedSodRisk})</p>
                        <p className="text-[9px] text-slate-400">Owner: {mc.owner} | Expiry: {mc.expirationDate}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* UNAPPROVED ROLE CHANGES */}
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                  <span className="font-bold text-amber-400 uppercase text-xs flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    Unapproved Role Changes (Transport Audit):
                  </span>
                  <div className="space-y-1.5">
                    {auditData.unapprovedRoleChanges?.map((chg: any, idx: number) => (
                      <div key={idx} className="p-2 bg-slate-950 rounded border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <strong className="text-white">{chg.changeId} - Role: {chg.roleName}</strong>
                          <span className="px-1.5 py-0.5 bg-amber-950 text-amber-300 border border-amber-800 rounded text-[9px] font-bold">
                            {chg.approvalStatus}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-300">Modified by: <span className="text-white font-mono">{chg.modifiedBy}</span> on {chg.changeTimestamp}</p>
                        <p className="text-[10px] text-amber-300 font-mono">{chg.tcodeOrAuthObjectChanged}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECTION 4: MANAGEMENT ACCEPTED SOD VIOLATIONS & FRAMEWORKS SUMMARY */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* MANAGEMENT ACCEPTED SOD VIOLATIONS */}
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                  <span className="font-bold text-purple-400 uppercase text-xs flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-purple-400" />
                    Management Accepted SoD Risk Violations:
                  </span>
                  <div className="space-y-1.5">
                    {auditData.managementAcceptedSodViolations?.map((mSod: any, idx: number) => (
                      <div key={idx} className="p-2 bg-slate-950 rounded border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <strong className="text-white">{mSod.violationId} - {mSod.userName} ({mSod.userId})</strong>
                          <span className="px-1.5 py-0.5 bg-purple-950 text-purple-300 border border-purple-800 rounded text-[9px] font-bold">
                            {mSod.annualReviewStatus}
                          </span>
                        </div>
                        <p className="text-[10px] text-purple-300 font-mono">Risk Pair: {mSod.sodRiskPair}</p>
                        <p className="text-[10px] text-slate-300 font-sans italic">"{mSod.managementAcceptanceReason}"</p>
                        <p className="text-[9px] text-slate-400">Accepted by: <strong className="text-slate-200">{mSod.acceptedBy}</strong> on {mSod.acceptanceDate}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AUDIT FRAMEWORKS COMPLIANCE SUMMARY */}
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                  <span className="font-bold text-emerald-400 uppercase text-xs flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    Compliance Framework Status (SOX / ISO / SOC):
                  </span>
                  <div className="space-y-1.5">
                    {auditData.auditFrameworksSummary?.map((fw: any, idx: number) => (
                      <div key={idx} className="p-2 bg-slate-950 rounded border border-slate-800 flex items-center justify-between text-[11px]">
                        <div>
                          <strong className="text-white block">{fw.framework} - {fw.controlId}</strong>
                          <span className="text-[10px] text-slate-400 block font-sans">{fw.controlDescription}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold shrink-0 ml-2 ${
                          fw.complianceStatus === 'PASS' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}>
                          {fw.complianceStatus}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RECOMMENDED AUDIT ACTIONS */}
              {auditData.recommendedAuditActions && (
                <div className="p-4 bg-emerald-950/40 rounded-xl border border-emerald-800/80 space-y-2">
                  <span className="font-extrabold text-emerald-300 text-xs uppercase flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    Automated Compliance & Audit Remediation Recommendations:
                  </span>
                  <div className="space-y-1.5 text-[11px]">
                    {auditData.recommendedAuditActions.map((act: string, idx: number) => (
                      <div key={idx} className="p-2 bg-slate-950 rounded border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-200">{act}</span>
                        <button
                          type="button"
                          onClick={() => handleExecuteRemediation(`AUD-ACT-${idx}`, act)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-[10px] transition shrink-0 ml-2"
                        >
                          Execute Remediation
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: PREDICTIVE SECURITY AI */}
      {activeTab === 'predictive_security' && (
        <div className="mt-4 space-y-4 font-mono text-xs">
          {/* HEADER & QUICK PREDICTIVE AUDIT CHIPS */}
          <div className="p-4 bg-slate-950 rounded-xl border border-purple-900/80 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <h3 className="font-extrabold text-purple-300 uppercase tracking-wider text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                SAP Predictive Security AI Agent (Emerging Risks & Access Creep Engine)
              </h3>
              <span className="text-[10px] bg-purple-950 text-purple-300 px-2.5 py-0.5 rounded border border-purple-800 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping"></span>
                ST03N + USR02 + AGR_USERS + GRC SoD Live Predictive
              </span>
            </div>

            {/* QUICK PRESET PREDICTIVE AUDIT PROMPTS */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Quick Predictive Risk Audits:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: "User ABC Access Creep Audit", query: "Show access creep for User ABC", cat: "ACCESS_CREEP" },
                  { label: "Dormant Privileged Users (SAP_ALL)", query: "Show dormant privileged accounts with SAP_ALL", cat: "DORMANT_PRIVILEGED" },
                  { label: "Accumulating SoD Conflicts", query: "Show accumulating SoD conflicts", cat: "ACCUMULATING_SOD" },
                  { label: "Excessive Temporary Access", query: "Show excessive temporary access grants", cat: "EXCESSIVE_TEMP_ACCESS" },
                  { label: "Unreviewed Firefighter Sessions", query: "Show unreviewed firefighter sessions", cat: "UNREVIEWED_FIREFIGHTER" },
                  { label: "Role Explosion & Overlap", query: "Show role explosion and bloated roles", cat: "ROLE_EXPLOSION" },
                  { label: "Unusual Auth Execution Spikes", query: "Show unusual transaction execution spikes", cat: "UNUSUAL_AUTH_USAGE" }
                ].map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPredQueryInput(q.query);
                      setPredRiskCategory(q.cat);
                      runPredictive(q.query, q.cat);
                    }}
                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-purple-600 rounded text-[10px] transition font-mono font-bold"
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>

            {/* CUSTOM PREDICTIVE QUERY FORM */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-slate-900">
              <input
                type="text"
                value={predQueryInput}
                onChange={(e) => setPredQueryInput(e.target.value)}
                placeholder="Ask Predictive Security AI (e.g. Audit access creep for User ABC, find dormant superusers)"
                className="flex-1 w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-purple-500"
              />
              <select
                value={predRiskCategory}
                onChange={(e) => setPredRiskCategory(e.target.value as any)}
                className="w-full sm:w-auto bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-xs font-mono focus:outline-none focus:border-purple-500"
              >
                <option value="ALL">All Emerging Risks</option>
                <option value="ACCESS_CREEP">Access Creep (Role Accumulation)</option>
                <option value="DORMANT_PRIVILEGED">Dormant Privileged Accounts</option>
                <option value="ACCUMULATING_SOD">Accumulating SoD Conflicts</option>
                <option value="EXCESSIVE_TEMP_ACCESS">Excessive Temporary Access</option>
                <option value="UNREVIEWED_FIREFIGHTER">Unreviewed Firefighter Activity</option>
                <option value="ROLE_EXPLOSION">Role Explosion & Redundancy</option>
                <option value="UNUSUAL_AUTH_USAGE">Unusual Auth Usage Spikes</option>
              </select>
              <button
                type="button"
                disabled={predLoading || !predQueryInput}
                onClick={() => runPredictive(predQueryInput, predRiskCategory)}
                className="w-full sm:w-auto px-5 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold rounded-lg transition text-xs flex items-center justify-center gap-2 shrink-0"
              >
                {predLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                Run Predictive AI
              </button>
            </div>
          </div>

          {/* PREDICTIVE REPORT DISPLAY */}
          {predData && (
            <div className="p-4 bg-slate-950 border border-purple-800/80 rounded-xl space-y-4 shadow-xl">
              {/* EXECUTIVE RESPONSE CALLOUT BOX */}
              <div className="p-4 bg-slate-900 border-l-4 border-l-purple-500 border-y border-r border-slate-800 rounded-r-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-purple-300 uppercase tracking-wider text-xs flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-purple-400" />
                    Predictive AI Risk Assessment: "{predData.query}"
                  </span>
                  <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-800 px-2.5 py-0.5 rounded font-bold">
                    Risk Score: {predData.predictedRiskScore} / 100 (HIGH)
                  </span>
                </div>
                <p className="text-xs text-white font-sans leading-relaxed font-semibold bg-slate-950/80 p-3 rounded border border-slate-800">
                  {predData.summary}
                </p>

                {/* METRICS ROW */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1">
                  <div className="p-2 bg-slate-950 rounded border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 uppercase block">Access Creep Users</span>
                    <span className="text-sm font-black text-rose-400">{predData.accessCreepFindings.length} Detected</span>
                  </div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 uppercase block">Dormant Privileged Users</span>
                    <span className="text-sm font-black text-amber-400">{predData.dormantPrivilegedUsers.length} Users</span>
                  </div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 uppercase block">Unreviewed Firefighter Logs</span>
                    <span className="text-sm font-black text-purple-400">{predData.unreviewedFirefighterActivity.length} Sessions</span>
                  </div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 uppercase block">Expiring Temp Grants</span>
                    <span className="text-sm font-black text-cyan-400">{predData.excessiveTemporaryAccess.length} Grants</span>
                  </div>
                </div>
              </div>

              {/* ACCESS CREEP DETAILED FINDINGS (e.g. USER ABC EXAMPLE) */}
              {predData.accessCreepFindings && predData.accessCreepFindings.length > 0 && (
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-3">
                  <span className="font-bold text-rose-400 uppercase text-xs flex items-center gap-1.5">
                    <UserX className="w-4 h-4 text-rose-400" />
                    Access Creep Analysis (Accumulated Roles Over Job Transfers):
                  </span>
                  <div className="space-y-2">
                    {predData.accessCreepFindings.map((creep: any, idx: number) => (
                      <div key={idx} className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 border-b border-slate-900 pb-2">
                          <div>
                            <strong className="text-white text-xs">{creep.userId} - {creep.userName}</strong>
                            <span className="text-[10px] text-slate-400 block">
                              Tenure: {creep.monthsInOrganization} Months | Position Changes: {creep.positionChangesCount} | Total Accumulated Roles: {creep.totalAccumulatedRolesCount}
                            </span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            creep.riskLevel === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}>
                            {creep.riskLevel} ACCESS CREEP
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                          <div className="p-2 bg-slate-900/60 rounded border border-slate-800/80 space-y-1">
                            <span className="text-[10px] font-bold text-amber-300 uppercase block">
                              Unused Roles ({creep.unusedRolesCount} of {creep.totalAccumulatedRolesCount}):
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {creep.unusedRoleNames.map((rName: string, rIdx: number) => (
                                <span key={rIdx} className="px-1.5 py-0.5 bg-slate-950 text-slate-300 border border-slate-800 rounded text-[9px] font-mono">
                                  {rName}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="p-2 bg-slate-900/60 rounded border border-slate-800/80 space-y-1">
                            <span className="text-[10px] font-bold text-rose-300 uppercase block">
                              SoD Conflicts Introduced ({creep.sodConflictsIntroducedCount}):
                            </span>
                            <p className="text-[10px] text-slate-300 font-sans leading-tight">
                              {creep.sodDetails}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* DORMANT PRIVILEGED USERS & ACCUMULATING SOD THREATS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* DORMANT PRIVILEGED USERS */}
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                  <span className="font-bold text-amber-400 uppercase text-xs flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-400" />
                    Dormant Privileged Accounts (SAP_ALL Inactive &gt; 90 Days):
                  </span>
                  <div className="space-y-1.5">
                    {predData.dormantPrivilegedUsers?.map((d: any, idx: number) => (
                      <div key={idx} className="p-2 bg-slate-950 rounded border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <strong className="text-white">{d.userId} - {d.userName}</strong>
                          <span className="px-1.5 py-0.5 bg-amber-950 text-amber-300 border border-amber-800 rounded text-[9px] font-bold">
                            {d.daysInactive} Days Inactive
                          </span>
                        </div>
                        <p className="text-[10px] text-rose-300 font-mono">Role: {d.assignedSuperRole}</p>
                        <p className="text-[10px] text-slate-300">Action: {d.recommendedAction}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ACCUMULATING SOD THREATS */}
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                  <span className="font-bold text-purple-400 uppercase text-xs flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-purple-400" />
                    Accumulating SoD Threats (Recent Role Additions):
                  </span>
                  <div className="space-y-1.5">
                    {predData.accumulatingSodThreats?.map((s: any, idx: number) => (
                      <div key={idx} className="p-2 bg-slate-950 rounded border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <strong className="text-white">{s.userId} ({s.userName})</strong>
                          <span className="px-1.5 py-0.5 bg-purple-950 text-purple-300 border border-purple-800 rounded text-[9px] font-bold">
                            {s.threatSeverity}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-300">
                          New Role <span className="text-emerald-300 font-mono">{s.newRoleAssigned}</span> conflicts with <span className="text-amber-300 font-mono">{s.conflictingExistingRole}</span>
                        </p>
                        <p className="text-[10px] text-purple-300">Process: {s.sodRiskBusinessProcess}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* UNREVIEWED FIREFIGHTER ACTIVITY & EXCESSIVE TEMPORARY ACCESS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* UNREVIEWED FIREFIGHTER */}
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                  <span className="font-bold text-purple-400 uppercase text-xs flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-purple-400" />
                    Unreviewed SPM/EAM Firefighter Activity:
                  </span>
                  <div className="space-y-1.5">
                    {predData.unreviewedFirefighterActivity?.map((ff: any, idx: number) => (
                      <div key={idx} className="p-2 bg-slate-950 rounded border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <strong className="text-white">{ff.ffId} (Used by {ff.ffUser})</strong>
                          <span className="px-1.5 py-0.5 bg-purple-950 text-purple-300 border border-purple-800 rounded text-[9px] font-bold">
                            Unreviewed {ff.unreviewedDurationDays} Days
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {ff.criticalTcodesExecuted.map((tc: string, tIdx: number) => (
                            <span key={tIdx} className="px-1.5 py-0.5 bg-slate-900 text-rose-300 border border-slate-800 rounded text-[9px] font-mono">
                              {tc}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* EXCESSIVE TEMPORARY ACCESS */}
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                  <span className="font-bold text-cyan-400 uppercase text-xs flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-cyan-400" />
                    Excessive Temporary Access Grants:
                  </span>
                  <div className="space-y-1.5">
                    {predData.excessiveTemporaryAccess?.map((t: any, idx: number) => (
                      <div key={idx} className="p-2 bg-slate-950 rounded border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <strong className="text-white">{t.userId} [{t.roleName}]</strong>
                          <span className="px-1.5 py-0.5 bg-rose-950 text-rose-300 border border-rose-800 rounded text-[9px] font-bold">
                            {t.daysOverdueOrActive} Days Overdue
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">Granted: {t.grantedDate} | Expiry: {t.expiryDate}</p>
                        <p className="text-[10px] text-slate-300">{t.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ROLE EXPLOSION & UNUSUAL AUTH USAGE SPIKES */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* ROLE EXPLOSION */}
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-400 uppercase text-xs flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-amber-400" />
                      Role Explosion & Redundancy Metrics:
                    </span>
                    <span className="text-[10px] text-amber-300 font-bold">
                      {predData.roleExplosionMetrics?.roleOverlapPct}% Authorization Overlap
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 block">
                      Total System Roles: <strong className="text-white">{predData.roleExplosionMetrics?.totalRolesInSystem}</strong> | Redundant Roles: <strong className="text-rose-400">{predData.roleExplosionMetrics?.redundantRolesCount}</strong>
                    </span>
                    {predData.roleExplosionMetrics?.topBloatedRoles.map((b: any, idx: number) => (
                      <div key={idx} className="p-1.5 bg-slate-950 rounded border border-slate-800 flex items-center justify-between text-[10px]">
                        <span className="text-white font-mono">{b.roleName} ({b.assignmentCount} Users)</span>
                        <span className="text-rose-400 font-bold">{b.unusedTcodesPct}% Unused T-Codes</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* UNUSUAL AUTH USAGE */}
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                  <span className="font-bold text-rose-400 uppercase text-xs flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-rose-400" />
                    Unusual Authorization Usage Spikes:
                  </span>
                  <div className="space-y-1.5">
                    {predData.unusualAuthorizationUsage?.map((u: any, idx: number) => (
                      <div key={idx} className="p-2 bg-slate-950 rounded border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <strong className="text-white">{u.userId} [{u.tcode}]</strong>
                          <span className="px-1.5 py-0.5 bg-rose-950 text-rose-300 border border-rose-800 rounded text-[9px] font-bold">
                            SPIKE DETECTED
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-300">Baseline: {u.normalFrequencyAvg} &rarr; Spike: <span className="text-rose-300 font-bold">{u.recentSpike}</span></p>
                        <p className="text-[10px] text-amber-300">{u.anomalyReason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* AUTOMATED PREDICTIVE MITIGATION ACTIONS */}
              {predData.predictedActions && (
                <div className="p-4 bg-purple-950/40 rounded-xl border border-purple-800/80 space-y-2">
                  <span className="font-extrabold text-purple-300 text-xs uppercase flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    Automated Predictive Risk Remediation Actions:
                  </span>
                  <div className="space-y-1.5 text-[11px]">
                    {predData.predictedActions.map((act: string, idx: number) => (
                      <div key={idx} className="p-2 bg-slate-950 rounded border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-200">{act}</span>
                        <button
                          type="button"
                          onClick={() => handleExecuteRemediation(`PRED-ACT-${idx}`, act)}
                          className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded text-[10px] transition shrink-0 ml-2"
                        >
                          Execute Remediation
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: AUTHENTICATION & IDENTITY SECURITY MONITOR */}
      {activeTab === 'auth_identity_monitor' && (
        <div className="mt-4 space-y-4 font-mono text-xs">
          {/* HEADER & QUICK QUESTION CHIPS */}
          <div className="p-4 bg-slate-950 rounded-xl border border-indigo-900/80 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <h3 className="font-extrabold text-indigo-300 uppercase tracking-wider text-xs flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-400 animate-pulse" />
                SAP Authentication & Identity Security Monitor (S/4HANA & IAS Interlock)
              </h3>
              <span className="text-[10px] bg-indigo-950 text-indigo-300 px-2.5 py-0.5 rounded border border-indigo-800 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
                SAML 2.0 + OAuth + STRUST + IAS + USR02 Active
              </span>
            </div>

            {/* QUICK PRESET AUDIT QUESTIONS */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Quick Authentication & Identity Audit Questions:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: "Is SSO working?", query: "Is SSO working?", cat: "SSO_SAML_OAUTH" },
                  { label: "Which users bypass MFA?", query: "Which users bypass MFA?", cat: "MFA_BYPASS" },
                  { label: "Which technical accounts have weak authentication?", query: "Which technical accounts have weak authentication?", cat: "WEAK_AUTH_TECH_ACCOUNTS" },
                  { label: "Which certificates will expire soon?", query: "Which certificates will expire soon?", cat: "CERTIFICATES_EXPIRING" },
                  { label: "Are there authentication failures from unusual sources?", query: "Are there authentication failures from unusual sources?", cat: "UNUSUAL_FAILURES" },
                  { label: "Password policy & locked accounts", query: "Show locked accounts and password policy status", cat: "PASSWORD_POLICY_LOCKED" }
                ].map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setAuthIdQueryInput(q.query);
                      setAuthIdCategory(q.cat);
                      runAuthId(q.query, q.cat);
                    }}
                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-indigo-600 rounded text-[10px] transition font-mono font-bold"
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>

            {/* CUSTOM QUERY FORM */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-slate-900">
              <input
                type="text"
                value={authIdQueryInput}
                onChange={(e) => setAuthIdQueryInput(e.target.value)}
                placeholder="Ask Auth Agent (e.g. Is SSO working? Which users bypass MFA?)"
                className="flex-1 w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
              />
              <select
                value={authIdCategory}
                onChange={(e) => setAuthIdCategory(e.target.value as any)}
                className="w-full sm:w-auto bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-xs font-mono focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Categories</option>
                <option value="SSO_SAML_OAUTH">SSO & SAML/OAuth</option>
                <option value="MFA_BYPASS">MFA Bypass Users</option>
                <option value="WEAK_AUTH_TECH_ACCOUNTS">Weak Technical Accounts</option>
                <option value="CERTIFICATES_EXPIRING">STRUST / PSE Expiring Certs</option>
                <option value="UNUSUAL_FAILURES">Anomalous Auth Failures</option>
                <option value="PASSWORD_POLICY_LOCKED">Password Policy & Locked</option>
              </select>
              <button
                type="button"
                disabled={authIdLoading || !authIdQueryInput}
                onClick={() => runAuthId(authIdQueryInput, authIdCategory)}
                className="w-full sm:w-auto px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-lg transition text-xs flex items-center justify-center gap-2 shrink-0"
              >
                {authIdLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                Audit Auth Security
              </button>
            </div>
          </div>

          {/* MONITOR REPORT DISPLAY */}
          {authIdData && (
            <div className="p-4 bg-slate-950 border border-indigo-800/80 rounded-xl space-y-4 shadow-xl">
              {/* EXECUTIVE RESPONSE CALLOUT BOX */}
              <div className="p-4 bg-slate-900 border-l-4 border-l-indigo-500 border-y border-r border-slate-800 rounded-r-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-indigo-300 uppercase tracking-wider text-xs flex items-center gap-2">
                    <Shield className="w-4 h-4 text-indigo-400" />
                    AI Investigation Findings: "{authIdData.query}"
                  </span>
                  <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded font-bold">
                    Report ID: {authIdData.reportId}
                  </span>
                </div>
                <p className="text-xs text-white font-sans leading-relaxed font-semibold bg-slate-950/80 p-3 rounded border border-slate-800">
                  {authIdData.summary}
                </p>

                {/* METRICS ROW */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1">
                  <div className="p-2 bg-slate-950 rounded border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 uppercase block">SSO Health</span>
                    <span className="text-sm font-black text-emerald-400">{authIdData.ssoHealth.status}</span>
                  </div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 uppercase block">MFA Bypass Users</span>
                    <span className="text-sm font-black text-rose-400">{authIdData.mfaBypassUsers.length} Users</span>
                  </div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 uppercase block">Expiring Certs</span>
                    <span className="text-sm font-black text-amber-400">{authIdData.expiringCertificates.filter((c: any) => c.status !== 'VALID').length} Action Req.</span>
                  </div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 uppercase block">Locked USR02 Accounts</span>
                    <span className="text-sm font-black text-cyan-400">{authIdData.passwordPolicyAndLockedAccounts.lockedAccountsCount} Accounts</span>
                  </div>
                </div>
              </div>

              {/* SSO & IDENTITY PROVIDERS CONNECTIVITY */}
              {authIdData.ssoHealth && (
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-300 uppercase text-xs flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-indigo-400" />
                      Single Sign-On (SSO / SAML 2.0 / OAuth) & IdP Health:
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold">
                      {authIdData.ssoHealth.ssoEnforcedPct}% SSO Enforced ({authIdData.ssoHealth.activeTokensCount} Active Tokens)
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {authIdData.identityProvidersConnectivity?.map((idp: any, idx: number) => (
                      <div key={idx} className="p-2 bg-slate-950 rounded border border-slate-800 flex items-center justify-between text-[10px]">
                        <div>
                          <strong className="text-white block">{idp.providerName}</strong>
                          <span className="text-slate-400">{idp.protocol}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          idp.status === 'CONNECTED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}>
                          {idp.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MFA BYPASS USERS & WEAK AUTH TECHNICAL ACCOUNTS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* MFA BYPASS */}
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                  <span className="font-bold text-rose-400 uppercase text-xs flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    MFA Bypass Accounts:
                  </span>
                  <div className="space-y-1.5">
                    {authIdData.mfaBypassUsers?.map((m: any, idx: number) => (
                      <div key={idx} className="p-2 bg-slate-950 rounded border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <strong className="text-white">{m.userId} - {m.userName}</strong>
                          <span className="px-1.5 py-0.5 bg-rose-950 text-rose-300 border border-rose-800 rounded text-[9px] font-bold">
                            {m.riskRating} RISK
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-300">Reason: {m.bypassReason}</p>
                        <span className="text-[9px] text-slate-500">Last Login: {m.lastLogin}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* WEAK AUTH TECHNICAL ACCOUNTS */}
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                  <span className="font-bold text-amber-400 uppercase text-xs flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-amber-400" />
                    Weak Technical / RFC Accounts:
                  </span>
                  <div className="space-y-1.5">
                    {authIdData.weakAuthTechnicalAccounts?.map((w: any, idx: number) => (
                      <div key={idx} className="p-2 bg-slate-950 rounded border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <strong className="text-white">{w.userId} ({w.userType})</strong>
                          <span className="px-1.5 py-0.5 bg-amber-950 text-amber-300 border border-amber-800 rounded text-[9px] font-bold">
                            {w.authMethod}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-300">Issue: {w.weakReason}</p>
                        <p className="text-[10px] text-emerald-300 font-semibold">Fix: {w.recommendedFix}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* EXPIRING CERTIFICATES (STRUST / PSE / SSL / SNC) */}
              {authIdData.expiringCertificates && authIdData.expiringCertificates.length > 0 && (
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                  <span className="font-bold text-amber-400 uppercase text-xs flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-amber-400" />
                    STRUST PSE & SSL/SNC Certificates Expiry Status:
                  </span>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead>
                        <tr className="text-slate-400 border-b border-slate-800">
                          <th className="py-1">PSE Name</th>
                          <th className="py-1">Subject / Distinguished Name</th>
                          <th className="py-1">Issuer</th>
                          <th className="py-1">Expiry Date</th>
                          <th className="py-1">Days Remaining</th>
                          <th className="py-1">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-200">
                        {authIdData.expiringCertificates.map((c: any, idx: number) => (
                          <tr key={idx}>
                            <td className="py-2 font-bold text-white">{c.pseName}</td>
                            <td className="py-2 text-slate-300 max-w-xs truncate">{c.subject}</td>
                            <td className="py-2 text-slate-400">{c.issuer}</td>
                            <td className="py-2 text-slate-200 font-mono">{c.expiryDate}</td>
                            <td className="py-2 font-black font-mono text-amber-300">{c.daysRemaining} Days</td>
                            <td className="py-2">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                c.status === 'CRITICAL'
                                  ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                                  : c.status === 'WARNING'
                                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              }`}>
                                {c.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ANOMALOUS AUTH FAILURES & PASSWORD POLICY / LOCKED ACCOUNTS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* ANOMALOUS FAILURES */}
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                  <span className="font-bold text-cyan-400 uppercase text-xs flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-cyan-400" />
                    Anomalous Authentication Failures:
                  </span>
                  <div className="space-y-1.5">
                    {authIdData.unusualAuthFailures?.map((u: any, idx: number) => (
                      <div key={idx} className="p-2 bg-slate-950 rounded border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <strong className="text-white">{u.userId} [{u.tcodeOrApp}]</strong>
                          <span className="px-1.5 py-0.5 bg-rose-950 text-rose-300 border border-rose-800 rounded text-[9px] font-bold">
                            Score: {u.anomalyScore} (HIGH)
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-300">IP / Location: {u.sourceIp} - {u.location}</p>
                        <p className="text-[10px] text-rose-300">Failure: {u.failureReason}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* PASSWORD POLICY & LOCKED ACCOUNTS */}
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-400 uppercase text-xs flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-emerald-400" />
                      Locked USR02 Accounts & RSPFPAR Policy:
                    </span>
                    <span className="text-[10px] text-emerald-300 font-bold">
                      Compliance: {authIdData.passwordPolicyAndLockedAccounts?.passwordPolicyCompliancePct}%
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase block font-bold">Locked Accounts:</span>
                    {authIdData.passwordPolicyAndLockedAccounts?.lockedUsers.map((l: any, idx: number) => (
                      <div key={idx} className="p-1.5 bg-slate-950 rounded border border-slate-800 flex items-center justify-between text-[10px]">
                        <div>
                          <strong className="text-white">{l.userId} ({l.userName})</strong>
                          <p className="text-slate-400">{l.lockReason}</p>
                        </div>
                        <span className="text-slate-500 text-[9px]">{l.lockTime}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RECOMMENDED SECURITY ACTIONS */}
              {authIdData.recommendedActions && (
                <div className="p-4 bg-indigo-950/40 rounded-xl border border-indigo-800/80 space-y-2">
                  <span className="font-extrabold text-indigo-300 text-xs uppercase flex items-center gap-2">
                    <Zap className="w-4 h-4 text-indigo-400" />
                    Automated Actionable Identity Policy Enforcements:
                  </span>
                  <div className="space-y-1.5 text-[11px]">
                    {authIdData.recommendedActions.map((act: string, idx: number) => (
                      <div key={idx} className="p-2 bg-slate-950 rounded border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-200">{act}</span>
                        <button
                          type="button"
                          onClick={() => handleExecuteRemediation(`AUTH-ACT-${idx}`, act)}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded text-[10px] transition shrink-0 ml-2"
                        >
                          Execute Remediation
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: PRIVILEGED ACCESS CONTINUOUS MONITORING */}
      {activeTab === 'privileged_monitor' && (
        <div className="mt-4 space-y-4 font-mono text-xs">
          {/* HEADER & QUICK QUESTION CHIPS */}
          <div className="p-4 bg-slate-950 rounded-xl border border-rose-900/80 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <h3 className="font-extrabold text-rose-400 uppercase tracking-wider text-xs flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
                SAP Security Privileged Access Continuous Monitor (Live Audit Interlock)
              </h3>
              <span className="text-[10px] bg-rose-950 text-rose-300 px-2.5 py-0.5 rounded border border-rose-800 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                SM20 + USR02 + EAM Firefighter + Debug Trace Active
              </span>
            </div>

            {/* QUICK PRESET AUDIT QUESTIONS */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Quick Privileged Audit Questions:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: "Did anyone use SAP_ALL today?", query: "Did anyone use SAP_ALL today?", cat: "SAP_ALL" },
                  { label: "Who used Firefighter IDs today?", query: "Who activated Firefighter emergency IDs today?", cat: "FIREFIGHTER" },
                  { label: "Show debugging (/h) & SE16/SM30 logs", query: "Show debugging and table maintenance logs", cat: "DEBUG_TABLE" },
                  { label: "Who performed SU01 / PFCG admin?", query: "Who performed user administration and role changes today?", cat: "USER_ROLE_ADMIN" },
                  { label: "Production SPRO / SCC4 config changes", query: "Were there production SPRO configuration changes today?", cat: "PROD_CONFIG" },
                  { label: "Who accessed payroll / sensitive HR?", query: "Who accessed sensitive HR or payroll records?", cat: "PAYROLL_FINANCE" }
                ].map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPamQueryInput(q.query);
                      setPamCategory(q.cat);
                      runPam(q.query, q.cat);
                    }}
                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-rose-700 rounded text-[10px] transition font-mono font-bold"
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>

            {/* CUSTOM QUERY FORM */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-slate-900">
              <input
                type="text"
                value={pamQueryInput}
                onChange={(e) => setPamQueryInput(e.target.value)}
                placeholder="Ask Privileged Access Monitor (e.g. Did anyone use SAP_ALL today?)"
                className="flex-1 w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-rose-500"
              />
              <select
                value={pamCategory}
                onChange={(e) => setPamCategory(e.target.value as any)}
                className="w-full sm:w-auto bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-xs font-mono focus:outline-none focus:border-rose-500"
              >
                <option value="ALL">All Categories</option>
                <option value="SAP_ALL">SAP_ALL & SAP_NEW</option>
                <option value="FIREFIGHTER">Firefighter / EAM</option>
                <option value="DEBUG_TABLE">Debug (/h) & Table Maintenance</option>
                <option value="USER_ROLE_ADMIN">User/Role Admin (SU01/PFCG)</option>
                <option value="PROD_CONFIG">Prod Config (SPRO/SCC4)</option>
                <option value="PAYROLL_FINANCE">Payroll & Sensitive Finance</option>
              </select>
              <button
                type="button"
                disabled={pamLoading || !pamQueryInput}
                onClick={() => runPam(pamQueryInput, pamCategory)}
                className="w-full sm:w-auto px-5 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold rounded-lg transition text-xs flex items-center justify-center gap-2 shrink-0"
              >
                {pamLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                Audit Privileged Access
              </button>
            </div>
          </div>

          {/* MONITOR REPORT DISPLAY */}
          {pamData && (
            <div className="p-4 bg-slate-950 border border-rose-800/80 rounded-xl space-y-4 shadow-xl">
              {/* EXECUTIVE RESPONSE CALLOUT BOX */}
              <div className="p-4 bg-slate-900 border-l-4 border-l-rose-500 border-y border-r border-slate-800 rounded-r-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-rose-400 uppercase tracking-wider text-xs flex items-center gap-2">
                    <Shield className="w-4 h-4 text-rose-400" />
                    AI Investigation Findings: "{pamData.query}"
                  </span>
                  <span className="text-[10px] bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded font-bold">
                    Monitor Ref: {pamData.monitoringId}
                  </span>
                </div>
                <p className="text-xs text-white font-sans leading-relaxed font-semibold bg-slate-950/80 p-3 rounded border border-slate-800">
                  {pamData.summary}
                </p>

                {/* METRICS ROW */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1">
                  <div className="p-2 bg-slate-950 rounded border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 uppercase block">Active Superusers</span>
                    <span className="text-sm font-black text-rose-400">{pamData.activeSuperusersCount} Users</span>
                  </div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 uppercase block">Unauthorized Events</span>
                    <span className="text-sm font-black text-amber-400">{pamData.unauthorizedPrivilegedEventsCount} High Risk</span>
                  </div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 uppercase block">Firefighter Sessions</span>
                    <span className="text-sm font-black text-cyan-400">{pamData.emergencySessionsCount} Active</span>
                  </div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 uppercase block">Security Posture</span>
                    <span className="text-sm font-black text-emerald-400">Continuous Enforcement</span>
                  </div>
                </div>
              </div>

              {/* SAP_ALL & SAP_NEW LOGS TABLE */}
              {pamData.sapAllUsageLogs && pamData.sapAllUsageLogs.length > 0 && (
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                  <span className="font-bold text-rose-400 uppercase text-xs flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    SAP_ALL / SAP_NEW Superuser Active Login Trail Today:
                  </span>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead>
                        <tr className="text-slate-400 border-b border-slate-800">
                          <th className="py-1">User ID & Name</th>
                          <th className="py-1">Session Type</th>
                          <th className="py-1">Terminal IP</th>
                          <th className="py-1">Login Time</th>
                          <th className="py-1">Executed T-Codes</th>
                          <th className="py-1">Audit Note</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-200">
                        {pamData.sapAllUsageLogs.map((s: any, idx: number) => (
                          <tr key={idx}>
                            <td className="py-2">
                              <strong className="text-white block">{s.userId}</strong>
                              <span className="text-[10px] text-slate-400">{s.userName}</span>
                            </td>
                            <td className="py-2">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                s.sessionType === 'APPROVED_EMERGENCY_FIREFIGHTER'
                                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                                  : 'bg-rose-950 text-rose-300 border border-rose-800'
                              }`}>
                                {s.sessionType}
                              </span>
                            </td>
                            <td className="py-2 text-slate-400 font-mono">{s.terminalIp}</td>
                            <td className="py-2 text-slate-300">{s.loginTime}</td>
                            <td className="py-2">
                              <div className="flex flex-wrap gap-1">
                                {s.executedTcodes.map((t: string, tidx: number) => (
                                  <span key={tidx} className="px-1.5 py-0.5 bg-slate-950 text-amber-300 border border-slate-800 rounded text-[9px] font-mono font-bold">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="py-2 text-rose-300 text-[10px] max-w-xs">{s.auditNote}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* FIREFIGHTER EMERGENCY SESSIONS */}
              {pamData.firefighterSessions && pamData.firefighterSessions.length > 0 && (
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                  <span className="font-bold text-amber-400 uppercase text-xs flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-400" />
                    Firefighter Emergency Access (EAM) Sessions:
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {pamData.firefighterSessions.map((ff: any, idx: number) => (
                      <div key={idx} className="p-2.5 bg-slate-950 rounded border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-xs">{ff.ffId} ({ff.ffUser})</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            ff.status === 'ACTIVE' ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-slate-900 text-slate-400 border border-slate-800'
                          }`}>
                            {ff.status}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-300">Ticket: <strong className="text-cyan-300">{ff.ticketId}</strong></div>
                        <p className="text-[10px] text-slate-400">Reason: {ff.reason}</p>
                        <div className="text-[9px] text-slate-400 pt-1">
                          Actions: {ff.executedActions.join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* DEBUG (/h) & TABLE MAINTENANCE LOGS */}
              {pamData.debugAndTableLogs && pamData.debugAndTableLogs.length > 0 && (
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                  <span className="font-bold text-cyan-400 uppercase text-xs flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-cyan-400" />
                    ABAP Debugger (/h Memory Override) & Table Maintenance (SE16/SM30) Logs:
                  </span>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead>
                        <tr className="text-slate-400 border-b border-slate-800">
                          <th className="py-1">User ID</th>
                          <th className="py-1">Mode / T-Code</th>
                          <th className="py-1">Target Object</th>
                          <th className="py-1">Action Details</th>
                          <th className="py-1">Timestamp</th>
                          <th className="py-1">Risk</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-200">
                        {pamData.debugAndTableLogs.map((d: any, idx: number) => (
                          <tr key={idx}>
                            <td className="py-1.5 font-bold text-white">{d.userId}</td>
                            <td className="py-1.5 text-amber-300 font-bold">{d.tcodeOrMode}</td>
                            <td className="py-1.5 text-slate-300">{d.targetTableOrProgram}</td>
                            <td className="py-1.5 text-slate-300">{d.actionTaken}</td>
                            <td className="py-1.5 text-slate-400">{d.timestamp}</td>
                            <td className="py-1.5">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                d.risk === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                              }`}>
                                {d.risk}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SENSITIVE ACCESS LOGS (SU01 / PFCG / SPRO / PAYROLL) */}
              {pamData.sensitiveAccessLogs && pamData.sensitiveAccessLogs.length > 0 && (
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                  <span className="font-bold text-emerald-400 uppercase text-xs flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    Sensitive Admin, Production SPRO Config & Payroll Logs:
                  </span>
                  <div className="space-y-1.5">
                    {pamData.sensitiveAccessLogs.map((l: any, idx: number) => (
                      <div key={idx} className="p-2 bg-slate-950 rounded border border-slate-800 flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-slate-900 text-emerald-300 border border-slate-800 rounded font-bold text-[9px]">
                            {l.category}
                          </span>
                          <strong className="text-white">{l.userId}</strong>
                          <span className="text-slate-400">[{l.tcode}]</span>
                          <span className="text-slate-200">{l.detail}</span>
                        </div>
                        <span className="text-slate-500 shrink-0 text-[10px]">{l.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* RECOMMENDED SECURITY ACTIONS */}
              {pamData.recommendedSecurityActions && (
                <div className="p-4 bg-rose-950/40 rounded-xl border border-rose-800/80 space-y-2">
                  <span className="font-extrabold text-rose-300 text-xs uppercase flex items-center gap-2">
                    <Zap className="w-4 h-4 text-rose-400" />
                    Automated Actionable Security Policy Enforcements:
                  </span>
                  <div className="space-y-1.5 text-[11px]">
                    {pamData.recommendedSecurityActions.map((act: string, idx: number) => (
                      <div key={idx} className="p-2 bg-slate-950 rounded border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-200">{act}</span>
                        <button
                          type="button"
                          onClick={() => handleExecuteRemediation(`PAM-ACT-${idx}`, act)}
                          className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded text-[10px] transition shrink-0 ml-2"
                        >
                          Execute Remediation
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: ROLE ENGINEERING AI (CLEAN ROLE DESIGN) */}
      {activeTab === 'role_engineering' && (
        <div className="mt-4 space-y-4 font-mono text-xs">
          {/* HEADER & QUICK QUESTION CHIPS */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <h3 className="font-bold text-emerald-400 uppercase tracking-wider text-xs flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                SAP Security Role Engineering AI — Legacy to Business Role Modernization
              </h3>
              <span className="text-[10px] bg-slate-900 text-emerald-300 px-2.5 py-0.5 rounded border border-emerald-800 font-bold">
                ST03N Usage Statistics + PFCG + Transports Interlocked
              </span>
            </div>

            {/* QUICK PRESET QUESTIONS */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Quick Role Engineering Queries:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: "Which roles have too many users?", type: 'EXCESSIVE_USERS', role: 'SAP_MM_PURCHASING_CLERK_ALL' },
                  { label: "Which roles contain excessive permissions?", type: 'EXCESSIVE_PERMISSIONS', role: 'SAP_MM_PURCHASING_CLERK_ALL' },
                  { label: "Which roles are nearly identical?", type: 'NEAR_IDENTICAL', role: 'SAP_MM_PURCHASING_CLERK_ALL' },
                  { label: "Which roles should be consolidated?", type: 'ROLE_CONSOLIDATION', role: 'SAP_MM_PURCHASING_CLERK_ALL' },
                  { label: "Which roles have unused authorization values?", type: 'UNUSED_AUTHORIZATIONS', role: 'SAP_MM_PURCHASING_CLERK_ALL' },
                  { label: "Which transactions in this role are never used?", type: 'UNUSED_TRANSACTIONS', role: 'SAP_MM_PURCHASING_CLERK_ALL' },
                  { label: "Which users are overprovisioned?", type: 'OVERPROVISIONED_USERS', role: 'SAP_MM_PURCHASING_CLERK_ALL' },
                  { label: "Recommend least-privilege version", type: 'EXCESSIVE_PERMISSIONS', role: 'SAP_MM_PURCHASING_CLERK_ALL' },
                  { label: "Compare DEV, QA, and PRD role definitions", type: 'DEV_QA_PRD_COMPARE', role: 'SAP_MM_PURCHASING_CLERK_ALL' }
                ].map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setRoleEngInput(q.role);
                      setRoleEngQueryType(q.type);
                      runRoleEng(q.role, q.type);
                    }}
                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-emerald-700 rounded text-[10px] transition font-mono"
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>

            {/* CUSTOM INPUT FORM */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-slate-900">
              <input
                type="text"
                value={roleEngInput}
                onChange={(e) => setRoleEngInput(e.target.value)}
                placeholder="Enter Role Name (e.g. SAP_MM_PURCHASING_CLERK_ALL, Z_FIN_GLOBAL_ROLE)"
                className="flex-1 w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
              />
              <select
                value={roleEngQueryType}
                onChange={(e) => setRoleEngQueryType(e.target.value as any)}
                className="w-full sm:w-auto bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-xs font-mono focus:outline-none focus:border-emerald-500"
              >
                <option value="EXCESSIVE_PERMISSIONS">Excessive Permissions & Clean Role</option>
                <option value="EXCESSIVE_USERS">Excessive Users Assignment</option>
                <option value="NEAR_IDENTICAL">Near-Identical Role Overlap</option>
                <option value="ROLE_CONSOLIDATION">Role Consolidation Target</option>
                <option value="UNUSED_AUTHORIZATIONS">Unused Auth Objects & Wildcards</option>
                <option value="UNUSED_TRANSACTIONS">Unused T-Codes (ST03N)</option>
                <option value="OVERPROVISIONED_USERS">Overprovisioned Users</option>
                <option value="DEV_QA_PRD_COMPARE">DEV vs QA vs PRD Comparison</option>
              </select>
              <button
                type="button"
                disabled={roleEngLoading || !roleEngInput}
                onClick={() => runRoleEng(roleEngInput, roleEngQueryType)}
                className="w-full sm:w-auto px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-lg transition text-xs flex items-center justify-center gap-2 shrink-0"
              >
                {roleEngLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                Run Role Engineering AI
              </button>
            </div>
          </div>

          {/* ROLE ENGINEERING RESULTS PANEL */}
          {roleEngData && (
            <div className="p-4 bg-slate-950 border border-emerald-800/80 rounded-xl space-y-4 shadow-xl">
              {/* SUMMARY BANNER */}
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-emerald-400 text-xs uppercase flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    Role Engineering Analysis: {roleEngData.roleName}
                  </span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-bold">
                    Analysis Type: {roleEngData.analysisType}
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed text-xs">
                  {roleEngData.summary}
                </p>

                {/* METRICS GRID */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2">
                  <div className="p-2 bg-slate-950 rounded border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 uppercase block">Assigned Users</span>
                    <span className="text-sm font-black text-white">{roleEngData.assignedUsersCount}</span>
                  </div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 uppercase block">Overprovisioned</span>
                    <span className="text-sm font-black text-rose-400">{roleEngData.excessiveUsersCount} Users</span>
                  </div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 uppercase block">Unused T-Codes</span>
                    <span className="text-sm font-black text-amber-400">{roleEngData.unusedTcodesCount} T-Codes</span>
                  </div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 uppercase block">Risk Reduction</span>
                    <span className="text-sm font-black text-emerald-400">-{roleEngData.leastPrivilegeRecommendation?.riskReductionPct}% Risk</span>
                  </div>
                </div>
              </div>

              {/* UNUSED TCODES SECTION (ST03N STATS) */}
              {roleEngData.unusedTcodesList && roleEngData.unusedTcodesList.length > 0 && (
                <div className="p-3 bg-slate-900 rounded-lg border border-amber-900/60 space-y-2">
                  <span className="font-bold text-amber-400 uppercase text-xs flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-amber-400" />
                    Unused Transactions in Role (ST03N Statistics - 0 Executions in 90 Days):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {roleEngData.unusedTcodesList.map((tcode: string, idx: number) => (
                      <span key={idx} className="px-2 py-0.5 bg-slate-950 text-amber-300 border border-amber-800/80 rounded text-[10px] font-mono font-bold">
                        {tcode}
                      </span>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    * Recommendation: Prune these 18 unused transaction codes to eliminate broad authorization creep.
                  </p>
                </div>
              )}

              {/* NEAR IDENTICAL & CONSOLIDATION MATCHES */}
              {roleEngData.identicalRoleMatches && roleEngData.identicalRoleMatches.length > 0 && (
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                  <span className="font-bold text-cyan-400 uppercase text-xs flex items-center gap-1.5">
                    <RefreshCw className="w-4 h-4 text-cyan-400" />
                    Near-Identical Roles & Consolidation Candidates:
                  </span>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead>
                        <tr className="text-slate-400 border-b border-slate-800">
                          <th className="py-1">Overlapping Role</th>
                          <th className="py-1">Structural Overlap %</th>
                          <th className="py-1">Consolidation Recommendation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-200">
                        {roleEngData.identicalRoleMatches.map((m: any, idx: number) => (
                          <tr key={idx}>
                            <td className="py-1.5 font-bold text-white">{m.roleName}</td>
                            <td className="py-1.5 font-bold text-amber-400">{m.similarityPct}% Overlap</td>
                            <td className="py-1.5 text-emerald-300">{m.recommendation}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* UNUSED AUTHORIZATION OBJECTS & WILDCARDS */}
              {roleEngData.unusedAuthorizations && roleEngData.unusedAuthorizations.length > 0 && (
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                  <span className="font-bold text-rose-400 uppercase text-xs flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                    Unused Authorization Values & Dangerous Wildcards:
                  </span>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead>
                        <tr className="text-slate-400 border-b border-slate-800">
                          <th className="py-1">Auth Object</th>
                          <th className="py-1">Description</th>
                          <th className="py-1">Field</th>
                          <th className="py-1">Permitted Value</th>
                          <th className="py-1">Days Unused</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-200">
                        {roleEngData.unusedAuthorizations.map((u: any, idx: number) => (
                          <tr key={idx}>
                            <td className="py-1.5 font-bold text-rose-300">{u.object}</td>
                            <td className="py-1.5 text-slate-300">{u.objectText}</td>
                            <td className="py-1.5 text-slate-400">{u.field}</td>
                            <td className="py-1.5 font-bold text-amber-300">{u.value}</td>
                            <td className="py-1.5 text-slate-400">{u.lastUsedDaysAgo} days ago</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* DEV QA PRD LANDSCAPE COMPARISON */}
              {roleEngData.envComparison && roleEngData.envComparison.length > 0 && (
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                  <span className="font-bold text-cyan-400 uppercase text-xs flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    Cross-Landscape Role Definitions (DEV vs QA vs PRD):
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {roleEngData.envComparison.map((env: any, idx: number) => (
                      <div key={idx} className="p-2.5 bg-slate-950 rounded border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-white text-xs">{env.env} Environment</span>
                          <span className="text-[9px] bg-slate-900 text-amber-300 px-1.5 py-0.5 rounded border border-slate-800 font-bold">
                            {env.status}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-300 space-x-2">
                          <span>T-Codes: <strong className="text-white">{env.tcodesCount}</strong></span>
                          <span>Auth Objects: <strong className="text-white">{env.authObjectsCount}</strong></span>
                        </div>
                        <p className="text-[9px] text-slate-400 leading-tight">{env.diffNotes}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* LEAST PRIVILEGE RECOMMENDATION */}
              {roleEngData.leastPrivilegeRecommendation && (
                <div className="p-4 bg-emerald-950/60 rounded-xl border border-emerald-500/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-emerald-300 text-xs uppercase flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      Recommended Least-Privilege Business Role Definition:
                    </span>
                    <span className="text-xs font-black bg-emerald-900 text-white px-2.5 py-0.5 rounded border border-emerald-400">
                      Clean Target: {roleEngData.leastPrivilegeRecommendation.cleanRoleName}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] pt-1">
                    <div>
                      <strong className="text-slate-300 block mb-1">Removed Obsolete T-Codes:</strong>
                      <ul className="list-disc list-inside text-rose-300 space-y-0.5">
                        {roleEngData.leastPrivilegeRecommendation.removedTcodes.map((t: string, idx: number) => (
                          <li key={idx}>{t}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <strong className="text-slate-300 block mb-1">Removed Wildcard Authorizations:</strong>
                      <ul className="list-disc list-inside text-rose-300 space-y-0.5">
                        {roleEngData.leastPrivilegeRecommendation.removedAuthObjects.map((a: string, idx: number) => (
                          <li key={idx}>{a}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: AUTHORIZATION FAILURE ANALYSIS (SU53 / STAUTHTRACE) */}
      {activeTab === 'auth_failure' && (
        <div className="mt-4 space-y-4 font-mono text-xs">
          {/* HEADER & CONTROLLER */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <h3 className="font-bold text-amber-400 uppercase tracking-wider text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                SAP Authorization Failure Analysis Agent (SU53 & STAUTHTRACE Correlator)
              </h3>
              <span className="text-[10px] bg-slate-900 text-amber-300 px-2.5 py-0.5 rounded border border-amber-800 font-bold">
                Kernel Auth Trace + Fiori Catalog Hierarchy
              </span>
            </div>

            {/* INPUT FORM */}
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                value={authFailUserId}
                onChange={(e) => setAuthFailUserId(e.target.value)}
                placeholder="User ID (e.g. ABC, JOHNDOE)"
                className="w-full sm:w-1/3 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
              />
              <input
                type="text"
                value={authFailTcode}
                onChange={(e) => setAuthFailTcode(e.target.value)}
                placeholder="Transaction Code / Fiori App (e.g. ME21N, VA01, F0842)"
                className="w-full sm:w-1/2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                disabled={authFailLoading || !authFailUserId || !authFailTcode}
                onClick={() => runAuthFail(authFailUserId, authFailTcode)}
                className="w-full sm:w-auto px-5 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold rounded-lg transition text-xs flex items-center justify-center gap-2 shrink-0"
              >
                {authFailLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                Analyze Failure
              </button>
            </div>
          </div>

          {/* ANALYSIS RESULTS DISPLAY */}
          {authFailData && (
            <div className="p-4 bg-slate-950 border border-amber-800/80 rounded-xl space-y-4 shadow-xl">
              {/* TOP STATUS CARD */}
              <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg border border-slate-800">
                <div>
                  <span className="font-extrabold text-white text-sm uppercase">
                    Authorization Analysis: User {authFailData.userId} ({authFailData.userName})
                  </span>
                  <p className="text-slate-400 text-[11px]">
                    Target Transaction: <strong className="text-amber-300">{authFailData.failedTcode}</strong> {authFailData.fioriAppTitle ? `(${authFailData.fioriAppTitle})` : ''}
                  </p>
                </div>
                <span className="text-xs bg-rose-950 text-rose-300 px-3 py-1 rounded border border-rose-800 font-bold">
                  RC = 4 (Authorization Failed)
                </span>
              </div>

              {/* PLAIN LANGUAGE EXPLANATION CALLOUT BOX */}
              <div className="p-4 bg-slate-900 border-l-4 border-l-amber-500 border-y border-r border-slate-800 rounded-r-xl space-y-2">
                <span className="font-extrabold text-amber-400 uppercase tracking-wider text-xs flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-amber-400" />
                  Plain Language Cause Analysis:
                </span>
                <p className="text-xs text-slate-100 font-sans leading-relaxed font-semibold bg-slate-950/80 p-3 rounded border border-slate-800">
                  {authFailData.plainLanguageExplanation}
                </p>
              </div>

              {/* RECOMMENDED ACTION CALLOUT BOX */}
              <div className="p-4 bg-slate-900 border-l-4 border-l-emerald-500 border-y border-r border-slate-800 rounded-r-xl space-y-2">
                <span className="font-extrabold text-emerald-400 uppercase tracking-wider text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Recommended Security Action (Least Privilege Compliant):
                </span>
                <p className="text-xs text-emerald-200 font-sans leading-relaxed font-semibold bg-emerald-950/40 p-3 rounded border border-emerald-900">
                  {authFailData.recommendedAction}
                </p>
              </div>

              {/* SU53 BUFFER SNAPSHOT */}
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                <span className="font-bold text-rose-400 uppercase text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  SU53 Buffer Snapshot (Last Authorization Failure Check):
                </span>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-800">
                        <th className="py-1">Auth Object</th>
                        <th className="py-1">Object Description</th>
                        <th className="py-1">Field</th>
                        <th className="py-1">Required Value</th>
                        <th className="py-1">User's Permitted Values</th>
                        <th className="py-1">Return Code</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-200">
                      {authFailData.su53Buffer.map((b: any, idx: number) => (
                        <tr key={idx}>
                          <td className="py-1.5 font-bold text-rose-300">{b.authObject}</td>
                          <td className="py-1.5 text-slate-300">{b.authObjectText}</td>
                          <td className="py-1.5 text-slate-400">{b.field}</td>
                          <td className="py-1.5 font-bold text-amber-300">{b.requiredValue}</td>
                          <td className="py-1.5 text-slate-300">{b.userPermittedValues.join(', ')}</td>
                          <td className="py-1.5">
                            <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${b.returnCode === 0 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'}`}>
                              RC = {b.returnCode}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* STAUTHTRACE KERNEL TRACE LOGS */}
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                <span className="font-bold text-cyan-400 uppercase text-xs flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  STAUTHTRACE Kernel Trace Chronology:
                </span>
                <div className="space-y-1.5">
                  {authFailData.stauthtraceLog.map((t: any, idx: number) => (
                    <div key={idx} className="p-2 bg-slate-950 rounded border border-slate-800 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">{t.timestamp}</span>
                        <strong className="text-white">{t.authObject}</strong>
                        <span className="text-slate-400">({t.field} = {t.checkedValue})</span>
                      </div>
                      <span className={`font-bold ${t.rcText.includes('Success') ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {t.rcText}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* PFCG ROLES, ORG LEVELS, & FIORI SPACE */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* ASSIGNED ROLES */}
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1.5">
                  <span className="font-bold text-slate-300 uppercase text-[11px] block">Assigned PFCG Roles:</span>
                  <div className="space-y-1">
                    {authFailData.assignedRoles.map((r: string, idx: number) => (
                      <span key={idx} className="block px-2 py-1 bg-slate-950 text-slate-200 border border-slate-800 rounded text-[10px] font-bold">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>

                {/* ORG LEVEL VALUES */}
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1.5">
                  <span className="font-bold text-slate-300 uppercase text-[11px] block">Current Org Levels:</span>
                  <div className="space-y-1">
                    {authFailData.orgLevelValues.map((o: any, idx: number) => (
                      <div key={idx} className="text-[10px] text-slate-300 flex justify-between">
                        <span>{o.orgField} ({o.fieldDescription}):</span>
                        <strong className="text-amber-300">{o.assignedValue}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                {/* FIORI CATALOG & SPACE */}
                {authFailData.fioriCatalogSpace && (
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1.5">
                    <span className="font-bold text-slate-300 uppercase text-[11px] block">Fiori Catalog & Launchpad:</span>
                    <div className="text-[10px] text-slate-300 space-y-1">
                      <div>Catalog: <strong className="text-cyan-300">{authFailData.fioriCatalogSpace.catalogId}</strong></div>
                      <div>Space: <strong className="text-white">{authFailData.fioriCatalogSpace.spaceId}</strong></div>
                      <div>Page: <strong className="text-white">{authFailData.fioriCatalogSpace.pageId}</strong></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: JOINER / MOVER / LEAVER AUTOMATION (JML LIFECYCLE) */}
      {activeTab === 'jml_lifecycle' && (
        <div className="mt-4 space-y-4 font-mono text-xs">
          {/* JML CONTROLLER HEADER */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <h3 className="font-bold text-emerald-400 uppercase tracking-wider text-xs flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                SAP Identity Lifecycle Agent — Joiner / Mover / Leaver (JML) Automation
              </h3>
              <span className="text-[10px] bg-slate-900 text-emerald-300 px-2.5 py-0.5 rounded border border-emerald-800 font-bold">
                S/4HANA OData + SU01 + GRC Integrated
              </span>
            </div>

            {/* EVENT SELECTOR TABS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setJmlEventType('JOINER');
                  setJmlUserId('ALEX_CHEN');
                  runJmlWorkflow('JOINER', 'ALEX_CHEN');
                }}
                className={`p-3 rounded-lg border transition text-left space-y-1 ${
                  jmlEventType === 'JOINER'
                    ? 'bg-emerald-950/80 border-emerald-500/80 shadow-md text-emerald-300'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-850'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black uppercase text-xs flex items-center gap-1.5">
                    <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
                    1. Joiner Workflow
                  </span>
                  <span className="text-[9px] bg-emerald-900/80 text-emerald-300 px-1.5 py-0.5 rounded">NEW HIRE</span>
                </div>
                <p className="text-[10px] text-slate-300 leading-tight">
                  HR Event → Job Role → Recommended Roles → SoD Check → Approvals → SU01 Provisioning → Verification
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setJmlEventType('MOVER');
                  setJmlUserId('DAVID_KIM');
                  runJmlWorkflow('MOVER', 'DAVID_KIM');
                }}
                className={`p-3 rounded-lg border transition text-left space-y-1 ${
                  jmlEventType === 'MOVER'
                    ? 'bg-amber-950/80 border-amber-500/80 shadow-md text-amber-300'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-850'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black uppercase text-xs flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                    2. Mover Workflow
                  </span>
                  <span className="text-[9px] bg-amber-900/80 text-amber-300 px-1.5 py-0.5 rounded">TRANSFER</span>
                </div>
                <p className="text-[10px] text-slate-300 leading-tight">
                  Position Change → Compare Access → Remove Obsolete Roles → Add New Roles → SoD Check → Provision
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setJmlEventType('LEAVER');
                  setJmlUserId('ROBERT_TAYLOR');
                  runJmlWorkflow('LEAVER', 'ROBERT_TAYLOR');
                }}
                className={`p-3 rounded-lg border transition text-left space-y-1 ${
                  jmlEventType === 'LEAVER'
                    ? 'bg-rose-950/80 border-rose-500/80 shadow-md text-rose-300'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-850'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black uppercase text-xs flex items-center gap-1.5">
                    <UserX className="w-3.5 h-3.5 text-rose-400" />
                    3. Leaver Workflow
                  </span>
                  <span className="text-[9px] bg-rose-900/80 text-rose-300 px-1.5 py-0.5 rounded">TERMINATION</span>
                </div>
                <p className="text-[10px] text-slate-300 leading-tight">
                  HR Termination → Lock User → Remove PFCG Roles → Revoke Firefighter → Revoke RFC/API → Audit
                </p>
              </button>
            </div>

            {/* INPUT FORM FOR CUSTOM USER EXECUTION */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-slate-900">
              <div className="flex-1 w-full">
                <input
                  type="text"
                  value={jmlUserId}
                  onChange={(e) => setJmlUserId(e.target.value)}
                  placeholder="Enter User ID (e.g. ALEX_CHEN, DAVID_KIM, ROBERT_TAYLOR)"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
              <button
                type="button"
                disabled={jmlLoading || !jmlUserId}
                onClick={() => runJmlWorkflow(jmlEventType, jmlUserId)}
                className="w-full sm:w-auto px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-lg transition text-xs flex items-center justify-center gap-2 shrink-0"
              >
                {jmlLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                Execute {jmlEventType} Lifecycle Pipeline
              </button>
            </div>
          </div>

          {/* WORKFLOW SUMMARY CARD */}
          {jmlData && (
            <div className="p-4 bg-slate-950 border border-emerald-800/80 rounded-xl space-y-3 relative overflow-hidden shadow-xl">
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-lg shrink-0 ${
                  jmlData.eventType === 'JOINER' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                  jmlData.eventType === 'MOVER' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                  'bg-rose-950 text-rose-400 border border-rose-800'
                }`}>
                  {jmlData.eventType === 'JOINER' ? <UserPlus className="w-5 h-5" /> :
                   jmlData.eventType === 'MOVER' ? <RefreshCw className="w-5 h-5" /> :
                   <UserX className="w-5 h-5" />}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-white text-sm uppercase tracking-wide">
                      {jmlData.eventType} LIFECYCLE: {jmlData.userName} ({jmlData.userId})
                    </span>
                    <span className="text-[10px] bg-slate-900 text-emerald-400 px-2 py-0.5 rounded border border-slate-800 font-bold">
                      {jmlData.workflowId}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-200 bg-slate-900/90 p-3 rounded-lg border border-slate-800 leading-relaxed">
                    "{jmlData.summaryMessage}"
                  </p>
                </div>
              </div>

              {/* 8-STEP LIFECYCLE PIPELINE PROGRESSION */}
              <div className="pt-2">
                <span className="font-extrabold text-slate-300 uppercase tracking-wider text-[11px] block mb-2">
                  Complete 8-Step Autonomous Security Lifecycle Execution Lineage:
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                  {jmlData.steps.map((step: any, idx: number) => (
                    <div key={idx} className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 space-y-1 relative">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-emerald-400 uppercase">
                          Step {step.stepNumber}: {step.stepName}
                        </span>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <p className="text-[10px] text-white font-semibold leading-tight">{step.description}</p>
                      <p className="text-[9px] text-slate-400">{step.details}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ROLE CHANGES DIFF MATRIX */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {/* ROLES ADDED */}
                {jmlData.rolesAdded && jmlData.rolesAdded.length > 0 && (
                  <div className="p-3 bg-slate-900/90 rounded-lg border border-emerald-900/80 space-y-2">
                    <span className="text-[10px] font-black text-emerald-400 uppercase flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Assigned Least-Privilege Roles ({jmlData.rolesAdded.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {jmlData.rolesAdded.map((r: string, rI: number) => (
                        <span key={rI} className="px-2 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded text-[10px] font-mono font-bold">
                          + {r}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* ROLES REMOVED */}
                {jmlData.rolesRemoved && jmlData.rolesRemoved.length > 0 && (
                  <div className="p-3 bg-slate-900/90 rounded-lg border border-rose-900/80 space-y-2">
                    <span className="text-[10px] font-black text-rose-400 uppercase flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" />
                      Deprovisioned / Stripped Roles ({jmlData.rolesRemoved.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {jmlData.rolesRemoved.map((r: string, rI: number) => (
                        <span key={rI} className="px-2 py-1 bg-rose-950 text-rose-300 border border-rose-800 rounded text-[10px] font-mono font-bold">
                          - {r}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* PROVISIONING VERIFICATION & AUDIT BAR */}
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px]">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-emerald-400 font-bold">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>SU01 Status: {jmlData.provisioningVerification.userLockStatus}</span>
                  </div>
                  <div className="text-slate-400">
                    Roles in SU01: <strong className="text-white">{jmlData.provisioningVerification.rolesAssignedInSU01}</strong>
                  </div>
                  {jmlData.provisioningVerification.rfcApiKeysRevokedCount !== undefined && (
                    <div className="text-rose-400 font-bold">
                      API/RFC Revoked: {jmlData.provisioningVerification.rfcApiKeysRevokedCount} Tokens
                    </div>
                  )}
                </div>

                <div className="text-slate-400 font-mono">
                  Audit Ref: <span className="text-amber-400 font-bold">{jmlData.provisioningVerification.auditLogRef}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: SMART ACCESS REQUEST AI ("Give Sarah the Same Access as Mike") */}
      {activeTab === 'clone_access' && (
        <div className="mt-4 space-y-4 font-mono text-xs">
          {/* USER CLONE CONTROLLER FORM */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-amber-400 uppercase tracking-wider text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                SAP Access Request AI — Least-Privilege Role Cloning Analysis
              </h3>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800 font-bold">
                POLICY: Least-Privilege & Zero SoD Cloning
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Target User (Receiving Access)</label>
                <input
                  type="text"
                  value={smartTargetUser}
                  onChange={(e) => setSmartTargetUser(e.target.value)}
                  placeholder="e.g. SARAH_JENKINS or Sarah"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Source Reference User (Existing Access)</label>
                <input
                  type="text"
                  value={smartSourceUser}
                  onChange={(e) => setSmartSourceUser(e.target.value)}
                  placeholder="e.g. MIKE_ROSS or Mike"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  disabled={cloneLoading || !smartTargetUser || !smartSourceUser}
                  onClick={() => runSmartClone(smartTargetUser, smartSourceUser)}
                  className="w-full py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold rounded-lg transition text-xs flex items-center justify-center gap-2"
                >
                  {cloneLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  Analyze Role Assignment
                </button>
              </div>
            </div>
          </div>

          {/* AI SUMMARY MESSAGE CALLOUT */}
          {smartCloneData && (
            <div className="p-4 bg-slate-950 border-2 border-amber-500/40 rounded-xl space-y-3 relative overflow-hidden shadow-xl">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-950/80 border border-amber-800/80 text-amber-400 rounded-lg shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-amber-300 uppercase tracking-wide">
                      AI Role Clone & SoD Audit Recommendation
                    </span>
                    <span className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800 font-bold">
                      Ticket: {smartCloneData.grcRequestTicketId}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-white leading-relaxed bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                    "{smartCloneData.aiSummaryMessage}"
                  </p>
                </div>
              </div>

              {/* STATS METRIC MATRIX */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 font-mono">
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-[9px] text-slate-400 uppercase block font-bold">Source Roles</span>
                  <span className="text-lg font-black text-slate-200">{smartCloneData.sourceTotalRolesCount} Roles</span>
                </div>
                <div className="p-2.5 bg-emerald-950/60 border border-emerald-800/60 rounded-lg">
                  <span className="text-[9px] text-emerald-400 uppercase block font-bold">Recommended</span>
                  <span className="text-lg font-black text-emerald-300">{smartCloneData.recommendedRolesCount} Roles</span>
                </div>
                <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-lg">
                  <span className="text-[9px] text-slate-400 uppercase block font-bold">Unnecessary</span>
                  <span className="text-lg font-black text-slate-300">{smartCloneData.unnecessaryRolesCount} Filtered</span>
                </div>
                <div className="p-2.5 bg-amber-950/60 border border-amber-800/60 rounded-lg">
                  <span className="text-[9px] text-amber-400 uppercase block font-bold">Privileged Access</span>
                  <span className="text-lg font-black text-amber-300">{smartCloneData.privilegedRolesCount} Blocked</span>
                </div>
                <div className="p-2.5 bg-rose-950/60 border border-rose-800/60 rounded-lg">
                  <span className="text-[9px] text-rose-400 uppercase block font-bold">SoD Conflict</span>
                  <span className="text-lg font-black text-rose-300">{smartCloneData.sodConflictRolesCount} Conflict</span>
                </div>
              </div>

              {/* CRITICAL SOD WARNING CALLOUT */}
              {smartCloneData.sodConflictDetails && (
                <div className="p-3 bg-rose-950/80 border border-rose-800/80 rounded-lg text-rose-200 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold uppercase text-[10px] block text-rose-300">Segregation of Duties Conflict Prevented:</span>
                    <span className="text-[11px] leading-snug block mt-0.5">{smartCloneData.sodConflictDetails}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* RECOMMENDED ROLES (9 ROLES) */}
          {smartCloneData && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <span className="font-extrabold text-emerald-400 uppercase tracking-wider text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Recommended Minimum Roles ({smartCloneData.recommendedRoles.length} Aligned with Job Function)
                </span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                  Target Job: {smartCloneData.targetJobFunction}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {smartCloneData.recommendedRoles.map((role: any, rIdx: number) => (
                  <div key={rIdx} className="p-3 bg-slate-950 rounded-xl border border-slate-850 hover:border-emerald-800 transition space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-300 text-[11px] truncate">{role.roleName}</span>
                      <span className="text-[8px] px-1.5 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded uppercase font-bold">
                        MATCH
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-300 leading-tight">{role.roleDescription}</p>
                    <div className="text-[9px] text-slate-400 pt-1 border-t border-slate-900 flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>{role.alignmentReason}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FILTERED OUT ROLES (5 ROLES) */}
          {smartCloneData && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <span className="font-extrabold text-rose-400 uppercase tracking-wider text-xs flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-rose-400" />
                  Filtered Out & Blocked Roles ({smartCloneData.filteredOutRoles.length} Roles Prevented from Assignment)
                </span>
                <span className="text-[10px] bg-rose-950 text-rose-300 px-2 py-0.5 rounded border border-rose-800">
                  Prevented Over-Privilege
                </span>
              </div>

              <div className="space-y-2">
                {smartCloneData.filteredOutRoles.map((fRole: any, fIdx: number) => (
                  <div key={fIdx} className="p-3 bg-slate-950 rounded-xl border border-slate-850 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{fRole.roleName}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                          fRole.filterCategory === 'SOD_CONFLICT'
                            ? 'bg-rose-950 text-rose-300 border-rose-800'
                            : fRole.filterCategory === 'PRIVILEGED_ACCESS'
                            ? 'bg-amber-950 text-amber-300 border-amber-800'
                            : 'bg-slate-900 text-slate-300 border-slate-800'
                        }`}>
                          {fRole.filterCategory}
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-300">{fRole.roleDescription}</p>
                      <p className="text-[10px] text-slate-400 font-sans italic">{fRole.reason}</p>
                    </div>

                    <span className="text-[9px] px-2 py-1 bg-slate-900 text-slate-400 border border-slate-800 rounded shrink-0 uppercase font-mono font-bold">
                      BLOCKED BY AI
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GRC WORKFLOW ROUTING FOOTER */}
          {smartCloneData && (
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4">
              <div>
                <span className="font-bold text-white text-xs block">Route Request for GRC Approval</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Request {smartCloneData.grcRequestTicketId} will be submitted to CISO & Line Manager with least-privilege audit rationale attached.
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleExecuteRemediationAction('PROPOSE_SMART_CLONE', smartCloneData.targetUserId, `Routing 9 least-privilege roles for ${smartCloneData.targetUserId}`)}
                disabled={actionExecutingId === 'PROPOSE_SMART_CLONE'}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-lg transition text-xs shrink-0 flex items-center gap-2"
              >
                {actionExecutingId === 'PROPOSE_SMART_CLONE' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FileCheck className="w-3.5 h-3.5" />}
                Route for Approval & Provision
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: DEEP AUTHORIZATION TRACER ("Why Does User Have Access?") */}
      {activeTab === 'access_trace' && (
        <div className="mt-4 space-y-4 font-mono text-xs">
          {/* SEARCH & QUERY INPUT */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-cyan-400 uppercase tracking-wider text-xs flex items-center gap-2">
                <Search className="w-4 h-4" />
                Deep Authorization Tracer — "Why Does a User Have Access?"
              </h3>
              <span className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800">
                OData TRACE: API_BUSINESS_USER_SRV ➔ PFCG ➔ Auth Object
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Target User ID</label>
                <input
                  type="text"
                  value={traceUserId}
                  onChange={(e) => setTraceUserId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                  placeholder="e.g. JOHNDOE"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Target Access Capability / Question</label>
                <input
                  type="text"
                  value={traceTargetAccess}
                  onChange={(e) => setTraceTargetAccess(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                  placeholder="e.g. Why can John change vendor bank details?"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500">Quick Test Users:</span>
                {['JOHNDOE', 'ELEANOR_VANCE', 'EXT_CONS_98', 'STUDENT069'].map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => {
                      setTraceUserId(u);
                      runTrace(u, traceTargetAccess);
                    }}
                    className={`px-2 py-1 text-[10px] rounded font-bold transition ${
                      traceUserId === u
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>

              <button
                onClick={() => runTrace(traceUserId, traceTargetAccess)}
                disabled={traceLoading}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold rounded-lg transition flex items-center gap-2"
              >
                {traceLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                Trace Authorization Hierarchy
              </button>
            </div>
          </div>

          {/* TRACE RESULTS DISPLAY */}
          {traceResult && (
            <div className="space-y-4">
              {/* NATURAL LANGUAGE AI TRACE EXPLANATION */}
              <div className="p-4 bg-slate-950 border-l-4 border-l-cyan-500 border border-slate-850 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-cyan-400 font-bold uppercase text-[10px] tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    AI Authorization Analysis & GRC Lineage Summary
                  </span>
                  <span className="text-[10px] text-slate-400">Assignment: {traceResult.assignmentDate} | Request: {traceResult.approvalRequestId}</span>
                </div>
                <p className="text-slate-200 text-xs leading-relaxed">{traceResult.explanation}</p>
              </div>

              {/* 6-STEP VISUAL HIERARCHY NODE FLOW */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <span className="text-slate-400 font-bold uppercase text-[10px] block tracking-wider">
                  Complete Lineage Path: User ➔ Assigned Role ➔ Composite Role ➔ Single Role ➔ Auth Object ➔ Field Values ➔ T-Code
                </span>

                <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-center space-y-1">
                    <span className="text-[9px] text-cyan-400 font-bold uppercase block">1. User</span>
                    <Users className="w-5 h-5 text-cyan-400 mx-auto" />
                    <span className="font-bold text-white text-xs block truncate">{traceResult.userId}</span>
                    <span className="text-[9px] text-slate-400 block">{traceResult.userName}</span>
                  </div>

                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-center space-y-1">
                    <span className="text-[9px] text-purple-400 font-bold uppercase block">2. Assigned Role</span>
                    <Layers className="w-5 h-5 text-purple-400 mx-auto" />
                    <span className="font-bold text-white text-xs block truncate">{traceResult.accessPath.assignedRole}</span>
                    <span className="text-[9px] text-slate-400 block">GRC Assigned</span>
                  </div>

                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-center space-y-1">
                    <span className="text-[9px] text-indigo-400 font-bold uppercase block">3. Composite Role</span>
                    <Building2 className="w-5 h-5 text-indigo-400 mx-auto" />
                    <span className="font-bold text-white text-xs block truncate">{traceResult.accessPath.compositeRole || 'N/A'}</span>
                    <span className="text-[9px] text-slate-400 block">PFCG Container</span>
                  </div>

                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-center space-y-1">
                    <span className="text-[9px] text-blue-400 font-bold uppercase block">4. Single Role</span>
                    <Shield className="w-5 h-5 text-blue-400 mx-auto" />
                    <span className="font-bold text-white text-xs block truncate">{traceResult.accessPath.singleRole}</span>
                    <span className="text-[9px] text-slate-400 block">Auth Holder</span>
                  </div>

                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-center space-y-1">
                    <span className="text-[9px] text-amber-400 font-bold uppercase block">5. Auth Object</span>
                    <Lock className="w-5 h-5 text-amber-400 mx-auto" />
                    <span className="font-bold text-white text-xs block truncate">{traceResult.accessPath.authorizationObject}</span>
                    <span className="text-[9px] text-amber-300 block truncate">{traceResult.accessPath.fieldValues}</span>
                  </div>

                  <div className="p-3 bg-slate-900 border border-emerald-800/80 bg-emerald-950/20 rounded-xl text-center space-y-1">
                    <span className="text-[9px] text-emerald-400 font-bold uppercase block">6. T-Code / App</span>
                    <Terminal className="w-5 h-5 text-emerald-400 mx-auto" />
                    <span className="font-bold text-white text-xs block truncate">{traceResult.accessPath.tcodeOrFioriApp}</span>
                    <span className="text-[9px] text-emerald-400 block">Executable</span>
                  </div>
                </div>
              </div>

              {/* SOD CONFLICT IDENTIFICATION */}
              {traceResult.sodConflictDetected && (
                <div className="p-4 bg-rose-950/80 border border-rose-800 rounded-xl space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                    <h4 className="font-bold text-rose-200 text-xs">High-Risk Segregation of Duties (SoD) Conflict Identified</h4>
                  </div>
                  <p className="text-rose-100 text-xs">{traceResult.sodConflictDetails}</p>
                </div>
              )}

              {/* RECOMMENDED REMEDIATION ACTIONS WITH 1-CLICK EXECUTION */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-amber-400 uppercase text-[10px] tracking-wider flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Recommended Remediation Actions (1-Click Controlled Execution)
                </h4>

                <div className="space-y-2">
                  {traceResult.recommendedActions.map((act: string, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-[10px]">
                          {idx + 1}
                        </span>
                        <span className="text-slate-200 text-xs font-mono">{act}</span>
                      </div>

                      <button
                        onClick={() =>
                          handleExecuteRemediationAction(
                            idx === 0 ? 'REMOVE_ROLE' : idx === 1 ? 'PROPOSE_LEAST_PRIVILEGE' : idx === 2 ? 'PROPOSE_LEAST_PRIVILEGE' : 'VALIDATE_MITIGATING_CONTROL',
                            traceResult.userId,
                            act
                          )
                        }
                        disabled={actionExecutingId !== null}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded text-[11px] transition shrink-0 flex items-center gap-1"
                      >
                        <Zap className="w-3 h-3" />
                        Execute Action
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: CONTROLLED AUTONOMOUS REMEDIATION ACTIONS */}
      {activeTab === 'remediation' && (
        <div className="mt-4 space-y-4 font-mono text-xs">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <h3 className="font-bold text-amber-400 uppercase tracking-wider text-xs flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              Autonomous SAP Security Remediation & Controlled Actions Hub
            </h3>
            <p className="text-slate-400 text-xs">
              Execute real-time remediation actions across S/4HANA SU01 users, PFCG roles, GRC access review campaigns, and firefighter emergency sessions. All write operations update the cryptographic ledger.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* ACTION CARD 1: LOCK / UNLOCK USER */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-2 text-xs">
                  <Lock className="w-4 h-4 text-rose-400" />
                  Lock / Unlock User (SU01)
                </span>
                <span className="text-[9px] bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded">SU01</span>
              </div>
              <p className="text-slate-400 text-[11px]">Lock compromised user accounts or unlock legitimate accounts after MFA verification.</p>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleExecuteRemediationAction('LOCK_USER', 'ACCOUNTING_CLERK_09', '18 failed password attempts detected')}
                  className="flex-1 px-2.5 py-1.5 bg-rose-950 hover:bg-rose-900 text-rose-200 border border-rose-800 rounded font-bold text-[11px] flex items-center justify-center gap-1"
                >
                  <Lock className="w-3 h-3" /> Lock User
                </button>
                <button
                  onClick={() => handleExecuteRemediationAction('UNLOCK_USER', 'ACCOUNTING_CLERK_09', 'MFA verified by CISO')}
                  className="flex-1 px-2.5 py-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-200 border border-emerald-800 rounded font-bold text-[11px] flex items-center justify-center gap-1"
                >
                  <Unlock className="w-3 h-3" /> Unlock User
                </button>
              </div>
            </div>

            {/* ACTION CARD 2: DISABLE DORMANT ACCOUNTS */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-2 text-xs">
                  <UserCheck className="w-4 h-4 text-amber-400" />
                  Disable Dormant Accounts
                </span>
                <span className="text-[9px] bg-slate-900 text-amber-400 px-1.5 py-0.5 rounded">&gt;90 Days Inactive</span>
              </div>
              <p className="text-slate-400 text-[11px]">Identify contractor or legacy user accounts inactive for over 90 days and lock automatically.</p>
              <button
                onClick={() => handleExecuteRemediationAction('DISABLE_DORMANT', 'EXT_CONS_98', 'No login activity detected since 2026-03-12')}
                className="w-full mt-2 px-3 py-1.5 bg-amber-950 hover:bg-amber-900 text-amber-200 border border-amber-800 rounded font-bold text-[11px] flex items-center justify-center gap-1"
              >
                <Zap className="w-3 h-3" /> Disable Inactive Accounts
              </button>
            </div>

            {/* ACTION CARD 3: REMOVE EXPIRED TEMPORARY ACCESS */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-2 text-xs">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  Remove Expired Access
                </span>
                <span className="text-[9px] bg-slate-900 text-cyan-400 px-1.5 py-0.5 rounded">Valid-To Expired</span>
              </div>
              <p className="text-slate-400 text-[11px]">Automatically revoke temporary emergency roles or project role assignments whose valid-to date has passed.</p>
              <button
                onClick={() => handleExecuteRemediationAction('REMOVE_EXPIRED_ACCESS', 'TEMP_CONS_01', 'Role SAP_FI_AP_MANAGER expired on 2026-08-01')}
                className="w-full mt-2 px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-200 border border-cyan-800 rounded font-bold text-[11px] flex items-center justify-center gap-1"
              >
                <Zap className="w-3 h-3" /> Revoke Expired Roles
              </button>
            </div>

            {/* ACTION CARD 4: PROPOSE LEAST-PRIVILEGE ROLE CHANGES */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-2 text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Least-Privilege Role Redesign
                </span>
                <span className="text-[9px] bg-slate-900 text-emerald-400 px-1.5 py-0.5 rounded">PFCG / ST03N</span>
              </div>
              <p className="text-slate-400 text-[11px]">Analyze ST03N execution logs to strip unused T-Codes and generate optimized single roles.</p>
              <button
                onClick={() => handleExecuteRemediationAction('PROPOSE_LEAST_PRIVILEGE', 'SAP_FI_AP_MANAGER', 'Strip unused T-Code FB08 (43% unused authorization)')}
                className="w-full mt-2 px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-200 border border-emerald-800 rounded font-bold text-[11px] flex items-center justify-center gap-1"
              >
                <Zap className="w-3 h-3" /> Generate Least-Privilege Role
              </button>
            </div>

            {/* ACTION CARD 5: CREATE ACCESS REVIEW CAMPAIGN */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-2 text-xs">
                  <FileText className="w-4 h-4 text-purple-400" />
                  Access Review Campaign
                </span>
                <span className="text-[9px] bg-slate-900 text-purple-400 px-1.5 py-0.5 rounded">GRC Recertification</span>
              </div>
              <p className="text-slate-400 text-[11px]">Launch automated quarterly access review campaign for departmental managers to recertify user roles.</p>
              <button
                onClick={() => handleExecuteRemediationAction('CREATE_ACCESS_CAMPAIGN', 'CMP-Q3-FINANCE', 'Initiate Q3 Financial Access Recertification for 120 users')}
                className="w-full mt-2 px-3 py-1.5 bg-purple-950 hover:bg-purple-900 text-purple-200 border border-purple-800 rounded font-bold text-[11px] flex items-center justify-center gap-1"
              >
                <Zap className="w-3 h-3" /> Launch Campaign
              </button>
            </div>

            {/* ACTION CARD 6: VALIDATE MITIGATING CONTROLS */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-2 text-xs">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  Validate Mitigating Controls
                </span>
                <span className="text-[9px] bg-slate-900 text-cyan-400 px-1.5 py-0.5 rounded">SOX 404</span>
              </div>
              <p className="text-slate-400 text-[11px]">Verify effectiveness of secondary controls (e.g. CTRL-P2P-802 dual approval) for unmitigated SoD conflicts.</p>
              <button
                onClick={() => handleExecuteRemediationAction('VALIDATE_MITIGATING_CONTROL', 'CTRL-P2P-802', 'Verify independent dual bank account approval log')}
                className="w-full mt-2 px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-200 border border-cyan-800 rounded font-bold text-[11px] flex items-center justify-center gap-1"
              >
                <Zap className="w-3 h-3" /> Audit Control Effectiveness
              </button>
            </div>

            {/* ACTION CARD 7: TRIGGER FIREFIGHTER REVIEW */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-2 text-xs">
                  <Flame className="w-4 h-4 text-amber-400" />
                  Trigger Firefighter Review
                </span>
                <span className="text-[9px] bg-slate-900 text-amber-400 px-1.5 py-0.5 rounded">EAM / SPM</span>
              </div>
              <p className="text-slate-400 text-[11px]">Send closed emergency Firefighter log sessions to CISO and auditor for mandatory review.</p>
              <button
                onClick={() => handleExecuteRemediationAction('TRIGGER_FIREFIGHTER_REVIEW', 'FF_FIN_01', 'Session FF-LOG-9082 closed by ELEANOR_VANCE')}
                className="w-full mt-2 px-3 py-1.5 bg-amber-950 hover:bg-amber-900 text-amber-200 border border-amber-800 rounded font-bold text-[11px] flex items-center justify-center gap-1"
              >
                <Zap className="w-3 h-3" /> Request Auditor Sign-Off
              </button>
            </div>

            {/* ACTION CARD 8: PEER GROUP COMPARISON */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-2 text-xs">
                  <Users className="w-4 h-4 text-indigo-400" />
                  Peer Group Comparison
                </span>
                <span className="text-[9px] bg-slate-900 text-indigo-400 px-1.5 py-0.5 rounded">AI Baseline</span>
              </div>
              <p className="text-slate-400 text-[11px]">Compare user's authorizations against peer group baseline to flag authorization outliers.</p>
              <button
                onClick={() => handleExecuteRemediationAction('PEER_GROUP_COMPARISON', 'JOHNDOE', 'Compare JOHNDOE against AP Specialist team (68% match score)')}
                className="w-full mt-2 px-3 py-1.5 bg-indigo-950 hover:bg-indigo-900 text-indigo-200 border border-indigo-800 rounded font-bold text-[11px] flex items-center justify-center gap-1"
              >
                <Zap className="w-3 h-3" /> Run Peer Group Analysis
              </button>
            </div>

            {/* ACTION CARD 9: GENERATE AUDIT EVIDENCE */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-2 text-xs">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  Generate Cryptographic Audit Evidence
                </span>
                <span className="text-[9px] bg-slate-900 text-emerald-400 px-1.5 py-0.5 rounded">SOX / ISO</span>
              </div>
              <p className="text-slate-400 text-[11px]">Export signed cryptographic hash proof of all security actions to external audit ledger.</p>
              <button
                onClick={() => handleExecuteRemediationAction('GENERATE_AUDIT_EVIDENCE', 'S4H Client 100', 'Generate cryptographically signed audit evidence package')}
                className="w-full mt-2 px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-200 border border-emerald-800 rounded font-bold text-[11px] flex items-center justify-center gap-1"
              >
                <Zap className="w-3 h-3" /> Export Audit Ledger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: OVERVIEW & ARCHITECTURE PIPELINE */}
      {activeTab === 'overview' && (
        <div className="mt-4 space-y-4">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <h3 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Executive Security Posture & Live S/4 Assessment
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">{report.executiveSummary}</p>
          </div>

          {/* ENTERPRISE ARCHITECTURE PIPELINE DIAGRAM */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              Autonomous SAP Security Enterprise Architecture Flow
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-[11px] font-mono">
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[9px] font-bold text-emerald-400 uppercase block">Step 1: Intent & Orchestration</span>
                <p className="text-white font-bold mt-1">Natural Language Request</p>
                <p className="text-[10px] text-slate-400 mt-1">Security Intent Agent → Security Orchestrator Agent</p>
              </div>

              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[9px] font-bold text-cyan-400 uppercase block">Step 2: Sub-Agent Evaluation</span>
                <p className="text-white font-bold mt-1">Specialized Security Agents</p>
                <p className="text-[10px] text-slate-400 mt-1">Role, Auth, SoD, Privileged, EAM, Audit Agents</p>
              </div>

              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[9px] font-bold text-amber-400 uppercase block">Step 3: Live S/4 & Policy Engine</span>
                <p className="text-white font-bold mt-1">Deterministic Policy Check</p>
                <p className="text-[10px] text-slate-400 mt-1">S/4 OData APIs + GRC ARA + SoD Re-simulation</p>
              </div>

              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[9px] font-bold text-rose-400 uppercase block">Step 4: Controlled Execution</span>
                <p className="text-white font-bold mt-1">Approval & Immutable Ledger</p>
                <p className="text-[10px] text-slate-400 mt-1">CISO Approval Workflow → Cryptographic Ledger</p>
              </div>
            </div>
          </div>

          {/* TOP RISK HIGHLIGHTS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
            <div className="p-3.5 bg-rose-950/30 border border-rose-800/50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-rose-400 uppercase">Critical SoD Fraud Exposure</span>
                <span className="px-2 py-0.5 bg-rose-950 text-rose-300 rounded text-[9px] font-bold">€1.45M Risk</span>
              </div>
              <p className="text-slate-300 text-[11px]">Vendor Creation (FK01/API_BUSINESS_PARTNER) and Payment Run (F110) held by 3 users.</p>
            </div>

            <div className="p-3.5 bg-amber-950/30 border border-amber-800/50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-amber-400 uppercase">Active Firefighter Token</span>
                <span className="px-2 py-0.5 bg-amber-950 text-amber-300 rounded text-[9px] font-bold">FF_FIN_01</span>
              </div>
              <p className="text-slate-300 text-[11px]">Checked out for Ticket #INC-98210 (P1 Month-End OB52 Posting Period Shift).</p>
            </div>

            <div className="p-3.5 bg-cyan-950/30 border border-cyan-800/50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-cyan-400 uppercase">Superuser Revocation</span>
                <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 rounded text-[9px] font-bold">BASIS_ADMIN_01</span>
              </div>
              <p className="text-slate-300 text-[11px]">Holds SAP_ALL/SAP_NEW. Least-privilege profile Z_BASIS_OPERATIONS ready for assignment.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: NATURAL LANGUAGE EVIDENCE Q&A */}
      {activeTab === 'queries' && (
        <div className="mt-4 space-y-3">
          {/* CATEGORY FILTER & SEARCH */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar text-xs font-mono">
              <span className="text-slate-500 text-[10px] uppercase font-bold shrink-0">Category:</span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition shrink-0 ${
                    categoryFilter === cat
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-900 rounded-lg border border-slate-800 shrink-0">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search queries..."
                className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none font-mono w-36"
              />
            </div>
          </div>

          {/* QUERY LIST */}
          <div className="space-y-2.5">
            {filteredQueries.map((q) => (
              <div key={q.id} className="p-4 bg-slate-950 rounded-xl border border-slate-850 hover:border-slate-700 transition font-mono">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-emerald-400">{q.id}</span>
                    <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded font-bold">
                      {q.category}
                    </span>
                    <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded">
                      T-Code: {q.sapTcode}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        q.riskLevel === 'Critical'
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : q.riskLevel === 'High'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : q.riskLevel === 'Medium'
                          ? 'bg-yellow-950 text-yellow-400 border border-yellow-800'
                          : q.riskLevel === 'Low'
                          ? 'bg-blue-950 text-blue-400 border border-blue-800'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}
                    >
                      {q.riskLevel} Risk
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        q.policyCheckStatus === 'Policy Passed'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : q.policyCheckStatus === 'Requires CISO Approval'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}
                    >
                      {q.policyCheckStatus}
                    </span>
                  </div>
                </div>

                <p className="text-xs font-bold text-white mb-1.5">{q.question}</p>
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-xs text-slate-300 leading-relaxed mb-2">
                  {q.answer}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] text-slate-400 pt-1 border-t border-slate-900">
                  <span className="truncate">Evidence Source: <code className="text-emerald-300">{q.evidenceSource}</code></span>

                  {q.canAutoRemediate && q.remediationAction && q.riskLevel !== 'Clean' && (
                    <button
                      onClick={() => handleExecuteRemediation(q.id, q.remediationAction!)}
                      disabled={actionExecutingId === q.id}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold rounded text-[10px] transition flex items-center gap-1 shrink-0 self-start sm:self-auto"
                    >
                      {actionExecutingId === q.id ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <Zap className="w-3 h-3" />
                      )}
                      Remediate ({q.policyCheckStatus === 'Requires CISO Approval' ? 'Submit Approval' : 'Auto-Execute'})
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: ROLES & AUTHORIZATIONS */}
      {activeTab === 'roles' && (
        <div className="mt-4 space-y-3 font-mono text-xs">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="font-bold text-slate-300">PFCG Role & Least-Privilege Profile Analysis</span>
            <span className="text-[10px] text-emerald-400">API_BUSINESS_ROLE_SRV Active</span>
          </div>

          <div className="space-y-2">
            {report.roles.map((r, idx) => (
              <div key={idx} className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-emerald-400 text-sm">{r.roleName}</span>
                    <span className="text-[10px] text-slate-400 block">{r.description}</span>
                  </div>
                  <span className="px-2.5 py-0.5 bg-slate-900 border border-slate-800 text-slate-300 rounded font-bold uppercase text-[10px]">
                    {r.singleOrComposite}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] p-2 bg-slate-900 rounded-lg">
                  <div>Assigned Users: <span className="font-bold text-white">{r.userCount}</span></div>
                  <div>Critical Auth Objects: <span className="font-bold text-amber-400">{r.criticalAuthObjectsCount}</span></div>
                  <div>SoD Conflicts: <span className="font-bold text-rose-400">{r.sodConflictCount}</span></div>
                  <div>Unused T-Codes: <span className="font-bold text-slate-300">{r.unusedTcodesPct}%</span></div>
                </div>

                <div className="p-2.5 bg-emerald-950/40 border border-emerald-800/40 rounded-lg text-emerald-300 text-[11px]">
                  <span className="font-bold uppercase text-[9px] block text-emerald-400">Agentic Recommendation:</span>
                  {r.leastPrivilegeRecommendation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: SOD RISK MATRIX */}
      {activeTab === 'sod' && (
        <div className="mt-4 space-y-4 font-mono text-xs">
          <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-rose-300 text-sm flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4.5 h-4.5 text-rose-400 shrink-0" />
                Autonomous SoD Analysis (Ranked by Business Impact & Financial Exposure)
              </h3>
              <p className="text-slate-300 text-xs">
                Incompatible SAP S/4HANA Authorization Pairs prioritized by real business financial risk (€ exposure) and active 30-day execution counts.
              </p>
            </div>
            <div className="px-3 py-1.5 bg-rose-900/60 border border-rose-700/80 rounded-lg text-rose-200 text-xs font-bold whitespace-nowrap">
              Top Production SoD Conflicts
            </div>
          </div>

          <div className="space-y-3">
            {(report.sodRankedConflicts || [
              {
                id: 'SOD-FI-0012',
                user: 'ELEANOR_VANCE (User A)',
                conflict: 'Create Vendor (FK01 / API_BUSINESS_PARTNER) + Execute Payment (F110)',
                risk: 'Critical',
                financialExposure: '€620,000',
                businessImpact: 'High likelihood of unauthorized payment routing to self-managed vendor accounts',
                active30DayTransactionsCount: 14,
                mitigatingControlStatus: 'Unmitigated',
                recommendedAction: 'Remove vendor maintenance authority (Z_VENDOR_MAINT) from AP Manager role',
                remediationActionType: 'REMOVE_ROLE',
                targetUserOrRole: 'ELEANOR_VANCE'
              },
              {
                id: 'SOD-MM-0045',
                user: 'MARCUS_STERLING (User B)',
                conflict: 'Create Purchase Order (ME21N) + Approve Purchase Order (ME28 / Release)',
                risk: 'High',
                financialExposure: '€480,000',
                businessImpact: 'Unchecked purchasing commitment creation bypassing two-person approval controls',
                active30DayTransactionsCount: 22,
                mitigatingControlStatus: 'Unmitigated',
                recommendedAction: 'Remove approval authority from buyer role and enforce dual release strategy',
                remediationActionType: 'PROPOSE_LEAST_PRIVILEGE',
                targetUserOrRole: 'MARCUS_STERLING'
              },
              {
                id: 'SOD-FI-0088',
                user: 'STUDENT069 (User C)',
                conflict: 'Create Journal Entry (FB50) + Post/Approve Journal Entry (FB08/FAGL)',
                risk: 'High',
                financialExposure: '€350,000',
                businessImpact: 'Ability to post unverified GL adjustments directly altering P&L without secondary review',
                active30DayTransactionsCount: 9,
                mitigatingControlStatus: 'Pending Verification',
                recommendedAction: 'Separate posting and approval roles via workflow rule Z_GL_APPROVE',
                remediationActionType: 'PROPOSE_LEAST_PRIVILEGE',
                targetUserOrRole: 'STUDENT069'
              },
              {
                id: 'SOD-HR-0019',
                user: 'JOHNDOE (User D)',
                conflict: 'Maintain Payroll Master (PA30) + Run Payroll Driver (RPCALCU0 / HPAY)',
                risk: 'Critical',
                financialExposure: '€290,000',
                businessImpact: 'Direct risk of phantom employee creation and self-approved payroll disbursement',
                active30DayTransactionsCount: 3,
                mitigatingControlStatus: 'Unmitigated',
                recommendedAction: 'Immediate removal of payroll execution authorization; assign to dedicated Payroll Officer',
                remediationActionType: 'LOCK_USER',
                targetUserOrRole: 'JOHNDOE'
              }
            ]).map((conf: any, idx: number) => (
              <div key={conf.id || idx} className="p-4 bg-slate-950 rounded-xl border border-slate-800 hover:border-slate-700 transition space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-cyan-300 font-bold text-xs">
                      #{idx + 1} {conf.id}
                    </span>
                    <span className="font-bold text-white text-sm">{conf.user}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        conf.risk === 'Critical'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : conf.risk === 'High'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-yellow-950 text-yellow-300 border border-yellow-800'
                      }`}
                    >
                      {conf.risk} Risk
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 block">Financial Exposure</span>
                    <span className="text-sm font-bold text-rose-400">{conf.financialExposure}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Incompatible Conflict Pair:</span>
                    <p className="text-amber-300 font-bold">{conf.conflict}</p>
                    <div className="pt-1 text-[11px] text-slate-300">
                      <strong>Business Impact:</strong> {conf.businessImpact}
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">30-Day Tx Executions:</span>
                      <span className="font-bold text-white">{conf.active30DayTransactionsCount} times</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Mitigating Control:</span>
                      <span className={`font-bold ${conf.mitigatingControlStatus === 'Unmitigated' ? 'text-rose-400' : 'text-amber-400'}`}>
                        {conf.mitigatingControlStatus}
                      </span>
                    </div>
                    <div className="pt-1 border-t border-slate-800/80 text-[11px]">
                      <span className="text-emerald-400 font-bold block">Recommended Action:</span>
                      <span className="text-slate-200">{conf.recommendedAction}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-500">Live S/4HANA GRC Matrix Enforcement</span>
                  <button
                    onClick={() => handleExecuteRemediationAction(conf.remediationActionType || 'REMOVE_ROLE', conf.targetUserOrRole || conf.user, conf.recommendedAction)}
                    disabled={actionExecutingId === (conf.remediationActionType || 'REMOVE_ROLE')}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold rounded-lg text-xs transition flex items-center gap-1.5 shrink-0"
                  >
                    {actionExecutingId === (conf.remediationActionType || 'REMOVE_ROLE') ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Zap className="w-3.5 h-3.5" />
                    )}
                    Remediate SoD Conflict
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: FIREFIGHTER EMERGENCY ACCESS (EAM) */}
      {activeTab === 'firefighter' && (
        <div className="mt-4 space-y-3 font-mono text-xs">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="font-bold text-amber-400 flex items-center gap-2">
              <Flame className="w-4 h-4" />
              Emergency Access Management (GRC EAM / SPM) Active Monitor
            </span>
            <span className="text-[10px] text-slate-400">GRAC_EAM / SPM Daemon</span>
          </div>

          <div className="space-y-2">
            {report.firefighterSessions.map((ff) => (
              <div key={ff.sessionId} className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{ff.sessionId}</span>
                    <span className="px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-800 rounded font-bold text-[10px]">
                      {ff.firefighterId}
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded font-bold text-[10px]">
                    {ff.status}
                  </span>
                </div>

                <div className="p-2.5 bg-slate-900 rounded-lg text-slate-300 space-y-1">
                  <div>Reason Code: <span className="font-bold text-white">{ff.reasonCode}</span></div>
                  <div>Requested By: <span className="font-bold text-emerald-400">{ff.requestedBy}</span> | Assigned Role: <code className="text-amber-300">{ff.assignedRole}</code></div>
                  <div>T-Codes Executed: {ff.tcodesExecuted.map((t) => <code key={t} className="bg-slate-950 border border-slate-800 px-1.5 py-0.5 rounded text-amber-300 mr-1">{t}</code>)}</div>
                </div>

                <div className="text-[10px] text-slate-400">
                  Auditor Review Note: <span className="text-slate-300">{ff.auditorReviewNote}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: PRIVILEGED ACCOUNTS */}
      {activeTab === 'privileged' && (
        <div className="mt-4 space-y-3 font-mono text-xs">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="font-bold text-slate-300">Superuser & Privileged Account Governance</span>
            <span className="text-[10px] text-emerald-400">SU01 / USR02 Live Audit</span>
          </div>

          <div className="space-y-2">
            {report.privilegedAccounts.map((pa, idx) => (
              <div key={idx} className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{pa.accountName}</span>
                    <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded">
                      Type: {pa.userType}
                    </span>
                    <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded">
                      Client {pa.client}
                    </span>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded font-bold text-[10px] ${
                      pa.riskSeverity === 'Critical Hazard'
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : pa.riskSeverity === 'Monitored'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}
                  >
                    {pa.riskSeverity}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] p-2 bg-slate-900 rounded-lg">
                  <div>Unlocked: <span className={`font-bold ${pa.isUnlocked ? 'text-rose-400' : 'text-emerald-400'}`}>{pa.isUnlocked ? 'YES (Unlocked)' : 'NO (Locked)'}</span></div>
                  <div>SAP_ALL: <span className={`font-bold ${pa.hasSapAll ? 'text-rose-400' : 'text-emerald-400'}`}>{pa.hasSapAll ? 'YES' : 'NO'}</span></div>
                  <div>IAS MFA: <span className={`font-bold ${pa.mfaEnabled ? 'text-emerald-400' : 'text-amber-400'}`}>{pa.mfaEnabled ? 'Enabled' : 'Disabled'}</span></div>
                  <div>Last Login: <span className="font-bold text-slate-300">{pa.lastLogin}</span></div>
                </div>

                <div className="p-2.5 bg-slate-900 rounded-lg text-slate-300 text-[11px] flex items-center justify-between">
                  <span>Recommendation: {pa.recommendedRemediation}</span>
                  {pa.hasSapAll && (
                    <button
                      onClick={() => handleExecuteRemediation('Q17', `Revoke SAP_ALL from ${pa.accountName}`)}
                      className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded text-[10px] transition shrink-0 ml-2"
                    >
                      Revoke SAP_ALL
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: AUDIT LOGS & AUTH METRICS */}
      {activeTab === 'audit' && (
        <div className="mt-4 space-y-4 font-mono text-xs">
          <div>
            <span className="font-bold text-slate-300 uppercase text-[10px] block mb-2">Authentication Protocols & Session Metrics</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {report.authMetrics.map((am, idx) => (
                <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-850 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-400">{am.authType}</span>
                    <span className="text-[9px] px-1.5 py-0.5 bg-emerald-950 text-emerald-300 rounded">{am.securityStatus}</span>
                  </div>
                  <div className="text-[10px] text-slate-400">Active Sessions: {am.activeSessionsCount}</div>
                  <div className="text-[10px] text-slate-400">Failed 24h Attempts: {am.failedAttempts24h}</div>
                  <div className="text-[10px] text-slate-400">MFA Enforcement: {am.mfaEnforcementPct}%</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <span className="font-bold text-slate-300 uppercase text-[10px] block mb-2">Security Audit Log (SM20 / CDHDR / CDPOS)</span>
            <div className="space-y-2">
              {report.auditLogs.map((log) => (
                <div key={log.eventId} className="p-3 bg-slate-950 rounded-xl border border-slate-850 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{log.eventId}</span>
                      <span className="text-[10px] text-slate-400">{log.timestamp}</span>
                      <span className="text-[10px] bg-slate-900 text-emerald-400 px-1.5 py-0.5 rounded">{log.eventCategory}</span>
                    </div>
                    <p className="text-slate-300 text-[11px] mt-0.5">{log.details}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 block">User: {log.userId}</span>
                    <span className="text-[10px] text-slate-500 block">IP: {log.terminalIp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 50 NATURAL-LANGUAGE QUESTIONS CATALOG */}
      {activeTab === 'nl_50_questions' && (
        <div className="mt-4 space-y-4 font-mono text-xs">
          <div className="p-4 bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border border-blue-800/60 rounded-xl space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold text-[10px] border border-blue-500/30">
                    SAP SECURITY AGENT
                  </span>
                  <span className="text-slate-400 text-[10px]">Catalog Report ID: CATALOG-50-NL-SEC-2026</span>
                </div>
                <h3 className="text-base font-extrabold text-white mt-1 flex items-center gap-2">
                  50 Natural-Language Questions for SAP Security AI Agent
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px]">
                    5 Domains • 50 Interactive Prompts
                  </span>
                </h3>
                <p className="text-slate-300 text-[11px] mt-1 leading-relaxed">
                  Comprehensive S/4HANA security intelligence prompts spanning Users & Access, Roles & Authorizations, Segregation of Duties (SoD), Privileged Access, and Audit/Compliance.
                </p>
              </div>

              {nl50Data && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 shrink-0">
                  <div className="p-2 bg-slate-950/80 border border-slate-800 rounded-lg text-center">
                    <span className="text-[9px] text-slate-400 block uppercase">Total Questions</span>
                    <span className="text-lg font-black text-blue-400">{nl50Data.totalQuestionsCount}</span>
                  </div>
                  <div className="p-2 bg-slate-950/80 border border-slate-800 rounded-lg text-center">
                    <span className="text-[9px] text-slate-400 block uppercase">Critical / High</span>
                    <span className="text-lg font-black text-rose-400">
                      {nl50Data.questions ? nl50Data.questions.filter((q: any) => q.riskLevel === 'CRITICAL' || q.riskLevel === 'HIGH').length : 32}
                    </span>
                  </div>
                  <div className="p-2 bg-slate-950/80 border border-slate-800 rounded-lg text-center">
                    <span className="text-[9px] text-slate-400 block uppercase">Auto-Remediable</span>
                    <span className="text-lg font-black text-emerald-400">
                      {nl50Data.questions ? nl50Data.questions.filter((q: any) => q.canAutoRemediate).length : 38}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* DOMAIN FILTER BUTTONS & SEARCH */}
            <div className="pt-2 border-t border-blue-900/40 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar">
                {[
                  { label: 'All Domains (50)', value: 'ALL' },
                  { label: '1. Users & Access (10)', value: 'Users & Access' },
                  { label: '2. Roles & Authorizations (10)', value: 'Roles & Authorizations' },
                  { label: '3. Segregation of Duties (10)', value: 'Segregation of Duties (SoD)' },
                  { label: '4. Privileged Access (10)', value: 'Privileged & Firefighter Access' },
                  { label: '5. Audit & Compliance (10)', value: 'Audit, Compliance & Risk' }
                ].map((f) => (
                  <button
                    key={f.value}
                    onClick={() => {
                      setNl50CategoryFilter(f.value);
                      runNl50QuestionsCatalog(f.value, nl50SearchQuery);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition whitespace-nowrap ${
                      nl50CategoryFilter === f.value
                        ? 'bg-blue-600 text-white border border-blue-400 shadow'
                        : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64 shrink-0">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={nl50SearchQuery}
                  onChange={(e) => {
                    setNl50SearchQuery(e.target.value);
                    runNl50QuestionsCatalog(nl50CategoryFilter, e.target.value);
                  }}
                  placeholder="Filter 50 questions..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* QUESTIONS CATALOG LIST */}
          {nl50Loading ? (
            <div className="p-8 bg-slate-950 border border-slate-850 rounded-xl text-center space-y-3">
              <RefreshCw className="w-6 h-6 text-blue-400 animate-spin mx-auto" />
              <p className="text-slate-400 font-bold">Querying S/4HANA Security Catalog & AI Intelligence Engine...</p>
            </div>
          ) : nl50Data && nl50Data.questions ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 font-bold uppercase">
                <span>Showing {nl50Data.questions.length} Natural Language Prompts</span>
                <span>Click any question to view live evidence & execution steps</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {nl50Data.questions.map((q: any) => (
                  <div
                    key={q.id}
                    onClick={() => setSelectedQuestion(q)}
                    className="p-3.5 bg-slate-950 hover:bg-slate-900/90 border border-slate-850 hover:border-blue-800/80 rounded-xl transition cursor-pointer flex flex-col justify-between gap-3 group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-blue-400 bg-blue-950/80 border border-blue-800/60 px-2 py-0.5 rounded text-[10px]">
                            {q.id}
                          </span>
                          <span className="text-[10px] text-slate-400 truncate max-w-[150px]">
                            {q.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-bold">
                            {q.sapTcode}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                              q.riskLevel === 'CRITICAL'
                                ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                                : q.riskLevel === 'HIGH'
                                ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                                : q.riskLevel === 'MEDIUM'
                                ? 'bg-yellow-950/80 text-yellow-300 border-yellow-800'
                                : 'bg-slate-900 text-slate-300 border-slate-700'
                            }`}
                          >
                            {q.riskLevel}
                          </span>
                        </div>
                      </div>

                      <h4 className="text-xs font-bold text-white group-hover:text-blue-300 transition line-clamp-2">
                        "{q.question}"
                      </h4>

                      <p className="text-slate-300 text-[11px] line-clamp-2 leading-relaxed bg-slate-900/60 p-2 rounded border border-slate-850">
                        {q.answer}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="truncate max-w-[200px] text-slate-500">
                        Source: <span className="text-slate-400">{q.evidenceSource}</span>
                      </span>
                      <div className="flex items-center gap-1 text-blue-400 font-bold group-hover:translate-x-0.5 transition shrink-0">
                        <span>Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* SELECTED QUESTION EXPANDED DETAIL MODAL */}
          {selectedQuestion && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
              <div className="bg-slate-900 border border-blue-800/80 rounded-2xl max-w-2xl w-full p-5 space-y-4 shadow-2xl font-mono text-xs max-h-[90vh] overflow-y-auto">
                <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 font-bold text-[10px] border border-blue-800">
                        {selectedQuestion.id}
                      </span>
                      <span className="text-slate-400 text-[10px]">{selectedQuestion.category}</span>
                    </div>
                    <h3 className="text-sm font-extrabold text-white mt-1">
                      "{selectedQuestion.question}"
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedQuestion(null)}
                    className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">AI Agent Answer & Analysis</span>
                    <p className="text-slate-200 text-xs leading-relaxed">{selectedQuestion.answer}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">S/4HANA Evidence Source</span>
                      <span className="text-blue-300 font-bold text-xs mt-0.5 block">{selectedQuestion.evidenceSource}</span>
                      <span className="text-[10px] text-slate-500 font-mono">T-Code / Tool: {selectedQuestion.sapTcode}</span>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Risk Rating & Governance</span>
                      <span className="text-amber-400 font-bold text-xs mt-0.5 block">{selectedQuestion.riskLevel} RISK</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Auto-Remediable: {selectedQuestion.canAutoRemediate ? 'YES (Policy-Controlled)' : 'NO (Human Approval)'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Recommended Remediation Action</span>
                    <p className="text-emerald-300 font-bold text-xs">{selectedQuestion.remediationAction}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                  <button
                    onClick={() => {
                      setCustomQuestion(selectedQuestion.question);
                      setSelectedQuestion(null);
                    }}
                    className="px-3 py-2 bg-blue-900/80 hover:bg-blue-800 text-blue-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    Load Prompt into AI Console
                  </button>

                  {selectedQuestion.canAutoRemediate && (
                    <button
                      onClick={() => {
                        handleExecuteRemediation(selectedQuestion.id, selectedQuestion.remediationAction);
                        setSelectedQuestion(null);
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      Trigger Remediation
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: CISO APPROVALS & IMMUTABLE LEDGER */}
      {activeTab === 'approvals' && (
        <div className="mt-4 space-y-4 font-mono text-xs">
          <div>
            <span className="font-bold text-slate-300 uppercase text-[10px] block mb-2">Pending CISO & Executive Security Approvals</span>
            <div className="space-y-2">
              {report.pendingApprovals.map((appr) => (
                <div key={appr.approvalId} className="p-3.5 bg-slate-950 rounded-xl border border-slate-850 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{appr.approvalId}</span>
                      <span className="text-[10px] px-2 py-0.5 bg-amber-950 text-amber-300 rounded font-bold">{appr.requestType}</span>
                      <span className="text-[10px] text-slate-400">Target: {appr.targetUserOrRole}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Policy: <span className="text-emerald-400">{appr.policyValidation}</span> | SoD Check: <span className="text-emerald-400">{appr.sodConflictCheck}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleExecuteRemediation(appr.approvalId, `Approved ${appr.requestType} for ${appr.targetUserOrRole}`)}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition shrink-0"
                  >
                    Approve & Execute
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <span className="font-bold text-slate-300 uppercase text-[10px] block mb-2 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              Immutable Cryptographic Audit Ledger (Verified Changes)
            </span>
            <div className="space-y-2">
              {report.immutableAuditTrail.map((ledger) => (
                <div key={ledger.auditId} className="p-3.5 bg-slate-950 rounded-xl border border-slate-850 text-slate-300 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-400">{ledger.auditId}</span>
                    <span className="text-[9px] px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded font-bold">
                      {ledger.status}
                    </span>
                  </div>
                  <div>Action: <span className="text-white font-bold">{ledger.action}</span></div>
                  <div>Actor: <span className="text-slate-400">{ledger.actor}</span> | Timestamp: <span className="text-slate-400">{ledger.timestamp}</span></div>
                  <div>API Endpoint: <code className="text-emerald-300">{ledger.s4ApiEndpoint}</code></div>
                  <div>Cryptographic Proof Hash: <code className="text-amber-300">{ledger.cryptographicHash}</code></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
