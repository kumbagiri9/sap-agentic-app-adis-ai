import { PmExecutiveQuestionAnswer } from '../types';

export const PM_EXECUTIVE_QUESTIONS_PART2: PmExecutiveQuestionAnswer[] = [
  // =========================================================================
  // PILLAR 3 (CONT.): MAINTENANCE ORDERS (Q26 - Q30)
  // =========================================================================
  {
    questionId: 'Q26',
    questionText: 'Which maintenance orders exceeded planned cost?',
    category: 'Maintenance Orders',
    sapSourceTables: ['AUFK', 'COEP', 'ACDOCA', 'AFKO'],
    summaryAnswer: 'Over the current financial period, 4 maintenance orders recorded significant cost overruns (>20% over planned cost) in S/4HANA: 1) Order 4000845 (EQ-1003 Stamping Press main bearing overhaul: Planned €14,500 vs Actual €21,800, +50.3% variance due to discovered scoring on crankshaft requiring emergency precision grinding), 2) Order 4000858 (EQ-1019 Rotary Kiln pinion swap: Planned €8,200 vs Actual €11,400, +39.0%), 3) Order 4000864 (EQ-1004 Press proportional valve overhaul: Planned €3,400 vs Actual €4,650, +36.8%), and 4) Order 4000870 (EQ-1011 Injection molding manifold: Planned €2,800 vs Actual €3,550, +26.8%).',
    keyInsights: [
      '4 maintenance orders exceeded planned budget thresholds, generating a net adverse variance of €12,500.',
      'Order 4000845 variance (+€7,300) was driven by external subcontracting service for on-site shaft journal machining.',
      'Secondary cost driver across all overrun orders was overtime labor premiums for weekend shutdown work.',
      'Overall maintenance budget variance for Plant 1000 remains within the acceptable +3.2% aggregate band.'
    ],
    pmMetrics: [
      { label: 'Orders with Overruns (>20%)', value: '4 Orders', status: 'negative' },
      { label: 'Total Adverse Variance', value: '+€12,500', status: 'negative' },
      { label: 'Max Single Order Variance', value: '+50.3% (Order 4000845)', status: 'negative' },
      { label: 'Plant Budget Impact', value: '+3.2% Aggregate', status: 'neutral' }
    ],
    breakdownData: [
      { category: 'Order 4000845 (Press Main Overhaul)', value: 'Actual: €21,800 (Plan: €14,500)', variance: '+€7,300 (+50.3%)', detail: 'Unplanned crankshaft machining service PO 4500019102 + 18h overtime' },
      { category: 'Order 4000858 (Kiln Pinion Swap)', value: 'Actual: €11,400 (Plan: €8,200)', variance: '+€3,200 (+39.0%)', detail: 'Heavy crane rental extension + additional coupling hub replacement' },
      { category: 'Order 4000864 (Proportional Valve Rebuild)', value: 'Actual: €4,650 (Plan: €3,400)', variance: '+€1,250 (+36.8%)', detail: 'Secondary linear transducer replaced during calibration' },
      { category: 'Order 4000870 (Molding Manifold)', value: 'Actual: €3,550 (Plan: €2,800)', variance: '+€750 (+26.8%)', detail: 'Damaged cartridge heaters found during disassembly' }
    ],
    recommendedSapActions: [
      { actionName: 'Order Cost Analysis', tcode: 'KOC4', description: 'Run order cost report comparing planned vs actual debits in Controlling (CO)' },
      { actionName: 'Cost Object Drilldown', tcode: 'KKBC_ORD', description: 'Display cost element breakdown (Labor 610000, Material 400000, External 415000)' }
    ]
  },
  {
    questionId: 'Q27',
    questionText: 'Show work orders assigned to Technician ABC.',
    category: 'Maintenance Orders',
    sapSourceTables: ['AFVC', 'AUFK', 'IHPA', 'PA0002'],
    summaryAnswer: 'Filtering maintenance order operations in S/4HANA for Lead Mechanical Specialist M. Wagner (Technician ABC / Personnel No. PERNR 00104820): Currently 4 active work orders are assigned: 1) Order 4000912 (EQ-1004 Hydraulic Press HP-400 emergency seal rebuild, Op 0010, In execution, 4.0h booked of 6.0h planned), 2) Order 4000902 (EQ-1025 Blower PM inspection, Op 0010, Scheduled for 15:00 today, 1.5h planned), 3) Order 4000881 (EQ-1014 Lathe guideway rebuild, Op 0020, Scheduled for tomorrow, 8.0h planned), and 4) Order 4000899 (EQ-1009 Palletizer alignment, Op 0010, Scheduled for Thursday, 3.0h planned).',
    keyInsights: [
      '4 work orders currently assigned to Technician M. Wagner across the current week.',
      'Active daily workload: 7.5 planned labor hours today (100% capacity utilization).',
      'Total weekly committed workload: 18.5 planned hours across mechanical repair operations.',
      'Technician qualification profile: Level 3 Hydraulic Specialist and Master Machinist.'
    ],
    pmMetrics: [
      { label: 'Assigned Work Orders', value: '4 Orders', status: 'positive' },
      { label: 'Today’s Workload', value: '7.5 Hours (100% Load)', status: 'positive' },
      { label: 'Weekly Committed Hours', value: '18.5 Planned Hours', status: 'positive' },
      { label: 'Current Status', value: 'Active on Order 4000912', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Order 4000912 (HP-400 Seal Emergency)', value: 'Op 0010 | In Execution', variance: '4.0h / 6.0h', detail: 'Priority 1 | Main ram hydraulic cylinder disassembly and seal pack replacement' },
      { category: 'Order 4000902 (Exhaust Blower PM)', value: 'Op 0010 | Scheduled 15:00', variance: '1.5h Planned', detail: 'Priority 3 | V-belt replacement and dynamic vibration baseline check' },
      { category: 'Order 4000881 (Lathe Guideway Rebuild)', value: 'Op 0020 | Scheduled Tomorrow', variance: '8.0h Planned', detail: 'Priority 2 | Turcite slideway scraping and precision alignment calibration' },
      { category: 'Order 4000899 (Palletizer Alignment)', value: 'Op 0010 | Scheduled Thursday', variance: '3.0h Planned', detail: 'Priority 3 | Pneumatic pusher arm bearing replacement' }
    ],
    recommendedSapActions: [
      { actionName: 'Technician Operations Dispatch', tcode: 'IW37N', description: 'Display order operations filtered by Person Responsible / Personnel Number' },
      { actionName: 'Time Sheet Entry (CATS)', tcode: 'CAT2', description: 'Confirm actual time bookings against assigned order operations' }
    ]
  },
  {
    questionId: 'Q28',
    questionText: 'Which orders are partially confirmed?',
    category: 'Maintenance Orders',
    sapSourceTables: ['AUFK', 'AFRU', 'AFVC', 'TJ02T'],
    summaryAnswer: 'There are currently 8 maintenance orders in Partially Confirmed (PCNF) status in S/4HANA Plant Maintenance: 1) Order 4000912 (EQ-1004 Hydraulic Press, 4.0h confirmed of 6.0h), 2) Order 4000915 (EQ-1002 Feed Pump, 2.5h confirmed of 3.0h), 3) Order 4000920 (EQ-1022 Conveyor Drive, 2.0h confirmed of 2.5h), 4) Order 4000872 (EQ-1006 Compressor overhaul, 14.0h confirmed of 24.0h), 5) Order 4000880 (EQ-1001 CNC PM, 6.0h confirmed of 8.0h), 6) Order 4000895 (EQ-1015 Slurry Pump rebuild, 5.0h confirmed of 10.0h), 7) Order 4000901 (EQ-1011 Molding Machine heating zone, 3.0h confirmed of 4.0h), and 8) Order 4000907 (EQ-1008 AGV battery charging circuit, 1.5h confirmed of 2.0h).',
    keyInsights: [
      '8 orders currently in PCNF status with active labor hours and material consumption posted in AFRU/AUFM.',
      'Total labor booked across PCNF orders: 38.0 actual hours (planned total: 59.5 hours, 63.9% progress).',
      '3 orders (4000912, 4000915, 4000920) will reach Final Confirmation (CNF/TECO) during today’s first shift.',
      'No orphaned confirmations or open posting locks detected.'
    ],
    pmMetrics: [
      { label: 'Partially Confirmed Orders', value: '8 Orders (PCNF)', status: 'positive' },
      { label: 'Total Confirmed Labor', value: '38.0 Actual Hours', status: 'positive' },
      { label: 'Total Planned Labor', value: '59.5 Hours (63.9% Prog)', status: 'positive' },
      { label: 'Completing Today', value: '3 Orders (First Shift)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Order 4000912 (Hydraulic Press HP-400)', value: '4.0h / 6.0h (66.7%)', variance: 'In Progress', detail: 'Tech: M. Wagner | Seal installed; oil repressurization in progress' },
      { category: 'Order 4000915 (Feed Pump P-101)', value: '2.5h / 3.0h (83.3%)', variance: 'Near Complete', detail: 'Tech: D. Schmidt | Impeller cleared; final bolt torquing' },
      { category: 'Order 4000920 (Conveyor Drive CONV-10)', value: '2.0h / 2.5h (80.0%)', variance: 'Near Complete', detail: 'Tech: K. Becker | Chain tensioned; test run in progress' },
      { category: 'Order 4000872 (Compressor Overhaul)', value: '14.0h / 24.0h (58.3%)', variance: 'Waiting Rings', detail: 'Tech: R. Taylor | Crankcase reassembled; waiting for piston rings' },
      { category: 'Orders 4000880, 895, 901, 907', value: '15.5h / 24.0h (64.6%)', variance: 'Active Shifts', detail: 'CNC PM, Slurry Pump, Molding Machine, AGV Charger' }
    ],
    recommendedSapActions: [
      { actionName: 'Display Order Confirmations', tcode: 'IW43', description: 'Review operation confirmations, actual labor hours, and remaining duration' },
      { actionName: 'Post Final Confirmation', tcode: 'IW41', description: 'Enter final confirmation (CNF flag) and clear open order reservations' }
    ]
  },
  {
    questionId: 'Q29',
    questionText: 'Show maintenance orders scheduled for today.',
    category: 'Maintenance Orders',
    sapSourceTables: ['AUFK', 'AFKO', 'AFVC', 'TJ02T'],
    summaryAnswer: 'In S/4HANA Plant Maintenance, 9 maintenance orders are scheduled for execution today (Basic Start Date GSTRP <= Today <= Basic Finish Date GLTRP) across Plant 1000 and Plant 1010: 4 Emergency Repair Orders (4000912, 4000915, 4000918, 4000920, all active), 3 Planned Preventive Orders (4000880 CNC-01 Quarterly PM, 4000902 Blower Inspection, 4000906 Chiller Filter Swap), and 2 Scheduled Corrective Orders (4000901 Molding Heater Check, 4000907 AGV Charger Circuit).',
    keyInsights: [
      '9 total work orders scheduled for today representing 36.5 planned technician labor hours.',
      '100% of required maintenance technicians (8 specialists) are staffed across morning and afternoon shifts.',
      'Emergency orders account for 14.5 hours (39.7%) of today’s scheduled labor capacity.',
      'All materials for today’s 9 scheduled orders are staged and confirmed available.'
    ],
    pmMetrics: [
      { label: 'Scheduled Orders Today', value: '9 Orders', status: 'positive' },
      { label: 'Total Planned Labor', value: '36.5 Hours', status: 'positive' },
      { label: 'Active in Execution', value: '6 Orders (66.7%)', status: 'positive' },
      { label: 'Parts Availability', value: '100% Staged', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Emergency Orders (4 Orders)', value: '14.5 Planned Hours', variance: 'High Priority', detail: 'HP-400 Press (6h), ROB-02 Welder (3.5h), Pump P-101 (3h), Conveyor (2h)' },
      { category: 'Preventive Orders (3 Orders)', value: '14.0 Planned Hours', variance: 'Strategy PM', detail: 'CNC-01 PM (8h), Blower PM (3h), Chiller Filter (3h)' },
      { category: 'Corrective Orders (2 Orders)', value: '8.0 Planned Hours', variance: 'Planned Repairs', detail: 'Molding Heater (4h), AGV Charger Circuit (4h)' }
    ],
    recommendedSapActions: [
      { actionName: 'Daily Maintenance Schedule', tcode: 'IW38', description: 'Filter orders where Scheduled Start Date = Today and Plant = 1000' },
      { actionName: 'Capacity Leveling (CM25)', tcode: 'CM25', description: 'Monitor dispatching and capacity utilization across maintenance work centers' }
    ]
  },
  {
    questionId: 'Q30',
    questionText: 'Which orders are at risk of missing their completion date?',
    category: 'Maintenance Orders',
    sapSourceTables: ['AUFK', 'AFKO', 'RESB', 'CRHD', 'TJ02T'],
    summaryAnswer: 'Risk modeling in S/4HANA identifies 3 maintenance orders at high risk of breaching their scheduled completion dates: 1) Order 4000908 (EQ-1011 Molding Machine valve overhaul, finish date tomorrow, but required Moog valve has vendor delivery delayed until Friday), 2) Order 4000881 (EQ-1014 Lathe guideway rebuild, finish date Friday, but mechanical technician M. Wagner diverted to today’s emergency HP-400 repair, creating a 6-hour labor deficit), and 3) Order 4000923 (Conveyor belt vulcanization, awaiting production shutdown sign-off).',
    keyInsights: [
      '3 orders flagged with Schedule Breach Risk due to spare parts delays and technician resource reallocation.',
      'Order 4000908 cannot be finished until Friday 16:00 when Moog proportional valve arrives.',
      'Order 4000881 requires overtime authorization or second-technician cross-dispatch to meet Friday deadline.',
      'Order 4000923 requires rescheduled weekend shutdown window to avoid interrupting day-shift assembly.'
    ],
    pmMetrics: [
      { label: 'Orders at Schedule Risk', value: '3 Orders', status: 'warning' },
      { label: 'Parts Delay Risk', value: '1 Order (4000908)', status: 'warning' },
      { label: 'Labor Capacity Deficit', value: '6 Hours (4000881)', status: 'warning' },
      { label: 'Mitigation Actions Staged', value: '3 Plans Staged', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Order 4000908 (Molding Machine Valve)', value: 'Schedule Slip: +2 Days', variance: 'Material Block', detail: 'Moog valve MAT-VLV-92 ETA Friday 14:00 | Revised finish date: Friday 18:00' },
      { category: 'Order 4000881 (Lathe Guideway Rebuild)', value: 'Schedule Slip: +1 Day', variance: 'Labor Deficit', detail: 'Lead tech diverted to emergency; recommend assigning Tech T. Klein to assist' },
      { category: 'Order 4000923 (Conveyor Vulcanization)', value: 'Schedule Slip: +3 Days', variance: 'Production Conflict', detail: 'Rescheduled to Saturday maintenance shift 07:00' }
    ],
    recommendedSapActions: [
      { actionName: 'Reschedule Order Finish Date', tcode: 'IW32', description: 'Update scheduled finish dates in order header to align with component delivery' },
      { actionName: 'Work Center Capacity Leveling', tcode: 'CM01', description: 'Review load vs capacity on Work Center WCTR-MECH' }
    ]
  },

  // =========================================================================
  // PILLAR 4: PREVENTIVE MAINTENANCE (Q31 - Q40)
  // =========================================================================
  {
    questionId: 'Q31',
    questionText: 'Which preventive maintenance tasks are due this week?',
    category: 'Preventive Maintenance',
    sapSourceTables: ['MPLA', 'MPOS', 'MMPT', 'PLKO', 'EQUI'],
    summaryAnswer: 'In S/4HANA Plant Maintenance, 14 preventive maintenance plan calls are due for execution this week across Plant 1000 and Plant 1010: 6 Mechanical Service Plans (Plan 500012 Compressor 2000h, Plan 500045 Lathe calibration, Plan 500080 Pump lubrication, and 3 conveyor checks), 4 Electrical & Instrument Plans (Plan 500024 Transformer testing, Plan 500038 PLC battery swaps, Plan 500062 Motor insulation testing), and 4 Statutory / Safety Inspection Plans (Plan 500088 Crane safety, Plan 500091 Fire pump test, Plan 500095 Relief valve recertification).',
    keyInsights: [
      '14 preventive maintenance calls scheduled for the current 7-day calendar week.',
      'Total estimated preventive labor workload: 68 planned hours across all maintenance disciplines.',
      '10 of the 14 maintenance orders have already been automatically generated via batch job IP30.',
      '4 statutory safety plans have mandatory legal compliance sign-offs required before Sunday.'
    ],
    pmMetrics: [
      { label: 'PM Plans Due This Week', value: '14 Plans', status: 'positive' },
      { label: 'Total Planned PM Labor', value: '68 Hours', status: 'positive' },
      { label: 'Orders Auto-Called (IP30)', value: '10 of 14 (71.4%)', status: 'positive' },
      { label: 'Statutory Safety Plans', value: '4 Mandatory Plans', status: 'warning' }
    ],
    breakdownData: [
      { category: 'Mechanical Services (6 Plans)', value: '32 Planned Hours', variance: 'On Schedule', detail: 'Compressor 2000h, Lathe calibration, Slurry pump seals, Conveyor grease' },
      { category: 'Electrical & Instrumentation (4 Plans)', value: '18 Planned Hours', variance: 'On Schedule', detail: 'Transformer DGA test, PLC backup batteries, 480V motor megger checks' },
      { category: 'Statutory Safety & Environmental (4 Plans)', value: '18 Planned Hours', variance: 'Mandatory Legal', detail: 'Overhead crane NDT, Diesel fire pump auto-start, Boiler relief valves' }
    ],
    recommendedSapActions: [
      { actionName: 'Maintenance Schedule Overview', tcode: 'IP24', description: 'Display graphic maintenance schedule for all plans due in the current week' },
      { actionName: 'Deadline Monitoring Batch', tcode: 'IP30', description: 'Trigger manual order generation for remaining 4 pending plan calls' }
    ]
  },
  {
    questionId: 'Q32',
    questionText: 'Show maintenance plans overdue for execution.',
    category: 'Preventive Maintenance',
    sapSourceTables: ['MPLA', 'MPOS', 'MMPT', 'TJ02T'],
    summaryAnswer: 'There are currently 4 maintenance plans overdue for call execution in S/4HANA: 1) Plan 500012 (EQ-1006 Compressor COMP-01 2,000h service, 14 days overdue, Call Date surpassed without order TECO), 2) Plan 500045 (EQ-1014 CNC Lathe LATHE-04 Quarterly Geometric Calibration, 9 days overdue), 3) Plan 500088 (EQ-1018 Overhead Crane CRANE-02 Statutory Annual Safety Inspection, 7 days overdue), and 4) Plan 500102 (EQ-1025 Exhaust Blower EXH-01 Bi-Monthly V-Belt & Bearing Check, 5 days overdue).',
    keyInsights: [
      '4 maintenance plans have passed their planned call date without completion of the underlying work orders.',
      'Plan 500088 (Overhead Crane) is the highest compliance risk; crane is subject to statutory audit.',
      'Overdue plans represent 34 cumulative hours of deferred preventive maintenance.',
      'Mitigation schedule established: All 4 plans have active work orders assigned to technicians this week.'
    ],
    pmMetrics: [
      { label: 'Overdue Maintenance Plans', value: '4 Plans', status: 'negative' },
      { label: 'Max Days Overdue', value: '14 Days (Plan 500012)', status: 'negative' },
      { label: 'Statutory Safety Risk', value: '1 Plan (500088)', status: 'negative' },
      { label: 'Total Deferred PM Labor', value: '34 Hours', status: 'warning' }
    ],
    breakdownData: [
      { category: 'Plan 500012 (Compressor 2000h Service)', value: '14 Days Overdue', variance: 'Order 4000872', detail: 'EQ-1006 | Filter kit and oil change; parts arriving tomorrow' },
      { category: 'Plan 500045 (Lathe Geometric Calibration)', value: '9 Days Overdue', variance: 'Order 4000881', detail: 'EQ-1014 | Spindle runout and axis orthogonality check' },
      { category: 'Plan 500088 (Overhead Crane Safety Inspection)', value: '7 Days Overdue', variance: 'Order 4000889', detail: 'EQ-1018 | Load brake NDT test scheduled today at 13:00' },
      { category: 'Plan 500102 (Exhaust Blower Bi-Monthly PM)', value: '5 Days Overdue', variance: 'Order 4000902', detail: 'EQ-1025 | V-belt tension and bearing lubrication scheduled 15:00 today' }
    ],
    recommendedSapActions: [
      { actionName: 'Display Maintenance Plan Call History', tcode: 'IP10', description: 'Review scheduling call history, call dates, and buffer tolerances' },
      { actionName: 'Maintenance Plan Worklist', tcode: 'IP16', description: 'Filter maintenance plans by Call Date < Current Date and Status != Inactive' }
    ]
  },
  {
    questionId: 'Q33',
    questionText: 'Which equipment is missing a maintenance plan?',
    category: 'Preventive Maintenance',
    sapSourceTables: ['EQUI', 'EQUZ', 'MPOS', 'MPLA'],
    summaryAnswer: 'Cross-table audit between active equipment masters (EQUI) and maintenance plan item assignments (MPOS) reveals 8 operational production equipment assets in Plant 1000 and Plant 1010 that currently lack an assigned preventive maintenance plan: 1) Secondary Chiller CHILL-02 (EQ-1032, commissioned 45 days ago), 2) Pallet Wrapper WRAP-03 (EQ-1033), 3) Spot Welder WELD-08 (EQ-1034), 4) Rotary Table RT-02 (EQ-1036), and 4 secondary utility booster pumps (EQ-1037, EQ-1038, EQ-1039, EQ-1040).',
    keyInsights: [
      '8 active equipment master records have zero associated maintenance plans (MPOS count = 0).',
      'All 8 unassigned assets were newly commissioned within the past 60 days following Q2 plant expansions.',
      'Operating without PM plans risks premature component wear and manufacturer warranty invalidation.',
      'Maintenance Engineering has draft standard task lists (PLKO) ready for assignment.'
    ],
    pmMetrics: [
      { label: 'Assets Missing PM Plans', value: '8 Equipment Assets', status: 'warning' },
      { label: 'Newly Commissioned Assets', value: '100% (<60 Days Old)', status: 'neutral' },
      { label: 'Warranty Risk Exposure', value: '€85,000 Capital Value', status: 'warning' },
      { label: 'Draft Tasklists Ready', value: '8 Tasklists Ready', status: 'positive' }
    ],
    breakdownData: [
      { category: 'EQ-1032 (Secondary Chiller CHILL-02)', value: 'Plant 1010 / Utilities', variance: '45 Days Unassigned', detail: 'Commissioned 07/12 | Requires Quarterly Compressor Inspection Plan' },
      { category: 'EQ-1033 (Pallet Wrapper WRAP-03)', value: 'Plant 1000 / Logistics', variance: '38 Days Unassigned', detail: 'Commissioned 07/19 | Requires Monthly Turntable Lubrication Plan' },
      { category: 'EQ-1034 (Spot Welder WELD-08)', value: 'Plant 1000 / Body Shop', variance: '28 Days Unassigned', detail: 'Commissioned 07/29 | Requires Bi-Weekly Tip Alignment & Transformer PM' },
      { category: 'EQ-1036 (Rotary Table RT-02)', value: 'Plant 1000 / CNC Bay', variance: '21 Days Unassigned', detail: 'Commissioned 08/05 | Requires 500h Worm Gear Backlash Check' },
      { category: 'EQ-1037-1040 (4 Utility Booster Pumps)', value: 'Plant 1010 / Utilities', variance: '14 Days Unassigned', detail: 'Commissioned 08/12 | Requires Standard Centrifugal Pump PM Strategy' }
    ],
    recommendedSapActions: [
      { actionName: 'Create Maintenance Plan', tcode: 'IP01', description: 'Create time-based or counter-based maintenance plans for unassigned equipment' },
      { actionName: 'Assign Equipment to Maintenance Plan Item', tcode: 'IP02', description: 'Add Equipment items to existing multi-equipment maintenance strategies' }
    ]
  },
  {
    questionId: 'Q34',
    questionText: 'Show upcoming preventive maintenance for Plant 1000.',
    category: 'Preventive Maintenance',
    sapSourceTables: ['MPLA', 'MPOS', 'MMPT', 'PLKO', 'T001W'],
    summaryAnswer: 'Over the next 30 days in Plant 1000 (Dallas Manufacturing HQ), 38 preventive maintenance orders are scheduled for execution totaling 214 planned labor hours: Week 1 (Current) has 10 PM orders (54h labor), Week 2 has 8 PM orders (42h labor, including major CNC Cell 2 overhaul), Week 3 has 11 PM orders (62h labor, including monthly boiler inspections), and Week 4 has 9 PM orders (56h labor, including main stamping line lubrication and belt replacement).',
    keyInsights: [
      '38 preventive maintenance work orders scheduled across the next 4-week horizon in Plant 1000.',
      'Peak workload occurs in Week 3 (62 planned hours) driven by quarterly boiler and chiller inspections.',
      'Preventive-to-corrective labor ratio planned for the month is 74% (exceeds corporate 70% benchmark).',
      '100% of required standard spare parts for 30-day PM schedule are in stock in Central Stores.'
    ],
    pmMetrics: [
      { label: '30-Day PM Orders (Plant 1000)', value: '38 PM Orders', status: 'positive' },
      { label: 'Total Planned Labor', value: '214 Planned Hours', status: 'positive' },
      { label: 'Peak Labor Week', value: 'Week 3 (62 Hours)', status: 'neutral' },
      { label: 'Spare Parts Staged', value: '100% In Stock', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Week 1 (Aug 26 - Sep 01)', value: '10 Orders / 54 Hours', variance: 'Current Week', detail: 'Compressor overhaul, CNC calibration, crane safety, blower checks' },
      { category: 'Week 2 (Sep 02 - Sep 08)', value: '8 Orders / 42 Hours', variance: 'Planned Window', detail: 'CNC Cell 2 1000h service, conveyor chain lube, robotic welder inspection' },
      { category: 'Week 3 (Sep 09 - Sep 15)', value: '11 Orders / 62 Hours', variance: 'Peak Horizon', detail: 'Boiler tube de-scaling, chiller heat exchanger wash, transformer testing' },
      { category: 'Week 4 (Sep 16 - Sep 22)', value: '9 Orders / 56 Hours', variance: 'Planned Window', detail: 'Stamping Press monthly lubrication, hydraulic oil filtration, motor meggering' }
    ],
    recommendedSapActions: [
      { actionName: 'Plant Maintenance Scheduling Overview', tcode: 'IP24', description: 'Run graphical maintenance schedule for Plant 1000 over 30-day selection range' },
      { actionName: 'Work Center Capacity Planning', tcode: 'CM01', description: 'Verify labor capacity availability for Peak Week 3 in Plant 1000' }
    ]
  },
  {
    questionId: 'Q35',
    questionText: 'Which maintenance cycles should be adjusted?',
    category: 'Preventive Maintenance',
    sapSourceTables: ['MPLA', 'MMPT', 'QMEL', 'QMIH', 'MCI1'],
    summaryAnswer: 'Reliability-Centered Maintenance (RCM) optimization analysis in S/4HANA recommends adjusting maintenance cycles on 4 maintenance plans: 1) Shorten cycle on Plan 500028 (EQ-1007 Packaging Wrapper heat seal element: Reduce from 90 days to 45 days, preventing 7 recurring burnout breakdowns), 2) Shorten cycle on Plan 500034 (EQ-1015 Slurry Pump seal flushing: Reduce from 60 days to 30 days), 3) Extend cycle on Plan 500055 (EQ-1006 Air Compressor intake filter: Extend from 30 days to 60 days, filter remains 95% clean), and 4) Extend cycle on Plan 500072 (EQ-1018 Crane gearbox oil check: Extend from monthly to quarterly).',
    keyInsights: [
      '4 maintenance plans identified for cycle frequency adjustment based on historical failure and inspection data.',
      'Shortening cycles on PKG-02 and Slurry Pump will prevent an estimated 11 annual breakdown events (€38,000 savings).',
      'Extending cycles on Compressor filters and Crane oil checks will release 36 unnecessary technician labor hours/yr.',
      'Net projected annual financial benefit: €44,200 in combined downtime reduction and labor optimization.'
    ],
    pmMetrics: [
      { label: 'Plans to Shorten (High Failure)', value: '2 Plans', status: 'negative' },
      { label: 'Plans to Extend (Over-Maintained)', value: '2 Plans', status: 'positive' },
      { label: 'Net Annual Cost Savings', value: '€44,200 / Year', status: 'positive' },
      { label: 'Labor Hours Saved', value: '36 Hours / Year', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Plan 500028 (EQ-1007 Packaging Wrapper)', value: 'Shorten: 90d -> 45d', variance: '-50% Cycle', detail: 'Prevents heat seal element burnouts; saves €22,000/yr downtime' },
      { category: 'Plan 500034 (EQ-1015 Slurry Pump Seals)', value: 'Shorten: 60d -> 30d', variance: '-50% Cycle', detail: 'Prevents abrasive seal damage; saves €16,000/yr downtime' },
      { category: 'Plan 500055 (EQ-1006 Compressor Filters)', value: 'Extend: 30d -> 60d', variance: '+100% Cycle', detail: 'DP sensor confirms filters 95% clean at 30d; saves 18h labor/yr' },
      { category: 'Plan 500072 (EQ-1018 Crane Gearbox Oil)', value: 'Extend: 30d -> 90d', variance: '+200% Cycle', detail: 'Oil lab spectroscopy shows zero degradation at 30d; saves 18h labor/yr' }
    ],
    recommendedSapActions: [
      { actionName: 'Change Maintenance Plan Strategy/Cycles', tcode: 'IP02', description: 'Update cycle interval and unit in maintenance plan header and packages' },
      { actionName: 'Maintenance Strategy Package Maintenance', tcode: 'IP11', description: 'Adjust maintenance package intervals in maintenance strategy PM-MECH' }
    ]
  },
  {
    questionId: 'Q36',
    questionText: 'Which preventive tasks repeatedly find no defects?',
    category: 'Preventive Maintenance',
    sapSourceTables: ['QMEL', 'QMFE', 'AUFK', 'AFRU'],
    summaryAnswer: 'Analysis of completed PM work order confirmations (AFRU) and inspection findings over the past 12 months identifies 3 preventive maintenance tasks that have a 100% "No Defect Found" confirmation rate (12 consecutive execution cycles with zero corrective follow-up notifications): 1) Tasklist PM-TL-0042 (Air Receiver Tank Ultrasonic Wall Thickness Inspection, executed monthly, 0 defect findings), 2) Tasklist PM-TL-0058 (Enclosure Cooling Fan Filter Inspection, executed weekly, 0 findings), and 3) Tasklist PM-TL-0081 (Secondary Transformer Bushing Thermography, executed monthly, 0 findings).',
    keyInsights: [
      '3 preventive inspection tasklists have generated zero findings or corrective actions across 12 months.',
      'Tasklist PM-TL-0042 monthly ultrasonic thickness check is overly frequent for a non-corrosive air receiver.',
      'Tasklist PM-TL-0058 weekly fan filter check can be safely shifted to bi-weekly or monthly cadence.',
      'Re-aligning these 3 tasks will eliminate 64 hours of non-value-added technician inspection time annually.'
    ],
    pmMetrics: [
      { label: 'Zero-Defect PM Tasks', value: '3 Tasklists', status: 'neutral' },
      { label: 'Consecutive Clean Cycles', value: '12 Cycles (100% Pass)', status: 'positive' },
      { label: 'Non-Value Labor Spent', value: '64 Hours / Year', status: 'warning' },
      { label: 'Proposed Cycle Extension', value: '2x to 4x Interval', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Tasklist PM-TL-0042 (Air Receiver UT Thickness)', value: 'Current: Monthly (12 Cycles / 0 Defects)', variance: 'Recommend: Annual', detail: 'Wall thickness steady at 12.4mm (min allowable: 8.0mm); shift to Annual' },
      { category: 'Tasklist PM-TL-0058 (Enclosure Fan Filter Check)', value: 'Current: Weekly (52 Cycles / 0 Defects)', variance: 'Recommend: Monthly', detail: 'Cleanroom environment causes zero filter clogging; shift to Monthly' },
      { category: 'Tasklist PM-TL-0081 (Transformer Thermography)', value: 'Current: Monthly (12 Cycles / 0 Defects)', variance: 'Recommend: Quarterly', detail: 'Thermal delta steady at <2°C over ambient; shift to Quarterly' }
    ],
    recommendedSapActions: [
      { actionName: 'Change General Maintenance Task List', tcode: 'IA06', description: 'Update task list operation intervals and inspection steps' },
      { actionName: 'Update Maintenance Plan Cycle', tcode: 'IP02', description: 'Extend plan execution frequencies from Monthly to Annual / Quarterly' }
    ]
  },
  {
    questionId: 'Q37',
    questionText: 'Which assets require more frequent inspections?',
    category: 'Preventive Maintenance',
    sapSourceTables: ['EQUI', 'QMEL', 'QMIH', 'MCI1'],
    summaryAnswer: 'Based on accelerated failure rates, defect logs, and condition monitoring data, 3 critical equipment assets require increased inspection frequencies: 1) Coolant Chiller CHILL-01 (EQ-1010: Failure frequency increased +300% in Q3; recommend increasing refrigerant circuit and compressor valve inspections from Semi-Annual to Monthly), 2) Slurry Transfer Pump PUMP-204 (EQ-1015: 6 seal leaks in 90 days; recommend increasing mechanical seal barrier fluid inspections from Monthly to Bi-Weekly), and 3) CNC Lathe LATHE-02 (EQ-1013: X-axis backlash drift; recommend increasing ballscrew lubrication inspection from Quarterly to Monthly).',
    keyInsights: [
      '3 equipment assets are operating in high-wear condition regimes requiring tighter inspection surveillance.',
      'CHILL-01 (EQ-1010) compressor discharge temperature is trending near the 115°C critical safety threshold.',
      'PUMP-204 (EQ-1015) slurry slurry particle abrasiveness has increased following a change in raw material slurry mix.',
      'Increasing inspection frequency will enable early anomaly detection prior to catastrophic line outages.'
    ],
    pmMetrics: [
      { label: 'Assets Requiring More PM', value: '3 Critical Assets', status: 'negative' },
      { label: 'CHILL-01 Current Interval', value: 'Semi-Annual -> Monthly', status: 'negative' },
      { label: 'PUMP-204 Current Interval', value: 'Monthly -> Bi-Weekly', status: 'warning' },
      { label: 'Failure Risk Reduction', value: '-65% Projected', status: 'positive' }
    ],
    breakdownData: [
      { category: 'EQ-1010 (Coolant Chiller CHILL-01)', value: 'Increase to Monthly (from 6M)', variance: '+500% Surveillance', detail: 'Monitor compressor valve reed flutter, oil level, and superheat' },
      { category: 'EQ-1015 (Slurry Transfer Pump P-204)', value: 'Increase to Bi-Weekly (from 1M)', variance: '+100% Surveillance', detail: 'Monitor barrier fluid reservoir pressure and seal face flush rate' },
      { category: 'EQ-1013 (CNC Lathe LATHE-02)', value: 'Increase to Monthly (from 3M)', variance: '+200% Surveillance', detail: 'Measure X-axis laser interferometer backlash and guideway oiling' }
    ],
    recommendedSapActions: [
      { actionName: 'Create New Maintenance Plan Package', tcode: 'IP11', description: 'Define new 1-month and 2-week maintenance packages in Strategy PM-MECH' },
      { actionName: 'Assign Maintenance Plan to Equipment', tcode: 'IP02', description: 'Attach updated high-frequency inspection packages to equipment assets' }
    ]
  },
  {
    questionId: 'Q38',
    questionText: 'Show maintenance strategy performance.',
    category: 'Preventive Maintenance',
    sapSourceTables: ['MCI8', 'MPLA', 'AUFK', 'AFKO'],
    summaryAnswer: 'Evaluation of enterprise maintenance strategies across all manufacturing plants demonstrates solid performance against world-class benchmarks: Preventive-to-Corrective Maintenance Ratio is 72.4% (World-Class Target: >70%), Scheduled Maintenance Compliance (PM On-Time Completion) is 88.6% (Target: >90%), Planned Work Order Ratio is 84.1% (Target: >80%), and Emergency Work Order Ratio is 8.2% (Target: <10%).',
    keyInsights: [
      'Preventive ratio (72.4%) achieves the corporate target (>70%) for the third consecutive quarter.',
      'Schedule compliance (88.6%) is 1.4% below the 90% benchmark due to recent parts stockout delays.',
      'Emergency maintenance work ratio (8.2%) improved from 11.4% in Q1 following robotic cell overhauls.',
      'Overall Equipment Effectiveness (OEE) across maintained assets averages 84.6% (Target: 85.0%).'
    ],
    pmMetrics: [
      { label: 'Preventive Ratio', value: '72.4% (Target >70%)', status: 'positive' },
      { label: 'PM Schedule Compliance', value: '88.6% (Target >90%)', status: 'warning' },
      { label: 'Planned Work Ratio', value: '84.1% (Target >80%)', status: 'positive' },
      { label: 'Emergency Work Ratio', value: '8.2% (Target <10%)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Preventive vs Corrective Ratio', value: '72.4% PM / 27.6% CM', variance: '+2.4% vs Benchmark', detail: 'Plant 2000 leads with 92% PM; Plant 1000 is 68% PM' },
      { category: 'PM Schedule Compliance Rate', value: '88.6% Completed On-Time', variance: '-1.4% vs Benchmark', detail: '38 of 43 scheduled orders completed within SLA grace period' },
      { category: 'Planned Maintenance Execution', value: '84.1% Planned Work Hours', variance: '+4.1% vs Benchmark', detail: 'Proactive planning reduces overtime by 22%' },
      { category: 'Unplanned Emergency Repair Ratio', value: '8.2% of Total Orders', variance: '-1.8% vs Ceiling', detail: 'Down from 11.4% in Q1; target is under 10%' }
    ],
    recommendedSapActions: [
      { actionName: 'PMIS Maintenance Strategy Analysis', tcode: 'MCI8', description: 'Run standard PMIS report for planned vs unplanned maintenance order ratios' },
      { actionName: 'Benchmarking & Key Figures', tcode: 'MCIS', description: 'Analyze MTBF, MTTR, and maintenance cost per replacement value' }
    ]
  },
  {
    questionId: 'Q39',
    questionText: 'Predict which maintenance plans may be missed.',
    category: 'Preventive Maintenance',
    sapSourceTables: ['MPLA', 'MPOS', 'MMPT', 'RESB', 'CRHD'],
    summaryAnswer: 'Predictive schedule modeling evaluating upcoming call dates, technician capacity constraints, and spare part lead times identifies 3 maintenance plans at imminent risk of being missed in the next 14 days: 1) Plan 500062 (EQ-1011 Molding Machine 1,000h service, call date in 3 days, blocked by Moog proportional valve delivery delay until Friday), 2) Plan 500078 (EQ-1003 Stamping Press quarterly lubrication, call date in 5 days, labor capacity deficit on Mechanical Work Center), and 3) Plan 500091 (Plant 1010 Diesel Fire Pump auto-start test, technician certification renewal pending).',
    keyInsights: [
      '3 maintenance plans identified with >80% probability of schedule breach without corrective intervention.',
      'Plan 500062 risk is material-driven (Moog valve MAT-VLV-92 lead time).',
      'Plan 500078 risk is labor-driven (Mechanic crew fully booked on emergency HP-400 repair).',
      'Plan 500091 risk is compliance-driven (Stationary engineer requires NFPA-25 re-certification by Friday).'
    ],
    pmMetrics: [
      { label: 'Plans at Miss Risk', value: '3 Maintenance Plans', status: 'warning' },
      { label: 'Highest Risk Plan', value: 'Plan 500062 (Material Block)', status: 'negative' },
      { label: 'Labor Deficit Risk', value: 'Plan 500078 (Mechanic Load)', status: 'warning' },
      { label: 'Compliance Risk', value: 'Plan 500091 (NFPA Cert)', status: 'warning' }
    ],
    breakdownData: [
      { category: 'Plan 500062 (Molding Machine 1000h PM)', value: 'Call in 3 Days | Risk: 92%', variance: 'Material Shortage', detail: 'Missing Moog valve MAT-VLV-92 | Action: Expedite courier delivery' },
      { category: 'Plan 500078 (Stamping Press PM)', value: 'Call in 5 Days | Risk: 84%', variance: 'Work Center 108% Load', detail: 'WCTR-MECH over capacity | Action: Authorize 4h Saturday overtime' },
      { category: 'Plan 500091 (Diesel Fire Pump Test)', value: 'Call in 7 Days | Risk: 78%', variance: 'Cert Renewal Pending', detail: 'Assigned tech recertification scheduled for Wednesday 09:00' }
    ],
    recommendedSapActions: [
      { actionName: 'Maintenance Schedule Simulation', tcode: 'IP19', description: 'Simulate upcoming maintenance order calls against technician work center capacity' },
      { actionName: 'Expedite Purchase Order', tcode: 'ME22N', description: 'Upgrade shipping method on PO 4500019302 to overnight air freight' }
    ]
  },
  {
    questionId: 'Q40',
    questionText: 'Recommend preventive maintenance optimization.',
    category: 'Preventive Maintenance',
    sapSourceTables: ['MPLA', 'MPOS', 'QMEL', 'QMFE', 'MCI1', 'MCI8'],
    summaryAnswer: 'AI-driven Preventive Maintenance Optimization (PMO) across S/4HANA Plant Maintenance recommends a 4-pillar action plan: 1) Transition 6 high-criticality rotating assets (CNC Spindles, Press Hydraulics, Compressors) from calendar time-based PM to IoT Condition-Based Maintenance (CBM), saving €32,000/yr in unnecessary overhauls; 2) Rationalize 3 zero-defect tasklists (Air receiver, cooling fans) from monthly to annual/quarterly cycles, saving 64 labor hours/yr; 3) Standardize hydraulic seals to high-temp Viton across all press equipment, eliminating 18 recurring annual breakdowns (€34,200/yr); and 4) Implement automated batch order generation (RISTRA20) to eliminate manual call backlog.',
    keyInsights: [
      'Comprehensive 4-pillar PM optimization strategy projected to yield €66,200 annual bottom-line savings.',
      'Shifting to IoT Condition-Based Maintenance eliminates intrusive teardowns on healthy machinery.',
      'Seal material upgrade solves the single largest recurring defect category in the manufacturing plant.',
      'Labor rationalization recovers 100+ technician hours annually for high-value reliability engineering.'
    ],
    pmMetrics: [
      { label: 'Total Projected Annual Savings', value: '€66,200 / Year', status: 'positive' },
      { label: 'Unplanned Downtime Reduction', value: '-38% Projected', status: 'positive' },
      { label: 'Technician Labor Saved', value: '100+ Hours / Year', status: 'positive' },
      { label: 'IoT CBM Candidate Assets', value: '6 Rotating Assets', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Pillar 1: IoT Condition-Based Transition', value: '6 Assets (CNC, Compressors)', variance: '€32,000 / Yr Saved', detail: 'Trigger orders dynamically from SAP Plant Connectivity (PCo) sensor thresholds' },
      { category: 'Pillar 2: Tasklist Rationalization', value: '3 Tasklists (IA06)', variance: '64 Labor Hours Saved', detail: 'Extend intervals on zero-defect ultrasonic and thermography inspections' },
      { category: 'Pillar 3: Material Upgrade (Viton Seals)', value: 'Catalog PM-HYD', variance: '€34,200 / Yr Saved', detail: 'Eliminate 18 annual seal extrusion breakdowns on hydraulic presses' },
      { category: 'Pillar 4: Automated Batch Scheduling', value: 'Batch Job RISTRA20', variance: '100% On-Time Calls', detail: 'Auto-call maintenance orders 14 days in advance of execution window' }
    ],
    recommendedSapActions: [
      { actionName: 'Configure Measurement Points (IoT)', tcode: 'IK01', description: 'Create continuous measurement points and counters linked to IoT sensor tags' },
      { actionName: 'Define Condition-Based Task Lists', tcode: 'IA05', description: 'Create task lists with dynamic operation selection based on measuring point values' }
    ]
  },

  // =========================================================================
  // PILLAR 5: RELIABILITY, COST & ANALYTICS (Q41 - Q50)
  // =========================================================================
  {
    questionId: 'Q41',
    questionText: 'Show MTBF by equipment.',
    category: 'Reliability, Cost & Analytics',
    sapSourceTables: ['MCI1', 'QMIH', 'QMEL', 'EQUI'],
    summaryAnswer: 'Mean Time Between Failures (MTBF in operating hours) across major equipment assets over the trailing 12 months in S/4HANA PMIS: Top-Performing Assets include Robotic Welder ROB-01 (EQ-1008: MTBF 2,840h), CNC Milling Center CNC-02 (EQ-1002: MTBF 2,120h), and Air Compressor COMP-01 (EQ-1006: MTBF 1,890h); Low MTBF / High Failure Assets include Packaging Shrink Wrapper PKG-02 (EQ-1007: MTBF 308h, severe heat element burnouts), Slurry Transfer Pump PUMP-204 (EQ-1015: MTBF 360h, abrasive seal wear), and Hydraulic Press HP-400 (EQ-1004: MTBF 482h, hydraulic seal blowouts).',
    keyInsights: [
      'Plant-wide average MTBF across all rotating and machine assets is 1,420 operating hours.',
      'ROB-01 leads the plant with 2,840h MTBF following precision servo maintenance.',
      'PKG-02 (308h MTBF) and PUMP-204 (360h MTBF) require root cause engineering redesign.',
      'Overall enterprise MTBF improved +14.2% YoY driven by preventive maintenance compliance.'
    ],
    pmMetrics: [
      { label: 'Plant Average MTBF', value: '1,420 Hours', status: 'positive' },
      { label: 'Best Asset MTBF', value: '2,840h (ROB-01)', status: 'positive' },
      { label: 'Lowest Asset MTBF', value: '308h (PKG-02)', status: 'negative' },
      { label: 'YoY MTBF Trend', value: '+14.2% Improvement', status: 'positive' }
    ],
    breakdownData: [
      { category: 'EQ-1008 (Robotic Welder ROB-01)', value: 'MTBF: 2,840 Hours', variance: 'Best in Class', detail: '3 breakdowns in 8,520 operating hours | Availability: 99.1%' },
      { category: 'EQ-1002 (CNC Milling Center CNC-02)', value: 'MTBF: 2,120 Hours', variance: 'Top Quartile', detail: '4 breakdowns in 8,480 operating hours | Availability: 98.4%' },
      { category: 'EQ-1006 (Air Compressor COMP-01)', value: 'MTBF: 1,890 Hours', variance: 'Above Average', detail: '4 breakdowns in 7,560 operating hours | Availability: 97.8%' },
      { category: 'EQ-1004 (Hydraulic Press HP-400)', value: 'MTBF: 482 Hours', variance: 'Below Benchmark', detail: '14 breakdowns in 6,748 operating hours | Availability: 95.1%' },
      { category: 'EQ-1015 (Slurry Transfer Pump P-204)', value: 'MTBF: 360 Hours', variance: 'Critical Concern', detail: '18 breakdowns in 6,480 operating hours | Availability: 93.8%' },
      { category: 'EQ-1007 (Packaging Wrapper PKG-02)', value: 'MTBF: 308 Hours', variance: 'Severe Concern', detail: '22 breakdowns in 6,776 operating hours | Availability: 92.4%' }
    ],
    recommendedSapActions: [
      { actionName: 'MTBF Breakdown Analysis', tcode: 'MCI1', description: 'Run standard S/4HANA PMIS breakdown report to view MTBF trends by equipment' },
      { actionName: 'Equipment Reliability Curve', tcode: 'MCIS', description: 'Analyze Weibull failure distribution curves and failure rates' }
    ]
  },
  {
    questionId: 'Q42',
    questionText: 'Show MTTR by equipment.',
    category: 'Reliability, Cost & Analytics',
    sapSourceTables: ['MCI1', 'QMIH', 'QMEL', 'AUFK', 'AFRU'],
    summaryAnswer: 'Mean Time To Repair (MTTR in hours from malfunction start to return-to-service) across major equipment assets in S/4HANA PMIS: Fastest Recovering Assets include Packaging Wrapper PKG-02 (EQ-1007: MTTR 2.1h, quick-swap heating cartridges), Conveyor Drive CONV-10 (EQ-1022: MTTR 2.4h), and Feed Pump P-101 (EQ-1002: MTTR 2.8h); Longest Repair Duration Assets include Stamping Press STAMP-01 (EQ-1003: MTTR 12.1h, heavy mechanical tooling and rigging), Rotary Kiln KILN-01 (EQ-1019: MTTR 32.7h, cool-down cycle + heavy refractory work), and Hydraulic Press HP-400 (EQ-1004: MTTR 6.2h, hydraulic depressurization and seal rebuild).',
    keyInsights: [
      'Plant-wide average MTTR across all maintenance events is 4.4 hours.',
      'PKG-02 exhibits fast MTTR (2.1h) due to pre-assembled quick-swap modular heating assemblies.',
      'STAMP-01 MTTR (12.1h) is elevated due to heavy 20-ton crane availability bottlenecks during die maintenance.',
      'Pre-staging standard rebuild kits in line-side shadow boards is projected to reduce plant MTTR by 18%.'
    ],
    pmMetrics: [
      { label: 'Plant Average MTTR', value: '4.4 Hours', status: 'positive' },
      { label: 'Fastest MTTR', value: '2.1h (PKG-02)', status: 'positive' },
      { label: 'Longest Machine MTTR', value: '12.1h (STAMP-01)', status: 'negative' },
      { label: 'Heavy Equipment MTTR', value: '32.7h (KILN-01)', status: 'warning' }
    ],
    breakdownData: [
      { category: 'EQ-1007 (Packaging Wrapper PKG-02)', value: 'MTTR: 2.1 Hours', variance: 'Fast Recovery', detail: '22 repairs | Total repair time: 46.2h | Modular cartridge swap' },
      { category: 'EQ-1022 (Conveyor Drive CONV-10)', value: 'MTTR: 2.4 Hours', variance: 'Fast Recovery', detail: '12 repairs | Total repair time: 28.8h | Standard belt and chain fixes' },
      { category: 'EQ-1002 (Feed Pump P-101)', value: 'MTTR: 2.8 Hours', variance: 'Fast Recovery', detail: '8 repairs | Total repair time: 22.4h | Mechanical seal and impeller fixes' },
      { category: 'EQ-1004 (Hydraulic Press HP-400)', value: 'MTTR: 6.2 Hours', variance: 'Moderate Duration', detail: '14 repairs | Total repair time: 86.8h | Hydraulic cylinder seal rebuilds' },
      { category: 'EQ-1003 (Stamping Press STAMP-01)', value: 'MTTR: 12.1 Hours', variance: 'High Duration', detail: '11 repairs | Total repair time: 133.1h | Heavy mechanical and clutch overhauls' },
      { category: 'EQ-1019 (Rotary Kiln Drive KILN-01)', value: 'MTTR: 32.7 Hours', variance: 'Overhaul Scale', detail: '3 major repairs | Total repair time: 98.1h | Girth gear and refractory rebuilds' }
    ],
    recommendedSapActions: [
      { actionName: 'MTTR Breakdown Report', tcode: 'MCI1', description: 'Display Mean Time To Repair analysis and technician response times in PMIS' },
      { actionName: 'Standard Job / Task List Creation', tcode: 'IA05', description: 'Create standardized rapid-repair job instructions to reduce repair variability' }
    ]
  },
  {
    questionId: 'Q43',
    questionText: 'Which assets have the highest maintenance cost?',
    category: 'Reliability, Cost & Analytics',
    sapSourceTables: ['COEP', 'ACDOCA', 'AUFK', 'EQUI', 'MCI8'],
    summaryAnswer: 'In the trailing 12 months, the top 4 equipment assets with the highest total maintenance spend (Direct Labor + Internal Stock Materials + External Services) in S/4HANA Controlling are: 1) Stamping Press STAMP-01 (EQ-1003: Total Cost €48,600, €24,200 parts, €14,400 internal labor, €10,000 subcontracted grinding), 2) Hydraulic Press HP-400 (EQ-1004: Total Cost €36,400), 3) Rotary Kiln KILN-01 (EQ-1019: Total Cost €31,200), and 4) Slurry Transfer Pump PUMP-204 (EQ-1015: Total Cost €22,800).',
    keyInsights: [
      'Top 4 assets account for €139,000 (42.4%) of total plant maintenance expenditure (€328,000).',
      'STAMP-01 maintenance spend represents 14.8% of the entire annual plant maintenance budget.',
      'Material costs (custom hydraulic seals, bearings, girth gears) represent 58% of total top-asset spend.',
      'Assets with high maintenance cost correlate strongly with equipment operating beyond 85% of useful life.'
    ],
    pmMetrics: [
      { label: 'Highest Spend Asset', value: 'EQ-1003 (€48,600 / Yr)', status: 'negative' },
      { label: 'Top 4 Spend Total', value: '€139,000 (42.4% Budget)', status: 'negative' },
      { label: 'Total Plant Spend (12M)', value: '€328,000', status: 'neutral' },
      { label: 'Material vs Labor Split', value: '58% Parts / 42% Labor', status: 'neutral' }
    ],
    breakdownData: [
      { category: 'EQ-1003 (Stamping Press STAMP-01)', value: '€48,600 (14.8% of Plant)', variance: 'Top Spender', detail: 'Parts: €24,200 | Labor: €14,400 | External: €10,000 | 11 work orders' },
      { category: 'EQ-1004 (Hydraulic Press HP-400)', value: '€36,400 (11.1% of Plant)', variance: 'Second Spender', detail: 'Parts: €19,800 | Labor: €12,600 | External: €4,000 | 14 work orders' },
      { category: 'EQ-1019 (Rotary Kiln Drive KILN-01)', value: '€31,200 (9.5% of Plant)', variance: 'Third Spender', detail: 'Parts: €18,400 | Labor: €6,800 | External: €6,000 | 3 work orders' },
      { category: 'EQ-1015 (Slurry Transfer Pump P-204)', value: '€22,800 (7.0% of Plant)', variance: 'Fourth Spender', detail: 'Parts: €14,200 | Labor: €8,600 | External: €0 | 18 work orders' },
      { category: 'All Other 244 Assets', value: '€189,000 (57.6% of Plant)', variance: 'Fleet Base', detail: 'Average spend per asset: €774 / year' }
    ],
    recommendedSapActions: [
      { actionName: 'Equipment Cost Report', tcode: 'MCI8', description: 'Analyze maintenance costs by equipment, cost element, and value category' },
      { actionName: 'Cost Center Actual Line Items', tcode: 'KSB1', description: 'Display individual CO postings charged to Maintenance Cost Center CC-MNT-100' }
    ]
  },
  {
    questionId: 'Q44',
    questionText: 'Which failure types cause the most downtime?',
    category: 'Reliability, Cost & Analytics',
    sapSourceTables: ['QMFE', 'QMIH', 'QMEL', 'MCI1'],
    summaryAnswer: 'Defect damage code grouping and PMIS analysis in S/4HANA reveals the 4 failure categories causing the most cumulative downtime over the past 12 months: 1) Mechanical Drive & Bearing Failures (Code Group PM-MECH-BRG: 218.4 downtime hours, 36.1% of total plant outage time, €142,000 impact), 2) Hydraulic System Failures (Code Group PM-HYD-LEAK: 164.2 downtime hours, 27.1%), 3) Electrical & Automation Drives (Code Group PM-ELEC-DRV: 112.6 downtime hours, 18.6%), and 4) Thermal Heating & Chilling (Code Group PM-THERM: 74.8 downtime hours, 12.4%).',
    keyInsights: [
      'Mechanical bearing and hydraulic leak failures together account for 63.2% of all plant downtime hours.',
      'Bearing failures are primarily caused by lubrication starvation and contamination in dusty shop areas.',
      'Hydraulic downtime is driven by high-pressure seal extrusions and proportional valve contamination.',
      'Targeted condition monitoring on bearings and oil filtration upgrades address 63% of plant outage risks.'
    ],
    pmMetrics: [
      { label: 'Top Failure Type', value: 'Mechanical Bearings (218.4h)', status: 'negative' },
      { label: 'Second Failure Type', value: 'Hydraulics (164.2h)', status: 'negative' },
      { label: 'Top 2 Outage Share', value: '63.2% of Total Downtime', status: 'negative' },
      { label: 'Total Plant Downtime (12M)', value: '604.8 Hours', status: 'warning' }
    ],
    breakdownData: [
      { category: 'PM-MECH-BRG (Bearings & Drives)', value: '218.4 Hours (36.1% Share)', variance: 'Top Downtime Driver', detail: '34 incidents | Main press bearings, kiln pinions, blower bearings' },
      { category: 'PM-HYD-LEAK (Hydraulic Seals & Valves)', value: '164.2 Hours (27.1% Share)', variance: 'Second Driver', detail: '28 incidents | Press rams, molding clamp cylinders, manifold seals' },
      { category: 'PM-ELEC-DRV (Servo Drives & Motors)', value: '112.6 Hours (18.6% Share)', variance: 'Third Driver', detail: '18 incidents | Welder encoders, CNC servo amps, AGV traction inverters' },
      { category: 'PM-THERM (Heating Elements & Chillers)', value: '74.8 Hours (12.4% Share)', variance: 'Fourth Driver', detail: '24 incidents | Packaging seal bars, chiller compressors, boiler burners' },
      { category: 'Other Minor Failure Codes', value: '34.8 Hours (5.8% Share)', variance: 'Remaining', detail: 'Pneumatics, structural brackets, sensors' }
    ],
    recommendedSapActions: [
      { actionName: 'Damage Code Analysis', tcode: 'MCI5', description: 'Evaluate downtime hours and frequency by Damage Code Group in PMIS' },
      { actionName: 'Root Cause Engineering Analysis', tcode: 'QM10', description: 'Review notification corrective action (CAPA) logs for bearing and hydraulic defects' }
    ]
  },
  {
    questionId: 'Q45',
    questionText: 'Show planned versus unplanned maintenance.',
    category: 'Reliability, Cost & Analytics',
    sapSourceTables: ['AUFK', 'AFIH', 'MCI8', 'AFKO'],
    summaryAnswer: 'In S/4HANA Plant Maintenance, the planned versus unplanned maintenance distribution across the trailing 12 months is: Planned Maintenance (Strategy PM02 + Scheduled Corrective PM01 with planning lead time >48h) accounts for 74.2% of total maintenance labor hours (3,840 hours) and 71.8% of total maintenance cost (€235,500); Unplanned Maintenance (Emergency PM03 + Reactive Breakdowns) accounts for 25.8% of total labor hours (1,335 hours) and 28.2% of total cost (€92,500).',
    keyInsights: [
      'Planned maintenance ratio of 74.2% meets the corporate world-class benchmark (>70%).',
      'Unplanned maintenance costs an average of 2.4x more per labor hour due to expedited parts and overtime.',
      'Plant 2000 has the highest planned ratio (91.4%); Plant 1000 has the lowest (68.2%) due to heavy press outages.',
      'Converting the top 4 repeat-failure assets to planned overhauls will raise plant-wide planned ratio to 82%.'
    ],
    pmMetrics: [
      { label: 'Planned Maintenance Ratio', value: '74.2% (Target >70%)', status: 'positive' },
      { label: 'Unplanned Ratio', value: '25.8% (Target <30%)', status: 'positive' },
      { label: 'Planned Hours / Cost', value: '3,840h / €235,500', status: 'positive' },
      { label: 'Unplanned Hours / Cost', value: '1,335h / €92,500', status: 'warning' }
    ],
    breakdownData: [
      { category: 'Planned Maintenance (Strategy PM02)', value: '2,420 Hours (46.8% Share)', variance: '€148,000 Spend', detail: 'Lubrication, calibration, statutory inspections, filter replacements' },
      { category: 'Planned Corrective (Scheduled PM01)', value: '1,420 Hours (27.4% Share)', variance: '€87,500 Spend', detail: 'Condition-triggered component swaps scheduled during idle shifts' },
      { category: 'Unplanned Emergency (Breakdown PM03)', value: '1,335 Hours (25.8% Share)', variance: '€92,500 Spend', detail: 'Immediate line stoppage repairs, overtime premiums, hot freight' }
    ],
    recommendedSapActions: [
      { actionName: 'Planned vs Unplanned Ratio Report', tcode: 'MCI8', description: 'Generate PMIS planned vs unplanned work order comparison report' },
      { actionName: 'Order Type Cost Settlement Overview', tcode: 'KOB1', description: 'Display actual cost postings grouped by Order Types PM01, PM02, and PM03' }
    ]
  },
  {
    questionId: 'Q46',
    questionText: 'Which spare parts are driving maintenance cost?',
    category: 'Reliability, Cost & Analytics',
    sapSourceTables: ['RESB', 'MSEG', 'MATDOC', 'MARA', 'MAKT', 'MCI8'],
    summaryAnswer: 'Goods issue analysis (Movement Type 261 to PM Orders) in S/4HANA Materials Management over the past 12 months reveals the top 4 spare part materials driving maintenance spend: 1) Precision Spindle Bearing Sets (Material MAT-BRG-7210B: €28,400 consumed, 8 sets used across CNC machining centers), 2) Heavy Hydraulic Cylinder Seal Kits (Material MAT-SEAL-HP40: €24,600 consumed, 14 kits used on hydraulic presses), 3) Servomotors & Encoders (Material MAT-SRV-1FK7: €21,800 consumed, 5 units used on robotic welding cells), and 4) Synthetic Hydraulic Oil ISO VG 46 (Material MAT-OIL-SYN46: €16,200 consumed, 4,200 liters used for fluid changes and makeup).',
    keyInsights: [
      'Top 4 spare part materials account for €91,000 (47.8%) of total spare parts consumption (€190,400).',
      'Spindle bearings (MAT-BRG-7210B) have a 12-week replenishment lead time; safety stock maintained at 3 sets.',
      'Hydraulic seal kits (MAT-SEAL-HP40) consumption rate is 3x higher than original OEM engineering projections.',
      'Hydraulic oil consumption is elevated by uncontained micro-leaks on Press Line 1 manifold blocks.'
    ],
    pmMetrics: [
      { label: 'Top Spend Part Material', value: 'Spindle Bearings (€28,400)', status: 'negative' },
      { label: 'Second Spend Part', value: 'Hydraulic Seal Kits (€24,600)', status: 'negative' },
      { label: 'Top 4 Parts Share', value: '47.8% of Total Part Spend', status: 'warning' },
      { label: 'Total Spare Parts Spend', value: '€190,400 (12 Months)', status: 'neutral' }
    ],
    breakdownData: [
      { category: 'MAT-BRG-7210B (Precision Spindle Bearings)', value: '€28,400 (8 Sets Issued)', variance: 'Unit Cost: €3,550', detail: 'Stock in plant: 3 EA | Lead time: 12 weeks | Reorder point: 2 EA' },
      { category: 'MAT-SEAL-HP40 (Hydraulic Seal Kits)', value: '€24,600 (14 Kits Issued)', variance: 'Unit Cost: €1,757', detail: 'Stock in plant: 4 EA | High turnover rate on HP-400 Press' },
      { category: 'MAT-SRV-1FK7 (AC Servomotor 1FK7060)', value: '€21,800 (5 Units Issued)', variance: 'Unit Cost: €4,360', detail: 'Stock in plant: 2 EA | Lead time: 8 weeks | Vendor: Siemens' },
      { category: 'MAT-OIL-SYN46 (Synthetic Oil ISO VG 46)', value: '€16,200 (4,200 L Issued)', variance: 'Unit Cost: €3.85 / L', detail: 'Bulk tank: 2,400 L on hand | Reorder point: 1,500 L' }
    ],
    recommendedSapActions: [
      { actionName: 'Material Document List (Goods Issues)', tcode: 'MB51', description: 'Filter Movement Type 261 by PM Cost Centers and Equipment Orders' },
      { actionName: 'Spare Part Stock & Reorder Levels', tcode: 'MMBE', description: 'Review stock overview, reserved quantities, and safety stock thresholds' }
    ]
  },
  {
    questionId: 'Q47',
    questionText: 'Which work centers are overloaded?',
    category: 'Reliability, Cost & Analytics',
    sapSourceTables: ['CRHD', 'KAKO', 'KBED', 'AFVC', 'AUFK'],
    summaryAnswer: 'Capacity requirement evaluation (Capacity vs Available Standard Hours) across maintenance work centers in S/4HANA Plant Maintenance reveals that 1 work center is severely overloaded and 1 is approaching maximum utilization: 1) Mechanical Maintenance Work Center WCTR-MECH (Plant 1000) is at 108.4% capacity utilization for the current week (173.5 planned hours required vs 160.0 standard hours available, +13.5h overload due to simultaneous emergency repairs on HP-400 and scheduled CNC overhauls), and 2) Electrical & Automation Work Center WCTR-ELEC is at 94.2% capacity (113.0 planned vs 120.0 available). Facilities Work Center WCTR-FAC is balanced at 68.5%.',
    keyInsights: [
      'WCTR-MECH is overloaded at 108.4% capacity with an active 13.5-hour labor backlog.',
      'Overload is driven by diversion of 2 mechanical technicians to Emergency Order 4000912 today.',
      'Mitigation: Authorize 16 hours of weekend overtime or shift 2 non-urgent conveyor PM orders to next week.',
      'WCTR-ELEC (94.2%) has sufficient buffer to absorb routine shift electrical calls.'
    ],
    pmMetrics: [
      { label: 'Overloaded Work Center', value: 'WCTR-MECH (108.4% Load)', status: 'negative' },
      { label: 'Labor Hours Deficit', value: '+13.5 Hours Overload', status: 'negative' },
      { label: 'WCTR-ELEC Utilization', value: '94.2% (Balanced)', status: 'positive' },
      { label: 'WCTR-FAC Utilization', value: '68.5% (Available)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'WCTR-MECH (Mechanical Maintenance)', value: '173.5h Req / 160.0h Cap', variance: '108.4% Overload', detail: '4 Technicians (40h/wk) | 14 active work order operations' },
      { category: 'WCTR-ELEC (Electrical & Instrumentation)', value: '113.0h Req / 120.0h Cap', variance: '94.2% High Normal', detail: '3 Technicians (40h/wk) | 8 active work order operations' },
      { category: 'WCTR-FAC (Facilities & Utilities)', value: '54.8h Req / 80.0h Cap', variance: '68.5% Normal', detail: '2 Technicians (40h/wk) | 6 active work order operations' }
    ],
    recommendedSapActions: [
      { actionName: 'Work Center Capacity Load Overview', tcode: 'CM01', description: 'Display capacity requirements vs available capacity per maintenance work center' },
      { actionName: 'Capacity Leveling & Dispatching', tcode: 'CM25', description: 'Level work center workload by shifting non-critical order operations to Week 2' }
    ]
  },
  {
    questionId: 'Q48',
    questionText: 'Predict which equipment is likely to fail next.',
    category: 'Reliability, Cost & Analytics',
    sapSourceTables: ['EQUI', 'QMIH', 'QMEL', 'MCI1'],
    summaryAnswer: 'Predictive machine learning algorithms combining IoT vibration spectra, thermal telemetry, operating hour counters, and Weibull degradation curves identify 3 equipment assets with the highest probability of near-term failure: 1) Coolant Chiller CHILL-01 (EQ-1010: Failure Probability 88.5% within 14 days, Compressor reed valve blow-by, discharge temp +14°C above baseline), 2) Slurry Transfer Pump PUMP-204 (EQ-1015: Failure Probability 82.0% within 10 days, Mechanical seal barrier fluid pressure dropping 0.2 bar/day), and 3) CNC Lathe LATHE-02 (EQ-1013: Failure Probability 74.5% within 21 days, X-axis ballscrew pre-load loss and servo vibration harmonics).',
    keyInsights: [
      'CHILL-01 (EQ-1010) has an 88.5% failure probability; failure would shut down CNC machining cooling.',
      'PUMP-204 (EQ-1015) barrier fluid leakage indicates inner seal face degradation nearing blow-out.',
      'LATHE-02 (EQ-1013) ballscrew degradation will cause dimensional scrap in automotive shaft machining.',
      'Proactive corrective intervention scheduled during planned shift changeovers will prevent €72,000 in downtime.'
    ],
    pmMetrics: [
      { label: 'Highest Failure Risk Asset', value: 'EQ-1010 (88.5% Risk)', status: 'negative' },
      { label: 'Second Risk Asset', value: 'EQ-1015 (82.0% Risk)', status: 'negative' },
      { label: 'Third Risk Asset', value: 'EQ-1013 (74.5% Risk)', status: 'warning' },
      { label: 'Downtime Avoidance Value', value: '€72,000 Projected', status: 'positive' }
    ],
    breakdownData: [
      { category: 'EQ-1010 (Coolant Chiller CHILL-01)', value: 'Risk: 88.5% (ETA: 14 Days)', variance: 'High Failure Threat', detail: 'Compressor valve failure | Telemetry: 112°C discharge temp | Action: Rebuild valve plate' },
      { category: 'EQ-1015 (Slurry Transfer Pump P-204)', value: 'Risk: 82.0% (ETA: 10 Days)', variance: 'High Failure Threat', detail: 'Seal blowout threat | Telemetry: Barrier fluid drop | Action: Swap seal cartridge' },
      { category: 'EQ-1013 (CNC Lathe LATHE-02)', value: 'Risk: 74.5% (ETA: 21 Days)', variance: 'Moderate Threat', detail: 'Ballscrew backlash | Telemetry: 8.4 mm/s vibration | Action: Pre-load re-alignment' }
    ],
    recommendedSapActions: [
      { actionName: 'Create Proactive Work Order', tcode: 'IW31', description: 'Generate PM01 corrective orders for EQ-1010 and EQ-1015 prior to functional failure' },
      { actionName: 'Display Measurement Document Log', tcode: 'IK17', description: 'Review real-time IoT temperature and vibration trends for high-risk assets' }
    ]
  },
  {
    questionId: 'Q49',
    questionText: 'Show maintenance cost by plant.',
    category: 'Reliability, Cost & Analytics',
    sapSourceTables: ['COEP', 'ACDOCA', 'T001W', 'AUFK', 'MCI8'],
    summaryAnswer: 'Consolidated YTD maintenance cost across manufacturing plants in S/4HANA Controlling: Plant 1000 (Dallas Manufacturing HQ) has spent €248,500 YTD (Budget: €240,000, +3.5% variance, €128,000 materials, €88,500 labor, €32,000 external); Plant 1010 (Houston Assembly & Test) has spent €142,000 YTD (Budget: €150,000, -5.3% favorable variance, highly automated lines); Plant 2000 (Austin Precision Works) has spent €74,500 YTD (Budget: €80,000, -6.9% favorable variance). Enterprise total maintenance spend is €465,000 against a €470,000 budget (-1.1% net favorable variance).',
    keyInsights: [
      'Enterprise total maintenance spend (€465,000) is running 1.1% favorable to annual budget (€470,000).',
      'Plant 1000 (+3.5% over budget) spend was driven by emergency Stamping Press STAMP-01 crankshaft repairs.',
      'Plant 1010 and Plant 2000 are both operating favorably under budget due to high preventive maintenance ratios.',
      'Cost per Replacement Asset Value (RAV) enterprise benchmark is 2.8% (Target: <3.0%, World-Class).'
    ],
    pmMetrics: [
      { label: 'Plant 1000 YTD Spend', value: '€248,500 (+3.5% vs Plan)', status: 'warning' },
      { label: 'Plant 1010 YTD Spend', value: '€142,000 (-5.3% Favorable)', status: 'positive' },
      { label: 'Plant 2000 YTD Spend', value: '€74,500 (-6.9% Favorable)', status: 'positive' },
      { label: 'Enterprise Net Variance', value: '-1.1% Under Budget', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Plant 1000 (Dallas HQ)', value: '€248,500 (Budget: €240k)', variance: '+€8,500 (+3.5%)', detail: '248 Assets | Materials: €128k | Labor: €88.5k | External: €32k' },
      { category: 'Plant 1010 (Houston Assembly)', value: '€142,000 (Budget: €150k)', variance: '-€8,000 (-5.3%)', detail: '184 Assets | Materials: €76k | Labor: €52k | External: €14k' },
      { category: 'Plant 2000 (Austin Precision)', value: '€74,500 (Budget: €80k)', variance: '-€5,500 (-6.9%)', detail: '96 Assets | Materials: €38k | Labor: €30.5k | External: €6k' }
    ],
    recommendedSapActions: [
      { actionName: 'Cross-Plant Cost Comparison', tcode: 'MCI8', description: 'Run cross-plant cost benchmarking in PMIS by cost element and plant code' },
      { actionName: 'Controlling Cost Center Report', tcode: 'S_ALR_87013611', description: 'Display cost center actual/plan variance for all maintenance cost centers' }
    ]
  },
  {
    questionId: 'Q50',
    questionText: 'What should the maintenance manager focus on today?',
    category: 'Reliability, Cost & Analytics',
    sapSourceTables: ['QMEL', 'AUFK', 'MPLA', 'CRHD', 'MCI8'],
    summaryAnswer: 'Executive triage for the Maintenance Manager synthesizes 4 critical operational focus areas for today: 1) Operational Recovery: Supervise final cylinder repressurization on Hydraulic Press HP-400 (Order 4000912, down 5.8h) to restore Line 1 production by 14:30 UTC; 2) Work Center Capacity: Mitigate the 13.5-hour labor overload on Mechanical Crew WCTR-MECH by approving 4h overtime and deferring 2 non-urgent conveyor checks; 3) Safety & Statutory Compliance: Execute mandatory overhead crane brake test (CRANE-02, Plan 500088, 7 days overdue) with visiting TÜV inspector at 13:00; and 4) Supply Chain Expediting: Confirm arrival of Moog proportional valve MAT-VLV-92 to release blocked Molding Machine Order 4000908.',
    keyInsights: [
      'Comprehensive executive action summary consolidating production, capacity, safety, and supply chain.',
      'Immediate milestone: Return Line 1 to service at 14:30 UTC, saving €14,200/hr in potential stoppage loss.',
      'Statutory compliance closure on Crane CRANE-02 removes regulatory OSHA/CE audit exposure.',
      'Capacity leveling on WCTR-MECH ensures on-time completion of remaining 8 scheduled orders today.'
    ],
    pmMetrics: [
      { label: 'Priority 1 Line Recovery', value: 'HP-400 Press (14:30 UTC)', status: 'positive' },
      { label: 'Work Center Re-Leveling', value: 'WCTR-MECH (+13.5h Fix)', status: 'warning' },
      { label: 'Statutory Safety Audit', value: 'CRANE-02 Test (13:00)', status: 'positive' },
      { label: 'Parts Expedited', value: 'Moog Valve (PO 4500019302)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Focus 1: Line 1 Restoration', value: 'Order 4000912 (HP-400)', variance: 'Target 14:30 UTC', detail: 'Tech M. Wagner completing seal test; notify Production Supervisor J. Miller' },
      { category: 'Focus 2: Work Center Leveling', value: 'WCTR-MECH Overload', variance: '108.4% Capacity', detail: 'Authorize 4h overtime; reschedule Orders 4000899 & 4000905 to next shift' },
      { category: 'Focus 3: Statutory Crane Inspection', value: 'Plan 500088 (CRANE-02)', variance: 'TÜV Inspector 13:00', detail: 'Permit-to-work active; crane bay isolated for dynamic load test' },
      { category: 'Focus 4: Parts Delivery Tracking', value: 'PO 4500019302 (Moog Valve)', variance: 'Friday Delivery', detail: 'Staged for weekend installation on Injection Molding Unit INJ-05' }
    ],
    recommendedSapActions: [
      { actionName: 'Supervisor Daily Cockpit', tcode: 'IW38', description: 'Monitor live order execution status, technician dispatch, and order completion' },
      { actionName: 'SAP Fiori Maintenance Manager Dashboard', tcode: 'Fiori App F2173', description: 'Review real-time EAM KPIs, backlog aging, and machine availability' }
    ]
  }
];
