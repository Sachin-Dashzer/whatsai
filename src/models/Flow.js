import mongoose from 'mongoose';

const ConditionSchema = new mongoose.Schema({
  field: { type: String, enum: ['message_text', 'contact_tag', 'contact_stage', 'phone'] },
  operator: { type: String, enum: ['equals', 'contains', 'starts_with', 'ends_with', 'not_equals', 'has_tag', 'not_has_tag'] },
  value: String,
}, { _id: false });

const ActionSchema = new mongoose.Schema({
  type: { type: String, enum: ['send_message', 'add_tag', 'remove_tag', 'update_stage', 'handover', 'send_template'] },
  params: { type: mongoose.Schema.Types.Mixed },
}, { _id: false });

const FlowSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  name: { type: String, required: true },
  isEnabled: { type: Boolean, default: true },
  trigger: {
    type: { type: String, enum: ['keyword', 'new_contact', 'tag_added', 'any_message', 'opt_in'], required: true },
    keywords: [String],
    tagName: String,
  },
  conditions: [ConditionSchema],
  actions: [ActionSchema],
  executionCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Flow || mongoose.model('Flow', FlowSchema);
