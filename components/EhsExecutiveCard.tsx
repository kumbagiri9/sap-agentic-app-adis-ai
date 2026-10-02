import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  Search, 
  ShieldCheck, 
  HeartPulse, 
  Leaf, 
  Check, 
  Database, 
  Sparkles, 
  ChevronRight, 
  Activity, 
  Flame,
  AlertTriangle,
  FileCheck,
  TrendingDown,
  Building2,
  Clock
} from 'lucide-react';
import { EhsExecutiveQuestionAnswer, EhsExecutiveQueryInsightsReport } from '../types';
import { ALL_EHS_EXECUTIVE_QUESTIONS } from '../data/ehsExecutiveQuestions';

interface EhsExecutiveCardProps {
  report?: EhsExecutiveQueryInsightsReport;
  singleAnswer?: EhsExecutiveQuestionAnswer;
}

type CategoryTab = 
  | 'All'
  | 'Incidents & Safety Events'
  | 'Incident Investigation'
  | 'Risk Assessment & Hazards'
  | 'Occupational Health & Exposure'
  | 'Environmental & Compliance';

export const EhsExecutiveCard: React.FC<EhsExecutiveCardProps> = ({ report, singleAnswer }) => {
  const allQuestions = useMemo(() => {
    if (report && report.questionsAnswers && report.questionsAnswers.length > 0) {
      return report.questionsAnswers;
    }
    if (singleAnswer) {
      return [singleAnswer];
    }
    return ALL_EHS_EXECUTIVE_QUESTIONS;
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
      case 'Incidents & Safety Events':
        return <Flame className="w-4 h-4 text-rose-400" />;
      case 'Incident Investigation':
        return <ShieldAlert className="w-4 h-4 text-amber-400" />;
      case 'Risk Assessment & Hazards':
        return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
      case 'Occupational Health & Exposure':
        return <HeartPulse className="w-4 h-4 text-violet-400" />;
      case 'Environmental & Compliance':
        return <Leaf className="w-4 h-4 text-teal-400" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-slate-400" />;
    }
  };

  const categories: CategoryTab[] = [
    'All',
    'Incidents & Safety Events',
    'Incident Investigation',
    'Risk Assessment & Hazards',
    'Occupational Health & Exposure',
    'Environmental & Compliance'
  ];

  return (
    <div id="ehs-executive-card" className="w-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl text-slate-100 font-sans my-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/60 p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="inline-flex items-center justify-center p-1.5 bg-emerald-500/20 border border-emerald-500/40 rounded-lg text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              SAP S/4HANA EHS Executive Copilot
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-900/60 border border-emerald-700/50 text-emerald-300 font-medium">
                50 NL Safety, Health & Environmental Intelligence
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Real-time Incidents (EHFND_INCIDENT), 5-Why Root Causes (EHFND_INC_CAU), CAPAs (EHFND_INC_ACT), Risk Assessments (EHFND_RAS_ROOT), Health Surveillance (G20/G24), & Title V Emissions
          </p>
        </div>

        {report && (
          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-right">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Scope / Location</div>
              <div className="text-xs font-mono font-bold text-emerald-300 truncate max-w-[200px]">{report.plantOrLocation}</div>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-right">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total Questions</div>
              <div className="text-xs font-mono font-bold text-emerald-400">{allQuestions.length} Questions</div>
            </div>
          </div>
        )}
      </div>

      {/* Copy Alert Toast */}
      {activeTcodeAction && (
        <div className="bg-emerald-500/20 border-b border-emerald-500/40 px-4 py-2 text-xs text-emerald-300 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{activeTcodeAction}</span>
          </div>
          <span className="text-[10px] uppercase font-mono text-emerald-400">Ready in SAP GUI / Fiori</span>
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
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-semibold'
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
            placeholder="Search questions, EHFND, INC-10045..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
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
            <span>EHS Question Catalog</span>
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
                      ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-sm'
                      : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700 shrink-0">
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

        {/* Question Details View (Right Column) */}
        <div className="lg:col-span-7 p-5 bg-slate-900/90 overflow-y-auto max-h-[620px] scrollbar-thin">
          {activeQuestion ? (
            <div className="space-y-5">
              {/* Question Header & Classification */}
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-900/60 border border-emerald-700/60 text-emerald-300">
                    {activeQuestion.questionId}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1.5">
                    {getCategoryIcon(activeQuestion.category)}
                    <span className="font-semibold text-slate-300">{activeQuestion.category}</span>
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight leading-snug">
                  {activeQuestion.questionText}
                </h3>
              </div>

              {/* S/4HANA Source Tables Badge Row */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1 mr-1">
                  <Database className="w-3 h-3 text-emerald-400" /> SAP Tables:
                </span>
                {activeQuestion.sapSourceTables.map(tbl => (
                  <span
                    key={tbl}
                    className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-800/90 border border-slate-700 text-emerald-300"
                  >
                    {tbl}
                  </span>
                ))}
              </div>

              {/* Executive Summary Answer Box */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/40 border border-emerald-800/40 shadow-inner">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>S/4HANA EHS Executive Answer</span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed font-normal">
                  {activeQuestion.summaryAnswer}
                </p>
              </div>

              {/* Metrics Grid */}
              {activeQuestion.ehsMetrics && activeQuestion.ehsMetrics.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    Key EHS Telemetry & Compliance Indicators
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {activeQuestion.ehsMetrics.map((met, idx) => {
                      let statusBadge = 'bg-slate-800/80 border-slate-700 text-slate-300';
                      if (met.status === 'positive') {
                        statusBadge = 'bg-emerald-950/50 border-emerald-700/60 text-emerald-300';
                      } else if (met.status === 'warning') {
                        statusBadge = 'bg-amber-950/50 border-amber-700/60 text-amber-300';
                      } else if (met.status === 'negative') {
                        statusBadge = 'bg-rose-950/50 border-rose-700/60 text-rose-300';
                      }
                      return (
                        <div key={idx} className={`p-2.5 rounded-lg border ${statusBadge}`}>
                          <div className="text-[10px] text-slate-400 truncate leading-tight">{met.label}</div>
                          <div className="text-sm font-bold mt-1 font-mono tracking-tight">{met.value}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Key Insights List */}
              {activeQuestion.keyInsights && activeQuestion.keyInsights.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Governed Root Cause & Audit Findings
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {activeQuestion.keyInsights.map((insight, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-slate-950/40 p-2 rounded-lg border border-slate-800/60">
                        <ChevronRight className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                        <span className="leading-relaxed">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Breakdown Data Table */}
              {activeQuestion.breakdownData && activeQuestion.breakdownData.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                    Site / Departmental Risk Breakdown
                  </h4>
                  <div className="overflow-x-auto rounded-lg border border-slate-800">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
                        <tr>
                          <th className="py-2 px-3">Classification / Location</th>
                          <th className="py-2 px-3">Value / Metric</th>
                          <th className="py-2 px-3">Variance / Context</th>
                          <th className="py-2 px-3">Operating Detail</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
                        {activeQuestion.breakdownData.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                            <td className="py-2 px-3 font-semibold text-slate-200">{row.category}</td>
                            <td className="py-2 px-3 font-mono text-emerald-300">{row.value}</td>
                            <td className="py-2 px-3 font-mono text-slate-400">{row.variance || '-'}</td>
                            <td className="py-2 px-3 text-slate-400">{row.detail || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Incident or Hazard Specific Details Cards */}
              {activeQuestion.incidentOrHazardDetails && activeQuestion.incidentOrHazardDetails.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-emerald-400" />
                    Specific Incident, Hazard & Barrier Records
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {activeQuestion.incidentOrHazardDetails.map(item => (
                      <div key={item.id} className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-mono font-bold text-emerald-400">{item.id}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                            {item.severity}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-white mb-1">{item.name}</div>
                        <div className="text-[11px] text-slate-400 mb-1.5">{item.detail}</div>
                        <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-800/80 font-mono">
                          <span className="text-slate-500">Status: <strong className="text-slate-300 font-normal">{item.status}</strong></span>
                          <span className="text-emerald-400 font-semibold">{item.metric}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended SAP Actions with T-Codes */}
              {activeQuestion.recommendedSapActions && activeQuestion.recommendedSapActions.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Direct S/4HANA EHS Operational Interventions
                  </h4>
                  <div className="space-y-2">
                    {activeQuestion.recommendedSapActions.map((action, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-emerald-700/50 transition-all group"
                      >
                        <div className="space-y-0.5 pr-2">
                          <div className="text-xs font-bold text-white flex items-center gap-2">
                            <span>{action.actionName}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-700/60 text-emerald-300">
                              {action.tcode}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">{action.description}</p>
                        </div>
                        <button
                          onClick={() => handleTcodeClick(action.tcode)}
                          title={`Copy ${action.tcode} to clipboard`}
                          className="p-2 rounded-lg bg-slate-800/80 text-slate-300 hover:bg-emerald-600 hover:text-white transition-all shrink-0 group-hover:bg-emerald-600 group-hover:text-white"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-12 text-center text-slate-500">
              Select an EHS question from the catalog on the left to view deep S/4HANA analytical insights.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
