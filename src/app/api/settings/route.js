import { NextResponse } from 'next/server';
import { withDB } from '@/lib/mongodb';
import { verifySession } from '@/lib/dal';
import Tenant from '@/models/Tenant';

export async function GET() {
  const session = await verifySession();
  await withDB();
  const tenant = await Tenant.findById(session.tenantId).select('-accessToken').lean();
  return NextResponse.json(tenant || {});
}

export async function PUT(req) {
  const session = await verifySession();

  if (session.role !== 'owner' && session.role !== 'admin') {
    return NextResponse.json({ error: 'Only owners and admins can update settings' }, { status: 403 });
  }

  await withDB();
  const data = await req.json();
  const allowed = ['businessName', 'wabaId', 'phoneNumberId', 'accessToken', 'verifiedName'];
  const update = {};
  for (const key of allowed) {
    if (data[key] !== undefined) update[key] = data[key];
  }
  // Auto-set waConnected based on credentials presence
  if (update.wabaId !== undefined || update.phoneNumberId !== undefined || update.accessToken !== undefined) {
    const current = await Tenant.findById(session.tenantId).select('wabaId phoneNumberId accessToken').lean();
    const merged = { ...current, ...update };
    update.waConnected = !!(merged.wabaId && merged.phoneNumberId && merged.accessToken);
  }
  const tenant = await Tenant.findByIdAndUpdate(session.tenantId, update, { new: true }).select('-accessToken');
  return NextResponse.json(tenant);
}
