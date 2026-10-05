import React, { useRef, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, PieChart, Pie, Legend, ComposedChart, Line } from 'recharts';
import { captureCharts, downloadKpiCsv, downloadKpiDocx, downloadKpiPdf, downloadKpiXlsx, type KpiExportData } from './kpiReportExport';

type KpiDashboardData = KpiExportData;

const PALETTE = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#64748b'];
const TILE_STYLES = [
  'from-blue-600 to-blue-500', 'from-emerald-600 to-emerald-500', 'from-amber-500 to-orange-500',
  'from-violet-600 to-purple-500', 'from-cyan-600 to-sky-500', 'from-rose-600 to-pink-500'
];
const compact = (n: number) => Math.abs(n) >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : Math.abs(n) >= 1e3 ? `${(n / 1e3).toFixed(1)}K` : n.toLocaleString('en-US', { maximumFractionDigits: 2 });

// KPI tiles plus trend, top-N and share charts computed from a live report's rows.
export const LiveKpiDashboardCard: React.FC<{ data: KpiDashboardData }> = ({ data }) => {
  const chartsRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<string | null>(null);
  if (!data || !Array.isArray(data.tiles)) return null;
  const exportAs = async (kind: 'PDF' | 'XLSX' | 'DOCX' | 'CSV') => {
    setBusy(kind);
    try {
      if (kind === 'XLSX') downloadKpiXlsx(data);
      else if (kind === 'CSV') downloadKpiCsv(data);
      else {
        const charts = await captureCharts(chartsRef.current);
        if (kind === 'PDF') downloadKpiPdf(data, charts); else downloadKpiDocx(data, charts);
      }
    } catch (e) {
      console.error('KPI report export failed', e);
    } finally {
      setBusy(null);
    }
  };
  const m = data.meta;
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xl mb-6 overflow-hidden w-full">
      <div className="p-4 bg-gradient-to-r from-indigo-700 via-blue-700 to-sky-600 text-white flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center border border-white/25">
            <i className="fas fa-chart-pie"></i>
          </div>
          <div>
            <span className="font-black text-[11px] uppercase tracking-widest block">{data.title}</span>
            <span className="text-[10px] text-blue-100 font-semibold">{data.subtitle}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {([['PDF', 'fa-file-pdf'], ['XLSX', 'fa-file-excel'], ['DOCX', 'fa-file-word'], ['CSV', 'fa-file-csv']] as const).map(([k, icon]) => (
            <button key={k} onClick={() => exportAs(k)} disabled={!!busy} title={`Download the report as ${k === 'XLSX' ? 'Excel' : k === 'DOCX' ? 'Word' : k}`}
              className="px-2.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 border border-white/25 text-[10px] font-black tracking-wider disabled:opacity-50">
              <i className={`fas ${busy === k ? 'fa-spinner fa-spin' : icon} mr-1`}></i>{k === 'XLSX' ? 'Excel' : k === 'DOCX' ? 'Word' : k}
            </button>
          ))}
        </div>
      </div>

      {m && (
        <div className="mx-4 mt-4 p-3 rounded-xl border border-emerald-200 bg-emerald-50 grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-1.5 text-[11px] text-slate-700">
          <div className="md:col-span-3 flex items-center gap-2 text-emerald-800 font-black text-[10px] uppercase tracking-widest">
            <i className="fas fa-database"></i>{m.scope}
          </div>
          <div><span className="font-bold text-slate-500">Total matching records: </span>{m.totalRecords.toLocaleString('en-US')} {m.recordLabel}</div>
          <div><span className="font-bold text-slate-500">Date range: </span>{m.dateRange || '\u2014'}</div>
          <div><span className="font-bold text-slate-500">Data timestamp: </span>{new Date(m.dataTimestamp).toLocaleString()}</div>
          <div className="md:col-span-3 break-words"><span className="font-bold text-slate-500">Applied filters: </span>{m.filters.join('; ')}</div>
          <div className="md:col-span-3 break-words"><span className="font-bold text-slate-500">Source system: </span>{m.sourceSystem}</div>
        </div>
      )}

      <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
        {data.tiles.map((t, i) => (
          <div key={t.label} className={`rounded-xl p-3 text-white bg-gradient-to-br ${TILE_STYLES[i % TILE_STYLES.length]} shadow-sm`}>
            <div className="text-[9px] font-bold uppercase tracking-wider opacity-90">{t.label}</div>
            <div className="text-base md:text-lg font-black mt-1 break-words">{t.value}</div>
            {t.hint && <div className="text-[9px] opacity-80 mt-0.5">{t.hint}</div>}
          </div>
        ))}
      </div>

      <div ref={chartsRef} className="px-4 pb-2 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {data.trend && data.trend.points.length > 0 && (
          <div data-kpi-chart={data.trend.title} className="border border-slate-100 rounded-xl p-3 lg:col-span-2">
            <div className="text-[11px] font-black text-slate-700 uppercase tracking-wide mb-2">{data.trend.title}</div>
            <div style={{ width: '100%', height: 240 }}>
              <ResponsiveContainer>
                <ComposedChart data={data.trend.points} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="period" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="a" tick={{ fontSize: 10 }} tickFormatter={compact} />
                  <YAxis yAxisId="c" orientation="right" tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip formatter={(v: any, name: any) => [typeof v === 'number' ? v.toLocaleString('en-US') : v, name]} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar yAxisId="a" dataKey="amount" name={data.trend.amountLabel} radius={[4, 4, 0, 0]}>
                    {data.trend.points.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                  </Bar>
                  <Line yAxisId="c" type="monotone" dataKey="count" name="Records" stroke="#0f172a" strokeWidth={2} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        {data.top && data.top.items.length > 0 && (
          <div data-kpi-chart={data.top.title} className="border border-slate-100 rounded-xl p-3">
            <div className="text-[11px] font-black text-slate-700 uppercase tracking-wide mb-2">{data.top.title}</div>
            <div style={{ width: '100%', height: Math.max(180, data.top.items.length * 26) }}>
              <ResponsiveContainer>
                <BarChart data={data.top.items} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={compact} />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v: any) => [typeof v === 'number' ? v.toLocaleString('en-US') : v, data.top!.valueLabel]} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {data.top.items.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        {data.share && data.share.slices.length > 0 && (
          <div data-kpi-chart={data.share.title} className="border border-slate-100 rounded-xl p-3">
            <div className="text-[11px] font-black text-slate-700 uppercase tracking-wide mb-2">{data.share.title}</div>
            <div style={{ width: '100%', height: 240 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={data.share.slices} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2} label={(e: any) => `${e.name}: ${e.value}`}>
                    {data.share.slices.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {data.insights.length > 0 && (
        <div className="mx-4 mb-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Key insights</div>
          <ul className="list-disc pl-5 text-[12px] text-slate-700 space-y-1">
            {data.insights.map(s => <li key={s}>{s}</li>)}
          </ul>
        </div>
      )}
      <div className="px-4 pb-3 text-[10px] italic text-slate-400">{data.note}</div>
    </div>
  );
};
