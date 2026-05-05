import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  name: String,
  email: { type: String, required: true },
  password: String,
  role: { type: String, enum: ['owner', 'admin', 'agent'], default: 'agent' },
  isActive: { type: Boolean, default: true },
  onboardingComplete: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

UserSchema.index({ tenantId: 1, email: 1 }, { unique: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
