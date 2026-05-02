import Link from 'next/link';
import Navbar from '@/components/marketing/Navbar';
import Footer from '@/components/marketing/Footer';

const FEATURES = [
  {
    icon: '🤖',
    title: 'AI Conversation Agent',
    desc: 'GPT-4o by OpenAI powers your WhatsApp conversations. Configure your persona, qualifying questions, and handover rules. The AI qualifies leads, answers FAQs, and escalates complex queries seamlessly.',
    bullets: ['Custom system prompts', 'Multi-language support', 'Human handover triggers', 'Conversation context memory'],
  },
  {
    icon: '🏷️',
    title: 'Smart Auto-Tagging',
    desc: 'Define keyword-to-tag rules and your AI automatically segments contacts in real-time. No manual work.',
    bullets: ['Keyword-based rules', 'Stage progression tracking', 'Tag-based filtering', 'Bulk tag management'],
  },
  {
    icon: '📢',
    title: 'Broadcast Campaigns',
    desc: 'Send approved WhatsApp templates to targeted contact segments. Schedule campaigns and track performance.',
    bullets: ['Template message support', 'Tag-based targeting', 'Scheduled delivery', 'Delivery/read tracking'],
  },
  {
    icon: '📊',
    title: 'Real-Time Analytics',
    desc: 'Full visibility into your WhatsApp sales funnel. Track message volume, AI performance, and conversion rates.',
    bullets: ['Message volume charts', 'AI handled % metric', 'Stage funnel view', 'Top tag analysis'],
  },
  {
    icon: '👥',
    title: 'Multi-Agent Team Inbox',
    desc: 'Your entire team works from one shared inbox. Assign conversations, track who replied, and never miss a lead.',
    bullets: ['Agent assignment', 'AI ↔ Human handover', 'Unread counters', 'Conversation history'],
  },
  {
    icon: '🔌',
    title: 'Full REST API',
    desc: 'Integrate WaBot.ai with your CRM, booking system, or any tool using our REST API and webhook events.',
    bullets: ['Contact CRUD API', 'Message send API', 'Webhook events', 'Meta Cloud API integration'],
  },
];

export default function FeaturesPage() {
  return (
    <>
      <Navbar />
      <div className="bg-white">
        {/* Hero */}
        <div className="pt-28 pb-16 px-4 bg-linear-to-b from-slate-50 to-white text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-slate-900 mb-4">Features built for WhatsApp sales</h1>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              Everything your team needs to convert leads on WhatsApp — from AI automation to team collaboration.
            </p>
          </div>
        </div>

        <div className="pb-20 px-4">
          <div className="max-w-5xl mx-auto space-y-6">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className={`flex flex-col md:flex-row gap-8 items-center bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
              >
                <div className="flex-1">
                  <div className="text-4xl mb-4">{f.icon}</div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-3">{f.title}</h2>
                  <p className="text-slate-500 leading-relaxed mb-5">{f.desc}</p>
                  <ul className="space-y-2">
                    {f.bullets.map((b) => (
                      <li key={b} className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="text-[#25D366] font-bold">✓</span> {b}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-40 h-40 rounded-3xl bg-green-50 border border-green-100 flex items-center justify-center text-7xl shadow-sm">
                    {f.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link
              href="/register"
              className="inline-block px-10 py-4 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold text-lg rounded-2xl transition-colors shadow-lg shadow-green-200"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
