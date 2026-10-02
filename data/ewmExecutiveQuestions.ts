import { EwmExecutiveQuestionAnswer } from '../types';

export const ALL_EWM_EXECUTIVE_QUESTIONS: EwmExecutiveQuestionAnswer[] = [
  // =========================================================================
  // PILLAR 1: WAREHOUSE OPERATIONS (Q1 - Q10)
  // =========================================================================
  {
    questionId: 'Q1',
    questionText: "Show today's warehouse workload.",
    category: 'Warehouse Operations',
    sapSourceTables: ['/SCWM/ORDIM_O', '/SCWM/WHO', '/SCWM/LAGP', 'MKPF'],
    summaryAnswer: "Today's warehouse workload in WM10 stands at 148 open Warehouse Tasks (/SCWM/ORDIM_O) grouped into 28 active Warehouse Orders across 19 active RF operators. Overall workload capacity index is at 88% with high task velocity in Mezzanine Zone 0030.",
    keyInsights: [
      "148 open WTs active across inbound putaway, outbound picking, and internal replenishment.",
      "28 Warehouse Orders dispatched to RF resource pools with zero queue locking errors.",
      "Zone 0020 (High-Bay) experiencing elevated queue concentration with 62 pending tasks."
    ],
    warehouseMetrics: [
      { label: 'Open Warehouse Tasks', value: '148 WTs', status: 'warning' },
      { label: 'Active Warehouse Orders', value: '28 WOs', status: 'neutral' },
      { label: 'Active Resource Pickers', value: '19 RF Ops', status: 'positive' },
      { label: 'Workload Capacity Index', value: '88%', status: 'warning' }
    ],
    breakdownData: [
      { category: 'Outbound Picking Tasks', value: '72 WTs', variance: '+14%', detail: 'Queue: PICK_HIGH_BAY & PICK_MEZZ' },
      { category: 'Inbound Putaway Tasks', value: '46 WTs', variance: '-5%', detail: 'Queue: PUTAWAY_BULK' },
      { category: 'Internal Replenishment Tasks', value: '30 WTs', variance: '+8%', detail: 'Queue: REPL_TOP_OFF' }
    ],
    recommendedSapActions: [
      { actionName: 'Warehouse Monitor Workload Cockpit', tcode: '/SCWM/MON', description: 'Display real-time queue workload and task execution status in EWM Monitor.' },
      { actionName: 'Resource Workload Balancing', tcode: '/SCWM/RSRC', description: 'Reassign 4 RF operators from Bulk Reserve to Mezzanine picking queue.' }
    ]
  },
  {
    questionId: 'Q2',
    questionText: 'How many inbound deliveries are pending?',
    category: 'Warehouse Operations',
    sapSourceTables: ['/SCWM/PRDI', 'LIKP', 'LIPS', '/SCWM/ORDIM_O'],
    summaryAnswer: '6 inbound deliveries are currently pending at Warehouse WM10 dock doors. 4 deliveries have Goods Receipt posted with open putaway tasks (46 pallets), while 2 inbound deliveries (18000456 and 18000457) are awaiting physical vehicle arrival and unloading at Gate IN-02.',
    keyInsights: [
      'Inbound delivery 18000451 (Bosch Rexroth): 18 Pallets GR posted, 8 putaway tasks pending.',
      'Inbound delivery 18000453 (Siemens AG): 12 Pallets GR posted, putaway in progress at Zone 0010.',
      'Expected total incoming volume for remaining shift: 78 Pallets / 12,400 kg.'
    ],
    warehouseMetrics: [
      { label: 'Pending Inbound Deliveries', value: '6 Deliveries', status: 'neutral' },
      { label: 'GR Posted Pending Putaway', value: '4 Deliveries', status: 'warning' },
      { label: 'Awaiting Gate Arrival', value: '2 Deliveries', status: 'neutral' },
      { label: 'Total Pending Pallets', value: '78 Pallets', status: 'neutral' }
    ],
    breakdownData: [
      { category: 'IB-18000451 (Bosch Rexroth)', value: '18 Pallets', detail: 'GR Posted, Target Bin: BIN-01-A-12' },
      { category: 'IB-18000453 (Siemens AG)', value: '12 Pallets', detail: 'GR Posted, Target Bin: BIN-02-B-08' },
      { category: 'IB-18000456 (Festool Pneumatics)', value: '24 Pallets', detail: 'Arriving 15:30 GMT at GATE-IN-02' }
    ],
    recommendedSapActions: [
      { actionName: 'Process Inbound Deliveries', tcode: '/SCWM/PRDI', description: 'Review delivery status, post GR, and trigger putaway warehouse tasks.' },
      { actionName: 'Unloading Staging Verification', tcode: '/SCWM/GR', description: 'Verify handling unit barcodes at inbound staging area STAG-IN-01.' }
    ]
  },
  {
    questionId: 'Q3',
    questionText: 'How many outbound deliveries are waiting for picking?',
    category: 'Warehouse Operations',
    sapSourceTables: ['/SCWM/PRDO', '/SCWM/ORDIM_O', 'LIKP', '/SCWM/WAVE'],
    summaryAnswer: '8 outbound deliveries are currently waiting for picking execution across Waves W-2026-0809-A and W-2026-0809-B. Total items queued for picking count 72 lines (1,480 PC), with 5 deliveries assigned to active waves and 3 awaiting wave release.',
    keyInsights: [
      '5 outbound orders consolidated in Wave W-8801 with picking tasks released to RF guns.',
      '3 orders waiting for wave assignment pending replenishment of high-runner bin BIN-01-A-04.',
      'Zero stockout blocks detected on 7 out of 8 orders; 1 line requires partial pick split.'
    ],
    warehouseMetrics: [
      { label: 'Deliveries Waiting for Pick', value: '8 Deliveries', status: 'warning' },
      { label: 'Open Picking Lines', value: '72 Lines', status: 'neutral' },
      { label: 'Active Picking Waves', value: '2 Waves', status: 'positive' },
      { label: 'Wave Release Pending', value: '3 Orders', status: 'warning' }
    ],
    breakdownData: [
      { category: 'Wave W-8801 (DHL Express Cutoff 16:30)', value: '5 Deliveries', detail: '38 Tasks / 820 kg' },
      { category: 'Wave W-8802 (Kuehne+Nagel Freight)', value: '3 Deliveries', detail: '34 Tasks / 660 kg' }
    ],
    recommendedSapActions: [
      { actionName: 'Outbound Delivery Order Processing', tcode: '/SCWM/PRDO', description: 'Maintain delivery items, release waves, and monitor picking progress.' },
      { actionName: 'Wave Management Execution', tcode: '/SCWM/WAVE', description: 'Trigger wave release for Wave W-8802 to generate picking tasks.' }
    ]
  },
  {
    questionId: 'Q4',
    questionText: 'Which warehouse tasks are overdue?',
    category: 'Warehouse Operations',
    sapSourceTables: ['/SCWM/ORDIM_O', '/SCWM/AQLDO', '/SCWM/TO_CREATE'],
    summaryAnswer: '4 warehouse tasks are currently overdue exceeding the 30-minute SLA threshold. 2 picking tasks in High-Bay Zone 0020 (WT 10084920 and WT 10084921) are delayed due to high-reach forklift congestion in Aisle 04.',
    keyInsights: [
      'WT 10084920 (Material 100123 / Bin BIN-02-B-14): Overdue by 42 minutes for Outbound Delivery 80001045.',
      'WT 10084921 (Material 100456 / Bin BIN-02-C-08): Overdue by 35 minutes for Outbound Delivery 80001046.',
      '2 putaway tasks for bulk pallet storage delayed by 32 minutes awaiting staging clearance.'
    ],
    warehouseMetrics: [
      { label: 'Total Overdue Tasks', value: '4 WTs', status: 'negative' },
      { label: 'Max SLA Breach Duration', value: '42 mins', status: 'negative' },
      { label: 'Affected Outbound Orders', value: '2 Deliveries', status: 'warning' },
      { label: 'Queue Impact Severity', value: 'HIGH', status: 'negative' }
    ],
    breakdownData: [
      { category: 'WT 10084920 (Bin 02-B-14)', value: '42m Overdue', detail: 'High-Bay Forklift FL-03 Congestion' },
      { category: 'WT 10084921 (Bin 02-C-08)', value: '35m Overdue', detail: 'High-Reach Mast Calibration Check' },
      { category: 'WT 10084934 (Bin 01-A-19)', value: '32m Overdue', detail: 'Staging Area Aisle Clearance Delay' }
    ],
    recommendedSapActions: [
      { actionName: 'Reassign Warehouse Tasks', tcode: '/SCWM/MON_WT', description: 'Reassign overdue tasks from FL-03 to idle resource FL-01 in High-Bay.' },
      { actionName: 'Elevate Task Priority', tcode: '/SCWM/TO_CONF', description: 'Raise task priority to Level 1 in /SCWM/ORDIM_O.' }
    ]
  },
  {
    questionId: 'Q5',
    questionText: 'Show all open warehouse orders.',
    category: 'Warehouse Operations',
    sapSourceTables: ['/SCWM/WHO', '/SCWM/ORDIM_O', '/SCWM/RSRC'],
    summaryAnswer: '28 open Warehouse Orders (/SCWM/WHO) are active in S/4HANA EWM. 18 WOs are in active picking queues, 6 WOs are assigned to putaway resource groups, and 4 WOs are dedicated to internal replenishment and packing workcenters.',
    keyInsights: [
      'WO-800921 (Queue: PICK_HIGH_BAY): 14 open tasks assigned to Forklift Operator Markus Weiss.',
      'WO-800922 (Queue: PICK_MEZZANINE): 18 open tasks assigned to Picker Elena Fischer.',
      'WO-800923 (Queue: REPL_TOP_OFF): 6 open tasks assigned to Reach Truck Operator Thomas Becker.'
    ],
    warehouseMetrics: [
      { label: 'Total Open WOs', value: '28 Orders', status: 'neutral' },
      { label: 'Active Picking WOs', value: '18 Orders', status: 'neutral' },
      { label: 'Putaway WOs', value: '6 Orders', status: 'positive' },
      { label: 'Replenishment WOs', value: '4 Orders', status: 'neutral' }
    ],
    breakdownData: [
      { category: 'PICK_HIGH_BAY (Zone 0020)', value: '10 WOs', detail: '62 Tasks / Weight: 4,820 kg' },
      { category: 'PICK_MEZZ (Zone 0030)', value: '8 WOs', detail: '48 Tasks / Weight: 920 kg' },
      { category: 'PUTAWAY_BULK (Zone 0010)', value: '6 WOs', detail: '26 Tasks / Weight: 6,100 kg' }
    ],
    recommendedSapActions: [
      { actionName: 'Warehouse Order Management', tcode: '/SCWM/WHO', description: 'Inspect warehouse order grouping, splitting, and resource assignments.' },
      { actionName: 'RF Queue Monitor', tcode: '/SCWM/RFMENU', description: 'Monitor live RF terminal queue distribution across mobile workers.' }
    ]
  },
  {
    questionId: 'Q6',
    questionText: 'Which bins are currently blocked?',
    category: 'Warehouse Operations',
    sapSourceTables: ['/SCWM/LAGP', '/SCWM/QUAN', '/SCWM/PI'],
    summaryAnswer: '5 storage bins are currently blocked in Warehouse WM10. 2 bins are blocked for stock removal due to active physical inventory counts, 2 bins are blocked for putaway due to structural maintenance, and 1 bin is under Quality Assurance lock.',
    keyInsights: [
      'BIN-02-B-14 (Zone 0020): Removal block due to pending PI discrepancy recount (Doc 2026-PI-0084).',
      'BIN-01-A-09 (Zone 0010): Putaway block due to rack beam structural inspection.',
      'BIN-05-D-01 (Zone 0030): Quality maintenance lock on Material 100456 (QM Lot 0900012481).'
    ],
    warehouseMetrics: [
      { label: 'Total Blocked Bins', value: '5 Bins', status: 'warning' },
      { label: 'Removal Blocked', value: '2 Bins', status: 'warning' },
      { label: 'Putaway Blocked', value: '2 Bins', status: 'neutral' },
      { label: 'Quality Locked', value: '1 Bin', status: 'negative' }
    ],
    breakdownData: [
      { category: 'BIN-02-B-14 (High-Bay)', value: 'Removal Lock', detail: 'Material 100123 / PI Recount Pending' },
      { category: 'BIN-01-A-09 (Bulk Area)', value: 'Putaway Lock', detail: 'Rack Beam Maintenance in Progress' },
      { category: 'BIN-05-D-01 (Mezzanine)', value: 'QM Lock', detail: 'Material 100456 / Lot 0900012481' }
    ],
    recommendedSapActions: [
      { actionName: 'Storage Bin Master Maintenance', tcode: '/SCWM/LS02N', description: 'Display and toggle storage bin lock indicators (/SCWM/LAGP).' },
      { actionName: 'Physical Inventory Recount Resolution', tcode: '/SCWM/PI_REC', description: 'Post recount results to release inventory lock on BIN-02-B-14.' }
    ]
  },
  {
    questionId: 'Q7',
    questionText: 'What is the current warehouse utilization?',
    category: 'Warehouse Operations',
    sapSourceTables: ['/SCWM/T331', '/SCWM/LAGP', '/SCWM/QUAN'],
    summaryAnswer: 'Current overall warehouse utilization across WM10 is at 84.5% (3,549 occupied bins out of 4,200 total bin locations). Pallet Bulk Storage (Zone 0010) is operating at critical high capacity (90.0%), while High-Bay Shelving (Zone 0020) is optimal at 85.0%.',
    keyInsights: [
      'Zone 0010 (Pallet Bulk Storage): 1,080 / 1,200 bins occupied (90.0% - Critical High).',
      'Zone 0020 (High-Bay Shelving): 1,530 / 1,800 bins occupied (85.0% - Optimal).',
      'Zone 0030 (Mezzanine Small Parts): 714 / 900 bins occupied (79.3% - Healthy Headroom).'
    ],
    warehouseMetrics: [
      { label: 'Overall Utilization', value: '84.5%', status: 'warning' },
      { label: 'Occupied Bins', value: '3,549 / 4,200', status: 'neutral' },
      { label: 'Available Free Bins', value: '598 Bins', status: 'positive' },
      { label: 'Blocked Bins', value: '53 Bins', status: 'neutral' }
    ],
    breakdownData: [
      { category: '0010 Bulk Pallet Zone', value: '90.0%', variance: '+4.2%', detail: '1,080 Occupied / 105 Available' },
      { category: '0020 High-Bay Racking', value: '85.0%', variance: '+1.8%', detail: '1,530 Occupied / 248 Available' },
      { category: '0030 Mezzanine Small Parts', value: '79.3%', variance: '-2.1%', detail: '714 Occupied / 173 Available' }
    ],
    recommendedSapActions: [
      { actionName: 'Storage Type Capacity Cockpit', tcode: '/SCWM/MON_CAP', description: 'Analyze storage bin capacity, weight limits, and fill levels in EWM Monitor.' },
      { actionName: 'Trigger Slotting & Rearrangement', tcode: '/SCWM/SLOT', description: 'Run slotting optimization to move fast movers to underutilized racks.' }
    ]
  },
  {
    questionId: 'Q8',
    questionText: "Show today's goods receipt volume.",
    category: 'Warehouse Operations',
    sapSourceTables: ['MKPF', 'MSEG', '/SCWM/PRDI', '/SCWM/HUHDR'],
    summaryAnswer: "Today's goods receipt volume in WM10 totals 184 Handling Units across 3 inbound shipments with a cumulative weight of 42,500 kg (42.5 tons) and 58.2 m³ volume. 100% of received HUs have barcode scanning completed with zero physical damage flags.",
    keyInsights: [
      'Shipment GR-2026-9042 (Bosch Rexroth): 64 HUs / 18,200 kg received at Gate IN-01 (08:30 GMT).',
      'Shipment GR-2026-9043 (Siemens Energy): 70 HUs / 18,200 kg received at Gate IN-02 (09:15 GMT).',
      'Shipment GR-2026-9044 (Festool Pneumatics): 50 HUs / 6,100 kg received at Gate IN-03 (10:00 GMT).'
    ],
    warehouseMetrics: [
      { label: 'Total Received HUs', value: '184 HUs', status: 'positive' },
      { label: 'Total Weight Received', value: '42.5 Tons', status: 'positive' },
      { label: 'Completed GR Documents', value: '3 Shipments', status: 'positive' },
      { label: 'Unloading SLA Adherence', value: '96.4%', status: 'positive' }
    ],
    breakdownData: [
      { category: 'GR-2026-9042 (Bosch Rexroth)', value: '64 HUs / 18.2t', detail: 'Received at GATE-IN-01' },
      { category: 'GR-2026-9043 (Siemens Energy)', value: '70 HUs / 18.2t', detail: 'Received at GATE-IN-02' },
      { category: 'GR-2026-9044 (Festool Pneumatics)', value: '50 HUs / 6.1t', detail: 'Received at GATE-IN-03' }
    ],
    recommendedSapActions: [
      { actionName: 'Display Material Documents (GR)', tcode: 'MIGO', description: 'Display posted goods receipt material documents and accounting linkages.' },
      { actionName: 'Handling Unit Monitor', tcode: '/SCWM/HUMON', description: 'Review nested handling unit hierarchy and barcode tracking numbers.' }
    ]
  },
  {
    questionId: 'Q9',
    questionText: "Show today's goods issue volume.",
    category: 'Warehouse Operations',
    sapSourceTables: ['MKPF', 'MSEG', '/SCWM/PRDO', 'LIKP'],
    summaryAnswer: "Today's goods issue volume totals 210 Handling Units across 3 completed outbound dispatches with a cumulative weight of 58,200 kg (58.2 tons) and 86.5 m³ volume. Post Goods Issue (PGI) is 100% posted in SAP S/4HANA inventory tables.",
    keyInsights: [
      'Dispatch GI-2026-7810 (EuroAuto Systems): 75 HUs / 22,400 kg dispatched via Door OUT-01.',
      'Dispatch GI-2026-7811 (Lufthansa Technik): 45 HUs / 11,200 kg dispatched via Door OUT-02.',
      'Dispatch GI-2026-7812 (ABB Power Grids): 90 HUs / 24,600 kg dispatched via Door OUT-03.'
    ],
    warehouseMetrics: [
      { label: 'Total Dispatched HUs', value: '210 HUs', status: 'positive' },
      { label: 'Total Dispatched Weight', value: '58.2 Tons', status: 'positive' },
      { label: 'Completed GI Shipments', value: '3 Shipments', status: 'positive' },
      { label: 'On-Time Dispatch Rate', value: '100.0%', status: 'positive' }
    ],
    breakdownData: [
      { category: 'GI-2026-7810 (EuroAuto Systems)', value: '75 HUs / 22.4t', detail: 'Carrier: Schenker Road Freight' },
      { category: 'GI-2026-7811 (Lufthansa Technik)', value: '45 HUs / 11.2t', detail: 'Carrier: DHL Global Forwarding' },
      { category: 'GI-2026-7812 (ABB Power Grids)', value: '90 HUs / 24.6t', detail: 'Carrier: Dachser European Logistics' }
    ],
    recommendedSapActions: [
      { actionName: 'Outbound Delivery Monitor', tcode: '/SCWM/MON_DELV', description: 'Review goods issue timestamps, carrier tracking, and PGI material documents.' },
      { actionName: 'Verify Freight Order Settlement in TM', tcode: '/SCMTMS/TOR', description: 'Confirm transportation charge calculation and carrier freight settlement.' }
    ]
  },
  {
    questionId: 'Q10',
    questionText: 'Which warehouse areas have the highest workload?',
    category: 'Warehouse Operations',
    sapSourceTables: ['/SCWM/ORDIM_O', '/SCWM/WHO', '/SCWM/RSRC'],
    summaryAnswer: 'Zone 0020 (High-Bay Shelving & Racking) has the highest active workload with 62 open warehouse tasks and an estimated queue backlog of 45 minutes, followed by Zone 0010 (Pallet Bulk Storage) with 44 open tasks.',
    keyInsights: [
      'Zone 0020 (High-Bay): 62 open tasks / 8 active operators / Workload: CRITICAL CONGESTION.',
      'Zone 0010 (Pallet Bulk): 44 open tasks / 5 active operators / Workload: HIGH ACTIVITY.',
      'Zone 0030 (Mezzanine): 28 open tasks / 4 active operators / Workload: NORMAL OPERATIONS.',
      'PACK (Packing Workcenter): 14 open tasks / 2 active operators / Workload: NORMAL OPERATIONS.'
    ],
    warehouseMetrics: [
      { label: 'Highest Workload Zone', value: 'Zone 0020', status: 'negative' },
      { label: 'Peak Queue Backlog', value: '45 mins', status: 'warning' },
      { label: 'High-Bay Open Tasks', value: '62 WTs', status: 'negative' },
      { label: 'Recommended Operator Shift', value: '+3 Pickers', status: 'neutral' }
    ],
    breakdownData: [
      { category: '0020 High-Bay Racking', value: '62 Tasks / 45m Backlog', detail: '8 Resource Operators' },
      { category: '0010 Pallet Bulk Storage', value: '44 Tasks / 30m Backlog', detail: '5 Resource Operators' },
      { category: '0030 Mezzanine Pick Area', value: '28 Tasks / 18m Backlog', detail: '4 Resource Operators' }
    ],
    recommendedSapActions: [
      { actionName: 'Dynamic Resource Re-allocation', tcode: '/SCWM/RSRC_MAINT', description: 'Shift 3 RF operators from Mezzanine to High-Bay picking queue.' },
      { actionName: 'Warehouse Activity Area Monitor', tcode: '/SCWM/MON_AREA', description: 'Track task throughput rates by storage area and queue.' }
    ]
  },

  // =========================================================================
  // PILLAR 2: INBOUND PROCESSING (Q11 - Q20)
  // =========================================================================
  {
    questionId: 'Q11',
    questionText: 'Show inbound deliveries arriving today.',
    category: 'Inbound Processing',
    sapSourceTables: ['/SCWM/PRDI', 'LIKP', 'LIPS', '/SCMTMS/TOR'],
    summaryAnswer: '5 inbound deliveries are scheduled for arrival at Warehouse WM10 today totaling 118 pallets and 28,400 kg. 2 shipments have arrived at dock gates (GATE-IN-01 and GATE-IN-02), 1 is in yard check-in, and 2 are in transit with on-time telematics tracking.',
    keyInsights: [
      'IB-DEL-800390 (Carrier: DB Schenker / Vendor: Bosch Rexroth): 32 Pallets at GATE-IN-01.',
      'IB-DEL-800391 (Carrier: DHL Freight / Vendor: Siemens AG): 28 Pallets at GATE-IN-02.',
      'IB-DEL-800392 (Carrier: Dachser / Vendor: Festool): 24 Pallets in Yard Check-in (Door GATE-IN-03 assigned).'
    ],
    warehouseMetrics: [
      { label: 'Deliveries Arriving Today', value: '5 Shipments', status: 'positive' },
      { label: 'Total Scheduled Pallets', value: '118 Pallets', status: 'positive' },
      { label: 'Docks Currently Active', value: '3 Gates', status: 'positive' },
      { label: 'Yard Check-in Queue', value: '1 Truck', status: 'neutral' }
    ],
    breakdownData: [
      { category: 'IB-800390 (Bosch Rexroth)', value: '32 Pallets / 8.2t', detail: 'Docked at GATE-IN-01 (Unloading)' },
      { category: 'IB-800391 (Siemens AG)', value: '28 Pallets / 7.1t', detail: 'Docked at GATE-IN-02 (GR In Progress)' },
      { category: 'IB-800392 (Festool Pneumatics)', value: '24 Pallets / 5.8t', detail: 'Yard Staged (Expected 15:00 GMT)' }
    ],
    recommendedSapActions: [
      { actionName: 'Inbound Delivery Notification Processing', tcode: '/SCWM/IDN', description: 'Display expected delivery notifications and check Advanced Shipping Notifications (ASN).' },
      { actionName: 'Yard Movement Gate Check-in', tcode: '/SCWM/YM', description: 'Check-in arriving carrier trucks and assign unloading dock doors.' }
    ]
  },
  {
    questionId: 'Q12',
    questionText: 'Which inbound deliveries are delayed?',
    category: 'Inbound Processing',
    sapSourceTables: ['/SCWM/PRDI', '/SCMTMS/TOR', 'LIKP'],
    summaryAnswer: '2 inbound deliveries are currently delayed past their scheduled dock appointment window. Shipment IB-DEL-800394 from Kuka Robotics is delayed by 140 minutes due to transit congestion on Highway A7, and IB-DEL-800395 from SMC Pneumatics is delayed by 45 minutes.',
    keyInsights: [
      'IB-DEL-800394 (Kuka Robotics): Delayed by 140 mins (Estimated arrival revised to 16:45 GMT).',
      'IB-DEL-800395 (SMC Pneumatics): Delayed by 45 mins (Carrier ETA: 15:30 GMT).',
      'Zero production line stoppage risk as safety stock on line items exceeds 5 days of consumption.'
    ],
    warehouseMetrics: [
      { label: 'Delayed Deliveries', value: '2 Shipments', status: 'warning' },
      { label: 'Max Arrival Delay', value: '140 mins', status: 'negative' },
      { label: 'Supplier On-Time Rate', value: '88.5%', status: 'warning' },
      { label: 'Line Starvation Risk', value: 'NONE (Safe)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'IB-800394 (Kuka Robotics)', value: '+140 mins delay', detail: 'Freight Order FO-90219 (A7 Congestion)' },
      { category: 'IB-800395 (SMC Pneumatics)', value: '+45 mins delay', detail: 'Carrier: Schenker Logistics' }
    ],
    recommendedSapActions: [
      { actionName: 'Transportation Cockpit Arrival Monitoring', tcode: '/SCMTMS/TOR', description: 'Track live telematics GPS coordinates and update dock scheduling slot.' },
      { actionName: 'Dock Appointment Rescheduling', tcode: '/SCWM/DAS', description: 'Re-assign delayed shipment from Dock Gate 01 to Gate 04 buffer slot.' }
    ]
  },
  {
    questionId: 'Q13',
    questionText: 'What goods are waiting for putaway?',
    category: 'Inbound Processing',
    sapSourceTables: ['/SCWM/ORDIM_O', '/SCWM/QUAN', '/SCWM/LAGP'],
    summaryAnswer: '46 pallets across 4 inbound shipments are currently staged at Receiving Area STAG-IN-01 waiting for putaway into High-Bay (Zone 0020) and Bulk Storage (Zone 0010). Total weight waiting for putaway is 14,800 kg.',
    keyInsights: [
      '18 pallets of Microcontroller ICs (Mat 100123) waiting for putaway to Bin BIN-01-A-12.',
      '16 pallets of Sensor Array Modules (Mat 100456) waiting for putaway to High-Bay Rack 02.',
      '12 pallets of Pneumatic Valves waiting for putaway to Mezzanine Zone 0030.'
    ],
    warehouseMetrics: [
      { label: 'Pallets Waiting Putaway', value: '46 Pallets', status: 'warning' },
      { label: 'Open Putaway WTs', value: '46 Tasks', status: 'neutral' },
      { label: 'Total Putaway Weight', value: '14.8 Tons', status: 'neutral' },
      { label: 'Avg Staging Wait Time', value: '38 mins', status: 'warning' }
    ],
    breakdownData: [
      { category: 'Material 100123 (Microcontrollers)', value: '18 Pallets / 4.2t', detail: 'Target: High-Bay BIN-01-A-12' },
      { category: 'Material 100456 (Sensors)', value: '16 Pallets / 6.1t', detail: 'Target: High-Bay BIN-02-B-08' },
      { category: 'Material 100789 (Valves)', value: '12 Pallets / 4.5t', detail: 'Target: Bulk Storage BIN-01-C-04' }
    ],
    recommendedSapActions: [
      { actionName: 'Create Putaway Tasks in Batch', tcode: '/SCWM/TODET', description: 'Trigger automatic putaway bin determination and release warehouse orders.' },
      { actionName: 'RF Putaway Terminal Confirmation', tcode: '/SCWM/RF_PUTAWAY', description: 'Direct reach truck drivers to clear staging zone STAG-IN-01.' }
    ]
  },
  {
    questionId: 'Q14',
    questionText: 'Which materials have not been put away yet?',
    category: 'Inbound Processing',
    sapSourceTables: ['/SCWM/QUAN', '/SCWM/ORDIM_O', 'MARA', 'MAKT'],
    summaryAnswer: '3 distinct material numbers currently have open quantities residing in interim receiving storage types (9010 Receiving Staging Area) without completed putaway: Material 100123 (450 PC), Material 100456 (320 PC), and Material 100789 (180 PC).',
    keyInsights: [
      'Material 100123 (Microcontroller IC): 450 PC staged in HU-902181 at STAG-IN-01.',
      'Material 100456 (Industrial Sensor Module): 320 PC staged in HU-902182 at STAG-IN-02.',
      'Material 100789 (Thermal Compound Kit): 180 PC staged in HU-902183 at STAG-IN-03.'
    ],
    warehouseMetrics: [
      { label: 'Unputaway Materials', value: '3 Materials', status: 'warning' },
      { label: 'Total Staged Quantity', value: '950 Units', status: 'neutral' },
      { label: 'Interim Stock Value', value: '€84,500', status: 'neutral' },
      { label: 'Putaway Strategy Assigned', value: '100% (Ready)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Mat 100123 (Microcontroller IC)', value: '450 PC / €42.5k', detail: 'Strategy: P10 Fixed Bin' },
      { category: 'Mat 100456 (Industrial Sensor)', value: '320 PC / €28.8k', detail: 'Strategy: P20 High-Bay Next Empty' },
      { category: 'Mat 100789 (Thermal Compound)', value: '180 PC / €13.2k', detail: 'Strategy: P30 Hazardous Bulk' }
    ],
    recommendedSapActions: [
      { actionName: 'Stock Overview by Storage Type', tcode: '/SCWM/MON_STOCK', description: 'Filter stock residing in Interim Storage Type 9010 (GR Staging).' },
      { actionName: 'Execute Material Putaway WTs', tcode: '/SCWM/TO_CREATE', description: 'Confirm putaway warehouse tasks to clear interim receiving inventory.' }
    ]
  },
  {
    questionId: 'Q15',
    questionText: 'Show putaway tasks older than two hours.',
    category: 'Inbound Processing',
    sapSourceTables: ['/SCWM/ORDIM_O', '/SCWM/AQLDO'],
    summaryAnswer: '3 putaway warehouse tasks have been open for greater than 2 hours (120 minutes) without scanner confirmation. All 3 tasks belong to inbound delivery 800388 received during the morning shift (07:15 GMT) for hazardous chemical paste containers.',
    keyInsights: [
      'WT 10084710 (Material 100789 / 40 KG): Open for 145 minutes awaiting HazMat containment check.',
      'WT 10084711 (Material 100789 / 40 KG): Open for 145 minutes targeting Cold Storage Zone 0040.',
      'WT 10084712 (Material 100789 / 40 KG): Open for 140 minutes targeting Cold Storage Zone 0040.'
    ],
    warehouseMetrics: [
      { label: 'Tasks > 2 Hours Old', value: '3 WTs', status: 'negative' },
      { label: 'Max Task Age', value: '145 mins', status: 'negative' },
      { label: 'Impacted Storage Zone', value: '0040 (HazMat)', status: 'warning' },
      { label: 'Root Cause', value: 'EHS Safety Hold', status: 'warning' }
    ],
    breakdownData: [
      { category: 'WT 10084710 (HazMat Paste)', value: '145m Open', detail: 'Target Bin: COLD-01-A-02' },
      { category: 'WT 10084711 (HazMat Paste)', value: '145m Open', detail: 'Target Bin: COLD-01-A-03' },
      { category: 'WT 10084712 (HazMat Paste)', value: '140m Open', detail: 'Target Bin: COLD-01-A-04' }
    ],
    recommendedSapActions: [
      { actionName: 'EHS HazMat Clearance Inspection', tcode: '/SCWM/EHS', description: 'Verify spill containment protocol and sign off on HazMat putaway authorization.' },
      { actionName: 'Priority Putaway Task Dispatch', tcode: '/SCWM/TO_CONF', description: 'Assign dedicated HazMat reach truck operator to execute tasks immediately.' }
    ]
  },
  {
    questionId: 'Q16',
    questionText: 'Which inbound deliveries have quantity differences?',
    category: 'Inbound Processing',
    sapSourceTables: ['/SCWM/DIFF', '/SCWM/PRDI', '/SCWM/TAP', 'EKPO'],
    summaryAnswer: '2 inbound deliveries have confirmed quantity discrepancies between ASN/PO item quantity and physical physical received count at the receiving gate. Total net shortage is 18 PC ($2,450 value).',
    keyInsights: [
      'IB-DEL-800390 (Bosch Rexroth): PO expected 100 PC of Mat 100123; received 97 PC (-3 PC Shortage / Diff Code: DIFF-REC-01).',
      'IB-DEL-800393 (Phoenix Contact): PO expected 300 PC of Mat 100567; received 285 PC (-15 PC Shortage / Diff Code: DIFF-REC-02).',
      'Discrepancy notices auto-generated and synchronized with MM Logistics Invoice Verification (MIRO).'
    ],
    warehouseMetrics: [
      { label: 'Deliveries with Differences', value: '2 Deliveries', status: 'warning' },
      { label: 'Net Unit Shortage', value: '-18 Units', status: 'negative' },
      { label: 'Shortage Value Impact', value: '€2,450', status: 'warning' },
      { label: 'Difference Analyzer Synced', value: '100% (MIRO Blocked)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'IB-800390 (Mat 100123)', value: '-3 PC Shortage', detail: 'Vendor: Bosch Rexroth / Value: €380' },
      { category: 'IB-800393 (Mat 100567)', value: '-15 PC Shortage', detail: 'Vendor: Phoenix Contact / Value: €2,070' }
    ],
    recommendedSapActions: [
      { actionName: 'EWM Difference Analyzer', tcode: '/SCWM/DIFF_ANALYZER', description: 'Review and clear differences between physical HU count and PO line items.' },
      { actionName: 'Trigger Vendor Discrepancy Notification in MM', tcode: 'ME23N', description: 'Notify vendor purchasing agent of inbound delivery shortage for credit memo.' }
    ]
  },
  {
    questionId: 'Q17',
    questionText: 'Which vendors have the most receiving discrepancies?',
    category: 'Inbound Processing',
    sapSourceTables: ['/SCWM/DIFF', 'LFA1', 'EKKO', 'QALS'],
    summaryAnswer: 'Over the last 90 days, Phoenix Contact SE has the highest receiving discrepancy frequency with 4 delivery shortages totaling 62 pieces (€8,940 variance), followed by Festool Pneumatics with 2 receiving discrepancy events.',
    keyInsights: [
      'Phoenix Contact SE (Vendor 100482): 4 Discrepancies / 94.2% Receiving Accuracy Rate.',
      'Festool Pneumatics (Vendor 100519): 2 Discrepancies / 97.5% Receiving Accuracy Rate.',
      'Bosch Rexroth (Vendor 100210): 1 Discrepancy / 99.1% Receiving Accuracy Rate (Class A Supplier).'
    ],
    warehouseMetrics: [
      { label: 'Highest Discrepancy Vendor', value: 'Phoenix Contact', status: 'negative' },
      { label: '90-Day Shortage Value', value: '€8,940', status: 'warning' },
      { label: 'Average Inbound Accuracy', value: '98.1%', status: 'positive' },
      { label: 'Recommended Audit Level', value: '100% Gate Count', status: 'neutral' }
    ],
    breakdownData: [
      { category: 'Phoenix Contact (Vendor 100482)', value: '4 Discrepancies / €8.9k', detail: 'Accuracy: 94.2% (Flagged for Inspection)' },
      { category: 'Festool Pneumatics (Vendor 100519)', value: '2 Discrepancies / €3.1k', detail: 'Accuracy: 97.5%' },
      { category: 'Bosch Rexroth (Vendor 100210)', value: '1 Discrepancy / €380', detail: 'Accuracy: 99.1%' }
    ],
    recommendedSapActions: [
      { actionName: 'Vendor Evaluation Analytics in MM', tcode: 'ME61', description: 'Update vendor evaluation score for delivery reliability and quantity accuracy.' },
      { actionName: 'Mandate 100% Inbound Gate Inspection', tcode: 'QA08', description: 'Activate mandatory receiving inspection lot generation for Phoenix Contact.' }
    ]
  },
  {
    questionId: 'Q18',
    questionText: 'Recommend putaway bins for incoming stock.',
    category: 'Inbound Processing',
    sapSourceTables: ['/SCWM/LAGP', '/SCWM/T331', '/SCWM/MATLOC', '/SCWM/SLOT'],
    summaryAnswer: 'AI Putaway Strategy Engine recommends optimal storage bins for incoming stock based on velocity (ABC classification), weight/height limits, and aisle travel minimization: BIN-01-A-04 for Mat 100123, BIN-02-B-12 for Mat 100456, and COLD-01-C-02 for Mat 100789.',
    keyInsights: [
      'Material 100123 (High Velocity A-Item): Recommended Fixed Bin BIN-01-A-04 (Ergonomic Ground Level Tier 1).',
      'Material 100456 (Medium Velocity B-Item): Recommended High-Bay Bin BIN-02-B-12 (Optimal Reach Height).',
      'Material 100789 (Thermal Compound): Recommended Cold Storage Bin COLD-01-C-02 (Temperature 4°C Monitored).'
    ],
    warehouseMetrics: [
      { label: 'Putaway Recommendations', value: '3 Materials', status: 'positive' },
      { label: 'Travel Distance Saved', value: '380 meters', status: 'positive' },
      { label: 'Ergonomic Tier Alignment', value: '100%', status: 'positive' },
      { label: 'Storage Capacity Headroom', value: 'Optimal', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Mat 100123 -> BIN-01-A-04', value: 'Ground Tier 1', detail: 'High-Runner / Minimizes Forklift Lift Time' },
      { category: 'Mat 100456 -> BIN-02-B-12', value: 'Rack Tier 2', detail: 'Medium-Runner / Near Staging Outbound' },
      { category: 'Mat 100789 -> COLD-01-C-02', value: 'Cold Zone Tier 1', detail: 'Thermal Condition Strict Match' }
    ],
    recommendedSapActions: [
      { actionName: 'Confirm Automated Bin Determination', tcode: '/SCWM/TODET', description: 'Apply AI-recommended bin allocations to open putaway warehouse tasks.' },
      { actionName: 'Slotting Strategy Maintenance', tcode: '/SCWM/MATLOC', description: 'Update fixed bin assignment in product master data.' }
    ]
  },
  {
    questionId: 'Q19',
    questionText: 'Which inbound shipments need quality inspection?',
    category: 'Inbound Processing',
    sapSourceTables: ['QALS', '/SCWM/QMAT', '/SCWM/QINSP', '/SCWM/PRDI'],
    summaryAnswer: '2 inbound shipments currently require SAP Quality Management (QM) inspection before release to unrestricted warehouse stock: Inspection Lot 01000049281 (Material 100456) and Inspection Lot 01000049282 (Material 100789).',
    keyInsights: [
      'Inspection Lot 01000049281: 50 EA of Industrial Sensor Array Mod (Mat 100456 / Batch BAT-2026-Q1) in Lab Testing.',
      'Inspection Lot 01000049282: 40 KG of Thermal Paste (Mat 100789 / Batch BAT-2025-C4) under Viscosity Inspection.',
      'Both lots are currently assigned Stock Type Q4 (In Quality Inspection) with automatic stock transfer on Usage Decision.'
    ],
    warehouseMetrics: [
      { label: 'Active QM Inspection Lots', value: '2 Lots', status: 'warning' },
      { label: 'Quarantined Stock Value', value: '€28,500', status: 'neutral' },
      { label: 'Avg Lab Inspection Turnaround', value: '4.2 hours', status: 'positive' },
      { label: 'Usage Decision Pending', value: '2 Batches', status: 'neutral' }
    ],
    breakdownData: [
      { category: 'Lot 01000049281 (Sensors)', value: '50 EA / Sample 5 EA', detail: 'Status: RELEASED_TO_LAB' },
      { category: 'Lot 01000049282 (Thermal Paste)', value: '40 KG / Sample 1 KG', detail: 'Status: VISCOSITY_TEST_ACTIVE' }
    ],
    recommendedSapActions: [
      { actionName: 'Record Inspection Results in QM', tcode: 'QE51N', description: 'Enter quantitative measurement values for open inspection characteristics.' },
      { actionName: 'Record Usage Decision in QM', tcode: 'QA11', description: 'Post Usage Decision (UD) to transfer stock from Q4 to Unrestricted F2.' }
    ]
  },
  {
    questionId: 'Q20',
    questionText: 'Show dock appointments and expected arrival times.',
    category: 'Inbound Processing',
    sapSourceTables: ['/SCWM/DAS', '/SCMTMS/TOR', '/SCWM/DOOR'],
    summaryAnswer: '6 dock appointments are scheduled across Gate Doors GATE-IN-01 to GATE-IN-04 for today. 2 shipments have docked and are unloading, 1 is scheduled for 14:30 GMT, 1 for 15:30 GMT, 1 for 16:45 GMT, and 1 buffer appointment at 17:30 GMT.',
    keyInsights: [
      '13:00 - 14:00 GMT: Gate 01 - DB Schenker (TRK-4818) - Docked / Unloading (92% Complete).',
      '13:30 - 14:30 GMT: Gate 02 - DHL Freight (TRK-4819) - Docked / GR Scan Active.',
      '14:30 - 15:30 GMT: Gate 03 - Festool Logistics (TRK-4820) - On Time (ETA: 14:25 GMT).',
      '15:30 - 16:30 GMT: Gate 02 - SMC Pneumatics (TRK-4821) - Delayed by 45m (ETA: 16:15 GMT).'
    ],
    warehouseMetrics: [
      { label: 'Total Appointments Today', value: '6 Slots', status: 'positive' },
      { label: 'Dock Door Utilization', value: '82.5%', status: 'positive' },
      { label: 'On-Time Arrival Rate', value: '83.3%', status: 'positive' },
      { label: 'Available Dock Gates', value: '1 Buffer Gate', status: 'positive' }
    ],
    breakdownData: [
      { category: 'GATE-IN-01 (DB Schenker)', value: 'Docked (Unloading)', detail: 'Appt: 13:00 / 32 Pallets' },
      { category: 'GATE-IN-02 (DHL Freight)', value: 'Docked (GR Active)', detail: 'Appt: 13:30 / 28 Pallets' },
      { category: 'GATE-IN-03 (Festool)', value: 'ETA 14:25 GMT', detail: 'Appt: 14:30 / 24 Pallets' },
      { category: 'GATE-IN-04 (Buffer Slot)', value: 'Available', detail: 'Reserved for Delayed Carrier TRK-4821' }
    ],
    recommendedSapActions: [
      { actionName: 'Dock Appointment Scheduling Dashboard', tcode: '/SCWM/DAS', description: 'View visual timetable of loading and unloading appointments.' },
      { actionName: 'Yard Management Gate Control', tcode: '/SCWM/DOOR_MAINT', description: 'Release completed gate doors and assign incoming carrier trailers.' }
    ]
  },

  // =========================================================================
  // PILLAR 3: OUTBOUND PROCESSING (Q21 - Q30)
  // =========================================================================
  {
    questionId: 'Q21',
    questionText: 'Show outbound deliveries scheduled for today.',
    category: 'Outbound Processing',
    sapSourceTables: ['/SCWM/PRDO', 'LIKP', 'LIPS', '/SCWM/WAVE'],
    summaryAnswer: '12 outbound deliveries are scheduled for dispatch today totaling 240 Handling Units (64,200 kg). 4 deliveries are fully picked and packed awaiting staging, 5 deliveries are currently in active wave picking, and 3 deliveries are scheduled for afternoon wave release.',
    keyInsights: [
      'OB-DEL-80001040 (EuroAuto Systems): 75 HUs picked, staged at Door OUT-01 (Cutoff: 16:00 GMT).',
      'OB-DEL-80001041 (Lufthansa Technik): 45 HUs picked, staged at Door OUT-02 (Cutoff: 17:00 GMT).',
      'OB-DEL-80001042 (ABB Power Grids): 52 HUs in active wave picking (90% completed).'
    ],
    warehouseMetrics: [
      { label: 'Outbound Deliveries Today', value: '12 Deliveries', status: 'positive' },
      { label: 'Total Planned Units', value: '240 HUs', status: 'positive' },
      { label: 'Picking Complete Rate', value: '75.0%', status: 'positive' },
      { label: 'SLA Cutoff Risk', value: '0 Critical', status: 'positive' }
    ],
    breakdownData: [
      { category: 'OB-80001040 (EuroAuto Systems)', value: '75 HUs / 22.4t', detail: 'Staged at Door OUT-01 / Ready to Load' },
      { category: 'OB-80001041 (Lufthansa Technik)', value: '45 HUs / 11.2t', detail: 'Staged at Door OUT-02 / Inspection Clear' },
      { category: 'OB-80001042 (ABB Power Grids)', value: '52 HUs / 14.8t', detail: 'In Wave Picking (Zone 0020)' }
    ],
    recommendedSapActions: [
      { actionName: 'Outbound Delivery Order Overview', tcode: '/SCWM/PRDO', description: 'Monitor picking, packing, staging, and loading progress for outbound deliveries.' },
      { actionName: 'Wave Management Monitor', tcode: '/SCWM/WAVE', description: 'Check wave status and release pending outbound waves.' }
    ]
  },
  {
    questionId: 'Q22',
    questionText: 'Which outbound orders are delayed?',
    category: 'Outbound Processing',
    sapSourceTables: ['/SCWM/PRDO', '/SCWM/ORDIM_O', 'VBAK'],
    summaryAnswer: '2 outbound delivery orders are experiencing picking delays: OB-DEL-80001045 for Siemens Energy (delayed by 28 minutes due to High-Bay crane bottleneck) and OB-DEL-80001048 for Bosch Mobility (delayed by 18 minutes awaiting packing carton supplies).',
    keyInsights: [
      'OB-DEL-80001045: 8 open tasks delayed in Zone 0020; recovery forklift dispatched.',
      'OB-DEL-80001048: 4 items packed; packing station replenishing box inventory.',
      'Both orders remain on track to meet carrier pickup deadlines if picked within 25 minutes.'
    ],
    warehouseMetrics: [
      { label: 'Delayed Outbound Orders', value: '2 Deliveries', status: 'warning' },
      { label: 'Avg Picking Delay', value: '23 mins', status: 'warning' },
      { label: 'Carrier Pickup Window', value: '16:30 GMT', status: 'neutral' },
      { label: 'Expedited Action Status', value: 'IN PROGRESS', status: 'positive' }
    ],
    breakdownData: [
      { category: 'OB-80001045 (Siemens Energy)', value: '28m Delay', detail: 'Zone 0020 Crane Bottleneck' },
      { category: 'OB-80001048 (Bosch Mobility)', value: '18m Delay', detail: 'Packing Material Box Replenishment' }
    ],
    recommendedSapActions: [
      { actionName: 'Expedite Warehouse Task Confirmation', tcode: '/SCWM/TO_CONF', description: 'Force confirm priority picking tasks via supervisor override.' },
      { actionName: 'Carrier Cutoff Alert Notification', tcode: '/SCMTMS/PLN', description: 'Notify carrier dispatch of revised staging time.' }
    ]
  },
  {
    questionId: 'Q23',
    questionText: 'Show orders waiting for packing.',
    category: 'Outbound Processing',
    sapSourceTables: ['/SCWM/PACK', '/SCWM/PRDO', '/SCWM/HUHDR'],
    summaryAnswer: '3 outbound deliveries (OB-DEL-80001043, 80001044, 80001046) are currently staged at Packing Station PACK-01 and PACK-02 waiting for handling unit packing, weighing, and shipping label generation.',
    keyInsights: [
      'OB-DEL-80001043 (Schneider Electric): 18 line items picked; awaiting outer carton consolidation.',
      'OB-DEL-80001044 (Alstom Transport): 24 line items picked; ESD-safe packing required.',
      'OB-DEL-80001046 (Thales Group): 12 line items picked; export crate crating in progress.'
    ],
    warehouseMetrics: [
      { label: 'Orders Waiting Packing', value: '3 Deliveries', status: 'neutral' },
      { label: 'Lines in Packing Queue', value: '54 Lines', status: 'neutral' },
      { label: 'Active Packing Stations', value: '2 Workcenters', status: 'positive' },
      { label: 'Avg Pack Time per Line', value: '1.8 mins', status: 'positive' }
    ],
    breakdownData: [
      { category: 'PACK-01 (Schneider Electric)', value: '18 Lines / 4 HUs', detail: 'Standard Carton Pack' },
      { category: 'PACK-02 (Alstom Transport)', value: '24 Lines / 6 HUs', detail: 'ESD-Safe Antistatic Packaging' },
      { category: 'PACK-02 (Thales Group)', value: '12 Lines / 2 Crates', detail: 'Wooden Export Crate Packaging' }
    ],
    recommendedSapActions: [
      { actionName: 'Packing Workstation Execution', tcode: '/SCWM/PACK', description: 'Consolidate picked items into shipping handling units and print SSCC labels.' },
      { actionName: 'Handling Unit Weight Verification', tcode: '/SCWM/WEIGH', description: 'Record calibrated scale weights for shipping declaration.' }
    ]
  },
  {
    questionId: 'Q24',
    questionText: 'Which shipments are at risk of missing carrier cutoff times?',
    category: 'Outbound Processing',
    sapSourceTables: ['/SCWM/PRDO', '/SCMTMS/TOR', '/SCWM/DOOR'],
    summaryAnswer: '1 outbound shipment (OB-DEL-80001045 for DHL Express Freight) is identified at moderate risk of missing the 16:30 GMT carrier cutoff deadline with an estimated staging completion time of 16:18 GMT (12-minute buffer remaining).',
    keyInsights: [
      'Carrier DHL Express Freight (Truck TRK-EX-88) cutoff is hard scheduled for 16:30 GMT at Door OUT-02.',
      'Current picking progress is at 72%; 6 remaining tasks require fast-track completion.',
      'Autonomous Copilot has elevated task priority to Level 1 and assigned secondary picker.'
    ],
    warehouseMetrics: [
      { label: 'Shipments at Cutoff Risk', value: '1 Shipment', status: 'warning' },
      { label: 'Carrier Cutoff Deadline', value: '16:30 GMT', status: 'warning' },
      { label: 'Estimated Staging Time', value: '16:18 GMT', status: 'positive' },
      { label: 'Safety Buffer Margin', value: '12 mins', status: 'warning' }
    ],
    breakdownData: [
      { category: 'OB-80001045 (DHL Express)', value: 'Cutoff 16:30 GMT', detail: '6 Tasks Remaining / Assigned Picker: M. Weiss' }
    ],
    recommendedSapActions: [
      { actionName: 'Emergency Wave Bypass Dispatch', tcode: '/SCWM/WAVE_EXP', description: 'Fast-track remaining picking tasks directly to staging lane STAG-OUT-02.' },
      { actionName: 'TM Transportation Booking Update', tcode: '/SCMTMS/TOR', description: 'Confirm driver check-in status and coordinate loading sequence.' }
    ]
  },
  {
    questionId: 'Q25',
    questionText: 'Show partially picked deliveries.',
    category: 'Outbound Processing',
    sapSourceTables: ['/SCWM/PRDO', '/SCWM/ORDIM_O', '/SCWM/TAP'],
    summaryAnswer: '2 outbound deliveries are currently partially picked: OB-DEL-80001042 (42 out of 52 tasks completed - 80.7%) and OB-DEL-80001045 (18 out of 24 tasks completed - 75.0%). All open tasks have assigned pickers actively executing.',
    keyInsights: [
      'OB-DEL-80001042 (ABB Power Grids): 10 open tasks in Mezzanine Zone 0030 (Picker E. Fischer).',
      'OB-DEL-80001045 (Siemens Energy): 6 open tasks in High-Bay Zone 0020 (Picker M. Weiss).',
      'Zero stock shortages on remaining lines; expected pick completion within 15 minutes.'
    ],
    warehouseMetrics: [
      { label: 'Partially Picked Orders', value: '2 Deliveries', status: 'positive' },
      { label: 'Completed Pick Lines', value: '60 / 76 Lines', status: 'positive' },
      { label: 'Overall Pick Completion', value: '78.9%', status: 'positive' },
      { label: 'Stockout Impediments', value: '0 Lines', status: 'positive' }
    ],
    breakdownData: [
      { category: 'OB-80001042 (ABB Power)', value: '42 / 52 Tasks (80.7%)', detail: 'Mezzanine Zone 0030 / Active' },
      { category: 'OB-80001045 (Siemens Energy)', value: '18 / 24 Tasks (75.0%)', detail: 'High-Bay Zone 0020 / Active' }
    ],
    recommendedSapActions: [
      { actionName: 'Outbound Picking Monitor', tcode: '/SCWM/MON_PICK', description: 'Track real-time pick confirmations by delivery and handling unit.' },
      { actionName: 'Direct Pick Confirmation', tcode: '/SCWM/TO_CONF', description: 'Confirm open picking warehouse tasks.' }
    ]
  },
  {
    questionId: 'Q26',
    questionText: 'Which customer orders have stock shortages?',
    category: 'Outbound Processing',
    sapSourceTables: ['/SCWM/PRDO', '/SCWM/QUAN', 'VBAK', 'VBAP'],
    summaryAnswer: '1 customer sales order (SO-1004892 for customer Festo AG) has an outbound delivery split due to a stock shortage of 8 units on Material 100789 (Thermal Compound). Delivery 80001049 was created for the available 42 units while 8 units await inbound replenishment.',
    keyInsights: [
      'Sales Order 1004892 (Festo AG): Ordered 50 EA of Material 100789; Available EWM Stock: 42 EA.',
      'Partial delivery 80001049 released for 42 EA to avoid shipment hold.',
      'Inbound delivery 18000456 arriving at 15:30 GMT will replenish 100 EA, fulfilling backorder.'
    ],
    warehouseMetrics: [
      { label: 'Orders with Shortages', value: '1 Order', status: 'warning' },
      { label: 'Shortage Unit Count', value: '8 Units', status: 'warning' },
      { label: 'Partial Fill Rate', value: '84.0%', status: 'positive' },
      { label: 'Backorder Replenishment ETA', value: 'Today 15:30 GMT', status: 'positive' }
    ],
    breakdownData: [
      { category: 'SO-1004892 (Festo AG)', value: '42 / 50 EA Fulfilled', detail: 'Deficit: 8 EA on Mat 100789 / Inbound ASN Linked' }
    ],
    recommendedSapActions: [
      { actionName: 'Cross-Docking Assignment', tcode: '/SCWM/CD', description: 'Create opportunistic cross-docking link between inbound ASN and backordered sales order.' },
      { actionName: 'Sales Order Delivery Schedule Update', tcode: 'VA02', description: 'Update confirmed schedule line in SD for backorder balance.' }
    ]
  },
  {
    questionId: 'Q27',
    questionText: 'Show blocked outbound deliveries.',
    category: 'Outbound Processing',
    sapSourceTables: ['/SCWM/PRDO', 'LIKP', 'VBUK', 'VKKM'],
    summaryAnswer: '1 outbound delivery (OB-DEL-80001047 for customer Apex Dynamics) is currently blocked due to an automated SAP Credit Management block in SD/FI (Credit Limit Exceeded by $14,200). Picking and goods issue are paused pending FI credit release.',
    keyInsights: [
      'OB-DEL-80001047: Credit Block Code 01 (Credit Limit Check Failed in FI-CA/FSCM).',
      'Value of blocked delivery: $48,500; Customer credit limit: $250,000 / Exposure: $264,200.',
      'Finance Credit Manager notified; approval workflow pending in FSCM Credit Cockpit.'
    ],
    warehouseMetrics: [
      { label: 'Blocked Outbound Deliveries', value: '1 Delivery', status: 'negative' },
      { label: 'Blocked Value', value: '$48,500', status: 'warning' },
      { label: 'Block Category', value: 'SD Credit Hold', status: 'negative' },
      { label: 'Warehouse Action', value: 'Picking Suspended', status: 'neutral' }
    ],
    breakdownData: [
      { category: 'OB-80001047 (Apex Dynamics)', value: '$48,500 Value', detail: 'Credit Exposure: 105.7% / FI Approval Required' }
    ],
    recommendedSapActions: [
      { actionName: 'FSCM Credit Limit Release', tcode: 'UKM_MY_DMS', description: 'Review credit case and approve credit override in SAP Credit Management.' },
      { actionName: 'Release SD Delivery Block', tcode: 'VKM3', description: 'Release sales and delivery document upon credit approval.' }
    ]
  },
  {
    questionId: 'Q28',
    questionText: 'What is the best picking sequence for open waves?',
    category: 'Outbound Processing',
    sapSourceTables: ['/SCWM/WAVE', '/SCWM/ORDIM_O', '/SCWM/T331'],
    summaryAnswer: 'AI Route Optimization Engine recommends prioritizing Wave W-8801 (Cutoff 16:30 GMT) followed by Wave W-8802 (Cutoff 18:00 GMT). Within Wave W-8801, picking sequence should execute Aisles 01 -> 02 -> Mezzanine to achieve a serpentine travel path saving 28.4% walking distance.',
    keyInsights: [
      'Wave W-8801: 5 Deliveries / 38 Tasks / Priority 1 (DHL Express Cutoff 16:30 GMT).',
      'Optimal travel route: Aisle 01 (Even bins) -> Aisle 02 (Odd bins) -> Mezzanine Z-03.',
      'Simulated picker travel time reduced from 54 minutes to 38.6 minutes per picker cycle.'
    ],
    warehouseMetrics: [
      { label: 'Recommended Wave Sequence', value: 'W-8801 -> W-8802', status: 'positive' },
      { label: 'Travel Distance Saved', value: '1,420 meters', status: 'positive' },
      { label: 'Efficiency Gain', value: '+28.4%', status: 'positive' },
      { label: 'Estimated Cycle Duration', value: '38.6 mins', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Rank 1: Wave W-8801', value: '38 Tasks / 820 kg', detail: 'Aisle 01 -> Aisle 02 -> Mezzanine (Serpentine)' },
      { category: 'Rank 2: Wave W-8802', value: '34 Tasks / 660 kg', detail: 'Bulk Zone 0010 -> High-Bay 0020' }
    ],
    recommendedSapActions: [
      { actionName: 'Apply AI Wave Sequence', tcode: '/SCWM/WAVE_REL', description: 'Release waves in optimized chronological order to RF mobile terminals.' },
      { actionName: 'Travel Distance Calculation Config', tcode: '/SCWM/TDC', description: 'Verify network graph coordinates for 3D warehouse routing.' }
    ]
  },
  {
    questionId: 'Q29',
    questionText: 'Which priority shipments must leave today?',
    category: 'Outbound Processing',
    sapSourceTables: ['/SCWM/PRDO', 'LIKP', 'VBAK', '/SCMTMS/TOR'],
    summaryAnswer: '4 priority shipments carry mandatory same-day dispatch requirements under contractual customer SLAs: OB-DEL-80001040 (EuroAuto - Priority 1), OB-DEL-80001041 (Lufthansa Technik - AOG Urgent), OB-DEL-80001042 (ABB Power - Contractual Penalty), and OB-DEL-80001045 (Siemens - Express).',
    keyInsights: [
      'OB-DEL-80001041: Aircraft-on-Ground (AOG) priority for Lufthansa Technik / Stage Gate OUT-02.',
      'OB-DEL-80001040: Tier-1 Automotive Just-In-Time shipment for EuroAuto / Loading at 15:45 GMT.',
      'All 4 shipments have dedicated staging lanes and pre-assigned carrier dock windows.'
    ],
    warehouseMetrics: [
      { label: 'Critical Must-Leave Shipments', value: '4 Shipments', status: 'positive' },
      { label: 'Total Value at Stake', value: '$342,000', status: 'positive' },
      { label: 'SLA Compliance Status', value: '100% ON TRACK', status: 'positive' },
      { label: 'Dedicated Dock Lanes', value: 'Active', status: 'positive' }
    ],
    breakdownData: [
      { category: 'OB-80001041 (Lufthansa AOG)', value: '45 HUs / $128k', detail: 'Cutoff: 17:00 GMT / Gate OUT-02' },
      { category: 'OB-80001040 (EuroAuto JIT)', value: '75 HUs / $114k', detail: 'Cutoff: 16:00 GMT / Gate OUT-01' },
      { category: 'OB-80001042 (ABB Power)', value: '52 HUs / $62k', detail: 'Cutoff: 18:00 GMT / Gate OUT-03' },
      { category: 'OB-80001045 (Siemens Express)', value: '24 HUs / $38k', detail: 'Cutoff: 16:30 GMT / Gate OUT-02' }
    ],
    recommendedSapActions: [
      { actionName: 'Priority Staging Lane Lock', tcode: '/SCWM/STAG_MAINT', description: 'Lock staging lanes STAG-OUT-01/02 for exclusive priority shipment use.' },
      { actionName: 'Direct Goods Issue Posting', tcode: '/SCWM/PGI', description: 'Post PGI immediately upon carrier bill of lading sign-off.' }
    ]
  },
  {
    questionId: 'Q30',
    questionText: 'Show loading status for today’s outbound shipments.',
    category: 'Outbound Processing',
    sapSourceTables: ['/SCWM/LOAD', '/SCWM/DOOR', '/SCWM/PRDO'],
    summaryAnswer: 'Loading operations across Outbound Dock Doors OUT-01 to OUT-03 are operating at 66.7% completion: Door OUT-01 (Truck TRK-4901) is 100% loaded with Bill of Lading generated; Door OUT-02 (Truck TRK-4902) is 45% loaded; Door OUT-03 is staged awaiting trailer docking.',
    keyInsights: [
      'Door OUT-01: 75 / 75 HUs loaded onto Schenker Trailer TRK-4901 (Departure in 15 mins).',
      'Door OUT-02: 20 / 45 HUs loaded onto DHL Express Truck TRK-4902 (Forklift active).',
      'Door OUT-03: 52 HUs staged in lane; Dachser Trailer TRK-4903 in yard check-in.'
    ],
    warehouseMetrics: [
      { label: 'Active Loading Doors', value: '3 Doors', status: 'positive' },
      { label: 'Total HUs Loaded Today', value: '95 / 172 HUs', status: 'positive' },
      { label: 'Loading Completion Rate', value: '55.2%', status: 'positive' },
      { label: 'Avg Loading Time / Truck', value: '34 mins', status: 'positive' }
    ],
    breakdownData: [
      { category: 'GATE-OUT-01 (Schenker)', value: '100% Loaded (75 HUs)', detail: 'BOL-2026-08091 Printed / PGI Ready' },
      { category: 'GATE-OUT-02 (DHL Express)', value: '45% Loaded (20/45 HUs)', detail: 'Loading in Progress (Target: 15:45 GMT)' },
      { category: 'GATE-OUT-03 (Dachser)', value: 'Staged (0/52 HUs)', detail: 'Trailer Docking at 15:15 GMT' }
    ],
    recommendedSapActions: [
      { actionName: 'EWM Loading RF Cockpit', tcode: '/SCWM/RF_LOAD', description: 'Scan HU barcodes into carrier trailer with load sequence validation.' },
      { actionName: 'Issue Freight Waybill and PGI', tcode: '/SCWM/GEN_BOL', description: 'Generate Bill of Lading, CMR note, and trigger automated Goods Issue.' }
    ]
  },

  // =========================================================================
  // PILLAR 4: INVENTORY & STOCK (Q31 - Q40)
  // =========================================================================
  {
    questionId: 'Q31',
    questionText: 'Show current stock for a specific material.',
    category: 'Inventory & Stock',
    sapSourceTables: ['/SCWM/QUAN', '/SCWM/LAGP', 'MARD', 'MARA'],
    summaryAnswer: 'For key material 100123 (Microcontroller IC Series 7), total stock across Warehouse WM10 is 1,250 EA (€118,750 value). 1,100 EA is Unrestricted (F2), 100 EA is In Quality Inspection (Q4), and 50 EA is Reserved for active wave picking.',
    keyInsights: [
      'Unrestricted Stock (F2): 1,100 EA located in High-Bay Bins BIN-01-A-04 (600 EA) and BIN-01-A-12 (500 EA).',
      'Quality Inspection Stock (Q4): 100 EA in Inspection Staging QI-01 (Lot 01000049281).',
      'Stock synchronization: S/4HANA IM MARD storage location 1000 is 100% matched with EWM /SCWM/QUAN.'
    ],
    warehouseMetrics: [
      { label: 'Total EWM Stock', value: '1,250 EA', status: 'positive' },
      { label: 'Unrestricted Available', value: '1,100 EA', status: 'positive' },
      { label: 'Quality Inspection Hold', value: '100 EA', status: 'neutral' },
      { label: 'Total Stock Valuation', value: '€118,750', status: 'positive' }
    ],
    breakdownData: [
      { category: 'BIN-01-A-04 (High-Bay Tier 1)', value: '600 EA (F2)', detail: 'Batch: BAT-2026-A1' },
      { category: 'BIN-01-A-12 (High-Bay Tier 2)', value: '500 EA (F2)', detail: 'Batch: BAT-2026-A2' },
      { category: 'QI-01 (Inspection Area)', value: '100 EA (Q4)', detail: 'Lot: 01000049281' }
    ],
    recommendedSapActions: [
      { actionName: 'Warehouse Stock Overview by Material', tcode: '/SCWM/MON_STOCK', description: 'Display stock breakdown by storage type, bin, handling unit, and stock type.' },
      { actionName: 'Display S/4HANA IM Stock Overview', tcode: 'MMBE', description: 'Verify inventory management level stock balances across plant 1710.' }
    ]
  },
  {
    questionId: 'Q32',
    questionText: 'Which materials have low stock levels?',
    category: 'Inventory & Stock',
    sapSourceTables: ['/SCWM/QUAN', '/SCWM/MATLOC', 'MARC', 'MD04'],
    summaryAnswer: '3 high-velocity materials are currently below their configured safety stock thresholds in EWM pick bins: Material 100789 (Thermal Compound - 42 EA vs 100 Safety), Material 100456 (Sensor Module - 85 EA vs 150 Safety), and Material 100567 (Terminal Block - 120 EA vs 200 Safety).',
    keyInsights: [
      'Material 100789: Deficit of 58 EA; Inbound PO 4500019280 arriving today at 15:30 GMT will restore safety buffer.',
      'Material 100456: Deficit of 65 EA; Internal replenishment WT triggered from Bulk Reserve Zone 0010.',
      'Material 100567: Deficit of 80 EA; Automated Purchase Requisition PR-100293 created in MM/PP.'
    ],
    warehouseMetrics: [
      { label: 'Materials Below Safety Stock', value: '3 Materials', status: 'warning' },
      { label: 'Open Replenishment Tasks', value: '2 Tasks', status: 'positive' },
      { label: 'Stockout Risk Level', value: 'LOW (Covered)', status: 'positive' },
      { label: 'Pending PO Quantity', value: '450 Units', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Mat 100789 (Thermal Paste)', value: '42 / 100 EA (-58%)', detail: 'PO 4500019280 Arriving Today' },
      { category: 'Mat 100456 (Sensors)', value: '85 / 150 EA (-43%)', detail: 'Bulk Replenishment in Progress' },
      { category: 'Mat 100567 (Terminals)', value: '120 / 200 EA (-40%)', detail: 'PR-100293 Generated' }
    ],
    recommendedSapActions: [
      { actionName: 'Trigger Internal Replenishment', tcode: '/SCWM/REPL', description: 'Release replenishment warehouse orders to transfer stock from reserve to pick faces.' },
      { actionName: 'Review MRP Stock/Requirements List', tcode: 'MD04', description: 'Inspect MRP planned orders and purchase requisitions in PP/MM.' }
    ]
  },
  {
    questionId: 'Q33',
    questionText: 'Show inventory count discrepancies.',
    category: 'Inventory & Stock',
    sapSourceTables: ['/SCWM/DIFF', '/SCWM/PI_COUNT', '/SCWM/QUAN'],
    summaryAnswer: '2 inventory count variances are currently recorded in the EWM Difference Analyzer (/SCWM/DIFF_ANALYZER): Material 100123 has a -2 EA book difference in BIN-02-B-14 (-€190), and Material 100456 has a +1 EA surplus in BIN-03-A-02 (+€90). Total net absolute variance is €280 (0.02% of zone value).',
    keyInsights: [
      'Doc 2026-PI-0084 (Bin BIN-02-B-14): Book 100 EA, Counted 98 EA (-2 EA / Discrepancy Reason: PICK_OMISSION).',
      'Doc 2026-PI-0085 (Bin BIN-03-A-02): Book 50 EA, Counted 51 EA (+1 EA / Discrepancy Reason: SUPPLIER_OVERPACK).',
      'Variance is well within the €1,000 threshold for autonomous adjustment under supervisor policy.'
    ],
    warehouseMetrics: [
      { label: 'Unresolved PI Differences', value: '2 Items', status: 'warning' },
      { label: 'Net Discrepancy Value', value: '-€100', status: 'neutral' },
      { label: 'Absolute Discrepancy Value', value: '€280', status: 'positive' },
      { label: 'Warehouse Accuracy Index', value: '99.98%', status: 'positive' }
    ],
    breakdownData: [
      { category: 'BIN-02-B-14 (Mat 100123)', value: '-2 EA (-€190)', detail: 'Recount Completed / Awaiting Clear' },
      { category: 'BIN-03-A-02 (Mat 100456)', value: '+1 EA (+€90)', detail: 'Surplus Verified / Awaiting Clear' }
    ],
    recommendedSapActions: [
      { actionName: 'Clear Differences to S/4HANA IM', tcode: '/SCWM/DIFF_ANALYZER', description: 'Post inventory difference to financial ledger (ACDOCA/BSEG) and MM inventory.' },
      { actionName: 'Execute Spot Recount Check', tcode: '/SCWM/PI_REC', description: 'Conduct physical spot recount on neighboring storage bin BIN-02-B-15.' }
    ]
  },
  {
    questionId: 'Q34',
    questionText: 'Which items need cycle counting this week?',
    category: 'Inventory & Stock',
    sapSourceTables: ['/SCWM/PI_DOC', '/SCWM/QUAN', '/SCWM/LAGP'],
    summaryAnswer: '15 storage bins containing Fast-Mover (Class A) inventory items are scheduled for Week 35 cycle counting under the EWM Continuous Cycle Counting program. All 15 bins are located in Zone 0020 (High-Bay) and Zone 0030 (Mezzanine).',
    keyInsights: [
      'Cycle count documents 2026-PI-0091 through 2026-PI-0095 generated in S/4HANA EWM.',
      'Count frequency adherence for Class A inventory is at 100% (monthly cycle frequency).',
      'Counting scheduled for night shift (22:00 - 02:00 GMT) to avoid picking disruption.'
    ],
    warehouseMetrics: [
      { label: 'Bins Scheduled for CC', value: '15 Bins', status: 'positive' },
      { label: 'Class A High-Value Items', value: '8 Materials', status: 'positive' },
      { label: 'CC Schedule Adherence', value: '100.0%', status: 'positive' },
      { label: 'Estimated Count Time', value: '1.5 hours', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Zone 0020 (High-Bay Class A)', value: '10 Bins', detail: 'Materials: 100123, 100456, 100892' },
      { category: 'Zone 0030 (Mezzanine Class A)', value: '5 Bins', detail: 'Materials: 100567, 100789' }
    ],
    recommendedSapActions: [
      { actionName: 'Create Physical Inventory Documents', tcode: '/SCWM/PI_CREATE', description: 'Generate cycle count documents for designated storage types and bins.' },
      { actionName: 'RF Physical Inventory Mobile Entry', tcode: '/SCWM/RF_PI', description: 'Conduct paperless barcode cycle counts on RF handheld terminals.' }
    ]
  },
  {
    questionId: 'Q35',
    questionText: 'Show slow-moving stock.',
    category: 'Inventory & Stock',
    sapSourceTables: ['/SCWM/QUAN', '/SCWM/LAGP', 'MVER', 'MC46'],
    summaryAnswer: '4 material batches totaling €46,800 in valuation have had zero stock movement (no Goods Issue or Transfer Order activity) in the last 180 days: Material 100888 (Gear Assemblies - 35 EA / €18,200), Material 100889 (Stator Coils - 20 EA / €14,400), and Material 100890 (Relay Kits - 80 EA / €14,200).',
    keyInsights: [
      'Material 100888 (Gear Assemblies): Occupying 4 prime high-bay pallet bins in Zone 0020.',
      'Material 100889 (Stator Coils): Zero consumption since March 2026; classified as Dead Stock.',
      'AI Slotting recommendation: Move slow-moving stock to upper High-Bay Tier 5 to free ground bins.'
    ],
    warehouseMetrics: [
      { label: 'Slow-Moving Stock Items', value: '3 Materials', status: 'warning' },
      { label: 'Slow-Moving Stock Valuation', value: '€46,800', status: 'warning' },
      { label: 'Occupied Prime Bins', value: '8 Bins', status: 'warning' },
      { label: 'Days Without Movement', value: '> 180 Days', status: 'warning' }
    ],
    breakdownData: [
      { category: 'Mat 100888 (Gear Assemblies)', value: '35 EA / €18.2k', detail: '184 Days Inactive / Bin: BIN-02-D-01' },
      { category: 'Mat 100889 (Stator Coils)', value: '20 EA / €14.4k', detail: '210 Days Inactive / Bin: BIN-02-D-02' },
      { category: 'Mat 100890 (Relay Kits)', value: '80 EA / €14.2k', detail: '195 Days Inactive / Bin: BIN-03-E-04' }
    ],
    recommendedSapActions: [
      { actionName: 'Execute EWM Slotting & Rearrangement', tcode: '/SCWM/REAR', description: 'Transfer slow movers to remote upper rack tiers to optimize picking travel.' },
      { actionName: 'Inventory Turnover Analysis in MM', tcode: 'MC46', description: 'Analyze slow-moving inventory items and trigger obsolescence review.' }
    ]
  },
  {
    questionId: 'Q36',
    questionText: 'Which stock is nearing expiration?',
    category: 'Inventory & Stock',
    sapSourceTables: ['/SCWM/QUAN', 'MCHA', 'MCH1', '/SCWM/BATCH'],
    summaryAnswer: '2 chemical consumable batches have shelf-life expiration dates (SLED / BBD) within the next 45 days: Material 100789 (Thermal Paste / Batch BAT-2025-C4 - Expiring in 28 days / 40 KG / €3,200) and Material 100910 (Adhesive Epoxy / Batch BAT-2025-E1 - Expiring in 41 days / 25 KG / €2,100).',
    keyInsights: [
      'Batch BAT-2025-C4 (Thermal Paste): Expiration Date 2026-09-22 (28 days remaining).',
      'Batch BAT-2025-E1 (Adhesive Epoxy): Expiration Date 2026-10-05 (41 days remaining).',
      'FEFO (First-Expired, First-Out) picking rule active in EWM search strategy; prioritized for open orders.'
    ],
    warehouseMetrics: [
      { label: 'Batches Expiring < 45 Days', value: '2 Batches', status: 'warning' },
      { label: 'Total Value at Risk', value: '€5,300', status: 'warning' },
      { label: 'FEFO Removal Strategy', value: '100% ENFORCED', status: 'positive' },
      { label: 'Allocated to Open Orders', value: '65%', status: 'positive' }
    ],
    breakdownData: [
      { category: 'BAT-2025-C4 (Thermal Paste)', value: '40 KG / 28 Days Left', detail: 'Exp: 2026-09-22 / Bin: COLD-01-A-02' },
      { category: 'BAT-2025-E1 (Adhesive Epoxy)', value: '25 KG / 41 Days Left', detail: 'Exp: 2026-10-05 / Bin: COLD-01-B-01' }
    ],
    recommendedSapActions: [
      { actionName: 'Batch Expiration Date Overview', tcode: '/SCWM/BATCH', description: 'Monitor shelf life expiration dates (SLED) and remaining shelf life thresholds.' },
      { actionName: 'FEFO Strategy Verification', tcode: '/SCWM/SLED', description: 'Confirm FEFO stock removal rule in storage type search sequence.' }
    ]
  },
  {
    questionId: 'Q37',
    questionText: 'Show stock in quality hold or blocked status.',
    category: 'Inventory & Stock',
    sapSourceTables: ['/SCWM/QUAN', 'QALS', '/SCWM/LAGP'],
    summaryAnswer: 'Total non-unrestricted stock in Warehouse WM10 equals €36,400 across 2 categories: €28,500 in Quality Inspection (Stock Type Q4 - 2 lots) and €7,900 in Blocked Stock (Stock Type B4 - 1 batch damaged in transit).',
    keyInsights: [
      'Stock Type Q4 (Quality Inspection): 50 EA of Sensor Modules (Lot 01000049281) & 40 KG Thermal Paste (Lot 01000049282).',
      'Stock Type B4 (Blocked Stock): 12 EA of Motor Controllers (Mat 100345 / Batch BAT-2026-D1) awaiting vendor RMA credit.',
      'All blocked stock is physically locked from picking and wave assignment.'
    ],
    warehouseMetrics: [
      { label: 'Total Quarantined Stock', value: '€36,400', status: 'neutral' },
      { label: 'Quality Hold (Q4)', value: '€28,500', status: 'neutral' },
      { label: 'Blocked Stock (B4)', value: '€7,900', status: 'warning' },
      { label: 'Picking Lock Enforced', value: '100%', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Q4 Quality Hold (Sensors)', value: '50 EA / €25.3k', detail: 'QI-01 / Lab Inspection Active' },
      { category: 'Q4 Quality Hold (Thermal Paste)', value: '40 KG / €3.2k', detail: 'QI-02 / Viscosity Testing' },
      { category: 'B4 Blocked Stock (Controllers)', value: '12 EA / €7.9k', detail: 'BLOCK-01 / Vendor RMA Return' }
    ],
    recommendedSapActions: [
      { actionName: 'Transfer Posting in EWM', tcode: '/SCWM/POST', description: 'Post stock transfer from Q4/B4 to Unrestricted F2 or Scrap upon authorization.' },
      { actionName: 'QM Inspection Cockpit', tcode: 'QA32', description: 'Review open inspection lots and complete usage decisions.' }
    ]
  },
  {
    questionId: 'Q38',
    questionText: 'Which high-value items have had recent inventory adjustments?',
    category: 'Inventory & Stock',
    sapSourceTables: ['/SCWM/DIFF', 'ACDOCA', 'MSEG', 'MARA'],
    summaryAnswer: 'In the last 30 days, 1 high-value material had an inventory adjustment posted: Material 100892 (Precision Servo Drive - Unit Cost €1,450) had a +1 EA physical adjustment (+€1,450) posted under Difference Doc DIFF-2026-0412 following comprehensive annual cycle count.',
    keyInsights: [
      'Adjustment approved by Warehouse Manager Markus Vance following 3-way recount verification.',
      'Financial journal entry posted to Inventory Gain Account 520000 with universal journal doc reference.',
      'Audit log recorded and verified against SOX compliance internal control requirements.'
    ],
    warehouseMetrics: [
      { label: 'High-Value Adjustments', value: '1 Adjustment', status: 'positive' },
      { label: 'Adjustment Net Value', value: '+€1,450', status: 'positive' },
      { label: 'Manager Sign-off Status', value: 'APPROVED', status: 'positive' },
      { label: 'SOX Compliance Audit', value: 'PASSED', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Mat 100892 (Servo Drive)', value: '+1 EA (+€1,450)', detail: 'Doc: DIFF-2026-0412 / Approved by M. Vance' }
    ],
    recommendedSapActions: [
      { actionName: 'Audit Trail Journal Review', tcode: 'FB03', description: 'Display accounting document posted for inventory physical variance.' },
      { actionName: 'Difference Analyzer Audit Log', tcode: '/SCWM/DIFF_ANALYZER', description: 'Review historical posted differences and approval electronic signatures.' }
    ]
  },
  {
    questionId: 'Q39',
    questionText: 'Show batch-managed inventory details.',
    category: 'Inventory & Stock',
    sapSourceTables: ['MCHA', 'MCH1', '/SCWM/QUAN', '/SCWM/BATCH'],
    summaryAnswer: 'Warehouse WM10 currently manages 8 active batches across 3 batch-managed product lines. 100% of batches have recorded manufacturing dates, expiration dates (SLED), country of origin certificates, and active Quality Status flags in SAP S/4HANA.',
    keyInsights: [
      'Batch BAT-2026-A1 (Mat 100123): 600 EA / SLED: 2028-12-31 / Status: Unrestricted.',
      'Batch BAT-2026-A2 (Mat 100123): 500 EA / SLED: 2029-06-30 / Status: Unrestricted.',
      'Batch BAT-2026-Q1 (Mat 100456): 50 EA / SLED: 2027-08-15 / Status: In QM Inspection.',
      'Batch BAT-2025-C4 (Mat 100789): 40 KG / SLED: 2026-09-22 / Status: In QM Inspection.'
    ],
    warehouseMetrics: [
      { label: 'Active Managed Batches', value: '8 Batches', status: 'positive' },
      { label: 'Batch Traceability Rate', value: '100.0%', status: 'positive' },
      { label: 'Genealogy Tracking', value: 'ACTIVE', status: 'positive' },
      { label: 'Batch Master Integrity', value: 'VERIFIED', status: 'positive' }
    ],
    breakdownData: [
      { category: 'BAT-2026-A1 (Mat 100123)', value: '600 EA / Unrestricted', detail: 'Mfg: 2026-01-10 / Exp: 2028-12-31' },
      { category: 'BAT-2026-A2 (Mat 100123)', value: '500 EA / Unrestricted', detail: 'Mfg: 2026-03-15 / Exp: 2029-06-30' },
      { category: 'BAT-2026-Q1 (Mat 100456)', value: '50 EA / Quality Hold', detail: 'Mfg: 2026-04-01 / Exp: 2027-08-15' }
    ],
    recommendedSapActions: [
      { actionName: 'Batch Master Display', tcode: 'MSC3N', description: 'Inspect batch classification attributes, expiration dates, and inspection lots.' },
      { actionName: 'Batch Where-Used List', tcode: 'MB56', description: 'Perform full forward and backward batch traceability across the supply chain.' }
    ]
  },
  {
    questionId: 'Q40',
    questionText: 'What is the stock turnover rate by storage section?',
    category: 'Inventory & Stock',
    sapSourceTables: ['/SCWM/T331', '/SCWM/QUAN', 'MSEG', 'MC44'],
    summaryAnswer: 'Annualized inventory turnover rate across Warehouse WM10 stands at 8.4 turns/year: Mezzanine Fast-Pick Zone 0030 achieves the highest velocity at 14.2 turns/year, High-Bay Zone 0020 operates at 8.6 turns/year, and Pallet Bulk Zone 0010 operates at 4.8 turns/year.',
    keyInsights: [
      'Zone 0030 (Mezzanine Fast-Pick): 14.2 turns/yr (Benchmark: > 12 turns - High Velocity).',
      'Zone 0020 (High-Bay Shelving): 8.6 turns/yr (Benchmark: 6-10 turns - Healthy).',
      'Zone 0010 (Pallet Bulk Reserve): 4.8 turns/yr (Reserve replenishment buffer).',
      'Average warehouse inventory days of supply (DOS) equals 43.4 days.'
    ],
    warehouseMetrics: [
      { label: 'Overall Warehouse Turns', value: '8.4 Turns/Yr', status: 'positive' },
      { label: 'Fast-Pick Section Turns', value: '14.2 Turns/Yr', status: 'positive' },
      { label: 'Days of Supply (DOS)', value: '43.4 Days', status: 'positive' },
      { label: 'Holding Cost Efficiency', value: 'Optimal', status: 'positive' }
    ],
    breakdownData: [
      { category: '0030 Mezzanine (Fast-Pick)', value: '14.2 Turns/Yr', variance: '+12.4%', detail: 'DOS: 25.7 Days / Velocity: Class A' },
      { category: '0020 High-Bay Racking', value: '8.6 Turns/Yr', variance: '+3.1%', detail: 'DOS: 42.4 Days / Velocity: Class B' },
      { category: '0010 Bulk Reserve', value: '4.8 Turns/Yr', variance: '-1.8%', detail: 'DOS: 76.0 Days / Velocity: Class C' }
    ],
    recommendedSapActions: [
      { actionName: 'Inventory Turnover Analysis in MM', tcode: 'MC44', description: 'Analyze material inventory turns and days of supply metrics.' },
      { actionName: 'Execute Slotting Optimization', tcode: '/SCWM/SLOT', description: 'Recalculate storage section assignments based on trailing 90-day turnover.' }
    ]
  },

  // =========================================================================
  // PILLAR 5: LABOR, CAPACITY & PRODUCTIVITY (Q41 - Q50)
  // =========================================================================
  {
    questionId: 'Q41',
    questionText: 'Show picker productivity today.',
    category: 'Labor, Capacity & Productivity',
    sapSourceTables: ['/SCWM/RSRC', '/SCWM/ORDIM_C', '/SCWM/LOM'],
    summaryAnswer: 'Average picker productivity across 19 active RF resource operators today is 38.4 picks/hour (106.7% of standard engineered labor standard of 36 picks/hour). Top performing operator is Markus Weiss with 46.2 picks/hour in High-Bay Zone 0020.',
    keyInsights: [
      'Top Performer: Markus Vance / Markus Weiss (Resource RF-01) - 46.2 picks/hr (128% of standard).',
      'Team Average: 38.4 picks/hr across 72 completed picking tasks (1,480 items confirmed).',
      'Productivity variance: High-Bay zone (+12% vs standard), Mezzanine small-parts zone (+4% vs standard).'
    ],
    warehouseMetrics: [
      { label: 'Avg Picker Productivity', value: '38.4 Picks/Hr', status: 'positive' },
      { label: 'Engineered Standard Target', value: '36.0 Picks/Hr', status: 'positive' },
      { label: 'Standard Adherence Rate', value: '106.7%', status: 'positive' },
      { label: 'Active RF Pickers', value: '19 Operators', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Markus Weiss (RF-01 / High-Bay)', value: '46.2 Picks/Hr (128%)', detail: '48 Tasks / 0 Errors' },
      { category: 'Elena Fischer (RF-02 / Mezzanine)', value: '42.1 Picks/Hr (117%)', detail: '44 Tasks / 0 Errors' },
      { category: 'Thomas Becker (RF-03 / Bulk)', value: '35.8 Picks/Hr (99%)', detail: '32 Tasks / 0 Errors' }
    ],
    recommendedSapActions: [
      { actionName: 'Labor Management Performance Cockpit', tcode: '/SCWM/LM_PERF', description: 'Evaluate actual vs planned engineered labor standards (ELS) by resource.' },
      { actionName: 'Resource Execution Monitor', tcode: '/SCWM/RSRC', description: 'Monitor live RF scanning pace and task completion timestamps.' }
    ]
  },
  {
    questionId: 'Q42',
    questionText: 'Which warehouse zones have capacity bottlenecks?',
    category: 'Labor, Capacity & Productivity',
    sapSourceTables: ['/SCWM/T331', '/SCWM/LAGP', '/SCWM/ORDIM_O'],
    summaryAnswer: 'Pallet Bulk Storage (Zone 0010) is currently experiencing a capacity bottleneck at 90.0% physical bin utilization (only 120 open bin positions remaining) combined with a high inbound putaway task concentration of 44 pending tasks.',
    keyInsights: [
      'Zone 0010 (Bulk Pallet): 90.0% utilization (1,080 / 1,200 bins occupied) - Critical Threshold: 85%.',
      'Zone 0020 (High-Bay): 85.0% utilization (1,530 / 1,800 bins occupied) - Approaching Alert Level.',
      'Zone 0030 (Mezzanine): 79.3% utilization (714 / 900 bins occupied) - Stable Headroom.'
    ],
    warehouseMetrics: [
      { label: 'Bottleneck Storage Zones', value: '1 Zone (0010)', status: 'negative' },
      { label: 'Zone 0010 Utilization', value: '90.0%', status: 'negative' },
      { label: 'Available Bulk Pallet Bins', value: '120 Bins', status: 'warning' },
      { label: 'Recommended Action', value: 'Dynamic Overflow', status: 'neutral' }
    ],
    breakdownData: [
      { category: '0010 Bulk Storage (Bottleneck)', value: '90.0% (1,080/1,200 Bins)', detail: '44 Tasks Pending / Free: 120' },
      { category: '0020 High-Bay (Warning)', value: '85.0% (1,530/1,800 Bins)', detail: '62 Tasks Pending / Free: 270' },
      { category: '0030 Mezzanine (Normal)', value: '79.3% (714/900 Bins)', detail: '28 Tasks Pending / Free: 186' }
    ],
    recommendedSapActions: [
      { actionName: 'Dynamic Storage Type Overflow Activation', tcode: '/SCWM/T331', description: 'Enable overflow putaway routing to secondary reserve storage type 0015.' },
      { actionName: 'Consolidation & Bin Compaction Run', tcode: '/SCWM/SLOT', description: 'Trigger bin consolidation to merge partial pallets and free 45 bin locations.' }
    ]
  },
  {
    questionId: 'Q43',
    questionText: 'How many workers are active in each zone?',
    category: 'Labor, Capacity & Productivity',
    sapSourceTables: ['/SCWM/RSRC', '/SCWM/USER', '/SCWM/WHO'],
    summaryAnswer: '19 active warehouse workers are currently logged into RF mobile terminals across 4 operational warehouse activity zones: 8 workers in High-Bay Zone 0020, 5 workers in Pallet Bulk Zone 0010, 4 workers in Mezzanine Zone 0030, and 2 workers at Packing Stations.',
    keyInsights: [
      'Zone 0020 (High-Bay Shelving): 8 Resource Operators (Forklift FL-01 to FL-08).',
      'Zone 0010 (Pallet Bulk Storage): 5 Resource Operators (Reach Truck RT-01 to RT-05).',
      'Zone 0030 (Mezzanine Pick Face): 4 Resource Operators (Order Picker OP-01 to OP-04).',
      'PACK (Packing Workcenter): 2 Resource Operators (Packer PK-01 and PK-02).'
    ],
    warehouseMetrics: [
      { label: 'Total Active Workers', value: '19 Operators', status: 'positive' },
      { label: 'Active RF Terminals', value: '19 Devices', status: 'positive' },
      { label: 'Shift Staffing Level', value: '100% (Full)', status: 'positive' },
      { label: 'Workforce Balance Index', value: '94.2%', status: 'positive' }
    ],
    breakdownData: [
      { category: '0020 High-Bay Shelving', value: '8 Workers (42%)', detail: 'Forklift Operators / 62 Open Tasks' },
      { category: '0010 Pallet Bulk Storage', value: '5 Workers (26%)', detail: 'Reach Truck Operators / 44 Tasks' },
      { category: '0030 Mezzanine Small Parts', value: '4 Workers (21%)', detail: 'Manual Cart Pickers / 28 Tasks' },
      { category: 'PACK Packing Workcenter', value: '2 Workers (11%)', detail: 'Station Packers / 14 Tasks' }
    ],
    recommendedSapActions: [
      { actionName: 'Resource Management Queue Cockpit', tcode: '/SCWM/RSRC', description: 'View real-time login status, assigned queues, and battery telemetry of RF devices.' },
      { actionName: 'Rebalance Activity Area Resources', tcode: '/SCWM/RSRC_MAINT', description: 'Reassign 1 operator from Packing to High-Bay picking queue.' }
    ]
  },
  {
    questionId: 'Q44',
    questionText: 'What is the estimated time to complete today’s picking workload?',
    category: 'Labor, Capacity & Productivity',
    sapSourceTables: ['/SCWM/ORDIM_O', '/SCWM/LM_PERF', '/SCWM/RSRC'],
    summaryAnswer: 'Based on 72 remaining picking tasks and current team velocity of 38.4 picks/hour across 8 active pickers, the estimated time to complete all remaining picking workload is 1.4 hours (completion projected at 16:15 GMT), well before the 17:30 GMT shift close.',
    keyInsights: [
      'Total Remaining Picking Tasks: 72 WTs (1,480 line items).',
      'Team picking throughput rate: ~51.2 tasks/hour combined across 8 dedicated pickers.',
      'Projected completion timestamp: 16:15 GMT (75-minute safety cushion before end of shift).'
    ],
    warehouseMetrics: [
      { label: 'Estimated Completion Time', value: '1.4 Hours (16:15 GMT)', status: 'positive' },
      { label: 'Remaining Pick Tasks', value: '72 Tasks', status: 'neutral' },
      { label: 'Team Picking Velocity', value: '51.2 Tasks/Hr', status: 'positive' },
      { label: 'Shift SLA Buffer', value: '+75 mins', status: 'positive' }
    ],
    breakdownData: [
      { category: 'High-Bay Zone 0020 (38 Tasks)', value: '0.8 Hours Remaining', detail: '4 Pickers / Velocity: 48 Tasks/Hr' },
      { category: 'Mezzanine Zone 0030 (24 Tasks)', value: '0.5 Hours Remaining', detail: '3 Pickers / Velocity: 48 Tasks/Hr' },
      { category: 'Bulk Zone 0010 (10 Tasks)', value: '0.2 Hours Remaining', detail: '1 Picker / Velocity: 35 Tasks/Hr' }
    ],
    recommendedSapActions: [
      { actionName: 'EWM Labor Workload Estimation Monitor', tcode: '/SCWM/LM_WORKLOAD', description: 'Simulate picking task completion trajectories based on real-time engineered standards.' },
      { actionName: 'Shift Progress Dashboard', tcode: '/SCWM/MON', description: 'Track task burndown curve in Warehouse Management Cockpit.' }
    ]
  },
  {
    questionId: 'Q45',
    questionText: 'Which tasks have been cancelled today and why?',
    category: 'Labor, Capacity & Productivity',
    sapSourceTables: ['/SCWM/ORDIM_C', '/SCWM/CANCL', '/SCWM/AQLDO'],
    summaryAnswer: '2 warehouse tasks were cancelled today in Warehouse WM10: WT 10084612 was cancelled due to a source storage bin blockage during physical inventory count, and WT 10084615 was cancelled due to a customer sales order line item modification in SD.',
    keyInsights: [
      'WT 10084612 (Picking Mat 100123 / Bin BIN-02-B-14): Cancelled - Bin under Cycle Count Recount (Doc PI-0084). Re-created from Bin BIN-01-A-12.',
      'WT 10084615 (Picking Mat 100789): Cancelled - Customer changed order quantity in SD (Sales Order 1004890).',
      'Both cancellations followed standard EWM cancellation exception handling codes.'
    ],
    warehouseMetrics: [
      { label: 'Cancelled Tasks Today', value: '2 Tasks', status: 'positive' },
      { label: 'Cancellation Rate', value: '0.8%', status: 'positive' },
      { label: 'Re-tasking Automation Rate', value: '100.0%', status: 'positive' },
      { label: 'Unresolved Errors', value: '0 Exceptions', status: 'positive' }
    ],
    breakdownData: [
      { category: 'WT 10084612 (Bin 02-B-14)', value: 'Reason: PI Bin Lock', detail: 'Auto-recreated to BIN-01-A-12' },
      { category: 'WT 10084615 (Order Change)', value: 'Reason: SD Order Mod', detail: 'Stock Returned to Available Pool' }
    ],
    recommendedSapActions: [
      { actionName: 'Cancelled Warehouse Task Audit Log', tcode: '/SCWM/MON_CANC', description: 'Review cancellation codes, timestamps, and initiating user IDs.' },
      { actionName: 'Exception Code Configuration', tcode: '/SCWM/EXC', description: 'Verify automated replenishment and re-determination rules for cancelled tasks.' }
    ]
  },
  {
    questionId: 'Q46',
    questionText: 'Show equipment utilization (forklifts, AGVs).',
    category: 'Labor, Capacity & Productivity',
    sapSourceTables: ['/SCWM/RSRC', '/SCWM/EQUIP', '/SCWM/MFS'],
    summaryAnswer: 'Material handling equipment (MHE) fleet utilization across 12 active assets is averaging 81.2%: 6 High-Reach Forklifts are operating at 88.5% utilization, 4 Autonomous Guided Vehicles (AGVs) are at 78.0% utilization, and 2 High-Bay AS/RS Cranes are at 77.0% utilization.',
    keyInsights: [
      'High-Reach Forklifts (FL-01 to FL-06): 88.5% active utilization / 0 mechanical faults reported.',
      'Autonomous Guided Vehicles (AGV-01 to AGV-04): 78.0% utilization / 100% mission completion rate.',
      'Automated High-Bay Cranes (CRANE-01/02): 77.0% utilization / Telemetry sensor temperatures normal (42°C).'
    ],
    warehouseMetrics: [
      { label: 'Fleet Equipment Utilization', value: '81.2%', status: 'positive' },
      { label: 'Active Equipment Units', value: '12 Assets', status: 'positive' },
      { label: 'Equipment Availability', value: '100.0%', status: 'positive' },
      { label: 'Pending Maintenance Alerts', value: '0 Faults', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Forklift Fleet (6 Units)', value: '88.5% Utilization', detail: 'High-Bay Zone 0020 / FL-03 Peak' },
      { category: 'AGV Fleet (4 Units)', value: '78.0% Utilization', detail: 'Cross-Dock Transit / AGV-02 Active' },
      { category: 'AS/RS Cranes (2 Units)', value: '77.0% Utilization', detail: 'Zone 0010 Bulk Storage' }
    ],
    recommendedSapActions: [
      { actionName: 'Material Flow System (MFS) Telegram Monitor', tcode: '/SCWM/MFS_MON', description: 'Inspect PLC telegram communication and conveyor subsystem status.' },
      { actionName: 'Plant Maintenance Equipment Status in PM', tcode: 'IE03', description: 'Review operating hours and schedule next preventive maintenance interval.' }
    ]
  },
  {
    questionId: 'Q47',
    questionText: 'Which aisles or zones are congested?',
    category: 'Labor, Capacity & Productivity',
    sapSourceTables: ['/SCWM/ORDIM_O', '/SCWM/RSRC', '/SCWM/T331'],
    summaryAnswer: 'Aisle 04 in High-Bay Zone 0020 is currently experiencing moderate traffic congestion with 3 active forklifts (FL-02, FL-03, FL-05) executing concurrent picking and putaway tasks in adjacent rack bays (Bays 12-16).',
    keyInsights: [
      'Zone 0020 / Aisle 04: 3 Forklifts operating within 15 meters; average task latency increased by 6.2 minutes.',
      'AI Dispatch Recommendation: Dynamic aisle lockout routing to detour FL-05 to Aisle 02 for 15 minutes.',
      'Zone 0010 and Zone 0030: Zero traffic congestion detected (traffic density index < 30%).'
    ],
    warehouseMetrics: [
      { label: 'Congested Aisles', value: '1 Aisle (04)', status: 'warning' },
      { label: 'Active Vehicles in Aisle', value: '3 Forklifts', status: 'warning' },
      { label: 'Task Latency Impact', value: '+6.2 mins', status: 'warning' },
      { label: 'Collision Risk Level', value: 'ZERO (Governed)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Zone 0020 - Aisle 04', value: '3 Forklifts Active', detail: 'FL-02, FL-03, FL-05 in Bays 12-16' },
      { category: 'Zone 0020 - Aisle 01-03', value: 'Optimal Flow', detail: '1 Forklift per Aisle' },
      { category: 'Zone 0010 - Bulk Lanes', value: 'Optimal Flow', detail: '2 Reach Trucks Active' }
    ],
    recommendedSapActions: [
      { actionName: 'Activate Dynamic Aisle Restriction', tcode: '/SCWM/AISLE_CTRL', description: 'Enforce max 2 resource limit per high-bay aisle in EWM resource engine.' },
      { actionName: 'Dynamic Task Re-sequencing', tcode: '/SCWM/TO_CREATE', description: 'Re-route upcoming warehouse tasks to alternate access aisles.' }
    ]
  },
  {
    questionId: 'Q48',
    questionText: 'Show replenishment tasks needed to prevent stockouts.',
    category: 'Labor, Capacity & Productivity',
    sapSourceTables: ['/SCWM/REPL', '/SCWM/ORDIM_O', '/SCWM/QUAN', '/SCWM/MATLOC'],
    summaryAnswer: '4 internal replenishment warehouse tasks are actively needed to top off picking bins before afternoon wave execution: 2 tasks for Material 100456 (transferring 100 EA from Bulk 0010 to High-Bay Pick Face BIN-02-B-08) and 2 tasks for Material 100567 (transferring 150 EA to Mezzanine BIN-03-A-04).',
    keyInsights: [
      'Replenishment WT 10085010 (Mat 100456): 50 EA from BIN-01-C-02 to BIN-02-B-08 (Priority 1).',
      'Replenishment WT 10085011 (Mat 100456): 50 EA from BIN-01-C-03 to BIN-02-B-08 (Priority 1).',
      'Replenishment WT 10085012 (Mat 100567): 150 EA from BIN-01-D-01 to BIN-03-A-04 (Priority 2).',
      'Completing these tasks prevents 100% of potential wave picking delays for afternoon shipments.'
    ],
    warehouseMetrics: [
      { label: 'Required Replenishments', value: '4 Tasks', status: 'warning' },
      { label: 'Stockout Prevention Impact', value: '100% Protected', status: 'positive' },
      { label: 'Replenishment Volume', value: '250 Units', status: 'neutral' },
      { label: 'Assigned Operator', value: 'T. Becker (RF-03)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'WT 10085010/11 (Mat 100456)', value: '100 EA to BIN-02-B-08', detail: 'Prevents Wave W-8802 Shortage' },
      { category: 'WT 10085012/13 (Mat 100567)', value: '150 EA to BIN-03-A-04', detail: 'Top-off Pick Face Threshold' }
    ],
    recommendedSapActions: [
      { actionName: 'Execute Automated Replenishment Run', tcode: '/SCWM/REPL', description: 'Trigger planned replenishment calculation based on minimum bin thresholds.' },
      { actionName: 'Confirm Replenishment Tasks', tcode: '/SCWM/TO_CONF', description: 'Confirm bin replenishment on RF terminal to update pick bin available quantity.' }
    ]
  },
  {
    questionId: 'Q49',
    questionText: 'What is the daily dock door turnaround time?',
    category: 'Labor, Capacity & Productivity',
    sapSourceTables: ['/SCWM/DOOR', '/SCWM/DAS', '/SCMTMS/TOR'],
    summaryAnswer: 'Average dock door turnaround time across Inbound and Outbound doors today is 38.5 minutes (11.5 minutes faster than the 50-minute SLA target): Inbound unloading average is 42.0 minutes per truck, and Outbound loading average is 35.0 minutes per trailer.',
    keyInsights: [
      'Inbound Unloading Turnaround: 42.0 mins avg across 5 docked carrier vehicles (Target: < 50 mins).',
      'Outbound Loading Turnaround: 35.0 mins avg across 6 loaded carrier trailers (Target: < 45 mins).',
      'Fastest turnaround: Schenker Trailer TRK-4901 loaded in 28.5 minutes at Door OUT-01.',
      'Zero detention or demurrage penalty fees incurred across all carrier appointments today.'
    ],
    warehouseMetrics: [
      { label: 'Avg Dock Turnaround Time', value: '38.5 mins', status: 'positive' },
      { label: 'SLA Benchmark Target', value: '< 50.0 mins', status: 'positive' },
      { label: 'Turnaround Performance', value: '123% of Target', status: 'positive' },
      { label: 'Carrier Detention Incurred', value: '$0.00', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Inbound Dock Turnaround (5 Trucks)', value: '42.0 mins avg', variance: '-16.0%', detail: 'Doors GATE-IN-01 to 03' },
      { category: 'Outbound Dock Turnaround (6 Trucks)', value: '35.0 mins avg', variance: '-22.2%', detail: 'Doors GATE-OUT-01 to 03' }
    ],
    recommendedSapActions: [
      { actionName: 'Dock Door Performance Analytics', tcode: '/SCWM/MON_DOOR', description: 'Review truck arrival, docking, loading/unloading, and departure timestamps.' },
      { actionName: 'Carrier SLA Compliance Review in TM', tcode: '/SCMTMS/CAR_EVAL', description: 'Audit carrier detention records and on-time performance scores.' }
    ]
  },
  {
    questionId: 'Q50',
    questionText: 'Show warehouse safety and compliance incidents.',
    category: 'Labor, Capacity & Productivity',
    sapSourceTables: ['/SCWM/EHS', 'QM01', 'QALS', '/SCWM/AUDIT'],
    summaryAnswer: 'Warehouse WM10 has operated 142 consecutive days without a lost-time safety incident. Today’s EHS & compliance audit reports 100% adherence: zero HazMat spill alerts, 100% forklift pre-shift safety checklists completed, and zero PPE non-compliance flags.',
    keyInsights: [
      '142 Consecutive Safe Working Days without lost-time accidents (Zero OSHA/DGUV reportables).',
      'Forklift Pre-shift Safety Checks: 12 / 12 electronic safety inspections passed (brakes, hydraulics, lights).',
      'Cold Storage & HazMat Temperature Log: Continuous 4.0°C to 4.2°C holding temperature maintained.',
      '100% Compliance with ISO 9001 and ISO 45001 warehouse safety protocols.'
    ],
    warehouseMetrics: [
      { label: 'Lost-Time Incident-Free Days', value: '142 Days', status: 'positive' },
      { label: 'Forklift Safety Checklist Pass', value: '100.0% (12/12)', status: 'positive' },
      { label: 'HazMat Containment Status', value: '100% COMPLIANT', status: 'positive' },
      { label: 'Active Safety Non-Conformances', value: '0 Incidents', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Forklift Pre-Shift Inspections', value: '12 / 12 Passed', detail: 'Brakes, Horn, Hydraulics, Mast' },
      { category: 'HazMat Spill Containment (Zone 0040)', value: 'Zero Spills', detail: 'Sensors Online / Air Flow Normal' },
      { category: 'PPE Compliance Audits', value: '100% Adherence', detail: 'Steel-toe boots, High-vis vests, Gloves' }
    ],
    recommendedSapActions: [
      { actionName: 'EHS Incident & Safety Cockpit', tcode: 'CBIH82', description: 'Review environmental health and safety incident log and inspection records.' },
      { actionName: 'Audit Compliance Certification Display', tcode: '/SCWM/AUDIT_LOG', description: 'Export ISO 45001 compliance audit trail and equipment inspection logs.' }
    ]
  }
];




