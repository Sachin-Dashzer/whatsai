import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { withDB } from '@/lib/mongodb';
import { verifySession } from '@/lib/dal';
import Message from '@/models/Message';
import Contact from '@/models/Contact';
import Conversation from '@/models/Conversation';
import Tenant from '@/models/Tenant';

export async function GET(req) {
  const session = await verifySession();
  await withDB();

  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get('days') || '30');
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const tenantId = session.tenantId;

  const [totalMessages, inboundMessages, aiMessages, totalContacts, tenant, stageBreakdown, tagBreakdown] =
    await Promise.all([
      Message.countDocuments({ tenantId, timestamp: { $gte: since } }),
      Message.countDocuments({ tenantId, direction: 'inbound', timestamp: { $gte: since } }),
      Message.countDocuments({ tenantId, sentBy: 'ai', timestamp: { $gte: since } }),
      Contact.countDocuments({ tenantId, createdAt: { $gte: since } }),
      Tenant.findById(tenantId).select('plan waConnected').lean(),
      Contact.aggregate([
        { $match: { tenantId: new mongoose.Types.ObjectId(tenantId) } },
        { $group: { _id: '$stage', count: { $sum: 1 } } },
      ]),
      Contact.aggregate([
        { $match: { tenantId: new mongoose.Types.ObjectId(tenantId) } },
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

  const dailyMessages = await Message.aggregate([
    { $match: { tenantId: new mongoose.Types.ObjectId(tenantId), timestamp: { $gte: since } } },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          direction: '$direction',
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.date': 1 } },
  ]);

  return NextResponse.json({
    totalMessages,
    inboundMessages,
    outboundMessages: totalMessages - inboundMessages,
    aiHandledPercent: totalMessages > 0 ? Math.round((aiMessages / totalMessages) * 100) : 0,
    newContacts: totalContacts,
    plan: tenant?.plan || 'free',
    waConnected: tenant?.waConnected || false,
    dailyMessages,
    stageBreakdown,
    tagBreakdown,
  });
}
