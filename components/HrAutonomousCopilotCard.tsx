import React, { useState } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  UserPlus,
  Clock,
  DollarSign,
  AlertTriangle,
  Shield,
  ShieldCheck,
  ShieldAlert,
  CheckCircle,
  CheckCircle2,
  Key,
  EyeOff,
  XCircle,
  Sparkles,
  Search,
  Filter,
  RefreshCw,
  Zap,
  Building2,
  Calendar,
  Award,
  BookOpen,
  FileText,
  Lock,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Globe,
  Activity,
  Layers,
  Send,
  AlertCircle,
  Sliders,
  Check,
  HelpCircle,
  HeartPulse,
  Scale,
  BarChart3
} from 'lucide-react';
import {
  HrHcmAutonomousCopilotReport,
  HrHcmWorkforceRiskItem,
  HrHcm50NlQuestionItem
} from '../types';
import { hrHcmService } from '../services/hrHcmService';

interface HrAutonomousCopilotCardProps {
  data?: HrHcmAutonomousCopilotReport | any;
}

export const HrAutonomousCopilotCard: React.FC<HrAutonomousCopilotCardProps> = ({ data }) => {
  const [report, setReport] = useState<HrHcmAutonomousCopilotReport | null>(
    data && data.metrics ? data : null
  );
  const [loading, setLoading] = useState<boolean>(!report);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'payroll_operations' | 'joiner_automation' | 'mover_automation' | 'leaver_automation' | 'payroll_root_cause' | 'manager_workforce' | 'nl_50_questions' | 'actions_engine' | 'approval_model' | 'cross_module' | 'ess_agent' | 'mss_agent' | 'talent_performance_ai' | 'training_certification' | 'workforce_analytics' | 'predictive_analytics' | 'workforce_planning' | 'labor_cost_variance' | 'security_privacy'
  >(
    data && (data.rolePermissions || data.fieldLevelMasking || data.ilmDataRetentionPolicies)
      ? 'security_privacy'
      : data && (data.explanationText || data.varianceDrivers || data.ficoCostPostings)
      ? 'labor_cost_variance'
      : data && (data.shortfallSummary || data.capacityCalculation || data.plantId)
      ? 'workforce_planning'
      : data && (data.headcountDemandForecast || data.governanceAndGuardrails || data.forecastCategory)
      ? 'predictive_analytics'
      : data && (data.totalHeadcount || data.workforceCostByDepartment || data.turnoverRatesByDepartment)
      ? 'workforce_analytics'
      : data && (data.overdueTrainings || data.safetyCertificationRenewals || data.techniciansLackingCertifications)
      ? 'training_certification'
      : data && (data.biasPolicyEnforcement || data.nineBoxSummary || data.queryType === 'candidate_match')
      ? 'talent_performance_ai'
      : data && (data.grossBreakdown || data.queryType === 'payslip' || data.leaveQuotas)
      ? 'ess_agent'
      : data && (data.pendingRequests || data.absentEmployees || data.totalTeamOvertimeHours)
      ? 'mss_agent'
      : data && (data.workflowId?.startsWith('MOVER') || data.previousRole)
      ? 'mover_automation'
      : data && (data.workflowId?.startsWith('LEAVER') || data.auditCertificate)
      ? 'leaver_automation'
      : data && (data.rankedIssues || data.totalsComparison)
      ? 'payroll_operations'
      : data && (data.workflowStages || data.hrApprovalControl)
      ? 'joiner_automation'
      : data && (data.correlatedFactors || data.plainLanguageSummary)
      ? 'payroll_root_cause'
      : data && (data.scheduledAbsences || data.staffingImpact)
      ? 'manager_workforce'
      : data && data.catalog && data.catalog.length === 50
      ? 'nl_50_questions'
      : 'overview'
  );

  const [essQueryType, setEssQueryType] = useState<string>(data && data.queryType ? data.queryType : 'payslip');
  const [mssQueryType, setMssQueryType] = useState<string>(data && data.queryType ? data.queryType : 'pending_approvals');
  const [predictiveCategory, setPredictiveCategory] = useState<string>('all');

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

  // Action Execution State
  const [actionType, setActionType] = useState<string>('approve_time_off');
  const [actionEmpId, setActionEmpId] = useState<string>('EMP-10024');
  const [actionReason, setActionReason] = useState<string>('Medical leave documents verified and supervisor pre-approved.');
  const [actionExecuting, setActionExecuting] = useState<boolean>(false);
  const [actionResult, setActionResult] = useState<any | null>(null);

  const managerData = data && (data.scheduledAbsences || data.staffingImpact)
    ? data
    : hrHcmService.getManagerWorkforceTeamOutReport();

  const payrollReport = data && (data.correlatedFactors || data.plainLanguageSummary)
    ? data
    : hrHcmService.getPayrollRootCauseAnalysisReport('PERNR-100088', 'Employee Self-Service');

  const payrollOpsData = data && (data.rankedIssues || data.totalsComparison)
    ? data
    : hrHcmService.getPayrollOperationsReport();

  const joinerData = data && (data.workflowStages || data.candidateId)
    ? data
    : hrHcmService.getJoinerAutomationReport();

  const moverData = data && (data.workflowId?.startsWith('MOVER') || data.previousRole)
    ? data
    : hrHcmService.getMoverAutomationReport();

  const leaverData = data && (data.workflowId?.startsWith('LEAVER') || data.auditCertificate)
    ? data
    : hrHcmService.getLeaverAutomationReport();

  // Load report if not passed
  React.useEffect(() => {
    if (!report) {
      setLoading(true);
      hrHcmService.getAutonomousCopilotReport('1010').then((res) => {
        setReport(res);
        setLoading(false);
      }).catch((err) => {
        console.error('Failed to load HR copilot report:', err);
        setLoading(false);
      });
    }
  }, [report]);

  // Questions catalog
  const catalog: HrHcm50NlQuestionItem[] = report?.catalog || hrHcmService.get50NlQuestionsCatalog().catalog;

  const categories = [
    'ALL',
    'Workforce & Org Analytics',
    'Payroll & Compensation',
    'Time & Attendance',
    'Compliance & Training',
    'Employee Lifecycle & Onboarding',
    'Talent & Performance'
  ];

  const filteredQuestions = catalog.filter((q) => {
    const matchesCategory = categoryFilter === 'ALL' || q.category.toLowerCase() === categoryFilter.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answerSummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleExecuteAction = async () => {
    setActionExecuting(true);
    setActionResult(null);
    try {
      const res = await hrHcmService.executeAutonomousAction(actionType, actionEmpId, {
        reason: actionReason,
        requestId: 'REQ-2026-9012',
        trainingModule: 'EHS-SAFETY-101',
        newAddress: '450 Innovation Way, Suite 300, San Jose, CA'
      });
      setActionResult(res);
    } catch (e: any) {
      setActionResult({
        success: false,
        message: e.message || 'Execution error'
      });
    } finally {
      setActionExecuting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 bg-slate-900 rounded-2xl border border-slate-800 text-center text-slate-300 space-y-4">
        <RefreshCw className="w-8 h-8 mx-auto animate-spin text-blue-400" />
        <p className="font-mono text-sm">Correlating Live S/4HANA HCM &amp; SuccessFactors OData Feeds...</p>
      </div>
    );
  }

  const metrics = report?.metrics || {
    totalHeadcount: 4850,
    openRequisitions: 142,
    payrollExceptionRatePct: 1.4,
    complianceTrainingRatePct: 96.8,
    turnoverRiskCount: 28,
    pendingTimeOffApprovals: 34,
    monthlyOvertimeSpend: '$184,500'
  };

  const risks = report?.risks || [];
  const crossModule = report?.crossModuleInsights || [];
  const approvalTiers = report?.approvalTiers || {
    readOnly: [],
    policyControlled: [],
    humanApprovalRequired: []
  };

  return (
    <div className="w-full bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl font-sans my-4">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">Autonomous SAP HR / HCM &amp; SuccessFactors Copilot</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                LIVE S/4 ODATA + SF
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Senior HR Operations, Payroll Analyst &amp; Workforce Analytics Intelligence Engine
            </p>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 flex items-center gap-2 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Human-in-Loop Policy Active</span>
          </div>
        </div>
      </div>

      {/* Mandatory Core Design Rule Banner: Consequential Employment Decisions */}
      <div className="bg-amber-950/30 border-b border-amber-800/50 p-3.5 px-5 flex items-start gap-3 text-xs text-amber-200">
        <Scale className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-amber-300 font-mono uppercase tracking-wide">
            Mandatory HR Governance Rule:
          </span>{' '}
          The AI Copilot executes routine administrative tasks (time off approvals, training assignments, address updates, payroll recalculations) but <strong className="text-amber-100 underline decoration-amber-500">NEVER autonomously executes consequential employment decisions</strong> (hiring, firing, promotion, compensation adjustments, disciplinary actions). All consequential decisions escalate to authorized human HR leadership.
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-800 bg-slate-900/60 overflow-x-auto text-xs font-mono">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-3 flex items-center gap-2 border-b-2 font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-indigo-500 text-indigo-400 bg-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          Workforce Dashboard &amp; Risks
        </button>

        <button
          onClick={() => setActiveTab('payroll_operations')}
          className={`px-4 py-3 flex items-center gap-2 border-b-2 font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'payroll_operations'
              ? 'border-indigo-500 text-indigo-400 bg-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <DollarSign className="w-4 h-4 text-rose-400" />
          Payroll Operations Audit &amp; Risk Ranking
        </button>

        <button
          onClick={() => setActiveTab('joiner_automation')}
          className={`px-4 py-3 flex items-center gap-2 border-b-2 font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'joiner_automation'
              ? 'border-indigo-500 text-indigo-400 bg-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserPlus className="w-4 h-4 text-emerald-400" />
          Joiner Automation Workflow
        </button>

        <button
          onClick={() => setActiveTab('mover_automation')}
          className={`px-4 py-3 flex items-center gap-2 border-b-2 font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'mover_automation'
              ? 'border-indigo-500 text-indigo-400 bg-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4 text-cyan-400" />
          Mover Automation Workflow
        </button>

        <button
          onClick={() => setActiveTab('leaver_automation')}
          className={`px-4 py-3 flex items-center gap-2 border-b-2 font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'leaver_automation'
              ? 'border-indigo-500 text-indigo-400 bg-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserX className="w-4 h-4 text-rose-400" />
          Leaver Automation Workflow
        </button>

        <button
          onClick={() => setActiveTab('payroll_root_cause')}
          className={`px-4 py-3 flex items-center gap-2 border-b-2 font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'payroll_root_cause'
              ? 'border-indigo-500 text-indigo-400 bg-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <DollarSign className="w-4 h-4 text-emerald-400" />
          Payroll Root-Cause Analysis
        </button>

        <button
          onClick={() => setActiveTab('manager_workforce')}
          className={`px-4 py-3 flex items-center gap-2 border-b-2 font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'manager_workforce'
              ? 'border-indigo-500 text-indigo-400 bg-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4 text-amber-400" />
          Manager Workforce Assistant (Team Out &amp; Staffing)
        </button>

        <button
          onClick={() => setActiveTab('nl_50_questions')}
          className={`px-4 py-3 flex items-center gap-2 border-b-2 font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'nl_50_questions'
              ? 'border-indigo-500 text-indigo-400 bg-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          50 HR Questions Catalog ({filteredQuestions.length})
        </button>

        <button
          onClick={() => setActiveTab('actions_engine')}
          className={`px-4 py-3 flex items-center gap-2 border-b-2 font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'actions_engine'
              ? 'border-indigo-500 text-indigo-400 bg-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-4 h-4" />
          Autonomous HR Actions
        </button>

        <button
          onClick={() => setActiveTab('approval_model')}
          className={`px-4 py-3 flex items-center gap-2 border-b-2 font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'approval_model'
              ? 'border-indigo-500 text-indigo-400 bg-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          3-Tier Governance Matrix
        </button>

        <button
          onClick={() => setActiveTab('ess_agent')}
          className={`px-4 py-3 flex items-center gap-2 border-b-2 font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'ess_agent'
              ? 'border-indigo-500 text-indigo-400 bg-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserCheck className="w-4 h-4 text-emerald-400" />
          Employee Self-Service (ESS)
        </button>

        <button
          onClick={() => setActiveTab('mss_agent')}
          className={`px-4 py-3 flex items-center gap-2 border-b-2 font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'mss_agent'
              ? 'border-indigo-500 text-indigo-400 bg-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4 text-purple-400" />
          Manager Self-Service (MSS)
        </button>

        <button
          onClick={() => setActiveTab('talent_performance_ai')}
          className={`px-4 py-3 flex items-center gap-2 border-b-2 font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'talent_performance_ai'
              ? 'border-indigo-500 text-indigo-400 bg-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award className="w-4 h-4 text-emerald-400" />
          Talent &amp; Performance AI
        </button>

        <button
          onClick={() => setActiveTab('training_certification')}
          className={`px-4 py-3 flex items-center gap-2 border-b-2 font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'training_certification'
              ? 'border-indigo-500 text-indigo-400 bg-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4 text-cyan-400" />
          Training &amp; Certification Agent
        </button>

        <button
          onClick={() => setActiveTab('workforce_analytics')}
          className={`px-4 py-3 flex items-center gap-2 border-b-2 font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'workforce_analytics'
              ? 'border-indigo-500 text-indigo-400 bg-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-purple-400" />
          Workforce Analytics
        </button>

        <button
          onClick={() => setActiveTab('predictive_analytics')}
          className={`px-4 py-3 flex items-center gap-2 border-b-2 font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'predictive_analytics'
              ? 'border-indigo-500 text-indigo-400 bg-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          Predictive HR Analytics
        </button>

        <button
          onClick={() => setActiveTab('workforce_planning')}
          className={`px-4 py-3 flex items-center gap-2 border-b-2 font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'workforce_planning'
              ? 'border-indigo-500 text-indigo-400 bg-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4 text-amber-400" />
          Workforce Planning
        </button>

        <button
          onClick={() => setActiveTab('labor_cost_variance')}
          className={`px-4 py-3 flex items-center gap-2 border-b-2 font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'labor_cost_variance'
              ? 'border-indigo-500 text-indigo-400 bg-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <DollarSign className="w-4 h-4 text-emerald-400" />
          HR + Finance Labor Cost
        </button>

        <button
          onClick={() => setActiveTab('security_privacy')}
          className={`px-4 py-3 flex items-center gap-2 border-b-2 font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'security_privacy'
              ? 'border-indigo-500 text-indigo-400 bg-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Shield className="w-4 h-4 text-rose-400" />
          HR Security & Privacy
        </button>

        <button
          onClick={() => setActiveTab('cross_module')}
          className={`px-4 py-3 flex items-center gap-2 border-b-2 font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'cross_module'
              ? 'border-indigo-500 text-indigo-400 bg-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          Cross-Module Correlations
        </button>
      </div>

      {/* TAB CONTENT 1: OVERVIEW & WORKFORCE RISKS */}
      {activeTab === 'overview' && (
        <div className="p-5 space-y-6">
          {/* Executive KPI Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Total Headcount</span>
              <div className="text-xl font-bold text-white mt-1 flex items-baseline gap-1">
                {metrics.totalHeadcount.toLocaleString()}
                <span className="text-[10px] font-mono text-emerald-400 font-normal">+2.4% MoM</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Open Requisitions</span>
              <div className="text-xl font-bold text-indigo-400 mt-1 flex items-baseline gap-1">
                {metrics.openRequisitions}
                <span className="text-[10px] font-mono text-slate-400 font-normal">Positions</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Payroll Exception %</span>
              <div className="text-xl font-bold text-amber-400 mt-1 flex items-baseline gap-1">
                {metrics.payrollExceptionRatePct}%
                <span className="text-[10px] font-mono text-emerald-400 font-normal">-0.8%</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Compliance Training</span>
              <div className="text-xl font-bold text-emerald-400 mt-1 flex items-baseline gap-1">
                {metrics.complianceTrainingRatePct}%
                <span className="text-[10px] font-mono text-emerald-400 font-normal">Target 95%</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Attrition Risk Count</span>
              <div className="text-xl font-bold text-rose-400 mt-1 flex items-baseline gap-1">
                {metrics.turnoverRiskCount}
                <span className="text-[10px] font-mono text-rose-400 font-normal">High Risk</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Overtime Monthly Spend</span>
              <div className="text-xl font-bold text-cyan-400 mt-1 flex items-baseline gap-1">
                {metrics.monthlyOvertimeSpend}
                <span className="text-[10px] font-mono text-slate-400 font-normal">MTD</span>
              </div>
            </div>
          </div>

          {/* Workforce Risks & Action Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Workforce Risks &amp; Prioritized Action Items ({risks.length})
              </h3>
              <span className="text-xs font-mono text-slate-400">
                Correlating HCM Infotypes 0001, 0008, 2001, 2002 &amp; SuccessFactors
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {risks.map((risk, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-900 rounded-xl border border-slate-800 hover:border-slate-700 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            risk.severity === 'CRITICAL'
                              ? 'bg-rose-950 text-rose-400 border border-rose-800'
                              : risk.severity === 'HIGH'
                              ? 'bg-amber-950 text-amber-400 border border-amber-800'
                              : 'bg-blue-950 text-blue-400 border border-blue-800'
                          }`}
                        >
                          {risk.severity}
                        </span>
                        <span className="font-mono text-xs text-indigo-300 font-bold">{risk.riskCategory}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-white mt-1">{risk.title}</h4>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                      {risk.affectedEmployeeOrDept}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{risk.description}</p>

                  <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-850 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                      <span>Business Impact:</span>
                      <span className="text-amber-300 font-medium">{risk.impactSummary}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300 font-mono text-[11px]">
                      <span>Recommended Action:</span>
                      <span className="text-emerald-400 font-bold">{risk.recommendedAction}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800/60">
                    <span>Governance Tier:</span>
                    <span
                      className={`font-bold ${
                        risk.governanceTier.includes('Tier 3') || risk.governanceTier.includes('Human Approval')
                          ? 'text-amber-400'
                          : risk.governanceTier.includes('Tier 2')
                          ? 'text-indigo-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {risk.governanceTier}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: PAYROLL OPERATIONS AUDIT */}
      {activeTab === 'payroll_operations' && (
        <div className="p-5 space-y-6">
          {/* Header Banner */}
          <div className="p-4 bg-gradient-to-r from-rose-950/60 via-slate-900 to-slate-900 rounded-xl border border-rose-800/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  CRITICAL CUTOFF AUDIT
                </span>
                <span className="text-xs font-mono text-slate-400">{payrollOpsData.period}</span>
              </div>
              <h3 className="text-base font-bold text-white mt-1">
                Payroll Operations Audit &amp; Issue Risk Ranking
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Company Code: <strong className="text-white">{payrollOpsData.companyCode}</strong> | Payroll Area: <strong className="text-white">{payrollOpsData.payrollArea}</strong> | Total Active PERNRs: <strong className="text-white">{payrollOpsData.totalEmployeesInRun}</strong>
              </p>
            </div>
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-right font-mono">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Bank Transfer Cutoff</div>
              <div className="text-sm font-bold text-rose-400 flex items-center gap-1.5 justify-end">
                <Clock className="w-4 h-4 text-rose-400 animate-pulse" />
                <span>{payrollOpsData.bankTransferCutoff}</span>
              </div>
            </div>
          </div>

          {/* Ranked Issues Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Payroll Operations Issues — Ranked by Financial Impact &amp; Deadline Risk
            </h4>
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-slate-900 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-3">Rank</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Count</th>
                    <th className="p-3">Financial Impact</th>
                    <th className="p-3">Deadline Risk</th>
                    <th className="p-3">Time Remaining</th>
                    <th className="p-3">Recommended SAP Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-950/60 font-mono">
                  {payrollOpsData.rankedIssues?.map((issue: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-3 font-bold text-slate-100">#{issue.rank}</td>
                      <td className="p-3 font-bold text-indigo-300">{issue.category}</td>
                      <td className="p-3 font-semibold text-slate-200">{issue.issueCount} PERNRs</td>
                      <td className="p-3 font-bold text-rose-300">${issue.financialImpact?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          issue.deadlineRisk === 'CRITICAL'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : issue.deadlineRisk === 'HIGH'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                        }`}>
                          {issue.deadlineRisk}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300">{issue.timeRemaining}</td>
                      <td className="p-3 font-sans text-slate-300">{issue.recommendedAction}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detailed Audit Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Failed Payroll Jobs */}
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
              <h5 className="text-xs font-bold text-rose-400 uppercase tracking-wider font-mono flex items-center justify-between">
                <span>Failed Payroll Background Jobs</span>
                <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[10px]">
                  {payrollOpsData.failedJobs?.length} Aborted
                </span>
              </h5>
              <div className="space-y-2">
                {payrollOpsData.failedJobs?.map((job: any, jIdx: number) => (
                  <div key={jIdx} className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1 font-mono text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-300">{job.jobName} ({job.jobId})</span>
                      <span className="text-slate-400">{job.failedAt}</span>
                    </div>
                    <p className="text-slate-300 font-sans text-xs">{job.errorMessage}</p>
                    <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-900">
                      <span>Affected PERNRs: <strong className="text-white">{job.affectedCount}</strong></span>
                      <span>Value: <strong className="text-rose-300">${job.financialValue?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Negative Net Pay Incidents */}
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
              <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono flex items-center justify-between">
                <span>Negative Net Pay Incidents</span>
                <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px]">
                  {payrollOpsData.negativeNetPayIncidents?.length} Employees
                </span>
              </h5>
              <div className="space-y-2">
                {payrollOpsData.negativeNetPayIncidents?.map((neg: any, nIdx: number) => (
                  <div key={nIdx} className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1 text-[11px]">
                    <div className="flex items-center justify-between font-mono">
                      <span className="font-bold text-white">{neg.employeeName} ({neg.employeeId})</span>
                      <span className="font-bold text-rose-400">Net: ${neg.calculatedNetPay?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <p className="text-slate-300">{neg.rootCause}</p>
                    <div className="text-[10px] font-mono text-slate-400">
                      Gross: ${neg.grossPay} • Taxes: ${neg.totalTaxes} • Garnishment (IT 0194): ${neg.garnishments}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Rejected Results & Master Data Mismatch */}
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
              <h5 className="text-xs font-bold text-indigo-400 uppercase tracking-wider font-mono flex items-center justify-between">
                <span>Rejected Results &amp; Master Data Inconsistencies</span>
                <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px]">
                  {(payrollOpsData.rejectedResults?.length || 0) + (payrollOpsData.masterDataInconsistencies?.length || 0)} Items
                </span>
              </h5>
              <div className="space-y-2 text-[11px]">
                {payrollOpsData.rejectedResults?.map((rej: any, rIdx: number) => (
                  <div key={rIdx} className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="font-bold text-amber-300 font-mono">{rej.employeeName} ({rej.employeeId}):</span> <span className="text-slate-300">{rej.reason}</span>
                  </div>
                ))}
                {payrollOpsData.masterDataInconsistencies?.map((mst: any, mIdx: number) => (
                  <div key={mIdx} className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="font-bold text-indigo-300 font-mono">{mst.employeeName} ({mst.employeeId}) [{mst.infotype}]:</span> <span className="text-slate-300">{mst.details}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Pre vs Post Correction Totals Comparison */}
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
              <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono flex items-center justify-between">
                <span>Pre vs Post Correction Payroll Reconciliation</span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px]">
                  +${payrollOpsData.totalsComparison?.variance?.grossDelta?.toLocaleString('en-US', { minimumFractionDigits: 2 })} Net Delta
                </span>
              </h5>
              <div className="space-y-2 font-mono text-[11px]">
                <div className="flex justify-between p-2 bg-slate-950 rounded border border-slate-800">
                  <span className="text-slate-400">Pre-Correction Gross:</span>
                  <span className="text-slate-200">${payrollOpsData.totalsComparison?.preCorrection?.totalGross?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-950 rounded border border-slate-800">
                  <span className="text-slate-400">Post-Correction Gross:</span>
                  <span className="text-emerald-400 font-bold">${payrollOpsData.totalsComparison?.postCorrection?.totalGross?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-950 rounded border border-slate-800">
                  <span className="text-slate-400">Net Disbursed Delta:</span>
                  <span className="text-emerald-300 font-bold">+${payrollOpsData.totalsComparison?.variance?.netDisbursedDelta?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: JOINER AUTOMATION WORKFLOW */}
      {activeTab === 'joiner_automation' && (
        <div className="p-5 space-y-6">
          {/* Joiner Banner */}
          <div className="p-4 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 rounded-xl border border-emerald-800/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  JOINER AUTOMATION WORKFLOW
                </span>
                <span className="text-xs font-mono text-slate-400">{joinerData.workflowId}</span>
              </div>
              <h3 className="text-base font-bold text-white mt-1">
                New-Hire End-to-End Orchestration: {joinerData.candidateName}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Target Role: <strong className="text-white">{joinerData.targetRoleTitle}</strong> | Dept: <strong className="text-white">{joinerData.targetDepartment}</strong> | Generated PERNR: <strong className="text-emerald-400 font-mono">{joinerData.generatedPernr}</strong>
              </p>
            </div>
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-right font-mono">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Workflow Completion</div>
              <div className="text-sm font-bold text-emerald-400">
                {joinerData.completionPercentage}% ({joinerData.completedStageCount}/{joinerData.totalStages} Stages)
              </div>
            </div>
          </div>

          {/* HR Approval Control Box */}
          <div className="p-4 bg-slate-900 rounded-xl border border-amber-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-amber-400 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-white uppercase font-mono">
                  HR Approval Control Governance
                </h4>
                <p className="text-xs text-slate-300">
                  {joinerData.hrApprovalControl?.status} — Assigned to <strong>{joinerData.hrApprovalControl?.approverName}</strong> (Sign-off deadline: {joinerData.hrApprovalControl?.signoffDeadline})
                </p>
              </div>
            </div>
            <button
              onClick={async () => {
                setActionExecuting(true);
                try {
                  const res = await hrHcmService.executeAutonomousAction('trigger_onboarding_checklist', joinerData.generatedPernr, {
                    reason: 'HR Admin Final Joiner Sign-off Approved'
                  });
                  setActionResult(res);
                  setActiveTab('actions_engine');
                } finally {
                  setActionExecuting(false);
                }
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-md whitespace-nowrap"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Approve Final Joiner Sign-off</span>
            </button>
          </div>

          {/* 10-Stage Workflow Sequence */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-emerald-400" />
              10-Stage Cross-Agent Joiner Workflow Timeline
            </h4>
            <div className="space-y-2">
              {joinerData.workflowStages?.map((stage: any, idx: number) => (
                <div key={idx} className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold flex-shrink-0 mt-0.5 ${
                      stage.status === 'COMPLETED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : stage.status === 'IN_PROGRESS'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {stage.stageNumber}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white">{stage.stageName}</span>
                        <span className="text-[10px] font-mono text-indigo-400">{stage.sapSystem}</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">{stage.details}</p>
                      <div className="text-[10px] font-mono text-slate-400 mt-1 flex items-center gap-2">
                        <span>Agent: <strong className="text-slate-200">{stage.agentResponsible}</strong></span>
                        <span>• {stage.timestamp}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold whitespace-nowrap ${
                    stage.status === 'COMPLETED'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : stage.status === 'IN_PROGRESS'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}>
                    {stage.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Cross Agent Collaborators */}
          <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              Multi-Agent Collaboration Network (HR, Security, Basis, IT)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              {joinerData.crossAgentAgents?.map((ag: any, aIdx: number) => (
                <div key={aIdx} className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <div className="font-bold text-indigo-300">{ag.agentName}</div>
                  <div className="text-slate-400 text-[11px] font-sans mt-0.5">{ag.role}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: MOVER AUTOMATION WORKFLOW */}
      {activeTab === 'mover_automation' && (
        <div className="p-5 space-y-6">
          {/* Header Summary Card */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-gradient-to-r from-slate-900 via-cyan-950/30 to-slate-900 rounded-xl border border-cyan-800/40 shadow-lg">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white font-mono">
                  Mover Automation — Role &amp; Position Change
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {moverData.workflowId || 'MOVER-2026-8802'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-2">
                <strong>Employee</strong>: {moverData.employeeName} (<code className="text-cyan-300">{moverData.employeeId}</code>) | <strong>Effective Date</strong>: {moverData.effectiveDate}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-xs font-mono text-slate-400">
                <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                  From: <strong>{moverData.previousRole}</strong>
                </span>
                <ChevronRight className="w-4 h-4 text-cyan-400" />
                <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-200 border border-cyan-800 font-bold">
                  To: <strong>{moverData.newRole}</strong>
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1 font-mono text-xs">
              <span className="text-slate-400">Completion Status</span>
              <span className="text-lg font-bold text-emerald-400">
                {moverData.completionPercentage}% ({moverData.completedStageCount}/{moverData.totalStages} Stages)
              </span>
              <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded text-[10px]">
                {moverData.overallStatus}
              </span>
            </div>
          </div>

          {/* 9-Stage Mover Sequence */}
          <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                9-Stage Cross-Functional Mover Sequence
              </h4>
              <span className="text-[11px] text-slate-400 font-mono">HR + Security + FI/CO + Basis</span>
            </div>

            <div className="space-y-2.5">
              {moverData.workflowStages?.map((stage: any, idx: number) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-lg border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    stage.status === 'COMPLETED'
                      ? 'bg-slate-950/80 border-slate-800/80'
                      : stage.status === 'IN_PROGRESS'
                      ? 'bg-amber-950/20 border-amber-800/50'
                      : 'bg-slate-950/30 border-slate-900'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono shrink-0 ${
                      stage.status === 'COMPLETED'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : stage.status === 'IN_PROGRESS'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800 animate-pulse'
                        : 'bg-slate-900 text-slate-500 border border-slate-800'
                    }`}>
                      {stage.stageNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-100 font-mono">{stage.stageName}</span>
                        <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-slate-900 text-cyan-300 border border-slate-800">
                          {stage.sapSystem}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{stage.details}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[11px] font-mono text-slate-500">
                        <span>Agent: <strong className="text-slate-300">{stage.agentResponsible}</strong></span>
                        <span>• {stage.timestamp}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold whitespace-nowrap self-start sm:self-auto ${
                    stage.status === 'COMPLETED'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : stage.status === 'IN_PROGRESS'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}>
                    {stage.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Cross Agent Collaborators */}
          <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              Multi-Agent Collaboration Network (HR, Security, FI/CO, Basis)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              {moverData.crossAgentAgents?.map((ag: any, aIdx: number) => (
                <div key={aIdx} className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <div className="font-bold text-cyan-300">{ag.agentName}</div>
                  <div className="text-slate-400 text-[11px] font-sans mt-0.5">{ag.role}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: LEAVER AUTOMATION WORKFLOW */}
      {activeTab === 'leaver_automation' && (
        <div className="p-5 space-y-6">
          {/* Header Summary Card */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-gradient-to-r from-slate-900 via-rose-950/30 to-slate-900 rounded-xl border border-rose-800/40 shadow-lg">
            <div>
              <div className="flex items-center gap-2">
                <UserX className="w-5 h-5 text-rose-400" />
                <h3 className="text-sm font-bold text-white font-mono">
                  Leaver Automation — Zero-Trust Offboarding
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
                  {leaverData.workflowId || 'LEAVER-2026-9901'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-2">
                <strong>Employee</strong>: {leaverData.employeeName} (<code className="text-rose-300">{leaverData.employeeId}</code>) | <strong>Department</strong>: {leaverData.department} | <strong>Termination Date</strong>: {leaverData.terminationDate}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-xs font-mono text-slate-400">
                <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                  Offboarding Type: <strong>Voluntary Resignation</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-950 text-rose-300 border border-rose-900">
                  SU01 Admin Lock: <strong>UFLAG = 64 (Active)</strong>
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1 font-mono text-xs">
              <span className="text-slate-400">Completion Status</span>
              <span className="text-lg font-bold text-emerald-400">
                {leaverData.completionPercentage}% ({leaverData.completedStageCount}/{leaverData.totalStages} Stages)
              </span>
              <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded text-[10px]">
                {leaverData.overallStatus}
              </span>
            </div>
          </div>

          {/* SOC-2 Audit Certificate Box */}
          {leaverData.auditCertificate && (
            <div className="p-4 bg-emerald-950/20 border border-emerald-800/60 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs font-mono">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>SOC-2 &amp; ISO 27001 Zero-Trust Offboarding Audit Certificate</span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-900/80 text-emerald-200 border border-emerald-700 rounded text-[10px] font-mono font-bold">
                  {leaverData.auditCertificate.status}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono">
                Certificate ID: <code className="text-emerald-300">{leaverData.auditCertificate.certificateId}</code> | Verified: {leaverData.auditCertificate.issuedAt}
              </p>
              <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                {leaverData.auditCertificate.complianceFrameworks?.map((fw: string, fIdx: number) => (
                  <span key={fIdx} className="px-2 py-0.5 rounded bg-slate-900 text-emerald-300 border border-slate-800">
                    ✓ {fw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 10-Stage Leaver Sequence */}
          <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
                <Layers className="w-4 h-4 text-rose-400" />
                10-Stage Zero-Trust Offboarding Sequence
              </h4>
              <span className="text-[11px] text-slate-400 font-mono">HR + Security + Basis + IT + Audit</span>
            </div>

            <div className="space-y-2.5">
              {leaverData.workflowStages?.map((stage: any, idx: number) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-lg border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    stage.status === 'COMPLETED'
                      ? 'bg-slate-950/80 border-slate-800/80'
                      : stage.status === 'IN_PROGRESS'
                      ? 'bg-amber-950/20 border-amber-800/50'
                      : 'bg-slate-950/30 border-slate-900'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono shrink-0 ${
                      stage.status === 'COMPLETED'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : stage.status === 'IN_PROGRESS'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800 animate-pulse'
                        : 'bg-slate-900 text-slate-500 border border-slate-800'
                    }`}>
                      {stage.stageNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-100 font-mono">{stage.stageName}</span>
                        <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-slate-900 text-rose-300 border border-slate-800">
                          {stage.sapSystem}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{stage.details}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[11px] font-mono text-slate-500">
                        <span>Agent: <strong className="text-slate-300">{stage.agentResponsible}</strong></span>
                        <span>• {stage.timestamp}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold whitespace-nowrap self-start sm:self-auto ${
                    stage.status === 'COMPLETED'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : stage.status === 'IN_PROGRESS'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}>
                    {stage.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Cross Agent Collaborators */}
          <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              Multi-Agent Collaboration Network (HR, Security, Basis, FI/CO, IT, Audit)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              {leaverData.crossAgentAgents?.map((ag: any, aIdx: number) => (
                <div key={aIdx} className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <div className="font-bold text-rose-300">{ag.agentName}</div>
                  <div className="text-slate-400 text-[11px] font-sans mt-0.5">{ag.role}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: MANAGER WORKFORCE ASSISTANT */}
      {activeTab === 'manager_workforce' && (
        <div className="p-5 space-y-6">
          {/* Header Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-900/90 rounded-xl border border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white font-mono">
                  {managerData.teamName || 'Customer Support Team Alpha'} — {managerData.periodLabel || 'Next Week (August 17 – August 23, 2026)'}
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                <strong>Manager</strong>: {managerData.managerName || 'Sarah Jenkins'} | <strong>Org Unit</strong>: {managerData.teamOrgUnit || 'Org Unit 500012'} | <strong>Total Headcount</strong>: {managerData.totalTeamHeadcount || 12}
              </p>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-indigo-950/80 border border-indigo-800/80 text-indigo-300 text-xs font-mono text-center shrink-0">
              <span className="text-[10px] text-slate-400 uppercase block">S/4 Infotype Sync</span>
              <span className="font-bold text-emerald-400">Infotype 2001 (Absences)</span>
            </div>
          </div>

          {/* Critical Staffing Warning Box */}
          {managerData.criticalWarning?.hasWarning && (
            <div className="p-4 bg-rose-950/40 border border-rose-800/80 rounded-xl space-y-2 shadow-lg shadow-rose-950/30">
              <div className="flex items-center gap-2.5 text-rose-300 font-bold text-sm">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 animate-pulse" />
                <span>{managerData.criticalWarning.title || 'Critical Overlapping Absence Warning'}</span>
                <span className="ml-auto px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-rose-900/80 text-rose-200 border border-rose-700">
                  CRITICAL BOTTLENECK
                </span>
              </div>
              <p className="text-xs text-rose-100 font-semibold leading-relaxed">
                {managerData.criticalWarning.message || 'Three members of the same support team are scheduled to be out on Wednesday, leaving only 55% staffing capacity.'}
              </p>
              <div className="flex flex-wrap gap-4 text-xs font-mono text-rose-200/80 pt-1">
                <div>
                  <span className="text-rose-400 font-bold">Affected Date:</span> {managerData.criticalWarning.affectedDate || 'Wednesday, August 19, 2026'}
                </div>
                <div>
                  <span className="text-rose-400 font-bold">Scheduled Absences:</span> {managerData.criticalWarning.absentEmployeesOnWednesday?.join(', ') || 'John Doe, Mark Taylor, Michael Chen'}
                </div>
              </div>
            </div>
          )}

          {/* Scheduled Absences Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              Scheduled Team Absences Next Week
            </h4>
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-slate-900 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-3">Employee</th>
                    <th className="p-3">Dates</th>
                    <th className="p-3">Leave Type (Policy Governed)</th>
                    <th className="p-3">Staffing &amp; Overlapping Absences</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-950/60">
                  {managerData.scheduledAbsences?.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-slate-100">{item.employeeName}</div>
                        <div className="text-[11px] font-mono text-indigo-400">{item.employeeId} • {item.roleTitle}</div>
                      </td>
                      <td className="p-3 font-mono text-slate-200 font-semibold">
                        {item.dates}
                      </td>
                      <td className="p-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                          item.leaveTypeDisclosed === false
                            ? 'bg-amber-950 text-amber-300 border border-amber-800/80'
                            : 'bg-indigo-950 text-indigo-300 border border-indigo-800/80'
                        }`}>
                          {item.leaveType}
                        </span>
                        {item.policyNotes && (
                          <div className="text-[11px] text-slate-400 italic mt-1">{item.policyNotes}</div>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[11px] text-slate-400">Overlaps with:</span>
                          {item.overlappingEmployees?.map((emp: string, eIdx: number) => (
                            <span key={eIdx} className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-800/60">
                              {emp}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Daily Staffing & Capacity Breakdown */}
          <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center justify-between">
              <span className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                Daily Team Staffing &amp; Capacity Breakdown
              </span>
              <span className="text-slate-400 text-[10px]">Team Target: ≥80% Capacity</span>
            </h4>
            <div className="space-y-2.5">
              {managerData.staffingImpact?.dailyBreakdown?.map((day: any, idx: number) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className={`font-bold flex items-center gap-2 ${day.critical ? 'text-rose-400' : 'text-slate-200'}`}>
                      {day.critical && <AlertCircle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />}
                      {day.day}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">{day.present} / {day.total} Present ({day.absent?.length} Absent)</span>
                      <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                        day.capacityPct < 60
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : day.capacityPct < 80
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}>
                        {day.capacityPct}% Capacity
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full transition-all duration-500 ${
                        day.capacityPct < 60 ? 'bg-rose-500' : day.capacityPct < 80 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${day.capacityPct}%` }}
                    />
                  </div>
                  {day.absent?.length > 0 && (
                    <div className="text-[11px] text-slate-400 font-mono">
                      Out: <span className="text-slate-300">{day.absent.join(', ')}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Manager Actions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Recommended Manager Actions
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {managerData.recommendedActions?.map((action: any, idx: number) => (
                <div key={idx} className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white">{action.title}</span>
                      <span className="text-[10px] font-mono text-slate-400">{action.sapTcode}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {action.description}
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      setActionExecuting(true);
                      setActionType(action.actionType);
                      try {
                        const res = await hrHcmService.executeAutonomousAction(action.actionType, 'PERNR-100012', {
                          reason: action.description
                        });
                        setActionResult(res);
                        setActiveTab('actions_engine');
                      } finally {
                        setActionExecuting(false);
                      }
                    }}
                    className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Execute {action.title}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: 50 HR QUESTIONS CATALOG */}
      {activeTab === 'nl_50_questions' && (
        <div className="p-5 space-y-5">
          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900 p-3.5 rounded-xl border border-slate-800">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search across 50 HR questions e.g. payroll, headcount, attrition, overtime, onboarding..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium transition-colors whitespace-nowrap ${
                    categoryFilter === cat
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Questions Accordion List */}
          <div className="space-y-2.5">
            {filteredQuestions.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/50 rounded-xl border border-slate-800 text-slate-400 font-mono text-xs">
                No HR questions matched filter "{searchQuery}". Try clearing your search.
              </div>
            ) : (
              filteredQuestions.map((item) => {
                const isExpanded = expandedQuestionId === item.id;
                return (
                  <div
                    key={item.id}
                    className="bg-slate-900/90 rounded-xl border border-slate-800 hover:border-slate-700 transition-all overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedQuestionId(isExpanded ? null : item.id)}
                      className="w-full p-3.5 text-left flex items-start justify-between gap-3 hover:bg-slate-850/50 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-indigo-400 font-bold bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                            {item.id}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">{item.category}</span>
                          <span className="font-mono text-[10px] text-slate-500">
                            S/4 Service: <code className="text-slate-300">{item.sapModuleService}</code>
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-white">{item.question}</h4>
                      </div>
                      <span className="text-slate-400 font-mono text-xs shrink-0 pt-1">
                        {isExpanded ? '▲ Hide' : '▼ Expand'}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="p-4 bg-slate-950 border-t border-slate-800/80 space-y-3 text-xs">
                        <div>
                          <span className="font-mono text-[10px] text-emerald-400 uppercase font-bold block mb-1">
                            Live Execution Answer Summary
                          </span>
                          <p className="text-slate-200 leading-relaxed bg-slate-900 p-3 rounded-lg border border-slate-800">
                            {item.answerSummary}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-[11px]">
                          <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-850">
                            <span className="text-slate-400 block text-[10px]">Target Personnel / Dept Scope:</span>
                            <span className="text-indigo-300 font-semibold">{item.targetScope}</span>
                          </div>
                          <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-850">
                            <span className="text-slate-400 block text-[10px]">Governance &amp; Action Tier:</span>
                            <span
                              className={`font-semibold ${
                                item.governanceTier.includes('Tier 3')
                                  ? 'text-amber-400'
                                  : item.governanceTier.includes('Tier 2')
                                  ? 'text-indigo-400'
                                  : 'text-emerald-400'
                              }`}
                            >
                              {item.governanceTier}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: AUTONOMOUS HR ACTIONS ENGINE */}
      {activeTab === 'actions_engine' && (
        <div className="p-5 space-y-6">
          <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-indigo-400" />
                  Policy-Controlled HR Administrative Operations
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Execute authorized Level 2 administrative actions with full audit trail in S/4HANA &amp; SuccessFactors
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono text-[11px]">
                Tier 2 Policy Engine
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300 block">Select HR Administrative Action</label>
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                >
                  <option value="approve_time_off">Approve Pending Time-Off Request (PA2001)</option>
                  <option value="trigger_payroll_recalculation">Trigger Off-Cycle Payroll Recalculation</option>
                  <option value="update_time_sheet">Update Employee Time Sheet Record (CAT2)</option>
                  <option value="assign_compliance_training">Assign Mandatory Compliance Training</option>
                  <option value="update_employee_address">Update Employee Address (Infotype 0006)</option>
                  <option value="send_manager_reminder">Send Manager Overdue Approval Reminder</option>
                  <option value="trigger_onboarding_checklist">Trigger Employee Onboarding Checklist</option>
                  <option value="escalate_consequential_decision">Escalate Consequential Decision to Human HR Leader</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300 block">Target Employee Personnel Number</label>
                <input
                  type="text"
                  value={actionEmpId}
                  onChange={(e) => setActionEmpId(e.target.value)}
                  placeholder="e.g. EMP-10024"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300 block">Action Justification / Policy Details</label>
              <textarea
                rows={2}
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <button
              onClick={handleExecuteAction}
              disabled={actionExecuting}
              className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-lg font-mono text-xs font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {actionExecuting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Executing Action in S/4HANA HCM...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Execute Administrative Action with Live Verification
                </>
              )}
            </button>

            {/* Execution Result Box */}
            {actionResult && (
              <div
                className={`p-4 rounded-xl border space-y-2 font-mono text-xs ${
                  actionResult.success
                    ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
                    : 'bg-amber-950/60 border-amber-800 text-amber-200'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-2">
                    {actionResult.success ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    )}
                    {actionResult.success ? 'EXECUTION SUCCESSFUL' : 'POLICY GOVERNANCE ESCALATION'}
                  </span>
                  <span className="text-[10px] text-slate-400">ID: {actionResult.actionId || 'ACT-901'}</span>
                </div>

                <p className="text-xs leading-relaxed">{actionResult.message}</p>

                {actionResult.auditTrailId && (
                  <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                    <span>Audit Trail ID: <strong className="text-white">{actionResult.auditTrailId}</strong></span>
                    <span>Status: <strong className="text-emerald-400">{actionResult.status || 'COMPLETED'}</strong></span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: 3-TIER GOVERNANCE MATRIX */}
      {activeTab === 'approval_model' && (
        <div className="p-5 space-y-5">
          <div className="text-xs text-slate-300 leading-relaxed bg-slate-900 p-4 rounded-xl border border-slate-800">
            <h3 className="font-bold text-white text-sm mb-1">SAP HR / HCM Recommended Approval Model</h3>
            <p className="text-slate-400">
              To ensure compliance with global employment laws and company HR policies, agentic capabilities are segmented into 3 strict operational tiers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tier 1 */}
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <h4 className="font-bold text-xs text-emerald-400 uppercase tracking-wider font-mono">
                  Tier 1: Read-Only (Autonomous)
                </h4>
              </div>
              <ul className="text-xs space-y-2 text-slate-300 list-disc list-inside">
                <li>Workforce headcount &amp; org chart queries</li>
                <li>Payroll discrepancy &amp; tax calculation checks</li>
                <li>Time &amp; attendance balance inquiries</li>
                <li>Compliance training completion tracking</li>
                <li>Attrition &amp; flight risk identification</li>
                <li>Workforce shortage forecasting</li>
              </ul>
            </div>

            {/* Tier 2 */}
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <Zap className="w-4 h-4 text-indigo-400" />
                <h4 className="font-bold text-xs text-indigo-400 uppercase tracking-wider font-mono">
                  Tier 2: Policy-Controlled Administrative
                </h4>
              </div>
              <ul className="text-xs space-y-2 text-slate-300 list-disc list-inside">
                <li>Approve routine time-off requests</li>
                <li>Trigger off-cycle payroll recalculations</li>
                <li>Assign mandatory EHS safety training</li>
                <li>Update address/contact details</li>
                <li>Send automated manager reminders</li>
                <li>Trigger onboarding checklists</li>
              </ul>
            </div>

            {/* Tier 3 */}
            <div className="p-4 bg-amber-950/20 rounded-xl border border-amber-800/60 space-y-3">
              <div className="flex items-center gap-2 border-b border-amber-800/60 pb-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <h4 className="font-bold text-xs text-amber-400 uppercase tracking-wider font-mono">
                  Tier 3: Human Approval Required
                </h4>
              </div>
              <p className="text-[11px] text-amber-200/90 font-semibold mb-2">
                Consequential Employment Decisions (STRICT HUMAN GATE):
              </p>
              <ul className="text-xs space-y-2 text-slate-300 list-disc list-inside">
                <li>Hiring &amp; job offer approvals</li>
                <li>Employment termination &amp; lay-offs</li>
                <li>Promotions &amp; job title shifts</li>
                <li>Base salary &amp; bonus compensation changes</li>
                <li>Disciplinary actions &amp; performance warnings</li>
                <li>Executive severance packages</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: CROSS-MODULE CORRELATIONS */}
      {activeTab === 'cross_module' && (
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Cross-Module SAP HCM Intelligence (HR + PP + PM + FI + Security)
            </h3>
            <span className="text-xs font-mono text-slate-400">Live Enterprise Correlation</span>
          </div>

          <div className="space-y-3">
            {crossModule.map((item, idx) => (
              <div key={idx} className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-indigo-300">{item.moduleCombination}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-950 text-slate-300 border border-slate-800">
                    {item.impactLevel}
                  </span>
                </div>
                <p className="text-xs text-slate-200 font-semibold">{item.finding}</p>
                <div className="p-2.5 bg-slate-950 rounded-lg text-xs font-mono text-slate-300">
                  <span className="text-slate-400 text-[10px] block">Cross-System Recommendation:</span>
                  <span className="text-emerald-400 font-bold">{item.actionRecommendation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: PAYROLL ROOT-CAUSE ANALYSIS */}
      {activeTab === 'payroll_root_cause' && (
        <div className="p-5 space-y-6">
          {/* Header & Auth Badge */}
          <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">SAP HR Payroll Root-Cause Analysis Engine</h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Variance Correlation: {payrollReport.currentPeriod} vs {payrollReport.previousPeriod} | PERNR {payrollReport.employeeId} ({payrollReport.employeeName})
              </p>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="px-2.5 py-1 rounded bg-slate-950 text-slate-300 border border-slate-800 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                {payrollReport.authorizationObject || 'P_ORGIN'}
              </span>
              <span className={`px-2.5 py-1 rounded border font-bold ${
                payrollReport.isAuthorized !== false
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                  : 'bg-rose-950/60 text-rose-400 border-rose-800/60'
              }`}>
                {payrollReport.authorizationStatus || 'AUTHORIZED'}
              </span>
            </div>
          </div>

          {payrollReport.isAuthorized === false ? (
            <div className="p-6 bg-rose-950/30 border border-rose-800/60 rounded-xl text-center space-y-3">
              <ShieldAlert className="w-10 h-10 text-rose-400 mx-auto" />
              <h4 className="text-base font-bold text-rose-200">Sensitive Payroll Access Restricted</h4>
              <p className="text-xs text-slate-300 max-w-lg mx-auto">
                {payrollReport.restrictionMessage}
              </p>
            </div>
          ) : (
            <>
              {/* Plain Language Summary Highlight Box */}
              <div className="p-4 bg-emerald-950/30 border border-emerald-800/50 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                    Plain-Language HR Correlation Outcome
                  </span>
                </div>
                <p className="text-sm text-emerald-100 font-semibold leading-relaxed">
                  "{payrollReport.plainLanguageSummary}"
                </p>
              </div>

              {/* Paycheck Variance Comparison Overview */}
              {payrollReport.grossPaySummary && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Gross Pay Comparison</span>
                    <div className="text-lg font-bold text-white flex items-baseline gap-2">
                      ${payrollReport.grossPaySummary.currentGross.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      <span className="text-xs font-mono text-slate-400 font-normal">
                        (Was ${payrollReport.grossPaySummary.previousGross.toLocaleString('en-US', { minimumFractionDigits: 2 })})
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-tight">
                      {payrollReport.grossPaySummary.status}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Total Deductions</span>
                    <div className="text-lg font-bold text-amber-300 flex items-baseline gap-2">
                      ${payrollReport.totalDeductionsSummary.currentDeductions.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      <span className="text-xs font-mono text-amber-400/80 font-normal">
                        (+$150.00 Adjustment)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-tight">
                      {payrollReport.totalDeductionsSummary.status}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Net Pay Impact</span>
                    <div className="text-lg font-bold text-rose-400 flex items-baseline gap-2">
                      ${payrollReport.netPaySummary.currentNet.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      <span className="text-xs font-mono text-rose-400 font-bold">
                        (-$420.00 MoM)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-tight">
                      {payrollReport.netPaySummary.status}
                    </p>
                  </div>
                </div>
              )}

              {/* Full 9-Factor Correlation Matrix Table */}
              {payrollReport.correlatedFactors && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-indigo-400" />
                      Complete 9-Factor Payroll Correlation Matrix
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400">
                      S/4HANA Payroll Engine: {payrollReport.s4PayrollClusterRef}
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] border-b border-slate-800">
                        <tr>
                          <th className="p-3"># Factor Name</th>
                          <th className="p-3">July 2026</th>
                          <th className="p-3">August 2026</th>
                          <th className="p-3">Variance</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">SAP Infotype &amp; Explanation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono">
                        {payrollReport.correlatedFactors.map((factor: any) => (
                          <tr key={factor.factorNumber} className="hover:bg-slate-800/30 transition-colors">
                            <td className="p-3 font-bold text-white whitespace-nowrap">
                              {factor.factorNumber}. {factor.factorName}
                            </td>
                            <td className="p-3 text-slate-300">
                              ${factor.previousAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="p-3 text-slate-300">
                              ${factor.currentAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="p-3 font-bold whitespace-nowrap">
                              <span className={
                                factor.variance < 0 ? 'text-rose-400' :
                                factor.variance > 0 ? 'text-amber-400' : 'text-slate-400'
                              }>
                                {factor.varianceFormatted}
                              </span>
                            </td>
                            <td className="p-3 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                factor.status === 'Unchanged'
                                  ? 'bg-slate-800 text-slate-300'
                                  : factor.status === 'Decreased'
                                  ? 'bg-rose-950 text-rose-300 border border-rose-800/60'
                                  : 'bg-amber-950 text-amber-300 border border-amber-800/60'
                              }`}>
                                {factor.status}
                              </span>
                            </td>
                            <td className="p-3 text-slate-300 font-sans text-xs">
                              <span className="font-mono text-indigo-300 text-[11px] font-bold block">
                                {factor.sapInfotype}
                              </span>
                              {factor.explanation}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* TAB CONTENT: EMPLOYEE SELF-SERVICE (ESS) */}
      {activeTab === 'ess_agent' && (() => {
        const activeEss = hrHcmService.getEssAgentReport(essQueryType);
        return (
          <div className="p-5 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-900/80 rounded-xl border border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-400" />
                  Employee Self-Service (ESS) Conversational Hub
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Identity: <span className="font-mono text-emerald-300 font-bold">{activeEss.employeeName} ({activeEss.employeeId})</span> | S/4HANA Infotype Authorization: <span className="font-mono text-indigo-300">P_ORGIN</span>
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/60 self-start sm:self-auto">
                LIVE S/4HANA PA30 CONNECTED
              </span>
            </div>

            {/* ESS Quick Query Buttons (10 Conversational ESS Tasks) */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono font-bold uppercase text-slate-400 tracking-wider block">Select ESS Self-Service Query:</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'payslip', label: 'Show my payslip' },
                  { id: 'phone', label: 'Update my phone number' },
                  { id: 'address', label: 'Change my address' },
                  { id: 'vacation', label: 'Show my vacation balance' },
                  { id: 'submit_leave', label: 'Submit leave' },
                  { id: 'benefits', label: 'Show my benefits' },
                  { id: 'tax_document', label: 'Where can I find my tax document?' },
                  { id: 'training', label: 'What training is assigned to me?' },
                  { id: 'hrbp', label: 'Who is my HR business partner?' },
                  { id: 'goals', label: 'Show my goals' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setEssQueryType(item.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                      essQueryType === item.id
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-600 font-bold shadow-sm'
                        : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    "{item.label}"
                  </button>
                ))}
              </div>
            </div>

            {/* ESS Query Active Content View */}
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-4 font-mono text-xs">
              {essQueryType === 'payslip' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Payslip Statement</span>
                      <h4 className="text-sm font-bold text-white">{activeEss.period}</h4>
                    </div>
                    <a
                      href={activeEss.pdfDownloadUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Download Official Payslip PDF
                    </a>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 uppercase">Gross Pay</span>
                      <div className="text-base font-bold text-white mt-0.5">${activeEss.grossPay.toFixed(2)}</div>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 uppercase">Taxes & Deductions</span>
                      <div className="text-base font-bold text-rose-400 mt-0.5">-${(activeEss.taxWithholding + activeEss.deductionsAndBenefits).toFixed(2)}</div>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-lg border border-emerald-900/50 bg-emerald-950/20">
                      <span className="text-[10px] text-emerald-400 uppercase font-bold">Net Direct Deposit</span>
                      <div className="text-base font-bold text-emerald-300 mt-0.5">${activeEss.netPay.toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] uppercase text-slate-400 font-bold">Gross Earnings Breakdown (S/4HANA Payroll)</span>
                    <div className="space-y-1">
                      {activeEss.grossBreakdown.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-slate-950/60 rounded border border-slate-800/60">
                          <span className="text-slate-300">{item.label} <span className="text-[10px] text-indigo-400">({item.infotype})</span></span>
                          <span className="font-bold text-white">${item.amount.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {essQueryType === 'vacation' && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Vacation & Absence Quota Balances (IT2006)</h4>
                  <div className="space-y-2">
                    {activeEss.leaveQuotas.map((quota: any, idx: number) => (
                      <div key={idx} className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="font-bold text-white">{quota.quotaType}</span>
                          <span className="text-[10px] text-slate-400 block">Accrued: {quota.accruedDays} Days | Taken: {quota.takenDays} Days</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-emerald-400">{quota.availableDays} Days Available</span>
                          <span className="text-[10px] text-slate-400 block">Entitlement: {quota.totalEntitlementDays} Days/Yr</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {essQueryType === 'phone' && (
                <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase block">Phone Update (Infotype 0105 Subtype 0020)</span>
                  <p className="text-slate-300 font-sans text-xs">Work Phone: <strong>{activeEss.currentWorkPhone}</strong> | Updated Cell Phone: <strong>{activeEss.updatedCellPhone}</strong></p>
                  <p className="text-[11px] text-indigo-300">Status: {activeEss.status} ({activeEss.validationStatus})</p>
                </div>
              )}

              {essQueryType === 'address' && (
                <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase block">Address Change (Infotype 0006 Subtype 1)</span>
                  <p className="text-slate-300 font-sans text-xs">New Address: <strong>{activeEss.newAddress.street}, {activeEss.newAddress.city}, {activeEss.newAddress.state} {activeEss.newAddress.postalCode}</strong></p>
                  <p className="text-[11px] text-amber-300">Tax Jurisdiction Code: {activeEss.newAddress.taxJurisdictionCode} (IT0207 Withholding Auto-Synchronized)</p>
                </div>
              )}

              {essQueryType === 'submit_leave' && (
                <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase block">Submitted Leave Request (Infotype 2001)</span>
                  <p className="text-slate-300 font-sans text-xs">Leave Type: <strong>{activeEss.leaveType}</strong> ({activeEss.startDate} to {activeEss.endDate} - {activeEss.workingDays} Days)</p>
                  <p className="text-[11px] text-indigo-300">Approver: {activeEss.managerApprover} | Status: {activeEss.status}</p>
                </div>
              )}

              {essQueryType === 'benefits' && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-indigo-300 uppercase block">Enrolled Benefits Overview (IT0167 / IT0169)</span>
                  <div className="space-y-1">
                    {activeEss.plans.map((p: any, idx: number) => (
                      <div key={idx} className="p-2.5 bg-slate-950 rounded border border-slate-800/80 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-white">{p.planName}</span> <span className="text-[10px] text-slate-400">({p.category})</span>
                          <span className="text-[10px] text-slate-400 block">{p.coverageTier} • {p.infotype}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-emerald-400 font-bold">{p.employeeCostPerPeriod}</span>
                          <span className="text-[10px] text-slate-400 block">Per Pay Period</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {essQueryType === 'tax_document' && (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-indigo-300 uppercase block">Tax Documents & Filing Statements ({activeEss.taxYear})</span>
                  <div className="space-y-2">
                    {activeEss.availableDocuments.map((doc: any, idx: number) => (
                      <div key={idx} className="p-3 bg-slate-950 rounded border border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-white">{doc.docName}</span>
                          <span className="text-[10px] text-slate-400 block">Type: {doc.docType} | Tax Year: {activeEss.taxYear}</span>
                        </div>
                        <a href={doc.downloadUrl} className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" /> PDF
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {essQueryType === 'training' && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-indigo-300 uppercase block">Assigned LMS Courses (SuccessFactors Learning)</span>
                  <div className="space-y-1.5">
                    {activeEss.assignedCourses.map((c: any, idx: number) => (
                      <div key={idx} className="p-2.5 bg-slate-950 rounded border border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-white">{c.title}</span> <span className="text-[10px] text-amber-400 font-bold">({c.category})</span>
                          <span className="text-[10px] text-slate-400 block">Due Date: {c.dueDate} | Course ID: {c.courseId}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800/60">{c.status} ({c.progressPct}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {essQueryType === 'hrbp' && (
                <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-2 font-sans text-xs">
                  <span className="text-xs font-bold font-mono text-emerald-400 uppercase block">Assigned HR Business Partner</span>
                  <p className="text-white text-sm font-bold">{activeEss.hrBusinessPartner.name} — <span className="text-slate-400 text-xs font-normal">{activeEss.hrBusinessPartner.title}</span></p>
                  <p className="text-slate-300">Email: <a href={`mailto:${activeEss.hrBusinessPartner.email}`} className="text-indigo-400 underline">{activeEss.hrBusinessPartner.email}</a> | Phone: {activeEss.hrBusinessPartner.phone}</p>
                  <p className="text-slate-400 text-[11px]">Office: {activeEss.hrBusinessPartner.office} | Hours: {activeEss.hrBusinessPartner.consultationHours}</p>
                </div>
              )}

              {essQueryType === 'goals' && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-indigo-300 uppercase block">{activeEss.goalYear} (SuccessFactors PMGM)</span>
                  <div className="space-y-1.5">
                    {activeEss.goals.map((g: any, idx: number) => (
                      <div key={idx} className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{g.id}: {g.title}</span>
                          <span className="text-emerald-400 font-bold">{g.progressPct}% Complete</span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-sans">Target Metric: {g.metric}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* TAB CONTENT: MANAGER SELF-SERVICE (MSS) */}
      {activeTab === 'mss_agent' && (() => {
        const activeMss = hrHcmService.getMssAgentReport(mssQueryType);
        return (
          <div className="p-5 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-900/80 rounded-xl border border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  Manager Self-Service (MSS) Action & Approval Hub
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Manager: <span className="font-mono text-purple-300 font-bold">{activeMss.managerName} ({activeMss.managerId})</span> | Org Structural Auth: <span className="font-mono text-indigo-300">P_ORGINCON</span>
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800/60 self-start sm:self-auto">
                S/4HANA FIORI INBOX SYNCHRONIZED
              </span>
            </div>

            {/* MSS Quick Query Buttons (10 Conversational MSS Tasks) */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono font-bold uppercase text-slate-400 tracking-wider block">Select MSS Manager Query / Task:</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'absent_today', label: 'Who is absent today?' },
                  { id: 'approve_leave', label: 'Approve team leave requests' },
                  { id: 'overtime', label: "Show team's overtime" },
                  { id: 'overdue_reviews', label: 'Which reviews are overdue?' },
                  { id: 'open_positions', label: 'Show open positions in my org' },
                  { id: 'expiring_certs', label: 'Who has expiring certifications?' },
                  { id: 'headcount_budget', label: 'Show headcount vs budget' },
                  { id: 'mandatory_training', label: 'Which employees need mandatory training?' },
                  { id: 'team_turnover', label: 'Show team turnover' },
                  { id: 'pending_approvals', label: 'Which HR actions require my approval?' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setMssQueryType(item.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                      mssQueryType === item.id
                        ? 'bg-purple-950 text-purple-300 border-purple-600 font-bold shadow-sm'
                        : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    "{item.label}"
                  </button>
                ))}
              </div>
            </div>

            {/* MSS Query Active Content View */}
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-4 font-mono text-xs">
              {mssQueryType === 'absent_today' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-bold text-white uppercase">Today's Team Absences ({activeMss.absentCount} Absent / {activeMss.totalTeamSize} Total)</span>
                    <span className="text-xs text-emerald-400 font-bold">Team Capacity: {activeMss.capacityPct}%</span>
                  </div>
                  <div className="space-y-2">
                    {activeMss.absentEmployees.map((emp: any, idx: number) => (
                      <div key={idx} className="p-3 bg-slate-950 rounded border border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-white">{emp.employeeName} ({emp.employeeId})</span>
                          <span className="text-[10px] text-slate-400 block">{emp.role} • {emp.absenceType}</span>
                        </div>
                        <span className="text-amber-300 text-xs font-bold">Expected Return: {emp.expectedReturn}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {mssQueryType === 'approve_leave' && (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-purple-300 uppercase block">Pending Team Leave Approvals ({activeMss.pendingRequestsCount} Pending)</span>
                  <div className="space-y-2">
                    {activeMss.pendingRequests.map((req: any, idx: number) => (
                      <div key={idx} className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <span className="font-bold text-white">{req.employeeName} ({req.employeeId})</span>
                          <span className="text-[10px] text-slate-400 block">{req.leaveType}: {req.startDate} - {req.endDate} ({req.workingDays} Working Days)</span>
                          <span className="text-[10px] text-emerald-400 block">Available Balance: {req.availableQuota} Days</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              hrHcmService.executeAutonomousAction('approve_time_off', req.employeeId, { requestId: req.requestId });
                              alert(`Leave Request ${req.requestId} Approved for PERNR ${req.employeeId}`);
                            }}
                            className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => alert(`Leave Request ${req.requestId} Rejected`)}
                            className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {mssQueryType === 'overtime' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-300 uppercase">Team Overtime Analytics ({activeMss.totalTeamOvertimeHours} Total OT Hours)</span>
                    <span className="text-xs font-bold text-amber-300">Total OT Cost: ${activeMss.totalOvertimeCost.toFixed(2)}</span>
                  </div>
                  <div className="space-y-1.5">
                    {activeMss.overtimeByEmployee.map((item: any, idx: number) => (
                      <div key={idx} className="p-3 bg-slate-950 rounded border border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-white">{item.employeeName} ({item.employeeId})</span>
                          <span className="text-[10px] text-slate-400 block">Reason: {item.reason}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-rose-400">{item.otHours} OT Hours (${item.otCost.toFixed(2)})</span>
                          {item.flaggedOverLimit && <span className="text-[10px] text-amber-400 font-bold block">⚠️ Flagged &gt;15 OT Hrs</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {mssQueryType === 'overdue_reviews' && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-rose-300 uppercase block">Overdue Performance Reviews ({activeMss.overdueCount} Overdue)</span>
                  <div className="space-y-2">
                    {activeMss.reviews.map((rev: any, idx: number) => (
                      <div key={idx} className="p-3 bg-slate-950 rounded border border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-white">{rev.employeeName} ({rev.employeeId})</span>
                          <span className="text-[10px] text-slate-400 block">{rev.reviewType} • Due: {rev.dueDate}</span>
                        </div>
                        <span className="px-2 py-1 rounded bg-rose-950 text-rose-300 font-bold text-[10px] border border-rose-800">{rev.daysOverdue} Days Overdue</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {mssQueryType === 'open_positions' && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-indigo-300 uppercase block">Open Requisitions in Org Unit 500012 ({activeMss.openRequisitionsCount} Positions)</span>
                  <div className="space-y-1.5">
                    {activeMss.positions.map((pos: any, idx: number) => (
                      <div key={idx} className="p-3 bg-slate-950 rounded border border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-white">{pos.jobTitle}</span> <span className="text-[10px] text-slate-400">({pos.reqId})</span>
                          <span className="text-[10px] text-slate-400 block">Grade: {pos.grade} | Applicants: {pos.applicantsCount}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800/60">{pos.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {mssQueryType === 'expiring_certs' && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-amber-300 uppercase block">Expiring Employee Certifications (Infotype 0024)</span>
                  <div className="space-y-2">
                    {activeMss.certifications.map((cert: any, idx: number) => (
                      <div key={idx} className="p-3 bg-slate-950 rounded border border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-white">{cert.employeeName} ({cert.employeeId})</span>
                          <span className="text-[10px] text-amber-300 block">{cert.qualification}</span>
                        </div>
                        <span className="text-rose-400 font-bold text-xs">Expires {cert.expiryDate} ({cert.daysRemaining} Days Left)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {mssQueryType === 'headcount_budget' && (
                <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-3">
                  <span className="text-xs font-bold text-emerald-400 uppercase block">Headcount vs Budget Variance ({activeMss.costCenter})</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                    <div className="p-2 bg-slate-900 rounded"><span className="text-[10px] text-slate-400">Budgeted FTE</span><div className="font-bold text-white">{activeMss.budgetedFte}</div></div>
                    <div className="p-2 bg-slate-900 rounded"><span className="text-[10px] text-slate-400">Actual FTE</span><div className="font-bold text-white">{activeMss.actualFte}</div></div>
                    <div className="p-2 bg-slate-900 rounded"><span className="text-[10px] text-slate-400">Annual Budget</span><div className="font-bold text-white">${(activeMss.annualBudget / 1000000).toFixed(2)}M</div></div>
                    <div className="p-2 bg-emerald-950 rounded border border-emerald-800/60"><span className="text-[10px] text-emerald-400">YTD Variance</span><div className="font-bold text-emerald-300">+${(activeMss.favorableVarianceAmount / 1000).toFixed(0)}k</div></div>
                  </div>
                </div>
              )}

              {mssQueryType === 'mandatory_training' && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-rose-300 uppercase block">Mandatory Training Compliance Gaps</span>
                  <div className="space-y-1.5">
                    {activeMss.gaps.map((gap: any, idx: number) => (
                      <div key={idx} className="p-3 bg-slate-950 rounded border border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-white">{gap.employeeName} ({gap.employeeId})</span>
                          <span className="text-[10px] text-slate-400 block">{gap.course}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 text-[10px] font-bold border border-rose-800">{gap.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {mssQueryType === 'team_turnover' && (
                <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-3 font-sans text-xs">
                  <span className="text-xs font-mono font-bold text-purple-300 uppercase block">Team Turnover & Attrition Analysis</span>
                  <p className="text-slate-300">Annual Turnover Rate: <strong className="text-emerald-400">{activeMss.turnoverRatePct}%</strong> (Tech Sector Avg: {activeMss.techSectorAveragePct}% | Industry Benchmark: {activeMss.industryBenchmarkPct}%)</p>
                  <p className="text-slate-300">Average Employee Tenure: <strong>{activeMss.avgTenureYears} Years</strong> | Departures YTD: <strong>{activeMss.departuresYtd}</strong></p>
                </div>
              )}

              {mssQueryType === 'pending_approvals' && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-purple-300 uppercase block">Pending Manager Approvals Hub ({activeMss.totalPendingCount} Items)</span>
                  <div className="space-y-1.5">
                    {activeMss.approvalCategories.map((cat: any, idx: number) => (
                      <div key={idx} className="p-3 bg-slate-950 rounded border border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-white">{cat.category} ({cat.count} Pending)</span>
                          <span className="text-[10px] text-slate-400 block">{cat.itemsSummary}</span>
                        </div>
                        <a href={activeMss.sapFioriInboxUrl} target="_blank" rel="noreferrer" className="px-3 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs">
                          Open in Fiori Inbox
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* TAB CONTENT: TALENT & PERFORMANCE AI */}
      {activeTab === 'talent_performance_ai' && (() => {
        const talentReport = data && (data.biasPolicyEnforcement || data.nineBoxSummary)
          ? data
          : hrHcmService.getTalentPerformanceReport('candidate_match', 'Senior Engineer');

        return (
          <div className="p-5 space-y-6 text-xs font-sans">
            {/* Bias & Fairness Non-Discrimination Policy Banner */}
            <div className="p-4 bg-emerald-950/40 border border-emerald-800/80 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-300 font-bold font-mono">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>{talentReport.biasPolicyEnforcement.policyTitle}</span>
                </div>
                <span className="px-2.5 py-1 rounded bg-emerald-900/80 text-emerald-200 border border-emerald-700 font-mono font-bold text-[10px]">
                  {talentReport.biasPolicyEnforcement.fairnessAuditStatus}
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {talentReport.biasPolicyEnforcement.auditMessage}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-[11px]">
                <div className="p-2.5 bg-slate-900/90 rounded border border-slate-800">
                  <span className="font-bold text-emerald-400 font-mono block mb-1">✅ Evaluated Job-Relevant Criteria:</span>
                  <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                    {talentReport.biasPolicyEnforcement.evaluatedJobRelevantCriteria.map((c: string, idx: number) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-2.5 bg-slate-900/90 rounded border border-slate-800">
                  <span className="font-bold text-rose-400 font-mono block mb-1">🚫 Excluded Protected Personal Attributes:</span>
                  <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                    {talentReport.biasPolicyEnforcement.excludedProtectedAttributes.map((a: string, idx: number) => (
                      <li key={idx}>{a}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Position Overview Header */}
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider block">Target Open Requisition</span>
                <h3 className="text-base font-bold text-white flex items-center gap-2 mt-0.5">
                  <span>{talentReport.targetPosition}</span>
                  <span className="text-xs font-mono font-normal text-slate-400">({talentReport.openRequisitionId})</span>
                </h3>
                <p className="text-slate-400 mt-1">
                  Department: <strong className="text-slate-200">{talentReport.department}</strong> | Grade: <strong className="text-slate-200">{talentReport.positionGrade}</strong> | Min Experience: <strong className="text-slate-200">{talentReport.minimumYearsExperienceRequired} Years</strong>
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-center">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Candidates Evaluated</span>
                  <span className="text-lg font-bold text-indigo-400">{talentReport.candidatesEvaluatedCount}</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-center">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Top Match Fit</span>
                  <span className="text-lg font-bold text-emerald-400">{talentReport.topCandidate?.matchScorePct}%</span>
                </div>
              </div>
            </div>

            {/* Sub-Section 1: Candidate Suitability Fit Ranking */}
            <div className="space-y-4">
              <h4 className="text-xs font-mono font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-400" />
                Candidate Matching &amp; Suitability Fit Ranking
              </h4>

              <div className="grid grid-cols-1 gap-4">
                {talentReport.candidates.map((candidate: any, idx: number) => (
                  <div key={idx} className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 space-y-3 hover:border-indigo-500/50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full font-mono font-bold text-xs flex items-center justify-center shrink-0 ${
                          candidate.recommendationRank === 1 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}>
                          #{candidate.recommendationRank}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">{candidate.employeeName}</span>
                            <span className="text-xs font-mono text-slate-400">({candidate.candidateId})</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                              candidate.matchCategory === 'TOP_QUALIFIED_CANDIDATE' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                              candidate.matchCategory === 'STRONG_CANDIDATE' ? 'bg-indigo-950 text-indigo-300 border-indigo-800' :
                              'bg-amber-950 text-amber-300 border-amber-800'
                            }`}>
                              {candidate.matchCategory.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {candidate.currentTitle} • {candidate.currentDepartment} • <strong className="text-slate-300">{candidate.yearsExperience} Yrs Experience</strong>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-emerald-400 block">{candidate.matchScorePct}% Fit Score</span>
                          <span className="text-[10px] font-mono text-indigo-300">Readiness: {candidate.successionStatus.replace(/_/g, ' ')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Justification Note */}
                    <div className="p-3 bg-slate-950/80 rounded border border-slate-800 text-slate-300 text-xs">
                      <strong className="text-indigo-300 font-mono">Job-Relevant Selection Rationale:</strong> "{candidate.jobRelevantJustification}"
                    </div>

                    {/* Verified Skills & Qualifications Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-slate-950/60 rounded border border-slate-800 space-y-1.5">
                        <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Verified Technical Competencies (IT0024)</span>
                        <div className="space-y-1">
                          {candidate.verifiedSkills.map((s: any, sIdx: number) => (
                            <div key={sIdx} className="flex items-center justify-between">
                              <span className="text-slate-300">{s.skillName}</span>
                              <span className="font-mono text-[10px] text-emerald-400 font-bold">
                                Lvl {s.candidateLevel} / {s.requiredLevel} ({s.verifiedSource})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-3 bg-slate-950/60 rounded border border-slate-800 space-y-2">
                        <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Performance &amp; Certifications</span>
                        <div className="space-y-1">
                          <p className="text-slate-300">PMGM Review Rating: <strong className="text-amber-300">{candidate.performanceRating}</strong></p>
                          <p className="text-slate-300">Goal Completion: <strong className="text-emerald-400">{candidate.goalCompletionPct}%</strong></p>
                          <p className="text-slate-300">9-Box Placement: <strong className="text-indigo-300">{candidate.nineBoxPlacement}</strong></p>
                        </div>
                        <div className="pt-1">
                          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1">Active Certifications</span>
                          <div className="flex flex-wrap gap-1">
                            {candidate.certifications.map((cert: string, cIdx: number) => (
                              <span key={cIdx} className="px-2 py-0.5 rounded bg-slate-900 text-indigo-300 border border-slate-800 text-[10px] font-mono">
                                🎓 {cert}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sub-Section 2: Goals, Reviews & Succession Bench Strength */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-mono font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-400" />
                  9-Box Talent Matrix &amp; Goal Alignment
                </h4>
                <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">Star Performers (High Potential / High Rating)</span>
                    <span className="font-bold text-amber-400 font-mono">{talentReport.nineBoxSummary.starPerformers} Candidate</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">High Performers</span>
                    <span className="font-bold text-indigo-400 font-mono">{talentReport.nineBoxSummary.highPerformers} Candidate</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">Core Contributors / Development Pipeline</span>
                    <span className="font-bold text-slate-400 font-mono">{talentReport.nineBoxSummary.coreContributors} Candidate</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-mono font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Succession Readiness &amp; Development Plans
                </h4>
                <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">Ready Now Successors</span>
                    <span className="font-bold text-emerald-400 font-mono">{talentReport.successionBenchStrength.readyNowCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">Ready in 6 Months</span>
                    <span className="font-bold text-indigo-400 font-mono">{talentReport.successionBenchStrength.readyIn6MonthsCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">Ready in 1-2 Years</span>
                    <span className="font-bold text-slate-400 font-mono">{talentReport.successionBenchStrength.ready1To2YearsCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* TAB CONTENT: TRAINING & CERTIFICATION AGENT */}
      {activeTab === 'training_certification' && (() => {
        const trainingReport = data && (data.overdueTrainings || data.safetyCertificationRenewals)
          ? data
          : hrHcmService.getTrainingCertificationReport('all', 'Plant Maintenance Technicians', 'EHS-301 High Voltage Safety Recertification', true);

        return (
          <div className="p-5 space-y-6 text-xs font-sans">
            {/* Agent Header Banner */}
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
                    <BookOpen className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>SAP Training &amp; Certification Agent</span>
                      <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono text-[10px] uppercase font-bold">
                        LMS &amp; S/4HANA Sync Active
                      </span>
                    </h3>
                    <p className="text-slate-400 mt-0.5">
                      Monitoring compliance deadlines, safety renewals, technician qualifications, and auto-assigning training in SuccessFactors LMS
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono font-bold flex items-center gap-1.5 text-xs">
                  <Zap className="w-4 h-4 text-emerald-400 animate-pulse" />
                  Auto-Assignments Triggered
                </span>
              </div>
            </div>

            {/* Top KPI Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Overdue Trainings</span>
                <span className="text-lg font-bold text-rose-400 font-mono mt-0.5 block">{trainingReport.overdueTrainings.length} Courses</span>
                <span className="text-[10px] text-slate-400">Requires immediate LMS action</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Safety Cert Renewals</span>
                <span className="text-lg font-bold text-amber-400 font-mono mt-0.5 block">{trainingReport.safetyCertificationRenewals.length} Certs</span>
                <span className="text-[10px] text-slate-400">Expiring in next 30 days</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Techs Lacking Certs</span>
                <span className="text-lg font-bold text-orange-400 font-mono mt-0.5 block">{trainingReport.techniciansLackingCertifications.length} Staff</span>
                <span className="text-[10px] text-slate-400">Dispatch restrictions applied</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Overall Completion</span>
                <span className="text-lg font-bold text-emerald-400 font-mono mt-0.5 block">{trainingReport.completionRates.overallCompletionRatePct}%</span>
                <span className="text-[10px] text-slate-400">Target compliance rate: &gt;90%</span>
              </div>
            </div>

            {/* Section 1: Overdue Training Courses */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold text-rose-300 uppercase tracking-wider flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                Which Training is Overdue? (LMS Compliance Audit)
              </h4>

              <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-950/80 border-b border-slate-800 font-mono text-[10px] text-slate-400 uppercase">
                        <th className="p-3">Course Code &amp; Title</th>
                        <th className="p-3">Employee &amp; Personnel No</th>
                        <th className="p-3">Department</th>
                        <th className="p-3">Due Date</th>
                        <th className="p-3">Days Overdue</th>
                        <th className="p-3 text-right">LMS Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {trainingReport.overdueTrainings.map((course: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-3">
                            <span className="font-bold text-white block">{course.courseTitle}</span>
                            <span className="font-mono text-[10px] text-indigo-400">({course.courseId})</span>
                          </td>
                          <td className="p-3">
                            <span className="font-medium text-slate-200 block">{course.employeeName}</span>
                            <span className="font-mono text-[10px] text-slate-400">{course.personnelNumber}</span>
                          </td>
                          <td className="p-3 text-slate-300">{course.department}</td>
                          <td className="p-3 font-mono text-slate-300">{course.dueDate}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-mono text-[10px] font-bold">
                              {course.daysOverdue} Days
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <span className="px-2.5 py-1 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono text-[10px] font-bold inline-flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-indigo-400" /> Reassigned
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Section 2: Safety Certification Renewals & Technicians Lacking Certifications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Safety Certification Renewals */}
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  Who Needs Safety Certification Renewal?
                </h4>

                <div className="space-y-2.5">
                  {trainingReport.safetyCertificationRenewals.map((cert: any, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">{cert.certificationName}</span>
                        <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-mono text-[10px] font-bold">
                          {cert.daysUntilExpiry} Days Left
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs">
                        Technician: <strong className="text-slate-200">{cert.technicianName}</strong> ({cert.personnelNumber})
                      </p>
                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span className="text-slate-400 font-mono">Exp Date: {cert.expirationDate}</span>
                        <span className="text-emerald-400 font-mono font-bold">Renewal Course Auto-Assigned</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technicians Lacking Certifications */}
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-mono font-bold text-orange-300 uppercase tracking-wider flex items-center gap-2">
                  <UserX className="w-4 h-4 text-orange-400" />
                  Technicians Lacking Required Certifications
                </h4>

                <div className="space-y-2.5">
                  {trainingReport.techniciansLackingCertifications.map((tech: any, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">{tech.technicianName} ({tech.personnelNumber})</span>
                        <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-mono text-[10px] font-bold">
                          {tech.riskLevel}
                        </span>
                      </div>
                      <p className="text-rose-300 font-mono text-[11px]">
                        Missing: <strong>{tech.missingCertification}</strong>
                      </p>
                      <p className="text-slate-400 text-[11px]">
                        Dispatch Status: <em className="text-slate-200 font-sans">"{tech.dispatchStatus}"</em>
                      </p>
                      <div className="p-2 bg-slate-900 rounded border border-slate-800 text-[10px] text-cyan-300 font-mono">
                        💡 Recommended Action: {tech.recommendedAction}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 3: Expiring Compliance Courses Next Month & Completion Rates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Expiring Compliance Courses Next Month */}
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  Which Compliance Courses Expire Next Month?
                </h4>

                <div className="space-y-2.5">
                  {trainingReport.expiringComplianceCoursesNextMonth.map((course: any, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">{course.courseTitle}</span>
                        <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono text-[10px]">
                          {course.expirationWindow}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px]">
                        Category: <strong className="text-slate-300">{course.category}</strong> | Target: <strong className="text-slate-300">{course.targetGroup}</strong>
                      </p>
                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span className="text-amber-300 font-mono font-bold">{course.affectedEmployeesCount} Employees Expiring</span>
                        <span className="text-emerald-400 font-mono font-bold">Compliance Rate: {course.currentComplianceRatePct}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Training Completion Rates Breakdown */}
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-mono font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Show Training Completion Rates Across Teams
                </h4>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2.5">
                  {trainingReport.completionRates.teamCompletionBreakdown.map((team: any, idx: number) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-200 font-medium">{team.teamName}</span>
                        <span className="font-mono font-bold text-emerald-400">{team.completionRatePct}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            team.completionRatePct >= 95 ? 'bg-emerald-500' :
                            team.completionRatePct >= 90 ? 'bg-indigo-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${team.completionRatePct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 4: Automated Approved Training Assignment Execution */}
            <div className="p-4 bg-emerald-950/40 border border-emerald-800/80 rounded-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-emerald-300 font-bold font-mono">
                  <Zap className="w-5 h-5 text-emerald-400" />
                  <span>Automated Approved Training Assignment Execution Panel</span>
                </div>
                <span className="px-2.5 py-1 rounded bg-emerald-900 text-emerald-200 border border-emerald-700 font-mono font-bold text-[10px]">
                  {trainingReport.automatedAssignmentsTriggered.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-900/90 rounded border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Assignment &amp; Target Team</span>
                  <p className="text-white font-bold">ID: <code className="text-indigo-300">{trainingReport.automatedAssignmentsTriggered.assignmentId}</code></p>
                  <p className="text-slate-300">Target Team: <strong>{trainingReport.automatedAssignmentsTriggered.targetTeam}</strong></p>
                  <p className="text-slate-300">Total Personnel Enrolled: <strong className="text-emerald-400">{trainingReport.automatedAssignmentsTriggered.totalEmployeesAssigned} Technicians</strong></p>
                </div>

                <div className="p-3 bg-slate-900/90 rounded border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">LMS Sync &amp; Audit Code</span>
                  <p className="text-slate-300">LMS Confirmation: <code className="text-emerald-300 font-mono">{trainingReport.automatedAssignmentsTriggered.lmsConfirmationCode}</code></p>
                  <p className="text-slate-300">Notification Channels: <strong className="text-slate-200">{trainingReport.automatedAssignmentsTriggered.notificationChannels.join(', ')}</strong></p>
                  <p className="text-slate-400 font-mono text-[10px] pt-1">Triggered: {trainingReport.automatedAssignmentsTriggered.triggerTimestamp}</p>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {activeTab === 'workforce_analytics' && (() => {
        const wfReport = data?.totalHeadcount ? data : hrHcmService.getWorkforceAnalyticsReport();
        return (
          <div className="space-y-6">
            {/* Header banner */}
            <div className="p-4 bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border border-purple-800/60 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  <h3 className="text-base font-bold text-white">SAP Workforce Analytics &amp; Strategic HR Intelligence</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-900/80 text-purple-300 border border-purple-700">
                    S/4HANA &amp; SuccessFactors
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Real-time executive headcount, labor cost, turnover, overtime trends, contractor vs employee cost ratio, and risk modeling.
                </p>
              </div>
              <div className="text-right font-mono text-[11px] text-slate-400">
                <span>As of: <strong>{wfReport.totalHeadcount.asOfDate}</strong></span>
              </div>
            </div>

            {/* Top KPI row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Global Headcount</span>
                <p className="text-2xl font-black text-white">{wfReport.totalHeadcount.totalFte.toLocaleString()} <span className="text-xs font-normal text-slate-400">FTEs</span></p>
                <p className="text-[11px] text-slate-400">+{wfReport.totalHeadcount.contingentContractorsCount} Contractors ({wfReport.totalHeadcount.fullTimeFte.toLocaleString()} FT / {wfReport.totalHeadcount.partTimeFte} PT)</p>
              </div>

              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Annual Labor Cost</span>
                <p className="text-2xl font-black text-emerald-400">$336.2M</p>
                <p className="text-[11px] text-slate-400">+$84.7M Contractor spend ($201.6K/contractor)</p>
              </div>

              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Net Growth (YTD)</span>
                <p className="text-2xl font-black text-indigo-400">+{wfReport.hiringVsAttrition.netHeadcountGrowthFte} <span className="text-xs font-normal text-indigo-300">(+{wfReport.hiringVsAttrition.netGrowthPct}%)</span></p>
                <p className="text-[11px] text-slate-400">Hired: +{wfReport.hiringVsAttrition.ytdNewHiresCount} | Attrition: -{wfReport.hiringVsAttrition.ytdAttritionCount}</p>
              </div>

              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Monthly Overtime</span>
                <p className="text-2xl font-black text-amber-400">${(wfReport.overtimeTrends.monthlyOvertimeSpendUsd/1000).toFixed(0)}K</p>
                <p className="text-[11px] text-amber-300">+{wfReport.overtimeTrends.overtimeVariancePctVsBudget}% over budget ({wfReport.overtimeTrends.monthlyOvertimeHoursTotal.toLocaleString()} hrs)</p>
              </div>
            </div>

            {/* Grid 1: Headcount by Country & Workforce Cost by Department */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Headcount by Country */}
              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    Headcount by Country
                  </h4>
                  <span className="text-[11px] font-mono text-slate-400">{wfReport.totalHeadcount.globalLocationsCount} Global Locations</span>
                </div>
                <div className="space-y-2">
                  {wfReport.headcountByCountry.map((c: any) => (
                    <div key={c.countryCode} className="p-2.5 bg-slate-950/60 rounded border border-slate-800/80 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{c.country}</span>
                        <span className="font-mono font-bold text-cyan-300">{c.fteCount} FTEs ({c.ftePct}%)</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${c.ftePct}%` }} />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                        <span>Spend: <strong className="text-slate-200">${(c.totalLaborCostUsd/1000000).toFixed(1)}M</strong></span>
                        <span>Avg Cost/FTE: <strong className="text-slate-200">${c.avgCostPerFteUsd.toLocaleString()}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Workforce Cost by Department */}
              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    Workforce Cost by Department
                  </h4>
                  <span className="text-[11px] font-mono text-slate-400">Total: $336.2M</span>
                </div>
                <div className="space-y-2">
                  {wfReport.workforceCostByDepartment.map((d: any) => (
                    <div key={d.department} className="p-2.5 bg-slate-950/60 rounded border border-slate-800/80 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{d.department}</span>
                        <span className="font-mono font-bold text-emerald-400">${(d.annualLaborCostUsd/1000000).toFixed(1)}M ({d.costPctOfTotal}%)</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Headcount: <strong className="text-slate-200">{d.headCountFte} FTEs</strong></span>
                        <span>Avg Cost/FTE: <strong className="text-slate-200">${d.avgCostPerFteUsd.toLocaleString()}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Grid 2: Understaffed Areas & Turnover Rates */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Understaffed Areas */}
              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    Understaffed Areas &amp; Capacity Gaps
                  </h4>
                  <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-mono text-[10px] font-bold border border-rose-800">
                    Critical Gaps Identified
                  </span>
                </div>
                <div className="space-y-2.5">
                  {wfReport.understaffedAreas.map((u: any) => (
                    <div key={u.areaName} className="p-3 bg-slate-950/80 border border-rose-900/50 rounded-lg text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{u.areaName}</span>
                        <span className="px-2 py-0.5 rounded bg-rose-900/80 text-rose-200 font-mono font-bold text-[10px]">
                          {u.gapFte} FTEs ({u.capacityDeficitPct}% Deficit)
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-300">
                        <span>Required: <strong>{u.requiredCapacityFte}</strong></span> |
                        <span>Actual: <strong className="text-amber-300">{u.actualHeadcountFte}</strong></span>
                      </div>
                      <p className="text-[11px] text-slate-400 italic">Impact: "{u.businessImpact}"</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Turnover Rates */}
              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-amber-400" />
                    Department Turnover Rates vs Benchmark
                  </h4>
                  <span className="text-[11px] font-mono text-slate-400">Avg Turnover: 7.4%</span>
                </div>
                <div className="space-y-2">
                  {wfReport.turnoverRatesByDepartment.map((t: any) => (
                    <div key={t.department} className="p-2.5 bg-slate-950/60 rounded border border-slate-800/80 text-xs flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white">{t.department}</p>
                        <p className="text-[11px] text-slate-400">Industry Benchmark: {t.industryBenchmarkPct}%</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                          t.status === 'HIGH_TURNOVER' ? 'bg-rose-900/80 text-rose-200 border border-rose-700' :
                          t.status === 'ELEVATED' ? 'bg-amber-900/80 text-amber-200 border border-amber-700' :
                          'bg-emerald-900/80 text-emerald-200 border border-emerald-700'
                        }`}>
                          {t.annualTurnoverPct}% Annual
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Grid 3: Contractor vs Employee Cost & Retirement Eligibility */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Contractor vs Employee Cost Comparison */}
              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-400" />
                    Contractor vs Employee Cost Multiplier
                  </h4>
                  <span className="px-2 py-0.5 rounded bg-indigo-900 text-indigo-200 font-mono text-[10px] font-bold">
                    2.52x Cost Multiplier
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-950/80 border border-slate-800 rounded space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase block font-mono">Permanent Staff</span>
                    <p className="font-bold text-white">${(wfReport.contractorVsEmployeeCost.permanentEmployeesTotalSpendUsd/1000000).toFixed(1)}M Total</p>
                    <p className="text-[11px] text-slate-300">{wfReport.contractorVsEmployeeCost.permanentEmployeesFte} FTEs</p>
                    <p className="text-[11px] text-emerald-400 font-bold">${wfReport.contractorVsEmployeeCost.permanentEmployeeAvgCostPerFteUsd.toLocaleString()} / FTE</p>
                  </div>

                  <div className="p-3 bg-slate-950/80 border border-slate-800 rounded space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase block font-mono">Contractors</span>
                    <p className="font-bold text-white">${(wfReport.contractorVsEmployeeCost.contractorsTotalSpendUsd/1000000).toFixed(1)}M Total</p>
                    <p className="text-[11px] text-slate-300">{wfReport.contractorVsEmployeeCost.contractorsFteEquivalent} Contractor FTEs</p>
                    <p className="text-[11px] text-amber-400 font-bold">${wfReport.contractorVsEmployeeCost.contractorAvgCostPerFteUsd.toLocaleString()} / FTE</p>
                  </div>
                </div>

                <div className="p-3 bg-indigo-950/50 border border-indigo-800/80 rounded text-xs space-y-1">
                  <span className="text-[10px] font-mono font-bold text-indigo-300 uppercase block">Cost Optimization Insight</span>
                  <p className="text-slate-200">{wfReport.contractorVsEmployeeCost.insight}</p>
                </div>
              </div>

              {/* Retirement Eligibility Trends */}
              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-400" />
                    Retirement Eligibility &amp; Succession Bench Risk
                  </h4>
                  <span className="text-[11px] font-mono text-purple-300">{wfReport.retirementEligibilityTrends.currentlyEligibleCount} Currently Eligible</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 bg-slate-950/80 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Current</span>
                    <strong className="text-white font-mono text-sm">{wfReport.retirementEligibilityTrends.currentlyEligibleCount}</strong>
                    <span className="text-[10px] text-purple-300 block">({wfReport.retirementEligibilityTrends.currentlyEligiblePct}%)</span>
                  </div>
                  <div className="p-2 bg-slate-950/80 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">3 Years</span>
                    <strong className="text-amber-300 font-mono text-sm">{wfReport.retirementEligibilityTrends.eligibleWithin3YearsCount}</strong>
                    <span className="text-[10px] text-amber-300 block">({wfReport.retirementEligibilityTrends.eligibleWithin3YearsPct}%)</span>
                  </div>
                  <div className="p-2 bg-slate-950/80 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">5 Years</span>
                    <strong className="text-slate-200 font-mono text-sm">{wfReport.retirementEligibilityTrends.eligibleWithin5YearsCount}</strong>
                    <span className="text-[10px] text-slate-300 block">({wfReport.retirementEligibilityTrends.eligibleWithin5YearsPct}%)</span>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  {wfReport.retirementEligibilityTrends.criticalRetirementRiskAreas.map((r: any) => (
                    <div key={r.roleCategory} className="p-2 bg-slate-950/60 rounded border border-slate-800/80 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{r.roleCategory}</span>
                        <span className="font-mono text-amber-300 font-bold">{r.eligibleWithin3YearsPct}% Eligible (3 Yrs)</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Staff Eligible: <strong className="text-slate-200">{r.headcountEligible}</strong></span>
                        <span>Succession Bench Coverage: <strong className="text-indigo-300">{r.successionCoveragePct}%</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Critical Workforce Risks section */}
            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  Critical Workforce Risks to Address
                </h4>
                <span className="text-[11px] font-mono text-slate-400">{wfReport.workforceRisksToAddress.length} Priority Risks</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {wfReport.workforceRisksToAddress.map((rk: any) => (
                  <div key={rk.riskId} className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white font-mono">{rk.riskId}: {rk.title}</span>
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                        rk.severity.includes('CRITICAL') ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                        'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}>
                        {rk.severity}
                      </span>
                    </div>
                    <p className="text-slate-300">{rk.description}</p>
                    <div className="p-2 bg-slate-900 rounded border border-slate-800/80 text-[11px] text-indigo-300 space-y-0.5">
                      <strong className="text-indigo-200 block">Mitigation Strategy:</strong>
                      <p>{rk.mitigationStrategy}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* TAB CONTENT: PREDICTIVE HR ANALYTICS */}
      {activeTab === 'predictive_analytics' && (() => {
        const pReport = data && (data.headcountDemandForecast || data.governanceAndGuardrails)
          ? data
          : hrHcmService.getPredictiveHrAnalyticsReport(predictiveCategory, 12);

        const gov = pReport.governanceAndGuardrails || {};
        const hdf = pReport.headcountDemandForecast || {};
        const hnf = pReport.hiringNeedsForecast || {};
        const pcf = pReport.payrollCostForecast || {};
        const otf = pReport.overtimeTrendsForecast || {};
        const trf = pReport.trainingRequirementsForecast || {};
        const sgf = pReport.skillGapsForecast || {};
        const ref = pReport.retirementExposureForecast || {};
        const ssf = pReport.staffingShortagesForecast || {};

        return (
          <div className="p-5 space-y-6">
            {/* GOVERNANCE & ETHICS MANDATE BANNER */}
            <div className="p-4 bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-950 border border-amber-500/40 rounded-xl space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/20 pb-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
                  <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider font-mono">
                    Conservative HR Predictive AI Governance
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    Policy: {gov.activePolicy || 'v3.2'}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Confidence: {gov.modelConfidenceScore || 91.4}%
                  </span>
                </div>
              </div>

              <p className="text-xs text-amber-100/90 leading-relaxed font-sans">
                <strong>Mandatory Guardrail Notice:</strong> {gov.attritionPerformanceRestriction}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800/80">
                <span>Evaluation Threshold: <strong className="text-amber-300">{gov.evaluationThreshold}</strong></span>
                <span>•</span>
                <span>Human-In-The-Loop: <strong className="text-emerald-300">{gov.humanInTheLoopMandate}</strong></span>
              </div>
            </div>

            {/* TOP KPI CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Headcount Demand</span>
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <div className="text-lg font-bold font-mono text-white">
                  {hdf.projectedDemandFte?.toLocaleString() || '5,170'}
                </div>
                <div className="text-[10px] font-mono text-emerald-400">
                  +{hdf.netDemandGrowthFte || 320} FTEs (+{hdf.growthPct || 6.6}%)
                </div>
              </div>

              <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>12M Hiring Target</span>
                  <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-lg font-bold font-mono text-white">
                  {hnf.totalHiringTarget12M || 535}
                </div>
                <div className="text-[10px] text-slate-400">
                  {hnf.expansionHiresFte || 320} Growth / {hnf.replacementHiresFte || 215} Attr.
                </div>
              </div>

              <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>12M Payroll Forecast</span>
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-lg font-bold font-mono text-white">
                  ${((pcf.projectedAnnualPayroll12MUsd || 364800000)/1000000).toFixed(1)}M
                </div>
                <div className="text-[10px] font-mono text-amber-400">
                  +${((pcf.netIncreaseUsd || 28600000)/1000000).toFixed(1)}M (+{pcf.growthPct || 8.5}%)
                </div>
              </div>

              <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Monthly Overtime</span>
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className="text-lg font-bold font-mono text-white">
                  {otf.projectedMonthlyOvertimeHours12M?.toLocaleString() || '7,200'} hrs
                </div>
                <div className="text-[10px] font-mono text-emerald-400">
                  -49.3% vs current ({otf.currentMonthlyOvertimeHours?.toLocaleString() || '14,200'})
                </div>
              </div>

              <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1 col-span-2 md:col-span-1">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>12M Retirement Exits</span>
                  <Users className="w-3.5 h-3.5 text-rose-400" />
                </div>
                <div className="text-lg font-bold font-mono text-white">
                  {ref.predictedExitVolume12M || 142}
                </div>
                <div className="text-[10px] text-slate-400">
                  out of {ref.eligibleWithin3YearsCount || 680} 3-Yr Eligible
                </div>
              </div>
            </div>

            {/* CATEGORY SELECTOR PILLS */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono">
              {[
                { id: 'all', label: 'All Forecasts' },
                { id: 'headcount_demand', label: 'Headcount Demand' },
                { id: 'hiring_needs', label: 'Hiring Needs' },
                { id: 'payroll_cost', label: 'Payroll Cost' },
                { id: 'overtime_trends', label: 'Overtime Trends' },
                { id: 'training_requirements', label: 'Training Req.' },
                { id: 'skill_gaps', label: 'Skill Gaps' },
                { id: 'retirement_exposure', label: 'Retirement Exposure' },
                { id: 'staffing_shortages', label: 'Staffing Shortages' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setPredictiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg border font-semibold whitespace-nowrap transition-colors ${
                    predictiveCategory === cat.id
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                      : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* SECTION 1: HEADCOUNT DEMAND FORECAST */}
            {(predictiveCategory === 'all' || predictiveCategory === 'headcount_demand') && (
              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-400" />
                    1. Headcount Demand Forecast (12-Month Horizon)
                  </h4>
                  <span className="text-xs font-mono text-emerald-400 font-bold">
                    Target: {hdf.projectedDemandFte?.toLocaleString()} FTEs (+{hdf.netDemandGrowthFte} FTEs / +{hdf.growthPct}%)
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                        <th className="py-2 px-2">Department</th>
                        <th className="py-2 px-2 text-right">Current FTE</th>
                        <th className="py-2 px-2 text-right">12M Demand</th>
                        <th className="py-2 px-2 text-right">Growth</th>
                        <th className="py-2 px-2">Primary Strategic Growth Driver</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {hdf.departmentDemandBreakdown?.map((d: any) => (
                        <tr key={d.department} className="hover:bg-slate-800/30">
                          <td className="py-2.5 px-2 font-sans font-bold text-white">{d.department}</td>
                          <td className="py-2.5 px-2 text-right text-slate-300">{d.currentFte}</td>
                          <td className="py-2.5 px-2 text-right font-bold text-indigo-300">{d.projectedDemand12M}</td>
                          <td className="py-2.5 px-2 text-right font-bold text-emerald-400">+{d.demandGrowthFte}</td>
                          <td className="py-2.5 px-2 font-sans text-slate-400 text-[11px]">{d.driver}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SECTION 2: HIRING NEEDS FORECAST */}
            {(predictiveCategory === 'all' || predictiveCategory === 'hiring_needs') && (
              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-emerald-400" />
                    2. Quarterly Recruitment Targets & Hiring Needs
                  </h4>
                  <span className="text-xs font-mono text-indigo-300 font-bold">
                    Total: {hnf.totalHiringTarget12M} Hires Target
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {hnf.quarterlyHiringTargets?.map((q: any) => (
                    <div key={q.quarter} className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg space-y-1.5">
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-1">
                        <span className="font-mono font-bold text-indigo-300 text-xs">{q.quarter}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {q.hiresNeeded} Hires
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        <strong className="text-slate-200 block text-[10px] uppercase font-mono text-slate-400">Critical Role Focus:</strong>
                        {q.criticalFocus}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 3: PAYROLL COST FORECAST */}
            {(predictiveCategory === 'all' || predictiveCategory === 'payroll_cost') && (
              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    3. Payroll Cost Forecast & Labor Budget Drivers
                  </h4>
                  <span className="text-xs font-mono text-amber-300 font-bold">
                    Projected: ${(pcf.projectedAnnualPayroll12MUsd / 1000000).toFixed(1)}M (+{pcf.growthPct}%)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {pcf.costDrivers?.map((cd: any, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg space-y-1">
                      <span className="text-[11px] text-slate-300 font-bold block">{cd.factor}</span>
                      <div className={`text-base font-bold font-mono ${cd.impactUsd >= 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {cd.impactUsd >= 0 ? '+' : ''}${(cd.impactUsd / 1000000).toFixed(2)}M
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 4: OVERTIME TRENDS FORECAST */}
            {(predictiveCategory === 'all' || predictiveCategory === 'overtime_trends') && (
              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    4. Overtime Trends & Reduction Roadmap
                  </h4>
                  <span className="text-xs font-mono text-emerald-400 font-bold">
                    Annual Savings Target: ${(otf.projectedAnnualSavingsUsd / 1000000).toFixed(1)}M
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg text-center space-y-1">
                    <span className="text-[10px] text-slate-400 font-mono uppercase block">Current Monthly OT</span>
                    <strong className="text-lg font-bold font-mono text-rose-400">{otf.currentMonthlyOvertimeHours?.toLocaleString()} hrs</strong>
                    <span className="text-[10px] text-slate-400 block">${(otf.currentMonthlyOvertimeSpendUsd / 1000).toFixed(0)}K / month</span>
                  </div>

                  <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg text-center space-y-1">
                    <span className="text-[10px] text-slate-400 font-mono uppercase block">6-Month Target</span>
                    <strong className="text-lg font-bold font-mono text-amber-300">{otf.projectedMonthlyOvertimeHours6M?.toLocaleString()} hrs</strong>
                    <span className="text-[10px] text-emerald-400 block">-31.0% reduction</span>
                  </div>

                  <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg text-center space-y-1">
                    <span className="text-[10px] text-slate-400 font-mono uppercase block">12-Month Target</span>
                    <strong className="text-lg font-bold font-mono text-emerald-400">{otf.projectedMonthlyOvertimeHours12M?.toLocaleString()} hrs</strong>
                    <span className="text-[10px] text-emerald-400 block">-49.3% reduction</span>
                  </div>
                </div>

                <div className="p-3 bg-indigo-950/40 border border-indigo-800/60 rounded-lg text-xs text-indigo-200 font-sans">
                  <strong>Key Operational Prerequisite:</strong> {otf.keyPrerequisite}
                </div>
              </div>
            )}

            {/* SECTION 5: TRAINING REQUIREMENTS FORECAST */}
            {(predictiveCategory === 'all' || predictiveCategory === 'training_requirements') && (
              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-cyan-400" />
                    5. Training Requirements Forecast
                  </h4>
                  <span className="text-xs font-mono text-indigo-300 font-bold">
                    Total: {trf.totalProjectedTrainingHours12M?.toLocaleString()} Hours (${(trf.projectedTrainingBudgetUsd / 1000000).toFixed(2)}M Budget)
                  </span>
                </div>

                <div className="space-y-2">
                  {trf.upcomingMandatoryPrograms?.map((tp: any, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            tp.status === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                            tp.status === 'HIGH' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                            'bg-blue-950 text-blue-300 border border-blue-800'
                          }`}>
                            {tp.status}
                          </span>
                          <span className="font-bold text-white">{tp.program}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Required Participants: <strong className="text-slate-200">{tp.requiredParticipants}</strong> | Target Deadline: <strong className="text-amber-300 font-mono">{tp.deadline}</strong>
                        </div>
                      </div>
                      <div className="text-right font-mono text-indigo-300 font-bold text-xs shrink-0">
                        {tp.estimatedHours?.toLocaleString()} Training Hours
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 6: SKILL GAPS FORECAST */}
            {(predictiveCategory === 'all' || predictiveCategory === 'skill_gaps') && (
              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-400" />
                    6. Critical Skill Gaps Forecast
                  </h4>
                  <span className="text-xs font-mono text-amber-300 font-bold">
                    {sgf.identifiedCriticalGaps?.length || 3} Key Gap Domains
                  </span>
                </div>

                <div className="space-y-3">
                  {sgf.identifiedCriticalGaps?.map((sg: any, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{sg.skillDomain}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
                          {sg.gapSeverity}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-mono text-slate-400">
                          <span>Current Capability: <strong className="text-amber-300">{sg.currentCapabilityPct}%</strong></span>
                          <span>Target Capability: <strong className="text-emerald-400">{sg.targetCapabilityPct}%</strong></span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                          <div
                            className="bg-amber-400 h-full rounded-full transition-all"
                            style={{ width: `${sg.currentCapabilityPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 7: RETIREMENT EXPOSURE FORECAST */}
            {(predictiveCategory === 'all' || predictiveCategory === 'retirement_exposure') && (
              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-4 h-4 text-rose-400" />
                    7. Retirement Exposure Forecast & Succession Preparedness
                  </h4>
                  <span className="text-xs font-mono text-rose-300 font-bold">
                    12M Exits: {ref.predictedExitVolume12M} (out of {ref.eligibleWithin3YearsCount} 3-Yr Eligible)
                  </span>
                </div>

                <div className="space-y-2">
                  {ref.criticalRoleVulnerabilities?.map((r: any, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{r.roleCategory}</span>
                        <span className="font-mono text-amber-300 font-bold">{r.predictedExit12M} Projected Exits (12M)</span>
                      </div>
                      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400">
                        <span>3-Year Eligible: <strong className="text-slate-200">{r.eligible3Y}</strong></span>
                        <span>Succession Preparedness: <strong className="text-indigo-300">{r.successionPreparedness}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 8: STAFFING SHORTAGES FORECAST */}
            {(predictiveCategory === 'all' || predictiveCategory === 'staffing_shortages') && (
              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    8. Staffing Shortages & Operational Hotspot Forecast
                  </h4>
                  <span className="text-xs font-mono text-amber-300 font-bold">
                    {ssf.predictedShortageHotspots?.length || 3} Hotspot Locations
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {ssf.predictedShortageHotspots?.map((sh: any, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white font-mono">{sh.location}</span>
                        <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                          sh.shortageSeverity?.includes('CRITICAL') ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                          'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}>
                          Deficit: -{sh.gapFte} FTEs
                        </span>
                      </div>
                      <p className="text-slate-300 font-semibold">{sh.department}</p>
                      <p className="text-[11px] text-slate-400">Impact: <em>"{sh.impact}"</em></p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* TAB CONTENT: WORKFORCE PLANNING */}
      {activeTab === 'workforce_planning' && (() => {
        const wpReport = data && (data.shortfallSummary || data.capacityCalculation)
          ? data
          : hrHcmService.getWorkforcePlanningReport('Plant 1000', 'Technicians', 'Q3 2026');

        const curr = wpReport.currentEmployees || {};
        const leave = wpReport.plannedLeave || {};
        const ret = wpReport.retirements || {};
        const pipe = wpReport.hiringPipeline || {};
        const dem = wpReport.demandAndProductionPlans || {};
        const skills = wpReport.skillRequirements || {};
        const certs = wpReport.certificationStatus || {};
        const calc = wpReport.capacityCalculation || {};
        const mits = wpReport.recommendedMitigations || [];

        return (
          <div className="p-5 space-y-6">
            {/* EXECUTIVE SHORTFALL ALERT BANNER */}
            <div className="p-4 bg-gradient-to-r from-rose-950/90 via-slate-900 to-slate-950 border border-rose-500/50 rounded-xl space-y-3 shadow-lg shadow-rose-950/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-500/20 pb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                  <h3 className="text-sm font-bold text-rose-200 uppercase tracking-wider font-mono">
                    Workforce Planning Capacity Alert: {wpReport.plantName || 'Plant 1000'} ({wpReport.targetQuarter || 'Q3 2026'})
                  </h3>
                </div>
                <span className="px-3 py-1 rounded text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 self-start sm:self-auto">
                  PROJECTED SHORTFALL: -{wpReport.shortfallCount || 8} TECHNICIANS
                </span>
              </div>

              <div className="p-3 bg-slate-950/80 border border-rose-900/50 rounded-lg">
                <p className="text-sm font-medium text-rose-100/90 leading-relaxed font-sans">
                  "{wpReport.shortfallSummary || 'Plant 1000 is projected to have an eight-technician shortfall during the third quarter, primarily in electrical maintenance. Four open requisitions are in progress, but current hiring velocity is unlikely to close the entire gap.'}"
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-slate-400 pt-1">
                <span>Primary Role Affected: <strong className="text-slate-200">{wpReport.roleCategory || 'Electrical Maintenance Technicians'}</strong></span>
                <span>•</span>
                <span>Open Requisitions: <strong className="text-amber-300">{wpReport.openReqsCount || 4} Active</strong></span>
                <span>•</span>
                <span>Hiring Cycle Lead Time: <strong className="text-slate-200">{pipe.avgTimeFillDays || 52} Days</strong></span>
              </div>
            </div>

            {/* CAPACITY EQUATION SUMMARY */}
            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2 border-b border-slate-800 pb-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                Capacity Model Equation & Net Shortfall Calculation
              </h4>

              <div className="grid grid-cols-2 md:grid-cols-7 gap-2 font-mono text-center">
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                  <span className="text-[10px] text-slate-400 block uppercase">Current Active</span>
                  <strong className="text-base font-bold text-emerald-400">+{curr.totalActiveHeadcount || 42} FTE</strong>
                </div>
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                  <span className="text-[10px] text-slate-400 block uppercase">Planned Leave</span>
                  <strong className="text-base font-bold text-rose-400">-{leave.upcomingLeaveFte || 3} FTE</strong>
                </div>
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                  <span className="text-[10px] text-slate-400 block uppercase">Retirements</span>
                  <strong className="text-base font-bold text-rose-400">-{ret.expectedExitsFte || 2} FTE</strong>
                </div>
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                  <span className="text-[10px] text-slate-400 block uppercase">Pipeline Fills</span>
                  <strong className="text-base font-bold text-indigo-400">+{pipe.predictedFillsBeforeQuarterEnd || 1} FTE</strong>
                </div>
                <div className="p-2.5 bg-indigo-950/60 border border-indigo-800 rounded-lg">
                  <span className="text-[10px] text-indigo-300 block uppercase">Effective Available</span>
                  <strong className="text-base font-bold text-indigo-200">{calc.effectiveAvailableFte || 38} FTE</strong>
                </div>
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                  <span className="text-[10px] text-slate-400 block uppercase">Workload Demand</span>
                  <strong className="text-base font-bold text-amber-400">{dem.requiredFte || 45} FTE</strong>
                </div>
                <div className="p-2.5 bg-rose-950/80 border border-rose-700 rounded-lg col-span-2 md:col-span-1">
                  <span className="text-[10px] text-rose-300 block uppercase font-bold">NET SHORTFALL</span>
                  <strong className="text-lg font-bold text-rose-200">-{calc.netCapacityShortfallFte || 8} FTE</strong>
                </div>
              </div>
            </div>

            {/* 8 ANALYZED DIMENSIONS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* DIMENSION 1: CURRENT EMPLOYEES */}
              <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-xs font-bold text-slate-200 font-mono uppercase flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    1. Current Employees Baseline
                  </span>
                  <span className="text-[11px] font-mono font-bold text-emerald-400">{curr.totalActiveHeadcount || 42} Active FTEs</span>
                </div>
                <p className="text-xs text-slate-300">
                  Cost Center: <strong className="font-mono text-indigo-300">{curr.costCenter || 'CC-1000-PM'}</strong> ({curr.department || 'Plant Maintenance'})
                </p>
                <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
                  {curr.primarySpecialties?.map((s: string, idx: number) => (
                    <span key={idx} className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-slate-300">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* DIMENSION 2: PLANNED LEAVE */}
              <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-xs font-bold text-slate-200 font-mono uppercase flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    2. Planned Leave & Absences
                  </span>
                  <span className="text-[11px] font-mono font-bold text-rose-400">-{leave.upcomingLeaveFte || 3} FTEs</span>
                </div>
                <p className="text-xs text-slate-300">
                  {leave.details || '3 technicians on approved parental & extended medical leave during Q3.'}
                </p>
                <div className="text-[11px] font-mono text-slate-400">
                  Scheduled Absences Count: <strong className="text-amber-300">{leave.scheduledAbsencesCount || 3} Confirmed</strong>
                </div>
              </div>

              {/* DIMENSION 3: RETIREMENTS */}
              <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-xs font-bold text-slate-200 font-mono uppercase flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-rose-400" />
                    3. Retirements & Planned Exits
                  </span>
                  <span className="text-[11px] font-mono font-bold text-rose-400">-{ret.expectedExitsFte || 2} FTEs</span>
                </div>
                <p className="text-xs text-slate-300">
                  {ret.details || '2 senior electrical specialists scheduled for pension retirement in August 2026.'}
                </p>
                <div className="text-[11px] font-mono text-slate-400">
                  3-Year Retirement Eligible: <strong className="text-amber-300">{ret.eligible3YearCount || 6} Technicians</strong>
                </div>
              </div>

              {/* DIMENSION 4: HIRING PIPELINE & VELOCITY */}
              <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-xs font-bold text-slate-200 font-mono uppercase flex items-center gap-1.5">
                    <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
                    4. Hiring Pipeline & Conversion Velocity
                  </span>
                  <span className="text-[11px] font-mono font-bold text-indigo-300">+{pipe.predictedFillsBeforeQuarterEnd || 1} Predicted Fill</span>
                </div>
                <p className="text-xs text-slate-300">
                  {pipe.hiringVelocityDeficit || 'Average hiring cycle of 52 days predicts only 1 fill out of 4 open positions before Q3 ends.'}
                </p>
                <div className="space-y-1 font-mono text-[10px]">
                  {pipe.requisitions?.map((rq: any) => (
                    <div key={rq.reqId} className="flex items-center justify-between p-1 bg-slate-950 rounded border border-slate-800/80">
                      <span className="text-indigo-300 font-bold">{rq.reqId}: {rq.title}</span>
                      <span className="text-slate-400">{rq.status} ({rq.ageDays}d old)</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* DIMENSION 5: WORKLOAD DEMAND & PRODUCTION PLANS */}
              <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-xs font-bold text-slate-200 font-mono uppercase flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                    5. Demand & Production Schedule
                  </span>
                  <span className="text-[11px] font-mono font-bold text-amber-300">{dem.requiredFte || 45} FTEs Required</span>
                </div>
                <p className="text-xs text-slate-300">
                  Driver: <strong>{dem.driver || 'Line-A High-Voltage Overhaul & Q3 Peak Volume (+18%)'}</strong>
                </p>
                <div className="text-[11px] font-mono text-slate-400">
                  Production Schedule ID: <strong className="text-indigo-300">{dem.productionScheduleId || 'PROD-2026-Q3-LINE-A/B'}</strong> | Workload: <strong>{dem.workloadHoursWeekly || 1800} hrs/wk</strong>
                </div>
              </div>

              {/* DIMENSION 6: SKILL REQUIREMENTS */}
              <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-xs font-bold text-slate-200 font-mono uppercase flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-cyan-400" />
                    6. Critical Skill Requirements
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
                    {skills.gapSeverity || 'HIGH_OPERATIONAL_RISK'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
                  {skills.coreSkillsNeeded?.map((sk: string, idx: number) => (
                    <span key={idx} className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-cyan-300">
                      • {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* DIMENSION 7: CERTIFICATION STATUS */}
              <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2 col-span-1 md:col-span-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-xs font-bold text-slate-200 font-mono uppercase flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    7. Certification Compliance Status
                  </span>
                  <span className="text-[11px] font-mono font-bold text-emerald-400">{certs.overallCompliancePct || 92.8}% Compliant</span>
                </div>
                <p className="text-xs text-slate-300">
                  {certs.details || '3 active technicians have expired LOTO High-Voltage certifications requiring 40-hour recertification before operating on Line A overhaul.'}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-400">
                  <span>Mandatory Standards:</span>
                  {certs.criticalMandatoryCerts?.map((c: string, idx: number) => (
                    <span key={idx} className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-slate-300">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* RECOMMENDED ACTIONABLE MITIGATIONS */}
            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2 border-b border-slate-800 pb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                8. Actionable Workforce Shortfall Mitigation Roadmap
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {mits.map((m: any, idx: number) => (
                  <div key={idx} className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-indigo-300">{idx + 1}. {m.action}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {m.impact}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {m.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* TAB CONTENT: HR + FINANCE LABOR COST VARIANCE */}
      {activeTab === 'labor_cost_variance' && (() => {
        const lcReport = data && (data.explanationText || data.varianceDrivers)
          ? data
          : hrHcmService.getLaborCostVarianceReport('YTD 2026', 'Plant 1000');

        const drivers = lcReport.varianceDrivers || [];
        const hrComp = lcReport.hrHeadcountAndComp || {};
        const timeOt = lcReport.timeManagementOvertime || {};
        const pyRun = lcReport.payrollActuals || {};
        const fico = lcReport.ficoCostPostings || {};

        return (
          <div className="p-5 space-y-6">
            {/* CFO EXECUTIVE HIGHLIGHT BANNER */}
            <div className="p-5 bg-gradient-to-r from-emerald-950/90 via-slate-900 to-indigo-950/90 border border-emerald-500/40 rounded-xl space-y-3 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-500/20 pb-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-400 shrink-0" />
                  <h3 className="text-sm font-bold text-emerald-200 uppercase tracking-wider font-mono">
                    CFO Executive Query Answer: HR + Finance Labor Cost Variance ({lcReport.timePeriod || 'YTD 2026'})
                  </h3>
                </div>
                <span className="px-3 py-1 rounded text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 self-start sm:self-auto">
                  LABOR COST VARIANCE: +{lcReport.totalIncreasePct || 7.2}% (+$1.28M)
                </span>
              </div>

              {/* EXACT CFO EXPLANATION STATEMENT */}
              <div className="p-4 bg-slate-950/90 border border-emerald-500/30 rounded-lg">
                <p className="text-base font-semibold text-emerald-100 leading-relaxed font-sans">
                  "{lcReport.explanationText || 'Labor cost increased 7.2%. Roughly 62% of the increase comes from overtime at Plant 1000, 24% from new hires, and 14% from annual compensation adjustments.'}"
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-slate-400 pt-1">
                <span>Prior Base Period Cost: <strong className="text-slate-200">${(lcReport.basePeriodCost / 1000000).toFixed(3)}M</strong></span>
                <span>•</span>
                <span>Current Actual Cost: <strong className="text-emerald-300">${(lcReport.currentPeriodCost / 1000000).toFixed(3)}M</strong></span>
                <span>•</span>
                <span>Total Net Expansion: <strong className="text-rose-400">+${(lcReport.totalIncreaseAmount / 1000000).toFixed(2)}M</strong></span>
              </div>
            </div>

            {/* VARIANCE BREAKDOWN CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {drivers.map((drv: any, idx: number) => {
                const colors = idx === 0
                  ? { bg: 'bg-amber-950/40', border: 'border-amber-700/60', text: 'text-amber-300', bar: 'bg-amber-500' }
                  : idx === 1
                  ? { bg: 'bg-indigo-950/40', border: 'border-indigo-700/60', text: 'text-indigo-300', bar: 'bg-indigo-500' }
                  : { bg: 'bg-cyan-950/40', border: 'border-cyan-700/60', text: 'text-cyan-300', bar: 'bg-cyan-500' };

                return (
                  <div key={idx} className={`p-4 ${colors.bg} border ${colors.border} rounded-xl space-y-3`}>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-bold text-slate-200 font-mono uppercase">
                        {drv.category}
                      </span>
                      <strong className={`text-base font-bold font-mono ${colors.text}`}>
                        {drv.percentageShare}%
                      </strong>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400">Cost Variance:</span>
                        <strong className="text-slate-200">+${(drv.amount).toLocaleString()}</strong>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div className={`h-full ${colors.bar}`} style={{ width: `${drv.percentageShare}%` }} />
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-sans pt-1">
                      {drv.details}
                    </p>

                    <div className="p-2 bg-slate-950/90 rounded border border-slate-800/80 space-y-0.5 text-[10px] font-mono text-slate-400">
                      <div>Module: <strong className="text-slate-200">{drv.sapModule}</strong></div>
                      <div>Location/CC: <strong className="text-indigo-300">{drv.primaryLocation} ({drv.costCenter})</strong></div>
                      <div>GL Account: <strong className="text-slate-300">{drv.glAccount}</strong></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 4 INTEGRATED SAP MODULES DETAIL GRID */}
            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-4">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2 border-b border-slate-800 pb-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                Cross-Module Correlation: 4 Integrated SAP Systems (HR, Time Management, Payroll, FI/CO)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. HR MASTER DATA & COMPENSATION */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                    <span className="text-xs font-bold text-slate-200 font-mono uppercase flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-indigo-400" />
                      1. HR Personnel Admin (PA-PA) & Compensation
                    </span>
                    <span className="text-[11px] font-mono text-indigo-300 font-bold">24% + 14% Contribution</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2 bg-slate-900 rounded border border-slate-800">
                      <span className="text-[10px] text-slate-400 block uppercase">Total Headcount</span>
                      <strong className="text-slate-200">{hrComp.totalHeadcount || 485} Employees</strong>
                    </div>
                    <div className="p-2 bg-slate-900 rounded border border-slate-800">
                      <span className="text-[10px] text-slate-400 block uppercase">Net New Hires</span>
                      <strong className="text-emerald-400">+{hrComp.netAdditionsFte || 12} FTEs (+$307.2k)</strong>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300">
                    Annual Merit Scale Adjustment: <strong className="text-indigo-300">+{hrComp.baseCompensationAdjustmentRatePct || 3.1}% across union & salary staff</strong> (Impact: +${(hrComp.compAdjustmentsImpactAmount || 179200).toLocaleString()}).
                  </p>
                </div>

                {/* 2. TIME MANAGEMENT (PT) */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                    <span className="text-xs font-bold text-slate-200 font-mono uppercase flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      2. Time Management (PT) & Overtime
                    </span>
                    <span className="text-[11px] font-mono text-amber-400 font-bold">62% Contribution</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2 bg-slate-900 rounded border border-slate-800">
                      <span className="text-[10px] text-slate-400 block uppercase">Plant 1000 OT Hours</span>
                      <strong className="text-amber-300">{(timeOt.plant1000OvertimeHours || 14250).toLocaleString()} Hours</strong>
                    </div>
                    <div className="p-2 bg-slate-900 rounded border border-slate-800">
                      <span className="text-[10px] text-slate-400 block uppercase">Plant 1000 OT Spend</span>
                      <strong className="text-rose-400">+${(timeOt.plant1000OvertimeCost || 793600).toLocaleString()}</strong>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300">
                    Primary Operational Catalyst: <strong className="text-slate-200">{timeOt.primaryDriver || 'Line-A High-Voltage Overhaul & Backlog Clearance'}</strong> (+48.2% YoY Overtime surge).
                  </p>
                </div>

                {/* 3. PAYROLL EXECUTION (PY) */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                    <span className="text-xs font-bold text-slate-200 font-mono uppercase flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      3. Payroll Payout Execution (PY)
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      {pyRun.payrollStatus || 'POSTED_TO_FICO'}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-slate-300">
                    Latest Run ID: <strong className="text-indigo-300">{pyRun.latestPayrollRunId || 'PAYRUN-2026-M07-FINAL'}</strong>
                  </p>
                  <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono text-center">
                    <div className="p-1.5 bg-slate-900 rounded border border-slate-800">
                      <span className="text-slate-400 block">Base Pay</span>
                      <strong className="text-slate-200">${((pyRun.baseSalaryPayout || 16850000) / 1000000).toFixed(2)}M</strong>
                    </div>
                    <div className="p-1.5 bg-slate-900 rounded border border-slate-800">
                      <span className="text-slate-400 block">Overtime</span>
                      <strong className="text-amber-300">${((pyRun.overtimePayout || 1420000) / 1000000).toFixed(2)}M</strong>
                    </div>
                    <div className="p-1.5 bg-slate-900 rounded border border-slate-800">
                      <span className="text-slate-400 block">Bonus/Merit</span>
                      <strong className="text-cyan-300">${((pyRun.allowancesAndBonusPayout || 788000) / 1000000).toFixed(2)}M</strong>
                    </div>
                  </div>
                </div>

                {/* 4. FI/CO CONTROLLING POSTINGS */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                    <span className="text-xs font-bold text-slate-200 font-mono uppercase flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-cyan-400" />
                      4. FI/CO Labor Cost GL Postings
                    </span>
                    <span className="text-[11px] font-mono text-cyan-300 font-bold">Controlling Area {fico.controllingArea || '1000'}</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Primary Cost Center Absorption: <strong className="text-indigo-300">{fico.primaryCostCenterAffected || 'CC-1000-PM (Plant 1000 Maintenance)'}</strong>
                  </p>
                  <div className="space-y-1 font-mono text-[10px]">
                    {fico.glPostingEntries?.map((gl: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-1 bg-slate-900 rounded border border-slate-800/80">
                        <span className="text-slate-300">{gl.account} - {gl.name}</span>
                        <span className="text-amber-300 font-bold">+${(gl.variance).toLocaleString()} var</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* TAB CONTENT: HR SECURITY & PRIVACY */}
      {activeTab === 'security_privacy' && (() => {
        const secReport = data && (data.rolePermissions || data.fieldLevelMasking)
          ? data
          : hrHcmService.getHrSecurityPrivacyReport('EMP_10042', 'Manager (MSS)', 'IT0008 (Basic Pay)', 'Performance Review');

        const roles = secReport.rolePermissions || [];
        const mssScope = secReport.managerHierarchyScope || {};
        const country = secReport.countryLegalEntityRestrictions || {};
        const purpose = secReport.purposeBasedAccess || {};
        const masking = secReport.fieldLevelMasking || [];
        const logs = secReport.securityAuditLog || [];
        const ilm = secReport.ilmDataRetentionPolicies || [];

        return (
          <div className="p-5 space-y-6">
            {/* EXECUTIVE SECURITY BANNER */}
            <div className="p-5 bg-gradient-to-r from-slate-950 via-rose-950/40 to-slate-950 border border-rose-500/40 rounded-xl space-y-3 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-500/20 pb-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-rose-400 shrink-0" />
                  <h3 className="text-sm font-bold text-rose-200 uppercase tracking-wider font-mono">
                    SAP HR Security, Privacy & Compliance Enforcement
                  </h3>
                </div>
                <span className="px-3 py-1 rounded text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 self-start sm:self-auto flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-rose-400" />
                  STRICT HR DATA ISOLATION ACTIVE
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                HR Master Data is subject to strict SAP authorization checks (<code className="text-rose-300 font-mono">P_ORGIN</code>, <code className="text-rose-300 font-mono">P_ORGXX</code>, <code className="text-rose-300 font-mono">P_PERNR</code>, <code className="text-rose-300 font-mono">P_COMP</code>), Manager Hierarchy Scope, Legal Entity Restrictions, Purpose-Bound Processing, Dynamic Field-Level Masking, and ILM Data Retention Policies.
              </p>

              <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-400 pt-1">
                <span className="px-2 py-0.5 bg-slate-900 rounded border border-slate-800 text-indigo-300">
                  Target Infotype: <strong>{secReport.targetInfotype || 'IT0008 (Basic Pay)'}</strong>
                </span>
                <span className="px-2 py-0.5 bg-slate-900 rounded border border-slate-800 text-emerald-300">
                  Purpose: <strong>{secReport.accessPurpose || 'Performance Review'}</strong>
                </span>
                <span className="px-2 py-0.5 bg-slate-900 rounded border border-slate-800 text-amber-300">
                  Active User: <strong>{secReport.userId || 'EMP_10042'} ({secReport.userRole || 'Manager MSS'})</strong>
                </span>
              </div>
            </div>

            {/* SECTION 1: HUMAN APPROVAL MODEL (3-TIER GOVERNANCE MATRIX) */}
            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  1. Human Approval Model & Action Governance Matrix
                </h4>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  3-TIER SAP HR GOVERNANCE
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* TIER 1: FULLY AUTONOMOUS */}
                <div className="p-3.5 bg-slate-950 border border-emerald-500/30 rounded-lg space-y-2.5">
                  <div className="flex items-center justify-between border-b border-emerald-500/20 pb-1.5">
                    <span className="text-xs font-bold text-emerald-300 font-mono flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      Fully Autonomous / Read-Only
                    </span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300">
                      LOW RISK
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans leading-snug">
                    Safe read-only lookups & approved employee self-service queries executed instantly with zero human latency.
                  </p>
                  <ul className="space-y-1 text-xs font-mono text-slate-300">
                    {[
                      'Employee self-service lookup',
                      'Leave balance',
                      'Organization lookup',
                      'Training status',
                      'Approved workforce KPIs',
                      'Payslip retrieval for authenticated employee',
                      'Position lookup'
                    ].map((op, idx) => (
                      <li key={idx} className="flex items-center gap-1.5 text-emerald-200/90 text-[11px]">
                        <span className="text-emerald-400">✓</span> {op}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* TIER 2: POLICY-CONTROLLED */}
                <div className="p-3.5 bg-slate-950 border border-amber-500/30 rounded-lg space-y-2.5">
                  <div className="flex items-center justify-between border-b border-amber-500/20 pb-1.5">
                    <span className="text-xs font-bold text-amber-300 font-mono flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      Policy-Controlled
                    </span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300">
                      MEDIUM RISK
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans leading-snug">
                    Automated execution governed by SAP business rules, quota validations, and pre-configured policy limits.
                  </p>
                  <ul className="space-y-1 text-xs font-mono text-slate-300">
                    {[
                      'Submit leave',
                      'Update allowed employee contact information',
                      'Submit timesheet',
                      'Assign approved training',
                      'Create HR service request'
                    ].map((op, idx) => (
                      <li key={idx} className="flex items-center gap-1.5 text-amber-200/90 text-[11px]">
                        <span className="text-amber-400">⚙️</span> {op}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* TIER 3: HUMAN APPROVAL REQUIRED */}
                <div className="p-3.5 bg-slate-950 border border-rose-500/30 rounded-lg space-y-2.5">
                  <div className="flex items-center justify-between border-b border-rose-500/20 pb-1.5">
                    <span className="text-xs font-bold text-rose-300 font-mono flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                      Human Approval Required
                    </span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-rose-500/20 text-rose-300">
                      HIGH RISK
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans leading-snug">
                    Mandatory signoff required from Manager, HR BP, or Compensation Committee before execution in S/4HANA.
                  </p>
                  <ul className="space-y-1 text-xs font-mono text-slate-300">
                    {[
                      'Compensation change',
                      'Promotion',
                      'Termination',
                      'Employee transfer',
                      'Payroll override',
                      'Organization restructuring',
                      'Position deletion',
                      'Sensitive master-data changes',
                      'Privileged HR access',
                      'Mass employee changes'
                    ].map((op, idx) => (
                      <li key={idx} className="flex items-center gap-1.5 text-rose-200/90 text-[11px]">
                        <span className="text-rose-400">🛑</span> {op}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* SECTION 2: SENSITIVE FIELDS EXTRA PROTECTION & LLM CONTEXT MINIMIZATION */}
            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
                  <EyeOff className="w-4 h-4 text-cyan-400" />
                  2. Sensitive Fields Extra Protection & LLM Context Minimization
                </h4>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  LEAST PRIVILEGE / MINIMAL CONTEXT RULE
                </span>
              </div>

              <div className="p-3 bg-cyan-950/30 border border-cyan-800/50 rounded-lg space-y-1">
                <div className="text-xs font-bold text-cyan-300 font-mono flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-cyan-400" />
                  LLM Context Minimization Rule Active
                </div>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  The LLM receives <strong>only the minimum information needed</strong> for the specific task. Raw sensitive fields (SSN, IBAN, base pay, tax brackets, health notes) are automatically stripped, masked, or tokenized before prompt completion context window injection.
                </p>
              </div>

              {/* 8 SENSITIVE FIELD CATEGORIES GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {[
                  { title: '1. Compensation', infotype: 'IT0008, IT0014, IT0015, IT0758, IT0759', status: 'MASKED', color: 'rose', desc: 'Base salary (€████████) & bonus amounts masked; aggregated bands only.' },
                  { title: '2. Bank Details', infotype: 'IT0009 (Bank Details)', status: 'RESTRICTED', color: 'amber', desc: 'IBAN (DE89 XXXX 4109) masked; strictly excluded from standard LLM prompts.' },
                  { title: '3. Tax Information', infotype: 'IT0012, IT0210 (Tax DE/US)', status: 'RESTRICTED', color: 'amber', desc: 'Tax brackets & TIN stripped before context injection; DE01 Payroll Admin only.' },
                  { title: '4. National Identifiers', infotype: 'IT0002 (SSN / Tax ID / Passport)', status: 'TOKENIZED', color: 'indigo', desc: 'SSN (XXX-XX-4829) tokenized/masked; plaintext PII never sent to LLM.' },
                  { title: '5. Benefits Data', infotype: 'IT0167, IT0168, IT0171 (Benefits)', status: 'STRIPPED', color: 'cyan', desc: 'Medical coverage & beneficiaries stripped; high-level eligibility flag passed.' },
                  { title: '6. Leave Details', infotype: 'IT2001, IT2002, IT2006 (Absences)', status: 'REDACTED', color: 'emerald', desc: 'Absence quota passed (14 days); medical leave reasons strictly redacted.' },
                  { title: '7. Disciplinary Info', infotype: 'IT0084 & HR Incident Files', status: 'CONFIDENTIAL', color: 'rose', desc: 'Disciplinary warnings isolated from LLM context; accessible solely by HR BP.' },
                  { title: '8. Performance Records', infotype: 'IT0759 & Appraisals', status: 'PURPOSE_BOUND', color: 'indigo', desc: 'Ratings restricted to manager evaluation path O-S-P during review cycle.' }
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1.5 font-mono">
                    <div className="flex items-center justify-between text-xs">
                      <strong className="text-slate-200">{item.title}</strong>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-900 text-indigo-300 border border-slate-800">
                        {item.status}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{item.infotype}</div>
                    <p className="text-[11px] text-slate-300 font-sans leading-snug">{item.desc}</p>
                  </div>
                ))}
              </div>

              {/* LIVE CONTEXT MINIMIZATION DEMO CARD */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                <div className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider flex justify-between items-center">
                  <span>Dynamic Payload Stripper in Action (Leave Balance Prompt)</span>
                  <span className="text-emerald-400 text-[10px]">6 Sensitive Fields Stripped Prior to LLM</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-2.5 bg-rose-950/20 border border-rose-900/40 rounded space-y-1">
                    <div className="text-[10px] text-rose-300 font-bold uppercase">Raw S/4HANA Infotype Record (Before Filtering)</div>
                    <pre className="text-[10px] text-slate-400 overflow-x-auto leading-tight">
{`{
  pernr: "10042109",
  ssn: "839-20-4829",          // Stripped
  iban: "DE893704004405...",   // Stripped
  baseSalary: 92500,           // Stripped
  taxClass: "Tax Class 1",     // Stripped
  absenceQuotaAvailable: 14,   // KEPT
  medicalNote: "Confidential"  // Stripped
}`}
                    </pre>
                  </div>
                  <div className="p-2.5 bg-emerald-950/20 border border-emerald-900/40 rounded space-y-1">
                    <div className="text-[10px] text-emerald-300 font-bold uppercase">Minimal LLM Payload Injected to Context Window</div>
                    <pre className="text-[10px] text-emerald-200 overflow-x-auto leading-tight">
{`{
  pernr: "10042109",
  absenceQuotaAvailable: 14
}

// Result: Minimum information needed for task
// Zero unneeded PII/compensation data exposed!`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: ROLE-BASED ACCESS CONTROL (RBAC) */}
            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-4">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2 border-b border-slate-800 pb-2">
                <Key className="w-4 h-4 text-indigo-400" />
                3. Role-Based Access Control (RBAC) & SAP Auth Objects
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {roles.map((r: any, idx: number) => (
                  <div key={idx} className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                      <span className="text-xs font-bold text-indigo-300 font-mono">
                        {r.role}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        Auth Object: {r.authObject}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 font-sans">{r.description}</p>

                    <div className="space-y-1 text-[11px] font-mono">
                      <div className="text-slate-400">
                        Scope: <strong className="text-slate-200">{r.scope}</strong>
                      </div>
                      <div className="text-slate-400">
                        Allowed Infotypes: <strong className="text-emerald-300">{r.infotypesAllowed?.join(', ')}</strong>
                      </div>
                      <div className="text-slate-400">
                        Field Masking: <strong className="text-amber-300">{r.fieldMasking}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 4: MANAGER HIERARCHY & COUNTRY RESTRICTIONS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* MANAGER HIERARCHY SCOPE */}
              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2 border-b border-slate-800 pb-2">
                  <Users className="w-4 h-4 text-amber-400" />
                  4. Manager Hierarchy Scope (MSS Path O-S-P)
                </h4>

                <div className="space-y-2 text-xs font-mono">
                  <div className="p-2.5 bg-slate-950 rounded border border-slate-800 space-y-1">
                    <div className="flex justify-between text-slate-400">
                      <span>Manager Position:</span>
                      <strong className="text-slate-200">{mssScope.managerPosition}</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Org Unit / CC:</span>
                      <strong className="text-indigo-300">{mssScope.orgUnit}</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Evaluation Path:</span>
                      <strong className="text-amber-300">{mssScope.evaluationPath}</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 bg-slate-950 rounded border border-slate-800">
                      <span className="text-[10px] text-slate-400 block uppercase">Direct Reports</span>
                      <strong className="text-emerald-400 text-sm">{mssScope.directReportsCount} Employees</strong>
                    </div>
                    <div className="p-2 bg-slate-950 rounded border border-slate-800">
                      <span className="text-[10px] text-slate-400 block uppercase">Indirect Reports</span>
                      <strong className="text-indigo-300 text-sm">{mssScope.indirectReportsCount} Employees</strong>
                    </div>
                  </div>

                  {mssScope.outOfScopeAttempt && (
                    <div className="p-3 bg-rose-950/40 border border-rose-700/60 rounded-lg space-y-1">
                      <div className="flex items-center justify-between text-rose-300 font-bold">
                        <span className="flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                          Out-of-Scope Hierarchy Attempt
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-200 border border-rose-500/30">
                          {mssScope.outOfScopeAttempt.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-rose-200 font-sans">
                        Attempted PERNR: <strong className="font-mono">{mssScope.outOfScopeAttempt.attemptedPernr}</strong>
                      </p>
                      <p className="text-[10px] text-rose-300/80 font-sans italic">
                        {mssScope.outOfScopeAttempt.reason}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* COUNTRY & PURPOSE-BASED RESTRICTIONS */}
              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2 border-b border-slate-800 pb-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  3. Country Isolation & GDPR Purpose Binding
                </h4>

                <div className="space-y-2 text-xs font-mono">
                  <div className="p-2.5 bg-slate-950 rounded border border-slate-800 space-y-1">
                    <div className="flex justify-between text-slate-400">
                      <span>User Legal Entity:</span>
                      <strong className="text-slate-200">{country.userCountryGrouping}</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Target Entity:</span>
                      <strong className="text-cyan-300">{country.targetCountryGrouping}</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Cross-Border Policy:</span>
                      <strong className="text-amber-300">{country.crossBorderTransferPolicy}</strong>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 font-sans bg-slate-950 p-2.5 rounded border border-slate-800">
                    🛡️ <strong className="text-rose-300">Legal Boundary Enforcement</strong>: {country.enforcement}
                  </p>

                  <div className="p-2.5 bg-slate-950 rounded border border-slate-800 space-y-1.5">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-1">
                      <span className="text-slate-400">Purpose Code:</span>
                      <strong className="text-emerald-300">{purpose.purposeBindingCode}</strong>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Allowed Infotypes: <span className="text-emerald-400 font-bold">{purpose.allowedInfotypesForPurpose?.join(', ')}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Blocked Infotypes: <span className="text-rose-400 font-bold">{purpose.disallowedInfotypesForPurpose?.join(', ')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 5: DYNAMIC FIELD-LEVEL MASKING */}
            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2 border-b border-slate-800 pb-2">
                <EyeOff className="w-4 h-4 text-emerald-400" />
                5. Dynamic Field-Level Masking & Compensation Privacy
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono text-left text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="p-2.5">Sensitive Field Name</th>
                      <th className="p-2.5">Raw S/4HANA Value</th>
                      <th className="p-2.5">Masked Display Value</th>
                      <th className="p-2.5">Enforcement Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {masking.map((m: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="p-2.5 font-bold text-slate-200">{m.fieldName}</td>
                        <td className="p-2.5 text-slate-500 line-through font-mono">{m.rawValue}</td>
                        <td className="p-2.5 font-bold text-emerald-300 font-mono bg-slate-950/60 rounded px-2">{m.maskedValue}</td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            {m.accessLevel}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SECTION 6: IMMUTABLE AUDIT LOG & ILM RETENTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* IMMUTABLE AUDIT LOG */}
              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2 border-b border-slate-800 pb-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  6. SAP Security Audit Log (SM20 / Cryptographic Hash)
                </h4>

                <div className="space-y-2">
                  {logs.map((log: any, idx: number) => (
                    <div key={idx} className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg space-y-1 font-mono text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-indigo-300 font-bold">{log.logId}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          log.accessResult.includes('GRANTED')
                            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                        }`}>
                          {log.accessResult}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex justify-between">
                        <span>User: <strong>{log.userId} ({log.role})</strong></span>
                        <span>Target: <strong>PERNR {log.targetPernr}</strong></span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        Hash: <code className="text-slate-400">{log.auditHash}</code>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ILM DATA RETENTION POLICIES */}
              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2 border-b border-slate-800 pb-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  7. Information Lifecycle Management (ILM) Retention
                </h4>

                <div className="space-y-2 font-mono text-xs">
                  {ilm.map((item: any, idx: number) => (
                    <div key={idx} className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                      <div className="flex items-center justify-between border-b border-slate-800/60 pb-1">
                        <span className="text-slate-200 font-bold">{item.infotype}</span>
                        <span className="text-amber-300 font-bold">{item.retentionPeriod}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-sans">
                        Legal Basis: <strong className="text-slate-300 font-mono">{item.legalBasis}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
