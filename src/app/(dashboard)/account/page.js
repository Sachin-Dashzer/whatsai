'use client';

import { useState, useEffect } from 'react';

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
    setNameMsg(data.error || 'Name updated successfully');
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
    if (data.error) { setPwMsg(data.error); } else {
      setPwMsg('Password changed successfully');
      setPwForm({ current: '', newPw: '', confirm: '' });
    }
  }

  const inputCls = "w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#25D366] focus:bg-white text-sm transition-colors";
  const cardCls = "bg-white border border-slate-200 rounded-xl p-6 shadow-sm";

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Account</h2>
        <p className="text-slate-500 text-sm">Manage your profile and password</p>
      </div>

      {/* Profile */}
      <div className={cardCls}>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-[#25D366] text-xl font-bold">
            {(user.name || user.email || 'U')[0].toUpperCase()}
          </div>
          <div>
            <p className="text-slate-900 font-semibold">{user.name || 'No name set'}</p>
            <p className="text-slate-500 text-sm">{user.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-[#25D366] rounded-full text-xs font-medium capitalize">
              {user.role}
            </span>
          </div>
        </div>

        <form onSubmit={saveName} className="space-y-4">
          <h3 className="font-semibold text-slate-900 text-sm border-t border-slate-100 pt-4">Update Name</h3>
          <div>
            <label className="block text-sm text-slate-600 mb-1.5">Display Name</label>
            <input type="text" value={nameForm} onChange={(e) => setNameForm(e.target.value)} className={inputCls} />
          </div>
          {nameMsg && (
            <p className={`text-sm font-medium ${nameMsg.includes('success') ? 'text-green-600' : 'text-red-500'}`}>{nameMsg}</p>
          )}
          <button type="submit" disabled={savingName} className="px-5 py-2.5 bg-[#25D366] hover:bg-[#128C7E] disabled:opacity-60 text-white rounded-xl text-sm font-medium shadow-sm">
            {savingName ? 'Saving...' : 'Update Name'}
          </button>
        </form>
      </div>

      {/* Password */}
      <div className={cardCls}>
        <h3 className="font-semibold text-slate-900 mb-4">Change Password</h3>
        <form onSubmit={savePassword} className="space-y-4">
          {[
            { key: 'current', label: 'Current Password', placeholder: '••••••••' },
            { key: 'newPw', label: 'New Password', placeholder: 'Min. 8 characters' },
            { key: 'confirm', label: 'Confirm New Password', placeholder: '••••••••' },
          ].map((f) => (
            <div key={f.key}>
              <label className="block text-sm text-slate-600 mb-1.5">{f.label}</label>
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
            <p className={`text-sm font-medium ${pwMsg.includes('success') ? 'text-green-600' : 'text-red-500'}`}>{pwMsg}</p>
          )}
          <button type="submit" disabled={savingPw} className="px-5 py-2.5 bg-[#25D366] hover:bg-[#128C7E] disabled:opacity-60 text-white rounded-xl text-sm font-medium shadow-sm">
            {savingPw ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>

      {/* Danger zone */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-5">
        <h3 className="font-semibold text-red-600 mb-2">Danger Zone</h3>
        <p className="text-slate-500 text-sm mb-4">These actions are irreversible. Contact support if you need help.</p>
        <button className="px-4 py-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm transition-colors font-medium">
          Delete Account
        </button>
      </div>
    </div>
  );
}
