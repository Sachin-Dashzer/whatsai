'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

function CopyButton({ value }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button
      onClick={copy}
      className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
        copied
          ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
          : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
      }`}
    >
      {copied ? (
        <>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" d="M5 13l4 4L19 7" /></svg>
          Copied
        </>
      ) : (
        <>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" /><path strokeLinecap="round" d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
          Copy
        </>
      )}
    </button>
  );
}

function MonoField({ value, label, copyable = true }) {
  return (
    <div className="space-y-1.5">
      {label && <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>}
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-700 truncate">
          {value || <span className="text-slate-400 italic">Not set</span>}
        </div>
        {copyable && value && <CopyButton value={value} />}
      </div>
    </div>
  );
}

function SectionCard({ title, desc, icon, children, action }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-lg shrink-0">{icon}</div>
          <div>
            <h3 className="font-semibold text-slate-900">{title}</h3>
            {desc && <p className="text-xs text-slate-400 mt-0.5">{desc}</p>}
          </div>
        </div>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

const QUICK_LINKS = [
  { label: 'AI Agent Config', desc: 'Manage your AI assistant', href: '/ai-agent', icon: '🤖', color: 'bg-violet-50 border-violet-100' },
  { label: 'WhatsApp Setup', desc: 'Connect your WhatsApp number', href: '/integrations/whatsapp', icon: '📱', color: 'bg-green-50 border-green-100' },
  { label: 'Team Members', desc: 'Manage your team access', href: '/team', icon: '👥', color: 'bg-blue-50 border-blue-100' },
  { label: 'Billing & Plan', desc: 'Subscription and invoices', href: '/billing', icon: '💳', color: 'bg-amber-50 border-amber-100' },
];

export default function SettingsPage() {
  const [businessName, setBusinessName] = useState('');
  const [waConnected, setWaConnected] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadSettings = useCallback(() => {
    fetch('/api/settings').then((r) => r.json()).then((d) => {
      if (d._id) {
        setBusinessName(d.businessName || '');
        setWaConnected(!!d.waConnected);
      }
      setLoading(false);
    });
    if (typeof window !== 'undefined') {
      setWebhookUrl(`${window.location.origin}/api/webhook/whatsapp`);
    }
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessName }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const verifyToken = process.env.NEXT_PUBLIC_META_VERIFY_TOKEN;

  return (
    <div className="min-h-full">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-7">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your workspace, integrations, and developer configuration.</p>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 items-start">

        {/* ── Main content ── */}
        <div className="space-y-5 min-w-0">

          {/* WhatsApp Status Card */}
          <div
            className={`rounded-2xl border p-5 transition-all ${
              waConnected
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-amber-50 border-amber-200'
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${waConnected ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                  📱
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={`font-semibold text-sm ${waConnected ? 'text-emerald-900' : 'text-amber-900'}`}>
                      WhatsApp Business
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        waConnected
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${waConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                      {waConnected ? 'Connected' : 'Not Connected'}
                    </span>
                  </div>
                  <p className={`text-xs mt-0.5 ${waConnected ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {waConnected
                      ? 'Your WhatsApp number is connected and receiving messages'
                      : 'Connect your WhatsApp Business number to start receiving messages'}
                  </p>
                </div>
              </div>
              <Link
                href="/integrations/whatsapp"
                className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                  waConnected
                    ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700'
                    : 'bg-amber-400 hover:bg-amber-500 text-white'
                }`}
              >
                {waConnected ? 'Manage →' : 'Connect now →'}
              </Link>
            </div>
          </div>

          {/* Business Information */}
          <form onSubmit={save}>
            <SectionCard
              title="Business Information"
              desc="Displayed across your workspace"
              icon="🏢"
              action={
                <button
                  type="submit"
                  disabled={saving}
                  className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                    saved
                      ? 'bg-emerald-500 text-white'
                      : 'bg-[#25D366] hover:bg-[#128C7E] disabled:opacity-60 text-white'
                  }`}
                >
                  {saving && (
                    <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save'}
                </button>
              }
            >
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Business Name</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Acme Corp"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#25D366]/30 focus:border-[#25D366] focus:bg-white text-sm transition-all"
                  />
                  <p className="text-xs text-slate-400">Used in your workspace header and reports</p>
                </div>
              </div>
            </SectionCard>
          </form>

          {/* Webhook Configuration */}
          <SectionCard
            title="Webhook Configuration"
            desc="Set these values in your Meta Developer App → WhatsApp → Configuration"
            icon="🔗"
          >
            <div className="space-y-5">
              <MonoField
                label="Webhook URL"
                value={webhookUrl || 'https://yourdomain.com/api/webhook/whatsapp'}
              />
              <MonoField
                label="Verify Token"
                value={verifyToken || 'Set NEXT_PUBLIC_META_VERIFY_TOKEN in .env'}
                copyable={!!verifyToken}
              />

              {/* Step guide */}
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                  <p className="text-xs font-semibold text-slate-600">Setup Steps</p>
                </div>
                <div className="divide-y divide-slate-100">
                  {[
                    { step: '1', text: 'Go to Meta Developer Console → Your App → WhatsApp → Configuration' },
                    { step: '2', text: 'Click "Edit" next to Webhook and paste the Webhook URL above' },
                    { step: '3', text: 'Paste the Verify Token and click "Verify and Save"' },
                    { step: '4', text: 'Under Webhook Fields, subscribe to: messages, message_deliveries, message_reads' },
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-3 px-4 py-3">
                      <span className="w-5 h-5 rounded-full bg-[#25D366]/15 text-[#128C7E] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {item.step}
                      </span>
                      <p className="text-xs text-slate-600 leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
                <span className="text-base shrink-0 mt-0.5">ℹ️</span>
                <p className="text-xs text-blue-700 leading-relaxed">
                  Need help?{' '}
                  <a
                    href="https://developers.facebook.com"
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold underline underline-offset-2"
                  >
                    Open Meta Developer Console →
                  </a>
                </p>
              </div>
            </div>
          </SectionCard>

          {/* Danger zone */}
          <div className="rounded-2xl border border-red-200 bg-red-50/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-red-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-red-700">Danger Zone</h3>
                <p className="text-xs text-red-400">Irreversible actions — proceed with extreme caution</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {[
                {
                  title: 'Reset AI Configuration',
                  desc: 'Clears your AI agent settings and reverts to defaults. Does not affect contacts or conversations.',
                  btn: 'Reset AI Config',
                },
                {
                  title: 'Delete All Contacts',
                  desc: 'Permanently deletes all contacts and their conversation history. This cannot be undone.',
                  btn: 'Delete Contacts',
                },
                {
                  title: 'Delete Workspace',
                  desc: 'Permanently deletes this workspace, all users, contacts, messages, and data.',
                  btn: 'Delete Workspace',
                },
              ].map((item) => (
                <div key={item.title} className="flex items-center justify-between gap-4 py-3 border-b border-red-100 last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 max-w-md leading-relaxed">{item.desc}</p>
                  </div>
                  <button className="shrink-0 px-4 py-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap">
                    {item.btn}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-5">
          {/* Quick nav */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Quick Access</p>
            </div>
            <div className="p-3 space-y-2">
              {QUICK_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all hover:shadow-sm ${l.color} group`}
                >
                  <span className="text-xl">{l.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{l.label}</p>
                    <p className="text-xs text-slate-500 truncate">{l.desc}</p>
                  </div>
                  <svg className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>

          {/* System info */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">System Info</p>
            </div>
            <div className="p-5 space-y-3">
              {[
                { label: 'Platform', value: 'WaBot.ai' },
                { label: 'API Version', value: process.env.NEXT_PUBLIC_META_API_VERSION || 'v19.0' },
                { label: 'WhatsApp API', value: 'Meta Graph API' },
                { label: 'AI Model', value: 'GPT-4o' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 text-xs">{item.label}</span>
                  <span className="font-semibold text-slate-800 text-xs">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Support card */}
          <div className="bg-linear-to-br from-[#25D366]/10 to-[#128C7E]/10 rounded-2xl border border-[#25D366]/20 p-5">
            <div className="text-2xl mb-2">💬</div>
            <h4 className="font-bold text-slate-900 text-sm mb-1">Need help?</h4>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Our support team is available Mon–Sat, 10am–7pm IST. We typically respond within a few hours.
            </p>
            <a
              href="mailto:support@wabot.ai"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#128C7E] hover:underline"
            >
              Contact Support →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
