import {
  MigrationSystemLandscape,
  ActiveFunctionalModule,
  CompleteObjectInventory,
  ObjectMappingItem,
  ModuleReadinessChecklist,
  BusinessProcessGraph,
  HumanApprovalItem,
  MigrationSourceDocument,
  PrerequisiteCheck,
  ReverseEngineeringItem,
  SimplificationCatalogItem,
  CustomCodeIncompatibility,
  FunctionalMigrationArea,
  FinanceTransformationData,
  CviBusinessPartnerData,
  HanaMigrationData,
  CloudArchitectureOption,
  RehearsalRunItem,
  SumDmoExecutionData,
  SpddSpauAdjustmentItem,
  FioriUxMigrationItem,
  SecurityMigrationData,
  IntegrationImpactItem,
  UpgradeErrorIntelligenceItem,
  PostUpgradeDefectItem,
  AutonomousRemediationTask,
  RegressionTestCase,
  DataReconciliationItem,
  CleanCoreScorecard,
  CutoverTask,
  RollbackGateRule,
  KnowledgeGraphNode,
  PlanMilestone,
  RiskAnalysisItem,
  CertificationScorecard,
  MemoryLayerItem
} from './s4MigrationTypes';

// ============================================================================
// 1. ECC DIGITAL BLUEPRINT & LANDSCAPE INVENTORY
// ============================================================================

export const INITIAL_SYSTEM_LANDSCAPE: MigrationSystemLandscape = {
  systemId: 'E10',
  sourceVersion: 'SAP ECC 6.0 Enhancement Package 8',
  targetVersion: 'SAP S/4HANA 2023 FPS02 (Private Cloud / On-Premise)',
  enhancementPackage: 'EhP 8 for SAP ERP 6.0',
  supportPackageStack: 'SPS 16 (SAPK-61816INSAPAPPL)',
  netWeaverVersion: 'SAP NetWeaver 7.50 SP24',
  kernelVersion: '753 Patch Level 900 (64-BIT UNICODE)',
  operatingSystem: 'SUSE Linux Enterprise Server 15 SP4 (x86_64)',
  databaseEngine: 'SAP ASE 16.0 SP04 / DB6 Enterprise',
  databaseSizeGB: 3420,
  unicodeActive: true,
  unicodeCodePage: 'UTF-16 (Unicode 11.0 / Code Page 4103)',
  hanaReadiness: 'HANA 2.0 SPS07 Certified Hardware & OS Compatible',
  installedComponents: [
    { component: 'SAP_BASIS', release: '750', level: '0024', description: 'SAP Basis Component' },
    { component: 'SAP_ABA', release: '750', level: '0024', description: 'Cross-Application Component' },
    { component: 'SAP_GWFND', release: '750', level: '0024', description: 'SAP Gateway Foundation' },
    { component: 'SAP_UI', release: '754', level: '0010', description: 'User Interface Technology 7.54' },
    { component: 'PI_BASIS', release: '750', level: '0024', description: 'Basis Plug-In' },
    { component: 'SAP_BW', release: '750', level: '0024', description: 'SAP Business Warehouse' },
    { component: 'SAP_APPL', release: '618', level: '0016', description: 'Logistics and Accounting' },
    { component: 'SAP_HR', release: '608', level: '0120', description: 'Human Resources' },
    { component: 'EA-APPL', release: '618', level: '0016', description: 'SAP Enterprise Extension PLM, SCM, Financials' },
    { component: 'EA-DFPS', release: '618', level: '0016', description: 'Defense Forces & Public Security' },
    { component: 'EA-FIN', release: '618', level: '0016', description: 'SAP Enterprise Extension Financials' },
    { component: 'EA-GLPS', release: '618', level: '0016', description: 'SAP Enterprise Extension Global Public Sector' },
    { component: 'EA-HR', release: '608', level: '0120', description: 'SAP Enterprise Extension HR' },
    { component: 'EA-PS', release: '618', level: '0016', description: 'SAP Enterprise Extension Public Services' },
    { component: 'EA-RETAIL', release: '618', level: '0016', description: 'SAP Enterprise Extension Retail' }
  ],
  addOns: [
    { name: 'ST-A/PI', release: '01U_731', vendor: 'SAP', s4Status: 'Upgrade Required' },
    { name: 'ST-PI', release: '740_SP18', vendor: 'SAP', s4Status: 'Upgrade Required' },
    { name: 'SAP_BS_FND', release: '748_SP16', vendor: 'SAP', s4Status: 'Compatible' },
    { name: 'WEBSERVICES', release: '1.0', vendor: 'SAP', s4Status: 'Compatible' },
    { name: 'OTEXBASIS', release: '16.2', vendor: 'OpenText', s4Status: 'Certified' },
    { name: 'VIM_7_5', release: '7.5_SP08', vendor: 'OpenText Vendor Invoice Management', s4Status: 'Upgrade Required' },
    { name: 'VERTEX_SIC', release: '4.2', vendor: 'Vertex Indirect Tax', s4Status: 'Upgrade Required' }
  ],
  businessFunctions: [
    { name: 'FIN_GL_CI_1', status: 'Always On in S/4', impact: 'New General Ledger Accounting is standard in S/4HANA ACDOCA' },
    { name: 'FIN_AA_CI_1', status: 'Always On in S/4', impact: 'New Asset Accounting mandatory in S/4HANA' },
    { name: 'LOG_MM_CI_1', status: 'Always On in S/4', impact: 'Purchasing & Inventory management enhancements enabled' },
    { name: 'LOG_SD_CI_1', status: 'Always On in S/4', impact: 'Sales & Distribution core enhancements active' },
    { name: 'FIN_LOC_SRT', status: 'Incompatible', impact: 'Obsolete special reporting switches must be deactivated prior to SUM' },
    { name: 'EA-FIN', status: 'Always On in S/4', impact: 'Financials Extension Enterprise Add-on standard in core' }
  ],
  activatedSwitches: ['SFW_FIN_GL_ACTIVE', 'SFW_MM_PURCHASING', 'SFW_SD_ENHANCED', 'SFW_AA_NEW'],
  clients: [
    { client: '800', role: 'Production ERP Instance', currency: 'USD', usersCount: 1480 },
    { client: '810', role: 'Quality Assurance & Staging', currency: 'USD', usersCount: 220 },
    { client: '820', role: 'Development & Customization', currency: 'USD', usersCount: 85 },
    { client: '000', role: 'System Master Repository', currency: 'EUR', usersCount: 5 }
  ],
  languages: ['EN (English - Master)', 'DE (German)', 'ES (Spanish)', 'FR (French)'],
  interfacesCount: 84,
  rfcDestinationsCount: 42,
  logicalSystems: ['E10CLNT800', 'S10CLNT100', 'BW1CLNT800', 'PI1CLNT800', 'EWMCLNT800'],
  transportConfiguration: {
    domainController: 'DOM_E10 (Master Domain Controller)',
    tmsStatus: 'CONFIGURED & HEALTHY (0 Queue Errors)',
    openTransportsCount: 18,
    stmsLandscape: 'DEV (E10-820) -> QAS (E10-810) -> PRD (E10-800)'
  },
  batchJobsCount: 312,
  activeWorkflowsCount: 48,
  idocTypesCount: 36,
  customZObjectsCount: 482,
  customModificationsCount: 28,
  readinessScore: 78.4,
  technicalDebtLevel: 'Medium',
  dataVolumeBreakdown: [
    { category: 'Financials & Universal Ledger (BSEG/BKPF/BSIS)', sizeGB: 1120, tableCount: 42, archivingCandidateGB: 340 },
    { category: 'Logistics & Material Documents (MSEG/MKPF/MATDOC)', sizeGB: 860, tableCount: 38, archivingCandidateGB: 280 },
    { category: 'Sales & Billing Documents (VBAK/VBAP/VBRK)', sizeGB: 640, tableCount: 32, archivingCandidateGB: 190 },
    { category: 'Technical Logs & IDocs (EDIDC/EDID4/BALDAT/ST22)', sizeGB: 480, tableCount: 24, archivingCandidateGB: 310 },
    { category: 'Master Data & Custom Tables (KNA1/LFA1/Z*)', sizeGB: 320, tableCount: 112, archivingCandidateGB: 45 }
  ]
};

// ============================================================================
// 2. ACTIVE FUNCTIONAL MODULES WITH EVIDENCE (24 MODULES)
// ============================================================================

export const INITIAL_FUNCTIONAL_MODULES: ActiveFunctionalModule[] = [
  {
    module: 'FI',
    name: 'Financial Accounting (General Ledger, AP, AR, AA, Bank)',
    status: 'ACTIVE & USED',
    monthlyTransactionVolume: 428000,
    coreTables: [
      { table: 'BKPF', recordCount: 12450000, lastUpdated: '2026-08-26 18:42:10 UTC' },
      { table: 'BSEG', recordCount: 38900000, lastUpdated: '2026-08-26 18:42:10 UTC' },
      { table: 'BSIS', recordCount: 6120000, lastUpdated: '2026-08-26 18:40:00 UTC' },
      { table: 'BSAS', recordCount: 14800000, lastUpdated: '2026-08-26 18:40:00 UTC' }
    ],
    activeTcodes: ['FB01', 'FB50', 'F-02', 'F110', 'FBL1N', 'FBL5N', 'F.01', 'AFAB', 'F-90'],
    activeJobs: ['SAPF110S', 'RAPERB2000', 'SAPF181', 'RFBILA00'],
    evidenceSummary: 'Core enterprise G/L postings active across Company Codes 1000 and 1710. Daily payment runs (F110) processing ~4,200 invoices.',
    s4ImpactSummary: 'ACDOCA replaces index tables (BSIS, BSAS, BSID, BSAD, BSIK, BSAK) and FAGLFLEXT. New Asset Accounting (FI-AA) mandatory.',
    readinessState: 'REMEDIATION_REQUIRED'
  },
  {
    module: 'CO',
    name: 'Controlling (Cost Center, Profit Center, Internal Orders, CO-PA)',
    status: 'ACTIVE & USED',
    monthlyTransactionVolume: 185000,
    coreTables: [
      { table: 'COEP', recordCount: 18400000, lastUpdated: '2026-08-26 18:35:00 UTC' },
      { table: 'COBK', recordCount: 4200000, lastUpdated: '2026-08-26 18:35:00 UTC' },
      { table: 'COSP', recordCount: 3100000, lastUpdated: '2026-08-26 17:00:00 UTC' }
    ],
    activeTcodes: ['KS01', 'KS02', 'KO01', 'KO88', 'KOB1', 'KE51', 'KE24', 'KSU5'],
    activeJobs: ['RKALCO43', 'RKERRP00', 'RKKBAL00'],
    evidenceSummary: 'Costing-based CO-PA actively posting alongside Cost Center Accounting (18.4M line items). Monthly assessment cycles (KSU5).',
    s4ImpactSummary: 'Account-based CO-PA merged into ACDOCA. Secondary cost elements created as G/L accounts of type (Category 21, 31, 42).',
    readinessState: 'READY'
  },
  {
    module: 'SD',
    name: 'Sales and Distribution (Order-to-Cash, Pricing, Billing, Delivery)',
    status: 'ACTIVE & USED',
    monthlyTransactionVolume: 295000,
    coreTables: [
      { table: 'VBAK', recordCount: 4850000, lastUpdated: '2026-08-26 19:10:00 UTC' },
      { table: 'VBAP', recordCount: 14200000, lastUpdated: '2026-08-26 19:10:00 UTC' },
      { table: 'VBRK', recordCount: 3900000, lastUpdated: '2026-08-26 19:05:00 UTC' },
      { table: 'KONV', recordCount: 22800000, lastUpdated: '2026-08-26 19:10:00 UTC' }
    ],
    activeTcodes: ['VA01', 'VA02', 'VA03', 'VL01N', 'VL02N', 'VF01', 'VF02', 'VK11', 'VKOA'],
    activeJobs: ['SDVBFA00', 'RV50SBT1', 'RV60SBAT', 'SDBILLDL'],
    evidenceSummary: 'High-frequency order processing (~9,800 orders/day) with complex pricing procedures and tiered discounts.',
    s4ImpactSummary: 'KONV replaced by PRCD_ELEMENTS. Status fields VBUK/VBUP moved to VBAK/VBAP. Classic SD credit management replaced by FSCM.',
    readinessState: 'BLOCKER'
  },
  {
    module: 'MM',
    name: 'Materials Management & Purchasing (Procure-to-Pay, Inventory, Invoice)',
    status: 'ACTIVE & USED',
    monthlyTransactionVolume: 340000,
    coreTables: [
      { table: 'EKKO', recordCount: 2950000, lastUpdated: '2026-08-26 18:50:00 UTC' },
      { table: 'EKPO', recordCount: 8900000, lastUpdated: '2026-08-26 18:50:00 UTC' },
      { table: 'MSEG', recordCount: 21500000, lastUpdated: '2026-08-26 18:55:00 UTC' },
      { table: 'MKPF', recordCount: 7100000, lastUpdated: '2026-08-26 18:55:00 UTC' }
    ],
    activeTcodes: ['ME21N', 'ME22N', 'ME23N', 'MIGO', 'MIRO', 'MM01', 'MM02', 'MM03', 'MD04'],
    activeJobs: ['RM06EN00', 'RM07MBST', 'RMMMBEST', 'RMBEWEXT'],
    evidenceSummary: 'Procurement operations across 3 purchasing orgs and 6 plant sites. Material documents averaging ~11,000 movements daily.',
    s4ImpactSummary: 'MSEG/MKPF replaced by MATDOC single table. Material Number extended to 40 characters (MATNR). Sourcing & Procurement simplified.',
    readinessState: 'REMEDIATION_REQUIRED'
  },
  {
    module: 'PP',
    name: 'Production Planning & Control (BOMs, Routings, Work Centers, MRP)',
    status: 'ACTIVE & USED',
    monthlyTransactionVolume: 110000,
    coreTables: [
      { table: 'AFKO', recordCount: 1850000, lastUpdated: '2026-08-26 17:30:00 UTC' },
      { table: 'AFPO', recordCount: 2100000, lastUpdated: '2026-08-26 17:30:00 UTC' },
      { table: 'MAST', recordCount: 42000, lastUpdated: '2026-08-25 12:00:00 UTC' }
    ],
    activeTcodes: ['CO01', 'CO02', 'CO03', 'CO11N', 'MD01', 'MD02', 'MD04', 'CS01', 'CA01'],
    activeJobs: ['RMMRP000', 'SAPLCOKO', 'PP_CONFIRM_BATCH'],
    evidenceSummary: 'Make-to-Stock and Make-to-Order production active in Plants 1000 and 1010. Nightly MRP batch runs.',
    s4ImpactSummary: 'Classic MRP replaced by MRP Live (MD01N) running directly in HANA memory. Planning files migrated from DBVM to MDVM.',
    readinessState: 'READY'
  },
  {
    module: 'QM',
    name: 'Quality Management (Inspection Lots, Results Recording, Usage Decision)',
    status: 'ACTIVE & USED',
    monthlyTransactionVolume: 45000,
    coreTables: [
      { table: 'QALS', recordCount: 890000, lastUpdated: '2026-08-26 16:20:00 UTC' },
      { table: 'QASE', recordCount: 2400000, lastUpdated: '2026-08-26 16:20:00 UTC' }
    ],
    activeTcodes: ['QA01', 'QA02', 'QA03', 'QE51N', 'QA11', 'QS21'],
    activeJobs: ['RQEVAI30', 'RQSTCH00'],
    evidenceSummary: 'Goods receipt inspection lots auto-generated on 01/04 inspection types upon MIGO posting.',
    s4ImpactSummary: 'QM fully compatible; results recording accelerated via Fiori Record Inspection Results app.',
    readinessState: 'READY'
  },
  {
    module: 'PM',
    name: 'Plant Maintenance & Enterprise Asset Management (Work Orders, Equipments)',
    status: 'ACTIVE & USED',
    monthlyTransactionVolume: 32000,
    coreTables: [
      { table: 'EQUI', recordCount: 145000, lastUpdated: '2026-08-26 14:10:00 UTC' },
      { table: 'IFLOT', recordCount: 28000, lastUpdated: '2026-08-26 14:10:00 UTC' },
      { table: 'AFIH', recordCount: 480000, lastUpdated: '2026-08-26 15:00:00 UTC' }
    ],
    activeTcodes: ['IE01', 'IE02', 'IE03', 'IL01', 'IW31', 'IW32', 'IW38', 'IP10'],
    activeJobs: ['RIORDREP', 'RIIFLO20', 'RIPLAN00'],
    evidenceSummary: 'Preventive and corrective maintenance orders active across 14,200 active equipment records.',
    s4ImpactSummary: 'Standard PM objects fully compatible; maintenance orders settle to universal journal cost objects.',
    readinessState: 'READY'
  },
  {
    module: 'WM',
    name: 'Warehouse Management (Classic LE-WM)',
    status: 'ACTIVE BUT LOW USAGE',
    monthlyTransactionVolume: 18000,
    coreTables: [
      { table: 'LQUA', recordCount: 120000, lastUpdated: '2026-08-26 13:00:00 UTC' },
      { table: 'LTAP', recordCount: 450000, lastUpdated: '2026-08-26 13:00:00 UTC' }
    ],
    activeTcodes: ['LT01', 'LT03', 'LT12', 'LS26', 'LX02'],
    activeJobs: ['RLAUTA10', 'RLVSK000'],
    evidenceSummary: 'Classic LE-WM configured in Warehouse 100 with basic bin management.',
    s4ImpactSummary: 'Classic LE-WM has compatibility scope expiration (End of 2025). Must migrate to S/4HANA Stock Room Management or Embedded EWM.',
    readinessState: 'REMEDIATION_REQUIRED'
  },
  {
    module: 'EWM',
    name: 'Extended Warehouse Management (Decentralized / Embedded)',
    status: 'CONFIGURED BUT APPARENTLY UNUSED',
    monthlyTransactionVolume: 0,
    coreTables: [
      { table: '/SCWM/AQUA', recordCount: 0, lastUpdated: 'Never' }
    ],
    activeTcodes: ['/SCWM/MON', '/SCWM/PRDO'],
    activeJobs: [],
    evidenceSummary: 'RFC destination configured for decentralized EWM pilot in 2021, but 0 transactional movements recorded in past 24 months.',
    s4ImpactSummary: 'Target architecture recommends activating S/4HANA Embedded EWM Basic Edition (included in standard S/4 license).',
    readinessState: 'READY'
  },
  {
    module: 'HCM',
    name: 'Human Capital Management (Personnel Administration, Org Management)',
    status: 'ACTIVE & USED',
    monthlyTransactionVolume: 22000,
    coreTables: [
      { table: 'PA0001', recordCount: 14800, lastUpdated: '2026-08-26 10:00:00 UTC' },
      { table: 'PA0002', recordCount: 14800, lastUpdated: '2026-08-26 10:00:00 UTC' },
      { table: 'HRP1000', recordCount: 3200, lastUpdated: '2026-08-25 15:00:00 UTC' }
    ],
    activeTcodes: ['PA20', 'PA30', 'PPOME', 'PA40'],
    activeJobs: ['RPUDIR00', 'RHINTE00'],
    evidenceSummary: 'Mini-master employee records maintained for workflow approvals and CATS time entry.',
    s4ImpactSummary: 'SAP HCM on S/4HANA (H4S4) or integration to SAP SuccessFactors Employee Central required.',
    readinessState: 'READY'
  },
  {
    module: 'PS',
    name: 'Project System (WBS Elements, Networks, Cost Budgets)',
    status: 'ACTIVE BUT LOW USAGE',
    monthlyTransactionVolume: 4200,
    coreTables: [
      { table: 'PROJ', recordCount: 4500, lastUpdated: '2026-08-25 18:00:00 UTC' },
      { table: 'PRPS', recordCount: 22000, lastUpdated: '2026-08-25 18:00:00 UTC' }
    ],
    activeTcodes: ['CJ01', 'CJ02', 'CJ20N', 'CJI3'],
    activeJobs: ['RPSCO000'],
    evidenceSummary: 'Capital investment projects managed with WBS hierarchy and settlement to Asset Under Construction (AuC).',
    s4ImpactSummary: 'Project System fully supported in S/4HANA core.',
    readinessState: 'READY'
  },
  {
    module: 'CS',
    name: 'Customer Service (Service Orders, Notifications, Warranties)',
    status: 'CONFIGURED BUT APPARENTLY UNUSED',
    monthlyTransactionVolume: 120,
    coreTables: [
      { table: 'IHPA', recordCount: 1400, lastUpdated: '2024-11-12 09:00:00 UTC' }
    ],
    activeTcodes: ['IW51', 'IW52'],
    activeJobs: [],
    evidenceSummary: 'Minimal usage detected. Only 120 service notifications created over past 12 months.',
    s4ImpactSummary: 'Service orders migrate to S/4HANA Service Core.',
    readinessState: 'READY'
  },
  {
    module: 'LE',
    name: 'Logistics Execution & Transportation (Shipments, Freight)',
    status: 'ACTIVE & USED',
    monthlyTransactionVolume: 64000,
    coreTables: [
      { table: 'VTTK', recordCount: 420000, lastUpdated: '2026-08-26 18:00:00 UTC' },
      { table: 'VTTP', recordCount: 980000, lastUpdated: '2026-08-26 18:00:00 UTC' }
    ],
    activeTcodes: ['VT01N', 'VT02N', 'VT03N', 'VI01'],
    activeJobs: ['RV56TR00'],
    evidenceSummary: 'Outbound shipments and freight cost calculation (VI01) executed for distribution routes.',
    s4ImpactSummary: 'LE-TRA (Transportation) is deprecated in S/4HANA. Replaced by S/4HANA Basic Transportation Management (Embedded TM).',
    readinessState: 'REMEDIATION_REQUIRED'
  },
  {
    module: 'TM',
    name: 'Transportation Management (Standalone)',
    status: 'NOT ACTIVE',
    monthlyTransactionVolume: 0,
    coreTables: [],
    activeTcodes: [],
    activeJobs: [],
    evidenceSummary: 'No standalone SAP TM instance connected.',
    s4ImpactSummary: 'Opportunity to leverage Embedded TM Basic in S/4HANA 2023.',
    readinessState: 'NOT_APPLICABLE'
  },
  {
    module: 'GTS',
    name: 'Global Trade Services (Sanctioned Party, Customs, Export Control)',
    status: 'ACTIVE & USED',
    monthlyTransactionVolume: 18500,
    coreTables: [
      { table: '/SAPSLL/CORCTS', recordCount: 84000, lastUpdated: '2026-08-26 17:00:00 UTC' }
    ],
    activeTcodes: ['/SAPSLL/SPL_CHCK'],
    activeJobs: ['/SAPSLL/SPL_DELTA_CHECK'],
    evidenceSummary: 'Automated RFC calls to GTS 11.0 on every Sales Order creation and Outbound Delivery for export screening.',
    s4ImpactSummary: 'Classic Foreign Trade in ECC (SD-FT/MM-FT) eliminated. GTS interface must be repointed via S/4 SLL plugin.',
    readinessState: 'READY'
  },
  {
    module: 'CRM',
    name: 'Customer Relationship Management',
    status: 'NOT ACTIVE',
    monthlyTransactionVolume: 0,
    coreTables: [],
    activeTcodes: [],
    activeJobs: [],
    evidenceSummary: 'No SAP CRM instance connected; customer engagement handled via direct ECC and external portal.',
    s4ImpactSummary: 'Not applicable.',
    readinessState: 'NOT_APPLICABLE'
  },
  {
    module: 'SRM',
    name: 'Supplier Relationship Management',
    status: 'NOT ACTIVE',
    monthlyTransactionVolume: 0,
    coreTables: [],
    activeTcodes: [],
    activeJobs: [],
    evidenceSummary: 'No SAP SRM instance connected; procurement handled directly via MM-PUR.',
    s4ImpactSummary: 'Not applicable.',
    readinessState: 'NOT_APPLICABLE'
  },
  {
    module: 'BW',
    name: 'Business Warehouse Extractors (Service API / DataSource)',
    status: 'ACTIVE & USED',
    monthlyTransactionVolume: 52000,
    coreTables: [
      { table: 'ROOSOURCE', recordCount: 148, lastUpdated: '2026-08-20 10:00:00 UTC' },
      { table: 'RODELTAM', recordCount: 64, lastUpdated: '2026-08-26 18:00:00 UTC' }
    ],
    activeTcodes: ['RSA5', 'RSA6', 'RSA7', 'RSO2'],
    activeJobs: ['RBDMIDOC', 'BW_DELTA_EXTRACT'],
    evidenceSummary: '64 delta DataSources actively replicating transaction data to external BW/4HANA landscape.',
    s4ImpactSummary: 'Logistics extraction (LIS/MC11) replaced by ABAP Core Data Services (CDS) Views for real-time reporting.',
    readinessState: 'READY'
  },
  {
    module: 'Workflow',
    name: 'Business Workflow (SAP Business Workflow Engine)',
    status: 'ACTIVE & USED',
    monthlyTransactionVolume: 28000,
    coreTables: [
      { table: 'SWWWIHEAD', recordCount: 420000, lastUpdated: '2026-08-26 18:45:00 UTC' },
      { table: 'SWWLOGHIST', recordCount: 1850000, lastUpdated: '2026-08-26 18:45:00 UTC' }
    ],
    activeTcodes: ['SWDD', 'SWI1', 'SWIA', 'SBWP'],
    activeJobs: ['RSWWERRE', 'RSWWCOND'],
    evidenceSummary: 'Active multi-step approval workflows for Purchase Orders (> 0k), Journal Entries, and Credit Limit releases.',
    s4ImpactSummary: 'Workflow engine fully compatible; SAP My Inbox Fiori app integrates directly with standard task container.',
    readinessState: 'READY'
  },
  {
    module: 'Basis',
    name: 'Basis, Spool, Transports, System Landscape Directory',
    status: 'ACTIVE & USED',
    monthlyTransactionVolume: 1200000,
    coreTables: [
      { table: 'TMSPCSYS', recordCount: 8, lastUpdated: '2026-08-01 10:00:00 UTC' },
      { table: 'TSP01', recordCount: 48000, lastUpdated: '2026-08-26 19:12:00 UTC' }
    ],
    activeTcodes: ['ST03N', 'SM50', 'SM51', 'SM21', 'ST22', 'SM37', 'STMS', 'SPAD', 'RZ10'],
    activeJobs: ['SAP_REORG_SPOOL', 'SAP_REORG_JOBS', 'SAP_CCMS_MONI_BATCH'],
    evidenceSummary: 'Standard production operation with 8 app servers, 312 recurring batch jobs, and TMS transport route control.',
    s4ImpactSummary: 'Kernel upgrade to 753+, Unicode UTF-16 validated, In-place SUM/DMO conversion path certified.',
    readinessState: 'READY'
  },
  {
    module: 'Security',
    name: 'Authorizations, PFCG Roles, User Management (SU01/PFCG)',
    status: 'ACTIVE & USED',
    monthlyTransactionVolume: 85000,
    coreTables: [
      { table: 'USR02', recordCount: 1480, lastUpdated: '2026-08-26 19:00:00 UTC' },
      { table: 'AGR_DEFINE', recordCount: 640, lastUpdated: '2026-08-26 15:00:00 UTC' },
      { table: 'AGR_1251', recordCount: 42000, lastUpdated: '2026-08-26 15:00:00 UTC' }
    ],
    activeTcodes: ['SU01', 'SU10', 'PFCG', 'SU53', 'ST01', 'SU24', 'SU25'],
    activeJobs: ['PFCG_TIME_DEPENDENCY', 'PRGN_COMPARE_ROLE_MENU'],
    evidenceSummary: '640 single and composite PFCG roles assigned across 1,480 active dialog users with SoD governance.',
    s4ImpactSummary: 'SU25 upgrade step 2a/2b required. 82 obsolete TCodes (e.g. FD01, FK01, XK01, MB01) must be removed and replaced by BP / MIGO / Fiori Catalogs.',
    readinessState: 'REMEDIATION_REQUIRED'
  },
  {
    module: 'ABAP',
    name: 'ABAP Development & Custom Z Repository (SE38/SE80/SE24/SE37)',
    status: 'ACTIVE & USED',
    monthlyTransactionVolume: 450000,
    coreTables: [
      { table: 'TADIR', recordCount: 482, lastUpdated: '2026-08-26 18:00:00 UTC' },
      { table: 'TRDIR', recordCount: 310, lastUpdated: '2026-08-26 18:00:00 UTC' }
    ],
    activeTcodes: ['SE80', 'SE38', 'SE24', 'SE37', 'SE11', 'ATC', 'SCI'],
    activeJobs: ['ATC_SCHEDULED_RUN'],
    evidenceSummary: '482 custom objects discovered in customer namespace (Z* and Y*), including 24 critical custom reports and 18 user exit enhancements.',
    s4ImpactSummary: '38 objects require syntax remediation (KONV, VBUK, MATNR 40-char). 12 candidates identified for clean-core retirement.',
    readinessState: 'REMEDIATION_REQUIRED'
  },
  {
    module: 'Fiori/Gateway',
    name: 'SAP Gateway & Fiori Launchpad Infrastructure (/IWFND)',
    status: 'ACTIVE BUT LOW USAGE',
    monthlyTransactionVolume: 14000,
    coreTables: [
      { table: '/IWFND/I_MED_SIN', recordCount: 24, lastUpdated: '2026-08-20 12:00:00 UTC' }
    ],
    activeTcodes: ['/IWFND/MAINT_SERVICE', '/IWFND/ERROR_LOG', '/UI2/FLP'],
    activeJobs: ['/UI2/INVALIDATE_GLOBAL_CACHES'],
    evidenceSummary: 'Embedded Gateway with basic Fiori Launchpad running 6 legacy UI5 apps.',
    s4ImpactSummary: 'Modern Fiori 3.0 / Spaces & Pages architecture enabled in S/4HANA 2023.',
    readinessState: 'READY'
  },
  {
    module: 'ALE/IDoc',
    name: 'Application Link Enabling & IDoc Processing (WE02/WE20)',
    status: 'ACTIVE & USED',
    monthlyTransactionVolume: 92000,
    coreTables: [
      { table: 'EDIDC', recordCount: 1480000, lastUpdated: '2026-08-26 19:15:00 UTC' },
      { table: 'EDID4', recordCount: 4900000, lastUpdated: '2026-08-26 19:15:00 UTC' }
    ],
    activeTcodes: ['WE02', 'WE05', 'WE20', 'WE19', 'BD87'],
    activeJobs: ['RBDAPP01', 'RSEOUT00', 'RBDMIDOC'],
    evidenceSummary: 'High-volume electronic data interchange: ORDERS, INVOIC, DESADV, and MATMAS processing with 14 EDI partners.',
    s4ImpactSummary: 'IDoc segment E1EDK01/E1EDP01 compatible; partner profile port verification required for S/4 target hostnames.',
    readinessState: 'READY'
  },
  {
    module: 'Output Management',
    name: 'Message Determination & Output Control (NAST / BRF+)',
    status: 'ACTIVE & USED',
    monthlyTransactionVolume: 68000,
    coreTables: [
      { table: 'NAST', recordCount: 2840000, lastUpdated: '2026-08-26 19:00:00 UTC' }
    ],
    activeTcodes: ['NACE', 'VV11', 'VV21', 'VV31'],
    activeJobs: ['RSNAST00'],
    evidenceSummary: 'Classic NAST output determination active for Sales Order confirmation, Billing invoice printing, and Delivery notes.',
    s4ImpactSummary: 'S/4HANA introduces BRF+ Output Control (APOC_C_REVT) as new standard. Classic NAST can run in dual-mode during transition.',
    readinessState: 'REMEDIATION_REQUIRED'
  }
];

// ============================================================================
// 3. COMPLETE OBJECT INVENTORY
// ============================================================================

export const INITIAL_OBJECT_INVENTORY: CompleteObjectInventory = {
  abap: {
    programs: 310,
    reports: 142,
    includes: 86,
    classes: 54,
    interfaces: 22,
    functionGroups: 48,
    functionModules: 184,
    bapis: 38,
    enhancements: 42,
    badis: 28,
    userExits: 18,
    customerExits: 14,
    enhancementSpots: 16
  },
  dictionary: {
    tables: 112,
    views: 64,
    structures: 140,
    dataElements: 380,
    domains: 290,
    searchHelps: 34,
    lockObjects: 12,
    tableTypes: 45
  },
  customDevelopments: {
    zPrograms: 142,
    zTables: 68,
    zFunctionModules: 94,
    zClasses: 42,
    zTransactions: 78,
    customerNamespaceObjects: 482,
    modifiedStandardObjects: 28
  },
  businessObjects: {
    salesDocTypes: 14,
    deliveryTypes: 8,
    billingTypes: 10,
    purchaseDocTypes: 6,
    materialTypes: 12,
    orderTypes: 8,
    plants: 6,
    companyCodes: 4,
    salesOrgs: 3,
    purchasingOrgs: 3,
    warehouses: 2,
    controllingAreas: 1
  }
};

// ============================================================================
// 4. ECC -> S/4 OBJECT MAPPING ENGINE
// ============================================================================

export const INITIAL_OBJECT_MAPPINGS: ObjectMappingItem[] = [
  {
    id: 'MAP-001',
    eccArea: 'Master Data / Business Partner',
    eccObject: 'Customer Master (KNA1) & Vendor Master (LFA1)',
    objectType: 'Database Tables & TCodes (FD01, FK01, XK01)',
    currentUsage: 'Active in 100% of Sales Orders (VBAK) & Purchase Orders (EKKO)',
    s4Impact: 'Obsolete in S/4HANA; replaced by unified Business Partner data model (BUT000)',
    s4Target: 'BUT000 / Business Partner (Transaction BP)',
    requiredAction: 'Convert',
    sapNote: 'SAP Note 2265093 (CVI Readiness & Number Range Harmonization)',
    evidenceConfidence: 'VERIFIED_100%',
    eccCurrentState: '14,800 Customer records in KNA1 and 6,400 Vendor records in LFA1 with separate number ranges.',
    usageEvidence: 'Live reads on KNA1/LFA1 show 42 customer and 18 vendor records with missing mandatory tax IDs or postal code errors.',
    targetS4Standard: 'Unified Business Partner (BUT000, BP Roles FLCU01/FLVN01, T-Code BP).',
    gapDescription: 'Direct table inserts and legacy TCodes (FD01/FK01/XK01) blocked in S/4HANA 2025; CVI pre-check errors must be 0.',
    requiredRemediation: 'Execute MDS_LOAD_COCKPIT master data sync, align number ranges in SPRO, and replace XK01 with BP.',
    priority: 'CRITICAL',
    ownerAgent: 'CVI_BP_AGENT',
    upgradeAction: 'Run CVI Cockpit Pre-Check → Execute MDS_LOAD_COCKPIT → Validate BUT000 Synchronization (100%).',
    testCase: 'TC-CVI-01: Create & Modify Customer/Vendor Master via TCode BP and verify bidirectional persistence in BUT000/KNA1/LFA1.',
    validationEvidence: 'MDS_LOAD_COCKPIT execution log showing 0 fatal errors and 100% BUT000 mapping verification.'
  },
  {
    id: 'MAP-002',
    eccArea: 'SD Pricing',
    eccObject: 'Pricing Conditions Cluster Table (KONV)',
    objectType: 'Cluster Table',
    currentUsage: 'Active in all SD pricing procedures, calculations, and custom discount routines',
    s4Impact: 'KONV cluster eliminated; replaced by transparent table PRCD_ELEMENTS with 6-char condition fields',
    s4Target: 'PRCD_ELEMENTS (Transparent Table)',
    requiredAction: 'Remediate',
    sapNote: 'SAP Note 2267258 (KONV to PRCD_ELEMENTS Migration)',
    evidenceConfidence: 'VERIFIED_100%',
    eccCurrentState: '24 custom ABAP programs and user exit MV45AFZZ directly query cluster table KONV.',
    usageEvidence: 'ATC check S4H_CORRECTION flagged direct SELECT queries from KONV with obsolete 3-character condition types.',
    targetS4Standard: 'Transparent table PRCD_ELEMENTS with field length extension (KVEWE, KAWRT) and released CDS views.',
    gapDescription: 'Cluster access to KONV fails at runtime in S/4HANA; condition calculation fields require PRCD_ELEMENTS.',
    requiredRemediation: 'Apply automated Quick-Fixes to redirect SELECT queries from KONV to PRCD_ELEMENTS or CDS View I_PricingElement.',
    priority: 'CRITICAL',
    ownerAgent: 'ABAP_AGENT',
    upgradeAction: 'Execute SCI / ATC Quick-Fix on 24 programs → Migrate MV45AFZZ logic to BAdI BADI_SD_SALES_ITEM.',
    testCase: 'TC-PRC-01: Simulate Sales Order Pricing in VA01/VA02 and verify condition record calculation against PRCD_ELEMENTS.',
    validationEvidence: 'ATC code inspector re-scan returning 0 syntax errors on PRCD_ELEMENTS condition access.'
  },
  {
    id: 'MAP-003',
    eccArea: 'FI General Ledger',
    eccObject: 'FI Index Tables (BSIS, BSAS, BSID, BSAD, BSIK, BSAK, FAGLFLEXT)',
    objectType: 'Transparent Tables / Aggregates',
    currentUsage: 'Active in financial reporting, trial balances, and open-item extraction',
    s4Impact: 'Eliminated and replaced by Universal Journal (ACDOCA); Compatibility Views provided for standard reads',
    s4Target: 'Universal Journal (ACDOCA)',
    requiredAction: 'Refactor',
    sapNote: 'SAP Note 2267308 (ACDOCA Universal Journal Consolidation)',
    evidenceConfidence: 'VERIFIED_100%',
    eccCurrentState: 'Traditional dual ledger with separate aggregate tables (FAGLFLEXT) and subledger index tables.',
    usageEvidence: 'Live DB queries show 14 custom financial extractors reading directly from BSIS/BSID without using compatibility views.',
    targetS4Standard: 'Single Single-Source-of-Truth Universal Journal Table ACDOCA combining FI and CO line items.',
    gapDescription: 'Direct INSERT/UPDATE to index tables will crash; custom SQL queries must use ACDOCA or released CDS views.',
    requiredRemediation: 'Refactor custom financial reports to select from CDS View I_JournalEntryItem or utilize S/4 compatibility views.',
    priority: 'HIGH',
    ownerAgent: 'FI_CO_AGENT',
    upgradeAction: 'Execute FINS_MIG pre-checks → Run Universal Journal Data Migration → Zero Variance Balance Sign-off.',
    testCase: 'TC-FIN-01: Execute GL Trial Balance (F.01) and verify line item reconciliation between ACDOCA and BKPF/BSEG.',
    validationEvidence: 'FINS_MIG data reconciliation log confirming 0 variance between legacy totals and ACDOCA.'
  },
  {
    id: 'MAP-004',
    eccArea: 'SD Sales Document Status',
    eccObject: 'Header & Item Status Tables (VBUK, VBUP)',
    objectType: 'Transparent Status Tables',
    currentUsage: 'Active in order delivery checks, credit release routines, and billing status queries',
    s4Impact: 'VBUK/VBUP eliminated; status fields moved directly to VBAK (header) and VBAP (item)',
    s4Target: 'VBAK (e.g. VBAK-GBSTK) & VBAP Status Fields',
    requiredAction: 'Remediate',
    sapNote: 'SAP Note 2198647 (VBUK/VBUP Status Field Simplification)',
    evidenceConfidence: 'VERIFIED_100%',
    eccCurrentState: 'Separate status tables VBUK (header) and VBUP (item) queried across 18 custom sales reports.',
    usageEvidence: 'ATC scan flagged 18 queries joining VBAK with VBUK for overall processing status (GBSTK).',
    targetS4Standard: 'Header status fields in VBAK (VBAK-GBSTK, VBAK-LFSTK) and item status in VBAP.',
    gapDescription: 'VBUK/VBUP tables are eliminated; standard compatibility views exist for read-only, but writes fail.',
    requiredRemediation: 'Replace VBUK/VBUP JOINs in custom code with direct VBAK/VBAP field references.',
    priority: 'HIGH',
    ownerAgent: 'SD_AGENT',
    upgradeAction: 'Automated code refactoring to redirect status fields from VBUK to VBAK/VBAP.',
    testCase: 'TC-SD-02: Query overall order status in VA03 and verify delivery/credit status evaluation directly from VBAK.',
    validationEvidence: 'Automated syntax and unit test verifying VBAK status reads match expected delivery workflow.'
  },
  {
    id: 'MAP-005',
    eccArea: 'MM Inventory Management',
    eccObject: 'Material Document Tables (MKPF, MSEG)',
    objectType: 'Header / Line Item Tables',
    currentUsage: 'Active in all goods movements, inventory ledger, and stock valuation',
    s4Impact: 'Replaced by unified high-performance column table MATDOC; Compatibility Views available for reads',
    s4Target: 'MATDOC (Unified Material Documents Table)',
    requiredAction: 'Refactor',
    sapNote: 'SAP Note 2268064 (S/4HANA Inventory Management MATDOC)',
    evidenceConfidence: 'VERIFIED_100%',
    eccCurrentState: 'Dual-table model (MKPF for header, MSEG for line items) with material master valuation tables MARC/MARD.',
    usageEvidence: '12 custom inventory aging and stock reconciliation reports perform heavy dual-table JOINs on MKPF/MSEG.',
    targetS4Standard: 'Single columnar table MATDOC containing all document header, item, and valuation dimensions.',
    gapDescription: 'Historical hybrid table locks eliminated; queries should leverage MATDOC or CDS View I_MaterialDocumentItem.',
    requiredRemediation: 'Refactor custom inventory reports to query MATDOC for 20x performance improvement.',
    priority: 'HIGH',
    ownerAgent: 'MM_AGENT',
    upgradeAction: 'Execute MM data migration to MATDOC during SUM downtime → Validate stock balances across all plants.',
    testCase: 'TC-MM-01: Post Goods Receipt (MIGO 101) and verify line item entry in MATDOC with zero locking overhead.',
    validationEvidence: 'MATDOC consistency check report confirming 100% record match with historical MSEG.'
  },
  {
    id: 'MAP-006',
    eccArea: 'SD Credit Management',
    eccObject: 'Classic SD Credit (KNKK, S066, S067, VKM1, VKM3)',
    objectType: 'Credit Master & LIS Info Structures',
    currentUsage: 'Active in customer credit limit checks and risk categories',
    s4Impact: 'Classic SD Credit Management discontinued; replaced by SAP Financial Supply Chain Management (FSCM)',
    s4Target: 'SAP FSCM Credit Management (UKMBP_CMS / UKM_CASE)',
    requiredAction: 'Convert',
    sapNote: 'SAP Note 2267329 (Credit Management FSCM Migration)',
    evidenceConfidence: 'VERIFIED_100%',
    eccCurrentState: 'Customer credit limits configured in KNKK and credit open values stored in LIS info structures S066/S067.',
    usageEvidence: 'Credit limit approvals currently processed through classic transaction VKM1/VKM3.',
    targetS4Standard: 'SAP FSCM Credit Management with real-time exposure calculation and Business Partner integration.',
    gapDescription: 'KNKK and S066/S067 obsolete; credit check routines must call FSCM API instead of SD user exits.',
    requiredRemediation: 'Execute UKM_TRANSFER_VECTOR, configure credit segments in SPRO, and activate UKM_CASE approval workflow.',
    priority: 'HIGH',
    ownerAgent: 'FI_CO_AGENT',
    upgradeAction: 'Migrate credit master data to BP role UKM000 → Recreate credit limit rules in FSCM.',
    testCase: 'TC-CRD-01: Trigger order block exceeding credit limit in VA01 and execute release via FSCM Credit Case.',
    validationEvidence: 'UKM_TRANSFER_VECTOR verification log showing credit exposure migrated with zero variance.'
  },
  {
    id: 'MAP-007',
    eccArea: 'Output Control',
    eccObject: 'Classic Message Control (NAST / NACE)',
    objectType: 'Message Determination Engine',
    currentUsage: 'Active in Sales Order confirmations, Delivery slips, and Billing PDF prints',
    s4Impact: 'Replaced by S/4HANA BRF+ Output Management; NAST supported in compatibility mode',
    s4Target: 'BRF+ / S/4HANA Output Control (APOC_C_REVT)',
    requiredAction: 'Convert',
    sapNote: 'SAP Note 2154870 (S/4HANA Output Management)',
    evidenceConfidence: 'HIGH_90%',
    eccCurrentState: 'Output condition records maintained in NAST tables via transaction NACE and condition tables (B001-B999).',
    usageEvidence: '68,000 monthly output messages generated using SapScript and SmartForms for order confirmations and invoices.',
    targetS4Standard: 'Adobe Document Services (ADS) with S/4HANA BRF+ Output Control and Fiori Output Management.',
    gapDescription: 'NAST operates in compatibility mode; new Fiori apps require BRF+ decision tables for PDF rendering.',
    requiredRemediation: 'Implement BRF+ decision rules in APOC_C_REVT for new billing document types; retain NAST for legacy forms.',
    priority: 'MEDIUM',
    ownerAgent: 'ABAP_AGENT',
    upgradeAction: 'Configure BRF+ output channels (EMAIL, PRINT) → Migrate SmartForms to Adobe Forms.',
    testCase: 'TC-OUT-01: Generate Billing Document (VF01) and verify automated PDF dispatch via BRF+ output control.',
    validationEvidence: 'Output log in OPD confirming successful form rendering and spool generation.'
  },
  {
    id: 'MAP-008',
    eccArea: 'MM Material Master',
    eccObject: 'Material Master Field Length (MATNR)',
    objectType: 'Data Element (CHAR 18)',
    currentUsage: 'Referenced in 100% of custom logistics includes and table keys',
    s4Impact: 'Material Number extended from 18 to 40 characters (MATNR40); all custom string manipulations require review',
    s4Target: 'MATNR 40-Character Standard (MATNR_40)',
    requiredAction: 'Remediate',
    sapNote: 'SAP Note 2270387 (Material Master Field Length Extension)',
    evidenceConfidence: 'VERIFIED_100%',
    eccCurrentState: '18-character material number definition hardcoded in 34 custom structures and interfaces.',
    usageEvidence: 'ATC scan identified 16 custom function modules passing CHAR18 parameters to material search logic.',
    targetS4Standard: '40-character MATNR standard with compatibility domain conversion routines.',
    gapDescription: 'Passing 40-character material IDs to 18-char custom variables causes truncation runtime errors.',
    requiredRemediation: 'Update custom type definitions from CHAR18 to standard MATNR / MATNR_40.',
    priority: 'HIGH',
    ownerAgent: 'ABAP_AGENT',
    upgradeAction: 'Execute ATC Material Field Extension check → Replace hardcoded CHAR18 references with MATNR.',
    testCase: 'TC-MAT-01: Create and process 40-character material ID in MM01, PO creation (ME21N), and Goods Receipt (MIGO).',
    validationEvidence: 'End-to-end P2P execution log with 40-char material ID passing without string truncation.'
  },
  {
    id: 'MAP-009',
    eccArea: 'FI Asset Accounting',
    eccObject: 'Classic Asset Accounting (ANLC, ANEP, ANEA)',
    objectType: 'Asset Balance & Transaction Tables',
    currentUsage: 'Active in fixed asset ledger and periodic depreciation runs (AFAB)',
    s4Impact: 'Classic Asset Accounting obsolete; New Asset Accounting mandatory with real-time postings in ACDOCA',
    s4Target: 'New Asset Accounting integrated in ACDOCA / FAA_DOC',
    requiredAction: 'Convert',
    sapNote: 'SAP Note 2270407 (New Asset Accounting in S/4HANA)',
    evidenceConfidence: 'VERIFIED_100%',
    eccCurrentState: 'Legacy FI-AA with separate balance tables (ANLC/ANEP) and periodic delta depreciation posting runs.',
    usageEvidence: 'FINS_MIG_PRE_CHECKS detected unposted depreciation runs in prior periods for Depreciation Area 01.',
    targetS4Standard: 'New Asset Accounting with real-time depreciation postings into ACDOCA for all accounting principles.',
    gapDescription: 'Unposted depreciation in ECC blocks SUM downtime phase; asset master data must be reconciled.',
    requiredRemediation: 'Execute transaction AFAB to complete all prior period depreciation runs and reconcile AJAB/AJRW.',
    priority: 'CRITICAL',
    ownerAgent: 'FI_CO_AGENT',
    upgradeAction: 'Post open depreciation via AFAB → Run FAA_CHECK_MIGRATION → Perform New FI-AA customization in SPRO.',
    testCase: 'TC-AST-01: Execute Asset Acquisition (ABZON) and verify simultaneous posting in Asset Ledger and ACDOCA.',
    validationEvidence: 'FAA_CHECK_MIGRATION report showing 0 consistency errors and successful ledger reconciliation.'
  },
  {
    id: 'MAP-010',
    eccArea: 'PP Production Planning',
    eccObject: 'Classic MRP Run (MD01, MD02, MD03, DBVM)',
    objectType: 'MRP Batch Engine & Planning File',
    currentUsage: 'Nightly batch runs calculating planned orders and purchase requisitions',
    s4Impact: 'Replaced by MRP Live in HANA (MD01N) executing 10x-50x faster; DBVM converted to MDVM',
    s4Target: 'MRP Live in SAP HANA (MD01N)',
    requiredAction: 'Replace',
    sapNote: 'SAP Note 2268088 (MRP Live in S/4HANA)',
    evidenceConfidence: 'HIGH_90%',
    eccCurrentState: 'Classic MRP batch job running MD01 nightly taking 3.5 hours over DBVM planning file entries.',
    usageEvidence: 'Planning runs scheduled across 6 manufacturing plants with classic BAdIs (MD_CHANGE_MRP_DATA).',
    targetS4Standard: 'MRP Live in SAP HANA (MD01N) running in-memory directly on database kernel with parallel dispatch.',
    gapDescription: 'Classic user exits (e.g. EXIT_SAPMM61X_001) not supported in MRP Live; must migrate to BAdI MD_ADD_ELEMENTS.',
    requiredRemediation: 'Audit custom MRP BAdIs via report RMMD07DB and switch batch jobs from MD01 to MD01N.',
    priority: 'MEDIUM',
    ownerAgent: 'PP_AGENT',
    upgradeAction: 'Run MRP compatibility report → Convert DBVM to MDVM → Schedule MD01N MRP Live.',
    testCase: 'TC-MRP-01: Execute MD01N for Plant 1000 and verify planned order generation in under 4 minutes.',
    validationEvidence: 'MD01N execution log confirming 100% material requirements planned in HANA in-memory mode.'
  },
  {
    id: 'MAP-011',
    eccArea: 'Logistics Transportation',
    eccObject: 'LE-TRA Shipments (VT01N, VT02N, VTTK, VTTP)',
    objectType: 'Shipment Processing & Costing',
    currentUsage: 'Active in distribution route planning and freight settlement',
    s4Impact: 'LE-TRA is deprecated in S/4HANA; replaced by Embedded Basic Transportation Management',
    s4Target: 'S/4HANA Embedded Transportation Management (Basic TM)',
    requiredAction: 'Convert',
    sapNote: 'SAP Note 2267470 (S/4HANA Embedded TM Transition)',
    evidenceConfidence: 'HIGH_90%',
    eccCurrentState: 'Classic LE-TRA shipment documents (VTTK/VTTP) and freight cost settlement documents (VI01).',
    usageEvidence: '64,000 monthly shipment documents processed across 12 distribution routes.',
    targetS4Standard: 'S/4HANA Embedded Basic TM (Freight Units, Freight Orders, Freight Settlement Documents).',
    gapDescription: 'Compatibility scope for LE-TRA expires; freight settlement must migrate to TM Service PO integration.',
    requiredRemediation: 'Activate Embedded TM Basic in S/4HANA and map shipment types to Freight Order Types.',
    priority: 'HIGH',
    ownerAgent: 'TM_AGENT',
    upgradeAction: 'Configure TM Freight Order types → Migrate carrier determination rules → Transition from VI01 to TM FSD.',
    testCase: 'TC-TM-01: Create Delivery, generate Freight Order, execute carrier assignment, and trigger Freight Settlement.',
    validationEvidence: 'TM Cockpit execution log verifying freight cost accrual posted directly to ACDOCA.'
  },
  {
    id: 'MAP-012',
    eccArea: 'Custom Legacy Subroutine',
    eccObject: 'Z_SD_LEGACY_TAX_CALC (Unknown Assembly)',
    objectType: 'Subroutine Pool (PROG)',
    currentUsage: 'Zero executions detected in ST03N workload logs for 36 months',
    s4Impact: 'Contains direct hardcoded tax table updates not compatible with S/4 tax engine',
    s4Target: 'S/4 Standard Tax Conditions (Tax Jurisdiction / Vertex Plugin)',
    requiredAction: 'Retire',
    sapNote: 'SAP Note 2436688 (Clean Core Custom Code Retirement)',
    evidenceConfidence: 'HIGH_90%',
    eccCurrentState: 'Legacy custom program created in 2011 with direct modification of tax structures.',
    usageEvidence: 'ST03N workload monitor and UPL (Usage Procedure Logging) confirm 0 executions in past 36 months.',
    targetS4Standard: 'Standard SAP S/4HANA Condition Technique (TAXUSX/TAXUSJ) or Clean-Core Tax API.',
    gapDescription: 'Unused dead code introducing security vulnerabilities and ATC blockers during upgrade.',
    requiredRemediation: 'Retire and decommission object from custom repository using Clean-Core decommissioning protocol.',
    priority: 'LOW',
    ownerAgent: 'CLEAN_CORE_AGENT',
    upgradeAction: 'Archive code repository snapshot → Delete Z_SD_LEGACY_TAX_CALC via SE38 in pre-upgrade transport.',
    testCase: 'TC-RET-01: Verify sales pricing and tax calculations function without legacy subroutine.',
    validationEvidence: 'Clean Core scorecard showing custom footprint reduction of 1 obsolete object.'
  },
  {
    id: 'MAP-013',
    eccArea: 'Custom Banking Interface',
    eccObject: 'ZFI_BANK_STMT_ENHANCEMENT',
    objectType: 'BAdI Implementation',
    currentUsage: 'Parses MT940 bank statements into FEBKO/FEBEP tables',
    s4Impact: 'S/4 Advanced Payment Management provides native CAMT.053 / MT940 parsers; requires verification with treasury team',
    s4Target: 'S/4 Advanced Payment Management / FEB_BSPROC',
    requiredAction: 'REQUIRES SAP/HUMAN VERIFICATION',
    sapNote: 'SAP Note 2270410 (Electronic Bank Statement in S/4HANA)',
    evidenceConfidence: 'MEDIUM_75%',
    eccCurrentState: 'Custom BAdI implementation parsing non-standard bank statement headers into FEBKO.',
    usageEvidence: 'Bank statements imported daily for 8 treasury bank accounts.',
    targetS4Standard: 'S/4HANA Advanced Payment Management & Bank Statement Reprocessing (FEB_BSPROC).',
    gapDescription: 'Standard S/4 parser supports ISO 20022 CAMT.053 natively; verify if legacy MT940 enhancement is redundant.',
    requiredRemediation: 'Conduct treasury workshop to validate CAMT.053 format adoption or refactor BAdI to BADI_FEB_BAPIA.',
    priority: 'MEDIUM',
    ownerAgent: 'FI_CO_AGENT',
    upgradeAction: 'Execute bank statement test in S/4 sandbox → Review custom parsing rules with Treasury Lead.',
    testCase: 'TC-BNK-01: Import sample MT940 and CAMT.053 statement via FEB_BSPROC and verify automated open item clearing.',
    validationEvidence: 'Bank statement test import log with 100% automated clearing of customer open items.'
  }
];

// ============================================================================
// 5. DYNAMIC READINESS CHECKLISTS BY MODULE
// ============================================================================

export const INITIAL_MODULE_CHECKLISTS: ModuleReadinessChecklist[] = [
  {
    module: 'SD (Sales & Distribution)',
    targetS4Area: 'S/4HANA Sales & Order-to-Cash',
    checks: [
      {
        checkName: 'Customer-to-Business Partner (CVI) Synchronization',
        category: 'Master Data',
        status: 'BLOCKER',
        sapNote: 'SAP Note 2265093',
        finding: '42 Customer master accounts in KNA1 have missing postal codes or tax numbers causing CVI errors.',
        remediation: 'Run MDS_LOAD_COCKPIT pre-check report and harmonize number range groupings in SPRO.',
        evidenceSource: 'Connected SAP ECC (Client 800) / CVI_PRECHECK'
      },
      {
        checkName: 'PRCD_ELEMENTS Pricing Table Compatibility',
        category: 'Custom Code',
        status: 'BLOCKER',
        sapNote: 'SAP Note 2267258',
        finding: '8 custom pricing reports directly query KONV with cluster table syntax.',
        remediation: 'Execute automated ATC quick-fix to redirect SELECT statements to PRCD_ELEMENTS.',
        evidenceSource: 'Connected SAP ECC / ATC Check S4H_CORRECTION'
      },
      {
        checkName: 'Credit Management Migration to FSCM',
        category: 'Simplification',
        status: 'WARNING',
        sapNote: 'SAP Note 2267329',
        finding: 'Customer credit limits currently maintained in KNKK; FSCM Credit Management must be configured.',
        remediation: 'Run UKM_TRANSFER_VECTOR to populate credit exposures and credit profiles in BP.',
        evidenceSource: 'Connected SAP ECC / Simplification Check'
      },
      {
        checkName: 'VBUK/VBUP Status Field Elimination',
        category: 'Custom Code',
        status: 'WARNING',
        sapNote: 'SAP Note 2198647',
        finding: '14 custom includes reference VBUK-GBSTK; status now resides in VBAK-GBSTK.',
        remediation: 'Update ABAP SQL queries to query VBAK and VBAP directly.',
        evidenceSource: 'Connected SAP ECC / ATC Code Inspector'
      },
      {
        checkName: 'SD Rebate to Condition Contract Settlement',
        category: 'Configuration',
        status: 'PASS',
        sapNote: 'SAP Note 2267286',
        finding: 'No active VBO1 rebate agreements found; condition contracts already in use.',
        remediation: 'No remediation required.',
        evidenceSource: 'Connected SAP ECC / Table KONA scan'
      }
    ]
  },
  {
    module: 'MM (Materials Management & Purchasing)',
    targetS4Area: 'S/4HANA Sourcing & Procurement',
    checks: [
      {
        checkName: 'Vendor-to-Business Partner (CVI) Synchronization',
        category: 'Master Data',
        status: 'BLOCKER',
        sapNote: 'SAP Note 2265093',
        finding: '18 Vendor accounts in LFA1 contain duplicate tax registration numbers.',
        remediation: 'Execute CVI Cockpit master data reconciliation and merge duplicate tax IDs.',
        evidenceSource: 'Connected SAP ECC / /CVI/EVALUATION'
      },
      {
        checkName: 'MATDOC Unified Inventory Migration',
        category: 'Simplification',
        status: 'PASS',
        sapNote: 'SAP Note 2268064',
        finding: 'Compatibility views V_MSEG and V_MKPF will handle legacy standard queries seamlessly.',
        remediation: 'Direct custom high-volume reports to MATDOC for 50x performance boost.',
        evidenceSource: 'Connected SAP ECC / Simplification Catalog'
      },
      {
        checkName: 'Material Number 40-Character Readiness',
        category: 'Custom Code',
        status: 'WARNING',
        sapNote: 'SAP Note 2270387',
        finding: '6 custom Z-tables define MATNR fields with explicit CHAR 18 instead of DOMAIN MATNR.',
        remediation: 'Refactor field data elements to reference standard MATNR domain in SE11.',
        evidenceSource: 'Connected SAP ECC / DDIC Scanner'
      },
      {
        checkName: 'Output Management for Purchase Orders',
        category: 'Output',
        status: 'PASS',
        sapNote: 'SAP Note 2154870',
        finding: 'PO print forms (MEDRUCK) configured; dual-mode NAST/BRF+ enabled.',
        remediation: 'Validate spool output in dress rehearsal.',
        evidenceSource: 'Connected SAP ECC / NACE Config'
      }
    ]
  },
  {
    module: 'FI/CO (Financials & Controlling)',
    targetS4Area: 'S/4HANA Universal Journal (ACDOCA)',
    checks: [
      {
        checkName: 'New Asset Accounting (FI-AA) Prerequisite Consistency',
        category: 'Configuration',
        status: 'BLOCKER',
        sapNote: 'SAP Note 2270407',
        finding: 'Depreciation Area 01 and 15 have unposted depreciation runs from prior fiscal year.',
        remediation: 'Execute AFAB depreciation catch-up and run transaction FINS_MIG_AA check.',
        evidenceSource: 'Connected SAP ECC / FINS_MIG_PRE_CHECKS'
      },
      {
        checkName: 'General Ledger Balances Zero-Variance Baseline',
        category: 'Master Data',
        status: 'PASS',
        sapNote: 'SAP Note 2267308',
        finding: 'FAGLFLEXT vs BSEG balances perfectly matched (82,910,400.00 USD).',
        remediation: 'Baseline balance export saved for post-conversion automated reconciliation.',
        evidenceSource: 'Connected SAP ECC / GL Snapshot'
      },
      {
        checkName: 'Secondary Cost Elements to G/L Accounts',
        category: 'Configuration',
        status: 'PASS',
        sapNote: 'SAP Note 2267308',
        finding: 'CO assessment cost elements mapped to primary/secondary G/L accounts in chart of accounts CAUS.',
        remediation: 'No remediation required.',
        evidenceSource: 'Connected SAP ECC / SPRO Config'
      },
      {
        checkName: 'Material Ledger Activation',
        category: 'Master Data',
        status: 'WARNING',
        sapNote: 'SAP Note 2354768',
        finding: 'Material Ledger is mandatory in S/4HANA; currently active in Plants 1000/1010, missing in Plant 1020.',
        remediation: 'Activate Material Ledger via OMX1 and OMX2 for Plant 1020 prior to SUM downtime.',
        evidenceSource: 'Connected SAP ECC / Table T001W'
      }
    ]
  },
  {
    module: 'Basis & Technical Infrastructure',
    targetS4Area: 'S/4HANA 2023 FPS02 Kernel & Database',
    checks: [
      {
        checkName: 'SAP Maintenance Planner Stack XML & Download Basket',
        category: 'Simplification',
        status: 'PASS',
        sapNote: 'SAP Note 2436688',
        finding: 'Stack XML MP_S4H_2023_FPS02 generated and verified with 0 component conflicts.',
        remediation: 'Stack XML staged in SUM download directory.',
        evidenceSource: 'SAP Maintenance Planner / XML MP-98214'
      },
      {
        checkName: 'Unicode UTF-16 Code Page Certification',
        category: 'Configuration',
        status: 'PASS',
        sapNote: 'SAP Note 1761693',
        finding: 'System is 100% Unicode active (Code Page 4103 UTF-16).',
        remediation: 'No Unicode conversion downtime required.',
        evidenceSource: 'Connected SAP ECC / Kernel Status'
      },
      {
        checkName: 'Third-Party Add-on Compatibility',
        category: 'Simplification',
        status: 'WARNING',
        sapNote: 'SAP Note 2214409',
        finding: 'OpenText VIM 7.5 requires upgrade to VIM 20.4 for S/4HANA 2023 compatibility.',
        remediation: 'Apply OpenText S/4 compatible transport packages during SUM preprocessing.',
        evidenceSource: 'Vendor Compatibility Matrix (OpenText Note 41829)'
      },
      {
        checkName: 'SUM with DMO Disk & Table Split Prerequisites',
        category: 'Custom Code',
        status: 'PASS',
        sapNote: 'SAP Note 2568736',
        finding: 'DMO table splitting rules created for BSEG, MSEG, and EDI tables. 1.2 TB free on /usr/sap/put.',
        remediation: 'No further action required.',
        evidenceSource: 'Connected SAP ECC / DMO Sizing Report'
      }
    ]
  }
];

// ============================================================================
// 6. BUSINESS PROCESS REVERSE ENGINEERING GRAPHS
// ============================================================================

export const INITIAL_BUSINESS_PROCESSES: BusinessProcessGraph[] = [
  {
    processName: 'Order-to-Cash (O2C)',
    description: 'End-to-end sales processing from inquiry and quotation through order entry, delivery, shipment, billing, and accounting.',
    stages: [
      {
        stageName: '1. Sales Order Creation',
        transactions: ['VA01', 'VA02', 'VA03'],
        programs: ['SAPMV45A', 'SD_SALES_DOCUMENT_SAVE'],
        tables: ['VBAK', 'VBAP', 'VBKD', 'KONV (-> PRCD_ELEMENTS)', 'KNA1 (-> BUT000)'],
        customCode: ['ZSD_USER_EXIT_PRICING', 'MV45AFZZ'],
        interfaces: ['EDI 850 (ORDERS05 IDoc) via CPI'],
        securityRoles: ['Z_SD_SALES_REP', 'Z_SD_ORDER_SPECIALIST'],
        jobs: ['SD_ORDER_INTAKE_BATCH'],
        s4Change: 'KONV queries redirected to PRCD_ELEMENTS. Status read from VBAK-GBSTK instead of VBUK.'
      },
      {
        stageName: '2. Outbound Delivery & Picking',
        transactions: ['VL01N', 'VL02N', 'VL06O', 'LT03'],
        programs: ['SAPMV50A', 'WS_DELIVERY_UPDATE'],
        tables: ['LIKP', 'LIPS', 'VBFA', 'VBUK (-> LIKP)'],
        customCode: ['ZSD_DELIVERY_SPLIT_ROUTINE'],
        interfaces: ['WMS Picking Message (WHSCON)'],
        securityRoles: ['Z_SD_SHIPPING_CLERK'],
        jobs: ['RV50SBT1 (Automated Delivery Creation)'],
        s4Change: 'Delivery status integrated directly into LIKP/LIPS. Classic WM picking converts to Embedded EWM warehouse tasks.'
      },
      {
        stageName: '3. Goods Issue Posting (PGI)',
        transactions: ['VL02N (Post GI)', 'MIGO (Movement 601)'],
        programs: ['SAPMV50A', 'SAPMM07M'],
        tables: ['MSEG (-> MATDOC)', 'MKPF (-> MATDOC)', 'MBEW', 'MARC'],
        customCode: ['ZMM_PGI_SERIAL_CHECK'],
        interfaces: ['Carrier Shipping Notification (EDI 856 DESADV)'],
        securityRoles: ['Z_SD_SHIPPING_SUPERVISOR'],
        jobs: [],
        s4Change: 'Material document generated in single table MATDOC with zero locking on stock balance tables.'
      },
      {
        stageName: '4. Billing Document Generation',
        transactions: ['VF01', 'VF02', 'VF04'],
        programs: ['SAPMV60A', 'RV60SBAT'],
        tables: ['VBRK', 'VBRP', 'KONV (-> PRCD_ELEMENTS)', 'NAST (-> BRF+)'],
        customCode: ['ZSD_INVOICE_USER_EXIT', 'RV60AFZZ'],
        interfaces: ['Electronic Invoice EDI 810 (INVOIC02)'],
        securityRoles: ['Z_SD_BILLING_CLERK'],
        jobs: ['SDBILLDL (Nightly Billing Run)'],
        s4Change: 'PRCD_ELEMENTS handles condition records. Output generated via BRF+ / S/4 Output Management.'
      },
      {
        stageName: '5. Financial Accounting Posting',
        transactions: ['FB03', 'FBL5N', 'F-28'],
        programs: ['SAPLFACI', 'SAPMF05A'],
        tables: ['BSEG (-> ACDOCA)', 'BKPF', 'BSID', 'BSAD'],
        customCode: ['ZFI_REVENUE_RECOGNITION_BADI'],
        interfaces: ['Lockbox Bank Deposit (BAI2)'],
        securityRoles: ['Z_FI_AR_ACCOUNTANT'],
        jobs: ['SAPF181 (G/L Account Clearing)'],
        s4Change: 'Universal Journal (ACDOCA) created instantaneously with real-time margin analysis by customer and product.'
      }
    ],
    dependencyFlow: ['Sales Order (VA01)', 'Outbound Delivery (VL01N)', 'Picking & Packing', 'Post Goods Issue (601)', 'Billing Document (VF01)', 'ACDOCA Universal Journal Entry']
  },
  {
    processName: 'Procure-to-Pay (P2P)',
    description: 'Procurement cycle from purchase requisition through purchase order creation, goods receipt, invoice verification, and vendor payment.',
    stages: [
      {
        stageName: '1. Purchase Requisition & Sourcing',
        transactions: ['ME51N', 'ME52N', 'ME57'],
        programs: ['SAPLMEPO'],
        tables: ['EBAN', 'EBKN', 'MARA', 'EINA', 'EINE'],
        customCode: ['ZMM_PURCHASE_REQ_APPROVAL_BADI'],
        interfaces: ['SAP Ariba PunchOut Sourcing'],
        securityRoles: ['Z_MM_REQUESTOR', 'Z_MM_PURCHASER'],
        jobs: ['RMMRP000 (MRP Planned Order to PR Conversion)'],
        s4Change: 'MRP Live directly creates requisitions with real-time supplier evaluation.'
      },
      {
        stageName: '2. Purchase Order Creation & Release',
        transactions: ['ME21N', 'ME22N', 'ME28', 'ME29N'],
        programs: ['SAPLMEPO', 'ME_PO_CONFIRM'],
        tables: ['EKKO', 'EKPO', 'EKET', 'LFA1 (-> BUT000)', 'NAST (-> BRF+)'],
        customCode: ['ZMM_PO_ENHANCEMENT_SPOT'],
        interfaces: ['EDI 850 Outbound Purchase Order to Vendors'],
        securityRoles: ['Z_MM_BUYER', 'Z_MM_PURCHASING_MANAGER'],
        jobs: ['RM06EN00 (PO Expiration & Follow-up)'],
        s4Change: 'Vendor master LFA1 resolved via Business Partner BUT000. S/4 Output Control sends XML / PDF via BRF+.'
      },
      {
        stageName: '3. Goods Receipt Posting (MIGO)',
        transactions: ['MIGO', 'MB01 (Obsolete)'],
        programs: ['SAPLMIGO', 'SAPMM07M'],
        tables: ['MSEG (-> MATDOC)', 'MKPF', 'EKBE', 'MBEW'],
        customCode: ['ZMM_MIGO_BATCH_VALIDATION'],
        interfaces: ['Supplier ASN (EDI 856 DESADV)'],
        securityRoles: ['Z_MM_RECEIVING_CLERK'],
        jobs: [],
        s4Change: 'MB01 transaction code obsolete; MIGO posts to MATDOC with zero locking on MBEW valuation table.'
      },
      {
        stageName: '4. Logistics Invoice Verification (MIRO)',
        transactions: ['MIRO', 'MIR4', 'MR8M'],
        programs: ['SAPLMR1M'],
        tables: ['RBKP', 'RSEG', 'EKBE', 'BSEG (-> ACDOCA)'],
        customCode: ['ZMM_INVOICE_TOLERANCE_CHECK', 'OpenText VIM 7.5 / 20.4'],
        interfaces: ['Vendor EDI 810 Invoice Inbound'],
        securityRoles: ['Z_MM_AP_CLERK'],
        jobs: ['RMBEWEXT'],
        s4Change: 'GR/IR clearing account postings automatically synchronized to ACDOCA.'
      },
      {
        stageName: '5. Vendor Payment Run (F110)',
        transactions: ['F110', 'FBL1N'],
        programs: ['SAPF110S'],
        tables: ['REGUH', 'REGUP', 'BSIK (-> ACDOCA)', 'BSAK (-> ACDOCA)'],
        customCode: ['ZFI_PAYMENT_FILE_FORMATTER'],
        interfaces: ['SWIFT Bank Payment File (ISO 20022 PAIN.001)'],
        securityRoles: ['Z_FI_TREASURY_MANAGER'],
        jobs: ['SAPF110S (Automated Payment Run)'],
        s4Change: 'Payment run clears open items against ACDOCA Universal Journal with instant cash positioning.'
      }
    ],
    dependencyFlow: ['Purchase Requisition (ME51N)', 'Purchase Order (ME21N)', 'Goods Receipt (MIGO / MATDOC)', 'Invoice Verification (MIRO)', 'Payment Run (F110 / ACDOCA)']
  },
  {
    processName: 'Record-to-Report (R2R)',
    description: 'Financial accounting from general ledger journal entries through asset accounting, cost allocations, period-end closing, and financial reporting.',
    stages: [
      {
        stageName: '1. General Ledger & Journal Postings',
        transactions: ['FB50', 'FB01', 'F-02'],
        programs: ['SAPMF05A'],
        tables: ['BKPF', 'BSEG (-> ACDOCA)', 'SKAT', 'SKA1'],
        customCode: ['ZFI_GL_VALIDATION_EXIT'],
        interfaces: ['Payroll GL Posting from ADP / SuccessFactors'],
        securityRoles: ['Z_FI_GL_ACCOUNTANT'],
        jobs: [],
        s4Change: 'All postings write to single universal journal ACDOCA with real-time multi-currency and multi-ledger capability.'
      },
      {
        stageName: '2. Fixed Asset Accounting & Depreciation',
        transactions: ['F-90', 'ABZON', 'AFAB', 'AW01N'],
        programs: ['SAPLAMM0', 'RAPERB2000'],
        tables: ['ANLA', 'ANLZ', 'ANLC (-> ACDOCA)', 'ANEP (-> ACDOCA)'],
        customCode: ['ZFI_ASSET_TAX_REPORT'],
        interfaces: [],
        securityRoles: ['Z_FI_ASSET_ACCOUNTANT'],
        jobs: ['AFAB (Monthly Depreciation Run)'],
        s4Change: 'New Asset Accounting eliminates separate depreciation posting batches; real-time depreciation posted per ledger in ACDOCA.'
      },
      {
        stageName: '3. Period-End Cost Allocations & Assessments',
        transactions: ['KSU5', 'KSS2', 'KO88'],
        programs: ['SAPMKAL1'],
        tables: ['COEP (-> ACDOCA)', 'COBK', 'PRPS'],
        customCode: ['ZCO_OVERHEAD_ALLOCATION_ROUTINE'],
        interfaces: [],
        securityRoles: ['Z_CO_CONTROLLER'],
        jobs: ['RKALCO43'],
        s4Change: 'Cost allocations post directly as ACDOCA line items with zero CO-to-FI reconciliation needed.'
      },
      {
        stageName: '4. Financial Statement Generation & Reporting',
        transactions: ['F.01', 'S_ALR_87012284'],
        programs: ['RFBILA00'],
        tables: ['FAGLFLEXT (-> ACDOCA)', 'SKB1'],
        customCode: ['ZFI_FINANCIAL_STMT_EXTRACTOR'],
        interfaces: ['OneStream Financial Consolidation API'],
        securityRoles: ['Z_FI_FINANCE_DIRECTOR'],
        jobs: ['RFBILA00_MONTHLY'],
        s4Change: 'Financial reports execute in seconds querying ACDOCA aggregate-free views.'
      }
    ],
    dependencyFlow: ['Journal Entry (FB50)', 'Asset Depreciation (AFAB)', 'Cost Allocation (KSU5)', 'Period-End Accruals', 'Universal Journal ACDOCA Consolidation', 'Balance Sheet (F.01)']
  }
];

// ============================================================================
// 7. HUMAN APPROVAL GOVERNANCE WORKFLOW ITEMS
// ============================================================================

export const INITIAL_HUMAN_APPROVALS: HumanApprovalItem[] = [
  {
    id: 'APP-001',
    action: 'Execute Customer-Vendor Integration (CVI) Synchronization in ECC 800',
    system: 'ECC Production Landscape (E10)',
    client: '800',
    objectsAffected: ['KNA1 (1,480 Customers)', 'LFA1 (920 Vendors)', 'BUT000', 'MDS_LOAD_COCKPIT'],
    businessImpact: 'Converts legacy customer and vendor records into unified Business Partners. Required before SUM technical conversion.',
    technicalImpact: 'Executes synchronization background jobs. Generates entries in CVI mapping tables and BUT000.',
    risk: 'HIGH',
    rollback: 'CVI synchronization errors can be rolled back via MDS_PPO2 Post-Processing Office before final database lock.',
    status: 'PENDING_APPROVAL',
    assignedAgent: 'CVI_BP_AGENT',
    sapNote: 'SAP Note 2265093',
    requestedDate: '2026-08-26 18:30 UTC'
  },
  {
    id: 'APP-002',
    action: 'Apply Automated ABAP ATC Quick-Fixes to 24 Custom Programs (KONV & VBUK Redirects)',
    system: 'ECC Development Landscape (E10)',
    client: '820',
    objectsAffected: ['ZSD_PRICING_REPORT', 'ZFI_GL_EXTRACTOR', 'ZMM_INVENTORY_VAL', 'KONV', 'VBUK'],
    businessImpact: 'Ensures custom sales reports and pricing extractors function correctly on S/4 transparent tables.',
    technicalImpact: 'Updates SELECT statements to reference PRCD_ELEMENTS and VBAK status fields. Creates transport request E10K902144.',
    risk: 'MEDIUM',
    rollback: 'Original ABAP source code versions backed up in SVN/Git and SAP Version Management (SE38).',
    status: 'PENDING_APPROVAL',
    assignedAgent: 'ABAP_AGENT',
    sapNote: 'SAP Note 2267258 & Note 2198647',
    requestedDate: '2026-08-26 18:35 UTC'
  },
  {
    id: 'APP-003',
    action: 'Decommission 12 Inactive Custom Z-Objects (Clean Core Retirement)',
    system: 'ECC Development Landscape (E10)',
    client: '820',
    objectsAffected: ['Z_SD_LEGACY_TAX_CALC', 'ZMM_OBSOLETE_INV_01', 'ZFI_OLD_CHECK_PRINT', 'Z_DUMMY_PROGRAM'],
    businessImpact: 'Zero business impact. Confirmed 0 executions in ST03N workload logs for over 36 months.',
    technicalImpact: 'Deletes orphaned repository entries from TADIR and eliminates technical debt before S/4 transfer.',
    risk: 'LOW',
    rollback: 'Full SAP transport backup export (.DATA and .COFILE) stored in migration archive repository.',
    status: 'PENDING_APPROVAL',
    assignedAgent: 'ABAP_AGENT',
    sapNote: 'SAP Note 2436688',
    requestedDate: '2026-08-26 18:40 UTC'
  },
  {
    id: 'APP-004',
    action: 'Authorize SUM with DMO Execution Downtime Phase Gate (MOD_TRANS -> DOWN_PHASE)',
    system: 'S/4HANA Staging Landscape (S10)',
    client: '100',
    objectsAffected: ['Oracle/DB6 -> SAP HANA Database Engine', 'BSEG/MSEG -> ACDOCA/MATDOC Table Structures'],
    businessImpact: 'Production ERP entering scheduled technical conversion downtime (Target: 4.4 Hours).',
    technicalImpact: 'Locks dialog users, terminates background job schedulers, initiates parallel R3load data export to HANA.',
    risk: 'CRITICAL',
    rollback: 'Automated DMO rollback restore point taken at snapshot marker DMO_PRE_DOWNTIME_SNAPSHOT_01.',
    status: 'PENDING_APPROVAL',
    assignedAgent: 'SUM_DMO_AGENT',
    sapNote: 'SAP Note 2568736',
    requestedDate: '2026-08-26 19:00 UTC'
  }
];

// ============================================================================
// 8. SOURCE DOCUMENTS (ADD SOURCE INTEGRATION)
// ============================================================================

export const INITIAL_SOURCE_DOCUMENTS: MigrationSourceDocument[] = [
  {
    id: 'SRC-001',
    name: 'SAP_Readiness_Check_S4H_2023_E10.zip',
    type: 'READINESS_ZIP',
    uploadDate: '2026-08-26 17:15 UTC',
    sizeBytes: 14820900,
    parsedEntitiesCount: 412,
    priority: 2,
    status: 'PARSED',
    extractedFindings: [
      { category: 'Simplification Items', summary: '38 Simplification Items identified with direct system relevance.', severity: 'HIGH', sapNote: 'SAP Note 2436688' },
      { category: 'CVI Business Partner', summary: '1,480 Customer and 920 Vendor accounts require CVI synchronization.', severity: 'BLOCKER', sapNote: 'SAP Note 2265093' },
      { category: 'HANA In-Memory Sizing', summary: 'Initial database footprint of 3.4 TB requires 1.8 TB HANA RAM after compression.', severity: 'INFO' }
    ]
  },
  {
    id: 'SRC-002',
    name: 'ATC_Custom_Code_Export_S4H_CORRECTION.xml',
    type: 'ATC_EXPORT',
    uploadDate: '2026-08-26 17:30 UTC',
    sizeBytes: 4920400,
    parsedEntitiesCount: 184,
    priority: 2,
    status: 'PARSED',
    extractedFindings: [
      { category: 'Custom Code Incompatibilities', summary: '24 programs have critical syntax errors against S/4 transparent tables (KONV, VBUK).', severity: 'BLOCKER', sapNote: 'SAP Note 2267258' },
      { category: 'Field Length Extension', summary: '14 includes require adjustments for 40-character MATNR fields.', severity: 'HIGH', sapNote: 'SAP Note 2270387' },
      { category: 'Clean Core Candidates', summary: '12 custom objects identified with 0 usage evidence over 36 months.', severity: 'INFO' }
    ]
  },
  {
    id: 'SRC-003',
    name: 'Enterprise_Architecture_Cloud_Target_Blueprint_v3.pdf',
    type: 'ARCHITECTURE_DOC',
    uploadDate: '2026-08-26 18:00 UTC',
    sizeBytes: 8120000,
    parsedEntitiesCount: 56,
    priority: 4,
    status: 'INDEXED',
    extractedFindings: [
      { category: 'Cloud Infrastructure', summary: 'Target architecture specifies RISE with SAP Private Cloud on AWS / Azure with Active-Active HA.', severity: 'INFO' },
      { category: 'Downtime Window', summary: 'Maximum business downtime window approved: 6.0 Hours (Target: 4.5 Hours).', severity: 'INFO' }
    ]
  }
];
