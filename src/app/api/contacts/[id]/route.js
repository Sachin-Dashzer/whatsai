import { NextResponse } from 'next/server';
import { withDB } from '@/lib/mongodb';
import { verifySession } from '@/lib/dal';
import Contact from '@/models/Contact';

export async function GET(req, { params }) {
  const session = await verifySession();
  await withDB();
  const { id } = await params;
  const contact = await Contact.findOne({ _id: id, tenantId: session.tenantId }).lean();
  if (!contact) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(contact);
}

export async function PUT(req, { params }) {
  const session = await verifySession();
  await withDB();
  const { id } = await params;
  const data = await req.json();
  const { name, phone, email, tags, stage, customFields, optedOut, assignedAgent } = data;
  const contact = await Contact.findOneAndUpdate(
    { _id: id, tenantId: session.tenantId },
    { name, phone, email, tags, stage, customFields, optedOut, assignedAgent },
    { new: true }
  );
  if (!contact) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(contact);
}

export async function DELETE(req, { params }) {
  const session = await verifySession();
  await withDB();
  const { id } = await params;
  await Contact.findOneAndDelete({ _id: id, tenantId: session.tenantId });
  return NextResponse.json({ success: true });
}
