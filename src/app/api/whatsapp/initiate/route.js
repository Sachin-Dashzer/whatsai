import { NextResponse } from 'next/server';
import { withDB } from '@/lib/mongodb';
import { verifySession } from '@/lib/dal';
import { sendTemplateMessage } from '@/lib/whatsapp';
import Tenant from '@/models/Tenant';
import Contact from '@/models/Contact';
import Conversation from '@/models/Conversation';
import Message from '@/models/Message';

export async function POST(req) {
  const session = await verifySession();
  await withDB();

  const { contactId, templateName } = await req.json();
  if (!contactId || !templateName) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const tenant = await Tenant.findById(session.tenantId);
  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
  if (!tenant.waConnected) return NextResponse.json({ error: 'WhatsApp is not connected. Please connect in Integrations.' }, { status: 400 });

  const contact = await Contact.findOne({ _id: contactId, tenantId: session.tenantId });
  if (!contact) return NextResponse.json({ error: 'Contact not found' }, { status: 404 });

  const normalizedPhone = contact.phone.replace(/\D/g, '');
  if (normalizedPhone.length < 10) {
    return NextResponse.json(
      { error: 'Invalid phone number — please include the country code (e.g. 919876543210 for India).' },
      { status: 400 }
    );
  }

  const result = await sendTemplateMessage(
    tenant.phoneNumberId,
    normalizedPhone,
    templateName,
    'en',
    [],
    tenant.accessToken
  );

  if (result.error) {
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
      lastMessage: `[Template: ${templateName}]`,
      lastMessageAt: new Date(),
    });
  } else {
    await Conversation.findByIdAndUpdate(conversation._id, {
      lastMessage: `[Template: ${templateName}]`,
      lastMessageAt: new Date(),
    });
    conversation = await Conversation.findById(conversation._id);
  }

  await Message.create({
    tenantId: session.tenantId,
    conversationId: conversation._id,
    contactId: contact._id,
    waMessageId,
    direction: 'outbound',
    content: `[Template: ${templateName}]`,
    type: 'template',
    sentBy: 'agent',
    status: 'sent',
  });

  return NextResponse.json({ conversation, waResult: result });
}
