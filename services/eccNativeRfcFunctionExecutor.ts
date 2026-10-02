import { runSapEccRfcBridge } from './eccRfcBridgeRunner';

export interface LiveRfcFunctionCall {
  functionName: string;
  importParams?: Record<string, unknown>;
  tableParams?: Record<string, Array<Record<string, unknown>>>;
  exportParamNames?: string[];
  outputTableNames?: string[];
  client?: string;
}

export interface LiveRfcFunctionResult {
  exportParams: Record<string, unknown>;
  outputTables: Record<string, Array<Record<string, unknown>>>;
}

export function executeLiveEccFunction(call: LiveRfcFunctionCall): LiveRfcFunctionResult {
  const response = runSapEccRfcBridge({ action: 'execute_function', ...call });

  if (!response.ok || !response.result) {
    throw new Error(`[LIVE SAP REQUIRED] Live ECC RFC function '${call.functionName}' failed: ${response.error}`);
  }

  return response.result as LiveRfcFunctionResult;
}
