'use client';

import { useState, useEffect, useCallback } from 'react';

const EVENT_COLORS = {
  'message.text': 'bg-green-50 text-green-700',
  'message.image': 'bg-blue-50 text-blue-700',
  'message.audio': 'bg-purple-50 text-purple-700',
  'message.document': 'bg-orange-50 text-orange-700',
  'status.delivered': 'bg-teal-50 text-teal-700',
  'status.read': 'bg-cyan-50 text-cyan-700',
  'status.sent': 'bg-slate-100 text-slate-600',
  'status.failed': 'bg-red-50 text-red-700',
};

function formatTs(date) {
  if (!date) return '';
  return new Date(date).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'medium' });
}

export default function WebhooksPage() {
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [clearing, setClearing] = useState(false);
  const [copied, setCopied] = useState('');
  const [origin, setOrigin] = useState('https://yourdomain.com');

  useEffect(() => {
    if (typeof window !== 'undefined') setOrigin(window.location.origin);
  }, []);

  const webhookUrl = `${origin}/api/webhook/whatsapp`;

  const fetchEvents = useCallback(async () => {
    const params = new URLSearchParams({ page });
    if (typeFilter) params.set('type', typeFilter);
    const res = await fetch(`/api/webhook-events?${params}`);
    const data = await res.json();
    setEvents(data.events || []);
    setTotal(data.total || 0);
    setPages(data.pages || 1);
  }, [page, typeFilter]);

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 5000);
    return () => clearInterval(interval);
  }, [fetchEvents]);

  async function clearEvents() {
    if (!confirm('Clear all webhook event logs? This cannot be undone.')) return;
    setClearing(true);
    await fetch('/api/webhook-events', { method: 'DELETE' });
    setEvents([]);
    setTotal(0);
    setClearing(false);
  }

  function copy(text, key) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  }

  const eventTypes = ['message.text', 'message.image', 'status.delivered', 'status.read', 'status.failed'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Webhook Management</h2>
        <p className="text-slate-500 text-sm">Configure Meta Webhook URL, monitor incoming events, and debug integrations</p>
      </div>

      {/* Webhook config card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-sm">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-2 bg-[#25D366] rounded-full animate-pulse" />
          Webhook Configuration
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-500 uppercase tracking-wider mb-2">Webhook URL</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[#25D366] text-sm font-mono truncate">
                {webhookUrl}
              </div>
              <button onClick={() => copy(webhookUrl, 'url')} className="shrink-0 px-3 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-slate-500 hover:text-slate-900 text-sm transition-colors shadow-sm">
                {copied === 'url' ? '✓' : '⧉'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-500 uppercase tracking-wider mb-2">Verify Token</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-amber-700 text-sm font-mono">
                {process.env.NEXT_PUBLIC_META_VERIFY_TOKEN || 'your_custom_webhook_verify_token'}
              </div>
              <button onClick={() => copy(process.env.NEXT_PUBLIC_META_VERIFY_TOKEN || 'your_custom_webhook_verify_token', 'token')} className="shrink-0 px-3 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-slate-500 hover:text-slate-900 text-sm transition-colors shadow-sm">
                {copied === 'token' ? '✓' : '⧉'}
              </button>
            </div>
          </div>
        </div>

        <details className="group">
          <summary className="flex items-center gap-2 text-sm text-slate-500 cursor-pointer hover:text-slate-900 list-none font-medium">
            <span className="group-open:rotate-90 transition-transform">▶</span>
            How to configure in Meta Developer Console
          </summary>
          <div className="mt-3 pl-4 border-l-2 border-slate-200 space-y-2 text-sm text-slate-500">
            <p>1. Go to <span className="text-[#25D366] font-medium">developers.facebook.com</span> → Your App → WhatsApp → Configuration</p>
            <p>2. Under <strong className="text-slate-700">Webhook</strong>, click <strong className="text-slate-700">Edit</strong></p>
            <p>3. Paste the <strong className="text-slate-700">Webhook URL</strong> above into the callback URL field</p>
            <p>4. Paste the <strong className="text-slate-700">Verify Token</strong> above into the verify token field</p>
            <p>5. Click <strong className="text-slate-700">Verify and Save</strong></p>
            <p>6. Subscribe to webhook fields: <code className="bg-slate-100 px-1 rounded text-slate-700">messages</code></p>
          </div>
        </details>

        <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-100 rounded-xl">
          <div className="w-2 h-2 bg-[#25D366] rounded-full" />
          <span className="text-sm text-slate-700">Webhook endpoint is live and ready to receive events</span>
          <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noopener noreferrer" className="ml-auto text-xs text-[#25D366] hover:underline shrink-0 font-medium">
            Test in Graph Explorer ↗
          </a>
        </div>
      </div>

      {/* Event types */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <h3 className="font-semibold text-slate-900 mb-4">Subscribed Event Types</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { type: 'messages', desc: 'New inbound messages', icon: '💬' },
            { type: 'message_status', desc: 'Delivery & read receipts', icon: '✓✓' },
            { type: 'account_alerts', desc: 'Phone number alerts', icon: '⚠️' },
            { type: 'business_capability', desc: 'Capability updates', icon: '🔧' },
          ].map((e) => (
            <div key={e.type} className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-lg">{e.icon}</span>
              <p className="text-slate-900 text-sm font-medium mt-1">{e.type}</p>
              <p className="text-slate-400 text-xs mt-0.5">{e.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Event log */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
          <h3 className="font-semibold text-slate-900">Event Log</h3>
          <span className="text-slate-400 text-sm">{total.toLocaleString()} total events</span>

          <div className="flex gap-1 ml-auto flex-wrap">
            <button onClick={() => { setTypeFilter(''); setPage(1); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${!typeFilter ? 'bg-[#25D366] text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'}`}>
              All
            </button>
            {eventTypes.map((t) => (
              <button key={t} onClick={() => { setTypeFilter(t.split('.')[0]); setPage(1); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${typeFilter === t.split('.')[0] ? 'bg-[#25D366] text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'}`}>
                {t}
              </button>
            ))}
            <button onClick={clearEvents} disabled={clearing || events.length === 0} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-40 transition-colors ml-2">
              Clear logs
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {['Time', 'Event Type', 'Phone', 'Message ID', 'Status', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-slate-500 font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {events.map((event) => (
                <tr key={event._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{formatTs(event.receivedAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${EVENT_COLORS[event.eventType] || 'bg-slate-100 text-slate-600'}`}>
                      {event.eventType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700 font-mono text-xs">{event.phone || '—'}</td>
                  <td className="px-4 py-3 text-slate-400 font-mono text-xs truncate max-w-32">{event.messageId || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${event.status === 'processed' ? 'text-green-600' : event.status === 'failed' ? 'text-red-500' : 'text-slate-400'}`}>
                      {event.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setSelected(event)} className="text-xs text-slate-400 hover:text-[#25D366] transition-colors font-medium">
                      View payload
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {events.length === 0 && (
          <div className="py-16 text-center">
            <div className="text-3xl mb-3">📭</div>
            <p className="text-slate-600 font-medium">No webhook events yet</p>
            <p className="text-slate-400 text-sm mt-1">Events will appear here when your WhatsApp number receives messages</p>
          </div>
        )}

        {pages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium disabled:opacity-40">
              ← Previous
            </button>
            <span className="text-slate-500 text-sm">Page {page} of {pages}</span>
            <button onClick={() => setPage(Math.min(pages, page + 1))} disabled={page === pages} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium disabled:opacity-40">
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Payload inspector */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-xl bg-white border-l border-slate-200 h-full overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">Event Payload</h3>
                <p className="text-slate-400 text-xs mt-0.5">{selected.eventType} · {formatTs(selected.receivedAt)}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => copy(JSON.stringify(selected.payload, null, 2), 'payload')} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs transition-colors font-medium">
                  {copied === 'payload' ? '✓ Copied' : 'Copy JSON'}
                </button>
                <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-700 p-1">✕</button>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[['Phone', selected.phone], ['Message ID', selected.messageId], ['Status', selected.status], ['Type', selected.eventType]].map(([k, v]) => (
                  <div key={k} className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <p className="text-slate-400 text-xs mb-1">{k}</p>
                    <p className="text-slate-900 text-sm font-mono truncate">{v || '—'}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Raw Payload</p>
                <pre className="bg-slate-900 rounded-xl p-4 text-xs text-slate-300 overflow-x-auto font-mono leading-relaxed whitespace-pre-wrap">
                  {JSON.stringify(selected.payload, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
