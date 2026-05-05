import { NextResponse } from 'next/server';
import { withDB } from '@/lib/mongodb';
import { verifySession } from '@/lib/dal';
import { sendTemplateMessage } from '@/lib/whatsapp';
import Contact from '@/models/Contact';
import Broadcast from '@/models/Broadcast';
import Tenant from '@/models/Tenant';

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

  await Broadcast.findByIdAndUpdate(broadcastId, {
    status: 'running',
    'stats.total': contacts.length,
  });

  let sent = 0, failed = 0;
  for (let i = 0; i < contacts.length; i++) {
    const contact = contacts[i];
    try {
      const result = await sendTemplateMessage(
        tenant.phoneNumberId,
        contact.phone,
        broadcast.templateName,
        'en',
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
  });

  return NextResponse.json({ sent, failed, total: contacts.length });
}
