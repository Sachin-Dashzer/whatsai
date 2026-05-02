import { NextResponse } from 'next/server';
import { withDB } from '@/lib/mongodb';
import { verifySession } from '@/lib/dal';
import Flow from '@/models/Flow';

export async function GET() {
  const session = await verifySession();
  await withDB();
  const flows = await Flow.find({ tenantId: session.tenantId }).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ flows });
}

export async function POST(req) {
  const session = await verifySession();
  await withDB();
  const body = await req.json();
  const { name, isEnabled, trigger, conditions, actions } = body;
  const flow = await Flow.create({ name, isEnabled, trigger, conditions, actions, tenantId: session.tenantId });
  return NextResponse.json(flow, { status: 201 });
}
