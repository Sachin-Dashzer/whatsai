'use client';

import { useState, useEffect, useCallback } from 'react';
import TagBadge from '@/components/dashboard/TagBadge';

const STAGES = ['new', 'qualified', 'booked', 'converted', 'lost'];

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [filterStage, setFilterStage] = useState('');
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', phone: '', email: '' });

  const fetchContacts = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (filterTag) params.set('tag', filterTag);
    if (filterStage) params.set('stage', filterStage);
    const res = await fetch(`/api/contacts?${params}`);
    const data = await res.json();
    setContacts(data.contacts || []);
    setTotal(data.total || 0);
  }, [search, filterTag, filterStage]);

  useEffect(() => {
    const t = setTimeout(fetchContacts, 300);
    return () => clearTimeout(t);
  }, [fetchContacts]);

  async function addContact(e) {
    e.preventDefault();
    await fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(addForm),
    });
    setShowAdd(false);
    setAddForm({ name: '', phone: '', email: '' });
    fetchContacts();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Contacts</h2>
          <p className="text-slate-500 text-sm">{total.toLocaleString()} total contacts</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          + Add Contact
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or phone..."
          className="flex-1 min-w-48 px-4 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#25D366] text-sm shadow-sm"
        />
        <select
          value={filterStage}
          onChange={(e) => setFilterStage(e.target.value)}
          className="px-4 py-2 bg-white border border-slate-300 rounded-xl text-slate-700 focus:outline-none focus:border-[#25D366] text-sm shadow-sm"
        >
          <option value="">All stages</option>
          {STAGES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Contact grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {contacts.map((c) => (
          <button
            key={c._id}
            onClick={() => setSelected(c)}
            className="text-left bg-white border border-slate-200 rounded-xl p-4 hover:border-[#25D366]/30 hover:shadow-md transition-all shadow-sm"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-[#25D366] font-bold">
                  {(c.name || c.phone)[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-slate-900 text-sm">{c.name || 'Unknown'}</p>
                  <p className="text-slate-400 text-xs">{c.phone}</p>
                </div>
              </div>
              <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full capitalize">
                {c.stage || 'new'}
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {(c.tags || []).slice(0, 3).map((tag) => (
                <TagBadge key={tag} tag={tag} />
              ))}
              {(c.tags?.length || 0) > 3 && (
                <span className="text-xs text-slate-400">+{c.tags.length - 3}</span>
              )}
            </div>
            {c.lastMessageAt && (
              <p className="text-xs text-slate-400 mt-2">
                Last active {new Date(c.lastMessageAt).toLocaleDateString()}
              </p>
            )}
          </button>
        ))}
      </div>

      {contacts.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <div className="text-4xl mb-3">👥</div>
          <p>No contacts found</p>
        </div>
      )}

      {/* Contact detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />
          <div className="relative w-96 bg-white border-l border-slate-200 h-full overflow-y-auto p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-lg">Contact Details</h3>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-[#25D366] text-2xl mx-auto mb-2">
                {(selected.name || selected.phone)[0]?.toUpperCase()}
              </div>
              <h4 className="font-semibold text-slate-900">{selected.name || 'Unknown'}</h4>
              <p className="text-slate-500">{selected.phone}</p>
            </div>

            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Stage</p>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-sm capitalize">
                {selected.stage || 'new'}
              </span>
            </div>

            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {(selected.tags || []).map((tag) => (
                  <TagBadge key={tag} tag={tag} />
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">AI Handling</p>
              <span className={`text-sm font-medium ${selected.isAIHandled ? 'text-[#25D366]' : 'text-orange-600'}`}>
                {selected.isAIHandled ? '🤖 AI Active' : '👤 Human Agent'}
              </span>
            </div>

            <a
              href="/inbox"
              className="block w-full text-center py-2.5 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
            >
              Open Conversation
            </a>
          </div>
        </div>
      )}

      {/* Add contact modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAdd(false)} />
          <div className="relative bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="font-bold text-slate-900 text-lg mb-5">Add Contact</h3>
            <form onSubmit={addContact} className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={addForm.name}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#25D366] text-sm"
              />
              <input
                type="tel"
                placeholder="Phone (E.164: +919876543210)"
                required
                value={addForm.phone}
                onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#25D366] text-sm"
              />
              <input
                type="email"
                placeholder="Email (optional)"
                value={addForm.email}
                onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#25D366] text-sm"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl text-sm font-medium shadow-sm"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
