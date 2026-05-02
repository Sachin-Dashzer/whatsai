'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

function ChannelCard({ icon, name, description, href, connected, comingSoon }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <span className="text-3xl">{icon}</span>
        <div>
          <h3 className="font-semibold text-slate-900">{name}</h3>
          {connected && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              Connected
            </span>
          )}
        </div>
      </div>
      <p className="text-sm text-slate-500 flex-1">{description}</p>
      {comingSoon ? (
        <span className="inline-block text-center py-2.5 px-4 rounded-xl text-sm font-semibold bg-slate-100 text-slate-400 cursor-not-allowed">
          Coming Soon
        </span>
      ) : (
        <Link
          href={href}
          className="block text-center py-2.5 px-4 rounded-xl text-sm font-semibold bg-[#4F46E5] hover:bg-[#4338CA] text-white transition-colors"
        >
          {connected ? 'Manage' : 'Connect'}
        </Link>
      )}
    </div>
  );
}

export default function IntegrationsPage() {
  const [waConnected, setWaConnected] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => { if (d.waConnected) setWaConnected(true); });
  }, []);

  const channels = [
    {
      icon: '💬',
      name: 'WhatsApp',
      description: 'Connect your WhatsApp Business account to send and receive messages with your AI assistant.',
      href: '/integrations/whatsapp',
      connected: waConnected,
    },
    {
      icon: '📸',
      name: 'Instagram Messenger',
      description: 'Reply to Instagram DMs automatically with your AI agent.',
      href: '#',
      comingSoon: true,
    },
    {
      icon: '🌐',
      name: 'Website Widget',
      description: 'Embed a live chat widget on your website powered by your AI agent.',
      href: '#',
      comingSoon: true,
    },
  ];

  const integrations = [
    {
      icon: '🛍️',
      name: 'Shopify',
      description: 'Sync products and orders so your AI can answer customer questions about their purchases.',
      href: '#',
      comingSoon: true,
    },
    {
      icon: '📅',
      name: 'Calendly',
      description: 'Let your AI book appointments directly from WhatsApp using your Calendly availability.',
      href: '#',
      comingSoon: true,
    },
    {
      icon: '🗓️',
      name: 'Google Calendar',
      description: 'Sync your calendar so your AI can schedule and manage appointments automatically.',
      href: '#',
      comingSoon: true,
    },
  ];

  return (
    <div className="max-w-4xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Integrations</h1>
        <p className="text-slate-500 mt-1">Connect your messaging channels and tools to your AI agent.</p>
      </div>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-4">Messaging Channels</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {channels.map((c) => (
            <ChannelCard key={c.name} {...c} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-4">Data & Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations.map((i) => (
            <ChannelCard key={i.name} {...i} />
          ))}
        </div>
      </section>
    </div>
  );
}
