import { NextResponse } from 'next/server';
import { withDB } from '@/lib/mongodb';
import { verifySession } from '@/lib/dal';
import { PLANS, createSubscription } from '@/lib/razorpay';
import Subscription from '@/models/Subscription';

export async function POST(req) {
  const session = await verifySession();
  await withDB();

  const { plan } = await req.json();
  const planConfig = PLANS[plan];
  if (!planConfig) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });

  const subscription = await createSubscription(planConfig.planId, session.tenantId);

  await Subscription.create({
    tenantId: session.tenantId,
    razorpaySubscriptionId: subscription.id,
    plan,
    status: 'created',
  });

  return NextResponse.json({ subscriptionId: subscription.id, plan: planConfig });
}
