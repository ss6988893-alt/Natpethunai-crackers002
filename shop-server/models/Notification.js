import mongoose from 'mongoose';
const schema = new mongoose.Schema({ type: { type: String, default: 'new-order' }, title: String, message: String, order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }, read: { type: Boolean, default: false, index: true } }, { timestamps: true });
export default mongoose.model('Notification', schema);
