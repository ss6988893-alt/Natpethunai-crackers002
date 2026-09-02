import mongoose from 'mongoose';

const contactEnquirySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true }, mobile: { type: String, required: true }, email: String,
  subject: { type: String, required: true, trim: true }, message: { type: String, required: true, trim: true, maxlength: 3000 },
  status: { type: String, enum: ['new', 'read', 'closed'], default: 'new' },
}, { timestamps: true });

export default mongoose.model('ContactEnquiry', contactEnquirySchema);
