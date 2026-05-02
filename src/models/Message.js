import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', required: true },
  waMessageId: String,
  direction: { type: String, enum: ['inbound', 'outbound'], required: true },
  type: {
    type: String,
    enum: ['text', 'image', 'document', 'audio', 'template', 'interactive'],
    default: 'text',
  },
  content: String,
  mediaUrl: String,
  templateName: String,
  status: { type: String, enum: ['sent', 'delivered', 'read', 'failed'], default: 'sent' },
  sentBy: { type: String, enum: ['ai', 'agent', 'broadcast', 'contact'], default: 'agent' },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.models.Message || mongoose.model('Message', MessageSchema);
