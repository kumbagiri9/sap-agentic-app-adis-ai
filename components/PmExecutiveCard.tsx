import React, { useState, useMemo } from 'react';
import { 
  Wrench, 
  Bell, 
  ClipboardList, 
  Calendar, 
  BarChart3, 
  Search, 
  Check, 
  Copy, 
  Database, 
  Sparkles, 
  ChevronRight, 
  Activity, 
  Cpu, 
  AlertTriangle,
  Flame,
  ShieldCheck,
  TrendingUp,
  Clock
} from 'lucide-react';
import { PmExecutiveQuestionAnswer, PmExecutiveQueryInsightsReport } from '../types';
import { ALL_PM_EXECUTIVE_QUESTIONS } from '../data/pmExecutiveQuestions';

interface PmExecutiveCardProps {
  report?: PmExecutiveQueryInsightsReport;
  singleAnswer?: PmExecutiveQuestionAnswer;
}

type CategoryTab = 
  | 'All'
  | 'Equipment & Asset Health'
  | 'Maintenance Notifications'
  | 'Maintenance Orders'
  | 'Preventive Maintenance'
  | 'Reliability, Cost & Analytics';

export const PmExecutiveCard: React.FC<PmExecutiveCardProps> = ({ report, singleAnswer }) => {
  const allQuestions = useMemo(() => {
    if (report && report.questionsAnswers && report.questionsAnswers.length > 0) {
      return report.questionsAnswers;
    }
    if (singleAnswer) {
      return [singleAnswer];
    }
    return ALL_PM_EXECUTIVE_QUESTIONS;
  }, [report, singleAnswer]);

  const [selectedQuestionId, setSelectedQuestionId] = useState<string>(
    singleAnswer?.questionId || allQuestions[0]?.questionId || 'Q1'
  );
  const [selectedCategory, setSelectedCategory] = useState<CategoryTab>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTcodeAction, setActiveTcodeAction] = useState<string | null>(null);

  const filteredQuestions = useMemo(() => {
    return allQuestions.filter(item => {
      const matchesCat = 
        selectedCategory === 'All' || 
        item.category.toLowerCase() === selectedCategory.toLowerCase();
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

  const handleTcodeClick = (tcode: string) => {
    navigator.clipboard.writeText(tcode);
    setActiveTcodeAction(`T-Code / Fiori App ${tcode} copied to clipboard!`);
    setTimeout(() => setActiveTcodeAction(null), 3000);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Equipment & Asset Health':
        return <Cpu className="w-4 h-4 text-cyan-400" />;
      case 'Maintenance Notifications':
        return <Bell className="w-4 h-4 text-amber-400" />;
      case 'Maintenance Orders':
        return <ClipboardList className="w-4 h-4 text-emerald-400" />;
      case 'Preventive Maintenance':
        return <Calendar className="w-4 h-4 text-sky-400" />;
      case 'Reliability, Cost & Analytics':
        return <BarChart3 className="w-4 h-4 text-indigo-400" />;
      default:
        return <Wrench className="w-4 h-4 text-slate-400" />;
    }
  };

  const categories: CategoryTab[] = [
    'All',
    'Equipment & Asset Health',
    'Maintenance Notifications',
    'Maintenance Orders',
    'Preventive Maintenance',
    'Reliability, Cost & Analytics'
  ];

  return (
    <div id="pm-executive-card" className="w-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl text-slate-100 font-sans my-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/60 p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="inline-flex items-center justify-center p-1.5 bg-cyan-500/20 border border-cyan-500/40 rounded-lg text-cyan-400">
              <Wrench className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              SAP S/4HANA PM Executive Copilot
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-900/60 border border-cyan-700/50 text-cyan-300 font-medium">
                50 NL Asset & Maintenance Intelligence
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Real-time Equipment & Asset Health (EQUI), Notifications (IW21-IW28), Work Orders (IW31-IW38), Preventive Maintenance (IP10-IP30), MTBF/MTTR & Reliability Analytics
          </p>
        </div>

        {report && (
          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-right">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Plant / Location</div>
              <div className="text-xs font-mono font-bold text-cyan-300">{report.plantOrWorkCenter}</div>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-right">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total Questions</div>
              <div className="text-xs font-mono font-bold text-cyan-400">{allQuestions.length} Questions</div>
            </div>
          </div>
        )}
      </div>

      {/* Copy Alert Toast */}
      {activeTcodeAction && (
        <div className="bg-cyan-500/20 border-b border-cyan-500/40 px-4 py-2 text-xs text-cyan-300 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-cyan-400" />
            <span>{activeTcodeAction}</span>
          </div>
          <span className="text-[10px] uppercase font-mono text-cyan-400">Ready in SAP GUI / Fiori</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 bg-slate-950/70 border-b border-slate-800/80 flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-thin">
          {categories.map(cat => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30 font-semibold'
                    : 'bg-slate-800/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {cat !== 'All' && getCategoryIcon(cat)}
                <span>{cat}</span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search questions, EQUI, IW38..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-xs text-slate-500 hover:text-slate-300"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Main Dual-Pane Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[560px]">
        {/* Question Selector List (Left Column) */}
        <div className="lg:col-span-5 border-r border-slate-800 bg-slate-950/40 p-3 max-h-[620px] overflow-y-auto space-y-1.5 scrollbar-thin">
          <div className="text-[11px] font-semibold text-slate-400 px-2 py-1 flex items-center justify-between uppercase tracking-wider">
            <span>Maintenance Question Catalog</span>
            <span className="font-mono text-slate-500 text-[10px]">{filteredQuestions.length} Found</span>
          </div>

          {filteredQuestions.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-xs">
              No matching questions found for &quot;{searchQuery}&quot;.
            </div>
          ) : (
            filteredQuestions.map(item => {
              const isActive = activeQuestion?.questionId === item.questionId;
              return (
                <button
                  key={item.questionId}
                  onClick={() => setSelectedQuestionId(item.questionId)}
                  className={`w-full text-left p-2.5 rounded-lg transition-all border ${
                    isActive
                      ? 'bg-cyan-950/60 border-cyan-500 text-white shadow-sm'
                      : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700 shrink-0">
                      {item.questionId}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                      {getCategoryIcon(item.category)}
                      <span className="truncate max-w-[130px]">{item.category}</span>
                    </span>
                  </div>
                  <div className="text-xs font-semibold mt-1.5 line-clamp-2 leading-snug">
                    {item.questionText}
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 overflow-hidden">
                    {item.sapSourceTables.slice(0, 3).map(tbl => (
                      <span key={tbl} className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-950 text-slate-400 border border-slate-800">
                        {tbl}
                      </span>
                    ))}
                    {item.sapSourceTables.length > 3 && (
                      <span className="text-[9px] text-slate-500 font-mono">+{item.sapSourceTables.length - 3}</span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Question Details & Executive Answer (Right Column) */}
        <div className="lg:col-span-7 p-5 bg-slate-900/90 overflow-y-auto max-h-[620px] scrollbar-thin">
          {activeQuestion ? (
            <div className="space-y-5">
              {/* Question Header & ID */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                    {activeQuestion.questionId}
                  </span>
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5">
                    {getCategoryIcon(activeQuestion.category)}
                    {activeQuestion.category}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white leading-tight">
                  {activeQuestion.questionText}
                </h3>
              </div>

              {/* Summary Answer Box */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/90 shadow-inner">
                <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 mb-1.5 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Executive Maintenance Intelligence</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {activeQuestion.summaryAnswer}
                </p>
              </div>

              {/* Metrics Grid */}
              {activeQuestion.pmMetrics && activeQuestion.pmMetrics.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Real-Time Asset & Maintenance KPIs</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {activeQuestion.pmMetrics.map((metric, idx) => {
                      let statusBorder = 'border-slate-800 bg-slate-950/70 text-slate-200';
                      let valColor = 'text-white';
                      if (metric.status === 'positive') {
                        statusBorder = 'border-emerald-500/30 bg-emerald-950/20';
                        valColor = 'text-emerald-400';
                      } else if (metric.status === 'warning') {
                        statusBorder = 'border-amber-500/30 bg-amber-950/20';
                        valColor = 'text-amber-400';
                      } else if (metric.status === 'negative') {
                        statusBorder = 'border-rose-500/30 bg-rose-950/20';
                        valColor = 'text-rose-400';
                      }

                      return (
                        <div key={idx} className={`p-2.5 rounded-lg border ${statusBorder} flex flex-col justify-between`}>
                          <div className="text-[10px] text-slate-400 truncate mb-1">{metric.label}</div>
                          <div className={`text-xs font-bold font-mono ${valColor} leading-tight`}>{metric.value}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Key Insights List */}
              {activeQuestion.keyInsights && activeQuestion.keyInsights.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Operational & Reliability Insights</span>
                  </div>
                  <ul className="space-y-1.5">
                    {activeQuestion.keyInsights.map((insight, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 bg-slate-950/40 p-2 rounded-lg border border-slate-800/60">
                        <ChevronRight className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Data Breakdown Table */}
              {activeQuestion.breakdownData && activeQuestion.breakdownData.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Equipment, Orders & Failure Logs</span>
                  </div>
                  <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800 text-[11px]">
                        <tr>
                          <th className="p-2.5">Category / Record</th>
                          <th className="p-2.5">Value / Duration</th>
                          <th className="p-2.5">Variance / Status</th>
                          <th className="p-2.5">Detail</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/70 text-slate-300">
                        {activeQuestion.breakdownData.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-900/50">
                            <td className="p-2.5 font-medium text-slate-200">{row.category}</td>
                            <td className="p-2.5 font-mono text-cyan-300">{row.value}</td>
                            <td className="p-2.5 text-slate-400">
                              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono">
                                {row.variance || 'Normal'}
                              </span>
                            </td>
                            <td className="p-2.5 text-[11px] text-slate-400">{row.detail || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SAP Source Tables & Recommended T-Codes */}
              <div className="pt-2 border-t border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                {/* SAP Source Tables */}
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1 flex items-center gap-1">
                    <Database className="w-3 h-3 text-slate-400" />
                    <span>SAP Source Tables (EQUI, QMEL, AUFK, MPLA...)</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeQuestion.sapSourceTables.map(tbl => (
                      <span
                        key={tbl}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-cyan-400 border border-slate-800"
                      >
                        {tbl}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Recommended SAP Actions */}
                {activeQuestion.recommendedSapActions && activeQuestion.recommendedSapActions.length > 0 && (
                  <div className="w-full md:w-auto">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">
                      Execute in SAP GUI / Fiori
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {activeQuestion.recommendedSapActions.map((act, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleTcodeClick(act.tcode)}
                          title={`${act.actionName}: ${act.description}`}
                          className="px-2.5 py-1 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-300 text-xs font-mono font-medium flex items-center gap-1.5 transition-all shadow-sm group"
                        >
                          <span>{act.tcode}</span>
                          <span className="text-[10px] text-cyan-400 font-sans group-hover:text-white">({act.actionName})</span>
                          <Copy className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 text-sm">
              Select a question from the catalog to view executive insights.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
