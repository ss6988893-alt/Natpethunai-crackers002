import PDFDocument from 'pdfkit';
import { env } from '../config/env.js';

const money = (amount) => `Rs. ${Number(amount).toLocaleString('en-IN')}`;
const line = (doc, y) => doc.moveTo(45, y).lineTo(550, y).strokeColor('#ded7cb').lineWidth(0.7).stroke();

export function createEstimatePdf(order) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 45, bufferPages: true }); const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk)); doc.on('end', () => resolve(Buffer.concat(chunks))); doc.on('error', reject);
    doc.rect(0, 0, 595, 115).fill('#171222');
    doc.fillColor('#F6C453').font('Helvetica-Bold').fontSize(22).text(env.shop.name, 45, 36);
    doc.fillColor('#FFFFFF').font('Helvetica').fontSize(9).text(`${env.shop.address}\n${env.shop.phone}  |  ${env.shop.email}`, 45, 68, { lineGap: 3 });
    doc.fillColor('#171222').font('Helvetica-Bold').fontSize(18).text('ESTIMATE / ORDER REQUEST', 45, 145);
    doc.fillColor('#6b6473').font('Helvetica').fontSize(9).text(`Estimate ID: ${order.orderId}\nDate: ${new Date(order.createdAt || Date.now()).toLocaleString('en-IN')}`, 380, 145, { align: 'right', width: 170, lineGap: 4 });
    line(doc, 190);
    doc.fillColor('#171222').font('Helvetica-Bold').fontSize(11).text('CUSTOMER', 45, 207);
    doc.font('Helvetica').fontSize(9).fillColor('#514a59').text(`${order.customer.name}\n${order.customer.mobile || ''}${order.customer.email ? `  |  ${order.customer.email}` : ''}\n${[order.customer.address, order.customer.city, order.customer.district, order.customer.state, order.customer.pincode].filter(Boolean).join(', ')}`, 45, 227, { width: 500, lineGap: 4 });
    let y = 294;
    doc.rect(45, y, 505, 28).fill('#f3eee6'); doc.fillColor('#171222').font('Helvetica-Bold').fontSize(8).text('S.NO', 54, y + 10).text('PRODUCT', 92, y + 10).text('PRICE', 370, y + 10).text('QTY', 440, y + 10).text('TOTAL', 486, y + 10);
    y += 36;
    order.items.forEach((item, index) => {
      if (y > 720) { doc.addPage(); y = 60; }
      doc.fillColor('#312b38').font('Helvetica').fontSize(8.5).text(String(index + 1), 56, y).text(item.name, 92, y, { width: 250 }).text(money(item.price), 360, y, { width: 64, align: 'right' }).text(String(item.quantity), 440, y, { width: 28, align: 'center' }).text(money(item.subtotal), 478, y, { width: 72, align: 'right' });
      y += 26; line(doc, y - 8);
    });
    y += 10; doc.fillColor('#171222').font('Helvetica-Bold').fontSize(10).text('Subtotal', 380, y).text(money(order.subtotal), 470, y, { width: 80, align: 'right' });
    y += 22; doc.fontSize(13).text('Grand Total', 360, y).fillColor('#9b6500').text(money(order.total), 460, y, { width: 90, align: 'right' });
    y += 52; doc.roundedRect(45, y, 505, 62, 8).fill('#fff7e7'); doc.fillColor('#5d5240').font('Helvetica').fontSize(8.5).text('This document is an estimate/order request only. It is not proof of payment. Final availability and total amount will be confirmed by the shop.', 60, y + 16, { width: 475, lineGap: 4 });
    doc.fillColor('#6b6473').font('Helvetica-Oblique').fontSize(9).text('Thank you for choosing Natpe Thunai Crackers. Celebrate responsibly.', 45, y + 90, { align: 'center', width: 505 });
    doc.end();
  });
}
