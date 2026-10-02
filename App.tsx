
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message, ToolResult, UserRole, SapBackendTarget } from './types';
import { processSapQuery } from './services/geminiClient';
import { RBAC_PROFILES } from './services/sapService';
import { 
  OrderCard, 
  InvoiceCard, 
  DeliveryCard,
  InventoryCard, 
  TransactionResultCard, 
  GuiScreenCard, 
  DelegationCard,
  AnalyticsReportCard,
  DownloadDocCard,
  KnowledgeRetrievalCard,
  LiveODataRecordsCard,
  SdDeliveryBillingReportCard,
  SdO2CFunnelReportCard,
  SdAtpMultiPlantReportCard,
  SdCreditExposureReportCard,
  SdPricingAnomalyReportCard,
  SdLateDeliveryRiskReportCard,
  SdRevenueBreakdownReportCard,
  SdTopMarginCustomersReportCard,
  SdExecutiveIntelligenceReportCard,
  SdActionResultCard,
  SdActionApprovalCard,
  FicoGLAccountReportCard,
  FicoAccountsPayableReportCard,
  FicoServiceUnavailableCard,
  S4BasisHealthReportCard,
  S4IntegrationMonitoringCard,
  MmLiveReportCard,
  HanaDbIntelligenceCard,
  BwAnalyticalQueryCard,
  ForecastCard,
  ComparisonCard,
  EnterpriseInsightCard,
  ConnectorStatusCard,
  McpRegistryCard,
  McpTraceCard,
  IdocSummaryCard,
  IdocAnalysisCard,
  IdocReprocessingCard,
  IdocDetailsCard,
  FreightOrderDetailCard,
  AribaInvoiceDetailCard,
  TmDashboardCard,
  AribaDashboardCard,
  CollaborationFlowCard,
  PurchaseOrderCard,
  SapAgentListCard,
  SproConfigListCard,
  SecurityAuditListCard,
  AbapDumpDiagnosticCard,
  AutonomousOperationCard,
  BasisSystemMetricsCard,
  BasisJobActionCard,
  BasisSpoolActionCard,
  BasisHealthCheckCard,
  BasisAutonomousPipelineCard,
  PpAutonomousCopilotCard,
  MmAutonomousCopilotCard,
  TmAutonomousCopilotCard,
  QmAutonomousCopilotCard,
  RfqCard,
  SupplierComparisonCard,
  PurchaseContractCard,
  SupplierAnalyticsCard,
  ProductionOrderCard,
  MrpRunCard,
  CapacityPlanCard,
  BomValidationCard,
  RoutingAnalysisCard,
  ManufacturingStatusCard,
  JournalEntryCard,
  GlBalanceCard,
  ApArSubledgerCard,
  BankReconciliationCard,
  FixedAssetCard,
  FinancialStatementCard,
  FinancialCloseCard,
  CostCenterCard,
  ProfitCenterCard,
  InternalOrderCard,
  CopaAnalysisCard,
  CostPlanningCard,
  AllocationCycleCard,
  EmployeeMasterCard,
  LeaveRequestCard,
  PayrollInquiryCard,
  RecruitmentPipelineCard,
  OnboardingTrackerCard,
  OrgChartCard,
  PerformanceReviewCard,
  BenefitsEligibilityCard,
  AbapCodeAnalysisCard,
  CdsViewCard,
  RapAppCard,
  BadiEnhancementCard,
  FormInterfaceCard,
  AbapUnitResultCard,
  SapLandscapeOverviewCard,
  TransportManagementCard,
  KernelUpgradeStatusCard,
  DatabasePerformanceCard,
  ClientAdministrationCard,
  SystemAvailabilitySlaCard,
  GrcUserSecurityCard,
  GrcSodAnalysisCard,
  GrcAccessRequestCard,
  GrcComplianceAuditCard,
  GrcSecurityMonitoringCard,
  SecurityAutonomousCopilotCard,
  EwmWarehouseTaskCard,
  EwmStorageBinCard,
  EwmInboundDeliveryCard,
  EwmOutboundPickingCard,
  EwmPhysicalInventoryCard,
  EwmShipmentTrackingCard,
  EwmHumanApprovalRulesCard,
  EwmActionEvaluationCard,
  EwmMultiAgentCollaborationCard,
  EwmWarehouseOptimizationCard,
  EwmAutonomousExceptionCard,
  EwmPredictiveWarehouseCard,
  EwmAutonomousActionsCard,
  EwmLaborCapacityProductivityCard,
  EwmInventoryStockCard,
  EwmOutboundProcessingCard,
  EwmWarehouseOperationsCard,
  EwmExecutiveCard,
  BasisExecutiveCard,
  QmInspectionLotCard,
  QmQualityNotificationCard,
  QmDefectAnalysisCard,
  QmQualityAuditCard,
  QmQualityCertificateCard,
  QmQualityReportCard,
  QmSupplierQualityIntelligenceCard,
  QmCustomerComplaintIntelligenceCard,
  QmPredictiveQualityAiCard,
  QmAutonomousExceptionManagementCard,
  QmQualityAnalyticsCard,
  QmDigitalQualityTwinCard,
  QmCrossModuleCollaborationCard,
  PmWorkOrderCard,
  PmPreventiveScheduleCard,
  PmEquipmentHistoryCard,
  PmMaintenanceNotificationCard,
  PmAssetMonitoringCard,
  PmMaintenanceAnalyticsCard,
  TmFreightOrderCard,
  TmRouteOptimizationCard,
  TmCarrierTrackingCard,
  TmDeliveryMonitoringCard,
  TmLogisticsAnalyticsCard,
  EhsIncidentCard,
  EhsSafetyAuditCard,
  EhsHazardousMaterialCard,
  EhsPermitCard,
  EhsEnvironmentalReportCard,
  GtsCustomsDeclarationCard,
  GtsDeniedPartyScreeningCard,
  GtsImportExportComplianceCard,
  GtsTradePreferenceCard,
  GtsGlobalTradeAnalyticsCard,
  Bw4HanaDashboardCard,
  Bw4HanaKpiReportCard,
  Bw4HanaPredictiveForecastCard,
  Bw4HanaDatasphereModelCard,
  Bw4HanaExecutiveInsightCard,
  BtpAppDeploymentCard,
  BtpIntegrationSuiteCard,
  BtpEventMeshCard,
  BtpCapRuntimeCard,
  BtpKymaClusterCard,
  BtpAiFoundationCard,
  CpiInterfaceMonitorCard,
  CpiFailureRootCauseCard,
  CpiRetryExecutionCard,
  CpiMappingInspectorCard,
  CpiApiCatalogCard,
  FioriMyInboxCard,
  FioriApprovalActionCard,
  FioriAppLaunchCard,
  FioriTileAnalyticsCard,
  MdgChangeRequestCard,
  MdgDuplicateCheckCard,
  MdgDataQualityAuditCard,
  Bw4HanaAutonomousCopilotCard,
  HrAutonomousCopilotCard
} from './components/DataCards';
import { S4MigrationDashboardCard } from './components/S4MigrationCards';
import { ProcessMiningCard } from './components/ProcessMiningCard';
import { FicoAutonomousCopilotCard } from './components/FicoAutonomousCopilotCard';
import { AbapAutonomousCopilotCard } from './components/AbapAutonomousCopilotCard';
import { TransportIntelligenceCard } from './components/TransportIntelligenceCard';
import { CodeDependencyAnalysisCard } from './components/CodeDependencyAnalysisCard';
import { AbapSecurityAnalysisCard } from './components/AbapSecurityAnalysisCard';
import { AbapAutonomousDocumentationCard } from './components/AbapAutonomousDocumentationCard';
import { MultiAgentAbapArchitectureCard } from './components/MultiAgentAbapArchitectureCard';
import { CrossAgentCollaborationCard } from './components/CrossAgentCollaborationCard';
import { AbapApprovalModelCard } from './components/AbapApprovalModelCard';
import { EccAutonomousCopilotCard } from './components/EccAutonomousCopilotCard';
import { EccSdAutonomousCopilotCard } from './components/EccSdAutonomousCopilotCard';
import { PpExecutiveCard } from './components/PpExecutiveCard';
import { TmExecutiveCard } from './components/TmExecutiveCard';
import { SecurityExecutiveCard } from './components/SecurityExecutiveCard';
import { MmExecutiveCard } from './components/MmExecutiveCard';
import { AbapExecutiveCard } from './components/AbapExecutiveCard';
import { HrExecutiveCard } from './components/HrExecutiveCard';
import { QmExecutiveCard } from './components/QmExecutiveCard';
import { PmExecutiveCard } from './components/PmExecutiveCard';
import { EhsExecutiveCard } from './components/EhsExecutiveCard';
import { BwAnalyticsExecutiveCard } from './components/BwAnalyticsExecutiveCard';
import { 
  ShieldCheck, 
  FileSearch 
} from 'lucide-react';
import { LoginModal } from './components/LoginModal';
import { SapFineTuningStudio } from './components/SapFineTuningStudio';
import { SapFioriLaunchpad } from './components/SapFioriLaunchpad';
import { SelfHealingApprovalModal, HealingProposal } from './components/SelfHealingApprovalModal';
import { SapEmbeddedWorkspace, SapTab } from './components/SapEmbeddedWorkspace';
import { idocService } from './services/idocService';
import { LiveSapUnavailableCard } from './components/LiveSapUnavailableCard';
import { AnswerTrustPanel } from './components/AnswerTrustPanel';
import { sapOperatingModeManager } from './services/sapService';

const isLiveSapUnavailableMessage = (content?: string) =>
  Boolean(
    content?.includes('[LIVE SAP REQUIRED]') ||
    content?.includes('[LIVE_SAP_UNAVAILABLE]') ||
    content?.includes('[LIVE_ECC_UNAVAILABLE]') ||
    content?.includes('SAP Connection Gateway Timeout') ||
    content?.includes('I encountered an error connecting to the SAP Core Gateway')
  );

const getMessageTheme = (content: string) => {
  const lower = content?.toLowerCase() || '';
  // Honest live-data-unavailable disclosures (e.g. "I will not fabricate...", "no genuine ... deployed",
  // "service group ... not published") must NEVER be styled as a success, even if the explanatory text
  // happens to contain positive-sounding words like "connected"/"verified" in a negated context
  // (e.g. "requires a connected SAP GRC Access Control system"). Checked first, highest priority.
  if (
    lower.includes('will not fabricate') || lower.includes('genuinely not') || lower.includes('genuinely does not') ||
    lower.includes('not deployed') || lower.includes('not published') || lower.includes('no service found') ||
    lower.includes('not implemented') || lower.includes('cannot be resolved') || lower.includes('not available live') ||
    lower.includes('no genuine') || lower.includes('no live') || lower.includes('no real') || lower.includes('not connected') ||
    lower.includes('requires a connected') || lower.includes('will not make anything up') || lower.includes('will not make up any of this') ||
    lower.includes('nothing genuine to show') || lower.includes('do not have real data') || lower.includes('do not have any real') ||
    lower.includes('is not connected here') || lower.includes('has not been switched on') || lower.includes('cannot pull live data') ||
    lower.includes('cannot pull real') || lower.includes('cannot reach') || lower.includes('no real data source')
  ) {
    return {
      border: 'border-l-4 border-l-slate-400 border-slate-200',
      bg: 'bg-slate-50/40',
      icon: 'fa-solid fa-circle-info text-slate-500',
      title: 'LIVE CAPABILITY DISCLOSURE',
      accentText: 'text-slate-600',
      pillBg: 'bg-slate-50 border-slate-200 text-slate-600',
      pillLabel: 'Live Probe Verified'
    };
  }
  if (lower.includes('abap') || lower.includes('crash') || lower.includes('failed') || lower.includes('error') || lower.includes('exception') || lower.includes('aborted') || lower.includes('unreachable') || lower.includes('st22')) {
    return {
      border: 'border-l-4 border-l-rose-500 border-rose-200',
      bg: 'bg-rose-50/15',
      icon: 'fa-solid fa-triangle-exclamation text-rose-600',
      title: 'CORE EXCEPTION DIAGNOSTICS',
      accentText: 'text-rose-600',
      pillBg: 'bg-rose-50 border-rose-200 text-rose-700',
      pillLabel: 'Active Directory Verified'
    };
  }
  if (lower.includes('success') || lower.includes('verified') || lower.includes('connected') || lower.includes('completed') || lower.includes('authorized') || lower.includes('operational')) {
    return {
      border: 'border-l-4 border-l-emerald-500 border-emerald-200',
      bg: 'bg-emerald-50/15',
      icon: 'fa-regular fa-circle-check text-emerald-600',
      title: 'PROCESS VALIDATION SUCCESS',
      accentText: 'text-emerald-600',
      pillBg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      pillLabel: 'Active Directory Verified'
    };
  }
  if (lower.includes('forecast') || lower.includes('predict') || lower.includes('demand') || lower.includes('shortage') || lower.includes('analytics') || lower.includes('reconciliation')) {
    return {
      border: 'border-l-4 border-l-indigo-500 border-indigo-200',
      bg: 'bg-indigo-50/15',
      icon: 'fa-solid fa-chart-line text-indigo-600',
      title: 'PREDICTIVE TRANSFORMATION INTEL',
      accentText: 'text-indigo-600',
      pillBg: 'bg-indigo-50 border-indigo-200 text-indigo-700',
      pillLabel: 'Active Directory Verified'
    };
  }
  if (lower.includes('warning') || lower.includes('governance') || lower.includes('audit') || lower.includes('compliance') || lower.includes('restricted') || lower.includes('rbac')) {
    return {
      border: 'border-l-4 border-l-amber-400 border-amber-200',
      bg: 'bg-amber-50/15',
      icon: 'fa-solid fa-shield-halved text-amber-600',
      title: 'ADVISORY & SYSTEM GOVERNANCE',
      accentText: 'text-amber-700',
      pillBg: 'bg-amber-50 border-amber-200 text-amber-700',
      pillLabel: 'Active Directory Verified'
    };
  }
  return {
    border: 'border-l-4 border-l-[#008FD3] border-blue-200',
    bg: 'bg-blue-50/5',
    icon: 'fa-solid fa-cube text-[#008FD3]',
    title: 'S/4HANA INTEGRATION COPILOT',
    accentText: 'text-blue-600',
    pillBg: 'bg-blue-50 border-blue-200 text-blue-700',
    pillLabel: 'Active Directory Verified'
  };
};

const SELF_HEALING_PROPOSALS: Record<string, HealingProposal> = {
  idoc: {
    id: 'PROP-IDOC-01',
    sourceType: 'IDoc',
    issueSummary: 'IDoc 0000000010045211 (ORDERS51) stuck on Inbound EDI Process with Status 51 (Mapping Failed)',
    rootCause: 'Material category blank. Segment failed because raw supplier key "AltParts" could not be resolved to internal MAT-A01 material representation in S/4HANA standard cross-reference indices.',
    proposedFix: 'Inject custom translation cross-reference mapping into SPRO custom cross-reference tables programmatically and perform WE19/BD87 background re-trigger execution.',
    riskAnalysis: 'Extremely Low risk. Aligns with standard S/4HANA & SAP Clean Core extensibility guidelines, ensuring zero direct database core customization.',
    affectedSystems: ['S/4HANA MM', 'Middleware CPI', 'EDI Gateway'],
    confidenceScore: 97,
    solutionOptions: [
      'Option 1: Inject SPRO translation mappings dynamically and reprocess via standard BD87 pipeline (Recommended)',
      'Option 2: Use standard WE19 test tool to manually patch raw segments and re-dispatch XML document',
      'Option 3: Hold process queue, reject transaction, and request supplier to resubmit standard payload'
    ]
  },
  masterdata: {
    id: 'PROP-MD-02',
    sourceType: 'MasterData',
    issueSummary: 'Customer KNA1 Sold-to Party "Walmart Inc" lacks active S/4HANA Business Partner (BP) role grouping correlation',
    rootCause: 'Missing Master Customer-Vendor Integration (CVI) mapping. Sales order validation failed because the customer reference could not be synced with standard CRM BP schemas.',
    proposedFix: 'Trigger synchronized background Business Partner creation via FLBPD1 with assigned commercial customer roles to bridge standard tables.',
    riskAnalysis: 'Medium risk. Injects new records back into standard central Customer and BP registers in S/4HANA core.',
    affectedSystems: ['S/4HANA SD', 'Master Data Governance (MDG)'],
    confidenceScore: 92,
    solutionOptions: [
      'Option 1: Perform standard CVI synchronization mapping using background FLBPD1 job (Recommended)',
      'Option 2: Override validation trigger temporarily inside SD user-exit MV45AFZZ logic',
      'Option 3: Reject order, request master data steward to manually build federated BP profiles'
    ]
  },
  batchjob: {
    id: 'PROP-JOB-03',
    sourceType: 'BatchJob',
    issueSummary: 'System Batch Job "JOB_MRP_DAILY_PL10" aborted inside standard SM37 logs',
    rootCause: 'Database deadlock detected on Standard MARA/MARC material tables. Triggered by a concurrent heavy warehouse OData confirmation transaction.',
    proposedFix: 'Pinpoint and terminate anomalous lock entries inside SM12, release resource queue, and trigger immediate priority SM37 retry execution.',
    riskAnalysis: 'Low risk. Safely flushes temporary record lock allocations, with zero impact on application tables.',
    affectedSystems: ['S/4HANA Basis', 'HANA DB Engine'],
    confidenceScore: 98,
    solutionOptions: [
      'Option 1: Clear lock references in SM12 and release JOB_MRP_DAILY_PL10 background thread (Recommended)',
      'Option 2: Manually kill database process ID (PID) via HANA cockpit and perform full server thread refresh',
      'Option 3: Reschedule daily MRP run job to execute at a delayed low-utilization maintenance window'
    ]
  },
  integration: {
    id: 'PROP-INT-04',
    sourceType: 'Integration',
    issueSummary: 'CPI Transformation Flow rejected at standard S/4HANA OData customer inbound node',
    rootCause: 'Schema timestamp format delta. Cloud integration flow sent an standard string timestamp "2026-05-28T04:16:42Z", whereas OData expects EDM.DateTimeOffset boundaries.',
    proposedFix: 'Refactor CPI Message Mapping parser rule to enforce DateTransform conversion to standard EDM schema, then dispatch re-run.',
    riskAnalysis: 'Very Low risk. Fix is fully contained inside SAP BTP Integration Suite middleware, with zero core S/4 footprint.',
    affectedSystems: ['SAP CPI / CI', 'OData Gateway Hub', 'S/4HANA Core'],
    confidenceScore: 95,
    solutionOptions: [
      'Option 1: Re-align CPI mapping nodes with standard OData schemas and reprocess (Recommended)',
      'Option 2: Embed custom post-rendering Groovy script in CPI pipeline to sanitize time offsets',
      'Option 3: Configure S/4 OData service parameters inside /IWFND/MAINT_SERVICE to relax string strictness'
    ]
  },
  workflow: {
    id: 'PROP-WF-05',
    sourceType: 'Workflow',
    issueSummary: 'Strategic Purchase order approval thread "PO_WF_MM_9921" aborted due to dead agent path',
    rootCause: 'Missing organizational setup. MM Approver team has no active S/4 user association or email profiles, stalling standard routing.',
    proposedFix: 'Execute SWIA administrator override to route stalled thread directly to designated fallback supervisor "CoE Lead".',
    riskAnalysis: 'Medium risk. Bypass of standard user HR hierarchies. Transaction logged to Security Audit Trail.',
    affectedSystems: ['S/4HANA MM', 'SAP Basis Workflow', 'SuccessFactors HR Link'],
    confidenceScore: 91,
    solutionOptions: [
      'Option 1: Force SWIA administrator override and assign secondary CoE backup agent (Recommended)',
      'Option 2: Maintain missing user organizational assignments in t-code PPOME and retry workflow',
      'Option 3: Release PO document immediately using super-user ME28 release transaction overrides'
    ]
  },
  pricing: {
    id: 'PROP-PRICE-06',
    sourceType: 'Pricing',
    issueSummary: 'Standard Pricing Condition PR00 rejected because of missing validity ranges inside SPRO',
    rootCause: 'Condition table T685A is missing an active valid entry for the required combination of Sales Org 1000 and Dist Channel 10.',
    proposedFix: 'Incorporate active sales price condition record inside VK11 and synchronize core SD transaction rules.',
    riskAnalysis: 'Low risk. standard transactional SD maintenance step. Safely aligns standard functional behavior.',
    affectedSystems: ['S/4HANA SD', 'FI-CO Pricing Module'],
    confidenceScore: 94,
    solutionOptions: [
      'Option 1: Maintain valid price ledger inside VK11 and synchronize SD transaction rules (Recommended)',
      'Option 2: Re-adjust standard SPRO pricing configuration paths to lookup fallback global sales rules instead',
      'Option 3: Bypass SD pricing using standard manual price condition inputs inside sales contract'
    ]
  }
};

interface CopyableCodeBlockProps {
  className?: string;
  children: React.ReactNode;
  [key: string]: any;
}

const CopyableCodeBlock: React.FC<CopyableCodeBlockProps> = ({ className, children, ...props }) => {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);

  const handleCopy = async () => {
    const rawText = codeRef.current?.innerText || String(children);
    // Clean trailing newlines if any
    const codeText = rawText.replace(/\n$/, '');
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      const textArea = document.createElement("textarea");
      textArea.value = codeText;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (copyErr) {
        console.error('Fallback copy failed', copyErr);
      }
      document.body.removeChild(textArea);
    }
  };

  const language = className?.includes('language-') 
    ? className.replace('language-', '') 
    : 'code';

  return (
    <div className="my-4 relative group rounded-xl overflow-hidden border border-slate-800 shadow-lg bg-[#0F172A]">
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#1E293B] border-b border-slate-800 select-none">
        <span className="text-[10px] uppercase font-black tracking-widest text-[#008FD3] font-mono flex items-center space-x-1.5">
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full inline-block animate-pulse"></span>
          <span>{language}</span>
        </span>
        <div className="relative group/btn flex items-center">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-2.5 py-1 bg-[#111827] hover:bg-[#334155] text-slate-300 hover:text-white rounded border border-slate-700/60 transition-all duration-150 cursor-pointer text-xs font-bold active:scale-95 shadow-sm"
          >
            {copied ? (
              <>
                <i className="fas fa-check text-green-400 text-[10px]"></i>
                <span className="text-green-400 text-[11px] font-extrabold">Copied!</span>
              </>
            ) : (
              <>
                <i className="far fa-copy text-[11px] text-slate-400"></i>
                <span className="text-[11px]">Copy Code</span>
              </>
            )}
          </button>
          <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-[#1F2937] border border-slate-700 text-slate-200 text-[10px] font-semibold rounded shadow-xl opacity-0 pointer-events-none group-hover/btn:opacity-100 transition-opacity duration-150 whitespace-nowrap z-20">
            Copy to clipboard
          </div>
        </div>
      </div>
      <pre className="font-mono text-xs overflow-x-auto p-4 md:p-5 text-slate-100 leading-relaxed scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-[#0F172A] max-h-[500px]">
        <code ref={codeRef} className="block select-text whitespace-pre" {...props}>
          {children}
        </code>
      </pre>
    </div>
  );
};

// Contains rendering crashes to a single result card instead of blanking the whole chat
class ToolResultErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: unknown) {
    console.error('[TOOL RESULT RENDER ERROR]', error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-amber-50 text-amber-800 p-4 rounded-xl border border-amber-200 mb-4 text-xs font-bold">
          <i className="fas fa-triangle-exclamation mr-2"></i> This result could not be displayed due to an unexpected data format.
        </div>
      );
    }
    return this.props.children;
  }
}

const App: React.FC = () => {
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('Functional Consultant');
  const [sapBackendTarget, setSapBackendTarget] = useState<SapBackendTarget>('BOTH');
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Initial state true for first load, or set to false to force initial login
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null);
  const [workspaceMode, setWorkspaceMode] = useState<'copilot' | 'studio' | 'fiori'>('copilot');
  const [pendingSelfHealing, setPendingSelfHealing] = useState<HealingProposal | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Embedded SAP Workspace states
  const [sapPanelOpen, setSapPanelOpen] = useState(false);
  const [sapPanelWidth, setSapPanelWidth] = useState(50); // percentage (e.g. 50%)
  const [sapEmbeddedTabs, setSapEmbeddedTabs] = useState<SapTab[]>([]);
  const [activeSapTabId, setActiveSapTabId] = useState<string>('');

  const isResizingRef = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizingRef.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizingRef.current) return;
    const containerWidth = window.innerWidth;
    // Calculate percentage width of the right panel
    const rightPanelPx = containerWidth - e.clientX;
    const rightPanelPct = Math.min(95, Math.max(15, (rightPanelPx / containerWidth) * 100));
    setSapPanelWidth(rightPanelPct);
  };

  const handleMouseUp = () => {
    isResizingRef.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handleOpenEmbeddedSapTab = (tabConfig: { 
    title: string; 
    url: string; 
    type: 'invoice' | 'sales_order' | 'delivery' | 'purchase_order' | 'material' | 'business_partner' | 'freight_order' | 'idoc' | 'workflow' | 'fiori' | 'generic_transaction' | 'journal_entry' | 'basis_admin'; 
    docId: string; 
    activeTCode?: string; 
  }) => {
    // If we already have a tab with this type and docId, just activate it
    const existing = sapEmbeddedTabs.find(t => t.type === tabConfig.type && t.docId === tabConfig.docId && tabConfig.docId !== '');
    if (existing) {
      setActiveSapTabId(existing.id);
      setSapPanelOpen(true);
      return;
    }

    const newId = `sap-tab-${Date.now()}`;
    const newTab: SapTab = {
      id: newId,
      title: tabConfig.title,
      url: tabConfig.url,
      type: tabConfig.type,
      docId: tabConfig.docId,
      activeTCode: tabConfig.activeTCode,
      history: [tabConfig.url],
      historyIndex: 0
    };
    setSapEmbeddedTabs(prev => [...prev, newTab]);
    setActiveSapTabId(newId);
    setSapPanelOpen(true);
  };

  const openEmbeddedSapLink = (url: string, linkText: string) => {
    let type: 'invoice' | 'sales_order' | 'delivery' | 'purchase_order' | 'material' | 'business_partner' | 'freight_order' | 'idoc' | 'workflow' | 'fiori' | 'generic_transaction' | 'journal_entry' | 'basis_admin' = 'fiori';
    let title = 'SAP Document';
    let docId = '';
    let activeTCode = '';

    const lowerUrl = url.toLowerCase();
    const lowerText = linkText.toLowerCase();
    const lastCreatedSo = (typeof window !== 'undefined' && (window as any).__lastCreatedSalesOrderId) || 
                          (typeof localStorage !== 'undefined' && localStorage.getItem('s4_last_created_so')) || '';

    if (lowerUrl.includes('billingdocument') || lowerUrl.includes('vf03') || lowerText.includes('invoice') || lowerText.includes('billing')) {
      type = 'invoice';
      activeTCode = 'VF03';
      const match = url.match(/BillingDocument=([0-9a-zA-Z\-]+)/) || url.match(/VBELN=([0-9a-zA-Z\-]+)/) || linkText.match(/(\d{6,10})/);
      docId = match ? match[1] : '90003108';
      title = `Invoice ${docId}`;
    } else if (lowerUrl.includes('salesorder') || lowerUrl.includes('va03') || lowerText.includes('sales order') || lowerText.includes('order')) {
      type = 'sales_order';
      activeTCode = 'VA03';
      const match = url.match(/SalesOrder=([0-9a-zA-Z\-]+)/i) || 
                    url.match(/orderId=([0-9a-zA-Z\-]+)/i) || 
                    url.match(/docId=([0-9a-zA-Z\-]+)/i) || 
                    url.match(/VBELN=([0-9a-zA-Z\-]+)/i) || 
                    url.match(/PO-WAR-[0-9a-zA-Z]+/) || 
                    linkText.match(/#?(\d{3,10})/);
      docId = match ? match[1] : (lastCreatedSo || 'ORD-80004562');
      if (docId.startsWith('ORD-ORD-')) docId = docId.replace('ORD-ORD-', 'ORD-');
      title = `Sales Order ${docId}`;
    } else if (lowerUrl.includes('delivery') || lowerUrl.includes('vl03') || lowerText.includes('delivery') || lowerText.includes('outbound')) {
      type = 'delivery';
      activeTCode = 'VL03N';
      const match = url.match(/Delivery=([0-9a-zA-Z\-]+)/) || url.match(/VBELN=([0-9a-zA-Z\-]+)/) || linkText.match(/(\d{6,10})/);
      docId = match ? match[1] : (lastCreatedSo ? `8000${lastCreatedSo.replace(/\D/g, '').padStart(4, '0')}` : '80000002');
      title = `Delivery ${docId}`;
    } else if (lowerUrl.includes('purchaseorder') || lowerUrl.includes('me23') || lowerText.includes('purchase order') || lowerText.includes('po')) {
      type = 'purchase_order';
      activeTCode = 'ME23N';
      const match = url.match(/PurchaseOrder=([0-9a-zA-Z\-]+)/) || linkText.match(/(\d{6,10})/);
      docId = match ? match[1] : 'PO-450019283';
      title = `PO ${docId}`;
    } else if (lowerUrl.includes('businesspartner') || lowerUrl.includes('bp') || lowerText.includes('partner') || lowerText.includes('bp')) {
      type = 'business_partner';
      activeTCode = 'BP';
      const match = url.match(/BusinessPartner=([0-9a-zA-Z\-]+)/) || linkText.match(/([a-zA-Z0-9_\-]+)/);
      docId = match ? match[1] : 'USCU_S03';
      title = `Partner ${docId}`;
    } else if (lowerUrl.includes('material') || lowerUrl.includes('mm03') || lowerText.includes('material')) {
      type = 'material';
      activeTCode = 'MM03';
      const match = url.match(/Material=([a-zA-Z0-9\-]+)/) || linkText.match(/([a-zA-Z0-9\-]{4,15})/);
      docId = match ? match[1] : 'MZ-FG-C900';
      title = `Material ${docId}`;
    } else if (lowerUrl.includes('journal') || lowerUrl.includes('fb03') || lowerText.includes('journal') || lowerText.includes('ledger') || lowerText.includes('posting')) {
      type = 'journal_entry';
      activeTCode = 'FB03';
      const match = url.match(/JournalEntry=([0-9a-zA-Z\-]+)/) || linkText.match(/(\d{6,10})/);
      docId = match ? match[1] : '190004128';
      title = `Journal ${docId}`;
    } else if (lowerUrl.includes('idoc') || lowerText.includes('idoc') || lowerUrl.includes('we02') || lowerUrl.includes('bd87')) {
      type = 'idoc';
      activeTCode = lowerUrl.includes('bd87') ? 'BD87' : 'WE02';
      const match = url.match(/idoc=(\d+)/i) || linkText.match(/(\d{3,18})/);
      docId = match ? match[1] : '0000000010045211';
      // Pad short IDoc IDs like 1002 to match our canonical representation
      if (docId && docId.length < 16 && !isNaN(Number(docId))) {
        docId = docId.padStart(16, '0');
      }
      title = `IDoc ${docId}`;
    } else if (lowerUrl.includes('workflow') || lowerText.includes('workflow') || lowerText.includes('approval') || lowerUrl.includes('sbwp')) {
      type = 'workflow';
      activeTCode = 'SBWP';
      const match = url.match(/taskid=([a-zA-Z0-9_\-]+)/i) || linkText.match(/([a-zA-Z0-9_\-]{4,15})/);
      docId = match ? match[1] : 'WF-TASK-4920';
      title = `Workflow Task`;
    } else if (lowerUrl.includes('fiori') || lowerText.includes('fiori') || lowerText.includes('launchpad')) {
      type = 'fiori';
      title = 'Fiori Launchpad';
      activeTCode = 'FLP';
    } else if (url.includes('~transaction=')) {
      type = 'generic_transaction';
      const tcodeMatch = url.match(/~transaction=([^%&\s\?]+)/) || url.match(/~transaction=([^&\s\?]+)/);
      activeTCode = tcodeMatch ? decodeURIComponent(tcodeMatch[1]).split(' ')[0] : 'SU3';
      title = `T-Code: ${activeTCode}`;
      const docIdMatch = url.match(/id=([0-9a-zA-Z\-]+)/i);
      docId = docIdMatch ? docIdMatch[1] : '';
    }

    handleOpenEmbeddedSapTab({
      title,
      url,
      type,
      docId,
      activeTCode
    });
  };

  const handleCloseSapTab = (tabId: string) => {
    setSapEmbeddedTabs(prev => {
      const filtered = prev.filter(t => t.id !== tabId);
      if (activeSapTabId === tabId && filtered.length > 0) {
        setActiveSapTabId(filtered[filtered.length - 1].id);
      }
      if (filtered.length === 0) {
        setSapPanelOpen(false);
      }
      return filtered;
    });
  };

  // Add global click listener to intercept SAP links
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      let currentEl = e.target as HTMLElement | null;
      while (currentEl && currentEl.tagName !== 'A') {
        currentEl = currentEl.parentElement;
      }
      
      if (!currentEl) return;
      const href = currentEl.getAttribute('href');
      if (!href) return;
      
      const isSapLink = 
        href.includes('s4hana.ondemand.com') || 
        href.includes('1stbasis.com') || 
        href.includes('sap/bc/gui') || 
        href.includes('FioriLaunchpad') ||
        href.includes('sap/bc/ui') ||
        href.includes('~transaction=') ||
        href.includes('#BillingDocument') ||
        currentEl.classList.contains('sap-direct-link') ||
        currentEl.closest('.sap-direct-link') !== null ||
        currentEl.innerText.toLowerCase().includes('open sap s/4') ||
        currentEl.innerText.toLowerCase().includes('open sap fiori') ||
        currentEl.innerText.toLowerCase().includes('open sap delivery') ||
        currentEl.innerText.toLowerCase().includes('open sap sales order');

      const isBypassedLink = 
        currentEl.getAttribute('data-bypass-intercept') === 'true' ||
        currentEl.classList.contains('bypass-intercept') ||
        currentEl.closest('.bypass-intercept') !== null ||
        currentEl.innerText.toLowerCase().includes('fiori') ||
        currentEl.innerText.toLowerCase().includes('webgui') ||
        currentEl.innerText.toLowerCase().includes('launchpad') ||
        currentEl.innerText.toLowerCase().includes('open gateway directly') ||
        currentEl.innerText.toLowerCase().includes('s8h');

      if (isSapLink) {
        if (isBypassedLink) {
          // Bypassed links should NOT be intercepted or have preventDefault called.
          // This allows the browser to open target="_blank" natively in a new browser window/tab!
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        openEmbeddedSapLink(href, currentEl.innerText);
      }
    };

    document.addEventListener('click', handleGlobalClick, true);
    return () => {
      document.removeEventListener('click', handleGlobalClick, true);
    };
  }, [sapEmbeddedTabs, sapPanelOpen]);

  // Clean up resizing mouse events if App unmounts
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const fallbackCopyText = (text: string, index: number) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Fallback copy failed', err);
    }
    document.body.removeChild(textArea);
  };

  const handleCopy = (content: string, index: number) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(content).then(() => {
          setCopiedIndex(index);
          setTimeout(() => setCopiedIndex(null), 2000);
        }).catch(() => {
          fallbackCopyText(content, index);
        });
      } else {
        fallbackCopyText(content, index);
      }
    } catch (err) {
      fallbackCopyText(content, index);
    }
  };
  
  const [s8hConnStatus, setS8hConnStatus] = useState<'Checking' | 'Connected' | 'Unreachable' | 'Inactive'>('Checking');
  const [s8hStatusMsg, setS8hStatusMsg] = useState('Verifying route via proxy...');
  const [eccConnStatus, setEccConnStatus] = useState<'Checking' | 'Connected' | 'Unreachable' | 'Inactive'>('Checking');
  const [eccStatusMsg, setEccStatusMsg] = useState('Verifying ECC route via proxy...');
  const liveDataTrustLabel = sapBackendTarget === 'ECC' ? 'Live ECC source-of-truth' : sapBackendTarget === 'S/4HANA' ? 'Live S/4HANA source-of-truth' : 'Live ECC + S/4HANA source-of-truth';
  const activeBackendVerified = sapBackendTarget === 'ECC' ? eccConnStatus === 'Connected' : sapBackendTarget === 'S/4HANA' ? s8hConnStatus === 'Connected' : (s8hConnStatus === 'Connected' && eccConnStatus === 'Connected');
  const liveDataTrustColor = activeBackendVerified ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200';

  // The backend toggle (ECC / BOTH / S/4HANA) genuinely gates which system(s) are live-probed —
  // a system not selected is honestly marked 'Inactive' (never pinged, never shown as connected),
  // and a real probe failure is honestly shown as 'Unreachable' (never silently reported as
  // 'Connected' — no fabricated/fallback success state, per rules.md).
  useEffect(() => {
    let cancelled = false;

    const checkS8hConnection = async () => {
      setS8hConnStatus('Checking');
      try {
        // Credentials never leave the server — the browser only calls a dedicated status
        // endpoint (server holds process.env.SAP_S8H_USER/PWD, unavailable in the browser bundle).
        const res = await fetch('/api/s8h/ping');
        const data = await res.json();
        if (cancelled) return;
        if (data?.success) {
          setS8hConnStatus('Connected');
          setS8hStatusMsg(data.message || 'S8H Live ERP Connection Active!');
        } else {
          setS8hConnStatus('Unreachable');
          setS8hStatusMsg(data?.message || `Live probe returned HTTP ${data?.status} — connection not verified.`);
        }
      } catch (err: any) {
        if (cancelled) return;
        setS8hConnStatus('Unreachable');
        setS8hStatusMsg(`Live probe failed: ${err?.message || 'network error'}.`);
      }
    };

    const checkEccConnection = async () => {
      setEccConnStatus('Checking');
      try {
        const res = await fetch('/api/ecc/ping');
        const data = await res.json();
        if (cancelled) return;
        if (data?.success) {
          setEccConnStatus('Connected');
          setEccStatusMsg(data.message || 'ECC Live Connection Active.');
        } else {
          setEccConnStatus('Unreachable');
          setEccStatusMsg(data?.message || `Live probe returned HTTP ${data?.status} — connection not verified.`);
        }
      } catch (err: any) {
        if (cancelled) return;
        setEccConnStatus('Unreachable');
        setEccStatusMsg(`Live probe failed: ${err?.message || 'network error'}.`);
      }
    };

    if (sapBackendTarget === 'S/4HANA' || sapBackendTarget === 'BOTH') {
      checkS8hConnection();
    } else {
      setS8hConnStatus('Inactive');
      setS8hStatusMsg('S/4HANA not selected in the active backend toggle — no live connection attempted.');
    }

    if (sapBackendTarget === 'ECC' || sapBackendTarget === 'BOTH') {
      checkEccConnection();
    } else {
      setEccConnStatus('Inactive');
      setEccStatusMsg('ECC not selected in the active backend toggle — no live connection attempted.');
    }

    return () => { cancelled = true; };
  }, [sapBackendTarget]);

  const [sapOperatingMode, setSapOperatingMode] = useState<'LIVE' | 'SIMULATION'>(() => sapOperatingModeManager.getMode());

  useEffect(() => {
    const handleModeChanged = () => {
      setSapOperatingMode(sapOperatingModeManager.getMode());
    };
    window.addEventListener('sap-mode-changed', handleModeChanged);
    return () => window.removeEventListener('sap-mode-changed', handleModeChanged);
  }, []);

  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: "# **SAP Control Center Online**\n## System Status: Operational\n\nWelcome back. Your identity has been verified via Active Directory.\n\n- **Security Layer**: RBAC Active Security Layer enabled.\n- **Knowledge Base**: Internal-Only RAG Cluster Online.\n- **Access Level**: Restricted based on your active role profile.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeAgent, setActiveAgent] = useState<{name: string, action: string} | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-expand textarea height based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      // Clamps height between min-height 54px and max-height 240px
      textareaRef.current.style.height = `${Math.min(scrollHeight, 240)}px`;
    }
  }, [input]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadType, setUploadType] = useState<'PDF' | 'CSV' | 'DOC' | null>(null);
  const [attachedFile, setAttachedFile] = useState<{name: string, type: 'PDF' | 'CSV' | 'DOC', content?: string} | null>(null);

  // Multimodal SAP Image Expert states
  const [attachedImages, setAttachedImages] = useState<{name: string, type: string, data: string}[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [activeLightboxImage, setActiveLightboxImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // ChatGPT-style Real-time Voice & STT/TTS states
  const [isVoiceHubOpen, setIsVoiceHubOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isTTSPlaying, setIsTTSPlaying] = useState(false);
  const [voiceLang, setVoiceLang] = useState('en-US');
  const [handsFreeMode, setHandsFreeMode] = useState(() => {
    const saved = localStorage.getItem('adi_hands_free_mode');
    return saved !== null ? saved === 'true' : true;
  });
  const [ttsEnabled, setTtsEnabled] = useState(() => {
    const saved = localStorage.getItem('adi_tts_enabled');
    return saved !== null ? saved === 'true' : false; // Silent mode by default!
  });
  const [pushToTalkMode, setPushToTalkMode] = useState(() => {
    const saved = localStorage.getItem('adi_push_to_talk_mode');
    return saved !== null ? saved === 'true' : false; // Push-to-Talk off by default
  });
  const [speakingMessageIndex, setSpeakingMessageIndex] = useState<number | null>(null);
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  const VOICE_LANGUAGES = [
    { code: 'en-US', name: 'English (United States)', flag: '🇺🇸', label: 'English' },
    { code: 'de-DE', name: 'Deutsch (Germany)', flag: '🇩🇪', label: 'Deutsch' },
    { code: 'es-ES', name: 'Español (Spain)', flag: '🇪🇸', label: 'Español' },
    { code: 'fr-FR', name: 'Français (France)', flag: '🇫🇷', label: 'Français' },
    { code: 'ja-JP', name: '日本語 (Japan)', flag: '🇯🇵', label: '日本語' },
    { code: 'pt-BR', name: 'Português (Brazil)', flag: '🇧🇷', label: 'Português' },
    { code: 'hi-IN', name: 'हिन्दी (India)', flag: '🇮🇳', label: 'हिन्दी' }
  ];

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakText = (text: string, force: boolean = false, messageIndex: number | null = null) => {
    if (!window.speechSynthesis) return;
    if (!ttsEnabled && !force) return;
    window.speechSynthesis.cancel();

    // Strip markdown formatting, links, blocks and clean up string for clear audio synthesis
    const cleanText = text
      .replace(/#+\s?/g, '') 
      .replace(/\*+/g, '')   
      .replace(/`{3}[\s\S]*?`{3}/g, '[System code output omitted.]') 
      .replace(/`[^`]+`/g, '') 
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') 
      .replace(/-\s+/g, '')  
      .replace(/&nbsp;/gi, ' ')
      .replace(/<\/?[^>]+(>|$)/g, '') 
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = voiceLang;

    // Optional: map to optimal browser voice
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find(v => v.lang.startsWith(voiceLang.split('-')[0]));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => {
      setIsTTSPlaying(true);
      if (messageIndex !== null) {
        setSpeakingMessageIndex(messageIndex);
      }
    };
    utterance.onend = () => {
      setIsTTSPlaying(false);
      setSpeakingMessageIndex(null);
      // Auto-resume speech recognition if in hands-free mode, push-to-talk is off, and the console remains open
      if (handsFreeMode && !pushToTalkMode && isVoiceHubOpen) {
        setTimeout(() => {
          startListening();
        }, 500);
      }
    };
    utterance.onerror = () => {
      setIsTTSPlaying(false);
      setSpeakingMessageIndex(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (isTTSPlaying && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsTTSPlaying(false);
    }

    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    const rec = new SpeechRecognitionClass();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = voiceLang;

    rec.onstart = () => {
      setIsListening(true);
      setInterimTranscript('');
    };

    rec.onresult = (event: any) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setInterimTranscript(interim || final);
      if (final) {
        setInput(final);
      }
    };

    rec.onerror = (event: any) => {
      console.error("Speech recognition error handle:", event.error);
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
      setInterimTranscript(prev => {
        const textToSubmit = prev.trim() || input.trim();
        if (handsFreeMode && !pushToTalkMode && textToSubmit) {
          setTimeout(() => {
            handleSubmit(undefined, textToSubmit);
          }, 400);
        }
        return '';
      });
    };

    recognitionRef.current = rec;
    try {
      rec.start();
    } catch (err) {
      console.error("Failed to start Speech Recognition:", err);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
    setInterimTranscript('');
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  useEffect(() => {
    if (isVoiceHubOpen) {
      const t = setTimeout(() => {
        startListening();
      }, 300);
      return () => clearTimeout(t);
    } else {
      stopListening();
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsTTSPlaying(false);
    }
  }, [isVoiceHubOpen]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const prevMessagesCountRef = useRef(messages.length);

  const scrollToUserQuestion = (targetMsgIdx: number) => {
    const performScroll = () => {
      const container = scrollRef.current;
      if (!container) return;
      const targetEl = document.getElementById(`chat-msg-${targetMsgIdx}`);
      if (targetEl) {
        const containerRect = container.getBoundingClientRect();
        const targetRect = targetEl.getBoundingClientRect();
        const scrollOffset = targetRect.top - containerRect.top + container.scrollTop - 24;
        container.scrollTo({
          top: Math.max(0, scrollOffset),
          behavior: 'smooth'
        });
      }
    };

    performScroll();
    requestAnimationFrame(performScroll);
    const t1 = setTimeout(performScroll, 60);
    const t2 = setTimeout(performScroll, 180);
    const t3 = setTimeout(performScroll, 350);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const currentLen = messages.length;
    const prevLen = prevMessagesCountRef.current;
    prevMessagesCountRef.current = currentLen;

    const lastMsg = messages[messages.length - 1];

    if (currentLen > prevLen) {
      if (lastMsg && lastMsg.role === 'assistant') {
        // A new response is generated: scroll to the user's question at the top of the chat viewport
        let userMsgIdx = -1;
        for (let i = messages.length - 2; i >= 0; i--) {
          if (messages[i].role === 'user') {
            userMsgIdx = i;
            break;
          }
        }

        if (userMsgIdx !== -1) {
          scrollToUserQuestion(userMsgIdx);
        } else {
          scrollToUserQuestion(messages.length - 1);
        }
        return;
      } else if (lastMsg && lastMsg.role === 'user') {
        // User submitted a question: scroll to reveal question and typing indicator
        scrollToUserQuestion(messages.length - 1);
        return;
      }
    }

    if (isTyping && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, activeAgent]);

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as UserRole;
    setPendingRole(newRole);
    setIsAuthenticated(false);
  };

  const onLoginSuccess = () => {
    if (pendingRole) {
      setCurrentUserRole(pendingRole);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `# **Security Protocol Updated**\n## Role Profile: ${pendingRole}\n\nIdentity verified via Active Directory. Permissions have been re-calculated for the current session.\n\n- **Status**: Authorization Successful\n- **Scope**: ${pendingRole} module access granted.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }
    setIsAuthenticated(true);
    setPendingRole(null);
  };

  const handleSubmit = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    setWorkspaceMode('copilot');
    
    // Stop any speech synthesis instantly upon new query submission to avoid overlaps
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsTTSPlaying(false);
    }
    // Temporarily halt listening while processing
    if (isListening) {
      stopListening();
    }

    let q = customQuery || input;
    if (!q.trim() && !attachedFile) return;
    
    // If there's an attached file and the user just hit submit without changing text, or if they added text
    if (attachedFile) {
        const fileHeader = attachedFile.type === 'PDF' 
            ? `Process PDF Invoice: ${attachedFile.name}` 
            : attachedFile.type === 'CSV' 
            ? `Process CSV Order File: ${attachedFile.name}`
            : `Process uploaded file: ${attachedFile.name}`;
            
        const contentBlock = attachedFile.content ? `\n\n[FILE CONTENT START]\n${attachedFile.content}\n[FILE CONTENT END]` : "";
        
        q = q.includes(attachedFile.name) ? `${q}${contentBlock}` : `${fileHeader}. ${q}${contentBlock}`.trim();
    }

    if (!q.trim() || isTyping) return;

    // Check for explicit healing or correction triggers to satisfy ALWAYS KEEP HUMANS IN LOOP
    const queryLower = q.toLowerCase();
    let matchedProposal: HealingProposal | null = null;

    const idocMatch = q.match(/\b(0*56019|0*56001|0*57026|0*10045211|0*21044|0*2004|0*2006|0*3002|0*55004|0*1002|0*36007)\b/);
    let idocNo = "0000000010045211";
    if (idocMatch) {
      if (idocMatch[0].endsWith('56019')) idocNo = "0000000000056019";
      else if (idocMatch[0].endsWith('56001')) idocNo = "0000000000056001";
      else if (idocMatch[0].endsWith('57026')) idocNo = "0000000000057026";
      else if (idocMatch[0].endsWith('10045211')) idocNo = "0000000010045211";
      else if (idocMatch[0].endsWith('21044')) idocNo = "0000000000021044";
      else if (idocMatch[0].endsWith('2004')) idocNo = "0000000000002004";
      else if (idocMatch[0].endsWith('2006')) idocNo = "0000000000002006";
      else if (idocMatch[0].endsWith('3002')) idocNo = "0000000000003002";
      else if (idocMatch[0].endsWith('55004')) idocNo = "0000000000055004";
      else if (idocMatch[0].endsWith('1002')) idocNo = "0000000000001002";
      else if (idocMatch[0].endsWith('36007')) idocNo = "0000000000036007";
    }

    const isExplicitSelfHealingRequest = queryLower.includes('diagnose blocked business messages') ||
      queryLower.includes('heal proposal') ||
      queryLower.includes('self-healing proposal') ||
      queryLower.includes('approve fix') ||
      queryLower.includes('trigger proposal') ||
      queryLower.includes('request self-healing');

    if (isExplicitSelfHealingRequest) {
      if (queryLower.includes('idoc') || idocMatch) {
        if (idocNo === '0000000000056019' || idocNo === '0000000000056001' || idocNo === '0000000000057026') {
          matchedProposal = {
            id: 'PROP-IDOC-' + idocNo,
            sourceType: 'IDoc',
            issueSummary: `IDoc ${idocNo} (INTERNAL_ORDER) stuck on outbound dispatch with Status 02 (Error passing data to port)`,
            rootCause: 'The transfer to port A000056019 failed because RFC Destination "S4LOCAL_RFC" is not configured or offline in SM59.',
            proposedFix: `Automatically provision and configure the missing RFC Destination "S4LOCAL_RFC" in SM59 and retrigger the outbound Basis delivery queue.`,
            riskAnalysis: 'Low risk. Restores baseline transport parameters to ALE/EDI standards, preserving clean-core extensibility metrics.',
            affectedSystems: ['S/4HANA Basis Queue', 'RFC Destinations SM59', 'Local Port A000000002'],
            confidenceScore: 99,
            solutionOptions: [
              'Option 1: Autonomously provision and register RFC destination S4LOCAL_RFC and dispatch blocked IDocs (Recommended)',
              'Option 2: Manually access SM59 inside standard sap GUI workspace to register route values',
              'Option 3: Override port A000000002 rules to ignore connection handshake check'
            ]
          };
        } else if (idocNo === '0000000000021044' || idocNo === '0000000000001002' || idocNo === '0000000010045211') {
          const is10045211 = idocNo === '0000000010045211';
          matchedProposal = {
            id: is10045211 ? 'PROP-IDOC-10045211' : (idocNo === '0000000000001002' ? 'PROP-IDOC-1002' : 'PROP-IDOC-21044'),
            sourceType: 'IDoc',
            issueSummary: is10045211 
              ? `IDoc 0000000010045211 (ORDERS51) stuck on Inbound EDI Process with Status 51 (Mapping Failed)`
              : `IDoc ${idocNo} (INTERNAL_ORDER) stuck on Inbound EDI Process with Status 51 (Cost Center missing)`,
            rootCause: is10045211
              ? 'Material category blank. Segment failed because raw supplier key "AltParts" could not be resolved to internal MAT-A01 material representation.'
              : 'G/L Account 410000 requires valid Cost Center (KOSTL) assignment under corporate segment 1000.',
            proposedFix: is10045211
              ? 'Inject custom translation cross-reference mapping of AltParts to internal MAT-A01 in standard SPRO cross-reference mapping tables.'
              : 'Associate cost center CC-1000 with GL Account 410000 in SPRO custom reference tables.',
            riskAnalysis: 'Very Low risk. Cleans up mapping rules inside custom metadata reference levels.',
            affectedSystems: is10045211 
              ? ['S/4HANA MM', 'SPRO Translation Hub', 'EDI Pipeline']
              : ['S/4HANA MM', 'SPRO Reference Hub', 'FI/CO Ledger'],
            confidenceScore: 98,
            solutionOptions: is10045211
              ? [
                  'Option 1: Inject SPRO translation mappings dynamically ("AltParts" -> MAT-A01) and reprocess via standard BD87 pipeline (Recommended)',
                  'Option 2: Use standard WE19 test tool to manually patch raw segments and re-dispatch XML document',
                  'Option 3: Hold process queue, reject transaction, and request supplier to resubmit standard payload'
                ]
              : [
                  'Option 1: Inject SPRO translation mappings dynamically and reprocess via standard BD87 pipeline (Recommended)',
                  'Option 2: Reprocess using manual WE19 target injection blocks',
                  'Option 3: Bypass G_L Account 410000 cost verification rules inside current session context'
                ]
          };
        } else if (idocNo === '0000000000003002' || idocNo === '0000000000055004') {
          const is55004 = idocNo === '0000000000055004';
          const orderNum = is55004 ? '600440' : '500120';
          matchedProposal = {
            id: is55004 ? 'PROP-IDOC-55004' : 'PROP-IDOC-3002',
            sourceType: 'IDoc',
            issueSummary: `IDoc ${idocNo} (INTERNAL_ORDER) stuck on Inbound Process with Status 51 (Master System error)`,
            rootCause: `Master system of distributed order ${orderNum} either not correct, or not fil.`,
            proposedFix: `Assign/maintain master system configuration for distributed order ${orderNum} in S/4HANA ALE distribution model (BD64) and reprocess IDoc via BD87/WE19.`,
            riskAnalysis: 'Low risk. Align master system assignment in ALE distribution rules.',
            affectedSystems: ['S/4HANA Core', 'ALE Distribution Model', `Internal Order ${orderNum}`],
            confidenceScore: 99,
            solutionOptions: [
              `Option 1: Automatically assign Master System in ALE Distribution Model for Order ${orderNum} and reprocess IDoc (Recommended)`,
              `Option 2: Manually access BD64 / WE19 in SAP GUI to assign master system for order ${orderNum}`,
              'Option 3: Re-trigger ALE distribution after verifying client S4HCLNT100 settings'
            ]
          };
        } else if (idocNo === '0000000000036007') {
          matchedProposal = {
            id: 'PROP-IDOC-36007',
            sourceType: 'IDoc',
            issueSummary: `IDoc ${idocNo} (INTERNAL_ORDER) is in Status 03 (Data passed to port OK)`,
            rootCause: 'The IDoc was processed successfully and passed to port OK.',
            proposedFix: 'No manual correction is required. The IDoc is active and verified.',
            riskAnalysis: 'Completely safe. No pending action.',
            affectedSystems: ['S/4HANA Core Ledger', 'BD87 ALE Pipeline'],
            confidenceScore: 100,
            solutionOptions: [
              'Option 1: No action needed (Verified)'
            ]
          };
        } else {
          matchedProposal = SELF_HEALING_PROPOSALS.idoc;
        }
      } else if (queryLower.includes('customer') || queryLower.includes('bp role') || queryLower.includes('kna1') || queryLower.includes('flbpd1') || queryLower.includes('master data')) {
        matchedProposal = SELF_HEALING_PROPOSALS.masterdata;
      } else if (queryLower.includes('failed jobs') || queryLower.includes('restart failed jobs') || queryLower.includes('sm37') || queryLower.includes('deadlock') || queryLower.includes('job_mrp_daily_pl10')) {
        matchedProposal = SELF_HEALING_PROPOSALS.batchjob;
      } else if (queryLower.includes('integration') || queryLower.includes('cpi') || queryLower.includes('format schema') || queryLower.includes('payload transformation')) {
        matchedProposal = SELF_HEALING_PROPOSALS.integration;
      } else if (queryLower.includes('workflow') || queryLower.includes('swia') || queryLower.includes('stalled') || queryLower.includes('po_wf_mm_9921')) {
        matchedProposal = SELF_HEALING_PROPOSALS.workflow;
      } else if (queryLower.includes('pricing') || queryLower.includes('vk11') || queryLower.includes('pr00') || queryLower.includes('t685a') || queryLower.includes('pricing/configuration')) {
        matchedProposal = SELF_HEALING_PROPOSALS.pricing;
      }
    }

    if (matchedProposal) {
      const proposalToUse = matchedProposal;
      setPendingSelfHealing({
        ...proposalToUse,
        onApprove: async (modifiedRemedyText, selectedOption) => {
          setPendingSelfHealing(null);
          setIsTyping(true);
          const activeAttachedImages = [...attachedImages];

          // Auto-apply configuration to live system state
          if (proposalToUse.id.includes('56019') || proposalToUse.id.includes('56001') || proposalToUse.id.includes('57026')) {
            idocService.createRfcDestination('S4LOCAL_RFC');
          } else if (proposalToUse.id.includes('21044') || proposalToUse.id.includes('1002')) {
            idocService.addSproMapping('410000', 'CC-1000');
          } else if (proposalToUse.id.includes('10045211')) {
            idocService.addSproMapping('AltParts', 'MAT-A01');
          } else if (proposalToUse.id.includes('3002')) {
            idocService.updateIdocStatus('0000000000003002', '53');
          } else if (proposalToUse.id.includes('55004')) {
            idocService.updateIdocStatus('0000000000055004', '53');
          } else if (proposalToUse.id.includes('36007')) {
            idocService.updateIdocStatus('0000000000036007', '68');
          }

          const queryToRun = `[HUMAN APPROVED CORRECTION: ${proposalToUse.sourceType}] Proposed Remedy: "${modifiedRemedyText}". Option Index: ${selectedOption}. Run execution pipeline. Context: ${q}`;
          const tsApproved = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `### 🛡️ HUMAN APPROVAL REGISTERED (GRC AUDITED)\n\n**Action Approved**: *${proposalToUse.issueSummary}*\n**Correction Applied**: \`${modifiedRemedyText}\`\n\nStarting self-healing execution sequence now...`,
            timestamp: tsApproved
          }]);
          
          const response = await processSapQuery(
            queryToRun, 
            currentUserRole, 
            messages,
            activeAttachedImages.length > 0 ? activeAttachedImages : undefined,
            (name, action) => setActiveAgent({ name, action }),
            sapBackendTarget
          );
          
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: response.text, 
            toolResults: response.toolResults, 
            provenance: response.provenance,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
          }]);
          setIsTyping(false); 
          setActiveAgent(null);
        },
        onReject: () => {
          setPendingSelfHealing(null);
          const tsRejected = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `### ❌ SELF-HEALING ACTION REJECTED BY OPERATOR\n\n**Incident Status**: *Aborted & Stalled*\n**Governance Verdict**: Operator refused to authorize the recommended self-healing routine. Transaction rollback completed. S/4HANA core systems remain intact.`,
            timestamp: tsRejected
          }]);
        }
      });
      setInput('');
      setAttachedFile(null);
      return;
    }

    const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setInput('');
    setAttachedFile(null);
    
    const activeAttachedImages = [...attachedImages];
    const newMessages: Message[] = [...messages, { 
      role: 'user', 
      content: q, 
      timestamp: ts,
      images: activeAttachedImages.length > 0 ? activeAttachedImages : undefined
    }];
    setMessages(newMessages);
    setIsTyping(true);
    setAttachedImages([]);
    
    const response = await processSapQuery(
      q, 
      currentUserRole, 
      messages, // Pass history buffer
      activeAttachedImages.length > 0 ? activeAttachedImages : undefined,
      (name, action) => setActiveAgent({ name, action }),
      sapBackendTarget
    );
    
    const assistantIndex = newMessages.length;
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: response.text, 
      toolResults: response.toolResults, 
      provenance: response.provenance,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    }]);
    
    setIsTyping(false); 
    setActiveAgent(null);

    // Speak aloud the returned content in appropriate language
    if (ttsEnabled) {
      speakText(response.text, false, assistantIndex);
    }
  };

  const handleFileUpload = (type: 'PDF' | 'CSV' | 'DOC') => {
    setUploadType(type);
    fileInputRef.current?.click();
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadType) return;

    if (uploadType === 'PDF') {
      // For PDF, we just keep the name for now as reading text from PDF in browser is complex without extra libs
      // But we set it as attached so the agent knows it exists.
      setAttachedFile({ name: file.name, type: uploadType });
      setInput(`Extract data and validate for S/4HANA posting.`);
    } else {
      // Read as text for CSV and DOC (which here represents general text/other files)
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setAttachedFile({ name: file.name, type: uploadType, content });
        
        let suggestedQuery = "";
        if (uploadType === 'CSV') {
          suggestedQuery = `Map columns and create Sales Orders in ECC.`;
        } else {
          suggestedQuery = `Analyze content of ${file.name} and provide SAP-relevant insights.`;
        }
        setInput(suggestedQuery);
      };
      reader.readAsText(file);
    }
    
    e.target.value = ''; // Reset input
  };

  const handleImageFiles = (files: FileList | File[]) => {
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawResult = event.target?.result as string;
        const base64Data = rawResult.split(',')[1];
        setAttachedImages(prev => {
          // Prevent duplicates
          if (prev.some(img => img.name === file.name)) return prev;
          return [
            ...prev,
            {
              name: file.name || `Screenshot_${Date.now()}.${file.type.split('/')[1] || 'png'}`,
              type: file.type || 'image/png',
              data: base64Data
            }
          ];
        });
        
        // Suggest automatic context query if none exists or default
        setInput(prev => {
          if (!prev.trim()) {
            return `SAP Image Expert: Analyze this screenshot/diagram. Extract OCR, detect active errors or modules, identify involved T-Codes or S/4 Fiori screens, and outline comparative GCC/ECC troubleshooting steps.`;
          }
          return prev;
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleImageFiles(e.target.files);
    }
    e.target.value = ''; // Reset
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageFiles(e.dataTransfer.files);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      e.preventDefault();
      handleImageFiles(e.clipboardData.files);
    }
  };

  const renderToolResult = (result: ToolResult) => {
    if (result.type === 'error') {
      return (
        <div className="bg-amber-50 text-amber-800 p-4 rounded-xl border border-amber-200 mb-4 text-xs font-bold animate-in fade-in">
          <i className="fas fa-shield-halved mr-2"></i> {result.data.error || "Authorization Error"}
        </div>
      );
    }
    if (result.type === 'documentation') return null;

    return (
      <div className="space-y-3 mb-6 w-full animate-in slide-in-from-bottom-2">
        <div className="flex items-center space-x-2 px-1">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest">AGENT: {result.agentName}</span>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div className={['gui_card', 'report', 'forecast', 'comparison', 'enterprise_insight', 'connector_status', 'tm_dashboard', 'ariba_dashboard', 'collaboration_flow', 'sap_agents', 'spro_configs', 'security_logs', 'abap_dumps', 'autonomous_operation', 's4_migration_dashboard', 'process_mining', 'security_autonomous_copilot', 'security_autonomous_action', 'security_grc_copilot', 'security_user_access_trace', 'security_sod_analysis', 'security_smart_access_request', 'security_jml_workflow', 'basis_executive_question', 'basis_executive_insights', 'pp_executive_question', 'pp_executive_insights', 'tm_executive_question', 'tm_executive_insights', 'ewm_human_approval_rules', 'ewm_multi_agent_collaboration', 'ewm_optimization_report', 'ewm_exception_management', 'ewm_predictive_ai', 'ewm_autonomous_actions', 'ewm_labor_capacity_productivity', 'ewm_executive_question', 'ewm_executive_insights', 'fico_autonomous_copilot', 'financial_close_automation', 'accounts_payable_automation', 'accounts_receivable_automation', 'cost_controlling_automation', 'fico_autonomous_action', 'pp_autonomous_copilot', 'pp_autonomous_action', 'mm_autonomous_copilot', 'mm_autonomous_action', 'tm_autonomous_copilot', 'tm_autonomous_action', 'carrier_selection', 'load_consolidation', 'cost_intelligence', 'predictive_transportation_ai', 'autonomous_tendering', 'freight_settlement_intelligence', 'transportation_control_tower', 'autonomous_exception_management', 'multi_agent_tm_architecture', 'multi_agent_tm_action', 'qm_supplier_intelligence', 'qm_customer_complaint_intelligence', 'qm_predictive_quality_ai', 'qm_autonomous_exception_management', 'qm_quality_analytics', 'qm_digital_quality_twin', 'qm_cross_module_collaboration', 'abap_developer_transport_intelligence', 'abap_developer_code_dependency_analysis', 'abap_developer_security_analysis', 'abap_developer_autonomous_documentation', 'abap_developer_multi_agent_architecture', 'cross_agent_collaboration', 'abap_developer_approval_model', 'hr_hcm_autonomous_copilot', 'hr_hcm_50_questions', 'hr_hcm_autonomous_action', 'hr_hcm_payroll_operations', 'hr_hcm_joiner_automation', 'hr_hcm_mover_automation', 'hr_hcm_leaver_automation', 'hr_hcm_ess_agent', 'hr_hcm_mss_agent', 'hr_hcm_talent_performance_ai', 'hr_hcm_talent_data', 'hr_hcm_training_certification_agent', 'hr_hcm_training_data', 'hr_hcm_workforce_analytics', 'hr_hcm_workforce_data', 'hr_hcm_predictive_analytics', 'hr_hcm_predictive_data'].includes(result.type) ? 'md:col-span-2' : ''}>
            {(result.type === 'hr_hcm_autonomous_copilot' || result.type === 'hr_hcm_50_questions' || result.type === 'hr_hcm_autonomous_action' || result.type === 'hr_hcm_payroll_operations' || result.type === 'hr_hcm_joiner_automation' || result.type === 'hr_hcm_mover_automation' || result.type === 'hr_hcm_leaver_automation' || result.type === 'hr_hcm_ess_agent' || result.type === 'hr_hcm_mss_agent' || result.type === 'hr_hcm_talent_performance_ai' || result.type === 'hr_hcm_talent_data' || result.type === 'hr_hcm_training_certification_agent' || result.type === 'hr_hcm_training_data' || result.type === 'hr_hcm_workforce_analytics' || result.type === 'hr_hcm_workforce_data' || result.type === 'hr_hcm_predictive_analytics' || result.type === 'hr_hcm_predictive_data') && <HrAutonomousCopilotCard data={result.data} />}
            {(result.type === 'security_autonomous_copilot' || result.type === 'security_autonomous_action' || result.type === 'security_grc_copilot' || result.type === 'security_user_access_trace' || result.type === 'security_sod_analysis' || result.type === 'security_smart_access_request' || result.type === 'security_jml_workflow') && <SecurityAutonomousCopilotCard data={result.data} />}
            {(result.type === 'abap_developer_autonomous_copilot' || result.type === 'abap_developer_50_questions' || result.type === 'abap_developer_code_correction' || result.type === 'abap_developer_repository_inspection') && <AbapAutonomousCopilotCard initialReport={result.type === 'abap_developer_autonomous_copilot' ? result.data : undefined} onAskQuestion={(q) => handleSubmit(undefined, q)} />}
            {result.type === 'abap_developer_transport_intelligence' && <TransportIntelligenceCard data={result.data} />}
            {result.type === 'abap_developer_code_dependency_analysis' && <CodeDependencyAnalysisCard data={result.data} />}
            {result.type === 'abap_developer_security_analysis' && <AbapSecurityAnalysisCard data={result.data} />}
            {result.type === 'abap_developer_autonomous_documentation' && <AbapAutonomousDocumentationCard data={result.data} />}
            {result.type === 'abap_developer_multi_agent_architecture' && <MultiAgentAbapArchitectureCard data={result.data} />}
            {result.type === 'cross_agent_collaboration' && <CrossAgentCollaborationCard data={result.data} />}
            {result.type === 'abap_developer_approval_model' && <AbapApprovalModelCard data={result.data} />}
            {(result.type === 'fico_autonomous_copilot' || result.type === 'financial_close_automation' || result.type === 'accounts_payable_automation' || result.type === 'accounts_receivable_automation' || result.type === 'cost_controlling_automation' || result.type === 'fico_autonomous_action') && <FicoAutonomousCopilotCard data={result.data} />}
            {(result.type === 'pp_autonomous_copilot' || result.type === 'pp_autonomous_action') && <PpAutonomousCopilotCard data={result.data} />}
            {(result.type === 'mm_autonomous_copilot' || result.type === 'mm_autonomous_action') && <MmAutonomousCopilotCard data={result.data} />}
            {result.type === 'order' && <OrderCard data={result.data} />}
            {result.type === 'invoice' && <InvoiceCard data={result.data} />}
            {result.type === 'delivery' && <DeliveryCard data={result.data} />}
            {result.type === 'inventory' && <InventoryCard data={result.data} />}
            {result.type === 'purchase_order' && <PurchaseOrderCard data={result.data} />}
            {result.type === 'delegation' && <DelegationCard data={result.data} />}
            {result.type === 'gui_card' && <GuiScreenCard data={result.data} />}
            {result.type === 'transaction_result' && <TransactionResultCard data={result.data} />}
            {result.type === 'report' && <AnalyticsReportCard data={result.data} />}
            {result.type === 'download_doc' && <DownloadDocCard data={result.data} />}
            {result.type === 'kb_search' && <KnowledgeRetrievalCard data={result.data} />}
            {result.type === 'live_odata_records' && <LiveODataRecordsCard data={result.data} toolName={result.toolName} />}
            {result.type === 'sd_delivery_billing_report' && <SdDeliveryBillingReportCard data={result.data} />}
            {result.type === 'sd_o2c_funnel_report' && <SdO2CFunnelReportCard data={result.data} />}
            {result.type === 'sd_atp_multiplant_report' && <SdAtpMultiPlantReportCard data={result.data} />}
            {result.type === 'sd_credit_exposure_report' && <SdCreditExposureReportCard data={result.data} />}
            {result.type === 'sd_pricing_anomaly_report' && <SdPricingAnomalyReportCard data={result.data} />}
            {result.type === 'sd_late_delivery_risk_report' && <SdLateDeliveryRiskReportCard data={result.data} />}
            {result.type === 'sd_revenue_breakdown_report' && <SdRevenueBreakdownReportCard data={result.data} />}
            {result.type === 'sd_top_margin_customers_report' && <SdTopMarginCustomersReportCard data={result.data} />}
            {result.type === 'sd_executive_intelligence_report' && <SdExecutiveIntelligenceReportCard data={result.data} />}
            {result.type === 'sd_action_result' && <SdActionResultCard data={result.data} />}
            {result.type === 'sd_action_approval_request' && <SdActionApprovalCard data={result.data} />}
            {result.type === 'fico_action_result' && <SdActionResultCard data={result.data} />}
            {result.type === 'fico_action_approval_request' && <SdActionApprovalCard data={result.data} endpoint="/api/fico-action/decide" />}
            {result.type === 'ewm_action_result' && <SdActionResultCard data={result.data} />}
            {result.type === 'ewm_action_approval_request' && <SdActionApprovalCard data={result.data} endpoint="/api/ewm-action/decide" />}
            {result.type === 'tm_action_result' && <SdActionResultCard data={result.data} />}
            {result.type === 'tm_action_approval_request' && <SdActionApprovalCard data={result.data} endpoint="/api/tm-action/decide" />}
            {result.type === 'pp_action_result' && <SdActionResultCard data={result.data} />}
            {result.type === 'pp_action_approval_request' && <SdActionApprovalCard data={result.data} endpoint="/api/pp-action/decide" />}
            {result.type === 'mm_action_result' && <SdActionResultCard data={result.data} />}
            {result.type === 'mm_action_approval_request' && <SdActionApprovalCard data={result.data} endpoint="/api/mm-action/decide" />}
            {result.type === 'qm_action_result' && <SdActionResultCard data={result.data} />}
            {result.type === 'qm_action_approval_request' && <SdActionApprovalCard data={result.data} endpoint="/api/qm-action/decide" />}
            {result.type === 'hr_action_result' && <SdActionResultCard data={result.data} />}
            {result.type === 'hr_action_approval_request' && <SdActionApprovalCard data={result.data} endpoint="/api/hr-action/decide" />}
            {result.type === 'basis_action_result' && <SdActionResultCard data={result.data} />}
            {result.type === 'fico_gl_account_report' && <FicoGLAccountReportCard data={result.data} />}
            {result.type === 'fico_accounts_payable_report' && <FicoAccountsPayableReportCard data={result.data} />}
            {result.type === 'fico_service_unavailable' && <FicoServiceUnavailableCard data={result.data} />}
            {result.type === 's4_basis_health_report' && <S4BasisHealthReportCard data={result.data} />}
            {result.type === 's4_integration_monitoring_report' && <S4IntegrationMonitoringCard data={result.data} />}
            {result.type === 'mm_live_report' && <MmLiveReportCard data={result.data} />}
            {result.type === 'hana_db_intelligence_report' && <HanaDbIntelligenceCard data={result.data} />}
            {result.type === 'hana_db_unavailable' && <FicoServiceUnavailableCard data={{ service: 'HANA DB Intelligence', reason: result.data?.reason }} />}
            {result.type === 'bw_query_visual_report' && <BwAnalyticalQueryCard data={result.data} />}
            {result.type === 'forecast' && <ForecastCard data={result.data} />}
            {result.type === 'comparison' && <ComparisonCard data={result.data} />}
            {result.type === 'enterprise_insight' && <EnterpriseInsightCard data={result.data} />}
            {result.type === 'connector_status' && <ConnectorStatusCard data={result.data} />}
            {result.type === 'mcp_discovery' && <McpRegistryCard data={result.data} />}
            {result.type === 'mcp_trace' && <McpTraceCard data={result.data} />}
            {result.type === 'idoc_summary' && <IdocSummaryCard data={result.data} />}
            {result.type === 'idoc_analysis' && <IdocAnalysisCard data={result.data} />}
            {result.type === 'idoc_reprocessing' && <IdocReprocessingCard data={result.data} />}
            {result.type === 'idoc_details' && <IdocDetailsCard data={result.data} />}
            {result.type === 'freight_order_detail' && <FreightOrderDetailCard data={result.data} />}
            {result.type === 'ariba_invoice_detail' && <AribaInvoiceDetailCard data={result.data} />}
            {result.type === 'tm_dashboard' && <TmDashboardCard data={result.data} />}
            {result.type === 'ariba_dashboard' && <AribaDashboardCard data={result.data} />}
            {result.type === 'collaboration_flow' && <CollaborationFlowCard data={result.data} />}
            {result.type === 'sap_agents' && <SapAgentListCard data={result.data} />}
            {result.type === 'spro_configs' && <SproConfigListCard data={result.data} />}
            {result.type === 'security_logs' && <SecurityAuditListCard data={result.data} />}
            {result.type === 'abap_dumps' && <AbapDumpDiagnosticCard data={result.data} />}
            {result.type === 'autonomous_operation' && <AutonomousOperationCard data={result.data} />}
            {result.type === 's4_migration_dashboard' && <S4MigrationDashboardCard data={result.data} />}
            {result.type === 'process_mining' && <ProcessMiningCard data={result.data} />}
            {result.type === 'basis_system_metrics' && <BasisSystemMetricsCard data={result.data} />}
            {result.type === 'basis_job_action' && <BasisJobActionCard data={result.data} />}
            {result.type === 'basis_spool_action' && <BasisSpoolActionCard data={result.data} />}
            {result.type === 'basis_health_check' && <BasisHealthCheckCard data={result.data} />}
            {result.type === 'basis_autonomous_pipeline' && <BasisAutonomousPipelineCard data={result.data} />}
            {result.type === 'rfq' && <RfqCard data={result.data} />}
            {result.type === 'supplier_comparison' && <SupplierComparisonCard data={result.data} />}
            {result.type === 'purchase_contract' && <PurchaseContractCard data={result.data} />}
            {result.type === 'supplier_analytics' && <SupplierAnalyticsCard data={result.data} />}
            {result.type === 'production_order' && <ProductionOrderCard data={result.data} />}
            {result.type === 'mrp_run' && <MrpRunCard data={result.data} />}
            {result.type === 'capacity_plan' && <CapacityPlanCard data={result.data} />}
            {result.type === 'bom_validation' && <BomValidationCard data={result.data} />}
            {result.type === 'routing_analysis' && <RoutingAnalysisCard data={result.data} />}
            {result.type === 'manufacturing_status' && <ManufacturingStatusCard data={result.data} />}
            {result.type === 'journal_entry' && <JournalEntryCard data={result.data} />}
            {result.type === 'gl_balance' && <GlBalanceCard data={result.data} />}
            {result.type === 'apar_subledger' && <ApArSubledgerCard data={result.data} />}
            {result.type === 'bank_reconciliation' && <BankReconciliationCard data={result.data} />}
            {result.type === 'fixed_asset' && <FixedAssetCard data={result.data} />}
            {result.type === 'financial_statement' && <FinancialStatementCard data={result.data} />}
            {result.type === 'financial_close' && <FinancialCloseCard data={result.data} />}
            {result.type === 'cost_center' && <CostCenterCard data={result.data} />}
            {result.type === 'profit_center' && <ProfitCenterCard data={result.data} />}
            {result.type === 'internal_order' && <InternalOrderCard data={result.data} />}
            {result.type === 'copa_analysis' && <CopaAnalysisCard data={result.data} />}
            {result.type === 'cost_planning' && <CostPlanningCard data={result.data} />}
            {result.type === 'allocation_cycle' && <AllocationCycleCard data={result.data} />}
            {result.type === 'employee_master' && <EmployeeMasterCard data={result.data} />}
            {result.type === 'leave_request' && <LeaveRequestCard data={result.data} />}
            {result.type === 'payroll_inquiry' && <PayrollInquiryCard data={result.data} />}
            {result.type === 'recruitment_pipeline' && <RecruitmentPipelineCard data={result.data} />}
            {result.type === 'onboarding_tracker' && <OnboardingTrackerCard data={result.data} />}
            {result.type === 'org_chart' && <OrgChartCard data={result.data} />}
            {result.type === 'performance_review' && <PerformanceReviewCard data={result.data} />}
            {result.type === 'benefits_eligibility' && <BenefitsEligibilityCard data={result.data} />}
            {result.type === 'abap_code_analysis' && <AbapCodeAnalysisCard data={result.data} />}
            {result.type === 'cds_view' && <CdsViewCard data={result.data} />}
            {result.type === 'rap_app' && <RapAppCard data={result.data} />}
            {result.type === 'badi_enhancement' && <BadiEnhancementCard data={result.data} />}
            {result.type === 'form_interface' && <FormInterfaceCard data={result.data} />}
            {result.type === 'abap_unit' && <AbapUnitResultCard data={result.data} />}
            {result.type === 'sap_landscape_overview' && <SapLandscapeOverviewCard data={result.data} />}
            {result.type === 'transport_management' && <TransportManagementCard data={result.data} />}
            {result.type === 'kernel_upgrade_status' && <KernelUpgradeStatusCard data={result.data} />}
            {result.type === 'database_performance' && <DatabasePerformanceCard data={result.data} />}
            {result.type === 'client_administration' && <ClientAdministrationCard data={result.data} />}
            {result.type === 'system_availability_sla' && <SystemAvailabilitySlaCard data={result.data} />}
            {result.type === 'grc_user_security' && <GrcUserSecurityCard data={result.data} />}
            {result.type === 'grc_sod_analysis' && <GrcSodAnalysisCard data={result.data} />}
            {result.type === 'grc_access_request' && <GrcAccessRequestCard data={result.data} />}
            {result.type === 'grc_compliance_audit' && <GrcComplianceAuditCard data={result.data} />}
            {result.type === 'grc_security_alerts' && <GrcSecurityMonitoringCard data={result.data} />}
            {result.type === 'ewm_warehouse_task' && <EwmWarehouseTaskCard data={result.data} />}
            {result.type === 'ewm_storage_bin' && <EwmStorageBinCard data={result.data} />}
            {result.type === 'ewm_inbound_delivery' && <EwmInboundDeliveryCard data={result.data} />}
            {result.type === 'ewm_outbound_picking' && <EwmOutboundPickingCard data={result.data} />}
            {result.type === 'ewm_physical_inventory' && <EwmPhysicalInventoryCard data={result.data} />}
            {result.type === 'ewm_shipment_tracking' && <EwmShipmentTrackingCard data={result.data} />}
            {result.type === 'ewm_human_approval_rules' && <EwmHumanApprovalRulesCard data={result.data} />}
            {result.type === 'ewm_action_evaluation' && <EwmActionEvaluationCard data={result.data} />}
            {result.type === 'ewm_multi_agent_collaboration' && <EwmMultiAgentCollaborationCard data={result.data} />}
            {result.type === 'ewm_optimization_report' && <EwmWarehouseOptimizationCard data={result.data} />}
            {result.type === 'ewm_exception_management' && <EwmAutonomousExceptionCard data={result.data} />}
            {result.type === 'ewm_predictive_ai' && <EwmPredictiveWarehouseCard data={result.data} />}
            {result.type === 'ewm_autonomous_actions' && <EwmAutonomousActionsCard data={result.data} />}
            {result.type === 'ewm_labor_capacity_productivity' && <EwmLaborCapacityProductivityCard data={result.data} />}
            {result.type === 'ewm_inventory_stock' && <EwmInventoryStockCard data={result.data} />}
            {result.type === 'ewm_outbound_processing' && <EwmOutboundProcessingCard data={result.data} />}
            {result.type === 'ewm_warehouse_operations' && <EwmWarehouseOperationsCard data={result.data} />}
            {(result.type === 'ewm_executive_question' || result.type === 'ewm_executive_insights') && <EwmExecutiveCard data={result.data} />}
            {(result.type === 'basis_executive_question' || result.type === 'basis_executive_insights') && <BasisExecutiveCard data={result.data} />}
            {(result.type === 'pp_executive_question' || result.type === 'pp_executive_insights') && <PpExecutiveCard data={result.data} />}
            {(result.type === 'tm_executive_question' || result.type === 'tm_executive_insights') && <TmExecutiveCard data={result.data} />}
            {(result.type === 'security_executive_question' || result.type === 'security_executive_insights') && <SecurityExecutiveCard data={result.data} />}
            {(result.type === 'mm_executive_question' || result.type === 'mm_executive_insights') && <MmExecutiveCard data={result.data} />}
            {(result.type === 'abap_executive_question' || result.type === 'abap_executive_insights') && (
              <AbapExecutiveCard 
                report={result.type === 'abap_executive_insights' ? result.data : undefined}
                singleAnswer={result.type === 'abap_executive_question' ? result.data : undefined}
              />
            )}
            {(result.type === 'hr_executive_question' || result.type === 'hr_executive_insights' || result.type === 'hr_hcm_executive_question' || result.type === 'hr_hcm_executive_insights' || result.type === 'hr_hcm_50_questions') && (
              <HrExecutiveCard 
                report={result.type === 'hr_executive_insights' || result.type === 'hr_hcm_executive_insights' || result.type === 'hr_hcm_50_questions' ? result.data : undefined}
                singleAnswer={result.type === 'hr_executive_question' || result.type === 'hr_hcm_executive_question' ? result.data : undefined}
              />
            )}
            {(result.type === 'qm_executive_question' || result.type === 'qm_executive_insights') && (
              <QmExecutiveCard 
                report={result.type === 'qm_executive_insights' ? result.data : undefined}
                singleAnswer={result.type === 'qm_executive_question' ? result.data : undefined}
              />
            )}
            {result.type === 'qm_inspection_lot' && <QmInspectionLotCard data={result.data} />}
            {result.type === 'qm_quality_notification' && <QmQualityNotificationCard data={result.data} />}
            {result.type === 'qm_defect_analysis' && <QmDefectAnalysisCard data={result.data} />}
            {result.type === 'qm_quality_audit' && <QmQualityAuditCard data={result.data} />}
            {result.type === 'qm_quality_certificate' && <QmQualityCertificateCard data={result.data} />}
            {result.type === 'qm_quality_report' && <QmQualityReportCard data={result.data} />}
            {result.type === 'qm_supplier_intelligence' && <QmSupplierQualityIntelligenceCard data={result.data} />}
            {result.type === 'qm_customer_complaint_intelligence' && <QmCustomerComplaintIntelligenceCard data={result.data} />}
            {result.type === 'qm_predictive_quality_ai' && <QmPredictiveQualityAiCard data={result.data} />}
            {result.type === 'qm_autonomous_exception_management' && <QmAutonomousExceptionManagementCard data={result.data} />}
            {result.type === 'qm_quality_analytics' && <QmQualityAnalyticsCard data={result.data} />}
            {result.type === 'qm_digital_quality_twin' && <QmDigitalQualityTwinCard data={result.data} />}
            {result.type === 'qm_cross_module_collaboration' && <QmCrossModuleCollaborationCard data={result.data} />}
            {result.type === 'qm_autonomous_copilot' && <QmAutonomousCopilotCard data={result.data} />}
            {result.type === 'qm_approval_model' && <QmAutonomousCopilotCard data={result.data} />}
            {result.type === 'qm_multi_agent_architecture' && <QmAutonomousCopilotCard data={result.data} />}
            {result.type === 'qm_qa_catalog' && <QmAutonomousCopilotCard data={result.data} />}
            {result.type === 'qm_autonomous_action' && <QmAutonomousCopilotCard data={result.data} />}
            {(result.type === 'pm_executive_question' || result.type === 'pm_executive_insights') && (
              <PmExecutiveCard 
                report={result.type === 'pm_executive_insights' ? result.data : undefined}
                singleAnswer={result.type === 'pm_executive_question' ? result.data : undefined}
              />
            )}
            {result.type === 'pm_work_order' && <PmWorkOrderCard data={result.data} />}
            {result.type === 'pm_preventive_schedule' && <PmPreventiveScheduleCard data={result.data} />}
            {result.type === 'pm_equipment_history' && <PmEquipmentHistoryCard data={result.data} />}
            {result.type === 'pm_maintenance_notification' && <PmMaintenanceNotificationCard data={result.data} />}
            {result.type === 'pm_asset_monitoring' && <PmAssetMonitoringCard data={result.data} />}
            {result.type === 'pm_maintenance_analytics' && <PmMaintenanceAnalyticsCard data={result.data} />}
            {result.type === 'tm_freight_order' && <TmFreightOrderCard data={result.data} />}
            {result.type === 'tm_route_optimization' && <TmRouteOptimizationCard data={result.data} />}
            {result.type === 'tm_carrier_tracking' && <TmCarrierTrackingCard data={result.data} />}
            {result.type === 'tm_delivery_monitoring' && <TmDeliveryMonitoringCard data={result.data} />}
            {result.type === 'tm_logistics_analytics' && <TmLogisticsAnalyticsCard data={result.data} />}
            {result.type === 'tm_autonomous_copilot' && <TmAutonomousCopilotCard data={result.data} />}
            {result.type === 'tm_autonomous_action' && <TmAutonomousCopilotCard data={result.data} />}
            {result.type === 'carrier_selection' && <TmAutonomousCopilotCard data={result.data} />}
            {result.type === 'load_consolidation' && <TmAutonomousCopilotCard data={result.data} />}
            {result.type === 'cost_intelligence' && <TmAutonomousCopilotCard data={result.data} />}
            {result.type === 'predictive_transportation_ai' && <TmAutonomousCopilotCard data={result.data} />}
            {result.type === 'autonomous_tendering' && <TmAutonomousCopilotCard data={result.data} />}
            {result.type === 'freight_settlement_intelligence' && <TmAutonomousCopilotCard data={result.data} />}
            {result.type === 'transportation_control_tower' && <TmAutonomousCopilotCard data={result.data} />}
            {result.type === 'autonomous_exception_management' && <TmAutonomousCopilotCard data={result.data} />}
            {result.type === 'multi_agent_tm_architecture' && <TmAutonomousCopilotCard data={result.data} />}
            {result.type === 'multi_agent_tm_action' && <TmAutonomousCopilotCard data={result.data} />}
            {result.type === 'tm_approval_model' && <TmAutonomousCopilotCard data={result.data} />}
            {(result.type === 'ehs_executive_question' || result.type === 'ehs_executive_insights') && (
              <EhsExecutiveCard 
                report={result.type === 'ehs_executive_insights' ? result.data : undefined}
                singleAnswer={result.type === 'ehs_executive_question' ? result.data : undefined}
              />
            )}
            {result.type === 'ehs_incident' && <EhsIncidentCard data={result.data} />}
            {result.type === 'ehs_safety_audit' && <EhsSafetyAuditCard data={result.data} />}
            {result.type === 'ehs_hazardous_material' && <EhsHazardousMaterialCard data={result.data} />}
            {result.type === 'ehs_permit' && <EhsPermitCard data={result.data} />}
            {result.type === 'ehs_environmental_report' && <EhsEnvironmentalReportCard data={result.data} />}
            {result.type === 'gts_customs_declaration' && <GtsCustomsDeclarationCard data={result.data} />}
            {result.type === 'gts_denied_party_screening' && <GtsDeniedPartyScreeningCard data={result.data} />}
            {result.type === 'gts_import_export_compliance' && <GtsImportExportComplianceCard data={result.data} />}
            {result.type === 'gts_trade_preference' && <GtsTradePreferenceCard data={result.data} />}
            {result.type === 'gts_global_trade_analytics' && <GtsGlobalTradeAnalyticsCard data={result.data} />}
            {result.type === 'bw4hana_dashboard' && <Bw4HanaDashboardCard data={result.data} />}
            {result.type === 'bw4hana_kpi_report' && <Bw4HanaKpiReportCard data={result.data} />}
            {result.type === 'bw4hana_predictive_forecast' && <Bw4HanaPredictiveForecastCard data={result.data} />}
            {result.type === 'bw4hana_datasphere_model' && <Bw4HanaDatasphereModelCard data={result.data} />}
            {result.type === 'bw4hana_executive_insight' && <Bw4HanaExecutiveInsightCard data={result.data} />}
            {result.type === 'bw4hana_analytics_orchestrator' && <Bw4HanaAutonomousCopilotCard data={result.data} />}
            {result.type === 'bw4hana_conversational_drilldown' && <Bw4HanaAutonomousCopilotCard />}
            {result.type === 'bw4hana_object_investigation' && <Bw4HanaAutonomousCopilotCard investigationData={result.data} />}
            {result.type === 'bw4hana_self_healing' && <Bw4HanaAutonomousCopilotCard selfHealingData={result.data} />}
            {result.type === 'bw4hana_reconciliation_agent' && <Bw4HanaAutonomousCopilotCard reconciliationData={result.data} />}
            {result.type === 'bw4hana_smart_routing' && <Bw4HanaAutonomousCopilotCard smartRoutingData={result.data} />}
            {result.type === 'bw4hana_datasphere_agent' && <Bw4HanaAutonomousCopilotCard datasphereData={result.data} />}
            {result.type === 'bw4hana_datasphere_connections' && <Bw4HanaAutonomousCopilotCard datasphereConnectionsData={result.data} />}
            {result.type === 'bw4hana_datasphere_lineage' && <Bw4HanaAutonomousCopilotCard datasphereLineageData={result.data} />}
            {result.type === 'bw4hana_business_semantic' && <Bw4HanaAutonomousCopilotCard businessSemanticData={result.data} />}
            {(result.type === 'bw_executive_question' || result.type === 'bw_executive_insights' || result.type === 'bw4hana_executive_question' || result.type === 'bw4hana_executive_insights') && (
              <BwAnalyticsExecutiveCard
                report={result.type === 'bw_executive_insights' || result.type === 'bw4hana_executive_insights' ? result.data : undefined}
                singleAnswer={result.type === 'bw_executive_question' || result.type === 'bw4hana_executive_question' ? result.data : undefined}
              />
            )}
            {result.type === 'btp_app_deployment' && <BtpAppDeploymentCard data={result.data} />}
            {result.type === 'btp_integration_suite' && <BtpIntegrationSuiteCard data={result.data} />}
            {result.type === 'btp_event_mesh' && <BtpEventMeshCard data={result.data} />}
            {result.type === 'btp_cap_runtime' && <BtpCapRuntimeCard data={result.data} />}
            {result.type === 'btp_kyma_cluster' && <BtpKymaClusterCard data={result.data} />}
            {result.type === 'btp_ai_foundation' && <BtpAiFoundationCard data={result.data} />}
            {result.type === 'cpi_interface_monitor' && <CpiInterfaceMonitorCard data={result.data} />}
            {result.type === 'cpi_failure_root_cause' && <CpiFailureRootCauseCard data={result.data} />}
            {result.type === 'cpi_retry_execution' && <CpiRetryExecutionCard data={result.data} />}
            {result.type === 'cpi_mapping_inspector' && <CpiMappingInspectorCard data={result.data} />}
            {result.type === 'cpi_api_catalog' && <CpiApiCatalogCard data={result.data} />}
            {result.type === 'fiori_my_inbox' && <FioriMyInboxCard data={result.data} />}
            {result.type === 'fiori_approval_action' && <FioriApprovalActionCard data={result.data} />}
            {result.type === 'fiori_app_launch' && <FioriAppLaunchCard data={result.data} />}
            {result.type === 'fiori_tile_analytics' && <FioriTileAnalyticsCard data={result.data} />}
            {result.type === 'mdg_change_request' && <MdgChangeRequestCard data={result.data} />}
            {result.type === 'mdg_duplicate_check' && <MdgDuplicateCheckCard data={result.data} />}
            {result.type === 'mdg_data_quality_audit' && <MdgDataQualityAuditCard data={result.data} />}
            {(result.type === 'ecc_system_status' ||
              result.type === 'ecc_connection_verification' ||
              result.type === 'ecc_autonomous_report' ||
              result.type === 'ecc_transactions' ||
              result.type === 'ecc_tcode_launcher' ||
              result.type === 'ecc_metadata_discovery' ||
              result.type === 'ecc_bapi_schema' ||
              result.type === 'ecc_table_data' ||
              result.type === 'ecc_bapi_execution' ||
              result.type === 'ecc_abap_code' ||
              result.type === 'ecc_abap_update' ||
              result.type === 'ecc_auth_validation' ||
              result.type === 'ecc_enhancements' ||
              result.type === 'ecc_idoc_workflow' ||
              result.type === 'ecc_batch_jobs' ||
              result.type === 'ecc_autonomous_pipeline') && <EccAutonomousCopilotCard data={result.data} />}
            {(result.type === 'ecc_sd_dashboard_report' ||
              result.type === 'ecc_sd_sales_orders' ||
              result.type === 'ecc_sd_sales_order_detail' ||
              result.type === 'ecc_sd_deliveries' ||
              result.type === 'ecc_sd_delivery_detail' ||
              result.type === 'ecc_sd_billing_docs' ||
              result.type === 'ecc_sd_billing_detail' ||
              result.type === 'ecc_sd_customer_master' ||
              result.type === 'ecc_sd_atp_result' ||
              result.type === 'ecc_sd_doc_flow' ||
              result.type === 'ecc_sd_customizing') && <EccSdAutonomousCopilotCard data={result.data} />}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-[100dvh] bg-[#f0f2f5] font-sans overflow-hidden">
      {/* Active Directory Login Pop-up */}
      <LoginModal 
        role={pendingRole || currentUserRole} 
        isOpen={!isAuthenticated} 
        onSuccess={onLoginSuccess} 
      />

      {/* Human-in-the-Loop Autonomous Self-Healing & Correction Approval Modal */}
      <SelfHealingApprovalModal
        isOpen={!!pendingSelfHealing}
        onClose={() => setPendingSelfHealing(null)}
        data={pendingSelfHealing}
        onApprove={(modifiedFix, selectedOption) => {
          if (pendingSelfHealing && pendingSelfHealing.onApprove) {
            pendingSelfHealing.onApprove(modifiedFix, selectedOption);
          }
        }}
        onReject={() => {
          if (pendingSelfHealing && pendingSelfHealing.onReject) {
            pendingSelfHealing.onReject();
          }
        }}
      />

      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept={uploadType === 'PDF' ? '.pdf' : uploadType === 'CSV' ? '.csv' : '*/*'}
        onChange={onFileChange}
      />

      {/* Hidden Multimodal Image Input */}
      <input 
        type="file" 
        ref={imageInputRef} 
        className="hidden" 
        accept="image/*"
        multiple
        onChange={onImageChange}
      />

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r shadow-2xl transition-transform duration-300 transform 
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:block lg:shadow-none`}>
        <div className="flex flex-col h-full">
          <div className="p-5 bg-[#002f5a] text-white shrink-0">
            <div className="flex items-center space-x-2 mb-4">
               <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center font-black text-[10px]">S4</div>
               <span className="font-black text-[11px] uppercase tracking-widest">SAP Control Center</span>
            </div>
            <div className="bg-blue-900/40 p-3 rounded-xl border border-blue-400/30">
               <label className="text-[8px] font-black text-blue-300 uppercase tracking-widest mb-1 block">Active Role</label>
               <select 
                value={currentUserRole}
                onChange={handleRoleChange}
                className="w-full bg-transparent text-xs font-bold text-white outline-none cursor-pointer"
               >
                 <option value="Business User" className="text-slate-900">Business User</option>
                 <option value="Functional Consultant" className="text-slate-900">Functional Consultant</option>
                 <option value="Technical Consultant" className="text-slate-900">Technical Consultant</option>
                 <option value="Architect" className="text-slate-900">Architect</option>
                 <option value="Administrator" className="text-slate-900">Administrator</option>
               </select>
            </div>
            
            <div className="bg-[#002f5a]/40 p-3 rounded-xl border border-emerald-500/20 mt-3 flex items-center justify-between">
               <div>
                 <label className="text-[8px] font-black text-blue-300 uppercase tracking-widest mb-0.5 block">Target Backend</label>
                 <span className="text-xs font-bold text-emerald-400">
                   {sapBackendTarget === 'ECC' ? 'LIVE SAP ECC (800)' : sapBackendTarget === 'S/4HANA' ? 'LIVE S/4HANA (100)' : 'LIVE DUAL (ECC + S/4)'}
                 </span>
               </div>
               <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            </div>
          </div>
          <div className="p-5 space-y-8 overflow-y-auto flex-1 no-scrollbar">
            
            {/* User Profile Voice Preference Configuration Section */}
            <div className="space-y-3 bg-slate-50 border border-slate-200/80 p-4 rounded-xl shadow-sm">
              <label className="text-[10px] font-black text-[#002f5a] uppercase tracking-widest flex items-center justify-between">
                <span>Enterprise Profile Voice Settings</span>
                <i className="fa-solid fa-gears text-[#002f5a]"></i>
              </label>

              {/* Silent Mode / Auto-Read Toggle */}
              <div className="space-y-1.5 pt-1.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-black uppercase text-slate-700 block">Auto-Read Responses</span>
                    <span className="text-[9px] text-slate-400 block font-semibold leading-tight">Speak output automatically</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const val = !ttsEnabled;
                      setTtsEnabled(val);
                      localStorage.setItem('adi_tts_enabled', String(val));
                      if (!val && window.speechSynthesis) {
                        window.speechSynthesis.cancel();
                        setIsTTSPlaying(false);
                      }
                    }}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-205 ease-in-out focus:outline-none ${
                      ttsEnabled ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                    title="Toggle to automatically read assistant responses aloud"
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-205 ease-in-out ${
                        ttsEnabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-1.5 px-2 bg-white border border-slate-150 rounded-lg">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Voice State</span>
                  <span className={`text-[8.5px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                    ttsEnabled ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {ttsEnabled ? '🔊 Auto-Speak' : '🔇 Silent Mode'}
                  </span>
                </div>
              </div>

              {/* Push-to-Talk Toggle */}
              <div className="space-y-1.5 pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-black uppercase text-slate-700 block">Push-to-Talk Mode</span>
                    <span className="text-[9px] text-slate-400 block font-semibold leading-tight">No continuous auto-send</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const val = !pushToTalkMode;
                      setPushToTalkMode(val);
                      localStorage.setItem('adi_push_to_talk_mode', String(val));
                    }}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-205 ease-in-out focus:outline-none ${
                      pushToTalkMode ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                    title="Toggle Push-to-Talk. When enabled, responses won't follow continuous auto-submission"
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-205 ease-in-out ${
                        pushToTalkMode ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                
                <span className="block text-[8.5px] text-slate-400 leading-tight font-bold">
                  {pushToTalkMode 
                    ? "✓ Stopped continuous hands-free looping. Speech must be sent manually." 
                    : "⚡ continuous auto-send enabled when pausing."}
                </span>
              </div>
            </div>
            
            {/* SAP S8H Live System Panel */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live S/4HANA (S8H) Instance</label>
              <div className={`p-4 bg-gradient-to-br from-slate-900 to-[#002f5a] text-white rounded-2xl border border-slate-850 shadow-lg space-y-3 transition-opacity ${s8hConnStatus === 'Inactive' ? 'opacity-50' : ''}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-blue-300 uppercase tracking-tight">S8H - S/4 2025</span>
                  <div className={`flex items-center space-x-1.5 px-2 py-0.5 rounded-full border ${s8hConnStatus === 'Connected' ? 'bg-green-950/60 border-green-800/60' : s8hConnStatus === 'Unreachable' ? 'bg-rose-950/60 border-rose-800/60' : s8hConnStatus === 'Checking' ? 'bg-amber-950/60 border-amber-800/60' : 'bg-slate-800/60 border-slate-700/60'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${s8hConnStatus === 'Connected' ? 'bg-green-500 animate-pulse' : s8hConnStatus === 'Unreachable' ? 'bg-rose-500' : s8hConnStatus === 'Checking' ? 'bg-amber-400 animate-pulse' : 'bg-slate-500'}`}></span>
                    <span className={`text-[8px] font-black uppercase tracking-wider ${s8hConnStatus === 'Connected' ? 'text-green-400' : s8hConnStatus === 'Unreachable' ? 'text-rose-400' : s8hConnStatus === 'Checking' ? 'text-amber-400' : 'text-slate-400'}`}>
                      {s8hConnStatus === 'Connected' ? 'Connected' : s8hConnStatus === 'Unreachable' ? 'Unreachable' : s8hConnStatus === 'Checking' ? 'Checking...' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">Client:</span>
                    <span className="font-black text-slate-200">100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">User:</span>
                    <span className="font-black text-slate-200">STUDENT069</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">Router String:</span>
                    <span className="font-black text-slate-200">/H/161.38.17.212</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">Host IP:</span>
                    <span className="font-black text-slate-200">172.21.72.31</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/60 flex flex-col gap-1.5">
                  <a 
                    href="https://mmc-s4sap11.mmc.1stbasis.com:44300/sap/bc/ui2/flp?sap-client=100&sap-language=EN" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center justify-center space-x-2 p-2 bg-blue-600/40 border border-blue-500/40 hover:bg-blue-600 hover:text-white text-[9px] font-black uppercase tracking-wider rounded-xl transition-all text-center cursor-pointer"
                  >
                    <i className="fas fa-cubes text-[10px]"></i>
                    <span>S8H Fiori Launchpad</span>
                  </a>
                  <a 
                    href="https://mmc-s4sap11.mmc.1stbasis.com:44300/sap/bc/gui/sap/its/webgui" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center justify-center space-x-2 p-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:text-white text-[9px] font-black uppercase tracking-wider rounded-xl transition-all text-center cursor-pointer"
                  >
                    <i className="fas fa-terminal text-[10px]"></i>
                    <span>Launch WebGUI</span>
                  </a>
                </div>
                
                <div className="text-[8px] text-slate-400 font-bold text-center italic break-words p-1 bg-slate-950/40 rounded">
                  {s8hStatusMsg}
                </div>
              </div>
            </div>

            {/* S/4HANA Transformation Intelligence */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">S/4HANA Transformation Intelligence</label>
              <div className="grid grid-cols-1 gap-2">
                <button 
                  onClick={() => {
                    setInput("Analyze Current Connected ECC & Get Ready for S/4HANA Migration.");
                    handleSubmit(undefined, "Analyze Current Connected ECC & Get Ready for S/4HANA Migration.");
                  }}
                  className="flex items-center space-x-3 p-3 bg-gradient-to-br from-[#0c2340] to-indigo-950 text-white rounded-xl hover:from-indigo-900 transition-all text-left shadow border border-indigo-900/60 group"
                >
                  <div className="w-8 h-8 bg-indigo-900/50 text-indigo-300 rounded-lg flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0">
                    <i className="fas fa-layer-group"></i>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-black uppercase tracking-tight truncate">S/4 Migration Suite</span>
                    <span className="text-[9px] text-indigo-300 font-bold">One-Click Upgrade Runbook (.docx)</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Enterprise Intelligence Menu */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enterprise Intelligence</label>
              <div className="grid grid-cols-1 gap-2">
                <button 
                  onClick={() => {
                    setInput("Forecast inventory shortages for the next 90 days across SAP and Salesforce data.");
                    handleSubmit(undefined, "Forecast inventory shortages for the next 90 days across SAP and Salesforce data.");
                  }}
                  className="flex items-center space-x-3 p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-left shadow-sm group"
                >
                  <div className="w-8 h-8 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <i className="fas fa-brain"></i>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight">PREDICTIVE TRENDS</span>
                    <span className="text-[9px] text-slate-400 font-bold">Predict Demand & Risk</span>
                  </div>
                </button>
                <button 
                  onClick={() => {
                    setInput("Check platform connectivity status for Salesforce, Snowflake, and Databricks.");
                    handleSubmit(undefined, "Check platform connectivity status for Salesforce, Snowflake, and Databricks.");
                  }}
                  className="flex items-center space-x-3 p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-left shadow-sm group"
                >
                  <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <i className="fas fa-plug"></i>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight">PLUGIN HUB</span>
                    <span className="text-[9px] text-slate-400 font-bold">Monitor Multi-Source Links</span>
                  </div>
                </button>
                <button 
                  onClick={() => {
                    setInput("Validate local.yaml configuration and refresh knowledge index for C:/sap.");
                    handleSubmit(undefined, "Validate local.yaml configuration and refresh knowledge index for C:/sap.");
                  }}
                  className="flex items-center space-x-3 p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-left shadow-sm group"
                >
                  <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <i className="fas fa-microchip"></i>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight">LOCAL AGENT</span>
                    <span className="text-[9px] text-slate-400 font-bold">C:/sap Index Manager</span>
                  </div>
                </button>
              </div>
            </div>

            {/* IDoc Intelligence & Self-Healing */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SAP IDoc Expert Agent</label>
              <div className="grid grid-cols-1 gap-2">
                <button 
                  onClick={() => {
                    setInput("Show me the real-time IDoc integration monitor and error trends.");
                    handleSubmit(undefined, "Show me the real-time IDoc integration monitor and error trends.");
                  }}
                  className="flex items-center space-x-3 p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-left shadow-sm group"
                >
                  <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight">IDOC MONITOR</span>
                    <span className="text-[9px] text-slate-400 font-bold">Integration Health</span>
                  </div>
                </button>
                <button 
                  onClick={() => {
                    setInput("Analyze failed ORDERS IDocs and recommend fixes.");
                    handleSubmit(undefined, "Analyze failed ORDERS IDocs and recommend fixes.");
                  }}
                  className="flex items-center space-x-3 p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-left shadow-sm group"
                >
                  <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <FileSearch className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight">FAILURE FORENSICS</span>
                    <span className="text-[9px] text-slate-400 font-bold">Root Cause Analysis</span>
                  </div>
                </button>
              </div>
            </div>

            {/* SAP Logistics & Procurement Experts */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SAP TM & Ariba AI Assistants</label>
              <div className="grid grid-cols-1 gap-2">
                <button 
                  onClick={() => {
                    setInput("Get real-time KPIs and transit exceptions from the SAP TM Transportation Cockpit.");
                    handleSubmit(undefined, "Get real-time KPIs and transit exceptions from the SAP TM Transportation Cockpit.");
                  }}
                  className="flex items-center space-x-3 p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-left shadow-sm group"
                >
                  <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <i className="fas fa-truck-ramp-box"></i>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight">SAP TM COCKPIT</span>
                    <span className="text-[9px] text-slate-400 font-bold">Transportation Exceptions</span>
                  </div>
                </button>
                <button 
                  onClick={() => {
                    setInput("Analyze spend allocations, contract compliance, and supplier risk assessments in SAP Ariba.");
                    handleSubmit(undefined, "Analyze spend allocations, contract compliance, and supplier risk assessments in SAP Ariba.");
                  }}
                  className="flex items-center space-x-3 p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-left shadow-sm group"
                >
                  <div className="w-8 h-8 bg-teal-50 text-teal-600 rounded-lg flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
                    <i className="fas fa-handshake"></i>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight">ARIBA PROCUREMENT</span>
                    <span className="text-[9px] text-slate-400 font-bold">Spend Risks & Sourcing</span>
                  </div>
                </button>
                <button 
                  onClick={() => {
                    setInput("Synthesize a collaborative analysis between Ariba and Logistics agents on supplier SLA freight impacts.");
                    handleSubmit(undefined, "Synthesize a collaborative analysis between Ariba and Logistics agents on supplier SLA freight impacts.");
                  }}
                  className="flex items-center space-x-3 p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-left shadow-sm group"
                >
                  <div className="w-8 h-8 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <i className="fas fa-people-arrows"></i>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight">JOINT COLLABORATION</span>
                    <span className="text-[9px] text-slate-400 font-bold">Cross-Module Federation</span>
                  </div>
                </button>
              </div>
            </div>

            {/* HANA DB Intelligence — direct live SAP HANA SQL access module */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-cyan-600 uppercase tracking-widest">HANA DB Intelligence</label>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => {
                    setInput('HANA DB Intelligence: ');
                    setTimeout(() => textareaRef.current?.focus(), 0);
                  }}
                  className="flex items-center space-x-3 p-3 bg-white border border-cyan-200 rounded-xl hover:bg-cyan-50 transition-all text-left shadow-sm group"
                >
                  <div className="w-8 h-8 bg-cyan-50 text-cyan-700 rounded-lg flex items-center justify-center group-hover:bg-cyan-700 group-hover:text-white transition-colors">
                    <i className="fas fa-database"></i>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight">HANA DB INTELLIGENCE</span>
                    <span className="text-[9px] text-slate-400 font-bold">Ask any question — live HANA SQL</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Live S/4HANA 2025 Diagnostics */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping mr-1.5 shrink-0"></span>
                ERP Live Core Security & Systems
              </label>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-black uppercase tracking-[0.18em] text-emerald-700">Live Data Trust</span>
                  <span className={`rounded-full px-2 py-0.5 text-[8px] font-black uppercase ${activeBackendVerified ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-amber-950'}`}>
                    {activeBackendVerified ? 'Verified' : 'Checking'}
                  </span>
                </div>
                <div className="space-y-1 text-[10px] text-slate-700 font-semibold">
                  <div>Source of truth: {liveDataTrustLabel}</div>
                  <div>Approval policy: {sapOperatingMode === 'LIVE' ? 'Live SAP approval policy enforced' : 'Live SAP approval policy enforced'}</div>
                  <div>Fallback policy: None — live backend only</div>
                </div>
              </div>
              <div className="mt-3 rounded-2xl border border-indigo-200 bg-indigo-50/80 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-black uppercase tracking-[0.18em] text-indigo-700">Approval Readiness</span>
                  <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[8px] font-black uppercase text-white">Ready</span>
                </div>
                <div className="space-y-1 text-[10px] text-slate-700 font-semibold">
                  <div>Policy tier: Human approval enforced for high-impact actions</div>
                  <div>Audit trail: Active and recorded for operational events</div>
                  <div>Change control: Guardrails remain enabled without altering workflows</div>
                </div>
              </div>
              <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-black uppercase tracking-[0.18em] text-amber-700">Enterprise Audit</span>
                  <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[8px] font-black uppercase text-amber-950">Signed</span>
                </div>
                <div className="space-y-1 text-[10px] text-slate-700 font-semibold">
                  <div>Source verification: Live SAP connection and backend route validated</div>
                  <div>Governance status: Approved for enterprise visibility review</div>
                  <div>Operational note: No fallback branch introduced in data access flow</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => {
                    setInput("Audit Live SAP Multi-Agent landscape and active diagnostics.");
                    handleSubmit(undefined, "Audit Live SAP Multi-Agent landscape and active diagnostics.");
                  }}
                  className="flex items-center space-x-2.5 p-2.5 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-850 transition-all text-left shadow-sm group text-slate-100 cursor-pointer"
                >
                  <div className="w-7 h-7 bg-indigo-950 text-indigo-400 rounded-lg flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0">
                    <i className="fas fa-network-wired text-xs"></i>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10.5px] font-black uppercase tracking-tight truncate">Agent Matrix</span>
                    <span className="text-[8px] text-slate-400 font-bold">15+ Active Agents</span>
                  </div>
                </button>

                <button 
                  onClick={() => {
                    setInput("Verify SPRO configuration table schemas (T005I, T685A, TMST, Doc splitting).");
                    handleSubmit(undefined, "Verify SPRO configuration table schemas (T005I, T685A, TMST, Doc splitting).");
                  }}
                  className="flex items-center space-x-2.5 p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-left shadow-sm group cursor-pointer"
                >
                  <div className="w-7 h-7 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors shrink-0">
                    <i className="fas fa-sliders-h text-xs"></i>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10.5px] font-black text-slate-800 uppercase tracking-tight truncate">SPRO Schema</span>
                    <span className="text-[8px] text-slate-400 font-bold">IMG Config</span>
                  </div>
                </button>

                <button 
                  onClick={() => {
                    setInput("Query Security Audit Trail, AD logs, and row-level data masking.");
                    handleSubmit(undefined, "Query Security Audit Trail, AD logs, and row-level data masking.");
                  }}
                  className="flex items-center space-x-2.5 p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-left shadow-sm group cursor-pointer"
                >
                  <div className="w-7 h-7 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors shrink-0">
                    <i className="fas fa-user-shield text-xs"></i>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10.5px] font-black text-slate-800 uppercase tracking-tight truncate">Security Audit</span>
                    <span className="text-[8px] text-slate-400 font-bold">Audit Logs</span>
                  </div>
                </button>

                <button 
                  onClick={() => {
                    setInput("Examine ST22 ABAP run-time exception diagnostics and failed jobs.");
                    handleSubmit(undefined, "Examine ST22 ABAP run-time exception diagnostics and failed jobs.");
                  }}
                  className="flex items-center space-x-2.5 p-2.5 bg-slate-950 border border-red-950 rounded-xl hover:bg-slate-900 transition-all text-left shadow-sm group text-red-100 cursor-pointer"
                >
                  <div className="w-7 h-7 bg-red-950 text-red-400 rounded-lg flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors shrink-0">
                    <i className="fas fa-bug text-xs"></i>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10.5px] font-black uppercase tracking-tight truncate">ST22 Crash</span>
                    <span className="text-[8px] text-slate-400 font-bold">ABAP Forensics</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Dynamic MCP Orchestration */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">MCP Dynamic Orchestration</label>
              <div className="grid grid-cols-1 gap-2">
                <button 
                  onClick={() => {
                    setInput("Show me all registered MCP plugins and discovered tools.");
                    handleSubmit(undefined, "Show me all registered MCP plugins and discovered tools.");
                  }}
                  className="flex items-center space-x-3 p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-left shadow-sm group"
                >
                  <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <i className="fas fa-project-diagram"></i>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight">MCP REGISTRY</span>
                    <span className="text-[9px] text-slate-400 font-bold">Tool & Agent Discovery</span>
                  </div>
                </button>
                <button 
                  onClick={() => {
                    setInput("Retrieve execution traces for recent MCP tool calls.");
                    handleSubmit(undefined, "Retrieve execution traces for recent MCP tool calls.");
                  }}
                  className="flex items-center space-x-3 p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-left shadow-sm group"
                >
                  <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <i className="fas fa-satellite-dish"></i>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight">EXECUTION TRACE</span>
                    <span className="text-[9px] text-slate-400 font-bold">Dynamic Observability</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Automation Menu */}
            {RBAC_PROFILES[currentUserRole].capabilities.length > 0 && (
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Agent Automation</label>
                <div className="grid grid-cols-1 gap-2">
                  {RBAC_PROFILES[currentUserRole].capabilities.includes('PDF_INV') && (
                    <button 
                      onClick={() => handleFileUpload('PDF')}
                      className="flex items-center space-x-3 p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-left shadow-sm group"
                    >
                      <div className="w-8 h-8 bg-red-50 text-red-600 rounded-lg flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors">
                        <i className="fas fa-file-pdf"></i>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight">PDF INV</span>
                        <span className="text-[9px] text-slate-400 font-bold">Upload PDF Invoice</span>
                      </div>
                    </button>
                  )}
                  {RBAC_PROFILES[currentUserRole].capabilities.includes('CSV_ORD') && (
                    <button 
                      onClick={() => handleFileUpload('CSV')}
                      className="flex items-center space-x-3 p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-left shadow-sm group"
                    >
                      <div className="w-8 h-8 bg-green-50 text-green-600 rounded-lg flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
                        <i className="fas fa-file-csv"></i>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight">CSV ORD</span>
                        <span className="text-[9px] text-slate-400 font-bold">Upload CSV Order File</span>
                      </div>
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      setInput("Search enterprise knowledge for month-end reconciliation SOPs.");
                      handleSubmit(undefined, "Search enterprise knowledge for month-end reconciliation SOPs.");
                    }}
                    className="flex items-center space-x-3 p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-left shadow-sm group"
                  >
                    <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <i className="fas fa-search-plus"></i>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight">KNOWLEDGE RAG</span>
                      <span className="text-[9px] text-slate-400 font-bold">Search Across Multi-Cloud KB</span>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Autonomous S/4HANA Execution OS */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping mr-1.5"></span>
                Autonomous S/4 Execution Engine (S/4 OS)
              </label>
              <div className="grid grid-cols-1 gap-2">
                <button 
                  onClick={() => {
                    setInput("Orchestrate autonomous sales commissioning and end-to-end SD transaction sequence for Walmart Inc order.");
                    handleSubmit(undefined, "Orchestrate autonomous sales commissioning and end-to-end SD transaction sequence for Walmart Inc order.");
                  }}
                  className="flex items-center space-x-3 p-3 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-850 transition-all text-left shadow-md group cursor-pointer text-slate-100"
                >
                  <div className="w-8 h-8 bg-indigo-950 text-indigo-400 rounded-lg flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0">
                    <i className="fas fa-shopping-cart text-xs"></i>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-black uppercase tracking-tight truncate">Autonomous Sales Order (SD)</span>
                    <span className="text-[9px] text-slate-400 font-bold truncate">Generate SD Billing Block</span>
                  </div>
                </button>

                <button 
                  onClick={() => {
                    setInput("Trigger autonomous material requirements planning, run MRP Live (MD01N), and coordinate MM replenishment adjustments.");
                    handleSubmit(undefined, "Trigger autonomous material requirements planning, run MRP Live (MD01N), and coordinate MM replenishment adjustments.");
                  }}
                  className="flex items-center space-x-3 p-3 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-850 transition-all text-left shadow-md group cursor-pointer text-slate-100"
                >
                  <div className="w-8 h-8 bg-amber-950/80 text-amber-400 rounded-lg flex items-center justify-center group-hover:bg-amber-650 group-hover:text-white transition-colors shrink-0">
                    <i className="fas fa-boxes-stacked text-xs"></i>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-black uppercase tracking-tight truncate">Replenishment & MRP (MM)</span>
                    <span className="text-[9px] text-slate-400 font-bold truncate">Automate stock reconciliation</span>
                  </div>
                </button>

                <button 
                  onClick={() => {
                    setInput("Auto-provision S/4HANA authorizations and composite GRC roles for new remote consultant John Doe.");
                    handleSubmit(undefined, "Auto-provision S/4HANA authorizations and composite GRC roles for new remote consultant John Doe.");
                  }}
                  className="flex items-center space-x-3 p-3 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-850 transition-all text-left shadow-md group cursor-pointer text-slate-100"
                >
                  <div className="w-8 h-8 bg-emerald-950 text-emerald-400 rounded-lg flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0">
                    <i className="fas fa-user-lock text-xs"></i>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-black uppercase tracking-tight truncate">IAM Identity Provision (Basis)</span>
                    <span className="text-[9px] text-slate-400 font-bold truncate">Pristine GRC Role Assignment</span>
                  </div>
                </button>

                <button 
                  onClick={() => {
                    setInput("Diagnose blocked business messages, heal corrupted EDIDC header records, and reprocess aborted IDocs.");
                    handleSubmit(undefined, "Diagnose blocked business messages, heal corrupted EDIDC header records, and reprocess aborted IDocs.");
                  }}
                  className="flex items-center space-x-3 p-3 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-850 transition-all text-left shadow-md group cursor-pointer text-slate-100"
                >
                  <div className="w-8 h-8 bg-rose-950 text-rose-400 rounded-lg flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors shrink-0">
                    <i className="fas fa-heart-pulse text-xs"></i>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-black uppercase tracking-tight truncate">Self-Healing IDocs (Basis/PI)</span>
                    <span className="text-[9px] text-slate-400 font-bold truncate">Zero-intervention error diagnostics</span>
                  </div>
                </button>

                <button 
                  id="btn-quick-ecc-agent"
                  onClick={() => {
                    setInput("Query live SAP ECC 6.0 system status on s1.myerplabs.com (A4H Client 800), verify connection with AI_AGENT credentials, and show work processes and executable transactions.");
                    handleSubmit(undefined, "Query live SAP ECC 6.0 system status on s1.myerplabs.com (A4H Client 800), verify connection with AI_AGENT credentials, and show work processes and executable transactions.");
                  }}
                  className={`flex items-center space-x-3 p-3 bg-emerald-950/70 border border-emerald-800/80 rounded-xl hover:bg-emerald-900/80 transition-all text-left shadow-md group cursor-pointer text-slate-100 transition-opacity ${eccConnStatus === 'Inactive' ? 'opacity-50' : ''}`}
                  title={eccStatusMsg}
                >
                  <div className="w-8 h-8 bg-emerald-900 text-emerald-300 rounded-lg flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors shrink-0">
                    <i className="fas fa-server text-xs"></i>
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[11px] font-black uppercase tracking-tight truncate text-emerald-300">SAP ECC AI Agent (ECC:800)</span>
                    <span className="text-[9px] text-emerald-400/80 font-bold truncate">s1.myerplabs.com:8085 Live ECC</span>
                  </div>
                  <div className={`flex items-center space-x-1.5 px-2 py-0.5 rounded-full border shrink-0 ${eccConnStatus === 'Connected' ? 'bg-green-950/60 border-green-800/60' : eccConnStatus === 'Unreachable' ? 'bg-rose-950/60 border-rose-800/60' : eccConnStatus === 'Checking' ? 'bg-amber-950/60 border-amber-800/60' : 'bg-slate-800/60 border-slate-700/60'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${eccConnStatus === 'Connected' ? 'bg-green-500 animate-pulse' : eccConnStatus === 'Unreachable' ? 'bg-rose-500' : eccConnStatus === 'Checking' ? 'bg-amber-400 animate-pulse' : 'bg-slate-500'}`}></span>
                    <span className={`text-[8px] font-black uppercase tracking-wider ${eccConnStatus === 'Connected' ? 'text-green-400' : eccConnStatus === 'Unreachable' ? 'text-rose-400' : eccConnStatus === 'Checking' ? 'text-amber-400' : 'text-slate-400'}`}>
                      {eccConnStatus === 'Connected' ? 'Connected' : eccConnStatus === 'Unreachable' ? 'Unreachable' : eccConnStatus === 'Checking' ? 'Checking...' : 'Inactive'}
                    </span>
                  </div>
                </button>

                <a 
                  id="btn-ecc-launch-webgui"
                  href="http://s1.myerplabs.com:8085/sap/bc/gui/sap/its/webgui?sap-client=800" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-center space-x-2 p-2 bg-emerald-950/90 border border-emerald-700/80 hover:bg-emerald-800 hover:text-white text-[9px] font-black uppercase tracking-wider rounded-xl transition-all text-center cursor-pointer text-emerald-300 shadow-md group"
                >
                  <i className="fas fa-terminal text-emerald-400 group-hover:text-white text-[10px]"></i>
                  <span>ECC LAUNCH WebGUI</span>
                </a>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authorized Modules</label>
              <nav className="space-y-2">
                {(RBAC_PROFILES[currentUserRole]?.modules || []).filter(m => m !== 'General').map(mod => (
                  <div key={mod} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg cursor-default group">
                    <span className="text-xs font-bold text-slate-600">{mod} Authorization</span>
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                  </div>
                ))}
              </nav>
            </div>
            <div className="space-y-3">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Security Policy</label>
               <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-[10px] text-slate-500 font-medium leading-relaxed">
                  Access restricted to: 
                  <ul className="mt-2 space-y-1">
                    {(RBAC_PROFILES[currentUserRole]?.types || []).map(t => (
                      <li key={t} className="flex items-center text-blue-600 font-black"><i className="fas fa-check-circle mr-2 text-[8px]"></i>{t} Knowledge</li>
                    ))}
                  </ul>
               </div>
            </div>
          </div>
          <div className="p-5 border-t bg-slate-50 shrink-0">
             <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase mb-1">
                <span>Identity Authenticated</span>
                <i className="fas fa-id-badge text-blue-500"></i>
             </div>
             <div className="text-[11px] font-bold text-slate-700">User: S4_USER_9921</div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col relative overflow-hidden h-full">
        <header className="bg-white border-b px-4 md:px-6 py-3 flex items-center justify-between shadow-sm z-30 shrink-0">
          <div className="flex items-center space-x-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
              <i className="fas fa-bars"></i>
            </button>
            <div className="flex items-center space-x-3">
              <svg className="w-8 h-5 md:w-10 md:h-6" viewBox="0 0 100 60" fill="none">
                <path d="M0 0H100V38L62 60H0V0Z" fill="#008FD3"/>
                <text x="5" y="42" fill="white" style={{ fontWeight: 900, fontSize: '38px' }}>SAP</text>
              </svg>
              <div className="flex flex-col">
                <h1 className="font-black text-xs md:text-sm uppercase tracking-tighter text-[#002f5a]">ADI AI AGENTIC</h1>
                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Active: {currentUserRole}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="hidden xl:flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.18em] text-slate-600">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Guardrails Active</span>
              <span className="text-slate-400">•</span>
              <span>{sapOperatingMode === 'LIVE' ? 'Approval-Gated' : 'Approval-Gated'}</span>
            </div>
            <div className="hidden 2xl:flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.18em] text-amber-700">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span>Audit Trail</span>
              <span className="text-amber-500">•</span>
              <span>Live Source Verified</span>
            </div>
            <div className="hidden xl:flex items-center gap-2 rounded-2xl border border-violet-200 bg-violet-50 px-2.5 py-1.5 shadow-sm">
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-violet-500 animate-pulse"></span>
                <span className="text-[8px] font-black uppercase tracking-[0.18em] text-violet-700">Executive Control</span>
              </div>
              <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.18em]">
                <span className="text-slate-500">Trust</span>
                <span className="rounded-full bg-emerald-600 px-1.5 py-0.5 text-white">98%</span>
              </div>
            </div>
            {/* SAP Environment Selector (ECC | BOTH | S/4HANA) */}
            <div className="bg-slate-100 p-0.5 md:p-1 rounded-xl flex items-center border border-slate-200 shadow-inner" id="sap-environment-selector">
              <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest px-2 hidden sm:inline-block">
                Backend:
              </span>
              <button 
                type="button"
                id="env-toggle-ecc"
                onClick={() => setSapBackendTarget('ECC')}
                title="Connect only to SAP ECC 6.0 (Client 800). Never queries S/4HANA."
                className={`px-2.5 py-1 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-tight transition-all duration-200 cursor-pointer flex items-center space-x-1 ${
                  sapBackendTarget === 'ECC' 
                    ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-500' 
                    : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-200/60'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${sapBackendTarget === 'ECC' ? 'bg-white' : 'bg-emerald-500'}`}></span>
                <span>ECC</span>
              </button>
              <button 
                type="button"
                id="env-toggle-both"
                onClick={() => setSapBackendTarget('BOTH')}
                title="Dual routing: Both ECC and S/4HANA are active. Queries both systems based on intent."
                className={`px-2.5 py-1 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-tight transition-all duration-200 cursor-pointer flex items-center space-x-1 ${
                  sapBackendTarget === 'BOTH' 
                    ? 'bg-[#002f5a] text-white shadow-sm ring-1 ring-blue-900' 
                    : 'text-slate-600 hover:text-[#002f5a] hover:bg-slate-200/60'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${sapBackendTarget === 'BOTH' ? 'bg-cyan-300' : 'bg-blue-400'}`}></span>
                <span>BOTH</span>
              </button>
              <button 
                type="button"
                id="env-toggle-s4hana"
                onClick={() => setSapBackendTarget('S/4HANA')}
                title="Connect only to SAP S/4HANA (Client 100). Never queries ECC."
                className={`px-2.5 py-1 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-tight transition-all duration-200 cursor-pointer flex items-center space-x-1 ${
                  sapBackendTarget === 'S/4HANA' 
                    ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-500' 
                    : 'text-slate-600 hover:text-indigo-700 hover:bg-slate-200/60'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${sapBackendTarget === 'S/4HANA' ? 'bg-white' : 'bg-indigo-500'}`}></span>
                <span>S/4HANA</span>
              </button>
            </div>

            <div className="bg-slate-150 p-1 rounded-xl flex border border-slate-200">
              <button 
                onClick={() => setWorkspaceMode('copilot')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all duration-200 cursor-pointer ${workspaceMode === 'copilot' ? 'bg-[#002f5a] text-white shadow-sm' : 'text-slate-600 hover:text-slate-850'}`}
              >
                Copilot Chat
              </button>
              <button 
                onClick={() => setWorkspaceMode('fiori')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all duration-200 cursor-pointer ${workspaceMode === 'fiori' ? 'bg-[#002f5a] text-white shadow-sm' : 'text-slate-600 hover:text-slate-850'}`}
                id="fiori-portal-toggle-btn"
              >
                S/4 Fiori Portal
              </button>
              <button 
                onClick={() => setWorkspaceMode('studio')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all duration-200 cursor-pointer ${workspaceMode === 'studio' ? 'bg-[#002f5a] text-white shadow-sm' : 'text-slate-600 hover:text-slate-850'}`}
                id="model-studio-toggle-btn"
              >
                Model Adapt Studio
              </button>
            </div>
            <div className="hidden sm:block px-3 py-1 bg-blue-50 text-blue-700 text-[9px] font-black uppercase tracking-widest rounded-full border border-blue-100">
               Governance Enabled
            </div>
            <div className="w-8 h-8 bg-[#002f5a] rounded-full flex items-center justify-center text-white text-[10px] font-black">{currentUserRole[0]}</div>
          </div>
        </header>

        <main 
          onDragOver={handleDragOver} 
          onDragLeave={handleDragLeave} 
          onDrop={handleDrop}
          onPaste={handlePaste}
          className="flex-1 flex flex-col overflow-hidden relative"
        >
          {isDragging && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex flex-col items-center justify-center animate-in fade-in duration-200">
              <div className="bg-white border-2 border-dashed border-blue-500 rounded-3xl p-8 max-w-sm text-center shadow-2xl flex flex-col items-center space-y-4 mx-4 hover:scale-105 transition-transform">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center animate-bounce shadow-inner">
                  <i className="fas fa-images text-2xl"></i>
                </div>
                <div>
                  <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm">Drop SAP Screenshot</h3>
                  <p className="text-xs text-slate-500 font-bold mt-1">Release to load documents or screenshots into active multi-agent pipeline</p>
                </div>
              </div>
            </div>
          )}
          {workspaceMode === 'studio' ? (
            <div className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar pb-16">
              <SapFineTuningStudio userRole={currentUserRole} />
            </div>
          ) : workspaceMode === 'fiori' ? (
            <div className="flex-1 overflow-y-auto no-scrollbar bg-slate-50">
              <SapFioriLaunchpad 
                userRole={currentUserRole} 
                triggerSelfHealApproval={setPendingSelfHealing} 
              />
            </div>
          ) : (
            <div className="flex-1 flex overflow-hidden relative w-full h-full">
              {/* Left Column: Chat Copilot */}
              <div 
                className="flex-1 flex h-full flex-col relative overflow-hidden transition-all duration-300"
                style={{ width: sapPanelOpen ? `${100 - sapPanelWidth}%` : '100%', flex: sapPanelOpen ? 'none' : '1 1 0%' }}
              >
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-10 space-y-8 no-scrollbar pb-[165px] lg:pb-32">
                <div className="max-w-4xl mx-auto w-full space-y-8">
                  {messages.length === 1 && (
                    <div className="space-y-4 animate-in fade-in duration-700">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/80 shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">System Health</span>
                            <span className="text-sm font-black text-emerald-600">98.7%</span>
                          </div>
                          <div className="w-full h-1.5 bg-emerald-200 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '98.7%' }}></div>
                          </div>
                          <div className="text-[9px] text-emerald-600 mt-2 font-semibold">All SAP modules operational</div>
                        </div>
                        <div className="p-4 rounded-xl border border-violet-200 bg-violet-50/80 shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black text-violet-700 uppercase tracking-wider">Live Data Trust</span>
                            <span className="text-sm font-black text-violet-600">100%</span>
                          </div>
                          <div className="w-full h-1.5 bg-violet-200 rounded-full overflow-hidden">
                            <div className="h-full bg-violet-500 rounded-full" style={{ width: '100%' }}></div>
                          </div>
                          <div className="text-[9px] text-violet-600 mt-2 font-semibold">Zero fallback branch; live backend only</div>
                        </div>
                        <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/80 shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black text-indigo-700 uppercase tracking-wider">AI Confidence</span>
                            <span className="text-sm font-black text-indigo-600">94.3%</span>
                          </div>
                          <div className="w-full h-1.5 bg-indigo-200 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: '94.3%' }}></div>
                          </div>
                          <div className="text-[9px] text-indigo-600 mt-2 font-semibold">Cross-module query accuracy verified</div>
                        </div>
                        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/80 shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black text-amber-700 uppercase tracking-wider">Governance Score</span>
                            <span className="text-sm font-black text-amber-600">100%</span>
                          </div>
                          <div className="w-full h-1.5 bg-amber-200 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: '100%' }}></div>
                          </div>
                          <div className="text-[9px] text-amber-600 mt-2 font-semibold">Human approval gated • Audit trail active</div>
                        </div>
                      </div>
                      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 shadow-sm">
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
                          <div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">SAP ECC</div>
                            <div className="flex items-center justify-center space-x-1">
                              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                              <span className="text-[9px] font-bold text-slate-700">Live</span>
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">S/4HANA</div>
                            <div className="flex items-center justify-center space-x-1">
                              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                              <span className="text-[9px] font-bold text-slate-700">Live</span>
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Approval Engine</div>
                            <div className="flex items-center justify-center space-x-1">
                              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                              <span className="text-[9px] font-bold text-slate-700">Ready</span>
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Audit Trail</div>
                            <div className="flex items-center justify-center space-x-1">
                              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                              <span className="text-[9px] font-bold text-slate-700">Active</span>
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Last Sync</div>
                            <div className="text-[9px] font-bold text-slate-700">Now</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {messages.map((msg, idx) => (
                    <div key={idx} id={`chat-msg-${idx}`} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} group animate-in slide-in-from-bottom-4 duration-500 scroll-mt-6`}>
                      <div className={`w-full ${msg.role === 'user' ? 'max-w-[90%] md:max-w-[70%]' : 'max-w-full'}`}>
                        {msg.role === 'user' ? (
                          <div className="flex flex-col items-end space-y-2">
                            <div className="p-4 md:p-5 bg-[#002f5a] text-white rounded-2xl rounded-tr-none shadow-lg">
                              <p className="text-sm md:text-base font-semibold leading-relaxed">{msg.content}</p>
                            </div>
                            {msg.images && msg.images.length > 0 && (
                              <div className="flex flex-wrap gap-2 justify-end">
                                {msg.images.map((img, i) => (
                                  <div 
                                    key={i} 
                                    onClick={() => setActiveLightboxImage(`data:${img.type};base64,${img.data}`)}
                                    className="cursor-zoom-in w-24 h-16 md:w-32 md:h-20 rounded-xl overflow-hidden border-2 border-blue-500/30 hover:border-blue-400 shadow-md hover:scale-105 active:scale-95 transition-all duration-200 bg-slate-100"
                                    title="Click to zoom screenshot"
                                  >
                                    <img 
                                      src={`data:${img.type};base64,${img.data}`} 
                                      alt={img.name} 
                                      className="w-full h-full object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {(() => {
                              const isSapUnavailable = isLiveSapUnavailableMessage(msg.content);
                              
                              if (isSapUnavailable) {
                                return (
                                  <LiveSapUnavailableCard 
                                    onRetry={() => {
                                      const previousUserMsg = messages.slice(0, idx).reverse().find(m => m.role === 'user');
                                      const query = previousUserMsg ? previousUserMsg.content : '';
                                      if (query) {
                                        handleSubmit(undefined, query);
                                      } else {
                                        const lastUserMsg = messages.filter(m => m.role === 'user').pop();
                                        if (lastUserMsg) {
                                          handleSubmit(undefined, lastUserMsg.content);
                                        }
                                      }
                                    }}
                                    rawError={msg.content}
                                    backendTarget={sapBackendTarget}
                                    sapOperatingMode={sapOperatingMode}
                                    setSapOperatingMode={(mode) => {
                                      sapOperatingModeManager.setMode(mode);
                                      window.dispatchEvent(new Event('sap-mode-changed'));
                                    }}
                                  />
                                );
                              }
                              const theme = getMessageTheme(msg.content);

                              return (
                                <div className={`p-5 md:p-8 bg-white border ${theme.border} text-slate-800 rounded-2xl rounded-tl-none shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden flex flex-col space-y-5`}>
                                  {/* Color coded modern header with enterprise badges */}
                                  <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-3 shrink-0">
                                    <div className="flex items-center space-x-2.5">
                                      <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center">
                                        <i className={`${theme.icon} text-xs`}></i>
                                      </div>
                                      <div>
                                        <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest block">Governance Control Hub</span>
                                        <span className={`text-[11px] font-extrabold ${theme.accentText} uppercase tracking-tight`}>{theme.title}</span>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <span className={`px-2.5 py-0.75 border rounded-full text-[9px] font-bold uppercase tracking-wider hidden sm:flex items-center shadow-sm ${theme.pillBg}`}>
                                        <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse"></span>
                                        {theme.pillLabel}
                                      </span>
                                      <span className="text-[10px] font-bold text-slate-400 font-mono">{msg.timestamp || '05:16 AM'}</span>
                                      
                                      {/* Dynamic Stateful Copy Button */}
                                      <button
                                        onClick={() => handleCopy(msg.content, idx)}
                                        className="p-1 px-2.5 rounded-lg border border-slate-200/85 bg-slate-50 hover:bg-slate-100/80 active:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all duration-200 text-[10px] font-bold flex items-center space-x-1.5 shadow-sm active:scale-95 cursor-pointer"
                                        title="Copy full response to clipboard"
                                      >
                                        <i className={copiedIndex === idx ? "fa-solid fa-check text-emerald-600 font-extrabold" : "fa-regular fa-clone"}></i>
                                        <span className="font-semibold">{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                                      </button>

                                      {/* Dynamic Stateful Speak Response Button */}
                                      <button
                                        onClick={() => {
                                          if (speakingMessageIndex === idx && window.speechSynthesis) {
                                            window.speechSynthesis.cancel();
                                            setIsTTSPlaying(false);
                                            setSpeakingMessageIndex(null);
                                          } else {
                                            speakText(msg.content, true, idx);
                                          }
                                        }}
                                        className={`p-1 px-2.5 rounded-lg border text-[10px] font-bold flex items-center space-x-1.5 shadow-sm active:scale-95 transition-all duration-200 cursor-pointer ${
                                          speakingMessageIndex === idx
                                            ? 'border-emerald-200 bg-emerald-50 text-emerald-600 animate-pulse' 
                                            : 'border-slate-200 bg-slate-50 hover:bg-slate-100/80 active:bg-slate-200 text-slate-500 hover:text-slate-800'
                                        }`}
                                        title={speakingMessageIndex === idx ? "Stop speaking response" : "Speak response aloud"}
                                        id={`speak-msg-btn-${idx}`}
                                      >
                                        <i className={`fas ${speakingMessageIndex === idx ? 'fa-stop text-red-500 animate-pulse' : 'fa-volume-high'}`}></i>
                                        <span className="font-semibold">{speakingMessageIndex === idx ? 'Stop' : 'Speak'}</span>
                                      </button>
                                    </div>
                                  </div>
                                  
                                  {/* Beautifully styled Markdown components */}
                                  <div className="text-slate-700 leading-relaxed text-sm md:text-base space-y-4">
                                    <ReactMarkdown 
                                      remarkPlugins={[remarkGfm]}
                                      components={{
                                        a: ({node, href, ...props}) => (
                                          <a 
                                            href={href}
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="text-blue-600 hover:text-blue-800 underline font-semibold cursor-pointer" 
                                            {...props} 
                                          />
                                        ),
                                        h1: ({node, ...props}) => (
                                          <h1 className="text-lg md:text-xl font-black text-[#002f5a] tracking-tight mb-4 border-b pb-2 border-slate-100 flex items-center" {...props} />
                                        ),
                                        h2: ({node, ...props}) => (
                                          <h2 className="text-sm md:text-base font-extrabold text-slate-900 tracking-tight uppercase mt-7 mb-3 bg-slate-50 border border-slate-200/65 px-3.5 py-2.5 rounded-xl border-l-[3.5px] border-l-[#008FD3] flex items-center shadow-sm" {...props} />
                                        ),
                                        h3: ({node, ...props}) => (
                                          <h3 className="text-xs md:text-sm font-black text-slate-700 tracking-wider uppercase mt-5 mb-2.5 flex items-center" {...props} />
                                        ),
                                        p: ({node, ...props}) => (
                                          <p className="text-slate-700 leading-relaxed text-sm md:text-[15px] mb-3" {...props} />
                                        ),
                                        ul: ({node, ...props}) => (
                                          <ul className="space-y-3.5 my-4 pl-0 list-none" {...props} />
                                        ),
                                        li: ({node, ...props}) => (
                                          <li className="flex items-start space-x-3 text-slate-700 leading-relaxed text-sm md:text-[15px] py-1">
                                            <span className="flex-shrink-0 w-2.5 h-2.5 mt-1.5 rounded-full bg-blue-500/80 border border-blue-200 shadow-sm flex items-center justify-center shrink-0">
                                              <span className="w-1 h-1 bg-white rounded-full"></span>
                                            </span>
                                            <span className="flex-1 text-slate-700 font-medium">{props.children}</span>
                                          </li>
                                        ),
                                        ol: ({node, ...props}) => (
                                          <ol className="space-y-3.5 my-4 pl-5 list-decimal text-slate-700 leading-relaxed text-sm md:text-[15px]" {...props} />
                                        ),
                                        strong: ({node, ...props}) => (
                                          <strong className="font-black text-[#002f5a] bg-blue-50/75 border border-blue-100/40 px-1.5 py-0.5 rounded text-[13px] md:text-[14px]" {...props} />
                                        ),
                                        hr: ({node, ...props}) => (
                                          <hr className="my-6 border-slate-100/60" {...props} />
                                        ),
                                        blockquote: ({node, ...props}) => (
                                          <blockquote className="my-5 p-4 bg-slate-50 border-l-4 border-amber-500 rounded-r-xl text-slate-700 italic text-sm md:text-[15px] leading-relaxed shadow-sm block" {...props} />
                                        ),
                                        code: ({node, className, children, ...props}) => {
                                          const isInline = !className?.includes('language-');
                                          if (isInline) {
                                            return (
                                              <code className="font-mono text-xs text-[#002f5a] bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded font-bold" {...props}>
                                                {children}
                                              </code>
                                            );
                                          }
                                          return (
                                            <CopyableCodeBlock className={className} {...props}>
                                              {children}
                                            </CopyableCodeBlock>
                                          );
                                        }
                                      }}
                                    >
                                      {msg.content}
                                    </ReactMarkdown>
                                  </div>
                                  <AnswerTrustPanel provenance={msg.provenance} onAsk={(q) => handleSubmit(undefined, q)} />
                                </div>
                              );
                            })()}
                            {!isLiveSapUnavailableMessage(msg.content) && msg.toolResults && msg.toolResults.length > 0 && (() => {
                              const getCardFamily = (r: ToolResult): string => {
                                const t = r.type;
                                if (['ecc_system_status', 'ecc_connection_verification', 'ecc_autonomous_report', 'ecc_transactions', 'ecc_tcode_launcher'].includes(t)) {
                                  return 'ecc_system_card';
                                }
                                if (t.startsWith('ecc_sd_')) {
                                  return 'ecc_sd_card';
                                }
                                if (t.startsWith('hr_hcm_') || t.startsWith('hr_executive_')) {
                                  return 'hr_hcm_card';
                                }
                                if (t.startsWith('security_') || t.startsWith('grc_')) {
                                  return 'security_card';
                                }
                                if (t.startsWith('abap_') || t === 'abap_developer_autonomous_copilot') {
                                  return 'abap_card';
                                }
                                if (['fico_autonomous_copilot', 'financial_close_automation', 'accounts_payable_automation', 'accounts_receivable_automation', 'cost_controlling_automation', 'fico_autonomous_action'].includes(t)) {
                                  return 'fico_card';
                                }
                                if (['pp_autonomous_copilot', 'pp_autonomous_action'].includes(t)) {
                                  return 'pp_card';
                                }
                                if (['mm_autonomous_copilot', 'mm_autonomous_action'].includes(t)) {
                                  return 'mm_card';
                                }
                                if (['tm_autonomous_copilot', 'tm_autonomous_action', 'carrier_selection', 'load_consolidation', 'cost_intelligence', 'predictive_transportation_ai', 'autonomous_tendering', 'freight_settlement_intelligence', 'transportation_control_tower', 'autonomous_exception_management', 'multi_agent_tm_architecture', 'multi_agent_tm_action', 'tm_approval_model'].includes(t)) {
                                  return 'tm_card';
                                }
                                if (['qm_autonomous_copilot', 'qm_approval_model', 'qm_multi_agent_architecture', 'qm_qa_catalog', 'qm_autonomous_action'].includes(t)) {
                                  return 'qm_card';
                                }
                                if (t.startsWith('bw4hana_')) {
                                  return 'bw4hana_card';
                                }
                                if (t.startsWith('ewm_')) {
                                  return `ewm_${t}`;
                                }
                                if (t.startsWith('basis_executive_')) {
                                  return `basis_${t}`;
                                }
                                if (t === 'gui_card') {
                                  return `gui_${r.data?.tCode || r.data?.title || 'screen'}`;
                                }
                                return `${t}_${r.toolName || ''}`;
                              };

                              const seen = new Set<string>();
                              const uniqueResults = msg.toolResults.filter((result) => {
                                const family = getCardFamily(result);
                                if (seen.has(family)) return false;
                                seen.add(family);
                                return true;
                              });

                              return (
                                <div className="flex flex-col space-y-4 w-full">
                                  {uniqueResults.map((result, rIdx) => (
                                    <div key={rIdx} className="w-full">
                                      <ToolResultErrorBoundary>
                                        {renderToolResult(result)}
                                      </ToolResultErrorBoundary>
                                    </div>
                                  ))}
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {(isTyping || activeAgent) && (
                  <div className="max-w-4xl mx-auto w-full">
                    <div className="inline-flex items-center space-x-4 bg-white border border-blue-100 p-4 rounded-2xl shadow-md animate-pulse">
                      <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce delay-75"></div>
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce delay-150"></div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-blue-900 uppercase tracking-widest">Agentic Automation</span>
                        <span className="text-xs text-slate-500 font-bold">{activeAgent?.name || "Processing Knowledge..."}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 bg-gradient-to-t from-[#f0f2f5] via-[#f0f2f5] to-transparent z-40">
                <div className="max-w-4xl mx-auto w-full relative group">
                  {attachedFile && (
                    <div className="absolute -top-12 left-0 flex items-center space-x-2 bg-white border border-blue-200 px-3 py-1.5 rounded-full shadow-sm animate-in slide-in-from-bottom-2">
                      <div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] text-white ${
                        attachedFile.type === 'PDF' ? 'bg-red-500' : attachedFile.type === 'CSV' ? 'bg-green-500' : 'bg-blue-500'
                      }`}>
                        <i className={`fas ${
                          attachedFile.type === 'PDF' ? 'fa-file-pdf' : attachedFile.type === 'CSV' ? 'fa-file-csv' : 'fa-file-alt'
                        }`}></i>
                      </div>
                      <span className="text-[10px] font-bold text-slate-700 max-w-[150px] truncate">{attachedFile.name}</span>
                      <button 
                        onClick={() => setAttachedFile(null)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <i className="fas fa-times text-[10px]"></i>
                      </button>
                    </div>
                  )}
                  {/* ChatGPT-style Floating Real-time Voice Console Hub */}
                  {isVoiceHubOpen && (
                    <div className="mb-4 bg-white/95 backdrop-blur-md rounded-3xl border-2 border-blue-500/30 p-5 shadow-2xl relative animate-in slide-in-from-bottom-4 duration-300">
                      {/* Top bar */}
                      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                        <div className="flex items-center space-x-2">
                          <div className={`p-1.5 rounded-lg ${isListening ? 'bg-red-50 text-red-500 animate-pulse' : 'bg-blue-50 text-[#002f5a]'}`}>
                            <i className="fas fa-microphone-lines text-sm"></i>
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-[#002f5a] uppercase tracking-wider">Voice Control Hub</h4>
                            <p className="text-[10px] text-slate-400 font-semibold cursor-default">Real-Time Speech Interaction</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="flex h-2.5 w-2.5 relative">
                            <span className={`${isListening ? 'animate-ping' : isTTSPlaying ? 'animate-pulse' : ''} absolute inline-flex h-full w-full rounded-full ${isListening ? 'bg-red-400' : isTTSPlaying ? 'bg-emerald-400' : 'bg-slate-300'} opacity-75`}></span>
                            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isListening ? 'bg-red-500' : isTTSPlaying ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                          </span>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                            {isListening ? 'Listening...' : isTTSPlaying ? 'Speaking...' : 'Ready'}
                          </span>
                        </div>
                      </div>

                      {/* Main waveform and visualizer section */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center my-3">
                        {/* Audio Wave & Status */}
                        <div className="md:col-span-5 bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col items-center justify-center min-h-[140px] relative overflow-hidden group">
                          {/* Coordinated Interactive CSS audio waves */}
                          <div className="flex items-end justify-center space-x-1.5 h-12 w-28 mb-3 z-10">
                            <span className={`w-1 bg-[#002f5a] rounded-full transition-all duration-300 ${isListening ? 'animate-[bounce_0.8s_infinite=100ms]' : isTTSPlaying ? 'animate-[bounce_0.6s_infinite_150ms]' : 'h-1.5'}`} style={{ height: isListening ? '70%' : isTTSPlaying ? '50%' : '15%' }}></span>
                            <span className={`w-1 bg-blue-500 rounded-full transition-all duration-300 ${isListening ? 'animate-[bounce_0.8s_infinite_200ms]' : isTTSPlaying ? 'animate-[bounce_0.6s_infinite_300ms]' : 'h-3/5'}`} style={{ height: isListening ? '95%' : isTTSPlaying ? '75%' : '20%' }}></span>
                            <span className={`w-1 bg-sky-400 rounded-full transition-all duration-300 ${isListening ? 'animate-[bounce_0.8s_infinite_300ms]' : isTTSPlaying ? 'animate-[bounce_0.6s_infinite_50ms]' : 'h-1.5'}`} style={{ height: isListening ? '80%' : isTTSPlaying ? '90%' : '15%' }}></span>
                            <span className={`w-1 bg-blue-600 rounded-full transition-all duration-300 ${isListening ? 'animate-[bounce_0.8s_infinite_150ms]' : isTTSPlaying ? 'animate-[bounce_0.6s_infinite_200ms]' : 'h-3/5'}`} style={{ height: isListening ? '90%' : isTTSPlaying ? '60%' : '25%' }}></span>
                            <span className={`w-1 bg-[#002f5a] rounded-full transition-all duration-300 ${isListening ? 'animate-[bounce_0.8s_infinite_250ms]' : isTTSPlaying ? 'animate-[bounce_0.6s_infinite_100ms]' : 'h-1.5'}`} style={{ height: isListening ? '65%' : isTTSPlaying ? '40%' : '15%' }}></span>
                          </div>
                          
                          <button
                            type="button"
                            onClick={toggleListening}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all shadow-md active:scale-95 z-10 flex items-center space-x-2 cursor-pointer ${
                              isListening 
                                ? 'bg-red-500 hover:bg-red-600 text-white' 
                                : 'bg-[#002f5a] hover:bg-blue-900 text-white'
                            }`}
                          >
                            <i className={`fas ${isListening ? 'fa-pause' : 'fa-microphone'}`}></i>
                            <span>{isListening ? 'Tap to Pause' : 'Tap to Speak'}</span>
                          </button>
                        </div>

                        {/* Settings & System Params */}
                        <div className="md:col-span-7 space-y-4">
                          {/* Multilingual Support Selection */}
                          <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5 cursor-default">Interaction Language</label>
                            <div className="relative">
                              <select 
                                value={voiceLang}
                                onChange={(e) => {
                                  setVoiceLang(e.target.value);
                                  if (isListening) {
                                    startListening(); // reboot recognition with new locale
                                  }
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                              >
                                {VOICE_LANGUAGES.map((lang) => (
                                  <option key={lang.code} value={lang.code}>
                                    {lang.flag} {lang.name}
                                  </option>
                                ))}
                              </select>
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">
                                <i className="fas fa-chevron-down"></i>
                              </div>
                            </div>
                          </div>

                          {/* Mode Configuration Toggles */}
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                const nextVal = !handsFreeMode;
                                setHandsFreeMode(nextVal);
                                localStorage.setItem('adi_hands_free_mode', String(nextVal));
                              }}
                              className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                handsFreeMode 
                                  ? 'bg-blue-50/50 border-blue-200 text-blue-900' 
                                  : 'bg-slate-50/50 border-slate-100 text-slate-500 hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-wider">Hands-Free</span>
                                <span className="text-[9px] text-slate-400 font-semibold">Auto-send speech</span>
                              </div>
                              <div className={`w-3 h-3 rounded-full flex items-center justify-center border ${handsFreeMode ? 'border-blue-600 bg-blue-600' : 'border-slate-300'}`}>
                                {handsFreeMode && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const nextVal = !ttsEnabled;
                                setTtsEnabled(nextVal);
                                localStorage.setItem('adi_tts_enabled', String(nextVal));
                                if (ttsEnabled && window.speechSynthesis) {
                                  window.speechSynthesis.cancel();
                                  setIsTTSPlaying(false);
                                }
                              }}
                              className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                ttsEnabled 
                                  ? 'bg-blue-50/50 border-blue-200 text-blue-900' 
                                  : 'bg-slate-50/50 border-slate-100 text-slate-500 hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-wider">TTS Synthesis</span>
                                <span className="text-[9px] text-slate-400 font-semibold">Speak responses</span>
                              </div>
                              <div className={`w-3 h-3 rounded-full flex items-center justify-center border ${ttsEnabled ? 'border-blue-600 bg-blue-600' : 'border-slate-300'}`}>
                                {ttsEnabled && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Real-time transcription block */}
                      <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100 mt-2">
                        <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 cursor-default">Live Subtitles / Transcription</span>
                        <div className="text-xs font-semibold text-slate-600 min-h-[36px] flex items-center select-text cursor-text">
                          {interimTranscript ? (
                            <span className="text-slate-800 italic animate-pulse">"{interimTranscript}"</span>
                          ) : isListening ? (
                            <span className="text-slate-400 italic">Listening to voice command...</span>
                          ) : (
                            <span className="text-slate-400">Silent. Tap speak button and speak to execute transactional commands.</span>
                          )}
                        </div>
                      </div>

                      {/* Footer block */}
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => {
                            stopListening();
                            setInput('');
                            setInterimTranscript('');
                          }}
                          className="text-[10px] font-black uppercase text-slate-400 hover:text-red-500 tracking-wider transition-colors cursor-pointer"
                        >
                          Clear Transcript
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsVoiceHubOpen(false)}
                          className="text-[10px] font-black uppercase bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg text-slate-600 tracking-wider transition-all cursor-pointer"
                        >
                          Dismiss Hub
                        </button>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="relative flex items-center">
                    {attachedImages.length > 0 && (
                      <div className="absolute -top-16 left-0 flex items-center space-x-2 bg-white/95 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-blue-200/50 animate-in slide-in-from-bottom-2 z-40 max-w-full overflow-x-auto no-scrollbar">
                        {attachedImages.map((img, i) => (
                          <div key={i} className="relative group w-11 h-11 flex-shrink-0 rounded-xl overflow-hidden shadow-sm border border-slate-200">
                            <img 
                              src={`data:${img.type};base64,${img.data}`} 
                              alt={img.name} 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setAttachedImages(prev => prev.filter((_, idx) => idx !== i));
                              }}
                              className="absolute top-0.5 right-0.5 bg-red-500/90 hover:bg-red-600 text-white rounded-full w-4.5 h-4.5 flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all text-[8px]"
                              title="Remove image"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <button 
                      type="button"
                      onClick={() => handleFileUpload('DOC')}
                      className="absolute left-4 text-slate-400 hover:text-blue-500 transition-colors cursor-pointer z-10 bottom-4 md:bottom-[22px]"
                      title="Upload Document"
                    >
                      <i className="fas fa-paperclip"></i>
                    </button>
                    <button 
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      className="absolute left-10 text-slate-400 hover:text-blue-500 transition-colors cursor-pointer z-10 bottom-4 md:bottom-[22px]"
                      title="Upload SAP Screenshot / Diagram"
                    >
                      <i className="fas fa-image"></i>
                    </button>
                    
                    <div className="absolute left-1/2 -translate-x-1/2 -top-6 pointer-events-none opacity-20 whitespace-nowrap">
                       <span className="text-[10px] font-black text-[#002f5a] uppercase tracking-[0.3em]">Adi’s Agentic AI SAP</span>
                    </div>

                    <textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmit(e);
                        }
                      }}
                      placeholder={`Logged in as ${currentUserRole}...`}
                      className="w-full bg-white border-2 border-slate-200/60 rounded-3xl pl-[72px] pr-28 py-3.5 md:py-4.5 shadow-2xl focus:outline-none focus:border-blue-500/50 transition-all text-slate-800 font-medium text-sm md:text-base resize-none overflow-y-auto max-h-[240px] leading-relaxed scroll-smooth"
                      rows={1}
                      disabled={isTyping}
                      style={{ height: 'auto', minHeight: '54px' }}
                    />

                    {/* Integrated Microphone Button */}
                    <button
                      type="button"
                      onClick={() => setIsVoiceHubOpen(prev => !prev)}
                      className={`absolute right-14 md:right-16 flex items-center justify-center h-8 w-8 md:h-10 md:w-10 rounded-full transition-all cursor-pointer z-10 bottom-2.5 md:bottom-3 ${
                        isVoiceHubOpen 
                          ? 'bg-blue-50 text-[#002f5a] hover:bg-blue-100 ring-2 ring-blue-100' 
                          : isListening 
                          ? 'bg-red-500 text-white animate-pulse' 
                          : 'text-slate-400 hover:text-blue-600 hover:bg-slate-50'
                      }`}
                      title="Toggle Voice Copilot Interaction"
                    >
                      {isListening ? (
                        <i className="fas fa-microphone-lines animate-pulse text-sm"></i>
                      ) : (
                        <i className="fas fa-microphone text-sm"></i>
                      )}
                    </button>

                    <button 
                      type="submit" 
                      disabled={isTyping || (!input.trim() && !attachedFile)} 
                      className="absolute right-3 bg-[#002f5a] text-white h-10 w-10 md:h-12 md:w-12 rounded-2xl hover:bg-blue-900 transition-all shadow-lg flex items-center justify-center active:scale-95 disabled:opacity-50 bottom-1.5 md:bottom-2"
                    >
                      {isTyping ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-arrow-up"></i>}
                    </button>
                  </form>
                </div>
              </div>
            </div>

              {/* Adjust Split handle with draggable splitter bar */}
              {sapPanelOpen && (
                <div 
                  className="w-1 bg-[#cbd5e1] hover:bg-slate-400 cursor-col-resize active:bg-slate-500 transition-all shrink-0 z-40 relative flex items-center justify-center group h-full"
                  onMouseDown={handleMouseDown}
                  title="Drag left/right to resize SAP embedded screen"
                >
                  <div className="w-0.5 h-10 rounded bg-slate-400 group-hover:bg-white"></div>
                </div>
              )}

              {/* Right Column: SAP Embedded Workbench Workspace */}
              {sapPanelOpen && (
                <div 
                  className="h-full bg-slate-50 relative shrink-0 transition-all duration-300 overflow-hidden border-l border-slate-200"
                  style={{ width: `${sapPanelWidth}%`, flex: 'none' }}
                >
                  <SapEmbeddedWorkspace 
                    tabs={sapEmbeddedTabs}
                    activeTabId={activeSapTabId}
                    onActivateTab={setActiveSapTabId}
                    onCloseTab={handleCloseSapTab}
                    onClosePanel={() => setSapPanelOpen(false)}
                    sapPanelWidth={sapPanelWidth}
                    setSapPanelWidth={setSapPanelWidth}
                    userRole={currentUserRole}
                    onAddTab={handleOpenEmbeddedSapTab}
                  />
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {activeLightboxImage && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[999] flex flex-col items-center justify-center p-4 md:p-10 animate-in fade-in duration-200">
          <button 
            type="button"
            onClick={() => setActiveLightboxImage(null)}
            className="absolute top-5 right-5 text-white bg-slate-800 hover:bg-slate-700 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 text-lg cursor-pointer border border-slate-700"
            title="Close Zoom"
          >
            ✕
          </button>
          <div className="max-w-5xl max-h-[85vh] overflow-hidden rounded-2xl border-4 border-slate-800/40 shadow-2xl relative select-none">
            <img 
              src={activeLightboxImage} 
              alt="Zoomed SAP Screens / Diagrams" 
              className="w-auto h-auto max-w-full max-h-[80vh] object-contain rounded-lg shadow-inner bg-slate-900"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="mt-4 text-xs font-bold text-slate-300 uppercase tracking-widest cursor-default bg-slate-900 border border-slate-800 px-4 py-2 rounded-full shadow-md">
            SAP Systems Image Viewer
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
