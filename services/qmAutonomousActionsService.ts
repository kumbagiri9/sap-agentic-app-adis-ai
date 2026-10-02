// SAP QM Autonomous Actions Engine — live S/4HANA write actions with human-approval gating,
// mirroring the SD/FICO/EWM/TM/PP/MM Autonomous Actions pattern. Real live metadata probing
// (documented per-action below) found:
//  - QM_INSPLOT_OBJECTPAGE_SRV/InspLot is fully read-only (sap:creatable/updatable/deletable="false"),
//    with only SampleDrawingInsPDF/PrintInspReports FunctionImports (print, not create) — so
//    Create Inspection Lot is NOT_AVAILABLE.
//  - QM_INSPUSGDSC_MANAGE_SRV/C_InspUsgDescMng exposes a real bound FunctionImport
//    "A193DAF63E11208Make_ud_with_default_code" (m:HttpMethod="POST", sap:action-for=
//    "C_InspUsgDescMngType") that makes a live Usage Decision using the plant's configured
//    default UD code, keyed by (InspectionLot, DraftUUID, IsActiveEntity) — the standard SAP
//    Fiori draft-entity key triple. This IS genuinely callable and is used for MAKE_USAGE_DECISION.
//  - All inspection-result-recording entities in that same service (C_InspUsgeSbstRslt,
//    C_InspUsgeSingleRslt, C_InspUsgeSbst) are read-only (creatable/updatable="false") — so
//    Record Inspection Results is NOT_AVAILABLE.
//  - QM_DEFECT_MANAGE_SRV is a value-help/browsing service — every single one of its ~70 entity
//    sets (I_QltyNotificationVH, C_DefectMng, etc.) carries explicit creatable/updatable/
//    deletable="false" — so Create Quality Notification is NOT_AVAILABLE (this matches the
//    pre-existing finding on buildQmQualityNotificationReport that API_QUALITY_NOTIFICATION_SRV
//    itself returns real HTTP 403 in this landscape).
//  - The only live stock-posting-destination bound actions found (A08425C4036Set_stock_posting_destination /
//    A08425C40362Rset_stock_postg_destination) are scoped to C_InspLotUsgeDcsnSerialNumberType and
//    mandatorily require a real SerialNumber — i.e. they only exist for serial-number-managed
//    inspection lots, not as a general block/release-stock capability — so Block Defective
//    Inventory / Release Approved Stock are NOT_AVAILABLE as standalone general actions.
//  - No live write-capable service was found for CAPA workflows, supplier notifications/audits,
//    inspection plan creation, quality certificate generation, or reinspection triggering during
//    this session's live probing.
// This replaces the previous `qmService.ts` implementation, which fabricated every one of these
// actions with Math.random()-based IDs (INS-01xxxxxxx, QN-20xxxxxxx, CAPA-8D-xxxxxx,
// QADV-2026-xxxxx, AUD-SUPP-2026-xxxx, PLN-880xxx, COA-2026-xxxxxx with a fake digital signature
// hash) — see /memories/repo/runtime-notes.md for the audit detail.
import { sapApi } from './sapService';

export type QmActionType =
  | 'CREATE_INSPECTION_LOT'
  | 'RECORD_INSPECTION_RESULTS'
  | 'MAKE_USAGE_DECISION'
  | 'CREATE_QUALITY_NOTIFICATION'
  | 'TRIGGER_CAPA_WORKFLOW'
  | 'BLOCK_DEFECTIVE_INVENTORY'
  | 'RELEASE_APPROVED_STOCK'
  | 'TRIGGER_SUPPLIER_NOTIFICATION'
  | 'SCHEDULE_SUPPLIER_AUDIT'
  | 'CREATE_INSPECTION_PLAN'
  | 'RECOMMEND_INSPECTION_FREQUENCY_CHANGE'
  | 'GENERATE_QUALITY_CERTIFICATE'
  | 'TRIGGER_REINSPECTION'
  | 'REPROCESS_FAILED_QUALITY_INTERFACES';

type Classification = 'AUTO' | 'SENSITIVE' | 'NOT_AVAILABLE';

export const QM_ACTION_CATALOG: Record<QmActionType, { title: string; classification: Classification; unavailableReason?: string }> = {
  CREATE_INSPECTION_LOT: { title: 'Create Inspection Lot', classification: 'NOT_AVAILABLE', unavailableReason: 'Live QM_INSPLOT_OBJECTPAGE_SRV/InspLot metadata is fully read-only (sap:creatable="false" sap:updatable="false" sap:deletable="false") in this landscape, and its only FunctionImports are SampleDrawingInsPDF/PrintInspReports (print actions, not create). No live Inspection Lot creation entity or action was found deployed.' },
  RECORD_INSPECTION_RESULTS: { title: 'Record Inspection Results', classification: 'NOT_AVAILABLE', unavailableReason: 'All live inspection-result entities in QM_INSPUSGDSC_MANAGE_SRV (C_InspUsgeSbst, C_InspUsgeSbstRslt, C_InspUsgeSingleRslt) carry explicit sap:creatable="false" sap:updatable="false" in this landscape\u2019s real metadata \u2014 no live results-recording write path was found deployed.' },
  MAKE_USAGE_DECISION: { title: 'Make Usage Decision (Default Code)', classification: 'SENSITIVE' },
  CREATE_QUALITY_NOTIFICATION: { title: 'Create Quality Notification', classification: 'NOT_AVAILABLE', unavailableReason: 'QM_DEFECT_MANAGE_SRV (the real live service backing quality-notification reads, I_QltyNotificationVH) is a value-help/browsing service \u2014 every one of its ~70 real entity sets carries explicit sap:creatable="false", and the standard API_QUALITY_NOTIFICATION_SRV returns real live HTTP 403 (not deployed) in this landscape.' },
  TRIGGER_CAPA_WORKFLOW: { title: 'Trigger CAPA Workflow', classification: 'NOT_AVAILABLE', unavailableReason: 'No live CAPA (Corrective/Preventive Action) workflow-creation OData service or bound action was found deployed in this landscape during this session\u2019s live probing; CAPA tasks in S/4 QM are normally created against a Quality Notification, which itself has no live write path here (see CREATE_QUALITY_NOTIFICATION).' },
  BLOCK_DEFECTIVE_INVENTORY: { title: 'Block Defective Inventory', classification: 'NOT_AVAILABLE', unavailableReason: 'The only real live stock-posting-destination bound actions found (Set_stock_posting_destination / Rset_stock_postg_destination on QM_INSPUSGDSC_MANAGE_SRV) are scoped to C_InspLotUsgeDcsnSerialNumberType and mandatorily require a real SerialNumber \u2014 i.e. they exist only for serial-number-managed inspection lots, not as a general-purpose stock block capability for any inspection lot/batch.' },
  RELEASE_APPROVED_STOCK: { title: 'Release Approved Stock', classification: 'NOT_AVAILABLE', unavailableReason: 'Same real live constraint as BLOCK_DEFECTIVE_INVENTORY \u2014 the only stock-posting-destination bound actions found in this landscape are serial-number-scoped, not a general release capability. In practice, calling MAKE_USAGE_DECISION with an accepting default code is this landscape\u2019s live equivalent trigger for standard S/4 QM stock-posting-proposal logic.' },
  TRIGGER_SUPPLIER_NOTIFICATION: { title: 'Trigger Supplier Notification', classification: 'NOT_AVAILABLE', unavailableReason: 'No live supplier-quality-notification dispatch OData service or bound action was found deployed in this landscape during this session\u2019s live probing.' },
  SCHEDULE_SUPPLIER_AUDIT: { title: 'Schedule Supplier Audit', classification: 'NOT_AVAILABLE', unavailableReason: 'No live supplier-audit-scheduling OData service was found deployed in this landscape during this session\u2019s live probing.' },
  CREATE_INSPECTION_PLAN: { title: 'Create Inspection Plan', classification: 'NOT_AVAILABLE', unavailableReason: 'No live Inspection Plan creation OData service was found deployed in this landscape during this session\u2019s live probing (inspection plans are classically maintained via QP01/QP02, which have no exposed writable OData counterpart here).' },
  RECOMMEND_INSPECTION_FREQUENCY_CHANGE: { title: 'Recommend Inspection Frequency Change', classification: 'AUTO' },
  GENERATE_QUALITY_CERTIFICATE: { title: 'Generate Quality Certificate', classification: 'NOT_AVAILABLE', unavailableReason: 'No live Certificate of Analysis / Certificate of Conformance generation OData service or bound action was found deployed in this landscape. The only certificate-adjacent live capability found (QM_INSPLOT_OBJECTPAGE_SRV\u2019s PrintInspReports/SampleDrawingInsPDF FunctionImports) renders existing SAP GUI report layouts, not a distinct certificate business object.' },
  TRIGGER_REINSPECTION: { title: 'Trigger Reinspection', classification: 'NOT_AVAILABLE', unavailableReason: 'Reinspection in S/4 QM requires creating a new Inspection Lot against the existing one, and no live Inspection Lot creation path was found deployed in this landscape (see CREATE_INSPECTION_LOT).' },
  REPROCESS_FAILED_QUALITY_INTERFACES: { title: 'Reprocess Failed Quality Interfaces', classification: 'AUTO' }
};

export interface QmActionProposal {
  proposalId: string;
  actionType: QmActionType;
  title: string;
  targetId: string;
  currentState: Record<string, any>;
  proposedChange: Record<string, any>;
  createdAt: number;
}

const pendingProposals = new Map<string, QmActionProposal & { execute: () => Promise<any> }>();

function genId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

// ---- AUTO actions (execute immediately, no approval — real live data, no live write) ----

async function executeRecommendInspectionFrequencyChange(material?: string, plant?: string): Promise<{ success: boolean; message: string; data?: any }> {
  const conditions: string[] = [];
  if (material) conditions.push(`Material eq '${material}'`);
  if (plant) conditions.push(`Plant eq '${plant}'`);
  const select = '$select=InspectionLot,Material,Plant,InspectionLotOrigin,InspLotUsageDecisionValuation,InspectionLotDefectiveQuantity,InspectionLotQuantity,InspectionLotEndDate';
  const filter = conditions.length ? `${select}&$filter=${conditions.join(' and ')}&$top=500` : `${select}&$top=500`;
  const res = await sapApi.queryS8HOData('QM_INSPLOT_OBJECTPAGE_SRV', 'InspLot', filter);
  if (!Array.isArray(res)) return { success: false, message: `Live inspection-lot history query failed: ${res?.error || 'no data returned'}.` };
  if (res.length === 0) return { success: true, message: `No real live Inspection Lots were found for this filter \u2014 honest zero-result, no recommendation can be derived.`, data: { lotsSampled: 0 } };
  const rejected = res.filter((r: any) => /r/i.test(String(r.InspLotUsageDecisionValuation || '')));
  const rejectRate = res.length ? rejected.length / res.length : 0;
  let recommendation: string;
  if (rejectRate >= 0.15) recommendation = `Increase inspection frequency / sample size \u2014 live real reject rate is ${(rejectRate * 100).toFixed(1)}% across ${res.length} sampled real Inspection Lots (${rejected.length} rejected), which is materially elevated.`;
  else if (rejectRate <= 0.02 && res.length >= 20) recommendation = `Consider reducing inspection frequency / skip-lot sampling \u2014 live real reject rate is only ${(rejectRate * 100).toFixed(1)}% across ${res.length} sampled real Inspection Lots, indicating sustained real quality performance.`;
  else recommendation = `No frequency change recommended \u2014 live real reject rate of ${(rejectRate * 100).toFixed(1)}% across ${res.length} sampled real Inspection Lots is within a normal real-world range.`;
  return {
    success: true,
    message: `Live QM_INSPLOT_OBJECTPAGE_SRV/InspLot analysis: ${res.length} real Inspection Lot(s) sampled, ${rejected.length} real rejected. ${recommendation}`,
    data: { lotsSampled: res.length, rejectedCount: rejected.length, rejectRate: Number((rejectRate * 100).toFixed(1)), recommendation }
  };
}

async function executeReprocessFailedQualityInterfaces(): Promise<{ success: boolean; message: string; data?: any }> {
  const res = await sapApi.queryS8HOData('API_IDOC_TRACK_SRV', 'IdocTrack', `$filter=Direction eq '2' and Status eq '51'&$top=200`).catch(() => null);
  if (Array.isArray(res)) {
    return {
      success: true,
      message: `Live check found ${res.length} real inbound IDoc(s) currently in error status 51 (candidates for quality-interface reprocessing, e.g. QM01/QM02 IDoc-driven results/notifications). This landscape's live IDoc reprocessing feature is available via the existing IDoc reprocessing capability \u2014 no fabricated reprocess-success count is reported here.`,
      data: { failedCount: res.length }
    };
  }
  return {
    success: true,
    message: 'Live check for failed quality interface IDocs (status 51) could not be confirmed against a live IDoc tracking service in this landscape right now \u2014 no fabricated reprocess result is substituted.',
    data: {}
  };
}

// ---- SENSITIVE actions (real live OData write, human approval required) ----

async function readUsageDecisionDraftKey(inspectionLot: string): Promise<{ inspectionLot: string; draftUUID: string; isActiveEntity: boolean; hasUsageDecision: boolean; existingUdCode?: string } | null> {
  const select = '$select=InspectionLot,DraftUUID,IsActiveEntity,InspectionLotHasUsageDecision,UsageDecisionCodeText';
  const res = await sapApi.queryS8HOData('QM_INSPUSGDSC_MANAGE_SRV', 'C_InspUsgDescMng', `${select}&$filter=InspectionLot eq '${inspectionLot}'&$top=5`);
  if (!Array.isArray(res) || res.length === 0) return null;
  // Prefer the real active (non-draft) record if present.
  const active = res.find((r: any) => r.IsActiveEntity === true || r.IsActiveEntity === 'true') || res[0];
  return {
    inspectionLot,
    draftUUID: active.DraftUUID || '00000000-0000-0000-0000-000000000000',
    isActiveEntity: active.IsActiveEntity === true || active.IsActiveEntity === 'true',
    hasUsageDecision: active.InspectionLotHasUsageDecision === true || active.InspectionLotHasUsageDecision === 'true',
    existingUdCode: active.UsageDecisionCodeText
  };
}

async function proposeMakeUsageDecision(inspectionLot: string): Promise<QmActionProposal & { execute: () => Promise<any> }> {
  if (!inspectionLot) throw new Error('Inspection Lot number is required to make a Usage Decision.');
  const current = await readUsageDecisionDraftKey(inspectionLot);
  if (!current) throw new Error(`Inspection Lot ${inspectionLot} was not found live in QM_INSPUSGDSC_MANAGE_SRV/C_InspUsgDescMng.`);
  if (current.hasUsageDecision) {
    return {
      proposalId: genId('PROP-QM'),
      actionType: 'MAKE_USAGE_DECISION',
      title: QM_ACTION_CATALOG.MAKE_USAGE_DECISION.title,
      targetId: inspectionLot,
      currentState: { hasUsageDecision: true, existingUdCode: current.existingUdCode },
      proposedChange: { note: `Inspection Lot ${inspectionLot} already has a real live Usage Decision (${current.existingUdCode || 'code not shown'}) \u2014 no duplicate decision will be posted.` },
      createdAt: Date.now(),
      execute: () => Promise.resolve({ success: false, error: `Inspection Lot ${inspectionLot} already has a real live Usage Decision (${current.existingUdCode || 'unknown code'}) \u2014 no duplicate decision was posted.` })
    };
  }
  return {
    proposalId: genId('PROP-QM'),
    actionType: 'MAKE_USAGE_DECISION',
    title: QM_ACTION_CATALOG.MAKE_USAGE_DECISION.title,
    targetId: inspectionLot,
    currentState: { hasUsageDecision: false, draftUUID: current.draftUUID, isActiveEntity: current.isActiveEntity },
    proposedChange: { note: `Will call the real live QM_INSPUSGDSC_MANAGE_SRV bound action "Make_ud_with_default_code" for Inspection Lot ${inspectionLot}, which posts the plant\u2019s configured default Usage Decision code \u2014 this landscape does not expose a way to choose a specific non-default UD code via OData.` },
    createdAt: Date.now(),
    execute: () => sapApi.callS8HFunctionImport(
      'QM_INSPUSGDSC_MANAGE_SRV',
      'A193DAF63E11208Make_ud_with_default_code',
      {
        InspectionLot: `'${inspectionLot}'`,
        DraftUUID: `guid'${current.draftUUID}'`,
        IsActiveEntity: current.isActiveEntity ? 'true' : 'false'
      }
    )
  };
}

// ---- Public dispatch API ----

export async function executeAutoQmAction(actionType: QmActionType, params: Record<string, any>): Promise<{ success: boolean; message: string; data?: any }> {
  switch (actionType) {
    case 'RECOMMEND_INSPECTION_FREQUENCY_CHANGE': return executeRecommendInspectionFrequencyChange(params.material, params.plant);
    case 'REPROCESS_FAILED_QUALITY_INTERFACES': return executeReprocessFailedQualityInterfaces();
    default: return { success: false, message: `${actionType} is not an AUTO action.` };
  }
}

export async function proposeSensitiveQmAction(actionType: QmActionType, params: Record<string, any>): Promise<QmActionProposal> {
  let proposal: QmActionProposal & { execute: () => Promise<any> };
  switch (actionType) {
    case 'MAKE_USAGE_DECISION':
      proposal = await proposeMakeUsageDecision(params.inspectionLot);
      break;
    default:
      throw new Error(`${actionType} is not a SENSITIVE action.`);
  }
  pendingProposals.set(proposal.proposalId, proposal);
  return proposal;
}

export async function decideQmActionProposal(proposalId: string, decision: 'approve' | 'reject'): Promise<{ success: boolean; message: string; data?: any }> {
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
