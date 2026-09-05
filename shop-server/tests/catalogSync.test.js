import test from 'node:test';
import assert from 'node:assert/strict';
import { MongoMemoryServer } from 'mongodb-memory-server';

process.env.NODE_ENV = 'test';
const { connectDatabase, disconnectDatabase } = await import('../config/database.js');
const { default: Category } = await import('../models/Category.js');
const { default: Product } = await import('../models/Product.js');
const { ensureCatalog } = await import('../utils/ensureCatalog.js');

test('PDF catalogue sync inserts all products once and preserves admin edits', async () => {
  const database = await MongoMemoryServer.create();
  try {
    await connectDatabase(database.getUri());
    const first = await ensureCatalog();
    assert.deepEqual(first, { categories: 19, insertedProducts: 120 });
    assert.equal(await Category.countDocuments(), 19);
    assert.equal(await Product.countDocuments(), 120);

    const edited = await Product.findOneAndUpdate({ sourceNumber: '1' }, { price: 999 }, { new: true });
    assert.equal(edited.price, 999);

    const second = await ensureCatalog();
    assert.deepEqual(second, { categories: 19, insertedProducts: 0 });
    assert.equal(await Product.countDocuments(), 120);
    assert.equal((await Product.findOne({ sourceNumber: '1' })).price, 999);
  } finally {
    await disconnectDatabase();
    await database.stop();
  }
});
