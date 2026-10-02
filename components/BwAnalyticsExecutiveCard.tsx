import React, { useState, useMemo } from 'react';
import {
  BwExecutiveQuestionAnswer,
  BwExecutiveQueryInsightsReport
} from '../types';
import {
  ALL_BW_EXECUTIVE_QUESTIONS,
  BW_QUESTION_CATEGORIES,
  findBwExecutiveQuestion,
  searchBwExecutiveQuestions
} from '../data/bwExecutiveQuestions';
import {
  BarChart3,
  Database,
  Layers,
  Search,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Zap,
  ChevronRight,
  Server,
  Activity,
  Boxes,
  PieChart,
  DollarSign,
  Package,
  ShoppingCart,
  Factory,
  Sparkles,
  RefreshCw,
  Cpu,
  Info,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

interface BwAnalyticsExecutiveCardProps {
  report?: BwExecutiveQueryInsightsReport;
  singleAnswer?: BwExecutiveQuestionAnswer;
  onAskQuestion?: (questionText: string) => void;
}

export const BwAnalyticsExecutiveCard: React.FC<BwAnalyticsExecutiveCardProps> = ({
  report,
  singleAnswer,
  onAskQuestion
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeQuestion, setActiveQuestion] = useState<BwExecutiveQuestionAnswer>(
    singleAnswer || (report?.questionsAnswers?.[0]) || ALL_BW_EXECUTIVE_QUESTIONS[0]
  );
  const [activePillarDrilldown, setActivePillarDrilldown] = useState<string | null>(null);

  // Filter questions
  const filteredQuestions = useMemo(() => {
    let list = ALL_BW_EXECUTIVE_QUESTIONS;
    if (selectedCategory !== 'All') {
      list = list.filter(q => q.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(item =>
        item.questionId.toLowerCase().includes(q) ||
        item.questionText.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.targetSystem.toLowerCase().includes(q) ||
        item.summaryAnswer.toLowerCase().includes(q)
      );
    }
    return list;
  }, [selectedCategory, searchQuery]);

  const handleSelectQuestion = (q: BwExecutiveQuestionAnswer) => {
    setActiveQuestion(q);
    setActivePillarDrilldown(null);
    if (onAskQuestion) {
      onAskQuestion(q.questionText);
    }
  };

  const getSystemIcon = (system: string) => {
    switch (system) {
      case 'S/4HANA Embedded Analytics':
        return <Cpu className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'BW/4HANA EDW':
        return <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'SAP Datasphere Data Mesh':
        return <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden text-slate-800 dark:text-slate-100">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 text-white border-b border-indigo-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-xl">
              <BarChart3 className="w-8 h-8 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-white">
                  BW/4HANA, S/4HANA Analytics & Datasphere AI Copilot
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  50 NL Questions
                </span>
              </div>
              <p className="text-sm text-blue-200/80 mt-0.5">
                Multi-System Governed Analytics Mesh & Executive Tri-System Intelligence
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-slate-800/80 border border-slate-700 rounded-lg text-xs font-mono text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              rules.md 100% Live S/4 Data
            </span>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pt-5 pb-1 scrollbar-thin">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === 'All'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-white/10 hover:bg-white/15 text-blue-100'
            }`}
          >
            All Questions ({ALL_BW_EXECUTIVE_QUESTIONS.length})
          </button>
          {BW_QUESTION_CATEGORIES.map(cat => {
            const count = ALL_BW_EXECUTIVE_QUESTIONS.filter(q => q.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-white/10 hover:bg-white/15 text-blue-100'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Directory + Detail Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* Left Column: 50 Questions Directory */}
        <div className="lg:col-span-4 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-4 flex flex-col h-full max-h-[800px]">
          {/* Search Box */}
          <div className="relative mb-3">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search 50 NL questions..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          {/* Question List */}
          <div className="space-y-1.5 overflow-y-auto pr-1 flex-1">
            {filteredQuestions.map(q => {
              const isSelected = activeQuestion.questionId === q.questionId;
              return (
                <button
                  key={q.questionId}
                  onClick={() => handleSelectQuestion(q)}
                  className={`w-full text-left p-2.5 rounded-lg text-xs transition-all border ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 shadow-sm'
                      : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400">
                      {q.questionId}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                      {q.category.split(' ')[0]}
                    </span>
                  </div>
                  <p className="font-medium text-slate-800 dark:text-slate-200 line-clamp-2 leading-relaxed">
                    {q.questionText}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-500 dark:text-slate-400">
                    {getSystemIcon(q.targetSystem)}
                    <span className="truncate">{q.targetSystem}</span>
                  </div>
                </button>
              );
            })}
            {filteredQuestions.length === 0 && (
              <div className="p-6 text-center text-slate-400 text-xs">
                No matching questions found.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Question Answer Detail & Drill-down */}
        <div className="lg:col-span-8 p-6 overflow-y-auto max-h-[800px] space-y-6">
          {/* Active Question Header */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 text-xs font-mono font-bold">
                  {activeQuestion.questionId}
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {activeQuestion.category}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1 border border-slate-200 dark:border-slate-700">
                  {getSystemIcon(activeQuestion.targetSystem)}
                  {activeQuestion.targetSystem}
                </span>
              </div>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {activeQuestion.questionText}
            </h3>
          </div>

          {/* Technical Grounding Tags */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-600 dark:text-slate-300">
              <div>
                <span className="font-semibold text-slate-900 dark:text-white">Target Object: </span>
                <code className="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1 rounded">
                  {activeQuestion.sapTechnicalTarget}
                </code>
              </div>
              <div>
                <span className="font-semibold text-slate-900 dark:text-white">PFCG Auth: </span>
                <code className="text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-1 rounded">
                  {activeQuestion.pfcgAuthObject}
                </code>
              </div>
            </div>
            {activeQuestion.sapSourceTables && activeQuestion.sapSourceTables.length > 0 && (
              <div className="flex items-center gap-1.5 pt-0.5">
                <span className="font-semibold text-slate-900 dark:text-white">Live Source Tables:</span>
                <div className="flex flex-wrap gap-1">
                  {activeQuestion.sapSourceTables.map(t => (
                    <span key={t} className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-mono text-[11px]">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Executive Summary Answer */}
          <div className="p-4 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/10 rounded-xl border border-blue-200 dark:border-blue-900/60">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300 mb-1.5 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Executive Grounded Answer
            </h4>
            <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-200 font-medium">
              {activeQuestion.summaryAnswer}
            </p>
          </div>

          {/* Key Metrics Strip */}
          {activeQuestion.analyticsMetrics && activeQuestion.analyticsMetrics.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Operational KPIs & Key Metrics
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {activeQuestion.analyticsMetrics.map((m, idx) => {
                  let statusBg = 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700';
                  let valColor = 'text-slate-900 dark:text-white';
                  if (m.status === 'positive') {
                    statusBg = 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50';
                    valColor = 'text-emerald-700 dark:text-emerald-300';
                  } else if (m.status === 'negative') {
                    statusBg = 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/50';
                    valColor = 'text-rose-700 dark:text-rose-300';
                  } else if (m.status === 'warning') {
                    statusBg = 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50';
                    valColor = 'text-amber-700 dark:text-amber-300';
                  }

                  return (
                    <div key={idx} className={`p-3 rounded-xl border ${statusBg}`}>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                        {m.label}
                      </span>
                      <span className={`text-base font-bold tracking-tight ${valColor}`}>
                        {m.value}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CEO 8 Pillars Summary Grid (Only on Q0 or when available) */}
          {activeQuestion.executive8PillarsSummary && (
            <div className="space-y-3 p-4 bg-slate-900 text-white rounded-xl border border-indigo-800 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-indigo-400" />
                  <h4 className="text-sm font-bold text-white tracking-tight">
                    CEO 8-Pillar Tri-System Analytics Mesh
                  </h4>
                </div>
                <span className="text-xs text-indigo-300 font-mono">
                  Real-Time Governed Consolidation
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(activeQuestion.executive8PillarsSummary).map(([key, item]) => {
                  const isSelected = activePillarDrilldown === key;
                  return (
                    <div
                      key={key}
                      onClick={() => setActivePillarDrilldown(isSelected ? null : key)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-indigo-950 border-indigo-400 ring-2 ring-indigo-400/30'
                          : 'bg-slate-800/80 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                        <span>{item.label}</span>
                        {item.trend === 'up' ? (
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                        ) : item.trend === 'down' ? (
                          <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                        ) : (
                          <Activity className="w-3.5 h-3.5 text-blue-400" />
                        )}
                      </div>
                      <div className="text-base font-bold text-white mb-1">
                        {item.value}
                      </div>
                      <p className="text-[11px] text-slate-300 line-clamp-2">
                        {item.detail}
                      </p>
                    </div>
                  );
                })}
              </div>

              {activePillarDrilldown && (
                <div className="mt-3 p-3 bg-indigo-950/60 rounded-lg border border-indigo-700/80 text-xs text-indigo-200 animate-fadeIn">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white">
                      Drill-down: {activePillarDrilldown.replace('Pillar', '').toUpperCase()} Pillar Details
                    </span>
                    <button
                      onClick={() => setActivePillarDrilldown(null)}
                      className="text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-xs text-indigo-100">
                    Grounded on SAP S/4HANA 2023 Universal Journal ACDOCA, BW/4HANA CompositeProvider, and SAP Datasphere semantic analytical models.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Key Insights List */}
          {activeQuestion.keyInsights && activeQuestion.keyInsights.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Executive & Analytical Insights
              </h4>
              <div className="space-y-2">
                {activeQuestion.keyInsights.map((insight, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <span>{insight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Breakdown Data Cards */}
          {activeQuestion.breakdownData && activeQuestion.breakdownData.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Dimensional Breakdown
              </h4>
              <div className="space-y-2">
                {activeQuestion.breakdownData.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {item.category}:
                      </span>{' '}
                      <span className="text-slate-700 dark:text-slate-300">{item.value}</span>
                      {item.detail && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {item.detail}
                        </p>
                      )}
                    </div>
                    {item.variance && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 self-start sm:self-center shrink-0">
                        {item.variance}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Table Data View */}
          {activeQuestion.tableData && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Analytical Tabular Matrix
              </h4>
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                      {activeQuestion.tableData.headers.map((h, i) => (
                        <th key={i} className="p-2.5 font-semibold">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-slate-800 dark:text-slate-200">
                    {activeQuestion.tableData.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="p-2.5 font-mono text-[11px]">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Recommended SAP Actions */}
          {activeQuestion.recommendedSapActions && activeQuestion.recommendedSapActions.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Recommended SAP Execution Actions
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {activeQuestion.recommendedSapActions.map((action, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700 text-xs flex items-start justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {action.actionName}
                        </span>
                        <code className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-bold">
                          {action.tcode}
                        </code>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                        {action.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lineage & Audit Footer */}
          {activeQuestion.technicalDetails && (
            <div className="p-3 bg-slate-100 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
              <div className="flex items-center justify-between">
                <span>
                  <strong>Governance Lineage: </strong>
                  {activeQuestion.technicalDetails.auditTrailNote}
                </span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  SQL Injection Blocked
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
