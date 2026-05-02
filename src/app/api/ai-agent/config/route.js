import { NextResponse } from 'next/server';
import { withDB } from '@/lib/mongodb';
import { verifySession } from '@/lib/dal';
import AIAgentConfig from '@/models/AIAgentConfig';

export async function GET() {
  const session = await verifySession();
  await withDB();
  const config = await AIAgentConfig.findOne({ tenantId: session.tenantId }).lean();
  return NextResponse.json(config || {});
}

export async function POST(req) {
  const session = await verifySession();
  await withDB();
  const data = await req.json();
  const config = await AIAgentConfig.findOneAndUpdate(
    { tenantId: session.tenantId },
    { ...data, tenantId: session.tenantId, updatedAt: new Date() },
    { upsert: true, new: true }
  );
  return NextResponse.json(config);
}
