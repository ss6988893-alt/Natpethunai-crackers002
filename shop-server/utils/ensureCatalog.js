import Category from '../models/Category.js';
import Product from '../models/Product.js';
import DeletedCatalogProduct from '../models/DeletedCatalogProduct.js';
import { priceListGroups, retiredSourceNumbers } from '../data/priceList.js';

const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export async function ensureCatalog({ CategoryModel = Category, ProductModel = Product, groups = priceListGroups, retired = retiredSourceNumbers } = {}) {
  let insertedProducts = 0;
  let updatedProducts = 0;

  for (const [categoryIndex, group] of groups.entries()) {
    const category = await CategoryModel.findOneAndUpdate(
      { slug: group.slug },
      {
        $set: {
          name: group.category,
          description: `${group.items.length} products available`,
          displayOrder: categoryIndex + 1,
          isActive: true,
        },
        $setOnInsert: {
          slug: group.slug,
          image: '/assets/hero-fireworks.png',
        },
      },
      { upsert: true, new: true, runValidators: true },
    );

    const results = await Promise.all(group.items.map(async ([sourceNumber, name, basePrice, listPrice], productIndex) => {
      const priceAvailable = Number.isFinite(basePrice);
      const originalPrice = priceAvailable && Number.isFinite(listPrice) ? listPrice : 0;
      const discount = priceAvailable && originalPrice > 0 ? Math.round((1 - basePrice / originalPrice) * 100) : 0;
      const slug = `${slugify(name)}-${sourceNumber.toLowerCase()}`;
      if (await DeletedCatalogProduct.exists({ $or: [{ sourceNumber }, { slug }] })) return 'deleted';
      const existing = await ProductModel.findOne({ $or: [{ sourceNumber }, { slug }] }).select('_id priceAvailable stockQuantity status');
      const catalogFields = {
        name,
        category: category._id,
        basePrice: priceAvailable ? basePrice : null,
        price: priceAvailable ? basePrice : 0,
        originalPrice,
        priceAvailable,
        sourceNumber,
        packSize: name.match(/\((?:\d+\s?(?:pc|pcs)|\d+x\d+)\)/i)?.[0] || '',
        discount,
        isActive: true,
      };

      // The catalogue owns names and prices, but never image/images. Uploaded
      // product photos therefore survive every deployment and catalogue sync.
      if (existing) {
        if (!priceAvailable) {
          catalogFields.status = 'out-of-stock';
          catalogFields.stockQuantity = 0;
        } else if (!existing.priceAvailable) {
          catalogFields.status = 'in-stock';
          catalogFields.stockQuantity = existing.stockQuantity > 0 ? existing.stockQuantity : 100;
        }
        await ProductModel.updateOne({ _id: existing._id }, { $set: catalogFields }, { runValidators: true });
        return 'updated';
      }

      await ProductModel.create({
        name,
        slug,
        category: category._id,
        description: '',
        image: '/assets/hero-fireworks.png',
        basePrice: priceAvailable ? basePrice : null,
        price: priceAvailable ? basePrice : 0,
        originalPrice,
        priceAvailable,
        sourceNumber,
        packSize: name.match(/\((?:\d+\s?(?:pc|pcs)|\d+x\d+)\)/i)?.[0] || '',
        discount,
        stockQuantity: priceAvailable ? 100 : 0,
        status: priceAvailable ? 'in-stock' : 'out-of-stock',
        featured: priceAvailable && productIndex === 0,
        isActive: true,
      });
      return 'inserted';
    }));
    insertedProducts += results.filter((result) => result === 'inserted').length;
    updatedProducts += results.filter((result) => result === 'updated').length;
  }

  const retirementResult = retired.length
    ? await ProductModel.updateMany({ sourceNumber: { $in: retired } }, { $set: { isActive: false } })
    : { modifiedCount: 0 };
  const retiredProducts = retirementResult.modifiedCount || 0;

  console.log(`Final PDF catalogue ready: ${groups.length} categories, ${insertedProducts} added, ${updatedProducts} updated, ${retiredProducts} retired`);
  return { categories: groups.length, insertedProducts, updatedProducts, retiredProducts };
}
