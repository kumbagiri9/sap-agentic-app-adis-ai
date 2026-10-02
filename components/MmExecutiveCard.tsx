import React, { useState } from 'react';
import { MmExecutiveQuestionAnswer } from '../types';
import { ALL_MM_EXECUTIVE_QUESTIONS } from '../data/mmExecutiveQuestions';
import { 
  Search, 
  Boxes, 
  Sparkles, 
  Database, 
  CheckCircle2, 
  ArrowRight, 
  Package, 
  Layers, 
  ShoppingCart, 
  Truck, 
  TrendingUp, 
  Warehouse, 
  Building2 
} from 'lucide-react';

interface MmExecutiveCardProps {
  data?: any;
}

export const MmExecutiveCard: React.FC<MmExecutiveCardProps> = ({ data }) => {
  const initialQA: MmExecutiveQuestionAnswer | undefined = data?.questionId 
    ? data 
    : (data?.matchedQuestion || ALL_MM_EXECUTIVE_QUESTIONS[0]);

  const [selectedQuestionId, setSelectedQuestionId] = useState<string>(initialQA?.questionId || 'Q1');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [executedActionMap, setExecutedActionMap] = useState<Record<string, boolean>>({});

  const categories = [
    { id: 'all', label: 'All 50 Questions', count: 50 },
    { id: 'Material Master Management', label: '1. Material Master', count: 10 },
    { id: 'Inventory Management', label: '2. Inventory Mgmt', count: 10 },
    { id: 'Purchasing', label: '3. Purchasing', count: 10 },
    { id: 'Goods Movement', label: '4. Goods Movement', count: 10 },
    { id: 'Vendors & Procurement Analytics', label: '5. Vendors & Analytics', count: 10 }
  ];

  const filteredQuestions = ALL_MM_EXECUTIVE_QUESTIONS.filter(q => {
    const matchesCategory = selectedCategory === 'all' || q.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = !searchQuery || 
      q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) || 
      q.questionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.summaryAnswer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const activeQA = ALL_MM_EXECUTIVE_QUESTIONS.find(q => q.questionId === selectedQuestionId) || ALL_MM_EXECUTIVE_QUESTIONS[0];

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

  const getPillarIcon = (category: string) => {
    switch (category) {
      case 'Material Master Management':
        return <Package className="w-4 h-4 text-sky-500" />;
      case 'Inventory Management':
        return <Warehouse className="w-4 h-4 text-emerald-500" />;
      case 'Purchasing':
        return <ShoppingCart className="w-4 h-4 text-indigo-500" />;
      case 'Goods Movement':
        return <Truck className="w-4 h-4 text-amber-500" />;
      case 'Vendors & Procurement Analytics':
        return <TrendingUp className="w-4 h-4 text-purple-500" />;
      default:
        return <Boxes className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div id="mm-executive-questions-copilot" className="bg-white rounded-2xl border border-slate-200/80 shadow-lg overflow-hidden my-4 text-slate-800 font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-5 sm:p-6 border-b border-blue-900/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="bg-blue-500/20 text-blue-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-blue-500/30 flex items-center gap-1.5">
                <Boxes className="w-3.5 h-3.5 text-blue-400" />
                SAP S/4HANA Materials Management Copilot
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-medium px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                100% Live S/4HANA MM Telemetry
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <Package className="w-6 h-6 text-blue-400" />
              50 Natural-Language Questions for SAP MM AI Agent
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              Live material master data governance, real-time plant inventory analytics, purchasing commitments, goods movement execution, and vendor performance intelligence.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700">
            <Building2 className="w-4 h-4 text-blue-400" />
            <div className="text-left">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Active Scope</div>
              <div className="text-xs font-bold text-slate-100">Plant 1000 / Dallas HQ / S/4HANA</div>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-4 mt-4 border-t border-slate-800/80 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedCategory === cat.id ? 'bg-blue-700/80 text-blue-100' : 'bg-slate-700 text-slate-400'
              }`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Left Column: Search & Question Navigator (5 Cols) */}
        <div className="lg:col-span-5 border-r border-slate-200/80 bg-slate-50/50 flex flex-col h-[520px]">
          {/* Search Input */}
          <div className="p-3 border-b border-slate-200/80 bg-white">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search 50 MM questions, materials, POs..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 placeholder-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Question List */}
          <div className="overflow-y-auto flex-1 p-2 space-y-1 divide-y divide-slate-100/60">
            {filteredQuestions.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No questions found matching your filter.
              </div>
            ) : (
              filteredQuestions.map(q => {
                const isSelected = q.questionId === selectedQuestionId;
                return (
                  <button
                    key={q.questionId}
                    onClick={() => setSelectedQuestionId(q.questionId)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-blue-50/90 text-blue-950 font-medium border border-blue-200/90 shadow-sm'
                        : 'text-slate-700 hover:bg-white hover:shadow-xs'
                    }`}
                  >
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono shrink-0 mt-0.5 ${
                      isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {q.questionId}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold leading-snug line-clamp-2">
                        {q.questionText}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400">
                        {getPillarIcon(q.category)}
                        <span className="truncate">{q.category}</span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detailed Answer & S/4 Analytics (7 Cols) */}
        <div className="lg:col-span-7 p-4 sm:p-6 bg-white overflow-y-auto max-h-[520px]">
          {/* Active Question Title Card */}
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2 py-0.5 rounded font-mono">
                  {activeQA.questionId}
                </span>
                <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                  {getPillarIcon(activeQA.category)}
                  {activeQA.category}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 leading-snug">
                {activeQA.questionText}
              </h3>
            </div>

            {/* SAP Source Tables */}
            <div className="text-right shrink-0">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">SAP Tables</div>
              <div className="flex flex-wrap justify-end gap-1 max-w-[160px]">
                {activeQA.sapSourceTables.map(tbl => (
                  <span key={tbl} className="bg-slate-100 text-slate-700 font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded border border-slate-200">
                    {tbl}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Executive Summary Answer */}
          <div className="mt-4 p-3.5 bg-blue-50/50 rounded-xl border border-blue-100/80">
            <div className="text-xs font-bold text-blue-900 flex items-center gap-1.5 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Executive S/4HANA Summary Answer
            </div>
            <p className="text-xs leading-relaxed text-slate-700">
              {activeQA.summaryAnswer}
            </p>
          </div>

          {/* MM Live Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4">
            {activeQA.mmMetrics.map((metric, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border flex flex-col justify-between ${getStatusColor(metric.status)}`}
              >
                <div className="text-[10px] uppercase tracking-wide font-semibold opacity-75 truncate">
                  {metric.label}
                </div>
                <div className="text-sm sm:text-base font-bold mt-1 tracking-tight truncate">
                  {metric.value}
                </div>
              </div>
            ))}
          </div>

          {/* Key Insights Section */}
          <div className="mt-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              Operational & Strategic Key Insights
            </h4>
            <div className="space-y-1.5">
              {activeQA.keyInsights.map((insight, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 text-xs text-slate-600 bg-slate-50/80 p-2 rounded-lg border border-slate-100"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{insight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Breakdown Table if available */}
          {activeQA.breakdownData && activeQA.breakdownData.length > 0 && (
            <div className="mt-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Detailed Plant / Vendor / Stock Breakdown
              </h4>
              <div className="border border-slate-200/80 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-600 text-[10px] uppercase font-semibold border-b border-slate-200/80">
                    <tr>
                      <th className="p-2">Item / Dimension</th>
                      <th className="p-2">Live Value</th>
                      <th className="p-2">Variance / Status</th>
                      <th className="p-2">Operational Context</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {activeQA.breakdownData.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50/80">
                        <td className="p-2 font-medium text-slate-900">{row.category}</td>
                        <td className="p-2 font-semibold text-blue-700">{row.value}</td>
                        <td className="p-2">
                          <span className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-[10px] font-medium">
                            {row.variance || 'Normal'}
                          </span>
                        </td>
                        <td className="p-2 text-slate-500 text-[11px]">{row.detail || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Recommended SAP Actions / T-Codes */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
              Recommended SAP T-Code Execution & Remediation
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {activeQA.recommendedSapActions.map((action, aIdx) => {
                const isExecuted = !!executedActionMap[action.actionName];
                return (
                  <div
                    key={aIdx}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-2 hover:border-blue-300 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-slate-800 text-white font-mono text-[10px] font-bold px-1.5 py-0.2 rounded">
                          {action.tcode}
                        </span>
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {action.actionName}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {action.description}
                      </p>
                    </div>

                    <button
                      onClick={() => handleActionClick(action.actionName)}
                      className={`shrink-0 text-xs px-2.5 py-1 rounded-lg font-semibold transition-all ${
                        isExecuted
                          ? 'bg-emerald-600 text-white'
                          : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs'
                      }`}
                    >
                      {isExecuted ? 'Executed ✓' : 'Execute'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
