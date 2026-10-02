import { TmExecutiveQuestionAnswer } from '../types';

export const ALL_TM_EXECUTIVE_QUESTIONS: TmExecutiveQuestionAnswer[] = [
  // =========================================================================
  // PILLAR 1: TRANSPORTATION PLANNING (Q1 - Q10)
  // =========================================================================
  {
    questionId: 'Q1',
    questionText: 'Show all freight units created today.',
    category: 'Transportation Planning',
    sapSourceTables: ['/SCMTMS/D_TORROT', '/SCMTMS/D_TORITE', 'LIKP', 'LIPS', 'VBAK'],
    summaryAnswer: "Today, 48 Freight Units (FUs) have been generated across Shipping Points 1000 and 1010, originating from 34 Outbound Deliveries (LIKP) and 14 Stock Transport Orders. 41 FUs are fully assigned to freight stages with valid load profiles.",
    keyInsights: [
      '48 Total Freight Units generated today from ERP delivery integration.',
      '41 FUs successfully consolidated into planned road and intermodal stages.',
      '7 FUs pending carrier capacity matching in the Transportation Cockpit.'
    ],
    transportationMetrics: [
      { label: 'Total Freight Units', value: '48 FUs', status: 'positive' },
      { label: 'Planned FUs', value: '41 FUs', status: 'positive' },
      { label: 'Unplanned FUs', value: '7 FUs', status: 'warning' },
      { label: 'Total Gross Weight', value: '384.2 TO', status: 'neutral' }
    ],
    breakdownData: [
      { category: 'FU-800101 (SP 1000 -> Munich)', value: '18.4 TO / 42 CBM', variance: 'Planned', detail: 'Consolidated into FO-60098120 (DHL Express)' },
      { category: 'FU-800102 (SP 1000 -> Frankfurt)', value: '22.1 TO / 58 CBM', variance: 'Planned', detail: 'Assigned to FO-60098121 (Kuehne+Nagel)' },
      { category: 'FU-800103 (SP 1010 -> Hamburg)', value: '14.5 TO / 35 CBM', variance: 'Unplanned', detail: 'Awaiting ADR hazmat equipment validation' },
      { category: 'FU-800104 (SP 1000 -> Stuttgart)', value: '9.2 TO / 22 CBM', variance: 'Planned', detail: 'Milk-run stage assigned to Schenker FTL' }
    ],
    recommendedSapActions: [
      { actionName: 'Transportation Cockpit', tcode: '/SCMTMS/PLN', description: 'Open VSR optimizer cockpit to review and dispatch open freight units.' },
      { actionName: 'Manage Freight Units', tcode: '/SCMTMS/FU_VIEW', description: 'Inspect stage split, item hierarchy, and delivery link references.' }
    ]
  },
  {
    questionId: 'Q2',
    questionText: 'Which freight units are not yet planned?',
    category: 'Transportation Planning',
    sapSourceTables: ['/SCMTMS/D_TORROT', '/SCMTMS/D_TORSTP', '/SCMTMS/D_TRQROT'],
    summaryAnswer: 'There are currently 7 unplanned Freight Units with a combined weight of 68.4 tons. 4 FUs are scheduled for outbound shipment within 24 hours, and 3 FUs are pending due to special hazmat (ADR) handling and temperature-controlled reefer requirements.',
    keyInsights: [
      '7 Unplanned FUs identified with status "Not Planned" (TOR_TYPE = 01).',
      'FU-800103 & FU-800108 require refrigerated reefer equipment (-18°C).',
      'VSR optimizer heuristic can bundle 5 of these FUs into a single multi-drop FTL.'
    ],
    transportationMetrics: [
      { label: 'Unplanned FUs', value: '7 FUs', status: 'warning' },
      { label: 'Unplanned Weight', value: '68.4 TO', status: 'warning' },
      { label: 'Next 24h Due', value: '4 FUs', status: 'negative' },
      { label: 'Hazmat / Temp Hold', value: '3 FUs', status: 'neutral' }
    ],
    breakdownData: [
      { category: 'FU-800103 (Chemical Adhesives)', value: '14.5 TO', variance: 'Urgent (<12h)', detail: 'Requires Reefer + ADR Class 3 transport' },
      { category: 'FU-800108 (Pharma Extracts)', value: '8.2 TO', variance: 'Urgent (<18h)', detail: 'Temperature logger profile +2°C to +8°C required' },
      { category: 'FU-800115 (Industrial Valves)', value: '16.0 TO', variance: 'Standard', detail: 'Eligible for LTL consolidation on Lane DE-10 to AT-20' },
      { category: 'FU-800122 (Steel Fasteners)', value: '29.7 TO', variance: 'Standard', detail: 'Exceeds standard 24 TO axle limit; needs 40ft Flatbed' }
    ],
    recommendedSapActions: [
      { actionName: 'VSR Optimization Run', tcode: '/SCMTMS/OPT_RUN', description: 'Trigger automatic Vehicle Scheduling and Routing optimizer run for unplanned FUs.' },
      { actionName: 'Freight Unit Worklist', tcode: '/SCMTMS/WORKLIST', description: 'Filter by Planning Status = Not Planned and assign to resources.' }
    ]
  },
  {
    questionId: 'Q3',
    questionText: 'Show shipments scheduled for today.',
    category: 'Transportation Planning',
    sapSourceTables: ['/SCMTMS/D_TORROT', 'VTTK', 'VTTP', '/SCMTMS/D_SCHED'],
    summaryAnswer: 'A total of 26 Freight Orders / Shipments are scheduled for departure today across all company manufacturing plants and logistics hubs. 18 orders are in staging/loading status, 5 have departed on schedule, and 3 are in tendering confirmation.',
    keyInsights: [
      '26 Shipments scheduled across Road (22), Intermodal Rail (3), and Air Express (1).',
      'Total scheduled freight volume: 542 Tons spanning 1,180 pallet spaces.',
      'Peak loading window at Plant 1000 shipping dock occurs between 14:00 and 17:30 UTC.'
    ],
    transportationMetrics: [
      { label: 'Scheduled Shipments', value: '26 Orders', status: 'positive' },
      { label: 'Departed On-Time', value: '5 Orders', status: 'positive' },
      { label: 'In Loading / Staging', value: '18 Orders', status: 'positive' },
      { label: 'Tendering / Pending', value: '3 Orders', status: 'warning' }
    ],
    breakdownData: [
      { category: 'FO-60098120 (FTL Road)', value: 'Munich Hub (18.4 TO)', variance: 'Loading (Gate 4)', detail: 'Carrier: DHL Freight | Departure: 14:00' },
      { category: 'FO-60098121 (FTL Road)', value: 'Frankfurt Hub (22.1 TO)', variance: 'Departed 09:30', detail: 'Carrier: Kuehne+Nagel | ETA: 16:45' },
      { category: 'FO-60098124 (Rail Intermodal)', value: 'Rotterdam Port (44.0 TO)', variance: 'Staged (Siding 2)', detail: 'Carrier: DB Cargo | Departure: 18:00' },
      { category: 'FO-60098127 (Air Freight)', value: 'Chicago O\'Hare (3.8 TO)', variance: 'Customs Cleared', detail: 'Carrier: Lufthansa Cargo | Flight LH8220' }
    ],
    recommendedSapActions: [
      { actionName: 'Transportation Execution Cockpit', tcode: '/SCMTMS/EXEC', description: 'Monitor live dock gate status, loading confirmations, and departure milestones.' },
      { actionName: 'Shipment Overview', tcode: 'VT11', description: 'View overall ERP shipment list with planning and shipment start timestamps.' }
    ]
  },
  {
    questionId: 'Q4',
    questionText: 'Which transportation orders are delayed?',
    category: 'Transportation Planning',
    sapSourceTables: ['/SCMTMS/D_TORROT', '/SCMTMS/D_EXECST', '/SCMTMS/D_TORSTP'],
    summaryAnswer: '4 Transportation Orders are currently experiencing transit or loading delays. The average delay is 85 minutes, caused primarily by motorway congestion on the A3 corridor and dock turnaround delays at the Nuremberg cross-dock.',
    keyInsights: [
      '4 Active Freight Orders delayed against original planned arrival timestamp.',
      'FO-60098115 is delayed by 130 mins on Autobahn A3 (Carrier: Dachser).',
      'Automated milestone calculation indicates 0 customer SLAs will be breached if expedited routing is triggered.'
    ],
    transportationMetrics: [
      { label: 'Delayed Orders', value: '4 Orders', status: 'warning' },
      { label: 'Avg Transit Delay', value: '85 mins', status: 'warning' },
      { label: 'Max Delay (FO-60098115)', value: '130 mins', status: 'negative' },
      { label: 'At-Risk Customer Orders', value: '2 Deliveries', status: 'warning' }
    ],
    breakdownData: [
      { category: 'FO-60098115 (Dachser Logistics)', value: '+130 mins delay', variance: 'A3 Traffic Hold', detail: 'ETA updated from 14:15 to 16:25 | Delivery 8009912' },
      { category: 'FO-60098119 (Schenker Euro)', value: '+75 mins delay', variance: 'Dock Queue', detail: 'Nuremberg cross-dock queue | ETA 17:45' },
      { category: 'FO-60098108 (Mainfreight Express)', value: '+45 mins delay', variance: 'Driver Rest Break', detail: 'Mandatory EU tachograph rest stop completed' },
      { category: 'FO-60098130 (DHL Freight)', value: '+90 mins delay', variance: 'Border Inspection', detail: 'Brenner Pass customs spot-check clearance' }
    ],
    recommendedSapActions: [
      { actionName: 'Event Handler & Tracking', tcode: '/SCMTMS/TRACKING', description: 'Inspect telematics GPS ping records and update expected arrival milestones.' },
      { actionName: 'Change Freight Order', tcode: '/SCMTMS/TOR_CHG', description: 'Re-assign unloading appointment slot and notify receiving plant.' }
    ]
  },
  {
    questionId: 'Q5',
    questionText: 'Which loads are not assigned to a carrier?',
    category: 'Transportation Planning',
    sapSourceTables: ['/SCMTMS/D_TORROT', '/SCMTMS/D_TEND_REQ', 'BUT000'],
    summaryAnswer: '5 Freight Orders have been planned and consolidated but do not yet have an assigned or confirmed carrier. 3 orders are currently in active broadcast tendering, and 2 require manual spot-bid quotation due to specialized low-bed trailer requirements.',
    keyInsights: [
      '5 Freight Orders (Total Volume: 112 TO) lack confirmed carrier assignment.',
      'FO-60098135: In 2nd round cascade tendering (Round 1 rejected by primary carrier).',
      'FO-60098138 & FO-60098140: Heavy machinery requiring oversized low-boy trailer.'
    ],
    transportationMetrics: [
      { label: 'Unassigned Loads', value: '5 Orders', status: 'warning' },
      { label: 'In Tendering Broadcast', value: '3 Orders', status: 'neutral' },
      { label: 'Spot Bid Required', value: '2 Orders', status: 'warning' },
      { label: 'Target Departure Horizon', value: 'Within 18h', status: 'negative' }
    ],
    breakdownData: [
      { category: 'FO-60098135 (Stuttgart -> Lyon)', value: '24.0 TO FTL', variance: 'Tender Round 2', detail: 'Sent to Geodis & DSV; expires in 42 mins' },
      { category: 'FO-60098136 (Munich -> Milan)', value: '18.5 TO FTL', variance: 'Tender Round 1', detail: 'Sent to Fercam Transport; expires in 25 mins' },
      { category: 'FO-60098137 (Hamburg -> Warsaw)', value: '21.0 TO FTL', variance: 'Tender Round 1', detail: 'Sent to Raben Group; expires in 30 mins' },
      { category: 'FO-60098138 (Heavy Press Module)', value: '38.0 TO Oversize', variance: 'Manual Spot Bid', detail: 'Requires escort vehicle and special road permit' }
    ],
    recommendedSapActions: [
      { actionName: 'Carrier Tendering Monitor', tcode: '/SCMTMS/TEND_MON', description: 'Review live carrier responses, tender deadlines, and price bids.' },
      { actionName: 'Assign Carrier Directly', tcode: '/SCMTMS/CARRIER_SEL', description: 'Select secondary ranking contract carrier or execute spot assignment.' }
    ]
  },
  {
    questionId: 'Q6',
    questionText: 'Which shipments are missing equipment?',
    category: 'Transportation Planning',
    sapSourceTables: ['/SCMTMS/RES_RES', '/SCMTMS/D_TORROT', '/SCMTMS/D_TORITE'],
    summaryAnswer: '3 scheduled shipments are blocked from dispatch because the required equipment type (Vehicle Resource / Container) has not been confirmed or positioned at the loading bay: 2 refrigerated trailers (REEFER-40) and 1 curtain-sider high-cube (TA-CURT-HC).',
    keyInsights: [
      '3 Shipments missing verified physical equipment at Plant 1000.',
      'Reefer shortage at Gate 7 due to delayed return of empty unit EQ-REF-099.',
      'S/4HANA TM Resource Management has identified available backup units at nearby depot.'
    ],
    transportationMetrics: [
      { label: 'Missing Equipment', value: '3 Shipments', status: 'warning' },
      { label: 'Impacted Weight', value: '54.5 TO', status: 'warning' },
      { label: 'Reefer Units Deficit', value: '2 Trailers', status: 'negative' },
      { label: 'Depot Availability', value: '4 Units Avail', status: 'positive' }
    ],
    breakdownData: [
      { category: 'FO-60098141 (Pharma Cold Chain)', value: 'Needs REEFER-40', variance: 'Deficit', detail: 'Depot Hamburg has 2 available; positioning takes 1.5h' },
      { category: 'FO-60098142 (Fresh Food Dairy)', value: 'Needs REEFER-40', variance: 'Deficit', detail: 'Gate 8 slot held until 15:00 UTC' },
      { category: 'FO-60098144 (Automotive Sheet)', value: 'Needs TA-CURT-HC', variance: 'Deficit', detail: 'Requires 3.0m internal height clearance' }
    ],
    recommendedSapActions: [
      { actionName: 'Vehicle Resource Cockpit', tcode: '/SCMTMS/RES', description: 'Check resource availability, equipment positioning schedules, and calendar.' },
      { actionName: 'Equipment Requisition Order', tcode: '/SCMTMS/EQ_REQ', description: 'Trigger positioning order for 2 Reefer units from Hamburg container depot.' }
    ]
  },
  {
    questionId: 'Q7',
    questionText: 'Show freight orders by plant, shipping point, or region.',
    category: 'Transportation Planning',
    sapSourceTables: ['/SCMTMS/D_TORROT', 'TVST', 'T001W', '/SCMTMS/D_TORSTP'],
    summaryAnswer: 'Freight orders are distributed across 3 primary shipping points: Shipping Point 1000 (Central Plant) accounts for 16 FOs (342 TO), Shipping Point 1010 (Hamburg Export) accounts for 7 FOs (138 TO), and Shipping Point 2000 (Frankfurt Distribution) has 3 FOs (62 TO).',
    keyInsights: [
      'Central Plant SP 1000 represents 61.5% of total active freight volume today.',
      'Domestic Region (DE) accounts for 18 FOs; European Cross-border (EU) accounts for 8 FOs.',
      'Hamburg Export SP 1010 handles 100% of maritime container drayage.'
    ],
    transportationMetrics: [
      { label: 'SP 1000 (Central Plant)', value: '16 Orders (342 TO)', status: 'positive' },
      { label: 'SP 1010 (Hamburg Export)', value: '7 Orders (138 TO)', status: 'positive' },
      { label: 'SP 2000 (Frankfurt DC)', value: '3 Orders (62 TO)', status: 'positive' },
      { label: 'Total Freight Volume', value: '542.0 TO', status: 'neutral' }
    ],
    breakdownData: [
      { category: 'SP 1000 - Road FTL / LTL', value: '16 FOs / 342 TO', variance: 'Active', detail: 'Destinations: DE-South, AT, CH, FR | 94% on-schedule' },
      { category: 'SP 1010 - Ocean Drayage & Road', value: '7 FOs / 138 TO', variance: 'Active', detail: 'Destinations: Port of Hamburg, Antwerp, Rotterdam' },
      { category: 'SP 2000 - Regional Distribution', value: '3 FOs / 62 TO', variance: 'Active', detail: 'Destinations: Rhein-Main express customer deliveries' }
    ],
    recommendedSapActions: [
      { actionName: 'Transportation Network Cockpit', tcode: '/SCMTMS/NET_VIEW', description: 'Analyze geographical transport volume by shipping point and transport zone.' },
      { actionName: 'Freight Order List by Shipping Point', tcode: '/SCMTMS/FO_LIST', description: 'Filter and export order schedules categorized by plant hierarchy.' }
    ]
  },
  {
    questionId: 'Q8',
    questionText: 'Which shipments are at risk of missing delivery dates?',
    category: 'Transportation Planning',
    sapSourceTables: ['/SCMTMS/D_TORROT', '/SCMTMS/D_EXECST', 'VBAK', 'VBAP'],
    summaryAnswer: '3 shipments carrying customer delivery commitments are currently flagged at risk of missing customer agreed delivery windows (SLA breach probability >70%): 2 due to transit delays on long-haul legs and 1 due to customs documentation hold at the Swiss border.',
    keyInsights: [
      '3 Customer shipments at critical SLA breach risk without active intervention.',
      'FO-60098115 (Customer: Bosch Rexroth AG) buffer reduced to 15 mins.',
      'FO-60098129 (Customer: Nestlé Suisse SA) delayed at Basel customs clearance.',
      'Immediate carrier escalation or team-driver handover can recover 45-60 mins.'
    ],
    transportationMetrics: [
      { label: 'At-Risk Shipments', value: '3 Shipments', status: 'negative' },
      { label: 'At-Risk Sales Value', value: '€428,500', status: 'negative' },
      { label: 'Avg Projected Delay', value: '75 mins', status: 'warning' },
      { label: 'SLA Breach Penalty Risk', value: '€14,200', status: 'warning' }
    ],
    breakdownData: [
      { category: 'FO-60098115 (Bosch Rexroth)', value: 'Projected +90m late', variance: 'High Risk', detail: 'Original Delivery: 16:00 | Updated ETA: 17:30 | Order 1004289' },
      { category: 'FO-60098129 (Nestlé Suisse)', value: 'Projected +110m late', variance: 'High Risk', detail: 'Basel Border T1 transit form validation pending | Order 1004312' },
      { category: 'FO-60098133 (Airbus Toulouse)', value: 'Projected +60m late', variance: 'Moderate Risk', detail: 'Toulouse cross-dock transit connection tight | Order 1004355' }
    ],
    recommendedSapActions: [
      { actionName: 'Customer SLA Alert Dashboard', tcode: '/SCMTMS/SLA_MON', description: 'Review high-priority customer delivery dates and trigger logistics alerts.' },
      { actionName: 'Expedited Transport Rerouting', tcode: '/SCMTMS/REROUTE', description: 'Authorize team driver replacement or express relay routing.' }
    ]
  },
  {
    questionId: 'Q9',
    questionText: "Show today's transportation workload.",
    category: 'Transportation Planning',
    sapSourceTables: ['/SCMTMS/D_TORROT', '/SCMTMS/D_TORITE', '/SCMTMS/RES_RES'],
    summaryAnswer: "Today's transportation workload encompasses 26 Freight Orders, 48 Freight Units, 1,180 pallet positions (542 Tons gross weight), and 14 distinct carrier logistics partners. Dock utilization across all 8 loading bays is operating at 86.4% capacity.",
    keyInsights: [
      '542.0 Tons across 26 Freight Orders and 48 Freight Units scheduled today.',
      'Peak loading volume scheduled for Shift 2 (14:00 - 22:00 UTC): 310 Tons.',
      'Overall transportation fulfillment capacity index is operating smoothly at 92.8%.'
    ],
    transportationMetrics: [
      { label: 'Daily Freight Volume', value: '542.0 TO', status: 'positive' },
      { label: 'Total Pallets Staged', value: '1,180 Pallets', status: 'positive' },
      { label: 'Dock Bay Utilization', value: '86.4%', status: 'neutral' },
      { label: 'Active Fleet Partners', value: '14 Carriers', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Shift 1 (06:00 - 14:00)', value: '182 TO / 8 FOs', variance: 'Complete (100%)', detail: 'All 8 morning shipments loaded and dispatched on time' },
      { category: 'Shift 2 (14:00 - 22:00)', value: '310 TO / 15 FOs', variance: 'In Progress (68%)', detail: 'Peak cross-dock consolidation and outbound linehauls' },
      { category: 'Shift 3 (22:00 - 06:00)', value: '50 TO / 3 FOs', variance: 'Scheduled', detail: 'Overnight intermodal rail feeder and air express freight' }
    ],
    recommendedSapActions: [
      { actionName: 'Transportation Workload Overview', tcode: '/SCMTMS/WORKLOAD', description: 'Display graphical workload distribution by time bucket and transport mode.' },
      { actionName: 'Dock Appointment Scheduling', tcode: '/SCMTMS/DAS', description: 'Rebalance dock door reservations to prevent afternoon staging queues.' }
    ]
  },
  {
    questionId: 'Q10',
    questionText: 'What transportation issues need immediate attention?',
    category: 'Transportation Planning',
    sapSourceTables: ['/SCMTMS/D_TORROT', '/SCMTMS/D_EXECST', '/SCMTMS/D_TEND_REQ'],
    summaryAnswer: 'There are 3 urgent transportation issues requiring immediate operational resolution: 1) FO-60098135 carrier tender rejected twice on the Stuttgart-Lyon lane, 2) Missing REEFER-40 trailer at Gate 7 for pharma shipment FO-60098141, and 3) Customs documentation delay at Basel border on FO-60098129.',
    keyInsights: [
      'Issue 1: Tender cascade exhausted on Lane DE-10 -> FR-69; requires spot authorization.',
      'Issue 2: Pharma temperature-sensitive load holds at dock without active cooling.',
      'Issue 3: Swiss customs transit document T1 requires digital re-submission via GTS.'
    ],
    transportationMetrics: [
      { label: 'Critical Action Items', value: '3 Issues', status: 'negative' },
      { label: 'Tender Exhaustion', value: '1 Order', status: 'warning' },
      { label: 'Equipment Hold', value: '1 Order', status: 'warning' },
      { label: 'Customs Transit Hold', value: '1 Order', status: 'warning' }
    ],
    breakdownData: [
      { category: '1. Tender Exhausted (FO-60098135)', value: 'Stuttgart -> Lyon', variance: 'Immediate Spot', detail: 'Award to secondary carrier Geodis at pre-agreed spot cap €1,450' },
      { category: '2. Cold Chain Equipment (FO-60098141)', value: 'Pharma 8.2 TO', variance: 'Reposition Unit', detail: 'Position backup Reefer EQ-REF-042 from Hamburg depot immediately' },
      { category: '3. Customs Clearance (FO-60098129)', value: 'Basel Border T1', variance: 'GTS Resubmit', detail: 'Re-trigger SAP GTS electronic declaration message EDI-850' }
    ],
    recommendedSapActions: [
      { actionName: 'Transportation Control Tower Alerts', tcode: '/SCMTMS/ALERT_MON', description: 'Acknowledge active critical alerts and execute automated resolution workflows.' },
      { actionName: 'Emergency Spot Tendering', tcode: '/SCMTMS/SPOT_TEND', description: 'Broadcast urgent spot request to vetted partner carrier network.' }
    ]
  },

  // =========================================================================
  // PILLAR 2: CARRIER MANAGEMENT (Q11 - Q20)
  // =========================================================================
  {
    questionId: 'Q11',
    questionText: 'Which carriers are performing best?',
    category: 'Carrier Management',
    sapSourceTables: ['/SCMTMS/D_TORROT', '/SCMTMS/D_TEND_REQ', 'BUT000', 'LFA1'],
    summaryAnswer: 'DHL Global Forwarding and Kuehne+Nagel are the top-performing carriers this month, achieving 98.4% and 97.2% On-Time Delivery (OTD) rates, tender acceptance rates above 94%, and zero freight cargo damage claims across 185 completed shipments.',
    keyInsights: [
      'DHL Global Forwarding: 98.4% OTD, 96.1% tender acceptance, avg delay <8 mins.',
      'Kuehne+Nagel: 97.2% OTD, 94.5% tender acceptance, strong intermodal capability.',
      'Both carriers qualify for Tier-1 preferred carrier allocation in S/4HANA TM.'
    ],
    transportationMetrics: [
      { label: 'Top Carrier (DHL)', value: '98.4% OTD', status: 'positive' },
      { label: '2nd Carrier (K+N)', value: '97.2% OTD', status: 'positive' },
      { label: 'Tender Acceptance', value: '95.3% Avg', status: 'positive' },
      { label: 'Freight Claims Rate', value: '0.00%', status: 'positive' }
    ],
    breakdownData: [
      { category: 'DHL Global Forwarding', value: 'Score: 96.8 / 100', variance: 'Top Performer', detail: '108 Shipments | 98.4% OTD | Tender Acc: 96.1% | Avg Cost: €1.42/km' },
      { category: 'Kuehne + Nagel Logistics', value: 'Score: 95.4 / 100', variance: 'Top Performer', detail: '77 Shipments | 97.2% OTD | Tender Acc: 94.5% | Avg Cost: €1.45/km' },
      { category: 'DB Schenker Logistics', value: 'Score: 91.2 / 100', variance: 'Preferred', detail: '64 Shipments | 93.8% OTD | Tender Acc: 89.2% | Avg Cost: €1.38/km' },
      { category: 'Dachser SE', value: 'Score: 89.6 / 100', variance: 'Preferred', detail: '52 Shipments | 91.5% OTD | Tender Acc: 88.0% | Avg Cost: €1.39/km' }
    ],
    recommendedSapActions: [
      { actionName: 'Carrier Evaluation Cockpit', tcode: '/SCMTMS/CARRIER_EVAL', description: 'Review carrier scorecard rankings, performance weights, and SLA compliance.' },
      { actionName: 'Contract Allocation Quota', tcode: '/SCMTMS/ALLOC_QUOTA', description: 'Increase target allocation share for Tier-1 carriers in carrier selection profile.' }
    ]
  },
  {
    questionId: 'Q12',
    questionText: 'Which carriers have the highest delay rate?',
    category: 'Carrier Management',
    sapSourceTables: ['/SCMTMS/D_TORROT', '/SCMTMS/D_EXECST', 'BUT000'],
    summaryAnswer: 'Trans-Europa Express and Balkan Freight Logistics exhibit the highest delay rates over the past 30 days, with delay rates of 18.2% and 15.6% respectively and an average delay of 115 minutes per delayed shipment, primarily on Eastern European corridors.',
    keyInsights: [
      'Trans-Europa Express: 18.2% delay rate across 33 shipments (avg delay 122 mins).',
      'Balkan Freight Logistics: 15.6% delay rate across 28 shipments (avg delay 108 mins).',
      'Root causes: Border crossing queue mismanagement and driver rest hour scheduling.'
    ],
    transportationMetrics: [
      { label: 'Highest Delay Rate', value: '18.2% (Trans-Europa)', status: 'negative' },
      { label: '2nd Highest Delay', value: '15.6% (Balkan Freight)', status: 'negative' },
      { label: 'Avg Delay Duration', value: '115 mins', status: 'warning' },
      { label: 'Target Threshold', value: '< 6.0% Max', status: 'neutral' }
    ],
    breakdownData: [
      { category: 'Trans-Europa Express (CAR-TE-01)', value: '18.2% Delays (6/33)', variance: 'High Risk', detail: 'Primary issues on DE->PL and DE->CZ lanes; warning letter issued' },
      { category: 'Balkan Freight Log (CAR-BF-02)', value: '15.6% Delays (4/28)', variance: 'High Risk', detail: 'Primary issues on AT->HU and DE->RO routes; border queue bottlenecks' },
      { category: 'Nordic Trans (CAR-NT-04)', value: '9.4% Delays (3/32)', variance: 'Moderate Risk', detail: 'Ferry weather delays on Travemünde-Trelleborg crossing' }
    ],
    recommendedSapActions: [
      { actionName: 'Carrier Performance Review', tcode: '/SCMTMS/CAR_REV', description: 'Schedule formal SLA review meeting and log corrective action plan in SAP.' },
      { actionName: 'Carrier Selection Ranking Adjustment', tcode: '/SCMTMS/CAR_RANK', description: 'Downgrade carrier ranking score in automated tendering tables.' }
    ]
  },
  {
    questionId: 'Q13',
    questionText: 'Compare carriers by cost and service level.',
    category: 'Carrier Management',
    sapSourceTables: ['/SCMTMS/D_TORROT', '/SCMTMS/D_SFIRR', 'BUT000', '/SCMTMS/D_TEND_REQ'],
    summaryAnswer: 'A multi-dimensional comparison across our top 5 core carriers reveals that DB Schenker offers the most competitive rate (€1.38/km) with a 93.8% service level, while DHL provides the highest service level (98.4% OTD) at a moderate rate of €1.42/km.',
    keyInsights: [
      'DB Schenker: Best cost leader (€1.38/km) for non-urgent standard FTL linehauls.',
      'DHL Global: Best overall value index combining 98.4% OTD with €1.42/km rate.',
      'Kuehne+Nagel: Premium reliability (97.2% OTD) at €1.45/km for complex intermodal.'
    ],
    transportationMetrics: [
      { label: 'Cost Leader (Schenker)', value: '€1.38 / km', status: 'positive' },
      { label: 'Service Leader (DHL)', value: '98.4% OTD', status: 'positive' },
      { label: 'Average Fleet Rate', value: '€1.41 / km', status: 'neutral' },
      { label: 'Average Fleet OTD', value: '95.1% OTD', status: 'positive' }
    ],
    breakdownData: [
      { category: 'DHL Global Forwarding', value: '€1.42/km | 98.4% OTD', variance: 'Optimal Value', detail: 'Score: 96.8 | Tender Acc: 96.1% | Damage: 0.0%' },
      { category: 'DB Schenker Logistics', value: '€1.38/km | 93.8% OTD', variance: 'Cost Leader', detail: 'Score: 91.2 | Tender Acc: 89.2% | Damage: 0.02%' },
      { category: 'Kuehne + Nagel Logistics', value: '€1.45/km | 97.2% OTD', variance: 'High Service', detail: 'Score: 95.4 | Tender Acc: 94.5% | Damage: 0.0%' },
      { category: 'Dachser SE Logistics', value: '€1.39/km | 91.5% OTD', variance: 'Balanced', detail: 'Score: 89.6 | Tender Acc: 88.0% | Damage: 0.01%' }
    ],
    recommendedSapActions: [
      { actionName: 'Carrier Benchmark Matrix', tcode: '/SCMTMS/BENCHMARK', description: 'Analyze cost vs service trade-off curve across all contracted lanes.' },
      { actionName: 'Update Carrier Strategy Profile', tcode: '/SCMTMS/STRAT_PROF', description: 'Configure dynamic lane assignment balancing cost efficiency and SLA tier.' }
    ]
  },
  {
    questionId: 'Q14',
    questionText: 'Which carrier should we use for this shipment?',
    category: 'Carrier Management',
    sapSourceTables: ['/SCMTMS/D_TORROT', '/SCMTMS/CARRIER_SEL', 'BUT000', '/SCMTMS/D_SFIRR'],
    summaryAnswer: 'For the selected Stuttgart to Munich FTL shipment (FO-60098120, 18.4 TO), S/4HANA TM Carrier Selection recommends DHL Global Forwarding as Rank 1 (Contract Rate: €1,180, OTD: 98.4%, Available Capacity: Confirmed), with DB Schenker as Rank 2 backup (€1,145, OTD: 93.8%).',
    keyInsights: [
      'Recommended Carrier: DHL Global Forwarding (Overall Evaluation Score: 98.2).',
      'Contract tariff applies under valid Freight Agreement FA-2026-DE01.',
      'Direct EDI-204 electronic tendering interface is active with auto-confirmation.'
    ],
    transportationMetrics: [
      { label: 'Rank 1 Carrier', value: 'DHL Global', status: 'positive' },
      { label: 'Contract Rate', value: '€1,180.00', status: 'positive' },
      { label: 'Transit Reliability', value: '98.4% OTD', status: 'positive' },
      { label: 'Carrier Capacity', value: 'Available', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Rank 1: DHL Global Forwarding', value: '€1,180.00 | Score 98.2', variance: 'Recommended', detail: 'Contracted rate, confirmed truck at Stuttgart depot, EDI-204 ready' },
      { category: 'Rank 2: DB Schenker', value: '€1,145.00 | Score 92.4', variance: 'Backup', detail: 'Lower rate by €35, but lower OTD reliability (93.8%) on this corridor' },
      { category: 'Rank 3: Dachser SE', value: '€1,210.00 | Score 88.0', variance: 'Alternate', detail: 'Higher rate by €30, 2h response window required' }
    ],
    recommendedSapActions: [
      { actionName: 'Execute Carrier Selection', tcode: '/SCMTMS/CARRIER_SEL', description: 'Confirm recommendation and dispatch electronic Freight Order to DHL.' },
      { actionName: 'Freight Agreement Verification', tcode: '/SCMTMS/FA_VIEW', description: 'Review tariff scales, fuel surcharges, and contractual volume commitments.' }
    ]
  },
  {
    questionId: 'Q15',
    questionText: 'Which carriers have available capacity today?',
    category: 'Carrier Management',
    sapSourceTables: ['/SCMTMS/RES_RES', '/SCMTMS/D_TEND_REQ', 'BUT000'],
    summaryAnswer: '8 contracted carriers have verified available truckload capacity in our operational region today, totaling 24 available vehicle units (16 standard curtain-side trailers, 5 refrigerated reefers, and 3 mega-trailers).',
    keyInsights: [
      '24 Total verified carrier units available today across Southern & Central Germany.',
      'DHL has 6 available units; DB Schenker has 5; Kuehne+Nagel has 4.',
      'Refrigerated reefer capacity is tight (only 5 units available against 4 scheduled loads).'
    ],
    transportationMetrics: [
      { label: 'Available Carrier Units', value: '24 Trucks', status: 'positive' },
      { label: 'Standard Curtain Trailers', value: '16 Units', status: 'positive' },
      { label: 'Reefer Units Avail', value: '5 Units', status: 'warning' },
      { label: 'Mega-Trailer Units', value: '3 Units', status: 'positive' }
    ],
    breakdownData: [
      { category: 'DHL Global Forwarding', value: '6 Units Available', variance: 'Ready', detail: '4 Curtain-siders (SP 1000) + 2 Reefers (SP 1010)' },
      { category: 'DB Schenker Logistics', value: '5 Units Available', variance: 'Ready', detail: '3 Standard FTL + 2 Mega-trailers (Frankfurt DC)' },
      { category: 'Kuehne + Nagel Logistics', value: '4 Units Available', variance: 'Ready', detail: '2 Standard FTL + 2 Reefer units (Hamburg)' },
      { category: 'Dachser & Regional Partners', value: '9 Units Available', variance: 'Ready', detail: 'Mixed regional distribution fleet in Baden-Württemberg' }
    ],
    recommendedSapActions: [
      { actionName: 'Carrier Capacity Cockpit', tcode: '/SCMTMS/CAP_MON', description: 'Inspect real-time carrier capacity commitments and booked slots.' },
      { actionName: 'Reserve Carrier Equipment', tcode: '/SCMTMS/BOOK_CAP', description: 'Pre-book remaining 5 Reefer units to secure cold-chain allocations.' }
    ]
  },
  {
    questionId: 'Q16',
    questionText: 'Which carriers are rejecting tenders?',
    category: 'Carrier Management',
    sapSourceTables: ['/SCMTMS/D_TEND_REQ', '/SCMTMS/D_TORROT', 'BUT000'],
    summaryAnswer: 'Over the last 14 days, 3 carriers have shown elevated tender rejection rates: FastCargo EU rejected 6 out of 18 tenders (33.3% rejection rate), Mainfreight rejected 4 out of 20 (20.0%), and Fercam rejected 3 out of 16 (18.8%), primarily on cross-border Alpine transit lanes.',
    keyInsights: [
      'FastCargo EU: 33.3% rejection rate citing equipment driver shortages on South-bound routes.',
      'Mainfreight: 20.0% rejection rate due to weekend delivery restrictions.',
      'Tender rejection causes an average planning delay of 45 minutes while cascading to Rank 2.'
    ],
    transportationMetrics: [
      { label: 'Elevated Rejections', value: '3 Carriers', status: 'warning' },
      { label: 'Top Rejection Rate', value: '33.3% (FastCargo)', status: 'negative' },
      { label: 'Avg Rejection Penalty Time', value: '+45 mins', status: 'warning' },
      { label: 'Overall Fleet Rejection Avg', value: '6.4%', status: 'positive' }
    ],
    breakdownData: [
      { category: 'FastCargo EU (CAR-FC-09)', value: '33.3% (6/18 Rejected)', variance: 'High Risk', detail: 'Lane: DE->IT via Brenner; drivers refusing weekend return loads' },
      { category: 'Mainfreight (CAR-MF-03)', value: '20.0% (4/20 Rejected)', variance: 'Moderate Risk', detail: 'Lane: DE->FR; short-notice tendering horizon (<4h)' },
      { category: 'Fercam Transport (CAR-FT-05)', value: '18.8% (3/16 Rejected)', variance: 'Moderate Risk', detail: 'Lane: DE->AT; rate dispute on Alpine toll surcharges' }
    ],
    recommendedSapActions: [
      { actionName: 'Tendering Rejection Analytics', tcode: '/SCMTMS/TEND_REJ', description: 'Analyze rejection reasons categorized by lane, lead time, and rate tier.' },
      { actionName: 'Adjust Tendering Lead Time', tcode: '/SCMTMS/TEND_SET', description: 'Increase tender response horizon from 2 hours to 4 hours on Alpine routes.' }
    ]
  },
  {
    questionId: 'Q17',
    questionText: 'Show carrier acceptance rates.',
    category: 'Carrier Management',
    sapSourceTables: ['/SCMTMS/D_TEND_REQ', 'BUT000', '/SCMTMS/D_TORROT'],
    summaryAnswer: 'The fleet-wide tender acceptance rate stands at 93.6% over the past 30 days across 412 broadcast tenders. DHL leads with a 96.1% acceptance rate, followed by Kuehne+Nagel at 94.5% and DB Schenker at 89.2%.',
    keyInsights: [
      'Overall 30-day tender acceptance rate is 93.6% (386 accepted / 412 issued).',
      'First-round acceptance rate is 88.4%; second-round cascade captures 5.2%.',
      'Only 6.4% of total freight volume required spot market manual intervention.'
    ],
    transportationMetrics: [
      { label: 'Fleet Acceptance Rate', value: '93.6%', status: 'positive' },
      { label: 'First Round Acceptance', value: '88.4%', status: 'positive' },
      { label: 'Cascade Round 2', value: '5.2%', status: 'positive' },
      { label: 'Manual Spot Fallback', value: '6.4%', status: 'neutral' }
    ],
    breakdownData: [
      { category: 'DHL Global Forwarding', value: '96.1% (148/154)', variance: 'Target Exceeded', detail: 'Avg response time: 14 mins | Auto-accept enabled via EDI' },
      { category: 'Kuehne + Nagel Logistics', value: '94.5% (104/110)', variance: 'Target Exceeded', detail: 'Avg response time: 22 mins | High domestic & international rate' },
      { category: 'DB Schenker Logistics', value: '89.2% (74/83)', variance: 'Acceptable', detail: 'Avg response time: 35 mins | Rejections on Friday afternoon slots' },
      { category: 'Other Contracted Carriers', value: '92.3% (60/65)', variance: 'Acceptable', detail: 'Regional carriers covering specialized routes' }
    ],
    recommendedSapActions: [
      { actionName: 'Tender Acceptance KPI Report', tcode: '/SCMTMS/TEND_KPI', description: 'Display monthly acceptance trends and carrier response duration histograms.' },
      { actionName: 'Automatic Award Policy', tcode: '/SCMTMS/AUTO_AWARD', description: 'Enable auto-award rules for carriers with >95% acceptance and <15 min response.' }
    ]
  },
  {
    questionId: 'Q18',
    questionText: 'Which carriers are consistently late?',
    category: 'Carrier Management',
    sapSourceTables: ['/SCMTMS/D_TORROT', '/SCMTMS/D_EXECST', 'BUT000'],
    summaryAnswer: 'Trans-Europa Express and Balkan Freight Logistics are identified as consistently late carriers, having breached SLA arrival tolerances on more than 4 consecutive shipments over the past 3 weeks with an average delay variance exceeding 90 minutes.',
    keyInsights: [
      'Trans-Europa Express: 4 consecutive late deliveries on Lane DE-1000 -> PL-50.',
      'Balkan Freight Logistics: Chronic delays on Friday departure runs to Southeast Europe.',
      'Penalty debit notes totaling €4,850 are pending settlement deduction in FI/CO.'
    ],
    transportationMetrics: [
      { label: 'Consistently Late Carriers', value: '2 Carriers', status: 'negative' },
      { label: 'Consecutive SLA Breaches', value: '4+ Shipments', status: 'negative' },
      { label: 'Average Delay Variance', value: '+98 mins', status: 'warning' },
      { label: 'Pending SLA Deductions', value: '€4,850.00', status: 'warning' }
    ],
    breakdownData: [
      { category: 'Trans-Europa Express', value: '4 Consecutive Late Runs', variance: 'SLA Breach', detail: 'Avg delay: +122m | Warsaw lane | Formal corrective action notice active' },
      { category: 'Balkan Freight Logistics', value: '5 Late Runs in 14 Days', variance: 'SLA Breach', detail: 'Avg delay: +108m | Bucharest lane | Removed from auto-tendering' }
    ],
    recommendedSapActions: [
      { actionName: 'Carrier SLA Dispute Log', tcode: '/SCMTMS/DISP_LOG', description: 'Record carrier non-conformance event and post penalty deduction in Freight Settlement.' },
      { actionName: 'Temporary Carrier Block', tcode: '/SCMTMS/CAR_BLOCK', description: 'Temporarily freeze automated order assignment for non-compliant carriers.' }
    ]
  },
  {
    questionId: 'Q19',
    questionText: 'Which carriers have the highest freight claims?',
    category: 'Carrier Management',
    sapSourceTables: ['/SCMTMS/D_SFIRR', 'QMEL', 'QAKON', 'BUT000'],
    summaryAnswer: 'Over the last 90 days, Nordic Trans and Balkan Freight recorded the highest freight damage and shortage claims: Nordic Trans has 2 active claims totaling €18,400 (pallet crush during rough sea crossing), and Balkan Freight has 1 claim for €6,200 (packaging moisture damage).',
    keyInsights: [
      'Total freight cargo claims active: 3 claims amounting to €24,600.',
      'Nordic Trans: Claim CLM-2026-091 (€18,400) under investigation with marine insurer.',
      'DHL and Kuehne+Nagel maintain a 0.00% claims record over the same period.'
    ],
    transportationMetrics: [
      { label: 'Total Active Claims', value: '3 Claims', status: 'warning' },
      { label: 'Total Claims Value', value: '€24,600.00', status: 'negative' },
      { label: 'Highest Single Claim', value: '€18,400 (Nordic)', status: 'negative' },
      { label: 'Zero-Claim Carriers', value: 'DHL, K+N, Schenker', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Nordic Trans (Claim CLM-2026-091)', value: '€18,400.00', variance: 'Marine Transit', detail: 'Damaged machinery components on Travemünde ferry; surveyor report filed' },
      { category: 'Balkan Freight (Claim CLM-2026-084)', value: '€6,200.00', variance: 'Moisture Damage', detail: 'Torn tarpaulin on curtain-side trailer during heavy rain in Austria' }
    ],
    recommendedSapActions: [
      { actionName: 'Freight Claims Management', tcode: '/SCMTMS/CLAIMS', description: 'Track claim lifecycle, insurer documentation, and settlement recovery.' },
      { actionName: 'Quality Notification Review', tcode: 'QM03', description: 'Review QM defect recording and photographic evidence attached to delivery.' }
    ]
  },
  {
    questionId: 'Q20',
    questionText: 'Recommend alternate carriers for delayed shipments.',
    category: 'Carrier Management',
    sapSourceTables: ['/SCMTMS/D_TORROT', '/SCMTMS/CARRIER_SEL', 'BUT000'],
    summaryAnswer: 'For delayed shipment FO-60098115 (Dachser delayed on A3), the system recommends an emergency relay handover at Nuremberg hub to Kuehne+Nagel (available truck at depot, ETA recovery: 45 mins), or dispatching a dedicated express sprinter van from Stuttgart.',
    keyInsights: [
      'Option 1 (Recommended): Hub cross-dock relay at Nuremberg to Kuehne+Nagel FTL.',
      'Option 2 (Direct): Hot-shot express Sprinter van dispatched from Plant 1000.',
      'Option 1 fully recovers customer arrival window at an incremental cost of €180.'
    ],
    transportationMetrics: [
      { label: 'Recommended Alternate', value: 'Kuehne + Nagel', status: 'positive' },
      { label: 'Time Recovered', value: '45 mins', status: 'positive' },
      { label: 'Incremental Cost', value: '+€180.00', status: 'neutral' },
      { label: 'Customer SLA Saved', value: '100% On-Time', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Option 1: K+N Relay Handover', value: 'Recovers 45m (+€180)', variance: 'Recommended', detail: 'Swap trailer at Nuremberg cross-dock with ready K+N driver' },
      { category: 'Option 2: Direct Express Van', value: 'Recovers 60m (+€420)', variance: 'Higher Cost', detail: 'Direct dedicated sprinter for 4 critical pallets to Bosch Rexroth' }
    ],
    recommendedSapActions: [
      { actionName: 'Dispatch Alternate Carrier', tcode: '/SCMTMS/FO_CHG', description: 'Re-assign freight order sub-stage and send EDI booking update.' },
      { actionName: 'Send Customer Delivery Update', tcode: 'VA02', description: 'Transmit updated EDI-856 ASN milestone notification to customer.' }
    ]
  },

  // =========================================================================
  // PILLAR 3: FREIGHT COST (Q21 - Q30)
  // =========================================================================
  {
    questionId: 'Q21',
    questionText: "Show transportation cost for today's shipments.",
    category: 'Freight Cost',
    sapSourceTables: ['/SCMTMS/D_SFIRR', '/SCMTMS/D_TORROT', 'ACDOCA', 'BSEG'],
    summaryAnswer: "Total estimated freight cost for today's 26 scheduled shipments is €36,840.00 across all transport modes. Standard FTL road transport accounts for €28,450 (77.2%), intermodal rail accounts for €5,190 (14.1%), and air freight express accounts for €3,200 (8.7%).",
    keyInsights: [
      'Total daily freight spend: €36,840.00 against a planned budget of €38,200.00.',
      'Average freight cost per ton-km: €0.092 across all combined stages.',
      'All estimated freight charges are accrued in S/4HANA FI-CO ledger ACDOCA.'
    ],
    transportationMetrics: [
      { label: 'Total Freight Cost Today', value: '€36,840.00', status: 'positive' },
      { label: 'Planned Budget', value: '€38,200.00', status: 'positive' },
      { label: 'Budget Variance', value: '-€1,360 (-3.6%)', status: 'positive' },
      { label: 'Cost per Ton-Km', value: '€0.092 / tkm', status: 'neutral' }
    ],
    breakdownData: [
      { category: 'Road FTL Transport (22 FOs)', value: '€28,450.00', variance: '-2.8% vs Budget', detail: 'Average rate €1,293 per FTL shipment' },
      { category: 'Rail Intermodal Transport (3 FOs)', value: '€5,190.00', variance: '-6.4% vs Budget', detail: 'Low-emission corridor to Port of Rotterdam' },
      { category: 'Air Express Freight (1 FO)', value: '€3,200.00', variance: 'On Budget', detail: 'Critical urgent machine parts to Chicago (LH8220)' }
    ],
    recommendedSapActions: [
      { actionName: 'Freight Cost Cockpit', tcode: '/SCMTMS/COST_MON', description: 'Review real-time freight cost calculations, tariff line items, and accruals.' },
      { actionName: 'Financial Accrual Document List', tcode: 'FBL3N', description: 'Inspect freight accrual postings in G/L account 410000 (Freight Inbound/Outbound).' }
    ]
  },
  {
    questionId: 'Q22',
    questionText: 'Which lanes have the highest freight cost?',
    category: 'Freight Cost',
    sapSourceTables: ['/SCMTMS/D_SFIRR', '/SCMTMS/D_TORROT', '/SCMTMS/D_TORSTP'],
    summaryAnswer: 'The top 3 highest-spend transportation lanes over the past 30 days are: 1) Stuttgart (DE) to Lyon (FR) at €68,400 total spend, 2) Hamburg (DE) to Rotterdam (NL) at €54,200, and 3) Munich (DE) to Milan (IT) at €49,800, primarily driven by high volume and international toll surcharges.',
    keyInsights: [
      'Stuttgart -> Lyon: €68,400 (48 FTL shipments, avg €1,425/shipment).',
      'Hamburg -> Rotterdam: €54,200 (36 intermodal shipments, avg €1,505/shipment).',
      'Munich -> Milan: €49,800 (34 FTL shipments, avg €1,465/shipment + Alpine tolls).'
    ],
    transportationMetrics: [
      { label: 'Highest Spend Lane', value: 'Stuttgart -> Lyon (€68.4k)', status: 'neutral' },
      { label: '2nd Spend Lane', value: 'Hamburg -> R\'dam (€54.2k)', status: 'neutral' },
      { label: '3rd Spend Lane', value: 'Munich -> Milan (€49.8k)', status: 'neutral' },
      { label: 'Top 3 Lane Spend Share', value: '44.8% of Total', status: 'neutral' }
    ],
    breakdownData: [
      { category: 'Lane: Stuttgart (DE) -> Lyon (FR)', value: '€68,400.00 (48 FOs)', variance: '48 FTL Loads', detail: 'Avg €1,425/run | Distance: 610 km | French motorway tolls included' },
      { category: 'Lane: Hamburg (DE) -> Rotterdam (NL)', value: '€54,200.00 (36 FOs)', variance: '36 Intermodal', detail: 'Avg €1,505/run | Distance: 520 km | Heavy container drayage' },
      { category: 'Lane: Munich (DE) -> Milan (IT)', value: '€49,800.00 (34 FOs)', variance: '34 FTL Loads', detail: 'Avg €1,465/run | Distance: 490 km | Austrian Go-Box & Brenner tolls' }
    ],
    recommendedSapActions: [
      { actionName: 'Lane Spend Analytics', tcode: '/SCMTMS/LANE_SPEND', description: 'Analyze lane cost trends, price per km, and volume consolidation opportunities.' },
      { actionName: 'Contract Rate Renegotiation', tcode: '/SCMTMS/RATE_NEG', description: 'Initiate bulk volume RFP for high-density corridors to secure volume discounts.' }
    ]
  },
  {
    questionId: 'Q23',
    questionText: 'Compare planned freight cost with actual cost.',
    category: 'Freight Cost',
    sapSourceTables: ['/SCMTMS/D_SFIRR', '/SCMTMS/D_SFIDTR', 'ACDOCA', 'RBKP'],
    summaryAnswer: 'Across the 210 freight settlement documents processed this month, total planned freight cost was €284,500.00 versus an actual invoiced cost of €291,240.00, representing an unfavorable variance of €6,740.00 (+2.37%), mainly due to unplanned accessorial detention charges.',
    keyInsights: [
      'Total Planned Cost: €284,500.00 | Total Invoiced Cost: €291,240.00.',
      'Unfavorable variance: +€6,740.00 (+2.37%), within the 3.0% operational variance threshold.',
      'Primary driver: €4,850 in driver detention charges at 3 congested customer delivery docks.'
    ],
    transportationMetrics: [
      { label: 'Planned Freight Cost', value: '€284,500.00', status: 'positive' },
      { label: 'Actual Invoiced Cost', value: '€291,240.00', status: 'warning' },
      { label: 'Cost Variance', value: '+€6,740 (+2.37%)', status: 'warning' },
      { label: 'Disputed Invoices', value: '4 Invoices (€3.1k)', status: 'warning' }
    ],
    breakdownData: [
      { category: 'Base Linehaul Transportation', value: '€254,100 vs €254,800', variance: '+€700 (+0.28%)', detail: 'Contract tariffs matched within 99.7% precision' },
      { category: 'Diesel Fuel Surcharge (BAF)', value: '€22,400 vs €22,890', variance: '+€490 (+2.19%)', detail: 'Minor weekly diesel index adjustment in week 3' },
      { category: 'Accessorial & Detention Charges', value: '€8,000 vs €13,550', variance: '+€5,550 (+69.4%)', detail: 'Unplanned waiting time at destination dock facilities' }
    ],
    recommendedSapActions: [
      { actionName: 'Freight Settlement Dispute Cockpit', tcode: '/SCMTMS/DISP_MON', description: 'Review invoice discrepancy line items and approve or reject carrier dispute claims.' },
      { actionName: 'Customer Dock Detention Re-bill', tcode: 'VF01', description: 'Pass through eligible detention costs to consignees causing excessive unload delays.' }
    ]
  },
  {
    questionId: 'Q24',
    questionText: 'Which carriers have increased rates recently?',
    category: 'Freight Cost',
    sapSourceTables: ['/SCMTMS/D_SFIRR', '/SCMTMS/D_TEND_REQ', 'BUT000'],
    summaryAnswer: 'Two carrier groups have implemented rate increases in the current quarter: FastCargo EU updated their base spot rate by +4.8% on Alpine routes citing Swiss transit fees, and Trans-Europa Express increased weekend loading surcharges by +8.0%.',
    keyInsights: [
      'FastCargo EU: +4.8% base rate increase on Switzerland/Italy corridor.',
      'Trans-Europa Express: +8.0% surcharge on weekend / Sunday loading windows.',
      'Major contract carriers (DHL, K+N, Schenker) have locked annual rates until Q4 2026.'
    ],
    transportationMetrics: [
      { label: 'Carriers Increasing Rates', value: '2 Carriers', status: 'warning' },
      { label: 'Max Rate Hike', value: '+8.0% (Weekend)', status: 'warning' },
      { label: 'Core Fleet Rate Lock', value: 'Locked until Q4', status: 'positive' },
      { label: 'Budget Impact', value: '€1,850 / month', status: 'neutral' }
    ],
    breakdownData: [
      { category: 'FastCargo EU (Alpine Transit)', value: '+4.8% Base Rate', variance: 'Spot Tariff', detail: 'Effective 1st of month | Driven by revised Brenner toll scales' },
      { category: 'Trans-Europa (Weekend Surcharge)', value: '+8.0% Weekend Run', variance: 'Surcharge Change', detail: 'Applies to loading between Friday 20:00 and Sunday 22:00' }
    ],
    recommendedSapActions: [
      { actionName: 'Rate Change Impact Simulation', tcode: '/SCMTMS/RATE_SIM', description: 'Simulate annual financial impact of carrier rate adjustments on total freight spend.' },
      { actionName: 'Freight Agreement Amendment', tcode: '/SCMTMS/FA_CHG', description: 'Update agreed tariff rate tables in S/4HANA TM contract master.' }
    ]
  },
  {
    questionId: 'Q25',
    questionText: 'Show transportation spend by carrier.',
    category: 'Freight Cost',
    sapSourceTables: ['/SCMTMS/D_SFIRR', 'BUT000', 'LFA1', 'ACDOCA'],
    summaryAnswer: 'Monthly transportation spend of €385,400.00 is distributed across our primary carrier network: DHL Global Forwarding represents 38.2% (€147,200), Kuehne+Nagel 28.5% (€109,800), DB Schenker 18.4% (€70,900), and Dachser & others account for 14.9% (€57,500).',
    keyInsights: [
      'Top 2 carriers (DHL & K+N) represent 66.7% of total consolidated freight spend.',
      'Spend concentration aligns with corporate procurement Tier-1 rebate thresholds.',
      'Projected annual volume rebate eligibility: €42,000 across DHL and K+N.'
    ],
    transportationMetrics: [
      { label: 'Total Monthly Spend', value: '€385,400.00', status: 'positive' },
      { label: 'DHL Spend (38.2%)', value: '€147,200.00', status: 'positive' },
      { label: 'K+N Spend (28.5%)', value: '€109,800.00', status: 'positive' },
      { label: 'Projected Rebates', value: '€42,000.00', status: 'positive' }
    ],
    breakdownData: [
      { category: 'DHL Global Forwarding', value: '€147,200.00 (38.2%)', variance: 'Tier-1 Core', detail: '108 Shipments | Avg €1,362 per run | Rebate target: 92% achieved' },
      { category: 'Kuehne + Nagel Logistics', value: '€109,800.00 (28.5%)', variance: 'Tier-1 Core', detail: '77 Shipments | Avg €1,425 per run | Rebate target: 88% achieved' },
      { category: 'DB Schenker Logistics', value: '€70,900.00 (18.4%)', variance: 'Tier-2 Preferred', detail: '64 Shipments | Avg €1,107 per run | Cost leader on domestic lanes' },
      { category: 'Dachser & Specialized Fleet', value: '€57,500.00 (14.9%)', variance: 'Regional/Special', detail: '52 Shipments | Specialized hazmat and heavy machinery' }
    ],
    recommendedSapActions: [
      { actionName: 'Carrier Spend Analytics', tcode: '/SCMTMS/SPEND_CAR', description: 'Review monthly spend distribution and volume rebate tier tracking.' },
      { actionName: 'Rebate Agreement Verification', tcode: 'MEB2', description: 'Verify vendor rebate accruals in Materials Management & TM settlement.' }
    ]
  },
  {
    questionId: 'Q26',
    questionText: 'Show transportation spend by lane.',
    category: 'Freight Cost',
    sapSourceTables: ['/SCMTMS/D_SFIRR', '/SCMTMS/D_TORSTP', '/SCMTMS/D_TORROT'],
    summaryAnswer: 'Spend by trade corridor is led by the Domestic Germany (DE-DE) network at €178,200 (46.2%), followed by the DACH Region (DE-AT-CH) at €112,400 (29.2%), Western Europe (DE-FR-BENELUX) at €68,500 (17.8%), and Eastern/Southern Europe at €26,300 (6.8%).',
    keyInsights: [
      'Domestic Germany network represents 46.2% of total consolidated spend.',
      'DACH cross-border corridor exhibits the highest spend per ton due to mountain transit tolls.',
      'Western Europe trade lane is growing at +8.4% month-over-month.'
    ],
    transportationMetrics: [
      { label: 'Domestic DE-DE Spend', value: '€178,200.00 (46.2%)', status: 'positive' },
      { label: 'DACH Cross-Border', value: '€112,400.00 (29.2%)', status: 'positive' },
      { label: 'Western Europe Corridor', value: '€68,500.00 (17.8%)', status: 'positive' },
      { label: 'Eastern / Southern EU', value: '€26,300.00 (6.8%)', status: 'neutral' }
    ],
    breakdownData: [
      { category: 'DE-DE (Domestic Core Network)', value: '€178,200.00 (135 FTL/LTL)', variance: 'High Density', detail: 'Avg €1,320/load | Stuttgart, Munich, Frankfurt, Hamburg hubs' },
      { category: 'DE-AT-CH (DACH Alpine Corridor)', value: '€112,400.00 (72 FTL)', variance: 'High Tolls', detail: 'Avg €1,561/load | Includes Swiss LSVA and Austrian Asfinag tolls' },
      { category: 'DE-FR-BNL (Western Europe)', value: '€68,500.00 (44 FTL)', variance: 'Growing (+8.4%)', detail: 'Avg €1,556/load | Lyon, Paris, Antwerp, Rotterdam routes' }
    ],
    recommendedSapActions: [
      { actionName: 'Geographical Spend Map', tcode: '/SCMTMS/MAP_SPEND', description: 'Visualize freight spend density across European transport corridors.' },
      { actionName: 'Multi-Stop Route Consolidation', tcode: '/SCMTMS/CONSOL_OPT', description: 'Simulate consolidation of smaller LTL shipments into multi-stop FTL runs.' }
    ]
  },
  {
    questionId: 'Q27',
    questionText: 'Which shipments exceeded expected freight cost?',
    category: 'Freight Cost',
    sapSourceTables: ['/SCMTMS/D_SFIRR', '/SCMTMS/D_SFIDTR', '/SCMTMS/D_TORROT'],
    summaryAnswer: '6 shipments processed this week exceeded their planned freight cost baseline by more than 10%: FO-60098088 (+€650 due to 4-hour dock detention), FO-60098092 (+€480 due to emergency re-routing around tunnel closure), and 4 shipments with unbudgeted weekend delivery surcharges.',
    keyInsights: [
      '6 Shipments exceeded planned baseline; total cost overrun: €2,420.00.',
      'FO-60098088: €650 detention at consignee warehouse (disputed with customer).',
      'FO-60098092: €480 re-routing around Gotthard tunnel emergency maintenance.'
    ],
    transportationMetrics: [
      { label: 'Over-Budget Shipments', value: '6 Orders', status: 'warning' },
      { label: 'Total Cost Overrun', value: '+€2,420.00', status: 'warning' },
      { label: 'Max Single Overrun', value: '+€650.00 (FO-60098088)', status: 'negative' },
      { label: 'Recoverable from Consignee', value: '€1,350.00', status: 'positive' }
    ],
    breakdownData: [
      { category: 'FO-60098088 (Bosch Delivery)', value: 'Planned: €1,250 | Actual: €1,900', variance: '+€650 (+52.0%)', detail: '4h waiting time at plant dock; debit note issued to customer' },
      { category: 'FO-60098092 (Milan Linehaul)', value: 'Planned: €1,450 | Actual: €1,930', variance: '+€480 (+33.1%)', detail: 'Gotthard detour via San Bernardino route due to tunnel closure' },
      { category: 'FO-60098101-104 (Weekend Runs)', value: 'Planned: €4,800 | Actual: €6,090', variance: '+€1,290 (+26.8%)', detail: 'Emergency weekend loading surcharges authorized for urgent line' }
    ],
    recommendedSapActions: [
      { actionName: 'Freight Cost Variance Auditor', tcode: '/SCMTMS/COST_AUDIT', description: 'Investigate surcharge items and link cost recovery billing documents.' },
      { actionName: 'Generate Customer Debit Memo', tcode: 'FB70', description: 'Invoice customer for dock detention expenses caused by consignee delays.' }
    ]
  },
  {
    questionId: 'Q28',
    questionText: 'Find freight cost-saving opportunities.',
    category: 'Freight Cost',
    sapSourceTables: ['/SCMTMS/D_TORROT', '/SCMTMS/D_SFIRR', '/SCMTMS/OPT_RUN'],
    summaryAnswer: 'S/4HANA TM AI optimization identifies 3 immediate freight cost-saving opportunities totaling €18,450.00 per month: 1) Consolidating 14 recurring LTL shipments on the Stuttgart-Munich lane into 6 multi-stop FTLs (€8,200/mo), 2) Shifting Rotterdam container drayage from Road to Rail Intermodal (€6,800/mo), and 3) Eliminating weekend detention charges through dock appointment scheduling (€3,450/mo).',
    keyInsights: [
      'Opportunity 1: LTL to FTL consolidation saves €8,200/month (-22% lane spend).',
      'Opportunity 2: Rail modal shift saves €6,800/month + reduces CO2 by 64%.',
      'Opportunity 3: Dock appointment scheduling eliminates €3,450 in recurring detention.'
    ],
    transportationMetrics: [
      { label: 'Total Monthly Savings', value: '€18,450.00', status: 'positive' },
      { label: 'LTL Consolidation', value: '€8,200 / mo', status: 'positive' },
      { label: 'Rail Modal Shift', value: '€6,800 / mo', status: 'positive' },
      { label: 'Detention Elimination', value: '€3,450 / mo', status: 'positive' }
    ],
    breakdownData: [
      { category: '1. Stuttgart -> Munich LTL Consolidation', value: '€8,200 / month savings', variance: 'High Feasibility', detail: 'Bundle 14 LTL shipments into 6 scheduled FTL multi-drops' },
      { category: '2. Hamburg -> Rotterdam Modal Shift to Rail', value: '€6,800 / month savings', variance: 'Medium Feasibility', detail: 'Contract DB Cargo for 12 weekly container slots (saves 64% CO2)' },
      { category: '3. Staggered Dock Appointment Slots', value: '€3,450 / month savings', variance: 'Immediate', detail: 'Prevent truck arrival peaks at SP 1000 between 14:00 and 16:00' }
    ],
    recommendedSapActions: [
      { actionName: 'VSR Consolidation Optimizer', tcode: '/SCMTMS/VSR_OPT', description: 'Run automated consolidation heuristic to generate multi-stop FTL freight orders.' },
      { actionName: 'Modal Shift Configuration', tcode: '/SCMTMS/MODE_CFG', description: 'Update default transportation mode in shipping determination tables.' }
    ]
  },
  {
    questionId: 'Q29',
    questionText: 'Which routes have excessive accessorial charges?',
    category: 'Freight Cost',
    sapSourceTables: ['/SCMTMS/D_SFIRR', '/SCMTMS/D_SFIDTR', '/SCMTMS/D_TORSTP'],
    summaryAnswer: 'The Frankfurt to Paris corridor and the Munich to Vienna route exhibit excessive accessorial charges, representing 14.8% and 12.2% of total freight costs respectively, driven by urban delivery zone fees (Low Emission Zone permits), tail-lift surcharges, and extended waiting times.',
    keyInsights: [
      'Frankfurt -> Paris: 14.8% accessorial share (€9,200 in waiting & LEZ permit fees).',
      'Munich -> Vienna: 12.2% accessorial share (€6,400 in tail-lift & unloading charges).',
      'Accessorial charges on these routes exceed industry benchmark of <5.0%.'
    ],
    transportationMetrics: [
      { label: 'Frankfurt -> Paris Accessorials', value: '14.8% of Spend', status: 'negative' },
      { label: 'Munich -> Vienna Accessorials', value: '12.2% of Spend', status: 'warning' },
      { label: 'Total Accessorial Excess', value: '€15,600.00', status: 'negative' },
      { label: 'Target Benchmark', value: '< 5.0%', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Frankfurt -> Paris (FR-75)', value: '€9,200.00 Surcharges', variance: '14.8% Share', detail: 'Paris LEZ Crit\'Air permit fees (€3,200) + Dock waiting time (€6,000)' },
      { category: 'Munich -> Vienna (AT-10)', value: '€6,400.00 Surcharges', variance: '12.2% Share', detail: 'Unplanned tail-lift equipment requirement (€4,100) + Toll adjustments' }
    ],
    recommendedSapActions: [
      { actionName: 'Accessorial Charge Audit Cockpit', tcode: '/SCMTMS/ACC_AUDIT', description: 'Analyze surcharge distribution by fee type and validate contractual basis.' },
      { actionName: 'Standardize Delivery Profiles', tcode: '/SCMTMS/DEL_PROF', description: 'Maintain permanent tail-lift requirement in Customer Master to eliminate ad-hoc surcharges.' }
    ]
  },
  {
    questionId: 'Q30',
    questionText: 'Forecast transportation spend for this month.',
    category: 'Freight Cost',
    sapSourceTables: ['/SCMTMS/D_SFIRR', 'ACDOCA', 'VBAK', 'VBAP'],
    summaryAnswer: 'Based on active freight orders, open sales order backlog (VBAK), and seasonal shipment volume trends, forecasted transportation spend for the current calendar month is €398,500.00, representing a favorable variance of -€6,500.00 (-1.6%) against the €405,000.00 monthly logistics budget.',
    keyInsights: [
      'Projected Month-End Spend: €398,500.00 vs €405,000.00 Budget (-1.6%).',
      'Actual spend to date (M-T-D): €284,500.00; projected remaining spend: €114,000.00.',
      'End-of-month volume surge expected in week 4 (+18% freight orders).'
    ],
    transportationMetrics: [
      { label: 'Forecasted Total Spend', value: '€398,500.00', status: 'positive' },
      { label: 'Monthly Logistics Budget', value: '€405,000.00', status: 'positive' },
      { label: 'Projected Budget Surplus', value: '+€6,500 (+1.6%)', status: 'positive' },
      { label: 'Month-to-Date Spend', value: '€284,500.00', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Weeks 1 - 3 (Actual M-T-D)', value: '€284,500.00', variance: 'Settled / Accrued', detail: '210 Freight Orders completed and posted in ACDOCA' },
      { category: 'Week 4 Forecast (Volume Surge)', value: '€114,000.00', variance: 'Projected (+18%)', detail: 'Based on 82 scheduled delivery orders in open sales pipeline' }
    ],
    recommendedSapActions: [
      { actionName: 'Transportation Budget Forecasting', tcode: '/SCMTMS/BUDGET_FC', description: 'Run predictive spend forecast simulation based on ERP sales delivery plan.' },
      { actionName: 'FI-CO Cost Center Planning', tcode: 'KP06', description: 'Review monthly cost center 4100 (Logistics & Freight Outbound) absorption.' }
    ]
  },

  // =========================================================================
  // PILLAR 4: EXECUTION & DELIVERY (Q31 - Q40)
  // =========================================================================
  {
    questionId: 'Q31',
    questionText: 'Which shipments have not departed?',
    category: 'Execution & Delivery',
    sapSourceTables: ['/SCMTMS/D_TORROT', '/SCMTMS/D_EXECST', 'VTTK'],
    summaryAnswer: '5 shipments scheduled for morning departure have not yet departed the facility: 3 orders are completing final loading and seal verification at Plant 1000 gates, 1 order is held awaiting customs export paperwork, and 1 order is delayed awaiting driver arrival.',
    keyInsights: [
      '5 Shipments pending departure at Plant 1000 and Hamburg Export hub.',
      'FO-60098122: Finished loading; seal verification in progress at Gate 3.',
      'FO-60098125: Awaiting driver arrival (Carrier: Dachser, driver delayed 30 mins).'
    ],
    transportationMetrics: [
      { label: 'Undeparted Shipments', value: '5 Orders', status: 'warning' },
      { label: 'In Final Loading', value: '3 Orders', status: 'positive' },
      { label: 'Paperwork / Customs Hold', value: '1 Order', status: 'warning' },
      { label: 'Driver Delay', value: '1 Order', status: 'warning' }
    ],
    breakdownData: [
      { category: 'FO-60098122 (Stuttgart -> Munich)', value: 'Gate 3 (Loading Complete)', variance: 'Seal Check', detail: 'Departure in 10 mins | Carrier: DHL | Delivery 8009914' },
      { category: 'FO-60098123 (Frankfurt Express)', value: 'Gate 5 (Pallet Loading)', variance: 'Loading 85%', detail: 'Departure scheduled 14:30 | Carrier: K+N' },
      { category: 'FO-60098125 (Nuremberg Hub)', value: 'Gate 6 (Driver Late)', variance: 'Driver Delayed', detail: 'Driver arrival ETA 14:15 | Carrier: Dachser' },
      { category: 'FO-60098128 (Basel Export)', value: 'Gate 8 (Customs T1 Hold)', variance: 'Customs Doc', detail: 'Export declaration release pending in SAP GTS' }
    ],
    recommendedSapActions: [
      { actionName: 'Gate Departure Cockpit', tcode: '/SCMTMS/GATE_MON', description: 'Log outbound seal verification and post Goods Issue / Departure milestone.' },
      { actionName: 'Driver Check-In Monitor', tcode: '/SCMTMS/DRIVER_CK', description: 'Track incoming carrier drivers and assign available loading dock bays.' }
    ]
  },
  {
    questionId: 'Q32',
    questionText: 'Which trucks are late arriving at the warehouse?',
    category: 'Execution & Delivery',
    sapSourceTables: ['/SCMTMS/D_TORROT', '/SCMTMS/D_EXECST', '/SCMTMS/DAS'],
    summaryAnswer: '3 carrier trucks are currently overdue for their scheduled warehouse pickup appointments: Truck TR-DA-440 (Dachser) is 45 minutes late at Gate 6, Truck TR-MF-102 (Mainfreight) is 35 minutes late at Gate 4, and Truck TR-TE-881 (Trans-Europa) is 60 minutes late at Gate 2.',
    keyInsights: [
      '3 Inbound carrier trucks overdue against dock appointment schedule.',
      'Combined delay is creating a temporary loading queue at Bay 2 and Bay 6.',
      'Dock appointment scheduler has automatically re-sequenced pending staging orders.'
    ],
    transportationMetrics: [
      { label: 'Late Truck Arrivals', value: '3 Trucks', status: 'warning' },
      { label: 'Max Inbound Delay', value: '60 mins (Gate 2)', status: 'negative' },
      { label: 'Dock Bays Impacted', value: 'Gates 2, 4, 6', status: 'warning' },
      { label: 'Dock Re-sequenced', value: 'Auto-Updated', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Truck TR-DA-440 (Dachser Logistics)', value: '+45 mins late (Gate 6)', variance: 'Traffic Hold', detail: 'Stuck on B27 bypass | Staging for FO-60098125 held' },
      { category: 'Truck TR-MF-102 (Mainfreight)', value: '+35 mins late (Gate 4)', variance: 'Detour', detail: 'Approaching warehouse perimeter | ETA 14:20' },
      { category: 'Truck TR-TE-881 (Trans-Europa)', value: '+60 mins late (Gate 2)', variance: 'Breakdown', detail: 'Flat tyre replaced | ETA updated to 14:50' }
    ],
    recommendedSapActions: [
      { actionName: 'Dock Appointment Schedule (DAS)', tcode: '/SCMTMS/DAS', description: 'Update truck arrival timestamps and reassign available dock slots.' },
      { actionName: 'Carrier Late Notice Event', tcode: '/SCMTMS/LATE_NOTIF', description: 'Send automated electronic late arrival notification to carrier dispatcher.' }
    ]
  },
  {
    questionId: 'Q33',
    questionText: 'Show shipments currently in transit.',
    category: 'Execution & Delivery',
    sapSourceTables: ['/SCMTMS/D_TORROT', '/SCMTMS/D_EXECST', '/SCMTMS/TRACKING'],
    summaryAnswer: 'There are currently 14 shipments in active transit across Europe with a total cargo value of €1.84M and 294 Tons gross weight. 12 shipments are moving on schedule with green telematics status, and 2 are navigating minor traffic delays.',
    keyInsights: [
      '14 Active linehaul shipments in transit (11 Road FTL, 2 Rail Intermodal, 1 Air).',
      '85.7% of in-transit shipments are tracking on-schedule within ±15 min window.',
      'Real-time GPS telematics feeds are active across all 14 vehicles.'
    ],
    transportationMetrics: [
      { label: 'Shipments in Transit', value: '14 Orders', status: 'positive' },
      { label: 'In-Transit Cargo Value', value: '€1,842,000', status: 'neutral' },
      { label: 'On-Schedule Rate', value: '85.7% (12/14)', status: 'positive' },
      { label: 'Total In-Transit Weight', value: '294.0 TO', status: 'neutral' }
    ],
    breakdownData: [
      { category: 'FO-60098121 (Frankfurt Hub)', value: 'Kuehne + Nagel FTL', variance: 'On Track (ETA 16:45)', detail: 'Position: A5 near Darmstadt | Speed: 82 km/h | 22.1 TO' },
      { category: 'FO-60098118 (Munich DC)', value: 'DHL Global FTL', variance: 'On Track (ETA 17:15)', detail: 'Position: A8 near Augsburg | Speed: 80 km/h | 18.4 TO' },
      { category: 'FO-60098115 (Nuremberg Hub)', value: 'Dachser SE FTL', variance: 'Delayed (+90m)', detail: 'Position: A3 near Würzburg | Speed: 24 km/h (Congestion)' },
      { category: 'FO-60098124 (Rotterdam Rail)', value: 'DB Cargo Intermodal', variance: 'On Track (ETA 22:30)', detail: 'Position: Emmerich border rail terminal | 44.0 TO' }
    ],
    recommendedSapActions: [
      { actionName: 'Live Fleet Tracking Map', tcode: '/SCMTMS/LIVE_MAP', description: 'Display live interactive map of in-transit trucks, routes, and weather overlays.' },
      { actionName: 'Event Milestone History', tcode: '/SCMTMS/EM_HIST', description: 'Inspect telematics timestamps, geofence enter/exit triggers, and speed logs.' }
    ]
  },
  {
    questionId: 'Q34',
    questionText: 'Which deliveries are expected to arrive late?',
    category: 'Execution & Delivery',
    sapSourceTables: ['/SCMTMS/D_TORROT', '/SCMTMS/D_EXECST', 'LIKP', 'LIPS'],
    summaryAnswer: '2 outbound deliveries are forecasted to arrive past the customer promised delivery deadline: Delivery 8009912 (Customer: Bosch Rexroth, projected 90 mins late due to A3 traffic hold) and Delivery 8009918 (Customer: Nestlé Suisse, projected 110 mins late due to customs documentation hold).',
    keyInsights: [
      '2 Deliveries at risk of late delivery out of 34 active daily deliveries (5.9%).',
      'Delivery 8009912 (Bosch Rexroth): Customer receiving department closes at 17:00; ETA is 17:30.',
      'Customer logistics contact has been alerted to arrange overtime unloading buffer.'
    ],
    transportationMetrics: [
      { label: 'Late Deliveries Projected', value: '2 Deliveries', status: 'negative' },
      { label: 'Total Daily Deliveries', value: '34 Deliveries', status: 'positive' },
      { label: 'On-Time Delivery Index', value: '94.1%', status: 'positive' },
      { label: 'Customer Overtime Buffer', value: 'Arranged (Bosch)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Delivery 8009912 (Bosch Rexroth)', value: 'FO-60098115 (+90m)', variance: 'Late (17:30 ETA)', detail: 'Customer dock closes 17:00; Gate pass extension confirmed by consignee' },
      { category: 'Delivery 8009918 (Nestlé Suisse)', value: 'FO-60098129 (+110m)', variance: 'Late (18:15 ETA)', detail: 'Swiss border T1 transit document re-submitted; driver en route to Basel' }
    ],
    recommendedSapActions: [
      { actionName: 'Delivery Status Cockpit', tcode: 'VL06O', description: 'Monitor outbound delivery execution, planned goods issue, and POD status.' },
      { actionName: 'Notify Consignee of Delay', tcode: '/SCMTMS/NOTIF_CUST', description: 'Send automated EDI-856 ASN arrival revision update to customer ERP.' }
    ]
  },
  {
    questionId: 'Q35',
    questionText: 'Show missed pickup appointments.',
    category: 'Execution & Delivery',
    sapSourceTables: ['/SCMTMS/DAS', '/SCMTMS/D_EXECST', '/SCMTMS/D_TORROT'],
    summaryAnswer: '1 pickup appointment was officially missed this morning: Appointment APPT-2026-0412 at Plant 1000 (Carrier: Trans-Europa Express, scheduled 08:30 UTC, truck failed to arrive due to mechanical breakdown). The load was successfully re-tendered and re-scheduled for 14:50 UTC.',
    keyInsights: [
      '1 Missed pickup appointment recorded today (Trans-Europa Express).',
      'Root cause: Mechanical compressor fault on tractor unit in Munich.',
      'Zero production impact; staging lane buffer absorbed the schedule shift.'
    ],
    transportationMetrics: [
      { label: 'Missed Pickups Today', value: '1 Appointment', status: 'warning' },
      { label: 'Pickup Adherence Rate', value: '96.2%', status: 'positive' },
      { label: 'Re-scheduled Time', value: '14:50 UTC Today', status: 'positive' },
      { label: 'Production Impact', value: '0 Hours Lost', status: 'positive' }
    ],
    breakdownData: [
      { category: 'APPT-2026-0412 (Gate 2 - 08:30)', value: 'Trans-Europa Express', variance: 'Missed (Breakdown)', detail: 'Re-booked for 14:50 UTC | FO-60098112 | Replacement tractor dispatched' }
    ],
    recommendedSapActions: [
      { actionName: 'Dock Appointment Review', tcode: '/SCMTMS/DAS', description: 'Inspect missed appointment log and record carrier non-performance fault code.' },
      { actionName: 'Carrier Incident Logging', tcode: '/SCMTMS/INCIDENT', description: 'Log formal carrier non-conformance event for monthly SLA scorecard.' }
    ]
  },
  {
    questionId: 'Q36',
    questionText: 'Which freight orders have execution exceptions?',
    category: 'Execution & Delivery',
    sapSourceTables: ['/SCMTMS/D_EXECST', '/SCMTMS/D_TORROT', '/SCMTMS/ALERT_MON'],
    summaryAnswer: '3 freight orders have active execution exceptions logged in S/4HANA TM: 1) FO-60098115 (Route Congestion Exception - delay >60 mins), 2) FO-60098129 (Customs Hold Exception at Basel), and 3) FO-60098141 (Equipment Shortage Exception - Reefer unit pending).',
    keyInsights: [
      '3 Active execution exceptions currently open in the TM Alert Monitor.',
      'All 3 exceptions have automated diagnosis workflows and proposed fixes attached.',
      'Exception resolution lifecycle is currently at "Recommended Resolution" stage.'
    ],
    transportationMetrics: [
      { label: 'Active Exceptions', value: '3 Orders', status: 'warning' },
      { label: 'Transit Exception', value: '1 Order', status: 'warning' },
      { label: 'Customs Exception', value: '1 Order', status: 'warning' },
      { label: 'Equipment Exception', value: '1 Order', status: 'warning' }
    ],
    breakdownData: [
      { category: 'FO-60098115 (Route Congestion)', value: 'Delay >60m on A3', variance: 'Severity: High', detail: 'Root Cause: Multi-vehicle accident near Würzburg | Alternate route proposed' },
      { category: 'FO-60098129 (Customs Hold)', value: 'T1 Document Validation', variance: 'Severity: High', detail: 'Root Cause: Missing HS Code tariff classification on item 3 | GTS updated' },
      { category: 'FO-60098141 (Equipment Shortage)', value: 'Reefer Trailer Missing', variance: 'Severity: Medium', detail: 'Root Cause: Empty return delay | Repositioning unit from depot' }
    ],
    recommendedSapActions: [
      { actionName: 'Transportation Exception Cockpit', tcode: '/SCMTMS/EXC_MON', description: 'Review, diagnose, and execute resolutions for open execution exceptions.' },
      { actionName: 'Alert Resolution Engine', tcode: '/SCMTMS/ALERT_RES', description: 'Trigger automated resolution pipeline for confirmed exception items.' }
    ]
  },
  {
    questionId: 'Q37',
    questionText: 'Which shipments are waiting at the dock?',
    category: 'Execution & Delivery',
    sapSourceTables: ['/SCMTMS/D_TORROT', '/SCMTMS/D_EXECST', '/SCMTMS/DAS'],
    summaryAnswer: '4 shipments / vehicles are currently waiting at the dock area across our facilities: 2 trucks are parked in the holding yard awaiting gate assignment, 1 is undergoing security and seal check at Inbound Gate 1, and 1 is completing paperwork at the dispatch office.',
    keyInsights: [
      '4 Vehicles active in the yard / dock staging areas.',
      'Average dock waiting time is 18.5 minutes (well below the 45-minute detention threshold).',
      'Yard Management system has assigned next-open gate calls to Yard Pager system.'
    ],
    transportationMetrics: [
      { label: 'Vehicles at Dock / Yard', value: '4 Trucks', status: 'positive' },
      { label: 'Average Waiting Time', value: '18.5 mins', status: 'positive' },
      { label: 'Detention Threshold', value: '45.0 mins', status: 'positive' },
      { label: 'Yard Congestion Level', value: 'Low (22% Yard Cap)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Truck TR-DH-812 (DHL Freight)', value: 'Waiting Yard Bay Y-04', variance: 'Waiting Gate (12m)', detail: 'Assigned to Gate 3 at 14:15 for loading FO-60098120' },
      { category: 'Truck TR-KN-554 (Kuehne + Nagel)', value: 'Waiting Yard Bay Y-07', variance: 'Waiting Gate (15m)', detail: 'Assigned to Gate 5 at 14:20 for loading FO-60098121' },
      { category: 'Truck TR-SC-209 (DB Schenker)', value: 'Inbound Security Check', variance: 'Check-In (8m)', detail: 'Driver identity & safety induction verified; proceeding to Gate 1' },
      { category: 'Truck TR-DA-118 (Dachser)', value: 'Dispatch Office', variance: 'Paperwork (22m)', detail: 'Collecting CMR consignment note & dangerous goods declaration' }
    ],
    recommendedSapActions: [
      { actionName: 'Yard Management Cockpit', tcode: '/SCMTMS/YM_MON', description: 'Monitor yard vehicle positions, waiting durations, and gate call sequencing.' },
      { actionName: 'Call Truck to Gate', tcode: '/SCMTMS/GATE_CALL', description: 'Trigger electronic gate call pager notification for ready trucks.' }
    ]
  },
  {
    questionId: 'Q38',
    questionText: 'Show proof-of-delivery exceptions.',
    category: 'Execution & Delivery',
    sapSourceTables: ['/SCMTMS/D_EXECST', 'VTTK', 'LIKP', 'VBAK'],
    summaryAnswer: 'Over the last 7 days, 2 Proof of Delivery (POD) exceptions were recorded: 1 partial delivery with shortage note (Delivery 8009884, 18 of 20 boxes received by customer due to pallet split) and 1 signature discrepancy (Delivery 8009890, unreadable electronic signature received via carrier telematics API).',
    keyInsights: [
      '2 POD exceptions logged out of 168 completed deliveries (98.8% clean POD rate).',
      'Delivery 8009884: 2 missing cartons located at Frankfurt cross-dock and scheduled for express re-delivery.',
      'Delivery 8009890: Paper copy CMR with physical stamp and signature retrieved and uploaded.'
    ],
    transportationMetrics: [
      { label: 'Clean POD Rate', value: '98.8%', status: 'positive' },
      { label: 'POD Exceptions (7 Days)', value: '2 Deliveries', status: 'warning' },
      { label: 'Shortage Discrepancy', value: '1 Item (Found)', status: 'positive' },
      { label: 'Resolved Exceptions', value: '2 of 2 (100%)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Delivery 8009884 (Customer: Siemens AG)', value: '2 Cartons Shortage', variance: 'Resolved', detail: 'Cartons located at Frankfurt hub; re-delivered on FO-60098109 with clean POD' },
      { category: 'Delivery 8009890 (Customer: BMW AG)', value: 'Signature Telematics Fail', variance: 'Resolved', detail: 'Scanned hardcopy CMR attached to SAP document flow in S/4HANA' }
    ],
    recommendedSapActions: [
      { actionName: 'Proof of Delivery Cockpit', tcode: 'VLPOD', description: 'Display, verify, and post proof of delivery confirmations and discrepancies.' },
      { actionName: 'Attach Scanned CMR', tcode: 'CV01N', description: 'Store verified signed freight documents in SAP Document Management System (DMS).' }
    ]
  },
  {
    questionId: 'Q39',
    questionText: 'Which shipments have detention or demurrage risk?',
    category: 'Execution & Delivery',
    sapSourceTables: ['/SCMTMS/D_SFIRR', '/SCMTMS/D_TORROT', '/SCMTMS/D_EXECST'],
    summaryAnswer: '2 shipments currently carry elevated detention or demurrage risk: 1 ocean container shipment at Port of Hamburg (Demurrage risk of €250/day starting in 18 hours if customs release is not posted) and 1 road truckload waiting at consignee dock in Nuremberg (Detention risk of €85/hour starting in 25 minutes).',
    keyInsights: [
      'Port of Hamburg: Container TGHU-99214 free demurrage window expires in 18 hours.',
      'Nuremberg Consignee: Truck waiting at dock for 35 mins (detention applies at 60 mins).',
      'Total potential financial exposure: €930.00 if unmitigated.'
    ],
    transportationMetrics: [
      { label: 'At-Risk Shipments', value: '2 Shipments', status: 'warning' },
      { label: 'Port Demurrage Free Time', value: '18h Remaining', status: 'warning' },
      { label: 'Truck Detention Free Time', value: '25m Remaining', status: 'negative' },
      { label: 'Financial Exposure', value: '€930.00 Max', status: 'neutral' }
    ],
    breakdownData: [
      { category: 'Container TGHU-99214 (Port of Hamburg)', value: 'Demurrage: €250/day', variance: '18h Free Time', detail: 'Ocean bill of lading released; drayage trucker booked for pickup at 08:00 tomorrow' },
      { category: 'FO-60098115 (Nuremberg Consignee)', value: 'Detention: €85/hour', variance: '25m Free Time', detail: 'Dock gate allocated; unloading commenced to clear free-time window' }
    ],
    recommendedSapActions: [
      { actionName: 'Demurrage & Detention Monitor', tcode: '/SCMTMS/DEM_MON', description: 'Track free time windows, port terminal storage clocks, and demurrage tiers.' },
      { actionName: 'Expedited Drayage Dispatch', tcode: '/SCMTMS/DRAY_DISP', description: 'Dispatch priority drayage carrier to pull container from terminal before demurrage starts.' }
    ]
  },
  {
    questionId: 'Q40',
    questionText: 'Which customers are affected by transportation delays?',
    category: 'Execution & Delivery',
    sapSourceTables: ['/SCMTMS/D_TORROT', 'VBAK', 'KNA1', 'LIKP'],
    summaryAnswer: '2 customer accounts are currently affected by active transit delays: Bosch Rexroth AG (Sales Order 1004289, 4 pallets delayed by 90 mins) and Nestlé Suisse SA (Sales Order 1004312, 6 pallets delayed by 110 mins). Both customer receiving contacts have been officially notified with revised ETAs.',
    keyInsights: [
      '2 Customers affected across 2 sales orders totaling €428,500 in goods value.',
      'Bosch Rexroth: Revised delivery confirmed for 17:30 UTC with overtime receiving approved.',
      'Nestlé Suisse: Swiss customs T1 document re-cleared; ETA adjusted to 18:15 UTC.'
    ],
    transportationMetrics: [
      { label: 'Affected Customers', value: '2 Accounts', status: 'warning' },
      { label: 'Impacted Sales Value', value: '€428,500.00', status: 'neutral' },
      { label: 'Customer Notifications', value: '100% Sent (EDI)', status: 'positive' },
      { label: 'Order Cancellation Risk', value: '0% (No Risk)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Bosch Rexroth AG (Customer 100420)', value: 'SO 1004289 (€245.0k)', variance: '+90m Delay', detail: 'Industrial pump modules | Revised ETA 17:30 | Overtime unloading pass active' },
      { category: 'Nestlé Suisse SA (Customer 100512)', value: 'SO 1004312 (€183.5k)', variance: '+110m Delay', detail: 'Food packaging machinery | Revised ETA 18:15 | Customs broker cleared' }
    ],
    recommendedSapActions: [
      { actionName: 'Customer 360 Logistics View', tcode: '/SCMTMS/CUST_360', description: 'Inspect customer delivery performance history, open shipments, and SLA metrics.' },
      { actionName: 'Sales Order Document Flow', tcode: 'VA03', description: 'Review end-to-end SD/TM document flow from Sales Order to Outbound Delivery and Freight Order.' }
    ]
  },

  // =========================================================================
  // PILLAR 5: NETWORK & OPTIMIZATION (Q41 - Q50)
  // =========================================================================
  {
    questionId: 'Q41',
    questionText: 'What is the best route for this shipment?',
    category: 'Network & Optimization',
    sapSourceTables: ['/SCMTMS/D_TORROT', '/SCMTMS/OPT_RUN', '/SCMTMS/D_SCHED'],
    summaryAnswer: 'For the Stuttgart (Plant 1000) to Lyon (FR) shipment (FO-60098135, 24.0 TO), S/4HANA TM VSR Optimizer recommends Route Option 1 (via Mulhouse / A36 motorway, total distance 610 km, travel time 7h 15m, toll cost €142), saving 45 km and €38 in tolls compared to Route Option 2 (via Strasbourg / N4).',
    keyInsights: [
      'Optimal Route: Via Mulhouse / A36 (Distance: 610 km | Duration: 7h 15m).',
      'Saves 45 km travel distance and €38.00 in French toll charges.',
      'Complies with French heavy vehicle weekend driving bans and tunnel ADR restrictions.'
    ],
    transportationMetrics: [
      { label: 'Recommended Route', value: 'Via Mulhouse (A36)', status: 'positive' },
      { label: 'Total Distance', value: '610 km', status: 'positive' },
      { label: 'Estimated Transit Time', value: '7h 15m', status: 'positive' },
      { label: 'Toll Cost', value: '€142.00 (Optimum)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Route 1 (Mulhouse A36 - Recommended)', value: '610 km | 7h 15m | €142 Tolls', variance: 'Optimal', detail: 'Direct motorway transit; zero height/weight bottlenecks' },
      { category: 'Route 2 (Strasbourg N4 - Alternative)', value: '655 km | 8h 05m | €180 Tolls', variance: '+45 km (+€38)', detail: 'Higher urban congestion around Strasbourg bypass' },
      { category: 'Route 3 (Geneva Border - Alpine)', value: '680 km | 8h 45m | €225 Tolls', variance: '+70 km (+€83)', detail: 'Includes Swiss vignette/transit tolls; not recommended' }
    ],
    recommendedSapActions: [
      { actionName: 'VSR Route Optimizer', tcode: '/SCMTMS/OPT_RUN', description: 'Run mathematical Vehicle Scheduling and Routing optimizer to select cheapest valid route.' },
      { actionName: 'Interactive Geographical Map', tcode: '/SCMTMS/MAP_ROUTE', description: 'Display GIS map path, toll plazas, rest areas, and live traffic overlays.' }
    ]
  },
  {
    questionId: 'Q42',
    questionText: 'Can we consolidate these deliveries into one load?',
    category: 'Network & Optimization',
    sapSourceTables: ['/SCMTMS/D_TORROT', '/SCMTMS/D_TORITE', 'LIKP', 'LIPS'],
    summaryAnswer: 'Yes. Deliveries 8009920 (Munich, 11.2 TO, 24 CBM) and 8009922 (Augsburg, 9.8 TO, 20 CBM) can be consolidated into a single multi-stop FTL load on FO-60098148. The combined load totals 21.0 TO and 44 CBM (91.3% weight capacity of a 23 TO standard semi-trailer), saving €480.00 compared to two separate LTL runs.',
    keyInsights: [
      'Consolidation approved: Deliveries 8009920 + 8009922.',
      'Combined profile: 21.0 TO (91.3% truckload capacity) / 44 CBM volume.',
      'Net financial savings: €480.00 (-28.5% total freight cost).'
    ],
    transportationMetrics: [
      { label: 'Consolidation Feasible', value: 'Yes (Approved)', status: 'positive' },
      { label: 'Combined Weight', value: '21.0 TO (91.3% Cap)', status: 'positive' },
      { label: 'Combined Volume', value: '44.0 CBM', status: 'positive' },
      { label: 'Cost Savings', value: '€480.00 (-28.5%)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Delivery 1: 8009922 (Augsburg - Stop 1)', value: '9.8 TO / 20 CBM', variance: 'First Drop', detail: 'Unload sequence rank 1 | Drop time: 09:30 UTC' },
      { category: 'Delivery 2: 8009920 (Munich - Stop 2)', value: '11.2 TO / 24 CBM', variance: 'Final Drop', detail: 'Unload sequence rank 2 | Drop time: 11:45 UTC' }
    ],
    recommendedSapActions: [
      { actionName: 'Consolidate Deliveries in TM', tcode: '/SCMTMS/CONSOL_EXEC', description: 'Create multi-stop freight order and assign both outbound deliveries.' },
      { actionName: 'Transportation Cockpit Dispatch', tcode: '/SCMTMS/PLN', description: 'Generate unified CMR bill of lading and sequence delivery stops.' }
    ]
  },
  {
    questionId: 'Q43',
    questionText: 'Which loads are underutilized?',
    category: 'Network & Optimization',
    sapSourceTables: ['/SCMTMS/D_TORROT', '/SCMTMS/D_TORITE', '/SCMTMS/RES_RES'],
    summaryAnswer: '3 planned freight orders are operating below the 60% trailer capacity utilization threshold: FO-60098132 (Stuttgart -> Nuremberg, 38.4% weight capacity utilized), FO-60098134 (Frankfurt -> Cologne, 46.2% utilized), and FO-60098139 (Hamburg -> Bremen, 52.0% utilized).',
    keyInsights: [
      '3 Freight Orders underutilized (<60% capacity threshold).',
      'FO-60098132 has 14.2 TO of spare capacity; candidate for LTL backhaul co-loading.',
      'S/4HANA TM recommendation: Merge FO-60098132 and FO-60098134 into a combined hub run.'
    ],
    transportationMetrics: [
      { label: 'Underutilized Loads', value: '3 Orders', status: 'warning' },
      { label: 'Lowest Utilization', value: '38.4% (FO-60098132)', status: 'negative' },
      { label: 'Total Unused Capacity', value: '38.5 TO', status: 'warning' },
      { label: 'Target Minimum Util', value: '> 80.0%', status: 'neutral' }
    ],
    breakdownData: [
      { category: 'FO-60098132 (Nuremberg)', value: '8.8 TO / 23.0 TO Cap', variance: '38.4% Util (Low)', detail: 'Only 14 pallet spots used; 19 spots empty | Potential consolidation' },
      { category: 'FO-60098134 (Cologne)', value: '10.6 TO / 23.0 TO Cap', variance: '46.2% Util (Low)', detail: 'Volume constrained; lightweight packaging material' },
      { category: 'FO-60098139 (Bremen)', value: '12.0 TO / 23.0 TO Cap', variance: '52.0% Util (Low)', detail: 'Short regional haul; candidate for milk-run staging' }
    ],
    recommendedSapActions: [
      { actionName: 'Capacity Utilization Cockpit', tcode: '/SCMTMS/UTIL_MON', description: 'Inspect 3D truck load diagram, axle weight distribution, and floor space.' },
      { actionName: 'Merge Freight Orders', tcode: '/SCMTMS/MERGE_FO', description: 'Merge underutilized orders into a single multi-drop route to boost utilization to 92%.' }
    ]
  },
  {
    questionId: 'Q44',
    questionText: 'Show trailer utilization.',
    category: 'Network & Optimization',
    sapSourceTables: ['/SCMTMS/D_TORROT', '/SCMTMS/D_TORITE', '/SCMTMS/RES_RES'],
    summaryAnswer: "Across all 26 freight orders scheduled today, average trailer weight utilization is 88.6% and average floor space (cube) utilization is 89.4%. 19 orders achieved optimal utilization (>85%), 4 achieved moderate utilization (70-85%), and 3 are underutilized (<60%).",
    keyInsights: [
      'Fleet Average Weight Utilization: 88.6% across 26 scheduled loads.',
      'Fleet Average Cube / Floor Space Utilization: 89.4% (1,180 pallet slots loaded).',
      'High-density optimization saved an estimated 4 truck trips today.'
    ],
    transportationMetrics: [
      { label: 'Avg Weight Utilization', value: '88.6%', status: 'positive' },
      { label: 'Avg Cube Utilization', value: '89.4%', status: 'positive' },
      { label: 'Optimal Loads (>85%)', value: '19 Orders (73%)', status: 'positive' },
      { label: 'Truck Trips Saved Today', value: '4 Full Trips', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Optimal Utilization (>85%)', value: '19 Freight Orders', variance: '94.2% Avg Util', detail: 'Heavy industrial machinery, steel castings, and dense chemicals' },
      { category: 'Moderate Utilization (70 - 85%)', value: '4 Freight Orders', variance: '76.8% Avg Util', detail: 'Mixed consumer goods and electronic subassemblies' },
      { category: 'Underutilized (<60%)', value: '3 Freight Orders', variance: '45.5% Avg Util', detail: 'Emergency customer express linehauls' }
    ],
    recommendedSapActions: [
      { actionName: '3D Load Building Visualization', tcode: '/SCMTMS/LOAD_3D', description: 'Display 3D interactive load distribution, center of gravity, and pallet stacking.' },
      { actionName: 'Load Consolidation Rule Tuning', tcode: '/SCMTMS/LOAD_RULES', description: 'Configure automated minimum fill rate constraints in VSR optimizer profile.' }
    ]
  },
  {
    questionId: 'Q45',
    questionText: 'Which lanes should be consolidated?',
    category: 'Network & Optimization',
    sapSourceTables: ['/SCMTMS/D_TORROT', '/SCMTMS/D_TORSTP', '/SCMTMS/OPT_RUN'],
    summaryAnswer: 'Network flow analysis identifies 2 primary lane pairs with high consolidation potential: 1) The Stuttgart -> Mannheim and Stuttgart -> Frankfurt lanes (can be combined into a daily scheduled milk-run, saving €5,400/month), and 2) The Munich -> Linz and Munich -> Vienna corridors (can be merged into an Austria consolidated linehaul, saving €4,200/month).',
    keyInsights: [
      'Lane Pair 1 (Stuttgart -> Mannheim -> Frankfurt): Saves €5,400/mo and 18 truck trips.',
      'Lane Pair 2 (Munich -> Linz -> Vienna): Saves €4,200/mo and 14 truck trips.',
      'Total annual network consolidation opportunity: €115,200.00.'
    ],
    transportationMetrics: [
      { label: 'Identified Lane Pairs', value: '2 Corridor Pairs', status: 'positive' },
      { label: 'Monthly Cost Savings', value: '€9,600.00 / mo', status: 'positive' },
      { label: 'Truck Trips Saved / Mo', value: '32 Trips / mo', status: 'positive' },
      { label: 'Annualized Savings', value: '€115,200.00', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Stuttgart -> Mannheim -> Frankfurt', value: '€5,400 / mo savings', variance: 'Milk-run Strategy', detail: 'Daily multi-drop FTL replacing 18 monthly fragmented LTL runs' },
      { category: 'Munich -> Linz -> Vienna', value: '€4,200 / mo savings', variance: 'Consolidated Linehaul', detail: 'Multi-stop Austrian delivery hub run replacing separate shipments' }
    ],
    recommendedSapActions: [
      { actionName: 'Network Lane Consolidation Cockpit', tcode: '/SCMTMS/NET_CONSOL', description: 'Configure multi-stop transportation lanes and scheduled freight booking timetables.' },
      { actionName: 'Default Route Schedule Creation', tcode: '/SCMTMS/DEF_ROUTE', description: 'Establish recurring timetable master records in S/4HANA TM.' }
    ]
  },
  {
    questionId: 'Q46',
    questionText: 'Can we reduce empty miles?',
    category: 'Network & Optimization',
    sapSourceTables: ['/SCMTMS/D_TORROT', '/SCMTMS/D_TORSTP', 'EKKO', 'EKPO'],
    summaryAnswer: 'Yes. By establishing closed-loop round-trip matching between our outbound customer deliveries and inbound raw material procurement orders (MM-PUR), we can eliminate 3,420 empty return kilometers per month on the Stuttgart-Hamburg and Munich-Frankfurt corridors, saving €4,850.00 in empty haul surcharges.',
    keyInsights: [
      'Identified 8 weekly round-trip matching opportunities (Outbound SD -> Inbound MM).',
      'Eliminates 3,420 km of empty deadhead travel per month (-68% empty miles on core lanes).',
      'Reduces carbon footprint by 4.2 Tons CO2e per month.'
    ],
    transportationMetrics: [
      { label: 'Empty km Eliminated', value: '3,420 km / month', status: 'positive' },
      { label: 'Monthly Financial Savings', value: '€4,850.00', status: 'positive' },
      { label: 'CO2 Emission Reduction', value: '4.2 Tons CO2e / mo', status: 'positive' },
      { label: 'Round-Trip Match Rate', value: '78.5%', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Stuttgart <-> Hamburg Loop', value: '1,840 km empty saved / mo', variance: 'Round-Trip Match', detail: 'Outbound finished goods (Plant 1000) matched with Inbound steel (Plant 1010)' },
      { category: 'Munich <-> Frankfurt Loop', value: '1,580 km empty saved / mo', variance: 'Round-Trip Match', detail: 'Outbound spare parts matched with Inbound packaging supplies' }
    ],
    recommendedSapActions: [
      { actionName: 'Continuous Moves & Round-Trip Cockpit', tcode: '/SCMTMS/CONT_MOVE', description: 'Link outbound freight orders with inbound purchase orders in automated continuous moves.' },
      { actionName: 'Cross-Module MM/TM Optimizer', tcode: '/SCMTMS/MM_TM_SYNC', description: 'Synchronize procurement delivery windows with outbound transport schedules.' }
    ]
  },
  {
    questionId: 'Q47',
    questionText: 'Which warehouses are causing transportation delays?',
    category: 'Network & Optimization',
    sapSourceTables: ['/SCMTMS/D_EXECST', 'T001W', '/SCMTMS/DAS', '/SCMTMS/D_TORROT'],
    summaryAnswer: 'Cross-facility performance analysis indicates that Warehouse Nuremberg DC (Plant 2000) is the primary internal source of transportation delays, with an average dock turnaround time of 82 minutes (versus 35-minute target) and a 14.2% late dispatch rate, driven by peak picking backlogs in Zone B.',
    keyInsights: [
      'Nuremberg DC (Plant 2000): 82 min avg turnaround (14.2% late dispatches).',
      'Central Plant 1000: 38 min avg turnaround (2.8% late dispatches - Benchmark).',
      'Hamburg Export Hub (Plant 1010): 42 min avg turnaround (4.1% late dispatches).'
    ],
    transportationMetrics: [
      { label: 'Highest Delay Facility', value: 'Nuremberg DC (Plant 2000)', status: 'negative' },
      { label: 'Avg Turnaround Time', value: '82 mins (vs 35m)', status: 'negative' },
      { label: 'Late Dispatch Rate', value: '14.2%', status: 'warning' },
      { label: 'Benchmark Facility', value: 'Plant 1000 (38 mins)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Nuremberg DC (Plant 2000)', value: '82 min avg | 14.2% Delays', variance: 'High Bottleneck', detail: 'Zone B picking backlog delays staging; dock door congestion during Shift 2' },
      { category: 'Hamburg Export Hub (Plant 1010)', value: '42 min avg | 4.1% Delays', variance: 'Acceptable', detail: 'Customs inspection delays on maritime export container staging' },
      { category: 'Central Manufacturing (Plant 1000)', value: '38 min avg | 2.8% Delays', variance: 'Optimal', detail: 'Automated high-bay retrieval and direct conveyor dock loading' }
    ],
    recommendedSapActions: [
      { actionName: 'Warehouse Turnaround Analytics', tcode: '/SCMTMS/WH_TURN', description: 'Analyze dock dwelling time, loading velocity, and dispatch variance by plant.' },
      { actionName: 'EWM / TM Staging Synchronization', tcode: '/SCWM/STAG_MON', description: 'Trigger wave releases in EWM 60 minutes earlier for Nuremberg outbound linehauls.' }
    ]
  },
  {
    questionId: 'Q48',
    questionText: "Predict tomorrow's transportation capacity shortage.",
    category: 'Network & Optimization',
    sapSourceTables: ['/SCMTMS/D_TORROT', '/SCMTMS/RES_RES', 'VBAK', 'VBAP'],
    summaryAnswer: "Predictive capacity forecasting indicates a 3-truck capacity deficit tomorrow (Thursday) on the South-to-West corridor (Stuttgart -> Lyon / Paris), with forecasted demand of 9 FTL truckloads against a committed carrier capacity of 6 trucks (deficit of 3 trucks / 72 Tons), driven by end-of-month customer order spikes.",
    keyInsights: [
      'Forecasted Capacity Deficit: 3 FTL Trucks on Stuttgart -> France corridor.',
      'Total demand: 9 FTLs (216 TO) vs 6 committed carrier trucks (144 TO).',
      'Spot market rate multiplier on this lane is expected to rise +12% tomorrow.'
    ],
    transportationMetrics: [
      { label: 'Projected Deficit', value: '3 Trucks (72 TO)', status: 'negative' },
      { label: 'Impacted Lane', value: 'Stuttgart -> Lyon/Paris', status: 'warning' },
      { label: 'Committed Capacity', value: '6 / 9 Trucks (66%)', status: 'warning' },
      { label: 'Pre-Booking Action', value: 'Initiated (+0% Premium)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Stuttgart -> Lyon (FR-69)', value: 'Demand: 5 FTLs | Cap: 3 FTLs', variance: 'Deficit: 2 Trucks', detail: 'Customer backlog orders 1004380, 1004382, 1004385' },
      { category: 'Stuttgart -> Paris (FR-75)', value: 'Demand: 4 FTLs | Cap: 3 FTLs', variance: 'Deficit: 1 Truck', detail: 'Automotive assembly parts for Renault Flins' }
    ],
    recommendedSapActions: [
      { actionName: 'Pre-Book Secondary Carrier Capacity', tcode: '/SCMTMS/BOOK_EARLY', description: 'Secure 3 backup trucks with Geodis and DSV today at standard contracted rates.' },
      { actionName: 'VSR Optimization Batch Run', tcode: '/SCMTMS/OPT_BATCH', description: 'Run overnight optimization to level load distributions across Wednesday/Thursday.' }
    ]
  },
  {
    questionId: 'Q49',
    questionText: 'Recommend the optimal transportation plan.',
    category: 'Network & Optimization',
    sapSourceTables: ['/SCMTMS/OPT_RUN', '/SCMTMS/D_TORROT', '/SCMTMS/D_TORSTP'],
    summaryAnswer: 'The S/4HANA TM VSR Global Optimizer recommends an integrated transportation plan across all 48 open freight units: 18 direct FTL shipments, 4 multi-stop consolidated FTL routes, and 2 rail intermodal linehauls, achieving 94.2% fleet capacity utilization, 98.6% on-time delivery, and total logistics cost of €34,820.00 (saving €2,020 vs unoptimized baseline).',
    keyInsights: [
      'Optimal Plan: 18 Direct FTLs + 4 Multi-Stop FTLs + 2 Rail Intermodal.',
      'Fleet capacity utilization maximized at 94.2% (vs 78.4% manual baseline).',
      'Net financial savings: €2,020.00 today (-5.5% reduction in freight spend).'
    ],
    transportationMetrics: [
      { label: 'Recommended Total Cost', value: '€34,820.00', status: 'positive' },
      { label: 'Baseline Manual Cost', value: '€36,840.00', status: 'neutral' },
      { label: 'Optimized Savings', value: '€2,020.00 (-5.5%)', status: 'positive' },
      { label: 'Fleet Fill Rate', value: '94.2%', status: 'positive' }
    ],
    breakdownData: [
      { category: '18 Direct FTL Shipments', value: '€24,200.00 (396 TO)', variance: 'Direct Linehaul', detail: 'High-volume dedicated customer deliveries with 98.4% OTD' },
      { category: '4 Multi-Stop Consolidated FTLs', value: '€6,820.00 (88 TO)', variance: 'Consolidated', detail: 'Bundles 12 regional LTL orders into 4 scheduled milk-runs' },
      { category: '2 Rail Intermodal Shipments', value: '€3,800.00 (58 TO)', variance: 'Low-Carbon Rail', detail: 'Port of Rotterdam container transit via DB Cargo rail' }
    ],
    recommendedSapActions: [
      { actionName: 'Apply VSR Optimized Plan', tcode: '/SCMTMS/APPLY_PLAN', description: 'Publish optimized transportation plan to live freight orders and trigger carrier tendering.' },
      { actionName: 'Transportation Cockpit Gantt View', tcode: '/SCMTMS/GANTT', description: 'Inspect graphical Gantt chart of truck schedules, resource time bars, and dock slots.' }
    ]
  },
  {
    questionId: 'Q50',
    questionText: 'What actions can reduce logistics cost today?',
    category: 'Network & Optimization',
    sapSourceTables: ['/SCMTMS/D_TORROT', '/SCMTMS/D_SFIRR', '/SCMTMS/OPT_RUN'],
    summaryAnswer: 'Executing 3 immediate actionable decisions today will reduce daily logistics spend by €2,680.00: 1) Consolidate Munich & Augsburg shipments into FO-60098148 (saves €480), 2) Re-assign Stuttgart-Lyon shipment to contract carrier Geodis instead of spot market (saves €850), and 3) Shift 2 container moves from road to rail intermodal (saves €1,350).',
    keyInsights: [
      'Action 1 (Consolidation): Merge Munich/Augsburg LTLs into single FTL (saves €480).',
      'Action 2 (Carrier Selection): Award Lyon tender under contracted tariff (saves €850).',
      'Action 3 (Modal Shift): Shift Hamburg-Rotterdam containers to Rail (saves €1,350).',
      'Total immediate executable savings: €2,680.00 today.'
    ],
    transportationMetrics: [
      { label: 'Immediate Cost Savings', value: '€2,680.00 Today', status: 'positive' },
      { label: 'Action 1: Consolidation', value: '€480.00 Saved', status: 'positive' },
      { label: 'Action 2: Contract Tendering', value: '€850.00 Saved', status: 'positive' },
      { label: 'Action 3: Rail Modal Shift', value: '€1,350.00 Saved', status: 'positive' }
    ],
    breakdownData: [
      { category: '1. Multi-Stop Load Consolidation', value: 'FO-60098148 (Munich + Augsburg)', variance: 'Saves €480.00', detail: 'Execute t-code /SCMTMS/CONSOL_EXEC | 91.3% trailer fill rate' },
      { category: '2. Contract Tariff Award (Lyon)', value: 'Award to Geodis (FA-2026-FR02)', variance: 'Saves €850.00', detail: 'Execute t-code /SCMTMS/CARRIER_SEL | Eliminates spot rate surcharge' },
      { category: '3. Rail Intermodal Container Shift', value: '2 Containers to DB Cargo Rail', variance: 'Saves €1,350.00', detail: 'Execute t-code /SCMTMS/MODE_CHG | Cuts CO2 by 64%' }
    ],
    recommendedSapActions: [
      { actionName: 'Execute Automated Optimization Actions', tcode: '/SCMTMS/EXEC_OPT', description: 'Trigger batch execution of all 3 approved cost-saving recommendations in S/4HANA TM.' },
      { actionName: 'Logistics Savings Realization Report', tcode: '/SCMTMS/SAVINGS_REP', description: 'Record verified savings audit log in SAP Financial Controlling.' }
    ]
  }
];
