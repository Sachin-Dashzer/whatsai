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
      className="shrink-0 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300"
    >
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  );
}

function SectionCard({ title, desc, icon, children }) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-base shrink-0">{icon}</div>
        <div>
          <h3 className="font-semibold text-slate-900 text-sm">{title}</h3>
          {desc && <p className="text-xs text-slate-400 leading-tight">{desc}</p>}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const [businessName, setBusinessName] = useState('');
  const [waConnected, setWaConnected] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const loadSettings = useCallback(() => {
    fetch('/api/settings').then((r) => r.json()).then((d) => {
      if (d._id) {
        setBusinessName(d.businessName || '');
        setWaConnected(!!d.waConnected);
      }
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

  const inputCls = 'w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#25D366] focus:bg-white text-sm transition-colors';

  return (
    <div className="max-w-2xl space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Settings</h2>
        <p className="text-slate-500 text-sm mt-0.5">Manage your workspace configuration</p>
      </div>

      {/* WhatsApp status banner */}
      <div className={`rounded-2xl px-4 py-3.5 border flex items-center justify-between gap-4 ${waConnected ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${waConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
          <p className={`text-sm font-semibold ${waConnected ? 'text-emerald-800' : 'text-amber-800'}`}>
            {waConnected ? 'WhatsApp is connected and active' : 'WhatsApp is not connected yet'}
          </p>
        </div>
        <Link
          href="/integrations/whatsapp"
          className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
            waConnected ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
          }`}
        >
          {waConnected ? 'Manage' : 'Connect now →'}
        </Link>
      </div>

      <form onSubmit={save} className="space-y-4">
        {/* Business info */}
        <SectionCard title="Business Information" desc="Displayed in your workspace" icon="🏢">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Business Name</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Acme Corp"
              className={inputCls}
            />
          </div>
        </SectionCard>

        {/* Webhook info */}
        <SectionCard title="Webhook Configuration" desc="Set these in your Meta Developer App settings" icon="🔗">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Webhook URL</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[#25D366] text-sm font-mono truncate">
                  {webhookUrl || 'https://yourdomain.com/api/webhook/whatsapp'}
                </div>
                {webhookUrl && <CopyButton value={webhookUrl} />}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Verify Token</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-sm font-mono truncate">
                  {process.env.NEXT_PUBLIC_META_VERIFY_TOKEN || 'Set META_VERIFY_TOKEN in .env'}
                </div>
                {process.env.NEXT_PUBLIC_META_VERIFY_TOKEN && (
                  <CopyButton value={process.env.NEXT_PUBLIC_META_VERIFY_TOKEN} />
                )}
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl">
              <span className="text-base shrink-0 mt-0.5">ℹ️</span>
              <p className="text-xs text-blue-700 leading-relaxed">
                Add the Webhook URL and Verify Token in your{' '}
                <a href="https://developers.facebook.com" target="_blank" rel="noreferrer" className="font-semibold underline underline-offset-2">
                  Meta Developer Console
                </a>{' '}
                under WhatsApp → Configuration → Webhooks.
              </p>
            </div>
          </div>
        </SectionCard>

        {/* Save */}
        <button
          type="submit"
          disabled={saving}
          className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors shadow-sm ${
            saved
              ? 'bg-emerald-500 text-white'
              : 'bg-[#25D366] hover:bg-[#128C7E] disabled:opacity-60 text-white'
          }`}
        >
          {saving ? 'Saving…' : saved ? '✓ Settings Saved!' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
