import { NextResponse } from 'next/server';
import { withDB } from '@/lib/mongodb';
import { verifySession } from '@/lib/dal';
import { sendTextMessage } from '@/lib/whatsapp';
import Tenant from '@/models/Tenant';
import Contact from '@/models/Contact';
import Conversation from '@/models/Conversation';
import Message from '@/models/Message';

export async function POST(req) {
  const session = await verifySession();
  await withDB();

  const { contactId, text } = await req.json();
  if (!contactId || !text) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const tenant = await Tenant.findById(session.tenantId);
  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

  const contact = await Contact.findOne({ _id: contactId, tenantId: session.tenantId });
  if (!contact) return NextResponse.json({ error: 'Contact not found' }, { status: 404 });

  const result = await sendTextMessage(tenant.phoneNumberId, contact.phone, text, tenant.accessToken);

  let conversation = await Conversation.findOne({
    tenantId: session.tenantId,
    contactId: contact._id,
    status: { $ne: 'resolved' },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      tenantId: session.tenantId,
      contactId: contact._id,
      status: 'human_takeover',
      lastMessage: text,
      lastMessageAt: new Date(),
    });
  } else {
    await Conversation.findByIdAndUpdate(conversation._id, {
      lastMessage: text,
      lastMessageAt: new Date(),
    });
  }

  const message = await Message.create({
    tenantId: session.tenantId,
    conversationId: conversation._id,
    contactId: contact._id,
    direction: 'outbound',
    content: text,
    sentBy: 'agent',
    status: 'sent',
  });

  return NextResponse.json({ message, waResult: result });
}
