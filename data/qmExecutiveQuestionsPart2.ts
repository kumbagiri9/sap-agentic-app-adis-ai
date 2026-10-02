import { QmExecutiveQuestionAnswer } from '../types';

export const QM_EXECUTIVE_QUESTIONS_PART2: QmExecutiveQuestionAnswer[] = [
  // =========================================================================
  // PILLAR 3 (Cont.): QUALITY NOTIFICATIONS & CORRECTIVE ACTIONS (Q26 - Q30)
  // =========================================================================
  {
    questionId: 'Q26',
    questionText: 'Which quality notifications require escalation?',
    category: 'Quality Notifications & Corrective Actions',
    sapSourceTables: ['QMEL', 'QMSM', 'QMMA', 'JEST'],
    summaryAnswer: '3 quality notifications currently meet executive escalation thresholds: 1) QN 10008920 (ABB Power - Customer Complaint on Tier 1 strategic account; 8D overdue on D5), 2) QN 20019842 (Continental Seals - Vendor Non-conformance causing line stockout risk in 4 hours), and 3) QN 30018721 (Line 3 - Internal defect causing active machine downtime).',
    keyInsights: [
      '3 notifications escalated to Level 2 (VP Operations & Quality Director).',
      'ABB Power complaint carries a $1.2M annual revenue relationship risk.',
      'Continental Seals supplier non-conformance requires executive vendor meeting.',
      'Daily morning executive Stand-up review includes all 3 escalated items.'
    ],
    qmMetrics: [
      { label: 'Escalated Cases', value: '3 Notifications', status: 'negative' },
      { label: 'Revenue at Stake', value: '$1,200,000 USD', status: 'negative' },
      { label: 'Line Impact', value: 'Line 3 Blocked', status: 'negative' },
      { label: 'Executive Action', value: 'Meeting at 14:00', status: 'positive' }
    ],
    breakdownData: [
      { category: 'QN 10008920 (ABB Power)', value: 'Tier 1 Customer Escalation', variance: '8D Stage D5', detail: 'Impeller vibration / VP Operations attending customer technical sync' },
      { category: 'QN 20019842 (Continental Seals)', value: 'Supply Disruption Risk', variance: 'Stockout < 4h', detail: 'Vendor VP Quality summoned for emergency containment review' },
      { category: 'QN 30018721 (Machining Line 3)', value: 'Internal Downtime', variance: '1.2h Lost Time', detail: 'Plant Maintenance and Tooling Lead on site at CNC-02' }
    ],
    recommendedSapActions: [
      { actionName: 'Escalation Cockpit', tcode: 'QM02', description: 'Trigger Level 2 notification escalation and reassign high-priority tasks' },
      { actionName: 'Workflow Log Inspection', tcode: 'SWI1', description: 'Inspect approval bottlenecks and executive signoff stages' }
    ]
  },
  {
    questionId: 'Q27',
    questionText: 'Show quality notification history by supplier.',
    category: 'Quality Notifications & Corrective Actions',
    sapSourceTables: ['QMEL', 'QMFE', 'LFA1', 'EKKO', 'QINF'],
    summaryAnswer: 'Historical vendor quality notification summary over the past 12 months across top suppliers: 1) DieCast Solutions (Vendor 100420): 18 notifications (12 porosity, 6 dimensional), total quarantine value $112,000. 2) Continental Seals (Vendor 100588): 14 notifications (10 hardness, 4 flash burrs), value $68,000. 3) Bosch Rexroth: 6 notifications, value $42,000. 4) SKF Bearings: 3 notifications, value $31,500.',
    keyInsights: [
      '41 total vendor notifications logged across top 4 raw material suppliers in 12 months.',
      'DieCast Solutions represents 43.9% of all vendor non-conformances.',
      'Continental Seals showed high recurring defects in Q1/Q2; defect trend stabilizing in Q3.',
      'SKF Bearings maintains the lowest notification frequency (3 notifications across 240 lots received).'
    ],
    qmMetrics: [
      { label: 'Total Vendor QNs', value: '41 Cases (12m)', status: 'neutral' },
      { label: 'Highest Defect Vendor', value: 'DieCast Solutions (18 QNs)', status: 'negative' },
      { label: 'Total Quarantined', value: '$253,500 USD', status: 'warning' },
      { label: 'Avg Resolution Time', value: '11.4 Days', status: 'positive' }
    ],
    breakdownData: [
      { category: 'DieCast Solutions (100420)', value: '18 QNs ($112,000)', variance: 'High Defect', detail: '12 Porosity / 6 Dimensions / 4 SCARs issued' },
      { category: 'Continental Seals (100588)', value: '14 QNs ($68,000)', variance: 'Medium Defect', detail: '10 Durometer / 4 Burrs / 2 Debit Memos' },
      { category: 'Bosch Rexroth (100340)', value: '6 QNs ($42,000)', variance: 'Low Defect', detail: '4 Valve leakage / 2 Solenoid coil resistance' },
      { category: 'SKF Bearings (100112)', value: '3 QNs ($31,500)', variance: 'Benchmark', detail: '2 Micro-pitting / 1 Packaging damage' }
    ],
    recommendedSapActions: [
      { actionName: 'Vendor Quality Analysis', tcode: 'MCV4', description: 'Run chronological notification frequency and defect rate by vendor' },
      { actionName: 'Display Quality Info Record', tcode: 'QI03', description: 'Check vendor QM release status and certification history' }
    ]
  },
  {
    questionId: 'Q28',
    questionText: 'Which quality actions have the highest business impact?',
    category: 'Quality Notifications & Corrective Actions',
    sapSourceTables: ['QMSM', 'QMMA', 'QMEL', 'COEP'],
    summaryAnswer: 'The top 3 completed quality improvement actions delivering the highest measured financial and operational business impact are: 1) Automated Argon Gas Controller on Robotic Welding (Annualized scrap savings: $148,000 USD; weld defect rate reduced from 2.8% to 0.4%), 2) Spindle Vibration Monitoring System on CNC-02 ($115,000 savings in avoided tooling scrap), and 3) Smart Torque Wrenches with PLC Interlock on Assembly Line 1 ($82,000 savings in warranty rework).',
    keyInsights: [
      'Top 3 quality engineering initiatives delivered $345,000 USD in annualized recurring cost reduction.',
      'Welding gas controller achieved full ROI payback in 2.2 months.',
      'Smart torque wrench interlock completely eliminated customer field torque loose-bolt claims.',
      'Process capability index (Cpk) improved from 1.12 to 1.48 across targeted work centers.'
    ],
    qmMetrics: [
      { label: 'Total Annual Savings', value: '$345,000 USD', status: 'positive' },
      { label: 'Avg Payback Period', value: '3.1 Months', status: 'positive' },
      { label: 'Scrap Rate Reduction', value: '-65% on Target Lines', status: 'positive' },
      { label: 'Customer Claim Drop', value: '-82% YoY', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Argon Gas Shielding Control', value: '$148,000 / yr Savings', variance: 'ROI: 2.2 mo', detail: 'Robotic Weld Cell / Weld porosity dropped from 2.8% to 0.4%' },
      { category: 'CNC-02 Spindle Vibration AI', value: '$115,000 / yr Savings', variance: 'ROI: 3.4 mo', detail: 'Heavy Machining / Prevented 8 catastrophic tool collisions' },
      { category: 'Smart Torque PLC Interlock', value: '$82,000 / yr Savings', variance: 'ROI: 3.8 mo', detail: 'Assembly Line 1 / Zero loose fastener warranty claims in 6 months' }
    ],
    recommendedSapActions: [
      { actionName: 'Cost of Quality Analysis', tcode: 'QM03', description: 'Review COQ internal failure cost reduction post-CAPA' },
      { actionName: 'Plant Maintenance & QM Analytics', tcode: 'MC.1', description: 'Correlate machine maintenance events with scrap reduction' }
    ]
  },
  {
    questionId: 'Q29',
    questionText: 'Recommend corrective actions for this issue.',
    category: 'Quality Notifications & Corrective Actions',
    sapSourceTables: ['QMFE', 'QMUR', 'QMSM', 'QMMA', 'QPAM'],
    summaryAnswer: 'For the active non-conformance on Hydraulic Solenoid Valve (COMP-VALVE-09) experiencing high-pressure micro-leakage at 350 Bar: 1) Immediate Containment (D3): 100% quarantine of batch B-9940; inspect O-ring groove depth using depth micrometer. 2) Root Cause Corrective Action (D4/D5): Modify groove machining tolerance from 2.10±0.10mm to 2.05±0.03mm; replace NBR seal with 80 Shore A Viton fluoroelastomer. 3) Preventive Action (D6/D7): Install automated helium leak decay tester in End-of-Line test stand.',
    keyInsights: [
      '3-tier 8D action plan formulated for high-pressure valve micro-leakage.',
      'Containment prevents 450 suspect valves from reaching final pump assembly.',
      'Material substitution to Viton fluoroelastomer provides 4x resistance to pressure extrusion.',
      'Automated helium leak tester reduces testing cycle from 6 minutes to 45 seconds.'
    ],
    qmMetrics: [
      { label: 'Recommended Action', value: '3-Tier 8D Plan Deployed', status: 'positive' },
      { label: 'Quarantine Quantity', value: '450 Units Protected', status: 'positive' },
      { label: 'Material Upgrade', value: 'Viton 80 Shore A', status: 'positive' },
      { label: 'Test Time Savings', value: '-87% (45s vs 6m)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'D3: Immediate Containment', value: 'Quarantine Batch B-9940', variance: 'Completed', detail: 'Move stock to 0099 Blocked Location / Issue internal hold' },
      { category: 'D5: Permanent Corrective Action', value: 'Tighten Machining Tolerance', variance: 'In Progress', detail: 'CNC G-code update to 2.05±0.03mm / Viton seal drawing release' },
      { category: 'D7: Systemic Preventive Action', value: 'Helium Leak Detector', variance: 'Staged', detail: 'Procurement of automated dry test stand / FMEA severity review' }
    ],
    recommendedSapActions: [
      { actionName: 'Create Corrective Tasks', tcode: 'QM02', description: 'Log tasks for containment, root cause correction, and preventive verification' },
      { actionName: 'Change Material Master', tcode: 'MM02', description: 'Update component BOM to substitute Viton O-ring seal part number' }
    ]
  },
  {
    questionId: 'Q30',
    questionText: 'Which quality problems should management address first?',
    category: 'Quality Notifications & Corrective Actions',
    sapSourceTables: ['QMEL', 'QMFE', 'QALS', 'COEP'],
    summaryAnswer: 'Based on multi-criteria risk matrix evaluation (Customer Revenue Risk × Safety/Compliance × Financial Cost of Poor Quality), management should prioritize the following 3 issues: 1) Priority 1: ABB Power Customer Complaint on Pump Vibration (Risk Score: 95/100; $1.2M customer relationship at stake), 2) Priority 2: CNC-02 Spindle Bearing Overhaul (Risk Score: 88/100; active production bottleneck costing $1,850/hr downtime), 3) Priority 3: DieCast Solutions Aluminum Porosity SCAR (Risk Score: 78/100; $48k quarantined raw stock).',
    keyInsights: [
      'Top 3 management priorities represent 82% of current operational and commercial quality risk.',
      'Customer complaint on ABB Power requires executive attendance at tomorrow\'s root-cause briefing.',
      'Spindle overhaul for CNC-02 is fully scheduled with external technician on site Saturday 06:00.',
      'DieCast Solutions executive vendor audit scheduled for next Tuesday.'
    ],
    qmMetrics: [
      { label: 'Top Priority 1', value: 'ABB Customer Complaint', status: 'negative' },
      { label: 'Top Priority 2', value: 'CNC-02 Spindle Overhaul', status: 'negative' },
      { label: 'Top Priority 3', value: 'DieCast Solutions SCAR', status: 'warning' },
      { label: 'Risk Coverage', value: '82% of Total Risk', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Priority 1 (ABB Power Complaint)', value: 'Risk Score 95/100', variance: '$1.2M Account', detail: 'Impeller dynamic balance / Executive briefing tomorrow 10:00' },
      { category: 'Priority 2 (CNC-02 Downtime)', value: 'Risk Score 88/100', variance: '$1,850/hr Lost', detail: 'Spindle bearings replacement / Maintenance scheduled Saturday' },
      { category: 'Priority 3 (DieCast Porosity)', value: 'Risk Score 78/100', variance: '$48,200 Stock', detail: 'Vacuum tooling trial / Supplier audit team visiting plant' }
    ],
    recommendedSapActions: [
      { actionName: 'Executive Quality Cockpit', tcode: 'Fiori F2168', description: 'Monitor enterprise quality risk heatmap and open executive escalations' },
      { actionName: 'Quality Management Review', tcode: 'QM11', description: 'Export weekly management quality dashboard and Pareto metrics' }
    ]
  },

  // =========================================================================
  // PILLAR 4: SUPPLIER QUALITY (Q31 - Q40)
  // =========================================================================
  {
    questionId: 'Q31',
    questionText: 'Show supplier quality ratings.',
    category: 'Supplier Quality',
    sapSourceTables: ['LFA1', 'QINF', 'QALS', 'QAVE', 'EKPO'],
    summaryAnswer: 'Supplier Quality Rating Index (out of 100 points, evaluated on Lot Acceptance Rate, PPM Defect Rate, On-Time 8D Resolution, and Audit Score): 1) SKF Bearings: 98.4 (Grade A - Preferred), 2) Bosch Rexroth: 95.2 (Grade A - Preferred), 3) Festo Pneumatics: 94.6 (Grade A - Preferred), 4) Continental Seals: 82.1 (Grade B - Conditional), 5) DieCast Solutions: 71.4 (Grade C - Under Audit / High Risk).',
    keyInsights: [
      '3 out of 5 core suppliers achieve Grade A Preferred status (>90 points).',
      'SKF Bearings is the top-rated supplier with 99.2% lot acceptance and 18 ppm defect rate.',
      'DieCast Solutions dropped from Grade B (81.0) to Grade C (71.4) due to recurring porosity defects.',
      'Suppliers below 80 points are automatically flagged for mandatory incoming inspection (Skip-Lot disabled).'
    ],
    qmMetrics: [
      { label: 'Avg Supplier Score', value: '88.3 / 100', status: 'positive' },
      { label: 'Grade A Suppliers', value: '3 Vendors (60%)', status: 'positive' },
      { label: 'Grade B (Conditional)', value: '1 Vendor (20%)', status: 'neutral' },
      { label: 'Grade C (At Risk)', value: '1 Vendor (20%)', status: 'negative' }
    ],
    breakdownData: [
      { category: 'SKF Bearings (Vendor 100112)', value: 'Rating: 98.4 (Grade A)', variance: 'Benchmark', detail: 'Lot Accept: 99.2% / PPM: 18 / 8D SLA: 100% / Audit: 98' },
      { category: 'Bosch Rexroth (Vendor 100340)', value: 'Rating: 95.2 (Grade A)', variance: 'Preferred', detail: 'Lot Accept: 96.8% / PPM: 120 / 8D SLA: 95% / Audit: 94' },
      { category: 'Festo Pneumatics (Vendor 100220)', value: 'Rating: 94.6 (Grade A)', variance: 'Preferred', detail: 'Lot Accept: 96.1% / PPM: 145 / 8D SLA: 92% / Audit: 95' },
      { category: 'Continental Seals (Vendor 100588)', value: 'Rating: 82.1 (Grade B)', variance: 'Conditional', detail: 'Lot Accept: 89.4% / PPM: 850 / 8D SLA: 78% / Audit: 80' },
      { category: 'DieCast Solutions (Vendor 100420)', value: 'Rating: 71.4 (Grade C)', variance: 'High Risk', detail: 'Lot Accept: 81.2% / PPM: 1,820 / 8D SLA: 62% / Audit: 68' }
    ],
    recommendedSapActions: [
      { actionName: 'Vendor Evaluation Report', tcode: 'ME61', description: 'Calculate and display vendor evaluation scores across Quality and Delivery' },
      { actionName: 'Display Quality Info Record', tcode: 'QI03', description: 'Review inspection controls and vendor audit certification status' }
    ]
  },
  {
    questionId: 'Q32',
    questionText: 'Which suppliers have the highest defect rates?',
    category: 'Supplier Quality',
    sapSourceTables: ['QALS', 'QAVE', 'LFA1', 'EKPO', 'QINF'],
    summaryAnswer: 'Over the last 180 days, the top 3 suppliers with the highest incoming defect rates (measured in Parts Per Million / PPM and Lot Rejection Rate) are: 1) DieCast Solutions (Vendor 100420: 1,820 PPM / 18.8% lot rejection rate across 32 lots), 2) Continental Seals (Vendor 100588: 850 PPM / 10.6% rejection rate across 47 lots), and 3) ElectroSem Components (Vendor 100810: 620 PPM / 7.5% rejection rate across 40 lots).',
    keyInsights: [
      'DieCast Solutions exceeds target PPM threshold (500 ppm) by 3.6x.',
      'Continental Seals failure rate driven by durometer hardness variance in elastomer compound.',
      'ElectroSem defect rate concentrated in SMD capacitor solderability degradation.',
      'Tightened inspection protocol (ISO 2859-1 Level III) enforced across all 3 suppliers.'
    ],
    qmMetrics: [
      { label: 'Highest Defect Vendor', value: 'DieCast Solutions (1,820 PPM)', status: 'negative' },
      { label: 'Corporate PPM Target', value: '< 250 PPM', status: 'positive' },
      { label: 'Lots Quarantined YTD', value: '14 Lots', status: 'negative' },
      { label: 'Inspection Severity', value: 'Tightened (Level III)', status: 'warning' }
    ],
    breakdownData: [
      { category: 'DieCast Solutions (100420)', value: '1,820 PPM (18.8% Lots Rejected)', variance: 'Critical', detail: 'Aluminum casting porosity & dimensional warpage / SCAR active' },
      { category: 'Continental Seals (100588)', value: '850 PPM (10.6% Lots Rejected)', variance: 'High', detail: 'Polymer hardness & parting line flash / Mold tooling re-cut' },
      { category: 'ElectroSem (100810)', value: '620 PPM (7.5% Lots Rejected)', variance: 'Medium', detail: 'Component solderability & ESR drift / Moisture barrier packaging upgraded' }
    ],
    recommendedSapActions: [
      { actionName: 'Vendor Defect Analysis', tcode: 'MCV4', description: 'Analyze PPM trends and defect distributions per vendor' },
      { actionName: 'Update Quality Info Record', tcode: 'QI02', description: 'Set inspection control status to Tightened or Blocked for Procurement' }
    ]
  },
  {
    questionId: 'Q33',
    questionText: 'Which suppliers consistently fail inspections?',
    category: 'Supplier Quality',
    sapSourceTables: ['QALS', 'QAVE', 'LFA1', 'QINF'],
    summaryAnswer: 'Longitudinal analysis across 6 consecutive calendar quarters identifies DieCast Solutions (Vendor 100420) as the only supplier consistently failing incoming inspections: they have failed at least 1 inspection lot in 5 of the last 6 months (cumulative 18 failed lots out of 96 received; 18.8% failure frequency). Secondary supplier Continental Seals had chronic failures in Q1/Q2 but achieved 100% pass rate in the last 60 days.',
    keyInsights: [
      'DieCast Solutions has failed 5 consecutive monthly inspection audits.',
      'Root cause: Vendor lacks vacuum degassing system in high-pressure die casting cell.',
      'Sourcing action: Strategic dual-sourcing initiated with Alcoa Castings (Vendor 100950) to absorb 50% volume allocation.',
      'Quality hold placed on any PO releases exceeding $50,000 without SQE pre-authorization.'
    ],
    qmMetrics: [
      { label: 'Chronic Failure Vendor', value: 'DieCast Solutions', status: 'negative' },
      { label: 'Failed Months', value: '5 of 6 Months', status: 'negative' },
      { label: 'Failed Lots Total', value: '18 / 96 Lots', status: 'negative' },
      { label: 'Dual-Sourcing', value: 'Alcoa Castings Staged', status: 'positive' }
    ],
    breakdownData: [
      { category: 'DieCast Solutions (Chronic)', value: '18.8% Failure Rate', variance: '5 of 6 mo failed', detail: 'Porosity & gas inclusions / Dual sourcing transition in progress' },
      { category: 'Continental Seals (Recovered)', value: '4.2% Failure Rate (Last 60d: 0%)', variance: 'Improving', detail: 'New compounding batch QC instituted / Stabilized' }
    ],
    recommendedSapActions: [
      { actionName: 'Block Vendor for Procurement', tcode: 'XK05', description: 'Place purchasing block on vendor for specific purchasing organizations' },
      { actionName: 'Quality Info Record: Block', tcode: 'QI02', description: 'Activate QM procurement release block in S/4HANA' }
    ]
  },
  {
    questionId: 'Q34',
    questionText: 'Compare supplier quality performance.',
    category: 'Supplier Quality',
    sapSourceTables: ['LFA1', 'QINF', 'QALS', 'QAVE', 'MCV4'],
    summaryAnswer: 'Direct side-by-side comparison across our 3 primary mechanical casting & machining suppliers: 1) SKF Bearings: 99.2% lot acceptance, 18 PPM, 0 open QNs, 100% on-time delivery, Quality Score: 98.4. 2) Bosch Rexroth: 96.8% lot acceptance, 120 PPM, 1 open QN, 96.4% on-time delivery, Quality Score: 95.2. 3) DieCast Solutions: 81.2% lot acceptance, 1,820 PPM, 4 open QNs, 84.1% on-time delivery, Quality Score: 71.4.',
    keyInsights: [
      'SKF Bearings is the top benchmark supplier across all quality, delivery, and responsiveness metrics.',
      'Bosch Rexroth maintains high consistency with minor isolated hydraulic tolerance deviations.',
      'DieCast Solutions lags significantly across quality (-27 points) and delivery (-15.9%).',
      'Recommendation: Shift 60% of DieCast Solutions casting volume to Alcoa and Bosch precision machining.'
    ],
    qmMetrics: [
      { label: 'Benchmark Supplier', value: 'SKF Bearings (98.4)', status: 'positive' },
      { label: 'Mid-Tier Supplier', value: 'Bosch Rexroth (95.2)', status: 'positive' },
      { label: 'Underperforming', value: 'DieCast Solutions (71.4)', status: 'negative' },
      { label: 'Volume Reallocation', value: '60% Shift Recommended', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Metric: Lot Acceptance Rate', value: 'SKF: 99.2% | Bosch: 96.8% | DieCast: 81.2%', variance: 'SKF Best (+18.0%)', detail: 'Target: > 97.0%' },
      { category: 'Metric: Defect PPM', value: 'SKF: 18 | Bosch: 120 | DieCast: 1,820', variance: 'SKF Best (-1,802 ppm)', detail: 'Target: < 250 PPM' },
      { category: 'Metric: Open Quality Notifications', value: 'SKF: 0 | Bosch: 1 | DieCast: 4', variance: 'SKF Best', detail: 'Quarantine value: $0 vs $48.2k' },
      { category: 'Metric: On-Time Delivery (OTD)', value: 'SKF: 100% | Bosch: 96.4% | DieCast: 84.1%', variance: 'SKF Best (+15.9%)', detail: 'Target: > 95.0%' }
    ],
    recommendedSapActions: [
      { actionName: 'Vendor Evaluation Cockpit', tcode: 'ME61', description: 'Run comprehensive vendor comparison matrix across purchasing org 1000' },
      { actionName: 'Supplier Performance Review', tcode: 'Fiori F2168', description: 'Export multi-supplier comparative scorecard' }
    ]
  },
  {
    questionId: 'Q35',
    questionText: 'Which suppliers require audits?',
    category: 'Supplier Quality',
    sapSourceTables: ['LFA1', 'QINF', 'PLMD_AUDIT', 'QAVE'],
    summaryAnswer: 'Based on ISO 9001/IATF 16949 audit cycle rules and risk-based triggering (Quality Score < 80 or recurring Class 1 defects), 3 suppliers require mandatory on-site quality audits: 1) DieCast Solutions (Vendor 100420: Risk-triggered Special Process Audit - High Pressure Die Casting; scheduled next Tuesday), 2) MicroChip Tech (Vendor 100930: Annual ISO 9001 surveillance audit due in 30 days), and 3) Continental Seals (Vendor 100588: Post-CAPA verification audit due in 45 days).',
    keyInsights: [
      '3 vendor quality audits scheduled in SAP Audit Management (PLMD_AUDIT).',
      'DieCast Solutions audit will focus on vacuum degassing, molten metal filtration, and X-ray NDT procedures.',
      'MicroChip Tech audit covers cleanroom ESD controls and wafer-level testing.',
      'Lead Quality Auditor and SQE assigned to all audit engagements.'
    ],
    qmMetrics: [
      { label: 'Audits Required', value: '3 Suppliers', status: 'warning' },
      { label: 'Special Process Audit', value: '1 (DieCast Solutions)', status: 'negative' },
      { label: 'Surveillance Audit', value: '1 (MicroChip Tech)', status: 'neutral' },
      { label: 'CAPA Verification', value: '1 (Continental Seals)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'DieCast Solutions (Audit AUD-2026-04)', value: 'On-Site Special Process Audit', variance: 'Scheduled: Next Tue', detail: 'Auditor: D. Roberts (SQE Lead) / Focus: Casting porosity' },
      { category: 'MicroChip Tech (Audit AUD-2026-05)', value: 'Annual Supplier Surveillance', variance: 'Due: 30 Days', detail: 'Auditor: M. Chen (Electronics Lead) / Focus: ESD cleanroom' },
      { category: 'Continental Seals (Audit AUD-2026-06)', value: 'CAPA Effectiveness Audit', variance: 'Due: 45 Days', detail: 'Auditor: D. Roberts / Focus: Polymer formulation QC' }
    ],
    recommendedSapActions: [
      { actionName: 'Audit Management Worklist', tcode: 'PLMD_AUDIT', description: 'Create audit plan, question catalog, findings log, and corrective action tasks' },
      { actionName: 'Display Quality Info Record', tcode: 'QI03', description: 'Record audit score and update vendor certification expiration date' }
    ]
  },
  {
    questionId: 'Q36',
    questionText: 'Show incoming inspection failures by supplier.',
    category: 'Supplier Quality',
    sapSourceTables: ['QALS', 'QAVE', 'LFA1', 'MARA', 'EKKO'],
    summaryAnswer: 'Breakdown of 14 incoming inspection lot failures (Origin 01) recorded YTD across raw material suppliers: DieCast Solutions: 6 failed lots (Material: RAW-AL-440 Alu Brackets; Defect: Porosity), Continental Seals: 4 failed lots (Material: SEAL-NBR-80 O-Rings; Defect: Shore Hardness), MicroChip Tech: 2 failed lots (Material: ELEC-SENS-01; Defect: Flashover), and ThyssenKrupp Steel: 2 failed lots (Material: ROH-STEEL-100; Defect: Tensile elongation).',
    keyInsights: [
      '14 incoming inspection failures across 4 suppliers YTD.',
      'Total rejected raw material value: $218,400 USD.',
      '100% of failed incoming lots were successfully intercepted at Goods Inward dock prior to warehouse storage or assembly issue.',
      'Vendor debit claims processed via SAP MM Invoice Verification (MIRO/MR8M).'
    ],
    qmMetrics: [
      { label: 'Incoming Failures YTD', value: '14 Lots', status: 'warning' },
      { label: 'Rejected Value', value: '$218,400 USD', status: 'negative' },
      { label: 'Containment at Dock', value: '100% Intercepted', status: 'positive' },
      { label: 'Debit Claims Filed', value: '$218,400 (100%)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'DieCast Solutions (6 Failed Lots)', value: '$84,600 Rejected', variance: 'Casting Porosity', detail: 'RAW-AL-440 / Lots: 0100098210, 0100098244, 0100098302...' },
      { category: 'Continental Seals (4 Failed Lots)', value: '$42,800 Rejected', variance: 'Polymer Hardness', detail: 'SEAL-NBR-80 / Lots: 0100098190, 0100098288, 0100098409...' },
      { category: 'MicroChip Tech (2 Failed Lots)', value: '$56,000 Rejected', variance: 'Dielectric Breakdown', detail: 'ELEC-SENS-01 / Lots: 0100098340, 0100098412' },
      { category: 'ThyssenKrupp (2 Failed Lots)', value: '$35,000 Rejected', variance: 'Tensile Elongation', detail: 'ROH-STEEL-100 / Lots: 0100098290, 0100098310' }
    ],
    recommendedSapActions: [
      { actionName: 'Goods Receipt Inspection Lot Log', tcode: 'QA33', description: 'Filter Origin 01 inspection lots with Usage Decision R (Rejected)' },
      { actionName: 'Return Delivery to Vendor', tcode: 'MIGO', description: 'Post movement type 122 (Return delivery to vendor against PO)' }
    ]
  },
  {
    questionId: 'Q37',
    questionText: 'Recommend the best supplier based on quality.',
    category: 'Supplier Quality',
    sapSourceTables: ['LFA1', 'QINF', 'QALS', 'QAVE', 'EORD'],
    summaryAnswer: 'For mechanical bearings, housings, and precision rotating components, SKF Bearings (Vendor 100112) is strongly recommended as the best quality supplier: Quality Score: 98.4/100, Lot Acceptance Rate: 99.2%, Defect PPM: 18 (vs industry benchmark 150), On-Time Delivery: 100%, ISO 9001/IATF 16949 certified with zero open non-conformances and Skip-Lot qualified status (Level I inspection).',
    keyInsights: [
      'SKF Bearings is our top-performing global supply partner with 0 customer-impacting defects in 3 years.',
      'Skip-Lot qualification saves $42,000 annually in reduced inbound inspection handling costs.',
      'Recommended Action: Expand Source List (EORD) allocation for high-speed bearings from 70% to 90% SKF.',
      'Secondary backup supplier: NSK Precision (Quality Score: 94.8).'
    ],
    qmMetrics: [
      { label: 'Recommended Supplier', value: 'SKF Bearings (100112)', status: 'positive' },
      { label: 'Quality Score', value: '98.4 / 100', status: 'positive' },
      { label: 'Defect PPM', value: '18 PPM (World Class)', status: 'positive' },
      { label: 'Skip-Lot Status', value: 'Active (Level I)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Quality Acceptance Rate', value: '99.2% across 240 Lots', variance: 'Top 1% Global', detail: '238 Lots Accepted / 2 Minor Packaging' },
      { category: 'Defect PPM', value: '18 PPM', variance: 'Benchmark', detail: 'Industry Avg: 150 PPM' },
      { category: 'Inspection Cost Savings', value: '$42,000 / yr', variance: 'Skip-Lot Active', detail: 'Dynamic sampling reduces lab test frequency by 80%' },
      { category: 'Audit Score', value: '98 / 100 (IATF 16949)', variance: 'Grade A', detail: 'Zero major or minor non-conformances' }
    ],
    recommendedSapActions: [
      { actionName: 'Maintain Source List', tcode: 'ME01', description: 'Update preferred supplier allocation and validity periods' },
      { actionName: 'Maintain Quality Info Record', tcode: 'QI02', description: 'Ensure Skip-Lot dynamic modification rule DMR-01 is assigned' }
    ]
  },
  {
    questionId: 'Q38',
    questionText: 'Which suppliers are improving?',
    category: 'Supplier Quality',
    sapSourceTables: ['LFA1', 'QINF', 'QALS', 'QAVE', 'MCV4'],
    summaryAnswer: 'Continental Seals (Vendor 100588) has demonstrated the strongest quality improvement over the past 90 days: Quality Score improved from 72.4 (Grade C) in Q1 to 82.1 (Grade B) in Q3; lot acceptance rate rose from 82.0% to 94.8%; and zero incoming non-conformances have been logged in the last 45 days following their tooling rebuild and automated durometer testing rollout.',
    keyInsights: [
      'Continental Seals showed a +9.7 point Quality Rating gain over 2 quarters.',
      'Elastomer durometer hardness variance reduced by 72% post-tooling overhaul.',
      'Supplier invested $180,000 in continuous automated cure-time monitoring equipment.',
      'Procurement is evaluating lifting their temporary volume cap upon completion of next month\'s audit.'
    ],
    qmMetrics: [
      { label: 'Top Improving Vendor', value: 'Continental Seals', status: 'positive' },
      { label: 'Score Gain', value: '+9.7 Points (72.4 -> 82.1)', status: 'positive' },
      { label: 'Lot Acceptance (Last 45d)', value: '100% (14 Lots)', status: 'positive' },
      { label: 'Quality Status', value: 'Grade B (Recovering)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Q1 Performance (Baseline)', value: 'Rating: 72.4 / Acceptance: 82.0%', variance: 'Grade C', detail: '10 Durometer failure lots / SCAR issued' },
      { category: 'Q2 Performance (CAPA Deployment)', value: 'Rating: 77.8 / Acceptance: 88.5%', variance: 'Improving', detail: 'Tooling re-cut and cure ovens recalibrated' },
      { category: 'Q3 Performance (Current)', value: 'Rating: 82.1 / Acceptance: 94.8%', variance: 'Grade B', detail: 'Zero defect lots in last 45 days / In-line durometer testing' }
    ],
    recommendedSapActions: [
      { actionName: 'Vendor Evaluation Trend', tcode: 'ME65', description: 'Display graphical evaluation trend lines across evaluation periods' },
      { actionName: 'Quality Info Record Maintenance', tcode: 'QI02', description: 'Adjust inspection severity from Tightened to Normal' }
    ]
  },
  {
    questionId: 'Q39',
    questionText: 'Which supplier is causing production delays?',
    category: 'Supplier Quality',
    sapSourceTables: ['LFA1', 'QALS', 'QAVE', 'AFKO', 'EKPO'],
    summaryAnswer: 'DieCast Solutions (Vendor 100420) is the primary supplier causing downstream manufacturing delays: 2 quarantined lots of aluminum brackets (RAW-AL-440) caused 14 cumulative hours of schedule rescheduling on Assembly Line 2 and Machining Cell 3 over the past 30 days, impacting 120 planned pump units.',
    keyInsights: [
      'DieCast Solutions non-conformances directly induced 14 hours of line buffer re-sequencing.',
      'Machining Cell 3 had to switch setups between pump models to bypass missing raw casting batches.',
      'Setup changeover losses totaled $12,400 in direct labor and machine capacity variance.',
      'Emergency supplier meeting held; vendor air-freighted 150 pre-screened replacement brackets.'
    ],
    qmMetrics: [
      { label: 'Disrupting Supplier', value: 'DieCast Solutions', status: 'negative' },
      { label: 'Production Schedule Impact', value: '14 Hours Rescheduling', status: 'negative' },
      { label: 'Units Delayed', value: '120 Units', status: 'warning' },
      { label: 'Buffer Recovery', value: '150 Air-Freight Units', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Lot 0100098302 (RAW-AL-440)', value: 'Quarantined for Porosity', variance: '8h Line 2 Delay', detail: 'Line switched to P-200 assembly to preserve shift output' },
      { category: 'Lot 0100098344 (RAW-AL-440)', value: 'Quarantined for Warp', variance: '6h Cell 3 Delay', detail: 'Replacement batch received via express freight' }
    ],
    recommendedSapActions: [
      { actionName: 'Production Order Progress', tcode: 'CO46', description: 'Review order missing parts and material availability checks' },
      { actionName: 'Supplier Delay & Claim Processing', tcode: 'QM02', description: 'Log production downtime expense into vendor QN debit memo' }
    ]
  },
  {
    questionId: 'Q40',
    questionText: 'Predict supplier quality risks.',
    category: 'Supplier Quality',
    sapSourceTables: ['LFA1', 'QINF', 'QALS', 'QAVE', 'MARA'],
    summaryAnswer: 'Predictive Quality AI model (evaluating scrap trends, vendor audit findings, raw material commodity shifts, and sub-tier supplier health) identifies 2 forward-looking supplier quality risks for Q4: 1) High Risk: DieCast Solutions (84% probability of lot rejection on upcoming 500-unit batch of RAW-AL-440 due to unresolved mold gating thermal fatigue), and 2) Medium Risk: ElectroSem Components (42% probability of moisture sensitivity failures during monsoon shipping season).',
    keyInsights: [
      'DieCast Solutions carries an 84% failure probability on next week\'s 500-unit shipment.',
      'Preventive Intervention: Deployed third-party pre-shipment inspection (PSI) at vendor facility before dispatch.',
      'ElectroSem Components risk mitigated by mandating Level 3 moisture barrier vacuum packaging with internal desiccant.',
      'Predictive alerts pushed directly to Plant Purchasing and QA Receiving Dock.'
    ],
    qmMetrics: [
      { label: 'High Risk Supplier', value: 'DieCast Solutions (84% Prob)', status: 'negative' },
      { label: 'Medium Risk Supplier', value: 'ElectroSem (42% Prob)', status: 'warning' },
      { label: 'Pre-Shipment Inspection', value: 'Mandated at Vendor', status: 'positive' },
      { label: 'Packaging Safeguard', value: 'Moisture Barrier Bag', status: 'positive' }
    ],
    breakdownData: [
      { category: 'DieCast Solutions (RAW-AL-440)', value: '84% Rejection Probability', variance: 'Tooling Fatigue', detail: 'Mold tooling reached 85,000 shots / Pre-shipment X-ray mandated' },
      { category: 'ElectroSem (ELEC-CAP-100)', value: '42% Rejection Probability', variance: 'Humidity Exposure', detail: 'Seasonal monsoon transit / Level 3 vacuum packaging verified' }
    ],
    recommendedSapActions: [
      { actionName: 'Predictive Quality Cockpit', tcode: 'Fiori F2168', description: 'Inspect ML risk scores and automated procurement intervention triggers' },
      { actionName: 'Mandate Pre-Shipment Inspection', tcode: 'QI02', description: 'Require Quality Certificate Type 3.1 (EN 10204) prior to ASN generation' }
    ]
  },

  // =========================================================================
  // PILLAR 5: COMPLIANCE & QUALITY ANALYTICS (Q41 - Q50)
  // =========================================================================
  {
    questionId: 'Q41',
    questionText: 'Show First Pass Yield (FPY).',
    category: 'Compliance & Quality Analytics',
    sapSourceTables: ['AFKO', 'AFRU', 'QALS', 'QAVE', 'COEP'],
    summaryAnswer: 'Corporate First Pass Yield (FPY) across all manufacturing lines currently stands at 94.8% MTD (against a 95.0% target): Line 1 (Assembly): 96.2%, Line 2 (Pump Testing): 95.8%, Line 3 (Heavy Machining): 91.4% (dragged down by CNC-02 bore drift), Line 4 (Electronics SMT): 97.4%, and Line 5 (Robotic Welding): 98.6%.',
    keyInsights: [
      'Corporate FPY is within 0.2% of annual corporate target (94.8% vs 95.0%).',
      'Electronics SMT (Line 4) and Robotic Welding (Line 5) exceed 97% world-class benchmarks.',
      'Machining Line 3 is the primary drag (91.4%); spindle overhaul scheduled to bring Line 3 FPY to >95.5%.',
      'Year-over-year FPY has improved by +1.4% across the enterprise.'
    ],
    qmMetrics: [
      { label: 'Corporate FPY', value: '94.8%', status: 'positive' },
      { label: 'Corporate Target', value: '95.0%', status: 'neutral' },
      { label: 'Best Line (Welding)', value: '98.6%', status: 'positive' },
      { label: 'Lowest Line (Machining)', value: '91.4%', status: 'warning' }
    ],
    breakdownData: [
      { category: 'Line 5 (Robotic Welding)', value: 'FPY: 98.6%', variance: 'Top Benchmark', detail: 'Argon gas sensor active / 0.4% defect rate' },
      { category: 'Line 4 (Electronics SMT)', value: 'FPY: 97.4%', variance: 'Above Target', detail: 'AOI optical inspection pass rate 98.8%' },
      { category: 'Line 1 (Main Assembly)', value: 'FPY: 96.2%', variance: 'Above Target', detail: 'Smart torque tools eliminated fastener variance' },
      { category: 'Line 2 (Hydrostatic Testing)', value: 'FPY: 95.8%', variance: 'Above Target', detail: 'Seal assembly jig deployed' },
      { category: 'Line 3 (Heavy Machining)', value: 'FPY: 91.4%', variance: 'Below Target (-3.6%)', detail: 'Spindle overhaul planned for this weekend' }
    ],
    recommendedSapActions: [
      { actionName: 'Production Order Quality Analysis', tcode: 'COOIS', description: 'Review scrap, rework, and yield confirmation distributions' },
      { actionName: 'Plant Quality Analytics', tcode: 'MC.1', description: 'Track monthly First Pass Yield trend lines and variance drivers' }
    ]
  },
  {
    questionId: 'Q42',
    questionText: 'Show Scrap Rate by plant.',
    category: 'Compliance & Quality Analytics',
    sapSourceTables: ['AFPO', 'AFRU', 'MSEG', 'COEP', 'T001W'],
    summaryAnswer: 'Scrap rate as a percentage of total manufacturing volume MTD across enterprise production sites: Plant 1000 (Dallas HQ Manufacturing): 1.62% scrap ($68,400 USD scrap value), Plant 1010 (Austin Electronics): 0.84% scrap ($24,200 USD), Plant 2000 (Hamburg Assembly): 1.25% scrap ($36,800 USD). Total corporate scrap rate is 1.34% against a corporate ceiling of <1.50%.',
    keyInsights: [
      'Total corporate scrap rate (1.34%) is well within the corporate threshold (<1.50%).',
      'Plant 1010 maintains the lowest scrap rate (0.84%) driven by automated SMT solder paste inspection (SPI).',
      'Plant 1000 scrap is concentrated in raw casting defects and rough machining setup cuts.',
      'All scrap transactions posted via SAP Movement Type 551 with mandatory scrap reason codes.'
    ],
    qmMetrics: [
      { label: 'Corporate Scrap Rate', value: '1.34%', status: 'positive' },
      { label: 'Target Ceiling', value: '< 1.50%', status: 'positive' },
      { label: 'Total Scrap Value MTD', value: '$129,400 USD', status: 'neutral' },
      { label: 'Best Plant (Austin)', value: '0.84%', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Plant 1010 (Austin Electronics)', value: '0.84% Scrap ($24,200)', variance: 'Top Performer', detail: 'SMT Line / Solder paste inspection & AOI catch defects early' },
      { category: 'Plant 2000 (Hamburg Assembly)', value: '1.25% Scrap ($36,800)', variance: 'On Target', detail: 'Modular pump skid assembly / Zero major structural scrap' },
      { category: 'Plant 1000 (Dallas HQ Mfg)', value: '1.62% Scrap ($68,400)', variance: 'Action Required', detail: 'Machining & casting scrap / CNC spindle overhaul will cut to 1.1%' }
    ],
    recommendedSapActions: [
      { actionName: 'Material Document List: Scrap', tcode: 'MB51', description: 'Review Movement Type 551 (Scrap goods issue) postings by plant and cost center' },
      { actionName: 'Cost Center Scrap Analysis', tcode: 'KSB1', description: 'Inspect cost center line items under Cost Element 600200 (Scrap Expense)' }
    ]
  },
  {
    questionId: 'Q43',
    questionText: 'Show Rework Rate by production line.',
    category: 'Compliance & Quality Analytics',
    sapSourceTables: ['AFKO', 'AFRU', 'COEP', 'CRHD'],
    summaryAnswer: 'Rework rate (percentage of production hours consumed by rework operations / Trigger Points) across Plant 1000 lines: Line 3 (Heavy Machining): 4.8% rework (92 hours), Line 2 (Pump Test): 3.2% rework (64 hours), Line 1 (Assembly): 2.1% rework (42 hours), Line 4 (Electronics): 1.4% rework (28 hours), and Line 5 (Welding): 0.6% rework (12 hours). Total plant rework cost MTD: $23,800 USD.',
    keyInsights: [
      'Total plant rework rate stands at 2.6% (238 rework hours across 9,150 total production hours).',
      'Line 3 accounts for 38.7% of all rework hours (honing oversized bores and de-burring threads).',
      'All rework operations logged against dedicated Rework Order Type (PP03) for precise cost tracking.',
      'Deployment of poka-yoke fixtures is projected to reduce Line 1/Line 2 rework by 50% next month.'
    ],
    qmMetrics: [
      { label: 'Plant Rework Rate', value: '2.6% (238 Hours)', status: 'neutral' },
      { label: 'Total Rework Cost', value: '$23,800 MTD', status: 'neutral' },
      { label: 'Highest Rework Line', value: 'Line 3 (4.8%)', status: 'warning' },
      { label: 'Lowest Rework Line', value: 'Line 5 (0.6%)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Line 3 (Heavy Machining)', value: '4.8% (92 hrs / $9,200)', variance: 'Spindle Drift', detail: 'Secondary honing passes on bearing housings' },
      { category: 'Line 2 (Hydrostatic Test)', value: '3.2% (64 hrs / $6,400)', variance: 'Seal Fitting', detail: 'Re-seating O-ring mechanical seals on test bench' },
      { category: 'Line 1 (Main Assembly)', value: '2.1% (42 hrs / $4,200)', variance: 'Fastener Torque', detail: 'Re-torquing flange bolts to updated spec' },
      { category: 'Line 4 (Electronics SMT)', value: '1.4% (28 hrs / $2,800)', variance: 'Solder Touchup', detail: 'Manual micro-soldering bridge touchup' },
      { category: 'Line 5 (Robotic Welding)', value: '0.6% (12 hrs / $1,200)', variance: 'Benchmark', detail: 'Minor cosmetic weld blending' }
    ],
    recommendedSapActions: [
      { actionName: 'Rework Order Cockpit', tcode: 'CO03', description: 'Review Order Type PP03 rework order settlement rules and confirmations' },
      { actionName: 'Confirmations with Scrap/Rework', tcode: 'CO14', description: 'Inspect operation confirmation actual labor hours and rework quantity' }
    ]
  },
  {
    questionId: 'Q44',
    questionText: 'Which products have the highest Cost of Poor Quality?',
    category: 'Compliance & Quality Analytics',
    sapSourceTables: ['COEP', 'QMEL', 'QALS', 'AFRU', 'MARA'],
    summaryAnswer: 'Total Cost of Poor Quality (COPQ = Scrap + Internal Rework + Vendor Non-conformance Handling + Customer Warranty Claims) MTD is $184,600 USD. The top 4 products accounting for 74.2% of total COPQ are: 1) FG-PUMP-500kW ($62,400 COPQ - Warranty claims & seal rework), 2) HALB-ROTOR-80 ($34,800 COPQ - Dynamic balancing scrap), 3) FG-COMP-C400 ($24,500 COPQ - Valve leakage rework), and 4) RAW-AL-440 ($15,200 COPQ - Quarantine inspection handling).',
    keyInsights: [
      'FG-PUMP-500kW accounts for 33.8% of enterprise COPQ, driven by customer warranty teardown expense.',
      'Implementing the Viton seal upgrade on FG-PUMP-500kW will eliminate an estimated $48,000/month in COPQ.',
      'Total COPQ represents 1.18% of total revenue (world-class benchmark is <1.50%).',
      'Target for Q4 is reducing COPQ to under $120,000/month.'
    ],
    qmMetrics: [
      { label: 'Total COPQ MTD', value: '$184,600 USD', status: 'warning' },
      { label: 'COPQ % of Revenue', value: '1.18% (Target < 1.5%)', status: 'positive' },
      { label: 'Top SKU Impact', value: 'FG-PUMP-500kW (33.8%)', status: 'negative' },
      { label: 'Projected Q4 Target', value: '< $120,000 / mo', status: 'positive' }
    ],
    breakdownData: [
      { category: 'FG-PUMP-500kW (Industrial Pump)', value: '$62,400 COPQ (33.8%)', variance: 'Warranty & Rework', detail: 'Customer warranty: $38k / Line rework: $16k / Scrap: $8.4k' },
      { category: 'HALB-ROTOR-80 (Rotor Assembly)', value: '$34,800 COPQ (18.8%)', variance: 'Balancing Scrap', detail: 'Scrap: $26k / Dynamic re-balancing: $8.8k' },
      { category: 'FG-COMP-C400 (Gas Compressor)', value: '$24,500 COPQ (13.3%)', variance: 'Valve Rework', detail: 'Test bench re-test: $14.5k / Gasket scrap: $10k' },
      { category: 'RAW-AL-440 (Alu Bracket)', value: '$15,200 COPQ (8.2%)', variance: 'Quarantine Handling', detail: 'Lab X-ray NDT screening and vendor debit processing' }
    ],
    recommendedSapActions: [
      { actionName: 'Cost of Quality Report', tcode: 'QM03', description: 'Analyze internal failure, external failure, appraisal, and prevention costs' },
      { actionName: 'Controlling Line Item Report', tcode: 'KSB1', description: 'Review scrap and warranty cost centers in CO-OM' }
    ]
  },
  {
    questionId: 'Q45',
    questionText: 'Show customer complaint trends.',
    category: 'Compliance & Quality Analytics',
    sapSourceTables: ['QMEL', 'QMFE', 'KNA1', 'MCV1'],
    summaryAnswer: 'Customer complaint volume (Type Q1 notifications) over the past 6 months shows a sustained downward trajectory: March (18 complaints), April (16), May (14), June (12), July (11), and August MTD (10 complaints). 6-month complaint frequency dropped by -44.4% following the rollout of automated end-of-line functional testing.',
    keyInsights: [
      'Customer complaint volume decreased by -44.4% over 6 consecutive months.',
      'Customer satisfaction rating (CSAT Quality Index) improved from 88.2% to 94.6%.',
      'Average time to complete 8D customer resolution dropped from 14.2 days to 6.8 days.',
      'Zero product safety recalls or regulatory field notifications in the 6-month period.'
    ],
    qmMetrics: [
      { label: '6-Month Trend', value: '-44.4% Complaints', status: 'positive' },
      { label: 'Current Month', value: '10 Complaints', status: 'positive' },
      { label: 'Avg 8D Resolution', value: '6.8 Days (Target < 10d)', status: 'positive' },
      { label: 'CSAT Quality Index', value: '94.6%', status: 'positive' }
    ],
    breakdownData: [
      { category: 'March 2026', value: '18 Complaints', variance: 'Baseline', detail: 'High seal leakage and packaging scuffing' },
      { category: 'April 2026', value: '16 Complaints', variance: '-11.1%', detail: 'Packaging redesign deployed' },
      { category: 'May 2026', value: '14 Complaints', variance: '-12.5%', detail: 'Smart torque wrenches deployed on Line 1' },
      { category: 'June 2026', value: '12 Complaints', variance: '-14.3%', detail: 'Argon gas welding controller activated' },
      { category: 'July 2026', value: '11 Complaints', variance: '-8.3%', detail: 'Automated EOL pressure test bench online' },
      { category: 'August 2026 (MTD)', value: '10 Complaints', variance: '-9.1%', detail: 'On track for lowest monthly complaint record' }
    ],
    recommendedSapActions: [
      { actionName: 'Customer Complaint Analytics', tcode: 'MCV1', description: 'Display longitudinal complaint trends and Pareto cause breakdown' },
      { actionName: 'Fiori Customer Complaints', tcode: 'Fiori F2168', description: 'Monitor customer 8D containment and resolution SLAs' }
    ]
  },
  {
    questionId: 'Q46',
    questionText: 'Which quality KPIs are outside target?',
    category: 'Compliance & Quality Analytics',
    sapSourceTables: ['QALS', 'QAVE', 'QMEL', 'AFRU', 'COEP'],
    summaryAnswer: 'Executive Quality Scorecard review across 10 corporate KPIs shows 8 KPIs within green target and 2 KPIs in yellow/amber variance: 1) Line 3 First Pass Yield: 91.4% (Target: > 95.0%; variance -3.6% due to CNC-02 tool drift), and 2) Vendor DieCast Solutions Quality Rating: 71.4 / 100 (Target: > 80.0; variance -8.6 points due to porosity). All other KPIs (Scrap, Customer Complaints, Corporate FPY, 8D SLA, ISO Audits) are fully compliant.',
    keyInsights: [
      '8 out of 10 corporate Quality KPIs are green and exceeding targets.',
      'Both amber KPIs have active engineering and procurement remediation plans.',
      'Line 3 FPY recovery plan: Spindle overhaul scheduled for this Saturday.',
      'DieCast Solutions recovery plan: On-site audit Tuesday + dual sourcing volume transfer.'
    ],
    qmMetrics: [
      { label: 'KPI Health', value: '8 Green / 2 Amber / 0 Red', status: 'positive' },
      { label: 'Line 3 FPY', value: '91.4% (Target > 95%)', status: 'warning' },
      { label: 'DieCast Quality Score', value: '71.4 (Target > 80)', status: 'warning' },
      { label: 'Remediation Plans', value: '100% Deployed', status: 'positive' }
    ],
    breakdownData: [
      { category: 'KPI: Corporate FPY', value: '94.8% (Target: 95.0%)', variance: 'Green (Normal)', detail: 'Corporate overall in healthy range' },
      { category: 'KPI: Line 3 FPY', value: '91.4% (Target: 95.0%)', variance: 'Amber (-3.6%)', detail: 'CNC-02 spindle overhaul scheduled Saturday' },
      { category: 'KPI: Scrap Rate', value: '1.34% (Target: < 1.50%)', variance: 'Green (Compliant)', detail: 'Well below corporate ceiling' },
      { category: 'KPI: DieCast Quality Rating', value: '71.4 (Target: > 80.0)', variance: 'Amber (-8.6 pts)', detail: 'Audit Tuesday / Dual sourcing active' },
      { category: 'KPI: 8D Resolution SLA', value: '6.8 Days (Target: < 10d)', variance: 'Green (Exceeding)', detail: 'Rapid containment across all accounts' }
    ],
    recommendedSapActions: [
      { actionName: 'Executive Quality Scorecard', tcode: 'Fiori F2168', description: 'Review live KPI status, thresholds, and historical trend cards' },
      { actionName: 'Quality Management Information System', tcode: 'MC.1', description: 'Run standardized monthly QM management reporting' }
    ]
  },
  {
    questionId: 'Q47',
    questionText: 'Predict future quality issues.',
    category: 'Compliance & Quality Analytics',
    sapSourceTables: ['QALS', 'QAMR', 'QMFE', 'CRHD', 'MARA'],
    summaryAnswer: 'AI Predictive Quality Engine (evaluating machine sensor telemetry, tool cycle wear counters, ambient humidity forecasts, and incoming raw material batch spectroscopy) forecasts 3 potential quality risks over the next 14 days: 1) CNC-07 Tool Wear Drift on Shaft Turning (78% probability of dimensional drift on batch SHAFT-12 in 5 days), 2) Ambient Humidity SMT Solder Voiding (62% probability during high-humidity forecast next week), and 3) DieCast Solutions Porosity in batch B-9960 (84% probability).',
    keyInsights: [
      '3 predictive quality risks flagged before operational impact occurs.',
      'Proactive tool offset replacement scheduled on CNC-07 after 3,800 cycles to preempt dimensional drift.',
      'SMT Cleanroom nitrogen purge flow increased to maintain moisture level below 40% RH during weather front.',
      'Preventive interventions eliminate an estimated $58,000 in potential scrap and rework.',
      'Machine learning model accuracy validated at 89.4% on 90-day backtesting.'
    ],
    qmMetrics: [
      { label: 'Forecasted Risks', value: '3 Early Warnings', status: 'warning' },
      { label: 'Preempted Scrap Cost', value: '$58,000 USD', status: 'positive' },
      { label: 'Model Accuracy', value: '89.4% Predictive Precision', status: 'positive' },
      { label: 'Interventions Staged', value: '3 Action Plans Ready', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Risk 1: CNC-07 Tool Wear Drift', value: '78% Probability in 5 Days', variance: 'Shaft Dimension', detail: 'Tool insert scheduled for change at 3,800 cycles' },
      { category: 'Risk 2: SMT Solder Voiding', value: '62% Probability in 8 Days', variance: 'Humidity Front', detail: 'Nitrogen purge rate adjusted to keep cleanroom < 40% RH' },
      { category: 'Risk 3: Casting Porosity B-9960', value: '84% Probability in 6 Days', variance: 'Vendor Mold Fatigue', detail: 'Pre-shipment NDT screening mandated at vendor dock' }
    ],
    recommendedSapActions: [
      { actionName: 'Predictive Quality AI Cockpit', tcode: 'Fiori F2168', description: 'Inspect early warning signals and approve automated preventive work orders' },
      { actionName: 'Create Preventive Maintenance Order', tcode: 'IW31', description: 'Schedule tool insert replacement and calibration service' }
    ]
  },
  {
    questionId: 'Q48',
    questionText: 'Which products are likely to fail inspection?',
    category: 'Compliance & Quality Analytics',
    sapSourceTables: ['QALS', 'QAMR', 'MARA', 'AFPO', 'QINF'],
    summaryAnswer: 'Based on multi-variable predictive inspection risk modeling (combining supplier material batch chemistry, work center telemetry, and technician training currency), the following 2 production batches have an elevated probability of inspection failure: 1) FG-PUMP-500kW (Batch B-8850, Production Order 1004210 - 45% probability of hydrostatic seal failure if assembled prior to gland plate chamfer verification), and 2) COMP-VALVE-09 (Batch B-9942 - 38% probability of pressure relief valve drift).',
    keyInsights: [
      '2 production batches flagged with >35% failure probability.',
      'Batch B-8850: Quality hold automatically placed on Assembly Step 0040 until gland plate chamfer verification is completed.',
      'Batch B-9942: Pilot 5-unit sample pre-tested in lab before mass assembly release.',
      'Zero customer deliveries impacted; automated guardrails enforce in-line verification.'
    ],
    qmMetrics: [
      { label: 'Batches at Risk', value: '2 Production Batches', status: 'warning' },
      { label: 'Highest Risk Batch', value: 'Batch B-8850 (45% Prob)', status: 'negative' },
      { label: 'Guardrail In Place', value: 'Step 0040 Quality Gate', status: 'positive' },
      { label: 'Protected Revenue', value: '$380,000 USD', status: 'positive' }
    ],
    breakdownData: [
      { category: 'FG-PUMP-500kW (Batch B-8850)', value: '45% Inspection Failure Prob', variance: 'Gland Chamfer', detail: 'Order 1004210 / Pre-assembly digital micrometer check active' },
      { category: 'COMP-VALVE-09 (Batch B-9942)', value: '38% Inspection Failure Prob', variance: 'Relief Setting', detail: 'Order 1004218 / 5-piece pilot sample pre-tested in lab' }
    ],
    recommendedSapActions: [
      { actionName: 'Inspection Point Confirmation', tcode: 'QE11', description: 'Enforce mandatory inspection point result recording before order confirmation' },
      { actionName: 'Production Order Hold', tcode: 'CO02', description: 'Assign User Status HOLD to prevent unauthorized goods movement' }
    ]
  },
  {
    questionId: 'Q49',
    questionText: 'Show quality audit findings.',
    category: 'Compliance & Quality Analytics',
    sapSourceTables: ['PLMD_AUDIT', 'QMSM', 'QMEL', 'TJ02T'],
    summaryAnswer: 'Annual ISO 9001 / IATF 16949 Internal Quality Audit (Audit AUD-2026-01, conducted last month across Plant 1000) concluded with a 94.2% overall compliance score. Summary of findings: 0 Major Non-Conformances, 3 Minor Non-Conformances (Minor 1: Incomplete calibration sticker on backup multimeter in Lab 2; Minor 2: Outdated revision drawing in Workstation 5 binder; Minor 3: Delay in closing vendor SCAR on Continental Seals), and 4 Opportunities for Improvement (OFIs).',
    keyInsights: [
      'Zero Major Non-Conformances recorded during the comprehensive ISO 9001 audit.',
      'All 3 Minor Non-Conformances have corrective action plans assigned with 30-day resolution targets.',
      'Minor 1 (Calibration): Multimeter recalibrated and tagged; digital calibration registry updated.',
      'Minor 2 (Document Control): Paper binders removed; digital tablets with live SAP DMS drawings deployed.',
      'External ISO certification renewal audit confirmed for Q4 with zero blocking flags.'
    ],
    qmMetrics: [
      { label: 'Audit Score', value: '94.2% Compliant', status: 'positive' },
      { label: 'Major Non-Conformances', value: '0 Major', status: 'positive' },
      { label: 'Minor Non-Conformances', value: '3 Minor', status: 'neutral' },
      { label: 'OFIs (Improvements)', value: '4 Recommendations', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Minor 1: Lab Calibration Tag', value: 'Status: Closed & Verified', variance: 'Lab 2 Meter', detail: 'Multimeter re-certified / Digital calibration portal updated' },
      { category: 'Minor 2: Document Control Rev', value: 'Status: Closed & Verified', variance: 'Shop Floor Binder', detail: 'Paper binder replaced with locked digital DMS tablet' },
      { category: 'Minor 3: SCAR Closure Delay', value: 'Status: In Progress (Due 10d)', variance: 'Vendor Conti Seals', detail: '8D report effectiveness verification in progress' }
    ],
    recommendedSapActions: [
      { actionName: 'Audit Management Cockpit', tcode: 'PLMD_AUDIT', description: 'Review audit report, findings catalog, and corrective action milestone tracking' },
      { actionName: 'Document Management System', tcode: 'CV03N', description: 'Verify document info record (DIR) release status and shop floor viewing' }
    ]
  },
  {
    questionId: 'Q50',
    questionText: "What are today's highest quality risks?",
    category: 'Compliance & Quality Analytics',
    sapSourceTables: ['QALS', 'QMEL', 'QAVE', 'AFKO', 'LFA1', 'COEP'],
    summaryAnswer: "Today's top 4 operational and commercial quality risks across the enterprise are: 1) ABB Power Customer Complaint 8D (Revenue Risk: $1.2M; Impeller vibration root cause isolation required for customer sync tomorrow), 2) Machining Line 3 CNC-02 Spindle Vibration Drift (Operational Risk: $1,850/hr downtime; overhaul scheduled Saturday), 3) Quarantined DieCast Solutions Alloy Lot (Supply Risk: $48k stock; alternative batch released to prevent line starvation), and 4) Expedited Customer Shipment Hold on Delivery 80019234 (OTIF Risk: $380k pump order; release target 16:30 today).",
    keyInsights: [
      'Comprehensive multi-source quality risk evaluation covering customer, operational, supply, and logistics dimensions.',
      'Active mitigation safeguards and containment protocols deployed across all 4 risk events.',
      'Zero customer delivery delays and zero safety/regulatory non-compliances.',
      'Quality Management Operations Center continuously monitoring real-time telemetry.'
    ],
    qmMetrics: [
      { label: 'Highest Quality Risk', value: 'ABB Customer Complaint', status: 'negative' },
      { label: 'Total Value at Risk', value: '$1,628,000 USD', status: 'negative' },
      { label: 'Mitigation Status', value: '100% Contained', status: 'positive' },
      { label: 'Customer OTIF Protected', value: '100% On Schedule', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Risk 1: Customer Account (ABB)', value: '$1,200,000 at Stake', variance: '8D Stage D5', detail: 'Impeller teardown in metallurgical lab / Executive sync tomorrow' },
      { category: 'Risk 2: Customer Shipment (Siemens)', value: '$380,000 on Hold', variance: 'Delivery 80019234', detail: 'Relief valve calibration completing; release at 16:30 today' },
      { category: 'Risk 3: Vendor Material (DieCast)', value: '$48,200 Quarantined', variance: 'Casting Porosity', detail: 'Backup buffer batch released to avoid Line 2 starvation' },
      { category: 'Risk 4: Production Machine (CNC-02)', value: '$1,850/hr Lost Time', variance: 'Spindle Bearing', detail: 'Spindle replacement overhaul scheduled Saturday 06:00' }
    ],
    recommendedSapActions: [
      { actionName: 'Executive Quality Overview', tcode: 'Fiori F2168', description: 'Display real-time enterprise quality control tower and live risk radar' },
      { actionName: 'Inspection Lot Worklist', tcode: 'QA32', description: 'Monitor high-priority inspection lots and execute usage decisions' }
    ]
  }
];
