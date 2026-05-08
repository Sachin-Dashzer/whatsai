import { NextResponse } from 'next/server';
import { withDB } from '@/lib/mongodb';
import { verifySession } from '@/lib/dal';
import { sendTextMessage } from '@/lib/whatsapp';
import { normalizePhone } from '@/lib/utils';
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
  if (!tenant.waConnected) return NextResponse.json({ error: 'WhatsApp is not connected. Please connect in Integrations.' }, { status: 400 });

  const contact = await Contact.findOne({ _id: contactId, tenantId: session.tenantId });
  if (!contact) return NextResponse.json({ error: 'Contact not found' }, { status: 404 });

  let normalizedPhone;
  try {
    normalizedPhone = normalizePhone(contact.phone);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
  const result = await sendTextMessage(tenant.phoneNumberId, normalizedPhone, text, tenant.accessToken);

  if (result.error) {
    const code = result.error.code;
    const subcode = result.error.error_subcode;
    if (code === 131026 || subcode === 2388001) {
      return NextResponse.json(
        { error: 'Cannot send a text message — this contact has not messaged you in the last 24 hours. Use the New Chat button with a template instead.' },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: result.error.message || 'Meta rejected the message' }, { status: 400 });
  }

  const waMessageId = result.messages?.[0]?.id;

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
    waMessageId,
    direction: 'outbound',
    content: text,
    sentBy: 'agent',
    status: 'sent',
  });

  return NextResponse.json({ message, waResult: result });
}
