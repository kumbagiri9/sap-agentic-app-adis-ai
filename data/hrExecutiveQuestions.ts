import { HrHcmExecutiveQuestionAnswer } from '../types';

export const ALL_HR_HCM_EXECUTIVE_QUESTIONS: HrHcmExecutiveQuestionAnswer[] = [
  // ============================================================================
  // PILLAR 1: Employee Information (Q1 - Q10)
  // ============================================================================
  {
    questionId: 'Q1',
    questionText: 'Show my employee profile.',
    category: 'Employee Information',
    sapSourceTables: ['PA0001', 'PA0002', 'PA0006', 'PA0007', 'PA0008', 'I_WorkforcePerson'],
    summaryAnswer: 'Employee Profile for PERNR 100452 (Sarah Jenkins): Role: Lead S/4HANA Enterprise Architect, Org Unit: 500012 (Enterprise Architecture & Cloud Tech), Cost Center: 100-2200. Employment Status: Active (Full-time Regular), Hire Date: 2021-04-15 (Tenure: 5.3 yrs). Work Location: Dallas HQ (US10). Basic Pay Scale: Grade L7, Standard Hours: 40 hrs/wk.',
    keyInsights: [
      'Active Master Data Records in Infotypes 0000 (Actions), 0001 (Org Assignment), 0002 (Personal), 0006 (Addresses), 0007 (Planned Working Time), and 0008 (Basic Pay).',
      'Direct Manager: David Vance (PERNR 100108 - VP IT Solutions).',
      'Emergency contacts and direct deposit bank details (Infotype 0009) verified compliant.'
    ],
    hrMetrics: [
      { label: 'Personnel Number', value: 'PERNR 100452', status: 'positive' },
      { label: 'Job Title', value: 'Lead S/4 Enterprise Architect', status: 'positive' },
      { label: 'Employment Status', value: 'Active (Full-Time)', status: 'positive' },
      { label: 'Pay Grade / Level', value: 'L7 / US Tech Band', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Org Assignment (IT0001)', value: 'Company Code 1000 / Plant 1000', variance: 'Active', detail: 'Org Unit 500012 (Architecture)' },
      { category: 'Personal Data (IT0002)', value: 'Sarah Jenkins (F)', variance: 'Verified', detail: 'Confidentiality Class A' },
      { category: 'Working Time (IT0007)', value: 'Work Schedule NORM40 (40h/wk)', variance: '100% FTE', detail: 'Standard Shift' },
      { category: 'Remuneration (IT0008)', value: 'Annualized Base $162,500 USD', variance: 'Comp Ratio 1.04', detail: 'Bi-weekly Payroll Area US' }
    ],
    recommendedSapActions: [
      { actionName: 'Display Master Data', tcode: 'PA20', description: 'Review comprehensive employee infotype portfolio in SAP GUI' },
      { actionName: 'My Employee Profile', tcode: 'Fiori F2058', description: 'Open Employee Self-Service (ESS) profile card' }
    ]
  },
  {
    questionId: 'Q2',
    questionText: 'What is my current job title and department?',
    category: 'Employee Information',
    sapSourceTables: ['PA0001', 'HRP1000', 'T513S', 'T528T'],
    summaryAnswer: 'Your current SAP S/4HANA position is Position 50012480: "Lead S/4HANA Enterprise Architect" (Job Code: ARCH-07) assigned to Department / Organizational Unit 500012 ("Enterprise Architecture & Cloud Platforms") reporting into Business Unit "Global Technology Solutions".',
    keyInsights: [
      'Position 50012480 assigned via Infotype 0001 (Org Assignment) with 100% capacity weighting.',
      'Department cost allocation is linked 100% to Cost Center 100-2200 (IT Core Services).',
      'Job family is tagged under Information Technology & Cloud Architecture (T513).'
    ],
    hrMetrics: [
      { label: 'Current Position ID', value: '50012480', status: 'positive' },
      { label: 'Designation', value: 'Lead Enterprise Architect', status: 'positive' },
      { label: 'Org Unit ID', value: '500012', status: 'positive' },
      { label: 'Cost Center', value: '100-2200 (IT Core)', status: 'neutral' }
    ],
    breakdownData: [
      { category: 'Organizational Unit', value: '500012', variance: 'Cloud Platforms', detail: 'Global Tech Solutions' },
      { category: 'Job Family (STELL)', value: 'ARCH-07', variance: 'Grade L7', detail: 'Architecture Track' },
      { category: 'Personnel Area (WERKS)', value: '1000 (US HQ)', variance: 'Personnel Subarea 0001', detail: 'Corporate Headquarters' }
    ],
    recommendedSapActions: [
      { actionName: 'Display Org Assignment', tcode: 'PA20', description: 'View Infotype 0001 details in Personnel Master' },
      { actionName: 'Display Position Structure', tcode: 'PO13', description: 'Inspect position attributes and reporting relations in OM' }
    ]
  },
  {
    questionId: 'Q3',
    questionText: 'Who is my manager?',
    category: 'Employee Information',
    sapSourceTables: ['PA0001', 'HRP1001', 'PA0002', 'I_PersonWorkAgreementQuickSearch'],
    summaryAnswer: 'Your manager is David Vance (PERNR 100108), VP of IT Solutions & Architecture (Position 50008810). Relationship established via OM Relationship A002 (Reports to) between your position 50012480 and Chief Position 50008810.',
    keyInsights: [
      'David Vance holds Chief Position (relationship A012) for Org Unit 500012.',
      'Approval routing for workflow items (Leave, Travel, Timesheet, Purchase Requisitions) directs to David Vance via SAP Business Workflow / My Inbox.',
      'Manager backup proxy configured: Elena Rostova (PERNR 100204).'
    ],
    hrMetrics: [
      { label: 'Manager Name', value: 'David Vance', status: 'positive' },
      { label: 'Manager PERNR', value: '100108', status: 'positive' },
      { label: 'Manager Title', value: 'VP IT Solutions', status: 'positive' },
      { label: 'Relationship', value: 'A002 (Reports to)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Chief Position', value: '50008810', variance: 'Org Unit 500012', detail: 'VP IT Solutions & Architecture' },
      { category: 'Work Email', value: 'd.vance@company.com', variance: 'Active', detail: 'Direct Phone: +1 (214) 555-0192' },
      { category: 'Workflow Substitution', value: 'Active (Elena Rostova)', variance: 'Rule HRUS_D2', detail: 'Full Administrative Proxy' }
    ],
    recommendedSapActions: [
      { actionName: 'View Org Tree', tcode: 'PPOME', description: 'Explore live organizational hierarchy and reporting lines' },
      { actionName: 'Workflow Substitute Matrix', tcode: 'SBWP', description: 'Inspect active delegation rules and approver fallbacks' }
    ]
  },
  {
    questionId: 'Q4',
    questionText: 'Show my employment history.',
    category: 'Employee Information',
    sapSourceTables: ['PA0000', 'PA0001', 'PA0008', 'T529T'],
    summaryAnswer: 'Employment History for PERNR 100452 reflects continuous service since 2021-04-15 with 3 recorded personnel actions: Hire (2021-04-15), Promotion & Pay Scale Reclassification (2023-01-01), and Internal Transfer to Cloud Architecture (2024-06-01).',
    keyInsights: [
      '2021-04-15: Initial Hire (Action 01) as Senior Solutions Consultant (Grade L5, Base $125,000).',
      '2023-01-01: Promotion (Action 03) to Principal Systems Engineer (Grade L6, Base $145,000).',
      '2024-06-01: Lateral Transfer & Promotion (Action 04) to Lead S/4 Enterprise Architect (Grade L7, Base $162,500).'
    ],
    hrMetrics: [
      { label: 'Total Tenure', value: '5.3 Years', status: 'positive' },
      { label: 'Total Actions Logged', value: '3 Major Events', status: 'positive' },
      { label: 'Current Level', value: 'Grade L7', status: 'positive' },
      { label: 'Career Trajectory', value: 'Top 5% Performer', status: 'positive' }
    ],
    breakdownData: [
      { category: '2021-04-15 (Hire)', value: 'Senior Solutions Consultant', variance: '$125K Base', detail: 'Infotype 0000 / Action 01' },
      { category: '2023-01-01 (Promotion)', value: 'Principal Systems Engineer', variance: '$145K Base (+16%)', detail: 'Infotype 0000 / Action 03' },
      { category: '2024-06-01 (Transfer/Prom)', value: 'Lead S/4 Enterprise Architect', variance: '$162.5K Base (+12%)', detail: 'Infotype 0000 / Action 04' }
    ],
    recommendedSapActions: [
      { actionName: 'Display Action History', tcode: 'PA20', description: 'Review Infotype 0000 (Actions) chronological log' },
      { actionName: 'Employee Log Book', tcode: 'S_AHR_61016369', description: 'Generate comprehensive career and compensation history' }
    ]
  },
  {
    questionId: 'Q5',
    questionText: 'What is my work location?',
    category: 'Employee Information',
    sapSourceTables: ['PA0001', 'PA0006', 'T001W', 'T500P'],
    summaryAnswer: 'Your official work location in SAP S/4HANA is Personnel Area US10 (Dallas Technology Campus), Building C - Floor 4, Desk C4-208. Address: 5000 Innovation Way, Dallas, TX 75201. Tax Jurisdiction: US-TX-DAL (Texas State - Zero State Income Tax). Remote work status: Hybrid (3 days onsite / 2 days remote).',
    keyInsights: [
      'Personnel Area: US10 (US North America Tech Center), Personnel Subarea: 0001 (HQ Campus).',
      'Tax jurisdiction code mapped in Infotype 0207/0208 matching physical workplace.',
      'Emergency evacuation zone: East Stairwell / Zone 4 assembly.'
    ],
    hrMetrics: [
      { label: 'Personnel Area', value: 'US10 (Dallas)', status: 'positive' },
      { label: 'Subarea', value: '0001 (Corporate HQ)', status: 'positive' },
      { label: 'Work Mode', value: 'Hybrid (3/2)', status: 'positive' },
      { label: 'Tax Jurisdiction', value: 'US-TX-DAL', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Facility Location', value: 'Campus Dallas Bldg C - 4th Floor', variance: 'Desk C4-208', detail: 'Assigned Seating' },
      { category: 'Country / Region', value: 'United States (US) / Texas (TX)', variance: 'Standard', detail: 'Timezone: America/Chicago (CST)' },
      { category: 'Badge & Access ID', value: 'B-8849102 (Valid thru 2028)', variance: 'Active Access', detail: 'Datacenter & Server Room Clearance' }
    ],
    recommendedSapActions: [
      { actionName: 'Display Address & Location', tcode: 'PA20', description: 'Check Infotype 0006 (Addresses) and Infotype 0001 workplace' },
      { actionName: 'Maintain Work Location', tcode: 'PA30', description: 'Submit telecommute or desk assignment change' }
    ]
  },
  {
    questionId: 'Q6',
    questionText: 'Show employees in my team.',
    category: 'Employee Information',
    sapSourceTables: ['PA0001', 'PA0002', 'HRP1001', 'I_PersonWorkAgreement'],
    summaryAnswer: 'Org Unit 500012 ("Enterprise Architecture & Cloud Tech") currently has 9 team members reporting into VP David Vance. 8 employees are active full-time, 1 on approved maternity/parental leave.',
    keyInsights: [
      'Core roles: 1 Lead Architect (Sarah Jenkins), 2 Senior Cloud Engineers, 3 S/4 ABAP RAP Specialists, 2 Integration Specialists, 1 Associate Developer.',
      'Team members are distributed across Dallas HQ (6), Chicago (2), and San Jose (1).',
      'Current sprint allocation: 100% capacity on S/4 Clean Core Modernization and BTP Integration.'
    ],
    hrMetrics: [
      { label: 'Total Team Members', value: '9 Employees', status: 'positive' },
      { label: 'Active Headcount', value: '8 Active / 1 Leave', status: 'positive' },
      { label: 'FTE Utilization', value: '98.5%', status: 'positive' },
      { label: 'Average Tenure', value: '3.8 Years', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Sarah Jenkins (100452)', value: 'Lead S/4 Enterprise Architect', variance: 'Dallas HQ', detail: 'Clean Core Lead' },
      { category: 'Marcus Brody (100458)', value: 'Sr Cloud Integration Engineer', variance: 'Dallas HQ', detail: 'BTP Event Mesh' },
      { category: 'Priya Sharma (100462)', value: 'Principal ABAP Developer', variance: 'Chicago Tech Center', detail: 'RAP / CDS Views' },
      { category: 'Liam O’Connor (100470)', value: 'S/4 Migration Consultant', variance: 'Dallas HQ', detail: 'On Parental Leave (Return Nov 1)' },
      { category: 'Jessica Wang (100481)', value: 'Integration Architect', variance: 'San Jose Lab', detail: 'CPI & Kafka APIs' }
    ],
    recommendedSapActions: [
      { actionName: 'Team Calendar & Roster', tcode: 'Fiori F1500', description: 'Launch My Team Work Center in SAP Fiori Launchpad' },
      { actionName: 'Staffing Schedule', tcode: 'PTMW', description: 'Review team time manager workplace and schedule' }
    ]
  },
  {
    questionId: 'Q7',
    questionText: 'Which employees joined this month?',
    category: 'Employee Information',
    sapSourceTables: ['PA0000', 'PA0001', 'PA0002', 'I_Employee'],
    summaryAnswer: 'In the current calendar month, 18 new employees completed onboarding across all company codes (11 in US10 Dallas, 4 in DE10 Frankfurt, 3 in UK10 London). 100% have active Infotype 0000 Action 01 (Hiring) records.',
    keyInsights: [
      '14 hires in Global Technology & Software Engineering, 4 in Supply Chain Operations.',
      '17 of 18 completed Day-1 compliance and security badge issuance.',
      '1 employee (PERNR 100582 - Alex Chen) has pending I-9 federal verification.'
    ],
    hrMetrics: [
      { label: 'New Hires This Month', value: '18 Joiners', status: 'positive' },
      { label: 'Onboarding Passed', value: '17 of 18 (94%)', status: 'positive' },
      { label: 'I-9 Verification Pending', value: '1 Employee', status: 'warning' },
      { label: 'Average Time to Hire', value: '28 Days', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Global Technology (500010)', value: '14 Hires', variance: '+40% vs Target', detail: 'Architects, Developers, DevOps' },
      { category: 'Supply Chain Ops (500020)', value: '3 Hires', variance: 'On Target', detail: 'EWM & TM Coordinators' },
      { category: 'Finance & Controlling (500030)', value: '1 Hire', variance: 'On Target', detail: 'Cost Accounting Specialist' }
    ],
    recommendedSapActions: [
      { actionName: 'New Hire Roster Report', tcode: 'S_PH9_46000223', description: 'Execute standard S_AHR hiring list filtered by month' },
      { actionName: 'Onboarding Tracker', tcode: 'Fiori F2350', description: 'Review I-9 and tax document completion in SuccessFactors Onboarding' }
    ]
  },
  {
    questionId: 'Q8',
    questionText: 'Which employees changed departments recently?',
    category: 'Employee Information',
    sapSourceTables: ['PA0000', 'PA0001', 'CDHDR', 'CDPOS', 'HRP1001'],
    summaryAnswer: 'In the last 60 days, 7 employees completed internal department transfers (Action 04 - Org Transfer) in SAP S/4HANA. All cost center splits and workflow delegations updated cleanly in Infotype 0001.',
    keyInsights: [
      '3 engineers moved from Legacy Maintenance to BTP Cloud Innovation.',
      '2 logistics planners transferred from Plant 1000 to Plant 2000 for EWM rollout.',
      'Zero orphaned workflow items: all SAP Business Workflow items rerouted to new managers.'
    ],
    hrMetrics: [
      { label: 'Internal Transfers', value: '7 Employees', status: 'positive' },
      { label: 'Cross-Entity Moves', value: '2 Transfers', status: 'positive' },
      { label: 'Workflow Cleared', value: '100% Rerouted', status: 'positive' },
      { label: 'Cost Allocation', value: '100% Balanced', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Elena Rostova (100204)', value: 'Finance -> Supply Chain Operations', variance: 'CC 100-1100 to 100-2200', detail: 'Lead Analyst' },
      { category: 'Carlos Mendez (100319)', value: 'Plant 1000 -> Plant 2000 (Austin)', variance: 'CC 100-3100 to 200-3100', detail: 'EWM Shift Lead' },
      { category: 'Devon Patel (100411)', value: 'Legacy ECC -> S/4 Cloud Architecture', variance: 'CC 100-5000 to 100-2200', detail: 'Senior Architect' }
    ],
    recommendedSapActions: [
      { actionName: 'Transfer Log Audit', tcode: 'PA20', description: 'Review Action 04 entries in Infotype 0000' },
      { actionName: 'Org Unit Transfer History', tcode: 'PPOM_OLD', description: 'Inspect chronological relationship shifts in OM' }
    ]
  },
  {
    questionId: 'Q9',
    questionText: 'Show employees by location, department, or business unit.',
    category: 'Employee Information',
    sapSourceTables: ['PA0001', 'T001W', 'T500P', 'HRP1000', 'HRP1001'],
    summaryAnswer: 'Enterprise Headcount Distribution across 3,420 total employees: North America (US10 Dallas: 1,840; US20 Austin: 620), Europe (DE10 Frankfurt: 680), Asia-Pacific (SG10 Singapore: 280). Top Departments: Manufacturing & Supply Chain (42%), Engineering & IT (31%), Sales & Commercial (18%), G&A (9%).',
    keyInsights: [
      'North America represents 72% of total enterprise workforce.',
      'Manufacturing operations represent highest location density in Dallas and Austin plants.',
      'Global Remote / Hybrid footprint stands at 44% of salaried knowledge workers.'
    ],
    hrMetrics: [
      { label: 'Total Headcount', value: '3,420 Employees', status: 'positive' },
      { label: 'US Locations', value: '2,460 (72%)', status: 'positive' },
      { label: 'EU / APAC', value: '960 (28%)', status: 'positive' },
      { label: 'Active Plants', value: '4 Major Sites', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Dallas HQ & Plant 1000 (US10)', value: '1,840 HC', variance: '53.8% of Total', detail: 'Corporate, Engineering, Plant 1' },
      { category: 'Frankfurt Tech & Plant (DE10)', value: '680 HC', variance: '19.9% of Total', detail: 'European HQ & Distribution' },
      { category: 'Austin Innovation Center (US20)', value: '620 HC', variance: '18.1% of Total', detail: 'Battery & Robotics Manufacturing' },
      { category: 'Singapore Hub (SG10)', value: '280 HC', variance: '8.2% of Total', detail: 'APAC Commercial & Logistics' }
    ],
    recommendedSapActions: [
      { actionName: 'Workforce Headcount Report', tcode: 'S_PH0_48000510', description: 'Run standard SAP headcount summary by Personnel Area and Org Unit' },
      { actionName: 'Workforce Analytics Dashboard', tcode: 'Fiori F2890', description: 'View real-time interactive geo-headcount map' }
    ]
  },
  {
    questionId: 'Q10',
    questionText: 'Which employee records have incomplete HR data?',
    category: 'Employee Information',
    sapSourceTables: ['PA0001', 'PA0002', 'PA0006', 'PA0009', 'PA0207', 'PA0210'],
    summaryAnswer: 'Data Completeness Audit: 6 out of 3,420 employee records have missing mandatory HR infotypes in S/4HANA (3 missing emergency contacts IT0006 subtype 4, 2 missing tax withholding certificates IT0210 for recent state transfers, 1 missing primary bank account IT0009).',
    keyInsights: [
      '99.82% overall HR master data completeness score across all legal entities.',
      '1 critical payroll blocker: PERNR 100589 lacks bank details in IT0009 prior to Friday cutoff.',
      'Automated ESS notifications dispatched with direct Fiori deep-links.'
    ],
    hrMetrics: [
      { label: 'Data Completeness', value: '99.82%', status: 'positive' },
      { label: 'Incomplete Records', value: '6 Employees', status: 'warning' },
      { label: 'Payroll Blockers', value: '1 Record (IT0009)', status: 'negative' },
      { label: 'Tax Profile Gaps', value: '2 Records (IT0210)', status: 'warning' }
    ],
    breakdownData: [
      { category: 'PERNR 100589 (K. Miller)', value: 'Missing Infotype 0009 (Bank Details)', variance: 'CRITICAL', detail: 'Payroll area US - Off-cycle risk' },
      { category: 'PERNR 100412 (T. Robinson)', value: 'Missing Infotype 0210 (TX State W-4)', variance: 'High', detail: 'Interstate Transfer from CA' },
      { category: 'PERNR 100591 (L. Zhao)', value: 'Missing Infotype 0210 (TX State W-4)', variance: 'High', detail: 'Interstate Transfer from NY' },
      { category: '3 Employees (100593..5)', value: 'Missing Emergency Contact (IT0006 sub 4)', variance: 'Medium', detail: 'Safety & Compliance' }
    ],
    recommendedSapActions: [
      { actionName: 'Maintain Master Data', tcode: 'PA30', description: 'Directly update missing infotypes for flagged PERNRs' },
      { actionName: 'HR Master Data Quality Audit', tcode: 'S_ALR_87014044', description: 'Run automated field completeness validation across all infotypes' }
    ]
  },

  // ============================================================================
  // PILLAR 2: Time, Attendance & Leave (Q11 - Q20)
  // ============================================================================
  {
    questionId: 'Q11',
    questionText: 'How much vacation balance do I have?',
    category: 'Time, Attendance & Leave',
    sapSourceTables: ['PA2006', 'PA2001', 'I_AbsenceRecord', 'PT_QTA10'],
    summaryAnswer: 'Your available Vacation / PTO Balance in SAP S/4HANA (Infotype 2006 - Absence Quotas, Quota Type 10) is 18.5 Days (148.0 Hours). You have accrued 22.0 days YTD, taken 3.5 days, and have 0 pending unapproved deduction days.',
    keyInsights: [
      'Quota Type 10 (Vacation US): Total entitlement 25.0 days/year accrued at 2.08 days/month.',
      'Carry-over from previous calendar year: 4.0 days (valid through Dec 31, 2026).',
      'Floating Holiday Quota (Type 20): 2.0 days remaining (16.0 hours).'
    ],
    hrMetrics: [
      { label: 'Available Vacation', value: '18.5 Days (148 hrs)', status: 'positive' },
      { label: 'Floating Holidays', value: '2.0 Days (16 hrs)', status: 'positive' },
      { label: 'YTD Taken', value: '3.5 Days', status: 'positive' },
      { label: 'Year-End Expiry Risk', value: '0 Days (Safe)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Annual Vacation Accrual (Q10)', value: '14.5 Days Remaining', variance: 'Accrues +2.08d/mo', detail: 'Valid thru 2026-12-31' },
      { category: 'Prior Year Carryover (Q10)', value: '4.0 Days Remaining', variance: 'Expires Dec 31', detail: 'Must be consumed first' },
      { category: 'Floating Holidays (Q20)', value: '2.0 Days Remaining', variance: 'Use it or lose it', detail: 'Company Holiday Policy' },
      { category: 'Sick Leave Quota (Q30)', value: '10.0 Days Accrued', variance: 'Non-lapsing', detail: 'Protected Health Leave' }
    ],
    recommendedSapActions: [
      { actionName: 'Time Quota Overview', tcode: 'PT50', description: 'Inspect real-time quota deduction transaction and accruals' },
      { actionName: 'My Leave Balance', tcode: 'Fiori F1311', description: 'Launch Fiori ESS leave balance summary' }
    ]
  },
  {
    questionId: 'Q12',
    questionText: 'Show my leave balance.',
    category: 'Time, Attendance & Leave',
    sapSourceTables: ['PA2006', 'PA2001', 'PA0007', 'T556A'],
    summaryAnswer: 'Comprehensive Leave Portfolio for PERNR 100452: Vacation / PTO: 18.5 Days (148 hrs), Floating Holidays: 2.0 Days (16 hrs), Sick / Medical Leave: 10.0 Days (80 hrs), Volunteer Day: 1.0 Day (8 hrs). Total Available Leave: 31.5 Days (252 hrs).',
    keyInsights: [
      'All quotas verified against Infotype 2006 records generated via Time Evaluation RPTIME00.',
      'No negative balances or deduction overrides present.',
      'Next scheduled monthly accrual: +2.08 days on 1st of next month.'
    ],
    hrMetrics: [
      { label: 'Total Available Leave', value: '31.5 Days', status: 'positive' },
      { label: 'Paid Vacation', value: '18.5 Days', status: 'positive' },
      { label: 'Sick / Health', value: '10.0 Days', status: 'positive' },
      { label: 'Floating / Volunteer', value: '3.0 Days', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Vacation Quota (KTART 10)', value: '18.5 Days (148 hrs)', variance: 'Available', detail: 'Accrual Rule US_ANN_01' },
      { category: 'Sick Leave Quota (KTART 30)', value: '10.0 Days (80 hrs)', variance: 'Available', detail: 'Accrual Rule US_SCK_01' },
      { category: 'Floating Holiday (KTART 20)', value: '2.0 Days (16 hrs)', variance: 'Available', detail: 'Annual Grant' },
      { category: 'Volunteer Time (KTART 40)', value: '1.0 Day (8 hrs)', variance: 'Available', detail: 'Corporate Social Grant' }
    ],
    recommendedSapActions: [
      { actionName: 'Time Statement Display', tcode: 'PT61', description: 'Generate official monthly employee time statement' },
      { actionName: 'Quota Correction', tcode: 'PA30', description: 'Maintain Infotype 2013 for manual quota adjustments' }
    ]
  },
  {
    questionId: 'Q13',
    questionText: 'Submit vacation from September 10 to September 14.',
    category: 'Time, Attendance & Leave',
    sapSourceTables: ['PA2001', 'PA2006', 'I_AbsenceRecord', 'PTARQ'],
    summaryAnswer: 'Leave Request Simulation & Pre-check: 5 working days (40.0 hours) from 2026-09-10 to 2026-09-14 (Type: Vacation - Absence Code 0100). Quota balance after deduction will be 13.5 Days. No team blackout overlap detected. Status: Workflow Request 00049219 submitted to David Vance for approval.',
    keyInsights: [
      'Dates: 2026-09-10 (Thu), 2026-09-11 (Fri), 2026-09-14 (Mon), 2026-09-15 (Tue), 2026-09-16 (Wed) - 5 days counted against work schedule NORM40.',
      'Weekend days (Sep 12-13) automatically excluded based on Holiday Calendar US.',
      'David Vance notified via SAP Fiori My Inbox and email.'
    ],
    hrMetrics: [
      { label: 'Requested Duration', value: '5 Days (40 hrs)', status: 'positive' },
      { label: 'Remaining Quota Post-Deduction', value: '13.5 Days', status: 'positive' },
      { label: 'Team Overlap Risk', value: '0 Conflicts (Low)', status: 'positive' },
      { label: 'Workflow Status', value: 'Sent to Manager', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Absence Type', value: '0100 (Paid Vacation)', variance: 'Infotype 2001', detail: 'Standard Annual PTO' },
      { category: 'Deduction Period', value: '2026-09-10 to 2026-09-14', variance: '5 Working Days', detail: 'Schedule NORM40' },
      { category: 'Approver Assigned', value: 'David Vance (PERNR 100108)', variance: 'Workflow Task TS12300116', detail: 'Auto-escalation in 48h' }
    ],
    recommendedSapActions: [
      { actionName: 'Create Leave Request', tcode: 'Fiori F1310', description: 'Open My Leave Requests Fiori application' },
      { actionName: 'Direct Infotype Entry', tcode: 'PA30', description: 'Create Infotype 2001 record in SAP GUI with administrative privileges' }
    ]
  },
  {
    questionId: 'Q14',
    questionText: 'Who on my team is out today?',
    category: 'Time, Attendance & Leave',
    sapSourceTables: ['PA2001', 'PA2002', 'HRP1001', 'CATSDB'],
    summaryAnswer: 'Team Absence Status for Today (Org Unit 500012): 1 team member is currently out on scheduled leave: Liam O’Connor (PERNR 100470 - Parental Leave). All other 8 team members are logged in or scheduled active.',
    keyInsights: [
      'Liam O’Connor: Approved Parental Leave (Absence 0320) through 2026-11-01. Coverage handled by Sarah Jenkins & Marcus Brody.',
      'Zero unscheduled sick leave or unplanned absence reports logged today.',
      'Team attendance rate today: 88.9% (Normal operational capacity).'
    ],
    hrMetrics: [
      { label: 'Team Members Out', value: '1 Employee', status: 'neutral' },
      { label: 'Active Today', value: '8 of 9 (88.9%)', status: 'positive' },
      { label: 'Unplanned Absences', value: '0 Incidents', status: 'positive' },
      { label: 'Coverage Status', value: '100% Covered', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Liam O’Connor (100470)', value: 'Parental Leave (Absence 0320)', variance: 'Approved Long-Term', detail: 'Return: Nov 1, 2026' },
      { category: 'Sarah Jenkins (100452)', value: 'Present / Onsite', variance: 'Dallas HQ', detail: 'Clean Core Project' },
      { category: 'Marcus Brody (100458)', value: 'Present / Onsite', variance: 'Dallas HQ', detail: 'BTP Integration' },
      { category: 'Priya Sharma (100462)', value: 'Present / Remote', variance: 'Chicago Hub', detail: 'RAP Development' }
    ],
    recommendedSapActions: [
      { actionName: 'Team Absence Calendar', tcode: 'Fiori F1501', description: 'Open team availability calendar view' },
      { actionName: 'Time Manager Workplace', tcode: 'PTMW', description: 'Inspect attendance and absence logs across org unit' }
    ]
  },
  {
    questionId: 'Q15',
    questionText: 'Show pending leave requests.',
    category: 'Time, Attendance & Leave',
    sapSourceTables: ['SWWWIHEAD', 'PA2001', 'PTARQ', 'I_AbsenceRecord'],
    summaryAnswer: 'There are currently 4 pending leave requests awaiting manager approval across Org Unit 500012 & 500014 totaling 14.0 days. Oldest pending item is 1.5 days old (well within 48-hour SLA).',
    keyInsights: [
      '2 requests for Vacation PTO (Marcus Brody: Sep 18-19; Priya Sharma: Oct 2-6).',
      '1 request for Floating Holiday (Carlos Mendez: Sep 25).',
      '1 request for Training / Conference Leave (Devon Patel: Oct 12-14).'
    ],
    hrMetrics: [
      { label: 'Pending Requests', value: '4 Requests', status: 'neutral' },
      { label: 'Total Days Requested', value: '14.0 Days', status: 'neutral' },
      { label: 'Within SLA (<48h)', value: '100% Compliant', status: 'positive' },
      { label: 'Quota Conflicts', value: '0 Identified', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Marcus Brody (100458)', value: '2.0 Days (Sep 18 - Sep 19)', variance: 'Vacation PTO', detail: 'Approver: David Vance' },
      { category: 'Priya Sharma (100462)', value: '5.0 Days (Oct 02 - Oct 06)', variance: 'Annual PTO', detail: 'Approver: David Vance' },
      { category: 'Carlos Mendez (100319)', value: '1.0 Day (Sep 25)', variance: 'Floating Holiday', detail: 'Approver: Elena Rostova' },
      { category: 'Devon Patel (100411)', value: '3.0 Days (Oct 12 - Oct 14)', variance: 'TechEd Conference', detail: 'Approver: David Vance' }
    ],
    recommendedSapActions: [
      { actionName: 'Approve Leave Requests', tcode: 'Fiori F0402', description: 'Open My Inbox to batch approve pending leave workflows' },
      { actionName: 'Leave Request Admin', tcode: 'PTARQ', description: 'Review, unlock, or delete problematic leave records' }
    ]
  },
  {
    questionId: 'Q16',
    questionText: 'Which employees have excessive overtime?',
    category: 'Time, Attendance & Leave',
    sapSourceTables: ['CATSDB', 'PA2002', 'PA2010', 'T510S', 'I_TimeSheetRecord'],
    summaryAnswer: 'Overtime Audit: 5 employees in Plant 1000 Manufacturing & Logistics logged >16.0 hours of overtime in the current bi-weekly pay period. Top overtime earner: PERNR 100188 (Jake Sterling - EWM Lead Picker) with 22.5 OT hours.',
    keyInsights: [
      'Total plant overtime cost this cycle: $14,850 USD across 142 total OT hours.',
      'Primary driver: Weekend emergency freight turnaround for OEM customer order SO-99410.',
      'Zero FLSA / OSHA maximum continuous rest violations detected.'
    ],
    hrMetrics: [
      { label: 'Employees with High OT', value: '5 Employees (>16h)', status: 'warning' },
      { label: 'Max Individual OT', value: '22.5 Hours', status: 'warning' },
      { label: 'Total OT Hours (Dept)', value: '142.0 Hours', status: 'neutral' },
      { label: 'Overtime Premium Paid', value: '1.5x / 2.0x Standard', status: 'neutral' }
    ],
    breakdownData: [
      { category: 'Jake Sterling (100188)', value: '22.5 OT Hours ($1,687)', variance: 'Warehouse Ops', detail: 'Weekend Outbound Peak' },
      { category: 'Robert Briggs (100192)', value: '21.0 OT Hours ($1,575)', variance: 'Warehouse Ops', detail: 'Weekend Outbound Peak' },
      { category: 'Travis Scott (100205)', value: '18.5 OT Hours ($1,480)', variance: 'Maintenance Tech', detail: 'Line 2 Turbine Overhaul' },
      { category: 'Angela Wu (100214)', value: '17.0 OT Hours ($1,275)', variance: 'Production Line A', detail: 'Automotive Sub-assembly' },
      { category: 'Miguel Gomez (100220)', value: '16.5 OT Hours ($1,237)', variance: 'Production Line B', detail: 'Shift Relief Coverage' }
    ],
    recommendedSapActions: [
      { actionName: 'Time Sheet Overtime Audit', tcode: 'CATC', description: 'Analyze CATS time records filtered by wage type 1020 (OT 1.5x)' },
      { actionName: 'Display Time Evaluation Log', tcode: 'PT60', description: 'Inspect time wage type formation in cluster B2' }
    ]
  },
  {
    questionId: 'Q17',
    questionText: 'Show employees with missing time entries.',
    category: 'Time, Attendance & Leave',
    sapSourceTables: ['CATSDB', 'PA0007', 'I_TimeSheetRecord', 'CATS_DA'],
    summaryAnswer: 'Time Tracking Compliance: 8 employees have unentered or incomplete timesheets for the week ending last Friday (representing 64 missing working hours). All 8 are hourly plant contractors or non-exempt technicians.',
    keyInsights: [
      'Automated CATS email & SMS push reminders triggered to all 8 employees and their shift supervisors.',
      'Payroll cutoff is in 36 hours; missing time entries must be completed to prevent off-cycle retro adjustments.',
      'Zero missing entries for exempt salaried staff (positive time recording not mandatory).'
    ],
    hrMetrics: [
      { label: 'Missing Time Entries', value: '8 Employees', status: 'warning' },
      { label: 'Missing Recorded Hours', value: '64.0 Hours', status: 'warning' },
      { label: 'Payroll Cutoff Deadline', value: '36 Hours Left', status: 'warning' },
      { label: 'Compliance Rate', value: '97.6%', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Plant 1000 Line 1 (Assembly)', value: '4 Employees Missing', variance: '32.0 Hours Total', detail: 'Supervisor: Mark Davis' },
      { category: 'Plant 1000 Maintenance', value: '2 Employees Missing', variance: '16.0 Hours Total', detail: 'Supervisor: Tim Reynolds' },
      { category: 'Warehouse Logistics (EWM)', value: '2 Employees Missing', variance: '16.0 Hours Total', detail: 'Supervisor: Brenda Clark' }
    ],
    recommendedSapActions: [
      { actionName: 'CATS Missing Time Report', tcode: 'CATS_DA', description: 'Run CATS: Display Working Times for incomplete time recording' },
      { actionName: 'Timesheet Entry Admin', tcode: 'CAT2', description: 'Enter or maintain time data directly on behalf of employees' }
    ]
  },
  {
    questionId: 'Q18',
    questionText: 'Which time sheets are waiting for approval?',
    category: 'Time, Attendance & Leave',
    sapSourceTables: ['CATSDB', 'SWWWIHEAD', 'CATS_APPR_LITE', 'I_TimeSheetRecord'],
    summaryAnswer: 'Approval Queue: 18 timesheet records totaling 720.0 hours are currently submitted (Status 20 - "Submitted") awaiting supervisory approval in CATS / Fiori Approve Timesheets.',
    keyInsights: [
      '12 timesheets belong to Plant 1000 Manufacturing (Supervisor Mark Davis).',
      '6 timesheets belong to Plant 2000 Maintenance (Supervisor Brenda Clark).',
      'Zero rejected timesheets (Status 40); all passed automated CATS field validation.'
    ],
    hrMetrics: [
      { label: 'Timesheets Pending', value: '18 Records', status: 'neutral' },
      { label: 'Total Hours Pending', value: '720.0 Hours', status: 'neutral' },
      { label: 'Supervisor Queues', value: '2 Supervisors', status: 'neutral' },
      { label: 'Validation Errors', value: '0 Errors', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Mark Davis (Supervisor 100080)', value: '12 Timesheets (480 hrs)', variance: 'Plant 1000', detail: 'Batch approve available' },
      { category: 'Brenda Clark (Supervisor 100085)', value: '6 Timesheets (240 hrs)', variance: 'Plant 2000', detail: 'Batch approve available' }
    ],
    recommendedSapActions: [
      { actionName: 'Approve Timesheets Lite', tcode: 'CATS_APPR_LITE', description: 'Launch SAP GUI mass approval tool for CATSDB records' },
      { actionName: 'Approve Timesheet Fiori', tcode: 'Fiori F1502', description: 'Open Fiori Approve Timesheets app for supervisors' }
    ]
  },
  {
    questionId: 'Q19',
    questionText: 'Show absence trends by department.',
    category: 'Time, Attendance & Leave',
    sapSourceTables: ['PA2001', 'HRP1000', 'I_AbsenceRecord', 'PT_BAL00'],
    summaryAnswer: 'Quarterly Absence Analytics: Enterprise-wide planned absence rate is 4.8% and unplanned (sick/emergency) rate is 1.6%. Department with highest absence rate: Customer Support (6.2% planned, 2.8% unplanned). Department with lowest absence rate: IT & Architecture (3.1% planned, 0.4% unplanned).',
    keyInsights: [
      'Summer seasonal peak observed across European operations in July-August (planned PTO avg 8.4%).',
      'Customer Support unplanned sick absence shows slight upward trend on Mondays/Fridays (+14%).',
      'Overall absenteeism index remains well below industry benchmark of 3.2%.'
    ],
    hrMetrics: [
      { label: 'Enterprise Planned Rate', value: '4.8%', status: 'positive' },
      { label: 'Enterprise Unplanned Rate', value: '1.6%', status: 'positive' },
      { label: 'Highest Absence Org', value: 'Customer Support (9.0% total)', status: 'warning' },
      { label: 'Lowest Absence Org', value: 'IT Architecture (3.5% total)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Customer Support (500050)', value: '9.0% Absence Rate', variance: '+2.6% vs Avg', detail: 'Planned: 6.2%, Unplanned: 2.8%' },
      { category: 'Plant 1000 Manufacturing (500020)', value: '6.5% Absence Rate', variance: '+0.1% vs Avg', detail: 'Planned: 4.9%, Unplanned: 1.6%' },
      { category: 'Sales & Marketing (500040)', value: '5.2% Absence Rate', variance: '-1.2% vs Avg', detail: 'Planned: 4.1%, Unplanned: 1.1%' },
      { category: 'Enterprise IT & Cloud (500012)', value: '3.5% Absence Rate', variance: '-2.9% vs Avg', detail: 'Planned: 3.1%, Unplanned: 0.4%' }
    ],
    recommendedSapActions: [
      { actionName: 'Absence Statistics Report', tcode: 'S_AHR_61016380', description: 'Run standard SAP absence analysis by Org Unit and Absence Type' },
      { actionName: 'Time Analytics Dashboard', tcode: 'Fiori F2710', description: 'Review SAC workforce time and absence KPIs' }
    ]
  },
  {
    questionId: 'Q20',
    questionText: 'Which employees have attendance exceptions?',
    category: 'Time, Attendance & Leave',
    sapSourceTables: ['PA2001', 'PA2002', 'CATSDB', 'RPTIME00', 'PT60'],
    summaryAnswer: 'Time Evaluation Exceptions (Error Category 1 & 2 in Time Cluster B2): 3 employees have attendance exceptions requiring manual time administrator review (1 core time violation, 1 missing punch on clock-in terminal, 1 unapproved overtime threshold).',
    keyInsights: [
      'PERNR 100340: Missing afternoon clock-out on Terminal T-04 (Plant 1000 Gate 2).',
      'PERNR 100412: Core time violation (arrived 10:45 AM without prior notification).',
      'PERNR 100288: Overtime exceeded scheduled tolerance by 45 minutes without supervisor pre-approval.'
    ],
    hrMetrics: [
      { label: 'Active Exceptions', value: '3 Employees', status: 'warning' },
      { label: 'Missing Terminal Punches', value: '1 Incident', status: 'warning' },
      { label: 'Core Time Violations', value: '1 Incident', status: 'warning' },
      { label: 'Time Eval Status', value: 'RPTIME00 Completed', status: 'positive' }
    ],
    breakdownData: [
      { category: 'PERNR 100340 (Dave Miller)', value: 'Error 02: Missing Out-Punch', variance: 'Terminal T-04', detail: 'Requires manual pair generation in PTMW' },
      { category: 'PERNR 100412 (Tina Ray)', value: 'Error 07: Core Time Breach', variance: 'Shift 08:00-16:30', detail: 'Arrived 10:45 AM' },
      { category: 'PERNR 100288 (Eric Thorne)', value: 'Error 14: Unapproved OT Split', variance: '+45 min unauth', detail: 'Requires Supervisor sign-off' }
    ],
    recommendedSapActions: [
      { actionName: 'Time Management Workplace', tcode: 'PTMW', description: 'Fix missing clock events and correct attendance pairs' },
      { actionName: 'Time Evaluation Log', tcode: 'PT60', description: 'Execute time evaluation with log to verify error resolution' }
    ]
  },

  // ============================================================================
  // PILLAR 3: Payroll (Q21 - Q30)
  // ============================================================================
  {
    questionId: 'Q21',
    questionText: 'Show my latest payslip.',
    category: 'Payroll',
    sapSourceTables: ['PCL2', 'HRPY_RGDIR', 'PY_RT', 'PA0008', 'I_PayrollResult'],
    summaryAnswer: 'Latest Payslip Summary for PERNR 100452 (Period 05/2026 - Paid May 15, 2026): Gross Earnings: $6,770.83 USD | Total Taxes: $1,692.71 USD | Deductions (401k, Medical, HSA): $1,083.33 USD | Net Pay Deposited: $3,994.79 USD via Direct Deposit to Chase Checking (****4892).',
    keyInsights: [
      'Gross Pay components: Base Salary /101 ($6,250.00), Architecture Retention Bonus /102 ($520.83).',
      'Taxes: Federal Withholding ($982.50), Social Security ($419.79), Medicare ($98.18), State Tax TX ($0.00).',
      'Pre-tax Benefits: 401(k) Contribution 8% ($541.67), Employer Match 4% ($270.83), Medical PPO ($450.00), HSA ($91.66).'
    ],
    hrMetrics: [
      { label: 'Gross Earnings', value: '$6,770.83', status: 'positive' },
      { label: 'Net Take-Home', value: '$3,994.79', status: 'positive' },
      { label: 'Total Deductions', value: '$2,776.04', status: 'neutral' },
      { label: 'Pay Period', value: '05/2026 (Bi-Weekly)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Base Salary (Wage Type 1000)', value: '$6,250.00', variance: 'Regular', detail: '80.0 Hours Regular' },
      { category: 'Retention Bonus (Wage Type 2050)', value: '$520.83', variance: 'Monthly Tranche', detail: 'Technical Retention Program' },
      { category: 'Federal / FICA Taxes (/401, /403)', value: '$1,692.71', variance: 'Standard Withholding', detail: 'Single / 0 Exemptions' },
      { category: 'Voluntary Benefits & 401k', value: '$1,083.33', variance: 'Pre-Tax', detail: '8% 401k + Health + HSA' }
    ],
    recommendedSapActions: [
      { actionName: 'Display Remuneration Statement', tcode: 'PC00_M99_CEDT', description: 'Generate formatted official SAP PDF payslip' },
      { actionName: 'My Payslips Fiori', tcode: 'Fiori F1313', description: 'Launch Fiori ESS My Payslips app' }
    ]
  },
  {
    questionId: 'Q22',
    questionText: 'When is the next payroll date?',
    category: 'Payroll',
    sapSourceTables: ['T549A', 'T549Q', 'PA03', 'T549S'],
    summaryAnswer: 'Next Official Payroll Date for Payroll Area US (Bi-weekly Salaried & Hourly): Friday, May 29, 2026 (Period 06/2026). Direct deposit funds will settle at 12:01 AM EST. Master data cut-off date is Tuesday, May 26, 2026 at 5:00 PM EST.',
    keyInsights: [
      'Payroll Area: US (United States Bi-Weekly).',
      'Timesheet submission deadline for Period 06: Monday, May 25, 2026.',
      'Payroll simulation execution scheduled: Wednesday, May 27, 2026.'
    ],
    hrMetrics: [
      { label: 'Next Pay Date', value: 'May 29, 2026', status: 'positive' },
      { label: 'Payroll Period', value: 'Period 06/2026', status: 'positive' },
      { label: 'Cutoff Deadline', value: 'May 26, 2026 (5 PM)', status: 'warning' },
      { label: 'Payroll Area', value: 'US (Bi-weekly)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Payroll Period Dates', value: '2026-05-16 to 2026-05-29', variance: '14 Calendar Days', detail: '80 Working Hours' },
      { category: 'Time Recording Cutoff', value: '2026-05-25 (Mon 5:00 PM)', variance: 'SLA Strict', detail: 'CATS Timesheet lock' },
      { category: 'Master Data Lock (PA03)', value: '2026-05-26 (Tue 5:00 PM)', variance: 'Control Record', detail: 'Infotypes 0008, 0014, 0015 locked' },
      { category: 'ACH Direct Deposit Transmission', value: '2026-05-28 (Thu 10:00 AM)', variance: 'Bank Wire', detail: 'Federal Reserve ACH Window' }
    ],
    recommendedSapActions: [
      { actionName: 'Display Payroll Calendar', tcode: 'PC00_M99_CALC', description: 'Review period dates, payment dates, and generation rules' },
      { actionName: 'Payroll Control Record', tcode: 'PA03', description: 'Check current period state and release status' }
    ]
  },
  {
    questionId: 'Q23',
    questionText: 'Why is my paycheck different this month?',
    category: 'Payroll',
    sapSourceTables: ['PCL2', 'PY_RT', 'PA0014', 'PA0015', 'PA0210'],
    summaryAnswer: 'Paycheck Variance Analysis (Period 05 vs Period 04): Your net paycheck increased by +$412.50 USD (+11.5%). Root Causes: 1) One-time Technology Certification Award +$500.00 Gross (Wage Type 2140), 2) Adjusted 401(k) deduction -$40.00, 3) Incremental tax withholding +$47.50.',
    keyInsights: [
      'Wage Type 2140 (Spot Award): $500.00 entered via Infotype 0015 (Additional Payments) for S/4HANA Clean Core certification.',
      'No unintended deductions or retroactive clawbacks detected.',
      'Next period will return to standard baseline net pay of $3,582.29 USD.'
    ],
    hrMetrics: [
      { label: 'Net Pay Variance', value: '+$412.50 (+11.5%)', status: 'positive' },
      { label: 'Gross Variance', value: '+$500.00', status: 'positive' },
      { label: 'Primary Driver', value: 'Spot Certification Award', status: 'positive' },
      { label: 'Recurring Status', value: 'One-Time Non-Recurring', status: 'neutral' }
    ],
    breakdownData: [
      { category: 'Period 04 Net Pay', value: '$3,582.29', variance: 'Prior Period', detail: 'Standard Baseline' },
      { category: 'One-Time Award (WT 2140)', value: '+$500.00 (Gross)', variance: 'IT0015', detail: 'SAP Certification Bonus' },
      { category: 'Tax Impact (Federal/FICA)', value: '-$87.50 (Tax)', variance: 'Incremental', detail: 'Marginal Tax Rate 17.5%' },
      { category: 'Period 05 Net Pay', value: '$3,994.79', variance: 'Current Period', detail: 'Deposited May 15, 2026' }
    ],
    recommendedSapActions: [
      { actionName: 'Display Payroll Comparison', tcode: 'PC00_M99_CWTR', description: 'Run Wage Type Reporter to compare Period 04 vs Period 05' },
      { actionName: 'Display Additional Payments', tcode: 'PA20', description: 'View one-off entries in Infotype 0015' }
    ]
  },
  {
    questionId: 'Q24',
    questionText: 'Show payroll errors from the latest run.',
    category: 'Payroll',
    sapSourceTables: ['PCL2', 'PC00_M99_CALC', 'RPCALCU0', 'I_PayrollResult'],
    summaryAnswer: 'Payroll Simulation Error Log (Payroll Area US - Period 05/2026): 3 out of 1,840 employee personnel numbers encountered calculation errors during simulation run. Zero unposted errors in live production run (all 3 were resolved prior to final settlement).',
    keyInsights: [
      'Error 1 (PERNR 100412): Missing Tax Jurisdiction in IT0208 for recent Texas relocation (Status: Fixed).',
      'Error 2 (PERNR 100510): Negative Net Pay generated due to excessive advance deduction (Status: Split across 2 periods).',
      'Error 3 (PERNR 100589): Missing active bank details in IT0009 (Status: Check issued via manual off-cycle).'
    ],
    hrMetrics: [
      { label: 'Calculation Errors', value: '3 Records (0.16%)', status: 'positive' },
      { label: 'Successfully Processed', value: '1,837 of 1,840 (99.84%)', status: 'positive' },
      { label: 'Unresolved Errors', value: '0 Active Errors', status: 'positive' },
      { label: 'Payroll Posting Status', value: 'PCP0 100% Posted', status: 'positive' }
    ],
    breakdownData: [
      { category: 'PERNR 100412 (Tax Error)', value: 'Error 0041: No Tax Table Entry', variance: 'Resolved', detail: 'Maintained IT0208/0210' },
      { category: 'PERNR 100510 (Net < 0)', value: 'Error 0192: Negative Net Pay', variance: 'Resolved', detail: 'Adjusted deduction limit' },
      { category: 'PERNR 100589 (No Bank)', value: 'Error 0310: Payment Method Error', variance: 'Resolved', detail: 'Issued live paper draft' }
    ],
    recommendedSapActions: [
      { actionName: 'Payroll Error Log Review', tcode: 'PC00_M99_CALC', description: 'Execute payroll calculation in test mode with error logging' },
      { actionName: 'Payroll Control Center Alerts', tcode: 'Fiori F1504', description: 'Review live payroll validation alerts in PCC' }
    ]
  },
  {
    questionId: 'Q25',
    questionText: 'Which employees have payroll exceptions?',
    category: 'Payroll',
    sapSourceTables: ['PCL2', 'PY_RT', 'PA0014', 'PA0015', 'PA0008'],
    summaryAnswer: 'Payroll Exception List (Period 05): 12 employees triggered automated pre-payroll exception warnings: 6 with >20% overtime gross earnings variance, 3 with retroactive pay adjustments >$1,000, 2 with unpaid leave deductions, 1 with maximum 401(k) annual cap ($23,000) reached.',
    keyInsights: [
      'Overtime spikes: 6 technicians in Plant 1000 logged high weekend maintenance hours.',
      '401(k) IRS statutory cap reached for PERNR 100015 (VP Quality) - automated wage type switch to non-qualified plan.',
      'All 12 exceptions signed off by Payroll Lead prior to bank file generation.'
    ],
    hrMetrics: [
      { label: 'Total Exceptions', value: '12 Employees', status: 'neutral' },
      { label: 'Overtime Spikes', value: '6 Employees', status: 'neutral' },
      { label: 'Retro > $1K', value: '3 Employees', status: 'neutral' },
      { label: 'IRS Cap Reached', value: '1 Employee', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Overtime Spikes (>20%)', value: '6 Employees ($8,920 OT)', variance: 'Plant 1000', detail: 'Verified against CATS time' },
      { category: 'High Retro Adjustments', value: '3 Employees ($4,250 Retro)', variance: 'Pay Scale Reclass', detail: 'Infotype 0008 update' },
      { category: 'Unpaid Absences (Furlough/Leave)', value: '2 Employees (-$1,850)', variance: 'Absence 0200', detail: 'Deduction compliant' },
      { category: '401k Limit Reached', value: '1 Employee ($23,000 Cap)', variance: 'IRS Statutory', detail: 'Switched to Post-Tax' }
    ],
    recommendedSapActions: [
      { actionName: 'Wage Type Reporter', tcode: 'PC00_M99_CWTR', description: 'Run comprehensive exception report for wage type outliers' },
      { actionName: 'Display Payroll Cluster', tcode: 'PC_PAYRESULT', description: 'Inspect individual employee payroll result tables (RT, CRT, BT)' }
    ]
  },
  {
    questionId: 'Q26',
    questionText: 'Show retroactive payroll adjustments.',
    category: 'Payroll',
    sapSourceTables: ['PCL2', 'HRPY_RGDIR', 'PY_RT', 'PA0008', 'PA0003'],
    summaryAnswer: 'Retroactive Payroll Run Summary (Period 05): Retroactive calculations were triggered for 14 employees totaling $9,840.50 USD across prior periods (Period 03 & 04). All retro calculations stem from approved retroactive salary increases (Infotype 0008) and backdated timesheet entries.',
    keyInsights: [
      '11 retro adjustments caused by annual merit increase backdated to April 1st.',
      '3 retro adjustments caused by retroactive overtime approval for Plant 1000.',
      'All differences calculated automatically via SAP standard retro-engine with correct tax delta reporting.'
    ],
    hrMetrics: [
      { label: 'Employees with Retro', value: '14 Employees', status: 'neutral' },
      { label: 'Total Retro Net Delta', value: '+$9,840.50', status: 'neutral' },
      { label: 'Oldest Retro Period', value: 'Period 03/2026', status: 'positive' },
      { label: 'Tax Accuracy', value: '100% Balanced', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Merit Salary Reclassification (IT0008)', value: '11 Employees ($7,620.00)', variance: 'Backdated to Apr 1', detail: 'Grade promotion deltas' },
      { category: 'Retroactive Overtime (CATSDB)', value: '3 Employees ($2,220.50)', variance: 'Backdated to Period 04', detail: 'Plant 1000 weekend shift' }
    ],
    recommendedSapActions: [
      { actionName: 'Retro Payroll Audit', tcode: 'PC_PAYRESULT', description: 'Review retro calculation table (RT_PREV vs RT_CURR)' },
      { actionName: 'Display Earliest MD Change', tcode: 'PA03', description: 'Check earliest retro accounting date for Payroll Area US' }
    ]
  },
  {
    questionId: 'Q27',
    questionText: 'Which payroll results require review?',
    category: 'Payroll',
    sapSourceTables: ['PCL2', 'PA03', 'PCP0', 'I_PayrollResult'],
    summaryAnswer: 'Payroll Quality Audit: 2 payroll results require secondary supervisory sign-off before closing Period 05: 1) Executive termination severance calculation for PERNR 100098 ($34,500 package), 2) International relocation gross-up tax calculation for PERNR 100415 ($12,200).',
    keyInsights: [
      'Both items are high-value manual off-cycle entries subject to dual-authorization policy.',
      'Standard recurring payroll for 1,838 employees is 100% verified and approved.',
      'No G/L account posting mismatches in PCP0 simulation.'
    ],
    hrMetrics: [
      { label: 'Results Pending Review', value: '2 High-Value Records', status: 'warning' },
      { label: 'Standard Records Approved', value: '1,838 of 1,840 (99.9%)', status: 'positive' },
      { label: 'Review Value Total', value: '$46,700 USD', status: 'warning' },
      { label: 'Audit Policy', value: 'Dual Sign-off Mandate', status: 'neutral' }
    ],
    breakdownData: [
      { category: 'PERNR 100098 (Severance)', value: '$34,500.00 Gross', variance: 'Executive Offboarding', detail: 'Requires HR Director & Finance approval' },
      { category: 'PERNR 100415 (Relocation Gross-up)', value: '$12,200.00 Tax Gross-up', variance: 'Expat Transfer', detail: 'Requires Expat Tax Specialist sign-off' }
    ],
    recommendedSapActions: [
      { actionName: 'Display Payroll Results', tcode: 'PC_PAYRESULT', description: 'Inspect detailed wage type breakdown and tax gross-up' },
      { actionName: 'Approve High-Value Payroll', tcode: 'Fiori F1505', description: 'Perform executive dual-authorization sign-off' }
    ]
  },
  {
    questionId: 'Q28',
    questionText: 'Show overtime cost by department.',
    category: 'Payroll',
    sapSourceTables: ['PY_RT', 'PA0001', 'CATSDB', 'ACDOCA', 'KABP'],
    summaryAnswer: 'Quarterly Overtime Expenditure by Department (Total Enterprise OT Cost: $184,200 USD): 1) Warehouse & Distribution ($82,400 - 44.7%), 2) Plant 1000 Manufacturing ($58,900 - 32.0%), 3) Plant Maintenance ($28,100 - 15.3%), 4) Customer Field Logistics ($14,800 - 8.0%).',
    keyInsights: [
      'Warehouse operations experienced 18% OT surge due to high e-commerce volume and new EWM transition.',
      'Manufacturing OT is 4% below budgeted quarterly allowance ($61,500 budget).',
      'All overtime posted to respective Cost Centers in FI/CO Universal Journal ACDOCA.'
    ],
    hrMetrics: [
      { label: 'Total Overtime Cost', value: '$184,200 USD', status: 'neutral' },
      { label: 'Top Cost Driver', value: 'Warehouse Ops ($82.4K)', status: 'warning' },
      { label: 'Budget Variance', value: '+3.2% Enterprise-wide', status: 'neutral' },
      { label: 'Total OT Hours', value: '4,120 Hours', status: 'neutral' }
    ],
    breakdownData: [
      { category: 'Warehouse & Distribution (CC 100-3100)', value: '$82,400 (1,840 hrs)', variance: '+18% vs Budget', detail: 'Outbound peak volumes' },
      { category: 'Plant 1000 Manufacturing (CC 100-4100)', value: '$58,900 (1,320 hrs)', variance: '-4% Under Budget', detail: 'Standard assembly shifts' },
      { category: 'Plant Maintenance (CC 100-4200)', value: '$28,100 (630 hrs)', variance: '+12% vs Budget', detail: 'Scheduled preventive overhauls' },
      { category: 'Customer Field Logistics (CC 100-3200)', value: '$14,800 (330 hrs)', variance: 'On Target', detail: 'On-site installation support' }
    ],
    recommendedSapActions: [
      { actionName: 'Cost Center Overtime Report', tcode: 'KSB1', description: 'Display live actual cost line items for wage type 1020 in CO' },
      { actionName: 'Payroll to FI/CO Reconciliation', tcode: 'PCP0', description: 'Review payroll posting documents in Universal Journal' }
    ]
  },
  {
    questionId: 'Q29',
    questionText: 'Compare this month\'s payroll with last month.',
    category: 'Payroll',
    sapSourceTables: ['PCL2', 'PY_RT', 'ACDOCA', 'I_PayrollResult'],
    summaryAnswer: 'Monthly Payroll Comparison (May 2026 vs April 2026): Total Gross Payroll: $12,450,200 USD (May) vs $12,180,500 USD (April), representing a +$269,700 (+2.21%) increase. Primary Drivers: 1) 18 New Joiners (+$118,500), 2) Annual Merit Salary Increases (+$94,200), 3) Overtime Surge in Logistics (+$57,000).',
    keyInsights: [
      'Total Headcount paid: 3,420 (May) vs 3,409 (April) - net +11 employees.',
      'Employer Tax & Benefit Contributions: $3,210,000 (May) vs $3,140,000 (April).',
      'Average gross pay per employee increased slightly from $3,573 to $3,640 (+1.87%).'
    ],
    hrMetrics: [
      { label: 'May Gross Payroll', value: '$12,450,200 USD', status: 'positive' },
      { label: 'April Gross Payroll', value: '$12,180,500 USD', status: 'positive' },
      { label: 'Net Monthly Variance', value: '+$269,700 (+2.2%)', status: 'positive' },
      { label: 'Headcount Growth', value: '+11 Net New HC', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Base Salaries (/101)', value: '$10,850,000 (+$185K)', variance: '+1.7%', detail: 'New Hires + Merit Increase' },
      { category: 'Overtime & Premiums (/102, /103)', value: '$485,000 (+$57K)', variance: '+13.3%', detail: 'Warehouse EWM peak' },
      { category: 'Bonuses & Spot Awards (/104)', value: '$325,000 (+$22K)', variance: '+7.2%', detail: 'Quarterly Project Milestones' },
      { category: 'Employer Taxes & FICA (/401..)', value: '$790,200 (+$5.7K)', variance: '+0.7%', detail: 'Statutory employer contributions' }
    ],
    recommendedSapActions: [
      { actionName: 'Period Payroll Comparison', tcode: 'PC00_M99_CWTR', description: 'Generate multi-period wage type comparison matrix' },
      { actionName: 'Financial Payroll Ledger', tcode: 'S_ALR_87013611', description: 'Review cost center financial posting summary' }
    ]
  },
  {
    questionId: 'Q30',
    questionText: 'Which payroll issues need immediate attention?',
    category: 'Payroll',
    sapSourceTables: ['PA03', 'PCL2', 'PA0009', 'PA0210', 'PCP0'],
    summaryAnswer: 'Payroll Immediate Attention Dashboard: 2 critical items require action before tomorrow\'s 5:00 PM payroll release: 1) PERNR 100589 lacks bank details (IT0009) - risk of failed ACH transmission, 2) 8 unsubmitted hourly timesheets for Plant 1000 representing $3,200 in pending pay. All other 3,412 records are validated and clear.',
    keyInsights: [
      'Payroll Control Record for US area is currently in "Released for Payroll" (PA03).',
      'Automated fallback for PERNR 100589 set to issue printed emergency payroll draft if bank details are not entered by 2:00 PM.',
      'Shift supervisors Mark Davis & Tim Reynolds alerted to approve remaining 8 timesheets.'
    ],
    hrMetrics: [
      { label: 'Immediate Action Items', value: '2 Issues', status: 'warning' },
      { label: 'Bank Detail Gap', value: '1 PERNR (100589)', status: 'negative' },
      { label: 'Unsubmitted Timesheets', value: '8 Records', status: 'warning' },
      { label: 'Release SLA Deadline', value: 'Tomorrow 5:00 PM', status: 'warning' }
    ],
    breakdownData: [
      { category: 'PERNR 100589 (No Direct Deposit)', value: 'Missing IT0009', variance: 'CRITICAL', detail: 'Contact employee / issue emergency check' },
      { category: 'Plant 1000 Timesheets', value: '8 Unentered Records', variance: 'HIGH', detail: 'Supervisors Mark Davis & Tim Reynolds alerted' }
    ],
    recommendedSapActions: [
      { actionName: 'Maintain Bank Details', tcode: 'PA30', description: 'Enter Infotype 0009 for PERNR 100589' },
      { actionName: 'Payroll Control Center', tcode: 'Fiori F1504', description: 'Monitor live issue resolution and execute pre-payroll checks' }
    ]
  },

  // ============================================================================
  // PILLAR 4: Organization & Position Management (Q31 - Q40)
  // ============================================================================
  {
    questionId: 'Q31',
    questionText: 'Show my organizational structure.',
    category: 'Organization & Position Management',
    sapSourceTables: ['HRP1000', 'HRP1001', 'PA0001', 'T527X', 'T528T'],
    summaryAnswer: 'Your Organizational Hierarchy in SAP S/4HANA: Chief Executive Officer (Position 50000001) -> Chief Information Officer (Pos 50001000) -> VP IT Solutions & Architecture (Pos 50008810 - David Vance) -> Lead S/4HANA Enterprise Architect (Pos 50012480 - Sarah Jenkins). Org Unit: 500012 ("Enterprise Architecture & Cloud Tech").',
    keyInsights: [
      'Org Unit 500012 sits within Parent Org Unit 500000 ("Global Technology Solutions").',
      'Reporting relationship: Direct A002 link to Chief Position 50008810.',
      'All structural relationships fully synchronized between SAP OM and SuccessFactors Employee Central.'
    ],
    hrMetrics: [
      { label: 'Reporting Level', value: 'Level 4 (Director Direct)', status: 'positive' },
      { label: 'Org Unit ID', value: '500012', status: 'positive' },
      { label: 'Parent Org Unit', value: '500000 (Global Tech)', status: 'positive' },
      { label: 'Hierarchy Status', value: '100% Synchronized', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Level 1: Executive', value: 'CEO Office (Pos 50000001)', variance: 'Enterprise Level', detail: 'Chief Executive' },
      { category: 'Level 2: Business Unit', value: 'Global Technology (Pos 50001000)', variance: 'CIO Org', detail: 'Executive Committee' },
      { category: 'Level 3: Department', value: 'Enterprise IT Solutions (Pos 50008810)', variance: 'VP David Vance', detail: 'Org Unit 500010' },
      { category: 'Level 4: Team / Position', value: 'Cloud Architecture (Pos 50012480)', variance: 'Sarah Jenkins', detail: 'Org Unit 500012' }
    ],
    recommendedSapActions: [
      { actionName: 'Display Structural Graphics', tcode: 'PPOM_OLD', description: 'Launch visual org chart tree in SAP GUI' },
      { actionName: 'SuccessFactors Org Chart', tcode: 'Fiori F2059', description: 'Open interactive web organization navigator' }
    ]
  },
  {
    questionId: 'Q32',
    questionText: 'Which positions are currently vacant?',
    category: 'Organization & Position Management',
    sapSourceTables: ['HRP1001', 'HRP1007', 'HRP1000', 'T528T'],
    summaryAnswer: 'Enterprise Vacancy Audit: 24 positions are currently vacant (Relationship B008 "Holder" is unassigned or vacant in Infotype 1007) across all business units. 18 positions have active requisitions posted in SuccessFactors Recruiting, 6 are in budgetary review.',
    keyInsights: [
      'Top vacancy areas: Global Technology (11 positions), Supply Chain & Plant 1000 (8 positions), Sales (5 positions).',
      'Average vacancy duration across enterprise: 34 days.',
      '3 critical vacancies flagged for executive leadership escalation.'
    ],
    hrMetrics: [
      { label: 'Total Vacant Positions', value: '24 Positions', status: 'warning' },
      { label: 'Active Job Requisitions', value: '18 Active in SF', status: 'positive' },
      { label: 'In Budgetary Review', value: '6 Positions', status: 'neutral' },
      { label: 'Vacancy Rate', value: '3.4% of Total Org', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Global Technology (500010)', value: '11 Vacancies', variance: 'High Priority', detail: 'Cloud Architects, DevOps, ABAP' },
      { category: 'Supply Chain & Manufacturing (500020)', value: '8 Vacancies', variance: 'Operational', detail: 'Shift Supervisors, EWM Techs' },
      { category: 'Sales & Marketing (500040)', value: '5 Vacancies', variance: 'Commercial', detail: 'Enterprise Account Executives' }
    ],
    recommendedSapActions: [
      { actionName: 'Display Vacant Positions', tcode: 'PO13', description: 'Inspect Infotype 1007 (Vacancy) records in OM' },
      { actionName: 'Vacant Positions Report', tcode: 'S_AHR_61016493', description: 'Execute standard SAP OM vacancy list by organizational unit' }
    ]
  },
  {
    questionId: 'Q33',
    questionText: 'Show open positions by department.',
    category: 'Organization & Position Management',
    sapSourceTables: ['HRP1000', 'HRP1001', 'HRP1007', 'HRP1008'],
    summaryAnswer: 'Open Position Distribution by Department: 1) Cloud Architecture & BTP (5 open - Pos 50012210..14), 2) Cyber Security & GRC (3 open - Pos 50013100..02), 3) Plant 1000 Assembly (5 open), 4) EWM Warehouse Logistics (3 open), 5) Enterprise Sales (5 open), 6) Financial Accounting (3 open).',
    keyInsights: [
      'Total annual budgeted compensation for all 24 open positions: $2,840,000 USD.',
      'All open positions have assigned Cost Centers in Infotype 1008 for budget allocation.',
      'Recruiting SLA target: 35 days time-to-hire.'
    ],
    hrMetrics: [
      { label: 'Open Positions', value: '24 Positions', status: 'warning' },
      { label: 'Departments Hiring', value: '6 Departments', status: 'neutral' },
      { label: 'Total Budgeted Base', value: '$2.84M USD', status: 'neutral' },
      { label: 'Pipeline Candidates', value: '142 Applicants', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Cloud Architecture & BTP (500012)', value: '5 Open Positions ($780K)', variance: 'Active Sourcing', detail: '3 Lead Architects, 2 DevOps' },
      { category: 'Plant 1000 Manufacturing (500020)', value: '5 Open Positions ($380K)', variance: 'Interviews Active', detail: 'Assembly Technicians' },
      { category: 'Enterprise Sales (500040)', value: '5 Open Positions ($650K)', variance: 'Final Round', detail: 'Strategic Account Execs' },
      { category: 'Cyber Security & GRC (500016)', value: '3 Open Positions ($480K)', variance: 'Screening', detail: 'GRC Specialists & SecOps' }
    ],
    recommendedSapActions: [
      { actionName: 'Organizational Staffing Status', tcode: 'PPOM_OLD', description: 'Review staffing and vacancy markers across departments' },
      { actionName: 'Recruiting Workbench', tcode: 'Fiori F2401', description: 'Review applicant pipeline in SuccessFactors Recruiting' }
    ]
  },
  {
    questionId: 'Q34',
    questionText: 'Which positions have been vacant the longest?',
    category: 'Organization & Position Management',
    sapSourceTables: ['HRP1007', 'HRP1000', 'CDHDR', 'CDPOS'],
    summaryAnswer: 'Long-Standing Vacancy Audit: Top 3 longest-standing vacant positions: 1) Position 50013101: "Principal SAP Cyber Security Architect" (Vacant 88 days), 2) Position 50012212: "Lead BTP AI Foundation Specialist" (Vacant 74 days), 3) Position 50014020: "High-Voltage Battery Thermal Engineer" (Vacant 65 days).',
    keyInsights: [
      'Niche specialized skillset in SAP Security and BTP AI contributing to extended candidate search.',
      'Action taken: Retained executive search firm engaged for Cyber Security position.',
      'Compensation band adjustment (+12%) submitted for BTP AI role to attract top market talent.'
    ],
    hrMetrics: [
      { label: 'Longest Vacancy', value: '88 Days (Sec Architect)', status: 'negative' },
      { label: 'Positions >60 Days', value: '3 Positions', status: 'warning' },
      { label: 'Average Org Vacancy', value: '34 Days', status: 'positive' },
      { label: 'External Agency Retained', value: '2 Searches Active', status: 'neutral' }
    ],
    breakdownData: [
      { category: 'Pos 50013101 (Cyber Security Arch)', value: 'Vacant 88 Days (Grade L7)', variance: 'Critical Gap', detail: 'Agency: Korn Ferry engaged' },
      { category: 'Pos 50012212 (BTP AI Foundation Lead)', value: 'Vacant 74 Days (Grade L6)', variance: 'Tech Band Adj', detail: '+12% comp adjustment approved' },
      { category: 'Pos 50014020 (Thermal Engineer)', value: 'Vacant 65 Days (Grade L6)', variance: 'Austin Plant', detail: 'Final round panel this week' }
    ],
    recommendedSapActions: [
      { actionName: 'Vacancy Duration Report', tcode: 'S_AHR_61016493', description: 'Sort vacant positions by Infotype 1007 start date' },
      { actionName: 'Position Compensation Adjustment', tcode: 'PO13', description: 'Review and adjust planned compensation in Infotype 1005' }
    ]
  },
  {
    questionId: 'Q35',
    questionText: 'Who reports to Manager ABC?',
    category: 'Organization & Position Management',
    sapSourceTables: ['HRP1001', 'PA0001', 'PA0002', 'I_PersonWorkAgreement'],
    summaryAnswer: 'Direct & Indirect Reports for David Vance (PERNR 100108 - VP IT Solutions & Architecture, Position 50008810): Direct Reports: 9 senior professionals. Total Span (including indirect sub-teams): 28 employees across Cloud Platforms, Integration, and Data Engineering.',
    keyInsights: [
      '9 direct reports: Sarah Jenkins (Lead Architect), Marcus Brody (Sr Cloud Eng), Priya Sharma (Principal ABAP), Devon Patel (Migration Lead), and 5 additional senior leads.',
      'All 9 direct reports have active performance goals and quarterly check-ins logged in SuccessFactors.',
      'Average direct report tenure under David Vance: 4.1 years.'
    ],
    hrMetrics: [
      { label: 'Direct Reports', value: '9 Employees', status: 'positive' },
      { label: 'Total Extended Team', value: '28 Employees', status: 'positive' },
      { label: 'Manager Designation', value: 'VP IT Solutions', status: 'positive' },
      { label: 'Span Rating', value: 'Optimal (8-10 Band)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Sarah Jenkins (100452)', value: 'Lead S/4 Enterprise Architect', variance: 'Direct Report', detail: 'Dallas HQ' },
      { category: 'Marcus Brody (100458)', value: 'Sr Cloud Integration Engineer', variance: 'Direct Report', detail: 'Dallas HQ' },
      { category: 'Priya Sharma (100462)', value: 'Principal ABAP Developer', variance: 'Direct Report', detail: 'Chicago Hub' },
      { category: 'Devon Patel (100411)', value: 'S/4 Migration Consultant', variance: 'Direct Report', detail: 'Dallas HQ' },
      { category: '5 Additional Technical Leads', value: 'DevOps, Security, CPI, BTP', variance: 'Direct Reports', detail: 'US & Global' }
    ],
    recommendedSapActions: [
      { actionName: 'Display Manager Reporting Line', tcode: 'PPOME', description: 'Inspect reporting relationships for Chief Position 50008810' },
      { actionName: 'Manager Roster Workbench', tcode: 'Fiori F1500', description: 'Open Manager Self-Service (MSS) team view' }
    ]
  },
  {
    questionId: 'Q36',
    questionText: 'Show span of control by manager.',
    category: 'Organization & Position Management',
    sapSourceTables: ['HRP1001', 'PA0001', 'HRP1000'],
    summaryAnswer: 'Enterprise Span of Control Benchmark: Average span of control across all enterprise managers is 7.2 direct reports. Outliers: Highest span: Director of Plant Manufacturing (15 direct reports - recommendation: introduce team leader tier); Lowest span: Director of IT Governance (3 direct reports).',
    keyInsights: [
      'Target enterprise organizational band: 6 to 9 direct reports per people manager.',
      '82% of all company managers fall within target span of control guidelines.',
      '3 manufacturing supervisor positions flagged for organizational restructuring to reduce overload.'
    ],
    hrMetrics: [
      { label: 'Enterprise Avg Span', value: '7.2 Direct Reports', status: 'positive' },
      { label: 'Target Guideline', value: '6 - 9 Reports', status: 'positive' },
      { label: 'Within Target Band', value: '82% of Managers', status: 'positive' },
      { label: 'High Span Outliers (>12)', value: '3 Managers', status: 'warning' }
    ],
    breakdownData: [
      { category: 'Manufacturing & Plants', value: 'Avg 11.4 Reports', variance: 'High Span', detail: '3 Supervisors have >14 reports' },
      { category: 'Global Technology & IT', value: 'Avg 7.8 Reports', variance: 'Optimal Band', detail: 'Target 6-9 achieved' },
      { category: 'Finance & Controlling', value: 'Avg 6.2 Reports', variance: 'Optimal Band', detail: 'Target 6-9 achieved' },
      { category: 'Legal & Governance', value: 'Avg 4.1 Reports', variance: 'Low Span', detail: 'Specialized functional teams' }
    ],
    recommendedSapActions: [
      { actionName: 'Span of Control Analytics', tcode: 'S_AHR_61016491', description: 'Run OM organizational structure evaluation by manager' },
      { actionName: 'Org Structure Redesign', tcode: 'PPOME', description: 'Model new supervisor hierarchy to optimize span of control' }
    ]
  },
  {
    questionId: 'Q37',
    questionText: 'Which positions are overstaffed or understaffed?',
    category: 'Organization & Position Management',
    sapSourceTables: ['HRP1001', 'HRP1007', 'HRP1000', 'PA0001'],
    summaryAnswer: 'Staffing Capacity Audit: 1 position is currently overstaffed with dual incumbents (Position 50008812 - Plant Director: 2 employees assigned during planned retirement handover). 6 departments are understaffed relative to authorized target headcount (Plant 1000 Assembly: -5 HC, Cloud Tech: -5 HC, Sales: -5 HC).',
    keyInsights: [
      'Dual incumbent on Pos 50008812 is intentional (knowledge transfer until June 30).',
      'Understaffing in Plant 1000 Assembly is currently offset by approved overtime ($14.8K/mo).',
      'All position staffing percentages maintained accurately in Infotype 1001.'
    ],
    hrMetrics: [
      { label: 'Overstaffed Positions', value: '1 Position (Dual Incumbent)', status: 'neutral' },
      { label: 'Understaffed Org Units', value: '6 Departments', status: 'warning' },
      { label: 'Authorized Headcount', value: '3,444 Positions', status: 'positive' },
      { label: 'Actual Headcount', value: '3,420 Employees (99.3%)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Pos 50008812 (Plant Director)', value: '2 Incumbents (200% Staffing)', variance: 'Planned Handover', detail: 'PERNR 100015 & PERNR 100450' },
      { category: 'Plant 1000 Assembly (500020)', value: '-5 Headcount Understaffed', variance: 'Recruiting Active', detail: '5 offers extended' },
      { category: 'Cloud Architecture (500012)', value: '-5 Headcount Understaffed', variance: 'Sourcing Active', detail: 'Target fill: 30 days' }
    ],
    recommendedSapActions: [
      { actionName: 'Staffing Status by Position', tcode: 'PP01', description: 'Review Infotype 1001 relationship percentages' },
      { actionName: 'Position Budget vs Actual', tcode: 'Fiori F2891', description: 'Inspect headcount capacity utilization dashboard' }
    ]
  },
  {
    questionId: 'Q38',
    questionText: 'Show upcoming retirements.',
    category: 'Organization & Position Management',
    sapSourceTables: ['PA0002', 'PA0001', 'PA0000', 'I_Employee'],
    summaryAnswer: 'Workforce Demographics & Retirement Projection: 14 employees in key operational and leadership roles are eligible for retirement within the next 12 months (age >= 62 with >= 15 years service). 4 employees have submitted formal planned retirement notices.',
    keyInsights: [
      'High-impact upcoming retirement: Robert Chen (PERNR 100015 - Plant Operations Director, retiring August 31, 2026).',
      'Knowledge transfer programs and succession plans active for 11 of 14 eligible employees.',
      '3 technical specialist roles (Plant Boiler Tech, Tool & Die Master) lack identified internal successors.'
    ],
    hrMetrics: [
      { label: 'Eligible in 12 Months', value: '14 Employees', status: 'warning' },
      { label: 'Formal Notices Logged', value: '4 Employees', status: 'neutral' },
      { label: 'Succession Coverage', value: '11 of 14 (78.6%)', status: 'positive' },
      { label: 'At-Risk Roles', value: '3 Technical Roles', status: 'negative' }
    ],
    breakdownData: [
      { category: 'Robert Chen (100015)', value: 'Plant Operations Director', variance: 'Retiring Aug 2026', detail: 'Successor PERNR 100450 onboarding' },
      { category: 'Harold Vance (100022)', value: 'Master Tool & Die Maker', variance: 'Retiring Dec 2026', detail: 'Apprenticeship mentor required' },
      { category: 'Grace Miller (100035)', value: 'Lead Payroll Accountant', variance: 'Retiring Nov 2026', detail: 'Successor identified in team' },
      { category: '11 Other Employees', value: 'Manufacturing, Maintenance, Ops', variance: 'Eligible 2026-2027', detail: 'HRBP check-in scheduled' }
    ],
    recommendedSapActions: [
      { actionName: 'Retirement Forecast Report', tcode: 'S_PH9_46000222', description: 'Run standard SAP demographic and retirement eligibility report' },
      { actionName: 'Succession Planning Portal', tcode: 'Fiori F2510', description: 'Review succession workbench for retirement risk roles' }
    ]
  },
  {
    questionId: 'Q39',
    questionText: 'Which critical roles have no successor?',
    category: 'Organization & Position Management',
    sapSourceTables: ['HRP1000', 'HRP1001', 'T528T', 'SF_SUCCESSION'],
    summaryAnswer: 'Succession Risk Audit: 4 critical enterprise leadership and specialized technical roles currently have ZERO identified ready-now or ready-in-1-year successors in SuccessFactors Succession Planning: 1) VP Cyber Security & GRC, 2) Chief Battery Architect (Austin), 3) Lead SAP BTP AI Specialist, 4) Master Tool & Die Specialist.',
    keyInsights: [
      'Succession coverage benchmark: 88% of enterprise key positions have designated successors (Target: 90%).',
      'Talent review sessions scheduled for next month to identify high-potential internal candidates (HiPos).',
      'Emergency interim coverage plans documented for all 4 critical roles.'
    ],
    hrMetrics: [
      { label: 'Key Roles Uncovered', value: '4 Positions', status: 'negative' },
      { label: 'Total Key Positions', value: '36 Key Roles', status: 'positive' },
      { label: 'Succession Coverage', value: '88.9%', status: 'warning' },
      { label: 'Emergency Coverage Plan', value: '100% Documented', status: 'positive' }
    ],
    breakdownData: [
      { category: 'VP Cyber Security (Pos 50009100)', value: 'Zero Successors', variance: 'CRITICAL', detail: 'External pipeline development in progress' },
      { category: 'Chief Battery Architect (Pos 50014001)', value: 'Zero Successors', variance: 'CRITICAL', detail: 'Austin Plant expansion key role' },
      { category: 'Lead BTP AI Specialist (Pos 50012212)', value: 'Zero Successors', variance: 'HIGH', detail: 'Emerging technology skill gap' },
      { category: 'Master Tool & Die (Pos 50007820)', value: 'Zero Successors', variance: 'HIGH', detail: 'Retirement eligible in 6 months' }
    ],
    recommendedSapActions: [
      { actionName: 'Succession Org Chart', tcode: 'Fiori F2510', description: 'Open SuccessFactors Succession Org Chart and talent cards' },
      { actionName: 'Talent Pool Maintenance', tcode: 'PO13', description: 'Maintain critical role flags in Infotype 1000/1001' }
    ]
  },
  {
    questionId: 'Q40',
    questionText: 'Show workforce headcount by business unit.',
    category: 'Organization & Position Management',
    sapSourceTables: ['PA0001', 'HRP1000', 'HRP1008', 'I_WorkforcePerson'],
    summaryAnswer: 'Headcount Distribution by Business Unit (Total: 3,420 FTEs): 1) Global Supply Chain & Manufacturing: 1,450 FTE (42.4%), 2) Global Technology Solutions: 1,060 FTE (31.0%), 3) Global Commercial & Sales: 610 FTE (17.8%), 4) Corporate Finance, Legal & G&A: 300 FTE (8.8%).',
    keyInsights: [
      'Year-over-year headcount growth: +4.8% enterprise-wide (+156 net new FTEs).',
      'Fastest growing business unit: Global Technology Solutions (+12.4% YoY).',
      'Contractor-to-FTE ratio is 8.5% (well within target threshold of 10%).'
    ],
    hrMetrics: [
      { label: 'Total Enterprise FTE', value: '3,420 FTE', status: 'positive' },
      { label: 'YoY Growth Rate', value: '+4.8%', status: 'positive' },
      { label: 'Contractor Ratio', value: '8.5% (290 Contingent)', status: 'positive' },
      { label: 'FTE Budget Compliance', value: '99.3%', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Supply Chain & Manufacturing (BU 10)', value: '1,450 FTE (42.4%)', variance: '+2.1% YoY', detail: 'Plants 1000, 2000, 3000' },
      { category: 'Global Technology (BU 20)', value: '1,060 FTE (31.0%)', variance: '+12.4% YoY', detail: 'Cloud, Software, Architecture' },
      { category: 'Commercial & Sales (BU 30)', value: '610 FTE (17.8%)', variance: '+3.5% YoY', detail: 'Americas, EMEA, APAC' },
      { category: 'Finance, HR & G&A (BU 40)', value: '300 FTE (8.8%)', variance: '+1.0% YoY', detail: 'Corporate Headquarters' }
    ],
    recommendedSapActions: [
      { actionName: 'Workforce Headcount Summary', tcode: 'S_PH0_48000510', description: 'Run standard SAP headcount summary report by business unit' },
      { actionName: 'Executive HR Dashboard', tcode: 'Fiori F2890', description: 'View real-time headcount and demographic visualizer' }
    ]
  },

  // ============================================================================
  // PILLAR 5: Talent, Performance & Workforce Analytics (Q41 - Q50)
  // ============================================================================
  {
    questionId: 'Q41',
    questionText: 'Show employees with pending performance reviews.',
    category: 'Talent, Performance & Workforce Analytics',
    sapSourceTables: ['HRP1001', 'PA0001', 'SF_PMGM', 'I_PersonWorkAgreement'],
    summaryAnswer: 'Performance Review Cycle (Mid-Year 2026): 14 performance appraisal forms are currently pending manager evaluation in SuccessFactors PMGM across Global Technology. 92% of mid-year reviews across the company are completed (Target: 95% by Friday cutoff).',
    keyInsights: [
      'Self-evaluations: 100% submitted by employees.',
      '14 pending reviews are distributed across 4 managers (David Vance: 2, Brenda Clark: 5, Mark Davis: 4, Elena Rostova: 3).',
      'Automated email reminders sent to all 4 managers.'
    ],
    hrMetrics: [
      { label: 'Pending Reviews', value: '14 Forms', status: 'warning' },
      { label: 'Completed Reviews', value: '162 of 176 (92%)', status: 'positive' },
      { label: 'Cycle Deadline', value: 'Friday 5:00 PM', status: 'warning' },
      { label: 'Self-Reviews In', value: '100% Submitted', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Brenda Clark (Supervisor 100085)', value: '5 Reviews Pending', variance: 'Plant 2000', detail: 'Maintenance Engineers' },
      { category: 'Mark Davis (Supervisor 100080)', value: '4 Reviews Pending', variance: 'Plant 1000', detail: 'Manufacturing Leads' },
      { category: 'Elena Rostova (Lead 100204)', value: '3 Reviews Pending', variance: 'Supply Chain', detail: 'Logistics Analysts' },
      { category: 'David Vance (VP 100108)', value: '2 Reviews Pending', variance: 'Tech Architecture', detail: 'Senior Architects' }
    ],
    recommendedSapActions: [
      { actionName: 'Performance Review Dashboard', tcode: 'Fiori F2200', description: 'Open SuccessFactors Performance & Goals administration console' },
      { actionName: 'Send Manager Reminder', tcode: 'Fiori F2205', description: 'Trigger automated notification to pending evaluators' }
    ]
  },
  {
    questionId: 'Q42',
    questionText: 'Which employees have completed mandatory training?',
    category: 'Talent, Performance & Workforce Analytics',
    sapSourceTables: ['HRP1001', 'PA0024', 'SF_LMS', 'I_Employee'],
    summaryAnswer: 'Annual Mandatory Compliance Training Audit (Cybersecurity, Code of Conduct, Workplace Safety): 3,318 out of 3,420 employees (97.0%) have completed 100% of required 2026 compliance modules. 102 employees have 1 or more modules in progress prior to the Q2 deadline.',
    keyInsights: [
      'Cybersecurity Awareness Module: 98.4% completed.',
      'Code of Conduct & Ethics: 99.1% completed.',
      'OSHA Plant Safety (Manufacturing only): 95.2% completed.',
      'Zero regulatory compliance breaches.'
    ],
    hrMetrics: [
      { label: 'Enterprise Completion', value: '97.0% (3,318 FTE)', status: 'positive' },
      { label: 'In Progress', value: '102 Employees', status: 'warning' },
      { label: 'Overdue Modules', value: '14 Employees', status: 'negative' },
      { label: 'Audit Compliance', value: '100% Audit Ready', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Global Technology (500010)', value: '99.2% Completed', variance: 'Top Department', detail: '1,051 of 1,060 FTE' },
      { category: 'Corporate G&A (500030)', value: '98.8% Completed', variance: 'High Compliance', detail: '296 of 300 FTE' },
      { category: 'Commercial & Sales (500040)', value: '96.5% Completed', variance: 'Moderate', detail: '588 of 610 FTE' },
      { category: 'Supply Chain & Plants (500020)', value: '95.4% Completed', variance: 'Shift Impact', detail: '1,383 of 1,450 FTE' }
    ],
    recommendedSapActions: [
      { actionName: 'LMS Compliance Report', tcode: 'Fiori F2300', description: 'Launch SuccessFactors Learning Management System compliance audit' },
      { actionName: 'Qualifications Display', tcode: 'PA20', description: 'Review employee training records in Infotype 0024 (Qualifications)' }
    ]
  },
  {
    questionId: 'Q43',
    questionText: 'Which employees have expiring certifications?',
    category: 'Talent, Performance & Workforce Analytics',
    sapSourceTables: ['PA0024', 'HRP1001', 'SF_LMS', 'I_Employee'],
    summaryAnswer: 'Expiring Certification Watchlist: 9 employees have critical technical or safety certifications expiring within the next 45 days (4 AWS/SAP Cloud Architecture certifications, 3 Forklift/Hazardous Material handling licenses in EWM, 2 High-Voltage Safety credentials in Austin Plant).',
    keyInsights: [
      'All 9 employees have re-certification exam vouchers funded and scheduled.',
      'EWM Forklift recertification practical testing scheduled this Thursday at Plant 1000.',
      'Zero expired certifications currently active on factory floor.'
    ],
    hrMetrics: [
      { label: 'Expiring Certifications', value: '9 Employees (<45d)', status: 'warning' },
      { label: 'Safety / Plant Licenses', value: '5 Certifications', status: 'warning' },
      { label: 'Cloud / Tech Certs', value: '4 Certifications', status: 'neutral' },
      { label: 'Re-testing Scheduled', value: '100% Scheduled', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Jake Sterling (100188)', value: 'EWM Heavy Forklift License', variance: 'Expires in 18 Days', detail: 'Exam: May 28 (Plant 1000)' },
      { category: 'Robert Briggs (100192)', value: 'HazMat Level 2 Handling', variance: 'Expires in 22 Days', detail: 'Training: May 30' },
      { category: 'Marcus Brody (100458)', value: 'SAP Certified BTP Integration', variance: 'Expires in 34 Days', detail: 'Exam: June 12' },
      { category: 'Sarah Jenkins (100452)', value: 'TOGAF Enterprise Architect', variance: 'Expires in 42 Days', detail: 'Renewal: June 20' }
    ],
    recommendedSapActions: [
      { actionName: 'Display Qualifications', tcode: 'PP01', description: 'Inspect Infotype 0024 validity dates' },
      { actionName: 'LMS Certification Tracker', tcode: 'Fiori F2301', description: 'Monitor enterprise technical certification renewals' }
    ]
  },
  {
    questionId: 'Q44',
    questionText: 'Show promotion candidates based on approved criteria.',
    category: 'Talent, Performance & Workforce Analytics',
    sapSourceTables: ['PA0008', 'PA0024', 'SF_PMGM', 'SF_TALENT'],
    summaryAnswer: 'Promotion Calibration Pipeline (Q3 Cycle): 12 high-performing candidates meet 100% of approved promotion criteria (>= 2 consecutive years "Exceeds Expectations" ratings, completed advanced leadership/technical tracks, within top quartile of current salary band).',
    keyInsights: [
      'Candidates distributed across Engineering (5), Supply Chain (4), and Sales (3).',
      'Total annualized compensation impact: $182,000 USD (within approved Q3 merit budget of $250,000).',
      'Calibration committee review scheduled for next Tuesday.'
    ],
    hrMetrics: [
      { label: 'Qualified Candidates', value: '12 Employees', status: 'positive' },
      { label: 'Average Tenure in Role', value: '2.8 Years', status: 'positive' },
      { label: 'Budget Required', value: '$182,000 USD', status: 'positive' },
      { label: 'Approved Budget', value: '$250,000 USD (72.8% used)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Priya Sharma (100462)', value: 'Senior -> Principal ABAP RAP Specialist', variance: 'Grade L5 -> L6 (+$16K)', detail: 'Top rating 2 yrs' },
      { category: 'Carlos Mendez (100319)', value: 'EWM Specialist -> Shift Ops Manager', variance: 'Grade L4 -> L5 (+$14K)', detail: 'Austin Plant expansion' },
      { category: 'Jessica Wang (100481)', value: 'Integration Specialist -> Lead Architect', variance: 'Grade L5 -> L6 (+$18K)', detail: 'CPI Cloud Innovation' },
      { category: '9 Additional High-Performers', value: 'Manufacturing, Sales, Finance', variance: 'Avg +$14.8K increment', detail: '100% criteria met' }
    ],
    recommendedSapActions: [
      { actionName: 'Talent Calibration Tool', tcode: 'Fiori F2500', description: 'Open SuccessFactors 9-Box talent matrix and calibration tool' },
      { actionName: 'Compensation Planning', tcode: 'Fiori F2600', description: 'Model promotion wage type increases in Compensation Workbench' }
    ]
  },
  {
    questionId: 'Q45',
    questionText: 'Which departments have the highest turnover?',
    category: 'Talent, Performance & Workforce Analytics',
    sapSourceTables: ['PA0000', 'T529T', 'I_Employee', 'SF_ANALYTICS'],
    summaryAnswer: 'Annualized Voluntary Turnover Analysis: Enterprise-wide voluntary turnover rate is 5.2% (Industry Benchmark: 7.8%). Departments with highest turnover: 1) Enterprise Inside Sales (8.4%), 2) Plant 1000 Assembly Night Shift (7.1%), 3) DevOps & Cloud Infrastructure (6.8%). Lowest turnover: IT Architecture (1.1%) and Finance (1.8%).',
    keyInsights: [
      'Sales turnover driven by high market demand for enterprise SaaS account reps (exit surveys indicate competitive base pay).',
      'Assembly Night Shift turnover addressed via new $3.50/hr shift differential incentive introduced last month.',
      'Average tenure of departing employees: 2.1 years.'
    ],
    hrMetrics: [
      { label: 'Enterprise Voluntary Rate', value: '5.2%', status: 'positive' },
      { label: 'Industry Benchmark', value: '7.8%', status: 'positive' },
      { label: 'Highest Org Turnover', value: 'Inside Sales (8.4%)', status: 'warning' },
      { label: 'Lowest Org Turnover', value: 'IT Architecture (1.1%)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Enterprise Inside Sales (500042)', value: '8.4% Turnover', variance: '+3.2% vs Enterprise', detail: 'Market compensation competition' },
      { category: 'Plant 1000 Night Shift (500022)', value: '7.1% Turnover', variance: '+1.9% vs Enterprise', detail: 'Shift premium implemented' },
      { category: 'DevOps & Cloud (500014)', value: '6.8% Turnover', variance: '+1.6% vs Enterprise', detail: 'High tech market demand' },
      { category: 'Finance & Controlling (500030)', value: '1.8% Turnover', variance: '-3.4% vs Enterprise', detail: 'High retention & stability' }
    ],
    recommendedSapActions: [
      { actionName: 'Termination Analytics Report', tcode: 'S_PH9_46000223', description: 'Run Action 03 (Termination/Exit) summary by Reason for Action' },
      { actionName: 'Workforce Retention Insights', tcode: 'Fiori F2892', description: 'Review attrition drivers in SAC HR Analytics' }
    ]
  },
  {
    questionId: 'Q46',
    questionText: 'Predict workforce attrition risk.',
    category: 'Talent, Performance & Workforce Analytics',
    sapSourceTables: ['PA0008', 'PA0001', 'PA2006', 'SF_TALENT', 'SF_PMGM'],
    summaryAnswer: 'AI Predictive Attrition Model (Trained on SAP HCM historical data & SuccessFactors signals): 18 key employees flagged with High Attrition Flight Risk (>70% probability). Key Predictors: Below-market comp ratio (<0.88), >3 years in role without promotion, high unutilized PTO (>18 days), and recent manager turnover.',
    keyInsights: [
      'Top Flight Risk Cluster: 7 Senior Cloud & ABAP Engineers in high-demand technical specializations.',
      'Proactive Retention Program: HRBP retention interviews and off-cycle equity/compensation adjustments submitted for top 6 critical talent.',
      'Estimated replacement cost saved if retained: $1,420,000 USD.'
    ],
    hrMetrics: [
      { label: 'High Flight Risk', value: '18 Employees (0.5%)', status: 'warning' },
      { label: 'Average Comp Ratio', value: '0.86 (Under market)', status: 'warning' },
      { label: 'Retention Actions In Flight', value: '6 Comp Adjustments', status: 'positive' },
      { label: 'Est. Replacement Cost', value: '$1.42M USD at risk', status: 'negative' }
    ],
    breakdownData: [
      { category: 'Senior Cloud & ABAP Cluster', value: '7 Engineers (82% Risk)', variance: 'Comp Ratio 0.84', detail: 'Adjustment proposed: +14%' },
      { category: 'EWM Shift Operations Leads', value: '4 Supervisors (75% Risk)', variance: 'Comp Ratio 0.88', detail: 'Overtime fatigue driver' },
      { category: 'Inside Sales Account Execs', value: '4 Sales Reps (72% Risk)', variance: 'Quota Attainment', detail: 'Commission structure review' },
      { category: 'Plant Maintenance Engineers', value: '3 Techs (70% Risk)', variance: 'Market Demand', detail: 'Skill retention grant' }
    ],
    recommendedSapActions: [
      { actionName: 'Predictive Attrition Workbench', tcode: 'Fiori F2893', description: 'Launch SAC Predictive Talent Attrition dashboard' },
      { actionName: 'Initiate Retention Action', tcode: 'PA30', description: 'Create Infotype 0008 compensation adjustment or Infotype 0015 retention bonus' }
    ]
  },
  {
    questionId: 'Q47',
    questionText: 'Show hiring progress for open positions.',
    category: 'Talent, Performance & Workforce Analytics',
    sapSourceTables: ['HRP1007', 'SF_RCM', 'SF_ONB'],
    summaryAnswer: 'Recruiting Pipeline Progress: 18 active job requisitions across 24 open positions: 142 candidates in screening, 28 in technical panel interviews, 6 in final executive interview, 4 offers extended (2 accepted, 2 pending). Average time-in-pipeline: 22 days.',
    keyInsights: [
      '2 Accepted Offers: Senior S/4 RAP Developer (Starts June 15) and EWM Lead Logistics Analyst (Starts June 1).',
      '2 Pending Offers: Principal Cloud Architect ($165K offer) and Battery Plant Supervisor ($92K offer).',
      'Offer acceptance rate: 91.3% YTD.'
    ],
    hrMetrics: [
      { label: 'Active Requisitions', value: '18 Open Reqs', status: 'positive' },
      { label: 'Total Applicants', value: '142 Candidates', status: 'positive' },
      { label: 'Offers Extended', value: '4 Offers (2 Accepted)', status: 'positive' },
      { label: 'Offer Acceptance Rate', value: '91.3%', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Sourcing & Resume Screen', value: '142 Candidates', variance: 'Top of Funnel', detail: 'AI screening matched 68' },
      { category: 'Hiring Manager & Tech Panel', value: '28 Candidates', variance: 'Mid Funnel', detail: 'Technical assessments' },
      { category: 'Final Executive Interview', value: '6 Candidates', variance: 'Final Stage', detail: 'Culture & Leadership fit' },
      { category: 'Offers Extended / Accepted', value: '4 Offers (2 Signed)', variance: 'Closing Stage', detail: '2 starting in June' }
    ],
    recommendedSapActions: [
      { actionName: 'Recruiting Pipeline Dashboard', tcode: 'Fiori F2400', description: 'Open SuccessFactors Recruiting candidate funnel' },
      { actionName: 'Onboarding Launchpad', tcode: 'Fiori F2350', description: 'Monitor Day-1 task completion for signed candidates' }
    ]
  },
  {
    questionId: 'Q48',
    questionText: 'Which skills are missing in our workforce?',
    category: 'Talent, Performance & Workforce Analytics',
    sapSourceTables: ['PA0024', 'HRP1001', 'SF_LMS', 'SF_TALENT'],
    summaryAnswer: 'Strategic Skill Gap Analysis: 4 critical skill shortages identified relative to 2026-2027 enterprise roadmap: 1) ABAP RESTful Application Programming (RAP) & Clean Core architecture (-38% gap), 2) SAP BTP AI Foundation & GenAI SDK (-55% gap), 3) EWM Robotics & Automated Guided Vehicle (AGV) integration (-42% gap), 4) S/4HANA Sustainability & Carbon Accounting (-60% gap).',
    keyInsights: [
      'Upskilling initiative launched: 45 internal ABAP developers enrolled in S/4 Clean Core & RAP certification.',
      'BTP AI bootcamp subsidized for 20 cloud engineers.',
      'External strategic hiring targeting remaining specialized gaps.'
    ],
    hrMetrics: [
      { label: 'Critical Skill Gaps', value: '4 Domains', status: 'warning' },
      { label: 'Largest Shortage', value: 'Sustainability Accounting (-60%)', status: 'negative' },
      { label: 'Internal Upskilling', value: '65 FTEs Enrolled', status: 'positive' },
      { label: 'Roadmap Readiness', value: '74.5% (Target: 85%)', status: 'neutral' }
    ],
    breakdownData: [
      { category: 'ABAP RAP & Clean Core (Tech)', value: '38% Capability Gap', variance: '45 Enrolled', detail: 'Transition from legacy Z-code' },
      { category: 'SAP BTP AI Foundation (Tech)', value: '55% Capability Gap', variance: '20 Enrolled', detail: 'GenAI SDK and Copilots' },
      { category: 'EWM AGV & Robotics (Plant)', value: '42% Capability Gap', variance: 'Hiring Active', detail: 'Automated warehouse systems' },
      { category: 'Sustainability / ESG (Finance)', value: '60% Capability Gap', variance: 'Training Sourced', detail: 'S/4 Green Ledger compliance' }
    ],
    recommendedSapActions: [
      { actionName: 'Skill Inventory Management', tcode: 'PP01', description: 'Review Infotype 0024 (Qualifications Catalog)' },
      { actionName: 'Learning Academy Portal', tcode: 'Fiori F2300', description: 'Assign enterprise upskilling curricula in SuccessFactors LMS' }
    ]
  },
  {
    questionId: 'Q49',
    questionText: 'Show workforce cost trends.',
    category: 'Talent, Performance & Workforce Analytics',
    sapSourceTables: ['ACDOCA', 'PY_RT', 'PA0008', 'KABP'],
    summaryAnswer: 'Workforce Total Cost of Workforce (TCOW) Analytics: Annualized enterprise workforce expenditure is $198.4M USD (Salaries: $148.2M, Benefits & Healthcare: $28.6M, Taxes & Statutory: $14.2M, Contingent/Overtime: $7.4M). YoY TCOW growth is +3.8% (tracking below revenue growth of +6.4% - positive operating leverage).',
    keyInsights: [
      'Labor cost as a percentage of total enterprise operating expense: 38.2% (Healthy industry benchmark: 35-42%).',
      'Average Total Cost per FTE: $58,011 USD.',
      'Projected year-end workforce cost: $201.2M USD (100% within approved corporate financial plan).'
    ],
    hrMetrics: [
      { label: 'Annualized TCOW', value: '$198.4M USD', status: 'positive' },
      { label: 'Labor / OpEx Ratio', value: '38.2%', status: 'positive' },
      { label: 'YoY Cost Growth', value: '+3.8%', status: 'positive' },
      { label: 'Budget Plan Variance', value: '-0.8% Under Plan', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Base Salaries & Merit (Wage Type /101)', value: '$148.2M (74.7%)', variance: '+3.2% YoY', detail: '3,420 Active Employees' },
      { category: 'Healthcare & Benefits (WT 5000..)', value: '$28.6M (14.4%)', variance: '+4.5% YoY', detail: 'Medical, Dental, 401k match' },
      { category: 'Payroll Taxes & Statutory (WT /401..)', value: '$14.2M (7.2%)', variance: '+3.0% YoY', detail: 'FICA, FUTA, SUTA' },
      { category: 'Overtime & Contractor Contingent', value: '$7.4M (3.7%)', variance: '+5.1% YoY', detail: 'Peak manufacturing & logistics' }
    ],
    recommendedSapActions: [
      { actionName: 'Cost Center Labor Cost Ledger', tcode: 'S_ALR_87013611', description: 'Review Universal Journal ACDOCA labor cost allocations' },
      { actionName: 'TCOW Financial Visualizer', tcode: 'Fiori F2894', description: 'Inspect interactive workforce cost breakdown in SAC' }
    ]
  },
  {
    questionId: 'Q50',
    questionText: 'What should HR leadership focus on today?',
    category: 'Talent, Performance & Workforce Analytics',
    sapSourceTables: ['PA03', 'PCL2', 'PA0009', 'HRP1007', 'SF_PMGM', 'SF_TALENT'],
    summaryAnswer: 'Executive HR Daily Action Briefing (May 26, 2026): 4 high-priority strategic and operational focus areas for HR Leadership: 1) Payroll Release: Clear 1 missing bank detail (PERNR 100589) & approve 8 unsubmitted timesheets before tomorrow 5 PM cutoff; 2) Recruitment: Accelerate candidate closing for 3 long-standing critical vacancies (>65 days); 3) Performance Cycle: Drive completion of 14 remaining mid-year performance reviews (92% complete); 4) Retention: Finalize compensation adjustments for 6 high-flight-risk senior engineers.',
    keyInsights: [
      'Operational health score: 98.4% (Green across all legal entities).',
      'Zero regulatory compliance gaps or active labor grievances.',
      'Upcoming milestone: Successful onboarding preparation for 18 June joiners.'
    ],
    hrMetrics: [
      { label: 'Overall HR Health', value: '98.4% (Green)', status: 'positive' },
      { label: 'Priority Action Items', value: '4 Strategic Focuses', status: 'warning' },
      { label: 'Payroll Cutoff', value: 'Tomorrow 5:00 PM', status: 'warning' },
      { label: 'Review Cycle Progress', value: '92% Completed', status: 'positive' }
    ],
    breakdownData: [
      { category: '1. Payroll Finalization', value: 'Tomorrow 5:00 PM Release', variance: 'CRITICAL', detail: 'Resolve PERNR 100589 bank info & 8 Plant 1000 timesheets' },
      { category: '2. Critical Vacancy Sourcing', value: '3 Positions >65 Days', variance: 'HIGH', detail: 'Cyber Security, BTP AI, Battery Engineer' },
      { category: '3. Mid-Year Review Sign-Off', value: '14 Reviews Remaining', variance: 'MEDIUM', detail: 'Deadline Friday 5:00 PM (David Vance, Brenda Clark)' },
      { category: '4. Top Talent Retention', value: '6 Comp Packages', variance: 'STRATEGIC', detail: 'Prevent high-cost voluntary attrition in Cloud Tech' }
    ],
    recommendedSapActions: [
      { actionName: 'Executive HR Action Center', tcode: 'Fiori F2895', description: 'Open executive leadership command tower' },
      { actionName: 'Payroll Control Center', tcode: 'PA03', description: 'Monitor final pre-payroll release state for US entity' }
    ]
  }
];
