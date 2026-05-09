'use client';

import { useState, useEffect } from 'react';

const TRIGGER_LABELS = {
  keyword: 'Keyword match',
  new_contact: 'New contact created',
  tag_added: 'Tag added to contact',
  any_message: 'Any inbound message',
  opt_in: 'Contact opts in',
};

const ACTION_LABELS = {
  send_message: 'Send message',
  add_tag: 'Add tag',
  remove_tag: 'Remove tag',
  update_stage: 'Update stage',
  handover: 'Hand over to agent',
  send_template: 'Send template',
};

const TRIGGER_ICONS = {
  keyword: '🔑',
  new_contact: '👤',
  tag_added: '🏷️',
  any_message: '💬',
  opt_in: '✅',
};

const ACTION_ICONS = {
  send_message: '💬',
  add_tag: '🏷️',
  remove_tag: '🗑️',
  update_stage: '📊',
  handover: '👨‍💼',
  send_template: '📄',
};

const DEFAULT_FORM = {
  name: '',
  isEnabled: true,
  trigger: { type: 'keyword', keywords: [''], tagName: '' },
  conditions: [],
  actions: [{ type: 'send_message', params: { text: '' } }],
};

export default function AutomationPage() {
  const [flows, setFlows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(null);

  async function loadFlows() {
    const res = await fetch('/api/flows');
    const data = await res.json();
    setFlows(data.flows || []);
    setLoading(false);
  }

  useEffect(() => { loadFlows(); }, []);

  async function saveFlow(e) {
    e.preventDefault();
    setSaving(true);
    await fetch('/api/flows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setShowBuilder(false);
    setForm(DEFAULT_FORM);
    loadFlows();
  }

  async function toggleFlow(flow) {
    setToggling(flow._id);
    await fetch(`/api/flows/${flow._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isEnabled: !flow.isEnabled }),
    });
    setToggling(null);
    loadFlows();
  }

  async function deleteFlow(id) {
    if (!confirm('Delete this automation flow?')) return;
    await fetch(`/api/flows/${id}`, { method: 'DELETE' });
    loadFlows();
  }

  function updateTrigger(updates) {
    setForm((f) => ({ ...f, trigger: { ...f.trigger, ...updates } }));
  }

  function updateAction(index, updates) {
    const actions = [...form.actions];
    actions[index] = { ...actions[index], ...updates };
    setForm((f) => ({ ...f, actions }));
  }

  function addAction() {
    setForm((f) => ({ ...f, actions: [...f.actions, { type: 'send_message', params: { text: '' } }] }));
  }

  function removeAction(index) {
    setForm((f) => ({ ...f, actions: f.actions.filter((_, i) => i !== index) }));
  }

  const inputCls = "w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#25D366] focus:bg-white text-sm transition-colors";

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Automation Flows</h2>
          <p className="text-slate-500 text-sm mt-0.5">Trigger actions automatically when contacts message you</p>
        </div>
        <button
          onClick={() => { setForm(DEFAULT_FORM); setShowBuilder(true); }}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
        >
          + New Flow
        </button>
      </div>

      {/* Flow list */}
      {loading ? (
        <div className="text-center py-16 text-slate-400">Loading flows...</div>
      ) : flows.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl mb-4">⚡</div>
          <p className="text-slate-600 font-medium mb-1">No automation flows yet</p>
          <p className="text-slate-400 text-sm">Create a flow to automatically reply, tag contacts, or escalate conversations</p>
        </div>
      ) : (
        <div className="space-y-3">
          {flows.map((flow) => (
            <div key={flow._id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 flex items-start gap-4">
              <div className="text-2xl mt-0.5">{TRIGGER_ICONS[flow.trigger?.type] || '⚡'}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-slate-900 font-semibold text-sm">{flow.name}</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${flow.isEnabled ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {flow.isEnabled ? 'Active' : 'Paused'}
                  </span>
                </div>
                <p className="text-slate-500 text-xs mb-2">
                  Trigger: <span className="font-medium text-slate-700">{TRIGGER_LABELS[flow.trigger?.type]}</span>
                  {flow.trigger?.keywords?.length > 0 && flow.trigger.keywords[0] && (
                    <> · Keywords: <span className="font-medium text-slate-700">{flow.trigger.keywords.join(', ')}</span></>
                  )}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(flow.actions || []).map((action, i) => (
                    <span key={i} className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs">
                      {ACTION_ICONS[action.type]} {ACTION_LABELS[action.type]}
                    </span>
                  ))}
                </div>
                <p className="text-slate-400 text-xs mt-2">Executed {flow.executionCount} time{flow.executionCount !== 1 ? 's' : ''}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => toggleFlow(flow)}
                  disabled={toggling === flow._id}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${flow.isEnabled ? 'bg-[#25D366]' : 'bg-slate-200'}`}
                >
                  <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transform transition-transform ${flow.isEnabled ? 'translate-x-4' : 'translate-x-1'}`} />
                </button>
                <button
                  onClick={() => deleteFlow(flow._id)}
                  className="text-slate-300 hover:text-red-500 transition-colors p-1"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Flow Builder Modal */}
      {showBuilder && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={() => setShowBuilder(false)} />
          <div className="relative bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 bg-slate-200 rounded-full" />
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
              <h3 className="font-bold text-slate-900 text-lg">New Automation Flow</h3>
              <button onClick={() => setShowBuilder(false)} className="text-slate-400 hover:text-slate-700 p-1">✕</button>
            </div>

            <form onSubmit={saveFlow} className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Flow name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Flow Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Welcome new lead"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputCls}
                />
              </div>

              {/* Trigger */}
              <div className="bg-green-50 border border-green-100 rounded-xl p-4 space-y-3">
                <p className="text-xs font-semibold text-green-700 uppercase tracking-wider">⚡ Trigger</p>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">When this happens…</label>
                  <select
                    value={form.trigger.type}
                    onChange={(e) => updateTrigger({ type: e.target.value })}
                    className={inputCls}
                  >
                    {Object.entries(TRIGGER_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                {form.trigger.type === 'keyword' && (
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Keywords (comma-separated)</label>
                    <input
                      type="text"
                      placeholder="hello, hi, start, info"
                      value={form.trigger.keywords.join(', ')}
                      onChange={(e) => updateTrigger({ keywords: e.target.value.split(',').map((k) => k.trim()) })}
                      className={inputCls}
                    />
                  </div>
                )}
                {form.trigger.type === 'tag_added' && (
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Tag name</label>
                    <input
                      type="text"
                      placeholder="qualified"
                      value={form.trigger.tagName}
                      onChange={(e) => updateTrigger({ tagName: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3">
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">🎯 Actions</p>
                {form.actions.map((action, i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <select
                        value={action.type}
                        onChange={(e) => updateAction(i, { type: e.target.value, params: {} })}
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:border-[#25D366]"
                      >
                        {Object.entries(ACTION_LABELS).map(([k, v]) => (
                          <option key={k} value={k}>{ACTION_ICONS[k]} {v}</option>
                        ))}
                      </select>
                      {form.actions.length > 1 && (
                        <button type="button" onClick={() => removeAction(i)} className="text-slate-400 hover:text-red-500 transition-colors">✕</button>
                      )}
                    </div>
                    {action.type === 'send_message' && (
                      <textarea
                        rows={2}
                        placeholder="Message text..."
                        value={action.params?.text || ''}
                        onChange={(e) => updateAction(i, { params: { text: e.target.value } })}
                        className={inputCls}
                      />
                    )}
                    {(action.type === 'add_tag' || action.type === 'remove_tag') && (
                      <input
                        type="text"
                        placeholder="Tag name"
                        value={action.params?.tag || ''}
                        onChange={(e) => updateAction(i, { params: { tag: e.target.value } })}
                        className={inputCls}
                      />
                    )}
                    {action.type === 'update_stage' && (
                      <input
                        type="text"
                        placeholder="Stage (e.g. qualified, closed)"
                        value={action.params?.stage || ''}
                        onChange={(e) => updateAction(i, { params: { stage: e.target.value } })}
                        className={inputCls}
                      />
                    )}
                    {action.type === 'send_template' && (
                      <input
                        type="text"
                        placeholder="Template name"
                        value={action.params?.templateName || ''}
                        onChange={(e) => updateAction(i, { params: { templateName: e.target.value } })}
                        className={inputCls}
                      />
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addAction}
                  className="w-full py-2 border border-dashed border-blue-200 text-blue-600 hover:bg-blue-50 rounded-lg text-sm transition-colors"
                >
                  + Add another action
                </button>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowBuilder(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-[#25D366] hover:bg-[#128C7E] disabled:opacity-60 text-white rounded-xl text-sm font-semibold shadow-sm"
                >
                  {saving ? 'Saving…' : 'Create Flow'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
