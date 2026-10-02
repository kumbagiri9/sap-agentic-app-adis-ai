export interface GtsCustomsDeclarationDetail {
  declarationId: string;
  declarationType: 'Export Declaration' | 'Inbound Import Declaration' | 'Transit Bond Declaration';
  countryOfOrigin: string;
  destinationCountry: string;
  hsCode: string;
  customsValueEuros: number;
  dutyRatePct: number;
  dutyAmountEuros: number;
  status: 'Customs Cleared' | 'Duty Assessment Pending' | 'Under Physical Inspection' | 'Customs Hold';
  customsOffice: string;
  declarantName: string;
  aiCustomsValidationInsight: string;
}

export interface GtsDeniedPartyScreeningDetail {
  entityName: string;
  partnerType: 'Customer' | 'Vendor' | 'Freight Forwarder' | 'Bank';
  country: string;
  screeningTimestamp: string;
  matchScorePct: number;
  matchStatus: 'Clear - No Sanction Match' | 'Potential Match - Blocked for Review' | 'Confirmed SPL Match - Blocked';
  matchedListAuthority: 'OFAC SDN List' | 'EU Consolidated Sanctions' | 'UN Security Council' | 'UK HMT Sanctions' | 'None';
  riskCategory: 'Low Risk' | 'Medium Risk - False Positive Candidate' | 'High Risk Sanctions Block';
  aiScreeningRiskAdvice: string;
}

export interface GtsImportExportComplianceDetail {
  licenseId: string;
  tradeDirection: 'Export' | 'Import';
  regulationName: string;
  departureCountry: string;
  destinationCountry: string;
  status: 'License Approved & Active' | 'License Capacity Exceeded' | 'Compliance Audit Block' | 'Under Review';
  eccnClassification: string;
  remainingQuantityQuota: number;
  unitOfMeasure: string;
  aiTradeComplianceInsight: string;
}

export interface GtsTradePreferenceDetail {
  agreementName: string;
  productMaterialId: string;
  productDescription: string;
  preferentialDutyRatePct: number;
  standardMfnDutyRatePct: number;
  originStatus: 'Qualifies - Preferential Origin Certified' | 'Non-Originating' | 'Supplier Declaration Missing';
  regionalValueContentRvcPct: number;
  certificateOfOriginId: string;
  aiPreferenceSavingsInsight: string;
}

export interface GtsGlobalTradeAnalyticsDetail {
  reportingPeriod: string;
  totalExportVolumeEuros: number;
  totalImportVolumeEuros: number;
  totalDutiesPaidEuros: number;
  totalDutySavedViaPreferencesEuros: number;
  deniedPartyBlockCount: number;
  customsReleaseTimeAvgHours: number;
  aiGlobalTradeOptimInsight: string;
}

export class GtsService {
  private static declarations: GtsCustomsDeclarationDetail[] = [
    {
      declarationId: 'CUST-2026-8801',
      declarationType: 'Export Declaration',
      countryOfOrigin: 'Germany (DE)',
      destinationCountry: 'United States (US)',
      hsCode: '8471.30.0100',
      customsValueEuros: 142500,
      dutyRatePct: 0.0,
      dutyAmountEuros: 0,
      status: 'Customs Cleared',
      customsOffice: 'DE004851 Frankfurt Airport Customs',
      declarantName: 'SAP GTS Automated ATLAS Clearance Interface',
      aiCustomsValidationInsight: 'Agentic Customs Clearance Verified: Export declaration automatically validated against EU Dual-Use list and US EAR regulations. Electronic release code (MRN 26DE4851089201) issued.'
    },
    {
      declarationId: 'CUST-2026-8802',
      declarationType: 'Inbound Import Declaration',
      countryOfOrigin: 'Japan (JP)',
      destinationCountry: 'Germany (DE)',
      hsCode: '8504.40.8000',
      customsValueEuros: 88400,
      dutyRatePct: 2.1,
      dutyAmountEuros: 1856.40,
      status: 'Duty Assessment Pending',
      customsOffice: 'DE002101 Hamburg Port Customs',
      declarantName: 'Global Trade Customs Logistics Desk',
      aiCustomsValidationInsight: 'Agentic Duty Calculation: EU-Japan EPA preference code applied, reducing standard MFN tariff from 3.3% to preferential rate of 2.1%. Estimated savings: €1,060.80.'
    }
  ];

  private static screenings: GtsDeniedPartyScreeningDetail[] = [
    {
      entityName: 'Apex International Freight Logistics GmbH',
      partnerType: 'Freight Forwarder',
      country: 'Germany (DE)',
      screeningTimestamp: '2026-08-01 19:40 CET',
      matchScorePct: 0.0,
      matchStatus: 'Clear - No Sanction Match',
      matchedListAuthority: 'None',
      riskCategory: 'Low Risk',
      aiScreeningRiskAdvice: 'Agentic Denied Party Screening: Screened against 48 global sanction databases (OFAC, EU, UN, UK HMT). 0% match probability. Business partner released for transaction.'
    },
    {
      entityName: 'Vostok Energy Supplies Corp',
      partnerType: 'Customer',
      country: 'Turkey (TR)',
      screeningTimestamp: '2026-08-01 16:10 CET',
      matchScorePct: 87.5,
      matchStatus: 'Potential Match - Blocked for Review',
      matchedListAuthority: 'EU Consolidated Sanctions',
      riskCategory: 'Medium Risk - False Positive Candidate',
      aiScreeningRiskAdvice: 'Agentic Compliance Block: Name similarity triggered fuzzy match with sanctioned entity "Vostok Energy PJSC". Order SO-90082 automatically placed on GTS SPL Hold pending manual compliance officer sign-off.'
    }
  ];

  private static complianceLicenses: GtsImportExportComplianceDetail[] = [
    {
      licenseId: 'LIC-EXP-2026-401',
      tradeDirection: 'Export',
      regulationName: 'EAR Dual-Use Control (EC 2021/821)',
      departureCountry: 'Germany (DE)',
      destinationCountry: 'Singapore (SG)',
      status: 'License Approved & Active',
      eccnClassification: '5A002.a.1',
      remainingQuantityQuota: 450,
      unitOfMeasure: 'Units',
      aiTradeComplianceInsight: 'Agentic Export Compliance Check: Dual-use high-performance encryption hardware authorized under EU General Export Authorization (GEA 001). Quota consumption at 55%.'
    }
  ];

  private static tradePreferences: GtsTradePreferenceDetail[] = [
    {
      agreementName: 'EU-UK Trade and Cooperation Agreement (TCA)',
      productMaterialId: 'MAT-30040',
      productDescription: 'Precision Industrial Turbine Assembly',
      preferentialDutyRatePct: 0.0,
      standardMfnDutyRatePct: 4.5,
      originStatus: 'Qualifies - Preferential Origin Certified',
      regionalValueContentRvcPct: 68.4,
      certificateOfOriginId: 'COO-2026-9021',
      aiPreferenceSavingsInsight: 'Agentic Preference Optimization: Regional Value Content (RVC) exceeds 55% threshold requirement under EU-UK TCA. Preferential 0% duty rate yields €18,200 annual tariff savings.'
    }
  ];

  private static globalTradeAnalytics: GtsGlobalTradeAnalyticsDetail = {
    reportingPeriod: 'YTD 2026 (Jan - July)',
    totalExportVolumeEuros: 48500000,
    totalImportVolumeEuros: 32100000,
    totalDutiesPaidEuros: 1420000,
    totalDutySavedViaPreferencesEuros: 890000,
    deniedPartyBlockCount: 3,
    customsReleaseTimeAvgHours: 1.4,
    aiGlobalTradeOptimInsight: 'Agentic Global Trade Performance: 98.6% of export shipments cleared within 2 hours. FTA preference utilization rate at 94.2%, saving €890k in duties YTD. All 3 denied party holds resolved without regulatory infractions.'
  };

  public static async getCustomsDeclaration(declarationId?: string): Promise<GtsCustomsDeclarationDetail> {
    if (declarationId) {
      const found = this.declarations.find(d => d.declarationId.toLowerCase() === declarationId.toLowerCase());
      if (found) return found;
    }
    return this.declarations[0];
  }

  public static async createCustomsDeclaration(type?: string, origin?: string, destination?: string, valueEuros?: number): Promise<GtsCustomsDeclarationDetail> {
    const newId = `CUST-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newDecl: GtsCustomsDeclarationDetail = {
      declarationId: newId,
      declarationType: (type as any) || 'Export Declaration',
      countryOfOrigin: origin || 'Germany (DE)',
      destinationCountry: destination || 'United States (US)',
      hsCode: '8471.30.0000',
      customsValueEuros: valueEuros || 50000,
      dutyRatePct: 0.0,
      dutyAmountEuros: 0,
      status: 'Customs Cleared',
      customsOffice: 'DE004851 Frankfurt Airport Customs',
      declarantName: 'SAP GTS Automated Clearance Agent',
      aiCustomsValidationInsight: `Agentic Customs Filing Executed: Customs Declaration ${newId} created for ${origin || 'DE'} → ${destination || 'US'}. Electronic ATLAS filing completed with instant clearance.`
    };
    this.declarations.unshift(newDecl);
    return newDecl;
  }

  public static async screenDeniedParty(entityName: string): Promise<GtsDeniedPartyScreeningDetail> {
    const found = this.screenings.find(s => s.entityName.toLowerCase().includes(entityName.toLowerCase()));
    if (found) return found;

    return {
      entityName: entityName,
      partnerType: 'Customer',
      country: 'Global',
      screeningTimestamp: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' CET',
      matchScorePct: 0.0,
      matchStatus: 'Clear - No Sanction Match',
      matchedListAuthority: 'None',
      riskCategory: 'Low Risk',
      aiScreeningRiskAdvice: `Agentic Denied Party Screening Complete: Business partner "${entityName}" screened against OFAC, EU, UN, and UK sanction lists. 0% match probability. Transaction approved.`
    };
  }

  public static async getImportExportCompliance(licenseId?: string): Promise<GtsImportExportComplianceDetail> {
    if (licenseId) {
      const found = this.complianceLicenses.find(l => l.licenseId.toLowerCase() === licenseId.toLowerCase());
      if (found) return found;
    }
    return this.complianceLicenses[0];
  }

  public static async getTradePreference(materialId?: string): Promise<GtsTradePreferenceDetail> {
    if (materialId) {
      const found = this.tradePreferences.find(p => p.productMaterialId.toLowerCase().includes(materialId.toLowerCase()));
      if (found) return found;
    }
    return this.tradePreferences[0];
  }

  public static async getGlobalTradeAnalytics(): Promise<GtsGlobalTradeAnalyticsDetail> {
    return this.globalTradeAnalytics;
  }
}
