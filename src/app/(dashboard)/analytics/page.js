'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const RANGES = [
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
];

const PIE_COLORS = ['#25D366', '#128C7E', '#34c4a9', '#0d6e58', '#4ade80', '#22c55e', '#16a34a'];

const TOOLTIP_STYLE = {
  contentStyle: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.08)', fontSize: 12 },
  labelStyle: { color: '#0f172a', fontWeight: 600 },
  itemStyle: { color: '#475569' },
};

function KpiCard({ label, value, icon, bg, color, sub }) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{label}</p>
          <p className={`text-2xl font-bold leading-none ${color}`}>{value ?? '—'}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${bg}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/analytics?days=${days}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); });
  }, [days]);

  const lineData = (() => {
    if (!data) return [];
    const map = {};
    for (const d of data.dailyMessages || []) {
      const date = d._id.date;
      if (!map[date]) map[date] = { date, inbound: 0, outbound: 0 };
      map[date][d._id.direction] = d.count;
    }
    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
  })();

  const stageData = (data?.stageBreakdown || []).map((s) => ({ name: s._id || 'unknown', value: s.count }));
  const tagData = (data?.tagBreakdown || []).map((t) => ({ name: t._id, count: t.count }));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Analytics</h2>
          <p className="text-slate-500 text-sm mt-0.5">Performance metrics for your WhatsApp workspace</p>
        </div>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
          {RANGES.map((r) => (
            <button
              key={r.days}
              onClick={() => setDays(r.days)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
                days === r.days ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-10 h-10 rounded-full border-2 border-[#25D366] border-t-transparent animate-spin mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Loading analytics…</p>
          </div>
        </div>
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard label="Total Messages" value={data?.totalMessages?.toLocaleString()} icon="💬" bg="bg-emerald-50" color="text-slate-900" sub={`${days}-day period`} />
            <KpiCard label="AI Handled" value={`${data?.aiHandledPercent ?? 0}%`} icon="🤖" bg="bg-blue-50" color="text-blue-700" sub="of all messages" />
            <KpiCard label="New Contacts" value={data?.newContacts?.toLocaleString()} icon="👥" bg="bg-violet-50" color="text-violet-700" sub={`in ${days} days`} />
            <KpiCard label="Outbound" value={data?.outboundMessages?.toLocaleString()} icon="📤" bg="bg-orange-50" color="text-orange-600" sub="messages sent" />
          </div>

          {/* Messages over time */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">Messages Over Time</h3>
            {lineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={lineData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => v.slice(5)} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="inbound" stroke="#25D366" strokeWidth={2.5} dot={false} name="Inbound" />
                  <Line type="monotone" dataKey="outbound" stroke="#128C7E" strokeWidth={2.5} dot={false} name="Outbound" strokeDasharray="4 2" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-40 text-slate-400 text-sm">No message data for this period</div>
            )}
          </div>

          {/* Bottom charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Contacts by Stage</h3>
              {stageData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={stageData}
                      cx="50%"
                      cy="50%"
                      outerRadius={72}
                      innerRadius={36}
                      dataKey="value"
                      nameKey="name"
                      paddingAngle={3}
                    >
                      {stageData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip {...TOOLTIP_STYLE} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-40 text-slate-400 text-sm">No contact stage data</div>
              )}
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Top Contact Tags</h3>
              {tagData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={tagData} layout="vertical" margin={{ top: 0, right: 4, bottom: 0, left: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
                    <Tooltip {...TOOLTIP_STYLE} />
                    <Bar dataKey="count" fill="#25D366" radius={[0, 6, 6, 0]} maxBarSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-40 text-slate-400 text-sm">No tag data yet</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
