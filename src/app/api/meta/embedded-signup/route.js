import { NextResponse } from 'next/server';
import { withDB } from '@/lib/mongodb';
import { verifySession } from '@/lib/dal';
import Tenant from '@/models/Tenant';

export async function POST(req) {
  const session = await verifySession();
  const { accessToken, wabaId: signupWabaId, phoneNumberId: signupPhoneId } = await req.json();

  if (!accessToken) return NextResponse.json({ error: 'Missing access token' }, { status: 400 });

  const apiVersion = process.env.META_API_VERSION || 'v19.0';

  let wabaId = signupWabaId;
  let phoneNumberId = signupPhoneId;
  let verifiedName;
  let displayPhone;

  // If session info wasn't captured on the frontend, fall back to Graph API
  if (!wabaId || !phoneNumberId) {
    const wabaRes = await fetch(
      `https://graph.facebook.com/${apiVersion}/me/businesses?fields=whatsapp_business_accounts{id,name,phone_numbers{id,display_phone_number,verified_name}}&access_token=${accessToken}`
    );
    const wabaData = await wabaRes.json();

    const firstWaba = wabaData.data?.[0]?.whatsapp_business_accounts?.data?.[0];
    const firstPhone = firstWaba?.phone_numbers?.data?.[0];

    wabaId = wabaId || firstWaba?.id;
    phoneNumberId = phoneNumberId || firstPhone?.id;
    verifiedName = firstPhone?.verified_name;
    displayPhone = firstPhone?.display_phone_number;
  }

  const waConnected = !!(accessToken && phoneNumberId);

  await withDB();

  const update = {
    accessToken,
    waConnected,
    ...(wabaId && { wabaId }),
    ...(phoneNumberId && { phoneNumberId }),
    ...(verifiedName && { verifiedName }),
  };

  await Tenant.findByIdAndUpdate(session.tenantId, update);

  return NextResponse.json({ ok: true, wabaId, phoneNumberId, verifiedName, displayPhone });
}
