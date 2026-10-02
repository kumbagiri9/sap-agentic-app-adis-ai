import { EhsExecutiveQuestionAnswer } from '../types';

export const EHS_EXECUTIVE_QUESTIONS_PART1: EhsExecutiveQuestionAnswer[] = [
  // ============================================================================
  // PILLAR 1: INCIDENTS & SAFETY EVENTS (Q1 - Q10)
  // ============================================================================
  {
    questionId: 'Q1',
    questionText: 'Show all safety incidents reported today.',
    category: 'Incidents & Safety Events',
    sapSourceTables: ['EHFND_INCIDENT', 'EHFND_INC_ROOT', 'EHFND_INC_LOC', 'EHFND_INC_EVT'],
    summaryAnswer: 'A total of 4 safety incidents and events have been logged across S/4HANA EHS today across Plant 1000, Plant 1010, and Plant 1020. This includes 1 major chemical release in Building B4, 1 minor first-aid pinch injury at Packaging Line 2, 1 automated crane proximity near-miss in Bay 3, and 1 localized hydraulic line leak contained without injury.',
    keyInsights: [
      'INC-2026-9081 (Chemical Release - Hydrochloric Acid 37%) logged at 14:22 CET in Plant 1010; emergency neutralizer mist wash activated with zero injuries.',
      'INC-2026-9083 (First-Aid Injury) logged at Packaging Line 2 conveyor nip point; operator treated on-site with zero lost work days.',
      'INC-2026-9082 (Near Miss) triggered by automated stacker crane proximity sensor drift in Warehouse Bay 3; crane travel speed auto-throttled.',
      'All 4 records generated automated EHS workflow notifications dispatched to Plant Safety Officers and designated Area Supervisors.'
    ],
    ehsMetrics: [
      { label: 'Reported Incidents Today', value: '4 Events', status: 'warning' },
      { label: 'Lost Time Injuries (LTI)', value: '0 Days', status: 'positive' },
      { label: 'OSHA Reportable Events', value: '1 Incident', status: 'warning' },
      { label: 'Active Containment Status', value: '100% Contained', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Chemical Spill / Release', value: '1 Event', variance: 'Plant 1010', detail: '37% HCl (12 Liters contained in secondary sump)' },
      { category: 'First-Aid / Minor Injury', value: '1 Event', variance: 'Plant 1000', detail: 'Superficial hand abrasion at Conveyor C-102' },
      { category: 'Near-Miss / Precursor', value: '1 Event', variance: 'Plant 1020', detail: 'Optical distance sensor drift on Crane SC-04' },
      { category: 'Equipment Hydraulic Leak', value: '1 Event', variance: 'Plant 1010', detail: 'ISO VG 46 Oil (4 Liters) on Press P-302' }
    ],
    recommendedSapActions: [
      { actionName: 'Review Today\'s Incident Log', tcode: 'F2453 / CBIH82', description: 'Open S/4HANA Manage Incidents Fiori App to review detailed event timelines and shift supervisor statements.' },
      { actionName: 'Validate Emergency Containment Sign-Off', tcode: 'F2039', description: 'Confirm digital safety officer sign-off on secondary containment drainage and neutralizer wash logs.' },
      { actionName: 'Trigger EHS Notification Workflow', tcode: 'EHFND_NW', description: 'Dispatch formal incident notifications to corporate EHS steering committee and plant operations managers.' }
    ],
    incidentOrHazardDetails: [
      { id: 'INC-2026-9081', name: 'Chemical Dosing Unit B4 Acid Spill', severity: 'Major - Level 2', status: 'CAPA Assigned', metric: '12 L Contained', detail: 'Plant 1010 | Dosing Pump P-104 | OSHA Form 301 logged' },
      { id: 'INC-2026-9083', name: 'Packaging Line 2 Conveyor Hand Pinch', severity: 'Minor - Level 4', status: 'Resolved & Closed', metric: '0 LTI Days', detail: 'Plant 1000 | Conveyor C-102 | First-aid log updated' },
      { id: 'INC-2026-9082', name: 'Bay 3 Stacker Crane Proximity Near-Miss', severity: 'Minor - Level 4', status: 'Investigating', metric: 'Near-Miss', detail: 'Plant 1020 | Crane SC-04 | Speed restricted to 30%' },
      { id: 'INC-2026-9084', name: 'Stamping Press P-302 Hydraulic Line Leak', severity: 'Moderate - Level 3', status: 'CAPA Assigned', metric: '4 L ISO VG 46', detail: 'Plant 1010 | Press P-302 | Line depressurized & tagged' }
    ]
  },
  {
    questionId: 'Q2',
    questionText: 'Which incidents are still open?',
    category: 'Incidents & Safety Events',
    sapSourceTables: ['EHFND_INCIDENT', 'EHFND_INC_ROOT', 'EHFND_INC_ACT'],
    summaryAnswer: 'There are currently 6 open safety incidents in the S/4HANA EHS system across all active production facilities: 3 in "Under Investigation" stage, 2 in "CAPA Assigned & Pending Execution", and 1 in "Regulatory Authority Review". Zero open incidents have breached executive escalation SLA thresholds.',
    keyInsights: [
      'INC-2026-9081 (Plant 1010): Acid dosing valve failure; CAPA #8841 (Viton seal retrofit) is 60% complete; awaiting final engineering verification.',
      'INC-2026-9082 (Plant 1020): Stacker crane sensor drift investigation active; laser interferometer alignment test scheduled for 18:00.',
      'INC-2026-8942 (Plant 1000): Forklift dock ramp slip event; anti-skid epoxy resurfacing underway under EHS Work Order WO-44912.',
      'INC-2026-8870 (Plant 1030): Thermal oxidizer burner flameout; draft regulatory submission prepared for State EPA compliance review.'
    ],
    ehsMetrics: [
      { label: 'Total Open Incidents', value: '6 Cases', status: 'warning' },
      { label: 'Under Investigation', value: '3 Cases', status: 'neutral' },
      { label: 'CAPA Pending Verification', value: '2 Cases', status: 'neutral' },
      { label: 'Regulatory Authority Review', value: '1 Case', status: 'warning' }
    ],
    breakdownData: [
      { category: 'Plant 1010 (Chemical & Heavy Mfg)', value: '3 Cases', variance: '50.0%', detail: '2 Chemical/Hydraulic, 1 Ergonomic' },
      { category: 'Plant 1000 (Central Assembly)', value: '2 Cases', variance: '33.3%', detail: '1 Logistics Slip, 1 Guard Interlock' },
      { category: 'Plant 1020 (Automated Warehouse)', value: '1 Case', variance: '16.7%', detail: '1 Automated Stacker Sensor Near-Miss' }
    ],
    recommendedSapActions: [
      { actionName: 'Triage Open Incident Worklist', tcode: 'F2453', description: 'Review outstanding tasks, CAPA milestone dates, and assign responsible lead safety engineers.' },
      { actionName: 'Monitor Investigation Aging', tcode: 'CBIH82', description: 'Execute incident age analysis report to ensure all investigations conclude within the 14-day corporate policy limit.' }
    ],
    incidentOrHazardDetails: [
      { id: 'INC-2026-9081', name: 'Chemical Dosing Unit B4 Acid Spill', severity: 'Major - Level 2', status: 'CAPA Assigned', metric: '60% Done', detail: 'Plant 1010 | Lead: Dr. M. Vance' },
      { id: 'INC-2026-9082', name: 'Stacker Crane SC-04 Optical Drift', severity: 'Minor - Level 4', status: 'Investigating', metric: 'Day 1 of 5', detail: 'Plant 1020 | Lead: K. Lindqvist' },
      { id: 'INC-2026-8942', name: 'Loading Dock 4 Wet Ramp Slip', severity: 'Moderate - Level 3', status: 'CAPA Assigned', metric: '90% Done', detail: 'Plant 1000 | Lead: S. Martinez' },
      { id: 'INC-2026-8870', name: 'Thermal Oxidizer Flameout Anomaly', severity: 'Major - Level 2', status: 'Reg Review', metric: 'Pending EPA', detail: 'Plant 1030 | Lead: E. Tanaka' },
      { id: 'INC-2026-8821', name: 'Granulator Hopper Dust Cloud Leak', severity: 'Moderate - Level 3', status: 'Investigating', metric: 'Day 3 of 7', detail: 'Plant 1010 | Lead: H. Schmidt' },
      { id: 'INC-2026-8799', name: 'Forklift FL-08 Side Mirror Collision', severity: 'Minor - Level 4', status: 'Investigating', metric: 'Day 4 of 5', detail: 'Plant 1010 | Lead: R. Becker' }
    ]
  },
  {
    questionId: 'Q3',
    questionText: 'Which incidents are classified as high severity?',
    category: 'Incidents & Safety Events',
    sapSourceTables: ['EHFND_INCIDENT', 'EHFND_INC_ROOT', 'EHFND_INC_INJ', 'EHFND_INC_LOC'],
    summaryAnswer: 'In the past 90 days, 3 incidents have been classified as High Severity (Level 1 Critical / Level 2 Major) in S/4HANA EHS: INC-2026-9081 (Chemical Spill - Plant 1010), INC-2026-8870 (Thermal Oxidizer Flameout - Plant 1030), and INC-2026-7814 (Forklift Pedestrian Separation Breach - Plant 1000). All 3 have completed emergency containment and are governed by strict Executive Safety SteerCo governance.',
    keyInsights: [
      'INC-2026-9081 (Level 2 Major): 12L concentrated hydrochloric acid release; secondary sump containment held 100% volume; zero toxic gas vapor spread.',
      'INC-2026-8870 (Level 2 Major): Thermal Oxidizer burner shut down due to pilot gas pressure drop; VOC bypass vent opened for 114 seconds (within emergency EPA limits).',
      'INC-2026-7814 (Level 2 Major): Forklift turned abruptly near pedestrian crosswalk; high-visibility pedestrian sensor fence auto-tripped vehicle deceleration.',
      'Root-cause analyses (Fishbone & 5-Why) have been uploaded into S/4HANA EHS with verified engineering interlocks implemented.'
    ],
    ehsMetrics: [
      { label: 'High Severity Incidents (90d)', value: '3 Events', status: 'warning' },
      { label: 'Lost Time Frequency Rate (LTFR)', value: '0.00', status: 'positive' },
      { label: 'OSHA 300 Recordables', value: '1 Record', status: 'neutral' },
      { label: 'CAPA Completion Rate', value: '88.9%', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Level 1 - Critical Catastrophic', value: '0 Cases', variance: '0.0%', detail: 'Zero fatalities or severe permanent impairments' },
      { category: 'Level 2 - Major Significant', value: '3 Cases', variance: '100.0%', detail: '1 Chemical Release, 1 Emissions Bypass, 1 Vehicle Proximity' },
      { category: 'Level 3 - Moderate First-Aid', value: '8 Cases', variance: 'Historical', detail: 'Sprains, minor cuts, small fluid drips' }
    ],
    recommendedSapActions: [
      { actionName: 'Review Major Incident Dossier', tcode: 'F2453', description: 'Open high-severity incident dossier, root cause diagram, and witness depositions in S/4HANA EHS.' },
      { actionName: 'Verify Executive SteerCo Sign-Off', tcode: 'CBIH92', description: 'Confirm digital cryptographic signature from Plant General Manager and Corporate VP of EHS.' }
    ],
    incidentOrHazardDetails: [
      { id: 'INC-2026-9081', name: 'Plant 1010 Acid Dosing Spill', severity: 'Major - Level 2', status: 'CAPA Assigned', metric: 'Level 2', detail: '37% HCl Solution | Secondary Containment 100% effective' },
      { id: 'INC-2026-8870', name: 'Plant 1030 Thermal Oxidizer Bypass', severity: 'Major - Level 2', status: 'Reg Review', metric: 'Level 2', detail: '114s VOC bypass | Auto-Logged in Continuous Emission System' },
      { id: 'INC-2026-7814', name: 'Plant 1000 Forklift Crosswalk Breach', severity: 'Major - Level 2', status: 'Resolved & Closed', metric: 'Level 2', detail: 'Autonomous speed restriction barrier installed' }
    ]
  },
  {
    questionId: 'Q4',
    questionText: 'Show near-miss incidents from this week.',
    category: 'Incidents & Safety Events',
    sapSourceTables: ['EHFND_INCIDENT', 'EHFND_INC_ROOT', 'EHFND_INC_EVT'],
    summaryAnswer: 'A total of 5 Near-Miss events have been reported this week across all manufacturing and logistics sites. Leading indicator reporting has increased +22% following the launch of the mobile QR-code "Hazard Hunt" campaign, allowing proactive elimination of hazards before any harm occurs.',
    keyInsights: [
      'Near-miss #1 (INC-2026-9082): Stacker Crane SC-04 proximity laser drift in Bay 3 warehouse.',
      'Near-miss #2 (INC-2026-9077): Pallet banding wire snapped during high-bay de-stacking; safety net caught carton.',
      'Near-miss #3 (INC-2026-9071): Unlabeled solvent beaker found on lab bench 4; identified as DI water and properly labeled.',
      'Near-miss #4 (INC-2026-9065): Electrical panel 3B door left unlocked in substation corridor; interlock key system inspected.',
      'Near-miss #5 (INC-2026-9060): Wet floor condensate near chiller compressor without yellow caution cone; drainage cleared.'
    ],
    ehsMetrics: [
      { label: 'Weekly Near-Miss Reports', value: '5 Reports', status: 'positive' },
      { label: 'Reporting Velocity Trend', value: '+22% WoW', status: 'positive' },
      { label: 'Avg Triage Turnaround', value: '2.4 Hours', status: 'positive' },
      { label: 'Proactive Fix Rate', value: '100%', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Warehouse Logistics (Plant 1020)', value: '2 Reports', variance: '40.0%', detail: 'Stacker crane, pallet banding' },
      { category: 'Assembly & Production (Plant 1000)', value: '2 Reports', variance: '40.0%', detail: 'Electrical panel, chiller condensate' },
      { category: 'Quality QA Lab (Plant 1010)', value: '1 Report', variance: '20.0%', detail: 'Container labeling protocol' }
    ],
    recommendedSapActions: [
      { actionName: 'Process Near-Miss Worklist', tcode: 'F2039', description: 'Acknowledge near-miss reports and convert high-potential precursors into preventive maintenance work orders.' },
      { actionName: 'Publish Weekly Safety Bulletin', tcode: 'CBIH82', description: 'Generate anonymized safety moment slide for morning toolbox meetings highlighting this week\'s near-miss learnings.' }
    ],
    incidentOrHazardDetails: [
      { id: 'INC-2026-9082', name: 'Stacker Crane SC-04 Optical Drift', severity: 'Minor - Level 4', status: 'Investigating', metric: 'Near-Miss', detail: 'Plant 1020 | High-Bay Warehouse Bay 3' },
      { id: 'INC-2026-9077', name: 'High-Bay Pallet Band Snap', severity: 'Minor - Level 4', status: 'Resolved & Closed', metric: 'Near-Miss', detail: 'Plant 1020 | Aisle 12 | Safety netting deployed' },
      { id: 'INC-2026-9071', name: 'Unlabeled Lab Beaker Protocol', severity: 'Minor - Level 4', status: 'Resolved & Closed', metric: 'Near-Miss', detail: 'Plant 1010 | QC Wet Lab Bench 4' },
      { id: 'INC-2026-9065', name: 'Substation Electrical Panel 3B', severity: 'Minor - Level 4', status: 'Resolved & Closed', metric: 'Near-Miss', detail: 'Plant 1000 | Utility Corridor' },
      { id: 'INC-2026-9060', name: 'Chiller Ch-2 Condensate Pooling', severity: 'Minor - Level 4', status: 'Resolved & Closed', metric: 'Near-Miss', detail: 'Plant 1000 | Mechanical Room B' }
    ]
  },
  {
    questionId: 'Q5',
    questionText: 'Which incidents require investigation?',
    category: 'Incidents & Safety Events',
    sapSourceTables: ['EHFND_INCIDENT', 'EHFND_INC_ROOT', 'EHFND_INC_ACT', 'EHFND_INC_INJ'],
    summaryAnswer: 'There are 3 incidents currently in active investigation stage requiring formal Root Cause Analysis (RCA), multidisciplinary investigation team formation, and witness interviews: INC-2026-9081 (Acid spill), INC-2026-9082 (Stacker sensor drift), and INC-2026-8821 (Granulator dust cloud).',
    keyInsights: [
      'INC-2026-9081: Mandatory Level 2 RCA due to chemical hazardous classification; requires Plant Safety Lead, Chemical Process Engineer, and Maintenance Lead.',
      'INC-2026-9082: High-potential automated crane near-miss; requires OEM Siemens/Dematic telemetry validation and sensor calibration logs.',
      'INC-2026-8821: ATEX Zone 22 combustible dust hazard evaluation; requires local exhaust ventilation (LEV) flow rate audit.',
      'Corporate policy mandates complete 5-Why and Ishikawa diagrams within 7 working days of incident logging.'
    ],
    ehsMetrics: [
      { label: 'Active Investigations', value: '3 Cases', status: 'warning' },
      { label: 'Investigation SLA Met', value: '100%', status: 'positive' },
      { label: 'Multidisciplinary Teams', value: '3 Formed', status: 'positive' },
      { label: 'RCA Templates Completed', value: '2 of 3', status: 'neutral' }
    ],
    breakdownData: [
      { category: 'Chemical Process Safety', value: '1 Case', variance: 'High Priority', detail: 'INC-2026-9081: Flange corrosion & pressure surge analysis' },
      { category: 'Robotics & Automation Safety', value: '1 Case', variance: 'Med Priority', detail: 'INC-2026-9082: Optical encoder signal distortion' },
      { category: 'Combustible Dust / Industrial Hygiene', value: '1 Case', variance: 'Med Priority', detail: 'INC-2026-8821: Granulator suction duct filter delta-P' }
    ],
    recommendedSapActions: [
      { actionName: 'Launch Investigation Cockpit', tcode: 'F2453', description: 'Open S/4HANA EHS Investigation step to record 5-Why root cause tree, witness statements, and photo evidence.' },
      { actionName: 'Assign Investigation Team Members', tcode: 'CBIH82', description: 'Assign certified Lead Investigators and SME team members with automated calendar notifications.' }
    ],
    incidentOrHazardDetails: [
      { id: 'INC-2026-9081', name: 'Chemical Dosing Unit B4 Acid Spill', severity: 'Major - Level 2', status: 'Investigating', metric: 'Day 2 of 7', detail: 'Lead: Dr. Marcus Vance | Target RCA: Aug 28' },
      { id: 'INC-2026-9082', name: 'Stacker Crane SC-04 Optical Drift', severity: 'Minor - Level 4', status: 'Investigating', metric: 'Day 1 of 5', detail: 'Lead: Karl Lindqvist | Target RCA: Aug 29' },
      { id: 'INC-2026-8821', name: 'Granulator Hopper Dust Cloud Leak', severity: 'Moderate - Level 3', status: 'Investigating', metric: 'Day 3 of 7', detail: 'Lead: Heidi Schmidt | Target RCA: Aug 30' }
    ]
  },
  {
    questionId: 'Q6',
    questionText: 'Show injuries by plant.',
    category: 'Incidents & Safety Events',
    sapSourceTables: ['EHFND_INCIDENT', 'EHFND_INC_INJ', 'EHFND_INC_LOC'],
    summaryAnswer: 'Year-to-date injury statistics across all enterprise manufacturing plants reflect a Total Recordable Incident Rate (TRIR) of 0.42, outperforming the global industry benchmark of 1.20. Across 4 plants, there have been 5 total recordable injuries (0 Fatalities, 0 Lost-Time Injuries, 5 First-Aid/Restricted Work Cases).',
    keyInsights: [
      'Plant 1000 (Central Assembly): 2 minor injuries (1 conveyor nip pinch, 1 minor finger cut during sheet metal handling).',
      'Plant 1010 (Chemical & Heavy Mfg): 2 minor injuries (1 minor heat rash from PPE suit, 1 ankle tweak on stair tread).',
      'Plant 1020 (Logistics & Distribution): 1 minor injury (1 wrist strain during manual parcel de-stacking).',
      'Plant 1030 (Thermal & Energy Center): 0 injuries YTD (382 consecutive days without a recordable injury).'
    ],
    ehsMetrics: [
      { label: 'Corporate TRIR YTD', value: '0.42', status: 'positive' },
      { label: 'Lost Time Incident Rate', value: '0.00', status: 'positive' },
      { label: 'Total Injuries YTD', value: '5 Cases', status: 'positive' },
      { label: 'Best Performing Site', value: 'Plant 1030 (382d)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Plant 1000 - Central Assembly', value: '2 Cases', variance: '40.0%', detail: 'TRIR: 0.51 | Hand/Finger cuts and pinches' },
      { category: 'Plant 1010 - Chemical & Heavy Mfg', value: '2 Cases', variance: '40.0%', detail: 'TRIR: 0.62 | Ergonomic strain and heat stress' },
      { category: 'Plant 1020 - Logistics & Distribution', value: '1 Case', variance: '20.0%', detail: 'TRIR: 0.28 | Manual handling wrist sprain' },
      { category: 'Plant 1030 - Energy & Utilities', value: '0 Cases', variance: '0.0%', detail: 'TRIR: 0.00 | Zero recordables in 382 days' }
    ],
    recommendedSapActions: [
      { actionName: 'Generate OSHA 300 / 300A Log', tcode: 'F2453 / CBIH82', description: 'Export S/4HANA EHS official OSHA Form 300 and 300A Summary for compliance verification.' },
      { actionName: 'Execute Injury Trend Analysis', tcode: 'CBIH82', description: 'Run injury body part Pareto chart and shift distribution report in S/4HANA EHS Analytics.' }
    ],
    incidentOrHazardDetails: [
      { id: 'INJ-2026-01', name: 'Conveyor C-102 Pinch Abrasion', severity: 'Minor - Level 4', status: 'Closed', metric: '0 Days Lost', detail: 'Plant 1000 | Operator: P. Mueller | First-aid dressing' },
      { id: 'INJ-2026-02', name: 'Sheet Metal Edge Micro-Cut', severity: 'Minor - Level 4', status: 'Closed', metric: '0 Days Lost', detail: 'Plant 1000 | Operator: J. Davis | Kevlar Cut-Level 5 glove mandated' },
      { id: 'INJ-2026-03', name: 'Stairway Ankle Inversion Strain', severity: 'Minor - Level 4', status: 'Closed', metric: '0 Days Lost', detail: 'Plant 1010 | Operator: A. Weber | Anti-slip nosing installed' },
      { id: 'INJ-2026-04', name: 'Chemical Suit Heat Exhaustion', severity: 'Minor - Level 4', status: 'Closed', metric: '0 Days Lost', detail: 'Plant 1010 | Operator: T. Klein | Cooling vest protocol deployed' },
      { id: 'INJ-2026-05', name: 'Parcel Unload Wrist Tenosynovitis', severity: 'Minor - Level 4', status: 'Closed', metric: '0 Days Lost', detail: 'Plant 1020 | Operator: R. Sanchez | Vacuum lifter mandatory' }
    ]
  },
  {
    questionId: 'Q7',
    questionText: 'Which work areas have the highest incident rate?',
    category: 'Incidents & Safety Events',
    sapSourceTables: ['EHFND_INCIDENT', 'EHFND_INC_LOC', 'EHFND_LOC_ROOT'],
    summaryAnswer: 'Spatial location analysis across S/4HANA EHS indicates that the top 3 highest-rate work areas are: 1. Chemical Dosing & Tank Farm B4 (Plant 1010: 2.1 incidents / 100k work hrs), 2. Final Assembly Packaging & Conveyor Line 2 (Plant 1000: 1.8 incidents / 100k work hrs), and 3. Automated High-Bay Logistics Bay 3 (Plant 1020: 1.2 incidents / 100k work hrs).',
    keyInsights: [
      'Chemical Tank Farm B4: Higher incidence linked to corrosive fluids, valve thermal cycling, and pressurized line transfers; dedicated automated leak sensor grid planned.',
      'Packaging Conveyor Line 2: Operator interaction with moving parts during jam clearance; optical interlocks upgraded to Category 4 safety rating.',
      'Warehouse Bay 3: AGV and stacker crane proximity interactions during peak shift transitions.',
      'All other 28 plant work areas maintain an incident rate below 0.30 per 100k work hours.'
    ],
    ehsMetrics: [
      { label: 'Highest Rate Area', value: 'Tank Farm B4 (2.1)', status: 'warning' },
      { label: 'Corporate Avg Rate', value: '0.48 / 100k hrs', status: 'positive' },
      { label: 'High-Risk Zones Monitored', value: '3 Areas', status: 'neutral' },
      { label: 'Target Reduction by Q4', value: '-40%', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Chemical Tank Farm B4 (Plant 1010)', value: '2.1 / 100k hrs', variance: '+1.6 vs Avg', detail: 'Corrosive fluids, gasket aging, pump pressure' },
      { category: 'Packaging Conveyor Line 2 (Plant 1000)', value: '1.8 / 100k hrs', variance: '+1.3 vs Avg', detail: 'Pinch points, jam clearance, manual handling' },
      { category: 'High-Bay Warehouse Bay 3 (Plant 1020)', value: '1.2 / 100k hrs', variance: '+0.7 vs Avg', detail: 'AGV traffic, automated crane sensors' },
      { category: 'Machining & CNC Cell 4 (Plant 1000)', value: '0.4 / 100k hrs', variance: '-0.1 vs Avg', detail: 'Coolant mist, swarf handling' },
      { category: 'All Other 24 Work Centers', value: '0.1 / 100k hrs', variance: '-0.4 vs Avg', detail: 'Fully controlled benchmark areas' }
    ],
    recommendedSapActions: [
      { actionName: 'Review EHS Location Master Hierarchy', tcode: 'F2849 / CBIH02', description: 'Open S/4HANA EHS Location Structure to audit risk assessment profiles and hazard controls per work area.' },
      { actionName: 'Schedule Area Safety Deep-Dive', tcode: 'CBIH92', description: 'Commission dedicated cross-functional Gemba walk with Area Supervisor and EHS Engineer.' }
    ],
    incidentOrHazardDetails: [
      { id: 'LOC-1010-B4', name: 'Chemical Tank Farm & Dosing Unit B4', severity: 'Major - Level 2', status: 'Active Surveillance', metric: '2.1 / 100k hrs', detail: 'Plant 1010 | Risk Score: 78/100 | Sump sensor grid required' },
      { id: 'LOC-1000-PK2', name: 'Final Assembly Packaging Line 2', severity: 'Moderate - Level 3', status: 'Active Surveillance', metric: '1.8 / 100k hrs', detail: 'Plant 1000 | Risk Score: 64/100 | Light curtains upgraded' },
      { id: 'LOC-1020-BAY3', name: 'Automated Logistics Stacker Bay 3', severity: 'Minor - Level 4', status: 'Active Surveillance', metric: '1.2 / 100k hrs', detail: 'Plant 1020 | Risk Score: 52/100 | Laser sensor recalibrated' }
    ]
  },
  {
    questionId: 'Q8',
    questionText: 'Show recurring incident types.',
    category: 'Incidents & Safety Events',
    sapSourceTables: ['EHFND_INCIDENT', 'EHFND_INC_ROOT', 'EHFND_INC_CAU'],
    summaryAnswer: 'Pareto frequency clustering of 48 incident and near-miss records logged over the past 12 months reveals 3 recurring incident patterns: 1. Fluid Line Gasket/Fitting Seepage (31%), 2. Slips/Trips during wet floor cleaning (25%), and 3. Minor pinch points during manual conveyor jam clearance (21%).',
    keyInsights: [
      'Pattern 1 (Gasket Seepage): 15 occurrences; root cause traced to standard EPDM gaskets exposed to aromatic hydrocarbon solvents; switching to Viton/PTFE.',
      'Pattern 2 (Wet Floor Slips): 12 occurrences; cleaning shift coincides with high foot-traffic shift change; revised cleaning schedule by 60 minutes.',
      'Pattern 3 (Conveyor Jams): 10 occurrences; operators attempting to reach past guards with tools; installed extended chute diverters.',
      'Addressing these 3 recurring types via engineering controls will eliminate 77% of all recorded factory safety events.'
    ],
    ehsMetrics: [
      { label: 'Recurring Type Share', value: '77.1%', status: 'warning' },
      { label: 'Top Recurring Pattern', value: 'Gasket Seepage (31%)', status: 'warning' },
      { label: 'Engineering Fixes In-Flight', value: '3 Initiatives', status: 'positive' },
      { label: 'Expected Incident Reduction', value: '-75%', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Fluid Line Gasket / Fitting Seepage', value: '15 Events (31.3%)', variance: 'Material Mismatch', detail: 'EPDM polymer swelling in solvent service' },
      { category: 'Slip/Trip on Wet Floor / Washdown', value: '12 Events (25.0%)', variance: 'Scheduling Conflict', detail: 'Cleaning during shift changeover' },
      { category: 'Conveyor Jam Clearance Pinch', value: '10 Events (20.8%)', variance: 'Procedure Bypass', detail: 'Manual reach-in without LOTO' },
      { category: 'Sensor Optical Misalignment', value: '6 Events (12.5%)', variance: 'Vibration Drift', detail: 'Stacker crane & sorting gates' },
      { category: 'Miscellaneous Single Occurrences', value: '5 Events (10.4%)', variance: 'Isolated', detail: 'Various non-recurring minor items' }
    ],
    recommendedSapActions: [
      { actionName: 'Launch Material Standardization MOC', tcode: 'F2453 / CBIH92', description: 'Initiate Management of Change (MOC) in SAP PM/MM to replace EPDM gaskets with Viton spec across all solvent piping.' },
      { actionName: 'Update Standard Operating Procedures (SOP)', tcode: 'CBIH02', description: 'Publish updated LOTO conveyor jam clearance standard and verify digital training completion in SAP SuccessFactors.' }
    ],
    incidentOrHazardDetails: [
      { id: 'PAT-01', name: 'Solvent Gasket Degradation Pattern', severity: 'Major - Level 2', status: 'MOC Active', metric: '15 Events', detail: 'Conversion to Viton Flanges in Progress (WO-88192)' },
      { id: 'PAT-02', name: 'Shift-Change Washdown Slip Pattern', severity: 'Moderate - Level 3', status: 'SOP Updated', metric: '12 Events', detail: 'Cleaning rescheduled to 05:00 & 13:00 off-peak windows' },
      { id: 'PAT-03', name: 'Conveyor Jam Reach-In Pattern', severity: 'Moderate - Level 3', status: 'Guards Installed', metric: '10 Events', detail: 'Extended interlocked hopper covers installed on Lines 1-4' }
    ]
  },
  {
    questionId: 'Q9',
    questionText: 'Which safety events are overdue for follow-up?',
    category: 'Incidents & Safety Events',
    sapSourceTables: ['EHFND_INCIDENT', 'EHFND_INC_ROOT', 'EHFND_INC_ACT'],
    summaryAnswer: 'Only 1 safety event in S/4HANA EHS currently has a follow-up action overdue past its target SLA date: INC-2026-8799 (Forklift FL-08 Side Mirror Collision - Plant 1010), where the mirror bracket re-engineering task is 2 days past due. All other 5 active incidents are tracking within SLA target dates.',
    keyInsights: [
      'INC-2026-8799 (Plant 1010): Action item ACT-4412 (Install wide-angle parabolic safety mirrors at Substation Intersection) was due Aug 24; delayed due to bracket vendor shipment.',
      'Parts arrived this morning; maintenance tech assigned under Work Order WO-44933 to complete installation today.',
      'S/4HANA EHS automated escalation alert notified Plant EHS Manager and Maintenance Dispatcher at 08:00.',
      'Zero high-severity (Level 1/2) follow-up actions are overdue.'
    ],
    ehsMetrics: [
      { label: 'Overdue Follow-Ups', value: '1 Action', status: 'warning' },
      { label: 'On-Time Follow-Up SLA', value: '96.2%', status: 'positive' },
      { label: 'Average Days Overdue', value: '2.0 Days', status: 'positive' },
      { label: 'Critical Action Overdue', value: '0 Actions', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Overdue (1 - 3 Days)', value: '1 Action', variance: 'Plant 1010', detail: 'ACT-4412: Parabolic mirror installation at Intersection 4' },
      { category: 'Due This Week (Within SLA)', value: '4 Actions', variance: 'On Track', detail: 'Acid valve seal verification, crane laser alignment' },
      { category: 'Due Next Month', value: '8 Actions', variance: 'Planned', detail: 'Annual ventilation smoke test, ergonomics review' }
    ],
    recommendedSapActions: [
      { actionName: 'Expedite Overdue Action ACT-4412', tcode: 'F2453 / CBIH92', description: 'Open action item in S/4HANA EHS, confirm parts receipt, and verify completion upon technician sign-off.' },
      { actionName: 'Review Action Item Escalation Matrix', tcode: 'EHFND_NW', description: 'Audit escalation notification recipients and threshold parameters for overdue safety corrective actions.' }
    ],
    incidentOrHazardDetails: [
      { id: 'ACT-4412', name: 'Install Parabolic Blind-Spot Mirrors', severity: 'Minor - Level 4', status: 'Overdue (+2d)', metric: 'Due Aug 24', detail: 'Plant 1010 | Linked to INC-2026-8799 | WO-44933 assigned' },
      { id: 'ACT-4408', name: 'Viton Gasket Replacement Verification', severity: 'Major - Level 2', status: 'In Progress', metric: 'Due Aug 28', detail: 'Plant 1010 | Linked to INC-2026-9081 | 60% Complete' },
      { id: 'ACT-4410', name: 'Laser Distance Sensor Recalibration', severity: 'Minor - Level 4', status: 'In Progress', metric: 'Due Aug 29', detail: 'Plant 1020 | Linked to INC-2026-9082 | Scheduled 18:00' }
    ]
  },
  {
    questionId: 'Q10',
    questionText: 'What are the most critical safety issues today?',
    category: 'Incidents & Safety Events',
    sapSourceTables: ['EHFND_INCIDENT', 'EHFND_INC_ROOT', 'EHFND_RAS_HAZ', 'EHFND_LOC_ROOT'],
    summaryAnswer: 'The EHS Executive AI Agent has synthesized real-time incident telemetry, open CAPAs, and risk assessment models to identify the TOP 3 critical safety issues requiring immediate executive attention today: 1. Chemical Dosing Unit B4 Viton seal retrofitting (Plant 1010), 2. Stacker Crane SC-04 optical alignment (Plant 1020), and 3. Combustible dust extraction filter differential pressure in Granulator G-10 (Plant 1010).',
    keyInsights: [
      'Issue 1 (Plant 1010 Dosing B4): Sump neutralizer holding tank requires drainage verification before afternoon chemical transfer cycle at 16:00.',
      'Issue 2 (Plant 1020 Stacker Bay 3): Crane operates under 30% speed restriction; laser alignment test must complete before night shift high-volume picking.',
      'Issue 3 (Plant 1010 Granulator G-10): LEV filter delta-P is 280 Pa (limit 300 Pa); pulse-jet cleaning cycle scheduled at 15:30 to prevent dust accumulation.',
      'All 3 issues have active containment measures and dedicated certified safety personnel assigned.'
    ],
    ehsMetrics: [
      { label: 'Critical Focus Issues', value: '3 Priorities', status: 'warning' },
      { label: 'Plant Safety Readiness', value: '97.8%', status: 'positive' },
      { label: 'Containment Integrity', value: '100%', status: 'positive' },
      { label: 'Executive SteerCo Briefed', value: 'Yes (08:30)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Chemical Release Prevention', value: 'Priority 1', variance: 'Plant 1010', detail: 'Valve V-104 seal retrofit & sump neutralizer drainage' },
      { category: 'Warehouse Robotics Alignment', value: 'Priority 2', variance: 'Plant 1020', detail: 'Stacker crane SC-04 laser telemetry recalibration' },
      { category: 'Combustible Dust Hygiene', value: 'Priority 3', variance: 'Plant 1010', detail: 'Granulator G-10 baghouse pulse-jet filter cleaning' }
    ],
    recommendedSapActions: [
      { actionName: 'Launch Morning Safety Triage Cockpit', tcode: 'F2453 / CBIH82', description: 'Review operational status, safety interlock overrides, and hot-work permits for the day\'s production plan.' },
      { actionName: 'Verify Environmental Containment Sign-Off', tcode: 'F3124', description: 'Confirm zero environmental discharge and record continuous pH monitoring values in S/4HANA EHS.' }
    ],
    incidentOrHazardDetails: [
      { id: 'CRIT-01', name: 'Chemical Dosing Unit B4 Seal Retrofit', severity: 'Major - Level 2', status: 'Under Engineering', metric: 'Priority 1', detail: 'Plant 1010 | Lead: Dr. M. Vance | Clearance required by 16:00' },
      { id: 'CRIT-02', name: 'Stacker Crane SC-04 Laser Recalibration', severity: 'Minor - Level 4', status: 'Under Calibration', metric: 'Priority 2', detail: 'Plant 1020 | Lead: K. Lindqvist | Test at 18:00' },
      { id: 'CRIT-03', name: 'Granulator G-10 Dust Extraction Pulse', severity: 'Moderate - Level 3', status: 'Scheduled', metric: 'Priority 3', detail: 'Plant 1010 | Lead: H. Schmidt | Pulse-jet at 15:30' }
    ]
  },

  // ============================================================================
  // PILLAR 2: INCIDENT INVESTIGATION (Q11 - Q20)
  // ============================================================================
  {
    questionId: 'Q11',
    questionText: 'Why did Incident INC-10045 occur?',
    category: 'Incident Investigation',
    sapSourceTables: ['EHFND_INCIDENT', 'EHFND_INC_ROOT', 'EHFND_INC_CAU', 'EHFND_INC_ACT'],
    summaryAnswer: 'Formal Root Cause Analysis in S/4HANA EHS demonstrates that Incident INC-10045 (Reaction Vessel RX-201 Thermal Exotherm Pressure Relief Discharge) occurred due to a dual-failure sequence: 1. Catalyst feed rate flow transmitter FT-201 drift (+14% over-dosing), coupled with 2. Cooling jacket chilled water bypass valve CV-204 sticking in 40% open position due to calcium scale accumulation.',
    keyInsights: [
      'Direct Cause: Exothermic polymerization reaction temperature climbed from setpoint 78°C to 94°C in 6.2 minutes.',
      'Safety System Response: Rupture disc burst safely at 4.2 bar; emergency knockout pot caught 100% of vented vapor/liquid with zero atmospheric emission.',
      'Contributing Factor: Cooling water chemical treatment biocidal descaling cycle was deferred 3 weeks prior due to production backlog.',
      'Root Cause: Inadequate preventive maintenance scheduling interlock between SAP PM (WBS-CHILL) and S/4HANA EHS Risk Assessment module.'
    ],
    ehsMetrics: [
      { label: 'Exotherm Peak Pressure', value: '4.2 Bar', status: 'warning' },
      { label: 'Knockout Pot Containment', value: '100% (Zero Leak)', status: 'positive' },
      { label: 'Vessel Mechanical Damage', value: 'None ($0)', status: 'positive' },
      { label: 'RCA Completion Status', value: '100% Approved', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Primary Instrument Failure', value: 'Flow Transmitter FT-201', variance: '+14% Drift', detail: 'Optical flow meter calibration overdue by 12 days' },
      { category: 'Secondary Mechanical Failure', value: 'Cooling Valve CV-204', variance: '40% Sticking', detail: 'Calcium carbonate scale buildup on valve stem' },
      { category: 'Management System Gap', value: 'PM Deferral Policy', variance: 'Policy Defect', detail: 'Safety-critical PM deferred without EHS sign-off' }
    ],
    recommendedSapActions: [
      { actionName: 'Review INC-10045 Full Investigation Dossier', tcode: 'F2453', description: 'Open S/4HANA EHS comprehensive investigation report with 5-Why root cause diagram and engineering telemetry.' },
      { actionName: 'Enforce Safety-Critical PM Lock', tcode: 'IP10 / IW32', description: 'Configure S/4HANA PM/EHS interlock preventing maintenance plan deferral on Safety Instrumented Systems (SIS).' }
    ],
    incidentOrHazardDetails: [
      { id: 'INC-10045', name: 'Reaction Vessel RX-201 Exotherm Discharge', severity: 'Major - Level 2', status: 'CAPA Implemented', metric: 'Closed RCA', detail: 'Plant 1010 | Chemical Reactor Cell 2 | Zero injuries' }
    ]
  },
  {
    questionId: 'Q12',
    questionText: 'Show root causes for this incident.',
    category: 'Incident Investigation',
    sapSourceTables: ['EHFND_INC_ROOT', 'EHFND_INC_CAU', 'EHFND_INCIDENT'],
    summaryAnswer: 'The multi-branch 5-Why and Ishikawa root cause breakdown for the selected incident (INC-10045 / INC-2026-9081) categorizes root causes into 4 standard S/4HANA EHS domains: 1. Equipment & Instrumentation, 2. Process & Material Compatibility, 3. Maintenance Execution & Scheduling, and 4. Management System Controls.',
    keyInsights: [
      'Branch 1 (Equipment): Flow transmitter drift undetected due to lack of redundant voting logic (1oo1 architecture upgraded to 2oo3).',
      'Branch 2 (Material): Gasket polymer degradation accelerated by solvent chemical interaction under elevated operating temperatures.',
      'Branch 3 (Maintenance): Preventive descaling work order deferred without formal Management of Change (MOC) hazard evaluation.',
      'Branch 4 (Governance): EHS safety-critical asset classification was missing on secondary cooling bypass loop.'
    ],
    ehsMetrics: [
      { label: 'Root Cause Branches', value: '4 Pillars', status: 'positive' },
      { label: '5-Why Depth Reached', value: 'Level 5 (Systemic)', status: 'positive' },
      { label: 'Identified Failure Modes', value: '3 Factors', status: 'neutral' },
      { label: 'Preventive Actions Defined', value: '4 CAPAs', status: 'positive' }
    ],
    breakdownData: [
      { category: '1. Technical / Instrumentation', value: 'Sensor Drift (35%)', variance: 'Root Cause 1', detail: 'Single transmitter without dual-sensor validation' },
      { category: '2. Material Compatibility', value: 'Gasket Degradation (25%)', variance: 'Root Cause 2', detail: 'EPDM unsuitable for aromatic hydrocarbon exposure' },
      { category: '3. Work Process & Maintenance', value: 'PM Deferral (25%)', variance: 'Root Cause 3', detail: 'Cooling loop descaling delayed past 90-day interval' },
      { category: '4. Organizational & Training', value: 'Governance Gap (15%)', variance: 'Root Cause 4', detail: 'Lack of automated EHS interlock on PM reschedule' }
    ],
    recommendedSapActions: [
      { actionName: 'Display Root Cause Tree Diagram', tcode: 'F2453', description: 'View interactive Ishikawa cause-and-effect visual diagram linked to S/4HANA EHS incident record.' },
      { actionName: 'Link Root Causes to Risk Matrix', tcode: 'F2849', description: 'Update Location Risk Assessment severity/likelihood scores based on verified RCA failure modes.' }
    ],
    incidentOrHazardDetails: [
      { id: 'RC-01', name: 'Lack of Redundant Sensor Validation', severity: 'Major - Level 2', status: 'Engineering Action', metric: 'CAPA-8840', detail: 'Installing dual Rosemount 8705 magnetic flowmeters' },
      { id: 'RC-02', name: 'Incompatible Gasket Spec', severity: 'Moderate - Level 3', status: 'Procurement Action', metric: 'CAPA-8841', detail: 'Material Master updated to Viton Flange Spec' },
      { id: 'RC-03', name: 'Uncontrolled PM Deferral Process', severity: 'Major - Level 2', status: 'Workflow Rule', metric: 'CAPA-8842', detail: 'Mandatory EHS approval workflow on SIS maintenance orders' }
    ]
  },
  {
    questionId: 'Q13',
    questionText: 'Which corrective actions are still open?',
    category: 'Incident Investigation',
    sapSourceTables: ['EHFND_INC_ACT', 'EHFND_INCIDENT', 'EHFND_INC_ROOT'],
    summaryAnswer: 'There are currently 4 open Corrective and Preventive Actions (CAPA) in S/4HANA EHS across all active plant incidents: 2 in Engineering Procurement, 1 in Calibration/Testing, and 1 in Procedure Revision. None are currently past due.',
    keyInsights: [
      'CAPA-8840 (INC-10045): Install 2oo3 redundant flow transmitter voting loop on RX-201; hardware received, installation on weekend turnaround.',
      'CAPA-8841 (INC-2026-9081): Retrofit Viton Gaskets across Chemical Dosing Lines 1-4; 60% completed by Plant 1010 Mechanical Team.',
      'CAPA-8843 (INC-2026-9082): Recalibrate Laser Distance Sensor on Stacker Crane SC-04; scheduled for 18:00 today.',
      'CAPA-8845 (INC-2026-8821): Update ATEX dust cleaning SOP & verify operator sign-offs in SuccessFactors; draft in review.'
    ],
    ehsMetrics: [
      { label: 'Total Open CAPAs', value: '4 Actions', status: 'warning' },
      { label: 'On Schedule Rate', value: '100%', status: 'positive' },
      { label: 'Engineering Actions', value: '2 CAPAs', status: 'neutral' },
      { label: 'Training/SOP Actions', value: '2 CAPAs', status: 'neutral' }
    ],
    breakdownData: [
      { category: 'Engineering & Hardware Retrofit', value: '2 CAPAs', variance: '50.0%', detail: 'Dual flow transmitters (RX-201) & Viton gaskets (Dosing B4)' },
      { category: 'Calibration & Instrument Alignment', value: '1 CAPA', variance: '25.0%', detail: 'Stacker crane SC-04 laser distance sensor' },
      { category: 'SOP Revision & Operator Training', value: '1 CAPA', variance: '25.0%', detail: 'ATEX Zone 22 combustible dust cleaning protocol' }
    ],
    recommendedSapActions: [
      { actionName: 'Manage Corrective Actions Cockpit', tcode: 'F2453 / CBIH92', description: 'Monitor CAPA completion percentages, assignees, milestone target dates, and uploaded verification evidence.' },
      { actionName: 'Verify CAPA Effectiveness Sign-Off', tcode: 'CBIH92', description: 'Execute 30-day post-implementation effectiveness verification audit as required by ISO 45001.' }
    ],
    incidentOrHazardDetails: [
      { id: 'CAPA-8840', name: 'RX-201 Dual Flow Transmitter 2oo3 Voting', severity: 'Major - Level 2', status: 'In Progress', metric: 'Due Sep 02', detail: 'Plant 1010 | Lead: E. Rossi | Hardware staged in Maint Shop' },
      { id: 'CAPA-8841', name: 'Chemical Dosing Unit Viton Flange Retrofit', severity: 'Major - Level 2', status: 'In Progress', metric: 'Due Aug 28', detail: 'Plant 1010 | Lead: M. Vance | 60% complete (Lines 1 & 2 done)' },
      { id: 'CAPA-8843', name: 'Stacker SC-04 Laser Sensor Recalibration', severity: 'Minor - Level 4', status: 'Scheduled', metric: 'Due Aug 26', detail: 'Plant 1020 | Lead: K. Lindqvist | Scheduled 18:00 today' },
      { id: 'CAPA-8845', name: 'ATEX Zone 22 Dust Cleaning SOP & LMS', severity: 'Moderate - Level 3', status: 'Draft Review', metric: 'Due Aug 30', detail: 'Plant 1010 | Lead: H. Schmidt | LMS quiz published' }
    ]
  },
  {
    questionId: 'Q14',
    questionText: 'Which incidents have similar causes?',
    category: 'Incident Investigation',
    sapSourceTables: ['EHFND_INC_CAU', 'EHFND_INCIDENT', 'EHFND_INC_ROOT'],
    summaryAnswer: 'AI semantic root-cause cross-correlation across 3 years of S/4HANA EHS historical records identifies 3 historical incidents sharing identical root-cause signatures with current events: INC-2024-4110 (Acid pump flange leak - 94% similarity to INC-2026-9081), INC-2025-6320 (Polymerizer exotherm - 91% similarity to INC-10045), and INC-2025-7104 (AGV sensor drift - 88% similarity to INC-2026-9082).',
    keyInsights: [
      'Cluster A (Elastomer Degradation in Solvent/Acid Service): INC-2024-4110 & INC-2026-9081 both stemmed from standard gasket exposure to aggressive chemistries.',
      'Cluster B (Sensor Calibration Drift in Safety Loops): INC-2025-6320 & INC-10045 both involved flow/temperature transmitter calibration intervals exceeding sensor drift rates.',
      'Cluster C (Optical Sensor Distortion from Ambient Dust): INC-2025-7104 & INC-2026-9082 both caused by airborne particulate coating optical sensor lenses.',
      'Pattern identification enables cross-plant preventive campaigns rather than isolated single-point fixes.'
    ],
    ehsMetrics: [
      { label: 'Correlated Incident Clusters', value: '3 Clusters', status: 'warning' },
      { label: 'Max AI Similarity Match', value: '94.2%', status: 'warning' },
      { label: 'Cross-Plant Repeat Risks', value: '2 Sites', status: 'neutral' },
      { label: 'Systemic Mitigation Active', value: 'Yes', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Cluster 1: Elastomer Chemical Attack', value: '2 Cases (94% Match)', variance: 'High Sim', detail: 'INC-2024-4110 (Plant 1010) & INC-2026-9081' },
      { category: 'Cluster 2: Single-Sensor Loop Drift', value: '2 Cases (91% Match)', variance: 'High Sim', detail: 'INC-2025-6320 (Plant 1010) & INC-10045' },
      { category: 'Cluster 3: Optical Sensor Dust Blinding', value: '2 Cases (88% Match)', variance: 'Med Sim', detail: 'INC-2025-7104 (Plant 1020) & INC-2026-9082' }
    ],
    recommendedSapActions: [
      { actionName: 'Launch Cross-Plant Lessons Learned', tcode: 'F2453', description: 'Publish S/4HANA EHS Lessons Learned Knowledge Base article and push to all plant engineering leads.' },
      { actionName: 'Execute Multi-Incident Similarity Query', tcode: 'CBIH82', description: 'Run EHS cause-code clustering report across all global company codes and operating divisions.' }
    ],
    incidentOrHazardDetails: [
      { id: 'INC-2024-4110', name: 'Pump P-102 Nitric Acid Flange Weep', severity: 'Major - Level 2', status: 'Historical Closed', metric: '94% Similar', detail: 'Root Cause: EPDM gasket embrittlement | Plant 1010' },
      { id: 'INC-2025-6320', name: 'Polymerizer Reactor P-101 Temperature Spike', severity: 'Major - Level 2', status: 'Historical Closed', metric: '91% Similar', detail: 'Root Cause: RTD sensor drift + valve scale | Plant 1010' },
      { id: 'INC-2025-7104', name: 'AGV Unit 4 Collision with Staging Rack', severity: 'Minor - Level 4', status: 'Historical Closed', metric: '88% Similar', detail: 'Root Cause: Dust film on LiDAR scanner window | Plant 1020' }
    ]
  },
  {
    questionId: 'Q15',
    questionText: 'Show incidents involving the same equipment.',
    category: 'Incident Investigation',
    sapSourceTables: ['EHFND_INCIDENT', 'EHFND_INC_ROOT', 'EQUI', 'EQUZ', 'QMIH'],
    summaryAnswer: 'Equipment asset correlation between S/4HANA EHS and SAP Plant Maintenance (EQUI) identifies 3 specific equipment assets with recurring incident histories: 1. Chemical Dosing Pump P-104 (EQ-10088910: 3 events), 2. Stacker Crane SC-04 (EQ-10088955: 2 events), and 3. Conveyor Line C-102 (EQ-10088920: 2 events).',
    keyInsights: [
      'Chemical Dosing Pump P-104 (EQ-10088910): Experienced 1 major acid spill (INC-2026-9081), 1 seal weep in Nov 2025, and 1 motor thermal overload in July 2025; asset flagged for complete pump skid replacement.',
      'Stacker Crane SC-04 (EQ-10088955): 2 proximity sensor drift near-misses in 6 months; optical sensor mount relocated to isolate mast vibration.',
      'Packaging Conveyor C-102 (EQ-10088920): 2 operator pinch/reach-in events during manual carton re-alignments; mechanical chute enclosure installed.',
      'Zero other equipment master assets have had more than 1 safety event in the past 24 months.'
    ],
    ehsMetrics: [
      { label: 'Multi-Incident Assets', value: '3 Equipment', status: 'warning' },
      { label: 'Highest Incident Asset', value: 'Pump P-104 (3 Events)', status: 'warning' },
      { label: 'Asset Replacement Planned', value: 'EQ-10088910', status: 'positive' },
      { label: 'PM/EHS Sync Status', value: '100% Linked', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Dosing Pump P-104 (EQ-10088910)', value: '3 Incidents', variance: 'Plant 1010', detail: '1 Major Acid Release, 1 Gasket Weep, 1 Thermal Trip' },
      { category: 'Stacker Crane SC-04 (EQ-10088955)', value: '2 Incidents', variance: 'Plant 1020', detail: '2 Proximity Sensor Drift Near-Misses' },
      { category: 'Conveyor C-102 (EQ-10088920)', value: '2 Incidents', variance: 'Plant 1000', detail: '2 Nip Point / Jam Clearance Incursions' }
    ],
    recommendedSapActions: [
      { actionName: 'Display Equipment Safety History', tcode: 'IE03 / F2173', description: 'Open SAP PM Equipment Master and view linked S/4HANA EHS incidents, failure history, and MTBF.' },
      { actionName: 'Create Equipment Replacement Capital WBS', tcode: 'CJ20N / IW31', description: 'Initiate capital replacement project for Dosing Pump Skid P-104 with upgraded Hastelloy/Viton specifications.' }
    ],
    incidentOrHazardDetails: [
      { id: 'EQ-10088910', name: 'Chemical Dosing Pump P-104', severity: 'Major - Level 2', status: 'Replacement Slated', metric: '3 Incidents', detail: 'Plant 1010 | Asset Age: 9.4 yrs | Replacement PO-99120 approved' },
      { id: 'EQ-10088955', name: 'Automated Stacker Crane SC-04', severity: 'Minor - Level 4', status: 'Sensor Upgraded', metric: '2 Incidents', detail: 'Plant 1020 | High-Bay Bay 3 | Vibration dampeners installed' },
      { id: 'EQ-10088920', name: 'Assembly Conveyor Line C-102', severity: 'Minor - Level 4', status: 'Guards Enclosed', metric: '2 Incidents', detail: 'Plant 1000 | Packaging Hall | Category 4 interlocks live' }
    ]
  },
  {
    questionId: 'Q16',
    questionText: 'Which incidents occurred during the same activity?',
    category: 'Incident Investigation',
    sapSourceTables: ['EHFND_INCIDENT', 'EHFND_INC_ROOT', 'EHFND_INC_EVT'],
    summaryAnswer: 'Activity-based segmentation in S/4HANA EHS reveals that 62.5% of all safety incidents and near-misses occurred during 3 specific operational activities: 1. Manual Line Jam Clearance / Unjamming (31%), 2. Chemical Transfer & Offloading Operations (19%), and 3. Shift Handover Maintenance Turnaround Tasks (12.5%).',
    keyInsights: [
      'Activity 1 (Manual Jam Clearance): 5 events in 12 months; operators bypassed LOTO to clear fallen cartons or jammed plastic preforms without de-energizing.',
      'Activity 2 (Chemical Transfer): 3 events; flexible transfer hose coupling disconnection before full pressure bleed-off.',
      'Activity 3 (Shift Handover Maintenance): 2 events; incomplete communication of lock-out boundary isolations between incoming and outgoing shifts.',
      'Standardizing activity-based Job Safety Analyses (JSA) for these 3 activities provides targeted risk mitigation.'
    ],
    ehsMetrics: [
      { label: 'Top Activity Risk Share', value: '62.5%', status: 'warning' },
      { label: 'Highest Risk Activity', value: 'Jam Clearance (31%)', status: 'warning' },
      { label: 'JSAs Re-Certified', value: '3 Protocols', status: 'positive' },
      { label: 'Digital LOTO Enforced', value: 'Yes', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Manual Line Jam Clearance', value: '5 Events (31.3%)', variance: 'High Risk', detail: 'Conveyor lines 1, 2, 4 and shrink-wrapper' },
      { category: 'Chemical Transfer & Bulk Offload', value: '3 Events (18.8%)', variance: 'High Risk', detail: 'Tank truck offloading and drum filling stations' },
      { category: 'Shift Handover Maintenance', value: '2 Events (12.5%)', variance: 'Med Risk', detail: 'Incomplete lock-out tag transfer at shift change' },
      { category: 'Routine Material Handling (Forklift)', value: '3 Events (18.8%)', variance: 'Med Risk', detail: 'Pallet transit in narrow warehouse aisles' },
      { category: 'All Other Standard Operations', value: '3 Events (18.8%)', variance: 'Low Risk', detail: 'Routine machining, packing, inspection' }
    ],
    recommendedSapActions: [
      { actionName: 'Enforce Activity-Based JSA Verification', tcode: 'F2849 / CBIH02', description: 'Review and mandate electronic Job Safety Analysis (JSA) sign-off prior to authorizing non-routine jam clearances.' },
      { actionName: 'Deploy Digital LOTO Mobile App', tcode: 'F2039', description: 'Enable tablet-based QR scan verification of all zero-energy mechanical and electrical isolations.' }
    ],
    incidentOrHazardDetails: [
      { id: 'ACT-JAM', name: 'Conveyor Jam Clearance & De-Staging', severity: 'Moderate - Level 3', status: 'JSA Enforced', metric: '5 Incidents', detail: 'Mandatory zero-energy isolation tool & reach-rod protocol' },
      { id: 'ACT-CHEM', name: 'Chemical Bulk Tanker Hose Connection', severity: 'Major - Level 2', status: 'Interlock Installed', metric: '3 Incidents', detail: 'Dry-break camlock coupling interlocked with bleed valve' },
      { id: 'ACT-SHIFT', name: 'Shift-Change Maintenance LOTO Transfer', severity: 'Moderate - Level 3', status: 'Digital Handover', metric: '2 Incidents', detail: 'Electronic handover log mandatory in SAP PM' }
    ]
  },
  {
    questionId: 'Q17',
    questionText: 'Show investigation status by plant.',
    category: 'Incident Investigation',
    sapSourceTables: ['EHFND_INCIDENT', 'EHFND_INC_ROOT', 'EHFND_INC_LOC'],
    summaryAnswer: 'Across all enterprise manufacturing locations, 94.1% of all incident investigations logged in S/4HANA EHS are fully completed and closed. Currently, only 3 investigations are active: Plant 1010 has 2 active investigations (Acid spill, Granulator dust), Plant 1020 has 1 active (Stacker crane), while Plant 1000 and Plant 1030 have 100% of investigations completed.',
    keyInsights: [
      'Plant 1000 (Central Assembly): 14 investigations completed YTD (100% closed, 0 open); avg completion time 4.2 days.',
      'Plant 1010 (Chemical & Heavy Mfg): 16 investigations completed, 2 active; avg completion time 5.8 days (within 7-day SLA).',
      'Plant 1020 (Logistics & Distribution): 9 investigations completed, 1 active; avg completion time 3.1 days.',
      'Plant 1030 (Energy & Utilities): 6 investigations completed (100% closed, 0 open); avg completion time 3.8 days.',
      'Enterprise average investigation turnaround is 4.4 days against corporate SLA of 7.0 days.'
    ],
    ehsMetrics: [
      { label: 'Enterprise Closure Rate', value: '94.1%', status: 'positive' },
      { label: 'Active Investigations', value: '3 Cases', status: 'warning' },
      { label: 'Avg Investigation Turnaround', value: '4.4 Days', status: 'positive' },
      { label: 'Corporate SLA Benchmark', value: '7.0 Days', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Plant 1010 (Chemical & Heavy Mfg)', value: '2 Active / 16 Closed', variance: '88.9% Closed', detail: 'Avg turnaround: 5.8 days | 2 active in SLA' },
      { category: 'Plant 1020 (Logistics & Warehouse)', value: '1 Active / 9 Closed', variance: '90.0% Closed', detail: 'Avg turnaround: 3.1 days | 1 active in SLA' },
      { category: 'Plant 1000 (Central Assembly)', value: '0 Active / 14 Closed', variance: '100% Closed', detail: 'Avg turnaround: 4.2 days | All closed' },
      { category: 'Plant 1030 (Energy & Utilities)', value: '0 Active / 6 Closed', variance: '100% Closed', detail: 'Avg turnaround: 3.8 days | All closed' }
    ],
    recommendedSapActions: [
      { actionName: 'Open Plant Investigation Status Cockpit', tcode: 'F2453', description: 'Monitor live investigation progress bars, pending witness interviews, and RCA sign-offs by plant location.' },
      { actionName: 'Export EHS Performance Scorecard', tcode: 'CBIH82', description: 'Generate monthly executive KPI slide pack comparing plant investigation speed and CAPA closure effectiveness.' }
    ],
    incidentOrHazardDetails: [
      { id: 'PLANT-1010', name: 'Plant 1010 Chemical & Heavy Manufacturing', severity: 'Major - Level 2', status: '2 Active / 16 Closed', metric: '88.9% Done', detail: 'INC-2026-9081 (Day 2/7), INC-2026-8821 (Day 3/7)' },
      { id: 'PLANT-1020', name: 'Plant 1020 Automated Distribution Center', severity: 'Minor - Level 4', status: '1 Active / 9 Closed', metric: '90.0% Done', detail: 'INC-2026-9082 (Day 1/5)' },
      { id: 'PLANT-1000', name: 'Plant 1000 Central Automotive Assembly', severity: 'Minor - Level 4', status: '0 Active / 14 Closed', metric: '100% Closed', detail: '14 of 14 Closed | 0 overdue' },
      { id: 'PLANT-1030', name: 'Plant 1030 Energy & Thermal Generation', severity: 'Major - Level 2', status: '0 Active / 6 Closed', metric: '100% Closed', detail: '6 of 6 Closed | 0 overdue' }
    ]
  },
  {
    questionId: 'Q18',
    questionText: 'Which investigations are overdue?',
    category: 'Incident Investigation',
    sapSourceTables: ['EHFND_INCIDENT', 'EHFND_INC_ROOT', 'EHFND_INC_ACT'],
    summaryAnswer: 'Zero (0) incident investigations are currently overdue across the enterprise. All 3 active investigations (INC-2026-9081 at Day 2/7, INC-2026-9082 at Day 1/5, and INC-2026-8821 at Day 3/7) are progressing on schedule within their designated SLA milestone windows.',
    keyInsights: [
      'Corporate EHS policy enforces strict 7-day SLA for Level 1/2 major incidents and 5-day SLA for Level 3/4 minor/near-miss events.',
      'S/4HANA EHS automated milestone triggers send notification reminders to Lead Investigators at 50% and 75% elapsed time.',
      'Historical 12-month investigation on-time delivery rate is 98.4% across 48 completed inquiries.',
      'Predictive SLA monitoring indicates all 3 active investigations have >95% probability of on-time completion.'
    ],
    ehsMetrics: [
      { label: 'Overdue Investigations', value: '0 Cases', status: 'positive' },
      { label: 'Active In-SLA Cases', value: '3 Cases', status: 'positive' },
      { label: '12-Month On-Time Rate', value: '98.4%', status: 'positive' },
      { label: 'Average Days to Target', value: '4.0 Days Remaining', status: 'positive' }
    ],
    breakdownData: [
      { category: 'INC-2026-9081 (Acid Spill B4)', value: 'Day 2 of 7 (28%)', variance: '5 Days Remaining', detail: 'Root Cause draft ready; lab corrosion analysis pending' },
      { category: 'INC-2026-9082 (Stacker Crane SC-04)', value: 'Day 1 of 5 (20%)', variance: '4 Days Remaining', detail: 'OEM telemetry downloaded; test scheduled today 18:00' },
      { category: 'INC-2026-8821 (Granulator Dust Leak)', value: 'Day 3 of 7 (43%)', variance: '4 Days Remaining', detail: 'Filter delta-P logged; air velocity profile complete' }
    ],
    recommendedSapActions: [
      { actionName: 'Review Investigation SLA Dashboard', tcode: 'F2453', description: 'Display S/4HANA EHS investigation milestone tracking and automated reminder configurations.' },
      { actionName: 'Configure Escalation Alerts', tcode: 'EHFND_NW', description: 'Verify automated SMS/Email alerts to Plant EHS Directors if an investigation reaches Day 5 without an approved RCA.' }
    ],
    incidentOrHazardDetails: [
      { id: 'INC-2026-9081', name: 'Dosing Unit B4 Acid Spill', severity: 'Major - Level 2', status: 'On Track', metric: '5d Left', detail: 'Due Date: Aug 28 | SLA Status: Green' },
      { id: 'INC-2026-9082', name: 'Stacker Crane Proximity Near-Miss', severity: 'Minor - Level 4', status: 'On Track', metric: '4d Left', detail: 'Due Date: Aug 29 | SLA Status: Green' },
      { id: 'INC-2026-8821', name: 'Granulator Hopper Dust Cloud Leak', severity: 'Moderate - Level 3', status: 'On Track', metric: '4d Left', detail: 'Due Date: Aug 30 | SLA Status: Green' }
    ]
  },
  {
    questionId: 'Q19',
    questionText: 'Which corrective actions have not been verified?',
    category: 'Incident Investigation',
    sapSourceTables: ['EHFND_INC_ACT', 'EHFND_INCIDENT', 'EHFND_INC_ROOT'],
    summaryAnswer: 'In S/4HANA EHS, corrective actions undergo a mandatory 30-day Post-Implementation Effectiveness Verification before final closure. Currently, 3 completed CAPAs are in their active 30-day surveillance window awaiting formal effectiveness sign-off: CAPA-8710 (Dock 4 ramp anti-skid), CAPA-8722 (Packaging Line 1 light curtain), and CAPA-8735 (Solvent drum earth grounding clips).',
    keyInsights: [
      'CAPA-8710 (Plant 1000): Anti-skid epoxy installed on Loading Dock 4; Day 22 of 30 surveillance; zero slip incidents recorded in rainy conditions.',
      'CAPA-8722 (Plant 1000): Light curtain interlock on Line 1; Day 15 of 30 surveillance; daily optical beam test passed 100%.',
      'CAPA-8735 (Plant 1010): Static grounding clip upgrade in Solvent Dispensing Room; Day 28 of 30 surveillance; scheduled for final sign-off in 2 days.',
      'All 3 actions are showing positive effectiveness data with zero repeat occurrences during the monitoring period.'
    ],
    ehsMetrics: [
      { label: 'Pending Verification CAPAs', value: '3 Actions', status: 'neutral' },
      { label: 'Surveillance Compliance', value: '100%', status: 'positive' },
      { label: 'Repeat Events in Window', value: '0 Events', status: 'positive' },
      { label: 'Next Sign-Off Due', value: 'In 2 Days', status: 'positive' }
    ],
    breakdownData: [
      { category: 'CAPA-8735 (Solvent Earth Grounding)', value: 'Day 28 of 30', variance: 'Final Stage', detail: 'Ohmmeter resistance test verified <10 Ohms to earth' },
      { category: 'CAPA-8710 (Dock 4 Anti-Skid Ramp)', value: 'Day 22 of 30', variance: 'Mid-Stage', detail: 'Friction coefficient test: 0.85 COF (benchmark >0.60)' },
      { category: 'CAPA-8722 (Line 1 Light Curtain)', value: 'Day 15 of 30', variance: 'Mid-Stage', detail: '3,200 continuous cycles with 100% trip reliability' }
    ],
    recommendedSapActions: [
      { actionName: 'Execute 30-Day Effectiveness Audit', tcode: 'F2453 / CBIH92', description: 'Record effectiveness audit observations, upload testing measurements, and electronically sign off on final CAPA closure.' },
      { actionName: 'Archive Verified Safety Improvements', tcode: 'CBIH82', description: 'Promote verified CAPA best practices to global SAP EHS plant standard catalog.' }
    ],
    incidentOrHazardDetails: [
      { id: 'CAPA-8735', name: 'Solvent Dispensing Static Earth Grounding', severity: 'Major - Level 2', status: 'Verification Day 28', metric: 'Due Aug 28', detail: 'Plant 1010 | Lead: M. Vance | Resistance: 4.2 Ohms (Pass)' },
      { id: 'CAPA-8710', name: 'Loading Dock 4 Anti-Skid Epoxy Surface', severity: 'Moderate - Level 3', status: 'Verification Day 22', metric: 'Due Sep 03', detail: 'Plant 1000 | Lead: S. Martinez | Friction: 0.85 COF (Pass)' },
      { id: 'CAPA-8722', name: 'Packaging Line 1 Optical Safety Barrier', severity: 'Moderate - Level 3', status: 'Verification Day 15', metric: 'Due Sep 10', detail: 'Plant 1000 | Lead: J. Davis | 100% Interlock pass' }
    ]
  },
  {
    questionId: 'Q20',
    questionText: 'Recommend corrective actions for this incident.',
    category: 'Incident Investigation',
    sapSourceTables: ['EHFND_INC_ACT', 'EHFND_INCIDENT', 'EHFND_RAS_CTRL'],
    summaryAnswer: 'Based on the S/4HANA EHS Hierarchy of Controls (Elimination, Substitution, Engineering Controls, Administrative Controls, PPE) and historical multi-plant benchmark models, the EHS AI Agent recommends a 4-tier CAPA package for active incident INC-2026-9081 (Chemical Dosing Unit Acid Release): 1. Viton Flange Seal Standard (Engineering), 2. Automated Sump Level Interlock (Engineering), 3. Mandatory Dynamic Pressure Test SOP (Administrative), and 4. Acid Hood Respirator Protocol (PPE).',
    keyInsights: [
      'Tier 1 (Engineering - High Impact): Retrofit all synthetic polymer gaskets on Dosing Skid P-104 with Viton/PTFE Flange Seals rated for 98% acid concentration.',
      'Tier 2 (Engineering - Interlock): Wire sump liquid optical sensor directly to emergency shutoff valve V-101 (auto-trips pump within 500ms of liquid detection).',
      'Tier 3 (Administrative): Implement digital pre-transfer pressure hold test (1.5x operating pressure for 5 minutes) before authorizing bulk transfers.',
      'Tier 4 (PPE): Mandate Level B chemical splash suit and full-face supplied air respirator during all flange torque re-tightening procedures.'
    ],
    ehsMetrics: [
      { label: 'Recommended CAPAs', value: '4 Tiers', status: 'positive' },
      { label: 'Hierarchy Rating', value: '75% Engineering', status: 'positive' },
      { label: 'Risk Reduction Factor', value: '92.5%', status: 'positive' },
      { label: 'Estimated Implementation Cost', value: '$8,400', status: 'neutral' }
    ],
    breakdownData: [
      { category: 'Tier 1: Engineering Material Substitution', value: 'Viton/PTFE Flanges', variance: '55% Risk Red.', detail: 'Eliminates chemical elastomer degradation risk' },
      { category: 'Tier 2: Engineering Safety Interlock', value: 'Auto-Sump Trip V-101', variance: '25% Risk Red.', detail: 'Limits spill volume to <1 Liter maximum' },
      { category: 'Tier 3: Administrative Control', value: 'Pre-Transfer Pressure SOP', variance: '12% Risk Red.', detail: 'Ensures integrity before fluid pumping' },
      { category: 'Tier 4: Personal Protective Equipment', value: 'Level B Chemical Splash PPE', variance: '8% Risk Red.', detail: 'Guarantees operator physical protection' }
    ],
    recommendedSapActions: [
      { actionName: 'Auto-Generate S/4HANA CAPA Tasks', tcode: 'F2453', description: 'Create 4 structured CAPA line items directly in S/4HANA EHS with assigned target dates and engineering leads.' },
      { actionName: 'Generate Maintenance Work Orders in SAP PM', tcode: 'IW31', description: 'Create PM work orders to execute Viton seal retrofit and optical sensor interlock wiring under WBS-EHS-2026.' }
    ],
    incidentOrHazardDetails: [
      { id: 'REC-01', name: 'Retrofit Viton/PTFE Flange Seals (Skid P-104)', severity: 'Major - Level 2', status: 'Approved for Execution', metric: 'Tier 1 Eng', detail: 'Work Order WO-88419 | Lead: Mechanical Engineering' },
      { id: 'REC-02', name: 'Install Optical Sump Leak Interlock Valve V-101', severity: 'Major - Level 2', status: 'Approved for Execution', metric: 'Tier 2 Eng', detail: 'Work Order WO-88420 | Lead: Automation & Controls' },
      { id: 'REC-03', name: 'Publish Pre-Transfer Pressure Test Protocol SOP', severity: 'Moderate - Level 3', status: 'Drafting', metric: 'Tier 3 Admin', detail: 'SOP-CHEM-412 | Lead: Process Safety Team' },
      { id: 'REC-04', name: 'Update Level B Acid PPE Standard in SAP EHS', severity: 'Moderate - Level 3', status: 'Approved', metric: 'Tier 4 PPE', detail: 'PPE Spec PPE-ACID-02 | Lead: Industrial Hygiene' }
    ]
  },

  // ============================================================================
  // PILLAR 3: RISK ASSESSMENT & HAZARDS (Q21 - Q25)
  // ============================================================================
  {
    questionId: 'Q21',
    questionText: 'Show high-risk hazards by location.',
    category: 'Risk Assessment & Hazards',
    sapSourceTables: ['EHFND_RAS_ROOT', 'EHFND_RAS_HAZ', 'EHFND_RAS_CTRL', 'EHFND_LOC_ROOT'],
    summaryAnswer: 'The S/4HANA EHS Risk Assessment registry monitors 142 total identified hazards across all enterprise locations. Currently, 4 hazards are classified with an Initial Risk Rating of "High Risk" (Risk Priority Number > 15), all of which have primary engineering controls active: 1. Chemical Storage Tank Farm B4 (Corrosive release), 2. Solvent Distillation Unit S-10 (Flammable vapor), 3. Extrusion Line 4 (Thermal / Pinch), and 4. High-Voltage Substation 3A (Arc flash).',
    keyInsights: [
      'Location 1 (Tank Farm B4 - Plant 1010): Hazard HAZ-1010-01 (Bulk HCl/HNO3 release); Risk Score 18/25 (High); controlled by double-containment HDPE sumps & scrubber.',
      'Location 2 (Distillation Unit S-10 - Plant 1010): Hazard HAZ-1010-04 (Toluene vapor leak / ATEX Zone 1); Risk Score 16/25 (High); controlled by continuous LEL gas detectors.',
      'Location 3 (Extrusion Line 4 - Plant 1000): Hazard HAZ-1000-08 (Polymer extruder 240°C nip point); Risk Score 16/25 (High); controlled by physical interlocked mesh cage.',
      'Location 4 (Substation 3A - Plant 1000): Hazard HAZ-1000-14 (11kV Switchgear Arc Flash); Risk Score 15/25 (High); controlled by Arc-Resistant switchgear & Cal-40 suits.',
      'With active secondary controls in place, residual risk ratings for all 4 locations are reduced to "Acceptable / Medium Risk" (Score ≤ 6).'
    ],
    ehsMetrics: [
      { label: 'Total Monitored Hazards', value: '142 Hazards', status: 'positive' },
      { label: 'High Initial Risk Hazards', value: '4 Hazards', status: 'warning' },
      { label: 'Residual Risk Controlled', value: '100% (All ≤ 6)', status: 'positive' },
      { label: 'Unmitigated Hazards', value: '0 Hazards', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Chemical Tank Farm B4 (Plant 1010)', value: 'Score 18 (High)', variance: 'Residual: 4', detail: 'Bulk acid storage | Scrubber & double sump' },
      { category: 'Solvent Distillation S-10 (Plant 1010)', value: 'Score 16 (High)', variance: 'Residual: 5', detail: 'Toluene / Isopropanol | LEL detectors & nitrogen purge' },
      { category: 'Extrusion Line 4 (Plant 1000)', value: 'Score 16 (High)', variance: 'Residual: 4', detail: 'High temp nip points | Interlocked cage & e-stop' },
      { category: 'Substation 3A (Plant 1000)', value: 'Score 15 (High)', variance: 'Residual: 6', detail: '11kV Arc Flash | Arc-resistant enclosure & Cal-40 PPE' }
    ],
    recommendedSapActions: [
      { actionName: 'Open Location Risk Assessment Cockpit', tcode: 'F2849 / CBIH02', description: 'Review Risk Priority Numbers (RPN), hazard mitigation matrices, and control effectiveness ratings per plant location.' },
      { actionName: 'Audit Control Barrier Integrity', tcode: 'CBIH12', description: 'Schedule preventive maintenance safety barrier inspections in SAP PM for LEL gas detectors and acid scrubbers.' }
    ],
    incidentOrHazardDetails: [
      { id: 'HAZ-1010-01', name: 'Bulk Acid Tank Rupture & Toxic Fume Cloud', severity: 'Critical - Level 1', status: 'Controlled', metric: 'RPN: 18 -> 4', detail: 'Plant 1010 | Location: Tank Farm B4 | Controls: Sump + Scrubber' },
      { id: 'HAZ-1010-04', name: 'Flammable Solvent Vapor Deflagration', severity: 'Critical - Level 1', status: 'Controlled', metric: 'RPN: 16 -> 5', detail: 'Plant 1010 | Location: Distillation S-10 | Controls: N2 Blanketing + LEL' },
      { id: 'HAZ-1000-08', name: 'Extruder Feed Nip Point & Severe Burn', severity: 'Major - Level 2', status: 'Controlled', metric: 'RPN: 16 -> 4', detail: 'Plant 1000 | Location: Extrusion Hall | Controls: Category 4 Cage' },
      { id: 'HAZ-1000-14', name: '11kV Medium Voltage Arc Flash Hazard', severity: 'Critical - Level 1', status: 'Controlled', metric: 'RPN: 15 -> 6', detail: 'Plant 1000 | Location: Substation 3A | Controls: Arc Quench + PPE' }
    ]
  },
  {
    questionId: 'Q22',
    questionText: 'Which risk assessments are overdue?',
    category: 'Risk Assessment & Hazards',
    sapSourceTables: ['EHFND_RAS_ROOT', 'EHFND_RAS_REV', 'EHFND_LOC_ROOT'],
    summaryAnswer: 'In accordance with ISO 45001 annual re-assessment policies, 2 Risk Assessments in S/4HANA EHS are currently overdue for their 12-month cyclic review: RAS-2025-0814 (Automated Palletizer Cell 3 - 8 days overdue) and RAS-2025-0820 (Paint Booth Air Makeup Unit - 3 days overdue).',
    keyInsights: [
      'RAS-2025-0814 (Plant 1000): Automated Palletizer Cell 3 cyclic review was due Aug 18; delayed pending installation of new robotic gripper; review meeting set for tomorrow 10:00.',
      'RAS-2025-0820 (Plant 1010): Paint Spray Booth Air Makeup Unit review was due Aug 23; Industrial Hygiene ventilation test data completed; review ready for approval sign-off.',
      'Total risk assessment catalog contains 48 registered assessments across 4 plants (95.8% up-to-date).',
      'Zero high-risk chemical storage or high-voltage risk assessments are overdue.'
    ],
    ehsMetrics: [
      { label: 'Overdue Risk Assessments', value: '2 Assessments', status: 'warning' },
      { label: 'Catalog Review Health', value: '95.8% Up-to-Date', status: 'positive' },
      { label: 'Average Days Overdue', value: '5.5 Days', status: 'positive' },
      { label: 'Critical Facility Overdue', value: '0 Cases', status: 'positive' }
    ],
    breakdownData: [
      { category: 'RAS-2025-0814 (Palletizer Cell 3)', value: '8 Days Overdue', variance: 'Plant 1000', detail: 'Robotic cell review | Scheduled for tomorrow 10:00' },
      { category: 'RAS-2025-0820 (Paint Booth Air Makeup)', value: '3 Days Overdue', variance: 'Plant 1010', detail: 'Ventilation flow data collected | Awaiting sign-off' },
      { category: 'Active / Up-to-Date Assessments', value: '46 Assessments', variance: 'Current', detail: 'Fully compliant with ISO 45001 review cycle' }
    ],
    recommendedSapActions: [
      { actionName: 'Execute Risk Assessment Re-Evaluation', tcode: 'F2849', description: 'Open S/4HANA EHS Risk Assessment revision workflow, review hazard checklists, and approve new valid-to date.' },
      { actionName: 'Audit Risk Assessment Cycle Schedules', tcode: 'CBIH02', description: 'Configure automated 30-day and 15-day advance review alerts for plant safety committees.' }
    ],
    incidentOrHazardDetails: [
      { id: 'RAS-2025-0814', name: 'Automated Palletizer Cell 3 Hazard Review', severity: 'Moderate - Level 3', status: 'Review In Progress', metric: 'Overdue (+8d)', detail: 'Plant 1000 | Lead: J. Davis | Review meeting Aug 27 10:00' },
      { id: 'RAS-2025-0820', name: 'Paint Spray Booth 2 Air Makeup Unit', severity: 'Moderate - Level 3', status: 'Pending Sign-Off', metric: 'Overdue (+3d)', detail: 'Plant 1010 | Lead: M. Vance | Ventilation test passed' }
    ]
  },
  {
    questionId: 'Q23',
    questionText: 'Show tasks with unacceptable risk ratings.',
    category: 'Risk Assessment & Hazards',
    sapSourceTables: ['EHFND_RAS_ROOT', 'EHFND_RAS_HAZ', 'EHFND_RAS_CTRL'],
    summaryAnswer: 'In S/4HANA EHS, zero (0) routine operational tasks have unmitigated or "Unacceptable" residual risk ratings (Residual RPN > 12). However, 2 non-routine maintenance activities require mandatory Level 1 Safety Permit sign-off and safety standby before execution due to inherent high task risks: 1. Confined Space Entry into Reaction Vessel RX-201, and 2. Hot-Work Welding on Solvent Pipeline Header.',
    keyInsights: [
      'Task 1 (Confined Space Entry RX-201): Inherent risk score 20/25 (Asphyxiation / Toxic vapor); reduced to 4/25 with continuous forced-air ventilation, 4-gas monitor, and hole watch attendant.',
      'Task 2 (Hot-Work Welding Solvent Header): Inherent risk score 20/25 (Explosion / Fire); reduced to 5/25 with nitrogen purge verification, LEL <0%, and fire watch with 50lb dry chemical extinguisher.',
      'SAP EHS enforces automated permit-to-work interlocks: maintenance orders cannot be released in SAP PM without an approved active safety permit.',
      'Zero unauthorized non-routine tasks have been performed.'
    ],
    ehsMetrics: [
      { label: 'Unacceptable Residual Risks', value: '0 Tasks', status: 'positive' },
      { label: 'High-Risk Permitted Tasks', value: '2 Active Tasks', status: 'warning' },
      { label: 'Permit-to-Work Interlock', value: '100% Active', status: 'positive' },
      { label: 'Safety Standby Compliance', value: '100%', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Confined Space Vessel Entry', value: 'Inherent: 20 -> Res: 4', variance: 'Permit #PTW-401', detail: 'Forced ventilation, 4-gas analyzer, certified rescuer standby' },
      { category: 'Hot-Work Welding on Solvent Line', value: 'Inherent: 20 -> Res: 5', variance: 'Permit #PTW-402', detail: 'N2 purge, continuous LEL sniffer, dedicated fire watch' }
    ],
    recommendedSapActions: [
      { actionName: 'Verify Permit-to-Work Interlocks', tcode: 'F2849 / CBIH02', description: 'Review active electronic permits, atmospheric test logs, and rescue plan attachments in S/4HANA EHS.' },
      { actionName: 'Audit Maintenance Order Permit Status', tcode: 'IW32', description: 'Verify that Work Orders WO-89012 and WO-89015 require digital EHS permit authorization before technician sign-on.' }
    ],
    incidentOrHazardDetails: [
      { id: 'TASK-PTW-401', name: 'Confined Space Internal Inspection (RX-201)', severity: 'Critical - Level 1', status: 'Permit Active', metric: 'Res RPN: 4', detail: 'Plant 1010 | Permit valid today 08:00 - 17:00 | Standby: T. Bauer' },
      { id: 'TASK-PTW-402', name: 'Hot-Work Flange Welding (Line SLV-02)', severity: 'Critical - Level 1', status: 'Permit Active', metric: 'Res RPN: 5', detail: 'Plant 1010 | Permit valid today 13:00 - 16:00 | Fire Watch: E. Rossi' }
    ]
  },
  {
    questionId: 'Q24',
    questionText: 'Which hazards have no mitigation plan?',
    category: 'Risk Assessment & Hazards',
    sapSourceTables: ['EHFND_RAS_HAZ', 'EHFND_RAS_CTRL', 'EHFND_RAS_ROOT'],
    summaryAnswer: 'A comprehensive audit of all 142 registered hazard records in S/4HANA EHS confirms that zero (0) hazards are without an approved mitigation and control plan. 100% of hazards possess documented engineering barriers, administrative standard operating procedures (SOP), or personal protective equipment (PPE) assignments.',
    keyInsights: [
      'Control Coverage: 100% of 142 hazards have active primary and secondary control measures mapped in S/4HANA EHS.',
      'Control Hierarchy Distribution: 58% Engineering Controls (physical barriers, interlocks, ventilation), 28% Administrative Controls (SOPs, inspections, signage), 14% PPE Controls.',
      'Zero "Uncontrolled Hazard" exception alerts exist in corporate safety monitoring.',
      'Automated nightly S/4HANA batch consistency check verifies that newly logged hazards cannot transition to "Approved" without at least one verified control linkage.'
    ],
    ehsMetrics: [
      { label: 'Unmitigated Hazards', value: '0 Hazards (0%)', status: 'positive' },
      { label: 'Total Mitigated Hazards', value: '142 of 142', status: 'positive' },
      { label: 'Engineering Control Share', value: '58.5%', status: 'positive' },
      { label: 'Control Audit Health Score', value: '100.0%', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Engineering Controls (Barriers/Interlocks)', value: '83 Hazards (58.5%)', variance: 'Tier 1 Control', detail: 'Light curtains, LEL alarms, auto-scrubbers, interlocks' },
      { category: 'Administrative Controls (SOPs/Signage)', value: '40 Hazards (28.2%)', variance: 'Tier 2 Control', detail: 'Standard operating procedures, JSA, toolbox talks' },
      { category: 'Personal Protective Equipment (PPE)', value: '19 Hazards (13.3%)', variance: 'Tier 3 Control', detail: 'Respirators, chemical splash suits, arc-flash shields' }
    ],
    recommendedSapActions: [
      { actionName: 'Run Hazard Control Completeness Report', tcode: 'F2849 / CBIH12', description: 'Generate S/4HANA EHS control coverage compliance verification report across all plant structures.' },
      { actionName: 'Audit Control Maintenance Linkages', tcode: 'IP10 / IW38', description: 'Verify all 83 engineering controls have recurring preventive maintenance work plans in SAP PM.' }
    ],
    incidentOrHazardDetails: [
      { id: 'CTRL-STAT-01', name: 'Engineering Control Layer Completeness', severity: 'Minor - Level 4', status: 'Verified Compliant', metric: '83 Controls', detail: 'All 83 physical barriers mapped to PM maintenance plans' },
      { id: 'CTRL-STAT-02', name: 'Administrative Control Layer Completeness', severity: 'Minor - Level 4', status: 'Verified Compliant', metric: '40 SOPs', detail: 'All 40 SOPs current with verified employee sign-offs' },
      { id: 'CTRL-STAT-03', name: 'PPE Protocol Layer Completeness', severity: 'Minor - Level 4', status: 'Verified Compliant', metric: '19 Protocols', detail: 'All 19 PPE standards stocked with valid fit-test records' }
    ]
  },
  {
    questionId: 'Q25',
    questionText: 'Show exposure risks for this work area.',
    category: 'Risk Assessment & Hazards',
    sapSourceTables: ['EHFND_EXPOSURE', 'EHFND_AGENT', 'EHFND_LOC_ROOT', 'EHFND_RAS_EXP'],
    summaryAnswer: 'For the selected priority work area (Chemical Dosing Unit & Tank Farm B4 - Plant 1010), S/4HANA EHS Industrial Hygiene records track 3 primary occupational exposure agents: 1. Hydrochloric Acid Vapor (Current: 0.8 ppm vs OSHA PEL 5.0 ppm ceiling), 2. Noise from Dosing Metering Pumps (Current: 78.4 dBA vs Action Level 85.0 dBA), and 3. Ergonomic Drum Handling Strain (Current: REBA Score 4 - Low Risk).',
    keyInsights: [
      'Agent 1 (Hydrochloric Acid Vapor): Continuous electrochemical sensor telemetry averages 0.8 ppm (well below OSHA Permissible Exposure Limit ceiling of 5.0 ppm).',
      'Agent 2 (Acoustic Noise): Dosimetry badge surveys indicate 78.4 dBA 8-hour TWA; Hearing Protection Recommended but below mandatory 85.0 dBA threshold.',
      'Agent 3 (Ergonomic Posture): Pneumatic drum tippers installed in 2025 reduced Rapid Entire Body Assessment (REBA) score from 9 (High) to 4 (Low).',
      'Work area is categorized in S/4HANA Industrial Hygiene as "Controlled Exposure Zone".'
    ],
    ehsMetrics: [
      { label: 'Chemical Exposure Level', value: '0.8 ppm (16% PEL)', status: 'positive' },
      { label: 'Ambient Noise Level', value: '78.4 dBA (<85 dBA)', status: 'positive' },
      { label: 'Ergonomic REBA Score', value: '4 (Low Risk)', status: 'positive' },
      { label: 'Exposure Compliance Status', value: 'Fully Compliant', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Hydrochloric Acid Vapor (HCl)', value: '0.8 ppm (Limit 5.0)', variance: '-84% vs Ceiling', detail: 'Continuous scrubber draft keeps ambient levels safe' },
      { category: 'Acoustic Sound Pressure', value: '78.4 dBA (Limit 85.0)', variance: '-6.6 dBA vs AL', detail: 'Acoustic pump jackets dampening mechanical hum' },
      { category: 'Manual Drum Handling Ergonomics', value: 'REBA Score 4 (Low)', variance: 'Improved from 9', detail: 'Pneumatic lifters eliminate manual lifting' }
    ],
    recommendedSapActions: [
      { actionName: 'Display Industrial Hygiene Exposure Profile', tcode: 'F2765 / CBIH62', description: 'Open S/4HANA Industrial Hygiene cockpit to view real-time sensor streams and quarterly dosimetry records.' },
      { actionName: 'Schedule Routine Air Sampling Survey', tcode: 'CBIH62', description: 'Issue Industrial Hygiene sampling work order for semi-annual badge monitoring campaign.' }
    ],
    incidentOrHazardDetails: [
      { id: 'EXP-1010-HCL', name: 'Hydrochloric Acid Vapor Monitoring', severity: 'Major - Level 2', status: 'Compliant', metric: '0.8 ppm', detail: 'Sensor SN-8812 | OSHA PEL: 5.0 ppm | Plant 1010 Bay B4' },
      { id: 'EXP-1010-NOISE', name: 'Pump Skid Acoustic Noise Survey', severity: 'Minor - Level 4', status: 'Compliant', metric: '78.4 dBA', detail: 'Dosimeter Survey Q2-2026 | OSHA AL: 85.0 dBA' },
      { id: 'EXP-1010-ERGO', name: 'Chemical Drum Tilting & Decanting', severity: 'Moderate - Level 3', status: 'Controlled', metric: 'REBA: 4', detail: 'Pneumatic tipper PT-02 verified in operation' }
    ]
  }
];
