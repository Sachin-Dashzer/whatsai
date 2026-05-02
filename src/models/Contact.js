import mongoose from 'mongoose';

const ContactSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  phone: { type: String, required: true },
  name: String,
  email: String,
  tags: [String],
  stage: { type: String, default: 'new' },
  aiContext: [
    {
      role: String,
      content: String,
      timestamp: Date,
    },
  ],
  assignedAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isAIHandled: { type: Boolean, default: true },
  optedOut: { type: Boolean, default: false },
  customFields: mongoose.Schema.Types.Mixed,
  lastMessageAt: Date,
  createdAt: { type: Date, default: Date.now },
});

ContactSchema.index({ tenantId: 1, phone: 1 }, { unique: true });

export default mongoose.models.Contact || mongoose.model('Contact', ContactSchema);
