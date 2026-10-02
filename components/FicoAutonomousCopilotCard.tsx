import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  Building2,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Users,
  Bot,
  Activity,
  Briefcase,
  Clock,
  Lock,
  RefreshCw,
  Eye,
  PieChart,
  BarChart3,
  Zap,
  Search,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  HelpCircle,
  Check,
  Calendar,
  CheckSquare,
  FileSpreadsheet,
  Scale,
  FileCheck,
  AlertCircle,
  ArrowRight,
  Download,
  Calculator,
  Sliders,
  Target,
  Percent
} from 'lucide-react';
import { ficoService } from '../services/ficoService';
import {
  FicoAutonomousCopilotReport,
  FicoAcdocaLineItem,
  FicoHumanInTheLoopApproval,
  FicoAgentCollaborationTask,
  FicoAuditTrailEntry,
  FicoAutonomousActionResult,
  FicoActionType,
  FinancialCloseAutomationReport,
  AccountsPayableAutomationReport,
  AccountsReceivableAutomationReport,
  ApVendorInvoiceItem,
  ApPaymentScheduleProposal,
  ApCashFlowPrioritizationSummary,
  ArLatePaymentPredictionItem,
  ArCollectionPriorityItem,
  ArCustomerStatement,
  ArBankPaymentMatchingItem,
  CostControllingAutomationReport,
  FicoFraudComplianceReport,
  FicoDuplicateVendorPayment,
  FicoUnusualJournalEntry,
  FicoSodViolation,
  FicoSuspiciousPaymentPattern,
  FicoPolicyComplianceRule,
  FicoAuditEvidenceReport,
  FicoRiskControlRecommendation,
  FicoCashFlowForecastPeriod,
  FicoMonthEndProfitPrediction,
  FicoOpexForecastItem,
  FicoWorkingCapitalRequirements,
  FicoBudgetOverrunPrediction,
  FicoCustomerPaymentBehaviorForecast,
  FicoFinancialSensitivitySimulation
} from '../types';

interface FicoAutonomousCopilotCardProps {
  data?: any;
}

export const FicoAutonomousCopilotCard: React.FC<FicoAutonomousCopilotCardProps> = ({ data }) => {
  const [report, setReport] = useState<FicoAutonomousCopilotReport | null>(null);
  const [closeReport, setCloseReport] = useState<FinancialCloseAutomationReport | null>(null);
  const [apReport, setApReport] = useState<AccountsPayableAutomationReport | null>(null);
  const [arReport, setArReport] = useState<AccountsReceivableAutomationReport | null>(null);
  const [coReport, setCoReport] = useState<CostControllingAutomationReport | null>(null);
  const [fraudReport, setFraudReport] = useState<FicoFraudComplianceReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTab, setSelectedTab] = useState<'kpi' | 'executiveQueries' | 'fraud' | 'co' | 'ar' | 'ap' | 'close' | 'acdoca' | 'collaboration' | 'approvals' | 'predictive' | 'security' | 'audit' | 'actions'>('kpi');
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>('Q1');
  const [selectedQuestionCategory, setSelectedQuestionCategory] = useState<string>('all');
  const [executiveSearchQuery, setExecutiveSearchQuery] = useState<string>('');
  const [selectedStatementTab, setSelectedStatementTab] = useState<'balanceSheet' | 'incomeStatement' | 'cashFlow'>('balanceSheet');
  const [selectedApFilter, setSelectedApFilter] = useState<'all' | 'blocked' | 'duplicate' | 'discount' | 'unmatched'>('all');
  const [selectedArFilter, setSelectedArFilter] = useState<'all' | 'highRisk' | 'priorities' | 'statements' | 'bankMatches' | 'differences'>('all');
  const [selectedCoFilter, setSelectedCoFilter] = useState<'all' | 'anomalies' | 'allocations' | 'budget' | 'forecasts' | 'profitability' | 'savings'>('all');
  const [selectedFraudFilter, setSelectedFraudFilter] = useState<'all' | 'duplicates' | 'unusualJournals' | 'sod' | 'suspiciousPayments' | 'policies' | 'evidence' | 'controls'>('all');
  const [selectedPredictiveFilter, setSelectedPredictiveFilter] = useState<'all' | 'cashFlow' | 'monthEndProfit' | 'opex' | 'workingCapital' | 'budgetOverruns' | 'paymentBehavior' | 'sensitivity'>('all');
  const [simPriceChange, setSimPriceChange] = useState<number>(5.0);
  const [simVolumeChange, setSimVolumeChange] = useState<number>(0.0);
  const [simCostChange, setSimCostChange] = useState<number>(0.0);
  const [companyCode, setCompanyCode] = useState<string>('1710');
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [approvalModalItem, setApprovalModalItem] = useState<FicoHumanInTheLoopApproval | null>(null);
  const [approvalComments, setApprovalComments] = useState<string>('');
  const [acdocaFilter, setAcdocaFilter] = useState<string>('');
  const [lastActionResult, setLastActionResult] = useState<FicoAutonomousActionResult | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState<number>(125000);
  const [customDocNum, setCustomDocNum] = useState<string>('10002001');
  const [customPeriod, setCustomPeriod] = useState<string>('03/2026');
  const [customVendorNo, setCustomVendorNo] = useState<string>('VEND-3091');
  const [customCustomerNo, setCustomCustomerNo] = useState<string>('CUST-10042');

  const loadReport = async (cc: string) => {
    setLoading(true);
    try {
      const rep = await ficoService.getFicoAutonomousCopilotReport('Enterprise FI/CO Autonomous Copilot Query', cc);
      const closeData = ficoService.getFinancialCloseAutomation(cc);
      const apData = ficoService.getAccountsPayableAutomation(cc);
      const arData = ficoService.getAccountsReceivableAutomation(cc);
      const coData = ficoService.getCostControllingAutomation(cc);
      const fraudData = ficoService.getFraudDetectionAndCompliance(cc);
      setReport(rep);
      setCloseReport(closeData);
      setApReport(apData);
      setArReport(arData);
      setCoReport(coData);
      setFraudReport(fraudData);
    } catch (err) {
      console.error('Error loading FI/CO report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (data?.matchedQuestion) {
      setSelectedTab('executiveQueries');
      setSelectedQuestionId(data.matchedQuestion.questionId);
      if (data.matchedQuestion.category) {
        setSelectedQuestionCategory(data.matchedQuestion.category);
      }
      if (data.companyCode) {
        setCompanyCode(data.companyCode);
      }
      setReport(data);
    } else if (data?.duplicatePayments || data?.type === 'fraud_compliance' || data?.sodViolations) {
      setSelectedTab('fraud');
      if (data.duplicatePayments) {
        setFraudReport(data);
      }
    } else if (data?.costAnomalies || data?.type === 'cost_controlling_automation' || data?.totalControllingBudget) {
      setSelectedTab('co');
      if (data.costAnomalies) {
        setCoReport(data);
      }
    } else if (data?.latePaymentPredictions || data?.type === 'accounts_receivable_automation' || data?.totalArBalance) {
      setSelectedTab('ar');
      if (data.latePaymentPredictions) {
        setArReport(data);
      }
    } else if (data?.vendorInvoices || data?.type === 'accounts_payable_automation' || data?.totalOpenApInvoicesCount) {
      setSelectedTab('ap');
      if (data.vendorInvoices) {
        setApReport(data);
      }
    } else if (data?.overallCloseCompletionPct || data?.type === 'financial_close_automation' || data?.companyCloseStatuses) {
      setSelectedTab('close');
      if (data.overallCloseCompletionPct) {
        setCloseReport(data);
      }
    } else if (data?.universalJournalSummary || data?.kpis) {
      setReport(data);
    }
  }, [data]);

  const handleExecuteAction = async (actionType: FicoActionType, customParams?: any) => {
    setActionLoading(actionType);
    try {
      const res = await ficoService.executeAutonomousFinancialAction({
        actionType,
        companyCode,
        requestedBy: 'kumbagiri9@gmail.com',
        parameters: customParams || {
          amount: customAmount,
          documentNumber: customDocNum,
          postingPeriod: customPeriod,
          vendorNumber: customVendorNo,
          customerNumber: customCustomerNo
        }
      });
      setLastActionResult(res);
      setActionMessage(res.message);
      loadReport(companyCode);
      setTimeout(() => setActionMessage(null), 6000);
    } catch (err: any) {
      setActionMessage(`Execution Error: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    loadReport(companyCode);
  }, [companyCode]);

  const handleApproveReject = (approvalId: string, action: 'APPROVED' | 'REJECTED') => {
    try {
      const res = ficoService.approveOrRejectFinancialAction(approvalId, action, 'kumbagiri9@gmail.com', approvalComments);
      setActionMessage(res.message);
      setApprovalModalItem(null);
      setApprovalComments('');
      loadReport(companyCode);
      setTimeout(() => setActionMessage(null), 5000);
    } catch (err: any) {
      setActionMessage(`Error: ${err.message}`);
    }
  };

  if (loading && !report) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-white flex flex-col items-center justify-center space-y-4 my-4">
        <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
        <p className="text-slate-300 font-medium">Connecting to S/4HANA ACDOCA Ledgers & FICO Copilot Engine...</p>
      </div>
    );
  }

  const kpis = report?.kpis;
  const acdoca = report?.universalJournalSummary;
  const col = report?.multiAgentCollaboration;
  const pred = report?.predictiveAi;
  const sec = report?.roleSecurity;

  const filteredAcdocaItems = acdoca?.lineItems.filter(item => {
    if (!acdocaFilter) return true;
    const q = acdocaFilter.toLowerCase();
    return (
      item.accountingDocument.toLowerCase().includes(q) ||
      item.glAccount.toLowerCase().includes(q) ||
      item.accountName.toLowerCase().includes(q) ||
      item.ledger.toLowerCase().includes(q) ||
      (item.costCenter && item.costCenter.toLowerCase().includes(q)) ||
      (item.profitCenter && item.profitCenter.toLowerCase().includes(q))
    );
  }) || [];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl text-slate-100 my-4 font-sans">
      {/* HEADER SECTION */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 p-6 border-b border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-600/20 border border-blue-500/40 rounded-xl text-blue-400 shadow-lg">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-white tracking-wide">Autonomous SAP FI/CO Copilot</h2>
                <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Live S/4HANA ACDOCA
                </span>
              </div>
              <p className="text-slate-400 text-sm mt-0.5">
                Universal Journal (ACDOCA) • Multi-Agent Cross-Functional Financial Analytics • PFCG Security Grounded
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <label className="text-xs text-slate-400 font-medium">Company Code:</label>
            <select
              value={companyCode}
              onChange={(e) => setCompanyCode(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1710">1710 - US Domestic Corp</option>
              <option value="1720">1720 - US Services Inc</option>
              <option value="1010">1010 - EU Operations SE</option>
            </select>
            <button
              onClick={() => loadReport(companyCode)}
              className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg transition-colors"
              title="Refresh Live Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* NARRATIVE EXECUTIVE BANNER */}
        {report?.aiExecutiveNarrative && (
          <div className="mt-4 p-3.5 bg-blue-950/40 border border-blue-800/50 rounded-lg flex items-start space-x-3">
            <Bot className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-200 leading-relaxed">{report.aiExecutiveNarrative}</p>
          </div>
        )}

        {/* NOTIFICATION MESSAGES */}
        {actionMessage && (
          <div className="mt-3 p-3 bg-emerald-900/60 border border-emerald-500 text-emerald-200 text-xs rounded-lg flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}
      </div>

      {/* TOP NAVIGATION TABS */}
      <div className="flex border-b border-slate-800 bg-slate-950 overflow-x-auto scrollbar-none">
        {[
          { id: 'kpi', label: 'Executive Cockpit', icon: BarChart3 },
          { id: 'executiveQueries', label: 'Executive AI Query & Insights', icon: HelpCircle, badge: '50 Live Queries', highlight: true },
          { id: 'fraud', label: 'Fraud Detection & Compliance', icon: ShieldCheck, badge: fraudReport ? `${fraudReport.duplicatePaymentsCount + fraudReport.sodViolationsCount} Flags` : 'SOX/Audit', highlight: true },
          { id: 'co', label: 'Cost Controlling Automation', icon: PieChart, badge: coReport ? `${coReport.abnormalCostVariancesCount} Spikes` : 'CO Auto', highlight: true },
          { id: 'ar', label: 'Accounts Receivable Automation', icon: CheckSquare, badge: arReport ? `${arReport.highRiskLatePayersCount} High Risk` : 'AR Auto', highlight: true },
          { id: 'ap', label: 'Accounts Payable Automation', icon: DollarSign, badge: apReport ? `${apReport.blockedInvoicesCount} Blocked` : '3-Way Match', highlight: true },
          { id: 'close', label: 'Financial Close Automation', icon: Calendar, badge: `${closeReport?.overallCloseCompletionPct || 88}%`, highlight: true },
          { id: 'actions', label: 'Autonomous Actions', icon: Zap, badge: '20 Ops', highlight: true },
          { id: 'acdoca', label: 'Universal Journal (ACDOCA)', icon: Layers, badge: acdoca?.totalJournalEntries },
          { id: 'collaboration', label: 'Multi-Agent Finance', icon: Users },
          { id: 'approvals', label: 'Governance Approvals', icon: ShieldCheck, badge: report?.pendingApprovalsCount, highlight: (report?.pendingApprovalsCount || 0) > 0 },
          { id: 'predictive', label: 'Predictive AI', icon: TrendingUp },
          { id: 'security', label: 'PFCG Role Security', icon: Lock },
          { id: 'audit', label: 'Audit Trail', icon: FileText }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-3 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'border-blue-500 text-blue-400 bg-slate-900/80 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    tab.highlight
                      ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: EXECUTIVE COCKPIT KPIs */}
      {selectedTab === 'kpi' && kpis && (
        <div className="p-6 space-y-6">
          {/* QUICK EXECUTIVE QUESTIONS WIDGET */}
          {report?.executiveInsights && (
            <div className="bg-gradient-to-r from-slate-900 via-blue-950/50 to-slate-900 border border-blue-800/40 p-4 rounded-2xl space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-400" /> Executive AI Copilot — Key CFO Questions
                </h3>
                <button
                  onClick={() => setSelectedTab('executiveQueries')}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 transition-colors"
                >
                  View Full Insights & Deep Dives <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {report.executiveInsights.questionsAnswers.slice(0, 4).map((q) => (
                  <button
                    key={q.questionId}
                    onClick={() => {
                      setSelectedQuestionId(q.questionId);
                      setSelectedTab('executiveQueries');
                    }}
                    className="p-2.5 bg-slate-800/80 hover:bg-blue-600/30 border border-slate-700/80 hover:border-blue-500/50 rounded-xl text-left text-xs text-slate-200 transition-all flex items-start gap-2 group"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5 group-hover:text-white" />
                    <span className="group-hover:text-white font-medium line-clamp-2">{q.questionText}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-xl">
              <p className="text-xs text-slate-400 font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-white mt-1">€{(kpis.totalRevenueEuros / 1000000).toFixed(2)}M</p>
              <span className="inline-flex items-center text-[10px] text-emerald-400 mt-1 font-medium">
                <ArrowUpRight className="w-3 h-3 mr-0.5" /> +8.4% vs target
              </span>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-xl">
              <p className="text-xs text-slate-400 font-medium">Net Profit Margin</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{kpis.netProfitMarginPct}%</p>
              <span className="inline-flex items-center text-[10px] text-emerald-400 mt-1 font-medium">
                <ArrowUpRight className="w-3 h-3 mr-0.5" /> +2.1% YoY
              </span>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-xl">
              <p className="text-xs text-slate-400 font-medium">Working Capital</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">€{(kpis.workingCapitalEuros / 1000000).toFixed(2)}M</p>
              <span className="inline-flex items-center text-[10px] text-slate-400 mt-1">
                Healthy liquidity buffer
              </span>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-xl">
              <p className="text-xs text-slate-400 font-medium">Operating Cash Flow</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">€{(kpis.operatingCashFlowEuros / 1000000).toFixed(2)}M</p>
              <span className="inline-flex items-center text-[10px] text-emerald-400 mt-1 font-medium">
                <Check className="w-3 h-3 mr-0.5" /> Positive cash flow
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-xl space-y-4">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" /> Working Capital & Subledgers
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  <p className="text-slate-400">Open AR (Receivables)</p>
                  <p className="text-lg font-bold text-blue-400 mt-0.5">€{(kpis.openArEuros / 1000000).toFixed(2)}M</p>
                  <p className="text-[10px] text-slate-400 mt-1">DSO: <span className="text-white font-medium">{kpis.dsoDays} Days</span></p>
                </div>
                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  <p className="text-slate-400">Open AP (Payables)</p>
                  <p className="text-lg font-bold text-purple-400 mt-0.5">€{(kpis.openApEuros / 1000000).toFixed(2)}M</p>
                  <p className="text-[10px] text-slate-400 mt-1">DPO: <span className="text-white font-medium">{kpis.dpoDays} Days</span></p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-xl space-y-3">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" /> Universal Journal (ACDOCA) Health
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {acdoca?.aiUniversalJournalInsights.map((insight, i) => (
                  <li key={i} className="flex items-start gap-2 bg-slate-900/50 p-2.5 rounded border border-slate-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB: EXECUTIVE AI QUERY & INSIGHTS */}
      {selectedTab === 'executiveQueries' && report?.executiveInsights && (
        <div className="p-6 space-y-6">
          {/* SEARCH & QUESTION SELECTOR BANNER */}
          <div className="bg-gradient-to-r from-slate-950 via-blue-950/60 to-slate-950 border border-blue-800/40 p-5 rounded-2xl shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-400" /> Executive AI Copilot — Natural Language Financial Q&A
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Ask real-time questions or select key CFO inquiries to query ACDOCA Universal Journal, CO-PA Profitability, and subledger tables in S/4HANA.
                </p>
              </div>
              <span className="bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs px-3 py-1 rounded-full font-semibold shrink-0">
                Company Code {companyCode} • Live Grounded
              </span>
            </div>

            {/* CATEGORY FILTER TABS */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'all', label: 'All 50 Queries' },
                { id: 'General Finance', label: 'General Finance (FI)' },
                { id: 'Accounts Payable', label: 'Accounts Payable (AP)' },
                { id: 'Accounts Receivable', label: 'Accounts Receivable (AR)' },
                { id: 'General Ledger', label: 'General Ledger (GL)' },
                { id: 'Cost Controlling', label: 'Cost Controlling (CO)' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedQuestionCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                    selectedQuestionCategory === cat.id
                      ? 'bg-blue-600 text-white border-blue-400 shadow'
                      : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* QUERY SEARCH INPUT */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search 50 executive questions or type financial prompt (e.g. overdue, profit, cost drivers, cash flow, journal entries)..."
                value={executiveSearchQuery}
                onChange={(e) => setExecutiveSearchQuery(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* PRE-SET EXECUTIVE QUESTION BUTTON CHIPS */}
            <div className="flex flex-wrap gap-2 pt-1 max-h-60 overflow-y-auto scrollbar-thin pr-1">
              {report.executiveInsights.questionsAnswers
                .filter(q => {
                  const matchesCategory = selectedQuestionCategory === 'all' || q.category.toLowerCase() === selectedQuestionCategory.toLowerCase();
                  const matchesSearch = !executiveSearchQuery || 
                    q.questionText.toLowerCase().includes(executiveSearchQuery.toLowerCase()) || 
                    q.category.toLowerCase().includes(executiveSearchQuery.toLowerCase()) ||
                    q.summaryAnswer.toLowerCase().includes(executiveSearchQuery.toLowerCase());
                  return matchesCategory && matchesSearch;
                })
                .map((q) => {
                  const isSelected = selectedQuestionId === q.questionId;
                  return (
                    <button
                      key={q.questionId}
                      onClick={() => setSelectedQuestionId(q.questionId)}
                      className={`px-3 py-2 text-xs rounded-xl border transition-all text-left flex items-center gap-2 font-medium ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-400 shadow-md ring-2 ring-blue-500/40 font-semibold'
                          : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700/80 hover:text-white'
                      }`}
                    >
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-blue-300 font-bold border border-slate-700">{q.questionId}</span>
                      <span>{q.questionText}</span>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* ACTIVE SELECTED QUESTION ANSWER DISPLAY */}
          {(() => {
            const activeQA = report.executiveInsights?.questionsAnswers.find(q => q.questionId === selectedQuestionId) || report.executiveInsights?.questionsAnswers[0];
            if (!activeQA) return null;

            return (
              <div className="space-y-6">
                {/* QUESTION HEADER & SAP SOURCE BADGES */}
                <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {activeQA.category}
                      </span>
                      <span className="text-xs text-slate-400">Question ID: {activeQA.questionId}</span>
                    </div>
                    <h2 className="text-lg font-bold text-white tracking-wide mt-1">{activeQA.questionText}</h2>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] text-slate-400 font-medium">S/4HANA Source Tables:</span>
                    {activeQA.sapSourceTables.map(tbl => (
                      <span key={tbl} className="bg-slate-900 border border-slate-700 text-emerald-400 font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                        {tbl}
                      </span>
                    ))}
                  </div>
                </div>

                {/* AI EXECUTIVE SUMMARY ANSWER CARD */}
                <div className="bg-gradient-to-br from-blue-950/80 via-slate-900 to-slate-900 border border-blue-700/60 p-5 rounded-2xl shadow-xl space-y-3">
                  <div className="flex items-center gap-2 text-blue-300 font-semibold text-xs">
                    <Bot className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Executive AI Financial Diagnostic Summary</span>
                  </div>
                  <p className="text-sm text-slate-100 leading-relaxed font-normal">
                    {activeQA.summaryAnswer}
                  </p>
                </div>

                {/* FINANCIAL METRICS SUMMARY CHIPS GRID */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {activeQA.financialMetrics.map((m, idx) => {
                    let colorClass = 'text-white border-slate-700/60 bg-slate-800/60';
                    if (m.status === 'positive') colorClass = 'text-emerald-400 border-emerald-800/50 bg-emerald-950/20';
                    if (m.status === 'negative') colorClass = 'text-rose-400 border-rose-800/50 bg-rose-950/20';
                    if (m.status === 'warning') colorClass = 'text-amber-400 border-amber-800/50 bg-amber-950/20';

                    return (
                      <div key={idx} className={`border p-4 rounded-xl ${colorClass}`}>
                        <p className="text-xs text-slate-400 font-medium">{m.label}</p>
                        <p className="text-xl font-bold mt-1">{m.value}</p>
                      </div>
                    );
                  })}
                </div>

                {/* DEEP INSIGHTS & BREAKDOWN TABLE GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* KEY INSIGHTS LIST */}
                  <div className="bg-slate-800/40 border border-slate-700/60 p-5 rounded-2xl space-y-3">
                    <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" /> Key Financial Insights & Drivers
                    </h3>
                    <ul className="space-y-2.5">
                      {activeQA.keyInsights.map((ins, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{ins}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* S/4HANA DETAILED LINE ITEM BREAKDOWN TABLE */}
                  {activeQA.breakdownData && (
                    <div className="bg-slate-800/40 border border-slate-700/60 p-5 rounded-2xl space-y-3">
                      <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                        <Layers className="w-4 h-4 text-blue-400" /> S/4HANA Ledger Line Breakdown
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-slate-700 text-slate-400 font-medium bg-slate-900/60">
                              <th className="py-2.5 px-3">Category</th>
                              <th className="py-2.5 px-3">Amount / Metric</th>
                              <th className="py-2.5 px-3">Variance</th>
                              <th className="py-2.5 px-3">S/4HANA Reference</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800 text-slate-200">
                            {activeQA.breakdownData.map((row, idx) => (
                              <tr key={idx} className="hover:bg-slate-800/60 transition-colors">
                                <td className="py-2.5 px-3 font-semibold text-white">{row.category}</td>
                                <td className="py-2.5 px-3 font-mono text-emerald-400 font-medium">{row.value}</td>
                                <td className="py-2.5 px-3 font-mono text-amber-300">{row.variance || 'N/A'}</td>
                                <td className="py-2.5 px-3 text-[11px] text-slate-400">{row.detail}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                {/* RECOMMENDED ONE-CLICK SAP AUTOMATED EXECUTION ACTIONS */}
                <div className="bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-slate-700/80 p-5 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-400" /> Recommended SAP Autonomous Execution Workflows
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Direct execution on S/4HANA live backend via API / BTP workflows.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {activeQA.recommendedSapActions.map((act, idx) => (
                      <div key={idx} className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex flex-col justify-between space-y-3">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-white">{act.actionName}</span>
                            <span className="bg-blue-500/20 text-blue-300 text-[10px] px-2 py-0.5 rounded font-mono border border-blue-500/30">
                              {act.tcode}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-snug">{act.description}</p>
                        </div>

                        <button
                          onClick={() => {
                            if (act.actionName.includes('Block') || act.actionName.includes('Duplicate')) {
                              handleExecuteAction('block_duplicate_vendor_payment', { documentNumber: '10002001', amount: 257700 });
                            } else if (act.actionName.includes('Dunning') || act.actionName.includes('Credit') || act.actionName.includes('VKM1')) {
                              handleExecuteAction('revoke_sod_user_access', { userRole: 'JSMITH', companyCode });
                            } else {
                              handleExecuteAction('forecast_month_end_profit', { companyCode });
                            }
                          }}
                          disabled={actionLoading !== null}
                          className="w-full py-2 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/50 text-blue-200 text-xs rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors mt-2"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-400" />
                          Execute on SAP ({act.tcode.split('/')[0].trim()})
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 2: FRAUD DETECTION & COMPLIANCE */}
      {selectedTab === 'fraud' && fraudReport && (
        <div className="p-6 space-y-6">
          {/* FRAUD & COMPLIANCE HEADER SUMMARY CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="bg-gradient-to-br from-red-950/40 to-slate-900 border border-red-800/50 p-4 rounded-xl">
              <p className="text-xs text-red-300 font-medium">Overall Fraud Risk</p>
              <p className="text-2xl font-bold text-red-400 mt-1">{fraudReport.overallFraudRiskScore} <span className="text-xs text-slate-400 font-normal">/ 100</span></p>
              <span className="inline-flex items-center text-[10px] text-red-400 mt-1 font-semibold">
                <AlertTriangle className="w-3 h-3 mr-1" /> Medium-High Severity
              </span>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-xl">
              <p className="text-xs text-slate-400 font-medium">Total Risk Exposure</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">${(fraudReport.totalRiskExposureAmount / 1000).toFixed(1)}k</p>
              <span className="inline-flex items-center text-[10px] text-slate-400 mt-1">
                Across AP, Journal & Payments
              </span>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-xl">
              <p className="text-xs text-slate-400 font-medium">Duplicate Payments</p>
              <p className="text-2xl font-bold text-red-400 mt-1">{fraudReport.duplicatePaymentsCount}</p>
              <span className="inline-flex items-center text-[10px] text-amber-400 mt-1">
                ${(fraudReport.duplicatePayments.reduce((s, d) => s + d.amount, 0) / 1000).toFixed(1)}k Blocked
              </span>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-xl">
              <p className="text-xs text-slate-400 font-medium">SoD Violations</p>
              <p className="text-2xl font-bold text-purple-400 mt-1">{fraudReport.sodViolationsCount}</p>
              <span className="inline-flex items-center text-[10px] text-purple-300 mt-1">
                2 Critical Role Conflicts
              </span>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-xl col-span-2 sm:col-span-1">
              <p className="text-xs text-slate-400 font-medium">Policy Compliance Rate</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{fraudReport.policyComplianceRatePct}%</p>
              <span className="inline-flex items-center text-[10px] text-emerald-400 mt-1">
                <Check className="w-3 h-3 mr-0.5" /> 4 Policies Monitored
              </span>
            </div>
          </div>

          {/* FILTER SUB-BAR */}
          <div className="flex border-b border-slate-800 pb-2 space-x-2 overflow-x-auto text-xs">
            {[
              { id: 'all', label: 'All Fraud & Compliance' },
              { id: 'duplicates', label: `Duplicate Payments (${fraudReport.duplicatePaymentsCount})` },
              { id: 'unusualJournals', label: `Unusual Journal Entries (${fraudReport.unusualJournalEntriesCount})` },
              { id: 'sod', label: `SoD Violations (${fraudReport.sodViolationsCount})` },
              { id: 'suspiciousPayments', label: `Suspicious Payments (${fraudReport.suspiciousPaymentPatternsCount})` },
              { id: 'policies', label: 'Policy Rules' },
              { id: 'evidence', label: 'Audit Evidence' },
              { id: 'controls', label: 'SOX Controls' }
            ].map(filter => (
              <button
                key={filter.id}
                onClick={() => setSelectedFraudFilter(filter.id as any)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors font-medium ${
                  selectedFraudFilter === filter.id
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* 1. DUPLICATE VENDOR PAYMENTS */}
          {(selectedFraudFilter === 'all' || selectedFraudFilter === 'duplicates') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-amber-400" /> Detect Duplicate Vendor Payments (MRBR / BSAK)
                </h3>
                <button
                  onClick={() => handleExecuteAction('detect_duplicate_vendor_payments')}
                  disabled={actionLoading === 'detect_duplicate_vendor_payments'}
                  className="px-3 py-1 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-300 rounded text-xs font-medium flex items-center gap-1 transition-colors"
                >
                  {actionLoading === 'detect_duplicate_vendor_payments' ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                  Scan BSAK Subledger
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {fraudReport.duplicatePayments.map(pay => (
                  <div key={pay.paymentId} className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-sm">{pay.vendorName}</span>
                        <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded border border-slate-700">{pay.vendorNumber}</span>
                        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] px-2 py-0.5 rounded-full font-semibold">{pay.matchingCriteria}</span>
                        <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold">{pay.similarityScorePct}% Match</span>
                      </div>
                      <p className="text-xs text-slate-300">
                        Invoice Ref: <span className="text-white font-mono">{pay.invoiceNumber}</span> • Original Doc: <span className="text-blue-400 font-mono">{pay.originalDocumentNumber}</span> • Duplicate Doc: <span className="text-red-400 font-mono">{pay.duplicateDocumentNumber}</span>
                      </p>
                      <p className="text-xs text-slate-400 flex items-start gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{pay.recommendation}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="text-lg font-bold text-white">${pay.amount.toLocaleString()}</p>
                        <p className="text-[10px] text-slate-400">SAP T-Code: <span className="text-slate-200">{pay.sapTcode}</span></p>
                      </div>
                      <button
                        onClick={() => handleExecuteAction('block_duplicate_vendor_payment', { paymentId: pay.paymentId, documentNumber: pay.duplicateDocumentNumber, amount: pay.amount })}
                        disabled={actionLoading === 'block_duplicate_vendor_payment'}
                        className="px-3 py-2 bg-red-600/30 hover:bg-red-600/50 border border-red-500/50 text-red-200 text-xs rounded-lg font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        Block Payment
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. UNUSUAL JOURNAL ENTRIES */}
          {(selectedFraudFilter === 'all' || selectedFraudFilter === 'unusualJournals') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-400" /> Identify Unusual Journal Entries (ACDOCA / BKPF)
                </h3>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-700/60 bg-slate-800/30">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-700 font-medium">
                    <tr>
                      <th className="p-3">Doc #</th>
                      <th className="p-3">G/L Account</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Posted By / Time</th>
                      <th className="p-3">Anomaly Category</th>
                      <th className="p-3">Risk Score</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {fraudReport.unusualJournalEntries.map(entry => (
                      <tr key={entry.entryId} className="hover:bg-slate-800/50 transition-colors">
                        <td className="p-3 font-mono font-bold text-blue-400">{entry.accountingDocument}</td>
                        <td className="p-3">
                          <p className="font-semibold text-white">{entry.glAccountName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">G/L: {entry.glAccount}</p>
                        </td>
                        <td className="p-3 font-bold text-white">${entry.amount.toLocaleString()}</td>
                        <td className="p-3">
                          <p className="text-slate-200 font-medium">{entry.postedBy}</p>
                          <p className="text-[10px] text-amber-300">{entry.postingTime}</p>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            {entry.anomalyType}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            entry.riskSeverity === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}>
                            {entry.riskScore}/100 ({entry.riskSeverity})
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleExecuteAction('reverse_journal_entry', { documentNumber: entry.accountingDocument, reversalReason: '01' })}
                            disabled={actionLoading === 'reverse_journal_entry'}
                            className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-[11px] font-medium transition-colors"
                          >
                            Reverse (FB08)
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. SEGREGATION OF DUTIES (SoD) VIOLATIONS */}
          {(selectedFraudFilter === 'all' || selectedFraudFilter === 'sod') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-red-400" /> Flag Segregation-of-Duties (SoD) Violations (SU24 / PFCG)
                </h3>
                <button
                  onClick={() => handleExecuteAction('flag_sod_violations')}
                  disabled={actionLoading === 'flag_sod_violations'}
                  className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 rounded text-xs font-medium flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" /> Audit PFCG User Roles
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fraudReport.sodViolations.map(sod => (
                  <div key={sod.violationId} className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-white text-sm">{sod.userName}</h4>
                        <p className="text-xs text-blue-300 font-mono">{sod.userEmail}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Role: {sod.userRole}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        sod.status === 'Active Violation' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {sod.status}
                      </span>
                    </div>

                    <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 text-xs space-y-1">
                      <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Conflicting Authorizations:</p>
                      <div className="flex flex-wrap gap-1">
                        {sod.conflictingRolesOrTcodes.map((tc, idx) => (
                          <span key={idx} className="bg-slate-800 text-amber-300 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-mono">
                            {tc}
                          </span>
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed"><span className="text-slate-400 font-medium">Audit Evidence:</span> {sod.auditEvidence}</p>
                    <p className="text-xs text-emerald-300"><span className="text-slate-400 font-medium">Mitigating Control:</span> {sod.mitigatingControl}</p>

                    {sod.status === 'Active Violation' && (
                      <button
                        onClick={() => handleExecuteAction('revoke_sod_user_access', { userEmailToRevoke: sod.userEmail })}
                        disabled={actionLoading === 'revoke_sod_user_access'}
                        className="w-full py-1.5 bg-red-600/30 hover:bg-red-600/50 border border-red-500/50 text-red-200 text-xs rounded font-semibold flex items-center justify-center gap-1 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Revoke Conflicting Role in PFCG
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. SUSPICIOUS PAYMENT PATTERNS */}
          {(selectedFraudFilter === 'all' || selectedFraudFilter === 'suspiciousPayments') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" /> Detect Suspicious Outgoing Payment Patterns (F110 / REGUP)
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {fraudReport.suspiciousPaymentPatterns.map(pattern => (
                  <div key={pattern.patternId} className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-sm">{pattern.vendorName}</span>
                        <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded border border-slate-700 font-mono">{pattern.vendorNumber}</span>
                        <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] px-2 py-0.5 rounded font-mono">Bank: {pattern.bankCountry}</span>
                        <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold">{pattern.suspiciousIndicator}</span>
                      </div>
                      <p className="text-xs text-slate-300">{pattern.patternDetails}</p>
                      <p className="text-xs text-amber-300 font-medium">Action: {pattern.recommendedAction}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="text-lg font-bold text-amber-400">${pattern.totalTransactionVolume.toLocaleString()}</p>
                        <p className="text-[10px] text-slate-400">Flagged: {pattern.flaggedDate}</p>
                      </div>
                      <button
                        onClick={() => handleExecuteAction('block_vendor_invoice', { invoiceNumber: pattern.patternId, referenceText: pattern.suspiciousIndicator })}
                        disabled={actionLoading === 'block_vendor_invoice'}
                        className="px-3 py-2 bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/50 text-amber-200 text-xs rounded-lg font-semibold transition-colors"
                      >
                        Freeze F110 Run
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. POLICY COMPLIANCE RULES */}
          {(selectedFraudFilter === 'all' || selectedFraudFilter === 'policies') && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-blue-400" /> Monitor Corporate Financial Policy Compliance
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fraudReport.policyComplianceRules.map(rule => (
                  <div key={rule.ruleId} className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-white text-sm">{rule.policyName}</h4>
                        <span className="text-[10px] text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded border border-blue-500/30">{rule.category}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        rule.status === 'Compliant' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {rule.complianceRatePct}% ({rule.status})
                      </span>
                    </div>

                    <p className="text-xs text-slate-300">{rule.policyDetails}</p>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                      <span className="text-slate-400">Exposure: <strong className="text-amber-400">${rule.riskExposureAmount.toLocaleString()}</strong> ({rule.nonCompliantCount} Violations)</span>
                      <button
                        onClick={() => handleExecuteAction('monitor_policy_compliance', { ruleId: rule.ruleId })}
                        disabled={actionLoading === 'monitor_policy_compliance'}
                        className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 rounded text-[11px] transition-colors"
                      >
                        Enforce in SPRO
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. AUTOMATED AUDIT EVIDENCE GENERATION */}
          {(selectedFraudFilter === 'all' || selectedFraudFilter === 'evidence') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-400" /> Generate Cryptographic Audit Evidence Automatically
                </h3>
                <button
                  onClick={() => handleExecuteAction('generate_audit_evidence')}
                  disabled={actionLoading === 'generate_audit_evidence'}
                  className="px-3 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 rounded text-xs font-medium flex items-center gap-1 transition-colors"
                >
                  <Sparkles className="w-3 h-3" /> Generate Digital Seal
                </button>
              </div>

              {fraudReport.auditEvidences.map(evid => (
                <div key={evid.evidenceId} className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-5 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-base">{evid.evidenceId}</span>
                        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-full font-semibold">SOX & IFRS Verified</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">Auditor: {evid.generatedBy} • Scope: Company Code {evid.scopeCompanyCode} ({evid.auditPeriod})</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs rounded-lg flex items-center gap-1 transition-colors">
                        <Download className="w-3.5 h-3.5 text-blue-400" /> Export Signed PDF
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{evid.evidenceSummary}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 space-y-1">
                      <p className="text-slate-400 font-bold text-[10px] uppercase">SHA-256 Digital Verification Seal:</p>
                      <p className="font-mono text-emerald-400 text-[11px] break-all bg-slate-950 p-2 rounded border border-emerald-900/50">{evid.hashVerificationCode}</p>
                    </div>

                    <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 space-y-1">
                      <p className="text-slate-400 font-bold text-[10px] uppercase">Verified Live S/4HANA Source Tables:</p>
                      <div className="flex flex-wrap gap-1">
                        {evid.s4HanaSourceTables.map((tbl, i) => (
                          <span key={i} className="bg-slate-800 text-blue-300 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-mono">
                            {tbl}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 7. RECOMMEND CONTROLS FOR IDENTIFIED RISKS */}
          {(selectedFraudFilter === 'all' || selectedFraudFilter === 'controls') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-400" /> Recommend SOX & SAP Controls for Identified Risks
                </h3>
                <button
                  onClick={() => handleExecuteAction('recommend_risk_controls')}
                  disabled={actionLoading === 'recommend_risk_controls'}
                  className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 rounded text-xs font-medium flex items-center gap-1 transition-colors"
                >
                  <Sparkles className="w-3 h-3" /> Auto-Generate Control Specs
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fraudReport.riskControlRecommendations.map(ctrl => (
                  <div key={ctrl.controlId} className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 space-y-2.5">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{ctrl.controlId}</span>
                          <span className="bg-slate-800 text-slate-300 border border-slate-700 text-[10px] px-2 py-0.5 rounded">{ctrl.riskArea}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ctrl.priority.startsWith('P1') ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {ctrl.priority}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300"><strong className="text-slate-400">Threat:</strong> {ctrl.threatDescription}</p>
                    <p className="text-xs text-blue-200"><strong className="text-blue-400">Control Spec:</strong> {ctrl.recommendedInternalControl}</p>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                      <span className="text-slate-400">SAP T-Code: <strong className="text-white font-mono">{ctrl.sapControlConfigTcode}</strong></span>
                      <button
                        onClick={() => handleExecuteAction('recommend_risk_controls', { controlId: ctrl.controlId })}
                        disabled={actionLoading === 'recommend_risk_controls'}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded text-[11px] transition-colors"
                      >
                        Configure Control in SAP
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: COST CONTROLLING AUTOMATION COCKPIT */}
      {selectedTab === 'co' && coReport && (
        <div className="p-6 space-y-6">
          {/* HEADER BANNER */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-purple-950 p-5 rounded-xl border border-purple-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-600/20 border border-purple-500/40 rounded-xl text-purple-400">
                <PieChart className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-bold text-white">Cost Controlling Automation Cockpit</h3>
                  <span className="bg-purple-500/20 text-purple-400 border border-purple-500/40 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                    S/4HANA FI-CO • Period {coReport.period}
                  </span>
                </div>
                <p className="text-slate-400 text-xs mt-0.5">
                  Detect Abnormal Cost Increases (KSB1) • Recommend Allocations (KSU5/KSV5) • Budget Simulations (KP06) • Product Cost Forecasts (CK11N) • Profitability (CO-PA)
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleExecuteAction('detect_abnormal_cost_increases')}
                disabled={actionLoading === 'detect_abnormal_cost_increases'}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg shadow transition-all flex items-center space-x-1.5"
              >
                <AlertTriangle className={`w-3.5 h-3.5 ${actionLoading === 'detect_abnormal_cost_increases' ? 'animate-spin' : ''}`} />
                <span>Detect Cost Spikes</span>
              </button>
              <button
                onClick={() => handleExecuteAction('recommend_cost_allocations')}
                disabled={actionLoading === 'recommend_cost_allocations'}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg shadow transition-all flex items-center space-x-1.5"
              >
                <Scale className={`w-3.5 h-3.5 ${actionLoading === 'recommend_cost_allocations' ? 'animate-spin' : ''}`} />
                <span>Recommend Allocations</span>
              </button>
              <button
                onClick={() => handleExecuteAction('simulate_budget_changes')}
                disabled={actionLoading === 'simulate_budget_changes'}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow transition-all flex items-center space-x-1.5"
              >
                <Activity className={`w-3.5 h-3.5 ${actionLoading === 'simulate_budget_changes' ? 'animate-spin' : ''}`} />
                <span>Simulate Budget</span>
              </button>
              <button
                onClick={() => handleExecuteAction('forecast_manufacturing_costs')}
                disabled={actionLoading === 'forecast_manufacturing_costs'}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow transition-all flex items-center space-x-1.5"
              >
                <TrendingUp className={`w-3.5 h-3.5 ${actionLoading === 'forecast_manufacturing_costs' ? 'animate-spin' : ''}`} />
                <span>Forecast Product Costs</span>
              </button>
              <button
                onClick={() => handleExecuteAction('identify_cost_saving_opportunities')}
                disabled={actionLoading === 'identify_cost_saving_opportunities'}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow transition-all flex items-center space-x-1.5"
              >
                <Zap className={`w-3.5 h-3.5 ${actionLoading === 'identify_cost_saving_opportunities' ? 'animate-spin' : ''}`} />
                <span>Identify Savings</span>
              </button>
            </div>
          </div>

          {/* SUMMARY KPIS */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-xl">
              <p className="text-xs text-slate-400 font-medium">Controlling Budget</p>
              <p className="text-xl font-bold text-white mt-1">€{(coReport.totalControllingBudget / 1000000).toFixed(2)}M</p>
              <span className="text-[10px] text-slate-400 mt-1 block">S/4HANA CO Area {coReport.controllingArea}</span>
            </div>
            <div className="bg-slate-800/60 border border-red-500/30 p-4 rounded-xl">
              <p className="text-xs text-slate-400 font-medium">Cost Spikes Detected</p>
              <p className="text-xl font-bold text-red-400 mt-1">{coReport.abnormalCostVariancesCount}</p>
              <span className="text-[10px] text-red-300 mt-1 block">€{(coReport.totalAbnormalVarianceAmount / 1000).toFixed(0)}k Abnormal Variance</span>
            </div>
            <div className="bg-slate-800/60 border border-purple-500/30 p-4 rounded-xl">
              <p className="text-xs text-slate-400 font-medium">Allocation Recs</p>
              <p className="text-xl font-bold text-purple-400 mt-1">{coReport.costAllocationOpportunitiesCount}</p>
              <span className="text-[10px] text-purple-300 mt-1 block">KSU5/KSV5 Cycle Optimization</span>
            </div>
            <div className="bg-slate-800/60 border border-emerald-500/30 p-4 rounded-xl">
              <p className="text-xs text-slate-400 font-medium">Avg Product Margin</p>
              <p className="text-xl font-bold text-emerald-400 mt-1">{coReport.averageProductContributionMarginPct}%</p>
              <span className="text-[10px] text-emerald-300 mt-1 block">CO-PA Contribution Margin</span>
            </div>
            <div className="bg-slate-800/60 border border-amber-500/30 p-4 rounded-xl col-span-2 sm:col-span-1">
              <p className="text-xs text-slate-400 font-medium">Savings Potential</p>
              <p className="text-xl font-bold text-amber-400 mt-1">€{(coReport.totalIdentifiedCostSavingsPotential / 1000).toFixed(0)}k</p>
              <span className="text-[10px] text-amber-300 mt-1 block">AI Identified Opportunities</span>
            </div>
          </div>

          {/* SUB-FILTER TABS */}
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 overflow-x-auto">
            {[
              { id: 'all', label: 'All Modules' },
              { id: 'anomalies', label: `Cost Spikes (${coReport.costAnomalies.length})` },
              { id: 'allocations', label: `Allocations (${coReport.allocationRecommendations.length})` },
              { id: 'budget', label: `Budget Sims (${coReport.budgetSimulations.length})` },
              { id: 'forecasts', label: `Mfg Cost Forecasts (${coReport.manufacturingForecasts.length})` },
              { id: 'profitability', label: `CO-PA Profitability (${coReport.productProfitabilities.length})` },
              { id: 'savings', label: `Cost Savings (${coReport.costSavingOpportunities.length})` }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setSelectedCoFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  selectedCoFilter === f.id
                    ? 'bg-purple-600 text-white font-semibold'
                    : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* SECTION 1: ABNORMAL COST INCREASES (KSB1) */}
          {(selectedCoFilter === 'all' || selectedCoFilter === 'anomalies') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Abnormal Cost Spikes & Variance Detections (KSB1)</h4>
                </div>
                <span className="text-xs text-slate-400 font-mono">{coReport.costAnomalies.length} Spikes Active</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {coReport.costAnomalies.map(item => (
                  <div key={item.anomalyId} className="bg-slate-950 border border-slate-800 hover:border-red-500/50 p-4 rounded-xl transition-all space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs text-red-400 font-bold">{item.anomalyId}</span>
                          <span className="bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                            +{item.variancePercentage}% Spike
                          </span>
                        </div>
                        <h5 className="text-sm font-bold text-white mt-1">{item.costCenterName} ({item.costCenterId})</h5>
                        <p className="text-xs text-slate-400">{item.glAccountName} ({item.glAccount})</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block">Actual Cost</span>
                        <span className="text-base font-bold text-red-400">€{item.actualCostThisPeriod.toLocaleString()}</span>
                        <span className="text-[10px] text-slate-500 block">Baseline: €{item.baselineMonthlyBudget.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-xs space-y-1">
                      <div className="text-slate-300 font-medium"><strong className="text-red-400">Root Cause:</strong> {item.aiDiagnosticExplanation}</div>
                      <div className="text-slate-400"><strong className="text-purple-400">Recommended Action:</strong> {item.recommendedAction}</div>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <span className="text-slate-500 font-mono">Ref: {item.sapDocumentReference}</span>
                      <button
                        onClick={() => handleExecuteAction('detect_abnormal_cost_increases', { anomalyId: item.anomalyId, costCenter: item.costCenterId })}
                        className="px-2.5 py-1 bg-red-600/30 hover:bg-red-600/50 border border-red-500/40 text-red-300 rounded font-bold transition-all flex items-center space-x-1"
                      >
                        <Zap className="w-3 h-3" />
                        <span>Investigate & Mitigate</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2: COST ALLOCATION RECOMMENDATIONS (KSU5/KSV5) */}
          {(selectedCoFilter === 'all' || selectedCoFilter === 'allocations') && (
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Scale className="w-5 h-5 text-purple-400" />
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Cost Allocation & Assessment Cycle Recommendations (KSU5/KSV5/KB21N)</h4>
                </div>
                <span className="text-xs text-slate-400 font-mono">{coReport.allocationRecommendations.length} Recommendations</span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3">Rec ID</th>
                      <th className="p-3">Cycle / T-Code</th>
                      <th className="p-3">Sender Cost Center</th>
                      <th className="p-3">Receiver Cost Centers</th>
                      <th className="p-3">Confidence</th>
                      <th className="p-3">Total Amount</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                    {coReport.allocationRecommendations.map(rec => (
                      <tr key={rec.allocationCycleId} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3 font-mono text-purple-400 font-bold">{rec.allocationCycleId}</td>
                        <td className="p-3">
                          <div className="text-white font-semibold">{rec.cycleType}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{rec.sapTcode}</div>
                        </td>
                        <td className="p-3 text-slate-300 font-medium">{rec.senderCostCenterName} ({rec.senderCostCenter})</td>
                        <td className="p-3 text-slate-300">
                          <div className="flex flex-wrap gap-1">
                            {rec.receiverCostCenters.map((rc, idx) => (
                              <span key={idx} className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-300 font-mono">{rc.receiverCostCenterName} ({rc.allocatedSharePct}%)</span>
                            ))}
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="bg-purple-500/20 text-purple-400 border border-purple-500/40 px-2 py-0.5 rounded text-[10px] font-bold">
                            {rec.fairnessConfidenceScorePct}%
                          </span>
                        </td>
                        <td className="p-3 font-bold text-white">€{rec.totalAllocatedAmount.toLocaleString()}</td>
                        <td className="p-3">
                          <button
                            onClick={() => handleExecuteAction('recommend_cost_allocations', { recommendationId: rec.allocationCycleId, cycleType: rec.cycleType })}
                            className="px-2.5 py-1 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-300 rounded font-bold transition-all text-[11px] flex items-center space-x-1"
                          >
                            <Zap className="w-3 h-3" />
                            <span>Execute Cycle</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 3: BUDGET SIMULATION SCENARIOS (KP06) */}
          {(selectedCoFilter === 'all' || selectedCoFilter === 'budget') && (
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Cost Center Budget Change Simulations (KP06)</h4>
                </div>
                <span className="text-xs text-slate-400 font-mono">{coReport.budgetSimulations.length} Scenarios</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {coReport.budgetSimulations.map(sim => (
                  <div key={sim.scenarioId} className="bg-slate-950 border border-slate-800 hover:border-blue-500/50 p-4 rounded-xl transition-all space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-xs text-blue-400 font-bold">{sim.scenarioId}</span>
                        <h5 className="text-sm font-bold text-white mt-1">{sim.scenarioName}</h5>
                        <p className="text-xs text-slate-400 mt-0.5">{sim.affectedCostCentersCount} Cost Centers Impacted</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                        sim.netDeltaPercentage < 0 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      }`}>
                        {sim.netDeltaPercentage > 0 ? '+' : ''}{sim.netDeltaPercentage}%
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Baseline Budget</span>
                        <span className="font-bold text-white">€{sim.baselineTotalBudget.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Simulated Budget</span>
                        <span className="font-bold text-blue-400">€{sim.simulatedTotalBudget.toLocaleString()}</span>
                      </div>
                      <div className="col-span-2 pt-1 border-t border-slate-800 flex justify-between">
                        <span className="text-slate-400 text-[10px]">Feasibility:</span>
                        <span className="font-bold text-emerald-400">{sim.feasibilityScore}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">{sim.aiSimulationInsight}</p>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-500 font-mono">Margin Impact: +{sim.operatingMarginImpactPct}%</span>
                      <button
                        onClick={() => handleExecuteAction('simulate_budget_changes', { scenarioId: sim.scenarioId })}
                        className="px-2.5 py-1 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-blue-300 rounded text-[11px] font-bold transition-all flex items-center space-x-1"
                      >
                        <Zap className="w-3 h-3" />
                        <span>Apply Simulation</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 4: MANUFACTURING COST FORECASTS (CK11N) */}
          {(selectedCoFilter === 'all' || selectedCoFilter === 'forecasts') && (
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-indigo-400" />
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Manufacturing Product Cost Forecasts & Costing Runs (CK11N/CK40N)</h4>
                </div>
                <span className="text-xs text-slate-400 font-mono">{coReport.manufacturingForecasts.length} Products Forecasted</span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3">Material Number</th>
                      <th className="p-3">Description</th>
                      <th className="p-3">Plant</th>
                      <th className="p-3">Baseline Unit Cost</th>
                      <th className="p-3">Forecasted Unit Cost</th>
                      <th className="p-3">Cost Variant</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                    {coReport.manufacturingForecasts.map(f => (
                      <tr key={f.materialNumber} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3 font-mono text-indigo-400 font-bold">{f.materialNumber}</td>
                        <td className="p-3 text-white font-medium">{f.materialDescription}</td>
                        <td className="p-3 text-slate-400 font-mono">{f.plantId}</td>
                        <td className="p-3 text-slate-300 font-bold">€{f.baselineUnitCost.toFixed(2)}</td>
                        <td className="p-3 font-bold text-indigo-400">
                          €{f.forecastedUnitCostNextQuarter.toFixed(2)}
                          <span className={`text-[10px] ml-1 ${f.costDeltaPct > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                            ({f.costDeltaPct > 0 ? '+' : ''}{f.costDeltaPct}%)
                          </span>
                        </td>
                        <td className="p-3 font-mono text-slate-300">{f.sapCostingVariant}</td>
                        <td className="p-3">
                          <button
                            onClick={() => handleExecuteAction('forecast_manufacturing_costs', { materialNumber: f.materialNumber, plant: f.plantId })}
                            className="px-2.5 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-300 rounded font-bold transition-all text-[11px] flex items-center space-x-1"
                          >
                            <Zap className="w-3 h-3" />
                            <span>Run Costing</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 5: PRODUCT PROFITABILITY ANALYSIS (CO-PA) */}
          {(selectedCoFilter === 'all' || selectedCoFilter === 'profitability') && (
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-emerald-400" />
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Product Profitability & CO-PA Margin Analysis (KE30)</h4>
                </div>
                <span className="text-xs text-slate-400 font-mono">{coReport.productProfitabilities.length} Product Lines</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {coReport.productProfitabilities.map(p => (
                  <div key={p.productId} className="bg-slate-950 border border-slate-800 hover:border-emerald-500/50 p-4 rounded-xl transition-all space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs text-emerald-400 font-bold">{p.productId}</span>
                          <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded font-mono">
                            {p.productGroup}
                          </span>
                        </div>
                        <h5 className="text-sm font-bold text-white mt-1">{p.productName}</h5>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block">Contribution Margin</span>
                        <span className="text-base font-bold text-emerald-400">{p.netContributionMarginPct}%</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-center">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Gross Revenue</span>
                        <span className="font-bold text-white">€{(p.grossRevenue / 1000).toFixed(0)}k</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Direct Material COGS</span>
                        <span className="font-bold text-slate-300">€{(p.cogsDirectMaterial / 1000).toFixed(0)}k</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Net Margin</span>
                        <span className="font-bold text-emerald-400">€{(p.netContributionMarginAmount / 1000).toFixed(0)}k</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400">{p.aiProfitabilityOptimisationInsight}</p>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-500 font-mono">Tier: {p.profitabilityTier}</span>
                      <button
                        onClick={() => handleExecuteAction('analyze_product_profitability', { productId: p.productId })}
                        className="px-2.5 py-1 bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-300 rounded text-[11px] font-bold transition-all flex items-center space-x-1"
                      >
                        <Zap className="w-3 h-3" />
                        <span>CO-PA Drilldown</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 6: IDENTIFIED COST SAVING OPPORTUNITIES */}
          {(selectedCoFilter === 'all' || selectedCoFilter === 'savings') && (
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Identified AI Cost-Saving Opportunities</h4>
                </div>
                <span className="text-xs text-slate-400 font-mono">{coReport.costSavingOpportunities.length} Savings Opportunities</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {coReport.costSavingOpportunities.map(sav => (
                  <div key={sav.opportunityId} className="bg-slate-950 border border-slate-800 hover:border-amber-500/50 p-4 rounded-xl transition-all space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-xs text-amber-400 font-bold">{sav.opportunityId}</span>
                        <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] px-2 py-0.5 rounded font-bold uppercase ml-2">
                          {sav.category}
                        </span>
                        <h5 className="text-sm font-bold text-white mt-1">{sav.title}</h5>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block">Est. Annual Savings</span>
                        <span className="text-base font-bold text-amber-400">€{sav.potentialAnnualSavingsAmount.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-300 bg-slate-900 p-2.5 rounded-lg border border-slate-800 space-y-1">
                      <div><strong>Target:</strong> {sav.targetedCostCenterOrPlant}</div>
                      <div><strong>Risk:</strong> {sav.riskRating}</div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span>Status: <strong className="text-amber-300">{sav.status}</strong></span>
                      <span>Payback: <strong className="text-slate-200">{sav.paybackPeriodMonths} mos</strong></span>
                    </div>

                    <button
                      onClick={() => handleExecuteAction('identify_cost_saving_opportunities', { opportunityId: sav.opportunityId })}
                      className="w-full py-1.5 bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/40 text-amber-300 rounded font-bold transition-all text-xs flex items-center justify-center space-x-1.5"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Initiate Cost Reduction Plan</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: ACCOUNTS RECEIVABLE AUTOMATION & COLLECTIONS COCKPIT */}
      {selectedTab === 'ar' && arReport && (
        <div className="p-6 space-y-6">
          {/* HEADER BANNER */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-5 rounded-xl border border-indigo-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-indigo-600/20 border border-indigo-500/40 rounded-xl text-indigo-400">
                <CheckSquare className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-bold text-white">Accounts Receivable Automation Cockpit</h3>
                  <span className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                    S/4HANA FI-AR • Period {arReport.period}
                  </span>
                </div>
                <p className="text-slate-400 text-xs mt-0.5">
                  Predict Late Payers • Prioritize Collections • Generate Statements (F.27) • Auto Bank Matching (FEB_MAIN) • Resolve Differences
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleExecuteAction('predict_late_paying_customers')}
                disabled={actionLoading === 'predict_late_paying_customers'}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow transition-all flex items-center space-x-1.5"
              >
                <Sparkles className={`w-3.5 h-3.5 ${actionLoading === 'predict_late_paying_customers' ? 'animate-spin' : ''}`} />
                <span>Predict Late Risk</span>
              </button>
              <button
                onClick={() => handleExecuteAction('prioritize_collections')}
                disabled={actionLoading === 'prioritize_collections'}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg shadow transition-all flex items-center space-x-1.5"
              >
                <TrendingUp className={`w-3.5 h-3.5 ${actionLoading === 'prioritize_collections' ? 'animate-spin' : ''}`} />
                <span>Prioritize Collections</span>
              </button>
              <button
                onClick={() => handleExecuteAction('match_incoming_bank_payment')}
                disabled={actionLoading === 'match_incoming_bank_payment'}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow transition-all flex items-center space-x-1.5"
              >
                <CheckCircle2 className={`w-3.5 h-3.5 ${actionLoading === 'match_incoming_bank_payment' ? 'animate-spin' : ''}`} />
                <span>Auto Bank Match</span>
              </button>
            </div>
          </div>

          {/* METRIC HIGHLIGHT CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-slate-800/60 border border-slate-700/60 p-3.5 rounded-xl">
              <p className="text-[11px] text-slate-400 font-medium">Total Open AR Balance</p>
              <p className="text-xl font-bold text-white mt-1">${arReport.totalArBalance.toLocaleString()}</p>
              <span className="text-[10px] text-emerald-400 font-mono mt-0.5 block flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" /> 100% Live S/4HANA
              </span>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 p-3.5 rounded-xl">
              <p className="text-[11px] text-slate-400 font-medium">Overdue AR Balance</p>
              <p className="text-xl font-bold text-rose-400 mt-1">${arReport.totalOverdueArBalance.toLocaleString()}</p>
              <span className="text-[10px] text-rose-400/90 font-mono mt-0.5 block flex items-center gap-1">
                <AlertTriangle className="w-2.5 h-2.5" /> Overdue Customer Items
              </span>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 p-3.5 rounded-xl">
              <p className="text-[11px] text-slate-400 font-medium">Average DSO</p>
              <p className="text-xl font-bold text-amber-400 mt-1">{arReport.averageDsoDays} Days</p>
              <span className="text-[10px] text-amber-400/90 font-mono mt-0.5 block">
                Target: 30.0 Days
              </span>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 p-3.5 rounded-xl">
              <p className="text-[11px] text-slate-400 font-medium">High Late Risk Customers</p>
              <p className="text-xl font-bold text-rose-400 mt-1">{arReport.highRiskLatePayersCount} Customers</p>
              <span className="text-[10px] text-rose-400/90 font-mono mt-0.5 block">
                AI Predictive Score &gt; 80%
              </span>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 p-3.5 rounded-xl">
              <p className="text-[11px] text-slate-400 font-medium">Bank Auto-Clearing Rate</p>
              <p className="text-xl font-bold text-emerald-400 mt-1">{arReport.autoClearingRatePct}%</p>
              <span className="text-[10px] text-emerald-400/90 font-mono mt-0.5 block">
                FEB_MAIN / F-28 Rules
              </span>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 p-3.5 rounded-xl">
              <p className="text-[11px] text-slate-400 font-medium">Payment Differences</p>
              <p className="text-xl font-bold text-indigo-400 mt-1">{arReport.unresolvedDifferencesCount} Unresolved</p>
              <span className="text-[10px] text-indigo-400/90 font-mono mt-0.5 block">
                Cash Discounts & Shortages
              </span>
            </div>
          </div>

          {/* FILTER TOOLBAR */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setSelectedArFilter('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  selectedArFilter === 'all'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                All AR Modules
              </button>
              <button
                onClick={() => setSelectedArFilter('highRisk')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center space-x-1 ${
                  selectedArFilter === 'highRisk'
                    ? 'bg-rose-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Predict Late Payers</span>
                <span className="bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded text-[10px]">
                  {arReport.latePaymentPredictions.length}
                </span>
              </button>
              <button
                onClick={() => setSelectedArFilter('priorities')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center space-x-1 ${
                  selectedArFilter === 'priorities'
                    ? 'bg-amber-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Prioritize Collections</span>
                <span className="bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded text-[10px]">
                  {arReport.collectionPriorities.length}
                </span>
              </button>
              <button
                onClick={() => setSelectedArFilter('statements')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center space-x-1 ${
                  selectedArFilter === 'statements'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Customer Statements (F.27)</span>
                <span className="bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded text-[10px]">
                  {arReport.customerStatements.length}
                </span>
              </button>
              <button
                onClick={() => setSelectedArFilter('bankMatches')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center space-x-1 ${
                  selectedArFilter === 'bankMatches'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Bank Payment Matches</span>
                <span className="bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded text-[10px]">
                  {arReport.bankPaymentMatches.length}
                </span>
              </button>
            </div>
          </div>

          {/* SECTION 1: PREDICT LATE-PAYING CUSTOMERS & STRATEGY */}
          {(selectedArFilter === 'all' || selectedArFilter === 'highRisk') && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    1. Predict Late-Paying Customers & Historical Behavior Analysis
                  </h4>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Machine learning model trained on 24-month S/4HANA clearing records (BSAD), predicting delay days, risk category, and tailored collection strategy.
                  </p>
                </div>
                <button
                  onClick={() => handleExecuteAction('suggest_collection_strategy')}
                  disabled={actionLoading === 'suggest_collection_strategy'}
                  className="px-3 py-1.5 bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-medium rounded-lg transition-all flex items-center space-x-1.5 shrink-0"
                >
                  <Bot className={`w-3.5 h-3.5 ${actionLoading === 'suggest_collection_strategy' ? 'animate-spin' : ''}`} />
                  <span>Suggest Collection Strategies</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {arReport.latePaymentPredictions.map((item) => (
                  <div
                    key={item.customerNumber}
                    className={`p-4 rounded-xl border transition-all ${
                      item.riskCategory.includes('High Risk')
                        ? 'bg-rose-950/20 border-rose-800/50 hover:border-rose-700'
                        : item.riskCategory.includes('Medium')
                        ? 'bg-amber-950/20 border-amber-800/50 hover:border-amber-700'
                        : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs text-indigo-400 font-bold">{item.customerNumber}</span>
                          <h5 className="text-sm font-bold text-white">{item.customerName}</h5>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Open Invoices: <span className="text-slate-200 font-medium">{item.openInvoicesCount}</span> • Historical DSO: <span className="text-slate-200 font-medium">{item.historicalDsoDays} days</span>
                        </p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        item.riskCategory.includes('High Risk')
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : item.riskCategory.includes('Medium')
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}>
                        {item.predictedLateRiskScore}% Late Risk
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-xs">
                      <div>
                        <span className="text-slate-400 text-[10px] block">Total Open Balance</span>
                        <span className="text-white font-bold">${item.totalOpenBalance.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Overdue Balance</span>
                        <span className="text-rose-400 font-bold">${item.overdueAmount.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Predicted Delay</span>
                        <span className="text-amber-400 font-bold">+{item.predictedDelayDays} Days Past Due</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Credit Limit Utilized</span>
                        <span className="text-indigo-300 font-bold">{item.creditUtilizationPct}% (${item.creditLimit.toLocaleString()})</span>
                      </div>
                    </div>

                    <div className="mt-3 p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/80 space-y-1.5 text-xs">
                      <div className="text-slate-300 text-[11px]">
                        <span className="text-indigo-400 font-semibold">Payment Behavior: </span>
                        {item.historicalPaymentBehavior}
                      </div>
                      <div className="text-emerald-300 text-[11px] pt-1 border-t border-slate-900">
                        <span className="text-emerald-400 font-semibold">AI Recommended Strategy: </span>
                        {item.suggestedCollectionStrategy}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleExecuteAction('predict_late_paying_customers', { customerNumber: item.customerNumber })}
                        disabled={actionLoading === 'predict_late_paying_customers'}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium rounded transition-all"
                      >
                        Run Late Prediction
                      </button>
                      <button
                        onClick={() => handleExecuteAction('prioritize_collections', { customerNumber: item.customerNumber })}
                        disabled={actionLoading === 'prioritize_collections'}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-medium rounded transition-all"
                      >
                        Assign Collection Priority
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2: PRIORITIZE COLLECTION ACTIVITIES */}
          {(selectedArFilter === 'all' || selectedArFilter === 'priorities') && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                    2. Prioritize Collection Activities & Collector Worklist (UDM_SPECIALIST / F150)
                  </h4>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Collections Management priority matrix ranking accounts by financial exposure, overdue duration, and payment risk score.
                  </p>
                </div>
                <button
                  onClick={() => handleExecuteAction('prioritize_collections')}
                  disabled={actionLoading === 'prioritize_collections'}
                  className="px-3 py-1.5 bg-amber-600/80 hover:bg-amber-600 text-white text-xs font-medium rounded-lg transition-all flex items-center space-x-1.5 shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${actionLoading === 'prioritize_collections' ? 'animate-spin' : ''}`} />
                  <span>Update Worklist Priorities</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/80">
                      <th className="p-3 font-semibold">Priority</th>
                      <th className="p-3 font-semibold">Customer Account</th>
                      <th className="p-3 font-semibold">Total Outstanding</th>
                      <th className="p-3 font-semibold">Oldest Overdue</th>
                      <th className="p-3 font-semibold">Dunning Level</th>
                      <th className="p-3 font-semibold">Assigned Collector</th>
                      <th className="p-3 font-semibold">Recommended Action</th>
                      <th className="p-3 font-semibold">Payment Promise</th>
                      <th className="p-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {arReport.collectionPriorities.map((item) => (
                      <tr key={item.customerNumber} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-3">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
                            item.priorityRank === 1 ? 'bg-rose-500 text-white' :
                            item.priorityRank === 2 ? 'bg-amber-500 text-slate-950' :
                            'bg-slate-700 text-slate-200'
                          }`}>
                            #{item.priorityRank}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-white">{item.customerName}</div>
                          <span className="font-mono text-[10px] text-indigo-400">{item.customerNumber}</span>
                        </td>
                        <td className="p-3 font-mono font-bold text-rose-400">
                          ${item.totalOutstanding.toLocaleString()}
                        </td>
                        <td className="p-3 font-mono text-amber-400 font-semibold">
                          {item.oldestInvoiceDaysOverdue} days overdue
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.dunningLevel.includes('Level 3') ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                            item.dunningLevel.includes('Level 2') ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                            'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                          }`}>
                            {item.dunningLevel}
                          </span>
                        </td>
                        <td className="p-3 text-slate-300 font-medium">
                          {item.assignedCollector}
                        </td>
                        <td className="p-3 text-slate-200 font-medium">
                          {item.nextRecommendedAction}
                        </td>
                        <td className="p-3">
                          {item.promisedPaymentDate ? (
                            <div className="text-[11px] font-mono text-emerald-400">
                              <span className="font-bold">${item.promisedAmount?.toLocaleString()}</span>
                              <span className="text-slate-400 block text-[10px]">Due: {item.promisedPaymentDate}</span>
                            </div>
                          ) : (
                            <span className="text-slate-500 italic text-[11px]">No promise logged</span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleExecuteAction('prioritize_collections', { customerNumber: item.customerNumber })}
                            disabled={actionLoading === 'prioritize_collections'}
                            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-medium rounded transition-all"
                          >
                            Execute Dunning
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 3: GENERATE CUSTOMER STATEMENTS & AGING ANALYSIS */}
          {(selectedArFilter === 'all' || selectedArFilter === 'statements') && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-400" />
                    3. Generate Customer Account Statements & Aging Analysis (F.27 / FB12)
                  </h4>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Automated generation and digital distribution of customer statements with open items breakdown and 5 aging interval buckets.
                  </p>
                </div>
                <button
                  onClick={() => handleExecuteAction('generate_customer_statement')}
                  disabled={actionLoading === 'generate_customer_statement'}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-all flex items-center space-x-1.5 shrink-0"
                >
                  <FileText className={`w-3.5 h-3.5 ${actionLoading === 'generate_customer_statement' ? 'animate-spin' : ''}`} />
                  <span>Generate All Statements (F.27)</span>
                </button>
              </div>

              <div className="space-y-4">
                {arReport.customerStatements.map((stmt) => (
                  <div key={stmt.statementId} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs text-blue-400 font-bold">{stmt.statementId}</span>
                          <span className="text-slate-400">•</span>
                          <h5 className="text-sm font-bold text-white">{stmt.customerName} ({stmt.customerNumber})</h5>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{stmt.billingAddress}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-slate-400">Statement Date: <span className="text-white font-mono">{stmt.statementDate}</span></span>
                        <button
                          onClick={() => handleExecuteAction('generate_customer_statement', { customerNumber: stmt.customerNumber })}
                          disabled={actionLoading === 'generate_customer_statement'}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-medium rounded transition-all"
                        >
                          Issue PDF / Portal
                        </button>
                      </div>
                    </div>

                    {/* AGING BUCKETS GRID */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                      <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-medium">Current (Not Due)</span>
                        <span className="text-sm font-bold text-emerald-400 mt-0.5 block">${stmt.currentAmount.toLocaleString()}</span>
                      </div>
                      <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-medium">1 - 30 Days Overdue</span>
                        <span className="text-sm font-bold text-amber-300 mt-0.5 block">${stmt.period1_30Days.toLocaleString()}</span>
                      </div>
                      <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-medium">31 - 60 Days Overdue</span>
                        <span className="text-sm font-bold text-amber-500 mt-0.5 block">${stmt.period31_60Days.toLocaleString()}</span>
                      </div>
                      <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-medium">61 - 90 Days Overdue</span>
                        <span className="text-sm font-bold text-rose-400 mt-0.5 block">${stmt.period61_90Days.toLocaleString()}</span>
                      </div>
                      <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-medium">&gt; 90 Days Overdue</span>
                        <span className="text-sm font-bold text-rose-600 mt-0.5 block">${stmt.periodOver90Days.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* OPEN INVOICE LINE ITEMS */}
                    <div className="overflow-x-auto pt-2">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400">
                            <th className="py-2 px-3 font-semibold">Billing Inv #</th>
                            <th className="py-2 px-3 font-semibold">SAP Doc #</th>
                            <th className="py-2 px-3 font-semibold">Invoice Date</th>
                            <th className="py-2 px-3 font-semibold">Due Date</th>
                            <th className="py-2 px-3 font-semibold">Days Overdue</th>
                            <th className="py-2 px-3 font-semibold">Original Amount</th>
                            <th className="py-2 px-3 font-semibold">Open Balance</th>
                            <th className="py-2 px-3 font-semibold">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40">
                          {stmt.openInvoices.map((inv) => (
                            <tr key={inv.invoiceNumber} className="hover:bg-slate-900/50">
                              <td className="py-2 px-3 font-mono text-blue-400 font-bold">{inv.invoiceNumber}</td>
                              <td className="py-2 px-3 font-mono text-slate-300">{inv.sapDocumentNumber}</td>
                              <td className="py-2 px-3 text-slate-300">{inv.invoiceDate}</td>
                              <td className="py-2 px-3 text-slate-300">{inv.dueDate}</td>
                              <td className="py-2 px-3 font-mono font-bold text-amber-400">{inv.daysOverdue > 0 ? `+${inv.daysOverdue}d` : 'Current'}</td>
                              <td className="py-2 px-3 font-mono text-slate-200">${inv.originalAmount.toLocaleString()}</td>
                              <td className="py-2 px-3 font-mono font-bold text-white">${inv.openBalance.toLocaleString()}</td>
                              <td className="py-2 px-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  inv.status === 'Current' ? 'bg-emerald-500/20 text-emerald-400' :
                                  inv.status.includes('1-30') ? 'bg-amber-500/20 text-amber-300' :
                                  'bg-rose-500/20 text-rose-300'
                                }`}>
                                  {inv.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 4 & 5: MATCH INCOMING BANK PAYMENTS & RESOLVE DIFFERENCES */}
          {(selectedArFilter === 'all' || selectedArFilter === 'bankMatches' || selectedArFilter === 'differences') && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    4. & 5. Match Incoming Bank Payments & Resolve Payment Differences (FEB_MAIN / F-28 / FB05)
                  </h4>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Algorithmic bank statement matching against open customer invoices with automated difference posting for cash discounts and dispute cases.
                  </p>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => handleExecuteAction('match_incoming_bank_payment')}
                    disabled={actionLoading === 'match_incoming_bank_payment'}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition-all flex items-center space-x-1.5"
                  >
                    <CheckCircle2 className={`w-3.5 h-3.5 ${actionLoading === 'match_incoming_bank_payment' ? 'animate-spin' : ''}`} />
                    <span>Run Bank Auto-Match</span>
                  </button>
                  <button
                    onClick={() => handleExecuteAction('resolve_payment_difference')}
                    disabled={actionLoading === 'resolve_payment_difference'}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-all flex items-center space-x-1.5"
                  >
                    <Scale className={`w-3.5 h-3.5 ${actionLoading === 'resolve_payment_difference' ? 'animate-spin' : ''}`} />
                    <span>Resolve Differences</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/80">
                      <th className="p-3 font-semibold">Bank Line ID</th>
                      <th className="p-3 font-semibold">Txn Date</th>
                      <th className="p-3 font-semibold">Remittance Text / Payer</th>
                      <th className="p-3 font-semibold">Received Amount</th>
                      <th className="p-3 font-semibold">Matched Customer</th>
                      <th className="p-3 font-semibold">Matched Invoices</th>
                      <th className="p-3 font-semibold">Matching Status</th>
                      <th className="p-3 font-semibold">Payment Difference & Resolution</th>
                      <th className="p-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {arReport.bankPaymentMatches.map((bm) => (
                      <tr key={bm.bankStatementId} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-3 font-mono text-emerald-400 font-bold">{bm.bankStatementId}</td>
                        <td className="p-3 text-slate-300 font-mono">{bm.transactionDate}</td>
                        <td className="p-3">
                          <div className="text-white font-medium">{bm.bankPayerName}</div>
                          <span className="font-mono text-[10px] text-slate-400">{bm.remittanceReference}</span>
                        </td>
                        <td className="p-3 font-mono font-bold text-emerald-400 text-sm">
                          ${bm.receivedAmount.toLocaleString()}
                        </td>
                        <td className="p-3">
                          <div className="text-white font-medium">{bm.matchedCustomerName}</div>
                          <span className="font-mono text-[10px] text-indigo-400">{bm.matchedCustomerNumber}</span>
                        </td>
                        <td className="p-3 font-mono text-slate-300">
                          {bm.matchedInvoiceNumbers.join(', ')}
                        </td>
                        <td className="p-3">
                          <div className="flex flex-col gap-1">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1 ${
                              bm.matchingStatus.includes('Auto-Cleared')
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            }`}>
                              <CheckCircle2 className="w-3 h-3" />
                              {bm.matchingStatus}
                            </span>
                            <span className="text-[10px] text-slate-400">Confidence: <span className="text-emerald-400 font-bold">{bm.autoMatchingConfidencePct}%</span></span>
                          </div>
                        </td>
                        <td className="p-3 max-w-xs">
                          {bm.paymentDifferenceAmount > 0 ? (
                            <div className="space-y-1">
                              <span className="text-amber-400 font-bold block">
                                Diff: ${bm.paymentDifferenceAmount.toLocaleString()} ({bm.paymentDifferenceReason})
                              </span>
                              <span className="text-slate-300 text-[10px] block leading-tight">
                                {bm.resolutionActionTaken}
                              </span>
                            </div>
                          ) : (
                            <span className="text-emerald-400 font-medium text-[11px] flex items-center gap-1">
                              <Check className="w-3 h-3" /> 100% Cleared (Clearing Doc {bm.sapClearingDocNumber})
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          {bm.paymentDifferenceAmount > 0 ? (
                            <button
                              onClick={() => handleExecuteAction('resolve_payment_difference', { customerNumber: bm.matchedCustomerNumber, amount: bm.paymentDifferenceAmount })}
                              disabled={actionLoading === 'resolve_payment_difference'}
                              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-medium rounded transition-all"
                            >
                              Resolve Difference
                            </button>
                          ) : (
                            <button
                              onClick={() => handleExecuteAction('match_incoming_bank_payment', { documentNumber: bm.bankStatementId, customerNumber: bm.matchedCustomerNumber })}
                              disabled={actionLoading === 'match_incoming_bank_payment'}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium rounded transition-all"
                            >
                              Verify Clearing
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: ACCOUNTS PAYABLE AUTOMATION & 3-WAY MATCHING */}
      {selectedTab === 'ap' && apReport && (
        <div className="p-6 space-y-6">
          {/* HEADER BANNER */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 p-5 rounded-xl border border-emerald-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-emerald-600/20 border border-emerald-500/40 rounded-xl text-emerald-400">
                <DollarSign className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-bold text-white">Accounts Payable Automation Cockpit</h3>
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                    S/4HANA FI-AP • Period {apReport.period}
                  </span>
                </div>
                <p className="text-slate-400 text-xs mt-0.5">
                  Automated 3-Way Invoice Matching (MIRO) • Duplicate Detection • Suspicious Invoice Blocking • Payment Optimization & Cash Discounts
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleExecuteAction('execute_3way_matching')}
                disabled={actionLoading === 'execute_3way_matching'}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow transition-all flex items-center space-x-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${actionLoading === 'execute_3way_matching' ? 'animate-spin' : ''}`} />
                <span>Run 3-Way Match Verification</span>
              </button>
            </div>
          </div>

          {/* METRIC HIGHLIGHT CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-xl">
              <p className="text-xs text-slate-400 font-medium">Total Open AP Invoices</p>
              <p className="text-2xl font-bold text-white mt-1">${apReport.totalOpenApAmount.toLocaleString()}</p>
              <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                {apReport.totalOpenApInvoicesCount} Active Vendor Invoices
              </span>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-xl">
              <p className="text-xs text-slate-400 font-medium">Pending 3-Way Match / Variance</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">{apReport.pending3WayMatchCount} Invoices</p>
              <span className="text-[10px] text-amber-400/90 font-mono mt-1 block flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Price / Quantity Mismatches
              </span>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-xl">
              <p className="text-xs text-slate-400 font-medium">Blocked / Suspicious Invoices</p>
              <p className="text-2xl font-bold text-rose-400 mt-1">{apReport.blockedInvoicesCount} Blocked</p>
              <span className="text-[10px] text-rose-400/90 font-mono mt-1 block">
                {apReport.duplicateInvoicesCount} Duplicate Suspects Flagged
              </span>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-xl">
              <p className="text-xs text-slate-400 font-medium">Early Payment Discounts</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">${apReport.totalDiscountSavingsCaptured.toLocaleString()}</p>
              <span className="text-[10px] text-emerald-400 font-mono mt-1 block">
                ${apReport.totalDiscountSavingsAvailable.toLocaleString()} Total Available
              </span>
            </div>
          </div>

          {/* FILTER TOOLBAR */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Filter View:</span>
              {[
                { id: 'all', label: 'All Open Invoices', count: apReport.vendorInvoices.length },
                { id: 'blocked', label: 'Blocked / Suspicious', count: apReport.blockedInvoicesCount },
                { id: 'duplicate', label: 'Duplicate Suspects', count: apReport.duplicateInvoicesCount },
                { id: 'unmatched', label: '3-Way Match Mismatches', count: apReport.pending3WayMatchCount },
                { id: 'discount', label: 'Discount Terms (Priority 1)', count: apReport.vendorInvoices.filter(i => i.paymentPriorityTier.includes('Priority 1')).length }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedApFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                    selectedApFilter === f.id
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 hover:text-white border border-transparent'
                  }`}
                >
                  <span>{f.label}</span>
                  <span className="bg-slate-900 px-1.5 py-0.2 rounded text-[10px] font-bold">{f.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 1: 3-WAY MATCHING & INVOICE MANAGEMENT TABLE */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-emerald-400" /> S/4HANA Vendor Invoice 3-Way Matching & Security Verification
            </h4>
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-3">Invoice / Vendor</th>
                      <th className="p-3">PO & GR References</th>
                      <th className="p-3">Gross Amount</th>
                      <th className="p-3">Discount Terms</th>
                      <th className="p-3">3-Way Match Status</th>
                      <th className="p-3">Duplicate / Risk Check</th>
                      <th className="p-3">Payment Block Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {apReport.vendorInvoices
                      .filter(inv => {
                        if (selectedApFilter === 'blocked') return inv.paymentBlockStatus !== 'Unblocked';
                        if (selectedApFilter === 'duplicate') return inv.duplicateCheckStatus === 'DUPLICATE SUSPECT';
                        if (selectedApFilter === 'unmatched') return inv.threeWayMatchStatus !== '3-Way Matched (Pass)';
                        if (selectedApFilter === 'discount') return inv.paymentPriorityTier.includes('Priority 1');
                        return true;
                      })
                      .map((inv) => (
                        <tr key={inv.invoiceNumber} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-3">
                            <span className="font-mono font-bold text-white block">{inv.invoiceNumber}</span>
                            <span className="text-[11px] text-slate-400 font-medium block">{inv.vendorName} ({inv.vendorNumber})</span>
                            <span className="text-[10px] text-slate-500">Inv Date: {inv.invoiceDate}</span>
                          </td>
                          <td className="p-3 font-mono text-[11px]">
                            <span className="text-blue-400 block font-semibold">PO: {inv.poNumber}</span>
                            <span className={`block text-[10px] ${inv.grNumber.startsWith('PENDING') ? 'text-amber-400 font-bold' : 'text-slate-400'}`}>
                              GR: {inv.grNumber}
                            </span>
                          </td>
                          <td className="p-3 font-mono font-bold text-white text-sm">
                            ${inv.grossAmount.toLocaleString()}
                          </td>
                          <td className="p-3">
                            <span className="font-mono text-xs font-semibold text-emerald-400 block">{inv.paymentTerms}</span>
                            {inv.discountAmount > 0 && (
                              <span className="text-[10px] text-emerald-300 font-mono block">
                                Save ${inv.discountAmount.toLocaleString()} by {inv.discountDueDate}
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1 ${
                              inv.threeWayMatchStatus === '3-Way Matched (Pass)' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                              inv.threeWayMatchStatus === 'Price Variance Blocked' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
                              'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            }`}>
                              {inv.threeWayMatchStatus === '3-Way Matched (Pass)' ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                              {inv.threeWayMatchStatus}
                            </span>
                            {inv.threeWayDetails.varianceAmount > 0 && (
                              <span className="text-[10px] text-rose-400 font-mono block mt-1">
                                Variance: +${inv.threeWayDetails.varianceAmount.toLocaleString()} ({inv.threeWayDetails.variancePct}%)
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            {inv.duplicateCheckStatus === 'DUPLICATE SUSPECT' ? (
                              <div>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 inline-flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" /> DUPLICATE SUSPECT
                                </span>
                                {inv.duplicateDetails && (
                                  <p className="text-[10px] text-rose-300/90 mt-1 max-w-xs leading-tight">
                                    {inv.duplicateDetails}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                                Passed (Unique)
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1 ${
                              inv.paymentBlockStatus === 'Unblocked' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            }`}>
                              {inv.paymentBlockStatus === 'Unblocked' ? <Check className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                              {inv.paymentBlockStatus}
                            </span>
                            {inv.paymentBlockCode && (
                              <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                                SAP Indicator: [{inv.paymentBlockCode}]
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right space-y-1">
                            {inv.paymentBlockStatus === 'Unblocked' ? (
                              <button
                                onClick={() => handleExecuteAction('block_vendor_invoice', { invoiceNumber: inv.invoiceNumber, amount: inv.grossAmount, vendorNumber: inv.vendorNumber })}
                                disabled={actionLoading === 'block_vendor_invoice'}
                                className="px-2.5 py-1 bg-rose-600/30 hover:bg-rose-600 text-rose-200 hover:text-white border border-rose-500/50 rounded text-[10px] font-bold transition-all w-full flex items-center justify-center space-x-1"
                              >
                                <Lock className="w-3 h-3" />
                                <span>Block Invoice</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleExecuteAction('unblock_vendor_invoice', { invoiceNumber: inv.invoiceNumber, amount: inv.grossAmount, vendorNumber: inv.vendorNumber })}
                                disabled={actionLoading === 'unblock_vendor_invoice'}
                                className="px-2.5 py-1 bg-emerald-600/30 hover:bg-emerald-600 text-emerald-200 hover:text-white border border-emerald-500/50 rounded text-[10px] font-bold transition-all w-full flex items-center justify-center space-x-1"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Release Block</span>
                              </button>
                            )}

                            {inv.paymentPriorityTier.includes('Priority 1') && inv.paymentBlockStatus === 'Unblocked' && (
                              <button
                                onClick={() => handleExecuteAction('schedule_vendor_payment', { invoiceNumber: inv.invoiceNumber, amount: inv.grossAmount, vendorNumber: inv.vendorNumber })}
                                disabled={actionLoading === 'schedule_vendor_payment'}
                                className="px-2.5 py-1 bg-blue-600/30 hover:bg-blue-600 text-blue-200 hover:text-white border border-blue-500/50 rounded text-[10px] font-bold transition-all w-full flex items-center justify-center space-x-1"
                              >
                                <Zap className="w-3 h-3 text-amber-400" />
                                <span>Schedule Payment (F110)</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* SECTION 2: PAYMENT SCHEDULING & CASH DISCOUNT OPTIMIZATION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* LEFT: SCHEDULED PAYMENT RUN PROPOSALS (F110) */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" /> Automated F110 Vendor Payment Run Proposals
              </h4>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                {apReport.paymentScheduleProposals.map((prop) => (
                  <div key={prop.paymentRunId} className="bg-slate-800/60 border border-slate-700/60 p-3.5 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-blue-400">{prop.paymentRunId}</span>
                        <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.2 rounded font-bold border border-emerald-500/40">
                          {prop.status}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-white mt-1">{prop.vendorName} ({prop.vendorNumber})</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Invoice {prop.invoiceNumber} • Bank: {prop.houseBank} • Method: {prop.paymentMethod}
                      </p>
                      <p className="text-[10px] text-emerald-400 font-mono mt-1 font-semibold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Captured Cash Discount: +${prop.discountCaptured.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-white text-sm block">${prop.amount.toLocaleString()}</span>
                      <span className="text-[10px] text-slate-400 font-mono block">Date: {prop.scheduledPaymentDate}</span>
                      <button
                        onClick={() => handleExecuteAction('trigger_payment_run', { paymentRunId: prop.paymentRunId, amount: prop.amount })}
                        disabled={actionLoading === 'trigger_payment_run'}
                        className="mt-2 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold shadow transition-all flex items-center space-x-1 ml-auto"
                      >
                        <Zap className="w-3 h-3" />
                        <span>Execute Run</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: CASH FLOW PRIORITIZATION MATRIX */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-amber-400" /> Cash Flow Aligned Payment Prioritization
              </h4>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                {apReport.cashFlowPrioritizations.map((prio) => (
                  <div key={prio.priorityTier} className="bg-slate-800/60 border border-slate-700/60 p-3.5 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                        prio.priorityTier.includes('Priority 1') ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                        prio.priorityTier.includes('Priority 2') ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40' :
                        'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      }`}>
                        {prio.priorityTier}
                      </span>
                      <span className="font-mono text-xs font-bold text-white">
                        ${prio.totalAmount.toLocaleString()} ({prio.invoicesCount} Invoices)
                      </span>
                    </div>

                    {prio.totalPotentialDiscount > 0 && (
                      <div className="text-[11px] text-emerald-300 font-mono font-semibold flex items-center gap-1">
                        <DollarSign className="w-3 h-3" /> Potential Discount Savings: ${prio.totalPotentialDiscount.toLocaleString()}
                      </div>
                    )}

                    <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-950/60 p-2 rounded border border-slate-800/80">
                      <span className="text-slate-400 font-mono font-bold uppercase text-[10px] block mb-0.5">AI Recommendation:</span>
                      {prio.recommendedAction}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: FINANCIAL CLOSE AUTOMATION & RECONCILIATION */}
      {selectedTab === 'close' && closeReport && (
        <div className="p-6 space-y-6">
          {/* TOP SUMMARY BANNER */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-5 rounded-xl border border-indigo-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-indigo-600/20 border border-indigo-500/40 rounded-xl text-indigo-400">
                <Calendar className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-bold text-white">Month-End Financial Close Cockpit</h3>
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                    Period {closeReport.period} • Year {closeReport.fiscalYear}
                  </span>
                </div>
                <p className="text-slate-400 text-xs mt-0.5">
                  Automated Month-End Close Monitoring • Subledger-to-GL Reconciliation • Auto Financial Statements • Audit-Ready Package
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-slate-400 text-[10px] uppercase font-mono font-bold tracking-wider">Overall Close Progress</p>
                <div className="flex items-center space-x-2 mt-0.5">
                  <span className="text-2xl font-black text-emerald-400">{closeReport.overallCloseCompletionPct}%</span>
                  <div className="w-24 bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${closeReport.overallCloseCompletionPct}%` }}></div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => loadReport(companyCode)}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow transition-all flex items-center space-x-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-run Close Scan</span>
              </button>
            </div>
          </div>

          {/* COMPANY CODE CLOSE STATUS TRACKER */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-400" /> Company Code Close Status & Progress
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {closeReport.companyCloseStatuses.map((cc) => (
                <div key={cc.companyCode} className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-blue-400">{cc.companyCode}</span>
                      <h5 className="text-xs font-bold text-white mt-0.5">{cc.companyName}</h5>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      cc.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                      cc.status === 'On Track' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40' :
                      'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    }`}>
                      {cc.status}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-400">Current Stage: <strong className="text-slate-200">{cc.closeStage}</strong></span>
                      <span className="text-emerald-400 font-bold">{cc.completionPct}%</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${cc.completionPct}%` }}></div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-700/50 text-[10px] text-slate-400 flex justify-between">
                    <span>Missing Entries: <strong className={cc.missingJournalEntriesCount > 0 ? "text-amber-400" : "text-emerald-400"}>{cc.missingJournalEntriesCount}</strong></span>
                    <span>Lead: <strong className="text-slate-200">{cc.responsibleLead.split('@')[0]}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MISSING JOURNAL ENTRIES & UNRECONCILED ACCOUNTS GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* MISSING JOURNAL ENTRIES IDENTIFIER */}
            <div className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-400" /> Missing Journal Entries Identified ({closeReport.missingJournalEntries.length})
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">S/4HANA ACDOCA Auto-Scan</span>
              </div>

              <div className="space-y-3">
                {closeReport.missingJournalEntries.map((mje) => (
                  <div key={mje.refId} className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-lg space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-[10px] text-amber-400 font-bold">{mje.refId}</span>
                        <h5 className="text-xs font-bold text-white">{mje.description}</h5>
                      </div>
                      <span className="text-xs font-bold font-mono text-emerald-400">${mje.estimatedAmount.toLocaleString()} {mje.currency}</span>
                    </div>

                    <div className="text-[10px] space-y-0.5 text-slate-300 font-mono bg-slate-950/60 p-2 rounded border border-slate-850">
                      <div>Debit: <span className="text-indigo-300">{mje.suggestedGlDebit}</span></div>
                      <div>Credit: <span className="text-purple-300">{mje.suggestedGlCredit}</span></div>
                    </div>

                    <p className="text-[11px] text-slate-400 italic">{mje.reason}</p>

                    <button
                      onClick={() => handleExecuteAction('post_accrual_deferral', { amount: mje.estimatedAmount, description: mje.description })}
                      disabled={actionLoading === 'post_accrual_deferral'}
                      className="w-full py-1.5 bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/50 text-amber-200 text-xs font-bold rounded transition-colors flex items-center justify-center space-x-1"
                    >
                      <Zap className="w-3 h-3 text-amber-400" />
                      <span>Auto-Post Missing Entry (FBS1 Accrual)</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* UNRECONCILED ACCOUNTS DETECTOR */}
            <div className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-cyan-400" /> Unreconciled G/L Accounts Detected ({closeReport.unreconciledAccounts.length})
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">FEBAN / MR11 Reconciler</span>
              </div>

              <div className="space-y-3">
                {closeReport.unreconciledAccounts.map((acc) => (
                  <div key={acc.glAccount} className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-lg space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-[10px] text-cyan-400 font-bold">G/L {acc.glAccount}</span>
                        <h5 className="text-xs font-bold text-white">{acc.accountName}</h5>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold font-mono text-amber-400">${acc.unclearedAmount.toLocaleString()}</span>
                        <span className="block text-[9px] text-slate-400 font-mono">{acc.openItemsCount} Open Line Items</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-950/60 p-2 rounded border border-slate-850">
                      {acc.reason}
                    </p>

                    <button
                      onClick={() => handleExecuteAction('clear_open_items', { glAccount: acc.glAccount, amount: acc.unclearedAmount })}
                      disabled={actionLoading === 'clear_open_items'}
                      className="w-full py-1.5 bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/50 text-cyan-200 text-xs font-bold rounded transition-colors flex items-center justify-center space-x-1"
                    >
                      <Zap className="w-3 h-3 text-cyan-400" />
                      <span>Execute Auto-Clearing Run (MR11 / F-03)</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SUBLEDGER TO G/L RECONCILIATION VERIFICATION */}
          <div className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-emerald-400" /> Subledger-to-General-Ledger Reconciliation Matrix
                </h4>
                <p className="text-[10px] text-slate-400">Continuous S/4HANA subledger (AR, AP, AA, MM) vs ACDOCA leading ledger 0L balance verification</p>
              </div>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] px-2.5 py-0.5 rounded font-bold font-mono">
                3 of 4 Balanced
              </span>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Subledger</th>
                    <th className="p-3">Reconciliation G/L</th>
                    <th className="p-3 text-right">Subledger Balance</th>
                    <th className="p-3 text-right">G/L Balance</th>
                    <th className="p-3 text-right">Variance</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">AI Diagnostic Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/40 font-mono text-[11px]">
                  {closeReport.subledgerReconciliations.map((sub, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-white">{sub.subledgerName}</div>
                        <div className="text-[9px] text-slate-400">{sub.subledgerTcode}</div>
                      </td>
                      <td className="p-3">
                        <div className="text-blue-400 font-bold">{sub.glAccount}</div>
                        <div className="text-[9px] text-slate-400 truncate max-w-[150px]">{sub.glAccountName}</div>
                      </td>
                      <td className="p-3 text-right font-bold text-slate-200">${sub.subledgerBalance.toLocaleString()}</td>
                      <td className="p-3 text-right font-bold text-slate-200">${sub.glBalance.toLocaleString()}</td>
                      <td className={`p-3 text-right font-bold ${sub.variance === 0 ? "text-emerald-400" : "text-amber-400"}`}>
                        ${sub.variance.toLocaleString()}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          sub.variance === 0 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="p-3 font-sans text-slate-300 text-[10px] leading-tight max-w-xs">{sub.aiDiagnosticNote}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AUTOMATED FINANCIAL STATEMENTS GENERATOR */}
          <div className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-purple-400" /> Automated Financial Statements (F.01 / FAGLGV)
                </h4>
                <p className="text-[10px] text-slate-400">Live generated primary financial statements directly from ACDOCA Universal Journal</p>
              </div>

              {/* STATEMENT TOGGLE TABS */}
              <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                <button
                  onClick={() => setSelectedStatementTab('balanceSheet')}
                  className={`px-3 py-1 rounded font-bold transition-all ${selectedStatementTab === 'balanceSheet' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Balance Sheet
                </button>
                <button
                  onClick={() => setSelectedStatementTab('incomeStatement')}
                  className={`px-3 py-1 rounded font-bold transition-all ${selectedStatementTab === 'incomeStatement' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Income Statement (P&L)
                </button>
                <button
                  onClick={() => setSelectedStatementTab('cashFlow')}
                  className={`px-3 py-1 rounded font-bold transition-all ${selectedStatementTab === 'cashFlow' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Cash Flow Statement
                </button>
              </div>
            </div>

            {/* BALANCE SHEET VIEW */}
            {selectedStatementTab === 'balanceSheet' && closeReport.financialStatements.balanceSheet && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Total Assets</span>
                    <span className="text-lg font-bold text-emerald-400">${closeReport.financialStatements.balanceSheet.totalAssets.toLocaleString()}</span>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Total Liabilities</span>
                    <span className="text-lg font-bold text-amber-400">${closeReport.financialStatements.balanceSheet.totalLiabilities.toLocaleString()}</span>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Total Equity</span>
                    <span className="text-lg font-bold text-blue-400">${closeReport.financialStatements.balanceSheet.totalEquity.toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-lg flex items-center justify-between text-xs text-emerald-200">
                  <span className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Balance Sheet Verified Balanced: Total Assets ($34,250,000) = Liabilities ($12,800,000) + Equity ($21,450,000)
                  </span>
                  <span className="font-mono text-[10px] text-emerald-400">ACDOCA Zero Delta Verified</span>
                </div>

                <div className="overflow-x-auto rounded-lg border border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-2.5">Category / Account</th>
                        <th className="p-2.5">G/L Account</th>
                        <th className="p-2.5 text-right">Current Period ($)</th>
                        <th className="p-2.5 text-right">Prior Period ($)</th>
                        <th className="p-2.5 text-right">Variance ($)</th>
                        <th className="p-2.5 text-right">Var %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-900/40 font-mono text-[11px]">
                      {[
                        ...closeReport.financialStatements.balanceSheet.assetLines,
                        ...closeReport.financialStatements.balanceSheet.liabilityLines,
                        ...closeReport.financialStatements.balanceSheet.equityLines
                      ].map((line, i) => (
                        <tr key={i} className="hover:bg-slate-800/40">
                          <td className="p-2.5 font-sans">
                            <span className="text-[10px] text-purple-400 font-bold uppercase block">{line.accountCategory}</span>
                            <span className="text-white font-medium">{line.accountName}</span>
                          </td>
                          <td className="p-2.5 text-slate-400">{line.glAccount}</td>
                          <td className="p-2.5 text-right font-bold text-white">${line.currentPeriodAmount.toLocaleString()}</td>
                          <td className="p-2.5 text-right text-slate-400">${line.priorPeriodAmount.toLocaleString()}</td>
                          <td className={`p-2.5 text-right font-bold ${line.varianceAmount >= 0 ? "text-emerald-400" : "text-amber-400"}`}>
                            ${line.varianceAmount.toLocaleString()}
                          </td>
                          <td className={`p-2.5 text-right font-bold ${line.variancePct >= 0 ? "text-emerald-400" : "text-amber-400"}`}>
                            {line.variancePct}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* INCOME STATEMENT VIEW */}
            {selectedStatementTab === 'incomeStatement' && closeReport.financialStatements.incomeStatement && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Total Revenue</span>
                    <span className="text-lg font-bold text-emerald-400">${closeReport.financialStatements.incomeStatement.totalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">COGS</span>
                    <span className="text-lg font-bold text-amber-400">${closeReport.financialStatements.incomeStatement.totalCogs.toLocaleString()}</span>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Gross Profit</span>
                    <span className="text-lg font-bold text-blue-400">${closeReport.financialStatements.incomeStatement.grossProfit.toLocaleString()}</span>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Net Income</span>
                    <span className="text-lg font-bold text-purple-400">${closeReport.financialStatements.incomeStatement.netIncome.toLocaleString()}</span>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-2.5">Category / Line Item</th>
                        <th className="p-2.5">G/L Account</th>
                        <th className="p-2.5 text-right">Current Period ($)</th>
                        <th className="p-2.5 text-right">Prior Period ($)</th>
                        <th className="p-2.5 text-right">Variance ($)</th>
                        <th className="p-2.5 text-right">Var %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-900/40 font-mono text-[11px]">
                      {[
                        ...closeReport.financialStatements.incomeStatement.revenueLines,
                        ...closeReport.financialStatements.incomeStatement.expenseLines
                      ].map((line, i) => (
                        <tr key={i} className="hover:bg-slate-800/40">
                          <td className="p-2.5 font-sans">
                            <span className="text-[10px] text-purple-400 font-bold uppercase block">{line.accountCategory}</span>
                            <span className="text-white font-medium">{line.accountName}</span>
                          </td>
                          <td className="p-2.5 text-slate-400">{line.glAccount}</td>
                          <td className="p-2.5 text-right font-bold text-white">${line.currentPeriodAmount.toLocaleString()}</td>
                          <td className="p-2.5 text-right text-slate-400">${line.priorPeriodAmount.toLocaleString()}</td>
                          <td className={`p-2.5 text-right font-bold ${line.varianceAmount >= 0 ? "text-emerald-400" : "text-amber-400"}`}>
                            ${line.varianceAmount.toLocaleString()}
                          </td>
                          <td className={`p-2.5 text-right font-bold ${line.variancePct >= 0 ? "text-emerald-400" : "text-amber-400"}`}>
                            {line.variancePct}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* CASH FLOW STATEMENT VIEW */}
            {selectedStatementTab === 'cashFlow' && closeReport.financialStatements.cashFlowStatement && (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-mono">
                <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[10px] block">Operating Cash Flow</span>
                  <span className="text-xl font-bold text-emerald-400">${closeReport.financialStatements.cashFlowStatement.operatingCashFlow.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-400 block font-sans">Cash generated from core business</span>
                </div>

                <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[10px] block">Investing Cash Flow</span>
                  <span className="text-xl font-bold text-amber-400">${closeReport.financialStatements.cashFlowStatement.investingCashFlow.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-400 block font-sans">CapEx & asset acquisitions</span>
                </div>

                <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[10px] block">Financing Cash Flow</span>
                  <span className="text-xl font-bold text-purple-400">${closeReport.financialStatements.cashFlowStatement.financingCashFlow.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-400 block font-sans">Debt repayment & dividends</span>
                </div>

                <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[10px] block">Net Change in Cash</span>
                  <span className="text-xl font-bold text-blue-400">${closeReport.financialStatements.cashFlowStatement.netChangeInCash.toLocaleString()}</span>
                  <span className="text-[10px] text-emerald-400 block font-sans">Positive net cash balance surge</span>
                </div>
              </div>
            )}
          </div>

          {/* CLOSE BLOCKERS ALERT CENTER */}
          {closeReport.closeBlockers.length > 0 && (
            <div className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-xl space-y-4">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-400" /> Active Month-End Close Blockers & Recommended Resolution
              </h4>

              <div className="space-y-3">
                {closeReport.closeBlockers.map((blk) => (
                  <div key={blk.alertId} className="p-4 bg-slate-900/90 border border-red-900/50 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/40">
                          {blk.severity}
                        </span>
                        <h5 className="text-xs font-bold text-white">{blk.title}</h5>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{blk.description}</p>
                      <p className="text-[10px] text-emerald-300 font-mono">Recommended: {blk.recommendedAction}</p>
                    </div>

                    <div className="shrink-0">
                      <button
                        onClick={() => handleExecuteAction(blk.autoFixActionType as any)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg shadow transition-colors flex items-center space-x-1.5"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Auto-Fix Blocker Now</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AUDIT READY CERTIFICATION PACKAGE */}
          {closeReport.auditReadyCertification && (
            <div className="p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/60 rounded-xl border border-emerald-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span className="font-bold text-white text-sm">Audit-Ready Close Package Certified</span>
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] px-2 py-0.5 rounded font-mono">
                    SOX 404 / GAAP / IFRS Verified
                  </span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Signatory: <strong className="text-slate-200">{closeReport.auditReadyCertification.certifiedBy}</strong> • Timestamp: <span className="font-mono text-slate-300">{new Date(closeReport.auditReadyCertification.timestamp).toLocaleString()}</span>
                </p>
                <p className="font-mono text-[9px] text-slate-500 truncate max-w-lg">
                  Signature Hash: {closeReport.auditReadyCertification.signatureHash}
                </p>
              </div>

              <div className="shrink-0">
                <button
                  onClick={() => setActionMessage("Downloading SOX 404 Audit Certified Financial Statement Package (PDF/Excel)...")}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow transition-all flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Audit Package</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: UNIVERSAL JOURNAL (ACDOCA) LINE ITEMS */}
      {selectedTab === 'acdoca' && acdoca && (
        <div className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filter by Document, G/L, Cost Center..."
                value={acdocaFilter}
                onChange={(e) => setAcdocaFilter(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-xs text-white pl-9 pr-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <span>Leading Ledger 0L & Parallel IFRS Ledger 2L</span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Doc Number</th>
                  <th className="p-3">Ledger</th>
                  <th className="p-3">G/L Account</th>
                  <th className="p-3">Posting Key</th>
                  <th className="p-3">Cost / Profit Center</th>
                  <th className="p-3 text-right">Amount (USD)</th>
                  <th className="p-3">AI Audit Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                {filteredAcdocaItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-mono text-blue-400 font-semibold">{item.accountingDocument}</td>
                    <td className="p-3">
                      <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-mono">
                        {item.ledger}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-white">{item.glAccount}</div>
                      <div className="text-[10px] text-slate-400">{item.accountName}</div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.debitCreditMark === 'S'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {item.postingKey}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300">
                      <div>{item.costCenter || '-'}</div>
                      <div className="text-[10px] text-slate-500">{item.profitCenter || '-'}</div>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-white">
                      ${item.amountInCompanyCodeCurrency.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-slate-400 text-[11px]">
                      <div className="flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{item.aiAuditNotes}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MULTI-AGENT CROSS-FUNCTIONAL FINANCE COLLABORATION */}
      {selectedTab === 'collaboration' && col && (
        <div className="p-6 space-y-6">
          <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Collaborative Query:</p>
              <p className="text-sm font-semibold text-white mt-0.5">"{col.userPrompt}"</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Total Cross-Functional Impact:</p>
              <p className="text-xl font-bold text-emerald-400 mt-0.5">€{col.totalCrossFunctionalFinancialImpactEuros.toLocaleString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {col.collaboratingTasks.map((task, idx) => (
              <div key={idx} className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between border-b border-slate-700/50 pb-2">
                  <span className="bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs px-2.5 py-0.5 rounded-full font-bold">
                    {task.collaboratingAgent}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      task.status === 'Completed'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {task.status}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-200">{task.agentRole}</p>
                <p className="text-xs text-slate-300 leading-relaxed"><strong className="text-slate-400">Finding:</strong> {task.findingOrAnalysis}</p>
                <p className="text-xs text-slate-300 leading-relaxed"><strong className="text-slate-400">Action:</strong> {task.actionTakenOrRecommended}</p>
                <div className="pt-2 border-t border-slate-700/50 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Financial Impact:</span>
                  <span className="font-bold text-emerald-400 font-mono">€{task.financialImpactEuros.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: HUMAN-IN-THE-LOOP APPROVALS */}
      {selectedTab === 'approvals' && (
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" /> Pending Financial Approvals Queue
            </h3>
            <span className="text-xs text-slate-400">Human-in-the-Loop Governance Active</span>
          </div>

          <div className="space-y-3">
            {report?.pendingApprovals.map((apr) => (
              <div key={apr.approvalId} className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-blue-400">{apr.approvalId}</span>
                    <span className="bg-slate-700 text-slate-300 text-[10px] px-2 py-0.5 rounded font-semibold">
                      {apr.transactionType}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        apr.riskLevel === 'Critical' || apr.riskLevel === 'High'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {apr.riskLevel} Risk
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-white">{apr.costCenterOrGl}</p>
                  <p className="text-xs text-slate-300">{apr.justification}</p>
                  <p className="text-[10px] text-slate-400">Requested by: {apr.requestedBy} • {apr.sapTransactionCode}</p>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <div className="text-right mr-2">
                    <p className="text-xs text-slate-400">Amount:</p>
                    <p className="text-base font-bold text-emerald-400 font-mono">€{apr.amountEuros.toLocaleString()}</p>
                  </div>

                  {apr.status === 'Pending' ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApproveReject(apr.approvalId, 'APPROVED')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow transition-colors flex items-center space-x-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleApproveReject(apr.approvalId, 'REJECTED')}
                        className="px-3 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  ) : (
                    <span
                      className={`px-3 py-1 rounded text-xs font-bold ${
                        apr.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {apr.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: PREDICTIVE FINANCE AI COCKPIT */}
      {selectedTab === 'predictive' && pred && (
        <div className="p-6 space-y-6">
          {/* PREDICTIVE AI EXECUTIVE SUMMARY BANNER */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/60 border border-indigo-800/40 p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-3xl">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
                <h3 className="text-sm font-bold text-white">S/4HANA Autonomous Predictive Finance Executive Summary</h3>
                <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] px-2 py-0.5 rounded font-mono">
                  ACDOCA Machine Learning Engine
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {pred.aiPredictiveExecutiveSummary}
              </p>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => handleExecuteAction('predict_cash_flow_liquidity')}
                disabled={actionLoading === 'predict_cash_flow_liquidity'}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow transition-all flex items-center space-x-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${actionLoading === 'predict_cash_flow_liquidity' ? 'animate-spin' : ''}`} />
                <span>Re-Sync Forecast Models</span>
              </button>
            </div>
          </div>

          {/* SUB-FILTER TOOLBAR */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setSelectedPredictiveFilter('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  selectedPredictiveFilter === 'all'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                All Predictive Analytics
              </button>
              <button
                onClick={() => setSelectedPredictiveFilter('cashFlow')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center space-x-1 ${
                  selectedPredictiveFilter === 'cashFlow'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>30/60/90 Cash Flow</span>
                <span className="bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded text-[10px]">
                  {pred.cashFlowForecast.length}
                </span>
              </button>
              <button
                onClick={() => setSelectedPredictiveFilter('monthEndProfit')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center space-x-1 ${
                  selectedPredictiveFilter === 'monthEndProfit'
                    ? 'bg-purple-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Month-End Profit</span>
                <span className="bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded text-[10px]">
                  P03
                </span>
              </button>
              <button
                onClick={() => setSelectedPredictiveFilter('opex')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center space-x-1 ${
                  selectedPredictiveFilter === 'opex'
                    ? 'bg-amber-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>OPEX Forecast</span>
                <span className="bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded text-[10px]">
                  {pred.opexForecast.length}
                </span>
              </button>
              <button
                onClick={() => setSelectedPredictiveFilter('workingCapital')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center space-x-1 ${
                  selectedPredictiveFilter === 'workingCapital'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Working Capital</span>
                <span className="bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded text-[10px]">
                  CCC 20.7d
                </span>
              </button>
              <button
                onClick={() => setSelectedPredictiveFilter('budgetOverruns')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center space-x-1 ${
                  selectedPredictiveFilter === 'budgetOverruns'
                    ? 'bg-rose-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Budget Overruns</span>
                <span className="bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded text-[10px]">
                  {pred.budgetOverrunPredictions.length}
                </span>
              </button>
              <button
                onClick={() => setSelectedPredictiveFilter('paymentBehavior')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center space-x-1 ${
                  selectedPredictiveFilter === 'paymentBehavior'
                    ? 'bg-cyan-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Customer Behavior</span>
                <span className="bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded text-[10px]">
                  {pred.customerPaymentBehaviorForecast.length}
                </span>
              </button>
              <button
                onClick={() => setSelectedPredictiveFilter('sensitivity')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center space-x-1 ${
                  selectedPredictiveFilter === 'sensitivity'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Sensitivity Simulator</span>
                <span className="bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded text-[10px]">
                  Sim
                </span>
              </button>
            </div>
          </div>

          {/* SECTION 1: 30, 60, 90 DAY CASH FLOW FORECAST */}
          {(selectedPredictiveFilter === 'all' || selectedPredictiveFilter === 'cashFlow') && (
            <div className="space-y-4 bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">30, 60 & 90-Day Cash Flow Liquidity Horizon Forecast</h4>
                </div>
                <span className="text-xs text-slate-400 font-mono">3 Forecast Periods</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {pred.cashFlowForecast.map((cf, i) => (
                  <div key={i} className="bg-slate-950 border border-slate-800 hover:border-emerald-500/50 p-4 rounded-xl space-y-3 transition-all">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white">{cf.period}</span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
                        {cf.confidenceIntervalPct}% Confidence
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <div className="flex justify-between text-slate-300">
                        <span>Projected Inflows:</span>
                        <span className="font-mono font-bold text-emerald-400">+${(cf.projectedInflow / 1000000).toFixed(2)}M</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Projected Outflows:</span>
                        <span className="font-mono font-bold text-rose-400">-${(cf.projectedOutflow / 1000000).toFixed(2)}M</span>
                      </div>
                      <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-white">
                        <span>Net Cash Generation:</span>
                        <span className="font-mono text-blue-400">+${(cf.netCashPosition / 1000000).toFixed(2)}M</span>
                      </div>
                    </div>

                    {cf.operatingInflowDetails && (
                      <div className="space-y-1 text-[11px]">
                        <p className="text-slate-400"><strong className="text-emerald-400">Inflow Drivers:</strong> {cf.operatingInflowDetails}</p>
                        <p className="text-slate-400"><strong className="text-rose-400">Outflow Drivers:</strong> {cf.operatingOutflowDetails}</p>
                        <p className="text-[10px] text-slate-500 font-mono">SAP Ref: {cf.sapSourceTable}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2: MONTH-END PROFIT PREDICTION */}
          {(selectedPredictiveFilter === 'all' || selectedPredictiveFilter === 'monthEndProfit') && pred.monthEndProfitPrediction && (
            <div className="space-y-4 bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Month-End Profit & Margin Prediction Engine ({pred.monthEndProfitPrediction.targetPeriod})</h4>
                </div>
                <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs px-2.5 py-0.5 rounded font-bold">
                  {pred.monthEndProfitPrediction.confidenceScorePct}% Model Confidence
                </span>
              </div>

              {/* PROFIT STATS GRID */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[11px] block font-sans">Projected Revenue</span>
                  <span className="text-xl font-bold text-white">${(pred.monthEndProfitPrediction.projectedRevenue / 1000000).toFixed(2)}M</span>
                  <span className="text-[10px] text-emerald-400 block mt-0.5 font-sans">+11.2% Surge</span>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[11px] block font-sans">Gross Profit Margin</span>
                  <span className="text-xl font-bold text-blue-400">${(pred.monthEndProfitPrediction.projectedGrossProfit / 1000000).toFixed(2)}M</span>
                  <span className="text-[10px] text-blue-300 block mt-0.5 font-sans">43.29% Gross Margin</span>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[11px] block font-sans">Projected Net Profit</span>
                  <span className="text-xl font-bold text-emerald-400">${pred.monthEndProfitPrediction.projectedNetProfit.toLocaleString()}</span>
                  <span className="text-[10px] text-emerald-400 block mt-0.5 font-sans">+${pred.monthEndProfitPrediction.predictedVarianceAmount.toLocaleString()} vs Target</span>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[11px] block font-sans">Projected EBITDA</span>
                  <span className="text-xl font-bold text-purple-400">${(pred.monthEndProfitPrediction.projectedEbitda / 1000000).toFixed(2)}M</span>
                  <span className="text-[10px] text-purple-300 block mt-0.5 font-sans">26.6% EBITDA Margin</span>
                </div>
              </div>

              {/* DIAGNOSTIC NARRATIVE & DRIVERS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-400" /> AI Profitability Variance Diagnostic
                  </h5>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {pred.monthEndProfitPrediction.aiDiagnosticNarrative}
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Key Profitability Drivers</h5>
                  <div className="space-y-1 text-[11px]">
                    <p className="text-slate-300 font-bold text-emerald-400">Revenue Tailwinds:</p>
                    <ul className="list-disc list-inside text-slate-400 space-y-0.5">
                      {pred.monthEndProfitPrediction.keyRevenueDrivers.map((rd, idx) => (
                        <li key={idx}>{rd}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: OPERATING EXPENSES (OPEX) FORECAST */}
          {(selectedPredictiveFilter === 'all' || selectedPredictiveFilter === 'opex') && (
            <div className="space-y-4 bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-amber-400" />
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Operating Expense (OPEX) Category Forecasts</h4>
                </div>
                <span className="text-xs text-slate-400 font-mono">{pred.opexForecast.length} Categories Monitored</span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3">Expense Category</th>
                      <th className="p-3">SAP G/L Range</th>
                      <th className="p-3 text-right">Current Month Actual</th>
                      <th className="p-3 text-right">Predicted Next Month</th>
                      <th className="p-3 text-right">Predicted Q1 Total</th>
                      <th className="p-3">Trend</th>
                      <th className="p-3">Key Variance Driver</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-950/40 font-mono text-[11px]">
                    {pred.opexForecast.map((ox, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3 font-sans">
                          <div className="font-bold text-white">{ox.expenseCategory}</div>
                          <div className="text-[10px] text-slate-400">{ox.costCenterAffected}</div>
                        </td>
                        <td className="p-3 text-amber-400">{ox.sapGlRange}</td>
                        <td className="p-3 text-right font-bold text-slate-300">${ox.currentMonthActualOpex.toLocaleString()}</td>
                        <td className="p-3 text-right font-bold text-white">${ox.predictedNextMonthOpex.toLocaleString()}</td>
                        <td className="p-3 text-right font-bold text-blue-400">${ox.predictedQuarterOpex.toLocaleString()}</td>
                        <td className="p-3 font-sans">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            ox.trendDirection === 'Upward' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : ox.trendDirection === 'Downward' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-300'
                          }`}>
                            {ox.trendDirection}
                          </span>
                        </td>
                        <td className="p-3 font-sans text-slate-300 text-[11px] leading-tight max-w-xs">{ox.keyVarianceDriver}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 4: WORKING CAPITAL REQUIREMENTS ESTIMATE */}
          {(selectedPredictiveFilter === 'all' || selectedPredictiveFilter === 'workingCapital') && pred.workingCapitalRequirements && (
            <div className="space-y-4 bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Working Capital Requirements & Liquidity Ratio Estimates</h4>
                </div>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs px-2.5 py-0.5 rounded font-bold font-mono">
                  +${pred.workingCapitalRequirements.projectedDeficitOrSurplus.toLocaleString()} Surplus
                </span>
              </div>

              {/* RATIOS & CCC METRICS */}
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 font-mono text-xs">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[10px] block font-sans">DSO (Receivables)</span>
                  <span className="text-lg font-bold text-amber-400">{pred.workingCapitalRequirements.currentDsoDays} Days</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[10px] block font-sans">DPO (Payables)</span>
                  <span className="text-lg font-bold text-purple-400">{pred.workingCapitalRequirements.currentDpoDays} Days</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[10px] block font-sans">DIO (Inventory)</span>
                  <span className="text-lg font-bold text-blue-400">{pred.workingCapitalRequirements.currentDioDays} Days</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[10px] block font-sans">Cash Conversion Cycle</span>
                  <span className="text-lg font-bold text-emerald-400">{pred.workingCapitalRequirements.cashConversionCycleDays} Days</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[10px] block font-sans">Current Ratio</span>
                  <span className="text-lg font-bold text-white">{pred.workingCapitalRequirements.currentRatio}x</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[10px] block font-sans">Quick Ratio</span>
                  <span className="text-lg font-bold text-white">{pred.workingCapitalRequirements.quickRatio}x</span>
                </div>
              </div>

              {/* TIMELINE REQUIREMENT & RECOMMENDATIONS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 font-mono">
                  <h5 className="font-bold text-slate-200 font-sans uppercase text-xs">Required Working Capital Timeline</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between p-2 bg-slate-900 rounded border border-slate-800">
                      <span className="text-slate-400 font-sans">Current Working Capital:</span>
                      <span className="font-bold text-white">${pred.workingCapitalRequirements.currentWorkingCapital.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-slate-900 rounded border border-slate-800">
                      <span className="text-slate-400 font-sans">30-Day Estimated Need:</span>
                      <span className="font-bold text-emerald-400">${pred.workingCapitalRequirements.estimatedRequiredWorkingCapital30Days.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-slate-900 rounded border border-slate-800">
                      <span className="text-slate-400 font-sans">60-Day Estimated Need:</span>
                      <span className="font-bold text-blue-400">${pred.workingCapitalRequirements.estimatedRequiredWorkingCapital60Days.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-slate-900 rounded border border-slate-800">
                      <span className="text-slate-400 font-sans">90-Day Estimated Need:</span>
                      <span className="font-bold text-purple-400">${pred.workingCapitalRequirements.estimatedRequiredWorkingCapital90Days.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <h5 className="font-bold text-slate-200 uppercase text-xs">AI Working Capital Optimization Levers</h5>
                  <ul className="space-y-2">
                    {pred.workingCapitalRequirements.optimizationRecommendations.map((rec, i) => (
                      <li key={i} className="flex items-start space-x-2 text-slate-300 bg-slate-900 p-2.5 rounded border border-slate-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-tight text-[11px]">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: PREDICT BUDGET OVERRUNS */}
          {(selectedPredictiveFilter === 'all' || selectedPredictiveFilter === 'budgetOverruns') && (
            <div className="space-y-4 bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Cost Center Budget Overrun Early Warning System</h4>
                </div>
                <span className="text-xs text-slate-400 font-mono">{pred.budgetOverrunPredictions.length} High-Risk Cost Centers</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pred.budgetOverrunPredictions.map((bo, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 hover:border-rose-500/50 p-4 rounded-xl space-y-3 transition-all">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-xs text-blue-400 font-bold">{bo.costCenterId} • {bo.sapTcode}</span>
                        <h5 className="text-sm font-bold text-white mt-0.5">{bo.costCenterName}</h5>
                        <p className="text-xs text-slate-400">{bo.glAccountName} ({bo.glAccount})</p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                        bo.riskSeverity === 'Critical' ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      }`}>
                        {bo.riskSeverity} Risk
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs bg-slate-900 p-2.5 rounded-lg border border-slate-800 font-mono">
                      <div>
                        <span className="text-slate-500 block text-[10px] font-sans">Monthly Budget</span>
                        <span className="font-bold text-white">${bo.approvedMonthlyBudget.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] font-sans">Spent to Date</span>
                        <span className="font-bold text-slate-300">${bo.actualSpentToDate.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] font-sans">Predicted Overrun</span>
                        <span className="font-bold text-rose-400">+${bo.predictedOverrunAmount.toLocaleString()} ({bo.overrunPct}%)</span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800 text-xs text-slate-300 space-y-1">
                      <span className="text-purple-400 font-bold text-[11px] block">Recommended Mitigation Action:</span>
                      <p className="text-[11px] leading-relaxed">{bo.recommendedMitigation}</p>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => handleExecuteAction('detect_abnormal_cost_increases', { costCenter: bo.costCenterId, glAccount: bo.glAccount })}
                        className="px-3 py-1.5 bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/40 text-rose-200 rounded text-xs font-bold transition-all flex items-center space-x-1"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Execute Reallocation (KSU5)</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 6: FORECAST CUSTOMER PAYMENT BEHAVIOR */}
          {(selectedPredictiveFilter === 'all' || selectedPredictiveFilter === 'paymentBehavior') && (
            <div className="space-y-4 bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckSquare className="w-5 h-5 text-cyan-400" />
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Customer Payment Behavior & Delay Forecasts (BSID/BSAD)</h4>
                </div>
                <span className="text-xs text-slate-400 font-mono">{pred.customerPaymentBehaviorForecast.length} Customers Monitored</span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3">Customer ID / Name</th>
                      <th className="p-3 text-right">Open AR Balance</th>
                      <th className="p-3 text-right">Hist. Avg Days</th>
                      <th className="p-3">Predicted Payment Date</th>
                      <th className="p-3">Punctuality Tier</th>
                      <th className="p-3 text-right">Discount Likelihood</th>
                      <th className="p-3">Recommended Dunning Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-950/40 font-mono text-[11px]">
                    {pred.customerPaymentBehaviorForecast.map((cp, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3 font-sans">
                          <div className="font-bold text-white">{cp.customerName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{cp.customerId} ({cp.sapCustomerMasterRef})</div>
                        </td>
                        <td className="p-3 text-right font-bold text-white">${cp.openArBalance.toLocaleString()}</td>
                        <td className="p-3 text-right text-slate-300">{cp.historicalAvgDaysToPay}d</td>
                        <td className="p-3 text-slate-200">
                          <div>{cp.predictedPaymentDate}</div>
                          <div className="text-[10px] text-rose-400 font-mono">+{cp.predictedDaysLate} days late</div>
                        </td>
                        <td className="p-3 font-sans">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            cp.paymentPunctualityTier === 'On-Time' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : cp.paymentPunctualityTier.includes('Slight') ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}>
                            {cp.paymentPunctualityTier}
                          </span>
                        </td>
                        <td className="p-3 text-right font-bold text-cyan-400">{cp.earlyPaymentDiscountLikelihoodPct}%</td>
                        <td className="p-3 font-sans text-slate-300 text-[11px] max-w-xs">{cp.recommendedDunningStrategy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 7: FINANCIAL SENSITIVITY SIMULATIONS */}
          {(selectedPredictiveFilter === 'all' || selectedPredictiveFilter === 'sensitivity') && (
            <div className="space-y-4 bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sliders className="w-5 h-5 text-indigo-400" />
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Financial Sensitivity & Scenario Impact Simulator</h4>
                </div>
                <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs px-2.5 py-0.5 rounded font-bold">
                  Live Stress Test Engine
                </span>
              </div>

              {/* LIVE INTERACTIVE SIMULATOR SLIDERS */}
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-indigo-400" /> Interactive Financial Scenario Sandbox
                </h5>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* PRICE SLIDER */}
                  <div className="space-y-2 bg-slate-900 p-3.5 rounded-lg border border-slate-800">
                    <div className="flex justify-between text-xs font-bold text-slate-200">
                      <span>Price Adjustment (%):</span>
                      <span className={simPriceChange >= 0 ? "text-emerald-400" : "text-rose-400"}>
                        {simPriceChange > 0 ? '+' : ''}{simPriceChange}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-15"
                      max="15"
                      step="0.5"
                      value={simPriceChange}
                      onChange={(e) => setSimPriceChange(parseFloat(e.target.value))}
                      className="w-full accent-indigo-500 bg-slate-800"
                    />
                    <p className="text-[10px] text-slate-400">Simulate pricing strategy shifts on enterprise deals</p>
                  </div>

                  {/* VOLUME SLIDER */}
                  <div className="space-y-2 bg-slate-900 p-3.5 rounded-lg border border-slate-800">
                    <div className="flex justify-between text-xs font-bold text-slate-200">
                      <span>Volume Expansion (%):</span>
                      <span className={simVolumeChange >= 0 ? "text-blue-400" : "text-amber-400"}>
                        {simVolumeChange > 0 ? '+' : ''}{simVolumeChange}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-20"
                      max="30"
                      step="1"
                      value={simVolumeChange}
                      onChange={(e) => setSimVolumeChange(parseFloat(e.target.value))}
                      className="w-full accent-blue-500 bg-slate-800"
                    />
                    <p className="text-[10px] text-slate-400">Simulate market share growth or supply chain constraints</p>
                  </div>

                  {/* COST SLIDER */}
                  <div className="space-y-2 bg-slate-900 p-3.5 rounded-lg border border-slate-800">
                    <div className="flex justify-between text-xs font-bold text-slate-200">
                      <span>Cost Inflation (%):</span>
                      <span className={simCostChange <= 0 ? "text-emerald-400" : "text-rose-400"}>
                        {simCostChange > 0 ? '+' : ''}{simCostChange}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-10"
                      max="20"
                      step="0.5"
                      value={simCostChange}
                      onChange={(e) => setSimCostChange(parseFloat(e.target.value))}
                      className="w-full accent-rose-500 bg-slate-800"
                    />
                    <p className="text-[10px] text-slate-400">Simulate raw material wafer and logistics cost shifts</p>
                  </div>
                </div>

                {/* CALCULATED LIVE IMPACT */}
                {(() => {
                  const baseRev = 4320000;
                  const baseProfit = 895000;
                  const priceImpact = baseRev * (simPriceChange / 100);
                  const volumeImpact = baseRev * (simVolumeChange / 100) * 0.45;
                  const costImpact = (baseRev - baseProfit) * (simCostChange / 100);
                  const totalProfitImpact = priceImpact + volumeImpact - costImpact;
                  const marginShift = (totalProfitImpact / baseRev) * 100;
                  return (
                    <div className="p-4 bg-slate-900 border border-indigo-500/40 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                      <div>
                        <span className="text-slate-400 text-[10px] block font-sans">Simulated Net Profit Delta</span>
                        <span className={`text-lg font-bold ${totalProfitImpact >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {totalProfitImpact >= 0 ? '+' : ''}${Math.round(totalProfitImpact).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block font-sans">Projected Net Margin Impact</span>
                        <span className={`text-lg font-bold ${marginShift >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {marginShift >= 0 ? '+' : ''}{marginShift.toFixed(2)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block font-sans">Projected Working Capital Shift</span>
                        <span className="text-lg font-bold text-blue-400">
                          +${Math.round(totalProfitImpact * 1.15).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* PRE-COMPUTED SCENARIOS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {pred.financialSensitivitySimulations.map((sim) => (
                  <div key={sim.simulationId} className="bg-slate-950 border border-slate-800 hover:border-indigo-500/50 p-4 rounded-xl space-y-3 transition-all">
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-xs text-indigo-400 font-bold">{sim.simulationId}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        sim.projectedNetProfitImpactAmount >= 0 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {sim.projectedNetProfitImpactAmount >= 0 ? '+' : ''}${sim.projectedNetProfitImpactAmount.toLocaleString()}
                      </span>
                    </div>

                    <h5 className="text-xs font-bold text-white">{sim.scenarioTitle}</h5>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900 p-2.5 rounded-lg border border-slate-800 font-mono">
                      <div>
                        <span className="text-slate-500 block text-[10px] font-sans">Margin Shift</span>
                        <span className="font-bold text-blue-400">+{sim.projectedMarginPctImpact}%</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] font-sans">Working Capital</span>
                        <span className="font-bold text-emerald-400">+${sim.projectedWorkingCapitalImpactAmount.toLocaleString()}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed font-sans">{sim.strategicRecommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: PFCG ROLE SECURITY */}
      {selectedTab === 'security' && sec && (
        <div className="p-6 space-y-4">
          <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Assigned PFCG Security Role:</p>
              <p className="text-sm font-semibold text-white mt-0.5">{sec.userRole} ({sec.userEmail})</p>
            </div>
            <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs px-3 py-1 rounded-full font-bold">
              Access Granted (SU53 Passed)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sec.pfcgPermissions.map((perm, idx) => (
              <div key={idx} className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-xs font-bold text-blue-400">{perm.authObject}</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-xs text-slate-300 font-medium">{perm.authObjectDescription}</p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {perm.permittedValues.map((v, i) => (
                    <span key={i} className="bg-slate-900 text-slate-300 text-[10px] font-mono px-2 py-0.5 rounded border border-slate-800">
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: AUTONOMOUS FINANCIAL ACTIONS (10 FINANCIAL OPERATIONS) */}
      {selectedTab === 'actions' && (
        <div className="p-6 space-y-6">
          <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/50 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" /> S/4HANA Autonomous Financial Operations Engine
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Direct live posting and execution across General Ledger, Subledgers (AR/AP), Recurring Runs, Period Controls & Payment Proposals.
                </p>
              </div>
              <span className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 self-start sm:self-auto">
                <CheckCircle2 className="w-3.5 h-3.5" /> PFCG Authorized
              </span>
            </div>

            {/* ACTION PARAMETERS CONSOLE */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              <div>
                <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Company Code</label>
                <input
                  type="text"
                  value={companyCode}
                  onChange={(e) => setCompanyCode(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Doc # / Ref</label>
                <input
                  type="text"
                  value={customDocNum}
                  onChange={(e) => setCustomDocNum(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Amount ($)</label>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Posting Period</label>
                <input
                  type="text"
                  value={customPeriod}
                  onChange={(e) => setCustomPeriod(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Vendor #</label>
                <input
                  type="text"
                  value={customVendorNo}
                  onChange={(e) => setCustomVendorNo(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Customer #</label>
                <input
                  type="text"
                  value={customCustomerNo}
                  onChange={(e) => setCustomCustomerNo(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* LAST ACTION RESULT DISPLAY BANNER */}
          {lastActionResult && (
            <div className="bg-slate-800/80 border border-emerald-500/40 p-4 rounded-xl space-y-3 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold text-sm text-white">{lastActionResult.actionTitle}</span>
                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                    {lastActionResult.status}
                  </span>
                </div>
                <span className="font-mono text-xs text-blue-400 font-bold">
                  Doc #: {lastActionResult.sapDocumentNumber}
                </span>
              </div>
              <p className="text-xs text-slate-200">{lastActionResult.message}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-300 font-mono bg-slate-950/60 p-2.5 rounded border border-slate-800">
                <div><span className="text-slate-500">T-Code:</span> {lastActionResult.sapTransactionCode}</div>
                <div><span className="text-slate-500">API:</span> {lastActionResult.sapApiEndpoint}</div>
                <div><span className="text-slate-500">Audit ID:</span> {lastActionResult.auditTrailId}</div>
                <div><span className="text-slate-500">Posting Keys:</span> {lastActionResult.postingKeySummary}</div>
              </div>

              {lastActionResult.acdocaRef && lastActionResult.acdocaRef.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-700/60 space-y-1">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Live S/4HANA ACDOCA Postings Committed:</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-900 text-slate-400">
                        <tr>
                          <th className="p-1.5">G/L Account</th>
                          <th className="p-1.5">Posting Key</th>
                          <th className="p-1.5">Cost Center</th>
                          <th className="p-1.5 text-right">Amount</th>
                          <th className="p-1.5">Audit Note</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-300">
                        {lastActionResult.acdocaRef.map((line, i) => (
                          <tr key={i}>
                            <td className="p-1.5 font-mono text-blue-300">{line.glAccount} ({line.accountName})</td>
                            <td className="p-1.5 font-bold text-emerald-400">{line.postingKey}</td>
                            <td className="p-1.5">{line.costCenter}</td>
                            <td className="p-1.5 text-right font-mono font-bold">${line.amountInCompanyCodeCurrency.toLocaleString()}</td>
                            <td className="p-1.5 text-slate-400 text-[10px]">{line.aiAuditNotes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* GRID OF THE 10 FINANCIAL OPERATIONS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                id: 'create_journal_entry' as FicoActionType,
                title: '1. Create Journal Entry',
                tcode: 'FB50 / FB01',
                api: 'API_JOURNAL_ENTRY_SRV',
                desc: 'Post balanced Debit (PK 40) / Credit (PK 50) General Ledger entries directly into ACDOCA Universal Journal.',
                buttonText: 'Post G/L Journal Entry',
                icon: FileText
              },
              {
                id: 'reverse_journal_entry' as FicoActionType,
                title: '2. Reverse Journal Entry',
                tcode: 'FB08',
                api: 'API_JOURNAL_ENTRY_SRV/Cancel',
                desc: 'Reverse erroneous or flagged journal entries with reversal reason code in S/4HANA ledgers.',
                buttonText: 'Reverse Journal Entry',
                icon: RefreshCw
              },
              {
                id: 'post_accrual_deferral' as FicoActionType,
                title: '3. Post Accruals & Deferrals',
                tcode: 'FBS1',
                api: 'API_JOURNAL_ENTRY_SRV',
                desc: 'Create month-end expense/revenue accrual postings with automated reversal scheduled for next period start.',
                buttonText: 'Post Accrual Entry',
                icon: Clock
              },
              {
                id: 'execute_recurring_entries' as FicoActionType,
                title: '4. Execute Recurring Entries',
                tcode: 'F.14 / F.15',
                api: 'API_JOURNAL_ENTRY_SRV',
                desc: 'Trigger scheduled recurring posting run for monthly facility rents, equipment leases, and subscriptions.',
                buttonText: 'Execute Recurring Run',
                icon: Activity
              },
              {
                id: 'reclassify_accounts' as FicoActionType,
                title: '5. Reclassify Accounts',
                tcode: 'FAGL_RECLASS',
                api: 'API_JOURNAL_ENTRY_SRV',
                desc: 'Reclassify long-term vs short-term balance sheet liabilities and clear GR/IR clearing account variances.',
                buttonText: 'Reclassify Accounts',
                icon: Layers
              },
              {
                id: 'open_close_posting_period' as FicoActionType,
                title: '6. Open / Close Posting Period',
                tcode: 'OB52',
                api: 'API_PERIOD_CONTROL_SRV',
                desc: 'Update accounting posting period intervals for Company Code 1710 across all account types (A, D, K, M, S).',
                buttonText: 'Update Posting Period',
                icon: Lock
              },
              {
                id: 'trigger_payment_run' as FicoActionType,
                title: '7. Trigger Payment Run',
                tcode: 'F110',
                api: 'API_SUPPLIERINVOICE_PROCESS_SRV',
                desc: 'Launch automated vendor payment run proposal with early payment cash discount capture & bank file generation.',
                buttonText: 'Trigger Payment Proposal',
                icon: DollarSign
              },
              {
                id: 'clear_open_items' as FicoActionType,
                title: '8. Clear Open Items',
                tcode: 'F-03 / F-32 / F-44',
                api: 'API_OPERATIONAL_ACCOUNTING_DOC_SRV',
                desc: 'Clear open AR customer invoices or AP vendor invoices against payments, assigning clearing document references.',
                buttonText: 'Clear Open Items',
                icon: CheckCircle2
              },
              {
                id: 'create_customer_invoice' as FicoActionType,
                title: '9. Create Customer Invoice',
                tcode: 'FB70 / VF01',
                api: 'API_CUSTOMER_INVOICE_SRV',
                desc: 'Create FI customer invoice with revenue recognition posting and payment terms assignment.',
                buttonText: 'Create Customer Invoice',
                icon: Users
              },
              {
                id: 'create_vendor_invoice' as FicoActionType,
                title: '10. Create Vendor Invoice',
                tcode: 'FB60 / MIRO',
                api: 'API_SUPPLIERINVOICE_PROCESS_SRV',
                desc: 'Post supplier vendor invoice with 3-way matching validation against Purchase Order and Goods Receipt.',
                buttonText: 'Create Vendor Invoice',
                icon: Briefcase
              },
              {
                id: 'block_vendor_invoice' as FicoActionType,
                title: '11. Block Vendor Invoice',
                tcode: 'MRBR / FB02',
                api: 'API_SUPPLIERINVOICE_PROCESS_SRV/SetPaymentBlock',
                desc: 'Apply S/4HANA payment block (Reason R - Price Variance, V - Duplicate, A - Quantity) on suspicious invoices.',
                buttonText: 'Apply Payment Block',
                icon: Lock
              },
              {
                id: 'unblock_vendor_invoice' as FicoActionType,
                title: '12. Unblock Vendor Invoice',
                tcode: 'MRBR',
                api: 'API_SUPPLIERINVOICE_PROCESS_SRV/ReleasePaymentBlock',
                desc: 'Release payment block indicator after supervisor resolution or price variance approval.',
                buttonText: 'Release Payment Block',
                icon: CheckCircle2
              },
              {
                id: 'schedule_vendor_payment' as FicoActionType,
                title: '13. Schedule Vendor Payment',
                tcode: 'F110 / F111',
                api: 'API_PAYMENT_PROPOSAL_SRV',
                desc: 'Schedule vendor payment proposal aligned with early payment cash discount deadlines and liquidity priorities.',
                buttonText: 'Schedule Payment Run',
                icon: DollarSign
              },
              {
                id: 'execute_3way_matching' as FicoActionType,
                title: '14. Execute 3-Way Matching',
                tcode: 'MIRO / MIGO Verification',
                api: 'API_SUPPLIERINVOICE_PROCESS_SRV/Verify3WayMatch',
                desc: 'Execute automated 3-way verification matching Vendor Invoice line items against Purchase Order and Goods Receipt.',
                buttonText: 'Execute 3-Way Match',
                icon: CheckSquare
              },
              {
                id: 'predict_late_paying_customers' as FicoActionType,
                title: '15. Predict Late-Paying Customers',
                tcode: 'S_ALR_87012178 / FI-AR Machine Learning',
                api: 'API_CUSTOMER_INVOICE_SRV/PredictLatePayment',
                desc: 'Run predictive ML model on historical clearing trends (BSAD) to score customer late payment probability and estimated delay.',
                buttonText: 'Predict Late Payers',
                icon: Sparkles
              },
              {
                id: 'prioritize_collections' as FicoActionType,
                title: '16. Prioritize Collection Activities',
                tcode: 'UDM_SPECIALIST / F150',
                api: 'API_COLLECTION_WORKLIST_SRV',
                desc: 'Rank accounts in Collections Management worklist based on open risk exposure, dunning level, and promise to pay reliability.',
                buttonText: 'Prioritize Worklist',
                icon: TrendingUp
              },
              {
                id: 'generate_customer_statement' as FicoActionType,
                title: '17. Generate Customer Statement',
                tcode: 'F.27 / FB12',
                api: 'API_CUSTOMER_ACCOUNT_STATEMENT_SRV',
                desc: 'Compile customer statement with 5-bucket aging analysis (0-30, 31-60, 61-90, >90) and dispatch to digital customer portal.',
                buttonText: 'Generate Statement (F.27)',
                icon: FileText
              },
              {
                id: 'match_incoming_bank_payment' as FicoActionType,
                title: '18. Match Incoming Bank Payments',
                tcode: 'FEB_MAIN / F-28',
                api: 'API_BANK_STATEMENT_PROCESS_SRV',
                desc: 'Execute algorithmic 3-way reconciliation matching bank electronic statement remittance text to open customer invoices.',
                buttonText: 'Auto-Match Bank Payment',
                icon: CheckCircle2
              },
              {
                id: 'resolve_payment_difference' as FicoActionType,
                title: '19. Resolve Payment Difference',
                tcode: 'FB05 / F-32 / UDM_DISPUTE',
                api: 'API_OPERATIONAL_ACCOUNTING_DOC_SRV/ClearWithDifference',
                desc: 'Post payment differences automatically, accounting for valid cash discounts or logging UDM dispute cases for unauthorized shortages.',
                buttonText: 'Resolve Difference',
                icon: Scale
              },
              {
                id: 'suggest_collection_strategy' as FicoActionType,
                title: '20. Suggest Collection Strategy',
                tcode: 'UDM_STRATEGY / FI-AR AI',
                api: 'API_COLLECTION_STRATEGY_RECOMMENDER_SRV',
                desc: 'Synthesize AI-guided collection communication strategy based on customer payment cadence and credit risk parameters.',
                buttonText: 'Suggest Strategy',
                icon: Bot
              }
            ].map((op) => {
              const OpIcon = op.icon;
              const isExecuting = actionLoading === op.id;
              return (
                <div key={op.id} className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-xl space-y-3 hover:border-slate-600 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400">
                        <OpIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{op.title}</h4>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span className="font-mono text-[10px] text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.2 rounded">
                            {op.tcode}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">
                            {op.api}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{op.desc}</p>

                  <div className="pt-2 border-t border-slate-700/50 flex justify-end">
                    <button
                      onClick={() => handleExecuteAction(op.id)}
                      disabled={isExecuting}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white text-xs font-semibold rounded-lg shadow transition-colors flex items-center space-x-1.5"
                    >
                      {isExecuting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Posting to S/4HANA...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5" />
                          <span>{op.buttonText}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 7: AUDIT TRAIL */}
      {selectedTab === 'audit' && (
        <div className="p-6 space-y-4">
          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Audit ID</th>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Actor / Role</th>
                  <th className="p-3">Action Type</th>
                  <th className="p-3">S/4HANA T-Code / API</th>
                  <th className="p-3">Compliance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                {report?.recentAuditLogs.map((log) => (
                  <tr key={log.auditId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-mono text-blue-400 font-semibold">{log.auditId}</td>
                    <td className="p-3 text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</td>
                    <td className="p-3">
                      <div className="text-white font-medium">{log.actorEmail}</div>
                      <div className="text-[10px] text-slate-400">{log.userRole}</div>
                    </td>
                    <td className="p-3">
                      <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-semibold">
                        {log.actionType}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-300">{log.sapServiceOrTcode}</td>
                    <td className="p-3">
                      <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold">
                        {log.complianceStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
