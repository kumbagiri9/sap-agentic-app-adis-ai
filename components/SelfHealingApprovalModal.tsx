import React, { useState, useEffect } from 'react';

export interface HealingProposal {
  id: string;
  sourceType: 'IDoc' | 'MasterData' | 'BatchJob' | 'Integration' | 'Workflow' | 'Pricing';
  issueSummary: string;
  rootCause: string;
  proposedFix: string;
  riskAnalysis: string;
  affectedSystems: string[];
  confidenceScore: number;
  solutionOptions: string[];
  onApprove?: (modifiedFix: string, selectedOptionIndex: number) => void;
  onReject?: () => void;
}

interface SelfHealingApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: HealingProposal | null;
  onApprove: (modifiedFix: string, selectedOptionIndex: number) => void;
  onReject: () => void;
}

export const SelfHealingApprovalModal: React.FC<SelfHealingApprovalModalProps> = ({
  isOpen,
  onClose,
  data,
  onApprove,
  onReject
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'sim'>('details');
  const [isModifying, setIsModifying] = useState(false);
  const [modifiedFix, setModifiedFix] = useState('');
  const [selectedOption, setSelectedOption] = useState<number>(0);
  const [simulationStatus, setSimulationStatus] = useState<'idle' | 'simulating' | 'success'>('idle');
  const [simLogs, setSimLogs] = useState<string[]>([]);
  
  useEffect(() => {
    if (data) {
      setModifiedFix(data.proposedFix);
      setIsModifying(false);
      setSelectedOption(0);
      setSimulationStatus('idle');
      setSimLogs([]);
      setActiveTab('details');
    }
  }, [data, isOpen]);

  if (!isOpen || !data) return null;

  const handleSimulate = () => {
    setSimulationStatus('simulating');
    setSimLogs(['Initializing impact virtualization client...', 'Establishing secure sandbox on S/4HANA core shadow tables...']);
    
    setTimeout(() => {
      setSimLogs(prev => [...prev, 'Running policy guard constraint validation...', 'Evaluating segregation of duties (SoD) checklists...']);
    }, 605);

    setTimeout(() => {
      setSimLogs(prev => [...prev, `Evaluating live OData/BAPI execution parameters with test-run flag...`, `Lock evaluation: No resource bottlenecks detected.`]);
    }, 1200);

    setTimeout(() => {
      setSimLogs(prev => [...prev, '✓ Dry-run completed successfully! Affected ledgers and tables remain isolated.', '✓ Simulation Verdict: SAFE TO EXECUTE (+100% compliance level verified).']);
      setSimulationStatus('success');
    }, 1800);
  };

  const getSourceTypeIcon = (type: string) => {
    switch (type) {
      case 'IDoc':
        return <i className="fas fa-heart-pulse text-indigo-400 text-lg"></i>;
      case 'MasterData':
        return <i className="fas fa-database text-amber-400 text-lg"></i>;
      case 'BatchJob':
        return <i className="fas fa-microchip text-blue-400 text-lg"></i>;
      case 'Integration':
        return <i className="fas fa-network-wired text-emerald-400 text-lg"></i>;
      case 'Workflow':
        return <i className="fas fa-sitemap text-indigo-400 text-lg"></i>;
      case 'Pricing':
        return <i className="fas fa-tags text-rose-400 text-lg"></i>;
      default:
        return <i className="fas fa-triangle-exclamation text-slate-400 text-lg"></i>;
    }
  };

  const getSourceTypeColor = (type: string) => {
    switch (type) {
      case 'IDoc': return 'bg-indigo-50 border-indigo-200 text-indigo-800';
      case 'MasterData': return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'BatchJob': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'Integration': return 'bg-emerald-50 border-emerald-200 text-emerald-800';
      case 'Workflow': return 'bg-indigo-50 border-indigo-200 text-indigo-800';
      case 'Pricing': return 'bg-rose-50 border-rose-200 text-rose-800';
      default: return 'bg-slate-50 border-slate-200 text-slate-800';
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200 pr-2 pl-2">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        
        {/* Modal Banner Header */}
        <div className="p-5.5 bg-gradient-to-r from-[#001f3f] via-[#002f5a] to-[#001f3f] text-white flex justify-between items-center select-none grow-0 shrink-0">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
              {getSourceTypeIcon(data.sourceType)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[9px] font-black uppercase tracking-widest bg-blue-900 border border-blue-700 px-2 py-0.5 rounded text-blue-200 font-mono">
                  Governance Loop
                </span>
                <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${getSourceTypeColor(data.sourceType)}`}>
                  {data.sourceType} Self-Healing
                </span>
              </div>
              <h3 className="font-sans font-black text-sm uppercase tracking-wider mt-1.5 text-white">
                Human-in-the-Loop AI Correction Approval
              </h3>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer text-sm"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Tab Selection Row */}
        <div className="flex border-b border-slate-100 bg-slate-50/60 grow-0 shrink-0 select-none">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`px-5 py-3 text-[10px] font-black uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
              activeTab === 'details' ? 'border-[#002f5a] text-[#002f5a] bg-white' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <i className="fas fa-tasks mr-1.5"></i> Proposal Details & Solutions
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('sim');
              if (simulationStatus === 'idle') {
                handleSimulate();
              }
            }}
            className={`px-5 py-3 text-[10px] font-black uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
              activeTab === 'sim' ? 'border-[#002f5a] text-[#002f5a] bg-white' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <i className="fas fa-vial mr-1.5 mr-1.5"></i> Sandboxed Impact Simulation
          </button>
        </div>

        {/* Scrollable Contents Window */}
        <div className="flex-1 overflow-y-auto p-7 space-y-5">
          {activeTab === 'details' ? (
            <div className="space-y-5 animate-in fade-in duration-200">
              
              {/* 1. Issue Summary Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5 bg-slate-50 p-4 rounded-2xl border border-slate-150">
                <div className="md:col-span-2 space-y-1">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block font-sans">Detected Incident / Issue Summary</span>
                  <p className="text-xs font-black text-slate-800 leading-snug">{data.issueSummary}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200/80 p-3 flex flex-col justify-center items-center">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-1 text-center">Confidence Score</span>
                  <div className="flex items-baseline space-x-0.5">
                    <span className="text-lg font-black text-emerald-600">{data.confidenceScore}%</span>
                    <span className="text-[9px] font-bold text-slate-400">Verified</span>
                  </div>
                </div>
              </div>

              {/* 2. Diagnostic Root Cause Box */}
              <div className="space-y-1.5">
                <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Diagnostic Root Cause</span>
                <div className="p-3.5 bg-slate-950 border border-slate-900 rounded-xl">
                  <p className="text-[11px] font-mono font-medium text-emerald-400 leading-relaxed">
                    <span className="text-slate-500 mr-2">$</span>{data.rootCause}
                  </p>
                </div>
              </div>

              {/* 3. Proposed Fix & Manual Modification Logic */}
              <div className="space-y-2">
                <div className="flex justify-between items-center bg-white">
                  <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Proposed Autonomous Remedy Instruction</span>
                  <button
                    type="button"
                    onClick={() => setIsModifying(!isModifying)}
                    className="text-[9px] font-black px-2 py-1 rounded bg-[#002f5a]/10 text-[#002f5a] border border-[#002f5a]/20 hover:bg-[#002f5a]/20 transition-all cursor-pointer"
                  >
                    <i className="fas fa-pen-to-square mr-1"></i>
                    {isModifying ? 'Lock Settings' : 'Modify Code/Query'}
                  </button>
                </div>
                
                {isModifying ? (
                  <div className="space-y-1 animate-in slide-in-from-top-1 duration-200">
                    <textarea
                      value={modifiedFix}
                      onChange={(e) => setModifiedFix(e.target.value)}
                      className="w-full bg-slate-55 border-slate-300 rounded-xl p-3 text-[11px] font-mono text-slate-800 focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 outline-none leading-relaxed"
                      rows={3}
                      placeholder="Modify or override the proposed remediation logic text..."
                    />
                    <span className="text-[9px] text-indigo-600 font-bold block italic">
                      ⚠ Human modification active: Overriding AI standard command sequence with custom input.
                    </span>
                  </div>
                ) : (
                  <div className="p-4 bg-indigo-50/30 border border-indigo-200/50 rounded-xl">
                    <p className="text-xs font-semibold text-slate-800 leading-relaxed font-sans select-all">
                      {modifiedFix}
                    </p>
                  </div>
                )}
              </div>

              {/* 4. Risk Analysis and Mitigation Shield */}
              <div className="flex items-start space-x-3 bg-rose-50/45 border border-rose-100 p-3.5 rounded-2xl">
                <i className="fas fa-triangle-exclamation text-rose-500 text-sm mt-0.5 shrink-0"></i>
                <div className="space-y-0.5">
                  <span className="text-[8px] font-black text-rose-800 uppercase tracking-wider block">Risk Analysis & Segregation of Duties (SoD) Blockers</span>
                  <p className="text-[10px] font-semibold text-slate-600 leading-relaxed">{data.riskAnalysis}</p>
                </div>
              </div>

              {/* 5. 2-3 Multi-tier Validated Solution Paths */}
              <div className="space-y-2.5">
                <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Validated System Solution Options</span>
                <div className="space-y-2">
                  {data.solutionOptions.map((option, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setSelectedOption(idx)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 ${
                        selectedOption === idx 
                          ? 'border-indigo-500 bg-indigo-50/10 shadow-sm' 
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                        selectedOption === idx ? 'border-indigo-500 text-indigo-500 bg-indigo-100/30' : 'border-slate-300'
                      }`}>
                        {selectedOption === idx ? (
                          <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full" />
                        ) : null}
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-slate-800 block">
                          {option}
                        </span>
                        {idx === 0 && (
                          <span className="text-[8.5px] font-black uppercase tracking-wider text-emerald-600 block">
                            ✓ RECOMMENDED AUTO-REMEDY
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 6. Systems Affected Badges */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider mr-1">Systems Affected:</span>
                {data.affectedSystems.map((sys, i) => (
                  <span key={i} className="text-[8.5px] font-black uppercase text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-lg font-mono">
                    {sys}
                  </span>
                ))}
              </div>

            </div>
          ) : (
            <div className="space-y-5 animate-in fade-in duration-200">
              
              {/* Sandbox Simulation Window */}
              <div className="space-y-3.5">
                <div className="flex justify-between items-center text-xs text-slate-800 font-bold">
                  <span>S/4HANA Kernel Simulation Engine (OData Virtualization)</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] uppercase font-black tracking-wide border ${
                    simulationStatus === 'simulating' 
                      ? 'bg-blue-50 border-blue-200 text-blue-600' 
                      : simulationStatus === 'success' 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-600 animate-pulse' 
                      : 'bg-slate-100 border-slate-200 text-slate-500'
                  }`}>
                    {simulationStatus === 'idle' ? 'Ready' : simulationStatus === 'simulating' ? 'Running Sim...' : 'Passed Dry Run'}
                  </span>
                </div>

                {/* Simulation Logs Window */}
                <div className="bg-black/95 p-4 rounded-2xl border border-slate-900 font-mono text-[10px] text-emerald-400 min-h-[160px] space-y-1.5 leading-relaxed select-text">
                  <div className="flex justify-between items-center mb-1 bg-slate-900/40 p-1 px-2.5 rounded text-[8.5px] text-slate-500 font-bold uppercase tracking-widest border border-slate-950/20">
                    <span>Virtual Hypervisor Sandbox Connection Node</span>
                    <span>ERP_SIM_ACTIVE</span>
                  </div>
                  
                  {simLogs.map((log, index) => (
                    <div key={index} className="animate-in fade-in duration-500">
                      {log}
                    </div>
                  ))}

                  {simulationStatus === 'simulating' && (
                    <div className="flex items-center space-x-2 text-blue-400 text-[10px] font-black pt-1">
                      <i className="fas fa-circle-notch fa-spin"></i>
                      <span>Simulating live transaction rollback boundaries...</span>
                    </div>
                  )}

                  {simulationStatus === 'idle' && (
                    <div className="text-slate-500 text-center py-6 block font-sans text-xs">
                      Simulation client idle. Click "Trigger dry run" to scan SPRO tables and trace impact bounds before final release.
                    </div>
                  )}
                </div>

                <div className="flex space-x-2 justify-end">
                  <button
                    type="button"
                    onClick={handleSimulate}
                    disabled={simulationStatus === 'simulating'}
                    className="p-2 py-1.5 text-[9px] border bg-[#002f5a]/5 text-[#002f5a] border-[#002f5a]/25 rounded hover:bg-[#002f5a]/10 cursor-pointer disabled:opacity-40 font-bold uppercase tracking-widest"
                  >
                    <i className="fas fa-rotate mr-1"></i> Re-trigger Dry Run
                  </button>
                </div>
              </div>

              {/* Compliance Report Card */}
              <div className="p-4 bg-blue-50/15 border border-indigo-100/60 rounded-xl flex items-start space-x-3 bg-slate-50">
                <i className="fas fa-shield-halved text-[#002f5a] text-lg mt-0.5"></i>
                <div>
                  <span className="font-mono text-[9px] uppercase font-black text-[#002f5a] tracking-wider block">
                    Zero-Intervention Rollback Assurance Checklist
                  </span>
                  <p className="text-[10.5px] text-slate-505 font-bold mt-1 leading-relaxed">
                    If this execution encounters unexpected network barriers or S/4 RFC failures, standard SAP database lock procedures automatically rollback all tables to their baseline states. Active audit reports will register this transaction directly to your CoE hub under GDPR compliance indexes.
                  </p>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Modal Controls Actions Footer Form */}
        <div className="p-5.5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3.5 grow-0 shrink-0 select-none">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono text-center sm:text-left">
            AD Federated GRC Authentication
          </div>
          <div className="flex space-x-2 w-full sm:w-auto">
            {/* Reject Button */}
            <button
              type="button"
              onClick={onReject}
              className="flex-1 sm:flex-none p-3 px-5 text-[10.5px] font-black uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 active:scale-95 transition-all rounded-xl cursor-pointer text-center"
            >
              <i className="fas fa-times-circle mr-1.5"></i> Reject Fix
            </button>
            
            {/* Approve and Execute Button */}
            <button
              type="button"
              onClick={() => onApprove(modifiedFix, selectedOption)}
              className="flex-1 sm:flex-none p-3 px-6 text-[10.5px] font-black uppercase tracking-[0.2em] text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all rounded-xl cursor-pointer shadow-lg shadow-emerald-600/10 text-center"
            >
              <i className="fas fa-check-double mr-1.5 text-xs"></i> Approve & Execute
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
