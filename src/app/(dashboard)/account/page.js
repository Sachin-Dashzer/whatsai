'use client';

import { useState, useEffect } from 'react';

const AVATAR_COLORS = [
  'from-[#25D366] to-[#059669]', 'from-blue-500 to-blue-700',
  'from-violet-500 to-purple-700', 'from-orange-400 to-rose-500',
];

function avatarGrad(str) {
  let h = 0;
  for (const c of (str || '?')) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

const ROLE_STYLES = {
  owner: 'bg-violet-50 text-violet-700 border border-violet-100',
  admin: 'bg-blue-50 text-blue-700 border border-blue-100',
  agent: 'bg-slate-100 text-slate-600',
};

function SectionCard({ title, icon, children }) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-base shrink-0">{icon}</div>
        <h3 className="font-semibold text-slate-900 text-sm">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export default function AccountPage() {
  const [user, setUser] = useState({ name: '', email: '', role: '' });
  const [nameForm, setNameForm] = useState('');
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [savingName, setSavingName] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [nameMsg, setNameMsg] = useState('');
  const [pwMsg, setPwMsg] = useState('');

  useEffect(() => {
    fetch('/api/account').then((r) => r.json()).then((d) => {
      setUser(d);
      setNameForm(d.name || '');
    });
  }, []);

  async function saveName(e) {
    e.preventDefault();
    setSavingName(true);
    setNameMsg('');
    const res = await fetch('/api/account', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: nameForm }),
    });
    const data = await res.json();
    setSavingName(false);
    if (!data.error) setUser((u) => ({ ...u, name: nameForm }));
    setNameMsg(data.error || 'Name updated successfully');
    setTimeout(() => setNameMsg(''), 3000);
  }

  async function savePassword(e) {
    e.preventDefault();
    setPwMsg('');
    if (pwForm.newPw !== pwForm.confirm) { setPwMsg('Passwords do not match'); return; }
    setSavingPw(true);
    const res = await fetch('/api/account', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.newPw }),
    });
    const data = await res.json();
    setSavingPw(false);
    if (data.error) {
      setPwMsg(data.error);
    } else {
      setPwMsg('Password changed successfully');
      setPwForm({ current: '', newPw: '', confirm: '' });
      setTimeout(() => setPwMsg(''), 3000);
    }
  }

  const inputCls = 'w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#25D366] focus:bg-white text-sm transition-colors';
  const ch = (user.name || user.email || 'U')[0].toUpperCase();

  return (
    <div className="max-w-lg space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Account</h2>
        <p className="text-slate-500 text-sm mt-0.5">Manage your profile and password</p>
      </div>

      {/* Profile hero */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="h-16 bg-linear-to-br from-[#0f172a] to-[#1e293b]" />
        <div className="px-5 pb-5">
          <div className={`w-16 h-16 rounded-2xl bg-linear-to-br ${avatarGrad(user.name || user.email)} flex items-center justify-center text-white text-2xl font-bold shadow-lg -mt-8 mb-3 border-2 border-white`}>
            {ch}
          </div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-bold text-slate-900 text-lg leading-tight">{user.name || 'No name set'}</p>
              <p className="text-slate-500 text-sm">{user.email}</p>
            </div>
            <span className={`mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${ROLE_STYLES[user.role] || ROLE_STYLES.agent}`}>
              {user.role}
            </span>
          </div>
        </div>
      </div>

      {/* Update name */}
      <SectionCard title="Display Name" icon="✏️">
        <form onSubmit={saveName} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
            <input type="text" value={nameForm} onChange={(e) => setNameForm(e.target.value)} placeholder="Your name" className={inputCls} />
          </div>
          {nameMsg && (
            <p className={`text-sm font-semibold ${nameMsg.includes('success') ? 'text-emerald-600' : 'text-red-500'}`}>{nameMsg}</p>
          )}
          <button type="submit" disabled={savingName} className="px-5 py-2.5 bg-[#25D366] hover:bg-[#128C7E] disabled:opacity-60 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors">
            {savingName ? 'Saving…' : 'Update Name'}
          </button>
        </form>
      </SectionCard>

      {/* Change password */}
      <SectionCard title="Change Password" icon="🔐">
        <form onSubmit={savePassword} className="space-y-4">
          {[
            { key: 'current', label: 'Current Password', placeholder: 'Enter current password' },
            { key: 'newPw',   label: 'New Password',     placeholder: 'Min. 8 characters' },
            { key: 'confirm', label: 'Confirm Password', placeholder: 'Repeat new password' },
          ].map((f) => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{f.label}</label>
              <input
                type="password"
                value={pwForm[f.key]}
                onChange={(e) => setPwForm({ ...pwForm, [f.key]: e.target.value })}
                placeholder={f.placeholder}
                className={inputCls}
              />
            </div>
          ))}
          {pwMsg && (
            <p className={`text-sm font-semibold ${pwMsg.includes('success') ? 'text-emerald-600' : 'text-red-500'}`}>{pwMsg}</p>
          )}
          <button type="submit" disabled={savingPw} className="px-5 py-2.5 bg-[#25D366] hover:bg-[#128C7E] disabled:opacity-60 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors">
            {savingPw ? 'Changing…' : 'Change Password'}
          </button>
        </form>
      </SectionCard>

      {/* Danger zone */}
      <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
        <h3 className="font-bold text-red-600 mb-1">Danger Zone</h3>
        <p className="text-slate-500 text-sm mb-4 leading-relaxed">
          These actions are permanent and cannot be undone. Contact support if you need assistance.
        </p>
        <button className="px-4 py-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-semibold transition-colors">
          Delete Account
        </button>
      </div>
    </div>
  );
}
