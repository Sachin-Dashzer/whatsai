'use client';

import { useState, useEffect } from 'react';

const ROLE_STYLES = {
  owner: 'bg-violet-50 text-violet-700 border border-violet-100',
  admin: 'bg-blue-50 text-blue-700 border border-blue-100',
  agent: 'bg-slate-100 text-slate-600 border border-slate-200',
};

const AVATAR_COLORS = [
  'from-[#25D366] to-[#059669]', 'from-blue-500 to-blue-700',
  'from-violet-500 to-purple-700', 'from-orange-400 to-rose-500',
  'from-amber-400 to-orange-500', 'from-cyan-500 to-blue-600',
];

function avatarGrad(str) {
  let h = 0;
  for (const c of (str || '?')) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function Avatar({ name, email }) {
  const ch = (name || email || '?')[0].toUpperCase();
  return (
    <div className={`w-9 h-9 rounded-full bg-linear-to-br ${avatarGrad(name || email)} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
      {ch}
    </div>
  );
}

function CloseIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function TeamPage() {
  const [members, setMembers] = useState([]);
  const [showInvite, setShowInvite] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'agent' });
  const [inviting, setInviting] = useState(false);
  const [newMember, setNewMember] = useState(null);

  useEffect(() => {
    fetch('/api/team').then((r) => r.json()).then((d) => setMembers(d.members || []));
  }, []);

  async function invite(e) {
    e.preventDefault();
    setInviting(true);
    const res = await fetch('/api/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setInviting(false);
    if (data.error) { alert(data.error); return; }
    setNewMember(data);
    setShowInvite(false);
    setForm({ name: '', email: '', role: 'agent' });
    fetch('/api/team').then((r) => r.json()).then((d) => setMembers(d.members || []));
  }

  async function removeMember(userId) {
    if (!confirm('Remove this team member?')) return;
    await fetch('/api/team', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    setMembers(members.filter((m) => m._id !== userId));
  }

  const inputCls = 'w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#25D366] focus:bg-white text-sm transition-colors';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Team</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            {members.length} member{members.length !== 1 ? 's' : ''} in your workspace
          </p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
        >
          <span className="text-base leading-none">+</span> Invite Member
        </button>
      </div>

      {/* New member credentials banner */}
      {newMember && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="font-bold text-emerald-800 mb-1">Team member added!</p>
              <p className="text-slate-600 text-sm mb-3">
                Share these temporary credentials with <span className="font-semibold">{newMember.member.email}</span>:
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-3 bg-white border border-emerald-100 rounded-xl px-4 py-2.5">
                  <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider w-20">Email</span>
                  <span className="font-mono text-sm text-slate-900">{newMember.member.email}</span>
                </div>
                <div className="flex items-center gap-3 bg-white border border-emerald-100 rounded-xl px-4 py-2.5">
                  <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider w-20">Password</span>
                  <span className="font-mono text-sm text-amber-700 font-bold">{newMember.tempPassword}</span>
                </div>
              </div>
              <p className="text-slate-500 text-xs mt-3">Ask them to change their password after first login.</p>
            </div>
            <button onClick={() => setNewMember(null)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white/60 transition-colors ml-3">
              <CloseIcon />
            </button>
          </div>
        </div>
      )}

      {/* Member table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Member</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Role</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Joined</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Status</th>
              <th className="px-5 py-3.5 w-16" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {members.map((member) => (
              <tr key={member._id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={member.name} email={member.email} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{member.name || '—'}</p>
                      <p className="text-xs text-slate-400 truncate">{member.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 hidden sm:table-cell">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${ROLE_STYLES[member.role] || ROLE_STYLES.agent}`}>
                    {member.role}
                  </span>
                </td>
                <td className="px-5 py-4 hidden md:table-cell">
                  <span className="text-sm text-slate-500">
                    {new Date(member.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                  </span>
                </td>
                <td className="px-5 py-4 hidden sm:table-cell">
                  <span className={`flex items-center gap-1.5 text-xs font-medium ${member.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${member.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    {member.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  {member.role !== 'owner' && (
                    <button
                      onClick={() => removeMember(member._id)}
                      className="text-xs text-slate-300 group-hover:text-red-400 hover:text-red-500 transition-colors font-semibold"
                    >
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {members.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl mb-3">👤</div>
            <p className="text-slate-500 text-sm">No team members yet</p>
          </div>
        )}
      </div>

      {/* Invite modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={() => setShowInvite(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg">Invite Team Member</h3>
              <button onClick={() => setShowInvite(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                <CloseIcon />
              </button>
            </div>
            <form onSubmit={invite} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                <input type="text" placeholder="Jane Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address <span className="text-red-400">*</span></label>
                <input type="email" required placeholder="agent@yourcompany.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={inputCls}>
                  <option value="agent">Agent — view & reply to conversations</option>
                  <option value="admin">Admin — manage contacts, broadcasts & settings</option>
                </select>
              </div>
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <span className="text-sm shrink-0">🔑</span>
                <p className="text-xs text-amber-700">A temporary password will be generated. Share it with the member after they join.</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowInvite(false)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={inviting} className="flex-1 py-2.5 bg-[#25D366] hover:bg-[#128C7E] disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm">
                  {inviting ? 'Inviting…' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
