'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { register } from '@/actions/auth';

export default function RegisterPage() {
  const [state, action, pending] = useActionState(register, undefined);

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[#25D366] rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm">W</div>
          <span className="font-bold text-slate-900 text-2xl">WaBot.ai</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Start for free</h1>
        <p className="text-slate-500 mt-1">Set up your WhatsApp AI workspace</p>
      </div>

      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-lg">
        {state?.error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {state.error}
          </div>
        )}

        <form action={action} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Business name</label>
            <input
              type="text"
              name="businessName"
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#25D366] focus:bg-white transition-colors"
              placeholder="Acme Corp"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Your name</label>
            <input
              type="text"
              name="name"
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#25D366] focus:bg-white transition-colors"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Work email</label>
            <input
              type="email"
              name="email"
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#25D366] focus:bg-white transition-colors"
              placeholder="you@company.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
            <input
              type="password"
              name="password"
              required
              minLength={8}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#25D366] focus:bg-white transition-colors"
              placeholder="Min. 8 characters"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full py-3 bg-[#25D366] hover:bg-[#128C7E] disabled:opacity-60 text-white font-semibold rounded-xl transition-colors shadow-sm"
          >
            {pending ? 'Creating account...' : 'Create free account'}
          </button>
        </form>

        <p className="text-center text-slate-500 text-sm mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-[#25D366] hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
