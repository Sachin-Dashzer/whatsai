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

  // Exchange auth code for access token — no redirect_uri for embedded signup flows
  const tokenRes = await fetch(
    `https://graph.facebook.com/${apiVersion}/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&code=${code}`,
    { method: 'GET' }
  );
  const tokenData = await tokenRes.json();

  if (tokenData.error) {
    return NextResponse.json({ error: tokenData.error.message }, { status: 400 });
  }

  const shortLivedToken = tokenData.access_token;

  // Exchange short-lived token for long-lived token (valid ~60 days)
  const longLivedRes = await fetch(
    `https://graph.facebook.com/${apiVersion}/oauth/access_token` +
    `?grant_type=fb_exchange_token` +
    `&client_id=${appId}` +
    `&client_secret=${appSecret}` +
    `&fb_exchange_token=${shortLivedToken}`
  );
  const longLivedData = await longLivedRes.json();

  if (longLivedData.error) {
    return NextResponse.json({ error: 'Failed to get long-lived token: ' + longLivedData.error.message }, { status: 400 });
  }

  const accessToken = longLivedData.access_token;
  const tokenExpiresAt = longLivedData.expires_in
    ? new Date(Date.now() + longLivedData.expires_in * 1000)
    : null;

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
    ...(tokenExpiresAt && { tokenExpiresAt }),
    ...(wabaId && { wabaId }),
    ...(phoneNumberId && { phoneNumberId }),
    ...(verifiedName && { verifiedName }),
  };

  await Tenant.findByIdAndUpdate(session.tenantId, update);

  return NextResponse.json({ ok: true, wabaId, phoneNumberId, verifiedName, displayPhone });
}
