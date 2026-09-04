import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
  orderId: { type: String, required: true, index: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null, index: true },
  sourceType: { type: String, enum: ['product', 'combo'], required: true },
  productName: { type: String, required: true },
  productImage: { type: String, default: '' },
  category: { type: String, default: 'Crackers', index: true },
  quantity: { type: Number, required: true, min: 1 },
  priceAtPurchase: { type: Number, required: true, min: 0 },
  subtotal: { type: Number, required: true, min: 0 },
}, { timestamps: true });

orderItemSchema.index({ createdAt: -1, productId: 1 });
export default mongoose.model('OrderItem', orderItemSchema);
