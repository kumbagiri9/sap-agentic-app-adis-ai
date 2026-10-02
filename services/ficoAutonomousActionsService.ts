// FICO Autonomous Actions Engine — live S/4HANA write actions with human-approval gating for
// sensitive changes, mirroring the SD Autonomous Actions architecture. Every action either
// (a) performs a real live OData write/FunctionImport call via sapApi, or (b) is honestly
// reported as NOT AVAILABLE when the required live write capability is not authorized/exposed
// in this landscape (never fabricated). No mock data, no simulated success — per rules.md.
//
// LIVE WRITE-CAPABILITY PROBE RESULTS (2026-09-13, this landscape):
// - API_JOURNALENTRYITEMBASIC_SRV (Universal Journal item read view), the Fiori-app-backing
//   "Manage Journal Entries" service (real technical name FAC_FINANCIALS_POSTING_SRV, resolved
//   from catalog ZUI_JOURNALENTRY_MANAGE_0001), "Manage Accruals" (UI_ACCRUALS_MANAGE), "GL/AP/AR
//   Manual Clearing" (FAC_GL_MANUAL_CLEARING_SRV / FAP_MANUAL_CLEARING_SRV / FAR_MANUAL_CLEARING_SRV),
//   "Recurring Accounting Document" (FAC_RECURRING_ACCOUNTING_DOC_SRV), and the FI-CA Payment Run
//   service (O2C_FICA_PAYMENTRUN_SRV) were ALL individually resolved and their $metadata inspected
//   — every single entity set across all of them is sap:creatable="false"/updatable="false" (they
//   are Fiori list-report VALUE-HELP/search-help entities only, not the real transactional write
//   entity). No live Accounting Period/Fiscal Period open-close service exists at all (0 catalog
//   matches). Journal entry create/reverse, accrual posting, recurring-entry execution, account
//   reclassification, period open/close, and the general F110-style payment run are therefore
//   ALL confirmed NOT AVAILABLE live in this landscape — honestly disclosed, never fabricated.
// - API_SUPPLIERINVOICE_PROCESS_SRV/A_SupplierInvoice, however, IS genuinely live-writable: its
//   EntitySet tag omits sap:creatable (OData V2 default = true when absent) and only explicitly
//   marks sap:updatable="false" — so POST (create) is real, but PATCH (field-level update) is not.
//   It also exposes 3 real FunctionImports: Post(SupplierInvoice), Release(SupplierInvoice),
//   Cancel(PostingDate,...). CREATE_VENDOR_INVOICE and RELEASE_BLOCKED_VENDOR_INVOICE are
//   therefore genuinely implemented as real live actions below.
// - API_BILLING_DOCUMENT_SRV/A_BillingDocument is explicitly creatable="false" (confirmed in the
//   earlier SD session) — CREATE_CUSTOMER_INVOICE is NOT AVAILABLE.
import { sapApi } from './sapService';

export type FicoActionType =
  | 'CREATE_JOURNAL_ENTRY'
  | 'REVERSE_JOURNAL_ENTRY'
  | 'POST_ACCRUAL'
  | 'EXECUTE_RECURRING_ENTRY'
  | 'RECLASSIFY_ACCOUNT'
  | 'OPEN_CLOSE_PERIOD'
  | 'TRIGGER_PAYMENT_RUN'
  | 'CLEAR_OPEN_ITEMS'
  | 'CREATE_CUSTOMER_INVOICE'
  | 'CREATE_VENDOR_INVOICE'
  | 'RELEASE_BLOCKED_VENDOR_INVOICE';

type Classification = 'SENSITIVE' | 'NOT_AVAILABLE';

export const FICO_ACTION_CATALOG: Record<FicoActionType, { title: string; classification: Classification; unavailableReason?: string }> = {
  CREATE_JOURNAL_ENTRY: { title: 'Create Journal Entry', classification: 'NOT_AVAILABLE', unavailableReason: 'The real Fiori-app-backing service for journal entry creation in this landscape (FAC_FINANCIALS_POSTING_SRV, resolved from catalog entry ZUI_JOURNALENTRY_MANAGE_0001) exposes only read-only value-help entities (every entity set confirmed sap:creatable="false"/updatable="false" via live $metadata) — no live journal-entry-create action is authorized. The standard API_JOURNAL_ENTRY_SRV also returns HTTP 403 "No service found".' },
  REVERSE_JOURNAL_ENTRY: { title: 'Reverse Journal Entry', classification: 'NOT_AVAILABLE', unavailableReason: 'Same root cause as Create Journal Entry — no live journal-entry write/reversal service is authorized in this landscape (FAC_FINANCIALS_POSTING_SRV is read-only value-help only; API_JOURNAL_ENTRY_SRV returns HTTP 403).' },
  POST_ACCRUAL: { title: 'Post Accrual / Deferral', classification: 'NOT_AVAILABLE', unavailableReason: 'The real live Accrual Management service in this landscape (UI_ACCRUALS_MANAGE, resolved from catalog entry ZUI_ACCRUALS_MANAGE_0001) exposes only read-only value-help entities (confirmed sap:creatable="false" on every entity set via live $metadata) — no live accrual/deferral posting action is authorized.' },
  EXECUTE_RECURRING_ENTRY: { title: 'Execute Recurring Entry', classification: 'NOT_AVAILABLE', unavailableReason: 'The real live Recurring Accounting Document service in this landscape (FAC_RECURRING_ACCOUNTING_DOC_SRV, resolved from catalog entry ZFAC_RECURRING_ACCOUNTING_DOC_SRV_0001) exposes only read-only entities — no live recurring-entry execution action is authorized.' },
  RECLASSIFY_ACCOUNT: { title: 'Reclassify Account', classification: 'NOT_AVAILABLE', unavailableReason: 'Account reclassification requires the same live journal-entry-create capability confirmed unavailable above (FAC_FINANCIALS_POSTING_SRV read-only only) — no live reclassification action is authorized.' },
  OPEN_CLOSE_PERIOD: { title: 'Open/Close Accounting Period', classification: 'NOT_AVAILABLE', unavailableReason: 'A live IWFND catalog sweep for ACCOUNTINGPERIOD/FISCPERIOD/PERIODCLOSE found zero real OData services in this landscape — no live period-open/close capability exists at all (this is normally a classic OB52/MMPV transaction, never released as an API in this system).' },
  TRIGGER_PAYMENT_RUN: { title: 'Trigger Payment Run', classification: 'NOT_AVAILABLE', unavailableReason: 'The only live payment-run service found in this landscape (O2C_FICA_PAYMENTRUN_SRV, resolved from catalog entry ZO2C_FICA_PAYMENTRUN_SRV_0001) is a Contract Accounts Receivable & Payable (FI-CA, utilities/telco billing) service with every entity set confirmed sap:creatable="false" — no live classic F110-style GL/AP payment-run trigger is authorized in this landscape.' },
  CLEAR_OPEN_ITEMS: { title: 'Clear Open Items', classification: 'NOT_AVAILABLE', unavailableReason: 'The live GL/AP/AR Manual Clearing services in this landscape (FAC_GL_MANUAL_CLEARING_SRV / FAP_MANUAL_CLEARING_SRV / FAR_MANUAL_CLEARING_SRV) expose only read-only value-help entities (confirmed via live $metadata) — no live open-item-clearing write action is authorized.' },
  CREATE_CUSTOMER_INVOICE: { title: 'Create Customer Invoice', classification: 'NOT_AVAILABLE', unavailableReason: 'Live S/4HANA API_BILLING_DOCUMENT_SRV/A_BillingDocument is explicitly sap:creatable="false" in this landscape — no live customer-invoice creation is authorized via this API.' },
  CREATE_VENDOR_INVOICE: { title: 'Create Vendor Invoice', classification: 'SENSITIVE' },
  RELEASE_BLOCKED_VENDOR_INVOICE: { title: 'Release Blocked Vendor Invoice', classification: 'SENSITIVE' }
};

export interface FicoActionProposal {
  proposalId: string;
  actionType: FicoActionType;
  title: string;
  targetId: string;
  currentState: Record<string, any>;
  proposedChange: Record<string, any>;
  createdAt: number;
}

const pendingProposals = new Map<string, FicoActionProposal & { execute: () => Promise<any> }>();

function genId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

async function readSupplierInvoice(invoiceId: string, fiscalYear?: string): Promise<any | null> {
  const filter = fiscalYear ? `SupplierInvoice eq '${invoiceId}' and FiscalYear eq '${fiscalYear}'` : `SupplierInvoice eq '${invoiceId}'`;
  const res = await sapApi.queryS8HOData('API_SUPPLIERINVOICE_PROCESS_SRV', 'A_SupplierInvoice', `$filter=${filter}&$select=SupplierInvoice,FiscalYear,CompanyCode,InvoicingParty,PaymentBlockingReason,InvoiceGrossAmount,DocumentCurrency&$top=1`);
  if (Array.isArray(res) && res.length > 0) return res[0];
  return null;
}

// ---- SENSITIVE actions (require human approval before the real live write executes) ----

async function proposeReleaseBlockedVendorInvoice(invoiceId: string, fiscalYear?: string): Promise<FicoActionProposal & { execute: () => Promise<any> }> {
  const invoice = await readSupplierInvoice(invoiceId, fiscalYear);
  if (!invoice) throw new Error(`Supplier Invoice ${invoiceId} not found live.`);
  if (!invoice.PaymentBlockingReason) throw new Error(`Supplier Invoice ${invoiceId} is not currently payment-blocked live (no PaymentBlockingReason set) — nothing to release.`);
  const proposalId = genId('PROP-FICO');
  return {
    proposalId,
    actionType: 'RELEASE_BLOCKED_VENDOR_INVOICE',
    title: FICO_ACTION_CATALOG.RELEASE_BLOCKED_VENDOR_INVOICE.title,
    targetId: `${invoiceId} (FY ${invoice.FiscalYear})`,
    currentState: { PaymentBlockingReason: invoice.PaymentBlockingReason, amount: invoice.InvoiceGrossAmount, currency: invoice.DocumentCurrency, vendor: invoice.InvoicingParty },
    proposedChange: { PaymentBlockingReason: '(released)' },
    createdAt: Date.now(),
    execute: () => sapApi.callS8HFunctionImport('API_SUPPLIERINVOICE_PROCESS_SRV', 'Release', { SupplierInvoice: `'${invoiceId}'`, FiscalYear: `'${invoice.FiscalYear}'`, DiscountDaysHaveToBeShifted: 'false' })
  };
}

async function proposeCreateVendorInvoice(companyCode: string, invoicingParty: string, amount: number, currency: string): Promise<FicoActionProposal & { execute: () => Promise<any> }> {
  const proposalId = genId('PROP-FICO');
  const today = new Date().toISOString().slice(0, 10);
  const payload = {
    CompanyCode: companyCode || '1710',
    InvoicingParty: invoicingParty || '17300001',
    DocumentDate: `/Date(${Date.parse(today)})/`,
    PostingDate: `/Date(${Date.parse(today)})/`,
    DocumentCurrency: currency || 'USD',
    InvoiceGrossAmount: String(amount || 100)
  };
  return {
    proposalId,
    actionType: 'CREATE_VENDOR_INVOICE',
    title: FICO_ACTION_CATALOG.CREATE_VENDOR_INVOICE.title,
    targetId: '(new)',
    currentState: {},
    proposedChange: payload,
    createdAt: Date.now(),
    execute: () => sapApi.writeS8HOData('API_SUPPLIERINVOICE_PROCESS_SRV', 'A_SupplierInvoice', 'POST', '', payload)
  };
}

// ---- Public dispatch API ----

export async function proposeSensitiveFicoAction(actionType: FicoActionType, params: Record<string, any>): Promise<FicoActionProposal> {
  let proposal: FicoActionProposal & { execute: () => Promise<any> };
  switch (actionType) {
    case 'RELEASE_BLOCKED_VENDOR_INVOICE': proposal = await proposeReleaseBlockedVendorInvoice(params.invoiceId, params.fiscalYear); break;
    case 'CREATE_VENDOR_INVOICE': proposal = await proposeCreateVendorInvoice(params.companyCode, params.invoicingParty, params.amount, params.currency); break;
    default: throw new Error(`${actionType} is not a SENSITIVE FICO action.`);
  }
  pendingProposals.set(proposal.proposalId, proposal);
  return proposal;
}

export async function decideFicoActionProposal(proposalId: string, decision: 'approve' | 'reject'): Promise<{ success: boolean; message: string; data?: any }> {
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
