import { verifySession } from '@/lib/dal';
import { withDB } from '@/lib/mongodb';
import StatsCard from '@/components/dashboard/StatsCard';
import Contact from '@/models/Contact';
import Message from '@/models/Message';
import Conversation from '@/models/Conversation';
import Tenant from '@/models/Tenant';

export default async function DashboardPage() {
  const session = await verifySession();
  await withDB();

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const tid = session.tenantId;

  const [totalContacts, newContacts, totalMessages, aiMessages, openConversations, tenant] =
    await Promise.all([
      Contact.countDocuments({ tenantId: tid }),
      Contact.countDocuments({ tenantId: tid, createdAt: { $gte: since } }),
      Message.countDocuments({ tenantId: tid, timestamp: { $gte: since } }),
      Message.countDocuments({ tenantId: tid, sentBy: 'ai', timestamp: { $gte: since } }),
      Conversation.countDocuments({ tenantId: tid, status: { $ne: 'resolved' } }),
      Tenant.findById(tid).lean(),
    ]);

  const aiPercent = totalMessages > 0 ? Math.round((aiMessages / totalMessages) * 100) : 0;
  const waConnected = !!(tenant?.wabaId && tenant?.phoneNumberId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Good day 👋</h2>
        <p className="text-slate-500 text-sm mt-0.5">Here&apos;s what&apos;s happening with your WhatsApp workspace</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Contacts" value={totalContacts.toLocaleString()} icon="👥" color="green" />
        <StatsCard title="New This Month" value={newContacts.toLocaleString()} icon="✨" color="blue" />
        <StatsCard title="Messages (30d)" value={totalMessages.toLocaleString()} icon="💬" color="purple" />
        <StatsCard title="AI Handled" value={`${aiPercent}%`} icon="🤖" color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Open Conversations</h3>
          <div className="text-4xl font-bold text-slate-900">{openConversations}</div>
          <p className="text-slate-500 text-sm mt-1">Conversations awaiting response</p>
          <a href="/inbox" className="inline-block mt-4 text-sm text-[#25D366] hover:underline font-medium">
            View inbox →
          </a>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-700">WhatsApp Connection</h3>
            <span className="text-xs text-slate-400 capitalize px-2 py-0.5 bg-slate-100 rounded-full">{tenant?.plan || 'free'} plan</span>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-3 h-3 rounded-full ${waConnected ? 'bg-[#25D366] animate-pulse' : 'bg-slate-300'}`} />
            <span className={`text-lg font-semibold ${waConnected ? 'text-slate-900' : 'text-slate-400'}`}>
              {waConnected ? 'Connected' : 'Not connected'}
            </span>
          </div>
          {waConnected ? (
            <p className="text-slate-500 text-sm">{tenant?.verifiedName || 'WhatsApp Business'} · {tenant?.phoneNumberId}</p>
          ) : (
            <p className="text-slate-400 text-sm">Connect your WhatsApp Business number to start receiving messages</p>
          )}
          <a href="/settings" className="inline-block mt-4 text-sm text-[#25D366] hover:underline font-medium">
            {waConnected ? 'Manage connection →' : 'Connect WhatsApp →'}
          </a>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          {[
            { href: '/ai-agent', label: 'Configure AI Agent', icon: '🤖' },
            { href: '/broadcasts', label: 'New Broadcast', icon: '📢' },
            { href: '/contacts', label: 'View Contacts', icon: '👥' },
            { href: '/settings', label: 'Connect WhatsApp', icon: '🔌' },
          ].map((action) => (
            <a
              key={action.href}
              href={action.href}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm text-slate-600 hover:text-slate-900 transition-colors border border-slate-200"
            >
              <span>{action.icon}</span>
              {action.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
