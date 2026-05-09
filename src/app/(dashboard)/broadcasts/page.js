'use client';

import { useState, useEffect } from 'react';

const STEPS = ['Name', 'Template', 'Audience', 'Schedule', 'Review'];

const STATUS_STYLES = {
  draft:     { pill: 'bg-slate-100 text-slate-600',       dot: 'bg-slate-400' },
  scheduled: { pill: 'bg-blue-50 text-blue-700',          dot: 'bg-blue-500' },
  running:   { pill: 'bg-amber-50 text-amber-700',         dot: 'bg-amber-500 animate-pulse' },
  completed: { pill: 'bg-emerald-50 text-emerald-700',    dot: 'bg-emerald-500' },
  failed:    { pill: 'bg-red-50 text-red-600',            dot: 'bg-red-500' },
};

function StatBar({ label, value, total, color }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-slate-500">{label}</span>
        <span className="text-xs font-semibold text-slate-700">{pct}%</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-1.5 ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function BroadcastsPage() {
  const [broadcasts, setBroadcasts] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: '', templateName: '', targetTags: '', scheduledAt: '' });
  const [launching, setLaunching] = useState(false);

  useEffect(() => {
    fetch('/api/broadcasts').then((r) => r.json()).then((d) => setBroadcasts(d.broadcasts || []));
  }, []);

  async function createAndLaunch() {
    setLaunching(true);
    const res = await fetch('/api/broadcasts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        targetTags: form.targetTags ? form.targetTags.split(',').map((t) => t.trim()) : [],
        status: form.scheduledAt ? 'scheduled' : 'draft',
      }),
    });
    const broadcast = await res.json();
    if (!form.scheduledAt) {
      await fetch('/api/whatsapp/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ broadcastId: broadcast._id }),
      });
    }
    const updated = await fetch('/api/broadcasts').then((r) => r.json());
    setBroadcasts(updated.broadcasts || []);
    setShowCreate(false);
    setStep(0);
    setForm({ name: '', templateName: '', targetTags: '', scheduledAt: '' });
    setLaunching(false);
  }

  function closeModal() {
    setShowCreate(false);
    setStep(0);
    setForm({ name: '', templateName: '', targetTags: '', scheduledAt: '' });
  }

  const inputCls = 'w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#25D366] focus:bg-white text-sm transition-colors';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Broadcasts</h2>
          <p className="text-slate-500 text-sm mt-0.5">Send WhatsApp template campaigns to your contacts</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
        >
          <span className="text-base leading-none">+</span> New Broadcast
        </button>
      </div>

      {/* Broadcast cards */}
      <div className="space-y-3">
        {broadcasts.map((b) => {
          const st = STATUS_STYLES[b.status] || STATUS_STYLES.draft;
          return (
            <div key={b._id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 truncate">{b.name}</h3>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Template: <span className="font-medium text-slate-600">{b.templateName || 'N/A'}</span>
                    {' · '}
                    {new Date(b.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${st.pill}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                    {b.status}
                  </span>
                </div>
              </div>

              {b.stats?.total > 0 ? (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-500">{b.stats.total.toLocaleString()} recipients</span>
                    <span className="text-xs text-slate-400">Delivery stats</span>
                  </div>
                  <StatBar label="Sent" value={b.stats.sent} total={b.stats.total} color="bg-[#25D366]" />
                  <StatBar label="Delivered" value={b.stats.delivered} total={b.stats.total} color="bg-blue-500" />
                  <StatBar label="Read" value={b.stats.read} total={b.stats.total} color="bg-violet-500" />
                </div>
              ) : (
                <div className="flex items-center gap-2 py-2 px-3 bg-slate-50 rounded-xl text-xs text-slate-400">
                  <span>No delivery stats yet</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {broadcasts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl mb-4">📢</div>
          <p className="font-semibold text-slate-700 mb-1">No broadcasts yet</p>
          <p className="text-slate-400 text-sm mb-5">Create your first WhatsApp campaign to reach your audience</p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl text-sm font-semibold transition-colors"
          >
            Create Broadcast
          </button>
        </div>
      )}

      {/* Create broadcast modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            {/* Mobile drag handle */}
            <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 bg-slate-200 rounded-full" />
            </div>
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">New Broadcast</h3>
              <button onClick={closeModal} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                <CloseIcon />
              </button>
            </div>

            {/* Step progress */}
            <div className="px-6 pt-4 pb-2">
              <div className="flex items-center gap-0">
                {STEPS.map((s, i) => (
                  <div key={s} className="flex items-center flex-1">
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        i < step ? 'bg-[#25D366] text-white' :
                        i === step ? 'bg-[#25D366]/10 text-[#25D366] ring-2 ring-[#25D366]/30' :
                        'bg-slate-100 text-slate-400'
                      }`}>
                        {i < step ? '✓' : i + 1}
                      </div>
                      <span className={`text-[10px] font-medium hidden sm:block ${i === step ? 'text-[#25D366]' : 'text-slate-400'}`}>{s}</span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`flex-1 h-px mx-1 mb-4 ${i < step ? 'bg-[#25D366]' : 'bg-slate-200'}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step content */}
            <div className="px-6 py-4 min-h-36">
              {step === 0 && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Campaign Name</label>
                  <input type="text" placeholder="e.g. Diwali Sale Campaign" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} autoFocus />
                  <p className="text-xs text-slate-400">Give your campaign a descriptive name for easy tracking.</p>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Template Name</label>
                  <input type="text" placeholder="exact_template_name" value={form.templateName} onChange={(e) => setForm({ ...form, templateName: e.target.value })} className={inputCls} autoFocus />
                  <p className="text-xs text-slate-400">Enter the exact template name as it appears in your Meta WhatsApp Business Manager.</p>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Target Audience</label>
                  <input type="text" placeholder="hot-lead, delhi (leave empty for all)" value={form.targetTags} onChange={(e) => setForm({ ...form, targetTags: e.target.value })} className={inputCls} autoFocus />
                  <p className="text-xs text-slate-400">Filter by contact tags (comma-separated). Leave empty to send to all contacts.</p>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Send Time</label>
                  <input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} className={inputCls} />
                  <p className="text-xs text-slate-400">Leave empty to send immediately after review.</p>
                </div>
              )}

              {step === 4 && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 divide-y divide-slate-200">
                  {[
                    ['Campaign Name', form.name],
                    ['Template', form.templateName || '—'],
                    ['Audience', form.targetTags || 'All contacts'],
                    ['Timing', form.scheduledAt ? new Date(form.scheduledAt).toLocaleString() : 'Send immediately'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center px-4 py-3 text-sm">
                      <span className="text-slate-500">{k}</span>
                      <span className="text-slate-900 font-semibold text-right max-w-xs truncate">{v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 pb-6">
              {step > 0 ? (
                <button onClick={() => setStep(step - 1)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors">
                  Back
                </button>
              ) : (
                <button onClick={closeModal} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors">
                  Cancel
                </button>
              )}
              {step < STEPS.length - 1 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={step === 0 && !form.name.trim()}
                  className="flex-1 py-2.5 bg-[#25D366] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold shadow-sm transition-colors hover:bg-[#128C7E]"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={createAndLaunch}
                  disabled={launching}
                  className="flex-1 py-2.5 bg-[#25D366] disabled:opacity-60 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors hover:bg-[#128C7E]"
                >
                  {launching ? 'Launching…' : form.scheduledAt ? 'Schedule' : '🚀 Launch Now'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
