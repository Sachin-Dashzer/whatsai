'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const STEPS = [
  { id: 'welcome', title: 'Welcome to WaBot.ai', icon: '🎉' },
  { id: 'connect', title: 'Connect WhatsApp', icon: '🔌' },
  { id: 'ai', title: 'Configure AI Agent', icon: '🤖' },
  { id: 'done', title: "You're all set!", icon: '🚀' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [waConfig, setWaConfig] = useState({ wabaId: '', phoneNumberId: '', accessToken: '', verifiedName: '' });
  const [skipped, setSkipped] = useState(false);
  const [completing, setCompleting] = useState(false);

  async function completeOnboarding() {
    setCompleting(true);
    await fetch('/api/onboarding/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(skipped ? {} : waConfig),
    });
    router.push('/dashboard');
  }

  const inputCls = "w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#25D366] focus:bg-white text-sm transition-colors";

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
                { icon: '🔌', step: '1', label: 'Connect WhatsApp Business API' },
                { icon: '🤖', step: '2', label: 'Configure your AI agent persona' },
                { icon: '📢', step: '3', label: 'Start receiving & qualifying leads' },
              ].map((item) => (
                <div key={item.step} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
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
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-lg">
            <div className="text-4xl mb-4">🔌</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Connect your WhatsApp Business number</h2>
            <p className="text-slate-500 mb-6">
              You need a Meta WhatsApp Business Account (WABA) to receive and send messages.{' '}
              <a href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started" target="_blank" rel="noopener noreferrer" className="text-[#25D366] hover:underline font-medium">
                View setup guide ↗
              </a>
            </p>
            <div className="space-y-4 mb-6">
              {[
                { key: 'wabaId', label: 'WhatsApp Business Account ID', placeholder: '123456789012345', hint: 'Found in Meta Business Settings → Accounts → WhatsApp' },
                { key: 'phoneNumberId', label: 'Phone Number ID', placeholder: '987654321098765', hint: 'Found under your WhatsApp number in Meta' },
                { key: 'verifiedName', label: 'Business Display Name', placeholder: 'Ryan Hair Clinic', hint: 'The name shown in WhatsApp chats' },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">{field.label}</label>
                  <input type="text" value={waConfig[field.key]} onChange={(e) => setWaConfig({ ...waConfig, [field.key]: e.target.value })} placeholder={field.placeholder} className={inputCls} />
                  <p className="text-slate-400 text-xs mt-1">{field.hint}</p>
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Permanent Access Token</label>
                <input type="password" value={waConfig.accessToken} onChange={(e) => setWaConfig({ ...waConfig, accessToken: e.target.value })} placeholder="EAAxxxxxxxx..." className={inputCls} />
                <p className="text-slate-400 text-xs mt-1">Generate in Meta Business Settings → System Users → Add Token</p>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 space-y-2">
              <p className="text-blue-700 text-sm font-medium">📌 Don&apos;t forget to configure your webhook</p>
              <p className="text-slate-500 text-xs">
                After saving, go to{' '}
                <a href="/webhooks" className="text-[#25D366] hover:underline font-medium">Webhooks page</a>{' '}
                to copy your webhook URL and configure it in Meta.
              </p>
              <p className="text-green-700 text-xs font-medium">💡 WhatsApp conversations are billed directly by Meta — no per-message charges from us.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setSkipped(true); setStep(2); }} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors">
                Skip for now
              </button>
              <button onClick={() => setStep(2)} className="flex-1 py-3 bg-[#25D366] hover:bg-[#128C7E] text-white font-semibold rounded-xl text-sm transition-colors shadow-sm">
                Save & Continue →
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
