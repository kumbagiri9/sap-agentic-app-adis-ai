import { PmExecutiveQuestionAnswer } from '../types';

export const PM_EXECUTIVE_QUESTIONS_PART1: PmExecutiveQuestionAnswer[] = [
  // =========================================================================
  // PILLAR 1: EQUIPMENT & ASSET HEALTH (Q1 - Q10)
  // =========================================================================
  {
    questionId: 'Q1',
    questionText: 'Show all critical equipment issues today.',
    category: 'Equipment & Asset Health',
    sapSourceTables: ['EQUI', 'EQUZ', 'QMEL', 'AUFK', 'TJ02T', 'ILOA'],
    summaryAnswer: 'Across Plant 1000 and Plant 1010, 4 critical equipment assets have active severe issues today: Hydraulic Press HP-400 (EQ-1004) has an active hydraulic seal rupture (status: NOST/BRKD), CNC Milling Center CNC-01 (EQ-1001) has spindle bearing overheating (vibration +48% over ISO limit), High-Pressure Feed Pump PUMP-101 (EQ-1002) has cavitation alerts, and Autonomous AGV-03 (EQ-1008) has traction drive encoder faults.',
    keyInsights: [
      '4 critical equipment assets flagged with Severity 1 Breakdown or Critical Alarm status.',
      'HP-400 (EQ-1004) hydraulic pressure dropped from 210 bar to 42 bar at 06:15 UTC.',
      'CNC-01 (EQ-1001) IoT vibration telemetry spiked to 8.4 mm/s RMS (ISO 10816 Zone D Danger).',
      'Total production capacity at risk across CNC Cell and Press Line: 38% throughput impairment.'
    ],
    pmMetrics: [
      { label: 'Critical Assets Down/At Risk', value: '4 Assets', status: 'negative' },
      { label: 'Unplanned Downtime Today', value: '5.8 Hours', status: 'negative' },
      { label: 'Open Emergency Orders', value: '2 PM03 Orders', status: 'warning' },
      { label: 'IoT Condition Alarms', value: '6 Alarms', status: 'warning' }
    ],
    breakdownData: [
      { category: 'EQ-1004 (Hydraulic Press HP-400)', value: 'Breakdown / Stoppage', variance: '5.8h Downtime', detail: 'Seal blew out at high-pressure stage; Order 4000912 in execution' },
      { category: 'EQ-1001 (CNC Milling Center 5-Axis)', value: 'Critical Vibration Risk', variance: '+48% Over Limit', detail: 'Spindle bearing 7210-B defect frequency detected by condition monitor' },
      { category: 'EQ-1002 (High-Pressure Pump P-101)', value: 'Cavitation & Heat', variance: '84°C Casing Temp', detail: 'Suction strainer clogged; Notification 10004921 assigned' },
      { category: 'EQ-1008 (AGV Transport Unit 3)', value: 'Drive Inverter Fault', variance: 'Intermittent', detail: 'Traction inverter error code F0022; Work Center WCTR-LOG' }
    ],
    recommendedSapActions: [
      { actionName: 'Equipment Master Status', tcode: 'IE03', description: 'Review system status and operating conditions for EQ-1004 and EQ-1001' },
      { actionName: 'Maintenance Notification Worklist', tcode: 'IW28', description: 'Filter open Priority 1 breakdown notifications across Plant 1000' },
      { actionName: 'Maintenance Order Dispatching', tcode: 'IW38', description: 'Expedite technician crew scheduling for emergency orders' }
    ],
    equipmentOrOrderDetails: [
      { id: 'EQ-1004', name: 'Hydraulic Press HP-400', status: 'DOWN (NOST/BRKD)', metric: '5.8h Downtime', detail: 'Plant 1000, Functional Loc: PL10-PRS-BAY1' },
      { id: 'EQ-1001', name: 'CNC Milling Center 5-Axis', status: 'ALARM (WARN)', metric: '8.4 mm/s RMS', detail: 'Plant 1000, Functional Loc: PL10-CNC-CELL1' },
      { id: 'EQ-1002', name: 'High-Pressure Feed Pump PUMP-101', status: 'DEGRADED', metric: '84°C Head Temp', detail: 'Plant 1010, Functional Loc: PL10-UTL-WTR' },
      { id: 'EQ-1008', name: 'Automated Guided Vehicle AGV-03', status: 'FAULT', metric: 'Error F0022', detail: 'Plant 1000, Functional Loc: PL10-LOG-WH01' }
    ]
  },
  {
    questionId: 'Q2',
    questionText: 'Which machines are currently down?',
    category: 'Equipment & Asset Health',
    sapSourceTables: ['EQUI', 'QMEL', 'AUFK', 'JEST', 'TJ02T'],
    summaryAnswer: 'Currently, 2 machines are in hard breakdown (DOWN) status in S/4HANA Plant Maintenance: 1) Hydraulic Press HP-400 (EQ-1004, Plant 1000, Main Line 1) down since 06:15 AM due to seal failure (Work Order 4000912 in progress), and 2) Robotic Welding Cell ROB-02 (EQ-1012, Plant 1000, Body Shop) down since 09:30 AM due to servomotor encoder failure (Notification 10004930, Work Order 4000918 awaiting spare parts).',
    keyInsights: [
      '2 production machines are currently in hard stoppage (Active Breakdown flag = X in QMEL).',
      'EQ-1004 (Hydraulic Press): Current downtime is 5.8 hours; target return to service is 14:30 UTC.',
      'EQ-1012 (Welding Robot): Down 2.5 hours; spare servomotor 1FK7060 dispatched from Central Warehouse.',
      'Estimated total hourly production loss rate: $14,200/hr during dual-line stoppage.'
    ],
    pmMetrics: [
      { label: 'Active Machine Outages', value: '2 Machines', status: 'negative' },
      { label: 'Total Current Downtime', value: '8.3 Machine-Hours', status: 'negative' },
      { label: 'Technicians On-Site', value: '4 Specialists', status: 'positive' },
      { label: 'ETA Next Recovery', value: '14:30 UTC (HP-400)', status: 'warning' }
    ],
    breakdownData: [
      { category: 'EQ-1004 (Hydraulic Press HP-400)', value: 'Plant 1000 / Press Bay 1', variance: '5.8h Outage', detail: 'Order 4000912 (PM03 Emergency), Mech Tech: M. Wagner' },
      { category: 'EQ-1012 (Robotic Welding Cell 2)', value: 'Plant 1000 / Body Shop', variance: '2.5h Outage', detail: 'Order 4000918 (PM03 Emergency), Elec Tech: S. Meyer' }
    ],
    recommendedSapActions: [
      { actionName: 'Display Breakdown Notifications', tcode: 'IW29', description: 'Monitor live breakdown notifications where MSST (Breakdown) is active' },
      { actionName: 'Maintenance Order Progress', tcode: 'IW32', description: 'Track actual labor hours and part issue confirmations in Order 4000912' }
    ],
    equipmentOrOrderDetails: [
      { id: 'EQ-1004', name: 'Hydraulic Press HP-400', status: 'DOWN', metric: '5.8h Stoppage', detail: 'Order 4000912 | Est. TECO 14:30' },
      { id: 'EQ-1012', name: 'Robotic Welding Cell ROB-02', status: 'DOWN', metric: '2.5h Stoppage', detail: 'Order 4000918 | Parts in Transit' }
    ]
  },
  {
    questionId: 'Q3',
    questionText: 'Which equipment has repeated failures?',
    category: 'Equipment & Asset Health',
    sapSourceTables: ['EQUI', 'QMEL', 'QMFE', 'QMIH', 'AFIH', 'MCI1'],
    summaryAnswer: 'Over the last 90 days in S/4HANA Plant Maintenance, 3 equipment assets exhibit severe repeat failure patterns (>4 unplanned breakdown notifications): 1) Packaging Shrink Wrapper PKG-02 (EQ-1007, 7 breakdowns, heat seal element burnouts), 2) Slurry Transfer Pump PUMP-204 (EQ-1015, 6 breakdowns, mechanical seal dry-run leaks), and 3) Conveyor Belt Drive CONV-10 (EQ-1022, 5 breakdowns, roller bearing seizing).',
    keyInsights: [
      'PKG-02 (EQ-1007) had 7 breakdowns in 90 days; MTBF has dropped to 308 operating hours.',
      'Root cause analysis on PKG-02 shows thermal controller overshoot (PID loop detuned).',
      'PUMP-204 (EQ-1015) failures trace to dry-run condition caused by upstream level transmitter latency.',
      'CONV-10 (EQ-1022) repeat failures are due to abrasive dust ingress; upgrade to labyrinth seals recommended.'
    ],
    pmMetrics: [
      { label: 'Top Repeat Offender', value: 'EQ-1007 (7 Events)', status: 'negative' },
      { label: 'Repeat Breakdown Pool', value: '3 Equipment Assets', status: 'negative' },
      { label: 'Cumulative MTBF Drop', value: '-42% YoY', status: 'negative' },
      { label: 'Repeat Failure Cost', value: '€48,200 (90 Days)', status: 'warning' }
    ],
    breakdownData: [
      { category: 'EQ-1007 (Packaging Shrink Wrapper)', value: '7 Breakdowns / 46h Downtime', variance: 'MTBF: 308h', detail: 'Defect code: HEAT-ELM-BURN (Heating Element Burnout)' },
      { category: 'EQ-1015 (Slurry Transfer Pump P-204)', value: '6 Breakdowns / 38h Downtime', variance: 'MTBF: 360h', detail: 'Defect code: SEAL-MECH-LEAK (Mechanical Seal Blowout)' },
      { category: 'EQ-1022 (Conveyor Belt Drive CONV-10)', value: '5 Breakdowns / 29h Downtime', variance: 'MTBF: 432h', detail: 'Defect code: BRG-SEIZE-CONTAM (Roller Bearing Contamination)' }
    ],
    recommendedSapActions: [
      { actionName: 'Equipment Breakdown History', tcode: 'MCI1', description: 'Analyze breakdown frequency, MTBF trends, and outage causes' },
      { actionName: 'Display Notification Defect Codes', tcode: 'QM03', description: 'Inspect catalog code groups (Code Group PM-MECH, PM-ELEC)' },
      { actionName: 'Maintenance Strategy Redesign', tcode: 'IP11', description: 'Shorten preventive lubrication and inspection cycles for high-wear assets' }
    ]
  },
  {
    questionId: 'Q4',
    questionText: 'Show equipment with the highest downtime.',
    category: 'Equipment & Asset Health',
    sapSourceTables: ['EQUI', 'QMIH', 'QMEL', 'AFIH', 'MCI8'],
    summaryAnswer: 'In the trailing 12 months, the top 3 equipment assets with the highest cumulative downtime across Plant 1000 and Plant 1010 are: 1) Stamping Press STAMP-01 (EQ-1003) with 142.5 total downtime hours across 11 incidents (€112,000 lost production impact), 2) Rotary Kiln Drive KILN-01 (EQ-1019) with 98.2 downtime hours across 3 major overhauls, and 3) Hydraulic Press HP-400 (EQ-1004) with 86.4 downtime hours across 8 breakdown events.',
    keyInsights: [
      'Top 3 assets account for 327.1 hours (54%) of total plant unplanned downtime over 12 months.',
      'STAMP-01 (EQ-1003) experienced a catastrophic main crankshaft bearing failure in Q2 (74h single event).',
      'KILN-01 (EQ-1019) high downtime is driven by long cool-down requirements before refractory maintenance.',
      'Availability for STAMP-01 is currently 91.8%, below the enterprise target threshold of 96.5%.'
    ],
    pmMetrics: [
      { label: 'Highest Cumulative Downtime', value: 'EQ-1003 (142.5 Hours)', status: 'negative' },
      { label: 'Total Plant Downtime (12M)', value: '604.8 Hours', status: 'warning' },
      { label: 'STAMP-01 Availability', value: '91.8% (Target: 96.5%)', status: 'negative' },
      { label: 'Downtime Cost Impact', value: '€348,000 Total', status: 'negative' }
    ],
    breakdownData: [
      { category: 'EQ-1003 (Stamping Press STAMP-01)', value: '142.5 Hours (11 Events)', variance: 'Availability: 91.8%', detail: 'Main bearing overhaul, clutch plate replacement, hydraulic manifold' },
      { category: 'EQ-1019 (Rotary Kiln Drive KILN-01)', value: '98.2 Hours (3 Events)', variance: 'Availability: 94.3%', detail: 'Girth gear alignment, main gearbox pinion replacement, refractory check' },
      { category: 'EQ-1004 (Hydraulic Press HP-400)', value: '86.4 Hours (8 Events)', variance: 'Availability: 95.1%', detail: 'Hydraulic cylinder rebuild, proportional valve recalibration, seal pack' },
      { category: 'EQ-1005 (Centrifugal Compressor COMP-02)', value: '44.0 Hours (4 Events)', variance: 'Availability: 97.5%', detail: 'Impeller rebalancing, dry gas seal replacement' }
    ],
    recommendedSapActions: [
      { actionName: 'Object Statistics / Downtime Analysis', tcode: 'MCI8', description: 'Run SAP PM Plant Maintenance Information System downtime breakdown report' },
      { actionName: 'Equipment Usage & Measurement Documents', tcode: 'IK17', description: 'Review continuous counter and operating hour logs for EQ-1003' }
    ]
  },
  {
    questionId: 'Q5',
    questionText: 'Which assets are overdue for maintenance?',
    category: 'Equipment & Asset Health',
    sapSourceTables: ['MPLA', 'MPOS', 'MMPT', 'EQUI', 'IFLOT'],
    summaryAnswer: 'There are currently 6 assets overdue for scheduled preventive maintenance across Plant 1000 and Plant 1010: Air Compressor COMP-01 (EQ-1006, Plan 500012, 14 days overdue for 2000-hour oil & filter service), CNC Lathe LATHE-04 (EQ-1014, Plan 500045, 9 days overdue for geometric calibration), Overhead Crane CRANE-02 (EQ-1018, Plan 500088, 7 days overdue for annual safety inspection), and 3 secondary fan units (EQ-1025, EQ-1026, EQ-1027, 4-6 days overdue).',
    keyInsights: [
      '6 equipment assets have surpassed their scheduled call date without maintenance order completion.',
      'COMP-01 (EQ-1006) 14 days overdue poses risk of synthetic lubricant thermal degradation and warranty voiding.',
      'CRANE-02 (EQ-1018) statutory safety inspection overdue must be scheduled within 48h to maintain OSHA/CE compliance.',
      'Overdue backlog represents 38 planned maintenance labor hours across Mechanical & Electrical work centers.'
    ],
    pmMetrics: [
      { label: 'Total Overdue Assets', value: '6 Assets', status: 'negative' },
      { label: 'Max Days Overdue', value: '14 Days (EQ-1006)', status: 'negative' },
      { label: 'Statutory/Safety Overdue', value: '1 Asset (CRANE-02)', status: 'negative' },
      { label: 'Total Overdue Labor', value: '38 Planned Hours', status: 'warning' }
    ],
    breakdownData: [
      { category: 'EQ-1006 (Air Compressor COMP-01)', value: '14 Days Overdue', variance: 'Plan 500012', detail: '2,000h PM: Filter cartridge, synthetic lubricant, separator element' },
      { category: 'EQ-1014 (CNC Lathe LATHE-04)', value: '9 Days Overdue', variance: 'Plan 500045', detail: 'Quarterly PM: Guideway geometry, ball screw backlash check' },
      { category: 'EQ-1018 (Overhead Crane CRANE-02)', value: '7 Days Overdue', variance: 'Plan 500088', detail: 'Statutory Annual: Wire rope NDT, brake lining test, load limiters' },
      { category: 'EQ-1025/26/27 (Exhaust Blowers)', value: '4-6 Days Overdue', variance: 'Plan 500102', detail: 'Bi-Monthly PM: V-belt tensioning, grease bearing replenishment' }
    ],
    recommendedSapActions: [
      { actionName: 'Maintenance Plan Scheduling', tcode: 'IP10', description: 'Run schedule call for overdue maintenance plans and generate work orders' },
      { actionName: 'Maintenance Plan Deadline Monitoring', tcode: 'IP30', description: 'Execute batch job RISTRA20 for automatic order call generation' }
    ]
  },
  {
    questionId: 'Q6',
    questionText: 'Show equipment health by plant.',
    category: 'Equipment & Asset Health',
    sapSourceTables: ['EQUI', 'T001W', 'QMEL', 'AUFK', 'MCI8'],
    summaryAnswer: 'Equipment health across the enterprise is consolidated as follows: Plant 1000 (Dallas Manufacturing HQ) has 248 total assets with an average Health Index of 88.4% (92.3% availability, 4 active alarms, 2 down); Plant 1010 (Houston Assembly & Test) has 184 assets with a Health Index of 94.1% (96.8% availability, 1 alarm, 0 down); Plant 2000 (Austin Precision Works) has 96 assets with a Health Index of 96.5% (98.2% availability, 0 alarms, 0 down).',
    keyInsights: [
      'Enterprise total: 528 active equipment master records across 3 manufacturing plants.',
      'Plant 1000 Health Index is 88.4% due to aging heavy press and stamping equipment (Lines 1 & 2).',
      'Plant 1010 maintains strong 94.1% health following recent Q1 robotic cell retrofits.',
      'Plant 2000 exhibits best-in-class 96.5% health with 100% on-time preventive maintenance adherence.'
    ],
    pmMetrics: [
      { label: 'Plant 1000 Health', value: '88.4% (248 Assets)', status: 'warning' },
      { label: 'Plant 1010 Health', value: '94.1% (184 Assets)', status: 'positive' },
      { label: 'Plant 2000 Health', value: '96.5% (96 Assets)', status: 'positive' },
      { label: 'Enterprise Fleet Health', value: '91.8% Weighted Avg', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Plant 1000 (Dallas HQ)', value: '248 Assets | 88.4% Health', variance: '2 Down, 4 Alarms', detail: 'OEE: 82.4% | Preventive Ratio: 68% | Backlog: 42 Orders' },
      { category: 'Plant 1010 (Houston Assembly)', value: '184 Assets | 94.1% Health', variance: '0 Down, 1 Alarm', detail: 'OEE: 89.1% | Preventive Ratio: 81% | Backlog: 16 Orders' },
      { category: 'Plant 2000 (Austin Precision)', value: '96 Assets | 96.5% Health', variance: '0 Down, 0 Alarms', detail: 'OEE: 92.5% | Preventive Ratio: 92% | Backlog: 5 Orders' }
    ],
    recommendedSapActions: [
      { actionName: 'Equipment List by Plant', tcode: 'IH08', description: 'Filter equipment inventory and functional locations by Plant / Maintenance Plant' },
      { actionName: 'PM Plant Comparison Analysis', tcode: 'MCIZ', description: 'Compare cross-plant MTBF, MTTR, and maintenance budget variances' }
    ]
  },
  {
    questionId: 'Q7',
    questionText: 'Which machines have the most breakdown history?',
    category: 'Equipment & Asset Health',
    sapSourceTables: ['EQUI', 'QMIH', 'QMEL', 'AFIH'],
    summaryAnswer: 'In historical records since commissioning, the 3 machines with the highest total lifetime breakdown counts in S/4HANA are: 1) Stamping Press STAMP-01 (EQ-1003, 34 lifetime breakdowns, 412 total downtime hours), 2) Packaging Line PKG-02 (EQ-1007, 28 lifetime breakdowns, 186 total downtime hours), and 3) Injection Molding Unit INJ-05 (EQ-1011, 23 lifetime breakdowns, 214 total downtime hours).',
    keyInsights: [
      'STAMP-01 (EQ-1003) commissioned in 2014 leads all assets with 34 recorded breakdowns.',
      'Mechanical subsystems (hydraulics, clutches, die clamp cylinders) account for 72% of STAMP-01 history.',
      'PKG-02 (EQ-1007) commissioned in 2017 has high breakdown frequency but low average MTTR (6.6 hrs).',
      'INJ-05 (EQ-1011) has experienced recurring barrel heating zone SSR failures and hydraulic proportional valve drift.'
    ],
    pmMetrics: [
      { label: 'Most Lifetime Breakdowns', value: 'EQ-1003 (34 Events)', status: 'negative' },
      { label: 'Second Highest', value: 'EQ-1007 (28 Events)', status: 'negative' },
      { label: 'Third Highest', value: 'EQ-1011 (23 Events)', status: 'warning' },
      { label: 'Total Historical Downtime', value: '812 Hours (Top 3)', status: 'negative' }
    ],
    breakdownData: [
      { category: 'EQ-1003 (Stamping Press STAMP-01)', value: '34 Breakdowns / 412h', variance: 'Installed: 2014', detail: 'Lifetime maintenance spend: €184,500 across 68 work orders' },
      { category: 'EQ-1007 (Packaging Shrink Wrapper)', value: '28 Breakdowns / 186h', variance: 'Installed: 2017', detail: 'Lifetime maintenance spend: €92,400 across 49 work orders' },
      { category: 'EQ-1011 (Injection Molding Unit INJ-05)', value: '23 Breakdowns / 214h', variance: 'Installed: 2016', detail: 'Lifetime maintenance spend: €114,800 across 41 work orders' }
    ],
    recommendedSapActions: [
      { actionName: 'Equipment Historical Log', tcode: 'IE03', description: 'Review historical notifications, work orders, and measurement documents' },
      { actionName: 'Maintenance Analysis (MCI1)', tcode: 'MCI1', description: 'Display lifetime damage codes, cause codes, and downtime distribution' }
    ]
  },
  {
    questionId: 'Q8',
    questionText: 'Show equipment with increasing failure frequency.',
    category: 'Equipment & Asset Health',
    sapSourceTables: ['EQUI', 'QMIH', 'QMEL', 'MCI1'],
    summaryAnswer: 'Predictive reliability trending in S/4HANA identifies 3 equipment assets where the failure frequency rate has accelerated significantly over the last 2 quarters: 1) Coolant Chiller CHILL-01 (EQ-1010): Failures increased from 1 in Q1 to 4 in Q3 (+300% frequency increase, compressor valve wear), 2) CNC Lathe LATHE-02 (EQ-1013): Failures increased from 1 in Q1 to 3 in Q3 (+200%, X-axis ballscrew backlash), and 3) Exhaust Fan EXH-04 (EQ-1024): Failures increased from 0 in Q1 to 3 in Q3 (vibration harmonic deterioration).',
    keyInsights: [
      'CHILL-01 (EQ-1010) Weibull failure slope beta = 2.4, indicating accelerated wear-out phase.',
      'LATHE-02 (EQ-1013) ballscrew degradation is causing dimensional tolerance rejections in Quality Management (QM).',
      'EXH-04 (EQ-1024) unbalance is transferring vibration stress to structural roof purlins.',
      'Recommended intervention: Schedule proactive component replacements before catastrophic failure occurs.'
    ],
    pmMetrics: [
      { label: 'Top Accelerating Asset', value: 'EQ-1010 (+300% Failures)', status: 'negative' },
      { label: 'Assets in Wear-Out Phase', value: '3 Assets', status: 'warning' },
      { label: 'Weibull Slope Beta', value: '2.4 (Aging Phase)', status: 'negative' },
      { label: 'QM Defect Correlation', value: '4 Scrap Lots Linked', status: 'warning' }
    ],
    breakdownData: [
      { category: 'EQ-1010 (Coolant Chiller CHILL-01)', value: 'Q1: 1 -> Q2: 2 -> Q3: 4', variance: '+300% Velocity', detail: 'Semi-hermetic compressor valve reeds leaking; refrigerant discharge pressure high' },
      { category: 'EQ-1013 (CNC Lathe LATHE-02)', value: 'Q1: 1 -> Q2: 2 -> Q3: 3', variance: '+200% Velocity', detail: 'X-axis ballscrew pre-load lost; servo drive following error alarms' },
      { category: 'EQ-1024 (Exhaust Fan EXH-04)', value: 'Q1: 0 -> Q2: 1 -> Q3: 3', variance: 'New Failure Trend', detail: 'Fan rotor buildup causing dynamic unbalance; bearing race spalling' }
    ],
    recommendedSapActions: [
      { actionName: 'Breakdown Analysis Over Time', tcode: 'MCI1', description: 'Analyze quarterly failure trends, mean time between repairs, and cause groups' },
      { actionName: 'Create Corrective Work Order', tcode: 'IW31', description: 'Schedule proactive compressor rebuild order (Order Type PM01)' }
    ]
  },
  {
    questionId: 'Q9',
    questionText: 'Which assets are nearing end of useful life?',
    category: 'Equipment & Asset Health',
    sapSourceTables: ['EQUI', 'EQUZ', 'ANLA', 'ANLC', 'ILOA'],
    summaryAnswer: 'Cross-module analysis between S/4HANA PM (EQUI) and FI-AA Asset Accounting (ANLA/ANLC) identifies 4 assets operating beyond 90% of their designated engineering lifecycle: 1) Stamping Press STAMP-01 (EQ-1003, Asset 1000-40100, 12.8 years in service vs 12-year design life, 94% cumulative depreciation, maintenance cost exceeds 65% of asset replacement value), 2) Air Compressor COMP-02 (EQ-1005, 9.4 of 10 years, 91% life consumed), 3) Boiler Unit BLR-01 (EQ-1020, 18.2 of 20 years), and 4) Manual Milling Machine MIL-08 (EQ-1029, 14.6 of 15 years).',
    keyInsights: [
      '4 major equipment assets are operating in the final 10% of engineering design lifecycle.',
      'STAMP-01 (EQ-1003) annual maintenance spend (€32,400/yr) exceeds the 50% economic replacement threshold.',
      'COMP-02 (EQ-1005) energy efficiency has degraded by 18.4% compared to modern VFD compressors.',
      'Capital expenditure (CapEx) replacement proposals are recommended for the upcoming FY2027 budgeting cycle.'
    ],
    pmMetrics: [
      { label: 'End-of-Life Assets', value: '4 Assets', status: 'warning' },
      { label: 'Max Lifecycle Consumption', value: '106.6% (STAMP-01)', status: 'negative' },
      { label: 'Total Maintenance vs Book Value', value: '184% Ratio', status: 'negative' },
      { label: 'Proposed CapEx Total', value: '€420,000 Budget', status: 'neutral' }
    ],
    breakdownData: [
      { category: 'EQ-1003 (Stamping Press STAMP-01)', value: '12.8 / 12.0 Yrs (106.6%)', variance: 'Beyond Design Life', detail: 'Net Book Value: €12,500 | Annual PM Spend: €32,400 | CapEx candidate' },
      { category: 'EQ-1005 (Air Compressor COMP-02)', value: '9.4 / 10.0 Yrs (94.0%)', variance: 'Near EOL', detail: 'Net Book Value: €8,200 | Energy loss: +18.4% kWh/m³ | CapEx candidate' },
      { category: 'EQ-1020 (Gas Boiler Unit BLR-01)', value: '18.2 / 20.0 Yrs (91.0%)', variance: 'Near EOL', detail: 'Heat exchanger tube thickness nearing minimum ASME code threshold' },
      { category: 'EQ-1029 (Manual Mill MIL-08)', value: '14.6 / 15.0 Yrs (97.3%)', variance: 'Near EOL', detail: 'Slideway wear severe; replacement by 3-axis CNC recommended' }
    ],
    recommendedSapActions: [
      { actionName: 'Display Asset Master (FI-AA)', tcode: 'AS03', description: 'Review asset capitalization date, useful life, and net book value' },
      { actionName: 'Equipment Cost Settlement Analysis', tcode: 'KKBC_ORD', description: 'Evaluate lifetime maintenance order actual cost rollups on equipment' }
    ]
  },
  {
    questionId: 'Q10',
    questionText: 'What maintenance issues need immediate attention?',
    category: 'Equipment & Asset Health',
    sapSourceTables: ['QMEL', 'AUFK', 'EQUI', 'TJ02T'],
    summaryAnswer: 'Immediate priority triage highlights 3 critical actions requiring urgent management intervention today: 1) Complete hydraulic seal rebuild and repressurization on Hydraulic Press HP-400 (EQ-1004, Order 4000912, Main Press Bay down 5.8h), 2) Expedite spare servomotor pickup from Central Stores for Robotic Welder ROB-02 (EQ-1012, Order 4000918), and 3) Schedule mandatory crane brake safety inspection on CRANE-02 (EQ-1018, Plan 500088, 7 days overdue).',
    keyInsights: [
      'Top operational focus: Restore Main Line 1 throughput by finishing HP-400 seal replacement by 14:30 UTC.',
      'Logistics focus: Release reservation 8840192 for ROB-02 motor 1FK7060 at Central Warehouse Bin B-12-04.',
      'Safety & Compliance focus: Issue permit-to-work for CRANE-02 crane load brake certification.',
      'Preventive backlog focus: Clear 6 overdue maintenance plans before Friday shift turnover.'
    ],
    pmMetrics: [
      { label: 'Immediate Action Items', value: '3 Critical Tasks', status: 'negative' },
      { label: 'Down Assets Awaiting Fix', value: '2 Production Machines', status: 'negative' },
      { label: 'Safety Inspections Overdue', value: '1 Crane Asset', status: 'negative' },
      { label: 'Target Line Recovery', value: 'Today by 14:30 UTC', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Action 1: HP-400 Hydraulic Press', value: 'Order 4000912 (PM03)', variance: 'In Execution', detail: 'Seal pack installed; cylinder flush and bleeding in progress' },
      { category: 'Action 2: ROB-02 Robotic Welder', value: 'Order 4000918 (PM03)', variance: 'Parts Staged', detail: 'Servomotor 1FK7060 issued from MIGO 261; electrician dispatched' },
      { category: 'Action 3: CRANE-02 Overhead Crane', value: 'Plan 500088 (PM02)', variance: 'Permit Required', detail: 'Third-party TÜV inspector on-site at 13:00 for brake lining test' }
    ],
    recommendedSapActions: [
      { actionName: 'Maintenance Supervisor Worklist', tcode: 'IW38', description: 'Monitor live status of in-process emergency orders and technician dispatch' },
      { actionName: 'Goods Issue to Order', tcode: 'MIGO', description: 'Confirm movement type 261 parts issues for Order 4000918' }
    ]
  },

  // =========================================================================
  // PILLAR 2: MAINTENANCE NOTIFICATIONS (Q11 - Q20)
  // =========================================================================
  {
    questionId: 'Q11',
    questionText: 'Show all open maintenance notifications.',
    category: 'Maintenance Notifications',
    sapSourceTables: ['QMEL', 'EQUI', 'IFLOT', 'TJ02T', 'JEST'],
    summaryAnswer: 'There are currently 24 open maintenance notifications across Plant 1000 and Plant 1010 in S/4HANA: 4 Breakdown Notifications (Type M2, Priority 1-Very High), 12 Corrective Maintenance Requests (Type M1, Priorities 2-3), and 8 Condition Monitoring / Preventive Notifications (Type M3). Currently, 8 are in status Outstanding (OSNO), 11 are In Process (NOPR), and 5 are awaiting technical completion approval.',
    keyInsights: [
      '24 total open maintenance notifications across the operational asset base.',
      '4 Type M2 (Breakdown) notifications currently active on production lines.',
      '12 Type M1 (Corrective) notifications generated by shop floor operators and maintenance technicians.',
      '8 Type M3 (Condition Monitoring) notifications triggered by IoT sensor telemetry threshold crossings.'
    ],
    pmMetrics: [
      { label: 'Total Open Notifications', value: '24 Notifications', status: 'warning' },
      { label: 'Breakdowns (Type M2)', value: '4 Notifications', status: 'negative' },
      { label: 'Corrective (Type M1)', value: '12 Notifications', status: 'neutral' },
      { label: 'Condition Alerts (Type M3)', value: '8 Notifications', status: 'warning' }
    ],
    breakdownData: [
      { category: 'Type M2: Breakdown Reports', value: '4 Open (10004928, 10004930, 10004933, 10004935)', variance: 'Priority 1 (Very High)', detail: 'Assets: HP-400, ROB-02, PUMP-101, CONV-04' },
      { category: 'Type M1: Maintenance Requests', value: '12 Open (10004910 to 10004927)', variance: 'Priority 2-3 (High/Med)', detail: 'Minor leaks, belt adjustments, safety guard repainting' },
      { category: 'Type M3: Condition Monitoring', value: '8 Open (10004901 to 10004909)', variance: 'Auto-Created IoT', detail: 'Vibration high alarms on CNC spindle and blower motors' }
    ],
    recommendedSapActions: [
      { actionName: 'Display Notification Worklist', tcode: 'IW28', description: 'Filter open notifications by plant, notification type, and priority' },
      { actionName: 'Change Notification', tcode: 'IW22', description: 'Assign tasks, partner functions, or convert notification to work order' }
    ]
  },
  {
    questionId: 'Q12',
    questionText: 'Which notifications are overdue?',
    category: 'Maintenance Notifications',
    sapSourceTables: ['QMEL', 'EQUI', 'TJ02T'],
    summaryAnswer: 'Currently, 5 maintenance notifications have exceeded their required start/end completion deadlines in S/4HANA: Notification 10004892 (EQ-1005 Air Compressor oil leak, 8 days overdue), Notification 10004898 (EQ-1014 Lathe coolant pump low flow, 6 days overdue), Notification 10004904 (EQ-1021 Exhaust duct vibration, 5 days overdue), Notification 10004911 (EQ-1016 Conveyor motor thermal trip, 3 days overdue), and Notification 10004915 (EQ-1009 Palletizer sensor misalignment, 2 days overdue).',
    keyInsights: [
      '5 notifications have breached their SLA resolution dates without technical completion.',
      'Notification 10004892 (Compressor leak) delay is due to waiting for non-stock fluorocarbon O-ring delivery.',
      'Notification 10004898 (Coolant flow) is causing minor tool wear acceleration on CNC Lathe 4.',
      'Average delay across the 5 overdue notifications is 4.8 days.'
    ],
    pmMetrics: [
      { label: 'Overdue Notifications', value: '5 Notifications', status: 'negative' },
      { label: 'Longest Overdue', value: '8 Days (10004892)', status: 'negative' },
      { label: 'Average SLA Delay', value: '4.8 Days', status: 'warning' },
      { label: 'Pending Spare Parts', value: '2 Notifications', status: 'neutral' }
    ],
    breakdownData: [
      { category: 'Notif 10004892 (Air Compressor Oil Leak)', value: '8 Days Overdue', variance: 'Priority 2 (High)', detail: 'EQ-1005 | Waiting for special Viton gasket delivery from vendor Parker' },
      { category: 'Notif 10004898 (Lathe Coolant Low Flow)', value: '6 Days Overdue', variance: 'Priority 3 (Medium)', detail: 'EQ-1014 | Strainer mesh clean and pump impeller de-clogging required' },
      { category: 'Notif 10004904 (Exhaust Duct Vibration)', value: '5 Days Overdue', variance: 'Priority 3 (Medium)', detail: 'EQ-1021 | Flexible connector bracket cracked; weld repair needed' },
      { category: 'Notif 10004911 (Conveyor Motor Thermal Trip)', value: '3 Days Overdue', variance: 'Priority 2 (High)', detail: 'EQ-1016 | Motor overload relay calibration and thermal imaging' },
      { category: 'Notif 10004915 (Palletizer Sensor Misaligned)', value: '2 Days Overdue', variance: 'Priority 3 (Medium)', detail: 'EQ-1009 | Photoelectric sensor bracket bent by fork truck collision' }
    ],
    recommendedSapActions: [
      { actionName: 'Display Notification Multi-List', tcode: 'IW29', description: 'Filter notifications by Required End Date < Current Date' },
      { actionName: 'Expedite Purchase Requisition', tcode: 'ME53N', description: 'Check vendor delivery status for PR 10048192 (O-ring gasket)' }
    ]
  },
  {
    questionId: 'Q13',
    questionText: 'Show notifications created today.',
    category: 'Maintenance Notifications',
    sapSourceTables: ['QMEL', 'EQUI', 'T001W'],
    summaryAnswer: 'Today in S/4HANA Plant Maintenance, 7 new maintenance notifications were created across Plant 1000 and Plant 1010: 2 Breakdown Reports (10004933 on Hydraulic Press HP-400, 10004935 on Robotic Welder ROB-02), 3 Operator Maintenance Requests (10004936 Gearbox noise, 10004937 Safety light curtain fault, 10004938 Pneumatic cylinder air hiss), and 2 Automated IoT Condition Alerts (10004939 Spindle temperature, 10004940 Bearing vibration).',
    keyInsights: [
      '7 new maintenance notifications logged today (5 manual shop floor reports, 2 automated IoT alerts).',
      '2 breakdown notifications immediately converted to Emergency Work Orders 4000912 and 4000918.',
      'Notification creation rate today (+40% vs average daily baseline of 5.0) reflects Monday shift startup surges.',
      'All 7 notifications have been assigned planner groups within 15 minutes of logging.'
    ],
    pmMetrics: [
      { label: 'Notifications Created Today', value: '7 Notifications', status: 'positive' },
      { label: 'Breakdown Reports', value: '2 Notifications', status: 'negative' },
      { label: 'Converted to Work Orders', value: '3 Converted (42.8%)', status: 'positive' },
      { label: 'IoT Condition Alerts', value: '2 Automated', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Notif 10004933 (Hydraulic Press HP-400)', value: 'Created 06:18 UTC', variance: 'Breakdown (M2)', detail: 'Main ram seal ruptured; converted to Order 4000912' },
      { category: 'Notif 10004935 (Robotic Welder ROB-02)', value: 'Created 09:34 UTC', variance: 'Breakdown (M2)', detail: 'Servomotor encoder fault; converted to Order 4000918' },
      { category: 'Notif 10004936 (Gearbox Noise Line 3)', value: 'Created 10:12 UTC', variance: 'Request (M1)', detail: 'Grinding noise reported by line supervisor J. Miller' },
      { category: 'Notif 10004937 (Safety Light Curtain)', value: 'Created 11:05 UTC', variance: 'Request (M1)', detail: 'Safety interlock intermittent tripping at Cell 4' },
      { category: 'Notif 10004938 (Pneumatic Leak Cell 2)', value: 'Created 11:45 UTC', variance: 'Request (M1)', detail: 'Quick-connect fitting leaking 6 bar compressed air' },
      { category: 'Notif 10004939 (CNC Spindle Temp Spike)', value: 'Created 12:10 UTC', variance: 'IoT Alert (M3)', detail: 'Spindle bearing reached 78°C (threshold: 75°C)' },
      { category: 'Notif 10004940 (Blower Bearing Vibration)', value: 'Created 12:35 UTC', variance: 'IoT Alert (M3)', detail: 'Exhaust fan overall RMS velocity reached 5.8 mm/s' }
    ],
    recommendedSapActions: [
      { actionName: 'Daily Notification Review', tcode: 'IW28', description: 'Review today’s created notifications and assign maintenance crews' },
      { actionName: 'Create Work Order from Notification', tcode: 'IW22', description: 'Convert Notif 10004936 and 10004937 into scheduled maintenance orders' }
    ]
  },
  {
    questionId: 'Q14',
    questionText: 'Which notifications are marked as breakdowns?',
    category: 'Maintenance Notifications',
    sapSourceTables: ['QMEL', 'EQUI', 'TJ02T', 'QMIH'],
    summaryAnswer: 'There are currently 4 active maintenance notifications with the Breakdown Flag (MSST = X) set in S/4HANA: 1) Notification 10004933 (EQ-1004 Hydraulic Press HP-400, Breakdown duration: 5.8h, Line 1 down), 2) Notification 10004935 (EQ-1012 Robotic Welder ROB-02, Breakdown duration: 2.5h, Body Shop down), 3) Notification 10004928 (EQ-1002 Feed Pump P-101, Breakdown duration: 1.2h, Degraded line feed), and 4) Notification 10004930 (EQ-1022 Conveyor Drive CONV-10, Breakdown duration: 0.8h, Infeed slowed).',
    keyInsights: [
      '4 notifications have active breakdown status (MSST), recording downtime in the plant info system (PMIS).',
      'Combined current downtime across active breakdowns: 10.3 machine-hours.',
      'All 4 have been assigned Priority 1 (Very High) with dedicated maintenance technicians on-site.',
      'Standard breakdown response time SLA (target < 15 minutes) was achieved in 100% of today’s events.'
    ],
    pmMetrics: [
      { label: 'Active Breakdown Notifications', value: '4 Notifications', status: 'negative' },
      { label: 'Total Downtime Accumulated', value: '10.3 Hours', status: 'negative' },
      { label: 'Production Lines Impacted', value: '3 Production Lines', status: 'negative' },
      { label: 'Response Time SLA', value: '11.2 Min Avg (<15m)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Notif 10004933 (HP-400 Press)', value: '5.8h Downtime', variance: 'Line 1 Stopped', detail: 'Order 4000912 | Tech: M. Wagner | Seal replacement' },
      { category: 'Notif 10004935 (ROB-02 Welder)', value: '2.5h Downtime', variance: 'Body Shop Stopped', detail: 'Order 4000918 | Tech: S. Meyer | Servomotor replacement' },
      { category: 'Notif 10004928 (P-101 Feed Pump)', value: '1.2h Downtime', variance: 'Line 2 Reduced 50%', detail: 'Order 4000915 | Tech: D. Schmidt | Impeller un-jamming' },
      { category: 'Notif 10004930 (CONV-10 Conveyor)', value: '0.8h Downtime', variance: 'Infeed Stoppage', detail: 'Order 4000920 | Tech: K. Becker | Drive chain tensioning' }
    ],
    recommendedSapActions: [
      { actionName: 'Breakdown Worklist Monitor', tcode: 'IW28', description: 'Monitor breakdown notifications with status MSST in real-time' },
      { actionName: 'Record Breakdown Details', tcode: 'IW22', description: 'Ensure malfunction start/end times and breakdown duration are accurate for PMIS' }
    ]
  },
  {
    questionId: 'Q15',
    questionText: 'Show high-priority maintenance notifications.',
    category: 'Maintenance Notifications',
    sapSourceTables: ['QMEL', 'EQUI', 'T356', 'T356_T'],
    summaryAnswer: 'In S/4HANA Plant Maintenance, there are currently 7 high-priority notifications (Priority 1-Very High or Priority 2-High): 4 Priority 1 (Emergency Breakdowns on HP-400, ROB-02, PUMP-101, CONV-10) and 3 Priority 2 (High: Notification 10004922 CNC Spindle Bearing Thermal Warning, Notification 10004925 Main Substation Transformer Oil Temp, Notification 10004927 Boiler Feed Water Deaerator Pressure Low).',
    keyInsights: [
      '7 high-priority notifications requiring expedited scheduling and technician staffing.',
      '4 Priority 1 notifications are active breakdown stoppage emergencies.',
      '3 Priority 2 notifications represent imminent failure threats if not addressed within 24 hours.',
      'Priority 2 notifications on Transformer and Boiler are scheduled for inspection during the 18:00 shift break.'
    ],
    pmMetrics: [
      { label: 'Priority 1 (Very High)', value: '4 Notifications', status: 'negative' },
      { label: 'Priority 2 (High)', value: '3 Notifications', status: 'warning' },
      { label: 'Total High Priority Pool', value: '7 Notifications', status: 'warning' },
      { label: '24h Resolution SLA Target', value: '100% On-Track', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Priority 1: Notif 10004933 (Hydraulic Press)', value: 'Breakdown / Down', variance: 'SLA: 4 Hours', detail: 'Order 4000912 | Mechanical repair team active' },
      { category: 'Priority 1: Notif 10004935 (Robotic Welder)', value: 'Breakdown / Down', variance: 'SLA: 4 Hours', detail: 'Order 4000918 | Electrical team active' },
      { category: 'Priority 1: Notif 10004928 (Feed Pump P-101)', value: 'Breakdown / Down', variance: 'SLA: 4 Hours', detail: 'Order 4000915 | Utility maintenance crew' },
      { category: 'Priority 1: Notif 10004930 (Conveyor Drive)', value: 'Breakdown / Down', variance: 'SLA: 4 Hours', detail: 'Order 4000920 | Material handling team' },
      { category: 'Priority 2: Notif 10004922 (CNC Spindle Overheat)', value: 'Imminent Failure', variance: 'SLA: 24 Hours', detail: 'Vibration monitoring team running spectral analysis' },
      { category: 'Priority 2: Notif 10004925 (Substation Transformer)', value: 'Imminent Failure', variance: 'SLA: 24 Hours', detail: 'High-voltage electricians scheduled for 18:00 break' },
      { category: 'Priority 2: Notif 10004927 (Boiler Deaerator)', value: 'Imminent Failure', variance: 'SLA: 24 Hours', detail: 'Stationary engineer inspecting pressure control valve' }
    ],
    recommendedSapActions: [
      { actionName: 'Priority-Based Notification List', tcode: 'IW28', description: 'Filter notifications by Priority 1 (Very High) and Priority 2 (High)' },
      { actionName: 'Assign Maintenance Resources', tcode: 'IW37N', description: 'Assign work center capacity and personnel to high-priority maintenance orders' }
    ]
  },
  {
    questionId: 'Q16',
    questionText: 'Which notifications have no assigned technician?',
    category: 'Maintenance Notifications',
    sapSourceTables: ['QMEL', 'IHPA', 'PA0002'],
    summaryAnswer: 'Currently, 6 open maintenance notifications do not have an assigned responsible technician (Partner Function VW - Person Responsible or PARNR empty) in S/4HANA: 1) Notification 10004924 (EQ-1017 Air Handling Unit filter replacement), 2) Notification 10004926 (EQ-1023 Packaging Conveyor roller squeak), 3) Notification 10004929 (EQ-1028 Oil mist collector low suction), 4) Notification 10004931 (EQ-1030 Overhead door limit switch), 5) Notification 10004934 (EQ-1031 Water softener brine tank check), and 6) Notification 10004938 (EQ-1035 Pneumatic fitting hiss).',
    keyInsights: [
      '6 open notifications are unassigned and sitting in the planner triage pool.',
      'All 6 unassigned notifications are Priority 3 (Medium) or Priority 4 (Low) corrective tasks.',
      'Mechanical Maintenance Planner Group (PG-MECH) owns 4; Facilities Planner Group (PG-FAC) owns 2.',
      'Recommended action: Auto-dispatch to available shift technicians based on work center load.'
    ],
    pmMetrics: [
      { label: 'Unassigned Notifications', value: '6 Notifications', status: 'warning' },
      { label: 'Priority 3/4 Tasks', value: '100% of Unassigned', status: 'neutral' },
      { label: 'Average Age in Pool', value: '4.2 Hours', status: 'positive' },
      { label: 'Technicians Available', value: '3 On-Shift', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Notif 10004924 (Air Handling Unit Filters)', value: 'Planner: PG-FAC', variance: 'Priority 3', detail: 'Estimated labor: 1.5h | Recommended Tech: R. Taylor' },
      { category: 'Notif 10004926 (Packaging Conveyor Squeak)', value: 'Planner: PG-MECH', variance: 'Priority 3', detail: 'Estimated labor: 1.0h | Recommended Tech: K. Becker' },
      { category: 'Notif 10004929 (Oil Mist Collector Low Suction)', value: 'Planner: PG-MECH', variance: 'Priority 3', detail: 'Estimated labor: 2.0h | Recommended Tech: M. Wagner' },
      { category: 'Notif 10004931 (Overhead Door Limit Switch)', value: 'Planner: PG-FAC', variance: 'Priority 4', detail: 'Estimated labor: 0.5h | Recommended Tech: R. Taylor' },
      { category: 'Notif 10004934 (Water Softener Brine Check)', value: 'Planner: PG-FAC', variance: 'Priority 4', detail: 'Estimated labor: 0.5h | Recommended Tech: J. Davis' },
      { category: 'Notif 10004938 (Pneumatic Fitting Hiss)', value: 'Planner: PG-MECH', variance: 'Priority 3', detail: 'Estimated labor: 1.0h | Recommended Tech: D. Schmidt' }
    ],
    recommendedSapActions: [
      { actionName: 'Assign Partner to Notification', tcode: 'IW22', description: 'Enter Partner Function VW (Person Responsible) in notification header' },
      { actionName: 'Resource Scheduling for PM', tcode: 'MRS', description: 'Execute SAP Multi-Resource Scheduling to auto-dispatch technicians' }
    ]
  },
  {
    questionId: 'Q17',
    questionText: 'Which notifications have been open for more than 48 hours?',
    category: 'Maintenance Notifications',
    sapSourceTables: ['QMEL', 'EQUI', 'TJ02T'],
    summaryAnswer: 'In S/4HANA Plant Maintenance, 3 notifications have remained in open status (OSNO or NOPR) for over 48 hours: 1) Notification 10004892 (EQ-1005 Air Compressor oil leak, open for 192 hours / 8 days, waiting for special seal), 2) Notification 10004898 (EQ-1014 Lathe coolant flow, open for 144 hours / 6 days, awaiting scheduled machine idle window), and 3) Notification 10004904 (EQ-1021 Exhaust duct vibration, open for 120 hours / 5 days, waiting for structural welder availability).',
    keyInsights: [
      '3 notifications exceed the 48-hour standard aging threshold for open work requests.',
      'No active production stoppage is caused by these 3 aging notifications.',
      'All 3 aging items have verified root causes and documented reason codes in notification long text.',
      'Expediting protocol initiated for Notification 10004892 upon parts receipt scheduled for tomorrow 08:00.'
    ],
    pmMetrics: [
      { label: 'Notifications >48h Open', value: '3 Notifications', status: 'warning' },
      { label: 'Longest Open Age', value: '192 Hours (8 Days)', status: 'negative' },
      { label: 'Awaiting Spare Parts', value: '1 Notification', status: 'neutral' },
      { label: 'Awaiting Machine Window', value: '2 Notifications', status: 'neutral' }
    ],
    breakdownData: [
      { category: 'Notif 10004892 (Compressor Oil Leak)', value: 'Open 192h (8 Days)', variance: 'Parts Block', detail: 'Vendor PO 4500019288 delivery confirmed for tomorrow morning' },
      { category: 'Notif 10004898 (Lathe Coolant Flow)', value: 'Open 144h (6 Days)', variance: 'Production Hold', detail: 'Production scheduler agreed to 2h maintenance window Wednesday 06:00' },
      { category: 'Notif 10004904 (Exhaust Duct Vibration)', value: 'Open 120h (5 Days)', variance: 'Skills Block', detail: 'Certified structural welder scheduled for Thursday morning shift' }
    ],
    recommendedSapActions: [
      { actionName: 'Aging Notification Report', tcode: 'IW28', description: 'Filter notifications where Creation Date < Current Date - 2 Days' },
      { actionName: 'Review Notification Long Text', tcode: 'IW23', description: 'Inspect status logs and engineering reason notes for overdue notifications' }
    ]
  },
  {
    questionId: 'Q18',
    questionText: 'Show notifications by equipment.',
    category: 'Maintenance Notifications',
    sapSourceTables: ['QMEL', 'EQUI', 'IFLOT'],
    summaryAnswer: 'Distribution of the 24 open maintenance notifications across major equipment assets is: Hydraulic Press HP-400 (EQ-1004) has 3 notifications (hydraulic leak, pressure transducer fault, seal breakdown); CNC Milling Center CNC-01 (EQ-1001) has 3 notifications (spindle temp, tool changer sensor, lubrication flow); Packaging Unit PKG-02 (EQ-1007) has 2 notifications; Robotic Welder ROB-02 (EQ-1012) has 2 notifications; and 14 other individual equipment assets have 1 notification each.',
    keyInsights: [
      'Top 4 equipment assets account for 10 of 24 open notifications (41.6%).',
      'EQ-1004 and EQ-1001 represent the highest operational complexity clusters.',
      'Multiple open notifications on a single machine indicate potential systemic subsystem wear.',
      'Recommendation: Bundle open notifications on EQ-1004 and EQ-1001 into consolidated work orders.'
    ],
    pmMetrics: [
      { label: 'Highest Notif Concentration', value: 'EQ-1004 (3 Notifs)', status: 'negative' },
      { label: 'Second Concentration', value: 'EQ-1001 (3 Notifs)', status: 'warning' },
      { label: 'Assets with Multiple Notifs', value: '4 Equipment Assets', status: 'warning' },
      { label: 'Assets with Single Notif', value: '14 Equipment Assets', status: 'positive' }
    ],
    breakdownData: [
      { category: 'EQ-1004 (Hydraulic Press HP-400)', value: '3 Notifications (10004921, 10004929, 10004933)', variance: 'Press Bay 1', detail: '1 Breakdown, 1 Mechanical Request, 1 Condition Alert' },
      { category: 'EQ-1001 (CNC Milling Center CNC-01)', value: '3 Notifications (10004918, 10004932, 10004939)', variance: 'CNC Cell 1', detail: '1 High Priority Spindle Alert, 2 Minor Electrical Requests' },
      { category: 'EQ-1007 (Packaging Shrink Wrapper)', value: '2 Notifications (10004915, 10004926)', variance: 'Packaging Line', detail: '1 Heating element warning, 1 roller bearing squeak' },
      { category: 'EQ-1012 (Robotic Welding Cell ROB-02)', value: '2 Notifications (10004919, 10004935)', variance: 'Body Shop', detail: '1 Breakdown, 1 Wire feed tension alarm' },
      { category: 'Other 14 Assets', value: '14 Notifications (1 each)', variance: 'Plant-Wide', detail: 'Various minor mechanical, electrical, and facility requests' }
    ],
    recommendedSapActions: [
      { actionName: 'Equipment Notification History', tcode: 'IW29', description: 'Filter all historical and active notifications for Equipment EQ-1004 and EQ-1001' },
      { actionName: 'Consolidate Notifications to Order', tcode: 'IW31', description: 'Create multi-notification maintenance order with shared object list' }
    ]
  },
  {
    questionId: 'Q19',
    questionText: 'Which defects are recurring?',
    category: 'Maintenance Notifications',
    sapSourceTables: ['QMFE', 'QMEL', 'QPCT', 'EQUI'],
    summaryAnswer: 'Catalog code defect analysis across S/4HANA maintenance notification items (QMFE) over the past 6 months reveals 4 major recurring defect types: 1) Hydraulic Seal Extrusion / Blowout (Defect Code HYD-SEAL-BLOW, 18 occurrences, €34,200 repair cost), 2) Heating Element Thermal Open-Circuit (Defect Code ELEC-HEAT-OPEN, 14 occurrences, Packaging lines), 3) Spindle / Roller Bearing Fatigue Spalling (Defect Code MECH-BRG-SPALL, 11 occurrences, CNC & Blowers), and 4) Proximity Sensor Misalignment (Defect Code SENS-PROX-ALIGN, 9 occurrences, Conveyors).',
    keyInsights: [
      'Hydraulic seal blowouts lead all recurring defects with 18 incidents across heavy press equipment.',
      'Analysis indicates hydraulic oil thermal degradation (operating temp >68°C) is hardening nitrile seals.',
      'Switching from NBR (Nitrile) to FKM (Viton) seals is estimated to eliminate 85% of hydraulic seal failures.',
      'Heating element failures on packaging lines are linked to uncalibrated SCR power controllers.'
    ],
    pmMetrics: [
      { label: 'Top Recurring Defect', value: 'Hydraulic Seal (18 Events)', status: 'negative' },
      { label: 'Second Defect', value: 'Heating Element (14 Events)', status: 'negative' },
      { label: 'Third Defect', value: 'Bearing Spalling (11 Events)', status: 'warning' },
      { label: 'Repeat Defect Cost', value: '€78,400 (6 Months)', status: 'negative' }
    ],
    breakdownData: [
      { category: 'Code HYD-SEAL-BLOW (Hydraulic Seal Failure)', value: '18 Occurrences / €34,200', variance: 'Catalog: PM-HYD', detail: 'Affected: HP-400, STAMP-01, INJ-05 | Root cause: Thermal hardening' },
      { category: 'Code ELEC-HEAT-OPEN (Heating Element Burnout)', value: '14 Occurrences / €18,600', variance: 'Catalog: PM-ELEC', detail: 'Affected: PKG-02, PKG-03, SEAL-01 | Root cause: SCR voltage spikes' },
      { category: 'Code MECH-BRG-SPALL (Bearing Spalling/Wear)', value: '11 Occurrences / €16,400', variance: 'Catalog: PM-MECH', detail: 'Affected: CNC-01, EXH-04, PUMP-101 | Root cause: Lubricant starvation' },
      { category: 'Code SENS-PROX-ALIGN (Sensor Misaligned)', value: '9 Occurrences / €9,200', variance: 'Catalog: PM-INST', detail: 'Affected: CONV-04, CONV-10, AGV-03 | Root cause: Mechanical vibration' }
    ],
    recommendedSapActions: [
      { actionName: 'Defect Analysis in PMIS', tcode: 'MCI5', description: 'Run defect cause and damage code frequency reports in Plant Maintenance' },
      { actionName: 'Catalog & Code Group Maintenance', tcode: 'QS41', description: 'Review catalog type C (Defect Types) and Code Group PM-HYD specifications' }
    ]
  },
  {
    questionId: 'Q20',
    questionText: 'Create a maintenance notification for Equipment EQ-1001.',
    category: 'Maintenance Notifications',
    sapSourceTables: ['QMEL', 'EQUI', 'IFLOT', 'T356'],
    summaryAnswer: 'Maintenance Notification creation workflow initiated for Equipment EQ-1001 (5-Axis CNC Milling Center CNC-01, Plant 1000, Functional Location PL10-CNC-CELL1): System validated Equipment Master status (Operational AVLB), determined Planner Group PG-MECH, auto-populated Cost Center CC-PRD-100, and staged S/4HANA BAPI_ALM_NOTIF_CREATE payload with Notification Type M1 (Corrective Maintenance Request), Priority 2 (High), and Defect Code MECH-BRG-WARN.',
    keyInsights: [
      'Equipment EQ-1001 validated in S/4HANA: 5-Axis CNC Milling Center, Serial SN-CNC-2021-0044.',
      'Functional location verified: PL10-CNC-CELL1 (Dallas Machining Bay Cell 1).',
      'Notification staged for immediate BAPI creation with live S/4HANA transactional integrity.',
      'Notification number pre-allocated from S/4 number range interval: 10004941.'
    ],
    pmMetrics: [
      { label: 'Target Equipment', value: 'EQ-1001 (CNC-01)', status: 'positive' },
      { label: 'Notification Type', value: 'M1 (Corrective Request)', status: 'positive' },
      { label: 'Priority Assigned', value: 'Priority 2 (High)', status: 'warning' },
      { label: 'Staged Notif ID', value: '10004941 (Staged)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Equipment Master Attributes', value: 'EQ-1001 (CNC Milling Center)', variance: 'Plant 1000', detail: 'Work Center: WCTR-MACH | Manufacturer: DMG Mori | Model: DMU 50' },
      { category: 'Malfunction Details', value: 'Spindle Bearing Thermal Alarm', variance: 'Severity High', detail: 'Temperature reached 78°C; vibration increased to 8.4 mm/s RMS' },
      { category: 'Partner Functions', value: 'Reported by Operator / AI Copilot', variance: 'Assigned: PG-MECH', detail: 'Responsible Tech: M. Wagner | Planner Group: PG-MECH' }
    ],
    recommendedSapActions: [
      { actionName: 'Create Notification', tcode: 'IW21', description: 'Execute BAPI_ALM_NOTIF_CREATE to post notification directly to S/4HANA' },
      { actionName: 'Display Created Notification', tcode: 'IW23', description: 'Review newly generated notification 10004941 in S/4HANA Plant Maintenance' }
    ],
    equipmentOrOrderDetails: [
      { id: 'EQ-1001', name: '5-Axis CNC Milling Center CNC-01', status: 'ACTIVE NOTIF CREATED', metric: 'Notif 10004941', detail: 'Priority 2 High | Spindle Bearing Thermal Warning | Plant 1000' }
    ]
  },

  // =========================================================================
  // PILLAR 3: MAINTENANCE ORDERS (Q21 - Q25 in Part 1)
  // =========================================================================
  {
    questionId: 'Q21',
    questionText: 'Show all open maintenance orders.',
    category: 'Maintenance Orders',
    sapSourceTables: ['AUFK', 'AFIH', 'AFKO', 'AFVC', 'TJ02T', 'JEST'],
    summaryAnswer: 'There are currently 32 open maintenance orders across Plant 1000 and Plant 1010 in S/4HANA: 4 Emergency Repair Orders (Type PM03, Priority 1), 16 Corrective Maintenance Orders (Type PM01, Planned work), and 12 Preventive Maintenance Orders (Type PM02, Strategy-driven). In terms of system status, 6 are Created (CRTD), 18 are Released (REL), and 8 are Partially Confirmed (PCNF) with active technician work bookings.',
    keyInsights: [
      '32 total open maintenance orders representing 248 planned technician labor hours.',
      'Total committed cost across open orders: €94,600 (€54,200 internal labor, €40,400 spare parts).',
      '18 orders currently in Released (REL) status authorized for parts withdrawal and time confirmation.',
      '8 orders currently in progress with active shop floor labor bookings (IW41 confirmations).'
    ],
    pmMetrics: [
      { label: 'Total Open Orders', value: '32 Orders', status: 'warning' },
      { label: 'Emergency (PM03)', value: '4 Orders', status: 'negative' },
      { label: 'Corrective (PM01)', value: '16 Orders', status: 'neutral' },
      { label: 'Preventive (PM02)', value: '12 Orders', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Type PM03 (Emergency Repairs)', value: '4 Orders (4000912, 4000915, 4000918, 4000920)', variance: 'High Urgency', detail: 'HP-400 Press, ROB-02 Welder, Feed Pump P-101, Conveyor CONV-10' },
      { category: 'Type PM01 (Corrective Maintenance)', value: '16 Orders (4000880 to 4000911)', variance: 'Scheduled Work', detail: 'Total planned labor: 142 hours | Average planned cost: €2,850/order' },
      { category: 'Type PM02 (Preventive Maintenance)', value: '12 Orders (4000860 to 4000879)', variance: 'Strategy PM', detail: 'Total planned labor: 74 hours | Lubrication, calibration, inspections' }
    ],
    recommendedSapActions: [
      { actionName: 'Order Worklist Selection', tcode: 'IW38', description: 'Display and filter open maintenance orders by plant, order type, and status' },
      { actionName: 'Change Maintenance Order', tcode: 'IW32', description: 'Update order operations, component reservations, and planned dates' }
    ]
  },
  {
    questionId: 'Q22',
    questionText: 'Which maintenance orders are overdue?',
    category: 'Maintenance Orders',
    sapSourceTables: ['AUFK', 'AFKO', 'AFIH', 'TJ02T'],
    summaryAnswer: 'In S/4HANA Plant Maintenance, 7 maintenance orders are currently overdue past their scheduled finish date (GLTRP < Current Date): 1) Order 4000872 (EQ-1006 Compressor overhaul, 12 days overdue), 2) Order 4000881 (EQ-1014 Lathe guideway rebuild, 8 days overdue), 3) Order 4000889 (EQ-1018 Crane brake test, 6 days overdue), 4) Order 4000894 (EQ-1021 Duct weld repair, 4 days overdue), 5) Order 4000899 (EQ-1009 Palletizer alignment, 3 days overdue), and 6-7) Orders 4000902 & 4000905 (Blower maintenance, 2 days overdue).',
    keyInsights: [
      '7 maintenance orders are overdue, accounting for 64 unfinished planned labor hours.',
      'Order 4000872 (12 days overdue) delayed by awaiting specialized compressor Teflon piston ring kit.',
      'Order 4000889 (Crane test, 6 days overdue) is high compliance risk; third-party inspector booked for today.',
      'Overall on-time maintenance order completion rate for the current month is 84.2% (Target: 90.0%).'
    ],
    pmMetrics: [
      { label: 'Overdue Orders', value: '7 Orders', status: 'negative' },
      { label: 'Max Order Delay', value: '12 Days (4000872)', status: 'negative' },
      { label: 'Overdue Planned Labor', value: '64 Hours', status: 'warning' },
      { label: 'On-Time Completion Rate', value: '84.2% (Target 90%)', status: 'negative' }
    ],
    breakdownData: [
      { category: 'Order 4000872 (Compressor Overhaul)', value: '12 Days Overdue', variance: 'PM02 / Plan 500012', detail: 'EQ-1006 | Waiting for imported piston rings (PR 10048190)' },
      { category: 'Order 4000881 (Lathe Guideway Rebuild)', value: '8 Days Overdue', variance: 'PM01 / Corrective', detail: 'EQ-1014 | Production extension requested by shift supervisor' },
      { category: 'Order 4000889 (Overhead Crane Safety Test)', value: '6 Days Overdue', variance: 'PM02 / Statutory', detail: 'EQ-1018 | Inspection scheduled today at 13:00' },
      { category: 'Order 4000894 (Exhaust Duct Weld)', value: '4 Days Overdue', variance: 'PM01 / Corrective', detail: 'EQ-1021 | Structural welder resource conflict with Line 1' },
      { category: 'Orders 4000899, 4000902, 4000905', value: '2-3 Days Overdue', variance: 'PM01 / PM02', detail: 'Palletizer, Exhaust blowers | Assigned to afternoon shift today' }
    ],
    recommendedSapActions: [
      { actionName: 'Display Overdue Work Orders', tcode: 'IW39', description: 'Filter orders where Basic Finish Date < Current Date and Status != TECO' },
      { actionName: 'Reschedule Order Dates', tcode: 'IW32', description: 'Adjust basic start/finish dates and re-run capacity leveling' }
    ]
  },
  {
    questionId: 'Q23',
    questionText: 'Which orders are waiting for release?',
    category: 'Maintenance Orders',
    sapSourceTables: ['AUFK', 'AFKO', 'TJ02T', 'JEST'],
    summaryAnswer: 'There are currently 6 maintenance orders in Created status (CRTD) waiting for system release (REL) in S/4HANA: Order 4000922 (Quarterly PM on CNC-02, waiting for material availability check), Order 4000923 (Conveyor belt vulcanization, waiting for production slot confirmation), Order 4000924 (Transformer oil dielectric test, waiting for electrical planner approval), Order 4000925 (Boiler burner nozzle replacement, waiting for parts staging), and Orders 4000926 & 4000927 (Routine monthly pump inspections).',
    keyInsights: [
      '6 orders are in CRTD status and cannot yet have parts withdrawn or labor booked.',
      'Order 4000922 (CNC-02 PM) has 1 missing spare part (filter kit MAT-FLT-09); release is blocked by check.',
      'Order 4000923 is awaiting formal production downtime sign-off from Assembly Area Manager.',
      'Orders 4000924, 4000925, 4000926, 4000927 can be mass-released immediately via IW38.'
    ],
    pmMetrics: [
      { label: 'Orders Waiting for Release', value: '6 Orders', status: 'neutral' },
      { label: 'Material Availability Block', value: '1 Order (4000922)', status: 'warning' },
      { label: 'Ready for Immediate Release', value: '4 Orders', status: 'positive' },
      { label: 'Pending Production Approval', value: '1 Order (4000923)', status: 'neutral' }
    ],
    breakdownData: [
      { category: 'Order 4000922 (CNC-02 Quarterly PM)', value: 'Status: CRTD NMAT', variance: 'Material Missing', detail: 'Filter kit MAT-FLT-09 expected delivery tomorrow 10:00' },
      { category: 'Order 4000923 (Conveyor Belt Vulcanizing)', value: 'Status: CRTD', variance: 'Production Hold', detail: 'Requires 6-hour line shutdown; pending area manager approval' },
      { category: 'Order 4000924 (Transformer Oil Test)', value: 'Status: CRTD', variance: 'Ready to Release', detail: 'All 4 operations planned; external testing lab contracted' },
      { category: 'Order 4000925 (Boiler Burner Nozzles)', value: 'Status: CRTD', variance: 'Ready to Release', detail: 'Parts staged in bin B-04-11; ready for tonight’s maintenance window' },
      { category: 'Orders 4000926 & 4000927 (Pump Inspections)', value: 'Status: CRTD', variance: 'Ready to Release', detail: 'Routine 500-hour vibration and seal checks' }
    ],
    recommendedSapActions: [
      { actionName: 'Mass Order Release', tcode: 'IW38', description: 'Select orders in status CRTD and execute Release (Order -> Functions -> Release)' },
      { actionName: 'Material Availability Check', tcode: 'IW32', description: 'Run component ATP check for Order 4000922 (Component -> Availability)' }
    ]
  },
  {
    questionId: 'Q24',
    questionText: 'Show emergency maintenance orders.',
    category: 'Maintenance Orders',
    sapSourceTables: ['AUFK', 'AFIH', 'AFKO', 'TJ02T'],
    summaryAnswer: 'There are currently 4 active Emergency Maintenance Orders (Order Type PM03, Priority 1-Very High) in S/4HANA Plant Maintenance: 1) Order 4000912 (EQ-1004 Hydraulic Press HP-400 seal rupture, in execution, 5.8h downtime, planned finish 14:30), 2) Order 4000918 (EQ-1012 Robotic Welder ROB-02 servomotor encoder fault, parts staged, 2.5h downtime), 3) Order 4000915 (EQ-1002 Feed Pump P-101 impeller jam, mechanical work active), and 4) Order 4000920 (EQ-1022 Conveyor Drive CONV-10 chain tensioner replacement, ready for test run).',
    keyInsights: [
      '4 active Emergency Orders (PM03) consuming 100% of emergency response technician staffing.',
      'Order 4000912 (HP-400 Press) is the top priority; restoration of Line 1 production on schedule for 14:30.',
      'Order 4000920 (Conveyor CONV-10) is 90% completed; technician testing dry run currently.',
      'Total estimated financial cost of all 4 emergency orders: €18,400 (Labor + Parts).'
    ],
    pmMetrics: [
      { label: 'Active Emergency Orders', value: '4 Orders (PM03)', status: 'negative' },
      { label: 'Technicians Assigned', value: '7 Specialists', status: 'positive' },
      { label: 'Total Emergency Cost', value: '€18,400 Committed', status: 'warning' },
      { label: 'Next Line Recovery', value: '14:30 UTC (HP-400)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Order 4000912 (Hydraulic Press HP-400)', value: 'Status: REL PCNF', variance: '5.8h Downtime', detail: 'Mech Tech: M. Wagner, T. Klein | Cylinder reassembly 80% complete' },
      { category: 'Order 4000918 (Robotic Welder ROB-02)', value: 'Status: REL', variance: '2.5h Downtime', detail: 'Elec Tech: S. Meyer | Servomotor 1FK7060 issued from stores' },
      { category: 'Order 4000915 (Feed Pump P-101)', value: 'Status: REL PCNF', variance: '1.2h Downtime', detail: 'Tech: D. Schmidt | Suction blockage cleared; re-torquing bolts' },
      { category: 'Order 4000920 (Conveyor Drive CONV-10)', value: 'Status: REL PCNF', variance: '0.8h Downtime', detail: 'Tech: K. Becker | Chain tensioner fitted; 5-min test run in progress' }
    ],
    recommendedSapActions: [
      { actionName: 'Emergency Order Monitor', tcode: 'IW38', description: 'Filter Order Type PM03 with Priority 1 across all manufacturing plants' },
      { actionName: 'Time Confirmation', tcode: 'IW41', description: 'Book final labor hours and technical findings upon completion of emergency orders' }
    ],
    equipmentOrOrderDetails: [
      { id: '4000912', name: 'Emergency Repair HP-400 Press', status: 'IN PROGRESS (REL PCNF)', metric: '5.8h Outage', detail: 'Seal replacement | ETA 14:30 | Tech: M. Wagner' },
      { id: '4000918', name: 'Emergency Repair ROB-02 Welder', status: 'PARTS STAGED (REL)', metric: '2.5h Outage', detail: 'Servomotor swap | ETA 15:15 | Tech: S. Meyer' },
      { id: '4000915', name: 'Emergency Repair Feed Pump P-101', status: 'IN PROGRESS (REL PCNF)', metric: '1.2h Outage', detail: 'Impeller de-clog | ETA 13:45 | Tech: D. Schmidt' },
      { id: '4000920', name: 'Emergency Repair Conveyor CONV-10', status: 'TESTING (REL PCNF)', metric: '0.8h Outage', detail: 'Chain tensioning | ETA 13:30 | Tech: K. Becker' }
    ]
  },
  {
    questionId: 'Q25',
    questionText: 'Which work orders are waiting for parts?',
    category: 'Maintenance Orders',
    sapSourceTables: ['RESB', 'AUFK', 'MARA', 'MARD', 'TJ02T'],
    summaryAnswer: 'In S/4HANA Plant Maintenance, 4 work orders have missing component reservations (System Status NMAT - Material Shortage): 1) Order 4000872 (EQ-1006 Compressor overhaul, missing Teflon Piston Ring Kit MAT-RNG-44, PO 4500019288 ETA tomorrow), 2) Order 4000892 (EQ-1005 Compressor seal repair, missing Viton Gasket Set MAT-GSK-08, PO 4500019290 ETA tomorrow), 3) Order 4000908 (EQ-1011 Molding Machine proportional valve, missing Moog Valve MAT-VLV-92, PO 4500019302 ETA Friday), and 4) Order 4000922 (EQ-1002 CNC-02 PM, missing Filter Cartridge MAT-FLT-09, PO 4500019315 ETA tomorrow).',
    keyInsights: [
      '4 maintenance orders are blocked from execution due to stockouts on reserved components (RESB).',
      'Total value of missing spare parts across the 4 blocked orders: €8,650.',
      '3 of the 4 missing part shipments have verified vendor tracking and will arrive tomorrow morning.',
      'Order 4000908 (Moog hydraulic valve, €4,200) has the longest lead time with expected Friday delivery.'
    ],
    pmMetrics: [
      { label: 'Orders Blocked by Parts', value: '4 Orders', status: 'warning' },
      { label: 'Missing Part Line Items', value: '5 Material Items', status: 'warning' },
      { label: 'Parts Arriving Tomorrow', value: '3 of 4 Orders', status: 'positive' },
      { label: 'Total Blocked Labor', value: '42 Planned Hours', status: 'neutral' }
    ],
    breakdownData: [
      { category: 'Order 4000872 (Compressor Overhaul)', value: 'Missing: MAT-RNG-44 (Piston Ring Kit)', variance: 'PO 4500019288', detail: 'Vendor: Atlas Copco | Qty: 2 EA | Delivery ETA: Tomorrow 08:30' },
      { category: 'Order 4000892 (Compressor Seal Repair)', value: 'Missing: MAT-GSK-08 (Viton Gasket Set)', variance: 'PO 4500019290', detail: 'Vendor: Parker Hannifin | Qty: 4 EA | Delivery ETA: Tomorrow 09:00' },
      { category: 'Order 4000908 (Molding Machine Valve)', value: 'Missing: MAT-VLV-92 (Proportional Valve)', variance: 'PO 4500019302', detail: 'Vendor: Moog Inc. | Qty: 1 EA | Delivery ETA: Friday 14:00' },
      { category: 'Order 4000922 (CNC-02 Quarterly PM)', value: 'Missing: MAT-FLT-09 (Filter Cartridge)', variance: 'PO 4500019315', detail: 'Vendor: Donaldson | Qty: 6 EA | Delivery ETA: Tomorrow 11:00' }
    ],
    recommendedSapActions: [
      { actionName: 'Order Material Shortage List', tcode: 'IWBK', description: 'Display all maintenance orders with missing component reservations' },
      { actionName: 'Purchase Order Tracking', tcode: 'ME23N', description: 'Inspect vendor shipping confirmations and delivery dates for missing materials' }
    ]
  }
];
