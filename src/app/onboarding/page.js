'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const META_APP_ID = process.env.NEXT_PUBLIC_META_APP_ID;
const META_CONFIG_ID = process.env.NEXT_PUBLIC_META_CONFIG_ID;
const CONFIG_MISSING = !META_CONFIG_ID || META_CONFIG_ID === 'your_meta_embedded_signup_config_id';

const STEPS = [
  { id: 'welcome', title: 'Welcome' },
  { id: 'connect', title: 'Connect WhatsApp' },
  { id: 'ai', title: 'Configure AI' },
  { id: 'done', title: "All set!" },
];

function FacebookIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [completing, setCompleting] = useState(false);

  // WhatsApp connect state
  const [sdkReady, setSdkReady] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [waConnected, setWaConnected] = useState(false);
  const [verifiedName, setVerifiedName] = useState('');
  const [connectError, setConnectError] = useState('');
  const timeoutRef = useRef(null);
  const sessionInfoRef = useRef({});

  // Load Facebook JS SDK
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

  // Capture WABA session info from Meta's message event
  useEffect(() => {
    function onMessage(e) {
      if (e.origin !== 'https://www.facebook.com' && e.origin !== 'https://web.facebook.com') return;
      try {
        const d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (d?.type === 'WA_EMBEDDED_SIGNUP' && d?.event === 'FINISH') {
          sessionInfoRef.current = { wabaId: d.data?.waba_id, phoneNumberId: d.data?.phone_number_id };
        }
      } catch {}
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  function connectWhatsApp() {
    if (!sdkReady || !window.FB) {
      setConnectError('Facebook SDK is still loading. Please wait a moment.');
      return;
    }
    setConnectError('');
    setConnecting(true);
    sessionInfoRef.current = {};

    timeoutRef.current = setTimeout(() => {
      setConnecting(false);
      setConnectError('The Facebook window did not open. Please allow pop-ups and try again.');
    }, 30000);

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
                setConnectError('Connection failed: ' + data.error);
              } else {
                setWaConnected(true);
                setVerifiedName(data.verifiedName || '');
              }
            })
            .catch(() => setConnectError('Something went wrong. Please try again.'))
            .finally(() => setConnecting(false));
        } else {
          setConnectError('Facebook login was cancelled. Please try again.');
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
      setConnectError('Facebook SDK error: ' + (err?.message || 'Check the browser console for details.'));
    }
  }

  async function completeOnboarding() {
    setCompleting(true);
    await fetch('/api/onboarding/complete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    router.push('/dashboard');
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-green-50 flex flex-col items-center justify-center p-4">
      {/* Progress */}
      <div className="w-full max-w-2xl mb-8">
        <div className="flex items-center gap-0">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <div className={`flex-1 h-1 ${i === 0 ? 'hidden' : ''} ${i <= step ? 'bg-[#25D366]' : 'bg-slate-200'} transition-colors`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all ${
                i < step ? 'bg-[#25D366] text-white' : i === step ? 'bg-green-50 border-2 border-[#25D366] text-[#25D366]' : 'bg-slate-100 text-slate-400'
              }`}>
                {i < step ? '✓' : i + 1}
              </div>
              <div className={`flex-1 h-1 ${i === STEPS.length - 1 ? 'hidden' : ''} ${i < step ? 'bg-[#25D366]' : 'bg-slate-200'} transition-colors`} />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          {STEPS.map((s) => (
            <span key={s.id} className="text-xs text-slate-400 text-center flex-1">{s.title}</span>
          ))}
        </div>
      </div>

      <div className="w-full max-w-2xl">
        {/* Step 0: Welcome */}
        {step === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-lg">
            <div className="text-6xl mb-5">🎉</div>
            <h1 className="text-3xl font-bold text-slate-900 mb-3">Welcome to WaBot.ai!</h1>
            <p className="text-slate-500 text-lg mb-8 max-w-md mx-auto">
              Let&apos;s get your WhatsApp AI sales agent up and running in just a few minutes.
            </p>
            <div className="grid grid-cols-3 gap-4 mb-8 text-left">
              {[
                { icon: '🔌', label: 'Connect WhatsApp Business API' },
                { icon: '🤖', label: 'Configure your AI agent persona' },
                { icon: '📢', label: 'Start receiving & qualifying leads' },
              ].map((item) => (
                <div key={item.label} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <span className="text-2xl">{item.icon}</span>
                  <p className="text-slate-900 font-medium text-sm mt-2">{item.label}</p>
                </div>
              ))}
            </div>
            <button onClick={() => setStep(1)} className="px-8 py-3 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold rounded-xl text-lg transition-colors shadow-lg shadow-green-200">
              Let&apos;s Get Started →
            </button>
          </div>
        )}

        {/* Step 1: Connect WhatsApp */}
        {step === 1 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-lg space-y-6">
            <div>
              <div className="text-4xl mb-3">🔌</div>
              <h2 className="text-2xl font-bold text-slate-900">Connect WhatsApp Business</h2>
              <p className="text-slate-500 mt-1 text-sm">
                Log in with Facebook to connect your WhatsApp Business account in one click — no API keys needed.
              </p>
            </div>

            {/* Connected state */}
            {waConnected ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-green-800">WhatsApp Connected!</p>
                  {verifiedName && <p className="text-green-700 text-sm">{verifiedName}</p>}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {CONFIG_MISSING && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                    Meta Config ID not set — contact support or skip for now.
                  </div>
                )}
                <button
                  onClick={connectWhatsApp}
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
                      Continue with Facebook
                    </>
                  )}
                </button>
                {connectError && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{connectError}</p>
                )}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-800 space-y-1">
              <p className="font-medium">📌 After connecting, configure your webhook</p>
              <p className="text-blue-700">Go to the <a href="/webhooks" className="underline font-medium">Webhooks page</a> to copy your webhook URL and add it in Meta Business settings.</p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors">
                Skip for now
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!waConnected}
                className="flex-1 py-3 bg-[#25D366] hover:bg-[#128C7E] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-colors shadow-sm"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Configure AI */}
        {step === 2 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-lg">
            <div className="text-4xl mb-4">🤖</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Your AI Agent is ready to configure</h2>
            <p className="text-slate-500 mb-6">
              After onboarding, go to the <strong className="text-slate-900">AI Agent</strong> page to write your system prompt and configure qualifying questions.
            </p>
            <div className="space-y-3 mb-6">
              {[
                { icon: '✍️', title: 'Write your persona', desc: 'Give the AI a name, define its role and tone for your business' },
                { icon: '❓', title: 'Add qualifying questions', desc: 'Define what info to collect from leads (budget, location, timeline)' },
                { icon: '🏷️', title: 'Set tag rules', desc: 'Auto-tag contacts based on their responses in real-time' },
                { icon: '🔄', title: 'Configure handovers', desc: 'Define trigger words that escalate to your human agents' },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="text-slate-900 font-medium text-sm">{item.title}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium">
                ← Back
              </button>
              <button onClick={() => setStep(3)} className="flex-1 py-3 bg-[#25D366] hover:bg-[#128C7E] text-white font-semibold rounded-xl text-sm transition-colors shadow-sm">
                Got it, Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Done */}
        {step === 3 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-lg">
            <div className="text-6xl mb-5">🚀</div>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">You&apos;re all set!</h2>
            <p className="text-slate-500 text-lg mb-8">
              Your WaBot.ai workspace is ready. Start by exploring the dashboard or configuring your AI agent.
            </p>
            <div className="grid grid-cols-2 gap-3 mb-8 text-left">
              {[
                { href: '/ai-agent', icon: '🤖', label: 'Configure AI Agent', desc: 'Set up your persona and rules' },
                { href: '/webhooks', icon: '🔌', label: 'Setup Webhooks', desc: 'Connect Meta to start receiving messages' },
                { href: '/contacts', icon: '👥', label: 'Import Contacts', desc: 'Add your existing WhatsApp contacts' },
                { href: '/broadcasts', icon: '📢', label: 'Create Broadcast', desc: 'Send your first WhatsApp campaign' },
              ].map((item) => (
                <a key={item.href} href={item.href} className="flex items-start gap-3 p-4 bg-slate-50 hover:bg-green-50 border border-slate-200 hover:border-green-200 rounded-xl transition-colors">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="text-slate-900 font-medium text-sm">{item.label}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{item.desc}</p>
                  </div>
                </a>
              ))}
            </div>
            <button onClick={completeOnboarding} disabled={completing} className="w-full py-4 bg-[#25D366] hover:bg-[#128C7E] disabled:opacity-60 text-white font-bold rounded-xl text-lg transition-colors shadow-lg shadow-green-200">
              {completing ? 'Loading dashboard...' : 'Go to Dashboard →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
