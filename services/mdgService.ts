export interface MdgChangeRequest {
  changeRequestId: string;
  changeRequestType: 'CREATE_BP_CUSTOMER' | 'CREATE_BP_VENDOR' | 'CREATE_MATERIAL_MM' | 'CREATE_FINANCE_GL' | 'UPDATE_BP_DATA';
  domain: 'CUSTOMER' | 'VENDOR' | 'MATERIAL' | 'FINANCE';
  title: string;
  requestedBy: string;
  createdTimestamp: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'DUPLICATE_CHECK_PASSED' | 'APPROVED_REPLICATED' | 'REJECTED';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  targetRecordId?: string;
  payloadSummary: Record<string, any>;
  governanceValidationStatus: 'PASSED_CLEAN' | 'WARNING_DUPLICATE_SUSPECT' | 'FAILED_RULE_VIOLATION';
  aiDuplicateScorePercent: number;
  aiGovernanceCheckNote: string;
}

export interface MdgApprovalResult {
  changeRequestId: string;
  actionTaken: 'APPROVED' | 'REJECTED';
  masterDataIdCreated: string;
  s4ReplicationStatus: 'REPLICATED_S4_LIVE' | 'QUEUED_CPI_OUTBOUND';
  replicationSystems: string[];
  processedTimestamp: string;
  aiAuditSummary: string;
}

export interface MdgDuplicateCheckResult {
  searchTerm: string;
  domain: 'CUSTOMER' | 'VENDOR' | 'MATERIAL' | 'FINANCE';
  totalMatchedRecordsCount: number;
  highestMatchConfidencePercent: number;
  duplicateSuspects: {
    recordId: string;
    recordName: string;
    taxIdOrVat?: string;
    addressCity?: string;
    matchScorePercent: number;
    matchReason: string;
  }[];
  aiDuplicateVerdict: string;
}

export interface MdgDataQualityAudit {
  domain: 'CUSTOMER' | 'VENDOR' | 'MATERIAL' | 'FINANCE' | 'OVERALL';
  overallQualityIndexScore: number; // e.g. 96.8
  totalRecordsAudited: number;
  completenessRatePercent: number;
  uniquenessRatePercent: number;
  conformityRatePercent: number;
  topRuleViolations: { ruleId: string; description: string; violationCount: number }[];
  aiQualityImprovementRecommendation: string;
}

export class MdgService {
  private static changeRequests: MdgChangeRequest[] = [
    {
      changeRequestId: 'CR-MDG-880192',
      changeRequestType: 'CREATE_BP_CUSTOMER',
      domain: 'CUSTOMER',
      title: 'Create Customer Master: Heidelberg Precision Engineering GmbH',
      requestedBy: 'Claire Dupont (Sales Operations)',
      createdTimestamp: '2026-08-01 19:45 CET',
      status: 'UNDER_REVIEW',
      priority: 'HIGH',
      targetRecordId: 'CUST-DE-100298',
      payloadSummary: {
        companyName: 'Heidelberg Precision Engineering GmbH',
        country: 'DE',
        city: 'Heidelberg',
        taxId: 'DE811209845',
        reconciliationAccount: '121000 (Trade Receivables)'
      },
      governanceValidationStatus: 'PASSED_CLEAN',
      aiDuplicateScorePercent: 3.2,
      aiGovernanceCheckNote: 'Agentic MDG Rule Check: Passed mandatory ISO tax ID verification, IBAN structure valid, 0 duplicate matches detected against S/4HANA BP table KNA1.'
    },
    {
      changeRequestId: 'CR-MDG-880193',
      changeRequestType: 'CREATE_MATERIAL_MM',
      domain: 'MATERIAL',
      title: 'Create Material Master: Industrial Lithium-Ion Cell Pack 48V',
      requestedBy: 'Dr. Aris Thorne (PLM Engineering)',
      createdTimestamp: '2026-08-01 20:10 CET',
      status: 'DUPLICATE_CHECK_PASSED',
      priority: 'MEDIUM',
      targetRecordId: 'MAT-3000982',
      payloadSummary: {
        materialDescription: 'Industrial Lithium-Ion Cell Pack 48V 200Ah',
        materialType: 'FERT (Finished Product)',
        materialGroup: 'ELEC-BATTERY-04',
        baseUnitOfMeasure: 'EA (Each)'
      },
      governanceValidationStatus: 'PASSED_CLEAN',
      aiDuplicateScorePercent: 1.5,
      aiGovernanceCheckNote: 'Agentic MDG Rule Check: EAN/UPC barcode generated, Sales/Plant views pre-validated for Plant 1010, EHS hazardous battery class attached.'
    }
  ];

  private static qualityAudits: MdgDataQualityAudit[] = [
    {
      domain: 'OVERALL',
      overallQualityIndexScore: 97.4,
      totalRecordsAudited: 124500,
      completenessRatePercent: 98.2,
      uniquenessRatePercent: 99.1,
      conformityRatePercent: 95.0,
      topRuleViolations: [
        { ruleId: 'BR_BP_TAX_ID_MISSING', description: 'EU Business Partners lacking VIES VAT Registration ID', violationCount: 42 },
        { ruleId: 'BR_MM_HS_CODE_BLANK', description: 'Export Finished Goods without GTS HS Tariff Code', violationCount: 18 }
      ],
      aiQualityImprovementRecommendation: 'Agentic MDG Data Quality AI: Overall master data health is 97.4%. Automated enrichment suggested for 42 EU Business Partners lacking VAT IDs via VIES real-time lookup.'
    }
  ];

  public static async getChangeRequests(domainOrId?: string): Promise<MdgChangeRequest[]> {
    if (domainOrId) {
      return this.changeRequests.filter(cr => 
        cr.domain.toLowerCase().includes(domainOrId.toLowerCase()) || 
        cr.changeRequestId.toLowerCase().includes(domainOrId.toLowerCase()) ||
        cr.title.toLowerCase().includes(domainOrId.toLowerCase())
      );
    }
    return this.changeRequests;
  }

  public static async createChangeRequest(
    domain: 'CUSTOMER' | 'VENDOR' | 'MATERIAL' | 'FINANCE',
    title: string,
    payload: Record<string, any>
  ): Promise<MdgChangeRequest> {
    const newCr: MdgChangeRequest = {
      changeRequestId: `CR-MDG-${Math.floor(100000 + Math.random() * 900000)}`,
      changeRequestType: domain === 'CUSTOMER' ? 'CREATE_BP_CUSTOMER' : domain === 'VENDOR' ? 'CREATE_BP_VENDOR' : domain === 'MATERIAL' ? 'CREATE_MATERIAL_MM' : 'CREATE_FINANCE_GL',
      domain: domain,
      title: title,
      requestedBy: 'Conversational AI Master Data Agent',
      createdTimestamp: '2026-08-01 20:37 CET',
      status: 'UNDER_REVIEW',
      priority: 'HIGH',
      targetRecordId: `${domain.substring(0, 3)}-NEW-${Math.floor(1000 + Math.random() * 9000)}`,
      payloadSummary: payload,
      governanceValidationStatus: 'PASSED_CLEAN',
      aiDuplicateScorePercent: 2.1,
      aiGovernanceCheckNote: `Agentic MDG Governance Engine: ${domain} master data request validated against S/4HANA governance model rules. Duplicate index 2.1%. Ready for automated workflow approval.`
    };

    this.changeRequests.unshift(newCr);
    return newCr;
  }

  public static async approveChangeRequest(changeRequestId: string): Promise<MdgApprovalResult> {
    const found = this.changeRequests.find(cr => cr.changeRequestId.toLowerCase().includes(changeRequestId.toLowerCase()));
    if (found) {
      found.status = 'APPROVED_REPLICATED';
    }

    const masterId = found?.targetRecordId || `BP-${Math.floor(10000000 + Math.random() * 90000000)}`;

    return {
      changeRequestId: changeRequestId,
      actionTaken: 'APPROVED',
      masterDataIdCreated: masterId,
      s4ReplicationStatus: 'REPLICATED_S4_LIVE',
      replicationSystems: ['S/4HANA Production (S4P)', 'SAP Ariba Network', 'SAP C/4HANA Sales Cloud', 'SAP CPI Middleware'],
      processedTimestamp: '2026-08-01 20:37 CET',
      aiAuditSummary: `Agentic MDG Master Data Approval: Change Request ${changeRequestId} approved and posted. Master Data Record ${masterId} activated and replicated synchronously across 4 enterprise systems.`
    };
  }

  public static async runDuplicateCheck(searchTerm: string, domain: 'CUSTOMER' | 'VENDOR' | 'MATERIAL' | 'FINANCE' = 'CUSTOMER'): Promise<MdgDuplicateCheckResult> {
    return {
      searchTerm: searchTerm,
      domain: domain,
      totalMatchedRecordsCount: 2,
      highestMatchConfidencePercent: 88.5,
      duplicateSuspects: [
        {
          recordId: 'BP-1002901',
          recordName: `${searchTerm} (Existing Plant Branch)`,
          taxIdOrVat: 'DE811209800',
          addressCity: 'Heidelberg',
          matchScorePercent: 88.5,
          matchReason: 'High phonetical & tax registration number similarity (88.5% fuzzy match score).'
        }
      ],
      aiDuplicateVerdict: `Agentic MDG Fuzzy Match Engine: Potential duplicate detected with 88.5% confidence against existing BP 1002901. AI recommends verifying parent-child hierarchy before posting.`
    };
  }

  public static async getDataQualityAudit(domain: 'CUSTOMER' | 'VENDOR' | 'MATERIAL' | 'FINANCE' | 'OVERALL' = 'OVERALL'): Promise<MdgDataQualityAudit> {
    return this.qualityAudits[0];
  }
}
