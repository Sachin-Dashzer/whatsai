'use client';

import { useState, useEffect, useRef } from 'react';

const EXAMPLE_PROMPT = `You are Priya, a friendly sales assistant for Ryan Hair Clinic — India's premium hair transplant clinic.

Your job is to:
1. Greet the customer warmly
2. Ask about their hair loss concern (How long? Which area?)
3. Ask about their location (Delhi / Mumbai / Hyderabad?)
4. Ask about their budget expectation
5. Based on responses, qualify them as hot/warm/cold lead

Be conversational. Ask one question at a time. Never mention AI.`;

const SECTIONS = [
  { id: 'identity',   label: 'Identity',    icon: '🤖' },
  { id: 'prompts',    label: 'Prompts',     icon: '💬' },
  { id: 'questions',  label: 'Questions',   icon: '❓' },
  { id: 'tagging',    label: 'Auto-Tag',    icon: '🏷️' },
  { id: 'handover',   label: 'Handover',    icon: '🤝' },
  { id: 'advanced',   label: 'Advanced',    icon: '⚙️' },
];

function Toggle({ checked, onChange, size = 'md' }) {
  const w = size === 'lg' ? 'w-14 h-7' : 'w-11 h-6';
  const knob = size === 'lg' ? 'w-5 h-5 top-1 translate-x-8' : 'w-4 h-4 top-1 translate-x-6';
  const off = 'top-1 translate-x-1';
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative ${w} rounded-full transition-colors duration-200 ${checked ? 'bg-[#25D366]' : 'bg-slate-200'}`}
      aria-checked={checked}
    >
      <span className={`absolute ${size === 'lg' ? 'w-5 h-5 top-1' : 'w-4 h-4 top-1'} bg-white rounded-full transition-transform duration-200 shadow ${checked ? (size === 'lg' ? 'translate-x-8' : 'translate-x-6') : 'translate-x-1'}`} />
    </button>
  );
}

function SectionPanel({ id, title, icon, desc, children, activeSection, sectionRefs }) {
  return (
    <div
      id={id}
      ref={(el) => { if (sectionRefs) sectionRefs.current[id] = el; }}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden scroll-mt-4"
    >
      <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-lg shrink-0">{icon}</div>
        <div>
          <h3 className="font-semibold text-slate-900">{title}</h3>
          {desc && <p className="text-xs text-slate-400 mt-0.5">{desc}</p>}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function CloseBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="ml-auto p-1 rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 transition-colors"
    >
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  );
}

function AddRow({ value, onChange, onAdd, onKeyDown, placeholder, btnLabel = 'Add', btnColor = 'green' }) {
  const colors = {
    green: 'bg-[#25D366] hover:bg-[#128C7E] text-white',
    orange: 'bg-orange-100 hover:bg-orange-200 text-orange-700 border border-orange-200',
  };
  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#25D366]/30 focus:border-[#25D366] focus:bg-white text-sm transition-all"
      />
      <button
        onClick={onAdd}
        className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${colors[btnColor]}`}
      >
        {btnLabel}
      </button>
    </div>
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
  const [activeSection, setActiveSection] = useState('identity');
  const sectionRefs = useRef({});

  useEffect(() => {
    fetch('/api/ai-agent/config')
      .then((r) => r.json())
      .then((data) => { if (data._id) setConfig((prev) => ({ ...prev, ...data })); });
  }, []);

  // Scroll spy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveSection(e.target.id);
        });
      },
      { threshold: 0.4 }
    );
    Object.values(sectionRefs.current).forEach((el) => { if (el) observer.observe(el); });
    return () => observer.disconnect();
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

  function scrollTo(id) {
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  const inputCls = 'w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#25D366]/30 focus:border-[#25D366] focus:bg-white text-sm transition-all';
  const charCount = config.systemPrompt.length;

  return (
    <div className="min-h-full">
      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-7">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AI Agent</h1>
          <p className="text-slate-500 text-sm mt-1">Configure your AI sales agent's personality, rules, and behavior.</p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className={`self-start shrink-0 px-6 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all flex items-center gap-2 ${
            saved
              ? 'bg-emerald-500 text-white'
              : 'bg-[#25D366] hover:bg-[#128C7E] disabled:opacity-60 text-white'
          }`}
        >
          {saving && (
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save Config'}
        </button>
      </div>

      {/* ── Status banner ── */}
      <div
        className={`mb-6 flex items-center justify-between gap-4 px-6 py-4 rounded-2xl border transition-all ${
          config.isEnabled
            ? 'bg-emerald-50 border-emerald-200'
            : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${config.isEnabled ? 'bg-emerald-100' : 'bg-slate-100'}`}>
            🤖
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-sm">
              AI Agent &mdash;&nbsp;
              <span className={config.isEnabled ? 'text-emerald-600' : 'text-slate-400'}>
                {config.isEnabled ? 'Active' : 'Paused'}
              </span>
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {config.isEnabled
                ? `"${config.agentName}" is responding to incoming WhatsApp messages automatically`
                : 'Enable to let AI handle conversations automatically'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {config.isEnabled && (
            <span className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </span>
          )}
          <Toggle
            checked={config.isEnabled}
            onChange={() => setConfig((c) => ({ ...c, isEnabled: !c.isEnabled }))}
            size="lg"
          />
        </div>
      </div>

      {/* ── Mobile horizontal section tabs (hidden on lg+) ── */}
      <div className="lg:hidden flex gap-1.5 overflow-x-auto pb-1 -mx-3 sm:-mx-5 px-3 sm:px-5 scrollbar-hide">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => scrollTo(s.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
              activeSection === s.id
                ? 'bg-[#25D366] text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            <span>{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6 items-start">

        {/* Side nav — desktop only */}
        <nav className="hidden lg:block lg:sticky lg:top-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-2">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                activeSection === s.id
                  ? 'bg-[#25D366]/10 text-[#128C7E] font-semibold'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <span className="text-base">{s.icon}</span>
              {s.label}
              {activeSection === s.id && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#25D366]" />
              )}
            </button>
          ))}
        </nav>

        {/* Content sections */}
        <div className="space-y-5 min-w-0">

          {/* Identity */}
          <SectionPanel
            id="identity"
            icon="🤖"
            title="Agent Identity"
            desc="Name and language your AI uses in conversations"
            sectionRefs={sectionRefs}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Agent Name</label>
                <input
                  type="text"
                  value={config.agentName}
                  onChange={(e) => setConfig((c) => ({ ...c, agentName: e.target.value }))}
                  className={inputCls}
                  placeholder="e.g. Priya"
                />
                <p className="text-xs text-slate-400">Name the AI introduces itself as to customers</p>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Response Language</label>
                <select
                  value={config.language}
                  onChange={(e) => setConfig((c) => ({ ...c, language: e.target.value }))}
                  className={inputCls}
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="hi-en">Hinglish (Hindi + English)</option>
                </select>
                <p className="text-xs text-slate-400">Primary language for AI responses</p>
              </div>
            </div>
          </SectionPanel>

          {/* System prompt */}
          <SectionPanel
            id="prompts"
            icon="💬"
            title="System Prompt & Auto Messages"
            desc="Guide AI personality and configure automatic messages"
            sectionRefs={sectionRefs}
          >
            <div className="space-y-6">
              {/* System prompt */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">System Prompt</label>
                  <button
                    onClick={() => setConfig((c) => ({ ...c, systemPrompt: EXAMPLE_PROMPT }))}
                    className="text-xs font-semibold text-[#25D366] hover:text-[#128C7E] hover:underline"
                  >
                    Load example →
                  </button>
                </div>
                <div className="relative">
                  <textarea
                    value={config.systemPrompt}
                    onChange={(e) => setConfig((c) => ({ ...c, systemPrompt: e.target.value }))}
                    rows={9}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#25D366]/30 focus:border-[#25D366] focus:bg-white text-sm font-mono resize-none transition-all"
                    placeholder="You are a helpful sales assistant for [Business Name]. Your job is to..."
                  />
                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    <span className={`text-xs font-mono px-2 py-0.5 rounded-lg ${charCount > 2000 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-400'}`}>
                      {charCount.toLocaleString()}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-400">Guides your AI's personality, goals, and behavior in every conversation.</p>
              </div>

              <hr className="border-slate-100" />

              {/* Welcome message */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Welcome Message</label>
                  <span className="px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-600 rounded-full border border-blue-100">Optional</span>
                </div>
                <textarea
                  value={config.welcomeMessage}
                  onChange={(e) => setConfig((c) => ({ ...c, welcomeMessage: e.target.value }))}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#25D366]/30 focus:border-[#25D366] focus:bg-white text-sm resize-none transition-all"
                  placeholder="Hi! Welcome to our service. How can I help you today?"
                />
                <p className="text-xs text-slate-400">Sent automatically when a contact messages for the first time.</p>
              </div>

              {/* Fallback */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Fallback Message</label>
                <textarea
                  value={config.fallbackMessage}
                  onChange={(e) => setConfig((c) => ({ ...c, fallbackMessage: e.target.value }))}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#25D366]/30 focus:border-[#25D366] focus:bg-white text-sm resize-none transition-all"
                />
                <p className="text-xs text-slate-400">Sent when the AI cannot generate a meaningful response.</p>
              </div>
            </div>
          </SectionPanel>

          {/* Qualifying questions */}
          <SectionPanel
            id="questions"
            icon="❓"
            title="Qualifying Questions"
            desc="Questions the AI asks to understand and qualify each lead"
            sectionRefs={sectionRefs}
          >
            <div className="space-y-3">
              {config.qualifyingQuestions.length === 0 && (
                <div className="text-center py-6 text-sm text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  No questions yet. Add questions below.
                </div>
              )}
              {config.qualifyingQuestions.map((q, i) => (
                <div key={i} className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                  <span className="w-6 h-6 rounded-full bg-[#25D366]/15 text-[#128C7E] text-xs font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-sm text-slate-800 flex-1">{q}</span>
                  <CloseBtn onClick={() => setConfig((c) => ({ ...c, qualifyingQuestions: c.qualifyingQuestions.filter((_, j) => j !== i) }))} />
                </div>
              ))}
              <AddRow
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                onAdd={addQuestion}
                onKeyDown={(e) => e.key === 'Enter' && addQuestion()}
                placeholder="e.g. What is your main concern today?"
              />
            </div>
          </SectionPanel>

          {/* Auto-tagging rules */}
          <SectionPanel
            id="tagging"
            icon="🏷️"
            title="Auto-Tagging Rules"
            desc="Automatically tag contacts and update their stage based on keywords"
            sectionRefs={sectionRefs}
          >
            {config.tagRules.length > 0 && (
              <div className="mb-4 overflow-hidden rounded-xl border border-slate-200">
                {/* Table header */}
                <div className="grid grid-cols-[1fr_1fr_1fr_36px] gap-3 px-4 py-2.5 bg-slate-50 border-b border-slate-200">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Keyword</span>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tag</span>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Stage</span>
                  <span />
                </div>
                {/* Rows */}
                {config.tagRules.map((rule, i) => (
                  <div
                    key={i}
                    className={`grid grid-cols-[1fr_1fr_1fr_36px] gap-3 items-center px-4 py-3 text-sm ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} ${i < config.tagRules.length - 1 ? 'border-b border-slate-100' : ''}`}
                  >
                    <span className="font-mono text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-lg text-xs w-fit">
                      &quot;{rule.keyword}&quot;
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#25D366]" />
                      <span className="font-semibold text-slate-700 text-xs">{rule.tag}</span>
                    </span>
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 border border-blue-100 px-2 py-1 rounded-lg w-fit">
                      {rule.stage || '—'}
                    </span>
                    <CloseBtn onClick={() => setConfig((c) => ({ ...c, tagRules: c.tagRules.filter((_, j) => j !== i) }))} />
                  </div>
                ))}
              </div>
            )}
            {config.tagRules.length === 0 && (
              <div className="text-center py-6 text-sm text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200 mb-4">
                No rules yet. Auto-tag contacts based on keywords.
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
              <input type="text" placeholder="Keyword" value={newTagRule.keyword} onChange={(e) => setNewTagRule({ ...newTagRule, keyword: e.target.value })} className={inputCls} />
              <input type="text" placeholder="Tag name" value={newTagRule.tag} onChange={(e) => setNewTagRule({ ...newTagRule, tag: e.target.value })} className={inputCls} />
              <input type="text" placeholder="Stage (optional)" value={newTagRule.stage} onChange={(e) => setNewTagRule({ ...newTagRule, stage: e.target.value })} className={inputCls} />
            </div>
            <button
              onClick={addTagRule}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors"
            >
              + Add Rule
            </button>
          </SectionPanel>

          {/* Handover triggers */}
          <SectionPanel
            id="handover"
            icon="🤝"
            title="Human Handover Triggers"
            desc="When a customer says these words, AI pauses and alerts a human agent"
            sectionRefs={sectionRefs}
          >
            {config.handoverTriggers.length === 0 && (
              <div className="text-center py-5 text-sm text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200 mb-3">
                No triggers set.
              </div>
            )}
            <div className="flex flex-wrap gap-2 mb-4">
              {config.handoverTriggers.map((trigger, i) => (
                <span
                  key={i}
                  className="flex items-center gap-2 pl-3 pr-2 py-1.5 bg-orange-50 text-orange-700 border border-orange-200 rounded-full text-sm font-medium"
                >
                  {trigger}
                  <button
                    onClick={() => setConfig((c) => ({ ...c, handoverTriggers: c.handoverTriggers.filter((_, j) => j !== i) }))}
                    className="w-4 h-4 rounded-full flex items-center justify-center bg-orange-100 hover:bg-red-100 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
            <AddRow
              value={newTrigger}
              onChange={(e) => setNewTrigger(e.target.value)}
              onAdd={addTrigger}
              onKeyDown={(e) => e.key === 'Enter' && addTrigger()}
              placeholder="Add trigger word or phrase…"
              btnLabel="Add"
              btnColor="orange"
            />
            <div className="mt-4 flex items-start gap-2.5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
              <span className="text-base shrink-0 mt-0.5">⚠️</span>
              <p className="text-xs text-amber-700 leading-relaxed">
                Handover sets the conversation status to <strong>Human Takeover</strong> and sends a notification to your team. Make sure agents are online to respond.
              </p>
            </div>
          </SectionPanel>

          {/* Advanced */}
          <SectionPanel
            id="advanced"
            icon="⚙️"
            title="Advanced Settings"
            desc="Fine-tune AI memory and performance"
            sectionRefs={sectionRefs}
          >
            <div className="space-y-6">
              {/* Context window */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Context Window</label>
                    <p className="text-xs text-slate-400 mt-0.5">Past messages included in AI memory per conversation</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-slate-900">{config.contextWindow}</span>
                    <span className="text-xs text-slate-400 ml-1">messages</span>
                  </div>
                </div>
                <div className="relative pt-1">
                  <input
                    type="range"
                    min={5}
                    max={20}
                    value={config.contextWindow}
                    onChange={(e) => setConfig((c) => ({ ...c, contextWindow: parseInt(e.target.value) }))}
                    className="w-full accent-[#25D366] h-2"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-1.5">
                    <span>5 (less memory)</span>
                    <span>20 (full memory)</span>
                  </div>
                </div>
                {/* Cost indicator */}
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {[
                    { label: 'Memory', val: config.contextWindow <= 8 ? 'Basic' : config.contextWindow <= 14 ? 'Good' : 'Excellent', color: config.contextWindow <= 8 ? 'text-slate-500' : config.contextWindow <= 14 ? 'text-blue-600' : 'text-emerald-600' },
                    { label: 'Accuracy', val: config.contextWindow <= 8 ? 'Lower' : config.contextWindow <= 14 ? 'Higher' : 'Best', color: config.contextWindow <= 8 ? 'text-slate-500' : config.contextWindow <= 14 ? 'text-blue-600' : 'text-emerald-600' },
                    { label: 'API Cost', val: config.contextWindow <= 8 ? 'Lowest' : config.contextWindow <= 14 ? 'Medium' : 'Higher', color: config.contextWindow <= 8 ? 'text-emerald-600' : config.contextWindow <= 14 ? 'text-amber-600' : 'text-orange-600' },
                  ].map((item) => (
                    <div key={item.label} className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                      <p className="text-xs text-slate-400 font-medium">{item.label}</p>
                      <p className={`text-xs font-bold mt-0.5 ${item.color}`}>{item.val}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SectionPanel>
        </div>
      </div>

      {/* Floating save bar */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
        <button
          onClick={save}
          disabled={saving}
          className={`px-6 py-3 rounded-2xl text-sm font-semibold shadow-lg transition-all flex items-center gap-2 ${
            saved
              ? 'bg-emerald-500 text-white shadow-emerald-200'
              : 'bg-[#25D366] hover:bg-[#128C7E] disabled:opacity-60 text-white shadow-green-200'
          }`}
        >
          {saving ? (
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : saved ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" d="M5 13l4 4L19 7" /></svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" d="M5 13l4 4L19 7" /></svg>
          )}
          {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Config'}
        </button>
      </div>
    </div>
  );
}
