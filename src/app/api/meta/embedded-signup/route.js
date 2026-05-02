import { NextResponse } from 'next/server';
import { withDB } from '@/lib/mongodb';
import { verifySession } from '@/lib/dal';
import Tenant from '@/models/Tenant';

export async function POST(req) {
  const session = await verifySession();
  const { code } = await req.json();

  if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 });

  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;

  if (!appId || !appSecret) {
    return NextResponse.json({ error: 'META_APP_ID and META_APP_SECRET must be set' }, { status: 500 });
  }

  // Exchange short-lived code for a system user access token
  const tokenRes = await fetch(
    `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&code=${code}`,
    { method: 'GET' }
  );
  const tokenData = await tokenRes.json();

  if (tokenData.error) {
    return NextResponse.json({ error: tokenData.error.message }, { status: 400 });
  }

  const accessToken = tokenData.access_token;

  // Fetch WABA accounts for this token
  const wabaRes = await fetch(
    `https://graph.facebook.com/v19.0/me/businesses?fields=whatsapp_business_accounts{id,name,phone_numbers{id,display_phone_number,verified_name}}&access_token=${accessToken}`
  );
  const wabaData = await wabaRes.json();

  const firstWaba = wabaData.data?.[0]?.whatsapp_business_accounts?.data?.[0];
  const firstPhone = firstWaba?.phone_numbers?.data?.[0];

  await withDB();

  const update = {
    accessToken,
    waConnected: true,
    ...(firstWaba?.id && { wabaId: firstWaba.id }),
    ...(firstPhone?.id && { phoneNumberId: firstPhone.id }),
    ...(firstPhone?.verified_name && { verifiedName: firstPhone.verified_name }),
  };

  await Tenant.findByIdAndUpdate(session.tenantId, update);

  return NextResponse.json({
    ok: true,
    wabaId: firstWaba?.id,
    phoneNumberId: firstPhone?.id,
    verifiedName: firstPhone?.verified_name,
    displayPhone: firstPhone?.display_phone_number,
  });
}
