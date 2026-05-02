import mongoose from 'mongoose';

const BroadcastSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  name: String,
  templateName: String,
  templateParams: [String],
  targetTags: [String],
  targetContacts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Contact' }],
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'running', 'completed', 'failed'],
    default: 'draft',
  },
  scheduledAt: Date,
  stats: {
    total: { type: Number, default: 0 },
    sent: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    read: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Broadcast || mongoose.model('Broadcast', BroadcastSchema);
