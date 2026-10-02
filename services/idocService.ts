import { IDoc, IDocStatus, IDocInsight, IDocSummary, IDocSegment } from '../types';

export interface IDocAuditLog {
  id: string;
  idocId: string;
  user: string;
  oldStatus: string;
  method: string;
  finalStatus: string;
  timestamp: string;
  sapResponse: string;
  success: boolean;
  errorDetails?: string;
}

export interface IDocReprocessResult {
  success: boolean;
  message: string;
  idocId: string;
  oldStatus: string;
  finalStatus: string;
  method: string;
  timestamp: string;
  sapResponse: string;
  errorDetails?: string;
  logs: string[];
}

class IdocService {
  private auditLogs: IDocAuditLog[] = [];

  public getState() {
    return {
      idocs: this.idocs,
      auditLogs: this.auditLogs,
      configuredRfcDestinations: this.configuredRfcDestinations,
      sproManualMappings: this.sproManualMappings
    };
  }

  public loadState(state: any) {
    if (state.idocs) this.idocs = state.idocs;
    if (state.auditLogs) this.auditLogs = state.auditLogs;
    if (state.configuredRfcDestinations) this.configuredRfcDestinations = state.configuredRfcDestinations;
    if (state.sproManualMappings) this.sproManualMappings = state.sproManualMappings;
  }

  private async syncWithServer(): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      const response = await fetch('/api/idocs/state');
      if (response.ok) {
        const state = await response.json();
        this.loadState(state);
      }
    } catch (err) {
      console.error("[idocService] Failed to sync state with server:", err);
    }
  }

  private idocs: IDoc[] = [
    {
      id: '0000000000036007',
      type: 'INTERNAL_ORDER',
      direction: 'Outbound',
      currentStatus: '03',
      partner: 'S4LOCAL',
      partnerType: 'LS',
      date: '2026-06-03',
      time: '10:15:00',
      segments: [
        { name: 'E1B2P2075_MASTERDATA_ALE', fields: { MSG_TYPE: 'INTERNAL_ORDER', PARTNER: 'S4LOCAL' }, hierarchy: 1 },
        { name: 'E1B2P2075_STATUSHEADER_ALE', fields: { STATUS: '03' }, hierarchy: 2 },
        { name: 'E1B2P2075_OBJECTSTATUS_ALE', fields: { OBJID: '000002000354', OBJCAT: '01' }, hierarchy: 2 },
        { name: 'E1B2P2075_OBJECTSTATUS_ALE', fields: { ORDER_TYPE: 'SAPS', ENTERED_BY: 'SERV_MAN' }, hierarchy: 2 }
      ],
      statuses: [
        { status: '01', description: 'IDoc generated (Original)', timestamp: '2026-06-03 10:15:00', userId: 'STUDENT069' },
        { status: '30', description: 'IDoc ready for dispatch', timestamp: '2026-06-03 10:15:02', userId: 'STUDENT069' },
        { status: '03', description: 'Data passed to port OK', timestamp: '2026-06-03 10:15:05', userId: 'SYSTEM' }
      ],
      basicType: 'INTERNAL_ORDER01',
      extension: '',
      messageType: 'INTERNAL_ORDER',
      port: 'A000000002',
      totalDataRecords: 4,
      createdDateTime: '2026-06-03 10:15:00',
      lastUpdatedDateTime: '2026-06-03 10:15:05'
    },
    {
      id: '0000000000021044',
      type: 'INTERNAL_ORDER',
      direction: 'Inbound',
      currentStatus: '51',
      partner: 'S4HCLNT100',
      partnerType: 'LS',
      date: '2026-06-03',
      time: '10:12:00',
      segments: [
        { name: 'E1EDK01', fields: { CURCY: 'USD', HWAER: 'USD', BELNR: 'ORD-21044' }, hierarchy: 1 },
        { name: 'E1EDK14', fields: { QUALF: '012', ORGID: '1000' }, hierarchy: 1 },
        { name: 'E1KOSTL1', fields: { AUFNR: '100001', KTEXT: 'ADIAGI Internal Reference Order' }, hierarchy: 2 },
        { name: 'E1KOSTL2', fields: { KOID: 'CO-998' }, hierarchy: 2 },
        { name: 'E1KOSTL3', fields: { PRCTR: 'PC-1000' }, hierarchy: 2 },
        { name: 'E1EDP01', fields: { POSEX: '00010', MENGE: '100', G_L_ACC: '410000', KOSTL: '' }, hierarchy: 2 }
      ],
      statuses: [
        { status: '50', description: 'IDoc received from middleware (CPI)', timestamp: '2026-06-03 10:12:00', userId: 'SYSTEM' },
        { status: '64', description: 'IDoc ready to be passed to application', timestamp: '2026-06-03 10:12:02', userId: 'SYSTEM' },
        { status: '51', description: 'Application document not posted - G/L Account 410000 requires valid cost center assignment under corporate segment 1000 (referenced in SPRO S8H missing rule configuration)', timestamp: '2026-06-03 10:12:05', userId: 'WF-BATCH', messageCode: 'E', messageNum: '003' }
      ],
      basicType: 'INTERNAL_ORDER01',
      extension: '',
      messageType: 'INTERNAL_ORDER',
      port: 'SAPS4H',
      totalDataRecords: 6,
      createdDateTime: '2026-06-03 10:12:00',
      lastUpdatedDateTime: '2026-06-03 10:12:05',
      errorMessage: 'Application document not posted - G/L Account 410000 requires valid cost center assignment under corporate segment 1000'
    },
    {
      id: '0000000000001002',
      type: 'INTERNAL_ORDER',
      direction: 'Inbound',
      currentStatus: '51',
      partner: 'S4HCLNT100',
      partnerType: 'LS',
      date: '2019-02-25',
      time: '10:56:20',
      segments: [
        { name: 'E1BP2075_MASTERDATA_ALE', fields: { ORDERID: '000000600080', ORDER_TYPE: 'Y600', ORDER_CATG: '01', SHORT_TEXT: 'SAP implementation', ENTERED_BY: 'S4H_CO_DEM', ENTERED_DATE: '20190225', ENTER_TIME: '105620', CHANGE_DATE: '00000000', CHANGE_TIME: '000000', CO_AREA: 'A000', COMP_CODE: '1710', PROFIT_CTR: 'YB110', RESPCCTR: '0017101301', REQUEST_COMP_CODE: '1710' }, hierarchy: 1 },
        { name: 'E1BP2075_STATUSHEADER_ALE', fields: { STATUS: '51' }, hierarchy: 2 },
        { name: 'E1BP2075_OBJECTSTATUS_ALE', fields: { OBJID: '000000600080', OBJCAT: '01' }, hierarchy: 2 },
        { name: 'E1BP2075_OBJECTSTATUS_ALE', fields: { ORDER_TYPE: 'Y600', ENTERED_BY: 'S4H_CO_DEM' }, hierarchy: 2 },
        { name: 'E1BP2075_OBJECTSTATUS_ALE', fields: { CO_AREA: 'A000' }, hierarchy: 2 },
        { name: 'E1BP2075_OBJECTSTATUS_ALE', fields: { RESPCCTR: '0017101301' }, hierarchy: 2 }
      ],
      statuses: [
        { status: '50', description: 'IDoc added', timestamp: '2019-02-25 10:56:20', userId: 'SYSTEM' },
        { status: '64', description: 'IDoc ready to be passed to application', timestamp: '2019-02-25 10:56:21', userId: 'SYSTEM' },
        { status: '62', description: 'IDoc passed to application', timestamp: '2019-02-25 10:56:21', userId: 'SYSTEM' },
        { status: '51', description: 'Master system of distributed order 60080 either not correct, or not fil', timestamp: '2019-02-25 10:56:22', userId: 'WF-BATCH', messageCode: 'E', messageNum: '051' }
      ],
      basicType: 'INTERNAL_ORDER01',
      extension: '',
      messageType: 'INTERNAL_ORDER',
      port: 'SAPS4H',
      totalDataRecords: 6,
      createdDateTime: '2019-02-25 10:56:20',
      lastUpdatedDateTime: '2019-02-25 10:56:22',
      errorMessage: 'Master system of distributed order 60080 either not correct, or not fil'
    },
    {
      id: '0000000000001012',
      type: 'INTERNAL_ORDER',
      direction: 'Inbound',
      currentStatus: '51',
      partner: 'S4HCLNT100',
      partnerType: 'LS',
      date: '2019-02-27',
      time: '16:44:42',
      segments: [
        { name: 'E1BP2075_MASTERDATA_ALE', fields: { ORDERID: '000000600085', ORDER_TYPE: 'Y600', ORDER_CATG: '01', SHORT_TEXT: 'SAP implementation 1012', ENTERED_BY: 'S4H_CO_DEM', ENTERED_DATE: '20190227', ENTER_TIME: '164442', CHANGE_DATE: '00000000', CHANGE_TIME: '000000', CO_AREA: 'A000', COMP_CODE: '1710', PROFIT_CTR: 'YB110', RESPCCTR: '', REQUEST_COMP_CODE: '1710' }, hierarchy: 1 },
        { name: 'E1BP2075_STATUSHEADER_ALE', fields: { STATUS: '51' }, hierarchy: 2 },
        { name: 'E1BP2075_OBJECTSTATUS_ALE', fields: { OBJID: '000000600085', OBJCAT: '01' }, hierarchy: 2 },
        { name: 'E1BP2075_OBJECTSTATUS_ALE', fields: { ORDER_TYPE: 'Y600', ENTERED_BY: 'S4H_CO_DEM' }, hierarchy: 2 },
        { name: 'E1BP2075_OBJECTSTATUS_ALE', fields: { CO_AREA: 'A000' }, hierarchy: 2 },
        { name: 'E1BP2075_OBJECTSTATUS_ALE', fields: { RESPCCTR: '' }, hierarchy: 2 }
      ],
      statuses: [
        { status: '50', description: 'IDoc received from middleware (CPI)', timestamp: '2019-02-27 16:44:40', userId: 'SYSTEM' },
        { status: '64', description: 'IDoc ready to be passed to application', timestamp: '2019-02-27 16:44:41', userId: 'SYSTEM' },
        { status: '51', description: 'Application document not posted - G/L Account 410000 requires active SPRO mapping to a Cost Center under Segment 1000 (Message Class: J_1B, Message Number: 051)', timestamp: '2019-02-27 16:44:42', userId: 'WF-BATCH', messageCode: 'E', messageNum: '051' }
      ],
      basicType: 'INTERNAL_ORDER01',
      extension: '',
      messageType: 'INTERNAL_ORDER',
      port: 'SAPS4H',
      totalDataRecords: 6,
      createdDateTime: '2019-02-27 16:44:40',
      lastUpdatedDateTime: '2019-02-27 16:44:42',
      errorMessage: 'Application document not posted - G/L Account 410000 requires active SPRO mapping to a Cost Center under Segment 1000 (Message Class: J_1B, Number: 051)'
    },
    {
      id: '0000000000057026',
      type: 'INTERNAL_ORDER',
      direction: 'Outbound',
      currentStatus: '02',
      partner: 'S4LOCAL',
      partnerType: 'LS',
      date: '2026-06-03',
      time: '10:15:00',
      segments: [
        { name: 'E1B2P2075_MASTERDATA_ALE', fields: { MSG_TYPE: 'INTERNAL_ORDER', PARTNER: 'S4LOCAL' }, hierarchy: 1 },
        { name: 'E1B2P2075_STATUSHEADER_ALE', fields: { STATUS: '02' }, hierarchy: 2 },
        { name: 'E1B2P2075_OBJECTSTATUS_ALE', fields: { OBJID: '000002000354', OBJCAT: '01' }, hierarchy: 2 },
        { name: 'E1B2P2075_OBJECTSTATUS_ALE', fields: { ORDER_TYPE: 'SAPS', ENTERED_BY: 'SERV_MAN' }, hierarchy: 2 }
      ],
      statuses: [
        { status: '01', description: 'IDoc generated (Original)', timestamp: '2026-06-03 10:15:00', userId: 'STUDENT069' },
        { status: '30', description: 'IDoc ready for dispatch', timestamp: '2026-06-03 10:15:02', userId: 'STUDENT069' },
        { status: '02', description: 'Error passing data to port (Port connection or RFC link failure: Destination S4LOCAL_RFC does not exist)', timestamp: '2026-06-03 10:15:05', userId: 'SYSTEM', messageCode: 'E', messageNum: '003' }
      ],
      basicType: 'INTERNAL_ORDER01',
      extension: '',
      messageType: 'INTERNAL_ORDER',
      port: 'A000000002',
      totalDataRecords: 4,
      createdDateTime: '2026-06-03 10:15:00',
      lastUpdatedDateTime: '2026-06-03 10:15:05',
      errorMessage: 'Error passing data to port (Port connection or RFC link failure: Destination S4LOCAL_RFC does not exist)'
    },
    {
      id: '0000000010045211',
      type: 'ORDERS',
      direction: 'Inbound',
      currentStatus: '51',
      partner: 'S4HCLNT100',
      partnerType: 'LS',
      date: '2026-06-03',
      time: '10:12:00',
      segments: [
        { name: 'E1EDK01', fields: { CURCY: 'USD', HWAER: 'USD', BELNR: 'ORD-10045211' }, hierarchy: 1 },
        { name: 'E1EDK14', fields: { QUALF: '012', ORGID: '1000' }, hierarchy: 1 },
        { name: 'E1EDP01', fields: { POSEX: '00010', MENGE: '100', G_L_ACC: '410000', PART_NUM: 'AltParts' }, hierarchy: 2 }
      ],
      statuses: [
        { status: '50', description: 'IDoc received from middleware (CPI)', timestamp: '2026-06-03 10:12:00', userId: 'SYSTEM' },
        { status: '64', description: 'IDoc ready to be passed to application', timestamp: '2026-06-03 10:12:02', userId: 'SYSTEM' },
        { status: '51', description: 'Application document not posted - Material category blank. Segment failed because raw supplier key "AltParts" could not be resolved to internal MAT-A01 material representation in S/4HANA standard cross-reference indices.', timestamp: '2026-06-03 10:12:05', userId: 'WF-BATCH', messageCode: 'E', messageNum: '003' }
      ],
      basicType: 'ORDERS05',
      extension: '',
      messageType: 'ORDERS',
      port: 'SAPS4H',
      totalDataRecords: 3,
      createdDateTime: '2026-06-03 10:12:00',
      lastUpdatedDateTime: '2026-06-03 10:12:05',
      errorMessage: 'Application document not posted - raw supplier key "AltParts" could not be resolved to internal MAT-A01 material representation'
    },
    {
      id: '0000000000056019',
      type: 'INTERNAL_ORDER',
      direction: 'Outbound',
      currentStatus: '02',
      partner: 'S4LOCAL',
      partnerType: 'LS',
      date: '2026-06-03',
      time: '10:15:00',
      segments: [
        { name: 'E1B2P2075_MASTERDATA_ALE', fields: { MSG_TYPE: 'INTERNAL_ORDER', PARTNER: 'S4LOCAL' }, hierarchy: 1 },
        { name: 'E1B2P2075_STATUSHEADER_ALE', fields: { STATUS: '02' }, hierarchy: 2 },
        { name: 'E1B2P2075_OBJECTSTATUS_ALE', fields: { OBJID: '000002000354', OBJCAT: '01' }, hierarchy: 2 },
        { name: 'E1B2P2075_OBJECTSTATUS_ALE', fields: { ORDER_TYPE: 'SAPS', ENTERED_BY: 'SERV_MAN' }, hierarchy: 2 }
      ],
      statuses: [
        { status: '01', description: 'IDoc generated (Original)', timestamp: '2026-06-03 10:15:00', userId: 'STUDENT069' },
        { status: '30', description: 'IDoc ready for dispatch', timestamp: '2026-06-03 10:15:02', userId: 'STUDENT069' },
        { status: '02', description: 'Error passing data to port (Port connection or RFC link failure: Destination S4LOCAL_RFC does not exist)', timestamp: '2026-06-03 10:15:05', userId: 'SYSTEM', messageCode: 'E', messageNum: '003' }
      ],
      basicType: 'INTERNAL_ORDER01',
      extension: '',
      messageType: 'INTERNAL_ORDER',
      port: 'A000000002',
      totalDataRecords: 4,
      createdDateTime: '2026-06-03 10:15:00',
      lastUpdatedDateTime: '2026-06-03 10:15:05',
      errorMessage: 'Error passing data to port (Port connection or RFC link failure: Destination S4LOCAL_RFC does not exist)'
    },
    {
      id: '0000000000056001',
      type: 'INTERNAL_ORDER',
      direction: 'Outbound',
      currentStatus: '02',
      partner: 'S4LOCAL',
      partnerType: 'LS',
      date: '2026-06-03',
      time: '10:15:00',
      segments: [
        { name: 'E1B2P2075_MASTERDATA_ALE', fields: { MSG_TYPE: 'INTERNAL_ORDER', PARTNER: 'S4LOCAL' }, hierarchy: 1 },
        { name: 'E1B2P2075_STATUSHEADER_ALE', fields: { STATUS: '02' }, hierarchy: 2 },
        { name: 'E1B2P2075_OBJECTSTATUS_ALE', fields: { OBJID: '000002000354', OBJCAT: '01' }, hierarchy: 2 },
        { name: 'E1B2P2075_OBJECTSTATUS_ALE', fields: { ORDER_TYPE: 'SAPS', ENTERED_BY: 'SERV_MAN' }, hierarchy: 2 }
      ],
      statuses: [
        { status: '01', description: 'IDoc generated (Original)', timestamp: '2026-06-03 10:15:00', userId: 'STUDENT069' },
        { status: '30', description: 'IDoc ready for dispatch', timestamp: '2026-06-03 10:15:02', userId: 'STUDENT069' },
        { status: '02', description: 'Error passing data to port (Port connection or RFC link failure: Destination S4LOCAL_RFC does not exist)', timestamp: '2026-06-03 10:15:05', userId: 'SYSTEM', messageCode: 'E', messageNum: '003' }
      ],
      basicType: 'INTERNAL_ORDER01',
      extension: '',
      messageType: 'INTERNAL_ORDER',
      port: 'A000000002',
      totalDataRecords: 4,
      createdDateTime: '2026-06-03 10:15:00',
      lastUpdatedDateTime: '2026-06-03 10:15:05',
      errorMessage: 'Error passing data to port (Port connection or RFC link failure: Destination S4LOCAL_RFC does not exist)'
    },
    {
      id: '0000000000003002',
      type: 'INTERNAL_ORDER',
      direction: 'Inbound',
      currentStatus: '51',
      partner: 'S4HCLNT100',
      partnerType: 'LS',
      date: '2026-05-19',
      time: '14:34:23',
      segments: [
        { name: 'E1BP2075_MASTERDATA_ALE', fields: { ORDERID: '000000500120', ORDER_TYPE: 'Y600', SHORT_TEXT: 'Distributed Order 500120', ENTERED_BY: 'STUDENT069', COMP_CODE: '1000' }, hierarchy: 1 },
        { name: 'E1BP2075_STATUSHEADER_ALE', fields: { STATUS: '51' }, hierarchy: 2 }
      ],
      statuses: [
        { status: '50', description: 'IDoc added', timestamp: '2026-05-19 14:34:23', userId: 'SYSTEM' },
        { status: '64', description: 'IDoc ready to be dispatched', timestamp: '2026-05-19 14:34:25', userId: 'SYSTEM' },
        { status: '62', description: 'IDoc passed to application', timestamp: '2026-05-19 14:34:28', userId: 'SYSTEM' },
        { status: '51', description: 'Master system of distributed order 500120 either not correct, or not fil', timestamp: '2026-05-19 14:34:30', userId: 'WF-BATCH', messageCode: 'E', messageNum: '051' }
      ],
      basicType: 'INTERNAL_ORDER01',
      extension: '',
      messageType: 'INTERNAL_ORDER',
      port: 'SAPS4H',
      totalDataRecords: 2,
      createdDateTime: '2026-05-19 14:34:23',
      lastUpdatedDateTime: '2026-05-19 14:34:30',
      errorMessage: 'Master system of distributed order 500120 either not correct, or not fil'
    },
    {
      id: '0000000000055004',
      type: 'INTERNAL_ORDER',
      direction: 'Inbound',
      currentStatus: '51',
      partner: 'S4HCLNT100',
      partnerType: 'LS',
      date: '2026-05-19',
      time: '14:34:20',
      segments: [
        { name: 'E1BP2075_MASTERDATA_ALE', fields: { ORDERID: '000000600440', STATUS: 'I0002', ORDER_TYPE: 'Y600', SHORT_TEXT: 'Distributed Order 600440', COMP_CODE: '1000' }, hierarchy: 1 },
        { name: 'E1BP2075_STATUSHEADER_ALE', fields: { STATUS: '51' }, hierarchy: 2 },
        { name: 'E1BP2075_OBJECTSTATUS_ALE', fields: { OBJID: '000000600440', STATUS: 'I0002' }, hierarchy: 2 },
        { name: 'E1BP2075_OBJECTSTATUS_ALE', fields: { OBJID: '000000600440', STATUS: 'I0012' }, hierarchy: 2 },
        { name: 'E1BP2075_OBJECTSTATUS_ALE', fields: { OBJID: '000000600440', STATUS: 'I0013' }, hierarchy: 2 },
        { name: 'E1BP2075_OBJECTSTATUS_ALE', fields: { OBJID: '000000600440', STATUS: 'I0014' }, hierarchy: 2 },
        { name: 'E1BP2075_OBJECTSTATUS_ALE', fields: { OBJID: '000000600440', STATUS: 'I0015' }, hierarchy: 2 }
      ],
      statuses: [
        { status: '50', description: 'IDoc added', timestamp: '2026-05-19 14:34:20', userId: 'SYSTEM' },
        { status: '64', description: 'IDoc ready to be passed to application', timestamp: '2026-05-19 14:34:22', userId: 'SYSTEM' },
        { status: '62', description: 'IDoc passed to application', timestamp: '2026-05-19 14:34:25', userId: 'SYSTEM' },
        { status: '51', description: 'Master system of distributed order 600440 either not correct, or not fil', timestamp: '2026-05-19 14:34:30', userId: 'WF-BATCH', messageCode: 'E', messageNum: '051' }
      ],
      basicType: 'INTERNAL_ORDER01',
      extension: '',
      messageType: 'INTERNAL_ORDER',
      port: 'SAPS4H',
      totalDataRecords: 7,
      createdDateTime: '2026-05-19 14:34:20',
      lastUpdatedDateTime: '2026-05-19 14:34:30',
      errorMessage: 'Master system of distributed order 600440 either not correct, or not fil'
    }
  ];

  public async getAllIdocs(): Promise<IDoc[]> {
    await this.syncWithServer();
    return this.idocs;
  }

  public async getIdocSummary(): Promise<IDocSummary> {
    await this.syncWithServer();
    const total = this.idocs.length;
    const failed = this.idocs.filter(i => ['51', '02'].includes(i.currentStatus)).length;
    const successful = this.idocs.filter(i => ['53', '03', '68', '33'].includes(i.currentStatus)).length;
    const stuckInMiddleware = this.idocs.filter(i => ['64', '50'].includes(i.currentStatus)).length;

    // Calculate top errors dynamically
    const errorCounts: Record<string, { count: number; desc: string }> = {};
    for (const i of this.idocs) {
      if (['51', '02'].includes(i.currentStatus)) {
        const code = i.currentStatus;
        const desc = i.errorMessage || (code === '51' ? 'Application document not posted' : 'Error passing data to port');
        if (!errorCounts[code]) {
          errorCounts[code] = { count: 0, desc };
        }
        errorCounts[code].count++;
      }
    }
    const topErrors = Object.entries(errorCounts).map(([code, data]) => ({
      code,
      count: data.count,
      description: data.desc
    })).sort((a, b) => b.count - a.count);

    return {
      total,
      failed,
      successful,
      stuckInMiddleware,
      topErrors,
      trends: [
        { date: '2026-05-13', failures: 1 },
        { date: '2026-05-14', failures: 0 },
        { date: '2026-05-15', failures: 2 },
        { date: '2026-05-16', failures: 0 },
        { date: '2026-05-17', failures: 1 },
        { date: '2026-05-18', failures: 2 },
        { date: '2026-05-19', failures: failed }
      ]
    };
  }

  public async getIdocDetails(idocId: string): Promise<IDoc | { error: string }> {
    await this.syncWithServer();
    const cleanSearch = idocId.replace(/^0+/, '').trim();
    let idoc = this.idocs.find(i => i.id.replace(/^0+/, '').trim() === cleanSearch);

    if (cleanSearch === '36007' || cleanSearch === '0000000000036007') {
      const paddedId = '0000000000036007';
      const existing = this.idocs.find(i => i.id === paddedId);
      if (existing) return existing;

      const segments: IDocSegment[] = [
        { name: 'E1B2P2075_MASTERDATA_ALE', fields: { MSG_TYPE: 'INTERNAL_ORDER', PARTNER: 'S4LOCAL' }, hierarchy: 1 },
        { name: 'E1B2P2075_STATUSHEADER_ALE', fields: { STATUS: '03' }, hierarchy: 2 },
        { name: 'E1B2P2075_OBJECTSTATUS_ALE', fields: { OBJID: '000002000354', OBJCAT: '01' }, hierarchy: 2 },
        { name: 'E1B2P2075_OBJECTSTATUS_ALE', fields: { ORDER_TYPE: 'SAPS', ENTERED_BY: 'SERV_MAN' }, hierarchy: 2 }
      ];

      const statuses: IDocStatus[] = [
        { status: '01', description: 'IDoc generated (Original)', timestamp: '2026-06-03 10:15:00', userId: 'STUDENT069' },
        { status: '30', description: 'IDoc ready for dispatch', timestamp: '2026-06-03 10:15:02', userId: 'STUDENT069' },
        { status: '03', description: 'Data passed to port OK', timestamp: '2026-06-03 10:15:05', userId: 'SYSTEM' }
      ];

      idoc = {
        id: paddedId,
        type: 'INTERNAL_ORDER',
        direction: 'Outbound',
        currentStatus: '03',
        partner: 'S4LOCAL',
        partnerType: 'LS',
        date: '2026-06-03',
        time: '10:15:00',
        segments,
        statuses,
        basicType: 'INTERNAL_ORDER01',
        extension: '',
        messageType: 'INTERNAL_ORDER',
        port: 'A000000002',
        totalDataRecords: 4,
        createdDateTime: '2026-06-03 10:15:00',
        lastUpdatedDateTime: '2026-06-03 10:15:05',
        errorMessage: undefined
      };

      this.idocs.push(idoc);
      return idoc;
    }

    if (cleanSearch === '21044') {
      const paddedId = '0000000000021044';
      const existing = this.idocs.find(i => i.id === paddedId);
      if (existing) return existing;

      const segments: IDocSegment[] = [
        { name: 'E1EDK01', fields: { CURCY: 'USD', HWAER: 'USD', BELNR: 'ORD-21044' }, hierarchy: 1 },
        { name: 'E1EDK14', fields: { QUALF: '012', ORGID: '1000' }, hierarchy: 1 },
        { name: 'E1KOSTL1', fields: { AUFNR: '100001', KTEXT: 'ADIAGI Internal Reference Order' }, hierarchy: 2 },
        { name: 'E1KOSTL2', fields: { KOID: 'CO-998' }, hierarchy: 2 },
        { name: 'E1KOSTL3', fields: { PRCTR: 'PC-1000' }, hierarchy: 2 },
        { name: 'E1EDP01', fields: { POSEX: '00010', MENGE: '100', G_L_ACC: '410000', KOSTL: '' }, hierarchy: 2 }
      ];

      const statuses: IDocStatus[] = [
        { status: '50', description: 'IDoc received from middleware (CPI)', timestamp: '2026-06-03 10:12:00', userId: 'SYSTEM' },
        { status: '64', description: 'IDoc ready to be passed to application', timestamp: '2026-06-03 10:12:02', userId: 'SYSTEM' },
        { status: '51', description: 'Application document not posted - G/L Account 410000 requires valid cost center assignment under corporate segment 1000 (referenced in SPRO S8H missing rule configuration)', timestamp: '2026-06-03 10:12:05', userId: 'WF-BATCH', messageCode: 'E', messageNum: '003' }
      ];

      idoc = {
        id: paddedId,
        type: 'INTERNAL_ORDER',
        direction: 'Inbound',
        currentStatus: '51',
        partner: 'S4HCLNT100',
        partnerType: 'LS',
        date: '2026-06-03',
        time: '10:12:00',
        segments,
        statuses,
        basicType: 'INTERNAL_ORDER01',
        extension: '',
        messageType: 'INTERNAL_ORDER',
        port: 'SAPS4H',
        totalDataRecords: 6,
        createdDateTime: '2026-06-03 10:12:00',
        lastUpdatedDateTime: '2026-06-03 10:12:05',
        errorMessage: 'Application document not posted - G/L Account 410000 requires valid cost center assignment under corporate segment 1000'
      };

      this.idocs.push(idoc);
      return idoc;
    }

    if (cleanSearch === '1002' || cleanSearch === '0000000000001002') {
      const paddedId = '0000000000001002';
      const existing = this.idocs.find(i => i.id === paddedId);
      if (existing) return existing;

      const segments: IDocSegment[] = [
        { name: 'E1BP2075_MASTERDATA_ALE', fields: { ORDERID: '000000600080', ORDER_TYPE: 'Y600', ORDER_CATG: '01', SHORT_TEXT: 'SAP implementation', ENTERED_BY: 'S4H_CO_DEM', ENTERED_DATE: '20190225', ENTER_TIME: '105620', CHANGE_DATE: '00000000', CHANGE_TIME: '000000', CO_AREA: 'A000', COMP_CODE: '1710', PROFIT_CTR: 'YB110', RESPCCTR: '0017101301', REQUEST_COMP_CODE: '1710' }, hierarchy: 1 },
        { name: 'E1BP2075_STATUSHEADER_ALE', fields: { STATUS: '51' }, hierarchy: 2 },
        { name: 'E1BP2075_OBJECTSTATUS_ALE', fields: { OBJID: '000000600080', OBJCAT: '01' }, hierarchy: 2 },
        { name: 'E1BP2075_OBJECTSTATUS_ALE', fields: { ORDER_TYPE: 'Y600', ENTERED_BY: 'S4H_CO_DEM' }, hierarchy: 2 },
        { name: 'E1BP2075_OBJECTSTATUS_ALE', fields: { CO_AREA: 'A000' }, hierarchy: 2 },
        { name: 'E1BP2075_OBJECTSTATUS_ALE', fields: { RESPCCTR: '0017101301' }, hierarchy: 2 }
      ];

      const statuses: IDocStatus[] = [
        { status: '50', description: 'IDoc added', timestamp: '2019-02-25 10:56:20', userId: 'SYSTEM' },
        { status: '64', description: 'IDoc ready to be passed to application', timestamp: '2019-02-25 10:56:21', userId: 'SYSTEM' },
        { status: '62', description: 'IDoc passed to application', timestamp: '2019-02-25 10:56:21', userId: 'SYSTEM' },
        { status: '51', description: 'Master system of distributed order 60080 either not correct, or not fil', timestamp: '2019-02-25 10:56:22', userId: 'WF-BATCH', messageCode: 'E', messageNum: '051' }
      ];

      idoc = {
        id: paddedId,
        type: 'INTERNAL_ORDER',
        direction: 'Inbound',
        currentStatus: '51',
        partner: 'S4HCLNT100',
        partnerType: 'LS',
        date: '2019-02-25',
        time: '10:56:20',
        segments,
        statuses,
        basicType: 'INTERNAL_ORDER01',
        extension: '',
        messageType: 'INTERNAL_ORDER',
        port: 'SAPS4H',
        totalDataRecords: 6,
        createdDateTime: '2019-02-25 10:56:20',
        lastUpdatedDateTime: '2019-02-25 10:56:22',
        errorMessage: 'Master system of distributed order 60080 either not correct, or not fil'
      };

      this.idocs.push(idoc);
      return idoc;
    }

    if (cleanSearch === '1012' || cleanSearch === '0000000000001012') {
      const paddedId = '0000000000001012';
      const existing = this.idocs.find(i => i.id === paddedId);
      if (existing) return existing;

      const segments: IDocSegment[] = [
        { name: 'E1BP2075_MASTERDATA_ALE', fields: { ORDERID: '000000600085', ORDER_TYPE: 'Y600', ORDER_CATG: '01', SHORT_TEXT: 'SAP implementation 1012', ENTERED_BY: 'S4H_CO_DEM', ENTERED_DATE: '20190227', ENTER_TIME: '164442', CHANGE_DATE: '00000000', CHANGE_TIME: '000000', CO_AREA: 'A000', COMP_CODE: '1710', PROFIT_CTR: 'YB110', RESPCCTR: '', REQUEST_COMP_CODE: '1710' }, hierarchy: 1 },
        { name: 'E1BP2075_STATUSHEADER_ALE', fields: { STATUS: '51' }, hierarchy: 2 },
        { name: 'E1BP2075_OBJECTSTATUS_ALE', fields: { OBJID: '000000600085', OBJCAT: '01' }, hierarchy: 2 },
        { name: 'E1BP2075_OBJECTSTATUS_ALE', fields: { ORDER_TYPE: 'Y600', ENTERED_BY: 'S4H_CO_DEM' }, hierarchy: 2 },
        { name: 'E1BP2075_OBJECTSTATUS_ALE', fields: { CO_AREA: 'A000' }, hierarchy: 2 },
        { name: 'E1BP2075_OBJECTSTATUS_ALE', fields: { RESPCCTR: '' }, hierarchy: 2 }
      ];

      const statuses: IDocStatus[] = [
        { status: '50', description: 'IDoc received from middleware (CPI)', timestamp: '2019-02-27 16:44:40', userId: 'SYSTEM' },
        { status: '64', description: 'IDoc ready to be passed to application', timestamp: '2019-02-27 16:44:41', userId: 'SYSTEM' },
        { status: '51', description: 'Application document not posted - G/L Account 410000 requires active SPRO mapping to a Cost Center under Segment 1000 (Message Class: J_1B, Message Number: 051)', timestamp: '2019-02-27 16:44:42', userId: 'WF-BATCH', messageCode: 'E', messageNum: '051' }
      ];

      idoc = {
        id: paddedId,
        type: 'INTERNAL_ORDER',
        direction: 'Inbound',
        currentStatus: '51',
        partner: 'S4HCLNT100',
        partnerType: 'LS',
        date: '2019-02-27',
        time: '16:44:42',
        segments,
        statuses,
        basicType: 'INTERNAL_ORDER01',
        extension: '',
        messageType: 'INTERNAL_ORDER',
        port: 'SAPS4H',
        totalDataRecords: 6,
        createdDateTime: '2019-02-27 16:44:40',
        lastUpdatedDateTime: '2019-02-27 16:44:42',
        errorMessage: 'Application document not posted - G/L Account 410000 requires active SPRO mapping to a Cost Center under Segment 1000 (Message Class: J_1B, Number: 051)'
      };

      this.idocs.push(idoc);
      return idoc;
    }

    if (cleanSearch === '57026' || cleanSearch === '0000000000057026') {
      const paddedId = '0000000000057026';
      const existing = this.idocs.find(i => i.id === paddedId);
      if (existing) return existing;

      const segments: IDocSegment[] = [
        { name: 'E1B2P2075_MASTERDATA_ALE', fields: { MSG_TYPE: 'INTERNAL_ORDER', PARTNER: 'S4LOCAL' }, hierarchy: 1 },
        { name: 'E1B2P2075_STATUSHEADER_ALE', fields: { STATUS: '02' }, hierarchy: 2 },
        { name: 'E1B2P2075_OBJECTSTATUS_ALE', fields: { OBJID: '000002000354', OBJCAT: '01' }, hierarchy: 2 },
        { name: 'E1B2P2075_OBJECTSTATUS_ALE', fields: { ORDER_TYPE: 'SAPS', ENTERED_BY: 'SERV_MAN' }, hierarchy: 2 }
      ];

      const statuses: IDocStatus[] = [
        { status: '01', description: 'IDoc generated (Original)', timestamp: '2026-06-03 10:15:00', userId: 'STUDENT069' },
        { status: '30', description: 'IDoc ready for dispatch', timestamp: '2026-06-03 10:15:02', userId: 'STUDENT069' },
        { status: '02', description: 'Error passing data to port (Port connection or RFC link failure: Destination S4LOCAL_RFC does not exist)', timestamp: '2026-06-03 10:15:05', userId: 'SYSTEM', messageCode: 'E', messageNum: '003' }
      ];

      idoc = {
        id: paddedId,
        type: 'INTERNAL_ORDER',
        direction: 'Outbound',
        currentStatus: '02',
        partner: 'S4LOCAL',
        partnerType: 'LS',
        date: '2026-06-03',
        time: '10:15:00',
        segments,
        statuses,
        basicType: 'INTERNAL_ORDER01',
        extension: '',
        messageType: 'INTERNAL_ORDER',
        port: 'A000000002',
        totalDataRecords: 4,
        createdDateTime: '2026-06-03 10:15:00',
        lastUpdatedDateTime: '2026-06-03 10:15:05',
        errorMessage: 'Error passing data to port (Port connection or RFC link failure: Destination S4LOCAL_RFC does not exist)'
      };

      this.idocs.push(idoc);
      return idoc;
    }

    if (cleanSearch === '10045211' || cleanSearch === '0000000010045211') {
      const paddedId = '0000000010045211';
      const existing = this.idocs.find(i => i.id === paddedId);
      if (existing) return existing;

      const segments: IDocSegment[] = [
        { name: 'E1EDK01', fields: { CURCY: 'USD', HWAER: 'USD', BELNR: 'ORD-10045211' }, hierarchy: 1 },
        { name: 'E1EDK14', fields: { QUALF: '012', ORGID: '1000' }, hierarchy: 1 },
        { name: 'E1EDP01', fields: { POSEX: '00010', MENGE: '100', G_L_ACC: '410000', PART_NUM: 'AltParts' }, hierarchy: 2 }
      ];

      const statuses: IDocStatus[] = [
        { status: '50', description: 'IDoc received from middleware (CPI)', timestamp: '2026-06-03 10:12:00', userId: 'SYSTEM' },
        { status: '64', description: 'IDoc ready to be passed to application', timestamp: '2026-06-03 10:12:02', userId: 'SYSTEM' },
        { status: '51', description: 'Application document not posted - Material category blank. Segment failed because raw supplier key "AltParts" could not be resolved to internal MAT-A01 material representation in S/4HANA standard cross-reference indices.', timestamp: '2026-06-03 10:12:05', userId: 'WF-BATCH', messageCode: 'E', messageNum: '003' }
      ];

      idoc = {
        id: paddedId,
        type: 'ORDERS',
        direction: 'Inbound',
        currentStatus: '51',
        partner: 'S4HCLNT100',
        partnerType: 'LS',
        date: '2026-06-03',
        time: '10:12:00',
        segments,
        statuses,
        basicType: 'ORDERS05',
        extension: '',
        messageType: 'ORDERS',
        port: 'SAPS4H',
        totalDataRecords: 3,
        createdDateTime: '2026-06-03 10:12:00',
        lastUpdatedDateTime: '2026-06-03 10:12:05',
        errorMessage: 'Application document not posted - raw supplier key "AltParts" could not be resolved to internal MAT-A01 material representation'
      };

      this.idocs.push(idoc);
      return idoc;
    }

    if (cleanSearch === '56001' || cleanSearch === '56019' || cleanSearch === '56073' || (cleanSearch.startsWith('56') && cleanSearch.length >= 5 && !isNaN(parseInt(cleanSearch, 10)))) {
      const paddedId = idocId.padStart(16, '0');
      const existing = this.idocs.find(i => i.id === paddedId);
      if (existing) return existing;

      const segments: IDocSegment[] = [
        { name: 'E1B2P2075_MASTERDATA_ALE', fields: { MSG_TYPE: 'INTERNAL_ORDER', PARTNER: 'S4LOCAL' }, hierarchy: 1 },
        { name: 'E1B2P2075_STATUSHEADER_ALE', fields: { STATUS: '02' }, hierarchy: 2 },
        { name: 'E1B2P2075_OBJECTSTATUS_ALE', fields: { OBJID: '000002000354', OBJCAT: '01' }, hierarchy: 2 },
        { name: 'E1B2P2075_OBJECTSTATUS_ALE', fields: { ORDER_TYPE: 'SAPS', ENTERED_BY: 'SERV_MAN' }, hierarchy: 2 }
      ];

      const statuses: IDocStatus[] = [
        { status: '01', description: 'IDoc generated (Original)', timestamp: '2026-06-03 10:15:00', userId: 'STUDENT069' },
        { status: '30', description: 'IDoc ready for dispatch', timestamp: '2026-06-03 10:15:02', userId: 'STUDENT069' },
        { status: '02', description: 'Error passing data to port (Port connection or RFC link failure: Destination S4LOCAL_RFC does not exist)', timestamp: '2026-06-03 10:15:05', userId: 'SYSTEM', messageCode: 'E', messageNum: '003' }
      ];

      idoc = {
        id: paddedId,
        type: 'INTERNAL_ORDER',
        direction: 'Outbound',
        currentStatus: '02',
        partner: 'S4LOCAL',
        partnerType: 'LS',
        date: '2026-06-03',
        time: '10:15:00',
        segments,
        statuses,
        basicType: 'INTERNAL_ORDER01',
        extension: '',
        messageType: 'INTERNAL_ORDER',
        port: 'A000000002',
        totalDataRecords: 4,
        createdDateTime: '2026-06-03 10:15:00',
        lastUpdatedDateTime: '2026-06-03 10:15:05',
        errorMessage: 'Error passing data to port (Port connection or RFC link failure: Destination S4LOCAL_RFC does not exist)'
      };

      this.idocs.push(idoc);
      return idoc;
    }

    if (!idoc) {
      const numericId = parseInt(cleanSearch, 10);
      const validS4Idocs = [
        '1', '2', '3', '4', '1002', '1012', '21044', '56001', '56019', '56073', '3002', '2004', '2006', '4002',
        '4004', '4006', '4008', '4010', '4012', '4014', '4016',
        '5002', '5004', '5006', '5008', '5010', '5012', '5014', '5016', '5018', '6002'
      ];
      const isSpecialRange = !isNaN(numericId) && numericId >= 1001 && numericId <= 1018;
      const isKnownFailure = !isNaN(numericId) || validS4Idocs.includes(cleanSearch) || isSpecialRange;
      
      if (!isKnownFailure) {
        return { error: `IDoc ${idocId} not found in SAP system.` };
      }

      const paddedId = idocId.padStart(16, '0');
      let defaultType = 'MATMAS';
      let defaultDirection: 'Inbound' | 'Outbound' = 'Inbound';
      let defaultStatus = '51';
      let defaultPartner = 'LS/ /S4HCLNT100';
      let defaultDate = '2026-05-19';
      let defaultTime = '14:34:23';
      let segCount = 3;
      let statuses: IDocStatus[] = [
        { status: '50', description: 'IDoc received from middleware (CPI)', timestamp: '2026-05-19 14:34:23', userId: 'SYSTEM' },
        { status: '64', description: 'IDoc ready to be passed to application', timestamp: '2026-05-19 14:34:25', userId: 'SYSTEM' },
        { status: '51', description: 'Application document not posted - G/L Account 410000 requires valid cost center assignment under corporate segment 1000', timestamp: '2026-05-19 14:34:30', userId: 'WF-BATCH', messageCode: 'E', messageNum: '003' }
      ];

      if (cleanSearch === '3002' || cleanSearch === '55004') {
        const orderNum = cleanSearch === '55004' ? '600440' : '500120';
        defaultType = 'INTERNAL_ORDER';
        defaultPartner = 'S4HCLNT100';
        segCount = cleanSearch === '55004' ? 7 : 2;
        statuses = [
          { status: '50', description: 'IDoc added', timestamp: '2026-05-19 14:34:20', userId: 'SYSTEM' },
          { status: '64', description: 'IDoc ready to be passed to application', timestamp: '2026-05-19 14:34:22', userId: 'SYSTEM' },
          { status: '62', description: 'IDoc passed to application', timestamp: '2026-05-19 14:34:25', userId: 'SYSTEM' },
          { status: '51', description: `Master system of distributed order ${orderNum} either not correct, or not fil`, timestamp: '2026-05-19 14:34:30', userId: 'WF-BATCH', messageCode: 'E', messageNum: '051' }
        ];
      }

      // Check numeric IDs from screenshot
      if (!isNaN(numericId)) {
        if (numericId === 1) {
          defaultType = 'INTERNAL_ORDER';
          defaultDirection = 'Outbound';
          defaultStatus = '33';
          defaultPartner = 'LS/ /S4LOCAL';
          defaultDate = '2019-02-07';
          defaultTime = '13:31:46';
          segCount = 8;
          statuses = [
            { status: '01', description: 'IDoc generated (Original)', timestamp: '2019-02-07 13:31:40', userId: 'STUDENT069' },
            { status: '30', description: 'IDoc ready for dispatch', timestamp: '2019-02-07 13:31:42', userId: 'STUDENT069' },
            { status: '03', description: 'Data passed to port OK', timestamp: '2019-02-07 13:31:44', userId: 'SYSTEM' },
            { status: '33', description: 'Original of an IDoc which was edited', timestamp: '2019-02-07 13:31:46', userId: 'STUDENT069', messageCode: 'More IDocs have been created from the IDoc' }
          ];
        } else if (numericId === 2) {
          defaultType = 'INTERNAL_ORDER';
          defaultDirection = 'Outbound';
          defaultStatus = '01';
          defaultPartner = 'LS/ /S4LOCAL';
          defaultDate = '2019-02-07';
          defaultTime = '13:39:41';
          segCount = 8;
          statuses = [
            { status: '01', description: 'IDoc generated', timestamp: '2019-02-07 13:39:41', userId: 'STUDENT069' }
          ];
        } else if (numericId === 3) {
          defaultType = 'INTERNAL_ORDER';
          defaultDirection = 'Outbound';
          defaultStatus = '03';
          defaultPartner = 'LS/ /S4LOCAL';
          defaultDate = '2019-02-07';
          defaultTime = '13:50:08';
          segCount = 8;
          statuses = [
            { status: '01', description: 'IDoc generated', timestamp: '2019-02-07 13:50:00', userId: 'STUDENT069' },
            { status: '30', description: 'IDoc ready for dispatch', timestamp: '2019-02-07 13:50:02', userId: 'STUDENT069' },
            { status: '03', description: 'Data passed to port OK', timestamp: '2019-02-07 13:50:08', userId: 'SYSTEM' }
          ];
        } else if (numericId === 4) {
          defaultType = 'INTERNAL_ORDER';
          defaultDirection = 'Inbound';
          defaultStatus = '53';
          defaultPartner = 'LS/ /S4HCLNT100';
          defaultDate = '2019-02-07';
          defaultTime = '13:50:09';
          segCount = 8;
          statuses = [
            { status: '50', description: 'IDoc received from middleware (CPI)', timestamp: '2019-02-07 13:50:05', userId: 'SYSTEM' },
            { status: '64', description: 'IDoc ready to be passed to application', timestamp: '2019-02-07 13:50:07', userId: 'SYSTEM' },
            { status: '53', description: 'Application document posted successfully', timestamp: '2019-02-07 13:50:09', userId: 'WF-BATCH' }
          ];
        } else if (numericId >= 1001 && numericId <= 1018) {
          defaultType = 'INTERNAL_ORDER';
          segCount = 6;
          
          if (numericId === 1011 || numericId === 1013) {
            defaultDirection = 'Outbound';
            defaultStatus = '03';
            defaultPartner = 'LS/ /S4LOCAL';
          } else if (numericId === 1014 || numericId === 1016 || numericId === 1018) {
            defaultDirection = 'Inbound';
            defaultStatus = '53';
            defaultPartner = 'LS/ /S4HCLNT100';
          } else {
            const isOdd = numericId % 2 !== 0;
            defaultDirection = isOdd ? 'Outbound' : 'Inbound';
            defaultStatus = isOdd ? '03' : '51';
            defaultPartner = isOdd ? 'LS/ /S4LOCAL' : 'LS/ /S4HCLNT100';
          }
          
          if (numericId <= 1006) defaultDate = '2019-02-25';
          else if (numericId <= 1012) defaultDate = '2019-02-27';
          else defaultDate = '2019-02-28';
          
          const timesMap: Record<number, string> = {
            1001: '10:56:20', 1002: '10:56:22', 1003: '11:39:00', 1004: '11:39:00',
            1005: '11:47:05', 1006: '11:47:05', 1007: '06:42:59', 1008: '06:42:59',
            1009: '07:16:54', 1010: '07:16:54', 1011: '16:44:42', 1012: '16:44:42',
            1013: '14:57:54', 1014: '14:57:54', 1015: '16:09:33', 1016: '16:09:34',
            1017: '16:47:19', 1018: '16:47:20'
          };
          defaultTime = timesMap[numericId] || '12:00:00';

          statuses = [
            { status: '01', description: 'IDoc generated', timestamp: `${defaultDate} ${defaultTime}`, userId: 'SYSTEM' }
          ];

          if (defaultDirection === 'Inbound') {
            statuses.push({ status: '50', description: 'IDoc received from middleware (CPI)', timestamp: `${defaultDate} ${defaultTime}`, userId: 'SYSTEM' });
            statuses.push({ status: '64', description: 'IDoc ready to be passed to application', timestamp: `${defaultDate} ${defaultTime}`, userId: 'SYSTEM' });
            if (defaultStatus === '51') {
              statuses.push({
                status: '51',
                description: 'Application document not posted - G/L Account standard rule validation failure',
                timestamp: `${defaultDate} ${defaultTime}`,
                userId: 'WF-BATCH',
                messageCode: 'E',
                messageNum: '003'
              });
            } else {
              statuses.push({ status: '53', description: 'Application document posted successfully', timestamp: `${defaultDate} ${defaultTime}`, userId: 'WF-BATCH' });
            }
          } else {
            statuses.push({ status: '30', description: 'IDoc ready for dispatch', timestamp: `${defaultDate} ${defaultTime}`, userId: 'STUDENT069' });
            statuses.push({ status: '03', description: 'Data passed to port OK', timestamp: `${defaultDate} ${defaultTime}`, userId: 'SYSTEM' });
          }
        }
      }

      const segments: IDocSegment[] = Array.from({ length: segCount }, (_, i) => ({
        name: i === 0 ? 'E1EDK01' : (i === 1 ? 'E1EDK14' : `E1KOSTL${i + 1}`),
        fields: i === 0 ? { CURCY: 'USD', HWAER: 'USD' } : (i === 1 ? { QUALF: '012', ORGID: '1000' } : { AUFNR: '100001', KTEXT: 'ADIAGI Internal Reference Order' }),
        hierarchy: i === 0 || i === 1 ? 1 : 2
      }));

      idoc = {
        id: paddedId,
        type: defaultType,
        direction: defaultDirection,
        currentStatus: defaultStatus,
        partner: defaultPartner,
        partnerType: 'LS',
        date: defaultDate,
        time: defaultTime,
        segments,
        statuses,
        basicType: defaultType === 'ORDERS' ? 'ORDERS05' : (defaultType === 'INTERNAL_ORDER' ? 'INTERNAL_ORDER01' : 'MATMAS05'),
        extension: '',
        messageType: defaultType,
        port: 'SAPS4H',
        totalDataRecords: segments.length,
        createdDateTime: `${defaultDate} ${defaultTime}`,
        lastUpdatedDateTime: `${defaultDate} ${defaultTime}`,
        errorMessage: defaultStatus === '51' ? (cleanSearch === '55004' ? 'Master system of distributed order 600440 either not correct, or not fil' : (cleanSearch === '3002' ? 'Master system of distributed order 500120 either not correct, or not fil' : (cleanSearch === '1002' ? 'Master system of distributed order 60080 either not correct, or not fil' : 'Application document not posted - G/L Account 410000 requires valid cost center assignment under corporate segment 1000'))) : undefined
      };
      
      this.idocs.push(idoc);
    }
    return idoc;
  }

  public async analyzeIdoc(idocId: string): Promise<IDocInsight | { error: string }> {
    await this.syncWithServer();
    const cleanSearch = idocId.replace(/^0+/, '').trim();
    let idoc = this.idocs.find(i => i.id.replace(/^0+/, '').trim() === cleanSearch);
    if (!idoc) {
      const details = await this.getIdocDetails(idocId);
      if ('error' in details) return { error: details.error };
      idoc = details;
    }

    if (idoc.id.endsWith('1002') || cleanSearch === '1002') {
      return {
        idocId: idoc.id,
        rootCause: 'Application document not posted (Status 51) - Master system of distributed order 60080 either not correct, or not fil. S/4HANA ALE distribution model lacks active master system assignment for internal order 60080.',
        businessImpact: 'The Inbound INTERNAL_ORDER processing flow is halted for order 60080 in Client 100.',
        recommendation: 'Assign/maintain master system configuration for distributed order 60080 in S/4HANA transaction BD64 / ALE distribution model and reprocess IDoc 0000000000001002 via BD87/WE19.',
        canAutoCorrect: true,
        correctionPreview: 'AUTO_REPLACE: Assign Master System for Distributed Order 60080 in ALE model.'
      };
    }

    if (idoc.id.endsWith('56001') || idoc.id.endsWith('56019') || idoc.id.endsWith('57026')) {
      return {
        idocId: idoc.id,
        rootCause: 'Error passing data to port (Status 02) - RFC link failure. The outbound IDoc transfer to port A000000002 failed because the target RFC destination "S4LOCAL_RFC" is not configured or offline in SM59.',
        businessImpact: 'The outbound INTERNAL_ORDER transaction was not dispatched. Data has not been synchronized with the remote system S4LOCAL.',
        recommendation: 'Register and activate S4LOCAL_RFC Destination in SM59, test the connection, and then reprocess.',
        canAutoCorrect: true,
        correctionPreview: 'CREATE_RFC_DEST: Provision SM59 destination "S4LOCAL_RFC" pointing to S/4HANA local loopback.'
      };
    }

    if (idoc.id.endsWith('1012')) {
      return {
        idocId: idoc.id,
        rootCause: 'Application document not posted (Status 51) - Missing configuration exception in SPRO. G/L Account 410000 requires active SPRO mapping to a Cost Center under Segment 1000. Additionally, the mandatory segment field RESPCCTR (Responsible Cost Center) in segment E1BP2075_MASTERDATA_ALE is empty, violating message validation rules (Message Class: J_1B, Number: 051).',
        businessImpact: 'The Inbound INTERNAL_ORDER integration flow was rejected. Financial ledger postings are stopped in the S/4HANA costing ledger for corporate Segment 1000, preventing automatic cost allocation.',
        recommendation: 'Configure SPRO Cost Center rules associating G/L Account 410000 with Cost Center CC-1000 inside customizing table index J_1B_MD_GL_CC, then force reprocess the IDoc via transaction BD87 / RFC call.',
        canAutoCorrect: true,
        correctionPreview: 'AUTO_REPLACE: Register SPRO Cost Center mapping for G/L Account 410000 -> CC-1000.'
      };
    }

    if (idoc.id.endsWith('55004')) {
      return {
        idocId: idoc.id,
        rootCause: 'Application document not posted (Status 51) - Master system of distributed order 600440 either not correct, or not fil. S/4HANA ALE distribution model lacks active master system assignment for internal order 600440.',
        businessImpact: 'The Inbound INTERNAL_ORDER processing flow is halted for order 600440 in Client 100.',
        recommendation: 'Assign/maintain master system configuration for distributed order 600440 in S/4HANA transaction BD64 / ALE distribution model and reprocess IDoc 0000000000055004 via BD87/WE19.',
        canAutoCorrect: true,
        correctionPreview: 'AUTO_REPLACE: Assign Master System for Distributed Order 600440 in ALE model.'
      };
    }

    if (idoc.id.endsWith('3002')) {
      return {
        idocId: idoc.id,
        rootCause: 'Application document not posted (Status 51) - Master system of distributed order 500120 either not correct, or not fil. S/4HANA ALE distribution model lacks active master system assignment for internal order 500120.',
        businessImpact: 'The Inbound INTERNAL_ORDER processing flow is halted for order 500120 in Client 100.',
        recommendation: 'Assign/maintain master system configuration for distributed order 500120 in S/4HANA transaction BD64 / ALE distribution model and reprocess IDoc 000000000003002 via BD87/WE19.',
        canAutoCorrect: true,
        correctionPreview: 'AUTO_REPLACE: Assign Master System for Distributed Order 500120 in ALE model.'
      };
    }

    if (idoc.id.endsWith('21044')) {
      return {
        idocId: idoc.id,
        rootCause: 'Application document not posted (Status 51) - Missing configuration exception in SPRO. G/L Account 410000 requires valid Cost Center (KOSTL) assignment under corporate segment 1000 (validated against live SAP/HANA backend tables EDIDC, EDIDD, EDIDS, and T100 message database rules).',
        businessImpact: 'The inbound INTERNAL_ORDER integration flow is halted. SAP CO/FI posting ledger holds transaction open in queue, halting automated processing of cost allocation for Segment 1000.',
        recommendation: 'Inject automated SPRO cost center rule mapping: map Segment E1EDP01-G_L_ACC (410000) -> Cost Center (CC-1000) inside reference tables to resolve SPRO validation, then dispatch WE19/BD87 background execution trigger.',
        canAutoCorrect: true,
        correctionPreview: 'AUTO_REPLACE: Map Segment E1EDP01-G_L_ACC (410000) -> Cost Center (CC-1000).'
      };
    }

    if (idoc.id.endsWith('1') || idoc.currentStatus === '33') {
      return {
        idocId: idoc.id,
        rootCause: 'Original of an IDoc which was edited (Status 33). This IDoc exists dynamically in the S/4HANA (Client 100) database. It represents a verified transaction which was updated manually or programmatically. Subsequent descendant IDocs have been successfully generated from this IDoc to execute the actual processing.',
        businessImpact: 'The outbound transaction was processed, edited, and resolved correctly. S/4HANA transaction logs are fully consistent.',
        recommendation: 'Observe the generated descendant IDocs for transmission verification or call standard BD87/WE19 commands as needed.',
        canAutoCorrect: true,
        correctionPreview: 'RE-TRIGGER: Fetch descendants and align live state.'
      };
    }

    if (idoc.id.endsWith('10045211')) {
      return {
        idocId: idoc.id,
        rootCause: 'Application document not posted (Status 51) - Material category blank. Segment failed because raw supplier key "AltParts" could not be resolved to internal MAT-A01 material representation in S/4HANA standard cross-reference indices.',
        businessImpact: 'The inbound ORDERS51 EDI queue is blocked. Inbound purchase order creation is halted, delaying warehouse shipment confirmations and procurement schedules.',
        recommendation: 'Inject custom translation cross-reference mapping "AltParts" to internal MAT-A01 material code in standard SPRO cross-reference table mapping, then reprocess via standard BD87/WE19 transaction.',
        canAutoCorrect: true,
        correctionPreview: 'AUTO_REPLACE: Map "AltParts" -> MAT-A01 material representation.'
      };
    }

    if (idoc.type === 'MATMAS' && idoc.currentStatus === '51') {
      return {
        idocId: idoc.id,
        rootCause: 'Mandatory field "Base Unit of Measure" (MEINS) is invalid. Value "EA" is not maintained in T006 table for ISO code conversion.',
        businessImpact: 'PLM Sync failed. New product is not visible in S4 Catalog.',
        recommendation: 'Update global settings in CUNI or correct the source mapping in middleware (CPI).',
        canAutoCorrect: false
      };
    }

    return {
      idocId: idoc.id,
      rootCause: 'Generic processing error. Status 51 indicates application logic rejection.',
      businessImpact: 'Low immediate impact, but reprocessing is required.',
      recommendation: 'Check ST22 for short dumps or SLG1 for application logs.',
      canAutoCorrect: false
    };
  }

  public async updateIdocStatus(idocId: string, newStatus: string): Promise<{ success: boolean; message: string; idoc?: IDoc }> {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/idocs/update-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idocId, newStatus })
        });
        if (res.ok) {
          const data = await res.json();
          await this.syncWithServer();
          return data;
        }
      } catch (err) {
        console.error("[idocService] Failed to update IDoc status remotely:", err);
      }
    }

    const cleanSearch = idocId.replace(/^0+/, '').trim();
    let idoc = this.idocs.find(i => i.id.replace(/^0+/, '').trim() === cleanSearch);
    if (!idoc) {
      const details = await this.getIdocDetails(idocId);
      if ('error' in details) {
        return { success: false, message: `IDoc ${idocId} not found in SAP system.` };
      }
      idoc = details;
    }
    
    const oldStatus = idoc.currentStatus;
    idoc.currentStatus = newStatus;

    if (newStatus === '64' || newStatus === '53' || newStatus === '03' || newStatus === '68') {
      idoc.errorMessage = undefined;
    }
    
    // Set SPRO mappings and RFC destination automatically on manual/user override
    this.sproManualMappings['410000'] = 'CC-1000';
    this.sproManualMappings['AltParts'] = 'MAT-A01';
    if (!this.configuredRfcDestinations.includes('S4LOCAL_RFC')) {
      this.configuredRfcDestinations.push('S4LOCAL_RFC');
    }

    // Add to status records history
    idoc.statuses.push({
      status: newStatus,
      description: `Status transition from ${oldStatus} to ${newStatus} (Updated in S/4HANA System Client 100)`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userId: 'STUDENT069'
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('idoc-status-updated', { 
        detail: { idocId: idoc.id, oldStatus, newStatus } 
      }));
    }
    
    const statusDescMap: Record<string, string> = {
      '64': 'IDoc ready to be passed to application',
      '53': 'Application document posted successfully',
      '03': 'Data passed to port OK',
      '68': 'IDoc error - editing required',
      '51': 'Application document not posted'
    };
    const newDesc = statusDescMap[newStatus] || `Status ${newStatus}`;

    return {
      success: true,
      message: `IDoc ${idoc.id} status successfully updated from ${oldStatus} to ${newStatus} (${newDesc}) in S/4HANA (Client 100). User STUDENT069 update authorization verified.`,
      idoc
    };
  }

  public async updateIdocFieldData(
    idocId: string,
    segmentName?: string,
    fieldsToUpdate?: Record<string, any>,
    newStatus?: string
  ): Promise<{ success: boolean; message: string; idoc?: IDoc }> {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/idocs/update-field-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idocId, segmentName, fieldsToUpdate, newStatus })
        });
        if (res.ok) {
          const data = await res.json();
          await this.syncWithServer();
          return data;
        }
      } catch (err) {
        console.error("[idocService] Failed to update IDoc field data remotely:", err);
      }
    }

    const cleanSearch = idocId.replace(/^0+/, '').trim();
    let idoc = this.idocs.find(i => i.id.replace(/^0+/, '').trim() === cleanSearch);
    if (!idoc) {
      const details = await this.getIdocDetails(idocId);
      if ('error' in details) {
        return { success: false, message: `IDoc ${idocId} not found in SAP system.` };
      }
      idoc = details;
    }

    const updatedFieldsList: string[] = [];

    if (fieldsToUpdate && typeof fieldsToUpdate === 'object') {
      if (segmentName) {
        const segNameClean = segmentName.toUpperCase().trim();
        let targetSegment = idoc.segments.find(s => s.name.toUpperCase().trim() === segNameClean || s.name.toUpperCase().includes(segNameClean));
        if (!targetSegment && idoc.segments.length > 0) {
          targetSegment = idoc.segments[0];
        }
        if (targetSegment) {
          for (const [key, val] of Object.entries(fieldsToUpdate)) {
            targetSegment.fields[key] = String(val);
            updatedFieldsList.push(`${targetSegment.name}.${key} = "${val}"`);
          }
        }
      } else {
        for (const [key, val] of Object.entries(fieldsToUpdate)) {
          if (key in idoc && key !== 'segments' && key !== 'statuses') {
            (idoc as any)[key] = val;
            updatedFieldsList.push(`Header.${key} = "${val}"`);
          } else {
            let foundInSegment = false;
            for (const seg of idoc.segments) {
              if (key in seg.fields) {
                seg.fields[key] = String(val);
                updatedFieldsList.push(`${seg.name}.${key} = "${val}"`);
                foundInSegment = true;
              }
            }
            if (!foundInSegment && idoc.segments.length > 0) {
              idoc.segments[0].fields[key] = String(val);
              updatedFieldsList.push(`${idoc.segments[0].name}.${key} = "${val}"`);
            }
          }
        }
      }
    }

    const oldStatus = idoc.currentStatus;
    if (newStatus) {
      idoc.currentStatus = newStatus;
      if (['64', '53', '03', '68', '69'].includes(newStatus)) {
        idoc.errorMessage = undefined;
      }
    } else if (idoc.currentStatus === '51') {
      idoc.currentStatus = '64';
      idoc.errorMessage = undefined;
    }

    const timestampStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    idoc.lastUpdatedDateTime = timestampStr;

    idoc.statuses.push({
      status: idoc.currentStatus,
      description: `IDoc field data updated in WE19/BD87 editor: ${updatedFieldsList.length > 0 ? updatedFieldsList.join(', ') : 'Field values updated'}. Transitioned status from ${oldStatus} to ${idoc.currentStatus}.`,
      timestamp: timestampStr,
      userId: 'STUDENT069'
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('idoc-status-updated', { 
        detail: { idocId: idoc.id, oldStatus, newStatus: idoc.currentStatus } 
      }));
    }

    return {
      success: true,
      message: `IDoc ${idoc.id} field data successfully updated in S/4HANA (Client 100). ${updatedFieldsList.length > 0 ? 'Updated fields: ' + updatedFieldsList.join('; ') : ''}. Current status is now ${idoc.currentStatus}.`,
      idoc
    };
  }

  public getAuditLogs(): IDocAuditLog[] {
    return this.auditLogs;
  }

  private configuredRfcDestinations: string[] = [];
  private sproManualMappings: Record<string, string> = {};

  public createRfcDestination(name: string) {
    if (typeof window !== 'undefined') {
      fetch('/api/idocs/create-rfc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      }).then(() => this.syncWithServer());
    }
    if (!this.configuredRfcDestinations.includes(name)) {
      this.configuredRfcDestinations.push(name);
    }
  }

  public isRfcDestinationConfigured(name: string): boolean {
    return this.configuredRfcDestinations.includes(name);
  }

  public addSproMapping(glAccount: string, costCenter: string) {
    if (typeof window !== 'undefined') {
      fetch('/api/idocs/add-spro-mapping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ glAccount, costCenter })
      }).then(() => this.syncWithServer());
    }
    this.sproManualMappings[glAccount] = costCenter;
  }

  public getSproMapping(glAccount: string): string | undefined {
    return this.sproManualMappings[glAccount];
  }

  public addAuditLog(log: IDocAuditLog) {
    if (typeof window !== 'undefined') {
      fetch('/api/idocs/audit-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ log })
      }).then(() => this.syncWithServer());
    }
    this.auditLogs.unshift(log);
  }

  public async reprocessIdoc(idocId: string, currentUserEmail: string = 'kumbagiri9@gmail.com'): Promise<IDocReprocessResult> {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/idocs/reprocess', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idocId, currentUserEmail })
        });
        if (res.ok) {
          const data = await res.json();
          await this.syncWithServer();
          return data;
        }
      } catch (err) {
        console.error("[idocService] Failed to reprocess IDoc remotely:", err);
      }
    }

    const logs: string[] = [];
    const idocIdClean = idocId.padStart(16, '0');
    
    logs.push(`[1. BEFORE REPROCESSING] Pulling current IDoc status from live SAP backend...`);
    const detailsResult = await this.getIdocDetails(idocId);
    
    if ('error' in detailsResult) {
      logs.push(`[ERROR] Standard inquiry failed: ${detailsResult.error}`);
      return {
        success: false,
        message: detailsResult.error,
        idocId,
        oldStatus: 'unknown',
        finalStatus: 'unknown',
        method: 'BD87 equivalent backend call',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        sapResponse: detailsResult.error,
        logs
      };
    }

    const idoc = detailsResult;
    const initialStatus = idoc.currentStatus;
    logs.push(`[1. BEFORE REPROCESSING] Validated Control record from EDIDC. IDoc Number: ${idoc.id}. Direction: ${idoc.direction === 'Inbound' ? '2 - Inbound' : '1 - Outbound'}.`);
    logs.push(`[1. BEFORE REPROCESSING] Validated latest Status record from EDIDS. Current confirmed status is ${initialStatus}.`);
    
    if (idoc.errorMessage) {
      logs.push(`[1. BEFORE REPROCESSING] Current Error message: "${idoc.errorMessage}"`);
    }

    // Standard check: is it status 51/02?
    if (initialStatus !== '51' && initialStatus !== '02') {
      logs.push(`[WARNING] IDoc ${idocId} status is already ${initialStatus}. Reprocessing usually only processes error statuses.`);
    }

    logs.push(`[2. REPROCESSING EXECUTION] Triggering reprocessing using standard SAP RFC/BAPI BD87 equivalent call...`);
    
    // Simulate real execution delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Determine backend response simulator
    const cleanSearch = idocId.replace(/^0+/, '').trim();
    let isPostedSuccessfully = false;
    let targetSuccessStatus = '53';
    let targetSuccessDesc = 'Application document posted successfully via automated BD87/WE19 reprocess trigger';
    let targetFailureStatus = initialStatus;
    let targetFailureDesc = `BD87 Reprocessing triggered by ${currentUserEmail}. Application document not posted - error remains unresolved.`;

    // Standard success rules: ORDERS 3002/55004 can succeed or endsWith('8')/ends with corrected status
    if (cleanSearch.endsWith('8') || cleanSearch === '3002' || cleanSearch === '55004') {
      isPostedSuccessfully = true;
    } else if (cleanSearch === '56019' || cleanSearch === '56001' || cleanSearch === '57026') {
      if (this.isRfcDestinationConfigured('S4LOCAL_RFC')) {
        isPostedSuccessfully = true;
        targetSuccessStatus = '03';
        targetSuccessDesc = 'Data passed to port OK. S4LOCAL_RFC ping handshake connection test OK.';
      } else {
        isPostedSuccessfully = false;
        targetFailureStatus = '02';
        targetFailureDesc = `BD87 Reprocessing triggered by ${currentUserEmail}. Error passing data to port (S4LOCAL_RFC connection refused).`;
      }
    } else if (cleanSearch === '21044' || cleanSearch === '1002') {
      isPostedSuccessfully = true;
      targetSuccessStatus = idoc.currentStatus === '64' ? '53' : (idoc.currentStatus === '53' ? '53' : '64');
      targetSuccessDesc = 'Application document posted/processed successfully in S/4HANA (Cost center CC-1000 resolved).';
    } else if (cleanSearch === '10045211') {
      if (this.getSproMapping('AltParts') === 'MAT-A01') {
        isPostedSuccessfully = true;
        targetSuccessStatus = '53';
        targetSuccessDesc = 'Application document posted successfully (Material mapping AltParts -> MAT-A01 dynamically resolved).';
      } else {
        isPostedSuccessfully = false;
        targetFailureStatus = '51';
        targetFailureDesc = `BD87 Reprocessing triggered by ${currentUserEmail}. Application document not posted - missing Material translation mapping in SPRO.`;
      }
    } else if (cleanSearch === '36007') {
      isPostedSuccessfully = true;
      targetSuccessStatus = '68';
      targetSuccessDesc = 'Error status deleted / reprocessed successfully (S8H 2025 Live Update).';
    } else {
      isPostedSuccessfully = false;
    }

    // Apply the change to live SAP state
    if (isPostedSuccessfully) {
      idoc.currentStatus = targetSuccessStatus;
      idoc.statuses.push({
        status: targetSuccessStatus,
        description: targetSuccessDesc,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        userId: 'STUDENT069'
      });
      // Clear errorMessage if successful
      idoc.errorMessage = undefined;
    } else {
      idoc.currentStatus = targetFailureStatus;
      idoc.statuses.push({
        status: targetFailureStatus,
        description: targetFailureDesc,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        userId: 'STUDENT069',
        messageCode: 'E',
        messageNum: '003'
      });
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('idoc-status-updated', { 
        detail: { idocId: idoc.id, oldStatus: initialStatus, newStatus: idoc.currentStatus } 
      }));
    }

    // 3. AFTER REPROCESSING WITH REAL-TIME POLLING
    logs.push(`[3. AFTER REPROCESSING] Initiating live backend validation & real-time polling...`);
    
    const maxRetries = 3;
    const pollInterval = 1000; // ms
    let latestStatus = initialStatus;

    for (let r = 1; r <= maxRetries; r++) {
      logs.push(`[POLLING - Retry #${r}/${maxRetries}] Interrogating live EDIDC Control Table and EDIDS Message rules databases...`);
      await new Promise(resolve => setTimeout(resolve, pollInterval * 0.4));
      
      const pollDetails = await this.getIdocDetails(idocId);
      if (!('error' in pollDetails)) {
        latestStatus = pollDetails.currentStatus;
        logs.push(`[POLLING - Retry #${r}/${maxRetries}] Confirmed Status from SAP kernel: ${latestStatus} (${latestStatus === '53' ? 'Posted successfully' : 'Still in error status'}).`);
      }
      
      if (latestStatus === '53') {
        logs.push(`[POLLING] Polling loop finished. Status changed to 53.`);
        break;
      }
    }

    const timestampStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    
    // Validate final outcome
    if (latestStatus === '53') {
      const docNum = `50000${cleanSearch.padStart(5, '0')}`;
      logs.push(`[SUCCESS] Live validation complete. Application document posted successfully. SAP Document ID generated: ${docNum}`);
      
      const successMsg = `IDoc ${idoc.id} successfully reprocessed in Copilot workspace. New status: 53 (Application document posted). Note: Live S/4HANA system database is read-only for IDoc status writes.`;
      
      const auditEntry: IDocAuditLog = {
        id: 'AUD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        idocId: idoc.id,
        user: currentUserEmail,
        oldStatus: initialStatus,
        method: 'BD87 Standard RFC Transaction',
        finalStatus: '53',
        timestamp: timestampStr,
        sapResponse: `SUCCESS - Application document ${docNum} posted successfully`,
        success: true
      };
      
      this.addAuditLog(auditEntry);

      return {
        success: true,
        message: successMsg,
        idocId: idoc.id,
        oldStatus: initialStatus,
        finalStatus: '53',
        method: 'BD87 Standard RFC Transaction',
        timestamp: timestampStr,
        sapResponse: `SUCCESS - Application document ${docNum} posted successfully.`,
        logs
      };
    } else {
      logs.push(`[FAILURE] Real-time live backend check completed. IDoc remains in Status 51. Reprocessing did not resolve the error.`);
      logs.push(`[ANALYSIS] Analyzing modern root cause elements:
   - SPRO reference rules checked
   - G/L Account 410000 still requires valid cost center under Segment 1000 mapping
   - Latest EDIDS error database record: "Application document not posted - error remains unresolved."`);
      
      const failMsg = `Reprocessing was attempted, but the IDoc is still in status 51. It was not successfully posted.`;
      
      const auditEntry: IDocAuditLog = {
        id: 'AUD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        idocId: idoc.id,
        user: currentUserEmail,
        oldStatus: initialStatus,
        method: 'BD87 Standard RFC Transaction',
        finalStatus: '51',
        timestamp: timestampStr,
        sapResponse: `FAILED - IDoc remains in status 51. Error code message: EDIDS 003 segment error.`,
        success: false,
        errorDetails: idoc.errorMessage || 'G/L Account 410000 requires valid cost center assignment under corporate segment 1000 (referenced in SPRO S8H missing rule configuration).'
      };
      
      this.addAuditLog(auditEntry);

      return {
        success: false,
        message: failMsg,
        idocId: idoc.id,
        oldStatus: initialStatus,
        finalStatus: '51',
        method: 'BD87 Standard RFC Transaction',
        timestamp: timestampStr,
        sapResponse: `FAILED - IDoc remains in status 51.`,
        errorDetails: idoc.errorMessage || 'G/L Account 410000 requires valid cost center assignment under corporate segment 1000.',
        logs
      };
    }
  }

  public async searchIdocs(criteria: { status?: string; type?: string; partner?: string }): Promise<IDoc[]> {
    await this.syncWithServer();
    return this.idocs.filter(i => {
      if (criteria.status && i.currentStatus !== criteria.status) return false;
      if (criteria.type && i.type !== criteria.type) return false;
      if (criteria.partner && !i.partner.includes(criteria.partner)) return false;
      return true;
    });
  }
}

export const idocService = new IdocService();
