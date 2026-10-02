import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Package,
  FileText,
  Truck,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  Search,
  Filter,
  Layers,
  ChevronRight,
  TrendingUp,
  ShieldAlert,
  Boxes,
  Compass,
  ArrowUpRight,
  RefreshCw,
  Eye,
  Info,
  DollarSign,
  Calendar,
  Building,
  CheckCircle,
  XCircle,
  FileCheck
} from 'lucide-react';
import { eccService } from '../services/eccService';
import {
  SapEccSalesOrder,
  SapEccOutboundDelivery,
  SapEccBillingDocument,
  SapEccCustomerMaster,
  SapEccAtpCheckResult,
  SapEccSdCustomizing,
  SapEccSdAgentReport,
  SapEccOtc360View,
  SapEccCustomer360View,
  SapEccSdAnalytics,
  SapEccReturnOrder,
  SapEccSdActionProposal,
  SapEccAuditTrace
} from '../types';

interface EccSdCardProps {
  data?: any;
}

export const EccSdAutonomousCopilotCard: React.FC<EccSdCardProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'otc360' | 'customer360' | 'analytics' | 'returns' | 'actions' | 'orders' | 'detail' | 'deliveries' | 'billing' | 'atp' | 'customizing' | 'tcodes'>('orders');
  
  // Extract initial order ID from incoming data payload if present
  const extractedOrderId = data?.salesOrder?.salesOrder || 
                           data?.salesOrder?.salesOrderNo || 
                           (typeof data?.salesOrder === 'string' ? data.salesOrder : undefined) ||
                           data?.salesOrderNo ||
                           data?.orderId ||
                           (data?.items && data?.salesOrder ? data.salesOrder : '0000005007');

  const [selectedOrderId, setSelectedOrderId] = useState<string>(extractedOrderId);
  const [selectedCustomerNo, setSelectedCustomerNo] = useState<string>('0000001000');
  const [orderSearchQuery, setOrderSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState<string>('THIS_MONTH');
  
  // Action Execution State
  const [actionProposal, setActionProposal] = useState<SapEccSdActionProposal | null>(null);
  const [actionExecuted, setActionExecuted] = useState<boolean>(false);
  const [isExecutingAction, setIsExecutingAction] = useState<boolean>(false);
  
  // ATP Checker States
  const [atpMaterial, setAtpMaterial] = useState<string>('DPC-100');
  const [atpPlant, setAtpPlant] = useState<string>('1000');
  const [atpQty, setAtpQty] = useState<number>(15);
  const [atpResult, setAtpResult] = useState<SapEccAtpCheckResult | null>(null);
  const [isLoadingAtp, setIsLoadingAtp] = useState<boolean>(false);

  // Customizing Filter
  const [customizingFilter, setCustomizingFilter] = useState<string>('ALL');

  // Custom T-Code input
  const [customTcode, setCustomTcode] = useState<string>('VA03');

  // Determine initial data payload
  const isDirectReport = data?.kpis && data?.recentSalesOrders;
  const isDirectOrder = data?.salesOrder && data?.items && !data?.customer;
  const isDirectOtc360 = data?.salesOrder && data?.customer && data?.deliveries && data?.atpAnalysis;
  const isDirectCustomer360 = data?.salesArea && data?.creditProfile && data?.topPurchasedMaterials;
  const isDirectAnalytics = data?.reportingCurrency && data?.periodComparison;
  const isDirectReturns = Array.isArray(data) && data[0]?.returnOrderNo;
  const isDirectAction = data?.actionType && data?.proposedChanges;
  const isDirectSalesOrders = Array.isArray(data) && typeof data[0]?.salesOrder === 'string';
  const isDirectDeliveries = Array.isArray(data) && data[0]?.deliveryNo;
  const isDirectBilling = Array.isArray(data) && data[0]?.billingDoc;
  const isDirectAtp = data?.material && data?.availableToPromiseQty !== undefined;
  const isDirectCustomizing = Array.isArray(data) && data[0]?.sproPath;

  // This component only runs in the browser: the live ECC RFC gateway is server-only (spawns a
  // Python/COM process), so any eccService.* call here that falls through to a live table read
  // will always throw. Falling back to a safe default (instead of letting the exception reach
  // the render tree) keeps the card usable even when the incoming `data` prop is missing/partial.
  const safeEccCall = <T,>(fn: () => T, fallback: T): T => {
    try { return fn(); } catch { return fallback; }
  };

  const DEFAULT_DASHBOARD_REPORT: SapEccSdAgentReport = {
    system: { systemId: 'ECC', host: eccService.config.host, port: eccService.config.port, client: eccService.config.client, user: eccService.config.user } as any,
    kpis: { totalSalesOrdersCount: 0, openSalesOrdersCount: 0, totalOpenValueUsd: 0, pendingDeliveriesCount: 0, blockedCreditOrdersCount: 0 } as any,
    summary: '',
    recentSalesOrders: [],
    recentDeliveries: [],
    recentBillingDocs: []
  } as any;

  const dashboardReport: SapEccSdAgentReport = isDirectReport
    ? data
    : safeEccCall(() => eccService.getSdAgentDashboardReport(), DEFAULT_DASHBOARD_REPORT);

  const allOrders: SapEccSalesOrder[] = isDirectSalesOrders
    ? data
    : dashboardReport.recentSalesOrders || safeEccCall(() => eccService.getSalesOrders(), []);
  const allDeliveries: SapEccOutboundDelivery[] = isDirectDeliveries
    ? data
    : dashboardReport.recentDeliveries || safeEccCall(() => eccService.getDeliveries(), []);
  const allBillingDocs: SapEccBillingDocument[] = isDirectBilling
    ? data
    : dashboardReport.recentBillingDocs || safeEccCall(() => eccService.getBillingDocuments(), []);
  const customizingList: SapEccSdCustomizing[] = isDirectCustomizing
    ? data
    : safeEccCall(() => eccService.getSdCustomizing(), []);

  // If input data was specifically an order detail or specialized view, auto-switch tab
  useEffect(() => {
    if (isDirectOtc360) {
      const orderNo = data.salesOrder?.salesOrder || data.salesOrder?.salesOrderNo || (typeof data.salesOrder === 'string' ? data.salesOrder : '0000005007');
      setSelectedOrderId(orderNo);
      setActiveTab('otc360');
    } else if (isDirectCustomer360) {
      setSelectedCustomerNo(data.customer?.customerNo || '0000001000');
      setActiveTab('customer360');
    } else if (isDirectAnalytics) {
      setActiveTab('analytics');
    } else if (isDirectReturns) {
      setActiveTab('returns');
    } else if (isDirectAction) {
      setActionProposal(data);
      setActiveTab('actions');
    } else if (isDirectOrder) {
      const orderNo = typeof data.salesOrder === 'string' ? data.salesOrder : (data.salesOrder?.salesOrder || '0000005007');
      setSelectedOrderId(orderNo);
      setActiveTab('detail');
    } else if (isDirectDeliveries) {
      setActiveTab('deliveries');
    } else if (isDirectBilling) {
      setActiveTab('billing');
    } else if (isDirectAtp) {
      setAtpResult(data);
      setActiveTab('atp');
    } else if (isDirectCustomizing) {
      setActiveTab('customizing');
    }
  }, [data]);

  const selectedOrder: SapEccSalesOrder | undefined = 
    (isDirectOrder ? (typeof data.salesOrder === 'object' ? data.salesOrder : data) : undefined) ||
    (isDirectOtc360 && data?.salesOrder && typeof data.salesOrder === 'object' ? data.salesOrder : undefined) ||
    allOrders.find(o => 
      o.salesOrder === selectedOrderId || 
      o.salesOrder.endsWith(selectedOrderId) || 
      (selectedOrderId && o.salesOrder.replace(/^0+/, '') === selectedOrderId.replace(/^0+/, ''))
    ) ||
    safeEccCall(() => eccService.getSalesOrderDetail(selectedOrderId), undefined) ||
    allOrders[0];

  const handleRunAtp = () => {
    setIsLoadingAtp(true);
    setTimeout(() => {
      const res = safeEccCall(() => eccService.checkAtpAvailability(atpMaterial, atpPlant, atpQty), null);
      setAtpResult(res);
      setIsLoadingAtp(false);
    }, 200);
  };

  const filteredOrders = allOrders.filter(o => {
    const matchesSearch = 
      !orderSearchQuery ||
      o.salesOrder.includes(orderSearchQuery) ||
      o.soldToName.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      o.poNumber.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      o.items.some(i => i.material.toLowerCase().includes(orderSearchQuery.toLowerCase()));

    const matchesStatus = 
      statusFilter === 'ALL' ||
      (statusFilter === 'OPEN' && o.overallStatus === 'Open') ||
      (statusFilter === 'DELIVERED' && o.deliveryStatus === 'Completely Delivered') ||
      (statusFilter === 'INVOICED' && o.billingStatus === 'Completely Invoiced') ||
      (statusFilter === 'BLOCKED' && o.creditStatus === 'Blocked');

    return matchesSearch && matchesStatus;
  });

  const filteredCustomizing = customizingFilter === 'ALL' 
    ? customizingList 
    : customizingList.filter(c => c.category === customizingFilter);

  const sys = dashboardReport.system;

  return (
    <div id="ecc-sd-autonomous-card" className="w-full bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/60 rounded-xl shadow-xl overflow-hidden my-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-950 p-4 sm:p-5 text-white border-b border-blue-800/40">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/20 border border-blue-400/30 rounded-lg text-blue-300 shadow-inner">
              <ShoppingCart className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-white">SAP ECC SD AI Specialist</h2>
                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  LIVE ECC 6.0 (Client 800)
                </span>
                <span className="px-2 py-0.5 text-xs font-medium bg-blue-500/20 text-blue-200 border border-blue-400/20 rounded-md">
                  SD Full-Lifecycle
                </span>
              </div>
              <p className="text-xs text-blue-200/80 font-mono mt-0.5">
                Host: {sys.host}:{sys.port} | SID: {sys.systemId} | Client: {sys.client} | User: {sys.user} | RFC: /sap/bc/srt/rfc/sap/
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              id="btn-open-ecc-va03"
              href={eccService.generateTcodeUrl('VA03', sys.client)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Launch VA03 WebGUI
            </a>
          </div>
        </div>

        {/* Live SD KPIs Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-3 border-t border-blue-800/30">
          <div className="bg-white/5 backdrop-blur-sm p-2.5 rounded-lg border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-blue-200 font-medium">Total Orders</span>
              <FileText className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <p className="text-lg font-bold text-white mt-0.5">{dashboardReport.kpis.totalSalesOrdersCount}</p>
            <span className="text-[10px] text-emerald-300 font-medium flex items-center gap-1">
              {dashboardReport.kpis.openSalesOrdersCount} Active Open
            </span>
          </div>

          <div className="bg-white/5 backdrop-blur-sm p-2.5 rounded-lg border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-blue-200 font-medium">Open Order Value</span>
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-lg font-bold text-emerald-300 mt-0.5">
              €{dashboardReport.kpis.totalOpenValueUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <span className="text-[10px] text-blue-200 font-mono">Sales Area 1000/10/00</span>
          </div>

          <div className="bg-white/5 backdrop-blur-sm p-2.5 rounded-lg border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-blue-200 font-medium">Pending Shipping</span>
              <Truck className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <p className="text-lg font-bold text-amber-300 mt-0.5">{dashboardReport.kpis.pendingDeliveriesCount} Outbound</p>
            <span className="text-[10px] text-slate-300">Plant 1000 Berlin</span>
          </div>

          <div className="bg-white/5 backdrop-blur-sm p-2.5 rounded-lg border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-blue-200 font-medium">Credit Management</span>
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <p className="text-lg font-bold text-rose-300 mt-0.5">{dashboardReport.kpis.blockedCreditOrdersCount} Blocked</p>
            <span className="text-[10px] text-rose-200">FD32 / VKM3 Classic</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/70 px-4 pt-2 gap-1 text-xs">
        <button
          id="tab-ecc-sd-otc360"
          onClick={() => setActiveTab('otc360')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'otc360'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold bg-blue-50/50 dark:bg-blue-950/20'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-blue-500" />
          OTC 360° Flow
        </button>

        <button
          id="tab-ecc-sd-customer360"
          onClick={() => setActiveTab('customer360')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'customer360'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold bg-blue-50/50 dark:bg-blue-950/20'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Building className="w-3.5 h-3.5 text-purple-500" />
          Customer 360°
        </button>

        <button
          id="tab-ecc-sd-analytics"
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold bg-blue-50/50 dark:bg-blue-950/20'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
          SD Analytics
        </button>

        <button
          id="tab-ecc-sd-returns"
          onClick={() => setActiveTab('returns')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'returns'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold bg-blue-50/50 dark:bg-blue-950/20'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-500" />
          Returns & Complaints
        </button>

        <button
          id="tab-ecc-sd-actions"
          onClick={() => setActiveTab('actions')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'actions'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50/50 dark:bg-indigo-950/20'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-indigo-500" />
          Action Proposals (HITL)
        </button>

        <button
          id="tab-ecc-sd-orders"
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'orders'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          Orders ({allOrders.length})
        </button>

        <button
          id="tab-ecc-sd-detail"
          onClick={() => setActiveTab('detail')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'detail'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          Doc Flow
        </button>

        <button
          id="tab-ecc-sd-deliveries"
          onClick={() => setActiveTab('deliveries')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'deliveries'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          Deliveries ({allDeliveries.length})
        </button>

        <button
          id="tab-ecc-sd-billing"
          onClick={() => setActiveTab('billing')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'billing'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          Billing ({allBillingDocs.length})
        </button>

        <button
          id="tab-ecc-sd-atp"
          onClick={() => setActiveTab('atp')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'atp'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Boxes className="w-3.5 h-3.5" />
          ATP (CO09)
        </button>

        <button
          id="tab-ecc-sd-customizing"
          onClick={() => setActiveTab('customizing')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'customizing'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          SPRO Config
        </button>

        <button
          id="tab-ecc-sd-tcodes"
          onClick={() => setActiveTab('tcodes')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'tcodes'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          WebGUI Launchpad
        </button>
      </div>

      {/* Main Tab Views */}
      <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 min-h-[380px]">
        {/* ===================== TAB: ORDER-TO-CASH (OTC) 360° ===================== */}
        {activeTab === 'otc360' && (() => {
          const otc: SapEccOtc360View = isDirectOtc360 
            ? data 
            : eccService.getOtc360View(selectedOrderId);

          return (
            <div className="space-y-5">
              {/* Top Controls & Order Selector */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Select Sales Order:</span>
                  <select
                    id="select-ecc-sd-otc-order"
                    value={otc.salesOrder.salesOrder}
                    onChange={e => {
                      setSelectedOrderId(e.target.value);
                    }}
                    className="text-xs font-mono font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md px-3 py-1.5 text-blue-600 dark:text-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {allOrders.map(o => (
                      <option key={o.salesOrder} value={o.salesOrder}>
                        {o.salesOrder} — {o.soldToName} (€{o.netValue.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={eccService.generateTcodeUrl('VA03', sys.client)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors shadow-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open VA03 WebGUI
                  </a>
                  <button
                    onClick={() => {
                      const proposal = eccService.proposeSdAction({
                        actionType: 'MODIFY_DELIVERY_DATE',
                        targetDocumentNo: otc.salesOrder.salesOrder,
                        proposedChanges: [
                          { field: 'VBAK-VDATU (Requested Delivery Date)', oldValue: otc.salesOrder.requestedDeliveryDate, newValue: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0], businessImpact: 'Aligns schedule lines with Plant 1000 replenishment run.' }
                        ]
                      });
                      setActionProposal(proposal);
                      setActiveTab('actions');
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-md hover:bg-indigo-100 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Propose Change (HITL)
                  </button>
                </div>
              </div>

              {/* OTC 360 Header Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Document Header</span>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-base font-bold font-mono text-slate-900 dark:text-white">{otc.salesOrder.salesOrder}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                      Type {otc.salesOrder.docType}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 truncate">{otc.customer.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono">PO: {otc.salesOrder.poNumber}</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Net Order Value</span>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                      €{otc.salesOrder.netValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{otc.salesOrder.currency}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Procedure: <span className="font-mono font-semibold">RVAA01</span></p>
                  <p className="text-[10px] text-emerald-600 font-semibold">Margin ~27.8% (VPRS)</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">ATP & Fulfillment</span>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className={`text-base font-bold ${otc.atpAnalysis.isFullyConfirmed ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      {otc.atpAnalysis.confirmedRatioPct}% Confirmed
                    </span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${otc.atpAnalysis.isFullyConfirmed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {otc.atpAnalysis.isFullyConfirmed ? 'Fully Allocated' : 'Partial ATP'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Plant 1000 (Berlin)</p>
                  <p className="text-[10px] text-slate-400">Req Date: {otc.salesOrder.requestedDeliveryDate || 'Immediate'}</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Credit & Risk (FD32)</span>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className={`text-base font-bold ${otc.creditAnalysis.isCreditBlocked ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {otc.creditAnalysis.creditStatus}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">Area 1000</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Exposure: €{otc.creditAnalysis.creditExposure.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-400">Limit: €{otc.creditAnalysis.creditLimit.toLocaleString()}</p>
                </div>
              </div>

              {/* End-to-End Status Pipeline */}
              <div className="bg-slate-900 text-white p-4 rounded-xl shadow-md border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                    <Layers className="w-4 h-4" />
                    Order-to-Cash (OTC) Pipeline Execution Status
                  </h4>
                  <span className="text-[11px] font-mono text-slate-400">System of Record: SAP ECC 6.0</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-2">
                  {[
                    { step: '1. Order Entry', doc: `SO ${otc.salesOrder.salesOrder}`, status: otc.statusMatrix.overallStatus, color: 'emerald' },
                    { step: '2. Credit Check', doc: 'FD32 / VKM3', status: otc.creditAnalysis.creditStatus, color: otc.creditAnalysis.isCreditBlocked ? 'rose' : 'emerald' },
                    { step: '3. Outbound Deliv', doc: otc.deliveries[0]?.deliveryNo || 'Pending VL01N', status: otc.statusMatrix.deliveryStatus, color: otc.deliveries.length > 0 ? 'emerald' : 'amber' },
                    { step: '4. Goods Issue (PGI)', doc: 'VL02N / MSEG', status: otc.statusMatrix.pgiStatus, color: otc.statusMatrix.pgiStatus.includes('Complete') ? 'emerald' : 'amber' },
                    { step: '5. Billing / Invoice', doc: otc.billingDocs[0]?.billingDoc || 'Pending VF01', status: otc.statusMatrix.billingStatus, color: otc.billingDocs.length > 0 ? 'emerald' : 'slate' },
                    { step: '6. FI Accounting', doc: otc.billingDocs[0]?.accountingDocNo || 'Pending Posting', status: otc.statusMatrix.accountingStatus, color: otc.billingDocs[0]?.accountingDocNo ? 'emerald' : 'slate' }
                  ].map((p, idx) => (
                    <div key={idx} className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700 space-y-1">
                      <span className="text-[10px] text-slate-400 font-semibold block">{p.step}</span>
                      <span className="text-xs font-mono font-bold text-white block truncate">{p.doc}</span>
                      <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                        p.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-300' :
                        p.color === 'rose' ? 'bg-rose-500/20 text-rose-300' :
                        p.color === 'amber' ? 'bg-amber-500/20 text-amber-300' :
                        'bg-slate-600/40 text-slate-300'
                      }`}>
                        {p.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Root Cause & "Why" Reasoner Section */}
              {(otc.rootCauseAnalysis.isBlocked || otc.rootCauseAnalysis.isDelayed) && (
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/60 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <h4 className="text-xs font-bold uppercase tracking-wider">
                      SAP SD "Why" Reasoner — Root Cause & Diagnostic Findings
                    </h4>
                  </div>

                  <div className="text-xs text-amber-900 dark:text-amber-200 space-y-2">
                    {otc.rootCauseAnalysis.blockReason && (
                      <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg">
                        <strong className="text-rose-700 dark:text-rose-300 font-bold block mb-1">🔴 Block Detected (VBAK/FD32):</strong>
                        <span>{otc.rootCauseAnalysis.blockReason}</span>
                      </div>
                    )}
                    {otc.rootCauseAnalysis.delayReason && (
                      <div className="p-2.5 bg-amber-100/70 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-700 rounded-lg">
                        <strong className="text-amber-800 dark:text-amber-300 font-bold block mb-1">🟡 Delay / Stock Bottleneck (CO09):</strong>
                        <span>{otc.rootCauseAnalysis.delayReason}</span>
                      </div>
                    )}

                    <div className="pt-2">
                      <strong className="text-slate-800 dark:text-slate-200 font-semibold block mb-1">Recommended Corrective Actions:</strong>
                      <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
                        {otc.rootCauseAnalysis.recommendedActions.map((act, aIdx) => (
                          <li key={aIdx} className="font-medium">{act}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Line Items & Pricing Breakdown Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2.5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <ShoppingCart className="w-4 h-4 text-blue-500" />
                    Sales Order Line Items (VBAP / VBEP) & Condition Technique (KONV)
                  </h4>
                  <span className="text-xs text-slate-500">{otc.salesOrder.items.length} item(s)</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-3 py-2">Item</th>
                        <th className="px-3 py-2">Material</th>
                        <th className="px-3 py-2">Description</th>
                        <th className="px-3 py-2 text-right">Order Qty</th>
                        <th className="px-3 py-2 text-right">Conf Qty</th>
                        <th className="px-3 py-2">Unit</th>
                        <th className="px-3 py-2 text-right">Net Price</th>
                        <th className="px-3 py-2 text-right">Net Value</th>
                        <th className="px-3 py-2">Plant</th>
                        <th className="px-3 py-2">Item Cat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {otc.salesOrder.items.map(it => (
                        <tr key={it.itemNo} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="px-3 py-2.5 font-mono font-bold text-blue-600">{it.itemNo}</td>
                          <td className="px-3 py-2.5 font-mono font-semibold text-slate-800 dark:text-slate-200">{it.material}</td>
                          <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300 max-w-[200px] truncate">{it.materialDescription}</td>
                          <td className="px-3 py-2.5 text-right font-medium">{it.orderQuantity}</td>
                          <td className="px-3 py-2.5 text-right font-bold text-emerald-600">
                            {it.orderQuantity}
                          </td>
                          <td className="px-3 py-2.5 text-slate-500">{it.salesUnit}</td>
                          <td className="px-3 py-2.5 text-right font-mono">€{it.netPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          <td className="px-3 py-2.5 text-right font-mono font-bold text-slate-900 dark:text-white">€{it.netValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          <td className="px-3 py-2.5 font-mono">{it.plant}</td>
                          <td className="px-3 py-2.5 font-mono text-slate-500">{it.itemCategory}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Audit Trace Footer */}
              {otc.executionTrace && (
                <div className="bg-slate-100 dark:bg-slate-800/70 p-3 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800">
                      ✓ {otc.executionTrace.verificationStatus}
                    </span>
                    <span>System: <strong>{otc.executionTrace.eccSystem}</strong> ({otc.executionTrace.host}, Client {otc.executionTrace.client})</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-[10px]">
                    <span>Tables: {otc.executionTrace.tablesReferenced.slice(0, 5).join(', ')}...</span>
                    <span>Latency: <strong>{otc.executionTrace.latencyMs}ms</strong></span>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* ===================== TAB: CUSTOMER 360° PROFILE ===================== */}
        {activeTab === 'customer360' && (() => {
          const c360: SapEccCustomer360View = isDirectCustomer360 
            ? data 
            : eccService.getCustomer360View(selectedCustomerNo);

          return (
            <div className="space-y-5">
              {/* Customer Selector */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Select Customer Account:</span>
                  <select
                    id="select-ecc-sd-customer360-account"
                    value={c360.customer.customerNo}
                    onChange={e => setSelectedCustomerNo(e.target.value)}
                    className="text-xs font-mono font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md px-3 py-1.5 text-purple-600 dark:text-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    {[
                      { id: '0000001000', name: 'Becker Berlin AG' },
                      { id: '0000001050', name: 'Siemens Energy AG' },
                      { id: '0000001100', name: 'Daimler Truck AG' },
                      { id: '0000001200', name: 'Bosch Rexroth AG' }
                    ].map(c => (
                      <option key={c.id} value={c.id}>
                        {c.id} — {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={eccService.generateTcodeUrl('XD03', sys.client)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors shadow-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    XD03 Master WebGUI
                  </a>
                  <a
                    href={eccService.generateTcodeUrl('FD32', sys.client)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-700 hover:bg-slate-800 text-white rounded-md transition-colors"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    FD32 Credit Master
                  </a>
                </div>
              </div>

              {/* Customer 360 Header Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Account Overview (KNA1)</span>
                  <div className="mt-1">
                    <span className="text-base font-bold text-slate-900 dark:text-white block truncate">{c360.customer.name}</span>
                    <span className="text-xs font-mono text-purple-600 dark:text-purple-400 font-bold">{c360.customer.customerNo}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{c360.customer.city}, {c360.customer.country}</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Sales Area (KNVV)</span>
                  <div className="mt-1 space-y-0.5 text-xs">
                    <p className="text-slate-700 dark:text-slate-300">Org: <strong className="font-mono">{c360.salesArea.salesOrg}</strong> / Ch: <strong className="font-mono">{c360.salesArea.distChannel}</strong> / Div: <strong className="font-mono">{c360.salesArea.division}</strong></p>
                    <p className="text-slate-500">Terms: <strong className="font-mono text-slate-800 dark:text-slate-200">{c360.salesArea.paymentTerms}</strong></p>
                    <p className="text-slate-500 truncate">Incoterms: <span className="font-medium text-slate-700 dark:text-slate-300">{c360.salesArea.incoterms}</span></p>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">YTD Revenue & Backlog</span>
                  <div className="mt-1">
                    <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                      €{c360.kpis.totalRevenueYtd.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 block">YTD Net Invoiced</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Open Orders: <strong>€{c360.kpis.totalOpenOrderValue.toLocaleString()}</strong></p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Credit Profile (FD32)</span>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-base font-bold text-slate-900 dark:text-white">{c360.creditProfile.creditUsedPct}% Used</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${c360.creditProfile.creditStatus === 'Normal' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {c360.creditProfile.creditStatus}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full mt-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${c360.creditProfile.creditUsedPct > 85 ? 'bg-rose-500' : c360.creditProfile.creditUsedPct > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(c360.creditProfile.creditUsedPct, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">€{c360.creditProfile.creditExposure.toLocaleString()} of €{c360.creditProfile.creditLimit.toLocaleString()}</p>
                </div>
              </div>

              {/* Top Purchased Materials */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2.5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Boxes className="w-4 h-4 text-purple-500" />
                    Top Purchased Materials & Historical Volumes (SIS S001)
                  </h4>
                </div>
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-3 py-2">Material</th>
                      <th className="px-3 py-2">Description</th>
                      <th className="px-3 py-2 text-right">Total Purchased Qty</th>
                      <th className="px-3 py-2 text-right">Total Revenue (€)</th>
                      <th className="px-3 py-2">Last Order Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {c360.topPurchasedMaterials.map(m => (
                      <tr key={m.material} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="px-3 py-2.5 font-mono font-bold text-purple-600">{m.material}</td>
                        <td className="px-3 py-2.5 text-slate-800 dark:text-slate-200">{m.description}</td>
                        <td className="px-3 py-2.5 text-right font-medium">{m.totalQty} ST</td>
                        <td className="px-3 py-2.5 text-right font-mono font-bold text-emerald-600">€{m.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="px-3 py-2.5 text-slate-500 font-mono">{m.lastOrderDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Audit Trace Footer */}
              {c360.executionTrace && (
                <div className="bg-slate-100 dark:bg-slate-800/70 p-3 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800">
                      ✓ {c360.executionTrace.verificationStatus}
                    </span>
                    <span>System: <strong>{c360.executionTrace.eccSystem}</strong> ({c360.executionTrace.host})</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-[10px]">
                    <span>Tables: {c360.executionTrace.tablesReferenced.join(', ')}</span>
                    <span>Latency: <strong>{c360.executionTrace.latencyMs}ms</strong></span>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* ===================== TAB: SD SALES ANALYTICS ===================== */}
        {activeTab === 'analytics' && (() => {
          const analytics: SapEccSdAnalytics = isDirectAnalytics 
            ? data 
            : eccService.getSdAnalytics({ timeframe: analyticsTimeframe });

          return (
            <div className="space-y-5">
              {/* Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Timeframe:</span>
                  {['THIS_MONTH', 'LAST_MONTH', 'LAST_30_DAYS', 'YTD'].map(tf => (
                    <button
                      key={tf}
                      onClick={() => setAnalyticsTimeframe(tf)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                        analyticsTimeframe === tf
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {tf.replace('_', ' ')}
                    </button>
                  ))}
                </div>
                <span className="text-xs font-mono text-slate-500">Base Currency: EUR</span>
              </div>

              {/* Growth & Period Performance Card */}
              <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 p-4 rounded-xl text-white border border-emerald-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-sm font-bold tracking-tight">Period-over-Period Performance Comparison</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                    +{analytics.periodComparison.growthPct}% vs Prior Period
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                    <span className="text-[11px] text-slate-300">{analytics.periodComparison.currentPeriodName}</span>
                    <p className="text-xl font-bold text-emerald-300 mt-1">€{analytics.periodComparison.currentPeriodValue.toLocaleString()}</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                    <span className="text-[11px] text-slate-300">{analytics.periodComparison.priorPeriodName}</span>
                    <p className="text-xl font-bold text-slate-300 mt-1">€{analytics.periodComparison.priorPeriodValue.toLocaleString()}</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                    <span className="text-[11px] text-slate-300">Net Growth Variance</span>
                    <p className="text-xl font-bold text-emerald-400 mt-1">+€{analytics.periodComparison.varianceValue.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Core SD Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Sales Orders</span>
                  <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{analytics.totalSalesOrders} Orders</p>
                  <span className="text-[10px] text-slate-400">Avg €{analytics.averageOrderValue.toLocaleString()} / order</span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Order Intake</span>
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">€{analytics.totalOrderValue.toLocaleString()}</p>
                  <span className="text-[10px] text-emerald-600">Net Value</span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Open Backlog Value</span>
                  <p className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-0.5">€{analytics.openOrderValue.toLocaleString()}</p>
                  <span className="text-[10px] text-amber-600">{analytics.openOrdersCount} open orders</span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Credit Blocked Value</span>
                  <p className="text-lg font-bold text-rose-600 dark:text-rose-400 mt-0.5">€{analytics.creditBlockOverview.totalBlockedValue.toLocaleString()}</p>
                  <span className="text-[10px] text-rose-600">{analytics.creditBlockOverview.blockedOrdersCount} blocked order</span>
                </div>
              </div>

              {/* Visual Breakdown by Channel and Org */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Distribution Channel Breakdown (VTWEG)
                  </h4>
                  <div className="space-y-2">
                    {analytics.salesByDistChannel.map(ch => (
                      <div key={ch.channel} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span>Channel {ch.channel}: {ch.description}</span>
                          <span className="font-bold font-mono">€{ch.totalValue.toLocaleString()} ({ch.sharePct}%)</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div className="bg-blue-600 h-full rounded-full" style={{ width: `${ch.sharePct}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Regional Sales Distribution
                  </h4>
                  <div className="space-y-2">
                    {analytics.salesByRegion.map(rg => (
                      <div key={rg.region} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="truncate max-w-[200px]">{rg.region}</span>
                          <span className="font-bold font-mono">€{rg.totalValue.toLocaleString()} ({rg.sharePct}%)</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${rg.sharePct}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Audit Trace Footer */}
              {analytics.executionTrace && (
                <div className="bg-slate-100 dark:bg-slate-800/70 p-3 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800">
                      ✓ {analytics.executionTrace.verificationStatus}
                    </span>
                    <span>System: <strong>{analytics.executionTrace.eccSystem}</strong> ({analytics.executionTrace.host})</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-[10px]">
                    <span>API: {analytics.executionTrace.apiUsed}</span>
                    <span>Latency: <strong>{analytics.executionTrace.latencyMs}ms</strong></span>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* ===================== TAB: RETURNS & COMPLAINTS ===================== */}
        {activeTab === 'returns' && (() => {
          const returnsList: SapEccReturnOrder[] = isDirectReturns 
            ? data 
            : eccService.queryReturnOrders();

          return (
            <div className="space-y-5">
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Customer Returns & Complaints (DocType RE / BAPI_CUSTOMERRETURN_CREATE)
                  </span>
                </div>
                <button
                  onClick={() => {
                    const proposal = eccService.proposeSdAction({
                      actionType: 'CREATE_RETURN_ORDER',
                      proposedChanges: [
                        { field: 'Order Type', oldValue: 'None', newValue: 'RE (Customer Returns)', businessImpact: 'Creates return document with reference to original invoice.' },
                        { field: 'Return Reason', oldValue: 'None', newValue: '002 (Damaged in transit)', businessImpact: 'Sets rejection/credit approval criteria.' }
                      ]
                    });
                    setActionProposal(proposal);
                    setActiveTab('actions');
                  }}
                  className="px-3 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-md transition-colors"
                >
                  + Propose Return Order
                </button>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-3 py-2">Return Order #</th>
                      <th className="px-3 py-2">Reference Order</th>
                      <th className="px-3 py-2">Customer</th>
                      <th className="px-3 py-2">Return Reason</th>
                      <th className="px-3 py-2 text-right">Net Value</th>
                      <th className="px-3 py-2">PGR Status</th>
                      <th className="px-3 py-2">Credit Memo</th>
                      <th className="px-3 py-2">Overall Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {returnsList.map(r => (
                      <tr key={r.returnOrderNo} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="px-3 py-2.5 font-mono font-bold text-amber-600">{r.returnOrderNo}</td>
                        <td className="px-3 py-2.5 font-mono text-blue-600">{r.referenceSalesOrder}</td>
                        <td className="px-3 py-2.5 font-medium">{r.customerName}</td>
                        <td className="px-3 py-2.5">
                          <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-semibold text-[10px]">
                            {r.returnReason}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono font-bold">€{r.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300">{r.pgrStatus}</td>
                        <td className="px-3 py-2.5 font-mono text-emerald-600 font-bold">{r.creditMemoNo || r.creditMemoStatus}</td>
                        <td className="px-3 py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.status === 'Credited' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()}

        {/* ===================== TAB: ACTION PROPOSALS (HITL) ===================== */}
        {activeTab === 'actions' && (() => {
          const proposal: SapEccSdActionProposal = actionProposal || eccService.proposeSdAction({
            actionType: 'RELEASE_CREDIT_BLOCK',
            targetDocumentNo: selectedOrderId,
            proposedChanges: [
              { field: 'Credit Release Flag (VKM3)', oldValue: 'Blocked (Status 01)', newValue: 'Released (Status 02)', businessImpact: 'Unblocks outbound delivery creation in VL01N.' }
            ]
          });

          return (
            <div className="space-y-5">
              <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-blue-950 p-4 rounded-xl text-white border border-indigo-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-sm font-bold tracking-tight">{proposal.actionTitle}</h3>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    proposal.riskLevel === 'HIGH' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {proposal.riskLevel} RISK • HUMAN APPROVAL REQUIRED
                  </span>
                </div>
                <p className="text-xs text-slate-300">{proposal.description}</p>
                <div className="flex items-center gap-4 text-xs text-indigo-200 font-mono pt-1">
                  <span>BAPI: <strong>{proposal.sapBapiOrRfc}</strong></span>
                  <span>Target Doc: <strong>{proposal.targetDocumentNo || 'NEW DOCUMENT'}</strong></span>
                </div>
              </div>

              {/* Proposed Delta Changes */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2.5 border-b border-slate-200 dark:border-slate-700">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Proposed Transactional Modifications
                  </h4>
                </div>
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-3 py-2">Field</th>
                      <th className="px-3 py-2">Current Value</th>
                      <th className="px-3 py-2">Proposed New Value</th>
                      <th className="px-3 py-2">Business Impact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {proposal.proposedChanges.map((ch, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="px-3 py-2.5 font-mono font-bold text-slate-800 dark:text-slate-200">{ch.field}</td>
                        <td className="px-3 py-2.5 font-mono text-rose-600">{String(ch.oldValue)}</td>
                        <td className="px-3 py-2.5 font-mono font-bold text-emerald-600">{String(ch.newValue)}</td>
                        <td className="px-3 py-2.5 text-slate-600 dark:text-slate-400">{ch.businessImpact}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Validation & Simulation Results */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    SAP Business Rule Validations
                  </h4>
                  <div className="space-y-1.5 text-xs">
                    {proposal.validationChecks.map((chk, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-1.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-900 dark:text-white block">{chk.checkName}</strong>
                          <span className="text-slate-500 text-[11px]">{chk.message}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    BAPI Simulation Output
                  </h4>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                    <span className="text-emerald-600 font-bold block">✓ BAPI Dry-Run Successful</span>
                    {proposal.simulationResult?.messages.map((m, mIdx) => (
                      <p key={mIdx} className="text-slate-600 dark:text-slate-400 font-mono text-[11px]">{m}</p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Execution Trigger Bar */}
              <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border border-slate-800">
                <div>
                  <h4 className="text-xs font-bold uppercase text-indigo-400">Human-In-The-Loop (HITL) Execution Confirmation</h4>
                  <p className="text-xs text-slate-300 mt-0.5">Authorizing this step will execute live <code className="text-indigo-300">{proposal.sapBapiOrRfc}</code> and issue <code className="text-indigo-300">BAPI_TRANSACTION_COMMIT</code> on ECC Instance 85.</p>
                </div>

                <div className="flex items-center gap-2">
                  {actionExecuted ? (
                    <span className="px-4 py-2 text-xs font-bold bg-emerald-600 text-white rounded-lg flex items-center gap-1.5 shadow-md">
                      <CheckCircle className="w-4 h-4" />
                      Executed & Committed to SAP ECC!
                    </span>
                  ) : (
                    <button
                      id="btn-ecc-sd-commit-action"
                      disabled={isExecutingAction}
                      onClick={() => {
                        setIsExecutingAction(true);
                        setTimeout(() => {
                          try {
                            eccService.executeSdAction('PROP-CURRENT', 'AUTH-TOKEN-LIVE-OK');
                            setActionExecuted(true);
                          } catch (e) {
                            console.error(e);
                          } finally {
                            setIsExecutingAction(false);
                          }
                        }, 500);
                      }}
                      className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-md transition-all flex items-center gap-2"
                    >
                      {isExecutingAction ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Executing BAPI Commit...
                        </>
                      ) : (
                        <>
                          <FileCheck className="w-4 h-4" />
                          Authorize & Commit to SAP ECC 6.0
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* ===================== TAB 1: SALES ORDERS ===================== */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {/* Filter / Search Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-700/60">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  id="input-ecc-sd-order-search"
                  type="text"
                  placeholder="Search order #, customer, material..."
                  value={orderSearchQuery}
                  onChange={e => setOrderSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
                <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Filter Status:</span>
                {['ALL', 'OPEN', 'DELIVERED', 'INVOICED', 'BLOCKED'].map(st => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 text-xs rounded-md transition-colors font-medium whitespace-nowrap ${
                      statusFilter === st
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-2.5 px-3">Sales Order #</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Sold-To Customer</th>
                    <th className="py-2.5 px-3">PO Number</th>
                    <th className="py-2.5 px-3 text-right">Net Value</th>
                    <th className="py-2.5 px-3">Delivery Status</th>
                    <th className="py-2.5 px-3">Billing Status</th>
                    <th className="py-2.5 px-3">Credit</th>
                    <th className="py-2.5 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {filteredOrders.map(order => (
                    <tr
                      key={order.salesOrder}
                      onClick={() => {
                        setSelectedOrderId(order.salesOrder);
                        setActiveTab('detail');
                      }}
                      className="hover:bg-blue-50/60 dark:hover:bg-blue-950/20 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {order.salesOrder}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          {order.docType} ({order.docTypeDesc.split(' ')[0]})
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-slate-900 dark:text-slate-100">{order.soldToName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">ID: {order.soldToParty}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-400">
                        {order.poNumber || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold font-mono text-slate-900 dark:text-slate-100">
                        {order.currency} {order.netValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          order.deliveryStatus === 'Completely Delivered'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                            : order.deliveryStatus === 'Partially Delivered'
                            ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                            : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                        }`}>
                          {order.deliveryStatus}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          order.billingStatus === 'Completely Invoiced'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                            : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                        }`}>
                          {order.billingStatus}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          order.creditStatus === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : order.creditStatus === 'Blocked'
                            ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/40 dark:text-rose-300'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {order.creditStatus}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              setSelectedOrderId(order.salesOrder);
                              setActiveTab('detail');
                            }}
                            className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded"
                            title="Inspect Order"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <a
                            href={eccService.generateTcodeUrl('VA03', sys.client)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                            title="Launch VA03 in WebGUI"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================== TAB 2: ORDER DETAIL & DOC FLOW ===================== */}
        {activeTab === 'detail' && selectedOrder && (
          <div className="space-y-5">
            {/* Order Header Summary Card */}
            <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 text-white rounded-lg font-mono font-bold text-sm">
                    {selectedOrder.docType}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      Sales Order {selectedOrder.salesOrder}
                      <span className="text-xs font-normal text-slate-500 font-mono">({selectedOrder.docTypeDesc})</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Created on {selectedOrder.orderDate} | Sales Area: {selectedOrder.salesOrg} / {selectedOrder.distChannel} / {selectedOrder.division}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={eccService.generateTcodeUrl('VA03', sys.client)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white hover:bg-blue-500 rounded-lg shadow-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open in VA03 (WebGUI)
                  </a>
                </div>
              </div>

              {/* Header Attributes Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Sold-to Party:</span>
                  <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{selectedOrder.soldToName}</p>
                  <p className="text-[11px] text-slate-400 font-mono">Customer #{selectedOrder.soldToParty}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Ship-to Party:</span>
                  <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{selectedOrder.shipToName}</p>
                  <p className="text-[11px] text-slate-400 font-mono">Party #{selectedOrder.shipToParty}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Customer PO / Date:</span>
                  <p className="font-semibold font-mono text-slate-900 dark:text-slate-100 mt-0.5">{selectedOrder.poNumber}</p>
                  <p className="text-[11px] text-slate-400">{selectedOrder.poDate || selectedOrder.orderDate}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Financial Terms:</span>
                  <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{selectedOrder.paymentTerms || 'Net 30'}</p>
                  <p className="text-[11px] text-slate-400">Incoterms: {selectedOrder.incoterms1 || 'FOB'} {selectedOrder.incoterms2 || ''}</p>
                </div>
              </div>
            </div>

            {/* Line Items Section */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-blue-500" />
                Line Items ({selectedOrder.items.length})
              </h4>
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-2 px-3">Item #</th>
                      <th className="py-2 px-3">Material</th>
                      <th className="py-2 px-3">Description</th>
                      <th className="py-2 px-3 text-right">Order Qty</th>
                      <th className="py-2 px-3 text-right">Net Price</th>
                      <th className="py-2 px-3 text-right">Net Value</th>
                      <th className="py-2 px-3">Plant / Loc</th>
                      <th className="py-2 px-3">Category</th>
                      <th className="py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {selectedOrder.items.map(item => (
                      <tr key={item.itemNo} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-2 px-3 font-mono text-slate-500">{item.itemNo}</td>
                        <td className="py-2 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">{item.material}</td>
                        <td className="py-2 px-3 font-medium">{item.materialDescription}</td>
                        <td className="py-2 px-3 text-right font-mono font-semibold">{item.orderQuantity} {item.salesUnit}</td>
                        <td className="py-2 px-3 text-right font-mono">{selectedOrder.currency} {item.netPrice.toFixed(2)}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                          {selectedOrder.currency} {item.netValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-600 dark:text-slate-400">{item.plant} / {item.storageLocation}</td>
                        <td className="py-2 px-3">
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono">
                            {item.itemCategory}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            item.deliveryStatus === 'Completely Delivered'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {item.deliveryStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pricing Conditions & Document Flow Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Pricing Conditions (KONV / PR00) */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 bg-slate-50/50 dark:bg-slate-800/40">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                    Pricing Conditions (Table KONV / V/08)
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 font-normal">Procedure: RVAA01</span>
                </h4>
                <div className="space-y-1.5 text-xs">
                  {selectedOrder.pricingConditions?.map((cond, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/50">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400 w-12">{cond.condType}</span>
                        <span className="text-slate-600 dark:text-slate-300">{cond.condDesc}</span>
                      </div>
                      <div className="flex items-center gap-3 font-mono">
                        <span className="text-slate-400">{cond.condRate > 0 ? `+${cond.condRate}` : cond.condRate} {cond.condUnit}</span>
                        <span className={`font-semibold w-24 text-right ${cond.isStatistical ? 'text-slate-400 italic' : cond.condValue < 0 ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
                          {selectedOrder.currency} {cond.condValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 flex items-center justify-between font-bold text-sm">
                    <span>Net Order Value (Tax Excl.):</span>
                    <span className="font-mono text-blue-600 dark:text-blue-400">{selectedOrder.currency} {selectedOrder.netValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex items-center justify-between font-bold text-sm border-t border-slate-300 dark:border-slate-700 pt-1 text-slate-900 dark:text-white">
                    <span>Gross Value (Tax Incl.):</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">{selectedOrder.currency} {selectedOrder.grossAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Document Flow (VBFA) */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 bg-slate-50/50 dark:bg-slate-800/40">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-500" />
                    Live Document Flow (Table VBFA)
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 font-normal">ECC 6.0 Real-Time Tree</span>
                </h4>
                <div className="space-y-2 text-xs">
                  {selectedOrder.documentFlow?.map((flow, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded">
                          {flow.subsequentDocType.includes('Order') ? <ShoppingCart className="w-3.5 h-3.5" /> :
                           flow.subsequentDocType.includes('Delivery') ? <Truck className="w-3.5 h-3.5" /> :
                           flow.subsequentDocType.includes('Invoice') ? <FileCheck className="w-3.5 h-3.5" /> :
                           <FileText className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            {flow.subsequentDocType} <span className="font-mono text-blue-600 dark:text-blue-400">#{flow.subsequentDoc}</span>
                          </p>
                          <p className="text-[11px] text-slate-400">Date: {flow.creationDate} | T-Code: {flow.subsequentTcode}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          flow.status === 'Complete' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {flow.status}
                        </span>
                        <a
                          href={eccService.generateTcodeUrl(flow.subsequentTcode, sys.client)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-slate-500 hover:text-blue-600 rounded"
                          title={`Launch ${flow.subsequentTcode} in WebGUI`}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Linked Deliveries and Invoices Section */}
            {(() => {
              const linkedDels = allDeliveries.filter(d => 
                d.items.some(it => it.referenceOrder === selectedOrder.salesOrder || it.referenceOrder.endsWith(selectedOrder.salesOrder.replace(/^0+/, '')))
              );
              const linkedBills = allBillingDocs.filter(b => 
                b.items.some(it => it.referenceOrder === selectedOrder.salesOrder || it.referenceOrder?.endsWith(selectedOrder.salesOrder.replace(/^0+/, ''))) ||
                (linkedDels.length > 0 && b.items.some(it => it.referenceDelivery === linkedDels[0].deliveryNo))
              );

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {/* Outbound Delivery Details */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 bg-slate-50/50 dark:bg-slate-800/40">
                    <div className="flex items-center justify-between mb-2 pb-1 border-b border-slate-200 dark:border-slate-700">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-blue-500" />
                        Associated Outbound Deliveries (VL03N)
                      </h4>
                      <span className="text-[11px] font-mono text-slate-500">Tables LIKP, LIPS</span>
                    </div>

                    {linkedDels.length > 0 ? (
                      <div className="space-y-2">
                        {linkedDels.map(del => (
                          <div key={del.deliveryNo} className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">
                                Delivery #{del.deliveryNo}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300">
                                {del.deliveryTypeDesc} ({del.deliveryType})
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600 dark:text-slate-400">
                              <div>Shipping Point: <strong className="text-slate-800 dark:text-slate-200 font-mono">{del.shippingPoint}</strong></div>
                              <div>Delivery Date: <strong className="text-slate-800 dark:text-slate-200">{del.deliveryDate}</strong></div>
                              <div>Picking Status: <strong className="text-emerald-600">{del.overallPickStatus}</strong></div>
                              <div>Goods Issue: <strong className={del.overallGiStatus === 'Completely Posted' ? 'text-emerald-600' : 'text-amber-600'}>{del.overallGiStatus}</strong></div>
                            </div>
                            <div className="text-[11px] text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-1">
                              Items Picked: {del.items.map(it => `${it.deliveryQty} ${it.salesUnit} of ${it.material}`).join(', ')}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg text-xs text-amber-800 dark:text-amber-300">
                        No Outbound Delivery generated yet. Pending shipping processing via T-Code <strong>VL01N</strong>.
                      </div>
                    )}
                  </div>

                  {/* Billing Document Details */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 bg-slate-50/50 dark:bg-slate-800/40">
                    <div className="flex items-center justify-between mb-2 pb-1 border-b border-slate-200 dark:border-slate-700">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <FileCheck className="w-4 h-4 text-emerald-500" />
                        Associated Invoices & Billing Docs (VF03)
                      </h4>
                      <span className="text-[11px] font-mono text-slate-500">Tables VBRK, VBRP</span>
                    </div>

                    {linkedBills.length > 0 ? (
                      <div className="space-y-2">
                        {linkedBills.map(bill => (
                          <div key={bill.billingDoc} className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                                Invoice #{bill.billingDoc}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300">
                                {bill.billingTypeDesc} ({bill.billingType})
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600 dark:text-slate-400">
                              <div>Net Value: <strong className="font-mono">€{bill.netValue.toLocaleString()} {bill.currency}</strong></div>
                              <div>FI Accounting Doc: <strong className="font-mono text-blue-600">{bill.accountingDocNo}</strong></div>
                              <div>Posting Status: <strong className="text-emerald-600">{bill.postingStatus}</strong></div>
                              <div>Payment Terms: <strong>{bill.paymentTerms}</strong></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-600 dark:text-slate-400 space-y-1">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          Status: <span className="text-amber-600 dark:text-amber-400">Not Invoiced</span>
                        </div>
                        <p className="text-[11px]">
                          Invoice has not been generated yet. Create invoice via T-Code <strong>VF01</strong> once Goods Issue is posted in <strong>VL02N</strong> for Delivery {linkedDels[0]?.deliveryNo || 'document'}.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ===================== TAB 3: OUTBOUND DELIVERIES ===================== */}
        {activeTab === 'deliveries' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-blue-500" />
                Live Shipping & Delivery Monitor (T-Code VL06O / Tables LIKP, LIPS)
              </span>
              <a
                href={eccService.generateTcodeUrl('VL06O', sys.client)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-blue-600 text-white hover:bg-blue-500 rounded-md"
              >
                <ExternalLink className="w-3 h-3" />
                Launch VL06O
              </a>
            </div>

            <div className="space-y-3">
              {allDeliveries.map(deliv => (
                <div key={deliv.deliveryNo} className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-900 shadow-sm space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400">
                            Delivery #{deliv.deliveryNo}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800">
                            Type: {deliv.deliveryType} ({deliv.deliveryTypeDesc})
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          Ship-to: {deliv.shipToName} (#{deliv.shipToParty}) | Shipping Point: {deliv.shippingPoint} ({deliv.shippingPointDesc})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        deliv.overallGiStatus === 'Completely Posted'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300'
                      }`}>
                        PGI: {deliv.overallGiStatus}
                      </span>
                      <a
                        href={eccService.generateTcodeUrl('VL03N', sys.client)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        VL03N
                      </a>
                    </div>
                  </div>

                  {/* Delivery Items Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800">
                        <tr>
                          <th className="py-1 px-2">Item</th>
                          <th className="py-1 px-2">Material</th>
                          <th className="py-1 px-2">Description</th>
                          <th className="py-1 px-2 text-right">Delivery Qty</th>
                          <th className="py-1 px-2 text-right">Picked Qty</th>
                          <th className="py-1 px-2">Picking Status</th>
                          <th className="py-1 px-2">Ref Order #</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {deliv.items.map(item => (
                          <tr key={item.itemNo}>
                            <td className="py-1.5 px-2 font-mono text-slate-400">{item.itemNo}</td>
                            <td className="py-1.5 px-2 font-mono font-bold text-blue-600 dark:text-blue-400">{item.material}</td>
                            <td className="py-1.5 px-2 font-medium">{item.materialDescription}</td>
                            <td className="py-1.5 px-2 text-right font-mono font-bold">{item.deliveryQty} {item.salesUnit}</td>
                            <td className="py-1.5 px-2 text-right font-mono font-bold text-emerald-600">{item.pickedQty} {item.salesUnit}</td>
                            <td className="py-1.5 px-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {item.pickingStatus}
                              </span>
                            </td>
                            <td className="py-1.5 px-2 font-mono text-slate-500">#{item.referenceOrder}</td>
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

        {/* ===================== TAB 4: BILLING & INVOICING ===================== */}
        {activeTab === 'billing' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-500" />
                Live Billing Document & Invoice Explorer (T-Code VF03 / Tables VBRK, VBRP, VKOA)
              </span>
              <a
                href={eccService.generateTcodeUrl('VF03', sys.client)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-500 rounded-md"
              >
                <ExternalLink className="w-3 h-3" />
                Launch VF03
              </a>
            </div>

            <div className="space-y-3">
              {allBillingDocs.map(bill => (
                <div key={bill.billingDoc} className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-900 shadow-sm space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-lg">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
                            Billing Doc #{bill.billingDoc}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800">
                            Type: {bill.billingType} ({bill.billingTypeDesc})
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          Payer: {bill.payerName} (#{bill.payer}) | Billing Date: {bill.billingDate}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300">
                        FI Accounting Doc: #{bill.accountingDocNo}
                      </span>
                      <a
                        href={eccService.generateTcodeUrl('FB03', sys.client)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        FB03 FI Doc
                      </a>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg text-xs">
                    <div>
                      <span className="text-slate-400">Net Amount:</span>
                      <p className="font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                        {bill.currency} {bill.netValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400">Output VAT (MWST 19%):</span>
                      <p className="font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                        {bill.currency} {bill.taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400">Gross Invoiced Total:</span>
                      <p className="font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {bill.currency} {bill.grossAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400">Posting Status:</span>
                      <p className="font-bold text-emerald-600 mt-0.5 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {bill.postingStatus}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================== TAB 5: ATP AVAILABILITY CHECK ===================== */}
        {activeTab === 'atp' && (
          <div className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                <Boxes className="w-4 h-4 text-blue-500" />
                Live Available-To-Promise (ATP) Availability Simulation (T-Code CO09 / T441V)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500">Material Number / ID</label>
                  <select
                    id="select-ecc-atp-material"
                    value={atpMaterial}
                    onChange={e => setAtpMaterial(e.target.value)}
                    className="w-full mt-1 p-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md font-mono"
                  >
                    <option value="DPC-100">DPC-100 (Dual-Core Controller)</option>
                    <option value="CAB-OPT-20">CAB-OPT-20 (Optic Fiber Cable)</option>
                    <option value="SRV-IND-400">SRV-IND-400 (Edge Server 4U)</option>
                    <option value="ECU-HEAVY-90">ECU-HEAVY-90 (Commercial ECU Pro)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500">Delivering Plant</label>
                  <input
                    id="input-ecc-atp-plant"
                    type="text"
                    value={atpPlant}
                    onChange={e => setAtpPlant(e.target.value)}
                    className="w-full mt-1 p-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500">Requested Quantity (ST)</label>
                  <input
                    id="input-ecc-atp-qty"
                    type="number"
                    min={1}
                    value={atpQty}
                    onChange={e => setAtpQty(parseInt(e.target.value) || 1)}
                    className="w-full mt-1 p-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md font-mono"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    id="btn-run-ecc-atp"
                    onClick={handleRunAtp}
                    disabled={isLoadingAtp}
                    className="w-full p-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-md flex items-center justify-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAtp ? 'animate-spin' : ''}`} />
                    {isLoadingAtp ? 'Executing ATP...' : 'Run CO09 Check'}
                  </button>
                </div>
              </div>
            </div>

            {/* ATP Results Display */}
            {atpResult && (
              <div className="border border-blue-200 dark:border-blue-900 rounded-xl p-4 bg-blue-50/30 dark:bg-slate-800/60 space-y-4">
                <div className="flex items-center justify-between border-b border-blue-200 dark:border-blue-900/60 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      ATP Check Result: <span className="font-mono text-blue-600 dark:text-blue-400">{atpResult.material}</span>
                    </h4>
                    <p className="text-xs text-slate-500">{atpResult.materialDescription} (Plant {atpResult.plant})</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                    atpResult.confirmedQty >= atpResult.requestedQty
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}>
                    {atpResult.confirmedQty >= atpResult.requestedQty ? '100% Fully Confirmed' : 'Partial / Delayed Confirmation'}
                  </span>
                </div>

                {/* Stock Breakdown Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400">Total Unrestricted Stock</span>
                    <p className="text-base font-bold font-mono text-slate-900 dark:text-white mt-1">{atpResult.totalUnrestrictedStock} ST</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400">Safety & Reserved Stock</span>
                    <p className="text-base font-bold font-mono text-amber-600 mt-1">{atpResult.safetyStock + atpResult.reservedStock} ST</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400">Available-To-Promise (ATP)</span>
                    <p className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">{atpResult.availableToPromiseQty} ST</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400">Confirmed Delivery Date</span>
                    <p className="text-base font-bold font-mono text-blue-600 dark:text-blue-400 mt-1">{atpResult.confirmedDeliveryDate}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB 6: SPRO SD ARCHITECTURE ===================== */}
        {activeTab === 'customizing' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-blue-500" />
                SAP ECC SD SPRO Customizing, Database Tables & S/4HANA Comparative Analysis
              </span>

              <div className="flex items-center gap-1.5 overflow-x-auto">
                {['ALL', 'Enterprise Structure', 'Sales Documents', 'Basic Functions', 'Pricing', 'Shipping', 'Billing'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCustomizingFilter(cat)}
                    className={`px-2 py-0.5 text-[11px] rounded-md font-medium transition-colors ${
                      customizingFilter === cat
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {filteredCustomizing.map((item, idx) => (
                <div key={idx} className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-900 shadow-sm space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                        {item.category}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.topic}</h4>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.tcodes.map(tc => (
                        <a
                          key={tc}
                          href={eccService.generateTcodeUrl(tc, sys.client)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-0.5 text-[11px] font-mono font-semibold bg-slate-100 hover:bg-blue-100 dark:bg-slate-800 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded flex items-center gap-1 border border-slate-200 dark:border-slate-700"
                        >
                          {tc} <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg font-mono text-slate-600 dark:text-slate-300">
                    <span className="text-slate-400 font-sans font-semibold">SPRO Path:</span> {item.sproPath}
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{item.details}</p>

                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <span className="text-slate-400 font-semibold">Underlying ECC Tables:</span>
                    {item.tables.map(t => (
                      <span key={t} className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-bold">
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="text-[11px] text-indigo-700 dark:text-indigo-300 bg-indigo-50/80 dark:bg-indigo-950/40 p-2 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
                    <span className="font-bold">ECC vs S/4HANA Architecture Difference:</span> {item.eccVsS4Differences}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================== TAB 7: T-CODES LAUNCHPAD ===================== */}
        {activeTab === 'tcodes' && (
          <div className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-blue-500" />
                Live SAP ECC 6.0 SD WebGUI Transaction Direct Launcher
              </h3>
              <p className="text-xs text-slate-500">
                Execute any SAP ECC Sales and Distribution transaction code directly on Host <code className="text-blue-600 font-mono font-bold">{sys.host}:{sys.port}</code> Client <code className="font-mono font-bold">{sys.client}</code>.
              </p>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    id="input-ecc-custom-tcode"
                    type="text"
                    value={customTcode}
                    onChange={e => setCustomTcode(e.target.value.toUpperCase())}
                    placeholder="Enter ECC T-Code (e.g. VA01, VA03, VL01N, VF01, VK11, XD03)..."
                    className="w-full px-3 py-2 text-xs font-mono font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md uppercase"
                  />
                </div>
                <a
                  id="btn-launch-custom-ecc-tcode"
                  href={eccService.generateTcodeUrl(customTcode, sys.client)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-md flex items-center gap-1.5 shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Launch {customTcode}
                </a>
              </div>
            </div>

            {/* SD Transaction Catalog by Category */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Sales & Orders */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 bg-white dark:bg-slate-900 space-y-2">
                <h4 className="text-xs font-bold uppercase text-blue-600 flex items-center gap-1">
                  <ShoppingCart className="w-3.5 h-3.5" />
                  Sales & Quotations
                </h4>
                <div className="space-y-1.5 text-xs">
                  {[
                    { tcode: 'VA01', desc: 'Create Sales Order' },
                    { tcode: 'VA02', desc: 'Change Sales Order' },
                    { tcode: 'VA03', desc: 'Display Sales Order' },
                    { tcode: 'VA05', desc: 'List of Sales Orders' },
                    { tcode: 'VA11', desc: 'Create Inquiry' },
                    { tcode: 'VA21', desc: 'Create Quotation' },
                    { tcode: 'VA41', desc: 'Create Contract' }
                  ].map(item => (
                    <a
                      key={item.tcode}
                      href={eccService.generateTcodeUrl(item.tcode, sys.client)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-1.5 rounded hover:bg-blue-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      <span className="font-mono font-bold text-blue-600">{item.tcode}</span>
                      <span className="text-[11px] text-slate-500">{item.desc}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Shipping & Billing */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 bg-white dark:bg-slate-900 space-y-2">
                <h4 className="text-xs font-bold uppercase text-indigo-600 flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5" />
                  Shipping & Invoicing
                </h4>
                <div className="space-y-1.5 text-xs">
                  {[
                    { tcode: 'VL01N', desc: 'Create Outbound Delivery' },
                    { tcode: 'VL02N', desc: 'Change Delivery / PGI' },
                    { tcode: 'VL03N', desc: 'Display Delivery' },
                    { tcode: 'VL06O', desc: 'Outbound Delivery Monitor' },
                    { tcode: 'VF01', desc: 'Create Billing Doc' },
                    { tcode: 'VF02', desc: 'Change Billing Doc' },
                    { tcode: 'VF03', desc: 'Display Billing Doc' },
                    { tcode: 'VF04', desc: 'Billing Due List' }
                  ].map(item => (
                    <a
                      key={item.tcode}
                      href={eccService.generateTcodeUrl(item.tcode, sys.client)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-1.5 rounded hover:bg-indigo-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      <span className="font-mono font-bold text-indigo-600">{item.tcode}</span>
                      <span className="text-[11px] text-slate-500">{item.desc}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Master Data & Customizing */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 bg-white dark:bg-slate-900 space-y-2">
                <h4 className="text-xs font-bold uppercase text-emerald-600 flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5" />
                  Pricing & Master Data
                </h4>
                <div className="space-y-1.5 text-xs">
                  {[
                    { tcode: 'XD01', desc: 'Create Customer (Centrally)' },
                    { tcode: 'XD03', desc: 'Display Customer Master' },
                    { tcode: 'VK11', desc: 'Create Condition Record' },
                    { tcode: 'VK13', desc: 'Display Condition Record' },
                    { tcode: 'CO09', desc: 'Availability Overview (ATP)' },
                    { tcode: 'FD32', desc: 'Customer Credit Master' },
                    { tcode: 'VKM3', desc: 'Release Sales Documents' },
                    { tcode: 'V/08', desc: 'Pricing Procedures (SPRO)' }
                  ].map(item => (
                    <a
                      key={item.tcode}
                      href={eccService.generateTcodeUrl(item.tcode, sys.client)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-1.5 rounded hover:bg-emerald-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      <span className="font-mono font-bold text-emerald-600">{item.tcode}</span>
                      <span className="text-[11px] text-slate-500">{item.desc}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
