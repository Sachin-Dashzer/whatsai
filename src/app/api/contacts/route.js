import { NextResponse } from 'next/server';
import { withDB } from '@/lib/mongodb';
import { verifySession } from '@/lib/dal';
import Contact from '@/models/Contact';

export async function GET(req) {
  const session = await verifySession();
  await withDB();

  const { searchParams } = new URL(req.url);
  const tag = searchParams.get('tag');
  const stage = searchParams.get('stage');
  const search = searchParams.get('search');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 50;

  const query = { tenantId: session.tenantId };
  if (tag) query.tags = tag;
  if (stage) query.stage = stage;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }

  const total = await Contact.countDocuments(query);
  const contacts = await Contact.find(query)
    .sort({ lastMessageAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return NextResponse.json({ contacts, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(req) {
  const session = await verifySession();
  await withDB();

  const data = await req.json();
  const { name, phone, email, tags, stage, notes } = data;
  const contact = await Contact.create({ name, phone, email, tags, stage, notes, tenantId: session.tenantId });
  return NextResponse.json(contact, { status: 201 });
}
