import { BwExecutiveQuestionAnswer } from '../types';

export const BW_EXECUTIVE_QUESTIONS_PART2: BwExecutiveQuestionAnswer[] = [
  // =========================================================================
  // PILLAR 3 (CONT.): BW DATA LOAD & ETL QUESTIONS (Q26 - Q30)
  // =========================================================================
  {
    questionId: 'Q26',
    questionText: 'Show duplicate records detected during loading.',
    category: 'BW Data Load & ETL Questions',
    targetSystem: 'BW/4HANA EDW',
    sapTechnicalTarget: 'ADSO Write-Interface Semantic Key Validation',
    pfcgAuthObject: 'S_RS_ADSO',
    sapSourceTables: ['ADSO_SALES_H', 'RSPMREQUEST', 'RSBKREQUEST'],
    summaryAnswer: 'Zero duplicate semantic key violations were detected during today\'s ADSO activation runs across all 15 DataStore objects. Inbound deduplication rules and change-log image aggregations in ADSO_SALES_H and ADSO_FIN_ACDOCA operated with 100% precision.',
    keyInsights: [
      '0 duplicate key violations across 211,800 transactional postings.',
      'Semantic Key Validation: ADSO_SALES_H correctly deduplicated 14 re-transmitted sales order revisions.',
      'Change-log mode: Before/After images properly merged in ADSO_FIN_ACDOCA.',
      'Error stack: Zero records diverted to error handling queue.'
    ],
    analyticsMetrics: [
      { label: 'Duplicates Detected', value: '0 Violations', status: 'positive' },
      { label: 'Re-transmitted Merges', value: '14 Records', status: 'positive' },
      { label: 'Error Stack Count', value: '0 Records', status: 'positive' },
      { label: 'Semantic Integrity', value: '100% Valid', status: 'positive' }
    ],
    breakdownData: [
      { category: 'ADSO_SALES_H (Sales Orders)', value: '0 duplicate violations (14 revisions merged)', variance: 'Clean', detail: 'Semantic keys: SalesOrg, SalesDoc, ItemNumber' },
      { category: 'ADSO_FIN_ACDOCA (Universal Journal)', value: '0 duplicate violations', variance: 'Clean', detail: 'Semantic keys: CoCode, FiscalYear, DocNumber, LineItem' },
      { category: 'ADSO_MATDOC (Material Documents)', value: '0 duplicate violations', variance: 'Clean', detail: 'Semantic keys: MaterialDoc, Year, LineItem' }
    ],
    tableData: {
      headers: ['Target ADSO', 'Semantic Key Fields', 'Evaluated Records', 'Duplicate Violations', 'Error Stack Status'],
      rows: [
        ['ADSO_SALES_H', 'VBELN, POSNR, VKORG', '49,200', '0', 'EMPTY_CLEAN'],
        ['ADSO_FIN_ACDOCA', 'RBUKRS, GJAHR, BELNR, DOCLN', '124,500', '0', 'EMPTY_CLEAN'],
        ['ADSO_MATDOC', 'MBLNR, MJAHR, ZEILE', '38,100', '0', 'EMPTY_CLEAN']
      ]
    },
    technicalDetails: {
      cdsViewsUsed: [],
      bwObjectsInvolved: ['ADSO_SALES_H', 'ADSO_FIN_ACDOCA'],
      datasphereSpacesInvolved: [],
      sqlGenerationBlocked: true,
      auditTrailNote: 'Semantic key duplicate audit executed over ADSO write interface tables.'
    },
    recommendedSapActions: [
      { actionName: 'Error Stack Monitor', tcode: 'RSBM', description: 'Review error stack entries and temporary key conflict tables' },
      { actionName: 'ADSO Modeling Check', tcode: 'BW Modeling Tools', description: 'Inspect semantic key definitions and overwrite parameters' }
    ]
  },
  {
    questionId: 'Q27',
    questionText: 'Which transformations generated errors?',
    category: 'BW Data Load & ETL Questions',
    targetSystem: 'BW/4HANA EDW',
    sapTechnicalTarget: 'BW Transformation Log RSTRAN',
    pfcgAuthObject: 'S_RS_TRFN',
    sapSourceTables: ['RSTRAN', 'RSTRANRULE', 'RSPMREQUEST'],
    summaryAnswer: 'Zero transformation errors were recorded in today\'s ETL execution cycle. All 28 active transformation rules (including TR_2LIS_11_VAHDR_ADSO_SALES_H and TR_0FI_GL_14_ADSO_FIN_ACDOCA) executed with 100% rule success rate and zero ABAP routine short dumps.',
    keyInsights: [
      '0 transformation errors across 28 active transformation mappings.',
      'Transformation TR_2LIS_11_VAHDR_ADSO_SALES_H processed 49,200 records without error.',
      'Transformation TR_0FI_GL_14_ADSO_FIN_ACDOCA processed 124,500 records with 100% precision.',
      'ABAP Expert Routines: Zero runtime exceptions or syntax discrepancies.'
    ],
    analyticsMetrics: [
      { label: 'Transformation Errors', value: '0 Errors', status: 'positive' },
      { label: 'Active Transformations', value: '28 Rules', status: 'positive' },
      { label: 'Transformation Pass Rate', value: '100.00%', status: 'positive' },
      { label: 'ABAP Dumps', value: '0 Dumps', status: 'positive' }
    ],
    breakdownData: [
      { category: 'TR_2LIS_11_VAHDR_ADSO_SALES_H', value: 'Status: GREEN (100% Success)', variance: 'Optimal', detail: '49,200 records mapped without formula error' },
      { category: 'TR_0FI_GL_14_ADSO_FIN_ACDOCA', value: 'Status: GREEN (100% Success)', variance: 'Optimal', detail: '124,500 records mapped without formula error' },
      { category: 'TR_2LIS_03_BF_ADSO_MATDOC', value: 'Status: GREEN (100% Success)', variance: 'Optimal', detail: '38,100 records mapped without formula error' }
    ],
    tableData: {
      headers: ['Transformation Technical ID', 'Source Object', 'Target Object', 'Rule Execution Count', 'Error Count', 'Status'],
      rows: [
        ['TR_2LIS_11_VAHDR_SALES', '2LIS_11_VAHDR', 'ADSO_SALES_H', '49,200', '0', 'GREEN_PASS'],
        ['TR_0FI_GL_14_FIN', '0FI_GL_14', 'ADSO_FIN_ACDOCA', '124,500', '0', 'GREEN_PASS'],
        ['TR_2LIS_03_BF_MAT', '2LIS_03_BF', 'ADSO_MATDOC', '38,100', '0', 'GREEN_PASS']
      ]
    },
    technicalDetails: {
      cdsViewsUsed: [],
      bwObjectsInvolved: ['RSTRAN', 'TR_2LIS_11_VAHDR_ADSO_SALES_H'],
      datasphereSpacesInvolved: [],
      sqlGenerationBlocked: true,
      auditTrailNote: 'Transformation execution log verification from RSTRAN and RSPM log tables.'
    },
    recommendedSapActions: [
      { actionName: 'Transformation Maintenance', tcode: 'RSTRAN', description: 'Review transformation mapping rules, routines, and currency translations' },
      { actionName: 'ABAP Dump Analysis', tcode: 'ST22', description: 'Verify zero transformation-related runtime short dumps in the system' }
    ]
  },
  {
    questionId: 'Q28',
    questionText: "Why are yesterday's sales missing from BW?",
    category: 'BW Data Load & ETL Questions',
    targetSystem: 'BW/4HANA EDW',
    sapTechnicalTarget: 'ODQ Delta Daemon Diagnostic',
    pfcgAuthObject: 'S_RS_DTP, S_RS_ODSO',
    sapSourceTables: ['VBAK', 'ADSO_SALES_H', 'ODQ_QUEUE'],
    summaryAnswer: "Yesterday's sales are NOT missing: 100% of yesterday's 4,820 sales orders ($18.40M) are fully loaded and activated in ADSO_SALES_H. The delta daemon executed successfully at 23:45 UTC, and zero unextracted records remain in the S/4 ODQ delta queue.",
    keyInsights: [
      'Diagnostic Confirmation: Yesterday sales are 100% loaded (4,820 orders).',
      'Revenue Grounding: $18.40M matches exactly between S/4 VBAK and BW ADSO_SALES_H.',
      'Delta Daemon: Executed on schedule at 23:45:00 UTC with zero backlog.',
      'Any user discrepancy is attributable to localized query filter selections (e.g. Sales Org or Currency).'
    ],
    analyticsMetrics: [
      { label: "Yesterday's S/4 Orders", value: '4,820 Orders', status: 'positive' },
      { label: 'Loaded into BW', value: '4,820 Orders (100%)', status: 'positive' },
      { label: 'Missing Count', value: '0 Orders', status: 'positive' },
      { label: 'Delta Lag', value: '0 Minutes', status: 'positive' }
    ],
    breakdownData: [
      { category: 'S/4HANA Source (VBAK)', value: '4,820 Orders ($18.40M)', variance: 'Source Basis', detail: 'Posting date: Yesterday | Client 100' },
      { category: 'BW/4HANA Target (ADSO_SALES_H)', value: '4,820 Orders ($18.40M)', variance: '100% Grounded', detail: 'Request #REQ_20260810_2345 status GREEN' }
    ],
    tableData: {
      headers: ['Sales Organization', 'S/4 VBAK Count', 'BW ADSO Count', 'S/4 Net Value ($M)', 'BW Net Value ($M)', 'Variance'],
      rows: [
        ['1710 (US Domestic)', '2,840', '2,840', '$10.82M', '$10.82M', '$0.00 (0%)'],
        ['1010 (Germany HQ)', '1,420', '1,420', '$5.40M', '$5.40M', '$0.00 (0%)'],
        ['3010 (Singapore APAC)', '560', '560', '$2.18M', '$2.18M', '$0.00 (0%)'],
        ['Total Consolidated', '4,820', '4,820', '$18.40M', '$18.40M', '$0.00 (0%)']
      ]
    },
    technicalDetails: {
      cdsViewsUsed: ['C_SalesOrderAnalytics'],
      bwObjectsInvolved: ['ADSO_SALES_H', 'ODQMON'],
      datasphereSpacesInvolved: [],
      sqlGenerationBlocked: true,
      auditTrailNote: 'Yesterday sales order delta gap audit across VBAK and ADSO_SALES_H.'
    },
    recommendedSapActions: [
      { actionName: 'BeX Query Filter Check', tcode: 'RSRT', description: 'Verify date and sales organization variable filters in BeX Query' },
      { actionName: 'ADSO Data Preview', tcode: 'BW Modeling Tools', description: 'Review active table partition records for yesterday posting date' }
    ]
  },
  {
    questionId: 'Q29',
    questionText: 'Show data-load duration trends.',
    category: 'BW Data Load & ETL Questions',
    targetSystem: 'BW/4HANA EDW',
    sapTechnicalTarget: 'BW ETL Performance Profiler RSBKREQUEST',
    pfcgAuthObject: 'S_RS_DTP',
    sapSourceTables: ['RSBKREQUEST', 'RSPMREQUEST', 'RSDDSTAT'],
    summaryAnswer: 'Data-load duration has remained highly stable over the last 30 days, averaging 4.2 minutes per nightly delta cycle (49,200 records). Execution duration shows no degradation, maintaining a 99.4% on-time completion within the 15-minute nightly batch window.',
    keyInsights: [
      '30-Day Average Load Duration: 4.2 minutes per batch cycle.',
      'Throughput Rate: ~11,700 records per minute during peak DTP processing.',
      'Peak Duration: 4.8 minutes (on month-end billing day).',
      'Batch Window SLA: 15.0 minutes (4.2m actual represents 28% window utilization).'
    ],
    analyticsMetrics: [
      { label: 'Avg Load Duration', value: '4.2 mins', status: 'positive' },
      { label: 'Batch Window SLA', value: '15.0 mins', status: 'positive' },
      { label: 'Window Utilization', value: '28.0%', status: 'positive' },
      { label: 'Stability Index', value: '99.4%', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Extraction & Transfer Phase', value: '1.8 mins avg', variance: 'Nominal', detail: 'ODP data extraction from S/4 source' },
      { category: 'Transformation Phase', value: '1.2 mins avg', variance: 'Nominal', detail: 'Rule mapping and currency translation' },
      { category: 'ADSO Activation Phase', value: '1.2 mins avg', variance: 'Nominal', detail: 'HANA in-memory active table write and change log generation' }
    ],
    tableData: {
      headers: ['Date', 'Delta Request ID', 'Records Processed', 'Duration (Mins)', 'Performance Rating', 'Batch SLA Status'],
      rows: [
        ['2026-08-11', 'REQ_20260811_02', '49,200', '4.1m', 'EXCELLENT', 'MET_SLA'],
        ['2026-08-10', 'REQ_20260810_02', '48,100', '4.3m', 'EXCELLENT', 'MET_SLA'],
        ['2026-08-09', 'REQ_20260809_02', '47,800', '4.2m', 'EXCELLENT', 'MET_SLA'],
        ['2026-08-08', 'REQ_20260808_02', '48,500', '4.4m', 'EXCELLENT', 'MET_SLA']
      ]
    },
    technicalDetails: {
      cdsViewsUsed: [],
      bwObjectsInvolved: ['RSBKREQUEST', 'RSPMREQUEST'],
      datasphereSpacesInvolved: [],
      sqlGenerationBlocked: true,
      auditTrailNote: 'ETL load duration historical trend evaluation from RSBKREQUEST.'
    },
    recommendedSapActions: [
      { actionName: 'Process Monitor', tcode: 'RSPM_MONITOR', description: 'Review DTP run duration charts and parallel processing packet sizes' },
      { actionName: 'Background Job Administration', tcode: 'SM37', description: 'Inspect batch job scheduling and background work process availability' }
    ]
  },
  {
    questionId: 'Q30',
    questionText: 'Predict which nightly loads may miss the reporting SLA.',
    category: 'BW Data Load & ETL Questions',
    targetSystem: 'BW/4HANA EDW',
    sapTechnicalTarget: 'BW PAL Machine Learning SLA Predictor',
    pfcgAuthObject: 'S_RS_PC',
    sapSourceTables: ['RSPCPROCESSLOG', 'RSBKREQUEST', 'RSDDSTAT'],
    summaryAnswer: 'HANA PAL Machine Learning predictive model estimates a 98.4% probability that tonight\'s PC_NIGHTLY_SALES_DELTA and all companion pipelines will complete well inside the 06:00 AM reporting SLA window. Zero process chains are flagged as at-risk for tonight.',
    keyInsights: [
      'Predicted SLA Adherence: 98.4% across all 24 scheduled nightly process chains.',
      'Estimated Total Batch Duration: 28.5 minutes (against a 180-minute window).',
      'At-Risk Chains: 0 chains above the 5% risk threshold.',
      'Server Resource Availability: 84% background work process capacity available.'
    ],
    analyticsMetrics: [
      { label: 'SLA Met Probability', value: '98.4%', status: 'positive' },
      { label: 'At-Risk Chains', value: '0 Chains', status: 'positive' },
      { label: 'Expected Window Finish', value: '03:15 AM UTC', status: 'positive' },
      { label: 'Reporting SLA Deadline', value: '06:00 AM UTC', status: 'positive' }
    ],
    breakdownData: [
      { category: 'PC_NIGHTLY_SALES_DELTA', value: 'Risk: 1.6% (Low)', variance: 'Safe', detail: 'Predicted duration: 4.2 mins | Finish: 02:18 AM' },
      { category: 'PC_FIN_ACDOCA_DELTA', value: 'Risk: 1.2% (Low)', variance: 'Safe', detail: 'Predicted duration: 6.5 mins | Finish: 01:52 AM' },
      { category: 'PC_MAT_INVENTORY_DELTA', value: 'Risk: 0.8% (Low)', variance: 'Safe', detail: 'Predicted duration: 3.8 mins | Finish: 02:34 AM' }
    ],
    tableData: {
      headers: ['Process Chain', 'Predicted Start', 'Predicted Finish', 'SLA Deadline', 'Risk Score %', 'ML Risk Level'],
      rows: [
        ['PC_NIGHTLY_SALES_DELTA', '02:00 AM', '02:18 AM', '06:00 AM', '1.6%', 'VERY_LOW'],
        ['PC_FIN_ACDOCA_DELTA', '01:45 AM', '01:52 AM', '06:00 AM', '1.2%', 'VERY_LOW'],
        ['PC_MAT_INVENTORY_DELTA', '02:30 AM', '02:34 AM', '06:00 AM', '0.8%', 'VERY_LOW']
      ]
    },
    technicalDetails: {
      cdsViewsUsed: [],
      bwObjectsInvolved: ['RSPC_MONITOR', 'RSBKREQUEST'],
      datasphereSpacesInvolved: [],
      sqlGenerationBlocked: true,
      auditTrailNote: 'HANA PAL Regression and Time-Series SLA prediction model evaluation.'
    },
    recommendedSapActions: [
      { actionName: 'Process Chain Scheduling', tcode: 'RSPC', description: 'Verify nightly process chain event triggers and predecessor dependencies' },
      { actionName: 'System Workload Analysis', tcode: 'SM50 / SM51', description: 'Confirm adequate background dialog and batch work processes are configured' }
    ]
  },

  // =========================================================================
  // PILLAR 4: S/4HANA EMBEDDED ANALYTICS (Q31 - Q40)
  // =========================================================================
  {
    questionId: 'Q31',
    questionText: 'Show current sales orders directly from S/4HANA.',
    category: 'S/4HANA Embedded Analytics',
    targetSystem: 'S/4HANA Embedded Analytics',
    sapTechnicalTarget: 'CDS View C_SalesOrderAnalytics & OData API_SALES_ORDER_SRV',
    pfcgAuthObject: 'S_TABU_DIS, V_VBAK_VKO',
    sapSourceTables: ['VBAK', 'VBAP', 'KNA1', 'MARA'],
    summaryAnswer: 'Retrieved live S/4HANA sales orders directly from Client 100 VBAK table: 4 latest active orders totaling $47,100 (including Order #0000006526 for USCU_L09 at $12,500, Order #0000006528 at $15,200, and Order #0000006531 for USCU_L33 at $11,000).',
    keyInsights: [
      'Direct real-time S/4 query bypassing all staging layers with 14ms latency.',
      'Order #0000006526 ($12,500.00) created today for USCU_L09 Customer in Sales Org 1710.',
      'Order #0000006528 ($15,200.00) created today with High-Tech trading goods.',
      'All listed sales orders have complete delivery and credit check status (status = Open).'
    ],
    analyticsMetrics: [
      { label: 'Live Orders Scanned', value: '4 Orders', status: 'positive' },
      { label: 'Total Scanned Value', value: '$47,100.00', status: 'positive' },
      { label: 'Execution Latency', value: '14 ms', status: 'positive' },
      { label: 'Grounding Document', value: '#0000006526', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Order #0000006526', value: '$12,500.00 (USCU_L09)', variance: 'Open / Created', detail: 'Sales Org 1710 | Sold-To: USCU_L09 Customer Corp' },
      { category: 'Order #0000006527', value: '$8,400.00 (USCU_L09)', variance: 'Open / Created', detail: 'Sales Org 1710 | Sold-To: USCU_L09 Customer Corp' },
      { category: 'Order #0000006528', value: '$15,200.00 (USCU_L09)', variance: 'Open / Created', detail: 'Sales Org 1710 | Sold-To: USCU_L09 Customer Corp' },
      { category: 'Order #0000006531', value: '$11,000.00 (USCU_L33)', variance: 'Open / Created', detail: 'Sales Org 1710 | Sold-To: USCU_L33 Electronics Inc' }
    ],
    tableData: {
      headers: ['S/4 Sales Order', 'Sold-To Customer', 'Creation Date', 'Sales Org', 'Net Amount ($)', 'Fulfillment Status'],
      rows: [
        ['0000006526', 'USCU_L09 Customer Corp', 'Today', '1710', '$12,500.00', 'Open / Confirmed'],
        ['0000006527', 'USCU_L09 Customer Corp', 'Today', '1710', '$8,400.00', 'Open / Confirmed'],
        ['0000006528', 'USCU_L09 Customer Corp', 'Today', '1710', '$15,200.00', 'Open / Confirmed'],
        ['0000006531', 'USCU_L33 Electronics Inc', 'Today', '1710', '$11,000.00', 'Open / Confirmed']
      ]
    },
    technicalDetails: {
      cdsViewsUsed: ['C_SalesOrderAnalytics', 'I_SalesOrderBasic'],
      bwObjectsInvolved: [],
      datasphereSpacesInvolved: [],
      sqlGenerationBlocked: true,
      auditTrailNote: 'Direct live S/4HANA OData API call grounded on operational table VBAK.'
    },
    recommendedSapActions: [
      { actionName: 'Display Sales Order', tcode: 'VA03', description: 'Review sales order header, partner functions, and pricing conditions' },
      { actionName: 'Manage Sales Orders', tcode: 'Fiori F1814', description: 'Inspect real-time fulfillment and shipping block statuses' }
    ]
  },
  {
    questionId: 'Q32',
    questionText: 'Compare S/4 operational data with BW reporting data.',
    category: 'S/4HANA Embedded Analytics',
    targetSystem: 'Multi-System Unified Engine',
    sapTechnicalTarget: 'S/4 ACDOCA vs BW ADSO Reconciler',
    pfcgAuthObject: 'S_TABU_DIS, S_RS_COMP',
    sapSourceTables: ['VBAK', 'ACDOCA', 'ADSO_SALES_H', 'ADSO_FIN_ACDOCA'],
    summaryAnswer: 'Comparison between S/4 real-time operational data and BW reporting data shows a negligible 0.01% variance (€15K on €142.80M revenue) caused by the standard 12-minute delta buffering queue. Once the pending delta request activates, variance will be exactly 0.00%.',
    keyInsights: [
      'Live S/4 Operational Revenue: €142.80M (VBAK & ACDOCA live transactions).',
      'BW/4HANA Reporting Revenue: €142.78M (ADSO_SALES_H & ADSO_FIN_ACDOCA).',
      'Variance: €15,000 (0.01%) - within expected real-time synchronization buffer.',
      'Root Cause: 1,240 records in ODQ queue awaiting next scheduled micro-delta run.'
    ],
    analyticsMetrics: [
      { label: 'S/4 Live Revenue', value: '€142.80M', status: 'positive' },
      { label: 'BW EDW Revenue', value: '€142.78M', status: 'positive' },
      { label: 'Variance Amount', value: '€15K (0.01%)', status: 'positive' },
      { label: 'Reconciliation State', value: 'RECONCILED', status: 'positive' }
    ],
    breakdownData: [
      { category: 'S/4 Operational Layer (Real-time)', value: '€142.80M (49,200 orders)', variance: 'Live State', detail: 'Instant transactional posting in S/4 Client 100' },
      { category: 'BW Reporting Layer (EDW)', value: '€142.78M (47,960 orders)', variance: '-€15K (-0.01%)', detail: '1,240 orders currently in delta daemon buffer' }
    ],
    tableData: {
      headers: ['Data Dimension', 'S/4 Real-Time Value', 'BW Reporting Value', 'Variance', 'Explanation'],
      rows: [
        ['Sales Revenue', '€142,800,000', '€142,785,000', '€15,000 (0.01%)', '12-minute delta queue buffering'],
        ['Order Count', '49,200 Orders', '47,960 Orders', '1,240 Orders', 'Pending activation in ADSO_SALES_H'],
        ['Financial Postings', '€35,100,000 EBITDA', '€35,100,000 EBITDA', '€0 (0.00%)', '100% Reconciled']
      ]
    },
    technicalDetails: {
      cdsViewsUsed: ['C_SalesOrderAnalytics'],
      bwObjectsInvolved: ['ADSO_SALES_H', 'CP_SALES_HIST'],
      datasphereSpacesInvolved: [],
      sqlGenerationBlocked: true,
      auditTrailNote: 'Operational vs Reporting comparative analysis across S/4 and BW.'
    },
    recommendedSapActions: [
      { actionName: 'Delta Synchronization', tcode: 'ODQMON', description: 'Trigger delta queue extraction to immediately align BW with S/4' },
      { actionName: 'Reconciliation Dashboard', tcode: 'Fiori F3160', description: 'Review continuous financial and operational reconciliation metrics' }
    ]
  },
  {
    questionId: 'Q33',
    questionText: 'Which S/4 KPIs changed significantly today?',
    category: 'S/4HANA Embedded Analytics',
    targetSystem: 'S/4HANA Embedded Analytics',
    sapTechnicalTarget: 'S/4 Realtime Movement Radar',
    pfcgAuthObject: 'S_TABU_DIS',
    sapSourceTables: ['VBRK', 'BSID', 'VF04', 'ACDOCA'],
    summaryAnswer: '3 S/4 KPIs exhibited significant movement today: (1) Invoiced Revenue increased +3.8% DoD to $4.82M, (2) Days Sales Outstanding (DSO) improved by 3.5 days down to 42.5 days, and (3) VF04 Billing Queue Lock increased by +$420K to $2.10M requiring batch job execution.',
    keyInsights: [
      'Invoiced Revenue: +3.8% DoD surge ($4.82M total billed volume).',
      'DSO Improvement: Dropped 3.5 days to 42.5 days following $3.2M customer cash collections.',
      'Billing Backlog Increase: $2.10M locked in VF04 queue (+$420K change).',
      'Inventory Stock Turnover: Steady at 11.4x annual rate.'
    ],
    analyticsMetrics: [
      { label: 'Invoiced Revenue Change', value: '+3.8%', status: 'positive' },
      { label: 'DSO Improvement', value: '-3.5 Days', status: 'positive' },
      { label: 'Billing Lock Backlog', value: '$2.10M', status: 'warning' },
      { label: 'Cash Collections', value: '$3.20M', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Invoiced Revenue', value: '$4.82M (+3.8% DoD)', variance: 'Positive Shift', detail: 'Driven by North America Trading Goods volume' },
      { category: 'Days Sales Outstanding (DSO)', value: '42.5 Days (-3.5d WoW)', variance: 'Positive Shift', detail: 'Significant customer AR settlements in CoCode 1710' },
      { category: 'VF04 Billing Lock Backlog', value: '$2.10M (+$420K DoD)', variance: 'Requires Action', detail: '42 deliveries completed PGI awaiting batch billing run' }
    ],
    tableData: {
      headers: ['KPI Name', 'Prior Baseline', 'Today Value', 'Movement Delta', 'Business Impact'],
      rows: [
        ['Daily Invoiced Revenue', '$4.64M', '$4.82M', '+$180K (+3.8%)', 'Accelerated top-line recognition'],
        ['Days Sales Outstanding', '46.0 Days', '42.5 Days', '-3.5 Days', 'Improved operational cash liquidity'],
        ['VF04 Billing Queue Lock', '$1.68M', '$2.10M', '+$420K (+25%)', 'Action required to release revenue']
      ]
    },
    technicalDetails: {
      cdsViewsUsed: ['I_ActualFinancialLineItem', 'C_SalesOrderAnalytics'],
      bwObjectsInvolved: [],
      datasphereSpacesInvolved: [],
      sqlGenerationBlocked: true,
      auditTrailNote: 'S/4 real-time KPI delta movement scan across financial and sales tables.'
    },
    recommendedSapActions: [
      { actionName: 'Process Billing Due List', tcode: 'VF04', description: 'Execute collective billing run to release locked revenue' },
      { actionName: 'Cash Inflow Display', tcode: 'FLB1 / Fiori F2335', description: 'Review today incoming lockbox and wire payment settlements' }
    ]
  },
  {
    questionId: 'Q34',
    questionText: 'Show open purchase-order value by plant.',
    category: 'S/4HANA Embedded Analytics',
    targetSystem: 'S/4HANA Embedded Analytics',
    sapTechnicalTarget: 'CDS View C_PurOrdItemAnalytics & EKKO/EKPO',
    pfcgAuthObject: 'M_BEST_WRK, S_TABU_DIS',
    sapSourceTables: ['EKKO', 'EKPO', 'LFA1', 'T001W'],
    summaryAnswer: 'Total open purchase-order value across all plants is $18.50M across 910 open PO line items: Plant 1000 (Dallas) holds $8.40M (420 POs, top supplier: Midwest Industrial), Plant 1010 (Frankfurt) holds $5.20M (280 POs, top supplier: Eurosense Components), and Plant 1020 (Singapore) holds $4.90M.',
    keyInsights: [
      'Total Open PO Spend: $18.50M committed across 910 open purchase orders.',
      'Plant 1000 (Dallas): $8.40M open spend (45.4% share) for direct manufacturing components.',
      'Plant 1010 (Frankfurt): $5.20M open spend (28.1% share) for precision assembly parts.',
      'Plant 1020 (Singapore): $4.90M open spend (26.5% share) for semiconductor micro-chips.'
    ],
    analyticsMetrics: [
      { label: 'Total Open PO Spend', value: '$18.50M', status: 'positive' },
      { label: 'Open PO Count', value: '910 Orders', status: 'neutral' },
      { label: 'Top Plant Spend', value: '$8.40M (Plant 1000)', status: 'neutral' },
      { label: 'Supplier OTIF Rate', value: '89.4%', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Plant 1000 (Dallas Plant)', value: '$8.40M (420 POs)', variance: '45.4% Share', detail: 'Top Vendor: Midwest Industrial Supplies ($3.2M open)' },
      { category: 'Plant 1010 (Frankfurt Plant)', value: '$5.20M (280 POs)', variance: '28.1% Share', detail: 'Top Vendor: Eurosense Components GmbH ($2.1M open)' },
      { category: 'Plant 1020 (Singapore Plant)', value: '$4.90M (210 POs)', variance: '26.5% Share', detail: 'Top Vendor: Pacific HighTech Materials ($2.4M open)' }
    ],
    tableData: {
      headers: ['Plant ID', 'Plant Name', 'Open PO Count', 'Total Open Spend ($M)', 'Top Supplier Partner', 'Avg Delivery Lead Time'],
      rows: [
        ['Plant 1000', 'Dallas Manufacturing', '420', '$8.40M', 'Midwest Industrial Supplies', '14.2 Days'],
        ['Plant 1010', 'Frankfurt Assembly', '280', '$5.20M', 'Eurosense Components GmbH', '11.8 Days'],
        ['Plant 1020', 'Singapore Component', '210', '$4.90M', 'Pacific HighTech Materials', '9.4 Days'],
        ['Consolidated', 'All 3 Plants', '910', '$18.50M', 'Top 3 Strategic Suppliers', '12.1 Days']
      ]
    },
    technicalDetails: {
      cdsViewsUsed: ['C_PurOrdItemAnalytics', 'I_PurchaseOrderItemBasic'],
      bwObjectsInvolved: [],
      datasphereSpacesInvolved: ['SUPPLY_CHAIN_ANALYTICS'],
      sqlGenerationBlocked: true,
      auditTrailNote: 'Open purchase order spend calculated from EKPO line items via CDS view.'
    },
    recommendedSapActions: [
      { actionName: 'Purchase Order Worklist', tcode: 'ME2M / ME2N', description: 'Review open purchase orders by plant and tracking number' },
      { actionName: 'Purchasing Spend Analytics', tcode: 'Fiori F0683', description: 'Analyze purchasing spend by vendor, plant, and purchasing group' }
    ]
  },
  {
    questionId: 'Q35',
    questionText: 'Show current inventory valuation.',
    category: 'S/4HANA Embedded Analytics',
    targetSystem: 'S/4HANA Embedded Analytics',
    sapTechnicalTarget: 'CDS View C_MaterialStockValue & MMBE / MBEW',
    pfcgAuthObject: 'M_MSEG_BWA, S_TABU_DIS',
    sapSourceTables: ['MBEW', 'MARA', 'MARD', 'MATDOC'],
    summaryAnswer: 'Total current S/4HANA inventory valuation is $32.40M across 38,100 active stock line items: Unrestricted-Use Stock represents $24.80M (76.5%), Stock in Quality Inspection represents $4.20M (13.0%), and Blocked Stock represents $3.40M (10.5%). Days Inventory Outstanding (DIO) is healthy at 32.1 days.',
    keyInsights: [
      'Total Inventory Valuation: $32.40M across 38,100 stock items.',
      'Unrestricted Stock: $24.80M (ready for customer allocation and manufacturing).',
      'Quality Inspection Stock: $4.20M (28 active inspection lots in laboratory test).',
      'Blocked Stock: $3.40M (quarantined batches undergoing disposition review).'
    ],
    analyticsMetrics: [
      { label: 'Total Valuation', value: '$32.40M', status: 'positive' },
      { label: 'Unrestricted Stock', value: '$24.80M (76.5%)', status: 'positive' },
      { label: 'Quality Stock', value: '$4.20M (13.0%)', status: 'neutral' },
      { label: 'Blocked Stock', value: '$3.40M (10.5%)', status: 'warning' }
    ],
    breakdownData: [
      { category: 'Unrestricted-Use Stock', value: '$24.80M (142,000 EA)', variance: '76.5% Share', detail: 'Available for immediate delivery and production issuance' },
      { category: 'In Quality Inspection', value: '$4.20M (18,500 EA)', variance: '13.0% Share', detail: 'QA testing in progress at Plant 1000 & 1010 labs' },
      { category: 'Blocked / Restricted Stock', value: '$3.40M (3,200 EA)', variance: '10.5% Share', detail: 'Quarantined lots awaiting return to vendor or scrap posting' }
    ],
    tableData: {
      headers: ['Stock Category', 'Valuated Quantity', 'Total Value ($M)', 'Share %', 'Days Inventory (DIO)', 'Health Rating'],
      rows: [
        ['Unrestricted Stock', '142,000 EA', '$24.80M', '76.5%', '32.1 Days', 'HEALTHY'],
        ['In Quality Inspection', '18,500 EA', '$4.20M', '13.0%', '8.4 Days', 'HEALTHY'],
        ['Blocked Stock', '3,200 EA', '$3.40M', '10.5%', '4.7 Days', 'REQUIRES_DISPOSITION'],
        ['Total Valuation', '163,700 EA', '$32.40M', '100.0%', '32.1 Days', 'OPTIMAL']
      ]
    },
    technicalDetails: {
      cdsViewsUsed: ['C_MaterialStockValue', 'I_MaterialStockByKeyDate'],
      bwObjectsInvolved: [],
      datasphereSpacesInvolved: ['SUPPLY_CHAIN_ANALYTICS'],
      sqlGenerationBlocked: true,
      auditTrailNote: 'Material stock valuation evaluated from MBEW valuated stock records.'
    },
    recommendedSapActions: [
      { actionName: 'Stock Overview', tcode: 'MMBE', description: 'Inspect stock distribution across storage locations and special stock types' },
      { actionName: 'Inventory Valuation Report', tcode: 'MB5L / Fiori F1076', description: 'Review G/L balance versus material subledger reconciliation' }
    ]
  },
  {
    questionId: 'Q36',
    questionText: 'Show production variance by plant.',
    category: 'S/4HANA Embedded Analytics',
    targetSystem: 'S/4HANA Embedded Analytics',
    sapTechnicalTarget: 'Production Order AUFK / AFKO & C_ManufacturingOrder',
    pfcgAuthObject: 'C_AFKO_AWK, S_TABU_DIS',
    sapSourceTables: ['AUFK', 'AFKO', 'AFPO', 'COSP', 'COSS'],
    summaryAnswer: 'Manufacturing schedule attainment stands at 92.8% across all plants. Plant 1000 (Dallas) exhibits a +2.1% production variance (+$180K over standard cost: $8.68M actual vs $8.50M plan) due to component pricing shifts. Plant 1010 is favorable at -$20K (-0.3%), and Plant 1020 has a slight +$20K (+0.5%) variance.',
    keyInsights: [
      'Plant 1000 (Dallas): +$180K (+2.1%) cost variance due to raw material titanium price adjustments.',
      'Plant 1010 (Frankfurt): -$20K (-0.3%) favorable variance with 94.2% schedule attainment.',
      'Plant 1020 (Singapore): +$20K (+0.5%) variance with 93.5% schedule attainment.',
      'Consolidated production variance is +$180K on $18.80M total manufacturing spend.'
    ],
    analyticsMetrics: [
      { label: 'Plant 1000 Variance', value: '+$180K (+2.1%)', status: 'warning' },
      { label: 'Plant 1010 Variance', value: '-$20K (-0.3%)', status: 'positive' },
      { label: 'Plant 1020 Variance', value: '+$20K (+0.5%)', status: 'neutral' },
      { label: 'Manufacturing Attainment', value: '92.8%', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Plant 1000 (Dallas Manufacturing)', value: '$8.68M actual vs $8.50M standard', variance: '+$180K (+2.1%)', detail: 'Material price variance: +$130K | Scrap variance: +$50K' },
      { category: 'Plant 1010 (Frankfurt Assembly)', value: '$6.18M actual vs $6.20M standard', variance: '-$20K (-0.3%)', detail: 'Favorable labor efficiency: -$20K' },
      { category: 'Plant 1020 (Singapore Component)', value: '$4.12M actual vs $4.10M standard', variance: '+$20K (+0.5%)', detail: 'Machine setup variance: +$20K' }
    ],
    tableData: {
      headers: ['Plant ID', 'Planned Cost ($M)', 'Actual Cost ($M)', 'Production Variance ($K)', 'Variance %', 'Attainment %'],
      rows: [
        ['Plant 1000', '$8.50M', '$8.68M', '+$180K', '+2.1%', '91.4%'],
        ['Plant 1010', '$6.20M', '$6.18M', '-$20K', '-0.3%', '94.2%'],
        ['Plant 1020', '$4.10M', '$4.12M', '+$20K', '+0.5%', '93.5%'],
        ['Consolidated', '$18.80M', '$18.98M', '+$180K', '+1.0%', '92.8%']
      ]
    },
    technicalDetails: {
      cdsViewsUsed: ['C_ManufacturingOrder', 'I_ManufacturingOrderItem'],
      bwObjectsInvolved: [],
      datasphereSpacesInvolved: ['SUPPLY_CHAIN_ANALYTICS'],
      sqlGenerationBlocked: true,
      auditTrailNote: 'Production order target vs actual cost variance computed from AUFK/COSP.'
    },
    recommendedSapActions: [
      { actionName: 'Production Order Variance', tcode: 'KOC4 / KKBC_ORD', description: 'Review detailed variance calculation by cost component for Plant 1000 orders' },
      { actionName: 'Production Order Monitor', tcode: 'CO03 / COOIS', description: 'Inspect shop floor operations, material confirmations, and scrap quantities' }
    ]
  },
  {
    questionId: 'Q37',
    questionText: 'Show overdue customer receivables.',
    category: 'S/4HANA Embedded Analytics',
    targetSystem: 'S/4HANA Embedded Analytics',
    sapTechnicalTarget: 'AR Subledger BSID/BSAD & C_CustomerReceivables',
    pfcgAuthObject: 'F_BKPF_BUK, S_TABU_DIS',
    sapSourceTables: ['BSID', 'BSAD', 'KNA1', 'ACDOCA'],
    summaryAnswer: 'Total Accounts Receivable stands at $14.20M: Current non-overdue receivables represent $9.80M (69.0%), 31-60 days aging represents $2.30M (16.2%), and overdue >60 days represents $2.10M (14.8%). Accounts with critical overdue balances include USCU_L09 ($1.20M) and USCU_L14 ($0.60M).',
    keyInsights: [
      'Total Customer Receivables: $14.20M across 128 active customer accounts.',
      'Current & On-Time: $9.80M (69.0%) with healthy payment cadence.',
      'Moderate Aging (31-60 Days): $2.30M (16.2%) under standard reminder cycle.',
      'Critical Overdue (>60 Days): $2.10M (14.8%) prioritized for automated dunning run.'
    ],
    analyticsMetrics: [
      { label: 'Total AR Receivables', value: '$14.20M', status: 'positive' },
      { label: 'Current (0-30 Days)', value: '$9.80M (69.0%)', status: 'positive' },
      { label: 'Overdue >60 Days', value: '$2.10M (14.8%)', status: 'warning' },
      { label: 'DSO Average', value: '42.5 Days', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Current (0-30 Days)', value: '$9.80M (69.0%)', variance: 'Low Risk', detail: 'Normal billing cycle payment terms' },
      { category: '31-60 Days Aging', value: '$2.30M (16.2%)', variance: 'Medium Risk', detail: 'Level 1 dunning reminders dispatched' },
      { category: '> 60 Days Overdue', value: '$2.10M (14.8%)', variance: 'High Risk', detail: 'USCU_L09 ($1.2M) and USCU_L14 ($0.6M) prioritized for collection' }
    ],
    tableData: {
      headers: ['Aging Bucket', 'Total Balance ($M)', 'Share %', 'Account Count', 'Risk Level', 'Collection Action'],
      rows: [
        ['Current (0-30 Days)', '$9.80M', '69.0%', '88', 'LOW', 'Standard invoice delivery'],
        ['31-60 Days', '$2.30M', '16.2%', '24', 'MEDIUM', 'Level 1 payment reminder'],
        ['> 60 Days Overdue', '$2.10M', '14.8%', '16', 'HIGH_RISK', 'Level 2/3 Dunning Notice (F150)']
      ]
    },
    technicalDetails: {
      cdsViewsUsed: ['C_CustomerReceivables', 'I_OperationalAcctgDocItem'],
      bwObjectsInvolved: [],
      datasphereSpacesInvolved: ['SAP_FINANCE_SPACE'],
      sqlGenerationBlocked: true,
      auditTrailNote: 'AR aging analysis evaluated from BSID open customer line items.'
    },
    recommendedSapActions: [
      { actionName: 'Customer Account Balance', tcode: 'FBL5N', description: 'Review individual open customer line items and cleared items' },
      { actionName: 'Dunning Run Execution', tcode: 'F150', description: 'Execute automated dunning run to dispatch reminders to overdue accounts' }
    ]
  },
  {
    questionId: 'Q38',
    questionText: 'Show supplier delivery performance.',
    category: 'S/4HANA Embedded Analytics',
    targetSystem: 'S/4HANA Embedded Analytics',
    sapTechnicalTarget: 'Vendor Scorecard LFA1 & C_SupplierOTIF',
    pfcgAuthObject: 'M_BEST_EKO, S_TABU_DIS',
    sapSourceTables: ['EKKO', 'EKPO', 'LFA1', 'EKET', 'MATDOC'],
    summaryAnswer: 'Overall Supplier On-Time In-Full (OTIF) rating stands at 89.4% across 140 active suppliers. Top strategic supplier Midwest Industrial Supplies achieved 94.2% OTIF (420 deliveries), Eurosense Components achieved 91.8%, while Pacific HighTech Materials is underperforming at 81.2% due to ocean freight transit delays.',
    keyInsights: [
      'Enterprise Supplier OTIF: 89.4% across 1,420 completed purchase deliveries.',
      'Top Performer: Midwest Industrial Supplies with 94.2% OTIF on 420 deliveries.',
      'European Performer: Eurosense Components GmbH with 91.8% OTIF.',
      'Underperformer: Pacific HighTech Materials with 81.2% OTIF (remediation plan active).'
    ],
    analyticsMetrics: [
      { label: 'Overall Supplier OTIF', value: '89.4%', status: 'positive' },
      { label: 'Active Suppliers', value: '140 Vendors', status: 'positive' },
      { label: 'Top Vendor OTIF', value: '94.2%', status: 'positive' },
      { label: 'Total Deliveries', value: '1,420 Shipments', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Midwest Industrial Supplies', value: '94.2% OTIF (420 deliveries)', variance: 'Top Performer', detail: 'Average delivery delay: 0.4 days | Quality pass: 99.1%' },
      { category: 'Eurosense Components GmbH', value: '91.8% OTIF (280 deliveries)', variance: 'Strong Performer', detail: 'Average delivery delay: 0.8 days | Quality pass: 98.4%' },
      { category: 'Pacific HighTech Materials', value: '81.2% OTIF (210 deliveries)', variance: 'Underperforming', detail: 'Average delivery delay: 3.2 days | Port congestion factor' }
    ],
    tableData: {
      headers: ['Supplier ID', 'Supplier Name', 'Delivery Count', 'On-Time %', 'In-Full %', 'Combined OTIF %', 'Status'],
      rows: [
        ['V-10042', 'Midwest Industrial Supplies', '420', '95.4%', '98.7%', '94.2%', 'STRATEGIC_PREFERRED'],
        ['V-10088', 'Eurosense Components GmbH', '280', '93.2%', '98.5%', '91.8%', 'APPROVED'],
        ['V-10114', 'Pacific HighTech Materials', '210', '84.0%', '96.6%', '81.2%', 'REQUIRES_REVIEW'],
        ['Consolidated', 'Top 140 Active Vendors', '1,420', '91.2%', '98.0%', '89.4%', 'ACCEPTABLE']
      ]
    },
    technicalDetails: {
      cdsViewsUsed: ['C_SupplierOTIF', 'I_PurchaseOrderScheduleLineBasic'],
      bwObjectsInvolved: [],
      datasphereSpacesInvolved: ['SUPPLY_CHAIN_ANALYTICS'],
      sqlGenerationBlocked: true,
      auditTrailNote: 'Supplier OTIF evaluation from S/4 purchase order schedule line confirmations.'
    },
    recommendedSapActions: [
      { actionName: 'Supplier Evaluation Scorecard', tcode: 'ME61 / ME64', description: 'Review detailed supplier evaluation scores across price, delivery, and quality' },
      { actionName: 'Supplier Delivery Performance', tcode: 'Fiori F2229', description: 'Launch SAP Fiori Supplier OTIF analytics dashboard' }
    ]
  },
  {
    questionId: 'Q39',
    questionText: 'Which S/4 analytical CDS views are used for this report?',
    category: 'S/4HANA Embedded Analytics',
    targetSystem: 'S/4HANA Embedded Analytics',
    sapTechnicalTarget: 'CDS View Repository DDLNAMES',
    pfcgAuthObject: 'S_TABU_DIS, S_DEVELOP',
    sapSourceTables: ['DDLNAMES', 'DD02B', 'ROOSOURCE'],
    summaryAnswer: '3 primary S/4HANA analytical CDS Views are utilized for this report: (1) C_SalesOrderAnalyticsCube (Consumption view over VBAK/VBAP), (2) I_ActualFinancialLineItem (Interface view over ACDOCA), and (3) C_PurOrdItemAnalytics (Consumption view over EKKO/EKPO). All views feature @Analytics.query: true.',
    keyInsights: [
      'C_SalesOrderAnalyticsCube: Delivers real-time multidimensional sales aggregation.',
      'I_ActualFinancialLineItem: Provides direct columnar access to Universal Journal ACDOCA.',
      'C_PurOrdItemAnalytics: Aggregates purchasing commitments and delivery schedules.',
      'All 3 CDS views have active authorization checks mapped to PFCG role profiles.'
    ],
    analyticsMetrics: [
      { label: 'Analytical CDS Views', value: '3 Views', status: 'positive' },
      { label: 'Data Source Layer', value: 'VBAK, ACDOCA, EKPO', status: 'positive' },
      { label: 'Query Annotation', value: '@Analytics.query', status: 'positive' },
      { label: 'Security Model', value: 'DCL Active', status: 'positive' }
    ],
    breakdownData: [
      { category: 'C_SalesOrderAnalyticsCube', value: 'Sales Order Multidimensional Cube', variance: 'Active', detail: 'Source: VBAK, VBAP, VBRK | Authorization: V_VBAK_VKO' },
      { category: 'I_ActualFinancialLineItem', value: 'Financial Universal Journal View', variance: 'Active', detail: 'Source: ACDOCA | Authorization: F_BKPF_BUK' },
      { category: 'C_PurOrdItemAnalytics', value: 'Purchase Order Analytics View', variance: 'Active', detail: 'Source: EKKO, EKPO | Authorization: M_BEST_WRK' }
    ],
    tableData: {
      headers: ['CDS View Technical Name', 'View Type', 'Underlying Core Table', 'Data Control (DCL)', 'Query Annotation'],
      rows: [
        ['C_SalesOrderAnalyticsCube', 'Consumption View', 'VBAK / VBAP', 'DCL_SalesOrder', '@Analytics.query: true'],
        ['I_ActualFinancialLineItem', 'Basic Interface View', 'ACDOCA', 'DCL_FinancialLineItem', '@Analytics.dataCategory: #CUBE'],
        ['C_PurOrdItemAnalytics', 'Consumption View', 'EKKO / EKPO', 'DCL_PurchaseOrder', '@Analytics.query: true']
      ]
    },
    technicalDetails: {
      cdsViewsUsed: ['C_SalesOrderAnalyticsCube', 'I_ActualFinancialLineItem', 'C_PurOrdItemAnalytics'],
      bwObjectsInvolved: [],
      datasphereSpacesInvolved: [],
      sqlGenerationBlocked: true,
      auditTrailNote: 'CDS view metadata inspected from SAP ABAP Data Dictionary repository.'
    },
    recommendedSapActions: [
      { actionName: 'CDS View Browser', tcode: 'Fiori F2170', description: 'Browse and test active CDS views, analytical queries, and annotations' },
      { actionName: 'Data Control Language (DCL) Check', tcode: 'SACM', description: 'Review row-level DCL authorizations for analytical CDS views' }
    ]
  },
  {
    questionId: 'Q40',
    questionText: 'Explain why this KPI differs between S/4 and BW.',
    category: 'S/4HANA Embedded Analytics',
    targetSystem: 'Multi-System Unified Engine',
    sapTechnicalTarget: 'Multi-System Reconciliation Reasoner',
    pfcgAuthObject: 'S_TABU_DIS, S_RS_COMP',
    sapSourceTables: ['VBAK', 'ADSO_SALES_H', 'ODQ_QUEUE'],
    summaryAnswer: 'The €15K variance (0.01%) between S/4 real-time operational revenue (€142.80M) and BW reporting revenue (€142.78M) is attributable to a 12-minute delta queue buffering lag (1,240 records in ODQ pending activation in ADSO_SALES_H). Both systems are 100% structurally aligned.',
    keyInsights: [
      'Total Variance: €15,000 (0.01% on €142.80M revenue).',
      'Root Cause: 1,240 sales orders created in S/4 in the last 12 minutes are currently buffering in ODQ.',
      'Filter Alignment: Both queries use identical Company Code 1710, Fiscal Year 2026, and USD conversion.',
      'Resolution: Triggering ODQ delta extraction eliminates the 0.01% difference immediately.'
    ],
    analyticsMetrics: [
      { label: 'Total Variance', value: '€15K (0.01%)', status: 'positive' },
      { label: 'Buffering Records', value: '1,240 Records', status: 'neutral' },
      { label: 'Queue Lag', value: '12 Minutes', status: 'positive' },
      { label: 'Reconciliation Health', value: '100% Reconciled', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Operational Real-Time (S/4HANA)', value: '€142.80M (49,200 orders)', variance: 'Live State', detail: 'Instant transactional updates in S/4 Client 100' },
      { category: 'Analytical Reporting (BW/4HANA)', value: '€142.78M (47,960 orders)', variance: 'Delta Lag', detail: '1,240 orders awaiting next scheduled micro-batch delta' }
    ],
    tableData: {
      headers: ['Factor', 'S/4 Embedded Analytics', 'BW/4HANA EDW', 'Impact on Variance'],
      rows: [
        ['Latency / Refresh', 'Real-time (0 sec lag)', 'Scheduled delta (12 min lag)', 'Causes €15K variance'],
        ['Data Cleansing / Transformation', 'Raw transactional postings', 'Enriched with hierarchy rules', 'No numerical discrepancy'],
        ['Currency Translation', 'Real-time daily rate', 'Consolidated monthly average', 'Within 0.001% tolerance']
      ]
    },
    technicalDetails: {
      cdsViewsUsed: ['C_SalesOrderAnalytics'],
      bwObjectsInvolved: ['ADSO_SALES_H'],
      datasphereSpacesInvolved: [],
      sqlGenerationBlocked: true,
      auditTrailNote: 'Cross-engine discrepancy explanation generated by comparing ODQ watermark to S/4.'
    },
    recommendedSapActions: [
      { actionName: 'Delta Synchronization', tcode: 'ODQMON', description: 'Run immediate ODQ extraction to bring BW/4HANA to zero-lag state' },
      { actionName: 'Real-time Union Verification', tcode: 'BW Modeling Tools', description: 'Enable real-time CDS union in CompositeProvider CP_SALES_HIST' }
    ]
  },

  // =========================================================================
  // PILLAR 5: SAP DATASPHERE & DATA MESH (Q41 - Q50)
  // =========================================================================
  {
    questionId: 'Q41',
    questionText: 'Show the available Datasphere spaces.',
    category: 'SAP Datasphere Questions',
    targetSystem: 'SAP Datasphere Data Mesh',
    sapTechnicalTarget: 'Datasphere Space Catalog API',
    pfcgAuthObject: 'S_DS_SPACE',
    sapSourceTables: ['DS_SPACES', 'DS_MODELS', 'DS_STORAGE'],
    summaryAnswer: '3 active SAP Datasphere Spaces are available: (1) SAP_FINANCE_SPACE (8 Analytic Models, 142.5 GB allocated, status ONLINE), (2) SUPPLY_CHAIN_ANALYTICS (6 Analytic Models, 98.2 GB allocated, status ONLINE), and (3) SALES_360_MESH (5 Analytic Models, 74.0 GB allocated, status ONLINE).',
    keyInsights: [
      'Total Datasphere Storage Allocated: 314.7 GB across 3 functional spaces.',
      'Active Spaces: 3 spaces with 19 combined exposed Analytic Models.',
      'Finance Space: 8 models consuming 142.5 GB with live S/4 and BW connections.',
      'Supply Chain Space: 6 models integrating Plant, Purchasing, and Inventory.'
    ],
    analyticsMetrics: [
      { label: 'Available Spaces', value: '3 Spaces', status: 'positive' },
      { label: 'Analytic Models', value: '19 Models', status: 'positive' },
      { label: 'Allocated Storage', value: '314.7 GB', status: 'positive' },
      { label: 'Space Availability', value: '100% ONLINE', status: 'positive' }
    ],
    breakdownData: [
      { category: 'SAP_FINANCE_SPACE', value: '8 Models | 142.5 GB allocated', variance: 'Status: ONLINE', detail: 'General Ledger, Profitability, and Cash Flow analytical mesh' },
      { category: 'SUPPLY_CHAIN_ANALYTICS', value: '6 Models | 98.2 GB allocated', variance: 'Status: ONLINE', detail: 'Plant operations, purchase orders, and inventory valuation' },
      { category: 'SALES_360_MESH', value: '5 Models | 74.0 GB allocated', variance: 'Status: ONLINE', detail: 'Customer 360, pipeline, and regional revenue' }
    ],
    tableData: {
      headers: ['Space ID', 'Space Name', 'Analytic Models', 'Data Memory (GB)', 'Storage Mode', 'Status'],
      rows: [
        ['SAP_FINANCE_SPACE', 'Global Financial Intelligence', '8 Models', '142.5 GB', 'Hot In-Memory', 'ONLINE_HEALTHY'],
        ['SUPPLY_CHAIN_ANALYTICS', 'Supply Chain & Plant Mesh', '6 Models', '98.2 GB', 'Hybrid Federated', 'ONLINE_HEALTHY'],
        ['SALES_360_MESH', 'Sales & Customer 360', '5 Models', '74.0 GB', 'Hot In-Memory', 'ONLINE_HEALTHY']
      ]
    },
    technicalDetails: {
      cdsViewsUsed: [],
      bwObjectsInvolved: [],
      datasphereSpacesInvolved: ['SAP_FINANCE_SPACE', 'SUPPLY_CHAIN_ANALYTICS', 'SALES_360_MESH'],
      sqlGenerationBlocked: true,
      auditTrailNote: 'Datasphere space inventory retrieved via Datasphere Space Management REST API.'
    },
    recommendedSapActions: [
      { actionName: 'Datasphere Space Management', tcode: 'Datasphere Web UI', description: 'Manage space user assignments, storage quotas, and remote connections' },
      { actionName: 'Data Builder Navigation', tcode: 'Datasphere UI / Data Builder', description: 'Open graphical modeling view to inspect table associations and views' }
    ]
  },
  {
    questionId: 'Q42',
    questionText: 'Which analytic models are exposed for consumption?',
    category: 'SAP Datasphere Questions',
    targetSystem: 'SAP Datasphere Data Mesh',
    sapTechnicalTarget: 'Datasphere OData v4 Catalog API',
    pfcgAuthObject: 'S_DS_SPACE',
    sapSourceTables: ['DS_ANALYTIC_MODELS', 'DS_EXPOSED_ENDPOINTS'],
    summaryAnswer: '4 primary SAP Datasphere Analytic Models are exposed for external consumption via OData v4 and INA protocols: (1) AM_ENTERPRISE_FINANCIAL_RECONCILIATION, (2) AM_GLOBAL_SUPPLY_CHAIN_INTELLIGENCE, (3) AM_CUSTOMER_PROFITABILITY_CROSS_SYSTEM, and (4) AM_SALES_PIPELINE. All endpoints are active.',
    keyInsights: [
      'Exposed Models: 4 enterprise models enabled for SAC stories and third-party tools.',
      'AM_ENTERPRISE_FINANCIAL_RECONCILIATION: Powers corporate balance sheets and P&L.',
      'AM_GLOBAL_SUPPLY_CHAIN_INTELLIGENCE: Delivers cross-plant OTIF and inventory mesh.',
      'All endpoints secured via OAuth 2.0 and SAML bearer tokens.'
    ],
    analyticsMetrics: [
      { label: 'Exposed Models', value: '4 Models', status: 'positive' },
      { label: 'Consumption Protocols', value: 'OData v4 & INA', status: 'positive' },
      { label: 'Active Consumers', value: 'SAC, Excel, PowerBI', status: 'positive' },
      { label: 'Model Latency', value: '25 ms avg', status: 'positive' }
    ],
    breakdownData: [
      { category: 'AM_ENTERPRISE_FINANCIAL_RECONCILIATION', value: 'Exposed in SAP_FINANCE_SPACE', variance: 'Active Endpoint', detail: 'Used by SAP Analytics Cloud Corporate Finance story' },
      { category: 'AM_GLOBAL_SUPPLY_CHAIN_INTELLIGENCE', value: 'Exposed in SUPPLY_CHAIN_ANALYTICS', variance: 'Active Endpoint', detail: 'Used by Plant Managers and Logistics Control Tower' },
      { category: 'AM_CUSTOMER_PROFITABILITY_CROSS_SYSTEM', value: 'Exposed in SALES_360_MESH', variance: 'Active Endpoint', detail: 'Used by Sales Executives and Commercial teams' }
    ],
    tableData: {
      headers: ['Analytic Model Technical Name', 'Datasphere Space', 'Exposed Protocol', 'Key Measures', 'Target Consumers'],
      rows: [
        ['AM_ENTERPRISE_FINANCIAL_RECONCILIATION', 'SAP_FINANCE_SPACE', 'OData v4 / INA', 'Revenue, COGS, EBITDA', 'SAP Analytics Cloud'],
        ['AM_GLOBAL_SUPPLY_CHAIN_INTELLIGENCE', 'SUPPLY_CHAIN_ANALYTICS', 'OData v4 / INA', 'OTIF %, DIO, Stock Value', 'Control Tower & PowerBI'],
        ['AM_CUSTOMER_PROFITABILITY_CROSS_SYSTEM', 'SALES_360_MESH', 'OData v4 / INA', 'Margin %, Revenue, Order Qty', 'Executive Dashboard'],
        ['AM_SALES_PIPELINE', 'SALES_360_MESH', 'OData v4', 'Pipeline Value, Win Rate', 'CRM Analytics']
      ]
    },
    technicalDetails: {
      cdsViewsUsed: [],
      bwObjectsInvolved: [],
      datasphereSpacesInvolved: ['SAP_FINANCE_SPACE', 'SUPPLY_CHAIN_ANALYTICS', 'SALES_360_MESH'],
      sqlGenerationBlocked: true,
      auditTrailNote: 'Exposed analytical model endpoints verified via Datasphere Catalog service.'
    },
    recommendedSapActions: [
      { actionName: 'Expose Analytic Model', tcode: 'Datasphere Data Builder', description: 'Configure consumption settings and expose model as OData service' },
      { actionName: 'SAC Model Connection', tcode: 'SAP Analytics Cloud UI', description: 'Create SAC live data connection to Datasphere Analytic Model' }
    ]
  },
  {
    questionId: 'Q43',
    questionText: 'Show datasets available in the Finance space.',
    category: 'SAP Datasphere Questions',
    targetSystem: 'SAP Datasphere Data Mesh',
    sapTechnicalTarget: 'SAP_FINANCE_SPACE Dataset Catalog',
    pfcgAuthObject: 'S_DS_SPACE',
    sapSourceTables: ['DS_FIN_DATASETS', 'DS_VIEWS', 'ACDOCA'],
    summaryAnswer: '5 core datasets are available in SAP_FINANCE_SPACE: (1) ACDOCA_JournalEntries (12.45M records, replicated table), (2) GL_Balances_View (Real-time federated view), (3) ProfitCenter_Hierarchy (Master data dimension), (4) Currency_Rates (Live exchange rates table), and (5) Budget_Plan_2026 (SAC planning import).',
    keyInsights: [
      'Total Finance Datasets: 5 core datasets with 12.45M journal entry records.',
      'Primary Table: ACDOCA_JournalEntries with sub-second columnar in-memory index.',
      'Hierarchy: ProfitCenter_Hierarchy mapped across 3 business units.',
      'Planning: Budget_Plan_2026 integrated from SAP Analytics Cloud.'
    ],
    analyticsMetrics: [
      { label: 'Finance Datasets', value: '5 Datasets', status: 'positive' },
      { label: 'Journal Entry Rows', value: '12.45M Records', status: 'positive' },
      { label: 'Storage Mode', value: 'Hot In-Memory', status: 'positive' },
      { label: 'Dataset Health', value: '100% GREEN', status: 'positive' }
    ],
    breakdownData: [
      { category: 'ACDOCA_JournalEntries', value: '12.45M records (Replicated)', variance: 'Real-Time Sync', detail: 'Direct S/4 replication flow via Cloud Connector' },
      { category: 'GL_Balances_View', value: 'Aggregated View (Federated)', variance: 'Zero Latency', detail: 'Calculated debit/credit totals by G/L account' },
      { category: 'ProfitCenter_Hierarchy', value: 'Master Dimension', variance: 'Master Data', detail: 'Hierarchy tree for CEPC profit centers' },
      { category: 'Currency_Rates', value: 'Exchange Rate Table', variance: 'Daily Rates', detail: 'EUR, USD, SGD, JPY exchange rate matrix' },
      { category: 'Budget_Plan_2026', value: 'Planning Dataset', variance: 'Annual Plan', detail: 'Q1-Q4 operational budget allocations' }
    ],
    tableData: {
      headers: ['Dataset Name', 'Type / Layer', 'Record Count', 'Data Provisioning', 'Last Synchronized'],
      rows: [
        ['ACDOCA_JournalEntries', 'Fact Table', '12,450,000', 'Replication Flow (Real-time)', '2 mins ago'],
        ['GL_Balances_View', 'Analytical View', 'Calculated', 'Federated Remote View', 'Real-time'],
        ['ProfitCenter_Hierarchy', 'Dimension View', '140 Centers', 'Master Data Sync', 'Today 00:00 UTC'],
        ['Currency_Rates', 'Reference Table', '450 Pairs', 'Daily Automated Ingestion', 'Today 06:00 UTC'],
        ['Budget_Plan_2026', 'Planning Fact', '24,000 Lines', 'SAC Planning Import', 'Yesterday']
      ]
    },
    technicalDetails: {
      cdsViewsUsed: [],
      bwObjectsInvolved: [],
      datasphereSpacesInvolved: ['SAP_FINANCE_SPACE'],
      sqlGenerationBlocked: true,
      auditTrailNote: 'Finance space dataset inventory retrieved from Datasphere metadata.'
    },
    recommendedSapActions: [
      { actionName: 'Data Builder Explorer', tcode: 'Datasphere UI', description: 'Inspect table structures and graphical associations in SAP_FINANCE_SPACE' },
      { actionName: 'Replication Task Monitor', tcode: 'Datasphere Data Integration', description: 'Review continuous replication task status for ACDOCA_JournalEntries' }
    ]
  },
  {
    questionId: 'Q44',
    questionText: 'Which Datasphere models depend on S/4HANA?',
    category: 'SAP Datasphere Questions',
    targetSystem: 'SAP Datasphere Data Mesh',
    sapTechnicalTarget: 'Datasphere Dependency Graph API',
    pfcgAuthObject: 'S_DS_SPACE',
    sapSourceTables: ['DS_DEPENDENCY_GRAPH', 'DS_REMOTE_TABLES'],
    summaryAnswer: '3 Datasphere Analytic Models depend directly on live S/4HANA OData and Remote Table connections: (1) AM_ENTERPRISE_FINANCIAL_RECONCILIATION (depends on S/4 ACDOCA & BSID), (2) AM_GLOBAL_SUPPLY_CHAIN_INTELLIGENCE (depends on S/4 EKPO & MATDOC), and (3) AM_CUSTOMER_PROFITABILITY_CROSS_SYSTEM (depends on S/4 VBAK & VBAP).',
    keyInsights: [
      '3 core enterprise models depend on live S/4HANA Client 100 data.',
      'Financial Model: Consumes ACDOCA and BSID open customer invoices.',
      'Supply Chain Model: Consumes EKPO purchase orders and MATDOC inventory movements.',
      'Customer Model: Consumes VBAK sales orders and VBRP billing line items.'
    ],
    analyticsMetrics: [
      { label: 'S/4 Dependent Models', value: '3 Models', status: 'positive' },
      { label: 'S/4 Source Tables', value: '6 Tables', status: 'positive' },
      { label: 'Remote Connection', value: 'S4H_PROD_100', status: 'positive' },
      { label: 'Connection Health', value: 'ONLINE', status: 'positive' }
    ],
    breakdownData: [
      { category: 'AM_ENTERPRISE_FINANCIAL_RECONCILIATION', value: 'Depends on ACDOCA & BSID', variance: 'S/4 Finance', detail: 'General Ledger line items and open AR subledger' },
      { category: 'AM_GLOBAL_SUPPLY_CHAIN_INTELLIGENCE', value: 'Depends on EKPO & MATDOC', variance: 'S/4 Logistics', detail: 'Purchasing items and material stock movements' },
      { category: 'AM_CUSTOMER_PROFITABILITY_CROSS_SYSTEM', value: 'Depends on VBAK & VBAP', variance: 'S/4 Commercial', detail: 'Sales order headers and line item pricing conditions' }
    ],
    tableData: {
      headers: ['Datasphere Model', 'Space', 'S/4 Source Tables Consumed', 'Connection Type', 'Data Flow Mode'],
      rows: [
        ['AM_ENTERPRISE_FINANCIAL_RECONCILIATION', 'SAP_FINANCE_SPACE', 'ACDOCA, BSID, KNA1', 'SAP Cloud Connector', 'Replicated Real-time'],
        ['AM_GLOBAL_SUPPLY_CHAIN_INTELLIGENCE', 'SUPPLY_CHAIN_ANALYTICS', 'EKKO, EKPO, MATDOC, MARC', 'SAP Cloud Connector', 'Federated / Cached'],
        ['AM_CUSTOMER_PROFITABILITY_CROSS_SYSTEM', 'SALES_360_MESH', 'VBAK, VBAP, VBRK, VBRP', 'SAP Cloud Connector', 'Replicated Real-time']
      ]
    },
    technicalDetails: {
      cdsViewsUsed: ['C_SalesOrderAnalytics', 'I_ActualFinancialLineItem'],
      bwObjectsInvolved: [],
      datasphereSpacesInvolved: ['SAP_FINANCE_SPACE', 'SUPPLY_CHAIN_ANALYTICS', 'SALES_360_MESH'],
      sqlGenerationBlocked: true,
      auditTrailNote: 'Datasphere dependency graph traversed across remote table connections.'
    },
    recommendedSapActions: [
      { actionName: 'Connection Health Monitor', tcode: 'Datasphere Connections', description: 'Validate S4H_PROD_100 remote connection and Cloud Connector tunnel' },
      { actionName: 'Impact Analysis Graph', tcode: 'Datasphere UI / Impact', description: 'View visual dependency lineage for S/4HANA remote tables' }
    ]
  },
  {
    questionId: 'Q45',
    questionText: 'Show data lineage for this analytical model.',
    category: 'SAP Datasphere Questions',
    targetSystem: 'SAP Datasphere Data Mesh',
    sapTechnicalTarget: 'Datasphere End-to-End Lineage Tracer',
    pfcgAuthObject: 'S_DS_SPACE',
    sapSourceTables: ['DS_LINEAGE', 'CP_SALES_HIST', 'ADSO_SALES_H', 'VBAK'],
    summaryAnswer: '6-tier end-to-end lineage traced for AM_GLOBAL_SUPPLY_CHAIN: SAP Analytics Cloud Story ➔ Datasphere Analytic Model AM_GLOBAL_SUPPLY_CHAIN ➔ Fact View FV_SUPPLY_CHAIN ➔ CompositeProvider CP_SALES_HIST ➔ ADSO_SALES_H ➔ CDS View C_SalesOrderAnalytics ➔ S/4HANA Sales Document #0000006526.',
    keyInsights: [
      'Full 6-tier governance lineage verified from SAC visualization down to S/4 document.',
      'Tier 1: SAP Analytics Cloud Story "Supply Chain & Executive 360".',
      'Tier 2-3: Datasphere Analytic Model AM_GLOBAL_SUPPLY_CHAIN and Fact View.',
      'Tier 4-6: BW/4HANA CompositeProvider -> ADSO -> S/4HANA CDS View -> Document #0000006526.'
    ],
    analyticsMetrics: [
      { label: 'Lineage Tiers', value: '6 Tiers', status: 'positive' },
      { label: 'Governed Systems', value: 'SAC, DS, BW, S/4', status: 'positive' },
      { label: 'Lineage Integrity', value: '100% Verified', status: 'positive' },
      { label: 'Trace Latency', value: '36 ms', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Tier 1: SAC Story', value: 'Story_Supply_Chain_360', variance: 'Visualization', detail: 'Executive consumption layer' },
      { category: 'Tier 2: Datasphere Analytic Model', value: 'AM_GLOBAL_SUPPLY_CHAIN', variance: 'Semantic Model', detail: 'Space: SUPPLY_CHAIN_ANALYTICS' },
      { category: 'Tier 3: Datasphere Fact View', value: 'FV_SUPPLY_CHAIN', variance: 'Business Layer', detail: 'Associates facts with vendor dimensions' },
      { category: 'Tier 4: BW/4HANA CompositeProvider', value: 'CP_SALES_HIST', variance: 'Data Warehouse', detail: 'Unions historical ADSO with real-time CDS' },
      { category: 'Tier 5: BW/4HANA ADSO', value: 'ADSO_SALES_H', variance: 'Staging Layer', detail: '4.82M persistent sales records' },
      { category: 'Tier 6: S/4HANA Operational Document', value: 'Sales Order #0000006526', variance: 'Source Transaction', detail: 'Client 100 VBAK table' }
    ],
    tableData: {
      headers: ['Tier Level', 'System Layer', 'Object Technical Name', 'Object Description', 'Governance Status'],
      rows: [
        ['Tier 1', 'SAP Analytics Cloud', 'Story_Supply_Chain_360', 'Executive Dashboard Story', 'VERIFIED_CONSUMER'],
        ['Tier 2', 'SAP Datasphere', 'AM_GLOBAL_SUPPLY_CHAIN', 'Analytic Model OData Endpoint', 'VERIFIED_MODEL'],
        ['Tier 3', 'SAP Datasphere', 'FV_SUPPLY_CHAIN', 'Graphical Fact View', 'VERIFIED_VIEW'],
        ['Tier 4', 'BW/4HANA EDW', 'CP_SALES_HIST', 'CompositeProvider Union', 'VERIFIED_INFOPROVIDER'],
        ['Tier 5', 'BW/4HANA EDW', 'ADSO_SALES_H', 'Advanced DataStore Object', 'VERIFIED_DATASTORE'],
        ['Tier 6', 'S/4HANA Core', 'VBAK #0000006526', 'Sales Order Document', 'VERIFIED_GROUNDING']
      ]
    },
    technicalDetails: {
      cdsViewsUsed: ['C_SalesOrderAnalytics'],
      bwObjectsInvolved: ['CP_SALES_HIST', 'ADSO_SALES_H'],
      datasphereSpacesInvolved: ['SUPPLY_CHAIN_ANALYTICS'],
      sqlGenerationBlocked: true,
      auditTrailNote: 'End-to-end lineage traced across SAC, Datasphere, BW/4HANA, and S/4HANA.'
    },
    recommendedSapActions: [
      { actionName: 'Lineage Viewer', tcode: 'Datasphere Data Lineage', description: 'Display interactive end-to-end dependency graph in SAP Datasphere' },
      { actionName: 'Data Catalog Inspection', tcode: 'SAP Datasphere Catalog', description: 'Review data glossary terms and business semantic associations' }
    ]
  },
  {
    questionId: 'Q46',
    questionText: 'Which data products are stale?',
    category: 'SAP Datasphere Questions',
    targetSystem: 'SAP Datasphere Data Mesh',
    sapTechnicalTarget: 'Datasphere Data Product Freshness Monitor',
    pfcgAuthObject: 'S_DS_SPACE',
    sapSourceTables: ['DS_DATA_PRODUCTS', 'DS_REPLICATION_TASKS'],
    summaryAnswer: 'Zero data products are stale. All 19 exposed Datasphere Analytic Models and data products are updated within the last 2 minutes via real-time replication flows and federated remote tables. Replication task latency is currently 0 seconds.',
    keyInsights: [
      '0 stale data products across all 3 Datasphere spaces.',
      'Replication flows running continuously with sub-minute synchronization.',
      'Data Product "Finance Intelligence 360": Refreshed 2 minutes ago.',
      'Data Product "Supply Chain Mesh": Refreshed 2 minutes ago.'
    ],
    analyticsMetrics: [
      { label: 'Stale Data Products', value: '0 Products', status: 'positive' },
      { label: 'Active Data Products', value: '19 Products', status: 'positive' },
      { label: 'Replication Latency', value: '< 2 mins', status: 'positive' },
      { label: 'Data Freshness Score', value: '100.0%', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Finance Intelligence 360', value: 'Refreshed 2 mins ago', variance: 'Optimal', detail: 'Replication Flow: RF_ACDOCA_SYNC status RUNNING' },
      { category: 'Supply Chain Mesh', value: 'Refreshed 2 mins ago', variance: 'Optimal', detail: 'Replication Flow: RF_EKPO_MATDOC status RUNNING' },
      { category: 'Sales Regional 360', value: 'Refreshed 2 mins ago', variance: 'Optimal', detail: 'Replication Flow: RF_SALES_DELTA status RUNNING' }
    ],
    tableData: {
      headers: ['Data Product Name', 'Owning Space', 'Exposed Format', 'Last Refresh Timestamp', 'Freshness State'],
      rows: [
        ['Finance Intelligence 360', 'SAP_FINANCE_SPACE', 'Analytic Model OData', '2 mins ago', 'FRESH_SYNCHRONIZED'],
        ['Supply Chain Mesh', 'SUPPLY_CHAIN_ANALYTICS', 'Analytic Model OData', '2 mins ago', 'FRESH_SYNCHRONIZED'],
        ['Sales Regional 360', 'SALES_360_MESH', 'Analytic Model OData', '2 mins ago', 'FRESH_SYNCHRONIZED']
      ]
    },
    technicalDetails: {
      cdsViewsUsed: [],
      bwObjectsInvolved: [],
      datasphereSpacesInvolved: ['SAP_FINANCE_SPACE', 'SUPPLY_CHAIN_ANALYTICS', 'SALES_360_MESH'],
      sqlGenerationBlocked: true,
      auditTrailNote: 'Data product freshness verified against replication task timestamps.'
    },
    recommendedSapActions: [
      { actionName: 'Data Product Management', tcode: 'Datasphere Data Products', description: 'Review release states, SLAs, and consumer subscription approvals' },
      { actionName: 'Data Integration Monitor', tcode: 'Datasphere Integration', description: 'Inspect active replication tasks and data transmission rates' }
    ]
  },
  {
    questionId: 'Q47',
    questionText: 'Which Datasphere connections are failing?',
    category: 'SAP Datasphere Questions',
    targetSystem: 'SAP Datasphere Data Mesh',
    sapTechnicalTarget: 'Datasphere Connection Health Checker',
    pfcgAuthObject: 'S_DS_CONN',
    sapSourceTables: ['DS_CONNECTIONS', 'DS_CLOUD_CONNECTOR'],
    summaryAnswer: 'Zero Datasphere connections are failing. All 6 remote enterprise connections are ONLINE and healthy: (1) S4H_PROD_100 (S/4HANA Cloud Connector: 18ms latency), (2) BW4_EDW_200 (BW/4HANA RFC: 22ms), (3) HANA_CLOUD_DB (HANA DB Tunnel: 12ms), (4) SALESFORCE_REST (OAuth REST: 45ms), (5) WORKDAY_HCM (REST: 52ms), and (6) AWS_S3_DATALAKE (S3 API: 38ms).',
    keyInsights: [
      '0 connection failures across 6 heterogeneous on-premise and cloud connectors.',
      'S/4HANA Connection: S4H_PROD_100 responding in 18ms over Cloud Connector.',
      'BW/4HANA Connection: BW4_EDW_200 responding in 22ms over RFC gateway.',
      'Cloud Connections: Salesforce, Workday, and AWS S3 all passing heartbeat checks.'
    ],
    analyticsMetrics: [
      { label: 'Failing Connections', value: '0 Connections', status: 'positive' },
      { label: 'Active Connections', value: '6 Connections', status: 'positive' },
      { label: 'Avg Latency', value: '31 ms', status: 'positive' },
      { label: 'Connection Health', value: '100% ONLINE', status: 'positive' }
    ],
    breakdownData: [
      { category: 'S4H_PROD_100 (S/4HANA On-Premise)', value: '18ms latency', variance: 'Status: ONLINE', detail: 'Cloud Connector tunnel active | DP Agent connected' },
      { category: 'BW4_EDW_200 (BW/4HANA EDW)', value: '22ms latency', variance: 'Status: ONLINE', detail: 'Remote tables and BeX queries accessible' },
      { category: 'HANA_CLOUD_DB (HANA Cloud Data Lake)', value: '12ms latency', variance: 'Status: ONLINE', detail: 'High-speed in-memory database replication' },
      { category: 'SALESFORCE_REST (Salesforce Cloud)', value: '45ms latency', variance: 'Status: ONLINE', detail: 'OAuth 2.0 token valid' }
    ],
    tableData: {
      headers: ['Connection ID', 'Source System Type', 'Protocol / Adapter', 'Heartbeat Latency', 'Tunnel Status', 'Health State'],
      rows: [
        ['S4H_PROD_100', 'SAP S/4HANA 2023', 'SAP Cloud Connector / DP Agent', '18 ms', 'CONNECTED', 'ONLINE_HEALTHY'],
        ['BW4_EDW_200', 'SAP BW/4HANA 2021', 'SAP Cloud Connector / RFC', '22 ms', 'CONNECTED', 'ONLINE_HEALTHY'],
        ['HANA_CLOUD_DB', 'SAP HANA Cloud', 'Direct In-Memory Driver', '12 ms', 'DIRECT', 'ONLINE_HEALTHY'],
        ['SALESFORCE_REST', 'Salesforce Sales Cloud', 'REST API Webhook', '45 ms', 'HTTPS', 'ONLINE_HEALTHY'],
        ['WORKDAY_HCM', 'Workday Enterprise', 'REST API Integration', '52 ms', 'HTTPS', 'ONLINE_HEALTHY'],
        ['AWS_S3_DATALAKE', 'Amazon Web Services', 'S3 REST Storage API', '38 ms', 'HTTPS', 'ONLINE_HEALTHY']
      ]
    },
    technicalDetails: {
      cdsViewsUsed: [],
      bwObjectsInvolved: [],
      datasphereSpacesInvolved: ['SAP_FINANCE_SPACE', 'SUPPLY_CHAIN_ANALYTICS', 'SALES_360_MESH'],
      sqlGenerationBlocked: true,
      auditTrailNote: 'Datasphere remote connection health ping executed across all endpoints.'
    },
    recommendedSapActions: [
      { actionName: 'Connection Management', tcode: 'Datasphere Connections', description: 'Validate credentials, refresh OAuth tokens, and test connection endpoints' },
      { actionName: 'Cloud Connector Administration', tcode: 'SCC Web UI', description: 'Inspect Cloud Connector tunnel metrics and resource mappings' }
    ]
  },
  {
    questionId: 'Q48',
    questionText: 'Show users consuming this analytical model.',
    category: 'SAP Datasphere Questions',
    targetSystem: 'SAP Datasphere Data Mesh',
    sapTechnicalTarget: 'Datasphere Active User Audit Log',
    pfcgAuthObject: 'S_DS_SPACE',
    sapSourceTables: ['DS_USER_AUDIT', 'DS_QUERY_LOGS'],
    summaryAnswer: '4 active user sessions are currently consuming AM_ENTERPRISE_FINANCIAL_RECONCILIATION: (1) CFO Executive Story (User: CFO_USER_01 via SAC), (2) Senior BI Architect Workspace (User: BI_ARCH_03 via Datasphere UI), (3) FP&A Analyst (User: FPA_ANALYST_02 via Excel OData Add-In), and (4) Corporate Controller (User: CTRL_DIR_01 via SAC Mobile).',
    keyInsights: [
      '4 active live user sessions querying the financial analytical model.',
      'SAC Story Consumer: CFO_USER_01 reviewing quarterly revenue and EBITDA.',
      'Excel Add-In Consumer: FPA_ANALYST_02 performing margin simulations.',
      'Zero unauthorized access attempts or permission rejections.'
    ],
    analyticsMetrics: [
      { label: 'Active User Sessions', value: '4 Sessions', status: 'positive' },
      { label: 'Client Applications', value: 'SAC, Excel, Web UI', status: 'positive' },
      { label: 'Total Daily Queries', value: '1,420 Queries', status: 'positive' },
      { label: 'Security State', value: '100% Authorized', status: 'positive' }
    ],
    breakdownData: [
      { category: 'CFO_USER_01 (CFO Executive Dashboard)', value: 'Active in SAP Analytics Cloud', variance: 'Executive User', detail: 'Reviewing quarterly revenue, gross margin, and operating cash flow' },
      { category: 'BI_ARCH_03 (Senior BI Architect)', value: 'Active in Datasphere Data Builder', variance: 'Modeler User', detail: 'Monitoring model response latency and space memory allocation' },
      { category: 'FPA_ANALYST_02 (FP&A Senior Analyst)', value: 'Active in SAP Analysis for Office (Excel)', variance: 'Analyst User', detail: 'Executing multi-currency financial simulation pivot tables' },
      { category: 'CTRL_DIR_01 (Corporate Controller)', value: 'Active in SAC Mobile App', variance: 'Management User', detail: 'Reviewing cost center actual vs plan variance alerts' }
    ],
    tableData: {
      headers: ['User ID', 'User Role / Title', 'Client Application', 'Session Duration', 'Executed Queries', 'Auth Scope'],
      rows: [
        ['CFO_USER_01', 'Chief Financial Officer', 'SAP Analytics Cloud (Web)', '24 mins', '18', 'FIN_EXEC_ALL'],
        ['BI_ARCH_03', 'Senior BI Architect', 'SAP Datasphere Data Builder', '42 mins', '34', 'DS_SPACE_ADMIN'],
        ['FPA_ANALYST_02', 'Senior FP&A Analyst', 'SAP Analysis for Office (Excel)', '15 mins', '12', 'FIN_ANALYST_WRITE'],
        ['CTRL_DIR_01', 'Corporate Controller', 'SAC Mobile Application', '8 mins', '6', 'FIN_CONTROLLER_READ']
      ]
    },
    technicalDetails: {
      cdsViewsUsed: [],
      bwObjectsInvolved: [],
      datasphereSpacesInvolved: ['SAP_FINANCE_SPACE'],
      sqlGenerationBlocked: true,
      auditTrailNote: 'Active user session and query audit logs retrieved from Datasphere security trace.'
    },
    recommendedSapActions: [
      { actionName: 'Security & User Audit', tcode: 'Datasphere Administration', description: 'Review active user sessions, role assignments, and space memberships' },
      { actionName: 'Audit Log Export', tcode: 'Datasphere Audit Log API', description: 'Export security audit trail for SOC 2 and ISO 27001 compliance' }
    ]
  },
  {
    questionId: 'Q49',
    questionText: 'Which models have performance issues?',
    category: 'SAP Datasphere Questions',
    targetSystem: 'SAP Datasphere Data Mesh',
    sapTechnicalTarget: 'Datasphere Model Performance Profiler',
    pfcgAuthObject: 'S_DS_SPACE',
    sapSourceTables: ['DS_PERF_LOGS', 'DS_MODEL_METRICS'],
    summaryAnswer: 'Zero Datasphere analytic models have performance issues. Average response latency across all 19 models is 42ms (well within the < 200ms target SLA). The longest executing model is AM_GLOBAL_SUPPLY_CHAIN at 68ms due to multi-system joins, maintaining optimal in-memory execution.',
    keyInsights: [
      '0 performance bottlenecks detected across all 19 Datasphere models.',
      'Average Model Response Time: 42ms across 14,200 daily query executions.',
      'Max Model Response Time: 68ms (AM_GLOBAL_SUPPLY_CHAIN).',
      'In-Memory Cache Hit Rate: 96.4% across all analytical spaces.'
    ],
    analyticsMetrics: [
      { label: 'Models with Issues', value: '0 Models', status: 'positive' },
      { label: 'Avg Model Latency', value: '42 ms', status: 'positive' },
      { label: 'Max Latency', value: '68 ms', status: 'positive' },
      { label: 'Performance SLA Met', value: '100.0%', status: 'positive' }
    ],
    breakdownData: [
      { category: 'AM_GLOBAL_SUPPLY_CHAIN', value: '68ms response time', variance: 'Fast (<200ms SLA)', detail: 'Multi-system join across S/4 EKPO, MATDOC, and Plant masters' },
      { category: 'AM_ENTERPRISE_FINANCIAL_RECONCILIATION', value: '38ms response time', variance: 'Fast (<200ms SLA)', detail: 'Columnar in-memory scan over 12.45M ACDOCA records' },
      { category: 'AM_CUSTOMER_PROFITABILITY_CROSS_SYSTEM', value: '32ms response time', variance: 'Fast (<200ms SLA)', detail: 'Optimized fact-to-dimension association graph' }
    ],
    tableData: {
      headers: ['Analytic Model', 'Owning Space', 'Avg Latency (ms)', 'SLA Threshold (ms)', 'Memory Usage (MB)', 'Performance Assessment'],
      rows: [
        ['AM_GLOBAL_SUPPLY_CHAIN', 'SUPPLY_CHAIN_ANALYTICS', '68 ms', '200 ms', '480 MB', 'OPTIMAL_PERFORMANCE'],
        ['AM_ENTERPRISE_FINANCIAL_RECONCILIATION', 'SAP_FINANCE_SPACE', '38 ms', '200 ms', '720 MB', 'OPTIMAL_PERFORMANCE'],
        ['AM_CUSTOMER_PROFITABILITY_CROSS_SYSTEM', 'SALES_360_MESH', '32 ms', '200 ms', '340 MB', 'OPTIMAL_PERFORMANCE'],
        ['AM_SALES_PIPELINE', 'SALES_360_MESH', '28 ms', '200 ms', '180 MB', 'OPTIMAL_PERFORMANCE']
      ]
    },
    technicalDetails: {
      cdsViewsUsed: [],
      bwObjectsInvolved: [],
      datasphereSpacesInvolved: ['SAP_FINANCE_SPACE', 'SUPPLY_CHAIN_ANALYTICS', 'SALES_360_MESH'],
      sqlGenerationBlocked: true,
      auditTrailNote: 'Model execution latency profiler scan across Datasphere query logs.'
    },
    recommendedSapActions: [
      { actionName: 'Model Performance Profiler', tcode: 'Datasphere Data Builder', description: 'Review model execution plan, calculation nodes, and join filters' },
      { actionName: 'Memory Consumption Audit', tcode: 'Datasphere System Monitor', description: 'Inspect hot memory utilization and partition distribution across spaces' }
    ]
  },
  {
    questionId: 'Q50',
    questionText: 'What data-quality problems require attention today?',
    category: 'SAP Datasphere Questions',
    targetSystem: 'SAP Datasphere Data Mesh',
    sapTechnicalTarget: 'Datasphere Data Quality Anomaly Agent',
    pfcgAuthObject: 'S_DS_SPACE, S_TABU_DIS',
    sapSourceTables: ['DS_DATA_QUALITY', 'KNA1', 'CEPC', 'LFA1'],
    summaryAnswer: 'Overall Data Quality Score is 95.8/100. 2 minor data-quality anomalies require administrative attention: (1) Missing customer tax registration IDs in 12 newly created Business Partner master records (Issue DQ-001, Severity: HIGH), and (2) 4 unmapped profit center hierarchy nodes in legacy CO-PA postings (Issue DQ-002, Severity: MEDIUM).',
    keyInsights: [
      'Enterprise Data Quality Score: 95.8 / 100 (Optimal rating).',
      'Issue DQ-001: 12 Business Partner records missing tax IDs in Sales Org 1710 (MDG remediation ready).',
      'Issue DQ-002: 4 CO-PA legacy postings unassigned in CEPC profit center tree.',
      'Zero fatal data corruptions, null key violations, or unlinked foreign keys.'
    ],
    analyticsMetrics: [
      { label: 'Data Quality Score', value: '95.8 / 100', status: 'positive' },
      { label: 'Open Data Quality Issues', value: '2 Issues', status: 'warning' },
      { label: 'High Severity Issues', value: '1 Issue', status: 'warning' },
      { label: 'Master Data Cleanliness', value: '99.1%', status: 'positive' }
    ],
    breakdownData: [
      { category: 'DQ-001: Missing Tax Registration IDs', value: '12 Business Partner Records', variance: 'Severity: HIGH', detail: 'Trigger MDG master data governance workflow for Sales Org 1710 customers' },
      { category: 'DQ-002: Unmapped CO-PA Profit Centers', value: '4 Financial Postings', variance: 'Severity: MEDIUM', detail: 'Update CEPC profit center hierarchy to allocate legacy post lines' }
    ],
    tableData: {
      headers: ['Issue ID', 'Severity', 'Category', 'Description', 'Impacted Records', 'Recommended Remediation'],
      rows: [
        ['DQ-001', 'HIGH', 'Master Data Completeness', 'Missing Tax Registration IDs in BP records', '12 Business Partners', 'Trigger SAP MDG master data enrichment workflow'],
        ['DQ-002', 'MEDIUM', 'Hierarchy Mapping', 'Unmapped CO-PA Profit Centers in CEPC tree', '4 Financial Postings', 'Update CEPC hierarchy in transaction KCH5N'],
        ['DQ-003', 'INFO', 'Address Normalization', 'Standard postal code formatting warning', '28 Vendors', 'Run address verification batch cleanup']
      ]
    },
    technicalDetails: {
      cdsViewsUsed: [],
      bwObjectsInvolved: [],
      datasphereSpacesInvolved: ['SAP_FINANCE_SPACE', 'SALES_360_MESH'],
      sqlGenerationBlocked: true,
      auditTrailNote: 'Datasphere automated data quality profiling scan over master and transaction tables.'
    },
    recommendedSapActions: [
      { actionName: 'Master Data Governance (MDG)', tcode: 'MDG_BS_BP / Fiori F2187', description: 'Trigger automated data quality validation rule in SAP Master Data Governance' },
      { actionName: 'Profit Center Hierarchy Maintenance', tcode: 'KCH5N', description: 'Assign orphan profit centers to active enterprise hierarchy groups' }
    ]
  }
];
