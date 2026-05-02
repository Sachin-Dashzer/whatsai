'use client';

import { usePathname } from 'next/navigation';

const titles = {
  '/dashboard': 'Overview',
  '/inbox': 'Live Inbox',
  '/contacts': 'Contacts',
  '/broadcasts': 'Broadcasts',
  '/ai-agent': 'AI Agent',
  '/templates': 'Templates',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
  '/billing': 'Billing',
};

export default function TopBar() {
  const pathname = usePathname();
  const title = Object.entries(titles).find(([path]) => pathname.startsWith(path))?.[1] || 'Dashboard';

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 shrink-0 shadow-sm">
      <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
      <div className="ml-auto flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-[#25D366] text-sm font-bold">
          A
        </div>
      </div>
    </header>
  );
}
