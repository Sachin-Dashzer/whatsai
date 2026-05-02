'use client';

import { useState, useEffect } from 'react';

const PLANS = [
  {
    key: 'free',
    name: 'Free',
    price: '₹0',
    period: 'forever',
    highlight: false,
    cta: 'Current Plan',
    badge: null,
    features: [
      '1 agent seat',
      'Live inbox',
      'Basic contact management',
      'Community support',
      'Meta direct billing — pay only Meta',
    ],
  },
  {
    key: 'basic',
    name: 'Basic',
    price: '₹1,999',
    period: '/month',
    highlight: false,
    cta: 'Upgrade to Basic',
    badge: null,
    features: [
      '3 agent seats',
      'Contact management & tags',
      'Broadcast campaigns',
      'Full analytics dashboard',
      'Webhook event log',
      'Email support',
      'Meta direct billing — pay only Meta',
    ],
  },
  {
    key: 'pro',
    name: 'Pro',
    price: '₹4,999',
    period: '/month',
    highlight: true,
    cta: 'Upgrade to Pro',
    badge: 'MOST POPULAR',
    features: [
      'Unlimited agent seats',
      'AI Agent (GPT-4o)',
      'Smart auto-tagging',
      'Automation flows',
      'Advanced analytics',
      'Priority support',
      'Meta direct billing — pay only Meta',
    ],
  },
];

export default function BillingPage() {
  const [tenant, setTenant] = useState(null);
  const [subscribing, setSubscribing] = useState(null);

  useEffect(() => {
    fetch('/api/settings').then((r) => r.json()).then(setTenant);
  }, []);

  async function handleUpgrade(plan) {
    if (plan.key === 'free' || plan.key === tenant?.plan) return;
    setSubscribing(plan.key);

    try {
      const res = await fetch('/api/billing/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: plan.key }),
      });
      const data = await res.json();

      if (!data.subscriptionId) {
        alert(data.error || 'Failed to create subscription. Please try again.');
        setSubscribing(null);
        return;
      }

      if (typeof window === 'undefined' || !window.Razorpay) {
        alert('Razorpay is loading. Please try again in a moment.');
        setSubscribing(null);
        return;
      }

      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: data.subscriptionId,
        name: 'WaBot.ai',
        description: `${plan.name} Plan — ${plan.price}/month`,
        image: '/logo.png',
        theme: { color: '#25D366' },
        handler: function (response) {
          alert(`Payment successful! Subscription ID: ${response.razorpay_subscription_id}\n\nYour plan will be activated within a few minutes.`);
          fetch('/api/settings').then((r) => r.json()).then(setTenant);
        },
        modal: { ondismiss: () => setSubscribing(null) },
        prefill: { name: tenant?.businessName },
      });

      rzp.on('payment.failed', (response) => {
        alert(`Payment failed: ${response.error.description}`);
        setSubscribing(null);
      });

      rzp.open();
    } catch {
      alert('Something went wrong. Please try again.');
      setSubscribing(null);
    }
  }

  const currentPlanKey = tenant?.plan || 'free';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Billing & Plans</h2>
        <p className="text-slate-500 text-sm">SaaS subscription via Razorpay — WhatsApp conversation costs are billed directly by Meta</p>
      </div>

      {/* Meta billing notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <span className="text-xl shrink-0">ℹ️</span>
        <div>
          <p className="text-blue-800 font-semibold text-sm">How billing works</p>
          <p className="text-blue-700 text-sm mt-0.5">
            WhatsApp conversation charges are paid <strong>directly to Meta</strong> through your WhatsApp Business Account — we never charge per message.
            Your WaBot.ai subscription covers platform access, AI agent, and automation features only.
          </p>
          <a
            href="https://developers.facebook.com/docs/whatsapp/pricing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 text-xs hover:underline font-medium mt-1 inline-block"
          >
            View Meta pricing →
          </a>
        </div>
      </div>

      {/* Current plan */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-slate-900">Current Plan</h3>
          <span className="px-2.5 py-0.5 bg-green-100 text-[#25D366] rounded-full text-xs font-semibold capitalize">
            {currentPlanKey}
          </span>
        </div>
        <p className="text-slate-500 text-sm mt-1">
          {PLANS.find((p) => p.key === currentPlanKey)?.price}
          {currentPlanKey !== 'free' ? '/month' : ' — free forever'}
        </p>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {PLANS.map((plan) => {
          const isCurrent = currentPlanKey === plan.key;
          const planIndex = PLANS.findIndex((p) => p.key === plan.key);
          const currentIndex = PLANS.findIndex((p) => p.key === currentPlanKey);
          const isDowngrade = planIndex < currentIndex;

          return (
            <div
              key={plan.key}
              className={`rounded-2xl p-5 flex flex-col relative ${
                plan.highlight
                  ? 'bg-[#25D366] border-2 border-[#25D366] shadow-xl shadow-green-200'
                  : isCurrent
                  ? 'bg-white border-2 border-[#25D366] shadow-md'
                  : 'bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 bg-white text-[#25D366] text-xs font-bold rounded-full whitespace-nowrap shadow-sm">
                    {plan.badge}
                  </span>
                </div>
              )}
              {isCurrent && !plan.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 bg-[#25D366] text-white text-xs font-bold rounded-full whitespace-nowrap">
                    YOUR PLAN
                  </span>
                </div>
              )}

              <div className="mb-4">
                <h3 className={`font-bold text-lg ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>
                <div className="mt-1.5 flex items-baseline gap-1">
                  <span className={`text-2xl font-bold ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>{plan.price}</span>
                  <span className={`text-sm ${plan.highlight ? 'text-green-100' : 'text-slate-400'}`}>{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-2 mb-5 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className={`flex items-start gap-2 text-xs ${plan.highlight ? 'text-green-50' : 'text-slate-600'}`}>
                    <span className={`shrink-0 mt-0.5 font-bold ${plan.highlight ? 'text-white' : 'text-[#25D366]'}`}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <div className={`text-center py-2.5 rounded-xl text-sm font-medium ${plan.highlight ? 'bg-white/20 text-white' : 'bg-green-50 text-[#25D366]'}`}>
                  Active Plan
                </div>
              ) : isDowngrade ? (
                <div className="text-center py-2.5 text-slate-400 text-sm cursor-not-allowed">
                  Contact support to downgrade
                </div>
              ) : (
                <button
                  onClick={() => handleUpgrade(plan)}
                  disabled={subscribing === plan.key || plan.key === 'free'}
                  className={`py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 ${
                    plan.highlight
                      ? 'bg-white text-[#25D366] hover:bg-green-50'
                      : 'bg-[#25D366] hover:bg-[#128C7E] text-white shadow-sm'
                  }`}
                >
                  {subscribing === plan.key ? 'Processing...' : plan.cta}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Payment info */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <h3 className="font-semibold text-slate-900 mb-3">Payment Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          {[
            { icon: '🔒', title: 'Secure Payments', desc: 'All payments processed by Razorpay with bank-grade security' },
            { icon: '🔄', title: 'Auto-renewal', desc: 'Plans renew monthly. Cancel anytime from your dashboard.' },
            { icon: '💳', title: 'Accepted methods', desc: 'UPI, Cards, Net Banking, Wallets — all major Indian payment methods' },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className="text-slate-900 font-medium">{item.title}</p>
                <p className="text-slate-500 text-xs mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-slate-400 text-sm text-center">
        Need a custom plan or GST invoice?{' '}
        <a href="mailto:billing@wabot.ai" className="text-[#25D366] hover:underline font-medium">
          Contact billing support →
        </a>
      </p>
    </div>
  );
}
