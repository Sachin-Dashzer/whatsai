'use client';

import { useState, useEffect } from 'react';

const STEPS = ['Name', 'Template', 'Audience', 'Schedule', 'Review'];

const STATUS_COLORS = {
  draft: 'bg-slate-100 text-slate-600',
  scheduled: 'bg-blue-50 text-blue-700',
  running: 'bg-yellow-50 text-yellow-700',
  completed: 'bg-green-50 text-green-700',
  failed: 'bg-red-50 text-red-700',
};

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

  function StatBar({ label, value, total, color }) {
    const pct = total > 0 ? Math.round((value / total) * 100) : 0;
    return (
      <div>
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>{label}</span>
          <span className="font-medium">{pct}%</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full">
          <div className={`h-1.5 ${color} rounded-full`} style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  }

  const inputCls = "w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#25D366] focus:bg-white transition-colors";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Broadcasts</h2>
          <p className="text-slate-500 text-sm">Send WhatsApp template campaigns to your contacts</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          + New Broadcast
        </button>
      </div>

      <div className="space-y-4">
        {broadcasts.map((b) => (
          <div key={b._id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-slate-900">{b.name}</h3>
                <p className="text-slate-500 text-sm mt-0.5">Template: {b.templateName || 'N/A'}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[b.status]}`}>
                {b.status}
              </span>
            </div>

            {b.stats?.total > 0 && (
              <div className="space-y-2">
                <StatBar label="Sent" value={b.stats.sent} total={b.stats.total} color="bg-[#25D366]" />
                <StatBar label="Delivered" value={b.stats.delivered} total={b.stats.total} color="bg-blue-500" />
                <StatBar label="Read" value={b.stats.read} total={b.stats.total} color="bg-purple-500" />
              </div>
            )}

            <p className="text-slate-400 text-xs mt-3">
              {new Date(b.createdAt).toLocaleDateString()} · {b.stats?.total || 0} contacts
            </p>
          </div>
        ))}
      </div>

      {broadcasts.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <div className="text-4xl mb-3">📢</div>
          <p>No broadcasts yet. Create your first campaign!</p>
        </div>
      )}

      {/* Create broadcast modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCreate(false)} />
          <div className="relative bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-xl">
            {/* Steps */}
            <div className="flex items-center gap-1 mb-6">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-1 flex-1">
                  <div className="flex-1 flex items-center justify-center">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        i < step ? 'bg-[#25D366] text-white' : i === step ? 'bg-green-50 text-[#25D366] border-2 border-[#25D366]' : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {i < step ? '✓' : i + 1}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && <div className={`h-px flex-1 ${i < step ? 'bg-[#25D366]' : 'bg-slate-200'}`} />}
                </div>
              ))}
            </div>

            <h3 className="font-bold text-slate-900 text-lg mb-5">{STEPS[step]}</h3>

            {step === 0 && (
              <input type="text" placeholder="e.g. Diwali Sale Campaign" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
            )}

            {step === 1 && (
              <div className="space-y-3">
                <input type="text" placeholder="Template name (from Meta dashboard)" value={form.templateName} onChange={(e) => setForm({ ...form, templateName: e.target.value })} className={inputCls} />
                <p className="text-slate-400 text-xs">Enter the exact template name as approved in your Meta WhatsApp Business account.</p>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <label className="block text-sm text-slate-600 mb-1.5">Filter by tags (comma separated)</label>
                <input type="text" placeholder="e.g. hot-lead, delhi (leave empty for all)" value={form.targetTags} onChange={(e) => setForm({ ...form, targetTags: e.target.value })} className={inputCls} />
              </div>
            )}

            {step === 3 && (
              <div className="space-y-3">
                <label className="block text-sm text-slate-600 mb-1.5">Schedule (leave empty to send now)</label>
                <input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} className={inputCls} />
              </div>
            )}

            {step === 4 && (
              <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
                {[['Name', form.name], ['Template', form.templateName], ['Audience', form.targetTags || 'All contacts'], ['Timing', form.scheduledAt || 'Send immediately']].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-slate-500">{k}</span>
                    <span className="text-slate-900 font-medium">{v}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              {step > 0 && (
                <button onClick={() => setStep(step - 1)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium">
                  Back
                </button>
              )}
              {step < STEPS.length - 1 ? (
                <button onClick={() => setStep(step + 1)} disabled={step === 0 && !form.name} className="flex-1 py-2.5 bg-[#25D366] disabled:opacity-50 text-white rounded-xl text-sm font-medium shadow-sm">
                  Next
                </button>
              ) : (
                <button onClick={createAndLaunch} disabled={launching} className="flex-1 py-2.5 bg-[#25D366] disabled:opacity-60 text-white rounded-xl text-sm font-medium shadow-sm">
                  {launching ? 'Launching...' : form.scheduledAt ? 'Schedule' : 'Launch Now'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
