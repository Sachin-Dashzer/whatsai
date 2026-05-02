'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#25D366] rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">W</div>
          <span className="font-bold text-slate-900 text-lg">WaBot.ai</span>
        </Link>

        <div className="hidden md:flex items-center gap-7">
          {[['#features', 'Features'], ['#how-it-works', 'How It Works'], ['/pricing', 'Pricing'], ['/developer', 'API Docs']].map(([href, label]) => (
            <a key={href} href={href} className="text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors">
              {label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/login" className="text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors px-4 py-2">
            Login
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 bg-[#25D366] hover:bg-[#128C7E] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
          >
            Get Started Free
          </Link>
        </div>

        <button className="md:hidden text-slate-500 hover:text-slate-900 p-1" onClick={() => setOpen(!open)}>
          {open ? '✕' : '☰'}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-1 shadow-lg">
          {[['#features', 'Features'], ['#how-it-works', 'How It Works'], ['/pricing', 'Pricing'], ['/developer', 'API Docs'], ['/login', 'Login']].map(([href, label]) => (
            <a key={href} href={href} className="block text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors" onClick={() => setOpen(false)}>
              {label}
            </a>
          ))}
          <div className="pt-2">
            <Link href="/register" className="block w-full text-center py-2.5 bg-[#25D366] text-white text-sm font-semibold rounded-xl">
              Get Started Free
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
