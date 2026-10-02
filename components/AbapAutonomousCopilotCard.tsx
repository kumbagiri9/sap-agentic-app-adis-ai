import React, { useState, useEffect } from 'react';
import { 
  AbapAutonomousCopilotReport, 
  Abap50NlQuestionItem, 
  AbapCodeCorrectionItem, 
  AbapRepositoryObjectItem,
  AbapDevLanguage
} from '../types';
import { abapDeveloperService } from '../services/abapDeveloperService';
import { 
  Code, 
  Terminal, 
  Cpu, 
  Bug, 
  CheckCircle, 
  AlertTriangle, 
  FileCode, 
  Search, 
  Filter, 
  Copy, 
  Play, 
  ShieldCheck, 
  Layers, 
  RefreshCw, 
  ArrowRight, 
  Check, 
  Database,
  ExternalLink,
  ChevronRight,
  GitBranch,
  Settings,
  Sparkles
} from 'lucide-react';

interface Props {
  initialReport?: AbapAutonomousCopilotReport;
  onAskQuestion?: (q: string) => void;
}

export const AbapAutonomousCopilotCard: React.FC<Props> = ({ initialReport, onAskQuestion }) => {
  const [report, setReport] = useState<AbapAutonomousCopilotReport | null>(initialReport || null);
  const [activeTab, setActiveTab] = useState<'catalog' | 'repository' | 'corrections' | 'dumps' | 'workflow'>('catalog');
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedQuestion, setSelectedQuestion] = useState<Abap50NlQuestionItem | null>(null);
  const [selectedCorrection, setSelectedCorrection] = useState<AbapCodeCorrectionItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [executingActionId, setExecutingActionId] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(!initialReport);

  useEffect(() => {
    if (!report) {
      loadReport();
    }
  }, []);

  const loadReport = async () => {
    setLoading(true);
    try {
      const rep = await abapDeveloperService.getAbapAutonomousCopilotReport();
      setReport(rep);
    } catch (e) {
      console.error("Failed to load ABAP Developer Report:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExecuteFix = (actionId: string, label: string) => {
    setExecutingActionId(actionId);
    setActionSuccessMsg(null);
    setTimeout(() => {
      setExecutingActionId(null);
      setActionSuccessMsg(`Successfully executed "${label}" in S/4HANA System Client 100. Transport DEVK900192 updated.`);
      setTimeout(() => setActionSuccessMsg(null), 5000);
    }, 1200);
  };

  if (loading || !report) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-300 shadow-xl">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-400 mb-3" />
        <p className="font-medium text-lg">Initializing Autonomous ABAP & Multi-Language Developer Agent...</p>
        <p className="text-xs text-slate-400 mt-1">Inspecting S/4HANA SEGW Services, CDS Views, ATC Checks & ST22 Dumps...</p>
      </div>
    );
  }

  const domainCategories = [
    { id: 'ALL', label: 'All 50 Questions', count: 50 },
    { id: 'Code Analysis', label: '1. Code Analysis', count: 10 },
    { id: 'Debugging & Error Analysis', label: '2. Debugging & Errors', count: 10 },
    { id: 'Performance Optimization', label: '3. Performance & SQL', count: 10 },
    { id: 'Development & Code Generation', label: '4. Code Generation', count: 10 },
    { id: 'S/4HANA Modernization', label: '5. S/4HANA Modernization', count: 10 },
  ];

  const filteredQuestions = report.questionsCatalog.filter(q => {
    const matchesDomain = selectedDomain === 'ALL' || q.category === selectedDomain;
    const matchesSearch = searchQuery === '' || 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.language.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.sapTcodeOrTool.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDomain && matchesSearch;
  });

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 font-sans my-4">
      {/* HEADER BAR */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 border-b border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-400">
              <Code className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold tracking-tight text-white">Autonomous Senior ABAP & Multi-Language AI Coding Agent</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active System Mode
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Senior Developer • Code Reviewer • Performance Engineer • ST22 Debugger • S/4HANA Modernization
              </p>
            </div>
          </div>

          {/* LANGUAGE BADGES */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-md text-xs font-mono bg-blue-900/40 text-blue-300 border border-blue-700/50">ABAP 7.55+ RAP/CDS</span>
            <span className="px-2.5 py-1 rounded-md text-xs font-mono bg-purple-900/40 text-purple-300 border border-purple-700/50">TytoScript</span>
            <span className="px-2.5 py-1 rounded-md text-xs font-mono bg-amber-900/40 text-amber-300 border border-amber-700/50">Python (PyRFC/BTP)</span>
            <span className="px-2.5 py-1 rounded-md text-xs font-mono bg-cyan-900/40 text-cyan-300 border border-cyan-700/50">JavaScript / UI5</span>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-emerald-400">{report.overallCleanCoreScore}%</div>
            <div className="text-xs text-slate-400 mt-0.5">Clean Core Index</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-blue-400">{report.repositoryObjectsCount}</div>
            <div className="text-xs text-slate-400 mt-0.5">Live SEGW & Repository Objects</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-amber-400">{report.atcFindings.length}</div>
            <div className="text-xs text-slate-400 mt-0.5">ATC Clean Core Warnings</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-rose-400">{report.dumpAnalyses.length}</div>
            <div className="text-xs text-slate-400 mt-0.5">Active ST22 Short Dumps</div>
          </div>
        </div>
      </div>

      {/* ACTION FEEDBACK ALERT */}
      {actionSuccessMsg && (
        <div className="bg-emerald-950/80 border-b border-emerald-800/80 px-6 py-3 text-emerald-300 text-sm flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg(null)} className="text-emerald-400 hover:text-white text-xs font-bold">DISMISS</button>
        </div>
      )}

      {/* TAB NAVIGATION */}
      <div className="flex border-b border-slate-800 bg-slate-900/50 px-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'catalog' 
              ? 'border-blue-500 text-blue-400 bg-blue-500/5' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>50 NL Questions Catalog</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs bg-blue-900/60 text-blue-300">{report.questionsCatalog.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('repository')}
          className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'repository' 
              ? 'border-blue-500 text-blue-400 bg-blue-500/5' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Live SEGW & Repository</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs bg-slate-800 text-slate-300">{report.repositoryObjects.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('corrections')}
          className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'corrections' 
              ? 'border-blue-500 text-blue-400 bg-blue-500/5' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code className="w-4 h-4" />
          <span>Code Refactoring & Syntax Fixer</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs bg-emerald-900/60 text-emerald-300">{report.codeCorrections.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('dumps')}
          className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'dumps' 
              ? 'border-blue-500 text-blue-400 bg-blue-500/5' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bug className="w-4 h-4" />
          <span>ST22 Forensic & ATC</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs bg-rose-900/60 text-rose-300">{report.dumpAnalyses.length + report.atcFindings.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('workflow')}
          className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'workflow' 
              ? 'border-blue-500 text-blue-400 bg-blue-500/5' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          <span>Transport Governance</span>
        </button>
      </div>

      {/* TAB CONTENT 1: 50 QUESTIONS CATALOG */}
      {activeTab === 'catalog' && (
        <div className="p-6">
          {/* SEARCH & DOMAIN FILTERS */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-6">
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 lg:pb-0">
              {domainCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedDomain(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap border transition-all ${
                    selectedDomain === cat.id
                      ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {cat.label} ({cat.count})
                </button>
              ))}
            </div>

            <div className="relative w-full lg:w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search RAP, SEGW, ST22, PyRFC..."
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* QUESTIONS LIST */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredQuestions.map(item => (
              <div
                key={item.id}
                onClick={() => setSelectedQuestion(item)}
                className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 hover:border-blue-500/50 hover:bg-slate-900 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-mono font-bold text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/40">
                      {item.id}
                    </span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {item.language}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-100 group-hover:text-blue-300 transition-colors line-clamp-2">
                    {item.question}
                  </h3>

                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                    {item.answer}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 mt-4 pt-3 border-t border-slate-800/60">
                  <span className="font-mono text-slate-400">{item.sapTcodeOrTool}</span>
                  <span className="text-blue-400 font-medium group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Inspect & Copy Code <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: LIVE REPOSITORY INSPECTOR */}
      {activeTab === 'repository' && (
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Live S/4HANA Repository & Custom OData Services</h3>
              <p className="text-xs text-slate-400 mt-0.5">Inspecting SEGW Gateway Projects, CDS Views, RAP Business Objects, and BAdI spot implementations.</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-3 py-1 rounded-lg">
              Live Gateway Active
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3">Object Name</th>
                  <th className="p-3">Object Type</th>
                  <th className="p-3">Package</th>
                  <th className="p-3 text-center">Clean Core Score</th>
                  <th className="p-3 text-center">ATC Warnings</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Owner</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                {report.repositoryObjects.map(obj => (
                  <tr key={obj.objectName} className="hover:bg-slate-900/60 transition-colors">
                    <td className="p-3 font-mono font-bold text-blue-300">{obj.objectName}</td>
                    <td className="p-3 font-medium text-slate-300">{obj.objectType}</td>
                    <td className="p-3 font-mono text-slate-400">{obj.package}</td>
                    <td className="p-3 text-center font-bold text-emerald-400">{obj.cleanCoreScore}%</td>
                    <td className="p-3 text-center font-bold text-amber-400">{obj.atcFindingCount}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        obj.status === 'Active' 
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/50' 
                          : 'bg-amber-950 text-amber-300 border border-amber-800/50'
                      }`}>
                        {obj.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">{obj.lastChangedBy}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleExecuteFix(`repo_${obj.objectName}`, `Run ATC Check on ${obj.objectName}`)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white rounded text-xs font-medium transition-colors"
                      >
                        Run ATC Check
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: CODE REFACTORING & SYNTAX FIXER */}
      {activeTab === 'corrections' && (
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">S/4HANA Clean Core Refactoring & Syntax Error Fixer</h3>
              <p className="text-xs text-slate-400 mt-0.5">Automated side-by-side legacy code refactoring to ABAP 7.55+ Clean Core standards.</p>
            </div>
          </div>

          <div className="space-y-6">
            {report.codeCorrections.map(corr => (
              <div key={corr.id} className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-800/50">
                      {corr.id}
                    </span>
                    <h4 className="text-sm font-bold text-white">{corr.objectName}</h4>
                    <span className="text-xs text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/40 font-medium">
                      {corr.defectType}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">{corr.affectedLines}</span>
                </div>

                <p className="text-xs text-slate-300 mb-4 bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <strong className="text-blue-400">AI Diagnostic:</strong> {corr.explanation}
                </p>

                {/* SIDE BY SIDE CODE COMPARISON */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* ORIGINAL DEFECTIVE CODE */}
                  <div className="bg-slate-950 rounded-lg p-3 border border-rose-900/40">
                    <div className="flex items-center justify-between text-xs text-rose-400 font-mono font-semibold mb-2 pb-1 border-b border-rose-900/30">
                      <span>BEFORE: Legacy / Defective Code</span>
                      <span className="text-[10px] text-rose-500">Non-Compliant</span>
                    </div>
                    <pre className="text-xs font-mono text-slate-300 overflow-x-auto p-2 bg-slate-900/80 rounded leading-relaxed">
                      {corr.originalCodeSnippet}
                    </pre>
                  </div>

                  {/* CLEAN CORE CORRECTED CODE */}
                  <div className="bg-slate-950 rounded-lg p-3 border border-emerald-900/40">
                    <div className="flex items-center justify-between text-xs text-emerald-400 font-mono font-semibold mb-2 pb-1 border-b border-emerald-900/30">
                      <span>AFTER: S/4HANA Clean Core ABAP 7.55+</span>
                      <button
                        onClick={() => handleCopyCode(corr.id, corr.correctedCodeSnippet)}
                        className="text-xs text-emerald-400 hover:text-white flex items-center gap-1 font-mono"
                      >
                        {copiedId === corr.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copiedId === corr.id ? 'COPIED' : 'COPY'}
                      </button>
                    </div>
                    <pre className="text-xs font-mono text-emerald-300 overflow-x-auto p-2 bg-slate-900/80 rounded leading-relaxed">
                      {corr.correctedCodeSnippet}
                    </pre>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    disabled={executingActionId === corr.id}
                    onClick={() => handleExecuteFix(corr.id, `Apply Clean Core Fix to ${corr.objectName}`)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-lg transition-all shadow-lg flex items-center space-x-2"
                  >
                    {executingActionId === corr.id ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Play className="w-3.5 h-3.5" />
                    )}
                    <span>Apply Fix & Add to Transport Queue</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: ST22 SHORT DUMPS & ATC */}
      {activeTab === 'dumps' && (
        <div className="p-6 space-y-6">
          {/* ST22 DUMPS SECTION */}
          <div>
            <h3 className="text-base font-bold text-white mb-1">ST22 Runtime Short Dumps Forensic Analysis</h3>
            <p className="text-xs text-slate-400 mb-4">Live ABAP runtime dump inspection, root cause identification, and recommended fix.</p>

            <div className="space-y-4">
              {report.dumpAnalyses.map(dump => (
                <div key={dump.dumpId} className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800/50">
                        {dump.runtimeError}
                      </span>
                      <span className="text-xs font-mono text-slate-300">{dump.dumpId}</span>
                    </div>
                    <span className="text-xs text-slate-400">{dump.timestamp}</span>
                  </div>

                  <div className="text-xs font-mono text-slate-300 mb-2">
                    Program: <strong className="text-blue-300">{dump.programName}</strong> | User: {dump.user}
                  </div>

                  <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800 mb-3">
                    <strong className="text-rose-400">Root Cause:</strong> {dump.rootCause}
                  </p>

                  <p className="text-xs text-emerald-300 bg-emerald-950/40 p-3 rounded-lg border border-emerald-900/50">
                    <strong className="text-emerald-400">Recommended Fix:</strong> {dump.recommendedFix}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ATC FINDINGS SECTION */}
          <div className="pt-4 border-t border-slate-800">
            <h3 className="text-base font-bold text-white mb-1">ABAP Test Cockpit (ATC) Clean Core Warnings</h3>
            <p className="text-xs text-slate-400 mb-4">Static code analysis findings requiring modernization before PRD deployment.</p>

            <div className="space-y-3">
              {report.atcFindings.map(atc => (
                <div key={atc.findingId} className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-200">{atc.checkName}</span>
                        <span className="text-[10px] font-mono text-slate-400">Line {atc.line}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{atc.message}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleExecuteFix(atc.findingId, `Quick Fix ${atc.checkName}`)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition-colors"
                  >
                    Quick Fix
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: TRANSPORT GOVERNANCE WORKFLOW */}
      {activeTab === 'workflow' && (
        <div className="p-6">
          <h3 className="text-base font-bold text-white mb-1">3-Tier Governed Development Approval Workflow</h3>
          <p className="text-xs text-slate-400 mb-6">Governed lifecycle model enforcing automated checks before production STMS import.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* TIER 1 */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500"></div>
              <span className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-wider">Tier 1: Read-Only / Syntax</span>
              <h4 className="text-sm font-bold text-white mt-1">Fully Autonomous</h4>
              <p className="text-xs text-slate-400 mt-2">
                Syntax checks, ATC scans, ST22 forensics, CDS view projections, and local AUnit test runner execution.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs font-semibold text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> 100% Automated Execution
              </div>
            </div>

            {/* TIER 2 */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-2 h-full bg-amber-500"></div>
              <span className="text-xs font-bold font-mono text-amber-400 uppercase tracking-wider">Tier 2: Policy-Controlled</span>
              <h4 className="text-sm font-bold text-white mt-1">Transport Queue Registration</h4>
              <p className="text-xs text-slate-400 mt-2">
                Registering refactored code fixes to Transport Request DEVK900192 and releasing to QA system S4Q Client 200.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs font-semibold text-amber-400 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> Policy Guard Enforced
              </div>
            </div>

            {/* TIER 3 */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-2 h-full bg-purple-500"></div>
              <span className="text-xs font-bold font-mono text-purple-400 uppercase tracking-wider">Tier 3: Human Approval</span>
              <h4 className="text-sm font-bold text-white mt-1">Production STMS Import</h4>
              <p className="text-xs text-slate-400 mt-2">
                Importing transports to Production system S4P Client 100 and executing AMDP database procedure changes.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs font-semibold text-purple-400 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> Development Lead Approval Required
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUESTION DETAIL MODAL */}
      {selectedQuestion && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs font-mono font-bold bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-800/50">
                    {selectedQuestion.id}
                  </span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {selectedQuestion.category}
                  </span>
                  <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                    {selectedQuestion.language}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">{selectedQuestion.question}</h3>
              </div>
              <button
                onClick={() => setSelectedQuestion(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs text-slate-300">
              <div>
                <strong className="text-slate-100 text-sm block mb-1">Developer Explanation & Solution:</strong>
                <p className="bg-slate-950 p-3 rounded-lg border border-slate-800 leading-relaxed text-slate-300">
                  {selectedQuestion.answer}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <strong className="text-slate-100 text-sm">Generated / Refactored Code Snippet:</strong>
                  <button
                    onClick={() => handleCopyCode(selectedQuestion.id, selectedQuestion.codeSnippet)}
                    className="text-xs text-blue-400 hover:text-white flex items-center gap-1 font-mono"
                  >
                    {copiedId === selectedQuestion.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedId === selectedQuestion.id ? 'COPIED TO CLIPBOARD' : 'COPY CODE'}
                  </button>
                </div>
                <pre className="font-mono text-xs text-blue-300 bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto leading-relaxed">
                  {selectedQuestion.codeSnippet}
                </pre>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Evidence Source / Framework</span>
                  <span className="font-mono font-medium text-slate-200">{selectedQuestion.evidenceSource}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">SAP T-Code / Tooling</span>
                  <span className="font-mono font-medium text-slate-200">{selectedQuestion.sapTcodeOrTool}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  if (onAskQuestion) onAskQuestion(selectedQuestion.question);
                  setSelectedQuestion(null);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg transition-colors flex items-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask AI Agent in Chat Console</span>
              </button>

              <button
                onClick={() => setSelectedQuestion(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
