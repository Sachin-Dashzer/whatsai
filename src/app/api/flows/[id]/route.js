import { NextResponse } from 'next/server';
import { withDB } from '@/lib/mongodb';
import { verifySession } from '@/lib/dal';
import Flow from '@/models/Flow';

export async function PATCH(req, { params }) {
  const session = await verifySession();
  await withDB();
  const { id } = await params;
  const body = await req.json();
  const { name, isEnabled, trigger, conditions, actions } = body;
  const flow = await Flow.findOneAndUpdate(
    { _id: id, tenantId: session.tenantId },
    { name, isEnabled, trigger, conditions, actions, updatedAt: new Date() },
    { new: true }
  );
  if (!flow) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(flow);
}

export async function DELETE(req, { params }) {
  const session = await verifySession();
  await withDB();
  const { id } = await params;
  await Flow.findOneAndDelete({ _id: id, tenantId: session.tenantId });
  return NextResponse.json({ ok: true });
}
