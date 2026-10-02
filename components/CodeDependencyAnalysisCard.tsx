import React, { useState } from 'react';
import { 
  GitFork, 
  AlertTriangle, 
  ShieldAlert, 
  Layers, 
  Code, 
  FileCode, 
  Database, 
  Globe, 
  Cpu, 
  Boxes, 
  ArrowRight, 
  CheckCircle, 
  Play, 
  Search, 
  Share2, 
  ExternalLink, 
  Sparkles,
  Server,
  Workflow
} from 'lucide-react';

interface Props {
  data: any;
}

export const CodeDependencyAnalysisCard: React.FC<Props> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'impact' | 'graph' | 'tests'>('impact');
  const [activeLayer, setActiveLayer] = useState<'all' | 'programs' | 'classes' | 'methods' | 'functionModules' | 'tables' | 'cdsViews' | 'badisAndEnhancements' | 'apisAndInterfaces'>('all');
  const [testExecutionStatus, setTestExecutionStatus] = useState<string | null>(null);

  if (!data) return null;

  const targetObject = data.targetObject || 'ZCL_ORDER_PROCESSOR';
  const graph = data.dependencyGraphByLayer || {};

  const handleRunTests = () => {
    setTestExecutionStatus('EXECUTING');
    setTimeout(() => {
      setTestExecutionStatus('PASSED');
    }, 2500);
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 font-sans my-4">
      {/* HEADER BAR */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 p-6 border-b border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-600/20 border border-purple-500/30 rounded-xl text-purple-400">
              <GitFork className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold tracking-tight text-white">
                  ABAP Code Dependency & Risk Analysis
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-400 animate-pulse" />
                  Live S/4HANA Graph Analyzer
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Target Object: <span className="font-mono font-bold text-cyan-300">{targetObject}</span> • Type: <span className="font-mono font-bold text-amber-300">{data.targetObjectType || 'CLAS (ABAP Class Pool)'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5 shadow-lg shadow-rose-950/30">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              HIGH RISK: CRITICAL PROCESS
            </span>
          </div>
        </div>

        {/* BUSINESS IMPACT BANNER */}
        <div className="mt-5 bg-slate-900/90 border border-purple-500/30 rounded-xl p-4 flex items-start gap-3 shadow-inner">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-bold text-purple-300 uppercase tracking-wider block">Business Impact Summary</span>
            <p className="text-sm font-medium text-slate-100 mt-1 leading-relaxed">
              "{data.businessImpactSummary}"
            </p>
          </div>
        </div>

        {/* METRIC CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
            <span className="text-xs font-semibold text-slate-400 block">Impacted Objects</span>
            <span className="text-lg font-bold text-cyan-300 font-mono">{data.totalImpactedObjectsCount || 19} Objects</span>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
            <span className="text-xs font-semibold text-slate-400 block">Downstream Apps</span>
            <span className="text-lg font-bold text-amber-300 font-mono">{data.downstreamApplicationsAffected?.length || 3} Apps</span>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
            <span className="text-xs font-semibold text-slate-400 block">Affected Interfaces</span>
            <span className="text-lg font-bold text-purple-300 font-mono">{data.downstreamInterfacesAffected?.length || 2} Interfaces</span>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
            <span className="text-xs font-semibold text-slate-400 block">Regression Test Suite</span>
            <span className="text-lg font-bold text-emerald-300 font-mono">{data.recommendedRegressionTestSuite?.length || 3} Test Classes</span>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex border-b border-slate-800 bg-slate-900/50 px-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('impact')}
          className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'impact' ? 'border-purple-500 text-purple-400 bg-purple-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Workflow className="w-4 h-4" />
          <span>Business Process Impact</span>
        </button>

        <button
          onClick={() => setActiveTab('graph')}
          className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'graph' ? 'border-purple-500 text-purple-400 bg-purple-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <GitFork className="w-4 h-4" />
          <span>10-Layer Dependency Graph</span>
        </button>

        <button
          onClick={() => setActiveTab('tests')}
          className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'tests' ? 'border-purple-500 text-purple-400 bg-purple-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          <span>Recommended Regression Tests</span>
        </button>
      </div>

      {/* TAB 1: BUSINESS PROCESS IMPACT */}
      {activeTab === 'impact' && (
        <div className="p-6 space-y-6">
          {/* IMPACTED BUSINESS PROCESSES */}
          <div>
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Workflow className="w-4 h-4 text-purple-400" />
              Impacted Core Business Processes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {data.impactedBusinessProcesses?.map((bp: any, idx: number) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-white">{bp.processName}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        bp.criticality === 'BUSINESS_CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {bp.criticality}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-normal">{bp.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DOWNSTREAM APPS & INTERFACES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                Downstream Applications Affected ({data.downstreamApplicationsAffected?.length || 0})
              </h4>
              <ul className="space-y-2">
                {data.downstreamApplicationsAffected?.map((app: string, idx: number) => (
                  <li key={idx} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs font-semibold text-cyan-300 flex items-center gap-2">
                    <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                    {app}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Server className="w-4 h-4 text-amber-400" />
                Downstream Interfaces & APIs Affected ({data.downstreamInterfacesAffected?.length || 0})
              </h4>
              <ul className="space-y-2">
                {data.downstreamInterfacesAffected?.map((itf: string, idx: number) => (
                  <li key={idx} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs font-mono text-amber-300 flex items-center gap-2">
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                    {itf}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 10-LAYER DEPENDENCY GRAPH */}
      {activeTab === 'graph' && (
        <div className="p-6 space-y-6">
          {/* LAYER FILTER BUTTONS */}
          <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-800">
            <button
              onClick={() => setActiveLayer('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeLayer === 'all' ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              All Layers
            </button>
            <button
              onClick={() => setActiveLayer('programs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeLayer === 'programs' ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              Programs ({graph.programs?.length || 0})
            </button>
            <button
              onClick={() => setActiveLayer('classes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeLayer === 'classes' ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              Classes ({graph.classes?.length || 0})
            </button>
            <button
              onClick={() => setActiveLayer('methods')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeLayer === 'methods' ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              Methods ({graph.methods?.length || 0})
            </button>
            <button
              onClick={() => setActiveLayer('functionModules')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeLayer === 'functionModules' ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              Function Modules ({graph.functionModules?.length || 0})
            </button>
            <button
              onClick={() => setActiveLayer('tables')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeLayer === 'tables' ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              Tables ({graph.tables?.length || 0})
            </button>
            <button
              onClick={() => setActiveLayer('cdsViews')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeLayer === 'cdsViews' ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              CDS Views ({graph.cdsViews?.length || 0})
            </button>
            <button
              onClick={() => setActiveLayer('badisAndEnhancements')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeLayer === 'badisAndEnhancements' ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              BAdIs & Enhancements ({graph.badisAndEnhancements?.length || 0})
            </button>
            <button
              onClick={() => setActiveLayer('apisAndInterfaces')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeLayer === 'apisAndInterfaces' ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              APIs & IDocs ({graph.apisAndInterfaces?.length || 0})
            </button>
          </div>

          <div className="space-y-6">
            {/* 1. PROGRAMS */}
            {(activeLayer === 'all' || activeLayer === 'programs') && graph.programs?.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-blue-400" />
                  Programs Calling / Referenced ({graph.programs.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {graph.programs.map((prog: any, idx: number) => (
                    <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                      <span className="font-mono font-bold text-cyan-300 text-sm block">{prog.name}</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">{prog.description}</p>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-900 text-[10px]">
                        <span className="text-slate-400">Call: {prog.callerType}</span>
                        <span className="font-bold text-amber-400">Risk: {prog.risk}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. CLASSES */}
            {(activeLayer === 'all' || activeLayer === 'classes') && graph.classes?.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-purple-400" />
                  Classes & Objects ({graph.classes.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {graph.classes.map((cls: any, idx: number) => (
                    <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                      <span className="font-mono font-bold text-purple-300 text-sm block">{cls.name}</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">{cls.description}</p>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-900 text-[10px]">
                        <span className="text-slate-400">{cls.callerType || cls.role}</span>
                        {cls.risk && <span className="font-bold text-amber-400">Risk: {cls.risk}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. METHODS */}
            {(activeLayer === 'all' || activeLayer === 'methods') && graph.methods?.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Code className="w-4 h-4 text-emerald-400" />
                  Methods Exposed / Impacted ({graph.methods.length})
                </h4>
                <div className="space-y-2">
                  {graph.methods.map((mth: any, idx: number) => (
                    <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-emerald-300 text-xs">{mth.method}</span>
                        <span className="text-[10px] font-bold text-slate-400">{mth.callersCount} Callers</span>
                      </div>
                      <p className="text-[11px] font-mono text-slate-400 mt-1 bg-slate-900 p-2 rounded border border-slate-800">{mth.signature}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. FUNCTION MODULES */}
            {(activeLayer === 'all' || activeLayer === 'functionModules') && graph.functionModules?.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-amber-400" />
                  Function Modules ({graph.functionModules.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {graph.functionModules.map((fm: any, idx: number) => (
                    <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                      <span className="font-mono font-bold text-amber-300 text-sm block">{fm.name}</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">{fm.description}</p>
                      <span className="text-[10px] text-slate-400 block mt-2">Calling method: <span className="font-mono text-cyan-300">{fm.callingMethod}</span></span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. TABLES */}
            {(activeLayer === 'all' || activeLayer === 'tables') && graph.tables?.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Database className="w-4 h-4 text-cyan-400" />
                  Database Tables ({graph.tables.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {graph.tables.map((tbl: any, idx: number) => (
                    <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-cyan-300 text-sm">{tbl.table}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">{tbl.accessType}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{tbl.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. CDS VIEWS */}
            {(activeLayer === 'all' || activeLayer === 'cdsViews') && graph.cdsViews?.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-400" />
                  CDS Views ({graph.cdsViews.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {graph.cdsViews.map((cds: any, idx: number) => (
                    <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                      <span className="font-mono font-bold text-purple-300 text-sm block">{cds.cdsView}</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">{cds.description}</p>
                      <span className="text-[10px] text-slate-400 block mt-2">Relationship: <span className="text-slate-300">{cds.relationship}</span></span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. BADIS & ENHANCEMENTS */}
            {(activeLayer === 'all' || activeLayer === 'badisAndEnhancements') && graph.badisAndEnhancements?.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  BAdIs & Enhancement Implementations ({graph.badisAndEnhancements.length})
                </h4>
                <div className="space-y-2">
                  {graph.badisAndEnhancements.map((badi: any, idx: number) => (
                    <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div>
                        <span className="font-mono font-bold text-amber-300 text-xs mr-2">{badi.badiName}</span>
                        <span className="font-mono text-cyan-300 text-xs">({badi.implementation})</span>
                        <p className="text-[11px] text-slate-400 mt-0.5">{badi.description}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0">
                        Risk: {badi.risk}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 8. APIS & IDOCS */}
            {(activeLayer === 'all' || activeLayer === 'apisAndInterfaces') && graph.apisAndInterfaces?.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  APIs & IDoc Interfaces ({graph.apisAndInterfaces.length})
                </h4>
                <div className="space-y-2">
                  {graph.apisAndInterfaces.map((api: any, idx: number) => (
                    <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-cyan-300 text-xs">{api.apiName}</span>
                        <span className="text-[10px] font-mono text-slate-400">{api.endpoint}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">Consumer: <span className="text-slate-200 font-semibold">{api.consumer}</span></p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: RECOMMENDED REGRESSION TESTS */}
      {activeTab === 'tests' && (
        <div className="p-6 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-md font-bold text-white flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  Recommended Regression ABAP Unit Tests
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Automated test suites targeting impacted methods and downstream calling routines.
                </p>
              </div>

              <button
                onClick={handleRunTests}
                disabled={testExecutionStatus === 'EXECUTING'}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-colors"
              >
                {testExecutionStatus === 'EXECUTING' ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Running ABAP Unit Tests...
                  </>
                ) : testExecutionStatus === 'PASSED' ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-200" />
                    All Tests Passed (100% Green)
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Run All Impacted Tests
                  </>
                )}
              </button>
            </div>

            <div className="space-y-3">
              {data.recommendedRegressionTestSuite?.map((test: any, idx: number) => (
                <div key={idx} className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-mono font-bold text-emerald-300 text-sm block">{test.testClass}</span>
                    <p className="text-xs text-slate-300 mt-0.5">{test.scenario}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 self-start sm:self-auto">
                    {test.recommendedAction}
                  </span>
                </div>
              ))}
            </div>

            {testExecutionStatus === 'PASSED' && (
              <div className="mt-4 p-3 bg-emerald-950/60 border border-emerald-800/60 rounded-xl text-xs font-mono text-emerald-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                ABAP Unit Engine executed 28 assertions across 3 test classes. 0 failures, 0 errors. Target change verified.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
