import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Bot, 
  Lock, 
  UserCheck, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Info, 
  Search, 
  FileCode, 
  Code2, 
  GitPullRequest, 
  CheckSquare, 
  Activity, 
  Terminal, 
  Zap, 
  Layers, 
  SlidersHorizontal,
  Workflow,
  Clock,
  Eye
} from 'lucide-react';

interface Props {
  data: any;
}

export const AbapApprovalModelCard: React.FC<Props> = ({ data }) => {
  const [activeTierFilter, setActiveTierFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!data) return null;

  const policy = data.policyStatus || {};
  const tiers = data.approvalTiers || [];
  const logs = data.recentApprovalLogs || [];

  const getTierIcon = (tierId: string) => {
    switch (tierId) {
      case 'TIER_FULLY_AUTONOMOUS':
        return <Bot className="w-5 h-5 text-emerald-400" />;
      case 'TIER_POLICY_CONTROLLED':
        return <SlidersHorizontal className="w-5 h-5 text-amber-400" />;
      case 'TIER_HUMAN_APPROVAL_REQUIRED':
        return <UserCheck className="w-5 h-5 text-rose-400" />;
      default:
        return <ShieldCheck className="w-5 h-5 text-sky-400" />;
    }
  };

  const getBadgeStyle = (color: string) => {
    switch (color) {
      case 'emerald':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
      case 'amber':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      case 'rose':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/30';
      default:
        return 'bg-sky-500/10 text-sky-300 border-sky-500/30';
    }
  };

  const filteredTiers = tiers.map((tier: any) => {
    if (activeTierFilter !== 'ALL' && tier.tierId !== activeTierFilter) {
      return null;
    }

    const filteredOps = tier.operations.filter((op: any) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return op.name.toLowerCase().includes(q) || op.description.toLowerCase().includes(q);
    });

    return {
      ...tier,
      operations: filteredOps
    };
  }).filter(Boolean);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 font-sans my-4">
      {/* HEADER BAR */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 p-6 border-b border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-600/20 border border-emerald-500/30 rounded-xl text-emerald-400 shadow-lg shadow-emerald-950/40">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold tracking-tight text-white">
                  SAP Coding Agent — Recommended Approval Model
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Active Governance
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                System: <span className="text-slate-200 font-mono font-medium">{policy.liveSystem || 'S/4HANA 2023 FPS02 Client 100'}</span> • Policy: <span className="font-mono text-amber-300">{policy.activePolicyVersion || 'v2026.2'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex items-center gap-3 text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Fully Autonomous</span>
                <span className="text-emerald-400 font-bold">{policy.fullyAutonomousCount || 8} Ops</span>
              </div>
              <div className="h-6 w-px bg-slate-800"></div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Policy Controlled</span>
                <span className="text-amber-400 font-bold">{policy.policyControlledCount || 7} Ops</span>
              </div>
              <div className="h-6 w-px bg-slate-800"></div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Human Gate</span>
                <span className="text-rose-400 font-bold">{policy.humanApprovalRequiredCount || 7} Ops</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH CONTROL BAR */}
      <div className="p-4 bg-slate-900/60 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setActiveTierFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTierFilter === 'ALL'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            All Tiers ({policy.totalOperationsGoverned || 22})
          </button>
          <button
            onClick={() => setActiveTierFilter('TIER_FULLY_AUTONOMOUS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTierFilter === 'TIER_FULLY_AUTONOMOUS'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-emerald-400" />
            Fully Autonomous ({policy.fullyAutonomousCount || 8})
          </button>
          <button
            onClick={() => setActiveTierFilter('TIER_POLICY_CONTROLLED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTierFilter === 'TIER_POLICY_CONTROLLED'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
            Policy-Controlled ({policy.policyControlledCount || 7})
          </button>
          <button
            onClick={() => setActiveTierFilter('TIER_HUMAN_APPROVAL_REQUIRED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTierFilter === 'TIER_HUMAN_APPROVAL_REQUIRED'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-rose-400" />
            Human Approval ({policy.humanApprovalRequiredCount || 7})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search operations..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* THREE GOVERNANCE TIERS */}
      <div className="p-6 space-y-6">
        {filteredTiers.map((tier: any) => {
          if (!tier || tier.operations.length === 0) return null;

          return (
            <div key={tier.tierId} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl border ${getBadgeStyle(tier.badgeColor)}`}>
                    {getTierIcon(tier.tierId)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      {tier.tierName}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getBadgeStyle(tier.badgeColor)}`}>
                        {tier.operations.length} Operations
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{tier.approvalRule}</p>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800 self-start sm:self-auto">
                  Risk Level: <strong className="text-slate-200">{tier.riskLevel}</strong>
                </span>
              </div>

              {/* OPERATIONS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {tier.operations.map((op: any) => (
                  <div 
                    key={op.id}
                    className="bg-slate-950 border border-slate-800/80 hover:border-slate-700 rounded-xl p-3.5 space-y-2 transition-all hover:shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-slate-400 font-bold uppercase">{op.id}</span>
                      <span className={`w-2 h-2 rounded-full ${
                        tier.badgeColor === 'emerald' ? 'bg-emerald-400 animate-pulse' :
                        tier.badgeColor === 'amber' ? 'bg-amber-400' : 'bg-rose-400'
                      }`}></span>
                    </div>

                    <h4 className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
                      {op.name}
                    </h4>

                    <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                      {op.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* LIVE AUDIT LOG TRAIL */}
      {logs.length > 0 && (
        <div className="p-6 bg-slate-900/40 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-sky-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Recent Governance Execution & Audit Trail (BALHDR / SM20)
              </h4>
            </div>
            <span className="text-[10px] font-mono text-slate-500">100% Audit Logging Active</span>
          </div>

          <div className="space-y-2">
            {logs.map((log: any, idx: number) => (
              <div key={idx} className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs font-mono">
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 text-[10px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  <span className="font-bold text-slate-200">{log.operationName}</span>
                  <span className="text-slate-400 text-[11px]">({log.requestedBy})</span>
                </div>

                <div className="flex items-center gap-3">
                  <p className="text-[11px] text-slate-300 truncate max-w-xs">{log.details}</p>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    log.status === 'AUTO_APPROVED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                    log.status === 'POLICY_VERIFIED_EXECUTED' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                    'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  }`}>
                    {log.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
