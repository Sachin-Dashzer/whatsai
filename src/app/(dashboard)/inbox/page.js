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

export default function InboxPage() {
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [filter, setFilter] = useState('all');
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);

  const fetchConversations = useCallback(async () => {
    const url = filter === 'all' ? '/api/conversations' : `/api/conversations?status=${filter}`;
    const res = await fetch(url);
    const data = await res.json();
    setConversations(data.conversations || []);
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
    await fetch('/api/whatsapp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contactId: selectedConv.contactId._id, text: messageText }),
    });
    setMessageText('');
    await fetchMessages(selectedConv._id);
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
    <div className="flex h-full gap-0 -m-6 overflow-hidden">
      {/* Conversation list */}
      <div className="w-80 border-r border-slate-200 flex flex-col bg-white shrink-0">
        <div className="p-3 border-b border-slate-100">
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
            <div className="p-8 text-center text-slate-400 text-sm">No conversations</div>
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

            <form onSubmit={sendMessage} className="p-4 border-t border-slate-200 bg-white flex gap-3 shadow-sm">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
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
  );
}
