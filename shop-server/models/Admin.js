import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  name: { type: String, trim: true, default: 'Administrator' },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  username: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['admin', 'manager'], default: 'admin' },
  active: { type: Boolean, default: true },
  tokenVersion: { type: Number, default: 0, min: 0 },
  credentialsUpdatedAt: Date,
  lastLoginAt: Date,
}, { timestamps: true });

adminSchema.methods.verifyPassword = function verifyPassword(password) { return bcrypt.compare(password, this.passwordHash); };
adminSchema.statics.hashPassword = (password) => bcrypt.hash(password, 12);
export default mongoose.model('Admin', adminSchema);
