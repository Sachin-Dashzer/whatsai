import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const PLANS = {
  basic: { planId: process.env.RAZORPAY_PLAN_BASIC || 'plan_basic_id', name: 'Basic', price: 199900 },
  pro: { planId: process.env.RAZORPAY_PLAN_PRO || 'plan_pro_id', name: 'Pro', price: 499900 },
};

export async function createSubscription(planId, tenantId) {
  return razorpay.subscriptions.create({
    plan_id: planId,
    customer_notify: 1,
    quantity: 1,
    total_count: 12,
    notes: { tenantId },
  });
}

export { razorpay };
