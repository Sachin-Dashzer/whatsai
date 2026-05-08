import { NextResponse } from 'next/server';
import { withDB } from '@/lib/mongodb';
import { verifySession } from '@/lib/dal';
import { sendTemplateMessage } from '@/lib/whatsapp';
import { normalizePhone } from '@/lib/utils';
import Contact from '@/models/Contact';
import Broadcast from '@/models/Broadcast';
import Tenant from '@/models/Tenant';
import Template from '@/models/Template';

export async function POST(req) {
  const session = await verifySession();
  await withDB();

  const { broadcastId } = await req.json();
  const broadcast = await Broadcast.findOne({ _id: broadcastId, tenantId: session.tenantId });
  if (!broadcast) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const tenant = await Tenant.findById(session.tenantId);
  if (!tenant?.waConnected) return NextResponse.json({ error: 'WhatsApp is not connected. Please connect in Integrations.' }, { status: 400 });

  const query = { tenantId: session.tenantId, optedOut: false };
  if (broadcast.targetTags?.length) query.tags = { $in: broadcast.targetTags };

  const contacts = await Contact.find(query).lean();

  // Hard cap to prevent serverless timeout (Vercel limit is ~60s)
  const BATCH_LIMIT = 100;
  if (contacts.length > BATCH_LIMIT) {
    return NextResponse.json(
      { error: `Broadcast limited to ${BATCH_LIMIT} contacts per send. Please filter by tags to reduce the audience.` },
      { status: 400 }
    );
  }

  // Look up template language once before the send loop
  const template = await Template.findOne({ tenantId: session.tenantId, name: broadcast.templateName }).lean();
  const languageCode = template?.language || 'en';

  await Broadcast.findByIdAndUpdate(broadcastId, { status: 'running' });

  let sent = 0, failed = 0;
  const startTime = Date.now();
  const TIME_LIMIT_MS = 50000; // 50s safety margin for Vercel Pro (adjust to 8000 for Hobby)

  for (let i = 0; i < contacts.length; i++) {
    // Abort if approaching timeout
    if (Date.now() - startTime > TIME_LIMIT_MS) {
      await Broadcast.findByIdAndUpdate(broadcastId, {
        status: 'partial',
        'stats.sent': sent,
        'stats.failed': failed,
        'stats.total': contacts.length,
        errorNote: `Timed out after ${i} contacts. Sent ${sent}, remaining ${contacts.length - i}.`,
      });
      return NextResponse.json({ sent, failed, total: contacts.length, partial: true, stoppedAt: i });
    }

    const contact = contacts[i];
    let normalizedPhone;
    try {
      normalizedPhone = normalizePhone(contact.phone);
    } catch {
      failed++;
      continue;
    }

    try {
      const result = await sendTemplateMessage(
        tenant.phoneNumberId,
        normalizedPhone,
        broadcast.templateName,
        languageCode,
        [],
        tenant.accessToken
      );
      if (result.error) { failed++; } else { sent++; }
    } catch {
      failed++;
    }

    // Respect Meta rate limits — 80 messages/second max, we stay well under
    if (i > 0 && i % 50 === 0) {
      await new Promise((r) => setTimeout(r, 1000));
    } else {
      await new Promise((r) => setTimeout(r, 50));
    }
  }

  await Broadcast.findByIdAndUpdate(broadcastId, {
    status: 'completed',
    'stats.sent': sent,
    'stats.failed': failed,
    'stats.total': contacts.length,
  });

  return NextResponse.json({ sent, failed, total: contacts.length });
}
