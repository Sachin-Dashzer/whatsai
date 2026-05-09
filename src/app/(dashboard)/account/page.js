'use client';

import { useState, useEffect } from 'react';

const AVATAR_COLORS = [
  ['#25D366', '#059669'],
  ['#3B82F6', '#1D4ED8'],
  ['#8B5CF6', '#6D28D9'],
  ['#F97316', '#DC2626'],
];

function avatarGrad(str) {
  let h = 0;
  for (const c of (str || '?')) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

const ROLE_META = {
  owner:  { label: 'Owner',  bg: '#EDE9FE', color: '#6D28D9', dot: '#8B5CF6' },
  admin:  { label: 'Admin',  bg: '#DBEAFE', color: '#1D4ED8', dot: '#3B82F6' },
  agent:  { label: 'Agent',  bg: '#F1F5F9', color: '#475569', dot: '#94A3B8' },
};

function Input({ label, hint, ...props }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
      <input
        {...props}
        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#25D366]/30 focus:border-[#25D366] focus:bg-white text-sm transition-all"
      />
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

function Alert({ msg, isError }) {
  if (!msg) return null;
  return (
    <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium border ${
      isError
        ? 'bg-red-50 border-red-200 text-red-700'
        : 'bg-emerald-50 border-emerald-200 text-emerald-700'
    }`}>
      <span>{isError ? '✕' : '✓'}</span>
      {msg}
    </div>
  );
}

const TABS = ['Profile', 'Security'];

export default function AccountPage() {
  const [user, setUser] = useState({ name: '', email: '', role: '', createdAt: '' });
  const [nameForm, setNameForm] = useState('');
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [savingName, setSavingName] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [nameMsg, setNameMsg] = useState({ text: '', error: false });
  const [pwMsg, setPwMsg] = useState({ text: '', error: false });
  const [activeTab, setActiveTab] = useState('Profile');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    fetch('/api/account').then((r) => r.json()).then((d) => {
      setUser(d);
      setNameForm(d.name || '');
    });
  }, []);

  async function saveName(e) {
    e.preventDefault();
    setSavingName(true);
    setNameMsg({ text: '', error: false });
    const res = await fetch('/api/account', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: nameForm }),
    });
    const data = await res.json();
    setSavingName(false);
    if (!data.error) setUser((u) => ({ ...u, name: nameForm }));
    setNameMsg({ text: data.error || 'Name updated successfully', error: !!data.error });
    setTimeout(() => setNameMsg({ text: '', error: false }), 3500);
  }

  async function savePassword(e) {
    e.preventDefault();
    setPwMsg({ text: '', error: false });
    if (pwForm.newPw !== pwForm.confirm) {
      setPwMsg({ text: 'Passwords do not match', error: true });
      return;
    }
    if (pwForm.newPw.length < 8) {
      setPwMsg({ text: 'Password must be at least 8 characters', error: true });
      return;
    }
    setSavingPw(true);
    const res = await fetch('/api/account', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.newPw }),
    });
    const data = await res.json();
    setSavingPw(false);
    if (data.error) {
      setPwMsg({ text: data.error, error: true });
    } else {
      setPwMsg({ text: 'Password changed successfully', error: false });
      setPwForm({ current: '', newPw: '', confirm: '' });
      setTimeout(() => setPwMsg({ text: '', error: false }), 3500);
    }
  }

  const ch = (user.name || user.email || 'U')[0].toUpperCase();
  const [c1, c2] = avatarGrad(user.name || user.email);
  const roleMeta = ROLE_META[user.role] || ROLE_META.agent;
  const joined = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : '—';

  const pwStrength = (() => {
    const p = pwForm.newPw;
    if (!p) return null;
    if (p.length < 6) return { label: 'Weak', color: '#EF4444', width: '25%' };
    if (p.length < 10) return { label: 'Fair', color: '#F97316', width: '55%' };
    if (!/[A-Z]/.test(p) || !/[0-9]/.test(p)) return { label: 'Good', color: '#EAB308', width: '75%' };
    return { label: 'Strong', color: '#22C55E', width: '100%' };
  })();

  return (
    <div className="min-h-full">
      {/* Page header */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Account Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your profile, security, and personal preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">

        {/* ── Left: Profile card ── */}
        <div className="lg:sticky lg:top-6 space-y-4">
          {/* Avatar card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Cover band */}
            <div className="h-20" style={{ background: `linear-gradient(135deg, ${c1}22, ${c2}44)` }} />
            <div className="px-5 pb-5">
              {/* Avatar */}
              <div
                className="w-18 h-18 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg -mt-9 mb-4 border-4 border-white"
                style={{ background: `linear-gradient(135deg, ${c1}, ${c2})`, width: 72, height: 72 }}
              >
                {ch}
              </div>
              <div className="mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-slate-900 text-lg leading-tight">{user.name || 'No name set'}</p>
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                    style={{ background: roleMeta.bg, color: roleMeta.color }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: roleMeta.dot }} />
                    {roleMeta.label}
                  </span>
                </div>
                <p className="text-slate-500 text-sm mt-0.5 truncate">{user.email}</p>
              </div>
              {/* Stats row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-xs text-slate-400 font-medium">Joined</p>
                  <p className="text-xs font-bold text-slate-700 mt-0.5">{joined}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-xs text-slate-400 font-medium">Status</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <p className="text-xs font-bold text-emerald-700">Active</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Quick Links</p>
            <div className="space-y-1">
              {[
                { label: 'Team Members', href: '/team', icon: '👥' },
                { label: 'Billing & Plan', href: '/billing', icon: '💳' },
                { label: 'WhatsApp Setup', href: '/integrations/whatsapp', icon: '📱' },
              ].map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  <span>{l.icon}</span>
                  {l.label}
                  <svg className="w-3.5 h-3.5 ml-auto text-slate-300" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" d="M9 5l7 7-7 7" /></svg>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: Tabs + Forms ── */}
        <div className="space-y-5 min-w-0">
          {/* Tab bar */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === t
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Profile tab */}
          {activeTab === 'Profile' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-base">👤</div>
                <div>
                  <h3 className="font-semibold text-slate-900">Display Information</h3>
                  <p className="text-xs text-slate-400">How you appear across the workspace</p>
                </div>
              </div>
              <form onSubmit={saveName} className="p-6 space-y-5">
                <Input
                  label="Full Name"
                  type="text"
                  value={nameForm}
                  onChange={(e) => setNameForm(e.target.value)}
                  placeholder="Enter your full name"
                />
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Address</label>
                  <div className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 text-sm cursor-not-allowed select-none">
                    {user.email}
                  </div>
                  <p className="text-xs text-slate-400">Email cannot be changed. Contact support if needed.</p>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</label>
                  <div
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold border"
                    style={{ background: roleMeta.bg, color: roleMeta.color, borderColor: roleMeta.bg }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ background: roleMeta.dot }} />
                    {roleMeta.label}
                  </div>
                </div>
                <Alert msg={nameMsg.text} isError={nameMsg.error} />
                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={savingName}
                    className="px-6 py-2.5 bg-[#25D366] hover:bg-[#128C7E] disabled:opacity-60 text-white rounded-xl text-sm font-semibold shadow-sm transition-all flex items-center gap-2"
                  >
                    {savingName && (
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    )}
                    {savingName ? 'Saving…' : 'Update Profile'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Security tab */}
          {activeTab === 'Security' && (
            <>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-base">🔐</div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Change Password</h3>
                    <p className="text-xs text-slate-400">Use a strong password of at least 8 characters</p>
                  </div>
                </div>
                <form onSubmit={savePassword} className="p-6 space-y-5">
                  {/* Current password */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Password</label>
                    <div className="relative">
                      <input
                        type={showCurrent ? 'text' : 'password'}
                        value={pwForm.current}
                        onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
                        placeholder="Enter current password"
                        className="w-full px-4 py-3 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#25D366]/30 focus:border-[#25D366] focus:bg-white text-sm transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrent((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-medium"
                      >
                        {showCurrent ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>

                  {/* New password */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">New Password</label>
                    <div className="relative">
                      <input
                        type={showNew ? 'text' : 'password'}
                        value={pwForm.newPw}
                        onChange={(e) => setPwForm({ ...pwForm, newPw: e.target.value })}
                        placeholder="Min. 8 characters"
                        className="w-full px-4 py-3 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#25D366]/30 focus:border-[#25D366] focus:bg-white text-sm transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-medium"
                      >
                        {showNew ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    {/* Strength bar */}
                    {pwStrength && (
                      <div className="space-y-1">
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{ width: pwStrength.width, background: pwStrength.color }}
                          />
                        </div>
                        <p className="text-xs font-medium" style={{ color: pwStrength.color }}>
                          {pwStrength.label} password
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Confirm */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Confirm New Password</label>
                    <input
                      type="password"
                      value={pwForm.confirm}
                      onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                      placeholder="Repeat new password"
                      className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#25D366]/30 focus:bg-white text-sm transition-all ${
                        pwForm.confirm && pwForm.newPw !== pwForm.confirm
                          ? 'border-red-300 focus:border-red-400'
                          : 'border-slate-200 focus:border-[#25D366]'
                      }`}
                    />
                    {pwForm.confirm && pwForm.newPw !== pwForm.confirm && (
                      <p className="text-xs text-red-500">Passwords don't match</p>
                    )}
                  </div>

                  <Alert msg={pwMsg.text} isError={pwMsg.error} />

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={savingPw}
                      className="px-6 py-2.5 bg-[#25D366] hover:bg-[#128C7E] disabled:opacity-60 text-white rounded-xl text-sm font-semibold shadow-sm transition-all flex items-center gap-2"
                    >
                      {savingPw && (
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      )}
                      {savingPw ? 'Changing…' : 'Change Password'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Danger zone */}
              <div className="rounded-2xl border border-red-200 bg-red-50/50 overflow-hidden">
                <div className="px-6 py-4 border-b border-red-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-red-700">Danger Zone</h3>
                    <p className="text-xs text-red-400">Irreversible actions — proceed with caution</p>
                  </div>
                </div>
                <div className="p-6 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Delete Account</p>
                    <p className="text-xs text-slate-500 mt-0.5">Permanently removes your account and all associated data. This cannot be undone.</p>
                  </div>
                  <button className="shrink-0 px-4 py-2.5 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-semibold transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
