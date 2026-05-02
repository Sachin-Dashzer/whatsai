'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

export default function SettingsPage() {
  const [businessName, setBusinessName] = useState('');
  const [waConnected, setWaConnected] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const loadSettings = useCallback(() => {
    fetch('/api/settings').then((r) => r.json()).then((d) => {
      if (d._id) {
        setBusinessName(d.businessName || '');
        setWaConnected(!!d.waConnected);
      }
    });
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
    setTimeout(() => setSaved(false), 2000);
  }

  const inputCls = "w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#25D366] focus:bg-white text-sm transition-colors";

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Settings</h2>
        <p className="text-slate-500 text-sm">Manage your workspace configuration</p>
      </div>

      {/* WhatsApp status banner */}
      <div className={`rounded-xl p-4 border flex items-center justify-between gap-4 ${waConnected ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${waConnected ? 'bg-green-500 animate-pulse' : 'bg-amber-400'}`} />
          <p className={`text-sm font-medium ${waConnected ? 'text-green-800' : 'text-amber-800'}`}>
            {waConnected ? 'WhatsApp is connected' : 'WhatsApp is not connected yet'}
          </p>
        </div>
        <Link
          href="/integrations/whatsapp"
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${waConnected ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}
        >
          {waConnected ? 'Manage' : 'Connect now →'}
        </Link>
      </div>

      <form onSubmit={save} className="space-y-6">
        {/* Business info */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
          <h3 className="font-semibold text-slate-900">Business Information</h3>
          <div>
            <label className="block text-sm text-slate-600 mb-1.5">Business Name</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Your Business Name"
              className={inputCls}
            />
          </div>
        </div>

        {/* Webhook info */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <h3 className="font-semibold text-slate-900">Webhook Configuration</h3>
          <p className="text-xs text-slate-400">Set these values in your Meta App Developer settings.</p>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Webhook URL</label>
            <div className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[#25D366] text-sm font-mono truncate">
              {typeof window !== 'undefined' ? window.location.origin : 'https://yourdomain.com'}/api/webhook/whatsapp
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Verify Token</label>
            <div className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-sm font-mono">
              {process.env.NEXT_PUBLIC_META_VERIFY_TOKEN || 'Set META_VERIFY_TOKEN in .env'}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-[#25D366] hover:bg-[#128C7E] disabled:opacity-60 text-white font-semibold rounded-xl transition-colors shadow-sm"
        >
          {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
