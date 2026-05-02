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
  const [testOpen, setTestOpen] = useState(false);
  const [testMessages, setTestMessages] = useState([]);

  useEffect(() => {
    fetch('/api/ai-agent/config')
      .then((r) => r.json())
      .then((data) => {
        if (data._id) setConfig({ ...config, ...data });
      });
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
    setTimeout(() => setSaved(false), 2000);
  }

  function addQuestion() {
    if (!newQuestion.trim()) return;
    setConfig({ ...config, qualifyingQuestions: [...config.qualifyingQuestions, newQuestion.trim()] });
    setNewQuestion('');
  }

  function addTrigger() {
    if (!newTrigger.trim()) return;
    setConfig({ ...config, handoverTriggers: [...config.handoverTriggers, newTrigger.trim()] });
    setNewTrigger('');
  }

  function addTagRule() {
    if (!newTagRule.keyword || !newTagRule.tag) return;
    setConfig({ ...config, tagRules: [...config.tagRules, { ...newTagRule }] });
    setNewTagRule({ keyword: '', tag: '', stage: '' });
  }

  const inputCls = "w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#25D366] focus:bg-white text-sm transition-colors";
  const cardCls = "bg-white border border-slate-200 rounded-xl p-5 shadow-sm";

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">AI Agent Configuration</h2>
          <p className="text-slate-500 text-sm">Configure how your AI sales agent responds to customers</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setTestOpen(true)}
            className="px-4 py-2 bg-white text-slate-600 hover:text-slate-900 border border-slate-300 rounded-xl text-sm transition-colors shadow-sm"
          >
            🧪 Test Agent
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="px-4 py-2 bg-[#25D366] hover:bg-[#128C7E] disabled:opacity-60 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Config'}
          </button>
        </div>
      </div>

      {/* Enable toggle */}
      <div className={cardCls}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">Enable AI Agent</h3>
            <p className="text-slate-500 text-sm mt-0.5">AI will automatically respond to incoming WhatsApp messages</p>
          </div>
          <button
            onClick={() => setConfig({ ...config, isEnabled: !config.isEnabled })}
            className={`relative w-12 h-6 rounded-full transition-colors ${config.isEnabled ? 'bg-[#25D366]' : 'bg-slate-200'}`}
          >
            <span
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${config.isEnabled ? 'left-7' : 'left-1'}`}
            />
          </button>
        </div>
      </div>

      {/* Agent identity */}
      <div className={`${cardCls} space-y-4`}>
        <h3 className="font-semibold text-slate-900">Agent Identity</h3>
        <div>
          <label className="block text-sm text-slate-600 mb-1.5">Agent Name</label>
          <input
            type="text"
            value={config.agentName}
            onChange={(e) => setConfig({ ...config, agentName: e.target.value })}
            className={inputCls}
            placeholder="e.g. Priya"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-600 mb-1.5">Language</label>
          <select
            value={config.language}
            onChange={(e) => setConfig({ ...config, language: e.target.value })}
            className="px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-700 focus:outline-none focus:border-[#25D366] text-sm"
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="hi-en">Hinglish</option>
          </select>
        </div>
      </div>

      {/* System prompt */}
      <div className={cardCls}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-900">System Prompt</h3>
          <button
            onClick={() => setConfig({ ...config, systemPrompt: EXAMPLE_PROMPT })}
            className="text-xs text-[#25D366] hover:underline font-medium"
          >
            Load example
          </button>
        </div>
        <textarea
          value={config.systemPrompt}
          onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value })}
          rows={8}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#25D366] focus:bg-white text-sm font-mono resize-none transition-colors"
          placeholder="You are a helpful sales assistant for..."
        />
      </div>

      {/* Welcome & fallback */}
      <div className={`${cardCls} space-y-4`}>
        <h3 className="font-semibold text-slate-900">Messages</h3>
        <div>
          <label className="block text-sm text-slate-600 mb-1.5">Welcome Message (first contact)</label>
          <textarea
            value={config.welcomeMessage}
            onChange={(e) => setConfig({ ...config, welcomeMessage: e.target.value })}
            rows={2}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#25D366] text-sm resize-none"
            placeholder="Hi! Welcome to our service. How can I help you today?"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-600 mb-1.5">Fallback Message</label>
          <textarea
            value={config.fallbackMessage}
            onChange={(e) => setConfig({ ...config, fallbackMessage: e.target.value })}
            rows={2}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#25D366] text-sm resize-none"
          />
        </div>
      </div>

      {/* Qualifying questions */}
      <div className={cardCls}>
        <h3 className="font-semibold text-slate-900 mb-3">Qualifying Questions</h3>
        <div className="space-y-2 mb-3">
          {config.qualifyingQuestions.map((q, i) => (
            <div key={i} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
              <span className="text-slate-400 text-xs w-5">{i + 1}.</span>
              <span className="text-sm text-slate-800 flex-1">{q}</span>
              <button
                onClick={() => setConfig({ ...config, qualifyingQuestions: config.qualifyingQuestions.filter((_, j) => j !== i) })}
                className="text-slate-400 hover:text-red-500 text-xs"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addQuestion()}
            placeholder="Add a qualifying question..."
            className={inputCls}
          />
          <button onClick={addQuestion} className="px-4 py-2 bg-[#25D366] text-white rounded-xl text-sm font-medium shadow-sm">
            Add
          </button>
        </div>
      </div>

      {/* Tag rules */}
      <div className={cardCls}>
        <h3 className="font-semibold text-slate-900 mb-3">Auto-Tagging Rules</h3>
        <div className="space-y-2 mb-3">
          {config.tagRules.map((rule, i) => (
            <div key={i} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm">
              <span className="text-slate-500">If:</span>
              <span className="text-amber-700 font-mono bg-amber-50 px-1 rounded">&quot;{rule.keyword}&quot;</span>
              <span className="text-slate-500">→ tag:</span>
              <span className="text-[#25D366] font-medium">{rule.tag}</span>
              {rule.stage && <><span className="text-slate-500">+ stage:</span><span className="text-blue-600">{rule.stage}</span></>}
              <button
                onClick={() => setConfig({ ...config, tagRules: config.tagRules.filter((_, j) => j !== i) })}
                className="ml-auto text-slate-400 hover:text-red-500 text-xs"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2 mb-2">
          <input type="text" placeholder="Keyword" value={newTagRule.keyword} onChange={(e) => setNewTagRule({ ...newTagRule, keyword: e.target.value })} className={inputCls} />
          <input type="text" placeholder="Tag name" value={newTagRule.tag} onChange={(e) => setNewTagRule({ ...newTagRule, tag: e.target.value })} className={inputCls} />
          <input type="text" placeholder="Stage (optional)" value={newTagRule.stage} onChange={(e) => setNewTagRule({ ...newTagRule, stage: e.target.value })} className={inputCls} />
        </div>
        <button onClick={addTagRule} className="px-4 py-2 bg-[#25D366] text-white rounded-xl text-sm font-medium shadow-sm">
          Add Rule
        </button>
      </div>

      {/* Handover triggers */}
      <div className={cardCls}>
        <h3 className="font-semibold text-slate-900 mb-3">Human Handover Triggers</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {config.handoverTriggers.map((trigger, i) => (
            <span key={i} className="flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-700 border border-orange-100 rounded-full text-sm">
              {trigger}
              <button
                onClick={() => setConfig({ ...config, handoverTriggers: config.handoverTriggers.filter((_, j) => j !== i) })}
                className="hover:text-red-500 text-xs"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTrigger}
            onChange={(e) => setNewTrigger(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTrigger()}
            placeholder="Add trigger keyword..."
            className={inputCls}
          />
          <button onClick={addTrigger} className="px-4 py-2 bg-orange-50 text-orange-700 border border-orange-200 rounded-xl text-sm font-medium">
            Add
          </button>
        </div>
      </div>

      {/* Context window */}
      <div className={cardCls}>
        <h3 className="font-semibold text-slate-900 mb-3">Context Window</h3>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={5}
            max={20}
            value={config.contextWindow}
            onChange={(e) => setConfig({ ...config, contextWindow: parseInt(e.target.value) })}
            className="flex-1 accent-[#25D366]"
          />
          <span className="text-slate-900 font-bold w-16 text-right">{config.contextWindow} msgs</span>
        </div>
        <p className="text-slate-400 text-xs mt-2">Number of past messages included in AI context</p>
      </div>

      {/* Test modal */}
      {testOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setTestOpen(false)} />
          <div className="relative bg-white border border-slate-200 rounded-2xl w-full max-w-md h-125 flex flex-col shadow-xl">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Test AI Agent</h3>
              <button onClick={() => setTestOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
              {testMessages.length === 0 && (
                <p className="text-slate-400 text-sm text-center mt-8">
                  Send a real WhatsApp message to test your AI agent.<br />
                  Make sure to save your config first.
                </p>
              )}
              {testMessages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs px-4 py-2 rounded-xl text-sm ${m.role === 'user' ? 'bg-[#25D366] text-white' : 'bg-white text-slate-800 border border-slate-200'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-slate-100 text-center text-slate-400 text-xs bg-white">
              Connect your WhatsApp Business number in Settings to test live
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
