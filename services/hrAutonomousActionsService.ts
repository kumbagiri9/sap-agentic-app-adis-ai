// SAP HR Autonomous Actions Engine — live S/4HANA write actions with human-approval gating,
// mirroring the SD/FICO/EWM/TM/PP/MM/QM Autonomous Actions pattern. Real live metadata probing
// (documented per-action below) found this landscape has an unusually rich real HCM Fiori-app
// OData catalog (HCMFAB_*/HCM_*), but most action-verbs from the requirements doc are either not
// deployed (real HTTP 403/404) or registered-but-not-implemented (real HTTP 500/501 "not
// implemented in data provider class") — a distinct pattern from the "creatable=false" convention
// seen in other modules. Two genuinely real live writes were found and are used here:
//  - HCMFAB_LEAVE_REQUEST_CR_SRV/LeaveRequestSet: metadata declares sap:creatable="false", but a
//    real live POST test returned HTTP 201 (metadata was stale/misleading for this entity) —
//    confirms Submit Leave Request is genuinely live-writable. EmployeeID/InfotypeId/etc. are all
//    property-level creatable="false" (server/session-derived), so only AbsenceTypeCode/
//    StartDate/EndDate/Notes are supplied by the caller.
//  - HCMFAB_MYADDRESSES_SRV/Address01Set (Permanent Residence address, Infotype 0006 subtype 01):
//    no restriction attributes at all on the EntitySet -> creatable/updatable default TRUE per
//    this landscape's established convention. Real writable fields: ContactName,
//    StreetAndHousenumber, PostalCode, City, District, CountryId, TelephoneNumber.
//  - HCM_CATS_PMTSREMINDER_SRV exposes a real "SendMail" FunctionImport (POST) taking
//    EmpList/FromDate/ToDate — genuinely dispatches a live reminder email to managers/employees
//    with missing timesheet entries; used for the "notify managers about overdue HR actions" AUTO
//    action (this is the closest real live equivalent found in this landscape; it is scoped to
//    timesheets specifically, not a generic all-HR-actions reminder engine).
// This replaces the fabricated `hrHcmService.ts` `executeAutonomousAction()` dispatch, which
// generated a Math.random()-based fake ID for all 18 of its action types — see
// /memories/repo/runtime-notes.md for the audit detail.
import { sapApi } from './sapService';

export type HrActionType =
  | 'SUBMIT_LEAVE_REQUEST'
  | 'APPROVE_REJECT_LEAVE_REQUEST'
  | 'UPDATE_EMPLOYEE_CONTACT_INFO'
  | 'INITIATE_EMPLOYEE_TRANSFER'
  | 'CREATE_UPDATE_POSITION'
  | 'TRIGGER_ONBOARDING_WORKFLOW'
  | 'INITIATE_OFFBOARDING'
  | 'GENERATE_HR_LETTER'
  | 'RETRIEVE_PAYSLIP'
  | 'SUBMIT_TIMESHEET'
  | 'APPROVE_TIMESHEET'
  | 'CREATE_JOB_REQUISITION'
  | 'TRIGGER_BACKGROUND_HR_WORKFLOW'
  | 'UPDATE_EMERGENCY_CONTACT_INFO'
  | 'TRIGGER_TRAINING_ASSIGNMENT'
  | 'CREATE_HR_CASE'
  | 'ROUTE_PAYROLL_EXCEPTION'
  | 'GENERATE_WORKFORCE_REPORT'
  | 'TRIGGER_ACCESS_REMOVAL'
  | 'NOTIFY_MANAGER_OVERDUE_ACTIONS';

type Classification = 'AUTO' | 'SENSITIVE' | 'NOT_AVAILABLE';

export const HR_ACTION_CATALOG: Record<HrActionType, { title: string; classification: Classification; unavailableReason?: string }> = {
  SUBMIT_LEAVE_REQUEST: { title: 'Submit Leave Request', classification: 'SENSITIVE' },
  APPROVE_REJECT_LEAVE_REQUEST: { title: 'Approve/Reject Leave Request', classification: 'NOT_AVAILABLE', unavailableReason: 'The real live HCMFAB_LEAVE_REQUEST_APR_SRV/LeaveRequestSet service is deployed and reachable in this landscape, but a real live create/decision test returned real HTTP 501 "Method \'LEAVEREQUESTSET_CREATE_ENTITY\' not implemented in data provider class" — registered but not functionally implemented here.' },
  UPDATE_EMPLOYEE_CONTACT_INFO: { title: 'Update Employee Contact Information', classification: 'SENSITIVE' },
  INITIATE_EMPLOYEE_TRANSFER: { title: 'Initiate Employee Transfer', classification: 'NOT_AVAILABLE', unavailableReason: 'No live Employee Transfer / Organizational Reassignment OData service was found deployed in this landscape during a broad IWFND catalog sweep (TRANSFER keyword matches were all unrelated Cash/Stock/Waste transfer services).' },
  CREATE_UPDATE_POSITION: { title: 'Create/Update Position', classification: 'NOT_AVAILABLE', unavailableReason: 'No live Position (Organizational Management, PP01/Infotype 1000) creation/update OData service was found deployed in this landscape (a broad POSITION keyword catalog sweep returned only unrelated FI Cash/Liquidity Position and Defense Position services).' },
  TRIGGER_ONBOARDING_WORKFLOW: { title: 'Trigger Onboarding Workflow', classification: 'NOT_AVAILABLE', unavailableReason: 'No live Onboarding workflow-trigger OData service was found deployed in this landscape (0 real catalog matches for ONBOARD).' },
  INITIATE_OFFBOARDING: { title: 'Initiate Offboarding', classification: 'NOT_AVAILABLE', unavailableReason: 'No live Offboarding workflow-trigger OData service was found deployed in this landscape (0 real catalog matches for OFFBOARD).' },
  GENERATE_HR_LETTER: { title: 'Generate HR Letter', classification: 'NOT_AVAILABLE', unavailableReason: 'No live HR document/letter-generation OData service was found deployed in this landscape (0 real catalog matches for HR_LETTER).' },
  RETRIEVE_PAYSLIP: { title: 'Retrieve Payslip', classification: 'NOT_AVAILABLE', unavailableReason: 'The only real catalog match, HRSFEC_PAYSLIP_PDF_SRV (SuccessFactors Employee Central payslip PDF integration), returns real live HTTP 404 "service ... was terminated because the corresponding service does not exist" in this landscape.' },
  SUBMIT_TIMESHEET: { title: 'Submit Timesheet', classification: 'NOT_AVAILABLE', unavailableReason: 'The standard HCM_TIMESHEET_MAN_SRV/HCM_CATS_MANAG_V1 services return real HTTP 500 "No service found"; the real deployed HCMFAB_TIMESHEET_MAINT_SRV service\'s only writable-looking entity (AssignmentCollection) returned real live HTTP 501 "Method \'ASSIGNMENTSET_CREATE_ENTITY\' not implemented in data provider class" on a live test POST.' },
  APPROVE_TIMESHEET: { title: 'Approve Timesheet', classification: 'NOT_AVAILABLE', unavailableReason: 'Same real live constraint as Submit Timesheet — HCM_TIMESHEET_APPROVE_SRV returns real HTTP 500 "No service found", and no working write path was found on the deployed HCMFAB timesheet services.' },
  CREATE_JOB_REQUISITION: { title: 'Create Job Requisition', classification: 'NOT_AVAILABLE', unavailableReason: 'No live SuccessFactors Recruiting / Job Requisition OData service was found deployed in this landscape (a broad REQUISITION keyword catalog sweep returned only unrelated Purchase Requisition and Payment Requisition services).' },
  TRIGGER_BACKGROUND_HR_WORKFLOW: { title: 'Trigger Background HR Workflow', classification: 'NOT_AVAILABLE', unavailableReason: 'No generic live HR background-workflow-trigger OData service or bound action was found deployed in this landscape.' },
  UPDATE_EMERGENCY_CONTACT_INFO: { title: 'Update Emergency Contact Information', classification: 'NOT_AVAILABLE', unavailableReason: 'HCMFAB_MYADDRESSES_SRV exposes ~40 real numbered address subtypes (Infotype 0006), but which specific subtype number represents "emergency contact" in this landscape\'s live customizing could not be confirmed within this session\'s probing budget — use Update Employee Contact Information (subtype 01, Permanent Residence) instead, which IS confirmed live-writable.' },
  TRIGGER_TRAINING_ASSIGNMENT: { title: 'Trigger Training Assignment', classification: 'NOT_AVAILABLE', unavailableReason: 'No live Training/LMS assignment OData service was found deployed in this landscape (0 real catalog matches for TRAINING).' },
  CREATE_HR_CASE: { title: 'Create HR Case', classification: 'NOT_AVAILABLE', unavailableReason: 'No live HR Service Request/Case Management OData service was found deployed in this landscape (0 real catalog matches for HR_CASE).' },
  ROUTE_PAYROLL_EXCEPTION: { title: 'Route Payroll Exception', classification: 'NOT_AVAILABLE', unavailableReason: 'No live Payroll OData service of any kind was found deployed in this landscape (0 real catalog matches for PAYROLL).' },
  GENERATE_WORKFORCE_REPORT: { title: 'Generate Workforce Report', classification: 'AUTO' },
  TRIGGER_ACCESS_REMOVAL: { title: 'Trigger Access Removal (Termination)', classification: 'NOT_AVAILABLE', unavailableReason: 'No live HR-owned access-removal/SU01-lock OData service was found deployed in this landscape (0 real catalog matches for ACCESS_REQUEST); SU01 account locking is a Basis/Security-owned transaction with no exposed live OData action found here.' },
  NOTIFY_MANAGER_OVERDUE_ACTIONS: { title: 'Notify Managers About Overdue Actions', classification: 'AUTO' }
};

export interface HrActionProposal {
  proposalId: string;
  actionType: HrActionType;
  title: string;
  targetId: string;
  currentState: Record<string, any>;
  proposedChange: Record<string, any>;
  createdAt: number;
}

const pendingProposals = new Map<string, HrActionProposal & { execute: () => Promise<any> }>();

function genId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function toODataDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `/Date(${d.getTime()})/`;
}

// ---- AUTO actions (execute immediately, no approval — real live data / real live low-risk notify) ----

async function executeGenerateWorkforceReport(companyCode?: string): Promise<{ success: boolean; message: string; data?: any }> {
  const res = await sapApi.queryS8HOData('UI_HCMORGCHART', 'EmployeeAssignments', '$top=1000').catch(() => null);
  if (!Array.isArray(res)) return { success: false, message: `Live workforce report failed: could not query UI_HCMORGCHART/EmployeeAssignments.` };
  const active = res.filter((a: any) => a.HCMEmploymentStatus === '3');
  const uniquePersonnel = new Set(active.map((a: any) => String(a.HCMPersonnelNumber)));
  return {
    success: true,
    message: `Live UI_HCMORGCHART/EmployeeAssignments sampled ${res.length} real Person Work Agreement record(s); ${active.length} carry real active employment status across ${uniquePersonnel.size} distinct personnel numbers.`,
    data: { totalAssignments: res.length, activeAssignments: active.length, distinctActiveEmployees: uniquePersonnel.size }
  };
}

async function executeNotifyManagerOverdueActions(employeeNumbers?: string[], fromDate?: string, toDate?: string): Promise<{ success: boolean; message: string; data?: any }> {
  const to = toDate || new Date().toISOString().slice(0, 10);
  const from = fromDate || new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString().slice(0, 10);
  if (!employeeNumbers || employeeNumbers.length === 0) {
    return { success: false, message: 'At least one employee/personnel number is required to send a live overdue-timesheet reminder (e.g. "notify overdue actions for employees 100088, 100112").' };
  }
  const empList = employeeNumbers.join(',');
  const result = await sapApi.callS8HFunctionImport('HCM_CATS_PMTSREMINDER_SRV', 'SendMail', { EmpList: `'${empList}'`, FromDate: `'${from}'`, ToDate: `'${to}'` });
  if (result?.success === false || result?.error) {
    return { success: false, message: `Live HCM_CATS_PMTSREMINDER_SRV SendMail rejected the reminder: ${result?.error || 'unknown error'}.`, data: result };
  }
  return { success: true, message: `Live reminder dispatched via HCM_CATS_PMTSREMINDER_SRV/SendMail to ${employeeNumbers.length} real employee(s) for the missing-timesheet window ${from} to ${to}.`, data: result };
}

// ---- SENSITIVE actions (real live OData write, human approval required) ----

async function proposeSubmitLeaveRequest(absenceTypeCode: string, startDate: string, endDate: string, notes?: string): Promise<HrActionProposal & { execute: () => Promise<any> }> {
  if (!absenceTypeCode || !startDate || !endDate) throw new Error('Absence type code, start date, and end date are all required to submit a leave request.');
  const payload = {
    AbsenceTypeCode: absenceTypeCode,
    StartDate: toODataDate(startDate),
    EndDate: toODataDate(endDate),
    Notes: notes || ''
  };
  return {
    proposalId: genId('PROP-HR'),
    actionType: 'SUBMIT_LEAVE_REQUEST',
    title: HR_ACTION_CATALOG.SUBMIT_LEAVE_REQUEST.title,
    targetId: '(new)',
    currentState: { note: 'EmployeeID/RequestID are server/session-derived by HCMFAB_LEAVE_REQUEST_CR_SRV in this landscape (not caller-suppliable) — the submitted request will be tied to whichever employee context the authenticated technical session resolves to, which may be blank for a non-employee service account.' },
    proposedChange: payload,
    createdAt: Date.now(),
    execute: () => sapApi.writeS8HOData('HCMFAB_LEAVE_REQUEST_CR_SRV', 'LeaveRequestSet', 'POST', '', payload)
  };
}

async function readAddress01(employeeNumber: string): Promise<any | null> {
  const res = await sapApi.queryS8HOData('HCMFAB_MYADDRESSES_SRV', 'Address01Set', `$filter=EmployeeNumber eq '${employeeNumber}'&$top=1`);
  return Array.isArray(res) && res.length ? res[0] : null;
}

async function proposeUpdateEmployeeContactInfo(employeeNumber: string, fields: { streetAndHousenumber?: string; city?: string; postalCode?: string; district?: string; countryId?: string; telephoneNumber?: string; contactName?: string }): Promise<HrActionProposal & { execute: () => Promise<any> }> {
  if (!employeeNumber) throw new Error('Employee/personnel number is required to update contact information.');
  const existing = await readAddress01(employeeNumber);
  if (!existing) throw new Error(`No live Address01 (Permanent Residence, Infotype 0006 subtype 01) record was found for employee ${employeeNumber} in HCMFAB_MYADDRESSES_SRV.`);
  const payload: Record<string, any> = {};
  if (fields.streetAndHousenumber) payload.StreetAndHousenumber = fields.streetAndHousenumber;
  if (fields.city) payload.City = fields.city;
  if (fields.postalCode) payload.PostalCode = fields.postalCode;
  if (fields.district) payload.District = fields.district;
  if (fields.countryId) payload.CountryId = fields.countryId;
  if (fields.telephoneNumber) payload.TelephoneNumber = fields.telephoneNumber;
  if (fields.contactName) payload.ContactName = fields.contactName;
  if (Object.keys(payload).length === 0) throw new Error('At least one contact field (street, city, postal code, district, country, phone, contact name) must be provided.');
  const keyPredicate = `EmployeeNumber='${existing.EmployeeNumber}',InfotypeId='${existing.InfotypeId}',SubtypeId='${existing.SubtypeId}',ObjectId='${existing.ObjectId}',SequenceNumber='${existing.SequenceNumber}',BeginDate=datetime'${new Date(existing.BeginDate?.match(/\d+/)?.[0] ? Number(existing.BeginDate.match(/\d+/)[0]) : Date.now()).toISOString().slice(0, 19)}',EndDate=datetime'${new Date(existing.EndDate?.match(/\d+/)?.[0] ? Number(existing.EndDate.match(/\d+/)[0]) : Date.now()).toISOString().slice(0, 19)}'`;
  return {
    proposalId: genId('PROP-HR'),
    actionType: 'UPDATE_EMPLOYEE_CONTACT_INFO',
    title: HR_ACTION_CATALOG.UPDATE_EMPLOYEE_CONTACT_INFO.title,
    targetId: employeeNumber,
    currentState: { streetAndHousenumber: existing.StreetAndHousenumber, city: existing.City, postalCode: existing.PostalCode, district: existing.District, countryId: existing.CountryId, telephoneNumber: existing.TelephoneNumber, contactName: existing.ContactName },
    proposedChange: payload,
    createdAt: Date.now(),
    execute: () => sapApi.writeS8HOData('HCMFAB_MYADDRESSES_SRV', 'Address01Set', 'PATCH', keyPredicate, payload)
  };
}

// ---- Public dispatch API ----

export async function executeAutoHrAction(actionType: HrActionType, params: Record<string, any>): Promise<{ success: boolean; message: string; data?: any }> {
  switch (actionType) {
    case 'GENERATE_WORKFORCE_REPORT': return executeGenerateWorkforceReport(params.companyCode);
    case 'NOTIFY_MANAGER_OVERDUE_ACTIONS': return executeNotifyManagerOverdueActions(params.employeeNumbers, params.fromDate, params.toDate);
    default: return { success: false, message: `${actionType} is not an AUTO action.` };
  }
}

export async function proposeSensitiveHrAction(actionType: HrActionType, params: Record<string, any>): Promise<HrActionProposal> {
  let proposal: HrActionProposal & { execute: () => Promise<any> };
  switch (actionType) {
    case 'SUBMIT_LEAVE_REQUEST':
      proposal = await proposeSubmitLeaveRequest(params.absenceTypeCode, params.startDate, params.endDate, params.notes);
      break;
    case 'UPDATE_EMPLOYEE_CONTACT_INFO':
      proposal = await proposeUpdateEmployeeContactInfo(params.employeeNumber, params);
      break;
    default:
      throw new Error(`${actionType} is not a SENSITIVE action.`);
  }
  pendingProposals.set(proposal.proposalId, proposal);
  return proposal;
}

export async function decideHrActionProposal(proposalId: string, decision: 'approve' | 'reject'): Promise<{ success: boolean; message: string; data?: any }> {
  const proposal = pendingProposals.get(proposalId);
  if (!proposal) {
    return { success: false, message: `Proposal ${proposalId} not found or already decided.` };
  }
  pendingProposals.delete(proposalId);

  if (decision === 'reject') {
    return { success: true, message: `Proposal ${proposalId} (${proposal.title} on ${proposal.targetId}) was rejected by human approver. No live change was made.` };
  }

  const result = await proposal.execute();
  if (result?.success === false || result?.error) {
    return { success: false, message: `Live S/4HANA rejected "${proposal.title}" on ${proposal.targetId}: ${result?.error || 'unknown error'}.`, data: result };
  }
  return { success: true, message: `Human-approved "${proposal.title}" on ${proposal.targetId} executed live on S/4HANA (Client 100).`, data: result };
}
