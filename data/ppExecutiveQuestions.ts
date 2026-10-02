import { PpExecutiveQuestionAnswer } from '../types';

export const ALL_PP_EXECUTIVE_QUESTIONS: PpExecutiveQuestionAnswer[] = [
  // =========================================================================
  // PILLAR 1: PRODUCTION PLANNING (Q1 - Q10)
  // =========================================================================
  {
    questionId: 'Q1',
    questionText: "Show today's production schedule.",
    category: 'Production Planning',
    sapSourceTables: ['AFKO', 'AFPO', 'CRHD', 'PLAS', 'TJ02T'],
    summaryAnswer: "Today's production schedule across Plant 1000 comprises 14 active production orders with a total target quantity of 4,850 units across Assembly Lines 1-4 and Machining Cells A/B. Overall scheduled adherence is currently at 94.2% with 2 orders completed ahead of shift change.",
    keyInsights: [
      '14 Production orders scheduled for execution today across Plant 1000.',
      'Order 1004210 (Pump Housing 500kW) is in active assembly on Line 1 with 65% confirmation.',
      'All critical component reservations (RESB) are staged in storage location 0001.'
    ],
    productionMetrics: [
      { label: 'Active Orders', value: '14 Orders', status: 'positive' },
      { label: 'Daily Target', value: '4,850 PC', status: 'positive' },
      { label: 'Schedule Adherence', value: '94.2%', status: 'positive' },
      { label: 'Released (REL)', value: '12 / 14', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Order 1004210 (P-100)', value: '650 / 1000 PC (In Progress)', variance: 'On Track', detail: 'Line 1 (WC-ASSY-01) - Finishes 16:30' },
      { category: 'Order 1004211 (P-200)', value: '800 / 800 PC (Complete)', variance: 'Ahead (+30m)', detail: 'Line 2 (WC-ASSY-02) - Yield 100%' },
      { category: 'Order 1004212 (M-50)', value: '400 / 1200 PC (In Progress)', variance: 'On Track', detail: 'Line 3 (WC-MACH-01) - Shift 2 handover' },
      { category: 'Order 1004213 (E-10)', value: '0 / 600 PC (Released)', variance: 'Pending Setup', detail: 'Line 4 (WC-ASSY-03) - Setup at 14:00' }
    ],
    recommendedSapActions: [
      { actionName: 'Production Order Information System', tcode: 'COOIS', description: 'Display real-time order header, operation status, and goods movement list.' },
      { actionName: 'Capacity Planning Cockpit', tcode: 'CM01', description: 'Check work center workload and scheduled start/finish intervals.' }
    ]
  },
  {
    questionId: 'Q2',
    questionText: 'What production orders are delayed?',
    category: 'Production Planning',
    sapSourceTables: ['AFKO', 'AFPO', 'JEST', 'AFRU', 'BSPA'],
    summaryAnswer: 'Currently, 2 production orders in Plant 1000 are experiencing variance against their planned finish dates: Order 1004188 (Industrial Compressor C-400) is delayed by 4.5 hours due to tool calibration hold, and Order 1004192 is delayed by 2 hours awaiting raw casting batch clearance.',
    keyInsights: [
      'Order 1004188: Target finish delayed from 12:00 to 16:30 (Work Center WC-CNC-04 tool offset drift).',
      'Order 1004192: Delayed awaiting QM inspection lot clearance on incoming steel shaft (ROH-9921).',
      'Mitigation buffer on downstream assembly line prevents customer delivery slippage.'
    ],
    productionMetrics: [
      { label: 'Delayed Orders', value: '2 Orders', status: 'warning' },
      { label: 'Avg Delay Hours', value: '3.25 hrs', status: 'warning' },
      { label: 'Affected Volume', value: '350 PC', status: 'neutral' },
      { label: 'Impact on Customer', value: '0 Late Deliveries', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Order 1004188 (C-400)', value: 'Delayed 4.5h', variance: '-4.5h', detail: 'WC-CNC-04 calibration completed; running at 110% pace' },
      { category: 'Order 1004192 (S-120)', value: 'Delayed 2.0h', variance: '-2.0h', detail: 'QM Lot 010009842 released UD with Accepted status' }
    ],
    recommendedSapActions: [
      { actionName: 'Change Production Order', tcode: 'CO02', description: 'Reschedule operation milestones and dispatch sequence.' },
      { actionName: 'Order Progress Report', tcode: 'CO46', description: 'Review multi-level order tree and dependent component readiness.' }
    ]
  },
  {
    questionId: 'Q3',
    questionText: 'Which orders are at risk of missing their delivery date?',
    category: 'Production Planning',
    sapSourceTables: ['AFKO', 'AFPO', 'VBFA', 'VBAK', 'VBAP'],
    summaryAnswer: 'Out of 48 active production orders tied directly to customer sales orders (MTO), 1 order (Order 1004165 for Sales Order 700142) carries a medium delivery risk due to an unexpected 3-hour machine stoppage on the final test bench. Expedited final packaging is pre-staged to preserve customer OTIF.',
    keyInsights: [
      'Order 1004165 linked to Sales Order 700142 (Customer: Siemens Energy, RDD: Tomorrow 14:00).',
      'Current operation 0040 (Hydrostatic Pressure Test) is 70% complete; estimated finish is 18:00 today.',
      'Outbound delivery 80019234 shipping point staging is reserved on express dock door D-03.'
    ],
    productionMetrics: [
      { label: 'Orders at Risk', value: '1 of 48 MTO', status: 'warning' },
      { label: 'Sales Order Impact', value: '$148,000 USD', status: 'neutral' },
      { label: 'Customer OTIF Risk', value: 'Low (Mitigated)', status: 'positive' },
      { label: 'Expedited Freight', value: 'Pre-Notified', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Order 1004165 / SO 700142', value: 'Est. Ready: 19:00 Today', variance: '-3h Buffer', detail: 'Target customer delivery tomorrow 14:00 (Carrier pre-booked)' }
    ],
    recommendedSapActions: [
      { actionName: 'Sales Order Stock Overview', tcode: 'MD04', description: 'Verify MRP pegging between Sales Order requirement and Production Order supply.' },
      { actionName: 'Outbound Delivery Monitor', tcode: 'VL06O', description: 'Coordinate picking and PGI timing with warehouse operations.' }
    ]
  },
  {
    questionId: 'Q4',
    questionText: 'What should we manufacture today?',
    category: 'Production Planning',
    sapSourceTables: ['PLAF', 'AFKO', 'MARC', 'MD04', 'SAKNR'],
    summaryAnswer: 'Production dispatch recommends manufacturing 5 critical planned order batches totaling 3,200 units across Plant 1000 today based on net requirement calculations, sales order commitments, and min-safety stock replenishment: P-100 (1,000 PC), P-200 (800 PC), M-50 (1,200 PC), and Sub-assembly HALB-30 (200 PC).',
    keyInsights: [
      'Batch 1: 1,000 PC Material P-100 (Planned Order PLAF-8901) converted to Order 1004210.',
      'Batch 2: 800 PC Material P-200 (Planned Order PLAF-8902) converted to Order 1004211.',
      'Batch 3: 1,200 PC Material M-50 (Planned Order PLAF-8903) for intercompany stock transport.',
      'All required raw materials are 100% available in storage location 0001 with zero missing parts.'
    ],
    productionMetrics: [
      { label: 'Recommended SKUs', value: '4 Products', status: 'positive' },
      { label: 'Total Volume', value: '3,200 PC', status: 'positive' },
      { label: 'Component Availability', value: '100% Available', status: 'positive' },
      { label: 'Capacity Fit', value: '88% Workload', status: 'positive' }
    ],
    breakdownData: [
      { category: 'P-100 (Standard Pump)', value: '1,000 PC (Line 1)', variance: 'Sales Need', detail: 'Fulfills SO 700140 & SO 700141' },
      { category: 'P-200 (High-Pressure Pump)', value: '800 PC (Line 2)', variance: 'Safety Replenish', detail: 'Brings stock to 1,200 PC target' },
      { category: 'M-50 (Hydraulic Motor)', value: '1,200 PC (Line 3)', variance: 'STO Demand', detail: 'Supplies Plant 2000 assembly plant' }
    ],
    recommendedSapActions: [
      { actionName: 'Convert Planned Order to Production Order', tcode: 'CO40', description: 'Execute individual planned order conversion with automatic reservation creation.' },
      { actionName: 'Collective Conversion of Planned Orders', tcode: 'CO41', description: 'Mass convert open planned orders by MRP controller and plant.' }
    ]
  },
  {
    questionId: 'Q5',
    questionText: "Show this week's production plan.",
    category: 'Production Planning',
    sapSourceTables: ['AFKO', 'PLAF', 'MDPB', 'MAPR', 'CRHD'],
    summaryAnswer: "This week's master production schedule (Week 35, Plant 1000) targets 26,400 finished and semi-finished units across 68 production orders. Planned machine utilization is 86.4% and assembly labor capacity is scheduled at 91.2%, leaving healthy buffer for rush orders.",
    keyInsights: [
      'Total planned production: 26,400 units (14,200 FERT, 12,200 HALB).',
      'Peak assembly load is scheduled for Wednesday (5,800 units across 3 shifts).',
      'Zero preventive maintenance conflicts detected during core shift operations.'
    ],
    productionMetrics: [
      { label: 'Weekly Volume', value: '26,400 PC', status: 'positive' },
      { label: 'Scheduled Orders', value: '68 Orders', status: 'positive' },
      { label: 'Avg Machine Load', value: '86.4%', status: 'positive' },
      { label: 'Labor Utilization', value: '91.2%', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Monday (Day 1)', value: '4,850 PC scheduled', variance: 'Completed/Active', detail: '14 Orders in progress' },
      { category: 'Tuesday (Day 2)', value: '5,200 PC scheduled', variance: '15 Orders', detail: 'Focus on FERT Pump lines' },
      { category: 'Wednesday (Day 3)', value: '5,800 PC scheduled', variance: '16 Orders', detail: 'Peak load; 3 shifts planned' },
      { category: 'Thursday (Day 4)', value: '5,150 PC scheduled', variance: '12 Orders', detail: 'Hydraulic sub-assemblies' },
      { category: 'Friday (Day 5)', value: '5,400 PC scheduled', variance: '11 Orders', detail: 'Final packaging & weekly stock build' }
    ],
    recommendedSapActions: [
      { actionName: 'Production Planning Table (REM/Shop Floor)', tcode: 'MF50', description: 'View interactive weekly production schedule grid by line and rate.' },
      { actionName: 'Capacity Leveling', tcode: 'CM21', description: 'Level weekly peak work center loads using visual Gantt chart.' }
    ]
  },
  {
    questionId: 'Q6',
    questionText: 'Which production lines have the highest workload?',
    category: 'Production Planning',
    sapSourceTables: ['CRHD', 'CRCA', 'KAKO', 'AFKO', 'PLPO'],
    summaryAnswer: 'Work center WC-ASSY-01 (Final Assembly Line 1) currently exhibits the highest workload in Plant 1000 at 96.8% capacity utilization for the current week, followed by WC-CNC-02 (5-Axis Milling) at 92.4%. Both lines remain within safe thermal and ergonomic thresholds (<100%).',
    keyInsights: [
      'Line 1 (WC-ASSY-01): 96.8% load due to overlapping high-volume P-100 orders.',
      'Line 2 (WC-ASSY-02): 84.1% load with 15.9% available capacity for split-shift overflow.',
      'Milling Cell (WC-CNC-02): 92.4% load; tooling replacement scheduled at weekend changeover.'
    ],
    productionMetrics: [
      { label: 'Highest Line Load', value: '96.8% (Line 1)', status: 'warning' },
      { label: 'Bottleneck Work Center', value: 'WC-ASSY-01', status: 'warning' },
      { label: 'Plant Average Load', value: '84.6%', status: 'positive' },
      { label: 'Overload Alerts', value: '0 (>100%)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'WC-ASSY-01 (Assembly Line 1)', value: '96.8% Capacity Used', variance: 'High Load', detail: '38.7 hrs / 40.0 hrs available' },
      { category: 'WC-CNC-02 (5-Axis CNC Mill)', value: '92.4% Capacity Used', variance: 'Moderate High', detail: '37.0 hrs / 40.0 hrs available' },
      { category: 'WC-ASSY-02 (Assembly Line 2)', value: '84.1% Capacity Used', variance: 'Balanced', detail: '33.6 hrs / 40.0 hrs available' },
      { category: 'WC-PAINT-01 (Automated Paint)', value: '71.5% Capacity Used', variance: 'Ample Headroom', detail: '28.6 hrs / 40.0 hrs available' }
    ],
    recommendedSapActions: [
      { actionName: 'Work Center Capacity Load Overview', tcode: 'CM01', description: 'Inspect standard hours versus available capacity per work center.' },
      { actionName: 'Detailed Capacity Planning', tcode: 'CM25', description: 'Re-assign operations to alternative work centers (e.g. Line 1 to Line 2).' }
    ]
  },
  {
    questionId: 'Q7',
    questionText: "Compare today's production with yesterday's.",
    category: 'Production Planning',
    sapSourceTables: ['AFRU', 'AFKO', 'MSEG', 'MKPF'],
    summaryAnswer: "Today's output across Plant 1000 is running 6.8% higher than yesterday's production at the same shift milestone (3,420 units confirmed today vs. 3,202 units yesterday). Scrap rate decreased from 1.4% to 0.6% following morning tooling recalibration on CNC Line 2.",
    keyInsights: [
      "Total output today (as of 15:00): 3,420 PC confirmed vs 3,202 PC yesterday (+218 PC / +6.8%).",
      'OEE improvement: 88.4% today vs 83.1% yesterday (+5.3 percentage points).',
      'Scrap reduction: Scrap quantity dropped from 45 units yesterday to 21 units today.'
    ],
    productionMetrics: [
      { label: "Today's Confirmed Qty", value: '3,420 PC', status: 'positive' },
      { label: "Yesterday's Confirmed", value: '3,202 PC', status: 'positive' },
      { label: 'Day-over-Day Variance', value: '+6.8%', status: 'positive' },
      { label: 'Scrap Reduction', value: '-0.8% pts', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Assembly Line 1 (P-100)', value: '1,200 PC today vs 1,050 PC yesterday', variance: '+14.3%', detail: 'Zero micro-stops today' },
      { category: 'Assembly Line 2 (P-200)', value: '980 PC today vs 950 PC yesterday', variance: '+3.2%', detail: 'Stable changeover performance' },
      { category: 'Machining Cells (M-50)', value: '1,240 PC today vs 1,202 PC yesterday', variance: '+3.2%', detail: 'Feed rate optimized' }
    ],
    recommendedSapActions: [
      { actionName: 'Display Production Confirmations', tcode: 'CO14', description: 'Review operation-level confirmation timestamps, yield, and scrap logs.' },
      { actionName: 'Shift Performance Cockpit', tcode: 'MC+Q', description: 'Generate comparative shop floor productivity analytics.' }
    ]
  },
  {
    questionId: 'Q8',
    questionText: 'Show production efficiency by plant.',
    category: 'Production Planning',
    sapSourceTables: ['AFKO', 'AFRU', 'CRHD', 'T001W', 'COEP'],
    summaryAnswer: 'Across all manufacturing facilities, Plant 1000 (Walldorf Flagship) leads in Overall Equipment Effectiveness (OEE) at 89.2% with 96.4% schedule adherence. Plant 2000 (Heidelberg Components) stands at 85.7% OEE, while Plant 3000 (Munich Assembly) is at 82.1% due to ongoing line modernization.',
    keyInsights: [
      'Plant 1000 (Walldorf): 89.2% OEE, 96.4% Schedule Adherence, 0.6% Scrap Rate.',
      'Plant 2000 (Heidelberg): 85.7% OEE, 94.1% Schedule Adherence, 1.1% Scrap Rate.',
      'Plant 3000 (Munich): 82.1% OEE, 91.8% Schedule Adherence, 1.8% Scrap Rate.'
    ],
    productionMetrics: [
      { label: 'Plant 1000 OEE', value: '89.2%', status: 'positive' },
      { label: 'Plant 2000 OEE', value: '85.7%', status: 'positive' },
      { label: 'Plant 3000 OEE', value: '82.1%', status: 'neutral' },
      { label: 'Global Average OEE', value: '85.7%', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Plant 1000 - Walldorf', value: '89.2% OEE | $4.2M Weekly Vol', variance: 'Leader', detail: 'Highest automation & continuous flow' },
      { category: 'Plant 2000 - Heidelberg', value: '85.7% OEE | $2.8M Weekly Vol', variance: 'Target', detail: 'High precision machining cells' },
      { category: 'Plant 3000 - Munich', value: '82.1% OEE | $1.9M Weekly Vol', variance: 'Upgrading', detail: 'New AGV line integration underway' }
    ],
    recommendedSapActions: [
      { actionName: 'Standard Plant Analysis', tcode: 'MC.9', description: 'Analyze plant inventory turnover and manufacturing velocity.' },
      { actionName: 'Order Cost Analysis', tcode: 'KOC4', description: 'Review actual versus standard production order cost variance by plant.' }
    ]
  },
  {
    questionId: 'Q9',
    questionText: 'What products are behind schedule?',
    category: 'Production Planning',
    sapSourceTables: ['AFPO', 'AFKO', 'MARA', 'MAKT', 'TJ02T'],
    summaryAnswer: 'Currently, 2 finished product lines have orders tracking behind planned milestone schedules: Material MAT-P100 (Standard Industrial Pump, Order 1004188 - 4.5h behind) and Material MAT-C400 (Compressor Unit, Order 1004195 - 2h behind). All remaining 42 active product families are strictly on or ahead of schedule.',
    keyInsights: [
      'MAT-P100: Order 1004188 (150 PC) delayed due to precision boring tool replacement.',
      'MAT-C400: Order 1004195 (80 PC) delayed due to gasket pre-assembly curing step.',
      'Both delays are contained within plant buffer days; customer ship dates remain protected.'
    ],
    productionMetrics: [
      { label: 'Products Delayed', value: '2 SKUs', status: 'warning' },
      { label: 'On-Time Product Lines', value: '95.5%', status: 'positive' },
      { label: 'Total Delayed Units', value: '230 PC', status: 'neutral' },
      { label: 'Customer Impact', value: '0 Orders Missed', status: 'positive' }
    ],
    breakdownData: [
      { category: 'MAT-P100 (Industrial Pump)', value: '150 PC behind by 4.5h', variance: '-4.5h', detail: 'Final inspection expected at 18:00' },
      { category: 'MAT-C400 (Compressor 400)', value: '80 PC behind by 2.0h', variance: '-2.0h', detail: 'Packaging scheduled for night shift' }
    ],
    recommendedSapActions: [
      { actionName: 'Production Order Progress Report', tcode: 'CO46', description: 'Inspect exact delayed operations and upstream dependent parts.' },
      { actionName: 'Expedite Order Dispatch', tcode: 'CO02', description: 'Flag order priority to High (Priority 1) for immediate shop floor routing.' }
    ]
  },
  {
    questionId: 'Q10',
    questionText: 'Which plants have idle capacity?',
    category: 'Production Planning',
    sapSourceTables: ['CRHD', 'CRCA', 'KAKO', 'TC30A', 'T001W'],
    summaryAnswer: 'Plant 3000 (Munich) currently has the highest available idle capacity at 28.5% across Work Centers WC-SUB-01 and WC-PACK-03, offering immediate capability to absorb 1,500 units of overflow assembly from Plant 1000. Plant 2000 has 14.3% idle capacity in auxiliary milling.',
    keyInsights: [
      'Plant 3000: 28.5% idle capacity (approx. 57 hours of available shift capacity this week).',
      'Plant 2000: 14.3% idle capacity (approx. 28 hours available in finishing cells).',
      'Plant 1000: Near maximum capacity (8.8% buffer only), making Plant 3000 an ideal load-balancing target.'
    ],
    productionMetrics: [
      { label: 'Max Idle Plant', value: 'Plant 3000 (28.5%)', status: 'positive' },
      { label: 'Available Hours', value: '57.0 hrs / week', status: 'positive' },
      { label: 'Overflow Capacity', value: '~1,500 PC', status: 'positive' },
      { label: 'Re-routing Readiness', value: 'Approved in BOM', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Plant 3000 - Assembly Cell 2', value: '32.0% Available', variance: 'Idle Buffer', detail: 'Ready for overflow pump sub-assemblies' },
      { category: 'Plant 3000 - Packaging Line 3', value: '25.0% Available', variance: 'Idle Buffer', detail: 'Can handle bulk carton packaging' },
      { category: 'Plant 2000 - Aux Milling 1', value: '14.3% Available', variance: 'Available', detail: 'Secondary CNC milling capacity' }
    ],
    recommendedSapActions: [
      { actionName: 'Cross-Plant Capacity Evaluation', tcode: 'CM07', description: 'Compare available capacity vs requirement across multiple plants.' },
      { actionName: 'Create Intercompany Stock Transfer', tcode: 'ME21N', description: 'Route planned production orders via Stock Transport Order (UB).' }
    ]
  },

  // =========================================================================
  // PILLAR 2: MRP & MATERIAL PLANNING (Q11 - Q20)
  // =========================================================================
  {
    questionId: 'Q11',
    questionText: 'Run MRP for Plant 1000.',
    category: 'MRP & Material Planning',
    sapSourceTables: ['MD01N', 'PLAF', 'EBAN', 'RESB', 'MDTB'],
    summaryAnswer: 'MRP Live (MD01N) execution for Plant 1000 completed in 4.2 seconds on SAP HANA database engine. The run processed 1,420 materials, created 38 new planned orders, generated 24 purchase requisitions, and balanced all dependent requirements with zero fatal MRP exceptions.',
    keyInsights: [
      'Execution Type: MRP Live on HANA (MD01N) with direct SQL optimization.',
      'Materials processed: 1,420 materials across MRP Controllers 001, 002, 003.',
      'Output: 38 Planned Orders (PLAF), 24 Purchase Requisitions (EBAN), 11 reschedule-in recommendations.'
    ],
    productionMetrics: [
      { label: 'MRP Execution Time', value: '4.2 sec (HANA)', status: 'positive' },
      { label: 'Materials Planned', value: '1,420 SKUs', status: 'positive' },
      { label: 'New Planned Orders', value: '38 Created', status: 'positive' },
      { label: 'New Purchase Req', value: '24 Created', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Finished Goods (FERT)', value: '38 Planned Orders', variance: 'Net Demand', detail: 'Covers sales orders and forecast for next 30 days' },
      { category: 'Raw Materials (ROH)', value: '24 Purchase Reqs', variance: 'Replenishment', detail: 'Total purchase req value: $342,000 USD' },
      { category: 'MRP Exceptions', value: '4 Reschedule Notices', variance: 'Low Impact', detail: 'Messages 10 & 20 (Reschedule in/out)' }
    ],
    recommendedSapActions: [
      { actionName: 'Execute MRP Live', tcode: 'MD01N', description: 'Run MRP Live in background or interactive mode across plant/MRP controller.' },
      { actionName: 'Display MRP List', tcode: 'MD05', description: 'Review static snapshot of MRP run results and exception messages.' }
    ]
  },
  {
    questionId: 'Q12',
    questionText: 'Which materials will run out within the next 7 days?',
    category: 'MRP & Material Planning',
    sapSourceTables: ['MARD', 'RESB', 'MD04', 'MARC', 'EBAN'],
    summaryAnswer: 'Projected stock analysis identifies 2 component materials at risk of depletion within 7 days in Plant 1000 unless purchase orders are expedited: Material MAT-RAW-03 (Micro-Controller Chip) running out in 3.5 days, and Material MAT-SEAL-09 (O-Ring Gasket) running out in 5.2 days.',
    keyInsights: [
      'MAT-RAW-03: Stock = 120 PC, Daily Consumption = 35 PC. Depletion in 3.5 days. Open PO 4500019240 arriving in 2 days.',
      'MAT-SEAL-09: Stock = 450 PC, Daily Consumption = 90 PC. Depletion in 5.2 days. Open PR 10008491 exists.',
      'Auto-expedite alert dispatched to MM Procurement Agent to confirm vendor delivery dates.'
    ],
    productionMetrics: [
      { label: 'Materials at Risk', value: '2 SKUs', status: 'warning' },
      { label: 'Shortest Runway', value: '3.5 Days (RAW-03)', status: 'warning' },
      { label: 'Open Inbound POs', value: '1 PO in Transit', status: 'positive' },
      { label: 'Production Stop Risk', value: 'Low (Inbound ETA < Runway)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'MAT-RAW-03 (Micro-Controller)', value: '120 PC on hand (3.5 days)', variance: 'Critical', detail: 'PO 4500019240 (500 PC) ETA: Day 2' },
      { category: 'MAT-SEAL-09 (O-Ring Gasket)', value: '450 PC on hand (5.2 days)', variance: 'Warning', detail: 'PR 10008491 (1,000 PC) to convert today' },
      { category: 'MAT-CAS-01 (Pump Casing)', value: '890 PC on hand (14.2 days)', variance: 'Healthy', detail: 'Stock exceeds safety buffer' }
    ],
    recommendedSapActions: [
      { actionName: 'Stock / Requirements List', tcode: 'MD04', description: 'Review dynamic stock projection and open reservation consumption.' },
      { actionName: 'Purchase Order Tracking', tcode: 'ME23N', description: 'Check vendor shipping notification (ASN / confirmation control).' }
    ]
  },
  {
    questionId: 'Q13',
    questionText: 'What shortages are affecting production?',
    category: 'MRP & Material Planning',
    sapSourceTables: ['RESB', 'AFKO', 'MARD', 'MARC', 'COGI'],
    summaryAnswer: 'A single component shortage currently affects production staging: Material MAT-RAW-03 (Micro-Controller Unit) is short by 80 units for tomorrow\'s planned Order 1004218. Inbound delivery 180004921 is currently in receiving inspection at Dock 2 and will clear the shortage upon goods receipt posting.',
    keyInsights: [
      'Shortage Object: MAT-RAW-03 (80 PC deficit on Order 1004218).',
      'Mitigating Inbound: Delivery 180004921 (500 PC) arrived 45 minutes ago at Dock Door 2.',
      'Warehouse putaway task is prioritized for immediate line-side replenishment via EWM.'
    ],
    productionMetrics: [
      { label: 'Active Shortages', value: '1 Component', status: 'warning' },
      { label: 'Orders Impacted', value: '1 Order (Tomorrow)', status: 'warning' },
      { label: 'Inbound Staged', value: '500 PC at Dock', status: 'positive' },
      { label: 'Expected Clearance', value: '< 2 Hours', status: 'positive' }
    ],
    breakdownData: [
      { category: 'MAT-RAW-03 on Order 1004218', value: 'Missing 80 PC', variance: 'Dock Clear Req', detail: 'EWM Fast-Track putaway triggered to SLoc 0001' }
    ],
    recommendedSapActions: [
      { actionName: 'Missing Parts Information System', tcode: 'CO24', description: 'Display all missing parts categorized by production order and work center.' },
      { actionName: 'Post Goods Receipt for Inbound Delivery', tcode: 'MIGO', description: 'Post 101 Goods Receipt to immediately release reservations.' }
    ]
  },
  {
    questionId: 'Q14',
    questionText: 'Which planned orders need to be converted?',
    category: 'MRP & Material Planning',
    sapSourceTables: ['PLAF', 'MARC', 'MD04', 'T001W'],
    summaryAnswer: 'In Plant 1000, 6 planned orders have reached their opening horizon date and require immediate conversion into released production orders to initiate component reservation staging: PLAF-8901 through PLAF-8906 representing 4,200 units of scheduled production for the next 48 hours.',
    keyInsights: [
      '6 Planned orders reached Opening Horizon (Within 2 days of planned start).',
      'All 6 planned orders have 100% component availability verified in S/4HANA ATP check.',
      'Converting these planned orders will create valid reservations in table RESB for warehouse staging.'
    ],
    productionMetrics: [
      { label: 'Orders Due Conversion', value: '6 Planned Orders', status: 'positive' },
      { label: 'Planned Volume', value: '4,200 Units', status: 'positive' },
      { label: 'Component ATP Check', value: '100% Passed', status: 'positive' },
      { label: 'Urgency Tier', value: 'Immediate (Next 48h)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'PLAF-8901 (P-100 Pump)', value: '1,000 PC | Start: Tomorrow 06:00', variance: 'Ready', detail: 'Line 1 - ATP Green' },
      { category: 'PLAF-8902 (P-200 Pump)', value: '800 PC | Start: Tomorrow 08:00', variance: 'Ready', detail: 'Line 2 - ATP Green' },
      { category: 'PLAF-8903 (M-50 Motor)', value: '1,200 PC | Start: Tomorrow 10:00', variance: 'Ready', detail: 'Line 3 - ATP Green' },
      { category: 'PLAF-8904 to 8906 (Sub-Assy)', value: '1,200 PC Total', variance: 'Ready', detail: 'Assembly feeder lines' }
    ],
    recommendedSapActions: [
      { actionName: 'Collective Conversion of Planned Orders', tcode: 'CO41', description: 'Execute mass conversion of planned orders by plant and opening date.' },
      { actionName: 'Individual Conversion', tcode: 'CO40', description: 'Convert specific planned order with full routing and BOM explosion review.' }
    ]
  },
  {
    questionId: 'Q15',
    questionText: 'Show all MRP exceptions.',
    category: 'MRP & Material Planning',
    sapSourceTables: ['MDTB', 'MDTC', 'T458A', 'MARC', 'MD04'],
    summaryAnswer: 'The latest MRP run generated 4 minor exception messages in Plant 1000: Two Message 10 (Reschedule In) on PO 4500019240 and PO 4500019242 to pull raw material delivery earlier by 2 days, and Two Message 20 (Reschedule Out) on planned orders due to adjusted customer delivery dates. Zero fatal Message 01 (Cancel order) exceptions exist.',
    keyInsights: [
      'Total exceptions: 4 (0 Critical, 4 Operational/Optimization).',
      'Exception 10 (Reschedule In): PO 4500019240 needs pull-in from Day 7 to Day 5.',
      'Exception 20 (Reschedule Out): Planned order PLAF-8890 shifted out by 3 days matching SO change.'
    ],
    productionMetrics: [
      { label: 'Total Exceptions', value: '4 Messages', status: 'positive' },
      { label: 'Critical Exceptions (01)', value: '0 Exceptions', status: 'positive' },
      { label: 'Reschedule In (10)', value: '2 Purchase Orders', status: 'warning' },
      { label: 'Reschedule Out (20)', value: '2 Planned Orders', status: 'neutral' }
    ],
    breakdownData: [
      { category: 'MAT-RAW-03 / PO 4500019240', value: 'Exception 10 (Reschedule In)', variance: 'Pull in 2 days', detail: 'Needed for accelerated production order' },
      { category: 'MAT-SEAL-09 / PO 4500019242', value: 'Exception 10 (Reschedule In)', variance: 'Pull in 1 day', detail: 'Safety stock recovery' },
      { category: 'MAT-P100 / PLAF-8890', value: 'Exception 20 (Reschedule Out)', variance: 'Push out 3 days', detail: 'Sales order customer requested delay' }
    ],
    recommendedSapActions: [
      { actionName: 'MRP Exception Messages Overview', tcode: 'MD06', description: 'Display and process collective MRP controller exception lists.' },
      { actionName: 'Stock / Requirements Single Item', tcode: 'MD04', description: 'Simulate exception resolution directly in interactive stock list.' }
    ]
  },
  {
    questionId: 'Q16',
    questionText: 'Which purchase requisitions were generated by MRP today?',
    category: 'MRP & Material Planning',
    sapSourceTables: ['EBAN', 'MARC', 'T001W', 'T160'],
    summaryAnswer: 'MRP Live generated 24 Purchase Requisitions (EBAN) in Plant 1000 today with an aggregate procurement valuation of $342,850 USD. The top items include raw stainless steel castings (1,200 KG), copper windings (800 KG), and precision ball bearings (2,500 PC) aligned with planned production orders.',
    keyInsights: [
      '24 Purchase Requisitions created with creation indicator "B" (Generated by MRP).',
      'Total procurement demand value: $342,850 USD across 12 approved vendors.',
      'All 24 PRs have valid source determination (Info Record / Source List) pre-assigned.'
    ],
    productionMetrics: [
      { label: 'PRs Generated Today', value: '24 Requisitions', status: 'positive' },
      { label: 'Total Value (USD)', value: '$342,850', status: 'positive' },
      { label: 'Source List Assigned', value: '24 / 24 (100%)', status: 'positive' },
      { label: 'Target Release Strategy', value: 'Auto-Rel (< $50k)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'PR 10008490 (Steel Castings)', value: '$84,500 USD (1,200 KG)', variance: 'Plant 1000', detail: 'Vendor: ThyssenKrupp Steel' },
      { category: 'PR 10008491 (O-Ring Gaskets)', value: '$12,400 USD (1,000 PC)', variance: 'Plant 1000', detail: 'Vendor: Freudenberg Sealing' },
      { category: 'PR 10008492 (Copper Windings)', value: '$65,200 USD (800 KG)', variance: 'Plant 1000', detail: 'Vendor: Wieland Metals' },
      { category: 'Other 21 Requisitions', value: '$180,750 USD Total', variance: 'Plant 1000', detail: 'Fasteners, electronic chips, housings' }
    ],
    recommendedSapActions: [
      { actionName: 'Display Purchase Requisition List', tcode: 'ME5A', description: 'List open purchase requisitions for assignment and PO conversion.' },
      { actionName: 'Automatic Generation of Purchase Orders', tcode: 'ME59N', description: 'Execute automated PR-to-PO conversion for requisitions with fixed sources.' }
    ]
  },
  {
    questionId: 'Q17',
    questionText: 'What materials have excess inventory?',
    category: 'MRP & Material Planning',
    sapSourceTables: ['MARD', 'MBEW', 'MARC', 'MD04', 'MC44'],
    summaryAnswer: 'Excess stock analysis identified 3 materials in Plant 1000 exceeding 90 days of forward consumption with an aggregate surplus value of $118,500 USD: Material MAT-RAW-99 (Legacy Brass Fitting - 180 days coverage), Material MAT-ACC-04 (Plastic Bezel - 120 days coverage), and MAT-FLG-02 (Heavy Flange).',
    keyInsights: [
      'Total excess inventory value: $118,500 USD tied up in slow-moving raw materials.',
      'MAT-RAW-99: 4,500 units on hand vs 500 units monthly demand (180 days excess).',
      'Recommendation: Transfer surplus MAT-RAW-99 to Plant 2000 or initiate supplier return.'
    ],
    productionMetrics: [
      { label: 'Excess Material SKUs', value: '3 Materials', status: 'warning' },
      { label: 'Tied-Up Working Capital', value: '$118,500 USD', status: 'warning' },
      { label: 'Avg Days of Supply', value: '142 Days', status: 'warning' },
      { label: 'Rebalancing Potential', value: '$84,000 USD (Transfer)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'MAT-RAW-99 (Brass Fitting)', value: '4,500 PC ($54,000 USD)', variance: '180 Days Supply', detail: 'Recommend interplant STO to Plant 2000' },
      { category: 'MAT-ACC-04 (Plastic Bezel)', value: '8,200 PC ($38,500 USD)', variance: '120 Days Supply', detail: 'Adjust safety stock parameters in MM02' },
      { category: 'MAT-FLG-02 (Heavy Flange)', value: '620 PC ($26,000 USD)', variance: '95 Days Supply', detail: 'Consume on upcoming custom build series' }
    ],
    recommendedSapActions: [
      { actionName: 'Inventory Analysis / Dead Stock', tcode: 'MC50', description: 'Analyze slow-moving and dead stock items in plant.' },
      { actionName: 'Change Material Master MRP Parameters', tcode: 'MM02', description: 'Reduce safety stock and reorder point thresholds.' }
    ]
  },
  {
    questionId: 'Q18',
    questionText: 'Why did MRP create planned order [Order Number]?',
    category: 'MRP & Material Planning',
    sapSourceTables: ['PLAF', 'MD04', 'VBAP', 'VBBE', 'RESB'],
    summaryAnswer: 'Planned Order PLAF-8901 was generated by MRP Live (MD01N) on 2026-08-25 to fulfill net requirement deficit for Material MAT-P100 (1,000 PC) caused by pegged Sales Order 700140 (Requirement date: 2026-08-30) after deducting existing unrestricted stock of 200 PC and maintaining minimum safety stock of 100 PC.',
    keyInsights: [
      'Demand Driver: Sales Order 700140 (Customer: BASF AG) for 1,000 PC MAT-P100.',
      'Inventory Equation: Initial Stock (200) - Safety Stock (100) - Gross Requirement (1,000) = Net Deficit (-900 PC).',
      'Lot Sizing Rule: Exact lot size (EX) with rounding value applied generated 1,000 PC order lot.'
    ],
    productionMetrics: [
      { label: 'Target Material', value: 'MAT-P100', status: 'positive' },
      { label: 'Planned Order Lot', value: '1,000 PC', status: 'positive' },
      { label: 'Pegged Demand', value: 'Sales Order 700140', status: 'positive' },
      { label: 'Lead Time Scheduled', value: '2 Days (In-House)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Demand Element', value: 'Sales Order 700140 / Item 10', variance: '-1,000 PC', detail: 'Cust: BASF AG (Delivery: 2026-08-30)' },
      { category: 'Unrestricted Stock', value: 'SLoc 0001 (Plant 1000)', variance: '+200 PC', detail: 'Starting inventory balance' },
      { category: 'Safety Stock Target', value: 'MARC-EISBE', variance: '-100 PC', detail: 'Guaranteed minimum stock buffer' },
      { category: 'Net Requirement Lot', value: 'Planned Order PLAF-8901', variance: '+1,000 PC', detail: 'Scheduled start: 2026-08-26 06:00' }
    ],
    recommendedSapActions: [
      { actionName: 'Pegged Requirements Display', tcode: 'MD09', description: 'Trace upstream customer sales order or forecast pegging for planned order.' },
      { actionName: 'Stock / Requirements List', tcode: 'MD04', description: 'Review complete dynamic MRP element chain.' }
    ]
  },
  {
    questionId: 'Q19',
    questionText: 'Show stock requirements for material [Material Number].',
    category: 'MRP & Material Planning',
    sapSourceTables: ['MD04', 'MARC', 'MARD', 'RESB', 'PLAF', 'VBBE'],
    summaryAnswer: 'Stock/requirements analysis for Material MAT-P100 in Plant 1000 shows total available stock of 450 PC, open customer reservations of 1,800 PC across 3 sales orders, and 2,000 PC in replenishment supply (Order 1004210: 1,000 PC + Planned Order PLAF-8901: 1,000 PC), leaving a healthy projected available balance of +650 PC.',
    keyInsights: [
      'Material: MAT-P100 (Standard Industrial Pump 500kW) in Plant 1000.',
      'Current Unrestricted Stock: 450 PC in storage location 0001.',
      'Total Demand: 1,800 PC (SO 700140, 700141, 700142).',
      'Total Supply: 2,000 PC (1 Active Production Order + 1 Planned Order).'
    ],
    productionMetrics: [
      { label: 'Current Stock', value: '450 PC', status: 'positive' },
      { label: 'Total Open Demand', value: '1,800 PC', status: 'neutral' },
      { label: 'Replenishment Supply', value: '2,000 PC', status: 'positive' },
      { label: 'Projected Available', value: '+650 PC', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Stock on Hand', value: '450 PC', variance: 'Available', detail: 'Plant 1000 / SLoc 0001' },
      { category: 'Production Order 1004210', value: '+1,000 PC', variance: 'In Production', detail: 'Finishes today 16:30' },
      { category: 'Planned Order PLAF-8901', value: '+1,000 PC', variance: 'Planned Supply', detail: 'Start tomorrow 06:00' },
      { category: 'Sales Orders (3 items)', value: '-1,800 PC', variance: 'Customer Demand', detail: 'Delivery dates: 2026-08-28 to 08-30' }
    ],
    recommendedSapActions: [
      { actionName: 'Display Stock/Requirements List', tcode: 'MD04', description: 'Interactive stock/requirements list with ATP and element drilldown.' },
      { actionName: 'Material Overview', tcode: 'MMBE', description: 'Display stock breakdown by plant, storage location, and batch.' }
    ]
  },
  {
    questionId: 'Q20',
    questionText: 'Are there alternate components for unavailable materials?',
    category: 'MRP & Material Planning',
    sapSourceTables: ['STPO', 'MAST', 'MARC', 'AENR', 'EINA'],
    summaryAnswer: 'For component MAT-RAW-03 (Micro-Controller Standard), Alternative Item Group AG-01 in BOM BOM-P100-01 defines Material MAT-RAW-03B (Industrial Grade Micro-Controller) as an approved alternative with 100% functional compatibility and 400 units currently available in SLoc 0002.',
    keyInsights: [
      'Primary Component: MAT-RAW-03 (Stock = 120 PC, 80 PC shortage on Order 1004218).',
      'Alternative Component: MAT-RAW-03B (Stock = 400 PC in SLoc 0002, Priority 2 in Alternative Item Group AG-01).',
      'Substitution Strategy: Auto-switch component in Order 1004218 requires zero engineering redesign.'
    ],
    productionMetrics: [
      { label: 'Primary Material', value: 'MAT-RAW-03', status: 'warning' },
      { label: 'Approved Alternative', value: 'MAT-RAW-03B', status: 'positive' },
      { label: 'Alternative Stock', value: '400 PC Available', status: 'positive' },
      { label: 'Engineering Status', value: 'Fully Released (BOM)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Alternative Group AG-01', value: 'Priority 1: MAT-RAW-03 (Usage 100%)', variance: 'Shortage', detail: '120 PC on hand' },
      { category: 'Alternative Group AG-01', value: 'Priority 2: MAT-RAW-03B (Usage 100%)', variance: 'Available', detail: '400 PC on hand in SLoc 0002' }
    ],
    recommendedSapActions: [
      { actionName: 'Substitute Component in Order', tcode: 'CO02', description: 'Execute component substitution in production order component overview (RESB).' },
      { actionName: 'Display Bill of Material', tcode: 'CS03', description: 'Review alternative item groups and substitution ranking.' }
    ]
  },

  // =========================================================================
  // PILLAR 3: SHOP FLOOR CONTROL & EXECUTION (Q21 - Q30)
  // =========================================================================
  {
    questionId: 'Q21',
    questionText: 'What is the status of production order [Order Number]?',
    category: 'Shop Floor Control & Execution',
    sapSourceTables: ['AFKO', 'AFPO', 'JEST', 'TJ02T', 'AFRU'],
    summaryAnswer: 'Production Order 1004210 (Material MAT-P100, 1,000 PC) is currently in status REL PRT PCNF GMPS (Released, Partially Confirmed, Goods Movement Posted). Operation 0010 (Frame Prep) and 0020 (Sub-assembly) are 100% complete, while Operation 0030 (Final Assembly) is 65% confirmed.',
    keyInsights: [
      'Order Status: REL (Released), PCNF (Partially Confirmed), MACM (Material Committed).',
      'Yield to date: 650 units confirmed with 0 scrap reported.',
      'Estimated order completion timestamp: Today at 16:30 (On schedule for QA transfer).'
    ],
    productionMetrics: [
      { label: 'Order Status', value: 'REL PCNF GMPS', status: 'positive' },
      { label: 'Confirmed Yield', value: '650 / 1,000 PC', status: 'positive' },
      { label: 'Progress Pct', value: '65.0%', status: 'positive' },
      { label: 'Target Finish', value: 'Today 16:30', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Op 0010: Frame Preparation', value: '1,000 PC Confirmed (100%)', variance: 'Complete', detail: 'Work Center: WC-FRAME-01' },
      { category: 'Op 0020: Motor Sub-assembly', value: '1,000 PC Confirmed (100%)', variance: 'Complete', detail: 'Work Center: WC-SUB-01' },
      { category: 'Op 0030: Final Pump Assembly', value: '650 PC Confirmed (65%)', variance: 'In Progress', detail: 'Work Center: WC-ASSY-01' },
      { category: 'Op 0040: Final Testing & Inspection', value: '0 PC Confirmed (0%)', variance: 'Pending Op 30', detail: 'Work Center: WC-TEST-01' }
    ],
    recommendedSapActions: [
      { actionName: 'Display Production Order', tcode: 'CO03', description: 'Review complete order header, operations, components, and costs.' },
      { actionName: 'Enter Order Confirmation', tcode: 'CO11N', description: 'Post operation-level confirmation for remaining 350 units.' }
    ]
  },
  {
    questionId: 'Q22',
    questionText: 'Release all orders scheduled for today.',
    category: 'Shop Floor Control & Execution',
    sapSourceTables: ['AFKO', 'JEST', 'TJ02T', 'RESB'],
    summaryAnswer: 'Mass release batch evaluated 14 production orders scheduled for start today in Plant 1000: 12 orders were already in status REL, and the remaining 2 orders (Order 1004216 and 1004217) have been successfully transitioned from CRTD (Created) to REL (Released) with all shop floor traveler documents printed.',
    keyInsights: [
      '14 of 14 production orders scheduled for today are now in status REL (Released).',
      'Material availability checks executed automatically; zero material shortages found.',
      'Reservations in table RESB activated for EWM warehouse picking dispatch.'
    ],
    productionMetrics: [
      { label: 'Orders Processed', value: '14 Orders', status: 'positive' },
      { label: 'Newly Released', value: '2 Orders (1004216/17)', status: 'positive' },
      { label: 'Previously Released', value: '12 Orders', status: 'positive' },
      { label: 'Material Availability', value: '100% Confirmed', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Order 1004216 (Hydraulic Pump)', value: 'CRTD -> REL', variance: 'Released', detail: 'Line 3 - 600 PC - Shop paper printed' },
      { category: 'Order 1004217 (Valve Assembly)', value: 'CRTD -> REL', variance: 'Released', detail: 'Line 4 - 400 PC - Shop paper printed' }
    ],
    recommendedSapActions: [
      { actionName: 'Mass Processing of Production Orders', tcode: 'COHV', description: 'Execute mass release, availability check, and document printing.' },
      { actionName: 'Release Individual Production Order', tcode: 'CO02', description: 'Inspect and release individual order with detailed log.' }
    ]
  },
  {
    questionId: 'Q23',
    questionText: 'Confirm operation 10 for order [Order Number].',
    category: 'Shop Floor Control & Execution',
    sapSourceTables: ['AFRU', 'AFKO', 'AFVC', 'MSEG'],
    summaryAnswer: 'Operation 0010 (Frame Prep) for Production Order 1004210 has been confirmed via transaction CO11N with a yield of 1,000 PC, 0 scrap, 2.5 standard machine hours, and 2.5 direct labor hours booked against Cost Center CC-PROD-01. Operation status updated to CNF (Confirmed).',
    keyInsights: [
      'Confirmation Number: AFRU-9008210 registered for Order 1004210 / Op 0010.',
      'Yield: 1,000 units posted with zero scrap or rework.',
      'Automatic Goods Issue (Backflush) of raw steel components successfully posted in MSEG.'
    ],
    productionMetrics: [
      { label: 'Confirmed Yield', value: '1,000 PC', status: 'positive' },
      { label: 'Operation Status', value: 'CNF (Confirmed)', status: 'positive' },
      { label: 'Machine Hours Booked', value: '2.5 hrs', status: 'positive' },
      { label: 'Backflush Movement', value: '261 Posted', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Yield Quantity', value: '1,000 PC', variance: '100% Target', detail: 'Passed visual dimensional inspection' },
      { category: 'Labor / Machine Time', value: '2.5h Machine / 2.5h Labor', variance: 'On Standard', detail: 'Cost Center CC-PROD-01 debited' },
      { category: 'Downstream Milestone', value: 'Op 0020 Released for Work', variance: 'Ready', detail: 'Work Center WC-SUB-01' }
    ],
    recommendedSapActions: [
      { actionName: 'Single Screen Confirmation', tcode: 'CO11N', description: 'Enter time ticket confirmation for production order operation.' },
      { actionName: 'Display Confirmation Details', tcode: 'CO14', description: 'Inspect confirmed actual times, quantities, and material documents.' }
    ]
  },
  {
    questionId: 'Q24',
    questionText: 'Show all unconfirmed operations for today.',
    category: 'Shop Floor Control & Execution',
    sapSourceTables: ['AFVC', 'AFKO', 'AFPO', 'JEST', 'TJ02T'],
    summaryAnswer: 'Across Plant 1000 today, 6 operations remain unconfirmed on scheduled production orders: 4 operations are actively in progress on shop floor lines (Op 0030 on Line 1, Op 0020 on Line 3, Op 0010 on Line 4), and 2 final packaging operations are queued for the incoming evening shift.',
    keyInsights: [
      '6 operations pending completion out of 42 daily scheduled operations (85.7% completed).',
      'All 4 active operations are within their planned processing time windows.',
      'Evening shift handover packet generated with specific target completion queues.'
    ],
    productionMetrics: [
      { label: 'Unconfirmed Operations', value: '6 Operations', status: 'positive' },
      { label: 'Completed Operations', value: '36 / 42 (85.7%)', status: 'positive' },
      { label: 'Active In-Progress', value: '4 Operations', status: 'positive' },
      { label: 'Evening Shift Queue', value: '2 Operations', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Order 1004210 - Op 0030 (Final Assembly)', value: '65% Complete', variance: 'Active', detail: 'Line 1 - Finishes 16:30' },
      { category: 'Order 1004210 - Op 0040 (Testing)', value: '0% (Queued)', variance: 'Waiting Op 30', detail: 'Test Bench 1 - Shift 2' },
      { category: 'Order 1004212 - Op 0020 (Milling)', value: '50% Complete', variance: 'Active', detail: 'Line 3 - Finishes 17:00' },
      { category: 'Order 1004213 - Op 0010 (Winding)', value: '20% Complete', variance: 'Active', detail: 'Line 4 - Finishes 18:30' }
    ],
    recommendedSapActions: [
      { actionName: 'Operation Overview Cockpit', tcode: 'COOIS', description: 'Filter orders by Operation Level with status not equal to CNF.' },
      { actionName: 'Collective Confirmation', tcode: 'CO12', description: 'Mass confirm multiple finished operations at shift handover.' }
    ]
  },
  {
    questionId: 'Q25',
    questionText: 'Which work centers have reported breakdowns?',
    category: 'Shop Floor Control & Execution',
    sapSourceTables: ['CRHD', 'QMIH', 'QMEL', 'VIQMEL', 'EQUI'],
    summaryAnswer: 'Only 1 work center in Plant 1000 is currently under maintenance notification: Work Center WC-CNC-04 (5-Axis CNC Milling) logged Maintenance Notification 10029841 at 10:15 today due to spindle coolant pressure drop. Maintenance technicians have completed repairs and line test run is 90% complete.',
    keyInsights: [
      'Work Center WC-CNC-04: Breakdown notification 10029841 (PM01 - Corrective Maintenance).',
      'Total downtime: 1.5 hours (Within planned 2-hour maintenance buffer).',
      'Zero other work centers reporting micro-stops or breakdowns across Plant 1000.'
    ],
    productionMetrics: [
      { label: 'Active Breakdowns', value: '1 Work Center', status: 'warning' },
      { label: 'Work Center ID', value: 'WC-CNC-04', status: 'warning' },
      { label: 'Downtime Duration', value: '1.5 hrs (Resolved)', status: 'positive' },
      { label: 'Plant Availability', value: '97.2%', status: 'positive' }
    ],
    breakdownData: [
      { category: 'WC-CNC-04 (Milling Cell 4)', value: 'Notification 10029841', variance: 'Test Run', detail: 'Coolant valve replaced; returning to full production at 15:30' }
    ],
    recommendedSapActions: [
      { actionName: 'Display Maintenance Notification', tcode: 'IW23', description: 'Review maintenance breakdown details, cause codes, and technician remarks.' },
      { actionName: 'Work Center Capacity Change', tcode: 'CR02', description: 'Adjust work center operating hours if maintenance exceeds shift.' }
    ]
  },
  {
    questionId: 'Q26',
    questionText: 'Show scrap rates for the current shift.',
    category: 'Shop Floor Control & Execution',
    sapSourceTables: ['AFRU', 'AFKO', 'MSEG', 'MKPF', 'T001W'],
    summaryAnswer: 'Current shift scrap rate in Plant 1000 is exceptionally low at 0.61% of total production volume (21 scrap units out of 3,420 confirmed units), significantly better than the plant target ceiling of 1.5%. Scrap is localized to minor raw casting porosity on CNC Line 2.',
    keyInsights: [
      'Current Shift Scrap Rate: 0.61% (21 scrap units / 3,420 confirmed units).',
      'Plant Target: < 1.50% (Favorable variance of 0.89 percentage points).',
      'Financial scrap cost for current shift: $480 USD (Under budget allowance of $1,800 USD).'
    ],
    productionMetrics: [
      { label: 'Current Shift Scrap', value: '0.61%', status: 'positive' },
      { label: 'Plant Scrap Target', value: '< 1.50%', status: 'positive' },
      { label: 'Scrap Units', value: '21 PC', status: 'positive' },
      { label: 'Scrap Cost Impact', value: '$480 USD', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Assembly Line 1 (P-100)', value: '4 PC Scrap (0.33%)', variance: 'Excellent', detail: 'Gasket seal pinch during torque' },
      { category: 'Assembly Line 2 (P-200)', value: '5 PC Scrap (0.51%)', variance: 'Excellent', detail: 'Minor wiring connector damage' },
      { category: 'Machining Line 3 (M-50)', value: '12 PC Scrap (0.97%)', variance: 'Normal', detail: 'Raw casting surface porosity (Vendor Thyssen)' }
    ],
    recommendedSapActions: [
      { actionName: 'Scrap Analysis Report', tcode: 'MC+E', description: 'Display scrap rate trends by material, work center, and defect cause code.' },
      { actionName: 'Create Quality Notification', tcode: 'QM01', description: 'Log vendor defect notification for recurring casting porosity.' }
    ]
  },
  {
    questionId: 'Q27',
    questionText: 'What is the yield for production line [Line ID]?',
    category: 'Shop Floor Control & Execution',
    sapSourceTables: ['AFRU', 'AFKO', 'CRHD', 'PLAS'],
    summaryAnswer: 'Production Line 1 (Work Center WC-ASSY-01) has achieved a First-Pass Yield of 99.67% for the current operational cycle, with 1,200 units confirmed, 4 units scrapped, and zero rework orders required. Total standard throughput rate is 150 units/hour against the nominal line design of 145 units/hour.',
    keyInsights: [
      'Line 1 (WC-ASSY-01): First-Pass Yield = 99.67% (1,196 good parts / 1,200 processed).',
      'Throughput Pace: 150 PC/hr (+3.4% above rated 145 PC/hr baseline).',
      'Zero safety incidents or ergonomic alerts logged during the current run.'
    ],
    productionMetrics: [
      { label: 'First-Pass Yield', value: '99.67%', status: 'positive' },
      { label: 'Total Confirmed', value: '1,200 PC', status: 'positive' },
      { label: 'Good Units', value: '1,196 PC', status: 'positive' },
      { label: 'Scrap Units', value: '4 PC', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Shift 1 (Morning)', value: '600 PC / 2 Scrap (99.67% Yield)', variance: 'Target Met', detail: 'Pacing: 150 PC/hr' },
      { category: 'Shift 2 (Afternoon)', value: '600 PC / 2 Scrap (99.67% Yield)', variance: 'Target Met', detail: 'Pacing: 150 PC/hr' }
    ],
    recommendedSapActions: [
      { actionName: 'Work Center Confirmation History', tcode: 'CO14', description: 'Inspect granular confirmation logs for Line 1.' },
      { actionName: 'Shop Floor Information System', tcode: 'MC+M', description: 'Evaluate multi-week yield and utilization trends for Line 1.' }
    ]
  },
  {
    questionId: 'Q28',
    questionText: 'Are there any safety holds on production?',
    category: 'Shop Floor Control & Execution',
    sapSourceTables: ['JEST', 'TJ02T', 'AFKO', 'QALS', 'QAVE'],
    summaryAnswer: 'There are currently ZERO safety holds or quality quarantine locks active on any production line or released production orders in Plant 1000. All 14 scheduled orders carry valid material release flags and zero EHS (Environment, Health & Safety) interlocking blocks.',
    keyInsights: [
      'Zero safety stops or EHS interlock holds in Plant 1000.',
      'All 8 Inspection Lots (QALS) for in-process production are in status UD (Usage Decision Approved).',
      'Lock table inspection confirms zero user or batch-level quarantine holds.'
    ],
    productionMetrics: [
      { label: 'Safety Holds', value: '0 Active Holds', status: 'positive' },
      { label: 'EHS Interlocks', value: 'All Clear (Green)', status: 'positive' },
      { label: 'Quality Quarantines', value: '0 Lots Blocked', status: 'positive' },
      { label: 'Line Safety Score', value: '100 / 100', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Assembly Lines (1-4)', value: 'No Holds', variance: 'Clear', detail: 'Full clearance granted' },
      { category: 'Machining Cells (A/B)', value: 'No Holds', variance: 'Clear', detail: 'Guard interlocks tested & verified' },
      { category: 'Paint & Surface Treatment', value: 'No Holds', variance: 'Clear', detail: 'Ventilation & VOC levels normal' }
    ],
    recommendedSapActions: [
      { actionName: 'Display Inspection Lots', tcode: 'QA33', description: 'Verify quality inspection lot status and usage decisions.' },
      { actionName: 'System Status Inspection', tcode: 'CO03', description: 'Inspect system status string for order locks (e.g. LKD, BLKD).' }
    ]
  },
  {
    questionId: 'Q29',
    questionText: 'Show goods issue status for order [Order Number].',
    category: 'Shop Floor Control & Execution',
    sapSourceTables: ['RESB', 'MSEG', 'AFKO', 'AUFM'],
    summaryAnswer: 'Goods issue status for Production Order 1004210 is 100% issued for all 5 required BOM components (Movement type 261 posted for 1,000 PC frame housings, 1,000 PC stators, 1,000 PC impellers, 2,000 PC bearings, and 1,000 PC seal rings). Zero open reservation quantities remain in table RESB.',
    keyInsights: [
      'Total components required: 5 items in table RESB.',
      'Withdrawal Status: Final Issue (RESB-KZEAR = "X") posted for all 5 items.',
      'Total actual material cost debited to Order 1004210: $48,200 USD (Movement type 261).'
    ],
    productionMetrics: [
      { label: 'Goods Issue Status', value: '100% Issued (Complete)', status: 'positive' },
      { label: 'Components Issued', value: '5 of 5 Items', status: 'positive' },
      { label: 'Material Doc Created', value: 'Doc 4900182910', status: 'positive' },
      { label: 'Actual Cost Debited', value: '$48,200 USD', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Item 0010: Cast Frame (MAT-CAS-01)', value: '1,000 PC Issued', variance: '100%', detail: 'Mat Doc 4900182910 / Mvt 261' },
      { category: 'Item 0020: Stator Assembly (MAT-STA-02)', value: '1,000 PC Issued', variance: '100%', detail: 'Mat Doc 4900182910 / Mvt 261' },
      { category: 'Item 0030: Steel Impeller (MAT-IMP-01)', value: '1,000 PC Issued', variance: '100%', detail: 'Mat Doc 4900182910 / Mvt 261' },
      { category: 'Item 0040: Ball Bearings (MAT-BRG-04)', value: '2,000 PC Issued', variance: '100%', detail: 'Mat Doc 4900182910 / Mvt 261' }
    ],
    recommendedSapActions: [
      { actionName: 'Display Material Documents for Order', tcode: 'MIGO', description: 'Review goods movement history under reference Production Order.' },
      { actionName: 'Display Production Order Components', tcode: 'CO03', description: 'Inspect reservation withdrawal quantities and open balances.' }
    ]
  },
  {
    questionId: 'Q30',
    questionText: 'Can we split order [Order Number] to expedite delivery?',
    category: 'Shop Floor Control & Execution',
    sapSourceTables: ['AFKO', 'AFPO', 'AFRU', 'CRHD', 'T001W'],
    summaryAnswer: 'Yes. Production Order 1004210 (1,000 units total, 650 units currently confirmed on Op 0030) can be split into Child Order 1004210-B for the remaining 350 units. Splitting allows immediate release and shipping of the 650 completed units to fulfill priority Sales Order 700140 18 hours ahead of schedule.',
    keyInsights: [
      'Parent Order: 1004210 reduced to 650 PC (Immediate completion and PGI).',
      'Child Order: 1004210-B created for 350 PC with new split start point at Op 0030.',
      'Customer Impact: Delivers 650 units to customer BASF AG today instead of waiting for full batch.'
    ],
    productionMetrics: [
      { label: 'Split Feasibility', value: 'Approved (Technical)', status: 'positive' },
      { label: 'Parent Batch (Ready)', value: '650 PC (Ship Today)', status: 'positive' },
      { label: 'Child Batch (New)', value: '350 PC (Ship Tomorrow)', status: 'positive' },
      { label: 'Time Advantage', value: '+18 Hours Ahead', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Parent Order 1004210 (650 PC)', value: 'TECO & Ship Today', variance: 'Expedited', detail: 'Transfers 650 PC to SLoc 0001 immediately' },
      { category: 'Child Order 1004210-B (350 PC)', value: 'Finish Tomorrow 12:00', variance: 'Normal Pace', detail: 'Inherits remaining raw materials from parent' }
    ],
    recommendedSapActions: [
      { actionName: 'Order Split Execution', tcode: 'CO02', description: 'Execute Order Split from operation menu to generate child production order.' },
      { actionName: 'Order Progress Review', tcode: 'CO46', description: 'Verify split hierarchy and linked sales order delivery schedule.' }
    ]
  },

  // =========================================================================
  // PILLAR 4: CAPACITY PLANNING (Q31 - Q40)
  // =========================================================================
  {
    questionId: 'Q31',
    questionText: 'What is the capacity utilization for work center [Work Center]?',
    category: 'Capacity Planning',
    sapSourceTables: ['CRHD', 'CRCA', 'KAKO', 'KBED', 'KBEZ'],
    summaryAnswer: 'Work center WC-ASSY-01 (Final Assembly Line 1) currently exhibits an 88.5% capacity utilization rate for the current week (35.4 operating hours committed against 40.0 available hours across 5 standard 8-hour single shifts). This represents an optimal operating zone with zero overtime required.',
    keyInsights: [
      'Work Center: WC-ASSY-01 / Category: 0001 (Machine & Labor).',
      'Capacity Supply: 40.0 hours (1 shift x 8 hrs x 5 days, 100% capacity utilization factor).',
      'Capacity Demand: 35.4 hours booked across 6 scheduled production orders.'
    ],
    productionMetrics: [
      { label: 'Capacity Utilization', value: '88.5%', status: 'positive' },
      { label: 'Available Hours', value: '40.0 hrs / week', status: 'positive' },
      { label: 'Committed Hours', value: '35.4 hrs / week', status: 'positive' },
      { label: 'Remaining Buffer', value: '4.6 hrs (11.5%)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Order 1004210 (P-100)', value: '12.5 hrs booked', variance: '35.3% of load', detail: 'Final assembly batch 1,000 PC' },
      { category: 'Order 1004214 (P-150)', value: '10.2 hrs booked', variance: '28.8% of load', detail: 'Standard assembly batch 800 PC' },
      { category: 'Order 1004219 (P-100)', value: '12.7 hrs booked', variance: '35.9% of load', detail: 'Scheduled for Thursday' }
    ],
    recommendedSapActions: [
      { actionName: 'Work Center Capacity Load Overview', tcode: 'CM01', description: 'Review period-wise capacity demand versus available capacity.' },
      { actionName: 'Display Work Center', tcode: 'CR03', description: 'Review standard operating formulas, capacity header, and shifts.' }
    ]
  },
  {
    questionId: 'Q32',
    questionText: 'Show capacity bottlenecks for next week.',
    category: 'Capacity Planning',
    sapSourceTables: ['CRCA', 'KAKO', 'KBED', 'AFKO', 'PLPO'],
    summaryAnswer: 'Capacity bottleneck simulation for Next Week (Week 36, Plant 1000) highlights 1 critical work center overload: Work Center WC-CNC-02 (5-Axis CNC Milling) is booked at 108.5% capacity (43.4 hrs requested vs 40.0 hrs available), driven by a surge in customized hydraulic valve orders.',
    keyInsights: [
      'Bottleneck Work Center: WC-CNC-02 (108.5% Load / 3.4 hours deficit).',
      'Root Cause: Simultaneous scheduling of 3 high-precision milling orders on Tuesday/Wednesday.',
      'Resolution: Offload Order 1004225 (4.0 hrs) to secondary milling center WC-CNC-03 (currently at 68% load).'
    ],
    productionMetrics: [
      { label: 'Bottlenecks Detected', value: '1 Work Center', status: 'warning' },
      { label: 'Overload Work Center', value: 'WC-CNC-02', status: 'warning' },
      { label: 'Peak Overload Pct', value: '108.5% (+3.4h)', status: 'warning' },
      { label: 'Alternate Capacity', value: 'WC-CNC-03 (68% Load)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'WC-CNC-02 (5-Axis Mill)', value: '108.5% Load (43.4h / 40h)', variance: 'Overloaded', detail: 'Requires load leveling or 4h overtime' },
      { category: 'WC-CNC-03 (Secondary Mill)', value: '68.0% Load (27.2h / 40h)', variance: 'Ample Buffer', detail: 'Can absorb 12.8 hours of overflow' },
      { category: 'WC-ASSY-01 (Assembly Line 1)', value: '92.0% Load (36.8h / 40h)', variance: 'Optimal', detail: 'Within normal operating limits' }
    ],
    recommendedSapActions: [
      { actionName: 'Graphical Capacity Leveling', tcode: 'CM21', description: 'Drag-and-drop operations from WC-CNC-02 to WC-CNC-03 in leveling board.' },
      { actionName: 'Capacity Overload List', tcode: 'CM02', description: 'List all work centers exceeding 100% capacity threshold.' }
    ]
  },
  {
    questionId: 'Q33',
    questionText: 'Which work centers are overloaded?',
    category: 'Capacity Planning',
    sapSourceTables: ['CRHD', 'CRCA', 'KAKO', 'KBED', 'T001W'],
    summaryAnswer: 'Across Plant 1000, zero work centers are overloaded for the current shift. For next week\'s plan, only WC-CNC-02 is overloaded at 108.5%, while all other 18 work centers across machining, assembly, winding, painting, and test bays remain below the 95% operating threshold.',
    keyInsights: [
      'Current Shift: 0 overloaded work centers (All lines < 97%).',
      'Next Week Outlook: 1 work center (WC-CNC-02 at 108.5%).',
      'Average plant capacity load: 82.4% across all 19 active work centers.'
    ],
    productionMetrics: [
      { label: 'Overloaded Centers (Now)', value: '0 Work Centers', status: 'positive' },
      { label: 'Overloaded Centers (Next Wk)', value: '1 Work Center', status: 'warning' },
      { label: 'Plant Average Load', value: '82.4%', status: 'positive' },
      { label: 'Capacity Health Score', value: '94.8%', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Machining Work Centers (5 units)', value: 'Avg 86.2% Load', variance: 'WC-CNC-02 peak', detail: 'Offloading plan formulated' },
      { category: 'Assembly Lines (4 lines)', value: 'Avg 84.1% Load', variance: 'Balanced', detail: 'Line 1: 88.5%, Line 2: 81.2%' },
      { category: 'Test & Packaging Bays (6 bays)', value: 'Avg 74.0% Load', variance: 'Healthy', detail: 'Buffer ready for end-of-week spikes' }
    ],
    recommendedSapActions: [
      { actionName: 'Capacity Leveling by Work Center', tcode: 'CM25', description: 'Execute automated finite scheduling algorithm.' },
      { actionName: 'Work Center Capacity Evaluation', tcode: 'CM01', description: 'Inspect daily bucket utilization for overloaded work centers.' }
    ]
  },
  {
    questionId: 'Q34',
    questionText: 'Can work center [Work Center A] take load from [Work Center B]?',
    category: 'Capacity Planning',
    sapSourceTables: ['CRHD', 'PLPO', 'MAPL', 'CRCA', 'KAKO'],
    summaryAnswer: 'Yes. Work Center WC-CNC-03 (Secondary CNC Mill) has 12.8 hours of available capacity next week and is qualified in Routing Profile RT-VALVE-02 to execute operations for Order 1004225 (4.0 hours), reducing WC-CNC-02\'s load from 108.5% down to an optimal 98.5%.',
    keyInsights: [
      'Work Center B (WC-CNC-02): Load = 108.5% (43.4 hrs) -> Overloaded.',
      'Work Center A (WC-CNC-03): Load = 68.0% (27.2 hrs) -> 12.8 hrs spare capacity.',
      'Technical Compatibility: Tooling, spindle speed, and operator qualification 100% matched.'
    ],
    productionMetrics: [
      { label: 'Re-routing Feasibility', value: '100% Compatible', status: 'positive' },
      { label: 'Transferred Load', value: '4.0 Hours', status: 'positive' },
      { label: 'WC-CNC-02 New Load', value: '98.5% (Balanced)', status: 'positive' },
      { label: 'WC-CNC-03 New Load', value: '78.0% (Optimal)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'WC-CNC-02 Before Shift', value: '43.4 hrs / 40.0 hrs (108.5%)', variance: 'Overload', detail: 'Order 1004225 scheduled' },
      { category: 'WC-CNC-02 After Shift', value: '39.4 hrs / 40.0 hrs (98.5%)', variance: 'Optimal', detail: 'Safe operating margin' },
      { category: 'WC-CNC-03 After Shift', value: '31.2 hrs / 40.0 hrs (78.0%)', variance: 'Balanced', detail: 'Absorbs Order 1004225 with zero overtime' }
    ],
    recommendedSapActions: [
      { actionName: 'Change Production Order Operation', tcode: 'CO02', description: 'Reassign operation 0020 work center from WC-CNC-02 to WC-CNC-03.' },
      { actionName: 'Capacity Planning Table', tcode: 'CM21', description: 'Visually verify updated Gantt chart workload distribution.' }
    ]
  },
  {
    questionId: 'Q35',
    questionText: 'What is the available capacity for Plant 1000 next month?',
    category: 'Capacity Planning',
    sapSourceTables: ['CRCA', 'KAKO', 'KBEZ', 'TC30A', 'T001W'],
    summaryAnswer: 'For next month (September 2026, 22 working days), Plant 1000 has a total available machine and labor capacity of 3,520 standard hours across 20 operational work centers. Total planned orders and forecast demand currently commit 2,890 hours (82.1% utilization), leaving 630 hours of uncommitted capacity for ad-hoc customer orders.',
    keyInsights: [
      'Total Plant Capacity: 3,520 hours (22 working days x 8 hours/day x 20 centers).',
      'Committed Demand: 2,890 hours (Planned Orders: 1,950h, Production Orders: 940h).',
      'Uncommitted Headroom: 630 hours (17.9% available for new sales order intake).'
    ],
    productionMetrics: [
      { label: 'Total Available Hours', value: '3,520 Hours', status: 'positive' },
      { label: 'Committed Capacity', value: '2,890 Hours (82.1%)', status: 'positive' },
      { label: 'Uncommitted Capacity', value: '630 Hours (17.9%)', status: 'positive' },
      { label: 'Working Days in Month', value: '22 Days', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Assembly Department (Lines 1-4)', value: '704 hrs available / 590 hrs booked', variance: '83.8% Load', detail: '114 hrs open capacity' },
      { category: 'Machining Department (Cells A-D)', value: '880 hrs available / 748 hrs booked', variance: '85.0% Load', detail: '132 hrs open capacity' },
      { category: 'Sub-assembly & Winding', value: '1,056 hrs available / 820 hrs booked', variance: '77.7% Load', detail: '236 hrs open capacity' },
      { category: 'Packaging & Final Test', value: '880 hrs available / 732 hrs booked', variance: '83.2% Load', detail: '148 hrs open capacity' }
    ],
    recommendedSapActions: [
      { actionName: 'Long-Term Planning Capacity Evaluation', tcode: 'MS04', description: 'Evaluate monthly capacity utilization under LTP simulated scenarios.' },
      { actionName: 'Work Center Capacity Load Overview', tcode: 'CM01', description: 'Review monthly bucket view for Plant 1000.' }
    ]
  },
  {
    questionId: 'Q36',
    questionText: 'Show labor capacity vs. machine capacity for this week.',
    category: 'Capacity Planning',
    sapSourceTables: ['CRHD', 'CRCA', 'KAKO', 'KBED', 'PA0001'],
    summaryAnswer: 'For the current week in Plant 1000, Machine Capacity utilization stands at 84.6% (676.8 operating hours committed against 800 available machine hours), while Labor Capacity utilization is at 89.2% (1,070.4 labor hours committed against 1,200 available labor hours across 30 shop floor technicians).',
    keyInsights: [
      'Machine Capacity: 800.0 hrs available / 676.8 hrs used (84.6% load).',
      'Labor Capacity: 1,200.0 hrs available (30 technicians x 40h) / 1,070.4 hrs used (89.2% load).',
      'Labor-to-machine ratio is balanced at 1.58 labor hours per machine hour.'
    ],
    productionMetrics: [
      { label: 'Machine Utilization', value: '84.6% (676.8h)', status: 'positive' },
      { label: 'Labor Utilization', value: '89.2% (1,070.4h)', status: 'positive' },
      { label: 'Total Active Techs', value: '30 Technicians', status: 'positive' },
      { label: 'Overtime Required', value: '0 Hours', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Assembly Line 1', value: 'Machine: 88.5% | Labor: 94.0%', variance: 'Tight Labor', detail: '4 operators allocated' },
      { category: 'Machining Line 2', value: 'Machine: 92.4% | Labor: 85.0%', variance: 'Automated', detail: '2 operators monitoring 3 CNCs' },
      { category: 'Packaging Line 3', value: 'Machine: 71.5% | Labor: 88.0%', variance: 'Manual Pack', detail: '6 packing operators allocated' }
    ],
    recommendedSapActions: [
      { actionName: 'Work Center Capacity by Category', tcode: 'CR03', description: 'Compare Capacity Category 001 (Machine) and 002 (Labor).' },
      { actionName: 'Capacity Planning Table', tcode: 'CM21', description: 'Inspect simultaneous machine and person capacity load.' }
    ]
  },
  {
    questionId: 'Q37',
    questionText: 'Optimize work center schedule for minimum setup time.',
    category: 'Capacity Planning',
    sapSourceTables: ['CRHD', 'PLPO', 'TC25', 'AFKO', 'AFPO'],
    summaryAnswer: 'Sequencing optimization on Assembly Line 1 grouping orders by product family (P-100 series followed by P-150 series and P-200 series) reduces total setup changeover time by 3.5 hours this week (from 7.0 hours down to 3.5 hours), saving $1,400 USD in tooling downtime and unlocking 350 additional units of production output.',
    keyInsights: [
      'Baseline Setup Time: 7.0 hours across 6 randomized product changeovers.',
      'Optimized Setup Time: 3.5 hours via family sequence matrix (P-100 -> P-150 -> P-200).',
      'Throughput Gain: +3.5 hours of active run time = +350 units produced with zero extra cost.'
    ],
    productionMetrics: [
      { label: 'Setup Time Saved', value: '3.5 Hours (-50%)', status: 'positive' },
      { label: 'Downtime Cost Saved', value: '$1,400 USD', status: 'positive' },
      { label: 'Additional Output', value: '+350 Units', status: 'positive' },
      { label: 'Setup Matrix Status', value: 'Optimized', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Unoptimized Sequence', value: 'P-100 -> P-200 -> P-100 -> P-150', variance: '7.0 hrs Setup', detail: '3 major tooling resets' },
      { category: 'Optimized Sequence', value: 'P-100 (2x) -> P-150 (2x) -> P-200 (2x)', variance: '3.5 hrs Setup', detail: 'Only minor adapter adjustments' }
    ],
    recommendedSapActions: [
      { actionName: 'Capacity Leveling with Setup Matrix', tcode: 'CM25', description: 'Execute dispatch optimization using setup transition group matrix (TC25).' },
      { actionName: 'Maintain Setup Matrix', tcode: 'CR21', description: 'Define setup transition rules and durations between product families.' }
    ]
  },
  {
    questionId: 'Q38',
    questionText: 'What happens to capacity if we add an overtime shift?',
    category: 'Capacity Planning',
    sapSourceTables: ['CRCA', 'KAKO', 'TC30A', 'CRHD', 'COEP'],
    summaryAnswer: 'Simulating a 4-hour Saturday overtime shift (Shift 3) for Assembly Lines 1-2 adds 8.0 machine hours and 32.0 labor hours, expanding weekly production capacity by 800 finished pump units (+$120,000 USD revenue potential) at an incremental labor cost of $2,400 USD, yielding a net margin gain of $38,000 USD.',
    keyInsights: [
      'Capacity Expansion: +8.0 machine hours / +32.0 labor hours across Lines 1 & 2.',
      'Output Potential: +800 units of Material MAT-P100 produced.',
      'Financial ROI: $2,400 USD overtime wages generate $38,000 USD gross margin contribution.'
    ],
    productionMetrics: [
      { label: 'Added Machine Hours', value: '+8.0 Hours', status: 'positive' },
      { label: 'Added Labor Hours', value: '+32.0 Hours', status: 'positive' },
      { label: 'Incremental Output', value: '+800 Units', status: 'positive' },
      { label: 'Overtime Cost', value: '$2,400 USD', status: 'neutral' }
    ],
    breakdownData: [
      { category: 'Assembly Line 1 (Sat 08:00-12:00)', value: '+400 PC MAT-P100', variance: '+4.0 hrs', detail: 'Clears customer backlog 2 days early' },
      { category: 'Assembly Line 2 (Sat 08:00-12:00)', value: '+400 PC MAT-P200', variance: '+4.0 hrs', detail: 'Replenishes distribution warehouse stock' }
    ],
    recommendedSapActions: [
      { actionName: 'Maintain Work Center Shift Intervals', tcode: 'CR02', description: 'Add temporary Saturday shift interval in work center capacity header.' },
      { actionName: 'Simulate Capacity in Long-Term Planning', tcode: 'MS04', description: 'Simulate scenario impact on finished goods delivery timeline.' }
    ]
  },
  {
    questionId: 'Q39',
    questionText: 'Identify work centers with high setup-to-run ratios.',
    category: 'Capacity Planning',
    sapSourceTables: ['CRHD', 'PLPO', 'AFKO', 'AFRU'],
    summaryAnswer: 'Analysis of operational run logs identifies Work Center WC-PAINT-01 (Automated Paint Booth) with the highest setup-to-run ratio at 24.2% (1.8 hours purge/clean setup for every 7.4 hours of spray run time), followed by WC-CNC-01 at 18.5%. Grouping paint runs by color code will reduce this ratio to <12%.',
    keyInsights: [
      'WC-PAINT-01: Setup Ratio = 24.2% (Driven by frequent color transitions between blue/black/grey).',
      'WC-CNC-01: Setup Ratio = 18.5% (Driven by frequent jaw fixture changeovers on small order lots).',
      'Target Benchmark: < 10.0% setup-to-run ratio across all discrete manufacturing lines.'
    ],
    productionMetrics: [
      { label: 'Highest Setup Ratio', value: '24.2% (Paint Booth)', status: 'warning' },
      { label: 'Target Ratio', value: '< 10.0%', status: 'positive' },
      { label: 'Reduction Potential', value: '-12.2% pts', status: 'positive' },
      { label: 'Weekly Hours Recovered', value: '4.5 hrs Run Time', status: 'positive' }
    ],
    breakdownData: [
      { category: 'WC-PAINT-01 (Paint Booth)', value: '24.2% (1.8h setup / 7.4h run)', variance: 'High Setup', detail: 'Implement color batch campaign scheduling' },
      { category: 'WC-CNC-01 (CNC Mill 1)', value: '18.5% (1.2h setup / 6.5h run)', variance: 'Moderate High', detail: 'Implement quick-change zero-point clamping' },
      { category: 'WC-ASSY-01 (Assembly Line 1)', value: '8.8% (0.8h setup / 9.1h run)', variance: 'Optimal', detail: 'Well-standardized SMED changeover' }
    ],
    recommendedSapActions: [
      { actionName: 'Standard Routing Operation Analysis', tcode: 'CA03', description: 'Review standard setup time (VGW01) versus processing time (VGW02).' },
      { actionName: 'Actual Time Confirmation Evaluation', tcode: 'CO14', description: 'Compare actual setup times against standard plan parameters.' }
    ]
  },
  {
    questionId: 'Q40',
    questionText: 'Show shift-wise capacity utilization for today.',
    category: 'Capacity Planning',
    sapSourceTables: ['CRCA', 'KAKO', 'KBED', 'AFRU', 'TC30A'],
    summaryAnswer: "Today's shift-wise capacity utilization across Plant 1000 shows Shift 1 (Morning 06:00-14:00) operating at 92.4% utilization, Shift 2 (Afternoon 14:00-22:00) currently running at 86.8% utilization, and Shift 3 (Night 22:00-06:00 scheduled maintenance and heavy machining) projected at 64.2%.",
    keyInsights: [
      'Shift 1 (Morning): 92.4% Load / 1,850 units confirmed (Peak assembly flow).',
      'Shift 2 (Afternoon): 86.8% Load / 1,570 units confirmed to date (On target).',
      'Shift 3 (Night): 64.2% Load / Autonomous CNC machining and automated paint curing.'
    ],
    productionMetrics: [
      { label: 'Shift 1 (Morning)', value: '92.4% Utilization', status: 'positive' },
      { label: 'Shift 2 (Afternoon)', value: '86.8% Utilization', status: 'positive' },
      { label: 'Shift 3 (Night)', value: '64.2% Utilization', status: 'positive' },
      { label: 'Overall Daily Load', value: '81.1%', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Shift 1: 06:00 - 14:00', value: '1,850 PC Produced', variance: '92.4% Load', detail: 'Completed Orders 1004208, 1004209' },
      { category: 'Shift 2: 14:00 - 22:00', value: '1,570 PC In Progress', variance: '86.8% Load', detail: 'Active Orders 1004210, 1004212' },
      { category: 'Shift 3: 22:00 - 06:00', value: '800 PC Scheduled', variance: '64.2% Load', detail: 'Unmanned automated CNC runs' }
    ],
    recommendedSapActions: [
      { actionName: 'Work Center Capacity Load by Shift', tcode: 'CM01', description: 'Review shift-level capacity demand and available work process hours.' },
      { actionName: 'Shift Calendar Definition', tcode: 'CR02', description: 'Inspect operating breaks and active work shifts per work center.' }
    ]
  },

  // =========================================================================
  // PILLAR 5: BOM, ROUTING & MASTER DATA (Q41 - Q50)
  // =========================================================================
  {
    questionId: 'Q41',
    questionText: 'Show the multi-level BOM for material [Material Number].',
    category: 'BOM, Routing & Master Data',
    sapSourceTables: ['STKO', 'STPO', 'MAST', 'MARA', 'MAKT'],
    summaryAnswer: 'Multi-level BOM explosion for Finished Product MAT-P100 (Industrial Pump 500kW, Plant 1000, BOM Usage 1) comprises 3 hierarchy levels with 12 total components: Level 1 includes Sub-assembly HALB-STA-01 (Stator Module) and HALB-IMP-01 (Impeller Module); Level 2 includes 6 raw parts; Level 3 includes copper windings and fasteners.',
    keyInsights: [
      'Finished Material: MAT-P100 (BOM Status: 01 - Active & Released).',
      'Depth: 3 BOM Hierarchy Levels, 12 Distinct Components, 100% Valid.',
      'Zero discontinued or obsoleted components found in active structure.'
    ],
    productionMetrics: [
      { label: 'BOM Hierarchy Levels', value: '3 Levels', status: 'positive' },
      { label: 'Total Components', value: '12 Items', status: 'positive' },
      { label: 'BOM Status', value: '01 - Active', status: 'positive' },
      { label: 'Usage / Alt', value: 'Usage 1 / Alt 01', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Level 1: MAT-P100 (FERT)', value: 'Finished Pump 500kW', variance: 'Parent', detail: 'Header Base Qty: 1 PC' },
      { category: '..Level 2: HALB-STA-01 (HALB)', value: 'Stator Module (Qty: 1 PC)', variance: 'Sub-assembly', detail: 'Assembled in Work Center WC-SUB-01' },
      { category: '....Level 3: MAT-COP-01 (ROH)', value: 'Copper Wire 2.5mm (Qty: 4.5 KG)', variance: 'Raw Part', detail: 'Issued from SLoc 0001' },
      { category: '..Level 2: HALB-IMP-01 (HALB)', value: 'Impeller Module (Qty: 1 PC)', variance: 'Sub-assembly', detail: 'Machined in Work Center WC-CNC-01' },
      { category: '....Level 3: MAT-STL-04 (ROH)', value: 'Stainless Billet 316L (Qty: 8.2 KG)', variance: 'Raw Part', detail: 'Issued from SLoc 0001' }
    ],
    recommendedSapActions: [
      { actionName: 'Multi-Level BOM Explosion', tcode: 'CS12', description: 'Display multi-level bill of material with structural indents and quantities.' },
      { actionName: 'Summarized BOM', tcode: 'CS13', description: 'Display consolidated component gross requirements across all sub-levels.' }
    ]
  },
  {
    questionId: 'Q42',
    questionText: 'Which BOMs have missing components?',
    category: 'BOM, Routing & Master Data',
    sapSourceTables: ['STPO', 'MARA', 'MAST', 'STKO', 'MARC'],
    summaryAnswer: 'Master data integrity audit across all 148 active Bills of Material in Plant 1000 confirms that ZERO BOMs have missing or unassigned component records. All 1,840 item positions have valid Material Master records in MARA/MARC with active procurement views and storage location assignments.',
    keyInsights: [
      '148 active production BOMs inspected across Plant 1000.',
      '1,840 total component line items verified with 100% master data integrity.',
      'Zero orphaned component numbers (STPO records pointing to non-existent materials).'
    ],
    productionMetrics: [
      { label: 'Active BOMs Audited', value: '148 BOMs', status: 'positive' },
      { label: 'Missing Component Defects', value: '0 Defects', status: 'positive' },
      { label: 'Master Data Health', value: '100.0%', status: 'positive' },
      { label: 'Orphaned Positions', value: '0 Items', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Finished Goods BOMs (FERT)', value: '62 BOMs / 840 Components', variance: '100% Valid', detail: 'All active and released' },
      { category: 'Semi-Finished BOMs (HALB)', value: '86 BOMs / 1,000 Components', variance: '100% Valid', detail: 'All active and released' }
    ],
    recommendedSapActions: [
      { actionName: 'Display Material BOM', tcode: 'CS03', description: 'Review BOM header, status, validity dates, and component items.' },
      { actionName: 'BOM Consistency Check', tcode: 'CS28', description: 'Execute master data consistency and completeness report.' }
    ]
  },
  {
    questionId: 'Q43',
    questionText: 'Are there obsolete materials in active BOMs?',
    category: 'BOM, Routing & Master Data',
    sapSourceTables: ['MARA', 'MARC', 'STPO', 'STKO', 'AENR'],
    summaryAnswer: 'Audit flagged 1 obsolete component in an active BOM: Material MAT-RAW-OLD01 (Legacy Copper Bushing - Plant-specific material status "02 - Blocked for Procurement/Production") is assigned to BOM BOM-P50-02 / Item 0030. Engineering Change Order ECO-2026-084 has been approved to replace it with MAT-RAW-NEW02.',
    keyInsights: [
      'Obsolete Component: MAT-RAW-OLD01 in BOM BOM-P50-02 (Item 0030).',
      'Status: Flagged as obsolete with valid replacement MAT-RAW-NEW02 available.',
      'Engineering Change Order ECO-2026-084 ready for implementation effective 2026-09-01.'
    ],
    productionMetrics: [
      { label: 'Obsolete Parts in BOMs', value: '1 Component', status: 'warning' },
      { label: 'Affected BOMs', value: '1 of 148 BOMs', status: 'warning' },
      { label: 'Replacement Material', value: 'MAT-RAW-NEW02', status: 'positive' },
      { label: 'ECO Implementation', value: 'Approved (ECO-084)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'BOM-P50-02 (Pump P-50)', value: 'Item 0030: MAT-RAW-OLD01', variance: 'Action Req', detail: 'Replace with MAT-RAW-NEW02 via ECM' }
    ],
    recommendedSapActions: [
      { actionName: 'Change Material BOM with ECM', tcode: 'CS02', description: 'Update component item using Engineering Change Number (AENNR).' },
      { actionName: 'Where-Used List for Material', tcode: 'CS15', description: 'Identify all active BOMs containing obsolete component.' }
    ]
  },
  {
    questionId: 'Q44',
    questionText: 'Show routing operations for material [Material Number].',
    category: 'BOM, Routing & Master Data',
    sapSourceTables: ['PLKO', 'PLAS', 'PLPO', 'CRHD', 'MAPL'],
    summaryAnswer: 'Standard Routing for Material MAT-P100 (Group 5000182, Group Counter 01, Plant 1000) comprises 4 sequential operations totaling 4.8 standard machine hours and 5.2 standard labor hours: Op 0010 (Frame Prep - WC-FRAME-01), Op 0020 (Sub-assembly - WC-SUB-01), Op 0030 (Final Assembly - WC-ASSY-01), and Op 0040 (Pressure Test - WC-TEST-01).',
    keyInsights: [
      'Material: MAT-P100 / Routing Group: 5000182 / Counter: 01.',
      'Status: 4 (Released for Production Orders).',
      'Total Base Standard Time: 4.8 hrs Machine / 5.2 hrs Labor per 1,000 PC lot.'
    ],
    productionMetrics: [
      { label: 'Total Operations', value: '4 Operations', status: 'positive' },
      { label: 'Routing Status', value: '4 (Released)', status: 'positive' },
      { label: 'Total Machine Time', value: '4.8 Hours / Lot', status: 'positive' },
      { label: 'Total Labor Time', value: '5.2 Hours / Lot', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Op 0010: Frame Preparation', value: 'WC-FRAME-01 | Setup: 0.5h, Run: 1.2h', variance: 'Step 1', detail: 'Prepares pump base casting' },
      { category: 'Op 0020: Motor Sub-assembly', value: 'WC-SUB-01 | Setup: 0.3h, Run: 1.5h', variance: 'Step 2', detail: 'Installs stator & rotor core' },
      { category: 'Op 0030: Final Pump Assembly', value: 'WC-ASSY-01 | Setup: 0.5h, Run: 1.5h', variance: 'Step 3', detail: 'Mounts impellers & mechanical seals' },
      { category: 'Op 0040: Hydrostatic Testing', value: 'WC-TEST-01 | Setup: 0.2h, Run: 0.6h', variance: 'Step 4', detail: 'Pressure testing & QA signoff' }
    ],
    recommendedSapActions: [
      { actionName: 'Display Routing', tcode: 'CA03', description: 'Review routing operations, work center assignments, standard values, and PRTs.' },
      { actionName: 'Routing / BOM Allocation', tcode: 'CA02', description: 'Inspect component allocation to specific routing operations.' }
    ]
  },
  {
    questionId: 'Q45',
    questionText: 'Which production versions are active for Plant 1000?',
    category: 'BOM, Routing & Master Data',
    sapSourceTables: ['MKAL', 'MARC', 'MAST', 'MAPL', 'T001W'],
    summaryAnswer: 'In Plant 1000, 74 Production Versions (MKAL) are active, released, and approved for automatic selection by MRP Live and S/4HANA PP/DS. All 74 versions have valid BOM alternatives and matching standard routings with validity dates extending through 2030.',
    keyInsights: [
      '74 Production Versions active in table MKAL across Plant 1000.',
      'Check Status: All versions passed consistency check (Valid BOM + Valid Routing).',
      'Lot Size Ranges: Standard range 1 to 999,999 units with automatic selection flag "1".'
    ],
    productionMetrics: [
      { label: 'Active Versions', value: '74 Versions', status: 'positive' },
      { label: 'Consistency Check', value: '100% Passed', status: 'positive' },
      { label: 'MRP Auto-Selection', value: 'Enabled (Flag 1)', status: 'positive' },
      { label: 'Validity Period', value: 'Valid thru 2030', status: 'positive' }
    ],
    breakdownData: [
      { category: 'MAT-P100 / Version 0001', value: 'BOM Alt 01 + Routing Group 5000182', variance: 'Active', detail: 'Primary high-volume production line' },
      { category: 'MAT-P200 / Version 0001', value: 'BOM Alt 01 + Routing Group 5000183', variance: 'Active', detail: 'High-pressure line' },
      { category: 'MAT-M50 / Version 0001', value: 'BOM Alt 01 + Routing Group 5000184', variance: 'Active', detail: 'Hydraulic motor line' }
    ],
    recommendedSapActions: [
      { actionName: 'Production Version Mass Maintenance', tcode: 'C223', description: 'Inspect and check consistency of all production versions by plant.' },
      { actionName: 'Material Master Work Scheduling View', tcode: 'MM03', description: 'Display assigned production versions for individual material.' }
    ]
  },
  {
    questionId: 'Q46',
    questionText: 'Compare BOM version 1 with version 2 for material [Material Number].',
    category: 'BOM, Routing & Master Data',
    sapSourceTables: ['STKO', 'STPO', 'MAST', 'MARA', 'AENR'],
    summaryAnswer: 'Comparison between BOM Alternative 01 (Standard Production) and Alternative 02 (Premium Heavy-Duty) for Material MAT-P100 reveals 2 component variances: Alternative 02 replaces standard Carbon Steel Impeller MAT-IMP-01 with Titanium Alloy Impeller MAT-IMP-02 (+45% wear resistance) and upgrades ball bearings from MAT-BRG-04 to Ceramic Bearings MAT-BRG-08.',
    keyInsights: [
      'Alternative 01: Standard Industrial Pump (Total Component Cost: $48.20 / unit).',
      'Alternative 02: Severe-Duty Chemical Pump (Total Component Cost: $74.50 / unit).',
      'Component Differences: 2 items changed (Impeller & Bearings); all other 10 parts identical.'
    ],
    productionMetrics: [
      { label: 'BOM Alternative 1', value: 'Alt 01 (Standard)', status: 'positive' },
      { label: 'BOM Alternative 2', value: 'Alt 02 (Heavy Duty)', status: 'positive' },
      { label: 'Component Variances', value: '2 Parts Changed', status: 'neutral' },
      { label: 'Cost Difference', value: '+$26.30 / unit (+54%)', status: 'neutral' }
    ],
    breakdownData: [
      { category: 'Item 0030: Impeller', value: 'Alt 01: MAT-IMP-01 (Steel) vs Alt 02: MAT-IMP-02 (Titanium)', variance: 'Material Change', detail: 'Corrosion resistant upgrade' },
      { category: 'Item 0040: Bearings', value: 'Alt 01: MAT-BRG-04 (Steel) vs Alt 02: MAT-BRG-08 (Ceramic)', variance: 'Spec Upgrade', detail: 'High temp tolerance upgrade' }
    ],
    recommendedSapActions: [
      { actionName: 'BOM Comparison Tool', tcode: 'CS14', description: 'Execute automated side-by-side BOM component and quantity comparison.' },
      { actionName: 'Display Alternative BOM', tcode: 'CS03', description: 'Review Alternative 02 technical specifications and validity dates.' }
    ]
  },
  {
    questionId: 'Q47',
    questionText: 'What work centers are used in the routing for [Material Number]?',
    category: 'BOM, Routing & Master Data',
    sapSourceTables: ['MAPL', 'PLKO', 'PLAS', 'PLPO', 'CRHD', 'CRTX'],
    summaryAnswer: 'The production routing for Material MAT-P100 (Group 5000182, Plant 1000) utilizes 4 distinct work centers across 4 operations: WC-FRAME-01 (Frame Machining Cell, Op 0010), WC-SUB-01 (Motor Sub-Assembly Bench, Op 0020), WC-ASSY-01 (Final Assembly Line 1, Op 0030), and WC-TEST-01 (Hydrostatic Test Bay, Op 0040).',
    keyInsights: [
      '4 Work Centers utilized across 4 sequential manufacturing operations.',
      'Primary Bottleneck Center: WC-ASSY-01 (Requires 1.5 standard hours per lot).',
      'All 4 work centers have active standard value keys (SAP_01) and linked cost centers.'
    ],
    productionMetrics: [
      { label: 'Work Centers Used', value: '4 Work Centers', status: 'positive' },
      { label: 'Routing Group', value: '5000182 / 01', status: 'positive' },
      { label: 'Total Operations', value: '4 Steps', status: 'positive' },
      { label: 'Cost Centers Linked', value: '4 Cost Centers', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Op 0010: WC-FRAME-01', value: 'Frame Machining Cell', variance: 'CC-MACH-01', detail: 'Standard Value Key: SAP_01' },
      { category: 'Op 0020: WC-SUB-01', value: 'Motor Sub-Assembly Bench', variance: 'CC-ASSY-01', detail: 'Standard Value Key: SAP_01' },
      { category: 'Op 0030: WC-ASSY-01', value: 'Final Assembly Line 1', variance: 'CC-ASSY-01', detail: 'Standard Value Key: SAP_01' },
      { category: 'Op 0040: WC-TEST-01', value: 'Hydrostatic Test Bay', variance: 'CC-QUAL-01', detail: 'Standard Value Key: SAP_01' }
    ],
    recommendedSapActions: [
      { actionName: 'Display Routing Operations', tcode: 'CA03', description: 'Review detailed work center assignments and machine/labor formulas.' },
      { actionName: 'Where-Used List for Work Center', tcode: 'CA80', description: 'Display all product routings that use work center WC-ASSY-01.' }
    ]
  },
  {
    questionId: 'Q48',
    questionText: 'Are there engineering change orders pending for active BOMs?',
    category: 'BOM, Routing & Master Data',
    sapSourceTables: ['AENR', 'AEOI', 'STKO', 'STPO', 'MAST'],
    summaryAnswer: 'There is 1 Engineering Change Order pending implementation in Plant 1000: ECO-2026-084 (Change Master: ECN-84920, "Upgrade Pump Seal Specification"). The change is approved by Engineering and Quality, and scheduled for automated activation on 2026-09-01 with zero impact on currently released production orders.',
    keyInsights: [
      'Pending ECO: ECO-2026-084 (Change Master ECN-84920).',
      'Scope: BOM BOM-P50-02 (Replaces obsolete seal bushing MAT-RAW-OLD01 with MAT-RAW-NEW02).',
      'Effective Date: 2026-09-01 00:00:00 (Valid-from date in table AENR).'
    ],
    productionMetrics: [
      { label: 'Pending ECOs', value: '1 Change Order', status: 'positive' },
      { label: 'Approval Status', value: 'Approved (Engineering)', status: 'positive' },
      { label: 'Effective Date', value: '2026-09-01', status: 'positive' },
      { label: 'WIP Order Impact', value: '0 Orders (Clean Cut)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'ECO-2026-084 / ECN-84920', value: 'Target: BOM-P50-02', variance: 'Pending Activation', detail: 'Replaces Item 0030 seal bushing; approved by Lead Engineer' }
    ],
    recommendedSapActions: [
      { actionName: 'Display Change Master', tcode: 'CC03', description: 'Inspect change master details, object management records, and release status.' },
      { actionName: 'Engineering Change Management Cockpit', tcode: 'CC04', description: 'View change order impact tree across materials, BOMs, and routings.' }
    ]
  },
  {
    questionId: 'Q49',
    questionText: 'Which materials have missing standard costs?',
    category: 'BOM, Routing & Master Data',
    sapSourceTables: ['MBEW', 'KEKO', 'CKIS', 'MARC', 'T001W'],
    summaryAnswer: 'Costing integrity audit across all 142 manufactured materials in Plant 1000 confirms that ZERO active materials have missing or unreleased standard cost estimates. All 62 FERT and 80 HALB materials have current standard prices (MBEW-STPRS) marked and released for the current fiscal period in S/4HANA Controlling (CO-PC).',
    keyInsights: [
      '142 manufactured SKUs (FERT + HALB) audited for costing completeness.',
      'Standard Cost Status: 142 / 142 (100%) Marked and Released in table KEKO/MBEW.',
      'Zero cost rollup errors or uncalculated BOM levels detected in current costing run.'
    ],
    productionMetrics: [
      { label: 'Missing Standard Costs', value: '0 Materials', status: 'positive' },
      { label: 'Costing Completeness', value: '100.0%', status: 'positive' },
      { label: 'Released Cost Estimates', value: '142 / 142 SKUs', status: 'positive' },
      { label: 'Current Period Costing', value: 'Period 08 / 2026', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Finished Products (FERT)', value: '62 / 62 Released', variance: '100%', detail: 'Standard cost estimate valid thru 2026-12-31' },
      { category: 'Semi-Finished Products (HALB)', value: '80 / 80 Released', variance: '100%', detail: 'Standard cost estimate valid thru 2026-12-31' }
    ],
    recommendedSapActions: [
      { actionName: 'Display Material Cost Estimate', tcode: 'CK13N', description: 'Review cost component split, itemization, and valuation date.' },
      { actionName: 'Costing Run Cockpit', tcode: 'CK40N', description: 'Execute mass costing rollup and price release.' }
    ]
  },
  {
    questionId: 'Q50',
    questionText: 'Show scrap percentage defined in BOM for material [Material Number].',
    category: 'BOM, Routing & Master Data',
    sapSourceTables: ['STPO', 'MARC', 'MAST', 'STKO', 'PLPO'],
    summaryAnswer: 'For Finished Product MAT-P100 (Plant 1000), Component Scrap defined in the BOM (STPO-AUSCH) is 2.0% on raw copper windings (MAT-COP-01) and 1.5% on seal gaskets (MAT-SEAL-09) to account for lead trimming during assembly. Assembly Scrap on the material master header (MARC-AUSSS) is set to 0.5%.',
    keyInsights: [
      'Material Master Assembly Scrap (MARC-AUSSS): 0.50% (Applies to entire assembly lot).',
      'Component Scrap (STPO-AUSCH): 2.00% on Copper Wire, 1.50% on Seal Gaskets.',
      'Operation Scrap (PLPO-AUSCH): 0.00% on CNC operations (High precision tooling).'
    ],
    productionMetrics: [
      { label: 'Assembly Scrap (MARC)', value: '0.50%', status: 'positive' },
      { label: 'Max Component Scrap', value: '2.00% (Copper Wire)', status: 'positive' },
      { label: 'Gasket Component Scrap', value: '1.50%', status: 'positive' },
      { label: 'Scrap Definition Status', value: 'Aligned with Historicals', status: 'positive' }
    ],
    breakdownData: [
      { category: 'MAT-P100 Header (MARC-AUSSS)', value: '0.50% Assembly Scrap', variance: 'Standard', detail: 'Automatically scales order net quantity in MRP' },
      { category: 'Item 0010: Copper Wire (MAT-COP-01)', value: '2.00% Component Scrap', variance: 'BOM STPO', detail: 'Accounts for coil start/end trimming' },
      { category: 'Item 0020: Seal Gasket (MAT-SEAL-09)', value: '1.50% Component Scrap', variance: 'BOM STPO', detail: 'Accounts for fitting tolerances' }
    ],
    recommendedSapActions: [
      { actionName: 'Display Material BOM Item Details', tcode: 'CS03', description: 'Inspect component scrap percentage and net indicator flag.' },
      { actionName: 'Material Master MRP 1 View', tcode: 'MM03', description: 'Review assembly scrap percentage in plant data.' }
    ]
  }
];
