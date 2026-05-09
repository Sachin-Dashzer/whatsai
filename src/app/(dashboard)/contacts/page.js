'use client';

import { useState, useEffect, useCallback } from 'react';
import TagBadge from '@/components/dashboard/TagBadge';

const STAGES = ['new', 'qualified', 'booked', 'converted', 'lost'];

const STAGE_COLORS = {
  new:       'bg-slate-100 text-slate-600',
  qualified: 'bg-blue-50 text-blue-700',
  booked:    'bg-violet-50 text-violet-700',
  converted: 'bg-emerald-50 text-emerald-700',
  lost:      'bg-red-50 text-red-500',
};

const AVATAR_COLORS = [
  'from-[#25D366] to-[#059669]',
  'from-blue-500 to-blue-700',
  'from-violet-500 to-purple-700',
  'from-orange-400 to-rose-500',
  'from-amber-400 to-orange-500',
  'from-cyan-500 to-blue-600',
  'from-pink-500 to-rose-600',
  'from-teal-500 to-emerald-600',
];

function avatarGradient(str) {
  let h = 0;
  for (const c of (str || '?')) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function Avatar({ name, phone, size = 'md' }) {
  const ch = (name || phone || '?')[0].toUpperCase();
  const grad = avatarGradient(name || phone);
  const dim = size === 'lg' ? 'w-14 h-14 text-2xl' : 'w-9 h-9 text-sm';
  return (
    <div className={`${dim} rounded-full bg-linear-to-br ${grad} flex items-center justify-center text-white font-bold shrink-0`}>
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

function SearchIcon() {
  return (
    <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [filterStage, setFilterStage] = useState('');
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', phone: '', email: '' });
  const [adding, setAdding] = useState(false);

  const fetchContacts = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (filterStage) params.set('stage', filterStage);
    const res = await fetch(`/api/contacts?${params}`);
    const data = await res.json();
    setContacts(data.contacts || []);
    setTotal(data.total || 0);
  }, [search, filterStage]);

  useEffect(() => {
    const t = setTimeout(fetchContacts, 300);
    return () => clearTimeout(t);
  }, [fetchContacts]);

  async function addContact(e) {
    e.preventDefault();
    setAdding(true);
    await fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(addForm),
    });
    setAdding(false);
    setShowAdd(false);
    setAddForm({ name: '', phone: '', email: '' });
    fetchContacts();
  }

  const inputCls = 'w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#25D366] focus:bg-white text-sm transition-colors';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Contacts</h2>
          <p className="text-slate-500 text-sm mt-0.5">{total.toLocaleString()} total contacts</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
        >
          <span className="text-base leading-none">+</span> Add Contact
        </button>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2"><SearchIcon /></span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or phone…"
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#25D366] text-sm shadow-sm"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-0.5 -mx-3 sm:mx-0 px-3 sm:px-0 scrollbar-hide">
          {['', ...STAGES].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStage(s)}
              className={`shrink-0 px-3 py-1.5 rounded-xl text-sm font-medium border transition-colors ${
                filterStage === s
                  ? 'bg-[#25D366] text-white border-[#25D366]'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Contact list */}
      {contacts.length > 0 ? (
        <>
          {/* Mobile cards (< sm) */}
          <div className="sm:hidden space-y-2">
            {contacts.map((c) => (
              <button
                key={c._id}
                onClick={() => setSelected(c)}
                className="w-full text-left bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3 hover:border-slate-200 hover:shadow-md transition-all active:scale-[0.99]"
              >
                <Avatar name={c.name} phone={c.phone} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-slate-900 truncate">{c.name || 'Unknown'}</p>
                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${STAGE_COLORS[c.stage] || STAGE_COLORS.new}`}>
                      {c.stage || 'new'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate">{c.phone}</p>
                  {(c.tags?.length > 0) && (
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {c.tags.slice(0, 3).map((tag) => <TagBadge key={tag} tag={tag} />)}
                      {c.tags.length > 3 && <span className="text-xs text-slate-400">+{c.tags.length - 3}</span>}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className={`flex items-center gap-1 text-[10px] font-semibold ${c.isAIHandled ? 'text-emerald-600' : 'text-slate-400'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${c.isAIHandled ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    {c.isAIHandled ? 'AI' : 'Human'}
                  </span>
                  <svg className="w-4 h-4 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </button>
            ))}
          </div>

          {/* Desktop table (sm+) */}
          <div className="hidden sm:block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Stage</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Tags</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Last Active</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">AI</th>
                  <th className="px-5 py-3 w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contacts.map((c) => (
                  <tr
                    key={c._id}
                    onClick={() => setSelected(c)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={c.name} phone={c.phone} />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{c.name || 'Unknown'}</p>
                          <p className="text-xs text-slate-400 truncate">{c.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STAGE_COLORS[c.stage] || STAGE_COLORS.new}`}>
                        {c.stage || 'new'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <div className="flex gap-1 flex-wrap">
                        {(c.tags || []).slice(0, 2).map((tag) => <TagBadge key={tag} tag={tag} />)}
                        {(c.tags?.length || 0) > 2 && <span className="text-xs text-slate-400">+{c.tags.length - 2}</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <span className="text-xs text-slate-400">
                        {c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className={`flex items-center gap-1.5 text-xs font-medium ${c.isAIHandled ? 'text-[#25D366]' : 'text-slate-400'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${c.isAIHandled ? 'bg-[#25D366]' : 'bg-slate-300'}`} />
                        {c.isAIHandled ? 'AI' : 'Human'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <svg className="w-4 h-4 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl mb-4">👥</div>
          <p className="font-semibold text-slate-700 mb-1">No contacts found</p>
          <p className="text-slate-400 text-sm mb-5">{search || filterStage ? 'Try adjusting your filters' : 'Add your first contact to get started'}</p>
          {!search && !filterStage && (
            <button
              onClick={() => setShowAdd(true)}
              className="px-4 py-2 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl text-sm font-semibold transition-colors"
            >
              Add Contact
            </button>
          )}
        </div>
      )}

      {/* Contact detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-sm bg-white border-l border-slate-200 h-full overflow-y-auto shadow-2xl flex flex-col">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
              <h3 className="font-bold text-slate-900">Contact Details</h3>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                <CloseIcon />
              </button>
            </div>

            {/* Avatar + name */}
            <div className="flex flex-col items-center py-6 px-5 border-b border-slate-100">
              <Avatar name={selected.name} phone={selected.phone} size="lg" />
              <h4 className="mt-3 font-bold text-slate-900 text-lg">{selected.name || 'Unknown'}</h4>
              <p className="text-slate-500 text-sm">{selected.phone}</p>
              {selected.email && <p className="text-slate-400 text-xs mt-0.5">{selected.email}</p>}
            </div>

            {/* Details */}
            <div className="flex-1 p-5 space-y-5">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Stage</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium capitalize ${STAGE_COLORS[selected.stage] || STAGE_COLORS.new}`}>
                  {selected.stage || 'new'}
                </span>
              </div>

              {(selected.tags?.length > 0) && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Tags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.tags.map((tag) => <TagBadge key={tag} tag={tag} />)}
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Handling</p>
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium border ${selected.isAIHandled ? 'bg-green-50 text-green-700 border-green-100' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                  <span className={`w-2 h-2 rounded-full ${selected.isAIHandled ? 'bg-[#25D366]' : 'bg-slate-400'}`} />
                  {selected.isAIHandled ? 'AI Agent Active' : 'Human Agent'}
                </div>
              </div>

              {selected.lastMessageAt && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Last Active</p>
                  <p className="text-sm text-slate-600">{new Date(selected.lastMessageAt).toLocaleString('en-IN')}</p>
                </div>
              )}

              {selected.createdAt && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Added</p>
                  <p className="text-sm text-slate-600">{new Date(selected.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="p-5 border-t border-slate-100 shrink-0">
              <a
                href="/inbox"
                className="block w-full text-center py-3 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
              >
                Open Conversation →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Add contact modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={() => setShowAdd(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg">Add Contact</h3>
              <button onClick={() => setShowAdd(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                <CloseIcon />
              </button>
            </div>
            <form onSubmit={addContact} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                <input type="text" placeholder="e.g. Rahul Sharma" value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone <span className="text-red-400">*</span></label>
                <input type="tel" placeholder="+919876543210" required value={addForm.phone} onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })} className={inputCls} />
                <p className="text-xs text-slate-400 mt-1">Include country code (E.164 format)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email <span className="text-slate-400 text-xs">(optional)</span></label>
                <input type="email" placeholder="rahul@example.com" value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} className={inputCls} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={adding} className="flex-1 py-2.5 bg-[#25D366] hover:bg-[#128C7E] disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm">
                  {adding ? 'Adding…' : 'Add Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
