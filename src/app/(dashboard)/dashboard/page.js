import { verifySession } from '@/lib/dal';
import { withDB } from '@/lib/mongodb';
import StatsCard from '@/components/dashboard/StatsCard';
import Contact from '@/models/Contact';
import Message from '@/models/Message';
import Conversation from '@/models/Conversation';
import Tenant from '@/models/Tenant';
import Link from 'next/link';

function QuickAction({ href, label, icon, desc, color }) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-4 p-4 bg-white border border-slate-100 rounded-2xl hover:border-slate-200 hover:shadow-md transition-all duration-200"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${color} group-hover:scale-110 transition-transform duration-200`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-800 leading-tight">{label}</p>
        <p className="text-xs text-slate-400 mt-0.5 leading-tight">{desc}</p>
      </div>
    </Link>
  );
}

export default async function DashboardPage() {
  const session = await verifySession();
  await withDB();

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const tid = session.tenantId;

  const [totalContacts, newContacts, totalMessages, aiMessages, openConversations, resolvedThisMonth, tenant] =
    await Promise.all([
      Contact.countDocuments({ tenantId: tid }),
      Contact.countDocuments({ tenantId: tid, createdAt: { $gte: since } }),
      Message.countDocuments({ tenantId: tid, timestamp: { $gte: since } }),
      Message.countDocuments({ tenantId: tid, sentBy: 'ai', timestamp: { $gte: since } }),
      Conversation.countDocuments({ tenantId: tid, status: { $ne: 'resolved' } }),
      Conversation.countDocuments({ tenantId: tid, status: 'resolved', updatedAt: { $gte: since } }),
      Tenant.findById(tid).lean(),
    ]);

  const aiPercent = totalMessages > 0 ? Math.round((aiMessages / totalMessages) * 100) : 0;
  const waConnected = !!(tenant?.wabaId && tenant?.phoneNumberId);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative bg-[#0f172a] rounded-2xl p-6 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, #25D366 0%, transparent 60%)' }} />
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <p className="text-slate-400 text-sm mb-1">{greeting} 👋</p>
            <h2 className="text-2xl font-bold text-white leading-tight">Your workspace overview</h2>
            <p className="text-slate-400 text-sm mt-1">Last 30 days · {new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${waConnected ? 'bg-[#25D366]/20 text-[#25D366]' : 'bg-amber-500/20 text-amber-400'}`}>
              <span className={`w-2 h-2 rounded-full ${waConnected ? 'bg-[#25D366] animate-pulse' : 'bg-amber-400'}`} />
              {waConnected ? 'WhatsApp Live' : 'Not Connected'}
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Contacts" value={totalContacts.toLocaleString()} icon="👥" color="green" />
        <StatsCard title="New This Month" value={newContacts.toLocaleString()} icon="✨" color="blue" />
        <StatsCard title="Messages (30d)" value={totalMessages.toLocaleString()} icon="💬" color="purple" />
        <StatsCard title="AI Handled" value={`${aiPercent}%`} icon="🤖" color="orange" />
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Open conversations */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-slate-900">Conversation Pipeline</h3>
            <Link href="/inbox" className="text-xs font-semibold text-[#25D366] hover:underline">View inbox →</Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Open', value: openConversations, color: 'bg-blue-50 text-blue-700 border-blue-100', dot: 'bg-blue-500' },
              { label: 'Resolved', value: resolvedThisMonth, color: 'bg-green-50 text-green-700 border-green-100', dot: 'bg-[#25D366]' },
              { label: 'AI Messages', value: aiMessages, color: 'bg-violet-50 text-violet-700 border-violet-100', dot: 'bg-violet-500' },
            ].map((item) => (
              <div key={item.label} className={`rounded-xl border p-4 ${item.color}`}>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className={`w-2 h-2 rounded-full ${item.dot}`} />
                  <span className="text-xs font-semibold uppercase tracking-wide opacity-70">{item.label}</span>
                </div>
                <p className="text-3xl font-bold leading-none">{item.value.toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>Resolution rate this month</span>
              <span className="font-semibold text-slate-600">
                {openConversations + resolvedThisMonth > 0
                  ? Math.round((resolvedThisMonth / (openConversations + resolvedThisMonth)) * 100)
                  : 0}%
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-2 bg-[#25D366] rounded-full"
                style={{
                  width: `${openConversations + resolvedThisMonth > 0
                    ? Math.round((resolvedThisMonth / (openConversations + resolvedThisMonth)) * 100)
                    : 0}%`
                }}
              />
            </div>
          </div>
        </div>

        {/* WhatsApp status */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900">WhatsApp</h3>
            <span className="text-xs text-slate-400 capitalize px-2.5 py-1 bg-slate-100 rounded-full font-medium">
              {tenant?.plan || 'free'}
            </span>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${waConnected ? 'bg-green-50' : 'bg-slate-100'}`}>
              <span className="text-2xl">{waConnected ? '✅' : '🔌'}</span>
            </div>
            <p className={`font-bold text-lg ${waConnected ? 'text-slate-900' : 'text-slate-400'}`}>
              {waConnected ? 'Connected' : 'Not Connected'}
            </p>
            {waConnected ? (
              <p className="text-slate-500 text-xs mt-1">{tenant?.verifiedName || 'WhatsApp Business'}</p>
            ) : (
              <p className="text-slate-400 text-xs mt-1 max-w-35">Link your number to start messaging</p>
            )}
          </div>

          <Link
            href="/integrations/whatsapp"
            className={`block text-center text-sm font-semibold py-2.5 rounded-xl transition-colors ${
              waConnected
                ? 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                : 'bg-[#25D366] hover:bg-[#128C7E] text-white shadow-sm'
            }`}
          >
            {waConnected ? 'Manage connection' : 'Connect WhatsApp →'}
          </Link>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="font-bold text-slate-900 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <QuickAction href="/ai-agent" label="AI Agent" desc="Configure responses" icon="🤖" color="bg-violet-50 text-violet-600" />
          <QuickAction href="/broadcasts" label="New Broadcast" desc="Reach your contacts" icon="📢" color="bg-orange-50 text-orange-600" />
          <QuickAction href="/contacts" label="Contacts" desc="Manage your audience" icon="👥" color="bg-blue-50 text-blue-600" />
          <QuickAction href="/analytics" label="Analytics" desc="View performance" icon="📊" color="bg-emerald-50 text-emerald-600" />
        </div>
      </div>
    </div>
  );
}
