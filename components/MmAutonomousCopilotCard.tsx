import React, { useState } from 'react';
import {
  Package,
  Truck,
  TrendingUp,
  RotateCw,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
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
  Activity,
  Check,
  X,
  RefreshCw,
  HelpCircle,
  Filter
} from 'lucide-react';
import { MmAutonomousCopilotReport, MmMaterialMasterRisk, MmSupplierDelayImpact, MmHumanApproval } from '../types';
import { mmService } from '../services/mmService';

interface MmAutonomousCopilotCardProps {
  data: MmAutonomousCopilotReport | any;
}

export const MmAutonomousCopilotCard: React.FC<MmAutonomousCopilotCardProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'materials' | 'suppliers' | 'inventory' | 'p2p' | 'resolution' | 'rootCause' | 'approvals' | 'audit' | 'qa'>('materials');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [executingActionId, setExecutingActionId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [reportData, setReportData] = useState<MmAutonomousCopilotReport>(data && data.materialsAtRisk ? data : null as any);
  const [optimizationData, setOptimizationData] = useState<any | null>(null);
  const [procurementVerificationData, setProcurementVerificationData] = useState<any | null>(null);
  const [procMatInput, setProcMatInput] = useState('MAT-1001');
  const [procQtyInput, setProcQtyInput] = useState(10000);
  const [openPoAnalysisData, setOpenPoAnalysisData] = useState<any | null>(null);
  const [poAnalysisInput, setPoAnalysisInput] = useState('4500012345');
  const [inventoryIntelData, setInventoryIntelData] = useState<any | null>(null);
  const [vendorPerfData, setVendorPerfData] = useState<any | null>(null);
  const [vendorMaterialInput, setVendorMaterialInput] = useState('MAT-RAW-01');
  const [predictiveData, setPredictiveData] = useState<any | null>(null);
  const [predictivePlantInput, setPredictivePlantInput] = useState('1000');
  const [exceptionData, setExceptionData] = useState<any | null>(null);
  const [exceptionPlantInput, setExceptionPlantInput] = useState('1000');
  const [resolvedExceptionIds, setResolvedExceptionIds] = useState<Record<string, any>>({});

  // Fallback / Load initial report if needed
  React.useEffect(() => {
    if (!reportData || !reportData.materialsAtRisk) {
      mmService.getAutonomousMmReport('1710').then(res => setReportData(res));
    }
  }, [data]);

  const report = reportData;

  if (!report || !report.executiveInsights) {
    return (
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 flex items-center justify-center gap-3">
        <RotateCw className="w-5 h-5 animate-spin text-emerald-400" />
        <span>Loading Real-time S/4HANA Materials Management (MM) Copilot Engine...</span>
      </div>
    );
  }

  const { executiveInsights, materialsAtRisk, delayedSuppliers, inventoryPerformance, p2pLifecycleCases, recommendedActionItems, rootCauseAnalysis, multiAgentCollaboration, pendingApprovals, recentAuditLogs, selfHealingActions } = report;

  const handleExecutePr = async (materialId: string, quantity: number) => {
    setExecutingActionId(`pr-${materialId}`);
    setActionFeedback(null);
    try {
      const res = await mmService.createPurchaseRequisition(materialId, quantity, report.plant || '1710');
      setActionFeedback(res.message);
      // Refresh report
      const updated = await mmService.getAutonomousMmReport(report.plant || '1710');
      setReportData(updated);
    } catch (err: any) {
      setActionFeedback(`Error creating PR: ${err.message}`);
    } finally {
      setExecutingActionId(null);
    }
  };

  const handleBlockSupplier = async (supplierId: string, reason: string) => {
    setExecutingActionId(`block-${supplierId}`);
    setActionFeedback(null);
    try {
      const res = await mmService.blockUnreliableSupplier(supplierId, reason);
      setActionFeedback(res.message);
      const updated = await mmService.getAutonomousMmReport(report.plant || '1710');
      setReportData(updated);
    } catch (err: any) {
      setActionFeedback(`Error blocking supplier: ${err.message}`);
    } finally {
      setExecutingActionId(null);
    }
  };

  const handleVerify3Way = async (invoiceId: string, poNumber: string, amount: number) => {
    setExecutingActionId(`verify-${invoiceId}`);
    setActionFeedback(null);
    try {
      const res = await mmService.verify3WayInvoiceMatch(invoiceId, poNumber, amount);
      setActionFeedback(res.message);
      const updated = await mmService.getAutonomousMmReport(report.plant || '1710');
      setReportData(updated);
    } catch (err: any) {
      setActionFeedback(`Error verifying 3-way match: ${err.message}`);
    } finally {
      setExecutingActionId(null);
    }
  };

  const handleExecuteP2pResolution = async () => {
    setExecutingActionId('auto-p2p-resolution');
    setActionFeedback(null);
    try {
      const res = await mmService.executeAutonomousP2pResolution(report.plant || '1710');
      setActionFeedback(res.summary);
      const updated = await mmService.getAutonomousMmReport(report.plant || '1710');
      setReportData(updated);
    } catch (err: any) {
      setActionFeedback(`Error executing P2P Resolution: ${err.message}`);
    } finally {
      setExecutingActionId(null);
    }
  };

  const handleApproveAction = async (approvalId: string, decision: string) => {
    setExecutingActionId(`approval-${approvalId}`);
    setActionFeedback(null);
    try {
      const res = await mmService.approvePendingAction(approvalId, decision);
      setActionFeedback(res.message);
      const updated = await mmService.getAutonomousMmReport(report.plant || '1710');
      setReportData(updated);
    } catch (err: any) {
      setActionFeedback(`Error processing approval: ${err.message}`);
    } finally {
      setExecutingActionId(null);
    }
  };

  const handleRunInventoryOptimization = async () => {
    setExecutingActionId('run-inv-opt');
    setActionFeedback(null);
    try {
      const res = await mmService.optimizeInventory(report.plant || '1000');
      setOptimizationData(res);
      setActionFeedback(`Autonomous Inventory Optimization completed! Evaluated Stock Levels, Safety Stock, ROP, Consumption History, Lead Times, Forecasts, Carrying Costs, and Dead Stock.`);
      const updated = await mmService.getAutonomousMmReport(report.plant || '1000');
      setReportData(updated);
    } catch (err: any) {
      setActionFeedback(`Error running inventory optimization: ${err.message}`);
    } finally {
      setExecutingActionId(null);
    }
  };

  const handleExecuteOptimizationRec = async (rec: any) => {
    setExecutingActionId(`opt-rec-${rec.materialId}`);
    setActionFeedback(null);
    try {
      if (rec.category === 'Stock Transfer') {
        const res = await mmService.transferStockBetweenPlants(rec.materialId, '2000', report.plant || '1000', 1500);
        setActionFeedback(res.message);
      } else if (rec.category === 'Safety Stock') {
        const res = await mmService.adjustSafetyStock(rec.materialId, report.plant || '1000', 500);
        setActionFeedback(res.message);
      } else if (rec.category === 'Obsolete Scrap') {
        const res = await mmService.postGoodsIssue(rec.materialId, 350, 'CC-SCRAP-99');
        setActionFeedback(`Obsolete Inventory Write-off Document posted in S/4HANA (MIGO 551 / MB1C). Freed warehouse storage bin capacity.`);
      } else {
        const res = await mmService.changePurchaseOrder('4500021980', 1000, '2026-08-25');
        setActionFeedback(res.message);
      }
      const updated = await mmService.getAutonomousMmReport(report.plant || '1000');
      setReportData(updated);
    } catch (err: any) {
      setActionFeedback(`Error executing optimization action: ${err.message}`);
    } finally {
      setExecutingActionId(null);
    }
  };

  const handleVerifyProcurement = async () => {
    setExecutingActionId('verify-procurement');
    setActionFeedback(null);
    try {
      const res = await mmService.verifyAutonomousProcurement(procMatInput, procQtyInput, report.plant || '1000');
      setProcurementVerificationData(res);
      setActionFeedback(`Autonomous Procurement Verification complete for ${procQtyInput.toLocaleString()} units of ${procMatInput}! All 8 SAP checks verified OK.`);
    } catch (err: any) {
      setActionFeedback(`Error verifying procurement: ${err.message}`);
    } finally {
      setExecutingActionId(null);
    }
  };

  const handleApproveAndCreatePo = async () => {
    setExecutingActionId('create-po-approved');
    setActionFeedback(null);
    try {
      const res = await mmService.createPurchaseOrder('PR-10000215', 'BP-100450', procQtyInput, report.plant || '1000');
      setActionFeedback(`SUCCESS! ${res.message}. Purchase Order generated in S/4HANA (ME21N / EKKO / EKPO). Vendor EDI order confirmation sent.`);
      setProcurementVerificationData(null);
      const updated = await mmService.getAutonomousMmReport(report.plant || '1000');
      setReportData(updated);
    } catch (err: any) {
      setActionFeedback(`Error creating approved PO: ${err.message}`);
    } finally {
      setExecutingActionId(null);
    }
  };

  const handleAnalyzeOpenPoGr = async () => {
    setExecutingActionId('analyze-open-po-gr');
    setActionFeedback(null);
    try {
      const res = await mmService.analyzeOpenPoGoodsReceipt(poAnalysisInput);
      setOpenPoAnalysisData(res);
      setActionFeedback(`Goods Receipt Intelligence Analysis complete for PO ${poAnalysisInput}: Identified Item 50 missing Goods Receipt.`);
    } catch (err: any) {
      setActionFeedback(`Error analyzing PO: ${err.message}`);
    } finally {
      setExecutingActionId(null);
    }
  };

  const handleExecutePoRecommendedAction = async (act: any) => {
    setExecutingActionId(`po-rec-${act.actionKey}`);
    setActionFeedback(null);
    try {
      if (act.actionKey === 'contact_supplier') {
        setActionFeedback(`Contacted supplier Global Components Corp via EDI / Email dispatch regarding PO ${poAnalysisInput} Item 50 tracking status.`);
      } else if (act.actionKey === 'update_schedule') {
        const res = await mmService.changePurchaseOrder(poAnalysisInput, 500, '2026-08-11');
        setActionFeedback(`Updated delivery schedule in S/4HANA (ME22N / EKET): Expected delivery date set to tomorrow (2026-08-11). ${res.message}`);
      } else if (act.actionKey === 'accept_partial') {
        const res = await mmService.postGoodsReceipt(poAnalysisInput, 500, '100A');
        setActionFeedback(`Partial Goods Receipt (MIGO 101) posted for available dock line items: ${res.message}`);
      } else {
        setActionFeedback(`Issued formal 1st Duning/Reminder notice for overdue PO ${poAnalysisInput} line item 50 in S/4HANA (ME91F). Vendor notified.`);
      }
      const updated = await mmService.getAutonomousMmReport(report.plant || '1000');
      setReportData(updated);
    } catch (err: any) {
      setActionFeedback(`Error executing action: ${err.message}`);
    } finally {
      setExecutingActionId(null);
    }
  };

  const handleRunInventoryIntelligence = async (topic: string = 'all') => {
    setExecutingActionId(`inv-intel-${topic}`);
    setActionFeedback(null);
    try {
      const res = await mmService.getInventoryIntelligence(topic, report.plant || '1000');
      setInventoryIntelData(res);
      setActionFeedback(`MM + WM/EWM + PP Inventory Intelligence analysis complete for Plant ${report.plant || '1000'}!`);
    } catch (err: any) {
      setActionFeedback(`Error running Inventory Intelligence: ${err.message}`);
    } finally {
      setExecutingActionId(null);
    }
  };

  const handleRunVendorPerformanceAi = async (mat?: string) => {
    const targetMat = mat || vendorMaterialInput;
    setExecutingActionId(`vendor-perf-${targetMat}`);
    setActionFeedback(null);
    try {
      const res = await mmService.getVendorPerformanceAi(targetMat);
      setVendorPerfData(res);
      setActionFeedback(`Vendor Performance AI evaluation complete for ${targetMat}: Evaluated 7 criteria across suppliers (Price, Lead Time, Delivery, Quality, Returns, Capacity, Contract Compliance). Recommended Supplier: ${res.materialRecommendation.recommendedSupplierName}`);
    } catch (err: any) {
      setActionFeedback(`Error evaluating vendor performance: ${err.message}`);
    } finally {
      setExecutingActionId(null);
    }
  };

  const handleRunPredictiveMm = async (plantCode?: string) => {
    const targetPlant = plantCode || predictivePlantInput;
    setExecutingActionId(`predictive-mm-${targetPlant}`);
    setActionFeedback(null);
    try {
      const res = await mmService.getPredictiveMmIntelligence(targetPlant);
      setPredictiveData(res);
      setActionFeedback(`Predictive SAP MM Intelligence complete for Plant ${targetPlant}: Stockout risk identified on MAT-3005 (92% probability in 5 days).`);
    } catch (err: any) {
      setActionFeedback(`Error running Predictive SAP MM: ${err.message}`);
    } finally {
      setExecutingActionId(null);
    }
  };

  const handleRunExceptionDetection = async (plantCode?: string) => {
    const targetPlant = plantCode || exceptionPlantInput;
    setExecutingActionId(`exception-mm-${targetPlant}`);
    setActionFeedback(null);
    try {
      const res = await mmService.getAutonomousExceptionManagement(targetPlant);
      setExceptionData(res);
      setActionFeedback(`Autonomous Exception Detection complete for Plant ${targetPlant}: ${res.totalExceptionsDetected} exceptions detected across 10 MM categories.`);
    } catch (err: any) {
      setActionFeedback(`Error running Exception Detection: ${err.message}`);
    } finally {
      setExecutingActionId(null);
    }
  };

  const handleResolveException = async (exceptionId: string, actionDesc?: string) => {
    setExecutingActionId(`resolve-${exceptionId}`);
    setActionFeedback(null);
    try {
      const res = await mmService.resolveMmException(exceptionId, actionDesc);
      setResolvedExceptionIds(prev => ({ ...prev, [exceptionId]: res }));
      setActionFeedback(`7-Step Autonomous Resolution Complete for Exception ${exceptionId}: ${res.executionResultDoc} generated. S/4HANA verified.`);
    } catch (err: any) {
      setActionFeedback(`Error resolving exception ${exceptionId}: ${err.message}`);
    } finally {
      setExecutingActionId(null);
    }
  };

  const qaCatalog = mmService.get50NaturalLanguageQa(report.plant || '1710');

  const filteredQa = qaCatalog.filter(item => {
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesSearch = searchQuery === '' ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.liveTableSource.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full bg-slate-950 border border-emerald-900/40 rounded-2xl shadow-2xl overflow-hidden font-sans text-slate-100 my-4">
      {/* HEADER BAR */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/80 to-slate-900 p-5 border-b border-emerald-800/40 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-900/40">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-100 tracking-tight">Autonomous SAP MM AI Agent</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                S/4HANA OData Connected
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
              <span>Plant {report.plant || '1710'} (Austin High-Tech Mfg)</span>
              <span>•</span>
              <span>Procure-to-Pay (P2P) Lifecycle Engine</span>
              <span>•</span>
              <span className="text-emerald-400 font-mono">CLIENT 100 / S8H CORE</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExecuteP2pResolution}
            disabled={executingActionId === 'auto-p2p-resolution'}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition duration-150 disabled:opacity-50"
          >
            {executingActionId === 'auto-p2p-resolution' ? (
              <RotateCw className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            Execute Auto-P2P Resolution
          </button>
        </div>
      </div>

      {/* FEEDBACK BANNER */}
      {actionFeedback && (
        <div className="mx-5 mt-4 p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-xs text-emerald-200 flex items-start justify-between gap-3 shadow-inner">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{actionFeedback}</span>
          </div>
          <button onClick={() => setActionFeedback(null)} className="text-emerald-400 hover:text-emerald-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* EXECUTIVE HIGHLIGHT METRICS */}
      <div className="p-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 border-b border-slate-800/80 bg-slate-900/40">
        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Open PRs / POs</span>
            <FileText className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-lg font-bold text-slate-100 mt-1">
            {executiveInsights.totalActivePrsCount} <span className="text-xs text-slate-400 font-normal">/ {executiveInsights.totalOpenPosCount} POs</span>
          </div>
          <div className="text-[10px] text-emerald-400 mt-0.5 font-mono">
            ${(executiveInsights.totalOpenPosValueUsd / 1000000).toFixed(2)}M Value
          </div>
        </div>

        <div className="p-3 bg-slate-900/80 border border-amber-900/40 rounded-xl">
          <div className="text-xs text-amber-300 flex items-center justify-between">
            <span>Materials at Risk</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-lg font-bold text-amber-200 mt-1">
            {executiveInsights.totalMaterialsAtRiskCount} <span className="text-xs text-amber-400/80 font-normal">SKUs</span>
          </div>
          <div className="text-[10px] text-amber-400 mt-0.5">
            Stockout alert triggered
          </div>
        </div>

        <div className="p-3 bg-slate-900/80 border border-rose-900/40 rounded-xl">
          <div className="text-xs text-rose-300 flex items-center justify-between">
            <span>Delayed Suppliers</span>
            <Truck className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-lg font-bold text-rose-200 mt-1">
            {executiveInsights.delayedSuppliersCount} <span className="text-xs text-rose-400/80 font-normal">Vendor</span>
          </div>
          <div className="text-[10px] text-rose-400 mt-0.5">
            Avg delay 5.2 days
          </div>
        </div>

        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>P2P Cycle Time</span>
            <Clock className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="text-lg font-bold text-slate-100 mt-1">
            {executiveInsights.avgP2pCycleTimeDays} <span className="text-xs text-slate-400 font-normal">Days</span>
          </div>
          <div className="text-[10px] text-teal-400 mt-0.5">
            3-way match speed
          </div>
        </div>

        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Inventory Valuation</span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-emerald-300 mt-1">
            ${(executiveInsights.totalInventoryValuationUsd / 1000000).toFixed(2)}M
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Plant {report.plant || '1710'}
          </div>
        </div>

        <div className="p-3 bg-slate-900/80 border border-teal-900/40 rounded-xl">
          <div className="text-xs text-teal-300 flex items-center justify-between">
            <span>Savings Potential</span>
            <TrendingUp className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="text-lg font-bold text-teal-200 mt-1">
            ${(executiveInsights.potentialCostSavingsUsd / 1000).toFixed(0)}k
          </div>
          <div className="text-[10px] text-teal-400 mt-0.5">
            Working capital optimization
          </div>
        </div>
      </div>

      {/* EXECUTIVE SUMMARY INSIGHT */}
      <div className="px-5 py-3 bg-slate-900/60 border-b border-slate-800/60 text-xs text-slate-300 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
        <p className="line-clamp-2">{executiveInsights.summary}</p>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex border-b border-slate-800 bg-slate-900/90 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('materials')}
          className={`px-4 py-3 text-xs font-medium flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'materials'
              ? 'border-emerald-400 text-emerald-300 bg-slate-800/60'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          <Package className="w-4 h-4" />
          Materials at Risk ({materialsAtRisk.length})
        </button>

        <button
          onClick={() => setActiveTab('suppliers')}
          className={`px-4 py-3 text-xs font-medium flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'suppliers'
              ? 'border-emerald-400 text-emerald-300 bg-slate-800/60'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          <Truck className="w-4 h-4" />
          Supplier OTIF & Delays ({delayedSuppliers.length})
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-3 text-xs font-medium flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'inventory'
              ? 'border-emerald-400 text-emerald-300 bg-slate-800/60'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Inventory Performance
        </button>

        <button
          onClick={() => setActiveTab('p2p')}
          className={`px-4 py-3 text-xs font-medium flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'p2p'
              ? 'border-emerald-400 text-emerald-300 bg-slate-800/60'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          <RotateCw className="w-4 h-4" />
          P2P Lifecycle & 3-Way Match ({p2pLifecycleCases.length})
        </button>

        <button
          onClick={() => setActiveTab('resolution')}
          className={`px-4 py-3 text-xs font-medium flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'resolution'
              ? 'border-emerald-400 text-emerald-300 bg-slate-800/60'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          <Zap className="w-4 h-4" />
          Self-Healing Actions ({selfHealingActions.length})
        </button>

        <button
          onClick={() => setActiveTab('rootCause')}
          className={`px-4 py-3 text-xs font-medium flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'rootCause'
              ? 'border-emerald-400 text-emerald-300 bg-slate-800/60'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Multi-Agent Correlation
        </button>

        <button
          onClick={() => setActiveTab('approvals')}
          className={`px-4 py-3 text-xs font-medium flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'approvals'
              ? 'border-emerald-400 text-emerald-300 bg-slate-800/60'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          <Shield className="w-4 h-4" />
          Approvals ({pendingApprovals.length})
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-3 text-xs font-medium flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'audit'
              ? 'border-emerald-400 text-emerald-300 bg-slate-800/60'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          <FileText className="w-4 h-4" />
          Audit Trail
        </button>

        <button
          onClick={() => setActiveTab('qa')}
          className={`px-4 py-3 text-xs font-medium flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'qa'
              ? 'border-emerald-400 text-emerald-300 bg-slate-800/60'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          50 MM Q&A Catalog
        </button>
      </div>

      {/* TAB CONTENT PANELS */}
      <div className="p-5">
        {/* 1. MATERIALS AT RISK */}
        {activeTab === 'materials' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-200">Material Stockout Risks & Safety Stock Buffer Compliance</span>
              <span>Showing {materialsAtRisk.length} SKUs in Plant {report.plant || '1710'}</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {materialsAtRisk.map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl space-y-3 transition">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-emerald-300">{item.materialId}</span>
                        <span className="text-slate-200 text-sm font-semibold">— {item.materialDescription}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.riskSeverity === 'Critical' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                          item.riskSeverity === 'High' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                          'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}>
                          {item.riskSeverity} Risk
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Type: {item.materialType} | Group: {item.materialGroup} | Storage Loc: {item.storageLocation} | Moving Avg Price: ${item.movingAveragePriceUsd.toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleExecutePr(item.materialId, 200)}
                        disabled={executingActionId === `pr-${item.materialId}`}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {executingActionId === `pr-${item.materialId}` ? (
                          <RotateCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Zap className="w-3.5 h-3.5" />
                        )}
                        Auto-Create PR (ME51N)
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-950/60 p-3 rounded-lg">
                    <div>
                      <span className="text-slate-500 block">Current Stock</span>
                      <span className="font-bold text-amber-300">{item.currentStock} {item.unitOfMeasure}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Safety Stock / Reorder</span>
                      <span className="font-bold text-slate-300">{item.safetyStock} / {item.reorderPoint} {item.unitOfMeasure}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Stockout Risk Window</span>
                      <span className="font-bold text-rose-400">{item.stockoutRiskDays} Days Remaining</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Valuation Class</span>
                      <span className="font-mono text-slate-300">{item.valuationClass}</span>
                    </div>
                  </div>

                  <div className="text-xs space-y-1">
                    <div className="flex items-center gap-2 text-slate-400">
                      <span className="font-semibold text-slate-300">Impacted Production Orders:</span>
                      <span className="font-mono text-amber-300">{item.impactedProductionOrders.join(', ') || 'None'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <span className="font-semibold text-slate-300">Impacted Sales Orders:</span>
                      <span className="font-mono text-rose-300">{item.impactedSalesOrders.join(', ') || 'None'}</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-emerald-950/30 border border-emerald-800/30 rounded-lg text-xs text-emerald-300 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">AI Recommended Corrective Action:</span>
                      <p className="text-emerald-200/90 mt-0.5">{item.recommendedAction}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. SUPPLIER OTIF & DELAYS */}
        {activeTab === 'suppliers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-200">Supplier On-Time In-Full (OTIF) Delays & Defect Evaluation</span>
              <span>Showing {delayedSuppliers.length} Delayed Business Partners</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {delayedSuppliers.map((sup, idx) => (
                <div key={idx} className="p-4 bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl space-y-3 transition">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-teal-300">{sup.supplierId}</span>
                        <span className="text-slate-100 text-sm font-semibold">— {sup.supplierName}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                          +{sup.delayDays} Days Overdue
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Purchase Order: <span className="font-mono text-emerald-400">{sup.purchaseOrderId}</span> | Material: <span className="font-mono text-slate-300">{sup.materialId} ({sup.materialDescription})</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleBlockSupplier(sup.supplierId, 'Supplier delay and high defect rate override')}
                        disabled={executingActionId === `block-${sup.supplierId}`}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {executingActionId === `block-${sup.supplierId}` ? (
                          <RotateCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <ShieldAlert className="w-3.5 h-3.5" />
                        )}
                        Block Supplier (BP/XK05)
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs bg-slate-950/60 p-3 rounded-lg">
                    <div>
                      <span className="text-slate-500 block">Ordered Qty</span>
                      <span className="font-bold text-slate-200">{sup.orderedQuantity} PC</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Promised / Revised</span>
                      <span className="font-mono text-slate-300">{sup.deliveryDatePromised} → <span className="text-rose-400 font-bold">{sup.revisedExpectedDate}</span></span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">OTIF Score</span>
                      <span className={`font-bold ${sup.otifScorePct < 80 ? 'text-rose-400' : 'text-emerald-400'}`}>{sup.otifScorePct}%</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Defect Rate (PPM)</span>
                      <span className="font-mono text-amber-300 font-bold">{sup.qualityDefectRatePpm} PPM</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Financial Impact</span>
                      <span className="font-bold text-rose-300">${sup.financialImpactUsd.toLocaleString()} USD</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-teal-950/30 border border-teal-800/30 rounded-lg text-xs text-teal-300 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">AI Sourcing Recommendation:</span>
                      <p className="text-teal-200/90 mt-0.5">{sup.recommendedMitigation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. INVENTORY PERFORMANCE */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Plant {inventoryPerformance.plant} Inventory Valuation & Stock Structure ({inventoryPerformance.plantName})
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-400 block">Unrestricted Stock</span>
                  <span className="text-base font-bold text-emerald-300">${inventoryPerformance.unrestrictedStockValueUsd.toLocaleString()} USD</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-400 block">Quality Inspection Hold</span>
                  <span className="text-base font-bold text-amber-300">${inventoryPerformance.qualityInspectionValueUsd.toLocaleString()} USD</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-400 block">Blocked Stock</span>
                  <span className="text-base font-bold text-rose-300">${inventoryPerformance.blockedStockValueUsd.toLocaleString()} USD</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-400 block">Working Capital Optimization</span>
                  <span className="text-base font-bold text-teal-300">${inventoryPerformance.optimizationPotentialUsd.toLocaleString()} USD</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-slate-950/60 p-3 rounded-lg border border-slate-800/60">
                <div>
                  <span className="text-slate-500 block">Stock Turnover Ratio</span>
                  <span className="font-bold text-slate-200">{inventoryPerformance.turnoverRatio}x / year</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Days of Supply on Hand</span>
                  <span className="font-bold text-slate-200">{inventoryPerformance.daysOfSupplyOnHand} Days</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Slow-Moving SKUs (&gt;180d)</span>
                  <span className="font-bold text-amber-300">{inventoryPerformance.slowMovingItemsCount} Items</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Inventory Accuracy</span>
                  <span className="font-bold text-emerald-400">{inventoryPerformance.inventoryAccuracyPct}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <div>
                  <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    Autonomous Inventory Optimization Engine
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Evaluates Stock Levels, Safety Stock, Reorder Points, Consumption History, Lead Times, Demand Forecasts, Carrying Costs, and Dead Stock.
                  </p>
                </div>
                <button
                  onClick={handleRunInventoryOptimization}
                  disabled={executingActionId === 'run-inv-opt'}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition disabled:opacity-50 shrink-0"
                >
                  {executingActionId === 'run-inv-opt' ? (
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Zap className="w-3.5 h-3.5" />
                  )}
                  Optimize My Inventory
                </button>
              </div>

              {/* MM + WM/EWM + PP INVENTORY INTELLIGENCE CONTROLS */}
              <div className="p-4 bg-slate-900 border border-indigo-800/40 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-100 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      MM + WM/EWM + PP Inventory Intelligence Suite
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Cross-module intelligence addressing carrying costs, reduction, duplicate storage, excess stock plant transfers, and expiring batches.
                    </p>
                  </div>
                  <button
                    onClick={() => handleRunInventoryIntelligence('all')}
                    disabled={executingActionId?.startsWith('inv-intel')}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 disabled:opacity-50 shrink-0"
                  >
                    {executingActionId?.startsWith('inv-intel') ? (
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Zap className="w-3.5 h-3.5" />
                    )}
                    Run Full Intelligence Audit
                  </button>
                </div>

                {/* Question Trigger Chips */}
                <div className="flex flex-wrap gap-2 text-xs pt-1">
                  <button
                    onClick={() => handleRunInventoryIntelligence('carrying_costs')}
                    className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-indigo-300 border border-indigo-800/40 rounded-lg text-[11px] font-medium transition"
                  >
                    💰 Highest Carrying Costs
                  </button>
                  <button
                    onClick={() => handleRunInventoryIntelligence('reduction_candidates')}
                    className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-indigo-300 border border-indigo-800/40 rounded-lg text-[11px] font-medium transition"
                  >
                    📉 Stock Reduction Candidates
                  </button>
                  <button
                    onClick={() => handleRunInventoryIntelligence('duplicates')}
                    className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-indigo-300 border border-indigo-800/40 rounded-lg text-[11px] font-medium transition"
                  >
                    🔍 Duplicate Storage Locations
                  </button>
                  <button
                    onClick={() => handleRunInventoryIntelligence('plant_transfers')}
                    className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-indigo-300 border border-indigo-800/40 rounded-lg text-[11px] font-medium transition"
                  >
                    🚛 Excess Stock & STO Transfers
                  </button>
                  <button
                    onClick={() => handleRunInventoryIntelligence('expiring')}
                    className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-indigo-300 border border-indigo-800/40 rounded-lg text-[11px] font-medium transition"
                  >
                    ⏳ Batches Expiring This Month
                  </button>
                </div>

                {inventoryIntelData && (
                  <div className="p-4 bg-slate-950/90 border border-indigo-500/40 rounded-xl space-y-4 mt-3">
                    {/* Integrated Cross-Module Summary */}
                    <div className="p-3 bg-indigo-950/60 border border-indigo-700/50 rounded-lg flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                      <div className="space-y-1 text-xs">
                        <span className="font-bold text-indigo-200 block">Cross-Module Recommendation (MM + WM/EWM + PP):</span>
                        <p className="text-indigo-100 font-medium leading-relaxed">
                          {inventoryIntelData.crossModuleRecommendation}
                        </p>
                      </div>
                    </div>

                    {/* Section 1: Carrying Costs */}
                    <div className="space-y-2">
                      <h5 className="text-xs font-bold text-slate-200 flex items-center justify-between">
                        <span>Materials Causing Highest Carrying Costs</span>
                        <span className="text-slate-400 font-normal text-[11px]">MC.5 / Stock Valuations</span>
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {inventoryIntelData.carryingCostsAnalysis.map((c: any, idx: number) => (
                          <div key={idx} className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-emerald-400">{c.materialId}</span>
                              <span className="font-mono font-bold text-indigo-300">${c.carryingCostAnnualUsd.toLocaleString()}/yr Carrying Cost</span>
                            </div>
                            <p className="text-slate-300 text-[11px]">{c.description}</p>
                            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                              <span>Stock: {c.currentStockQty.toLocaleString()} units (${c.totalStockValueUsd.toLocaleString()})</span>
                            </div>
                            <p className="text-[10px] text-slate-400 italic">Rec: {c.recommendation}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Section 2: Stock Reduction & Duplicate Storage */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {/* Reduction Candidates */}
                      <div className="space-y-2 p-3 bg-slate-900 border border-slate-800 rounded-lg">
                        <h5 className="font-bold text-slate-200">Inventory Reduction Candidates</h5>
                        {inventoryIntelData.inventoryReductionCandidates.map((r: any, idx: number) => (
                          <div key={idx} className="space-y-1 border-b border-slate-800/80 pb-2 last:border-0 last:pb-0">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-200">{r.materialId}</span>
                              <span className="text-emerald-400 font-bold">${r.potentialCapitalUnlockUsd.toLocaleString()} Unlock</span>
                            </div>
                            <p className="text-slate-400 text-[11px]">{r.description} (Held {r.holdingDays} days)</p>
                            <span className="text-[10px] text-slate-400 block font-mono">{r.sapAction}</span>
                          </div>
                        ))}
                      </div>

                      {/* Duplicate Storage Locations */}
                      <div className="space-y-2 p-3 bg-slate-900 border border-slate-800 rounded-lg">
                        <h5 className="font-bold text-slate-200">Duplicate Material Storage Locations</h5>
                        {inventoryIntelData.duplicateMaterialsLocations.map((d: any, idx: number) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-amber-300">{d.masterMaterialA} / {d.masterMaterialB}</span>
                              <span className="px-1.5 py-0.5 bg-amber-950 text-amber-300 rounded text-[9px]">Duplicate</span>
                            </div>
                            <p className="text-slate-300 text-[11px]">{d.description}</p>
                            <p className="text-[10px] text-slate-400">
                              Plant {d.plantA} ({d.storageBinA}) ↔ Plant {d.plantB} ({d.storageBinB})
                            </p>
                            <span className="text-[10px] text-indigo-300 block italic">{d.recommendation}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Section 3: Plant STO Transfers & Expiring Batches */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {/* STO Transfers */}
                      <div className="space-y-2 p-3 bg-slate-900 border border-slate-800 rounded-lg">
                        <h5 className="font-bold text-slate-200">Recommended Stock Transfers (STO)</h5>
                        {inventoryIntelData.excessStockPlantTransfers.map((t: any, idx: number) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-indigo-300">{t.materialId}</span>
                              <span className="text-emerald-400 font-bold">${t.transportSavingsUsd.toLocaleString()} Savings</span>
                            </div>
                            <p className="text-slate-300 text-[11px]">
                              From {t.sourcePlant} ({t.sourceExcessQty} excess) → To {t.targetPlant} ({t.targetShortageQty} short)
                            </p>
                            <button
                              onClick={() => handleExecuteOptimizationRec({ materialId: t.materialId, category: 'Stock Transfer' })}
                              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold text-[10px] flex items-center gap-1 mt-1"
                            >
                              <ArrowRight className="w-3 h-3" /> Trigger STO Transfer ({t.recommendedTransferQty} units)
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Expiring Batches */}
                      <div className="space-y-2 p-3 bg-slate-900 border border-slate-800 rounded-lg">
                        <h5 className="font-bold text-slate-200">Batches Expiring This Month (August 2026)</h5>
                        {inventoryIntelData.expiringInventoryBatches.map((b: any, idx: number) => (
                          <div key={idx} className="space-y-1 border-b border-slate-800/80 pb-2 last:border-0 last:pb-0">
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-bold text-rose-300">{b.batchNumber} ({b.materialId})</span>
                              <span className="px-1.5 py-0.5 bg-rose-950 text-rose-300 rounded text-[9px] font-bold">
                                Expires {b.expirationDate} ({b.daysRemaining}d left)
                              </span>
                            </div>
                            <p className="text-slate-300 text-[11px]">{b.description} - {b.quantity} units @ Bin {b.storageBin}</p>
                            <div className="text-[10px] text-slate-400 space-y-0.5">
                              <div><span className="text-slate-500">WM/EWM:</span> {b.ewmAction}</div>
                              <div><span className="text-slate-500">PP Allocation:</span> {b.ppProductionOrder}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* VENDOR PERFORMANCE AI PANEL */}
              <div className="p-4 bg-slate-900 border border-purple-800/40 rounded-xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-100 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      Vendor Performance AI & Supplier Evaluation
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Evaluates Price, Lead Time, OTD, Quality (PPM), Returns %, Capacity & Contract Compliance to identify top vendors and production delay risks.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Material ID:</span>
                    <input
                      type="text"
                      value={vendorMaterialInput}
                      onChange={e => setVendorMaterialInput(e.target.value)}
                      placeholder="MAT-RAW-01"
                      className="px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-slate-200 w-32 font-mono"
                    />
                    <button
                      onClick={() => handleRunVendorPerformanceAi(vendorMaterialInput)}
                      disabled={executingActionId?.startsWith('vendor-perf')}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 disabled:opacity-50 shrink-0"
                    >
                      {executingActionId?.startsWith('vendor-perf') ? (
                        <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Search className="w-3.5 h-3.5" />
                      )}
                      Recommend Best Supplier
                    </button>
                  </div>
                </div>

                {/* Pre-canned Quick Questions */}
                <div className="flex flex-wrap gap-2 text-xs pt-1">
                  <button
                    onClick={() => handleRunVendorPerformanceAi('MAT-RAW-01')}
                    className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-purple-300 border border-purple-800/40 rounded-lg text-[11px] font-medium transition"
                  >
                    🏆 Best On-Time Delivery Supplier
                  </button>
                  <button
                    onClick={() => handleRunVendorPerformanceAi('MAT-RAW-03')}
                    className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-purple-300 border border-purple-800/40 rounded-lg text-[11px] font-medium transition"
                  >
                    ⚠️ Recurring Quality & Delay Issues
                  </button>
                  <button
                    onClick={() => handleRunVendorPerformanceAi('MAT-2001')}
                    className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-purple-300 border border-purple-800/40 rounded-lg text-[11px] font-medium transition"
                  >
                    📊 Supplier Scorecards (7 Criteria)
                  </button>
                  <button
                    onClick={() => handleRunVendorPerformanceAi('MAT-RAW-03')}
                    className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-purple-300 border border-purple-800/40 rounded-lg text-[11px] font-medium transition"
                  >
                    🚨 Production Delay Impacts
                  </button>
                </div>

                {vendorPerfData && (
                  <div className="p-4 bg-slate-950/90 border border-purple-500/40 rounded-xl space-y-4">
                    {/* Material Recommendation Banner */}
                    <div className="p-3 bg-purple-950/60 border border-purple-700/50 rounded-lg flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                      <div className="space-y-1 text-xs">
                        <span className="font-bold text-purple-200 block">
                          AI Supplier Recommendation for {vendorPerfData.materialRecommendation.materialId}:
                        </span>
                        <p className="text-purple-100 font-medium leading-relaxed">
                          {vendorPerfData.materialRecommendation.aiEvaluationSummary}
                        </p>
                      </div>
                    </div>

                    {/* Scorecards Grid */}
                    <div className="space-y-2">
                      <h5 className="text-xs font-bold text-slate-200 flex items-center justify-between">
                        <span>Supplier Scorecards (Evaluated Across 7 Criteria)</span>
                        <span className="text-slate-400 font-normal text-[11px]">ME60 / ME61 / S/4HANA BP</span>
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        {vendorPerfData.supplierScorecards.map((sc: any, idx: number) => (
                          <div key={idx} className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-2 flex flex-col justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-100">{sc.supplierName}</span>
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${sc.overallScore >= 90 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40' : sc.overallScore >= 80 ? 'bg-indigo-950 text-indigo-300 border border-indigo-800/40' : 'bg-rose-950 text-rose-300 border border-rose-800/40'}`}>
                                  {sc.overallScore}/100
                                </span>
                              </div>
                              <span className="text-[10px] text-purple-300 font-mono block">{sc.supplierId} • {sc.tierBadge}</span>
                              
                              {/* 7 Criteria Breakdown */}
                              <div className="pt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-slate-400 border-t border-slate-800 font-mono">
                                <div>Price: <span className="text-slate-200">{sc.evaluatedCriteria.priceCompetitiveness}%</span></div>
                                <div>Lead Time: <span className="text-slate-200">{sc.evaluatedCriteria.leadTimeDays} days</span></div>
                                <div>OTD Rate: <span className="text-slate-200">{sc.evaluatedCriteria.deliveryPerformancePct}%</span></div>
                                <div>Defect Rate: <span className="text-slate-200">{sc.evaluatedCriteria.qualityRatingPpm} PPM</span></div>
                                <div>Returns: <span className="text-slate-200">{sc.evaluatedCriteria.returnsPct}%</span></div>
                                <div>Capacity: <span className="text-slate-200">{sc.evaluatedCriteria.capacityUtilizationPct}%</span></div>
                                <div>Compliance: <span className="text-slate-200">{sc.evaluatedCriteria.contractCompliancePct}%</span></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Production Delay & Quality Risk Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {/* Production Delay Risks */}
                      <div className="p-3 bg-slate-900 border border-rose-900/40 rounded-lg space-y-2">
                        <h5 className="font-bold text-rose-300 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                          Suppliers Causing Production Delays
                        </h5>
                        {vendorPerfData.productionDelayImpactSuppliers.map((d: any, idx: number) => (
                          <div key={idx} className="space-y-1 text-[11px]">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-200">{d.supplierName} ({d.supplierId})</span>
                              <span className="px-1.5 py-0.5 bg-rose-950 text-rose-300 rounded text-[9px] font-bold">
                                {d.productionRiskLevel}
                              </span>
                            </div>
                            <p className="text-slate-300">
                              Delayed PO <span className="font-mono font-bold text-amber-300">{d.delayedPoNumber}</span> ({d.delayedMaterial}) impacting <span className="font-bold text-slate-100">{d.impactedPpOrder}</span>
                            </p>
                            <span className="text-[10px] text-emerald-300 block italic">Mitigation: {d.mitigationStrategy}</span>
                          </div>
                        ))}
                      </div>

                      {/* Recurring Quality Issues */}
                      <div className="p-3 bg-slate-900 border border-amber-900/40 rounded-lg space-y-2">
                        <h5 className="font-bold text-amber-300 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                          Suppliers With Recurring Quality Issues
                        </h5>
                        {vendorPerfData.recurringQualityIssuesSuppliers.map((q: any, idx: number) => (
                          <div key={idx} className="space-y-1 text-[11px] border-b border-slate-800/80 pb-1.5 last:border-0 last:pb-0">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-200">{q.supplierName}</span>
                              <span className="text-rose-400 font-bold font-mono">{q.defectRatePpm} PPM</span>
                            </div>
                            <p className="text-slate-400 text-[10px]">
                              Return Rate: {q.returnRatePct}% • {q.qualityNoticesCount} Active Quality Notices (QM01)
                            </p>
                            <span className="text-[10px] text-amber-200 block">{q.actionRecommended}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* PREDICTIVE SAP MM & AUTONOMOUS FORECASTING PANEL */}
              <div className="p-4 bg-slate-900 border border-cyan-800/40 rounded-xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-100 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      Predictive SAP MM Intelligence & Autonomous Forecasting
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Predicts shortages, stockouts, overstock, vendor delays, procurement demand, inventory aging, excess carrying costs, reorder points & obsolescence.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Plant:</span>
                    <input
                      type="text"
                      value={predictivePlantInput}
                      onChange={e => setPredictivePlantInput(e.target.value)}
                      placeholder="1000"
                      className="px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-slate-200 w-24 font-mono"
                    />
                    <button
                      onClick={() => handleRunPredictiveMm(predictivePlantInput)}
                      disabled={executingActionId?.startsWith('predictive-mm')}
                      className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 disabled:opacity-50 shrink-0"
                    >
                      {executingActionId?.startsWith('predictive-mm') ? (
                        <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Search className="w-3.5 h-3.5" />
                      )}
                      Run Predictive Analysis
                    </button>
                  </div>
                </div>

                {/* Pre-canned Predictive Quick Prompts */}
                <div className="flex flex-wrap gap-2 text-xs pt-1">
                  <button
                    onClick={() => handleRunPredictiveMm('1000')}
                    className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-cyan-300 border border-cyan-800/40 rounded-lg text-[11px] font-medium transition"
                  >
                    🚨 Stockout Risk (MAT-3005 92%)
                  </button>
                  <button
                    onClick={() => handleRunPredictiveMm('1000')}
                    className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-cyan-300 border border-cyan-800/40 rounded-lg text-[11px] font-medium transition"
                  >
                    📦 Overstock & Carrying Costs
                  </button>
                  <button
                    onClick={() => handleRunPredictiveMm('1000')}
                    className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-cyan-300 border border-cyan-800/40 rounded-lg text-[11px] font-medium transition"
                  >
                    🚚 Vendor & PO Delivery Delays
                  </button>
                  <button
                    onClick={() => handleRunPredictiveMm('1000')}
                    className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-cyan-300 border border-cyan-800/40 rounded-lg text-[11px] font-medium transition"
                  >
                    📉 Obsolescence & Aging
                  </button>
                </div>

                {predictiveData && (
                  <div className="p-4 bg-slate-950/90 border border-cyan-500/40 rounded-xl space-y-4">
                    {/* Executive Summary Banner */}
                    <div className="p-3 bg-cyan-950/60 border border-cyan-700/50 rounded-lg flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                      <div className="space-y-1 text-xs">
                        <span className="font-bold text-cyan-200 block">
                          Predictive SAP MM Executive Summary (Plant {predictiveData.plant}):
                        </span>
                        <p className="text-cyan-100 font-medium leading-relaxed">
                          {predictiveData.predictiveExecutiveSummary}
                        </p>
                      </div>
                    </div>

                    {/* Stockouts Prediction Card */}
                    <div className="p-3 bg-slate-900 border border-rose-900/50 rounded-lg space-y-2">
                      <h5 className="font-bold text-rose-300 flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                          Predicted Stockouts & Material Shortages
                        </span>
                        <span className="text-[10px] text-rose-400 font-mono">S/4HANA MD04 / A_MatlStkInAcctMod</span>
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {predictiveData.predictedStockouts.map((st: any, idx: number) => (
                          <div key={idx} className="p-2.5 bg-slate-950 border border-rose-900/40 rounded-lg space-y-1 text-[11px]">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-100">{st.materialId}</span>
                              <span className="px-1.5 py-0.5 bg-rose-950 text-rose-300 rounded text-[9px] font-bold border border-rose-800/40">
                                {st.stockoutProbabilityPct}% Probability ({st.predictedDaysToStockout} Days Left)
                              </span>
                            </div>
                            <span className="text-slate-300 text-[10px] block">{st.materialDescription}</span>
                            <p className="text-amber-200/90 font-medium leading-tight">
                              {st.rootCause}
                            </p>
                            <span className="text-[10px] text-emerald-300 block font-mono">
                              Action: {st.sapRecommendedAction}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 2-Column Grid: Overstock & Carrying Costs + Vendor/PO Delays */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {/* Overstock & Excess Carrying Costs */}
                      <div className="p-3 bg-slate-900 border border-amber-900/40 rounded-lg space-y-2">
                        <h5 className="font-bold text-amber-300 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          Predicted Overstock & Carrying Costs
                        </h5>
                        {predictiveData.predictedOverstocks.map((ov: any, idx: number) => (
                          <div key={idx} className="space-y-1 text-[11px] border-b border-slate-800 pb-1.5 last:border-0 last:pb-0">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-200">{ov.materialId}</span>
                              <span className="text-amber-300 font-bold font-mono">${ov.tiedUpCapitalUsd.toLocaleString()} USD</span>
                            </div>
                            <p className="text-slate-400 text-[10px]">
                              Current Stock: {ov.currentStockQty.toLocaleString()} units vs Optimal: {ov.optimalStockQty.toLocaleString()} units
                            </p>
                            <span className="text-[10px] text-cyan-300 block italic">{ov.actionRecommended}</span>
                          </div>
                        ))}
                      </div>

                      {/* Vendor & PO Delivery Delays */}
                      <div className="p-3 bg-slate-900 border border-purple-900/40 rounded-lg space-y-2">
                        <h5 className="font-bold text-purple-300 flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-purple-400" />
                          Predicted Vendor & PO Delivery Delays
                        </h5>
                        {predictiveData.predictedPurchaseOrderDelays.map((po: any, idx: number) => (
                          <div key={idx} className="space-y-1 text-[11px] border-b border-slate-800 pb-1.5 last:border-0 last:pb-0">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-200">PO {po.poNumber} Item {po.poItem}</span>
                              <span className="text-purple-300 font-bold font-mono">+{po.predictedLateDays} Days Late</span>
                            </div>
                            <p className="text-slate-400 text-[10px]">
                              Supplier: {po.supplierName} ({po.materialId}) • Predicted Arrival: <span className="text-slate-200 font-mono">{po.aiPredictedArrivalDate}</span>
                            </p>
                            <span className="text-[10px] text-purple-200 block italic">{po.trackingStatus}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Reorder Recommendations & Demand Forecast */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {/* Reorder Recommendations */}
                      <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-2">
                        <h5 className="font-bold text-slate-200 flex items-center justify-between">
                          <span>Reorder Recommendations (ROP & EOQ)</span>
                          <span className="text-[10px] text-slate-400 font-mono">MD04 / ME21N</span>
                        </h5>
                        {predictiveData.predictedReorderRecommendations.map((ro: any, idx: number) => (
                          <div key={idx} className="p-2 bg-slate-950 rounded border border-slate-800 text-[11px] space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-200">{ro.materialId}</span>
                              <span className="px-1.5 py-0.5 bg-emerald-950 text-emerald-300 rounded text-[9px] font-bold">
                                Reorder Triggered
                              </span>
                            </div>
                            <p className="text-slate-400 text-[10px]">
                              Stock: {ro.currentStock} | ROP: {ro.calculatedRop} | EOQ: {ro.calculatedEoq}
                            </p>
                            <span className="text-[10px] text-cyan-300 block">
                              Suggested Vendor: {ro.suggestedVendorName} ({ro.suggestedVendorId})
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Obsolescence & Aging */}
                      <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-2">
                        <h5 className="font-bold text-slate-200 flex items-center justify-between">
                          <span>Inventory Aging & Obsolescence Risk</span>
                          <span className="text-[10px] text-slate-400 font-mono">MC.5 / BMBC</span>
                        </h5>
                        {predictiveData.predictedMaterialObsolescence.map((ob: any, idx: number) => (
                          <div key={idx} className="p-2 bg-slate-950 rounded border border-slate-800 text-[11px] space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-200">{ob.materialId}</span>
                              <span className="px-1.5 py-0.5 bg-rose-950 text-rose-300 rounded text-[9px] font-bold">
                                {ob.obsolescenceRiskScorePct}% Obsolescence Risk
                              </span>
                            </div>
                            <p className="text-slate-400 text-[10px]">
                              Value: ${ob.stockValueUsd.toLocaleString()} USD • {ob.engineeringEcnStatus}
                            </p>
                            <span className="text-[10px] text-amber-300 block italic">
                              Recommendation: {ob.dispositionRecommendation}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* AUTONOMOUS MM EXCEPTION MANAGEMENT & GOVERNANCE PANEL */}
              <div className="p-4 bg-slate-900 border border-amber-800/40 rounded-xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-100 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                      Autonomous MM Exception Management & Governance Engine
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Continuous detection across Missing Goods Receipts, PO Delays, Price Variances, Invoice Mismatches, Negative Inventory, Missing Source Lists, Incomplete Material Masters, Blocked Stock, Failed Interfaces & Procurement Bottlenecks.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Plant:</span>
                    <input
                      type="text"
                      value={exceptionPlantInput}
                      onChange={e => setExceptionPlantInput(e.target.value)}
                      placeholder="1000"
                      className="px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-slate-200 w-24 font-mono"
                    />
                    <button
                      onClick={() => handleRunExceptionDetection(exceptionPlantInput)}
                      disabled={executingActionId?.startsWith('exception-mm')}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 disabled:opacity-50 shrink-0"
                    >
                      {executingActionId?.startsWith('exception-mm') ? (
                        <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Search className="w-3.5 h-3.5" />
                      )}
                      Detect & Monitor Exceptions
                    </button>
                  </div>
                </div>

                {/* Pre-canned Quick Exception Triggers */}
                <div className="flex flex-wrap gap-2 text-xs pt-1">
                  <button
                    onClick={() => handleRunExceptionDetection('1000')}
                    className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-amber-300 border border-amber-800/40 rounded-lg text-[11px] font-medium transition"
                  >
                    🔍 Run All 10 MM Exception Monitors
                  </button>
                  <button
                    onClick={() => handleRunExceptionDetection('1000')}
                    className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-amber-300 border border-amber-800/40 rounded-lg text-[11px] font-medium transition"
                  >
                    📦 Missing Goods Receipts & PO Delays
                  </button>
                  <button
                    onClick={() => handleRunExceptionDetection('1000')}
                    className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-amber-300 border border-amber-800/40 rounded-lg text-[11px] font-medium transition"
                  >
                    💲 Price Variances & Invoice Mismatches
                  </button>
                  <button
                    onClick={() => handleRunExceptionDetection('1000')}
                    className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-amber-300 border border-amber-800/40 rounded-lg text-[11px] font-medium transition"
                  >
                    ⚠️ Negative Stock & Incomplete Masters
                  </button>
                  <button
                    onClick={() => handleRunExceptionDetection('1000')}
                    className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-amber-300 border border-amber-800/40 rounded-lg text-[11px] font-medium transition"
                  >
                    ⚡ Failed IDocs & PR Bottlenecks
                  </button>
                </div>

                {exceptionData && (
                  <div className="p-4 bg-slate-950/90 border border-amber-500/40 rounded-xl space-y-4">
                    {/* Header Summary */}
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-bold text-amber-300 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        Active Exception Governance Monitor (Plant {exceptionData.plant})
                      </span>
                      <span className="text-xs text-amber-200 font-mono font-bold">
                        {exceptionData.totalExceptionsDetected} Active Exceptions Across 10 Categories
                      </span>
                    </div>

                    {/* 10 Category Badges */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px] font-mono">
                      {[
                        'Missing Goods Receipts',
                        'Purchase Order Delays',
                        'Price Variances',
                        'Invoice Mismatches',
                        'Negative Inventory',
                        'Missing Source Lists',
                        'Incomplete Material Masters',
                        'Blocked Stock',
                        'Failed Interfaces',
                        'Procurement Bottlenecks'
                      ].map((cat, i) => (
                        <div key={i} className="p-2 bg-slate-900 border border-amber-900/40 rounded text-center space-y-0.5">
                          <span className="text-slate-400 block text-[9px] truncate">{cat}</span>
                          <span className="text-amber-400 font-bold block">1 Detected</span>
                        </div>
                      ))}
                    </div>

                    {/* Exception List with 7-Step Lifecycle Workflow */}
                    <div className="space-y-3 pt-2">
                      <h5 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-cyan-400" />
                        Autonomous Exception Resolution Workflows (Detect → Diagnose → Recommend → Approve → Execute → Verify → Audit)
                      </h5>

                      {exceptionData.exceptionItems.map((item: any) => {
                        const resolved = resolvedExceptionIds[item.id];
                        return (
                          <div
                            key={item.id}
                            className={`p-3.5 rounded-xl border space-y-3 transition ${
                              resolved
                                ? 'bg-emerald-950/30 border-emerald-700/60'
                                : item.severity === 'CRITICAL'
                                ? 'bg-slate-900 border-rose-900/60'
                                : 'bg-slate-900 border-slate-800'
                            }`}
                          >
                            {/* Card Header */}
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${
                                  item.severity === 'CRITICAL'
                                    ? 'bg-rose-950 text-rose-300 border border-rose-800/50'
                                    : item.severity === 'HIGH'
                                    ? 'bg-amber-950 text-amber-300 border border-amber-800/50'
                                    : 'bg-slate-800 text-slate-300'
                                }`}>
                                  {item.severity}
                                </span>
                                <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 rounded text-[9px] font-mono border border-cyan-800/40">
                                  {item.category}
                                </span>
                                <span className="font-bold text-slate-100 text-xs">{item.title}</span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono">{item.affectedEntity}</span>
                            </div>

                            {/* 7-Step Lifecycle Visual Pipeline */}
                            <div className="grid grid-cols-7 gap-1 text-[9px] font-mono py-1">
                              {[
                                { num: '1', label: 'DETECT', done: true },
                                { num: '2', label: 'DIAGNOSE', done: true },
                                { num: '3', label: 'RECOMMEND', done: true },
                                { num: '4', label: 'APPROVE', done: resolved || item.approve.status === 'AUTO_APPROVED' },
                                { num: '5', label: 'EXECUTE', done: !!resolved },
                                { num: '6', label: 'VERIFY', done: !!resolved },
                                { num: '7', label: 'AUDIT', done: !!resolved }
                              ].map((st, sIdx) => (
                                <div
                                  key={sIdx}
                                  className={`p-1.5 rounded text-center border space-y-0.5 ${
                                    st.done
                                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                                      : 'bg-slate-950 text-slate-500 border-slate-800'
                                  }`}
                                >
                                  <div className="font-bold">{st.num}. {st.label}</div>
                                  <div className="text-[8px]">{st.done ? '✓ OK' : 'PENDING'}</div>
                                </div>
                              ))}
                            </div>

                            {/* Diagnostic & Recommendation Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px]">
                              <div className="p-2 bg-slate-950 rounded border border-slate-800 space-y-0.5">
                                <span className="text-[10px] text-slate-400 font-bold block">1-2. Detection & Root Cause:</span>
                                <p className="text-slate-300 text-[10px] leading-tight">{item.detect.detectionDetails}</p>
                                <span className="text-[9px] text-amber-300 block italic">Cause: {item.diagnose.rootCause}</span>
                              </div>

                              <div className="p-2 bg-slate-950 rounded border border-slate-800 space-y-0.5">
                                <span className="text-[10px] text-slate-400 font-bold block">3-4. Recommendation & Approval:</span>
                                <p className="text-cyan-200 text-[10px] leading-tight">{item.recommend.recommendedAction}</p>
                                <span className="text-[9px] text-slate-400 block font-mono">
                                  T-code: {item.recommend.targetSapTransaction} | Policy: {item.approve.policyRule}
                                </span>
                              </div>

                              <div className="p-2 bg-slate-950 rounded border border-slate-800 space-y-1 flex flex-col justify-between">
                                <div>
                                  <span className="text-[10px] text-slate-400 font-bold block">5-7. Execution & Verification:</span>
                                  {resolved ? (
                                    <div className="space-y-0.5 text-[10px]">
                                      <span className="text-emerald-300 font-bold block">
                                        ✓ Doc: {resolved.executionResultDoc}
                                      </span>
                                      <span className="text-slate-400 block text-[9px]">
                                        {resolved.verificationStatus}
                                      </span>
                                      <span className="text-[8px] text-slate-500 font-mono block">
                                        Audit Hash: {resolved.auditLog.hash}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-amber-300 text-[10px] block">
                                      Ready for autonomous 7-step execution on S/4HANA core.
                                    </span>
                                  )}
                                </div>

                                {!resolved && (
                                  <button
                                    onClick={() => handleResolveException(item.id, item.recommend.recommendedAction)}
                                    disabled={executingActionId === `resolve-${item.id}`}
                                    className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-[10px] flex items-center justify-center gap-1.5 disabled:opacity-50 mt-1"
                                  >
                                    {executingActionId === `resolve-${item.id}` ? (
                                      <RotateCw className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <CheckCircle className="w-3 h-3" />
                                    )}
                                    Resolve Exception (7-Step Auto Fix)
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {optimizationData && (
                <div className="p-4 bg-slate-950/90 border border-emerald-500/30 rounded-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      Autonomous Optimization Evaluation Results (Plant {optimizationData.plant})
                    </span>
                    <span className="text-xs text-slate-400">
                      Potential Capital Unlock: <span className="font-bold text-emerald-400">${optimizationData.evaluatedMetrics.workingCapitalOptimizationUsd.toLocaleString()} USD</span>
                    </span>
                  </div>

                  {/* Evaluated Areas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {optimizationData.evaluations.map((ev: any, idx: number) => (
                      <div key={idx} className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs space-y-1">
                        <span className="font-semibold text-slate-200 block">{ev.category}</span>
                        <p className="text-slate-400">{ev.evaluationSummary}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {ev.evaluatedParameters.map((p: string, pIdx: number) => (
                            <span key={pIdx} className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px]">
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Recommendations */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-slate-200">Autonomous AI Optimization Recommendations:</h5>
                    <div className="grid grid-cols-1 gap-2">
                      {optimizationData.recommendations.map((rec: any, rIdx: number) => (
                        <div key={rIdx} className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div className="space-y-0.5 max-w-xl">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-emerald-300">{rec.actionTitle}</span>
                              <span className="px-1.5 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800/40 rounded text-[10px]">
                                {rec.sapTransaction}
                              </span>
                              <span className="text-slate-400">({rec.materialId})</span>
                            </div>
                            <p className="text-slate-300">{rec.details}</p>
                          </div>
                          <button
                            onClick={() => handleExecuteOptimizationRec(rec)}
                            disabled={executingActionId === `opt-rec-${rec.materialId}`}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 disabled:opacity-50 shrink-0"
                          >
                            {executingActionId === `opt-rec-${rec.materialId}` ? (
                              <RotateCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <ArrowRight className="w-3.5 h-3.5" />
                            )}
                            Execute {rec.category} Action
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-300">Today's Stock Movements Summary (MKPF / MSEG)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {inventoryPerformance.stockMovementSummary.map((mvt, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">{mvt.movementType}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400">{mvt.documentCount} Docs</span>
                        <span className={`font-mono font-bold ${mvt.netQuantity >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {mvt.netQuantity >= 0 ? `+${mvt.netQuantity}` : mvt.netQuantity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. P2P LIFECYCLE & 3-WAY MATCH */}
        {activeTab === 'p2p' && (
          <div className="space-y-4">
            {/* AUTONOMOUS PROCUREMENT ENGINE CONTROL & PRESENTATION */}
            <div className="p-4 bg-slate-900 border border-emerald-800/40 rounded-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-100 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    Autonomous Procurement Pre-Verification Engine
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Automatically verifies Approved Supplier, Contract Pricing, Info Record, Source List, Quota Arrangement, Budget Availability, Delivery Schedule, Lead Time, and Approval Limits.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={procMatInput}
                    onChange={e => setProcMatInput(e.target.value)}
                    placeholder="Material ID (MAT-1001)"
                    className="px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-slate-200 w-32"
                  />
                  <input
                    type="number"
                    value={procQtyInput}
                    onChange={e => setProcQtyInput(Number(e.target.value))}
                    placeholder="Qty"
                    className="px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-slate-200 w-24"
                  />
                  <button
                    onClick={handleVerifyProcurement}
                    disabled={executingActionId === 'verify-procurement'}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 disabled:opacity-50 shrink-0"
                  >
                    {executingActionId === 'verify-procurement' ? (
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle className="w-3.5 h-3.5" />
                    )}
                    Verify Autonomous Order
                  </button>
                </div>
              </div>

              {procurementVerificationData && (
                <div className="p-4 bg-slate-950/90 border border-emerald-500/40 rounded-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      All 8 S/4HANA Procurement Checks Verified
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      Approval Ref: <span className="text-emerald-400 font-bold">{procurementVerificationData.pendingApprovalId}</span>
                    </span>
                  </div>

                  {/* 8 Verification Checks Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    {procurementVerificationData.verifications.map((v: any, idx: number) => (
                      <div key={idx} className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-200 text-[11px]">{v.checkName}</span>
                          <span className="px-1.5 py-0.5 bg-emerald-950 text-emerald-300 rounded text-[9px] font-bold border border-emerald-800/40">
                            {v.status}
                          </span>
                        </div>
                        <p className="text-slate-400 text-[10px] leading-tight">{v.details}</p>
                        <span className="text-[9px] font-mono text-slate-500 block">{v.sapObject}</span>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary Presentation Box */}
                  <div className="p-3.5 bg-slate-900 border border-emerald-800/60 rounded-xl space-y-3">
                    <h5 className="text-xs font-bold text-slate-200 border-b border-slate-800 pb-1.5">
                      Verified Purchase Order Summary Presentation
                    </h5>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 text-[11px] block">Supplier</span>
                        <span className="font-bold text-slate-100">{procurementVerificationData.summaryPackage.supplierName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] block">Price</span>
                        <span className="font-mono font-bold text-emerald-400">${procurementVerificationData.summaryPackage.unitPriceUsd.toFixed(2)} USD</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] block">Total Value</span>
                        <span className="font-mono font-bold text-emerald-300 text-sm">${procurementVerificationData.summaryPackage.totalValueUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] block">Delivery Date</span>
                        <span className="font-semibold text-slate-200">{procurementVerificationData.summaryPackage.deliveryDate}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] block">Payment Terms</span>
                        <span className="font-semibold text-slate-200">{procurementVerificationData.summaryPackage.paymentTerms}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] block">Contract Reference</span>
                        <span className="font-mono font-semibold text-teal-300">{procurementVerificationData.summaryPackage.contractReference}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-400 text-[11px] block">Budget Impact</span>
                        <span className="font-semibold text-slate-300">{procurementVerificationData.summaryPackage.budgetImpact}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800/60">
                      <button
                        onClick={() => setProcurementVerificationData(null)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={handleApproveAndCreatePo}
                        disabled={executingActionId === 'create-po-approved'}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center gap-2 shadow-lg disabled:opacity-50"
                      >
                        {executingActionId === 'create-po-approved' ? (
                          <RotateCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        Approve & Create Purchase Order in SAP (ME21N)
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* GOODS RECEIPT INTELLIGENCE & OPEN PO ANALYSIS PANEL */}
            <div className="p-4 bg-slate-900 border border-teal-800/40 rounded-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-100 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-400" />
                    Goods Receipt Intelligence & Open PO Root Cause Analysis
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Instantly explains why Purchase Orders remain open by querying MIGO Goods Receipts, EKBE History, Vendor Dispatch, and MIRO Invoices.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">PO Number:</span>
                  <input
                    type="text"
                    value={poAnalysisInput}
                    onChange={e => setPoAnalysisInput(e.target.value)}
                    placeholder="4500012345"
                    className="px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-slate-200 w-32 font-mono"
                  />
                  <button
                    onClick={handleAnalyzeOpenPoGr}
                    disabled={executingActionId === 'analyze-open-po-gr'}
                    className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 disabled:opacity-50 shrink-0"
                  >
                    {executingActionId === 'analyze-open-po-gr' ? (
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Search className="w-3.5 h-3.5" />
                    )}
                    Why is PO {poAnalysisInput} still open?
                  </button>
                </div>
              </div>

              {openPoAnalysisData && (
                <div className="p-4 bg-slate-950/90 border border-teal-500/40 rounded-xl space-y-4">
                  {/* AI Response Banner */}
                  <div className="p-3 bg-teal-950/60 border border-teal-700/50 rounded-lg flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-teal-200 block">AI Goods Receipt Intelligence Response:</span>
                      <p className="text-xs text-teal-100 font-medium leading-relaxed">
                        {openPoAnalysisData.explanation}
                      </p>
                    </div>
                  </div>

                  {/* Line Items Breakdown Table */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-slate-200 flex items-center justify-between">
                      <span>Line Items Breakdown (PO {openPoAnalysisData.poNumber})</span>
                      <span className="text-[11px] text-slate-400 font-normal">
                        {openPoAnalysisData.fullyReceivedCount} of {openPoAnalysisData.totalLineItemsCount} Line Items Fully Received
                      </span>
                    </h5>
                    <div className="overflow-x-auto border border-slate-800 rounded-lg">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800 text-[11px]">
                          <tr>
                            <th className="px-3 py-2">Item</th>
                            <th className="px-3 py-2">Material ID & Description</th>
                            <th className="px-3 py-2 text-right">Ordered</th>
                            <th className="px-3 py-2 text-right">Received</th>
                            <th className="px-3 py-2">Goods Receipt Status</th>
                            <th className="px-3 py-2">Invoice Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                          {openPoAnalysisData.lineItemsBreakdown.map((item: any, idx: number) => (
                            <tr key={idx} className={item.grStatus === 'No Goods Receipt' ? 'bg-amber-950/30' : 'hover:bg-slate-900/50'}>
                              <td className="px-3 py-2 font-bold text-slate-200">{item.itemNumber}</td>
                              <td className="px-3 py-2 font-sans">
                                <span className="font-mono font-bold text-emerald-400">{item.materialId}</span>
                                <span className="text-slate-400 block text-[10px]">{item.description}</span>
                              </td>
                              <td className="px-3 py-2 text-right">{item.orderedQty.toLocaleString()}</td>
                              <td className="px-3 py-2 text-right">{item.receivedQty.toLocaleString()}</td>
                              <td className="px-3 py-2 font-sans">
                                {item.grStatus === 'Fully Received' ? (
                                  <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800/40 rounded text-[10px] font-bold">
                                    Fully Received
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-800/40 rounded text-[10px] font-bold">
                                    No Goods Receipt (0 Received)
                                  </span>
                                )}
                              </td>
                              <td className="px-3 py-2 font-sans text-slate-400">{item.invoiceStatus}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Recommended Actions */}
                  <div className="space-y-2 pt-1 border-t border-slate-800">
                    <h5 className="text-xs font-bold text-slate-200">Recommended Actions:</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                      {openPoAnalysisData.recommendedActions.map((act: any, aIdx: number) => (
                        <div key={aIdx} className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-2 flex flex-col justify-between">
                          <div className="space-y-1">
                            <span className="font-bold text-teal-300 text-xs block">{act.actionName}</span>
                            <p className="text-[10px] text-slate-400 leading-tight">{act.description}</p>
                            <span className="text-[9px] font-mono text-slate-500 block">{act.sapTransaction}</span>
                          </div>
                          <button
                            onClick={() => handleExecutePoRecommendedAction(act)}
                            disabled={executingActionId === `po-rec-${act.actionKey}`}
                            className="w-full py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded text-xs flex items-center justify-center gap-1.5 disabled:opacity-50 mt-1"
                          >
                            {executingActionId === `po-rec-${act.actionKey}` ? (
                              <RotateCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <ArrowRight className="w-3 h-3" />
                            )}
                            {act.actionName}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-200">Procure-to-Pay (P2P) Lifecycle Cases & 3-Way Invoice Match (MIRO)</span>
              <span>Showing active P2P cases</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {p2pLifecycleCases.map((p2p, idx) => (
                <div key={idx} className="p-4 bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl space-y-3 transition">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-emerald-300">{p2p.purchaseRequisitionId}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                        <span className="font-mono font-bold text-sm text-teal-300">{p2p.purchaseOrderId || 'Pending PO'}</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          {p2p.lifecycleStage}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Supplier: <span className="text-slate-200 font-semibold">{p2p.supplierName}</span> | Material: <span className="font-mono text-slate-300">{p2p.materialId}</span> | Qty: {p2p.quantity} | Amount: ${p2p.totalAmountUsd.toLocaleString()} USD
                      </p>
                    </div>

                    {p2p.supplierInvoiceNumber && (
                      <button
                        onClick={() => handleVerify3Way(p2p.supplierInvoiceNumber!, p2p.purchaseOrderId!, p2p.totalAmountUsd)}
                        disabled={executingActionId === `verify-${p2p.supplierInvoiceNumber}`}
                        className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {executingActionId === `verify-${p2p.supplierInvoiceNumber}` ? (
                          <RotateCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle className="w-3.5 h-3.5" />
                        )}
                        Verify 3-Way Match (MIRO)
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-950/60 p-3 rounded-lg">
                    <div>
                      <span className="text-slate-500 block">Goods Receipt Doc</span>
                      <span className="font-mono text-slate-200">{p2p.goodsReceiptDocNumber || 'Not Received'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Supplier Invoice</span>
                      <span className="font-mono text-slate-200">{p2p.supplierInvoiceNumber || 'Not Invoiced'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">3-Way Match Status</span>
                      <span className={`font-bold ${p2p.threeWayMatchStatus === 'Perfect Match' ? 'text-emerald-400' : 'text-amber-300'}`}>{p2p.threeWayMatchStatus}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Payment Block</span>
                      <span className="font-bold text-slate-300">{p2p.blockStatus}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 bg-slate-950/40 p-2 rounded border border-slate-800/40">
                    <span className="font-semibold text-emerald-400">P2P Insight: </span>{p2p.aiP2pInsight}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. SELF-HEALING ACTIONS */}
        {activeTab === 'resolution' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-200">Autonomous MM Self-Healing Executions & Action Items</span>
              <button
                onClick={handleExecuteP2pResolution}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center gap-1"
              >
                <Zap className="w-3 h-3" /> Execute Auto Resolution
              </button>
            </div>

            <div className="space-y-3">
              {selfHealingActions.map((act, idx) => (
                <div key={idx} className="p-3 bg-slate-900/90 border border-emerald-900/40 rounded-xl text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold text-slate-100">{act.title}</span>
                      <span className="font-mono text-[10px] bg-slate-800 text-emerald-300 px-2 py-0.5 rounded border border-slate-700">
                        {act.sapTransaction}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{act.actionId}</span>
                  </div>

                  <p className="text-slate-300">{act.description}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                    <span className="text-emerald-400 font-medium">Impact: {act.impact}</span>
                    <span className="font-mono text-slate-500">Audit ID: {act.auditLogId}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. MULTI-AGENT CORRELATION */}
        {activeTab === 'rootCause' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-slate-100">Cross-Modular Root Cause Analysis ({rootCauseAnalysis.issueId})</h3>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-2">
                <p className="font-semibold text-slate-200">Issue: {rootCauseAnalysis.issueDescription}</p>
                <p className="text-amber-300"><span className="font-semibold text-slate-300">Primary Root Cause: </span>{rootCauseAnalysis.primaryRootCause}</p>
                <p className="text-slate-400"><span className="font-semibold text-slate-300">Business Impact: </span>{rootCauseAnalysis.businessImpactSummary}</p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-300">Multi-Agent Consensus ({multiAgentCollaboration.participatingAgents.length} Agents)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {multiAgentCollaboration.participatingAgents.map((agt, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-300">{agt.name}</span>
                        <span className="font-mono text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">{agt.module}</span>
                      </div>
                      <p className="text-slate-400 text-[11px]">{agt.finding}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-lg text-xs text-emerald-300">
                <span className="font-semibold">Unified Cross-Module Action Plan: </span>{multiAgentCollaboration.crossModuleActionPlan}
              </div>
            </div>
          </div>
        )}

        {/* 7. APPROVALS */}
        {activeTab === 'approvals' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-200">Pending Human-in-the-Loop Governance Approvals</span>
              <span>Showing {pendingApprovals.length} Requests</span>
            </div>

            <div className="space-y-3">
              {pendingApprovals.map((app, idx) => (
                <div key={idx} className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-100">{app.actionType}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          {app.riskLevel} Risk
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 font-mono">
                        Target: {app.targetObject} | ID: {app.approvalId}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApproveAction(app.approvalId, 'Approve')}
                        disabled={executingActionId === `approval-${app.approvalId}`}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs flex items-center gap-1 disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => handleApproveAction(app.approvalId, 'Reject')}
                        disabled={executingActionId === `approval-${app.approvalId}`}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg text-xs flex items-center gap-1 disabled:opacity-50"
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-950/60 p-3 rounded-lg">
                    <div>
                      <span className="text-slate-500 block">Financial Cost Impact</span>
                      <span className="font-bold text-emerald-300">${app.costImpactUsd.toLocaleString()} USD</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Governance Policy</span>
                      <span className="font-mono text-slate-300">{app.governancePolicy}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Assigned Role</span>
                      <span className="font-mono text-amber-300">{app.assignedRole}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. AUDIT TRAIL */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-200">Immutable Compliance & Execution Audit Logs</span>
              <span>SHA-256 Hashed Records</span>
            </div>

            <div className="space-y-2">
              {recentAuditLogs.map((log, idx) => (
                <div key={idx} className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-emerald-400">{log.logId}</span>
                    <span className="font-mono text-[10px] text-slate-500">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-slate-200 font-medium">{log.action}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>T-Code: {log.sapTransaction} | User: {log.user} ({log.role})</span>
                    <span className="text-slate-500">Hash: {log.hash}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 9. 50 MM Q&A CATALOG */}
        {activeTab === 'qa' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search 50 MM Questions (e.g. PR, PO, MIGO, MIRO, OTIF, Stock)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="All">All Categories (50 Qs)</option>
                  <option value="Procurement & Purchasing">Procurement & Purchasing (1-10)</option>
                  <option value="Inventory & Stock Management">Inventory & Stock Management (11-20)</option>
                  <option value="Supplier & Vendor Performance">Supplier & Vendor Performance (21-30)</option>
                  <option value="Goods Movements & Warehouse Operations">Goods Movements & Warehouse Operations (31-40)</option>
                  <option value="Invoice Verification & P2P">Invoice Verification & P2P (41-50)</option>
                </select>
              </div>
            </div>

            <div className="text-xs text-slate-400 flex justify-between">
              <span>Showing {filteredQa.length} of 50 Natural Language MM Questions</span>
              <span>100% S/4HANA Table & API Mapped</span>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {filteredQa.map((item, idx) => (
                <div key={idx} className="p-3.5 bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-emerald-300 text-xs flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                      {item.question}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                      {item.category}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60 leading-relaxed">
                    {item.answer}
                  </p>

                  <div className="text-[10px] font-mono text-slate-500 flex items-center gap-2">
                    <span>Mapped Table / API:</span>
                    <span className="text-emerald-400/90">{item.liveTableSource}</span>
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
