import { priceListGroups } from './priceList.js';

const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
export const categories = priceListGroups.map((group, index) => ({
  id: group.slug,
  slug: group.slug,
  name: group.category,
  description: `${group.items.length} products available`,
  image: '/assets/hero-fireworks.png',
  order: index + 1,
}));

export const products = priceListGroups.flatMap((group) => group.items.map(([sourceNumber, name, basePrice], productIndex) => {
  const priceAvailable = Number.isFinite(basePrice);
  const originalPrice = priceAvailable ? Math.round(basePrice * 1.7) : 0;
  return {
    id: `pdf-${sourceNumber.toLowerCase()}`,
    sourceNumber,
    slug: `${slugify(name)}-${sourceNumber.toLowerCase()}`,
    name,
    category: group.category,
    categorySlug: group.slug,
    description: '',
    image: '/assets/hero-fireworks.png',
    basePrice,
    price: priceAvailable ? basePrice : 0,
    originalPrice,
    discount: priceAvailable ? Math.round((1 - basePrice / originalPrice) * 100) : 0,
    priceAvailable,
    status: priceAvailable ? 'in-stock' : 'out-of-stock',
    featured: priceAvailable && productIndex === 0,
    packSize: name.match(/\((?:\d+\s?(?:pc|pcs)|\d+x\d+)\)/i)?.[0] || '',
  };
}));

export const combos = [
  { id: 'combo-3000', slug: 'celebration-3000', name: 'Spark Celebration', price: 3000, originalPrice: 3480, productCount: 22, accent: '#ff8a38', items: ['Sparklers assortment', 'Flower pots', 'Ground chakkars', 'Kids colour items', 'Sound crackers'] },
  { id: 'combo-5000', slug: 'family-5000', name: 'Family Festival', price: 5000, originalPrice: 5900, productCount: 34, accent: '#9a7cff', items: ['Everything in Spark Celebration', 'Rockets', 'Fancy crackers', 'Aerial shots', 'Gift box selection'] },
  { id: 'combo-7000', slug: 'grand-7000', name: 'Grand Night', price: 7000, originalPrice: 8400, productCount: 46, accent: '#35c5a1', items: ['Expanded family assortment', 'Multi-colour shots', 'Premium fountains', 'Deluxe chakkars', 'Special items'] },
  { id: 'combo-10000', slug: 'royal-10000', name: 'Royal Sky', price: 10000, originalPrice: 12400, productCount: 64, accent: '#f6c453', items: ['Complete premium assortment', 'Large multi-shot set', 'Royal gift box', 'Fancy aerial collection', 'Celebration extras'] },
].map((combo) => ({ ...combo, image: '/assets/hero-fireworks.png', discount: Math.round((1 - combo.price / combo.originalPrice) * 100), category: 'Combo Packs', categorySlug: 'combo-packs', description: 'A curated, editable festive assortment. Final availability is confirmed after your request.' }));
