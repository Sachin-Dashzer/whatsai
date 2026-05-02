import { NextResponse } from 'next/server';
import { withDB } from '@/lib/mongodb';
import { verifySession } from '@/lib/dal';
import Message from '@/models/Message';
import Conversation from '@/models/Conversation';

export async function GET(req, { params }) {
  const session = await verifySession();
  await withDB();
  const { id } = await params;

  const conversation = await Conversation.findOne({ _id: id, tenantId: session.tenantId });
  if (!conversation) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const messages = await Message.find({ conversationId: id })
    .sort({ timestamp: 1 })
    .lean();

  await Conversation.findByIdAndUpdate(id, { unreadCount: 0 });

  return NextResponse.json({ messages });
}
