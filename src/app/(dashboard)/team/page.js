'use client';

import { useState, useEffect } from 'react';

const ROLE_COLORS = {
  owner: 'bg-purple-50 text-purple-700 border border-purple-100',
  admin: 'bg-blue-50 text-blue-700 border border-blue-100',
  agent: 'bg-slate-100 text-slate-600',
};

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

  const inputCls = "w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#25D366] focus:bg-white text-sm transition-colors";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Team</h2>
          <p className="text-slate-500 text-sm">{members.length} member{members.length !== 1 ? 's' : ''} in your workspace</p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="px-4 py-2 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          + Invite Member
        </button>
      </div>

      {/* New member credentials */}
      {newMember && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-green-700 mb-1">✓ Team member added!</h3>
              <p className="text-slate-600 text-sm mb-3">Share these temporary credentials with <strong>{newMember.member.email}</strong>:</p>
              <div className="space-y-2 font-mono text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Email:</span>
                  <span className="text-slate-900">{newMember.member.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Temp Password:</span>
                  <span className="text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">{newMember.tempPassword}</span>
                </div>
              </div>
              <p className="text-slate-500 text-xs mt-3">They should change their password after first login.</p>
            </div>
            <button onClick={() => setNewMember(null)} className="text-slate-400 hover:text-slate-700 ml-4">✕</button>
          </div>
        </div>
      )}

      {/* Member list */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="px-5 py-3 text-left text-xs text-slate-500 font-semibold uppercase tracking-wider">Member</th>
              <th className="px-5 py-3 text-left text-xs text-slate-500 font-semibold uppercase tracking-wider">Role</th>
              <th className="px-5 py-3 text-left text-xs text-slate-500 font-semibold uppercase tracking-wider">Joined</th>
              <th className="px-5 py-3 text-left text-xs text-slate-500 font-semibold uppercase tracking-wider">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {members.map((member) => (
              <tr key={member._id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-[#25D366] text-sm font-bold">
                      {(member.name || member.email)[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-slate-900 text-sm font-medium">{member.name || '—'}</p>
                      <p className="text-slate-400 text-xs">{member.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${ROLE_COLORS[member.role]}`}>
                    {member.role}
                  </span>
                </td>
                <td className="px-5 py-4 text-slate-500 text-sm">
                  {new Date(member.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                </td>
                <td className="px-5 py-4">
                  <span className={`flex items-center gap-1.5 text-xs font-medium ${member.isActive ? 'text-green-600' : 'text-slate-400'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${member.isActive ? 'bg-green-500' : 'bg-slate-300'}`} />
                    {member.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-5 py-4">
                  {member.role !== 'owner' && (
                    <button onClick={() => removeMember(member._id)} className="text-xs text-slate-400 hover:text-red-500 transition-colors font-medium">
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invite modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowInvite(false)} />
          <div className="relative bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="font-bold text-slate-900 text-lg mb-5">Invite Team Member</h3>
            <form onSubmit={invite} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-600 mb-1.5">Full Name</label>
                <input type="text" placeholder="John Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1.5">Email Address</label>
                <input type="email" required placeholder="agent@yourcompany.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1.5">Role</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={inputCls}>
                  <option value="agent">Agent — Can view & reply to conversations</option>
                  <option value="admin">Admin — Can manage contacts, broadcasts & settings</option>
                </select>
              </div>
              <p className="text-slate-400 text-xs">A temporary password will be generated. Share it with the team member to let them log in.</p>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowInvite(false)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium">
                  Cancel
                </button>
                <button type="submit" disabled={inviting} className="flex-1 py-2.5 bg-[#25D366] disabled:opacity-60 text-white rounded-xl text-sm font-medium shadow-sm">
                  {inviting ? 'Inviting...' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
