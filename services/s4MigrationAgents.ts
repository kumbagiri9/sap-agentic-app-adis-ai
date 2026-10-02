import { SapAgent } from '../types';
import { AgentHandoffProtocol } from './s4MigrationTypes';

export const SPECIALIZED_MIGRATION_AGENTS: SapAgent[] = [
  // 1. Master Migration Super Agent / Orchestrator
  {
    id: 'S4_MIGRATION_ORCHESTRATOR',
    name: 'S4_MIGRATION_ORCHESTRATOR',
    avatar: '👑',
    module: 'ORCH-MIG',
    role: 'Autonomous Migration Master Orchestrator & Governance Lead',
    status: 'Orchestrating',
    heartbeat: 'Active (15ms)',
    capability: 'End-to-end 14-stage DAG migration governance, multi-agent dispatch, cross-module dependency resolution, and human approval gating.',
    subArea: 'Master Governance',
    diagnosticCount: 312
  },
  // 2. ECC Full System Discovery Agent
  {
    id: 'ECC_DISCOVERY_AGENT',
    name: 'ECC_DISCOVERY_AGENT',
    avatar: '🔍',
    module: 'DISC-MIG',
    role: 'ECC Landscape & Digital Blueprint Reverse Engineer',
    status: 'Orchestrating',
    heartbeat: 'Active (30ms)',
    capability: 'Live discovery of ECC host, client 800, EhP8, NetWeaver 7.50, kernel 753, OS, DB, installed components, add-ons, business functions, active modules, and repository catalog.',
    subArea: 'System Discovery',
    diagnosticCount: 145
  },
  // 3. SAP Readiness Auditor Agent
  {
    id: 'READINESS_AGENT',
    name: 'READINESS_AGENT',
    avatar: '📋',
    module: 'READ-MIG',
    role: 'SAP Readiness Check 2.0 & Prerequisite Auditor',
    status: 'Orchestrating',
    heartbeat: 'Active (40ms)',
    capability: 'SAP Readiness Check execution, Maintenance Planner stack XML evaluation, add-on compatibility verification, and mathematical score calculation.',
    subArea: 'Readiness Audit',
    diagnosticCount: 118
  },
  // 4. Simplification Catalog Evaluator Agent
  {
    id: 'SIMPLIFICATION_AGENT',
    name: 'SIMPLIFICATION_AGENT',
    avatar: '📚',
    module: 'SIMP-MIG',
    role: 'Simplification Item Catalog & Target Release Evaluator',
    status: 'Orchestrating',
    heartbeat: 'Active (35ms)',
    capability: 'Maps target S/4HANA Simplification Items against actual ECC usage, detecting blocker items across Finance, SD, MM, PP, and Basis.',
    subArea: 'Simplification',
    diagnosticCount: 126
  },
  // 5. ABAP Transformation & Clean Core Agent
  {
    id: 'ABAP_AGENT',
    name: 'ABAP_AGENT',
    avatar: '💻',
    module: 'ABAP-TRANS',
    role: 'ABAP Test Cockpit (ATC) & Custom Code Remediation Lead',
    status: 'Orchestrating',
    heartbeat: 'Active (25ms)',
    capability: 'ATC check runs, 40-char MATNR adjustments, KONV/BSEG SQL refactoring, CDS View wrapping, and SPDD/SPAU modification reset proposals.',
    subArea: 'Custom Code',
    diagnosticCount: 210
  },
  // 6. Basis Infrastructure & System Engineer
  {
    id: 'BASIS_AGENT',
    name: 'BASIS_AGENT',
    avatar: '🛠️',
    module: 'BASIS-MIG',
    role: 'SAP Basis & Landscape Transformation Engineer',
    status: 'Orchestrating',
    heartbeat: 'Active (35ms)',
    capability: 'Kernel upgrades, TMS transport landscape harmonization, Unicode validation, RFC destination re-pointing, and background job schedule migration.',
    subArea: 'Basis & Technical',
    diagnosticCount: 134
  },
  // 7. SAP HANA Sizing & In-Memory Architect
  {
    id: 'HANA_AGENT',
    name: 'HANA_AGENT',
    avatar: '⚡',
    module: 'HANA-MIG',
    role: 'SAP HANA In-Memory Sizing & Column-Store Architect',
    status: 'Orchestrating',
    heartbeat: 'Active (40ms)',
    capability: 'QuickSizer memory calculation, /SDF/HANA_BW_SIZING analysis, row/column store distribution, and ILM archiving volume reduction.',
    subArea: 'Database & HANA',
    diagnosticCount: 95
  },
  // 8. Financials & Universal Journal (FI/CO) Lead
  {
    id: 'FI_CO_AGENT',
    name: 'FI_CO_AGENT',
    avatar: '🏛️',
    module: 'FI-CO-MIG',
    role: 'Universal Journal (ACDOCA) & New Asset Accounting Lead',
    status: 'Orchestrating',
    heartbeat: 'Active (30ms)',
    capability: 'BSEG/BSIS to ACDOCA conversion, New Asset Accounting consistency checks (FINS_MIG_AA), Material Ledger activation, and Margin Analysis.',
    subArea: 'Financials',
    diagnosticCount: 168
  },
  // 9. Order-to-Cash & SD Specialist
  {
    id: 'SD_AGENT',
    name: 'SD_AGENT',
    avatar: '🛍️',
    module: 'SD-MIG',
    role: 'Order-to-Cash & Sales Simplification Specialist',
    status: 'Orchestrating',
    heartbeat: 'Active (40ms)',
    capability: 'PRCD_ELEMENTS pricing migration, VBUK/VBUP status field elimination, BRF+ Output Management, and condition contract settlement.',
    subArea: 'Sales & Distribution',
    diagnosticCount: 104
  },
  // 10. Procure-to-Pay & MM Specialist
  {
    id: 'MM_PROCUREMENT_AGENT',
    name: 'MM_PROCUREMENT_AGENT',
    avatar: '📦',
    module: 'MM-MIG',
    role: 'Procure-to-Pay & MATDOC Inventory Architect',
    status: 'Orchestrating',
    heartbeat: 'Active (35ms)',
    capability: 'MSEG/MKPF to MATDOC migration, Material Master 40-char field length readiness, Purchase Order approval workflows, and Sourcing integration.',
    subArea: 'Materials Management',
    diagnosticCount: 98
  },
  // 11. Manufacturing & PP Specialist
  {
    id: 'PP_AGENT',
    name: 'PP_AGENT',
    avatar: '⚙️',
    module: 'PP-MIG',
    role: 'MRP Live in HANA & Manufacturing Specialist',
    status: 'Orchestrating',
    heartbeat: 'Active (45ms)',
    capability: 'MRP Live (MD01N) migration, Planning File (DBVM to MDVM) conversion, Production Order execution, and Capacity Leveling in S/4.',
    subArea: 'Production Planning',
    diagnosticCount: 76
  },
  // 12. Quality Management (QM) Specialist
  {
    id: 'QM_AGENT',
    name: 'QM_AGENT',
    avatar: '🔬',
    module: 'QM-MIG',
    role: 'Quality Management & Inspection Lot Auditor',
    status: 'Orchestrating',
    heartbeat: 'Active (50ms)',
    capability: 'Inspection lot processing (QA01/QA03), Quality notifications (QN01), and integration with MATDOC goods receipt checks.',
    subArea: 'Quality Management',
    diagnosticCount: 62
  },
  // 13. Plant Maintenance (PM / EAM) Specialist
  {
    id: 'PM_AGENT',
    name: 'PM_AGENT',
    avatar: '🔧',
    module: 'PM-MIG',
    role: 'Enterprise Asset Management & Maintenance Specialist',
    status: 'Orchestrating',
    heartbeat: 'Active (45ms)',
    capability: 'Equipment/Functional Location hierarchy, Maintenance Orders (IW31), Linear Asset Management, and Maintenance Plans.',
    subArea: 'Plant Maintenance',
    diagnosticCount: 70
  },
  // 14. Warehouse Management & EWM Specialist
  {
    id: 'WM_EWM_AGENT',
    name: 'WM_EWM_AGENT',
    avatar: '🏭',
    module: 'EWM-MIG',
    role: 'Classic WM to Embedded EWM Conversion Architect',
    status: 'Orchestrating',
    heartbeat: 'Active (40ms)',
    capability: 'Classic WM (LE-WM) storage types and bin mapping to S/4HANA Embedded EWM warehouse structures and warehouse task dispatch.',
    subArea: 'Warehouse Management',
    diagnosticCount: 88
  },
  // 15. Human Capital Management (HCM) Lead
  {
    id: 'HCM_AGENT',
    name: 'HCM_AGENT',
    avatar: '👥',
    module: 'HCM-MIG',
    role: 'SAP HCM / SuccessFactors & H4S4 Architect',
    status: 'Orchestrating',
    heartbeat: 'Active (55ms)',
    capability: 'Personnel Administration, Org Management, Time Management, and SAP H4S4 (Human Capital Management for S/4HANA) transition.',
    subArea: 'Human Resources',
    diagnosticCount: 54
  },
  // 16. Security, Authorizations & SoD Governance Lead
  {
    id: 'SECURITY_AGENT',
    name: 'SECURITY_AGENT',
    avatar: '🔒',
    module: 'SEC-MIG',
    role: 'PFCG Role Remediation & Fiori Authorizations Lead',
    status: 'Orchestrating',
    heartbeat: 'Active (30ms)',
    capability: 'SU25 upgrade step execution, obsolete transaction code removal from PFCG roles, Fiori Catalog/Group assignment, and SoD conflict scanning.',
    subArea: 'Security & Governance',
    diagnosticCount: 142
  },
  // 17. User Experience & SAP Fiori Transformation Lead
  {
    id: 'FIORI_AGENT',
    name: 'FIORI_AGENT',
    avatar: '✨',
    module: 'FIORI-MIG',
    role: 'SAP Fiori Launchpad & UX Modernization Lead',
    status: 'Orchestrating',
    heartbeat: 'Active (35ms)',
    capability: 'SAP Fiori Apps Reference Library mapping, Spaces and Pages setup, OData v2/v4 service activation, and GUI transaction wrapping.',
    subArea: 'User Experience',
    diagnosticCount: 110
  },
  // 18. Integration & Interface Lead
  {
    id: 'INTEGRATION_AGENT',
    name: 'INTEGRATION_AGENT',
    avatar: '🔌',
    module: 'INT-MIG',
    role: 'IDoc, RFC, Web Services & SAP Integration Lead',
    status: 'Orchestrating',
    heartbeat: 'Active (30ms)',
    capability: 'IDoc segment compatibility, RFC destination connectivity, SOAP/REST APIs, CPI integration flows, and EDI partner profile validation.',
    subArea: 'Integration',
    diagnosticCount: 128
  },
  // 19. Customer-Vendor Integration (CVI) & Business Partner Lead
  {
    id: 'CVI_BP_AGENT',
    name: 'CVI_BP_AGENT',
    avatar: '👤',
    module: 'BP-CVI',
    role: 'Customer-Vendor-Integration & Business Partner Lead',
    status: 'Orchestrating',
    heartbeat: 'Active (25ms)',
    capability: 'MDS_LOAD_COCKPIT execution, KNA1/LFA1 to BUT000 synchronization, number range alignment, and pre-check error resolution.',
    subArea: 'Master Data & CVI',
    diagnosticCount: 175
  },
  // 20. Data Volume Management & ILM Archiving Lead
  {
    id: 'DATA_AGENT',
    name: 'DATA_AGENT',
    avatar: '🗄️',
    module: 'DATA-MIG',
    role: 'Data Volume Management & ILM Archiving Specialist',
    status: 'Orchestrating',
    heartbeat: 'Active (40ms)',
    capability: 'Technical database cleanup, historical transaction archiving (SARA), residence time configuration, and migration payload optimization.',
    subArea: 'Data Management',
    diagnosticCount: 92
  },
  // 21. SUM / DMO Conversion Technical Lead
  {
    id: 'SUM_DMO_AGENT',
    name: 'SUM_DMO_AGENT',
    avatar: '🚀',
    module: 'SUM-DMO',
    role: 'Software Update Manager (SUM) with DMO Conversion Lead',
    status: 'Orchestrating',
    heartbeat: 'Active (20ms)',
    capability: 'SUM 10-phase conversion lifecycle, shadow instance build, R3load table splitting, in-flight data migration, and downtime optimization.',
    subArea: 'Technical Conversion',
    diagnosticCount: 190
  },
  // 22. Automated Regression Testing Factory Lead
  {
    id: 'TESTING_AGENT',
    name: 'TESTING_AGENT',
    avatar: '✔️',
    module: 'TEST-MIG',
    role: 'End-to-End Automated Regression Testing Factory Lead',
    status: 'Orchestrating',
    heartbeat: 'Active (35ms)',
    capability: 'Automated test suite execution for O2C, P2P, R2R, Plan-to-Produce, and EWM scenarios comparing ECC baseline vs S/4 target results.',
    subArea: 'Testing & Quality',
    diagnosticCount: 156
  },
  // 23. Zero-Variance Financial & Material Reconciler
  {
    id: 'RECONCILIATION_AGENT',
    name: 'RECONCILIATION_AGENT',
    avatar: '⚖️',
    module: 'RECON-MIG',
    role: 'Zero-Tolerance Financial & Material Data Reconciler',
    status: 'Orchestrating',
    heartbeat: 'Active (25ms)',
    capability: 'ACDOCA vs BSEG balance matching, Open AR/AP item matching, MATDOC vs MSEG inventory valuation audit, and zero-variance certification.',
    subArea: 'Reconciliation',
    diagnosticCount: 148
  },
  // 24. Post-Conversion Forensics & Self-Healing Agent
  {
    id: 'POST_UPGRADE_AGENT',
    name: 'POST_UPGRADE_AGENT',
    avatar: '🩺',
    module: 'POST-MIG',
    role: 'Post-Conversion Health, Dump Forensics & Hypercare Lead',
    status: 'Orchestrating',
    heartbeat: 'Active (30ms)',
    capability: 'ST22 dump scanning, SM37 failed job triage, WE02 IDoc error resolution, SM58 transactional RFC recovery, and Fiori service diagnostics.',
    subArea: 'Post-Conversion & Hypercare',
    diagnosticCount: 122
  }
];

export const INITIAL_AGENT_HANDOFFS: AgentHandoffProtocol[] = [
  {
    id: 'HND-001',
    sourceAgent: 'ECC_DISCOVERY_AGENT',
    targetAgent: 'CVI_BP_AGENT',
    system: 'ECC (E10)',
    client: '800',
    issueTask: 'Dispatch 1,480 Customer & 920 Vendor master records for CVI pre-conversion synchronization',
    evidence: 'Live KNA1 (1,480) and LFA1 (920) active accounts discovered with open transactional orders',
    affectedObjects: ['KNA1', 'LFA1', 'MDS_LOAD_COCKPIT', 'CVI_PRECHECK'],
    severity: 'High',
    dependency: 'Required before SUM Execution Phase (MOD_TRANS)',
    recommendedAction: 'Execute CVI Cockpit validation and align number range assignments in SPRO',
    requiredApproval: 'Master Data Governance Lead Approval',
    validationCriteria: '0 blocking errors in /CVI/EVALUATION',
    status: 'IN_PROGRESS'
  },
  {
    id: 'HND-002',
    sourceAgent: 'SIMPLIFICATION_AGENT',
    targetAgent: 'ABAP_AGENT',
    system: 'ECC (E10)',
    client: '800',
    issueTask: 'Remediate 24 custom Z-programs referencing obsolete tables KONV, VBUK, and BSEG index queries',
    evidence: 'ATC Run S4H_CORRECTION identified syntax errors and direct cluster table queries',
    affectedObjects: ['ZSD_PRICING_REPORT', 'ZFI_GL_EXTRACTOR', 'ZMM_INVENTORY_VAL', 'KONV', 'VBUK'],
    severity: 'Critical',
    dependency: 'Blocking SUM SPAU adjustment phase',
    recommendedAction: 'Apply automated Quick-Fix to redirect KONV to PRCD_ELEMENTS and VBUK to VBAK-GBSTK',
    requiredApproval: 'ABAP Development Lead & Functional Owner',
    validationCriteria: 'ATC check return code 0 (Green)',
    status: 'DISPATCHED'
  },
  {
    id: 'HND-003',
    sourceAgent: 'FI_CO_AGENT',
    targetAgent: 'RECONCILIATION_AGENT',
    system: 'S/4HANA (S10)',
    client: '100',
    issueTask: 'Execute pre-conversion balance snapshot across GL 1000/1710, AR, AP, and Asset registers',
    evidence: 'FAGLFLEXT GL totals: 82,910,400.00 USD captured for 14 Company Codes',
    affectedObjects: ['FAGLFLEXT', 'BSIS', 'BSAS', 'BSID', 'BSIK', 'ANLC'],
    severity: 'Critical',
    dependency: 'Mandatory before opening target S/4HANA client for business postings',
    recommendedAction: 'Run automated reconciliation comparator against target ACDOCA universal ledger',
    requiredApproval: 'Corporate Financial Controller Sign-off',
    validationCriteria: 'Zero dollar variance (sh.00) across all ledgers',
    status: 'ACKNOWLEDGED'
  },
  {
    id: 'HND-004',
    sourceAgent: 'SUM_DMO_AGENT',
    targetAgent: 'POST_UPGRADE_AGENT',
    system: 'S/4HANA (S10)',
    client: '100',
    issueTask: 'Perform post-conversion smoke scan across ST22 dumps, SM37 jobs, and inactive DDIC objects',
    evidence: 'SUM conversion completed in 4.4 hours; shadow instance decommissioned cleanly',
    affectedObjects: ['ST22', 'SM37', 'SE80', 'WE02', '/IWFND/ERROR_LOG'],
    severity: 'High',
    dependency: 'Required for Hypercare Day 1 readiness gate',
    recommendedAction: 'Inspect system logs and trigger automated re-compilation of inactive includes',
    requiredApproval: 'Basis Operations Lead',
    validationCriteria: 'Zero critical P1 dumps in ST22',
    status: 'COMPLETED'
  }
];
