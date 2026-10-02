import { spawnSync } from 'child_process';
import path from 'path';

export interface BridgeInvocation {
  ok: boolean;
  result?: unknown;
  error?: string;
}

const TRANSIENT_ERROR_PATTERN = /Member not found|DISP_E_MEMBERNOTFOUND|-2147352573/i;

// Blocks the event loop briefly before a retry - consistent with the rest of this bridge, which
// already blocks synchronously on spawnSync for the duration of each Python/COM process.
function sleepSync(ms: number): void {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

// Spawns a fresh Python process per attempt. The intermittent DISP_E_MEMBERNOTFOUND COM error
// seen with this legacy SAP GUI Automation control has been observed to persist across up to 10
// in-process retries — it's a poisoned COM apartment for that specific process, not a quick
// timing race. Retrying with an entirely new process (a fresh apartment) is what actually
// recovers it, so the retry happens here at the process level, not just inside the bridge script.
export function runSapEccRfcBridge(payload: Record<string, unknown>, attempts = 8): BridgeInvocation {
  const python = process.env.SAP_ECC_PYTHON || 'python';
  const bridgePath = path.resolve(process.cwd(), 'services', 'sap_ecc_rfc_bridge.py');

  let lastResponse: BridgeInvocation | undefined;
  let lastFailureDetail = '';

  for (let attempt = 1; attempt <= attempts; attempt++) {
    if (attempt > 1) {
      sleepSync(Math.min(300 * attempt, 1500));
    }

    const execution = spawnSync(python, [bridgePath], {
      input: JSON.stringify(payload),
      encoding: 'utf8',
      env: process.env,
      timeout: 60_000,
      windowsHide: true
    });

    if (execution.error) {
      lastFailureDetail = `Native ECC RFC bridge failed to start: ${execution.error.message}`;
      continue;
    }

    let response: BridgeInvocation | undefined;
    try {
      response = JSON.parse(execution.stdout.trim()) as BridgeInvocation;
    } catch {
      response = undefined;
    }

    if (response?.ok) {
      return response;
    }

    lastResponse = response;
    lastFailureDetail = response?.error || execution.stderr.trim() || `bridge exited with code ${execution.status}`;

    if (!TRANSIENT_ERROR_PATTERN.test(lastFailureDetail) || attempt === attempts) {
      break;
    }
  }

  return { ok: false, error: lastFailureDetail, result: lastResponse?.result };
}
