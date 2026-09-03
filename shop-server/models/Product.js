import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 140 },
  slug: { type: String, required: true, unique: true, lowercase: true, index: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
  description: { type: String, default: '', maxlength: 1200 },
  image: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  basePrice: { type: Number, min: 0, default: null },
  priceAvailable: { type: Boolean, default: true, index: true },
  sourceNumber: { type: String, trim: true },
  packSize: { type: String, trim: true, default: '' },
  originalPrice: { type: Number, min: 0 },
  discount: { type: Number, min: 0, max: 100, default: 0 },
  status: { type: String, enum: ['in-stock', 'low-stock', 'out-of-stock'], default: 'in-stock', index: true },
  featured: { type: Boolean, default: false, index: true },
}, { timestamps: true });

productSchema.index({ name: 'text', description: 'text' });
export default mongoose.model('Product', productSchema);
