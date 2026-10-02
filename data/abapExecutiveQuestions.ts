import { AbapExecutiveQuestionAnswer } from '../types';

export const ALL_ABAP_EXECUTIVE_QUESTIONS: AbapExecutiveQuestionAnswer[] = [
  // ==========================================================================
  // PILLAR 1: CODE ANALYSIS (Q1 - Q10)
  // ==========================================================================
  {
    questionId: 'Q1',
    questionText: 'Explain what this ABAP program does.',
    category: 'Code Analysis',
    sapSourceTables: ['PROGDIR', 'D010TAB', 'CROSS', 'TADIR'],
    summaryAnswer: 'Program ZSD_SO_PROCESSING processes open Sales Orders from VBAK/VBAP, executes credit limit checks via BAPI_CREDIT_CHECK, updates partner functions in VBPA, and posts billing document triggers in S/4HANA 2023.',
    keyInsights: [
      'Orchestrates Sales Order processing for Sales Org 1000 and 2000.',
      'Calls BAPI_SALESORDER_SIMULATE for live tax and credit calculation.',
      'Encapsulates business logic within Clean Core class ZCL_SD_SO_BEHAVIOR.',
      'Includes automatic error logging to Application Log SLG1 object ZSD_ORDERS.'
    ],
    codeSnippet: `REPORT zsd_so_processing.
DATA: lt_orders TYPE TABLE OF vbak.

SELECT vbeln, erdat, netwr, waerk, kunnr
  FROM vbak
  INTO TABLE @lt_orders
 WHERE vkorg = '1000' AND status = 'OPEN'.

LOOP AT lt_orders ASSIGNING FIELD-SYMBOL(<fs_so>).
  zcl_sd_order_handler=>process_order( <fs_so>-vbeln ).
ENDLOOP.`,
    abapMetrics: [
      { label: 'Lines of Code', value: '420 LOC', status: 'neutral' },
      { label: 'Complexity Index', value: 'Low (14)', status: 'positive' },
      { label: 'Clean Core Score', value: '98%', status: 'positive' },
      { label: 'DB Tables Read', value: 'VBAK, VBAP, KNA1', status: 'neutral' }
    ],
    breakdownData: [
      { category: 'Data Retrieval', value: 'VBAK / VBAP', variance: 'Direct SQL', detail: 'Reads open order headers & items' },
      { category: 'Credit Validation', value: 'BAPI_CREDIT_CHECK', variance: 'Standard API', detail: 'Evaluates customer credit exposure' },
      { category: 'Persistence', value: 'ZCL_SD_ORDER_HANDLER', variance: 'Clean Core', detail: 'Modular OOP execution' }
    ],
    recommendedSapActions: [
      { actionName: 'Inspect Source in SE80', tcode: 'SE80', description: 'Open program in Object Navigator' },
      { actionName: 'Launch ABAP Cross-Reference', tcode: 'CROSS', description: 'View where-used table dependencies' }
    ]
  },
  {
    questionId: 'Q2',
    questionText: 'Show all custom Z programs changed this week.',
    category: 'Code Analysis',
    sapSourceTables: ['E070', 'E071', 'TADIR', 'PROGDIR'],
    summaryAnswer: 'Inspected S/4HANA Transport Logs (E070/E071) and TADIR for Client 100. Identified 8 modified custom Z-programs across Workbench Transports DEVK900185 through DEVK900192 during the current week.',
    keyInsights: [
      '8 custom programs modified by 3 developers (KBAGIRI, DEV_S4H, CHEN_L).',
      '5 changes are in package $Z_SD, 2 in $Z_MM, and 1 in $Z_FI.',
      'All 8 transports passed preliminary ATC Clean Core release checks.',
      'No locking conflicts detected in SE09/SE10 transport queues.'
    ],
    codeSnippet: `SELECT e071~obj_name, e070~trkorr, e070~as4user, e070~as4date
  FROM e071
  INNER JOIN e070 ON e071~trkorr = e070~trkorr
 WHERE e071~pgmid = 'R3TR'
   AND e071~object = 'PROG'
   AND e071~obj_name LIKE 'Z%'
   AND e070~as4date >= @( cl_abap_context_info=>get_system_date( ) - 7 )
  INTO TABLE @DATA(lt_changed_progs).`,
    abapMetrics: [
      { label: 'Z-Programs Changed', value: '8 Programs', status: 'neutral' },
      { label: 'Active Transports', value: '6 Transports', status: 'neutral' },
      { label: 'ATC Release Pass', value: '100% Passed', status: 'positive' },
      { label: 'Developers Involved', value: '3 Active Devs', status: 'positive' }
    ],
    breakdownData: [
      { category: 'ZSD_SO_PROCESSING', value: 'DEVK900192', variance: '2026-08-24', detail: 'Added tax condition logic' },
      { category: 'ZMM_GR_INSPECTION', value: 'DEVK900190', variance: '2026-08-23', detail: 'Goods receipt MIGO enhancement' },
      { category: 'ZFI_ACDOCA_AUDIT', value: 'DEVK900188', variance: '2026-08-22', detail: 'General ledger reconciliation' },
      { category: 'ZSD_BILLING_EXPORT', value: 'DEVK900185', variance: '2026-08-21', detail: 'Invoice OData V4 integration' }
    ],
    recommendedSapActions: [
      { actionName: 'Open Transport Organizer', tcode: 'SE09', description: 'Review active developer workbench requests' },
      { actionName: 'Run TMS Import Queue', tcode: 'STMS', description: 'Inspect QA system import queue' }
    ]
  },
  {
    questionId: 'Q3',
    questionText: 'Which custom objects are used by Sales Order processing?',
    category: 'Code Analysis',
    sapSourceTables: ['TADIR', 'WBCROSSGT', 'CROSS', 'RODIR'],
    summaryAnswer: 'Sales Order processing utilizes 12 custom S/4HANA objects: 2 RAP Business Objects (ZI_SALESORDER_R, ZC_SALESORDER_M), 1 CDS Projection View, 1 Gateway OData V4 Service, 2 BAdI implementations in BADI_SD_SALES_BASIC, and 6 custom domain classes.',
    keyInsights: [
      'Core RAP BO ZI_SALESORDER_R handles root entity CRUD operations.',
      'BAdI implementation ZES_SD_CHECK enforces customer credit thresholds.',
      'Legacy USEREXIT_SAVE_DOCUMENT_PREPARATION in MV45AFZZ is fully refactored into Clean Core BAdIs.',
      'Zero direct table modifications on VBAK/VBAP exist.'
    ],
    codeSnippet: `/* SALES ORDER CUSTOM ARCHITECTURE MATRIX */
Package: $Z_SD_SALES
 - RAP BO: ZI_SALESORDER_R (Behavior Pool: ZBP_I_SALESORDER_R)
 - Projection: ZC_SALESORDER_M (UI Annotations for Fiori Elements)
 - OData V4 Service: ZUI_SALESORDER_V4 (Published in /IWFND/V4_ADMIN)
 - BAdI: BADI_SD_SALES_BASIC (Implementation: ZES_SD_CHECK)
 - Helper Classes: ZCL_SD_PRICING_ENGINE, ZCL_SD_TAX_CALCULATOR`,
    abapMetrics: [
      { label: 'Total Custom Objects', value: '12 Objects', status: 'neutral' },
      { label: 'RAP BOs', value: '2 BOs', status: 'positive' },
      { label: 'Clean Core Score', value: '100%', status: 'positive' },
      { label: 'Legacy UserExits', value: '0 (Refactored)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'RAP Architecture', value: 'ZI_SALESORDER_R', variance: 'Managed BO', detail: 'Root entity with draft capabilities' },
      { category: 'Service Binding', value: 'ZUI_SALESORDER_V4', variance: 'OData V4', detail: 'Fiori Elements application endpoint' },
      { category: 'Enhancement Spot', value: 'ZES_SD_CHECK', variance: 'Kernel BAdI', detail: 'Credit validation prior to commit' }
    ],
    recommendedSapActions: [
      { actionName: 'Explore Object Navigator', tcode: 'SE80', description: 'Inspect package $Z_SD_SALES objects' },
      { actionName: 'Maintain Service Bindings', tcode: '/IWFND/V4_ADMIN', description: 'Monitor OData V4 service endpoints' }
    ]
  },
  {
    questionId: 'Q4',
    questionText: 'Find where table VBAK is referenced.',
    category: 'Code Analysis',
    sapSourceTables: ['CROSS', 'WBCROSSGT', 'DD02L', 'D010TAB'],
    summaryAnswer: 'Table VBAK is referenced across 42 custom Z-programs, 18 CDS views, 5 AMDP classes, and 3 Gateway OData services in package $Z_SD and $Z_ANALYTICS.',
    keyInsights: [
      '42 custom reports read header fields (VBELN, ERDAT, NETWR, KUNNR).',
      '18 CDS Views consume VBAK via standard S/4HANA C1 Released CDS View I_SalesOrder.',
      '0 direct DB updates exist (Clean Core compliant).',
      'All joins are optimized with primary key predicates.'
    ],
    codeSnippet: `SELECT progname, statement
  FROM cross
  WHERE type = 'TAB'
    AND name = 'VBAK'
    AND progname LIKE 'Z%'
  INTO TABLE @DATA(lt_vbak_refs).`,
    abapMetrics: [
      { label: 'Total References', value: '68 References', status: 'neutral' },
      { label: 'CDS View Usages', value: '18 Views', status: 'positive' },
      { label: 'AMDP Usages', value: '5 Classes', status: 'neutral' },
      { label: 'Direct DB Updates', value: '0 (Zero)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'ABAP Reports', value: '42 Programs', variance: 'Select Reads', detail: 'Reporting and ALV displays' },
      { category: 'Core Data Services', value: '18 CDS Views', variance: 'CDS Entities', detail: 'Analytical and transactional views' },
      { category: 'AMDP SQLScript', value: '5 Classes', variance: 'HANA Pushdown', detail: 'High-speed aggregation queries' }
    ],
    recommendedSapActions: [
      { actionName: 'Open Table Definition', tcode: 'SE11', description: 'Inspect VBAK fields and indexes in ABAP Dictionary' },
      { actionName: 'Run ABAP Where-Used', tcode: 'SE84', description: 'Analyze comprehensive cross-references' }
    ]
  },
  {
    questionId: 'Q5',
    questionText: 'Which programs update this custom table?',
    category: 'Code Analysis',
    sapSourceTables: ['D010TAB', 'CROSS', 'SLIN_RESULTS', 'TADIR'],
    summaryAnswer: 'Custom table ZCONFIG_RULES is updated by 3 Z-programs: ZREP_CONFIG_MAINTAIN (ALV maintenance), ZCL_SD_PARAM_MANAGER (OOP API), and background job ZJOB_UPDATE_RATES.',
    keyInsights: [
      'ZCL_SD_PARAM_MANAGER encapsulates all write logic with lock object EZCONFIG_RULES.',
      'ZREP_CONFIG_MAINTAIN triggers authorization checks before commit.',
      'Background job ZJOB_UPDATE_RATES executes nightly currency rate syncs.',
      'Audit logging is enabled for all INSERT/UPDATE/DELETE actions.'
    ],
    codeSnippet: `/* WRITE ACCESS REPOSITORIES FOR ZCONFIG_RULES */
1. ZREP_CONFIG_MAINTAIN (INSERT / UPDATE / DELETE via ALV Grid)
2. ZCL_SD_PARAM_MANAGER=>SAVE_SETTINGS (MODIFY zconfig_rules)
3. ZJOB_UPDATE_RATES (UPDATE zconfig_rules SET rate = ... WHERE ... )`,
    abapMetrics: [
      { label: 'Updating Programs', value: '3 Objects', status: 'neutral' },
      { label: 'Lock Object Enforced', value: 'EZCONFIG_RULES', status: 'positive' },
      { label: 'Audit Trail', value: 'Active (CDHDR)', status: 'positive' },
      { label: 'Risk Score', value: 'Low (12/100)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'ZCL_SD_PARAM_MANAGER', value: 'OOP DAO Class', variance: 'Direct API', detail: 'Encapsulated business rule writes' },
      { category: 'ZREP_CONFIG_MAINTAIN', value: 'Maintenance Report', variance: 'User Dialog', detail: 'Manual parameter administration' },
      { category: 'ZJOB_UPDATE_RATES', value: 'Background Task', variance: 'Batch Process', detail: 'Automated exchange rate updates' }
    ],
    recommendedSapActions: [
      { actionName: 'Inspect Lock Objects', tcode: 'SM12', description: 'Check active SAP database enqueue locks' },
      { actionName: 'Maintain Table Entries', tcode: 'SM30', description: 'Review table maintenance dialog for ZCONFIG_RULES' }
    ]
  },
  {
    questionId: 'Q6',
    questionText: 'Show unused custom code.',
    category: 'Code Analysis',
    sapSourceTables: ['SCOV', 'CVR_RESULT', 'PROGDIR', 'TADIR'],
    summaryAnswer: 'Analyzed ABAP Coverage Analyzer (SCOV/CCLK) and SM20 transaction logs. Identified 14 obsolete Z-programs and 22 unreferenced FORM routines with zero executions in Client 100 for over 180 days.',
    keyInsights: [
      '14 unused programs consume 18,400 LOC in legacy package $Z_LEGACY.',
      'Top candidates for retirement: ZREP_OLD_SALES_2018, ZTEST_DISCOUNT_TEMP, and ZSD_INCL_OBSOLETE_FORMS.',
      'Retiring these programs improves system upgrade speed and decreases ATC remediation scope by 16%.',
      'No active background jobs (SM37) or scheduled variants reference these objects.'
    ],
    codeSnippet: `/* UNUSED CODE CANDIDATES (0 EXECUTIONS > 180 DAYS) */
 - Program: ZREP_OLD_SALES_2018 (0 Executions since 2024-01-01)
 - Program: ZTEST_DISCOUNT_TEMP (0 Executions)
 - Include: ZSD_INCL_OBSOLETE_FORMS (1,200 lines uncalled code)
 - Class: ZCL_LEGACY_TAX_CALC (Deprecated by ACDOCA)`,
    abapMetrics: [
      { label: 'Unused Z-Programs', value: '14 Programs', status: 'warning' },
      { label: 'Dead Code Volume', value: '18,400 LOC', status: 'warning' },
      { label: 'ATC Remediation Reduction', value: '-16% Scope', status: 'positive' },
      { label: 'Days Without Execution', value: '> 180 Days', status: 'neutral' }
    ],
    breakdownData: [
      { category: 'ZREP_OLD_SALES_2018', value: '4,200 LOC', variance: '0 Runs', detail: 'Replaced by Fiori App F1873' },
      { category: 'ZTEST_DISCOUNT_TEMP', value: '850 LOC', variance: '0 Runs', detail: 'Old sandbox experiment' },
      { category: 'ZSD_INCL_OBSOLETE_FORMS', value: '1,200 LOC', variance: '0 Runs', detail: 'Dead FORM subroutines' }
    ],
    recommendedSapActions: [
      { actionName: 'Launch Coverage Analyzer', tcode: 'SCOV', description: 'Inspect production code execution frequency' },
      { actionName: 'Decommission Objects', tcode: 'SE03', description: 'Change object directory and prepare transport deletion' }
    ]
  },
  {
    questionId: 'Q7',
    questionText: 'Which programs have hard-coded values?',
    category: 'Code Analysis',
    sapSourceTables: ['SLIN_RESULTS', 'SCI_RESULTS', 'TADIR', 'TVARVC'],
    summaryAnswer: 'ATC Clean Core Variant HARDCODED_LITERAL_CHECK flagged 9 custom Z-programs with hardcoded Sales Orgs (\'1000\', \'2000\'), Plant codes (\'1010\'), and system client IDs (\'100\').',
    keyInsights: [
      '9 programs require externalization of literals into TVARVC or custom configuration tables.',
      'Worst offender: ZREP_SALES_SUMMARY with 6 hardcoded plant codes.',
      'Automatic refactoring available to replace literals with dynamic singleton calls `zcl_config_dao=>get_param( )`.',
      'Zero downtime required for parameter migration.'
    ],
    codeSnippet: `/* HARDCODED LITERAL VIOLATION IN ZREP_SALES */
Line 42: IF ls_vbak-vkorg = '1000' AND ls_vbak-vtweg = '10'. " Hardcoded!
Line 88: CONSTANTS: c_plant TYPE werks_d VALUE '1010'. " Hardcoded!

/* CLEAN CORE REMEDIATION: DYNAMIC TVARVC PARAMETER */
DATA(lv_target_vkorg) = zcl_config_dao=>get_param( 'SALES_ORG_DEFAULT' ).`,
    abapMetrics: [
      { label: 'Flagged Programs', value: '9 Programs', status: 'warning' },
      { label: 'Total Hardcoded Literals', value: '28 Literals', status: 'warning' },
      { label: 'Auto-Fix Available', value: '100% Ready', status: 'positive' },
      { label: 'Target Storage', value: 'TVARVC / Table', status: 'neutral' }
    ],
    breakdownData: [
      { category: 'ZREP_SALES_SUMMARY', value: '6 Literals', variance: 'Plants / Orgs', detail: 'Direct IF vkorg = \'1000\'' },
      { category: 'ZMM_PO_RELEASE', value: '4 Literals', variance: 'Release Codes', detail: 'Hardcoded approval codes' },
      { category: 'ZFI_TAX_RECON', value: '3 Literals', variance: 'Company Codes', detail: 'Hardcoded BUKRS 1000' }
    ],
    recommendedSapActions: [
      { actionName: 'Run ABAP Test Cockpit', tcode: 'ATC', description: 'Execute Clean Core literal check variant' },
      { actionName: 'Maintain TVARVC Variables', tcode: 'STVARV', description: 'Store enterprise configuration parameters' }
    ]
  },
  {
    questionId: 'Q8',
    questionText: 'Which custom objects have no documentation?',
    category: 'Code Analysis',
    sapSourceTables: ['DOKIL', 'DOKHL', 'TADIR', 'SEOCOMPO'],
    summaryAnswer: 'Inspected SAP Documentation Index (DOKIL/DOKHL) and ABAPDoc repository. Found 18 custom Z-classes and 31 CDS views missing ABAPDoc comments (`"!`) and missing standard documentation in SE61.',
    keyInsights: [
      '18 classes have no class or method ABAPDoc documentation headers.',
      '31 CDS views lack `@EndUserText.label` or analytical element annotations.',
      'ABAP AI Agent can automatically generate comprehensive ABAPDoc headers conforming to Clean Core standards.',
      'Documenting these objects raises Developer Maintenance Readiness to 96%.'
    ],
    codeSnippet: `SELECT object, typ, doktitle
  FROM dokil
 WHERE object LIKE 'Z%'
   AND status = 'I' " Incomplete / Missing Documentation
  INTO TABLE @DATA(lt_undocumented).`,
    abapMetrics: [
      { label: 'Undocumented Classes', value: '18 Classes', status: 'warning' },
      { label: 'Undocumented CDS Views', value: '31 Views', status: 'warning' },
      { label: 'Documentation Score', value: '64%', status: 'warning' },
      { label: 'Auto-Doc Generator', value: 'Ready to Deploy', status: 'positive' }
    ],
    breakdownData: [
      { category: 'ZCL_SD_TAX_ENGINE', value: 'Missing ABAPDoc', variance: 'Class Pool', detail: 'No parameter descriptions' },
      { category: 'ZI_OpenInvoices', value: 'Missing Annotations', variance: 'CDS Entity', detail: 'Missing field labels' },
      { category: 'ZCL_FI_PAYMENT_POST', value: 'Incomplete Docs', variance: 'Class Pool', detail: 'SE61 record status I' }
    ],
    recommendedSapActions: [
      { actionName: 'Launch Documentation Maint.', tcode: 'SE61', description: 'Create and update SAP system documentation' },
      { actionName: 'Generate ABAPDoc Headers', tcode: 'SE80', description: 'Auto-inject ABAPDoc markdown comments' }
    ]
  },
  {
    questionId: 'Q9',
    questionText: 'Find duplicate logic across Z programs.',
    category: 'Code Analysis',
    sapSourceTables: ['PROGDIR', 'CROSS', 'TADIR', 'SCI_RESULTS'],
    summaryAnswer: 'ATC Code Clone Detector identified 88% structural code duplication between ZREP_INVOICE_EXPORT and ZREP_BILLING_SUMMARY across their sales tax and pricing condition routines.',
    keyInsights: [
      '65 duplicated lines of tax calculation logic exist across both reports.',
      'Duplication creates maintenance hazard when tax compliance rules update.',
      'Recommended Action: Refactor into shared method `ZCL_SD_TAX_ENGINE=>CALCULATE_TAX( )`.',
      'Refactoring eliminates 130 lines of redundant code and ensures single source of truth.'
    ],
    codeSnippet: `/* DUPLICATE CODE DETECTED ACROSS REPOSITORIES */
Source A: ZREP_INVOICE_EXPORT (Lines 120 - 185)
Source B: ZREP_BILLING_SUMMARY (Lines 80 - 145)
Duplicated Block: 65 lines of tax condition calculation logic.
Remediation: Refactor to reusable class ZCL_SD_TAX_ENGINE=>CALCULATE_TAX()`,
    abapMetrics: [
      { label: 'Duplication Match', value: '88% Match', status: 'negative' },
      { label: 'Duplicated Lines', value: '65 Lines', status: 'warning' },
      { label: 'Shared Service', value: 'ZCL_SD_TAX_ENGINE', status: 'positive' },
      { label: 'Maintenance Risk', value: 'High', status: 'negative' }
    ],
    breakdownData: [
      { category: 'ZREP_INVOICE_EXPORT', value: 'Lines 120-185', variance: 'Clone Source', detail: 'Original tax logic implementation' },
      { category: 'ZREP_BILLING_SUMMARY', value: 'Lines 80-145', variance: 'Clone Copy', detail: 'Copied form routine with identical formula' }
    ],
    recommendedSapActions: [
      { actionName: 'Run Code Inspector Clone Check', tcode: 'SCI', description: 'Execute full package clone analysis' },
      { actionName: 'Refactor into Shared Class', tcode: 'SE24', description: 'Create centralized tax calculation engine' }
    ]
  },
  {
    questionId: 'Q10',
    questionText: 'Which custom objects are highest risk?',
    category: 'Code Analysis',
    sapSourceTables: ['PROGDIR', 'ST22', 'SNAP', 'CVR_RESULT', 'E070'],
    summaryAnswer: 'Ranked top 3 highest risk custom objects based on Cyclomatic Complexity, weekly modification frequency, and historical ST22 production dump impact: 1. ZCL_SD_PRICING_ENGINE (Risk 94/100), 2. ZMV45AFZZ_ENHANCEMENT (Risk 88/100), 3. ZCL_FI_PAYMENT_POST (Risk 82/100).',
    keyInsights: [
      'ZCL_SD_PRICING_ENGINE has cyclomatic complexity of 42 and 14 changes/month.',
      'ZMV45AFZZ contains legacy user exit code that modifies VBAK buffers directly.',
      'ZCL_FI_PAYMENT_POST executes unbuffered ACDOCA updates during peak business hours.',
      'Automated safeguard test suite recommended before any future transport release.'
    ],
    codeSnippet: `/* RISK SCORE MATRIX FOR CUSTOM REPOSITORY */
1. ZCL_SD_PRICING_ENGINE: Risk Score 94/100 (Complexity: 42, 14 Changes/mo, 8 ST22 Dumps)
2. ZMV45AFZZ_ENHANCEMENT: Risk Score 88/100 (Direct VBAK/VBAP Modifications)
3. ZCL_FI_PAYMENT_POST: Risk Score 82/100 (Direct ACDOCA Posting Logic)`,
    abapMetrics: [
      { label: 'Highest Risk Score', value: '94 / 100', status: 'negative' },
      { label: 'High-Risk Objects', value: '3 Objects', status: 'warning' },
      { label: 'Monthly Dump Impact', value: '14 Dumps', status: 'negative' },
      { label: 'Mitigation Status', value: 'Safeguards Ready', status: 'positive' }
    ],
    breakdownData: [
      { category: 'ZCL_SD_PRICING_ENGINE', value: 'Risk 94/100', variance: 'Pricing Engine', detail: 'High complexity & change frequency' },
      { category: 'ZMV45AFZZ_ENHANCEMENT', value: 'Risk 88/100', variance: 'Legacy UserExit', detail: 'Direct buffer modifications' },
      { category: 'ZCL_FI_PAYMENT_POST', value: 'Risk 82/100', variance: 'Financials Posting', detail: 'ACDOCA concurrency risks' }
    ],
    recommendedSapActions: [
      { actionName: 'Review Dump Forensics', tcode: 'ST22', description: 'Analyze runtime exceptions generated by high-risk objects' },
      { actionName: 'Run ABAP Unit Test Suite', tcode: 'SE80', description: 'Execute comprehensive regression safeguards' }
    ]
  },

  // ==========================================================================
  // PILLAR 2: DEBUGGING & ERROR ANALYSIS (Q11 - Q20)
  // ==========================================================================
  {
    questionId: 'Q11',
    questionText: 'Why did this ABAP program dump?',
    category: 'Debugging & Error Analysis',
    sapSourceTables: ['SNAP', 'ST22', 'PROGDIR', 'D010INC'],
    summaryAnswer: 'Program ZREP_SALES dumped with runtime error GETWA_NOT_ASSIGNED at line 142. Field symbol <fs_item> was dereferenced after an unsuccessful READ TABLE without checking `IS ASSIGNED`.',
    keyInsights: [
      'Line 142 attempted to access `<fs_item>-netwr` when item 00010 was not found.',
      'Occurred during execution by dialog user STUDENT069 at 14:22:18.',
      'Root cause: missing validation check after READ TABLE or modern table expression.',
      'Clean Core fix: use `VALUE #( lt_items[ posnr = \'00010\' ] OPTIONAL )` or `IF <fs_item> IS ASSIGNED`.'
    ],
    codeSnippet: `/* DUMP CAUSE IN ZREP_SALES LINE 142 */
READ TABLE lt_items ASSIGNING <fs_item> WITH KEY posnr = '00010'.
<fs_item>-netwr = 1250. " DUMP GETWA_NOT_ASSIGNED! Line 00010 did not exist!

/* CLEAN CORE SAFE FIX */
READ TABLE lt_items ASSIGNING <fs_item> WITH KEY posnr = '00010'.
IF <fs_item> IS ASSIGNED.
  <fs_item>-netwr = 1250.
ENDIF.`,
    abapMetrics: [
      { label: 'Runtime Error', value: 'GETWA_NOT_ASSIGNED', status: 'negative' },
      { label: 'Failure Line', value: 'Line 142', status: 'neutral' },
      { label: 'Occurrences', value: '14 Dumps Today', status: 'negative' },
      { label: 'Fix Safety', value: '100% Verified', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Exception Class', value: 'CX_SY_ASSIGNMENT_ERROR', variance: 'Kernel Dump', detail: 'Field symbol dereference failure' },
      { category: 'Program Position', value: 'ZREP_SALES line 142', variance: 'Source Line', detail: 'Form CALCULATE_TOTAL' }
    ],
    recommendedSapActions: [
      { actionName: 'Open Dump Analysis', tcode: 'ST22', description: 'Inspect complete call stack and variable states' },
      { actionName: 'Launch ADT Debugger', tcode: 'SE38', description: 'Step through program execution with active breakpoints' }
    ]
  },
  {
    questionId: 'Q12',
    questionText: 'Explain this ST22 dump in plain English.',
    category: 'Debugging & Error Analysis',
    sapSourceTables: ['SNAP', 'ST22', 'SNAP_S4H', 'PROGDIR'],
    summaryAnswer: 'ST22 Runtime Error CX_SY_ITAB_LINE_NOT_FOUND explained: The program tried to read a specific row from an internal table using table expression `lt_orders[ vbeln = \'90001\' ]`, but no sales order with number 90001 existed. Because the developer didn\'t provide a default fallback value or catch the exception, SAP immediately crashed.',
    keyInsights: [
      'Program ZCL_SD_SO_CALCULATOR==========CP crashed at method GET_ORDER_HEADER line 88.',
      'Modern table expression lacked `OPTIONAL` or `DEFAULT` keyword.',
      'No data loss occurred in database tables; transaction was rolled back safely.',
      'Remediation takes less than 2 minutes by adding `VALUE #( ... OPTIONAL )`.'
    ],
    codeSnippet: `/* ST22 PLAIN ENGLISH BREAKDOWN */
Runtime Error: CX_SY_ITAB_LINE_NOT_FOUND
Program: ZCL_SD_SO_CALCULATOR==========CP Line 88
Plain English: The program looked for Order '90001' inside internal table lt_orders,
found zero matching rows, and crashed because no fallback was defined.

/* SAFE CLEAN CORE CODE */
DATA(ls_order) = VALUE #( lt_orders[ vbeln = '90001' ] OPTIONAL ).
IF ls_order IS NOT INITIAL.
  " Process valid order
ENDIF.`,
    abapMetrics: [
      { label: 'Exception', value: 'ITAB_LINE_NOT_FOUND', status: 'negative' },
      { label: 'Severity', value: 'Crash / Rollback', status: 'negative' },
      { label: 'Complexity to Fix', value: '1 Line of Code', status: 'positive' },
      { label: 'Data Integrity', value: 'Safe (Rolled Back)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Class / Program', value: 'ZCL_SD_SO_CALCULATOR', variance: 'Class Method', detail: 'GET_ORDER_HEADER' },
      { category: 'Failed Expression', value: 'lt_orders[ vbeln = ... ]', variance: 'Table Expression', detail: 'Missing OPTIONAL clause' }
    ],
    recommendedSapActions: [
      { actionName: 'Inspect ST22 Header', tcode: 'ST22', description: 'Review short dump header parameters' },
      { actionName: 'Refactor Expression', tcode: 'SE24', description: 'Add safe table expression handling' }
    ]
  },
  {
    questionId: 'Q13',
    questionText: 'Find the line of code causing the error.',
    category: 'Debugging & Error Analysis',
    sapSourceTables: ['SNAP', 'PROGDIR', 'ST22'],
    summaryAnswer: 'Located exact failure line: Class `ZCL_SD_PRICING_ENGINE==========CP`, Method `CALCULATE_DISCOUNT`, Line 104 (`lv_discount = iv_amount / iv_qty`). Error: `COMPUTE_INT_ZERODIVIDE` caused by parameter `iv_qty = 0`.',
    keyInsights: [
      'Failure occurred when quantity parameter `iv_qty` was passed as 0 from an unconfirmed delivery item.',
      'Integer/Decimal division by zero triggered kernel exception CX_SY_ZERODIVIDE.',
      'Refactored method with defensive guard clause: `IF iv_qty > 0`.',
      'Zero side-effects across all 18 calling consumer programs.'
    ],
    codeSnippet: `/* FAILURE LOCATION */
Class: ZCL_SD_PRICING_ENGINE
Method: CALCULATE_DISCOUNT
Line 104: lv_discount = iv_amount / iv_qty. " Error: iv_qty is 0!

/* DEFENSIVE CLEAN CORE REFACTORING */
IF iv_qty > 0.
  lv_discount = iv_amount / iv_qty.
ELSE.
  lv_discount = 0.
ENDIF.`,
    abapMetrics: [
      { label: 'Failure Line', value: 'Line 104', status: 'negative' },
      { label: 'Error Type', value: 'COMPUTE_INT_ZERODIVIDE', status: 'negative' },
      { label: 'Root Parameter', value: 'iv_qty = 0', status: 'neutral' },
      { label: 'Fix Status', value: 'Guard Clause Ready', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Class Pool', value: 'ZCL_SD_PRICING_ENGINE', variance: 'Method Pool', detail: 'Method CALCULATE_DISCOUNT' },
      { category: 'Kernel Signal', value: 'SIGFPE', variance: 'Kernel Math', detail: 'Floating-point / Integer division by zero' }
    ],
    recommendedSapActions: [
      { actionName: 'Navigate to Source Line', tcode: 'SE24', description: 'Open ZCL_SD_PRICING_ENGINE at line 104' },
      { actionName: 'Execute Unit Test', tcode: 'SE80', description: 'Run zero quantity boundary unit tests' }
    ]
  },
  {
    questionId: 'Q14',
    questionText: 'Why is this internal table empty?',
    category: 'Debugging & Error Analysis',
    sapSourceTables: ['ST05', 'CROSS', 'D010TAB', 'PROGDIR'],
    summaryAnswer: 'Internal table `lt_sales_items` was empty because the preceding SELECT statement filtered on `vkorg = @lv_vkorg` where `lv_vkorg` was blank (\'\') due to missing selection screen parameter initialization.',
    keyInsights: [
      'Variable `lv_vkorg` evaluated to empty string at runtime.',
      'Query `SELECT * FROM vbap WHERE vkorg = @lv_vkorg` returned `sy-subrc = 4` (0 rows).',
      'Parameter `p_vkorg` lacked `OBLIGATORY` or default value `DEFAULT \'1000\'`.',
      'Adding selection screen validation ensures table is always populated with intended scope.'
    ],
    codeSnippet: `/* DIAGNOSTIC TRACE */
Variable State: lv_vkorg = '' (Initial / Empty)
SQL Executed: SELECT vbeln, posnr, matnr FROM vbap WHERE vkorg = @lv_vkorg
Result: 0 Rows Returned (sy-subrc = 4).

/* REMEDIATION */
PARAMETERS: p_vkorg TYPE vkorg OBLIGATORY DEFAULT '1000'.`,
    abapMetrics: [
      { label: 'Internal Table Rows', value: '0 Rows (Empty)', status: 'warning' },
      { label: 'SQL Subrc', value: 'sy-subrc = 4', status: 'neutral' },
      { label: 'Root Cause', value: 'Uninitialized Variable', status: 'neutral' },
      { label: 'Resolution', value: 'Add OBLIGATORY', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Parameter State', value: 'p_vkorg is empty', variance: 'User Input', detail: 'No default provided' },
      { category: 'SQL Filter', value: 'vkorg = \'\'', variance: 'Zero Matches', detail: 'No records matching blank sales org' }
    ],
    recommendedSapActions: [
      { actionName: 'Launch SQL Trace', tcode: 'ST05', description: 'Inspect exact parameter values passed to database' },
      { actionName: 'Set Debug Watchpoint', tcode: 'SE38', description: 'Halt execution when table count sy-dbcnt = 0' }
    ]
  },
  {
    questionId: 'Q15',
    questionText: 'Why is this SELECT returning no data?',
    category: 'Debugging & Error Analysis',
    sapSourceTables: ['VBUK', 'VBAK', 'VBAP', 'ST05'],
    summaryAnswer: 'SELECT returned `sy-subrc = 4` (0 rows) because the query joined obsolete header status table `VBUK` which is empty in S/4HANA 2023. S/4HANA replaced VBUK/VBUP with status columns directly embedded in `VBAK` and `VBAP`.',
    keyInsights: [
      'In S/4HANA, header status fields (GBSTK, LFSTK, FKSTK) are stored directly in table VBAK.',
      'Queries joining obsolete table VBUK return zero rows or require slow compatibility view translation.',
      'Refactored query reads `VBAK~OVERALL_STATUS` directly, restoring instant sub-millisecond execution.',
      'Eliminated obsolete join entirely.'
    ],
    codeSnippet: `/* OBSOLETE JOIN (0 ROWS IN S/4HANA) */
SELECT a~vbeln, b~gbstk 
  FROM vbak AS a 
  INNER JOIN vbuk AS b ON a~vbeln = b~vbeln. " VBUK is empty in S/4HANA!

/* S/4HANA 2023 COMPLIANT QUERY */
SELECT vbeln, overall_status 
  FROM vbak 
  INTO TABLE @DATA(lt_orders). " Direct status column!`,
    abapMetrics: [
      { label: 'Obsolete Table Read', value: 'VBUK (Empty)', status: 'negative' },
      { label: 'S/4HANA Replacement', value: 'VBAK Direct', status: 'positive' },
      { label: 'Query Latency', value: '0.4 ms (Post-Fix)', status: 'positive' },
      { label: 'Compatibility', value: 'S/4HANA 2023', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Legacy Table', value: 'VBUK', variance: 'Removed in S/4', detail: 'Header status table deprecated' },
      { category: 'Target Table', value: 'VBAK', variance: 'Native Column', detail: 'Fields gbstk -> overall_status' }
    ],
    recommendedSapActions: [
      { actionName: 'Inspect Simplification Item', tcode: '/SDF/RC_START_CHECK', description: 'Review S/4HANA status field simplification' },
      { actionName: 'Refactor SELECT in SE38', tcode: 'SE38', description: 'Apply S/4HANA direct column query' }
    ]
  },
  {
    questionId: 'Q16',
    questionText: 'Why is this BAPI call failing?',
    category: 'Debugging & Error Analysis',
    sapSourceTables: ['BAPIRET2', 'VBAK', 'VBAP', 'KNVP'],
    summaryAnswer: 'Function module `BAPI_SALESORDER_CREATEFROMDAT2` failed with return error message E V1 311: "Enter Sold-to Party". Diagnostic: The partner table parameter `ORDER_PARTNERS` was missing an entry for mandatory partner function `AG` (Sold-to Party).',
    keyInsights: [
      'Return table RETURN contained error `E V1 311` (Mandatory partner role missing).',
      'Calling program provided Ship-to (`WE`) and Payer (`RE`), but omitted Sold-to (`AG`).',
      'Fix: Inject `PARTN_ROLE = \'AG\'` with customer number `0001000301`.',
      'After injection, BAPI successfully created Sales Order with sy-subrc = 0 and document number returned.'
    ],
    codeSnippet: `/* BAPI RETURN MESSAGES FORENSICS */
TYPE: E, ID: V1, NUMBER: 311, MESSAGE: 'Enter Sold-to Party'
Root Cause: ORDER_PARTNERS table missing PARTN_ROLE = 'AG' (Sold-to Party).

/* CORRECTION (CLEAN CORE ABAP 7.55+) */
APPEND VALUE #( partn_role = 'AG' partn_numb = '0001000301' ) TO lt_partners.
CALL FUNCTION 'BAPI_SALESORDER_CREATEFROMDAT2'
  EXPORTING order_header_in = ls_header
  TABLES    return          = lt_return
            order_partners  = lt_partners
            order_items_in  = lt_items.`,
    abapMetrics: [
      { label: 'BAPI Status', value: 'Failed (E V1 311)', status: 'negative' },
      { label: 'Missing Parameter', value: 'PARTN_ROLE = AG', status: 'warning' },
      { label: 'Customer Number', value: '0001000301', status: 'neutral' },
      { label: 'Post-Fix Result', value: 'Order Created', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Return Message', value: 'E V1 311', variance: 'Mandatory Check', detail: 'Sold-to party missing in partner table' },
      { category: 'BAPI Target', value: 'BAPI_SALESORDER_CREATEFROMDAT2', variance: 'SD BAPI', detail: 'Sales order create interface' }
    ],
    recommendedSapActions: [
      { actionName: 'Test BAPI in Function Builder', tcode: 'SE37', description: 'Simulate BAPI execution with test data' },
      { actionName: 'Check Partner Determination', tcode: 'VOPA', description: 'Inspect mandatory SD partner procedure' }
    ]
  },
  {
    questionId: 'Q17',
    questionText: 'Why is this IDoc processing program failing?',
    category: 'Debugging & Error Analysis',
    sapSourceTables: ['EDIDC', 'EDIDS', 'MARC', 'WE02'],
    summaryAnswer: 'Inbound IDoc 000000048291 (Basic Type ORDERS05) failed with Status 51: "Error in inbound processing". Diagnostic: Material \'MAT-A01\' is not maintained in Receiving Plant 1010 (Table MARC record does not exist).',
    keyInsights: [
      'Status record EDIDS recorded error message M3 305: "Material MAT-A01 does not exist in plant 1010".',
      'Inbound processing routine terminated without creating sales order document.',
      'Resolution: Extend material MAT-A01 to plant 1010 via transaction MM01 or automated BAPI_MATERIAL_SAVEDATA.',
      'Reprocess IDoc in BD87 once plant master data is activated.'
    ],
    codeSnippet: `/* IDOC 000000048291 STATUS ANALYSIS */
IDoc Number: 000000048291 | Message Type: ORDERS | Status: 51
Error Message: M3 305 - Material MAT-A01 not extended to Plant 1010
Failed Segment: E1EDP01 (Item 00010)

/* REMEDIATION: EXTEND PLANT DATA & REPROCESS */
1. Extend Material MAT-A01 to Plant 1010 in MM01
2. Reprocess IDoc in BD87 -> Expected Status 53 (Posted Successfully)`,
    abapMetrics: [
      { label: 'IDoc Status', value: '51 (Application Error)', status: 'negative' },
      { label: 'IDoc Number', value: '000000048291', status: 'neutral' },
      { label: 'Defect Cause', value: 'Missing MARC Record', status: 'warning' },
      { label: 'Reprocess T-Code', value: 'BD87', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Material', value: 'MAT-A01', variance: 'Plant 1010', detail: 'Missing plant storage data' },
      { category: 'Status Record', value: 'Status 51', variance: 'Error in Inbound', detail: 'Application processing error' }
    ],
    recommendedSapActions: [
      { actionName: 'Open IDoc Display', tcode: 'WE02', description: 'Inspect IDoc segments and status records' },
      { actionName: 'Reprocess Inbound IDocs', tcode: 'BD87', description: 'Re-trigger IDoc inbound processing' }
    ]
  },
  {
    questionId: 'Q18',
    questionText: 'Why is this background job terminating?',
    category: 'Debugging & Error Analysis',
    sapSourceTables: ['TBTCO', 'TBTCP', 'SM37', 'SNAP'],
    summaryAnswer: 'Background job ZJOB_NIGHTLY_INVOICE terminated with status CANCELED in SM37 due to runtime error `TSV_TNEW_PAGE_ALLOC_FAILED`. The program exhausted the 8GB ABAP roll memory quota by loading 14 million records from ACDOCA into internal tables without cursor chunking (PACKAGE SIZE).',
    keyInsights: [
      'Job ID 11402800 terminated after 42 minutes of execution.',
      'System log SM21 reported: "Memory allocation failed (8,388,608 KB limit reached)".',
      'Fix: Implement `PACKAGE SIZE 50000` cursor loop with periodic memory cleanup.',
      'Post-fix execution completes in 8.4 minutes with peak memory consumption under 180MB.'
    ],
    codeSnippet: `/* SM37 JOB LOG & ST22 SNAPSHOT */
Job: ZJOB_NIGHTLY_INVOICE | Status: CANCELED | Memory: 8.38 GB (Limit)
Dump: TSV_TNEW_PAGE_ALLOC_FAILED loading ACDOCA without chunking.

/* CLEAN CORE CHUNKED CURSOR PATTERN */
DATA: lt_chunk TYPE TABLE OF acdoca.
OPEN CURSOR @DATA(lv_cursor) FOR
  SELECT * FROM acdoca WHERE gjahr = '2026'.

DO.
  FETCH NEXT CURSOR @lv_cursor
    INTO TABLE @lt_chunk
    PACKAGE SIZE 50000.
  IF sy-subrc <> 0. EXIT. ENDIF.
  zcl_invoice_processor=>process_batch( lt_chunk ).
  FREE: lt_chunk.
ENDDO.
CLOSE CURSOR @lv_cursor.`,
    abapMetrics: [
      { label: 'Job Status', value: 'CANCELED', status: 'negative' },
      { label: 'Dump Error', value: 'PAGE_ALLOC_FAILED', status: 'negative' },
      { label: 'Peak Memory (Before)', value: '8,388 MB (100%)', status: 'negative' },
      { label: 'Peak Memory (After)', value: '180 MB (2.1%)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Background Job', value: 'ZJOB_NIGHTLY_INVOICE', variance: 'Batch Task', detail: 'Nightly finance aggregation' },
      { category: 'Memory Quota', value: '8.0 GB Roll Buffer', variance: 'Exhausted', detail: 'Unbounded SELECT into ITAB' }
    ],
    recommendedSapActions: [
      { actionName: 'Review Job Log', tcode: 'SM37', description: 'Inspect spool and step logs in Job Overview' },
      { actionName: 'Tune ABAP Memory Buffers', tcode: 'RZ11', description: 'Review parameter ztta/roll_extension' }
    ]
  },
  {
    questionId: 'Q19',
    questionText: 'Show recent errors related to this program.',
    category: 'Debugging & Error Analysis',
    sapSourceTables: ['SNAP', 'SM21', 'BALHDR', 'BALDAT'],
    summaryAnswer: 'Program ZREP_SALES generated 14 runtime short dumps (GETWA_NOT_ASSIGNED) and 3 Gateway OData 500 exceptions in Application Log SLG1 over the past 24 hours in Client 100.',
    keyInsights: [
      '14 dumps occurred during automated batch and user dialog execution.',
      '3 Gateway exceptions resulted from JSON serialization failures on invalid dates (\'00000000\').',
      'All 17 error instances trace back to unvalidated optional partner and date structures.',
      'Automated hotfix patch generated and validated in transport DEVK900192.'
    ],
    codeSnippet: `SELECT datum, uzeit, uname, errid, flist
  FROM snap
 WHERE seqno = '000'
   AND pgm = 'ZREP_SALES'
   AND datum >= @( cl_abap_context_info=>get_system_date( ) - 1 )
  INTO TABLE @DATA(lt_recent_dumps).`,
    abapMetrics: [
      { label: 'Total Errors (24h)', value: '17 Exceptions', status: 'negative' },
      { label: 'ST22 Short Dumps', value: '14 Dumps', status: 'negative' },
      { label: 'OData 500 Errors', value: '3 Errors', status: 'warning' },
      { label: 'Hotfix Status', value: 'Ready in DEV', status: 'positive' }
    ],
    breakdownData: [
      { category: 'GETWA_NOT_ASSIGNED', value: '14 Dumps', variance: 'Unassigned FS', detail: 'Line 142 dereference' },
      { category: 'CX_OVI_INVALID_DATE', value: '3 Exceptions', variance: 'OData V4', detail: 'Date 00000000 JSON serialization' }
    ],
    recommendedSapActions: [
      { actionName: 'Open System Log', tcode: 'SM21', description: 'Filter system events for program ZREP_SALES' },
      { actionName: 'Display Application Log', tcode: 'SLG1', description: 'Analyze business application log entries' }
    ]
  },
  {
    questionId: 'Q20',
    questionText: 'Recommend the safest fix for this defect.',
    category: 'Debugging & Error Analysis',
    sapSourceTables: ['PROGDIR', 'ST22', 'SCI_RESULTS'],
    summaryAnswer: 'Recommended Safe Fix: Replace direct array indexing with safe table expression `VALUE #( lt_items[ posnr = iv_posnr ] OPTIONAL )` and encapsulate inside class `ZCL_SD_SO_CALCULATOR`. Zero side-effects verified by Clean Core automated analyzer.',
    keyInsights: [
      'Eliminates dump risk completely across all possible missing record scenarios.',
      'Conforms 100% to SAP Clean Core ABAP 7.55+ syntax guidelines.',
      'Unit test coverage verified with 100% assertion pass rate.',
      'Estimated deployment time: under 5 minutes.'
    ],
    codeSnippet: `/* RECOMMENDED SAFE REFACTORING */
" Before (Unsafe Dump Risk):
DATA(ls_item) = lt_items[ posnr = iv_posnr ]. " Crashes if posnr not found!

" After (100% Safe Clean Core Pattern):
DATA(ls_safe_item) = VALUE #( lt_items[ posnr = iv_posnr ] OPTIONAL ).
IF ls_safe_item IS NOT INITIAL.
  " Execute business logic safely
ENDIF.`,
    abapMetrics: [
      { label: 'Fix Safety Index', value: '100% Safe', status: 'positive' },
      { label: 'Clean Core Score', value: '100% Compliant', status: 'positive' },
      { label: 'Side-Effect Risk', value: '0.0% (Zero)', status: 'positive' },
      { label: 'AUnit Tests', value: '6/6 Passed', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Refactoring Type', value: 'Safe Expression', variance: 'Clean Core', detail: 'OPTIONAL table expression handling' },
      { category: 'Target Object', value: 'ZCL_SD_SO_CALCULATOR', variance: 'Method Pool', detail: 'Method GET_ITEM_DETAIL' }
    ],
    recommendedSapActions: [
      { actionName: 'Apply Clean Core Fix', tcode: 'SE24', description: 'Deploy safe table expression in Class Builder' },
      { actionName: 'Run ABAP Unit Test', tcode: 'SE80', description: 'Verify regression assertions pass' }
    ]
  },

  // ==========================================================================
  // PILLAR 3: PERFORMANCE OPTIMIZATION (Q21 - Q30)
  // ==========================================================================
  {
    questionId: 'Q21',
    questionText: 'Which custom ABAP programs are slowest?',
    category: 'Performance Optimization',
    sapSourceTables: ['ST03N', 'SAT', 'ST12', 'PROGDIR'],
    summaryAnswer: 'Analyzed S/4HANA Workload Monitor (ST03N) and SAT runtime profiles for Client 100. Top 3 slowest custom reports: 1. ZREP_NIGHTLY_FINANCE (Avg 42.8s/exec, 91.5% DB time), 2. ZREP_INVENTORY_VALUATION (28.4s/exec), 3. ZREP_SALES_AGGREGATION (18.2s/exec).',
    keyInsights: [
      'ZREP_NIGHTLY_FINANCE spends 39.2s in database time due to unbuffered BSEG/ACDOCA reads.',
      'ZREP_INVENTORY_VALUATION executes sequential loops over 450,000 material master records.',
      'Pushing calculations down to S/4HANA CDS Views reduces total execution time by over 92%.',
      'All 3 programs have been flagged for priority AMDP / CDS refactoring.'
    ],
    codeSnippet: `/* ST03N WORKLOAD TOP SLOWEST OBJECTS */
1. ZREP_NIGHTLY_FINANCE: 42,800 ms (DB Time: 39,200 ms - 91.5%)
2. ZREP_INVENTORY_VALUATION: 28,400 ms (DB Time: 25,100 ms - 88.3%)
3. ZREP_SALES_AGGREGATION: 18,200 ms (DB Time: 14,800 ms - 81.3%)`,
    abapMetrics: [
      { label: 'Slowest Program', value: 'ZREP_NIGHTLY_FINANCE', status: 'negative' },
      { label: 'Avg Execution Time', value: '42.8 Seconds', status: 'negative' },
      { label: 'DB Time Share', value: '91.5% Database', status: 'negative' },
      { label: 'Potential Speedup', value: '12x Faster (CDS)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'ZREP_NIGHTLY_FINANCE', value: '42.8s Avg', variance: '91.5% DB Time', detail: 'ACDOCA unindexed aggregation' },
      { category: 'ZREP_INVENTORY_VALUATION', value: '28.4s Avg', variance: '88.3% DB Time', detail: 'Sequential MBEW/MARD scans' },
      { category: 'ZREP_SALES_AGGREGATION', value: '18.2s Avg', variance: '81.3% DB Time', detail: 'VBAP/VBAK nested joins' }
    ],
    recommendedSapActions: [
      { actionName: 'Launch Workload Monitor', tcode: 'ST03N', description: 'Analyze dialog and background response times' },
      { actionName: 'Execute Runtime Analysis', tcode: 'SAT', description: 'Trace sub-millisecond execution bottlenecks' }
    ]
  },
  {
    questionId: 'Q22',
    questionText: 'Find SELECT statements causing performance problems.',
    category: 'Performance Optimization',
    sapSourceTables: ['ST05', 'D010TAB', 'PROGDIR', 'ACDOCA'],
    summaryAnswer: 'ST05 SQL Trace identified 2 critical query bottlenecks: 1. `SELECT * FROM ACDOCA` without GJAHR/POPER index filter (14.2s execution time, scanning 45M rows), 2. `SELECT * FROM BSEG` inside nested LOOP AT in program ZREP_PAYMENTS (9.8s).',
    keyInsights: [
      'Query on ACDOCA performed full column scan across 45 million entries.',
      'Adding primary key predicates `GJAHR = @lv_gjahr AND BLART = \'KR\'` reduced runtime to 180ms.',
      'Refactoring `SELECT *` to 4 required columns saved 94% column store projection cost.',
      'Total daily database savings: 3.4 hours of CPU time.'
    ],
    codeSnippet: `/* BOTTLENECK 1: UNINDEXED FULL TABLE SCAN */
SELECT * FROM acdoca WHERE bukrs = '1000'. " Scans 45M rows!

/* HANA OPTIMIZED PROJECTION & INDEX PREDICATES */
SELECT belnr, bukrs, gjahr, hsl, blart
  FROM acdoca
 WHERE bukrs = '1000' AND gjahr = '2026' AND blart = 'KR'
  INTO TABLE @DATA(lt_filtered_acdoca).`,
    abapMetrics: [
      { label: 'Original Latency', value: '14,200 ms', status: 'negative' },
      { label: 'Optimized Latency', value: '180 ms', status: 'positive' },
      { label: 'Speedup Factor', value: '78.8x Faster', status: 'positive' },
      { label: 'Memory Savings', value: '94% Reduction', status: 'positive' }
    ],
    breakdownData: [
      { category: 'ACDOCA Full Scan', value: '45M Rows', variance: '14.2s Duration', detail: 'Missing GJAHR fiscal year filter' },
      { category: 'BSEG Loop Query', value: '10K Executions', variance: '9.8s Duration', detail: 'N+1 query in LOOP' }
    ],
    recommendedSapActions: [
      { actionName: 'Open SQL Trace', tcode: 'ST05', description: 'Inspect statement execution times and index usage' },
      { actionName: 'HANA Plan Visualizer', tcode: 'DB02', description: 'Analyze query execution tree in PlanViz' }
    ]
  },
  {
    questionId: 'Q23',
    questionText: 'Show programs using SELECT inside LOOP.',
    category: 'Performance Optimization',
    sapSourceTables: ['PROGDIR', 'D010TAB', 'CROSS', 'SCI_RESULTS'],
    summaryAnswer: 'ATC Performance Variant SELECT_IN_LOOP_CHECK detected 7 custom Z-programs executing N+1 queries. Worst offender: ZREP_BILLING_SUMMARY executes `SELECT * FROM VBAP` inside a 10,000-row VBAK loop, generating 10,000 individual database roundtrips.',
    keyInsights: [
      '7 programs violate S/4HANA Clean Core high-performance SQL standards.',
      'ZREP_BILLING_SUMMARY accounts for 68% of daily dialog database roundtrips.',
      'Refactoring to `FOR ALL ENTRIES` or single join reduced roundtrips from 10,000 to 1.',
      'Dialog execution duration dropped from 22.4 seconds to 0.35 seconds.'
    ],
    codeSnippet: `/* DEFECT: SELECT INSIDE LOOP (10,000 DB ROUNDTRIPS) */
LOOP AT lt_vbak INTO DATA(ls_vbak).
  SELECT * FROM vbap INTO TABLE lt_vbap WHERE vbeln = ls_vbak-vbeln.
ENDLOOP.

/* S/4HANA OPTIMIZED: FOR ALL ENTRIES (1 DB ROUNDTRIP) */
IF lt_vbak IS NOT INITIAL.
  SELECT vbeln, posnr, matnr, netwr
    FROM vbap
    FOR ALL ENTRIES IN @lt_vbak
   WHERE vbeln = @lt_vbak-vbeln
    INTO TABLE @DATA(lt_all_vbap).
ENDIF.`,
    abapMetrics: [
      { label: 'Flagged Programs', value: '7 Programs', status: 'warning' },
      { label: 'DB Roundtrips (Before)', value: '10,000 Roundtrips', status: 'negative' },
      { label: 'DB Roundtrips (After)', value: '1 Roundtrip', status: 'positive' },
      { label: 'Response Time', value: '0.35s (Post-Fix)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'ZREP_BILLING_SUMMARY', value: '10,000 Queries', variance: 'VBAP in Loop', detail: 'Refactored to FOR ALL ENTRIES' },
      { category: 'ZMM_PO_HISTORY', value: '3,400 Queries', variance: 'EKPO in Loop', detail: 'Converted to CDS Join' },
      { category: 'ZFI_VENDOR_AGING', value: '1,800 Queries', variance: 'LFB1 in Loop', detail: 'Converted to Hashed lookup' }
    ],
    recommendedSapActions: [
      { actionName: 'Run Code Inspector Check', tcode: 'SCI', description: 'Audit all Z-programs for nested SELECT statements' },
      { actionName: 'Deploy FOR ALL ENTRIES Fix', tcode: 'SE38', description: 'Apply batch fetch refactoring' }
    ]
  },
  {
    questionId: 'Q24',
    questionText: 'Which programs are doing full-table scans?',
    category: 'Performance Optimization',
    sapSourceTables: ['BKPF', 'ST05', 'DB02', 'PROGDIR'],
    summaryAnswer: 'HANA Execution Plan Visualizer (PlanViz) detected full table scans on table BKPF in program ZREP_FINANCE_AUDIT (scanning 12.4 million rows due to leading wildcard search on reference field XBLNR).',
    keyInsights: [
      "Wildcard filter WHERE xblnr LIKE '%1000' prevents column index utilization.",
      'Scans all 12,450,000 rows in table BKPF, consuming 98.4% of total query duration.',
      'Fix: Create CDS View with secondary index or convert search to right-anchored prefix filter.',
      'Query duration reduced from 18.6 seconds to 42 milliseconds.'
    ],
    codeSnippet: `/* PLANVIZ FULL TABLE SCAN ALERT */
Table: BKPF (12,450,000 rows)
Operator: TABLE SCAN (HANA Column Engine)
Cost: 98.4% of total query duration (18,600 ms).

/* OPTIMIZED INDEX PREDICATE */
SELECT belnr, bukrs, gjahr, xblnr
  FROM bkpf
 WHERE bukrs = '1000' AND gjahr = '2026' AND xblnr LIKE 'INV-1000%'
  INTO TABLE @DATA(lt_clean_bkpf).`,
    abapMetrics: [
      { label: 'Scanned Rows', value: '12.45M Rows', status: 'negative' },
      { label: 'Scan Type', value: 'TABLE SCAN (HANA)', status: 'negative' },
      { label: 'Scan Cost', value: '98.4% of CPU', status: 'negative' },
      { label: 'Post-Fix Latency', value: '42 ms', status: 'positive' }
    ],
    breakdownData: [
      { category: 'ZREP_FINANCE_AUDIT', value: 'BKPF Scan', variance: '12.4M Rows', detail: 'Leading wildcard in XBLNR' },
      { category: 'ZMM_MAT_SEARCH', value: 'MARA Scan', variance: '2.8M Rows', detail: 'Missing MTART index predicate' }
    ],
    recommendedSapActions: [
      { actionName: 'Open DB02 Performance', tcode: 'DB02', description: 'Analyze expensive statements and table scan stats' },
      { actionName: 'Inspect Secondary Indexes', tcode: 'SE11', description: 'Review BKPF secondary index definitions' }
    ]
  },
  {
    questionId: 'Q25',
    questionText: 'Find unnecessary nested loops.',
    category: 'Performance Optimization',
    sapSourceTables: ['PROGDIR', 'SAT', 'ST12'],
    summaryAnswer: 'Program ZREP_STOCK_MATCH contains an O(N^2) nested loop (`LOOP AT lt_headers ... LOOP AT lt_items WHERE ...`). Refactored to O(1) HASHED internal table key lookup, reducing algorithmic complexity from quadratic to linear.',
    keyInsights: [
      'Outer table contains 15,000 headers; inner table contains 120,000 items (1.8 billion comparisons).',
      'Execution duration took 31.2 seconds in dialog mode.',
      'Converting `lt_items` to `HASHED TABLE ... WITH UNIQUE KEY` reduced comparisons to 15,000.',
      'Runtime dropped from 31.2s to 0.12s (260x speedup).'
    ],
    codeSnippet: `/* UNOPTIMIZED O(N^2) NESTED LOOP */
LOOP AT lt_headers INTO DATA(ls_hdr).
  LOOP AT lt_items INTO DATA(ls_itm) WHERE vbeln = ls_hdr-vbeln.
    " Slow sequential scan across 120,000 entries
  ENDLOOP.
ENDLOOP.

/* OPTIMIZED O(1) HASHED TABLE LOOKUP */
DATA: lt_items_hashed TYPE HASHED TABLE OF vbap WITH UNIQUE KEY vbeln posnr.
LOOP AT lt_headers INTO DATA(ls_hdr).
  " Direct hashed access in O(1) constant time
ENDLOOP.`,
    abapMetrics: [
      { label: 'Comparisons (Before)', value: '1.8 Billion', status: 'negative' },
      { label: 'Comparisons (After)', value: '15,000 Key Reads', status: 'positive' },
      { label: 'Speedup Factor', value: '260x Faster', status: 'positive' },
      { label: 'Runtime', value: '0.12s (Post-Fix)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Algorithm Before', value: 'O(N * M)', variance: 'Quadratic', detail: 'Sequential loop in loop' },
      { category: 'Algorithm After', value: 'O(N)', variance: 'Linear', detail: 'Hashed table key lookup' }
    ],
    recommendedSapActions: [
      { actionName: 'Trace with SAT Profiler', tcode: 'SAT', description: 'Analyze internal table lookup overhead' },
      { actionName: 'Convert Table Type', tcode: 'SE38', description: 'Define HASHED / SORTED internal table' }
    ]
  },
  {
    questionId: 'Q26',
    questionText: 'Which custom reports consume the most database time?',
    category: 'Performance Optimization',
    sapSourceTables: ['ST03N', 'ST04', 'D010TAB', 'PROGDIR'],
    summaryAnswer: 'Database Time Analysis (ST03N): ZREP_NIGHTLY_FINANCE accounts for 42.4% of all custom database consumption in Client 100 (DB Time: 1,420 seconds/day), followed by ZREP_INVENTORY_VALUATION (26.6%) and ZREP_SALES_SUMMARY (15.5%).',
    keyInsights: [
      'Top 3 reports account for 84.5% of total custom database load.',
      'Primary causes: unaggregated row fetches, missing fiscal year indexes, and sequential loops.',
      'Pushing calculations down to HANA CDS Views reduces aggregate database time by 88%.',
      'Daily database server CPU utilization projected to drop by 18%.'
    ],
    codeSnippet: `/* TOP DB TIME CONSUMPTION SUMMARY (CLIENT 100) */
1. ZREP_NIGHTLY_FINANCE: 1,420 sec DB Time / day (42.4%)
2. ZREP_INVENTORY_VALUATION: 890 sec DB Time / day (26.6%)
3. ZREP_SALES_SUMMARY: 520 sec DB Time / day (15.5%)
4. Remaining 38 Reports: 510 sec DB Time / day (15.5%)`,
    abapMetrics: [
      { label: 'Total Custom DB Time', value: '3,340 Sec / Day', status: 'negative' },
      { label: 'Top 3 Reports Share', value: '84.5% Total Load', status: 'negative' },
      { label: 'Optimization Potential', value: '-88% DB Time', status: 'positive' },
      { label: 'HANA CPU Savings', value: '18% Daily CPU', status: 'positive' }
    ],
    breakdownData: [
      { category: 'ZREP_NIGHTLY_FINANCE', value: '1,420s (42.4%)', variance: 'ACDOCA Aggregates', detail: 'Financial close consolidation' },
      { category: 'ZREP_INVENTORY_VALUATION', value: '890s (26.6%)', variance: 'MBEW / MARD', detail: 'Stock balance valuation' },
      { category: 'ZREP_SALES_SUMMARY', value: '520s (15.5%)', variance: 'VBAK / VBAP', detail: 'Daily sales reporting' }
    ],
    recommendedSapActions: [
      { actionName: 'Launch ST03N Profiler', tcode: 'ST03N', description: 'Review transaction database time rankings' },
      { actionName: 'Database Performance Monitor', tcode: 'ST04', description: 'Inspect HANA memory and CPU consumption' }
    ]
  },
  {
    questionId: 'Q27',
    questionText: 'Analyze this SQL statement for HANA performance.',
    category: 'Performance Optimization',
    sapSourceTables: ['ACDOCA', 'ST05', 'DB02'],
    summaryAnswer: 'Analyzed SQL statement: `SELECT * FROM ACDOCA WHERE BUKRS = \'1000\'`. Finding: Extreme column projection penalty (fetching all 360 columns from HANA column store). Recommendation: Select only required 5 fields (`BELNR`, `BUKRS`, `GJAHR`, `HSL`, `KTOPL`) and add fiscal year index predicate.',
    keyInsights: [
      '`SELECT *` forces HANA Column Engine to decompress and assemble 360 attributes for 4.2M rows.',
      'Consumes 1.4 GB of application server RAM heap.',
      'Selecting 5 explicit columns reduces data transfer volume from 1,400 MB to 12 MB (99.1% reduction).',
      'Query latency drops from 6,800 ms to 48 ms.'
    ],
    codeSnippet: `/* INEFFICIENT SQL (FETCHES 360 COLUMNS) */
SELECT * FROM acdoca WHERE bukrs = '1000'.

/* HANA HIGH-PERFORMANCE PROJECTION */
SELECT belnr, bukrs, gjahr, hsl, ktopl
  FROM acdoca
 WHERE bukrs = '1000' AND gjahr = @( cl_abap_context_info=>get_system_date( )(4) )
  INTO TABLE @DATA(lt_lean_acdoca).`,
    abapMetrics: [
      { label: 'Columns Selected', value: '360 -> 5 Fields', status: 'positive' },
      { label: 'RAM Transferred', value: '1.4 GB -> 12 MB', status: 'positive' },
      { label: 'Execution Speedup', value: '141x Faster', status: 'positive' },
      { label: 'HANA Engine', value: 'Column Optimized', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Memory Overhead', value: '1,400 MB', variance: 'Full Row Assembly', detail: 'Decompresses 360 attributes' },
      { category: 'Lean Projection', value: '12 MB', variance: '5 Target Fields', detail: 'Direct column vector scan' }
    ],
    recommendedSapActions: [
      { actionName: 'Test in ST05 SQL Trace', tcode: 'ST05', description: 'Benchmark projection execution times' },
      { actionName: 'Inspect ACDOCA Columns', tcode: 'SE11', description: 'Review dictionary structure of Universal Journal' }
    ]
  },
  {
    questionId: 'Q28',
    questionText: 'Recommend how to optimize this program.',
    category: 'Performance Optimization',
    sapSourceTables: ['PROGDIR', 'SAT', 'ST05', 'ST12'],
    summaryAnswer: '3-Step Optimization Plan for ZREP_SALES: 1. Replace `SELECT *` with lean 5-column projection (3.2x speedup), 2. Replace nested LOOP with HASHED internal table (12.4x speedup), 3. Cache static plant master data in SHMA shared memory buffer (4.1x speedup). Total runtime drops from 34.2s to 0.8s (42x faster).',
    keyInsights: [
      'Step 1 eliminates 92% of network data transfer between DB and Application layer.',
      'Step 2 eliminates 1.2 million redundant inner loop iterations.',
      'Step 3 eliminates 4,000 master data queries via Shared Memory Objects (SHMA).',
      'Program becomes eligible for real-time interactive Fiori tile embedding.'
    ],
    codeSnippet: `/* OPTIMIZATION BLUEPRINT FOR ZREP_SALES */
Step 1: Convert SELECT * -> Lean Field Projections (Speedup: 3.2x)
Step 2: Convert LOOP AT -> HASHED Table Key Access (Speedup: 12.4x)
Step 3: Enable Shared Memory Buffer ZCL_SHM_PLANT (Speedup: 4.1x)
Combined Speedup: Total execution drops from 34.2s to 0.8s (42x faster).`,
    abapMetrics: [
      { label: 'Initial Runtime', value: '34.2 Seconds', status: 'negative' },
      { label: 'Optimized Runtime', value: '0.8 Seconds', status: 'positive' },
      { label: 'Overall Speedup', value: '42x Faster', status: 'positive' },
      { label: 'Clean Core Score', value: '100% Compliant', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Step 1: SQL Lean Fields', value: '3.2x Speedup', variance: 'Network I/O', detail: 'Select explicit columns only' },
      { category: 'Step 2: Hashed ITAB', value: '12.4x Speedup', variance: 'CPU Memory', detail: 'O(1) key lookups' },
      { category: 'Step 3: Shared Memory', value: '4.1x Speedup', variance: 'RAM Caching', detail: 'SHMA master data cache' }
    ],
    recommendedSapActions: [
      { actionName: 'Apply 3-Step Refactor', tcode: 'SE38', description: 'Deploy refactored source code in DEV' },
      { actionName: 'Verify with SAT Trace', tcode: 'SAT', description: 'Confirm 42x runtime acceleration' }
    ]
  },
  {
    questionId: 'Q29',
    questionText: 'Which code should use CDS instead of traditional SELECTs?',
    category: 'Performance Optimization',
    sapSourceTables: ['VBRK', 'VBRP', 'BSAD', 'PROGDIR'],
    summaryAnswer: 'Identified 5 procedural ABAP reports calculating open customer invoice balances by joining VBRK, VBRP, and BSAD in application memory. Recommended replacing with standard S/4HANA Core Data Service (CDS) View `ZI_OpenInvoices` with pushdown aggregation (`SUM( netwr )`).',
    keyInsights: [
      '5 reports execute identical 3-table joins with client-side arithmetic calculation loops.',
      'CDS View executes aggregation directly in SAP HANA Column Engine.',
      'Reduces data transfer from 85,000 rows to 1 summary record per customer.',
      'CDS View can be reused across Fiori, OData V4, Analysis for Office, and ABAP reports.'
    ],
    codeSnippet: `@AbapCatalog.sqlViewName: 'ZVOPENINV'
@AccessControl.authorizationCheck: #CHECK
@EndUserText.label: 'Open Invoices Analytical View'
DEFINE VIEW ZI_OpenInvoices AS
  SELECT FROM vbrk
  INNER JOIN vbrp ON vbrk.vbeln = vbrp.vbeln
{
  KEY vbrk.vbeln AS Invoice,
      vbrk.kunrg AS Payer,
      SUM( vbrp.netwr ) AS TotalNetAmount
} GROUP BY vbrk.vbeln, vbrk.kunrg`,
    abapMetrics: [
      { label: 'Legacy Reports Target', value: '5 Reports', status: 'warning' },
      { label: 'Data Pushdown', value: 'HANA Engine', status: 'positive' },
      { label: 'Row Reduction', value: '85,000 -> 1 Row', status: 'positive' },
      { label: 'Reusability', value: 'Universal CDS', status: 'positive' }
    ],
    breakdownData: [
      { category: 'ZREP_OPEN_INVOICES', value: 'Procedural ABAP', variance: 'Client Aggregation', detail: 'Loops over 85,000 lines' },
      { category: 'ZI_OpenInvoices', value: 'CDS View Entity', variance: 'HANA Pushdown', detail: 'Native database aggregation' }
    ],
    recommendedSapActions: [
      { actionName: 'Create CDS Data Definition', tcode: 'SE80', description: 'Create and activate CDS View ZI_OpenInvoices' },
      { actionName: 'Test in ADT Data Preview', tcode: 'F8', description: 'Preview query execution results' }
    ]
  },
  {
    questionId: 'Q30',
    questionText: 'Compare runtime before and after this change.',
    category: 'Performance Optimization',
    sapSourceTables: ['SAT', 'ST03N', 'ST12'],
    summaryAnswer: 'SAT Runtime Benchmark Comparison: Total execution dropped from 28,400 ms (Before) to 420 ms (After) — a 67.6x speedup. Database time decreased by 99.3%, RAM memory heap allocation reduced from 1,240 MB to 14 MB (98.8% reduction), and DB roundtrips plummeted from 10,002 to 2.',
    keyInsights: [
      'Total Runtime: 28,400 ms -> 420 ms (67.6x faster).',
      'Database Execution Time: 25,100 ms -> 180 ms (139.4x faster).',
      'Memory Heap Allocation: 1,240 MB -> 14 MB (98.8% savings).',
      'Database Roundtrips: 10,002 -> 2 (99.9% reduction).'
    ],
    codeSnippet: `/* SAT RUNTIME BENCHMARK COMPARISON */
Metric                  Before Optimization     After Optimization      Improvement
Total Runtime           28,400 ms               420 ms                  67.6x Faster
DB Execution Time       25,100 ms               180 ms                  139.4x Faster
RAM Memory Heap         1,240 MB                14 MB                   98.8% Reduction
DB Roundtrips           10,002                  2                       99.9% Reduction`,
    abapMetrics: [
      { label: 'Total Runtime Speedup', value: '67.6x Faster', status: 'positive' },
      { label: 'DB Time Reduction', value: '-99.3%', status: 'positive' },
      { label: 'RAM Memory Saved', value: '-98.8%', status: 'positive' },
      { label: 'DB Roundtrips Saved', value: '-99.9%', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Total Duration', value: '420 ms (After)', variance: '28,400 ms (Before)', detail: '67.6x performance gain' },
      { category: 'DB Processing', value: '180 ms (After)', variance: '25,100 ms (Before)', detail: '139.4x database gain' },
      { category: 'RAM Allocation', value: '14 MB (After)', variance: '1,240 MB (Before)', detail: '98.8% heap reduction' }
    ],
    recommendedSapActions: [
      { actionName: 'Inspect SAT Trace Log', tcode: 'SAT', description: 'Review detailed microsecond call trees' },
      { actionName: 'Attach Benchmark to Transport', tcode: 'SE09', description: 'Log performance validation sign-off' }
    ]
  },

  // ==========================================================================
  // PILLAR 4: DEVELOPMENT & CODE GENERATION (Q31 - Q40)
  // ==========================================================================
  {
    questionId: 'Q31',
    questionText: 'Generate an ABAP class to call this API.',
    category: 'Development & Code Generation',
    sapSourceTables: ['SEOCLASSES', 'SEOMETHODS', 'TADIR'],
    summaryAnswer: 'Generated production-ready Clean Core ABAP HTTP Client Class `ZCL_OUTBOUND_REST_CLIENT` implementing `if_http_client`. Encapsulates SSL handshake, bearer token injection, JSON body payload generation with `xco_cp_json`, and comprehensive exception handling.',
    keyInsights: [
      'Uses Clean Core released interface `if_web_http_client` and `cl_web_http_client_manager`.',
      'Encapsulates authentication tokens securely via SAP Secure Store or Destination Service.',
      'Includes automatic deserialization of REST JSON response into strongly-typed ABAP structures.',
      '100% compliant with SAP Cloud ABAP and S/4HANA 2023 on-premise.'
    ],
    codeSnippet: `CLASS zcl_outbound_rest_client DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    INTERFACES if_oo_adt_classrun.
    METHODS call_external_api
      IMPORTING iv_endpoint TYPE string
      RETURNING VALUE(rv_json) TYPE string
      RAISING   cx_web_http_client_error.
ENDCLASS.

CLASS zcl_outbound_rest_client IMPLEMENTATION.
  METHOD call_external_api.
    DATA(lo_dest) = cl_http_destination_provider=>create_by_url( iv_endpoint ).
    DATA(lo_client) = cl_web_http_client_manager=>create_by_http_destination( lo_dest ).
    DATA(lo_req) = lo_client->get_http_request( ).
    lo_req->set_header_field( i_name = 'Accept' i_value = 'application/json' ).
    DATA(lo_resp) = lo_client->execute( if_web_http_client=>get ).
    rv_json = lo_resp->get_text( ).
  ENDMETHOD.
ENDCLASS.`,
    abapMetrics: [
      { label: 'Clean Core Score', value: '100% Cloud Ready', status: 'positive' },
      { label: 'HTTP Framework', value: 'cl_web_http_client', status: 'positive' },
      { label: 'Security Handshake', value: 'TLS 1.3 / OAuth2', status: 'positive' },
      { label: 'Code Generation', value: 'Active Class Pool', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Class Interface', value: 'ZCL_OUTBOUND_REST_CLIENT', variance: 'Class Pool', detail: 'Outbound REST HTTP handler' },
      { category: 'HTTP Client Manager', value: 'cl_web_http_client_manager', variance: 'Clean Core', detail: 'Released Cloud API' }
    ],
    recommendedSapActions: [
      { actionName: 'Create Class in SE24', tcode: 'SE24', description: 'Deploy class pool and interface methods' },
      { actionName: 'Maintain RFC/HTTP Dest.', tcode: 'SM59', description: 'Configure HTTP connection destination' }
    ]
  },
  {
    questionId: 'Q32',
    questionText: 'Write a CDS view for this reporting requirement.',
    category: 'Development & Code Generation',
    sapSourceTables: ['VBAK', 'VBAP', 'KNA1', 'DD02L'],
    summaryAnswer: 'Generated S/4HANA CDS View Entity `ZC_SalesOrderSummary` joining `I_SalesOrder` and `I_SalesOrderItem`. Computes total item count, currency conversion to USD, and exposes standard UI annotations for automated Fiori Elements List Report generation.',
    keyInsights: [
      'Built as standard CDS View Entity (newer and faster than legacy DDIC SQL views).',
      'Consumes standard C1-released views `I_SalesOrder` and `I_Customer`.',
      'Exposes `@UI.lineItem` and `@UI.selectionField` annotations for zero-code Fiori UI.',
      'Supports automated currency translation via `currency_conversion( )` function.'
    ],
    codeSnippet: `@AccessControl.authorizationCheck: #CHECK
@EndUserText.label: 'Sales Order Executive Summary'
@Metadata.allowExtensions: true
DEFINE VIEW ENTITY ZC_SalesOrderSummary AS
  SELECT FROM I_SalesOrder AS Header
  ASSOCIATION [0..*] TO I_SalesOrderItem AS _Item
    ON $projection.SalesOrder = _Item.SalesOrder
{
  KEY Header.SalesOrder,
      Header.SalesOrganization,
      Header.SoldToParty,
      Header.CreationDate,
      @Semantics.amount.currencyCode: 'TransactionCurrency'
      Header.TotalNetAmount,
      Header.TransactionCurrency,
      _Item
}`,
    abapMetrics: [
      { label: 'View Type', value: 'CDS View Entity', status: 'positive' },
      { label: 'Underlying Views', value: 'I_SalesOrder (C1)', status: 'positive' },
      { label: 'UI Annotations', value: 'Fiori Elements Ready', status: 'positive' },
      { label: 'HANA Engine', value: 'Calculation Engine', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Root Entity', value: 'ZC_SalesOrderSummary', variance: 'View Entity', detail: 'Projection on S/4 sales orders' },
      { category: 'Association', value: 'I_SalesOrderItem', variance: '[0..*] Target', detail: 'Line item association' }
    ],
    recommendedSapActions: [
      { actionName: 'Activate CDS View', tcode: 'SE80', description: 'Activate data definition in ABAP Development Tools' },
      { actionName: 'Preview in Fiori Elements', tcode: '/IWFND/GW_CLIENT', description: 'Test OData V4 entity set query' }
    ]
  },
  {
    questionId: 'Q33',
    questionText: 'Generate unit tests for this class.',
    category: 'Development & Code Generation',
    sapSourceTables: ['AUNIT_CLASSES', 'SEOCOMPO', 'TADIR'],
    summaryAnswer: 'Generated ABAP Unit (AUnit) Test Class `ltc_so_calculator` for `ZCL_SD_SO_CALCULATOR`. Implements standard test doubles via `cl_abap_testdouble`, test fixtures (`setup`/`teardown`), and test boundary methods for positive, zero-quantity, and discount calculation scenarios.',
    keyInsights: [
      'Uses modern `cl_abap_unit_assert=>assert_equals` methods.',
      'Decouples database reads using `cl_abap_testdouble` framework.',
      'Achieves 100% statement and branch code coverage across target class.',
      'Executes in CI/CD pipeline via ATC before transport release.'
    ],
    codeSnippet: `CLASS ltc_so_calculator DEFINITION FINAL FOR TESTING
  DURATION SHORT RISK LEVEL HARMLESS.
  PRIVATE SECTION.
    DATA: mo_cut TYPE REF TO zcl_sd_so_calculator.
    METHODS: setup,
             test_valid_calculation FOR TESTING,
             test_zero_quantity FOR TESTING.
ENDCLASS.

CLASS ltc_so_calculator IMPLEMENTATION.
  METHOD setup.
    mo_cut = NEW #( ).
  ENDMETHOD.
  METHOD test_valid_calculation.
    DATA(lv_res) = mo_cut->calculate( iv_amount = 100 iv_qty = 2 ).
    cl_abap_unit_assert=>assert_equals( exp = 50 act = lv_res msg = 'Incorrect division' ).
  ENDMETHOD.
  METHOD test_zero_quantity.
    DATA(lv_res) = mo_cut->calculate( iv_amount = 100 iv_qty = 0 ).
    cl_abap_unit_assert=>assert_equals( exp = 0 act = lv_res msg = 'Zero quantity failed' ).
  ENDMETHOD.
ENDCLASS.`,
    abapMetrics: [
      { label: 'Unit Test Coverage', value: '100% Statement', status: 'positive' },
      { label: 'Test Methods', value: '4 Assertions', status: 'positive' },
      { label: 'Risk Level', value: 'HARMLESS', status: 'positive' },
      { label: 'Execution Time', value: '12 ms', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Test Class', value: 'ltc_so_calculator', variance: 'AUnit Test Double', detail: 'Local test class pool' },
      { category: 'Boundary Tests', value: 'Zero Qty / Max Val', variance: 'Edge Cases', detail: 'Validates defensive guards' }
    ],
    recommendedSapActions: [
      { actionName: 'Run ABAP Unit in ADT', tcode: 'Ctrl+Shift+F10', description: 'Execute unit test runner in Eclipse ADT' },
      { actionName: 'Inspect Coverage in SCOV', tcode: 'SCOV', description: 'Review branch coverage percentages' }
    ]
  },
  {
    questionId: 'Q34',
    questionText: 'Create a BAdI implementation for this enhancement spot.',
    category: 'Development & Code Generation',
    sapSourceTables: ['ENHSPOTDEF', 'ENHHEADER', 'BADI_SD_SALES_BASIC', 'TADIR'],
    summaryAnswer: 'Created Clean Core Kernel BAdI Implementation `ZES_SD_CHECK_IMPL` for Enhancement Spot `BADI_SD_SALES_BASIC` (Interface `IF_EX_BADI_SD_SALES_BASIC`). Implements custom pre-commit validation rule blocking Sales Orders with unpaid overdue balance exceeding $50,000.',
    keyInsights: [
      'Replaces legacy user exit `MV45AFZZ` with Clean Core standard enhancement.',
      'Executes inside kernel enhancement framework without core modification.',
      'Supports filter-dependent execution (Filter: `VKORG = \'1000\'`).',
      'Passes ATC Clean Core upgrade compatibility checks with zero errors.'
    ],
    codeSnippet: `CLASS zcl_es_sd_check_impl DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    INTERFACES if_ex_badi_sd_sales_basic.
ENDCLASS.

CLASS zcl_es_sd_check_impl IMPLEMENTATION.
  METHOD if_ex_badi_sd_sales_basic~check_document.
    IF is_vbak-vkorg = '1000' AND is_vbak-netwr > 50000.
      " Clean Core validation logic
      DATA(lv_overdue) = zcl_fi_credit_dao=>get_overdue_balance( is_vbak-kunnr ).
      IF lv_overdue > 10000.
        MESSAGE e001(zsd_msg) WITH 'Customer has overdue invoices exceeding threshold' RAISING error.
      ENDIF.
    ENDIF.
  ENDMETHOD.
ENDCLASS.`,
    abapMetrics: [
      { label: 'BAdI Type', value: 'Kernel BAdI', status: 'positive' },
      { label: 'Enhancement Spot', value: 'BADI_SD_SALES_BASIC', status: 'positive' },
      { label: 'Clean Core Score', value: '100% Compliant', status: 'positive' },
      { label: 'Legacy Replacement', value: 'MV45AFZZ Retired', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Implementation Class', value: 'ZCL_ES_SD_CHECK_IMPL', variance: 'Kernel Class', detail: 'Implements IF_EX_BADI_SD_SALES_BASIC' },
      { category: 'Filter Value', value: 'VKORG = 1000', variance: 'Filter Dependent', detail: 'Scoped to Sales Organization 1000' }
    ],
    recommendedSapActions: [
      { actionName: 'Open Enhancement Spot', tcode: 'SE19', description: 'Inspect BAdI implementation details' },
      { actionName: 'Review Message Class', tcode: 'SE91', description: 'Maintain error messages in ZSD_MSG' }
    ]
  },
  {
    questionId: 'Q35',
    questionText: 'Generate RAP business object for this data model.',
    category: 'Development & Code Generation',
    sapSourceTables: ['DDLS_ENTITY', 'BDEF', 'SRVB', 'TADIR'],
    summaryAnswer: 'Generated ABAP RESTful Application Programming Model (RAP) Managed Business Object `ZI_PRODUCT_M` with root entity, child item entity, behavior definition `ZI_PRODUCT_M`, behavior implementation pool `ZBP_I_PRODUCT_M`, and draft persistence table `ZPROD_D`.',
    keyInsights: [
      'Implements standard Managed RAP BO with Draft capabilities.',
      'Supports auto-managed CRUD (Create, Read, Update, Delete) and ETag concurrency.',
      'Defines validation method `validatePrice` and action method `setDiscount`.',
      'Exposed directly to Fiori Elements via OData V4 Service Binding `ZUI_PRODUCT_O4`.'
    ],
    codeSnippet: `MANAGED IMPLEMENTATION IN CLASS zbp_i_product_m UNIQUE;
STRICT ( 2 );
WITH DRAFT;

DEFINE BEHAVIOR FOR ZI_PRODUCT_M ALIAS Product
PERSISTENT TABLE zproduct_db
DRAFT TABLE zproduct_d
LOCK MASTER TOTAL ETAG LastChangedAt
AUTHORIZATION MASTER ( GLOBAL )
{
  CREATE; UPDATE; DELETE;
  DRAFT ACTION Edit;
  DRAFT ACTION Activate OPTIMIZED;
  DRAFT ACTION Discard;
  DRAFT RESUME;
  FIELD ( READONLY ) ProductUUID, CreatedAt, CreatedBy;
  VALIDATION validatePrice ON SAVE { FIELD Price; }
  ACTION setDiscount RESULT [1] $self;
}`,
    abapMetrics: [
      { label: 'RAP BO Architecture', value: 'Managed with Draft', status: 'positive' },
      { label: 'Strict Level', value: 'Strict ( 2 )', status: 'positive' },
      { label: 'Clean Core Score', value: '100% Cloud Ready', status: 'positive' },
      { label: 'Fiori Elements', value: 'Native OData V4', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Behavior Definition', value: 'ZI_PRODUCT_M', variance: 'RAP Root Entity', detail: 'Managed persistence with draft' },
      { category: 'Behavior Pool', value: 'ZBP_I_PRODUCT_M', variance: 'Class Pool', detail: 'Validation and action handlers' }
    ],
    recommendedSapActions: [
      { actionName: 'Open Behavior Definition', tcode: 'ADT', description: 'Edit RAP behavior definition in Eclipse ADT' },
      { actionName: 'Preview RAP Application', tcode: '/IWFND/V4_ADMIN', description: 'Launch Fiori Elements preview' }
    ]
  },
  {
    questionId: 'Q36',
    questionText: 'Convert this procedural code to ABAP OO.',
    category: 'Development & Code Generation',
    sapSourceTables: ['PROGDIR', 'D010INC', 'SEOCLASSES', 'TADIR'],
    summaryAnswer: 'Refactored legacy 350-line procedural report `ZREP_PROCEDURAL_CALC` containing global data (`TABLES: VBAK`) and 8 `FORM` subroutines into modern Clean Core Object-Oriented Class `ZCL_SD_ORDER_PROCESSOR` utilizing Dependency Injection, interfaces, and immutable data structures.',
    keyInsights: [
      'Eliminated all global variables (`TABLES`, `DATA` outside methods).',
      'Replaced 8 `PERFORM` routines with public and private instance methods.',
      'Encapsulated database access behind Data Access Object (DAO) interface `ZIF_SD_ORDER_DAO`.',
      'Enables 100% unit testing via mock injection.'
    ],
    codeSnippet: `/* BEFORE (PROCEDURAL SPAGHETTI): */
TABLES: vbak.
DATA: gv_total TYPE netwr.
PERFORM calculate_total USING vbak-vbeln CHANGING gv_total.

/* AFTER (CLEAN CORE ABAP OO): */
CLASS zcl_sd_order_processor DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    INTERFACES zif_sd_order_processor.
    METHODS constructor IMPORTING io_dao TYPE REF TO zif_sd_order_dao OPTIONAL.
    METHODS calculate_total IMPORTING iv_vbeln TYPE vbeln_va RETURNING VALUE(rv_total) TYPE netwr.
  PRIVATE SECTION.
    DATA mo_dao TYPE REF TO zif_sd_order_dao.
ENDCLASS.`,
    abapMetrics: [
      { label: 'Refactoring Ratio', value: '350 LOC -> Clean OO', status: 'positive' },
      { label: 'Global Variables', value: '0 (Eliminated)', status: 'positive' },
      { label: 'Testability', value: '100% (Mock Ready)', status: 'positive' },
      { label: 'Clean Core Score', value: '100% Compliant', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Legacy Subroutines', value: '8 FORM Routines', variance: 'Deprecated', detail: 'Procedural subroutines retired' },
      { category: 'Modern Methods', value: '4 Instance Methods', variance: 'ABAP OO 7.55+', detail: 'Encapsulated domain logic' }
    ],
    recommendedSapActions: [
      { actionName: 'Create OO Class in SE24', tcode: 'SE24', description: 'Deploy refactored class pool' },
      { actionName: 'Decommission Legacy FORM', tcode: 'SE38', description: 'Archive obsolete procedural include' }
    ]
  },
  {
    questionId: 'Q37',
    questionText: 'Generate ABAPDoc for this class.',
    category: 'Development & Code Generation',
    sapSourceTables: ['SEOCLASSES', 'SEOMETHODS', 'SEOPARAMS', 'TADIR'],
    summaryAnswer: 'Generated complete Clean Core standard ABAPDoc (`"!`) headers for class `ZCL_SD_TAX_ENGINE`, documenting class purpose, constructor dependencies, method parameters (`@parameter iv_netwr`, `@parameter iv_tax_code`), return values, and thrown exceptions (`@raising cx_tax_calc_error`).',
    keyInsights: [
      'Provides rich markdown-formatted documentation viewable in Eclipse ADT.',
      'Documents all business rules and parameter constraints.',
      'Integrates into automated CI/CD documentation pipelines.',
      'Increases Developer Experience score from 45% to 100%.'
    ],
    codeSnippet: `"! <p class="shorttext synchronized">SD Tax Calculation Engine</p>
"! Calculates country and state taxes in compliance with S/4HANA Clean Core.
CLASS zcl_sd_tax_engine DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    "! Calculates composite tax rate for sales order item.
    "! @parameter iv_amount | Base net amount
    "! @parameter iv_tax_code | S/4HANA Tax Indicator (e.g. 'I1', 'O1')
    "! @parameter rv_tax_amount | Calculated tax total
    "! @raising cx_tax_calc_error | Thrown if tax code is invalid
    METHODS calculate_tax
      IMPORTING iv_amount TYPE netwr
                iv_tax_code TYPE mwskz
      RETURNING VALUE(rv_tax_amount) TYPE netwr
      RAISING   cx_tax_calc_error.
ENDCLASS.`,
    abapMetrics: [
      { label: 'ABAPDoc Coverage', value: '100% Complete', status: 'positive' },
      { label: 'ADT Tooltip Ready', value: 'Active', status: 'positive' },
      { label: 'Methods Documented', value: '6 / 6 Methods', status: 'positive' },
      { label: 'Clean Core Score', value: '100%', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Class Header', value: 'ZCL_SD_TAX_ENGINE', variance: 'ABAPDoc Tag', detail: 'Domain overview & usage instructions' },
      { category: 'Method Headers', value: '6 Method Tags', variance: 'Parameter Tags', detail: 'Full parameter & exception definitions' }
    ],
    recommendedSapActions: [
      { actionName: 'Inspect in Eclipse ADT', tcode: 'F2', description: 'Hover over methods to preview ABAPDoc tooltips' },
      { actionName: 'Export HTML Docs', tcode: 'SE38', description: 'Run RS_ABAPDOC_EXPORT documentation generator' }
    ]
  },
  {
    questionId: 'Q38',
    questionText: 'Write an AMDP method for this calculation.',
    category: 'Development & Code Generation',
    sapSourceTables: ['ACDOCA', 'SEOCLASSES', 'AMDP_ROUTINES'],
    summaryAnswer: 'Generated ABAP Managed Database Procedure (AMDP) Class `ZCL_AMDP_FINANCE_ANALYTICS` implementing `if_amdp_marker_hdb`. Executes high-speed SQLScript currency aggregation directly in SAP HANA Database Engine across 10 million Universal Journal (ACDOCA) records in 38 milliseconds.',
    keyInsights: [
      'AMDP marker interface `if_amdp_marker_hdb` delegates execution directly to HANA SQLScript.',
      'Pushes aggregation down to database, avoiding millions of row transfers.',
      'Executes 120x faster than traditional procedural ABAP loops.',
      'Includes database options `READ-ONLY` and explicit client handling.'
    ],
    codeSnippet: `CLASS zcl_amdp_finance_analytics DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    INTERFACES if_amdp_marker_hdb.
    TYPES: BEGIN OF ty_res,
             bukrs TYPE bukrs,
             kunnr TYPE kunnr,
             total_balance TYPE hsl_gl_cur,
           END OF ty_res,
           tt_res TYPE STANDARD TABLE OF ty_res WITH EMPTY KEY.

    CLASS-METHODS get_customer_balances
      IMPORTING VALUE(iv_mandt) TYPE mandt
                VALUE(iv_gjahr) TYPE gjahr
      EXPORTING VALUE(et_balances) TYPE tt_res
      RAISING   cx_amdp_error.
ENDCLASS.

CLASS zcl_amdp_finance_analytics IMPLEMENTATION.
  METHOD get_customer_balances BY DATABASE PROCEDURE FOR HDB LANGUAGE SQLSCRIPT
    OPTIONS READ-ONLY USING acdoca.
    et_balances = SELECT bukrs, kunnr, SUM( hsl ) AS total_balance
                    FROM acdoca
                   WHERE mandt = :iv_mandt AND gjahr = :iv_gjahr
                   GROUP BY bukrs, kunnr;
  ENDMETHOD.
ENDCLASS.`,
    abapMetrics: [
      { label: 'AMDP Language', value: 'HANA SQLScript', status: 'positive' },
      { label: 'Execution Engine', value: 'SAP HANA DB', status: 'positive' },
      { label: 'Latency (10M Rows)', value: '38 ms', status: 'positive' },
      { label: 'Clean Core Score', value: '100% Compliant', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Database Procedure', value: 'get_customer_balances', variance: 'HDB SQLScript', detail: 'Direct column engine aggregation' },
      { category: 'Target Table', value: 'ACDOCA', variance: 'Universal Journal', detail: 'High-speed SQLScript grouping' }
    ],
    recommendedSapActions: [
      { actionName: 'Open AMDP in ADT', tcode: 'ADT', description: 'Edit AMDP SQLScript in ABAP Development Tools' },
      { actionName: 'Test AMDP Execution', tcode: 'SE24', description: 'Execute unit test runner on AMDP method' }
    ]
  },
  {
    questionId: 'Q39',
    questionText: 'How to replace this function module with an S/4 API?',
    category: 'Development & Code Generation',
    sapSourceTables: ['TFDIR', 'ENHSPOTDEF', 'TADIR', 'CL_API_FACTORY'],
    summaryAnswer: 'Migration Blueprint: Replace deprecated function module `BAPI_SALESORDER_CREATEFROMDAT2` with S/4HANA Clean Core Released API Class `cl_salesorder_api_factory=>create_api( )` or RAP Entity `I_SalesOrderTP` via EML (`MODIFY ENTITIES OF I_SalesOrderTP`).',
    keyInsights: [
      'Function module `BAPI_SALESORDER_CREATEFROMDAT2` is unreleased for ABAP Cloud (C0/C1).',
      'Entity Manipulation Language (EML) provides modern transactional buffer orchestration.',
      'EML automatically triggers Clean Core business object validations and determinations.',
      'Migration provides seamless compatibility with S/4HANA Cloud and On-Premise.'
    ],
    codeSnippet: `/* LEGACY CALL: */
CALL FUNCTION 'BAPI_SALESORDER_CREATEFROMDAT2' ...

/* MODERN S/4HANA CLEAN CORE REPLACEMENT: ABAP EML */
MODIFY ENTITIES OF I_SalesOrderTP
  ENTITY SalesOrder
    CREATE FIELDS ( SalesOrderType SalesOrganization DistributionChannel )
      WITH VALUE #( ( %cid = 'NEW_SO_01'
                      SalesOrderType = 'OR'
                      SalesOrganization = '1000'
                      DistributionChannel = '10' ) )
  MAPPED   DATA(lt_mapped)
  FAILED   DATA(lt_failed)
  REPORTED DATA(lt_reported).

COMMIT ENTITIES.`,
    abapMetrics: [
      { label: 'Legacy BAPI', value: 'Deprecated (Cloud)', status: 'warning' },
      { label: 'Modern S/4 API', value: 'RAP EML (C1 Released)', status: 'positive' },
      { label: 'Clean Core Score', value: '100% Compliant', status: 'positive' },
      { label: 'Concurrency', value: 'Transactional Draft', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Legacy Module', value: 'BAPI_SALESORDER_CREATEFROMDAT2', variance: 'Function Module', detail: 'Procedural transactional BAPI' },
      { category: 'Target Architecture', value: 'I_SalesOrderTP (EML)', variance: 'RAP Business Object', detail: 'C1 Released Entity Manipulation Language' }
    ],
    recommendedSapActions: [
      { actionName: 'Inspect Released APIs', tcode: 'SE80', description: 'Browse S/4HANA Cloud C1 released interfaces' },
      { actionName: 'Test EML in Console App', tcode: 'ADT', description: 'Execute EML create in ADT Classrun' }
    ]
  },
  {
    questionId: 'Q40',
    questionText: 'Generate code for this authorization check.',
    category: 'Development & Code Generation',
    sapSourceTables: ['TOST', 'TOSTT', 'AGR_1251', 'USR12'],
    summaryAnswer: 'Generated Clean Core Authorization Check Method `zcl_auth_manager=>check_sales_org_access` evaluating authorization object `V_VBAK_VKO` (Fields: `ACTVT = \'03\'` Display, `VKORG = iv_vkorg`). Automatically logs failed authorization attempts to Security Audit Log (SM20).',
    keyInsights: [
      'Validates user authorization object `V_VBAK_VKO` before data retrieval.',
      'Throws typed security exception `cx_auth_insufficient_privilege` on `sy-subrc = 4` or `sy-subrc = 12`.',
      'Encapsulates repetitive `AUTHORITY-CHECK` statements into reusable Clean Core singleton.',
      'Complies with SOX and GDPR access control standards.'
    ],
    codeSnippet: `CLASS zcl_auth_manager DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    CLASS-METHODS check_sales_org
      IMPORTING iv_vkorg TYPE vkorg
                iv_actvt TYPE activ_auth DEFAULT '03'
      RAISING   cx_auth_insufficient_privilege.
ENDCLASS.

CLASS zcl_auth_manager IMPLEMENTATION.
  METHOD check_sales_org.
    AUTHORITY-CHECK OBJECT 'V_VBAK_VKO'
      ID 'ACTVT' FIELD iv_actvt
      ID 'VKORG' FIELD iv_vkorg
      ID 'VTWEG' DUMMY
      ID 'SPART' DUMMY.
    IF sy-subrc <> 0.
      RAISE EXCEPTION NEW cx_auth_insufficient_privilege(
        textid = cx_auth_insufficient_privilege=>access_denied
        vkorg  = iv_vkorg ).
    ENDIF.
  ENDMETHOD.
ENDCLASS.`,
    abapMetrics: [
      { label: 'Auth Object', value: 'V_VBAK_VKO', status: 'positive' },
      { label: 'Security Standard', value: 'SOX / GDPR', status: 'positive' },
      { label: 'Exception Handling', value: 'Typed OO Exception', status: 'positive' },
      { label: 'Clean Core Score', value: '100%', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Authorization Object', value: 'V_VBAK_VKO', variance: 'Sales Org Check', detail: 'Activity 03 (Display), 02 (Change), 01 (Create)' },
      { category: 'Exception Class', value: 'cx_auth_insufficient_privilege', variance: 'Custom Exception', detail: 'Defensive security termination' }
    ],
    recommendedSapActions: [
      { actionName: 'Inspect Auth Object', tcode: 'SU21', description: 'Review fields for object V_VBAK_VKO' },
      { actionName: 'Test User Authorization', tcode: 'SU53', description: 'Inspect failed authorization buffer' }
    ]
  },

  // ==========================================================================
  // PILLAR 5: S/4HANA MODERNIZATION (Q41 - Q50)
  // ==========================================================================
  {
    questionId: 'Q41',
    questionText: 'Which custom objects are not S/4 compatible?',
    category: 'S/4HANA Modernization',
    sapSourceTables: ['SYCM_RESULTS', 'ATC_FINDINGS', 'TADIR', 'PROGDIR'],
    summaryAnswer: 'ABAP Test Cockpit (ATC) S/4HANA Readiness Check scanned 420 custom Z-objects in Client 100. Finding: 12 custom objects contain S/4HANA blockers (references to obsolete tables KONV, BSEG cluster, and 18-character MATNR fields without translation).',
    keyInsights: [
      '12 custom objects have critical syntax and runtime incompatibilities with S/4HANA 2023.',
      '6 programs read obsolete pricing cluster table `KONV` instead of `PRCD_ELEMENTS`.',
      '4 programs assume 18-character material numbers without using `MATN1` conversion exits or 40-char `matnr`.',
      'Full remediation roadmap available with estimated 14 person-hours total effort.'
    ],
    codeSnippet: `/* S/4HANA READINESS DEFECT SUMMARY */
Total Custom Objects Scanned: 420 Objects
Incompatible Objects: 12 Objects (2.8%)
- 6 Objects: Obsolete Table KONV -> Migrate to PRCD_ELEMENTS
- 4 Objects: Field Length MATNR (18 char) -> Migrate to MATNR40
- 2 Objects: Direct Buffer Access to VBFA/VBUK`,
    abapMetrics: [
      { label: 'Scanned Objects', value: '420 Objects', status: 'neutral' },
      { label: 'Incompatible Objects', value: '12 Objects', status: 'negative' },
      { label: 'Readiness Index', value: '97.2%', status: 'positive' },
      { label: 'Est. Remediation Effort', value: '14 Hours', status: 'positive' }
    ],
    breakdownData: [
      { category: 'KONV Pricing Table', value: '6 Programs', variance: 'Obsolete Table', detail: 'Migrate to PRCD_ELEMENTS' },
      { category: 'Material Length MATNR', value: '4 Programs', variance: 'Data Type', detail: 'Update to 40-char MATNR' },
      { category: 'Status Tables VBUK/VBUP', value: '2 Programs', variance: 'Deprecated', detail: 'Read VBAK/VBAP directly' }
    ],
    recommendedSapActions: [
      { actionName: 'Custom Code Migration (SYCM)', tcode: 'SYCM', description: 'Inspect S/4HANA Custom Code Migration Worklist' },
      { actionName: 'Run Readiness Check in ATC', tcode: 'ATC', description: 'Execute S4HANA_READINESS_2023 check variant' }
    ]
  },
  {
    questionId: 'Q42',
    questionText: 'Find references to obsolete tables.',
    category: 'S/4HANA Modernization',
    sapSourceTables: ['KONV', 'VBUK', 'VBUP', 'BSIS', 'BSAS', 'BSET', 'CROSS'],
    summaryAnswer: 'Identified 18 custom Z-programs referencing obsolete ECC tables: 8 referencing `KONV` (Pricing conditions), 6 referencing `VBUK`/`VBUP` (Sales status), and 4 referencing `BSIS`/`BSAS` (G/L index tables).',
    keyInsights: [
      'KONV -> Replaced in S/4HANA by transparent table PRCD_ELEMENTS.',
      'VBUK/VBUP -> Replaced by native status columns in VBAK and VBAP.',
      'BSIS/BSAS -> Replaced by Universal Journal transparent table ACDOCA.',
      'Refactoring eliminates obsolete compatibility view overhead.'
    ],
    codeSnippet: `/* OBSOLETE ECC TABLE REPLACEMENTS IN S/4HANA */
ECC Obsolete Table      S/4HANA 2023 Replacement       Affected Custom Programs
KONV                    PRCD_ELEMENTS                  8 Programs
VBUK / VBUP             VBAK / VBAP Status Fields      6 Programs
BSIS / BSAS             ACDOCA                         4 Programs
BSEG (Direct Select)    ACDOCA / C1 CDS Views          3 Programs`,
    abapMetrics: [
      { label: 'Obsolete References', value: '18 Programs', status: 'warning' },
      { label: 'PRCD_ELEMENTS Target', value: '8 Programs', status: 'positive' },
      { label: 'ACDOCA Target', value: '4 Programs', status: 'positive' },
      { label: 'Clean Core Score', value: '95.7%', status: 'positive' }
    ],
    breakdownData: [
      { category: 'KONV References', value: '8 Programs', variance: 'Pricing Table', detail: 'ZSD_REP_01, ZSD_REP_04, ...' },
      { category: 'VBUK/VBUP References', value: '6 Programs', variance: 'Status Table', detail: 'ZSD_SO_TRACK, ZSD_DELIV_01, ...' },
      { category: 'BSIS/BSAS References', value: '4 Programs', variance: 'Finance Index', detail: 'ZFI_GL_AUDIT, ZFI_RECON, ...' }
    ],
    recommendedSapActions: [
      { actionName: 'Run Simplification Inspector', tcode: '/SDF/RC_START_CHECK', description: 'Review table simplification items' },
      { actionName: 'Replace Table in SE38', tcode: 'SE38', description: 'Refactor queries to PRCD_ELEMENTS and ACDOCA' }
    ]
  },
  {
    questionId: 'Q43',
    questionText: 'How to convert this program to Clean Core?',
    category: 'S/4HANA Modernization',
    sapSourceTables: ['PROGDIR', 'D010TAB', 'TADIR'],
    summaryAnswer: '4-Step Clean Core Transformation for ZREP_SALES: 1. Replace direct table reads with Released C1 CDS View `I_SalesOrder`, 2. Encapsulate business logic into ABAP OO Class with interface `zif_sales_service`, 3. Remove hardcoded literals into TVARVC, 4. Expose output via OData V4 Service Binding for Fiori Elements.',
    keyInsights: [
      'Converts legacy report from Tier-3 (Legacy Custom Code) to Tier-1 (Clean Core Cloud Ready).',
      'Upgrades survive zero-downtime automated S/4HANA Cloud upgrades without modification.',
      'Decouples frontend UI completely from backend database tier.',
      'Increases Clean Core compliance score from 34% to 100%.'
    ],
    codeSnippet: `/* CLEAN CORE S/4HANA 4-STEP BLUEPRINT */
Step 1: Read C1 Released CDS Entity I_SalesOrder (No direct VBAK reads)
Step 2: Business Logic in Class ZCL_SALES_SERVICE (Clean Core ABAP OO)
Step 3: TVARVC Dynamic Parameters (Zero hardcoded literals)
Step 4: OData V4 Service Binding ZUI_SALES_O4 (Fiori Elements UI)`,
    abapMetrics: [
      { label: 'Clean Core Score (Before)', value: '34%', status: 'negative' },
      { label: 'Clean Core Score (After)', value: '100%', status: 'positive' },
      { label: 'Tier Level', value: 'Tier-1 (Cloud Ready)', status: 'positive' },
      { label: 'Upgrade Safety', value: 'Zero Modification', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Step 1: Data Access', value: 'I_SalesOrder', variance: 'C1 CDS Entity', detail: 'Released stable interface' },
      { category: 'Step 2: Business Logic', value: 'ZCL_SALES_SERVICE', variance: 'Clean Core OO', detail: 'Encapsulated service class' },
      { category: 'Step 3: Configuration', value: 'TVARVC / Table', variance: 'Dynamic Config', detail: 'Zero hardcoded values' },
      { category: 'Step 4: User Experience', value: 'Fiori Elements', variance: 'OData V4', detail: 'Cloud standard UX' }
    ],
    recommendedSapActions: [
      { actionName: 'Configure Clean Core Rules', tcode: 'ATC', description: 'Enable ABAP_CLOUD_READINESS check variant' },
      { actionName: 'Deploy Fiori Service Binding', tcode: '/IWFND/V4_ADMIN', description: 'Publish OData V4 Clean Core service' }
    ]
  },
  {
    questionId: 'Q44',
    questionText: 'Which BAPIs are deprecated in this system?',
    category: 'S/4HANA Modernization',
    sapSourceTables: ['TFDIR', 'FDT_TRANS', 'TADIR', 'CL_API_FACTORY'],
    summaryAnswer: 'Identified 4 deprecated BAPIs currently called in custom code: `BAPI_CUSTOMER_CREATEFROMDATA1` (Deprecated -> replaced by Business Partner API / `CMD_EI_API`), `BAPI_MATERIAL_SAVEDATA` (Use `MD_PRODUCT_API`), `BAPI_INCOMINGINVOICE_CREATE` (Use `cl_supplier_invoice_api`), and `BAPI_SALESORDER_CREATEFROMDAT2` (Use RAP `I_SalesOrderTP`).',
    keyInsights: [
      'Customer/Vendor BAPIs are deprecated due to the S/4HANA Business Partner (CVI) model.',
      'Calling legacy customer BAPIs risks data corruption in BUT000/KNA1 synchronization.',
      'Migrating to Business Partner API (`CL_MD_BP_MAINTAIN`) guarantees 100% CVI synchronization.',
      'All 4 replacements are C1-released for ABAP Cloud.'
    ],
    codeSnippet: `/* DEPRECATED BAPIS AND S/4HANA REPLACEMENTS */
Deprecated BAPI                    S/4HANA Modern Replacement
BAPI_CUSTOMER_CREATEFROMDATA1      CL_MD_BP_MAINTAIN / Business Partner API
BAPI_MATERIAL_SAVEDATA             MD_PRODUCT_API / I_ProductTP (EML)
BAPI_INCOMINGINVOICE_CREATE        CL_SUPPLIER_INVOICE_API
BAPI_SALESORDER_CREATEFROMDAT2     RAP Entity I_SalesOrderTP (EML)`,
    abapMetrics: [
      { label: 'Deprecated BAPIs Used', value: '4 BAPIs', status: 'warning' },
      { label: 'Risk Factor', value: 'CVI / BP Desync', status: 'negative' },
      { label: 'Clean Core Targets', value: 'C1 Released APIs', status: 'positive' },
      { label: 'Upgrade Readiness', value: '100% S/4 Ready', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Customer Creation', value: 'BAPI_CUSTOMER_CREATE', variance: 'Deprecated', detail: 'Migrate to CL_MD_BP_MAINTAIN' },
      { category: 'Material Creation', value: 'BAPI_MATERIAL_SAVEDATA', variance: 'Deprecated', detail: 'Migrate to I_ProductTP' }
    ],
    recommendedSapActions: [
      { actionName: 'Inspect Business Partner API', tcode: 'BP', description: 'Review Business Partner CVI integration' },
      { actionName: 'Check API Catalog in ADT', tcode: 'SE80', description: 'Browse released APIs in SAP Object Navigator' }
    ]
  },
  {
    questionId: 'Q45',
    questionText: 'Show custom code calling unreleased SAP objects.',
    category: 'S/4HANA Modernization',
    sapSourceTables: ['ARS_WBO_OBJECTS', 'ARS_WBO_RELEASE', 'TADIR', 'PROGDIR'],
    summaryAnswer: 'ARS Release State Check identified 14 custom Z-programs referencing unreleased SAP internal objects (C0 Not Released). Top offenders: calls to internal function `SD_SALES_DOCUMENT_SAVE` and direct selects on internal table `T180`.',
    keyInsights: [
      'Unreleased objects may be modified or removed by SAP in future feature pack upgrades without notice.',
      '14 programs violate ABAP Cloud Clean Core contract C1 (Released for Key User / Developer Extensibility).',
      'All 14 calls can be replaced with standard C1 released APIs and RAP business objects.',
      'Refactoring prevents future transport import failures during S/4 upgrades.'
    ],
    codeSnippet: `SELECT tadir~obj_name, tadir~object, ars~release_state
  FROM tadir
  INNER JOIN ars_wbo_objects AS ars ON tadir~obj_name = ars~object_name
 WHERE tadir~devclass LIKE 'Z%'
   AND ars~release_state = 'NOT_RELEASED'
  INTO TABLE @DATA(lt_unreleased_calls).`,
    abapMetrics: [
      { label: 'Unreleased Calls', value: '14 Programs', status: 'warning' },
      { label: 'Release State', value: 'C0 (Not Released)', status: 'negative' },
      { label: 'Clean Core Compliance', value: '88.4%', status: 'warning' },
      { label: 'C1 Replacements', value: '100% Available', status: 'positive' }
    ],
    breakdownData: [
      { category: 'SD_SALES_DOCUMENT_SAVE', value: 'Internal FM', variance: 'C0 Unreleased', detail: 'Replace with RAP EML' },
      { category: 'Table T180 Direct Read', value: 'Internal Table', variance: 'C0 Unreleased', detail: 'Replace with C1 CDS View' }
    ],
    recommendedSapActions: [
      { actionName: 'Browse Released Objects', tcode: 'SE80', description: 'Inspect C1 Released API Catalog in ADT' },
      { actionName: 'Execute Clean Core ATC', tcode: 'ATC', description: 'Run ABAP_CLOUD_CHECK variant' }
    ]
  },
  {
    questionId: 'Q46',
    questionText: 'Which User Exits should be migrated to BAdIs?',
    category: 'S/4HANA Modernization',
    sapSourceTables: ['MODSAP', 'MODACT', 'ENHSPOTDEF', 'PROGDIR'],
    summaryAnswer: 'Identified 6 legacy classic User Exits in package $Z_SD and $Z_MM that require migration to Kernel BAdIs: 1. `USEREXIT_SAVE_DOCUMENT` in MV45AFZZ -> `BADI_SD_SALES_BASIC`, 2. `USEREXIT_PRICING_RULE` -> `BADI_SD_PRICING`, 3. `EXIT_SAPMM06E_012` -> `ME_PROCESS_PO_CUST`.',
    keyInsights: [
      'Classic user exits modify SAP standard includes directly, creating major upgrade upgrade risks.',
      'Kernel BAdIs execute inside isolated encapsulation boundaries with zero core modification.',
      'BAdIs support multiple active implementations and filter-dependent execution.',
      'Automated migration templates generated for all 6 user exit routines.'
    ],
    codeSnippet: `/* USER EXIT TO BADI MIGRATION ROADMAP */
Legacy User Exit Include    Exit Name                Target Clean Core Kernel BAdI
MV45AFZZ                    USEREXIT_SAVE_DOCUMENT   BADI_SD_SALES_BASIC
MV45AFZZ                    USEREXIT_PRICING_RULE    BADI_SD_PRICING
ZXMEU08                     EXIT_SAPMM06E_012        ME_PROCESS_PO_CUST
ZXFKU03                     EXIT_SAPLV60A_001        BADI_SD_BILLING`,
    abapMetrics: [
      { label: 'Legacy User Exits', value: '6 Exits', status: 'warning' },
      { label: 'Target Kernel BAdIs', value: '4 BAdI Spots', status: 'positive' },
      { label: 'Core Modification Risk', value: 'Eliminated', status: 'positive' },
      { label: 'Clean Core Score', value: '100% Post-Mig', status: 'positive' }
    ],
    breakdownData: [
      { category: 'MV45AFZZ (Sales)', value: '2 User Exits', variance: 'Include Mod', detail: 'Migrate to BADI_SD_SALES_BASIC' },
      { category: 'ZXMEU08 (Purchasing)', value: '2 User Exits', variance: 'CMOD Project', detail: 'Migrate to ME_PROCESS_PO_CUST' },
      { category: 'ZXFKU03 (Billing)', value: '2 User Exits', variance: 'CMOD Project', detail: 'Migrate to BADI_SD_BILLING' }
    ],
    recommendedSapActions: [
      { actionName: 'Open Enhancement Builder', tcode: 'SE19', description: 'Create Kernel BAdI implementations' },
      { actionName: 'Inspect CMOD Projects', tcode: 'CMOD', description: 'Deactivate legacy enhancement projects' }
    ]
  },
  {
    questionId: 'Q47',
    questionText: 'Find hard-coded table structures that changed in S/4.',
    category: 'S/4HANA Modernization',
    sapSourceTables: ['DD02L', 'DD03L', 'PROGDIR', 'CROSS'],
    summaryAnswer: 'Identified 8 custom programs with hardcoded data structure assumptions broken in S/4HANA: 4 programs assuming `MATNR` length is 18 characters (`TYPE c LENGTH 18`), and 4 programs assuming `BELNR` is unique without fiscal year `GJAHR` and ledger `RLDNR`.',
    keyInsights: [
      'S/4HANA extended MATNR to 40 characters; hardcoded 18-char declarations truncate material IDs.',
      'Universal Journal ACDOCA requires composite key (`RCLNT`, `RLDNR`, `BUKRS`, `GJAHR`, `BELNR`, `DOCLN`).',
      'Refactored to dynamic dictionary data elements `matnr` and `belnr_d`.',
      'Zero truncation defects across extended material master items.'
    ],
    codeSnippet: `/* DEFECTIVE HARDCODED ECC STRUCTURES */
DATA: lv_matnr(18) TYPE c. " Broken in S/4HANA! Truncates 40-char materials!

/* S/4HANA CLEAN CORE COMPLIANT DECLARATION */
DATA: lv_matnr TYPE matnr. " Full 40-character dictionary element!`,
    abapMetrics: [
      { label: 'Broken Structures', value: '8 Programs', status: 'warning' },
      { label: 'MATNR Truncation Risk', value: '4 Programs', status: 'negative' },
      { label: 'ACDOCA Key Defect', value: '4 Programs', status: 'negative' },
      { label: 'Remediation Ready', value: '100% Fixed', status: 'positive' }
    ],
    breakdownData: [
      { category: 'MATNR 18-Char', value: '4 Programs', variance: 'Field Length', detail: 'Fixed with TYPE matnr' },
      { category: 'BSEG Document Key', value: '4 Programs', variance: 'Key Integrity', detail: 'Fixed with RLDNR + GJAHR composite' }
    ],
    recommendedSapActions: [
      { actionName: 'Inspect Data Elements', tcode: 'SE11', description: 'Verify MATNR data element properties' },
      { actionName: 'Execute Field Length Check', tcode: 'ATC', description: 'Run ATC extended field length check' }
    ]
  },
  {
    questionId: 'Q48',
    questionText: 'Recommend CDS view replacements for this custom report.',
    category: 'S/4HANA Modernization',
    sapSourceTables: ['DDLS_ENTITY', 'VBAK', 'VBAP', 'KNA1'],
    summaryAnswer: 'Recommended replacing 600-line ALV custom report `ZREP_SALES_PIPELINE` with standard S/4HANA C1 Released CDS View `C_SalesOrderExecution` combined with custom extension view `ZC_SalesPipelineExtended`.',
    keyInsights: [
      'C_SalesOrderExecution provides built-in analytics, KPI cards, and drilldowns.',
      'Eliminates 600 lines of procedural ALV grid generation code (`REUSE_ALV_GRID_DISPLAY`).',
      'Supports automated multi-dimensional slicing in Fiori Elements and SAP Analytics Cloud.',
      'Cuts report maintenance costs to zero.'
    ],
    codeSnippet: `/* MODERN REPLACEMENT VIEW FOR ZREP_SALES_PIPELINE */
@EndUserText.label: 'Sales Pipeline Analytics Extension'
@AccessControl.authorizationCheck: #CHECK
DEFINE VIEW ENTITY ZC_SalesPipelineExtended
  AS SELECT FROM C_SalesOrderExecution
{
  KEY SalesOrder,
      SalesOrganization,
      SoldToParty,
      OverallDeliveryStatus,
      TotalNetAmount,
      TransactionCurrency
}`,
    abapMetrics: [
      { label: 'Code Eliminated', value: '600 LOC ALV', status: 'positive' },
      { label: 'Standard Replacement', value: 'C_SalesOrderExecution', status: 'positive' },
      { label: 'UX Modernization', value: 'Fiori Elements App', status: 'positive' },
      { label: 'Clean Core Score', value: '100%', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Legacy ALV Report', value: 'ZREP_SALES_PIPELINE', variance: '600 LOC', detail: 'Procedural ALV grid' },
      { category: 'Modern CDS Entity', value: 'C_SalesOrderExecution', variance: 'C1 CDS View', detail: 'Standard analytical cube' }
    ],
    recommendedSapActions: [
      { actionName: 'Explore View in ADT', tcode: 'ADT', description: 'Preview C_SalesOrderExecution entity data' },
      { actionName: 'Launch Fiori Launchpad', tcode: '/UI2/FLP', description: 'Open Sales Order Execution analytical app' }
    ]
  },
  {
    questionId: 'Q49',
    questionText: 'How to convert this ALV report to Fiori Elements?',
    category: 'S/4HANA Modernization',
    sapSourceTables: ['DDLS_ENTITY', 'SRVB', 'PROGDIR'],
    summaryAnswer: '3-Step ALV to Fiori Elements Conversion: 1. Model data in CDS View Entity `ZC_SalesReport` with UI annotations (`@UI.lineItem`, `@UI.selectionField`), 2. Expose view as OData V4 Service Definition & Binding `ZUI_SALESREPORT_O4`, 3. Generate Fiori Elements List Report Page in SAP Business Application Studio or ADT.',
    keyInsights: [
      'Eliminates all procedural UI logic (`CL_SALV_TABLE` / `REUSE_ALV_GRID_DISPLAY`).',
      'Provides responsive HTML5 web experience across desktop, tablet, and mobile devices.',
      'Supports automated sorting, filtering, column personalization, and Excel export.',
      'Zero custom JavaScript code required.'
    ],
    codeSnippet: `/* STEP 1: CDS VIEW WITH UI ANNOTATIONS */
@EndUserText.label: 'Sales Report Fiori App'
@UI.headerInfo: { typeName: 'Order', typeNamePlural: 'Orders' }
DEFINE VIEW ENTITY ZC_SalesReport AS SELECT FROM I_SalesOrder
{
  @UI.lineItem: [{ position: 10 }]
  @UI.selectionField: [{ position: 10 }]
  KEY SalesOrder,
  @UI.lineItem: [{ position: 20 }]
  SoldToParty,
  @UI.lineItem: [{ position: 30 }]
  TotalNetAmount
}

/* STEP 2: SERVICE DEFINITION */
DEFINE SERVICE ZUI_SALESREPORT_O4 {
  EXPOSE ZC_SalesReport;
}`,
    abapMetrics: [
      { label: 'Conversion Steps', value: '3 Clean Steps', status: 'positive' },
      { label: 'Custom JS Required', value: '0 Lines (Zero)', status: 'positive' },
      { label: 'Fiori Compatibility', value: 'Fiori Elements 1.118', status: 'positive' },
      { label: 'Mobile Responsive', value: '100% Supported', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Step 1: CDS Entity', value: 'ZC_SalesReport', variance: 'UI Annotations', detail: 'LineItem and SelectionField' },
      { category: 'Step 2: OData V4', value: 'ZUI_SALESREPORT_O4', variance: 'Service Binding', detail: 'Published V4 endpoint' },
      { category: 'Step 3: Fiori App', value: 'List Report Page', variance: 'Fiori UX', detail: 'Standard responsive UI' }
    ],
    recommendedSapActions: [
      { actionName: 'Publish Service Binding', tcode: '/IWFND/V4_ADMIN', description: 'Publish and activate OData V4 service' },
      { actionName: 'Preview Fiori Application', tcode: 'ADT', description: 'Open Fiori Elements app preview in browser' }
    ]
  },
  {
    questionId: 'Q50',
    questionText: 'Show custom code readiness score for S/4HANA upgrade.',
    category: 'S/4HANA Modernization',
    sapSourceTables: ['SYCM_RESULTS', 'ATC_FINDINGS', 'TADIR', 'PROGDIR'],
    summaryAnswer: 'S/4HANA Custom Code Readiness Summary for Client 100: Total 420 custom Z-objects analyzed across 32 packages. Readiness Score: 97.2% S/4HANA 2023 Compliant. 408 objects are fully ready (97.2%), 12 objects require minor adjustments (2.8%), and 0 critical system-blockers remain.',
    keyInsights: [
      'Overall Custom Code Readiness Score: 97.2% (Grade A).',
      '408 out of 420 custom objects pass S/4HANA 2023 syntax checks.',
      'Remaining 12 objects require estimated 14 person-hours total remediation effort.',
      'Automated Clean Core AI fix available to remediate all 12 items in transport DEVK900195.'
    ],
    codeSnippet: `/* S/4HANA 2023 CUSTOM CODE READINESS EXECUTIVE SUMMARY */
Total Custom Z-Objects:       420 Objects (100.0%)
S/4HANA Compatible Objects:   408 Objects (97.2% - Ready for Go-Live)
Objects Requiring Remediation: 12 Objects (2.8% - 14 Hours Effort)
Critical System Blockers:       0 Objects (0.0% - Clean!)
Overall Readiness Grade:        GRADE A (97.2% Compliant)`,
    abapMetrics: [
      { label: 'Overall Readiness Score', value: '97.2% Ready', status: 'positive' },
      { label: 'Compatible Objects', value: '408 / 420 Objects', status: 'positive' },
      { label: 'Remediation Effort', value: '14 Person-Hours', status: 'positive' },
      { label: 'Critical Blockers', value: '0 (Zero)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Ready for Upgrade', value: '408 Objects (97.2%)', variance: 'Clean Core', detail: 'Fully compatible with S/4HANA 2023' },
      { category: 'Minor Adjustments', value: '12 Objects (2.8%)', variance: '14 Hours Effort', detail: 'KONV, MATNR length, and status views' },
      { category: 'Critical Blockers', value: '0 Objects (0.0%)', variance: 'Zero Risk', detail: 'No blocking core modifications' }
    ],
    recommendedSapActions: [
      { actionName: 'Generate Readiness Report', tcode: 'SYCM', description: 'Export official S/4HANA Readiness Sign-Off PDF' },
      { actionName: 'Release Remediation Request', tcode: 'SE09', description: 'Transport final Clean Core fixes DEVK900195' }
    ]
  }
];




