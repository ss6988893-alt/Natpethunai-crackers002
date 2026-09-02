import Order from '../models/Order.js';
import { priceItems } from '../services/catalogService.js';
import { sendOrderEmail } from '../services/emailService.js';
import { createEstimatePdf } from '../services/pdfService.js';
import { createOrderId } from '../utils/orderId.js';

export async function createOrder(request, response) {
  const { customer, items } = request.validated.body; const priced = await priceItems(items); const orderId = await createOrderId();
  const order = await Order.create({ orderId, customer, items: priced.lines, subtotal: priced.subtotal, discount: priced.discount, total: priced.total });
  const pdf = await createEstimatePdf(order.toObject());
  try { const delivery = await sendOrderEmail(order.toObject(), pdf); order.emailStatus = delivery.status; }
  catch (error) { console.error('Order email failed', error); order.emailStatus = 'failed'; }
  await order.save();
  response.status(201).json({ success: true, message: 'Order request submitted successfully.', data: { orderId: order.orderId, customerName: order.customer.name, total: order.total, pdfUrl: `/api/orders/${order.orderId}/pdf` } });
}
export async function getOrder(request, response) { const order = await Order.findOne({ orderId: request.params.orderId }).lean(); if (!order) return response.status(404).json({ success: false, message: 'Order not found.' }); return response.json({ success: true, data: order }); }
export async function downloadOrderPdf(request, response) { const order = await Order.findOne({ orderId: request.params.orderId }).lean(); if (!order) return response.status(404).json({ success: false, message: 'Order not found.' }); const pdf = await createEstimatePdf(order); response.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${order.orderId}-estimate.pdf"`, 'Cache-Control': 'private, no-store' }).send(pdf); }
export async function downloadEstimate(request, response) { const priced = await priceItems(request.validated.body.items); const estimate = { orderId: `EST-${Date.now()}`, customer: request.validated.body.customer, items: priced.lines, ...priced, createdAt: new Date() }; const pdf = await createEstimatePdf(estimate); response.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="cracker-estimate.pdf"', 'Cache-Control': 'private, no-store' }).send(pdf); }
