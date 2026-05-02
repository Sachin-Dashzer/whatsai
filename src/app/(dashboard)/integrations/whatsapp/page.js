'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

const faqs = [
  {
    q: 'Can I use my personal number?',
    a: 'No. WhatsApp Business API requires a dedicated business phone number that is not already registered on WhatsApp or WhatsApp Business app. You can use a new SIM or a virtual number.',
  },
  {
    q: 'Why do I need to login with Facebook?',
    a: "Meta (Facebook) owns WhatsApp. To use the official WhatsApp Business API you must verify your business through Meta's Business Platform. This is a one-time step and we only request the minimum permissions needed.",
  },
  {
    q: 'What happens to my existing WhatsApp chats?',
    a: 'Connecting via the Business API is separate from the WhatsApp consumer app. Your personal chats are unaffected. Once connected, all messages go through the API.',
  },
  {
    q: 'I do not have a Meta Business account yet',
    a: 'No problem! During the Facebook login flow you can create a new Meta Business portfolio on the spot. Just choose "Create new" when prompted.',
  },
];

function FAQ({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-4 text-left text-sm font-medium text-slate-800 hover:text-slate-900 transition-colors"
      >
        {q}
        <svg
          className={`w-4 h-4 text-slate-400 shrink-0 ml-4 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <p className="pb-4 text-sm text-slate-500 leading-relaxed">{a}</p>}
    </div>
  );
}

function FacebookIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

const inputCls = "w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#25D366] focus:bg-white text-sm transition-colors";

function ManualForm({ onSaved }) {
  const [fields, setFields] = useState({ wabaId: '', phoneNumberId: '', verifiedName: '', accessToken: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!fields.wabaId || !fields.phoneNumberId || !fields.accessToken) {
      setError('WABA ID, Phone Number ID, and Access Token are required.');
      return;
    }
    setSaving(true);
    setError('');
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...fields, waConnected: true }),
    });
    setSaving(false);
    if (res.ok) {
      onSaved();
    } else {
      setError('Failed to save. Please try again.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {[
        { key: 'wabaId', label: 'WhatsApp Business Account ID', placeholder: '123456789012345' },
        { key: 'phoneNumberId', label: 'Phone Number ID', placeholder: '987654321098765' },
        { key: 'verifiedName', label: 'Business Display Name', placeholder: 'Your Business' },
      ].map((f) => (
        <div key={f.key}>
          <label className="block text-sm text-slate-600 mb-1.5">{f.label}</label>
          <input
            type="text"
            value={fields[f.key]}
            onChange={(e) => setFields({ ...fields, [f.key]: e.target.value })}
            placeholder={f.placeholder}
            className={inputCls}
          />
        </div>
      ))}
      <div>
        <label className="block text-sm text-slate-600 mb-1.5">Permanent Access Token</label>
        <input
          type="password"
          value={fields.accessToken}
          onChange={(e) => setFields({ ...fields, accessToken: e.target.value })}
          placeholder="EAAxxxxxxxx..."
          className={inputCls}
        />
        <p className="text-xs text-slate-400 mt-1">Found in Meta Business Settings → System Users</p>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="w-full py-3 bg-[#25D366] hover:bg-[#128C7E] disabled:opacity-60 text-white font-semibold rounded-xl transition-colors"
      >
        {saving ? 'Saving...' : 'Save & Connect'}
      </button>
    </form>
  );
}

export default function ConnectWhatsAppPage() {
  const [connected, setConnected] = useState(false);
  const [verifiedName, setVerifiedName] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [message, setMessage] = useState(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [isHttps, setIsHttps] = useState(true);
  const [showManual, setShowManual] = useState(false);

  const loadSettings = useCallback(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => {
        setConnected(!!d.waConnected);
        setVerifiedName(d.verifiedName || '');
      });
  }, []);

  useEffect(() => {
    loadSettings();
    setIsHttps(window.location.protocol === 'https:');
  }, [loadSettings]);

  // Load Facebook SDK (only useful on HTTPS)
  useEffect(() => {
    if (typeof window === 'undefined' || window.location.protocol !== 'https:') return;
    if (window.FB) { setSdkReady(true); return; }

    window.fbAsyncInit = function () {
      window.FB.init({
        appId: process.env.NEXT_PUBLIC_META_APP_ID,
        autoLogAppEvents: true,
        xfbml: true,
        version: 'v19.0',
      });
      setSdkReady(true);
    };

    if (!document.getElementById('facebook-jssdk')) {
      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

  function handleFacebookConnect() {
    if (!sdkReady || !window.FB) {
      setMessage({ text: 'Facebook SDK is still loading. Please wait a moment and try again.', type: 'error' });
      return;
    }
    setConnecting(true);
    setMessage(null);

    window.FB.login(
      async (response) => {
        if (response.authResponse?.code) {
          try {
            const res = await fetch('/api/meta/embedded-signup', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code: response.authResponse.code }),
            });
            const data = await res.json();
            if (data.error) {
              setMessage({ text: 'Connection failed: ' + data.error, type: 'error' });
            } else {
              setMessage({ text: 'WhatsApp connected successfully!', type: 'success' });
              loadSettings();
            }
          } catch {
            setMessage({ text: 'Something went wrong. Please try again.', type: 'error' });
          }
        } else {
          setMessage({ text: 'Login was cancelled. Please try again.', type: 'error' });
        }
        setConnecting(false);
      },
      {
        config_id: process.env.NEXT_PUBLIC_META_CONFIG_ID || '',
        response_type: 'code',
        override_default_response_type: true,
        extras: { setup: {}, featureType: '', sessionInfoVersion: '3' },
      }
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      {/* Back link */}
      <Link
        href="/integrations"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Integrations
      </Link>

      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-20 h-20 rounded-2xl bg-[#25D366] flex items-center justify-center mx-auto shadow-lg">
          <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Connect WhatsApp</h1>
          <p className="text-slate-500 mt-1 text-sm leading-relaxed">
            Connect your WhatsApp Business account to start sending and receiving messages with your AI assistant.
          </p>
        </div>
      </div>

      {/* Already connected */}
      {connected && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-green-800">WhatsApp Connected</p>
            {verifiedName && <p className="text-green-700 text-sm">{verifiedName}</p>}
          </div>
        </div>
      )}

      {/* Connect card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
        {/* HTTP warning banner */}
        {!isHttps && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-1">
            <p className="text-sm font-semibold text-amber-800">HTTPS required for Facebook Login</p>
            <p className="text-xs text-amber-700">
              You&apos;re on <span className="font-mono">http://</span>. Facebook blocks OAuth on plain HTTP.
              In production your domain must use HTTPS. For local testing, use the manual entry below.
            </p>
          </div>
        )}

        {/* Facebook button — only on HTTPS */}
        {isHttps && (
          <>
            <p className="text-sm text-slate-600 text-center">
              We use Meta&apos;s official Business Platform — no manual copy-paste of API keys.
            </p>
            <button
              onClick={handleFacebookConnect}
              disabled={connecting}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-[#1877F2] hover:bg-[#166fe5] disabled:opacity-60 text-white rounded-xl text-base font-semibold transition-colors shadow-sm"
            >
              <FacebookIcon />
              {connecting ? 'Opening Facebook...' : connected ? 'Reconnect with Facebook' : 'Login with Facebook'}
            </button>
            {!sdkReady && (
              <p className="text-xs text-center text-slate-400">Loading Facebook SDK…</p>
            )}
            <div className="relative flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400 shrink-0">or enter credentials manually</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>
          </>
        )}

        {/* Manual toggle / form */}
        {!showManual ? (
          <button
            onClick={() => setShowManual(true)}
            className="w-full py-2.5 px-4 border border-slate-300 hover:border-slate-400 text-slate-600 hover:text-slate-900 rounded-xl text-sm font-medium transition-colors"
          >
            Enter API credentials manually
          </button>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              Get these from{' '}
              <a
                href="https://developers.facebook.com/apps"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#25D366] hover:underline"
              >
                Meta Developer Console
              </a>
              {' '}→ your app → WhatsApp → API Setup.
            </p>
            <ManualForm onSaved={() => { setMessage({ text: 'WhatsApp connected successfully!', type: 'success' }); loadSettings(); setShowManual(false); }} />
          </div>
        )}
      </div>

      {/* Status message */}
      {message && (
        <div className={`rounded-xl px-4 py-3 text-sm font-medium ${
          message.type === 'success'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* FAQ */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="font-semibold text-slate-900 mb-1">Common Questions</h2>
        <div className="mt-3">
          {faqs.map((f) => (
            <FAQ key={f.q} q={f.q} a={f.a} />
          ))}
        </div>
      </div>
    </div>
  );
}
