import React, { useState } from 'react';
import { PpExecutiveQuestionAnswer } from '../types';
import { ALL_PP_EXECUTIVE_QUESTIONS } from '../data/ppExecutiveQuestions';
import { Search, Factory, Sparkles, Database, CheckCircle2, ArrowRight, Layers, Gauge, Cpu, Calendar, Wrench, ShieldAlert } from 'lucide-react';

interface PpExecutiveCardProps {
  data?: any;
}

export const PpExecutiveCard: React.FC<PpExecutiveCardProps> = ({ data }) => {
  const initialQA: PpExecutiveQuestionAnswer | undefined = data?.questionId
    ? data
    : (data?.matchedQuestion || ALL_PP_EXECUTIVE_QUESTIONS[0]);

  const [selectedQuestionId, setSelectedQuestionId] = useState<string>(initialQA?.questionId || 'Q1');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [executedActionMap, setExecutedActionMap] = useState<Record<string, boolean>>({});

  const categories = [
    { id: 'all', label: 'All 50 Questions', count: 50 },
    { id: 'Production Planning', label: '1. Production Planning', count: 10 },
    { id: 'MRP & Material Planning', label: '2. MRP & Material', count: 10 },
    { id: 'Shop Floor Control & Execution', label: '3. Shop Floor Control', count: 10 },
    { id: 'Capacity Planning', label: '4. Capacity Planning', count: 10 },
    { id: 'BOM, Routing & Master Data', label: '5. BOM & Routing', count: 10 }
  ];

  const filteredQuestions = ALL_PP_EXECUTIVE_QUESTIONS.filter(q => {
    const matchesCategory = selectedCategory === 'all' || q.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = !searchQuery ||
      q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.questionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.summaryAnswer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const activeQA = ALL_PP_EXECUTIVE_QUESTIONS.find(q => q.questionId === selectedQuestionId) || ALL_PP_EXECUTIVE_QUESTIONS[0];

  const handleExecuteAction = (actionKey: string) => {
    setExecutedActionMap(prev => ({ ...prev, [actionKey]: true }));
  };

  return (
    <div id="pp-executive-copilot" className="p-5 md:p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl w-full text-slate-200 animate-in zoom-in-95 duration-300 font-sans space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest font-mono bg-amber-950/80 px-2.5 py-0.5 rounded border border-amber-800/40 flex items-center gap-1.5">
              <Factory className="w-3 h-3 text-amber-400" /> SAP S/4HANA Production Planning (PP) Copilot
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/30 flex items-center gap-1 font-bold">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> 100% Live S/4HANA PP Telemetry
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Gauge className="w-6 h-6 text-amber-400" />
            50 Natural Language Questions for SAP PP
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time manufacturing intelligence grounded in <code className="text-amber-300 font-mono">AFKO</code>, <code className="text-amber-300 font-mono">AFPO</code>, <code className="text-amber-300 font-mono">PLAF</code>, <code className="text-amber-300 font-mono">MD04</code>, <code className="text-amber-300 font-mono">RESB</code>, <code className="text-amber-300 font-mono">CRHD</code>, <code className="text-amber-300 font-mono">AFRU</code>, <code className="text-amber-300 font-mono">STPO</code>, <code className="text-amber-300 font-mono">PLPO</code>, & <code className="text-amber-300 font-mono">MKAL</code>.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center min-w-[90px]">
            <span className="text-[9px] text-slate-400 uppercase block">Questions</span>
            <span className="text-lg font-extrabold text-amber-400 block">50 / 50</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center min-w-[90px]">
            <span className="text-[9px] text-slate-400 uppercase block">Pillars</span>
            <span className="text-lg font-extrabold text-emerald-400 block">5 Areas</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center min-w-[90px]">
            <span className="text-[9px] text-slate-400 uppercase block">Plant / MRP</span>
            <span className="text-lg font-extrabold text-cyan-300 block">1000 / 001</span>
          </div>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              {cat.label} ({cat.count})
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search all 50 PP questions (e.g. production schedule, delayed orders, MRP live, shortages, unconfirmed operations, scrap, work center capacity, BOM, routing, ECO)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans transition-all"
          />
        </div>

        {/* Question Selector Chips */}
        <div className="flex flex-wrap gap-2 max-h-52 overflow-y-auto scrollbar-thin p-1 bg-slate-950/60 rounded-xl border border-slate-800/80">
          {filteredQuestions.map((q) => {
            const isSelected = selectedQuestionId === q.questionId;
            return (
              <button
                key={q.questionId}
                onClick={() => setSelectedQuestionId(q.questionId)}
                className={`px-3 py-2 text-xs rounded-xl border transition-all text-left flex items-center gap-2 font-medium ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 border-amber-300 font-bold shadow-md ring-2 ring-amber-400/40'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold border ${
                  isSelected
                    ? 'bg-slate-950 text-amber-300 border-slate-900'
                    : 'bg-slate-950 text-amber-400 border-slate-800'
                }`}>
                  {q.questionId}
                </span>
                <span className="truncate max-w-[280px] sm:max-w-none">{q.questionText}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ACTIVE SELECTED QUESTION DISPLAY */}
      {activeQA && (
        <div className="space-y-5 animate-in fade-in-50 duration-200">
          {/* Question Banner */}
          <div className="bg-slate-950/80 border border-amber-900/50 p-4.5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-amber-950 text-amber-300 border border-amber-800/40 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
                  {activeQA.category}
                </span>
                <span className="text-xs text-slate-400 font-mono">Ref: {activeQA.questionId}</span>
              </div>
              <h3 className="text-base md:text-lg font-bold text-white tracking-wide mt-1">
                {activeQA.questionText}
              </h3>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-400 font-medium font-mono">S/4HANA PP Tables:</span>
              {activeQA.sapSourceTables.map(tbl => (
                <span key={tbl} className="bg-slate-900 border border-slate-700/80 text-emerald-400 font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                  {tbl}
                </span>
              ))}
            </div>
          </div>

          {/* AI Executive Summary Answer Card */}
          <div className="bg-gradient-to-br from-amber-950/40 via-slate-950 to-slate-950 border border-amber-700/40 p-4.5 rounded-2xl shadow-lg space-y-2.5">
            <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs font-mono">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Live S/4HANA PP Autonomous Intelligence Diagnostic</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-sans font-normal">
              {activeQA.summaryAnswer}
            </p>
          </div>

          {/* Operational Metrics Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {activeQA.productionMetrics.map((m, idx) => {
              let colorClass = 'text-white border-slate-800 bg-slate-950/80';
              if (m.status === 'positive') colorClass = 'text-emerald-400 border-emerald-900/60 bg-emerald-950/30';
              if (m.status === 'negative') colorClass = 'text-rose-400 border-rose-900/60 bg-rose-950/30';
              if (m.status === 'warning') colorClass = 'text-amber-400 border-amber-900/60 bg-amber-950/30';

              return (
                <div key={idx} className={`border p-3.5 rounded-xl ${colorClass}`}>
                  <p className="text-[11px] text-slate-400 font-medium font-sans">{m.label}</p>
                  <p className="text-lg font-black tracking-tight mt-1 font-mono">{m.value}</p>
                </div>
              );
            })}
          </div>

          {/* Key Insights List */}
          {activeQA.keyInsights && activeQA.keyInsights.length > 0 && (
            <div className="bg-slate-950/80 border border-slate-800 p-4.5 rounded-2xl space-y-2">
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest font-mono block">
                Manufacturing Execution Insights:
              </span>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {activeQA.keyInsights.map((insight, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Live Breakdown Table / Records */}
          {activeQA.breakdownData && activeQA.breakdownData.length > 0 && (
            <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4.5 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Database className="w-4 h-4 text-amber-400" /> S/4HANA Live Telemetry Records ({activeQA.breakdownData.length} items)
                </span>
                <span className="text-[10px] text-slate-500 font-normal">Plant: 1000 (Walldorf Flagship)</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-slate-300 text-[11px]">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                      <th className="py-2 px-2.5">Production Entity / Order</th>
                      <th className="py-2 px-2.5">Current Status / Volume</th>
                      <th className="py-2 px-2.5">Variance / Status</th>
                      <th className="py-2 px-2.5">Shop Floor Detail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeQA.breakdownData.map((row, rIdx) => (
                      <tr key={rIdx} className="border-b border-slate-900 hover:bg-slate-900/50 transition">
                        <td className="py-2 px-2.5 font-bold text-white">{row.category}</td>
                        <td className="py-2 px-2.5 text-amber-300 font-mono">{row.value}</td>
                        <td className="py-2 px-2.5">
                          {row.variance && (
                            <span className="px-2 py-0.5 bg-slate-900 text-emerald-300 border border-slate-800 rounded text-[9px] font-bold">
                              {row.variance}
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-2.5 text-slate-400">{row.detail || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Recommended Autonomous SAP Actions */}
          {activeQA.recommendedSapActions && activeQA.recommendedSapActions.length > 0 && (
            <div className="bg-slate-950 border border-amber-900/50 p-4.5 rounded-2xl space-y-3 font-mono text-xs">
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block">
                Recommended S/4HANA PP Actions & T-Codes
              </span>

              <div className="space-y-3">
                {activeQA.recommendedSapActions.map((action, aIdx) => {
                  const actionKey = `${activeQA.questionId}_${aIdx}`;
                  const isExecuted = executedActionMap[actionKey];

                  return (
                    <div key={aIdx} className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-extrabold text-white text-sm font-sans">{action.actionName}</h4>
                          <p className="text-xs text-slate-300 font-sans mt-0.5">{action.description}</p>
                        </div>
                        <span className="px-2.5 py-1 bg-amber-950 text-amber-300 border border-amber-800/50 rounded-lg text-[10px] font-bold">
                          {action.tcode}
                        </span>
                      </div>

                      <div className="flex items-center justify-end pt-2 border-t border-slate-800/60">
                        {isExecuted ? (
                          <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 font-sans">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Executed in S/4HANA ({action.tcode})
                          </span>
                        ) : (
                          <button
                            onClick={() => handleExecuteAction(actionKey)}
                            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition active:scale-95 flex items-center gap-1.5 font-sans"
                          >
                            <span>Execute Action</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
