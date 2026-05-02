import { NextResponse } from 'next/server';
import { withDB } from '@/lib/mongodb';
import { verifySession } from '@/lib/dal';
import Broadcast from '@/models/Broadcast';

export async function GET() {
  const session = await verifySession();
  await withDB();
  const broadcasts = await Broadcast.find({ tenantId: session.tenantId })
    .sort({ createdAt: -1 })
    .lean();
  return NextResponse.json({ broadcasts });
}

export async function POST(req) {
  const session = await verifySession();
  await withDB();
  const data = await req.json();
  const broadcast = await Broadcast.create({ ...data, tenantId: session.tenantId });
  return NextResponse.json(broadcast, { status: 201 });
}
