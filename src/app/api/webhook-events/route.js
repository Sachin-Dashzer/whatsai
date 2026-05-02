import { NextResponse } from 'next/server';
import { withDB } from '@/lib/mongodb';
import { verifySession } from '@/lib/dal';
import WebhookEvent from '@/models/WebhookEvent';

export async function GET(req) {
  const session = await verifySession();
  await withDB();

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const type = searchParams.get('type');
  const limit = 50;

  const query = { tenantId: session.tenantId };
  if (type) query.eventType = { $regex: type };

  const total = await WebhookEvent.countDocuments(query);
  const events = await WebhookEvent.find(query)
    .sort({ receivedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return NextResponse.json({ events, total, page, pages: Math.ceil(total / limit) });
}

export async function DELETE() {
  const session = await verifySession();
  await withDB();
  await WebhookEvent.deleteMany({ tenantId: session.tenantId });
  return NextResponse.json({ success: true });
}
