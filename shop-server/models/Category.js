import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  slug: { type: String, required: true, unique: true, lowercase: true, index: true },
  image: { type: String, default: '' },
  description: { type: String, default: '', maxlength: 500 },
  displayOrder: { type: Number, default: 0, index: true },
  isActive: { type: Boolean, default: true, index: true },
}, { timestamps: true });

export default mongoose.model('Category', categorySchema);
