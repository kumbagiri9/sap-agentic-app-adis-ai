import type { LiveSapTableRead, LiveSapTableReader, TableColumnMetadata } from './eccTableGateway';
import { runSapEccRfcBridge } from './eccRfcBridgeRunner';

interface BridgeField {
  fieldName: string;
  offset: number;
  length: number;
  type: string;
  fieldText: string;
}

interface BridgeResult {
  rows: Record<string, unknown>[];
  fields: BridgeField[];
}

const toColumnMetadata = (field: BridgeField): TableColumnMetadata => ({
  fieldName: field.fieldName,
  offset: field.offset,
  length: field.length,
  type: field.type,
  fieldText: field.fieldText || field.fieldName,
  dataType: field.type
});

export const nativeEccRfcTableReader: LiveSapTableReader = request => {
  const startedAt = Date.now();
  const response = runSapEccRfcBridge(request);

  if (!response.ok || !response.result) {
    throw new Error(`[LIVE SAP REQUIRED] Live ECC RFC_READ_TABLE failed: ${response.error}`);
  }

  const result = response.result as BridgeResult;
  return {
    rows: result.rows,
    fields: result.fields.map(toColumnMetadata),
    executionLatencyMs: Date.now() - startedAt,
    eccHost: process.env.SAP_ECC_HOST || ''
  } satisfies LiveSapTableRead;
};
