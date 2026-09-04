import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import slugify from 'slugify';
import Category from '../models/Category.js';
import Customer from '../models/Customer.js';
import Notification from '../models/Notification.js';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import Product from '../models/Product.js';

const validOrders = { orderStatus: { $ne: 'cancelled' } };
const startOfDay = (date = new Date()) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const addDays = (date, days) => new Date(date.getTime() + days * 86400000);
const moneyAndCount = async (start, end) => (await Order.aggregate([{ $match: { ...validOrders, createdAt: { $gte: start, $lt: end } } }, { $group: { _id: null, revenue: { $sum: '$total' }, orders: { $sum: 1 } } }]))[0] || { revenue: 0, orders: 0 };
const percentage = (current, previous) => previous ? ((current - previous) / previous) * 100 : current ? 100 : 0;

function rangeFrom(query) {
  const now = new Date(); const today = startOfDay(now); const preset = query.range || 'thisMonth';
  if (preset === 'today') return [today, addDays(today, 1)];
  if (preset === 'yesterday') return [addDays(today, -1), today];
  if (preset === 'last7Days') return [addDays(today, -6), addDays(today, 1)];
  if (preset === 'thisWeek') { const start = addDays(today, -((today.getDay() + 6) % 7)); return [start, addDays(today, 1)]; }
  if (preset === 'lastWeek') { const current = addDays(today, -((today.getDay() + 6) % 7)); return [addDays(current, -7), current]; }
  if (preset === 'lastMonth') return [new Date(now.getFullYear(), now.getMonth() - 1, 1), new Date(now.getFullYear(), now.getMonth(), 1)];
  if (preset === 'custom' && query.from && query.to) return [startOfDay(new Date(query.from)), addDays(startOfDay(new Date(query.to)), 1)];
  return [new Date(now.getFullYear(), now.getMonth(), 1), addDays(today, 1)];
}

export async function dashboard(request, response) {
  const now = new Date(); const today = startOfDay(now); const tomorrow = addDays(today, 1); const yesterday = addDays(today, -1);
  const weekStart = addDays(today, -((today.getDay() + 6) % 7)); const monthStart = new Date(now.getFullYear(), now.getMonth(), 1); const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const [totalOrders, todayData, yesterdayData, weekData, monthData, previousMonth, totalRevenueData, totalProducts, activeProducts, outOfStock, lowStock, totalCustomers, recentOrders, unreadNotifications] = await Promise.all([
    Order.countDocuments(), moneyAndCount(today, tomorrow), moneyAndCount(yesterday, today), moneyAndCount(weekStart, tomorrow), moneyAndCount(monthStart, tomorrow), moneyAndCount(previousMonthStart, monthStart),
    Order.aggregate([{ $match: validOrders }, { $group: { _id: null, revenue: { $sum: '$total' } } }]), Product.countDocuments(), Product.countDocuments({ isActive: true }), Product.countDocuments({ $or: [{ status: 'out-of-stock' }, { stockQuantity: 0 }] }), Product.countDocuments({ isActive: true, stockQuantity: { $gt: 0, $lt: 10 } }), Customer.countDocuments(), Order.find().sort({ createdAt: -1 }).limit(8).select('orderId customer.name total orderStatus createdAt').lean(), Notification.countDocuments({ read: false }),
  ]);
  response.json({ success: true, data: { cards: { totalOrders, ordersToday: todayData.orders, ordersThisWeek: weekData.orders, ordersThisMonth: monthData.orders, totalRevenue: totalRevenueData[0]?.revenue || 0, todayRevenue: todayData.revenue, weeklyRevenue: weekData.revenue, monthlyRevenue: monthData.revenue, totalProducts, activeProducts, outOfStock, lowStock, totalCustomers }, comparison: { today: todayData.revenue, yesterday: yesterdayData.revenue, growth: percentage(todayData.revenue, yesterdayData.revenue) }, monthly: { current: monthData.revenue, previous: previousMonth.revenue, growth: percentage(monthData.revenue, previousMonth.revenue), orders: monthData.orders, averageOrderValue: monthData.orders ? monthData.revenue / monthData.orders : 0 }, recentOrders, unreadNotifications } });
}

export async function analytics(request, response) {
  const [start, end] = rangeFrom(request.query);
  const sales = await Order.aggregate([{ $match: { ...validOrders, createdAt: { $gte: start, $lt: end } } }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } }, { $sort: { _id: 1 } }]);
  const topProducts = await OrderItem.aggregate([{ $match: { createdAt: { $gte: start, $lt: end }, sourceType: 'product' } }, { $lookup: { from: 'orders', localField: 'order', foreignField: '_id', as: 'orderDoc' } }, { $unwind: '$orderDoc' }, { $match: { 'orderDoc.orderStatus': { $ne: 'cancelled' } } }, { $group: { _id: '$productId', name: { $first: '$productName' }, image: { $first: '$productImage' }, category: { $first: '$category' }, quantity: { $sum: '$quantity' }, revenue: { $sum: '$subtotal' }, price: { $last: '$priceAtPurchase' } } }, { $sort: { quantity: -1 } }, { $limit: 10 }]);
  const categories = await OrderItem.aggregate([{ $match: { createdAt: { $gte: start, $lt: end } } }, { $lookup: { from: 'orders', localField: 'order', foreignField: '_id', as: 'orderDoc' } }, { $unwind: '$orderDoc' }, { $match: { 'orderDoc.orderStatus': { $ne: 'cancelled' } } }, { $group: { _id: '$category', revenue: { $sum: '$subtotal' }, quantity: { $sum: '$quantity' } } }, { $sort: { revenue: -1 } }]);
  response.json({ success: true, data: { start, end, sales: sales.map((item) => ({ date: item._id, revenue: item.revenue, orders: item.orders })), topProducts, categories: categories.map((item) => ({ name: item._id, revenue: item.revenue, quantity: item.quantity })) } });
}

export async function adminProducts(request, response) {
  const page = Math.max(1, Number(request.query.page || 1)); const limit = Math.min(100, Math.max(1, Number(request.query.limit || 20))); const filter = {};
  if (request.query.search) filter.name = { $regex: String(request.query.search).slice(0, 80), $options: 'i' }; if (request.query.category) filter.category = request.query.category; if (request.query.stock === 'low') filter.stockQuantity = { $gt: 0, $lt: 10 };
  const [data, total] = await Promise.all([Product.find(filter).populate('category', 'name slug').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(), Product.countDocuments(filter)]);
  response.json({ success: true, data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}

async function saveImages(files = []) {
  if (!files.length) return []; const directory = path.resolve('uploads/products'); await fs.mkdir(directory, { recursive: true });
  return Promise.all(files.map(async (file) => { const name = `${Date.now()}-${crypto.randomUUID()}.webp`; await sharp(file.buffer).rotate().resize(1400, 1400, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toFile(path.join(directory, name)); return `/uploads/products/${name}`; }));
}
const boolean = (value, fallback = false) => value === undefined ? fallback : value === true || value === 'true';
const productPayload = (body) => ({ name: body.name, sku: body.sku || undefined, category: body.category, description: body.description || '', originalPrice: Number(body.originalPrice || 0), price: Number(body.price), discount: Number(body.discount || 0), stockQuantity: Number(body.stockQuantity || 0), status: body.status || (Number(body.stockQuantity) > 0 ? 'in-stock' : 'out-of-stock'), featured: boolean(body.featured), isActive: boolean(body.isActive, true), priceAvailable: true });
export async function createProduct(request, response) { const images = await saveImages(request.files); const data = productPayload(request.body); data.slug = `${slugify(data.name, { lower: true, strict: true })}-${Date.now().toString(36)}`; data.images = images; data.image = images[0] || ''; const product = await Product.create(data); response.status(201).json({ success: true, data: product }); }
export async function updateProduct(request, response) { const product = await Product.findById(request.params.id); if (!product) return response.status(404).json({ success: false, message: 'Product not found.' }); const images = await saveImages(request.files); Object.assign(product, productPayload(request.body)); if (images.length) { product.images = images; product.image = images[0]; } await product.save(); response.json({ success: true, data: product }); }
export async function deleteProduct(request, response) { const product = await Product.findByIdAndDelete(request.params.id); if (!product) return response.status(404).json({ success: false, message: 'Product not found.' }); response.json({ success: true }); }

export async function adminCategories(request, response) { response.json({ success: true, data: await Category.find().sort({ displayOrder: 1, name: 1 }).lean() }); }
export async function createCategory(request, response) { const name = String(request.body.name || '').trim(); if (name.length < 2) return response.status(400).json({ success: false, message: 'Category name is required.' }); const item = await Category.create({ name, slug: slugify(name, { lower: true, strict: true }), description: request.body.description || '', image: request.body.image || '', displayOrder: Number(request.body.displayOrder || 0), isActive: boolean(request.body.isActive, true) }); response.status(201).json({ success: true, data: item }); }
export async function updateCategory(request, response) { const item = await Category.findByIdAndUpdate(request.params.id, { ...request.body, displayOrder: Number(request.body.displayOrder || 0), isActive: boolean(request.body.isActive, true) }, { new: true, runValidators: true }); if (!item) return response.status(404).json({ success: false, message: 'Category not found.' }); response.json({ success: true, data: item }); }
export async function deleteCategory(request, response) { if (await Product.exists({ category: request.params.id })) return response.status(409).json({ success: false, message: 'Move or delete products in this category first.' }); await Category.findByIdAndDelete(request.params.id); response.json({ success: true }); }

export async function adminOrders(request, response) { const page = Math.max(1, Number(request.query.page || 1)); const limit = Math.min(100, Math.max(1, Number(request.query.limit || 20))); const filter = request.query.status ? { orderStatus: request.query.status } : {}; const [data, total] = await Promise.all([Order.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(), Order.countDocuments(filter)]); response.json({ success: true, data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } }); }
export async function adminOrder(request, response) { const order = await Order.findById(request.params.id).lean(); if (!order) return response.status(404).json({ success: false, message: 'Order not found.' }); const items = await OrderItem.find({ order: order._id }).lean(); response.json({ success: true, data: { ...order, orderItems: items } }); }
export async function updateOrderStatus(request, response) { const allowed = ['new', 'confirmed', 'processing', 'ready', 'dispatched', 'delivered', 'cancelled']; if (!allowed.includes(request.body.status)) return response.status(400).json({ success: false, message: 'Invalid order status.' }); const order = await Order.findByIdAndUpdate(request.params.id, { orderStatus: request.body.status }, { new: true }); if (!order) return response.status(404).json({ success: false, message: 'Order not found.' }); response.json({ success: true, data: order }); }
export async function customers(request, response) { const page = Math.max(1, Number(request.query.page || 1)); const limit = 25; const [data, total] = await Promise.all([Customer.find().sort({ lastOrderAt: -1 }).skip((page - 1) * limit).limit(limit).lean(), Customer.countDocuments()]); response.json({ success: true, data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } }); }
export async function notifications(request, response) { response.json({ success: true, data: await Notification.find().sort({ createdAt: -1 }).limit(50).lean() }); }
export async function readNotification(request, response) { await Notification.findByIdAndUpdate(request.params.id, { read: true }); response.json({ success: true }); }
