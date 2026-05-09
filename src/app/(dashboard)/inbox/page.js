'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import TagBadge from '@/components/dashboard/TagBadge';

/* ─── Avatar ─────────────────────────────────────────────── */
const GRADIENTS = [
  'from-violet-500 to-purple-600',
  'from-blue-500 to-indigo-600',
  'from-cyan-500 to-blue-600',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600',
  'from-orange-500 to-amber-600',
  'from-pink-500 to-fuchsia-600',
  'from-teal-500 to-cyan-600',
];
function avatarGradient(s = '') {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
  return GRADIENTS[Math.abs(h) % GRADIENTS.length];
}
const SIZES = { xs: 'w-7 h-7 text-[11px]', sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-xl' };
function Avatar({ name, phone, size = 'md' }) {
  const label = (name || phone || '?').trim();
  return (
    <div className={`${SIZES[size]} bg-gradient-to-br ${avatarGradient(label)} rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow-sm`}>
      {label[0].toUpperCase()}
    </div>
  );
}

/* ─── Status ─────────────────────────────────────────────── */
const STATUS_CFG = {
  ai_active:      { label: 'AI Active', dot: 'bg-emerald-400', pill: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  human_takeover: { label: 'Human',     dot: 'bg-orange-400',  pill: 'bg-orange-50  text-orange-700  border-orange-200'  },
  resolved:       { label: 'Resolved',  dot: 'bg-slate-300',   pill: 'bg-slate-50   text-slate-600   border-slate-200'   },
};
function StatusPill({ status }) {
  const c = STATUS_CFG[status] || STATUS_CFG.resolved;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${c.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

/* ─── Helpers ─────────────────────────────────────────────── */
function formatTime(date) {
  if (!date) return '';
  const d = new Date(date), now = new Date(), diff = now - d;
  if (diff < 60000) return 'now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
  return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
}

/* ─── Inline SVG icons ────────────────────────────────────── */
function SendIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  );
}
function BackIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function Spinner({ size = 4 }) {
  return <span className={`w-${size} h-${size} border-2 border-white/30 border-t-white rounded-full animate-spin block`} />;
}

/* ─── STATUS FILTERS ──────────────────────────────────────── */
const STATUS_FILTERS = [
  { value: 'all',            label: 'All' },
  { value: 'ai_active',      label: 'AI Active' },
  { value: 'human_takeover', label: 'Human' },
  { value: 'resolved',       label: 'Resolved' },
];

/* ══════════════════════════════════════════════════════════
   NEW CHAT MODAL
══════════════════════════════════════════════════════════ */
function NewChatModal({ onClose, onSuccess }) {
  const [tab, setTab] = useState('existing');
  const [templates, setTemplates] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [contactSearch, setContactSearch] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newName, setNewName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const [tRes, cRes] = await Promise.all([
        fetch('/api/whatsapp/templates'),
        fetch('/api/contacts?limit=100'),
      ]);
      const tData = await tRes.json();
      const cData = await cRes.json();
      const approved = (tData.templates || []).filter((t) => t.status === 'APPROVED');
      setTemplates(approved);
      if (approved.length) setSelectedTemplate(approved[0].name);
      setContacts(cData.contacts || []);
      setLoading(false);
    })();
  }, []);

  const filtered = contacts.filter(
    (c) =>
      (c.name || '').toLowerCase().includes(contactSearch.toLowerCase()) ||
      (c.phone || '').includes(contactSearch),
  );

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      let contactId;
      if (tab === 'new') {
        if (!newPhone.trim()) { setError('Phone number is required'); setSubmitting(false); return; }
        const r = await fetch('/api/contacts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: newPhone.trim(), name: newName.trim() || undefined }),
        });
        const d = await r.json();
        if (!r.ok) { setError(d.error || 'Failed to create contact'); setSubmitting(false); return; }
        contactId = d._id;
      } else {
        if (!selectedContact) { setError('Please select a contact'); setSubmitting(false); return; }
        contactId = selectedContact._id;
      }
      const r = await fetch('/api/whatsapp/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactId, templateName: selectedTemplate }),
      });
      const d = await r.json();
      if (!r.ok) { setError(d.error || 'Failed to send template'); setSubmitting(false); return; }
      onSuccess(d.conversation);
    } catch {
      setError('An unexpected error occurred');
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Drag handle (mobile) */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-[#25D366] to-[#128C7E] rounded-xl flex items-center justify-center shadow-sm text-sm">
              💬
            </div>
            <div>
              <h2 className="font-bold text-slate-900">New Chat</h2>
              <p className="text-xs text-slate-400">Start a conversation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 text-lg leading-none transition-colors"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Info banner */}
            <div className="flex gap-3 items-start bg-blue-50 border border-blue-100 rounded-xl p-3">
              <span className="text-blue-400 shrink-0 mt-0.5">ℹ️</span>
              <p className="text-sm text-blue-700 leading-relaxed">
                WhatsApp requires an approved template to initiate a conversation. Once the customer replies, you can send free-form text for 24&nbsp;hours.
              </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
              {[{ id: 'existing', label: 'Existing Contact' }, { id: 'new', label: 'New Number' }].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                    tab === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {tab === 'existing' ? (
              <div className="space-y-2">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><SearchIcon /></span>
                  <input
                    type="text"
                    placeholder="Search contacts…"
                    value={contactSearch}
                    onChange={(e) => setContactSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#25D366]/20 focus:border-[#25D366] transition-all"
                  />
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="overflow-y-auto max-h-44">
                    {loading ? (
                      <div className="p-4 text-center text-sm text-slate-400">Loading contacts…</div>
                    ) : filtered.length === 0 ? (
                      <div className="p-4 text-center text-sm text-slate-400">No contacts found</div>
                    ) : filtered.map((c) => (
                      <button
                        key={c._id}
                        type="button"
                        onClick={() => setSelectedContact(c)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 border-b border-slate-100 last:border-b-0 transition-colors ${
                          selectedContact?._id === c._id ? 'bg-emerald-50' : 'hover:bg-slate-50'
                        }`}
                      >
                        <Avatar name={c.name} phone={c.phone} size="sm" />
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-sm font-semibold text-slate-800 truncate">{c.name || c.phone}</p>
                          {c.name && <p className="text-xs text-slate-400 truncate">{c.phone}</p>}
                        </div>
                        {selectedContact?._id === c._id && <span className="text-[#25D366] font-bold text-sm shrink-0">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
                {selectedContact && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-xl border border-emerald-200">
                    <span className="text-[#25D366] text-sm font-bold">✓</span>
                    <span className="text-sm text-emerald-700 font-semibold">{selectedContact.name || selectedContact.phone}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 919876543210"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366]/20 focus:border-[#25D366] transition-all"
                  />
                  <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                    <span>💡</span> Include country code — India: 91, US: 1. No +, spaces, or dashes.
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Name (optional)</label>
                  <input
                    type="text"
                    placeholder="Contact name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366]/20 focus:border-[#25D366] transition-all"
                  />
                </div>
              </div>
            )}

            {/* Template */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Message Template</label>
              {!loading && templates.length === 0 ? (
                <div className="flex gap-2.5 bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <span className="text-amber-400 shrink-0">⚠️</span>
                  <p className="text-sm text-amber-700">
                    No approved templates. Go to <strong>Meta Business Manager → WhatsApp → Message Templates</strong> to create one.
                  </p>
                </div>
              ) : (
                <div className="relative">
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#25D366]/20 focus:border-[#25D366] transition-all pr-8"
                  >
                    {templates.map((t) => <option key={t.name} value={t.name}>{t.name}</option>)}
                  </select>
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="flex gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
                <span className="text-red-400 shrink-0">⚠</span>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-1 pb-safe">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 active:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || templates.length === 0}
                className="flex-1 py-3 bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#22c55e] hover:to-[#0f766e] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2"><Spinner />Sending…</span>
                ) : 'Send Template'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   INBOX PAGE
══════════════════════════════════════════════════════════ */
export default function InboxPage() {
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [sendError, setSendError] = useState('');
  const [mobileView, setMobileView] = useState('list');

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = useCallback(async () => {
    const url = filter === 'all' ? '/api/conversations' : `/api/conversations?status=${filter}`;
    const res = await fetch(url);
    const data = await res.json();
    const convs = data.conversations || [];
    setConversations(convs);
    return convs;
  }, [filter]);

  const fetchMessages = useCallback(async (convId) => {
    const res = await fetch(`/api/conversations/${convId}/messages`);
    const data = await res.json();
    setMessages(data.messages || []);
  }, []);

  useEffect(() => {
    fetchConversations();
    const id = setInterval(() => {
      if (!document.hidden) fetchConversations();
    }, 3000);
    return () => clearInterval(id);
  }, [fetchConversations]);

  useEffect(() => {
    if (!selectedConv) return;
    fetchMessages(selectedConv._id);
    const id = setInterval(() => {
      if (!document.hidden) fetchMessages(selectedConv._id);
    }, 3000);
    return () => clearInterval(id);
  }, [selectedConv, fetchMessages]);

  function selectConv(conv) {
    setSelectedConv(conv);
    setSendError('');
    setMobileView('chat');
  }

  async function sendMessage(e) {
    e.preventDefault();
    if (!messageText.trim() || !selectedConv) return;
    setSending(true);
    const res = await fetch('/api/whatsapp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contactId: selectedConv.contactId._id, text: messageText }),
    });
    const data = await res.json();
    if (!res.ok) {
      setSendError(data.error || 'Failed to send message');
    } else {
      setSendError('');
      setMessageText('');
      await fetchMessages(selectedConv._id);
    }
    setSending(false);
  }

  async function takeOver() {
    if (!selectedConv) return;
    await fetch(`/api/contacts/${selectedConv.contactId._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAIHandled: false }),
    });
    fetchConversations();
  }

  const contact = selectedConv?.contactId;

  const visibleConvs = conversations.filter((conv) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (conv.contactId?.name || '').toLowerCase().includes(q) ||
      (conv.contactId?.phone || '').includes(q) ||
      (conv.lastMessage || '').toLowerCase().includes(q)
    );
  });

  /* ── Conversation list ──────────────────────────────────── */
  const ConvList = (
    <div className={`flex flex-col bg-white border-r border-slate-200 shrink-0 w-full md:w-80 lg:w-[340px] ${mobileView === 'chat' ? 'hidden md:flex' : 'flex'}`}>
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-100 space-y-3 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-900">Inbox</h1>
            <p className="text-xs text-slate-400">{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => setShowNewChat(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
          >
            <span className="text-sm leading-none font-semibold">+</span>
            New Chat
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><SearchIcon /></span>
          <input
            type="text"
            placeholder="Search conversations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#25D366]/20 focus:border-[#25D366] transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-1.5 overflow-x-auto">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                filter === f.value
                  ? 'bg-[#25D366] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {visibleConvs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-inner">
              💬
            </div>
            <p className="font-bold text-slate-600 mb-1">{search ? 'No results' : 'No conversations'}</p>
            <p className="text-sm text-slate-400 mb-5">{search ? 'Try a different search term' : 'Start a new chat to get going'}</p>
            {!search && (
              <button
                onClick={() => setShowNewChat(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
              >
                Start your first chat →
              </button>
            )}
          </div>
        ) : (
          <div>
            {visibleConvs.map((conv) => {
              const active = selectedConv?._id === conv._id;
              const c = conv.contactId;
              return (
                <button
                  key={conv._id}
                  onClick={() => selectConv(conv)}
                  className={`w-full text-left px-4 py-3.5 border-b border-slate-100 hover:bg-slate-50 active:bg-slate-100 transition-colors relative group ${active ? 'bg-emerald-50/70' : ''}`}
                >
                  {active && <div className="absolute left-0 inset-y-0 w-0.5 bg-[#25D366] rounded-r" />}
                  <div className="flex items-start gap-3">
                    {/* Avatar with AI badge */}
                    <div className="relative shrink-0">
                      <Avatar name={c?.name} phone={c?.phone} size="md" />
                      {conv.status === 'ai_active' && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[8px] font-black shadow-sm border border-white">
                          AI
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className={`font-semibold text-sm truncate ${active ? 'text-[#25D366]' : 'text-slate-800'}`}>
                          {c?.name || c?.phone}
                        </span>
                        <span className="text-[11px] text-slate-400 shrink-0 tabular-nums">{formatTime(conv.lastMessageAt)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-slate-400 truncate">{conv.lastMessage || 'No messages yet'}</p>
                        {conv.unreadCount > 0 && (
                          <span className="min-w-[18px] h-[18px] px-1 bg-[#25D366] text-white text-[10px] font-black rounded-full flex items-center justify-center shrink-0">
                            {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  /* ── Chat window ────────────────────────────────────────── */
  const ChatWindow = (
    <div className={`flex-1 flex flex-col min-w-0 ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}`}>
      {selectedConv ? (
        <>
          {/* Chat header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200 shadow-sm z-10">
            <button
              onClick={() => setMobileView('list')}
              className="md:hidden p-1.5 -ml-1.5 rounded-xl text-slate-500 hover:bg-slate-100 active:bg-slate-200 transition-colors"
            >
              <BackIcon />
            </button>

            <Avatar name={contact?.name} phone={contact?.phone} size="md" />

            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 text-sm truncate">{contact?.name || contact?.phone}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs text-slate-400 truncate">{contact?.phone}</p>
                <StatusPill status={selectedConv.status} />
              </div>
            </div>

            {selectedConv.status === 'ai_active' && (
              <button
                onClick={takeOver}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-600 border border-orange-200 rounded-xl text-xs font-bold hover:bg-orange-100 transition-colors shrink-0"
              >
                <span>👤</span> Take Over
              </button>
            )}
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1.5"
            style={{
              backgroundColor: '#efeae2',
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4c9b8' fill-opacity='0.35'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          >
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-24 text-slate-400 text-sm gap-1">
                <span className="text-2xl">👋</span>
                <p>No messages yet — say hello!</p>
              </div>
            )}

            {messages.map((msg, i) => {
              const isOut = msg.direction === 'outbound';
              const showAvatar = !isOut && (i === 0 || messages[i - 1]?.direction !== 'inbound');
              return (
                <div key={msg._id} className={`flex items-end gap-1.5 ${isOut ? 'justify-end' : 'justify-start'}`}>
                  {/* Inbound avatar */}
                  {!isOut && (
                    <div className="shrink-0 mb-0.5 self-end">
                      {showAvatar
                        ? <Avatar name={contact?.name} phone={contact?.phone} size="xs" />
                        : <div className="w-7" />
                      }
                    </div>
                  )}

                  <div className="max-w-[78%] sm:max-w-[65%] lg:max-w-md">
                    <div
                      className={`px-3.5 py-2.5 text-sm shadow-sm ${
                        isOut
                          ? 'bg-[#dcf8c6] text-slate-800 rounded-2xl rounded-br-sm'
                          : 'bg-white text-slate-800 rounded-2xl rounded-bl-sm border border-black/5'
                      }`}
                    >
                      <p className="leading-relaxed break-words whitespace-pre-wrap">{msg.content}</p>
                      <div className={`flex items-center gap-1 mt-1 ${isOut ? 'justify-end' : ''}`}>
                        <span className="text-[10px] text-slate-400">{formatTime(msg.timestamp)}</span>
                        {msg.sentBy === 'ai' && (
                          <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-1 rounded">AI</span>
                        )}
                        {isOut && <span className="text-[11px] text-slate-400">✓✓</span>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Composer */}
          <div className="bg-[#f0f2f5] border-t border-black/10">
            {sendError && (
              <div className="mx-3 mt-3 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                <span className="text-red-400 shrink-0 mt-0.5 text-sm">⚠</span>
                <p className="text-sm text-red-600">{sendError}</p>
              </div>
            )}
            <form onSubmit={sendMessage} className="flex items-center gap-2 p-3">
              <input
                type="text"
                value={messageText}
                onChange={(e) => { setMessageText(e.target.value); if (sendError) setSendError(''); }}
                placeholder="Type a message…"
                className="flex-1 px-4 py-2.5 bg-white border border-black/10 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#25D366]/30 focus:border-[#25D366] transition-all shadow-sm"
              />
              <button
                type="submit"
                disabled={sending || !messageText.trim()}
                className="w-11 h-11 flex items-center justify-center bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white rounded-full shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 shrink-0"
              >
                {sending ? <Spinner /> : <SendIcon />}
              </button>
            </form>
          </div>
        </>
      ) : (
        /* Empty state */
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 p-8">
          <div className="text-center max-w-xs">
            <div className="w-24 h-24 bg-gradient-to-br from-[#25D366]/15 to-[#128C7E]/15 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-6 shadow-inner">
              💬
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">Your conversations</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Select a conversation from the list, or start a new chat to reach out to a contact.
            </p>
            <button
              onClick={() => setShowNewChat(true)}
              className="px-6 py-3 bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all active:scale-95"
            >
              + Start New Chat
            </button>
          </div>
        </div>
      )}
    </div>
  );

  /* ── Contact info panel ─────────────────────────────────── */
  const ContactPanel = selectedConv && contact && (
    <div className="hidden lg:flex flex-col w-72 xl:w-80 border-l border-slate-200 bg-white shrink-0 overflow-y-auto">
      {/* Gradient top */}
      <div className="relative h-20 bg-gradient-to-br from-[#25D366] to-[#128C7E] shrink-0" />

      {/* Avatar overlapping gradient */}
      <div className="flex flex-col items-center -mt-8 px-5 pb-4 border-b border-slate-100">
        <div className="ring-4 ring-white rounded-full shadow-lg">
          <Avatar name={contact.name} phone={contact.phone} size="xl" />
        </div>
        <h4 className="font-bold text-slate-900 mt-3 text-base text-center">{contact.name || 'Unknown'}</h4>
        <p className="text-sm text-slate-400 mt-0.5">{contact.phone}</p>
        <div className="mt-2">
          <StatusPill status={selectedConv.status} />
        </div>
      </div>

      {/* Details */}
      <div className="p-4 space-y-3 flex-1">
        <div className="bg-slate-50 rounded-xl p-3.5">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Stage</p>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-sm font-semibold capitalize">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            {contact.stage || 'new'}
          </span>
        </div>

        <div className="bg-slate-50 rounded-xl p-3.5">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tags</p>
          <div className="flex flex-wrap gap-1.5">
            {(contact.tags || []).map((tag) => <TagBadge key={tag} tag={tag} />)}
            {(!contact.tags || contact.tags.length === 0) && (
              <span className="text-slate-400 text-xs italic">No tags</span>
            )}
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-3.5 space-y-2.5">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Conversation</p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Status</span>
            <StatusPill status={selectedConv.status} />
          </div>
          {selectedConv.lastMessageAt && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Last message</span>
              <span className="text-slate-700 font-semibold">{formatTime(selectedConv.lastMessageAt)}</span>
            </div>
          )}
          {selectedConv.unreadCount > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Unread</span>
              <span className="w-5 h-5 bg-[#25D366] text-white text-[10px] font-black rounded-full flex items-center justify-center">
                {selectedConv.unreadCount}
              </span>
            </div>
          )}
        </div>

        {selectedConv.status === 'ai_active' && (
          <button
            onClick={takeOver}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-orange-400 to-amber-500 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
          >
            <span>👤</span> Take Over from AI
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {showNewChat && (
        <NewChatModal
          onClose={() => setShowNewChat(false)}
          onSuccess={async (conv) => {
            setShowNewChat(false);
            const convs = await fetchConversations();
            selectConv(convs.find((c) => c._id === conv._id) || conv);
          }}
        />
      )}

      <div className="flex h-full -m-3 sm:-m-5 lg:-m-6 overflow-hidden">
        {ConvList}
        {ChatWindow}
        {ContactPanel}
      </div>
    </>
  );
}
