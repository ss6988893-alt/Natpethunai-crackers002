export const categories = [
  ['sparklers', 'Sparklers', 'Hand-held shimmer in classic sizes'],
  ['flower-pots', 'Flower Pots', 'Brilliant fountains of colour'],
  ['ground-chakkars', 'Ground Chakkars', 'Spinning colour at ground level'],
  ['rockets', 'Rockets', 'Skyward colour and celebration'],
  ['bombs', 'Bombs', 'Powerful festive sound selections'],
  ['fancy-crackers', 'Fancy Crackers', 'Statement effects for special moments'],
  ['kids-crackers', 'Kids Crackers', 'Gentler colourful favourites'],
  ['sound-crackers', 'Sound Crackers', 'Traditional celebration sound'],
  ['aerial-shots', 'Aerial Shots', 'Single-shot sky effects'],
  ['multi-colour-shots', 'Multi Colour Shots', 'Layered colour sequences'],
  ['gift-boxes', 'Gift Boxes', 'Ready-to-gift festive assortments'],
  ['special-items', 'Special Items', 'Distinctive seasonal arrivals'],
  ['combo-packs', 'Combo Packs', 'Complete value-led celebrations'],
].map(([slug, name, description], index) => ({ id: slug, slug, name, description, image: '/assets/hero-fireworks.png', order: index + 1 }));

const productNames = {
  sparklers: ['7 cm Electric Sparklers', '15 cm Colour Sparklers', '30 cm Green Sparklers'],
  'flower-pots': ['Flower Pot Small', 'Flower Pot Deluxe', 'Colour Koti Fountain'],
  'ground-chakkars': ['Ground Chakkar Classic', 'Ground Chakkar Deluxe', 'Whistling Wheel'],
  rockets: ['Classic Rocket', 'Lunik Rocket', 'Tri Colour Rocket'],
  bombs: ['Bullet Bomb', 'Hydro Bomb', 'Digital Bomb'],
  'fancy-crackers': ['Butterfly Spinner', 'Golden Peacock', 'Colour Rain'],
  'kids-crackers': ['Magic Pencil', 'Dancing Butterfly', 'Colour Smoke'],
  'sound-crackers': ['2 Sound Cracker', 'Red Bijili 100', 'Stripped Bijili'],
  'aerial-shots': ['Single Shot Silver', 'Single Shot Red Star', 'Aerial Crackling Star'],
  'multi-colour-shots': ['12 Shot Multi Colour', '30 Shot Celebration', '60 Shot Grand Show'],
  'gift-boxes': ['Little Joy Gift Box', 'Family Fest Gift Box', 'Royal Celebration Box'],
  'special-items': ['Photo Flash', 'Disco Wheel', 'Electric Stone'],
  'combo-packs': ['Starter Celebration Combo', 'Family Night Combo', 'Grand Festival Combo'],
};

export const products = categories.flatMap((category, categoryIndex) =>
  productNames[category.slug].map((name, productIndex) => {
    const price = 75 + categoryIndex * 38 + productIndex * 65;
    const originalPrice = Math.ceil(price / 0.8 / 10) * 10;
    return {
      id: `${category.slug}-${productIndex + 1}`,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      name,
      category: category.name,
      categorySlug: category.slug,
      description: `${category.description}. Packed as a clearly labelled retail unit.`,
      image: '/assets/hero-fireworks.png',
      price,
      originalPrice,
      discount: Math.round((1 - price / originalPrice) * 100),
      status: 'in-stock',
      featured: productIndex === 1,
    };
  }),
);

export const combos = [
  { id: 'combo-3000', slug: 'celebration-3000', name: 'Spark Celebration', price: 3000, originalPrice: 3480, productCount: 22, accent: '#ff8a38', items: ['Sparklers assortment', 'Flower pots', 'Ground chakkars', 'Kids colour items', 'Sound crackers'] },
  { id: 'combo-5000', slug: 'family-5000', name: 'Family Festival', price: 5000, originalPrice: 5900, productCount: 34, accent: '#9a7cff', items: ['Everything in Spark Celebration', 'Rockets', 'Fancy crackers', 'Aerial shots', 'Gift box selection'] },
  { id: 'combo-7000', slug: 'grand-7000', name: 'Grand Night', price: 7000, originalPrice: 8400, productCount: 46, accent: '#35c5a1', items: ['Expanded family assortment', 'Multi-colour shots', 'Premium fountains', 'Deluxe chakkars', 'Special items'] },
  { id: 'combo-10000', slug: 'royal-10000', name: 'Royal Sky', price: 10000, originalPrice: 12400, productCount: 64, accent: '#f6c453', items: ['Complete premium assortment', 'Large multi-shot set', 'Royal gift box', 'Fancy aerial collection', 'Celebration extras'] },
].map((combo) => ({ ...combo, image: '/assets/hero-fireworks.png', discount: Math.round((1 - combo.price / combo.originalPrice) * 100), category: 'Combo Packs', categorySlug: 'combo-packs', description: 'A curated, editable festive assortment. Final availability is confirmed after your request.' }));
