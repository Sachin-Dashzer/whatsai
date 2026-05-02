import Link from 'next/link';
import Navbar from '@/components/marketing/Navbar';
import Footer from '@/components/marketing/Footer';

const FEATURES = [
  { icon: '🤖', title: 'AI Conversation Agent', desc: 'GPT-4o responds to customers 24/7, qualifies leads, and answers questions naturally without revealing it\'s AI.' },
  { icon: '🏷️', title: 'Smart Auto-Tagging', desc: 'Automatically tag contacts based on their responses. Hot lead, location, budget — tagged in real-time.' },
  { icon: '📢', title: 'Bulk Broadcasts', desc: 'Send WhatsApp template campaigns to thousands of contacts at once. Track delivery, read rates, and replies.' },
  { icon: '📊', title: 'Real-Time Analytics', desc: 'Monitor message volume, AI performance, lead stage distribution, and conversion rates with live dashboards.' },
  { icon: '👥', title: 'Team Inbox', desc: 'Your team handles complex conversations. AI escalates to humans when customers request it.' },
  { icon: '🔌', title: 'API & Webhooks', desc: 'Connect WaBot.ai to your CRM, calendar, or any tool using our REST API and webhook events.' },
];

const TESTIMONIALS = [
  { name: 'Rahul Sharma', role: 'Owner, Ryan Hair Clinic Delhi', text: 'We went from manually replying to 200+ WhatsApp queries a day to having AI handle 85% of them. Conversions tripled.', avatar: 'R' },
  { name: 'Priya Mehta', role: 'Marketing Head, FitZone India', text: 'The auto-tagging is genius. Our sales team now only talks to pre-qualified hot leads. Time saved is incredible.', avatar: 'P' },
  { name: 'Amit Joshi', role: 'Founder, EduBoost Coaching', text: 'Broadcasts with 60%+ read rates. Better than email, better than SMS. WaBot.ai changed our entire marketing strategy.', avatar: 'A' },
];

const FAQS = [
  { q: 'Do I need a WhatsApp Business API account?', a: 'Yes, you need a Meta WhatsApp Business Account (WABA) and a verified phone number. We provide a setup guide to get you started in under 30 minutes.' },
  { q: 'How does the AI know what to say?', a: 'You configure a system prompt that defines your business context, qualifying questions, and tag rules. The AI (GPT-4o by OpenAI) follows your instructions and sounds like your brand.' },
  { q: 'Can I take over a conversation from AI?', a: 'Yes, anytime. You can manually take over any conversation from the inbox, or configure trigger words (like "speak to human") that automatically escalate to your team.' },
  { q: 'Is my customer data secure?', a: 'All data is stored in your dedicated MongoDB instance. Access tokens are encrypted. We never share your data with third parties.' },
  { q: 'What happens when I exceed my message quota?', a: 'We notify you when you reach 80% of your quota. You can upgrade your plan anytime. Messages are never dropped silently.' },
];

export default function LandingPage() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden bg-linear-to-b from-white to-slate-50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#dcfce7_0%,transparent_60%)] pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-50 border border-green-200 rounded-full text-[#25D366] text-sm font-medium mb-6">
            <span className="w-1.5 h-1.5 bg-[#25D366] rounded-full animate-pulse" />
            Powered by GPT-4o (OpenAI)
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 leading-tight mb-6">
            Your AI Sales Agent,
            <br />
            <span className="text-[#25D366]">Live on WhatsApp</span>
            <br />
            24/7
          </h1>

          <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Automatically qualify leads, answer questions, and book appointments — while you sleep.
            Used by 2,000+ businesses across India.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="px-8 py-4 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold rounded-2xl text-lg transition-all hover:scale-105 shadow-lg shadow-green-200"
            >
              Start Free Trial
            </Link>
            <a
              href="#how-it-works"
              className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-2xl text-lg transition-colors border border-slate-200 shadow-sm"
            >
              Watch Demo →
            </a>
          </div>

          {/* Mock chat UI */}
          <div className="mt-16 mx-auto max-w-sm bg-white rounded-3xl p-4 border border-slate-200 shadow-2xl text-left">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center text-white text-sm font-bold">P</div>
              <div>
                <p className="text-slate-900 text-sm font-medium">Priya · AI Agent</p>
                <p className="text-green-500 text-xs">● Online</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { from: 'customer', msg: 'Hi, I saw your ad about hair loss treatment' },
                { from: 'ai', msg: 'Hi! Welcome to Ryan Clinic 😊 I\'m Priya. To help you best, can you tell me how long you\'ve been experiencing hair loss?' },
                { from: 'customer', msg: 'About 2 years. Mostly on top' },
                { from: 'ai', msg: 'Got it! And are you based in Delhi, Mumbai or another city?' },
              ].map((m, i) => (
                <div key={i} className={`flex ${m.from === 'ai' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[75%] px-3 py-2 rounded-xl text-xs leading-relaxed ${m.from === 'ai' ? 'bg-slate-100 text-slate-700' : 'bg-[#25D366] text-white'}`}>
                    {m.msg}
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-1 mt-2">
                <div className="w-2 h-2 bg-[#25D366] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-[#25D366] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-[#25D366] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-10 border-y border-slate-100 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm mb-6 font-medium uppercase tracking-wider">Trusted by 2,000+ businesses across India</p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {['Clinic+', 'EduBoost', 'FitZone', 'RealtyPro', 'SalonHub', 'AutoDeals'].map((b) => (
              <span key={b} className="text-slate-400 font-semibold text-lg">{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Everything you need to convert on WhatsApp</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              From AI-powered conversations to broadcast campaigns — WaBot.ai is the complete WhatsApp sales platform.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-[#25D366]/40 hover:shadow-lg transition-all group">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-slate-900 font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Up and running in 3 steps</h2>
            <p className="text-slate-500 text-lg">No coding required. Connect and launch in under an hour.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Connect WhatsApp', desc: 'Link your WhatsApp Business number via Meta Cloud API. Takes about 15 minutes with our setup guide.' },
              { step: '02', title: 'Configure AI Agent', desc: 'Write your system prompt, set qualifying questions, define auto-tag rules — no code needed.' },
              { step: '03', title: 'Watch leads qualify themselves', desc: 'Your AI agent starts responding instantly. Contacts get tagged, staged, and ready for your sales team.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center text-[#25D366] font-bold text-lg mx-auto mb-5 shadow-sm">
                  {item.step}
                </div>
                <h3 className="text-slate-900 font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-slate-500 text-lg">Start free. Scale as you grow. WhatsApp conversation costs are billed directly by Meta — we never charge per message.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Free', price: '₹0', sub: '/forever', features: ['1 agent seat', 'Live inbox', 'Basic contacts', 'Meta direct billing'], highlight: false },
              { name: 'Basic', price: '₹1,999', sub: '/month', features: ['3 agent seats', 'Contact management', 'Broadcasts', 'Full analytics', 'Meta direct billing'], highlight: false },
              { name: 'Pro', price: '₹4,999', sub: '/month', features: ['Unlimited agents', '🤖 AI Agent (GPT-4o)', 'Automation flows', 'Priority support', 'Meta direct billing'], highlight: true },
            ].map((plan) => (
              <div key={plan.name} className={`rounded-2xl p-6 flex flex-col relative ${plan.highlight ? 'bg-[#25D366] border-2 border-[#25D366] shadow-xl shadow-green-200' : 'bg-white border border-slate-200 shadow-sm'}`}>
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-white text-[#25D366] text-xs font-bold rounded-full shadow-sm">
                    MOST POPULAR
                  </div>
                )}
                <h3 className={`font-bold text-lg mb-2 ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>
                <div className="mb-5">
                  <span className={`text-3xl font-bold ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>{plan.price}</span>
                  <span className={`text-sm ${plan.highlight ? 'text-green-100' : 'text-slate-400'}`}>{plan.sub}</span>
                </div>
                <ul className="space-y-2.5 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className={`flex items-center gap-2 text-sm ${plan.highlight ? 'text-green-50' : 'text-slate-600'}`}>
                      <span className={`text-xs font-bold ${plan.highlight ? 'text-white' : 'text-[#25D366]'}`}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`block text-center py-3 rounded-xl font-semibold text-sm transition-colors ${plan.highlight ? 'bg-white text-[#25D366] hover:bg-green-50' : 'bg-[#25D366] hover:bg-[#128C7E] text-white'}`}
                >
                  Get started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Loved by businesses across India</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <span key={i} className="text-yellow-400 text-sm">★</span>)}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-5">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-[#25D366] font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-slate-900 text-sm font-medium">{t.name}</p>
                    <p className="text-slate-400 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq) => (
              <details key={faq.q} className="bg-slate-50 border border-slate-200 rounded-xl group hover:border-[#25D366]/30 transition-colors">
                <summary className="px-6 py-4 text-slate-800 font-medium cursor-pointer list-none flex items-center justify-between">
                  {faq.q}
                  <span className="text-slate-400 group-open:rotate-180 transition-transform">▾</span>
                </summary>
                <p className="px-6 pb-5 text-slate-500 text-sm leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 bg-linear-to-br from-[#25D366] to-[#128C7E]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-white mb-4">
            Ready to 10x your<br />WhatsApp sales?
          </h2>
          <p className="text-green-100 text-lg mb-10">
            Join 2,000+ businesses using WaBot.ai to qualify leads on autopilot.
          </p>
          <Link
            href="/register"
            className="inline-block px-10 py-4 bg-white hover:bg-green-50 text-[#25D366] font-bold text-xl rounded-2xl transition-all hover:scale-105 shadow-xl"
          >
            Start Free Trial — No Credit Card
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
