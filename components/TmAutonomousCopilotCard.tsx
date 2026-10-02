import React, { useState, useEffect } from 'react';
import {
  Truck,
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
  Navigation,
  Share2,
  Thermometer,
  Anchor,
  Cpu,
  BarChart2,
  Lock,
  RotateCcw,
  Users,
  ShieldCheck
} from 'lucide-react';
import { tmService, TmAutonomousReport, TmShipmentRisk, TmCarrierPerformance, TmCostOverrunAlert, TmCapacityForecast, TmAutonomousException, TmNaturalLanguageQaItem } from '../services/tmService';

interface TmAutonomousCopilotCardProps {
  data?: TmAutonomousReport | any;
}

export const TmAutonomousCopilotCard: React.FC<TmAutonomousCopilotCardProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'controlTower' | 'transportationControlTower' | 'multiAgent' | 'approvalModel' | 'carriers' | 'costs' | 'capacity' | 'exceptions' | 'actions' | 'carrierSelection' | 'loadConsolidation' | 'costIntelligence' | 'predictiveAi' | 'autonomousTendering' | 'freightSettlement' | 'qa' | 'audit'>(data && data.tiers ? 'approvalModel' : 'controlTower');
  const [searchQuery, setSearchQuery] = useState('');
  const [qaCategoryFilter, setQaCategoryFilter] = useState('All');
  const [executingExceptionId, setExecutingExceptionId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [reportData, setReportData] = useState<TmAutonomousReport | null>(data && data.shipmentsAtRisk ? data : null);
  const [loading, setLoading] = useState(!data || (!data.shipmentsAtRisk && !data.narrativeSummary && !data.actionResultDetails && !data.candidates && !data.consolidatedPlan && !data.costIncreaseAnalysis && !data.mostExpensiveLanes && !data.predictions && !data.tenderingCascades && !data.blockedInvoices && !data.settlementCorrelations && !data.multiAgentArchitecture));
  const [executiveOverviewText, setExecutiveOverviewText] = useState<string | null>(null);
  const [expandedQaId, setExpandedQaId] = useState<number | null>(null);
  const [selectedActionType, setSelectedActionType] = useState('change_route');
  const [actionDocId, setActionDocId] = useState('FO-60098120');
  const [actionCarrierId, setActionCarrierId] = useState('DHL Global Forwarding');
  const [actionRunning, setActionRunning] = useState(false);

  const [carrierSelQuery, setCarrierSelQuery] = useState('FO-60098120');
  const [carrierSelPriority, setCarrierSelPriority] = useState('Normal');
  const [carrierSelLoading, setCarrierSelLoading] = useState(false);
  const [carrierSelResult, setCarrierSelResult] = useState<any>(null);

  const [consolidationQuery, setConsolidationQuery] = useState("Today's Outbound Shipments");
  const [consolidationLoading, setConsolidationLoading] = useState(false);
  const [consolidationResult, setConsolidationResult] = useState<any>(data && data.consolidatedPlan ? data : null);

  const [costIntelQuery, setCostIntelQuery] = useState("Why did freight cost increase this month?");
  const [costIntelLoading, setCostIntelLoading] = useState(false);
  const [costIntelResult, setCostIntelResult] = useState<any>(data && (data.costIncreaseAnalysis || data.mostExpensiveLanes) ? data : null);

  const [predictiveQuery, setPredictiveQuery] = useState("Comprehensive 11-Vector Predictive Transportation AI Risk Assessment");
  const [predictiveLoading, setPredictiveLoading] = useState(false);
  const [predictiveResult, setPredictiveResult] = useState<any>(data && data.predictions ? data : null);

  const [tenderingFoQuery, setTenderingFoQuery] = useState("FO-900142");
  const [tenderingLoading, setTenderingLoading] = useState(false);

  const [approvalModelSearch, setApprovalModelSearch] = useState('');
  const [approvalModelFilter, setApprovalModelFilter] = useState<'ALL' | 'FULLY_AUTONOMOUS_READ_ONLY' | 'POLICY_CONTROLLED' | 'HUMAN_APPROVAL_REQUIRED'>('ALL');
  const [evalActionName, setEvalActionName] = useState('large freight cost override');
  const [evalAmount, setEvalAmount] = useState(650);
  const [evalResult, setEvalResult] = useState<any>(null);

  const handleEvaluateActionPolicy = (actionName?: string, amount?: number) => {
    const act = actionName || evalActionName;
    const amt = amount !== undefined ? amount : evalAmount;
    const model = reportData?.recommendedApprovalModel || tmService.getRecommendedApprovalModel();
    
    let matchedItem: any = null;
    let matchedTier: any = null;

    for (const t of model.tiers) {
      const found = t.items.find(i => i.name.toLowerCase() === act.toLowerCase());
      if (found) {
        matchedItem = found;
        matchedTier = t;
        break;
      }
    }

    if (!matchedItem) {
      setEvalResult({
        actionName: act,
        tierName: 'Policy-Controlled',
        badgeColor: 'amber',
        policyOutcome: 'POLICY_INTERLOCKED',
        explanation: `Action "${act}" evaluated against default S/4HANA policy rules. Auto-execution permitted under standard operational limits.`,
        s4HanaService: 'API_FREIGHTORDER_SRV',
        requiresFioriApproval: false
      });
      return;
    }

    const isHumanTier = matchedTier.tierKey === 'HUMAN_APPROVAL_REQUIRED';
    const isPolicyTier = matchedTier.tierKey === 'POLICY_CONTROLLED';

    setEvalResult({
      actionName: matchedItem.name,
      tierKey: matchedTier.tierKey,
      tierName: matchedTier.tierName,
      badgeColor: matchedTier.badgeColor,
      policyRule: matchedItem.policyRule,
      s4HanaService: matchedItem.s4HanaService,
      autoExecute: matchedItem.autoExecute,
      requiresFioriApproval: isHumanTier,
      explanation: isHumanTier 
        ? `HUMAN-IN-THE-LOOP MANDATED: "${matchedItem.name}" exceeds automatic policy threshold (Amount: €${amt}). Held in SAP Fiori My Inbox for authorized manager signoff.`
        : isPolicyTier
        ? `POLICY-GOVERNED EXECUTION: "${matchedItem.name}" meets S/4HANA interlock criteria. Executing automatically with immutable audit logging.`
        : `AUTONOMOUS READ-ONLY: "${matchedItem.name}" executed continuously with 100% live S/4HANA OData synchronization.`
    });
  };
  const [tenderingResult, setTenderingResult] = useState<any>(data && (data.tenderingCascades || data.workflowFlowchart) ? data : null);

  const [settlementQuery, setSettlementQuery] = useState("Which freight invoices are blocked?");
  const [settlementLoading, setSettlementLoading] = useState(false);
  const [settlementResult, setSettlementResult] = useState<any>(data && (data.blockedInvoices || data.settlementCorrelations) ? data : null);

  const [controlTowerQuery, setControlTowerQuery] = useState("What is happening across my transportation network right now?");
  const [controlTowerLoading, setControlTowerLoading] = useState(false);
  const [controlTowerResult, setControlTowerResult] = useState<any>(data && (data.customerImpactingShipments || data.summaryKPIs) ? data : null);

  const [exceptionMgmtQuery, setExceptionMgmtQuery] = useState("Detect and resolve all transportation network exceptions");
  const [exceptionCategoryFilter, setExceptionCategoryFilter] = useState("ALL");
  const [exceptionMgmtLoading, setExceptionMgmtLoading] = useState(false);
  const [exceptionMgmtResult, setExceptionMgmtResult] = useState<any>(data && data.workflowDefinition ? data : null);

  const [multiAgentQuery, setMultiAgentQuery] = useState("Coordinate multi-agent SAP TM operations");
  const [multiAgentFilter, setMultiAgentFilter] = useState("ALL");
  const [multiAgentLoading, setMultiAgentLoading] = useState(false);
  const [multiAgentResult, setMultiAgentResult] = useState<any>(data && data.multiAgentArchitecture ? data : null);

  const handleAnalyzeMultiAgentInTab = async (queryOverride?: string, filterOverride?: string) => {
    setMultiAgentLoading(true);
    const targetQ = queryOverride || multiAgentQuery;
    const targetF = filterOverride || multiAgentFilter;
    try {
      const res = await tmService.getMultiAgentTmArchitecture(targetQ, targetF);
      setMultiAgentResult(res);
      setActionFeedback(`Loaded Multi-Agent SAP TM Architecture: 10 specialized agents interlocked.`);
    } catch (err: any) {
      setActionFeedback(`Multi-Agent query error: ${err.message}`);
    } finally {
      setMultiAgentLoading(false);
    }
  };

  const handleExecuteMultiAgentActionInTab = async (agentId: string, actionKey: string) => {
    setActionRunning(true);
    try {
      const res = await tmService.executeMultiAgentAction(agentId, actionKey);
      setActionFeedback(`[S/4HANA MULTI-AGENT EXECUTED] ${actionKey} for Agent ${agentId}: ${res.s4HanaODataResponse.message} (Audit Hash: ${res.auditLog.hashSha256.slice(0, 16)}...)`);
    } catch (err: any) {
      setActionFeedback(`Multi-agent action error: ${err.message}`);
    } finally {
      setActionRunning(false);
    }
  };

  const handleAnalyzeExceptionMgmtInTab = async (queryOverride?: string, catOverride?: string) => {
    setExceptionMgmtLoading(true);
    const targetQ = queryOverride || exceptionMgmtQuery;
    const targetCat = catOverride || exceptionCategoryFilter;
    try {
      const res = await tmService.getAutonomousExceptionManagement(targetQ, targetCat);
      setExceptionMgmtResult(res);
      setActionFeedback(`Loaded S/4HANA Autonomous Exception Management Engine: ${res.exceptions?.length || 0} exceptions mapped across 7-stage agentic workflow.`);
    } catch (err: any) {
      setActionFeedback(`Exception Management query error: ${err.message}`);
    } finally {
      setExceptionMgmtLoading(false);
    }
  };

  const handleExecuteExceptionStage = async (exceptionId: string, stage: 'APPROVE' | 'EXECUTE' | 'VERIFY' | 'AUDIT') => {
    setActionRunning(true);
    try {
      const res = await tmService.executeAutonomousExceptionAction(exceptionId, stage);
      setActionFeedback(`[S/4HANA EXECUTED] ${stage} for ${exceptionId}: ${res.s4HanaODataResponse.message} (Audit Hash: ${res.auditLog.hashSha256.slice(0, 16)}...)`);
      if (exceptionMgmtResult && exceptionMgmtResult.exceptions) {
        const updatedExs = exceptionMgmtResult.exceptions.map((ex: any) => {
          if (ex.exceptionId === exceptionId) {
            const newStage = stage === 'APPROVE' ? 'APPROVED' : stage === 'EXECUTE' ? 'EXECUTED' : stage === 'VERIFY' ? 'VERIFIED' : 'AUDITED';
            return {
              ...ex,
              currentStage: newStage,
              workflow: {
                ...ex.workflow,
                [stage.toLowerCase()]: {
                  ...ex.workflow[stage.toLowerCase()],
                  status: stage === 'APPROVE' ? 'APPROVED' : 'COMPLETED_SUCCESSFULLY'
                }
              }
            };
          }
          return ex;
        });
        setExceptionMgmtResult({ ...exceptionMgmtResult, exceptions: updatedExs });
      }
    } catch (err: any) {
      setActionFeedback(`Execution error: ${err.message}`);
    } finally {
      setActionRunning(false);
    }
  };

  const handleAnalyzeControlTowerInTab = async (queryOverride?: string) => {
    setControlTowerLoading(true);
    const targetQ = queryOverride || controlTowerQuery;
    try {
      const res = await tmService.getTransportationControlTower(targetQ, '1010');
      setControlTowerResult(res);
      setActionFeedback(`Loaded Transportation Control Tower: ${res.summaryKPIs?.totalShipmentsInTransit || 0} shipments in transit, ${res.customerImpactingShipments?.length || 0} customer impacting shipments.`);
    } catch (err: any) {
      setActionFeedback(`Control Tower query error: ${err.message}`);
    } finally {
      setControlTowerLoading(false);
    }
  };

  const handleAnalyzeSettlementInTab = async (queryOverride?: string) => {
    setSettlementLoading(true);
    const targetQ = queryOverride || settlementQuery;
    try {
      const res = await tmService.getFreightSettlementIntelligence(targetQ);
      setSettlementResult(res);
      setActionFeedback(`Loaded Freight Settlement Intelligence: ${res.blockedInvoices?.length || 0} blocked invoices, ${res.settlementCorrelations?.length || 0} settlement correlations.`);
    } catch (err: any) {
      setActionFeedback(`Settlement query error: ${err.message}`);
    } finally {
      setSettlementLoading(false);
    }
  };

  const handleAnalyzeTenderingInTab = async (foOverride?: string) => {
    setTenderingLoading(true);
    const targetFo = foOverride || tenderingFoQuery;
    try {
      const res = await tmService.getAutonomousTenderingWorkflow(targetFo);
      setTenderingResult(res);
      setActionFeedback(`Loaded Autonomous Tendering Cascade for ${res.targetFreightOrder}: ${res.totalCascadesActive} active cascades, ${res.autoReTenderedCount} auto-re-tendered.`);
    } catch (err: any) {
      setActionFeedback(`Tendering error: ${err.message}`);
    } finally {
      setTenderingLoading(false);
    }
  };

  const handleAnalyzePredictiveAiInTab = async (queryOverride?: string) => {
    setPredictiveLoading(true);
    const targetQuery = queryOverride || predictiveQuery;
    try {
      const res = await tmService.getPredictiveTransportationAiAnalysis(targetQuery);
      setPredictiveResult(res);
      setActionFeedback(`Evaluated Predictive Transportation AI across 11 risk categories: ${res.criticalAlertsCount} critical alerts identified.`);
    } catch (err: any) {
      setActionFeedback(`Predictive AI error: ${err.message}`);
    } finally {
      setPredictiveLoading(false);
    }
  };

  const handleAnalyzeCostIntelInTab = async (queryOverride?: string) => {
    setCostIntelLoading(true);
    const targetQuery = queryOverride || costIntelQuery;
    try {
      const res = await tmService.analyzeTransportationCostIntelligence(targetQuery);
      setCostIntelResult(res);
      setActionFeedback(`Evaluated Cost Intelligence for "${targetQuery}": ${res.executiveSummary}`);
    } catch (err: any) {
      setActionFeedback(`Cost Intelligence error: ${err.message}`);
    } finally {
      setCostIntelLoading(false);
    }
  };

  const handleEvaluateCarriersInTab = async () => {
    setCarrierSelLoading(true);
    try {
      const res = await tmService.evaluateBestCarriersForLoad(carrierSelQuery, carrierSelPriority);
      setCarrierSelResult(res);
      setActionFeedback(`Evaluated best carriers for load ${carrierSelQuery} on lane ${res.lane}`);
    } catch (err: any) {
      setActionFeedback(`Carrier evaluation error: ${err.message}`);
    } finally {
      setCarrierSelLoading(false);
    }
  };

  const handleConsolidateInTab = async () => {
    setConsolidationLoading(true);
    try {
      const res = await tmService.consolidateOutboundShipments(consolidationQuery);
      setConsolidationResult(res);
      setActionFeedback(`Evaluated load consolidation for ${consolidationQuery}: ${res.proposalSummary}`);
    } catch (err: any) {
      setActionFeedback(`Load consolidation error: ${err.message}`);
    } finally {
      setConsolidationLoading(false);
    }
  };

  useEffect(() => {
    if (!reportData && !data?.narrativeSummary && !data?.actionResultDetails) {
      setLoading(true);
      tmService.getAutonomousTmReport('1010').then(res => {
        setReportData(res);
        setLoading(false);
      });
    }
  }, [data]);

  const handleExecuteAutonomousAction = async () => {
    setActionRunning(true);
    setActionFeedback(null);
    try {
      const result = await tmService.executeAutonomousTmAction(selectedActionType, {
        freightOrderId: actionDocId,
        carrierId: actionCarrierId
      });
      setActionFeedback(`[SUCCESS] ${result.actionTitle}: ${result.actionResultDetails} (Endpoint: ${result.s4HanaODataEndpoint}, Hash: ${result.hashSha256.slice(0, 16)}...)`);
      // Refresh report
      const updated = await tmService.getAutonomousTmReport('1010');
      setReportData(updated);
    } catch (err: any) {
      setActionFeedback(`Action error: ${err.message}`);
    } finally {
      setActionRunning(false);
    }
  };

  // 1. Render Late Shipment Root-Cause Analysis Card if data contains narrativeSummary
  if (data && data.narrativeSummary && data.s4HanaDocumentCorrelation) {
    const ls = data;
    return (
      <div className="bg-slate-950 text-slate-100 border border-amber-500/40 rounded-2xl shadow-2xl p-5 mb-6 font-sans space-y-4 animate-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-amber-500/30 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-amber-500/20 border border-amber-400/30 rounded-xl flex items-center justify-center text-amber-400">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-sm uppercase tracking-wider text-amber-300">Late Shipment Root-Cause Diagnostic</span>
                <span className="bg-amber-950 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-800 uppercase">S/4HANA TM LIVE</span>
              </div>
              <p className="text-xs text-slate-400">Target Query: <code className="text-amber-200 font-mono">{ls.query}</code> | Shipment: <code className="text-amber-200 font-mono">{ls.shipmentId}</code></p>
            </div>
          </div>
          <span className="bg-rose-950/80 text-rose-300 text-xs font-mono font-bold px-3 py-1 rounded-lg border border-rose-800">
            +{ls.delayMinutes} Mins Late
          </span>
        </div>

        {/* Narrative Box exact required format */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
          <div className="text-xs text-amber-400 font-bold uppercase tracking-wider flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Root-Cause Narrative Summary</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-sans border-l-2 border-amber-500 pl-3 py-1">
            {ls.narrativeSummary}
          </p>
        </div>

        {/* S/4HANA End-to-End Document Flow Correlation */}
        <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-xl space-y-2.5">
          <span className="text-xs font-bold text-sky-400 uppercase tracking-wider block">S/4HANA End-to-End Lineage Correlation (SD + EWM + TM + Telematics)</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono text-slate-300">
            <div className="bg-slate-950 p-2 rounded border border-slate-800"><strong className="text-slate-400">Sales Order:</strong> {ls.s4HanaDocumentCorrelation.salesOrder}</div>
            <div className="bg-slate-950 p-2 rounded border border-slate-800"><strong className="text-slate-400">Outbound Delivery:</strong> {ls.s4HanaDocumentCorrelation.outboundDelivery}</div>
            <div className="bg-slate-950 p-2 rounded border border-slate-800"><strong className="text-slate-400">Freight Unit:</strong> {ls.s4HanaDocumentCorrelation.freightUnit}</div>
            <div className="bg-slate-950 p-2 rounded border border-slate-800"><strong className="text-slate-400">Freight Order:</strong> {ls.s4HanaDocumentCorrelation.freightOrder}</div>
            <div className="bg-slate-950 p-2 rounded border border-slate-800"><strong className="text-slate-400">Carrier Tender:</strong> {ls.s4HanaDocumentCorrelation.carrierTender}</div>
            <div className="bg-slate-950 p-2 rounded border border-slate-800"><strong className="text-slate-400">Warehouse Readiness:</strong> {ls.s4HanaDocumentCorrelation.warehouseReadiness}</div>
            <div className="bg-slate-950 p-2 rounded border border-slate-800"><strong className="text-slate-400">Loading Appointment:</strong> {ls.s4HanaDocumentCorrelation.loadingAppointment}</div>
            <div className="bg-slate-950 p-2 rounded border border-slate-800"><strong className="text-slate-400">GPS / Telematics:</strong> {ls.s4HanaDocumentCorrelation.gpsTelematics}</div>
          </div>
        </div>

        {/* Recommended Actions */}
        <div className="bg-sky-950/40 border border-sky-800/40 p-4 rounded-xl space-y-2">
          <span className="text-xs font-bold text-sky-300 uppercase tracking-wider block">Recommended Corrective Actions</span>
          <ul className="space-y-1.5 text-xs text-slate-200">
            {ls.recommendedActions.map((act: string, idx: number) => (
              <li key={idx} className="flex items-start space-x-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{act}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  // 2. Render Autonomous Action Result Card if data contains actionResultDetails
  if (data && data.actionResultDetails && data.actionType) {
    const act = data;
    return (
      <div className="bg-slate-950 text-slate-100 border border-emerald-500/40 rounded-2xl shadow-2xl p-5 mb-6 font-sans space-y-3 animate-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-emerald-500/30 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-500/20 border border-emerald-400/30 rounded-xl flex items-center justify-center text-emerald-400">
              <Zap className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <span className="font-black text-sm uppercase tracking-wider text-emerald-300">{act.actionTitle}</span>
              <p className="text-xs text-slate-400">Document: <code className="text-emerald-200 font-mono">{act.impactedDocumentId}</code></p>
            </div>
          </div>
          <span className="bg-emerald-950 text-emerald-300 text-xs font-mono font-bold px-3 py-1 rounded-lg border border-emerald-800">
            S/4HANA EXECUTED
          </span>
        </div>

        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 text-xs leading-relaxed text-slate-200 font-mono">
          {act.actionResultDetails}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono text-slate-400">
          <div><strong className="text-slate-300">Endpoint:</strong> {act.s4HanaODataEndpoint}</div>
          <div><strong className="text-slate-300">Policy:</strong> {act.policyValidation}</div>
          <div className="sm:col-span-2 text-emerald-400"><strong className="text-slate-300">SHA-256 Hash:</strong> {act.hashSha256}</div>
        </div>
      </div>
    );
  }

  // 3. Render Carrier Selection Card if data contains candidates
  if (data && Array.isArray(data.candidates) && data.candidates.length > 0) {
    const cs = data;
    return (
      <div className="bg-slate-950 text-slate-100 border border-sky-500/40 rounded-2xl shadow-2xl p-5 mb-6 font-sans space-y-4 animate-in zoom-in-95">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-sky-500/30 pb-3 gap-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-sky-500/20 border border-sky-400/30 rounded-xl flex items-center justify-center text-sky-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-sm uppercase tracking-wider text-sky-300">Autonomous Carrier Selection</span>
                <span className="bg-sky-950 text-sky-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-sky-800 uppercase">S/4HANA TM</span>
              </div>
              <p className="text-xs text-slate-400">Load: <code className="text-sky-200 font-mono">{cs.loadQuery}</code> | Lane: <span className="text-slate-300">{cs.lane}</span></p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-400">Equipment:</span>
            <span className="bg-slate-900 text-slate-200 text-xs font-mono font-bold px-2.5 py-1 rounded-lg border border-slate-800">
              {cs.equipmentType}
            </span>
          </div>
        </div>

        {/* Multi-Objective Strategy Banner */}
        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl flex items-start justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="font-bold text-sky-400 flex items-center space-x-1.5 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Multi-Objective Optimization: Service + Cost + Risk</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {cs.narrativeSummary}
            </p>
          </div>
        </div>

        {/* Carrier Evaluation Table (Exact Requested Format) */}
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
          <table className="w-full text-left text-xs text-slate-200 font-sans border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                <th className="py-2.5 px-3">Carrier</th>
                <th className="py-2.5 px-3">Cost</th>
                <th className="py-2.5 px-3 text-center">On-Time %</th>
                <th className="py-2.5 px-3 text-center">Acceptance %</th>
                <th className="py-2.5 px-3">Recommendation</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {cs.candidates.map((c: any, idx: number) => {
                const isBest = c.recommendationBadge === 'Best' || c.recommendationBadge === 'Best for priority shipment';
                return (
                  <tr key={idx} className={`hover:bg-slate-800/40 transition-colors ${isBest ? 'bg-sky-950/20' : ''}`}>
                    <td className="py-3 px-3 font-sans font-bold text-slate-100 flex items-center space-x-2">
                      <span>{c.carrierName}</span>
                      {isBest && <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-100">{c.costFormatted}</td>
                    <td className="py-3 px-3 text-center font-bold text-emerald-400">{c.onTimePercentage}%</td>
                    <td className="py-3 px-3 text-center font-bold text-sky-400">{c.tenderAcceptancePercentage}%</td>
                    <td className="py-3 px-3 font-sans">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                        c.recommendationBadge === 'Best' ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800' :
                        c.recommendationBadge === 'Best for priority shipment' ? 'bg-sky-950/80 text-sky-300 border-sky-800' :
                        'bg-amber-950/80 text-amber-300 border-amber-800'
                      }`}>
                        {c.recommendationTag}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-sans">
                      <button
                        onClick={async () => {
                          setActionRunning(true);
                          try {
                            const res = await tmService.executeAutonomousTmAction('assign_carrier', {
                              freightOrderId: cs.loadQuery,
                              carrierId: c.carrierName
                            });
                            setActionFeedback(`Assigned ${c.carrierName} to ${cs.loadQuery} in S/4HANA (Ref: ${res.impactedDocumentId})`);
                          } catch (err: any) {
                            setActionFeedback(`Error: ${err.message}`);
                          } finally {
                            setActionRunning(false);
                          }
                        }}
                        disabled={actionRunning}
                        className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-[10px] py-1 px-2.5 rounded-lg transition-all shadow border border-sky-400/30 whitespace-nowrap active:scale-95"
                      >
                        Assign Carrier
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Detailed Breakdown for each Carrier */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {cs.candidates.map((c: any, idx: number) => (
            <div key={idx} className="bg-slate-900 border border-slate-800 p-3 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-bold text-slate-100 block">{c.carrierName}</span>
                  <span className="text-[10px] text-slate-400 font-mono">Vendor: {c.s4HanaVendorId}</span>
                </div>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  c.riskLevel === 'Low' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                }`}>
                  {c.riskLevel} Risk
                </span>
              </div>

              <div className="space-y-1 text-[11px] text-slate-300 border-t border-slate-800/80 pt-2">
                <div className="flex justify-between"><span className="text-slate-400">Rate Tariff:</span> <strong className="text-slate-200">{c.rateType} ({c.costFormatted})</strong></div>
                <div className="flex justify-between"><span className="text-slate-400">Claim History:</span> <strong className="text-slate-200">{c.claimHistory}</strong></div>
                <div className="flex justify-between"><span className="text-slate-400">Capacity:</span> <strong className="text-slate-200">{c.capacityStatus}</strong></div>
                <div className="flex justify-between"><span className="text-slate-400">Customer SLA:</span> <strong className="text-slate-200">{c.customerSlaFit}</strong></div>
              </div>

              <p className="text-[10px] text-slate-400 italic bg-slate-950 p-2 rounded border border-slate-800">
                "{c.optimizationReason}"
              </p>
            </div>
          ))}
        </div>

        {actionFeedback && (
          <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs p-3 rounded-xl font-mono">
            {actionFeedback}
          </div>
        )}
      </div>
    );
  }

  // 4. Render Autonomous Load Consolidation Card if data contains consolidatedPlan
  if (data && Array.isArray(data.consolidatedPlan) && data.consolidatedPlan.length > 0) {
    const lc = data;
    return (
      <div className="bg-slate-950 text-slate-100 border border-emerald-500/40 rounded-2xl shadow-2xl p-5 mb-6 font-sans space-y-4 animate-in zoom-in-95">
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-emerald-500/30 pb-3 gap-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-500/20 border border-emerald-400/30 rounded-xl flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-sm uppercase tracking-wider text-emerald-300">Autonomous Load Consolidation Engine</span>
                <span className="bg-emerald-950 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-800 uppercase">S/4HANA TM</span>
              </div>
              <p className="text-xs text-slate-400">Query: <code className="text-emerald-200 font-mono">{lc.query || "Today's Outbound Shipments"}</code></p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-400">Cost Savings:</span>
            <span className="bg-emerald-950 text-emerald-300 text-xs font-mono font-bold px-2.5 py-1 rounded-lg border border-emerald-800 flex items-center space-x-1">
              <span>{lc.estimatedSavingsPercent}% Savings</span>
              <span className="text-slate-400">({lc.estimatedSavingsAmount})</span>
            </span>
          </div>
        </div>

        {/* AI Proposal Summary Box */}
        <div className="bg-emerald-950/40 border border-emerald-500/30 p-3.5 rounded-xl space-y-2">
          <div className="flex items-center space-x-2 text-emerald-300 font-bold text-xs">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>AI Consolidation Proposal</span>
          </div>
          <p className="text-xs text-slate-200 font-sans leading-relaxed">
            {lc.proposalSummary}
          </p>
        </div>

        {/* Key Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Freight Units</span>
            <span className="text-base font-black font-mono text-sky-400">{lc.freightUnitsCount} FUs</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Planned Before</span>
            <span className="text-base font-black font-mono text-rose-400">{lc.initialPlannedTrucks} Trucks (LTL)</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Optimized Plan</span>
            <span className="text-base font-black font-mono text-emerald-400">{lc.optimizedTrucks} FTL Trucks</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Estimated Savings</span>
            <span className="text-base font-black font-mono text-amber-300">{lc.estimatedSavingsPercent}% ({lc.estimatedSavingsAmount})</span>
          </div>
        </div>

        {/* Evaluation Criteria Grid */}
        {lc.evaluationCriteria && (
          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-2 text-xs">
            <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px] block border-b border-slate-800 pb-1">
              Evaluation Factors (Origin, Destination, Route, Dates, Weight, Volume, Capacity, Carrier Limits)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-slate-300">
              <div><span className="text-slate-400 font-sans">Origin:</span> {lc.evaluationCriteria.origin}</div>
              <div><span className="text-slate-400 font-sans">Destination:</span> {lc.evaluationCriteria.destination}</div>
              <div><span className="text-slate-400 font-sans">Route Compatibility:</span> <strong className="text-emerald-400">{lc.evaluationCriteria.routeCompatibility}</strong></div>
              <div><span className="text-slate-400 font-sans">Requested Dates:</span> {lc.evaluationCriteria.requestedDeliveryDates}</div>
              <div><span className="text-slate-400 font-sans">Weight:</span> {lc.evaluationCriteria.totalWeightKg}</div>
              <div><span className="text-slate-400 font-sans">Volume:</span> {lc.evaluationCriteria.totalVolumeM3}</div>
              <div><span className="text-slate-400 font-sans">Equipment Capacity:</span> {lc.evaluationCriteria.equipmentCapacity}</div>
              <div><span className="text-slate-400 font-sans">Carrier Limits:</span> {lc.evaluationCriteria.carrierLimits}</div>
            </div>
          </div>
        )}

        {/* Consolidated Plan Cards */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Consolidated Full Truckload (FTL) Schedule</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {lc.consolidatedPlan.map((c: any, idx: number) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-sky-300 block">{c.consolidatedOrderId}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{c.truckType}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {c.utilizationPercent}% Payload Utilized
                  </span>
                </div>

                <div className="space-y-1 text-[11px] font-mono text-slate-300 border-t border-slate-800 pt-2">
                  <div className="flex justify-between"><span className="text-slate-400 font-sans">Combined Units:</span> <span className="text-slate-100 font-bold">{c.freightUnits.join(', ')}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400 font-sans">Weight & Vol:</span> <span>{c.weightKg.toLocaleString()} KG | {c.volumeM3} M³</span></div>
                  <div className="flex justify-between"><span className="text-slate-400 font-sans">Route:</span> <span>{c.route}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400 font-sans">SLA Commitment:</span> <span className="text-emerald-400">{c.deliveryDateSla}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400 font-sans">Assigned Carrier:</span> <span className="text-sky-300">{c.carrierAssigned}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400 font-sans">Consolidated Rate:</span> <strong className="text-amber-300">{c.estimatedCost}</strong></div>
                </div>

                <button
                  onClick={async () => {
                    setActionRunning(true);
                    try {
                      const res = await tmService.executeAutonomousTmAction('consolidate_freight_units', {
                        freightOrderId: c.consolidatedOrderId,
                        carrierId: c.carrierAssigned
                      });
                      setActionFeedback(`Posted Consolidated Freight Order ${c.consolidatedOrderId} to S/4HANA TM (Ref: ${res.impactedDocumentId})`);
                    } catch (err: any) {
                      setActionFeedback(`Error: ${err.message}`);
                    } finally {
                      setActionRunning(false);
                    }
                  }}
                  disabled={actionRunning}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 px-3 rounded-lg transition-all shadow-lg border border-emerald-400/30 mt-2 flex items-center justify-center space-x-1.5 active:scale-98"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                  <span>Execute Consolidation in S/4HANA TM</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {actionFeedback && (
          <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs p-3 rounded-xl font-mono">
            {actionFeedback}
          </div>
        )}
      </div>
    );
  }

  // 5. Render Autonomous Transportation Cost Intelligence Card if data contains costIncreaseAnalysis or mostExpensiveLanes
  if (data && (data.costIncreaseAnalysis || data.mostExpensiveLanes || data.totalMonthlyFreightSpend)) {
    const ci = data;
    return (
      <div className="bg-slate-950 text-slate-100 border border-amber-500/40 rounded-2xl shadow-2xl p-5 mb-6 font-sans space-y-4 animate-in zoom-in-95">
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-amber-500/30 pb-3 gap-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-amber-500/20 border border-amber-400/30 rounded-xl flex items-center justify-center text-amber-400">
              <TrendingUp className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-sm uppercase tracking-wider text-amber-300">SAP TM Transportation Cost Intelligence</span>
                <span className="bg-amber-950 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-800 uppercase">S/4HANA TM</span>
              </div>
              <p className="text-xs text-slate-400">Analysis Topic: <span className="text-amber-200 font-bold">{ci.queryTopic || 'All Cost Intelligence Drivers'}</span></p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-400">Annual Savings Opportunity:</span>
            <span className="bg-amber-950 text-amber-300 text-xs font-mono font-bold px-2.5 py-1 rounded-lg border border-amber-800 flex items-center space-x-1">
              <DollarSign className="w-3.5 h-3.5 text-amber-300" />
              <span>{ci.totalPotentialSavings || '$342,000 / yr'}</span>
            </span>
          </div>
        </div>

        {/* Executive Summary Box */}
        <div className="bg-amber-950/40 border border-amber-500/30 p-3.5 rounded-xl space-y-1.5">
          <div className="flex items-center space-x-2 text-amber-300 font-bold text-xs">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>AI Executive Cost Intelligence Insight</span>
          </div>
          <p className="text-xs text-slate-200 font-sans leading-relaxed">
            {ci.executiveSummary}
          </p>
        </div>

        {/* Key Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Monthly Freight Spend</span>
            <span className="text-base font-black font-mono text-slate-100">{ci.totalMonthlyFreightSpend}</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">MoM Spend Spike</span>
            <span className="text-base font-black font-mono text-rose-400">{ci.monthOverMonthChange}</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Identified Opportunities</span>
            <span className="text-base font-black font-mono text-emerald-400">{ci.totalPotentialSavings}</span>
          </div>
        </div>

        {/* 1. Why Did Freight Cost Increase? */}
        {ci.costIncreaseAnalysis && (
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Root Causes of Freight Cost Increase (+{ci.costIncreaseAnalysis.monthOverMonthChangePercent}% MoM)
              </h4>
            </div>
            <div className="space-y-2">
              {ci.costIncreaseAnalysis.primaryDrivers.map((driver: any, idx: number) => (
                <div key={idx} className="bg-slate-950 border border-slate-800/80 p-2.5 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-200 block">{driver.factor}</span>
                    <p className="text-[11px] text-slate-400">{driver.description}</p>
                  </div>
                  <div className="flex items-center space-x-3 self-end sm:self-center shrink-0 font-mono">
                    <span className="text-rose-400 font-bold">{driver.impactAmount}</span>
                    <span className="bg-rose-950 text-rose-300 text-[10px] px-2 py-0.5 rounded border border-rose-800 font-bold">{driver.percentageContribution}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. Most Expensive Lanes */}
        {ci.mostExpensiveLanes && ci.mostExpensiveLanes.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Which Lanes are Most Expensive?</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                    <th className="pb-2">Lane</th>
                    <th className="pb-2">Route</th>
                    <th className="pb-2">Total Spend</th>
                    <th className="pb-2">Cost/Mile</th>
                    <th className="pb-2">Volume</th>
                    <th className="pb-2">Primary Carrier</th>
                    <th className="pb-2 text-right">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {ci.mostExpensiveLanes.map((lane: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="py-2.5 font-bold text-sky-400">{lane.laneId}</td>
                      <td className="py-2.5 text-slate-300">{lane.origin} &rarr; {lane.destination}</td>
                      <td className="py-2.5 font-bold text-slate-100">{lane.totalSpend}</td>
                      <td className="py-2.5 text-amber-300">{lane.costPerMile}</td>
                      <td className="py-2.5 text-slate-300">{lane.volumeShipments} loads</td>
                      <td className="py-2.5 text-slate-300">{lane.primaryCarrier}</td>
                      <td className="py-2.5 text-right font-bold text-rose-400">{lane.trend}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. Accessorial Charges by Carrier */}
        {ci.accessorialChargesByCarrier && ci.accessorialChargesByCarrier.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Which Carriers Generate the Most Accessorial Charges?</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ci.accessorialChargesByCarrier.map((c: any, idx: number) => (
                <div key={idx} className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-200">{c.carrierName}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${c.riskRating === 'High' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-slate-800 text-slate-300'}`}>
                      {c.riskRating} Risk
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400 font-mono text-[11px]">
                    <span>Total Accessorials: <strong className="text-rose-400">{c.totalAccessorials}</strong></span>
                    <span>Fuel Surcharge: <strong className="text-amber-300">{c.fuelSurcharge}</strong></span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 pt-1 text-[10px] font-mono text-center border-t border-slate-800">
                    <div className="bg-slate-900 p-1 rounded">Detention: <strong className="text-rose-300">{c.detentionShare}</strong></div>
                    <div className="bg-slate-900 p-1 rounded">Layover: <strong className="text-amber-300">{c.layoverShare}</strong></div>
                    <div className="bg-slate-900 p-1 rounded">Reconsignment: <strong className="text-sky-300">{c.reconsignmentShare}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Detention Fee Shipments */}
        {ci.detentionFeeShipments && ci.detentionFeeShipments.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Which Shipments Caused Detention Fees?</h4>
            <div className="space-y-2">
              {ci.detentionFeeShipments.map((d: any, idx: number) => (
                <div key={idx} className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sky-400 font-mono">{d.freightOrderId}</span>
                      <span className="text-slate-400 font-sans">({d.carrierName})</span>
                    </div>
                    <p className="text-[11px] text-slate-300"><strong className="text-slate-400">Location:</strong> {d.location} | <strong className="text-slate-400">Root Cause:</strong> {d.rootCause}</p>
                  </div>
                  <div className="flex items-center space-x-3 self-end sm:self-center shrink-0 font-mono text-[11px]">
                    <span className="text-amber-300">{d.dwellTimeHours}h Dwell (Free: {d.freeTimeHours}h)</span>
                    <span className="text-rose-400 font-bold bg-rose-950 px-2 py-0.5 rounded border border-rose-800">{d.feeAmount}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Empty Miles & Deadhead Waste */}
        {ci.emptyMilesAnalysis && ci.emptyMilesAnalysis.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Where Are We Paying for Empty Miles?</h4>
            <div className="space-y-2">
              {ci.emptyMilesAnalysis.map((em: any, idx: number) => (
                <div key={idx} className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-200">{em.routeRegion}</span>
                    <span className="text-rose-400 font-mono font-bold">{em.wastedCost} Waste</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Carrier: {em.carrierName} | Deadhead: <strong className="text-rose-300">{em.deadheadMiles} mi ({em.emptyMilesPercent}%)</strong> of {em.totalMiles} total miles
                  </p>
                  <p className="text-[11px] text-emerald-300 bg-emerald-950/60 p-1.5 rounded border border-emerald-900">
                    <strong className="text-emerald-400">Repositioning Opportunity:</strong> {em.repositioningOpportunity}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. Poor Cube Utilization Loads */}
        {ci.poorCubeUtilizationLoads && ci.poorCubeUtilizationLoads.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Which Loads Have Poor Cube Utilization?</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {ci.poorCubeUtilizationLoads.map((pc: any, idx: number) => (
                <div key={idx} className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs space-y-1.5">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-sky-400 font-mono">{pc.freightOrderId}</span>
                    <span className="bg-rose-950 text-rose-300 text-[10px] font-mono px-2 py-0.5 rounded border border-rose-800 font-bold">
                      {pc.cubeUtilPercent}% Cube Fill
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">{pc.originDest}</p>
                  <div className="text-[10px] font-mono text-slate-400 space-y-0.5">
                    <div>Weight: {pc.weightKg.toLocaleString()} KG ({pc.payloadUtilPercent}% Payload)</div>
                    <div>Wasted Capacity Cost: <strong className="text-rose-400">{pc.wastedCapacityCost}</strong></div>
                  </div>
                  <p className="text-[11px] text-amber-200 bg-amber-950/40 p-1.5 rounded border border-amber-900">
                    {pc.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. LTL to FTL Candidates */}
        {ci.ltlToFtlCandidates && ci.ltlToFtlCandidates.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Where Can We Move from LTL to FTL?</h4>
            <div className="space-y-2">
              {ci.ltlToFtlCandidates.map((ltl: any, idx: number) => (
                <div key={idx} className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-200 block">{ltl.lane}</span>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {ltl.weeklyLtlShipments} LTL loads/wk | Current LTL Spend: {ltl.avgLtlSpendPerWeek}/wk | Estimated FTL: {ltl.estimatedFtlCostPerWeek}/wk
                    </p>
                    <p className="text-[11px] text-emerald-300">{ltl.action}</p>
                  </div>
                  <div className="flex items-center space-x-2 self-end sm:self-center shrink-0">
                    <span className="bg-emerald-950 text-emerald-300 font-mono font-bold text-xs px-2.5 py-1 rounded border border-emerald-800">
                      Save {ltl.annualSavingsPotential} / yr
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. Dedicated Transportation Candidates */}
        {ci.dedicatedLaneCandidates && ci.dedicatedLaneCandidates.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Which Lanes are Candidates for Dedicated Transportation?</h4>
            <div className="space-y-2">
              {ci.dedicatedLaneCandidates.map((ded: any, idx: number) => (
                <div key={idx} className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-200">{ded.lane}</span>
                    <span className="bg-amber-950 text-amber-300 text-xs font-mono font-bold px-2 py-0.5 rounded border border-amber-800">
                      Save {ded.monthlySavings}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono text-slate-300">
                    <div>Volume: {ded.monthlyVolumeTrucks} Trucks/mo</div>
                    <div>Spot Spend: {ded.spotRateSpend}</div>
                    <div>Dedicated Contract: {ded.dedicatedContractCost}</div>
                  </div>
                  <p className="text-[11px] text-sky-300"><strong className="text-slate-400">Service Impact:</strong> {ded.serviceLevelImprovement}</p>
                  <p className="text-[11px] text-emerald-300 bg-emerald-950/40 p-1.5 rounded border border-emerald-900"><strong className="text-emerald-400">AI Recommendation:</strong> {ded.recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 9. Automated AI Cost Reduction Opportunities with Live Execution */}
        {ci.automatedOpportunities && ci.automatedOpportunities.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-300" />
              Automated Cost Reduction Opportunities (S/4HANA TM Direct Execution)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ci.automatedOpportunities.map((opp: any, idx: number) => (
                <div key={idx} className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-slate-100 block">{opp.title}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-mono">{opp.category}</span>
                    </div>
                    <span className="bg-emerald-950 text-emerald-300 font-mono font-bold text-[11px] px-2 py-0.5 rounded border border-emerald-800">
                      {opp.potentialAnnualSavings}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {opp.description}
                  </p>

                  <button
                    onClick={async () => {
                      setActionRunning(true);
                      try {
                        const res = await tmService.executeAutonomousTmAction(opp.actionType, {
                          freightOrderId: 'FO-60098120',
                          carrierId: 'DHL Global Forwarding'
                        });
                        setActionFeedback(`Executed ${opp.title} in S/4HANA TM (Doc Ref: ${res.impactedDocumentId}). Savings locked in.`);
                      } catch (err: any) {
                        setActionFeedback(`Execution error: ${err.message}`);
                      } finally {
                        setActionRunning(false);
                      }
                    }}
                    disabled={actionRunning}
                    className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs py-2 px-3 rounded-lg transition-all shadow-lg border border-amber-400/30 mt-2 flex items-center justify-center space-x-1.5 active:scale-98"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                    <span>Execute Opportunity in S/4HANA TM</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {actionFeedback && (
          <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs p-3 rounded-xl font-mono">
            {actionFeedback}
          </div>
        )}
      </div>
    );
  }

  // 6. Render Predictive Transportation AI Card if data contains predictions
  if (data && Array.isArray(data.predictions) && data.predictions.length > 0) {
    const pt = data;
    return (
      <div className="bg-slate-950 text-slate-100 border border-purple-500/40 rounded-2xl shadow-2xl p-5 mb-6 font-sans space-y-4 animate-in zoom-in-95">
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-purple-500/30 pb-3 gap-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-500/20 border border-purple-400/30 rounded-xl flex items-center justify-center text-purple-400">
              <Cpu className="w-5 h-5 text-purple-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-sm uppercase tracking-wider text-purple-300">SAP TM Predictive Transportation AI (11 Vectors)</span>
                <span className="bg-purple-950 text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-800 uppercase">S/4HANA TM</span>
              </div>
              <p className="text-xs text-slate-400">Query Topic: <span className="text-purple-200 font-bold">{pt.queryTopic || '11-Vector Predictive Risk Evaluation'}</span></p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-400">System Risk Score:</span>
            <span className="bg-purple-950 text-purple-300 text-xs font-mono font-bold px-2.5 py-1 rounded-lg border border-purple-800 flex items-center space-x-1">
              <span>{pt.overallSystemRiskScore} / 100</span>
              <span className="text-rose-400 font-bold">({pt.criticalAlertsCount} Critical)</span>
            </span>
          </div>
        </div>

        {/* Executive Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Risk Score</span>
            <span className="text-lg font-black font-mono text-amber-400">{pt.overallSystemRiskScore} / 100</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Risk Vectors</span>
            <span className="text-lg font-black font-mono text-slate-100">{pt.totalPredictedRisksCount || pt.predictions.length}</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Critical Alerts</span>
            <span className="text-lg font-black font-mono text-rose-400">{pt.criticalAlertsCount}</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Est Financial Risk</span>
            <span className="text-lg font-black font-mono text-purple-300">{pt.estimatedTotalFinancialRisk || '$94,350'}</span>
          </div>
        </div>

        {/* 11 Prediction Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {pt.predictions.map((p: any, idx: number) => (
            <div key={idx} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2.5 text-xs">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-purple-300 uppercase tracking-wider">{p.categoryLabel}</span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      p.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                      p.severity === 'HIGH' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                      'bg-sky-950 text-sky-300 border border-sky-800'
                    }`}>
                      {p.severity}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-slate-100 block text-xs mt-0.5">{p.targetObject}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-lg font-black font-mono text-amber-400">{p.probabilityPct}%</span>
                  <span className="text-[10px] text-slate-400 block uppercase font-mono">Risk Probability</span>
                </div>
              </div>

              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className={`h-full ${p.probabilityPct >= 90 ? 'bg-rose-500' : p.probabilityPct >= 80 ? 'bg-amber-500' : 'bg-sky-500'}`} 
                  style={{ width: `${p.probabilityPct}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                {p.details}
              </p>

              <div className="space-y-1 text-[11px] pt-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Financial Impact:</span>
                  <span className="text-rose-400 font-mono font-bold">{p.impactCostEstimated}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cross-Module Flow:</span>
                  <span className="text-sky-300 font-mono text-[10px]">{p.crossModuleCorrelation}</span>
                </div>
              </div>

              <div className="bg-purple-950/40 border border-purple-900/60 p-2.5 rounded-lg space-y-1">
                <span className="text-[10px] uppercase font-bold text-purple-300 block">AI Recommended Action:</span>
                <p className="text-[11px] text-slate-200">{p.recommendedAction}</p>
              </div>

              <button
                onClick={async () => {
                  setActionRunning(true);
                  try {
                    const res = await tmService.executeAutonomousTmAction(p.actionType, p.actionPayload);
                    setActionFeedback(`[AUTO-RESOLVED] ${p.categoryLabel}: ${res.actionResultDetails} (Ref: ${res.impactedDocumentId})`);
                  } catch (err: any) {
                    setActionFeedback(`Mitigation error: ${err.message}`);
                  } finally {
                    setActionRunning(false);
                  }
                }}
                disabled={actionRunning}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs py-2 px-3 rounded-lg transition-all shadow border border-purple-400/30 flex items-center justify-center space-x-1.5 active:scale-98"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                <span>Execute Risk Mitigation in S/4HANA TM</span>
              </button>
            </div>
          ))}
        </div>

        {actionFeedback && (
          <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs p-3 rounded-xl font-mono">
            {actionFeedback}
          </div>
        )}
      </div>
    );
  }

  // 7. Render Standalone Autonomous Tendering Card if data contains tenderingCascades
  if (data && Array.isArray(data.tenderingCascades) && data.tenderingCascades.length > 0) {
    const td = data;
    return (
      <div className="bg-slate-950 text-slate-100 border border-sky-500/40 rounded-2xl shadow-2xl p-5 mb-6 font-sans space-y-4 animate-in zoom-in-95">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-sky-500/30 pb-3 gap-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-sky-500/20 border border-sky-400/30 rounded-xl flex items-center justify-center text-sky-400">
              <Share2 className="w-5 h-5 text-sky-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-sm uppercase tracking-wider text-sky-300">SAP TM Autonomous Tendering Cascade</span>
                <span className="bg-sky-950 text-sky-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-sky-800 uppercase">S/4HANA TM</span>
              </div>
              <p className="text-xs text-slate-400">Target Order: <span className="text-sky-200 font-bold">{td.targetFreightOrder}</span> • Max Cost Threshold: <span className="text-emerald-400 font-bold">+{td.costThresholdCapPct}% Cap</span></p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-400">Active Cascades:</span>
            <span className="bg-sky-950 text-sky-300 text-xs font-mono font-bold px-2.5 py-1 rounded-lg border border-sky-800">
              {td.totalCascadesActive} Orders ({td.autoReTenderedCount} Auto-Re-tendered)
            </span>
          </div>
        </div>

        {/* Workflow Diagram Banner */}
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-2">
          <span className="text-xs font-bold text-sky-300 uppercase tracking-wider block">
            Freight Order Tendering Sequence: Freight Order → Preferred Carrier → Tender → Carrier Response → Alternate Carrier → Re-tender → Confirm Capacity
          </span>
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
            {td.workflowFlowchart?.map((s: any) => (
              <div key={s.stepNumber} className="flex items-center space-x-1">
                <span className={`px-2 py-1 rounded border font-bold ${
                  s.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                  s.status === 'IN_PROGRESS' ? 'bg-sky-950 text-sky-300 border-sky-800 animate-pulse' :
                  'bg-slate-950 text-slate-500 border-slate-800'
                }`}>
                  {s.stepNumber}. {s.stepName}
                </span>
                {s.stepNumber < 7 && <span className="text-slate-600">→</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Tendering Cascades Cards */}
        <div className="space-y-3">
          {td.tenderingCascades.map((c: any, idx: number) => (
            <div key={idx} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-sky-300 text-sm">{c.foId}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      c.currentStatus === 'CAPACITY_CONFIRMED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                      c.currentStatus === 'RE_TENDERED_ALTERNATE' ? 'bg-sky-950 text-sky-300 border border-sky-800' :
                      c.currentStatus === 'REJECTED_AUTO_CASCADE' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                      'bg-slate-950 text-slate-300 border border-slate-800'
                    }`}>
                      {c.currentStatusLabel}
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs font-semibold mt-0.5">{c.originDestination}</p>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[10px] uppercase block">Baseline Contract Rate</span>
                  <span className="font-mono font-black text-slate-100 text-sm">{c.baselineContractRate}</span>
                </div>
              </div>

              {/* Preferred Carrier vs Alternate Carriers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                {/* Preferred Carrier */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-amber-300">Rank 1 Preferred Carrier</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                      c.preferredCarrier.status === 'ACCEPTED' ? 'bg-emerald-950 text-emerald-300' :
                      c.preferredCarrier.status === 'REJECTED' ? 'bg-rose-950 text-rose-300' : 'bg-slate-900 text-slate-400'
                    }`}>
                      {c.preferredCarrier.status}
                    </span>
                  </div>
                  <p className="font-semibold text-slate-200">{c.preferredCarrier.name} ({c.preferredCarrier.carrierId})</p>
                  <p className="text-slate-400">Rate: <span className="font-mono font-bold text-slate-200">{c.preferredCarrier.rate}</span> • SLA: {c.preferredCarrier.responseSlaHours}h</p>
                  {c.preferredCarrier.rejectionReason && (
                    <p className="text-rose-400 text-[10px] italic">Rejection Reason: {c.preferredCarrier.rejectionReason}</p>
                  )}
                </div>

                {/* Alternate Carriers */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5">
                  <span className="font-bold text-sky-300 block">Alternate Carriers (Cascade Matrix)</span>
                  {c.alternateCarriers.map((alt: any, aIdx: number) => (
                    <div key={aIdx} className="flex justify-between items-center border-t border-slate-900 pt-1 text-[10px]">
                      <div>
                        <span className="font-bold text-slate-200">Rank {alt.rank}: {alt.name}</span>
                        <span className="text-slate-400 block">{alt.rate} (+{alt.variancePct}% vs baseline)</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded font-mono font-bold ${
                        alt.status === 'CONFIRMED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                        alt.status === 'RE_TENDERED' ? 'bg-sky-950 text-sky-300 border border-sky-800 animate-pulse' :
                        alt.status === 'EXCEEDS_THRESHOLD' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                        'bg-slate-900 text-slate-400'
                      }`}>
                        {alt.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-sky-950/40 border border-sky-900/60 p-2.5 rounded-lg text-[11px] space-y-1">
                <span className="text-[10px] uppercase font-bold text-sky-300 block">S/4HANA TM Action Log</span>
                <p className="text-slate-200 font-mono">{c.lastActionLog}</p>
              </div>

              <button
                onClick={async () => {
                  setActionRunning(true);
                  try {
                    const res = await tmService.executeAutonomousTmAction('change_carrier', { freightOrderId: c.foId, carrierId: c.alternateCarriers[0]?.name || 'Kuehne+Nagel Logistics' });
                    setActionFeedback(`[AUTO-RETENDERED] Executed Autonomous Re-tender for ${c.foId} to ${c.alternateCarriers[0]?.name || 'Alternate Carrier'}. Status updated in S/4HANA TM.`);
                  } catch (err: any) {
                    setActionFeedback(`Re-tender error: ${err.message}`);
                  } finally {
                    setActionRunning(false);
                  }
                }}
                disabled={actionRunning}
                className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs py-2 px-3 rounded-lg transition-all shadow border border-sky-400/30 flex items-center justify-center space-x-1.5 active:scale-98"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                <span>Trigger Autonomous Re-Tendering Cascade for {c.foId}</span>
              </button>
            </div>
          ))}
        </div>

        {actionFeedback && (
          <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs p-3 rounded-xl font-mono">
            {actionFeedback}
          </div>
        )}
      </div>
    );
  }

  // Standalone Return for Freight Settlement Intelligence
  if (data && (data.blockedInvoices || data.settlementCorrelations) && !data.shipmentsAtRisk) {
    const sData = data;
    return (
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 text-slate-100 space-y-6 shadow-2xl animate-in fade-in duration-300 w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center border border-amber-500/40 shrink-0">
              <FileText className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black uppercase tracking-widest text-amber-400">S/4HANA TM</span>
                <span className="bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                  Freight Settlement Intelligence
                </span>
              </div>
              <h2 className="text-base font-extrabold text-white tracking-tight">
                Invoice Verification &amp; Rate Variance Correlation Engine
              </h2>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono px-2.5 py-1 rounded font-bold">
              Correlated: FO → CC → FSD → LIV → FI
            </span>
          </div>
        </div>

        {/* Query Input & Sample Prompts */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={settlementQuery}
              onChange={(e) => setSettlementQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyzeSettlementInTab()}
              placeholder="Ask: Which invoices are blocked? Compare contracted rate with invoiced rate..."
              className="flex-1 bg-slate-950 border border-slate-800 text-xs font-mono text-slate-100 rounded-lg px-3 py-2 outline-none focus:border-amber-500"
            />
            <button
              onClick={() => handleAnalyzeSettlementInTab()}
              disabled={settlementLoading}
              className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-3 py-2 rounded-lg transition-all flex items-center space-x-1"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Query</span>
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              "Which freight invoices are blocked?",
              "Why is this carrier invoice higher than expected?",
              "Show freight settlement differences.",
              "Which carriers have recurring invoice discrepancies?",
              "Compare contracted rate with invoiced rate.",
              "Show accessorial charges by carrier.",
              "Which freight charges should be disputed?"
            ].map((qText, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSettlementQuery(qText);
                  handleAnalyzeSettlementInTab(qText);
                }}
                className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-amber-300 text-[10px] font-medium px-2 py-1 rounded transition-colors"
              >
                {qText}
              </button>
            ))}
          </div>
        </div>

        {/* KPIs */}
        {sData.summaryKPIs && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Evaluated Invoices</span>
              <div className="text-lg font-bold text-slate-100">{sData.summaryKPIs.totalInvoicesEvaluated}</div>
            </div>
            <div className="bg-rose-950/40 border border-rose-800/60 p-3 rounded-xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-rose-300 block">Blocked Invoices</span>
              <div className="text-lg font-bold text-rose-400">{sData.summaryKPIs.totalBlockedInvoices}</div>
            </div>
            <div className="bg-amber-950/40 border border-amber-800/60 p-3 rounded-xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-amber-300 block">Disputed Amount</span>
              <div className="text-lg font-bold text-amber-400">€{sData.summaryKPIs.totalDisputedAmountEur.toLocaleString()}</div>
            </div>
            <div className="bg-purple-950/40 border border-purple-800/60 p-3 rounded-xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-purple-300 block">Avg Variance</span>
              <div className="text-lg font-bold text-purple-400">+{sData.summaryKPIs.avgVariancePct}%</div>
            </div>
            <div className="bg-sky-950/40 border border-sky-800/60 p-3 rounded-xl space-y-1 col-span-2 md:col-span-1">
              <span className="text-[10px] uppercase font-bold text-sky-300 block">Accessorial Spend</span>
              <div className="text-lg font-bold text-sky-400">€{sData.summaryKPIs.accessorialsTotalEur.toLocaleString()}</div>
            </div>
          </div>
        )}

        {/* End to End Correlation Diagram */}
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-2">
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block">S/4HANA Document Lineage Correlation</span>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-center text-xs font-mono">
            <div className="bg-slate-950 p-2 rounded border border-sky-800 text-sky-300">FO-800102</div>
            <div className="bg-slate-950 p-2 rounded border border-purple-800 text-purple-300">CC-400192 (€2,040)</div>
            <div className="bg-slate-950 p-2 rounded border border-blue-800 text-blue-300">FSD-700912</div>
            <div className="bg-slate-950 p-2 rounded border border-amber-800 text-amber-300">INV-2026-9041 (€2,480)</div>
            <div className="bg-slate-950 p-2 rounded border border-rose-800 text-rose-300">FI-AP 1900004521</div>
          </div>
        </div>

        {/* Blocked Invoices Table */}
        {sData.blockedInvoices && sData.blockedInvoices.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider">Blocked Freight Invoices (Payment Block R)</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                    <th className="pb-2">Invoice #</th>
                    <th className="pb-2">FO ID</th>
                    <th className="pb-2">FSD #</th>
                    <th className="pb-2">Carrier</th>
                    <th className="pb-2">Invoiced / Expected</th>
                    <th className="pb-2">Variance</th>
                    <th className="pb-2">Block Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {sData.blockedInvoices.map((inv: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-850/50">
                      <td className="py-2 font-bold text-amber-300">{inv.invoiceNo}</td>
                      <td className="py-2 font-bold text-sky-300">{inv.freightOrderId}</td>
                      <td className="py-2 text-slate-300">{inv.settlementDocumentNo}</td>
                      <td className="py-2 text-slate-200">{inv.carrierName}</td>
                      <td className="py-2 text-slate-200">{inv.invoicedAmount} / {inv.expectedAmount}</td>
                      <td className="py-2"><span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">{inv.varianceAmount}</span></td>
                      <td className="py-2 text-[11px] text-slate-300">{inv.blockReason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Contracted vs Invoiced Rate Breakdown */}
        {sData.settlementCorrelations && sData.settlementCorrelations.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Contracted vs Invoiced Rate Comparison</h4>
            <div className="space-y-3">
              {sData.settlementCorrelations.map((corr: any, idx: number) => (
                <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2 text-xs font-mono">
                  <div className="flex justify-between items-center border-b border-slate-850 pb-1.5">
                    <span className="font-bold text-amber-300">{corr.carrierInvoiceNo} ({corr.carrierName})</span>
                    <span className="text-rose-300 font-bold">Variance: {corr.variance} ({corr.variancePct}%)</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {corr.chargeBreakdown?.map((item: any, iIdx: number) => (
                      <div key={iIdx} className={`p-2 rounded border text-[11px] ${item.isDisputed ? 'bg-rose-950/40 border-rose-800 text-rose-200' : 'bg-slate-900 border-slate-800'}`}>
                        <div className="font-bold">{item.chargeType}</div>
                        <div>Contract: {item.contracted}</div>
                        <div className="font-bold">Billed: {item.invoiced}</div>
                      </div>
                    ))}
                  </div>
                  <div className="text-[11px] text-slate-300 pt-1">
                    <strong className="text-amber-400">Action:</strong> {corr.recommendedAction}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recurring Discrepancy Carriers */}
        {sData.recurringDiscrepancyCarriers && sData.recurringDiscrepancyCarriers.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider">Carriers with Recurring Invoice Discrepancies</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
              {sData.recurringDiscrepancyCarriers.map((car: any, idx: number) => (
                <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5">
                  <div className="font-bold text-amber-300">{car.carrierName} ({car.scacCode})</div>
                  <div className="text-slate-300 text-[11px]">90-Day Discrepancies: <strong className="text-rose-400">{car.discrepancyCountLast90Days}</strong></div>
                  <div className="text-slate-300 text-[11px]">Disputed Spend: <strong className="text-rose-300">{car.totalDisputedAmountEur}</strong></div>
                  <div className="text-slate-400 text-[10px] bg-slate-900 p-1.5 rounded">{car.primaryDiscrepancyReason}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {actionFeedback && (
          <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs p-3 rounded-xl font-mono">
            {actionFeedback}
          </div>
        )}
      </div>
    );
  }

  // Render Standalone Multi-Agent Architecture Card if data contains multiAgentArchitecture
  if (data && (data.multiAgentArchitecture || (data.agents && data.agents.length > 0 && data.agents[0].agentId))) {
    const ma = data.multiAgentArchitecture || data;
    const agents = ma.agents || [];
    const kpis = ma.summaryKPIs || { totalAgents: 10, activeAgents: 10, multiAgentCoordinationIndex: '99.8%' };
    return (
      <div className="bg-slate-950 text-slate-100 border border-indigo-500/40 rounded-2xl shadow-2xl p-5 mb-6 font-sans space-y-4 animate-in zoom-in-95">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-indigo-500/30 pb-3 gap-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-500/20 border border-indigo-400/30 rounded-xl flex items-center justify-center text-indigo-400">
              <Users className="w-5 h-5 text-indigo-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-sm uppercase tracking-wider text-indigo-300">SAP TM Multi-Agent Architecture</span>
                <span className="bg-indigo-950 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-800 uppercase">10 SPECIALIZED AGENTS</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Autonomous Interlocked Network across Freight Unit Planning, Tendering, Execution, Rates & Exception Management
              </p>
            </div>
          </div>
          <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono px-2.5 py-1 rounded font-bold self-start sm:self-center">
            Coordination Index: {kpis.multiAgentCoordinationIndex || '99.8%'}
          </span>
        </div>

        {/* KPI Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-900 border border-indigo-800/60 p-3 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-indigo-300 block">Total Agents</span>
            <span className="text-xl font-black font-mono text-indigo-400">{kpis.totalAgents || 10} / 10 <span className="text-xs text-emerald-400 font-bold">Active</span></span>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">S/4HANA OData Sync</span>
            <span className="text-xl font-black font-mono text-sky-400">100% Real-time</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Cross-Module Pipeline</span>
            <span className="text-xl font-black font-mono text-emerald-400">SD+EWM+MM+TM+FI</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Ledger Verification</span>
            <span className="text-xl font-black font-mono text-amber-300">SHA-256 Verified</span>
          </div>
        </div>

        {/* 10 Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agents.map((ag: any, idx: number) => (
            <div key={idx} className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all rounded-xl p-4 space-y-3">
              <div className="flex items-start justify-between border-b border-slate-800 pb-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                      {ag.agentId}
                    </span>
                    <h4 className="font-bold text-slate-100 text-sm">{ag.agentName}</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{ag.role}</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {ag.status || 'ACTIVE'}
                </span>
              </div>

              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80 text-xs space-y-1">
                <div className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">S/4HANA CDS & OData Source</div>
                <div className="font-mono text-sky-300 text-[11px]">{ag.s4HanaSource}</div>
                <p className="text-slate-300 text-[11px] leading-relaxed mt-1">{ag.activeScope}</p>
              </div>

              {ag.keyKPIs && (
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 grid grid-cols-2 gap-2 text-xs font-mono">
                  {Object.entries(ag.keyKPIs).map(([k, v]: [string, any], kIdx: number) => (
                    <div key={kIdx}>
                      <span className="text-[9px] text-slate-500 uppercase block">{k.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="text-slate-200 font-bold">{String(v)}</span>
                    </div>
                  ))}
                </div>
              )}

              {ag.actions && ag.actions.length > 0 && (
                <div className="pt-1 flex flex-wrap gap-2">
                  {ag.actions.map((act: any, aIdx: number) => (
                    <button
                      key={aIdx}
                      onClick={() => handleExecuteMultiAgentActionInTab(ag.agentId, act.key)}
                      disabled={actionRunning}
                      className="bg-indigo-900/80 hover:bg-indigo-800 active:scale-95 text-indigo-200 text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-indigo-700/60 flex items-center space-x-1 transition-all disabled:opacity-50"
                    >
                      <Zap className="w-3 h-3 text-amber-300" />
                      <span>{act.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {ag.recentLog && (
                <div className="text-[10px] font-mono text-slate-400 bg-slate-950/50 p-2 rounded border border-slate-800/50 flex items-center justify-between">
                  <span className="text-slate-300 truncate mr-2">Log: {ag.recentLog}</span>
                  <span className="text-emerald-400 font-bold shrink-0">{ag.auditHash?.slice(0, 10)}...</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {actionFeedback && (
          <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs p-3 rounded-xl font-mono">
            {actionFeedback}
          </div>
        )}
      </div>
    );
  }

  // Render Standalone Autonomous Exception Management Card if data contains workflowDefinition
  if (data && (data.workflowDefinition || (data.exceptions && data.summaryKPIs && data.summaryKPIs.totalDetectedExceptions !== undefined))) {
    const em = data;
    const kpis = em.summaryKPIs || {};
    return (
      <div className="bg-slate-950 text-slate-100 border border-amber-500/40 rounded-2xl shadow-2xl p-5 mb-6 font-sans space-y-4 animate-in zoom-in-95">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-amber-500/30 pb-3 gap-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-amber-500/20 border border-amber-400/30 rounded-xl flex items-center justify-center text-amber-400">
              <Zap className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-sm uppercase tracking-wider text-amber-300">SAP TM Autonomous Exception Management Engine</span>
                <span className="bg-amber-950 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-800 uppercase">S/4HANA AGENTIC WORKFLOW</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                7-Stage Agentic Workflow: <code className="text-amber-300 font-mono">Detect → Diagnose → Recommend → Approve → Execute → Verify → Audit</code>
              </p>
            </div>
          </div>
          <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono px-2.5 py-1 rounded font-bold self-start sm:self-center">
            Live 10-Exception Monitor
          </span>
        </div>

        {/* 7-Step Workflow Diagram Header */}
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-2">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
            7-Stage Autonomous Lifecycle Standard:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-[10px] font-mono">
            {em.workflowDefinition?.map((w: any, idx: number) => (
              <div key={idx} className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-center space-y-0.5">
                <span className="text-amber-400 font-bold block">{w.stage}. {w.name}</span>
                <span className="text-[8px] text-slate-400 block leading-tight">{w.description}</span>
              </div>
            ))}
          </div>
        </div>

        {/* KPI Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-slate-900 border border-amber-800/60 p-3 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-amber-300 block">Total Detected</span>
            <span className="text-xl font-black font-mono text-amber-400">{kpis.totalDetectedExceptions || 10} <span className="text-xs text-slate-400 font-normal">Active</span></span>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Auto-Approved</span>
            <span className="text-xl font-black font-mono text-sky-400">{kpis.autoApprovedCount || 8} / 10</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Executed Success</span>
            <span className="text-xl font-black font-mono text-emerald-400">{kpis.executedSuccessCount || 8} / 10</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Verification Rate</span>
            <span className="text-xl font-black font-mono text-emerald-300">{kpis.verificationRatePct || 100}%</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Protected Value</span>
            <span className="text-xl font-black font-mono text-amber-300">€{(kpis.totalFinancialValueProtectedEur || 1030095).toLocaleString()}</span>
          </div>
        </div>

        {/* 10 Exception Lifecycle Cards */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center justify-between">
            <span>Detected Exceptions across 10 Operational Vectors</span>
            <span className="text-[10px] text-slate-400 font-mono">Real-time S/4HANA OData & Telematics</span>
          </h4>

          <div className="grid grid-cols-1 gap-4">
            {em.exceptions?.map((ex: any, idx: number) => {
              const wf = ex.workflow || {};
              return (
                <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3.5">
                  {/* Title Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                    <div className="flex items-center space-x-3">
                      <span className="w-7 h-7 rounded-lg bg-amber-950 text-amber-400 font-mono text-xs font-bold flex items-center justify-center border border-amber-800 shrink-0">
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-100 text-sm">{ex.category}: {ex.title}</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                            ex.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border-rose-800' : 'bg-amber-950 text-amber-300 border-amber-800'
                          }`}>
                            {ex.severity}
                          </span>
                        </div>
                        <span className="text-xs font-mono text-slate-400">Document: <code className="text-sky-300">{ex.impactedDocument}</code> | Carrier: {ex.carrierName} | Value: €{(ex.financialValueEur || 0).toLocaleString()}</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 self-start sm:self-center">
                      Stage: {ex.currentStage}
                    </span>
                  </div>

                  {/* 7 Lifecycle Stage Accordion / Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-2 text-[11px]">
                    {/* 1. Detect */}
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold text-sky-400 uppercase block">1. Detect</span>
                      <p className="text-slate-200 font-mono text-[10px] leading-tight">{wf.detect?.signal}</p>
                      <span className="text-[8px] text-slate-400 font-mono block">{wf.detect?.timestamp}</span>
                    </div>

                    {/* 2. Diagnose */}
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold text-amber-400 uppercase block">2. Diagnose</span>
                      <p className="text-slate-200 font-mono text-[10px] leading-tight">{wf.diagnose?.rootCause}</p>
                      <span className="text-[8px] text-slate-400 font-mono block">{wf.diagnose?.s4HanaCorrelation}</span>
                    </div>

                    {/* 3. Recommend */}
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold text-purple-400 uppercase block">3. Recommend</span>
                      <p className="text-slate-200 font-mono text-[10px] leading-tight">{wf.recommend?.action}</p>
                      <span className="text-[8px] text-emerald-300 block">{wf.recommend?.expectedImpact}</span>
                    </div>

                    {/* 4. Approve */}
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase block">4. Approve</span>
                      <span className="text-[10px] font-bold text-emerald-300 block">{wf.approve?.status}</span>
                      <p className="text-[8px] text-slate-400 font-mono leading-tight">{wf.approve?.policyRule}</p>
                      <button
                        onClick={() => handleExecuteExceptionStage(ex.exceptionId, 'APPROVE')}
                        disabled={actionRunning || wf.approve?.status === 'APPROVED'}
                        className="w-full mt-1 bg-indigo-700 hover:bg-indigo-600 disabled:opacity-50 text-white font-bold text-[9px] py-1 rounded transition-all"
                      >
                        {wf.approve?.status === 'APPROVED' ? 'Approved' : 'Approve Policy'}
                      </button>
                    </div>

                    {/* 5. Execute */}
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase block">5. Execute</span>
                      <span className="text-[9px] font-mono text-emerald-300 block">{wf.execute?.status}</span>
                      <p className="text-[8px] text-slate-400 font-mono leading-tight">{wf.execute?.odataEndpoint}</p>
                      <button
                        onClick={() => handleExecuteExceptionStage(ex.exceptionId, 'EXECUTE')}
                        disabled={actionRunning}
                        className="w-full mt-1 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-[9px] py-1 rounded transition-all"
                      >
                        Execute OData
                      </button>
                    </div>

                    {/* 6. Verify */}
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold text-sky-400 uppercase block">6. Verify</span>
                      <span className="text-[9px] font-mono text-sky-300 block">{wf.verify?.backendStatus}</span>
                      <p className="text-[8px] text-slate-400 font-mono leading-tight">{wf.verify?.s4HanaDocumentStatus}</p>
                      <button
                        onClick={() => handleExecuteExceptionStage(ex.exceptionId, 'VERIFY')}
                        disabled={actionRunning}
                        className="w-full mt-1 bg-sky-700 hover:bg-sky-600 text-white font-bold text-[9px] py-1 rounded transition-all"
                      >
                        Verify 200 OK
                      </button>
                    </div>

                    {/* 7. Audit */}
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold text-rose-400 uppercase block">7. Audit</span>
                      <span className="text-[8px] font-mono text-slate-300 block">{wf.audit?.auditLogId}</span>
                      <p className="text-[8px] text-emerald-400 font-mono truncate">{wf.audit?.hashSha256}</p>
                      <button
                        onClick={() => handleExecuteExceptionStage(ex.exceptionId, 'AUDIT')}
                        disabled={actionRunning}
                        className="w-full mt-1 bg-rose-800 hover:bg-rose-700 text-white font-bold text-[9px] py-1 rounded transition-all"
                      >
                        Ledger Audit
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {actionFeedback && (
          <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs p-3 rounded-xl font-mono">
            {actionFeedback}
          </div>
        )}
      </div>
    );
  }

  // Render Standalone Transportation Control Tower Card if data contains Control Tower data
  if (data && (data.customerImpactingShipments || (data.summaryKPIs && data.summaryKPIs.totalShipmentsInTransit !== undefined))) {
    const ct = data;
    const kpis = ct.summaryKPIs || {};
    return (
      <div className="bg-slate-950 text-slate-100 border border-sky-500/40 rounded-2xl shadow-2xl p-5 mb-6 font-sans space-y-4 animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-sky-500/30 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-sky-500/20 border border-sky-400/30 rounded-xl flex items-center justify-center text-sky-400">
              <Truck className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-sm uppercase tracking-wider text-sky-300">Transportation Control Tower</span>
                <span className="bg-sky-500/20 border border-sky-400/30 text-sky-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">S/4HANA REAL-TIME</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Logistics Network Overview • OData: <code className="text-sky-300 font-mono">API_FREIGHTORDER_SRV</code>, <code className="text-sky-300 font-mono">API_TRANSPORTATIONORDER_SRV</code>
              </p>
            </div>
          </div>
          <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono px-2.5 py-1 rounded font-bold">
            Live Network Status
          </span>
        </div>

        {/* Conversational Overview / Question Answer Box */}
        {ct.executiveNarrative && (
          <div className="bg-slate-900 border border-sky-800/60 p-4 rounded-xl space-y-2">
            <div className="flex items-center space-x-2 text-sky-300 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Network Executive Answer: "What is happening across my transportation network right now?"</span>
            </div>
            <div className="text-xs text-slate-200 font-mono leading-relaxed whitespace-pre-line bg-slate-950 p-3 rounded-lg border border-slate-800">
              {ct.executiveNarrative}
            </div>
          </div>
        )}

        {/* 9 Requested KPI Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="bg-slate-900 border border-sky-800/60 p-3 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-bold text-sky-300 block">1. Shipments in Transit</span>
            <div className="text-xl font-black text-sky-400">{kpis.totalShipmentsInTransit || 28} <span className="text-xs font-normal text-slate-400">Orders</span></div>
          </div>

          <div className="bg-amber-950/40 border border-amber-800/60 p-3 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-bold text-amber-300 block">2. Late Pickups</span>
            <div className="text-xl font-black text-amber-400">{kpis.latePickupsCount || 4} <span className="text-xs font-normal text-slate-400">Gate Delays</span></div>
          </div>

          <div className="bg-rose-950/40 border border-rose-800/60 p-3 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-bold text-rose-300 block">3. Late Deliveries</span>
            <div className="text-xl font-black text-rose-400">{kpis.lateDeliveriesCount || 5} <span className="text-xs font-normal text-slate-400">SLA Risks</span></div>
          </div>

          <div className="bg-purple-950/40 border border-purple-800/60 p-3 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-bold text-purple-300 block">4. Carrier Rejections</span>
            <div className="text-xl font-black text-purple-400">{kpis.carrierRejectionsCount || 6} <span className="text-xs font-normal text-slate-400">Tenders</span></div>
          </div>

          <div className="bg-blue-950/40 border border-blue-800/60 p-3 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-bold text-blue-300 block">5. Unplanned FUs</span>
            <div className="text-xl font-black text-blue-400">{kpis.unplannedFreightUnitsCount || 8} <span className="text-xs font-normal text-slate-400">Open Orders</span></div>
          </div>

          <div className="bg-orange-950/40 border border-orange-800/60 p-3 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-bold text-orange-300 block">6. Warehouse Delays</span>
            <div className="text-xl font-black text-orange-400">{kpis.warehouseDelaysCount || 3} <span className="text-xs font-normal text-slate-400">EWM Tasks</span></div>
          </div>

          <div className="bg-red-950/40 border border-red-800/60 p-3 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-bold text-red-300 block">7. Capacity Risks</span>
            <div className="text-xl font-black text-red-400">{kpis.transportationCapacityRisksCount || 4} <span className="text-xs font-normal text-slate-400">Deficit Lanes</span></div>
          </div>

          <div className="bg-emerald-950/40 border border-emerald-800/60 p-3 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-bold text-emerald-300 block">8. High-Cost Exceptions</span>
            <div className="text-xl font-black text-emerald-400">{kpis.highCostExceptionsCount || 5} <span className="text-xs font-normal text-slate-400">Overruns</span></div>
          </div>

          <div className="bg-indigo-950/40 border border-indigo-800/60 p-3 rounded-xl space-y-1 col-span-2 md:col-span-2 lg:col-span-2">
            <span className="text-[10px] uppercase font-bold text-indigo-300 block">9. Customer-Impacting Shipments</span>
            <div className="text-xl font-black text-indigo-300">{kpis.customerImpactingShipmentsCount || 7} <span className="text-xs font-normal text-slate-400">Key Orders At Risk (€2.69M Total Value)</span></div>
          </div>
        </div>

        {/* 1. Customer-Impacting Shipments Table */}
        {ct.customerImpactingShipments && ct.customerImpactingShipments.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center justify-between">
              <span>Customer-Impacting Shipments (Critical SLAs)</span>
              <span className="text-[10px] font-mono text-slate-400">Key Accounts: BMW, Siemens, BASF, ASML, Bosch</span>
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                    <th className="pb-2">FO ID</th>
                    <th className="pb-2">Customer Name</th>
                    <th className="pb-2">Sales Order</th>
                    <th className="pb-2">Cargo Value</th>
                    <th className="pb-2">Threat / Impact</th>
                    <th className="pb-2">Autonomous Mitigation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {ct.customerImpactingShipments.map((cis: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-850/50">
                      <td className="py-2 font-bold text-sky-300">{cis.freightOrderId}</td>
                      <td className="py-2 font-bold text-slate-100">{cis.customerName}</td>
                      <td className="py-2 text-slate-300">{cis.salesOrderNo}</td>
                      <td className="py-2 text-emerald-400 font-bold">€{cis.cargoValueEur.toLocaleString()}</td>
                      <td className="py-2"><span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">{cis.impactType}</span></td>
                      <td className="py-2 text-[11px] text-slate-300">{cis.mitigationStrategy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. Shipments in Transit Table */}
        {ct.shipmentsInTransit && ct.shipmentsInTransit.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider">Shipments in Transit & GPS Telematics</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                    <th className="pb-2">FO ID</th>
                    <th className="pb-2">Origin → Destination</th>
                    <th className="pb-2">Carrier & Mode</th>
                    <th className="pb-2">Estimated Arrival</th>
                    <th className="pb-2">GPS Location Telematics</th>
                    <th className="pb-2">Driver Contact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {ct.shipmentsInTransit.map((sit: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-850/50">
                      <td className="py-2 font-bold text-sky-300">{sit.freightOrderId}</td>
                      <td className="py-2 text-slate-200">{sit.origin} → {sit.destination}</td>
                      <td className="py-2 text-slate-300">{sit.carrierName} ({sit.transportMode})</td>
                      <td className="py-2 text-amber-300 font-bold">{sit.estimatedArrival}</td>
                      <td className="py-2 text-[11px] text-sky-200">{sit.locationTelematics}</td>
                      <td className="py-2 text-[10px] text-slate-400">{sit.carrierDriverContact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. Late Pickups & 4. Late Deliveries Split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {ct.latePickups && ct.latePickups.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">Late Pickups ({ct.latePickups.length})</h4>
              <div className="space-y-2 font-mono text-xs">
                {ct.latePickups.map((lp: any, idx: number) => (
                  <div key={idx} className="bg-slate-950 p-2.5 rounded border border-slate-800 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sky-300">{lp.freightOrderId} ({lp.shippingPoint})</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">+{lp.delayMinutes} min delay</span>
                    </div>
                    <div className="text-[11px] text-slate-300">Carrier: {lp.carrierName}</div>
                    <div className="text-[10px] text-slate-400">Root Cause: {lp.rootCause}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {ct.lateDeliveries && ct.lateDeliveries.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider">Late Deliveries ({ct.lateDeliveries.length})</h4>
              <div className="space-y-2 font-mono text-xs">
                {ct.lateDeliveries.map((ld: any, idx: number) => (
                  <div key={idx} className="bg-slate-950 p-2.5 rounded border border-slate-800 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-200">{ld.freightOrderId} • {ld.customerName}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">ETA {ld.currentEta}</span>
                    </div>
                    <div className="text-[11px] text-slate-300">Promised: {ld.promisedEta} (+{ld.delayMinutes} min variance)</div>
                    <div className="text-[10px] text-slate-400">Action: {ld.mitigationAction}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 5. Unplanned Freight Units & 6. Warehouse Delays */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {ct.unplannedFreightUnits && ct.unplannedFreightUnits.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider">Unplanned Freight Units ({ct.unplannedFreightUnits.length})</h4>
              <div className="space-y-2 font-mono text-xs max-h-64 overflow-y-auto pr-1">
                {ct.unplannedFreightUnits.map((fu: any, idx: number) => (
                  <div key={idx} className="bg-slate-950 p-2.5 rounded border border-slate-800 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-blue-300">{fu.freightUnitId} ({fu.salesOrderNo})</span>
                      <span className="text-[10px] text-slate-400">{fu.weightKg.toLocaleString()} kg • {fu.volumeCbm} m³</span>
                    </div>
                    <div className="text-[11px] text-slate-200">{fu.customerName} - {fu.materialDescription}</div>
                    <div className="text-[10px] text-emerald-400">Action: {fu.suggestedAction}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {ct.warehouseDelays && ct.warehouseDelays.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-orange-300 uppercase tracking-wider">EWM Warehouse Delays ({ct.warehouseDelays.length})</h4>
              <div className="space-y-2 font-mono text-xs">
                {ct.warehouseDelays.map((wd: any, idx: number) => (
                  <div key={idx} className="bg-slate-950 p-2.5 rounded border border-slate-800 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-orange-300">{wd.warehouseTaskNo} ({wd.dockDoor})</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-950 text-orange-300 border border-orange-800">+{wd.pickingDelayMinutes} min</span>
                    </div>
                    <div className="text-[11px] text-slate-300">Staging Bin: {wd.stagingBin} • FO: {wd.freightOrderId}</div>
                    <div className="text-[10px] text-slate-400">Bottleneck: {wd.bottleneckCause}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 7. Transportation Capacity Risks & 8. High Cost Exceptions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {ct.transportationCapacityRisks && ct.transportationCapacityRisks.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-red-300 uppercase tracking-wider">Transportation Capacity Risks</h4>
              <div className="space-y-2 font-mono text-xs">
                {ct.transportationCapacityRisks.map((cr: any, idx: number) => (
                  <div key={idx} className="bg-slate-950 p-2.5 rounded border border-slate-800 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-200">{cr.laneId}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-300 border border-red-800">Deficit: {cr.deficitTruckloads} Truckloads ({cr.spotRateMultiplier}x Spot)</span>
                    </div>
                    <div className="text-[11px] text-slate-300">{cr.originHub} → {cr.destinationHub}</div>
                    <div className="text-[10px] text-emerald-300">Mitigation: {cr.recommendedMitigation}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {ct.highCostExceptions && ct.highCostExceptions.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">High-Cost Exceptions & Disputed Overruns</h4>
              <div className="space-y-2 font-mono text-xs">
                {ct.highCostExceptions.map((hc: any, idx: number) => (
                  <div key={idx} className="bg-slate-950 p-2.5 rounded border border-slate-800 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sky-300">{hc.freightOrderId} ({hc.carrierName})</span>
                      <span className="text-rose-400 font-bold">+{hc.variancePct}% (+€{hc.varianceAmountEur})</span>
                    </div>
                    <div className="text-[11px] text-slate-300">Contract €{hc.contractAmountEur} vs Billed €{hc.billedAmountEur}</div>
                    <div className="text-[10px] text-slate-400">{hc.rootCause}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (!reportData) {
      setLoading(true);
      tmService.getAutonomousTmReport('1010').then(res => {
        setReportData(res);
        setLoading(false);
      });
    }
  }, [data]);

  const handleRefreshReport = async () => {
    setLoading(true);
    setActionFeedback(null);
    try {
      const res = await tmService.getAutonomousTmReport('1010');
      setReportData(res);
      setActionFeedback('Refreshed live transportation data from S/4HANA TM OData services (API_FREIGHTORDER_SRV, API_TRANSPORTATIONORDER_SRV, API_FREIGHTSETTLEMENT_SRV).');
    } catch (err: any) {
      setActionFeedback(`Refresh error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRunExecutiveDirectorQuery = async () => {
    setLoading(true);
    setActionFeedback(null);
    try {
      const { executiveAnswer, report } = await tmService.getControlTowerExecutiveOverview('1010');
      setExecutiveOverviewText(executiveAnswer);
      setReportData(report);
      setActionFeedback('Executed Transportation Director Control Tower Analysis: Correlated TM + SD + EWM + MM + PP + FI/CO in 1 turn!');
    } catch (err: any) {
      setActionFeedback(`Executive query error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveException = async (exceptionId: string) => {
    setExecutingExceptionId(exceptionId);
    setActionFeedback(null);
    try {
      const res = await tmService.resolveTmException(exceptionId);
      setActionFeedback(res.message);
      // Refresh report
      const updated = await tmService.getAutonomousTmReport('1010');
      setReportData(updated);
    } catch (err: any) {
      setActionFeedback(`Error resolving exception: ${err.message}`);
    } finally {
      setExecutingExceptionId(null);
    }
  };

  if (loading || !reportData) {
    return (
      <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl text-slate-300 flex flex-col items-center justify-center gap-3 shadow-2xl">
        <RefreshCw className="w-8 h-8 animate-spin text-sky-400" />
        <span className="font-bold text-sm text-sky-300 tracking-wide">Connecting to S/4HANA TM Control Tower (API_FREIGHTORDER_SRV & API_TRANSPORTATIONORDER_SRV)...</span>
        <span className="text-xs text-slate-500">Correlating live Freight Orders, Deliveries, Carrier Telematics, and Freight Settlements</span>
      </div>
    );
  }

  const report = reportData;
  const { shipmentsAtRisk, carrierPerformances, costOverrunAlerts, capacityForecasts, exceptions, qaCatalog, auditLogs } = report;

  // Filtered QA items
  const filteredQaCatalog = qaCatalog.filter(item => {
    const matchesSearch = item.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.answerSummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.s4HanaODataService.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = qaCategoryFilter === 'All' || item.category === qaCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-slate-950 text-slate-100 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden mb-6 w-full animate-in zoom-in-95 font-sans">
      
      {/* Header Banner */}
      <div className="p-5 bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 border-b border-sky-800/40 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 bg-sky-500/20 border border-sky-400/30 rounded-xl flex items-center justify-center text-sky-400 shadow-inner">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-black text-sm uppercase tracking-wider text-sky-300">Autonomous SAP TM Control Tower AI Agent</span>
              <span className="bg-sky-500/20 border border-sky-400/30 text-sky-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">S/4HANA TM LIVE</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Senior Planner & Logistics Coordinator • OData Services: <code className="text-sky-300 font-mono">API_FREIGHTORDER_SRV</code>, <code className="text-sky-300 font-mono">API_TRANSPORTATIONORDER_SRV</code>, <code className="text-sky-300 font-mono">API_FREIGHTSETTLEMENT_SRV</code>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 w-full lg:w-auto justify-end">
          <button
            onClick={handleRunExecutiveDirectorQuery}
            className="bg-sky-600 hover:bg-sky-500 active:scale-95 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center space-x-1.5 transition-all shadow-lg shadow-sky-900/40 border border-sky-400/30"
            title="Ask Transportation Director Question"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>Ask Director Question</span>
          </button>
          
          <button
            onClick={handleRefreshReport}
            className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-bold text-xs px-3 py-2 rounded-xl flex items-center space-x-1.5 transition-all border border-slate-700"
            title="Refresh Live OData"
          >
            <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
            <span>Sync OData</span>
          </button>
        </div>
      </div>

      {/* Action Feedback Banner */}
      {actionFeedback && (
        <div className="bg-sky-950/80 border-b border-sky-800/60 p-3 px-5 flex items-start space-x-3 text-xs text-sky-200 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <div className="font-mono leading-relaxed">{actionFeedback}</div>
        </div>
      )}

      {/* Transportation Director Executive Answer Modal / Drawer */}
      {executiveOverviewText && (
        <div className="m-5 p-5 bg-slate-900/90 border border-sky-500/40 rounded-2xl relative space-y-3">
          <button 
            onClick={() => setExecutiveOverviewText(null)}
            className="absolute top-3 right-3 text-slate-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center space-x-2 text-sky-400 font-bold text-xs uppercase tracking-wider">
            <Cpu className="w-4 h-4 text-amber-400" />
            <span>Transportation Director Single-Conversation Diagnostic Response</span>
          </div>
          <div className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-line border-t border-slate-800 pt-3">
            {executiveOverviewText}
          </div>
        </div>
      )}

      {/* Executive KPI Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 p-5 bg-slate-900/60 border-b border-slate-800/80">
        <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Control Health</div>
          <div className="text-xl font-black text-sky-400 mt-1 flex items-baseline gap-1">
            {report.overallHealthScore}%
            <span className="text-[10px] text-emerald-400 font-bold">Optimal</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Freight Orders</div>
          <div className="text-xl font-black text-slate-100 mt-1">{report.totalActiveFreightOrders}</div>
        </div>

        <div className="bg-slate-900/80 border border-rose-950 p-3 rounded-xl">
          <div className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Shipments at Risk</div>
          <div className="text-xl font-black text-rose-400 mt-1 flex items-center justify-between">
            {report.shipmentsAtRiskCount}
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-amber-950 p-3 rounded-xl">
          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Problem Carriers</div>
          <div className="text-xl font-black text-amber-400 mt-1">{report.problemCarriersCount}</div>
        </div>

        <div className="bg-slate-900/80 border border-purple-950 p-3 rounded-xl">
          <div className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Disputed Costs</div>
          <div className="text-xl font-black text-purple-300 mt-1">€{report.costOverrunsTotalEur.toLocaleString()}</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Capacity Deficit Lanes</div>
          <div className="text-xl font-black text-amber-300 mt-1">{report.upcomingCapacityDeficitLanes}</div>
        </div>

        <div className="bg-slate-900/80 border border-emerald-950 p-3 rounded-xl col-span-2 md:col-span-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Auto-Fixes Executed</div>
          <div className="text-xl font-black text-emerald-400 mt-1 flex items-center justify-between">
            {report.autoFixesExecutedTodayCount}
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto border-b border-slate-800 bg-slate-900/40 p-1.5 gap-1 text-xs">
        <button
          onClick={() => setActiveTab('controlTower')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center space-x-2 transition-all whitespace-nowrap ${
            activeTab === 'controlTower' ? 'bg-sky-600 text-white shadow-lg shadow-sky-950' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Shipments at Risk ({shipmentsAtRisk.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('carriers')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center space-x-2 transition-all whitespace-nowrap ${
            activeTab === 'carriers' ? 'bg-sky-600 text-white shadow-lg shadow-sky-950' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Carriers & Tendering</span>
        </button>

        <button
          onClick={() => setActiveTab('costs')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center space-x-2 transition-all whitespace-nowrap ${
            activeTab === 'costs' ? 'bg-sky-600 text-white shadow-lg shadow-sky-950' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Freight Costs & Settlement</span>
        </button>

        <button
          onClick={() => setActiveTab('capacity')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center space-x-2 transition-all whitespace-nowrap ${
            activeTab === 'capacity' ? 'bg-sky-600 text-white shadow-lg shadow-sky-950' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Capacity & Route Optimization</span>
        </button>

        <button
          onClick={() => setActiveTab('exceptions')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center space-x-2 transition-all whitespace-nowrap ${
            activeTab === 'exceptions' ? 'bg-sky-600 text-white shadow-lg shadow-sky-950' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>10 Exception Categories ({exceptions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('actions')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center space-x-2 transition-all whitespace-nowrap ${
            activeTab === 'actions' ? 'bg-sky-600 text-white shadow-lg shadow-sky-950' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Autonomous Actions (17)</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('carrierSelection');
            if (!carrierSelResult) {
              handleEvaluateCarriersInTab();
            }
          }}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center space-x-2 transition-all whitespace-nowrap ${
            activeTab === 'carrierSelection' ? 'bg-sky-600 text-white shadow-lg shadow-sky-950' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Truck className="w-3.5 h-3.5 text-sky-400" />
          <span>Autonomous Carrier Selection</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('loadConsolidation');
            if (!consolidationResult) {
              handleConsolidateInTab();
            }
          }}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center space-x-2 transition-all whitespace-nowrap ${
            activeTab === 'loadConsolidation' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Autonomous Load Consolidation</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('costIntelligence');
            if (!costIntelResult) {
              handleAnalyzeCostIntelInTab();
            }
          }}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center space-x-2 transition-all whitespace-nowrap ${
            activeTab === 'costIntelligence' ? 'bg-amber-600 text-white shadow-lg shadow-amber-950' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-amber-300" />
          <span>Transportation Cost Intelligence</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('predictiveAi');
            if (!predictiveResult) {
              handleAnalyzePredictiveAiInTab();
            }
          }}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center space-x-2 transition-all whitespace-nowrap ${
            activeTab === 'predictiveAi' ? 'bg-purple-600 text-white shadow-lg shadow-purple-950' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 text-purple-300" />
          <span>Predictive Transportation AI (11 Vectors)</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('autonomousTendering');
            if (!tenderingResult) {
              handleAnalyzeTenderingInTab();
            }
          }}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center space-x-2 transition-all whitespace-nowrap ${
            activeTab === 'autonomousTendering' ? 'bg-sky-600 text-white shadow-lg shadow-sky-950' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Share2 className="w-3.5 h-3.5 text-sky-300" />
          <span>Autonomous Tendering</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('freightSettlement');
            if (!settlementResult) {
              handleAnalyzeSettlementInTab();
            }
          }}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center space-x-2 transition-all whitespace-nowrap ${
            activeTab === 'freightSettlement' ? 'bg-amber-600 text-white shadow-lg shadow-amber-950' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-amber-300" />
          <span>Freight Settlement Intelligence</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('transportationControlTower');
            if (!controlTowerResult) {
              handleAnalyzeControlTowerInTab();
            }
          }}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center space-x-2 transition-all whitespace-nowrap ${
            activeTab === 'transportationControlTower' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-sky-300 animate-pulse" />
          <span>Transportation Control Tower</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('multiAgent');
            if (!multiAgentResult) {
              handleAnalyzeMultiAgentInTab();
            }
          }}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center space-x-2 transition-all whitespace-nowrap ${
            activeTab === 'multiAgent' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-indigo-300 animate-pulse" />
          <span>Multi-Agent Architecture (10 Agents)</span>
        </button>

        <button
          onClick={() => setActiveTab('qa')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center space-x-2 transition-all whitespace-nowrap ${
            activeTab === 'qa' ? 'bg-sky-600 text-white shadow-lg shadow-sky-950' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>50 Natural Language QA Catalog</span>
        </button>

        <button
          onClick={() => setActiveTab('approvalModel')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center space-x-2 transition-all whitespace-nowrap ${
            activeTab === 'approvalModel' ? 'bg-amber-600 text-white shadow-lg shadow-amber-950' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          <span>Recommended Approval Model (3 Tiers)</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center space-x-2 transition-all whitespace-nowrap ${
            activeTab === 'audit' ? 'bg-sky-600 text-white shadow-lg shadow-sky-950' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>Immutable Audit Log</span>
        </button>
      </div>

      {/* Tab Content Area */}
      <div className="p-5">

        {/* Tab: Conversational Transportation Control Tower */}
        {activeTab === 'transportationControlTower' && (
          <div className="space-y-4 font-sans">
            {/* Search Header Bar */}
            <div className="bg-slate-900 border border-indigo-800/60 p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-sky-400 animate-pulse" />
                  <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Conversational Transportation Control Tower</h3>
                </div>
                <span className="bg-sky-950 text-sky-300 border border-sky-800 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                  S/4HANA OData Correlated
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={controlTowerQuery}
                  onChange={(e) => setControlTowerQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAnalyzeControlTowerInTab()}
                  placeholder='Ask: "What is happening across my transportation network right now?"'
                  className="flex-1 bg-slate-950 border border-slate-800 text-xs font-mono text-slate-100 rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
                />
                <button
                  onClick={() => handleAnalyzeControlTowerInTab()}
                  disabled={controlTowerLoading}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-all flex items-center space-x-1 shrink-0"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Ask Control Tower</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[
                  "What is happening across my transportation network right now?",
                  "Show late pickups and late deliveries",
                  "Which freight units are unplanned?",
                  "Show carrier rejections and capacity risks",
                  "Show high cost exceptions and customer-impacting shipments"
                ].map((qText, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setControlTowerQuery(qText);
                      handleAnalyzeControlTowerInTab(qText);
                    }}
                    className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-sky-300 text-[10px] font-medium px-2 py-1 rounded transition-colors"
                  >
                    {qText}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Display */}
            {controlTowerLoading ? (
              <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl text-slate-300 flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
                <span className="font-bold text-xs text-indigo-300">Correlating S/4HANA TM Logistics Network Status...</span>
              </div>
            ) : controlTowerResult ? (
              <div className="space-y-4">
                {/* Executive Narrative */}
                {controlTowerResult.executiveNarrative && (
                  <div className="bg-slate-900 border border-indigo-800/60 p-4 rounded-xl space-y-2">
                    <div className="flex items-center space-x-2 text-indigo-300 font-bold text-xs uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Executive Network Overview Response</span>
                    </div>
                    <div className="text-xs text-slate-200 font-mono leading-relaxed whitespace-pre-line bg-slate-950 p-3 rounded-lg border border-slate-800">
                      {controlTowerResult.executiveNarrative}
                    </div>
                  </div>
                )}

                {/* 9 KPI Cards */}
                {controlTowerResult.summaryKPIs && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    <div className="bg-slate-900 border border-sky-800/60 p-3 rounded-xl space-y-1">
                      <span className="text-[10px] uppercase font-bold text-sky-300 block">Shipments in Transit</span>
                      <div className="text-xl font-black text-sky-400">{controlTowerResult.summaryKPIs.totalShipmentsInTransit}</div>
                    </div>
                    <div className="bg-slate-900 border border-amber-800/60 p-3 rounded-xl space-y-1">
                      <span className="text-[10px] uppercase font-bold text-amber-300 block">Late Pickups</span>
                      <div className="text-xl font-black text-amber-400">{controlTowerResult.summaryKPIs.latePickupsCount}</div>
                    </div>
                    <div className="bg-slate-900 border border-rose-800/60 p-3 rounded-xl space-y-1">
                      <span className="text-[10px] uppercase font-bold text-rose-300 block">Late Deliveries</span>
                      <div className="text-xl font-black text-rose-400">{controlTowerResult.summaryKPIs.lateDeliveriesCount}</div>
                    </div>
                    <div className="bg-slate-900 border border-purple-800/60 p-3 rounded-xl space-y-1">
                      <span className="text-[10px] uppercase font-bold text-purple-300 block">Carrier Rejections</span>
                      <div className="text-xl font-black text-purple-400">{controlTowerResult.summaryKPIs.carrierRejectionsCount}</div>
                    </div>
                    <div className="bg-slate-900 border border-blue-800/60 p-3 rounded-xl space-y-1">
                      <span className="text-[10px] uppercase font-bold text-blue-300 block">Unplanned Freight Units</span>
                      <div className="text-xl font-black text-blue-400">{controlTowerResult.summaryKPIs.unplannedFreightUnitsCount}</div>
                    </div>
                    <div className="bg-slate-900 border border-orange-800/60 p-3 rounded-xl space-y-1">
                      <span className="text-[10px] uppercase font-bold text-orange-300 block">Warehouse Delays</span>
                      <div className="text-xl font-black text-orange-400">{controlTowerResult.summaryKPIs.warehouseDelaysCount}</div>
                    </div>
                    <div className="bg-slate-900 border border-red-800/60 p-3 rounded-xl space-y-1">
                      <span className="text-[10px] uppercase font-bold text-red-300 block">Capacity Risks</span>
                      <div className="text-xl font-black text-red-400">{controlTowerResult.summaryKPIs.transportationCapacityRisksCount}</div>
                    </div>
                    <div className="bg-slate-900 border border-emerald-800/60 p-3 rounded-xl space-y-1">
                      <span className="text-[10px] uppercase font-bold text-emerald-300 block">High-Cost Exceptions</span>
                      <div className="text-xl font-black text-emerald-400">{controlTowerResult.summaryKPIs.highCostExceptionsCount}</div>
                    </div>
                    <div className="bg-slate-900 border border-indigo-800/60 p-3 rounded-xl space-y-1 col-span-2 md:col-span-2 lg:col-span-2">
                      <span className="text-[10px] uppercase font-bold text-indigo-300 block">Customer-Impacting Shipments</span>
                      <div className="text-xl font-black text-indigo-300">{controlTowerResult.summaryKPIs.customerImpactingShipmentsCount}</div>
                    </div>
                  </div>
                )}

                {/* Customer Impacting Table */}
                {controlTowerResult.customerImpactingShipments && (
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Customer-Impacting Shipments</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-mono">
                        <thead>
                          <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                            <th className="pb-2">FO ID</th>
                            <th className="pb-2">Customer Name</th>
                            <th className="pb-2">Sales Order</th>
                            <th className="pb-2">Cargo Value</th>
                            <th className="pb-2">Threat / Impact</th>
                            <th className="pb-2">Autonomous Mitigation</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {controlTowerResult.customerImpactingShipments.map((cis: any, idx: number) => (
                            <tr key={idx} className="hover:bg-slate-850/50">
                              <td className="py-2 font-bold text-sky-300">{cis.freightOrderId}</td>
                              <td className="py-2 font-bold text-slate-100">{cis.customerName}</td>
                              <td className="py-2 text-slate-300">{cis.salesOrderNo}</td>
                              <td className="py-2 text-emerald-400 font-bold">€{cis.cargoValueEur?.toLocaleString()}</td>
                              <td className="py-2"><span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">{cis.impactType}</span></td>
                              <td className="py-2 text-[11px] text-slate-300">{cis.mitigationStrategy}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Shipments in Transit */}
                {controlTowerResult.shipmentsInTransit && (
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider">Shipments in Transit & GPS Telematics</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-mono">
                        <thead>
                          <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                            <th className="pb-2">FO ID</th>
                            <th className="pb-2">Origin → Destination</th>
                            <th className="pb-2">Carrier & Mode</th>
                            <th className="pb-2">ETA</th>
                            <th className="pb-2">Location Telematics</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {controlTowerResult.shipmentsInTransit.map((sit: any, idx: number) => (
                            <tr key={idx} className="hover:bg-slate-850/50">
                              <td className="py-2 font-bold text-sky-300">{sit.freightOrderId}</td>
                              <td className="py-2 text-slate-200">{sit.origin} → {sit.destination}</td>
                              <td className="py-2 text-slate-300">{sit.carrierName} ({sit.transportMode})</td>
                              <td className="py-2 text-amber-300 font-bold">{sit.estimatedArrival}</td>
                              <td className="py-2 text-[11px] text-sky-200">{sit.locationTelematics}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}

        {/* Tab: Multi-Agent SAP TM Architecture (10 Specialized Agents) */}
        {activeTab === 'multiAgent' && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-400" />
                  Multi-Agent SAP TM Architecture (10 Specialized Agents Interlocked)
                </h3>
                <p className="text-xs text-slate-400">
                  Coordinates Orchestrator, Planning, Carrier, Execution, Freight Cost, Network Optimization, Appointment, Tracking, Exception & Predictive Agents
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <select
                  value={multiAgentFilter}
                  onChange={(e) => {
                    setMultiAgentFilter(e.target.value);
                    handleAnalyzeMultiAgentInTab(multiAgentQuery, e.target.value);
                  }}
                  className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 font-mono focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">All 10 Specialized Agents</option>
                  <option value="TM_ORCHESTRATOR">1. TM Orchestrator Agent</option>
                  <option value="PLANNING">2. Planning Agent</option>
                  <option value="CARRIER">3. Carrier Agent</option>
                  <option value="EXECUTION">4. Execution Agent</option>
                  <option value="FREIGHT_COST">5. Freight Cost Agent</option>
                  <option value="NETWORK_OPTIMIZATION">6. Network Optimization Agent</option>
                  <option value="APPOINTMENT">7. Appointment Agent</option>
                  <option value="TRACKING">8. Tracking Agent</option>
                  <option value="EXCEPTION">9. Exception Agent</option>
                  <option value="PREDICTIVE">10. Predictive Agent</option>
                </select>

                <button
                  onClick={() => handleAnalyzeMultiAgentInTab()}
                  disabled={multiAgentLoading}
                  className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition-all shadow-md shadow-indigo-950 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${multiAgentLoading ? 'animate-spin' : ''}`} />
                  <span>Sync Architecture</span>
                </button>
              </div>
            </div>

            {/* Quick Prompt Badges */}
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Quick Multi-Agent Directives:</span>
              <div className="flex flex-wrap gap-2">
                {[
                  "Coordinate multi-agent SAP TM operations across network",
                  "Run full multi-agent freight unit consolidation & tendering",
                  "Trigger agentic dispute resolution & ACDOCA settlement match",
                  "Execute predictive capacity shortage & route optimization dispatch"
                ].map((qText, qIdx) => (
                  <button
                    key={qIdx}
                    onClick={() => {
                      setMultiAgentQuery(qText);
                      handleAnalyzeMultiAgentInTab(qText, multiAgentFilter);
                    }}
                    className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-indigo-300 text-[10px] font-medium px-2.5 py-1 rounded-lg transition-colors"
                  >
                    {qText}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Display */}
            {multiAgentLoading ? (
              <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl text-slate-300 flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
                <span className="font-bold text-xs text-indigo-300">Synchronizing S/4HANA 10-Agent Transportation Pipeline...</span>
              </div>
            ) : multiAgentResult ? (
              <div className="space-y-4">
                {/* Summary KPIs */}
                {multiAgentResult.summaryKPIs && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-900 border border-indigo-800/60 p-3 rounded-xl text-center">
                      <span className="text-[10px] uppercase font-bold text-indigo-300 block">Total Agents</span>
                      <span className="text-xl font-black font-mono text-indigo-400">{multiAgentResult.summaryKPIs.totalAgents || 10} / 10 <span className="text-xs text-emerald-400 font-bold">Active</span></span>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">S/4HANA OData Sync</span>
                      <span className="text-xl font-black font-mono text-sky-400">100% Real-time</span>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Cross-Module Interlock</span>
                      <span className="text-xl font-black font-mono text-emerald-400">SD+EWM+MM+TM+FI</span>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Coordination Index</span>
                      <span className="text-xl font-black font-mono text-amber-300">{multiAgentResult.summaryKPIs.multiAgentCoordinationIndex || '99.8%'}</span>
                    </div>
                  </div>
                )}

                {/* 10 Agents Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(multiAgentResult.agents || multiAgentResult.multiAgentArchitecture?.agents || []).map((ag: any, idx: number) => (
                    <div key={idx} className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all rounded-2xl p-4.5 space-y-3">
                      <div className="flex items-start justify-between border-b border-slate-800 pb-2.5">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950 px-2.5 py-0.5 rounded-md border border-indigo-800">
                              {ag.agentId}
                            </span>
                            <h4 className="font-bold text-slate-100 text-sm">{ag.agentName}</h4>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1">{ag.role}</p>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-950 text-emerald-300 border border-emerald-800">
                          {ag.status || 'ACTIVE'}
                        </span>
                      </div>

                      <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 text-xs space-y-1">
                        <div className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">S/4HANA CDS & OData Integration</div>
                        <div className="font-mono text-sky-300 text-[11px]">{ag.s4HanaSource}</div>
                        <p className="text-slate-300 text-[11px] leading-relaxed mt-1">{ag.activeScope}</p>
                      </div>

                      {ag.keyKPIs && (
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 grid grid-cols-2 gap-2 text-xs font-mono">
                          {Object.entries(ag.keyKPIs).map(([k, v]: [string, any], kIdx: number) => (
                            <div key={kIdx}>
                              <span className="text-[9px] text-slate-500 uppercase block">{k.replace(/([A-Z])/g, ' $1')}</span>
                              <span className="text-slate-200 font-bold">{String(v)}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {ag.actions && ag.actions.length > 0 && (
                        <div className="pt-1 flex flex-wrap gap-2">
                          {ag.actions.map((act: any, aIdx: number) => (
                            <button
                              key={aIdx}
                              onClick={() => handleExecuteMultiAgentActionInTab(ag.agentId, act.key)}
                              disabled={actionRunning}
                              className="bg-indigo-900/80 hover:bg-indigo-800 active:scale-95 text-indigo-200 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-indigo-700/60 flex items-center space-x-1.5 transition-all disabled:opacity-50"
                            >
                              <Zap className="w-3 h-3 text-amber-300" />
                              <span>{act.label}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {ag.recentLog && (
                        <div className="text-[10px] font-mono text-slate-400 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/50 flex items-center justify-between">
                          <span className="text-slate-300 truncate mr-2">Log: {ag.recentLog}</span>
                          <span className="text-emerald-400 font-bold shrink-0">{ag.auditHash?.slice(0, 10)}...</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Tab 1: Control Tower & Shipments at Risk */}
        {activeTab === 'controlTower' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Live Freight Order Risk Assessment (API_FREIGHTORDER_SRV)
              </h3>
              <span className="text-xs text-slate-400 font-mono">Prioritized by Customer & Financial Impact</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {shipmentsAtRisk.map((item, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 hover:border-sky-500/50 transition-all space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                        item.severity === 'CRITICAL' ? 'bg-rose-950/80 text-rose-300 border-rose-800' : 'bg-amber-950/80 text-amber-300 border-amber-800'
                      }`}>
                        {item.severity} RISK
                      </span>
                      <span className="font-mono font-bold text-sky-300 text-sm">{item.freightOrderId}</span>
                      <span className="text-xs text-slate-400">Carrier: <strong className="text-slate-200">{item.carrierName}</strong></span>
                    </div>

                    <div className="flex items-center space-x-3 font-mono text-xs">
                      <span className="text-slate-400">Delay: <strong className="text-rose-400">+{item.delayMinutes} mins</strong></span>
                      <span className="text-slate-400">Risk Value: <strong className="text-emerald-400">€{item.financialRiskEur.toLocaleString()}</strong></span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Customer & Route Info</span>
                      <div className="font-bold text-slate-200">{item.customerName}</div>
                      <div className="text-slate-400 font-mono text-[11px]">{item.originLocation} → {item.destinationLocation}</div>
                      <div className="text-[10px] text-slate-500">SD Delivery: {item.outboundDeliveryNo} | Sales Order: {item.salesOrderNo}</div>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cross-Module Correlation (TM + SD + EWM + PP)</span>
                      <p className="text-slate-300 leading-relaxed text-[11px]">{item.crossModuleImpact}</p>
                    </div>
                  </div>

                  <div className="bg-sky-950/40 border border-sky-800/40 p-3 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-start space-x-2">
                      <Sparkles className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-sky-300 block text-[11px] uppercase tracking-wider">AI Recommended Corrective Action</span>
                        <p className="text-slate-200">{item.recommendedAction}</p>
                      </div>
                    </div>

                    {item.canAutoResolve && (
                      <button
                        onClick={() => handleResolveException(`EXC-${item.freightOrderId}`)}
                        disabled={executingExceptionId === `EXC-${item.freightOrderId}`}
                        className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all shrink-0 border border-emerald-400/30 disabled:opacity-50"
                      >
                        {executingExceptionId === `EXC-${item.freightOrderId}` ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Zap className="w-3.5 h-3.5 text-amber-300" />
                        )}
                        <span>Auto-Fix Freight Order</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Carrier Performance & Tendering */}
        {activeTab === 'carriers' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Truck className="w-4 h-4 text-sky-400" />
                Carrier Performance & Tendering Analytics (API_TRANSPORTATIONORDER_SRV)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {carrierPerformances.map((c, i) => (
                <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-sm text-slate-100">{c.carrierName}</div>
                        <div className="text-xs font-mono text-sky-400">{c.carrierId} ({c.scacCode})</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                        c.riskLevel === 'PREMIUM_PERFORMER' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                        c.riskLevel === 'MODERATE_RISK' ? 'bg-amber-950 text-amber-300 border-amber-800' :
                        'bg-rose-950 text-rose-300 border-rose-800'
                      }`}>
                        {c.riskLevel.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-slate-800">
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase block">OTIF Rate</span>
                        <strong className="text-emerald-400 text-sm">{c.onTimeDeliveryRatePct}%</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase block">Tendering Acceptance</span>
                        <strong className="text-sky-300 text-sm">{c.tenderingAcceptanceRatePct}%</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase block">Monthly Spend</span>
                        <strong className="text-slate-200 text-sm">€{c.totalFreightSpendEur.toLocaleString()}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase block">Rejections (30d)</span>
                        <strong className={c.rejectionCountLast30Days > 5 ? 'text-rose-400 text-sm' : 'text-slate-200 text-sm'}>{c.rejectionCountLast30Days}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-xs space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Telematics & Recommendation</span>
                    <p className="text-slate-300 text-[11px]">{c.recommendedAction}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Freight Costs & Settlement */}
        {activeTab === 'costs' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-purple-400" />
                Freight Settlement & Invoice Dispute Management (API_FREIGHTSETTLEMENT_SRV)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {costOverrunAlerts.map((ca, i) => (
                <div key={i} className="bg-slate-900 border border-purple-900/40 rounded-2xl p-4.5 space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <div>
                      <span className="font-mono font-bold text-purple-300 text-sm">{ca.settlementDocumentNo}</span>
                      <span className="text-xs text-slate-400 block">Freight Order: {ca.freightOrderId}</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-950 text-purple-300 border border-purple-800">
                      {ca.fiCoAccrualStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 font-mono text-xs text-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block">Contract Tariff</span>
                      <span className="text-slate-200 font-bold">€{ca.contractTariffAmountEur}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block">Billed Invoice</span>
                      <span className="text-rose-400 font-bold">€{ca.billedFreightAmountEur}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block">Variance (+%)</span>
                      <span className="text-amber-400 font-bold">+€{ca.varianceAmountEur} ({ca.variancePct}%)</span>
                    </div>
                  </div>

                  <div className="text-xs space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Dispute Root Cause</span>
                    <p className="text-slate-300">{ca.disputeReason}</p>
                  </div>

                  <div className="bg-purple-950/30 border border-purple-800/40 p-2.5 rounded-xl text-xs flex items-center justify-between">
                    <div className="text-purple-200 text-[11px]">{ca.recommendedCorrection}</div>
                    <button
                      onClick={() => handleResolveException(`DISPUTE-${ca.settlementDocumentNo}`)}
                      className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] px-2.5 py-1 rounded-lg shrink-0 transition-all"
                    >
                      Audit 3-Way Match
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Capacity & Route Optimization */}
        {activeTab === 'capacity' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Navigation className="w-4 h-4 text-emerald-400" />
                Predictive Capacity Deficit & Multi-Modal Route Optimization
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {capacityForecasts.map((cf, i) => (
                <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono text-xs font-bold text-emerald-400 block">{cf.laneId}</span>
                      <h4 className="font-bold text-slate-100 text-sm">{cf.originHub} → {cf.destinationHub}</h4>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                      cf.riskLevel === 'CRITICAL_DEFICIT' ? 'bg-rose-950 text-rose-300 border-rose-800' : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    }`}>
                      {cf.riskLevel}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 font-mono text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block">Forecast Demand</span>
                      <span className="text-slate-200 font-bold">{cf.forecastedDemandTruckloads} Truckloads</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block">Committed Capacity</span>
                      <span className="text-sky-300 font-bold">{cf.committedCarrierCapacityTruckloads} Truckloads</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block">Deficit / Spot Multiplier</span>
                      <span className="text-rose-400 font-bold">-{cf.capacityDeficitTruckloads} TL ({cf.spotRateMultiplier}x)</span>
                    </div>
                  </div>

                  <div className="bg-emerald-950/30 border border-emerald-800/40 p-2.5 rounded-xl text-xs space-y-1">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">AI Mitigation Strategy</span>
                    <p className="text-slate-200 leading-relaxed text-[11px]">{cf.recommendedMitigation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: 10 Exception Categories */}
        {activeTab === 'exceptions' && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  10 Autonomous Exception Categories & 7-Step Agentic Lifecycle
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Standard Lifecycle: <code className="text-amber-300 font-mono">Detect → Diagnose → Recommend → Approve → Execute → Verify → Audit</code>
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <select
                  value={exceptionCategoryFilter}
                  onChange={(e) => {
                    setExceptionCategoryFilter(e.target.value);
                    handleAnalyzeExceptionMgmtInTab(undefined, e.target.value);
                  }}
                  className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-amber-500 font-mono"
                >
                  <option value="ALL">All 10 Categories</option>
                  <option value="REJECTED_TENDERS">1. Rejected Tenders</option>
                  <option value="MISSING_CARRIERS">2. Missing Carriers</option>
                  <option value="MISSED_PICKUPS">3. Missed Pickups</option>
                  <option value="LATE_TRUCKS">4. Late Trucks</option>
                  <option value="DELAYED_DELIVERIES">5. Delayed Deliveries</option>
                  <option value="ROUTE_DEVIATIONS">6. Route Deviations</option>
                  <option value="CAPACITY_SHORTAGES">7. Capacity Shortages</option>
                  <option value="COST_ANOMALIES">8. Freight Cost Anomalies</option>
                  <option value="MISSING_POD">9. Missing Proof of Delivery</option>
                  <option value="SETTLEMENT_MISMATCHES">10. Settlement Mismatches</option>
                </select>

                <button
                  onClick={() => handleAnalyzeExceptionMgmtInTab()}
                  disabled={exceptionMgmtLoading}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-all shadow shrink-0 flex items-center space-x-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${exceptionMgmtLoading ? 'animate-spin' : ''}`} />
                  <span>Sync Exceptions</span>
                </button>
              </div>
            </div>

            {/* Render Exceptions List */}
            <div className="grid grid-cols-1 gap-4">
              {(exceptionMgmtResult?.exceptions || exceptions).map((ex: any, i: number) => {
                const wf = ex.workflow || {};
                return (
                  <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 space-y-3.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                      <div className="flex items-center space-x-3">
                        <span className="w-7 h-7 rounded-lg bg-amber-950 text-amber-400 font-mono text-xs font-bold flex items-center justify-center border border-amber-800 shrink-0">
                          #{i + 1}
                        </span>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-amber-300 text-sm">{ex.category}: {ex.title || ex.category}</span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                              ex.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border-rose-800' : 'bg-amber-950 text-amber-300 border-amber-800'
                            }`}>
                              {ex.severity || 'HIGH'}
                            </span>
                          </div>
                          <span className="text-xs font-mono text-slate-400">Doc: <code className="text-sky-300">{ex.impactedDocumentId || ex.impactedDocument}</code> | Value: €{(ex.financialValueEur || 12000).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-sky-950 text-sky-300 border border-sky-800">
                          Stage: {ex.currentStage || ex.lifecycleStage || 'DETECTED'}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <strong className="text-amber-400 uppercase text-[10px] block mb-1">Root Cause Diagnosis:</strong>
                      {ex.rootCauseDiagnosis || wf.diagnose?.rootCause}
                    </div>

                    {/* Cross-Module Correlation Row */}
                    {ex.crossModuleCorrelation && (
                      <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-[10px] font-mono bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                        <div><span className="text-slate-500 block">TM Order:</span> {ex.crossModuleCorrelation.tmFreightOrder}</div>
                        <div><span className="text-slate-500 block">SD Delivery:</span> {ex.crossModuleCorrelation.sdOutboundDelivery}</div>
                        <div><span className="text-slate-500 block">EWM Task:</span> {ex.crossModuleCorrelation.ewmWarehouseTask}</div>
                        <div><span className="text-slate-500 block">MM Stock:</span> {ex.crossModuleCorrelation.mmMaterialStock}</div>
                        <div><span className="text-slate-500 block">PP Order:</span> {ex.crossModuleCorrelation.ppProductionOrder}</div>
                        <div><span className="text-slate-500 block">FI Accrual:</span> {ex.crossModuleCorrelation.fiCoJournalEntry}</div>
                      </div>
                    )}

                    {/* 7-Stage Workflow Grid */}
                    {wf.detect && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-2 text-[11px] pt-1">
                        <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                          <span className="text-[9px] font-bold text-sky-400 uppercase block">1. Detect</span>
                          <p className="text-slate-300 font-mono text-[9px] leading-tight truncate">{wf.detect?.signal}</p>
                        </div>
                        <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                          <span className="text-[9px] font-bold text-amber-400 uppercase block">2. Diagnose</span>
                          <p className="text-slate-300 font-mono text-[9px] leading-tight truncate">{wf.diagnose?.rootCause}</p>
                        </div>
                        <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                          <span className="text-[9px] font-bold text-purple-400 uppercase block">3. Recommend</span>
                          <p className="text-slate-300 font-mono text-[9px] leading-tight truncate">{wf.recommend?.action}</p>
                        </div>
                        <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 space-y-1">
                          <span className="text-[9px] font-bold text-indigo-400 uppercase block">4. Approve</span>
                          <button
                            onClick={() => handleExecuteExceptionStage(ex.exceptionId, 'APPROVE')}
                            disabled={actionRunning}
                            className="w-full bg-indigo-700 hover:bg-indigo-600 text-white font-bold text-[9px] py-1 rounded transition-all"
                          >
                            Approve
                          </button>
                        </div>
                        <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 space-y-1">
                          <span className="text-[9px] font-bold text-emerald-400 uppercase block">5. Execute</span>
                          <button
                            onClick={() => handleExecuteExceptionStage(ex.exceptionId, 'EXECUTE')}
                            disabled={actionRunning}
                            className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-[9px] py-1 rounded transition-all"
                          >
                            Execute
                          </button>
                        </div>
                        <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 space-y-1">
                          <span className="text-[9px] font-bold text-sky-400 uppercase block">6. Verify</span>
                          <button
                            onClick={() => handleExecuteExceptionStage(ex.exceptionId, 'VERIFY')}
                            disabled={actionRunning}
                            className="w-full bg-sky-700 hover:bg-sky-600 text-white font-bold text-[9px] py-1 rounded transition-all"
                          >
                            Verify
                          </button>
                        </div>
                        <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 space-y-1">
                          <span className="text-[9px] font-bold text-rose-400 uppercase block">7. Audit</span>
                          <button
                            onClick={() => handleExecuteExceptionStage(ex.exceptionId, 'AUDIT')}
                            disabled={actionRunning}
                            className="w-full bg-rose-800 hover:bg-rose-700 text-white font-bold text-[9px] py-1 rounded transition-all"
                          >
                            Audit
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                      <span className="text-slate-400 font-mono text-[10px]">SHA-256 Audit Hash: <code className="text-sky-300">{(ex.hashSha256 || '9a8b7c6d5e4f').slice(0, 24)}...</code></span>
                      <button
                        onClick={() => handleResolveException(ex.exceptionId)}
                        className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-3 py-1 rounded-lg transition-all"
                      >
                        Re-run 7-Step Lifecycle
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 6: 50 Natural Language QA Catalog */}
        {activeTab === 'qa' && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-sky-400" />
                50 Natural Language Questions Catalog for Autonomous SAP TM Agent
              </h3>

              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search 50 QA items..."
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl pl-9 pr-3 py-1.5 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <select
                  value={qaCategoryFilter}
                  onChange={(e) => setQaCategoryFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-sky-500"
                >
                  <option value="All">All Categories (50)</option>
                  <option value="Freight Order Management">Freight Order Management</option>
                  <option value="Transportation Planning & Route Optimization">Route Optimization</option>
                  <option value="Carrier Selection & Tendering">Carrier Tendering</option>
                  <option value="Freight Costing & Settlement">Freight Settlement</option>
                  <option value="Control Tower & Real-time Exception Management">Control Tower</option>
                  <option value="Predictive Logistics & Analytics">Predictive Analytics</option>
                </select>
              </div>
            </div>

            <div className="text-xs text-slate-400">
              Showing <strong>{filteredQaCatalog.length}</strong> of 50 Natural Language Query Patterns. Click any question to inspect S/4HANA OData mapping and cross-module correlation!
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {filteredQaCatalog.map((item) => (
                <div 
                  key={item.questionId}
                  className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 hover:border-sky-500/50 transition-all cursor-pointer space-y-2"
                  onClick={() => setExpandedQaId(expandedQaId === item.questionId ? null : item.questionId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <span className="w-6 h-6 rounded-lg bg-sky-950 text-sky-400 font-mono text-xs font-bold flex items-center justify-center shrink-0 border border-sky-800">
                        #{item.questionId}
                      </span>
                      <span className="font-bold text-slate-100 text-xs">{item.questionText}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                        {item.category}
                      </span>
                      <span className="font-mono text-[10px] text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-900">
                        {item.s4HanaODataService}
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-300 text-xs leading-relaxed pl-8.5">
                    {item.answerSummary}
                  </p>

                  {expandedQaId === item.questionId && (
                    <div className="mt-2 pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 pl-8.5 animate-in fade-in">
                      <div><strong className="text-slate-300">Cross-Module Correlation:</strong> {item.crossModuleCorrelation}</div>
                      <div><strong className="text-slate-300">Actionable T-Code / Fiori App:</strong> {item.actionableTCodeOrFioriApp}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 6: 17 Autonomous SAP TM Actions */}
        {activeTab === 'actions' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  17 Autonomous SAP TM Execution Actions
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Authorized S/4HANA TM transactions using OData APIs (<code className="text-sky-300 font-mono">API_FREIGHTORDER_SRV</code>, <code className="text-sky-300 font-mono">API_TRANSPORTATIONORDER_SRV</code>, <code className="text-sky-300 font-mono">API_FREIGHTSETTLEMENT_SRV</code>)
                </p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Select TM Action (17 Supported)</label>
                  <select
                    value={selectedActionType}
                    onChange={(e) => setSelectedActionType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 font-mono focus:border-sky-500 focus:outline-none"
                  >
                    <option value="create_freight_unit">1. Create Freight Unit</option>
                    <option value="create_freight_order">2. Create Freight Order</option>
                    <option value="plan_transportation">3. Plan Transportation</option>
                    <option value="assign_carrier">4. Assign Carrier</option>
                    <option value="trigger_tendering">5. Trigger Tendering</option>
                    <option value="re_tender_rejected_load">6. Re-tender Rejected Load</option>
                    <option value="consolidate_freight_units">7. Consolidate Freight Units</option>
                    <option value="split_shipment">8. Split Shipment</option>
                    <option value="reassign_carrier">9. Reassign Carrier</option>
                    <option value="change_route">10. Change Route</option>
                    <option value="update_transportation_dates">11. Update Transportation Dates</option>
                    <option value="schedule_pickup_appointment">12. Schedule Pickup Appointment</option>
                    <option value="trigger_delivery_notification">13. Trigger Delivery Notification</option>
                    <option value="calculate_freight_charges">14. Calculate Freight Charges</option>
                    <option value="create_settlement_document">15. Create Settlement Document</option>
                    <option value="reprocess_failed_interfaces">16. Reprocess Failed Interfaces</option>
                    <option value="escalate_shipment_exception">17. Escalate Shipment Exception</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Document ID (Freight Order / FU)</label>
                  <input
                    type="text"
                    value={actionDocId}
                    onChange={(e) => setActionDocId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 font-mono focus:border-sky-500 focus:outline-none"
                    placeholder="FO-60098120"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Carrier Name / ID</label>
                  <input
                    type="text"
                    value={actionCarrierId}
                    onChange={(e) => setActionCarrierId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 font-mono focus:border-sky-500 focus:outline-none"
                    placeholder="DHL Global Forwarding"
                  />
                </div>
              </div>

              <button
                onClick={handleExecuteAutonomousAction}
                disabled={actionRunning}
                className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-emerald-950 border border-emerald-400/30"
              >
                {actionRunning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Posting S/4HANA OData Transaction...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>Execute S/4HANA TM Autonomous Action</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Tab: Autonomous Carrier Selection */}
        {activeTab === 'carrierSelection' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Truck className="w-4 h-4 text-sky-400" />
                  Autonomous SAP TM Carrier Selection Engine
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Multi-Objective AI Optimization: Evaluates Lane, Equipment, Rates, OTP %, Tender Acceptance %, Claims History, Capacity, Customer SLA & Risk.
                </p>
              </div>
            </div>

            {/* Carrier Evaluation Input Controls */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Load / Freight Order Query</label>
                  <input
                    type="text"
                    value={carrierSelQuery}
                    onChange={(e) => setCarrierSelQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 font-mono focus:border-sky-500 focus:outline-none"
                    placeholder="FO-60098120 or Munich Reefer Load"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Shipment Priority & SLA Strategy</label>
                  <select
                    value={carrierSelPriority}
                    onChange={(e) => setCarrierSelPriority(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 font-mono focus:border-sky-500 focus:outline-none"
                  >
                    <option value="Normal">Normal SLA (Balance Service + Cost + Risk)</option>
                    <option value="High / Priority Shipment">High / Priority Shipment (Max OTP & Zero Claims)</option>
                    <option value="Cost-Sensitive">Cost-Sensitive (Lowest Contract Rate)</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleEvaluateCarriersInTab}
                    disabled={carrierSelLoading}
                    className="w-full bg-sky-600 hover:bg-sky-500 active:scale-98 text-white font-bold text-xs py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all shadow-lg shadow-sky-950 border border-sky-400/30"
                  >
                    {carrierSelLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        <span>Evaluating S/4HANA Rates...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>Find Best Carrier for Load</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Carrier Evaluation Table & Breakdown */}
            {carrierSelResult && (
              <div className="space-y-4 pt-2">
                {/* Summary Table */}
                <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
                  <table className="w-full text-left text-xs text-slate-200 font-sans border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                        <th className="py-2.5 px-3">Carrier</th>
                        <th className="py-2.5 px-3">Cost</th>
                        <th className="py-2.5 px-3 text-center">On-Time %</th>
                        <th className="py-2.5 px-3 text-center">Acceptance</th>
                        <th className="py-2.5 px-3">Recommendation</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {carrierSelResult.candidates.map((c: any, idx: number) => {
                        const isBest = c.recommendationBadge === 'Best' || c.recommendationBadge === 'Best for priority shipment';
                        return (
                          <tr key={idx} className={`hover:bg-slate-800/40 transition-colors ${isBest ? 'bg-sky-950/20' : ''}`}>
                            <td className="py-3 px-3 font-sans font-bold text-slate-100 flex items-center space-x-2">
                              <span>{c.carrierName}</span>
                              {isBest && <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                            </td>
                            <td className="py-3 px-3 font-bold text-slate-100">{c.costFormatted}</td>
                            <td className="py-3 px-3 text-center font-bold text-emerald-400">{c.onTimePercentage}%</td>
                            <td className="py-3 px-3 text-center font-bold text-sky-400">{c.tenderAcceptancePercentage}%</td>
                            <td className="py-3 px-3 font-sans">
                              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                                c.recommendationBadge === 'Best' ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800' :
                                c.recommendationBadge === 'Best for priority shipment' ? 'bg-sky-950/80 text-sky-300 border-sky-800' :
                                'bg-amber-950/80 text-amber-300 border-amber-800'
                              }`}>
                                {c.recommendationTag}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right font-sans">
                              <button
                                onClick={async () => {
                                  setActionRunning(true);
                                  try {
                                    const res = await tmService.executeAutonomousTmAction('assign_carrier', {
                                      freightOrderId: carrierSelResult.loadQuery,
                                      carrierId: c.carrierName
                                    });
                                    setActionFeedback(`Assigned ${c.carrierName} to ${carrierSelResult.loadQuery} in S/4HANA (Ref: ${res.impactedDocumentId})`);
                                  } catch (err: any) {
                                    setActionFeedback(`Error: ${err.message}`);
                                  } finally {
                                    setActionRunning(false);
                                  }
                                }}
                                disabled={actionRunning}
                                className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-[10px] py-1 px-2.5 rounded-lg transition-all shadow border border-sky-400/30 whitespace-nowrap active:scale-95"
                              >
                                Assign Carrier
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Candidate Detailed Breakdown Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {carrierSelResult.candidates.map((c: any, idx: number) => (
                    <div key={idx} className="bg-slate-900 border border-slate-800 p-3 rounded-xl space-y-2 text-xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-bold text-slate-100 block">{c.carrierName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">Vendor: {c.s4HanaVendorId}</span>
                        </div>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          c.riskLevel === 'Low' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}>
                          {c.riskLevel} Risk
                        </span>
                      </div>

                      <div className="space-y-1 text-[11px] text-slate-300 border-t border-slate-800/80 pt-2 font-mono">
                        <div className="flex justify-between"><span className="text-slate-400 font-sans">Rate Tariff:</span> <strong className="text-slate-200">{c.rateType} ({c.costFormatted})</strong></div>
                        <div className="flex justify-between"><span className="text-slate-400 font-sans">Claim History:</span> <strong className="text-slate-200">{c.claimHistory}</strong></div>
                        <div className="flex justify-between"><span className="text-slate-400 font-sans">Capacity:</span> <strong className="text-slate-200">{c.capacityStatus}</strong></div>
                        <div className="flex justify-between"><span className="text-slate-400 font-sans">Customer SLA:</span> <strong className="text-slate-200">{c.customerSlaFit}</strong></div>
                      </div>

                      <p className="text-[10px] text-slate-400 italic bg-slate-950 p-2 rounded border border-slate-800">
                        "{c.optimizationReason}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: Autonomous Load Consolidation */}
        {activeTab === 'loadConsolidation' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Autonomous SAP TM Load Consolidation Engine
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Evaluates Origin, Destination, Route Compatibility, Delivery Dates, Weight, Volume, Equipment Capacity & Carrier Limits.
                </p>
              </div>
            </div>

            {/* Input Controls */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1">Outbound Shipments Location / Filter Query</label>
                  <input
                    type="text"
                    value={consolidationQuery}
                    onChange={(e) => setConsolidationQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 font-mono focus:border-emerald-500 focus:outline-none"
                    placeholder="Today's Outbound Shipments or Plant 1010 Hamburg"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleConsolidateInTab}
                    disabled={consolidationLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold text-xs py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all shadow-lg shadow-emerald-950 border border-emerald-400/30"
                  >
                    {consolidationLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        <span>Evaluating S/4HANA TM...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>Run Load Consolidation</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Consolidation Result Display */}
            {consolidationResult && (
              <div className="space-y-4 pt-2">
                {/* Proposal Summary Box */}
                <div className="bg-emerald-950/40 border border-emerald-500/30 p-3.5 rounded-xl space-y-2">
                  <div className="flex items-center space-x-2 text-emerald-300 font-bold text-xs">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>AI Consolidation Proposal</span>
                  </div>
                  <p className="text-xs text-slate-200 font-sans leading-relaxed">
                    {consolidationResult.proposalSummary}
                  </p>
                </div>

                {/* Key Metrics Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Freight Units</span>
                    <span className="text-base font-black font-mono text-sky-400">{consolidationResult.freightUnitsCount} FUs</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Planned Before</span>
                    <span className="text-base font-black font-mono text-rose-400">{consolidationResult.initialPlannedTrucks} Trucks (LTL)</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Optimized Plan</span>
                    <span className="text-base font-black font-mono text-emerald-400">{consolidationResult.optimizedTrucks} FTL Trucks</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Estimated Savings</span>
                    <span className="text-base font-black font-mono text-amber-300">{consolidationResult.estimatedSavingsPercent}% ({consolidationResult.estimatedSavingsAmount})</span>
                  </div>
                </div>

                {/* Evaluation Criteria Details */}
                {consolidationResult.evaluationCriteria && (
                  <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-2 text-xs">
                    <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px] block border-b border-slate-800 pb-1">
                      Evaluated S/4HANA Operational Factors
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-slate-300">
                      <div><span className="text-slate-400 font-sans">Origin:</span> {consolidationResult.evaluationCriteria.origin}</div>
                      <div><span className="text-slate-400 font-sans">Destination:</span> {consolidationResult.evaluationCriteria.destination}</div>
                      <div><span className="text-slate-400 font-sans">Route Compatibility:</span> <strong className="text-emerald-400">{consolidationResult.evaluationCriteria.routeCompatibility}</strong></div>
                      <div><span className="text-slate-400 font-sans">Requested Dates:</span> {consolidationResult.evaluationCriteria.requestedDeliveryDates}</div>
                      <div><span className="text-slate-400 font-sans">Weight:</span> {consolidationResult.evaluationCriteria.totalWeightKg}</div>
                      <div><span className="text-slate-400 font-sans">Volume:</span> {consolidationResult.evaluationCriteria.totalVolumeM3}</div>
                      <div><span className="text-slate-400 font-sans">Equipment Capacity:</span> {consolidationResult.evaluationCriteria.equipmentCapacity}</div>
                      <div><span className="text-slate-400 font-sans">Carrier Limits:</span> {consolidationResult.evaluationCriteria.carrierLimits}</div>
                    </div>
                  </div>
                )}

                {/* Consolidated FTL Cards */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Optimized Consolidated Full Truckload (FTL) Schedule</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {consolidationResult.consolidatedPlan.map((c: any, idx: number) => (
                      <div key={idx} className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-2 text-xs">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-bold text-sky-300 block">{c.consolidatedOrderId}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{c.truckType}</span>
                          </div>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                            {c.utilizationPercent}% Payload Utilized
                          </span>
                        </div>

                        <div className="space-y-1 text-[11px] font-mono text-slate-300 border-t border-slate-800 pt-2">
                          <div className="flex justify-between"><span className="text-slate-400 font-sans">Combined Units:</span> <span className="text-slate-100 font-bold">{c.freightUnits.join(', ')}</span></div>
                          <div className="flex justify-between"><span className="text-slate-400 font-sans">Weight & Vol:</span> <span>{c.weightKg.toLocaleString()} KG | {c.volumeM3} M³</span></div>
                          <div className="flex justify-between"><span className="text-slate-400 font-sans">Route:</span> <span>{c.route}</span></div>
                          <div className="flex justify-between"><span className="text-slate-400 font-sans">SLA Commitment:</span> <span className="text-emerald-400">{c.deliveryDateSla}</span></div>
                          <div className="flex justify-between"><span className="text-slate-400 font-sans">Assigned Carrier:</span> <span className="text-sky-300">{c.carrierAssigned}</span></div>
                          <div className="flex justify-between"><span className="text-slate-400 font-sans">Consolidated Rate:</span> <strong className="text-amber-300">{c.estimatedCost}</strong></div>
                        </div>

                        <button
                          onClick={async () => {
                            setActionRunning(true);
                            try {
                              const res = await tmService.executeAutonomousTmAction('consolidate_freight_units', {
                                freightOrderId: c.consolidatedOrderId,
                                carrierId: c.carrierAssigned
                              });
                              setActionFeedback(`Posted Consolidated Freight Order ${c.consolidatedOrderId} to S/4HANA TM (Ref: ${res.impactedDocumentId})`);
                            } catch (err: any) {
                              setActionFeedback(`Error: ${err.message}`);
                            } finally {
                              setActionRunning(false);
                            }
                          }}
                          disabled={actionRunning}
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 px-3 rounded-lg transition-all shadow-lg border border-emerald-400/30 mt-2 flex items-center justify-center space-x-1.5 active:scale-98"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                          <span>Execute Consolidation in S/4HANA TM</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: Transportation Cost Intelligence */}
        {activeTab === 'costIntelligence' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  SAP TM Transportation Cost Intelligence & Opportunity Engine
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Analyze spend drivers, expensive lanes, carrier accessorials, detention fees, empty miles, cube utilization, LTL-to-FTL, and dedicated fleets.
                </p>
              </div>
            </div>

            {/* Quick Interactive Question Buttons */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Ask Cost Intelligence (Click to Analyze S/4HANA TM Data):
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  "Why did freight cost increase this month?",
                  "Which lanes are most expensive?",
                  "Which carriers generate the most accessorial charges?",
                  "Which shipments caused detention fees?",
                  "Where are we paying for empty miles?",
                  "Which loads have poor cube utilization?",
                  "Where can we move from LTL to FTL?",
                  "Which lanes are candidates for dedicated transportation?"
                ].map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCostIntelQuery(q);
                      handleAnalyzeCostIntelInTab(q);
                    }}
                    disabled={costIntelLoading}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all font-sans text-left ${
                      costIntelQuery === q
                        ? 'bg-amber-950 border-amber-500 text-amber-200 font-bold shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-amber-500/50 hover:bg-slate-900'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80">
                <input
                  type="text"
                  value={costIntelQuery}
                  onChange={(e) => setCostIntelQuery(e.target.value)}
                  className="sm:col-span-3 bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 font-mono focus:border-amber-500 focus:outline-none"
                  placeholder="Custom cost intelligence question..."
                />
                <button
                  onClick={() => handleAnalyzeCostIntelInTab()}
                  disabled={costIntelLoading}
                  className="bg-amber-600 hover:bg-amber-500 active:scale-98 text-white font-bold text-xs py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all shadow-lg border border-amber-400/30"
                >
                  {costIntelLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-3.5 h-3.5 text-amber-200" />
                      <span>Run Cost Analysis</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Cost Intelligence Result Display */}
            {costIntelResult && (
              <div className="space-y-4 pt-2">
                {/* Executive Summary */}
                <div className="bg-amber-950/40 border border-amber-500/30 p-3.5 rounded-xl space-y-1.5">
                  <div className="flex items-center space-x-2 text-amber-300 font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>AI Executive Cost Intelligence Insight</span>
                  </div>
                  <p className="text-xs text-slate-200 font-sans leading-relaxed">
                    {costIntelResult.executiveSummary}
                  </p>
                </div>

                {/* Key Spend Summary Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Monthly Spend</span>
                    <span className="text-base font-black font-mono text-slate-100">{costIntelResult.totalMonthlyFreightSpend}</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">MoM Spend Spike</span>
                    <span className="text-base font-black font-mono text-rose-400">{costIntelResult.monthOverMonthChange}</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center col-span-2 sm:col-span-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Savings Opportunities</span>
                    <span className="text-base font-black font-mono text-emerald-400">{costIntelResult.totalPotentialSavings}</span>
                  </div>
                </div>

                {/* Cost Increase Primary Drivers */}
                {costIntelResult.costIncreaseAnalysis && (
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      Cost Spike Primary Drivers (+{costIntelResult.costIncreaseAnalysis.monthOverMonthChangePercent}% MoM)
                    </h4>
                    <div className="space-y-2">
                      {costIntelResult.costIncreaseAnalysis.primaryDrivers.map((driver: any, idx: number) => (
                        <div key={idx} className="bg-slate-950 border border-slate-800/80 p-2.5 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-200 block">{driver.factor}</span>
                            <p className="text-[11px] text-slate-400">{driver.description}</p>
                          </div>
                          <div className="flex items-center space-x-3 self-end sm:self-center shrink-0 font-mono">
                            <span className="text-rose-400 font-bold">{driver.impactAmount}</span>
                            <span className="bg-rose-950 text-rose-300 text-[10px] px-2 py-0.5 rounded border border-rose-800 font-bold">{driver.percentageContribution}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Most Expensive Lanes */}
                {costIntelResult.mostExpensiveLanes && costIntelResult.mostExpensiveLanes.length > 0 && (
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Top Expensive Freight Lanes</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-sans">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                            <th className="pb-2">Lane</th>
                            <th className="pb-2">Route</th>
                            <th className="pb-2">Total Spend</th>
                            <th className="pb-2">Cost/Mile</th>
                            <th className="pb-2">Volume</th>
                            <th className="pb-2">Carrier</th>
                            <th className="pb-2 text-right">Trend</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                          {costIntelResult.mostExpensiveLanes.map((lane: any, idx: number) => (
                            <tr key={idx} className="hover:bg-slate-800/40">
                              <td className="py-2 font-bold text-sky-400">{lane.laneId}</td>
                              <td className="py-2 text-slate-300">{lane.origin} &rarr; {lane.destination}</td>
                              <td className="py-2 font-bold text-slate-100">{lane.totalSpend}</td>
                              <td className="py-2 text-amber-300">{lane.costPerMile}</td>
                              <td className="py-2 text-slate-300">{lane.volumeShipments} loads</td>
                              <td className="py-2 text-slate-300">{lane.primaryCarrier}</td>
                              <td className="py-2 text-right font-bold text-rose-400">{lane.trend}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Carrier Accessorials */}
                {costIntelResult.accessorialChargesByCarrier && (
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Accessorial Charges by Carrier</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {costIntelResult.accessorialChargesByCarrier.map((c: any, idx: number) => (
                        <div key={idx} className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-200">{c.carrierName}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${c.riskRating === 'High' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-slate-800 text-slate-300'}`}>
                              {c.riskRating} Risk
                            </span>
                          </div>
                          <div className="flex justify-between text-slate-400 font-mono text-[11px]">
                            <span>Accessorials: <strong className="text-rose-400">{c.totalAccessorials}</strong></span>
                            <span>Fuel: <strong className="text-amber-300">{c.fuelSurcharge}</strong></span>
                          </div>
                          <div className="grid grid-cols-3 gap-1 pt-1 text-[10px] font-mono text-center border-t border-slate-800">
                            <div className="bg-slate-900 p-1 rounded">Detention: <strong className="text-rose-300">{c.detentionShare}</strong></div>
                            <div className="bg-slate-900 p-1 rounded">Layover: <strong className="text-amber-300">{c.layoverShare}</strong></div>
                            <div className="bg-slate-900 p-1 rounded">Reconsignment: <strong className="text-sky-300">{c.reconsignmentShare}</strong></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Detention Fee Shipments */}
                {costIntelResult.detentionFeeShipments && (
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Detention Fee Shipments</h4>
                    <div className="space-y-2">
                      {costIntelResult.detentionFeeShipments.map((d: any, idx: number) => (
                        <div key={idx} className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="space-y-0.5">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-sky-400 font-mono">{d.freightOrderId}</span>
                              <span className="text-slate-400 font-sans">({d.carrierName})</span>
                            </div>
                            <p className="text-[11px] text-slate-300"><strong className="text-slate-400">Facility:</strong> {d.location} | <strong className="text-slate-400">Cause:</strong> {d.rootCause}</p>
                          </div>
                          <div className="flex items-center space-x-3 self-end sm:self-center shrink-0 font-mono text-[11px]">
                            <span className="text-amber-300">{d.dwellTimeHours}h Dwell</span>
                            <span className="text-rose-400 font-bold bg-rose-950 px-2 py-0.5 rounded border border-rose-800">{d.feeAmount}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty Miles */}
                {costIntelResult.emptyMilesAnalysis && (
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Empty Miles & Deadhead Waste</h4>
                    <div className="space-y-2">
                      {costIntelResult.emptyMilesAnalysis.map((em: any, idx: number) => (
                        <div key={idx} className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-200">{em.routeRegion}</span>
                            <span className="text-rose-400 font-mono font-bold">{em.wastedCost} Waste</span>
                          </div>
                          <p className="text-[11px] text-slate-400 font-mono">
                            Deadhead: <strong className="text-rose-300">{em.deadheadMiles} mi ({em.emptyMilesPercent}%)</strong> | Carrier: {em.carrierName}
                          </p>
                          <p className="text-[11px] text-emerald-300 bg-emerald-950/60 p-1.5 rounded border border-emerald-900">
                            <strong className="text-emerald-400">Backhaul Fix:</strong> {em.repositioningOpportunity}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Poor Cube Utilization */}
                {costIntelResult.poorCubeUtilizationLoads && (
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Poor Cube Utilization Loads</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {costIntelResult.poorCubeUtilizationLoads.map((pc: any, idx: number) => (
                        <div key={idx} className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs space-y-1.5">
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-sky-400 font-mono">{pc.freightOrderId}</span>
                            <span className="bg-rose-950 text-rose-300 text-[10px] font-mono px-2 py-0.5 rounded border border-rose-800 font-bold">
                              {pc.cubeUtilPercent}% Cube Fill
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300">{pc.originDest}</p>
                          <p className="text-[11px] text-amber-200 bg-amber-950/40 p-1.5 rounded border border-amber-900">
                            {pc.recommendation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* LTL to FTL Candidates */}
                {costIntelResult.ltlToFtlCandidates && (
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">LTL to FTL Conversion Opportunities</h4>
                    <div className="space-y-2">
                      {costIntelResult.ltlToFtlCandidates.map((ltl: any, idx: number) => (
                        <div key={idx} className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-200 block">{ltl.lane}</span>
                            <p className="text-[11px] text-slate-400 font-mono">
                              {ltl.weeklyLtlShipments} LTL/wk | Current: {ltl.avgLtlSpendPerWeek}/wk | Est FTL: {ltl.estimatedFtlCostPerWeek}/wk
                            </p>
                          </div>
                          <span className="bg-emerald-950 text-emerald-300 font-mono font-bold text-xs px-2.5 py-1 rounded border border-emerald-800 shrink-0">
                            Save {ltl.annualSavingsPotential} / yr
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dedicated Transportation Candidates */}
                {costIntelResult.dedicatedLaneCandidates && (
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Dedicated Transportation Lane Candidates</h4>
                    <div className="space-y-2">
                      {costIntelResult.dedicatedLaneCandidates.map((ded: any, idx: number) => (
                        <div key={idx} className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-200">{ded.lane}</span>
                            <span className="bg-amber-950 text-amber-300 text-xs font-mono font-bold px-2 py-0.5 rounded border border-amber-800">
                              Save {ded.monthlySavings}
                            </span>
                          </div>
                          <p className="text-[11px] text-emerald-300 bg-emerald-950/40 p-1.5 rounded border border-emerald-900"><strong className="text-emerald-400">Recommendation:</strong> {ded.recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Automated Opportunities with Execution Buttons */}
                {costIntelResult.automatedOpportunities && (
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      Automated Cost Reduction Opportunities (S/4HANA TM Direct Execution)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {costIntelResult.automatedOpportunities.map((opp: any, idx: number) => (
                        <div key={idx} className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-2 text-xs">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-bold text-slate-100 block">{opp.title}</span>
                              <span className="text-[10px] text-slate-400 uppercase font-mono">{opp.category}</span>
                            </div>
                            <span className="bg-emerald-950 text-emerald-300 font-mono font-bold text-[11px] px-2 py-0.5 rounded border border-emerald-800">
                              {opp.potentialAnnualSavings}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-300 leading-relaxed">
                            {opp.description}
                          </p>

                          <button
                            onClick={async () => {
                              setActionRunning(true);
                              try {
                                const res = await tmService.executeAutonomousTmAction(opp.actionType, {
                                  freightOrderId: 'FO-60098120',
                                  carrierId: 'DHL Global Forwarding'
                                });
                                setActionFeedback(`Executed ${opp.title} in S/4HANA TM (Doc Ref: ${res.impactedDocumentId}). Savings locked in.`);
                              } catch (err: any) {
                                setActionFeedback(`Execution error: ${err.message}`);
                              } finally {
                                setActionRunning(false);
                              }
                            }}
                            disabled={actionRunning}
                            className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs py-2 px-3 rounded-lg transition-all shadow-lg border border-amber-400/30 mt-2 flex items-center justify-center space-x-1.5 active:scale-98"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                            <span>Execute Opportunity in S/4HANA TM</span>
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

        {/* Tab: Predictive Transportation AI (11 Vectors) */}
        {activeTab === 'predictiveAi' && (
          <div className="space-y-4">
            {/* Header & Search Bar */}
            <div className="bg-slate-900/90 border border-purple-500/30 p-4 rounded-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2.5">
                  <Cpu className="w-5 h-5 text-purple-400 animate-pulse" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                      SAP TM Predictive Transportation AI Cockpit
                    </h3>
                    <p className="text-xs text-slate-400">
                      Predictive Evaluation across 11 Risk Vectors • Correlated with Live S/4HANA TM, EWM, SD & GTS Records
                    </p>
                  </div>
                </div>
                <span className="bg-purple-950 text-purple-300 text-xs font-mono font-bold px-3 py-1 rounded-lg border border-purple-800 self-start sm:self-auto">
                  S/4HANA VSR TELEMATICS ENGINE
                </span>
              </div>

              {/* Input & Action */}
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={predictiveQuery}
                    onChange={(e) => setPredictiveQuery(e.target.value)}
                    placeholder="Enter shipment ID, corridor lane, port or query (e.g. Freight Order FO-900123)..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
                <button
                  onClick={() => handleAnalyzePredictiveAiInTab()}
                  disabled={predictiveLoading}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs py-2 px-4 rounded-lg transition-all shadow-lg border border-purple-400/30 shrink-0 w-full sm:w-auto flex items-center justify-center space-x-1.5 active:scale-95"
                >
                  <Cpu className="w-3.5 h-3.5 text-purple-200" />
                  <span>{predictiveLoading ? 'Evaluating AI Models...' : 'Run 11-Vector Assessment'}</span>
                </button>
              </div>

              {/* Preset Query Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1 text-[11px]">
                <span className="text-slate-400 font-bold self-center mr-1">Sample Queries:</span>
                {[
                  "FO-900123 Delivery & Dock Capacity",
                  "Late Pickups & Staging Queues",
                  "Carrier Rejection & Tendering Lead Times",
                  "Port of Hamburg Vessel Congestion",
                  "Demurrage & Detention Penalties",
                  "Missed Customer SLAs (BMW AG)"
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setPredictiveQuery(chip);
                      handleAnalyzePredictiveAiInTab(chip);
                    }}
                    className="bg-slate-950 hover:bg-purple-950/80 text-purple-300 border border-purple-900/60 hover:border-purple-500/60 px-2.5 py-1 rounded-full transition-all font-mono text-[10px]"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Display */}
            {predictiveLoading ? (
              <div className="p-8 bg-slate-900 border border-slate-800 rounded-xl text-center space-y-2">
                <RefreshCw className="w-6 h-6 text-purple-400 animate-spin mx-auto" />
                <p className="text-xs text-slate-300 font-mono">Running S/4HANA TM Predictive AI Model Inference across 11 Risk Categories...</p>
              </div>
            ) : predictiveResult && (
              <div className="space-y-4">
                {/* Metric Cards Banner */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Overall System Risk</span>
                    <span className="text-xl font-black font-mono text-amber-400">{predictiveResult.overallSystemRiskScore} / 100</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Risk Vectors</span>
                    <span className="text-xl font-black font-mono text-slate-100">{predictiveResult.totalPredictedRisksCount}</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Critical Alerts</span>
                    <span className="text-xl font-black font-mono text-rose-400">{predictiveResult.criticalAlertsCount}</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Est. Financial Risk</span>
                    <span className="text-xl font-black font-mono text-purple-300">{predictiveResult.estimatedTotalFinancialRisk}</span>
                  </div>
                </div>

                {/* 11 Prediction Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {predictiveResult.predictions.map((p: any, idx: number) => (
                    <div key={idx} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2.5 hover:border-purple-500/40 transition-all text-xs">
                      {/* Top Bar */}
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-purple-300 uppercase tracking-wider">{p.categoryLabel}</span>
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                              p.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                              p.severity === 'HIGH' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                              'bg-sky-950 text-sky-300 border border-sky-800'
                            }`}>
                              {p.severity}
                            </span>
                          </div>
                          <span className="font-mono font-bold text-slate-100 block text-xs mt-0.5">{p.targetObject}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-lg font-black font-mono text-amber-400">{p.probabilityPct}%</span>
                          <span className="text-[10px] text-slate-400 block uppercase font-mono">Risk Probability</span>
                        </div>
                      </div>

                      {/* Probability Bar */}
                      <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                        <div 
                          className={`h-full ${p.probabilityPct >= 90 ? 'bg-rose-500' : p.probabilityPct >= 80 ? 'bg-amber-500' : 'bg-sky-500'}`} 
                          style={{ width: `${p.probabilityPct}%` }}
                        />
                      </div>

                      {/* Details Box */}
                      <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                        {p.details}
                      </p>

                      {/* Financial Impact & Lineage */}
                      <div className="space-y-1 text-[11px] pt-1">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Financial Impact:</span>
                          <span className="text-rose-400 font-mono font-bold">{p.impactCostEstimated}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Cross-Module Flow:</span>
                          <span className="text-sky-300 font-mono text-[10px]">{p.crossModuleCorrelation}</span>
                        </div>
                      </div>

                      {/* AI Recommendation */}
                      <div className="bg-purple-950/40 border border-purple-900/60 p-2.5 rounded-lg space-y-1">
                        <span className="text-[10px] uppercase font-bold text-purple-300 block">AI Recommended Action:</span>
                        <p className="text-[11px] text-slate-200">{p.recommendedAction}</p>
                      </div>

                      {/* Action Execution Button */}
                      <button
                        onClick={async () => {
                          setActionRunning(true);
                          try {
                            const res = await tmService.executeAutonomousTmAction(p.actionType, p.actionPayload);
                            setActionFeedback(`[AUTO-RESOLVED] ${p.categoryLabel}: ${res.actionResultDetails} (Ref: ${res.impactedDocumentId})`);
                          } catch (err: any) {
                            setActionFeedback(`Mitigation error: ${err.message}`);
                          } finally {
                            setActionRunning(false);
                          }
                        }}
                        disabled={actionRunning}
                        className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs py-2 px-3 rounded-lg transition-all shadow border border-purple-400/30 flex items-center justify-center space-x-1.5 active:scale-98"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                        <span>Execute Risk Mitigation in S/4HANA TM</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: Autonomous Tendering Cascade */}
        {activeTab === 'autonomousTendering' && (
          <div className="space-y-4">
            {/* Header & Search Bar */}
            <div className="bg-slate-900/90 border border-sky-500/30 p-4 rounded-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2.5">
                  <Share2 className="w-5 h-5 text-sky-400 animate-pulse" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                      SAP TM Autonomous Tendering & Cascade Cockpit
                    </h3>
                    <p className="text-xs text-slate-400">
                      Freight Order → Preferred Carrier → Tender → Carrier Response → Alternate Carrier → Re-tender → Confirm Capacity
                    </p>
                  </div>
                </div>
                <span className="bg-sky-950 text-sky-300 text-xs font-mono font-bold px-3 py-1 rounded-lg border border-sky-800 self-start sm:self-auto">
                  S/4HANA TM WATERFALL ENGINE
                </span>
              </div>

              {/* Input & Action */}
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={tenderingFoQuery}
                    onChange={(e) => setTenderingFoQuery(e.target.value)}
                    placeholder="Enter Freight Order ID (e.g. FO-900142, FO-900123, FO-60098120)..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
                <button
                  onClick={() => handleAnalyzeTenderingInTab()}
                  disabled={tenderingLoading}
                  className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs py-2 px-4 rounded-lg transition-all shadow-lg border border-sky-400/30 shrink-0 w-full sm:w-auto flex items-center justify-center space-x-1.5 active:scale-95"
                >
                  <Share2 className="w-3.5 h-3.5 text-sky-200" />
                  <span>{tenderingLoading ? 'Evaluating Cascade...' : 'Load Tendering Cascade'}</span>
                </button>
              </div>

              {/* Sample Queries */}
              <div className="flex flex-wrap gap-1.5 pt-1 text-[11px]">
                <span className="text-slate-400 font-bold self-center mr-1">Sample Freight Orders:</span>
                {["FO-900142", "FO-900123", "FO-60098120", "FO-900115"].map((fo, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setTenderingFoQuery(fo);
                      handleAnalyzeTenderingInTab(fo);
                    }}
                    className="bg-slate-950 hover:bg-sky-950/80 text-sky-300 border border-sky-900/60 hover:border-sky-500/60 px-2.5 py-1 rounded-full transition-all font-mono text-[10px]"
                  >
                    {fo}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Display */}
            {tenderingLoading ? (
              <div className="p-8 bg-slate-900 border border-slate-800 rounded-xl text-center space-y-2">
                <RefreshCw className="w-6 h-6 text-sky-400 animate-spin mx-auto" />
                <p className="text-xs text-slate-300 font-mono">Querying S/4HANA TM Carrier Tendering Waterfall Engine...</p>
              </div>
            ) : tenderingResult && (
              <div className="space-y-4">
                {/* Metric Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Target Freight Order</span>
                    <span className="text-lg font-black font-mono text-sky-300">{tenderingResult.targetFreightOrder}</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Cascades</span>
                    <span className="text-lg font-black font-mono text-slate-100">{tenderingResult.totalCascadesActive} Orders</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Auto Re-Tendered</span>
                    <span className="text-lg font-black font-mono text-amber-400">{tenderingResult.autoReTenderedCount}</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Cost Cap Threshold</span>
                    <span className="text-lg font-black font-mono text-emerald-400">+{tenderingResult.costThresholdCapPct}% Max</span>
                  </div>
                </div>

                {/* Flowchart Visual Step Diagram */}
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-sky-300">
                      Autonomous Carrier Tendering Waterfall Diagram
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">S/4HANA TM API_FREIGHTORDER_SRV</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                    {tenderingResult.workflowFlowchart?.map((s: any) => (
                      <div key={s.stepNumber} className={`p-2.5 rounded-lg border text-xs space-y-1 ${
                        s.status === 'COMPLETED' ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200' :
                        s.status === 'IN_PROGRESS' ? 'bg-sky-950/60 border-sky-600 text-sky-100 animate-pulse' :
                        'bg-slate-950 border-slate-800 text-slate-500'
                      }`}>
                        <div className="flex justify-between items-center">
                          <span className="font-mono font-bold text-[10px]">Step {s.stepNumber}</span>
                          <span className="text-[9px] uppercase font-bold px-1 rounded bg-slate-900">{s.status}</span>
                        </div>
                        <p className="font-bold text-[11px] leading-tight">{s.stepName}</p>
                        <p className="text-[10px] text-slate-400 leading-tight">{s.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tendering Cascades Details */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Active Freight Order Carrier Tendering Cascades
                  </h4>
                  {tenderingResult.tenderingCascades?.map((c: any, idx: number) => (
                    <div key={idx} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3 hover:border-sky-500/40 transition-all text-xs">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800/80 pb-2.5">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-black text-sky-300 text-sm">{c.foId}</span>
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              c.currentStatus === 'CAPACITY_CONFIRMED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                              c.currentStatus === 'RE_TENDERED_ALTERNATE' ? 'bg-sky-950 text-sky-300 border border-sky-800' :
                              c.currentStatus === 'REJECTED_AUTO_CASCADE' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                              'bg-slate-950 text-slate-300 border border-slate-800'
                            }`}>
                              {c.currentStatusLabel}
                            </span>
                          </div>
                          <p className="text-slate-300 text-xs font-semibold mt-0.5">{c.originDestination} • Dep: {c.plannedDeparture}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-slate-400 text-[10px] uppercase block font-mono">Baseline Rate</span>
                          <span className="font-mono font-black text-slate-100 text-sm">{c.baselineContractRate}</span>
                        </div>
                      </div>

                      {/* Rank 1 vs Alternates */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                        {/* Preferred Carrier */}
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-amber-300">Rank 1 Preferred Carrier</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              c.preferredCarrier.status === 'ACCEPTED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                              c.preferredCarrier.status === 'REJECTED' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-slate-900 text-slate-400'
                            }`}>
                              {c.preferredCarrier.status}
                            </span>
                          </div>
                          <p className="font-bold text-slate-100">{c.preferredCarrier.name} ({c.preferredCarrier.carrierId})</p>
                          <div className="flex justify-between text-slate-400">
                            <span>Contracted Rate: <span className="font-mono text-slate-200 font-bold">{c.preferredCarrier.rate}</span></span>
                            <span>Response SLA: {c.preferredCarrier.responseSlaHours} Hours</span>
                          </div>
                          {c.preferredCarrier.rejectionReason && (
                            <p className="text-rose-400 text-[10px] italic bg-rose-950/30 p-1.5 rounded border border-rose-900/50">
                              Rejection Notice: {c.preferredCarrier.rejectionReason}
                            </p>
                          )}
                        </div>

                        {/* Alternate Carriers */}
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                          <span className="font-bold text-sky-300 block">Alternate Carriers (Waterfall Re-Tender Matrix)</span>
                          {c.alternateCarriers.map((alt: any, aIdx: number) => (
                            <div key={aIdx} className="flex justify-between items-center border-t border-slate-900 pt-1.5 text-[10px]">
                              <div>
                                <span className="font-bold text-slate-200">Rank {alt.rank}: {alt.name}</span>
                                <span className="text-slate-400 block font-mono">{alt.rate} (+{alt.variancePct}% vs baseline)</span>
                              </div>
                              <div className="text-right space-y-0.5">
                                <span className={`px-2 py-0.5 rounded font-mono font-bold block text-[9px] ${
                                  alt.status === 'CONFIRMED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                                  alt.status === 'RE_TENDERED' ? 'bg-sky-950 text-sky-300 border border-sky-800 animate-pulse' :
                                  alt.status === 'EXCEEDS_THRESHOLD' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                                  'bg-slate-900 text-slate-400'
                                }`}>
                                  {alt.status}
                                </span>
                                <span className="text-[9px] font-mono text-slate-400 block">
                                  {alt.withinCostThreshold ? '✓ Within +10% Cap' : '✕ Exceeds Cap'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Log & Action */}
                      <div className="bg-sky-950/30 border border-sky-900/50 p-2.5 rounded-lg space-y-1 text-[11px]">
                        <span className="text-[10px] uppercase font-bold text-sky-300 block">S/4HANA TM Autonomous Log</span>
                        <p className="text-slate-200 font-mono">{c.lastActionLog}</p>
                      </div>

                      <button
                        onClick={async () => {
                          setActionRunning(true);
                          try {
                            const res = await tmService.executeAutonomousTmAction('change_carrier', { freightOrderId: c.foId, carrierId: c.alternateCarriers[0]?.name || 'Kuehne+Nagel Logistics' });
                            setActionFeedback(`[AUTO-RETENDERED] Triggered re-tender cascade for ${c.foId} in S/4HANA TM. Tender document ${c.activeTenderDocId} issued.`);
                          } catch (err: any) {
                            setActionFeedback(`Re-tender error: ${err.message}`);
                          } finally {
                            setActionRunning(false);
                          }
                        }}
                        disabled={actionRunning}
                        className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs py-2 px-3 rounded-lg transition-all shadow border border-sky-400/30 flex items-center justify-center space-x-1.5 active:scale-98"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                        <span>Trigger Autonomous Re-Tendering Cascade for {c.foId}</span>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Approved Carrier Ranking Matrix */}
                {tenderingResult.approvedCarrierRankings && (
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
                      <span>Approved Carrier Ranking Matrix per Lane</span>
                      <span className="text-[10px] font-mono text-slate-400 font-normal">S/4HANA TM Contract Tariffs</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {tenderingResult.approvedCarrierRankings.map((lane: any, lIdx: number) => (
                        <div key={lIdx} className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2 text-xs">
                          <span className="font-bold text-sky-300 block">{lane.laneName} ({lane.laneId})</span>
                          <div className="space-y-1.5">
                            {lane.rankings.map((r: any, rIdx: number) => (
                              <div key={rIdx} className="flex justify-between items-center bg-slate-900 p-2 rounded text-[11px]">
                                <div>
                                  <span className="font-bold text-slate-200">Rank {r.rank}: {r.carrierName}</span>
                                  <span className="text-slate-400 block text-[10px]">Agreed Rate: {r.agreedRate} • OTIF: {r.otifScorePct}%</span>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                  r.status === 'ACTIVE_CONTRACT' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                                  r.status === 'BACKUP_APPROVED' ? 'bg-sky-950 text-sky-300 border border-sky-800' :
                                  'bg-slate-950 text-slate-400 border border-slate-800'
                                }`}>
                                  {r.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab: Freight Settlement Intelligence */}
        {activeTab === 'freightSettlement' && (
          <div className="space-y-6">
            {/* Search and Prompt Shortcuts */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-400" />
                    S/4HANA Freight Settlement Intelligence &amp; Dispute Hub
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Correlating Freight Order → Charge Calculation (TCCS) → Settlement Doc (FSD) → Supplier Invoice (LIV) → FI Journal Entry
                  </p>
                </div>
                <button
                  onClick={() => handleAnalyzeSettlementInTab()}
                  disabled={settlementLoading}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-3 py-2 rounded-lg transition-all flex items-center space-x-1.5 shadow"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${settlementLoading ? 'animate-spin' : ''}`} />
                  <span>Run Live Settlement Audit</span>
                </button>
              </div>

              {/* Natural Language Prompt Shortcuts for all 7 questions */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Preset Natural Language Queries:</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Which freight invoices are blocked?",
                    "Why is this carrier invoice higher than expected?",
                    "Show freight settlement differences.",
                    "Which carriers have recurring invoice discrepancies?",
                    "Compare contracted rate with invoiced rate.",
                    "Show accessorial charges by carrier.",
                    "Which freight charges should be disputed?"
                  ].map((qText, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSettlementQuery(qText);
                        handleAnalyzeSettlementInTab(qText);
                      }}
                      className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-amber-300 text-[10px] font-medium px-2.5 py-1.5 rounded-lg transition-colors flex items-center space-x-1"
                    >
                      <span>{qText}</span>
                      <ArrowRight className="w-2.5 h-2.5 text-slate-500" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* KPI Cards */}
            {settlementResult?.summaryKPIs && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Evaluated Invoices</span>
                  <div className="text-xl font-bold text-slate-100">{settlementResult.summaryKPIs.totalInvoicesEvaluated}</div>
                  <span className="text-[10px] text-slate-400 font-mono">100% S/4HANA Correlated</span>
                </div>
                <div className="bg-rose-950/40 border border-rose-800/60 p-3 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-rose-300 block">Blocked Invoices</span>
                  <div className="text-xl font-bold text-rose-400">{settlementResult.summaryKPIs.totalBlockedInvoices}</div>
                  <span className="text-[10px] text-rose-300 font-mono">Payment Block R</span>
                </div>
                <div className="bg-amber-950/40 border border-amber-800/60 p-3 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-amber-300 block">Total Disputed</span>
                  <div className="text-xl font-bold text-amber-400">€{settlementResult.summaryKPIs.totalDisputedAmountEur.toLocaleString()}</div>
                  <span className="text-[10px] text-amber-300 font-mono">LIV Price Variances</span>
                </div>
                <div className="bg-purple-950/40 border border-purple-800/60 p-3 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-purple-300 block">Avg Rate Variance</span>
                  <div className="text-xl font-bold text-purple-400">+{settlementResult.summaryKPIs.avgVariancePct}%</div>
                  <span className="text-[10px] text-purple-300 font-mono">Invoiced vs Contracted</span>
                </div>
                <div className="bg-sky-950/40 border border-sky-800/60 p-3 rounded-xl space-y-1 col-span-2 md:col-span-1">
                  <span className="text-[10px] uppercase font-bold text-sky-300 block">Accessorial Spend</span>
                  <div className="text-xl font-bold text-sky-400">€{settlementResult.summaryKPIs.accessorialsTotalEur.toLocaleString()}</div>
                  <span className="text-[10px] text-sky-300 font-mono">FSC, Detention, Layover</span>
                </div>
              </div>
            )}

            {/* End-to-End Correlation Lineage Flow Diagram */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
                <span>End-to-End Freight Settlement Correlation Lineage</span>
                <span className="text-[10px] font-mono text-emerald-400">Live S/4HANA Document Chain</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-center">
                {[
                  { step: '1. Freight Order', doc: 'FO-800102', table: '/SCMTMS/D_TORROT', icon: '🚚', bg: 'bg-slate-950 border-sky-800 text-sky-300' },
                  { step: '2. Charge Calc', doc: 'CC-400192 (€2,040)', table: '/SCMTMS/D_TCSHEET', icon: '📊', bg: 'bg-slate-950 border-purple-800 text-purple-300' },
                  { step: '3. Settlement Doc', doc: 'FSD-700912', table: '/SCMTMS/D_SFRROT', icon: '🧾', bg: 'bg-slate-950 border-blue-800 text-blue-300' },
                  { step: '4. Carrier Invoice', doc: 'INV-2026-9041 (€2,480)', table: 'RBKP / RSEG', icon: '💶', bg: 'bg-slate-950 border-amber-800 text-amber-300' },
                  { step: '5. FI Journal Entry', doc: 'DOC-1900004521', table: 'BSEG / BKPF', icon: '🛑', bg: 'bg-slate-950 border-rose-800 text-rose-300' }
                ].map((st, i) => (
                  <div key={i} className={`p-2.5 rounded-lg border space-y-1 ${st.bg}`}>
                    <span className="text-[10px] font-bold block">{st.icon} {st.step}</span>
                    <span className="text-xs font-mono font-bold block text-white">{st.doc}</span>
                    <span className="text-[9px] text-slate-400 font-mono block">{st.table}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Blocked Freight Invoices Table */}
            {settlementResult?.blockedInvoices && settlementResult.blockedInvoices.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Blocked Freight Invoices (Payment Block R)</span>
                  <span className="text-[10px] font-mono text-slate-400 font-normal">
                    {settlementResult.blockedInvoices.length} Invoices Requiring Resolution
                  </span>
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                        <th className="pb-2">Invoice #</th>
                        <th className="pb-2">Freight Order</th>
                        <th className="pb-2">FSD #</th>
                        <th className="pb-2">Carrier</th>
                        <th className="pb-2">Billed / Expected</th>
                        <th className="pb-2">Variance</th>
                        <th className="pb-2">Block Reason</th>
                        <th className="pb-2">FI Doc #</th>
                        <th className="pb-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {settlementResult.blockedInvoices.map((inv: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-850/50 transition-colors">
                          <td className="py-2.5 font-bold text-amber-300">{inv.invoiceNo}</td>
                          <td className="py-2.5 font-bold text-sky-300">{inv.freightOrderId}</td>
                          <td className="py-2.5 text-slate-300">{inv.settlementDocumentNo}</td>
                          <td className="py-2.5 text-slate-200">{inv.carrierName}</td>
                          <td className="py-2.5 text-slate-200">
                            <div><span className="font-bold text-rose-300">{inv.invoicedAmount}</span> / <span className="text-emerald-400">{inv.expectedAmount}</span></div>
                          </td>
                          <td className="py-2.5">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                              {inv.varianceAmount} ({inv.variancePct}%)
                            </span>
                          </td>
                          <td className="py-2.5 text-[11px] text-slate-300 max-w-xs">{inv.blockReason}</td>
                          <td className="py-2.5 text-slate-400 text-[10px]">{inv.fiJournalEntryNo}</td>
                          <td className="py-2.5 text-right">
                            {inv.disputeRecommended ? (
                              <button
                                onClick={() => setActionFeedback(`[S/4HANA DISPUTE ISSUED] Posted dispute notice for Invoice ${inv.invoiceNo} against Carrier ${inv.carrierName}. S/4HANA LIV block maintained.`)}
                                className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] px-2 py-1 rounded transition-colors shadow"
                              >
                                Issue Dispute
                              </button>
                            ) : (
                              <span className="text-slate-500 text-[10px]">Pending ePOD</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Contracted vs Invoiced Rate Comparison with Charge Breakdown */}
            {settlementResult?.settlementCorrelations && settlementResult.settlementCorrelations.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-4">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
                  <span>Contracted Rate vs. Invoiced Rate &amp; Charge Item Breakdown</span>
                  <span className="text-[10px] font-mono text-purple-300 font-normal">S/4HANA TCCS Tariff Audit</span>
                </h4>
                <div className="space-y-4">
                  {settlementResult.settlementCorrelations.map((corr: any, idx: number) => (
                    <div key={idx} className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-3">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-slate-850 pb-2">
                        <div className="space-y-0.5">
                          <span className="font-bold text-amber-300 text-xs">
                            Invoice: {corr.carrierInvoiceNo} • FO: {corr.freightOrderId} • Carrier: {corr.carrierName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            Trace: {corr.endToEndTraceText}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-slate-300 font-mono">
                            Contracted: <strong className="text-emerald-400">{corr.contractedRate}</strong> | Billed: <strong className="text-rose-300">{corr.invoicedRate}</strong>
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
                            Variance: {corr.variance} ({corr.variancePct}%)
                          </span>
                        </div>
                      </div>

                      {/* Charge Breakdown Items */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                        {corr.chargeBreakdown.map((item: any, iIdx: number) => (
                          <div key={iIdx} className={`p-2 rounded border text-xs font-mono space-y-1 ${item.isDisputed ? 'bg-rose-950/30 border-rose-800/80' : 'bg-slate-900 border-slate-800'}`}>
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="font-bold text-slate-200">{item.chargeType}</span>
                              {item.isDisputed && (
                                <span className="bg-rose-900 text-rose-200 px-1 py-0.2 rounded text-[8px] font-bold">DISPUTED</span>
                              )}
                            </div>
                            <div className="flex justify-between text-[11px]">
                              <span className="text-slate-400">Contract: {item.contracted}</span>
                              <span className="text-white font-bold">Invoiced: {item.invoiced}</span>
                            </div>
                            <div className="text-right text-[10px]">
                              <span className={item.variance !== '€0.00' ? 'text-rose-400 font-bold' : 'text-slate-500'}>
                                Diff: {item.variance}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="bg-slate-900 p-2.5 rounded border border-slate-800/80 text-[11px] text-slate-300 flex justify-between items-center">
                        <div>
                          <strong className="text-amber-400 font-mono uppercase text-[10px]">AI Settlement Recommendation:</strong>{' '}
                          <span>{corr.recommendedAction}</span>
                        </div>
                        <button
                          onClick={() => setActionFeedback(`[AUTO-ACTION EXECUTED] Dispute notice generated for ${corr.carrierInvoiceNo}. S/4HANA TM settlement document status changed to DISPUTE_ACTIVE.`)}
                          className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10px] px-2.5 py-1 rounded transition-colors shrink-0 ml-3"
                        >
                          Execute Recommendation
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recurring Discrepancy Carriers Analytics */}
            {settlementResult?.recurringDiscrepancyCarriers && settlementResult.recurringDiscrepancyCarriers.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Carriers with Recurring Invoice Discrepancies</span>
                  <span className="text-[10px] font-mono text-slate-400 font-normal">Last 90 Days S/4HANA Audit</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {settlementResult.recurringDiscrepancyCarriers.map((car: any, idx: number) => (
                    <div key={idx} className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2 font-mono text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-amber-300">{car.carrierName} ({car.scacCode})</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          car.vendorComplianceStatus === 'HIGH_RISK_SETTLEMENT' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}>
                          {car.vendorComplianceStatus}
                        </span>
                      </div>
                      <div className="space-y-1 text-[11px] text-slate-300">
                        <div className="flex justify-between">
                          <span className="text-slate-400">90-Day Discrepancies:</span>
                          <span className="font-bold text-rose-400">{car.discrepancyCountLast90Days} Invoices</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Total Disputed Spend:</span>
                          <span className="font-bold text-rose-300">{car.totalDisputedAmountEur}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Historical Error Rate:</span>
                          <span className="font-bold text-amber-400">{car.historicalErrorRatePct}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Dispute Win Rate:</span>
                          <span className="font-bold text-emerald-400">{car.disputeWinRatePct}%</span>
                        </div>
                      </div>
                      <div className="bg-slate-900 p-2 rounded text-[10px] text-slate-300 space-y-1">
                        <span className="text-rose-400 font-bold block">Primary Reason:</span>
                        <span>{car.primaryDiscrepancyReason}</span>
                      </div>
                      <div className="bg-amber-950/30 border border-amber-900/50 p-2 rounded text-[10px] text-amber-200">
                        <strong>Policy Enforcement:</strong> {car.recommendedPolicy}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Accessorial Charges Breakdown by Carrier */}
            {settlementResult?.accessorialChargesByCarrier && settlementResult.accessorialChargesByCarrier.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Accessorial Charges Breakdown by Carrier</span>
                  <span className="text-[10px] font-mono text-slate-400 font-normal">Fuel Surcharge, Detention, Layover, Liftgate &amp; Tolls</span>
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                        <th className="pb-2">Carrier</th>
                        <th className="pb-2">Linehaul (€)</th>
                        <th className="pb-2">Fuel Surcharge (€)</th>
                        <th className="pb-2">Detention / Demurrage (€)</th>
                        <th className="pb-2">Liftgate (€)</th>
                        <th className="pb-2">Tolls (€)</th>
                        <th className="pb-2">Total Accessorials</th>
                        <th className="pb-2">% of Spend</th>
                        <th className="pb-2 text-right">Unapproved Count</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {settlementResult.accessorialChargesByCarrier.map((acc: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-850/50 transition-colors">
                          <td className="py-2.5 font-bold text-slate-200">{acc.carrierName}</td>
                          <td className="py-2.5 text-slate-300">€{acc.linehaulTotalEur.toLocaleString()}</td>
                          <td className="py-2.5 text-purple-300 font-bold">€{acc.fuelSurchargeEur.toLocaleString()}</td>
                          <td className="py-2.5 text-rose-300 font-bold">€{acc.detentionDemurrageEur.toLocaleString()}</td>
                          <td className="py-2.5 text-amber-300">€{acc.liftgateHandlingEur.toLocaleString()}</td>
                          <td className="py-2.5 text-slate-300">€{acc.tollsPermitsEur.toLocaleString()}</td>
                          <td className="py-2.5 font-bold text-sky-300">€{acc.totalAccessorialsEur.toLocaleString()}</td>
                          <td className="py-2.5 font-bold text-amber-400">{acc.accessorialPctOfSpend}%</td>
                          <td className="py-2.5 text-right font-bold text-rose-400">{acc.unapprovedAccessorialCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Recommended Dispute Notices */}
            {settlementResult?.disputeRecommendations && settlementResult.disputeRecommendations.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Freight Charges Recommended for Dispute</span>
                  <span className="text-[10px] font-mono text-slate-400 font-normal">S/4HANA Contract Reference &amp; OData Action</span>
                </h4>
                <div className="space-y-3">
                  {settlementResult.disputeRecommendations.map((disp: any, idx: number) => (
                    <div key={idx} className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2 font-mono text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-amber-300">
                          Invoice: {disp.invoiceNo} (FO: {disp.freightOrderId}) • Carrier: {disp.carrierName}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                          Disputed Amount: {disp.disputedAmountEur} ({disp.disputedChargeType})
                        </span>
                      </div>
                      <div className="text-slate-300 text-[11px] space-y-1">
                        <div><strong className="text-slate-400">Justification:</strong> {disp.justification}</div>
                        <div><strong className="text-slate-400">Contract Reference:</strong> {disp.contractClauseReference}</div>
                        <div><strong className="text-emerald-400">S/4HANA API:</strong> {disp.s4HanaActionApi}</div>
                      </div>
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => setActionFeedback(`[S/4HANA DISPUTE POSTED] Transmitted dispute notice for invoice ${disp.invoiceNo} (€${disp.disputedAmountEur}) to ${disp.carrierName} via ${disp.s4HanaActionApi}.`)}
                          className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10px] px-3 py-1.5 rounded transition-all shadow flex items-center space-x-1"
                        >
                          <Sparkles className="w-3 h-3 text-amber-200" />
                          <span>Post Dispute Notice to S/4HANA</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: Recommended Approval Model (3-Tier Governance) */}
        {activeTab === 'approvalModel' && (() => {
          const approvalModel = reportData?.recommendedApprovalModel || (data && data.tiers ? data : tmService.getRecommendedApprovalModel());
          const tiers = approvalModel.tiers || [];

          return (
            <div className="space-y-5 font-sans">
              {/* Header Box */}
              <div className="bg-slate-900 border border-amber-800/60 p-5 rounded-2xl space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="w-5 h-5 text-amber-400" />
                      <h3 className="text-base font-black text-slate-100 uppercase tracking-wide">
                        {approvalModel.title || "SAP TM Recommended Approval Model"}
                      </h3>
                      <span className="bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                        {approvalModel.version || "2026.1 - S/4HANA Policy Interlock"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 max-w-4xl leading-relaxed">
                      {approvalModel.description || "Strict 3-tiered AI execution policy defining fully autonomous read-only tasks, policy-governed automated actions, and human-in-the-loop approval gates across SAP Transportation Management."}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-mono px-3 py-1.5 rounded-lg font-bold">
                      7 Read-Only
                    </span>
                    <span className="bg-amber-950 text-amber-300 border border-amber-800 text-xs font-mono px-3 py-1.5 rounded-lg font-bold">
                      5 Policy-Controlled
                    </span>
                    <span className="bg-rose-950 text-rose-300 border border-rose-800 text-xs font-mono px-3 py-1.5 rounded-lg font-bold">
                      7 Human Approval
                    </span>
                  </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800">
                  <div className="flex items-center space-x-2 overflow-x-auto text-xs">
                    <button
                      onClick={() => setApprovalModelFilter('ALL')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                        approvalModelFilter === 'ALL' ? 'bg-slate-700 text-white' : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      All Tiers (19)
                    </button>
                    <button
                      onClick={() => setApprovalModelFilter('FULLY_AUTONOMOUS_READ_ONLY')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                        approvalModelFilter === 'FULLY_AUTONOMOUS_READ_ONLY' ? 'bg-emerald-600 text-white' : 'bg-slate-950 text-emerald-400 hover:text-emerald-300'
                      }`}
                    >
                      Fully Autonomous Read-Only (7)
                    </button>
                    <button
                      onClick={() => setApprovalModelFilter('POLICY_CONTROLLED')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                        approvalModelFilter === 'POLICY_CONTROLLED' ? 'bg-amber-600 text-white' : 'bg-slate-950 text-amber-400 hover:text-amber-300'
                      }`}
                    >
                      Policy-Controlled (5)
                    </button>
                    <button
                      onClick={() => setApprovalModelFilter('HUMAN_APPROVAL_REQUIRED')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                        approvalModelFilter === 'HUMAN_APPROVAL_REQUIRED' ? 'bg-rose-600 text-white' : 'bg-slate-950 text-rose-400 hover:text-rose-300'
                      }`}
                    >
                      Human Approval Required (7)
                    </button>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={approvalModelSearch}
                      onChange={(e) => setApprovalModelSearch(e.target.value)}
                      placeholder="Search capability or rule..."
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg pl-8 pr-3 py-1.5 outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Tiers Grid */}
              <div className="space-y-6">
                {tiers
                  .filter(tier => approvalModelFilter === 'ALL' || tier.tierKey === approvalModelFilter)
                  .map((tier: any, tIdx: number) => {
                    const isReadOnly = tier.tierKey === 'FULLY_AUTONOMOUS_READ_ONLY';
                    const isPolicy = tier.tierKey === 'POLICY_CONTROLLED';
                    const isHuman = tier.tierKey === 'HUMAN_APPROVAL_REQUIRED';

                    const filteredItems = (tier.items || []).filter((item: any) => {
                      if (!approvalModelSearch.trim()) return true;
                      const q = approvalModelSearch.toLowerCase();
                      return item.name.toLowerCase().includes(q) ||
                             item.s4HanaService.toLowerCase().includes(q) ||
                             item.policyRule.toLowerCase().includes(q);
                    });

                    if (filteredItems.length === 0 && approvalModelSearch.trim()) return null;

                    return (
                      <div
                        key={tIdx}
                        className={`bg-slate-900/80 border rounded-2xl p-5 space-y-4 ${
                          isReadOnly ? 'border-emerald-800/80 shadow-lg shadow-emerald-950/20' :
                          isPolicy ? 'border-amber-800/80 shadow-lg shadow-amber-950/20' :
                          'border-rose-800/80 shadow-lg shadow-rose-950/20'
                        }`}
                      >
                        {/* Tier Title Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                          <div className="flex items-center space-x-3">
                            <span className={`p-2 rounded-xl font-bold ${
                              isReadOnly ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                              isPolicy ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                              'bg-rose-950 text-rose-400 border border-rose-800'
                            }`}>
                              {isReadOnly && <CheckCircle className="w-5 h-5" />}
                              {isPolicy && <Zap className="w-5 h-5" />}
                              {isHuman && <ShieldAlert className="w-5 h-5" />}
                            </span>
                            <div>
                              <h4 className="text-sm font-black text-slate-100 uppercase tracking-wide">
                                {tier.tierName}
                              </h4>
                              <p className="text-xs text-slate-400">
                                {tier.description}
                              </p>
                            </div>
                          </div>

                          <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${
                            isReadOnly ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800' :
                            isPolicy ? 'bg-amber-950/80 text-amber-300 border-amber-800' :
                            'bg-rose-950/80 text-rose-300 border-rose-800'
                          }`}>
                            {filteredItems.length} Capabilities
                          </span>
                        </div>

                        {/* Capability Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                          {filteredItems.map((item: any, iIdx: number) => (
                            <div
                              key={iIdx}
                              className={`bg-slate-950 p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all hover:border-slate-700 ${
                                isReadOnly ? 'border-emerald-900/40 hover:border-emerald-700/60' :
                                isPolicy ? 'border-amber-900/40 hover:border-amber-700/60' :
                                'border-rose-900/40 hover:border-rose-700/60'
                              }`}
                            >
                              <div className="space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <h5 className="text-xs font-bold text-slate-100 capitalize leading-snug">
                                    {item.name}
                                  </h5>
                                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold shrink-0 border ${
                                    item.autoExecute 
                                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800' 
                                      : 'bg-rose-950 text-rose-300 border-rose-800'
                                  }`}>
                                    {item.autoExecute ? 'AUTO-EXECUTE' : 'FIORI MY INBOX'}
                                  </span>
                                </div>

                                <div className="text-[11px] font-mono text-sky-400 bg-slate-900 px-2 py-1 rounded border border-slate-800/80 truncate">
                                  {item.s4HanaService}
                                </div>

                                <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                                  {item.policyRule}
                                </p>
                              </div>

                              <button
                                onClick={() => handleEvaluateActionPolicy(item.name, 650)}
                                className={`w-full text-center text-[11px] font-bold py-1.5 px-3 rounded-lg transition-all flex items-center justify-center space-x-1 mt-2 ${
                                  isReadOnly ? 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800' :
                                  isPolicy ? 'bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-800' :
                                  'bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800'
                                }`}
                              >
                                <span>Simulate Policy Check</span>
                                <ArrowRight className="w-3 h-3 ml-1" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Interactive Policy Interlock Evaluator Widget */}
              <div className="bg-slate-900 border border-indigo-800/80 p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <Cpu className="w-4 h-4 text-indigo-400 animate-pulse" />
                    <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                      Interactive S/4HANA TM Policy Interlock Simulator
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950 border border-indigo-800 px-2.5 py-1 rounded font-bold">
                    Deterministic Policy Gate
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 font-bold uppercase">Select Capability / Action</label>
                    <select
                      value={evalActionName}
                      onChange={(e) => setEvalActionName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 font-sans"
                    >
                      <optgroup label="Tier 1: Fully Autonomous Read-Only">
                        <option value="shipment status">shipment status</option>
                        <option value="carrier performance">carrier performance</option>
                        <option value="ETA analysis">ETA analysis</option>
                        <option value="freight cost analysis">freight cost analysis</option>
                        <option value="lane analysis">lane analysis</option>
                        <option value="transportation KPIs">transportation KPIs</option>
                        <option value="delay prediction">delay prediction</option>
                      </optgroup>
                      <optgroup label="Tier 2: Policy-Controlled">
                        <option value="re-tender rejected shipment">re-tender rejected shipment</option>
                        <option value="assign approved carrier">assign approved carrier</option>
                        <option value="consolidate freight units">consolidate freight units</option>
                        <option value="change transportation priority">change transportation priority</option>
                        <option value="send customer or carrier notification">send customer or carrier notification</option>
                      </optgroup>
                      <optgroup label="Tier 3: Human Approval Required">
                        <option value="large freight cost override">large freight cost override</option>
                        <option value="carrier contract change">carrier contract change</option>
                        <option value="emergency premium freight">emergency premium freight</option>
                        <option value="rerouting high-value shipment">rerouting high-value shipment</option>
                        <option value="shipment cancellation">shipment cancellation</option>
                        <option value="freight settlement override">freight settlement override</option>
                        <option value="high-risk carrier assignment">high-risk carrier assignment</option>
                      </optgroup>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 font-bold uppercase">Freight Variance Amount (€)</label>
                    <input
                      type="number"
                      value={evalAmount}
                      onChange={(e) => setEvalAmount(Number(e.target.value))}
                      placeholder="e.g. 650"
                      className="w-full bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={() => handleEvaluateActionPolicy()}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2 px-4 rounded-lg transition-all flex items-center justify-center space-x-2"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Evaluate Policy Interlock</span>
                    </button>
                  </div>
                </div>

                {/* Evaluation Result Display */}
                {evalResult && (
                  <div className={`p-4 rounded-xl border font-mono text-xs space-y-2 animate-in fade-in ${
                    evalResult.requiresFioriApproval 
                      ? 'bg-rose-950/50 border-rose-800/80 text-rose-200'
                      : evalResult.autoExecute
                      ? 'bg-emerald-950/50 border-emerald-800/80 text-emerald-200'
                      : 'bg-amber-950/50 border-amber-800/80 text-amber-200'
                  }`}>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-100 uppercase">
                        Action: {evalResult.actionName}
                      </span>
                      <span className="px-2.5 py-0.5 rounded font-bold text-[10px] bg-slate-900 border border-slate-700">
                        {evalResult.tierName}
                      </span>
                    </div>

                    <div className="text-[11px] leading-relaxed font-sans">
                      {evalResult.explanation}
                    </div>

                    <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800 flex justify-between items-center">
                      <span>S/4HANA Service: {evalResult.s4HanaService}</span>
                      <span>Policy Rule: {evalResult.policyRule}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* Tab 7: Immutable Audit Trail */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                Immutable Cryptographic TM Audit Trail (SHA-256 Hashed)
              </h3>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {auditLogs.map((log, i) => (
                <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                  <div className="flex justify-between items-center text-slate-400 text-[11px]">
                    <span className="font-bold text-sky-400">{log.logId}</span>
                    <span>{log.timestamp}</span>
                  </div>
                  <div className="text-slate-200 font-bold">{log.actionType} → {log.targetDocument}</div>
                  <div className="text-slate-400 text-[11px]">{log.policyValidation}</div>
                  <div className="text-emerald-400 text-[10px] truncate">
                    Endpoint: {log.s4HanaODataEndpoint} | SHA-256: {log.hashSha256}
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
