import test from 'node:test';
import assert from 'node:assert/strict';
import { MongoMemoryServer } from 'mongodb-memory-server';

process.env.NODE_ENV = 'test';
const { connectDatabase, disconnectDatabase } = await import('../config/database.js');
const { default: Category } = await import('../models/Category.js');
const { default: Product } = await import('../models/Product.js');
const { ensureCatalog } = await import('../utils/ensureCatalog.js');
const { deleteProduct } = await import('../controllers/adminController.js');
const { default: DeletedCatalogProduct } = await import('../models/DeletedCatalogProduct.js');

test('final PDF catalogue sync updates prices while preserving product images', async () => {
  const database = await MongoMemoryServer.create();
  try {
    await connectDatabase(database.getUri());
    const first = await ensureCatalog();
    assert.deepEqual(first, { categories: 23, insertedProducts: 138, updatedProducts: 0, retiredProducts: 0 });
    assert.equal(await Category.countDocuments(), 23);
    assert.equal(await Product.countDocuments(), 138);
    assert.equal(await Product.countDocuments({ priceAvailable: true }), 137);

    const edited = await Product.findOneAndUpdate({ sourceNumber: '1' }, { price: 999, image: '/uploads/kurivi.webp', images: ['/uploads/kurivi.webp'] }, { new: true });
    assert.equal(edited.price, 999);

    const second = await ensureCatalog();
    assert.deepEqual(second, { categories: 23, insertedProducts: 0, updatedProducts: 138, retiredProducts: 0 });
    assert.equal(await Product.countDocuments(), 138);
    const synced = await Product.findOne({ sourceNumber: '1' });
    assert.equal(synced.price, 7);
    assert.equal(synced.originalPrice, 35);
    assert.equal(synced.image, '/uploads/kurivi.webp');
    assert.deepEqual(synced.images, ['/uploads/kurivi.webp']);

    const legacyCategory = await Category.findOne({ slug: 'bijili-crackers' });
    await Product.create({
      name: 'Red Bijili SPL (50pc)',
      slug: 'red-bijili-spl-50pc-29',
      category: legacyCategory._id,
      sourceNumber: '29',
      price: 0,
      priceAvailable: false,
      image: '/uploads/red-bijili.webp',
      isActive: true,
      status: 'out-of-stock',
    });
    const retired = await ensureCatalog();
    assert.equal(retired.retiredProducts, 1);
    const legacy = await Product.findOne({ sourceNumber: '29' });
    assert.equal(legacy.isActive, false);
    assert.equal(legacy.image, '/uploads/red-bijili.webp');

    // Exercise the actual admin deletion handler, then simulate repeated restarts.
    const removed = await Product.findOne({ sourceNumber: '2' });
    let deletionResponse;
    await deleteProduct({ params: { id: removed._id } }, { json: (body) => { deletionResponse = body; } });
    assert.equal(deletionResponse.success, true);
    assert.ok(await DeletedCatalogProduct.exists({ sourceNumber: '2' }));
    assert.equal(await Product.findById(removed._id), null);
    await ensureCatalog();
    await ensureCatalog();
    assert.equal(await Product.findOne({ sourceNumber: '2' }), null);
    assert.equal(await Product.findOne({ slug: removed.slug }), null);
    assert.ok(await Product.findOne({ sourceNumber: '3' }));
  } finally {
    await disconnectDatabase();
    await database.stop();
  }
});
