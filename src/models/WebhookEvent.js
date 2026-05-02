import mongoose from 'mongoose';

const WebhookEventSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
  eventType: { type: String, required: true }, // message.inbound, status.delivered, etc.
  phone: String,
  messageId: String,
  payload: mongoose.Schema.Types.Mixed,
  status: { type: String, enum: ['processed', 'failed', 'ignored'], default: 'processed' },
  error: String,
  receivedAt: { type: Date, default: Date.now },
});

WebhookEventSchema.index({ tenantId: 1, receivedAt: -1 });
WebhookEventSchema.index({ receivedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 }); // auto-delete after 30 days

export default mongoose.models.WebhookEvent || mongoose.model('WebhookEvent', WebhookEventSchema);
