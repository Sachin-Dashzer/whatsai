'use client';

import { useState } from 'react';
import Link from 'next/link';

const ENDPOINTS = [
  {
    group: 'Authentication',
    items: [
      {
        method: 'POST',
        path: '/api/auth/login',
        desc: 'Authenticate a user and create a session.',
        auth: false,
        body: `{
  "email": "you@example.com",
  "password": "yourpassword"
}`,
        response: `{
  "ok": true
}`,
      },
      {
        method: 'POST',
        path: '/api/auth/logout',
        desc: 'Destroy the current session and log out.',
        auth: true,
        body: null,
        response: `{
  "ok": true
}`,
      },
    ],
  },
  {
    group: 'Contacts',
    items: [
      {
        method: 'GET',
        path: '/api/contacts',
        desc: 'List all contacts for your workspace. Supports `?search=` and `?tag=` query parameters.',
        auth: true,
        body: null,
        response: `{
  "contacts": [
    {
      "_id": "...",
      "phone": "+919876543210",
      "name": "Riya Sharma",
      "tags": ["lead", "interested"],
      "stage": "qualified",
      "aiEnabled": true,
      "lastMessageAt": "2026-04-26T10:00:00.000Z"
    }
  ]
}`,
      },
      {
        method: 'POST',
        path: '/api/contacts',
        desc: 'Create a new contact.',
        auth: true,
        body: `{
  "phone": "+919876543210",
  "name": "Riya Sharma",
  "tags": ["lead"]
}`,
        response: `{
  "contact": { "_id": "...", "phone": "+919876543210", ... }
}`,
      },
      {
        method: 'DELETE',
        path: '/api/contacts',
        desc: 'Delete a contact by ID.',
        auth: true,
        body: `{
  "contactId": "..."
}`,
        response: `{
  "success": true
}`,
      },
    ],
  },
  {
    group: 'Conversations & Messages',
    items: [
      {
        method: 'GET',
        path: '/api/conversations',
        desc: 'List recent conversations ordered by last message time.',
        auth: true,
        body: null,
        response: `{
  "conversations": [
    {
      "contactId": "...",
      "phone": "+919876543210",
      "name": "Riya Sharma",
      "lastMessage": "Hello!",
      "unread": 2,
      "updatedAt": "2026-04-26T10:00:00.000Z"
    }
  ]
}`,
      },
      {
        method: 'GET',
        path: '/api/messages?contactId=...',
        desc: 'Fetch message history for a specific contact.',
        auth: true,
        body: null,
        response: `{
  "messages": [
    {
      "_id": "...",
      "direction": "inbound",
      "content": "Hello",
      "type": "text",
      "createdAt": "2026-04-26T10:00:00.000Z"
    }
  ],
  "contact": { ... }
}`,
      },
      {
        method: 'POST',
        path: '/api/messages',
        desc: 'Send a text message to a contact.',
        auth: true,
        body: `{
  "contactId": "...",
  "message": "Hello from the API!"
}`,
        response: `{
  "success": true,
  "messageId": "wamid...."
}`,
      },
    ],
  },
  {
    group: 'Broadcasts',
    items: [
      {
        method: 'GET',
        path: '/api/broadcasts',
        desc: 'List all broadcast campaigns.',
        auth: true,
        body: null,
        response: `{
  "broadcasts": [
    {
      "_id": "...",
      "name": "April Promo",
      "status": "sent",
      "sentCount": 120,
      "failedCount": 3,
      "createdAt": "2026-04-26T09:00:00.000Z"
    }
  ]
}`,
      },
      {
        method: 'POST',
        path: '/api/broadcasts',
        desc: 'Create and immediately send a broadcast to a filtered contact list.',
        auth: true,
        body: `{
  "name": "April Promo",
  "message": "Hi {{name}}, check our new offer!",
  "filter": { "tag": "lead" }
}`,
        response: `{
  "broadcast": { "_id": "...", "sentCount": 85, ... }
}`,
      },
    ],
  },
  {
    group: 'Webhook Events',
    items: [
      {
        method: 'GET',
        path: '/api/webhook-events',
        desc: 'List incoming WhatsApp webhook events. Supports `?type=` filter and `?page=` pagination.',
        auth: true,
        body: null,
        response: `{
  "events": [
    {
      "_id": "...",
      "eventType": "message.text",
      "phone": "+919876543210",
      "status": "processed",
      "receivedAt": "2026-04-26T10:00:00.000Z",
      "payload": { ... }
    }
  ],
  "total": 42,
  "page": 1,
  "pages": 5
}`,
      },
      {
        method: 'DELETE',
        path: '/api/webhook-events',
        desc: 'Clear all webhook event logs for your workspace.',
        auth: true,
        body: null,
        response: `{
  "success": true
}`,
      },
    ],
  },
  {
    group: 'Settings & Tenant',
    items: [
      {
        method: 'GET',
        path: '/api/settings',
        desc: 'Get your workspace settings including WhatsApp config and plan.',
        auth: true,
        body: null,
        response: `{
  "_id": "...",
  "businessName": "Acme Corp",
  "plan": "pro",
  "waConnected": true,
  "wabaId": "...",
  "phoneNumberId": "...",
  "verifiedName": "Acme Corp"
}`,
      },
      {
        method: 'PUT',
        path: '/api/settings',
        desc: 'Update workspace settings (WhatsApp credentials, AI agent config, business name).',
        auth: true,
        body: `{
  "businessName": "Acme Corp",
  "wabaId": "...",
  "phoneNumberId": "...",
  "accessToken": "EAAxxxxx",
  "verifiedName": "Acme Corp",
  "aiEnabled": true,
  "aiPersona": "You are a helpful sales assistant..."
}`,
        response: `{
  "tenant": { ... }
}`,
      },
    ],
  },
  {
    group: 'WhatsApp Webhook (Meta)',
    items: [
      {
        method: 'GET',
        path: '/api/webhook/whatsapp',
        desc: 'Meta webhook verification endpoint. Set this URL in the Meta Developer Console. Responds to the hub.challenge handshake.',
        auth: false,
        body: null,
        response: `hub.challenge value (plain text)`,
      },
      {
        method: 'POST',
        path: '/api/webhook/whatsapp',
        desc: 'Receives incoming WhatsApp messages and status updates from Meta. Processes AI replies, logs events, and updates conversations.',
        auth: false,
        body: `Meta webhook payload (sent automatically by Meta)`,
        response: `200 OK`,
      },
    ],
  },
];

const METHOD_COLORS = {
  GET: 'bg-blue-50 text-blue-700 border border-blue-200',
  POST: 'bg-green-50 text-green-700 border border-green-200',
  PUT: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  DELETE: 'bg-red-50 text-red-700 border border-red-200',
  PATCH: 'bg-purple-50 text-purple-700 border border-purple-200',
};

function EndpointCard({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-4 px-5 py-4 text-left hover:bg-slate-50 transition-colors"
      >
        <span className={`shrink-0 px-2.5 py-0.5 rounded text-xs font-bold font-mono mt-0.5 ${METHOD_COLORS[item.method]}`}>
          {item.method}
        </span>
        <div className="flex-1 min-w-0">
          <code className="text-slate-900 text-sm font-mono">{item.path}</code>
          <p className="text-slate-500 text-xs mt-0.5">{item.desc}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0 mt-0.5">
          {item.auth && (
            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-medium">🔒 Auth</span>
          )}
          <span className="text-slate-400 text-sm">{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {open && (
        <div className="border-t border-slate-200 px-5 py-4 space-y-4 bg-slate-50">
          {item.auth && (
            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5">
              Requires an active session cookie. Log in via <code className="text-amber-800 font-mono">/api/auth/login</code> first.
            </div>
          )}
          {item.body && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Request Body</p>
              <pre className="bg-slate-900 border border-slate-700 rounded-lg p-4 text-xs text-slate-300 overflow-x-auto font-mono leading-relaxed">
                {item.body}
              </pre>
            </div>
          )}
          {item.response && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Response</p>
              <pre className="bg-slate-900 border border-slate-700 rounded-lg p-4 text-xs text-[#25D366] overflow-x-auto font-mono leading-relaxed">
                {item.response}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DeveloperPage() {
  const [activeGroup, setActiveGroup] = useState(null);

  const filtered = activeGroup
    ? ENDPOINTS.filter((g) => g.group === activeGroup)
    : ENDPOINTS;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Nav */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-sm sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#25D366] rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">W</div>
            <span className="font-bold text-slate-900 text-lg">WaBot.ai</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/features" className="text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors">Features</Link>
            <Link href="/pricing" className="text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors">Pricing</Link>
            <Link href="/login" className="px-4 py-2 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl text-sm font-medium transition-colors shadow-sm">
              Sign in
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full text-[#25D366] text-xs font-medium mb-4">
            <span>⚡</span> REST API Reference
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Developer API</h1>
          <p className="text-slate-500 text-lg max-w-2xl">
            Build custom integrations with WaBot.ai. All endpoints are REST-based and return JSON.
            Session-based auth is used — no API keys required.
          </p>
        </div>

        {/* Quick start */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-10 shadow-sm">
          <h2 className="font-bold text-slate-900 text-lg mb-4">Quick Start</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[
              { step: '1', title: 'Authenticate', desc: 'POST to /api/auth/login with your credentials to get a session cookie.' },
              { step: '2', title: 'Make requests', desc: 'Include credentials in every request. The session cookie is sent automatically by the browser.' },
              { step: '3', title: 'Handle responses', desc: 'All endpoints return JSON. Errors include an "error" string field with a description.' },
            ].map((s) => (
              <div key={s.step} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-green-100 text-[#25D366] flex items-center justify-center text-sm font-bold shrink-0">
                  {s.step}
                </div>
                <div>
                  <p className="text-slate-900 text-sm font-semibold">{s.title}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Base URL</p>
            <code className="text-[#25D366] font-mono text-sm bg-slate-900 px-4 py-2.5 rounded-lg block">
              https://yourapp.vercel.app
            </code>
          </div>
        </div>

        {/* Error format */}
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 mb-10 flex items-start gap-4">
          <span className="text-red-500 text-lg shrink-0">⚠</span>
          <div>
            <p className="text-red-700 text-sm font-semibold mb-1">Error Responses</p>
            <p className="text-slate-500 text-xs">All errors return the appropriate HTTP status code and a JSON body:
              <code className="ml-2 text-red-600 font-mono">{"{ \"error\": \"Description of the error\" }"}</code>
            </p>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar filter */}
          <aside className="w-48 shrink-0 hidden lg:block">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Sections</p>
            <nav className="space-y-1">
              <button
                onClick={() => setActiveGroup(null)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  !activeGroup ? 'bg-green-50 text-[#25D366] font-medium' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                All endpoints
              </button>
              {ENDPOINTS.map((g) => (
                <button
                  key={g.group}
                  onClick={() => setActiveGroup(g.group === activeGroup ? null : g.group)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeGroup === g.group ? 'bg-green-50 text-[#25D366] font-medium' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {g.group}
                </button>
              ))}
            </nav>
          </aside>

          {/* Endpoint list */}
          <div className="flex-1 min-w-0 space-y-8">
            {filtered.map((group) => (
              <section key={group.group}>
                <h2 className="text-lg font-bold text-slate-900 mb-3">{group.group}</h2>
                <div className="space-y-3">
                  {group.items.map((item) => (
                    <EndpointCard key={item.path + item.method} item={item} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-16 text-center border-t border-slate-200 pt-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Need help?</h2>
          <p className="text-slate-500 mb-6">
            Check the webhook setup guide in your dashboard or reach out to our team.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/register"
              className="px-6 py-3 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
            >
              Get started free
            </Link>
            <a
              href="mailto:support@wabot.ai"
              className="px-6 py-3 border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 rounded-xl text-sm font-medium transition-colors bg-white shadow-sm"
            >
              Contact support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
