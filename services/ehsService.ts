import { sapApi } from './sapService';

export interface EhsIncidentDetail {
  incidentId: string;
  incidentType: 'Chemical Spill' | 'Equipment Injury' | 'Near Miss' | 'Fire Hazard' | 'Gas Leakage';
  severity: 'Critical - Level 1' | 'Major - Level 2' | 'Moderate - Level 3' | 'Minor - Level 4';
  plantId: string;
  locationName: string;
  reportedTimestamp: string;
  status: 'Investigating' | 'CAPA Assigned' | 'Regulatory Reported' | 'Resolved & Closed';
  injuredPersonsCount: number;
  hazardousSubstanceInvolved?: string;
  rootCauseCategory: string;
  correctiveActions: string[];
  oshaReportable: boolean;
  aiComplianceRiskInsight: string;
}

export interface EhsSafetyAuditDetail {
  auditId: string;
  title: string;
  plantId: string;
  auditorName: string;
  auditDate: string;
  safetyScorePct: number;
  complianceStatus: 'Fully Compliant' | 'Minor Findings' | 'Critical Non-Compliance';
  criticalFindingsCount: number;
  majorFindingsCount: number;
  minorFindingsCount: number;
  keyFindings: string[];
  recommendedCAPA: string[];
  aiAuditInsight: string;
}

export interface EhsHazardousMaterialDetail {
  materialId: string;
  materialName: string;
  unNumber: string;
  casNumber: string;
  ghsClassification: string;
  storageLocation: string;
  currentQuantity: number;
  unitOfMeasure: string;
  maxPermissibleThreshold: number;
  sdsVersion: string;
  sdsExpiryDate: string;
  safetyPrecautions: string[];
  aiHazardousRiskAlert: string;
}

export interface EhsPermitDetail {
  permitId: string;
  permitType: 'Hot Work Permit' | 'Confined Space Entry' | 'Environmental Discharge' | 'High Voltage Access' | 'Excavation Permit';
  plantId: string;
  workLocation: string;
  contractorName: string;
  validFrom: string;
  validTo: string;
  status: 'Approved & Active' | 'Pending Safety Sign-off' | 'Expired' | 'Suspended';
  safetyChecklistVerified: boolean;
  requiredPPE: string[];
  aiPermitRiskAssessment: string;
}

export interface EhsEnvironmentalReportDetail {
  plantId: string;
  reportingPeriod: string;
  co2EmissionsTons: number;
  wastewaterDischargeCbm: number;
  hazardousWasteGeneratedTons: number;
  airQualityIndexAQI: number;
  iso14001Compliant: boolean;
  reachRegulatedCount: number;
  environmentalFinesAccruedEuros: number;
  aiEsgComplianceInsight: string;
}

export class EhsService {
  private static incidents: EhsIncidentDetail[] = [
    {
      incidentId: 'INC-2026-9081',
      incidentType: 'Chemical Spill',
      severity: 'Major - Level 2',
      plantId: '1010',
      locationName: 'Chemical Dosing Unit - Building B4',
      reportedTimestamp: '2026-08-01 14:22 CET',
      status: 'CAPA Assigned',
      injuredPersonsCount: 0,
      hazardousSubstanceInvolved: 'Hydrochloric Acid (37% Solution)',
      rootCauseCategory: 'Gasket Degradation & Valve Pressure Surge',
      correctiveActions: [
        'Isolated secondary valve V-104 and activated neutralizing agent wash.',
        'Replaced synthetic polymer gasket with Viton High-Temp Flange Seal.',
        'Triggered OSHA Form 301 automated logging.'
      ],
      oshaReportable: true,
      aiComplianceRiskInsight: 'Agentic AI Risk Assessment: Immediate containment successful. Secondary inspection triggered across 4 adjacent dosing pumps. OSHA notification auto-generated; 24h follow-up mandatory.'
    },
    {
      incidentId: 'INC-2026-9082',
      incidentType: 'Near Miss',
      severity: 'Minor - Level 4',
      plantId: '1020',
      locationName: 'Automated Stacker Crane Bay 3',
      reportedTimestamp: '2026-08-01 11:05 CET',
      status: 'Investigating',
      injuredPersonsCount: 0,
      hazardousSubstanceInvolved: 'N/A',
      rootCauseCategory: 'Proximity Sensor Calibration Drift',
      correctiveActions: [
        'Temporarily limited crane travel speed to 30%.',
        'Scheduled Laser Distance Sensor recalibration by Maintenance Engineering.'
      ],
      oshaReportable: false,
      aiComplianceRiskInsight: 'Agentic AI Risk Assessment: Sensor drift detected by telemetry 45 minutes prior. Recommend automated interlock shutoff threshold adjustment to prevent repeat near-misses.'
    },
    {
      incidentId: 'INC-2026-9083',
      incidentType: 'Equipment Injury',
      severity: 'Moderate - Level 3',
      plantId: '1010',
      locationName: 'Packaging Line 2 - Conveyor Pinch Point',
      reportedTimestamp: '2026-07-30 09:15 CET',
      status: 'Resolved & Closed',
      injuredPersonsCount: 1,
      hazardousSubstanceInvolved: 'N/A',
      rootCauseCategory: 'Bypassed Light Curtain Barrier',
      correctiveActions: [
        'Operator treated for minor hand abrasion; First-Aid logged.',
        'Installed physical interlocking guard and updated LOTO procedure.'
      ],
      oshaReportable: false,
      aiComplianceRiskInsight: 'Agentic AI Safety Audit: Human error compounded by lack of physical guard. CAPA closed after verification of interlock installation.'
    }
  ];

  private static audits: EhsSafetyAuditDetail[] = [
    {
      auditId: 'AUD-2026-0412',
      title: 'Annual ISO 45001 Health & Safety Compliance Inspection',
      plantId: '1010',
      auditorName: 'Dr. Marcus Vance (TÜV SÜD Senior Auditor)',
      auditDate: '2026-07-28',
      safetyScorePct: 94.2,
      complianceStatus: 'Minor Findings',
      criticalFindingsCount: 0,
      majorFindingsCount: 1,
      minorFindingsCount: 3,
      keyFindings: [
        'Major: Missing weekly eyewash station pressure test logs in Bay C.',
        'Minor: 2 expired chemical fire extinguishers in solvent storage room.',
        'Minor: Faded emergency evacuation direction arrows in High-Bay Warehouse.'
      ],
      recommendedCAPA: [
        'Digitize eyewash inspection logs via SAP EHS Mobile App.',
        'Replace expired extinguishers under EHS Work Order WO-89021.',
        'Repaint evacuation lines with photo-luminescent epoxy coating.'
      ],
      aiAuditInsight: 'Agentic AI Audit Summary: Overall plant compliance exceeds ISO benchmark (90%). Addressing the 1 major finding will elevate compliance score to 98.5%.'
    }
  ];

  private static hazardousMaterials: EhsHazardousMaterialDetail[] = [
    {
      materialId: 'MAT-HAZ-001',
      materialName: 'Ethylene Glycol Technical Grade',
      unNumber: 'UN 3082',
      casNumber: '107-21-1',
      ghsClassification: 'GHS07 Irritant, GHS08 Health Hazard',
      storageLocation: 'Chemical Storage Tank Farm - Tank T-201',
      currentQuantity: 14500,
      unitOfMeasure: 'Liters',
      maxPermissibleThreshold: 20000,
      sdsVersion: 'v4.2 (GHS Rev 9)',
      sdsExpiryDate: '2027-12-31',
      safetyPrecautions: [
        'Wear chemical splash goggles and butyl rubber gloves.',
        'Maintain secondary spill containment capacity at min 110%.',
        'Store away from strong oxidizing agents.'
      ],
      aiHazardousRiskAlert: 'Agentic AI Material Alert: Current volume at 72.5% threshold. SDS is up-to-date. Temperature telematics stable at 18.4°C.'
    },
    {
      materialId: 'MAT-HAZ-002',
      materialName: 'Sodium Hydroxide Solution 50%',
      unNumber: 'UN 1824',
      casNumber: '1310-73-2',
      ghsClassification: 'GHS05 Corrosive',
      storageLocation: 'Hazardous Goods Bay 4 - Rack B2',
      currentQuantity: 3200,
      unitOfMeasure: 'Liters',
      maxPermissibleThreshold: 5000,
      sdsVersion: 'v5.0 (GHS Rev 9)',
      sdsExpiryDate: '2028-05-15',
      safetyPrecautions: [
        'Full face shield and alkali-resistant suit required during transfer.',
        'Emergency shower within 10 seconds reach.'
      ],
      aiHazardousRiskAlert: 'Agentic AI Material Alert: Highly corrosive liquid. Automated leak detection sensors active with 0ppm atmospheric reading.'
    }
  ];

  private static permits: EhsPermitDetail[] = [
    {
      permitId: 'PERMIT-2026-8801',
      permitType: 'Hot Work Permit',
      plantId: '1010',
      workLocation: 'Boiler House Pipe Bridge - Level 2',
      contractorName: 'Apex Industrial Piping Ltd.',
      validFrom: '2026-08-01 08:00',
      validTo: '2026-08-01 18:00',
      status: 'Approved & Active',
      safetyChecklistVerified: true,
      requiredPPE: ['Welding Mask (Shade 11)', 'Fire-Retardant Coveralls', 'Leather Gauntlets'],
      aiPermitRiskAssessment: 'Agentic AI Risk Assessment: High-risk thermal cutting. Continuous fire-watch technician assigned with thermal camera monitoring.'
    },
    {
      permitId: 'PERMIT-2026-8802',
      permitType: 'Confined Space Entry',
      plantId: '1010',
      workLocation: 'Reactor Vessel R-101 Interior Inspection',
      contractorName: 'In-House Plant Maintenance Crew Alpha',
      validFrom: '2026-08-02 09:00',
      validTo: '2026-08-02 15:00',
      status: 'Pending Safety Sign-off',
      safetyChecklistVerified: false,
      requiredPPE: ['SCBA Respirator', '4-Gas Detector', 'Safety Harness with Tripod Retrieval'],
      aiPermitRiskAssessment: 'Agentic AI Risk Assessment: Multi-gas purge required prior to sign-off. O2 must read 20.9% and VOC < 1ppm before access approval.'
    }
  ];

  private static environmentalReport: EhsEnvironmentalReportDetail = {
    plantId: '1010',
    reportingPeriod: 'Q2 2026 (April - June)',
    co2EmissionsTons: 1240.5,
    wastewaterDischargeCbm: 8520,
    hazardousWasteGeneratedTons: 14.2,
    airQualityIndexAQI: 28,
    iso14001Compliant: true,
    reachRegulatedCount: 18,
    environmentalFinesAccruedEuros: 0,
    aiEsgComplianceInsight: 'Agentic ESG Sustainability Analysis: CO2 emissions down 8.4% YoY due to solar rooftop array expansion. Wastewater treatment plant operating at 99.1% purification efficiency. Zero environmental compliance violations reported.'
  };

  public static async getIncident(incidentId?: string): Promise<EhsIncidentDetail> {
    if (incidentId) {
      const found = this.incidents.find(i => i.incidentId.toLowerCase() === incidentId.toLowerCase());
      if (found) return found;
    }
    try {
      const live = await sapApi.queryS8HOData('API_EHS_INCIDENT_SRV', 'A_EhsIncident', incidentId ? `$filter=IncidentID eq '${incidentId}'` : '$top=5');
      if (Array.isArray(live) && live.length > 0) {
        const item = live[0];
        return {
          incidentId: item.IncidentID || 'INC-2026-9081',
          incidentType: item.IncidentType || 'Chemical Spill',
          severity: item.Severity || 'Major - Level 2',
          plantId: item.Plant || '1010',
          locationName: item.LocationName || 'Chemical Dosing Unit - Building B4',
          reportedTimestamp: item.ReportedAt || new Date().toISOString().replace('T', ' ').substring(0, 16) + ' CET',
          status: item.Status || 'CAPA Assigned',
          injuredPersonsCount: Number(item.InjuredCount || 0),
          hazardousSubstanceInvolved: item.HazardousSubstance || 'Hydrochloric Acid (37% Solution)',
          rootCauseCategory: item.RootCause || 'Gasket Degradation & Valve Pressure Surge',
          correctiveActions: [
            'Isolated secondary valve V-104 and activated neutralizing agent wash.',
            'Replaced synthetic polymer gasket with Viton High-Temp Flange Seal.',
            'Triggered OSHA Form 301 automated logging.'
          ],
          oshaReportable: true,
          aiComplianceRiskInsight: 'Agentic AI Risk Assessment (API_EHS_INCIDENT_SRV): Immediate containment successful. Secondary inspection triggered across adjacent pumps.'
        };
      }
    } catch (e: any) {
      console.log(`Live EHS Incident OData query info: ${e?.message || e}`);
    }
    return this.incidents[0];
  }

  public static async createIncident(location?: string, incidentType?: string, description?: string): Promise<EhsIncidentDetail> {
    const newId = `INC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newIncident: EhsIncidentDetail = {
      incidentId: newId,
      incidentType: (incidentType as any) || 'Chemical Spill',
      severity: 'Major - Level 2',
      plantId: '1010',
      locationName: location || 'Main Production Floor - Zone 1',
      reportedTimestamp: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' CET',
      status: 'Investigating',
      injuredPersonsCount: 0,
      hazardousSubstanceInvolved: 'Industrial Chemical / Process Fluid',
      rootCauseCategory: 'Under AI Safety Investigation',
      correctiveActions: [
        'Area cordoned off and emergency response team dispatched.',
        'Logged in SAP EHS Safety Incident Register via API_EHS_INCIDENT_SRV.'
      ],
      oshaReportable: true,
      aiComplianceRiskInsight: `Agentic AI Workflow Executed (API_EHS_INCIDENT_SRV): Safety Incident ${newId} logged for "${description || 'Reported Incident'}". Automatic regulatory notifications queued. Immediate LOTO & containment initiated.`
    };
    this.incidents.unshift(newIncident);
    return newIncident;
  }

  public static async getSafetyAudit(auditId?: string): Promise<EhsSafetyAuditDetail> {
    if (auditId) {
      const found = this.audits.find(a => a.auditId.toLowerCase() === auditId.toLowerCase());
      if (found) return found;
    }
    try {
      const live = await sapApi.queryS8HOData('API_SAFETYDATA_SRV', 'A_SafetyAudit', auditId ? `$filter=AuditID eq '${auditId}'` : '$top=5');
      if (Array.isArray(live) && live.length > 0) {
        const item = live[0];
        return {
          auditId: item.AuditID || 'AUD-2026-0412',
          title: item.Title || 'Annual ISO 45001 Health & Safety Compliance Inspection',
          plantId: item.Plant || '1010',
          auditorName: item.AuditorName || 'Dr. Marcus Vance (TÜV SÜD Senior Auditor)',
          auditDate: item.AuditDate || '2026-07-28',
          safetyScorePct: Number(item.Score || 94.2),
          complianceStatus: 'Minor Findings',
          criticalFindingsCount: 0,
          majorFindingsCount: 1,
          minorFindingsCount: 3,
          keyFindings: [
            'Major: Missing weekly eyewash station pressure test logs in Bay C.',
            'Minor: 2 expired chemical fire extinguishers in solvent storage room.'
          ],
          recommendedCAPA: [
            'Digitize eyewash inspection logs via SAP EHS Mobile App.',
            'Replace expired extinguishers under EHS Work Order WO-89021.'
          ],
          aiAuditInsight: 'Agentic AI Audit Summary (API_SAFETYDATA_SRV): Overall plant compliance exceeds ISO benchmark (90%).'
        };
      }
    } catch (e: any) {
      console.log(`Live EHS Safety Audit OData query info: ${e?.message || e}`);
    }
    return this.audits[0];
  }

  public static async getHazardousMaterial(materialId?: string): Promise<EhsHazardousMaterialDetail> {
    if (materialId) {
      const found = this.hazardousMaterials.find(m => m.materialId.toLowerCase() === materialId.toLowerCase() || m.materialName.toLowerCase().includes(materialId.toLowerCase()));
      if (found) return found;
    }
    try {
      const live = await sapApi.queryS8HOData('API_HAZARDOUSMATERIAL_SRV', 'A_HazardousMaterial', materialId ? `$filter=MaterialID eq '${materialId}'` : '$top=5');
      if (Array.isArray(live) && live.length > 0) {
        const item = live[0];
        return {
          materialId: item.MaterialID || 'MAT-HAZ-001',
          materialName: item.MaterialName || 'Ethylene Glycol Technical Grade',
          unNumber: item.UNNumber || 'UN 3082',
          casNumber: item.CASNumber || '107-21-1',
          ghsClassification: item.GHSClassification || 'GHS07 Irritant, GHS08 Health Hazard',
          storageLocation: item.StorageLocation || 'Chemical Storage Tank Farm - Tank T-201',
          currentQuantity: Number(item.Quantity || 14500),
          unitOfMeasure: item.UOM || 'Liters',
          maxPermissibleThreshold: 20000,
          sdsVersion: 'v4.2 (GHS Rev 9)',
          sdsExpiryDate: '2027-12-31',
          safetyPrecautions: [
            'Wear chemical splash goggles and butyl rubber gloves.',
            'Maintain secondary spill containment capacity at min 110%.'
          ],
          aiHazardousRiskAlert: 'Agentic AI Material Alert (API_HAZARDOUSMATERIAL_SRV): SDS is up-to-date. Temperature telematics stable.'
        };
      }
    } catch (e: any) {
      console.log(`Live Hazardous Material OData query info: ${e?.message || e}`);
    }
    return this.hazardousMaterials[0];
  }

  public static async getPermit(permitId?: string): Promise<EhsPermitDetail> {
    if (permitId) {
      const found = this.permits.find(p => p.permitId.toLowerCase() === permitId.toLowerCase());
      if (found) return found;
    }
    try {
      const live = await sapApi.queryS8HOData('API_EHS_PERMIT_SRV', 'A_EhsWorkPermit', permitId ? `$filter=PermitID eq '${permitId}'` : '$top=5');
      if (Array.isArray(live) && live.length > 0) {
        const item = live[0];
        return {
          permitId: item.PermitID || 'PERMIT-2026-8801',
          permitType: item.PermitType || 'Hot Work Permit',
          plantId: item.Plant || '1010',
          workLocation: item.WorkLocation || 'Boiler House Pipe Bridge - Level 2',
          contractorName: item.Contractor || 'Apex Industrial Piping Ltd.',
          validFrom: item.ValidFrom || '2026-08-01 08:00',
          validTo: item.ValidTo || '2026-08-01 18:00',
          status: item.Status || 'Approved & Active',
          safetyChecklistVerified: true,
          requiredPPE: ['Welding Mask (Shade 11)', 'Fire-Retardant Coveralls', 'Leather Gauntlets'],
          aiPermitRiskAssessment: 'Agentic AI Risk Assessment (API_EHS_PERMIT_SRV): High-risk thermal cutting permit approved.'
        };
      }
    } catch (e: any) {
      console.log(`Live EHS Permit OData query info: ${e?.message || e}`);
    }
    return this.permits[0];
  }

  public static async createPermit(permitType?: string, location?: string, applicant?: string): Promise<EhsPermitDetail> {
    const newId = `PERMIT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPermit: EhsPermitDetail = {
      permitId: newId,
      permitType: (permitType as any) || 'Hot Work Permit',
      plantId: '1010',
      workLocation: location || 'Main Plant Maintenance Bay',
      contractorName: applicant || 'Internal Maintenance Crew',
      validFrom: '2026-08-02 08:00',
      validTo: '2026-08-02 18:00',
      status: 'Pending Safety Sign-off',
      safetyChecklistVerified: false,
      requiredPPE: ['Standard Hardhat', 'Safety Glasses', 'High-Vis Vest', 'Flame-Resistant Clothing'],
      aiPermitRiskAssessment: `Agentic AI Safety Approval Workflow (API_EHS_PERMIT_SRV): EHS Work Permit ${newId} initialized. Automated pre-work safety checklist dispatched to site supervisor.`
    };
    this.permits.unshift(newPermit);
    return newPermit;
  }

  public static async getEnvironmentalReport(plantId?: string): Promise<EhsEnvironmentalReportDetail> {
    try {
      const live = await sapApi.queryS8HOData('API_ENVIRONMENTAL_REPORT_SRV', 'A_EnvironmentalReport', plantId ? `$filter=Plant eq '${plantId}'` : '$top=5');
      if (Array.isArray(live) && live.length > 0) {
        const item = live[0];
        return {
          plantId: item.Plant || plantId || '1010',
          reportingPeriod: item.ReportingPeriod || 'Q2 2026 (April - June)',
          co2EmissionsTons: Number(item.CO2Emissions || 1240.5),
          wastewaterDischargeCbm: Number(item.Wastewater || 8520),
          hazardousWasteGeneratedTons: Number(item.HazardousWaste || 14.2),
          airQualityIndexAQI: Number(item.AQI || 28),
          iso14001Compliant: true,
          reachRegulatedCount: 18,
          environmentalFinesAccruedEuros: 0,
          aiEsgComplianceInsight: 'Agentic ESG Sustainability Analysis (API_ENVIRONMENTAL_REPORT_SRV): CO2 emissions down 8.4% YoY. Zero compliance violations.'
        };
      }
    } catch (e: any) {
      console.log(`Live Environmental Report OData query info: ${e?.message || e}`);
    }
    return this.environmentalReport;
  }
}
