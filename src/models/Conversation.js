import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', required: true },
  waConversationId: String,
  status: {
    type: String,
    enum: ['open', 'ai_active', 'human_takeover', 'resolved'],
    default: 'ai_active',
  },
  assignedAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastMessage: String,
  lastMessageAt: Date,
  unreadCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema);
