import { NextResponse } from 'next/server';
import { withDB } from '@/lib/mongodb';
import { verifySession } from '@/lib/dal';
import Conversation from '@/models/Conversation';

export async function GET(req) {
  const session = await verifySession();
  await withDB();

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 30;

  const query = { tenantId: session.tenantId };
  if (status && status !== 'all') query.status = status;

  const total = await Conversation.countDocuments(query);
  const conversations = await Conversation.find(query)
    .sort({ lastMessageAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('contactId', 'name phone tags stage')
    .lean();

  return NextResponse.json({ conversations, total, page, pages: Math.ceil(total / limit) });
}
