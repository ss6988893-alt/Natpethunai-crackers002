import mongoose from 'mongoose';

const comboItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  label: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
}, { _id: false });

const comboSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, index: true },
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number, min: 0 },
  description: { type: String, default: '', maxlength: 1200 },
  image: { type: String, default: '' },
  items: { type: [comboItemSchema], default: [] },
  featured: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

export default mongoose.model('Combo', comboSchema);
