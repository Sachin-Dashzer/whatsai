import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { withDB } from '@/lib/mongodb';
import { processMessageWithAI } from '@/lib/ai-agent';
import { executeFlows } from '@/lib/flow-engine';
import { sendTextMessage, markMessageRead } from '@/lib/whatsapp';
import Tenant from '@/models/Tenant';
import Contact from '@/models/Contact';
import Conversation from '@/models/Conversation';
import Message from '@/models/Message';
import AIAgentConfig from '@/models/AIAgentConfig';
import WebhookEvent from '@/models/WebhookEvent';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }
  return new Response('Forbidden', { status: 403 });
}

export async function POST(req) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-hub-signature-256');

  if (!process.env.META_APP_SECRET) {
    console.error('CRITICAL: META_APP_SECRET is not set. Webhook is unprotected!');
    return new Response('Server configuration error', { status: 500 });
  }

  if (!signature) return new Response('Forbidden', { status: 403 });

  const expected = 'sha256=' + crypto
    .createHmac('sha256', process.env.META_APP_SECRET)
    .update(rawBody)
    .digest('hex');

  if (signature !== expected) {
    return new Response('Forbidden', { status: 403 });
  }

  let body;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ status: 'ok' });
  }

  if (body.object !== 'whatsapp_business_account') {
    return NextResponse.json({ status: 'ignored' });
  }

  try {
    await withDB();

    for (const entry of body.entry || []) {
      const wabaId = entry.id;
      const tenant = await Tenant.findOne({ wabaId });
      if (!tenant) continue;

      for (const change of entry.changes || []) {
        if (change.field !== 'messages') continue;
        const value = change.value;

        for (const msg of value.messages || []) {
          // Log all inbound events regardless of type
          await WebhookEvent.create({
            tenantId: tenant._id,
            eventType: `message.${msg.type}`,
            phone: msg.from,
            messageId: msg.id,
            payload: msg,
            status: 'processed',
          }).catch(() => {});

          const fromPhone = msg.from;
          const waMessageId = msg.id;

          await markMessageRead(tenant.phoneNumberId, waMessageId, tenant.accessToken);

          let contact = await Contact.findOne({ tenantId: tenant._id, phone: fromPhone });
          let isNewContact = false;
          if (!contact) {
            isNewContact = true;
            const senderProfile = value.contacts?.find((c) => c.wa_id === fromPhone);
            const senderName = senderProfile?.profile?.name || fromPhone;
            contact = await Contact.create({
              tenantId: tenant._id,
              phone: fromPhone,
              name: senderName,
              tags: ['new-lead'],
              aiContext: [],
            });
          }

          // Resolve message text for inbox display
          let messageText = '';
          const messageType = msg.type;

          if (msg.type === 'text') {
            messageText = msg.text.body;
          } else if (msg.type === 'image') {
            messageText = msg.image?.caption || '[Image]';
          } else if (msg.type === 'document') {
            messageText = msg.document?.filename ? `[Document: ${msg.document.filename}]` : '[Document]';
          } else if (msg.type === 'audio') {
            messageText = '[Audio message]';
          } else if (msg.type === 'video') {
            messageText = msg.video?.caption || '[Video]';
          } else if (msg.type === 'location') {
            messageText = `[Location: ${msg.location?.latitude}, ${msg.location?.longitude}]`;
          } else if (msg.type === 'sticker') {
            messageText = '[Sticker]';
          } else if (msg.type === 'interactive') {
            messageText = msg.interactive?.button_reply?.title || msg.interactive?.list_reply?.title || '[Interactive reply]';
          } else {
            messageText = `[${msg.type}]`;
          }

          let conversation = await Conversation.findOne({
            tenantId: tenant._id,
            contactId: contact._id,
            status: { $ne: 'resolved' },
          });
          if (!conversation) {
            conversation = await Conversation.create({
              tenantId: tenant._id,
              contactId: contact._id,
              status: msg.type === 'text' ? 'ai_active' : 'human_takeover',
              lastMessage: messageText,
              lastMessageAt: new Date(),
            });
          } else {
            await Conversation.findByIdAndUpdate(conversation._id, {
              lastMessage: messageText,
              lastMessageAt: new Date(),
              $inc: { unreadCount: 1 },
            });
          }

          const validTypes = ['text', 'image', 'document', 'audio', 'template', 'interactive', 'video', 'location', 'sticker'];
          await Message.create({
            tenantId: tenant._id,
            conversationId: conversation._id,
            contactId: contact._id,
            waMessageId,
            direction: 'inbound',
            content: messageText,
            type: validTypes.includes(messageType) ? messageType : 'text',
            sentBy: 'contact',
            timestamp: new Date(parseInt(msg.timestamp) * 1000),
          });

          // Non-text messages: saved to inbox, no AI or flows
          if (msg.type !== 'text') continue;

          // Text-only processing: AI and automation flows
          contact.aiContext.push({ role: 'user', content: messageText, timestamp: new Date() });
          if (contact.aiContext.length > 20) contact.aiContext = contact.aiContext.slice(-20);
          contact.lastMessageAt = new Date();
          await contact.save();

          if (conversation.status === 'ai_active') {
            const aiConfig = await AIAgentConfig.findOne({ tenantId: tenant._id, isEnabled: true });

            if (aiConfig) {
              const aiResult = await processMessageWithAI(
                aiConfig,
                contact.aiContext.slice(-aiConfig.contextWindow),
                messageText
              );

              if (aiResult.tagsToAdd?.length) {
                contact.tags = [...new Set([...contact.tags, ...aiResult.tagsToAdd])];
              }
              if (aiResult.tagsToRemove?.length) {
                contact.tags = contact.tags.filter((t) => !aiResult.tagsToRemove.includes(t));
              }
              if (aiResult.stageUpdate) contact.stage = aiResult.stageUpdate;

              if (aiResult.shouldHandover) {
                conversation = await Conversation.findByIdAndUpdate(
                  conversation._id,
                  { status: 'human_takeover' },
                  { new: true }
                );
              }

              contact.aiContext.push({ role: 'assistant', content: aiResult.reply, timestamp: new Date() });
              await contact.save();

              await sendTextMessage(tenant.phoneNumberId, fromPhone, aiResult.reply, tenant.accessToken);

              await Message.create({
                tenantId: tenant._id,
                conversationId: conversation._id,
                contactId: contact._id,
                direction: 'outbound',
                content: aiResult.reply,
                sentBy: 'ai',
                status: 'sent',
              });
            }
          }

          // Execute automation flows only when not in human takeover
          if (conversation.status !== 'human_takeover') {
            ({ contact, conversation } = await executeFlows(tenant, contact, conversation, messageText, isNewContact));
          }
        }

        for (const status of value.statuses || []) {
          await Message.findOneAndUpdate({ waMessageId: status.id }, { status: status.status });
          await WebhookEvent.create({
            tenantId: tenant._id,
            eventType: `status.${status.status}`,
            phone: status.recipient_id,
            messageId: status.id,
            payload: status,
            status: 'processed',
          }).catch(() => {});
        }
      }
    }

  } catch (err) {
    console.error('Webhook processing error:', err);
  }

  return NextResponse.json({ status: 'ok' });
}
