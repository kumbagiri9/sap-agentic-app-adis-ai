import React, { useState } from 'react';
import { TmExecutiveQuestionAnswer } from '../types';
import { ALL_TM_EXECUTIVE_QUESTIONS } from '../data/tmExecutiveQuestions';
import { Search, Truck, Sparkles, Database, CheckCircle2, ArrowRight } from 'lucide-react';

interface TmExecutiveCardProps {
  data?: any;
}

export const TmExecutiveCard: React.FC<TmExecutiveCardProps> = ({ data }) => {
  const initialQA: TmExecutiveQuestionAnswer | undefined = data?.questionId 
    ? data 
    : (data?.matchedQuestion || ALL_TM_EXECUTIVE_QUESTIONS[0]);

  const [selectedQuestionId, setSelectedQuestionId] = useState<string>(initialQA?.questionId || 'Q1');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [executedActionMap, setExecutedActionMap] = useState<Record<string, boolean>>({});

  const categories = [
    { id: 'all', label: 'All 50 Questions', count: 50 },
    { id: 'Transportation Planning', label: '1. Transportation Planning', count: 10 },
    { id: 'Carrier Management', label: '2. Carrier Management', count: 10 },
    { id: 'Freight Cost', label: '3. Freight Cost', count: 10 },
    { id: 'Execution & Delivery', label: '4. Execution & Delivery', count: 10 },
    { id: 'Network & Optimization', label: '5. Network & Optimization', count: 10 }
  ];

  const filteredQuestions = ALL_TM_EXECUTIVE_QUESTIONS.filter(q => {
    const matchesCategory = selectedCategory === 'all' || q.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = !searchQuery || 
      q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) || 
      q.questionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.summaryAnswer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const activeQA = ALL_TM_EXECUTIVE_QUESTIONS.find(q => q.questionId === selectedQuestionId) || ALL_TM_EXECUTIVE_QUESTIONS[0];

  const handleActionClick = (actionName: string) => {
    setExecutedActionMap(prev => ({
      ...prev,
      [actionName]: true
    }));
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'positive':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'negative':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'warning':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-slate-900">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-5 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-500/20 rounded-lg border border-blue-400/30">
              <Truck className="w-6 h-6 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-semibold tracking-tight">SAP S/4HANA TM Executive Copilot</h2>
                <span className="px-2 py-0.5 text-xs font-medium bg-blue-500/30 text-blue-200 rounded-full border border-blue-400/30">
                  50 Live NL Questions
                </span>
              </div>
              <p className="text-xs text-blue-200/80 mt-0.5">
                Real-time Transportation Management Intelligence across /SCMTMS/ TOR, VSR Optimizer & Settlement
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
            <Database className="w-3.5 h-3.5 text-blue-300" />
            <span>S/4HANA Client 100 Live Gateway</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search across all 50 questions (e.g., 'freight units', 'carrier tender', 'freight cost', 'empty miles')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white/10 text-white placeholder-blue-200/60 rounded-lg text-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/20 transition-all"
          />
        </div>

        {/* Category Pills */}
        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'bg-white/10 text-blue-100 hover:bg-white/20'
              }`}
            >
              {cat.label} ({cat.count})
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Left Question Selector, Right Active Answer Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 min-h-[560px]">
        {/* Left Column: 50 Questions List */}
        <div className="lg:col-span-5 p-4 max-h-[640px] overflow-y-auto space-y-2 bg-slate-50/50">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1 pb-1">
            Questions Catalog ({filteredQuestions.length})
          </div>

          {filteredQuestions.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              No matching questions found for "{searchQuery}".
            </div>
          ) : (
            filteredQuestions.map((q) => {
              const isSelected = q.questionId === activeQA.questionId;
              return (
                <button
                  key={q.questionId}
                  onClick={() => setSelectedQuestionId(q.questionId)}
                  className={`w-full text-left p-3 rounded-lg border transition-all text-xs ${
                    isSelected
                      ? 'bg-blue-50 border-blue-300 shadow-sm ring-1 ring-blue-300'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-blue-700">{q.questionId}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-medium">
                      {q.category}
                    </span>
                  </div>
                  <div className="font-medium text-slate-900 line-clamp-1">{q.questionText}</div>
                  <div className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                    {q.summaryAnswer}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Right Column: Detailed Live S/4HANA Answer View */}
        <div className="lg:col-span-7 p-6 space-y-6 max-h-[640px] overflow-y-auto">
          {/* Question Title & Category Badge */}
          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-100 text-blue-800 rounded-full">
                {activeQA.questionId}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {activeQA.category}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">{activeQA.questionText}</h3>
          </div>

          {/* S/4HANA Source Tables Badge Row */}
          <div className="flex items-center flex-wrap gap-1.5 text-xs">
            <span className="text-slate-500 font-medium flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-slate-400" /> Source Tables:
            </span>
            {activeQA.sapSourceTables.map((tbl) => (
              <span
                key={tbl}
                className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded font-mono text-[11px] font-semibold"
              >
                {tbl}
              </span>
            ))}
          </div>

          {/* Executive Summary Answer Box */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 leading-relaxed">
            <div className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5 text-xs uppercase tracking-wider text-blue-700">
              <Sparkles className="w-3.5 h-3.5" /> Live S/4HANA Executive Summary
            </div>
            {activeQA.summaryAnswer}
          </div>

          {/* Key Insights List */}
          {activeQA.keyInsights && activeQA.keyInsights.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Key Operational Insights
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {activeQA.keyInsights.map((insight, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Transportation Metrics Grid */}
          {activeQA.transportationMetrics && activeQA.transportationMetrics.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Live S/4HANA TM Metrics
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {activeQA.transportationMetrics.map((metric, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border text-center ${getStatusColor(metric.status)}`}
                  >
                    <div className="text-[11px] font-medium opacity-80">{metric.label}</div>
                    <div className="text-sm font-bold mt-0.5">{metric.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Breakdown Table */}
          {activeQA.breakdownData && activeQA.breakdownData.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Telemetry & Stage Breakdown
              </div>
              <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Category / Stage</th>
                      <th className="p-2.5">Status / Volume</th>
                      <th className="p-2.5">Variance</th>
                      <th className="p-2.5">Operational Detail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {activeQA.breakdownData.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2.5 font-medium text-slate-900">{item.category}</td>
                        <td className="p-2.5 text-slate-700">{item.value}</td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded-full font-medium text-[10px] bg-slate-100 text-slate-700">
                            {item.variance || 'Normal'}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-600">{item.detail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Recommended SAP Actions */}
          {activeQA.recommendedSapActions && activeQA.recommendedSapActions.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Recommended SAP S/4HANA Actions
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeQA.recommendedSapActions.map((action, idx) => {
                  const isDone = !!executedActionMap[action.actionName];
                  return (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-slate-900">{action.actionName}</span>
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 font-mono text-[10px] rounded font-bold">
                            {action.tcode}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1">{action.description}</p>
                      </div>
                      <button
                        onClick={() => handleActionClick(action.actionName)}
                        className={`w-full py-1.5 px-3 rounded text-xs font-medium flex items-center justify-center space-x-1.5 transition-all ${
                          isDone
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                        }`}
                      >
                        {isDone ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Executed in SAP Client 100</span>
                          </>
                        ) : (
                          <>
                            <span>Launch {action.tcode}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
