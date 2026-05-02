import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { withDB } from '@/lib/mongodb';
import Subscription from '@/models/Subscription';
import Tenant from '@/models/Tenant';

export async function POST(req) {
  const body = await req.text();
  const signature = req.headers.get('x-razorpay-signature');

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest('hex');

  if (signature !== expectedSignature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
  }

  const event = JSON.parse(body);
  await withDB();

  if (event.event === 'subscription.activated') {
    const sub = event.payload.subscription.entity;
    await Subscription.findOneAndUpdate(
      { razorpaySubscriptionId: sub.id },
      { status: 'active', currentPeriodStart: new Date(sub.current_start * 1000), currentPeriodEnd: new Date(sub.current_end * 1000) }
    );
    const subscription = await Subscription.findOne({ razorpaySubscriptionId: sub.id });
    if (subscription) {
      await Tenant.findByIdAndUpdate(subscription.tenantId, { plan: subscription.plan });
    }
  }

  if (event.event === 'subscription.cancelled') {
    const sub = event.payload.subscription.entity;
    await Subscription.findOneAndUpdate({ razorpaySubscriptionId: sub.id }, { status: 'cancelled' });
  }

  return NextResponse.json({ status: 'ok' });
}
