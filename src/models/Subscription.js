import mongoose from 'mongoose';

const SubscriptionSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  razorpaySubscriptionId: String,
  razorpayCustomerId: String,
  plan: String,
  status: {
    type: String,
    enum: ['created', 'active', 'halted', 'cancelled'],
    default: 'created',
  },
  currentPeriodStart: Date,
  currentPeriodEnd: Date,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Subscription || mongoose.model('Subscription', SubscriptionSchema);
