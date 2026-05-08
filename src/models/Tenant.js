import mongoose from 'mongoose';

const TenantSchema = new mongoose.Schema({
  businessName: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  wabaId: String,
  phoneNumberId: String,
  accessToken: String,
  verifiedName: String,
  waConnected: { type: Boolean, default: false },
  tokenExpiresAt: { type: Date },
  plan: { type: String, enum: ['free', 'basic', 'pro'], default: 'free' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Tenant || mongoose.model('Tenant', TenantSchema);
