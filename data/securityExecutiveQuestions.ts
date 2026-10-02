import { SecurityExecutiveQuestionAnswer } from '../types';

export const ALL_SECURITY_EXECUTIVE_QUESTIONS: SecurityExecutiveQuestionAnswer[] = [
  // =========================================================================
  // PILLAR 1: USERS & ACCESS (Q1 - Q10)
  // =========================================================================
  {
    questionId: 'Q1',
    questionText: 'Show all active users in PRD.',
    category: 'Users & Access',
    sapSourceTables: ['USR02', 'V_USERNAME', 'USER_ADDR', 'AGR_USERS', 'UST04'],
    summaryAnswer: 'In Production Client 100, there are currently 420 total user master records in USR02, of which 368 are active dialog users with unexpired validity (GLTGB >= today) and unlock status (UFLAG = 0). 32 users are system/service accounts, and 20 are communication/background users.',
    keyInsights: [
      '368 Active dialog users with valid logon credentials in PRD Client 100.',
      'Average daily active concurrent sessions: 142 users across FI, SD, MM, and PP.',
      'Last full user master synchronization with SAP Identity Management completed today at 04:00 UTC.'
    ],
    securityMetrics: [
      { label: 'Active Dialog Users', value: '368 Users', status: 'positive' },
      { label: 'Total USR02 Records', value: '420 Accounts', status: 'neutral' },
      { label: 'System / Service', value: '32 Users', status: 'neutral' },
      { label: 'Concurrent Active', value: '142 Sessions', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Dialog (A)', value: '368 Active', variance: 'Standard', detail: 'End-users and operational consultants' },
      { category: 'System (B)', value: '18 Active', variance: 'Normal', detail: 'Internal RFCs, TMS, ALE/EDI interfaces' },
      { category: 'Service (S)', value: '14 Active', variance: 'Reviewed', detail: 'Fiori OData anonymous & catalog services' },
      { category: 'Communication (C)', value: '12 Active', variance: 'Normal', detail: 'B2B/EDI interfaces & external CPI tenant' },
      { category: 'Background (S)', value: '8 Active', variance: 'Normal', detail: 'Batch processing job users (e.g. SAP_BATCH)' }
    ],
    recommendedSapActions: [
      { actionName: 'User Information System', tcode: 'SUIM', description: 'Execute user list selection by logon data and validity date range.' },
      { actionName: 'User Maintenance Overview', tcode: 'SU01', description: 'Review active user attributes, license assignments, and logon parameters.' }
    ]
  },
  {
    questionId: 'Q2',
    questionText: 'Which users are locked?',
    category: 'Users & Access',
    sapSourceTables: ['USR02', 'USRLOCK', 'SM20', 'CDHDR_USER'],
    summaryAnswer: 'Currently 16 user accounts in PRD Client 100 are locked. Breakdown: 9 accounts locked globally by system administrator (UFLAG = 64/128), 5 accounts locked due to incorrect password attempts (UFLAG = 32), and 2 technical interface accounts locked due to certificate expiry.',
    keyInsights: [
      '16 Locked user master records in table USR02 (UFLAG != 0).',
      '5 Password-locked accounts: 3 occurred during morning shift change (potential typo / expired credential).',
      '2 Interface accounts locked: EDI_INVOICE_01 and CPI_SYNC_USER require immediate certificate renewal.'
    ],
    securityMetrics: [
      { label: 'Total Locked', value: '16 Accounts', status: 'warning' },
      { label: 'Admin Locked (64/128)', value: '9 Users', status: 'neutral' },
      { label: 'Password Failures (32)', value: '5 Users', status: 'warning' },
      { label: 'Interface Locks', value: '2 Accounts', status: 'negative' }
    ],
    breakdownData: [
      { category: 'JSMITH_MM (Dialog)', value: 'Locked (Pwd Failure)', variance: 'UFLAG = 32', detail: '3 Failed attempts at 08:14 UTC - Self-service reset sent' },
      { category: 'KPATEL_FI (Dialog)', value: 'Locked (Pwd Failure)', variance: 'UFLAG = 32', detail: '3 Failed attempts at 09:02 UTC - Helpdesk ticket #48102' },
      { category: 'EDI_INVOICE_01 (System)', value: 'Locked (Admin/Cert)', variance: 'UFLAG = 64', detail: 'X.509 Certificate expired 2026-08-25 - High priority' },
      { category: 'CONSULTANT_OLD (Dialog)', value: 'Locked (Admin)', variance: 'UFLAG = 128', detail: 'Project completed 2026-07-31 - Scheduled for deletion' }
    ],
    recommendedSapActions: [
      { actionName: 'Mass User Lock / Unlock', tcode: 'SU10', description: 'Mass inspect lock flags and unlock legitimate business users.' },
      { actionName: 'Security Audit Log Viewer', tcode: 'SM20', description: 'Verify terminal IP and origin of failed password lockouts.' }
    ]
  },
  {
    questionId: 'Q3',
    questionText: 'Which users have not logged in for 90 days?',
    category: 'Users & Access',
    sapSourceTables: ['USR02', 'AGR_USERS', 'SM20', 'USSTAMP'],
    summaryAnswer: 'There are 24 user accounts in PRD Client 100 with last logon date (USR02-TRDAT) older than 90 days (or no logon recorded since creation). These dormant accounts retain 68 active PFCG role assignments and consume active SAP Named User licenses.',
    keyInsights: [
      '24 Dormant accounts identified with TRDAT < today - 90 days.',
      '3 Dormant accounts hold elevated financial approval or administrative authorizations.',
      'Licensing Reclamation Opportunity: 24 licenses can be reclaimed via SU01 validity expiry adjustment.'
    ],
    securityMetrics: [
      { label: 'Dormant > 90 Days', value: '24 Accounts', status: 'negative' },
      { label: 'Assigned Roles', value: '68 Roles', status: 'warning' },
      { label: 'License Reclamation', value: '24 Named Users', status: 'positive' },
      { label: 'Dormant Superusers', value: '3 Accounts', status: 'negative' }
    ],
    breakdownData: [
      { category: 'EXT_CONSULT_04', value: '142 Days Dormant', variance: 'Critical', detail: 'Holds Z_FI_AP_SENIOR role - Last logon 2026-04-05' },
      { category: 'DEV_TEST_USER_9', value: '118 Days Dormant', variance: 'High', detail: 'Holds Z_BASIS_DEV - Last logon 2026-04-29' },
      { category: 'LOGISTICS_LEAD_OLD', value: '98 Days Dormant', variance: 'Medium', detail: 'Holds Z_TM_DISPATCHER - Last logon 2026-05-19' },
      { category: '21 Standard Business Users', value: '90-135 Days Dormant', variance: 'Medium', detail: 'Various operational roles across SD, MM, PP' }
    ],
    recommendedSapActions: [
      { actionName: 'SUIM User by Logon Date', tcode: 'SUIM', description: 'Execute selection criteria for TRDAT <= 90 days ago.' },
      { actionName: 'Mass Validity Expiration', tcode: 'SU10', description: 'Set Valid-To date to yesterday to decommission dormant access safely.' }
    ]
  },
  {
    questionId: 'Q4',
    questionText: 'Show users created this week.',
    category: 'Users & Access',
    sapSourceTables: ['USR02', 'CDHDR', 'CDPOS', 'USER_ADDR'],
    summaryAnswer: 'In the past 7 days, 8 new user accounts were created in PRD Client 100. All 8 accounts were provisioned via standard GRC Access Request workflows with documented manager approvals and business unit verification.',
    keyInsights: [
      '8 User accounts created in the last 7 calendar days.',
      '100% Provisioned through approved GRC Access Control (GRACREQ) workflows.',
      '0 Manual backdoor user creations detected in production Client 100.'
    ],
    securityMetrics: [
      { label: 'Users Created (7d)', value: '8 Accounts', status: 'positive' },
      { label: 'GRC Workflows', value: '8 / 8 Approved', status: 'positive' },
      { label: 'Manual Direct (SU01)', value: '0 (Clean)', status: 'positive' },
      { label: 'Default Roles Assigned', value: '22 Roles', status: 'positive' }
    ],
    breakdownData: [
      { category: 'EMILLER_SD (Emily Miller)', value: 'Created 2026-08-24', variance: 'Approved', detail: 'Order-to-Cash Specialist - GRC Req #104820' },
      { category: 'RCHENG_MM (Robert Cheng)', value: 'Created 2026-08-23', variance: 'Approved', detail: 'Purchasing Buyer - GRC Req #104818' },
      { category: 'ALIGHT_FI (Anna Light)', value: 'Created 2026-08-22', variance: 'Approved', detail: 'Accounts Payable Clerk - GRC Req #104812' },
      { category: '5 Additional Plant 1000 Users', value: 'Created 2026-08-20/21', variance: 'Approved', detail: 'Shop floor operators and warehouse staff' }
    ],
    recommendedSapActions: [
      { actionName: 'User Change Documents', tcode: 'SUIM', description: 'Review change document history for newly created users.' },
      { actionName: 'GRC Access Request Monitor', tcode: 'NWBC', description: 'Verify audit approval trails in SAP Access Control.' }
    ]
  },
  {
    questionId: 'Q5',
    questionText: 'Which users have expired passwords?',
    category: 'Users & Access',
    sapSourceTables: ['USR02', 'USR02-PWDCHGDATE', 'PRGN_CUST', 'SSO_PARAM'],
    summaryAnswer: '12 active user accounts currently have expired passwords based on the corporate 90-day password change policy (login/password_expiration_time = 90). Users will be prompted for mandatory password change upon next dialog logon; 6 users utilize SAML/SAML2 SSO bypassing dialog password prompts.',
    keyInsights: [
      '12 Users with expired local SAP passwords in USR02.',
      '6 Users authenticate via Corporate SAML 2.0 Identity Provider (Azure AD / Okta SSO).',
      '6 Users require local password renewal on next interactive GUI/Fiori login.'
    ],
    securityMetrics: [
      { label: 'Expired Passwords', value: '12 Users', status: 'warning' },
      { label: 'SSO Protected (SAML2)', value: '6 Users', status: 'positive' },
      { label: 'GUI Direct Logon', value: '6 Users', status: 'warning' },
      { label: 'Policy Interval', value: '90 Days', status: 'neutral' }
    ],
    breakdownData: [
      { category: 'BJOHNSON_PP', value: 'Expired (94 Days)', variance: 'Action Required', detail: 'Next login requires immediate password change' },
      { category: 'MWILLIAMS_QM', value: 'Expired (92 Days)', variance: 'Action Required', detail: 'Production quality inspector - direct GUI access' },
      { category: '4 Finance Users', value: 'Expired (91-96 Days)', variance: 'SSO Enabled', detail: 'Seamless authentication active via Azure AD SAML2' }
    ],
    recommendedSapActions: [
      { actionName: 'Mass Password Reset / Initial Pwd', tcode: 'SU10', description: 'Trigger initial password generation for affected users.' },
      { actionName: 'Profile Parameter Check', tcode: 'RZ11', description: 'Verify login/password_expiration_time parameter across all application servers.' }
    ]
  },
  {
    questionId: 'Q6',
    questionText: 'Which users have access after their termination date?',
    category: 'Users & Access',
    sapSourceTables: ['PA0000', 'PA0001', 'USR02', 'AGR_USERS', 'GRACUSER'],
    summaryAnswer: 'CRITICAL SECURITY FINDING: 2 user accounts have active validity dates in USR02 (GLTGB = 99991231) despite HR infotype 0000 recording employment termination dates in the past (7 and 14 days ago). Both accounts retain operational authorization profiles.',
    keyInsights: [
      '2 Terminated employees retain active SAP access (HR Leaver sync delay).',
      'Account EX_EMP_4412 (Terminated 2026-08-12) holds purchasing release codes.',
      'Account EX_EMP_8819 (Terminated 2026-08-19) holds customer credit master maintenance.',
      'Automated remediation triggered to expire validity and lock accounts immediately.'
    ],
    securityMetrics: [
      { label: 'Terminated with Access', value: '2 Users', status: 'negative' },
      { label: 'Active Critical Roles', value: '7 Roles', status: 'negative' },
      { label: 'HR Sync Gap', value: '14 Days Max', status: 'negative' },
      { label: 'Auto-Remediation', value: 'Ready', status: 'positive' }
    ],
    breakdownData: [
      { category: 'EX_EMP_4412 (John Doe)', value: 'Terminated 2026-08-12', variance: 'High Risk', detail: 'PFCG: Z_MM_PO_RELEASE, Z_SD_ORDER_CREATE - USR02 valid' },
      { category: 'EX_EMP_8819 (Sarah Lee)', value: 'Terminated 2026-08-19', variance: 'High Risk', detail: 'PFCG: Z_FI_CREDIT_MGR - USR02 valid' }
    ],
    recommendedSapActions: [
      { actionName: 'Immediate Account Lock', tcode: 'SU01', description: 'Lock user master record and set valid-to date to yesterday.' },
      { actionName: 'HR Trigger Workflow Inspection', tcode: 'SWI1', description: 'Investigate HR Leaver Event binding failure in SAP GRC/IdM.' }
    ]
  },
  {
    questionId: 'Q7',
    questionText: 'Show users with multiple dialog accounts.',
    category: 'Users & Access',
    sapSourceTables: ['USR02', 'USER_ADDR', 'USRMULTI', 'PA0105'],
    summaryAnswer: '3 employees are identified with multiple active dialog user accounts (User Type A) mapped to the same personnel number (PERNR) or email address. This creates dual-account vulnerability and license compliance overhead.',
    keyInsights: [
      '3 Individuals hold duplicate dialog accounts in PRD Client 100.',
      'Primary cause: Separate accounts created for regular user vs. support/project roles.',
      'Dual accounts breach single-identity compliance policy.'
    ],
    securityMetrics: [
      { label: 'Duplicate Accounts', value: '3 Persons (6 IDs)', status: 'warning' },
      { label: 'Dialog Type', value: '100% Type A', status: 'warning' },
      { label: 'License Impact', value: '3 Extra Licenses', status: 'warning' },
      { label: 'Policy Compliance', value: 'Non-Compliant', status: 'warning' }
    ],
    breakdownData: [
      { category: 'David Miller (PERNR 10442)', value: 'DMILLER / DMILLER_SUP', variance: 'Duplicate', detail: 'Regular user + obsolete support account' },
      { category: 'Elena Rostova (PERNR 10891)', value: 'EROSTOVA / EROSTOVA_PM', variance: 'Duplicate', detail: 'Plant maintenance + redundant project lead ID' },
      { category: 'Sanjay Gupta (PERNR 11204)', value: 'SGUPTA / SGUPTA_TEST', variance: 'Duplicate', detail: 'Active tester ID mistakenly placed in PRD' }
    ],
    recommendedSapActions: [
      { actionName: 'Consolidate Accounts', tcode: 'SU01', description: 'Deactivate duplicate accounts and merge essential roles into primary ID.' },
      { actionName: 'SUIM Duplicate Email Audit', tcode: 'SUIM', description: 'Run user search by identical communication email addresses.' }
    ]
  },
  {
    questionId: 'Q8',
    questionText: 'Which service or technical users are interactive?',
    category: 'Users & Access',
    sapSourceTables: ['USR02', 'SM20', 'AUTH_CHECK', 'UST04'],
    summaryAnswer: 'Security audit identified 1 technical interface account (B2B_INVOICE_SRV) configured with User Type A (Dialog) instead of Type B (System) or Type S (Service). This permits interactive GUI password logon and poses high credential vulnerability.',
    keyInsights: [
      '1 Service account incorrectly configured with Dialog user type (USTYP = A).',
      'Account B2B_INVOICE_SRV logged into SAP GUI once in the past 30 days.',
      'High priority hardening action: Change USTYP from A (Dialog) to B (System) in SU01.'
    ],
    securityMetrics: [
      { label: 'Interactive Technical', value: '1 Account', status: 'negative' },
      { label: 'Correct System Users', value: '31 Accounts', status: 'positive' },
      { label: 'GUI Logon Detected', value: '1 Instance', status: 'negative' },
      { label: 'Risk Severity', value: 'High', status: 'negative' }
    ],
    breakdownData: [
      { category: 'B2B_INVOICE_SRV', value: 'Type A (Dialog)', variance: 'Misconfigured', detail: 'Should be Type B (System) - Holds S_TABU_DIS and RFC authorizations' }
    ],
    recommendedSapActions: [
      { actionName: 'User Type Remediation', tcode: 'SU01', description: 'Change logon data user type to System (B) to disable dialog password login.' },
      { actionName: 'RFC User Security Hardening', tcode: 'SM59', description: 'Enforce trusted RFC and SNC encryption for technical destinations.' }
    ]
  },
  {
    questionId: 'Q9',
    questionText: 'Show users by company code, plant, or business unit.',
    category: 'Users & Access',
    sapSourceTables: ['USR02', 'USER_ADDR', 'AGR_USERS', 'AGR_1252', 'T001', 'T001W'],
    summaryAnswer: 'User distribution across organizational structures in PRD Client 100: Company Code 1000 (US Central) has 214 users; Company Code 2000 (EU Logistics) has 112 users; Company Code 3000 (APAC) has 42 users. Across manufacturing plants: Plant 1000 hosts 148 authorized users, Plant 2000 has 86, and Plant 3000 has 34.',
    keyInsights: [
      '214 Users assigned organizational level BUKRS = 1000 in AGR_1252.',
      '148 Users assigned plant authorization WERKS = 1000 across PP, MM, and QM.',
      'Organizational value consistency check passed with 99.1% alignment.'
    ],
    securityMetrics: [
      { label: 'Company Code 1000', value: '214 Users', status: 'positive' },
      { label: 'Company Code 2000', value: '112 Users', status: 'positive' },
      { label: 'Plant 1000 (Mfg)', value: '148 Users', status: 'positive' },
      { label: 'Plant 2000 (Logistics)', value: '86 Users', status: 'positive' }
    ],
    breakdownData: [
      { category: 'CC 1000 / Plant 1000 (Mfg)', value: '148 Users', variance: 'Largest Unit', detail: 'Operations, maintenance, plant controllers, warehouse' },
      { category: 'CC 1000 / HQ Corporate', value: '66 Users', variance: 'Corporate', detail: 'Corporate Finance, HR, Executive Management, Legal' },
      { category: 'CC 2000 / Plant 2000 (EU)', value: '86 Users', variance: 'Regional', detail: 'European distribution, fulfillment, regional sales' },
      { category: 'CC 3000 / Plant 3000 (APAC)', value: '34 Users', variance: 'Regional', detail: 'Asia-Pacific sourcing, logistics, customer service' }
    ],
    recommendedSapActions: [
      { actionName: 'Org Level Analysis in SUIM', tcode: 'SUIM', description: 'Run user selection by authorization object F_BKPF_BUK and M_BEST_WRK.' },
      { actionName: 'Derived Role Org Field Audit', tcode: 'PFCG', description: 'Verify org field inheritance across derived role matrix.' }
    ]
  },
  {
    questionId: 'Q10',
    questionText: 'Which user accounts need immediate review?',
    category: 'Users & Access',
    sapSourceTables: ['USR02', 'AGR_USERS', 'PA0000', 'SM20', 'GRACUSER'],
    summaryAnswer: '8 user accounts require immediate priority review today: 2 accounts of terminated employees still active, 1 interactive technical service user, 2 dormant accounts with elevated superuser privileges, and 3 accounts flagged with multiple active SoD violations.',
    keyInsights: [
      '8 High-priority user accounts flagged by AI Security Risk Engine.',
      'Immediate action: Lock terminated accounts and switch technical user type.',
      'Escalated to SAP Security Lead and SOX Compliance Team for sign-off.'
    ],
    securityMetrics: [
      { label: 'Immediate Review', value: '8 Accounts', status: 'negative' },
      { label: 'Critical Severity', value: '4 Accounts', status: 'negative' },
      { label: 'High Severity', value: '4 Accounts', status: 'warning' },
      { label: 'Auto-Fix Available', value: '6 of 8', status: 'positive' }
    ],
    breakdownData: [
      { category: 'EX_EMP_4412', value: 'Terminated with Access', variance: 'Critical', detail: 'Immediate lock required - terminated 14 days ago' },
      { category: 'EX_EMP_8819', value: 'Terminated with Access', variance: 'Critical', detail: 'Immediate lock required - terminated 7 days ago' },
      { category: 'B2B_INVOICE_SRV', value: 'Interactive Service ID', variance: 'Critical', detail: 'Convert to User Type B (System)' },
      { category: 'CONSULTANT_BASIS_OLD', value: 'Dormant Superuser', variance: 'Critical', detail: 'Inactive 120 days - holds SAP_ALL profile' },
      { category: 'MSMITH_FI', value: 'Multiple SoD Violations', variance: 'High', detail: 'Holds both vendor master & payment execution' }
    ],
    recommendedSapActions: [
      { actionName: 'Execute Automated Remediation', tcode: 'SU01', description: 'Execute batched security remediation locks and profile revocations.' },
      { actionName: 'Security Access Review Campaign', tcode: 'NWBC', description: 'Initiate manager re-certification campaign in GRC Access Control.' }
    ]
  },

  // =========================================================================
  // PILLAR 2: ROLES & AUTHORIZATIONS (Q11 - Q20)
  // =========================================================================
  {
    questionId: 'Q11',
    questionText: 'What roles does User ABC have?',
    category: 'Roles & Authorizations',
    sapSourceTables: ['AGR_USERS', 'AGR_DEFINE', 'AGR_TEXTS', 'UST04', 'USR04'],
    summaryAnswer: 'User ABC (Sample user MSMITH_FI / Accounting Lead) is currently assigned 5 single PFCG roles and 1 composite role in PRD Client 100: Z_FI_GL_ACCOUNTANT, Z_FI_AP_SENIOR, Z_FI_AR_SPECIALIST, Z_CROSS_REPORTING, and Z_BASIS_ENDUSER. Total granted authorization objects: 184; active T-Codes: 62.',
    keyInsights: [
      '5 Single roles and 1 composite role assigned to User ABC.',
      'Role Z_FI_AP_SENIOR grants sensitive payment transaction FB110 and FK02.',
      'Last role change document recorded on 2026-08-14 by Security Admin.'
    ],
    securityMetrics: [
      { label: 'Assigned Roles', value: '6 Roles', status: 'positive' },
      { label: 'Granted T-Codes', value: '62 Transactions', status: 'neutral' },
      { label: 'Auth Objects', value: '184 Objects', status: 'neutral' },
      { label: 'Role Status', value: 'All Generated', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Z_FI_GL_ACCOUNTANT', value: 'Single Role', variance: 'Valid', detail: 'General ledger posting & balance review (FB50, FS10N)' },
      { category: 'Z_FI_AP_SENIOR', value: 'Single Role', variance: 'Sensitive', detail: 'Accounts payable processing & vendor edit (FB60, FK02)' },
      { category: 'Z_FI_AR_SPECIALIST', value: 'Single Role', variance: 'Valid', detail: 'Customer invoice & incoming payment (FB70, F-28)' },
      { category: 'Z_CROSS_REPORTING', value: 'Single Role', variance: 'Valid', detail: 'Standard read-only reporting suite (FBL1N, FBL3N, FBL5N)' },
      { category: 'Z_COMP_FINANCE_LEAD', value: 'Composite Role', variance: 'Valid', detail: 'Wrapper bundle for corporate accounting management' }
    ],
    recommendedSapActions: [
      { actionName: 'Display User Roles', tcode: 'SU01', description: 'Inspect Roles tab in User Maintenance to view validity periods.' },
      { actionName: 'Role Authorization Analysis', tcode: 'SUIM', description: 'Generate comprehensive list of authorization objects for User ABC.' }
    ]
  },
  {
    questionId: 'Q12',
    questionText: 'Why does this user have access to transaction VA02?',
    category: 'Roles & Authorizations',
    sapSourceTables: ['AGR_1251', 'AGR_USERS', 'AGR_DEFINE', 'TSTC', 'USOBX_C'],
    summaryAnswer: 'User ABC has access to transaction VA02 (Change Sales Order) via PFCG role Z_SD_ORDER_SPECIALIST. The authorization is granted through object S_TCODE (field TCD = VA02) along with sales authorization object V_VBAK_AAT (Sales Document Type = OR, QT) and activity field ACTVT = 02 (Change).',
    keyInsights: [
      'Access originated from single role: Z_SD_ORDER_SPECIALIST.',
      'Authorization Object: S_TCODE -> TCD = VA02.',
      'Business Object Check: V_VBAK_AAT (ACTVT 02) and V_VBAK_VKO (VKORG 1000).',
      'Assigned to user on 2026-06-15 under approved Access Request #89210.'
    ],
    securityMetrics: [
      { label: 'Target T-Code', value: 'VA02', status: 'positive' },
      { label: 'Source Role', value: 'Z_SD_ORDER_SPECIALIST', status: 'neutral' },
      { label: 'Activity Granted', value: 'ACTVT 02 (Change)', status: 'neutral' },
      { label: 'Org Restriction', value: 'VKORG 1000 / VTWEG 10', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Role Assignment', value: 'Z_SD_ORDER_SPECIALIST', variance: 'Direct', detail: 'Valid until 99991231 in AGR_USERS' },
      { category: 'Auth Object S_TCODE', value: 'TCD = VA02', variance: 'Granted', detail: 'Field TCD allows transaction start' },
      { category: 'Auth Object V_VBAK_AAT', value: 'ACTVT = 02, 03; AUART = OR', variance: 'Granted', detail: 'Restricted to standard sales order types' },
      { category: 'Auth Object V_VBAK_VKO', value: 'VKORG = 1000, VTWEG = 10', variance: 'Restricted', detail: 'Enforces sales organization boundary' }
    ],
    recommendedSapActions: [
      { actionName: 'Transaction Authorization Trace', tcode: 'SU24', description: 'Check SU24 check indicators and proposal values for VA02.' },
      { actionName: 'Authorization Object Trace', tcode: 'ST01', description: 'Run authorization trace for user to verify runtime field checks.' }
    ]
  },
  {
    questionId: 'Q13',
    questionText: 'Which roles provide access to FB60?',
    category: 'Roles & Authorizations',
    sapSourceTables: ['AGR_1251', 'AGR_DEFINE', 'AGR_TEXTS', 'TSTC'],
    summaryAnswer: 'In PRD Client 100, exactly 4 PFCG roles provide authorization to transaction FB60 (Enter Incoming Invoices): Z_FI_AP_CLERK (Standard entry), Z_FI_AP_SENIOR (Entry & release), Z_FI_ALL_FINANCE (Superuser role), and Z_CROSS_AP_BUYER (Combined purchasing & invoice role).',
    keyInsights: [
      '4 PFCG roles contain S_TCODE field TCD = FB60.',
      '84 Total users across the enterprise currently hold at least one of these 4 roles.',
      'Role Z_CROSS_AP_BUYER creates potential SoD conflicts with ME21N purchase order creation.'
    ],
    securityMetrics: [
      { label: 'Roles with FB60', value: '4 Roles', status: 'neutral' },
      { label: 'Assigned Users', value: '84 Users', status: 'neutral' },
      { label: 'AP Clerks', value: '62 Users', status: 'positive' },
      { label: 'Conflicting Cross-Roles', value: '1 Role (12 Users)', status: 'warning' }
    ],
    breakdownData: [
      { category: 'Z_FI_AP_CLERK', value: '52 Users Assigned', variance: 'Standard', detail: 'Restricted to ACTVT 01, 02, 03; BUKRS 1000/2000' },
      { category: 'Z_FI_AP_SENIOR', value: '16 Users Assigned', variance: 'Elevated', detail: 'Includes payment block release and credit memo posting' },
      { category: 'Z_CROSS_AP_BUYER', value: '12 Users Assigned', variance: 'SoD Risk', detail: 'Contains both FB60 and ME21N - SoD violation rule SOD-01' },
      { category: 'Z_FI_ALL_FINANCE', value: '4 Users Assigned', variance: 'Privileged', detail: 'Finance team leads with broad authorization' }
    ],
    recommendedSapActions: [
      { actionName: 'Roles by Transaction in SUIM', tcode: 'SUIM', description: 'Execute Roles by Complex Selection Criteria for T-Code FB60.' },
      { actionName: 'Role Maintenance in PFCG', tcode: 'PFCG', description: 'Audit authorization data tab and SU24 object maintenance for Z_FI_AP_CLERK.' }
    ]
  },
  {
    questionId: 'Q14',
    questionText: 'Show users with SAP_ALL.',
    category: 'Roles & Authorizations',
    sapSourceTables: ['UST04', 'USR04', 'USR02', 'AGR_USERS', 'TOA01'],
    summaryAnswer: 'ZERO dialog end-users have SAP_ALL profile assigned in PRD Client 100 (Compliant). Exactly 3 system/technical accounts hold SAP_ALL for automated operations: DDIC (Locked for dialog), SAP* (Protected by login/no_automatic_user_sapstar = 1), and TMSADM (System user for transport management).',
    keyInsights: [
      '0 Dialog users hold SAP_ALL in Production Client 100 (100% SOX Compliant).',
      'Emergency administrative tasks must be executed via GRC Firefighter (EAM).',
      'Continuous daily automated scanner alerts if SAP_ALL is assigned to any user master.'
    ],
    securityMetrics: [
      { label: 'Dialog Users with SAP_ALL', value: '0 Users', status: 'positive' },
      { label: 'SOX Compliance', value: '100% Pass', status: 'positive' },
      { label: 'Technical Accounts', value: '3 (DDIC, SAP*, TMSADM)', status: 'positive' },
      { label: 'Firefighter Mechanism', value: 'Active', status: 'positive' }
    ],
    breakdownData: [
      { category: 'DDIC (Client 100)', value: 'System Account', variance: 'Compliant', detail: 'Locked for dialog logon; used strictly for kernel upgrades & dictionary activations' },
      { category: 'SAP* (Client 100)', value: 'Superuser Template', variance: 'Compliant', detail: 'Hardened via parameter login/no_automatic_user_sapstar = 1' },
      { category: 'TMSADM (Client 000/100)', value: 'System RFC User', variance: 'Compliant', detail: 'Dedicated to STMS transport routing with encrypted RFC destination' }
    ],
    recommendedSapActions: [
      { actionName: 'SUIM Users by Profile', tcode: 'SUIM', description: 'Execute user selection with Profile = SAP_ALL to verify empty dialog list.' },
      { actionName: 'Parameter Verification', tcode: 'RZ11', description: 'Verify login/no_automatic_user_sapstar = 1.' }
    ]
  },
  {
    questionId: 'Q15',
    questionText: 'Show users with SAP_NEW.',
    category: 'Roles & Authorizations',
    sapSourceTables: ['UST04', 'USR04', 'USR02', 'AGR_USERS'],
    summaryAnswer: 'ZERO users (both dialog and technical) currently have the SAP_NEW profile assigned in PRD Client 100. SAP_NEW was completely decommissioned post-S/4HANA release upgrade and all delta authorization objects were engineered into dedicated functional PFCG roles.',
    keyInsights: [
      '0 Users assigned SAP_NEW in PRD Client 100.',
      'Profile SAP_NEW completely cleaned up post S/4HANA 2023 FPS02 upgrade.',
      'No delta release authorization leakage detected.'
    ],
    securityMetrics: [
      { label: 'Users with SAP_NEW', value: '0 Users', status: 'positive' },
      { label: 'Upgrade Cleanup', value: '100% Complete', status: 'positive' },
      { label: 'Delta Auth Status', value: 'PFCG Hardened', status: 'positive' },
      { label: 'Security Score', value: '100 / 100', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Dialog Users', value: '0 Assigned', variance: 'Clean', detail: 'No standard or custom dialog account holds SAP_NEW' },
      { category: 'Service Accounts', value: '0 Assigned', variance: 'Clean', detail: 'All background/batch jobs operate with granular functional roles' }
    ],
    recommendedSapActions: [
      { actionName: 'SUIM Profile Search', tcode: 'SUIM', description: 'Run periodic audit query for profile SAP_NEW in USR04/UST04.' },
      { actionName: 'Role Upgrade Verification', tcode: 'SU25', description: 'Review Step 2a/2b/2c upgrade transaction check indicator status.' }
    ]
  },
  {
    questionId: 'Q16',
    questionText: 'Which roles contain critical authorization objects?',
    category: 'Roles & Authorizations',
    sapSourceTables: ['AGR_1251', 'AGR_DEFINE', 'TOA01', 'USOBX', 'USOBT'],
    summaryAnswer: 'In PRD Client 100, 6 PFCG roles contain high-risk critical authorization objects: S_TABU_DIS (Table maintenance with DICBERCLS = &NC& / SS), S_DEVELOP (ABAP workbench debug/replace), S_RZL_ADM (CCMS system administration), and S_USER_AGR (Role administration).',
    keyInsights: [
      '6 PFCG roles contain critical authorization objects.',
      'Role Z_BASIS_EMERGENCY contains S_TABU_DIS with &NC& (Restricted to GRC Firefighter).',
      'Role Z_DEV_DEBUG_PRD contains S_DEVELOP ACTVT 03 (Display only - compliant).'
    ],
    securityMetrics: [
      { label: 'Roles with Critical Objs', value: '6 Roles', status: 'warning' },
      { label: 'S_TABU_DIS (&NC&)', value: '2 Roles (SPM only)', status: 'neutral' },
      { label: 'S_DEVELOP (Debug)', value: '1 Role (Display)', status: 'positive' },
      { label: 'S_USER_AGR (Admin)', value: '2 Roles (Sec Team)', status: 'neutral' }
    ],
    breakdownData: [
      { category: 'Z_BASIS_EMERGENCY', value: 'S_TABU_DIS, S_RZL_ADM', variance: 'SPM Firefighter', detail: 'Direct table modification & system control - Firefighter only' },
      { category: 'Z_SEC_ADMIN_PROD', value: 'S_USER_AGR, S_USER_GRP', variance: 'Restricted', detail: 'Security administrators - User & role provisioning' },
      { category: 'Z_DEV_SUPPORT_PRD', value: 'S_DEVELOP (ACTVT 03)', variance: 'Audited', detail: 'Support consultants - Display-only debug without replace' },
      { category: 'Z_FI_DIRECT_POSTING', value: 'S_TABU_DIS (DICBERCLS FC)', variance: 'Audited', detail: 'Financial configuration maintenance' }
    ],
    recommendedSapActions: [
      { actionName: 'Critical Authorizations in SUIM', tcode: 'SUIM', description: 'Run Authorizations by Critical Authorization Objects report.' },
      { actionName: 'PFCG Authorization Inspection', tcode: 'PFCG', description: 'Review inactive or open authorization fields in critical roles.' }
    ]
  },
  {
    questionId: 'Q17',
    questionText: 'Show composite roles assigned to this user.',
    category: 'Roles & Authorizations',
    sapSourceTables: ['AGR_AGRS', 'AGR_USERS', 'AGR_DEFINE', 'AGR_TEXTS'],
    summaryAnswer: 'User MSMITH_FI is assigned composite role Z_COMP_FINANCE_LEAD. This composite role groups 4 underlying single roles: Z_FI_GL_ACCOUNTANT, Z_FI_AP_SENIOR, Z_FI_AR_SPECIALIST, and Z_CROSS_REPORTING. Role assignment is valid through 2026-12-31 with inherited organizational level values.',
    keyInsights: [
      'Composite Role: Z_COMP_FINANCE_LEAD assigned to user.',
      'Contains 4 active child single roles synchronized via PFCG menu hierarchy.',
      'User inherits menu structure and combined authorizations seamlessly.'
    ],
    securityMetrics: [
      { label: 'Composite Role', value: 'Z_COMP_FINANCE_LEAD', status: 'positive' },
      { label: 'Child Single Roles', value: '4 Roles', status: 'neutral' },
      { label: 'Validity Period', value: 'Valid to 2026-12-31', status: 'positive' },
      { label: 'Menu Items', value: '54 Fiori Tiles / T-Codes', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Z_FI_GL_ACCOUNTANT', value: 'Child Single Role', variance: 'Active', detail: 'General Ledger accounting functions' },
      { category: 'Z_FI_AP_SENIOR', value: 'Child Single Role', variance: 'Active', detail: 'Accounts Payable processing' },
      { category: 'Z_FI_AR_SPECIALIST', value: 'Child Single Role', variance: 'Active', detail: 'Accounts Receivable management' },
      { category: 'Z_CROSS_REPORTING', value: 'Child Single Role', variance: 'Active', detail: 'Standard financial drilldown reports' }
    ],
    recommendedSapActions: [
      { actionName: 'Composite Role Structure', tcode: 'PFCG', description: 'Display Roles tab in PFCG to examine child role relationships.' },
      { actionName: 'User Comparison in PFCG', tcode: 'PFUD', description: 'Execute user master comparison to ensure child role synchronization.' }
    ]
  },
  {
    questionId: 'Q18',
    questionText: 'Which roles were changed recently?',
    category: 'Roles & Authorizations',
    sapSourceTables: ['AGR_DEFINE', 'AGR_1251', 'CDHDR', 'CDPOS', 'E070'],
    summaryAnswer: 'In the past 14 days, 5 PFCG roles were modified in the transport development track (DEV Client 100) and 3 roles were transported into PRD Client 100 via verified STMS transport requests. 1 role was modified directly in PRD (Audit exception flagged in Q45).',
    keyInsights: [
      '3 Roles transported into PRD via verified transports TR-S4H-90124 and TR-S4H-90128.',
      'Role Z_MM_PURCHASING_EXP updated with new S/4HANA Fiori launchpad catalog catalogs.',
      '1 Unauthorized direct PRD modification detected and flagged for reversion.'
    ],
    securityMetrics: [
      { label: 'Roles Transported (14d)', value: '3 Roles', status: 'positive' },
      { label: 'Transport Requests', value: '2 STMS Requests', status: 'positive' },
      { label: 'Development Changes', value: '5 Roles (in DEV)', status: 'neutral' },
      { label: 'Direct PRD Edits', value: '1 Exception', status: 'negative' }
    ],
    breakdownData: [
      { category: 'Z_MM_PURCHASING_EXP', value: 'TR S4HK90124', variance: 'Transported', detail: 'Imported 2026-08-20 - Added Fiori Catalog SAP_MM_BC_BUYER_PC' },
      { category: 'Z_SD_CREDIT_ANALYST', value: 'TR S4HK90128', variance: 'Transported', detail: 'Imported 2026-08-22 - Updated UKM_BP credit profile auths' },
      { category: 'Z_TM_DISPATCHER_NA', value: 'TR S4HK90128', variance: 'Transported', detail: 'Imported 2026-08-22 - Added /SCMTMS/PLN_EXP planning cockpit' },
      { category: 'Z_FI_AP_SUPERUSER', value: 'Direct PRD Edit', variance: 'AUDIT VIOLATION', detail: 'Edited 2026-08-11 directly in PRD - Target for reversion' }
    ],
    recommendedSapActions: [
      { actionName: 'Role Change History in SUIM', tcode: 'SUIM', description: 'Run Change Documents for Roles report across date range.' },
      { actionName: 'Transport Management System', tcode: 'STMS', description: 'Inspect transport log and import history for authorization transports.' }
    ]
  },
  {
    questionId: 'Q19',
    questionText: 'Which users received new production access this week?',
    category: 'Roles & Authorizations',
    sapSourceTables: ['AGR_USERS', 'CDHDR_USER', 'CDPOS_USER', 'GRACREQ'],
    summaryAnswer: 'This week, 14 users received new or modified role assignments in PRD Client 100. 12 assignments were standard business role requests processed through SAP GRC Access Control with dual-manager approval; 2 assignments were temporary emergency access grants via GRC Firefighter.',
    keyInsights: [
      '14 Users received updated PFCG role assignments in the last 7 days.',
      '12 Approved standard business requests (Average approval cycle time: 4.2 hours).',
      '2 Emergency access grants with active SPM session logs recorded.'
    ],
    securityMetrics: [
      { label: 'Users Updated', value: '14 Users', status: 'positive' },
      { label: 'New Role Assignments', value: '28 Roles', status: 'neutral' },
      { label: 'GRC Approved', value: '12 Standard Reqs', status: 'positive' },
      { label: 'Emergency Access', value: '2 Firefighter', status: 'warning' }
    ],
    breakdownData: [
      { category: 'ALIGHT_FI (Anna Light)', value: '+3 Roles (Z_FI_AP_CLERK, etc.)', variance: 'GRC #104812', detail: 'New hire onboarding in Accounts Payable' },
      { category: 'RCHENG_MM (Robert Cheng)', value: '+2 Roles (Z_MM_BUYER)', variance: 'GRC #104818', detail: 'Procurement buyer access assignment' },
      { category: 'FF_BASIS_01 (Firefighter)', value: '+1 Emergency Role', variance: 'SPM #4091', detail: 'Kernel patch pre-check on 2026-08-25' },
      { category: '11 Additional Users', value: '+22 Roles total', variance: 'Approved', detail: 'Plant operations, sales order entry, and logistics' }
    ],
    recommendedSapActions: [
      { actionName: 'User Role Assignment Changes', tcode: 'SUIM', description: 'Review User Change Documents for Role Assignment additions.' },
      { actionName: 'GRC Request Audit Trail', tcode: 'NWBC', description: 'Verify approver sign-offs and risk analysis results in GRC Access Control.' }
    ]
  },
  {
    questionId: 'Q20',
    questionText: "Compare this user's access with another user in the same job role.",
    category: 'Roles & Authorizations',
    sapSourceTables: ['AGR_USERS', 'AGR_1251', 'HRP1001', 'SUIM_COMP'],
    summaryAnswer: 'Peer comparison between User MSMITH_FI and peer AP_CLERK_04 (Both with Job Title: Accounts Payable Specialist in Plant 1000): MSMITH_FI holds 6 PFCG roles (including payment execution FB110 and vendor change FK02), whereas AP_CLERK_04 holds 3 standard roles. MSMITH_FI has 100% role excess over peer group median.',
    keyInsights: [
      'MSMITH_FI holds 3 excess roles: Z_FI_AP_SENIOR, Z_FI_GL_ACCOUNTANT, and Z_COMP_FINANCE_LEAD.',
      'Delta analysis reveals 28 extra T-Codes and 14 additional authorization objects.',
      'Access accumulation caused by historic project role retention without de-provisioning.'
    ],
    securityMetrics: [
      { label: 'User Roles (MSMITH_FI)', value: '6 Roles', status: 'warning' },
      { label: 'Peer Roles (AP_CLERK_04)', value: '3 Roles', status: 'positive' },
      { label: 'Role Deviation', value: '+100% Excess', status: 'negative' },
      { label: 'Excess T-Codes', value: '+28 Transactions', status: 'negative' }
    ],
    breakdownData: [
      { category: 'Shared Roles (Common)', value: 'Z_FI_AP_CLERK, Z_CROSS_REPORTING, Z_BASIS_ENDUSER', variance: 'Aligned', detail: 'Standard operational baseline for AP specialists' },
      { category: 'MSMITH_FI Delta (Excess)', value: 'Z_FI_AP_SENIOR, Z_FI_GL_ACCOUNTANT, Z_COMP_FINANCE_LEAD', variance: 'Excess Access', detail: 'Allows vendor payment, GL adjustment, and vendor creation' },
      { category: 'AP_CLERK_04 Delta', value: 'None (Clean Baseline)', variance: 'Compliant', detail: 'Perfect alignment with organizational peer cluster' }
    ],
    recommendedSapActions: [
      { actionName: 'SUIM User Comparison', tcode: 'SUIM', description: 'Run Compare Users tool in SUIM to generate side-by-side authorization delta.' },
      { actionName: 'Excess Role Removal', tcode: 'SU01', description: 'De-provision Z_FI_AP_SENIOR and align user to standard peer baseline.' }
    ]
  },

  // =========================================================================
  // PILLAR 3: SEGREGATION OF DUTIES (SOD) (Q21 - Q30)
  // =========================================================================
  {
    questionId: 'Q21',
    questionText: 'Show all current SoD conflicts.',
    category: 'Segregation of Duties (SoD)',
    sapSourceTables: ['GRACUSER', 'GRACACTRULE', 'GRACRISK', 'AGR_1251', 'AGR_USERS'],
    summaryAnswer: 'In PRD Client 100, the SAP GRC Rule Matrix identifies 18 active Segregation of Duties (SoD) conflicts across 14 user accounts. Severity breakdown: 4 High-Risk violations (Vendor Creation vs Payment, PO Creation vs Approval), 8 Medium-Risk conflicts (GL Post vs Master Data), and 6 Low-Risk reporting conflicts. 12 conflicts have approved mitigating controls.',
    keyInsights: [
      '18 Active SoD conflicts detected across 14 user accounts.',
      '4 High-Risk violations requiring immediate remediation or mitigation.',
      '12 Conflicts covered by active compensating management review controls.',
      '2 Conflicts lacking mitigation controls flagged for urgent action.'
    ],
    securityMetrics: [
      { label: 'Total SoD Conflicts', value: '18 Conflicts', status: 'warning' },
      { label: 'High-Risk Violations', value: '4 Violations', status: 'negative' },
      { label: 'Mitigated Conflicts', value: '12 / 18 (66%)', status: 'positive' },
      { label: 'Unmitigated Risks', value: '2 Violations', status: 'negative' }
    ],
    breakdownData: [
      { category: 'SOD-PTP-01 (Vendor + Pay)', value: '2 Users (High Risk)', variance: 'Critical', detail: 'FK01/XK01 Vendor Master vs F110 Automatic Payment Run' },
      { category: 'SOD-PTP-02 (PO Create + Appr)', value: '2 Users (High Risk)', variance: 'Critical', detail: 'ME21N Create PO vs ME28/ME29N Release PO' },
      { category: 'SOD-OTC-01 (Order + Credit)', value: '3 Users (Medium Risk)', variance: 'Mitigated', detail: 'VA01 Create Sales Order vs VKM1 Release Credit Block' },
      { category: 'SOD-RTR-01 (GL Post + Maint)', value: '5 Users (Medium Risk)', variance: 'Mitigated', detail: 'FB50 Post GL vs FS00 Maintain Chart of Accounts' },
      { category: '6 Operational Conflicts', value: '6 Users (Low Risk)', variance: 'Mitigated', detail: 'Inventory count entry vs inventory adjustment posting' }
    ],
    recommendedSapActions: [
      { actionName: 'GRC Risk Analysis Dashboard', tcode: 'NWBC', description: 'Run Access Risk Analysis (ARA) batch simulation in SAP Access Control.' },
      { actionName: 'Role Cleanse & Split', tcode: 'PFCG', description: 'Separate conflicting transaction codes into dedicated single functional roles.' }
    ]
  },
  {
    questionId: 'Q22',
    questionText: 'Which users can both create and pay vendors?',
    category: 'Segregation of Duties (SoD)',
    sapSourceTables: ['AGR_1251', 'AGR_USERS', 'GRACUSER', 'LFA1', 'REGUH'],
    summaryAnswer: 'CRITICAL SOD VIOLATION (Rule SOD-PTP-01): Exactly 2 users in PRD Client 100 have authorizations to both create/edit vendor master records (FK01, XK01, BP with vendor role FLVN00) and execute automatic payment runs (F110): User MSMITH_FI and User AP_LEAD_02. Both can fraudulently create a vendor and disburse funds.',
    keyInsights: [
      '2 Users hold both Vendor Creation/Change (FK01/BP) and Payment Execution (F110).',
      'MSMITH_FI holds FK01 via Z_FI_AP_SENIOR and F110 via Z_FI_AP_CLERK.',
      'AP_LEAD_02 holds combination via legacy composite role Z_COMP_FINANCE_LEAD.',
      'High fraud exposure: Immediate removal of F110 proposed to resolve conflict.'
    ],
    securityMetrics: [
      { label: 'Conflicting Users', value: '2 Users', status: 'negative' },
      { label: 'Risk Rating', value: 'CRITICAL (SOX)', status: 'negative' },
      { label: 'Financial Exposure', value: '$2.4M / Month', status: 'negative' },
      { label: 'Remediation Ready', value: 'Revoke F110', status: 'positive' }
    ],
    breakdownData: [
      { category: 'MSMITH_FI (Michael Smith)', value: 'FK01 + F110 Active', variance: 'Critical', detail: 'Source roles: Z_FI_AP_SENIOR + Z_FI_AP_CLERK - No mitigation control' },
      { category: 'AP_LEAD_02 (Karen Vance)', value: 'BP (FLVN00) + F110 Active', variance: 'Critical', detail: 'Source role: Z_COMP_FINANCE_LEAD - Mitigating control MIT-FI-02 expired' }
    ],
    recommendedSapActions: [
      { actionName: 'Revoke Conflicting Role', tcode: 'SU01', description: 'Remove role Z_FI_AP_SENIOR to eliminate vendor edit authorization.' },
      { actionName: 'Payment Run Log Audit', tcode: 'F110', description: 'Audit historical payment proposal logs to confirm no unauthorized disbursements.' }
    ]
  },
  {
    questionId: 'Q23',
    questionText: 'Who can create purchase orders and approve them?',
    category: 'Segregation of Duties (SoD)',
    sapSourceTables: ['AGR_1251', 'AGR_USERS', 'EKKO', 'GRACUSER', 'M_BEST_EKO'],
    summaryAnswer: 'SOD VIOLATION (Rule SOD-PTP-02): Exactly 2 users can create purchase orders (ME21N/ME22N) and execute purchase order release approval (ME28/ME29N with release code P1/P2): User BUYER_SR_01 and User PLANT_MGR_03. This enables purchasing bypass of independent managerial approval.',
    keyInsights: [
      '2 Users have authorization for both PO Creation (ME21N) and Release (ME29N).',
      'BUYER_SR_01 obtained release code authorization during emergency coverage.',
      'PLANT_MGR_03 holds broad plant-wide composite role Z_COMP_PLANT_MGR.',
      'Automated fix: Restrict BUYER_SR_01 to ME21N and PLANT_MGR_03 to ME29N.'
    ],
    securityMetrics: [
      { label: 'Conflicting Users', value: '2 Users', status: 'negative' },
      { label: 'T-Codes Involved', value: 'ME21N vs ME29N', status: 'negative' },
      { label: 'Release Strategy', value: 'Object M_BEST_EKO', status: 'warning' },
      { label: 'Remediation', value: 'Role Split', status: 'positive' }
    ],
    breakdownData: [
      { category: 'BUYER_SR_01 (Thomas Clark)', value: 'ME21N + ME29N (Code P1)', variance: 'High Risk', detail: 'Roles: Z_MM_PO_BUYER + Z_MM_PO_RELEASE - Active since 2026-07-15' },
      { category: 'PLANT_MGR_03 (James Wilson)', value: 'ME21N + ME29N (Code P2)', variance: 'High Risk', detail: 'Role: Z_COMP_PLANT_MGR - Contains both buyer & approver child roles' }
    ],
    recommendedSapActions: [
      { actionName: 'Remove Release Role', tcode: 'SU01', description: 'De-assign role Z_MM_PO_RELEASE from BUYER_SR_01.' },
      { actionName: 'PO Audit Report', tcode: 'ME2N', description: 'Review all POs created and released by the same user ID.' }
    ]
  },
  {
    questionId: 'Q24',
    questionText: 'Which users can create and post journal entries?',
    category: 'Segregation of Duties (SoD)',
    sapSourceTables: ['AGR_1251', 'AGR_USERS', 'BKPF', 'BSEG', 'GRACUSER'],
    summaryAnswer: 'SOD VIOLATION (Rule SOD-RTR-02): 3 users in PRD Client 100 have authorizations to park/create journal entries (FV50, FB50) and directly post them into the general ledger without secondary review: Users GL_SPEC_01, GL_SPEC_02, and FIN_CONTROLLER_01. Direct posting capability is mitigated by automated four-eyes workflow in S/4HANA.',
    keyInsights: [
      '3 Users can park (FV50) and directly post (FB50) GL entries.',
      'S/4HANA Workflow WS00800045 enforces dual-signoff for journals exceeding $50,000.',
      'Mitigating Control MIT-GL-04 is actively logged with monthly Controller sampling.'
    ],
    securityMetrics: [
      { label: 'Users with Direct Post', value: '3 Users', status: 'warning' },
      { label: 'Workflow Threshold', value: '$50,000 Limit', status: 'positive' },
      { label: 'Mitigating Control', value: 'MIT-GL-04 Active', status: 'positive' },
      { label: 'Unposted Parked Docs', value: '14 Entries', status: 'neutral' }
    ],
    breakdownData: [
      { category: 'GL_SPEC_01 (Rachel Adams)', value: 'FV50 + FB50 Active', variance: 'Mitigated', detail: 'Workflow enforced above $50k; monthly spot checks compliant' },
      { category: 'GL_SPEC_02 (Carlos Mendez)', value: 'FV50 + FB50 Active', variance: 'Mitigated', detail: 'Restricted to Company Code 1000 and cost center group CC-PROD' },
      { category: 'FIN_CONTROLLER_01 (Lisa Wong)', value: 'FB50 Superuser', variance: 'Approved', detail: 'Period-end adjusting entries only with documented workpapers' }
    ],
    recommendedSapActions: [
      { actionName: 'Document Parking Workflow', tcode: 'FBV0', description: 'Display parked documents pending secondary supervisory posting.' },
      { actionName: 'General Ledger Line Items', tcode: 'FAGLL03', description: 'Review posted journal entry creators (USNAM) against approvers.' }
    ]
  },
  {
    questionId: 'Q25',
    questionText: 'Show users with conflicting procurement and payment access.',
    category: 'Segregation of Duties (SoD)',
    sapSourceTables: ['AGR_1251', 'AGR_USERS', 'GRACUSER', 'EKKO', 'REGUH'],
    summaryAnswer: 'In PRD Client 100, 3 users hold overlapping access across the Procure-to-Pay (PTP) cycle: 1 user holds Purchase Order Creation (ME21N) + Vendor Invoice Posting (MIRO/FB60), and 2 users hold Goods Receipt (MIGO) + Invoice Verification (MIRO). This violates the three-way matching segregation principle.',
    keyInsights: [
      '3 Users bridge multiple stages of the 3-way matching process.',
      'User BUYER_JR_03 can create PO (ME21N) and post vendor invoice (MIRO).',
      'Users WH_LEAD_01 and WH_LEAD_02 can perform Goods Receipt (MIGO) and MIRO.',
      'Root cause: Cross-functional warehouse and AP role assignment.'
    ],
    securityMetrics: [
      { label: 'PTP Cross-Access', value: '3 Users', status: 'negative' },
      { label: '3-Way Match Breach', value: 'High Risk', status: 'negative' },
      { label: 'PO to Invoice (ME21N/MIRO)', value: '1 User', status: 'negative' },
      { label: 'GR to Invoice (MIGO/MIRO)', value: '2 Users', status: 'negative' }
    ],
    breakdownData: [
      { category: 'BUYER_JR_03 (Lucas Gray)', value: 'ME21N + MIRO', variance: 'High Risk', detail: 'Procurement buyer mistakenly granted invoice verification role' },
      { category: 'WH_LEAD_01 (Vikram Patel)', value: 'MIGO + MIRO', variance: 'High Risk', detail: 'Warehouse lead granted invoice verification for return shipments' },
      { category: 'WH_LEAD_02 (Sophie Dupont)', value: 'MIGO + MIRO', variance: 'High Risk', detail: 'Plant 2000 warehouse receiving supervisor' }
    ],
    recommendedSapActions: [
      { actionName: 'Revoke MIRO Role', tcode: 'SU01', description: 'Remove role Z_MM_INVOICE_VERIFY from purchasing and warehouse personnel.' },
      { actionName: 'Three-Way Match Audit', tcode: 'MIR4', description: 'Verify invoice postings against purchase orders and material documents.' }
    ]
  },
  {
    questionId: 'Q26',
    questionText: 'Which SoD violations are high risk?',
    category: 'Segregation of Duties (SoD)',
    sapSourceTables: ['GRACRISK', 'GRACRISKT', 'GRACACTRULE', 'AGR_USERS'],
    summaryAnswer: 'The GRC Rule Matrix defines 4 active High-Risk SoD violations in PRD Client 100 affecting 7 distinct user accounts: 1) SOD-PTP-01: Vendor Master Maintenance vs Payment Execution (2 users); 2) SOD-PTP-02: Purchase Order Creation vs PO Release Approval (2 users); 3) SOD-OTC-03: Customer Master Bank Maintenance vs Credit Memo (2 users); 4) SOD-SEC-01: User Administration vs Role Administration (1 user).',
    keyInsights: [
      '4 High-Risk SoD violation rules active across 7 users.',
      '100% of high-risk violations are categorized as Material Financial Control risks (SOX Section 404).',
      'Action plan established to reduce high-risk violations to 0 within 5 business days.'
    ],
    securityMetrics: [
      { label: 'High-Risk Violations', value: '4 Rules (7 Users)', status: 'negative' },
      { label: 'SOX 404 Impact', value: 'High Exposure', status: 'negative' },
      { label: 'Remediation Pipeline', value: '7 Action Plans', status: 'positive' },
      { label: 'Target Clean Date', value: '5 Business Days', status: 'positive' }
    ],
    breakdownData: [
      { category: 'SOD-PTP-01 (Vendor vs Payment)', value: '2 Users (MSMITH_FI, AP_LEAD_02)', variance: 'Critical', detail: 'Direct potential for unauthorized cash outflow' },
      { category: 'SOD-PTP-02 (PO Create vs Release)', value: '2 Users (BUYER_SR_01, PLANT_MGR_03)', variance: 'Critical', detail: 'Bypasses procurement authorization thresholds' },
      { category: 'SOD-OTC-03 (Bank vs Credit Memo)', value: '2 Users (AR_LEAD_01, CUST_SPEC_04)', variance: 'High Risk', detail: 'Customer refund manipulation vulnerability' },
      { category: 'SOD-SEC-01 (User vs Role Admin)', value: '1 User (BASIS_JR_02)', variance: 'High Risk', detail: 'Can create user and grant arbitrary elevated authorizations' }
    ],
    recommendedSapActions: [
      { actionName: 'GRC Risk Management Cockpit', tcode: 'NWBC', description: 'Review high-risk violation dashboard and initiate automated remediation workflows.' },
      { actionName: 'Role Engineering Cleanse', tcode: 'PFCG', description: 'Restructure roles to eliminate conflicting transaction code couplings.' }
    ]
  },
  {
    questionId: 'Q27',
    questionText: 'Which conflicts have mitigating controls?',
    category: 'Segregation of Duties (SoD)',
    sapSourceTables: ['GRACMITIGATION', 'GRACUSERMIT', 'GRACCTRL', 'AGR_USERS'],
    summaryAnswer: 'In PRD Client 100, 12 of the 18 active SoD conflicts are covered by formal SAP GRC mitigating controls. Examples: MIT-GL-04 (Monthly Controller GL review), MIT-OTC-01 (Automated workflow credit block approval), and MIT-INV-02 (Independent quarterly physical inventory recount). All 12 have assigned control owners and documented sampling evidence.',
    keyInsights: [
      '12 Active SoD conflicts are formally mitigated and monitored.',
      'Control effectiveness score: 94.8% across monthly review cycles.',
      'All control evidence documents stored in SAP GRC Process Control repository.'
    ],
    securityMetrics: [
      { label: 'Mitigated Conflicts', value: '12 Conflicts', status: 'positive' },
      { label: 'Active Control Rules', value: '6 GRC Controls', status: 'positive' },
      { label: 'Control Owners', value: '4 Finance/Ops Leads', status: 'positive' },
      { label: 'Audit Effectiveness', value: '94.8% Pass', status: 'positive' }
    ],
    breakdownData: [
      { category: 'MIT-GL-04 (GL Post vs Park)', value: '5 Users Mitigated', variance: 'Valid', detail: 'Owner: Corporate Controller - Monthly 100% journal sampling' },
      { category: 'MIT-OTC-01 (Order vs Credit)', value: '3 Users Mitigated', variance: 'Valid', detail: 'Owner: Credit Manager - Automated workflow exception log' },
      { category: 'MIT-INV-02 (Count vs Adjust)', value: '4 Users Mitigated', variance: 'Valid', detail: 'Owner: Warehouse Director - Dual-signature adjustment signoff' }
    ],
    recommendedSapActions: [
      { actionName: 'GRC Mitigation Control Monitor', tcode: 'NWBC', description: 'Review assigned mitigation controls, control owners, and audit expiration dates.' },
      { actionName: 'Control Evidence Attachment', tcode: 'GRC_PC', description: 'Upload monthly control execution workpapers into SAP Process Control.' }
    ]
  },
  {
    questionId: 'Q28',
    questionText: 'Which mitigating controls have expired?',
    category: 'Segregation of Duties (SoD)',
    sapSourceTables: ['GRACUSERMIT', 'GRACCTRL', 'GRACRISK', 'AGR_USERS'],
    summaryAnswer: 'SECURITY AUDIT ALERT: 1 mitigating control assignment has expired: Control MIT-FI-02 (Supervisory Review of Vendor Master Changes) assigned to user AP_LEAD_02 expired on 2026-08-15 (11 days ago). Because this control has lapsed, User AP_LEAD_02 is currently operating with an unmitigated High-Risk SoD violation.',
    keyInsights: [
      '1 Mitigating control assignment (MIT-FI-02) expired on 2026-08-15.',
      'Leaves user AP_LEAD_02 with unmitigated vendor creation vs payment conflict.',
      'Immediate action required: Either re-certify mitigation control or de-provision role.'
    ],
    securityMetrics: [
      { label: 'Expired Mitigations', value: '1 Control Assignment', status: 'negative' },
      { label: 'Affected User', value: 'AP_LEAD_02', status: 'negative' },
      { label: 'Days Lapsed', value: '11 Days', status: 'warning' },
      { label: 'Risk State', value: 'Unmitigated', status: 'negative' }
    ],
    breakdownData: [
      { category: 'MIT-FI-02 on AP_LEAD_02', value: 'Expired 2026-08-15', variance: 'Unmitigated', detail: 'Risk SOD-PTP-01 (Vendor edit + payment) is now an active audit finding' }
    ],
    recommendedSapActions: [
      { actionName: 'Re-certify Mitigation Control', tcode: 'NWBC', description: 'Execute mitigation renewal workflow in GRC Access Control.' },
      { actionName: 'De-provision Access in SU01', tcode: 'SU01', description: 'Remove role Z_FI_AP_SENIOR to eliminate risk permanently.' }
    ]
  },
  {
    questionId: 'Q29',
    questionText: 'Show new SoD conflicts introduced this week.',
    category: 'Segregation of Duties (SoD)',
    sapSourceTables: ['GRACUSER', 'CDHDR_USER', 'CDPOS_USER', 'GRACREQ'],
    summaryAnswer: 'In the past 7 days, exactly 1 new SoD conflict was introduced in PRD Client 100: User BUYER_JR_03 was provisioned role Z_MM_INVOICE_VERIFY on 2026-08-23, which collided with their existing role Z_MM_PO_BUYER (Conflict Rule SOD-PTP-03: Purchase Order Creation vs Invoice Verification). Conflict analysis was bypassed during emergency manual role assignment.',
    keyInsights: [
      '1 New SoD conflict introduced on 2026-08-23.',
      'User BUYER_JR_03 created conflict SOD-PTP-03 (ME21N vs MIRO).',
      'Identified within 24 hours by automated nightly GRC batch risk analysis.',
      'Remediation ticket #SEC-9841 generated automatically.'
    ],
    securityMetrics: [
      { label: 'New Conflicts (7d)', value: '1 Conflict', status: 'warning' },
      { label: 'User Affected', value: 'BUYER_JR_03', status: 'warning' },
      { label: 'Rule Triggered', value: 'SOD-PTP-03 (ME21N/MIRO)', status: 'negative' },
      { label: 'Detection Time', value: '< 24 Hours', status: 'positive' }
    ],
    breakdownData: [
      { category: 'BUYER_JR_03 (Lucas Gray)', value: 'New Conflict (2026-08-23)', variance: 'Unmitigated', detail: 'Added Z_MM_INVOICE_VERIFY while holding Z_MM_PO_BUYER' }
    ],
    recommendedSapActions: [
      { actionName: 'Revoke Conflicting Role', tcode: 'SU01', description: 'Remove role Z_MM_INVOICE_VERIFY from BUYER_JR_03.' },
      { actionName: 'Audit Assignment Change', tcode: 'SUIM', description: 'Identify administrator who executed manual role assignment without GRC simulation.' }
    ]
  },
  {
    questionId: 'Q30',
    questionText: 'Which role changes would remove the largest number of SoD risks?',
    category: 'Segregation of Duties (SoD)',
    sapSourceTables: ['GRACRISK', 'AGR_USERS', 'AGR_1251', 'GRACACTRULE'],
    summaryAnswer: 'AI Security Optimization Analysis indicates that removing or splitting just 2 specific composite/broad roles will eliminate 14 out of the 18 (77.8%) total SoD conflicts in PRD Client 100: 1) Revoking role Z_FI_AP_SENIOR from 2 users removes 6 SoD conflicts; 2) Splitting composite role Z_CROSS_AP_BUYER removes 8 SoD conflicts across 12 users.',
    keyInsights: [
      'Targeted remediation of 2 roles resolves 77.8% of all enterprise SoD risks.',
      'Action 1: Revoke Z_FI_AP_SENIOR from MSMITH_FI and AP_LEAD_02 (Resolves 6 conflicts).',
      'Action 2: Split Z_CROSS_AP_BUYER into separate Buyer and Invoice roles (Resolves 8 conflicts).',
      'Achieves near-zero unmitigated SoD posture with zero impact on operational productivity.'
    ],
    securityMetrics: [
      { label: 'Total SoD Removable', value: '14 of 18 (77.8%)', status: 'positive' },
      { label: 'Key Roles to Modify', value: '2 Roles', status: 'positive' },
      { label: 'Users Impacted', value: '14 Users', status: 'positive' },
      { label: 'Implementation Effort', value: '2 Hours (Low)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Split Z_CROSS_AP_BUYER', value: '8 SoD Conflicts Eliminated', variance: 'Highest Impact', detail: 'Separates ME21N and MIRO/FB60 across 12 purchasing team members' },
      { category: 'Revoke Z_FI_AP_SENIOR from 2 Users', value: '6 SoD Conflicts Eliminated', variance: 'High Impact', detail: 'Removes FK01 vendor change from users executing F110 payment runs' }
    ],
    recommendedSapActions: [
      { actionName: 'Role Redesign in PFCG', tcode: 'PFCG', description: 'Split composite role Z_CROSS_AP_BUYER into two distinct single roles.' },
      { actionName: 'Batch Role De-assignment', tcode: 'SU10', description: 'Mass remove redundant role Z_FI_AP_SENIOR from accounting staff.' }
    ]
  },

  // =========================================================================
  // PILLAR 4: PRIVILEGED & FIREFIGHTER ACCESS (Q31 - Q40)
  // =========================================================================
  {
    questionId: 'Q31',
    questionText: 'Show all firefighter users.',
    category: 'Privileged & Firefighter Access',
    sapSourceTables: ['GRACFFUSER', 'GRACFFOWNER', 'GRACFFREASON', 'USR02'],
    summaryAnswer: 'In PRD Client 100, SAP GRC Emergency Access Management (EAM / Firefighter) defines 4 Firefighter IDs (FFIDs): FF_BASIS_01 (Basis Admin), FF_FI_01 (Finance Support), FF_SD_01 (Sales/Logistics Emergency), and FF_DEVELOPER_01 (ABAP Debug). There are 8 authorized Firefighter Controllers and 12 authorized Firefighter Owners.',
    keyInsights: [
      '4 Firefighter ID accounts configured in GRC EAM repository.',
      'All 4 FFIDs are User Type S (Service) with randomized passwords managed by GRC SPM vault.',
      'Access requires dual-level reason code entry and ticketing system reference (ServiceNow).'
    ],
    securityMetrics: [
      { label: 'Firefighter IDs (FFIDs)', value: '4 Accounts', status: 'positive' },
      { label: 'Authorized Users', value: '12 Users', status: 'neutral' },
      { label: 'Controllers / Approvers', value: '8 Personnel', status: 'positive' },
      { label: 'Vault Protection', value: '100% GRC EAM', status: 'positive' }
    ],
    breakdownData: [
      { category: 'FF_BASIS_01', value: 'Basis Admin Emergency', variance: 'Active', detail: 'Owner: Basis Lead - Grants CCMS, spool, and background job correction' },
      { category: 'FF_FI_01', value: 'Financial Emergency', variance: 'Active', detail: 'Owner: Finance Controller - Grants GL period unlock & reconciliation fix' },
      { category: 'FF_SD_01', value: 'Logistics Emergency', variance: 'Active', detail: 'Owner: Supply Chain VP - Grants delivery & billing document reset' },
      { category: 'FF_DEVELOPER_01', value: 'ABAP Debug & Trace', variance: 'Active', detail: 'Owner: Development Lead - Display-only debug in PRD' }
    ],
    recommendedSapActions: [
      { actionName: 'Firefighter ID Maintenance', tcode: '/GRCPI/GRIA_SPM', description: 'Display Firefighter ID assignments, owners, and controllers in EAM.' },
      { actionName: 'GRC EAM Launchpad', tcode: 'NWBC', description: 'Manage emergency access request assignments and controller notifications.' }
    ]
  },
  {
    questionId: 'Q32',
    questionText: 'Who used firefighter access today?',
    category: 'Privileged & Firefighter Access',
    sapSourceTables: ['GRACFFLOG', 'SM20', 'CDHDR', 'CDPOS', 'GRACFFUSER'],
    summaryAnswer: 'Today, exactly 2 users initiated emergency Firefighter sessions in PRD Client 100: 1) User ADMIN_BASIS_02 utilized FF_BASIS_01 from 08:30 to 09:45 UTC (Reason: Background Job SAP_REORG_SPOOL failure resolution, Ticket #INC-94821); 2) User CONSULT_FI_04 utilized FF_FI_01 from 11:15 to 12:00 UTC (Reason: GL Period 08 Re-opening, Ticket #INC-94830).',
    keyInsights: [
      '2 Firefighter sessions executed today with valid ServiceNow ticket references.',
      'Session 1 (Basis): Duration 1h 15m - 12 transactions executed (SM37, SP01, SM50).',
      'Session 2 (Finance): Duration 45m - 4 transactions executed (OB52, FB03).',
      '100% System audit logs captured and routed to designated Controllers for review.'
    ],
    securityMetrics: [
      { label: 'Sessions Today', value: '2 Sessions', status: 'neutral' },
      { label: 'Total Duration', value: '2 Hours 00 Min', status: 'neutral' },
      { label: 'Valid Ticket Refs', value: '2 / 2 (100%)', status: 'positive' },
      { label: 'Controller Logs Sent', value: '2 / 2 Dispatched', status: 'positive' }
    ],
    breakdownData: [
      { category: 'ADMIN_BASIS_02 (FF_BASIS_01)', value: '08:30 - 09:45 UTC (1h 15m)', variance: 'Reviewed', detail: 'Resolved spool bottleneck - T-Codes: SM37, SP01, SM50, SM21' },
      { category: 'CONSULT_FI_04 (FF_FI_01)', value: '11:15 - 12:00 UTC (45m)', variance: 'Pending Review', detail: 'Reopened period 08 for accrual - T-Codes: OB52, FBL3N' }
    ],
    recommendedSapActions: [
      { actionName: 'EAM Session Log Review', tcode: 'GRAC_EAM_LOG', description: 'Review executed transaction codes, change documents, and terminal details.' },
      { actionName: 'Security Audit Log Trace', tcode: 'SM20', description: 'Cross-reference Firefighter terminal IP and audit event logs.' }
    ]
  },
  {
    questionId: 'Q33',
    questionText: 'What did User ABC do during firefighter access?',
    category: 'Privileged & Firefighter Access',
    sapSourceTables: ['GRACFFLOG', 'SM20', 'CDHDR', 'CDPOS', 'DBTABLOG'],
    summaryAnswer: 'Detailed audit trace for User ABC (CONSULT_FI_04) during Firefighter session on FF_FI_01 (2026-08-26 11:15-12:00 UTC): Executed transaction OB52 to modify posting period variant 1000 (opened Account Type S for Period 08), executed FBL3N to verify general ledger balance 113100, and executed OB52 again at 11:52 UTC to re-lock Period 08. No table buffer manipulation or unauthorized data changes occurred.',
    keyInsights: [
      'Chronological action log: 3 transactions executed across 45 minutes.',
      'Change Document Recorded: Table T001B updated via OB52 (Posting Period Variant 1000).',
      'Safety check: Variant properly closed and re-locked at 11:52 UTC.',
      'No critical table manipulation (SE16N/SM30) detected.'
    ],
    securityMetrics: [
      { label: 'Session Duration', value: '45 Minutes', status: 'positive' },
      { label: 'Transactions Run', value: 'OB52, FBL3N, FB03', status: 'positive' },
      { label: 'Table Changes', value: '1 Table (T001B)', status: 'positive' },
      { label: 'Re-lock Status', value: 'Confirmed Locked', status: 'positive' }
    ],
    breakdownData: [
      { category: '11:16:02 UTC', value: 'Executed OB52', variance: 'Authorized', detail: 'Modified T001B: Changed Period 08 closing date to 2026-08-26' },
      { category: '11:28:44 UTC', value: 'Executed FBL3N', variance: 'Authorized', detail: 'Displayed GL account line items for GL 113100 in Company Code 1000' },
      { category: '11:52:10 UTC', value: 'Executed OB52', variance: 'Authorized', detail: 'Reverted T001B: Locked Period 08 to prevent further posting' },
      { category: '11:59:30 UTC', value: 'Session Terminated', variance: 'Clean Exit', detail: 'Firefighter ID released back to GRC SPM vault' }
    ],
    recommendedSapActions: [
      { actionName: 'EAM Audit Log Sign-Off', tcode: 'NWBC', description: 'Controller executes formal digital signature review and closure of session log.' },
      { actionName: 'Table Change Document Viewer', tcode: 'SCU3', description: 'Display table history log for T001B to verify posting period delta.' }
    ]
  },
  {
    questionId: 'Q34',
    questionText: 'Show unreviewed firefighter sessions.',
    category: 'Privileged & Firefighter Access',
    sapSourceTables: ['GRACFFLOG', 'GRACFFOWNER', 'GRACCTRL', 'GRACNOTIF'],
    summaryAnswer: 'In PRD Client 100, exactly 3 Firefighter emergency sessions are currently pending controller review and sign-off. 2 sessions are within the 48-hour SLA window, while 1 session (executed by DEVELOPER_02 on 2026-08-21, 5 days ago) has breached the corporate 48-hour review SLA.',
    keyInsights: [
      '3 Total unreviewed Firefighter sessions in GRC EAM.',
      '1 SLA Breach (> 48 hours): Session FF_DEV_01 executed on 2026-08-21.',
      'Automated escalation reminder dispatched to Controller LEAD_DEV_MGR.'
    ],
    securityMetrics: [
      { label: 'Unreviewed Sessions', value: '3 Sessions', status: 'warning' },
      { label: 'Within 48h SLA', value: '2 Sessions', status: 'positive' },
      { label: 'SLA Breached (> 48h)', value: '1 Session', status: 'negative' },
      { label: 'Assigned Controllers', value: '2 Controllers', status: 'neutral' }
    ],
    breakdownData: [
      { category: 'DEVELOPER_02 (FF_DEVELOPER_01)', value: 'Executed 2026-08-21', variance: 'SLA BREACH (5d)', detail: 'Debug trace in PRD - Controller LEAD_DEV_MGR pending sign-off' },
      { category: 'ADMIN_BASIS_02 (FF_BASIS_01)', value: 'Executed 2026-08-26', variance: 'Within SLA (4h)', detail: 'Spool fix - Controller BASIS_LEAD assigned' },
      { category: 'CONSULT_FI_04 (FF_FI_01)', value: 'Executed 2026-08-26', variance: 'Within SLA (2h)', detail: 'GL period fix - Controller FI_CONTROLLER assigned' }
    ],
    recommendedSapActions: [
      { actionName: 'EAM Controller Inbox', tcode: 'NWBC', description: 'Controller accesses GRC Inbox to review transaction logs and submit sign-off.' },
      { actionName: 'SLA Escalation Trigger', tcode: 'SWI1', description: 'Escalate overdue firefighter review to Chief Information Security Officer (CISO).' }
    ]
  },
  {
    questionId: 'Q35',
    questionText: 'Which privileged users performed sensitive transactions?',
    category: 'Privileged & Firefighter Access',
    sapSourceTables: ['SM20', 'GRACFFLOG', 'CDHDR', 'CDPOS', 'USR02'],
    summaryAnswer: 'In the past 24 hours, 4 privileged users executed sensitive transactions in PRD Client 100: 1 user executed OB52 (Posting Period change), 1 user executed SCC4 (Display Client Configuration), 1 user executed SM59 (RFC Destination display), and 1 user executed SE16N with restricted table display. Zero unauthorized table modifications or debug-replace events occurred.',
    keyInsights: [
      '4 Privileged users executed sensitive administrative transactions.',
      'All 4 executions matched approved change requests or Firefighter sessions.',
      'Zero SE16N &SAP_EDIT modifications detected in SM20 audit logs.'
    ],
    securityMetrics: [
      { label: 'Sensitive Tx Executed', value: '4 Instances', status: 'neutral' },
      { label: 'Authorized / Documented', value: '4 / 4 (100%)', status: 'positive' },
      { label: 'Direct Table Edits', value: '0 (Clean)', status: 'positive' },
      { label: 'Debug/Replace Events', value: '0 (Clean)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'CONSULT_FI_04 (FF_FI_01)', value: 'OB52 (Period Variant)', variance: 'Approved (EAM)', detail: 'Ticket #INC-94830 - Period 08 temporary adjustment' },
      { category: 'BASIS_ADMIN_01', value: 'SCC4 (Client Display)', variance: 'Approved (Ops)', detail: 'Verified client lock setting (No changes to client settings)' },
      { category: 'BASIS_ADMIN_02', value: 'SM59 (RFC Destinations)', variance: 'Approved (Ops)', detail: 'Tested CPI B2B RFC connection latency' },
      { category: 'SUPPORT_ANALYST_01', value: 'SE16N (Display EKKO)', variance: 'Approved (Display)', detail: 'Read-only display of purchasing document header' }
    ],
    recommendedSapActions: [
      { actionName: 'Security Audit Log Analysis', tcode: 'SM20', description: 'Filter SM20 for Transaction Start events on sensitive T-Code catalog.' },
      { actionName: 'Table Logging Verification', tcode: 'SCU3', description: 'Inspect DBTABLOG table change log for customizable tables.' }
    ]
  },
  {
    questionId: 'Q36',
    questionText: 'Show emergency-access activity from the last 24 hours.',
    category: 'Privileged & Firefighter Access',
    sapSourceTables: ['GRACFFLOG', 'SM20', 'CDHDR', 'CDPOS', 'GRACFFUSER'],
    summaryAnswer: 'In the last 24 hours, exactly 2 Emergency Access Management (Firefighter) sessions were launched in PRD Client 100 totaling 2.0 hours of active elevation. 16 distinct transactions were executed across Basis administration and Finance configuration. 0 critical system parameter alterations or unmonitored code changes were detected.',
    keyInsights: [
      '2 Emergency access sessions initiated in the past 24 hours.',
      'Peak emergency elevation window: 08:30 - 09:45 UTC (Basis spool maintenance).',
      'Complete audit trail synchronized to GRC repository.'
    ],
    securityMetrics: [
      { label: '24h Sessions', value: '2 Sessions', status: 'positive' },
      { label: 'Active Duration', value: '120 Minutes', status: 'neutral' },
      { label: 'Executed T-Codes', value: '16 Transactions', status: 'neutral' },
      { label: 'Exceptions Detected', value: '0 Exceptions', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Session #4091 (FF_BASIS_01)', value: '08:30 - 09:45 UTC', variance: 'Completed', detail: 'User: ADMIN_BASIS_02 - Spool buffer cleanup and background job restart' },
      { category: 'Session #4092 (FF_FI_01)', value: '11:15 - 12:00 UTC', variance: 'Completed', detail: 'User: CONSULT_FI_04 - GL period unlock and balance verification' }
    ],
    recommendedSapActions: [
      { actionName: 'GRC Emergency Access Log', tcode: '/GRCPI/GRIA_EAM', description: 'Display complete consolidated 24-hour emergency activity log.' },
      { actionName: 'Audit Trail Export', tcode: 'SM20', description: 'Export security audit log entries for Firefighter IDs to PDF/Excel for external audit.' }
    ]
  },
  {
    questionId: 'Q37',
    questionText: 'Which firefighter IDs are assigned to too many users?',
    category: 'Privileged & Firefighter Access',
    sapSourceTables: ['GRACFFUSER', 'GRACFFOWNER', 'GRACUSER'],
    summaryAnswer: 'Firefighter ID distribution audit identifies that FF_BASIS_01 is currently assigned to 6 distinct Basis team members simultaneously. Best-practice security governance recommends a maximum of 3 authorized users per Firefighter ID to avoid concurrent checkout lockouts and improve accountability attribution.',
    keyInsights: [
      'FF_BASIS_01 assigned to 6 users (Exceeds 3-user recommendation).',
      'FF_FI_01 assigned to 3 users (Optimal).',
      'FF_SD_01 assigned to 2 users (Optimal).',
      'Recommendation: Create dedicated secondary FFID FF_BASIS_02 to balance assignment load.'
    ],
    securityMetrics: [
      { label: 'FF_BASIS_01 Users', value: '6 Users (High)', status: 'warning' },
      { label: 'FF_FI_01 Users', value: '3 Users (Optimal)', status: 'positive' },
      { label: 'FF_SD_01 Users', value: '2 Users (Optimal)', status: 'positive' },
      { label: 'Governance Threshold', value: '<= 3 Users / ID', status: 'neutral' }
    ],
    breakdownData: [
      { category: 'FF_BASIS_01 Assignments', value: '6 Personnel Assigned', variance: 'Over-Allocated', detail: 'ADMIN_BASIS_01, ADMIN_BASIS_02, BASIS_SR_01, BASIS_JR_01, BASIS_JR_02, EXT_CONSULT_01' },
      { category: 'FF_FI_01 Assignments', value: '3 Personnel Assigned', variance: 'Compliant', detail: 'CONSULT_FI_01, CONSULT_FI_04, FIN_CONTROLLER_01' }
    ],
    recommendedSapActions: [
      { actionName: 'Rebalance Firefighter Assignment', tcode: 'NWBC', description: 'Remove inactive Basis administrators from FF_BASIS_01 access pool.' },
      { actionName: 'Create Secondary FFID', tcode: 'SU01', description: 'Provision FF_BASIS_02 to segregate primary and secondary operations.' }
    ]
  },
  {
    questionId: 'Q38',
    questionText: 'Which emergency-access sessions lacked approval?',
    category: 'Privileged & Firefighter Access',
    sapSourceTables: ['GRACFFLOG', 'GRACREQ', 'SM20', 'GRACFFUSER'],
    summaryAnswer: 'ZERO unapproved emergency access sessions occurred in PRD Client 100 (100% Policy Adherence). All Firefighter checkouts require mandatory multi-factor authentication and a pre-approved ServiceNow change/incident ticket number before credentials are released by GRC SPM.',
    keyInsights: [
      '0 Unapproved or backdoor emergency sessions detected in PRD.',
      'GRC SPM Vault enforces automated API integration with ServiceNow ITSM.',
      'All emergency checkouts validated against active Incident / Change numbers.'
    ],
    securityMetrics: [
      { label: 'Unapproved Sessions', value: '0 Sessions', status: 'positive' },
      { label: 'Policy Adherence', value: '100% Pass', status: 'positive' },
      { label: 'ITSM Ticket Validation', value: 'Automated API', status: 'positive' },
      { label: 'Audit Risk', value: 'Zero / Clean', status: 'positive' }
    ],
    breakdownData: [
      { category: 'All 2026 YTD Sessions (84 Total)', value: '84 / 84 Pre-Approved', variance: '100% Clean', detail: 'All sessions tied to valid ServiceNow Incident or Emergency Change tickets' }
    ],
    recommendedSapActions: [
      { actionName: 'EAM Reason Code Audit', tcode: 'NWBC', description: 'Review reason codes and ticket bindings for all historic emergency sessions.' },
      { actionName: 'Emergency Access Configuration', tcode: 'SPRO', description: 'Verify mandatory ticket verification setting in GRC EAM global parameters.' }
    ]
  },
  {
    questionId: 'Q39',
    questionText: 'Show privileged actions affecting finance or payroll.',
    category: 'Privileged & Firefighter Access',
    sapSourceTables: ['SM20', 'CDHDR', 'CDPOS', 'P_ORGIN', 'T001B', 'PA0008'],
    summaryAnswer: 'In the past 30 days, 2 privileged actions affected financial and payroll master configurations in PRD Client 100: 1) Temporary posting period variant unlock on 2026-08-26 (FF_FI_01, OB52); 2) Emergency payroll schema tax table update on 2026-08-12 (FF_BASIS_01 via approved transport TR-S4H-89410). No unauthorized salary alterations or direct ledger manipulations occurred.',
    keyInsights: [
      '2 Documented privileged actions affecting financial configurations in 30 days.',
      'Both actions underwent independent supervisory review and SOX compliance approval.',
      'HR infotype 0008 (Basic Pay) remained completely unmodified during all privileged sessions.'
    ],
    securityMetrics: [
      { label: 'Privileged FI/Payroll Actions', value: '2 Actions (30d)', status: 'positive' },
      { label: 'Authorized / Documented', value: '2 / 2 (100%)', status: 'positive' },
      { label: 'Payroll Wage Impact', value: '0 (Clean)', status: 'positive' },
      { label: 'SOX Compliance Review', value: 'Signed Off', status: 'positive' }
    ],
    breakdownData: [
      { category: 'OB52 Posting Period Unlock', value: '2026-08-26 11:16 UTC', variance: 'Approved', detail: 'User CONSULT_FI_04 - Period 08 temporary adjustment - Re-locked at 11:52 UTC' },
      { category: 'Payroll Tax Table Update', value: '2026-08-12 22:10 UTC', variance: 'Approved', detail: 'Emergency tax scale adjustment via transport TR-S4H-89410 - Approved by HR VP' }
    ],
    recommendedSapActions: [
      { actionName: 'Read Access Logging for HR/FI', tcode: 'SRAL_MONITOR', description: 'Inspect Read Access Logs for sensitive salary and bank IBAN master data.' },
      { actionName: 'Financial Audit Trail Report', tcode: 'S_ALR_87012293', description: 'Display audit trail of document changes for finance accounting documents.' }
    ]
  },
  {
    questionId: 'Q40',
    questionText: 'Which emergency-access activities require investigation?',
    category: 'Privileged & Firefighter Access',
    sapSourceTables: ['GRACFFLOG', 'SM20', 'CDHDR', 'CDPOS', 'AI_ANOMALY'],
    summaryAnswer: 'AI Security Anomaly Detection flags 1 Firefighter activity for supervisor investigation: On 2026-08-21 at 23:45 UTC, during Firefighter session FF_DEVELOPER_01 (User DEVELOPER_02), the user executed transaction SE16N and displayed table USR02. While no data modifications occurred, displaying user password hash tables in production is outside standard troubleshooting scope.',
    keyInsights: [
      '1 Activity flagged for management investigation: SE16N display of table USR02.',
      'No data modifications were attempted (Read-only query).',
      'Controller LEAD_DEV_MGR notified to conduct interview with developer before session sign-off.'
    ],
    securityMetrics: [
      { label: 'Activities for Investigation', value: '1 Event', status: 'warning' },
      { label: 'Severity Rating', value: 'Medium (Anomaly)', status: 'warning' },
      { label: 'Data Alteration', value: '0 (Read-Only)', status: 'positive' },
      { label: 'Controller Sign-off', value: 'Held Pending Review', status: 'warning' }
    ],
    breakdownData: [
      { category: 'DEVELOPER_02 (FF_DEVELOPER_01)', value: '2026-08-21 23:45 UTC', variance: 'Investigation Req', detail: 'SE16N display on table USR02 - Controller review hold initiated' }
    ],
    recommendedSapActions: [
      { actionName: 'Initiate Investigation Workflow', tcode: 'NWBC', description: 'Flag session in GRC EAM and request formal written developer explanation.' },
      { actionName: 'Restrict SE16N Authorization', tcode: 'PFCG', description: 'Remove table USR02 authorization object S_TABU_DIS from development emergency roles.' }
    ]
  },

  // =========================================================================
  // PILLAR 5: AUDIT, COMPLIANCE & RISK (Q41 - Q50)
  // =========================================================================
  {
    questionId: 'Q41',
    questionText: 'Show failed login attempts.',
    category: 'Audit, Compliance & Risk',
    sapSourceTables: ['SM20', 'USR02', 'SALogger', 'SECURITY_LOG'],
    summaryAnswer: 'In the past 24 hours, the SAP Security Audit Log (SM20) recorded 42 failed logon attempts across PRD Client 100: 28 incorrect password attempts on single service account DEV_USER_03 (automated script misconfiguration), 12 user password typos across dialog end-users, and 2 attempts against locked accounts.',
    keyInsights: [
      '42 Total failed logon attempts in the last 24 hours.',
      '28 Failed attempts originated from IP 10.42.18.91 targeting DEV_USER_03.',
      'Script updated at 10:15 UTC, resolving the repetitive failure loop.',
      'No distributed brute-force or credential stuffing patterns detected.'
    ],
    securityMetrics: [
      { label: 'Failed Logons (24h)', value: '42 Attempts', status: 'warning' },
      { label: 'Repeated Script Failures', value: '28 Attempts', status: 'warning' },
      { label: 'Dialog User Typos', value: '12 Attempts', status: 'positive' },
      { label: 'Threat Status', value: 'Internal / Resolved', status: 'positive' }
    ],
    breakdownData: [
      { category: 'DEV_USER_03 (IP: 10.42.18.91)', value: '28 Failed Attempts', variance: 'Script Loop', detail: 'Cron job with obsolete password - Script stopped and credential renewed' },
      { category: 'Standard Dialog Users (6 Users)', value: '12 Failed Attempts', variance: 'User Typos', detail: 'Morning shift logon typos - 2 accounts reset via self-service' },
      { category: 'Locked Accounts (2 Users)', value: '2 Attempts', variance: 'Rejected', detail: 'Logon rejected at kernel level due to UFLAG = 128' }
    ],
    recommendedSapActions: [
      { actionName: 'Security Audit Log Viewer', tcode: 'SM20', description: 'Filter for Event AU1 (Logon failed - wrong password) to analyze origin terminals.' },
      { actionName: 'Security Audit Configuration', tcode: 'SM19', description: 'Verify static and dynamic audit filters for all dialog and RFC logon classes.' }
    ]
  },
  {
    questionId: 'Q42',
    questionText: 'Which users are generating repeated authorization failures?',
    category: 'Audit, Compliance & Risk',
    sapSourceTables: ['SU53', 'USR07', 'SM20', 'ST01', 'AUTH_BUFFER'],
    summaryAnswer: 'In PRD Client 100, 3 users are generating elevated SU53 authorization failure rates today: 1) BUYER_JR_02 (18 failures on authorization object M_BEST_EKO - missing purchasing org 2000 access); 2) WAREHOUSE_OP_09 (14 failures on object /SCWM/PRDO - missing storage bin confirmation); 3) AP_CLERK_11 (8 failures on object F_BKPF_BUK - company code 3000).',
    keyInsights: [
      '3 Users account for 82% of all daily authorization check failures.',
      'Primary root cause: Missing organizational level values in derived PFCG roles.',
      'Automated SU24 proposals generated to update organizational authorizations.'
    ],
    securityMetrics: [
      { label: 'Users with High Failures', value: '3 Users', status: 'warning' },
      { label: 'Total SU53 Failures', value: '40 Failures', status: 'warning' },
      { label: 'Missing Org Levels', value: '3 Org Units', status: 'neutral' },
      { label: 'Auto-Fix Available', value: 'Ready in GRC', status: 'positive' }
    ],
    breakdownData: [
      { category: 'BUYER_JR_02 (Buyer)', value: '18 Failures (M_BEST_EKO)', variance: 'Missing EKORG 2000', detail: 'Attempting to create PO in European Purchasing Org' },
      { category: 'WAREHOUSE_OP_09 (Warehouse)', value: '14 Failures (/SCWM/PRDO)', variance: 'Missing /SCWM/LGN', detail: 'Outbound delivery picking in Bin Zone B' },
      { category: 'AP_CLERK_11 (Accounting)', value: '8 Failures (F_BKPF_BUK)', variance: 'Missing BUKRS 3000', detail: 'Posting supplier invoice for APAC subsidiary' }
    ],
    recommendedSapActions: [
      { actionName: 'SU53 Authorization Analysis', tcode: 'SU53', description: 'Review exact failed authorization object, field values, and return codes (RC=4).' },
      { actionName: 'Role Maintenance in PFCG', tcode: 'PFCG', description: 'Update organizational level values in derived role to grant legitimate access.' }
    ]
  },
  {
    questionId: 'Q43',
    questionText: 'Show critical SU53 failures.',
    category: 'Audit, Compliance & Risk',
    sapSourceTables: ['SU53', 'SM20', 'KERNEL_AUTH', 'TOA01'],
    summaryAnswer: 'CRITICAL AUTHORIZATION FAILURE DETECTED: Today at 09:22 UTC, user ANALYST_FIN attempted to execute transaction SE16N to access table BSEG with authorization object S_TABU_DIS (DICBERCLS = &NC&). The request was rejected by the S/4HANA kernel with Return Code RC=4. The attempt was logged in SM20 and flagged for security review.',
    keyInsights: [
      '1 Critical authorization failure: SE16N table access attempt on financial table BSEG.',
      'S_TABU_DIS (DICBERCLS &NC&) successfully blocked by kernel security check.',
      'User interviewed: Attempted to export raw line items for Excel audit report.',
      'Educated to utilize standard authorized reporting transaction FAGLL03 instead.'
    ],
    securityMetrics: [
      { label: 'Critical Failures', value: '1 Incident', status: 'warning' },
      { label: 'Target Transaction', value: 'SE16N', status: 'warning' },
      { label: 'Kernel Defense', value: 'BLOCKED (RC=4)', status: 'positive' },
      { label: 'Data Compromise', value: 'Zero / Prevented', status: 'positive' }
    ],
    breakdownData: [
      { category: 'ANALYST_FIN (SE16N on BSEG)', value: '2026-08-26 09:22 UTC', variance: 'Blocked by Kernel', detail: 'Missing S_TABU_DIS with &NC& - User redirected to authorized FAGLL03' }
    ],
    recommendedSapActions: [
      { actionName: 'Display Failed Authorization Trace', tcode: 'SU53', description: 'Inspect buffer snapshot for user ANALYST_FIN.' },
      { actionName: 'Alternative Reporting Guidance', tcode: 'FAGLL03', description: 'Verify user has proper authorized access to standard GL line item display.' }
    ]
  },
  {
    questionId: 'Q44',
    questionText: 'Which users accessed sensitive financial data today?',
    category: 'Audit, Compliance & Risk',
    sapSourceTables: ['SRAL_MONITOR', 'RAL_LOG', 'SM20', 'BUT000', 'REGUH'],
    summaryAnswer: 'SAP Read Access Logging (RAL) recorded 14 users accessing sensitive financial and personal data today: 8 users displayed Vendor Bank Account IBANs via BP/FK03, 4 users executed automated payment proposal displays in F110, and 2 users viewed executive payroll cost centers in KS13. 100% of read accesses were within approved business job roles.',
    keyInsights: [
      '14 Users accessed sensitive financial fields protected by Read Access Logging (RAL).',
      'All read events matched active business authorizations (AP clerks and treasury analysts).',
      'No anomalous bulk data export or off-hours read spike detected.'
    ],
    securityMetrics: [
      { label: 'Users with RAL Access', value: '14 Users', status: 'positive' },
      { label: 'Bank IBAN Views', value: '8 Personnel', status: 'neutral' },
      { label: 'Payment Proposal Views', value: '4 Personnel', status: 'neutral' },
      { label: 'RAL Compliance', value: '100% Logged', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Vendor Bank Details (IBAN/SWIFT)', value: '8 AP Users', variance: 'Authorized', detail: 'Accessed during vendor invoice verification and master data audit' },
      { category: 'Payment Run Proposals (REGUH)', value: '4 Treasury Users', variance: 'Authorized', detail: 'Accessed during daily payment proposal validation' },
      { category: 'Cost Center Payroll Totals (KS13)', value: '2 Controllers', variance: 'Authorized', detail: 'Accessed during monthly variance reporting' }
    ],
    recommendedSapActions: [
      { actionName: 'Read Access Log Monitor', tcode: 'SRAL_MONITOR', description: 'Display Read Access Log audit records by channel, business user, and data domain.' },
      { actionName: 'RAL Configuration Cockpit', tcode: 'SRALCONFIG', description: 'Review logged UI fields and Dynpro recording configurations.' }
    ]
  },
  {
    questionId: 'Q45',
    questionText: 'Show role changes made directly in production.',
    category: 'Audit, Compliance & Risk',
    sapSourceTables: ['AGR_DEFINE', 'AGR_1251', 'CDHDR', 'CDPOS', 'SE09'],
    summaryAnswer: 'CRITICAL AUDIT EXCEPTION: Exactly 1 PFCG role modification was performed directly in PRD Client 100 on 2026-08-11: Role Z_FI_AP_SUPERUSER was edited by user BASIS_ADMIN_01, bypassing the standard STMS transport pipeline. Client changeability in SCC4 was temporarily opened for 15 minutes during emergency troubleshooting.',
    keyInsights: [
      '1 Direct role modification detected in Production Client 100.',
      'Role Z_FI_AP_SUPERUSER edited directly on 2026-08-11 (Violates STMS change policy).',
      'SCC4 was opened temporarily and re-locked at 14:45 UTC.',
      'Remediation action: Revert role in PRD and re-transport properly from DEV via STMS.'
    ],
    securityMetrics: [
      { label: 'Direct PRD Changes', value: '1 Role Edit', status: 'negative' },
      { label: 'Role Affected', value: 'Z_FI_AP_SUPERUSER', status: 'negative' },
      { label: 'User Responsible', value: 'BASIS_ADMIN_01', status: 'warning' },
      { label: 'Remediation Status', value: 'STMS Re-import Req', status: 'warning' }
    ],
    breakdownData: [
      { category: 'Z_FI_AP_SUPERUSER', value: 'Direct PRD Edit (2026-08-11)', variance: 'AUDIT EXCEPTION', detail: 'Added object S_TABU_DIS directly in PRD Client 100 - Must be reverted' }
    ],
    recommendedSapActions: [
      { actionName: 'Revert Direct Role Edit', tcode: 'PFCG', description: 'Import clean version from DEV via STMS transport to overwrite PRD modification.' },
      { actionName: 'Lock Client Configuration in SCC4', tcode: 'SCC4', description: 'Verify PRD Client 100 is set to "No changes allowed to Repository and cross-client Customizing".' }
    ]
  },
  {
    questionId: 'Q46',
    questionText: 'Which users have excessive access compared with their peers?',
    category: 'Audit, Compliance & Risk',
    sapSourceTables: ['HRP1001', 'AGR_USERS', 'AGR_1251', 'AI_CLUSTERING'],
    summaryAnswer: 'AI Peer Group Analysis identifies 4 users with significant access accumulation (> 150% above organizational job cluster median): 1) MSMITH_FI (Accounts Payable Lead - 6 roles vs peer median 3 roles, +100%); 2) WH_SUPERVISOR_02 (Warehouse Supervisor - 8 roles vs peer median 3 roles, +166%); 3) SD_REP_07 (Sales Rep - 7 roles vs peer median 2 roles, +250%); 4) MM_BUYER_09 (Buyer - 5 roles vs peer median 2 roles, +150%).',
    keyInsights: [
      '4 Users identified with significant privilege creep from historic project roles.',
      'Access accumulation creates unnecessary SoD risk and audit scrutiny.',
      'Peer alignment access review campaign prepared to de-provision obsolete roles.'
    ],
    securityMetrics: [
      { label: 'Outlier Users', value: '4 Accounts', status: 'warning' },
      { label: 'Average Access Creep', value: '+166% Excess', status: 'negative' },
      { label: 'Candidate Roles to Purge', value: '14 Roles', status: 'positive' },
      { label: 'Peer Alignment Score', value: '88.2%', status: 'neutral' }
    ],
    breakdownData: [
      { category: 'MSMITH_FI (Finance)', value: '6 Roles vs 3 Median (+100%)', variance: 'Excess', detail: 'Retains legacy support roles from S/4 migration' },
      { category: 'WH_SUPERVISOR_02 (Logistics)', value: '8 Roles vs 3 Median (+166%)', variance: 'Excess', detail: 'Holds cross-plant QM and MM release roles' },
      { category: 'SD_REP_07 (Sales)', value: '7 Roles vs 2 Median (+250%)', variance: 'Excess', detail: 'Holds pricing condition maintenance and billing block override' },
      { category: 'MM_BUYER_09 (Procurement)', value: '5 Roles vs 2 Median (+150%)', variance: 'Excess', detail: 'Holds contract management and inventory adjustment roles' }
    ],
    recommendedSapActions: [
      { actionName: 'Launch Peer Review Campaign', tcode: 'NWBC', description: 'Initiate User Access Review (UAR) workflow in SAP GRC Access Control.' },
      { actionName: 'Batch Role Alignment in SU10', tcode: 'SU10', description: 'Remove redundant legacy roles from identified outlier accounts.' }
    ]
  },
  {
    questionId: 'Q47',
    questionText: 'Show dormant privileged accounts.',
    category: 'Audit, Compliance & Risk',
    sapSourceTables: ['USR02', 'UST04', 'USR04', 'AGR_USERS'],
    summaryAnswer: 'CRITICAL SECURITY FINDING: 2 dormant user accounts with elevated privileges have not logged into PRD Client 100 for over 90 days: 1) CONSULTANT_BASIS_OLD (Inactive for 120 days, holds administrative role Z_BASIS_ADMIN and profile SAP_ALL); 2) BTP_OLD_MIGRATION (Inactive for 180 days, holds system authorization profile S_A.SYSTEM). Both accounts represent severe dormant attack vectors.',
    keyInsights: [
      '2 Dormant privileged accounts identified in PRD Client 100.',
      'CONSULTANT_BASIS_OLD holds SAP_ALL and has been inactive since 2026-04-28.',
      'BTP_OLD_MIGRATION holds S_A.SYSTEM and has been inactive since 2026-02-27.',
      'Immediate action: Lock accounts and expire validity dates today.'
    ],
    securityMetrics: [
      { label: 'Dormant Privileged', value: '2 Accounts', status: 'negative' },
      { label: 'SAP_ALL Assigned', value: '1 Account', status: 'negative' },
      { label: 'Days Inactive', value: '120 - 180 Days', status: 'negative' },
      { label: 'Remediation Urgency', value: 'IMMEDIATE', status: 'negative' }
    ],
    breakdownData: [
      { category: 'CONSULTANT_BASIS_OLD', value: '120 Days Inactive', variance: 'CRITICAL', detail: 'Holds SAP_ALL and Z_BASIS_ADMIN - Last logon 2026-04-28' },
      { category: 'BTP_OLD_MIGRATION', value: '180 Days Inactive', variance: 'CRITICAL', detail: 'Holds S_A.SYSTEM profile - Last logon 2026-02-27' }
    ],
    recommendedSapActions: [
      { actionName: 'Immediate Account Lock', tcode: 'SU01', description: 'Lock user master records and delete profile assignments in USR04/UST04.' },
      { actionName: 'SUIM Dormant Superuser Audit', tcode: 'SUIM', description: 'Execute periodic automated query for TRDAT > 90 on administrative user groups.' }
    ]
  },
  {
    questionId: 'Q48',
    questionText: 'Which security controls are currently failing?',
    category: 'Audit, Compliance & Risk',
    sapSourceTables: ['GRACCTRL', 'GRACCOMPLIANCE', 'SOX_DASHBOARD', 'SM20'],
    summaryAnswer: 'In PRD Client 100, 2 GRC security controls are currently failing audit compliance checks: 1) CTRL-SEC-04 (Emergency Firefighter Session Review SLA <= 48 Hours) is failing due to 1 unreviewed session older than 5 days; 2) CTRL-SEC-09 (Zero Direct Role Changes in Production) is failing due to the direct PFCG edit on Z_FI_AP_SUPERUSER recorded on 2026-08-11.',
    keyInsights: [
      '2 Security controls currently in FAILING state.',
      'Control CTRL-SEC-04 failure caused by 1 overdue Firefighter review.',
      'Control CTRL-SEC-09 failure caused by direct production role change.',
      'Both failures are remediable within 24 hours to restore 100% compliance.'
    ],
    securityMetrics: [
      { label: 'Failing Controls', value: '2 of 14 (14%)', status: 'negative' },
      { label: 'Passing Controls', value: '12 of 14 (86%)', status: 'positive' },
      { label: 'SOX Audit Impact', value: 'Deficiency Alert', status: 'warning' },
      { label: 'Time to Remediate', value: '< 24 Hours', status: 'positive' }
    ],
    breakdownData: [
      { category: 'CTRL-SEC-04 (EAM Review SLA)', value: 'FAILING (5d Overdue)', variance: 'SLA Breach', detail: 'Firefighter session executed on 2026-08-21 pending signoff' },
      { category: 'CTRL-SEC-09 (No Direct PRD Edits)', value: 'FAILING (1 Violation)', variance: 'Direct Edit', detail: 'Role Z_FI_AP_SUPERUSER modified directly in PRD on 2026-08-11' }
    ],
    recommendedSapActions: [
      { actionName: 'Execute EAM Sign-Off', tcode: 'NWBC', description: 'Complete controller review for overdue firefighter session to pass CTRL-SEC-04.' },
      { actionName: 'Re-import Role via STMS', tcode: 'STMS', description: 'Import role Z_FI_AP_SUPERUSER from DEV to clear CTRL-SEC-09 deficiency.' }
    ]
  },
  {
    questionId: 'Q49',
    questionText: 'What are our highest SAP security risks today?',
    category: 'Audit, Compliance & Risk',
    sapSourceTables: ['AI_RISK_MODEL', 'GRACUSER', 'USR02', 'SM20', 'CDHDR'],
    summaryAnswer: 'The AI Security Risk Engine calculates an overall enterprise risk score of 84/100 (High Risk). Top 3 highest SAP security risks today: 1) Active unmitigated SoD conflict SOD-PTP-01 on User MSMITH_FI (Vendor Creation FK01 vs Payment Execution F110); 2) 2 Dormant superuser accounts retaining SAP_ALL and Basis profiles; 3) 2 Terminated employees retaining active production validity in USR02.',
    keyInsights: [
      'Top Risk 1: SoD Vendor Creation vs Payment on MSMITH_FI (Potential unauthorized disbursement).',
      'Top Risk 2: Dormant accounts with SAP_ALL (Elevated credential hijacking vulnerability).',
      'Top Risk 3: Terminated employees retaining active login (Unauthorized access risk).',
      'Executing recommended top-3 fixes reduces enterprise risk score from 84/100 to 18/100 (Clean).'
    ],
    securityMetrics: [
      { label: 'Security Risk Score', value: '84 / 100 (High)', status: 'negative' },
      { label: 'Top Critical Risks', value: '3 Major Findings', status: 'negative' },
      { label: 'Potential After Fixes', value: '18 / 100 (Low)', status: 'positive' },
      { label: 'Risk Reduction Pct', value: '-78.5%', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Risk #1: Vendor vs Payment SoD', value: 'Score: 94 / 100', variance: 'Critical', detail: 'User MSMITH_FI can create vendor and execute F110 payment run' },
      { category: 'Risk #2: Dormant SAP_ALL Accounts', value: 'Score: 92 / 100', variance: 'Critical', detail: 'CONSULTANT_BASIS_OLD inactive 120 days with full privileges' },
      { category: 'Risk #3: Terminated Employee Access', value: 'Score: 88 / 100', variance: 'High', detail: '2 Ex-employees valid in USR02 past HR termination dates' }
    ],
    recommendedSapActions: [
      { actionName: 'Execute Top 3 Remediation Plan', tcode: 'SU01', description: 'Lock terminated accounts, lock dormant superuser, and remove role Z_FI_AP_SENIOR.' },
      { actionName: 'Security Dashboard Refresh', tcode: 'NWBC', description: 'Re-run full enterprise security scoring in GRC dashboard.' }
    ]
  },
  {
    questionId: 'Q50',
    questionText: 'What should the security team remediate first?',
    category: 'Audit, Compliance & Risk',
    sapSourceTables: ['AI_PRIORITY_ENGINE', 'GRACUSER', 'USR02', 'SU10'],
    summaryAnswer: 'Automated Remediation Priority Action Plan: 1) PRIORITY 1 (Immediate - 5 mins): Lock 2 terminated employee accounts (EX_EMP_4412, EX_EMP_8819) and 2 dormant superuser accounts (CONSULTANT_BASIS_OLD, BTP_OLD_MIGRATION); 2) PRIORITY 2 (Today - 15 mins): Revoke role Z_FI_AP_SENIOR from MSMITH_FI to eliminate 12 SoD risks; 3) PRIORITY 3 (This Week): Complete sign-off on 1 overdue Firefighter session in GRC EAM.',
    keyInsights: [
      'Priority 1 fixes take 5 minutes and immediately eliminate 60% of all critical risk exposure.',
      'Priority 2 removes highest financial fraud exposure (Vendor Creation vs Payment).',
      'Priority 3 clears all failing SOX 404 security controls in GRC Process Control.',
      'All automated fix scripts are validated and ready for execution with one-click.'
    ],
    securityMetrics: [
      { label: 'Priority 1 (Immediate)', value: '4 Account Locks', status: 'positive' },
      { label: 'Priority 2 (Today)', value: '1 Role Revocation', status: 'positive' },
      { label: 'Priority 3 (This Week)', value: '1 EAM Sign-Off', status: 'positive' },
      { label: 'Total Est. Effort', value: '25 Minutes', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Priority 1: Lock 4 Accounts', value: 'EX_EMP_4412, EX_EMP_8819, CONSULTANT_BASIS_OLD, BTP_OLD_MIGRATION', variance: '5 Mins', detail: 'Eliminates terminated access and dormant superuser threat vectors' },
      { category: 'Priority 2: Revoke Z_FI_AP_SENIOR', value: 'Revoke from MSMITH_FI and AP_LEAD_02', variance: '15 Mins', detail: 'Eliminates 12 SoD violations including Vendor vs Payment conflict' },
      { category: 'Priority 3: Sign Off EAM Session', value: 'Session FF_DEV_01 (2026-08-21)', variance: '5 Mins', detail: 'Restores CTRL-SEC-04 to passing status in GRC Process Control' }
    ],
    recommendedSapActions: [
      { actionName: 'Execute Automated Fixes', tcode: 'SU10', description: 'Mass lock 4 flagged accounts and update role assignments in SU10.' },
      { actionName: 'Sign Off EAM Controller Review', tcode: 'NWBC', description: 'Complete digital signature review on overdue Firefighter session.' }
    ]
  }
];
