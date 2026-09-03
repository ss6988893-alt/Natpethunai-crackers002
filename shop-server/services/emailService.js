import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
let transporter;
function getTransporter() {
  if (!env.smtp.host || !env.smtp.user || !env.smtp.pass || !env.ownerEmail) return null;
  transporter ||= nodemailer.createTransport({ host: env.smtp.host, port: env.smtp.port, secure: env.smtp.secure, auth: { user: env.smtp.user, pass: env.smtp.pass } });
  return transporter;
}

export async function sendOrderEmail(order, pdf) {
  const mailer = getTransporter(); if (!mailer) return { status: 'skipped' };
  const rows = order.items.map((item) => `<tr><td>${escapeHtml(item.name)}</td><td>${escapeHtml(item.category)}</td><td>₹${item.price.toLocaleString('en-IN')}</td><td>${item.quantity}</td><td>₹${item.subtotal.toLocaleString('en-IN')}</td></tr>`).join('');
  await mailer.sendMail({ from: `"${env.shop.name}" <${env.smtp.user}>`, to: env.ownerEmail, replyTo: order.customer.email || undefined, subject: `New order request ${order.orderId} — ${order.customer.name}`, html: `<div style="font-family:Arial;color:#241d2d;max-width:760px;margin:auto"><div style="background:#171222;color:white;padding:28px"><h1 style="margin:0;color:#f6c453">${escapeHtml(env.shop.name)}</h1><p>New order request: <strong>${order.orderId}</strong></p></div><div style="padding:28px"><h2>Customer details</h2><p><strong>${escapeHtml(order.customer.name)}</strong><br>${escapeHtml(order.customer.mobile)}<br>${escapeHtml(order.customer.email)}<br>${escapeHtml([order.customer.address, order.customer.city, order.customer.district, order.customer.state, order.customer.pincode].filter(Boolean).join(', '))}</p><h2>Order details</h2><table cellpadding="9" cellspacing="0" border="1" style="width:100%;border-collapse:collapse;border-color:#ddd"><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Qty</th><th>Subtotal</th></tr></thead><tbody>${rows}</tbody></table><h2 style="text-align:right">Total: ₹${order.total.toLocaleString('en-IN')}</h2><p><strong>Notes:</strong> ${escapeHtml(order.customer.notes || 'None')}</p></div></div>`, attachments: [{ filename: `${order.orderId}-estimate.pdf`, content: pdf }] });
  return { status: 'sent' };
}

export async function sendEnquiryEmail(enquiry) {
  const mailer = getTransporter(); if (!mailer) return { status: 'skipped' };
  await mailer.sendMail({ from: `"${env.shop.name}" <${env.smtp.user}>`, to: env.ownerEmail, replyTo: enquiry.email || undefined, subject: `Website enquiry: ${enquiry.subject}`, html: `<h2>${escapeHtml(enquiry.subject)}</h2><p><strong>${escapeHtml(enquiry.name)}</strong> — ${escapeHtml(enquiry.mobile)}</p><p>${escapeHtml(enquiry.message)}</p>` });
  return { status: 'sent' };
}
