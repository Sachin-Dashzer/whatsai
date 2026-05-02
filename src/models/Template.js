import mongoose from 'mongoose';

const TemplateSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  name: { type: String, required: true },
  status: { type: String, default: 'APPROVED' },
  category: String,
  language: { type: String, default: 'en' },
  components: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Template || mongoose.model('Template', TemplateSchema);
