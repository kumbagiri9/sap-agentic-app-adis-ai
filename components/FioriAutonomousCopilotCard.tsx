import React, { useState } from 'react';
import { FioriService } from '../services/fioriService';
import {
  Sparkles,
  Zap,
  ShieldCheck,
  ShieldAlert,
  CheckCircle,
  AlertTriangle,
  Clock,
  Layers,
  Search,
  ExternalLink,
  ArrowRight,
  Database,
  RefreshCw,
  Cpu,
  FileText,
  UserCheck,
  Check,
  X,
  Lock,
  Building2,
  DollarSign,
  ShoppingCart,
  Package,
  Truck,
  CreditCard,
  Briefcase,
  Users
} from 'lucide-react';
import { sapApi } from '../services/sapService';
import { FioriOrchestratorResult, FioriAppMapping } from '../services/fioriService';

interface FioriAutonomousCopilotCardProps {
  data?: FioriOrchestratorResult | FioriAppMapping[] | any;
}

export const FioriAutonomousCopilotCard: React.FC<FioriAutonomousCopilotCardProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'orchestrator' | 'mappings' | 'riskMatrix' | 'audit'>('orchestrator');
  const [customQuery, setCustomQuery] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [orchestratorResult, setOrchestratorResult] = useState<FioriOrchestratorResult | null>(
    data && data.correlationId ? data : null
  );
  const [mappings, setMappings] = useState<FioriAppMapping[]>(
    Array.isArray(data) ? data : []
  );
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pendingApprovalSuccess, setPendingApprovalSuccess] = useState(false);

  // Initialize data if not provided
  React.useEffect(() => {
    if (!orchestratorResult && !Array.isArray(data)) {
      setIsExecuting(true);
      sapApi.executeFioriAgentWorkflow("Create Sales Order for Walmart of 500 units of MAT-100 in Plant 1000", "Business User")
        .then(res => {
          setOrchestratorResult(res);
          setIsExecuting(false);
        })
        .catch(err => {
          console.error("Fiori Agent Error:", err);
          setIsExecuting(false);
        });
    }
  }, [data]);

  const handleRunQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuery.trim()) return;
    setIsExecuting(true);
    setFeedback(null);
    setPendingApprovalSuccess(false);

    try {
      const res = await sapApi.executeFioriAgentWorkflow(customQuery, "Business User");
      setOrchestratorResult(res);
    } catch (err: any) {
      setFeedback(`Execution Exception: ${err.message || 'Error running Fiori workflow'}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleApproveTransaction = async (approvalId?: string) => {
    if (!orchestratorResult) return;
    setIsExecuting(true);
    setFeedback(null);

    try {
      const updated = await sapApi.executeFioriAgentWorkflow(
        orchestratorResult.userQuery,
        orchestratorResult.authorizationCheck.userRole,
        approvalId || orchestratorResult.transactionPreview?.approvalId
      );
      setOrchestratorResult(updated);
      setPendingApprovalSuccess(true);
      setFeedback(`Transaction Approved! Posted S/4HANA Document ${updated.sapExecutionResult?.sapDocumentNumber} via live OData Gateway.`);
    } catch (err: any) {
      setFeedback(`Approval Error: ${err.message || 'Failed to post transaction to S/4HANA'}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const riskMatrix = [
    { level: 0, title: 'Level 0 — Read-Only', policy: 'Auto-Execute', auth: 'S_TABU_DIS', examples: 'Order lookup, Stock check, PO status' },
    { level: 1, title: 'Level 1 — Low Risk', policy: 'Auto-Execute', auth: 'M_BEST_EKO', examples: 'Draft PR creation, Quality notification log' },
    { level: 2, title: 'Level 2 — Business Transaction', policy: 'Preview & Confirmation', auth: 'V_VBAK_AAT', examples: 'Create Sales Order, Post Goods Receipt, Delivery' },
    { level: 3, title: 'Level 3 — Financial / Master Data', policy: 'Mandatory Human Approval', auth: 'F_BKPF_BUK', examples: 'Journal Posting, Supplier Creation, Invoice Cancellation' },
    { level: 4, title: 'Level 4 — Critical / High Impact', policy: 'Multi-Level Approval', auth: 'GRC_ADMIN', examples: 'Mass updates, Credit Limit Override, Bank account change' }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-100 shadow-2xl space-y-6 my-4 w-full">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-600/20 border border-blue-500/30 rounded-lg text-blue-400">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-wide">Autonomous SAP Fiori Agent</h2>
              <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase">
                Conversational S/4HANA Engine
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Conversational SAP Business Execution Without Opening Fiori Applications • 100% Live S/4HANA OData
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('orchestrator')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'orchestrator'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Orchestrator
          </button>
          <button
            onClick={() => setActiveTab('mappings')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'mappings'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Fiori Registry
          </button>
          <button
            onClick={() => setActiveTab('riskMatrix')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'riskMatrix'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Risk Matrix
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'audit'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Audit Trail
          </button>
        </div>
      </div>

      {/* Conversational Prompt Input Form */}
      <form onSubmit={handleRunQuery} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={customQuery}
            onChange={(e) => setCustomQuery(e.target.value)}
            placeholder='Ask Fiori Agent: "Create a Sales Order for Walmart of 500 units of MAT-100", "Post Goods Receipt for PO 4500089201"'
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>
        <button
          type="submit"
          disabled={isExecuting}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-lg disabled:opacity-50"
        >
          {isExecuting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          <span>Run Conversational Process</span>
        </button>
      </form>

      {/* Feedback banner */}
      {feedback && (
        <div className={`p-3 rounded-lg border text-xs font-mono flex items-center gap-2 ${
          feedback.includes('Approved') || feedback.includes('Posted') || pendingApprovalSuccess
            ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
            : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
        }`}>
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Main Content Area based on Active Tab */}
      {activeTab === 'orchestrator' && orchestratorResult && (
        <div className="space-y-6">
          {/* Orchestrator Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-lg">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono">Specialized Agent</span>
              <div className="flex items-center gap-1.5 mt-1">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-white">{orchestratorResult.specializedAgentName}</span>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-lg">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono">Detected Intent</span>
              <span className="text-xs font-bold text-blue-300 mt-1 block truncate">{orchestratorResult.intentDetected}</span>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-lg">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono">Risk Classification</span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                  orchestratorResult.riskLevel === 0 ? 'bg-slate-800 text-slate-300' :
                  orchestratorResult.riskLevel === 1 ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                  orchestratorResult.riskLevel === 2 ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                  'bg-rose-950 text-rose-400 border border-rose-800'
                }`}>
                  Level {orchestratorResult.riskLevel}
                </span>
                <span className="text-[10px] text-slate-300 truncate">{orchestratorResult.riskLevelDescription.split('(')[0]}</span>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-lg">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono">PFCG Authorization</span>
              <div className="flex items-center gap-1.5 mt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-300">{orchestratorResult.authorizationCheck.pfcgObject} ({orchestratorResult.authorizationCheck.status})</span>
              </div>
            </div>
          </div>

          {/* Business Rule Validation Checks */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono block">
              Business Rule Validation Guardrails
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {orchestratorResult.businessRuleValidations.map((val, idx) => (
                <div key={idx} className="p-2.5 bg-slate-900 border border-slate-800 rounded flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white block">{val.ruleName}</span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">{val.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live S/4HANA OData Data Preview */}
          {orchestratorResult.liveS4DataRetrieved && (
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-blue-400" />
                  Live S/4HANA OData Service Stream
                </span>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-mono font-bold">
                  Client 100 Live Connected
                </span>
              </div>
              <div className="bg-slate-900 p-3 rounded border border-slate-800 overflow-x-auto text-[11px] font-mono text-slate-300 max-h-40">
                <pre>{JSON.stringify(orchestratorResult.liveS4DataRetrieved, null, 2)}</pre>
              </div>
            </div>
          )}

          {/* Transaction Preview & Human-in-the-Loop Approval Action */}
          {orchestratorResult.transactionPreview && (
            <div className="bg-slate-950 border border-blue-900/60 rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider font-mono block">
                    Transaction Preview & Policy Gate
                  </span>
                  <span className="text-sm font-semibold text-white">
                    {orchestratorResult.transactionPreview.actionName}
                  </span>
                </div>
                {orchestratorResult.sapExecutionResult?.success ? (
                  <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-3 py-1 rounded text-xs font-bold font-mono">
                    POSTED: {orchestratorResult.sapExecutionResult.sapDocumentNumber}
                  </span>
                ) : (
                  <span className="bg-amber-950 text-amber-400 border border-amber-800 px-3 py-1 rounded text-xs font-bold font-mono">
                    PENDING HUMAN APPROVAL
                  </span>
                )}
              </div>

              {/* Proposed Transaction Parameters */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                {Object.entries(orchestratorResult.transactionPreview.parameters).map(([k, v]) => (
                  <div key={k} className="p-2 bg-slate-900 rounded border border-slate-800 font-mono">
                    <span className="text-[10px] text-slate-400 uppercase block">{k}</span>
                    <span className="font-semibold text-slate-200 mt-0.5 block truncate">{String(v)}</span>
                  </div>
                ))}
              </div>

              {/* Policy note & Approve Action */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <span className="text-xs text-amber-300/80 font-mono">
                  {orchestratorResult.transactionPreview.approvalPolicyNote}
                </span>

                {!orchestratorResult.sapExecutionResult?.success && (
                  <button
                    onClick={() => handleApproveTransaction(orchestratorResult.transactionPreview?.approvalId)}
                    disabled={isExecuting}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-all shadow-lg flex items-center gap-1.5 shrink-0"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve & Execute in S/4HANA</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* S/4HANA Document Flow Chain */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono block">
              S/4HANA Live Document Flow Verification
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs font-mono">
              {orchestratorResult.documentFlowChain.map((step) => (
                <div key={step.stepOrder} className={`p-2.5 rounded border ${
                  step.status.includes('Posted') || step.status.includes('Completed')
                    ? 'bg-slate-900 border-emerald-800/80 text-emerald-300'
                    : 'bg-slate-900/50 border-slate-800 text-slate-400'
                }`}>
                  <span className="text-[9px] text-slate-500 block">Step {step.stepOrder}</span>
                  <span className="font-bold block text-[11px] truncate">{step.docType}</span>
                  <span className="text-[10px] font-bold block text-blue-400 mt-1">{step.docNumber}</span>
                  <span className="text-[9px] block text-slate-400 mt-0.5">{step.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Fallback to Fiori Deep Link */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[10px]">Fiori Application Fallback</span>
              <span className="font-bold text-white">{orchestratorResult.fallbackFioriApp.appName} ({orchestratorResult.fallbackFioriApp.appId})</span>
            </div>
            <a
              href={orchestratorResult.fallbackFioriApp.semanticUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded text-xs font-semibold flex items-center gap-1 transition-all"
            >
              <span>Open in SAP Fiori</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* Fiori App Mapping Registry Tab */}
      {activeTab === 'mappings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              Fiori Intent to App & OData Mapping Catalog
            </span>
            <span className="text-xs text-slate-400 font-mono">8 Standard Fiori Applications Registered</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
            {FioriService.getRiskClassificationMatrix().map((risk, idx) => (
              <div key={idx} className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-blue-300">{risk.category}</span>
                  <span className="px-2 py-0.5 bg-blue-950 text-blue-400 border border-blue-800 rounded text-[10px] font-bold">
                    Level {risk.level}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">{risk.description}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                  <span>Policy: <strong className="text-slate-200">{risk.approvalRequired ? 'Human Approval' : 'Auto-Execute'}</strong></span>
                  <span>Auth: <strong className="text-emerald-400">{risk.authObj}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk Matrix Tab */}
      {activeTab === 'riskMatrix' && (
        <div className="space-y-4">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono block">
            5-Level Action Risk Classification & Governance Matrix
          </span>

          <div className="space-y-2">
            {riskMatrix.map((item) => (
              <div key={item.level} className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                <div className="space-y-0.5">
                  <span className="font-bold text-white">{item.title}</span>
                  <span className="text-[11px] text-slate-400 block">Examples: {item.examples}</span>
                </div>
                <div className="shrink-0 flex items-center gap-3">
                  <span className="text-[10px] text-slate-400">PFCG: <strong className="text-blue-300">{item.auth}</strong></span>
                  <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                    item.level <= 1 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                    item.level === 2 ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                    'bg-rose-950 text-rose-400 border border-rose-800'
                  }`}>
                    {item.policy}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit Trail Tab */}
      {activeTab === 'audit' && orchestratorResult && (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              Immutable System Audit Trail Log
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Correlation ID: <strong className="text-blue-400">{orchestratorResult.correlationId}</strong>
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            {orchestratorResult.auditTrailLog.map((log, idx) => (
              <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-blue-400 font-bold">{log.stepName}</span>
                    <span className="text-[10px] text-slate-500">({log.actor})</span>
                  </div>
                  <span className="text-slate-300 block">{log.detail}</span>
                </div>
                <span className="text-[10px] text-slate-500 shrink-0">{log.timestamp.split('T')[1]?.split('.')[0]}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
