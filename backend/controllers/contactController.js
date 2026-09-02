import ContactEnquiry from '../models/ContactEnquiry.js';
import { sendEnquiryEmail } from '../services/emailService.js';

export async function createEnquiry(request, response) {
  const enquiry = await ContactEnquiry.create(request.validated.body);
  try { await sendEnquiryEmail(enquiry.toObject()); } catch (error) { console.error('Enquiry email failed', error); }
  response.status(201).json({ success: true, message: 'Your enquiry has been sent. We will contact you soon.', data: { id: enquiry._id } });
}
