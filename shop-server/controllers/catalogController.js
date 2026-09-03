import Category from '../models/Category.js';
import Combo from '../models/Combo.js';
import Product from '../models/Product.js';

export async function listProducts(request, response) {
  const page = Math.max(1, Number(request.query.page || 1)); const limit = Math.min(60, Math.max(1, Number(request.query.limit || 24)));
  const filter = {};
  if (request.query.category) { const category = await Category.findOne({ slug: request.query.category }).select('_id'); filter.category = category?._id || null; }
  if (request.query.search) filter.$text = { $search: String(request.query.search).slice(0, 80) };
  if (request.query.featured === 'true') filter.featured = true;
  const sortMap = { priceAsc: { price: 1 }, priceDesc: { price: -1 }, newest: { createdAt: -1 } };
  const sort = sortMap[request.query.sort] || { featured: -1, createdAt: -1 };
  const [data, total] = await Promise.all([Product.find(filter).populate('category', 'name slug').sort(sort).skip((page - 1) * limit).limit(limit).lean(), Product.countDocuments(filter)]);
  response.json({ success: true, data: data.map((item) => ({ ...item, id: item._id, categorySlug: item.category?.slug, category: item.category?.name })), pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}
export async function getProduct(request, response) { const item = await Product.findOne({ $or: [{ slug: request.params.id }, ...(request.params.id.match(/^[a-f\d]{24}$/i) ? [{ _id: request.params.id }] : [])] }).populate('category', 'name slug').lean(); if (!item) return response.status(404).json({ success: false, message: 'Product not found.' }); return response.json({ success: true, data: item }); }
export async function listCategories(request, response) { response.json({ success: true, data: await Category.find().sort({ displayOrder: 1, name: 1 }).lean() }); }
export async function listCombos(request, response) { response.json({ success: true, data: await Combo.find({ status: 'active' }).sort({ price: 1 }).lean() }); }
export async function getCombo(request, response) { const item = await Combo.findOne({ slug: request.params.id, status: 'active' }).populate('items.product', 'name slug price').lean(); if (!item) return response.status(404).json({ success: false, message: 'Combo not found.' }); return response.json({ success: true, data: item }); }
