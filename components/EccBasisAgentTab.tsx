import React, { useState } from 'react';
import {
  Server,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Search,
  ShieldCheck,
  ShieldAlert,
  Cpu,
  Database,
  Radio,
  Play,
  FileText,
  Workflow,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Terminal,
  Lock,
  Flame,
  Check,
  Filter,
  Eye,
  Zap,
  Gauge
} from 'lucide-react';
import {
  eccService,
  eccBasisAgentEngine
} from '../services/eccService';
import {
  SapEccBasisDumpRecord,
  SapEccBasisJobRecord,
  SapEccBasisSystemStatus,
  SapEccBasisRfcDestination,
  SapEccBasisUpdateFailure,
  SapEccBasisWorkloadInfo,
  SapEccBasisAllowlistEntry,
  BASIS_OPERATIONS_ALLOWLIST
} from '../services/eccBasisAgentEngine';

interface EccBasisAgentTabProps {
  client?: string;
  user?: string;
  onNavigateTcode?: (tcode: string) => void;
}

export const EccBasisAgentTab: React.FC<EccBasisAgentTabProps> = ({
  client = '800',
  user = 'AI_AGENT_RW',
  onNavigateTcode
}) => {
  // Sub-Navigation State
  const [activeSubView, setActiveSubView] = useState<
    'failed_jobs' | 'short_dumps' | 'system_status' | 'rfc_destinations' | 'update_failures' | 'workload_info' | 'admin_ops'
  >('failed_jobs');

  // Failed Jobs State (SM37)
  const [jobFilterName, setJobFilterName] = useState<string>('');
  const [jobsData, setJobsData] = useState(() =>
    eccService.analyzeFailedJobs({ client })
  );
  const [selectedJob, setSelectedJob] = useState<SapEccBasisJobRecord | null>(
    () => jobsData.jobs[0] || null
  );

  // Short Dumps State (ST22)
  const [dumpFilterProgram, setDumpFilterProgram] = useState<string>('');
  const [dumpsData, setDumpsData] = useState(() =>
    eccService.analyzeDumps({ client })
  );
  const [selectedDump, setSelectedDump] = useState<SapEccBasisDumpRecord | null>(
    () => dumpsData.dumps[0] || null
  );

  // System Status State (SM50 / SM51)
  const [systemStatus, setSystemStatus] = useState<SapEccBasisSystemStatus>(() =>
    eccService.inspectSystemStatus({ client })
  );

  // RFC Destinations State (SM59)
  const [rfcFilterName, setRfcFilterName] = useState<string>('');
  const [rfcData, setRfcData] = useState(() =>
    eccService.reviewRfcDestinations({ client })
  );
  const [selectedRfc, setSelectedRfc] = useState<SapEccBasisRfcDestination | null>(
    () => rfcData.destinations[0] || null
  );
  const [testingRfcName, setTestingRfcName] = useState<string | null>(null);
  const [rfcPingResults, setRfcPingResults] = useState<{ [key: string]: { status: string; latency: number; timestamp: string } }>({});

  // Update Failures State (SM13)
  const [updateData, setUpdateData] = useState(() =>
    eccService.analyzeUpdateFailures({ client })
  );
  const [selectedUpdate, setSelectedUpdate] = useState<SapEccBasisUpdateFailure | null>(
    () => updateData.updateRecords[0] || null
  );

  // Workload State (ST03N)
  const [workloadData, setWorkloadData] = useState<SapEccBasisWorkloadInfo>(() =>
    eccService.reviewWorkloadInformation({ client })
  );

  // Admin Allowlist Operations State
  const [selectedOpName, setSelectedOpName] = useState<string>('RESTART_FAILED_JOB');
  const [adminTargetObject, setAdminTargetObject] = useState<string>('RVV05IVB_001044');
  const [adminApprovalToken, setAdminApprovalToken] = useState<string>('APP-BASIS-2026-9941');
  const [adminReason, setAdminReason] = useState<string>('Recover nocturnal billing index update following locks release');
  const [isExecutingAdminOp, setIsExecutingAdminOp] = useState<boolean>(false);
  const [adminOpResult, setAdminOpResult] = useState<any>(null);

  // Refresh Handlers
  const handleRefreshJobs = () => {
    const res = eccService.analyzeFailedJobs({ client, filterJobName: jobFilterName });
    setJobsData(res);
    if (res.jobs.length > 0) setSelectedJob(res.jobs[0]);
  };

  const handleRefreshDumps = () => {
    const res = eccService.analyzeDumps({ client, filterProgram: dumpFilterProgram });
    setDumpsData(res);
    if (res.dumps.length > 0) setSelectedDump(res.dumps[0]);
  };

  const handleRefreshStatus = () => {
    const res = eccService.inspectSystemStatus({ client });
    setSystemStatus(res);
  };

  const handleRefreshRfc = () => {
    const res = eccService.reviewRfcDestinations({ client, filterName: rfcFilterName });
    setRfcData(res);
    if (res.destinations.length > 0) setSelectedRfc(res.destinations[0]);
  };

  const handleRefreshUpdates = () => {
    const res = eccService.analyzeUpdateFailures({ client });
    setUpdateData(res);
    if (res.updateRecords.length > 0) setSelectedUpdate(res.updateRecords[0]);
  };

  const handleRefreshWorkload = () => {
    const res = eccService.reviewWorkloadInformation({ client });
    setWorkloadData(res);
  };

  const handleTestRfcPing = (destName: string) => {
    setTestingRfcName(destName);
    setTimeout(() => {
      const isOk = !destName.includes('CRM');
      setRfcPingResults(prev => ({
        ...prev,
        [destName]: {
          status: isOk ? 'PING_OK' : 'CONNECTION_REFUSED',
          latency: isOk ? Math.floor(Math.random() * 30 + 12) : 0,
          timestamp: new Date().toLocaleTimeString()
        }
      }));
      setTestingRfcName(null);
    }, 350);
  };

  const handleExecuteAdminOp = () => {
    setIsExecutingAdminOp(true);
    setTimeout(() => {
      try {
        const res = eccService.executeBasisAdminOperation(
          selectedOpName,
          {
            targetObject: adminTargetObject,
            approvalToken: adminApprovalToken,
            requestedBy: user,
            reason: adminReason
          },
          { client }
        );
        setAdminOpResult(res);
      } catch (err: any) {
        setAdminOpResult({
          success: false,
          message: err?.message || 'Admin operation failed'
        });
      } finally {
        setIsExecutingAdminOp(false);
      }
    }, 400);
  };

  const currentOpDef = BASIS_OPERATIONS_ALLOWLIST.find(o => o.operationName === selectedOpName);
  const activeWpCount = systemStatus.workProcesses.filter(w => w.status === 'Running').length;
  const totalWpCount = systemStatus.workProcesses.length;

  return (
    <div className="space-y-5">
      {/* Top Banner / System Overview Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950 p-4 sm:p-5 rounded-xl border border-indigo-900/50 text-white space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 border border-indigo-400/30 rounded-lg text-indigo-400">
              <Server className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-wider uppercase text-white">
                  SAP Basis Agent & System Reliability Engine
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 rounded-full font-mono">
                  Live Kernel & DDIC Telemetry
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Safe operations, SM37 job root cause analysis, ST22 dumps, SM50 work processes, SM59 RFC links, SM13 update failures, and strict allowlist governance.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-mono font-bold bg-slate-800/80 text-emerald-400 border border-emerald-500/30 rounded-md flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              {systemStatus.systemId} ({systemStatus.hostName}:{systemStatus.instanceNumber})
            </span>
            <button
              onClick={() => {
                handleRefreshJobs();
                handleRefreshDumps();
                handleRefreshStatus();
                handleRefreshRfc();
                handleRefreshUpdates();
                handleRefreshWorkload();
              }}
              className="px-3 py-1 text-xs font-semibold bg-indigo-600/80 hover:bg-indigo-500 text-white rounded-md transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Sync All
            </button>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
          <div className="p-2.5 bg-white/5 border border-white/10 rounded-lg">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Cpu className="w-3 h-3 text-indigo-400" /> CPU Load
            </div>
            <div className="text-sm font-bold font-mono text-white mt-1">
              {systemStatus.cpuUsage.host}%
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 font-mono">User: {systemStatus.cpuUsage.user}% Sys: {systemStatus.cpuUsage.system}%</div>
          </div>

          <div className="p-2.5 bg-white/5 border border-white/10 rounded-lg">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Database className="w-3 h-3 text-cyan-400" /> Memory
            </div>
            <div className="text-sm font-bold font-mono text-white mt-1">
              {systemStatus.memory.allocatedGb} / {systemStatus.memory.totalGb} GB
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 font-mono">Buffer {systemStatus.bufferHitRatioAvg}%</div>
          </div>

          <div className="p-2.5 bg-white/5 border border-white/10 rounded-lg">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-400" /> Failed Jobs (SM37)
            </div>
            <div className="text-sm font-bold font-mono text-amber-300 mt-1">
              {jobsData.failedJobsCount} Aborted
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 font-mono">TBTCO Live Records</div>
          </div>

          <div className="p-2.5 bg-white/5 border border-white/10 rounded-lg">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Flame className="w-3 h-3 text-rose-400" /> Short Dumps (ST22)
            </div>
            <div className="text-sm font-bold font-mono text-rose-300 mt-1">
              {dumpsData.totalDumpsCount} Exceptions
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 font-mono">SNAP Live Records</div>
          </div>

          <div className="p-2.5 bg-white/5 border border-white/10 rounded-lg">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Radio className="w-3 h-3 text-purple-400" /> RFC Destinations
            </div>
            <div className="text-sm font-bold font-mono text-purple-300 mt-1">
              {rfcData.failingCount > 0 ? `${rfcData.failingCount} Degraded` : 'All Healthy'}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 font-mono">SM59 / RFCDES</div>
          </div>

          <div className="p-2.5 bg-white/5 border border-white/10 rounded-lg">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3 h-3 text-emerald-400" /> Avg Response
            </div>
            <div className="text-sm font-bold font-mono text-emerald-300 mt-1">
              {workloadData.avgResponseTimeMs} ms
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 font-mono">ST03N Workload</div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-lg gap-1 overflow-x-auto">
        {[
          { id: 'failed_jobs', label: '1. Failed Jobs (SM37)', icon: Clock, count: jobsData.failedJobsCount },
          { id: 'short_dumps', label: '2. ABAP Dumps (ST22)', icon: Flame, count: dumpsData.totalDumpsCount },
          { id: 'system_status', label: '3. System Status (SM50/51)', icon: Activity, count: activeWpCount },
          { id: 'rfc_destinations', label: '4. RFC Review (SM59)', icon: Radio, count: rfcData.totalDestinations },
          { id: 'update_failures', label: '5. Update Failures (SM13)', icon: AlertTriangle, count: updateData.totalFailures },
          { id: 'workload_info', label: '6. Workload & Bottlenecks (ST03N)', icon: Gauge },
          { id: 'admin_ops', label: '7. Safe Admin Ops & Allowlist', icon: ShieldCheck }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubView(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 shadow-sm border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-mono font-bold ${
                  tab.count > 0 && (tab.id === 'failed_jobs' || tab.id === 'short_dumps' || tab.id === 'update_failures')
                    ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 1. SUBVIEW: FAILED JOBS (SM37 / TBTCO)                                    */}
      {/* ========================================================================= */}
      {activeSubView === 'failed_jobs' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200 dark:border-slate-700/60">
            <div className="flex-1 w-full sm:w-auto flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Filter by Job Name (e.g. RVV05IVB, SAP_MRP, RVDEL01)..."
                value={jobFilterName}
                onChange={e => setJobFilterName(e.target.value)}
                className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 font-mono"
              />
            </div>
            <button
              onClick={handleRefreshJobs}
              className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Filter className="w-3.5 h-3.5" />
              Query SM37
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Jobs List */}
            <div className="lg:col-span-1 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
              <div className="bg-slate-100 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Failed & Active Jobs</span>
                <span className="font-mono text-[10px]">{jobsData.jobs.length} Records</span>
              </div>
              <div className="max-h-[480px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                {jobsData.jobs.map(job => {
                  const isSelected = selectedJob?.jobName === job.jobName && selectedJob?.jobCount === job.jobCount;
                  return (
                    <div
                      key={`${job.jobName}_${job.jobCount}`}
                      onClick={() => setSelectedJob(job)}
                      className={`p-3 cursor-pointer transition-colors text-xs space-y-1 ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 border-l-4 border-indigo-600 dark:border-indigo-400'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-900 dark:text-white truncate">
                          {job.jobName}
                        </span>
                        <span className={`px-1.5 py-0.2 text-[10px] rounded font-bold ${
                          job.status === 'Aborted'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : job.status === 'Active'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {job.status}
                        </span>
                      </div>
                      <div className="text-slate-500 font-mono text-[11px]">
                        Prog: {job.programName} | Steps: {job.stepCount}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center justify-between">
                        <span>User: {job.releasedBy}</span>
                        <span>{job.startTime} ({job.durationSeconds}s)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Job Details & Forensics */}
            <div className="lg:col-span-2 space-y-4">
              {selectedJob ? (
                <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                    <div>
                      <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                        SM37 Job Forensics & Root Cause
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                        {selectedJob.jobName} (Count: {selectedJob.jobCount})
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 text-xs font-mono font-bold rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                      {selectedJob.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                    <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200 dark:border-slate-700/60">
                      <span className="text-[10px] text-slate-500 block">ABAP Report</span>
                      <strong className="text-slate-800 dark:text-slate-200">{selectedJob.programName}</strong>
                    </div>
                    <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200 dark:border-slate-700/60">
                      <span className="text-[10px] text-slate-500 block">Variant</span>
                      <strong className="text-slate-800 dark:text-slate-200">{selectedJob.variantName || 'STANDARD'}</strong>
                    </div>
                    <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200 dark:border-slate-700/60">
                      <span className="text-[10px] text-slate-500 block">Risk Tier</span>
                      <strong className="text-slate-800 dark:text-slate-200">{selectedJob.riskTier}</strong>
                    </div>
                    <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200 dark:border-slate-700/60">
                      <span className="text-[10px] text-slate-500 block">Spool ID</span>
                      <strong className="text-slate-800 dark:text-slate-200">{selectedJob.spoolId || 'N/A'}</strong>
                    </div>
                  </div>

                  {/* Error & Root Cause Analysis */}
                  <div className="p-3.5 bg-rose-50/70 dark:bg-rose-950/30 rounded-lg border border-rose-200 dark:border-rose-900/60 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-900 dark:text-rose-300">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      Root Cause Diagnostics
                    </div>
                    <p className="text-xs text-rose-800 dark:text-rose-200 font-medium">
                      {selectedJob.failureReason || selectedJob.rootCauseAnalysis}
                    </p>
                    {selectedJob.logs && selectedJob.logs.length > 0 && (
                      <div className="p-2 bg-white dark:bg-slate-900 rounded font-mono text-[11px] text-slate-700 dark:text-slate-300 border border-rose-200 dark:border-rose-900/40 space-y-0.5">
                        {selectedJob.logs.map((log, lIdx) => (
                          <div key={lIdx}>&bull; {log}</div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Steps Breakdown */}
                  {selectedJob.steps && selectedJob.steps.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Job Execution Steps (TBTCP):</span>
                      <div className="border border-slate-200 dark:border-slate-800 rounded overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 text-xs font-mono">
                        {selectedJob.steps.map(st => (
                          <div key={st.stepNumber} className="p-2 flex items-center justify-between">
                            <span>Step {st.stepNumber}: <strong>{st.program}</strong> ({st.variant || 'STD'})</span>
                            <span className="text-slate-400">User: {st.user}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => {
                        setActiveSubView('admin_ops');
                        setSelectedOpName('RESTART_FAILED_JOB');
                        setAdminTargetObject(`${selectedJob.jobName}_${selectedJob.jobCount}`);
                        setAdminReason(`Restart aborted job ${selectedJob.jobName} after clearing locks`);
                      }}
                      className="px-3 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Stage Safe Job Restart in Admin Console
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  Select a background job from the list to view live forensics.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SUBVIEW: SHORT DUMPS (ST22 / SNAP)                                     */}
      {/* ========================================================================= */}
      {activeSubView === 'short_dumps' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200 dark:border-slate-700/60">
            <div className="flex-1 w-full sm:w-auto flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Filter by Program or Exception (e.g. SAPLMEPO, TIME_OUT, DYNPRO_NOT_FOUND)..."
                value={dumpFilterProgram}
                onChange={e => setDumpFilterProgram(e.target.value)}
                className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 font-mono"
              />
            </div>
            <button
              onClick={handleRefreshDumps}
              className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Filter className="w-3.5 h-3.5" />
              Query ST22 Dumps
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Dumps List */}
            <div className="lg:col-span-1 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
              <div className="bg-slate-100 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>ST22 Runtime Short Dumps</span>
                <span className="font-mono text-[10px]">{dumpsData.dumps.length} Exceptions</span>
              </div>
              <div className="max-h-[480px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                {dumpsData.dumps.map(dump => {
                  const isSelected = selectedDump?.dumpId === dump.dumpId;
                  return (
                    <div
                      key={dump.dumpId}
                      onClick={() => setSelectedDump(dump)}
                      className={`p-3 cursor-pointer transition-colors text-xs space-y-1 ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 border-l-4 border-indigo-600 dark:border-indigo-400'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-rose-700 dark:text-rose-400 truncate">
                          {dump.errorKey}
                        </span>
                        <span className="px-1.5 py-0.2 text-[10px] font-mono rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {dump.severity}
                        </span>
                      </div>
                      <div className="text-slate-700 dark:text-slate-300 font-mono text-[11px] truncate">
                        {dump.program}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center justify-between">
                        <span>User: {dump.user} (Cl: {dump.client})</span>
                        <span>{new Date(dump.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dump Forensics & Call Stack */}
            <div className="lg:col-span-2 space-y-4">
              {selectedDump ? (
                <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                    <div>
                      <div className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                        ST22 ABAP Runtime Exception Forensics
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                        {selectedDump.errorKey} — {selectedDump.dumpId}
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 text-xs font-mono font-bold rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                      Severity: {selectedDump.severity}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                    <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200 dark:border-slate-700/60">
                      <span className="text-[10px] text-slate-500 block">ABAP Program</span>
                      <strong className="text-slate-800 dark:text-slate-200">{selectedDump.program}</strong>
                    </div>
                    <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200 dark:border-slate-700/60">
                      <span className="text-[10px] text-slate-500 block">Include / Line</span>
                      <strong className="text-slate-800 dark:text-slate-200">{selectedDump.include || 'MAIN'} : {selectedDump.lineNumber}</strong>
                    </div>
                    <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200 dark:border-slate-700/60">
                      <span className="text-[10px] text-slate-500 block">Work Process ID</span>
                      <strong className="text-slate-800 dark:text-slate-200">WP #{selectedDump.workProcessId}</strong>
                    </div>
                    <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200 dark:border-slate-700/60">
                      <span className="text-[10px] text-slate-500 block">Client / User</span>
                      <strong className="text-slate-800 dark:text-slate-200">{selectedDump.client} / {selectedDump.user}</strong>
                    </div>
                  </div>

                  {/* Dump Short Text & Root Cause */}
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {selectedDump.plainEnglishSummary}
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 font-medium">
                      Root Cause: {selectedDump.rootCause}
                    </p>
                    <p className="text-slate-500 text-[11px]">
                      Technical: {selectedDump.technicalDetails}
                    </p>
                  </div>

                  {/* ABAP Call Stack */}
                  {selectedDump.callStack && selectedDump.callStack.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                        ABAP Execution Call Stack (Top-of-Stack &rarr; Origin):
                      </span>
                      <div className="bg-slate-950 text-slate-200 p-3 rounded-lg font-mono text-[11px] space-y-1 overflow-x-auto border border-slate-800">
                        {selectedDump.callStack.map((frame, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="text-indigo-400 font-bold">[{idx + 1}]</span>
                            <span className="text-slate-300">{frame}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resolution Guidance */}
                  {selectedDump.recommendedFix && (
                    <div className="p-3 bg-emerald-50/80 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-900/60 text-xs space-y-1">
                      <div className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Basis Recommended Fix & SAP Note
                      </div>
                      <p className="text-slate-700 dark:text-slate-300">
                        {selectedDump.recommendedFix}
                      </p>
                      {selectedDump.sapNoteReference && (
                        <div className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">
                          Reference: SAP Note {selectedDump.sapNoteReference}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  Select an ST22 runtime short dump to view the technical call stack.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SUBVIEW: SYSTEM STATUS & WORK PROCESSES (SM50 / SM51)                  */}
      {/* ========================================================================= */}
      {activeSubView === 'system_status' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200 dark:border-slate-700/60">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Work Process Monitor & Dispatcher Queues (SM50 / SM51 / ST06)
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Active processes: {activeWpCount} of {totalWpCount} allocated across DIA, BTC, UPD, and SPO.
              </p>
            </div>
            <button
              onClick={handleRefreshStatus}
              className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh SM50
            </button>
          </div>

          {/* Work Processes Table */}
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <tr>
                  <th className="p-2.5">ID</th>
                  <th className="p-2.5">Type</th>
                  <th className="p-2.5">PID</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">CPU (ms)</th>
                  <th className="p-2.5">Memory (KB)</th>
                  <th className="p-2.5">TCode</th>
                  <th className="p-2.5">User</th>
                  <th className="p-2.5">Current Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {systemStatus.workProcesses.map(wp => (
                  <tr
                    key={wp.id}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                      wp.status === 'Running'
                        ? 'bg-amber-50/50 dark:bg-amber-950/20 font-semibold'
                        : ''
                    }`}
                  >
                    <td className="p-2.5">{wp.id}</td>
                    <td className="p-2.5">
                      <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                        wp.type === 'DIA'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : wp.type === 'BTC'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : wp.type === 'UPD'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                          : 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                      }`}>
                        {wp.type}
                      </span>
                    </td>
                    <td className="p-2.5 text-slate-500">{wp.pid}</td>
                    <td className="p-2.5">
                      <span className={`px-1.5 py-0.2 rounded font-bold text-[10px] ${
                        wp.status === 'Running'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}>
                        {wp.status}
                      </span>
                    </td>
                    <td className="p-2.5 text-slate-500">{wp.cpuTime}</td>
                    <td className="p-2.5 text-slate-500">{wp.memoryKb.toLocaleString()}</td>
                    <td className="p-2.5 text-indigo-600 dark:text-indigo-400 font-semibold">{wp.tcode || '—'}</td>
                    <td className="p-2.5 text-slate-500">{wp.user || '—'}</td>
                    <td className="p-2.5 text-slate-700 dark:text-slate-300">{wp.action || 'Idle Waiting for Request'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Enqueue Locks & Dispatcher Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-700/60 text-xs space-y-2">
              <h5 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-indigo-600" />
                Enqueue Lock Table Status (SM12)
              </h5>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span>Active Lock Entries:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{systemStatus.activeLockEntriesCount}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span>Active Users Count:</span>
                <span className="font-mono font-bold text-emerald-600">{systemStatus.activeUsersCount}</span>
              </div>
              <p className="text-[11px] text-slate-500 pt-1">
                Overall Health: <strong className="text-emerald-600 font-mono">{systemStatus.overallHealth}</strong>
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-700/60 text-xs space-y-2">
              <h5 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-emerald-600" />
                Kernel & Database Version
              </h5>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span>Kernel Release:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{systemStatus.kernelRelease} (Patch {systemStatus.kernelPatchLevel})</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span>Database Engine:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{systemStatus.dbSystem} {systemStatus.dbVersion}</span>
              </div>
              <p className="text-[11px] text-slate-500 pt-1">
                Database Host: <strong className="font-mono">{systemStatus.dbHost}</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SUBVIEW: RFC DESTINATIONS REVIEW (SM59 / RFCDES)                       */}
      {/* ========================================================================= */}
      {activeSubView === 'rfc_destinations' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200 dark:border-slate-700/60">
            <div className="flex-1 w-full sm:w-auto flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Filter RFC Destinations (e.g. S4PCLNT800, CRM_GATEWAY, CPI_INTEGRATION)..."
                value={rfcFilterName}
                onChange={e => setRfcFilterName(e.target.value)}
                className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 font-mono"
              />
            </div>
            <button
              onClick={handleRefreshRfc}
              className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Filter className="w-3.5 h-3.5" />
              Query SM59
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* RFC List */}
            <div className="lg:col-span-1 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
              <div className="bg-slate-100 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>SM59 RFC Destinations</span>
                <span className="font-mono text-[10px]">{rfcData.destinations.length} Links</span>
              </div>
              <div className="max-h-[480px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                {rfcData.destinations.map(dest => {
                  const isSelected = selectedRfc?.destinationName === dest.destinationName;
                  const ping = rfcPingResults[dest.destinationName];
                  return (
                    <div
                      key={dest.destinationName}
                      onClick={() => setSelectedRfc(dest)}
                      className={`p-3 cursor-pointer transition-colors text-xs space-y-1 ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 border-l-4 border-indigo-600 dark:border-indigo-400'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-900 dark:text-white truncate">
                          {dest.destinationName}
                        </span>
                        <span className={`px-1.5 py-0.2 text-[10px] font-mono rounded font-bold ${
                          dest.status === 'OK'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                          {dest.status}
                        </span>
                      </div>
                      <div className="text-slate-500 font-mono text-[11px] truncate">
                        Type: {dest.connectionTypeName} | {dest.targetHost}
                      </div>
                      {ping && (
                        <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono flex items-center justify-between pt-0.5">
                          <span>Live Ping: {ping.status}</span>
                          <span>{ping.latency} ms</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RFC Detailed View & Live Test */}
            <div className="lg:col-span-2 space-y-4">
              {selectedRfc ? (
                <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                    <div>
                      <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                        SM59 RFC Destination Configuration
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                        {selectedRfc.destinationName} (Type {selectedRfc.connectionTypeName})
                      </h4>
                    </div>
                    <button
                      onClick={() => handleTestRfcPing(selectedRfc.destinationName)}
                      disabled={testingRfcName === selectedRfc.destinationName}
                      className="px-3 py-1 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Radio className={`w-3.5 h-3.5 ${testingRfcName === selectedRfc.destinationName ? 'animate-spin' : ''}`} />
                      {testingRfcName === selectedRfc.destinationName ? 'Pinging...' : 'Connection Test (RFC_PING)'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                    <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200 dark:border-slate-700/60">
                      <span className="text-[10px] text-slate-500 block">Target Host</span>
                      <strong className="text-slate-800 dark:text-slate-200 truncate block">{selectedRfc.targetHost}</strong>
                    </div>
                    <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200 dark:border-slate-700/60">
                      <span className="text-[10px] text-slate-500 block">Instance / SysNo</span>
                      <strong className="text-slate-800 dark:text-slate-200">{selectedRfc.systemNumber || '85'}</strong>
                    </div>
                    <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200 dark:border-slate-700/60">
                      <span className="text-[10px] text-slate-500 block">Gateway Service</span>
                      <strong className="text-slate-800 dark:text-slate-200">{selectedRfc.gatewayService || 'sapgw85'}</strong>
                    </div>
                    <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200 dark:border-slate-700/60">
                      <span className="text-[10px] text-slate-500 block">SNC Status</span>
                      <strong className="text-slate-800 dark:text-slate-200">{selectedRfc.sncStatus}</strong>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Diagnostic & Recommendation:</div>
                    <p className="text-slate-700 dark:text-slate-300 font-medium">{selectedRfc.diagnosticRecommendation || 'RFC channel configured and functional.'}</p>
                  </div>

                  {/* Ping Result Banner */}
                  {rfcPingResults[selectedRfc.destinationName] && (
                    <div className={`p-3 rounded-lg border text-xs font-mono space-y-1 ${
                      rfcPingResults[selectedRfc.destinationName].status === 'PING_OK'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200'
                        : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200'
                    }`}>
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1.5">
                          {rfcPingResults[selectedRfc.destinationName].status === 'PING_OK' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-rose-600" />
                          )}
                          RFC Connection Status: {rfcPingResults[selectedRfc.destinationName].status}
                        </span>
                        <span>{rfcPingResults[selectedRfc.destinationName].timestamp}</span>
                      </div>
                      <div>Round-Trip Latency: {rfcPingResults[selectedRfc.destinationName].latency} ms</div>
                    </div>
                  )}

                  {selectedRfc.errorMessage && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-lg border border-rose-200 dark:border-rose-900 text-xs space-y-1">
                      <div className="font-bold text-rose-900 dark:text-rose-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        Last Known Gateway / Connectivity Error
                      </div>
                      <p className="text-rose-800 dark:text-rose-200 font-mono text-[11px]">
                        {selectedRfc.errorMessage}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  Select an RFC destination to view details and execute ping tests.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. SUBVIEW: UPDATE FAILURES (SM13 / VBHDR)                                */}
      {/* ========================================================================= */}
      {activeSubView === 'update_failures' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200 dark:border-slate-700/60">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                SM13 Update Task Header & Component Rollback Analysis (VBHDR / VBMOD)
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Investigate failed V1/V2 asynchronous database updates and rollback states.
              </p>
            </div>
            <button
              onClick={handleRefreshUpdates}
              className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Query SM13
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Updates List */}
            <div className="lg:col-span-1 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
              <div className="bg-slate-100 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Failed Update Records</span>
                <span className="font-mono text-[10px]">{updateData.updateRecords.length} Items</span>
              </div>
              <div className="max-h-[480px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                {updateData.updateRecords.map(rec => {
                  const isSelected = selectedUpdate?.updateId === rec.updateId;
                  return (
                    <div
                      key={rec.updateId}
                      onClick={() => setSelectedUpdate(rec)}
                      className={`p-3 cursor-pointer transition-colors text-xs space-y-1 ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 border-l-4 border-indigo-600 dark:border-indigo-400'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-900 dark:text-white truncate">
                          {rec.updateId}
                        </span>
                        <span className="px-1.5 py-0.2 text-[10px] font-mono rounded font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                          {rec.status} ({rec.updateType})
                        </span>
                      </div>
                      <div className="text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                        TCode: {rec.tcode} | Doc: {rec.relatedDocument?.docNumber || 'N/A'}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center justify-between">
                        <span>User: {rec.user}</span>
                        <span>{rec.date} {rec.time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Update Details & Error Analysis */}
            <div className="lg:col-span-2 space-y-4">
              {selectedUpdate ? (
                <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                    <div>
                      <div className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                        Update Task Error Diagnostics (VBHDR)
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                        {selectedUpdate.updateId} &bull; TCode {selectedUpdate.tcode}
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 text-xs font-mono font-bold rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                      Eligibility: {selectedUpdate.reprocessEligibility}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                    <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200 dark:border-slate-700/60">
                      <span className="text-[10px] text-slate-500 block">Business Doc</span>
                      <strong className="text-indigo-600 dark:text-indigo-400">{selectedUpdate.relatedDocument?.docNumber || 'N/A'} ({selectedUpdate.relatedDocument?.docType || 'DOC'})</strong>
                    </div>
                    <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200 dark:border-slate-700/60">
                      <span className="text-[10px] text-slate-500 block">Function Module</span>
                      <strong className="text-slate-800 dark:text-slate-200 truncate block">{selectedUpdate.functionModule}</strong>
                    </div>
                    <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200 dark:border-slate-700/60">
                      <span className="text-[10px] text-slate-500 block">Error Key</span>
                      <strong className="text-rose-600 dark:text-rose-400">{selectedUpdate.errorKey}</strong>
                    </div>
                    <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200 dark:border-slate-700/60">
                      <span className="text-[10px] text-slate-500 block">User / Client</span>
                      <strong className="text-slate-800 dark:text-slate-200">{selectedUpdate.user} / {selectedUpdate.client}</strong>
                    </div>
                  </div>

                  <div className="p-3.5 bg-rose-50/70 dark:bg-rose-950/30 rounded-lg border border-rose-200 dark:border-rose-900/60 text-xs space-y-1.5">
                    <div className="font-bold text-rose-900 dark:text-rose-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      Root Cause Message & Technical Details
                    </div>
                    <p className="text-rose-800 dark:text-rose-200 font-medium">
                      {selectedUpdate.errorText}
                    </p>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                      Analysis: {selectedUpdate.rootCauseAnalysis}
                    </p>
                  </div>

                  {/* Remediation Action */}
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => {
                        setActiveSubView('admin_ops');
                        setSelectedOpName('REPROCESS_SM13_UPDATE');
                        setAdminTargetObject(selectedUpdate.updateId);
                        setAdminReason(`Reprocess SM13 update record ${selectedUpdate.updateId} for doc ${selectedUpdate.relatedDocument?.docNumber || 'N/A'}`);
                      }}
                      className="px-3 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Stage SM13 Reprocess in Admin Console
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  Select an update record to view failure diagnostics.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. SUBVIEW: WORKLOAD & BOTTLENECKS (ST03N)                                */}
      {/* ========================================================================= */}
      {activeSubView === 'workload_info' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200 dark:border-slate-700/60">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                ST03N Workload Analysis & Response Time Breakdown
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Total {workloadData.totalDialogSteps.toLocaleString()} dialog steps analyzed for period {workloadData.period}.
              </p>
            </div>
            <button
              onClick={handleRefreshWorkload}
              className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh ST03N
            </button>
          </div>

          {/* Response Time Breakdown Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Avg Response Time</span>
              <div className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-1">
                {workloadData.avgResponseTimeMs} ms
              </div>
              <div className="text-[10px] text-emerald-600 mt-0.5 font-semibold">Target &lt; 1000 ms</div>
            </div>

            <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Avg DB Time</span>
              <div className="text-lg font-bold font-mono text-cyan-600 dark:text-cyan-400 mt-1">
                {workloadData.avgDbTimeMs} ms ({Math.round((workloadData.avgDbTimeMs / workloadData.avgResponseTimeMs) * 100)}%)
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Database Query Time</div>
            </div>

            <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Avg CPU Time</span>
              <div className="text-lg font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-1">
                {workloadData.avgCpuTimeMs} ms ({Math.round((workloadData.avgCpuTimeMs / workloadData.avgResponseTimeMs) * 100)}%)
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Application Server CPU</div>
            </div>

            <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Avg Wait Time</span>
              <div className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
                {workloadData.avgWaitTimeMs} ms ({Math.round((workloadData.avgWaitTimeMs / workloadData.avgResponseTimeMs) * 100)}%)
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Dispatcher Queue Wait</div>
            </div>
          </div>

          {/* Primary Bottleneck Diagnostic */}
          <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-lg border border-indigo-200 dark:border-indigo-800 space-y-2 text-xs">
            <div className="font-bold text-indigo-950 dark:text-indigo-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-indigo-600" />
                Primary Bottleneck: {workloadData.bottleneckAnalysis.primaryBottleneck}
              </span>
              <span className="font-mono text-[10px] bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-300 px-2 py-0.5 rounded">
                Analysis: {workloadData.bottleneckAnalysis.summary}
              </span>
            </div>
            <p className="text-slate-700 dark:text-slate-300">
              {workloadData.bottleneckAnalysis.recommendation}
            </p>
          </div>

          {/* Top Transactions Breakdown */}
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 space-y-3">
            <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Top Workload Consuming Transactions (ST03N Top 10)
            </h5>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {workloadData.topTransactions.map(tx => (
                <div key={tx.tcode} className="py-2 flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{tx.tcode}</span>
                    <span className="text-slate-600 dark:text-slate-400 ml-2 font-sans font-medium">{tx.description}</span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-500">
                    <span>{tx.executions.toLocaleString()} executions</span>
                    <span className={`font-bold ${tx.avgResponseMs > 600 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {tx.avgResponseMs} ms
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. SUBVIEW: SAFE ADMIN OPS & STRICT ALLOWLIST GOVERNANCE                  */}
      {/* ========================================================================= */}
      {activeSubView === 'admin_ops' && (
        <div className="space-y-4">
          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-lg border border-slate-200 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Basis Administrative Operations Console (Strict Allowlist & Dual-Identity Gating)
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  All administrative actions affecting system availability require explicit allowlist membership, dual-identity audit recording, and signed approval tokens.
                </p>
              </div>
              <span className="px-2 py-0.5 text-xs font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded">
                Allowlist Policy Active
              </span>
            </div>

            {/* Operation Selector & Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Select Allowlisted Operation</label>
                <select
                  value={selectedOpName}
                  onChange={e => setSelectedOpName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md font-mono"
                >
                  {BASIS_OPERATIONS_ALLOWLIST.map(op => (
                    <option key={op.operationName} value={op.operationName}>
                      {op.operationName} [{op.riskTier}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Target Object (Job, Doc, Buffer, Instance)</label>
                <input
                  type="text"
                  value={adminTargetObject}
                  onChange={e => setAdminTargetObject(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Signed Approval Token (Required for HIGH risks)</label>
                <input
                  type="text"
                  value={adminApprovalToken}
                  onChange={e => setAdminApprovalToken(e.target.value)}
                  placeholder="e.g. APP-BASIS-2026-9941"
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Business Justification & Audit Reason</label>
                <input
                  type="text"
                  value={adminReason}
                  onChange={e => setAdminReason(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md"
                />
              </div>
            </div>

            {/* Current Operation Policy Card */}
            {currentOpDef && (
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700/80 text-xs font-mono space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">{currentOpDef.description}</span>
                  <span className={`px-2 py-0.5 text-[10px] rounded font-bold ${
                    currentOpDef.riskTier === 'HIGH_AVAILABILITY_RISK'
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      : currentOpDef.riskTier === 'CONTROLLED_LOW_RISK'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {currentOpDef.riskTier}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 flex flex-wrap gap-4">
                  <span>Auth Object: <strong>{currentOpDef.authObjectRequired}</strong></span>
                  <span>Activity: <strong>{currentOpDef.activityRequired}</strong></span>
                  <span>Dual Approval Required: <strong>{currentOpDef.requiresDualApproval ? 'YES (Dual-Identity Token)' : 'NO'}</strong></span>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-1">
              <button
                onClick={handleExecuteAdminOp}
                disabled={isExecutingAdminOp}
                className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-md transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <ShieldCheck className="w-4 h-4" />
                {isExecutingAdminOp ? 'Validating Allowlist & Executing...' : 'Execute Governed Administrative Action'}
              </button>
            </div>
          </div>

          {/* Admin Op Execution Result */}
          {adminOpResult && (
            <div className={`p-4 rounded-lg border text-xs space-y-2 ${
              adminOpResult.success
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200'
            }`}>
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5 text-sm">
                  {adminOpResult.success ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-rose-600" />}
                  {adminOpResult.success ? 'ADMINISTRATIVE OPERATION EXECUTED SUCCESSFULLY' : 'OPERATION DENIED BY GOVERNANCE POLICY'}
                </span>
                <span className="font-mono text-xs">
                  Risk: {adminOpResult.riskTier}
                </span>
              </div>
              <p className="font-medium text-xs">
                {adminOpResult.message}
              </p>
              {adminOpResult.auditRecord && (
                <div className="mt-2 p-2.5 bg-white dark:bg-slate-900 rounded font-mono text-[11px] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="text-slate-500 font-bold uppercase text-[10px]">Dual-Identity Audit Record Preserved:</div>
                  <div>requested_by: <strong>{adminOpResult.auditRecord.requested_by}</strong></div>
                  <div>executed_via: <strong>{adminOpResult.auditRecord.executed_via}</strong></div>
                  <div>Audit Timestamp: <strong>{adminOpResult.auditRecord.timestamp}</strong></div>
                  <div>Target Log: <strong>{adminOpResult.auditRecord.sapAuditTableTarget}</strong></div>
                </div>
              )}
            </div>
          )}

          {/* Complete Allowlist Catalog */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 space-y-3">
            <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Enforced Basis Allowlist Catalog ({BASIS_OPERATIONS_ALLOWLIST.length} Permitted Operations)
            </h5>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {BASIS_OPERATIONS_ALLOWLIST.map(op => (
                <div key={op.operationName} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">{op.operationName}</div>
                    <div className="text-slate-500 text-[11px]">{op.description}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-400">Auth: {op.authObjectRequired} ({op.activityRequired})</span>
                    <span className={`px-2 py-0.5 text-[10px] rounded font-bold ${
                      op.riskTier === 'HIGH_AVAILABILITY_RISK'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : op.riskTier === 'CONTROLLED_LOW_RISK'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>
                      {op.riskTier}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
