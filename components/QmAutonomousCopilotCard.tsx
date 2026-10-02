import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield,
  FileText,
  Search,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldAlert,
  Layers,
  Database,
  Building2,
  DollarSign,
  TrendingUp,
  Activity,
  Check,
  X,
  RefreshCw,
  HelpCircle,
  Filter,
  BarChart2,
  Lock,
  RotateCcw,
  Users,
  Award,
  AlertCircle,
  Cpu
} from 'lucide-react';
import { qmService } from '../services/qmService';
import { QmAutonomousReport, QmQualityRiskItem, QmNaturalLanguageQaItem, QmRecommendedApprovalModel, QmMultiAgentArchitecture } from '../types';

interface QmAutonomousCopilotCardProps {
  data?: QmAutonomousReport | any;
}

export const QmAutonomousCopilotCard: React.FC<QmAutonomousCopilotCardProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'cockpit' | 'risks' | 'capa' | 'multiAgent' | 'approvalModel' | 'qa' | 'actions' | 'audit'>(
    data && data.tiers ? 'approvalModel' : 'cockpit'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [qaCategoryFilter, setQaCategoryFilter] = useState('All');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [reportData, setReportData] = useState<QmAutonomousReport | null>(data && data.risks ? data : null);
  const [loading, setLoading] = useState(!data || (!data.risks && !data.tiers && !data.agents));
  const [selectedActionType, setSelectedActionType] = useState('block defective batch in EWM/MM');
  const [actionDocId, setActionDocId] = useState('INS-010084920');
  const [actionRunning, setActionRunning] = useState(false);
  const [expandedQaId, setExpandedQaId] = useState<number | null>(null);

  useEffect(() => {
    if (!data || (!data.risks && !data.tiers && !data.agents)) {
      setLoading(true);
      qmService.getAutonomousQmReport('1010').then((rep) => {
        setReportData(rep);
        setLoading(false);
      }).catch((err) => {
        console.error('Failed to load autonomous QM report:', err);
        setLoading(false);
      });
    } else {
      if (data.risks || data.executiveSummary) {
        setReportData(data);
      }
      setLoading(false);
    }
  }, [data]);

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionRunning(true);
    setActionFeedback(null);
    try {
      const res = await qmService.executeQmAutonomousAction(selectedActionType, { documentId: actionDocId, plantId: '1010' });
      setActionFeedback(res.message);
    } catch (err: any) {
      setActionFeedback(`Action Execution Error: ${err.message || 'Unknown failure'}`);
    } finally {
      setActionRunning(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-slate-100 shadow-2xl flex flex-col items-center justify-center space-y-4 my-4">
        <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
        <p className="text-sm font-medium text-slate-300">Connecting to S/4HANA QM APIs (API_INSPECTIONLOT_SRV, API_QUALITY_NOTIFICATION_SRV, API_QUALITY_INFORECORD_SRV)...</p>
      </div>
    );
  }

  const report = reportData || {
    reportId: 'REP-QM-1010',
    timestamp: new Date().toISOString(),
    plantId: '1010 (Hamburg High-Tech Manufacturing)',
    executiveSummary: 'AUTONOMOUS QM EXECUTIVE SYNTHESIS: Analyzed active S/4HANA inspection lots and quality notifications across QM + MM + PP + PM + SD + Procurement + EWM. Identified primary quality risks led by MAT-90821-X.',
    overallQualityScore: 92.8,
    totalInspectionLotsActive: 42,
    openQualityNotifications: 14,
    supplierQualityAlerts: 3,
    costOfQualityEur: 18450,
    firstPassYieldPct: 98.15,
    risks: [],
    capa8DReports: [],
    qaCatalog: qmService.get50NaturalLanguageQa('1010'),
    recommendedApprovalModel: qmService.getRecommendedApprovalModel(),
    multiAgentArchitecture: qmService.getMultiAgentArchitecture(),
    auditLogs: []
  };

  const approvalModel = report.recommendedApprovalModel || qmService.getRecommendedApprovalModel();
  const multiAgentArch = report.multiAgentArchitecture || qmService.getMultiAgentArchitecture();
  const qaCatalog = report.qaCatalog || qmService.get50NaturalLanguageQa('1010');

  const filteredQaItems = qaCatalog.filter((q) => {
    const matchesCategory = qaCategoryFilter === 'All' || q.domainName === qaCategoryFilter || q.domain === qaCategoryFilter;
    const matchesSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          q.intent.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          q.crossModuleCorrelation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const domains = ['All', ...Array.from(new Set(qaCatalog.map(item => item.domainName)))];

  return (
    <div id="qm-autonomous-copilot-card" className="bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 shadow-2xl overflow-hidden my-6 font-sans">
      {/* HEADER BAR */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 px-6 py-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white tracking-tight">SAP QM Autonomous Quality AI Agent</h2>
              <span className="bg-blue-500/20 text-blue-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-blue-500/30">
                S/4HANA Live OData
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Plant 1010 (Hamburg High-Tech Manufacturing) • Quality-to-Compliance Lifecycle Orchestrator
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs text-slate-300">
          <div className="flex items-center space-x-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>FPY: <strong className="text-white">{report.firstPassYieldPct}%</strong></span>
          </div>
          <div className="flex items-center space-x-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
            <DollarSign className="w-4 h-4 text-amber-400" />
            <span>CoQ: <strong className="text-white">€{report.costOfQualityEur.toLocaleString()}</strong></span>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="bg-slate-900/90 px-6 border-b border-slate-800 flex items-center space-x-1 overflow-x-auto text-xs font-medium scrollbar-none">
        <button
          onClick={() => setActiveTab('cockpit')}
          className={`py-3 px-4 flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'cockpit'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Executive Quality Cockpit</span>
        </button>

        <button
          onClick={() => setActiveTab('risks')}
          className={`py-3 px-4 flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'risks'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Quality Risk & Root Cause</span>
          {report.risks && report.risks.length > 0 && (
            <span className="bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded-full text-[10px] font-bold border border-rose-500/30">
              {report.risks.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('capa')}
          className={`py-3 px-4 flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'capa'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>8D CAPA & Fishbone</span>
        </button>

        <button
          onClick={() => setActiveTab('multiAgent')}
          className={`py-3 px-4 flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'multiAgent'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Multi-Agent Architecture</span>
        </button>

        <button
          onClick={() => setActiveTab('approvalModel')}
          className={`py-3 px-4 flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'approvalModel'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>3-Tier Approval Model</span>
        </button>

        <button
          onClick={() => setActiveTab('qa')}
          className={`py-3 px-4 flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'qa'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>50 QA Catalog</span>
        </button>

        <button
          onClick={() => setActiveTab('actions')}
          className={`py-3 px-4 flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'actions'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Autonomous Action Center</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`py-3 px-4 flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'audit'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Audit Trail</span>
        </button>
      </div>

      {/* TAB CONTENT AREAS */}
      <div className="p-6 text-sm text-slate-200 space-y-6">

        {/* 1. EXECUTIVE QUALITY COCKPIT TAB */}
        {activeTab === 'cockpit' && (
          <div className="space-y-6">
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Quality Index Score</p>
                  <p className="text-2xl font-extrabold text-emerald-400 mt-1">{report.overallQualityScore} <span className="text-xs font-normal text-slate-400">/ 100</span></p>
                  <span className="text-[11px] text-emerald-300">Grade A (High Conformance)</span>
                </div>
                <Award className="w-8 h-8 text-emerald-400/30" />
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Active Inspection Lots</p>
                  <p className="text-2xl font-extrabold text-blue-400 mt-1">{report.totalInspectionLotsActive}</p>
                  <span className="text-[11px] text-blue-300">API_INSPECTIONLOT_SRV Live</span>
                </div>
                <Database className="w-8 h-8 text-blue-400/30" />
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Open Quality Notifications</p>
                  <p className="text-2xl font-extrabold text-amber-400 mt-1">{report.openQualityNotifications}</p>
                  <span className="text-[11px] text-amber-300">QN-F2 / Q1 / Q3</span>
                </div>
                <AlertCircle className="w-8 h-8 text-amber-400/30" />
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">First-Pass Yield (FPY)</p>
                  <p className="text-2xl font-extrabold text-emerald-400 mt-1">{report.firstPassYieldPct}%</p>
                  <span className="text-[11px] text-slate-400">+0.4% MoM vs Target 98%</span>
                </div>
                <TrendingUp className="w-8 h-8 text-emerald-400/30" />
              </div>
            </div>

            {/* Executive Synthesis Banner */}
            <div className="bg-slate-900/90 border border-blue-500/30 rounded-xl p-5 relative overflow-hidden">
              <div className="flex items-start space-x-3">
                <Sparkles className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-blue-300">Executive AI Quality Intelligence Synthesis</h3>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                    {report.executiveSummary}
                  </p>
                </div>
              </div>
            </div>

            {/* Live Inspection Lots & Notifications Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="font-semibold text-slate-200 flex items-center space-x-2">
                    <Database className="w-4 h-4 text-blue-400" />
                    <span>Recent S/4HANA Inspection Lots</span>
                  </h4>
                  <span className="text-xs text-slate-400">API_INSPECTIONLOT_SRV</span>
                </div>

                <div className="space-y-2.5">
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-blue-400 text-xs">INS-010084920 <span className="text-slate-400 font-normal">• Lot Qty: 250 PCE</span></p>
                      <p className="text-xs text-slate-300 mt-0.5">High-Torque Electric Servo Drive (MAT-90821-X)</p>
                      <p className="text-[11px] text-amber-400 mt-0.5">Vibration displacement drift (+1.4 µm)</p>
                    </div>
                    <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-1 rounded border border-amber-500/30">
                      Pending UD
                    </span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-emerald-400 text-xs">INS-010084921 <span className="text-slate-400 font-normal">• Lot Qty: 500 PCE</span></p>
                      <p className="text-xs text-slate-300 mt-0.5">Stator Insulation Assembly (MAT-77012-A)</p>
                      <p className="text-[11px] text-emerald-400 mt-0.5">All 3 characteristics passed specs</p>
                    </div>
                    <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-1 rounded border border-emerald-500/30">
                      UD Accepted
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="font-semibold text-slate-200 flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Active Quality Notifications (QN)</span>
                  </h4>
                  <span className="text-xs text-slate-400">API_QUALITY_NOTIFICATION_SRV</span>
                </div>

                <div className="space-y-2.5">
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-amber-400 text-xs">QN-20091824 <span className="text-slate-400 font-normal">• Type: F2 Vendor Defect</span></p>
                      <p className="text-xs text-slate-300 mt-0.5">Vendor: Siemens Industrial Automation (BP-1002981)</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Bearing Housing Machining Tolerance Exceeded</p>
                    </div>
                    <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-1 rounded border border-amber-500/30">
                      Under Investigation
                    </span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-rose-400 text-xs">QN-20091825 <span className="text-slate-400 font-normal">• Type: Q3 Internal Defect</span></p>
                      <p className="text-xs text-slate-300 mt-0.5">Assembly Line 03 Fastening Spindle Station 04B</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Automated Assembly Torque Deviation</p>
                    </div>
                    <span className="bg-rose-500/20 text-rose-300 text-[10px] font-bold px-2 py-1 rounded border border-rose-500/30">
                      Tasks Pending
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. QUALITY RISK & ROOT-CAUSE MATRIX TAB */}
        {activeTab === 'risks' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                  <span>Quality Risk Radar & Cross-Module Correlation</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Correlates live data across QM + MM + PP + PM + SD + Procurement + EWM
                </p>
              </div>
              <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs px-2.5 py-1 rounded-lg font-mono">
                3 Primary Quality Risks Detected
              </span>
            </div>

            <div className="space-y-4">
              {report.risks.map((risk) => (
                <div key={risk.riskId} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 hover:border-slate-700 transition-colors">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        risk.severity === 'Critical Risk' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}>
                        {risk.severity}
                      </span>
                      <div>
                        <span className="text-xs font-mono text-slate-400">{risk.entityType}: </span>
                        <span className="font-bold text-white">{risk.entityName}</span>
                        <span className="text-xs font-mono text-blue-400 ml-2">({risk.entityId})</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400">Financial Impact: </span>
                      <span className="font-extrabold text-amber-400">€{risk.financialImpactEur.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                      <p className="font-semibold text-rose-300 mb-1">Root Cause Analysis</p>
                      <p className="text-slate-300 leading-relaxed">{risk.rootCause}</p>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                      <p className="font-semibold text-amber-300 mb-1">Predictive AI Failure Telemetry</p>
                      <p className="text-slate-300 leading-relaxed">{risk.predictedFailure}</p>
                    </div>
                  </div>

                  <div className="bg-slate-950/80 p-3 rounded-lg border border-blue-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-start space-x-2">
                      <Zap className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-blue-300">Recommended Policy Action: </span>
                        <span className="text-slate-200">{risk.recommendedAction}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] text-slate-400 font-mono">{risk.s4HanaService}</span>
                      <button
                        onClick={() => {
                          setSelectedActionType(risk.recommendedAction);
                          setActionDocId(risk.entityId);
                          setActiveTab('actions');
                        }}
                        className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1"
                      >
                        <span>Execute Action</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 font-mono border-t border-slate-800/60 pt-2">
                    Cross-Module Link: {risk.crossModuleContext}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. 8D CAPA & FISHBONE TAB */}
        {activeTab === 'capa' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <span>8D CAPA Workbench & Fishbone (Ishikawa) Analysis</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Structured 8D Problem Solving Methodology with 5 Whys & Cause-and-Effect Analysis
                </p>
              </div>
              <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs px-2.5 py-1 rounded-lg font-mono">
                CAPA-8D-2026-004 Active
              </span>
            </div>

            {report.capa8DReports && report.capa8DReports.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
                <div>
                  <h4 className="font-bold text-blue-300 text-sm mb-1">Problem Statement</h4>
                  <p className="text-xs text-slate-200 bg-slate-950 p-3 rounded-lg border border-slate-800">
                    {report.capa8DReports[0].problemStatement}
                  </p>
                </div>

                {/* 5 Whys Chain */}
                <div className="space-y-2">
                  <h4 className="font-bold text-amber-300 text-xs uppercase tracking-wider">5 Whys Root-Cause Chain</h4>
                  <div className="space-y-2">
                    {report.capa8DReports[0].rootCause5Whys.map((why) => (
                      <div key={why.step} className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-start space-x-3 text-xs">
                        <span className="bg-amber-500/20 text-amber-300 font-extrabold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
                          W{why.step}
                        </span>
                        <div>
                          <p className="font-semibold text-slate-300">{why.question}</p>
                          <p className="text-slate-400 mt-0.5">{why.answer}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fishbone Ishikawa Categories */}
                <div className="space-y-2">
                  <h4 className="font-bold text-blue-300 text-xs uppercase tracking-wider">Fishbone Cause-and-Effect Categories</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {report.capa8DReports[0].fishboneCategories.map((fish, idx) => (
                      <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5">
                        <p className="font-bold text-blue-400 text-xs">{fish.category}</p>
                        <ul className="text-xs text-slate-300 list-disc list-inside space-y-1">
                          {fish.causes.map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Permanent Corrective Actions */}
                <div className="space-y-2">
                  <h4 className="font-bold text-emerald-300 text-xs uppercase tracking-wider">Permanent Corrective Actions (D6)</h4>
                  <div className="space-y-2">
                    {report.capa8DReports[0].permanentCorrectiveActions.map((pca) => (
                      <div key={pca.actionId} className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-mono text-blue-400 font-bold">{pca.actionId}: </span>
                          <span className="text-slate-200 font-medium">{pca.description}</span>
                          <p className="text-[11px] text-slate-400 mt-0.5">Owner: {pca.owner} • Due Date: {pca.dueDate}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          pca.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }`}>
                          {pca.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. MULTI-AGENT ENTERPRISE ARCHITECTURE TAB */}
        {activeTab === 'multiAgent' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-white text-base flex items-center space-x-2">
                  <Layers className="w-5 h-5 text-blue-400" />
                  <span>{multiAgentArch.title}</span>
                </h3>
                <span className="bg-blue-500/10 text-blue-400 text-xs px-2.5 py-1 rounded-lg border border-blue-500/20 font-mono">
                  {multiAgentArch.version}
                </span>
              </div>

              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-blue-300 font-mono text-[11px] overflow-x-auto leading-relaxed">
                {multiAgentArch.architectureDiagramText}
              </pre>
            </div>

            {/* Agent Roster Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {multiAgentArch.agents.map((ag) => (
                <div key={ag.agentName} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h4 className="font-bold text-blue-400 text-sm flex items-center space-x-1.5">
                      <Cpu className="w-4 h-4 text-blue-400" />
                      <span>{ag.agentName}</span>
                    </h4>
                  </div>

                  <p className="text-xs text-slate-300">{ag.agentRole}</p>

                  <div className="space-y-1 text-xs">
                    <p className="text-slate-400 font-mono"><strong className="text-slate-300">APIs:</strong> {ag.s4HanaApis.join(', ')}</p>
                    <p className="text-slate-400 font-mono"><strong className="text-slate-300">Policy:</strong> {ag.policyBoundary}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. 3-TIER RECOMMENDED APPROVAL MODEL TAB */}
        {activeTab === 'approvalModel' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-white text-base flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-emerald-400" />
                    <span>{approvalModel.title}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{approvalModel.description}</p>
                </div>
                <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-1 rounded-lg border border-emerald-500/20 font-mono">
                  {approvalModel.totalCapabilitiesCount} Governance Rules
                </span>
              </div>
            </div>

            <div className="space-y-6">
              {approvalModel.tiers.map((tier) => (
                <div key={tier.tierKey} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        tier.tierKey === 'FULLY_AUTONOMOUS_READ_ONLY' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                        tier.tierKey === 'POLICY_CONTROLLED' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                        'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}>
                        {tier.tierName}
                      </span>
                      <span className="text-xs text-slate-300">{tier.description}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {tier.items.map((item, idx) => (
                      <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div>
                          <span className="font-bold text-white capitalize">{item.name}</span>
                          <p className="text-slate-400 mt-0.5">{item.policyRule}</p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono text-slate-400">{item.s4HanaService}</span>
                          {item.autoExecute ? (
                            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                              Auto-Execute
                            </span>
                          ) : (
                            <span className="bg-rose-500/20 text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded border border-rose-500/30">
                              My Inbox Approval
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. 50 NATURAL LANGUAGE QA CATALOG TAB */}
        {activeTab === 'qa' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center space-x-2 flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search 50 Natural Language QM Questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-xs rounded-lg px-3 py-2 text-slate-200 placeholder-slate-500 w-full focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={qaCategoryFilter}
                  onChange={(e) => setQaCategoryFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-xs rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  {domains.map((dom) => (
                    <option key={dom} value={dom}>{dom}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-xs text-slate-400">
              Showing {filteredQaItems.length} of {qaCatalog.length} Natural Language Quality Management Questions
            </div>

            <div className="space-y-3">
              {filteredQaItems.map((item, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 hover:border-slate-700 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <span className="bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-blue-500/30 mt-0.5">
                        #{idx + 1}
                      </span>
                      <div>
                        <p className="font-bold text-white text-sm">{item.question}</p>
                        <p className="text-xs text-slate-300 mt-1">{item.intent}</p>
                      </div>
                    </div>
                    <span className="bg-slate-800 text-slate-300 text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-700">
                      {item.domainName}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 mt-2">
                    <p className="text-slate-400 font-mono">
                      <strong className="text-slate-300">S/4HANA Entities:</strong> {item.s4HanaEntitiesUsed.join(', ')}
                    </p>
                    <p className="text-slate-400 font-mono">
                      <strong className="text-slate-300">Fiori App / T-Code:</strong> {item.actionableTCodeOrFioriApp}
                    </p>
                  </div>

                  <p className="text-[11px] text-blue-300 font-mono border-t border-slate-800 pt-2 mt-2">
                    Cross-Module Link: {item.crossModuleCorrelation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. AUTONOMOUS ACTION CENTER TAB */}
        {activeTab === 'actions' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="font-bold text-white text-base flex items-center space-x-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <span>Autonomous Action Center & Policy Interlock Engine</span>
              </h3>
              <p className="text-xs text-slate-300">
                Simulate or execute Quality Management actions. All requests undergo 3-tier policy validation against S/4HANA rules before posting or routing to Fiori My Inbox.
              </p>

              <form onSubmit={handleActionSubmit} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Action Type</label>
                    <select
                      value={selectedActionType}
                      onChange={(e) => setSelectedActionType(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-xs rounded-lg px-3 py-2.5 text-slate-200 w-full focus:outline-none focus:border-blue-500"
                    >
                      <option value="create inspection lot">1. Create Inspection Lot (Type 01/03/04)</option>
                      <option value="record inspection results">2. Record Inspection Results (QA32 / QE11)</option>
                      <option value="make usage decision">3. Make Usage Decision (QA11)</option>
                      <option value="create Quality Notification">4. Create Quality Notification (QN-F2 / QN-Q3)</option>
                      <option value="trigger CAPA workflow">5. Trigger CAPA Workflow & 8D Analysis</option>
                      <option value="block defective batch in EWM/MM">6. Block Defective Inventory (07 Blocked Stock)</option>
                      <option value="release approved stock">7. Release Approved Stock (01 Unrestricted Stock)</option>
                      <option value="trigger supplier notification">8. Trigger Supplier Quality Advisory Notification</option>
                      <option value="schedule supplier audit">9. Schedule Supplier Quality Audit (IATF 16949 / VDA 6.3)</option>
                      <option value="create inspection plan">10. Create Inspection Plan (QP01 / QP02)</option>
                      <option value="recommend inspection frequency change">11. Recommend Inspection Frequency Change (DMR)</option>
                      <option value="release & digitally sign Certificate of Analysis">12. Generate & Sign Quality Certificate (CoA / QC03)</option>
                      <option value="trigger reinspection">13. Trigger Reinspection Lot (Type 08 Stock Retest)</option>
                      <option value="reprocess failed quality interface">14. Reprocess Failed Quality Interface (WE19 / BD87)</option>
                      <option value="Usage Decision override">15. Usage Decision Override (Accept with Deviation - Human Approval)</option>
                      <option value="scrap blocked defective inventory">16. Scrap Blocked Inventory (MIGO 551 - &gt; €5,000)</option>
                      <option value="block or unblock vendor Quality Info Record">17. Block / Unblock Vendor Quality Info Record (QIR)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Document / Entity ID</label>
                    <input
                      type="text"
                      value={actionDocId}
                      onChange={(e) => setActionDocId(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-xs rounded-lg px-3 py-2.5 text-slate-200 w-full focus:outline-none focus:border-blue-500 font-mono"
                      placeholder="e.g. INS-010084920 or BAT-202607-09"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={actionRunning}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs px-5 py-2.5 rounded-lg transition-all flex items-center space-x-2"
                >
                  {actionRunning ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Evaluating Policy & Executing in S/4HANA...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span>Submit Action to S/4HANA Policy Interlock</span>
                    </>
                  )}
                </button>
              </form>

              {actionFeedback && (
                <div className="bg-slate-950 border border-blue-500/30 rounded-xl p-4 text-xs space-y-2 mt-4">
                  <p className="font-bold text-blue-300 flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>S/4HANA Policy Evaluation Result</span>
                  </p>
                  <p className="text-slate-200 leading-relaxed font-mono">{actionFeedback}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 8. IMMUTABLE AUDIT TRAIL TAB */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-400" />
                <span>Immutable S/4HANA QM Execution Audit Trail</span>
              </h3>
              <span className="bg-blue-500/10 text-blue-400 text-xs px-2.5 py-1 rounded-lg border border-blue-500/20 font-mono">
                {report.auditLogs.length} Verified Log Entries
              </span>
            </div>

            <div className="space-y-3">
              {report.auditLogs.map((log) => (
                <div key={log.logId} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-blue-400">{log.agentName}</span>
                      <span className="text-slate-400">• {log.actionPerformed}</span>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      log.policyStatus === 'PASSED_AUTONOMOUS' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                      log.policyStatus === 'POLICY_INTERLOCKED' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                      'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    }`}>
                      {log.policyStatus}
                    </span>
                  </div>

                  <p className="text-slate-300">{log.details}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
                    <span>API Call: {log.s4HanaApiCall}</span>
                    <span>Timestamp: {log.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
