'use client';

import { usePathname } from 'next/navigation';

const PAGE_META = {
  '/dashboard':   { title: 'Overview',      subtitle: 'Your workspace at a glance' },
  '/inbox':       { title: 'Inbox',         subtitle: 'Live conversations' },
  '/contacts':    { title: 'Contacts',      subtitle: 'Manage your audience' },
  '/broadcasts':  { title: 'Broadcasts',    subtitle: 'WhatsApp campaigns' },
  '/ai-agent':    { title: 'AI Agent',      subtitle: 'Configure your AI assistant' },
  '/automation':  { title: 'Automation',    subtitle: 'Workflow automation rules' },
  '/templates':   { title: 'Templates',     subtitle: 'Message templates' },
  '/analytics':   { title: 'Analytics',     subtitle: 'Performance metrics' },
  '/integrations':{ title: 'Integrations',  subtitle: 'Connected apps & channels' },
  '/webhooks':    { title: 'Webhooks',      subtitle: 'Event webhooks' },
  '/team':        { title: 'Team',          subtitle: 'Members & permissions' },
  '/settings':    { title: 'Settings',      subtitle: 'Workspace configuration' },
  '/account':     { title: 'Account',       subtitle: 'Your profile' },
  '/billing':     { title: 'Billing',       subtitle: 'Plan & usage' },
};

function MenuIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6"  x2="21" y2="6"  />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}

export default function TopBar({ onMenu }) {
  const pathname = usePathname();
  const meta = Object.entries(PAGE_META).find(([p]) => pathname.startsWith(p))?.[1]
    ?? { title: 'Dashboard', subtitle: '' };

  return (
    <header className="h-14 bg-white border-b border-slate-100 flex items-center px-4 sm:px-6 gap-3 shrink-0 z-10">
      {/* Hamburger — mobile/tablet only */}
      <button
        onClick={onMenu}
        className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        aria-label="Open navigation"
      >
        <MenuIcon />
      </button>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <h1 className="font-bold text-slate-900 text-base leading-tight truncate">{meta.title}</h1>
        <p className="text-xs text-slate-400 leading-tight hidden sm:block">{meta.subtitle}</p>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button className="relative p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
          <BellIcon />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#25D366] rounded-full" />
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-slate-100">
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#25D366] to-[#059669] flex items-center justify-center text-white text-xs font-bold shadow-sm select-none">
            A
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-slate-800 leading-tight">Admin</p>
            <p className="text-[10px] text-slate-400 leading-tight">Owner</p>
          </div>
        </div>
      </div>
    </header>
  );
}
