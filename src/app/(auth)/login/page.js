'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { login } from '@/actions/auth';

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[#25D366] rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm">W</div>
          <span className="font-bold text-slate-900 text-2xl">WaBot.ai</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
        <p className="text-slate-500 mt-1">Sign in to your workspace</p>
      </div>

      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-lg">
        {state?.error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {state.error}
          </div>
        )}

        <form action={action} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
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
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#25D366] focus:bg-white transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full py-3 bg-[#25D366] hover:bg-[#128C7E] disabled:opacity-60 text-white font-semibold rounded-xl transition-colors shadow-sm"
          >
            {pending ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-slate-500 text-sm mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-[#25D366] hover:underline font-medium">
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}
