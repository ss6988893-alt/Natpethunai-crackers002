import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true }, mobile: { type: String, required: true }, email: String,
  address: { type: String, required: true }, city: { type: String, required: true }, district: String,
  state: String, pincode: { type: String, required: true }, notes: String,
}, { _id: false });

const orderItemSchema = new mongoose.Schema({
  sourceType: { type: String, enum: ['product', 'combo'], required: true }, sourceId: mongoose.Schema.Types.ObjectId,
  slug: String, name: { type: String, required: true }, category: String, image: String,
  price: { type: Number, required: true }, quantity: { type: Number, required: true }, subtotal: { type: Number, required: true },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true, index: true }, customer: { type: customerSchema, required: true },
  items: { type: [orderItemSchema], required: true }, subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 }, total: { type: Number, required: true },
  orderStatus: { type: String, enum: ['new', 'confirmed', 'processing', 'ready', 'dispatched', 'delivered', 'cancelled', 'request-received', 'contacted', 'fulfilled'], default: 'new', index: true },
  emailStatus: { type: String, enum: ['pending', 'sent', 'skipped', 'failed'], default: 'pending' },
  customerNotificationStatus: { type: String, enum: ['pending', 'sent', 'skipped', 'failed'], default: 'pending' },
  acceptedAt: Date,
  customerNotifiedAt: Date,
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
