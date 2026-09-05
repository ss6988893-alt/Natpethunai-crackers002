import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { priceListGroups } from '../data/priceList.js';

const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export async function ensureCatalog({ CategoryModel = Category, ProductModel = Product, groups = priceListGroups } = {}) {
  let insertedProducts = 0;

  for (const [categoryIndex, group] of groups.entries()) {
    const category = await CategoryModel.findOneAndUpdate(
      { slug: group.slug },
      { $setOnInsert: {
        name: group.category,
        slug: group.slug,
        description: `${group.items.length} products available`,
        image: '/assets/hero-fireworks.png',
        displayOrder: categoryIndex + 1,
        isActive: true,
      } },
      { upsert: true, new: true, runValidators: true },
    );

    const results = await Promise.all(group.items.map(async ([sourceNumber, name, basePrice], productIndex) => {
      const priceAvailable = Number.isFinite(basePrice);
      const originalPrice = priceAvailable ? Math.round(basePrice * 1.7) : 0;
      const slug = `${slugify(name)}-${sourceNumber.toLowerCase()}`;
      const existing = await ProductModel.findOne({ $or: [{ sourceNumber }, { slug }] }).select('_id');
      if (existing) return false;

      await ProductModel.create({
        name,
        slug,
        category: category._id,
        description: '',
        image: '/assets/hero-fireworks.png',
        basePrice,
        price: priceAvailable ? basePrice : 0,
        originalPrice,
        priceAvailable,
        sourceNumber,
        packSize: name.match(/\((?:\d+\s?(?:pc|pcs)|\d+x\d+)\)/i)?.[0] || '',
        discount: priceAvailable ? Math.round((1 - basePrice / originalPrice) * 100) : 0,
        stockQuantity: priceAvailable ? 100 : 0,
        status: priceAvailable ? 'in-stock' : 'out-of-stock',
        featured: priceAvailable && productIndex === 0,
        isActive: true,
      });
      return true;
    }));
    insertedProducts += results.filter(Boolean).length;
  }

  console.log(`PDF catalogue ready: ${groups.length} categories, ${insertedProducts} new products added`);
  return { categories: groups.length, insertedProducts };
}
