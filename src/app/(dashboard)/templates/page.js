'use client';

import { useState, useEffect } from 'react';

const STATUS_STYLES = {
  APPROVED: { pill: 'bg-emerald-50 text-emerald-700 border border-emerald-100', dot: 'bg-emerald-500' },
  PENDING:  { pill: 'bg-amber-50 text-amber-700 border border-amber-100',       dot: 'bg-amber-400' },
  REJECTED: { pill: 'bg-red-50 text-red-600 border border-red-100',             dot: 'bg-red-500' },
};

const CATEGORY_COLORS = {
  MARKETING: 'bg-violet-50 text-violet-700',
  UTILITY:   'bg-blue-50 text-blue-700',
  AUTHENTICATION: 'bg-orange-50 text-orange-700',
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetch('/api/settings').then((r) => r.json()).then(async (tenant) => {
      if (!tenant.wabaId || !tenant.accessToken) { setLoading(false); return; }
      const res = await fetch(`/api/whatsapp/templates?wabaId=${tenant.wabaId}`);
      const data = await res.json();
      setTemplates(data.templates || []);
      setLoading(false);
    });
  }, []);

  const filtered = filter === 'ALL' ? templates : templates.filter((t) => t.status === filter);
  const counts = { ALL: templates.length, APPROVED: 0, PENDING: 0, REJECTED: 0 };
  for (const t of templates) counts[t.status] = (counts[t.status] || 0) + 1;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Message Templates</h2>
          <p className="text-slate-500 text-sm mt-0.5">WhatsApp approved templates from your Meta account</p>
        </div>
        <a
          href="https://business.facebook.com/wa/manage/message-templates/"
          target="_blank"
          rel="noopener noreferrer"
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl text-sm font-semibold transition-colors shadow-sm"
        >
          Manage in Meta ↗
        </a>
      </div>

      {/* Status filter tabs */}
      {!loading && templates.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {(['ALL', 'APPROVED', 'PENDING', 'REJECTED']).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold border transition-colors ${
                filter === s
                  ? 'bg-[#25D366] text-white border-[#25D366]'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${filter === s ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {counts[s]}
              </span>
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="w-10 h-10 rounded-full border-2 border-[#25D366] border-t-transparent animate-spin mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Loading templates…</p>
          </div>
        </div>
      ) : templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-100 shadow-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl mb-4">📄</div>
          <p className="font-semibold text-slate-700 mb-1">No templates found</p>
          <p className="text-slate-400 text-sm max-w-xs">
            Make sure you&apos;ve connected your WhatsApp Business account in{' '}
            <a href="/settings" className="text-[#25D366] hover:underline font-semibold">Settings</a>
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm text-center">
          <p className="text-slate-400 text-sm">No {filter.toLowerCase()} templates</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((t, i) => {
            const st = STATUS_STYLES[t.status] || STATUS_STYLES.PENDING;
            const catStyle = CATEGORY_COLORS[t.category] || 'bg-slate-100 text-slate-600';
            const bodyText = t.components?.find((c) => c.type === 'BODY')?.text;
            const headerText = t.components?.find((c) => c.type === 'HEADER' && c.format === 'TEXT')?.text;
            const buttons = t.components?.find((c) => c.type === 'BUTTONS')?.buttons || [];

            return (
              <div key={i} className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">
                {/* Card header */}
                <div className="px-4 pt-4 pb-3 border-b border-slate-100">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-slate-900 text-sm leading-tight truncate">{t.name}</h3>
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${st.pill}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                      {t.status.charAt(0) + t.status.slice(1).toLowerCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${catStyle}`}>
                      {(t.category || 'UNKNOWN').charAt(0) + (t.category || '').slice(1).toLowerCase()}
                    </span>
                    <span className="text-slate-400 text-xs uppercase">{t.language}</span>
                  </div>
                </div>

                {/* Template preview */}
                <div className="flex-1 p-4">
                  <div className="bg-[#efeae2] rounded-xl p-3 text-sm">
                    {headerText && (
                      <p className="font-bold text-slate-800 mb-1.5 text-sm">{headerText}</p>
                    )}
                    {bodyText ? (
                      <p className="text-slate-700 text-xs leading-relaxed line-clamp-4">{bodyText}</p>
                    ) : (
                      <p className="text-slate-400 text-xs italic">No body text</p>
                    )}
                    {buttons.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-slate-300/40">
                        {buttons.slice(0, 2).map((btn, bi) => (
                          <span key={bi} className="text-xs text-blue-600 font-medium">{btn.text}</span>
                        ))}
                        {buttons.length > 2 && <span className="text-xs text-slate-400">+{buttons.length - 2} more</span>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
