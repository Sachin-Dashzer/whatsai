import { NextResponse } from 'next/server';
import { withDB } from '@/lib/mongodb';
import { verifySession } from '@/lib/dal';
import { getTemplates } from '@/lib/whatsapp';
import Tenant from '@/models/Tenant';

export async function GET(req) {
  const session = await verifySession();
  await withDB();

  const tenant = await Tenant.findById(session.tenantId);
  if (!tenant?.wabaId || !tenant?.accessToken) {
    return NextResponse.json({ templates: [] });
  }

  const data = await getTemplates(tenant.wabaId, tenant.accessToken);
  return NextResponse.json({ templates: data.data || [] });
}
