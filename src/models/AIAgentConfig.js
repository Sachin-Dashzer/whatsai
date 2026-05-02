import mongoose from 'mongoose';

const AIAgentConfigSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, unique: true },
  isEnabled: { type: Boolean, default: false },
  agentName: { type: String, default: 'AI Assistant' },
  systemPrompt: { type: String, default: '' },
  qualifyingQuestions: [String],
  tagRules: [
    {
      keyword: String,
      tag: String,
      stage: String,
    },
  ],
  handoverTriggers: [String],
  welcomeMessage: String,
  fallbackMessage: String,
  contextWindow: { type: Number, default: 10 },
  language: { type: String, default: 'en' },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.AIAgentConfig || mongoose.model('AIAgentConfig', AIAgentConfigSchema);
