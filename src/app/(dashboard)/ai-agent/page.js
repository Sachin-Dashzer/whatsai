'use client';

import { useState, useEffect } from 'react';

const EXAMPLE_PROMPT = `You are Priya, a friendly sales assistant for Ryan Hair Clinic — India's premium hair transplant clinic.

Your job is to:
1. Greet the customer warmly
2. Ask about their hair loss concern (How long? Which area?)
3. Ask about their location (Delhi / Mumbai / Hyderabad?)
4. Ask about their budget expectation
5. Based on responses, qualify them as hot/warm/cold lead

Be conversational. Ask one question at a time. Never mention AI.`;

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${checked ? 'bg-[#25D366]' : 'bg-slate-200'}`}
    >
      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-sm ${checked ? 'translate-x-7' : 'translate-x-1'}`} />
    </button>
  );
}

function Card({ title, children, badge }) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h3 className="font-semibold text-slate-900 text-sm">{title}</h3>
        {badge}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function AIAgentPage() {
  const [config, setConfig] = useState({
    isEnabled: false,
    agentName: 'AI Assistant',
    systemPrompt: '',
    qualifyingQuestions: [],
    tagRules: [],
    handoverTriggers: ['human', 'agent', 'person', 'call me'],
    welcomeMessage: '',
    fallbackMessage: "I'm not sure about that. Let me connect you with our team.",
    contextWindow: 10,
    language: 'en',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newTrigger, setNewTrigger] = useState('');
  const [newTagRule, setNewTagRule] = useState({ keyword: '', tag: '', stage: '' });

  useEffect(() => {
    fetch('/api/ai-agent/config')
      .then((r) => r.json())
      .then((data) => { if (data._id) setConfig((prev) => ({ ...prev, ...data })); });
  }, []);

  async function save() {
    setSaving(true);
    await fetch('/api/ai-agent/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function addQuestion() {
    if (!newQuestion.trim()) return;
    setConfig((c) => ({ ...c, qualifyingQuestions: [...c.qualifyingQuestions, newQuestion.trim()] }));
    setNewQuestion('');
  }

  function addTrigger() {
    if (!newTrigger.trim()) return;
    setConfig((c) => ({ ...c, handoverTriggers: [...c.handoverTriggers, newTrigger.trim()] }));
    setNewTrigger('');
  }

  function addTagRule() {
    if (!newTagRule.keyword || !newTagRule.tag) return;
    setConfig((c) => ({ ...c, tagRules: [...c.tagRules, { ...newTagRule }] }));
    setNewTagRule({ keyword: '', tag: '', stage: '' });
  }

  const inputCls = 'w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#25D366] focus:bg-white text-sm transition-colors';

  return (
    <div className="max-w-3xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">AI Agent</h2>
          <p className="text-slate-500 text-sm mt-0.5">Configure how your AI sales agent responds to customers</p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className={`self-start sm:self-auto px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm ${
            saved ? 'bg-emerald-500 text-white' : 'bg-[#25D366] hover:bg-[#128C7E] disabled:opacity-60 text-white'
          }`}
        >
          {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save Config'}
        </button>
      </div>

      {/* Enable toggle */}
      <div className={`flex items-center justify-between p-5 rounded-2xl border ${config.isEnabled ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-slate-100'} shadow-sm`}>
        <div>
          <h3 className="font-semibold text-slate-900">AI Agent {config.isEnabled ? 'Active' : 'Paused'}</h3>
          <p className="text-sm text-slate-500 mt-0.5">
            {config.isEnabled
              ? 'AI is automatically responding to incoming WhatsApp messages'
              : 'Enable to let AI handle incoming conversations automatically'}
          </p>
        </div>
        <Toggle checked={config.isEnabled} onChange={() => setConfig((c) => ({ ...c, isEnabled: !c.isEnabled }))} />
      </div>

      {/* Identity */}
      <Card title="Agent Identity">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Agent Name</label>
            <input type="text" value={config.agentName} onChange={(e) => setConfig((c) => ({ ...c, agentName: e.target.value }))} className={inputCls} placeholder="e.g. Priya" />
            <p className="text-xs text-slate-400 mt-1">Name the AI introduces itself as</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Response Language</label>
            <select value={config.language} onChange={(e) => setConfig((c) => ({ ...c, language: e.target.value }))} className={inputCls}>
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="hi-en">Hinglish</option>
            </select>
          </div>
        </div>
      </Card>

      {/* System prompt */}
      <Card
        title="System Prompt"
        badge={
          <button onClick={() => setConfig((c) => ({ ...c, systemPrompt: EXAMPLE_PROMPT }))} className="text-xs font-semibold text-[#25D366] hover:underline">
            Load example
          </button>
        }
      >
        <textarea
          value={config.systemPrompt}
          onChange={(e) => setConfig((c) => ({ ...c, systemPrompt: e.target.value }))}
          rows={8}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#25D366] focus:bg-white text-sm font-mono resize-none transition-colors"
          placeholder="You are a helpful sales assistant for [Business Name]..."
        />
        <p className="text-xs text-slate-400 mt-2">This prompt guides your AI's personality, goals, and behavior in every conversation.</p>
      </Card>

      {/* Messages */}
      <Card title="Auto Messages">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Welcome Message</label>
            <textarea
              value={config.welcomeMessage}
              onChange={(e) => setConfig((c) => ({ ...c, welcomeMessage: e.target.value }))}
              rows={2}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#25D366] text-sm resize-none"
              placeholder="Hi! Welcome to our service. How can I help you today?"
            />
            <p className="text-xs text-slate-400 mt-1">Sent when a contact messages for the first time. Leave empty to skip.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Fallback Message</label>
            <textarea
              value={config.fallbackMessage}
              onChange={(e) => setConfig((c) => ({ ...c, fallbackMessage: e.target.value }))}
              rows={2}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#25D366] text-sm resize-none"
            />
            <p className="text-xs text-slate-400 mt-1">Sent when the AI can&apos;t generate a meaningful response.</p>
          </div>
        </div>
      </Card>

      {/* Qualifying questions */}
      <Card title="Qualifying Questions">
        <div className="space-y-2 mb-3">
          {config.qualifyingQuestions.length === 0 && (
            <p className="text-sm text-slate-400 py-2">No questions yet. Add questions the AI should ask to qualify leads.</p>
          )}
          {config.qualifyingQuestions.map((q, i) => (
            <div key={i} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
              <span className="text-xs font-bold text-slate-400 w-5 shrink-0">{i + 1}.</span>
              <span className="text-sm text-slate-800 flex-1">{q}</span>
              <button onClick={() => setConfig((c) => ({ ...c, qualifyingQuestions: c.qualifyingQuestions.filter((_, j) => j !== i) }))} className="text-slate-300 hover:text-red-400 transition-colors shrink-0 p-0.5">
                <CloseIcon />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input type="text" value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addQuestion()} placeholder="e.g. What's your location?" className={inputCls} />
          <button onClick={addQuestion} className="shrink-0 px-4 py-2 bg-[#25D366] text-white rounded-xl text-sm font-semibold shadow-sm hover:bg-[#128C7E] transition-colors">Add</button>
        </div>
      </Card>

      {/* Auto-tagging rules */}
      <Card title="Auto-Tagging Rules">
        <div className="space-y-2 mb-3">
          {config.tagRules.length === 0 && (
            <p className="text-sm text-slate-400 py-2">No rules yet. Auto-tag contacts based on keywords in their messages.</p>
          )}
          {config.tagRules.map((rule, i) => (
            <div key={i} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm">
              <span className="text-slate-400 shrink-0">If</span>
              <span className="font-mono text-amber-700 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded">&quot;{rule.keyword}&quot;</span>
              <span className="text-slate-400">→ tag:</span>
              <span className="font-semibold text-[#25D366]">{rule.tag}</span>
              {rule.stage && <><span className="text-slate-400">+ stage:</span><span className="text-blue-600 font-medium">{rule.stage}</span></>}
              <button onClick={() => setConfig((c) => ({ ...c, tagRules: c.tagRules.filter((_, j) => j !== i) }))} className="ml-auto text-slate-300 hover:text-red-400 transition-colors p-0.5">
                <CloseIcon />
              </button>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2 mb-2">
          <input type="text" placeholder="Keyword" value={newTagRule.keyword} onChange={(e) => setNewTagRule({ ...newTagRule, keyword: e.target.value })} className={inputCls} />
          <input type="text" placeholder="Tag name" value={newTagRule.tag} onChange={(e) => setNewTagRule({ ...newTagRule, tag: e.target.value })} className={inputCls} />
          <input type="text" placeholder="Stage (opt)" value={newTagRule.stage} onChange={(e) => setNewTagRule({ ...newTagRule, stage: e.target.value })} className={inputCls} />
        </div>
        <button onClick={addTagRule} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors">
          Add Rule
        </button>
      </Card>

      {/* Handover triggers */}
      <Card title="Human Handover Triggers">
        <p className="text-xs text-slate-400 mb-3">When a customer says any of these words, the AI pauses and alerts a human agent.</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {config.handoverTriggers.map((trigger, i) => (
            <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-700 border border-orange-100 rounded-full text-sm font-medium">
              {trigger}
              <button onClick={() => setConfig((c) => ({ ...c, handoverTriggers: c.handoverTriggers.filter((_, j) => j !== i) }))} className="hover:text-red-500 transition-colors p-0.5">
                <CloseIcon />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input type="text" value={newTrigger} onChange={(e) => setNewTrigger(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTrigger()} placeholder="Add trigger word…" className={inputCls} />
          <button onClick={addTrigger} className="shrink-0 px-4 py-2 bg-orange-50 text-orange-700 border border-orange-100 rounded-xl text-sm font-semibold hover:bg-orange-100 transition-colors">Add</button>
        </div>
      </Card>

      {/* Context window */}
      <Card title="Context Window">
        <div className="flex items-center gap-4">
          <input type="range" min={5} max={20} value={config.contextWindow} onChange={(e) => setConfig((c) => ({ ...c, contextWindow: parseInt(e.target.value) }))} className="flex-1 accent-[#25D366]" />
          <div className="w-20 text-right">
            <span className="text-lg font-bold text-slate-900">{config.contextWindow}</span>
            <span className="text-xs text-slate-400 ml-1">msgs</span>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-2">Number of past messages included in AI context. Higher = better memory, higher cost.</p>
      </Card>
    </div>
  );
}
