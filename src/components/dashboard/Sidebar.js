'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/actions/auth';

const navSections = [
  {
    items: [
      { href: '/dashboard', label: 'Overview', icon: '📊' },
      { href: '/inbox', label: 'Inbox', icon: '💬' },
      { href: '/contacts', label: 'Contacts', icon: '👥' },
      { href: '/broadcasts', label: 'Broadcasts', icon: '📢' },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { href: '/ai-agent', label: 'AI Agent', icon: '🤖' },
      { href: '/automation', label: 'Automation', icon: '⚡' },
      { href: '/templates', label: 'Templates', icon: '📄' },
      { href: '/analytics', label: 'Analytics', icon: '📈' },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { href: '/integrations', label: 'Integrations', icon: '🔌' },
      { href: '/webhooks', label: 'Webhooks', icon: '🔗' },
      { href: '/team', label: 'Team', icon: '👤' },
      { href: '/settings', label: 'Settings', icon: '⚙️' },
      { href: '/account', label: 'Account', icon: '🧑' },
      { href: '/billing', label: 'Billing', icon: '💳' },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 shadow-sm">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#25D366] rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
            W
          </div>
          <span className="font-bold text-slate-900 text-lg">WaBot.ai</span>
        </div>
      </div>

      <nav className="flex-1 p-3 overflow-y-auto space-y-4">
        {navSections.map((section, si) => (
          <div key={si}>
            {section.label && (
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? 'bg-green-50 text-[#25D366]'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-slate-100">
        <form action={logout}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          >
            <span className="text-base">🚪</span>
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
