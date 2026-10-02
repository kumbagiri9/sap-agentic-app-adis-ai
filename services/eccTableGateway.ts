import { SapEccTableReadResult } from '../types';
import { sapEccMetadataRepository } from './eccMetadataRepository';
import { sapProductionSafetyInterceptor } from './eccProductionSafetyInterceptor';

export interface TableColumnMetadata {
  fieldName: string;
  offset: number;
  length: number;
  type: string;
  fieldText: string;
  dataType: string;
  decimals?: number;
  isKey?: boolean;
  checkTable?: string;
  domain?: string;
}

export interface TableDefinition {
  tableName: string;
  description: string;
  module: string;
  authGroup: string;
  deliveryClass: string;
  isRestricted?: boolean;
  restrictionReason?: string;
  columns: TableColumnMetadata[];
  defaultSortField?: string;
}

export interface SapReadTableOptions {
  table?: string;
  tableName?: string;
  fields?: string[];
  filters?: string | string[];
  options?: string | string[];
  row_limit?: number;
  rowCount?: number;
  limit?: number;
  offset?: number;
  rowSkip?: number;
  row_skips?: number;
  sorting?: string | { field: string; direction?: 'ASC' | 'DESC' };
  order_by?: string;
  client?: string;
  sapClient?: string;
  mandt?: string;
}

export interface LiveSapTableRead {
  rows: Record<string, unknown>[];
  fields: TableColumnMetadata[];
  executionLatencyMs: number;
  eccHost: string;
}

export type LiveSapTableReader = (options: {
  table: string;
  fields: string[];
  options: string[];
  rowCount: number;
  rowSkip: number;
  client: string;
}) => LiveSapTableRead;

export class SapEccTableGateway {
  // 1. Explicitly Denied Tables (Confidential Executive Payroll, Private Citizen HR, Raw Unformatted Clusters, Crypto Keys)
  private readonly DENIED_TABLES: Record<string, string> = {
    'PA0008': 'Basic Pay and confidential executive payroll data (HR-PA). Direct RFC extraction prohibited.',
    'PA0002': 'Personal Data and private citizen identity records (HR-PA). Direct RFC extraction prohibited.',
    'RFBLG': 'Raw unformatted financial cluster table. Direct extraction prohibited.',
    'CDPOS_SEC': 'Audit trail security credential alterations. Direct extraction prohibited.',
    'SEC_KEYS': 'Internal SAP cryptographic key store. Direct extraction prohibited.'
  };

  // 2. Sensitive fields to mask automatically (Strict Password Hash Redaction & PII Masking)
  private readonly SENSITIVE_FIELDS: Set<string> = new Set([
    'BANKN', 'IBAN', 'CCNUM', 'STCD1', 'STCD2', 'STCEG', 'PERID', 'PASSP', 'SSN', 'CVV',
    'BETRG', 'SALARY', 'STREET', 'STRAS', 'TELNR', 'PERNR_SSN', 'EMERGENCY_PHONE',
    'BAPWD', 'PASSCODE', 'CODPW', 'PWDSALTEDHASH', 'OCOD1', 'PASSWD', 'PWDCHGDATE'
  ]);

  // 2b. Fields confirmed FIELD_NOT_VALID/DATA_BUFFER_EXCEEDED on THIS landscape's DDIC (binary-search
  // verified directly against live RFC_READ_TABLE). Stripped from any explicit field request below,
  // regardless of which tool (generic sap_read_table or a curated engine) asked for them, so ad-hoc
  // LLM-issued field lists can never re-trigger these already-diagnosed failures.
  private readonly LANDSCAPE_INVALID_FIELDS: Record<string, string[]> = {
    EDIDC: ['IDOCTYP', 'DOCTYP'],
    EDIDS: ['STAMAC'],
    EDID4: ['SDATA'],
    AFKO: ['AMEIN'],
    QALS: ['HERKZ', 'ERDAT']
  };

  // 2c. Wide tables whose full column set overflows classic RFC_READ_TABLE's ~512-byte row buffer
  // (DATA_BUFFER_EXCEEDED). When a caller (e.g. an LLM-issued ad-hoc sap_read_table/ecc_rfc_read_table
  // call) requests NO explicit field projection - which normally means "select all columns" - these
  // verified-safe narrow field lists are used instead of blindly requesting every column.
  private readonly DEFAULT_SAFE_FIELDS_WHEN_UNSPECIFIED: Record<string, string[]> = {
    EDIDC: ['DOCNUM', 'STATUS', 'DIRECT', 'RCVPRN', 'SNDPRN', 'RCVPRT', 'SNDPRT', 'RCVPOR', 'SNDPOR', 'MESTYP', 'CIMTYP', 'CREDAT', 'CRETIM'],
    EDIDS: ['DOCNUM', 'STATUS', 'STATXT', 'LOGDAT', 'LOGTIM', 'UNAME', 'STAMNO'],
    EDID4: ['DOCNUM', 'SEGNAM', 'HLEVEL']
  };

  // 2d. Per-table row-count default used only when the caller specifies NO row count at all
  // (matches the row limits eccIdocAgentEngine.getLiveIdocs() already relies on for these tables,
  // so ad-hoc generic-tool calls see the same breadth of IDoc data instead of the generic 50-row cap).
  private readonly DEFAULT_ROW_LIMIT_WHEN_UNSPECIFIED: Record<string, number> = {
    EDIDC: 500,
    EDIDS: 1000,
    EDID4: 1000
  };

  // 3. Schema Catalog for standard and enterprise tables
  private tableCatalog: Record<string, TableDefinition> = {};

  // 4. Live repository data store for tables
  private tableDataStore: Record<string, Record<string, any>[]> = {};
  private liveTableReader?: LiveSapTableReader;

  constructor() {
    this.initializeCatalog();
    this.initializeDefaultData();
  }

  public setLiveTableReader(reader: LiveSapTableReader): void {
    this.liveTableReader = reader;
  }

  private initializeCatalog() {
    // MM - MARD (Storage Location Data for Material)
    this.tableCatalog['MARD'] = {
      tableName: 'MARD',
      description: 'Storage Location Data for Material',
      module: 'MM',
      authGroup: 'MM',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'MATNR', offset: 3, length: 18, type: 'C', dataType: 'CHAR', fieldText: 'Material Number', isKey: true },
        { fieldName: 'WERKS', offset: 21, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Plant', isKey: true },
        { fieldName: 'LGORT', offset: 25, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Storage Location', isKey: true },
        { fieldName: 'LABST', offset: 29, length: 13, type: 'P', dataType: 'QUAN', decimals: 3, fieldText: 'Valuated Unrestricted-Use Stock' },
        { fieldName: 'UMLME', offset: 42, length: 13, type: 'P', dataType: 'QUAN', decimals: 3, fieldText: 'Stock in Transfer (Plant to Plant)' },
        { fieldName: 'INSME', offset: 55, length: 13, type: 'P', dataType: 'QUAN', decimals: 3, fieldText: 'Stock in Quality Inspection' },
        { fieldName: 'SPEME', offset: 68, length: 13, type: 'P', dataType: 'QUAN', decimals: 3, fieldText: 'Blocked Stock' },
        { fieldName: 'EINME', offset: 81, length: 13, type: 'P', dataType: 'QUAN', decimals: 3, fieldText: 'Restricted-Use Stock' },
        { fieldName: 'RETME', offset: 94, length: 13, type: 'P', dataType: 'QUAN', decimals: 3, fieldText: 'Blocked Stock Returns' },
        { fieldName: 'LMINB', offset: 107, length: 13, type: 'P', dataType: 'QUAN', decimals: 3, fieldText: 'Reorder Point' }
      ],
      defaultSortField: 'MATNR'
    };

    // MM - MARC (Plant Data for Material)
    this.tableCatalog['MARC'] = {
      tableName: 'MARC',
      description: 'Plant Data for Material',
      module: 'MM',
      authGroup: 'MM',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'MATNR', offset: 3, length: 18, type: 'C', dataType: 'CHAR', fieldText: 'Material Number', isKey: true },
        { fieldName: 'WERKS', offset: 21, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Plant', isKey: true },
        { fieldName: 'EKGRP', offset: 25, length: 3, type: 'C', dataType: 'CHAR', fieldText: 'Purchasing Group' },
        { fieldName: 'DISPO', offset: 28, length: 3, type: 'C', dataType: 'CHAR', fieldText: 'MRP Controller' },
        { fieldName: 'PLIFZ', offset: 31, length: 3, type: 'DEC', dataType: 'DEC', fieldText: 'Planned Delivery Time in Days' },
        { fieldName: 'EISBE', offset: 34, length: 13, type: 'P', dataType: 'QUAN', decimals: 3, fieldText: 'Safety Stock' },
        { fieldName: 'MINBE', offset: 47, length: 13, type: 'P', dataType: 'QUAN', decimals: 3, fieldText: 'Reorder Point' },
        { fieldName: 'BSTMI', offset: 60, length: 13, type: 'P', dataType: 'QUAN', decimals: 3, fieldText: 'Minimum Order Quantity' },
        { fieldName: 'BSTMA', offset: 73, length: 13, type: 'P', dataType: 'QUAN', decimals: 3, fieldText: 'Maximum Order Quantity' }
      ]
    };

    // MM - MARA (General Material Data)
    this.tableCatalog['MARA'] = {
      tableName: 'MARA',
      description: 'General Material Data',
      module: 'MM',
      authGroup: 'MM',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'MATNR', offset: 3, length: 18, type: 'C', dataType: 'CHAR', fieldText: 'Material Number', isKey: true },
        { fieldName: 'MTART', offset: 21, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Material Type' },
        { fieldName: 'MATKL', offset: 25, length: 9, type: 'C', dataType: 'CHAR', fieldText: 'Material Group' },
        { fieldName: 'MEINS', offset: 34, length: 3, type: 'C', dataType: 'UNIT', fieldText: 'Base Unit of Measure' },
        { fieldName: 'BRGEW', offset: 37, length: 13, type: 'P', dataType: 'QUAN', decimals: 3, fieldText: 'Gross Weight' },
        { fieldName: 'NTGEW', offset: 50, length: 13, type: 'P', dataType: 'QUAN', decimals: 3, fieldText: 'Net Weight' },
        { fieldName: 'GEWEI', offset: 63, length: 3, type: 'C', dataType: 'UNIT', fieldText: 'Weight Unit' },
        { fieldName: 'LVORM', offset: 66, length: 1, type: 'C', dataType: 'CHAR', fieldText: 'Deletion Flag' }
      ]
    };

    // MM - MBEW (Material Valuation)
    this.tableCatalog['MBEW'] = {
      tableName: 'MBEW',
      description: 'Material Valuation',
      module: 'MM',
      authGroup: 'MM',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'MATNR', offset: 3, length: 18, type: 'C', dataType: 'CHAR', fieldText: 'Material Number', isKey: true },
        { fieldName: 'BWKEY', offset: 21, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Valuation Area (Plant)', isKey: true },
        { fieldName: 'BWTAR', offset: 25, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Valuation Type', isKey: true },
        { fieldName: 'LBKUM', offset: 35, length: 13, type: 'P', dataType: 'QUAN', decimals: 3, fieldText: 'Total Valuated Stock' },
        { fieldName: 'SALK3', offset: 48, length: 13, type: 'P', dataType: 'CURR', decimals: 2, fieldText: 'Value of Total Stock' },
        { fieldName: 'VPRSV', offset: 61, length: 1, type: 'C', dataType: 'CHAR', fieldText: 'Price Control Indicator (S/V)' },
        { fieldName: 'VERPR', offset: 62, length: 11, type: 'P', dataType: 'CURR', decimals: 2, fieldText: 'Moving Average Price' },
        { fieldName: 'STPRS', offset: 73, length: 11, type: 'P', dataType: 'CURR', decimals: 2, fieldText: 'Standard Price' },
        { fieldName: 'PEINH', offset: 84, length: 5, type: 'DEC', dataType: 'DEC', fieldText: 'Price Unit' },
        { fieldName: 'BKLAS', offset: 89, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Valuation Class' }
      ]
    };

    // MM - MAKT (Material Descriptions)
    this.tableCatalog['MAKT'] = {
      tableName: 'MAKT',
      description: 'Material Descriptions',
      module: 'MM',
      authGroup: 'MM',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'MATNR', offset: 3, length: 18, type: 'C', dataType: 'CHAR', fieldText: 'Material Number', isKey: true },
        { fieldName: 'SPRAS', offset: 21, length: 1, type: 'C', dataType: 'LANG', fieldText: 'Language Key', isKey: true },
        { fieldName: 'MAKTX', offset: 22, length: 40, type: 'C', dataType: 'CHAR', fieldText: 'Material Description' },
        { fieldName: 'MAKTG', offset: 62, length: 40, type: 'C', dataType: 'CHAR', fieldText: 'Material Description in Upper Case' }
      ]
    };

    // SD - VBAK (Sales Document: Header Data)
    this.tableCatalog['VBAK'] = {
      tableName: 'VBAK',
      description: 'Sales Document: Header Data',
      module: 'SD',
      authGroup: 'VA',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'VBELN', offset: 3, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Sales Document', isKey: true },
        { fieldName: 'ERDAT', offset: 13, length: 8, type: 'D', dataType: 'DATS', fieldText: 'Creation Date' },
        { fieldName: 'ERNAM', offset: 21, length: 12, type: 'C', dataType: 'CHAR', fieldText: 'Created By' },
        { fieldName: 'AUART', offset: 33, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Sales Document Type' },
        { fieldName: 'NETWR', offset: 37, length: 15, type: 'P', dataType: 'CURR', decimals: 2, fieldText: 'Net Value of Document' },
        { fieldName: 'WAERK', offset: 52, length: 5, type: 'C', dataType: 'CUKY', fieldText: 'SD Document Currency' },
        { fieldName: 'VKORG', offset: 57, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Sales Organization' },
        { fieldName: 'VTWEG', offset: 61, length: 2, type: 'C', dataType: 'CHAR', fieldText: 'Distribution Channel' },
        { fieldName: 'SPART', offset: 63, length: 2, type: 'C', dataType: 'CHAR', fieldText: 'Division' },
        { fieldName: 'KUNNR', offset: 65, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Sold-To Party' },
        { fieldName: 'BSTNK', offset: 75, length: 35, type: 'C', dataType: 'CHAR', fieldText: 'Customer PO Number' },
        { fieldName: 'VDATU', offset: 110, length: 8, type: 'D', dataType: 'DATS', fieldText: 'Requested Delivery Date' }
      ],
      defaultSortField: 'VBELN'
    };

    // SD - VBAP (Sales Document: Item Data)
    this.tableCatalog['VBAP'] = {
      tableName: 'VBAP',
      description: 'Sales Document: Item Data',
      module: 'SD',
      authGroup: 'VA',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'VBELN', offset: 3, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Sales Document', isKey: true },
        { fieldName: 'POSNR', offset: 13, length: 6, type: 'N', dataType: 'NUMC', fieldText: 'Sales Document Item', isKey: true },
        { fieldName: 'MATNR', offset: 19, length: 18, type: 'C', dataType: 'CHAR', fieldText: 'Material Number' },
        { fieldName: 'ARKTX', offset: 37, length: 40, type: 'C', dataType: 'CHAR', fieldText: 'Short Text for Item' },
        { fieldName: 'KWMENG', offset: 77, length: 13, type: 'P', dataType: 'QUAN', decimals: 3, fieldText: 'Cumulative Order Quantity' },
        { fieldName: 'VRKME', offset: 90, length: 3, type: 'C', dataType: 'UNIT', fieldText: 'Sales Unit' },
        { fieldName: 'NETWR', offset: 93, length: 15, type: 'P', dataType: 'CURR', decimals: 2, fieldText: 'Net Value of Item' },
        { fieldName: 'WAERK', offset: 108, length: 5, type: 'C', dataType: 'CUKY', fieldText: 'SD Document Currency' },
        { fieldName: 'WERKS', offset: 113, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Plant' },
        { fieldName: 'LGORT', offset: 117, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Storage Location' }
      ]
    };

    // SD - KNA1 (Customer Master: General Data)
    this.tableCatalog['KNA1'] = {
      tableName: 'KNA1',
      description: 'Customer Master: General Data',
      module: 'SD',
      authGroup: 'FC',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'KUNNR', offset: 3, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Customer Number', isKey: true },
        { fieldName: 'NAME1', offset: 13, length: 35, type: 'C', dataType: 'CHAR', fieldText: 'Customer Name 1' },
        { fieldName: 'SORTL', offset: 48, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Search Term' },
        { fieldName: 'STRAS', offset: 58, length: 35, type: 'C', dataType: 'CHAR', fieldText: 'Street & House Number' },
        { fieldName: 'ORT01', offset: 93, length: 35, type: 'C', dataType: 'CHAR', fieldText: 'City' },
        { fieldName: 'PSTLZ', offset: 128, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Postal Code' },
        { fieldName: 'LAND1', offset: 138, length: 3, type: 'C', dataType: 'CHAR', fieldText: 'Country Key' },
        { fieldName: 'STCD1', offset: 141, length: 16, type: 'C', dataType: 'CHAR', fieldText: 'Tax Number 1 (Masked)' }
      ]
    };

    // SD - LIKP (SD Document: Delivery Header Data)
    this.tableCatalog['LIKP'] = {
      tableName: 'LIKP',
      description: 'SD Document: Delivery Header Data',
      module: 'SD',
      authGroup: 'VL',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'VBELN', offset: 3, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Delivery', isKey: true },
        { fieldName: 'LFART', offset: 13, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Delivery Type' },
        { fieldName: 'VSTEL', offset: 17, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Shipping Point' },
        { fieldName: 'KUNNR', offset: 21, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Ship-To Party' },
        { fieldName: 'LFDAT', offset: 31, length: 8, type: 'D', dataType: 'DATS', fieldText: 'Delivery Date' },
        { fieldName: 'WADAT_IST', offset: 39, length: 8, type: 'D', dataType: 'DATS', fieldText: 'Actual Goods Movement Date' },
        { fieldName: 'BTGEW', offset: 47, length: 15, type: 'P', dataType: 'QUAN', decimals: 3, fieldText: 'Total Weight' },
        { fieldName: 'GEWEI', offset: 62, length: 3, type: 'C', dataType: 'UNIT', fieldText: 'Weight Unit' }
      ]
    };

    // SD - VBRK (Billing Document: Header Data)
    this.tableCatalog['VBRK'] = {
      tableName: 'VBRK',
      description: 'Billing Document: Header Data',
      module: 'SD',
      authGroup: 'VF',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'VBELN', offset: 3, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Billing Document', isKey: true },
        { fieldName: 'FKART', offset: 13, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Billing Type' },
        { fieldName: 'FKDAT', offset: 17, length: 8, type: 'D', dataType: 'DATS', fieldText: 'Billing Date' },
        { fieldName: 'KUNRG', offset: 25, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Payer' },
        { fieldName: 'KUNAG', offset: 35, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Sold-To Party' },
        { fieldName: 'NETWR', offset: 45, length: 15, type: 'P', dataType: 'CURR', decimals: 2, fieldText: 'Net Value' },
        { fieldName: 'MWSBK', offset: 60, length: 13, type: 'P', dataType: 'CURR', decimals: 2, fieldText: 'Tax Amount' },
        { fieldName: 'WAERK', offset: 73, length: 5, type: 'C', dataType: 'CUKY', fieldText: 'Currency' },
        { fieldName: 'BELNR', offset: 78, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Accounting Document Number' }
      ]
    };

    // SD - VBEP (Sales Document: Schedule Line Data)
    this.tableCatalog['VBEP'] = {
      tableName: 'VBEP',
      description: 'Sales Document: Schedule Line Data',
      module: 'SD',
      authGroup: 'VA',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'VBELN', offset: 3, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Sales Document', isKey: true },
        { fieldName: 'POSNR', offset: 13, length: 6, type: 'N', dataType: 'NUMC', fieldText: 'Item Number', isKey: true },
        { fieldName: 'ETENR', offset: 19, length: 4, type: 'N', dataType: 'NUMC', fieldText: 'Schedule Line Number', isKey: true },
        { fieldName: 'EDATU', offset: 23, length: 8, type: 'D', dataType: 'DATS', fieldText: 'Confirmed Delivery Date' },
        { fieldName: 'WMENG', offset: 31, length: 13, type: 'P', dataType: 'QUAN', decimals: 3, fieldText: 'Order Quantity' },
        { fieldName: 'BMENG', offset: 44, length: 13, type: 'P', dataType: 'QUAN', decimals: 3, fieldText: 'Confirmed Quantity' },
        { fieldName: 'VRKME', offset: 57, length: 3, type: 'C', dataType: 'UNIT', fieldText: 'Sales Unit' }
      ]
    };

    // SD - VBFA (Sales Document Flow)
    this.tableCatalog['VBFA'] = {
      tableName: 'VBFA',
      description: 'Sales Document Flow',
      module: 'SD',
      authGroup: 'VA',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'VBELV', offset: 3, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Preceding Document', isKey: true },
        { fieldName: 'POSNV', offset: 13, length: 6, type: 'N', dataType: 'NUMC', fieldText: 'Preceding Item', isKey: true },
        { fieldName: 'VBELN', offset: 19, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Subsequent Document', isKey: true },
        { fieldName: 'POSNN', offset: 29, length: 6, type: 'N', dataType: 'NUMC', fieldText: 'Subsequent Item', isKey: true },
        { fieldName: 'VBTYP_N', offset: 35, length: 1, type: 'C', dataType: 'CHAR', fieldText: 'Subsequent Doc Category (C=Order, J=Delivery, M=Invoice)' },
        { fieldName: 'VBTYP_V', offset: 36, length: 1, type: 'C', dataType: 'CHAR', fieldText: 'Preceding Doc Category' },
        { fieldName: 'RFMNG', offset: 37, length: 15, type: 'P', dataType: 'QUAN', decimals: 3, fieldText: 'Referenced Quantity' },
        { fieldName: 'RFWRT', offset: 52, length: 15, type: 'P', dataType: 'CURR', decimals: 2, fieldText: 'Referenced Value' },
        { fieldName: 'WAERS', offset: 67, length: 5, type: 'C', dataType: 'CUKY', fieldText: 'Currency' }
      ]
    };

    // SD - LIPS (SD Document: Delivery Item Data)
    this.tableCatalog['LIPS'] = {
      tableName: 'LIPS',
      description: 'SD Document: Delivery Item Data',
      module: 'SD',
      authGroup: 'VL',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'VBELN', offset: 3, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Delivery', isKey: true },
        { fieldName: 'POSNR', offset: 13, length: 6, type: 'N', dataType: 'NUMC', fieldText: 'Delivery Item', isKey: true },
        { fieldName: 'PSTYV', offset: 19, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Item Category' },
        { fieldName: 'MATNR', offset: 23, length: 18, type: 'C', dataType: 'CHAR', fieldText: 'Material Number' },
        { fieldName: 'ARKTX', offset: 41, length: 40, type: 'C', dataType: 'CHAR', fieldText: 'Item Description' },
        { fieldName: 'LFIMG', offset: 81, length: 13, type: 'P', dataType: 'QUAN', decimals: 3, fieldText: 'Actual Quantity Delivered' },
        { fieldName: 'VRKME', offset: 94, length: 3, type: 'C', dataType: 'UNIT', fieldText: 'Sales Unit' },
        { fieldName: 'WERKS', offset: 97, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Plant' },
        { fieldName: 'LGORT', offset: 101, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Storage Location' },
        { fieldName: 'VGBEL', offset: 105, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Reference Sales Order' },
        { fieldName: 'VGPOS', offset: 115, length: 6, type: 'N', dataType: 'NUMC', fieldText: 'Reference Sales Item' }
      ]
    };

    // SD - VBRP (Billing Document: Item Data)
    this.tableCatalog['VBRP'] = {
      tableName: 'VBRP',
      description: 'Billing Document: Item Data',
      module: 'SD',
      authGroup: 'VF',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'VBELN', offset: 3, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Billing Document', isKey: true },
        { fieldName: 'POSNR', offset: 13, length: 6, type: 'N', dataType: 'NUMC', fieldText: 'Billing Item', isKey: true },
        { fieldName: 'FKIMG', offset: 19, length: 13, type: 'P', dataType: 'QUAN', decimals: 3, fieldText: 'Billed Quantity' },
        { fieldName: 'VRKME', offset: 32, length: 3, type: 'C', dataType: 'UNIT', fieldText: 'Sales Unit' },
        { fieldName: 'NETWR', offset: 35, length: 15, type: 'P', dataType: 'CURR', decimals: 2, fieldText: 'Net Value' },
        { fieldName: 'MWSBP', offset: 50, length: 13, type: 'P', dataType: 'CURR', decimals: 2, fieldText: 'Tax Amount' },
        { fieldName: 'MATNR', offset: 63, length: 18, type: 'C', dataType: 'CHAR', fieldText: 'Material Number' },
        { fieldName: 'ARKTX', offset: 81, length: 40, type: 'C', dataType: 'CHAR', fieldText: 'Item Description' },
        { fieldName: 'VGBEL', offset: 121, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Reference Delivery / Order' },
        { fieldName: 'AUBEL', offset: 131, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Sales Order Number' }
      ]
    };

    // SD - KNVV (Customer Master: Sales Area Data)
    this.tableCatalog['KNVV'] = {
      tableName: 'KNVV',
      description: 'Customer Master: Sales Area Data',
      module: 'SD',
      authGroup: 'FC',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'KUNNR', offset: 3, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Customer Number', isKey: true },
        { fieldName: 'VKORG', offset: 13, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Sales Organization', isKey: true },
        { fieldName: 'VTWEG', offset: 17, length: 2, type: 'C', dataType: 'CHAR', fieldText: 'Distribution Channel', isKey: true },
        { fieldName: 'SPART', offset: 19, length: 2, type: 'C', dataType: 'CHAR', fieldText: 'Division', isKey: true },
        { fieldName: 'KDGRP', offset: 21, length: 2, type: 'C', dataType: 'CHAR', fieldText: 'Customer Group' },
        { fieldName: 'INCO1', offset: 23, length: 3, type: 'C', dataType: 'CHAR', fieldText: 'Incoterms Part 1' },
        { fieldName: 'INCO2', offset: 26, length: 28, type: 'C', dataType: 'CHAR', fieldText: 'Incoterms Part 2' },
        { fieldName: 'ZTERM', offset: 54, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Terms of Payment' },
        { fieldName: 'WAERS', offset: 58, length: 5, type: 'C', dataType: 'CUKY', fieldText: 'Currency' }
      ]
    };

    // MM - EKKO (Purchasing Document Header)
    this.tableCatalog['EKKO'] = {
      tableName: 'EKKO',
      description: 'Purchasing Document Header',
      module: 'MM',
      authGroup: 'MM',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'EBELN', offset: 3, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Purchasing Document', isKey: true },
        { fieldName: 'BUKRS', offset: 13, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Company Code' },
        { fieldName: 'BSTYP', offset: 17, length: 1, type: 'C', dataType: 'CHAR', fieldText: 'Purchasing Doc Category' },
        { fieldName: 'BSART', offset: 18, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Purchasing Doc Type' },
        { fieldName: 'LIFNR', offset: 22, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Vendor Number' },
        { fieldName: 'EKORG', offset: 32, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Purchasing Organization' },
        { fieldName: 'EKGRP', offset: 36, length: 3, type: 'C', dataType: 'CHAR', fieldText: 'Purchasing Group' },
        { fieldName: 'WAERS', offset: 39, length: 5, type: 'C', dataType: 'CUKY', fieldText: 'Currency Key' },
        { fieldName: 'BEDAT', offset: 44, length: 8, type: 'D', dataType: 'DATS', fieldText: 'Document Date' }
      ]
    };

    // FI - BKPF (Accounting Document Header)
    this.tableCatalog['BKPF'] = {
      tableName: 'BKPF',
      description: 'Accounting Document Header',
      module: 'FI',
      authGroup: 'FC',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'BUKRS', offset: 3, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Company Code', isKey: true },
        { fieldName: 'BELNR', offset: 7, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Accounting Document Number', isKey: true },
        { fieldName: 'GJAHR', offset: 17, length: 4, type: 'N', dataType: 'NUMC', fieldText: 'Fiscal Year', isKey: true },
        { fieldName: 'BLART', offset: 21, length: 2, type: 'C', dataType: 'CHAR', fieldText: 'Document Type' },
        { fieldName: 'BLDAT', offset: 23, length: 8, type: 'D', dataType: 'DATS', fieldText: 'Document Date in Document' },
        { fieldName: 'BUDAT', offset: 31, length: 8, type: 'D', dataType: 'DATS', fieldText: 'Posting Date in the Document' },
        { fieldName: 'MONAT', offset: 39, length: 2, type: 'N', dataType: 'NUMC', fieldText: 'Fiscal Period' },
        { fieldName: 'USNAM', offset: 41, length: 12, type: 'C', dataType: 'CHAR', fieldText: 'User Name' },
        { fieldName: 'TCODE', offset: 53, length: 20, type: 'C', dataType: 'CHAR', fieldText: 'Transaction Code' },
        { fieldName: 'BKTXT', offset: 73, length: 25, type: 'C', dataType: 'CHAR', fieldText: 'Document Header Text' },
        { fieldName: 'WAERS', offset: 98, length: 5, type: 'C', dataType: 'CUKY', fieldText: 'Currency Key' },
        { fieldName: 'BSTAT', offset: 103, length: 1, type: 'C', dataType: 'CHAR', fieldText: 'Document Status' }
      ]
    };

    // FI - BSEG (Accounting Document Segment / Line Items)
    this.tableCatalog['BSEG'] = {
      tableName: 'BSEG',
      description: 'Accounting Document Segment',
      module: 'FI',
      authGroup: 'FC',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'BUKRS', offset: 3, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Company Code', isKey: true },
        { fieldName: 'BELNR', offset: 7, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Accounting Document Number', isKey: true },
        { fieldName: 'GJAHR', offset: 17, length: 4, type: 'N', dataType: 'NUMC', fieldText: 'Fiscal Year', isKey: true },
        { fieldName: 'BUZEI', offset: 21, length: 3, type: 'N', dataType: 'NUMC', fieldText: 'Line Item Number', isKey: true },
        { fieldName: 'BSCHL', offset: 24, length: 2, type: 'C', dataType: 'CHAR', fieldText: 'Posting Key (01, 31, 40, 50)' },
        { fieldName: 'KOART', offset: 26, length: 1, type: 'C', dataType: 'CHAR', fieldText: 'Account Type (S=G/L, D=Customer, K=Vendor, A=Asset)' },
        { fieldName: 'SHKZG', offset: 27, length: 1, type: 'C', dataType: 'CHAR', fieldText: 'Debit/Credit Indicator (S=Debit, H=Credit)' },
        { fieldName: 'HKONT', offset: 28, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'General Ledger Account' },
        { fieldName: 'KUNNR', offset: 38, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Customer Number' },
        { fieldName: 'LIFNR', offset: 48, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Vendor Number' },
        { fieldName: 'WRBTR', offset: 58, length: 13, type: 'P', dataType: 'CURR', decimals: 2, fieldText: 'Amount in Document Currency' },
        { fieldName: 'DMBTR', offset: 71, length: 13, type: 'P', dataType: 'CURR', decimals: 2, fieldText: 'Amount in Local Currency' },
        { fieldName: 'WAERS', offset: 84, length: 5, type: 'C', dataType: 'CUKY', fieldText: 'Currency' },
        { fieldName: 'MWSKZ', offset: 89, length: 2, type: 'C', dataType: 'CHAR', fieldText: 'Tax on Sales/Purchases Code' },
        { fieldName: 'MWSTS', offset: 91, length: 13, type: 'P', dataType: 'CURR', decimals: 2, fieldText: 'Tax Amount in Document Currency' },
        { fieldName: 'KOSTL', offset: 104, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Cost Center' },
        { fieldName: 'PRCTR', offset: 114, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Profit Center' },
        { fieldName: 'SGTXT', offset: 124, length: 50, type: 'C', dataType: 'CHAR', fieldText: 'Item Text' },
        { fieldName: 'ZFBDT', offset: 174, length: 8, type: 'D', dataType: 'DATS', fieldText: 'Baseline Date for Due Date Calculation' },
        { fieldName: 'ZTERM', offset: 182, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Terms of Payment Key' },
        { fieldName: 'AUGDT', offset: 186, length: 8, type: 'D', dataType: 'DATS', fieldText: 'Clearing Date' },
        { fieldName: 'AUGBL', offset: 194, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Clearing Document Number' }
      ]
    };

    // FI - BSIK (Secondary Index: Vendors - Open Items)
    this.tableCatalog['BSIK'] = {
      tableName: 'BSIK',
      description: 'Accounting: Secondary Index for Vendors (Open Items)',
      module: 'FI',
      authGroup: 'FC',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'BUKRS', offset: 3, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Company Code', isKey: true },
        { fieldName: 'LIFNR', offset: 7, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Vendor Number', isKey: true },
        { fieldName: 'UMSKS', offset: 17, length: 1, type: 'C', dataType: 'CHAR', fieldText: 'Special G/L Transaction Type' },
        { fieldName: 'UMSKZ', offset: 18, length: 1, type: 'C', dataType: 'CHAR', fieldText: 'Special G/L Indicator' },
        { fieldName: 'AUGDT', offset: 19, length: 8, type: 'D', dataType: 'DATS', fieldText: 'Clearing Date' },
        { fieldName: 'AUGBL', offset: 27, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Clearing Document' },
        { fieldName: 'ZUONR', offset: 37, length: 18, type: 'C', dataType: 'CHAR', fieldText: 'Assignment Number' },
        { fieldName: 'GJAHR', offset: 55, length: 4, type: 'N', dataType: 'NUMC', fieldText: 'Fiscal Year', isKey: true },
        { fieldName: 'BELNR', offset: 59, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Accounting Document Number', isKey: true },
        { fieldName: 'BUZEI', offset: 69, length: 3, type: 'N', dataType: 'NUMC', fieldText: 'Number of Line Item', isKey: true },
        { fieldName: 'BUDAT', offset: 72, length: 8, type: 'D', dataType: 'DATS', fieldText: 'Posting Date' },
        { fieldName: 'BLDAT', offset: 80, length: 8, type: 'D', dataType: 'DATS', fieldText: 'Document Date' },
        { fieldName: 'WAERS', offset: 88, length: 5, type: 'C', dataType: 'CUKY', fieldText: 'Currency' },
        { fieldName: 'WRBTR', offset: 93, length: 13, type: 'P', dataType: 'CURR', decimals: 2, fieldText: 'Amount in Document Currency' },
        { fieldName: 'DMBTR', offset: 106, length: 13, type: 'P', dataType: 'CURR', decimals: 2, fieldText: 'Amount in Local Currency' },
        { fieldName: 'SHKZG', offset: 119, length: 1, type: 'C', dataType: 'CHAR', fieldText: 'Debit/Credit Indicator (H=Credit/Payable, S=Debit/Credit Memo)' },
        { fieldName: 'ZFBDT', offset: 120, length: 8, type: 'D', dataType: 'DATS', fieldText: 'Baseline Due Date' },
        { fieldName: 'ZTERM', offset: 128, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Terms of Payment Key' },
        { fieldName: 'ZBD1T', offset: 132, length: 3, type: 'DEC', dataType: 'DEC', fieldText: 'Cash Discount Days 1' },
        { fieldName: 'ZBD2T', offset: 135, length: 3, type: 'DEC', dataType: 'DEC', fieldText: 'Cash Discount Days 2' },
        { fieldName: 'ZBD3T', offset: 138, length: 3, type: 'DEC', dataType: 'DEC', fieldText: 'Net Due Days' },
        { fieldName: 'SGTXT', offset: 141, length: 50, type: 'C', dataType: 'CHAR', fieldText: 'Item Text' }
      ]
    };

    // FI - BSAK (Secondary Index: Vendors - Cleared Items)
    this.tableCatalog['BSAK'] = {
      tableName: 'BSAK',
      description: 'Accounting: Secondary Index for Vendors (Cleared Items)',
      module: 'FI',
      authGroup: 'FC',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'BUKRS', offset: 3, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Company Code', isKey: true },
        { fieldName: 'LIFNR', offset: 7, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Vendor Number', isKey: true },
        { fieldName: 'AUGDT', offset: 17, length: 8, type: 'D', dataType: 'DATS', fieldText: 'Clearing Date' },
        { fieldName: 'AUGBL', offset: 25, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Clearing Document' },
        { fieldName: 'GJAHR', offset: 35, length: 4, type: 'N', dataType: 'NUMC', fieldText: 'Fiscal Year', isKey: true },
        { fieldName: 'BELNR', offset: 39, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Document Number', isKey: true },
        { fieldName: 'BUZEI', offset: 49, length: 3, type: 'N', dataType: 'NUMC', fieldText: 'Line Item Number', isKey: true },
        { fieldName: 'WRBTR', offset: 52, length: 13, type: 'P', dataType: 'CURR', decimals: 2, fieldText: 'Amount in Document Currency' },
        { fieldName: 'WAERS', offset: 65, length: 5, type: 'C', dataType: 'CUKY', fieldText: 'Currency' }
      ]
    };

    // FI - BSID (Secondary Index: Customers - Open Items)
    this.tableCatalog['BSID'] = {
      tableName: 'BSID',
      description: 'Accounting: Secondary Index for Customers (Open Items)',
      module: 'FI',
      authGroup: 'FC',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'BUKRS', offset: 3, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Company Code', isKey: true },
        { fieldName: 'KUNNR', offset: 7, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Customer Number', isKey: true },
        { fieldName: 'UMSKS', offset: 17, length: 1, type: 'C', dataType: 'CHAR', fieldText: 'Special G/L Transaction Type' },
        { fieldName: 'UMSKZ', offset: 18, length: 1, type: 'C', dataType: 'CHAR', fieldText: 'Special G/L Indicator' },
        { fieldName: 'AUGDT', offset: 19, length: 8, type: 'D', dataType: 'DATS', fieldText: 'Clearing Date' },
        { fieldName: 'AUGBL', offset: 27, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Clearing Document' },
        { fieldName: 'ZUONR', offset: 37, length: 18, type: 'C', dataType: 'CHAR', fieldText: 'Assignment Number' },
        { fieldName: 'GJAHR', offset: 55, length: 4, type: 'N', dataType: 'NUMC', fieldText: 'Fiscal Year', isKey: true },
        { fieldName: 'BELNR', offset: 59, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Accounting Document Number', isKey: true },
        { fieldName: 'BUZEI', offset: 69, length: 3, type: 'N', dataType: 'NUMC', fieldText: 'Number of Line Item', isKey: true },
        { fieldName: 'BUDAT', offset: 72, length: 8, type: 'D', dataType: 'DATS', fieldText: 'Posting Date' },
        { fieldName: 'BLDAT', offset: 80, length: 8, type: 'D', dataType: 'DATS', fieldText: 'Document Date' },
        { fieldName: 'WAERS', offset: 88, length: 5, type: 'C', dataType: 'CUKY', fieldText: 'Currency' },
        { fieldName: 'WRBTR', offset: 93, length: 13, type: 'P', dataType: 'CURR', decimals: 2, fieldText: 'Amount in Document Currency' },
        { fieldName: 'DMBTR', offset: 106, length: 13, type: 'P', dataType: 'CURR', decimals: 2, fieldText: 'Amount in Local Currency' },
        { fieldName: 'SHKZG', offset: 119, length: 1, type: 'C', dataType: 'CHAR', fieldText: 'Debit/Credit Indicator (S=Debit/Receivable, H=Credit)' },
        { fieldName: 'ZFBDT', offset: 120, length: 8, type: 'D', dataType: 'DATS', fieldText: 'Baseline Due Date' },
        { fieldName: 'ZTERM', offset: 128, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Terms of Payment Key' },
        { fieldName: 'MANSP', offset: 132, length: 1, type: 'C', dataType: 'CHAR', fieldText: 'Dunning Block' },
        { fieldName: 'MSCHL', offset: 133, length: 1, type: 'C', dataType: 'CHAR', fieldText: 'Dunning Key' },
        { fieldName: 'MADAT', offset: 134, length: 8, type: 'D', dataType: 'DATS', fieldText: 'Last Dunning Date' },
        { fieldName: 'MANST', offset: 142, length: 1, type: 'N', dataType: 'NUMC', fieldText: 'Dunning Level (0, 1, 2, 3)' },
        { fieldName: 'SGTXT', offset: 143, length: 50, type: 'C', dataType: 'CHAR', fieldText: 'Item Text' }
      ]
    };

    // FI - BSAD (Secondary Index: Customers - Cleared Items)
    this.tableCatalog['BSAD'] = {
      tableName: 'BSAD',
      description: 'Accounting: Secondary Index for Customers (Cleared Items)',
      module: 'FI',
      authGroup: 'FC',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'BUKRS', offset: 3, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Company Code', isKey: true },
        { fieldName: 'KUNNR', offset: 7, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Customer Number', isKey: true },
        { fieldName: 'AUGDT', offset: 17, length: 8, type: 'D', dataType: 'DATS', fieldText: 'Clearing Date' },
        { fieldName: 'AUGBL', offset: 25, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Clearing Document' },
        { fieldName: 'GJAHR', offset: 35, length: 4, type: 'N', dataType: 'NUMC', fieldText: 'Fiscal Year', isKey: true },
        { fieldName: 'BELNR', offset: 39, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Document Number', isKey: true },
        { fieldName: 'BUZEI', offset: 49, length: 3, type: 'N', dataType: 'NUMC', fieldText: 'Line Item Number', isKey: true },
        { fieldName: 'WRBTR', offset: 52, length: 13, type: 'P', dataType: 'CURR', decimals: 2, fieldText: 'Amount in Document Currency' },
        { fieldName: 'WAERS', offset: 65, length: 5, type: 'C', dataType: 'CUKY', fieldText: 'Currency' }
      ]
    };

    // CO - COEP (CO Object: Line Items by Period)
    this.tableCatalog['COEP'] = {
      tableName: 'COEP',
      description: 'CO Object: Line Items (by Period)',
      module: 'CO',
      authGroup: 'CO',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'KOKRS', offset: 3, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Controlling Area', isKey: true },
        { fieldName: 'BELNR', offset: 7, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'CO Document Number', isKey: true },
        { fieldName: 'BUZEI', offset: 17, length: 3, type: 'N', dataType: 'NUMC', fieldText: 'CO Line Item Number', isKey: true },
        { fieldName: 'PERIO', offset: 20, length: 3, type: 'N', dataType: 'NUMC', fieldText: 'Period' },
        { fieldName: 'GJAHR', offset: 23, length: 4, type: 'N', dataType: 'NUMC', fieldText: 'Fiscal Year' },
        { fieldName: 'KSTAR', offset: 27, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Cost Element' },
        { fieldName: 'KOSTL', offset: 37, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Cost Center' },
        { fieldName: 'AUFNR', offset: 47, length: 12, type: 'C', dataType: 'CHAR', fieldText: 'Order Number' },
        { fieldName: 'PRCTR', offset: 59, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Profit Center' },
        { fieldName: 'WTG001', offset: 69, length: 13, type: 'P', dataType: 'CURR', decimals: 2, fieldText: 'Value in Transaction Currency' },
        { fieldName: 'WOG001', offset: 82, length: 13, type: 'P', dataType: 'CURR', decimals: 2, fieldText: 'Value in Controlling Area Currency' },
        { fieldName: 'TWAER', offset: 95, length: 5, type: 'C', dataType: 'CUKY', fieldText: 'Transaction Currency' },
        { fieldName: 'BLDAT', offset: 100, length: 8, type: 'D', dataType: 'DATS', fieldText: 'Document Date' },
        { fieldName: 'BUDAT', offset: 108, length: 8, type: 'D', dataType: 'DATS', fieldText: 'Posting Date' },
        { fieldName: 'USNAM', offset: 116, length: 12, type: 'C', dataType: 'CHAR', fieldText: 'User Name' },
        { fieldName: 'SGTXT', offset: 128, length: 50, type: 'C', dataType: 'CHAR', fieldText: 'Line Item Text' }
      ]
    };

    // CO - CSKS (Cost Center Master Record)
    this.tableCatalog['CSKS'] = {
      tableName: 'CSKS',
      description: 'Cost Center Master Record',
      module: 'CO',
      authGroup: 'CO',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'KOKRS', offset: 3, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Controlling Area', isKey: true },
        { fieldName: 'KOSTL', offset: 7, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Cost Center', isKey: true },
        { fieldName: 'DATBI', offset: 17, length: 8, type: 'D', dataType: 'DATS', fieldText: 'Valid To Date', isKey: true },
        { fieldName: 'DATAB', offset: 25, length: 8, type: 'D', dataType: 'DATS', fieldText: 'Valid From Date' },
        { fieldName: 'BUKRS', offset: 33, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Company Code' },
        { fieldName: 'GSBER', offset: 37, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Business Area' },
        { fieldName: 'KOSAR', offset: 41, length: 1, type: 'C', dataType: 'CHAR', fieldText: 'Cost Center Category' },
        { fieldName: 'VERAK', offset: 42, length: 20, type: 'C', dataType: 'CHAR', fieldText: 'Person Responsible' },
        { fieldName: 'PRCTR', offset: 62, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Profit Center' },
        { fieldName: 'WAERS', offset: 72, length: 5, type: 'C', dataType: 'CUKY', fieldText: 'Currency' }
      ]
    };

    // CO - CSKT (Cost Center Texts)
    this.tableCatalog['CSKT'] = {
      tableName: 'CSKT',
      description: 'Cost Center Texts',
      module: 'CO',
      authGroup: 'CO',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'SPRAS', offset: 3, length: 1, type: 'C', dataType: 'LANG', fieldText: 'Language Key', isKey: true },
        { fieldName: 'KOKRS', offset: 4, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Controlling Area', isKey: true },
        { fieldName: 'KOSTL', offset: 8, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Cost Center', isKey: true },
        { fieldName: 'DATBI', offset: 18, length: 8, type: 'D', dataType: 'DATS', fieldText: 'Valid To Date', isKey: true },
        { fieldName: 'KTEXT', offset: 26, length: 20, type: 'C', dataType: 'CHAR', fieldText: 'General Name' },
        { fieldName: 'LTEXT', offset: 46, length: 40, type: 'C', dataType: 'CHAR', fieldText: 'Description' }
      ]
    };

    // FI - SKA1 (G/L Account Master: Chart of Accounts)
    this.tableCatalog['SKA1'] = {
      tableName: 'SKA1',
      description: 'G/L Account Master (Chart of Accounts)',
      module: 'FI',
      authGroup: 'FC',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'KTOPL', offset: 3, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Chart of Accounts', isKey: true },
        { fieldName: 'SAKNR', offset: 7, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'G/L Account Number', isKey: true },
        { fieldName: 'BILKT', offset: 17, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Group Account Number' },
        { fieldName: 'GVTYP', offset: 27, length: 1, type: 'C', dataType: 'CHAR', fieldText: 'P&L Statement Account Type (X=P&L, Blank=Balance Sheet)' },
        { fieldName: 'XBILK', offset: 28, length: 1, type: 'C', dataType: 'CHAR', fieldText: 'Indicator: Balance Sheet Account' },
        { fieldName: 'KTOA', offset: 29, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Account Group' }
      ]
    };

    // FI - SKB1 (G/L Account Master: Company Code)
    this.tableCatalog['SKB1'] = {
      tableName: 'SKB1',
      description: 'G/L Account Master (Company Code)',
      module: 'FI',
      authGroup: 'FC',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'BUKRS', offset: 3, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Company Code', isKey: true },
        { fieldName: 'SAKNR', offset: 7, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'G/L Account Number', isKey: true },
        { fieldName: 'WAERS', offset: 17, length: 5, type: 'C', dataType: 'CUKY', fieldText: 'Account Currency' },
        { fieldName: 'MITKZ', offset: 22, length: 1, type: 'C', dataType: 'CHAR', fieldText: 'Reconciliation Account Type (D=Customer, K=Vendor, A=Asset)' },
        { fieldName: 'WMWST', offset: 23, length: 1, type: 'C', dataType: 'CHAR', fieldText: 'Tax Category' },
        { fieldName: 'FDLEV', offset: 24, length: 2, type: 'C', dataType: 'CHAR', fieldText: 'Planning Level' },
        { fieldName: 'FSTAG', offset: 26, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Field Status Group' }
      ]
    };

    // FI - SKAT (G/L Account Master: Texts)
    this.tableCatalog['SKAT'] = {
      tableName: 'SKAT',
      description: 'G/L Account Master Texts',
      module: 'FI',
      authGroup: 'FC',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'SPRAS', offset: 3, length: 1, type: 'C', dataType: 'LANG', fieldText: 'Language Key', isKey: true },
        { fieldName: 'KTOPL', offset: 4, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Chart of Accounts', isKey: true },
        { fieldName: 'SAKNR', offset: 8, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'G/L Account Number', isKey: true },
        { fieldName: 'TXT20', offset: 18, length: 20, type: 'C', dataType: 'CHAR', fieldText: 'Short Text' },
        { fieldName: 'TXT50', offset: 38, length: 50, type: 'C', dataType: 'CHAR', fieldText: 'Long Text' }
      ]
    };

    // CO - CEPC (Profit Center Master Data)
    this.tableCatalog['CEPC'] = {
      tableName: 'CEPC',
      description: 'Profit Center Master Data',
      module: 'CO',
      authGroup: 'CO',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'PRCTR', offset: 3, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Profit Center', isKey: true },
        { fieldName: 'DATBI', offset: 13, length: 8, type: 'D', dataType: 'DATS', fieldText: 'Valid To Date', isKey: true },
        { fieldName: 'KOKRS', offset: 21, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Controlling Area', isKey: true },
        { fieldName: 'DATAB', offset: 25, length: 8, type: 'D', dataType: 'DATS', fieldText: 'Valid From Date' },
        { fieldName: 'VERAK', offset: 33, length: 20, type: 'C', dataType: 'CHAR', fieldText: 'Person Responsible' },
        { fieldName: 'SEGMENT', offset: 53, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Segment for Segment Reporting' },
        { fieldName: 'USNAM', offset: 63, length: 12, type: 'C', dataType: 'CHAR', fieldText: 'Created By' }
      ]
    };

    // CO - CEPCT (Profit Center Texts)
    this.tableCatalog['CEPCT'] = {
      tableName: 'CEPCT',
      description: 'Profit Center Texts',
      module: 'CO',
      authGroup: 'CO',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'SPRAS', offset: 3, length: 1, type: 'C', dataType: 'LANG', fieldText: 'Language Key', isKey: true },
        { fieldName: 'PRCTR', offset: 4, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Profit Center', isKey: true },
        { fieldName: 'DATBI', offset: 14, length: 8, type: 'D', dataType: 'DATS', fieldText: 'Valid To Date', isKey: true },
        { fieldName: 'KOKRS', offset: 22, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Controlling Area', isKey: true },
        { fieldName: 'KTEXT', offset: 26, length: 20, type: 'C', dataType: 'CHAR', fieldText: 'General Name' },
        { fieldName: 'LTEXT', offset: 46, length: 40, type: 'C', dataType: 'CHAR', fieldText: 'Long Text Description' }
      ]
    };

    // FI - T001 (Company Codes)
    this.tableCatalog['T001'] = {
      tableName: 'T001',
      description: 'Company Codes',
      module: 'FI',
      authGroup: 'FC',
      deliveryClass: 'C',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'BUKRS', offset: 3, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Company Code', isKey: true },
        { fieldName: 'BUTXT', offset: 7, length: 25, type: 'C', dataType: 'CHAR', fieldText: 'Name of Company Code' },
        { fieldName: 'ORT01', offset: 32, length: 25, type: 'C', dataType: 'CHAR', fieldText: 'City' },
        { fieldName: 'LAND1', offset: 57, length: 3, type: 'C', dataType: 'CHAR', fieldText: 'Country Key' },
        { fieldName: 'WAERS', offset: 60, length: 5, type: 'C', dataType: 'CUKY', fieldText: 'Currency Key' },
        { fieldName: 'SPRAS', offset: 65, length: 1, type: 'C', dataType: 'LANG', fieldText: 'Language Key' },
        { fieldName: 'KTOPL', offset: 66, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Chart of Accounts' }
      ]
    };

    // PM - AFIH (Maintenance order header)
    this.tableCatalog['AFIH'] = {
      tableName: 'AFIH',
      description: 'Maintenance Order Header',
      module: 'PM',
      authGroup: 'PM',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'AUFNR', offset: 3, length: 12, type: 'C', dataType: 'CHAR', fieldText: 'Order Number', isKey: true },
        { fieldName: 'EQUNR', offset: 15, length: 18, type: 'C', dataType: 'CHAR', fieldText: 'Equipment Number' },
        { fieldName: 'TPLNR', offset: 33, length: 30, type: 'C', dataType: 'CHAR', fieldText: 'Functional Location' },
        { fieldName: 'PRIOK', offset: 63, length: 1, type: 'C', dataType: 'CHAR', fieldText: 'Priority' },
        { fieldName: 'ILART', offset: 64, length: 3, type: 'C', dataType: 'CHAR', fieldText: 'Maintenance Activity Type' }
      ]
    };

    // PM - AUFK (Order Master Data)
    this.tableCatalog['AUFK'] = {
      tableName: 'AUFK',
      description: 'Order Master Data',
      module: 'PM',
      authGroup: 'PM',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'AUFNR', offset: 3, length: 12, type: 'C', dataType: 'CHAR', fieldText: 'Order Number', isKey: true },
        { fieldName: 'AUFART', offset: 15, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Order Type' },
        { fieldName: 'KTEXT', offset: 19, length: 40, type: 'C', dataType: 'CHAR', fieldText: 'Description' },
        { fieldName: 'WERKS', offset: 59, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Plant' },
        { fieldName: 'KOKRS', offset: 63, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Controlling Area' },
        { fieldName: 'KOSTL', offset: 67, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Cost Center' },
        { fieldName: 'IPHAS', offset: 77, length: 1, type: 'C', dataType: 'CHAR', fieldText: 'Maintenance Order Phase (1=Created, 2=Released, 3=Completed)' },
        { fieldName: 'ERDAT', offset: 78, length: 8, type: 'D', dataType: 'DATS', fieldText: 'Creation Date' }
      ]
    };

    // PM - EQUI (Equipment Master)
    this.tableCatalog['EQUI'] = {
      tableName: 'EQUI',
      description: 'Equipment Master Data',
      module: 'PM',
      authGroup: 'PM',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'EQUNR', offset: 3, length: 18, type: 'C', dataType: 'CHAR', fieldText: 'Equipment Number', isKey: true },
        { fieldName: 'EQKTX', offset: 21, length: 40, type: 'C', dataType: 'CHAR', fieldText: 'Description of Technical Object' },
        { fieldName: 'EQTYP', offset: 61, length: 1, type: 'C', dataType: 'CHAR', fieldText: 'Equipment Category' },
        { fieldName: 'TPLNR', offset: 62, length: 30, type: 'C', dataType: 'CHAR', fieldText: 'Functional Location' },
        { fieldName: 'SWERK', offset: 92, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Maintenance Plant' },
        { fieldName: 'INGRP', offset: 96, length: 3, type: 'C', dataType: 'CHAR', fieldText: 'Planner Group for Customer Service and Plant Maintenance' },
        { fieldName: 'HERST', offset: 99, length: 30, type: 'C', dataType: 'CHAR', fieldText: 'Manufacturer of Asset' },
        { fieldName: 'SERGE', offset: 129, length: 30, type: 'C', dataType: 'CHAR', fieldText: 'Manufacturer Serial Number' },
        { fieldName: 'BAUJJ', offset: 159, length: 4, type: 'N', dataType: 'NUMC', fieldText: 'Year of Construction' }
      ]
    };

    // PM - IFLOT (Functional Location Table)
    this.tableCatalog['IFLOT'] = {
      tableName: 'IFLOT',
      description: 'Functional Location Table',
      module: 'PM',
      authGroup: 'PM',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'TPLNR', offset: 3, length: 30, type: 'C', dataType: 'CHAR', fieldText: 'Functional Location', isKey: true },
        { fieldName: 'PLTXT', offset: 33, length: 40, type: 'C', dataType: 'CHAR', fieldText: 'Description of Functional Location' },
        { fieldName: 'FLTYP', offset: 73, length: 1, type: 'C', dataType: 'CHAR', fieldText: 'Functional Location Category' },
        { fieldName: 'SWERK', offset: 74, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Maintenance Plant' },
        { fieldName: 'KOSTL', offset: 78, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Cost Center' },
        { fieldName: 'INGRP', offset: 88, length: 3, type: 'C', dataType: 'CHAR', fieldText: 'Planner Group' }
      ]
    };

    // PM - QMEL (Quality & Maintenance Notification)
    this.tableCatalog['QMEL'] = {
      tableName: 'QMEL',
      description: 'Maintenance Notification Master',
      module: 'PM',
      authGroup: 'QM',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'QMNUM', offset: 3, length: 12, type: 'C', dataType: 'CHAR', fieldText: 'Notification Number', isKey: true },
        { fieldName: 'QMART', offset: 15, length: 2, type: 'C', dataType: 'CHAR', fieldText: 'Notification Type (M1, M2, M3)' },
        { fieldName: 'QMTXT', offset: 17, length: 40, type: 'C', dataType: 'CHAR', fieldText: 'Short Description' },
        { fieldName: 'EQUNR', offset: 57, length: 18, type: 'C', dataType: 'CHAR', fieldText: 'Equipment Number' },
        { fieldName: 'TPLNR', offset: 75, length: 30, type: 'C', dataType: 'CHAR', fieldText: 'Functional Location' },
        { fieldName: 'PRIOK', offset: 105, length: 1, type: 'C', dataType: 'CHAR', fieldText: 'Priority (1=Emergency, 2=High, 3=Med, 4=Low)' },
        { fieldName: 'ERDAT', offset: 106, length: 8, type: 'D', dataType: 'DATS', fieldText: 'Notification Date' },
        { fieldName: 'ERNAM', offset: 114, length: 12, type: 'C', dataType: 'CHAR', fieldText: 'Created By User' },
        { fieldName: 'QMSTATUS', offset: 126, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Notification Status (OSNO, NOPR, NOCO)' },
        { fieldName: 'MSAUS', offset: 130, length: 1, type: 'C', dataType: 'CHAR', fieldText: 'Breakdown Indicator (X=Breakdown)' },
        { fieldName: 'AUFNR', offset: 131, length: 12, type: 'C', dataType: 'CHAR', fieldText: 'Associated Maintenance Order' }
      ]
    };

    // PP - AFKO (Order Header Data PP Orders)
    this.tableCatalog['AFKO'] = {
      tableName: 'AFKO',
      description: 'Order Header Data PP Orders',
      module: 'PP',
      authGroup: 'CO',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'AUFNR', offset: 3, length: 12, type: 'C', dataType: 'CHAR', fieldText: 'Order Number', isKey: true },
        { fieldName: 'GLTRS', offset: 15, length: 8, type: 'D', dataType: 'DATS', fieldText: 'Scheduled Finish Date' },
        { fieldName: 'GSTRI', offset: 23, length: 8, type: 'D', dataType: 'DATS', fieldText: 'Scheduled Start Date' },
        { fieldName: 'GETRI', offset: 31, length: 8, type: 'D', dataType: 'DATS', fieldText: 'Actual Finish Date' },
        { fieldName: 'GSTRS', offset: 39, length: 8, type: 'D', dataType: 'DATS', fieldText: 'Basic Start Date' },
        { fieldName: 'GLTRI', offset: 47, length: 8, type: 'D', dataType: 'DATS', fieldText: 'Basic Finish Date' },
        { fieldName: 'FTRMS', offset: 55, length: 8, type: 'D', dataType: 'DATS', fieldText: 'Release Date' },
        { fieldName: 'GAMNG', offset: 63, length: 13, type: 'P', dataType: 'QUAN', decimals: 3, fieldText: 'Total Order Quantity' },
        { fieldName: 'GASMG', offset: 76, length: 13, type: 'P', dataType: 'QUAN', decimals: 3, fieldText: 'Total Scrap Quantity' },
        { fieldName: 'GMEIN', offset: 89, length: 3, type: 'C', dataType: 'UNIT', fieldText: 'Base Unit of Measure' },
        { fieldName: 'PLNBEZ', offset: 92, length: 18, type: 'C', dataType: 'CHAR', fieldText: 'Material to be Produced' },
        { fieldName: 'DISPO', offset: 110, length: 3, type: 'C', dataType: 'CHAR', fieldText: 'MRP Controller' },
        { fieldName: 'FEVOR', offset: 113, length: 3, type: 'C', dataType: 'CHAR', fieldText: 'Production Supervisor' },
        { fieldName: 'AUFPL', offset: 116, length: 10, type: 'N', dataType: 'NUMC', fieldText: 'Routing Number of Operations' }
      ]
    };

    // PP - AFPO (Order Item Data PP Orders)
    this.tableCatalog['AFPO'] = {
      tableName: 'AFPO',
      description: 'Order Item Data PP Orders',
      module: 'PP',
      authGroup: 'CO',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'AUFNR', offset: 3, length: 12, type: 'C', dataType: 'CHAR', fieldText: 'Order Number', isKey: true },
        { fieldName: 'POSNR', offset: 15, length: 4, type: 'N', dataType: 'NUMC', fieldText: 'Order Item Number', isKey: true },
        { fieldName: 'MATNR', offset: 19, length: 18, type: 'C', dataType: 'CHAR', fieldText: 'Material Number' },
        { fieldName: 'WERKS', offset: 37, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Plant' },
        { fieldName: 'PWERK', offset: 41, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Planning Plant' },
        { fieldName: 'CHARG', offset: 45, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Batch Number' },
        { fieldName: 'PSMNG', offset: 55, length: 13, type: 'P', dataType: 'QUAN', decimals: 3, fieldText: 'Target Order Quantity' },
        { fieldName: 'WEMNG', offset: 68, length: 13, type: 'P', dataType: 'QUAN', decimals: 3, fieldText: 'Delivered / Confirmed Quantity' },
        { fieldName: 'AMEIN', offset: 81, length: 3, type: 'C', dataType: 'UNIT', fieldText: 'Unit of Measure' },
        { fieldName: 'PAMNG', offset: 84, length: 13, type: 'P', dataType: 'QUAN', decimals: 3, fieldText: 'Scrap Quantity' },
        { fieldName: 'KDAUF', offset: 97, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Sales Order Number' },
        { fieldName: 'KDPOS', offset: 107, length: 6, type: 'N', dataType: 'NUMC', fieldText: 'Sales Order Item' },
        { fieldName: 'ELIKZ', offset: 113, length: 1, type: 'C', dataType: 'CHAR', fieldText: 'Delivery Completed Indicator' }
      ]
    };

    // PP - AFVC (Order Operations / Routing Steps)
    this.tableCatalog['AFVC'] = {
      tableName: 'AFVC',
      description: 'Order Operations (Routing Steps)',
      module: 'PP',
      authGroup: 'CO',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'AUFPL', offset: 3, length: 10, type: 'N', dataType: 'NUMC', fieldText: 'Routing Plan Number', isKey: true },
        { fieldName: 'APLZL', offset: 13, length: 8, type: 'N', dataType: 'NUMC', fieldText: 'Internal Counter', isKey: true },
        { fieldName: 'VORNR', offset: 21, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Operation Number (e.g. 0010, 0020)' },
        { fieldName: 'ARBPL', offset: 25, length: 8, type: 'C', dataType: 'CHAR', fieldText: 'Work Center' },
        { fieldName: 'WERKS', offset: 33, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Plant' },
        { fieldName: 'STEUS', offset: 37, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Control Key (PP01, PP02)' },
        { fieldName: 'LTXA1', offset: 41, length: 40, type: 'C', dataType: 'CHAR', fieldText: 'Operation Description Text' },
        { fieldName: 'VGW01', offset: 81, length: 9, type: 'P', dataType: 'QUAN', decimals: 2, fieldText: 'Setup Standard Value (Hours)' },
        { fieldName: 'VGW02', offset: 90, length: 9, type: 'P', dataType: 'QUAN', decimals: 2, fieldText: 'Machine Standard Value (Hours)' },
        { fieldName: 'VGW03', offset: 99, length: 9, type: 'P', dataType: 'QUAN', decimals: 2, fieldText: 'Labor Standard Value (Hours)' },
        { fieldName: 'MEINH', offset: 108, length: 3, type: 'C', dataType: 'UNIT', fieldText: 'Unit of Measure' }
      ]
    };

    // PP - AFRU (Order Completion Confirmations - CO11N)
    this.tableCatalog['AFRU'] = {
      tableName: 'AFRU',
      description: 'Order Completion Confirmations (CO11N)',
      module: 'PP',
      authGroup: 'CO',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'RUECK', offset: 3, length: 10, type: 'N', dataType: 'NUMC', fieldText: 'Confirmation Number', isKey: true },
        { fieldName: 'RMZHL', offset: 13, length: 8, type: 'N', dataType: 'NUMC', fieldText: 'Confirmation Counter', isKey: true },
        { fieldName: 'AUFNR', offset: 21, length: 12, type: 'C', dataType: 'CHAR', fieldText: 'Production Order Number' },
        { fieldName: 'VORNR', offset: 33, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Operation Number' },
        { fieldName: 'LMNGA', offset: 37, length: 13, type: 'P', dataType: 'QUAN', decimals: 3, fieldText: 'Confirmed Yield Quantity' },
        { fieldName: 'XMNGA', offset: 50, length: 13, type: 'P', dataType: 'QUAN', decimals: 3, fieldText: 'Confirmed Scrap Quantity' },
        { fieldName: 'GMEIN', offset: 63, length: 3, type: 'C', dataType: 'UNIT', fieldText: 'Unit of Measure' },
        { fieldName: 'ISM01', offset: 66, length: 9, type: 'P', dataType: 'QUAN', decimals: 2, fieldText: 'Actual Setup Time (Hours)' },
        { fieldName: 'ISM02', offset: 75, length: 9, type: 'P', dataType: 'QUAN', decimals: 2, fieldText: 'Actual Machine Time (Hours)' },
        { fieldName: 'ISM03', offset: 84, length: 9, type: 'P', dataType: 'QUAN', decimals: 2, fieldText: 'Actual Labor Time (Hours)' },
        { fieldName: 'BUDAT', offset: 93, length: 8, type: 'D', dataType: 'DATS', fieldText: 'Posting Date' },
        { fieldName: 'ERNAM', offset: 101, length: 12, type: 'C', dataType: 'CHAR', fieldText: 'Entered By User' },
        { fieldName: 'STOKZ', offset: 113, length: 1, type: 'C', dataType: 'CHAR', fieldText: 'Reversal Indicator' }
      ]
    };

    // PP - RESB (Reservation / Dependent Requirements / Shortages)
    this.tableCatalog['RESB'] = {
      tableName: 'RESB',
      description: 'Reservation / Dependent Requirements',
      module: 'PP',
      authGroup: 'MD',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'RSNUM', offset: 3, length: 10, type: 'N', dataType: 'NUMC', fieldText: 'Reservation Number', isKey: true },
        { fieldName: 'RSPOS', offset: 13, length: 4, type: 'N', dataType: 'NUMC', fieldText: 'Item Number of Reservation', isKey: true },
        { fieldName: 'RSART', offset: 17, length: 1, type: 'C', dataType: 'CHAR', fieldText: 'Record Type' },
        { fieldName: 'AUFNR', offset: 18, length: 12, type: 'C', dataType: 'CHAR', fieldText: 'Order Number' },
        { fieldName: 'BAUGR', offset: 30, length: 18, type: 'C', dataType: 'CHAR', fieldText: 'Higher-Level Assembly Material' },
        { fieldName: 'MATNR', offset: 48, length: 18, type: 'C', dataType: 'CHAR', fieldText: 'Component Material Number' },
        { fieldName: 'WERKS', offset: 66, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Plant' },
        { fieldName: 'LGORT', offset: 70, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Storage Location' },
        { fieldName: 'BDMNG', offset: 74, length: 13, type: 'P', dataType: 'QUAN', decimals: 3, fieldText: 'Requirement Quantity' },
        { fieldName: 'ENMNG', offset: 87, length: 13, type: 'P', dataType: 'QUAN', decimals: 3, fieldText: 'Quantity Withdrawn' },
        { fieldName: 'FMENG', offset: 100, length: 13, type: 'P', dataType: 'QUAN', decimals: 3, fieldText: 'Missing Quantity (Shortage)' },
        { fieldName: 'MEINS', offset: 113, length: 3, type: 'C', dataType: 'UNIT', fieldText: 'Base Unit of Measure' },
        { fieldName: 'SHKZG', offset: 116, length: 1, type: 'C', dataType: 'CHAR', fieldText: 'Debit/Credit Indicator' },
        { fieldName: 'KZEAR', offset: 117, length: 1, type: 'C', dataType: 'CHAR', fieldText: 'Final Issue Indicator' },
        { fieldName: 'XLOEK', offset: 118, length: 1, type: 'C', dataType: 'CHAR', fieldText: 'Deletion Indicator' }
      ]
    };

    // PP - PLAF (Planned Orders - MRP)
    this.tableCatalog['PLAF'] = {
      tableName: 'PLAF',
      description: 'Planned Orders (MRP / MD04 / CO40)',
      module: 'PP',
      authGroup: 'MD',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'PLNUM', offset: 3, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Planned Order Number', isKey: true },
        { fieldName: 'MATNR', offset: 13, length: 18, type: 'C', dataType: 'CHAR', fieldText: 'Material Number' },
        { fieldName: 'WERKS', offset: 31, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Plant' },
        { fieldName: 'BERID', offset: 35, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'MRP Area' },
        { fieldName: 'GSMNG', offset: 45, length: 13, type: 'P', dataType: 'QUAN', decimals: 3, fieldText: 'Planned Total Quantity' },
        { fieldName: 'MEINS', offset: 58, length: 3, type: 'C', dataType: 'UNIT', fieldText: 'Base Unit of Measure' },
        { fieldName: 'PSTTR', offset: 61, length: 8, type: 'D', dataType: 'DATS', fieldText: 'Order Start Date' },
        { fieldName: 'PEDTR', offset: 69, length: 8, type: 'D', dataType: 'DATS', fieldText: 'Order Finish Date' },
        { fieldName: 'DISPO', offset: 77, length: 3, type: 'C', dataType: 'CHAR', fieldText: 'MRP Controller' },
        { fieldName: 'BESKZ', offset: 80, length: 1, type: 'C', dataType: 'CHAR', fieldText: 'Procurement Type (E=In-house, F=External)' }
      ]
    };

    // PP - MAST (Material to BOM Link)
    this.tableCatalog['MAST'] = {
      tableName: 'MAST',
      description: 'Material to BOM Link',
      module: 'PP',
      authGroup: 'CS',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'MATNR', offset: 3, length: 18, type: 'C', dataType: 'CHAR', fieldText: 'Material Number', isKey: true },
        { fieldName: 'WERKS', offset: 21, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Plant', isKey: true },
        { fieldName: 'STLAN', offset: 25, length: 1, type: 'C', dataType: 'CHAR', fieldText: 'BOM Usage (1=Production)', isKey: true },
        { fieldName: 'STLNR', offset: 26, length: 8, type: 'C', dataType: 'CHAR', fieldText: 'Bill of Material Number', isKey: true },
        { fieldName: 'STLAL', offset: 34, length: 2, type: 'C', dataType: 'CHAR', fieldText: 'Alternative BOM', isKey: true }
      ]
    };

    // PP - STKO (BOM Header)
    this.tableCatalog['STKO'] = {
      tableName: 'STKO',
      description: 'BOM Header Data',
      module: 'PP',
      authGroup: 'CS',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'STLTY', offset: 3, length: 1, type: 'C', dataType: 'CHAR', fieldText: 'BOM Category (M=Material)', isKey: true },
        { fieldName: 'STLNR', offset: 4, length: 8, type: 'C', dataType: 'CHAR', fieldText: 'Bill of Material Number', isKey: true },
        { fieldName: 'STLAL', offset: 12, length: 2, type: 'C', dataType: 'CHAR', fieldText: 'Alternative BOM', isKey: true },
        { fieldName: 'BMENG', offset: 14, length: 13, type: 'P', dataType: 'QUAN', decimals: 3, fieldText: 'Base Quantity' },
        { fieldName: 'BMEIN', offset: 27, length: 3, type: 'C', dataType: 'UNIT', fieldText: 'Base Unit of Measure' },
        { fieldName: 'STKTX', offset: 30, length: 40, type: 'C', dataType: 'CHAR', fieldText: 'BOM Text Description' },
        { fieldName: 'DATUV', offset: 70, length: 8, type: 'D', dataType: 'DATS', fieldText: 'Valid-From Date' }
      ]
    };

    // PP - STPO (BOM Item / Components)
    this.tableCatalog['STPO'] = {
      tableName: 'STPO',
      description: 'BOM Item (Components)',
      module: 'PP',
      authGroup: 'CS',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'STLTY', offset: 3, length: 1, type: 'C', dataType: 'CHAR', fieldText: 'BOM Category', isKey: true },
        { fieldName: 'STLNR', offset: 4, length: 8, type: 'C', dataType: 'CHAR', fieldText: 'Bill of Material Number', isKey: true },
        { fieldName: 'STLKN', offset: 12, length: 8, type: 'N', dataType: 'NUMC', fieldText: 'BOM Item Node Number', isKey: true },
        { fieldName: 'STPOZ', offset: 20, length: 8, type: 'N', dataType: 'NUMC', fieldText: 'Internal Counter', isKey: true },
        { fieldName: 'POSNR', offset: 28, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Item Number' },
        { fieldName: 'POSTP', offset: 32, length: 1, type: 'C', dataType: 'CHAR', fieldText: 'Item Category (L=Stock Item)' },
        { fieldName: 'IDNRK', offset: 33, length: 18, type: 'C', dataType: 'CHAR', fieldText: 'Component Material Number' },
        { fieldName: 'MENGE', offset: 51, length: 13, type: 'P', dataType: 'QUAN', decimals: 3, fieldText: 'Component Quantity' },
        { fieldName: 'MEINS', offset: 64, length: 3, type: 'C', dataType: 'UNIT', fieldText: 'Component Unit of Measure' }
      ]
    };

    // PP - CRHD (Work Center Header)
    this.tableCatalog['CRHD'] = {
      tableName: 'CRHD',
      description: 'Work Center Header',
      module: 'PP',
      authGroup: 'CRC',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'OBJTY', offset: 3, length: 2, type: 'C', dataType: 'CHAR', fieldText: 'Object Type', isKey: true },
        { fieldName: 'OBJID', offset: 5, length: 8, type: 'N', dataType: 'NUMC', fieldText: 'Object ID', isKey: true },
        { fieldName: 'ARBPL', offset: 13, length: 8, type: 'C', dataType: 'CHAR', fieldText: 'Work Center Code' },
        { fieldName: 'WERKS', offset: 21, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Plant' },
        { fieldName: 'VERWE', offset: 25, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Work Center Category' },
        { fieldName: 'KTEXT', offset: 29, length: 40, type: 'C', dataType: 'CHAR', fieldText: 'Work Center Description' }
      ]
    };

    // HR - PA0001 (HR Master Record: Infotype 0001 Org Assignment)
    this.tableCatalog['PA0001'] = {
      tableName: 'PA0001',
      description: 'HR Master Record: Infotype 0001 (Organizational Assignment)',
      module: 'HR',
      authGroup: 'PC',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'PERNR', offset: 3, length: 8, type: 'N', dataType: 'NUMC', fieldText: 'Personnel Number', isKey: true },
        { fieldName: 'SUBTY', offset: 11, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Subtype', isKey: true },
        { fieldName: 'OBJPS', offset: 15, length: 2, type: 'C', dataType: 'CHAR', fieldText: 'Object ID', isKey: true },
        { fieldName: 'SPRPS', offset: 17, length: 1, type: 'C', dataType: 'CHAR', fieldText: 'Lock Indicator', isKey: true },
        { fieldName: 'ENDDA', offset: 18, length: 8, type: 'D', dataType: 'DATS', fieldText: 'End Date', isKey: true },
        { fieldName: 'BEGDA', offset: 26, length: 8, type: 'D', dataType: 'DATS', fieldText: 'Start Date', isKey: true },
        { fieldName: 'SEQNR', offset: 34, length: 3, type: 'N', dataType: 'NUMC', fieldText: 'Sequence Number', isKey: true },
        { fieldName: 'BUKRS', offset: 37, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Company Code' },
        { fieldName: 'WERKS', offset: 41, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Personnel Area' },
        { fieldName: 'BTRTL', offset: 45, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Personnel Subarea' },
        { fieldName: 'PERSG', offset: 49, length: 1, type: 'C', dataType: 'CHAR', fieldText: 'Employee Group (1=Perm, 2=Contractor)' },
        { fieldName: 'PERSK', offset: 50, length: 2, type: 'C', dataType: 'CHAR', fieldText: 'Employee Subgroup' },
        { fieldName: 'PLANS', offset: 52, length: 8, type: 'N', dataType: 'NUMC', fieldText: 'Position (S)' },
        { fieldName: 'GSBER', offset: 60, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Business Area' },
        { fieldName: 'STELL', offset: 64, length: 8, type: 'N', dataType: 'NUMC', fieldText: 'Job (C)' },
        { fieldName: 'ORGEH', offset: 72, length: 8, type: 'N', dataType: 'NUMC', fieldText: 'Organizational Unit (O)' },
        { fieldName: 'KOSTL', offset: 80, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Cost Center' },
        { fieldName: 'ENAME', offset: 90, length: 40, type: 'C', dataType: 'CHAR', fieldText: 'Formatted Employee Name' }
      ]
    };

    // HR - HRP1000 (Infotype 1000: Org Management Objects)
    this.tableCatalog['HRP1000'] = {
      tableName: 'HRP1000',
      description: 'Infotype 1000: Organizational Management Objects (O/S/C)',
      module: 'HR',
      authGroup: 'PL',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'PLVAR', offset: 3, length: 2, type: 'C', dataType: 'CHAR', fieldText: 'Plan Version (01=Current)', isKey: true },
        { fieldName: 'OTYPE', offset: 5, length: 2, type: 'C', dataType: 'CHAR', fieldText: 'Object Type (O=OrgUnit, S=Position, C=Job)', isKey: true },
        { fieldName: 'OBJID', offset: 7, length: 8, type: 'N', dataType: 'NUMC', fieldText: 'Object ID', isKey: true },
        { fieldName: 'BEGDA', offset: 15, length: 8, type: 'D', dataType: 'DATS', fieldText: 'Start Date', isKey: true },
        { fieldName: 'ENDDA', offset: 23, length: 8, type: 'D', dataType: 'DATS', fieldText: 'End Date', isKey: true },
        { fieldName: 'SHORT', offset: 31, length: 12, type: 'C', dataType: 'CHAR', fieldText: 'Object Abbreviation' },
        { fieldName: 'STEXT', offset: 43, length: 40, type: 'C', dataType: 'CHAR', fieldText: 'Object Full Description' },
        { fieldName: 'MC_STEXT', offset: 83, length: 40, type: 'C', dataType: 'CHAR', fieldText: 'Search Term (Upper)' }
      ]
    };

    // HR - HRP1001 (Infotype 1001: Org Relationships)
    this.tableCatalog['HRP1001'] = {
      tableName: 'HRP1001',
      description: 'Infotype 1001: Org Management Relationships & Hierarchy',
      module: 'HR',
      authGroup: 'PL',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'PLVAR', offset: 3, length: 2, type: 'C', dataType: 'CHAR', fieldText: 'Plan Version', isKey: true },
        { fieldName: 'OTYPE', offset: 5, length: 2, type: 'C', dataType: 'CHAR', fieldText: 'Object Type', isKey: true },
        { fieldName: 'OBJID', offset: 7, length: 8, type: 'N', dataType: 'NUMC', fieldText: 'Object ID', isKey: true },
        { fieldName: 'SUBTY', offset: 15, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Subtype (Relationship)', isKey: true },
        { fieldName: 'RSIGN', offset: 19, length: 1, type: 'C', dataType: 'CHAR', fieldText: 'Relationship Direction (A/B)', isKey: true },
        { fieldName: 'RELAT', offset: 20, length: 3, type: 'C', dataType: 'CHAR', fieldText: 'Relationship Type (002=Reports, 003=Belongs, 008=Holder)', isKey: true },
        { fieldName: 'SCLAS', offset: 23, length: 2, type: 'C', dataType: 'CHAR', fieldText: 'Related Object Type (O/S/P/C)', isKey: true },
        { fieldName: 'SOBID', offset: 25, length: 45, type: 'C', dataType: 'CHAR', fieldText: 'Related Object ID', isKey: true },
        { fieldName: 'BEGDA', offset: 70, length: 8, type: 'D', dataType: 'DATS', fieldText: 'Start Date', isKey: true },
        { fieldName: 'ENDDA', offset: 78, length: 8, type: 'D', dataType: 'DATS', fieldText: 'End Date', isKey: true }
      ]
    };

    // HR - PA0006 (Infotype 0006: Addresses - Masked)
    this.tableCatalog['PA0006'] = {
      tableName: 'PA0006',
      description: 'HR Master Record: Infotype 0006 (Addresses - Privacy Protected)',
      module: 'HR',
      authGroup: 'PC',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'PERNR', offset: 3, length: 8, type: 'N', dataType: 'NUMC', fieldText: 'Personnel Number', isKey: true },
        { fieldName: 'SUBTY', offset: 11, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Address Type (1=Permanent, 2=Emergency)', isKey: true },
        { fieldName: 'BEGDA', offset: 15, length: 8, type: 'D', dataType: 'DATS', fieldText: 'Start Date', isKey: true },
        { fieldName: 'ENDDA', offset: 23, length: 8, type: 'D', dataType: 'DATS', fieldText: 'End Date', isKey: true },
        { fieldName: 'STRAS', offset: 31, length: 30, type: 'C', dataType: 'CHAR', fieldText: 'Street & House Number (Masked)' },
        { fieldName: 'ORT01', offset: 61, length: 25, type: 'C', dataType: 'CHAR', fieldText: 'City' },
        { fieldName: 'PSTLZ', offset: 86, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Postal Code' },
        { fieldName: 'LAND1', offset: 96, length: 3, type: 'C', dataType: 'CHAR', fieldText: 'Country' },
        { fieldName: 'TELNR', offset: 99, length: 14, type: 'C', dataType: 'CHAR', fieldText: 'Telephone Number (Masked)' }
      ]
    };

    // HR - T500P (Personnel Areas)
    this.tableCatalog['T500P'] = {
      tableName: 'T500P',
      description: 'Personnel Areas Table',
      module: 'HR',
      authGroup: 'PC',
      deliveryClass: 'C',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'PERSA', offset: 3, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Personnel Area', isKey: true },
        { fieldName: 'NAME1', offset: 7, length: 30, type: 'C', dataType: 'CHAR', fieldText: 'Personnel Area Description' },
        { fieldName: 'BUKRS', offset: 37, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Company Code' },
        { fieldName: 'MOLGA', offset: 41, length: 2, type: 'C', dataType: 'CHAR', fieldText: 'Country Grouping (01=DE, 10=US, 08=GB)' }
      ]
    };

    // HR - T528T (Position Names)
    this.tableCatalog['T528T'] = {
      tableName: 'T528T',
      description: 'Position Texts',
      module: 'HR',
      authGroup: 'PL',
      deliveryClass: 'C',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'SPRAS', offset: 3, length: 1, type: 'C', dataType: 'LANG', fieldText: 'Language', isKey: true },
        { fieldName: 'PLANS', offset: 4, length: 8, type: 'N', dataType: 'NUMC', fieldText: 'Position ID', isKey: true },
        { fieldName: 'ENDDA', offset: 12, length: 8, type: 'D', dataType: 'DATS', fieldText: 'End Date', isKey: true },
        { fieldName: 'PLSTX', offset: 20, length: 40, type: 'C', dataType: 'CHAR', fieldText: 'Position Long Text' }
      ]
    };

    // HR - HR_AUDIT_LOG (Immutable HR Access Audit Trail)
    this.tableCatalog['HR_AUDIT_LOG'] = {
      tableName: 'HR_AUDIT_LOG',
      description: 'SAP HR/HCM Privacy Audit Log & Access Trail',
      module: 'HR',
      authGroup: '&NC&',
      deliveryClass: 'L',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'LOG_ID', offset: 3, length: 16, type: 'C', dataType: 'CHAR', fieldText: 'Audit Event UUID', isKey: true },
        { fieldName: 'TIMESTAMP', offset: 19, length: 19, type: 'C', dataType: 'CHAR', fieldText: 'Access Timestamp' },
        { fieldName: 'USER_ID', offset: 38, length: 12, type: 'C', dataType: 'CHAR', fieldText: 'Requesting User / AI Agent' },
        { fieldName: 'INTENT_TYPE', offset: 50, length: 30, type: 'C', dataType: 'CHAR', fieldText: 'HR Operation / Inquiry' },
        { fieldName: 'PERNR_TARGET', offset: 80, length: 8, type: 'C', dataType: 'CHAR', fieldText: 'Accessed PERNR' },
        { fieldName: 'INFOTYPE', offset: 88, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Accessed Infotype' },
        { fieldName: 'PFCG_AUTH_CHECK', offset: 92, length: 20, type: 'C', dataType: 'CHAR', fieldText: 'PFCG Object Evaluated' },
        { fieldName: 'AUTH_RESULT', offset: 112, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Authorization Result (RC=0)' },
        { fieldName: 'MASKED_FIELDS_COUNT', offset: 122, length: 4, type: 'N', dataType: 'NUMC', fieldText: 'Masked Sensitive Fields Count' },
        { fieldName: 'JUSTIFICATION', offset: 126, length: 60, type: 'C', dataType: 'CHAR', fieldText: 'Business Justification' }
      ]
    };

    // ------------------------------------------------------------------------
    // CUSTOM Z & Y TABLES CATALOG (DD02L / TADIR APPROVED)
    // ------------------------------------------------------------------------

    // TM - ZTM_FREIGHT_LOG (Custom Freight Interface Message & Exception Log)
    this.tableCatalog['ZTM_FREIGHT_LOG'] = {
      tableName: 'ZTM_FREIGHT_LOG',
      description: 'Custom Live Freight Interface Message & Processing Error Audit Log',
      module: 'TM',
      authGroup: '&NC&',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'MSG_ID', offset: 3, length: 24, type: 'C', dataType: 'CHAR', fieldText: 'Message GUID', isKey: true },
        { fieldName: 'CARRIER_ID', offset: 27, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Carrier Vendor Account', checkTable: 'LFA1' },
        { fieldName: 'DELIVERY_NO', offset: 37, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Outbound Delivery Number', checkTable: 'LIKP' },
        { fieldName: 'BOL_NUMBER', offset: 47, length: 20, type: 'C', dataType: 'CHAR', fieldText: 'Bill of Lading Number' },
        { fieldName: 'SHIPMENT_NO', offset: 67, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Shipment Document Number', checkTable: 'VTTK' },
        { fieldName: 'STATUS', offset: 77, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Transmission Status (SUCCESS/FAILED/REJECTED)' },
        { fieldName: 'ERR_CODE', offset: 87, length: 20, type: 'C', dataType: 'CHAR', fieldText: 'Interface Error Diagnostic Code' },
        { fieldName: 'ERR_TEXT', offset: 107, length: 120, type: 'C', dataType: 'CHAR', fieldText: 'Carrier Gateway Error Message' },
        { fieldName: 'PAYLOAD_REF', offset: 227, length: 32, type: 'C', dataType: 'CHAR', fieldText: 'Payload Staging Pointer' },
        { fieldName: 'LOG_DATE', offset: 259, length: 8, type: 'D', dataType: 'DATS', fieldText: 'Processing Date' },
        { fieldName: 'LOG_TIME', offset: 267, length: 6, type: 'T', dataType: 'TIMS', fieldText: 'Processing Time' },
        { fieldName: 'CREATED_BY', offset: 273, length: 12, type: 'C', dataType: 'CHAR', fieldText: 'Triggering Job / User' },
        { fieldName: 'RETRY_COUNT', offset: 285, length: 4, type: 'N', dataType: 'NUMC', fieldText: 'Retries Executed' }
      ]
    };

    // TM - ZFREIGHT_ERRORS (Freight Exception Staging Buffer)
    this.tableCatalog['ZFREIGHT_ERRORS'] = {
      tableName: 'ZFREIGHT_ERRORS',
      description: 'Freight Carrier Exception Staging Table for Unresolved Failures',
      module: 'TM',
      authGroup: '&NC&',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'MSG_ID', offset: 3, length: 24, type: 'C', dataType: 'CHAR', fieldText: 'Message GUID', isKey: true },
        { fieldName: 'ERR_TYPE', offset: 27, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Error Category' },
        { fieldName: 'RESOLVED_FLAG', offset: 37, length: 1, type: 'C', dataType: 'CHAR', fieldText: 'Resolved Indicator (X/Space)' },
        { fieldName: 'RESOLVED_BY', offset: 38, length: 12, type: 'C', dataType: 'CHAR', fieldText: 'Resolved User / RFC' }
      ]
    };

    // TM - ZTM_CARRIER_CFG (Carrier Endpoint Configuration)
    this.tableCatalog['ZTM_CARRIER_CFG'] = {
      tableName: 'ZTM_CARRIER_CFG',
      description: 'Custom Carrier Integration Configuration & SLA Thresholds',
      module: 'TM',
      authGroup: '&NC&',
      deliveryClass: 'C',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'CARRIER_ID', offset: 3, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Carrier ID', isKey: true },
        { fieldName: 'API_ENDPOINT', offset: 13, length: 80, type: 'C', dataType: 'CHAR', fieldText: 'REST / EDI API Endpoint' },
        { fieldName: 'PROTOCOL', offset: 93, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Protocol (REST/AS2/SFTP)' },
        { fieldName: 'ACTIVE_FLAG', offset: 103, length: 1, type: 'C', dataType: 'CHAR', fieldText: 'Active Status' }
      ]
    };

    // PM - ZPM_MAINT_CHECK (PM Maintenance Checklist)
    this.tableCatalog['ZPM_MAINT_CHECK'] = {
      tableName: 'ZPM_MAINT_CHECK',
      description: 'Custom PM Maintenance Order Safety & SLA Checklist Table',
      module: 'PM',
      authGroup: '&NC&',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'AUFNR', offset: 3, length: 12, type: 'C', dataType: 'CHAR', fieldText: 'Order Number', isKey: true },
        { fieldName: 'SAFETY_PASSED', offset: 15, length: 1, type: 'C', dataType: 'CHAR', fieldText: 'Safety Inspection Sign-off' },
        { fieldName: 'SLA_HOURS', offset: 16, length: 4, type: 'N', dataType: 'NUMC', fieldText: 'SLA Duration Hours' }
      ]
    };

    // SD - ZSD_CREDIT_LOG (Real-Time Credit Score Log)
    this.tableCatalog['ZSD_CREDIT_LOG'] = {
      tableName: 'ZSD_CREDIT_LOG',
      description: 'Custom Real-Time Credit Score & Risk Evaluation Log Table',
      module: 'SD',
      authGroup: '&NC&',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'VBELN', offset: 3, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Sales Order Number', isKey: true },
        { fieldName: 'KUNNR', offset: 13, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Customer Account' },
        { fieldName: 'RISK_SCORE', offset: 23, length: 3, type: 'N', dataType: 'NUMC', fieldText: 'Evaluated Risk Score (0-100)' },
        { fieldName: 'APPROVAL_STATUS', offset: 26, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Credit Status' }
      ]
    };

    // BASIS / ALE - EDIDC (Control Record for IDoc)
    this.tableCatalog['EDIDC'] = {
      tableName: 'EDIDC',
      description: 'Control Record (IDoc Header Data, Status & Routing)',
      module: 'BASIS',
      authGroup: 'EDI',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'DOCNUM', offset: 3, length: 16, type: 'N', dataType: 'NUMC', fieldText: 'IDoc Number', isKey: true },
        { fieldName: 'STATUS', offset: 19, length: 2, type: 'C', dataType: 'CHAR', fieldText: 'Current Status of IDoc' },
        { fieldName: 'DOCTYP', offset: 21, length: 30, type: 'C', dataType: 'CHAR', fieldText: 'IDoc Type (Basic Type)' },
        { fieldName: 'DIRECT', offset: 51, length: 1, type: 'C', dataType: 'CHAR', fieldText: 'Direction (1=Outbound, 2=Inbound)' },
        { fieldName: 'RCVPRT', offset: 52, length: 2, type: 'C', dataType: 'CHAR', fieldText: 'Partner Type of Receiver (LS/KU/LI)' },
        { fieldName: 'RCVPRN', offset: 54, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Partner Number of Receiver' },
        { fieldName: 'RCVPOR', offset: 64, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Receiver Port' },
        { fieldName: 'SNDPRT', offset: 74, length: 2, type: 'C', dataType: 'CHAR', fieldText: 'Partner Type of Sender' },
        { fieldName: 'SNDPRN', offset: 76, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Partner Number of Sender' },
        { fieldName: 'SNDPOR', offset: 86, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Sender Port' },
        { fieldName: 'MESTYP', offset: 96, length: 30, type: 'C', dataType: 'CHAR', fieldText: 'Logical Message Type' },
        { fieldName: 'IDOCTYP', offset: 126, length: 30, type: 'C', dataType: 'CHAR', fieldText: 'Basic IDoc Type' },
        { fieldName: 'CIMTYP', offset: 156, length: 30, type: 'C', dataType: 'CHAR', fieldText: 'IDoc Extension Type' },
        { fieldName: 'CREDAT', offset: 186, length: 8, type: 'D', dataType: 'DATS', fieldText: 'Created Date' },
        { fieldName: 'CRETIM', offset: 194, length: 6, type: 'T', dataType: 'TIMS', fieldText: 'Created Time' },
        { fieldName: 'SERIAL', offset: 200, length: 20, type: 'C', dataType: 'CHAR', fieldText: 'Serialization String' },
        { fieldName: 'EXPRSS', offset: 220, length: 1, type: 'C', dataType: 'CHAR', fieldText: 'Express Processing Flag' }
      ]
    };

    // BASIS / ALE - EDIDS (Status Record for IDoc)
    this.tableCatalog['EDIDS'] = {
      tableName: 'EDIDS',
      description: 'Status Record (IDoc Processing Status History & T100 Messages)',
      module: 'BASIS',
      authGroup: 'EDI',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'DOCNUM', offset: 3, length: 16, type: 'N', dataType: 'NUMC', fieldText: 'IDoc Number', isKey: true },
        { fieldName: 'LOGDAT', offset: 19, length: 8, type: 'D', dataType: 'DATS', fieldText: 'Date of Status Record', isKey: true },
        { fieldName: 'LOGTIM', offset: 27, length: 6, type: 'T', dataType: 'TIMS', fieldText: 'Time of Status Record', isKey: true },
        { fieldName: 'COUNTR', offset: 33, length: 4, type: 'N', dataType: 'NUMC', fieldText: 'Status Counter', isKey: true },
        { fieldName: 'STATUS', offset: 37, length: 2, type: 'C', dataType: 'CHAR', fieldText: 'Status Code (e.g. 51, 53, 03, 02)' },
        { fieldName: 'STAMOD', offset: 39, length: 1, type: 'C', dataType: 'CHAR', fieldText: 'Status Mode' },
        { fieldName: 'STAMAC', offset: 40, length: 20, type: 'C', dataType: 'CHAR', fieldText: 'Message Class (ARBGB)' },
        { fieldName: 'STAMNO', offset: 60, length: 3, type: 'C', dataType: 'CHAR', fieldText: 'Message Number (MSGNR)' },
        { fieldName: 'STATXT', offset: 63, length: 128, type: 'C', dataType: 'CHAR', fieldText: 'Status Text / T100 Error Diagnostic' },
        { fieldName: 'STAPA1', offset: 191, length: 50, type: 'C', dataType: 'CHAR', fieldText: 'Parameter 1' },
        { fieldName: 'STAPA2', offset: 241, length: 50, type: 'C', dataType: 'CHAR', fieldText: 'Parameter 2' },
        { fieldName: 'STAPA3', offset: 291, length: 50, type: 'C', dataType: 'CHAR', fieldText: 'Parameter 3' },
        { fieldName: 'STAPA4', offset: 341, length: 50, type: 'C', dataType: 'CHAR', fieldText: 'Parameter 4' },
        { fieldName: 'UNAME', offset: 391, length: 12, type: 'C', dataType: 'CHAR', fieldText: 'User Name' },
        { fieldName: 'REPID', offset: 403, length: 30, type: 'C', dataType: 'CHAR', fieldText: 'Processing Program / Function' }
      ]
    };

    // BASIS / ALE - EDID4 (Data Record for IDoc)
    this.tableCatalog['EDID4'] = {
      tableName: 'EDID4',
      description: 'Data Record (IDoc Segment Payload & Field Values)',
      module: 'BASIS',
      authGroup: 'EDI',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'DOCNUM', offset: 3, length: 16, type: 'N', dataType: 'NUMC', fieldText: 'IDoc Number', isKey: true },
        { fieldName: 'SEGNUM', offset: 19, length: 6, type: 'N', dataType: 'NUMC', fieldText: 'Segment Number in IDoc', isKey: true },
        { fieldName: 'SEGNAM', offset: 25, length: 30, type: 'C', dataType: 'CHAR', fieldText: 'Segment Name (e.g. E1EDK01, E1EDP01)' },
        { fieldName: 'PSGNUM', offset: 55, length: 6, type: 'N', dataType: 'NUMC', fieldText: 'Parent Segment Number' },
        { fieldName: 'HLEVEL', offset: 61, length: 2, type: 'N', dataType: 'NUMC', fieldText: 'Hierarchy Level' },
        { fieldName: 'SDATA', offset: 63, length: 1000, type: 'C', dataType: 'CHAR', fieldText: 'Segment Data Stream (Raw Payload)' },
        { fieldName: 'DTYP', offset: 1063, length: 30, type: 'C', dataType: 'CHAR', fieldText: 'Segment Definition Type' }
      ]
    };

    // BASIS - TBTCO (Job Status Overview Table)
    this.tableCatalog['TBTCO'] = {
      tableName: 'TBTCO',
      description: 'Job Status Overview Table (Background Batch Jobs SM37)',
      module: 'BASIS',
      authGroup: 'BTCH',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'JOBNAME', offset: 3, length: 32, type: 'C', dataType: 'CHAR', fieldText: 'Background Job Name', isKey: true },
        { fieldName: 'JOBCOUNT', offset: 35, length: 8, type: 'C', dataType: 'CHAR', fieldText: 'Job Count Key Number', isKey: true },
        { fieldName: 'STATUS', offset: 43, length: 1, type: 'C', dataType: 'CHAR', fieldText: 'Status (F=Fin, A=Abort, R=Run, P=Sched, S=Rel)' },
        { fieldName: 'SDLSTRTDTE', offset: 44, length: 8, type: 'D', dataType: 'DATS', fieldText: 'Scheduled Start Date' },
        { fieldName: 'SDLSTRTTM', offset: 52, length: 6, type: 'T', dataType: 'TIMS', fieldText: 'Scheduled Start Time' },
        { fieldName: 'STRTDTE', offset: 58, length: 8, type: 'D', dataType: 'DATS', fieldText: 'Actual Start Date' },
        { fieldName: 'STRTTM', offset: 66, length: 6, type: 'T', dataType: 'TIMS', fieldText: 'Actual Start Time' },
        { fieldName: 'ENDDTE', offset: 72, length: 8, type: 'D', dataType: 'DATS', fieldText: 'End Date' },
        { fieldName: 'ENDTM', offset: 80, length: 6, type: 'T', dataType: 'TIMS', fieldText: 'End Time' },
        { fieldName: 'AUTHCKNAM', offset: 86, length: 12, type: 'C', dataType: 'CHAR', fieldText: 'Executing User Name' },
        { fieldName: 'PROGNAME', offset: 98, length: 40, type: 'C', dataType: 'CHAR', fieldText: 'Initial ABAP Step Program' }
      ]
    };

    // BASIS - TBTCP (Batch Job Step Overview)
    this.tableCatalog['TBTCP'] = {
      tableName: 'TBTCP',
      description: 'Batch Job Step Overview (Step program, user, variant)',
      module: 'BASIS',
      authGroup: 'BTCH',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'JOBNAME', offset: 3, length: 32, type: 'C', dataType: 'CHAR', fieldText: 'Job Name', isKey: true },
        { fieldName: 'JOBCOUNT', offset: 35, length: 8, type: 'C', dataType: 'CHAR', fieldText: 'Job Count', isKey: true },
        { fieldName: 'STEPCOUNT', offset: 43, length: 4, type: 'N', dataType: 'NUMC', fieldText: 'Step Number', isKey: true },
        { fieldName: 'PROGNAME', offset: 47, length: 40, type: 'C', dataType: 'CHAR', fieldText: 'ABAP Program Name' },
        { fieldName: 'VARIANT', offset: 87, length: 14, type: 'C', dataType: 'CHAR', fieldText: 'Variant Name' },
        { fieldName: 'AUTHCKNAM', offset: 101, length: 12, type: 'C', dataType: 'CHAR', fieldText: 'User Name' },
        { fieldName: 'STATUS', offset: 113, length: 1, type: 'C', dataType: 'CHAR', fieldText: 'Step Status' }
      ]
    };

    // BASIS - SNAP (ABAP Runtime Short Dumps ST22)
    this.tableCatalog['SNAP'] = {
      tableName: 'SNAP',
      description: 'ABAP Runtime Error & Short Dump Log (ST22)',
      module: 'BASIS',
      authGroup: 'SYST',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'SEQNO', offset: 3, length: 8, type: 'N', dataType: 'NUMC', fieldText: 'Sequence Number', isKey: true },
        { fieldName: 'UNAME', offset: 11, length: 12, type: 'C', dataType: 'CHAR', fieldText: 'User Name' },
        { fieldName: 'DATUM', offset: 23, length: 8, type: 'D', dataType: 'DATS', fieldText: 'Dump Date' },
        { fieldName: 'UZEIT', offset: 31, length: 6, type: 'T', dataType: 'TIMS', fieldText: 'Dump Time' },
        { fieldName: 'AHOST', offset: 37, length: 32, type: 'C', dataType: 'CHAR', fieldText: 'Application Server Host' },
        { fieldName: 'MODNO', offset: 69, length: 4, type: 'N', dataType: 'NUMC', fieldText: 'Work Process Number' },
        { fieldName: 'ERRID', offset: 73, length: 30, type: 'C', dataType: 'CHAR', fieldText: 'Runtime Error Key (e.g. TSV_TNEW)' },
        { fieldName: 'PROG', offset: 103, length: 40, type: 'C', dataType: 'CHAR', fieldText: 'Terminated Program' },
        { fieldName: 'INCL', offset: 143, length: 40, type: 'C', dataType: 'CHAR', fieldText: 'Include Program' },
        { fieldName: 'LINE', offset: 183, length: 6, type: 'N', dataType: 'NUMC', fieldText: 'Source Line Number' },
        { fieldName: 'DETAILS', offset: 189, length: 255, type: 'C', dataType: 'CHAR', fieldText: 'Brief Error Summary' }
      ]
    };

    // BASIS - RFCDES (RFC Destination Metadata SM59)
    this.tableCatalog['RFCDES'] = {
      tableName: 'RFCDES',
      description: 'Destination Table for Remote Function Calls (SM59)',
      module: 'BASIS',
      authGroup: 'RFC',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'RFCDEST', offset: 0, length: 32, type: 'C', dataType: 'CHAR', fieldText: 'RFC Destination Name', isKey: true },
        { fieldName: 'RFCTYPE', offset: 32, length: 1, type: 'C', dataType: 'CHAR', fieldText: 'Connection Type (3=ABAP, T=TCP, H=HTTP, G=Ext)' },
        { fieldName: 'RFCOPTIONS', offset: 33, length: 60, type: 'C', dataType: 'CHAR', fieldText: 'Connection Options' },
        { fieldName: 'RFCHOST', offset: 93, length: 64, type: 'C', dataType: 'CHAR', fieldText: 'Target Host Name / IP' },
        { fieldName: 'RFCSYSID', offset: 157, length: 8, type: 'C', dataType: 'CHAR', fieldText: 'Target System ID' },
        { fieldName: 'RFCCLIENT', offset: 165, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Logon Client' },
        { fieldName: 'RFCUSER', offset: 168, length: 12, type: 'C', dataType: 'CHAR', fieldText: 'Logon User Name' },
        { fieldName: 'RFCLANG', offset: 180, length: 2, type: 'C', dataType: 'CHAR', fieldText: 'Language' },
        { fieldName: 'RFCSNC', offset: 182, length: 1, type: 'C', dataType: 'CHAR', fieldText: 'SNC Enabled (1/0)' },
        { fieldName: 'RFCUNICODE', offset: 183, length: 1, type: 'C', dataType: 'CHAR', fieldText: 'Unicode Enabled (1/0)' }
      ]
    };

    // BASIS - VBHDR (Update Header Table SM13)
    this.tableCatalog['VBHDR'] = {
      tableName: 'VBHDR',
      description: 'Update Header (SM13 V1/V2 Update Requests & Errors)',
      module: 'BASIS',
      authGroup: 'UPDT',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'VDKEY', offset: 3, length: 32, type: 'C', dataType: 'CHAR', fieldText: 'Update Key Identifier', isKey: true },
        { fieldName: 'VBDATE', offset: 35, length: 8, type: 'D', dataType: 'DATS', fieldText: 'Update Date' },
        { fieldName: 'VBTIME', offset: 43, length: 6, type: 'T', dataType: 'TIMS', fieldText: 'Update Time' },
        { fieldName: 'VBUSER', offset: 49, length: 12, type: 'C', dataType: 'CHAR', fieldText: 'Initiating User' },
        { fieldName: 'VBTCODE', offset: 61, length: 20, type: 'C', dataType: 'CHAR', fieldText: 'Calling Transaction Code' },
        { fieldName: 'VBMODCNT', offset: 81, length: 4, type: 'N', dataType: 'NUMC', fieldText: 'Number of Modules' },
        { fieldName: 'VBERR', offset: 85, length: 1, type: 'C', dataType: 'CHAR', fieldText: 'Error Status (E=Error, X=Canceled)' },
        { fieldName: 'VBERRCLS', offset: 86, length: 20, type: 'C', dataType: 'CHAR', fieldText: 'Message Class' },
        { fieldName: 'VBERRNUM', offset: 106, length: 3, type: 'C', dataType: 'CHAR', fieldText: 'Message Number' }
      ]
    };

    // BASIS / SECURITY - USR02 (Logon data & user master record - Passwords Masked)
    this.tableCatalog['USR02'] = {
      tableName: 'USR02',
      description: 'Logon data and user master record (BC-SEC-USR)',
      module: 'BASIS',
      authGroup: '&NC&',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'BNAME', offset: 3, length: 12, type: 'C', dataType: 'CHAR', fieldText: 'User Name in the Master Record', isKey: true },
        { fieldName: 'GLTGV', offset: 15, length: 8, type: 'D', dataType: 'DATS', fieldText: 'User valid from' },
        { fieldName: 'GLTGB', offset: 23, length: 8, type: 'D', dataType: 'DATS', fieldText: 'User valid to' },
        { fieldName: 'USTYP', offset: 31, length: 1, type: 'C', dataType: 'CHAR', fieldText: 'User Type (A=Dialog, B=System, C=Comm, S=Service)' },
        { fieldName: 'CLASS', offset: 32, length: 12, type: 'C', dataType: 'CHAR', fieldText: 'User Group in User Master' },
        { fieldName: 'LOCUB', offset: 44, length: 1, type: 'C', dataType: 'CHAR', fieldText: 'Local lock in this client' },
        { fieldName: 'UFLAG', offset: 45, length: 3, type: 'N', dataType: 'NUMC', fieldText: 'User Lock Status (0=Active, 32=Admin Lock, 64=Glob Lock, 128=Pwd Lock)' },
        { fieldName: 'ACCNT', offset: 48, length: 12, type: 'C', dataType: 'CHAR', fieldText: 'Account number' },
        { fieldName: 'ANAME', offset: 60, length: 12, type: 'C', dataType: 'CHAR', fieldText: 'Name of person who created the user' },
        { fieldName: 'ERDAT', offset: 72, length: 8, type: 'D', dataType: 'DATS', fieldText: 'Creation date of user master record' },
        { fieldName: 'TRDAT', offset: 80, length: 8, type: 'D', dataType: 'DATS', fieldText: 'Last logon date' },
        { fieldName: 'LTIME', offset: 88, length: 6, type: 'T', dataType: 'TIMS', fieldText: 'Last logon time' },
        { fieldName: 'BAPWD', offset: 94, length: 8, type: 'C', dataType: 'CHAR', fieldText: 'Password Hash (Masked Protected)' },
        { fieldName: 'TZONE', offset: 102, length: 6, type: 'C', dataType: 'CHAR', fieldText: 'Time Zone' }
      ],
      defaultSortField: 'BNAME'
    };

    // BASIS / SECURITY - AGR_USERS (Assignment of roles to users)
    this.tableCatalog['AGR_USERS'] = {
      tableName: 'AGR_USERS',
      description: 'Assignment of roles to users (BC-SEC-AUT)',
      module: 'BASIS',
      authGroup: '&NC&',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'AGR_NAME', offset: 3, length: 30, type: 'C', dataType: 'CHAR', fieldText: 'Role Name', isKey: true },
        { fieldName: 'UNAME', offset: 33, length: 12, type: 'C', dataType: 'CHAR', fieldText: 'User Name', isKey: true },
        { fieldName: 'FROM_DAT', offset: 45, length: 8, type: 'D', dataType: 'DATS', fieldText: 'Date of validity start', isKey: true },
        { fieldName: 'TO_DAT', offset: 53, length: 8, type: 'D', dataType: 'DATS', fieldText: 'Date of validity end' },
        { fieldName: 'EXCLUDE', offset: 61, length: 1, type: 'C', dataType: 'CHAR', fieldText: 'Indicator: User is excluded' },
        { fieldName: 'CHANGE_DAT', offset: 62, length: 8, type: 'D', dataType: 'DATS', fieldText: 'Date of Last Change' },
        { fieldName: 'CHANGE_TIM', offset: 70, length: 6, type: 'T', dataType: 'TIMS', fieldText: 'Time of Last Change' },
        { fieldName: 'CHANGE_NAM', offset: 76, length: 12, type: 'C', dataType: 'CHAR', fieldText: 'Changed by user' }
      ],
      defaultSortField: 'UNAME'
    };

    // BASIS / SECURITY - AGR_1251 (Authorization data for profile)
    this.tableCatalog['AGR_1251'] = {
      tableName: 'AGR_1251',
      description: 'Authorization data for profile (BC-SEC-AUT)',
      module: 'BASIS',
      authGroup: '&NC&',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'AGR_NAME', offset: 3, length: 30, type: 'C', dataType: 'CHAR', fieldText: 'Role Name', isKey: true },
        { fieldName: 'OBJECT', offset: 33, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Authorization Object', isKey: true },
        { fieldName: 'AUTH', offset: 43, length: 12, type: 'C', dataType: 'CHAR', fieldText: 'Authorization Name', isKey: true },
        { fieldName: 'VARIANT', offset: 55, length: 4, type: 'N', dataType: 'NUMC', fieldText: 'Variant' },
        { fieldName: 'FIELD', offset: 59, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Authorization Field Name', isKey: true },
        { fieldName: 'LOW', offset: 69, length: 45, type: 'C', dataType: 'CHAR', fieldText: 'Authorization value (From)' },
        { fieldName: 'HIGH', offset: 114, length: 45, type: 'C', dataType: 'CHAR', fieldText: 'Authorization value (To)' }
      ]
    };

    // BASIS / SECURITY - UST04 (User profiles)
    this.tableCatalog['UST04'] = {
      tableName: 'UST04',
      description: 'User master record: Profiles',
      module: 'BASIS',
      authGroup: '&NC&',
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'BNAME', offset: 3, length: 12, type: 'C', dataType: 'CHAR', fieldText: 'User Name', isKey: true },
        { fieldName: 'PROFILE', offset: 15, length: 12, type: 'C', dataType: 'CHAR', fieldText: 'Profile name', isKey: true }
      ]
    };
  }

  private initializeDefaultData() {
    // 1. MARD (Storage Location Material Stocks)
    this.tableDataStore['MARD'] = [
      { MANDT: '800', MATNR: 'DVK-100', WERKS: '1000', LGORT: '0001', LABST: 120.000, UMLME: 0.000, INSME: 15.000, SPEME: 0.000, EINME: 0.000, RETME: 0.000, LMINB: 20.000 },
      { MANDT: '800', MATNR: 'DVK-100', WERKS: '1000', LGORT: '0002', LABST: 45.000, UMLME: 10.000, INSME: 0.000, SPEME: 0.000, EINME: 0.000, RETME: 0.000, LMINB: 10.000 },
      { MANDT: '800', MATNR: 'DVK-100', WERKS: '1200', LGORT: '0001', LABST: 80.000, UMLME: 0.000, INSME: 0.000, SPEME: 5.000, EINME: 0.000, RETME: 0.000, LMINB: 15.000 },
      { MANDT: '800', MATNR: 'DVK-100', WERKS: '2000', LGORT: '0001', LABST: 250.000, UMLME: 20.000, INSME: 25.000, SPEME: 0.000, EINME: 0.000, RETME: 0.000, LMINB: 50.000 },
      { MANDT: '800', MATNR: 'SRV-INSTALL', WERKS: '1000', LGORT: '0001', LABST: 0.000, UMLME: 0.000, INSME: 0.000, SPEME: 0.000, EINME: 0.000, RETME: 0.000, LMINB: 0.000 },
      { MANDT: '800', MATNR: 'PUMP-INDUSTRIAL-01', WERKS: '1000', LGORT: '0001', LABST: 18.000, UMLME: 2.000, INSME: 2.000, SPEME: 0.000, EINME: 0.000, RETME: 0.000, LMINB: 5.000 },
      { MANDT: '800', MATNR: 'RAW-STEEL-PLATE', WERKS: '1000', LGORT: '0001', LABST: 4500.000, UMLME: 500.000, INSME: 200.000, SPEME: 0.000, EINME: 0.000, RETME: 0.000, LMINB: 1000.000 },
      { MANDT: '800', MATNR: 'M-13', WERKS: '1000', LGORT: '0001', LABST: 350.000, UMLME: 0.000, INSME: 0.000, SPEME: 0.000, EINME: 0.000, RETME: 0.000, LMINB: 50.000 }
    ];

    // 2. MARC (Plant Data for Material)
    this.tableDataStore['MARC'] = [
      { MANDT: '800', MATNR: 'DVK-100', WERKS: '1000', EKGRP: '001', DISPO: '001', PLIFZ: 3, EISBE: 30.000, MINBE: 25.000, BSTMI: 10.000, BSTMA: 500.000 },
      { MANDT: '800', MATNR: 'DVK-100', WERKS: '1200', EKGRP: '001', DISPO: '002', PLIFZ: 5, EISBE: 20.000, MINBE: 15.000, BSTMI: 5.000, BSTMA: 200.000 },
      { MANDT: '800', MATNR: 'DVK-100', WERKS: '2000', EKGRP: '002', DISPO: '003', PLIFZ: 7, EISBE: 50.000, MINBE: 40.000, BSTMI: 20.000, BSTMA: 1000.000 },
      { MANDT: '800', MATNR: 'PUMP-INDUSTRIAL-01', WERKS: '1000', EKGRP: '001', DISPO: '001', PLIFZ: 14, EISBE: 5.000, MINBE: 4.000, BSTMI: 1.000, BSTMA: 50.000 }
    ];

    // 3. MBEW (Material Valuation)
    this.tableDataStore['MBEW'] = [
      { MANDT: '800', MATNR: 'DVK-100', BWKEY: '1000', BWTAR: '', LBKUM: 165.000, SALK3: 19800.00, VPRSV: 'S', VERPR: 120.00, STPRS: 120.00, PEINH: 1, BKLAS: '7920' },
      { MANDT: '800', MATNR: 'DVK-100', BWKEY: '1200', BWTAR: '', LBKUM: 80.000, SALK3: 9600.00, VPRSV: 'S', VERPR: 120.00, STPRS: 120.00, PEINH: 1, BKLAS: '7920' },
      { MANDT: '800', MATNR: 'DVK-100', BWKEY: '2000', BWTAR: '', LBKUM: 250.000, SALK3: 29500.00, VPRSV: 'V', VERPR: 118.00, STPRS: 120.00, PEINH: 1, BKLAS: '7920' },
      { MANDT: '800', MATNR: 'PUMP-INDUSTRIAL-01', BWKEY: '1000', BWTAR: '', LBKUM: 18.000, SALK3: 57600.00, VPRSV: 'S', VERPR: 3200.00, STPRS: 3200.00, PEINH: 1, BKLAS: '7920' }
    ];

    // 4. MAKT (Material Descriptions)
    this.tableDataStore['MAKT'] = [
      { MANDT: '800', MATNR: 'DVK-100', SPRAS: 'E', MAKTX: 'Industrial Control Valve DVK-100', MAKTG: 'INDUSTRIAL CONTROL VALVE DVK-100' },
      { MANDT: '800', MATNR: 'DVK-100', SPRAS: 'D', MAKTX: 'Industrielles Regelventil DVK-100', MAKTG: 'INDUSTRIELLES REGELVENTIL DVK-100' },
      { MANDT: '800', MATNR: 'SRV-INSTALL', SPRAS: 'E', MAKTX: 'On-Site Technical Commissioning Service', MAKTG: 'ON-SITE TECHNICAL COMMISSIONING SERVICE' },
      { MANDT: '800', MATNR: 'PUMP-INDUSTRIAL-01', SPRAS: 'E', MAKTX: 'High-Pressure Centrifugal Feed Pump', MAKTG: 'HIGH-PRESSURE CENTRIFUGAL FEED PUMP' },
      { MANDT: '800', MATNR: 'RAW-STEEL-PLATE', SPRAS: 'E', MAKTX: 'Structural Steel Plate Grade 316L', MAKTG: 'STRUCTURAL STEEL PLATE GRADE 316L' },
      { MANDT: '800', MATNR: 'M-13', SPRAS: 'E', MAKTX: 'Precision Flow Sensor Transducer', MAKTG: 'PRECISION FLOW SENSOR TRANSDUCER' }
    ];

    // 5. Custom Z Tables
    this.tableDataStore['ZTINSPECTION_CFG'] = [
      { MANDT: '800', WERKS: '1000', MATKL: '001', AUTO_RELEASE: 'X', SAMPLE_PERCENT: 10, CERT_REQUIRED: 'X' },
      { MANDT: '800', WERKS: '1000', MATKL: '002', AUTO_RELEASE: '', SAMPLE_PERCENT: 100, CERT_REQUIRED: 'X' },
      { MANDT: '800', WERKS: '2000', MATKL: '001', AUTO_RELEASE: 'X', SAMPLE_PERCENT: 5, CERT_REQUIRED: '' }
    ];

    // 6. MM - EKKO / EKPO (Purchasing Documents)
    this.tableDataStore['EKKO'] = [
      { MANDT: '800', EBELN: '4500018920', BUKRS: '1000', BSTYP: 'F', BSART: 'NB', LIFNR: '0000100050', EKORG: '1000', EKGRP: '001', WAERS: 'EUR', BEDAT: '2026-08-10' },
      { MANDT: '800', EBELN: '4500018921', BUKRS: '1000', BSTYP: 'F', BSART: 'NB', LIFNR: '0000100055', EKORG: '1000', EKGRP: '001', WAERS: 'EUR', BEDAT: '2026-08-15' }
    ];
    this.tableDataStore['EKPO'] = [
      { MANDT: '800', EBELN: '4500018920', EBELP: '00010', MATNR: 'RAW-STEEL-PLATE', TXZ01: 'Structural Steel Plate Grade 316L', MENGE: 100.000, MEINS: 'KG', NETPR: 45.00, PEINH: 1, WERKS: '1000', LGORT: '0001' },
      { MANDT: '800', EBELN: '4500018921', EBELP: '00010', MATNR: 'DVK-100', TXZ01: 'Industrial Valve DVK-100', MENGE: 50.000, MEINS: 'PC', NETPR: 110.00, PEINH: 1, WERKS: '1000', LGORT: '0001' }
    ];

    // 7. MM - MKPF / MSEG (Material Documents / Goods Movement)
    this.tableDataStore['MKPF'] = [
      { MANDT: '800', MBLNR: '5000098120', MJAHR: '2026', VGART: 'WA', BLDAT: '2026-08-18', BUDAT: '2026-08-18', USNAM: 'AI_AGENT' }
    ];
    this.tableDataStore['MSEG'] = [
      { MANDT: '800', MBLNR: '5000098120', MJAHR: '2026', ZEILE: '0001', BWART: '101', MATNR: 'DVK-100', WERKS: '1000', LGORT: '0001', MENGE: 20.000, MEINS: 'PC' }
    ];

    // 8. FI - BKPF / BSEG (Accounting Documents)
    this.tableDataStore['BKPF'] = [
      { MANDT: '800', BUKRS: '1000', BELNR: '0100092100', GJAHR: '2026', BLART: 'DR', BLDAT: '2026-08-15', BUDAT: '2026-08-15', MONAT: '08', USNAM: 'AI_AGENT', TCODE: 'VF01', BKTXT: 'Customer Billing Invoice', WAERS: 'EUR', BSTAT: '' },
      { MANDT: '800', BUKRS: '1000', BELNR: '0100092101', GJAHR: '2026', BLART: 'KR', BLDAT: '2026-07-28', BUDAT: '2026-07-28', MONAT: '07', USNAM: 'FICO_USER', TCODE: 'FB60', BKTXT: 'Raw Material Supply Steel', WAERS: 'EUR', BSTAT: '' },
      { MANDT: '800', BUKRS: '1000', BELNR: '0100092102', GJAHR: '2026', BLART: 'KR', BLDAT: '2026-06-12', BUDAT: '2026-06-12', MONAT: '06', USNAM: 'FICO_USER', TCODE: 'FB60', BKTXT: 'Heavy Machinery Lease', WAERS: 'EUR', BSTAT: '' },
      { MANDT: '800', BUKRS: '1000', BELNR: '0100092103', GJAHR: '2026', BLART: 'DR', BLDAT: '2026-06-05', BUDAT: '2026-06-05', MONAT: '06', USNAM: 'SD_AGENT', TCODE: 'VF01', BKTXT: 'Pump Unit Delivery BMW', WAERS: 'EUR', BSTAT: '' },
      { MANDT: '800', BUKRS: '1000', BELNR: '0100092104', GJAHR: '2026', BLART: 'SA', BLDAT: '2026-08-01', BUDAT: '2026-08-01', MONAT: '08', USNAM: 'GL_ACCOUNTANT', TCODE: 'FB50', BKTXT: 'Monthly Accrual Depreciation', WAERS: 'EUR', BSTAT: '' },
      { MANDT: '800', BUKRS: '1000', BELNR: '0100092105', GJAHR: '2026', BLART: 'DR', BLDAT: '2026-05-10', BUDAT: '2026-05-10', MONAT: '05', USNAM: 'SD_AGENT', TCODE: 'VF01', BKTXT: 'OEM Automotive Parts Batch', WAERS: 'EUR', BSTAT: '' },
      { MANDT: '800', BUKRS: '1000', BELNR: '0100092106', GJAHR: '2026', BLART: 'KR', BLDAT: '2026-05-20', BUDAT: '2026-05-20', MONAT: '05', USNAM: 'MM_INVOICE', TCODE: 'MIRO', BKTXT: 'Precision Sensor Supply', WAERS: 'EUR', BSTAT: '' }
    ];
    this.tableDataStore['BSEG'] = [
      // 0100092100: Customer Invoice (AR Debit 28,560 / Revenue Credit 24,000 / Tax Credit 4,560)
      { MANDT: '800', BUKRS: '1000', BELNR: '0100092100', GJAHR: '2026', BUZEI: '001', BSCHL: '01', KOART: 'D', SHKZG: 'S', HKONT: '0000140000', KUNNR: '0000001033', LIFNR: '', WRBTR: 28560.00, DMBTR: 28560.00, WAERS: 'EUR', MWSKZ: 'A1', MWSTS: 4560.00, KOSTL: '', PRCTR: 'PC-1100', SGTXT: 'Receivable BMW AG', ZFBDT: '2026-08-15', ZTERM: 'ZB01', AUGDT: '', AUGBL: '' },
      { MANDT: '800', BUKRS: '1000', BELNR: '0100092100', GJAHR: '2026', BUZEI: '002', BSCHL: '50', KOART: 'S', SHKZG: 'H', HKONT: '0000800000', KUNNR: '', LIFNR: '', WRBTR: 24000.00, DMBTR: 24000.00, WAERS: 'EUR', MWSKZ: 'A1', MWSTS: 0.00, KOSTL: '', PRCTR: 'PC-1100', SGTXT: 'Revenue Domestic Sales', ZFBDT: '', ZTERM: '', AUGDT: '', AUGBL: '' },
      { MANDT: '800', BUKRS: '1000', BELNR: '0100092100', GJAHR: '2026', BUZEI: '003', BSCHL: '50', KOART: 'S', SHKZG: 'H', HKONT: '0000175000', KUNNR: '', LIFNR: '', WRBTR: 4560.00, DMBTR: 4560.00, WAERS: 'EUR', MWSKZ: 'A1', MWSTS: 4560.00, KOSTL: '', PRCTR: 'PC-1100', SGTXT: 'Output VAT 19%', ZFBDT: '', ZTERM: '', AUGDT: '', AUGBL: '' },

      // 0100092101: Vendor Invoice (AP Credit 42,840 / Expense Debit 36,000 / Input VAT Debit 6,840)
      { MANDT: '800', BUKRS: '1000', BELNR: '0100092101', GJAHR: '2026', BUZEI: '001', BSCHL: '31', KOART: 'K', SHKZG: 'H', HKONT: '0000160000', KUNNR: '', LIFNR: '0000100050', WRBTR: 42840.00, DMBTR: 42840.00, WAERS: 'EUR', MWSKZ: 'V1', MWSTS: 6840.00, KOSTL: '', PRCTR: 'PC-1200', SGTXT: 'Payable ThyssenKrupp Steel', ZFBDT: '2026-07-28', ZTERM: 'NT30', AUGDT: '', AUGBL: '' },
      { MANDT: '800', BUKRS: '1000', BELNR: '0100092101', GJAHR: '2026', BUZEI: '002', BSCHL: '40', KOART: 'S', SHKZG: 'S', HKONT: '0000400000', KUNNR: '', LIFNR: '', WRBTR: 36000.00, DMBTR: 36000.00, WAERS: 'EUR', MWSKZ: 'V1', MWSTS: 0.00, KOSTL: '4110', PRCTR: 'PC-1200', SGTXT: 'Raw Material Consumption', ZFBDT: '', ZTERM: '', AUGDT: '', AUGBL: '' },
      { MANDT: '800', BUKRS: '1000', BELNR: '0100092101', GJAHR: '2026', BUZEI: '003', BSCHL: '40', KOART: 'S', SHKZG: 'S', HKONT: '0000154000', KUNNR: '', LIFNR: '', WRBTR: 6840.00, DMBTR: 6840.00, WAERS: 'EUR', MWSKZ: 'V1', MWSTS: 6840.00, KOSTL: '', PRCTR: 'PC-1200', SGTXT: 'Input VAT 19%', ZFBDT: '', ZTERM: '', AUGDT: '', AUGBL: '' },

      // 0100092102: Overdue Vendor Invoice (AP Credit 65,450 / Plant Equip Debit 55,000 / Tax Debit 10,450)
      { MANDT: '800', BUKRS: '1000', BELNR: '0100092102', GJAHR: '2026', BUZEI: '001', BSCHL: '31', KOART: 'K', SHKZG: 'H', HKONT: '0000160000', KUNNR: '', LIFNR: '0000100055', WRBTR: 65450.00, DMBTR: 65450.00, WAERS: 'EUR', MWSKZ: 'V1', MWSTS: 10450.00, KOSTL: '', PRCTR: 'PC-1300', SGTXT: 'Payable Siemens Energy', ZFBDT: '2026-06-12', ZTERM: 'NT30', AUGDT: '', AUGBL: '' },
      { MANDT: '800', BUKRS: '1000', BELNR: '0100092102', GJAHR: '2026', BUZEI: '002', BSCHL: '40', KOART: 'S', SHKZG: 'S', HKONT: '0000410000', KUNNR: '', LIFNR: '', WRBTR: 55000.00, DMBTR: 55000.00, WAERS: 'EUR', MWSKZ: 'V1', MWSTS: 0.00, KOSTL: '4200', PRCTR: 'PC-1300', SGTXT: 'Equipment Maintenance Fee', ZFBDT: '', ZTERM: '', AUGDT: '', AUGBL: '' },
      { MANDT: '800', BUKRS: '1000', BELNR: '0100092102', GJAHR: '2026', BUZEI: '003', BSCHL: '40', KOART: 'S', SHKZG: 'S', HKONT: '0000154000', KUNNR: '', LIFNR: '', WRBTR: 10450.00, DMBTR: 10450.00, WAERS: 'EUR', MWSKZ: 'V1', MWSTS: 10450.00, KOSTL: '', PRCTR: 'PC-1300', SGTXT: 'Input VAT 19%', ZFBDT: '', ZTERM: '', AUGDT: '', AUGBL: '' },

      // 0100092103: Overdue Customer Receivable (AR Debit 52,360 / Sales Revenue Credit 44,000 / Tax Credit 8,360)
      { MANDT: '800', BUKRS: '1000', BELNR: '0100092103', GJAHR: '2026', BUZEI: '001', BSCHL: '01', KOART: 'D', SHKZG: 'S', HKONT: '0000140000', KUNNR: '0000001000', LIFNR: '', WRBTR: 52360.00, DMBTR: 52360.00, WAERS: 'EUR', MWSKZ: 'A1', MWSTS: 8360.00, KOSTL: '', PRCTR: 'PC-1100', SGTXT: 'Receivable Daimler AG (Overdue)', ZFBDT: '2026-06-05', ZTERM: 'ZB01', AUGDT: '', AUGBL: '' },
      { MANDT: '800', BUKRS: '1000', BELNR: '0100092103', GJAHR: '2026', BUZEI: '002', BSCHL: '50', KOART: 'S', SHKZG: 'H', HKONT: '0000800000', KUNNR: '', LIFNR: '', WRBTR: 44000.00, DMBTR: 44000.00, WAERS: 'EUR', MWSKZ: 'A1', MWSTS: 0.00, KOSTL: '', PRCTR: 'PC-1100', SGTXT: 'Revenue Heavy Assembly Parts', ZFBDT: '', ZTERM: '', AUGDT: '', AUGBL: '' },
      { MANDT: '800', BUKRS: '1000', BELNR: '0100092103', GJAHR: '2026', BUZEI: '003', BSCHL: '50', KOART: 'S', SHKZG: 'H', HKONT: '0000175000', KUNNR: '', LIFNR: '', WRBTR: 8360.00, DMBTR: 8360.00, WAERS: 'EUR', MWSKZ: 'A1', MWSTS: 8360.00, KOSTL: '', PRCTR: 'PC-1100', SGTXT: 'Output VAT 19%', ZFBDT: '', ZTERM: '', AUGDT: '', AUGBL: '' },

      // 0100092104: G/L General Journal Posting (Depreciation Expense Debit 18,500 / Acc. Dep Credit 18,500)
      { MANDT: '800', BUKRS: '1000', BELNR: '0100092104', GJAHR: '2026', BUZEI: '001', BSCHL: '40', KOART: 'S', SHKZG: 'S', HKONT: '0000480000', KUNNR: '', LIFNR: '', WRBTR: 18500.00, DMBTR: 18500.00, WAERS: 'EUR', MWSKZ: '', MWSTS: 0.00, KOSTL: '4110', PRCTR: 'PC-1200', SGTXT: 'Depreciation Production Machinery', ZFBDT: '', ZTERM: '', AUGDT: '', AUGBL: '' },
      { MANDT: '800', BUKRS: '1000', BELNR: '0100092104', GJAHR: '2026', BUZEI: '002', BSCHL: '50', KOART: 'S', SHKZG: 'H', HKONT: '0000115000', KUNNR: '', LIFNR: '', WRBTR: 18500.00, DMBTR: 18500.00, WAERS: 'EUR', MWSKZ: '', MWSTS: 0.00, KOSTL: '', PRCTR: 'PC-1200', SGTXT: 'Accumulated Depreciation Assets', ZFBDT: '', ZTERM: '', AUGDT: '', AUGBL: '' },

      // 0100092105: Severely Overdue Customer Invoice (AR Debit 89,250 / Revenue Credit 75,000 / Tax Credit 14,250)
      { MANDT: '800', BUKRS: '1000', BELNR: '0100092105', GJAHR: '2026', BUZEI: '001', BSCHL: '01', KOART: 'D', SHKZG: 'S', HKONT: '0000140000', KUNNR: '0000002040', LIFNR: '', WRBTR: 89250.00, DMBTR: 89250.00, WAERS: 'EUR', MWSKZ: 'A1', MWSTS: 14250.00, KOSTL: '', PRCTR: 'PC-1400', SGTXT: 'Receivable Bosch Automotive (Dunning Level 2)', ZFBDT: '2026-05-10', ZTERM: 'ZB02', AUGDT: '', AUGBL: '' },
      { MANDT: '800', BUKRS: '1000', BELNR: '0100092105', GJAHR: '2026', BUZEI: '002', BSCHL: '50', KOART: 'S', SHKZG: 'H', HKONT: '0000800000', KUNNR: '', LIFNR: '', WRBTR: 75000.00, DMBTR: 75000.00, WAERS: 'EUR', MWSKZ: 'A1', MWSTS: 0.00, KOSTL: '', PRCTR: 'PC-1400', SGTXT: 'Revenue Electronics & Controls', ZFBDT: '', ZTERM: '', AUGDT: '', AUGBL: '' },
      { MANDT: '800', BUKRS: '1000', BELNR: '0100092105', GJAHR: '2026', BUZEI: '003', BSCHL: '50', KOART: 'S', SHKZG: 'H', HKONT: '0000175000', KUNNR: '', LIFNR: '', WRBTR: 14250.00, DMBTR: 14250.00, WAERS: 'EUR', MWSKZ: 'A1', MWSTS: 14250.00, KOSTL: '', PRCTR: 'PC-1400', SGTXT: 'Output VAT 19%', ZFBDT: '', ZTERM: '', AUGDT: '', AUGBL: '' },

      // 0100092106: Overdue Vendor Invoice (AP Credit 31,416 / Consumables Debit 26,400 / Tax Debit 5,016)
      { MANDT: '800', BUKRS: '1000', BELNR: '0100092106', GJAHR: '2026', BUZEI: '001', BSCHL: '31', KOART: 'K', SHKZG: 'H', HKONT: '0000160000', KUNNR: '', LIFNR: '0000100060', WRBTR: 31416.00, DMBTR: 31416.00, WAERS: 'EUR', MWSKZ: 'V1', MWSTS: 5016.00, KOSTL: '', PRCTR: 'PC-1300', SGTXT: 'Payable Endress+Hauser Messtechnik', ZFBDT: '2026-05-20', ZTERM: 'NT30', AUGDT: '', AUGBL: '' },
      { MANDT: '800', BUKRS: '1000', BELNR: '0100092106', GJAHR: '2026', BUZEI: '002', BSCHL: '40', KOART: 'S', SHKZG: 'S', HKONT: '0000420000', KUNNR: '', LIFNR: '', WRBTR: 26400.00, DMBTR: 26400.00, WAERS: 'EUR', MWSKZ: 'V1', MWSTS: 0.00, KOSTL: '4300', PRCTR: 'PC-1300', SGTXT: 'Lab Testing & Sensor Calibration', ZFBDT: '', ZTERM: '', AUGDT: '', AUGBL: '' },
      { MANDT: '800', BUKRS: '1000', BELNR: '0100092106', GJAHR: '2026', BUZEI: '003', BSCHL: '40', KOART: 'S', SHKZG: 'S', HKONT: '0000154000', KUNNR: '', LIFNR: '', WRBTR: 5016.00, DMBTR: 5016.00, WAERS: 'EUR', MWSKZ: 'V1', MWSTS: 5016.00, KOSTL: '', PRCTR: 'PC-1300', SGTXT: 'Input VAT 19%', ZFBDT: '', ZTERM: '', AUGDT: '', AUGBL: '' }
    ];

    // Secondary Index for Vendors - Open Items (BSIK)
    this.tableDataStore['BSIK'] = [
      { MANDT: '800', BUKRS: '1000', LIFNR: '0000100050', UMSKS: '', UMSKZ: '', AUGDT: '', AUGBL: '', ZUONR: 'PO-4500018920', GJAHR: '2026', BELNR: '0100092101', BUZEI: '001', BUDAT: '2026-07-28', BLDAT: '2026-07-28', WAERS: 'EUR', WRBTR: 42840.00, DMBTR: 42840.00, SHKZG: 'H', ZFBDT: '2026-07-28', ZTERM: 'NT30', ZBD1T: 14, ZBD2T: 30, ZBD3T: 30, SGTXT: 'Payable ThyssenKrupp Steel' },
      { MANDT: '800', BUKRS: '1000', LIFNR: '0000100055', UMSKS: '', UMSKZ: '', AUGDT: '', AUGBL: '', ZUONR: 'PO-4500018844', GJAHR: '2026', BELNR: '0100092102', BUZEI: '001', BUDAT: '2026-06-12', BLDAT: '2026-06-12', WAERS: 'EUR', WRBTR: 65450.00, DMBTR: 65450.00, SHKZG: 'H', ZFBDT: '2026-06-12', ZTERM: 'NT30', ZBD1T: 10, ZBD2T: 30, ZBD3T: 30, SGTXT: 'Payable Siemens Energy (Overdue)' },
      { MANDT: '800', BUKRS: '1000', LIFNR: '0000100060', UMSKS: '', UMSKZ: '', AUGDT: '', AUGBL: '', ZUONR: 'PO-4500018750', GJAHR: '2026', BELNR: '0100092106', BUZEI: '001', BUDAT: '2026-05-20', BLDAT: '2026-05-20', WAERS: 'EUR', WRBTR: 31416.00, DMBTR: 31416.00, SHKZG: 'H', ZFBDT: '2026-05-20', ZTERM: 'NT30', ZBD1T: 14, ZBD2T: 30, ZBD3T: 30, SGTXT: 'Payable Endress+Hauser (Critical Overdue)' }
    ];

    // Secondary Index for Vendors - Cleared Items (BSAK)
    this.tableDataStore['BSAK'] = [
      { MANDT: '800', BUKRS: '1000', LIFNR: '0000100050', AUGDT: '2026-07-15', AUGBL: '0150004100', GJAHR: '2026', BELNR: '0100088900', BUZEI: '001', WRBTR: 35000.00, WAERS: 'EUR' },
      { MANDT: '800', BUKRS: '1000', LIFNR: '0000100055', AUGDT: '2026-06-20', AUGBL: '0150004122', GJAHR: '2026', BELNR: '0100087400', BUZEI: '001', WRBTR: 28400.00, WAERS: 'EUR' }
    ];

    // Secondary Index for Customers - Open Items (BSID)
    this.tableDataStore['BSID'] = [
      { MANDT: '800', BUKRS: '1000', KUNNR: '0000001033', UMSKS: '', UMSKZ: '', AUGDT: '', AUGBL: '', ZUONR: 'INV-0090038100', GJAHR: '2026', BELNR: '0100092100', BUZEI: '001', BUDAT: '2026-08-15', BLDAT: '2026-08-15', WAERS: 'EUR', WRBTR: 28560.00, DMBTR: 28560.00, SHKZG: 'S', ZFBDT: '2026-08-15', ZTERM: 'ZB01', MANSP: '', MSCHL: '', MADAT: '', MANST: 0, SGTXT: 'Receivable BMW AG - Valve Order' },
      { MANDT: '800', BUKRS: '1000', KUNNR: '0000001000', UMSKS: '', UMSKZ: '', AUGDT: '', AUGBL: '', ZUONR: 'INV-0090037800', GJAHR: '2026', BELNR: '0100092103', BUZEI: '001', BUDAT: '2026-06-05', BLDAT: '2026-06-05', WAERS: 'EUR', WRBTR: 52360.00, DMBTR: 52360.00, SHKZG: 'S', ZFBDT: '2026-06-05', ZTERM: 'ZB01', MANSP: '', MSCHL: '1', MADAT: '2026-08-01', MANST: 1, SGTXT: 'Receivable Daimler AG (Overdue 45 Days)' },
      { MANDT: '800', BUKRS: '1000', KUNNR: '0000002040', UMSKS: '', UMSKZ: '', AUGDT: '', AUGBL: '', ZUONR: 'INV-0090036900', GJAHR: '2026', BELNR: '0100092105', BUZEI: '001', BUDAT: '2026-05-10', BLDAT: '2026-05-10', WAERS: 'EUR', WRBTR: 89250.00, DMBTR: 89250.00, SHKZG: 'S', ZFBDT: '2026-05-10', ZTERM: 'ZB02', MANSP: '', MSCHL: '2', MADAT: '2026-08-10', MANST: 2, SGTXT: 'Receivable Bosch Auto (Severely Overdue 70+ Days)' }
    ];

    // Secondary Index for Customers - Cleared Items (BSAD)
    this.tableDataStore['BSAD'] = [
      { MANDT: '800', BUKRS: '1000', KUNNR: '0000001033', AUGDT: '2026-07-20', AUGBL: '0140003200', GJAHR: '2026', BELNR: '0100089200', BUZEI: '001', WRBTR: 45000.00, WAERS: 'EUR' },
      { MANDT: '800', BUKRS: '1000', KUNNR: '0000001000', AUGDT: '2026-06-18', AUGBL: '0140003150', GJAHR: '2026', BELNR: '0100086500', BUZEI: '001', WRBTR: 62000.00, WAERS: 'EUR' }
    ];

    // CO - COEP (CO Object Line Items by Period)
    this.tableDataStore['COEP'] = [
      { MANDT: '800', KOKRS: '1000', BELNR: '0001000450', BUZEI: '001', PERIO: '008', GJAHR: '2026', KSTAR: '0000400000', OBJNR: 'KS10004110', KOSTL: '4110', AUFNR: '', PRCTR: 'PC-1200', WTG001: 36000.00, WOG001: 36000.00, TWAER: 'EUR', OWAER: 'EUR', USNAM: 'AI_AGENT', BLDAT: '2026-07-28', BUDAT: '2026-07-28', SGTXT: 'Raw Material Consumption Allocation' },
      { MANDT: '800', KOKRS: '1000', BELNR: '0001000451', BUZEI: '001', PERIO: '008', GJAHR: '2026', KSTAR: '0000480000', OBJNR: 'KS10004110', KOSTL: '4110', AUFNR: '', PRCTR: 'PC-1200', WTG001: 18500.00, WOG001: 18500.00, TWAER: 'EUR', OWAER: 'EUR', USNAM: 'GL_ACCOUNTANT', BLDAT: '2026-08-01', BUDAT: '2026-08-01', SGTXT: 'Depreciation Production Machinery' },
      { MANDT: '800', KOKRS: '1000', BELNR: '0001000452', BUZEI: '001', PERIO: '008', GJAHR: '2026', KSTAR: '0000410000', OBJNR: 'KS10004200', KOSTL: '4200', AUFNR: '', PRCTR: 'PC-1300', WTG001: 55000.00, WOG001: 55000.00, TWAER: 'EUR', OWAER: 'EUR', USNAM: 'FICO_USER', BLDAT: '2026-06-12', BUDAT: '2026-06-12', SGTXT: 'Plant Maintenance Service Contracts' },
      { MANDT: '800', KOKRS: '1000', BELNR: '0001000453', BUZEI: '001', PERIO: '008', GJAHR: '2026', KSTAR: '0000420000', OBJNR: 'KS10004300', KOSTL: '4300', AUFNR: '', PRCTR: 'PC-1300', WTG001: 26400.00, WOG001: 26400.00, TWAER: 'EUR', OWAER: 'EUR', USNAM: 'FICO_USER', BLDAT: '2026-05-20', BUDAT: '2026-05-20', SGTXT: 'Lab Testing & Sensor Calibration' },
      { MANDT: '800', KOKRS: '1000', BELNR: '0001000454', BUZEI: '001', PERIO: '008', GJAHR: '2026', KSTAR: '0000430000', OBJNR: 'KS10001100', KOSTL: '1100', AUFNR: '', PRCTR: 'PC-1100', WTG001: 42000.00, WOG001: 42000.00, TWAER: 'EUR', OWAER: 'EUR', USNAM: 'SYS_ADMIN', BLDAT: '2026-08-01', BUDAT: '2026-08-01', SGTXT: 'Executive & Corporate Overhead IT' },
      { MANDT: '800', KOKRS: '1000', BELNR: '0001000455', BUZEI: '001', PERIO: '008', GJAHR: '2026', KSTAR: '0000440000', OBJNR: 'KS10002100', KOSTL: '2100', AUFNR: '', PRCTR: 'PC-1400', WTG001: 31500.00, WOG001: 31500.00, TWAER: 'EUR', OWAER: 'EUR', USNAM: 'SYS_ADMIN', BLDAT: '2026-08-01', BUDAT: '2026-08-01', SGTXT: 'Sales & Marketing Campaign Ops' }
    ];

    // CO - CSKS (Cost Center Master Records)
    this.tableDataStore['CSKS'] = [
      { MANDT: '800', KOKRS: '1000', KOSTL: '1100', DATBI: '99991231', DATAB: '20200101', BUKRS: '1000', GSBER: '0001', KOSAR: 'E', VERAK: 'Dr. Klaus Weber', PRCTR: 'PC-1100', WAERS: 'EUR' },
      { MANDT: '800', KOKRS: '1000', KOSTL: '2100', DATBI: '99991231', DATAB: '20200101', BUKRS: '1000', GSBER: '0001', KOSAR: 'V', VERAK: 'Elena Rostova', PRCTR: 'PC-1400', WAERS: 'EUR' },
      { MANDT: '800', KOKRS: '1000', KOSTL: '4110', DATBI: '99991231', DATAB: '20200101', BUKRS: '1000', GSBER: '0001', KOSAR: 'F', VERAK: 'Markus Schmidt', PRCTR: 'PC-1200', WAERS: 'EUR' },
      { MANDT: '800', KOKRS: '1000', KOSTL: '4200', DATBI: '99991231', DATAB: '20200101', BUKRS: '1000', GSBER: '0001', KOSAR: 'M', VERAK: 'Hans Gruber', PRCTR: 'PC-1300', WAERS: 'EUR' },
      { MANDT: '800', KOKRS: '1000', KOSTL: '4300', DATBI: '99991231', DATAB: '20200101', BUKRS: '1000', GSBER: '0001', KOSAR: 'Q', VERAK: 'Sophie Becker', PRCTR: 'PC-1300', WAERS: 'EUR' }
    ];

    // CO - CSKT (Cost Center Texts)
    this.tableDataStore['CSKT'] = [
      { MANDT: '800', SPRAS: 'E', KOKRS: '1000', KOSTL: '1100', DATBI: '99991231', KTEXT: 'Executive & Admin', LTEXT: 'Executive Leadership and Administration' },
      { MANDT: '800', SPRAS: 'E', KOKRS: '1000', KOSTL: '2100', DATBI: '99991231', KTEXT: 'Sales & Marketing', LTEXT: 'Global Sales and Digital Marketing' },
      { MANDT: '800', SPRAS: 'E', KOKRS: '1000', KOSTL: '4110', DATBI: '99991231', KTEXT: 'Plant Manufacturing', LTEXT: 'Automated Valve & Pump Fabrication' },
      { MANDT: '800', SPRAS: 'E', KOKRS: '1000', KOSTL: '4200', DATBI: '99991231', KTEXT: 'Plant Maintenance', LTEXT: 'Industrial Equipment & Plant Maintenance' },
      { MANDT: '800', SPRAS: 'E', KOKRS: '1000', KOSTL: '4300', DATBI: '99991231', KTEXT: 'Quality & Testing', LTEXT: 'Quality Assurance, Metrology & Testing' }
    ];

    // FI - SKA1 (G/L Accounts Chart of Accounts)
    this.tableDataStore['SKA1'] = [
      { MANDT: '800', KTOPL: 'INT', SAKNR: '0000115000', BILKT: '115000', GVTYP: ' ', XBILK: 'X', KTOA: 'ASET' },
      { MANDT: '800', KTOPL: 'INT', SAKNR: '0000140000', BILKT: '140000', GVTYP: ' ', XBILK: 'X', KTOA: 'RECE' },
      { MANDT: '800', KTOPL: 'INT', SAKNR: '0000154000', BILKT: '154000', GVTYP: ' ', XBILK: 'X', KTOA: 'TAXS' },
      { MANDT: '800', KTOPL: 'INT', SAKNR: '0000160000', BILKT: '160000', GVTYP: ' ', XBILK: 'X', KTOA: 'PAYA' },
      { MANDT: '800', KTOPL: 'INT', SAKNR: '0000175000', BILKT: '175000', GVTYP: ' ', XBILK: 'X', KTOA: 'TAXS' },
      { MANDT: '800', KTOPL: 'INT', SAKNR: '0000400000', BILKT: '400000', GVTYP: 'X', XBILK: ' ', KTOA: 'MATC' },
      { MANDT: '800', KTOPL: 'INT', SAKNR: '0000410000', BILKT: '410000', GVTYP: 'X', XBILK: ' ', KTOA: 'SERV' },
      { MANDT: '800', KTOPL: 'INT', SAKNR: '0000420000', BILKT: '420000', GVTYP: 'X', XBILK: ' ', KTOA: 'SERV' },
      { MANDT: '800', KTOPL: 'INT', SAKNR: '0000430000', BILKT: '430000', GVTYP: 'X', XBILK: ' ', KTOA: 'ADMN' },
      { MANDT: '800', KTOPL: 'INT', SAKNR: '0000440000', BILKT: '440000', GVTYP: 'X', XBILK: ' ', KTOA: 'MKTG' },
      { MANDT: '800', KTOPL: 'INT', SAKNR: '0000480000', BILKT: '480000', GVTYP: 'X', XBILK: ' ', KTOA: 'DEPR' },
      { MANDT: '800', KTOPL: 'INT', SAKNR: '0000800000', BILKT: '800000', GVTYP: 'X', XBILK: ' ', KTOA: 'REV' }
    ];

    // FI - SKB1 (G/L Accounts Company Code 1000)
    this.tableDataStore['SKB1'] = [
      { MANDT: '800', BUKRS: '1000', SAKNR: '0000115000', WAERS: 'EUR', MITKZ: '', WMWST: '', FDLEV: 'B1', FSTAG: 'G001' },
      { MANDT: '800', BUKRS: '1000', SAKNR: '0000140000', WAERS: 'EUR', MITKZ: 'D', WMWST: '', FDLEV: 'B1', FSTAG: 'G067' },
      { MANDT: '800', BUKRS: '1000', SAKNR: '0000154000', WAERS: 'EUR', MITKZ: '', WMWST: '<', FDLEV: 'B1', FSTAG: 'G001' },
      { MANDT: '800', BUKRS: '1000', SAKNR: '0000160000', WAERS: 'EUR', MITKZ: 'K', WMWST: '', FDLEV: 'B1', FSTAG: 'G067' },
      { MANDT: '800', BUKRS: '1000', SAKNR: '0000175000', WAERS: 'EUR', MITKZ: '', WMWST: '>', FDLEV: 'B1', FSTAG: 'G001' },
      { MANDT: '800', BUKRS: '1000', SAKNR: '0000400000', WAERS: 'EUR', MITKZ: '', WMWST: '*', FDLEV: 'E1', FSTAG: 'G004' },
      { MANDT: '800', BUKRS: '1000', SAKNR: '0000410000', WAERS: 'EUR', MITKZ: '', WMWST: '*', FDLEV: 'E1', FSTAG: 'G004' },
      { MANDT: '800', BUKRS: '1000', SAKNR: '0000420000', WAERS: 'EUR', MITKZ: '', WMWST: '*', FDLEV: 'E1', FSTAG: 'G004' },
      { MANDT: '800', BUKRS: '1000', SAKNR: '0000430000', WAERS: 'EUR', MITKZ: '', WMWST: '*', FDLEV: 'E1', FSTAG: 'G004' },
      { MANDT: '800', BUKRS: '1000', SAKNR: '0000440000', WAERS: 'EUR', MITKZ: '', WMWST: '*', FDLEV: 'E1', FSTAG: 'G004' },
      { MANDT: '800', BUKRS: '1000', SAKNR: '0000480000', WAERS: 'EUR', MITKZ: '', WMWST: '', FDLEV: 'E1', FSTAG: 'G004' },
      { MANDT: '800', BUKRS: '1000', SAKNR: '0000800000', WAERS: 'EUR', MITKZ: '', WMWST: '*', FDLEV: 'E1', FSTAG: 'G029' }
    ];

    // FI - SKAT (G/L Texts)
    this.tableDataStore['SKAT'] = [
      { MANDT: '800', SPRAS: 'E', KTOPL: 'INT', SAKNR: '0000115000', TXT20: 'Acc. Depreciation', TXT50: 'Accumulated Depreciation - Plant Equipment' },
      { MANDT: '800', SPRAS: 'E', KTOPL: 'INT', SAKNR: '0000140000', TXT20: 'Trade Receivables', TXT50: 'Accounts Receivable - Trade Domestic & Export' },
      { MANDT: '800', SPRAS: 'E', KTOPL: 'INT', SAKNR: '0000154000', TXT20: 'Input VAT 19%', TXT50: 'Input Tax on Purchases Deductible 19%' },
      { MANDT: '800', SPRAS: 'E', KTOPL: 'INT', SAKNR: '0000160000', TXT20: 'Trade Payables', TXT50: 'Accounts Payable - Domestic Vendors & Contractors' },
      { MANDT: '800', SPRAS: 'E', KTOPL: 'INT', SAKNR: '0000175000', TXT20: 'Output VAT 19%', TXT50: 'Output Tax on Sales and Deliveries 19%' },
      { MANDT: '800', SPRAS: 'E', KTOPL: 'INT', SAKNR: '0000400000', TXT20: 'Raw Mat Consumption', TXT50: 'Direct Raw Material & Steel Consumption' },
      { MANDT: '800', SPRAS: 'E', KTOPL: 'INT', SAKNR: '0000410000', TXT20: 'Maintenance Expense', TXT50: 'External Plant Machinery Maintenance Services' },
      { MANDT: '800', SPRAS: 'E', KTOPL: 'INT', SAKNR: '0000420000', TXT20: 'Lab & Sensor Test', TXT50: 'Testing, Inspection, Metrology & Sensor Certification' },
      { MANDT: '800', SPRAS: 'E', KTOPL: 'INT', SAKNR: '0000430000', TXT20: 'Corporate Admin IT', TXT50: 'Corporate Administration and IT Infrastructure' },
      { MANDT: '800', SPRAS: 'E', KTOPL: 'INT', SAKNR: '0000440000', TXT20: 'Marketing & Sales', TXT50: 'Sales Promotion, Digital Marketing, Channels' },
      { MANDT: '800', SPRAS: 'E', KTOPL: 'INT', SAKNR: '0000480000', TXT20: 'Depreciation Expense', TXT50: 'Depreciation of Property, Plant and Equipment' },
      { MANDT: '800', SPRAS: 'E', KTOPL: 'INT', SAKNR: '0000800000', TXT20: 'Sales Revenue Domestic', TXT50: 'Sales Revenue - High-Tech Valves & Industrial Equipment' }
    ];

    // CO - CEPC (Profit Center Master Data)
    this.tableDataStore['CEPC'] = [
      { MANDT: '800', PRCTR: 'PC-1100', DATBI: '99991231', KOKRS: '1000', DATAB: '20200101', VERAK: 'Dr. Klaus Weber', SEGMENT: 'SEG_AUTOMOTIVE', USNAM: 'SAP_ADMIN' },
      { MANDT: '800', PRCTR: 'PC-1200', DATBI: '99991231', KOKRS: '1000', DATAB: '20200101', VERAK: 'Markus Schmidt', SEGMENT: 'SEG_INDUSTRIAL', USNAM: 'SAP_ADMIN' },
      { MANDT: '800', PRCTR: 'PC-1300', DATBI: '99991231', KOKRS: '1000', DATAB: '20200101', VERAK: 'Hans Gruber', SEGMENT: 'SEG_ENERGY', USNAM: 'SAP_ADMIN' },
      { MANDT: '800', PRCTR: 'PC-1400', DATBI: '99991231', KOKRS: '1000', DATAB: '20200101', VERAK: 'Elena Rostova', SEGMENT: 'SEG_ELECTRONICS', USNAM: 'SAP_ADMIN' }
    ];

    // CO - CEPCT (Profit Center Texts)
    this.tableDataStore['CEPCT'] = [
      { MANDT: '800', SPRAS: 'E', PRCTR: 'PC-1100', DATBI: '99991231', KOKRS: '1000', KTEXT: 'Automotive Division', LTEXT: 'Automotive & Heavy Commercial Equipment' },
      { MANDT: '800', SPRAS: 'E', PRCTR: 'PC-1200', DATBI: '99991231', KOKRS: '1000', KTEXT: 'Industrial Valves', LTEXT: 'Precision Flow & Control Valves Division' },
      { MANDT: '800', SPRAS: 'E', PRCTR: 'PC-1300', DATBI: '99991231', KOKRS: '1000', KTEXT: 'Energy & Turbines', LTEXT: 'High Pressure Energy & Thermal Systems' },
      { MANDT: '800', SPRAS: 'E', PRCTR: 'PC-1400', DATBI: '99991231', KOKRS: '1000', KTEXT: 'Sensors & Controls', LTEXT: 'Digital Sensors, IoT Transducers & Avionics' }
    ];

    // FI - T001 (Company Codes)
    this.tableDataStore['T001'] = [
      { MANDT: '800', BUKRS: '1000', BUTXT: 'BestRun Germany AG', ORT01: 'Walldorf', LAND1: 'DE', WAERS: 'EUR', SPRAS: 'E', KTOPL: 'INT' },
      { MANDT: '800', BUKRS: '1710', BUTXT: 'BestRun US Inc', ORT01: 'New York', LAND1: 'US', WAERS: 'USD', SPRAS: 'E', KTOPL: 'INT' },
      { MANDT: '800', BUKRS: '2000', BUTXT: 'BestRun UK Ltd', ORT01: 'London', LAND1: 'GB', WAERS: 'GBP', SPRAS: 'E', KTOPL: 'INT' }
    ];

    // MM - LFA1 (Vendor Master General Data)
    this.tableDataStore['LFA1'] = [
      { MANDT: '800', LIFNR: '0000100050', NAME1: 'ThyssenKrupp Materials AG', NAME2: 'Raw Steel & Metallurgy', ORT01: 'Essen', PSTLZ: '45143', LAND1: 'DE', STRAS: 'Thyssenkrupp Allee 1' },
      { MANDT: '800', LIFNR: '0000100055', NAME1: 'Siemens Energy Global GmbH', NAME2: 'Industrial Power Systems', ORT01: 'Munich', PSTLZ: '80333', LAND1: 'DE', STRAS: 'Otto-Hahn-Ring 6' },
      { MANDT: '800', LIFNR: '0000100060', NAME1: 'Endress+Hauser Messtechnik GmbH', NAME2: 'Flow & Level Sensors', ORT01: 'Weil am Rhein', PSTLZ: '79576', LAND1: 'DE', STRAS: 'Hauptstrasse 1' }
    ];

    // PM - EQUI (Equipment Master Data)
    this.tableDataStore['EQUI'] = [
      { MANDT: '800', EQUNR: '000000000010088910', EQKTX: 'High-Pressure Steam Boiler HP-300', EQTYP: 'M', TPLNR: 'PL10-BOIL-B01', SWERK: '1000', INGRP: '001', HERST: 'Babcock & Wilcox', SERGE: 'BW-99201-HP', BAUJJ: '2021' },
      { MANDT: '800', EQUNR: '000000000010088911', EQKTX: 'Centrifugal Feed Water Pump P-101', EQTYP: 'M', TPLNR: 'PL10-BOIL-P01', SWERK: '1000', INGRP: '001', HERST: 'Sulzer Pumps AG', SERGE: 'SZ-882104', BAUJJ: '2022' },
      { MANDT: '800', EQUNR: '000000000010088912', EQKTX: '5-Axis CNC Milling Center DMG Mori', EQTYP: 'M', TPLNR: 'PL10-PROD-M01', SWERK: '1000', INGRP: '002', HERST: 'DMG MORI AG', SERGE: 'DMG-5AX-4412', BAUJJ: '2023' },
      { MANDT: '800', EQUNR: '000000000010088913', EQKTX: 'High Voltage Step-Down Transformer 20MVA', EQTYP: 'E', TPLNR: 'PL10-ELEC-T01', SWERK: '1000', INGRP: '003', HERST: 'Siemens Energy Global', SERGE: 'SIE-TR-90021', BAUJJ: '2019' },
      { MANDT: '800', EQUNR: '000000000010088914', EQKTX: 'Rotary Screw Air Compressor Atlas Copco', EQTYP: 'M', TPLNR: 'PL10-UTIL-C01', SWERK: '1000', INGRP: '001', HERST: 'Atlas Copco GmbH', SERGE: 'AC-GA75-7712', BAUJJ: '2020' }
    ];

    // PM - IFLOT (Functional Locations)
    this.tableDataStore['IFLOT'] = [
      { MANDT: '800', TPLNR: 'PL10-BOIL-B01', PLTXT: 'Plant 1000 - Boiler Room Bay 01', FLTYP: 'M', SWERK: '1000', KOSTL: '4110', INGRP: '001' },
      { MANDT: '800', TPLNR: 'PL10-BOIL-P01', PLTXT: 'Plant 1000 - Boiler Water Feed Station', FLTYP: 'M', SWERK: '1000', KOSTL: '4110', INGRP: '001' },
      { MANDT: '800', TPLNR: 'PL10-PROD-M01', PLTXT: 'Plant 1000 - Machining Workshop Line 1', FLTYP: 'M', SWERK: '1000', KOSTL: '4200', INGRP: '002' },
      { MANDT: '800', TPLNR: 'PL10-ELEC-T01', PLTXT: 'Plant 1000 - Main Electrical Substation', FLTYP: 'E', SWERK: '1000', KOSTL: '4300', INGRP: '003' },
      { MANDT: '800', TPLNR: 'PL10-UTIL-C01', PLTXT: 'Plant 1000 - Pneumatics & Utilities Hub', FLTYP: 'M', SWERK: '1000', KOSTL: '4110', INGRP: '001' }
    ];

    // PM - QMEL (Maintenance Notifications)
    this.tableDataStore['QMEL'] = [
      { MANDT: '800', QMNUM: '00010004501', QMART: 'M1', QMTXT: 'Critical seal leak on Steam Boiler HP-300', EQUNR: '000000000010088910', TPLNR: 'PL10-BOIL-B01', PRIOK: '1', ERDAT: '2026-08-18', ERNAM: 'J_SCHMIDT', QMSTATUS: 'NOPR', MSAUS: 'X', AUFNR: '000004001891' },
      { MANDT: '800', QMNUM: '00010004502', QMART: 'M2', QMTXT: 'Excessive vibration and thermal spike in Feed Pump P-101 bearing', EQUNR: '000000000010088911', TPLNR: 'PL10-BOIL-P01', PRIOK: '2', ERDAT: '2026-08-16', ERNAM: 'M_WEBER', QMSTATUS: 'OSNO', MSAUS: '', AUFNR: '000004001892' },
      { MANDT: '800', QMNUM: '00010004503', QMART: 'M3', QMTXT: 'Quarterly calibration & spindle alignment check CNC-501', EQUNR: '000000000010088912', TPLNR: 'PL10-PROD-M01', PRIOK: '3', ERDAT: '2026-08-10', ERNAM: 'K_MUELLER', QMSTATUS: 'NOPR', MSAUS: '', AUFNR: '000004001893' },
      { MANDT: '800', QMNUM: '00010004504', QMART: 'M1', QMTXT: 'Transformer T01 oil temperature alarm triggered (>95°C)', EQUNR: '000000000010088913', TPLNR: 'PL10-ELEC-T01', PRIOK: '1', ERDAT: '2026-08-05', ERNAM: 'H_FISCHER', QMSTATUS: 'NOCO', MSAUS: 'X', AUFNR: '000004001890' },
      { MANDT: '800', QMNUM: '00010004505', QMART: 'M2', QMTXT: 'Air Compressor pressure drops below 6.5 bar during peak load', EQUNR: '000000000010088914', TPLNR: 'PL10-UTIL-C01', PRIOK: '3', ERDAT: '2026-08-01', ERNAM: 'J_SCHMIDT', QMSTATUS: 'OSNO', MSAUS: '', AUFNR: '000004001894' }
    ];

    // PM - AFIH (Maintenance Order Headers)
    this.tableDataStore['AFIH'] = [
      { MANDT: '800', AUFNR: '000004001890', EQUNR: '000000000010088913', TPLNR: 'PL10-ELEC-T01', PRIOK: '1', ILART: 'PM1' },
      { MANDT: '800', AUFNR: '000004001891', EQUNR: '000000000010088910', TPLNR: 'PL10-BOIL-B01', PRIOK: '1', ILART: 'PM3' },
      { MANDT: '800', AUFNR: '000004001892', EQUNR: '000000000010088911', TPLNR: 'PL10-BOIL-P01', PRIOK: '2', ILART: 'PM1' },
      { MANDT: '800', AUFNR: '000004001893', EQUNR: '000000000010088912', TPLNR: 'PL10-PROD-M01', PRIOK: '3', ILART: 'PM2' },
      { MANDT: '800', AUFNR: '000004001894', EQUNR: '000000000010088914', TPLNR: 'PL10-UTIL-C01', PRIOK: '3', ILART: 'PM1' },
      { MANDT: '800', AUFNR: '000004001895', EQUNR: '000000000010088910', TPLNR: 'PL10-BOIL-B01', PRIOK: '4', ILART: 'PM2' },
      { MANDT: '800', AUFNR: '000004001896', EQUNR: '000000000010088910', TPLNR: 'PL10-BOIL-B01', PRIOK: '2', ILART: 'PM1' }
    ];

    // 9. PM & PP - AUFK (Order Master Data)
    this.tableDataStore['AUFK'] = [
      { MANDT: '800', AUFNR: '000004001890', AUFART: 'PM01', KTEXT: 'Emergency Inspection & Oil Replacement Transformer T01', WERKS: '1000', KOKRS: '1000', KOSTL: '4300', IPHAS: '3', ERDAT: '2026-08-05' },
      { MANDT: '800', AUFNR: '000004001891', AUFART: 'PM03', KTEXT: 'Repair High-Pressure Boiler Gasket & Hydro-test', WERKS: '1000', KOKRS: '1000', KOSTL: '4110', IPHAS: '2', ERDAT: '2026-08-18' },
      { MANDT: '800', AUFNR: '000004001892', AUFART: 'PM01', KTEXT: 'Replace Ceramic Impeller Bearings Pump P-101', WERKS: '1000', KOKRS: '1000', KOSTL: '4110', IPHAS: '2', ERDAT: '2026-08-16' },
      { MANDT: '800', AUFNR: '000004001893', AUFART: 'PM02', KTEXT: 'Preventive Spindle Calibration & Laser Align CNC-501', WERKS: '1000', KOKRS: '1000', KOSTL: '4200', IPHAS: '1', ERDAT: '2026-08-10' },
      { MANDT: '800', AUFNR: '000004001894', AUFART: 'PM01', KTEXT: 'Descaling & Intake Valve Overhaul Compressor C-301', WERKS: '1000', KOKRS: '1000', KOSTL: '4110', IPHAS: '2', ERDAT: '2026-08-01' },
      { MANDT: '800', AUFNR: '000004001895', AUFART: 'PM02', KTEXT: 'Annual Thermal Scan & Bushing Clean Boiler B-01', WERKS: '1000', KOKRS: '1000', KOSTL: '4110', IPHAS: '3', ERDAT: '2026-06-15' },
      { MANDT: '800', AUFNR: '000004001896', AUFART: 'PM01', KTEXT: 'Safety Pressure Relief Valve Recalibration Boiler B-01', WERKS: '1000', KOKRS: '1000', KOSTL: '4110', IPHAS: '3', ERDAT: '2026-07-22' },
      { MANDT: '800', AUFNR: '000010002450', AUFART: 'PP01', KTEXT: 'Production Order Valve DVK-100 Standard Batch', WERKS: '1000', KOKRS: '1000', KOSTL: '4110', IPHAS: '2', ERDAT: '2026-08-14' },
      { MANDT: '800', AUFNR: '000010002451', AUFART: 'PP01', KTEXT: 'Production Order Feed Pump PUMP-01 High-Pressure', WERKS: '1000', KOKRS: '1000', KOSTL: '4110', IPHAS: '1', ERDAT: '2026-08-16' },
      { MANDT: '800', AUFNR: '000010002452', AUFART: 'PP01', KTEXT: 'Production Order Sensor Transducer M-13 Precision', WERKS: '1000', KOKRS: '1000', KOSTL: '4300', IPHAS: '2', ERDAT: '2026-08-10' },
      { MANDT: '800', AUFNR: '000010002453', AUFART: 'PP01', KTEXT: 'Production Order Valve DVK-100 Rush Export Batch', WERKS: '1000', KOKRS: '1000', KOSTL: '4110', IPHAS: '2', ERDAT: '2026-08-01' }
    ];

    // 15. PP - AFKO (Order Header Data PP Orders)
    this.tableDataStore['AFKO'] = [
      { MANDT: '800', AUFNR: '000010002450', GLTRS: '2026-08-25', GSTRI: '2026-08-18', GETRI: '', GSTRS: '2026-08-18', GLTRI: '2026-08-25', FTRMS: '2026-08-18', GAMNG: 100.000, GASMG: 0.000, GMEIN: 'PC', PLNBEZ: 'DVK-100', DISPO: '001', FEVOR: '001', AUFPL: '0000081001' },
      { MANDT: '800', AUFNR: '000010002451', GLTRS: '2026-08-28', GSTRI: '2026-08-20', GETRI: '', GSTRS: '2026-08-20', GLTRI: '2026-08-28', FTRMS: '2026-08-20', GAMNG: 25.000, GASMG: 0.000, GMEIN: 'PC', PLNBEZ: 'PUMP-INDUSTRIAL-01', DISPO: '001', FEVOR: '001', AUFPL: '0000081002' },
      { MANDT: '800', AUFNR: '000010002452', GLTRS: '2026-08-22', GSTRI: '2026-08-15', GETRI: '', GSTRS: '2026-08-15', GLTRI: '2026-08-22', FTRMS: '2026-08-15', GAMNG: 50.000, GASMG: 0.000, GMEIN: 'PC', PLNBEZ: 'M-13', DISPO: '002', FEVOR: '002', AUFPL: '0000081003' },
      { MANDT: '800', AUFNR: '000010002453', GLTRS: '2026-08-10', GSTRI: '2026-08-03', GETRI: '', GSTRS: '2026-08-03', GLTRI: '2026-08-10', FTRMS: '2026-08-03', GAMNG: 80.000, GASMG: 0.000, GMEIN: 'PC', PLNBEZ: 'DVK-100', DISPO: '001', FEVOR: '001', AUFPL: '0000081004' }
    ];

    // 16. PP - AFPO (Order Item Data PP Orders)
    this.tableDataStore['AFPO'] = [
      { MANDT: '800', AUFNR: '000010002450', POSNR: '0001', MATNR: 'DVK-100', WERKS: '1000', PWERK: '1000', CHARG: 'BATCH-202608A', PSMNG: 100.000, WEMNG: 40.000, AMEIN: 'PC', PAMNG: 0.000, KDAUF: '0000010042', KDPOS: '000010', ELIKZ: '' },
      { MANDT: '800', AUFNR: '000010002451', POSNR: '0001', MATNR: 'PUMP-INDUSTRIAL-01', WERKS: '1000', PWERK: '1000', CHARG: 'BATCH-202608B', PSMNG: 25.000, WEMNG: 0.000, AMEIN: 'PC', PAMNG: 0.000, KDAUF: '', KDPOS: '000000', ELIKZ: '' },
      { MANDT: '800', AUFNR: '000010002452', POSNR: '0001', MATNR: 'M-13', WERKS: '1000', PWERK: '1000', CHARG: 'BATCH-202608C', PSMNG: 50.000, WEMNG: 50.000, AMEIN: 'PC', PAMNG: 0.000, KDAUF: '', KDPOS: '000000', ELIKZ: 'X' },
      { MANDT: '800', AUFNR: '000010002453', POSNR: '0001', MATNR: 'DVK-100', WERKS: '1000', PWERK: '1000', CHARG: 'BATCH-202608D', PSMNG: 80.000, WEMNG: 20.000, AMEIN: 'PC', PAMNG: 0.000, KDAUF: '', KDPOS: '000000', ELIKZ: '' }
    ];

    // 17. PP - AFVC (Order Operations / Routing Steps)
    this.tableDataStore['AFVC'] = [
      // 0000081001 for 000010002450
      { MANDT: '800', AUFPL: '0000081001', APLZL: '00000001', VORNR: '0010', ARBPL: 'WC-MACH01', WERKS: '1000', STEUS: 'PP01', LTXA1: 'CNC Precision Milling & Lathe Operation', VGW01: 0.50, VGW02: 2.00, VGW03: 1.50, MEINH: 'H' },
      { MANDT: '800', AUFPL: '0000081001', APLZL: '00000002', VORNR: '0020', ARBPL: 'WC-ASSY01', WERKS: '1000', STEUS: 'PP01', LTXA1: 'Component Manual Assembly & Fastening', VGW01: 0.25, VGW02: 0.00, VGW03: 3.00, MEINH: 'H' },
      { MANDT: '800', AUFPL: '0000081001', APLZL: '00000003', VORNR: '0030', ARBPL: 'WC-TEST01', WERKS: '1000', STEUS: 'PP01', LTXA1: 'Hydrostatic Pressure & Leakage Testing', VGW01: 0.50, VGW02: 1.00, VGW03: 1.00, MEINH: 'H' },

      // 0000081002 for 000010002451
      { MANDT: '800', AUFPL: '0000081002', APLZL: '00000001', VORNR: '0010', ARBPL: 'WC-MACH01', WERKS: '1000', STEUS: 'PP01', LTXA1: 'Pump Impeller & Housing Machining', VGW01: 1.00, VGW02: 4.00, VGW03: 2.00, MEINH: 'H' },
      { MANDT: '800', AUFPL: '0000081002', APLZL: '00000002', VORNR: '0020', ARBPL: 'WC-ASSY01', WERKS: '1000', STEUS: 'PP01', LTXA1: 'Impeller & Motor Integration', VGW01: 0.50, VGW02: 0.00, VGW03: 4.00, MEINH: 'H' },
      { MANDT: '800', AUFPL: '0000081002', APLZL: '00000003', VORNR: '0030', ARBPL: 'WC-TEST01', WERKS: '1000', STEUS: 'PP01', LTXA1: 'Dynamic Flow & Vibration Testing', VGW01: 0.50, VGW02: 2.00, VGW03: 2.00, MEINH: 'H' },

      // 0000081004 for 000010002453 (Delayed Order)
      { MANDT: '800', AUFPL: '0000081004', APLZL: '00000001', VORNR: '0010', ARBPL: 'WC-MACH01', WERKS: '1000', STEUS: 'PP01', LTXA1: 'CNC Machining Valve Bodies', VGW01: 0.50, VGW02: 2.00, VGW03: 1.50, MEINH: 'H' },
      { MANDT: '800', AUFPL: '0000081004', APLZL: '00000002', VORNR: '0020', ARBPL: 'WC-ASSY01', WERKS: '1000', STEUS: 'PP01', LTXA1: 'Final Assembly and Packing', VGW01: 0.25, VGW02: 0.00, VGW03: 3.00, MEINH: 'H' }
    ];

    // 18. PP - AFRU (Order Confirmations / Time Tickets)
    this.tableDataStore['AFRU'] = [
      { MANDT: '800', RUECK: '0000012010', RMZHL: '00000001', AUFNR: '000010002450', VORNR: '0010', LMNGA: 40.000, XMNGA: 0.000, GMEIN: 'PC', ISM01: 0.50, ISM02: 1.80, ISM03: 1.40, BUDAT: '2026-08-19', ERNAM: 'PROD_OPERATOR', STOKZ: '' },
      { MANDT: '800', RUECK: '0000012005', RMZHL: '00000001', AUFNR: '000010002452', VORNR: '0010', LMNGA: 50.000, XMNGA: 0.000, GMEIN: 'PC', ISM01: 0.30, ISM02: 1.50, ISM03: 1.20, BUDAT: '2026-08-18', ERNAM: 'PROD_OPERATOR', STOKZ: '' },
      { MANDT: '800', RUECK: '0000012006', RMZHL: '00000002', AUFNR: '000010002452', VORNR: '0020', LMNGA: 50.000, XMNGA: 0.000, GMEIN: 'PC', ISM01: 0.20, ISM02: 0.00, ISM03: 2.50, BUDAT: '2026-08-20', ERNAM: 'PROD_OPERATOR', STOKZ: '' },
      { MANDT: '800', RUECK: '0000012001', RMZHL: '00000001', AUFNR: '000010002453', VORNR: '0010', LMNGA: 20.000, XMNGA: 0.000, GMEIN: 'PC', ISM01: 0.50, ISM02: 1.00, ISM03: 1.00, BUDAT: '2026-08-05', ERNAM: 'PROD_OPERATOR', STOKZ: '' }
    ];

    // 19. PP - RESB (Reservations & Component Shortages)
    this.tableDataStore['RESB'] = [
      // 000010002450 components
      { MANDT: '800', RSNUM: '0000041001', RSPOS: '0001', RSART: 'M', AUFNR: '000010002450', BAUGR: 'DVK-100', MATNR: 'RAW-STEEL-PLATE', WERKS: '1000', LGORT: '0001', BDMNG: 200.000, ENMNG: 100.000, FMENG: 0.000, MEINS: 'KG', SHKZG: 'H', KZEAR: '', XLOEK: '' },
      { MANDT: '800', RSNUM: '0000041001', RSPOS: '0002', RSART: 'M', AUFNR: '000010002450', BAUGR: 'DVK-100', MATNR: 'M-13', WERKS: '1000', LGORT: '0001', BDMNG: 100.000, ENMNG: 40.000, FMENG: 0.000, MEINS: 'PC', SHKZG: 'H', KZEAR: '', XLOEK: '' },

      // 000010002451 components (Has shortage!)
      { MANDT: '800', RSNUM: '0000041002', RSPOS: '0001', RSART: 'M', AUFNR: '000010002451', BAUGR: 'PUMP-INDUSTRIAL-01', MATNR: 'RAW-STEEL-PLATE', WERKS: '1000', LGORT: '0001', BDMNG: 500.000, ENMNG: 0.000, FMENG: 0.000, MEINS: 'KG', SHKZG: 'H', KZEAR: '', XLOEK: '' },
      { MANDT: '800', RSNUM: '0000041002', RSPOS: '0002', RSART: 'M', AUFNR: '000010002451', BAUGR: 'PUMP-INDUSTRIAL-01', MATNR: 'M-13', WERKS: '1000', LGORT: '0001', BDMNG: 50.000, ENMNG: 0.000, FMENG: 20.000, MEINS: 'PC', SHKZG: 'H', KZEAR: '', XLOEK: '' },

      // 000010002453 components (Delayed order with critical shortages)
      { MANDT: '800', RSNUM: '0000041004', RSPOS: '0001', RSART: 'M', AUFNR: '000010002453', BAUGR: 'DVK-100', MATNR: 'RAW-STEEL-PLATE', WERKS: '1000', LGORT: '0001', BDMNG: 160.000, ENMNG: 40.000, FMENG: 40.000, MEINS: 'KG', SHKZG: 'H', KZEAR: '', XLOEK: '' },
      { MANDT: '800', RSNUM: '0000041004', RSPOS: '0002', RSART: 'M', AUFNR: '000010002453', BAUGR: 'DVK-100', MATNR: 'M-13', WERKS: '1000', LGORT: '0001', BDMNG: 80.000, ENMNG: 20.000, FMENG: 35.000, MEINS: 'PC', SHKZG: 'H', KZEAR: '', XLOEK: '' }
    ];

    // 20. PP - PLAF (Planned Orders / MRP)
    this.tableDataStore['PLAF'] = [
      { MANDT: '800', PLNUM: '0000009101', MATNR: 'DVK-100', WERKS: '1000', BERID: '1000', GSMNG: 150.000, MEINS: 'PC', PSTTR: '2026-08-25', PEDTR: '2026-09-02', DISPO: '001', BESKZ: 'E' },
      { MANDT: '800', PLNUM: '0000009102', MATNR: 'PUMP-INDUSTRIAL-01', WERKS: '1000', BERID: '1000', GSMNG: 40.000, MEINS: 'PC', PSTTR: '2026-09-01', PEDTR: '2026-09-15', DISPO: '001', BESKZ: 'E' },
      { MANDT: '800', PLNUM: '0000009103', MATNR: 'M-13', WERKS: '1000', BERID: '1000', GSMNG: 300.000, MEINS: 'PC', PSTTR: '2026-08-28', PEDTR: '2026-09-05', DISPO: '002', BESKZ: 'E' }
    ];

    // 21. PP - MAST (Material to BOM Link)
    this.tableDataStore['MAST'] = [
      { MANDT: '800', MATNR: 'DVK-100', WERKS: '1000', STLAN: '1', STLNR: '00005010', STLAL: '01' },
      { MANDT: '800', MATNR: 'PUMP-INDUSTRIAL-01', WERKS: '1000', STLAN: '1', STLNR: '00005020', STLAL: '01' },
      { MANDT: '800', MATNR: 'M-13', WERKS: '1000', STLAN: '1', STLNR: '00005030', STLAL: '01' }
    ];

    // 22. PP - STKO (BOM Header)
    this.tableDataStore['STKO'] = [
      { MANDT: '800', STLTY: 'M', STLNR: '00005010', STLAL: '01', BMENG: 1.000, BMEIN: 'PC', STKTX: 'BOM for Industrial Valve DVK-100', DATUV: '2020-01-01' },
      { MANDT: '800', STLTY: 'M', STLNR: '00005020', STLAL: '01', BMENG: 1.000, BMEIN: 'PC', STKTX: 'BOM for High-Pressure Feed Pump', DATUV: '2020-01-01' },
      { MANDT: '800', STLTY: 'M', STLNR: '00005030', STLAL: '01', BMENG: 1.000, BMEIN: 'PC', STKTX: 'BOM for Precision Transducer Sensor', DATUV: '2020-01-01' }
    ];

    // 23. PP - STPO (BOM Item Components)
    this.tableDataStore['STPO'] = [
      // BOM 00005010 (DVK-100)
      { MANDT: '800', STLTY: 'M', STLNR: '00005010', STLKN: '00000001', STPOZ: '00000001', POSNR: '0010', POSTP: 'L', IDNRK: 'RAW-STEEL-PLATE', MENGE: 2.000, MEINS: 'KG' },
      { MANDT: '800', STLTY: 'M', STLNR: '00005010', STLKN: '00000002', STPOZ: '00000002', POSNR: '0020', POSTP: 'L', IDNRK: 'M-13', MENGE: 1.000, MEINS: 'PC' },

      // BOM 00005020 (PUMP-INDUSTRIAL-01)
      { MANDT: '800', STLTY: 'M', STLNR: '00005020', STLKN: '00000001', STPOZ: '00000001', POSNR: '0010', POSTP: 'L', IDNRK: 'RAW-STEEL-PLATE', MENGE: 20.000, MEINS: 'KG' },
      { MANDT: '800', STLTY: 'M', STLNR: '00005020', STLKN: '00000002', STPOZ: '00000002', POSNR: '0020', POSTP: 'L', IDNRK: 'M-13', MENGE: 2.000, MEINS: 'PC' },

      // BOM 00005030 (M-13)
      { MANDT: '800', STLTY: 'M', STLNR: '00005030', STLKN: '00000001', STPOZ: '00000001', POSNR: '0010', POSTP: 'L', IDNRK: 'RAW-STEEL-PLATE', MENGE: 0.500, MEINS: 'KG' }
    ];

    // 24. PP - CRHD (Work Centers)
    this.tableDataStore['CRHD'] = [
      { MANDT: '800', OBJTY: 'A', OBJID: '00001001', ARBPL: 'WC-MACH01', WERKS: '1000', VERWE: '0001', KTEXT: 'CNC Multi-Axis Milling & Turning Center' },
      { MANDT: '800', OBJTY: 'A', OBJID: '00001002', ARBPL: 'WC-ASSY01', WERKS: '1000', VERWE: '0002', KTEXT: 'Final Mechanical Assembly & Fastening Cell' },
      { MANDT: '800', OBJTY: 'A', OBJID: '00001003', ARBPL: 'WC-TEST01', WERKS: '1000', VERWE: '0003', KTEXT: 'Hydrostatic & Ultrasonic Test Station' }
    ];

    // 10. SD - VBEP (Schedule Line Data)
    this.tableDataStore['VBEP'] = [
      { MANDT: '800', VBELN: '0000010042', POSNR: '000010', ETENR: '0001', EDATU: '2026-08-25', WMENG: 20.000, BMENG: 20.000, VRKME: 'PC' },
      { MANDT: '800', VBELN: '0000010043', POSNR: '000010', ETENR: '0001', EDATU: '2026-08-20', WMENG: 10.000, BMENG: 10.000, VRKME: 'PC' },
      { MANDT: '800', VBELN: '0000010044', POSNR: '000010', ETENR: '0001', EDATU: '2026-08-14', WMENG: 5.000, BMENG: 5.000, VRKME: 'PC' }
    ];

    // 11. SD - VBFA (Document Flow)
    this.tableDataStore['VBFA'] = [
      { MANDT: '800', VBELV: '0000010042', POSNV: '000010', VBELN: '0080014290', POSNN: '000010', VBTYP_N: 'J', VBTYP_V: 'C', RFMNG: 20.000, RFWRT: 14500.00, WAERS: 'EUR' },
      { MANDT: '800', VBELV: '0080014290', POSNV: '000010', VBELN: '0090038100', POSNN: '000010', VBTYP_N: 'M', VBTYP_V: 'J', RFMNG: 20.000, RFWRT: 14500.00, WAERS: 'EUR' },
      { MANDT: '800', VBELV: '0090038100', POSNV: '000010', VBELN: '0100092100', POSNN: '000001', VBTYP_N: 'R', VBTYP_V: 'M', RFMNG: 20.000, RFWRT: 14500.00, WAERS: 'EUR' }
    ];

    // 12. SD - LIPS (Delivery Items)
    this.tableDataStore['LIPS'] = [
      { MANDT: '800', VBELN: '0080014290', POSNR: '000010', PSTYV: 'TAN', MATNR: 'DVK-100', ARKTX: 'Industrial Control Valve DVK-100', LFIMG: 20.000, VRKME: 'PC', WERKS: '1000', LGORT: '0001', VGBEL: '0000010042', VGPOS: '000010' }
    ];

    // 13. SD - VBRP (Billing Items)
    this.tableDataStore['VBRP'] = [
      { MANDT: '800', VBELN: '0090038100', POSNR: '000010', FKIMG: 20.000, VRKME: 'PC', NETWR: 14500.00, MWSBP: 2755.00, MATNR: 'DVK-100', ARKTX: 'Industrial Control Valve DVK-100', VGBEL: '0080014290', AUBEL: '0000010042' }
    ];

    // 14. SD - KNVV (Customer Master Sales Area)
    this.tableDataStore['KNVV'] = [
      { MANDT: '800', KUNNR: '0000001000', VKORG: '1000', VTWEG: '10', SPART: '00', KDGRP: '01', INCO1: 'FOB', INCO2: 'Frankfurt', ZTERM: 'ZB01', WAERS: 'EUR' },
      { MANDT: '800', KUNNR: '0000001033', VKORG: '1000', VTWEG: '10', SPART: '00', KDGRP: '01', INCO1: 'CIF', INCO2: 'Hamburg', ZTERM: 'ZB01', WAERS: 'EUR' },
      { MANDT: '800', KUNNR: '0000002040', VKORG: '1000', VTWEG: '10', SPART: '00', KDGRP: '02', INCO1: 'EXW', INCO2: 'Munich', ZTERM: 'ZB02', WAERS: 'EUR' }
    ];

    // 25. HR - HRP1000 (Org Objects: Org Units 'O', Positions 'S', Jobs 'C')
    this.tableDataStore['HRP1000'] = [
      // Org Units (O)
      { MANDT: '800', PLVAR: '01', OTYPE: 'O', OBJID: '50000001', BEGDA: '20200101', ENDDA: '99991231', SHORT: 'GLOBAL-GRP', STEXT: 'BestRun Global Enterprise Group', MC_STEXT: 'BESTRUN GLOBAL ENTERPRISE GROUP' },
      { MANDT: '800', PLVAR: '01', OTYPE: 'O', OBJID: '50001000', BEGDA: '20200101', ENDDA: '99991231', SHORT: 'EU-HQ', STEXT: 'European Headquarters & Operations', MC_STEXT: 'EUROPEAN HEADQUARTERS & OPERATIONS' },
      { MANDT: '800', PLVAR: '01', OTYPE: 'O', OBJID: '50001100', BEGDA: '20200101', ENDDA: '99991231', SHORT: 'CORP-ADMIN', STEXT: 'Corporate Leadership & Administration', MC_STEXT: 'CORPORATE LEADERSHIP & ADMINISTRATION' },
      { MANDT: '800', PLVAR: '01', OTYPE: 'O', OBJID: '50001200', BEGDA: '20200101', ENDDA: '99991231', SHORT: 'ENG-MFG', STEXT: 'Engineering & Plant Manufacturing', MC_STEXT: 'ENGINEERING & PLANT MANUFACTURING' },
      { MANDT: '800', PLVAR: '01', OTYPE: 'O', OBJID: '50001300', BEGDA: '20200101', ENDDA: '99991231', SHORT: 'SCM-LOG', STEXT: 'Supply Chain & Global Logistics', MC_STEXT: 'SUPPLY CHAIN & GLOBAL LOGISTICS' },
      { MANDT: '800', PLVAR: '01', OTYPE: 'O', OBJID: '50001400', BEGDA: '20200101', ENDDA: '99991231', SHORT: 'SALES-SVC', STEXT: 'Sales, Digital Marketing & Services', MC_STEXT: 'SALES, DIGITAL MARKETING & SERVICES' },
      { MANDT: '800', PLVAR: '01', OTYPE: 'O', OBJID: '50001500', BEGDA: '20200101', ENDDA: '99991231', SHORT: 'QA-METROL', STEXT: 'Quality Assurance, Metrology & Testing', MC_STEXT: 'QUALITY ASSURANCE, METROLOGY & TESTING' },

      // Positions (S)
      { MANDT: '800', PLVAR: '01', OTYPE: 'S', OBJID: '50010001', BEGDA: '20200101', ENDDA: '99991231', SHORT: 'CEO-EXEC', STEXT: 'Chief Executive Officer', MC_STEXT: 'CHIEF EXECUTIVE OFFICER' },
      { MANDT: '800', PLVAR: '01', OTYPE: 'S', OBJID: '50010100', BEGDA: '20200101', ENDDA: '99991231', SHORT: 'VP-EU-OPS', STEXT: 'VP of European Operations', MC_STEXT: 'VP OF EUROPEAN OPERATIONS' },
      { MANDT: '800', PLVAR: '01', OTYPE: 'S', OBJID: '50010110', BEGDA: '20200101', ENDDA: '99991231', SHORT: 'DIR-HR', STEXT: 'Director of HR & Global Talent', MC_STEXT: 'DIRECTOR OF HR & GLOBAL TALENT' },
      { MANDT: '800', PLVAR: '01', OTYPE: 'S', OBJID: '50010200', BEGDA: '20200101', ENDDA: '99991231', SHORT: 'DIR-MFG', STEXT: 'Director of Engineering & Manufacturing', MC_STEXT: 'DIRECTOR OF ENGINEERING & MANUFACTURING' },
      { MANDT: '800', PLVAR: '01', OTYPE: 'S', OBJID: '50010210', BEGDA: '20200101', ENDDA: '99991231', SHORT: 'SR-SYS-ENG', STEXT: 'Senior Industrial Systems Engineer', MC_STEXT: 'SENIOR INDUSTRIAL SYSTEMS ENGINEER' },
      { MANDT: '800', PLVAR: '01', OTYPE: 'S', OBJID: '50010300', BEGDA: '20200101', ENDDA: '99991231', SHORT: 'DIR-SCM', STEXT: 'Director of Supply Chain & EWM', MC_STEXT: 'DIRECTOR OF SUPPLY CHAIN & EWM' },
      { MANDT: '800', PLVAR: '01', OTYPE: 'S', OBJID: '50010400', BEGDA: '20200101', ENDDA: '99991231', SHORT: 'DIR-SALES', STEXT: 'Director of Sales & Customer Solutions', MC_STEXT: 'DIRECTOR OF SALES & CUSTOMER SOLUTIONS' },
      { MANDT: '800', PLVAR: '01', OTYPE: 'S', OBJID: '50010500', BEGDA: '20200101', ENDDA: '99991231', SHORT: 'LEAD-QA', STEXT: 'Lead Quality Assurance Auditor', MC_STEXT: 'LEAD QUALITY ASSURANCE AUDITOR' },
      { MANDT: '800', PLVAR: '01', OTYPE: 'S', OBJID: '50010600', BEGDA: '20200101', ENDDA: '99991231', SHORT: 'LOG-PLAN', STEXT: 'Senior Logistics Operations Planner', MC_STEXT: 'SENIOR LOGISTICS OPERATIONS PLANNER' },
      { MANDT: '800', PLVAR: '01', OTYPE: 'S', OBJID: '50010700', BEGDA: '20200101', ENDDA: '99991231', SHORT: 'CNC-MACH', STEXT: 'Precision CNC Machinist Specialist', MC_STEXT: 'PRECISION CNC MACHINIST SPECIALIST' },

      // Jobs (C)
      { MANDT: '800', PLVAR: '01', OTYPE: 'C', OBJID: '50020001', BEGDA: '20200101', ENDDA: '99991231', SHORT: 'EXEC-MGMT', STEXT: 'Executive Management', MC_STEXT: 'EXECUTIVE MANAGEMENT' },
      { MANDT: '800', PLVAR: '01', OTYPE: 'C', OBJID: '50020100', BEGDA: '20200101', ENDDA: '99991231', SHORT: 'ENG-TECH', STEXT: 'Engineering & Industrial Technology', MC_STEXT: 'ENGINEERING & INDUSTRIAL TECHNOLOGY' },
      { MANDT: '800', PLVAR: '01', OTYPE: 'C', OBJID: '50020200', BEGDA: '20200101', ENDDA: '99991231', SHORT: 'SCM-OPS', STEXT: 'Supply Chain Operations & Logistics', MC_STEXT: 'SUPPLY CHAIN OPERATIONS & LOGISTICS' },
      { MANDT: '800', PLVAR: '01', OTYPE: 'C', OBJID: '50020300', BEGDA: '20200101', ENDDA: '99991231', SHORT: 'COMM-SALES', STEXT: 'Commercial Sales & Business Development', MC_STEXT: 'COMMERCIAL SALES & BUSINESS DEVELOPMENT' },
      { MANDT: '800', PLVAR: '01', OTYPE: 'C', OBJID: '50020400', BEGDA: '20200101', ENDDA: '99991231', SHORT: 'QA-METR', STEXT: 'Quality Assurance & Calibration', MC_STEXT: 'QUALITY ASSURANCE & CALIBRATION' }
    ];

    // 26. HR - HRP1001 (Infotype 1001: Org Hierarchy Relationships)
    this.tableDataStore['HRP1001'] = [
      // Org to Org Hierarchy (B002: Line Supervisor / Incorporates)
      { MANDT: '800', PLVAR: '01', OTYPE: 'O', OBJID: '50000001', SUBTY: 'B002', RSIGN: 'B', RELAT: '002', SCLAS: 'O', SOBID: '50001000', BEGDA: '20200101', ENDDA: '99991231' },
      { MANDT: '800', PLVAR: '01', OTYPE: 'O', OBJID: '50001000', SUBTY: 'B002', RSIGN: 'B', RELAT: '002', SCLAS: 'O', SOBID: '50001100', BEGDA: '20200101', ENDDA: '99991231' },
      { MANDT: '800', PLVAR: '01', OTYPE: 'O', OBJID: '50001000', SUBTY: 'B002', RSIGN: 'B', RELAT: '002', SCLAS: 'O', SOBID: '50001200', BEGDA: '20200101', ENDDA: '99991231' },
      { MANDT: '800', PLVAR: '01', OTYPE: 'O', OBJID: '50001000', SUBTY: 'B002', RSIGN: 'B', RELAT: '002', SCLAS: 'O', SOBID: '50001300', BEGDA: '20200101', ENDDA: '99991231' },
      { MANDT: '800', PLVAR: '01', OTYPE: 'O', OBJID: '50001000', SUBTY: 'B002', RSIGN: 'B', RELAT: '002', SCLAS: 'O', SOBID: '50001400', BEGDA: '20200101', ENDDA: '99991231' },
      { MANDT: '800', PLVAR: '01', OTYPE: 'O', OBJID: '50001000', SUBTY: 'B002', RSIGN: 'B', RELAT: '002', SCLAS: 'O', SOBID: '50001500', BEGDA: '20200101', ENDDA: '99991231' },

      // Org Unit incorporates Position (B003)
      { MANDT: '800', PLVAR: '01', OTYPE: 'O', OBJID: '50000001', SUBTY: 'B003', RSIGN: 'B', RELAT: '003', SCLAS: 'S', SOBID: '50010001', BEGDA: '20200101', ENDDA: '99991231' },
      { MANDT: '800', PLVAR: '01', OTYPE: 'O', OBJID: '50001000', SUBTY: 'B003', RSIGN: 'B', RELAT: '003', SCLAS: 'S', SOBID: '50010100', BEGDA: '20200101', ENDDA: '99991231' },
      { MANDT: '800', PLVAR: '01', OTYPE: 'O', OBJID: '50001100', SUBTY: 'B003', RSIGN: 'B', RELAT: '003', SCLAS: 'S', SOBID: '50010110', BEGDA: '20200101', ENDDA: '99991231' },
      { MANDT: '800', PLVAR: '01', OTYPE: 'O', OBJID: '50001200', SUBTY: 'B003', RSIGN: 'B', RELAT: '003', SCLAS: 'S', SOBID: '50010200', BEGDA: '20200101', ENDDA: '99991231' },
      { MANDT: '800', PLVAR: '01', OTYPE: 'O', OBJID: '50001200', SUBTY: 'B003', RSIGN: 'B', RELAT: '003', SCLAS: 'S', SOBID: '50010210', BEGDA: '20200101', ENDDA: '99991231' },
      { MANDT: '800', PLVAR: '01', OTYPE: 'O', OBJID: '50001200', SUBTY: 'B003', RSIGN: 'B', RELAT: '003', SCLAS: 'S', SOBID: '50010700', BEGDA: '20200101', ENDDA: '99991231' },
      { MANDT: '800', PLVAR: '01', OTYPE: 'O', OBJID: '50001300', SUBTY: 'B003', RSIGN: 'B', RELAT: '003', SCLAS: 'S', SOBID: '50010300', BEGDA: '20200101', ENDDA: '99991231' },
      { MANDT: '800', PLVAR: '01', OTYPE: 'O', OBJID: '50001300', SUBTY: 'B003', RSIGN: 'B', RELAT: '003', SCLAS: 'S', SOBID: '50010600', BEGDA: '20200101', ENDDA: '99991231' },
      { MANDT: '800', PLVAR: '01', OTYPE: 'O', OBJID: '50001400', SUBTY: 'B003', RSIGN: 'B', RELAT: '003', SCLAS: 'S', SOBID: '50010400', BEGDA: '20200101', ENDDA: '99991231' },
      { MANDT: '800', PLVAR: '01', OTYPE: 'O', OBJID: '50001500', SUBTY: 'B003', RSIGN: 'B', RELAT: '003', SCLAS: 'S', SOBID: '50010500', BEGDA: '20200101', ENDDA: '99991231' },

      // Position to Employee Holder (A008: is held by / P)
      { MANDT: '800', PLVAR: '01', OTYPE: 'S', OBJID: '50010001', SUBTY: 'A008', RSIGN: 'A', RELAT: '008', SCLAS: 'P', SOBID: '00100100', BEGDA: '20200101', ENDDA: '99991231' },
      { MANDT: '800', PLVAR: '01', OTYPE: 'S', OBJID: '50010110', SUBTY: 'A008', RSIGN: 'A', RELAT: '008', SCLAS: 'P', SOBID: '00100550', BEGDA: '20200101', ENDDA: '99991231' },
      { MANDT: '800', PLVAR: '01', OTYPE: 'S', OBJID: '50010200', SUBTY: 'A008', RSIGN: 'A', RELAT: '008', SCLAS: 'P', SOBID: '00100204', BEGDA: '20200101', ENDDA: '99991231' },
      { MANDT: '800', PLVAR: '01', OTYPE: 'S', OBJID: '50010210', SUBTY: 'A008', RSIGN: 'A', RELAT: '008', SCLAS: 'P', SOBID: '00100205', BEGDA: '20200101', ENDDA: '99991231' },
      { MANDT: '800', PLVAR: '01', OTYPE: 'S', OBJID: '50010300', SUBTY: 'A008', RSIGN: 'A', RELAT: '008', SCLAS: 'P', SOBID: '00100310', BEGDA: '20200101', ENDDA: '99991231' },
      { MANDT: '800', PLVAR: '01', OTYPE: 'S', OBJID: '50010400', SUBTY: 'A008', RSIGN: 'A', RELAT: '008', SCLAS: 'P', SOBID: '00100201', BEGDA: '20200101', ENDDA: '99991231' },
      { MANDT: '800', PLVAR: '01', OTYPE: 'S', OBJID: '50010500', SUBTY: 'A008', RSIGN: 'A', RELAT: '008', SCLAS: 'P', SOBID: '00100420', BEGDA: '20200101', ENDDA: '99991231' },
      { MANDT: '800', PLVAR: '01', OTYPE: 'S', OBJID: '50010600', SUBTY: 'A008', RSIGN: 'A', RELAT: '008', SCLAS: 'P', SOBID: '00100612', BEGDA: '20200101', ENDDA: '99991231' },
      { MANDT: '800', PLVAR: '01', OTYPE: 'S', OBJID: '50010700', SUBTY: 'A008', RSIGN: 'A', RELAT: '008', SCLAS: 'P', SOBID: '00100780', BEGDA: '20200101', ENDDA: '99991231' }
    ];

    // 27. HR - PA0001 (Infotype 0001: Employee Organizational Assignment)
    this.tableDataStore['PA0001'] = [
      { MANDT: '800', PERNR: '00100100', SUBTY: '0000', OBJPS: '', SPRPS: '', ENDDA: '99991231', BEGDA: '20200101', SEQNR: '000', BUKRS: '1000', WERKS: '1000', BTRTL: '0001', PERSG: '1', PERSK: 'U1', PLANS: '50010001', GSBER: '0001', STELL: '50020001', ORGEH: '50000001', KOSTL: '1100', ENAME: 'Dr. Klaus Weber' },
      { MANDT: '800', PERNR: '00100201', SUBTY: '0000', OBJPS: '', SPRPS: '', ENDDA: '99991231', BEGDA: '20200101', SEQNR: '000', BUKRS: '1000', WERKS: '1000', BTRTL: '0001', PERSG: '1', PERSK: 'U1', PLANS: '50010400', GSBER: '0001', STELL: '50020300', ORGEH: '50001400', KOSTL: '2100', ENAME: 'Elena Rostova' },
      { MANDT: '800', PERNR: '00100204', SUBTY: '0000', OBJPS: '', SPRPS: '', ENDDA: '99991231', BEGDA: '20200101', SEQNR: '000', BUKRS: '1000', WERKS: '1000', BTRTL: '0001', PERSG: '1', PERSK: 'U1', PLANS: '50010200', GSBER: '0001', STELL: '50020100', ORGEH: '50001200', KOSTL: '4110', ENAME: 'Markus Schmidt' },
      { MANDT: '800', PERNR: '00100205', SUBTY: '0000', OBJPS: '', SPRPS: '', ENDDA: '99991231', BEGDA: '20210315', SEQNR: '000', BUKRS: '1000', WERKS: '1000', BTRTL: '0001', PERSG: '1', PERSK: 'U2', PLANS: '50010210', GSBER: '0001', STELL: '50020100', ORGEH: '50001200', KOSTL: '4110', ENAME: 'Robert Chen' },
      { MANDT: '800', PERNR: '00100310', SUBTY: '0000', OBJPS: '', SPRPS: '', ENDDA: '99991231', BEGDA: '20200101', SEQNR: '000', BUKRS: '1000', WERKS: '1000', BTRTL: '0001', PERSG: '1', PERSK: 'U1', PLANS: '50010300', GSBER: '0001', STELL: '50020200', ORGEH: '50001300', KOSTL: '4200', ENAME: 'Hans Gruber' },
      { MANDT: '800', PERNR: '00100420', SUBTY: '0000', OBJPS: '', SPRPS: '', ENDDA: '99991231', BEGDA: '20200101', SEQNR: '000', BUKRS: '1000', WERKS: '1000', BTRTL: '0001', PERSG: '1', PERSK: 'U1', PLANS: '50010500', GSBER: '0001', STELL: '50020400', ORGEH: '50001500', KOSTL: '4300', ENAME: 'Sophie Becker' },
      { MANDT: '800', PERNR: '00100550', SUBTY: '0000', OBJPS: '', SPRPS: '', ENDDA: '99991231', BEGDA: '20200101', SEQNR: '000', BUKRS: '1000', WERKS: '1000', BTRTL: '0001', PERSG: '1', PERSK: 'U1', PLANS: '50010110', GSBER: '0001', STELL: '50020001', ORGEH: '50001100', KOSTL: '1100', ENAME: 'Clara Oswald' },
      { MANDT: '800', PERNR: '00100612', SUBTY: '0000', OBJPS: '', SPRPS: '', ENDDA: '99991231', BEGDA: '20220601', SEQNR: '000', BUKRS: '1000', WERKS: '1000', BTRTL: '0001', PERSG: '2', PERSK: 'C1', PLANS: '50010600', GSBER: '0001', STELL: '50020200', ORGEH: '50001300', KOSTL: '4200', ENAME: 'Jan De Vries' },
      { MANDT: '800', PERNR: '00100780', SUBTY: '0000', OBJPS: '', SPRPS: '', ENDDA: '99991231', BEGDA: '20210901', SEQNR: '000', BUKRS: '1000', WERKS: '1000', BTRTL: '0001', PERSG: '1', PERSK: 'U3', PLANS: '50010700', GSBER: '0001', STELL: '50020100', ORGEH: '50001200', KOSTL: '4110', ENAME: 'Thomas Bauer' }
    ];

    // 28. HR - PA0006 (Infotype 0006: Addresses - Masked)
    this.tableDataStore['PA0006'] = [
      { MANDT: '800', PERNR: '00100100', SUBTY: '1', BEGDA: '20200101', ENDDA: '99991231', STRAS: 'Dietmar-Hopp-Allee 16', ORT01: 'Walldorf', PSTLZ: '69190', LAND1: 'DE', TELNR: '+496227747474' },
      { MANDT: '800', PERNR: '00100201', SUBTY: '1', BEGDA: '20200101', ENDDA: '99991231', STRAS: 'Leopoldstrasse 45', ORT01: 'Munich', PSTLZ: '80802', LAND1: 'DE', TELNR: '+498938200000' },
      { MANDT: '800', PERNR: '00100204', SUBTY: '1', BEGDA: '20200101', ENDDA: '99991231', STRAS: 'Industriestrasse 12', ORT01: 'Stuttgart', PSTLZ: '70178', LAND1: 'DE', TELNR: '+497118110000' },
      { MANDT: '800', PERNR: '00100205', SUBTY: '1', BEGDA: '20210315', ENDDA: '99991231', STRAS: 'Werner-von-Siemens-Strasse 1', ORT01: 'Erlangen', PSTLZ: '91052', LAND1: 'DE', TELNR: '+499131700000' }
    ];

    // 29. HR - T500P (Personnel Areas)
    this.tableDataStore['T500P'] = [
      { MANDT: '800', PERSA: '1000', NAME1: 'Walldorf Headquarters', BUKRS: '1000', MOLGA: '01' },
      { MANDT: '800', PERSA: '1200', NAME1: 'Stuttgart Innovation Plant', BUKRS: '1000', MOLGA: '01' },
      { MANDT: '800', PERSA: '2000', NAME1: 'London Global Logistics', BUKRS: '2000', MOLGA: '08' },
      { MANDT: '800', PERSA: '1710', NAME1: 'New York Commercial Branch', BUKRS: '1710', MOLGA: '10' }
    ];

    // 30. HR - T528T (Position Texts)
    this.tableDataStore['T528T'] = [
      { MANDT: '800', SPRAS: 'E', PLANS: '50010001', ENDDA: '99991231', PLSTX: 'Chief Executive Officer' },
      { MANDT: '800', SPRAS: 'E', PLANS: '50010100', ENDDA: '99991231', PLSTX: 'VP of European Operations' },
      { MANDT: '800', SPRAS: 'E', PLANS: '50010110', ENDDA: '99991231', PLSTX: 'Director of HR & Global Talent' },
      { MANDT: '800', SPRAS: 'E', PLANS: '50010200', ENDDA: '99991231', PLSTX: 'Director of Engineering & Manufacturing' },
      { MANDT: '800', SPRAS: 'E', PLANS: '50010210', ENDDA: '99991231', PLSTX: 'Senior Industrial Systems Engineer' },
      { MANDT: '800', SPRAS: 'E', PLANS: '50010300', ENDDA: '99991231', PLSTX: 'Director of Supply Chain & EWM' },
      { MANDT: '800', SPRAS: 'E', PLANS: '50010400', ENDDA: '99991231', PLSTX: 'Director of Sales & Customer Solutions' },
      { MANDT: '800', SPRAS: 'E', PLANS: '50010500', ENDDA: '99991231', PLSTX: 'Lead Quality Assurance Auditor' },
      { MANDT: '800', SPRAS: 'E', PLANS: '50010600', ENDDA: '99991231', PLSTX: 'Senior Logistics Operations Planner' },
      { MANDT: '800', SPRAS: 'E', PLANS: '50010700', ENDDA: '99991231', PLSTX: 'Precision CNC Machinist Specialist' }
    ];

    // 31. HR - HR_AUDIT_LOG (Immutable HR Access Audit Trail)
    this.tableDataStore['HR_AUDIT_LOG'] = [
      { MANDT: '800', LOG_ID: 'AUD-HR-20260801', TIMESTAMP: '2026-08-19T08:15:20Z', USER_ID: 'AI_HR_AGENT', INTENT_TYPE: 'ORG_STRUCTURE_QUERY', PERNR_TARGET: 'ALL_EU_HQ', INFOTYPE: '1000', PFCG_AUTH_CHECK: 'PLOG (PLVAR=01)', AUTH_RESULT: 'RC=0 (AUTH)', MASKED_FIELDS_COUNT: 0, JUSTIFICATION: 'Corporate organizational hierarchy and department reporting review.' },
      { MANDT: '800', LOG_ID: 'AUD-HR-20260802', TIMESTAMP: '2026-08-19T09:22:11Z', USER_ID: 'AI_HR_AGENT', INTENT_TYPE: 'EMPLOYEE_ASSIGNMENT', PERNR_TARGET: '00100205', INFOTYPE: '0001', PFCG_AUTH_CHECK: 'P_ORGIN (PERSA=1000)', AUTH_RESULT: 'RC=0 (AUTH)', MASKED_FIELDS_COUNT: 3, JUSTIFICATION: 'Verification of engineer plant and cost center assignment.' },
      { MANDT: '800', LOG_ID: 'AUD-HR-20260803', TIMESTAMP: '2026-08-19T10:45:00Z', USER_ID: 'AI_HR_AGENT', INTENT_TYPE: 'WORKFORCE_ANALYTICS', PERNR_TARGET: 'AGGREGATE', INFOTYPE: '0001', PFCG_AUTH_CHECK: 'P_ORGIN (PERSA=1000)', AUTH_RESULT: 'RC=0 (AUTH)', MASKED_FIELDS_COUNT: 0, JUSTIFICATION: 'Headcount and permanent vs contractor demographic analysis.' }
    ];
  }

  /**
   * Add or update an individual live record into a specific table
   */
  public addRecord(tableName: string, record: Record<string, any>) {
    const t = tableName.toUpperCase().trim();
    if (!this.tableDataStore[t]) {
      this.tableDataStore[t] = [];
    }
    this.tableDataStore[t].unshift(record);
  }

  /**
   * Add or update multiple live records into a specific table
   */
  public addRecords(tableName: string, records: Record<string, any>[]) {
    const t = tableName.toUpperCase().trim();
    if (!this.tableDataStore[t]) {
      this.tableDataStore[t] = [];
    }
    this.tableDataStore[t].unshift(...records);
  }

  /**
   * Synchronize live domain entities into the table reader repository
   */
  public syncLiveEntities(
    salesOrders: any[],
    deliveries: any[],
    billings: any[],
    customers: any[]
  ) {
    // Sync VBAK
    this.tableDataStore['VBAK'] = salesOrders.map(so => ({
      MANDT: '800',
      VBELN: so.salesOrder,
      ERDAT: so.orderDate,
      ERNAM: 'AI_AGENT',
      AUART: so.docType,
      NETWR: so.netValue,
      WAERK: so.currency,
      VKORG: so.salesOrg,
      VTWEG: so.distChannel,
      SPART: so.division,
      KUNNR: so.soldToParty,
      BSTNK: so.poNumber,
      VDATU: so.requestedDeliveryDate,
      CMGST: so.creditStatus === 'Blocked' ? 'B' : 'A',
      LIFSK: so.deliveryBlock || '',
      FAKSP: so.billingBlock || '',
      GBSTK: so.status === 'Completed' ? 'C' : so.status === 'In Delivery' ? 'B' : 'A'
    }));

    // Sync VBAP
    this.tableDataStore['VBAP'] = salesOrders.flatMap(so =>
      so.items.map((it: any) => ({
        MANDT: '800',
        VBELN: so.salesOrder,
        POSNR: it.itemNo,
        MATNR: it.material,
        ARKTX: it.materialDescription,
        KWMENG: it.orderQuantity,
        VRKME: it.salesUnit,
        NETWR: it.netValue,
        WAERK: it.currency,
        WERKS: it.plant,
        LGORT: it.storageLocation
      }))
    );

    // Sync VBEP (Schedule lines)
    this.tableDataStore['VBEP'] = salesOrders.flatMap(so =>
      so.items.map((it: any, idx: number) => ({
        MANDT: '800',
        VBELN: so.salesOrder,
        POSNR: it.itemNo,
        ETENR: String(idx + 1).padStart(4, '0'),
        EDATU: so.requestedDeliveryDate,
        WMENG: it.orderQuantity,
        BMENG: it.orderQuantity,
        VRKME: it.salesUnit
      }))
    );

    // Sync KNA1
    this.tableDataStore['KNA1'] = customers.map(c => ({
      MANDT: '800',
      KUNNR: c.customerNo,
      NAME1: c.name,
      SORTL: c.searchTerm,
      STRAS: c.street,
      ORT01: c.city,
      PSTLZ: c.postalCode,
      LAND1: c.country,
      STCD1: 'DE-849201948'
    }));

    // Sync KNVV
    this.tableDataStore['KNVV'] = customers.map(c => ({
      MANDT: '800',
      KUNNR: c.customerNo,
      VKORG: '1000',
      VTWEG: '10',
      SPART: '00',
      KDGRP: '01',
      INCO1: 'FOB',
      INCO2: c.city || 'Frankfurt',
      ZTERM: 'ZB01',
      WAERS: 'EUR'
    }));

    // Sync LIKP
    this.tableDataStore['LIKP'] = deliveries.map(d => ({
      MANDT: '800',
      VBELN: d.deliveryNo,
      LFART: d.deliveryType,
      VSTEL: d.shippingPoint,
      KUNNR: d.shipToParty,
      LFDAT: d.deliveryDate,
      WADAT_IST: d.actualGidate || '',
      BTGEW: d.totalGrossWeight,
      GEWEI: d.weightUnit
    }));

    // Sync LIPS
    this.tableDataStore['LIPS'] = deliveries.flatMap(d =>
      (d.items || []).map((it: any) => ({
        MANDT: '800',
        VBELN: d.deliveryNo,
        POSNR: it.itemNo,
        PSTYV: 'TAN',
        MATNR: it.material,
        ARKTX: it.materialDescription,
        LFIMG: it.deliveredQuantity,
        VRKME: it.salesUnit,
        WERKS: it.plant,
        LGORT: it.storageLocation,
        VGBEL: d.salesOrderNo || '',
        VGPOS: it.itemNo
      }))
    );

    // Sync VBRK
    this.tableDataStore['VBRK'] = billings.map(b => ({
      MANDT: '800',
      VBELN: b.billingDoc,
      FKART: b.billingType,
      FKDAT: b.billingDate,
      KUNRG: b.payer,
      KUNAG: b.soldToParty,
      NETWR: b.netValue,
      MWSBK: b.taxAmount,
      WAERK: b.currency,
      BELNR: b.accountingDocNo
    }));

    // Sync VBRP
    this.tableDataStore['VBRP'] = billings.flatMap(b =>
      (b.items || []).map((it: any) => ({
        MANDT: '800',
        VBELN: b.billingDoc,
        POSNR: it.itemNo,
        FKIMG: it.billedQuantity,
        VRKME: it.salesUnit,
        NETWR: it.netValue,
        MWSBP: it.taxAmount,
        MATNR: it.material,
        ARKTX: it.materialDescription,
        VGBEL: b.deliveryNo || '',
        AUBEL: b.salesOrderNo || ''
      }))
    );

    // Sync VBFA (Document Flow)
    const docFlowRows: any[] = [];
    deliveries.forEach(d => {
      if (d.salesOrderNo) {
        docFlowRows.push({
          MANDT: '800',
          VBELV: d.salesOrderNo,
          POSNV: '000010',
          VBELN: d.deliveryNo,
          POSNN: '000010',
          VBTYP_N: 'J',
          VBTYP_V: 'C',
          RFMNG: d.totalGrossWeight || 10,
          RFWRT: 14500.00,
          WAERS: 'EUR'
        });
      }
    });
    billings.forEach(b => {
      if (b.deliveryNo) {
        docFlowRows.push({
          MANDT: '800',
          VBELV: b.deliveryNo,
          POSNV: '000010',
          VBELN: b.billingDoc,
          POSNN: '000010',
          VBTYP_N: 'M',
          VBTYP_V: 'J',
          RFMNG: 10,
          RFWRT: b.netValue,
          WAERS: b.currency || 'EUR'
        });
      }
      if (b.accountingDocNo) {
        docFlowRows.push({
          MANDT: '800',
          VBELV: b.billingDoc,
          POSNV: '000010',
          VBELN: b.accountingDocNo,
          POSNN: '000001',
          VBTYP_N: 'R',
          VBTYP_V: 'M',
          RFMNG: 10,
          RFWRT: b.netValue,
          WAERS: b.currency || 'EUR'
        });
      }
    });
    if (docFlowRows.length > 0) {
      this.tableDataStore['VBFA'] = docFlowRows;
    }

    // ------------------------------------------------------------------------
    // LIVE CUSTOM Z DATA STORE: ZTM_FREIGHT_LOG & CARRIER INTERFACES
    // ------------------------------------------------------------------------
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(now.getDate() - 1);
    const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

    const twoDaysAgoDate = new Date(now);
    twoDaysAgoDate.setDate(now.getDate() - 2);
    const twoDaysAgoStr = twoDaysAgoDate.toISOString().split('T')[0];

    this.tableDataStore['ZTM_FREIGHT_LOG'] = [
      // Yesterday's Freight Interface Failures (Authentic Carrier Exceptions)
      {
        MANDT: '800',
        MSG_ID: 'MSG-' + yesterdayStr.replace(/-/g, '') + '-0104',
        CARRIER_ID: 'CARRIER_FEDEX',
        DELIVERY_NO: '80000021',
        BOL_NUMBER: 'BOL-884012',
        SHIPMENT_NO: '0000100045',
        STATUS: 'FAILED',
        ERR_CODE: 'ERR_CARRIER_504',
        ERR_TEXT: 'Carrier REST Gateway HTTP 504 Gateway Timeout during EDI 204 tender dispatch to FedEx Priority LTL Gateway',
        PAYLOAD_REF: 'BLOB_TM_2026_0819_0104',
        LOG_DATE: yesterdayStr,
        LOG_TIME: '08:24:15',
        CREATED_BY: 'BATCH_EDI_JOB',
        RETRY_COUNT: 2
      },
      {
        MANDT: '800',
        MSG_ID: 'MSG-' + yesterdayStr.replace(/-/g, '') + '-0218',
        CARRIER_ID: 'CARRIER_XPO',
        DELIVERY_NO: '80000022',
        BOL_NUMBER: 'BOL-884019',
        SHIPMENT_NO: '0000100046',
        STATUS: 'FAILED',
        ERR_CODE: 'ERR_GEO_VALIDATION',
        ERR_TEXT: 'Invalid Destination Postal Code 9021 - Geo-Coordinates Lookup Failed for Carrier Route Dispatching',
        PAYLOAD_REF: 'BLOB_TM_2026_0819_0218',
        LOG_DATE: yesterdayStr,
        LOG_TIME: '10:12:04',
        CREATED_BY: 'BATCH_EDI_JOB',
        RETRY_COUNT: 1
      },
      {
        MANDT: '800',
        MSG_ID: 'MSG-' + yesterdayStr.replace(/-/g, '') + '-0345',
        CARRIER_ID: 'CARRIER_CH_ROBINSON',
        DELIVERY_NO: '80000023',
        BOL_NUMBER: 'BOL-884025',
        SHIPMENT_NO: '0000100047',
        STATUS: 'FAILED',
        ERR_CODE: 'ERR_CONTRACT_EXPIRED',
        ERR_TEXT: 'Carrier Rate Contract CTR-2024-US-LTL expired on 2026-08-01 for lane Plant 1000 -> Midwest DC (Rate table missing)',
        PAYLOAD_REF: 'BLOB_TM_2026_0819_0345',
        LOG_DATE: yesterdayStr,
        LOG_TIME: '13:45:50',
        CREATED_BY: 'USER_SCHEDULER',
        RETRY_COUNT: 3
      },
      {
        MANDT: '800',
        MSG_ID: 'MSG-' + yesterdayStr.replace(/-/g, '') + '-0412',
        CARRIER_ID: 'CARRIER_DHL',
        DELIVERY_NO: '80000024',
        BOL_NUMBER: 'BOL-884031',
        SHIPMENT_NO: '0000100048',
        STATUS: 'FAILED',
        ERR_CODE: 'ERR_HAZMAT_UNCLASSIFIED',
        ERR_TEXT: 'Shipment contains chemical material CHEM-ISO-99 lacking mandatory UN Hazmat Emergency Response Profile (EHS Check)',
        PAYLOAD_REF: 'BLOB_TM_2026_0819_0412',
        LOG_DATE: yesterdayStr,
        LOG_TIME: '15:10:22',
        CREATED_BY: 'BATCH_EDI_JOB',
        RETRY_COUNT: 0
      },
      {
        MANDT: '800',
        MSG_ID: 'MSG-' + yesterdayStr.replace(/-/g, '') + '-0520',
        CARRIER_ID: 'CARRIER_DBS',
        DELIVERY_NO: '80000025',
        BOL_NUMBER: 'BOL-884039',
        SHIPMENT_NO: '0000100049',
        STATUS: 'REJECTED',
        ERR_CODE: 'ERR_CAPACITY_REJECTED',
        ERR_TEXT: 'Carrier EDI 990 Response Code REJ - Equipment/Trailer capacity shortage at Origin Terminal Plant 1000',
        PAYLOAD_REF: 'BLOB_TM_2026_0819_0520',
        LOG_DATE: yesterdayStr,
        LOG_TIME: '17:30:11',
        CREATED_BY: 'EDI_LISTENER',
        RETRY_COUNT: 1
      },
      {
        MANDT: '800',
        MSG_ID: 'MSG-' + yesterdayStr.replace(/-/g, '') + '-0605',
        CARRIER_ID: 'CARRIER_FEDEX',
        DELIVERY_NO: '80000026',
        BOL_NUMBER: 'BOL-884044',
        SHIPMENT_NO: '0000100050',
        STATUS: 'FAILED',
        ERR_CODE: 'ERR_AUTH_EXPIRED',
        ERR_TEXT: 'OAuth2 Bearer Token Expiration (HTTP 401 Unauthorized) against FedEx Dispatch REST Gateway',
        PAYLOAD_REF: 'BLOB_TM_2026_0819_0605',
        LOG_DATE: yesterdayStr,
        LOG_TIME: '19:05:43',
        CREATED_BY: 'BATCH_EDI_JOB',
        RETRY_COUNT: 2
      },
      // Successful transmissions yesterday for accurate baseline calculation
      {
        MANDT: '800',
        MSG_ID: 'MSG-' + yesterdayStr.replace(/-/g, '') + '-0001',
        CARRIER_ID: 'CARRIER_FEDEX',
        DELIVERY_NO: '80000015',
        BOL_NUMBER: 'BOL-883990',
        SHIPMENT_NO: '0000100040',
        STATUS: 'SUCCESS',
        ERR_CODE: '',
        ERR_TEXT: 'EDI 204 Tender Acknowledged (997 Accepted) by FedEx Freight',
        PAYLOAD_REF: 'BLOB_TM_2026_0819_0001',
        LOG_DATE: yesterdayStr,
        LOG_TIME: '06:15:00',
        CREATED_BY: 'BATCH_EDI_JOB',
        RETRY_COUNT: 0
      },
      {
        MANDT: '800',
        MSG_ID: 'MSG-' + yesterdayStr.replace(/-/g, '') + '-0002',
        CARRIER_ID: 'CARRIER_DHL',
        DELIVERY_NO: '80000016',
        BOL_NUMBER: 'BOL-883995',
        SHIPMENT_NO: '0000100041',
        STATUS: 'SUCCESS',
        ERR_CODE: '',
        ERR_TEXT: 'EDI 204 Tender Acknowledged by DHL Global Forwarding',
        PAYLOAD_REF: 'BLOB_TM_2026_0819_0002',
        LOG_DATE: yesterdayStr,
        LOG_TIME: '07:00:12',
        CREATED_BY: 'BATCH_EDI_JOB',
        RETRY_COUNT: 0
      },
      {
        MANDT: '800',
        MSG_ID: 'MSG-' + yesterdayStr.replace(/-/g, '') + '-0003',
        CARRIER_ID: 'CARRIER_CH_ROBINSON',
        DELIVERY_NO: '80000017',
        BOL_NUMBER: 'BOL-884001',
        SHIPMENT_NO: '0000100042',
        STATUS: 'SUCCESS',
        ERR_CODE: '',
        ERR_TEXT: 'EDI 204 Tender Acknowledged by C.H. Robinson',
        PAYLOAD_REF: 'BLOB_TM_2026_0819_0003',
        LOG_DATE: yesterdayStr,
        LOG_TIME: '07:35:44',
        CREATED_BY: 'BATCH_EDI_JOB',
        RETRY_COUNT: 0
      },
      // Today's live freight logs
      {
        MANDT: '800',
        MSG_ID: 'MSG-' + todayStr.replace(/-/g, '') + '-0010',
        CARRIER_ID: 'CARRIER_FEDEX',
        DELIVERY_NO: '80000030',
        BOL_NUMBER: 'BOL-884100',
        SHIPMENT_NO: '0000100055',
        STATUS: 'SUCCESS',
        ERR_CODE: '',
        ERR_TEXT: 'Carrier EDI 204 Tender Accepted (Booking Ref: FDX-99214)',
        PAYLOAD_REF: 'BLOB_TM_TODAY_0010',
        LOG_DATE: todayStr,
        LOG_TIME: '09:00:00',
        CREATED_BY: 'BATCH_EDI_JOB',
        RETRY_COUNT: 0
      },
      {
        MANDT: '800',
        MSG_ID: 'MSG-' + todayStr.replace(/-/g, '') + '-0011',
        CARRIER_ID: 'CARRIER_DHL',
        DELIVERY_NO: '80000031',
        BOL_NUMBER: 'BOL-884105',
        SHIPMENT_NO: '0000100056',
        STATUS: 'FAILED',
        ERR_CODE: 'ERR_SOCKET_TIMEOUT',
        ERR_TEXT: 'Socket timeout 60000ms connecting to DHL REST API endpoint',
        PAYLOAD_REF: 'BLOB_TM_TODAY_0011',
        LOG_DATE: todayStr,
        LOG_TIME: '11:14:20',
        CREATED_BY: 'BATCH_EDI_JOB',
        RETRY_COUNT: 1
      },
      // Previous days logs
      {
        MANDT: '800',
        MSG_ID: 'MSG-' + twoDaysAgoStr.replace(/-/g, '') + '-0001',
        CARRIER_ID: 'CARRIER_FEDEX',
        DELIVERY_NO: '80000010',
        BOL_NUMBER: 'BOL-883900',
        SHIPMENT_NO: '0000100035',
        STATUS: 'SUCCESS',
        ERR_CODE: '',
        ERR_TEXT: 'Transmission Successful',
        PAYLOAD_REF: 'BLOB_TM_PREV_0001',
        LOG_DATE: twoDaysAgoStr,
        LOG_TIME: '08:00:00',
        CREATED_BY: 'BATCH_EDI_JOB',
        RETRY_COUNT: 0
      }
    ];

    this.tableDataStore['ZFREIGHT_ERRORS'] = [
      { MANDT: '800', MSG_ID: 'MSG-' + yesterdayStr.replace(/-/g, '') + '-0104', ERR_TYPE: 'CARRIER_504', RESOLVED_FLAG: '', RESOLVED_BY: '' },
      { MANDT: '800', MSG_ID: 'MSG-' + yesterdayStr.replace(/-/g, '') + '-0218', ERR_TYPE: 'GEO_VALID', RESOLVED_FLAG: '', RESOLVED_BY: '' },
      { MANDT: '800', MSG_ID: 'MSG-' + yesterdayStr.replace(/-/g, '') + '-0345', ERR_TYPE: 'CONTRACT_EXP', RESOLVED_FLAG: '', RESOLVED_BY: '' },
      { MANDT: '800', MSG_ID: 'MSG-' + yesterdayStr.replace(/-/g, '') + '-0412', ERR_TYPE: 'HAZMAT', RESOLVED_FLAG: '', RESOLVED_BY: '' },
      { MANDT: '800', MSG_ID: 'MSG-' + yesterdayStr.replace(/-/g, '') + '-0520', ERR_TYPE: 'CAPACITY', RESOLVED_FLAG: '', RESOLVED_BY: '' },
      { MANDT: '800', MSG_ID: 'MSG-' + yesterdayStr.replace(/-/g, '') + '-0605', ERR_TYPE: 'AUTH_EXPIRED', RESOLVED_FLAG: '', RESOLVED_BY: '' }
    ];

    this.tableDataStore['ZTM_CARRIER_CFG'] = [
      { MANDT: '800', CARRIER_ID: 'CARRIER_FEDEX', API_ENDPOINT: 'https://api.carrier-gateway.corp/fedex/v2/freight/tender', PROTOCOL: 'REST HTTPS', ACTIVE_FLAG: 'X' },
      { MANDT: '800', CARRIER_ID: 'CARRIER_DHL', API_ENDPOINT: 'https://api.carrier-gateway.corp/dhl/edi204', PROTOCOL: 'REST HTTPS', ACTIVE_FLAG: 'X' },
      { MANDT: '800', CARRIER_ID: 'CARRIER_XPO', API_ENDPOINT: 'https://api.carrier-gateway.corp/xpo/dispatch', PROTOCOL: 'REST HTTPS', ACTIVE_FLAG: 'X' },
      { MANDT: '800', CARRIER_ID: 'CARRIER_CH_ROBINSON', API_ENDPOINT: 'as2://as2.chrobinson.com:8443/edi/receive', PROTOCOL: 'AS2', ACTIVE_FLAG: 'X' },
      { MANDT: '800', CARRIER_ID: 'CARRIER_DBS', API_ENDPOINT: 'sftp://edi.dbschenker.com/inbound/204', PROTOCOL: 'SFTP', ACTIVE_FLAG: 'X' }
    ];

    this.tableDataStore['ZPM_MAINT_CHECK'] = [
      { MANDT: '800', AUFNR: '000004000010', SAFETY_PASSED: 'X', SLA_HOURS: 24 },
      { MANDT: '800', AUFNR: '000004000011', SAFETY_PASSED: 'X', SLA_HOURS: 48 },
      { MANDT: '800', AUFNR: '000004000012', SAFETY_PASSED: ' ', SLA_HOURS: 12 }
    ];

    this.tableDataStore['ZSD_CREDIT_LOG'] = [
      { MANDT: '800', VBELN: '0000000010', KUNNR: '0000001000', RISK_SCORE: 15, APPROVAL_STATUS: 'APPROVED' },
      { MANDT: '800', VBELN: '0000000011', KUNNR: '0000001001', RISK_SCORE: 85, APPROVAL_STATUS: 'BLOCKED' }
    ];

    // ------------------------------------------------------------------------
    // IDOC CORE TABLES: EDIDC, EDIDS, EDID4 (Live ALE & EDI Subsystem)
    // ------------------------------------------------------------------------

    // 1. EDIDC (Control Record)
    this.tableDataStore['EDIDC'] = [
      // 19 Live ECC Inbound IDocs from WE02 (Basic Type / Message Type ZMT_FANS)
      {
        MANDT: '800',
        DOCNUM: '0000000002507746',
        STATUS: '51',
        DOCTYP: 'ZMT_FANS',
        DIRECT: '2',
        RCVPRT: 'LS',
        RCVPRN: 'EH7CLNT800',
        RCVPOR: 'ZFPORT_12',
        SNDPRT: 'LS',
        SNDPRN: '/EH7CLNT850',
        SNDPOR: 'ZFPORT_12',
        MESTYP: 'ZMT_FANS',
        IDOCTYP: 'ZMT_FANS',
        CIMTYP: '',
        CREDAT: '2025-12-02',
        CRETIM: '04:06:38',
        SERIAL: '20251202040638',
        EXPRSS: ''
      },
      {
        MANDT: '800',
        DOCNUM: '0000000002507747',
        STATUS: '51',
        DOCTYP: 'ZMT_FANS',
        DIRECT: '2',
        RCVPRT: 'LS',
        RCVPRN: 'EH7CLNT800',
        RCVPOR: 'ZFPORT_12',
        SNDPRT: 'LS',
        SNDPRN: '/EH7CLNT850',
        SNDPOR: 'ZFPORT_12',
        MESTYP: 'ZMT_FANS',
        IDOCTYP: 'ZMT_FANS',
        CIMTYP: '',
        CREDAT: '2025-12-02',
        CRETIM: '04:06:38',
        SERIAL: '20251202040638',
        EXPRSS: ''
      },
      {
        MANDT: '800',
        DOCNUM: '0000000002507748',
        STATUS: '51',
        DOCTYP: 'ZMT_FANS',
        DIRECT: '2',
        RCVPRT: 'LS',
        RCVPRN: 'EH7CLNT800',
        RCVPOR: 'ZFPORT_12',
        SNDPRT: 'LS',
        SNDPRN: '/EH7CLNT850',
        SNDPOR: 'ZFPORT_12',
        MESTYP: 'ZMT_FANS',
        IDOCTYP: 'ZMT_FANS',
        CIMTYP: '',
        CREDAT: '2025-12-02',
        CRETIM: '04:06:38',
        SERIAL: '20251202040638',
        EXPRSS: ''
      },
      {
        MANDT: '800',
        DOCNUM: '0000000002507749',
        STATUS: '51',
        DOCTYP: 'ZMT_FANS',
        DIRECT: '2',
        RCVPRT: 'LS',
        RCVPRN: 'EH7CLNT800',
        RCVPOR: 'ZFPORT_12',
        SNDPRT: 'LS',
        SNDPRN: '/EH7CLNT850',
        SNDPOR: 'ZFPORT_12',
        MESTYP: 'ZMT_FANS',
        IDOCTYP: 'ZMT_FANS',
        CIMTYP: '',
        CREDAT: '2025-12-02',
        CRETIM: '04:06:38',
        SERIAL: '20251202040638',
        EXPRSS: ''
      },
      {
        MANDT: '800',
        DOCNUM: '0000000002507750',
        STATUS: '51',
        DOCTYP: 'ZMT_FANS',
        DIRECT: '2',
        RCVPRT: 'LS',
        RCVPRN: 'EH7CLNT800',
        RCVPOR: 'ZFPORT_12',
        SNDPRT: 'LS',
        SNDPRN: '/EH7CLNT850',
        SNDPOR: 'ZFPORT_12',
        MESTYP: 'ZMT_FANS',
        IDOCTYP: 'ZMT_FANS',
        CIMTYP: '',
        CREDAT: '2025-12-02',
        CRETIM: '04:06:38',
        SERIAL: '20251202040638',
        EXPRSS: ''
      },
      {
        MANDT: '800',
        DOCNUM: '0000000002507751',
        STATUS: '51',
        DOCTYP: 'ZMT_FANS',
        DIRECT: '2',
        RCVPRT: 'LS',
        RCVPRN: 'EH7CLNT800',
        RCVPOR: 'ZFPORT_12',
        SNDPRT: 'LS',
        SNDPRN: '/EH7CLNT850',
        SNDPOR: 'ZFPORT_12',
        MESTYP: 'ZMT_FANS',
        IDOCTYP: 'ZMT_FANS',
        CIMTYP: '',
        CREDAT: '2025-12-02',
        CRETIM: '04:06:38',
        SERIAL: '20251202040638',
        EXPRSS: ''
      },
      {
        MANDT: '800',
        DOCNUM: '0000000002507752',
        STATUS: '51',
        DOCTYP: 'ZMT_FANS',
        DIRECT: '2',
        RCVPRT: 'LS',
        RCVPRN: 'EH7CLNT800',
        RCVPOR: 'ZFPORT_12',
        SNDPRT: 'LS',
        SNDPRN: '/EH7CLNT850',
        SNDPOR: 'ZFPORT_12',
        MESTYP: 'ZMT_FANS',
        IDOCTYP: 'ZMT_FANS',
        CIMTYP: '',
        CREDAT: '2025-12-02',
        CRETIM: '04:06:38',
        SERIAL: '20251202040638',
        EXPRSS: ''
      },
      {
        MANDT: '800',
        DOCNUM: '0000000002507753',
        STATUS: '51',
        DOCTYP: 'ZMT_FANS',
        DIRECT: '2',
        RCVPRT: 'LS',
        RCVPRN: 'EH7CLNT800',
        RCVPOR: 'ZFPORT_12',
        SNDPRT: 'LS',
        SNDPRN: '/EH7CLNT850',
        SNDPOR: 'ZFPORT_12',
        MESTYP: 'ZMT_FANS',
        IDOCTYP: 'ZMT_FANS',
        CIMTYP: '',
        CREDAT: '2025-12-02',
        CRETIM: '04:06:38',
        SERIAL: '20251202040638',
        EXPRSS: ''
      },
      {
        MANDT: '800',
        DOCNUM: '0000000002507754',
        STATUS: '51',
        DOCTYP: 'ZMT_FANS',
        DIRECT: '2',
        RCVPRT: 'LS',
        RCVPRN: 'EH7CLNT800',
        RCVPOR: 'ZFPORT_12',
        SNDPRT: 'LS',
        SNDPRN: '/EH7CLNT850',
        SNDPOR: 'ZFPORT_12',
        MESTYP: 'ZMT_FANS',
        IDOCTYP: 'ZMT_FANS',
        CIMTYP: '',
        CREDAT: '2025-12-02',
        CRETIM: '04:06:38',
        SERIAL: '20251202040638',
        EXPRSS: ''
      },
      {
        MANDT: '800',
        DOCNUM: '0000000002507755',
        STATUS: '51',
        DOCTYP: 'ZMT_FANS',
        DIRECT: '2',
        RCVPRT: 'LS',
        RCVPRN: 'EH7CLNT800',
        RCVPOR: 'ZFPORT_12',
        SNDPRT: 'LS',
        SNDPRN: '/EH7CLNT850',
        SNDPOR: 'ZFPORT_12',
        MESTYP: 'ZMT_FANS',
        IDOCTYP: 'ZMT_FANS',
        CIMTYP: '',
        CREDAT: '2025-12-02',
        CRETIM: '04:06:38',
        SERIAL: '20251202040638',
        EXPRSS: ''
      },
      {
        MANDT: '800',
        DOCNUM: '0000000002507756',
        STATUS: '51',
        DOCTYP: 'ZMT_FANS',
        DIRECT: '2',
        RCVPRT: 'LS',
        RCVPRN: 'EH7CLNT800',
        RCVPOR: 'ZFPORT_12',
        SNDPRT: 'LS',
        SNDPRN: '/EH7CLNT850',
        SNDPOR: 'ZFPORT_12',
        MESTYP: 'ZMT_FANS',
        IDOCTYP: 'ZMT_FANS',
        CIMTYP: '',
        CREDAT: '2025-12-02',
        CRETIM: '04:11:59',
        SERIAL: '20251202041159',
        EXPRSS: ''
      },
      {
        MANDT: '800',
        DOCNUM: '0000000002507757',
        STATUS: '51',
        DOCTYP: 'ZMT_FANS',
        DIRECT: '2',
        RCVPRT: 'LS',
        RCVPRN: 'EH7CLNT800',
        RCVPOR: 'ZFPORT_12',
        SNDPRT: 'LS',
        SNDPRN: '/EH7CLNT850',
        SNDPOR: 'ZFPORT_12',
        MESTYP: 'ZMT_FANS',
        IDOCTYP: 'ZMT_FANS',
        CIMTYP: '',
        CREDAT: '2025-12-02',
        CRETIM: '04:11:59',
        SERIAL: '20251202041159',
        EXPRSS: ''
      },
      {
        MANDT: '800',
        DOCNUM: '0000000002507758',
        STATUS: '51',
        DOCTYP: 'ZMT_FANS',
        DIRECT: '2',
        RCVPRT: 'LS',
        RCVPRN: 'EH7CLNT800',
        RCVPOR: 'ZFPORT_12',
        SNDPRT: 'LS',
        SNDPRN: '/EH7CLNT850',
        SNDPOR: 'ZFPORT_12',
        MESTYP: 'ZMT_FANS',
        IDOCTYP: 'ZMT_FANS',
        CIMTYP: '',
        CREDAT: '2025-12-02',
        CRETIM: '04:11:59',
        SERIAL: '20251202041159',
        EXPRSS: ''
      },
      {
        MANDT: '800',
        DOCNUM: '0000000002507759',
        STATUS: '51',
        DOCTYP: 'ZMT_FANS',
        DIRECT: '2',
        RCVPRT: 'LS',
        RCVPRN: 'EH7CLNT800',
        RCVPOR: 'ZFPORT_12',
        SNDPRT: 'LS',
        SNDPRN: '/EH7CLNT850',
        SNDPOR: 'ZFPORT_12',
        MESTYP: 'ZMT_FANS',
        IDOCTYP: 'ZMT_FANS',
        CIMTYP: '',
        CREDAT: '2025-12-02',
        CRETIM: '04:11:59',
        SERIAL: '20251202041159',
        EXPRSS: ''
      },
      {
        MANDT: '800',
        DOCNUM: '0000000002507760',
        STATUS: '51',
        DOCTYP: 'ZMT_FANS',
        DIRECT: '2',
        RCVPRT: 'LS',
        RCVPRN: 'EH7CLNT800',
        RCVPOR: 'ZFPORT_12',
        SNDPRT: 'LS',
        SNDPRN: '/EH7CLNT850',
        SNDPOR: 'ZFPORT_12',
        MESTYP: 'ZMT_FANS',
        IDOCTYP: 'ZMT_FANS',
        CIMTYP: '',
        CREDAT: '2025-12-02',
        CRETIM: '04:12:00',
        SERIAL: '20251202041200',
        EXPRSS: ''
      },
      {
        MANDT: '800',
        DOCNUM: '0000000002507761',
        STATUS: '51',
        DOCTYP: 'ZMT_FANS',
        DIRECT: '2',
        RCVPRT: 'LS',
        RCVPRN: 'EH7CLNT800',
        RCVPOR: 'ZFPORT_12',
        SNDPRT: 'LS',
        SNDPRN: '/EH7CLNT850',
        SNDPOR: 'ZFPORT_12',
        MESTYP: 'ZMT_FANS',
        IDOCTYP: 'ZMT_FANS',
        CIMTYP: '',
        CREDAT: '2025-12-02',
        CRETIM: '04:12:00',
        SERIAL: '20251202041200',
        EXPRSS: ''
      },
      {
        MANDT: '800',
        DOCNUM: '0000000002507762',
        STATUS: '51',
        DOCTYP: 'ZMT_FANS',
        DIRECT: '2',
        RCVPRT: 'LS',
        RCVPRN: 'EH7CLNT800',
        RCVPOR: 'ZFPORT_12',
        SNDPRT: 'LS',
        SNDPRN: '/EH7CLNT850',
        SNDPOR: 'ZFPORT_12',
        MESTYP: 'ZMT_FANS',
        IDOCTYP: 'ZMT_FANS',
        CIMTYP: '',
        CREDAT: '2025-12-02',
        CRETIM: '04:12:00',
        SERIAL: '20251202041200',
        EXPRSS: ''
      },
      {
        MANDT: '800',
        DOCNUM: '0000000002507763',
        STATUS: '51',
        DOCTYP: 'ZMT_FANS',
        DIRECT: '2',
        RCVPRT: 'LS',
        RCVPRN: 'EH7CLNT800',
        RCVPOR: 'ZFPORT_12',
        SNDPRT: 'LS',
        SNDPRN: '/EH7CLNT850',
        SNDPOR: 'ZFPORT_12',
        MESTYP: 'ZMT_FANS',
        IDOCTYP: 'ZMT_FANS',
        CIMTYP: '',
        CREDAT: '2025-12-02',
        CRETIM: '04:12:00',
        SERIAL: '20251202041200',
        EXPRSS: ''
      },
      {
        MANDT: '800',
        DOCNUM: '0000000002507764',
        STATUS: '51',
        DOCTYP: 'ZMT_FANS',
        DIRECT: '2',
        RCVPRT: 'LS',
        RCVPRN: 'EH7CLNT800',
        RCVPOR: 'ZFPORT_12',
        SNDPRT: 'LS',
        SNDPRN: '/EH7CLNT850',
        SNDPOR: 'ZFPORT_12',
        MESTYP: 'ZMT_FANS',
        IDOCTYP: 'ZMT_FANS',
        CIMTYP: '',
        CREDAT: '2025-12-02',
        CRETIM: '04:12:00',
        SERIAL: '20251202041200',
        EXPRSS: ''
      },
      {
        MANDT: '800',
        DOCNUM: '0000000000021044',
        STATUS: '51',
        DOCTYP: 'INTERNAL_ORDER01',
        DIRECT: '2',
        RCVPRT: 'LS',
        RCVPRN: 'EH7CLNT800',
        RCVPOR: 'SAP_ALE',
        SNDPRT: 'LS',
        SNDPRN: 'CPI_INT_01',
        SNDPOR: 'CPI_PORT',
        MESTYP: 'INTERNAL_ORDER',
        IDOCTYP: 'INTERNAL_ORDER01',
        CIMTYP: '',
        CREDAT: '2026-08-20',
        CRETIM: '09:15:33',
        SERIAL: '20260820091533',
        EXPRSS: ''
      },
      {
        MANDT: '800',
        DOCNUM: '0000000000001012',
        STATUS: '51',
        DOCTYP: 'INTERNAL_ORDER01',
        DIRECT: '2',
        RCVPRT: 'LS',
        RCVPRN: 'S4HCLNT100',
        RCVPOR: 'SAP_ALE',
        SNDPRT: 'LS',
        SNDPRN: 'S4LOCAL',
        SNDPOR: 'SAPS4H',
        MESTYP: 'INTERNAL_ORDER',
        IDOCTYP: 'INTERNAL_ORDER01',
        CIMTYP: '',
        CREDAT: '2026-08-20',
        CRETIM: '16:44:42',
        SERIAL: '20260820164442',
        EXPRSS: ''
      },
      {
        MANDT: '800',
        DOCNUM: '0000000010045211',
        STATUS: '51',
        DOCTYP: 'ORDERS05',
        DIRECT: '2',
        RCVPRT: 'LS',
        RCVPRN: 'S4HCLNT100',
        RCVPOR: 'SAP_ALE',
        SNDPRT: 'KU',
        SNDPRN: '0000100100',
        SNDPOR: 'EDI_EXT',
        MESTYP: 'ORDERS',
        IDOCTYP: 'ORDERS05',
        CIMTYP: '',
        CREDAT: '2026-08-20',
        CRETIM: '08:30:12',
        SERIAL: '20260820083012',
        EXPRSS: ''
      },
      {
        MANDT: '800',
        DOCNUM: '0000000000055004',
        STATUS: '51',
        DOCTYP: 'INTERNAL_ORDER01',
        DIRECT: '2',
        RCVPRT: 'LS',
        RCVPRN: 'S4HCLNT100',
        RCVPOR: 'SAP_ALE',
        SNDPRT: 'LS',
        SNDPRN: 'EXT_SYS_01',
        SNDPOR: 'CPI_PORT',
        MESTYP: 'INTERNAL_ORDER',
        IDOCTYP: 'INTERNAL_ORDER01',
        CIMTYP: '',
        CREDAT: '2026-08-19',
        CRETIM: '14:22:10',
        SERIAL: '20260819142210',
        EXPRSS: ''
      },
      {
        MANDT: '800',
        DOCNUM: '0000000000003002',
        STATUS: '51',
        DOCTYP: 'ORDERS05',
        DIRECT: '2',
        RCVPRT: 'LS',
        RCVPRN: 'S4HCLNT100',
        RCVPOR: 'SAP_ALE',
        SNDPRT: 'KU',
        SNDPRN: '0000100105',
        SNDPOR: 'EDI_EXT',
        MESTYP: 'ORDERS',
        IDOCTYP: 'ORDERS05',
        CIMTYP: '',
        CREDAT: '2026-08-19',
        CRETIM: '11:15:00',
        SERIAL: '20260819111500',
        EXPRSS: ''
      },
      {
        MANDT: '800',
        DOCNUM: '0000000000001002',
        STATUS: '51',
        DOCTYP: 'INTERNAL_ORDER01',
        DIRECT: '2',
        RCVPRT: 'LS',
        RCVPRN: 'S4HCLNT100',
        RCVPOR: 'SAP_ALE',
        SNDPRT: 'LS',
        SNDPRN: 'S4LOCAL',
        SNDPOR: 'SAPS4H',
        MESTYP: 'INTERNAL_ORDER',
        IDOCTYP: 'INTERNAL_ORDER01',
        CIMTYP: '',
        CREDAT: '2026-08-20',
        CRETIM: '10:56:22',
        SERIAL: '20260820105622',
        EXPRSS: ''
      },
      {
        MANDT: '800',
        DOCNUM: '0000000000056001',
        STATUS: '02',
        DOCTYP: 'INTERNAL_ORDER01',
        DIRECT: '1',
        RCVPRT: 'LS',
        RCVPRN: 'S4LOCAL',
        RCVPOR: 'A000000002',
        SNDPRT: 'LS',
        SNDPRN: 'S4HCLNT100',
        SNDPOR: 'SAPS4H',
        MESTYP: 'INTERNAL_ORDER',
        IDOCTYP: 'INTERNAL_ORDER01',
        CIMTYP: '',
        CREDAT: '2026-08-20',
        CRETIM: '11:40:15',
        SERIAL: '20260820114015',
        EXPRSS: ''
      },
      {
        MANDT: '800',
        DOCNUM: '0000000000056019',
        STATUS: '02',
        DOCTYP: 'INTERNAL_ORDER01',
        DIRECT: '1',
        RCVPRT: 'LS',
        RCVPRN: 'S4LOCAL',
        RCVPOR: 'A000000002',
        SNDPRT: 'LS',
        SNDPRN: 'S4HCLNT100',
        SNDPOR: 'SAPS4H',
        MESTYP: 'INTERNAL_ORDER',
        IDOCTYP: 'INTERNAL_ORDER01',
        CIMTYP: '',
        CREDAT: '2026-08-20',
        CRETIM: '15:20:00',
        SERIAL: '20260820152000',
        EXPRSS: ''
      },
      {
        MANDT: '800',
        DOCNUM: '0000000000057026',
        STATUS: '02',
        DOCTYP: 'INTERNAL_ORDER01',
        DIRECT: '1',
        RCVPRT: 'LS',
        RCVPRN: 'S4LOCAL',
        RCVPOR: 'A000000002',
        SNDPRT: 'LS',
        SNDPRN: 'S4HCLNT100',
        SNDPOR: 'SAPS4H',
        MESTYP: 'INTERNAL_ORDER',
        IDOCTYP: 'INTERNAL_ORDER01',
        CIMTYP: '',
        CREDAT: '2026-08-20',
        CRETIM: '17:05:44',
        SERIAL: '20260820170544',
        EXPRSS: ''
      },
      {
        MANDT: '800',
        DOCNUM: '0000000000036007',
        STATUS: '68',
        DOCTYP: 'DELVRY03',
        DIRECT: '2',
        RCVPRT: 'LS',
        RCVPRN: 'S4HCLNT100',
        RCVPOR: 'SAP_ALE',
        SNDPRT: 'LI',
        SNDPRN: '0000100050',
        SNDPOR: 'EDI_EXT',
        MESTYP: 'DESADV',
        IDOCTYP: 'DELVRY03',
        CIMTYP: '',
        CREDAT: '2026-08-20',
        CRETIM: '13:10:00',
        SERIAL: '20260820131000',
        EXPRSS: ''
      },
      {
        MANDT: '800',
        DOCNUM: '0000000000001014',
        STATUS: '53',
        DOCTYP: 'INTERNAL_ORDER01',
        DIRECT: '2',
        RCVPRT: 'LS',
        RCVPRN: 'S4HCLNT100',
        RCVPOR: 'SAP_ALE',
        SNDPRT: 'LS',
        SNDPRN: 'S4LOCAL',
        SNDPOR: 'SAPS4H',
        MESTYP: 'INTERNAL_ORDER',
        IDOCTYP: 'INTERNAL_ORDER01',
        CIMTYP: '',
        CREDAT: '2026-08-20',
        CRETIM: '14:57:54',
        SERIAL: '20260820145754',
        EXPRSS: ''
      },
      {
        MANDT: '800',
        DOCNUM: '0000000000001016',
        STATUS: '53',
        DOCTYP: 'INTERNAL_ORDER01',
        DIRECT: '2',
        RCVPRT: 'LS',
        RCVPRN: 'S4HCLNT100',
        RCVPOR: 'SAP_ALE',
        SNDPRT: 'LS',
        SNDPRN: 'S4LOCAL',
        SNDPOR: 'SAPS4H',
        MESTYP: 'INTERNAL_ORDER',
        IDOCTYP: 'INTERNAL_ORDER01',
        CIMTYP: '',
        CREDAT: '2026-08-20',
        CRETIM: '16:09:34',
        SERIAL: '20260820160934',
        EXPRSS: ''
      },
      {
        MANDT: '800',
        DOCNUM: '0000000000001018',
        STATUS: '53',
        DOCTYP: 'INTERNAL_ORDER01',
        DIRECT: '2',
        RCVPRT: 'LS',
        RCVPRN: 'S4HCLNT100',
        RCVPOR: 'SAP_ALE',
        SNDPRT: 'LS',
        SNDPRN: 'S4LOCAL',
        SNDPOR: 'SAPS4H',
        MESTYP: 'INTERNAL_ORDER',
        IDOCTYP: 'INTERNAL_ORDER01',
        CIMTYP: '',
        CREDAT: '2026-08-20',
        CRETIM: '16:47:20',
        SERIAL: '20260820164720',
        EXPRSS: ''
      },
      {
        MANDT: '800',
        DOCNUM: '0000000000001011',
        STATUS: '03',
        DOCTYP: 'INTERNAL_ORDER01',
        DIRECT: '1',
        RCVPRT: 'LS',
        RCVPRN: 'S4LOCAL',
        RCVPOR: 'A000000002',
        SNDPRT: 'LS',
        SNDPRN: 'S4HCLNT100',
        SNDPOR: 'SAPS4H',
        MESTYP: 'INTERNAL_ORDER',
        IDOCTYP: 'INTERNAL_ORDER01',
        CIMTYP: '',
        CREDAT: '2026-08-20',
        CRETIM: '16:44:42',
        SERIAL: '20260820164442',
        EXPRSS: ''
      }
    ];

    // 2. EDIDS (Status Records)
    this.tableDataStore['EDIDS'] = [
      // Status records for 19 Live ECC Inbound IDocs (0000000002507746 to 0000000002507764)
      ...[
        '0000000002507746', '0000000002507747', '0000000002507748', '0000000002507749',
        '0000000002507750', '0000000002507751', '0000000002507752', '0000000002507753',
        '0000000002507754', '0000000002507755', '0000000002507756', '0000000002507757',
        '0000000002507758', '0000000002507759', '0000000002507760', '0000000002507761',
        '0000000002507762', '0000000002507763', '0000000002507764'
      ].flatMap(docNum => {
        const time = (docNum <= '0000000002507755') ? '04:06:38' : (docNum <= '0000000002507759' ? '04:11:59' : '04:12:00');
        return [
          {
            MANDT: '800',
            DOCNUM: docNum,
            LOGDAT: '2025-12-02',
            LOGTIM: time,
            COUNTR: '0001',
            STATUS: '50',
            STAMOD: '',
            STAMAC: 'B1',
            STAMNO: '001',
            STATXT: 'IDoc received via Port ZFPORT_12 from partner /EH7CLNT850',
            STAPA1: 'ZFPORT_12',
            STAPA2: '/EH7CLNT850',
            STAPA3: '',
            STAPA4: '',
            UNAME: 'AI_AGENT_RW',
            REPID: 'IDOC_INBOUND_ASYNCHRONOUS'
          },
          {
            MANDT: '800',
            DOCNUM: docNum,
            LOGDAT: '2025-12-02',
            LOGTIM: time,
            COUNTR: '0002',
            STATUS: '64',
            STAMOD: '',
            STAMAC: 'B1',
            STAMNO: '040',
            STATXT: 'IDoc ready to be passed to application',
            STAPA1: '',
            STAPA2: '',
            STAPA3: '',
            STAPA4: '',
            UNAME: 'AI_AGENT_RW',
            REPID: 'RBDAPP01'
          },
          {
            MANDT: '800',
            DOCNUM: docNum,
            LOGDAT: '2025-12-02',
            LOGTIM: time,
            COUNTR: '0003',
            STATUS: '51',
            STAMOD: 'E',
            STAMAC: 'ZSD',
            STAMNO: '001',
            STATXT: 'Application document not posted - Error in function module IDOC_INPUT_ZMT_FANS: Mandatory customer reference / material mapping missing in ECC Client 800',
            STAPA1: 'ZMT_FANS',
            STAPA2: '/EH7CLNT850',
            STAPA3: 'ZFPORT_12',
            STAPA4: '',
            UNAME: 'AI_AGENT_RW',
            REPID: 'IDOC_INPUT_ZMT_FANS'
          }
        ];
      }),
      // 0000000000021044
      {
        MANDT: '800',
        DOCNUM: '0000000000021044',
        LOGDAT: '2026-08-20',
        LOGTIM: '09:15:33',
        COUNTR: '0001',
        STATUS: '50',
        STAMOD: '',
        STAMAC: 'B1',
        STAMNO: '001',
        STATXT: 'IDoc received from middleware (CPI)',
        STAPA1: 'CPI_INT_01',
        STAPA2: '',
        STAPA3: '',
        STAPA4: '',
        UNAME: 'SYSTEM',
        REPID: 'IDOC_INBOUND_ASYNCHRONOUS'
      },
      {
        MANDT: '800',
        DOCNUM: '0000000000021044',
        LOGDAT: '2026-08-20',
        LOGTIM: '09:15:34',
        COUNTR: '0002',
        STATUS: '64',
        STAMOD: '',
        STAMAC: 'B1',
        STAMNO: '040',
        STATXT: 'IDoc ready to be passed to application',
        STAPA1: '',
        STAPA2: '',
        STAPA3: '',
        STAPA4: '',
        UNAME: 'SYSTEM',
        REPID: 'RBDAPP01'
      },
      {
        MANDT: '800',
        DOCNUM: '0000000000021044',
        LOGDAT: '2026-08-20',
        LOGTIM: '09:15:35',
        COUNTR: '0003',
        STATUS: '51',
        STAMOD: 'E',
        STAMAC: 'CO',
        STAMNO: '003',
        STATXT: 'Application document not posted - G/L Account 410000 requires valid cost center assignment under corporate segment 1000',
        STAPA1: '410000',
        STAPA2: '1000',
        STAPA3: 'KOSTL',
        STAPA4: '',
        UNAME: 'WF-BATCH',
        REPID: 'RBDMANI2'
      },

      // 0000000000001012
      {
        MANDT: '800',
        DOCNUM: '0000000000001012',
        LOGDAT: '2026-08-20',
        LOGTIM: '16:44:42',
        COUNTR: '0001',
        STATUS: '50',
        STAMOD: '',
        STAMAC: 'B1',
        STAMNO: '001',
        STATXT: 'IDoc received from middleware (CPI)',
        STAPA1: 'S4LOCAL',
        STAPA2: '',
        STAPA3: '',
        STAPA4: '',
        UNAME: 'SYSTEM',
        REPID: 'IDOC_INBOUND_ASYNCHRONOUS'
      },
      {
        MANDT: '800',
        DOCNUM: '0000000000001012',
        LOGDAT: '2026-08-20',
        LOGTIM: '16:44:43',
        COUNTR: '0002',
        STATUS: '51',
        STAMOD: 'E',
        STAMAC: 'J_1B',
        STAMNO: '051',
        STATXT: 'Application document not posted - Mandatory field RESPCCTR in segment E1BP2075_MASTERDATA_ALE is empty',
        STAPA1: 'E1BP2075_MASTERDATA_ALE',
        STAPA2: 'RESPCCTR',
        STAPA3: '410000',
        STAPA4: '',
        UNAME: 'WF-BATCH',
        REPID: 'RBDMANI2'
      },

      // 0000000010045211
      {
        MANDT: '800',
        DOCNUM: '0000000010045211',
        LOGDAT: '2026-08-20',
        LOGTIM: '08:30:12',
        COUNTR: '0001',
        STATUS: '50',
        STAMOD: '',
        STAMAC: 'B1',
        STAMNO: '001',
        STATXT: 'IDoc received from EDI subsystem',
        STAPA1: '0000100100',
        STAPA2: '',
        STAPA3: '',
        STAPA4: '',
        UNAME: 'SYSTEM',
        REPID: 'IDOC_INBOUND_ASYNCHRONOUS'
      },
      {
        MANDT: '800',
        DOCNUM: '0000000010045211',
        LOGDAT: '2026-08-20',
        LOGTIM: '08:30:15',
        COUNTR: '0002',
        STATUS: '51',
        STAMOD: 'E',
        STAMAC: 'VG',
        STAMNO: '204',
        STATXT: 'Application document not posted - Material category blank / supplier key "AltParts" could not be resolved to MAT-A01',
        STAPA1: 'AltParts',
        STAPA2: 'MAT-A01',
        STAPA3: '',
        STAPA4: '',
        UNAME: 'WF-BATCH',
        REPID: 'RBDMANI2'
      },

      // 0000000000055004
      {
        MANDT: '800',
        DOCNUM: '0000000000055004',
        LOGDAT: '2026-08-19',
        LOGTIM: '14:22:10',
        COUNTR: '0001',
        STATUS: '51',
        STAMOD: 'E',
        STAMAC: 'B1',
        STAMNO: '130',
        STATXT: 'Master system of distributed order 600440 either not correct, or not maintained in BD64 ALE distribution model',
        STAPA1: '600440',
        STAPA2: '',
        STAPA3: '',
        STAPA4: '',
        UNAME: 'WF-BATCH',
        REPID: 'RBDMANI2'
      },

      // 0000000000003002
      {
        MANDT: '800',
        DOCNUM: '0000000000003002',
        LOGDAT: '2026-08-19',
        LOGTIM: '11:15:00',
        COUNTR: '0001',
        STATUS: '51',
        STAMOD: 'E',
        STAMAC: 'B1',
        STAMNO: '130',
        STATXT: 'Master system of distributed order 500120 either not correct, or not maintained in BD64 ALE distribution model',
        STAPA1: '500120',
        STAPA2: '',
        STAPA3: '',
        STAPA4: '',
        UNAME: 'WF-BATCH',
        REPID: 'RBDMANI2'
      },

      // 0000000000001002
      {
        MANDT: '800',
        DOCNUM: '0000000000001002',
        LOGDAT: '2026-08-20',
        LOGTIM: '10:56:22',
        COUNTR: '0001',
        STATUS: '51',
        STAMOD: 'E',
        STAMAC: 'B1',
        STAMNO: '130',
        STATXT: 'Master system of distributed order 60080 either not correct, or not maintained in BD64 ALE distribution model',
        STAPA1: '60080',
        STAPA2: '',
        STAPA3: '',
        STAPA4: '',
        UNAME: 'WF-BATCH',
        REPID: 'RBDMANI2'
      },

      // 0000000000056001
      {
        MANDT: '800',
        DOCNUM: '0000000000056001',
        LOGDAT: '2026-08-20',
        LOGTIM: '11:40:15',
        COUNTR: '0001',
        STATUS: '01',
        STAMOD: '',
        STAMAC: 'B1',
        STAMNO: '001',
        STATXT: 'IDoc generated for outbound dispatch',
        STAPA1: '',
        STAPA2: '',
        STAPA3: '',
        STAPA4: '',
        UNAME: 'STUDENT069',
        REPID: 'RSEOUT00'
      },
      {
        MANDT: '800',
        DOCNUM: '0000000000056001',
        LOGDAT: '2026-08-20',
        LOGTIM: '11:40:18',
        COUNTR: '0002',
        STATUS: '02',
        STAMOD: 'E',
        STAMAC: 'EA',
        STAMNO: '082',
        STATXT: 'Error passing data to port - RFC link failure (SM59 Destination S4LOCAL_RFC offline or connection refused)',
        STAPA1: 'A000000002',
        STAPA2: 'S4LOCAL_RFC',
        STAPA3: '',
        STAPA4: '',
        UNAME: 'SYSTEM',
        REPID: 'RSEOUT00'
      },

      // 0000000000056019
      {
        MANDT: '800',
        DOCNUM: '0000000000056019',
        LOGDAT: '2026-08-20',
        LOGTIM: '15:20:00',
        COUNTR: '0001',
        STATUS: '02',
        STAMOD: 'E',
        STAMAC: 'EA',
        STAMNO: '082',
        STATXT: 'Error passing data to port - RFC destination S4LOCAL_RFC not reachable',
        STAPA1: 'A000000002',
        STAPA2: 'S4LOCAL_RFC',
        STAPA3: '',
        STAPA4: '',
        UNAME: 'SYSTEM',
        REPID: 'RSEOUT00'
      },

      // 0000000000057026
      {
        MANDT: '800',
        DOCNUM: '0000000000057026',
        LOGDAT: '2026-08-20',
        LOGTIM: '17:05:44',
        COUNTR: '0001',
        STATUS: '02',
        STAMOD: 'E',
        STAMAC: 'EA',
        STAMNO: '082',
        STATXT: 'Error passing data to port - RFC destination S4LOCAL_RFC connection timed out',
        STAPA1: 'A000000002',
        STAPA2: 'S4LOCAL_RFC',
        STAPA3: '',
        STAPA4: '',
        UNAME: 'SYSTEM',
        REPID: 'RSEOUT00'
      },

      // 0000000000001014 (Posted)
      {
        MANDT: '800',
        DOCNUM: '0000000000001014',
        LOGDAT: '2026-08-20',
        LOGTIM: '14:57:54',
        COUNTR: '0001',
        STATUS: '53',
        STAMOD: 'S',
        STAMAC: 'B1',
        STAMNO: '053',
        STATXT: 'Application document posted successfully (Internal Order 600001)',
        STAPA1: '600001',
        STAPA2: '',
        STAPA3: '',
        STAPA4: '',
        UNAME: 'WF-BATCH',
        REPID: 'RBDAPP01'
      }
    ];

    // 3. EDID4 (Data Records / Segments)
    this.tableDataStore['EDID4'] = [
      // 19 Live ECC Inbound IDocs Segments (Z1MT_FANS)
      ...[
        '0000000002507746', '0000000002507747', '0000000002507748', '0000000002507749',
        '0000000002507750', '0000000002507751', '0000000002507752', '0000000002507753',
        '0000000002507754', '0000000002507755', '0000000002507756', '0000000002507757',
        '0000000002507758', '0000000002507759', '0000000002507760', '0000000002507761',
        '0000000002507762', '0000000002507763', '0000000002507764'
      ].map((docNum, idx) => ({
        MANDT: '800',
        DOCNUM: docNum,
        SEGNUM: 1,
        SEGNAM: 'Z1MT_FANS',
        PSGNUM: 0,
        HLEVEL: 1,
        SDATA: `FAN_ID:FAN-${1000 + idx}|MODEL:DVK-100|SERIAL:SN-998${idx}|QTY:10|WERKS:1000|CUST_REF:REF-ECC-${docNum.slice(-4)}`,
        DTYP: 'Z1MT_FANS'
      })),
      // 0000000000021044 Segments
      {
        MANDT: '800',
        DOCNUM: '0000000000021044',
        SEGNUM: 1,
        SEGNAM: 'E1EDK01',
        PSGNUM: 0,
        HLEVEL: 1,
        SDATA: 'CURCY:USD|HWAER:USD|BELNR:21044|BSART:ORDR',
        DTYP: 'E1EDK01'
      },
      {
        MANDT: '800',
        DOCNUM: '0000000000021044',
        SEGNUM: 2,
        SEGNAM: 'E1EDK14',
        PSGNUM: 1,
        HLEVEL: 2,
        SDATA: 'QUALF:012|ORGID:1000|SEGMENT:1000',
        DTYP: 'E1EDK14'
      },
      {
        MANDT: '800',
        DOCNUM: '0000000000021044',
        SEGNUM: 3,
        SEGNAM: 'E1EDP01',
        PSGNUM: 1,
        HLEVEL: 2,
        SDATA: 'G_L_ACC:410000|KOSTL:|MENGE:100|NETWR:15000.00',
        DTYP: 'E1EDP01'
      },
      {
        MANDT: '800',
        DOCNUM: '0000000000021044',
        SEGNUM: 4,
        SEGNAM: 'E1KOSTL3',
        PSGNUM: 3,
        HLEVEL: 3,
        SDATA: 'AUFNR:600001|KTEXT:ADIAGI Internal Reference Order',
        DTYP: 'E1KOSTL3'
      },

      // 0000000000001012 Segments
      {
        MANDT: '800',
        DOCNUM: '0000000000001012',
        SEGNUM: 1,
        SEGNAM: 'E1EDK01',
        PSGNUM: 0,
        HLEVEL: 1,
        SDATA: 'CURCY:USD|HWAER:USD|BELNR:1012',
        DTYP: 'E1EDK01'
      },
      {
        MANDT: '800',
        DOCNUM: '0000000000001012',
        SEGNUM: 2,
        SEGNAM: 'E1BP2075_MASTERDATA_ALE',
        PSGNUM: 1,
        HLEVEL: 2,
        SDATA: 'ORDER_TYPE:0100|KTEXT:Marketing Campaign 2026|RESPCCTR:|COMPANY_CODE:1000|BUS_AREA:0001',
        DTYP: 'E1BP2075_MASTERDATA_ALE'
      },

      // 0000000010045211 Segments
      {
        MANDT: '800',
        DOCNUM: '0000000010045211',
        SEGNUM: 1,
        SEGNAM: 'E1EDK01',
        PSGNUM: 0,
        HLEVEL: 1,
        SDATA: 'CURCY:USD|HWAER:USD|BELNR:PO-4500099882|ACTION:000',
        DTYP: 'E1EDK01'
      },
      {
        MANDT: '800',
        DOCNUM: '0000000010045211',
        SEGNUM: 2,
        SEGNAM: 'E1EDP01',
        PSGNUM: 1,
        HLEVEL: 2,
        SDATA: 'POSEX:00010|MENGE:50|MENEE:EA|PEINH:1|VPREI:120.00',
        DTYP: 'E1EDP01'
      },
      {
        MANDT: '800',
        DOCNUM: '0000000010045211',
        SEGNUM: 3,
        SEGNAM: 'E1EDP19',
        PSGNUM: 2,
        HLEVEL: 3,
        SDATA: 'QUALF:001|IDTNR:AltParts|KTEXT:Alternative Industrial Coupling OEM',
        DTYP: 'E1EDP19'
      }
    ];

    // 4. BASIS - TBTCO (Job Status Overview Table)
    this.tableDataStore['TBTCO'] = [
      {
        MANDT: '800',
        JOBNAME: 'JOB_MRP_DAILY_PL10',
        JOBCOUNT: '18400001',
        STATUS: 'A', // Aborted
        SDLSTRTDTE: '2026-08-20',
        SDLSTRTTM: '00:00:01',
        STRTDTE: '2026-08-20',
        STRTTM: '00:00:01',
        ENDDTE: '2026-08-20',
        ENDTM: '00:00:47',
        AUTHCKNAM: 'WF-BATCH',
        PROGNAME: 'RMMRP000',
        VARIANT: 'PLANT_10'
      },
      {
        MANDT: '800',
        JOBNAME: 'Z_MONTH_END_FIN_CLOSING',
        JOBCOUNT: '18400002',
        STATUS: 'A', // Aborted
        SDLSTRTDTE: '2026-08-20',
        SDLSTRTTM: '02:15:00',
        STRTDTE: '2026-08-20',
        STRTTM: '02:15:00',
        ENDDTE: '2026-08-20',
        ENDTM: '02:15:30',
        AUTHCKNAM: 'FIN_ADMIN',
        PROGNAME: 'SAPF100',
        VARIANT: 'PERIOD_08'
      },
      {
        MANDT: '800',
        JOBNAME: 'Z_SD_NIGHTLY_BILLING',
        JOBCOUNT: '18400003',
        STATUS: 'A', // Aborted
        SDLSTRTDTE: '2026-08-20',
        SDLSTRTTM: '03:30:00',
        STRTDTE: '2026-08-20',
        STRTTM: '03:30:00',
        ENDDTE: '2026-08-20',
        ENDTM: '03:30:27',
        AUTHCKNAM: 'SD_BATCH_USER',
        PROGNAME: 'RV60SBAT',
        VARIANT: 'DAILY_INVOICE'
      },
      {
        MANDT: '800',
        JOBNAME: 'RBDAPP01_IDOC_POSTING',
        JOBCOUNT: '18400004',
        STATUS: 'R', // Active/Running
        SDLSTRTDTE: '2026-08-20',
        SDLSTRTTM: '18:30:00',
        STRTDTE: '2026-08-20',
        STRTTM: '18:30:00',
        ENDDTE: '',
        ENDTM: '',
        AUTHCKNAM: 'EDI_ADMIN',
        PROGNAME: 'RBDAPP01',
        VARIANT: 'ORDERS_IN'
      },
      {
        MANDT: '800',
        JOBNAME: 'Z_PURCHASE_ORDER_EXPEDITE',
        JOBCOUNT: '18400005',
        STATUS: 'F', // Finished
        SDLSTRTDTE: '2026-08-20',
        SDLSTRTTM: '16:00:00',
        STRTDTE: '2026-08-20',
        STRTTM: '16:00:00',
        ENDDTE: '2026-08-20',
        ENDTM: '16:02:15',
        AUTHCKNAM: 'MM_BUYER',
        PROGNAME: 'ZMM_PO_EXPEDITE',
        VARIANT: 'ALL_VENDORS'
      },
      {
        MANDT: '800',
        JOBNAME: 'SAP_CCMS_MONI_BATCH',
        JOBCOUNT: '18400006',
        STATUS: 'S', // Scheduled
        SDLSTRTDTE: '2026-08-20',
        SDLSTRTTM: '23:00:00',
        STRTDTE: '',
        STRTTM: '',
        ENDDTE: '',
        ENDTM: '',
        AUTHCKNAM: 'DDIC',
        PROGNAME: 'RSCCMS_BATCH',
        VARIANT: 'HOURLY'
      }
    ];

    // 5. BASIS - SNAP (ABAP Runtime Short Dumps ST22)
    this.tableDataStore['SNAP'] = [
      {
        MANDT: '800',
        SEQNO: '00000001',
        UNAME: 'ANALYTICS_USER',
        DATUM: '2026-08-20',
        UZEIT: '14:22:15',
        AHOST: 's4prd-app01',
        MODNO: '0001',
        ERRID: 'TSV_TNEW_PAGE_ALLOC_FAILED',
        PROG: 'Z_ORDER_ANALYTICS',
        INCL: 'Z_ORDER_ANALYTICS===TOP',
        LINE: '142',
        DETAILS: 'Roll memory limit exceeded (ztta/roll_extension=4GB). Internal table attempted 8.4GB allocation.'
      },
      {
        MANDT: '800',
        SEQNO: '00000002',
        UNAME: 'SALES_REP_04',
        DATUM: '2026-08-20',
        UZEIT: '11:15:30',
        AHOST: 's4prd-app01',
        MODNO: '0003',
        ERRID: 'DYNPRO_NOT_FOUND',
        PROG: 'SAPMV45A',
        INCL: 'MV45AFZZ',
        LINE: '2100',
        DETAILS: 'Dynpro screen 2100 missing in production following transport S4K900375.'
      },
      {
        MANDT: '800',
        SEQNO: '00000003',
        UNAME: 'FIN_ADMIN',
        DATUM: '2026-08-20',
        UZEIT: '02:15:30',
        AHOST: 's4prd-app02',
        MODNO: '0007',
        ERRID: 'MESSAGE_TYPE_X',
        PROG: 'SAPF100',
        INCL: 'LFACU01',
        LINE: '450',
        DETAILS: 'System assertion triggered due to database deadlock on ACDOCA ledger table.'
      },
      {
        MANDT: '800',
        SEQNO: '00000004',
        UNAME: 'DIALOG_BATCH',
        DATUM: '2026-08-20',
        UZEIT: '09:40:12',
        AHOST: 's4prd-app01',
        MODNO: '0002',
        ERRID: 'TIME_OUT',
        PROG: 'Z_CUSTOMER_RECALC',
        INCL: 'Z_CUSTOMER_RECALC_F01',
        LINE: '310',
        DETAILS: 'Maximum dialog run time 600 seconds exceeded during full scan on unindexed ledger.'
      },
      {
        MANDT: '800',
        SEQNO: '00000005',
        UNAME: 'PLANT_CLERK',
        DATUM: '2026-08-20',
        UZEIT: '16:05:44',
        AHOST: 's4prd-app01',
        MODNO: '0005',
        ERRID: 'COMPUTE_INT_ZERODIVIDE',
        PROG: 'Z_PRICE_FORMULA',
        INCL: 'Z_PRICE_FORMULA_TOP',
        LINE: '88',
        DETAILS: 'Division by zero on zero material stock in Plant PL20.'
      }
    ];

    // 6. BASIS - RFCDES (RFC Destination Metadata SM59)
    this.tableDataStore['RFCDES'] = [
      {
        RFCDEST: 'S4LOCAL_RFC',
        RFCTYPE: '3',
        RFCOPTIONS: 'NONE',
        RFCHOST: 'localhost',
        RFCSYSID: 'S4P',
        RFCCLIENT: '800',
        RFCUSER: 'AI_AGENT_RW',
        RFCLANG: 'EN',
        RFCSNC: '1',
        RFCUNICODE: '1'
      },
      {
        RFCDEST: 'S4_CPI_PROD',
        RFCTYPE: 'G',
        RFCOPTIONS: 'SSL',
        RFCHOST: 'cpi-tenant.integrations.cloud.sap',
        RFCSYSID: 'CPI',
        RFCCLIENT: '100',
        RFCUSER: 'CPI_TECH_USER',
        RFCLANG: 'EN',
        RFCSNC: '1',
        RFCUNICODE: '1'
      },
      {
        RFCDEST: 'S4_MIA_RETAIL_POS',
        RFCTYPE: 'T',
        RFCOPTIONS: 'REG',
        RFCHOST: '172.21.72.115',
        RFCSYSID: 'POS01',
        RFCCLIENT: '800',
        RFCUSER: 'POS_GATEWAY',
        RFCLANG: 'EN',
        RFCSNC: '0',
        RFCUNICODE: '1'
      },
      {
        RFCDEST: 'EDI_PRD_GATEWAY',
        RFCTYPE: 'H',
        RFCOPTIONS: 'HTTP',
        RFCHOST: 'edi.partnerhub.enterprise.com',
        RFCSYSID: 'EDI',
        RFCCLIENT: '800',
        RFCUSER: 'BATCH_EDI',
        RFCLANG: 'EN',
        RFCSNC: '1',
        RFCUNICODE: '1'
      },
      {
        RFCDEST: 'BTP_EVENT_MESH',
        RFCTYPE: 'G',
        RFCOPTIONS: 'SSL_OAUTH',
        RFCHOST: 'enterprise-messaging.cfapps.us10.hana.ondemand.com',
        RFCSYSID: 'BTP',
        RFCCLIENT: '100',
        RFCUSER: 'EM_TECH_CLIENT',
        RFCLANG: 'EN',
        RFCSNC: '1',
        RFCUNICODE: '1'
      }
    ];

    // 7. BASIS - VBHDR (Update Header Table SM13)
    this.tableDataStore['VBHDR'] = [
      {
        MANDT: '800',
        VDKEY: 'UPD-20260820-001',
        VBDATE: '2026-08-20',
        VBTIME: '03:30:25',
        VBUSER: 'SD_BATCH_USER',
        VBTCODE: 'VF01',
        VBMODCNT: '0002',
        VBERR: 'E',
        VBERRCLS: 'SD',
        VBERRNUM: '042'
      },
      {
        MANDT: '800',
        VDKEY: 'UPD-20260820-002',
        VBDATE: '2026-08-20',
        VBTIME: '11:45:10',
        VBUSER: 'SALES_CLERK_2',
        VBTCODE: 'VA01',
        VBMODCNT: '0001',
        VBERR: 'E',
        VBERRCLS: 'V1',
        VBERRNUM: '105'
      },
      {
        MANDT: '800',
        VDKEY: 'UPD-20260820-003',
        VBDATE: '2026-08-20',
        VBTIME: '15:20:00',
        VBUSER: 'AP_ACCOUNTANT',
        VBTCODE: 'MIRO',
        VBMODCNT: '0003',
        VBERR: 'X',
        VBERRCLS: 'M8',
        VBERRNUM: '534'
      }
    ];

    // 8. BASIS / SECURITY - USR02 (Live User Master Record - Passwords Protected)
    this.tableDataStore['USR02'] = [
      {
        MANDT: '800',
        BNAME: 'AI_AGENT_RW',
        GLTGV: '2025-01-01',
        GLTGB: '9999-12-31',
        USTYP: 'A',
        CLASS: 'SUPER',
        LOCUB: ' ',
        UFLAG: 0,
        ACCNT: 'DEV_OPERATIONS',
        ANAME: 'DDIC',
        ERDAT: '2025-01-01',
        TRDAT: '2026-08-26',
        LTIME: '17:45:00',
        BAPWD: '[PROTECTED_HASH]',
        TZONE: 'UTC'
      },
      {
        MANDT: '800',
        BNAME: 'STUDENT069',
        GLTGV: '2025-01-01',
        GLTGB: '2026-12-31',
        USTYP: 'A',
        CLASS: 'TRAINING',
        LOCUB: ' ',
        UFLAG: 0,
        ACCNT: 'LAB_STUDENTS',
        ANAME: 'BASIS_ADMIN',
        ERDAT: '2025-02-15',
        TRDAT: '2026-08-26',
        LTIME: '16:30:12',
        BAPWD: '[PROTECTED_HASH]',
        TZONE: 'EST'
      },
      {
        MANDT: '800',
        BNAME: 'JOHNDOE',
        GLTGV: '2025-01-01',
        GLTGB: '2027-12-31',
        USTYP: 'A',
        CLASS: 'FINANCE',
        LOCUB: '1',
        UFLAG: 128,
        ACCNT: 'CORP_FINANCE',
        ANAME: 'HR_SYNC',
        ERDAT: '2025-03-10',
        TRDAT: '2026-08-25',
        LTIME: '09:15:22',
        BAPWD: '[PROTECTED_HASH]',
        TZONE: 'EST'
      },
      {
        MANDT: '800',
        BNAME: 'M_GARCIA_ADM',
        GLTGV: '2024-01-01',
        GLTGB: '2026-08-01',
        USTYP: 'A',
        CLASS: 'SUPER',
        LOCUB: '1',
        UFLAG: 32,
        ACCNT: 'IT_SECURITY',
        ANAME: 'DDIC',
        ERDAT: '2024-01-01',
        TRDAT: '2026-08-10',
        LTIME: '14:20:00',
        BAPWD: '[PROTECTED_HASH]',
        TZONE: 'PST'
      },
      {
        MANDT: '800',
        BNAME: 'EXT_CONS_01',
        GLTGV: '2024-06-01',
        GLTGB: '2025-12-31',
        USTYP: 'A',
        CLASS: 'EXTERNAL',
        LOCUB: '1',
        UFLAG: 32,
        ACCNT: 'CONSULTING',
        ANAME: 'BASIS_ADMIN',
        ERDAT: '2024-06-01',
        TRDAT: '2025-11-20',
        LTIME: '18:05:00',
        BAPWD: '[PROTECTED_HASH]',
        TZONE: 'EST'
      },
      {
        MANDT: '800',
        BNAME: 'RFC_EXT_USER',
        GLTGV: '2025-01-01',
        GLTGB: '9999-12-31',
        USTYP: 'C',
        CLASS: 'INTERFACES',
        LOCUB: ' ',
        UFLAG: 0,
        ACCNT: 'CPI_INTEGRATION',
        ANAME: 'DDIC',
        ERDAT: '2025-01-01',
        TRDAT: '2026-08-26',
        LTIME: '17:55:10',
        BAPWD: '[PROTECTED_HASH]',
        TZONE: 'UTC'
      },
      {
        MANDT: '800',
        BNAME: 'BATCH_SUPERVISOR',
        GLTGV: '2025-01-01',
        GLTGB: '9999-12-31',
        USTYP: 'B',
        CLASS: 'BATCH',
        LOCUB: ' ',
        UFLAG: 0,
        ACCNT: 'JOB_SCHEDULING',
        ANAME: 'DDIC',
        ERDAT: '2025-01-01',
        TRDAT: '2026-08-26',
        LTIME: '17:59:00',
        BAPWD: '[PROTECTED_HASH]',
        TZONE: 'UTC'
      },
      {
        MANDT: '800',
        BNAME: 'DDIC',
        GLTGV: '1995-01-01',
        GLTGB: '9999-12-31',
        USTYP: 'A',
        CLASS: 'SUPER',
        LOCUB: '1',
        UFLAG: 64,
        ACCNT: 'BASIS_CORE',
        ANAME: 'SAP',
        ERDAT: '1995-01-01',
        TRDAT: '2026-01-10',
        LTIME: '08:00:00',
        BAPWD: '[PROTECTED_HASH]',
        TZONE: 'CET'
      },
      {
        MANDT: '800',
        BNAME: 'SAP*',
        GLTGV: '1995-01-01',
        GLTGB: '9999-12-31',
        USTYP: 'A',
        CLASS: 'SUPER',
        LOCUB: '1',
        UFLAG: 64,
        ACCNT: 'BASIS_CORE',
        ANAME: 'SAP',
        ERDAT: '1995-01-01',
        TRDAT: '2025-12-01',
        LTIME: '08:00:00',
        BAPWD: '[PROTECTED_HASH]',
        TZONE: 'CET'
      }
    ];

    // 9. BASIS / SECURITY - AGR_USERS (User Role Assignments)
    this.tableDataStore['AGR_USERS'] = [
      { MANDT: '800', AGR_NAME: 'Z_SD_SALES_MANAGER', UNAME: 'AI_AGENT_RW', FROM_DAT: '2025-01-01', TO_DAT: '9999-12-31', EXCLUDE: ' ', CHANGE_DAT: '2025-01-01', CHANGE_TIM: '12:00:00', CHANGE_NAM: 'DDIC' },
      { MANDT: '800', AGR_NAME: 'Z_MM_PURCHASING_OFFICER', UNAME: 'AI_AGENT_RW', FROM_DAT: '2025-01-01', TO_DAT: '9999-12-31', EXCLUDE: ' ', CHANGE_DAT: '2025-01-01', CHANGE_TIM: '12:00:00', CHANGE_NAM: 'DDIC' },
      { MANDT: '800', AGR_NAME: 'Z_FI_CONTROLLER_READ', UNAME: 'AI_AGENT_RW', FROM_DAT: '2025-01-01', TO_DAT: '9999-12-31', EXCLUDE: ' ', CHANGE_DAT: '2025-01-01', CHANGE_TIM: '12:00:00', CHANGE_NAM: 'DDIC' },
      { MANDT: '800', AGR_NAME: 'SAP_BC_ENDUSER', UNAME: 'STUDENT069', FROM_DAT: '2025-01-01', TO_DAT: '2026-12-31', EXCLUDE: ' ', CHANGE_DAT: '2025-02-15', CHANGE_TIM: '10:00:00', CHANGE_NAM: 'BASIS_ADMIN' },
      { MANDT: '800', AGR_NAME: 'Z_SD_ORDER_ENTRY', UNAME: 'STUDENT069', FROM_DAT: '2025-01-01', TO_DAT: '2026-12-31', EXCLUDE: ' ', CHANGE_DAT: '2025-02-15', CHANGE_TIM: '10:00:00', CHANGE_NAM: 'BASIS_ADMIN' },
      { MANDT: '800', AGR_NAME: 'Z_FI_GL_ACCOUNTANT', UNAME: 'JOHNDOE', FROM_DAT: '2025-01-01', TO_DAT: '2027-12-31', EXCLUDE: ' ', CHANGE_DAT: '2025-03-10', CHANGE_TIM: '14:00:00', CHANGE_NAM: 'HR_SYNC' },
      { MANDT: '800', AGR_NAME: 'SAP_BC_BASIS_ADMIN', UNAME: 'M_GARCIA_ADM', FROM_DAT: '2024-01-01', TO_DAT: '2026-08-01', EXCLUDE: ' ', CHANGE_DAT: '2024-01-01', CHANGE_TIM: '09:00:00', CHANGE_NAM: 'DDIC' },
      { MANDT: '800', AGR_NAME: 'SAP_BC_RFC_COMM', UNAME: 'RFC_EXT_USER', FROM_DAT: '2025-01-01', TO_DAT: '9999-12-31', EXCLUDE: ' ', CHANGE_DAT: '2025-01-01', CHANGE_TIM: '09:00:00', CHANGE_NAM: 'DDIC' }
    ];

    // 10. BASIS / SECURITY - AGR_1251 (Authorization Objects per Role)
    this.tableDataStore['AGR_1251'] = [
      { MANDT: '800', AGR_NAME: 'Z_SD_SALES_MANAGER', OBJECT: 'V_VBAK_VKO', AUTH: 'T_VBAK_01', VARIANT: 1, FIELD: 'VKORG', LOW: '1000', HIGH: '2000' },
      { MANDT: '800', AGR_NAME: 'Z_SD_SALES_MANAGER', OBJECT: 'V_VBAK_VKO', AUTH: 'T_VBAK_01', VARIANT: 1, FIELD: 'VTWEG', LOW: '10', HIGH: '20' },
      { MANDT: '800', AGR_NAME: 'Z_SD_SALES_MANAGER', OBJECT: 'V_VBAK_VKO', AUTH: 'T_VBAK_01', VARIANT: 1, FIELD: 'ACTVT', LOW: '01', HIGH: '03' },
      { MANDT: '800', AGR_NAME: 'Z_SD_SALES_MANAGER', OBJECT: 'S_TABU_DIS', AUTH: 'T_TABU_01', VARIANT: 1, FIELD: 'DICBERCLS', LOW: 'VA', HIGH: 'VA' },
      { MANDT: '800', AGR_NAME: 'Z_SD_SALES_MANAGER', OBJECT: 'S_TABU_DIS', AUTH: 'T_TABU_01', VARIANT: 1, FIELD: 'ACTVT', LOW: '03', HIGH: '03' },
      { MANDT: '800', AGR_NAME: 'Z_MM_PURCHASING_OFFICER', OBJECT: 'M_BEST_EKG', AUTH: 'T_EKKO_01', VARIANT: 1, FIELD: 'EKGRP', LOW: '001', HIGH: '003' },
      { MANDT: '800', AGR_NAME: 'Z_MM_PURCHASING_OFFICER', OBJECT: 'M_BEST_EKG', AUTH: 'T_EKKO_01', VARIANT: 1, FIELD: 'ACTVT', LOW: '01', HIGH: '03' },
      { MANDT: '800', AGR_NAME: 'SAP_BC_BASIS_ADMIN', OBJECT: 'S_USER_AGR', AUTH: 'T_USER_01', VARIANT: 1, FIELD: 'ACTVT', LOW: '01', HIGH: '06' }
    ];

    // 11. BASIS / SECURITY - UST04 (User Master Profiles)
    this.tableDataStore['UST04'] = [
      { MANDT: '800', BNAME: 'AI_AGENT_RW', PROFILE: 'T-ZSD_MGR' },
      { MANDT: '800', BNAME: 'AI_AGENT_RW', PROFILE: 'T-ZMM_BUY' },
      { MANDT: '800', BNAME: 'STUDENT069', PROFILE: 'S_A.NORMAL' },
      { MANDT: '800', BNAME: 'JOHNDOE', PROFILE: 'T-ZFI_ACC' },
      { MANDT: '800', BNAME: 'M_GARCIA_ADM', PROFILE: 'SAP_ALL' },
      { MANDT: '800', BNAME: 'RFC_EXT_USER', PROFILE: 'S_A.CUSTOM' },
      { MANDT: '800', BNAME: 'BATCH_SUPERVISOR', PROFILE: 'S_A.BATCH' },
      { MANDT: '800', BNAME: 'DDIC', PROFILE: 'SAP_ALL' },
      { MANDT: '800', BNAME: 'SAP*', PROFILE: 'SAP_ALL' }
    ];
  }

  /**
   * Universal Controlled SAP Table Reader: sap_read_table
   */
  public readTable(options: SapReadTableOptions): SapEccTableReadResult {
    const rawTable = options.table || options.tableName || '';
    const tableName = rawTable.toUpperCase().trim();
    const requestedFields = options.fields || [];
    const client = options.client || options.sapClient || options.mandt || '800';

    // Normalize filters / options
    let filterLines: string[] = [];
    if (Array.isArray(options.filters)) {
      filterLines = options.filters;
    } else if (typeof options.filters === 'string' && options.filters.trim()) {
      filterLines = [options.filters];
    } else if (Array.isArray(options.options)) {
      filterLines = options.options;
    } else if (typeof options.options === 'string' && options.options.trim()) {
      filterLines = [options.options];
    }
    const combinedWhereClause = filterLines.join(' AND ');

    // Normalize row limit and pagination
    // IDoc-style tables get a per-table FLOOR, not just a default-when-unspecified: the LLM
    // frequently guesses its own small rowCount (e.g. 20) even when the user asked broadly for
    // "all"/"list" IDocs, so an explicit-but-small caller value is raised to the known-sensible
    // floor for these high-volume tables rather than trusting the LLM's arbitrary guess.
    const defaultRowLimitForTable = this.DEFAULT_ROW_LIMIT_WHEN_UNSPECIFIED[tableName];
    const callerRawLimit = options.row_limit ?? options.rowCount ?? options.limit;
    const rawLimit = defaultRowLimitForTable !== undefined
      ? Math.max(Number(callerRawLimit) || 0, defaultRowLimitForTable)
      : (callerRawLimit ?? 50);
    const rowLimit = Math.min(Math.max(1, Number(rawLimit) || 50), 1000); // hard limit 1000 rows
    const rawOffset = options.offset ?? options.rowSkip ?? options.row_skips ?? 0;
    const rowOffset = Math.max(0, Number(rawOffset) || 0);

    // 1. Production Safety Interceptor Check
    const safetyCheck = sapProductionSafetyInterceptor.inspectAndAudit({
      targetType: 'TABLE_READ',
      targetName: tableName,
      operation: 'SELECT',
      whereClause: combinedWhereClause,
      rowCount: rowLimit,
      requestingUser: 'kumbagiri9@gmail.com',
      technicalSapUser: 'AI_AGENT_RW',
      client
    });

    if (safetyCheck.decision === 'BLOCK') {
      throw new Error(
        `[SAFETY INTERCEPTOR BLOCKED] Access to table '${tableName}' was blocked: ${safetyCheck.reason}. ` +
        `Remediation: ${safetyCheck.policyViolations[0]?.remediationAction || 'Contact SAP Security Admin.'}`
      );
    }

    if (this.DENIED_TABLES[tableName]) {
      const reason = this.DENIED_TABLES[tableName];
      throw new Error(
        `[GATEWAY DENY POLICY] Access to table '${tableName}' is strictly restricted by SAP Enterprise Security & Compliance Policy. ` +
        `Reason: ${reason} (PFCG authorization check failed on S_TABU_DIS with DICBERCLS: &NC&, ACTVT: 03). Direct RFC extraction prohibited.`
      );
    }

    // 2. Query Complexity & SQL Injection Interceptor
    const DANGEROUS_KEYWORDS = ['DELETE', 'TRUNCATE', 'DROP', 'UPDATE', 'INSERT', 'ALTER', 'EXEC', 'GRANT', 'REVOKE', 'SHUTDOWN'];
    for (const kw of DANGEROUS_KEYWORDS) {
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      if (regex.test(combinedWhereClause)) {
        throw new Error(`[SAFETY INTERCEPTOR] Prohibited keyword detected: '${kw}'. Only read-only queries are permitted via RFC_READ_TABLE gateway.`);
      }
    }

    // 3. Retrieve or Synthesize Schema Metadata
    let tableDef = this.tableCatalog[tableName];
    if (!tableDef) {
      tableDef = this.synthesizeTableDef(tableName);
    }

    if (!this.liveTableReader) {
      throw new Error(
        `[LIVE SAP REQUIRED] ECC table '${tableName}' was not read because the server-side native RFC reader is unavailable. ` +
        `No local or synthetic table data is permitted as a substitute.`
      );
    }

    // Strip any explicitly-requested field already known to be invalid/oversized on this landscape
    // (see LANDSCAPE_INVALID_FIELDS) before it ever reaches RFC_READ_TABLE. An empty request (i.e.
    // "select all columns") on a known-wide table is replaced with its verified-safe narrow default
    // to avoid DATA_BUFFER_EXCEEDED, before that same invalid-field strip is applied.
    const effectiveRequestedFields = requestedFields.length === 0 && this.DEFAULT_SAFE_FIELDS_WHEN_UNSPECIFIED[tableName]
      ? this.DEFAULT_SAFE_FIELDS_WHEN_UNSPECIFIED[tableName]
      : requestedFields;
    const invalidFieldsForTable = new Set(this.LANDSCAPE_INVALID_FIELDS[tableName] || []);
    const safeRequestedFields = invalidFieldsForTable.size > 0
      ? effectiveRequestedFields.filter(field => !invalidFieldsForTable.has(field.toUpperCase().trim()))
      : effectiveRequestedFields;

    const liveRead = this.liveTableReader({
      table: tableName,
      fields: safeRequestedFields.map(field => field.toUpperCase().trim()),
      options: filterLines,
      rowCount: rowLimit,
      rowSkip: rowOffset,
      client
    });
    let rows = liveRead.rows;
    if (liveRead.fields.length > 0) {
      tableDef = { ...tableDef, columns: liveRead.fields };
    }

    // RFC_READ_TABLE applies filters and pagination in ECC. Sorting is retained for requested result ordering.
    const sortingArg = options.sorting || options.order_by || tableDef.defaultSortField;
    if (sortingArg) {
      rows = this.applySorting(rows, sortingArg);
    }

    // 7. Field Projection & Sensitive-Data Masking
    let finalFields = tableDef.columns;
    const maskedFields: string[] = [];

    if (safeRequestedFields.length > 0) {
      const requestedSet = new Set(safeRequestedFields.map(f => f.toUpperCase().trim()));
      finalFields = tableDef.columns.filter(col => requestedSet.has(col.fieldName.toUpperCase()));
      
      // If requested fields are not in standard catalog, add dynamic columns
      for (const reqF of safeRequestedFields) {
        const up = reqF.toUpperCase().trim();
        if (!finalFields.some(f => f.fieldName.toUpperCase() === up)) {
          finalFields.push({
            fieldName: up,
            offset: 0,
            length: 30,
            type: 'C',
            dataType: 'CHAR',
            fieldText: `Dynamic Field ${up}`
          });
        }
      }
    }

    const fieldNameSet = new Set(finalFields.map(f => f.fieldName.toUpperCase()));
    const projectedRows = rows.map(r => {
      const outRow: Record<string, any> = {};
      for (const col of finalFields) {
        const val = r[col.fieldName] !== undefined ? r[col.fieldName] : r[col.fieldName.toLowerCase()];
        if (this.SENSITIVE_FIELDS.has(col.fieldName.toUpperCase()) && typeof val === 'string' && val.length > 4) {
          outRow[col.fieldName] = '**** **** **** ' + val.slice(-4);
          if (!maskedFields.includes(col.fieldName)) maskedFields.push(col.fieldName);
        } else {
          outRow[col.fieldName] = val !== undefined ? val : '';
        }
      }
      return outRow;
    });

    const slicedRows = projectedRows;
    const totalRecordsInTable = rowOffset + slicedRows.length;
    const hasMore = slicedRows.length === rowLimit;

    const authObjectChecked = `S_TABU_DIS (DICBERCLS: ${tableDef.authGroup}, ACTVT: 03)`;

    return {
      table: tableName,
      tableName: tableName,
      requestedFields: finalFields.map(f => f.fieldName),
      optionsWhereClause: combinedWhereClause,
      filters: filterLines,
      fields: finalFields.map(f => ({
        fieldName: f.fieldName,
        offset: f.offset,
        length: f.length,
        type: f.type,
        fieldText: f.fieldText,
        dataType: f.dataType,
        isKey: f.isKey
      })),
      fieldMetadata: finalFields.map(f => ({
        fieldName: f.fieldName,
        offset: f.offset,
        length: f.length,
        type: f.type,
        description: f.fieldText,
        dataType: f.dataType,
        isKey: f.isKey
      })),
      dataRows: slicedRows,
      rows: slicedRows,
      totalRecordsReturned: slicedRows.length,
      totalRecordsInTable: totalRecordsInTable,
      offset: rowOffset,
      row_limit: rowLimit,
      hasMore,
      safetyFilterApplied: true,
      executionLatencyMs: liveRead.executionLatencyMs,
      queryTimestamp: new Date().toISOString(),
      eccHost: liveRead.eccHost,
      sapClient: client,
      client: client,
      pfcgAuthObjectChecked: authObjectChecked,
      maskedFields: maskedFields.length > 0 ? maskedFields : undefined
    };
  }

  private applySingleFilter(rows: Record<string, any>[], filterStr: string): Record<string, any>[] {
    const clean = filterStr.trim();
    if (!clean) return rows;

    // 1. Pattern: FIELD = 'VAL' or FIELD = "VAL"
    const eqMatch = clean.match(/^([A-Za-z0-9_]+)\s*=\s*['"]?([^'"]+)['"]?$/i);
    if (eqMatch) {
      const field = eqMatch[1].toUpperCase();
      const val = eqMatch[2].trim();
      return rows.filter(r => {
        const itemVal = String(r[field] !== undefined ? r[field] : '').trim();
        return itemVal === val || 
               itemVal === (val.length < 10 && /^\d+$/.test(val) ? val.padStart(10, '0') : val) ||
               itemVal === val.replace(/^0+/, '');
      });
    }

    // 2. Pattern: FIELD <> 'VAL' or FIELD != 'VAL'
    const neqMatch = clean.match(/^([A-Za-z0-9_]+)\s*(?:<>|!=)\s*['"]?([^'"]+)['"]?$/i);
    if (neqMatch) {
      const field = neqMatch[1].toUpperCase();
      const val = neqMatch[2].trim();
      return rows.filter(r => {
        const itemVal = String(r[field] !== undefined ? r[field] : '').trim();
        return itemVal !== val && itemVal !== val.padStart(10, '0');
      });
    }

    // 3. Pattern: FIELD LIKE 'VAL%' or FIELD LIKE '%VAL%'
    const likeMatch = clean.match(/^([A-Za-z0-9_]+)\s+LIKE\s+['"]([^'"]+)['"]$/i);
    if (likeMatch) {
      const field = likeMatch[1].toUpperCase();
      const pattern = likeMatch[2].replace(/%/g, '.*').replace(/_/g, '.');
      const reg = new RegExp(`^${pattern}$`, 'i');
      return rows.filter(r => {
        const itemVal = String(r[field] !== undefined ? r[field] : '');
        return reg.test(itemVal);
      });
    }

    // 4. Pattern: FIELD IN ('VAL1', 'VAL2')
    const inMatch = clean.match(/^([A-Za-z0-9_]+)\s+IN\s*\(([^)]+)\)$/i);
    if (inMatch) {
      const field = inMatch[1].toUpperCase();
      const items = inMatch[2].split(',').map(s => s.trim().replace(/^['"]|['"]$/g, ''));
      const set = new Set(items);
      return rows.filter(r => {
        const itemVal = String(r[field] !== undefined ? r[field] : '').trim();
        return set.has(itemVal) || set.has(itemVal.replace(/^0+/, ''));
      });
    }

    // 5. Pattern: FIELD >= NUMBER or FIELD <= NUMBER or > or <
    const compMatch = clean.match(/^([A-Za-z0-9_]+)\s*(>=|<=|>|<)\s*([0-9.]+)/i);
    if (compMatch) {
      const field = compMatch[1].toUpperCase();
      const op = compMatch[2];
      const targetNum = parseFloat(compMatch[3]);
      return rows.filter(r => {
        const itemVal = parseFloat(r[field]);
        if (isNaN(itemVal)) return false;
        if (op === '>=') return itemVal >= targetNum;
        if (op === '<=') return itemVal <= targetNum;
        if (op === '>') return itemVal > targetNum;
        if (op === '<') return itemVal < targetNum;
        return true;
      });
    }

    // Generic fallback substring match on row values
    return rows.filter(r => {
      for (const v of Object.values(r)) {
        if (String(v).toUpperCase().includes(clean.toUpperCase().replace(/['"]/g, ''))) {
          return true;
        }
      }
      return false;
    });
  }

  private applySorting(rows: Record<string, any>[], sortSpec: string | { field: string; direction?: 'ASC' | 'DESC' }): Record<string, any>[] {
    let field = '';
    let dir: 'ASC' | 'DESC' = 'ASC';

    if (typeof sortSpec === 'string') {
      const parts = sortSpec.trim().split(/\s+/);
      field = parts[0].toUpperCase();
      if (parts[1] && parts[1].toUpperCase() === 'DESC') {
        dir = 'DESC';
      }
    } else if (sortSpec && typeof sortSpec === 'object') {
      field = (sortSpec.field || '').toUpperCase();
      dir = sortSpec.direction === 'DESC' ? 'DESC' : 'ASC';
    }

    if (!field) return rows;

    return [...rows].sort((a, b) => {
      const valA = a[field];
      const valB = b[field];
      if (valA === valB) return 0;
      if (valA === undefined || valA === null) return dir === 'ASC' ? -1 : 1;
      if (valB === undefined || valB === null) return dir === 'ASC' ? 1 : -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return dir === 'ASC' ? valA - valB : valB - valA;
      }
      const strA = String(valA);
      const strB = String(valB);
      return dir === 'ASC' ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });
  }

  private extractDictionaryRows(tableName: string): Record<string, any>[] {
    if (tableName === 'DD02L' || tableName === 'DD02T') {
      return sapEccMetadataRepository.tables.map(t => ({
        TABNAME: t.tableName,
        DDLANGUAGE: 'E',
        AS4LOCAL: 'A',
        AS4VERS: '0000',
        TABCLASS: t.tableType,
        APPLCLASS: t.module,
        CONTFLAG: t.deliveryClass || 'A',
        DDTEXT: t.description,
        DEVCLASS: t.package
      }));
    }
    if (tableName === 'DD03L' || tableName === 'DD03T') {
      return sapEccMetadataRepository.fields.map(f => ({
        TABNAME: f.tableName,
        FIELDNAME: f.fieldName,
        AS4LOCAL: 'A',
        AS4VERS: '0000',
        POSITION: f.position,
        KEYFLAG: f.isKey ? 'X' : '',
        ROLLNAME: f.dataElement || '',
        DOMNAME: f.domain || '',
        DATATYPE: f.dataType,
        LENG: f.length,
        DECIMALS: f.decimals || 0,
        DDTEXT: f.description,
        CHECKTABLE: f.checkTable || ''
      }));
    }
    if (tableName === 'DD04L' || tableName === 'DD04T') {
      return sapEccMetadataRepository.dataElements.map(de => ({
        ROLLNAME: de.dataElementName,
        DDLANGUAGE: 'E',
        AS4LOCAL: 'A',
        DOMNAME: de.domainName,
        DATATYPE: de.dataType,
        LENG: de.length,
        DDTEXT: de.description
      }));
    }
    if (tableName === 'DD01L' || tableName === 'DD01T') {
      return sapEccMetadataRepository.domains.map(d => ({
        DOMNAME: d.domainName,
        DDLANGUAGE: 'E',
        AS4LOCAL: 'A',
        DATATYPE: d.dataType,
        LENG: d.length,
        DDTEXT: d.description,
        VALTABLE: d.valueTable || ''
      }));
    }
    if (tableName === 'TFDIR' || tableName === 'ENLFDIR' || tableName === 'FUPARAREF') {
      return sapEccMetadataRepository.functions.map(fn => ({
        FUNCNAME: fn.functionName,
        PNAME: `SAPL${fn.package}`,
        INCLUDE: `L${fn.package}U01`,
        STATUS: 'ACTIVE',
        APPL: fn.module,
        FMODE: fn.isRfc ? 'R' : '',
        DESCRIPT: fn.description
      }));
    }
    if (tableName === 'TSTC' || tableName === 'TSTCT') {
      return sapEccMetadataRepository.transactions.map(t => ({
        TCODE: t.tcode,
        SPRSL: 'E',
        PGMNA: t.program,
        TTEXT: t.description,
        MOD: t.module
      }));
    }
    if (tableName === 'TADIR') {
      return sapEccMetadataRepository.packages.map(p => ({
        PGMID: 'R3TR',
        OBJECT: 'DEVC',
        OBJ_NAME: p.package,
        DEVCLASS: p.package,
        COMPONENT: p.softwareComponent,
        APPL: p.applicationComponent
      }));
    }
    return [];
  }

  private synthesizeTableDef(tableName: string): TableDefinition {
    const isZ = tableName.startsWith('Z') || tableName.startsWith('Y');

    // Strict Anti-Hallucination Mandate for Custom Z & Y Objects:
    // Never synthesize or invent a Z/Y table unless verified in approved SAP DDIC / TADIR metadata.
    if (isZ) {
      const zMatch = sapEccMetadataRepository.zObjects.find(
        z => z.objectName.toUpperCase() === tableName.toUpperCase() && (z.objectType === 'Z_TABLE' || z.objectType === 'Z_PROGRAM')
      );
      const tableMatch = sapEccMetadataRepository.tables.find(
        t => t.tableName.toUpperCase() === tableName.toUpperCase()
      );

      if (!zMatch && !tableMatch) {
        throw new Error(
          `[DDIC_REJECTION] Custom table '${tableName}' does not exist in SAP Data Dictionary (DD02L/TADIR in Client 800). ` +
          `Refusing to hallucinate a Z-table schema or records merely from its name. (Strict Live Data & Governance Policy)`
        );
      }

      const mod = zMatch?.module || tableMatch?.module || 'TM';
      return {
        tableName,
        description: zMatch?.description || tableMatch?.description || `Custom DDIC Table ${tableName}`,
        module: mod,
        authGroup: '&NC&',
        deliveryClass: 'A',
        columns: [
          { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
          { fieldName: 'OBJECT_ID', offset: 3, length: 24, type: 'C', dataType: 'CHAR', fieldText: 'Object Key Identifier', isKey: true },
          { fieldName: 'STATUS', offset: 27, length: 10, type: 'C', dataType: 'CHAR', fieldText: 'Transmission / Record Status' },
          { fieldName: 'LOG_DATE', offset: 37, length: 8, type: 'D', dataType: 'DATS', fieldText: 'Processing Date' },
          { fieldName: 'ERR_CODE', offset: 45, length: 20, type: 'C', dataType: 'CHAR', fieldText: 'Error Code' },
          { fieldName: 'ERR_TEXT', offset: 65, length: 120, type: 'C', dataType: 'CHAR', fieldText: 'Error Diagnostic Text' }
        ]
      };
    }

    const mod = tableName.includes('SALES') || tableName.includes('ORDER') || tableName.startsWith('VB') ? 'SD' :
                tableName.includes('MAT') || tableName.startsWith('MAR') || tableName.startsWith('EK') ? 'MM' :
                tableName.includes('ACC') || tableName.startsWith('BK') || tableName.startsWith('BS') ? 'FI' :
                tableName.startsWith('AUF') || tableName.startsWith('AF') ? 'PP' :
                tableName.startsWith('EQ') || tableName.startsWith('IF') ? 'PM' : 'Basis';

    return {
      tableName,
      description: `SAP Standard Table ${tableName}`,
      module: mod,
      authGroup: mod,
      deliveryClass: 'A',
      columns: [
        { fieldName: 'MANDT', offset: 0, length: 3, type: 'C', dataType: 'CLNT', fieldText: 'Client', isKey: true },
        { fieldName: 'OBJECT_ID', offset: 3, length: 18, type: 'C', dataType: 'CHAR', fieldText: 'Primary Identifier', isKey: true },
        { fieldName: 'STATUS', offset: 21, length: 4, type: 'C', dataType: 'CHAR', fieldText: 'Processing Status' },
        { fieldName: 'ERDAT', offset: 25, length: 8, type: 'D', dataType: 'DATS', fieldText: 'Creation Date' },
        { fieldName: 'ERNAM', offset: 33, length: 12, type: 'C', dataType: 'CHAR', fieldText: 'Created By' }
      ]
    };
  }
}

export const sapEccTableGateway = new SapEccTableGateway();
