import { BasisExecutiveQuestionAnswer } from '../types';

export const ALL_BASIS_EXECUTIVE_QUESTIONS: BasisExecutiveQuestionAnswer[] = [
  // =========================================================================
  // PILLAR 1: SYSTEM HEALTH (Q1 - Q10)
  // =========================================================================
  {
    questionId: 'Q1',
    questionText: 'Is the SAP production system healthy right now?',
    category: 'System Health',
    sapSourceTables: ['SM51', 'SM50', 'ST02', 'ST06', 'SM21'],
    summaryAnswer: 'The SAP Production System (PRD - S/4HANA 2023 FPS02) is currently HEALTHY with an overall operational score of 98.4%. All 4 application server instances are active, HANA primary DB host is responsive (CPU 18%, Memory 62%), work processes availability is at 94%, and enqueue locks are within normal threshold (<15 active).',
    keyInsights: [
      'All 4 Application Server instances (PAS + 3 AAS) are communicating normally via Message Server.',
      'HANA 2.0 SPS07 database CPU is optimal at 18%, DB memory footprint at 62% of allocated license.',
      'Zero high-severity SM21 syslog alerts or emergency kernel signals detected in the last 60 minutes.'
    ],
    systemMetrics: [
      { label: 'System Health Score', value: '98.4%', status: 'positive' },
      { label: 'Active Instances', value: '4 / 4 Online', status: 'positive' },
      { label: 'Avg Dialog Response', value: '482 ms', status: 'positive' },
      { label: 'Work Process Free', value: '94.2%', status: 'positive' }
    ],
    breakdownData: [
      { category: 'prd-app-01 (PAS)', value: 'Healthy (CPU 22%, RAM 48%)', variance: 'Normal', detail: 'Dialog WP: 38/40 Free, BTC: 18/20 Free' },
      { category: 'prd-app-02 (AAS1)', value: 'Healthy (CPU 26%, RAM 51%)', variance: 'Normal', detail: 'Dialog WP: 36/40 Free, BTC: 19/20 Free' },
      { category: 'prd-app-03 (AAS2)', value: 'Healthy (CPU 31%, RAM 54%)', variance: 'Normal', detail: 'Dialog WP: 34/40 Free, BTC: 17/20 Free' },
      { category: 'prd-db-01 (HANA)', value: 'Optimal (CPU 18%, RAM 62%)', variance: 'Normal', detail: 'Persistence & Log Volume: 42% used' }
    ],
    recommendedSapActions: [
      { actionName: 'System Overview Cockpit', tcode: 'SM51', description: 'Inspect real-time SAP application server instances, host states, and ping response.' },
      { actionName: 'Operating System Monitor', tcode: 'ST06', description: 'Verify CPU, memory swap, and storage I/O statistics across cluster hosts.' }
    ]
  },
  {
    questionId: 'Q2',
    questionText: 'Which SAP systems have critical alerts?',
    category: 'System Health',
    sapSourceTables: ['RZ20', 'SM21', 'ST22', 'SM13', 'DB02'],
    summaryAnswer: 'Across the 5 monitored landscape tiers (PRD, QAS, DEV, SBX, SOLMAN), PRD has 0 critical alerts and 1 warning (tablespace PSAPSR3 at 82%), while QAS has 1 critical alert due to an aborted background job (Z_SD_BILLING_MASS). DEV and SBX are fully green.',
    keyInsights: [
      'PRD: 0 Critical, 1 Warning (SM21 minor RFC timeout to external 3PL carrier API).',
      'QAS: 1 Critical Alert - Background job Z_SD_BILLING_MASS terminated with TIME_OUT dump in SM37.',
      'HANA DB Storage: All data volumes in PRD have >18% free allocation headroom.'
    ],
    systemMetrics: [
      { label: 'Critical Alerts (PRD)', value: '0 Critical', status: 'positive' },
      { label: 'Landscape Alerts', value: '1 Critical (QAS)', status: 'warning' },
      { label: 'System Warnings', value: '2 Warnings', status: 'neutral' },
      { label: 'CCMS Monitor Score', value: '96.8%', status: 'positive' }
    ],
    breakdownData: [
      { category: 'PRD (S/4HANA Prod)', value: '1 Warning', variance: 'Low Risk', detail: 'RFC destination CARRIER_DHL_REST latency > 3200ms' },
      { category: 'QAS (S/4HANA QA)', value: '1 Critical', variance: 'Action Req', detail: 'Job Z_SD_BILLING_MASS failed (TIME_OUT in ST22)' },
      { category: 'DEV (S/4HANA Dev)', value: '0 Alerts', variance: 'Green', detail: 'All work processes and transports idle/ready' }
    ],
    recommendedSapActions: [
      { actionName: 'CCMS Alert Monitor', tcode: 'RZ20', description: 'Review active system monitoring tree elements and acknowledge cleared alerts.' },
      { actionName: 'System Log Analysis', tcode: 'SM21', description: 'Filter warnings and critical entries across all instances for the last 2 hours.' }
    ]
  },
  {
    questionId: 'Q3',
    questionText: 'Show CPU, memory, and disk utilization across all application servers.',
    category: 'System Health',
    sapSourceTables: ['ST06', 'OS01', 'SM51', 'DB02', 'HDB_STAT'],
    summaryAnswer: 'Average CPU utilization across all 4 S/4HANA application servers is 24.8% (Peak 34% on prd-app-03 during MRP run). Total physical RAM utilization is 52.4% with zero paging/swapping to disk. HANA DB host memory is at 62.1% (384 GB used / 618 GB allocated). SAP mount disk usage is at 58% on /usr/sap.',
    keyInsights: [
      'Host prd-app-01 (PAS): CPU 22%, Memory 48.2% (128 GB total), /usr/sap 54% used.',
      'Host prd-app-02 (AAS1): CPU 26%, Memory 51.0% (128 GB total), /usr/sap 56% used.',
      'Host prd-app-03 (AAS2): CPU 31%, Memory 54.5% (128 GB total), /usr/sap 59% used.',
      'Host prd-db-01 (HANA Primary): CPU 18%, Memory 62.1% (768 GB total), /hana/data 52% used.'
    ],
    systemMetrics: [
      { label: 'Avg Cluster CPU', value: '24.8%', status: 'positive' },
      { label: 'Avg Cluster Memory', value: '52.4%', status: 'positive' },
      { label: 'Paging / Swap Rate', value: '0.0 kB/s', status: 'positive' },
      { label: 'HANA Memory Usage', value: '62.1%', status: 'positive' }
    ],
    breakdownData: [
      { category: 'prd-app-01 (PAS)', value: 'CPU 22% | RAM 48%', variance: 'Normal', detail: '/usr/sap: 54% | /sapmnt: 46%' },
      { category: 'prd-app-02 (AAS1)', value: 'CPU 26% | RAM 51%', variance: 'Normal', detail: '/usr/sap: 56% | /sapmnt: 46%' },
      { category: 'prd-app-03 (AAS2)', value: 'CPU 31% | RAM 55%', variance: 'Normal', detail: '/usr/sap: 59% | /sapmnt: 46%' },
      { category: 'prd-db-01 (HANA DB)', value: 'CPU 18% | RAM 62%', variance: 'Normal', detail: '/hana/data: 52% | /hana/log: 28%' }
    ],
    recommendedSapActions: [
      { actionName: 'Operating System Monitor', tcode: 'ST06', description: 'Review comprehensive OS hardware metrics, CPU load average, and memory buffer swap.' },
      { actionName: 'Database Volume Cockpit', tcode: 'DB02', description: 'Inspect tablespace growth rates and data/log volume persistence allocation.' }
    ]
  },
  {
    questionId: 'Q4',
    questionText: 'Are any SAP instances or services down?',
    category: 'System Health',
    sapSourceTables: ['SM51', 'SMICM', 'SAPCONTROL', 'RZ04', 'MSCON'],
    summaryAnswer: 'All SAP S/4HANA instances and kernel services are 100% ONLINE. All 4 instances (PRD_D00, PRD_D01, PRD_D02, PRD_ASCS01), the standalone Enqueue Server 2 (ENQ2), ICM HTTP/HTTPS listeners (Ports 44300/8000), and SAP Web Dispatcher are fully operational.',
    keyInsights: [
      '4 of 4 SAP S/4HANA instances running (Uptime: 48 days, 14 hours).',
      'ASCS01 Message Server and Enqueue Server 2 active with zero failovers.',
      'ICM HTTP/HTTPS daemon active on all servers; SSL certificates valid for 312 days.'
    ],
    systemMetrics: [
      { label: 'Instance Availability', value: '4 / 4 (100%)', status: 'positive' },
      { label: 'ASCS / ENQ2 Status', value: 'ACTIVE', status: 'positive' },
      { label: 'ICM HTTP Handlers', value: 'RUNNING', status: 'positive' },
      { label: 'System Uptime', value: '48d 14h', status: 'positive' }
    ],
    breakdownData: [
      { category: 'PRD_D00 (PAS - Host prd-app-01)', value: 'ONLINE (Uptime: 48d)', detail: 'All 60 Work Processes active' },
      { category: 'PRD_D01 (AAS1 - Host prd-app-02)', value: 'ONLINE (Uptime: 48d)', detail: 'All 60 Work Processes active' },
      { category: 'PRD_D02 (AAS2 - Host prd-app-03)', value: 'ONLINE (Uptime: 48d)', detail: 'All 60 Work Processes active' },
      { category: 'PRD_ASCS01 (Message/Enqueue)', value: 'ONLINE (Active Replication)', detail: 'Enq Locks: 12, Enq Replicas: Synced' }
    ],
    recommendedSapActions: [
      { actionName: 'SAP System Overview', tcode: 'SM51', description: 'Check instance heartbeat, process counts, and communication status.' },
      { actionName: 'ICM Monitor', tcode: 'SMICM', description: 'Inspect active HTTP/HTTPS threads and external web service endpoint bindings.' }
    ]
  },
  {
    questionId: 'Q5',
    questionText: 'Which system has the highest response time?',
    category: 'System Health',
    sapSourceTables: ['ST03N', 'STAD', 'SM66', 'SM51'],
    summaryAnswer: 'In the production landscape, Application Server prd-app-03 (PRD_D02) has the highest average dialog response time at 542 ms (vs. 448 ms on PAS and 456 ms on AAS1), primarily driven by intensive Fiori Analytical CDS queries executed during afternoon reporting cycles.',
    keyInsights: [
      'PRD_D02: 542 ms avg dialog response (Wait time: 24 ms, DB time: 284 ms, Processing: 212 ms, Load: 22 ms).',
      'PRD_D00 (PAS): 448 ms avg dialog response time.',
      'PRD_D01 (AAS1): 456 ms avg dialog response time.',
      'SLA Target: <1000 ms (all application servers are well within the 1000 ms SLA boundary).'
    ],
    systemMetrics: [
      { label: 'Highest Instance Resp', value: '542 ms (PRD_D02)', status: 'positive' },
      { label: 'Landscape Avg Dialog', value: '482 ms', status: 'positive' },
      { label: 'Avg DB Request Time', value: '238 ms', status: 'positive' },
      { label: 'SLA Adherence (<1s)', value: '99.2%', status: 'positive' }
    ],
    breakdownData: [
      { category: 'PRD_D02 (AAS2)', value: '542 ms avg (Dialog)', variance: '+12.4%', detail: 'Heavy CDS View Fiori apps (C_PurchaseOrderFs)' },
      { category: 'PRD_D01 (AAS1)', value: '456 ms avg (Dialog)', variance: '-5.4%', detail: 'Standard SD / MM transactions (VA01, ME21N)' },
      { category: 'PRD_D00 (PAS)', value: '448 ms avg (Dialog)', variance: '-7.0%', detail: 'Standard FI / CO transactions (FB01, FBL1N)' }
    ],
    recommendedSapActions: [
      { actionName: 'Workload Analysis Cockpit', tcode: 'ST03N', description: 'Analyze response time breakdown (CPU, DB, Wait time) per instance and task type.' },
      { actionName: 'Business Transaction Analysis', tcode: 'STAD', description: 'Trace individual slow user transaction steps exceeding 1.5 seconds.' }
    ]
  },
  {
    questionId: 'Q6',
    questionText: 'Show the current number of active users.',
    category: 'System Health',
    sapSourceTables: ['AL08', 'SM04', 'USREFUS', 'USR41', 'ICM_USERS'],
    summaryAnswer: 'There are currently 486 active user sessions logged into S/4HANA PRD across all servers. 312 sessions are Fiori Launchpad / SAP GUI for HTML (HTTP), 142 sessions are classical SAP GUI for Windows (DIAG), and 32 are active RFC technical service connections.',
    keyInsights: [
      'Total 486 concurrent sessions (License ceiling: 1,200 named users - 40.5% capacity).',
      'Instance Distribution: PRD_D00 (158 users), PRD_D01 (164 users), PRD_D02 (164 users).',
      'Zero user connection lockouts or license pool exhaustion warnings in USMM.'
    ],
    systemMetrics: [
      { label: 'Total Active Users', value: '486 Sessions', status: 'positive' },
      { label: 'Fiori / Web Users', value: '312 Sessions', status: 'positive' },
      { label: 'SAP GUI Users', value: '142 Sessions', status: 'positive' },
      { label: 'Active RFC Sessions', value: '32 Sessions', status: 'positive' }
    ],
    breakdownData: [
      { category: 'PRD_D01 (AAS1)', value: '164 Users (33.7%)', detail: 'Fiori Web: 108, SAP GUI: 48, RFC: 8' },
      { category: 'PRD_D02 (AAS2)', value: '164 Users (33.7%)', detail: 'Fiori Web: 114, SAP GUI: 42, RFC: 8' },
      { category: 'PRD_D00 (PAS)', value: '158 Users (32.6%)', detail: 'Fiori Web: 90, SAP GUI: 52, RFC: 16' }
    ],
    recommendedSapActions: [
      { actionName: 'Global User Overview', tcode: 'AL08', description: 'Display all logged-on users, terminals, transactions, and session memory across the cluster.' },
      { actionName: 'Local User Monitor', tcode: 'SM04', description: 'Inspect memory consumption and active modes for local application server users.' }
    ]
  },
  {
    questionId: 'Q7',
    questionText: 'Which application server is overloaded?',
    category: 'System Health',
    sapSourceTables: ['SM51', 'ST06', 'SM50', 'SMLG', 'RZ12'],
    summaryAnswer: 'None of the application servers are currently overloaded. Application server prd-app-03 (PRD_D02) has the highest load index at 38/100, while prd-app-01 and prd-app-02 stand at 26/100 and 30/100 respectively. Logon load balancing (SMLG group SPACE) is distributing inbound user sessions evenly.',
    keyInsights: [
      'Load Index: prd-app-01 (26), prd-app-02 (30), prd-app-03 (38) - threshold for overload is 85.',
      'Dialog Work Process queue depth is 0 across all 3 application servers.',
      'SMLG logon group SPACE active with weighted response-time distribution.'
    ],
    systemMetrics: [
      { label: 'Highest Load Index', value: '38 / 100 (Safe)', status: 'positive' },
      { label: 'Dialog Queue Length', value: '0 in Queue', status: 'positive' },
      { label: 'SMLG Balancing', value: 'OPTIMAL', status: 'positive' },
      { label: 'Cluster Capacity', value: '68% Free', status: 'positive' }
    ],
    breakdownData: [
      { category: 'prd-app-01 (PAS)', value: 'Load: 26 / 100', variance: 'Balanced', detail: 'CPU: 22%, RAM: 48%, Active WP: 4/60' },
      { category: 'prd-app-02 (AAS1)', value: 'Load: 30 / 100', variance: 'Balanced', detail: 'CPU: 26%, RAM: 51%, Active WP: 5/60' },
      { category: 'prd-app-03 (AAS2)', value: 'Load: 38 / 100', variance: 'Balanced', detail: 'CPU: 31%, RAM: 55%, Active WP: 7/60' }
    ],
    recommendedSapActions: [
      { actionName: 'Logon Load Balancing', tcode: 'SMLG', description: 'Review dynamic response-time weights and server availability in logon groups.' },
      { actionName: 'RFC Server Groups', tcode: 'RZ12', description: 'Inspect parallel processing quotas and maximum task allocations per instance.' }
    ]
  },
  {
    questionId: 'Q8',
    questionText: 'Are there any enqueue or lock issues?',
    category: 'System Health',
    sapSourceTables: ['SM12', 'ENQ2_STAT', 'SM51', 'VBLCON'],
    summaryAnswer: 'There are currently 14 active lock entries in SM12 (normal daytime volume). Zero lock table overflow conditions (capacity: 14 / 500,000 entries - 0.003% utilized). No orphaned locks older than 2 hours detected; oldest lock belongs to an active sales order edit (VBAK table by user M_MUELLER, held for 4 minutes).',
    keyInsights: [
      '14 active lock entries (Tables: VBAK 4, EKKO 3, BKPF 4, MARC 3).',
      'Enqueue Server 2 memory utilization: 2.1 MB / 128 MB allocated (1.6%).',
      '0 lock collisions or lock escalation timeouts recorded in SM21 in the last 24 hours.'
    ],
    systemMetrics: [
      { label: 'Active Lock Entries', value: '14 Locks', status: 'positive' },
      { label: 'Lock Table Capacity', value: '0.003% Used', status: 'positive' },
      { label: 'Oldest Lock Age', value: '4 mins (Normal)', status: 'positive' },
      { label: 'Lock Collisions', value: '0 Collisions', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Table: VBAK (Sales Orders)', value: '4 Locks', detail: 'Held by Sales Reps (Orders: 1004512, 1004514, 1004518)' },
      { category: 'Table: BKPF (FI Documents)', value: '4 Locks', detail: 'Held by FI General Ledger posting sessions' },
      { category: 'Table: EKKO (Purchase Orders)', value: '3 Locks', detail: 'Held by Purchasing Buyer sessions' },
      { category: 'Table: MARC (Plant Data)', value: '3 Locks', detail: 'Held by Material Master changes (MM02)' }
    ],
    recommendedSapActions: [
      { actionName: 'Lock Entry Monitor', tcode: 'SM12', description: 'Inspect detailed lock arguments, lock types (Exclusive/Shared), and client session owners.' },
      { actionName: 'Enqueue Diagnostic Monitor', tcode: 'SMENQ', description: 'Verify Enqueue Server 2 replication status, lock rate velocity, and backup logs.' }
    ]
  },
  {
    questionId: 'Q9',
    questionText: 'Show the top five technical problems affecting users.',
    category: 'System Health',
    sapSourceTables: ['ST22', 'SM21', 'SM13', 'SM58', 'SM50'],
    summaryAnswer: 'The top 5 technical issues currently logged across PRD are: 1) Intermittent timeout on external carrier RFC CARRIER_DHL_REST (12 timeouts), 2) Repeated custom code dump TSV_TNEW_PAGE_ALLOC_FAILED in Z_PROD_COST_RECON (3 occurrences), 3) 2 V2 update requests in SM13 with error status, 4) 8 queued tRFCs in SM58 awaiting partner retry, and 5) Tablespace PSAPSR3 warning at 82% allocation.',
    keyInsights: [
      '1. RFC CARRIER_DHL_REST: External REST gateway latency causing 30s timeout in SD shipping.',
      '2. ABAP Dump TSV_TNEW_PAGE_ALLOC_FAILED: Unbounded internal table in Z_PROD_COST_RECON.',
      '3. SM13 V2 Updates: 2 failed entries for statistical update MCEX03 (EWM extraction).',
      '4. SM58 tRFC: 8 entries with status CPIC_ERROR for legacy CRM interface.',
      '5. DB Storage: PSAPSR3 autoextend enabled, next extent safe for 45 days.'
    ],
    systemMetrics: [
      { label: 'Critical Errors', value: '2 Issues', status: 'warning' },
      { label: 'Medium Errors', value: '3 Issues', status: 'neutral' },
      { label: 'Failed V2 Updates', value: '2 Updates', status: 'warning' },
      { label: 'tRFC Retries', value: '8 Queued', status: 'neutral' }
    ],
    breakdownData: [
      { category: '1. External Carrier RFC Timeout', value: '12 Timeouts', variance: 'Carrier Side', detail: 'Destination: CARRIER_DHL_REST (HTTP 504)' },
      { category: '2. TSV_TNEW_PAGE_ALLOC Dump', value: '3 Dumps', variance: 'Custom ABAP', detail: 'Program: Z_PROD_COST_RECON (Needs package size)' },
      { category: '3. Failed V2 Update Records', value: '2 Failed', variance: 'EWM MCEX03', detail: 'SM13 Error: Update error in MCEX03' },
      { category: '4. SM58 Stuck tRFC Records', value: '8 Queued', variance: 'CRM Gateway', detail: 'Status: CPIC_ERROR (Partner not listening)' },
      { category: '5. PSAPSR3 Tablespace Warning', value: '82% Full', variance: 'DB Storage', detail: 'Auto-extend enabled; 45 days headroom' }
    ],
    recommendedSapActions: [
      { actionName: 'Update Request Manager', tcode: 'SM13', description: 'Analyze and reprocess the 2 failed V2 statistical update records.' },
      { actionName: 'Transactional RFC Monitor', tcode: 'SM58', description: 'Inspect error codes and execute immediate background re-send for stuck tRFCs.' }
    ]
  },
  {
    questionId: 'Q10',
    questionText: 'What should the Basis team fix first today?',
    category: 'System Health',
    sapSourceTables: ['SM13', 'ST22', 'SM21', 'SM58', 'RZ20'],
    summaryAnswer: 'HIGHEST PRIORITY: The Basis team must immediately reprocess the 2 failed V2 update records in SM13 (MCEX03 extraction for EWM logistics data) to prevent sales order analytics delay, followed by notifying developer team for Z_PROD_COST_RECON memory tuning (ST22 dump).',
    keyInsights: [
      'Priority 1 (Urgent): Reprocess 2 failed SM13 V2 update records to synchronize EWM inventory analytics.',
      'Priority 2 (High): Remediate memory leak in custom report Z_PROD_COST_RECON (TSV_TNEW_PAGE_ALLOC_FAILED).',
      'Priority 3 (Medium): Clear 8 stuck tRFC entries in SM58 for CRM partner connection.',
      'Priority 4 (Low): Add 50 GB data file to PSAPSR3 tablespace in DB02.'
    ],
    systemMetrics: [
      { label: 'Immediate Action Items', value: '1 Urgent Fix', status: 'warning' },
      { label: 'Reprocessable Records', value: '2 in SM13', status: 'warning' },
      { label: 'Priority Level', value: 'P1 - S/4 Data Sync', status: 'warning' },
      { label: 'Estimated Fix Time', value: '5 Minutes', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Action 1: Reprocess SM13 V2 Updates', value: 'P1 - Immediate', detail: 'T-code SM13 -> Select Error -> Execute Repeat Update' },
      { category: 'Action 2: Z_PROD_COST_RECON Fix', value: 'P2 - 2 Hours', detail: 'Add PACKAGE SIZE 5000 to SELECT loop in SE38' },
      { category: 'Action 3: Retrigger SM58 tRFCs', value: 'P3 - 30 Mins', detail: 'Execute function RSARFCEX to re-dispatch queue' },
      { category: 'Action 4: Expand Tablespace DB02', value: 'P4 - Tonight', detail: 'Alter tablespace PSAPSR3 add datafile 50G' }
    ],
    recommendedSapActions: [
      { actionName: 'SM13 V2 Update Reprocessing', tcode: 'SM13', description: 'Autonomous re-execution of failed V2 updates after data lock verification.' },
      { actionName: 'tRFC Dispatcher', tcode: 'SM58', description: 'Run RSARFCEX report to flush queued transactional RFCs to partner systems.' }
    ]
  },

  // =========================================================================
  // PILLAR 2: BACKGROUND JOBS (Q11 - Q20)
  // =========================================================================
  {
    questionId: 'Q11',
    questionText: 'Which jobs failed overnight?',
    category: 'Background Jobs',
    sapSourceTables: ['TBTCO', 'TBTCP', 'SM37', 'ST22', 'SM21'],
    summaryAnswer: 'Overnight batch schedule executed 342 background jobs; 340 completed successfully (99.4% success rate). Exactly 2 jobs failed: 1) Z_MONTH_END_ACCRUAL (JobCount 22041500) failed at 02:14 UTC with DYNPRO_SEND_IN_BATCH dump, and 2) Z_EWM_AUTO_REPLENISH (JobCount 22050100) failed at 03:45 UTC due to lock timeout on table /SCWM/QUAN.',
    keyInsights: [
      '340 out of 342 background jobs completed successfully (99.4% SLA adherence).',
      'Job 1: Z_MONTH_END_ACCRUAL failed because a POPUP dialog was called during background execution.',
      'Job 2: Z_EWM_AUTO_REPLENISH failed due to concurrent physical inventory lock on Storage Type 0020.'
    ],
    systemMetrics: [
      { label: 'Total Overnight Jobs', value: '342 Jobs', status: 'positive' },
      { label: 'Successful Jobs', value: '340 (99.4%)', status: 'positive' },
      { label: 'Failed Jobs', value: '2 Failed', status: 'warning' },
      { label: 'Avg Batch Runtime', value: '4m 12s', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Z_MONTH_END_ACCRUAL (02:14 UTC)', value: 'Canceled', variance: 'ABAP Error', detail: 'Dump: DYNPRO_SEND_IN_BATCH in program Z_FI_ACCRUAL_CALC' },
      { category: 'Z_EWM_AUTO_REPLENISH (03:45 UTC)', value: 'Canceled', variance: 'Lock Timeout', detail: 'Resource /SCWM/QUAN locked by user WAREHOUSE_MGR' }
    ],
    recommendedSapActions: [
      { actionName: 'Background Job Cockpit', tcode: 'SM37', description: 'Review job logs, spool output, and step parameters for the 2 failed jobs.' },
      { actionName: 'ABAP Dump Analysis', tcode: 'ST22', description: 'Inspect exact line number and call stack for DYNPRO_SEND_IN_BATCH dump.' }
    ]
  },
  {
    questionId: 'Q12',
    questionText: 'Why did job Z_MONTH_END fail?',
    category: 'Background Jobs',
    sapSourceTables: ['TBTCO', 'TBTCP', 'ST22', 'D010SINF', 'SM37'],
    summaryAnswer: 'Job Z_MONTH_END (Program Z_FI_ACCRUAL_CALC, Step 1) failed at 02:14:18 UTC with short dump DYNPRO_SEND_IN_BATCH. The custom code called function module POPUP_TO_CONFIRM on line 142 when encountering an unbalanced cost center variance, which is invalid in background batch mode (SY-BATCH = X).',
    keyInsights: [
      'Root Cause: Interactive screen popup called inside background task without IF sy-batch = SPACE check.',
      'Program: Z_FI_ACCRUAL_CALC line 142 (CALL FUNCTION POPUP_TO_CONFIRM).',
      'Remediation: Developer applied note to log warning to application log (SLG1) instead of popup; job is safe to restart with variant NIGHT_AUTO.'
    ],
    systemMetrics: [
      { label: 'Termination Reason', value: 'DYNPRO_SEND_IN_BATCH', status: 'negative' },
      { label: 'Failing Program', value: 'Z_FI_ACCRUAL_CALC', status: 'warning' },
      { label: 'Failing Line', value: 'Line 142', status: 'neutral' },
      { label: 'Safe to Restart', value: 'YES (with fix)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Job Name / Number', value: 'Z_MONTH_END / 22041500', detail: 'Scheduled by FINANCE_BATCH' },
      { category: 'Error Message', value: 'Screen output without connection to user', detail: 'SY-BATCH was active' },
      { category: 'Affected Company Code', value: '1000 / 1010', detail: 'Cost center accrual posting blocked' }
    ],
    recommendedSapActions: [
      { actionName: 'Display Job Log', tcode: 'SM37', description: 'Inspect job log messages and spool generation prior to termination.' },
      { actionName: 'ABAP Editor Remediation', tcode: 'SE38', description: 'Wrap screen call in IF sy-batch IS INITIAL condition in Z_FI_ACCRUAL_CALC.' }
    ]
  },
  {
    questionId: 'Q13',
    questionText: 'Show long-running background jobs.',
    category: 'Background Jobs',
    sapSourceTables: ['TBTCO', 'SM37', 'SM50', 'SM66', 'DB02'],
    summaryAnswer: 'There are currently 4 active background jobs across the cluster. 1 job is classified as long-running: SAP_REORG_SPOOL (JobCount 22061000) has been executing for 2 hours 18 minutes on instance PRD_D01 deleting orphaned spool requests older than 30 days. All other jobs are under 25 minutes.',
    keyInsights: [
      'SAP_REORG_SPOOL: Running for 2h 18m on PRD_D01 (BTC WP 12) - processing 480,000 legacy spools.',
      'Z_MRP_LIVE_GLOBAL: Running for 22m on PRD_D02 (HANA optimized MRP run, progressing normally).',
      'No background jobs are stuck in deadlock or CPU looping state.'
    ],
    systemMetrics: [
      { label: 'Active BTC Jobs', value: '4 Running', status: 'positive' },
      { label: 'Long-Running (>1h)', value: '1 Job', status: 'neutral' },
      { label: 'Spool Reorg Runtime', value: '2h 18m', status: 'neutral' },
      { label: 'BTC Work Processes', value: '54 / 60 Free', status: 'positive' }
    ],
    breakdownData: [
      { category: 'SAP_REORG_SPOOL', value: '2h 18m (Running)', variance: 'Spool Clean', detail: 'Host: prd-app-02 (AAS1), BTC WP 12, Prog: RSPO1041' },
      { category: 'Z_MRP_LIVE_GLOBAL', value: '22m (Running)', variance: 'MRP Run', detail: 'Host: prd-app-03 (AAS2), BTC WP 04, Prog: RMMRP000' },
      { category: 'Z_SD_ORDER_EXTRACT', value: '14m (Running)', variance: 'SD Export', detail: 'Host: prd-app-01 (PAS), BTC WP 08, Prog: Z_SD_EXTRACT' },
      { category: 'SAP_CCMS_MONI_BATCH', value: '4m (Running)', variance: 'CCMS', detail: 'Host: prd-app-01 (PAS), BTC WP 01, Prog: RSAL_BATCH' }
    ],
    recommendedSapActions: [
      { actionName: 'Global Work Process Monitor', tcode: 'SM66', description: 'Verify CPU seconds and database read activity on BTC work process 12.' },
      { actionName: 'Spool Administration', tcode: 'SPAD', description: 'Check total spool request retention numbers in tables TSP01 and TSP02.' }
    ]
  },
  {
    questionId: 'Q14',
    questionText: 'Which jobs are delayed?',
    category: 'Background Jobs',
    sapSourceTables: ['TBTCO', 'SM37', 'RZ12', 'SM50'],
    summaryAnswer: 'Only 1 job is currently delayed past its scheduled release time: Z_FIN_GL_RECON was scheduled for 14:00 UTC (delayed by 34 minutes) because it requires target server group BATCH_FINANCE, which was constrained while MRP ran. It is queued and scheduled to dispatch on the next available BTC slot in 2 minutes.',
    keyInsights: [
      '1 delayed job out of 84 scheduled jobs for the current hour window.',
      'Z_FIN_GL_RECON delayed by 34 minutes due to temporary BTC server group saturation.',
      'No jobs are delayed due to missing authorizations or missing events.'
    ],
    systemMetrics: [
      { label: 'Total Delayed Jobs', value: '1 Job', status: 'neutral' },
      { label: 'Max Delay Duration', value: '34 Minutes', status: 'neutral' },
      { label: 'Available BTC Slots', value: '54 Available', status: 'positive' },
      { label: 'Schedule Precision', value: '98.8%', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Z_FIN_GL_RECON', value: 'Delayed 34m', detail: 'Target Group: BATCH_FINANCE, Planned: 14:00 UTC, Status: Ready' }
    ],
    recommendedSapActions: [
      { actionName: 'Job Schedule Overview', tcode: 'SM37', description: 'Review start conditions and release delayed jobs immediately.' },
      { actionName: 'RFC Server Groups', tcode: 'RZ12', description: 'Increase available BTC quota for BATCH_FINANCE server group.' }
    ]
  },
  {
    questionId: 'Q15',
    questionText: 'Which critical jobs did not start?',
    category: 'Background Jobs',
    sapSourceTables: ['TBTCO', 'TBTCP', 'SM37', 'SM62', 'SM64'],
    summaryAnswer: 'All mandatory daily and hourly critical production jobs (SAP_COLLECTOR_FOR_PERFMONITOR, SAP_REORG_JOBS, Z_EWM_WAVE_DISPATCH, Z_SD_ATP_REFRESH) started on schedule. 0 critical jobs were skipped or failed to trigger.',
    keyInsights: [
      '0 critical batch jobs failed to start.',
      'All time-dependent and event-driven triggers (SM64 events) fired successfully.',
      'Job scheduler daemon active on PAS with 10-second polling cadence.'
    ],
    systemMetrics: [
      { label: 'Missing Critical Jobs', value: '0 Missing', status: 'positive' },
      { label: 'Event Triggers Fired', value: '100%', status: 'positive' },
      { label: 'Time Schedule Match', value: '100%', status: 'positive' },
      { label: 'Scheduler Status', value: 'ACTIVE', status: 'positive' }
    ],
    breakdownData: [
      { category: 'SAP_COLLECTOR_FOR_PERFMONITOR', value: 'Started & Completed', detail: 'Ran every hour on the hour' },
      { category: 'Z_EWM_WAVE_DISPATCH', value: 'Started & Completed', detail: 'Ran at 14:00 UTC (Next run: 15:00 UTC)' },
      { category: 'Z_SD_ATP_REFRESH', value: 'Started & Completed', detail: 'Ran at 13:30 UTC' }
    ],
    recommendedSapActions: [
      { actionName: 'Event History Monitor', tcode: 'SM62', description: 'Inspect background event history and background trigger raised status.' },
      { actionName: 'Job Definition Cockpit', tcode: 'SM36', description: 'Review periodic frequency and start condition parameters for critical jobs.' }
    ]
  },
  {
    questionId: 'Q16',
    questionText: 'Which jobs are exceeding their normal runtime?',
    category: 'Background Jobs',
    sapSourceTables: ['TBTCO', 'ST03N', 'SM37', 'SM66'],
    summaryAnswer: 'Job SAP_REORG_SPOOL is currently exceeding its historical 7-day average runtime by +42% (Current runtime: 2h 18m vs. historical avg: 1h 37m) due to an accumulation of 180,000 temporary batch logs generated by weekend data migration testing.',
    keyInsights: [
      'SAP_REORG_SPOOL runtime variance: +42% over baseline due to 180,000 extra spool records.',
      'All other active background jobs are running within +/- 10% of their 30-day baseline duration.',
      'No jobs are blocked on database locks or network socket timeouts.'
    ],
    systemMetrics: [
      { label: 'Jobs Exceeding Runtime', value: '1 Job', status: 'neutral' },
      { label: 'Max Variance', value: '+42% (Spool Reorg)', status: 'neutral' },
      { label: 'SLA Risk', value: 'LOW (Maintenance)', status: 'positive' },
      { label: 'DB Wait Time', value: '3.2 ms avg', status: 'positive' }
    ],
    breakdownData: [
      { category: 'SAP_REORG_SPOOL', value: '2h 18m (Avg: 1h 37m)', variance: '+42%', detail: 'Spool deletion volume higher due to migration logs' },
      { category: 'Z_MRP_LIVE_GLOBAL', value: '22m (Avg: 24m)', variance: '-8%', detail: 'HANA query execution optimal' }
    ],
    recommendedSapActions: [
      { actionName: 'Work Process Activity', tcode: 'SM50', description: 'Check database row access rate on BTC work process executing SAP_REORG_SPOOL.' },
      { actionName: 'Spool Retention Parameters', tcode: 'SPAD', description: 'Adjust default spool retention expiration from 30 days to 14 days.' }
    ]
  },
  {
    questionId: 'Q17',
    questionText: 'Show jobs scheduled for tonight.',
    category: 'Background Jobs',
    sapSourceTables: ['TBTCO', 'TBTCP', 'SM37', 'SM36'],
    summaryAnswer: 'There are 128 background jobs scheduled to execute between 20:00 UTC tonight and 06:00 UTC tomorrow. Major execution windows include: 1) Financial Accrual Postings (22:00 UTC - 18 jobs), 2) Global MRP Run (00:30 UTC - 6 jobs), 3) Full DB Backup & Log Archive (02:00 UTC), and 4) Daily BW Data Extraction (03:30 UTC - 42 jobs).',
    keyInsights: [
      '128 batch jobs queued for overnight batch window.',
      'Peak concurrency window: 02:00 - 03:30 UTC (estimated 14 BTC work processes utilized simultaneously).',
      'Server capacity of 60 BTC work processes provides 76% headroom during peak batch window.'
    ],
    systemMetrics: [
      { label: 'Total Scheduled Tonight', value: '128 Jobs', status: 'positive' },
      { label: 'Peak Concurrency', value: '14 / 60 BTC WP', status: 'positive' },
      { label: 'Peak Batch Window', value: '02:00 - 03:30 UTC', status: 'positive' },
      { label: 'Overnight Headroom', value: '76% Free', status: 'positive' }
    ],
    breakdownData: [
      { category: '20:00 - 22:00 UTC', value: '28 Jobs', detail: 'Billing Document Output & EDI 850/810 transmissions' },
      { category: '22:00 - 00:00 UTC', value: '34 Jobs', detail: 'Financial G/L settlement & CO-PA cost allocations' },
      { category: '00:00 - 03:00 UTC', value: '42 Jobs', detail: 'Global MRP Live (RMMRP000) & HANA Primary Storage Backup' },
      { category: '03:00 - 06:00 UTC', value: '24 Jobs', detail: 'BW/4HANA extractor delta loads & physical inventory recalculation' }
    ],
    recommendedSapActions: [
      { actionName: 'Background Job Schedule', tcode: 'SM37', description: 'Filter scheduled jobs with status READY and RELEASED for tonight.' },
      { actionName: 'Batch Server Group Allocation', tcode: 'SM61', description: 'Verify all background server groups have adequate server quotas.' }
    ]
  },
  {
    questionId: 'Q18',
    questionText: 'Which failed jobs can safely be restarted?',
    category: 'Background Jobs',
    sapSourceTables: ['TBTCO', 'TBTCP', 'ST22', 'SM37'],
    summaryAnswer: 'Of the 2 overnight failed jobs, Z_EWM_AUTO_REPLENISH is 100% SAFE to restart immediately as the conflicting storage bin lock has cleared. Z_MONTH_END_ACCRUAL should ONLY be restarted using variant NIGHT_AUTO (which suppresses interactive popups) to avoid re-triggering dump DYNPRO_SEND_IN_BATCH.',
    keyInsights: [
      'Z_EWM_AUTO_REPLENISH: Lock on /SCWM/QUAN released at 04:12 UTC; safe to restart without code change.',
      'Z_MONTH_END_ACCRUAL: Safe to restart ONLY after specifying variant NIGHT_AUTO.'
    ],
    systemMetrics: [
      { label: 'Failed Jobs Assessed', value: '2 Jobs', status: 'neutral' },
      { label: 'Safe to Restart Now', value: '1 Job (EWM)', status: 'positive' },
      { label: 'Restart with Variant', value: '1 Job (FI)', status: 'warning' },
      { label: 'Unrecoverable Jobs', value: '0 Jobs', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Z_EWM_AUTO_REPLENISH', value: 'SAFE - Immediate Restart', detail: 'Conflicting storage bin lock is cleared' },
      { category: 'Z_MONTH_END_ACCRUAL', value: 'CONDITIONAL - Use NIGHT_AUTO', detail: 'Variant NIGHT_AUTO bypasses screen popup' }
    ],
    recommendedSapActions: [
      { actionName: 'Restart Job with Pattern', tcode: 'SM37', description: 'Copy canceled job Z_EWM_AUTO_REPLENISH and release immediately.' },
      { actionName: 'Job Variant Selection', tcode: 'SE38', description: 'Verify variant NIGHT_AUTO parameters in report Z_FI_ACCRUAL_CALC.' }
    ]
  },
  {
    questionId: 'Q19',
    questionText: 'Restart this failed job after validation.',
    category: 'Background Jobs',
    sapSourceTables: ['TBTCO', 'TBTCP', 'SM37', 'ENQ2_STAT'],
    summaryAnswer: 'Autonomous Validation Check PASSED: Validated table locks, authorizations, and target server availability for job Z_EWM_AUTO_REPLENISH. Job was successfully copied as Z_EWM_AUTO_REPLENISH_RERUN (JobCount 22071800) and released on server group BATCH_LOGISTICS.',
    keyInsights: [
      'Pre-restart Validation: Lock check on /SCWM/QUAN verified (0 locks active).',
      'Target Server: PRD_D01 (AAS1) selected based on lowest BTC load index.',
      'Status: Job released and currently executing Step 1 (18 replenishment tasks created).'
    ],
    systemMetrics: [
      { label: 'Validation Status', value: 'PASSED (100%)', status: 'positive' },
      { label: 'New Job ID', value: '22071800', status: 'positive' },
      { label: 'Execution Status', value: 'RUNNING', status: 'positive' },
      { label: 'Target Server', value: 'PRD_D01', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Pre-flight Lock Validation', value: 'OK (0 Locks on /SCWM/QUAN)', detail: 'Verified via SM12' },
      { category: 'Authorization Check', value: 'OK (User EWM_BATCH)', detail: 'All S_BTCH_JOB authorizations valid' },
      { category: 'Dispatched Job Count', value: '22071800', detail: 'Started on PRD_D01 at 14:48 UTC' }
    ],
    recommendedSapActions: [
      { actionName: 'Monitor Active Job', tcode: 'SM37', description: 'Track progress of newly dispatched job Z_EWM_AUTO_REPLENISH_RERUN.' },
      { actionName: 'Spool Output Verification', tcode: 'SP01', description: 'Inspect generated replenishment transfer orders upon completion.' }
    ]
  },
  {
    questionId: 'Q20',
    questionText: 'Predict which jobs are likely to miss their SLA.',
    category: 'Background Jobs',
    sapSourceTables: ['TBTCO', 'ST03N', 'SM37', 'SM66'],
    summaryAnswer: 'Predictive batch analysis indicates LOW overall SLA risk (<2%). The only job with moderate risk is tonight\'s Global MRP Live run (Z_MRP_LIVE_GLOBAL scheduled at 00:30 UTC): if daytime material change volume exceeds 150,000 items, runtime is projected at 58 minutes against its 60-minute SLA window.',
    keyInsights: [
      'Z_MRP_LIVE_GLOBAL: Projected runtime 58 mins (SLA: 60 mins) based on current plant change pointers in BD21.',
      'All financial closing batch jobs projected to complete 45 minutes ahead of 04:00 UTC business deadline.',
      'Recommendation: Pre-allocate 4 additional parallel HANA threads for MRP execution.'
    ],
    systemMetrics: [
      { label: 'Overall SLA Risk', value: 'LOW (1.8%)', status: 'positive' },
      { label: 'Highest Risk Job', value: 'Z_MRP_LIVE_GLOBAL', status: 'neutral' },
      { label: 'Projected Duration', value: '58m / 60m SLA', status: 'neutral' },
      { label: 'Recommended Action', value: '+4 Parallel Threads', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Z_MRP_LIVE_GLOBAL (00:30 UTC)', value: 'Risk: Moderate (58m / 60m)', detail: 'Material delta pointers: 142,000 items' },
      { category: 'Z_BW_DELTA_EXTRACT (03:30 UTC)', value: 'Risk: Low (32m / 90m)', detail: 'Delta volume within standard range' },
      { category: 'Z_FI_CLOSE_POSTING (22:00 UTC)', value: 'Risk: Low (18m / 60m)', detail: 'Journal entry volume normal' }
    ],
    recommendedSapActions: [
      { actionName: 'Parallel Processing Tuning', tcode: 'RZ12', description: 'Assign 8 work processes to MRP_SERVER_GROUP to reduce projected runtime to 34 minutes.' },
      { actionName: 'MRP Execution Parameters', tcode: 'MD01N', description: 'Verify HANA database optimization flags in MRP Live parameters.' }
    ]
  },

  // =========================================================================
  // PILLAR 3: DUMPS, LOGS, AND RUNTIME ERRORS (Q21 - Q30)
  // =========================================================================
  {
    questionId: 'Q21',
    questionText: "Show today's ST22 dumps.",
    category: 'Dumps, Logs, and Runtime Errors',
    sapSourceTables: ['SNAP', 'SNAPT', 'ST22', 'SM21'],
    summaryAnswer: 'A total of 6 ABAP short dumps occurred in PRD today across all instances. 3 dumps are TSV_TNEW_PAGE_ALLOC_FAILED (in custom program Z_PROD_COST_RECON), 1 dump is DYNPRO_SEND_IN_BATCH (in Z_MONTH_END_ACCRUAL), 1 dump is TIME_OUT (in QA extraction test), and 1 is COMPUTE_INT_ZERODIVIDE (in custom pricing routine 902).',
    keyInsights: [
      '6 short dumps total recorded in SNAP table today (compared to 14-day daily average of 8).',
      '50% of today\'s dumps (3) originate from a single custom report: Z_PROD_COST_RECON.',
      '0 standard SAP kernel or database-level short dumps detected.'
    ],
    systemMetrics: [
      { label: 'Total ST22 Dumps Today', value: '6 Dumps', status: 'neutral' },
      { label: 'Custom Code Dumps', value: '5 / 6 (83%)', status: 'neutral' },
      { label: 'Standard SAP Dumps', value: '1 / 6 (17%)', status: 'positive' },
      { label: 'System Stability Index', value: '99.1%', status: 'positive' }
    ],
    breakdownData: [
      { category: 'TSV_TNEW_PAGE_ALLOC_FAILED (3x)', value: 'Program: Z_PROD_COST_RECON', detail: 'User: CONTROLLER_02, Host: prd-app-03' },
      { category: 'DYNPRO_SEND_IN_BATCH (1x)', value: 'Program: Z_FI_ACCRUAL_CALC', detail: 'User: FINANCE_BATCH, Host: prd-app-01' },
      { category: 'COMPUTE_INT_ZERODIVIDE (1x)', value: 'Program: RV61AFZA (Routine 902)', detail: 'User: SALES_REP_11, Host: prd-app-02' },
      { category: 'TIME_OUT (1x)', value: 'Program: SAPLSD_EXPORT', detail: 'User: BATCH_EXTRACT, Host: prd-app-02' }
    ],
    recommendedSapActions: [
      { actionName: 'ABAP Dump Analysis', tcode: 'ST22', description: 'Review call hierarchy, source code location, and system variables for all 6 dumps.' },
      { actionName: 'Custom Code Quality Inspector', tcode: 'SCI', description: 'Execute ABAP Code Inspector check on Z_PROD_COST_RECON for memory allocation flaws.' }
    ]
  },
  {
    questionId: 'Q22',
    questionText: 'Which ABAP dumps are occurring repeatedly?',
    category: 'Dumps, Logs, and Runtime Errors',
    sapSourceTables: ['SNAP', 'ST22', 'ST03N'],
    summaryAnswer: 'The only repeating dump pattern is TSV_TNEW_PAGE_ALLOC_FAILED in custom program Z_PROD_COST_RECON, which has occurred 3 times today and 11 times over the past 7 days whenever users execute cost center variance analysis for the entire fiscal year without filtering by plant.',
    keyInsights: [
      'Repeating Dump: TSV_TNEW_PAGE_ALLOC_FAILED (11 occurrences in 7 days).',
      'Root Cause: Internal table IT_COEP expands beyond user roll area limit (4 GB) during full-table SELECT without WHERE plant constraint.',
      'Permanent Solution: Implement paging / cursor pagination or enforce mandatory selection screen filters for Plant and Cost Center Group.'
    ],
    systemMetrics: [
      { label: 'Repeating Dump', value: 'TSV_TNEW_PAGE_ALLOC', status: 'warning' },
      { label: '7-Day Frequency', value: '11 Occurrences', status: 'warning' },
      { label: 'Memory Allocated', value: '> 4,096 MB', status: 'negative' },
      { label: 'Fix Priority', value: 'HIGH', status: 'warning' }
    ],
    breakdownData: [
      { category: 'Today (3 occurrences)', value: '09:14, 11:22, 13:45 UTC', detail: 'Triggered by user CONTROLLER_02 and CONTROLLER_04' },
      { category: 'Yesterday (2 occurrences)', value: '10:05, 15:30 UTC', detail: 'Triggered by user FINANCE_MGR' },
      { category: 'Past 5 Days (6 occurrences)', value: 'Daily recurring', detail: 'All on table COEP extract' }
    ],
    recommendedSapActions: [
      { actionName: 'ABAP Dump Display', tcode: 'ST22', description: 'Filter by runtime error TSV_TNEW_PAGE_ALLOC_FAILED to see full memory dump.' },
      { actionName: 'ABAP Workbench Optimization', tcode: 'SE38', description: 'Add PACKAGE SIZE 5000 and mandatory plant parameter in Z_PROD_COST_RECON.' }
    ]
  },
  {
    questionId: 'Q23',
    questionText: 'Explain this ST22 dump in plain English.',
    category: 'Dumps, Logs, and Runtime Errors',
    sapSourceTables: ['SNAP', 'SNAPT', 'ST22', 'TRDIR'],
    summaryAnswer: 'DUMP EXPLANATION: The dump "TSV_TNEW_PAGE_ALLOC_FAILED" means the SAP application server ran out of memory space allocated to that specific user session. The report tried to load millions of cost accounting line items into memory all at once instead of processing them in small batches, crashing the session when it hit the 4 GB safety limit.',
    keyInsights: [
      'What happened: The program attempted to store too much data in RAM at one time.',
      'Why it happened: The database query had no date or plant filters, fetching 12.4 million rows into a single table.',
      'Impact: The user\'s screen closed abruptly, but no database records were corrupted or lost.',
      'How to prevent: Update the code to read data in chunks of 5,000 records at a time.'
    ],
    systemMetrics: [
      { label: 'Error Category', value: 'Resource Exhaustion', status: 'warning' },
      { label: 'Data Loss Risk', value: 'ZERO (Rollback OK)', status: 'positive' },
      { label: 'User Impact', value: 'Session Terminated', status: 'neutral' },
      { label: 'Resolution Complexity', value: 'Low (Code Tuning)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Technical Error Code', value: 'TSV_TNEW_PAGE_ALLOC_FAILED', detail: 'Memory management subsystem' },
      { category: 'Program Name', value: 'Z_PROD_COST_RECON', detail: 'Include: Z_PROD_COST_RECON_F01, Line: 88' },
      { category: 'Session Memory at Crash', value: '4,091 MB / 4,096 MB Max', detail: 'Hit ztta/roll_extension parameter ceiling' }
    ],
    recommendedSapActions: [
      { actionName: 'Memory Parameters Check', tcode: 'RZ11', description: 'Inspect profile parameters ztta/roll_extension and abap/heap_area_dia.' },
      { actionName: 'Source Code Correction', tcode: 'SE38', description: 'Refactor internal table handling to use SELECT ... ENDSELECT with PACKAGE SIZE.' }
    ]
  },
  {
    questionId: 'Q24',
    questionText: 'Show critical SM21 system log errors.',
    category: 'Dumps, Logs, and Runtime Errors',
    sapSourceTables: ['SM21', 'OS01', 'SM51'],
    summaryAnswer: 'In the last 4 hours across all instances, SM21 logged 14 total entries. 0 entries are high-severity kernel or database aborts. 3 entries are flagged as Warning: 1) "RFC error during communication with CARRIER_DHL_REST (HTTP 504 Gateway Timeout)", 2) "Lock entry for table VBAK deleted due to session termination", and 3) "Spool request 481023 temporary file write delayed".',
    keyInsights: [
      '0 critical database, operating system, or kernel crash entries in SM21.',
      '3 warning events relating to external RFC latency and normal session lock cleanup.',
      'System log daemon running normally on all 4 instances with zero missed log blocks.'
    ],
    systemMetrics: [
      { label: 'Critical SM21 Errors', value: '0 Critical', status: 'positive' },
      { label: 'Warning Log Entries', value: '3 Warnings', status: 'neutral' },
      { label: 'Informational Logs', value: '11 Entries', status: 'positive' },
      { label: 'Syslog Integrity', value: '100%', status: 'positive' }
    ],
    breakdownData: [
      { category: '13:48:12 UTC (PRD_D01)', value: 'Warning: RFC Timeout', detail: 'Destination CARRIER_DHL_REST failed after 30s timeout' },
      { category: '13:45:02 UTC (PRD_D03)', value: 'Warning: Lock Deleted', detail: 'Lock on VBAK cleaned up after TSV_TNEW_PAGE_ALLOC dump' },
      { category: '12:15:33 UTC (PRD_D02)', value: 'Warning: Spool File Delayed', detail: 'Temporary I/O delay on /usr/sap/PRD/D02/data (resolved in 2s)' }
    ],
    recommendedSapActions: [
      { actionName: 'System Log Filter', tcode: 'SM21', description: 'View real-time consolidated system logs across all instances.' },
      { actionName: 'RFC Destination Health', tcode: 'SM59', description: 'Test connection and response time for CARRIER_DHL_REST.' }
    ]
  },
  {
    questionId: 'Q25',
    questionText: 'Which errors started after the latest transport?',
    category: 'Dumps, Logs, and Runtime Errors',
    sapSourceTables: ['E070', 'E071', 'SNAP', 'ST22', 'SM21', 'STMS'],
    summaryAnswer: 'Transport S4DK904812 ("SD Pricing Routine 902 Enhancement") was imported at 11:30 UTC today. Post-transport analysis detected 1 new short dump: COMPUTE_INT_ZERODIVIDE in program RV61AFZA (Routine 902) occurred at 11:42 UTC when sales order lines with quantity = 0 were processed.',
    keyInsights: [
      'Transport S4DK904812 imported at 11:30 UTC by BASIS_ADMIN (Return Code: 0000 - Success).',
      'New Error: COMPUTE_INT_ZERODIVIDE in Routine 902 triggered 12 minutes after import.',
      'Root Cause: Missing IF KOMP-MGAME > 0 check before price divisor calculation.',
      'Rollback / Patch: Developer transport S4DK904815 prepared with zero-division validation.'
    ],
    systemMetrics: [
      { label: 'Latest Transport', value: 'S4DK904812', status: 'neutral' },
      { label: 'Import Time', value: '11:30 UTC Today', status: 'positive' },
      { label: 'Post-Import Dumps', value: '1 New Dump', status: 'warning' },
      { label: 'Remediation Transport', value: 'S4DK904815 (Ready)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Transport Request', value: 'S4DK904812 (SD Pricing 902)', detail: 'Objects: VOFM Formula 902, Table T685A' },
      { category: 'Correlated Dump', value: 'COMPUTE_INT_ZERODIVIDE (11:42 UTC)', detail: 'Include RV61AFZA, Line 412 (Div by zero on zero-qty line)' },
      { category: 'Affected Transaction', value: 'VA01 / VA02', detail: 'Sales order pricing calculation' }
    ],
    recommendedSapActions: [
      { actionName: 'Transport Management System', tcode: 'STMS', description: 'Inspect transport import logs and return codes in the PRD import queue.' },
      { actionName: 'Formula Routine Activation', tcode: 'VOFM', description: 'Re-generate and activate pricing formula 902 after applying patch transport.' }
    ]
  },
  {
    questionId: 'Q26',
    questionText: 'Show update failures from SM13.',
    category: 'Dumps, Logs, and Runtime Errors',
    sapSourceTables: ['VBHDR', 'VBMOD', 'VBDATA', 'SM13'],
    summaryAnswer: 'There are currently 2 failed V2 update records in SM13 (both generated at 10:18 UTC by background extraction user BW_EXTRACTION). 0 V1 (critical document posting) updates failed. The failed V2 records belong to logistics statistical update MCEX03 and can safely be reprocessed.',
    keyInsights: [
      '0 failed V1 updates (all financial, sales, and inventory document postings committed cleanly).',
      '2 failed V2 updates in MCEX03 (Logistics data extraction for EWM analytics).',
      'Reprocessing: Safe to execute "Repeat Update" directly in SM13 without business risk.'
    ],
    systemMetrics: [
      { label: 'Failed V1 Updates', value: '0 Failed', status: 'positive' },
      { label: 'Failed V2 Updates', value: '2 Failed', status: 'warning' },
      { label: 'Auto-Recoverable', value: 'YES (SM13 Repeat)', status: 'positive' },
      { label: 'Update Server State', value: 'ACTIVE', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Record 1: MCEX03 (10:18 UTC)', value: 'Error in V2', detail: 'User: BW_EXTRACTION, Function: MCEX_UPDATE_03' },
      { category: 'Record 2: MCEX03 (10:18 UTC)', value: 'Error in V2', detail: 'User: BW_EXTRACTION, Function: MCEX_UPDATE_03' }
    ],
    recommendedSapActions: [
      { actionName: 'Update Request Manager', tcode: 'SM13', description: 'Select the 2 failed V2 records and click "Repeat Update" to synchronize.' },
      { actionName: 'Update Administration', tcode: 'SM14', description: 'Verify that update dispatcher and all V1/V2 work processes are active.' }
    ]
  },
  {
    questionId: 'Q27',
    questionText: 'Which technical errors are impacting business transactions?',
    category: 'Dumps, Logs, and Runtime Errors',
    sapSourceTables: ['ST22', 'SM21', 'SM13', 'SM58', 'VBAK'],
    summaryAnswer: 'The only technical error directly impacting business end users is the COMPUTE_INT_ZERODIVIDE in custom pricing routine 902, which affects sales reps creating orders in VA01 with free-of-charge (zero value/quantity) line items. All other core business processes (purchasing, billing, payments, shipping) are unaffected.',
    keyInsights: [
      'Impacted Business Transaction: VA01 / VA02 (Sales Order Creation/Change with zero-qty line items).',
      'Affected User Group: Customer Service Reps creating sample / replacement orders (approx 12 orders/day).',
      'Workaround in place: Instruct sales reps to use standard item category KLN until patch transport is imported at 16:00 UTC.'
    ],
    systemMetrics: [
      { label: 'Impacted Business Areas', value: '1 Area (SD Pricing)', status: 'neutral' },
      { label: 'Orders Blocked', value: '3 Orders Held', status: 'neutral' },
      { label: 'Workaround Available', value: 'YES (Item Cat KLN)', status: 'positive' },
      { label: 'Patch ETA', value: '16:00 UTC', status: 'positive' }
    ],
    breakdownData: [
      { category: 'SD Sales Order Pricing (VA01)', value: 'Impacted (Routine 902)', detail: 'Only triggers on zero-quantity free sample items' },
      { category: 'MM Purchase Orders (ME21N)', value: '100% Operational', detail: 'Zero technical errors' },
      { category: 'FI Invoice Postings (FB01/MIRO)', value: '100% Operational', detail: 'Zero technical errors' },
      { category: 'EWM Warehouse Pick (VL06O)', value: '100% Operational', detail: 'Zero technical errors' }
    ],
    recommendedSapActions: [
      { actionName: 'Pricing Analysis Cockpit', tcode: 'VOK0', description: 'Review condition technique determination and pricing procedure configuration.' },
      { actionName: 'Emergency Transport Import', tcode: 'STMS', description: 'Fast-track approval and import for patch transport S4DK904815.' }
    ]
  },
  {
    questionId: 'Q28',
    questionText: 'Correlate dumps, jobs, and transports from the last four hours.',
    category: 'Dumps, Logs, and Runtime Errors',
    sapSourceTables: ['E070', 'SNAP', 'TBTCO', 'SM21', 'STMS'],
    summaryAnswer: '4-HOUR CROSS-CORRELATION TIMELINE: 1) 11:30 UTC: Transport S4DK904812 imported -> 11:42 UTC: Dump COMPUTE_INT_ZERODIVIDE occurred in Routine 902. 2) 12:14 UTC: Batch job Z_SD_ORDER_EXTRACT completed normally. 3) 13:45 UTC: Dump TSV_TNEW_PAGE_ALLOC_FAILED occurred in Z_PROD_COST_RECON (unrelated to transport).',
    keyInsights: [
      'Direct Correlation Found: Transport S4DK904812 directly caused the 11:42 UTC pricing dump in RV61AFZA.',
      'Independent Event: TSV_TNEW_PAGE_ALLOC_FAILED at 13:45 UTC is an existing custom code memory issue.',
      'Background Batch Health: 42 batch jobs completed cleanly in the same 4-hour window.'
    ],
    systemMetrics: [
      { label: 'Correlated Incidents', value: '1 Direct Match', status: 'warning' },
      { label: 'Independent Errors', value: '1 Memory Dump', status: 'neutral' },
      { label: 'Transports Imported', value: '1 Transport', status: 'positive' },
      { label: 'Jobs Executed', value: '42 Clean Jobs', status: 'positive' }
    ],
    breakdownData: [
      { category: '11:30 UTC - STMS Import', value: 'Transport S4DK904812', detail: 'Modified VOFM Pricing Formula 902' },
      { category: '11:42 UTC - ST22 Dump', value: 'COMPUTE_INT_ZERODIVIDE', detail: 'First trigger in VA01 after transport import' },
      { category: '13:45 UTC - ST22 Dump', value: 'TSV_TNEW_PAGE_ALLOC_FAILED', detail: 'Z_PROD_COST_RECON executed with no plant filter' }
    ],
    recommendedSapActions: [
      { actionName: 'Transport History Analysis', tcode: 'STMS', description: 'Review object list and import sequence for transport S4DK904812.' },
      { actionName: 'ABAP Dump Call Tree', tcode: 'ST22', description: 'Verify timestamp and code version in RV61AFZA call stack.' }
    ]
  },
  {
    questionId: 'Q29',
    questionText: "What is the most likely root cause of today's errors?",
    category: 'Dumps, Logs, and Runtime Errors',
    sapSourceTables: ['ST22', 'SM21', 'E070', 'ST03N'],
    summaryAnswer: 'Root Cause Diagnostics: 1) For the pricing dump (COMPUTE_INT_ZERODIVIDE): Unhandled edge case in transport S4DK904812 where line item quantity is zero. 2) For the memory dump (TSV_TNEW_PAGE_ALLOC): Unbounded SELECT array fetching 12M rows without plant filter. 3) For carrier RFC timeouts: External 3PL DHL gateway latency.',
    keyInsights: [
      '95% of today\'s errors are caused by custom ABAP enhancements (VOFM formula 902 and report Z_PROD_COST_RECON).',
      '0 errors caused by SAP S/4HANA core, HANA database, OS, or hardware failures.',
      'Clear, actionable developer fixes identified for all internal issues.'
    ],
    systemMetrics: [
      { label: 'Primary Cause Category', value: 'Custom ABAP Code', status: 'warning' },
      { label: 'Infrastructure Cause', value: '0% (Hardware OK)', status: 'positive' },
      { label: 'External Gateway Cause', value: 'External 3PL Latency', status: 'neutral' },
      { label: 'Fix Feasibility', value: 'HIGH (100%)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Pricing Error (RV61AFZA)', value: 'Missing zero validation', detail: 'Fix: Add IF KOMP-MGAME > 0 guard clause' },
      { category: 'Memory Error (Z_PROD_COST)', value: 'Missing query bounds', detail: 'Fix: Add PACKAGE SIZE and mandatory plant filter' },
      { category: 'Carrier Timeout (RFC)', value: 'External network latency', detail: 'Fix: Increase timeout parameter to 60s in SM59' }
    ],
    recommendedSapActions: [
      { actionName: 'ABAP Code Review', tcode: 'SE38', description: 'Inspect and approve proposed bug fixes in development system.' },
      { actionName: 'RFC Parameter Configuration', tcode: 'SM59', description: 'Adjust HTTP connection timeout for CARRIER_DHL_REST.' }
    ]
  },
  {
    questionId: 'Q30',
    questionText: 'Which errors require immediate action?',
    category: 'Dumps, Logs, and Runtime Errors',
    sapSourceTables: ['STMS', 'SM13', 'ST22'],
    summaryAnswer: 'TWO ERRORS REQUIRE IMMEDIATE ACTION: 1) Import patch transport S4DK904815 into PRD to resolve the VA01 pricing dump (COMPUTE_INT_ZERODIVIDE) for sales reps. 2) Execute SM13 Repeat Update for the 2 failed V2 MCEX03 records to ensure EWM analytics synchronization.',
    keyInsights: [
      'Action 1 (Urgent): Import remediation transport S4DK904815 (approved by SD Lead).'
    ],
    systemMetrics: [
      { label: 'Immediate Action Items', value: '2 Actions', status: 'warning' },
      { label: 'Estimated Total Fix Time', value: '8 Minutes', status: 'positive' },
      { label: 'Approval Status', value: 'Pre-Approved', status: 'positive' },
      { label: 'System Outage Required', value: 'NO (Online Fix)', status: 'positive' }
    ],
    breakdownData: [
      { category: '1. Import S4DK904815', value: 'Immediate (STMS)', detail: 'Fixes VOFM Routine 902 zero-division dump in VA01' },
      { category: '2. Reprocess SM13 V2 Updates', value: 'Immediate (SM13)', detail: 'Synchronizes 2 pending MCEX03 logistics records' }
    ],
    recommendedSapActions: [
      { actionName: 'Execute STMS Import', tcode: 'STMS', description: 'Import transport S4DK904815 into S/4HANA PRD.' },
      { actionName: 'SM13 Repeat Update', tcode: 'SM13', description: 'Re-execute the 2 failed V2 extraction records.' }
    ]
  },

  // =========================================================================
  // PILLAR 4: PERFORMANCE (Q31 - Q40)
  // =========================================================================
  {
    questionId: 'Q31',
    questionText: 'Why is SAP running slowly?',
    category: 'Performance',
    sapSourceTables: ['ST03N', 'STAD', 'SM66', 'ST04', 'HDB_STAT'],
    summaryAnswer: 'The system is NOT experiencing general slowness (overall dialog response time is fast at 482 ms). Isolated slowness reported by Finance users between 13:30 and 14:00 UTC was caused by heavy full-year cost reconciliation queries (Z_PROD_COST_RECON) consuming high CPU on instance PRD_D02.',
    keyInsights: [
      'Landscape wide response time is healthy at 482 ms (SLA is < 1,000 ms).',
      'Specific slowness isolated to instance PRD_D02 during execution of unindexed custom queries.',
      'HANA DB CPU is 18%, DB read time is 2.1 ms, and network latency is 0.4 ms.'
    ],
    systemMetrics: [
      { label: 'Avg Response Time', value: '482 ms (Fast)', status: 'positive' },
      { label: 'Database Read Time', value: '2.1 ms avg', status: 'positive' },
      { label: 'CPU Wait Time', value: '18 ms avg', status: 'positive' },
      { label: 'Network Latency', value: '0.4 ms', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Dialog Task Time (Avg)', value: '482 ms', detail: 'CPU: 164ms, DB: 238ms, Wait: 24ms, Load: 56ms' },
      { category: 'Finance Slow Transaction', value: 'Z_PROD_COST_RECON (38s)', detail: 'Sequential table scan on COEP (12M rows)' },
      { category: 'Standard Sales / MM (VA01/ME21N)', value: '412 ms avg', detail: 'Optimal sub-second response' }
    ],
    recommendedSapActions: [
      { actionName: 'Workload Analysis Cockpit', tcode: 'ST03N', description: 'Analyze performance database by task type, transaction profile, and time profile.' },
      { actionName: 'Global Work Process Monitor', tcode: 'SM66', description: 'Identify active sessions with long processing times.' }
    ]
  },
  {
    questionId: 'Q32',
    questionText: 'Which transactions have the highest response time?',
    category: 'Performance',
    sapSourceTables: ['ST03N', 'STAD', 'SM66'],
    summaryAnswer: 'Top 3 slowest transactions by average response time today are: 1) Z_PROD_COST_RECON (avg 38.4 seconds - Custom Cost Report), 2) CJI3 (avg 4.8 seconds - Project System Line Items for large multi-year WBS elements), and 3) FBL3N (avg 2.1 seconds - G/L Account Line Item Display for high-volume bank clearing accounts).',
    keyInsights: [
      '1. Z_PROD_COST_RECON: 38.4s avg response (12.4M rows scanned in COEP).',
      '2. CJI3: 4.8s avg response (Reading deep WBS project hierarchy across 8 fiscal years).',
      '3. FBL3N: 2.1s avg response (Reading 450,000 clearing line items in account 113100).',
      'All core transactional t-codes (VA01, ME21N, MIGO, VF01) average under 600 ms.'
    ],
    systemMetrics: [
      { label: 'Slowest Custom T-Code', value: 'Z_PROD_COST_RECON (38.4s)', status: 'warning' },
      { label: 'Slowest Standard T-Code', value: 'CJI3 (4.8s)', status: 'neutral' },
      { label: 'Core Sales / Order Avg', value: '440 ms', status: 'positive' },
      { label: 'Transactions > 10s', value: '1 T-Code', status: 'neutral' }
    ],
    breakdownData: [
      { category: 'Z_PROD_COST_RECON', value: '38.4s avg (18 executions)', variance: 'High', detail: 'DB Time: 34.2s, CPU: 3.8s, Rows: 12.4M' },
      { category: 'CJI3 (Project Line Items)', value: '4.8s avg (42 executions)', variance: 'Moderate', detail: 'DB Time: 3.6s, CPU: 0.9s, WBS hierarchy' },
      { category: 'FBL3N (G/L Line Items)', value: '2.1s avg (184 executions)', variance: 'Normal', detail: 'DB Time: 1.6s, CPU: 0.4s, Bank clearing' }
    ],
    recommendedSapActions: [
      { actionName: 'Transaction Profile in ST03N', tcode: 'ST03N', description: 'Inspect total response time, DB percentage, and execution count per transaction.' },
      { actionName: 'SQL Trace Analysis', tcode: 'ST05', description: 'Run SQL trace on CJI3 and Z_PROD_COST_RECON to identify missing index opportunities.' }
    ]
  },
  {
    questionId: 'Q33',
    questionText: 'Show the most expensive SAP transactions today.',
    category: 'Performance',
    sapSourceTables: ['ST03N', 'STAD', 'HDB_STAT', 'DB02'],
    summaryAnswer: 'The top 3 most resource-intensive transactions by total cumulative CPU & DB time today are: 1) Fiori Analytical Query C_PurchaseOrderFs (consumed 4.2 CPU hours across 1,840 executions), 2) VA01 / VA02 (consumed 3.8 CPU hours across 8,420 sales order steps), and 3) MIGO (consumed 2.6 CPU hours across 6,110 goods receipts).',
    keyInsights: [
      'C_PurchaseOrderFs: Highest cumulative consumption due to complex Fiori analytical CDS join logic.',
      'VA01 / VA02: High cumulative consumption purely due to high transaction volume (8,420 orders created today).',
      'All high-consumption standard transactions have healthy per-step execution times (<500 ms).'
    ],
    systemMetrics: [
      { label: 'Most Expensive App', value: 'C_PurchaseOrderFs', status: 'neutral' },
      { label: 'Total App CPU Hours', value: '4.2 Hours', status: 'neutral' },
      { label: 'Highest Step Volume', value: 'VA01 (8,420 Steps)', status: 'positive' },
      { label: 'HANA Query Optimizer', value: 'ACTIVE', status: 'positive' }
    ],
    breakdownData: [
      { category: 'C_PurchaseOrderFs (Fiori PO Analytics)', value: '4.2 CPU Hours (1,840 runs)', detail: 'CDS View Join: EKKO, EKPO, EKKN, ACDOCA' },
      { category: 'VA01 / VA02 (Sales Orders)', value: '3.8 CPU Hours (8,420 runs)', detail: 'Average 380 ms per step (Highly efficient)' },
      { category: 'MIGO (Goods Movements)', value: '2.6 CPU Hours (6,110 runs)', detail: 'Average 410 ms per step (Highly efficient)' }
    ],
    recommendedSapActions: [
      { actionName: 'Transaction Workload Profile', tcode: 'ST03N', description: 'Sort transactions by cumulative database time and total dialog steps.' },
      { actionName: 'HANA Plan Visualizer', tcode: 'DB02', description: 'Analyze execution plan and cache utilization for CDS View C_PurchaseOrderFs.' }
    ]
  },
  {
    questionId: 'Q34',
    questionText: 'Which work processes are stuck?',
    category: 'Performance',
    sapSourceTables: ['SM50', 'SM66', 'SM51', 'TH_WPINFO'],
    summaryAnswer: 'ZERO work processes are stuck across the entire cluster. All 240 work processes (160 Dialog, 60 Background, 12 Update, 8 Spool) across all 4 application servers are currently in state "Waiting" or completing active requests within normal execution limits (<5 seconds).',
    keyInsights: [
      '0 hung, looping, or stuck work processes across PRD_D00, PRD_D01, and PRD_D02.',
      'Maximum active work process execution time currently is 14 seconds (BTC WP 12 running SAP_REORG_SPOOL).',
      'No work processes in PRIV (private memory) mode.'
    ],
    systemMetrics: [
      { label: 'Stuck Work Processes', value: '0 Stuck', status: 'positive' },
      { label: 'Total Cluster WP', value: '240 Processes', status: 'positive' },
      { label: 'Processes in PRIV Mode', value: '0 in PRIV', status: 'positive' },
      { label: 'Max Active WP Time', value: '14 Seconds', status: 'positive' }
    ],
    breakdownData: [
      { category: 'PRD_D00 (PAS)', value: '60 WP (4 Active, 56 Waiting)', detail: '0 Stuck, 0 PRIV, Max runtime: 4s' },
      { category: 'PRD_D01 (AAS1)', value: '60 WP (5 Active, 55 Waiting)', detail: '0 Stuck, 0 PRIV, Max runtime: 14s (Spool Reorg)' },
      { category: 'PRD_D02 (AAS2)', value: '60 WP (6 Active, 54 Waiting)', detail: '0 Stuck, 0 PRIV, Max runtime: 6s' },
      { category: 'PRD_ASCS01 (Enqueue)', value: 'Dedicated Enqueue Engine', detail: '0 Enqueue bottlenecks' }
    ],
    recommendedSapActions: [
      { actionName: 'Global Work Process Monitor', tcode: 'SM66', description: 'Display consolidated live work process state across all servers with auto-refresh.' },
      { actionName: 'Local Work Process Overview', tcode: 'SM50', description: 'Inspect CPU time, table being accessed, and action for active work processes.' }
    ]
  },
  {
    questionId: 'Q35',
    questionText: 'Which users or programs are consuming the most resources?',
    category: 'Performance',
    sapSourceTables: ['SM04', 'AL08', 'ST03N', 'SM50'],
    summaryAnswer: 'Top resource-consuming users right now are: 1) User CONTROLLER_02 (running custom report Z_PROD_COST_RECON, consumed 4.1 GB session memory), 2) System user BW_EXTRACTION (running delta extraction jobs, consumed 184 CPU seconds), and 3) User BUYER_LEAD (running Fiori PO analytics, 142 DB requests/sec).',
    keyInsights: [
      'User CONTROLLER_02: High session memory (4.1 GB) in Z_PROD_COST_RECON.',
      'User BW_EXTRACTION: Normal scheduled batch extraction consumption.',
      '99.2% of active users are consuming < 50 MB session memory and < 2 CPU seconds per step.'
    ],
    systemMetrics: [
      { label: 'Top Memory User', value: 'CONTROLLER_02 (4.1 GB)', status: 'warning' },
      { label: 'Top CPU Program', value: 'Z_PROD_COST_RECON', status: 'warning' },
      { label: 'Avg User Memory', value: '28.4 MB', status: 'positive' },
      { label: 'Active User Count', value: '486 Sessions', status: 'positive' }
    ],
    breakdownData: [
      { category: 'CONTROLLER_02', value: '4,120 MB RAM | 38s CPU', detail: 'Program: Z_PROD_COST_RECON, Host: prd-app-03' },
      { category: 'BW_EXTRACTION', value: '340 MB RAM | 184s CPU', detail: 'Program: SAP_BW_EXTRACT, Host: prd-app-01' },
      { category: 'BUYER_LEAD', value: '180 MB RAM | 42s CPU', detail: 'App: C_PurchaseOrderFs, Host: prd-app-02' }
    ],
    recommendedSapActions: [
      { actionName: 'User List with Memory', tcode: 'SM04', description: 'Review memory allocated per user session and terminate excessive sessions if needed.' },
      { actionName: 'Global User Activity', tcode: 'AL08', description: 'Monitor cross-instance user resource consumption and transaction steps.' }
    ]
  },
  {
    questionId: 'Q36',
    questionText: 'Show work process utilization across servers.',
    category: 'Performance',
    sapSourceTables: ['SM51', 'SM50', 'ST03N', 'TH_WPINFO'],
    summaryAnswer: 'Work process utilization across all application servers is HEALTHY at 6.2% active (15 active / 240 total). PRD_D00 has 4 active WPs (6.6%), PRD_D01 has 5 active WPs (8.3%), and PRD_D02 has 6 active WPs (10.0%). Ample capacity exists to absorb sudden transaction spikes.',
    keyInsights: [
      '225 out of 240 work processes are free and waiting for incoming requests.',
      'Dialog WP utilization: 8 / 160 active (5.0% utilized).',
      'Background WP utilization: 4 / 60 active (6.6% utilized).',
      'Update WP utilization: 1 / 12 active (8.3% utilized).'
    ],
    systemMetrics: [
      { label: 'Cluster WP Utilization', value: '6.2% Active', status: 'positive' },
      { label: 'Free Work Processes', value: '225 / 240 Free', status: 'positive' },
      { label: 'Dialog WP Free', value: '152 / 160 Free', status: 'positive' },
      { label: 'BTC WP Free', value: '56 / 60 Free', status: 'positive' }
    ],
    breakdownData: [
      { category: 'PRD_D00 (PAS)', value: '4 Active / 60 Total (6.6%)', detail: 'DIA: 2/40, BTC: 1/20, UPD: 1/4' },
      { category: 'PRD_D01 (AAS1)', value: '5 Active / 60 Total (8.3%)', detail: 'DIA: 3/40, BTC: 2/20, UPD: 0/4' },
      { category: 'PRD_D02 (AAS2)', value: '6 Active / 60 Total (10.0%)', detail: 'DIA: 3/40, BTC: 1/20, UPD: 0/4' }
    ],
    recommendedSapActions: [
      { actionName: 'Process Overview', tcode: 'SM50', description: 'View real-time work process breakdown and execution states.' },
      { actionName: 'Work Process Configuration', tcode: 'RZ04', description: 'Review operation modes and day/night work process distribution.' }
    ]
  },
  {
    questionId: 'Q37',
    questionText: 'Are there memory bottlenecks?',
    category: 'Performance',
    sapSourceTables: ['ST02', 'ST06', 'SM04', 'HDB_STAT'],
    summaryAnswer: 'NO memory bottlenecks detected. S/4HANA shared buffers in ST02 are healthy with >99.4% hit ratio and 0 swaps on Program, CUA, Screen, and Table buffers. Extended memory (EM) utilization is 32% (24 GB used / 75 GB pool). HANA Database memory is at 62% of physical capacity with zero swapping.',
    keyInsights: [
      'Buffer Hit Ratios: Program (99.8%), CUA (99.9%), Screen (99.7%), Table (99.4%) - all above 99% threshold.',
      'Buffer Swaps: 0 swaps in the last 24 hours across all instances.',
      'Extended Memory Pool: 51 GB free headroom available for user roll sessions.'
    ],
    systemMetrics: [
      { label: 'Buffer Hit Ratio', value: '99.7% Avg', status: 'positive' },
      { label: 'Buffer Swaps (24h)', value: '0 Swaps', status: 'positive' },
      { label: 'Extended Memory Pool', value: '32% Used (51GB Free)', status: 'positive' },
      { label: 'HANA Memory Used', value: '62.1% (Safe)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Program Buffer (ST02)', value: 'Hit Ratio: 99.8% | 0 Swaps', detail: 'Allocated: 4,096 MB, Free: 1,120 MB' },
      { category: 'Table Buffer (ST02)', value: 'Hit Ratio: 99.4% | 0 Swaps', detail: 'Allocated: 8,192 MB, Free: 2,410 MB' },
      { category: 'Extended Memory (EM)', value: '32% Used (24 GB / 75 GB)', detail: '0 sessions entering PRIV mode' }
    ],
    recommendedSapActions: [
      { actionName: 'SAP Buffer Monitor', tcode: 'ST02', description: 'Inspect buffer allocation, hit ratios, and history of buffer swaps.' },
      { actionName: 'Memory Overview', tcode: 'SM04', description: 'Review memory types (Roll, Extended, Heap) used across active sessions.' }
    ]
  },
  {
    questionId: 'Q38',
    questionText: 'Is the problem in SAP, HANA, network, or custom ABAP?',
    category: 'Performance',
    sapSourceTables: ['ST03N', 'STAD', 'ST04', 'OS01'],
    summaryAnswer: 'Performance telemetry attributes 88% of transaction latency to CUSTOM ABAP CODE optimization (specifically unindexed loops in Z_PROD_COST_RECON), 8% to HANA database calculation processing, 3% to standard SAP kernel logic, and <1% to LAN network transmission.',
    keyInsights: [
      '88% latency attributed to Custom ABAP Code (Z_ reports lacking optimal filters).',
      'HANA Database: Running optimally with 2.1 ms average query execution time.',
      'Network: Latency between app servers and HANA DB is <0.4 ms (optimal 10 GbE connection).',
      'Standard S/4HANA Kernel: Performing with sub-millisecond dispatch times.'
    ],
    systemMetrics: [
      { label: 'Custom ABAP Impact', value: '88% of Latency', status: 'warning' },
      { label: 'HANA DB Impact', value: '8% (Optimal)', status: 'positive' },
      { label: 'SAP Kernel Impact', value: '3% (Optimal)', status: 'positive' },
      { label: 'Network Impact', value: '<1% (0.4 ms)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Custom ABAP Code', value: '88% Latency Share', detail: 'Unbounded SELECT in Z_PROD_COST_RECON' },
      { category: 'HANA Database', value: '8% Latency Share', detail: 'Avg query time: 2.1 ms across 2.4M queries' },
      { category: 'Standard SAP Core', value: '3% Latency Share', detail: 'Kernel dispatch and work process handling' },
      { category: 'Network Infrastructure', value: '<1% Latency Share', detail: 'Round-trip ping: 0.38 ms, 0 packet loss' }
    ],
    recommendedSapActions: [
      { actionName: 'Detailed Performance Breakdown', tcode: 'STAD', description: 'Break down individual slow transactions into CPU, DB, Wait, and Network times.' },
      { actionName: 'ABAP SQL Profiler', tcode: 'SAT', description: 'Profile custom ABAP code to pinpoint exact expensive internal table operations.' }
    ]
  },
  {
    questionId: 'Q39',
    questionText: "Compare today's performance with yesterday.",
    category: 'Performance',
    sapSourceTables: ['ST03N', 'STAD', 'HDB_STAT'],
    summaryAnswer: 'Today\'s performance is virtually IDENTICAL to yesterday: Average dialog response time is 482 ms today vs. 476 ms yesterday (+1.2% variance). Total dialog transaction step volume increased by +4.8% (214,000 steps today vs. 204,000 yesterday). HANA CPU load and memory usage remained steady at 18% and 62%.',
    keyInsights: [
      'Avg Dialog Response: 482 ms today vs 476 ms yesterday (variance within normal baseline +/- 3%).',
      'Transaction Volume: +4.8% increase in total processed business steps.',
      'DB Time per Dialog Step: 238 ms today vs 232 ms yesterday.',
      'Zero performance degradation across all standard business modules.'
    ],
    systemMetrics: [
      { label: 'Response Time Variance', value: '+1.2% (Stable)', status: 'positive' },
      { label: 'Today Avg Response', value: '482 ms', status: 'positive' },
      { label: 'Yesterday Avg Response', value: '476 ms', status: 'positive' },
      { label: 'Volume Change', value: '+4.8% Steps', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Dialog Steps Processed', value: '214,000 Today vs 204,000 Yesterday', variance: '+4.8%', detail: 'Higher volume in SD sales orders' },
      { category: 'Avg Dialog Response', value: '482 ms Today vs 476 ms Yesterday', variance: '+1.2%', detail: 'Stable performance profile' },
      { category: 'Avg Database Request', value: '238 ms Today vs 232 ms Yesterday', variance: '+2.5%', detail: 'HANA cache hit ratio: 99.8%' }
    ],
    recommendedSapActions: [
      { actionName: 'Historical Workload Comparison', tcode: 'ST03N', description: 'Compare daily and weekly performance profiles in ST03N Expert Mode.' },
      { actionName: 'Database Performance History', tcode: 'DB02', description: 'Inspect daily database growth, CPU load history, and memory allocation trends.' }
    ]
  },
  {
    questionId: 'Q40',
    questionText: 'Predict when system capacity could become critical.',
    category: 'Performance',
    sapSourceTables: ['DB02', 'ST06', 'HDB_STAT', 'ST03N'],
    summaryAnswer: 'Capacity Trend Forecast: 1) Application Server CPU & Memory capacity is safe for >18 months under current 8% annual growth. 2) HANA Database Memory (384 GB / 618 GB license) projected to reach 80% threshold in 11 months. 3) Tablespace PSAPSR3 will require a 50 GB storage extension in 45 days.',
    keyInsights: [
      'HANA DB Memory: Safe for 11 months before reaching 80% alert threshold (Current growth: 12 GB/month).',
      'Tablespace Storage: Next 50 GB extension recommended within 45 days.',
      'App Server CPU: Peak utilization at 34% provides >3x headroom for upcoming peak sales season.'
    ],
    systemMetrics: [
      { label: 'HANA Capacity Headroom', value: '11 Months Safe', status: 'positive' },
      { label: 'Storage Extension Window', value: '45 Days', status: 'neutral' },
      { label: 'App Server Headroom', value: '> 18 Months', status: 'positive' },
      { label: 'Peak Capacity Buffer', value: '66% Available', status: 'positive' }
    ],
    breakdownData: [
      { category: 'HANA Physical Memory', value: 'Current: 62% | Alert at 80%', detail: 'Projected 80% date: 11 months at +12 GB/mo growth' },
      { category: 'Database Tablespace (PSAPSR3)', value: 'Current: 82% | 45 Days Headroom', detail: 'Recommend adding 50 GB data file in DB02' },
      { category: 'Application Server Cluster', value: 'Current: 25% CPU | >18 Mo Safe', detail: 'Handles up to 1,500 concurrent users' }
    ],
    recommendedSapActions: [
      { actionName: 'Database Space Forecast', tcode: 'DB02', description: 'Review 30-day and 90-day growth projection charts for all tablespaces.' },
      { actionName: 'Data Archiving Cockpit', tcode: 'SARA', description: 'Schedule archiving for historical IDoc and change document tables (CDCLS, EDIDC).' }
    ]
  },

  // =========================================================================
  // PILLAR 5: USERS, RFCS, SECURITY, AND CONNECTIVITY (Q41 - Q50)
  // =========================================================================
  {
    questionId: 'Q41',
    questionText: 'Which users are locked?',
    category: 'Users, RFCs, Security, and Connectivity',
    sapSourceTables: ['USR02', 'SU01', 'SU10', 'SM20'],
    summaryAnswer: 'There are currently 4 user accounts locked in PRD: 3 dialog users locked due to incorrect password attempts (J_SMITH, T_MEYER, A_PETROV) and 1 technical service user (SVC_LEGACY_CRM) locked administratively due to deprecated interface decommission.',
    keyInsights: [
      '3 Dialog Users locked due to 3 consecutive failed password attempts (UFLAG = 128).',
      '1 Technical Account locked administratively by Security team (UFLAG = 64).',
      '0 privileged administrative accounts (SAP*, DDIC, BASIS_ADMIN) are locked or under attack.'
    ],
    systemMetrics: [
      { label: 'Total Locked Accounts', value: '4 Users', status: 'neutral' },
      { label: 'Password Lock (Dialog)', value: '3 Users', status: 'neutral' },
      { label: 'Admin Locked (Technical)', value: '1 User', status: 'positive' },
      { label: 'Admin Accounts Status', value: 'SECURE', status: 'positive' }
    ],
    breakdownData: [
      { category: 'J_SMITH (Sales Rep)', value: 'Locked (Incorrect Password)', detail: 'Locked at 08:42 UTC after 3 attempts' },
      { category: 'T_MEYER (Purchasing Buyer)', value: 'Locked (Incorrect Password)', detail: 'Locked at 09:15 UTC after 3 attempts' },
      { category: 'A_PETROV (Warehouse Op)', value: 'Locked (Incorrect Password)', detail: 'Locked at 11:04 UTC after 3 attempts' },
      { category: 'SVC_LEGACY_CRM (Technical)', value: 'Locked (Admin Decommission)', detail: 'Locked by SEC_ADMIN on 2026-08-01' }
    ],
    recommendedSapActions: [
      { actionName: 'User Maintenance', tcode: 'SU01', description: 'Unlock dialog user accounts after verifying identity with helpdesk.' },
      { actionName: 'Mass User Unlock', tcode: 'SU10', description: 'Mass unlock and trigger self-service password reset for locked dialog users.' }
    ]
  },
  {
    questionId: 'Q42',
    questionText: 'Show failed login attempts.',
    category: 'Users, RFCs, Security, and Connectivity',
    sapSourceTables: ['SM20', 'USR02', 'SM21', 'USLOG'],
    summaryAnswer: 'In the last 24 hours, the SAP Security Audit Log (SM20) recorded 18 failed login attempts across the landscape. 12 were standard user mistyped passwords (cleared upon re-entry), 3 led to user locks (J_SMITH, T_MEYER, A_PETROV), and 3 were rejected RFC logon attempts from an unapproved IP address targeting service user RFC_TEST.',
    keyInsights: [
      '18 failed login events in 24 hours (normal baseline for 486 active users).',
      '3 RFC authentication rejections from IP 192.168.140.22 targeting RFC_TEST (blocked by SNC/S_TABU_DIS).',
      'Security audit log active and tamper-proof across all application server nodes.'
    ],
    systemMetrics: [
      { label: 'Failed Logins (24h)', value: '18 Events', status: 'neutral' },
      { label: 'User Mistypes', value: '12 Cleared', status: 'positive' },
      { label: 'Account Locks', value: '3 Accounts', status: 'neutral' },
      { label: 'Suspicious RFC Rejections', value: '3 Blocked', status: 'warning' }
    ],
    breakdownData: [
      { category: 'Dialog Failed Logins', value: '15 Events', detail: 'Standard user password typos from office workstations' },
      { category: 'RFC Rejected Logins', value: '3 Events (IP: 192.168.140.22)', detail: 'Target: RFC_TEST, Reason: Invalid password / SNC mismatch' }
    ],
    recommendedSapActions: [
      { actionName: 'Security Audit Log Analysis', tcode: 'SM20', description: 'Filter failed logon events (Event AU0, AUB) across all instances for 24 hours.' },
      { actionName: 'Security Audit Configuration', tcode: 'RSAU_CONFIG', description: 'Verify audit log filtering filters and daily retention settings.' }
    ]
  },
  {
    questionId: 'Q43',
    questionText: 'Which technical users have authentication problems?',
    category: 'Users, RFCs, Security, and Connectivity',
    sapSourceTables: ['USR02', 'SM20', 'SM59', 'SM21'],
    summaryAnswer: 'Technical user RFC_TEST has experienced 3 rejected authentication attempts today from IP 192.168.140.22 due to an expired stored password in a non-production test script. All production technical users (BW_EXTRACTION, EWM_BATCH, EDI_SYSTEM, PI_INTEGRATION) are authenticating successfully via SNC / X.509 certificates.',
    keyInsights: [
      'RFC_TEST: Test script on dev workstation 192.168.140.22 using outdated password.',
      'Production Interface Users: 100% healthy authentication with zero failed handshakes.',
      'SNC (Secure Network Communications) active for all production integration channels.'
    ],
    systemMetrics: [
      { label: 'Technical Users with Issues', value: '1 (Test Account)', status: 'neutral' },
      { label: 'Prod Tech User Health', value: '100% Healthy', status: 'positive' },
      { label: 'SNC Certificate Status', value: 'ACTIVE & VALID', status: 'positive' },
      { label: 'Failed Auth Rate', value: '< 0.01%', status: 'positive' }
    ],
    breakdownData: [
      { category: 'RFC_TEST (Test Script)', value: '3 Failed Auth (Expired Pwd)', detail: 'Origin: IP 192.168.140.22 (Non-prod dev sandbox)' },
      { category: 'BW_EXTRACTION (Prod)', value: 'OK (100% Success)', detail: 'Authenticates via X.509 Client Certificate' },
      { category: 'EDI_SYSTEM (Prod)', value: 'OK (100% Success)', detail: 'Authenticates via SNC Encrypted Tunnel' }
    ],
    recommendedSapActions: [
      { actionName: 'User Password Maintenance', tcode: 'SU01', description: 'Reset password for technical user RFC_TEST or restrict logon to approved IP.' },
      { actionName: 'Security Audit Log', tcode: 'SM20', description: 'Verify terminal ID and client IP origin for RFC_TEST authentication errors.' }
    ]
  },
  {
    questionId: 'Q44',
    questionText: 'Which RFC destinations are failing?',
    category: 'Users, RFCs, Security, and Connectivity',
    sapSourceTables: ['RFCDES', 'SM59', 'SM21', 'SM58'],
    summaryAnswer: 'Of the 48 configured RFC destinations in SM59, exactly 1 destination is experiencing communication failures: CARRIER_DHL_REST (HTTP Connection to external 3PL carrier gateway) is returning HTTP 504 Gateway Timeout intermittently. All 47 internal and partner RFC destinations (BW, CPI, Ariba, GTS) are 100% operational.',
    keyInsights: [
      'CARRIER_DHL_REST: External DHL cloud REST gateway experiencing elevated latency (>30s timeout).',
      'All internal SAP-to-SAP RFC connections (PRD <-> BW4, PRD <-> GTS, PRD <-> QAS) are green.',
      'SAP Cloud Integration (CPI) integration tunnel is fully responsive (ping < 120 ms).'
    ],
    systemMetrics: [
      { label: 'Total RFC Destinations', value: '48 Destinations', status: 'positive' },
      { label: 'Healthy RFCs', value: '47 / 48 (97.9%)', status: 'positive' },
      { label: 'Failing RFCs', value: '1 (CARRIER_DHL)', status: 'warning' },
      { label: 'Avg Internal Ping', value: '1.2 ms', status: 'positive' }
    ],
    breakdownData: [
      { category: 'CARRIER_DHL_REST (Type G - HTTP)', value: 'Intermittent 504 Timeout', variance: 'External 3PL', detail: 'URL: https://api.dhl.com/v1/tracking (Timeout > 30s)' },
      { category: 'BW4_CONNECTION (Type 3 - ABAP)', value: 'OK (Ping: 1.4 ms)', variance: 'Optimal', detail: 'BW/4HANA analytical data warehouse' },
      { category: 'CPI_INTEGRATION (Type G - HTTPS)', value: 'OK (Ping: 118 ms)', variance: 'Optimal', detail: 'SAP Integration Suite Cloud Tenant' }
    ],
    recommendedSapActions: [
      { actionName: 'RFC Connection Test', tcode: 'SM59', description: 'Perform connection test and authorization test on destination CARRIER_DHL_REST.' },
      { actionName: 'HTTP Client Trace', tcode: 'SMICM', description: 'Enable level 2 trace on ICM HTTP client to inspect external DHL handshake logs.' }
    ]
  },
  {
    questionId: 'Q45',
    questionText: 'Show queued transactions in SM58.',
    category: 'Users, RFCs, Security, and Connectivity',
    sapSourceTables: ['ARFCSSTATE', 'ARFCSDATA', 'SM58'],
    summaryAnswer: 'There are currently 8 queued transactional RFC (tRFC) records in SM58. All 8 entries belong to function module Z_CRM_CUSTOMER_SYNC targeting destination LEGACY_CRM_DEST with status CPIC_ERROR (Connection Refused), queued since 08:30 UTC when the legacy test listener was stopped.',
    keyInsights: [
      '8 tRFC entries queued in ARFCSSTATE table.',
      'Destination: LEGACY_CRM_DEST (Legacy test system undergoing planned network maintenance).',
      'Zero queued tRFCs for core financial, banking, or logistics destinations.'
    ],
    systemMetrics: [
      { label: 'Queued tRFCs in SM58', value: '8 Transactions', status: 'neutral' },
      { label: 'Failing Destination', value: 'LEGACY_CRM_DEST', status: 'neutral' },
      { label: 'Status Code', value: 'CPIC_ERROR', status: 'neutral' },
      { label: 'Core Interface Health', value: '100% Healthy', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Z_CRM_CUSTOMER_SYNC (8 records)', value: 'Status: CPIC_ERROR', detail: 'Target: LEGACY_CRM_DEST, Program: Z_SD_CUSTOMER_DISPATCH' }
    ],
    recommendedSapActions: [
      { actionName: 'Transactional RFC Monitor', tcode: 'SM58', description: 'Display transaction details, error text, and execution count for queued tRFCs.' },
      { actionName: 'tRFC Re-Execution', tcode: 'SE38', description: 'Schedule standard report RSARFCEX to automatically retry queued tRFCs every 15 mins.' }
    ]
  },
  {
    questionId: 'Q46',
    questionText: 'Show inbound and outbound qRFC problems.',
    category: 'Users, RFCs, Security, and Connectivity',
    sapSourceTables: ['TRFCQOUT', 'TRFCQIN', 'SMQ1', 'SMQ2', 'SMQR'],
    summaryAnswer: 'qRFC queues are in EXCELLENT condition: 0 blocked inbound queues in SMQ2 (TRFCQIN empty), and only 1 outbound queue in SMQ1 with status WAITING (Queue: WM_OUT_10045, containing 2 EWM outbound delivery confirmation messages currently being processed by QIN scheduler).',
    keyInsights: [
      'Inbound Queues (SMQ2): 0 blocked or error queues (All EWM, APO, and CRM inbounds cleared).',
      'Outbound Queues (SMQ1): 1 queue in status WAITING (normal dispatch processing, 0 errors).',
      'qRFC Schedulers (SMQR / SMQS) registered and active on all application servers.'
    ],
    systemMetrics: [
      { label: 'Blocked Inbound (SMQ2)', value: '0 Blocked', status: 'positive' },
      { label: 'Blocked Outbound (SMQ1)', value: '0 Blocked', status: 'positive' },
      { label: 'Queues in Progress', value: '1 Active Queue', status: 'positive' },
      { label: 'Scheduler Status', value: 'ACTIVE (SMQR/SMQS)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Outbound Queue: WM_OUT_10045', value: 'Status: WAITING (2 items)', detail: 'EWM delivery confirmation to ERP' },
      { category: 'Inbound Queues (All)', value: 'Status: READY (0 queued)', detail: 'All queues clear and operational' }
    ],
    recommendedSapActions: [
      { actionName: 'qRFC Outbound Monitor', tcode: 'SMQ1', description: 'Inspect queue status, destination, and payload data for outbound queues.' },
      { actionName: 'qRFC Inbound Monitor', tcode: 'SMQ2', description: 'Verify inbound queue execution and activate automatic qRFC retry schedulers.' }
    ]
  },
  {
    questionId: 'Q47',
    questionText: 'Which certificates expire within the next 30 days?',
    category: 'Users, RFCs, Security, and Connectivity',
    sapSourceTables: ['STRUST', 'SSFCERT', 'ICM_SSL'],
    summaryAnswer: 'Certificate Lifecycle Audit: 0 certificates expire within the next 30 days. The nearest certificate expiration is in 74 days (2026-11-07): the SSL Client Certificate for SAP Cloud Integration (CPI) in STRUST PSE "SSL Client (Standard)". The HTTPS server certificate (SNC/SSL Server PSE) is valid for 312 days.',
    keyInsights: [
      '0 certificates expiring in the next 30 days.',
      'Nearest Expiration: CPI SSL Client Certificate in 74 days (Valid until 2026-11-07).',
      'SSL Server PSE (Port 44300 HTTPS) valid for 312 days (Valid until 2027-07-04).',
      'Automated renewal alert configured in RZ20 60 days prior to expiry.'
    ],
    systemMetrics: [
      { label: 'Expiring in <30 Days', value: '0 Certificates', status: 'positive' },
      { label: 'Nearest Expiration', value: '74 Days (CPI Client)', status: 'positive' },
      { label: 'SSL Server Certificate', value: '312 Days Valid', status: 'positive' },
      { label: 'Certificate Health', value: '100% Valid', status: 'positive' }
    ],
    breakdownData: [
      { category: 'SSL Client (Standard) - CPI PSE', value: 'Expires in 74 Days (2026-11-07)', detail: 'Issuer: DigiCert Global Root G2, Subject: CN=*.sap.com' },
      { category: 'SSL Server Standard (HTTPS 44300)', value: 'Expires in 312 Days (2027-07-04)', detail: 'Issuer: Corporate PKI CA, Subject: CN=prd-app.corp.internal' },
      { category: 'SNC PSE (SAP GUI Encryption)', value: 'Expires in 640 Days (2028-05-26)', detail: 'Issuer: Corporate SNC Root CA' }
    ],
    recommendedSapActions: [
      { actionName: 'Trust Manager', tcode: 'STRUST', description: 'Inspect PSE certificate validity dates, certificate chains, and import replacement CSRs.' },
      { actionName: 'ICM SSL Cache Refresh', tcode: 'SMICM', description: 'Execute ICM restart on SSL port to reload certificates without full instance restart.' }
    ]
  },
  {
    questionId: 'Q48',
    questionText: 'Which interfaces are currently unavailable?',
    category: 'Users, RFCs, Security, and Connectivity',
    sapSourceTables: ['SM59', 'SOAMANAGER', 'SRT_MONI', 'SM21', 'EDIDC'],
    summaryAnswer: 'Interface Availability Matrix: Exactly 1 external interface is currently degraded: 1) CARRIER_DHL_REST (External REST Web Service for shipment tracking) due to DHL gateway timeouts. All 14 other critical production interfaces (EDI 850/810 via AS2, CPI Cloud Integration, Ariba PunchOut, Vertex Tax Engine, GTS Customs) are 100% AVAILABLE.',
    keyInsights: [
      '14 of 15 production interface channels are 100% available and processing payloads normally.',
      'Degraded: CARRIER_DHL_REST (Outbound shipping tracking requests queued for automatic retry).',
      'EDI / IDoc interface processing incoming vendor ASNs at 120 IDocs/minute with 0 syntax errors.'
    ],
    systemMetrics: [
      { label: 'Total Interfaces', value: '15 Active', status: 'positive' },
      { label: 'Available Interfaces', value: '14 / 15 (93.3%)', status: 'positive' },
      { label: 'Degraded Interfaces', value: '1 (Carrier REST)', status: 'warning' },
      { label: 'EDI / IDoc Flow Rate', value: '120 IDocs/min', status: 'positive' }
    ],
    breakdownData: [
      { category: 'CARRIER_DHL_REST (Shipment Tracking)', value: 'Degraded (HTTP 504 Timeout)', variance: 'External', detail: 'Automatic retry active; tracking requests buffered' },
      { category: 'EDI AS2 Gateway (Vendor PO/ASN)', value: '100% Available', variance: 'Optimal', detail: 'Zero partner communication errors' },
      { category: 'SAP CPI Integration Suite (Cloud)', value: '100% Available', variance: 'Optimal', detail: 'Latency: 118 ms, 0 failed messages' },
      { category: 'Vertex Tax Engine (REST)', value: '100% Available', variance: 'Optimal', detail: 'Real-time sales tax calculation active' }
    ],
    recommendedSapActions: [
      { actionName: 'Web Service Message Monitor', tcode: 'SRT_MONI', description: 'Inspect SOAP/REST web service payload errors and reprocess buffered requests.' },
      { actionName: 'IDoc Management Cockpit', tcode: 'WLF_IDOC', description: 'Monitor inbound/outbound IDoc throughput and partner status.' }
    ]
  },
  {
    questionId: 'Q49',
    questionText: 'Which privileged accounts require review?',
    category: 'Users, RFCs, Security, and Connectivity',
    sapSourceTables: ['AGR_USERS', 'USR02', 'SU01', 'SM20', 'GRACUSER'],
    summaryAnswer: 'Privileged Account Audit: 2 accounts currently require Basis / Security review: 1) User FF_BASIS_01 (Firefighter Emergency Access) was activated 3 hours ago by administrator K_WEBER and has 1 hour remaining on its 4-hour checkout window. 2) Service account SVC_LEGACY_CRM has direct SAP_ALL profile assigned and should be downgraded.',
    keyInsights: [
      'FF_BASIS_01: Firefighter ID checked out under Ticket INC-98124 (Reason: Emergency STMS import verification, expires in 1 hour).',
      'SVC_LEGACY_CRM: Has excessive SAP_ALL profile; recommended to replace with tailored role Z_CRM_INTERFACE_EXEC.',
      'Super-user SAP* and DDIC are locked in client 100 with default passwords deactivated.'
    ],
    systemMetrics: [
      { label: 'Privileged Accounts Flagged', value: '2 Accounts', status: 'warning' },
      { label: 'Active Firefighter Sessions', value: '1 Active (1h left)', status: 'neutral' },
      { label: 'SAP* / DDIC Status', value: 'LOCKED & SECURE', status: 'positive' },
      { label: 'Compliance Rating', value: '94.6%', status: 'positive' }
    ],
    breakdownData: [
      { category: 'FF_BASIS_01 (Firefighter)', value: 'Active Checkout (Ticket: INC-98124)', detail: 'User: K_WEBER, Checked out: 12:00 UTC, Expires: 16:00 UTC' },
      { category: 'SVC_LEGACY_CRM (Service)', value: 'Excessive Profile (SAP_ALL)', detail: 'Decommissioned account, recommend profile removal in SU01' }
    ],
    recommendedSapActions: [
      { actionName: 'GRC Firefighter Log Review', tcode: '/GRCPI/GRIA_LOG', description: 'Review transaction and change log executed under Firefighter ID FF_BASIS_01.' },
      { actionName: 'User Profile Adjustment', tcode: 'SU01', description: 'Remove SAP_ALL profile from SVC_LEGACY_CRM and assign restrictive authorization.' }
    ]
  },
  {
    questionId: 'Q50',
    questionText: 'Show Basis-related audit risks.',
    category: 'Users, RFCs, Security, and Connectivity',
    sapSourceTables: ['RSUSR002', 'AGR_USERS', 'USR02', 'SM20', 'RZ11'],
    summaryAnswer: 'Basis Security & Audit Compliance Audit identified 3 low-to-medium audit risk items: 1) Profile parameter login/password_compliance_to_rfc is set to 0 (should be 1 for strict password enforcement on RFC connections), 2) 1 service account (SVC_LEGACY_CRM) retains SAP_ALL authorization, and 3) Security audit log retention is set to 30 days (audit policy mandates 90 days).',
    keyInsights: [
      'Risk 1 (Medium): login/password_compliance_to_rfc parameter should be hardened in RZ10.',
      'Risk 2 (Medium): Remove SAP_ALL profile from inactive service user SVC_LEGACY_CRM.',
      'Risk 3 (Low): Increase RSAU_CONFIG audit log retention from 30 days to 90 days.',
      'Zero critical findings: Client change lock (SCC4) active, SAP* locked, and table logging active.'
    ],
    systemMetrics: [
      { label: 'Total Audit Findings', value: '3 Findings (0 High)', status: 'neutral' },
      { label: 'Critical Risk Items', value: '0 Critical', status: 'positive' },
      { label: 'Client Lock (SCC4)', value: 'LOCKED (Protected)', status: 'positive' },
      { label: 'Table Logging (rec/client)', value: 'ACTIVE (ALL)', status: 'positive' }
    ],
    breakdownData: [
      { category: '1. RFC Password Hardening', value: 'Medium Risk (Parameter RZ11)', detail: 'login/password_compliance_to_rfc = 0 (Change to 1)' },
      { category: '2. Excessive Service User Profile', value: 'Medium Risk (User SU01)', detail: 'SVC_LEGACY_CRM has SAP_ALL profile' },
      { category: '3. Security Audit Log Retention', value: 'Low Risk (Config RSAU_CONFIG)', detail: 'Current: 30 days, Audit target: 90 days' }
    ],
    recommendedSapActions: [
      { actionName: 'Profile Parameter Maintenance', tcode: 'RZ10', description: 'Set login/password_compliance_to_rfc = 1 in Default Profile.' },
      { actionName: 'Security Audit Configuration', tcode: 'RSAU_CONFIG', description: 'Adjust log file retention archive threshold to 90 days.' }
    ]
  }
];
