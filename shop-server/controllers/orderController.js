import Order from '../models/Order.js';
import Customer from '../models/Customer.js';
import Notification from '../models/Notification.js';
import OrderItem from '../models/OrderItem.js';
import Product from '../models/Product.js';
import { priceItems } from '../services/catalogService.js';
import { sendOrderEmail } from '../services/emailService.js';
import { createEstimatePdf } from '../services/pdfService.js';
import { createOrderId } from '../utils/orderId.js';

export async function createOrder(request, response) {
  const { customer, items } = request.validated.body; const priced = await priceItems(items); const orderId = await createOrderId();
  const order = await Order.create({ orderId, customer, items: priced.lines, subtotal: priced.subtotal, discount: priced.discount, total: priced.total });
  await Promise.all([
    OrderItem.insertMany(priced.lines.map((item) => ({ order: order._id, orderId, productId: item.sourceType === 'product' ? item.sourceId : null, sourceType: item.sourceType, productName: item.name, productImage: item.image, category: item.category, quantity: item.quantity, priceAtPurchase: item.price, subtotal: item.subtotal }))),
    Customer.findOneAndUpdate({ mobile: customer.mobile }, { $set: { ...customer, lastOrderAt: order.createdAt }, $inc: { orderCount: 1, totalSpent: order.total } }, { upsert: true, new: true }),
    Notification.create({ type: 'new-order', title: 'New Order Received', message: `${orderId} · ₹${order.total.toLocaleString('en-IN')}`, order: order._id }),
    ...priced.lines.filter((item) => item.sourceType === 'product').map((item) => Product.updateOne({ _id: item.sourceId, stockQuantity: { $gte: item.quantity } }, { $inc: { stockQuantity: -item.quantity } })),
  ]);
  const pdf = await createEstimatePdf(order.toObject());
  try { const delivery = await sendOrderEmail(order.toObject(), pdf); order.emailStatus = delivery.status; }
  catch (error) { console.error('Order email failed', error); order.emailStatus = 'failed'; }
  await order.save();
  response.status(201).json({ success: true, message: 'Order request submitted successfully.', data: { orderId: order.orderId, customerName: order.customer.name, total: order.total, pdfUrl: `/api/orders/${order.orderId}/pdf` } });
}
export async function getOrder(request, response) { const order = await Order.findOne({ orderId: request.params.orderId }).lean(); if (!order) return response.status(404).json({ success: false, message: 'Order not found.' }); return response.json({ success: true, data: order }); }
export async function downloadOrderPdf(request, response) { const order = await Order.findOne({ orderId: request.params.orderId }).lean(); if (!order) return response.status(404).json({ success: false, message: 'Order not found.' }); const pdf = await createEstimatePdf(order); response.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${order.orderId}-estimate.pdf"`, 'Cache-Control': 'private, no-store' }).send(pdf); }
export async function downloadEstimate(request, response) { const priced = await priceItems(request.validated.body.items); const estimate = { orderId: `EST-${Date.now()}`, customer: request.validated.body.customer, items: priced.lines, ...priced, createdAt: new Date() }; const pdf = await createEstimatePdf(estimate); response.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="cracker-estimate.pdf"', 'Cache-Control': 'private, no-store' }).send(pdf); }
