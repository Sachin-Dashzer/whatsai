import { NextResponse } from 'next/server';
import { withDB } from '@/lib/mongodb';
import { verifySession } from '@/lib/dal';
import Tenant from '@/models/Tenant';

export async function POST(req) {
  const session = await verifySession();
  const { code, wabaId: signupWabaId, phoneNumberId: signupPhoneId } = await req.json();

  if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 });

  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  const apiVersion = process.env.META_API_VERSION || 'v19.0';

  if (!appId || !appSecret) {
    return NextResponse.json({ error: 'META_APP_ID and META_APP_SECRET must be set' }, { status: 500 });
  }

  // Exchange short-lived code for user access token.
  // redirect_uri must match what the JS SDK uses internally.
  const redirectUri = encodeURIComponent('https://www.facebook.com/connect/login_success.html');
  const tokenRes = await fetch(
    `https://graph.facebook.com/${apiVersion}/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&code=${code}&redirect_uri=${redirectUri}`,
    { method: 'GET' }
  );
  const tokenData = await tokenRes.json();

  if (tokenData.error) {
    return NextResponse.json({ error: tokenData.error.message }, { status: 400 });
  }

  const accessToken = tokenData.access_token;

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

  // Only mark as connected if we have the minimum required fields
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

  return NextResponse.json({
    ok: true,
    wabaId,
    phoneNumberId,
    verifiedName,
    displayPhone,
  });
}
