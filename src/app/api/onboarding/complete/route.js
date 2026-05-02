import { NextResponse } from 'next/server';
import { withDB } from '@/lib/mongodb';
import { verifySession } from '@/lib/dal';
import User from '@/models/User';
import Tenant from '@/models/Tenant';

export async function POST(req) {
  const session = await verifySession();
  await withDB();

  const data = await req.json();

  // Save WhatsApp config if provided
  if (data.wabaId || data.phoneNumberId || data.accessToken) {
    await Tenant.findByIdAndUpdate(session.tenantId, {
      wabaId: data.wabaId,
      phoneNumberId: data.phoneNumberId,
      accessToken: data.accessToken,
      verifiedName: data.verifiedName,
    });
  }

  // Mark onboarding complete
  await User.findByIdAndUpdate(session.userId, { onboardingComplete: true });

  return NextResponse.json({ success: true });
}
