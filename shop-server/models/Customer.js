import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true }, mobile: { type: String, required: true, unique: true, index: true },
  email: { type: String, trim: true, lowercase: true }, address: String, city: String, district: String,
  state: String, pincode: String, orderCount: { type: Number, default: 0 }, totalSpent: { type: Number, default: 0 },
  lastOrderAt: Date,
}, { timestamps: true });
export default mongoose.model('Customer', customerSchema);
