import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Database, 
  HardDrive, 
  Printer, 
  Layers, 
  AlertOctagon, 
  AlertTriangle, 
  RefreshCw, 
  PlusCircle, 
  CheckCircle2, 
  Play, 
  Power, 
  Network, 
  Key, 
  Trash2, 
  Clock, 
  Activity, 
  FileText,
  Search,
  Settings,
  ShieldAlert,
  Server,
  Terminal,
  RotateCcw,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { basisAdminService, BasisSystemMetrics, WorkProcess, BackgroundJob, SpoolRequest } from '../services/basisAdminService';
import { BasisAutonomousPipelineCard } from './DataCards';

interface BasisAdminFormProps {
  tcode?: string;
}

export const BasisAdminForm: React.FC<BasisAdminFormProps> = ({ tcode = 'CCMS' }) => {
  const activeTCode = (tcode || 'CCMS').toUpperCase();
  const [metrics, setMetrics] = useState<BasisSystemMetrics>(basisAdminService.getMetrics());
  const [healthChecklist, setHealthChecklist] = useState<any[]>([]);
  const [isRunningHealthCheck, setIsRunningHealthCheck] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Autonomous Agent state
  const [autonomousResult, setAutonomousResult] = useState<any>(null);
  const [isRunningAutonomousAgent, setIsRunningAutonomousAgent] = useState(false);
  
  // SM37 Search filter
  const [jobNameFilter, setJobNameFilter] = useState('');
  const [jobStatusFilter, setJobStatusFilter] = useState('ALL');

  // SPAD printer setup form state
  const [printerName, setPrinterName] = useState('');
  const [printerModel, setPrinterModel] = useState('HPLJ4');
  const [hostSpool, setHostSpool] = useState('__DEFAULT');

  useEffect(() => {
    setMetrics(basisAdminService.getMetrics());
    runHealthCheckInternal(true); // run initial quiet health check
  }, [tcode]);

  const handleRunAutonomousAgent = () => {
    setIsRunningAutonomousAgent(true);
    setTimeout(() => {
      const res = basisAdminService.executeAutonomousBasisWorkflow(
        "Check my entire SAP landscape, tell me what is broken, what could become critical today, what is affecting the business, and automatically fix whatever is safe."
      );
      setAutonomousResult(res);
      setMetrics({ ...basisAdminService.getMetrics() });
      setIsRunningAutonomousAgent(false);
      showMessage("Autonomous SAP Basis Agent execution completed successfully. Safe fixes applied.", "success");
    }, 800);
  };

  const showMessage = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setActionMessage({ text, type });
    setTimeout(() => {
      setActionMessage(null);
    }, 6000);
  };

  const runHealthCheckInternal = (quiet = false) => {
    if (!quiet) setIsRunningHealthCheck(true);
    
    // Simulate slight delay for professional feel
    setTimeout(() => {
      const res = basisAdminService.runHealthCheck();
      setHealthChecklist(res.checklist);
      if (!quiet) {
        setIsRunningHealthCheck(false);
        showMessage("Live BASIS system diagnostic checks completed successfully across all nodes.", "success");
      }
    }, quiet ? 100 : 800);
  };

  const handleRestartJob = (jobName: string) => {
    const res = basisAdminService.restartJob(jobName);
    if (res.success) {
      setMetrics({ ...basisAdminService.getMetrics() });
      showMessage(res.message, "success");
      runHealthCheckInternal(true);
    } else {
      showMessage(res.message, "error");
    }
  };

  const handleSpoolCleanup = () => {
    const res = basisAdminService.cleanSpoolQueue();
    if (res.success) {
      setMetrics({ ...basisAdminService.getMetrics() });
      showMessage(res.message, "success");
      runHealthCheckInternal(true);
    }
  };

  const handleCreatePrinter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!printerName) {
      showMessage("Printer Output Device Name (e.g. LP03) is required.", "error");
      return;
    }
    const res = basisAdminService.configureOutputDevice(printerName, printerModel, hostSpool);
    if (res.success) {
      setMetrics({ ...basisAdminService.getMetrics() });
      showMessage(res.message, "success");
      setPrinterName('');
    }
  };

  const handleTuneBuffers = () => {
    const res = basisAdminService.tuneBuffers();
    if (res.success) {
      setMetrics({ ...basisAdminService.getMetrics() });
      showMessage(res.message, "success");
    }
  };

  // Filter background jobs
  const filteredJobs = metrics.backgroundJobs.filter(job => {
    const matchesName = job.name.toLowerCase().includes(jobNameFilter.toLowerCase());
    const matchesStatus = jobStatusFilter === 'ALL' || job.status.toUpperCase() === jobStatusFilter.toUpperCase();
    return matchesName && matchesStatus;
  });

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] text-slate-800 font-sans text-left pb-10" id="basis-admin-root">
      {/* Action Notification Message banner */}
      {actionMessage && (
        <div className={`p-4 mx-5 mt-4 rounded-xl border flex items-center justify-between shadow-md transition-all animate-in slide-in-from-top-4 duration-300 ${
          actionMessage.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : actionMessage.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          <div className="flex items-center gap-2">
            {actionMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            ) : actionMessage.type === 'error' ? (
              <AlertOctagon className="w-5 h-5 text-rose-500 shrink-0" />
            ) : (
              <Activity className="w-5 h-5 text-blue-500 shrink-0" />
            )}
            <span className="text-xs font-bold leading-relaxed">{actionMessage.text}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* Header Info Section */}
      <div className="px-6 py-4 bg-white border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono text-[9px] font-black rounded uppercase">
              T-Code: {activeTCode}
            </span>
            <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
              S/4HANA Basis Active
            </span>
          </div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            <Server className="w-5 h-5 text-slate-700" />
            {activeTCode === 'SM50' || activeTCode === 'SM66' ? 'Local Work Process Monitor' : 
             activeTCode === 'SM37' || activeTCode === 'SM36' ? 'Background Job Scheduler & Administration' :
             activeTCode === 'SP01' || activeTCode === 'SPAD' ? 'Spool Output & Device Administration' :
             activeTCode === 'ST02' ? 'ST02: Buffer Tuning & Memory Diagnostics' :
             activeTCode === 'ST22' ? 'ST22: ABAP Short Dumps & Core Exception Forensic' :
             activeTCode === 'DBACOCKPIT' ? 'DBACOCKPIT: HANA Database Performance Cockpit' :
             ['ST03N', 'STAD', 'ST04', 'ST06'].includes(activeTCode) ? 'Performance Analysis & Workload Profiling' :
             'CCMS System Monitoring & Health Center'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Authorized admin credentials active. Simulating core NetWeaver BASIS workload tables.
          </p>
        </div>
        
        {/* Quick T-Code Switcher buttons */}
        <div className="flex flex-wrap gap-1.5 bg-slate-50 border border-slate-200 p-1 rounded-xl">
          <button 
            onClick={handleRunAutonomousAgent}
            disabled={isRunningAutonomousAgent}
            className="px-3 py-1.5 text-[9px] font-black uppercase text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg border border-indigo-700 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <Activity className={`w-3.5 h-3.5 ${isRunningAutonomousAgent ? 'animate-spin' : ''}`} />
            {isRunningAutonomousAgent ? 'Orchestrating AI Agents...' : 'Run Autonomous Basis Agent'}
          </button>
          <button 
            onClick={() => runHealthCheckInternal()}
            disabled={isRunningHealthCheck}
            className="px-3 py-1.5 text-[9px] font-black uppercase text-slate-700 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all cursor-pointer flex items-center gap-1"
          >
            <RefreshCw className={`w-3 h-3 ${isRunningHealthCheck ? 'animate-spin' : ''}`} />
            {isRunningHealthCheck ? 'Diagnosing...' : 'Health Check'}
          </button>
        </div>
      </div>

      {/* Main Panel Routing based on activeTCode */}
      <div className="flex-1 p-6 space-y-6">

        {/* Autonomous Pipeline Result Card Display */}
        {autonomousResult && (
          <div className="mb-6">
            <BasisAutonomousPipelineCard data={autonomousResult} />
          </div>
        )}

        {/* 1. HEALTH CHECK & MAIN LANDING COCKPIT (CCMS, RZ20, SOLMAN, FOCUSEDRUN, or any default) */}
        {(!['SM50', 'SM66', 'SM37', 'SM36', 'SP01', 'SPAD', 'ST02', 'ST22', 'DBACOCKPIT', 'ST03N', 'STAD', 'ST04', 'ST06', 'SM12', 'SM13', 'SM59', 'SMGW'].includes(activeTCode)) && (
          <div className="space-y-6">
            
            {/* Server Performance KPI Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 font-mono block">CPU UTILIZATION</span>
                  <div className="text-base font-black text-slate-900 mt-0.5">{metrics.cpuUsage.host}% <span className="text-[10px] text-slate-400 font-mono">Host</span></div>
                  <div className="text-[9px] text-slate-500 font-medium">User: {metrics.cpuUsage.user}% &bull; Sys: {metrics.cpuUsage.system}%</div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 font-mono block">HANA MEMORY POOL</span>
                  <div className="text-base font-black text-slate-900 mt-0.5">{metrics.memory.allocatedGb} GB</div>
                  <div className="text-[9px] text-slate-500 font-medium">Total: {metrics.memory.totalGb} GB &bull; Swap: {metrics.memory.swapUsedGb} GB</div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 font-mono block">WORK PROCESSES</span>
                  <div className="text-base font-black text-emerald-600 mt-0.5">10 Active WP</div>
                  <div className="text-[9px] text-slate-500 font-medium">DIA: 3 &bull; BTC: 2 &bull; UPD: 2 &bull; SPO: 1</div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-red-500 font-mono block">CRITICAL ALERTS</span>
                  <div className="text-base font-black text-red-600 mt-0.5">
                    {metrics.backgroundJobs.filter(j => j.status === 'Aborted').length + metrics.spoolRequests.filter(s => s.status === 'Error').length} Alert(s)
                  </div>
                  <div className="text-[9px] text-slate-500 font-medium">1 ABAP Dump &bull; 1 Spool Fail</div>
                </div>
              </div>
            </div>

            {/* CCMS Alert Monitor & Health Checklist */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Daily Checklist Column */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="px-5 py-4 border-b border-slate-150 flex items-center justify-between bg-slate-50 shrink-0">
                  <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-slate-600" />
                    SAP NetWeaver Daily Health Checklist
                  </h3>
                  <span className="px-2 py-0.5 bg-slate-200 text-slate-600 font-mono text-[8px] font-black rounded uppercase">
                    10 checks run
                  </span>
                </div>
                
                <div className="divide-y divide-slate-100 overflow-y-auto no-scrollbar flex-1 max-h-[480px]">
                  {healthChecklist.map((item, idx) => (
                    <div key={idx} className="p-4 flex items-start justify-between gap-4 hover:bg-slate-50/50 transition-all">
                      <div className="space-y-0.5">
                        <span className="font-bold text-xs text-slate-900 block">{item.name}</span>
                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{item.details}</p>
                      </div>
                      <span className={`px-2.5 py-0.5 text-[8px] font-black uppercase tracking-wider rounded-full border shrink-0 ${
                        item.status === 'healthy' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : item.status === 'warning'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* HANA & System Log Events Column */}
              <div className="space-y-6">
                
                {/* System DB Alerts */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="px-5 py-4 border-b border-slate-150 bg-slate-50">
                    <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-500" />
                      HANA Active DBA Alerts
                    </h3>
                  </div>
                  <div className="p-4 divide-y divide-slate-100">
                    {metrics.hanaAlerts.map(alert => (
                      <div key={alert.id} className="py-2.5 first:pt-0 last:pb-0 space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className="font-black text-slate-400 uppercase">{alert.category} Alert</span>
                          <span className={`px-1.5 py-0.2 rounded font-black uppercase text-[7px] border ${
                            alert.severity === 'critical' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-amber-50 text-amber-600 border-amber-200'
                          }`}>{alert.severity}</span>
                        </div>
                        <p className="text-[11px] text-slate-700 leading-normal font-bold">{alert.description}</p>
                        <span className="text-[9px] text-slate-400 font-mono block">{alert.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SM21 System Log Alerts */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="px-5 py-4 border-b border-slate-150 bg-slate-50">
                    <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-slate-600" />
                      SM21 System Syslog Streams
                    </h3>
                  </div>
                  <div className="p-4 divide-y divide-slate-100">
                    {metrics.systemLogs.map((log, idx) => (
                      <div key={idx} className="py-2.5 first:pt-0 last:pb-0 space-y-1 text-left">
                        <div className="flex justify-between items-center text-[9px] font-mono text-slate-400">
                          <span>{log.timestamp} &bull; {log.area}</span>
                          <span className="font-bold text-slate-600">User: {log.user || 'SYSTEM'}</span>
                        </div>
                        <p className={`text-[11px] leading-relaxed font-semibold ${
                          log.type === 'Error' ? 'text-red-600' : log.type === 'Warning' ? 'text-amber-600' : 'text-slate-600'
                        }`}>{log.message}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* 2. WORK PROCESS MONITOR (SM50, SM66) */}
        {(activeTCode === 'SM50' || activeTCode === 'SM66') && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-150 bg-slate-50 flex justify-between items-center">
              <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-500" />
                Active Work Processes ({activeTCode === 'SM66' ? 'Global Node Cluster' : 'Local App Server'})
              </h3>
              <span className="bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono text-[8px] font-black rounded px-1.5 py-0.5 uppercase">
                RZ10 Max WP Limit: 10
              </span>
            </div>
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-400 font-mono text-[9px] uppercase font-black">
                    <th className="p-3 pl-5">WP ID</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">PID</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">User</th>
                    <th className="p-3">T-Code</th>
                    <th className="p-3">Executing Action / DB Query</th>
                    <th className="p-3">CPU (s)</th>
                    <th className="p-3 pr-5 text-right">Memory (KB)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150">
                  {metrics.workProcesses.map(wp => (
                    <tr key={wp.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 pl-5 font-mono text-slate-500 font-bold">{wp.id}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 text-[8.5px] font-mono font-black uppercase border rounded ${
                          wp.type === 'DIA' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          wp.type === 'BTC' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          wp.type === 'SPO' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          wp.type === 'UPD' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          'bg-slate-100 text-slate-700 border-slate-300'
                        }`}>
                          {wp.type}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-500 font-medium">{wp.pid}</td>
                      <td className="p-3">
                        <span className={`font-bold ${
                          wp.status === 'Running' ? 'text-emerald-600' :
                          wp.status === 'Hold' ? 'text-amber-500 animate-pulse' :
                          wp.status === 'Waiting' ? 'text-blue-500' :
                          'text-slate-400'
                        }`}>
                          {wp.status}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-700">{wp.user || '—'}</td>
                      <td className="p-3 font-mono font-black text-indigo-600">{wp.tcode || '—'}</td>
                      <td className="p-3 font-mono text-slate-600 max-w-xs truncate" title={wp.action}>{wp.action || '—'}</td>
                      <td className="p-3 font-mono text-slate-500">{wp.cpuTime}</td>
                      <td className="p-3 pr-5 font-mono text-right text-slate-600">{wp.memoryKb.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. BACKGROUND JOB MONITOR (SM37, SM36) */}
        {(activeTCode === 'SM37' || activeTCode === 'SM36') && (
          <div className="space-y-6">
            
            {/* Filter Controls Row */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input 
                    type="text" 
                    placeholder="Filter Job Name..."
                    value={jobNameFilter}
                    onChange={(e) => setJobNameFilter(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs w-full md:w-56 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold"
                  />
                </div>
                
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-black text-slate-400 uppercase">Status:</span>
                  <select 
                    value={jobStatusFilter} 
                    onChange={(e) => setJobStatusFilter(e.target.value)}
                    className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:border-indigo-500"
                  >
                    <option value="ALL">All Jobs</option>
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="RELEASED">Released</option>
                    <option value="ACTIVE">Active</option>
                    <option value="FINISHED">Finished</option>
                    <option value="ABORTED">Aborted</option>
                  </select>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 font-mono">
                {filteredJobs.length} Job(s) matching criteria
              </div>
            </div>

            {/* Jobs List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-150 bg-slate-50">
                <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  Background Job Execution Logs (SM37)
                </h3>
              </div>
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-400 font-mono text-[9px] uppercase font-black">
                      <th className="p-3 pl-5">Job Name</th>
                      <th className="p-3">Program Name</th>
                      <th className="p-3">Released By</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Start Date</th>
                      <th className="p-3">Start Time</th>
                      <th className="p-3">Predecessor (Dependency)</th>
                      <th className="p-3">Duration (s)</th>
                      <th className="p-3 pr-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {filteredJobs.map((job, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3 pl-5 font-bold text-slate-900 font-mono">{job.name}</td>
                        <td className="p-3 font-mono text-slate-500">{job.programName}</td>
                        <td className="p-3 font-semibold text-slate-500">{job.releasedBy}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border tracking-wider ${
                            job.status === 'Aborted' ? 'bg-red-50 text-red-700 border-red-200 animate-pulse' :
                            job.status === 'Finished' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            job.status === 'Active' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-slate-50 text-slate-500 border-slate-200'
                          }`}>
                            {job.status}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-slate-500">{job.startDate}</td>
                        <td className="p-3 font-mono text-slate-500">{job.startTime}</td>
                        <td className="p-3 font-mono text-indigo-500 font-bold">{job.dependency}</td>
                        <td className="p-3 font-mono text-slate-500">{job.status === 'Scheduled' || job.status === 'Released' ? '—' : `${job.durationSeconds}s`}</td>
                        <td className="p-3 pr-5 text-right">
                          {job.status === 'Aborted' && (
                            <button 
                              onClick={() => handleRestartJob(job.name)}
                              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-mono text-[9px] font-black uppercase rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer flex items-center gap-1 ml-auto"
                            >
                              <Play className="w-2.5 h-2.5" /> Restart Job
                            </button>
                          )}
                          {job.status === 'Finished' && (
                            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 justify-end">
                              <CheckCircle className="w-3 h-3 text-emerald-500" /> Completed
                            </span>
                          )}
                          {job.status === 'Active' && (
                            <span className="text-[10px] text-amber-500 font-bold flex items-center gap-1 justify-end animate-pulse">
                              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span> Running
                            </span>
                          )}
                          {['Scheduled', 'Released'].includes(job.status) && (
                            <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 justify-end">
                              Queued
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Display logs of the Aborted / Active MRP Job for deep forensics */}
            {metrics.backgroundJobs.find(j => j.name === 'JOB_MRP_DAILY_PL10') && (
              <div className="bg-slate-900 border border-slate-800 text-slate-300 rounded-2xl p-5 shadow-inner">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                  <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider font-mono">
                    Diagnostic Trace: JOB_MRP_DAILY_PL10 Log Dump
                  </span>
                  <span className="px-2 py-0.5 bg-red-950/60 text-red-400 border border-red-900/40 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider font-mono">
                    Exception Record
                  </span>
                </div>
                <div className="space-y-1.5 font-mono text-left max-h-[220px] overflow-y-auto pr-1 text-slate-300 select-all selection:bg-slate-800">
                  {metrics.backgroundJobs.find(j => j.name === 'JOB_MRP_DAILY_PL10')?.logs?.map((log, idx) => (
                    <div key={idx} className={`text-[10.5px] leading-relaxed ${
                      log.includes('aborted abnormally') || log.includes('Deadlock') ? 'text-red-400 font-black' :
                      log.includes('Manual restart') ? 'text-amber-300 font-bold border-l-2 border-amber-400 pl-2 mt-1.5' :
                      log.includes('completed') ? 'text-emerald-400 font-bold' : 'text-slate-400'
                    }`}>
                      &gt; {log}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. SPOOL REQUESTS (SP01, SPAD) */}
        {(activeTCode === 'SP01' || activeTCode === 'SPAD') && (
          <div className="space-y-6">
            
            {/* Spool Clean button & Config options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Spool Queue Manager */}
              <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-150 bg-slate-50 flex justify-between items-center">
                  <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Printer className="w-4 h-4 text-indigo-500" />
                    Spool Controller Queue (SP01)
                  </h3>
                  {metrics.spoolRequests.some(sp => sp.status === 'Error') && (
                    <button 
                      onClick={handleSpoolCleanup}
                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-mono text-[9px] font-black uppercase rounded-lg transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Clear Queue Fails
                    </button>
                  )}
                </div>
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-400 font-mono text-[9px] uppercase font-black">
                        <th className="p-3 pl-5">Spool ID</th>
                        <th className="p-3">Title</th>
                        <th className="p-3">Creator</th>
                        <th className="p-3">Date/Time</th>
                        <th className="p-3">Pages</th>
                        <th className="p-3">Output Device</th>
                        <th className="p-3">Size (KB)</th>
                        <th className="p-3 pr-5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150">
                      {metrics.spoolRequests.map(sp => (
                        <tr key={sp.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3 pl-5 font-mono text-slate-500 font-bold">{sp.id}</td>
                          <td className="p-3 font-semibold text-slate-700">{sp.title}</td>
                          <td className="p-3 font-bold text-slate-600">{sp.creator}</td>
                          <td className="p-3 font-mono text-slate-500">{sp.date} {sp.time}</td>
                          <td className="p-3 font-mono text-slate-500">{sp.pages}</td>
                          <td className="p-3 font-mono text-indigo-600 font-bold">{sp.outputDevice}</td>
                          <td className="p-3 font-mono text-slate-500">{sp.sizeKb}</td>
                          <td className="p-3 pr-5 text-right">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-black uppercase border tracking-wider ${
                              sp.status === 'Compl.' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              sp.status === 'Error' ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse font-black' :
                              sp.status === 'Waiting' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-slate-50 text-slate-500 border-slate-200'
                            }`}>
                              {sp.status === 'Compl.' ? 'COMPLETED' : sp.status === 'Error' ? 'ERROR (LP_FAIL)' : sp.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Printer Output Device Configuration (SPAD) */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-150 bg-slate-50">
                  <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Settings className="w-4 h-4 text-slate-600" />
                    Configure Output Device (SPAD)
                  </h3>
                </div>
                <form onSubmit={handleCreatePrinter} className="p-5 space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-black text-slate-500 uppercase block">Device Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. LP03_PARIS"
                      value={printerName}
                      onChange={(e) => setPrinterName(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-bold font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-black text-slate-500 uppercase block">Device Type / Driver</label>
                    <select 
                      value={printerModel}
                      onChange={(e) => setPrinterModel(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-bold"
                    >
                      <option value="HPLJ4">HP LaserJet 4 Driver (PCL5)</option>
                      <option value="POST2">PostScript Printer v2 (Generic)</option>
                      <option value="SAPWIN">SAPWIN Method G Frontend driver</option>
                      <option value="PDF1">PDF Export converter device</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-black text-slate-500 uppercase block">Host Spool Access Method</label>
                    <select 
                      value={hostSpool}
                      onChange={(e) => setHostSpool(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-bold"
                    >
                      <option value="__DEFAULT">Method G: Front-end local printing</option>
                      <option value="__LPD">Method U: UNIX LPD Service Daemon</option>
                      <option value="__SMB">Method S: Windows SMB network spooler</option>
                    </select>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-[10px] rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <PlusCircle className="w-4 h-4" /> Create Output Device
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}

        {/* 5. BUFFER TUNING & WORKLOAD (ST02) */}
        {(activeTCode === 'ST02') && (
          <div className="space-y-6">
            
            {/* ST02 Buffer Tuning Cards */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-150 bg-slate-50 flex justify-between items-center">
                <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-500" />
                  ST02 NetWeaver Workload Buffer Pool Diagnostics
                </h3>
                {metrics.buffers.some(b => b.status === 'Warning' || b.status === 'Critical') && (
                  <button 
                    onClick={handleTuneBuffers}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-[9px] font-black uppercase rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                  >
                    <Settings className="w-3 h-3" /> Optimize Buffer Limits
                  </button>
                )}
              </div>
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-400 font-mono text-[9px] uppercase font-black">
                      <th className="p-3 pl-5">Buffer Name</th>
                      <th className="p-3">Configured Size (KB)</th>
                      <th className="p-3">Allocated (KB)</th>
                      <th className="p-3">Free Space (KB)</th>
                      <th className="p-3">Hit Ratio (%)</th>
                      <th className="p-3 pr-5 text-right">Health Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {metrics.buffers.map((buffer, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3 pl-5 font-bold text-slate-900 font-mono">{buffer.name}</td>
                        <td className="p-3 font-mono text-slate-600">{buffer.sizeKb.toLocaleString()}</td>
                        <td className="p-3 font-mono text-slate-600">{buffer.allocatedKb.toLocaleString()}</td>
                        <td className="p-3 font-mono text-slate-600">{buffer.freeKb.toLocaleString()}</td>
                        <td className="p-3 font-mono font-black text-indigo-600">{buffer.hitRatio}%</td>
                        <td className="p-3 pr-5 text-right">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-black uppercase border tracking-wider ${
                            buffer.status === 'Excellent' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            buffer.status === 'Warning' ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse' :
                            'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {buffer.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Explanatory notes about buffer tuning in real ERPs */}
            <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200 text-slate-600 text-[11px] leading-relaxed">
              <span className="font-extrabold text-slate-800 uppercase text-[9px] block mb-1 tracking-wider font-mono">
                Buffer tuning guideline (ST02, ST03N)
              </span>
              In high-traffic ERP production environments, if program hit ratios fall below 90% or the Table Definition buffers overflow, transaction latency increases rapidly as requests are forced to fetch definitions from the disk backend. In transactional environments, memory limits inside profile parameters (e.g. `abap/buffersize`, `abap/px_buffer`) are adjusted to align with ST02 analysis.
            </div>
          </div>
        )}

        {/* 6. ABAP SHORT DUMPS FORENSIC ANALYSIS (ST22) */}
        {(activeTCode === 'ST22') && (
          <div className="space-y-6">
            
            {/* Dumps summary */}
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-black text-slate-900 text-sm tracking-tight uppercase">Live Exception Alert: ABAP System Short Dump Triggered</h3>
                <p className="text-xs text-rose-800 font-semibold leading-relaxed mt-1">
                  Encountered 1 critical runtime exception on server node PROD_APP_01 in custom Z-program. Live memory leak diagnostic queue flushed. Use forensic logs below to analyze.
                </p>
              </div>
            </div>

            {/* Short Dump forensics box */}
            <div className="bg-slate-950 text-slate-300 rounded-2xl border border-red-950 overflow-hidden shadow-xl font-mono text-xs text-left">
              <div className="bg-[#1e1e2e] px-5 py-3 border-b border-red-950/50 flex items-center justify-between">
                <span className="font-black text-slate-400 text-[10px] tracking-wider uppercase">ST22 Live Crash Forensic Stream</span>
                <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-[8px] uppercase font-black text-slate-500 block">Runtime Error</span>
                    <span className="font-black text-rose-400 mt-0.5 block text-xs">SAPSQL_ARRAY_INSERT_DUPREC</span>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase font-black text-slate-500 block">ABAP Program</span>
                    <span className="font-bold text-slate-300 mt-0.5 block truncate">/SDF/SAPLSQL_FORENSIC</span>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase font-black text-slate-500 block">Termination Trigger</span>
                    <span className="font-bold text-slate-300 mt-0.5 block">Z_VA01_SALES_SPLIT (User Exit)</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] uppercase font-black text-slate-500 block">Transaction Code</span>
                    <span className="font-black text-indigo-400 mt-0.5 block">VA01</span>
                  </div>
                </div>

                <div>
                  <span className="text-[9px] uppercase font-black text-slate-400 block mb-1">Crash Summary &amp; Event Context</span>
                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-850 leading-relaxed text-[11px] text-slate-300">
                    The exception occurred in program "Z_VA01_SALES_SPLIT" when executing an array insert against table VBAK. The DB driver reported error <span className="text-red-400 font-bold">SQL_DB_00451: Duplicate record insertion block</span> for unique invoice key <span className="text-rose-400">"ORD-80004562"</span>. The transaction was rolled back automatically. No inconsistent rows committed.
                  </div>
                </div>

                <div>
                  <span className="text-[9px] uppercase font-black text-indigo-400 block mb-1">Root Cause &amp; DB Constraint Violation</span>
                  <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-850 leading-relaxed text-[11px]">
                    The split exit attempted to auto-assign a sales split document ID from a stale cache number range instead of querying the dynamic NetWeaver sequence table (NRIV) directly, resulting in collision with an existing posted sales invoice document ID in the database index.
                  </div>
                </div>

                <div className="bg-emerald-950/20 border border-emerald-900/30 p-4 rounded-xl text-emerald-300 leading-relaxed text-xs">
                  <span className="text-[9px] uppercase font-black text-emerald-400 tracking-wider flex items-center mb-1">
                    <Settings className="w-3.5 h-3.5 mr-1.5" /> AI basis self-healing diagnostic resolution
                  </span>
                  Execute command <span className="text-white font-bold bg-slate-900 px-1 py-0.5 rounded font-mono">SNUM</span> / <span className="text-white font-bold bg-slate-900 px-1 py-0.5 rounded font-mono">SNRO</span> on the number range object <span className="text-amber-300 font-mono font-black">RV_BELEG</span>, flush the local NetWeaver application server numbers cache pool using transaction <span className="text-white font-bold bg-slate-900 px-1 py-0.5 rounded font-mono">SM56</span> to sync with DB index, or deploy Transport Request split-exit patch (TR1K90045).
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 7. DBACOCKPIT / DATABASE PERFORMANCE MONITOR (DBACOCKPIT, ST04) */}
        {(activeTCode === 'DBACOCKPIT') && (
          <div className="space-y-6">
            
            {/* Database cockpit widgets */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block font-mono">DB READ TIME (AVG)</span>
                <div className="text-lg font-black text-slate-900 mt-1">1.8 ms <span className="text-xs text-emerald-500 font-bold font-sans">Excellent</span></div>
                <div className="text-[9px] text-slate-500 mt-0.5">Optimized column indices active.</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block font-mono">EXPENSIVE SQL CALLS (LIMIT)</span>
                <div className="text-lg font-black text-amber-600 mt-1">4 Active <span className="text-xs text-amber-500 font-bold font-sans">Warning</span></div>
                <div className="text-[9px] text-slate-500 mt-0.5">Sequential reads detected in MARC table.</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block font-mono">HANA DATA BACKUP</span>
                <div className="text-lg font-black text-emerald-600 mt-1">Success <span className="text-xs text-slate-400 font-mono">23:00:00</span></div>
                <div className="text-[9px] text-slate-500 mt-0.5">Size: 1,120 GB full delta compressed.</div>
              </div>
            </div>

            {/* Lock Entry database blocks */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-150 bg-slate-50 flex justify-between items-center">
                <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Key className="w-4 h-4 text-indigo-500" />
                  DBACOCKPIT Lock Table Entries &amp; Blocks (SM12)
                </h3>
                <span className="text-[10px] text-red-500 font-bold animate-pulse">
                  Exclusive block detected
                </span>
              </div>
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-400 font-mono text-[9px] uppercase font-black">
                      <th className="p-3 pl-5">Locked DB Table</th>
                      <th className="p-3">Lock Argument / Primary Key</th>
                      <th className="p-3">User holding lock</th>
                      <th className="p-3">Lock Mode</th>
                      <th className="p-3 pr-5 text-right">Lock Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {metrics.lockEntries.map((lock, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3 pl-5 font-bold font-mono text-slate-700">{lock.table}</td>
                        <td className="p-3 font-mono text-slate-500 font-bold">{lock.argument}</td>
                        <td className="p-3 font-bold text-slate-700">{lock.user}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[8.5px] font-mono font-black uppercase border ${
                            lock.gmode === 'Exclusive' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}>
                            {lock.gmode}
                          </span>
                        </td>
                        <td className="p-3 pr-5 text-right font-mono text-slate-500">{lock.lockTime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 8. PERFORMANCE & WORKLOAD ANALYSIS (ST03N, STAD, ST04, ST06, SM12, SM13, SM59, SMGW) */}
        {(['ST03N', 'STAD', 'ST04', 'ST06', 'SM12', 'SM13', 'SM59', 'SMGW'].includes(activeTCode)) && (
          <div className="space-y-6">
            
            {/* Specific panels for performance */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-150 bg-slate-50">
                <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-500" />
                  ST03N Transaction Load &amp; Average Response Time Profiling
                </h3>
              </div>
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-400 font-mono text-[9px] uppercase font-black">
                      <th className="p-3 pl-5">T-Code</th>
                      <th className="p-3">Average Response (ms)</th>
                      <th className="p-3">DB CPU Processing (ms)</th>
                      <th className="p-3">OS Workload Execution (ms)</th>
                      <th className="p-3">Network/Wait Queue (ms)</th>
                      <th className="p-3 pr-5 text-right">Executions Count</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {metrics.responseTimes.map(rt => (
                      <tr key={rt.tcode} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3 pl-5 font-bold text-slate-900 font-mono">{rt.tcode}</td>
                        <td className="p-3 font-mono font-bold text-indigo-600">{rt.avgMs} ms</td>
                        <td className="p-3 font-mono text-slate-500">{rt.dbTimeMs} ms</td>
                        <td className="p-3 font-mono text-slate-500">{rt.cpuTimeMs} ms</td>
                        <td className="p-3 font-mono text-slate-500">{rt.waitTimeMs} ms</td>
                        <td className="p-3 pr-5 text-right font-mono text-slate-600">{rt.executions.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* RFC Destinations Monitor for SM59 */}
            {activeTCode === 'SM59' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-150 bg-slate-50">
                  <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Network className="w-4 h-4 text-indigo-500" />
                    SM59 RFC Connectivity Destinations Monitor
                  </h3>
                </div>
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-400 font-mono text-[9px] uppercase font-black">
                        <th className="p-3 pl-5">RFC Connection</th>
                        <th className="p-3">Target Gateway Host</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Ping Latency</th>
                        <th className="p-3 pr-5 text-right">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150">
                      {metrics.rfcDestinations.map(rfc => (
                        <tr key={rfc.name} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3 pl-5 font-bold font-mono text-slate-900">{rfc.name}</td>
                          <td className="p-3 font-mono text-slate-500">{rfc.targetHost}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-black uppercase border tracking-wider ${
                              rfc.status === 'OK' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                            }`}>
                              {rfc.status === 'OK' ? 'CONNECTION OK' : 'GATEWAY FAIL'}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-slate-500">{rfc.status === 'OK' ? `${rfc.pingMs} ms` : '—'}</td>
                          <td className="p-3 pr-5 text-right font-mono text-[10px] text-slate-500 max-w-xs truncate">{rfc.errorMessage || 'Link active'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
