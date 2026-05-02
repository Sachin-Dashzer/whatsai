'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const RANGES = [
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
];

const PIE_COLORS = ['#25D366', '#128C7E', '#34c4a9', '#0d6e58', '#4ade80', '#22c55e', '#16a34a'];

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetch(`/api/analytics?days=${days}`)
      .then((r) => r.json())
      .then(setData);
  }, [days]);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <div className="text-center">
          <div className="text-3xl mb-2">📊</div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  const lineData = (() => {
    const map = {};
    for (const d of data.dailyMessages || []) {
      const date = d._id.date;
      if (!map[date]) map[date] = { date, inbound: 0, outbound: 0 };
      map[date][d._id.direction] = d.count;
    }
    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
  })();

  const stageData = (data.stageBreakdown || []).map((s) => ({
    name: s._id || 'unknown',
    value: s.count,
  }));

  const tagData = (data.tagBreakdown || []).map((t) => ({
    name: t._id,
    count: t.count,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Analytics</h2>
          <p className="text-slate-500 text-sm">Performance metrics for your WhatsApp workspace</p>
        </div>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          {RANGES.map((r) => (
            <button
              key={r.days}
              onClick={() => setDays(r.days)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                days === r.days ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Messages', value: data.totalMessages?.toLocaleString(), icon: '💬', color: 'text-[#25D366]', bg: 'bg-green-50' },
          { label: 'AI Handled', value: `${data.aiHandledPercent}%`, icon: '🤖', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'New Contacts', value: data.newContacts?.toLocaleString(), icon: '👥', color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Outbound', value: data.outboundMessages?.toLocaleString(), icon: '📤', color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-lg ${kpi.bg} flex items-center justify-center text-base`}>{kpi.icon}</div>
              <span className="text-slate-500 text-sm">{kpi.label}</span>
            </div>
            <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Messages over time */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <h3 className="font-semibold text-slate-900 mb-4">Messages Over Time</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
              labelStyle={{ color: '#0f172a' }}
            />
            <Legend />
            <Line type="monotone" dataKey="inbound" stroke="#25D366" strokeWidth={2} dot={false} name="Inbound" />
            <Line type="monotone" dataKey="outbound" stroke="#128C7E" strokeWidth={2} dot={false} name="Outbound" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Stage breakdown */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-4">Contacts by Stage</h3>
          {stageData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={stageData} cx="50%" cy="50%" outerRadius={70} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {stageData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-40 text-slate-400 text-sm">No data</div>
          )}
        </div>

        {/* Top tags */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-4">Top Tags</h3>
          {tagData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={tagData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} width={100} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8 }} />
                <Bar dataKey="count" fill="#25D366" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-40 text-slate-400 text-sm">No data</div>
          )}
        </div>
      </div>
    </div>
  );
}
