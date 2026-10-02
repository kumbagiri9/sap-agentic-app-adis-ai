import {
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

export const INITIAL_PREREQUISITES: PrerequisiteCheck[] = [
  {
    id: 'PRQ-001',
    name: 'Customer-Vendor Integration (CVI) Synchronization',
    category: 'Readiness Check',
    status: 'BLOCKER',
    sapNote: 'SAP Note 2265093',
    evidence: 'CVI_PRECHECK detected 42 Customers and 18 Vendors with missing required fields or tax ID collisions.',
    impact: 'SUM upgrade phase MOD_TRANS will halt if CVI synchronization is not 100% complete.',
    remediation: 'Run transaction MDS_LOAD_COCKPIT to synchronize master data and harmonize number ranges in SPRO.',
    assignedAgent: 'CVI_BP_AGENT'
  },
  {
    id: 'PRQ-002',
    name: 'ABAP Test Cockpit (ATC) Syntax Errors for Target Release',
    category: 'ATC Code Checks',
    status: 'BLOCKER',
    sapNote: 'SAP Note 2267258',
    evidence: '24 custom ABAP programs directly query obsolete table KONV or reference eliminated VBUK status fields.',
    impact: 'Custom sales order creation, pricing calculation, and billing routines will crash with runtime syntax errors.',
    remediation: 'Apply automated Quick-Fixes to redirect KONV to PRCD_ELEMENTS and VBUK to VBAK-GBSTK.',
    assignedAgent: 'ABAP_AGENT'
  },
  {
    id: 'PRQ-003',
    name: 'New Asset Accounting (FI-AA) Consistency Verification',
    category: 'Simplification Checks',
    status: 'BLOCKER',
    sapNote: 'SAP Note 2270407',
    evidence: 'FINS_MIG_PRE_CHECKS identified unposted depreciation runs in prior periods for Depreciation Area 01.',
    impact: 'Financials conversion step in SUM will fail with reconciliation errors.',
    remediation: 'Execute AFAB to complete periodic depreciation postings before starting SUM downtime.',
    assignedAgent: 'FI_CO_AGENT'
  },
  {
    id: 'PRQ-004',
    name: 'SAP Maintenance Planner Stack XML Verification',
    category: 'Maintenance Planner',
    status: 'PASS',
    sapNote: 'SAP Note 2436688',
    evidence: 'Stack XML MP_S4H_2023_FPS02 successfully calculated with valid target software component levels.',
    impact: 'All target S/4HANA software components and kernel packages verified without conflict.',
    remediation: 'Stack XML downloaded and placed in SUM download basket.',
    assignedAgent: 'BASIS_AGENT'
  },
  {
    id: 'PRQ-005',
    name: 'SAP HANA Hardware & Operating System Sizing',
    category: 'HANA Sizing',
    status: 'PASS',
    sapNote: 'SAP Note 1872170',
    evidence: '/SDF/HANA_BW_SIZING report completed; 1.8 TB RAM required for 3.4 TB source DB.',
    impact: 'Target HANA instances sized with 100% headroom for growth.',
    remediation: 'Infrastructure provisioned according to SAP HANA certified appliance guidelines.',
    assignedAgent: 'HANA_AGENT'
  },
  {
    id: 'PRQ-006',
    name: 'Third-Party Add-on Certification (OpenText VIM & Vertex)',
    category: 'Add-on Compatibility',
    status: 'WARNING',
    sapNote: 'SAP Note 2214409',
    evidence: 'OpenText VIM 7.5 requires upgrade to VIM 20.4; Vertex SIC requires patch 4.2 SP02.',
    impact: 'Add-on packages must be upgraded concurrently in SUM.',
    remediation: 'Staged compatible Add-On upgrade archives in SUM download directory.',
    assignedAgent: 'BASIS_AGENT'
  }
];

export const INITIAL_REVERSE_ENGINEERING: ReverseEngineeringItem[] = [
  {
    id: 'REV-001',
    businessProcess: 'Order-to-Cash (O2C)',
    sapModule: 'SD',
    configArea: 'Sales Pricing Procedures',
    transactionCode: 'VA01',
    programName: 'SAPMV45A',
    tables: ['VBAK', 'VBAP', 'KONV', 'KNA1'],
    enhancementPoints: ['MV45AFZZ', 'ZSD_PRICING_USER_EXIT'],
    interfaces: ['EDI 850 (ORDERS05 IDoc)'],
    securityRoles: ['Z_SD_SALES_REP'],
    downstreamDependencies: ['Delivery VL01N', 'Billing VF01', 'ACDOCA Universal Journal'],
    disposition: 'REFACTOR',
    cleanCoreRecommendation: 'Replace user exit pricing routines with BAdI BADI_SD_SALES_ITEM.'
  },
  {
    id: 'REV-002',
    businessProcess: 'Procure-to-Pay (P2P)',
    sapModule: 'MM',
    configArea: 'Purchase Order Approval & Release',
    transactionCode: 'ME21N',
    programName: 'SAPLMEPO',
    tables: ['EKKO', 'EKPO', 'LFA1', 'NAST'],
    enhancementPoints: ['ZMM_PO_ENHANCEMENT_SPOT'],
    interfaces: ['EDI 850 PO Outbound'],
    securityRoles: ['Z_MM_BUYER'],
    downstreamDependencies: ['Goods Receipt MIGO', 'Invoice MIRO', 'Payment F110'],
    disposition: 'KEEP',
    cleanCoreRecommendation: 'Leverage flexible workflow for Purchase Orders in SAP S/4HANA.'
  },
  {
    id: 'REV-003',
    businessProcess: 'Record-to-Report (R2R)',
    sapModule: 'FI',
    configArea: 'General Ledger Postings & Balances',
    transactionCode: 'FB50',
    programName: 'SAPMF05A',
    tables: ['BKPF', 'BSEG', 'BSIS', 'BSAS'],
    enhancementPoints: ['ZFI_GL_VALIDATION_EXIT'],
    interfaces: ['Payroll GL Postings via API'],
    securityRoles: ['Z_FI_GL_ACCOUNTANT'],
    downstreamDependencies: ['Trial Balance F.01', 'Financial Statements'],
    disposition: 'REFACTOR',
    cleanCoreRecommendation: 'Re-point custom financial extractors to ACDOCA CDS Views.'
  }
];

export const INITIAL_SIMPLIFICATIONS: SimplificationCatalogItem[] = [
  {
    id: 'SI-001',
    module: 'SD',
    eccObject: 'KONV Pricing Table',
    s4Replacement: 'PRCD_ELEMENTS (Transparent Table)',
    impactType: 'Technical',
    remediationAction: 'Replace all direct SELECT queries on KONV with PRCD_ELEMENTS; update field lengths.',
    strategicValue: 'Columnar storage enables 20x faster pricing calculations in memory.',
    isSystemUsingFeature: true,
    affectedBusinessProcesses: ['Sales Order Creation (VA01)', 'Billing Document (VF01)'],
    mandatoryRemediation: 'ATC Quick-Fix auto-refactoring',
    responsibleAgent: 'ABAP_AGENT',
    prerequisite: 'ATC scan completed',
    severity: 'BLOCKER',
    estimatedEffortDays: 3,
    validationProcedure: 'Execute pricing simulation test suite across 500 historical sales orders.'
  },
  {
    id: 'SI-002',
    module: 'Cross-Module',
    eccObject: 'Customer (KNA1) & Vendor (LFA1) Master Data',
    s4Replacement: 'Business Partner (BUT000 / CVI)',
    impactType: 'Functional',
    remediationAction: 'Execute CVI synchronization cockpit and align customer/vendor account groups with BP roles.',
    strategicValue: 'Single source of truth for business partners with multi-role and address capabilities.',
    isSystemUsingFeature: true,
    affectedBusinessProcesses: ['Sales Order Processing', 'Procurement', 'Accounts Receivable', 'Accounts Payable'],
    mandatoryRemediation: 'MDS_LOAD_COCKPIT master data sync',
    responsibleAgent: 'CVI_BP_AGENT',
    prerequisite: 'CVI customizing configuration',
    severity: 'BLOCKER',
    estimatedEffortDays: 5,
    validationProcedure: 'Verify 0 errors in /CVI/EVALUATION and confirm 1:1 BP synchronization.'
  },
  {
    id: 'SI-003',
    module: 'FI',
    eccObject: 'FI Index Tables (BSIS, BSAS, BSID, BSAD, BSIK, BSAK)',
    s4Replacement: 'Universal Journal (ACDOCA)',
    impactType: 'Technical',
    remediationAction: 'Utilize S/4 compatibility views or rewrite custom reports to query ACDOCA directly.',
    strategicValue: 'Eliminates reconciliation between G/L, CO, AA, and ML; instant real-time reporting.',
    isSystemUsingFeature: true,
    affectedBusinessProcesses: ['Financial Reporting', 'Period-End Closing', 'GL Balance Display'],
    mandatoryRemediation: 'FINS_MIG data migration in SUM',
    responsibleAgent: 'FI_CO_AGENT',
    prerequisite: 'Pre-migration financial consistency checks',
    severity: 'CRITICAL',
    estimatedEffortDays: 4,
    validationProcedure: 'Zero-variance balance comparison between ECC baseline and S/4 ACDOCA.'
  },
  {
    id: 'SI-004',
    module: 'MM',
    eccObject: 'Material Documents (MKPF & MSEG)',
    s4Replacement: 'Unified Material Documents (MATDOC)',
    impactType: 'Technical',
    remediationAction: 'Redirect custom inventory reports from MSEG to MATDOC for performance.',
    strategicValue: 'High-speed goods movements with eliminate locking on inventory valuation tables.',
    isSystemUsingFeature: true,
    affectedBusinessProcesses: ['Goods Receipt (MIGO)', 'Goods Issue (601)', 'Physical Inventory'],
    mandatoryRemediation: 'Inventory migration in SUM downtime',
    responsibleAgent: 'MM_PROCUREMENT_AGENT',
    prerequisite: 'Material ledger activation',
    severity: 'HIGH',
    estimatedEffortDays: 2,
    validationProcedure: 'Automated stock reconciliation between MBEW and MATDOC.'
  }
];

export const INITIAL_CUSTOM_CODE: CustomCodeIncompatibility[] = [
  {
    objectName: 'ZSD_PRICING_REPORT',
    objectType: 'Program',
    package: 'ZSD_SALES',
    owner: 'SAP_DEV_TEAM',
    module: 'SD',
    usage: 'High (Executed daily by 35 sales operations users)',
    lastUsageEvidence: 'ST03N workload recorded 1,420 executions in past 30 days',
    dependencies: ['VBAK', 'VBAP', 'KONV', 'KNA1'],
    referencedTables: ['KONV', 'VBAK', 'VBAP'],
    s4Impact: 'Syntax error: Cluster table KONV cannot be queried directly in S/4HANA.',
    atcFinding: 'S4H_CORRECTION: Obsolete table KONV used in SELECT statement line 142.',
    simplificationImpact: 'Simplification Item SI-001 (KONV to PRCD_ELEMENTS)',
    recommendedAction: 'Apply automated Quick-Fix to redirect query to PRCD_ELEMENTS with field length adjustments.',
    classification: 'RED',
    disposition: 'REMEDIATE',
    priority: 'Critical',
    category: 'AUTO-FIXABLE',
    remediationOption: 'Automated Quick-Fix in ABAP Development Tools (ADT) / S4H Transformation Engine',
    cleanCoreCleanliness: 'Clean-Core Tier 2 (Custom ABAP on Released S/4 Objects)',
    hanaCompatibility: 'Fully compatible after transparent table query redirection',
    safetyLevel: 'Level 1 - Auto Fix',
    legacyCodeSnippet: 'SELECT knumv kposn kschl kbetr waers\n  FROM konv\n  INTO TABLE lt_pricing\n  WHERE knumv = lv_knumv.',
    remediatedCodeSnippet: 'SELECT knumv, kposn, kschl, kbetr, waers\n  FROM prcd_elements\n  INTO TABLE @DATA(lt_pricing)\n  WHERE knumv = @lv_knumv.',
    status: 'Pending'
  },
  {
    objectName: 'ZFI_GL_EXTRACTOR',
    objectType: 'Program',
    package: 'ZFI_FINANCE',
    owner: 'FIN_DEV_LEAD',
    module: 'FI',
    usage: 'Medium (Executed weekly for financial data warehousing)',
    lastUsageEvidence: 'ST03N recorded 42 executions in past 30 days',
    dependencies: ['BSIS', 'BSAS', 'BKPF', 'BSEG'],
    referencedTables: ['BSIS', 'BSAS'],
    s4Impact: 'Queries eliminated index tables BSIS/BSAS; runs through slow compatibility views if not refactored.',
    atcFinding: 'PERFORMANCE_S4: Direct index table query should be replaced by ACDOCA CDS View.',
    simplificationImpact: 'Simplification Item SI-003 (ACDOCA Universal Journal)',
    recommendedAction: 'Refactor program to consume standard CDS View I_JournalEntryItem for 100x speedup.',
    classification: 'ORANGE',
    disposition: 'REFACTOR',
    priority: 'Medium',
    category: 'DEVELOPER-FIX',
    remediationOption: 'Refactor SQL to query CDS View I_GLAccountLineItemRaw or ACDOCA',
    cleanCoreCleanliness: 'Clean-Core Tier 1 (Released Core Data Services View)',
    hanaCompatibility: 'Columnar memory optimized query',
    safetyLevel: 'Level 2 - Approval Required',
    legacyCodeSnippet: 'SELECT bukrs hkont belnr gjahr dmbtr shkzg\n  FROM bsis\n  INTO TABLE lt_open_items\n  WHERE bukrs = p_bukrs AND hkont IN s_hkont.',
    remediatedCodeSnippet: 'SELECT CompanyCode, GLAccount, AccountingDocument, FiscalYear, AmountInCompanyCodeCurrency\n  FROM I_JournalEntryItem\n  INTO TABLE @DATA(lt_open_items)\n  WHERE CompanyCode = @p_bukrs AND GLAccount IN @s_hkont AND IsCleared = \'\' .',
    status: 'Pending'
  },
  {
    objectName: 'Z_SD_LEGACY_TAX_CALC',
    objectType: 'Program',
    package: 'ZSD_LEGACY',
    owner: 'LEGACY_USER',
    module: 'SD',
    usage: 'None (0 executions recorded in past 36 months)',
    lastUsageEvidence: 'ST03N workload logs confirm 0 executions across all instances since 2023',
    dependencies: ['TTXJ', 'KONP'],
    referencedTables: ['TTXJ'],
    s4Impact: 'Hardcoded legacy tax routines obsolete in S/4 tax condition framework.',
    atcFinding: 'CLEAN_CORE: Inactive custom program candidate for retirement.',
    simplificationImpact: 'Clean Core Technical Debt Elimination',
    recommendedAction: 'Retire program from system landscape to reduce custom code footprint.',
    classification: 'BLUE',
    disposition: 'RETIRE',
    priority: 'Low',
    category: 'OBSOLETE',
    remediationOption: 'Archive source code to Git/SVN and delete repository entry in SE38/TADIR',
    cleanCoreCleanliness: 'Clean-Core Compliant (Zero Debt)',
    hanaCompatibility: 'N/A (Retirement candidate)',
    safetyLevel: 'Level 2 - Approval Required',
    legacyCodeSnippet: '* Legacy tax calculation routine from SAP R/3 4.6C\nPERFORM calculate_old_state_tax USING lv_amount.',
    remediatedCodeSnippet: '* Object retired in S/4HANA Brownfield Transformation.\n* Replaced by Standard Tax Determination Engine.',
    status: 'Pending'
  }
];

export const INITIAL_FUNCTIONAL_AREAS: FunctionalMigrationArea[] = [
  {
    module: 'FI/CO (Finance & Controlling)',
    agentId: 'FI_CO_AGENT',
    agentName: 'Universal Journal (ACDOCA) & New Asset Accounting Lead',
    eccCurrentState: 'Classic General Ledger with separate COEP, BSIS/BSAS, ANLC, and Costing-based CO-PA.',
    s4Impact: 'All line items unified into single table ACDOCA. Account-based CO-PA standard. Real-time asset postings.',
    requiredChange: 'Execute pre-conversion consistency check FINS_MIG_PRE_CHECKS; map secondary cost elements to G/L accounts.',
    migrationAction: 'Automated data migration in SUM downtime; post-conversion balance reconciliation.',
    testCase: 'TC-FIN-01 (General Ledger Balance Zero-Variance Audit)',
    validationEvidence: '100% balance reconciliation between FAGLFLEXT baseline and ACDOCA (82,910,400.00 USD).',
    status: 'Analyzed',
    crossModuleHandoffs: ['CVI_BP_AGENT (Customer/Vendor master reconciliation)', 'RECONCILIATION_AGENT (Zero-variance audit)']
  },
  {
    module: 'SD (Sales & Distribution)',
    agentId: 'SD_AGENT',
    agentName: 'Order-to-Cash & Sales Simplification Specialist',
    eccCurrentState: 'Classic pricing via KONV cluster table; status fields in VBUK/VBUP; SD credit management.',
    s4Impact: 'Pricing moved to transparent table PRCD_ELEMENTS. Status fields merged into VBAK/VBAP. FSCM credit mandatory.',
    requiredChange: 'Apply automated quick-fixes for custom reports querying KONV; configure FSCM Credit Management.',
    migrationAction: 'Remediate custom pricing ABAP routines; execute UKM_TRANSFER_VECTOR for credit limits.',
    testCase: 'TC-SD-01 (End-to-End Sales Order to Invoice Flow)',
    validationEvidence: '500 order pricing simulations completed with 0 calculation discrepancies.',
    status: 'Analyzed',
    crossModuleHandoffs: ['ABAP_AGENT (KONV syntax fixes)', 'CVI_BP_AGENT (Customer-to-BP sync)']
  }
];

export const INITIAL_FINANCE_TRANSFORMATION: FinanceTransformationData = {
  universalJournalStatus: 'CONFIGURED & READY (ACDOCA Staging Active)',
  acdocaAlignmentPercentage: 94.2,
  assetAccountingStatus: 'NEW ASSET ACCOUNTING (Active in Ledgers 0L & 2L)',
  materialLedgerStatus: 'ACTIVE IN ALL PRODUCTION PLANTS (1000, 1010, 1020)',
  creditManagementFscmStatus: 'FSCM CREDIT RULES CONFIGURED (UKMBP_CMS)',
  reconciliationSummary: {
    glBalances: '82,910,400.00 USD (Reconciled)',
    arBalances: '4,120,800.00 USD (Reconciled)',
    apBalances: '8,450,200.00 USD (Reconciled)',
    assetBalances: '18,640,000.00 USD (Reconciled)',
    variance: 'sh.00 (Zero Tolerance Reconciled)'
  },
  obsoleteStructuresRemediated: [
    { oldTable: 'KONV', newTarget: 'PRCD_ELEMENTS', usageCount: 24, status: 'Remediation Staged' },
    { oldTable: 'VBUK', newTarget: 'VBAK-GBSTK', usageCount: 14, status: 'Remediation Staged' },
    { oldTable: 'BSIS', newTarget: 'ACDOCA / I_JournalEntryItem', usageCount: 18, status: 'Remediation Staged' },
    { oldTable: 'MSEG', newTarget: 'MATDOC / V_MSEG', usageCount: 32, status: 'Compatibility View Active' }
  ]
};

export const INITIAL_CVI_BUSINESS_PARTNER: CviBusinessPartnerData = {
  totalCustomers: 1480,
  totalVendors: 920,
  synchronizedBPs: 2340,
  synchronizationRate: 97.5,
  cviCockpitStatus: 'SYNCHRONIZING (MDS_LOAD_COCKPIT Active)',
  numberRangeMappingStatus: 'SAME NUMBER RANGE ALIGNED (1:1 Mapping in SPRO)',
  duplicateRecordsIdentified: 18,
  mandatoryFieldErrors: 42,
  syncErrorsList: [
    { id: 'ERR-CVI-01', type: 'Customer', entityId: 'KUNNR 100482', errorMsg: 'Missing Postal Code for Country US', resolution: 'Updated Postal Code in KNA1', status: 'Resolved' },
    { id: 'ERR-CVI-02', type: 'Vendor', entityId: 'LIFNR 200194', errorMsg: 'Duplicate Tax Registration Number detected', resolution: 'Merged duplicate tax record in LFA1', status: 'Resolved' },
    { id: 'ERR-CVI-03', type: 'Customer', entityId: 'KUNNR 100891', errorMsg: 'Customer Account Group ZEXP missing BP Role assignment', resolution: 'Assigned BP Role FLCU01 in SPRO', status: 'Resolved' }
  ]
};

export const INITIAL_HANA_MIGRATION: HanaMigrationData = {
  sourceDb: 'SAP ASE 16.0 / DB6 (3,420 GB footprint)',
  targetHanaVersion: 'SAP HANA 2.0 SPS07 Revision 75',
  targetMemorySizingGB: 1840,
  cpuCoresAllocated: 64,
  compressionFactor: '3.2x Columnar Data Compression',
  rowStoreTableCount: 420,
  columnStoreTableCount: 8940,
  archivingOpportunitiesGB: 865,
  ilmCandidates: [
    { table: 'BSEG', description: 'Accounting Document Segment (> 5 Years Old)', currentGB: 680, archivableGB: 240 },
    { table: 'MSEG', description: 'Material Document Line Items (> 3 Years Old)', currentGB: 520, archivableGB: 190 },
    { table: 'EDID4', description: 'IDoc Data Segments (> 1 Year Old)', currentGB: 340, archivableGB: 280 }
  ],
  unicodeStatus: 'UNICODE UTF-16 ACTIVE (No conversion required)',
  dmoEligibility: 'Eligible (In-Place DMO)'
};

export const INITIAL_CLOUD_ARCHITECTURES: CloudArchitectureOption[] = [
  {
    provider: 'RISE_PRIVATE',
    name: 'RISE with SAP S/4HANA Cloud Private Edition',
    badge: 'SAP STRATEGIC TARGET',
    vmSizingHana: 'SAP HANA 2.0 High-Memory (2,048 GB RAM, 64 vCPU)',
    vmSizingApp: '3x PAS/AAS App Servers (64 GB RAM, 16 vCPU each)',
    storageConfig: 'Enterprise SSD Premium with 15,000 IOPS and sub-millisecond latency',
    networkTopology: 'Dedicated Private Interconnect with Dual Redundancy',
    haDrStrategy: 'HANA System Replication (HSR Active/Active) + Auto-Failover (< 60s RTO)',
    backupSolution: 'SAP Backint automated streaming backups with 15-min log snapshots',
    estimatedMonthlyCostUSD: 14200,
    rpoHours: 0.25,
    rtoMinutes: 45,
    slaAvailability: '99.9% Production Uptime SLA backed by SAP Enterprise Cloud Services',
    iacTerraformSnippet: '# RISE with SAP Landing Zone Architecture\nmodule "rise_private_cloud" {\n  source              = "sap/rise-private-edition/landingzone"\n  system_id           = "S10"\n  target_release      = "S4HANA_2023_FPS02"\n  hana_memory_gb      = 2048\n  app_servers_count   = 3\n  high_availability   = true\n  dr_replication_mode = "SYNCMEM"\n}',
    sapCertifiedNotes: ['SAP Note 2881023 (RISE Reference Architecture)', 'SAP Note 2914100 (ECS RACI Matrix)']
  },
  {
    provider: 'AWS',
    name: 'Amazon Web Services (AWS) Certified SAP Landscape',
    badge: 'HYPERSCALER CERTIFIED',
    vmSizingHana: 'EC2 u-6tb1.56xlarge / r5b.24xlarge (1,536 GB - 6,144 GB RAM)',
    vmSizingApp: '3x EC2 m5.4xlarge App Servers',
    storageConfig: 'Amazon EBS io2 Block Express (256,000 IOPS)',
    networkTopology: 'AWS Transit Gateway with Direct Connect 10 Gbps',
    haDrStrategy: 'Multi-AZ HANA System Replication with Pacemaker Cluster',
    backupSolution: 'AWS Backup with SAP HANA Backint agent to S3 Glacier',
    estimatedMonthlyCostUSD: 12800,
    rpoHours: 0.25,
    rtoMinutes: 30,
    slaAvailability: '99.95% Availability across Multi-AZ',
    iacTerraformSnippet: '# AWS SAP HANA Architecture\nresource "aws_instance" "sap_hana_primary" {\n  ami           = "ami-sap-sles15sp4-hana"\n  instance_type = "r5b.24xlarge"\n  tags = { Name = "SAP-HANA-S10-PRD" }\n}',
    sapCertifiedNotes: ['SAP Note 1656099 (SAP on AWS)', 'SAP Note 1656250 (SAP on Linux on EC2)']
  },
  {
    provider: 'AZURE',
    name: 'Microsoft Azure Certified SAP Landscape',
    badge: 'ENTERPRISE INTEGRATION',
    vmSizingHana: 'Azure M-Series M128ms (3.8 TB RAM, 128 vCPU)',
    vmSizingApp: '3x Azure E16ds_v5 App Servers',
    storageConfig: 'Azure NetApp Files (ANF) Ultra Performance Tier',
    networkTopology: 'Azure ExpressRoute FastPath with Hub-Spoke VNet',
    haDrStrategy: 'HSR with Azure Fencing Agent & Availability Zones',
    backupSolution: 'Azure Backup for SAP HANA with geo-redundant storage',
    estimatedMonthlyCostUSD: 13400,
    rpoHours: 0.25,
    rtoMinutes: 35,
    slaAvailability: '99.95% Single VM with Premium SSD',
    iacTerraformSnippet: '# Azure SAP HANA Architecture\nresource "azurerm_virtual_machine" "hana_primary" {\n  name                  = "vm-hana-s10-prd"\n  vm_size               = "Standard_M128ms"\n  delete_os_disk_on_termination = true\n}',
    sapCertifiedNotes: ['SAP Note 1928533 (SAP on Azure)', 'SAP Note 2015553 (SAP on Linux on Azure)']
  },
  {
    provider: 'GCP',
    name: 'Google Cloud Platform (GCP) Certified SAP Landscape',
    badge: 'BIGQUERY & AI ACCELERATED',
    vmSizingHana: 'GCP M3 Ultra-Memory (m3-ultramem-64, 1.9 TB RAM, 64 vCPU)',
    vmSizingApp: '3x GCP n2-standard-16 App Servers',
    storageConfig: 'Google Cloud Hyperdisk Extreme (Up to 300,000 IOPS)',
    networkTopology: 'Dedicated Cloud Interconnect 10 Gbps with Cloud Router',
    haDrStrategy: 'GCP Pacemaker VIP failover across dual zones',
    backupSolution: 'Google Cloud Storage for SAP with KMS Customer-Managed Keys',
    estimatedMonthlyCostUSD: 12200,
    rpoHours: 0.25,
    rtoMinutes: 30,
    slaAvailability: '99.95% Multi-Zone Compute Engine SLA',
    iacTerraformSnippet: '# GCP SAP HANA Architecture\nresource "google_compute_instance" "hana_primary" {\n  name         = "gcp-hana-s10-prd"\n  machine_type = "m3-ultramem-64"\n  zone         = "us-central1-a"\n}',
    sapCertifiedNotes: ['SAP Note 2456432 (SAP on GCP)', 'SAP Note 2588881 (HANA High Availability on GCP)']
  }
];

export const INITIAL_REHEARSAL_RUNS: RehearsalRunItem[] = [
  {
    id: 'REH-001',
    runName: 'Rehearsal 1: Sandbox Conversion (SBX)',
    targetEnvironment: 'Sandbox Instance (SBX-Client 100)',
    dateExecuted: '2026-07-15',
    totalDowntimeHours: 7.2,
    downtimeDmoMinutes: 280,
    downtimeFinMinutes: 110,
    downtimeValidationMinutes: 42,
    dataTransferredGB: 3420,
    transferSpeedMBs: 245,
    defectsDiscovered: 48,
    defectsResolved: 48,
    financialVariance: 'sh.00 (Zero Variance Reconciled)',
    status: 'COMPLETED',
    keyLearnings: [
      'Identified table splitting requirement for BSEG (split into 8 chunks for 4x R3load speedup).',
      'CVI synchronization errors resolved on 42 customer accounts before second rehearsal.',
      'Refined shadow instance memory parameter to 64 GB.'
    ]
  },
  {
    id: 'REH-002',
    runName: 'Rehearsal 2: Development Conversion (DEV)',
    targetEnvironment: 'Development Instance (DEV-Client 820)',
    dateExecuted: '2026-08-05',
    totalDowntimeHours: 5.4,
    downtimeDmoMinutes: 195,
    downtimeFinMinutes: 85,
    downtimeValidationMinutes: 44,
    dataTransferredGB: 3420,
    transferSpeedMBs: 320,
    defectsDiscovered: 18,
    defectsResolved: 18,
    financialVariance: 'sh.00 (Zero Variance Reconciled)',
    status: 'COMPLETED',
    keyLearnings: [
      'ABAP automated quick-fixes applied cleanly in SPDD/SPAU phase.',
      'Downtime reduced by 1.8 hours through parallel R3load process tuning.',
      'Fiori Launchpad catalogs activated automatically via /UI2/FLP task list.'
    ]
  },
  {
    id: 'REH-003',
    runName: 'Rehearsal 3: Dress Rehearsal (QAS Staging)',
    targetEnvironment: 'Quality Assurance Staging (QAS-Client 810)',
    dateExecuted: '2026-08-22',
    totalDowntimeHours: 4.4,
    downtimeDmoMinutes: 155,
    downtimeFinMinutes: 65,
    downtimeValidationMinutes: 44,
    dataTransferredGB: 3420,
    transferSpeedMBs: 390,
    defectsDiscovered: 4,
    defectsResolved: 4,
    financialVariance: 'sh.00 (Zero Tolerance Certified)',
    status: 'COMPLETED',
    keyLearnings: [
      'Achieved target downtime of 4.4 hours (well below 6.0 hour business limit).',
      'Zero dollar variance on GL, AR, AP, and Asset ledgers.',
      'End-to-end automated regression testing suite executed 100% green.'
    ]
  }
];

export const INITIAL_SUM_DMO_EXECUTION: SumDmoExecutionData = {
  currentPhase: 'PHASE 6: DOWNTIME MIGRATION & S/4 CONVERSION (MOD_TRANS -> DOWN)',
  phaseIndex: 6,
  totalPhases: 10,
  status: 'AWAITING_APPROVAL',
  activeStepName: 'PARALLEL R3LOAD TABLE CONVERSION (BSEG, MSEG, ACDOCA)',
  durationMinutes: 142,
  memoryUsageGB: 48.6,
  throughputMBs: 385,
  approvalRequired: true,
  approvalGateName: 'GATE 6: DOWNTIME COMMENCEMENT AUTHORIZATION',
  logs: [
    '2026-08-26 18:00:12 [INFO] SUM 2.0 SP18 initialized for SAP S/4HANA 2023 FPS02 conversion.',
    '2026-08-26 18:15:45 [INFO] Stack XML MP_S4H_2023_FPS02 validated against SAP Support Portal.',
    '2026-08-26 18:42:10 [INFO] Shadow instance build completed on port 3300; shadow repository active.',
    '2026-08-26 19:05:00 [INFO] SPDD dictionary adjustments executed with 0 syntax errors.',
    '2026-08-26 19:15:30 [INFO] R3load table splitting active: BSEG (8 chunks), MSEG (6 chunks), EDID4 (4 chunks).',
    '2026-08-26 19:22:00 [AWAIT] Human Approval Gate 6 requested for Downtime Execution Committal.'
  ],
  phaseList: [
    { phase: '1. PREPARATION', stepNumber: 1, status: 'COMPLETED', description: 'System checks, kernel verification, disk space sizing' },
    { phase: '2. INITIALIZATION', stepNumber: 2, status: 'COMPLETED', description: 'Configuration parameters, target S/4 stack XML load' },
    { phase: '3. EXTRACTION', stepNumber: 3, status: 'COMPLETED', description: 'Software packages extraction, tool verification' },
    { phase: '4. REPOSITORY CHECK', stepNumber: 4, status: 'COMPLETED', description: 'SPDD dictionary scan, shadow instance preparation' },
    { phase: '5. SHADOW BUILD', stepNumber: 5, status: 'COMPLETED', description: 'Shadow database tables created and populated' },
    { phase: '6. DOWNTIME CONVERSION', stepNumber: 6, status: 'IN_PROGRESS', description: 'Database migration (DMO), table restructuring to ACDOCA/MATDOC' },
    { phase: '7. POST-PROCESSING', stepNumber: 7, status: 'PENDING', description: 'SPAU modification adjustments, kernel switch' },
    { phase: '8. DATA CONVERSION', stepNumber: 8, status: 'PENDING', description: 'Universal Journal conversion (FINS_MIG)' },
    { phase: '9. VALIDATION', stepNumber: 9, status: 'PENDING', description: 'Zero-variance reconciliation, automated regression tests' },
    { phase: '10. CUTOVER & COMPLETION', stepNumber: 10, status: 'PENDING', description: 'Lock release, batch scheduler start, go-live signoff' }
  ]
};

export const INITIAL_SPDD_SPAU: SpddSpauAdjustmentItem[] = [
  {
    id: 'SPDD-001',
    objectName: 'VBAP (Sales Document Item)',
    type: 'Dictionary Object (SPDD)',
    sapStandardVersion: 'S/4HANA 2023 FPS02 Core Structure',
    customModificationDelta: 'Custom append structure ZAVBAP (3 custom fields for delivery priority)',
    recommendation: 'KEEP MODIFICATION',
    cleanCoreImpact: 'Clean-Core Tier 2 (Standard Append Structure in Customer Namespace)',
    justification: 'Append structure uses standard customer field namespace YY/ZZ without modifying standard SAP fields.'
  },
  {
    id: 'SPDD-002',
    objectName: 'MARA (General Material Data)',
    type: 'Dictionary Object (SPDD)',
    sapStandardVersion: 'S/4HANA 2023 FPS02 Extended 40-char MATNR',
    customModificationDelta: 'Direct table modification to add obsolete warranty field from 2012',
    recommendation: 'RESET TO SAP STANDARD',
    cleanCoreImpact: 'Eliminates 1 core modification; moves warranty data to standard material classification',
    justification: 'Field is no longer used; resetting to standard reduces technical debt and maintenance costs.'
  },
  {
    id: 'SPAU-001',
    objectName: 'MV45AFZZ (Sales Order Processing User Exit Include)',
    type: 'Repository Object (SPAU)',
    sapStandardVersion: 'SAP S/4HANA Sales Core Include',
    customModificationDelta: 'Direct code modification inside USEREXIT_SAVE_DOCUMENT_PREPARE',
    recommendation: 'REIMPLEMENT AS EXTENSION',
    cleanCoreImpact: 'Refactor user exit into standard BAdI BADI_SD_SALES_BASIC for clean-core compliance',
    justification: 'BAdI provides upgrade-safe extension point without modifying SAP standard includes.'
  }
];

export const INITIAL_FIORI_UX: FioriUxMigrationItem[] = [
  {
    eccTcode: 'VA01 / VA02 / VA03',
    fioriAppId: 'F1873',
    appTitle: 'Manage Sales Orders (Version 2)',
    paradigm: 'Fiori Elements',
    businessCatalog: 'SAP_SD_BC_SO_PROC_MC',
    odataService: 'C_SALESORDER_CDS (v2/v4)',
    adoptionBenefit: 'Real-time order status tracking, embedded analytics, and 40% fewer user clicks.'
  },
  {
    eccTcode: 'ME21N / ME22N / ME23N',
    fioriAppId: 'F0842A',
    appTitle: 'Manage Purchase Orders',
    paradigm: 'Fiori Elements',
    businessCatalog: 'SAP_MM_BC_PO_PROCESS_MC',
    odataService: 'C_PURCHASEORDER_FS_CDS',
    adoptionBenefit: 'Flexible multi-step mobile approval, supplier evaluation metrics on card header.'
  },
  {
    eccTcode: 'FBL1N / FBL5N',
    fioriAppId: 'F0711',
    appTitle: 'Manage Customer / Supplier Line Items',
    paradigm: 'Fiori Elements',
    businessCatalog: 'SAP_FIN_BC_AP_LINE_ITEMS',
    odataService: 'FAR_CUSTOMER_LINE_ITEMS_SRV',
    adoptionBenefit: 'Instant querying of multi-million row open item datasets powered by ACDOCA.'
  },
  {
    eccTcode: 'MIGO',
    fioriAppId: 'F1076',
    appTitle: 'Post Goods Receipt for Purchasing Document',
    paradigm: 'Freestyle UI5',
    businessCatalog: 'SAP_MM_BC_INV_DOC_PROC_MC',
    odataService: 'MM_IM_GR_PO_SRV',
    adoptionBenefit: 'Barcode scanning integration, mobile warehouse tablet execution.'
  }
];

export const INITIAL_SECURITY_MIGRATION: SecurityMigrationData = {
  pfcgRolesTotal: 640,
  rolesRequiringRemediation: 112,
  obsoleteAuthObjectsCount: 24,
  newS4AuthObjectsConfigured: 48,
  sodConflictScanStatus: '0 CRITICAL SOD CONFLICTS (Continuous Governance Active)',
  criticalSecurityFindings: [
    {
      roleName: 'Z_SD_SALES_REP',
      issue: 'Contains obsolete transaction code FD01 (Customer Creation).',
      affectedAuthObject: 'S_TCODE (FD01 -> BP / F1873)',
      remediation: 'Replace FD01 with transaction BP and assign Fiori Catalog SAP_SD_BC_SO_PROC_MC.',
      riskLevel: 'Medium'
    },
    {
      roleName: 'Z_MM_BUYER',
      issue: 'Contains obsolete transaction code XK01 (Vendor Creation).',
      affectedAuthObject: 'S_TCODE (XK01 -> BP)',
      remediation: 'Replace XK01 with transaction BP with role FLVN01.',
      riskLevel: 'Medium'
    },
    {
      roleName: 'Z_FI_ACCOUNTANT',
      issue: 'Missing authorization for New Asset Accounting object F_ANLA_BUK.',
      affectedAuthObject: 'F_ANLA_BUK (Depreciation Area Authorization)',
      remediation: 'Add F_ANLA_BUK to role and assign Company Codes 1000 and 1710.',
      riskLevel: 'High'
    }
  ]
};

export const INITIAL_INTEGRATION_IMPACTS: IntegrationImpactItem[] = [
  {
    id: 'INT-001',
    type: 'IDoc',
    name: 'ORDERS05 (Inbound Sales Orders from EDI Partner)',
    sourceSystem: 'OpenText / Sterling EDI Gateway',
    targetSystem: 'SAP S/4HANA (S10-100)',
    s4Status: 'WORKS AS-IS',
    remediationAction: 'IDoc segment structure 100% compatible; partner profile port repointed to S/4 target host.',
    regressionTestStatus: 'PASS'
  },
  {
    id: 'INT-002',
    type: 'RFC/BAPI',
    name: 'BAPI_SALESORDER_CREATEFROMDAT2',
    sourceSystem: 'Customer Self-Service Web Portal',
    targetSystem: 'SAP S/4HANA (S10-100)',
    s4Status: 'WORKS AS-IS',
    remediationAction: 'BAPI maintained in S/4 core; automatically maps to Business Partner and PRCD_ELEMENTS.',
    regressionTestStatus: 'PASS'
  },
  {
    id: 'INT-003',
    type: 'SOAP Web Service',
    name: 'Bank Payment XML (PaymentService_v1)',
    sourceSystem: 'SAP S/4HANA (S10-100)',
    targetSystem: 'JPMorgan Chase / SWIFT Gateway',
    s4Status: 'MODIFY',
    remediationAction: 'Update SSL client certificate and endpoints to ISO 20022 PAIN.001 standard.',
    regressionTestStatus: 'PASS'
  },
  {
    id: 'INT-004',
    type: 'CPI Flow',
    name: 'Salesforce CRM to SAP S/4 Customer Master Sync',
    sourceSystem: 'Salesforce Enterprise',
    targetSystem: 'SAP S/4HANA (S10-100)',
    s4Status: 'REPLACE',
    remediationAction: 'Replace custom RFC wrapper with SAP Standard OData API API_BUSINESS_PARTNER.',
    regressionTestStatus: 'PASS'
  }
];

export const INITIAL_UPGRADE_ERRORS: UpgradeErrorIntelligenceItem[] = [
  {
    id: 'ERR-001',
    errorPhase: 'PARALLEL_R3LOAD_IMPORT',
    logFile: '/usr/sap/put/log/SAPup.log',
    errorCode: 'SQL-00142',
    errorMessage: 'Table BSEG_CHUNK_04 import halted due to lock timeout on index creation.',
    affectedObjects: ['BSEG', 'ACDOCA'],
    probableRootCause: 'Concurrent index creation processes exceeded maximum database thread count.',
    sapNoteReference: 'SAP Note 2382997 (DMO R3load Parallel Tuning)',
    safeAutoRemediation: true,
    assignedSpecialistAgent: 'SUM_DMO_AGENT',
    fixStatus: 'RESOLVED'
  }
];

export const INITIAL_POST_UPGRADE_DEFECTS: PostUpgradeDefectItem[] = [
  {
    id: 'DEF-001',
    category: 'ST22 Dump',
    severity: 'High',
    technicalCause: 'SYNTAX_ERROR in custom report ZSD_INVOICE_PRINT referencing obsolete KONV structure.',
    businessImpact: 'Invoice printing failing for export shipments in Company Code 1710.',
    recommendedFix: 'Apply automated ATC Quick-Fix to redirect query to PRCD_ELEMENTS.',
    responsibleAgent: 'ABAP_AGENT',
    validationResult: 'Re-tested in QA; invoice PDF generated in 0.8s without errors.',
    status: 'Resolved'
  },
  {
    id: 'DEF-002',
    category: 'SM37 Failed Job',
    severity: 'Medium',
    technicalCause: 'Job SAPF181 failed due to obsolete clearing variant parameter.',
    businessImpact: 'Automated G/L clearing delayed by 1 cycle.',
    recommendedFix: 'Update job variant to reference ACDOCA clearing program.',
    responsibleAgent: 'FI_CO_AGENT',
    validationResult: 'Job scheduled and completed successfully in 4 minutes.',
    status: 'Resolved'
  },
  {
    id: 'DEF-003',
    category: 'WE02 Failed IDoc',
    severity: 'Medium',
    technicalCause: 'IDoc INVOIC02 status 51: Customer tax classification missing in BP master.',
    businessImpact: 'Inbound EDI invoice parked in error queue.',
    responsibleAgent: 'CVI_BP_AGENT',
    recommendedFix: 'Update customer tax classification in BP transaction and re-process via BD87.',
    validationResult: 'IDoc reprocessed with status 53 (Successfully Posted).',
    status: 'Resolved'
  }
];

export const INITIAL_AUTONOMOUS_REMEDIATIONS: AutonomousRemediationTask[] = [
  {
    id: 'REM-001',
    title: 'Redirect KONV Pricing Query to PRCD_ELEMENTS in ZSD_PRICING_REPORT',
    riskLevel: 'Level 1 - Auto Fix',
    beforeState: 'SELECT * FROM konv WHERE knumv = lv_knumv.',
    proposedChange: 'SELECT * FROM prcd_elements WHERE knumv = lv_knumv.',
    reason: 'KONV cluster eliminated in S/4HANA; transparent table PRCD_ELEMENTS required.',
    affectedObjects: ['ZSD_PRICING_REPORT'],
    executionResult: 'Code modified, compiled, and verified via ATC with 0 syntax errors.',
    validationStatus: '100% Validated (Pass)',
    rollbackProcedure: 'Restore original version from SAP Version Management in SE38.',
    auditTrail: 'Executed by ABAP_AGENT on 2026-08-26 18:30 UTC with SHA-256 verified signature.',
    isExecuted: true,
    isApproved: true
  },
  {
    id: 'REM-002',
    title: 'Harmonize Number Ranges for Customer Account Group ZDOM in CVI',
    riskLevel: 'Level 2 - Approval Required',
    beforeState: 'Customer Account Group ZDOM assigned internal number range 01 (100000-199999); BP Group assigned 02 (500000-599999).',
    proposedChange: 'Align BP Grouping to use same number range 01 with external number assignment in CVI customizing.',
    reason: 'Guarantees customer number equals Business Partner number in S/4HANA (1:1 Same Number principle).',
    affectedObjects: ['SPRO / CVI Customizing', 'KNA1', 'BUT000'],
    executionResult: 'Number range configuration updated in transport E10K902150.',
    validationStatus: 'Validated via /CVI/EVALUATION',
    rollbackProcedure: 'Revert SPRO table entry TBD001 to prior state.',
    auditTrail: 'Approved by Master Data Lead and applied by CVI_BP_AGENT.',
    isExecuted: true,
    isApproved: true
  }
];

export const INITIAL_REGRESSION_TESTS: RegressionTestCase[] = [
  {
    id: 'REG-001',
    scenario: 'Order-to-Cash',
    testCaseName: 'E2E Standard Sales Order (OR) -> Delivery (LF) -> PGI (601) -> Invoice (F2) -> ACDOCA Posting',
    steps: [
      'Create standard sales order (VA01) for Customer 100482, Plant 1000, 10 units of Material FERT-100.',
      'Verify automatic pricing determination via PRCD_ELEMENTS and tax calculation.',
      'Create outbound delivery (VL01N) and execute warehouse picking.',
      'Post Goods Issue (VL02N) and verify MATDOC creation.',
      'Generate billing invoice (VF01) and verify print output via BRF+.',
      'Verify ACDOCA universal journal entry and AR open item posting in FBL5N.'
    ],
    expectedOutcome: 'Complete sales cycle posts without error; pricing, tax, stock, and accounting entries match baseline exactly.',
    actualOutcome: 'Order 45000128 created, Delivery 80001920 posted, Invoice 90004120 generated. ACDOCA Doc 10000482 posted in 0.4s.',
    status: 'PASS',
    evidenceData: 'Sales Order: 45000128 | Delivery: 80001920 | Invoice: 90004120 | ACDOCA Doc: 10000482 (2,450.00 USD)'
  },
  {
    id: 'REG-002',
    scenario: 'Procure-to-Pay',
    testCaseName: 'E2E Standard Purchase Order (NB) -> Goods Receipt (101) -> Invoice Verification (MIRO) -> Payment (F110)',
    steps: [
      'Create standard purchase order (ME21N) for Vendor 200194, 50 units of Raw Material ROH-200.',
      'Post Goods Receipt (MIGO Movement 101) against PO.',
      'Verify material document creation in MATDOC and GR/IR clearing account posting.',
      'Post logistics invoice verification (MIRO) matching PO price and quantity.',
      'Execute automated payment run (F110) to generate bank clearing document.'
    ],
    expectedOutcome: 'Goods receipt creates MATDOC line; MIRO clears GR/IR and creates AP open item; F110 clears invoice cleanly.',
    actualOutcome: 'PO 45000982 created, MATDOC Doc 50001842 posted, Invoice 51000412 verified, Payment Doc 15000192 cleared.',
    status: 'PASS',
    evidenceData: 'PO: 45000982 | MATDOC: 50001842 | MIRO: 51000412 | Payment Doc: 15000192 (4,800.00 USD)'
  },
  {
    id: 'REG-003',
    scenario: 'Record-to-Report',
    testCaseName: 'General Ledger Journal Entry (FB50) -> Cost Center Allocation (KSU5) -> Balance Sheet Report (F.01)',
    steps: [
      'Post multi-line general ledger journal entry across 4 cost centers (FB50).',
      'Execute monthly cost center assessment cycle (KSU5).',
      'Generate balance sheet and P&L financial statement report (F.01).',
      'Verify ACDOCA multi-dimensional reporting by profit center and segment.'
    ],
    expectedOutcome: 'All postings update ACDOCA instantaneously with real-time derivation of profit center and segment.',
    actualOutcome: 'Journal Doc 10000940 posted; KSU5 cycle executed in 1.2s; F.01 report generated with sh.00 variance.',
    status: 'PASS',
    evidenceData: 'Journal Doc: 10000940 | Assessment Doc: 10000941 | Real-time ACDOCA derivation confirmed'
  }
];

export const INITIAL_DATA_RECONCILIATION: DataReconciliationItem[] = [
  {
    domain: 'General Ledger Balances',
    eccBaseline: '82,910,400.00 USD',
    s4HanaValue: '82,910,400.00 USD',
    variance: 'sh.00 (Zero Variance)',
    toleranceThreshold: 'sh.00 (Strict Zero Tolerance)',
    status: 'RECONCILED - ZERO VARIANCE',
    auditEvidence: 'Audit comparison between FAGLFLEXT trial balance and ACDOCA universal ledger across all 14 Company Codes.'
  },
  {
    domain: 'Open Accounts Receivable',
    eccBaseline: '4,120,800.00 USD (14,200 open items)',
    s4HanaValue: '4,120,800.00 USD (14,200 open items)',
    variance: 'sh.00 (Zero Variance)',
    toleranceThreshold: 'sh.00 (Strict Zero Tolerance)',
    status: 'RECONCILED - ZERO VARIANCE',
    auditEvidence: 'BSID customer open items compared 1:1 against ACDOCA open receivable items.'
  },
  {
    domain: 'Open Accounts Payable',
    eccBaseline: '8,450,200.00 USD (8,940 open items)',
    s4HanaValue: '8,450,200.00 USD (8,940 open items)',
    variance: 'sh.00 (Zero Variance)',
    toleranceThreshold: 'sh.00 (Strict Zero Tolerance)',
    status: 'RECONCILED - ZERO VARIANCE',
    auditEvidence: 'BSIK vendor open items matched 1:1 against ACDOCA open payable items.'
  },
  {
    domain: 'Material Stock Values',
    eccBaseline: '4,820,600.00 USD (42,000 material batches)',
    s4HanaValue: '4,820,600.00 USD (42,000 material batches)',
    variance: 'sh.00 (Zero Variance)',
    toleranceThreshold: 'sh.00 (Strict Zero Tolerance)',
    status: 'RECONCILED - ZERO VARIANCE',
    auditEvidence: 'MBEW / CKMLCR stock valuation matched against MATDOC and ACDOCA material ledger records.'
  },
  {
    domain: 'Asset Balance Balances',
    eccBaseline: '18,640,000.00 USD (6,400 asset items)',
    s4HanaValue: '18,640,000.00 USD (6,400 asset items)',
    variance: 'sh.00 (Zero Variance)',
    toleranceThreshold: 'sh.00 (Strict Zero Tolerance)',
    status: 'RECONCILED - ZERO VARIANCE',
    auditEvidence: 'ANLC asset master balance matched against New Asset Accounting ACDOCA depreciation areas.'
  }
];

export const INITIAL_CLEAN_CORE_SCORECARD: CleanCoreScorecard = {
  overallScore: 84.6,
  tier1CoreReleasedApisPercent: 48,
  tier2InAppExtensibilityPercent: 28,
  tier3SideBySideBtpPercent: 12,
  tier4TechnicalDebtPercent: 12,
  recommendations: [
    {
      priority: 'MANDATORY',
      title: 'Decommission 12 Inactive Custom Z-Programs',
      currentPattern: 'Orphaned Z-programs with 0 executions in past 36 months',
      modernTarget: 'Complete decommissioning and repository purge in SE38/TADIR',
      effort: '1 Day'
    },
    {
      priority: 'HIGH',
      title: 'Replace User Exits in MV45AFZZ with S/4 Standard BAdIs',
      currentPattern: 'Direct modification inside SAP standard sales order user exit include',
      modernTarget: 'Upgrade-safe BAdI BADI_SD_SALES_ITEM (Clean Core Tier 1)',
      effort: '3 Days'
    },
    {
      priority: 'MEDIUM',
      title: 'Migrate Custom Reports to Core Data Services (CDS) Analytical Views',
      currentPattern: 'Legacy ABAP SQL queries with complex internal table loops',
      modernTarget: 'Analytical CDS Views with Fiori Elements List Report',
      effort: '5 Days'
    }
  ]
};

export const INITIAL_CUTOVER_TASKS: CutoverTask[] = [
  { sequence: 1, task: 'Pre-Cutover User Lockout & Batch Job Suspension', ownerAgent: 'BASIS_AGENT', expectedDurationHours: 0.5, downtimeImpact: true, criticalPath: true, validationCheck: '0 active dialog users in SM04; 0 active batch jobs in SM37', status: 'COMPLETED' },
  { sequence: 2, task: 'Final Delta Data Replication & Database Freeze', ownerAgent: 'DATA_AGENT', expectedDurationHours: 0.5, downtimeImpact: true, criticalPath: true, validationCheck: '0 backlog in SLT / DB replication queues', status: 'COMPLETED' },
  { sequence: 3, task: 'SUM with DMO Technical Conversion Execution', ownerAgent: 'SUM_DMO_AGENT', expectedDurationHours: 2.2, downtimeImpact: true, criticalPath: true, validationCheck: 'SUM return code 0; shadow instance decommissioned', status: 'IN_PROGRESS' },
  { sequence: 4, task: 'Universal Journal (FINS_MIG) Financial Conversion', ownerAgent: 'FI_CO_AGENT', expectedDurationHours: 0.8, downtimeImpact: true, criticalPath: true, validationCheck: 'Zero-variance reconciliation confirmed across all ledgers', status: 'PENDING' },
  { sequence: 5, task: 'Automated Regression Testing & Smoke Scan', ownerAgent: 'TESTING_AGENT', expectedDurationHours: 0.4, downtimeImpact: true, criticalPath: true, validationCheck: '100% pass on core business process regression test suite', status: 'PENDING' },
  { sequence: 6, task: 'DNS Re-pointing, Interface Activation & System Open', ownerAgent: 'BASIS_AGENT', expectedDurationHours: 0.2, downtimeImpact: true, criticalPath: true, validationCheck: 'Production URL accessible; RFC destinations operational', status: 'PENDING' }
];

export const INITIAL_ROLLBACK_RULES: RollbackGateRule[] = [
  {
    id: 'RB-001',
    ruleId: 'RB-001',
    title: 'Financial Variance Exceeds Zero-Tolerance Threshold (sh.00)',
    triggerCondition: 'ACDOCA vs BSEG trial balance variance > sh.00 USD after financial conversion.',
    severity: 'CRITICAL_HALT',
    evaluationMetric: 'Financial Ledger Balance Discrepancy',
    threshold: 'sh.00 USD',
    currentStatus: 'NOMINAL (PROCEED)',
    requiredAuthorizer: 'Chief Financial Officer & Transformation Lead',
    rollbackAction: 'Restore target database to pre-downtime storage snapshot and halt cutover.',
    maxRtoHours: 1.5,
    targetPhase: 'FINS_MIG Conversion',
    decisionAuthority: 'CFO / Program Director'
  },
  {
    id: 'RB-002',
    ruleId: 'RB-002',
    title: 'SUM Conversion Exceeds Maximum Downtime Window (6.0 Hours)',
    triggerCondition: 'Elapsed downtime conversion time exceeds 5.5 hours without reaching post-processing phase.',
    severity: 'CRITICAL_HALT',
    evaluationMetric: 'Elapsed Downtime Window',
    threshold: '5.5 Hours',
    currentStatus: 'NOMINAL (PROCEED)',
    requiredAuthorizer: 'Chief Information Officer & Operations VP',
    rollbackAction: 'Unlock source ECC database, re-enable batch scheduler, and revert DNS routes to ECC 800.',
    maxRtoHours: 1.0,
    targetPhase: 'SUM Downtime Phase',
    decisionAuthority: 'CIO / Lead Basis Architect'
  }
];

export const INITIAL_KNOWLEDGE_GRAPH: KnowledgeGraphNode[] = [
  {
    id: 'KG-001',
    businessProcess: 'Order-to-Cash',
    sapModule: 'SD',
    transaction: 'VA01 (Create Sales Order)',
    program: 'SAPMV45A',
    customObject: 'ZSD_PRICING_REPORT',
    tableApi: 'KONV -> PRCD_ELEMENTS',
    simplificationItem: 'SI-001 (Pricing Table)',
    s4Replacement: 'PRCD_ELEMENTS (Transparent)',
    migrationTask: 'Apply ATC Quick-Fix to redirect query to PRCD_ELEMENTS',
    testCase: 'TC-SD-01 (Sales Order E2E)',
    result: 'PASS',
    evidence: 'ATC check return code 0; 500 pricing simulation tests passed'
  },
  {
    id: 'KG-002',
    businessProcess: 'Order-to-Cash',
    sapModule: 'SD / Master Data',
    transaction: 'FD01 -> BP',
    program: 'SAPMF02D -> SAPLBUS_LOCATOR',
    customObject: 'KNA1 Master Data',
    tableApi: 'KNA1 -> BUT000',
    simplificationItem: 'SI-002 (Business Partner CVI)',
    s4Replacement: 'BUT000 (Business Partner)',
    migrationTask: 'Run MDS_LOAD_COCKPIT master data synchronization',
    testCase: 'TC-CVI-01 (Customer to BP Sync)',
    result: 'PASS',
    evidence: '1,480 customers synchronized to BP with 0 errors'
  },
  {
    id: 'KG-003',
    businessProcess: 'Record-to-Report',
    sapModule: 'FI',
    transaction: 'FB50 (Enter G/L Account Doc)',
    program: 'SAPMF05A',
    customObject: 'ZFI_GL_EXTRACTOR',
    tableApi: 'BSIS/BSAS -> ACDOCA',
    simplificationItem: 'SI-003 (Universal Journal)',
    s4Replacement: 'ACDOCA Universal Journal',
    migrationTask: 'Refactor SQL query to reference CDS View I_JournalEntryItem',
    testCase: 'TC-FIN-01 (Trial Balance Reconciliation)',
    result: 'PASS',
    evidence: 'Zero dollar variance verified between baseline and ACDOCA'
  }
];

export const INITIAL_PLAN_MILESTONES: PlanMilestone[] = [
  { phase: 'Discover', task: 'ECC Landscape & Digital Blueprint Reverse Engineering', durationDays: 3, assignedAgent: 'ECC_DISCOVERY_AGENT', status: 'Completed', dependencies: [] },
  { phase: 'Prepare', task: 'Customer-Vendor Integration (CVI) Synchronization & Simplification Check', durationDays: 5, assignedAgent: 'CVI_BP_AGENT', status: 'Completed', dependencies: ['Discover'] },
  { phase: 'Explore', task: 'Cloud Architecture Landing Zone & IaC Provisioning', durationDays: 4, assignedAgent: 'RISE_SAP_AGENT', status: 'Completed', dependencies: ['Prepare'] },
  { phase: 'Realize', task: 'ABAP Automated Custom Code Remediation & Clean Core Optimization', durationDays: 6, assignedAgent: 'ABAP_AGENT', status: 'In Progress', dependencies: ['Explore'] },
  { phase: 'Realize', task: 'Dress Rehearsal Conversion & Zero-Variance Financial Reconciliation', durationDays: 3, assignedAgent: 'SUM_DMO_AGENT', status: 'In Progress', dependencies: ['Realize'] },
  { phase: 'Deploy', task: 'Production SUM with DMO Cutover & Go-Live Execution', durationDays: 1, assignedAgent: 'AUTONOMOUS_CUTOVER_AGENT', status: 'Pending', dependencies: ['Realize'] },
  { phase: 'Run', task: 'Hypercare & Autonomous Post-Conversion Health Governance', durationDays: 14, assignedAgent: 'POST_UPGRADE_AGENT', status: 'Pending', dependencies: ['Deploy'] }
];

export const INITIAL_RISK_ANALYSIS: RiskAnalysisItem[] = [
  {
    id: 'RSK-001',
    riskName: 'Customer/Vendor Master Data Quality Gaps in CVI',
    category: 'Functional',
    severity: 'High',
    rootCause: 'Historical customer records created without mandatory tax numbers or postal codes in ECC 800.',
    mitigationRecommendation: 'Execute automated CVI cleansing rules in MDS_LOAD_COCKPIT with master data governance signoff.'
  },
  {
    id: 'RSK-002',
    riskName: 'Custom ABAP Incompatibilities on S/4 Transparent Tables',
    category: 'Technical',
    severity: 'High',
    rootCause: '24 custom reports directly querying cluster table KONV or status table VBUK.',
    mitigationRecommendation: 'Apply automated ATC Quick-Fixes and enforce Clean Core Tier 1 CDS View adoption.'
  },
  {
    id: 'RSK-003',
    riskName: 'Downtime Conversion Exceeding Business Window',
    category: 'Infrastructure',
    severity: 'Medium',
    rootCause: 'Large database footprint (3.4 TB) requiring lengthy table migration times.',
    mitigationRecommendation: 'Implement advanced R3load table splitting (8 chunks on BSEG, 6 on MSEG) and high-speed memory streaming.'
  }
];

export const INITIAL_CERTIFICATION_SCORECARD: CertificationScorecard = {
  certificationStatus: 'S/4HANA PRODUCTION READY',
  overallScore: 94.8,
  technicalUpgradePassed: true,
  functionalReadinessPassed: true,
  customCodeRemediatedPassed: true,
  integrationsCertifiedPassed: true,
  securityGovernancePassed: true,
  dataReconciliationPassed: true,
  cutoverRunbookPassed: true,
  cleanCoreCompliancePassed: true,
  totalBlockersCount: 0,
  totalEvidenceCount: 312,
  certifiedBy: 'S4_MIGRATION_ORCHESTRATOR & Transformation Governance Board',
  certificationTimestamp: '2026-08-26 19:30 UTC'
};

export const INITIAL_MEMORY_LAYERS: MemoryLayerItem[] = [
  {
    layer: 'Working Memory',
    title: 'Active SUM Conversion Context',
    category: 'Technical Execution',
    content: 'Target release S/4HANA 2023 FPS02. Host s1.myerplabs.com:8085, Client 800. Parallel R3load process count: 16.',
    source: 'LIVE SAP',
    lastUpdated: '2026-08-26 19:25 UTC'
  },
  {
    layer: 'Project Memory',
    title: 'Rehearsal Run 3 Verification Benchmarks',
    category: 'Quality & Benchmarking',
    content: 'Target downtime achieved: 4.4 Hours. Financial balance variance: sh.00 USD. 100% of regression test cases passed.',
    source: 'LOG',
    lastUpdated: '2026-08-26 18:40 UTC'
  },
  {
    layer: 'SAP Knowledge Layer',
    title: 'S/4HANA 2023 Simplification Item Knowledge Base',
    category: 'SAP Knowledge Base',
    content: 'Indexed 48 Simplification Items covering ACDOCA, MATDOC, PRCD_ELEMENTS, CVI BUT000, New Asset Accounting, and BRF+.',
    source: 'DOCUMENTATION',
    lastUpdated: '2026-08-26 17:00 UTC'
  }
];
