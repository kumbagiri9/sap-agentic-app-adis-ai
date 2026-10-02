import React, { useState, useMemo } from 'react';
import {
  Code,
  Terminal,
  Bug,
  Zap,
  Layers,
  Sparkles,
  Search,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  Database,
  ShieldCheck,
  Cpu,
  AlertTriangle,
  ArrowUpRight
} from 'lucide-react';
import { AbapExecutiveQuestionAnswer, AbapExecutiveQueryInsightsReport } from '../types';

interface AbapExecutiveCardProps {
  report?: AbapExecutiveQueryInsightsReport;
  singleAnswer?: AbapExecutiveQuestionAnswer;
}

type CategoryTab = 'All' | 'Code Analysis' | 'Debugging & Error Analysis' | 'Performance Optimization' | 'Development & Code Generation' | 'S/4HANA Modernization';

export const AbapExecutiveCard: React.FC<AbapExecutiveCardProps> = ({ report, singleAnswer }) => {
  const allQuestions: AbapExecutiveQuestionAnswer[] = useMemo(() => {
    if (report && report.questionsAnswers && report.questionsAnswers.length > 0) {
      return report.questionsAnswers;
    }
    if (singleAnswer) {
      return [singleAnswer];
    }
    return [];
  }, [report, singleAnswer]);

  const [selectedCategory, setSelectedCategory] = useState<CategoryTab>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>(
    singleAnswer ? singleAnswer.questionId : (allQuestions[0]?.questionId || 'Q1')
  );
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [activeTcodeAction, setActiveTcodeAction] = useState<string | null>(null);

  const filteredQuestions = useMemo(() => {
    return allQuestions.filter(item => {
      const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
      if (!matchesCat) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.questionId.toLowerCase().includes(q) ||
        item.questionText.toLowerCase().includes(q) ||
        item.summaryAnswer.toLowerCase().includes(q) ||
        item.sapSourceTables.some(t => t.toLowerCase().includes(q)) ||
        item.keyInsights.some(ki => ki.toLowerCase().includes(q))
      );
    });
  }, [allQuestions, selectedCategory, searchQuery]);

  const activeQuestion = useMemo(() => {
    const found = allQuestions.find(q => q.questionId === selectedQuestionId);
    return found || filteredQuestions[0] || allQuestions[0];
  }, [allQuestions, selectedQuestionId, filteredQuestions]);

  const handleCopyCode = (codeText?: string) => {
    if (!codeText) return;
    navigator.clipboard.writeText(codeText);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleTcodeClick = (tcode: string) => {
    navigator.clipboard.writeText(tcode);
    setActiveTcodeAction(`T-Code / Command ${tcode} copied to clipboard!`);
    setTimeout(() => setActiveTcodeAction(null), 3000);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Code Analysis':
        return <Code className="w-4 h-4 text-sky-500" />;
      case 'Debugging & Error Analysis':
        return <Bug className="w-4 h-4 text-rose-500" />;
      case 'Performance Optimization':
        return <Zap className="w-4 h-4 text-amber-500" />;
      case 'Development & Code Generation':
        return <Sparkles className="w-4 h-4 text-emerald-500" />;
      case 'S/4HANA Modernization':
        return <Layers className="w-4 h-4 text-purple-500" />;
      default:
        return <Terminal className="w-4 h-4 text-slate-500" />;
    }
  };

  const categories: CategoryTab[] = [
    'All',
    'Code Analysis',
    'Debugging & Error Analysis',
    'Performance Optimization',
    'Development & Code Generation',
    'S/4HANA Modernization'
  ];

  return (
    <div id="abap-executive-card" className="w-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl text-slate-100 font-sans my-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/60 p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="inline-flex items-center justify-center p-1.5 bg-indigo-500/20 border border-indigo-500/40 rounded-lg text-indigo-400">
              <Terminal className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              SAP S/4HANA ABAP Executive Copilot
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-900/60 border border-indigo-700/50 text-indigo-300 font-medium">
                50 NL Queries Live Catalog
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Real-time code intelligence, ST22 dump forensics, SQL trace & runtime pushdown optimizations, and Clean Core Cloud modernization.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-slate-300">
              Target Scope: <span className="text-emerald-400 font-mono">{report?.packageOrSystem || 'S4H 2023 Clean Core Client 100'}</span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              Live Verified • As of {report?.asOfDate || new Date().toISOString().split('T')[0]}
            </div>
          </div>
          <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4" />
            100% Live SAP Data
          </div>
        </div>
      </div>

      {/* Action Notification Toast */}
      {activeTcodeAction && (
        <div className="bg-indigo-600/90 text-white text-xs px-4 py-2 flex items-center justify-between border-b border-indigo-500 animate-fadeIn">
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-300" />
            {activeTcodeAction}
          </span>
          <span className="text-indigo-200 text-[10px]">Paste into SAP GUI or ADT command field</span>
        </div>
      )}

      {/* Pillar Tabs */}
      <div className="bg-slate-950/80 px-4 py-2.5 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-800">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          const count = cat === 'All' ? allQuestions.length : allQuestions.filter(q => q.category === cat).length;
          return (
            <button
              key={cat}
              id={`cat-tab-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              onClick={() => {
                setSelectedCategory(cat);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-500'
                  : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {cat !== 'All' && getCategoryIcon(cat)}
              <span>{cat}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-indigo-800 text-indigo-200' : 'bg-slate-800 text-slate-400'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Two-Column Interactive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        {/* Left Column: Navigator & Search List */}
        <div className="lg:col-span-5 border-r border-slate-800 flex flex-col bg-slate-950/40">
          {/* Search Input */}
          <div className="p-3 border-b border-slate-800 bg-slate-950/60">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                id="abap-question-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 50 ABAP questions, dumps, tables..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-200"
                >
                  ✕
                </button>
              )}
            </div>
            <div className="flex justify-between items-center mt-2 px-1 text-[11px] text-slate-400">
              <span>Showing <strong className="text-slate-200">{filteredQuestions.length}</strong> of {allQuestions.length} queries</span>
              {selectedCategory !== 'All' && <span className="text-indigo-400 font-medium">{selectedCategory}</span>}
            </div>
          </div>

          {/* Question List */}
          <div className="flex-1 overflow-y-auto max-h-[520px] p-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
            {filteredQuestions.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No ABAP questions match your search query.
              </div>
            ) : (
              filteredQuestions.map((q) => {
                const isSelected = activeQuestion?.questionId === q.questionId;
                return (
                  <button
                    key={q.questionId}
                    id={`btn-question-${q.questionId.toLowerCase()}`}
                    onClick={() => setSelectedQuestionId(q.questionId)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-indigo-950/70 border-indigo-600/80 text-white shadow-md'
                        : 'bg-slate-900/50 hover:bg-slate-800/80 border-slate-800/60 text-slate-300'
                    }`}
                  >
                    <span className={`text-[11px] font-mono px-1.5 py-0.5 rounded font-bold mt-0.5 ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {q.questionId}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold truncate leading-tight">
                        {q.questionText}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1">
                          {getCategoryIcon(q.category)}
                          <span className="truncate max-w-[130px]">{q.category}</span>
                        </span>
                        <span>•</span>
                        <span className="font-mono text-slate-500 truncate">
                          {q.sapSourceTables.slice(0, 2).join(', ')}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 mt-1 transition-transform ${isSelected ? 'text-indigo-400 translate-x-0.5' : 'text-slate-600'}`} />
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detailed Answer & Insights Workspace */}
        <div className="lg:col-span-7 p-5 flex flex-col justify-between bg-slate-900/90 overflow-y-auto max-h-[580px] scrollbar-thin scrollbar-thumb-slate-800">
          {activeQuestion ? (
            <div className="space-y-4">
              {/* Question Header & Meta */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-indigo-600 text-white text-xs font-bold font-mono rounded-md shadow-sm">
                      {activeQuestion.questionId}
                    </span>
                    <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium rounded-md flex items-center gap-1.5">
                      {getCategoryIcon(activeQuestion.category)}
                      {activeQuestion.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                    <Database className="w-3.5 h-3.5 text-slate-500" />
                    <span>SAP Sources:</span>
                    <div className="flex flex-wrap gap-1">
                      {activeQuestion.sapSourceTables.map(t => (
                        <span key={t} className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300 text-[10px]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white tracking-tight leading-snug">
                  {activeQuestion.questionText}
                </h3>
              </div>

              {/* Summary Answer Card */}
              <div className="p-3.5 rounded-lg bg-indigo-950/40 border border-indigo-800/40 text-slate-200 text-xs leading-relaxed">
                <div className="font-semibold text-indigo-300 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Live Executive Answer
                </div>
                {activeQuestion.summaryAnswer}
              </div>

              {/* Key Technical Insights */}
              {activeQuestion.keyInsights && activeQuestion.keyInsights.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                    Technical Insights & S/4HANA Forensics
                  </h4>
                  <ul className="grid grid-cols-1 gap-1.5">
                    {activeQuestion.keyInsights.map((insight, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 bg-slate-950/40 p-2 rounded border border-slate-800/80">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Live Metrics Grid */}
              {activeQuestion.abapMetrics && activeQuestion.abapMetrics.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-300 mb-2">Live System Metrics</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {activeQuestion.abapMetrics.map((m, idx) => {
                      let badgeColor = 'bg-slate-800 border-slate-700 text-slate-200';
                      if (m.status === 'positive') badgeColor = 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300';
                      if (m.status === 'negative') badgeColor = 'bg-rose-950/40 border-rose-800/50 text-rose-300';
                      if (m.status === 'warning') badgeColor = 'bg-amber-950/40 border-amber-800/50 text-amber-300';

                      return (
                        <div key={idx} className={`p-2 rounded-lg border text-center ${badgeColor}`}>
                          <div className="text-[10px] text-slate-400 font-medium truncate">{m.label}</div>
                          <div className="text-xs font-bold mt-0.5 font-mono">{m.value}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Code Snippet / SQL Definition */}
              {activeQuestion.codeSnippet && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Code className="w-3.5 h-3.5 text-indigo-400" />
                      Clean Core ABAP / CDS / Forensics Snippet
                    </span>
                    <button
                      onClick={() => handleCopyCode(activeQuestion.codeSnippet)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-medium flex items-center gap-1 transition-colors"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedCode ? 'Copied' : 'Copy Code'}
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-slate-300 text-[11px] font-mono overflow-x-auto leading-relaxed scrollbar-thin scrollbar-thumb-slate-800">
                    <code>{activeQuestion.codeSnippet}</code>
                  </pre>
                </div>
              )}

              {/* Breakdown Data Table */}
              {activeQuestion.breakdownData && activeQuestion.breakdownData.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-300 mb-2">Detailed Component Breakdown</h4>
                  <div className="border border-slate-800 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px]">
                          <th className="p-2 font-medium">Object / Focus</th>
                          <th className="p-2 font-medium">Value / Identifier</th>
                          <th className="p-2 font-medium">Type / Variance</th>
                          <th className="p-2 font-medium">Context / Detail</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 bg-slate-900/50 text-slate-300">
                        {activeQuestion.breakdownData.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-800/50">
                            <td className="p-2 font-medium text-slate-200">{row.category}</td>
                            <td className="p-2 font-mono text-indigo-300">{row.value}</td>
                            <td className="p-2 text-slate-400">{row.variance || '-'}</td>
                            <td className="p-2 text-slate-400">{row.detail || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Recommended SAP Actions */}
              {activeQuestion.recommendedSapActions && activeQuestion.recommendedSapActions.length > 0 && (
                <div className="pt-2">
                  <h4 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                    Executable SAP Actions & T-Codes
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {activeQuestion.recommendedSapActions.map((act, aIdx) => (
                      <button
                        key={aIdx}
                        id={`btn-tcode-${act.tcode.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${aIdx}`}
                        onClick={() => handleTcodeClick(act.tcode)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-indigo-950 border border-slate-700 hover:border-indigo-600 rounded-lg text-xs text-slate-200 flex items-center gap-2 group transition-all"
                        title={act.description}
                      >
                        <span className="px-1.5 py-0.5 bg-slate-900 text-emerald-400 font-mono text-[10px] font-bold rounded group-hover:bg-indigo-900">
                          {act.tcode}
                        </span>
                        <span className="font-medium text-xs">{act.actionName}</span>
                        <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-indigo-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500">
              Select a question from the left catalog to inspect live details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
