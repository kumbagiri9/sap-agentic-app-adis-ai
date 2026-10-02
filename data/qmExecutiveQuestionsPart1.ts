import { QmExecutiveQuestionAnswer } from '../types';

export const QM_EXECUTIVE_QUESTIONS_PART1: QmExecutiveQuestionAnswer[] = [
  // =========================================================================
  // PILLAR 1: QUALITY INSPECTIONS (Q1 - Q10)
  // =========================================================================
  {
    questionId: 'Q1',
    questionText: 'Show all inspection lots created today.',
    category: 'Quality Inspections',
    sapSourceTables: ['QALS', 'QAVE', 'MARA', 'MAKT', 'T001W'],
    summaryAnswer: 'Today across Plant 1000, 28 inspection lots have been created totaling 14,250 units: 14 Goods Receipt Lots (Origin 01 - Supplier Receipts), 8 In-Process Production Lots (Origin 03 - Shop Floor), and 6 Customer Return / Final Delivery Lots (Origin 04/06). Currently, 22 lots have assigned inspection specifications and 6 are awaiting sample draw.',
    keyInsights: [
      '28 inspection lots posted today across Plant 1000 and Plant 1010.',
      'Origin 01 (Goods Receipt): 14 lots linked to MIGO 101 GR postings against POs.',
      'Origin 03 (Production): 8 lots tied to active Production Orders in Machining & Assembly.',
      'Average sampling calculation completion time is 4.2 minutes post-goods receipt.'
    ],
    qmMetrics: [
      { label: 'Lots Created Today', value: '28 Lots', status: 'positive' },
      { label: 'Total Volume', value: '14,250 PC', status: 'positive' },
      { label: 'Spec Assigned', value: '22 / 28 (78.6%)', status: 'positive' },
      { label: 'Awaiting Samples', value: '6 Lots', status: 'neutral' }
    ],
    breakdownData: [
      { category: 'Origin 01 (Goods Receipt)', value: '14 Lots (8,200 PC)', variance: 'Normal', detail: 'Suppliers: Bosch, Festo, SKF' },
      { category: 'Origin 03 (Production In-Process)', value: '8 Lots (4,800 PC)', variance: 'On Schedule', detail: 'Lines: Line 1, CNC Cell 3' },
      { category: 'Origin 04 (Final Inspection)', value: '4 Lots (950 PC)', variance: 'Normal', detail: 'Finished Goods Warehouse 0001' },
      { category: 'Origin 06 (Customer Returns)', value: '2 Lots (300 PC)', variance: 'Priority Hold', detail: 'RMA Inspection Bay B' }
    ],
    recommendedSapActions: [
      { actionName: 'Inspection Lot Worklist', tcode: 'QA32', description: 'Monitor and process active inspection lots created today' },
      { actionName: 'Display Inspection Lot', tcode: 'QA03', description: 'Inspect lot header status, origin, and material specifications' }
    ]
  },
  {
    questionId: 'Q2',
    questionText: 'Which inspection lots are pending?',
    category: 'Quality Inspections',
    sapSourceTables: ['QALS', 'QAMV', 'TJ02T', 'JEST'],
    summaryAnswer: 'There are currently 18 inspection lots in pending status across Plant 1000: 7 are awaiting physical sample drawing (status CRTD/CALC), 8 are actively in characteristic result recording (status INSP/RREC), and 3 have completed result recording but are awaiting final Usage Decision evaluation.',
    keyInsights: [
      '18 open inspection lots with pending operational milestones.',
      '7 lots pending physical sample collection at incoming receiving dock D-02.',
      '8 lots in laboratory testing (chemical & dimensional tolerances in progress).',
      '3 lots ready for Usage Decision (UD) posting with 100% characteristics completed.'
    ],
    qmMetrics: [
      { label: 'Total Pending Lots', value: '18 Lots', status: 'warning' },
      { label: 'Sample Draw Pending', value: '7 Lots', status: 'warning' },
      { label: 'In Lab Testing', value: '8 Lots', status: 'neutral' },
      { label: 'Ready for UD', value: '3 Lots', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Lot 0100098421 (Bearing Housing)', value: 'Status: CRTD CALC', variance: 'Dock D-02', detail: 'Sample size: 5 PC from batch B-9901' },
      { category: 'Lot 0100098425 (Hydraulic Valve)', value: 'Status: INSP RREC', variance: 'QA Lab 2', detail: 'Char 0020 Flow Rate tested; Char 0030 pending' },
      { category: 'Lot 0300041210 (Stator Assembly)', value: 'Status: INSP RREC', variance: 'Line 2', detail: 'Inspecting point 0010 electrical insulation' },
      { category: 'Lot 0400019850 (Pump Complete)', value: 'Status: INSP COMP', variance: 'Ready for UD', detail: 'All 12 characteristics conformant (100% pass)' }
    ],
    recommendedSapActions: [
      { actionName: 'Results Recording Worklist', tcode: 'QE51N', description: 'Record qualitative and quantitative inspection values' },
      { actionName: 'Usage Decision Processing', tcode: 'QA11', description: 'Post stock valuation and release conformant inspection lots' }
    ]
  },
  {
    questionId: 'Q3',
    questionText: 'Which inspection lots are overdue?',
    category: 'Quality Inspections',
    sapSourceTables: ['QALS', 'QAVE', 'MARA', 'EKPO'],
    summaryAnswer: '5 inspection lots have exceeded their maximum standard lead-time threshold (>48 hours for raw materials, >8 hours for in-process): Lot 0100098310 (Alloy Rods, 72h overdue due to spectrometer recalibration), Lot 0100098315 (Gaskets, 54h overdue), and 3 manufacturing lots delayed on Line 4.',
    keyInsights: [
      '5 overdue inspection lots blocking inventory valuation of $248,500 USD.',
      'Root cause for 2 GR lots: Central Spectrometry lab awaiting recalibration standard.',
      '3 Production lots on Line 4 pending dimensional CMM machine queue.',
      'No critical assembly line stoppage reported; safety buffers absorb the variance.'
    ],
    qmMetrics: [
      { label: 'Overdue Lots', value: '5 Lots', status: 'negative' },
      { label: 'Blocked Value', value: '$248,500 USD', status: 'negative' },
      { label: 'Avg Overdue Time', value: '38.4 hrs', status: 'warning' },
      { label: 'Critical Lines Impact', value: '0 Stoppages', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Lot 0100098310 (Steel Alloy ROH-100)', value: '72 hrs Overdue', variance: 'Critical', detail: 'Vendor: ThyssenKrupp / Lab Spectrometer queue' },
      { category: 'Lot 0100098315 (EPDM Gasket RAW-204)', value: '54 hrs Overdue', variance: 'High', detail: 'Tensile elongation test underway in Lab 1' },
      { category: 'Lot 0300041180 (Machined Impeller)', value: '18 hrs Overdue', variance: 'Medium', detail: 'CMM measuring arm booked for aerospace batch' },
      { category: 'Lot 0300041185 (Crankshaft 500kW)', value: '14 hrs Overdue', variance: 'Medium', detail: 'Dynamic balancing rig maintenance completed' }
    ],
    recommendedSapActions: [
      { actionName: 'Inspection Lot Monitor', tcode: 'QA33', description: 'Filter inspection lots by planned start/end date expiration' },
      { actionName: 'Inspection Results Fast Entry', tcode: 'QE11', description: 'Expedite overdue characteristic data recording' }
    ]
  },
  {
    questionId: 'Q4',
    questionText: 'Show lots waiting for quality decisions.',
    category: 'Quality Inspections',
    sapSourceTables: ['QALS', 'QAVE', 'QAMR', 'QPAM'],
    summaryAnswer: 'There are 9 inspection lots where all characteristics results have been 100% recorded and verified, currently queued in the QA Supervisor worklist for final Usage Decision (UD) posting and stock transfer (Unrestricted, Blocked, or Scrap). Total batch stock value pending release is $412,000 USD.',
    keyInsights: [
      '9 lots ready for immediate Usage Decision posting.',
      '7 lots qualify for automatic Unrestricted Stock release (UD Code: A / Accepted).',
      '2 lots have characteristic non-conformances requiring deviation approval or concession (UD Code: R / Rejected or Concession).',
      'Average time in UD queue is 1.8 hours against a 4.0-hour SLA target.'
    ],
    qmMetrics: [
      { label: 'Waiting for UD', value: '9 Lots', status: 'positive' },
      { label: 'Qualified for Accept (A)', value: '7 Lots', status: 'positive' },
      { label: 'Non-Conformant Review', value: '2 Lots', status: 'warning' },
      { label: 'Total Value Pending', value: '$412,000', status: 'neutral' }
    ],
    breakdownData: [
      { category: 'Lot 0100098401 (Copper Wire Coil)', value: 'Accept (A) - 100% Pass', variance: 'Ready', detail: 'Release to Unrestricted Stock 0001 ($85,000)' },
      { category: 'Lot 0100098404 (Turbine Blades)', value: 'Accept (A) - 100% Pass', variance: 'Ready', detail: 'Release to Assembly Line 1 ($140,000)' },
      { category: 'Lot 0100098409 (Sealing Rings)', value: 'Reject (R) - Shore Hardness 62 vs 70', variance: 'Review Needed', detail: 'Generate QN Type Q2 / Supplier Return ($12,000)' },
      { category: 'Lot 0300041205 (Cast Casing C-10)', value: 'Accept w/ Concession', variance: 'Eng Review', detail: 'Surface roughness Ra 3.4 vs 3.2 max ($35,000)' }
    ],
    recommendedSapActions: [
      { actionName: 'Record Usage Decision', tcode: 'QA11', description: 'Post Usage Decision code, quality score, and stock postings' },
      { actionName: 'Collective Usage Decision', tcode: 'QA16', description: 'Execute automated collective usage decision for accepted lots' }
    ]
  },
  {
    questionId: 'Q5',
    questionText: 'Which inspection lots failed today?',
    category: 'Quality Inspections',
    sapSourceTables: ['QALS', 'QAVE', 'QAMR', 'QMEL', 'QMFE'],
    summaryAnswer: 'Today, 3 inspection lots failed quality specifications upon result evaluation: Lot 0100098409 (Sealing Rings - Hardness below spec), Lot 0300041195 (Machined Housing - Bore diameter out of tolerance by +0.08mm), and Lot 0100098412 (Electronic Sensor IC - Dielectric breakdown test failure). Quality Notifications Q2 and Q3 have been automatically triggered.',
    keyInsights: [
      '3 inspection lots failed today (10.7% lot rejection rate for the daily cohort).',
      'All 3 failed batches have been moved to Blocked Stock (Stock Type S -> B) via automated transfer posting.',
      'Quality Notification Q20019842 (Vendor Complaint) raised against Continental Seals.',
      'Internal Quality Notification Q30018721 created for rework routing on Line 3.'
    ],
    qmMetrics: [
      { label: 'Failed Lots Today', value: '3 Lots', status: 'negative' },
      { label: 'Rejected Volume', value: '1,450 PC', status: 'negative' },
      { label: 'Defect Notifications', value: '3 Created', status: 'warning' },
      { label: 'Stock Quarantined', value: '100% Blocked', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Lot 0100098409 (Sealing Rings)', value: 'Vendor: Continental Seals', variance: 'Failed Spec', detail: 'Char 0020 Hardness: 62 Shore A (Spec: 70±5)' },
      { category: 'Lot 0300041195 (Pump Housing H-20)', value: 'Line 3 / WC-CNC-02', variance: 'Failed Spec', detail: 'Char 0010 Bore Dia: 50.08mm (Spec: 50.00±0.02)' },
      { category: 'Lot 0100098412 (Pressure Sensor IC)', value: 'Vendor: MicroChip Tech', variance: 'Failed Spec', detail: 'Char 0040 Dielectric: Flashover at 450V (Spec: >1000V)' }
    ],
    recommendedSapActions: [
      { actionName: 'Display Quality Notification', tcode: 'QM03', description: 'Review defect details, task assignments, and vendor notification' },
      { actionName: 'Transfer Blocked Stock', tcode: 'MIGO', description: 'Post movement type 344 / 350 to quarantine storage location 0099' }
    ]
  },
  {
    questionId: 'Q6',
    questionText: 'Show inspection results by plant.',
    category: 'Quality Inspections',
    sapSourceTables: ['QALS', 'QAVE', 'T001W', 'MARC'],
    summaryAnswer: 'Inspection lot performance across active plants: Plant 1000 (Dallas HQ Manufacturing): 184 lots tested, 96.2% acceptance rate, avg inspection cycle time 3.4 hours. Plant 1010 (Austin Electronics): 142 lots tested, 98.6% acceptance rate, avg cycle time 2.1 hours. Plant 2000 (Hamburg Logistics): 86 lots tested, 94.8% acceptance rate.',
    keyInsights: [
      'Total 412 inspection lots processed across Plants 1000, 1010, and 2000 MTD.',
      'Plant 1010 achieved highest Quality Acceptance Index (98.6%) driven by automated SMT AOI optical testing.',
      'Plant 2000 has elevated inspection lead time (5.8 hours) due to bulk pallet sampling protocol.',
      'Overall corporate First-Pass Inspection Acceptance stands at 96.6%.'
    ],
    qmMetrics: [
      { label: 'Corporate Pass Rate', value: '96.6%', status: 'positive' },
      { label: 'Plant 1000 (Dallas)', value: '96.2% (184 Lots)', status: 'positive' },
      { label: 'Plant 1010 (Austin)', value: '98.6% (142 Lots)', status: 'positive' },
      { label: 'Plant 2000 (Hamburg)', value: '94.8% (86 Lots)', status: 'warning' }
    ],
    breakdownData: [
      { category: 'Plant 1000 (Mechanical Assembly)', value: '177 Accepted / 7 Rejected', variance: '96.2% Pass', detail: 'Lead time: 3.4h / 12 Open Lots' },
      { category: 'Plant 1010 (Electronics & PCB)', value: '140 Accepted / 2 Rejected', variance: '98.6% Pass', detail: 'Lead time: 2.1h / 4 Open Lots' },
      { category: 'Plant 2000 (Distribution & Packaging)', value: '81 Accepted / 5 Rejected', variance: '94.8% Pass', detail: 'Lead time: 5.8h / 6 Open Lots' }
    ],
    recommendedSapActions: [
      { actionName: 'Quality Inspection Overview', tcode: 'Fiori F2168', description: 'Compare cross-plant inspection throughput and lot status' },
      { actionName: 'Plant Inspection Statistics', tcode: 'MC.1', description: 'Analyze lot quantities, valuation distributions, and cycle times' }
    ]
  },
  {
    questionId: 'Q7',
    questionText: 'Which materials have the highest rejection rate?',
    category: 'Quality Inspections',
    sapSourceTables: ['QALS', 'QAVE', 'MARA', 'MAKT'],
    summaryAnswer: 'Over the last 90 days, the top 4 materials with the highest lot rejection rates in Plant 1000 are: 1) RAW-AL-440 (Die-Cast Aluminum Bracket, 14.2% rejection rate across 28 lots), 2) COMP-VALVE-09 (High-Pressure Solenoid Valve, 11.8% rejection rate across 34 lots), 3) ELEC-CAP-100 (Ceramic Capacitor, 9.4%), and 4) SEAL-NBR-80 (O-Ring Seal, 8.5%).',
    keyInsights: [
      'RAW-AL-440: Primary rejection cause is internal porosity detected during X-ray NDT inspection.',
      'COMP-VALVE-09: Rejection driven by micro-leakage at 350 bar hydrostatic pressure test.',
      'Supplier corrective action request (SCAR) issued to DieCast Solutions for material RAW-AL-440.',
      'Inspection severity level for top 2 materials transitioned from Normal to Tightened (QINF).'
    ],
    qmMetrics: [
      { label: 'Highest Rejection SKU', value: 'RAW-AL-440 (14.2%)', status: 'negative' },
      { label: 'Avg Material Reject', value: '3.4%', status: 'neutral' },
      { label: 'Tightened Inspection', value: '4 Materials', status: 'warning' },
      { label: 'SCARs Initiated', value: '3 Active', status: 'warning' }
    ],
    breakdownData: [
      { category: 'RAW-AL-440 (Alu Bracket)', value: '4 / 28 Lots Rejected (14.2%)', variance: 'High Risk', detail: 'DieCast Solutions / Defect: Porosity & Blowholes' },
      { category: 'COMP-VALVE-09 (Solenoid Valve)', value: '4 / 34 Lots Rejected (11.8%)', variance: 'High Risk', detail: 'FluidDynamics Corp / Defect: Pressure leak' },
      { category: 'ELEC-CAP-100 (Capacitor 100uF)', value: '5 / 53 Lots Rejected (9.4%)', variance: 'Medium Risk', detail: 'ElectroSem / Defect: ESR out of tolerance' },
      { category: 'SEAL-NBR-80 (O-Ring 80mm)', value: '4 / 47 Lots Rejected (8.5%)', variance: 'Medium Risk', detail: 'Continental Seals / Defect: Flash & Burrs' }
    ],
    recommendedSapActions: [
      { actionName: 'Quality Info Record: Procurement', tcode: 'QI02', description: 'Update inspection control, block vendor, or enforce tightened sampling' },
      { actionName: 'Material Inspection History', tcode: 'MCV1', description: 'Run longitudinal defect trend analysis per material master' }
    ]
  },
  {
    questionId: 'Q8',
    questionText: 'Show inspections waiting for sample collection.',
    category: 'Quality Inspections',
    sapSourceTables: ['QALS', 'QASR', 'QAMV', 'QASV'],
    summaryAnswer: 'There are currently 6 inspection lots waiting for physical sample collection and sample receipt confirmation at Goods Inward dock D-01/D-02. Total physical samples required: 42 units across 4 material classes. Sampling procedures comply with ISO 2859-1 (AQL 0.65 Level II Normal Inspection).',
    keyInsights: [
      '6 inspection lots in status CRTD (Created) awaiting sample drawing protocol confirmation.',
      'Dock D-01: 3 pallet lots of raw alloy bars requiring mechanical tensile coupon extraction.',
      'Dock D-02: 3 carton lots of electronic sub-components awaiting ESD cleanroom sample draw.',
      'Sampling tickets printed in SAP QM (Program RQPRPP00) and assigned to Sample Inspector Team A.'
    ],
    qmMetrics: [
      { label: 'Lots Awaiting Sample', value: '6 Lots', status: 'warning' },
      { label: 'Samples Required', value: '42 Physical Units', status: 'neutral' },
      { label: 'Sampling Standard', value: 'ISO 2859-1 AQL 0.65', status: 'positive' },
      { label: 'Sampling SLA', value: '< 2.0 hrs (Avg 1.1h)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Lot 0100098430 (Steel Bars)', value: '8 Samples needed (Dock D-01)', variance: 'In Progress', detail: 'Inspector: T. Vance / Coupon cut tool ready' },
      { category: 'Lot 0100098431 (Alloy Plate)', value: '5 Samples needed (Dock D-01)', variance: 'Pending Draw', detail: 'Inspector: T. Vance / Hardness & spectro' },
      { category: 'Lot 0100098435 (Micro-Sensors)', value: '13 Samples needed (Dock D-02)', variance: 'Cleanroom ESD', detail: 'Inspector: M. Chen / ESD pouch kit ready' },
      { category: 'Lot 0100098438 (Connectors)', value: '16 Samples needed (Dock D-02)', variance: 'Pending Draw', detail: 'Inspector: M. Chen / Pin contact test' }
    ],
    recommendedSapActions: [
      { actionName: 'Physical-Sample Drawing', tcode: 'QPR4', description: 'Confirm sample drawing and log physical sample container IDs' },
      { actionName: 'Sample Management Overview', tcode: 'QPR6', description: 'Monitor sample life cycle, storage locations, and test assignments' }
    ]
  },
  {
    questionId: 'Q9',
    questionText: 'Which inspection characteristics are failing most often?',
    category: 'Quality Inspections',
    sapSourceTables: ['QAMV', 'QAMR', 'QPMT', 'QPAM'],
    summaryAnswer: 'Statistical defect Pareto across 1,240 recorded inspection characteristics over the past 60 days reveals the top 4 recurring failure modes: 1) Dimensional Outer/Inner Diameter (Char 0010 - 38 failure events, 34.5% of total failures), 2) Surface Roughness Ra (Char 0020 - 24 events, 21.8%), 3) Hydrostatic Leakage at 300 Bar (Char 0040 - 18 events, 16.4%), and 4) Electrical Insulation Breakdown (Char 0030 - 14 events, 12.7%).',
    keyInsights: [
      'Top 2 mechanical characteristics (Diameter & Roughness) account for 56.3% of all test failures.',
      'Dimensional drift strongly correlates with CNC tool wear on Machining Centers MC-04 and MC-07.',
      'Surface roughness failures coincide with coolant degradation cycles (conductivity > 1200 uS).',
      'Automated SPC alert sent to Production Engineering to calibrate tool offset compensation.'
    ],
    qmMetrics: [
      { label: 'Top Failing Char', value: 'Bore/Shaft Diameter (34.5%)', status: 'negative' },
      { label: 'Total Failure Events', value: '110 Char Failures', status: 'warning' },
      { label: 'Pareto Concentration', value: 'Top 3 = 72.7%', status: 'warning' },
      { label: 'Cp/Cpk Capability', value: '1.12 (Target > 1.33)', status: 'warning' }
    ],
    breakdownData: [
      { category: 'Char 0010 (Bore / Shaft Diameter)', value: '38 Failures (34.5%)', variance: 'CNC Tool Wear', detail: 'Affected SKUs: P-100, P-200, HALB-40' },
      { category: 'Char 0020 (Surface Roughness Ra)', value: '24 Failures (21.8%)', variance: 'Coolant Flow', detail: 'Affected SKUs: C-400, M-50, SHAFT-12' },
      { category: 'Char 0040 (Pressure Leakage 300 Bar)', value: '18 Failures (16.4%)', variance: 'Seal Fitting', detail: 'Affected SKUs: VALVE-09, PUMP-HD' },
      { category: 'Char 0030 (Insulation Dielectric)', value: '14 Failures (12.7%)', variance: 'Moisture ingress', detail: 'Affected SKUs: ELEC-MOD-01, STATOR' }
    ],
    recommendedSapActions: [
      { actionName: 'Inspection Characteristics Analysis', tcode: 'MCV3', description: 'Run characteristic value distribution and capability histograms' },
      { actionName: 'Master Inspection Characteristic', tcode: 'QS23', description: 'Review master inspection characteristic tolerance limits and test procedures' }
    ]
  },
  {
    questionId: 'Q10',
    questionText: 'Which inspection lots require immediate attention?',
    category: 'Quality Inspections',
    sapSourceTables: ['QALS', 'QAVE', 'QMEL', 'MARA', 'VBAK'],
    summaryAnswer: '4 inspection lots require immediate executive and engineering intervention: 1) Lot 0100098310 ($120k titanium alloy on critical production freeze), 2) Lot 0400019842 (Finished pumps linked to expedited customer Sales Order 700142 with delivery today 18:00), 3) Lot 0300041195 (Active CNC Line 3 stoppage due to bore deviation), and 4) Lot 0100098409 (High-priority supplier non-conformance with assembly line out-of-stock risk in 4 hours).',
    keyInsights: [
      'Lot 0400019842 tied directly to Siemens Energy contract ($380,000 order value); UD priority 1.',
      'Lot 0300041195 causing Line 3 downtime ($1,850/hr downtime cost); rework routing initiated.',
      'Lot 0100098409: Emergency alternate batch swap from Storage Location 0002 executed to prevent line stop.',
      'Quality Manager override and concession workflow staged in Fiori My Inbox.'
    ],
    qmMetrics: [
      { label: 'Immediate Attention', value: '4 Critical Lots', status: 'negative' },
      { label: 'Customer Order At Risk', value: '$380,000 USD', status: 'negative' },
      { label: 'Active Line Stoppage', value: 'Line 3 (1.2h)', status: 'negative' },
      { label: 'Mitigation Actions', value: '4 Deployed', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Lot 0400019842 (Pump 500kW)', value: 'Urgent Customer Delivery', variance: 'SO 700142', detail: 'Final test report verified; awaiting supervisor e-signature in QA11' },
      { category: 'Lot 0300041195 (Housing H-20)', value: 'Production Stoppage', variance: 'Line 3 Held', detail: 'Manufacturing Engineer adjusting CNC G-code tool offset' },
      { category: 'Lot 0100098310 (Titanium Rods)', value: 'Material Blocked', variance: '72h Overdue', detail: 'Lab spectrometer calibration completed; re-testing coupon' },
      { category: 'Lot 0100098409 (Sealing Rings)', value: 'Supply Shortage', variance: 'Stock Stockout', detail: 'Substitute batch B-9880 released from warehouse buffer' }
    ],
    recommendedSapActions: [
      { actionName: 'Process Inspection Lot Fast-Track', tcode: 'QA11', description: 'Execute expedited Usage Decision with electronic signature' },
      { actionName: 'Quality Notification Cockpit', tcode: 'QM02', description: 'Assign immediate containment tasks and material dispositions' }
    ]
  },

  // =========================================================================
  // PILLAR 2: DEFECTS & NON-CONFORMANCE (Q11 - Q20)
  // =========================================================================
  {
    questionId: 'Q11',
    questionText: 'Show all open quality notifications.',
    category: 'Defects & Non-Conformance',
    sapSourceTables: ['QMEL', 'QMFE', 'QMMA', 'QMSM', 'TJ02T'],
    summaryAnswer: 'There are currently 24 open quality notifications across Plant 1000: 10 Customer Complaints (Type Q1 - External), 9 Vendor Non-Conformances (Type Q2 - Inbound), and 5 Internal Production Defects (Type Q3 - In-Process). 16 notifications are in active task processing (status APRV/NOPR) and 8 are pending root-cause investigation.',
    keyInsights: [
      '24 total active quality notifications across corporate plants.',
      'Type Q1 (Customer Complaints): 10 active; 2 tagged Priority 1 (Very High).',
      'Type Q2 (Vendor Complaints): 9 active; $184,000 in supplier debit memos pending.',
      'Type Q3 (Internal Defects): 5 active; all localized to Machining and Electronics assembly.',
      'Average notification cycle time is 6.2 days against an 8.0-day target.'
    ],
    qmMetrics: [
      { label: 'Open Notifications', value: '24 Open', status: 'warning' },
      { label: 'Customer (Q1)', value: '10 Cases', status: 'warning' },
      { label: 'Vendor (Q2)', value: '9 Cases', status: 'neutral' },
      { label: 'Internal (Q3)', value: '5 Cases', status: 'positive' }
    ],
    breakdownData: [
      { category: 'QN 10008920 (Customer: ABB Power)', value: 'Type Q1 / Priority 1', variance: 'In Progress', detail: 'Vibration noise on Pump P-100 / 8D Stage D3 containment' },
      { category: 'QN 10008924 (Customer: Siemens)', value: 'Type Q1 / Priority 2', variance: 'Investigating', detail: 'Packaging scuff marks on control cabinet door' },
      { category: 'QN 20019842 (Vendor: Conti Seals)', value: 'Type Q2 / Priority 2', variance: 'Awaiting 8D', detail: 'Defective Shore hardness on batch B-9901 / Debit Memo issued' },
      { category: 'QN 30018721 (Internal: Line 3)', value: 'Type Q3 / Priority 2', variance: 'Rework Active', detail: 'Bore diameter deviation on 45 housings' }
    ],
    recommendedSapActions: [
      { actionName: 'Quality Notification Worklist', tcode: 'QM11', description: 'Display and filter open notifications by notification type and status' },
      { actionName: 'Change Quality Notification', tcode: 'QM02', description: 'Update tasks, activities, root cause codes, and corrective actions' }
    ]
  },
  {
    questionId: 'Q12',
    questionText: 'Which quality notifications are overdue?',
    category: 'Defects & Non-Conformance',
    sapSourceTables: ['QMEL', 'QMSM', 'QMMA', 'JEST'],
    summaryAnswer: '4 quality notifications have exceeded their resolution SLA target: QN 10008890 (Customer Complaint - General Electric, 14 days overdue on 8D step D5 Root Cause), QN 20019798 (Vendor Non-conformance - Bosch Rexroth, 9 days overdue on replacement shipment), and 2 internal defect reports overdue on corrective action task signoff.',
    keyInsights: [
      '4 notifications overdue (>10 days for customer complaints, >14 days for vendor 8D).',
      'QN 10008890: Metallurgical lab analysis delayed root-cause conclusion on cracked impeller blade.',
      'QN 20019798: Supplier 8D report received; awaiting QM Engineer verification of containment effectiveness.',
      'Automated email escalation triggered to Quality Director and Lead Quality Engineers.'
    ],
    qmMetrics: [
      { label: 'Overdue Notifications', value: '4 Cases', status: 'negative' },
      { label: 'Avg Overdue Days', value: '8.5 Days', status: 'negative' },
      { label: 'Customer Impact', value: '2 Major Accounts', status: 'negative' },
      { label: 'Escalations Active', value: 'Level 2 Triggered', status: 'warning' }
    ],
    breakdownData: [
      { category: 'QN 10008890 (GE Energy)', value: '14 Days Overdue (Type Q1)', variance: 'Critical', detail: 'Impeller blade micro-crack / Lab scanning electron microscope study' },
      { category: 'QN 20019798 (Bosch Rexroth)', value: '9 Days Overdue (Type Q2)', variance: 'High', detail: 'Proportional valve flow drift / Awaiting supplier replacement batch' },
      { category: 'QN 30018690 (Line 1 Stamping)', value: '6 Days Overdue (Type Q3)', variance: 'Medium', detail: 'Die burr formation / Tooling maintenance task signoff pending' },
      { category: 'QN 30018695 (Line 2 Soldering)', value: '5 Days Overdue (Type Q3)', variance: 'Medium', detail: 'Wave solder solder-bridge defect / Profile validation required' }
    ],
    recommendedSapActions: [
      { actionName: 'Notification Task Monitor', tcode: 'QM15', description: 'Inspect outstanding and overdue quality notification tasks' },
      { actionName: 'Quality Notification Workflow', tcode: 'SWI1', description: 'Track workflow approval bottlenecks and reassignment' }
    ]
  },
  {
    questionId: 'Q13',
    questionText: 'Show recurring defects.',
    category: 'Defects & Non-Conformance',
    sapSourceTables: ['QMFE', 'QMUR', 'QMEL', 'QPAM'],
    summaryAnswer: 'Defect trend analysis across the last 180 days identifies 3 persistent recurring defect clusters: 1) Code 0102 "Bore Diameter Tolerance Drift" (14 occurrences across 6 production orders), 2) Code 0304 "Hydraulic Fitting Micro-Leakage" (11 occurrences across 4 customer complaint reports), and 3) Code 0501 "Solder Joint Bridging on PCB-400" (9 occurrences during wave soldering).',
    keyInsights: [
      'Bore Diameter Drift (Code 0102) occurs systematically after 4,500 machining cycles on CNC-02.',
      'Hydraulic Leakage (Code 0304) linked to O-ring pinching during manual assembly step 0040.',
      'Solder Bridging (Code 0501) correlated with thermal profile fluctuation during flux pre-heating.',
      'Engineering Change Request (ECR) initiated to replace manual assembly with guide-jig fixture.'
    ],
    qmMetrics: [
      { label: 'Recurring Defect Clusters', value: '3 Active Patterns', status: 'warning' },
      { label: 'Total Recurring Incidents', value: '34 Events', status: 'warning' },
      { label: 'Cost of Poor Quality', value: '$84,200 YTD', status: 'negative' },
      { label: 'Poka-Yoke Fixtures', value: '2 in Development', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Defect 0102 (Bore Diameter Drift)', value: '14 Occurrences ($36,400)', variance: 'Tooling Wear', detail: 'CNC-02 / Preventative tool life offset changed to 4,000 cycles' },
      { category: 'Defect 0304 (Fitting Leakage)', value: '11 Occurrences ($28,600)', variance: 'Assembly Error', detail: 'Workstation 4 / Ergonomic assembly jig designed to prevent pinch' },
      { category: 'Defect 0501 (Solder Bridging)', value: '9 Occurrences ($19,200)', variance: 'Thermal Control', detail: 'SMT Line / Closed-loop nitrogen tunnel temperature sensor installed' }
    ],
    recommendedSapActions: [
      { actionName: 'Defect Analysis Pareto', tcode: 'MCV2', description: 'Analyze defect codes by material, work center, and defect frequency' },
      { actionName: 'Maintain Defect Catalog', tcode: 'QS41', description: 'Review Catalog Type 9 (Defect Types) and Catalog Type 8 (Causes)' }
    ]
  },
  {
    questionId: 'Q14',
    questionText: 'Which products have the highest defect rate?',
    category: 'Defects & Non-Conformance',
    sapSourceTables: ['QMFE', 'QALS', 'MARA', 'MAKT', 'AFPO'],
    summaryAnswer: 'The top 4 finished and semi-finished products with the highest overall defect rates (ppm / percentage of confirmed production quantity) are: 1) FG-PUMP-500kW (Industrial Pump 500kW, 4.8% defect rate / 48,000 ppm), 2) HALB-ROTOR-80 (High-Speed Rotor Assembly, 3.9%), 3) FG-COMP-C400 (Gas Compressor C-400, 3.2%), and 4) ELEC-DRIVE-V10 (Variable Frequency Inverter, 2.7%).',
    keyInsights: [
      'FG-PUMP-500kW defect rate is driven primarily by final hydrostatic pressure test seal leakage.',
      'HALB-ROTOR-80 defect rate is concentrated in dynamic unbalance (>2.5 g-mm tolerance limit).',
      'Target plant average defect rate is <1.5% (15,000 ppm).',
      'Lean Six Sigma Black Belt project LSS-2026-04 initiated targeting FG-PUMP-500kW assembly variance.'
    ],
    qmMetrics: [
      { label: 'Highest Defect SKU', value: 'FG-PUMP-500kW (4.8%)', status: 'negative' },
      { label: 'Plant Target Defect', value: '< 1.5% (15k ppm)', status: 'positive' },
      { label: 'Six Sigma Projects', value: '2 Active', status: 'positive' },
      { label: 'Yield Improvement', value: '+0.6% vs Q1', status: 'positive' }
    ],
    breakdownData: [
      { category: 'FG-PUMP-500kW (Industrial Pump)', value: '4.8% Defect (48k ppm)', variance: 'Critical', detail: '48 defective units out of 1,000 produced / Leakage & vibration' },
      { category: 'HALB-ROTOR-80 (Rotor Assembly)', value: '3.9% Defect (39k ppm)', variance: 'High', detail: '58 defective units out of 1,500 produced / Balancing runout' },
      { category: 'FG-COMP-C400 (Gas Compressor)', value: '3.2% Defect (32k ppm)', variance: 'Medium', detail: '26 defective units out of 800 produced / Valve seating' },
      { category: 'ELEC-DRIVE-V10 (Inverter Drive)', value: '2.7% Defect (27k ppm)', variance: 'Medium', detail: '54 defective units out of 2,000 produced / Firmware & thermal' }
    ],
    recommendedSapActions: [
      { actionName: 'Material Defect Pareto', tcode: 'MCV1', description: 'Review PPM trends and defect distributions per material' },
      { actionName: 'Production Scrap & Defect Report', tcode: 'COOIS', description: 'Examine scrap confirmation records and rework hours' }
    ]
  },
  {
    questionId: 'Q15',
    questionText: 'Show supplier-related defects.',
    category: 'Defects & Non-Conformance',
    sapSourceTables: ['QMEL', 'QMFE', 'LFA1', 'EKKO', 'QINF'],
    summaryAnswer: 'There are 12 active supplier-related quality defect cases across Plant 1000 accounting for $142,800 in quarantined goods: Continental Seals ($34,500 - Gasket hardness non-conformance), DieCast Solutions ($48,200 - Porosity in aluminum housings), MicroChip Tech ($28,600 - Sensor flashover voltage), and SKF Bearings ($31,500 - Micro-pitting on roller cage surface).',
    keyInsights: [
      '12 active Vendor Quality Notifications (Type Q2) logged in S/4HANA.',
      'DieCast Solutions represents the largest financial defect risk ($48,200 across 2 batches).',
      'Supplier Quality Engineer (SQE) has initiated 4 formal 8D Corrective Action workflows.',
      'Automatic payment block (Z-block in MR8M) placed on defective invoice items.'
    ],
    qmMetrics: [
      { label: 'Vendor Defect Cases', value: '12 Active Q2s', status: 'warning' },
      { label: 'Quarantined Value', value: '$142,800 USD', status: 'negative' },
      { label: 'Suppliers Affected', value: '4 Key Vendors', status: 'warning' },
      { label: 'Payment Blocks', value: '4 PO Invoices', status: 'positive' }
    ],
    breakdownData: [
      { category: 'DieCast Solutions (Vendor 100420)', value: '$48,200 Quarantined (2 Lots)', variance: 'Critical', detail: 'Aluminum casting porosity / 8D Stage D4 Root Cause analysis' },
      { category: 'Continental Seals (Vendor 100588)', value: '$34,500 Quarantined (3 Lots)', variance: 'High', detail: 'Polymer durometer out of spec / Debit Memo DM-9042 issued' },
      { category: 'SKF Bearings (Vendor 100112)', value: '$31,500 Quarantined (1 Lot)', variance: 'Medium', detail: 'Surface micro-pitting / Supplier replacement batch en route' },
      { category: 'MicroChip Tech (Vendor 100930)', value: '$28,600 Quarantined (2 Lots)', variance: 'Medium', detail: 'Dielectric breakdown at 450V / Lab root cause isolation' }
    ],
    recommendedSapActions: [
      { actionName: 'Vendor Notification Cockpit', tcode: 'QM02', description: 'Review vendor 8D progress, debit memos, and return deliveries' },
      { actionName: 'Supplier Quality Info Record', tcode: 'QI03', description: 'Inspect procurement block status, certificate requirements, and vendor audits' }
    ]
  },
  {
    questionId: 'Q16',
    questionText: 'Which customer complaints remain unresolved?',
    category: 'Defects & Non-Conformance',
    sapSourceTables: ['QMEL', 'QMFE', 'KNA1', 'VBAK', 'VBFA'],
    summaryAnswer: '10 customer complaint notifications (Type Q1) are currently open in S/4HANA: 2 Priority 1 cases (ABB Power Systems - Pump vibration noise; Siemens Energy - Control cabinet scuffing), 5 Priority 2 cases under laboratory failure replication, and 3 Priority 3 minor documentation/labeling inquiries. 6 out of 10 cases have containment actions (D3) completed within 24 hours.',
    keyInsights: [
      '10 open customer complaint notifications across 7 enterprise accounts.',
      'ABB Power Systems case (QN 10008920): Immediate replacement pump shipped under RMA 400192; defective unit received for teardown.',
      'Average customer response time is 18 hours (well within 24h ISO 9001 customer charter).',
      'No safety recall or field alert thresholds triggered.'
    ],
    qmMetrics: [
      { label: 'Open Complaints', value: '10 Cases', status: 'warning' },
      { label: 'Priority 1 (Urgent)', value: '2 Cases', status: 'negative' },
      { label: 'Containment (D3) Met', value: '100% (within 24h)', status: 'positive' },
      { label: 'Avg Resolution Time', value: '4.8 Days', status: 'positive' }
    ],
    breakdownData: [
      { category: 'ABB Power Systems (QN 10008920)', value: 'Priority 1 - Vibration Noise', variance: 'Teardown Active', detail: 'Replacement pump shipped; Root cause investigation on impeller balance' },
      { category: 'Siemens Energy (QN 10008924)', value: 'Priority 1 - Cabinet Finish', variance: 'Containment Done', detail: 'On-site touch-up technician dispatched; packaging foam redesigned' },
      { category: 'Baker Hughes (QN 10008930)', value: 'Priority 2 - Seal Weepage', variance: 'Lab Testing', detail: 'Fluid compatibility test with customer lubricant batch' },
      { category: 'Emerson Electric (QN 10008935)', value: 'Priority 2 - Modbus Timeout', variance: 'Firmware Patch', detail: 'Firmware v2.41 patch released to customer engineering team' }
    ],
    recommendedSapActions: [
      { actionName: 'Customer Notification Monitor', tcode: 'QM11', description: 'Filter and track customer complaint resolution milestones' },
      { actionName: '8D Report Processing', tcode: 'QM02', description: 'Update customer 8D stages D1 through D8 and generate official PDF summary' }
    ]
  },
  {
    questionId: 'Q17',
    questionText: 'Show production defects by work center.',
    category: 'Defects & Non-Conformance',
    sapSourceTables: ['QMFE', 'CRHD', 'AFKO', 'AFRU', 'TJ02T'],
    summaryAnswer: 'Analysis of 184 internal defect confirmations across Plant 1000 work centers over the last 30 days reveals highest defect concentration in: 1) WC-CNC-02 (54 defects, 29.3% - Machining Bore/Thread Runout), 2) WC-ASSY-01 (42 defects, 22.8% - O-ring pinching and fastener torque variance), 3) WC-SMT-03 (36 defects, 19.6% - Solder bridges), and 4) WC-WELD-01 (28 defects, 15.2% - Weld porosity).',
    keyInsights: [
      'WC-CNC-02 accounts for nearly 30% of all internal defect events.',
      'Spindle vibration diagnostics on CNC-02 identified bearing runout exceeding 0.015mm; scheduled for spindle rebuild this weekend.',
      'WC-ASSY-01 torque drift resolved by deploying digital smart torque wrenches with automatic PLC interlock.',
      'Welding defect rate dropped 40% following implementation of automated argon shielding gas flow controller.'
    ],
    qmMetrics: [
      { label: 'Top Defect Work Center', value: 'WC-CNC-02 (29.3%)', status: 'negative' },
      { label: 'Total Internal Defects', value: '184 Events (30d)', status: 'warning' },
      { label: 'Tooling Actions', value: 'Spindle Rebuild Scheduled', status: 'positive' },
      { label: 'Digital Interlocks', value: 'Smart Wrenches Active', status: 'positive' }
    ],
    breakdownData: [
      { category: 'WC-CNC-02 (Heavy Machining)', value: '54 Defects (29.3%)', variance: 'Spindle Runout', detail: 'Bore diameter and thread pitch defects / Spindle overhaul planned' },
      { category: 'WC-ASSY-01 (Main Assembly)', value: '42 Defects (22.8%)', variance: 'Fastener Torque', detail: 'Torque drift / Smart Bluetooth torque tools deployed' },
      { category: 'WC-SMT-03 (Electronics SMT)', value: '36 Defects (19.6%)', variance: 'Solder Bridging', detail: 'Stencil wipe frequency increased from 5 to 3 PCB cycles' },
      { category: 'WC-WELD-01 (Robotic Welding)', value: '28 Defects (15.2%)', variance: 'Shielding Gas', detail: 'Argon gas sensor installed; weld porosity reduced to 0.4%' }
    ],
    recommendedSapActions: [
      { actionName: 'Work Center Capacity & Quality', tcode: 'CM01', description: 'Review work center workload, maintenance windows, and defect rates' },
      { actionName: 'Quality Defects by Operation', tcode: 'MCV2', description: 'Analyze defect codes stratified by work center and routing operation' }
    ]
  },
  {
    questionId: 'Q18',
    questionText: 'Which defects are affecting shipments?',
    category: 'Defects & Non-Conformance',
    sapSourceTables: ['QMEL', 'QALS', 'LIKP', 'LIPS', 'VBAK'],
    summaryAnswer: 'Currently, 2 quality defect holds are directly impacting customer outbound deliveries: 1) Delivery 80019234 (Siemens Energy - 4 Industrial Pumps held due to final test bench pressure relief valve calibration hold; impact $380,000 USD), and 2) Delivery 80019240 (Baker Hughes - 12 Control Units held for firmware flash verification; impact $74,000 USD).',
    keyInsights: [
      '2 outbound deliveries currently on Quality Shipping Block (Delivery Block 05 in LIKP).',
      'Delivery 80019234: Recalibration of pressure relief valve in progress; scheduled release at 16:30 today with zero customer delivery slip.',
      'Delivery 80019240: Automated firmware batch flashing 90% complete in Shipping Bay 3.',
      'Total quarantined shipment value is $454,000 USD across 16 finished units.'
    ],
    qmMetrics: [
      { label: 'Deliveries on Hold', value: '2 Deliveries', status: 'negative' },
      { label: 'Blocked Shipment Value', value: '$454,000 USD', status: 'negative' },
      { label: 'Est. Release Today', value: '100% by 17:00', status: 'positive' },
      { label: 'OTIF Impact', value: 'Zero Slippage', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Delivery 80019234 (Siemens Energy)', value: '$380,000 Blocked', variance: 'Relief Valve Calibration', detail: 'SO 700142 / 4 Units / Release target 16:30 today' },
      { category: 'Delivery 80019240 (Baker Hughes)', value: '$74,000 Blocked', variance: 'Firmware Check', detail: 'SO 700148 / 12 Units / Automated test finishing in Bay 3' }
    ],
    recommendedSapActions: [
      { actionName: 'Outbound Delivery Monitor', tcode: 'VL06O', description: 'Check shipping blocks, picking status, and PGI readiness' },
      { actionName: 'Release Delivery Quality Block', tcode: 'VL02N', description: 'Remove Quality Block 05 upon Usage Decision verification' }
    ]
  },
  {
    questionId: 'Q19',
    questionText: 'Show critical non-conformance reports.',
    category: 'Defects & Non-Conformance',
    sapSourceTables: ['QMEL', 'QMFE', 'QMSM', 'TJ02T'],
    summaryAnswer: 'There are 3 Critical Non-Conformance Reports (NCRs - Severity Class 1) currently open in Plant 1000: NCR-2026-088 (Alloy raw material tensile strength 18% below ASME specification), NCR-2026-092 (Titanium impeller weld crack identified via ultrasonic NDT), and NCR-2026-095 (High-voltage dielectric flashover during customer factory acceptance test).',
    keyInsights: [
      '3 Severity Class 1 NCRs with executive oversight and containment safeguards.',
      'NCR-2026-088: Entire supplier lot of 45 tons quarantined in yard Y-04; vendor credit claim filed.',
      'NCR-2026-092: Ultrasonic NDT 100% screening initiated across all 60 serialized impeller rotors.',
      'NCR-2026-095: High-voltage creepage distance design modification approved by Chief Systems Engineer.'
    ],
    qmMetrics: [
      { label: 'Critical NCRs (Class 1)', value: '3 Active', status: 'negative' },
      { label: 'Quarantined Material', value: '45 Tons + 60 Rotors', status: 'negative' },
      { label: 'Material Review Board', value: 'MRB Convened', status: 'positive' },
      { label: 'Regulatory Risk', value: 'Zero (ISO/ASME compliant)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'NCR-2026-088 (Tensile Strength)', value: 'Alloy Bar ASTM A479', variance: '18% Below Spec', detail: 'Vendor: ThyssenKrupp / Scrap & Return to Vendor' },
      { category: 'NCR-2026-092 (Weld Micro-Crack)', value: 'Impeller Rotor Ti-6Al-4V', variance: 'NDT Indication', detail: 'Line 1 / Automated TIG weld parameters updated' },
      { category: 'NCR-2026-095 (Dielectric Flashover)', value: 'HV Terminal Block', variance: 'Creepage Margin', detail: 'Sub-assembly / Molded insulator barrier redesigned' }
    ],
    recommendedSapActions: [
      { actionName: 'Material Review Board Cockpit', tcode: 'QM02', description: 'Record MRB disposition: Scrap, Rework, Return to Vendor, or Concession' },
      { actionName: 'Display Quality Notification History', tcode: 'QM13', description: 'Review chronological audit trail and root-cause evidence' }
    ]
  },
  {
    questionId: 'Q20',
    questionText: 'Explain why Product X failed inspection.',
    category: 'Defects & Non-Conformance',
    sapSourceTables: ['QALS', 'QAMV', 'QAMR', 'QMFE', 'QMUR'],
    summaryAnswer: 'For the most recent failed inspection lot on Product FG-PUMP-500kW (Lot 0400019820, Batch B-8841), inspection failure was triggered by out-of-spec test results on Characteristic 0040 "Hydrostatic Pressure Hold at 350 Bar": measured pressure drop was 8.4 Bar over 10 minutes (Specification Limit: max 2.0 Bar drop). Teardown analysis isolated micro-extrusion of the mechanical seal O-ring caused by 0.05mm chamfer mismatch on the front gland plate.',
    keyInsights: [
      'Inspection Lot 0400019820 failed Characteristic 0040 (Hydrostatic Pressure Hold).',
      'Measured parameter: 8.4 Bar pressure drop vs Specification Upper Limit of 2.0 Bar.',
      'Root cause: Front gland plate chamfer tooling wore down from 45° to 38°, pinching the Viton seal.',
      'Corrective action: CNC Chamfer tool replaced; gland plate reworked and batch successfully re-tested.'
    ],
    qmMetrics: [
      { label: 'Failed Product', value: 'FG-PUMP-500kW', status: 'negative' },
      { label: 'Failed Characteristic', value: 'Char 0040 (Pressure)', status: 'negative' },
      { label: 'Measured Value', value: '8.4 Bar drop (Max 2.0)', status: 'negative' },
      { label: 'Root Cause Status', value: 'Isolated & Remediated', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Char 0010 (Flow Rate at 1800 RPM)', value: '452 m³/h (Spec: 450±20)', variance: 'Passed', detail: 'Conformant performance' },
      { category: 'Char 0020 (Dynamic Vibration RMS)', value: '1.4 mm/s (Spec: < 2.2)', variance: 'Passed', detail: 'Conformant ISO 10816-3' },
      { category: 'Char 0030 (Motor Current Draw)', value: '78.2 A (Spec: 80.0±5.0)', variance: 'Passed', detail: 'Conformant electrical load' },
      { category: 'Char 0040 (Hydrostatic Seal Hold)', value: '8.4 Bar Drop (Spec: < 2.0)', variance: 'Failed (Root Cause)', detail: 'Gland plate chamfer mismatch (0.05mm)' }
    ],
    recommendedSapActions: [
      { actionName: 'Display Inspection Results', tcode: 'QE13', description: 'Review detailed quantitative and qualitative test logs per sample' },
      { actionName: 'Inspection Lot Defect Log', tcode: 'QA03', description: 'Inspect attached defect records and usage decision rejection notes' }
    ]
  },

  // =========================================================================
  // PILLAR 3: QUALITY NOTIFICATIONS & CORRECTIVE ACTIONS (Q21 - Q25)
  // =========================================================================
  {
    questionId: 'Q21',
    questionText: 'Show all CAPA (Corrective and Preventive Actions).',
    category: 'Quality Notifications & Corrective Actions',
    sapSourceTables: ['QMSM', 'QMMA', 'QMEL', 'TJ02T'],
    summaryAnswer: 'There are currently 16 active CAPA initiatives registered in S/4HANA across Plant 1000 and Plant 1010: 8 Corrective Actions (addressing active non-conformances), 5 Preventive Actions (derived from FMEA risk mitigations), and 3 Continuous Improvement projects. 11 CAPAs are in active implementation, 3 are in effectiveness verification, and 2 are pending management signoff.',
    keyInsights: [
      '16 total enterprise CAPA records tracked in S/4HANA QM Task Engine.',
      '8 Corrective Actions (CARs): 100% tied to root causes verified in 8D reports.',
      '5 Preventive Actions (PARs): Proactive tool wear alarms and poke-yoke sensors.',
      'Average CAPA implementation cycle time is 22 days against a 30-day industry benchmark.'
    ],
    qmMetrics: [
      { label: 'Active CAPA Records', value: '16 CAPAs', status: 'positive' },
      { label: 'Corrective (CAR)', value: '8 Actions', status: 'neutral' },
      { label: 'Preventive (PAR)', value: '5 Actions', status: 'positive' },
      { label: 'In Verification', value: '3 Actions', status: 'positive' }
    ],
    breakdownData: [
      { category: 'CAPA-2026-034 (CNC-02 Spindle Vibration)', value: 'Status: In Implementation', variance: 'Due: 5 Days', detail: 'Spindle overhaul + automated accelerometers installed' },
      { category: 'CAPA-2026-038 (Assembly O-Ring Pinching)', value: 'Status: In Verification', variance: 'Due: 12 Days', detail: '3D printed assembly alignment guide fixture validated' },
      { category: 'CAPA-2026-041 (DieCast Aluminum Porosity)', value: 'Status: In Implementation', variance: 'Due: 18 Days', detail: 'Vendor vacuum-assisted casting tooling commissioned' },
      { category: 'CAPA-2026-044 (Wave Solder Bridging)', value: 'Status: Completed (Verified)', variance: 'Signoff', detail: 'Nitrogen pre-heat profile optimized; zero defects in 14 days' }
    ],
    recommendedSapActions: [
      { actionName: 'CAPA Task Worklist', tcode: 'QM15', description: 'Display and execute outstanding corrective and preventive action items' },
      { actionName: 'Audit Management Cockpit', tcode: 'PLMD_AUDIT', description: 'Link CAPAs to internal quality audits and ISO 9001 compliance' }
    ]
  },
  {
    questionId: 'Q22',
    questionText: 'Which CAPAs are overdue?',
    category: 'Quality Notifications & Corrective Actions',
    sapSourceTables: ['QMSM', 'QMEL', 'TJ02T', 'USR02'],
    summaryAnswer: '2 CAPA actions have passed their planned completion deadlines: 1) CAPA-2026-028 (Automated Torque Calibration Rig on Line 1 - 8 days overdue awaiting supplier software driver update), and 2) CAPA-2026-031 (Supplier Quality Agreement update with MicroChip Tech - 5 days overdue awaiting legal counterpart review).',
    keyInsights: [
      '2 overdue CAPAs out of 16 active records (12.5% overdue rate).',
      'CAPA-2026-028: Software driver received today; installation scheduled for tomorrow morning.',
      'CAPA-2026-031: Escalated to Procurement Legal Counsel for fast-track signature.',
      'No safety-critical or regulatory non-compliance risks triggered by the variance.'
    ],
    qmMetrics: [
      { label: 'Overdue CAPAs', value: '2 Actions', status: 'warning' },
      { label: 'Avg Delay', value: '6.5 Days', status: 'warning' },
      { label: 'Resolution Target', value: '< 48 Hours', status: 'positive' },
      { label: 'Compliance Impact', value: 'Zero Non-Conformances', status: 'positive' }
    ],
    breakdownData: [
      { category: 'CAPA-2026-028 (Torque Tool Firmware)', value: '8 Days Overdue', variance: 'Medium', detail: 'Owner: R. Miller (Mfg Eng) / Driver patch received' },
      { category: 'CAPA-2026-031 (Supplier Quality Agreement)', value: '5 Days Overdue', variance: 'Low', detail: 'Owner: S. Patel (Procurement) / Legal review pending' }
    ],
    recommendedSapActions: [
      { actionName: 'Process Overdue Tasks', tcode: 'QM02', description: 'Update task planned finish dates and log justification notes' },
      { actionName: 'Task Escalation Monitor', tcode: 'QM15', description: 'Review task owner workloads and automated notification triggers' }
    ]
  },
  {
    questionId: 'Q23',
    questionText: 'Which corrective actions are incomplete?',
    category: 'Quality Notifications & Corrective Actions',
    sapSourceTables: ['QMSM', 'QMMA', 'QMEL'],
    summaryAnswer: 'There are 5 corrective action tasks currently in incomplete / active execution status: Task 0010 (Tooling rebuild on CNC-02 - 75% complete), Task 0020 (Poka-yoke jig testing on Workstation 4 - 60% complete), Task 0030 (Operator re-certification on wave solder profile - 50% complete), Task 0040 (Vacuum die-casting trial run at vendor - 40% complete), and Task 0050 (Firmware v2.42 regression testing - 80% complete).',
    keyInsights: [
      '5 active corrective tasks advancing on schedule across manufacturing and engineering teams.',
      'All 5 tasks have designated engineering owners and defined milestone verification criteria.',
      'Completion of all 5 tasks is projected within the next 10 business days.',
      'Estimated annualized scrap and rework savings upon full deployment: $118,000 USD.'
    ],
    qmMetrics: [
      { label: 'Incomplete Tasks', value: '5 Tasks', status: 'neutral' },
      { label: 'Avg Progress', value: '61.0%', status: 'positive' },
      { label: 'Target Completion', value: '10 Days', status: 'positive' },
      { label: 'Projected Savings', value: '$118,000 / yr', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Task 0010 (CNC-02 Spindle Rebuild)', value: '75% Complete', variance: 'On Track', detail: 'Assembly finish: Friday / Spindle bearings fitted' },
      { category: 'Task 0020 (Assembly Jig Validation)', value: '60% Complete', variance: 'On Track', detail: '30 trial assemblies completed with 0 O-ring pinches' },
      { category: 'Task 0030 (Wave Solder Training)', value: '50% Complete', variance: 'On Track', detail: 'Shift 1 certified; Shift 2 training tomorrow' },
      { category: 'Task 0040 (Vendor Casting Tool Trial)', value: '40% Complete', variance: 'On Track', detail: 'Sample coupons dispatched for X-ray NDT' },
      { category: 'Task 0050 (Firmware v2.42 Test)', value: '80% Complete', variance: 'Ahead', detail: 'Stress testing Modbus communication pass rate 100%' }
    ],
    recommendedSapActions: [
      { actionName: 'Complete Notification Task', tcode: 'QM02', description: 'Record task actual completion date and mark task status TSCO (Task Completed)' },
      { actionName: 'Verify Action Effectiveness', tcode: 'QM02', description: 'Log post-implementation defect rates before closing parent notification' }
    ]
  },
  {
    questionId: 'Q24',
    questionText: 'Show root causes for this defect.',
    category: 'Quality Notifications & Corrective Actions',
    sapSourceTables: ['QMUR', 'QMFE', 'QMEL', 'QPAM'],
    summaryAnswer: 'Root cause analysis (Ishikawa Fishbone & 5-Why Analysis) for Defect 0102 "Bore Diameter Deviation on Pump Housing H-20": 1) Machine: CNC spindle bearing thermal expansion (+0.025mm drift after 4 continuous hours of roughing cut), 2) Method: Roughing and finishing passes programmed on same cutting tool without thermal cool-down pause, 3) Measurement: In-process plug gauge calibrated at 20°C applied to 45°C hot workpiece.',
    keyInsights: [
      '5-Why analysis concluded that root cause is dual-mode: tool thermal drift combined with gauge measurement at elevated temperature.',
      'Corrective Action: Split roughing and finishing cycles across separate tools with dedicated 10-minute thermal stabilization pause.',
      'Preventive Action: Installed infrared pyrometer to interlock CMM gauge measurement only when workpiece temperature < 24°C.',
      'Zero repeat bore diameter defects observed across subsequent 400 machined parts.'
    ],
    qmMetrics: [
      { label: 'Root Cause Mode', value: 'Thermal Expansion & Gauge Delta', status: 'neutral' },
      { label: '5-Why Rigor', value: '5 Levels Validated', status: 'positive' },
      { label: 'Ishikawa Dimensions', value: 'Machine & Method & Measurement', status: 'positive' },
      { label: 'Verification Status', value: '100% Effective (0 Repeats)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Why 1: Why did bore fail diameter spec?', value: 'Bore measured 50.08mm vs 50.00±0.02mm limit', variance: 'Defect Observation', detail: 'Out of tolerance by +0.06mm' },
      { category: 'Why 2: Why was cut oversized?', value: 'Tool cutting edge was pushed outward by spindle expansion', variance: 'Thermal Drift', detail: 'Spindle temp reached 58°C' },
      { category: 'Why 3: Why did spindle overheat?', value: 'Roughing and finishing cut back-to-back without cooldown', variance: 'Process Method', detail: 'High tool load generated heat' },
      { category: 'Why 4: Why was it not caught at machine?', value: 'Plug gauge used while casting was still hot (45°C)', variance: 'Measurement Error', detail: 'Thermal expansion shrank after cool' },
      { category: 'Why 5: Root Cause Root Definition', value: 'Lack of automated temperature-compensated measurement', variance: 'Systemic Root Cause', detail: 'Remediated with IR pyrometer interlock' }
    ],
    recommendedSapActions: [
      { actionName: 'Record Cause Codes', tcode: 'QM02', description: 'Update Catalog 8 (Causes) and attach 5-Why root cause documentation' },
      { actionName: 'Engineering Change Management', tcode: 'CC02', description: 'Update NC routing program and machining work instructions' }
    ]
  },
  {
    questionId: 'Q25',
    questionText: 'Which defects occurred again after corrective action?',
    category: 'Quality Notifications & Corrective Actions',
    sapSourceTables: ['QMFE', 'QMUR', 'QMSM', 'QMEL'],
    summaryAnswer: 'Audit of post-CAPA defect history reveals 1 recurring failure mode: Defect 0304 "Hydraulic Seal Leakage on Assembly Line 1" re-occurred twice after CAPA-2026-018 was closed. Investigation showed the initial corrective action (manual assembly training) was insufficient due to operator turnover; the permanent solution required a physical poka-yoke guide jig, which has now eliminated the failure.',
    keyInsights: [
      '1 defect code re-occurred post-CAPA closure (93.8% initial CAPA effectiveness rate across 16 CAPAs).',
      'Defect 0304 recurrence root cause: Administrative training control eroded during third-shift operator rotation.',
      'Engineering escalation: Replaced administrative control with Level 3 Poka-Yoke mechanical fixture.',
      'No repeat occurrences recorded across 650 pump assemblies produced since fixture rollout.'
    ],
    qmMetrics: [
      { label: 'Repeat Defect Codes', value: '1 of 16 CAPAs (6.2%)', status: 'warning' },
      { label: 'CAPA Effectiveness', value: '93.8% First-Time Fix', status: 'positive' },
      { label: 'Poka-Yoke Deployed', value: 'Level 3 Physical Jig', status: 'positive' },
      { label: 'Current Defect Rate', value: '0.0% (Last 650 units)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Initial CAPA-2026-018 (Training)', value: 'Administrative Control', variance: 'Failed (2 Repeats)', detail: 'Operator turnover eroded assembly technique compliance' },
      { category: 'Supplemental CAPA-2026-038 (Tooling)', value: 'Poka-Yoke Mechanical Guide', variance: 'Succeeded (0 Repeats)', detail: 'Jig physically prevents seal misalignment regardless of operator' }
    ],
    recommendedSapActions: [
      { actionName: 'Reopen Quality Notification', tcode: 'QM02', description: 'Initiate secondary CAPA investigation and flag recurrence counter' },
      { actionName: 'FMEA Risk Review', tcode: 'PLMD_AUDIT', description: 'Update Process FMEA Occurrence score and Severity ranking' }
    ]
  }
];
