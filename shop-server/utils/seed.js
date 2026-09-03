import slugify from 'slugify';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import Category from '../models/Category.js';
import Combo from '../models/Combo.js';
import Product from '../models/Product.js';
import { priceListGroups } from '../data/priceList.js';

async function seed() {
  await connectDatabase();
  await Promise.all([Category.deleteMany({}), Product.deleteMany({}), Combo.deleteMany({})]);
  const categories = await Category.insertMany(priceListGroups.map((group, index) => ({ name: group.category, slug: group.slug, description: `${group.items.length} products from the official shop price list`, displayOrder: index + 1 })));
  const categoryBySlug = new Map(categories.map((category) => [category.slug, category]));
  const docs = priceListGroups.flatMap((group) => group.items.map(([sourceNumber, name, basePrice], productIndex) => {
    const priceAvailable = Number.isFinite(basePrice);
    return { name, slug: slugify(`${name}-${sourceNumber}`, { lower: true, strict: true }), category: categoryBySlug.get(group.slug)._id, description: priceAvailable ? `Website price includes 70% above the supplied PDF base price of Rs. ${basePrice}.` : 'Source PDF price was blank. Contact the shop for the current price.', image: '/assets/hero-fireworks.png', basePrice, price: priceAvailable ? Math.round(basePrice * 1.7) : 0, originalPrice: basePrice, priceAvailable, sourceNumber, packSize: name.match(/\((?:\d+\s?(?:pc|pcs)|\d+x\d+)\)/i)?.[0] || '', discount: 0, status: priceAvailable ? 'in-stock' : 'out-of-stock', featured: priceAvailable && productIndex === 0 };
  }));
  await Product.insertMany(docs);
  await Combo.insertMany([3000, 5000, 7000, 10000].map((price, index) => ({ name: ['Spark Celebration', 'Family Festival', 'Grand Night', 'Royal Sky'][index], slug: `combo-${price}`, price, originalPrice: Math.round(price * 1.18), description: 'A complete editable festive assortment.', image: '/assets/hero-fireworks.png', items: [{ label: 'Sparklers assortment', quantity: 1 }, { label: 'Flower pots', quantity: 1 }, { label: 'Ground chakkars', quantity: 1 }], featured: index === 1 })));
  const priced = docs.filter((item) => item.priceAvailable).length;
  console.log(`Seeded ${categories.length} categories, ${docs.length} PDF products (${priced} priced, ${docs.length - priced} price on request) and 4 combos.`);
  await disconnectDatabase();
}

seed().catch((error) => { console.error(error); process.exit(1); });
