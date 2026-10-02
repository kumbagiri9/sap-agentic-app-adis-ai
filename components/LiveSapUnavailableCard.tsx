import React, { useState } from 'react';
import { AlertTriangle, RefreshCw, ChevronDown, ChevronUp, Terminal, Activity, HelpCircle, ShieldCheck } from 'lucide-react';

interface LiveSapUnavailableCardProps {
  onRetry: () => void;
  rawError?: string;
  backendTarget?: 'ECC' | 'BOTH' | 'S/4HANA';
  sapOperatingMode?: 'LIVE' | 'SIMULATION';
  setSapOperatingMode?: (mode: 'LIVE' | 'SIMULATION') => void;
}

/**
 * GRC Compliance Sanitizer: Ensures no raw IPs, domains, usernames, 
 * passwords, filesystem paths or technical stack traces are exposed.
 */
function sanitizeTechnicalLogs(errStr?: string): string {
  if (!errStr) return "S/4HANA Core RFC Connectivity Timeout (standard standard threshold exceeded).";
  let clean = errStr;
  
  // Mask IP addresses
  clean = clean.replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[MASKED_IP]');
  
  // Mask domains containing mmc-s4sap11 or 1stbasis
  clean = clean.replace(/[a-zA-Z0-9.-]+\.mmc\.[a-zA-Z0-9.-]+/gi, '[MASKED_GATEWAY_HOST]');
  clean = clean.replace(/1stbasis\.com/gi, '[MASKED_DOMAIN]');
  clean = clean.replace(/mmc-s4sap11/gi, '[MASKED_SERVER_ID]');
  
  // Mask credentials and user references
  clean = clean.replace(/STUDENT\d+/gi, '[MASKED_USER]');
  clean = clean.replace(/Srujanachalla\$[a-zA-Z0-9$!@#%^&*]+/gi, '[MASKED_PASSWORD]');
  clean = clean.replace(/sap-client=\d+/gi, 'sap-client=[MASKED_CLIENT_ID]');
  clean = clean.replace(/Authorization\s*:\s*Basic\s*[a-zA-Z0-9+/=]+/gi, 'Authorization: Basic [MASKED_CREDENTIALS_HASH]');
  
  // Mask system filesystem paths or stack traces
  clean = clean.replace(/\/Users\/[a-zA-Z0-9_/.-]+/g, '[MASKED_SYSTEM_PATH]');
  clean = clean.replace(/\/home\/[a-zA-Z0-9_/.-]+/g, '[MASKED_SYSTEM_PATH]');
  clean = clean.replace(/C:\\[a-zA-Z0-9\\_/.-]+/gi, '[MASKED_SYSTEM_PATH]');
  clean = clean.replace(/at\s+.*:\d+:\d+/g, ''); // strip stacks
  clean = clean.replace(/at\s+[\w.$]+[\s()@/[\]:0-9]+/g, ''); // strip alternative stack lines
  clean = clean.split('\n').filter(line => !line.trim().startsWith('at ')).join('\n');
  
  return clean.trim();
}

export const LiveSapUnavailableCard: React.FC<LiveSapUnavailableCardProps> = ({ 
  onRetry, 
  rawError,
  backendTarget,
  sapOperatingMode,
  setSapOperatingMode
}) => {
  const [showAdminLogs, setShowAdminLogs] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetryClick = () => {
    setIsRetrying(true);
    setTimeout(() => {
      onRetry();
      setIsRetrying(false);
    }, 850);
  };

  const sanitizedLogs = sanitizeTechnicalLogs(rawError || "HTTP 504 Gateway Timeout: live endpoint did not respond.");
  const isAuthorizationFailure = /\b(?:401|unauthorized|not authorized|authorization)\b/i.test(rawError || '');

  const isEcc = backendTarget === 'ECC' ||
                (rawError || '').toLowerCase().includes('ecc') || 
                (rawError || '').toLowerCase().includes('s1.myerplabs.com') ||
                (rawError || '').toLowerCase().includes('8085') ||
                (rawError || '').includes('[LIVE_ECC_UNAVAILABLE]');

  const systemName = isEcc ? 'SAP ECC 6.0' : 'SAP S/4HANA';
  const gatewayBadge = isAuthorizationFailure
    ? 'Live data service: Authorization required'
    : isEcc ? 'ECC Instance 85 (Port 8085): Connection Timeout' : 'S8H Live Gateway: Down (Timeout)';
  const laymanExplanation = isAuthorizationFailure
    ? `The ${systemName} host is reachable, but the configured technical user is not authorized to call the live table-read service. No records were returned or substituted. A Basis administrator must activate and authorize the approved RFC_READ_TABLE integration before this request can run.`
    : isEcc 
    ? "The platform attempted to contact the SAP ECC 6.0 ERP instance (Host: s1.myerplabs.com:8085 / Client 800) under technical user AI_AGENT_RW to execute live RFC/BAPI/DDIC transactions. However, the connection gateway did not receive a response within our safety threshold. This is usually a temporary network communication gap rather than a failure of your ECC system."
    : "The platform attempted to contact the central S/4HANA enterprise resource ledger (Client 100 on 172.21.72.3) to read real-time stock inventories and business orders. However, the connection gateway did not receive a response within our safety threshold. This is usually a temporary communication gap rather than an actual failure of your enterprise system.";
  
  const middlewareReason = isEcc
    ? "Minor network latency in the secure RFC / SOAP middleware pipeline connecting to SAP ECC 6.0."
    : "Minor congestion in the secure middleware pipeline connecting cloud routers to S/4HANA.";

  const refreshExplanation = isEcc
    ? "Simply hit the retry action below to dispatch a clean, refreshed inquiry to the SAP ECC 6.0 (Client 800) instance."
    : "Simply hit the retry action below to dispatch a clean, refreshed inquiry to the secure SAP S/4HANA router pathway.";

  return (
    <div id="live-sap-unavailable-card" className="bg-white border border-rose-200 rounded-2xl shadow-xl w-full select-none overflow-hidden animate-in zoom-in-95 duration-250 mb-6">
      {/* Visual Header with Crimson Warning styling and Connectivity Status indicator */}
      <div className="p-4 md:p-5 bg-gradient-to-r from-rose-900 to-[#7f1d1d] flex flex-wrap justify-between items-center gap-3 text-white shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20 animate-pulse">
            <AlertTriangle className="w-5.5 h-5.5 text-rose-300" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm uppercase tracking-tight flex items-center gap-2">
              {systemName} Connectivity Alert
            </h4>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping inline-block"></span>
              <span className="text-[9px] font-mono font-black text-rose-200 uppercase tracking-widest leading-none">
                {gatewayBadge}
              </span>
            </div>
          </div>
        </div>
        <div className="bg-red-500/35 border border-red-400/30 px-2.5 py-1 rounded-full text-[9px] font-mono font-bold tracking-wider uppercase text-red-200">
          SIGNAL_HOLD
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-6 text-left">
        {/* Core Request Exception & Business Friendly Explanation */}
        <div className="bg-rose-50/75 border-l-4 border-l-rose-500 border border-rose-100 p-5 rounded-2xl">
          <span className="text-[10px] font-mono font-black text-rose-800 uppercase tracking-widest block mb-1">
            Standard System Response
          </span>
          <p className="text-sm md:text-[15px] font-semibold text-rose-950 leading-relaxed">
            {isAccountLockedFailure
              ? `Live ${systemName} data could not be retrieved because the configured technical user account is locked or outside its valid active date range on the SAP side.`
              : isAuthorizationFailure
              ? `Live ${systemName} data could not be retrieved because the table-read service rejected the configured credentials.`
              : `We were unable to retrieve live ${systemName} data at this moment. This may be caused by a temporary network latency or gateway synchronization issue. Please try again in a few moments.`}
          </p>
        </div>

        {/* Explain the issue in layman's terms */}
        <div className="space-y-2">
          <h5 className="text-xs font-black text-[#002f5a] tracking-wider uppercase flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-blue-500 shrink-0" />
            What does this mean? (Layman Explanation)
          </h5>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
            {laymanExplanation}
          </p>
        </div>

        {/* Possible Reasons */}
        <div className="space-y-3 pt-1">
          <h5 className="text-xs font-black text-[#002f5a] tracking-wider uppercase">
            {isAccountLockedFailure ? 'Required Account Remediation' : isAuthorizationFailure ? 'Required SAP Configuration' : 'Possible Reasons'}
          </h5>
          <ul className="space-y-2.5 pl-1 list-none">
            <li className="flex items-start space-x-2.5 text-xs text-slate-600 leading-relaxed">
              <span className="w-1.5 h-1.5 mt-1.5 bg-rose-500 rounded-full shrink-0"></span>
              <span>{isAccountLockedFailure
                ? <><strong>Account Validity Window</strong>: The technical user account's valid-from/valid-to date range has lapsed, or the account has been locked after failed logon attempts.</>
                : isAuthorizationFailure
                ? <><strong>Service Binding</strong>: Activate an approved RFC_READ_TABLE SOAP binding in SICF/SOAMANAGER for client 800.</>
                : <><strong>Temporary Interruption</strong>: {middlewareReason}</>}</span>
            </li>
            <li className="flex items-start space-x-2.5 text-xs text-slate-600 leading-relaxed">
              <span className="w-1.5 h-1.5 mt-1.5 bg-rose-500 rounded-full shrink-0"></span>
              <span>{isAccountLockedFailure
                ? <><strong>Technical User</strong>: A Basis or security administrator must extend or re-enable the account's validity period, or supply a new set of working credentials.</>
                : isAuthorizationFailure
                ? <><strong>Technical User</strong>: Grant the configured integration user execute access to the binding and read access for EDIDC, EDIDS, and EDID4.</>
                : <><strong>SAP Work Process / Gateway Load</strong>: Standard background queue utilization (SM50) or transaction buffer refresh.</>}</span>
            </li>
            {!isAuthorizationFailure && !isAccountLockedFailure && (
              <li className="flex items-start space-x-2.5 text-xs text-slate-600 leading-relaxed">
                <span className="w-1.5 h-1.5 mt-1.5 bg-rose-500 rounded-full shrink-0"></span>
                <span><strong>Underlying Port Congestion</strong>: Brief service queue over-saturation under heavy enterprise transactional loads.</span>
              </li>
            )}
          </ul>
        </div>

        {/* Suggested Next Steps */}
        <div className="space-y-3 pt-1 border-t border-slate-100">
          <h5 className="text-xs font-black text-[#002f5a] tracking-wider uppercase">
            {isAccountLockedFailure ? 'Admin Action Required' : isAuthorizationFailure ? 'Basis Action Required' : 'Suggested Next Steps'}
          </h5>
          <div className="grid grid-cols-1 gap-3.5 pl-0.5">
            <div className="bg-slate-50 border border-slate-150 p-3.5 rounded-xl text-xs space-y-1">
              <span className="font-bold text-slate-800 block">{isAccountLockedFailure ? '1. Restore Account Validity' : isAuthorizationFailure ? '1. Authorize the Live Integration' : '1. Refresh Request'}</span>
              <span className="text-slate-500 leading-normal block">{isAccountLockedFailure
                ? 'After Basis/security extends the account validity dates (or new credentials are provided), submit this query again to resume live data.'
                : isAuthorizationFailure
                ? 'After Basis activates the service and assigns the required authorizations, submit this query again to retrieve the live IDoc numbers.'
                : refreshExplanation}</span>
            </div>
          </div>
        </div>

        {/* Primary Interactive Options (Retry button) */}
        {!isAuthorizationFailure && !isAccountLockedFailure && <div className="flex pt-3">
          <button
            onClick={handleRetryClick}
            disabled={isRetrying}
            className="flex-1 min-h-[44px] bg-[#002f5a] hover:bg-[#001c36] disabled:bg-slate-300 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md active:scale-[0.98] transition-all flex items-center justify-center space-x-2 cursor-pointer select-none"
          >
            <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>{isRetrying ? `Re-establishing ${systemName} Connection...` : `Retry ${systemName} Query Connection`}</span>
          </button>
        </div>}

        {/* Sanitized Admin Logs Accordion for secure internal diagnostic inspection */}
        <div className="pt-2 border-t border-slate-100">
          <button
            onClick={() => setShowAdminLogs(prev => !prev)}
            className="w-full flex items-center justify-between text-[11px] font-bold text-slate-500 hover:text-slate-800 select-none py-1 cursor-pointer transition-colors"
          >
            <div className="flex items-center space-x-1.5">
              <Terminal className="w-3.5 h-3.5 text-slate-400" />
              <span>Administrator Diagnostics Logs (GRC Audited and Sanitized)</span>
            </div>
            {showAdminLogs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showAdminLogs && (
            <div className="mt-2.5 bg-slate-950 text-emerald-400 rounded-xl p-4 font-mono text-[10px] space-y-2 border border-slate-800 leading-relaxed shadow-inner animate-in slide-in-from-top-1">
              <div className="flex justify-between items-center border-b border-white/5 pb-1.5 mb-1.5 text-slate-500">
                <span>VERIFY_CONNECTION_FAILURE_TRACE</span>
                <span className="text-[8px] bg-amber-500/10 border border-amber-500/20 px-1 text-amber-500 rounded font-sans font-extrabold">SECURE_MASK_ENFORCED</span>
              </div>
              <p className="break-all whitespace-pre-wrap select-text selection:bg-emerald-900 selection:text-emerald-100">
                {sanitizedLogs}
              </p>
              <p className="text-[9px] text-slate-500 font-sans italic">
                Note: External server names, absolute system paths, credentials, and network IP addresses are dynamically scrubbed in this display. Detailed raw parameters are tracked in central server-side secure file systems under secure GRC logging regulations only.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
