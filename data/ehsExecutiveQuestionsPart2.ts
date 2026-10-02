import { EhsExecutiveQuestionAnswer } from '../types';

export const EHS_EXECUTIVE_QUESTIONS_PART2: EhsExecutiveQuestionAnswer[] = [
  // ============================================================================
  // PILLAR 3: RISK ASSESSMENT & HAZARDS (CONTINUED: Q26 - Q30)
  // ============================================================================
  {
    questionId: 'Q26',
    questionText: 'Which controls are ineffective?',
    category: 'Risk Assessment & Hazards',
    sapSourceTables: ['EHFND_RAS_CTRL', 'EHFND_INC_CAU', 'EHFND_RAS_HAZ'],
    summaryAnswer: 'S/4HANA EHS control barrier efficacy evaluation identifies 2 controls currently flagged with "Degraded / Ineffective" status due to recent incident telemetry or inspection findings: CTRL-1010-09 (Standard EPDM Gaskets on Acid Dosing Lines) and CTRL-1020-04 (Stacker Crane SC-04 Single Optical Proximity Sensor). Both have active engineering upgrades in flight.',
    keyInsights: [
      'Control CTRL-1010-09: EPDM flange seals degraded by 37% hydrochloric acid exposure; failing to maintain positive pressure barrier; replacement with Viton/PTFE seals underway (WO-88419).',
      'Control CTRL-1020-04: Single optical proximity sensor prone to dust-induced drift; failing to ensure 100% false-safe distance trip; dual LiDAR + Ultrasonic upgrade scheduled.',
      'Control audit score across all 142 registered plant barriers is 98.6% effective.',
      'All other 140 controls passed their most recent preventive maintenance and functional test audits.'
    ],
    ehsMetrics: [
      { label: 'Ineffective / Degraded Controls', value: '2 Barriers', status: 'warning' },
      { label: 'Total Active Controls', value: '142 Controls', status: 'positive' },
      { label: 'Overall Barrier Health', value: '98.6%', status: 'positive' },
      { label: 'Active Engineering Replacements', value: '2 in Flight', status: 'positive' }
    ],
    breakdownData: [
      { category: 'CTRL-1010-09 (Acid Flange Seals)', value: 'Degraded (Material)', variance: 'Plant 1010', detail: 'Replaced with Viton/PTFE (WO-88419) - 60% complete' },
      { category: 'CTRL-1020-04 (Crane Optical Sensor)', value: 'Degraded (Optics)', variance: 'Plant 1020', detail: 'Upgraded to dual LiDAR/Ultrasonic sensor package' },
      { category: 'Active Certified Controls', value: '140 Barriers (98.6%)', variance: 'Pass', detail: 'Regular PM tested and verified in S/4HANA EHS' }
    ],
    recommendedSapActions: [
      { actionName: 'Update Control Effectiveness Status', tcode: 'F2849 / CBIH12', description: 'Modify control rating in S/4HANA EHS from "Ineffective" to "Effective" once physical engineering verification concludes.' },
      { actionName: 'Track Maintenance Work Orders in SAP PM', tcode: 'IW38', description: 'Monitor execution of Work Orders WO-88419 and WO-88422 for barrier hardware replacements.' }
    ],
    incidentOrHazardDetails: [
      { id: 'CTRL-1010-09', name: 'Acid Dosing Gasket Flange Barrier', severity: 'Major - Level 2', status: 'Under Retrofit', metric: '60% Done', detail: 'Plant 1010 | WO-88419 | Viton replacement due Aug 28' },
      { id: 'CTRL-1020-04', name: 'Stacker Crane Proximity Sensor Barrier', severity: 'Minor - Level 4', status: 'Under Calibration', metric: 'Test Today', detail: 'Plant 1020 | WO-88422 | Dual sensor upgrade due Aug 26' }
    ]
  },
  {
    questionId: 'Q27',
    questionText: 'Show hazards related to Equipment EQ-1001.',
    category: 'Risk Assessment & Hazards',
    sapSourceTables: ['EQUI', 'EHFND_RAS_HAZ', 'EHFND_RAS_CTRL', 'EHFND_INCIDENT'],
    summaryAnswer: 'For Equipment Master EQ-1001 (High-Pressure Hydraulic Stamping Press P-301 - Plant 1000), S/4HANA EHS registers 3 specific hazard entries: 1. Mechanical Ram Pinch / Crushing Hazard (Inherent: 20/25 -> Residual: 4/25), 2. High-Pressure Hydraulic Fluid Injection at 280 Bar (Inherent: 16/25 -> Residual: 4/25), and 3. High Noise Acoustic Emission at 89.2 dBA (Inherent: 12/25 -> Residual: 3/25).',
    keyInsights: [
      'Hazard 1 (Crushing/Pinch): Guarded by Category 4 optical safety light curtains, dual anti-tie-down palm buttons, and mechanical flywheel brake lock.',
      'Hazard 2 (Hydraulic Injection): Protected by heavy-gauge steel hose blast sleeves, quarterly thermographic hose scans, and relief valve RV-301 (290 bar).',
      'Hazard 3 (Acoustic Noise): Sound-dampened acoustic enclosure reduces ambient noise to 79.5 dBA at operator console; Class 5 earplugs mandatory inside perimeter.',
      'Equipment EQ-1001 has zero open incidents, zero safety defect notifications, and has operated safely for 412 consecutive production days.'
    ],
    ehsMetrics: [
      { label: 'Registered Hazards for EQ-1001', value: '3 Hazards', status: 'positive' },
      { label: 'Max Inherent Risk', value: '20 (Critical)', status: 'warning' },
      { label: 'Controlled Residual Risk', value: '4 (Low/Safe)', status: 'positive' },
      { label: 'Days Without Incident', value: '412 Days', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Mechanical Crushing / Pinch', value: 'Inherent 20 -> Res 4', variance: 'Cat 4 Curtain', detail: 'Light curtain response time 18ms; brake stops ram in 45ms' },
      { category: '280-Bar Hydraulic Fluid Injection', value: 'Inherent 16 -> Res 4', variance: 'Blast Sleeves', detail: 'Hose burst containment sleeves & automated shutoff' },
      { category: 'Acoustic Sound Pressure', value: 'Inherent 12 -> Res 3', variance: 'Enclosure', detail: 'Acoustic curtains reduce sound from 89.2 to 79.5 dBA' }
    ],
    recommendedSapActions: [
      { actionName: 'Display Equipment EHS Dossier', tcode: 'IE03 / F2849', description: 'View equipment master EHS tab containing risk assessments, safety manuals, and linked PM safety maintenance plans.' },
      { actionName: 'Schedule Light Curtain Calibration Check', tcode: 'IP10 / IW31', description: 'Confirm quarterly optical barrier response time verification work order scheduled in SAP PM.' }
    ],
    incidentOrHazardDetails: [
      { id: 'EQ-1001-HAZ1', name: 'Press Ram Crushing & Amputation Hazard', severity: 'Critical - Level 1', status: 'Controlled', metric: 'Res RPN: 4', detail: 'Plant 1000 | Light Curtain LC-301 & Dual Palm Buttons' },
      { id: 'EQ-1001-HAZ2', name: '280-Bar Hydraulic Line Burst & Fluid Jet', severity: 'Major - Level 2', status: 'Controlled', metric: 'Res RPN: 4', detail: 'Plant 1000 | Kevlar Sleeving & Auto-Trip Valve V-301' },
      { id: 'EQ-1001-HAZ3', name: 'Stamping Impact Acoustic Noise Exposure', severity: 'Moderate - Level 3', status: 'Controlled', metric: 'Res RPN: 3', detail: 'Plant 1000 | Acoustic Enclosure + Class 5 Hearing PPE' }
    ]
  },
  {
    questionId: 'Q28',
    questionText: 'Which jobs require additional PPE?',
    category: 'Risk Assessment & Hazards',
    sapSourceTables: ['EHFND_RAS_CTRL', 'EHFND_RAS_HAZ', 'EHFND_PROT_EQ', 'EHFND_AGENT'],
    summaryAnswer: 'Job Hazard Analysis (JHA) profiles in S/4HANA EHS designate 4 specific job positions requiring specialized Level 2/Level 3 Supplemental Personal Protective Equipment beyond standard factory steel-toe boots and safety glasses: 1. Chemical Transfer Operators, 2. High-Voltage Substation Electricians, 3. Paint Spray Booth Technicians, and 4. CNC Plasma Cutting Operators.',
    keyInsights: [
      'Job 1 (Chemical Transfer Operator - Plant 1010): Requires Level B Chemical Splash Suit, Butyl Rubber Gloves (EN 374), and Full-Face Air-Purifying Respirator with ABEK1-P3 cartridges.',
      'Job 2 (Substation High-Voltage Electrician - All Plants): Requires 40 cal/cm² Arc Flash Suit, Balaclava, Class 2 (17kV) Insulating Rubber Gloves with leather protectors.',
      'Job 3 (Paint Spray Booth Technician - Plant 1010): Requires Full Tyvek Protective Coveralls, Nitrile Gloves, and Supplied Air Respirator (SAR) with constant-flow hood.',
      'Job 4 (CNC Plasma Cutting Operator - Plant 1000): Requires Shade #8 Auto-Darkening Welding Helmet, Split-Cowhide Welding Sleeves, and Kevlar Cut-Level 5 Gauntlets.',
      '100% of employees in these 4 roles have verified fit-test and PPE inspection records in S/4HANA EHS.'
    ],
    ehsMetrics: [
      { label: 'Specialized PPE Job Roles', value: '4 Roles (38 Staff)', status: 'positive' },
      { label: 'Fit-Test Compliance', value: '100% (38/38)', status: 'positive' },
      { label: 'PPE Inventory Stock Level', value: '98.5% Available', status: 'positive' },
      { label: 'Quarterly Audit Pass Rate', value: '100%', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Chemical Transfer Operators (12 Staff)', value: 'Level B Chemical Suite', variance: 'Plant 1010', detail: 'Viton suit, Butyl gloves, ABEK1-P3 full-face mask' },
      { category: 'High-Voltage Electricians (6 Staff)', value: '40 Cal/cm² Arc Flash', variance: 'All Sites', detail: 'Arc hood, Class 2 (17kV) dielectric gloves' },
      { category: 'Paint Spray Technicians (8 Staff)', value: 'Supplied Air System', variance: 'Plant 1010', detail: 'Constant-flow air hood, anti-static coveralls' },
      { category: 'CNC Plasma Cutters (12 Staff)', value: 'Shade 8 + Kevlar Cut-5', variance: 'Plant 1000', detail: 'Auto-darkening helmet, leather heat sleeves' }
    ],
    recommendedSapActions: [
      { actionName: 'Display PPE Requirements Matrix', tcode: 'F2849 / CBIH12', description: 'Review PPE job-role assignment matrices and mandatory equipment specifications in S/4HANA EHS.' },
      { actionName: 'Audit PPE Inventory in SAP MM', tcode: 'MMBE / ME21N', description: 'Verify adequate safety stock of replacement respirator cartridges, nitrile gloves, and arc-flash face shields.' }
    ],
    incidentOrHazardDetails: [
      { id: 'PPE-ROLE-01', name: 'Chemical Transfer & Acid Handling Role', severity: 'Major - Level 2', status: 'Certified Active', metric: '12 Operators', detail: 'Full-Face ABEK1-P3 | Butyl Gloves | Annual Fit Test: 100%' },
      { id: 'PPE-ROLE-02', name: 'High-Voltage 11kV Substation Maintenance', severity: 'Critical - Level 1', status: 'Certified Active', metric: '6 Electricians', detail: '40 Cal Arc Suit | Class 2 Gloves | Bi-annual Dielectric Test' },
      { id: 'PPE-ROLE-03', name: 'Automotive Paint Spray Booth Application', severity: 'Major - Level 2', status: 'Certified Active', metric: '8 Technicians', detail: 'Supplied Air Hood | Tyvek 500 | Fit Test: 100%' },
      { id: 'PPE-ROLE-04', name: 'CNC Plasma & Laser Thermal Cutting Role', severity: 'Moderate - Level 3', status: 'Certified Active', metric: '12 Operators', detail: 'Shade #8 Shield | Cut-Level 5 Gloves | Eye exam current' }
    ]
  },
  {
    questionId: 'Q29',
    questionText: 'Show risk assessments expiring this month.',
    category: 'Risk Assessment & Hazards',
    sapSourceTables: ['EHFND_RAS_ROOT', 'EHFND_RAS_REV', 'EHFND_LOC_ROOT'],
    summaryAnswer: 'In S/4HANA EHS, 3 Risk Assessments are scheduled to reach their mandatory 12-month ISO 45001 valid-to expiry date by the end of August 2026: RAS-2025-0828 (Solvent Distillation Column S-10 - Expiring in 2 days), RAS-2025-0830 (High-Voltage Substation 3A - Expiring in 4 days), and RAS-2025-0831 (Plant 1020 Battery Charging Bay - Expiring in 5 days).',
    keyInsights: [
      'RAS-2025-0828 (Plant 1010): Solvent Distillation S-10 review meeting scheduled for tomorrow 14:00; all LEL telemetry data collated.',
      'RAS-2025-0830 (Plant 1000): Substation 3A Arc Flash model review underway by Lead Electrical Engineer; single-line diagram verified.',
      'RAS-2025-0831 (Plant 1020): Forklift Lead-Acid Battery Charging Bay hydrogen ventilation review completed; ready for final EHS Director sign-off.',
      'Re-assessment workflows have been initiated in advance to guarantee zero non-compliance gaps.'
    ],
    ehsMetrics: [
      { label: 'Expiring Assessments This Month', value: '3 Assessments', status: 'warning' },
      { label: 'Re-Assessment In Flight', value: '3 of 3 (100%)', status: 'positive' },
      { label: 'Forecast On-Time Renewal', value: '100%', status: 'positive' },
      { label: 'Days to Next Expiry', value: '2 Days (Aug 28)', status: 'neutral' }
    ],
    breakdownData: [
      { category: 'RAS-2025-0828 (Solvent Distillation)', value: 'Expires Aug 28 (2d)', variance: 'Plant 1010', detail: 'Review session tomorrow 14:00 | Lead: Dr. M. Vance' },
      { category: 'RAS-2025-0830 (HV Substation 3A)', value: 'Expires Aug 30 (4d)', variance: 'Plant 1000', detail: 'Arc flash calcs verified | Lead: E. Rossi' },
      { category: 'RAS-2025-0831 (Battery Charging Bay)', value: 'Expires Aug 31 (5d)', variance: 'Plant 1020', detail: 'Hydrogen sniffer tested | Lead: K. Lindqvist' }
    ],
    recommendedSapActions: [
      { actionName: 'Process Risk Assessment Re-Authorization', tcode: 'F2849', description: 'Open S/4HANA EHS Risk Assessment renewal workflow, update checklist responses, and electronically sign off for the 2026/2027 cycle.' },
      { actionName: 'Review Annual EHS Audit Calendar', tcode: 'CBIH02', description: 'Audit upcoming Q3/Q4 risk assessment expiration horizons across all global business units.' }
    ],
    incidentOrHazardDetails: [
      { id: 'RAS-2025-0828', name: 'Solvent Distillation S-10 Annual Review', severity: 'Critical - Level 1', status: 'Review Scheduled', metric: 'Expires Aug 28', detail: 'Plant 1010 | Lead: M. Vance | Tomorrow 14:00' },
      { id: 'RAS-2025-0830', name: 'Substation 3A Electrical Hazard Review', severity: 'Critical - Level 1', status: 'In Review', metric: 'Expires Aug 30', detail: 'Plant 1000 | Lead: E. Rossi | Single-line approved' },
      { id: 'RAS-2025-0831', name: 'Battery Charging Hydrogen Safety Review', severity: 'Moderate - Level 3', status: 'Pending Sign-off', metric: 'Expires Aug 31', detail: 'Plant 1020 | Lead: K. Lindqvist | Ready for sign-off' }
    ]
  },
  {
    questionId: 'Q30',
    questionText: 'What risks should the EHS team address first?',
    category: 'Risk Assessment & Hazards',
    sapSourceTables: ['EHFND_RAS_ROOT', 'EHFND_RAS_HAZ', 'EHFND_INCIDENT', 'EHFND_RAS_CTRL'],
    summaryAnswer: 'Applying the S/4HANA EHS Dynamic Risk Matrix (combining Inherent Hazard Severity, Incident Precursor Frequency, and Control Degradation Index), the EHS AI Agent recommends the TOP 3 prioritized risk interventions for the leadership team: 1. Complete Viton Gasket Standardization on Chemical Dosing Skid B4 (Plant 1010), 2. Execute Dual-LiDAR Sensor Upgrade on Stacker Crane SC-04 (Plant 1020), and 3. Renew Solvent Distillation S-10 Risk Assessment ahead of Aug 28 expiry.',
    keyInsights: [
      'Priority 1 (Chemical Flange Integrity): Eliminates the highest-consequence environmental and worker exposure hazard in Plant 1010.',
      'Priority 2 (Warehouse Robotics Proximity): Resolves the recurring near-miss precursor before high-volume holiday shipping peak.',
      'Priority 3 (Distillation Risk Assessment Renewal): Maintains 100% regulatory compliance with ISO 45001 and OSHA Process Safety Management (PSM).',
      'All 3 priority items have assigned action owners, allocated budgets, and clear milestone dates.'
    ],
    ehsMetrics: [
      { label: 'Executive Priority Risks', value: '3 Priorities', status: 'warning' },
      { label: 'Dynamic Risk Index', value: '78.4 / 100', status: 'neutral' },
      { label: 'Target Mitigation by End of Month', value: '100%', status: 'positive' },
      { label: 'Capital/Expense Approved', value: '$14,200', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Priority 1: Chemical Dosing Flange Retrofit', value: 'High Risk (Score 18)', variance: 'Plant 1010', detail: 'Viton gasket upgrade on pump skid P-104 (WO-88419)' },
      { category: 'Priority 2: Stacker Crane SC-04 Dual Sensor', value: 'Med Risk (Score 12)', variance: 'Plant 1020', detail: 'Laser + Ultrasonic collision avoidance retrofit' },
      { category: 'Priority 3: PSM Distillation S-10 Renewal', value: 'Compliance Risk', variance: 'Plant 1010', detail: 'Annual re-assessment sign-off due in 2 days' }
    ],
    recommendedSapActions: [
      { actionName: 'Launch Executive Risk Triage Board', tcode: 'F2849 / CBIH02', description: 'Review dynamic enterprise risk heat map and track real-time closure progress across all 3 priority items.' },
      { actionName: 'Confirm Resource Allocation in SAP PS', tcode: 'CJ20N', description: 'Verify budget release and labor booking for EHS Capital Improvement WBS-EHS-2026-Q3.' }
    ],
    incidentOrHazardDetails: [
      { id: 'PRI-RISK-01', name: 'Chemical Dosing Flange Viton Upgrade', severity: 'Major - Level 2', status: 'In Progress', metric: 'Priority 1', detail: 'Plant 1010 | Lead: M. Vance | Target: Aug 28' },
      { id: 'PRI-RISK-02', name: 'Stacker Crane SC-04 Sensor Package', severity: 'Minor - Level 4', status: 'Scheduled', metric: 'Priority 2', detail: 'Plant 1020 | Lead: K. Lindqvist | Target: Aug 26' },
      { id: 'PRI-RISK-03', name: 'Solvent Distillation S-10 PSM Renewal', severity: 'Critical - Level 1', status: 'In Review', metric: 'Priority 3', detail: 'Plant 1010 | Lead: M. Vance | Target: Aug 28' }
    ]
  },

  // ============================================================================
  // PILLAR 4: OCCUPATIONAL HEALTH & EXPOSURE (Q31 - Q40)
  // ============================================================================
  {
    questionId: 'Q31',
    questionText: 'Show exposure-monitoring results by work area.',
    category: 'Occupational Health & Exposure',
    sapSourceTables: ['EHFND_EXPOSURE', 'EHFND_AGENT', 'EHFND_SAMP', 'EHFND_LOC_ROOT'],
    summaryAnswer: 'S/4HANA Occupational Health & Industrial Hygiene maintains continuous and periodic exposure monitoring data across 12 designated factory exposure zones. 100% of tested areas currently operate well below national Permissible Exposure Limits (PEL) and ACGIH Threshold Limit Values (TLV).',
    keyInsights: [
      'Zone 1 (Chemical Tank Farm B4): Hydrochloric Acid Vapor = 0.8 ppm (OSHA PEL: 5.0 ppm ceiling; 16.0% utilization).',
      'Zone 2 (Automotive Paint Spray Booth 2): VOC Total Hydrocarbons = 18.2 mg/m³ (Limit: 50.0 mg/m³; 36.4% utilization).',
      'Zone 3 (Machining CNC Cell 4): Oil Mist Particulate = 1.1 mg/m³ (OSHA PEL: 5.0 mg/m³; 22.0% utilization).',
      'Zone 4 (Extruder Hall Line 4): Acoustic Sound Pressure = 81.2 dBA (OSHA Action Level: 85.0 dBA; Compliant).',
      'Zone 5 (High-Bay Warehouse Bay 3): Respirable Dust PM10 = 0.4 mg/m³ (Limit: 5.0 mg/m³; 8.0% utilization).'
    ],
    ehsMetrics: [
      { label: 'Monitored Exposure Zones', value: '12 Zones', status: 'positive' },
      { label: 'PEL / TLV Compliance', value: '100% Compliant', status: 'positive' },
      { label: 'Max Agent Utilization', value: '36.4% (VOC Paint)', status: 'positive' },
      { label: 'Active Telemetry Sensors', value: '28 Connected', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Chemical Tank Farm B4 (HCl Vapor)', value: '0.8 ppm (PEL 5.0)', variance: '-84.0% vs PEL', detail: 'Electrochemical sensor SN-8812' },
      { category: 'Paint Spray Booth 2 (VOC Hydrocarbons)', value: '18.2 mg/m³ (Limit 50.0)', variance: '-63.6% vs Limit', detail: 'Photoionization detector PID-04' },
      { category: 'CNC Machining Cell 4 (Oil Mist)', value: '1.1 mg/m³ (PEL 5.0)', variance: '-78.0% vs PEL', detail: 'Laser photometer aerosol monitor' },
      { category: 'Extrusion Hall Line 4 (Noise)', value: '81.2 dBA (Action 85.0)', variance: '-3.8 dBA vs AL', detail: 'Type 1 sound level meter' },
      { category: 'Warehouse Bay 3 (Respirable Dust)', value: '0.4 mg/m³ (PEL 5.0)', variance: '-92.0% vs PEL', detail: 'Gravimetric air sampling pump' }
    ],
    recommendedSapActions: [
      { actionName: 'Open Industrial Hygiene Sampling Cockpit', tcode: 'F2765 / CBIH62', description: 'Review raw sampling logs, calibration certificates, and statistical exposure distributions in S/4HANA EHS.' },
      { actionName: 'Export ACGIH Compliance Certificate', tcode: 'CBIH62', description: 'Generate certified quarterly occupational exposure compliance report for corporate safety records.' }
    ],
    incidentOrHazardDetails: [
      { id: 'SAMP-ZONE-01', name: 'Tank Farm B4 Acid Vapor Monitoring', severity: 'Major - Level 2', status: 'Compliant', metric: '0.8 ppm', detail: 'Plant 1010 | Continuous Telemetry | Last Calibrated: Aug 12' },
      { id: 'SAMP-ZONE-02', name: 'Paint Spray Booth 2 VOC Concentration', severity: 'Major - Level 2', status: 'Compliant', metric: '18.2 mg/m³', detail: 'Plant 1010 | PID-04 Continuous | Last Calibrated: Aug 15' },
      { id: 'SAMP-ZONE-03', name: 'CNC Cell 4 Mineral Oil Mist Survey', severity: 'Moderate - Level 3', status: 'Compliant', metric: '1.1 mg/m³', detail: 'Plant 1000 | Quarterly Badge Run | Next Sample: Nov 2026' },
      { id: 'SAMP-ZONE-04', name: 'Extruder Line 4 Acoustic Noise Survey', severity: 'Moderate - Level 3', status: 'Compliant', metric: '81.2 dBA', detail: 'Plant 1000 | Dosimeter Survey | Next Sample: Oct 2026' }
    ]
  },
  {
    questionId: 'Q32',
    questionText: 'Which employees or job roles require health surveillance?',
    category: 'Occupational Health & Exposure',
    sapSourceTables: ['EHFND_SURVEILLANCE', 'EHFND_HEALTH_SCH', 'PA0001', 'PA0002'],
    summaryAnswer: 'In accordance with S/4HANA Occupational Health protocols and OSHA/EN standards, 4 job roles encompassing 42 active employees are enrolled in mandatory medical surveillance health protocols: 1. Chemical Transfer Operators (Protocol G24 - Skin/Vapor), 2. Stamping Press & Boilermaker Operators (Protocol G20 - Audiometry), 3. Paint Sprayers & Sandblasters (Protocol G26 - Spirometry/Lung Function), and 4. Night-Shift Forklift Drivers (Protocol G25 - Vision & Ergonomics).',
    keyInsights: [
      'Protocol G24 (Chemical Exposure - 12 Employees): Annual liver/kidney blood chemistry & dermal exam; 100% up-to-date.',
      'Protocol G20 (Noise Exposure - 16 Employees): Annual baseline pure-tone audiometric hearing test; 15 completed, 1 scheduled for this Friday.',
      'Protocol G26 (Respiratory/Sensitizers - 8 Employees): Bi-annual forced vital capacity (FVC/FEV1) lung function test; 100% compliant.',
      'Protocol G25 (Industrial Mobile Equipment - 6 Employees): Annual visual acuity, color perception, and peripheral vision exam; 100% compliant.',
      'Overall health surveillance protocol compliance is 97.6% (41 of 42 employees current).'
    ],
    ehsMetrics: [
      { label: 'Enrolled Employees', value: '42 Staff', status: 'positive' },
      { label: 'Surveillance Protocols', value: '4 Protocols', status: 'positive' },
      { label: 'Protocol Compliance Rate', value: '97.6%', status: 'positive' },
      { label: 'Overdue Examinations', value: '0 Overdue', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Protocol G20: Noise Audiometry', value: '16 Staff (Plant 1000/1010)', variance: '93.8% Current', detail: '15 Done, 1 scheduled this Friday (P. Mueller)' },
      { category: 'Protocol G24: Chemical Dermal/Vapor', value: '12 Staff (Plant 1010)', variance: '100% Current', detail: 'All 12 completed; next cycle July 2027' },
      { category: 'Protocol G26: Respiratory Spirometry', value: '8 Staff (Plant 1010)', variance: '100% Current', detail: 'All 8 completed; next cycle Jan 2027' },
      { category: 'Protocol G25: Mobile Equipment Vision', value: '6 Staff (Plant 1020)', variance: '100% Current', detail: 'All 6 completed; next cycle May 2027' }
    ],
    recommendedSapActions: [
      { actionName: 'Open Health Surveillance Cockpit', tcode: 'CBIO02 / F2765', description: 'Review employee medical surveillance rosters, protocol assignments, and medical examination scheduling in SAP EHS.' },
      { actionName: 'Sync Surveillance Schedules with SAP HCM', tcode: 'PA30', description: 'Synchronize employee job transfers and role changes automatically into medical surveillance tracking.' }
    ],
    incidentOrHazardDetails: [
      { id: 'PROT-G20', name: 'Noise Exposure Audiometric Testing (G20)', severity: 'Moderate - Level 3', status: '15/16 Done', metric: '93.8%', detail: 'Press & Boiler Operators | Last exam: Aug 2026 | Next: Aug 28' },
      { id: 'PROT-G24', name: 'Chemical Agent Medical Protocol (G24)', severity: 'Major - Level 2', status: '12/12 Done', metric: '100%', detail: 'Chemical Dosing Operators | Blood chemistry verified clear' },
      { id: 'PROT-G26', name: 'Respiratory Spirometry Protocol (G26)', severity: 'Major - Level 2', status: '8/8 Done', metric: '100%', detail: 'Paint Sprayers | FEV1/FVC ratios normal across all staff' },
      { id: 'PROT-G25', name: 'Mobile Equipment Vision Protocol (G25)', severity: 'Moderate - Level 3', status: '6/6 Done', metric: '100%', detail: 'Forklift & Stacker Operators | Snellen 20/20 corrected' }
    ]
  },
  {
    questionId: 'Q33',
    questionText: 'Show noise-exposure risks.',
    category: 'Occupational Health & Exposure',
    sapSourceTables: ['EHFND_EXPOSURE', 'EHFND_AGENT', 'EHFND_LOC_ROOT', 'EHFND_PROT_EQ'],
    summaryAnswer: 'Acoustic sound surveys mapped across all plant areas identify 2 specific work centers where 8-hour Time-Weighted Average (TWA) noise levels exceed the OSHA Action Level of 85.0 dBA: 1. Stamping Press Hall Cell 1 (Plant 1000: 89.2 dBA unattenuated / 79.5 dBA at operator booth), and 2. Chiller & Air Compressor Room C-2 (Plant 1030: 87.6 dBA).',
    keyInsights: [
      'Stamping Press Hall Cell 1: Peak impact noise reaches 104.2 dBC during heavy die stroke; engineered acoustic operator booth attenuates exposure to 79.5 dBA TWA; Class 5 ear defenders mandatory when exiting booth.',
      'Compressor Room C-2: Continuous mechanical compressor noise of 87.6 dBA; restricted entry zone with automated card-key access requiring hearing protection sign-off.',
      'All 16 operators in these designated Hearing Conservation Zones wear calibrated noise dosimeters with zero Standard Threshold Shifts (STS) detected.',
      'Annual acoustic barrier maintenance scheduled under PM Work Order WO-44910.'
    ],
    ehsMetrics: [
      { label: 'Designated Noise Zones', value: '2 Zones', status: 'warning' },
      { label: 'Max Ambient Sound', value: '89.2 dBA (Press)', status: 'warning' },
      { label: 'Attenuated Operator Level', value: '79.5 dBA (Safe)', status: 'positive' },
      { label: 'Hearing Threshold Shifts', value: '0 STS (100% Safe)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Stamping Press Cell 1 (Plant 1000)', value: '89.2 dBA (Booth: 79.5)', variance: '+4.2 dBA over AL', detail: 'Operator booth reduces exposure by 9.7 dBA' },
      { category: 'Compressor Room C-2 (Plant 1030)', value: '87.6 dBA (Restricted)', variance: '+2.6 dBA over AL', detail: 'Restricted area; avg operator presence <30 min/day' },
      { category: 'Assembly Conveyor Hall (Plant 1000)', value: '74.2 dBA (Compliant)', variance: '-10.8 dBA vs AL', detail: 'Low-noise modular belt conveyors' },
      { category: 'High-Bay Warehouse (Plant 1020)', value: '68.5 dBA (Compliant)', variance: '-16.5 dBA vs AL', detail: 'Electric AGV fleet operation' }
    ],
    recommendedSapActions: [
      { actionName: 'Display Noise Map & Dosimetry Profile', tcode: 'F2765 / CBIH62', description: 'View color-coded acoustic contour maps and personal noise dosimeter time-series records in S/4HANA EHS.' },
      { actionName: 'Audit Hearing Protection Compliance', tcode: 'CBIH12', description: 'Execute supervisor safety inspection checklist in Stamping Press Cell 1 and Compressor Room C-2.' }
    ],
    incidentOrHazardDetails: [
      { id: 'NOISE-ZONE-01', name: 'Stamping Press Hall Cell 1 Acoustic Zone', severity: 'Major - Level 2', status: 'Controlled', metric: '89.2 dBA', detail: 'Plant 1000 | Booth attenuated to 79.5 dBA | Class 5 Earplugs' },
      { id: 'NOISE-ZONE-02', name: 'Chiller & Compressor Room C-2 Zone', severity: 'Moderate - Level 3', status: 'Restricted Access', metric: '87.6 dBA', detail: 'Plant 1030 | Card-key interlock | Mandatory Earmuffs' }
    ]
  },
  {
    questionId: 'Q34',
    questionText: 'Which areas exceed configured exposure thresholds?',
    category: 'Occupational Health & Exposure',
    sapSourceTables: ['EHFND_EXPOSURE', 'EHFND_AGENT', 'EHFND_LOC_ROOT'],
    summaryAnswer: 'Real-time telemetry and 24-hour time-weighted average calculations in S/4HANA EHS confirm that ZERO (0) plant work areas currently exceed statutory Permissible Exposure Limits (PEL). Only 1 area exceeds internal "Early Warning Action Threshold" (set at 50% of PEL): Paint Spray Booth 2 Solvent Exhaust Duct (Operating at 54.2% of Action Limit during primer coating cycle).',
    keyInsights: [
      'Paint Spray Booth 2 (Plant 1010): VOC total volatile organic concentration reached 27.1 mg/m³ (Internal Action Threshold: 25.0 mg/m³; Regulatory PEL: 50.0 mg/m³).',
      'Cause: Higher surface area coating batch run on automotive bumper panels.',
      'Mitigation: Automated auxiliary exhaust booster fan AF-02 engaged, bringing VOC concentration back down to 18.2 mg/m³ within 14 minutes.',
      'All other 11 factory zones are operating below 40% of statutory exposure limits.'
    ],
    ehsMetrics: [
      { label: 'Exceeded Regulatory PEL Areas', value: '0 Areas (0%)', status: 'positive' },
      { label: 'Exceeded Internal Action Limits', value: '1 Area (Contained)', status: 'warning' },
      { label: 'Booster Fan Response Time', value: '14 Minutes', status: 'positive' },
      { label: 'Current Ambient Status', value: '100% Compliant', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Paint Spray Booth 2 (VOC Exhaust)', value: '27.1 mg/m³ (Peak)', variance: 'Recovered: 18.2', detail: 'Booster fan AF-02 successfully cleared transient spike' },
      { category: 'Chemical Tank Farm B4 (Acid Mist)', value: '0.8 ppm (Limit 5.0)', variance: 'Compliant (16%)', detail: 'Stable scrubber operation' },
      { category: 'Machining CNC Cell 4 (Oil Aerosol)', value: '1.1 mg/m³ (Limit 5.0)', variance: 'Compliant (22%)', detail: 'Electrostatic mist collector healthy' }
    ],
    recommendedSapActions: [
      { actionName: 'Review Real-Time Exposure Alarm Logs', tcode: 'F2765', description: 'Inspect timestamped sensor traces, alarm trigger thresholds, and automated ventilation fan responses in S/4HANA EHS.' },
      { actionName: 'Calibrate VOC Photoionization Detector', tcode: 'IP10 / IW32', description: 'Confirm semi-annual zero/span calibration work order for PID-04 in Paint Booth 2.' }
    ],
    incidentOrHazardDetails: [
      { id: 'ALARM-EXP-01', name: 'Paint Booth 2 Transient VOC Exceedance', severity: 'Moderate - Level 3', status: 'Resolved & Cleared', metric: '27.1 mg/m³', detail: 'Plant 1010 | Duration: 14 mins | Auto-booster fan cleared spike' }
    ]
  },
  {
    questionId: 'Q35',
    questionText: 'Show chemical-exposure trends.',
    category: 'Occupational Health & Exposure',
    sapSourceTables: ['EHFND_EXPOSURE', 'EHFND_AGENT', 'EHFND_SAMP'],
    summaryAnswer: 'A 12-month longitudinal trend analysis of chemical exposure sampling records in S/4HANA EHS indicates a continuous downward trajectory across all 3 key tracked chemical agents: Hydrochloric Acid vapor (-42% YoY), Toluene/Xylene solvent vapors (-35% YoY), and Mineral Oil metalworking mist (-28% YoY).',
    keyInsights: [
      'Hydrochloric Acid Vapor (Plant 1010): Reduced from 1.4 ppm in Q3 2025 to 0.8 ppm in Q3 2026 following installation of variable-frequency scrubber exhaust blowers.',
      'Solvent VOCs (Plant 1010 Paint/Distillation): Reduced from 28.0 mg/m³ in 2025 to 18.2 mg/m³ in 2026 following transition to high-solids low-VOC waterborne primers.',
      'Oil Mist (Plant 1000 CNC Machining): Reduced from 1.5 mg/m³ to 1.1 mg/m³ following retrofit of high-efficiency HEPA secondary filters on all 8 CNC machine tool enclosures.',
      'Long-term trend demonstrates successful execution of the corporate "Zero Industrial Illness" roadmap.'
    ],
    ehsMetrics: [
      { label: 'Overall Exposure Reduction', value: '-35.0% YoY', status: 'positive' },
      { label: 'Acid Vapor 12m Trend', value: '-42.8%', status: 'positive' },
      { label: 'Solvent VOC 12m Trend', value: '-35.0%', status: 'positive' },
      { label: 'Oil Mist 12m Trend', value: '-26.7%', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Hydrochloric Acid Vapor (Plant 1010)', value: '1.4 ppm -> 0.8 ppm', variance: '-42.8% YoY', detail: 'Scrubber VFD automated draft control' },
      { category: 'Solvent Hydrocarbons (Plant 1010)', value: '28.0 -> 18.2 mg/m³', variance: '-35.0% YoY', detail: 'Waterborne primer reformulation' },
      { category: 'Machining Oil Aerosols (Plant 1000)', value: '1.5 -> 1.1 mg/m³', variance: '-26.7% YoY', detail: 'HEPA secondary mist filtration' }
    ],
    recommendedSapActions: [
      { actionName: 'Generate 12-Month Chemical Trend Chart', tcode: 'F2765 / CBIH62', description: 'Export multi-year statistical regression curves and industrial hygiene trend charts in S/4HANA EHS.' },
      { actionName: 'Publish Annual Industrial Hygiene Report', tcode: 'CBIH62', description: 'Compile annual corporate chemical stewardship dossier for ISO 45001 surveillance audit.' }
    ],
    incidentOrHazardDetails: [
      { id: 'TREND-CHEM-01', name: 'Hydrochloric Acid 12-Month Exposure Curve', severity: 'Major - Level 2', status: 'Improving', metric: '-42.8% YoY', detail: 'Plant 1010 | Average: 0.8 ppm (Well below 5.0 PEL)' },
      { id: 'TREND-CHEM-02', name: 'Solvent VOC 12-Month Exposure Curve', severity: 'Major - Level 2', status: 'Improving', metric: '-35.0% YoY', detail: 'Plant 1010 | Average: 18.2 mg/m³ (Well below 50.0 Limit)' },
      { id: 'TREND-CHEM-03', name: 'Metalworking Mist 12-Month Exposure Curve', severity: 'Moderate - Level 3', status: 'Improving', metric: '-26.7% YoY', detail: 'Plant 1000 | Average: 1.1 mg/m³ (Well below 5.0 PEL)' }
    ]
  },
  {
    questionId: 'Q36',
    questionText: 'Which occupational-health examinations are overdue?',
    category: 'Occupational Health & Exposure',
    sapSourceTables: ['EHFND_MED_EXAM', 'EHFND_HEALTH_SCH', 'PA0001', 'PA0002'],
    summaryAnswer: 'Zero (0) occupational health examinations are currently overdue across the enterprise. Out of 42 employees enrolled in medical surveillance, 41 have completed their annual medical exams, and only 1 exam is scheduled within its allowable 30-day grace window: Peter Mueller (Audiometric Exam - scheduled for this Friday, Aug 28 at 09:30).',
    keyInsights: [
      'Peter Mueller (Employee #881920 - Press Operator, Plant 1000): Annual G20 audiogram scheduled with on-site occupational health physician Dr. Becker for Friday Aug 28; currently within grace period.',
      '100% of chemical handling, paint booth, and mobile equipment medical certifications are active and up-to-date.',
      'S/4HANA Occupational Health automated reminder engine dispatches 60-day, 30-day, and 14-day calendar invites to employees and department supervisors.',
      'Enterprise medical exam on-time completion rate stands at 100%.'
    ],
    ehsMetrics: [
      { label: 'Overdue Medical Exams', value: '0 Employees', status: 'positive' },
      { label: 'Exams Scheduled This Week', value: '1 Employee', status: 'neutral' },
      { label: 'Completed Health Exams YTD', value: '41 of 42 (97.6%)', status: 'positive' },
      { label: 'Medical Clearance Health', value: '100% Valid', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Due This Week (In Grace Period)', value: '1 Exam', variance: 'Plant 1000', detail: 'P. Mueller (#881920) | G20 Audiogram | Scheduled Aug 28 09:30' },
      { category: 'Completed & Certified Active', value: '41 Exams', variance: '100% Pass', detail: 'All 41 employees cleared for unrestricted duty' },
      { category: 'Overdue (>30 Days Past SLA)', value: '0 Exams', variance: '0.0%', detail: 'Zero non-compliant medical records' }
    ],
    recommendedSapActions: [
      { actionName: 'Open Medical Schedule Worklist', tcode: 'CBIO02 / F2765', description: 'Review occupational physician appointment rosters, examination room allocations, and certificate issuance in SAP EHS.' },
      { actionName: 'Send Appointment Reminder Notification', tcode: 'EHFND_NW', description: 'Confirm automated Outlook calendar invite and SMS confirmation dispatched to employee and shift supervisor.' }
    ],
    incidentOrHazardDetails: [
      { id: 'MED-SCH-01', name: 'Peter Mueller Annual G20 Audiometric Exam', severity: 'Minor - Level 4', status: 'Scheduled Aug 28', metric: 'On Schedule', detail: 'Plant 1000 | Emp #881920 | On-site Health Center Room 102' }
    ]
  },
  {
    questionId: 'Q37',
    questionText: 'Show respiratory-protection requirements.',
    category: 'Occupational Health & Exposure',
    sapSourceTables: ['EHFND_PROT_EQ', 'EHFND_AGENT', 'EHFND_SURVEILLANCE'],
    summaryAnswer: 'S/4HANA Industrial Hygiene enforces mandatory Respiratory Protection Program standards for 3 operational areas where airborne contaminant concentrations warrant PPE: 1. Chemical Dosing & Tank Farm B4, 2. Paint Spray Booth 2, and 3. Bulk Powder Bag Dumping Station.',
    keyInsights: [
      'Area 1 (Chemical Dosing B4 - Plant 1010): Mandatory 3M 6800 Full-Facepiece Elastomeric Respirator with 60926 Multi-Gas/Vapor/P100 cartridge; APF = 50.',
      'Area 2 (Paint Spray Booth 2 - Plant 1010): Mandatory 3M Versaflo TR-600 Powered Air-Purifying Respirator (PAPR) with Organic Vapor/HEPA cartridge or Constant-Flow Supplied Air; APF = 1000.',
      'Area 3 (Powder Bag Dumping - Plant 1000): Mandatory 3M 8210 N95 Half-Face Particulate Respirator; APF = 10.',
      'All 28 authorized respirator users possess verified annual qualitative/quantitative fit-test records and medical clearances in S/4HANA EHS.'
    ],
    ehsMetrics: [
      { label: 'Respiratory Program Zones', value: '3 Work Areas', status: 'positive' },
      { label: 'Authorized Mask Users', value: '28 Employees', status: 'positive' },
      { label: 'Respirator Fit-Test Rate', value: '100% (28/28)', status: 'positive' },
      { label: 'Medical Clearance Rate', value: '100% (28/28)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Paint Spray Booth 2 (Plant 1010)', value: 'PAPR / Supplied Air (APF 1000)', variance: '8 Users', detail: '3M Versaflo PAPR with TR-6530N OV/HEPA cartridge' },
      { category: 'Chemical Tank Farm B4 (Plant 1010)', value: 'Full-Facepiece (APF 50)', variance: '12 Users', detail: '3M 6800 Full Face with Multi-Gas 60926 cartridge' },
      { category: 'Powder Bag Dump Station (Plant 1000)', value: 'N95 Particulate (APF 10)', variance: '8 Users', detail: '3M 8210 N95 cup-style disposable respirator' }
    ],
    recommendedSapActions: [
      { actionName: 'Display Respiratory Program Master Roster', tcode: 'F2765 / CBIH12', description: 'Review mask models, assigned Assigned Protection Factors (APF), cartridge change-out schedules, and user fit-test certificates.' },
      { actionName: 'Audit Cartridge Inventory in SAP MM', tcode: 'MMBE', description: 'Verify adequate inventory of 3M 60926 and TR-6530N replacement cartridges in Central Safety Store.' }
    ],
    incidentOrHazardDetails: [
      { id: 'RESP-PROG-01', name: 'Paint Booth Supplied Air & PAPR Program', severity: 'Major - Level 2', status: 'Certified Active', metric: '8 Users (APF 1000)', detail: 'Annual fit-test verified | Monthly flow rate calibration: Pass' },
      { id: 'RESP-PROG-02', name: 'Chemical Tank Farm Full-Face Program', severity: 'Major - Level 2', status: 'Certified Active', metric: '12 Users (APF 50)', detail: 'Quantitative PortaCount fit-test passed across all 12 staff' },
      { id: 'RESP-PROG-03', name: 'Powder Dump N95 Particulate Program', severity: 'Minor - Level 4', status: 'Certified Active', metric: '8 Users (APF 10)', detail: 'Qualitative Bitrex fit-test passed across all 8 staff' }
    ]
  },
  {
    questionId: 'Q38',
    questionText: 'Which roles require special medical clearance?',
    category: 'Occupational Health & Exposure',
    sapSourceTables: ['EHFND_HEALTH_SCH', 'EHFND_SURVEILLANCE', 'PA0001'],
    summaryAnswer: 'In S/4HANA EHS and HR Organization Management, 3 specific plant roles are flagged with "Mandatory Pre-Placement & Annual Special Medical Clearance" prior to job authorization: 1. Confined Space Rescue Team Members (10 staff), 2. Emergency Response Team & Fire Brigade (14 staff), and 3. Commercial Hazardous Waste Transporters (4 staff).',
    keyInsights: [
      'Role 1 (Confined Space Rescue Team): Requires SCBA medical clearance (OSHA 1910.134), treadmill cardiac stress test, and claustrophobia psychological assessment; 100% certified.',
      'Role 2 (Emergency Response Team / Fire Brigade): Requires NFPA 1582 comprehensive firefighter physical, VO2 max test, and structural bunker gear clearance; 100% certified.',
      'Role 3 (HazWaste Transporters): Requires DOT/ADR hazardous materials physical, drug & alcohol screening, and medical examiner certificate; 100% certified.',
      'System automatically blocks gate-pass issuance and SAP dispatching if clearance expires.'
    ],
    ehsMetrics: [
      { label: 'Special Clearance Roles', value: '3 Critical Roles', status: 'positive' },
      { label: 'Cleared Personnel', value: '28 Staff', status: 'positive' },
      { label: 'Special Clearance Rate', value: '100% (28/28)', status: 'positive' },
      { label: 'Gate-Pass Interlock Status', value: '100% Active', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Emergency Response Fire Brigade', value: '14 Certified Staff', variance: 'NFPA 1582 Standard', detail: 'Cardiopulmonary clearance & SCBA smoke chamber drill pass' },
      { category: 'Confined Space Rescue Squad', value: '10 Certified Staff', variance: 'OSHA 1910.146', detail: 'Advanced rigging, vertical rescue, & SCBA certified' },
      { category: 'Hazardous Waste Transporters', value: '4 Certified Drivers', variance: 'DOT / ADR Mandate', detail: 'Medical examiner certificates valid through 2027' }
    ],
    recommendedSapActions: [
      { actionName: 'Review Special Medical Clearance Matrix', tcode: 'CBIO02 / PA30', description: 'Display certified personnel lists, medical expiration dates, and linked emergency response team rosters in SAP EHS.' },
      { actionName: 'Schedule Annual SCBA Drill Simulation', tcode: 'CBIH92', description: 'Schedule semi-annual practical rescue simulation drill with local municipal fire department.' }
    ],
    incidentOrHazardDetails: [
      { id: 'SPEC-ROLE-01', name: 'Enterprise Fire Brigade & HazMat Response', severity: 'Critical - Level 1', status: 'Fully Certified', metric: '14 Members', detail: 'Commander: Capt. J. Richter | Next Annual Physical: Nov 2026' },
      { id: 'SPEC-ROLE-02', name: 'Confined Space High-Angle Rescue Squad', severity: 'Critical - Level 1', status: 'Fully Certified', metric: '10 Members', detail: 'Squad Lead: T. Bauer | Next Annual Physical: Dec 2026' },
      { id: 'SPEC-ROLE-03', name: 'ADR/DOT HazWaste Transport Fleet Drivers', severity: 'Major - Level 2', status: 'Fully Certified', metric: '4 Drivers', detail: 'Fleet Lead: G. Novak | Medical Cards valid through May 2027' }
    ]
  },
  {
    questionId: 'Q39',
    questionText: 'Show ergonomic risks by workstation.',
    category: 'Occupational Health & Exposure',
    sapSourceTables: ['EHFND_RAS_HAZ', 'EHFND_RAS_CTRL', 'EHFND_LOC_ROOT'],
    summaryAnswer: 'Ergonomic assessments utilizing the Rapid Entire Body Assessment (REBA) and Rapid Upper Limb Assessment (RULA) methodologies across 24 factory workstations classify 22 workstations as "Low Risk" (Score ≤ 4), 2 workstations as "Medium Risk" (Score 5-7), and ZERO workstations as "High Risk" (Score ≥ 8).',
    keyInsights: [
      'Workstation 1 (Final Assembly Packaging Station PK-04 - Plant 1000): RULA Score = 6 (Medium Risk); caused by repetitive wrist flexion during manual taping; pneumatic case sealer installed reducing score to 3.',
      'Workstation 2 (Manual Parcel De-Stacking Bay 1 - Plant 1020): REBA Score = 5 (Medium Risk); caused by forward torso bending >30°; scissor lift table staged reducing score to 2.',
      'Workstation 3 (CNC Tool Setting Bench - Plant 1000): REBA Score = 3 (Low Risk); anti-fatigue matting and height-adjustable benches deployed.',
      'Ergonomic injury rate across the entire enterprise has dropped to zero YTD.'
    ],
    ehsMetrics: [
      { label: 'Assessed Workstations', value: '24 Workstations', status: 'positive' },
      { label: 'Low Risk Workstations', value: '22 of 24 (91.7%)', status: 'positive' },
      { label: 'Medium Risk (Controlled)', value: '2 of 24 (8.3%)', status: 'neutral' },
      { label: 'High Risk Workstations', value: '0 (0.0%)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Packaging Station PK-04 (Plant 1000)', value: 'RULA Score: 6 -> 3', variance: 'Case Sealer Retrofit', detail: 'Pneumatic auto-taper eliminates repetitive wrist strain' },
      { category: 'De-Stacking Bay 1 (Plant 1020)', value: 'REBA Score: 5 -> 2', variance: 'Scissor Lift Table', detail: 'Electric pallet turntable keeps work at waist height' },
      { category: 'All Other 22 Assembly Workstations', value: 'REBA Score: 2 - 4', variance: 'Low Risk', detail: 'Ergonomically certified height-adjustable work cells' }
    ],
    recommendedSapActions: [
      { actionName: 'Open Ergonomic Assessment Dashboard', tcode: 'F2849 / CBIH02', description: 'Review video analysis motion capture, RULA/REBA score sheets, and workstation adjustment guidelines in S/4HANA EHS.' },
      { actionName: 'Commission Ergonomic Assist Work Orders', tcode: 'IW31', description: 'Release PM work order for installation of second vacuum lifter unit at Logistics Bay 2.' }
    ],
    incidentOrHazardDetails: [
      { id: 'ERGO-WS-01', name: 'Packaging Station PK-04 Wrist Ergonomics', severity: 'Minor - Level 4', status: 'Mitigated', metric: 'RULA: 3 (Low)', detail: 'Plant 1000 | Pneumatic case taper operational' },
      { id: 'ERGO-WS-02', name: 'De-Stacking Bay 1 Torso Bend Ergonomics', severity: 'Minor - Level 4', status: 'Mitigated', metric: 'REBA: 2 (Low)', detail: 'Plant 1020 | Scissor lift turntable operational' }
    ]
  },
  {
    questionId: 'Q40',
    questionText: 'Which occupational-health actions require follow-up?',
    category: 'Occupational Health & Exposure',
    sapSourceTables: ['EHFND_HEALTH_SCH', 'EHFND_INC_ACT', 'EHFND_SURVEILLANCE'],
    summaryAnswer: 'In S/4HANA Occupational Health, only 2 routine follow-up action items require administrative or clinical closure: 1. Confirm receipt and archival of Peter Mueller\'s Friday audiometric exam results (Plant 1000), and 2. Execute semi-annual calibration check on on-site Spirometry lung testing equipment (Plant 1010 Health Center).',
    keyInsights: [
      'Action ACT-OH-01: Dr. Becker to upload signed G20 audiometric audiogram for P. Mueller following Friday 09:30 consultation.',
      'Action ACT-OH-02: Biomedical engineering contractor (MedTech Calibration GmbH) scheduled for Sep 04 to certify spirometer calibration syringe.',
      'Zero clinical health exception flags or worker medical restrictions require emergency intervention.',
      'All employee surveillance dossiers are fully synchronized with S/4HANA HR SuccessFactors.'
    ],
    ehsMetrics: [
      { label: 'Active Health Actions', value: '2 Actions', status: 'positive' },
      { label: 'On Schedule SLA', value: '100%', status: 'positive' },
      { label: 'Clinical Exception Flags', value: '0 Flags', status: 'positive' },
      { label: 'SuccessFactors Sync Health', value: '100%', status: 'positive' }
    ],
    breakdownData: [
      { category: 'ACT-OH-01: G20 Audiogram Upload', value: 'Due Aug 28 (Friday)', variance: 'Plant 1000', detail: 'Dr. Becker consultation for employee #881920' },
      { category: 'ACT-OH-02: Spirometer Calibration', value: 'Due Sep 04', variance: 'Plant 1010', detail: 'MedTech GmbH bi-annual 3-liter calibration check' }
    ],
    recommendedSapActions: [
      { actionName: 'Process Occupational Health Task List', tcode: 'CBIO02 / F2765', description: 'Review pending clinical actions, document uploads, and physician sign-offs in SAP EHS Occupational Health.' },
      { actionName: 'Verify HCM Health Record Integration', tcode: 'PA30', description: 'Confirm automated interface synchronization between SAP EHS and SuccessFactors Employee Central.' }
    ],
    incidentOrHazardDetails: [
      { id: 'ACT-OH-01', name: 'Peter Mueller Audiogram Result Upload', severity: 'Minor - Level 4', status: 'Scheduled', metric: 'Due Aug 28', detail: 'Plant 1000 | Lead: Dr. Becker | Health Center Room 102' },
      { id: 'ACT-OH-02', name: 'Spirometer Calibration Syringe Certification', severity: 'Minor - Level 4', status: 'Scheduled', metric: 'Due Sep 04', detail: 'Plant 1010 | Lead: M. Vance | MedTech Calibration Service' }
    ]
  },

  // ============================================================================
  // PILLAR 5: ENVIRONMENTAL & COMPLIANCE (Q41 - Q50)
  // ============================================================================
  {
    questionId: 'Q41',
    questionText: 'Show environmental incidents this month.',
    category: 'Environmental & Compliance',
    sapSourceTables: ['EHFND_INCIDENT', 'EHFND_EMIS_ROOT', 'EHFND_PERMIT', 'EHFND_INC_LOC'],
    summaryAnswer: 'In the current calendar month (August 2026), S/4HANA Environmental Management records show a total of 1 minor environmental containment event: INC-2026-9081 (Chemical Dosing Unit Acid Spill - Plant 1010), in which 12 Liters of 37% HCl was 100% contained within the concrete secondary sump with ZERO discharge to municipal sewer or soil, resulting in ZERO environmental permit exceedances.',
    keyInsights: [
      'Event Details: Pump P-104 gasket weep released 12L of 37% hydrochloric acid at 14:22 CET on Aug 01.',
      'Containment: Double-walled HDPE sump caught 100% of liquid; automated sodium carbonate neutralizing wash neutralized acid to pH 7.4 prior to licensed waste tanker pump-out.',
      'Continuous Effluent Monitoring: Plant outfall TOC and pH sensors confirmed continuous normal baseline (pH 7.2 - 7.6) throughout the event.',
      'Environmental Regulatory Status: Non-reportable to EPA due to zero off-site environmental migration; logged in internal ISO 14001 register.'
    ],
    ehsMetrics: [
      { label: 'Environmental Incidents This Month', value: '1 Event', status: 'positive' },
      { label: 'Off-Site Environmental Release', value: '0.00 Liters (Zero)', status: 'positive' },
      { label: 'Permit Limit Exceedances', value: '0 Exceedances', status: 'positive' },
      { label: 'Secondary Containment Rate', value: '100% Effective', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Plant 1010 (Chemical & Heavy Mfg)', value: '1 Contained Event', variance: 'Zero Soil/Water Impact', detail: '12L HCl contained in concrete secondary containment sump' },
      { category: 'Plant 1000 (Central Assembly)', value: '0 Events', variance: 'Clean', detail: 'Zero environmental spills or releases' },
      { category: 'Plant 1020 (Logistics & Distribution)', value: '0 Events', variance: 'Clean', detail: 'Zero environmental spills or releases' },
      { category: 'Plant 1030 (Energy & Utilities)', value: '0 Events', variance: 'Clean', detail: 'Continuous emission CEMS fully compliant' }
    ],
    recommendedSapActions: [
      { actionName: 'Open Environmental Incident Dossier', tcode: 'F3124 / CBIH82', description: 'Review event timeline, sump neutralization log, and outfall sensor continuous pH records in S/4HANA EHS.' },
      { actionName: 'Archive ISO 14001 Spill Log', tcode: 'F3122', description: 'Verify digital entry in annual ISO 14001 Environmental Management System compliance register.' }
    ],
    incidentOrHazardDetails: [
      { id: 'ENV-INC-01', name: 'Chemical Dosing Unit B4 Sump Neutralization', severity: 'Major - Level 2', status: 'Contained & Cleared', metric: '12 L Contained', detail: 'Plant 1010 | Sump pH neutralized to 7.4 | Zero off-site impact' }
    ]
  },
  {
    questionId: 'Q42',
    questionText: 'Which permits expire soon?',
    category: 'Environmental & Compliance',
    sapSourceTables: ['EHFND_PERMIT', 'EHFND_COMPL_REQ', 'EHFND_LOC_ROOT'],
    summaryAnswer: 'S/4HANA Environmental Compliance monitors 34 active regulatory permits across all sites. Currently, 2 operating permits are entering their 90-day renewal window: PERM-2026-AIR-04 (Plant 1030 Title V Clean Air Operating Permit - Expiring Nov 30, 2026) and PERM-2026-WTR-02 (Plant 1010 Industrial Wastewater Direct Discharge Permit - Expiring Dec 15, 2026).',
    keyInsights: [
      'Permit 1 (PERM-2026-AIR-04 - Plant 1030): State EPA Title V Air Permit; draft renewal application completed; public notice period opens Sep 15; zero compliance violations.',
      'Permit 2 (PERM-2026-WTR-02 - Plant 1010): Municipal Industrial Wastewater Discharge Permit; quarterly heavy metal and BOD/COD effluent lab tests verified compliant; renewal submitted to Water Authority.',
      'All other 32 permits (Hazardous Waste Generators, Stormwater General, Radiation Sources) are active with >12 months remaining validity.',
      'Renewal progress tracking is 100% on schedule.'
    ],
    ehsMetrics: [
      { label: 'Active Regulatory Permits', value: '34 Permits', status: 'positive' },
      { label: 'Expiring Within 90 Days', value: '2 Permits', status: 'warning' },
      { label: 'Renewal Applications In-Flight', value: '2 of 2 (100%)', status: 'positive' },
      { label: 'Permit Compliance Score', value: '100.0%', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Title V Air Operating Permit (Plant 1030)', value: 'Expires Nov 30 (95d)', variance: 'Renewal Drafted', detail: 'State EPA Permit #AIR-TV-9014 | Public notice Sep 15' },
      { category: 'Industrial Wastewater Discharge (Plant 1010)', value: 'Expires Dec 15 (110d)', variance: 'Application Sent', detail: 'Water Authority #WTR-IND-4402 | Effluent labs compliant' },
      { category: 'Active Long-Term Permits (32 Permits)', value: 'Valid >12 Months', variance: 'Current', detail: 'RCRA HazWaste, Stormwater, Storage Tank licenses' }
    ],
    recommendedSapActions: [
      { actionName: 'Manage Environmental Permits Cockpit', tcode: 'F3122 / CBIH02', description: 'Monitor permit expiration timelines, compliance requirement conditions, and renewal submission milestones.' },
      { actionName: 'Upload Regulatory Filing Confirmation', tcode: 'F3122', description: 'Attach official State EPA stamped application receipt to S/4HANA Permit Master record.' }
    ],
    incidentOrHazardDetails: [
      { id: 'PERM-2026-AIR-04', name: 'Plant 1030 Title V Clean Air Operating Permit', severity: 'Critical - Level 1', status: 'Renewal in Progress', metric: 'Expires Nov 30', detail: 'State EPA | Lead: E. Tanaka | Draft submitted for review' },
      { id: 'PERM-2026-WTR-02', name: 'Plant 1010 Industrial Wastewater Permit', severity: 'Major - Level 2', status: 'Renewal Submitted', metric: 'Expires Dec 15', detail: 'Municipal Water Auth | Lead: M. Vance | Lab tests compliant' }
    ]
  },
  {
    questionId: 'Q43',
    questionText: 'Show emissions by facility.',
    category: 'Environmental & Compliance',
    sapSourceTables: ['EHFND_EMIS_ROOT', 'EHFND_EMIS_LOC', 'EHFND_COMPL_REQ'],
    summaryAnswer: 'Continuous Emissions Monitoring Systems (CEMS) and S/4HANA Environmental Accounting report that enterprise greenhouse gas (GHG) and criteria air pollutant emissions YTD stand at 14,280 Metric Tons CO2e, representing a -8.4% reduction against the annual decarbonization budget target.',
    keyInsights: [
      'Facility 1 (Plant 1030 - Energy Center): 8,450 MT CO2e; NOx = 12.4 Tons (Permit Limit: 25.0 Tons; 49.6% limit); SO2 = 1.8 Tons (Permit Limit: 10.0 Tons; 18.0% limit).',
      'Facility 2 (Plant 1010 - Chemical & Heavy Mfg): 3,620 MT CO2e; VOC = 4.2 Tons (Permit Limit: 12.0 Tons; 35.0% limit); Particulate PM = 0.8 Tons.',
      'Facility 3 (Plant 1000 - Central Assembly): 1,840 MT CO2e (primarily natural gas heating and paint curing ovens).',
      'Facility 4 (Plant 1020 - Logistics & Distribution): 370 MT CO2e (all-electric forklift fleet with rooftop 1.2MW solar offset).',
      'All facilities operate comfortably within statutory environmental bubble limits.'
    ],
    ehsMetrics: [
      { label: 'Total Corporate GHG YTD', value: '14,280 MT CO2e', status: 'positive' },
      { label: 'YoY Carbon Reduction', value: '-8.4%', status: 'positive' },
      { label: 'Max Permit Limit Utilization', value: '49.6% (NOx Plant 1030)', status: 'positive' },
      { label: 'Renewable Electricity Share', value: '48.2%', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Plant 1030 (Energy & Utilities Center)', value: '8,450 MT CO2e (59.2%)', variance: 'NOx: 49.6% Limit', detail: 'Cogeneration boilers & thermal oxidizers' },
      { category: 'Plant 1010 (Chemical & Heavy Mfg)', value: '3,620 MT CO2e (25.3%)', variance: 'VOC: 35.0% Limit', detail: 'Distillation units, process heaters, paint shop' },
      { category: 'Plant 1000 (Central Assembly)', value: '1,840 MT CO2e (12.9%)', variance: 'Clean Gas', detail: 'Building HVAC, drying tunnels, curing ovens' },
      { category: 'Plant 1020 (Logistics Center)', value: '370 MT CO2e (2.6%)', variance: 'Solar Offset', detail: 'Electric warehouse fleet + 1.2MW solar canopy' }
    ],
    recommendedSapActions: [
      { actionName: 'Open S/4HANA Air Emissions Management', tcode: 'F3125', description: 'Display real-time CEMS stack emission graphs, hourly averages, and permit exceedance buffers.' },
      { actionName: 'Export ESG Sustainability Disclosure (GRI 305)', tcode: 'F3124', description: 'Generate automated Scope 1 and Scope 2 GHG greenhouse gas report for corporate ESG sustainability reporting.' }
    ],
    incidentOrHazardDetails: [
      { id: 'EMIS-PLANT-1030', name: 'Plant 1030 Energy Center Stack CEMS', severity: 'Critical - Level 1', status: 'Compliant', metric: 'NOx: 12.4 T / 25 T', detail: 'CEMS Analyzer Continuous Stream | Last RATA Test: July 2026' },
      { id: 'EMIS-PLANT-1010', name: 'Plant 1010 Chemical Thermal Oxidizer', severity: 'Major - Level 2', status: 'Compliant', metric: 'VOC: 4.2 T / 12 T', detail: 'Destruction Efficiency: 99.4% | FID analyzer certified' },
      { id: 'EMIS-PLANT-1000', name: 'Plant 1000 Assembly Oven Exhaust', severity: 'Moderate - Level 3', status: 'Compliant', metric: 'Low NOx Burners', detail: 'Natural gas consumption tracked in SAP Sustainability' },
      { id: 'EMIS-PLANT-1020', name: 'Plant 1020 Net-Zero Solar Warehouse', severity: 'Minor - Level 4', status: 'Net-Zero Offset', metric: '1.2 MW Solar', detail: 'Generates 1.4 GWh/yr clean power offsetting warehouse load' }
    ]
  },
  {
    questionId: 'Q44',
    questionText: 'Which facilities are approaching environmental limits?',
    category: 'Environmental & Compliance',
    sapSourceTables: ['EHFND_EMIS_ROOT', 'EHFND_COMPL_REQ', 'EHFND_PERMIT'],
    summaryAnswer: 'Predictive environmental compliance forecasting in S/4HANA EHS indicates that only 1 facility parameter is approaching the 75% warning buffer threshold: Plant 1030 Cogeneration Boiler NOx cumulative mass discharge is currently tracking at 49.6% of its annual permitted allocation at Month 8 (Projected to close at 74.2% of annual limit by Dec 31).',
    keyInsights: [
      'Plant 1030 (Boiler NOx): Permitted annual limit is 25.0 Tons; year-to-date discharge is 12.4 Tons; projected year-end total is 18.5 Tons (Comfortably below 25.0T permit cap).',
      'Selective Catalytic Reduction (SCR) ammonia injection rate was optimized +4% last week, reducing hourly NOx concentration from 18 ppm to 14 ppm.',
      'All other 18 monitored environmental parameters across air, wastewater, and hazardous waste are operating below 50% of annual regulatory limits.',
      'Zero regulatory notices of violation (NOV) or warning letters have been issued.'
    ],
    ehsMetrics: [
      { label: 'Approaching Limit Thresholds', value: '1 Parameter (NOx)', status: 'warning' },
      { label: 'Forecast Year-End Utilization', value: '74.2% (Safe)', status: 'positive' },
      { label: 'SCR Ammonia Efficiency', value: '94.8%', status: 'positive' },
      { label: 'Notices of Violation (NOV)', value: '0 (Zero)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Plant 1030 Boiler NOx Mass', value: '12.4 T / 25.0 T (49.6%)', variance: 'Projected: 18.5 T', detail: 'SCR ammonia trimming keeps daily rate below 45 kg/day' },
      { category: 'Plant 1010 Process VOC Mass', value: '4.2 T / 12.0 T (35.0%)', variance: 'Projected: 6.4 T', detail: 'Thermal oxidizer running at 99.4% DRE' },
      { category: 'Plant 1010 Wastewater Heavy Metals', value: '0.04 mg/L (Limit 0.20)', variance: 'Projected: 0.05 mg/L', detail: 'Pre-treatment precipitation system operating normally' }
    ],
    recommendedSapActions: [
      { actionName: 'Configure Predictive Environmental Alert', tcode: 'F3124 / F3125', description: 'Set automated SMS/email alert to Environmental Manager if cumulative NOx discharge exceeds 80% threshold.' },
      { actionName: 'Review SCR Catalyst Performance in SAP PM', tcode: 'IE03 / IW38', description: 'Audit differential pressure and activity test logs for Boiler SCR Catalyst Bed A.' }
    ],
    incidentOrHazardDetails: [
      { id: 'ENV-LIMIT-01', name: 'Plant 1030 Boiler NOx Mass Tracking', severity: 'Major - Level 2', status: 'Tracked & Controlled', metric: '49.6% Limit', detail: 'Annual Permit Cap: 25.0 Tons | Year-End Forecast: 18.5 Tons' }
    ]
  },
  {
    questionId: 'Q45',
    questionText: 'Show hazardous-waste volumes.',
    category: 'Environmental & Compliance',
    sapSourceTables: ['EHFND_WASTE', 'EHSWA01', 'EHSWA02', 'EHFND_COMPL_REQ'],
    summaryAnswer: 'S/4HANA Waste Management tracks that across all enterprise manufacturing facilities, total hazardous waste generated YTD is 48.6 Metric Tons, of which 88.5% (43.0 Tons) was diverted to Energy Recovery and Solvent Distillation Recycling, with only 11.5% (5.6 Tons) sent for authorized high-temperature incineration.',
    keyInsights: [
      'Waste Stream 1 (Spent Mixed Solvent Waste - D001/F003): 32.4 Tons; 100% shipped to certified solvent recycling partner (CleanHarbors Inc) for fuel blending & recovery.',
      'Waste Stream 2 (Heavy Metal Wastewater Filter Cake - F006): 9.2 Tons; stabilized and recycled in thermal metal smelter extraction.',
      'Waste Stream 3 (Contaminated Rags & Absorbents - D001): 4.8 Tons; high-temperature waste-to-energy incineration.',
      'Waste Stream 4 (Expired Lab Reagents & Acid Neutralizer): 2.2 Tons; specialized chemical neutralization.',
      'Zero hazardous waste sent to landfill; 100% of hazardous waste manifests (EPA Form 8700-22) are electronically closed and signed in S/4HANA.'
    ],
    ehsMetrics: [
      { label: 'Total HazWaste YTD', value: '48.6 Metric Tons', status: 'positive' },
      { label: 'Recycling / Recovery Rate', value: '88.5%', status: 'positive' },
      { label: 'Landfill Diversion Rate', value: '100% (Zero Landfill)', status: 'positive' },
      { label: 'Electronic Manifests Closed', value: '100% (24/24)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Spent Mixed Solvents (D001/F003)', value: '32.4 Tons (66.7%)', variance: '100% Recycled', detail: 'Fuel blending energy recovery by CleanHarbors' },
      { category: 'Plating Filter Cake (F006)', value: '9.2 Tons (18.9%)', variance: 'Metal Recovery', detail: 'Copper/Nickel smelter thermal reclaim' },
      { category: 'Oily Rags & Sorbents', value: '4.8 Tons (9.9%)', variance: 'Incineration', detail: 'Waste-to-energy power generation' },
      { category: 'Lab Reagents & Acid Sludge', value: '2.2 Tons (4.5%)', variance: 'Neutralization', detail: 'Specialized chemical treatment' }
    ],
    recommendedSapActions: [
      { actionName: 'Open S/4HANA Waste Management Cockpit', tcode: 'F3480 / EHSWA01', description: 'Review electronic hazardous waste manifests, disposal documents, transporter licenses, and storage container aging.' },
      { actionName: 'Audit 90-Day Accumulation Area Limits', tcode: 'EHSWA02', description: 'Verify all storage drums in Central Waste Yard B-9 have <60 days accumulation time remaining.' }
    ],
    incidentOrHazardDetails: [
      { id: 'WASTE-STR-01', name: 'Spent Flammable Solvents (D001/F003)', severity: 'Major - Level 2', status: 'Manifest Closed', metric: '32.4 Tons', detail: 'Transporter: CleanHarbors | TSDF Facility: Chicago Hub | 100% Recycled' },
      { id: 'WASTE-STR-02', name: 'Wastewater Treatment Filter Cake (F006)', severity: 'Major - Level 2', status: 'Manifest Closed', metric: '9.2 Tons', detail: 'Transporter: Heritage Environmental | TSDF: Indianapolis | Metal Reclaim' },
      { id: 'WASTE-STR-03', name: 'Contaminated Shop Rags & Sorbents', severity: 'Minor - Level 4', status: 'Manifest Closed', metric: '4.8 Tons', detail: 'Transporter: Veolia Environmental | TSDF: Sauget IL | Waste-to-Energy' }
    ]
  },
  {
    questionId: 'Q46',
    questionText: 'Which compliance tasks are overdue?',
    category: 'Environmental & Compliance',
    sapSourceTables: ['EHFND_COMPL_REQ', 'EHFND_PERMIT', 'EHFND_INC_ACT'],
    summaryAnswer: 'A complete audit of 186 scheduled environmental and safety compliance tasks in S/4HANA EHS confirms that ZERO (0) compliance tasks are overdue. The enterprise maintains a 100% on-time completion record across mandatory emissions testing, wastewater sampling, spill drill simulations, and regulatory filings.',
    keyInsights: [
      'Compliance Task Catalog: 186 recurring statutory tasks (Federal EPA, OSHA, State DEQ, Municipal Water District, and ISO 14001/45001).',
      'YTD Tasks Executed: 142 completed on-time (100% compliance rate).',
      'Tasks Scheduled Next 30 Days: 14 tasks (all on schedule; assigned to certified environmental engineers).',
      'S/4HANA automated compliance calendar triggers early-warning notifications at 30, 14, and 7 days prior to statutory deadlines.'
    ],
    ehsMetrics: [
      { label: 'Overdue Compliance Tasks', value: '0 Tasks (0%)', status: 'positive' },
      { label: 'Completed Tasks YTD', value: '142 Tasks', status: 'positive' },
      { label: 'On-Time Compliance SLA', value: '100.0%', status: 'positive' },
      { label: 'Scheduled Next 30 Days', value: '14 Tasks', status: 'neutral' }
    ],
    breakdownData: [
      { category: 'Air Emission CEMS Quarterly Calibrations', value: '100% On-Time', variance: '8/8 Completed', detail: 'Zero audit findings' },
      { category: 'Wastewater Discharge Lab Sampling', value: '100% On-Time', variance: '24/24 Completed', detail: 'Zero limit exceedances' },
      { category: 'SPCC Oil Spill Drill Simulations', value: '100% On-Time', variance: '4/4 Completed', detail: 'All 4 plants certified' },
      { category: 'HazWaste Manifest 45-Day Confirmations', value: '100% On-Time', variance: '24/24 Completed', detail: 'All signed TSDF copies archived' }
    ],
    recommendedSapActions: [
      { actionName: 'Review Compliance Requirement Hierarchy', tcode: 'F3122', description: 'Display S/4HANA EHS compliance regulations, paragraph clauses, and mapped recurring operational tasks.' },
      { actionName: 'Export Statutory Compliance Certificate', tcode: 'CBIH02', description: 'Generate certified executive compliance status document for General Counsel and Board Audit Committee.' }
    ],
    incidentOrHazardDetails: [
      { id: 'COMPL-STAT-01', name: 'Clean Air Act Title V Compliance Roster', severity: 'Critical - Level 1', status: 'Fully Compliant', metric: '100% (42/42)', detail: 'All CEMS reports and RATA tests submitted on schedule' },
      { id: 'COMPL-STAT-02', name: 'Clean Water Act NPDES Compliance Roster', severity: 'Major - Level 2', status: 'Fully Compliant', metric: '100% (24/24)', detail: 'All monthly Discharge Monitoring Reports (DMR) submitted' },
      { id: 'COMPL-STAT-03', name: 'RCRA Hazardous Waste Compliance Roster', severity: 'Major - Level 2', status: 'Fully Compliant', metric: '100% (36/36)', detail: 'All biennial reports and contingency plans updated' }
    ]
  },
  {
    questionId: 'Q47',
    questionText: 'Show regulatory inspections and findings.',
    category: 'Environmental & Compliance',
    sapSourceTables: ['EHFND_REG_FIND', 'EHFND_AUDIT', 'EHFND_COMPL_REQ'],
    summaryAnswer: 'In the past 12 months, 4 external regulatory and third-party certification audits were conducted across enterprise facilities: 1. State EPA Air Quality Inspection (Plant 1030: Zero Findings), 2. Municipal Water District Wastewater Audit (Plant 1010: Zero Findings), 3. TÜV SÜD ISO 45001/14001 Re-Certification (Plant 1010: 1 Major / 3 Minor), and 4. OSHA General Industry Consultation (Plant 1000: 2 Minor Findings).',
    keyInsights: [
      'Audit 1 (State EPA Air - Plant 1030): Comprehensive stack testing and CEMS calibration log audit; awarded "Certificate of Full Environmental Compliance".',
      'Audit 2 (Municipal Water - Plant 1010): Automatic composite sampler and pH neutralizer inspection; 100% compliant.',
      'Audit 3 (TÜV SÜD ISO Re-Cert - Plant 1010): Major finding on eyewash weekly inspection logs; all 4 corrective actions implemented and verified by TÜV auditor; ISO 45001 certificate renewed.',
      'Audit 4 (OSHA Consultation - Plant 1000): 2 minor findings (faded floor striping, 1 unmounted fire extinguisher); resolved within 48 hours.',
      'Zero financial fines or monetary penalties incurred ($0).'
    ],
    ehsMetrics: [
      { label: 'Regulatory Audits (12m)', value: '4 Inspections', status: 'positive' },
      { label: 'Critical Non-Compliances', value: '0 Cases', status: 'positive' },
      { label: 'Fines / Penalties Incurred', value: '$0.00 (Zero)', status: 'positive' },
      { label: 'Audit Finding Closure Rate', value: '100% Closed', status: 'positive' }
    ],
    breakdownData: [
      { category: 'TÜV SÜD ISO 45001/14001 (Plant 1010)', value: 'Score: 94.2%', variance: '1 Major / 3 Minor', detail: 'All 4 CAPAs closed; ISO certification renewed through 2029' },
      { category: 'OSHA Voluntary Consultation (Plant 1000)', value: 'Pass (Clean)', variance: '2 Minor Items', detail: 'Floor striping repainted; extinguisher mounted' },
      { category: 'State EPA Title V Audit (Plant 1030)', value: '100% Compliant', variance: 'Zero Findings', detail: 'Stack emissions and CEMS certified' },
      { category: 'Municipal Water District (Plant 1010)', value: '100% Compliant', variance: 'Zero Findings', detail: 'Composite sampler and pH monitoring approved' }
    ],
    recommendedSapActions: [
      { actionName: 'Display Audit Findings Cockpit', tcode: 'F3122 / CBIH82', description: 'Review external regulatory inspection reports, auditor observations, and linked CAPA evidence files.' },
      { actionName: 'Download TÜV ISO 45001 Certificate', tcode: 'CBIH02', description: 'Access cryptographic PDF copy of renewed ISO 45001 and ISO 14001 registration certificates.' }
    ],
    incidentOrHazardDetails: [
      { id: 'AUD-2026-0412', name: 'TÜV SÜD ISO 45001 / ISO 14001 Surveillance', severity: 'Major - Level 2', status: 'Certified Renewed', metric: 'Score: 94.2%', detail: 'Plant 1010 | Lead Auditor: Dr. M. Vance | All 4 CAPAs verified' },
      { id: 'AUD-2026-0210', name: 'State EPA Annual Title V Air Inspection', severity: 'Critical - Level 1', status: 'Fully Compliant', metric: 'Zero Findings', detail: 'Plant 1030 | Inspector: R. Jenkins (EPA Region 5) | Full Pass' },
      { id: 'AUD-2025-1104', name: 'OSHA General Industry Safety Review', severity: 'Moderate - Level 3', status: 'Resolved & Closed', metric: 'Zero Citations', detail: 'Plant 1000 | Lead: S. Martinez | Voluntary consultation pass' }
    ]
  },
  {
    questionId: 'Q48',
    questionText: 'Which corrective actions relate to audit findings?',
    category: 'Environmental & Compliance',
    sapSourceTables: ['EHFND_INC_ACT', 'EHFND_AUDIT', 'EHFND_REG_FIND'],
    summaryAnswer: 'In S/4HANA EHS, 4 specific corrective actions (CAPA) are directly linked to findings from the recent TÜV SÜD ISO 45001/14001 audit (AUD-2026-0412). All 4 corrective actions have been fully executed, verified, and accepted by the lead external auditor.',
    keyInsights: [
      'CAPA-AUD-01 (Major Finding): Digitized weekly eyewash station pressure testing via SAP EHS Mobile App with QR-code scan verification; 100% weekly completion.',
      'CAPA-AUD-02 (Minor Finding): Replaced 2 expired CO2 fire extinguishers in Solvent Dispensing Room under Work Order WO-89021.',
      'CAPA-AUD-03 (Minor Finding): Repainted faded emergency evacuation route lines with photo-luminescent epoxy coating in High-Bay Warehouse Bay 3.',
      'CAPA-AUD-04 (Minor Finding): Updated secondary containment drainage inspection logbook in Chemical Yard B4.',
      'Auditor formally signed off on CAPA closure during post-audit review meeting on Aug 10.'
    ],
    ehsMetrics: [
      { label: 'Audit-Linked CAPAs', value: '4 Actions', status: 'positive' },
      { label: 'Execution Status', value: '100% Completed', status: 'positive' },
      { label: 'Auditor Acceptance', value: '100% Approved', status: 'positive' },
      { label: 'ISO Certificate Impact', value: 'Zero Conditions', status: 'positive' }
    ],
    breakdownData: [
      { category: 'CAPA-AUD-01: Eyewash QR App Log', value: 'Major Finding Fix', variance: 'Verified Pass', detail: 'Mobile app replaces paper logs; weekly scan mandatory' },
      { category: 'CAPA-AUD-02: Extinguisher Replacement', value: 'Minor Finding Fix', variance: 'Verified Pass', detail: '2 new 20lb CO2 units installed & tagged (WO-89021)' },
      { category: 'CAPA-AUD-03: Evacuation Line Striping', value: 'Minor Finding Fix', variance: 'Verified Pass', detail: 'Photo-luminescent epoxy applied in Bay 3' },
      { category: 'CAPA-AUD-04: Yard B4 Sump Logbook', value: 'Minor Finding Fix', variance: 'Verified Pass', detail: 'Electronic drainage valve checklist active' }
    ],
    recommendedSapActions: [
      { actionName: 'Review Audit CAPA Closure Verification', tcode: 'F2453 / CBIH92', description: 'Display audit corrective action closure dossiers, photo evidence attachments, and external auditor sign-off memos.' },
      { actionName: 'Archive ISO Audit Dossier', tcode: 'CBIH02', description: 'Store closed audit package in S/4HANA Document Management System (DMS) with 5-year retention rule.' }
    ],
    incidentOrHazardDetails: [
      { id: 'CAPA-AUD-01', name: 'Eyewash Station Mobile QR Inspection App', severity: 'Major - Level 2', status: 'Verified Closed', metric: '100% Weekly', detail: 'Plant 1010 | Linked to AUD-2026-0412 | Mobile QR active' },
      { id: 'CAPA-AUD-02', name: 'Solvent Room Fire Extinguisher Replacement', severity: 'Minor - Level 4', status: 'Verified Closed', metric: 'WO-89021', detail: 'Plant 1010 | Linked to AUD-2026-0412 | 2 new units installed' },
      { id: 'CAPA-AUD-03', name: 'Bay 3 Evacuation Path Luminescent Striping', severity: 'Minor - Level 4', status: 'Verified Closed', metric: 'Epoxy Pass', detail: 'Plant 1020 | Linked to AUD-2026-0412 | Completed Aug 05' },
      { id: 'CAPA-AUD-04', name: 'Chemical Yard B4 Sump Inspection Protocol', severity: 'Minor - Level 4', status: 'Verified Closed', metric: 'Digital Log', detail: 'Plant 1010 | Linked to AUD-2026-0412 | Completed Aug 06' }
    ]
  },
  {
    questionId: 'Q49',
    questionText: 'Show environmental KPIs by plant.',
    category: 'Environmental & Compliance',
    sapSourceTables: ['EHFND_EMIS_ROOT', 'EHFND_WASTE', 'EHFND_COMPL_REQ', 'EHFND_LOC_ROOT'],
    summaryAnswer: 'Enterprise Environmental Performance Cockpit compiles key ESG metrics across all 4 production plants: Plant 1030 leads in energy efficiency (Heat Rate: 7,120 BTU/kWh), Plant 1020 leads in renewable power (100% solar offset), Plant 1010 leads in waste recycling (92.4% diverted), and Plant 1000 leads in water conservation (Specific Water Consumption: 0.42 m³/ton).',
    keyInsights: [
      'Plant 1000 (Central Assembly): Water recycled = 78.4%; Energy intensity = 142 kWh/vehicle; Waste diverted = 89.2%.',
      'Plant 1010 (Chemical & Heavy Mfg): Waste recycled = 92.4%; Air scrubber uptime = 99.8%; Wastewater discharge BOD = 14 mg/L (Limit: 50 mg/L).',
      'Plant 1020 (Logistics Center): 1.2MW solar generates 100% of site electricity; Zero direct Scope 1 emissions; Waste diverted = 94.0%.',
      'Plant 1030 (Energy Center): Cogeneration efficiency = 84.6%; NOx emissions = 49.6% of cap; Continuous zero thermal discharge violations.',
      'Enterprise consolidated ESG Environmental Score stands at 96.2 / 100.'
    ],
    ehsMetrics: [
      { label: 'Enterprise ESG Eco-Score', value: '96.2 / 100', status: 'positive' },
      { label: 'Overall Waste Diversion', value: '88.5%', status: 'positive' },
      { label: 'Renewable Electricity', value: '48.2%', status: 'positive' },
      { label: 'Water Recycling Rate', value: '74.6%', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Plant 1010 (Chemical & Heavy Mfg)', value: 'Waste Recycled: 92.4%', variance: 'BOD: 14 mg/L', detail: 'Scrubber uptime: 99.8% | Zero permit exceedances' },
      { category: 'Plant 1020 (Logistics & Distribution)', value: 'Solar Power: 100%', variance: 'Net-Zero Scope 1', detail: '1.2MW solar rooftop | 94.0% cardboard/stretch-wrap recycled' },
      { category: 'Plant 1000 (Central Assembly)', value: 'Water Recycled: 78.4%', variance: 'Energy: 142 kWh/veh', detail: 'Specific water consumption: 0.42 m³/ton' },
      { category: 'Plant 1030 (Energy & Utilities)', value: 'Cogen Eff: 84.6%', variance: 'NOx: 49.6% Cap', detail: 'Continuous CEMS compliance | Low heat rate' }
    ],
    recommendedSapActions: [
      { actionName: 'Open Enterprise Environmental KPI Cockpit', tcode: 'F3124', description: 'View comparative sustainability scorecards, energy/water intensity trends, and plant benchmark rankings in S/4HANA EHS.' },
      { actionName: 'Publish Monthly ESG Dashboard', tcode: 'CBIH82', description: 'Export monthly sustainability KPI dashboard for Corporate Sustainability Committee and Investor Relations.' }
    ],
    incidentOrHazardDetails: [
      { id: 'KPI-PLANT-1010', name: 'Plant 1010 Chemical Environmental Scorecard', severity: 'Major - Level 2', status: 'Top Recycler', metric: '92.4% Diversion', detail: 'Solvent distillation recycling + closed-loop wastewater' },
      { id: 'KPI-PLANT-1020', name: 'Plant 1020 Logistics Environmental Scorecard', severity: 'Minor - Level 4', status: 'Net-Zero Solar', metric: '100% Clean Power', detail: '1.2MW solar generation + electric AGV warehouse fleet' },
      { id: 'KPI-PLANT-1000', name: 'Plant 1000 Assembly Environmental Scorecard', severity: 'Moderate - Level 3', status: 'Water Efficient', metric: '78.4% Recycled', detail: 'Reverse osmosis wastewater recycling plant' },
      { id: 'KPI-PLANT-1030', name: 'Plant 1030 Energy Environmental Scorecard', severity: 'Critical - Level 1', status: 'High Efficiency', metric: '84.6% Thermal Eff', detail: 'Combined heat and power (CHP) cogeneration plant' }
    ]
  },
  {
    questionId: 'Q50',
    questionText: 'What EHS compliance issues require immediate attention?',
    category: 'Environmental & Compliance',
    sapSourceTables: ['EHFND_COMPL_REQ', 'EHFND_PERMIT', 'EHFND_INC_ACT', 'EHFND_INCIDENT'],
    summaryAnswer: 'The S/4HANA EHS Executive AI Copilot has synthesized environmental regulatory deadlines, open incident CAPAs, medical surveillances, and permit horizons to deliver the TOP 3 compliance action priorities requiring immediate leadership oversight: 1. Finalize Title V Air Permit Public Notice Filing for Plant 1030 (Permit expires Nov 30), 2. Verify Viton Flange Seal Installation on Dosing Skid P-104 (INC-2026-9081 CAPA due Aug 28), and 3. Close Friday G20 Audiometric Medical Exam for P. Mueller (Aug 28).',
    keyInsights: [
      'Priority 1 (Environmental - Title V Air Permit): State EPA 90-day renewal submission milestone requires legal notice publication by Sep 15 to maintain operating authority for Plant 1030 Energy Center.',
      'Priority 2 (Safety - Chemical CAPA #8841): Mechanical engineering team at 60% completion on Viton gasket retrofit; inspection sign-off required before tomorrow\'s 16:00 production run.',
      'Priority 3 (Health - Protocol G20 Examination): Concludes annual hearing surveillance program, achieving 100% enterprise medical compliance.',
      'Executing these 3 priorities maintains 100% enterprise compliance across all OSHA, EPA, and ISO 45001 regulatory mandates.'
    ],
    ehsMetrics: [
      { label: 'Executive Compliance Priorities', value: '3 Priorities', status: 'warning' },
      { label: 'Statutory Compliance Health', value: '100.0%', status: 'positive' },
      { label: 'Critical Escalations', value: '0 Escalations', status: 'positive' },
      { label: 'Executive SteerCo Briefed', value: 'Yes (Real-Time)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Priority 1: Title V Air Permit Renewal', value: 'Statutory Filing', variance: 'Plant 1030', detail: 'Public notice filing window opens Sep 15 (Expires Nov 30)' },
      { category: 'Priority 2: Acid Skid Viton Flange Seal', value: 'Safety CAPA #8841', variance: 'Plant 1010', detail: 'Final verification required by Aug 28 (60% complete)' },
      { category: 'Priority 3: Annual Audiometric Exam', value: 'Health Protocol G20', variance: 'Plant 1000', detail: 'Scheduled consultation for P. Mueller Friday Aug 28 09:30' }
    ],
    recommendedSapActions: [
      { actionName: 'Launch Executive Compliance Command Center', tcode: 'F3122 / F2453', description: 'Monitor enterprise compliance status, regulatory calendar milestones, and CAPA execution velocity in S/4HANA EHS.' },
      { actionName: 'Transmit Weekly SteerCo Summary', tcode: 'CBIH82', description: 'Dispatch executive briefing memo to Chief Operating Officer and Corporate VP of EHS.' }
    ],
    incidentOrHazardDetails: [
      { id: 'PRI-COMPL-01', name: 'Plant 1030 Title V Air Permit Renewal Filing', severity: 'Critical - Level 1', status: 'In Progress', metric: 'Priority 1', detail: 'State EPA | Lead: E. Tanaka | Target: Sep 15' },
      { id: 'PRI-COMPL-02', name: 'Chemical Dosing Skid Viton Flange Seal Sign-Off', severity: 'Major - Level 2', status: 'In Progress', metric: 'Priority 2', detail: 'Plant 1010 | Lead: Dr. M. Vance | Target: Aug 28' },
      { id: 'PRI-COMPL-03', name: 'G20 Audiometric Health Surveillance Completion', severity: 'Minor - Level 4', status: 'Scheduled', metric: 'Priority 3', detail: 'Plant 1000 | Lead: Dr. Becker | Target: Aug 28 09:30' }
    ]
  }
];
