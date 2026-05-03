'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';

const faqs = [
  {
    q: 'Can I use my personal number?',
    a: 'No. WhatsApp Business API requires a dedicated phone number not already on WhatsApp or WhatsApp Business app. You can use a new SIM or a virtual number.',
  },
  {
    q: 'Why do I need to login with Facebook?',
    a: "Meta owns WhatsApp. Their official Business Platform requires Facebook login to verify your business. It's a one-time step and we only request minimum permissions.",
  },
  {
    q: 'What happens to my existing WhatsApp chats?',
    a: 'The Business API is completely separate from WhatsApp consumer app. Your personal chats are unaffected.',
  },
  {
    q: 'I do not have a Meta Business account yet',
    a: 'No problem — during the Facebook flow you can create a new Meta Business portfolio on the spot.',
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
        <svg className={`w-4 h-4 text-slate-400 shrink-0 ml-4 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <p className="pb-4 text-sm text-slate-500 leading-relaxed">{a}</p>}
    </div>
  );
}

function FacebookIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

const META_CONFIG_ID = process.env.NEXT_PUBLIC_META_CONFIG_ID;
const META_APP_ID = process.env.NEXT_PUBLIC_META_APP_ID;
const CONFIG_MISSING = !META_CONFIG_ID || META_CONFIG_ID === 'your_meta_embedded_signup_config_id';

export default function ConnectWhatsAppPage() {
  const [connected, setConnected] = useState(false);
  const [verifiedName, setVerifiedName] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const timeoutRef = useRef(null);
  const sessionInfoRef = useRef({});

  const loadSettings = useCallback(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => {
        setConnected(!!d.waConnected);
        setVerifiedName(d.verifiedName || '');
      });
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.FB) { setSdkReady(true); return; }
    window.fbAsyncInit = function () {
      window.FB.init({ appId: META_APP_ID, autoLogAppEvents: true, xfbml: true, version: 'v19.0' });
      setSdkReady(true);
    };
    if (!document.getElementById('facebook-jssdk')) {
      const s = document.createElement('script');
      s.id = 'facebook-jssdk';
      s.src = 'https://connect.facebook.net/en_US/sdk.js';
      s.async = true; s.defer = true;
      document.body.appendChild(s);
    }
  }, []);

  // Capture WABA ID and phone number ID from Meta's embedded signup message event
  useEffect(() => {
    function onMessage(e) {
      if (e.origin !== 'https://www.facebook.com' && e.origin !== 'https://web.facebook.com') return;
      try {
        const d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (d?.type === 'WA_EMBEDDED_SIGNUP' && d?.event === 'FINISH') {
          sessionInfoRef.current = {
            wabaId: d.data?.waba_id,
            phoneNumberId: d.data?.phone_number_id,
          };
        }
      } catch {}
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  function startConnect() {
    if (!sdkReady || !window.FB) {
      setError('Facebook SDK is still loading. Please wait a moment and try again.');
      return;
    }
    setError('');
    setSuccess('');
    setConnecting(true);

    // Safety reset — if callback never fires (popup blocked, SDK error)
    timeoutRef.current = setTimeout(() => {
      setConnecting(false);
      setError('The Facebook window did not open. Please allow pop-ups for this site in your browser, then try again.');
    }, 30000);

    sessionInfoRef.current = {};
    try {
      window.FB.login((response) => {
        clearTimeout(timeoutRef.current);
        if (response.authResponse?.code) {
          fetch('/api/meta/embedded-signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              code: response.authResponse.code,
              wabaId: sessionInfoRef.current.wabaId,
              phoneNumberId: sessionInfoRef.current.phoneNumberId,
            }),
          })
            .then((r) => r.json())
            .then((data) => {
              if (data.error) {
                setError('Connection failed: ' + data.error);
              } else {
                setSuccess('WhatsApp connected successfully!');
                loadSettings();
              }
            })
            .catch(() => setError('Something went wrong. Please try again.'))
            .finally(() => setConnecting(false));
        } else {
          const status = response.status || 'unknown';
          setError(`Facebook login was cancelled (status: ${status}). Make sure pop-ups are allowed and try again.`);
          setConnecting(false);
        }
      }, {
        config_id: META_CONFIG_ID,
        response_type: 'code',
        override_default_response_type: true,
        extras: { setup: {}, featureType: '', sessionInfoVersion: '3' },
      });
    } catch (err) {
      clearTimeout(timeoutRef.current);
      setConnecting(false);
      setError('Facebook SDK error: ' + (err?.message || 'Unknown. Check the browser console (F12) for details.'));
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      {/* Back */}
      <Link href="/integrations"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors">
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
          <p className="text-slate-500 mt-1 text-sm">
            Connect your WhatsApp Business account via Meta&apos;s official platform.
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

      {/* Setup warning — config ID is a placeholder */}
      {CONFIG_MISSING && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <div>
              <p className="font-semibold text-amber-800 text-sm">Meta Config ID not set</p>
              <p className="text-amber-700 text-xs mt-1">
                The Facebook login button won&apos;t work until you set <code className="font-mono bg-amber-100 px-1 rounded">NEXT_PUBLIC_META_CONFIG_ID</code> in Vercel. Follow the steps below.
              </p>
            </div>
          </div>
          <ol className="text-xs text-amber-800 space-y-1.5 list-decimal list-inside">
            <li>Go to <strong>developers.facebook.com</strong> → your app (ID: {META_APP_ID})</li>
            <li>Left sidebar → <strong>WhatsApp → Embedded Signup</strong></li>
            <li>Click <strong>Create configuration</strong> → give it a name → Save</li>
            <li>Copy the <strong>Configuration ID</strong> (looks like: 12345678)</li>
            <li>Add it to Vercel: <strong>Settings → Environment Variables → NEXT_PUBLIC_META_CONFIG_ID</strong></li>
            <li>Redeploy</li>
          </ol>
        </div>
      )}

      {/* Connect card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="text-center space-y-1">
          <p className="text-sm font-medium text-slate-700">
            {connected ? 'Reconnect your WhatsApp Business account' : 'One click to connect — no API keys needed'}
          </p>
          <p className="text-xs text-slate-400">Powered by Meta&apos;s official Business Platform</p>
        </div>

        <button
          onClick={startConnect}
          disabled={connecting || CONFIG_MISSING}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 bg-[#1877F2] hover:bg-[#166fe5] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-base font-semibold transition-colors shadow-sm"
        >
          {connecting ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Opening Facebook…
            </>
          ) : (
            <>
              <FacebookIcon />
              {connected ? 'Reconnect with Facebook' : 'Continue with Facebook'}
            </>
          )}
        </button>

        {connecting && (
          <p className="text-xs text-center text-slate-400">
            A pop-up window will appear. If nothing opens, check that pop-ups are allowed for this site.
          </p>
        )}

        {!sdkReady && !CONFIG_MISSING && (
          <p className="text-xs text-center text-slate-400">Loading…</p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl px-4 py-3 text-sm font-medium bg-red-50 text-red-700 border border-red-200 flex items-start gap-2">
          <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          {error}
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="rounded-xl px-4 py-3 text-sm font-medium bg-green-50 text-green-700 border border-green-200 flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          {success}
        </div>
      )}

      {/* FAQ */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="font-semibold text-slate-900 mb-1">Common Questions</h2>
        <div className="mt-3">
          {faqs.map((f) => <FAQ key={f.q} q={f.q} a={f.a} />)}
        </div>
      </div>
    </div>
  );
}
