import React, { useState } from 'react';
import { 
  FileText, 
  BookOpen, 
  Layers, 
  Globe, 
  GraduationCap, 
  GitCommit, 
  Rocket, 
  CheckCircle2, 
  Copy, 
  Check, 
  Sparkles, 
  Download, 
  Database, 
  Code, 
  ArrowRight, 
  ShieldCheck, 
  Terminal, 
  AlertCircle,
  FileCheck,
  Zap,
  ListOrdered
} from 'lucide-react';

interface Props {
  data: any;
}

export const AbapAutonomousDocumentationCard: React.FC<Props> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<
    'ALL' | 'TECH_SPEC' | 'FUNC_MAPPING' | 'API_DOC' | 'JUNIOR_EXPLANATION' | 'SEQUENCE_DIAGRAM' | 'DEPLOYMENT' | 'TEST_EVIDENCE'
  >('ALL');

  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!data) return null;

  const targetObject = data.targetObject || 'ZCL_ORDER_PROCESSOR';
  const techSpec = data.technicalSpec || {};
  const funcMapping = data.functionalToTechnicalMapping || [];
  const apiDoc = data.apiDocumentation || {};
  const juniorExp = data.juniorDeveloperExplanation || {};
  const sequenceDiag = data.sequenceDiagram || {};
  const deployment = data.deploymentInstructions || {};
  const testEv = data.testEvidence || {};

  const handleCopy = (sectionKey: string, textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 font-sans my-4">
      {/* HEADER BAR */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950/80 to-slate-900 p-6 border-b border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-sky-600/20 border border-sky-500/30 rounded-xl text-sky-400 shadow-lg shadow-sky-950/40">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold tracking-tight text-white">
                  ABAP Autonomous Documentation Engine
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-sky-400 animate-pulse" />
                  S/4HANA AI Technical Writer
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Object: <span className="font-mono font-bold text-cyan-300">{targetObject}</span> • Type: <span className="font-mono text-amber-300">{data.targetObjectType || 'CLAS'}</span> • System: <span className="font-mono text-emerald-400">S4H Client 100</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy('full', JSON.stringify(data, null, 2))}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              {copiedSection === 'full' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              {copiedSection === 'full' ? 'Exported JSON' : 'Copy Full Spec'}
            </button>
            <span className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 shadow-lg shadow-emerald-950/30">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Clean Core Compliant
            </span>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="mt-4 bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-300 leading-relaxed">
          {data.summary}
        </div>
      </div>

      {/* TABS HEADER */}
      <div className="flex border-b border-slate-800 bg-slate-900/50 px-4 pt-3 gap-2 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-3.5 py-2 rounded-t-xl border-t border-x flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'ALL' ? 'bg-slate-950 border-slate-800 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-sky-400" />
          Full Package
        </button>
        <button
          onClick={() => setActiveTab('TECH_SPEC')}
          className={`px-3.5 py-2 rounded-t-xl border-t border-x flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'TECH_SPEC' ? 'bg-slate-950 border-slate-800 text-sky-300' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code className="w-3.5 h-3.5 text-purple-400" />
          Technical Spec
        </button>
        <button
          onClick={() => setActiveTab('FUNC_MAPPING')}
          className={`px-3.5 py-2 rounded-t-xl border-t border-x flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'FUNC_MAPPING' ? 'bg-slate-950 border-slate-800 text-sky-300' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          FS-to-TS Mapping
        </button>
        <button
          onClick={() => setActiveTab('API_DOC')}
          className={`px-3.5 py-2 rounded-t-xl border-t border-x flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'API_DOC' ? 'bg-slate-950 border-slate-800 text-sky-300' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-cyan-400" />
          API Documentation
        </button>
        <button
          onClick={() => setActiveTab('JUNIOR_EXPLANATION')}
          className={`px-3.5 py-2 rounded-t-xl border-t border-x flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'JUNIOR_EXPLANATION' ? 'bg-slate-950 border-slate-800 text-sky-300' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
          Junior Dev Guide
        </button>
        <button
          onClick={() => setActiveTab('SEQUENCE_DIAGRAM')}
          className={`px-3.5 py-2 rounded-t-xl border-t border-x flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'SEQUENCE_DIAGRAM' ? 'bg-slate-950 border-slate-800 text-sky-300' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <GitCommit className="w-3.5 h-3.5 text-indigo-400" />
          Sequence Diagram
        </button>
        <button
          onClick={() => setActiveTab('DEPLOYMENT')}
          className={`px-3.5 py-2 rounded-t-xl border-t border-x flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'DEPLOYMENT' ? 'bg-slate-950 border-slate-800 text-sky-300' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Rocket className="w-3.5 h-3.5 text-rose-400" />
          Deployment
        </button>
        <button
          onClick={() => setActiveTab('TEST_EVIDENCE')}
          className={`px-3.5 py-2 rounded-t-xl border-t border-x flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'TEST_EVIDENCE' ? 'bg-slate-950 border-slate-800 text-sky-300' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
          Test Evidence
        </button>
      </div>

      {/* CONTENT SECTIONS */}
      <div className="p-6 space-y-8">
        
        {/* SECTION 1: TECHNICAL SPECIFICATION */}
        {(activeTab === 'ALL' || activeTab === 'TECH_SPEC') && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">{techSpec.title}</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {techSpec.cleanCoreCompliance}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{techSpec.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Package</span>
                <span className="font-mono text-cyan-300 font-bold">{techSpec.package}</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Software Component</span>
                <span className="font-mono text-amber-300 font-bold">{techSpec.softwareComponent}</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 col-span-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">App Architecture</span>
                <span className="font-mono text-emerald-300 font-bold">{techSpec.appType}</span>
              </div>
            </div>

            {/* DATA MODEL TABLE */}
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-sky-400" />
                Data Model Fields & Types
              </h4>
              <div className="overflow-x-auto rounded-lg border border-slate-800">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase">
                    <tr>
                      <th className="p-2.5">Field Name</th>
                      <th className="p-2.5">ABAP Type</th>
                      <th className="p-2.5">Length</th>
                      <th className="p-2.5">Key Field</th>
                      <th className="p-2.5">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                    {techSpec.dataModel?.map((field: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-900/60">
                        <td className="p-2.5 font-mono text-cyan-300 font-bold">{field.fieldName}</td>
                        <td className="p-2.5 font-mono text-slate-300">{field.type}</td>
                        <td className="p-2.5 font-mono text-slate-400">{field.length}</td>
                        <td className="p-2.5">
                          {field.keyField ? (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">KEY</span>
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </td>
                        <td className="p-2.5 text-slate-300">{field.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* BUSINESS LOGIC */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                <h4 className="font-bold text-sky-300 mb-2 uppercase tracking-wider text-[11px]">Core Execution Flow</h4>
                <ul className="space-y-1.5 text-slate-300">
                  {techSpec.businessLogicOverview?.map((step: string, idx: number) => (
                    <li key={idx} className="leading-relaxed">{step}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                <h4 className="font-bold text-rose-300 mb-2 uppercase tracking-wider text-[11px]">Error Handling & Exceptions</h4>
                <div className="space-y-2">
                  {techSpec.errorHandling?.map((err: any, idx: number) => (
                    <div key={idx} className="bg-slate-900 p-2 rounded border border-slate-800/80">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-rose-400 font-bold">{err.errorKey}</span>
                        <span className="font-mono text-[10px] text-purple-300">{err.exceptionClass}</span>
                      </div>
                      <p className="text-slate-300 text-[11px] mt-0.5">{err.messageText}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: FUNCTIONAL-TO-TECHNICAL MAPPING */}
        {(activeTab === 'ALL' || activeTab === 'FUNC_MAPPING') && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Functional-to-Technical Requirement Mapping</h3>
              </div>
              <span className="text-xs font-mono text-slate-400">FS-TS Traceability Matrix</span>
            </div>

            <div className="space-y-3 text-xs">
              {funcMapping.map((map: any, idx: number) => (
                <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {map.functionalRequirementId}
                      </span>
                      <span className="font-semibold text-white">{map.functionalRequirement}</span>
                    </div>
                    <span className="font-mono text-cyan-300 font-bold text-[11px] bg-slate-900 px-2 py-1 rounded border border-slate-800">
                      {map.technicalComponent}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 text-[11px]">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">ABAP Method / Function</span>
                      <span className="font-mono text-purple-300 font-bold">{map.abapObjectMethod}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">S/4HANA CDS / Table / API</span>
                      <span className="font-mono text-emerald-300 font-bold">{map.s4HanaTablesApi}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Validation & Audit Logic</span>
                      <span className="text-slate-300">{map.validationLogic}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 3: API DOCUMENTATION */}
        {(activeTab === 'ALL' || activeTab === 'API_DOC') && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">API & Integration Specifications</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded font-mono text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {apiDoc.protocol || 'OData V4'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Service Name</span>
                <span className="font-mono text-cyan-300 font-bold">{apiDoc.serviceName}</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Authentication</span>
                <span className="font-mono text-amber-300 font-bold">{apiDoc.authentication}</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Base URL Path</span>
                <span className="font-mono text-slate-300 text-[10px] truncate block">{apiDoc.baseUrl}</span>
              </div>
            </div>

            {/* ENDPOINTS LIST */}
            <div className="space-y-4">
              {apiDoc.endpoints?.map((ep: any, idx: number) => (
                <div key={idx} className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                  <div className="bg-slate-900 p-3 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        ep.httpMethod === 'POST' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      }`}>
                        {ep.httpMethod}
                      </span>
                      <span className="font-mono text-xs font-bold text-white">{ep.endpointPath}</span>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">{ep.summary}</span>
                  </div>

                  <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs font-mono">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Request Payload</span>
                      <pre className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 text-[11px] text-cyan-200 overflow-x-auto">
                        {ep.requestPayload}
                      </pre>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Response Payload</span>
                      <pre className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 text-[11px] text-emerald-200 overflow-x-auto">
                        {ep.responsePayload}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 4: JUNIOR DEVELOPER CODE EXPLANATION */}
        {(activeTab === 'ALL' || activeTab === 'JUNIOR_EXPLANATION') && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Junior Developer & Trainee Code Guide</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Educational Walkthrough
              </span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <strong className="text-emerald-300 font-bold block mb-1">High-Level Conceptual Explanation:</strong>
              {juniorExp.overview}
            </div>

            {/* KEY CONCEPTS EXPLAINED */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Key ABAP & S/4HANA Concepts</h4>
              {juniorExp.keyConceptsExplained?.map((concept: any, idx: number) => (
                <div key={idx} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sky-300">{concept.concept}</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{concept.simpleExplanation}</p>
                  <pre className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 font-mono text-[11px] text-purple-200 overflow-x-auto">
                    {concept.codeExample}
                  </pre>
                </div>
              ))}
            </div>

            {/* COMMON PITFALLS */}
            <div className="bg-slate-950 p-3.5 rounded-lg border border-rose-900/30">
              <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider mb-2 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                Common ABAP Pitfalls to Avoid
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {juniorExp.commonPitfallsToAvoid?.map((pitfall: string, idx: number) => (
                  <li key={idx} className="leading-relaxed">{pitfall}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* SECTION 5: SEQUENCE DIAGRAM */}
        {(activeTab === 'ALL' || activeTab === 'SEQUENCE_DIAGRAM') && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <GitCommit className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">{sequenceDiag.title}</h3>
              </div>
              <button
                onClick={() => handleCopy('mermaid', sequenceDiag.mermaidSyntax)}
                className="text-xs font-mono text-indigo-300 hover:text-white flex items-center gap-1"
              >
                {copiedSection === 'mermaid' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                Copy Mermaid Syntax
              </button>
            </div>

            {/* VISUAL SEQUENCE STEPS */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] mb-2">Sequential Object Message Flow</h4>
              {sequenceDiag.steps?.map((step: any, idx: number) => (
                <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center font-mono font-bold text-[11px]">
                      {step.stepNumber}
                    </span>
                    <div>
                      <span className="font-bold text-white block">{step.message}</span>
                      <span className="text-slate-400 text-[11px]">{step.detail}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[10px] shrink-0">
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-sky-300 border border-slate-800">{step.from}</span>
                    <ArrowRight className="w-3 h-3 text-slate-500" />
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-purple-300 border border-slate-800">{step.to}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* MERMAID CODE BLOCK */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Mermaid UML Diagram Code</span>
              <pre className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] text-indigo-200 overflow-x-auto">
                {sequenceDiag.mermaidSyntax}
              </pre>
            </div>
          </div>
        )}

        {/* SECTION 6: DEPLOYMENT INSTRUCTIONS */}
        {(activeTab === 'ALL' || activeTab === 'DEPLOYMENT') && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-rose-400" />
                <h3 className="text-base font-bold text-white">Deployment & Cutover Instructions</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded font-mono text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                TR: {deployment.transportId}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">Cutover Execution Steps</h4>
              {deployment.cutoverSequence?.map((step: any, idx: number) => (
                <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center justify-center font-mono font-bold text-[11px]">
                      {step.stepNumber}
                    </span>
                    <div>
                      <span className="font-bold text-white block">{step.activity}</span>
                      <span className="text-slate-400 text-[11px]">Verification: {step.verificationMethod}</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-slate-900 font-mono text-[10px] text-amber-300 border border-slate-800 shrink-0">
                    {step.executedBy}
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 text-xs">
              <strong className="text-rose-300 font-bold block mb-1">Rollback Strategy:</strong>
              <p className="text-slate-300">{deployment.rollbackProcedure}</p>
            </div>
          </div>
        )}

        {/* SECTION 7: TEST EVIDENCE */}
        {(activeTab === 'ALL' || activeTab === 'TEST_EVIDENCE') && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Automated Test Execution Evidence</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded font-mono text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {testEv.unitTestCoverage}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Test Run ID</span>
                <span className="font-mono text-cyan-300 font-bold">{testEv.testRunId}</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">ST05 SQL Trace</span>
                <span className="font-mono text-emerald-300 font-bold">VERIFIED CLEAN</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">ATC Clean Core</span>
                <span className="font-mono text-emerald-300 font-bold">ZERO ERRORS</span>
              </div>
            </div>

            {/* TEST CASES TABLE */}
            <div className="overflow-x-auto rounded-lg border border-slate-800 text-xs">
              <table className="w-full text-left text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase">
                  <tr>
                    <th className="p-2.5">Case ID</th>
                    <th className="p-2.5">Description</th>
                    <th className="p-2.5">Input Parameters</th>
                    <th className="p-2.5">Actual Result</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                  {testEv.testCases?.map((tc: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-900/60">
                      <td className="p-2.5 font-mono text-cyan-300 font-bold">{tc.caseId}</td>
                      <td className="p-2.5 text-white font-medium">{tc.description}</td>
                      <td className="p-2.5 font-mono text-[11px] text-slate-400">{tc.inputParameters}</td>
                      <td className="p-2.5 text-slate-300">{tc.actualResult}</td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          {tc.status}
                        </span>
                      </td>
                      <td className="p-2.5 font-mono text-slate-400">{tc.executionTimeMs} ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
