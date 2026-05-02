'use client';

import { useState, useEffect } from 'react';

const STATUS_COLORS = {
  APPROVED: 'bg-green-50 text-green-700 border border-green-100',
  PENDING: 'bg-yellow-50 text-yellow-700 border border-yellow-100',
  REJECTED: 'bg-red-50 text-red-700 border border-red-100',
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/settings').then((r) => r.json()).then(async (tenant) => {
      if (!tenant.wabaId || !tenant.accessToken) { setLoading(false); return; }
      const res = await fetch(`/api/whatsapp/templates?wabaId=${tenant.wabaId}`);
      const data = await res.json();
      setTemplates(data.templates || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Message Templates</h2>
          <p className="text-slate-500 text-sm">WhatsApp approved templates from your Meta account</p>
        </div>
        <a
          href="https://business.facebook.com/wa/manage/message-templates/"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-300 rounded-xl text-sm transition-colors shadow-sm"
        >
          Manage in Meta ↗
        </a>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">Loading templates...</div>
      ) : templates.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">📄</div>
          <p className="text-slate-600 mb-2 font-medium">No templates found</p>
          <p className="text-slate-400 text-sm">
            Make sure you&apos;ve connected your WhatsApp Business account in{' '}
            <a href="/settings" className="text-[#25D366] hover:underline font-medium">Settings</a>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((t, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium text-slate-900 text-sm">{t.name}</h3>
                  <p className="text-slate-400 text-xs mt-0.5 capitalize">{t.category?.toLowerCase()} · {t.language}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[t.status] || STATUS_COLORS.PENDING}`}>
                  {t.status}
                </span>
              </div>
              {t.components?.map((comp, j) => (
                comp.type === 'BODY' && (
                  <p key={j} className="text-slate-500 text-xs leading-relaxed line-clamp-3">
                    {comp.text}
                  </p>
                )
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
