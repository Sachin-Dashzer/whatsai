'use client';

import { useState, useEffect, useCallback } from 'react';
import TagBadge from '@/components/dashboard/TagBadge';

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'ai_active', label: '🤖 AI Active' },
  { value: 'human_takeover', label: '👤 Human' },
  { value: 'resolved', label: '✅ Resolved' },
];

function formatTime(date) {
  if (!date) return '';
  const d = new Date(date);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString();
}

function NewChatModal({ onClose, onSuccess }) {
  const [tab, setTab] = useState('existing');
  const [templates, setTemplates] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [contactSearch, setContactSearch] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newName, setNewName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      const [tRes, cRes] = await Promise.all([
        fetch('/api/whatsapp/templates'),
        fetch('/api/contacts?limit=100'),
      ]);
      const tData = await tRes.json();
      const cData = await cRes.json();
      const approved = (tData.templates || []).filter((t) => t.status === 'APPROVED');
      setTemplates(approved);
      if (approved.length > 0) setSelectedTemplate(approved[0].name);
      setContacts(cData.contacts || []);
    }
    load();
  }, []);

  const filteredContacts = contacts.filter(
    (c) =>
      (c.name || '').toLowerCase().includes(contactSearch.toLowerCase()) ||
      (c.phone || '').includes(contactSearch)
  );

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      let contactId;

      if (tab === 'new') {
        if (!newPhone.trim()) {
          setError('Phone number is required');
          setSubmitting(false);
          return;
        }
        const res = await fetch('/api/contacts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: newPhone.trim(), name: newName.trim() || undefined }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Failed to create contact');
          setSubmitting(false);
          return;
        }
        contactId = data._id;
      } else {
        if (!selectedContact) {
          setError('Please select a contact');
          setSubmitting(false);
          return;
        }
        contactId = selectedContact._id;
      }

      const res = await fetch('/api/whatsapp/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactId, templateName: selectedTemplate }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to send template');
        setSubmitting(false);
        return;
      }

      onSuccess(data.conversation);
    } catch {
      setError('An unexpected error occurred');
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900 text-lg">New Chat</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm text-blue-700">
            WhatsApp only allows businesses to start conversations using pre-approved template messages. Once the customer replies, you can send free-form text for 24 hours.
          </div>

          <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setTab('existing')}
              className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === 'existing' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Existing Contact
            </button>
            <button
              type="button"
              onClick={() => setTab('new')}
              className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === 'new' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              New Number
            </button>
          </div>

          {tab === 'existing' ? (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Search by name or phone..."
                value={contactSearch}
                onChange={(e) => setContactSearch(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#25D366]"
              />
              <div className="border border-slate-200 rounded-lg overflow-y-auto max-h-40">
                {filteredContacts.length === 0 ? (
                  <p className="p-3 text-sm text-slate-400 text-center">No contacts found</p>
                ) : (
                  filteredContacts.map((c) => (
                    <button
                      key={c._id}
                      type="button"
                      onClick={() => setSelectedContact(c)}
                      className={`w-full text-left px-3 py-2 text-sm border-b border-slate-100 last:border-b-0 transition-colors ${
                        selectedContact?._id === c._id
                          ? 'bg-green-50 text-[#25D366]'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="font-medium">{c.name || c.phone}</span>
                      {c.name && <span className="text-slate-400 ml-1.5">{c.phone}</span>}
                    </button>
                  ))
                )}
              </div>
              {selectedContact && (
                <p className="text-sm text-[#25D366] font-medium">
                  ✓ Selected: {selectedContact.name || selectedContact.phone}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <input
                  type="text"
                  placeholder="Phone number (e.g. 919876543210)"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#25D366]"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Include country code. India: 91, US: 1. No +, spaces, or dashes.
                </p>
              </div>
              <input
                type="text"
                placeholder="Name (optional)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#25D366]"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Template</label>
            {templates.length === 0 ? (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-sm text-amber-700">
                No approved templates found. To initiate a WhatsApp conversation you need at least one approved template in Meta Business Manager → WhatsApp → Message Templates.
              </div>
            ) : (
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#25D366] bg-white"
              >
                {templates.map((t) => (
                  <option key={t.name} value={t.name}>{t.name}</option>
                ))}
              </select>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-600">{error}</div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || templates.length === 0}
              className="flex-1 py-2.5 bg-[#25D366] hover:bg-[#128C7E] disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors"
            >
              {submitting ? 'Sending...' : 'Send Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function InboxPage() {
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [filter, setFilter] = useState('all');
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [sendError, setSendError] = useState('');

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
    const interval = setInterval(fetchConversations, 3000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  useEffect(() => {
    if (!selectedConv) return;
    fetchMessages(selectedConv._id);
    const interval = setInterval(() => fetchMessages(selectedConv._id), 3000);
    return () => clearInterval(interval);
  }, [selectedConv, fetchMessages]);

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

  return (
    <>
      {showNewChat && (
        <NewChatModal
          onClose={() => setShowNewChat(false)}
          onSuccess={async (conv) => {
            setShowNewChat(false);
            const convs = await fetchConversations();
            const found = convs.find((c) => c._id === conv._id);
            setSelectedConv(found || conv);
          }}
        />
      )}

      <div className="flex h-full gap-0 -m-6 overflow-hidden">
        {/* Conversation list */}
        <div className="w-80 border-r border-slate-200 flex flex-col bg-white shrink-0">
          <div className="p-3 border-b border-slate-100 space-y-2">
            <button
              onClick={() => setShowNewChat(true)}
              className="w-full py-2 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-lg text-sm font-medium transition-colors"
            >
              + New Chat
            </button>
            <div className="flex gap-1 overflow-x-auto">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    filter === f.value
                      ? 'bg-[#25D366] text-white'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => (
              <button
                key={conv._id}
                onClick={() => setSelectedConv(conv)}
                className={`w-full text-left p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                  selectedConv?._id === conv._id ? 'bg-green-50 border-l-2 border-l-[#25D366]' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-slate-900 text-sm truncate">
                        {conv.contactId?.name || conv.contactId?.phone}
                      </span>
                      <span className="text-xs shrink-0">
                        {conv.status === 'ai_active' ? '🤖' : conv.status === 'human_takeover' ? '👤' : '✅'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{conv.lastMessage}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-slate-400">{formatTime(conv.lastMessageAt)}</p>
                    {conv.unreadCount > 0 && (
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-[#25D366] text-white text-xs rounded-full mt-1">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
            {conversations.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-sm">
                <p>No conversations</p>
                <button
                  onClick={() => setShowNewChat(true)}
                  className="mt-2 text-[#25D366] hover:underline text-sm"
                >
                  Start your first chat →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Chat window */}
        <div className="flex-1 flex flex-col bg-slate-50">
          {selectedConv ? (
            <>
              <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between shadow-sm">
                <div>
                  <h3 className="font-semibold text-slate-900">{contact?.name || contact?.phone}</h3>
                  <p className="text-xs text-slate-400">{contact?.phone}</p>
                </div>
                {selectedConv.status === 'ai_active' && (
                  <button
                    onClick={takeOver}
                    className="px-4 py-2 bg-orange-50 text-orange-600 border border-orange-200 rounded-lg text-sm hover:bg-orange-100 transition-colors"
                  >
                    Take Over from AI
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
                        msg.direction === 'outbound'
                          ? 'bg-[#25D366] text-white rounded-br-sm shadow-sm'
                          : 'bg-white text-slate-800 rounded-bl-sm border border-slate-200 shadow-sm'
                      }`}
                    >
                      <p>{msg.content}</p>
                      <div className={`flex items-center gap-1 mt-1 ${msg.direction === 'outbound' ? 'justify-end' : ''}`}>
                        <span className="text-xs opacity-60">{formatTime(msg.timestamp)}</span>
                        {msg.sentBy === 'ai' && <span className="text-xs opacity-60">· AI</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-200 bg-white">
                {sendError && (
                  <div className="px-4 pt-3">
                    <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 text-sm text-red-600">
                      {sendError}
                    </div>
                  </div>
                )}
                <form onSubmit={sendMessage} className="p-4 flex gap-3">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => { setMessageText(e.target.value); if (sendError) setSendError(''); }}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#25D366] focus:bg-white text-sm transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={sending || !messageText.trim()}
                    className="px-5 py-2.5 bg-[#25D366] hover:bg-[#128C7E] disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
                  >
                    Send
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <div className="text-4xl mb-3">💬</div>
                <p>Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </div>

        {/* Contact info panel */}
        {selectedConv && contact && (
          <div className="w-72 border-l border-slate-200 bg-white p-4 overflow-y-auto shrink-0">
            <div className="text-center mb-4">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-[#25D366] text-2xl mx-auto mb-2">
                {(contact.name || contact.phone)[0]?.toUpperCase()}
              </div>
              <h4 className="font-semibold text-slate-900">{contact.name || 'Unknown'}</h4>
              <p className="text-slate-500 text-sm">{contact.phone}</p>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Stage</p>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-sm capitalize">
                  {contact.stage || 'new'}
                </span>
              </div>

              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {(contact.tags || []).map((tag) => (
                    <TagBadge key={tag} tag={tag} />
                  ))}
                  {(!contact.tags || contact.tags.length === 0) && (
                    <span className="text-slate-400 text-xs">No tags</span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Status</p>
                <span className={`text-sm font-medium ${selectedConv.status === 'ai_active' ? 'text-[#25D366]' : 'text-orange-600'}`}>
                  {selectedConv.status === 'ai_active' ? '🤖 AI Handling' : '👤 Human Agent'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
