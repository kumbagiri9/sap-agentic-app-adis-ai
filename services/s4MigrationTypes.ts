import { SapAgent } from '../types';

export type MigrationPhase = 
  | 'DISCOVER' 
  | 'ASSESS' 
  | 'ANALYZE' 
  | 'PLAN' 
  | 'REMEDIATE' 
  | 'PREPARE' 
  | 'CLOUD_ARCH'
  | 'SANDBOX_CONV'
  | 'UPGRADE' 
  | 'VALIDATE' 
  | 'FIX' 
  | 'RECONCILE' 
  | 'CUTOVER'
  | 'CERTIFY'
  | 'OPERATE';

export type PrerequisiteStatus = 'PASS' | 'WARNING' | 'BLOCKER' | 'MANUAL_REVIEW';
export type RemediationSafetyLevel = 'Level 1 - Auto Fix' | 'Level 2 - Approval Required' | 'Level 3 - Expert Decision';
export type CleanCorePriority = 'MANDATORY' | 'HIGH' | 'MEDIUM' | 'OPTIMIZATION';
export type ObjectDisposition = 'KEEP' | 'AUTO-FIX' | 'MANUAL-FIX' | 'REPLACE' | 'REDESIGN' | 'RETIRE' | 'MODIFY' | 'REFACTOR' | 'REMEDIATE' | 'HUMAN REVIEW' | 'REPLACE WITH S/4 STANDARD';
export type EvidenceSourceType = 'LIVE SAP' | 'SAP TOOL' | 'LOG' | 'DOCUMENTATION' | 'AGENT INFERENCE' | 'HUMAN INPUT' | 'CUSTOMER DOCUMENT';
export type ModuleActivityStatus = 'ACTIVE & USED' | 'ACTIVE BUT LOW USAGE' | 'CONFIGURED BUT APPARENTLY UNUSED' | 'NOT ACTIVE' | 'UNVERIFIED';
export type CustomCodeClassification = 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED' | 'BLUE';
export type ActionApprovalStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'MODIFIED' | 'DEFERRED';

export interface MigrationSourceDocument {
  id: string;
  name: string;
  type: 'EXCEL' | 'CSV' | 'PDF' | 'WORD' | 'XML' | 'JSON' | 'ABAP_EXPORT' | 'SUM_LOG' | 'ATC_EXPORT' | 'READINESS_ZIP' | 'ARCHITECTURE_DOC';
  uploadDate: string;
  sizeBytes: number;
  sourcePath?: string;
  parsedEntitiesCount: number;
  priority: 1 | 2 | 3 | 4 | 5; // 1: Connected SAP ECC, 2: SAP-generated technical results, 3: SAP docs, 4: Customer docs, 5: Agent reasoning
  status: 'PARSED' | 'INDEXED' | 'FAILED';
  extractedFindings: Array<{
    category: string;
    summary: string;
    severity: 'BLOCKER' | 'HIGH' | 'MEDIUM' | 'INFO';
    sapNote?: string;
  }>;
}

export interface ActiveFunctionalModule {
  module: string;
  name: string;
  status: ModuleActivityStatus;
  monthlyTransactionVolume: number;
  coreTables: Array<{ table: string; recordCount: number; lastUpdated: string }>;
  activeTcodes: string[];
  activeJobs: string[];
  evidenceSummary: string;
  s4ImpactSummary: string;
  readinessState: 'READY' | 'REMEDIATION_REQUIRED' | 'BLOCKER' | 'NOT_APPLICABLE' | 'REQUIRES SAP/HUMAN VERIFICATION';
}

export interface CompleteObjectInventory {
  abap: {
    programs: number;
    reports: number;
    includes: number;
    classes: number;
    interfaces: number;
    functionGroups: number;
    functionModules: number;
    bapis: number;
    enhancements: number;
    badis: number;
    userExits: number;
    customerExits: number;
    enhancementSpots: number;
  };
  dictionary: {
    tables: number;
    views: number;
    structures: number;
    dataElements: number;
    domains: number;
    searchHelps: number;
    lockObjects: number;
    tableTypes: number;
  };
  customDevelopments: {
    zPrograms: number;
    zTables: number;
    zFunctionModules: number;
    zClasses: number;
    zTransactions: number;
    customerNamespaceObjects: number;
    modifiedStandardObjects: number;
  };
  businessObjects: {
    salesDocTypes: number;
    deliveryTypes: number;
    billingTypes: number;
    purchaseDocTypes: number;
    materialTypes: number;
    orderTypes: number;
    plants: number;
    companyCodes: number;
    salesOrgs: number;
    purchasingOrgs: number;
    warehouses: number;
    controllingAreas: number;
  };
}

export interface ObjectMappingItem {
  id: string;
  eccArea: string;
  eccObject: string;
  objectType: string;
  currentUsage: string;
  s4Impact: string;
  s4Target: string;
  requiredAction: 'Convert' | 'Remediate' | 'Replace' | 'Refactor' | 'Retire' | 'REQUIRES SAP/HUMAN VERIFICATION';
  sapNote?: string;
  evidenceConfidence: 'VERIFIED_100%' | 'HIGH_90%' | 'MEDIUM_75%' | 'UNVERIFIED';
  // 11-Field Comprehensive Migration Schema
  eccCurrentState?: string;
  usageEvidence?: string;
  targetS4Standard?: string;
  gapDescription?: string;
  requiredRemediation?: string;
  priority?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  ownerAgent?: string;
  upgradeAction?: string;
  testCase?: string;
  validationEvidence?: string;
}

export interface ModuleReadinessChecklist {
  module: string;
  targetS4Area: string;
  checks: Array<{
    checkName: string;
    category: 'Configuration' | 'Master Data' | 'Custom Code' | 'Simplification' | 'Interfaces' | 'Output' | 'Jobs' | 'Authorizations';
    status: PrerequisiteStatus;
    sapNote?: string;
    finding: string;
    remediation: string;
    evidenceSource: string;
  }>;
}

export interface BusinessProcessGraph {
  processName: string;
  description: string;
  stages: Array<{
    stageName: string;
    transactions: string[];
    programs: string[];
    tables: string[];
    customCode: string[];
    interfaces: string[];
    securityRoles: string[];
    jobs: string[];
    s4Change: string;
  }>;
  dependencyFlow: string[];
}

export interface HumanApprovalItem {
  id: string;
  action: string;
  system: string;
  client: string;
  objectsAffected: string[];
  businessImpact: string;
  technicalImpact: string;
  risk: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  rollback: string;
  status: ActionApprovalStatus;
  assignedAgent: string;
  sapNote?: string;
  requestedDate: string;
  decisionBy?: string;
  decisionDate?: string;
  modificationNotes?: string;
}

export interface CloudArchitectureOption {
  provider: 'AWS' | 'AZURE' | 'GCP' | 'RISE_PRIVATE';
  name: string;
  badge: string;
  vmSizingHana: string;
  vmSizingApp: string;
  storageConfig: string;
  networkTopology: string;
  haDrStrategy: string;
  backupSolution: string;
  estimatedMonthlyCostUSD: number;
  rpoHours: number;
  rtoMinutes: number;
  slaAvailability: string;
  iacTerraformSnippet: string;
  sapCertifiedNotes: string[];
}

export interface RehearsalRunItem {
  id: string;
  runName: string;
  targetEnvironment: string;
  dateExecuted: string;
  totalDowntimeHours: number;
  downtimeDmoMinutes: number;
  downtimeFinMinutes: number;
  downtimeValidationMinutes: number;
  dataTransferredGB: number;
  transferSpeedMBs: number;
  defectsDiscovered: number;
  defectsResolved: number;
  financialVariance: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PLANNED';
  keyLearnings: string[];
}

export interface MemoryLayerItem {
  layer: 'Working Memory' | 'Project Memory' | 'SAP Knowledge Layer';
  title: string;
  category: string;
  content: string;
  source: EvidenceSourceType;
  lastUpdated: string;
}

export interface RollbackGateRule {
  id: string;
  ruleId?: string;
  title?: string;
  triggerCondition: string;
  severity: 'CRITICAL_HALT' | 'HIGH_ALERT';
  evaluationMetric: string;
  threshold: string;
  currentStatus: 'NOMINAL (PROCEED)' | 'TRIGGERED (ROLLBACK)';
  requiredAuthorizer: string;
  rollbackAction: string;
  maxRtoHours?: number;
  targetPhase?: string;
  automatedAction?: string;
  decisionAuthority?: string;
  storageSnapshotRef?: string;
}

export interface MigrationSystemLandscape {
  systemId: string;
  sourceVersion: string;
  targetVersion: string;
  enhancementPackage: string;
  supportPackageStack: string;
  netWeaverVersion: string;
  kernelVersion: string;
  operatingSystem: string;
  databaseEngine: string;
  databaseSizeGB: number;
  unicodeActive: boolean;
  unicodeCodePage: string;
  hanaReadiness: string;
  installedComponents: Array<{ component: string; release: string; level: string; description: string }>;
  addOns: Array<{ name: string; release: string; vendor: string; s4Status: 'Compatible' | 'Certified' | 'Decommission' | 'Upgrade Required' }>;
  businessFunctions: Array<{ name: string; status: 'Orchestrating' | 'Always On in S/4' | 'Incompatible' | 'Not Used'; impact: string }>;
  activatedSwitches: string[];
  clients: Array<{ client: string; role: string; currency: string; usersCount: number }>;
  languages: string[];
  interfacesCount: number;
  rfcDestinationsCount: number;
  logicalSystems: string[];
  transportConfiguration: {
    domainController: string;
    tmsStatus: string;
    openTransportsCount: number;
    stmsLandscape: string;
  };
  batchJobsCount: number;
  activeWorkflowsCount: number;
  idocTypesCount: number;
  customZObjectsCount: number;
  customModificationsCount: number;
  readinessScore: number;
  technicalDebtLevel: 'High' | 'Medium' | 'Low';
  dataVolumeBreakdown: Array<{ category: string; sizeGB: number; tableCount: number; archivingCandidateGB: number }>;
}

export interface PrerequisiteCheck {
  id: string;
  name: string;
  category: 'Readiness Check' | 'Maintenance Planner' | 'Simplification Checks' | 'ATC Code Checks' | 'SUM/DMO Pre-checks' | 'HANA Sizing' | 'Add-on Compatibility' | 'Business Functions';
  status: PrerequisiteStatus;
  sapNote: string;
  evidence: string;
  impact: string;
  remediation: string;
  assignedAgent: string;
}

export interface ReverseEngineeringItem {
  id: string;
  businessProcess: string;
  sapModule: string;
  configArea: string;
  transactionCode: string;
  programName: string;
  tables: string[];
  enhancementPoints: string[];
  interfaces: string[];
  securityRoles: string[];
  downstreamDependencies: string[];
  disposition: ObjectDisposition;
  cleanCoreRecommendation: string;
}

export interface SimplificationCatalogItem {
  id: string;
  module: string;
  eccObject: string;
  s4Replacement: string;
  impactType: 'Functional' | 'Technical' | 'Business' | 'Downstream';
  remediationAction: string;
  strategicValue: string;
  isSystemUsingFeature: boolean;
  affectedBusinessProcesses: string[];
  mandatoryRemediation: string;
  responsibleAgent: string;
  prerequisite: string;
  severity: 'BLOCKER' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  estimatedEffortDays: number;
  validationProcedure: string;
}

export interface CustomCodeIncompatibility {
  objectName: string;
  objectType: 'Program' | 'BAdI' | 'User Exit' | 'Table' | 'Class' | 'Function Module' | 'Structure';
  package: string;
  owner: string;
  module: string;
  usage: string;
  lastUsageEvidence: string;
  dependencies: string[];
  referencedTables: string[];
  s4Impact: string;
  incompatibility?: string;
  atcFinding: string;
  simplificationImpact: string;
  recommendedAction: string;
  classification: CustomCodeClassification; // GREEN | YELLOW | ORANGE | RED | BLUE
  disposition: ObjectDisposition; // KEEP | REMEDIATE | REPLACE WITH S/4 STANDARD | REFACTOR | RETIRE | HUMAN REVIEW
  priority: 'Critical' | 'Medium' | 'Low';
  category: 'AUTO-FIXABLE' | 'DEVELOPER-FIX' | 'FUNCTIONAL-DECISION' | 'OBSOLETE' | 'NO-CHANGE';
  remediationOption: string;
  cleanCoreCleanliness: string;
  hanaCompatibility: string;
  safetyLevel: RemediationSafetyLevel;
  legacyCodeSnippet: string;
  remediatedCodeSnippet: string;
  status: 'Pending' | 'Remediated' | 'Approved';
}

export interface FunctionalMigrationArea {
  module: string;
  agentId: string;
  agentName: string;
  eccCurrentState: string;
  s4Impact: string;
  requiredChange: string;
  migrationAction: string;
  testCase: string;
  validationEvidence: string;
  status: 'Analyzed' | 'Remediated' | 'Validated';
  crossModuleHandoffs: string[];
}

export interface FinanceTransformationData {
  universalJournalStatus: string;
  acdocaAlignmentPercentage: number;
  assetAccountingStatus: string;
  materialLedgerStatus: string;
  creditManagementFscmStatus: string;
  reconciliationSummary: {
    glBalances: string;
    arBalances: string;
    apBalances: string;
    assetBalances: string;
    variance: string;
  };
  obsoleteStructuresRemediated: Array<{ oldTable: string; newTarget: string; usageCount: number; status: string }>;
}

export interface CviBusinessPartnerData {
  totalCustomers: number;
  totalVendors: number;
  synchronizedBPs: number;
  synchronizationRate: number;
  cviCockpitStatus: string;
  numberRangeMappingStatus: string;
  duplicateRecordsIdentified: number;
  mandatoryFieldErrors: number;
  syncErrorsList: Array<{ id: string; type: string; entityId: string; errorMsg: string; resolution: string; status: string }>;
}

export interface HanaMigrationData {
  sourceDb: string;
  targetHanaVersion: string;
  targetMemorySizingGB: number;
  cpuCoresAllocated: number;
  compressionFactor: string;
  rowStoreTableCount: number;
  columnStoreTableCount: number;
  archivingOpportunitiesGB: number;
  ilmCandidates: Array<{ table: string; description: string; currentGB: number; archivableGB: number }>;
  unicodeStatus: string;
  dmoEligibility: 'Eligible (In-Place DMO)' | 'Eligible (DMO with System Move)' | 'Requires Prerequisite Steps';
}

export interface SumDmoExecutionData {
  currentPhase: string;
  phaseIndex: number;
  totalPhases: number;
  status: 'IDLE' | 'RUNNING' | 'COMPLETED' | 'HALTED_ON_ERROR' | 'AWAITING_APPROVAL';
  activeStepName: string;
  durationMinutes: number;
  memoryUsageGB: number;
  throughputMBs: number;
  approvalRequired: boolean;
  approvalGateName?: string;
  logs: string[];
  phaseList: Array<{ phase: string; stepNumber: number; status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | 'ERROR'; description: string }>;
}

export interface SpddSpauAdjustmentItem {
  id: string;
  objectName: string;
  type: 'Dictionary Object (SPDD)' | 'Repository Object (SPAU)' | 'Enhancement (SPAU_ENH)';
  sapStandardVersion: string;
  customModificationDelta: string;
  recommendation: 'RESET TO SAP STANDARD' | 'KEEP MODIFICATION' | 'REIMPLEMENT AS EXTENSION' | 'REVIEW REQUIRED';
  cleanCoreImpact: string;
  justification: string;
}

export interface FioriUxMigrationItem {
  eccTcode: string;
  fioriAppId: string;
  appTitle: string;
  paradigm: 'Fiori Elements' | 'Freestyle UI5' | 'Visual Harmony GUI' | 'Web Dynpro';
  businessCatalog: string;
  odataService: string;
  adoptionBenefit: string;
}

export interface SecurityMigrationData {
  pfcgRolesTotal: number;
  rolesRequiringRemediation: number;
  obsoleteAuthObjectsCount: number;
  newS4AuthObjectsConfigured: number;
  sodConflictScanStatus: string;
  criticalSecurityFindings: Array<{ roleName: string; issue: string; affectedAuthObject: string; remediation: string; riskLevel: string }>;
}

export interface IntegrationImpactItem {
  id: string;
  type: 'IDoc' | 'RFC/BAPI' | 'SOAP Web Service' | 'OData' | 'REST' | 'File/FTP' | 'CPI Flow' | 'PI/PO';
  name: string;
  sourceSystem: string;
  targetSystem: string;
  s4Status: 'WORKS AS-IS' | 'MODIFY' | 'REPLACE' | 'RETIRE' | 'UNKNOWN';
  remediationAction: string;
  regressionTestStatus: 'PASS' | 'PENDING' | 'FAIL';
}

export interface UpgradeErrorIntelligenceItem {
  id: string;
  errorPhase: string;
  logFile: string;
  errorCode: string;
  errorMessage: string;
  affectedObjects: string[];
  probableRootCause: string;
  sapNoteReference: string;
  safeAutoRemediation: boolean;
  assignedSpecialistAgent: string;
  fixStatus: 'OPEN' | 'IN_REMEDIATION' | 'RESOLVED';
}

export interface PostUpgradeDefectItem {
  id: string;
  category: 'ST22 Dump' | 'SM37 Failed Job' | 'SE80 Inactive Object' | 'SM58 Failed RFC' | 'WE02 Failed IDoc' | 'OData Failure' | 'SU53 Auth Error' | 'FI Reconciliation Difference';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  technicalCause: string;
  businessImpact: string;
  recommendedFix: string;
  responsibleAgent: string;
  validationResult: string;
  status: 'Open' | 'Resolved' | 'In Progress';
}

export interface AutonomousRemediationTask {
  id: string;
  title: string;
  riskLevel: RemediationSafetyLevel;
  beforeState: string;
  proposedChange: string;
  reason: string;
  affectedObjects: string[];
  executionResult: string;
  validationStatus: string;
  rollbackProcedure: string;
  auditTrail: string;
  isExecuted: boolean;
  isApproved: boolean;
}

export interface RegressionTestCase {
  id: string;
  scenario: 'Order-to-Cash' | 'Procure-to-Pay' | 'Record-to-Report' | 'Plan-to-Produce' | 'Hire-to-Retire' | 'Asset Management' | 'Warehouse Processes' | 'Interfaces';
  testCaseName: string;
  steps: string[];
  expectedOutcome: string;
  actualOutcome: string;
  status: 'PASS' | 'FAIL' | 'IN_PROGRESS' | 'PENDING';
  evidenceData: string;
}

export interface DataReconciliationItem {
  domain: 'General Ledger Balances' | 'Open Accounts Receivable' | 'Open Accounts Payable' | 'Material Stock Values' | 'Open Sales Orders' | 'Open Purchase Orders' | 'Asset Balance Balances' | 'Material Documents Count';
  eccBaseline: string;
  s4HanaValue: string;
  variance: string;
  toleranceThreshold: string;
  status: 'RECONCILED - ZERO VARIANCE' | 'WITHIN TOLERANCE' | 'VARIANCE DETECTED - DEFECT GENERATED';
  auditEvidence: string;
}

export interface CleanCoreScorecard {
  overallScore: number;
  tier1CoreReleasedApisPercent: number;
  tier2InAppExtensibilityPercent: number;
  tier3SideBySideBtpPercent: number;
  tier4TechnicalDebtPercent: number;
  recommendations: Array<{
    priority: CleanCorePriority;
    title: string;
    currentPattern: string;
    modernTarget: string;
    effort: string;
  }>;
}

export interface CutoverTask {
  sequence: number;
  task: string;
  ownerAgent: string;
  expectedDurationHours: number;
  downtimeImpact: boolean;
  criticalPath: boolean;
  validationCheck: string;
  status?: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';
}

export interface AgentHandoffProtocol {
  id: string;
  sourceAgent: string;
  targetAgent: string;
  system: string;
  client: string;
  issueTask: string;
  evidence: string;
  affectedObjects: string[];
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  dependency: string;
  recommendedAction: string;
  requiredApproval: string;
  validationCriteria: string;
  status: 'DISPATCHED' | 'ACKNOWLEDGED' | 'COMPLETED' | 'IN_PROGRESS';
}

export interface KnowledgeGraphNode {
  id: string;
  businessProcess: string;
  sapModule: string;
  transaction: string;
  program: string;
  customObject: string;
  tableApi: string;
  simplificationItem: string;
  s4Replacement: string;
  migrationTask: string;
  testCase: string;
  result: string;
  evidence: string;
}

export interface PlanMilestone {
  phase: 'Discover' | 'Prepare' | 'Explore' | 'Realize' | 'Deploy' | 'Run';
  task: string;
  durationDays: number;
  assignedAgent: string;
  status: 'Completed' | 'In Progress' | 'Pending';
  dependencies: string[];
}

export interface RiskAnalysisItem {
  id: string;
  riskName: string;
  category: 'Infrastructure' | 'Technical' | 'Functional' | 'Operational';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  rootCause: string;
  mitigationRecommendation: string;
}

export interface CertificationScorecard {
  certificationStatus: 'S/4HANA PRODUCTION READY' | 'NOT PRODUCTION READY - BLOCKERS DETECTED';
  overallScore: number;
  technicalUpgradePassed: boolean;
  functionalReadinessPassed: boolean;
  customCodeRemediatedPassed: boolean;
  integrationsCertifiedPassed: boolean;
  securityGovernancePassed: boolean;
  dataReconciliationPassed: boolean;
  cutoverRunbookPassed: boolean;
  cleanCoreCompliancePassed: boolean;
  totalBlockersCount: number;
  totalEvidenceCount: number;
  certifiedBy: string;
  certificationTimestamp: string;
}

export interface ReadinessScoreBreakdown {
  totalApplicableControls: number;
  verifiedPassedControls: number;
  warningControls: number;
  blockingControls: number;
  unverifiedControls: number;
  mathematicalReadinessPercent: number;
  readinessStatus: 'READY FOR TECHNICAL CONVERSION' | 'NOT READY - MANDATORY BLOCKERS DETECTED';
  confidenceScore: number;
  domainBreakdown: Record<string, {
    total: number;
    passed: number;
    warnings: number;
    blockers: number;
    percent: number;
  }>;
}

export interface CompleteMigrationSuiteData {
  targetRelease: string;
  migrationAgents?: SapAgent[];
  superAgentStatus?: {
    agentName: string;
    role: string;
    state: string;
    activeStage: string;
    totalStages: number;
    globalReadinessScore: number;
    globalRiskScore: number;
    criticalPathDowntimeHours: number;
    zeroVarianceStatus: string;
    rollbackReadiness: number;
    evidenceMarkersCount: number;
  };
  orchestratorPhase: MigrationPhase;
  phaseProgress: Record<string, { percent: number; status: 'COMPLETED' | 'IN_PROGRESS' | 'BLOCKED' | 'PENDING'; evidenceCount: number; blockersCount: number }>;
  overallReadiness: number;
  migrationConfidence: number;
  readinessScoreBreakdown: ReadinessScoreBreakdown;
  criticalBlockers: Array<{ id: string; title: string; agent: string; phase: string; sapNote?: string; severity: 'BLOCKER' | 'WARNING' | 'MANUAL_REVIEW'; resolution: string; status: 'OPEN' | 'RESOLVED' | 'WAIVED' }>;
  systemLandscape: MigrationSystemLandscape;
  activeFunctionalModules: ActiveFunctionalModule[];
  functionalModules?: ActiveFunctionalModule[];
  objectInventory: CompleteObjectInventory;
  objectMappings: ObjectMappingItem[];
  moduleReadinessChecklists: ModuleReadinessChecklist[];
  moduleChecklists?: ModuleReadinessChecklist[];
  businessProcesses: BusinessProcessGraph[];
  humanApprovals: HumanApprovalItem[];
  sourceDocuments: MigrationSourceDocument[];
  prerequisites: PrerequisiteCheck[];
  reverseEngineering: ReverseEngineeringItem[];
  simplifications: SimplificationCatalogItem[];
  customCodeIncompatibilities: CustomCodeIncompatibility[];
  customCode?: CustomCodeIncompatibility[];
  functionalAreas: FunctionalMigrationArea[];
  financeTransformation: FinanceTransformationData;
  cviBusinessPartner: CviBusinessPartnerData;
  hanaMigration: HanaMigrationData;
  dataVolumeOptimization: {
    totalDatabaseSizeGB: number;
    archivingPotentialGB: number;
    currentDbSizeTB?: number;
    cleanupPotentialTB?: number;
    archivingCandidateTB?: number;
    migrationDatasetTB?: number;
    dataAgeDistribution: Array<{ ageRange: string; sizeGB: number; percent: number }>;
    topGrowthTables: Array<{ table: string; annualGrowthGB: number; archiveObject: string }>;
  };
  cloudArchitectures: CloudArchitectureOption[];
  rehearsalRuns: RehearsalRunItem[];
  sumDmoExecution: SumDmoExecutionData;
  spddSpauAdjustments: SpddSpauAdjustmentItem[];
  spddSpau?: SpddSpauAdjustmentItem[];
  fioriUxMigration: FioriUxMigrationItem[];
  fioriUx?: FioriUxMigrationItem[];
  securityMigration: SecurityMigrationData;
  integrationImpacts: IntegrationImpactItem[];
  upgradeErrorIntelligence: UpgradeErrorIntelligenceItem[];
  upgradeErrors?: UpgradeErrorIntelligenceItem[];
  postUpgradeDefects: PostUpgradeDefectItem[];
  autonomousRemediations: AutonomousRemediationTask[];
  regressionTests: RegressionTestCase[];
  dataReconciliations: DataReconciliationItem[];
  dataReconciliation?: DataReconciliationItem[];
  cleanCoreScorecard: CleanCoreScorecard;
  cutover: {
    status: string;
    totalDowntimeHours: number;
    tasks: CutoverTask[];
    criticalPathSchedule: Array<{ hour: number; task: string; agent: string; status: string }>;
  };
  cutoverTasks?: CutoverTask[];
  rollbackRules: RollbackGateRule[];
  agentHandoffs: AgentHandoffProtocol[];
  knowledgeGraph: KnowledgeGraphNode[];
  planMilestones: PlanMilestone[];
  riskAnalysis: RiskAnalysisItem[];
  certificationScorecard: CertificationScorecard;
  memoryLayers: MemoryLayerItem[];
  specializedAgents?: SapAgent[];
  hypercare: {
    status: string;
    title?: string;
    daysInHypercare?: number;
    stabilityScore?: number;
    healthIndex: number;
    openIncidents: number;
    resolvedAutonomousIncidents: number;
    criticalAnomalies: Array<{ id: string; title: string; module: string; severity: string; status: string; notes: string }>;
    adoptionKpis: Array<{ label: string; value: string; status: string }>;
  };
  autonomousUpgradeEngine?: AutonomousUpgradeEngineData;
}

export interface UpgradeWorkflowTask {
  id: string;
  name: string;
  toolCommand: string;
  agent: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'WARNING' | 'FAILED';
  durationSeconds: number;
  outputSummary: string;
  logs: string[];
}

export interface UpgradeHumanCheckpoint {
  id: string;
  number: number;
  title: string;
  mandatoryRole: string;
  description: string;
  businessImpact: string;
  technicalImpact: string;
  rollbackAction: string;
  approved: boolean;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

export interface UpgradeWorkflowStage {
  id: number;
  key: string;
  title: string;
  phase: string;
  description: string;
  status: 'PENDING' | 'RUNNING' | 'WAITING_FOR_APPROVAL' | 'APPROVED' | 'COMPLETED' | 'FAILED' | 'ROLLED_BACK';
  leadAgent: string;
  supportingAgents: string[];
  reversible: boolean;
  snapshotRef?: string;
  sapNotes: string[];
  humanCheckpoint: UpgradeHumanCheckpoint;
  tasks: UpgradeWorkflowTask[];
  telemetryLogs: string[];
}

export interface AgentArchitectureRole {
  name: string;
  role: string;
  domain: string;
  decisionLogic: string;
  tools: string[];
  triggers: string[];
}

export interface UpgradePlaybookItem {
  section: string;
  sapNotes: string[];
  steps: string[];
  criticalCommands: string[];
  verificationChecks: string[];
  contingency: string;
}

export interface UpgradeRiskMatrixItem {
  riskId: string;
  category: string;
  scenario: string;
  likelihood: 'HIGH' | 'MEDIUM' | 'LOW';
  impact: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  triggerSignal: string;
  autonomousMitigation: string;
  fallbackProcedure: string;
  rtoHours: number;
  rpoHours: number;
}

export interface AutonomousUpgradeEngineData {
  activeStageIndex: number;
  currentMode: 'AUTONOMOUS_PAUSED' | 'AUTONOMOUS_RUNNING' | 'AWAITING_HUMAN_APPROVAL' | 'UPGRADE_COMPLETE' | 'ROLLBACK_TRIGGERED';
  downtimeOptimizationStrategy: 'Downtime-Optimized DMO (ZDM Enabled)' | 'Standard DMO' | 'Near-Zero Downtime Technology (NZDT)';
  targetRelease: string;
  sourceECC: {
    systemId: string;
    ehpLevel: string;
    kernel: string;
    dbType: string;
    dbSizeGB: number;
    client: string;
    host: string;
  };
  stages: UpgradeWorkflowStage[];
  pythonOrchestrationScript: string;
  agentArchitecture: {
    orchestrationLoop: string[];
    agentHierarchy: AgentArchitectureRole[];
    dualEngineSupervision: {
      engineA: string;
      engineB: string;
      reconciliationProtocol: string;
    };
  };
  upgradePlaybook: UpgradePlaybookItem[];
  riskMitigationMatrix: UpgradeRiskMatrixItem[];
}
