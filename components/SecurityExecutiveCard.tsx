import React, { useState } from 'react';
import { SecurityExecutiveQuestionAnswer } from '../types';
import { ALL_SECURITY_EXECUTIVE_QUESTIONS } from '../data/securityExecutiveQuestions';
import { Search, ShieldAlert, ShieldCheck, Sparkles, Database, CheckCircle2, ArrowRight, Lock, Key, AlertTriangle, UserCheck } from 'lucide-react';

interface SecurityExecutiveCardProps {
  data?: any;
}

export const SecurityExecutiveCard: React.FC<SecurityExecutiveCardProps> = ({ data }) => {
  const initialQA: SecurityExecutiveQuestionAnswer | undefined = data?.questionId 
    ? data 
    : (data?.matchedQuestion || ALL_SECURITY_EXECUTIVE_QUESTIONS[0]);

  const [selectedQuestionId, setSelectedQuestionId] = useState<string>(initialQA?.questionId || 'Q1');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [executedActionMap, setExecutedActionMap] = useState<Record<string, boolean>>({});

  const categories = [
    { id: 'all', label: 'All 50 Questions', count: 50 },
    { id: 'Users & Access', label: '1. Users & Access', count: 10 },
    { id: 'Roles & Authorizations', label: '2. Roles & Authorizations', count: 10 },
    { id: 'Segregation of Duties (SoD)', label: '3. Segregation of Duties (SoD)', count: 10 },
    { id: 'Privileged & Firefighter Access', label: '4. Firefighter & Privileged', count: 10 },
    { id: 'Audit, Compliance & Risk', label: '5. Audit, Compliance & Risk', count: 10 }
  ];

  const filteredQuestions = ALL_SECURITY_EXECUTIVE_QUESTIONS.filter(q => {
    const matchesCategory = selectedCategory === 'all' || q.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = !searchQuery || 
      q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) || 
      q.questionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.summaryAnswer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const activeQA = ALL_SECURITY_EXECUTIVE_QUESTIONS.find(q => q.questionId === selectedQuestionId) || ALL_SECURITY_EXECUTIVE_QUESTIONS[0];

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
    <div id="security-executive-questions-copilot" className="bg-white rounded-2xl border border-slate-200/80 shadow-lg overflow-hidden my-4 text-slate-800 font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white p-5 sm:p-6 border-b border-rose-900/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="bg-rose-500/20 text-rose-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-rose-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                SAP S/4HANA Security & GRC Copilot
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-medium px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                100% Live S/4HANA GRC Telemetry
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <ShieldAlert className="w-6 h-6 text-rose-400" />
              50 Natural-Language Questions for SAP Security
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              Real-time user authorization audits, SoD matrix evaluations, Firefighter EAM tracking, and automated SOX compliance remediation across PRD Client 100.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700">
            <Database className="w-4 h-4 text-rose-400" />
            <div className="text-left">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Active Scope</div>
              <div className="text-xs font-bold text-slate-100">PRD Client 100 / USR02 / GRC</div>
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
                  ? 'bg-rose-600 text-white shadow-sm font-semibold'
                  : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedCategory === cat.id ? 'bg-rose-700 text-white' : 'bg-slate-700 text-slate-300'
              }`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area: 2-Column Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[560px]">
        {/* Left Column: Question Selector & Search (5 Columns) */}
        <div className="lg:col-span-5 border-r border-slate-200 bg-slate-50/70 p-4 flex flex-col gap-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search 50 security questions, users, roles, SoD, or T-Codes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all shadow-sm"
            />
          </div>

          {/* Question List */}
          <div className="flex-1 overflow-y-auto max-h-[500px] space-y-1.5 pr-1">
            {filteredQuestions.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No security questions match your search query.
              </div>
            ) : (
              filteredQuestions.map((q) => {
                const isSelected = q.questionId === selectedQuestionId;
                return (
                  <button
                    key={q.questionId}
                    onClick={() => setSelectedQuestionId(q.questionId)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col gap-1 ${
                      isSelected
                        ? 'bg-rose-50/90 border-rose-400/80 shadow-sm ring-1 ring-rose-400/30'
                        : 'bg-white border-slate-200/80 hover:bg-slate-100/80 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isSelected ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {q.questionId}
                      </span>
                      <span className="text-[10px] text-slate-600 font-semibold truncate">
                        {q.category}
                      </span>
                    </div>
                    <div className={`text-xs font-semibold line-clamp-2 ${
                      isSelected ? 'text-rose-950 font-bold' : 'text-slate-700'
                    }`}>
                      {q.questionText}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="text-[11px] text-slate-600 text-center pt-2 border-t border-slate-200 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            Showing {filteredQuestions.length} of 50 Live S/4HANA Security Questions
          </div>
        </div>

        {/* Right Column: Selected Question Answers & Live Analytics (7 Columns) */}
        <div className="lg:col-span-7 p-5 sm:p-6 bg-white flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            {/* Question Header & S/4HANA Source Tables */}
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span className="bg-rose-100 text-rose-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {activeQA.questionId}
                </span>
                <span className="bg-slate-100 text-slate-700 text-xs font-medium px-2.5 py-0.5 rounded-full border border-slate-200">
                  {activeQA.category}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                {activeQA.questionText}
              </h3>

              {/* Source Tables Badges */}
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <span className="text-[11px] text-slate-600 font-bold flex items-center gap-1">
                  <Database className="w-3 h-3 text-slate-500" /> SAP Source Tables:
                </span>
                {activeQA.sapSourceTables.map((tbl) => (
                  <span key={tbl} className="text-[10px] font-mono font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                    {tbl}
                  </span>
                ))}
              </div>
            </div>

            {/* AI Summary Answer */}
            <div className="bg-rose-50/50 border border-rose-200/70 rounded-xl p-4">
              <div className="text-xs font-bold text-rose-900 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                Live Security Intelligence & S/4HANA Answer:
              </div>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                {activeQA.summaryAnswer}
              </p>
            </div>

            {/* Security Metrics Grid */}
            <div>
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                Real-Time Security & Compliance Telemetry
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {activeQA.securityMetrics.map((metric, idx) => (
                  <div key={idx} className={`p-3 rounded-xl border ${getStatusColor(metric.status)} flex flex-col justify-between`}>
                    <span className="text-[10px] font-medium text-slate-600 truncate">{metric.label}</span>
                    <span className="text-xs sm:text-sm font-bold text-slate-900 mt-1">{metric.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Insights Bullet Points */}
            <div>
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Audit Findings & Key Insights
              </div>
              <ul className="space-y-1.5">
                {activeQA.keyInsights.map((insight, idx) => (
                  <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 mt-0.5 shrink-0" />
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Breakdown Table if available */}
            {activeQA.breakdownData && activeQA.breakdownData.length > 0 && (
              <div>
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Evidence & Access Breakdown
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 text-[11px] font-semibold">
                      <tr>
                        <th className="p-2.5">User / Object / Category</th>
                        <th className="p-2.5">Access State / Metric</th>
                        <th className="p-2.5">Risk Variance</th>
                        <th className="p-2.5">Operational Detail</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeQA.breakdownData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80">
                          <td className="p-2.5 font-semibold text-slate-800">{row.category}</td>
                          <td className="p-2.5 text-slate-700 font-medium">{row.value}</td>
                          <td className="p-2.5 font-semibold text-rose-700">{row.variance || '-'}</td>
                          <td className="p-2.5 text-slate-600">{row.detail || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Recommended SAP Actions */}
          <div className="pt-4 border-t border-slate-200">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              Recommended SAP Security Actions & Transaction Launchers
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {activeQA.recommendedSapActions.map((action, idx) => {
                const isExecuted = !!executedActionMap[action.actionName];
                return (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between gap-2 hover:border-rose-300 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-800">{action.actionName}</span>
                        <span className="text-[10px] font-mono font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded">
                          {action.tcode}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                        {action.description}
                      </p>
                    </div>

                    <button
                      onClick={() => handleActionClick(action.actionName)}
                      className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        isExecuted
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-900 text-white hover:bg-rose-700'
                      }`}
                    >
                      {isExecuted ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Action Executed & Verified in S/4</span>
                        </>
                      ) : (
                        <>
                          <span>Execute in {action.tcode}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
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
