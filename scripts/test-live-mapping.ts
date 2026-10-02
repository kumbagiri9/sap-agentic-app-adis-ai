// DEV-ONLY test harness. Never imported by the running application (server.ts / App.tsx).
// Injects a fake LiveSapTableReader to verify eccService's live-mapping code paths produce
// correctly-shaped objects the UI can render, without writing any synthetic data into the
// shipped app or claiming it as real ECC output. Run with: npx tsx scripts/test-live-mapping.ts
import { sapEccTableGateway, LiveSapTableReader } from '../services/eccTableGateway';
import { eccService } from '../services/eccService';

const FIXTURES: Record<string, Record<string, unknown>[]> = {
  VBAK: [
    { VBELN: '0000010044', AUART: 'TA', VKORG: '1000', VTWEG: '10', SPART: '00', KUNNR: '0000001000', BSTNK: 'PO-TEST-1', VDATU: '20260901', ERDAT: '20260815', NETWR: '15150.00', WAERK: 'EUR' }
  ],
  VBAP: [
    { VBELN: '0000010044', POSNR: '000010', MATNR: 'DPC-100', ARKTX: 'Test Controller', KWMENG: '15', VRKME: 'ST', NETWR: '9750.00', WAERK: 'EUR', WERKS: '1000', LGORT: '0001' }
  ],
  LIKP: [
    { VBELN: '0080015205', LFART: 'LF', VSTEL: '1000', KUNNR: '0000001000', LFDAT: '20260813', WADAT_IST: '20260813', BTGEW: '280.0', GEWEI: 'KG' }
  ],
  LIPS: [
    { VBELN: '0080015205', POSNR: '000010', MATNR: 'DPC-100', ARKTX: 'Test Controller', LFIMG: '15', VRKME: 'ST', WERKS: '1000', LGORT: '0001' }
  ],
  VBRK: [
    { VBELN: '0090038105', FKART: 'F2', FKDAT: '20260814', KUNRG: '0000001000', KUNAG: '0000001000', NETWR: '15150.00', MWSBK: '2878.50', WAERK: 'EUR', VKORG: '1000', VTWEG: '10', SPART: '00' }
  ],
  VBRP: [
    { VBELN: '0090038105', POSNR: '000010', MATNR: 'DPC-100', ARKTX: 'Test Controller', FKIMG: '15', VRKME: 'ST', NETWR: '9750.00', WAERK: 'EUR', WERKS: '1000' }
  ],
  KNA1: [
    { KUNNR: '0000001000', NAME1: 'Becker Berlin AG', SORTL: 'BECKER', STRAS: 'Test Str 1', ORT01: 'Berlin', PSTLZ: '10115', LAND1: 'DE' }
  ],
  MARD: [
    { MATNR: 'DPC-100', WERKS: '1000', LGORT: '0001', LABST: '85', INSME: '10', SPEME: '10' }
  ],
  MARC: [
    { MATNR: 'DPC-100', WERKS: '1000', EISBE: '15' }
  ],
  MAKT: [
    { MATNR: 'DPC-100', MAKTX: 'High-Performance Dual-Core Industrial Controller' }
  ]
};

const fakeReader: LiveSapTableReader = ({ table, fields }) => {
  const rows = FIXTURES[table] || [];
  const projected = rows.map(row => {
    if (!fields || fields.length === 0) return row;
    const out: Record<string, unknown> = {};
    fields.forEach(f => { out[f] = row[f]; });
    return out;
  });
  return {
    rows: projected,
    fields: Object.keys(rows[0] || {}).map(fieldName => ({
      fieldName, offset: 0, length: 30, type: 'C', fieldText: fieldName, dataType: 'CHAR'
    })),
    executionLatencyMs: 1,
    eccHost: 'TEST-FIXTURE'
  };
};

sapEccTableGateway.setLiveTableReader(fakeReader);

function check(label: string, fn: () => unknown) {
  try {
    const result = fn();
    console.log(`PASS | ${label} | ${JSON.stringify(result).slice(0, 300)}`);
  } catch (error) {
    console.log(`FAIL | ${label} | ${error instanceof Error ? error.message : String(error)}`);
  }
}

check('getSalesOrders', () => eccService.getSalesOrders({}));
check('getSalesOrderDetail', () => eccService.getSalesOrderDetail('0000010044'));
check('getDeliveries', () => eccService.getDeliveries({}));
check('getBillingDocuments', () => eccService.getBillingDocuments({}));
check('getCustomerMaster', () => eccService.getCustomerMaster('0000001000'));
check('getCustomersList', () => eccService.getCustomersList());
check('checkAtpAvailability', () => eccService.checkAtpAvailability('DPC-100', '1000', 5));
