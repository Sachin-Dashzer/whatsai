import Link from 'next/link';
import Navbar from '@/components/marketing/Navbar';
import Footer from '@/components/marketing/Footer';

const PLANS = [
  {
    name: 'Free',
    price: '₹0',
    sub: 'forever',
    features: ['500 messages/mo', '1 agent', 'Basic inbox', 'Community support'],
    highlight: false,
    cta: 'Start free',
  },
  {
    name: 'Starter',
    price: '₹1,999',
    sub: '/month',
    features: ['1,000 messages/mo', '1 agent', 'Contact management', 'Basic analytics', 'Email support'],
    highlight: false,
    cta: 'Get Starter',
  },
  {
    name: 'Growth',
    price: '₹4,999',
    sub: '/month',
    features: ['5,000 messages/mo', '5 agents', '🤖 AI Agent', 'Advanced analytics', 'Broadcast campaigns', 'Priority support'],
    highlight: true,
    cta: 'Get Growth',
  },
  {
    name: 'Enterprise',
    price: '₹12,999',
    sub: '/month',
    features: ['Unlimited messages', 'Unlimited agents', 'Custom AI persona', 'Dedicated support', 'API access', 'SLA guarantee'],
    highlight: false,
    cta: 'Get Enterprise',
  },
];

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <div className="bg-white">
        <div className="pt-28 pb-20 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h1 className="text-5xl font-bold text-slate-900 mb-4">Simple pricing, powerful results</h1>
              <p className="text-slate-500 text-lg">Start free. No credit card required. Upgrade anytime.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {PLANS.map((plan) => (
                <div
                  key={plan.name}
                  className={`rounded-2xl p-6 flex flex-col relative ${
                    plan.highlight
                      ? 'bg-[#25D366] border-2 border-[#25D366] shadow-xl shadow-green-200'
                      : 'bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow'
                  }`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-white text-[#25D366] text-xs font-bold rounded-full whitespace-nowrap shadow-sm">
                      MOST POPULAR
                    </div>
                  )}
                  <h3 className={`font-bold text-lg mb-2 ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>
                  <div className="mb-5">
                    <span className={`text-2xl font-bold ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>{plan.price}</span>
                    <span className={`text-sm ${plan.highlight ? 'text-green-100' : 'text-slate-400'}`}> {plan.sub}</span>
                  </div>
                  <ul className="space-y-2.5 mb-6 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className={`flex items-start gap-2 text-sm ${plan.highlight ? 'text-green-50' : 'text-slate-600'}`}>
                        <span className={`shrink-0 font-bold ${plan.highlight ? 'text-white' : 'text-[#25D366]'}`}>✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/register"
                    className={`block text-center py-3 rounded-xl font-semibold text-sm transition-colors ${
                      plan.highlight
                        ? 'bg-white text-[#25D366] hover:bg-green-50'
                        : 'bg-[#25D366] hover:bg-[#128C7E] text-white'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center text-slate-400 text-sm">
              All plans include: WhatsApp Cloud API integration · MongoDB storage · SSL encryption
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
