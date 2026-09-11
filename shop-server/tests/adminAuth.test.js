import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import sharp from 'sharp';

process.env.NODE_ENV = 'test';
process.env.SMTP_HOST = '';
const { app } = await import('../app.js');
const { connectDatabase, disconnectDatabase } = await import('../config/database.js');
const { ensureInitialAdmin } = await import('../utils/ensureInitialAdmin.js');
const { default: Order } = await import('../models/Order.js');
const { default: Category } = await import('../models/Category.js');

test('configured admin can log in and authenticate with the returned token', async () => {
  const database = await MongoMemoryServer.create();
  try {
    await connectDatabase(database.getUri());
    await ensureInitialAdmin({
      environment: {
        ADMIN_NAME: 'Store Owner',
        ADMIN_EMAIL: 'owner@example.com',
        ADMIN_USERNAME: 'owner',
        ADMIN_PASSWORD: 'new-secure-password',
      },
    });

    const login = await request(app).post('/api/admin/auth/login').send({
      identity: 'owner',
      password: 'new-secure-password',
    });

    assert.equal(login.status, 200);
    assert.equal(login.body.data.email, 'owner@example.com');
    assert.ok(login.body.token);
    assert.match(login.headers['set-cookie'][0], /SameSite=Lax/);

    const me = await request(app)
      .get('/api/admin/auth/me')
      .set('Authorization', `Bearer ${login.body.token}`);
    assert.equal(me.status, 200);
    assert.equal(me.body.data.username, 'owner');

    const rejectedChange = await request(app)
      .put('/api/admin/auth/credentials')
      .set('Authorization', `Bearer ${login.body.token}`)
      .send({ username: 'shop-owner', currentPassword: 'wrong-password', newPassword: 'another-secure-password' });
    assert.equal(rejectedChange.status, 401);

    const credentials = await request(app)
      .put('/api/admin/auth/credentials')
      .set('Authorization', `Bearer ${login.body.token}`)
      .send({ username: 'shop-owner', currentPassword: 'new-secure-password', newPassword: 'another-secure-password' });
    assert.equal(credentials.status, 200);
    assert.equal(credentials.body.data.username, 'shop-owner');
    assert.ok(credentials.body.token);

    const revokedSession = await request(app)
      .get('/api/admin/auth/me')
      .set('Authorization', `Bearer ${login.body.token}`);
    assert.equal(revokedSession.status, 401);

    const oldLogin = await request(app).post('/api/admin/auth/login').send({ identity: 'owner', password: 'new-secure-password' });
    assert.equal(oldLogin.status, 401);
    const newLogin = await request(app).post('/api/admin/auth/login').send({ identity: 'shop-owner', password: 'another-secure-password' });
    assert.equal(newLogin.status, 200);

    await ensureInitialAdmin({
      environment: {
        ADMIN_NAME: 'Store Owner',
        ADMIN_EMAIL: 'owner@example.com',
        ADMIN_USERNAME: 'owner',
        ADMIN_PASSWORD: 'new-secure-password',
      },
    });
    const persistedLogin = await request(app).post('/api/admin/auth/login').send({ identity: 'shop-owner', password: 'another-secure-password' });
    assert.equal(persistedLogin.status, 200);
    const adminToken = persistedLogin.body.token;

    const order = await Order.create({
      orderId: 'ORD-TEST-000001',
      customer: { name: 'Test Customer', mobile: '9876543210', email: 'customer@example.com', address: '1 Test Street', city: 'Chennai', state: 'Tamil Nadu', pincode: '600001' },
      items: [{ sourceType: 'product', name: 'Test Product', category: 'Test', price: 100, quantity: 1, subtotal: 100 }],
      subtotal: 100,
      total: 100,
    });
    const accepted = await request(app)
      .put(`/api/admin/orders/${order._id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'confirmed' });
    assert.equal(accepted.status, 200);
    assert.equal(accepted.body.data.orderStatus, 'confirmed');
    assert.equal(accepted.body.notificationStatus, 'skipped');
    assert.ok(accepted.body.data.acceptedAt);

    const category = await Category.create({ name: 'Upload Test', slug: 'upload-test' });
    const png = await sharp({ create: { width: 2, height: 2, channels: 3, background: '#f4b41a' } }).png().toBuffer();
    const created = await request(app)
      .post('/api/admin/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('name', 'Uploaded Product')
      .field('category', String(category._id))
      .field('price', '100')
      .field('stockQuantity', '5')
      .field('isActive', 'true')
      .attach('images', png, { filename: 'product.png', contentType: 'image/png' });
    assert.equal(created.status, 201);
    assert.match(created.body.data.image, /\/api\/product-images\/[a-f\d]{24}$/i);

    const storedImage = await request(app).get(new URL(created.body.data.image).pathname);
    assert.equal(storedImage.status, 200);
    assert.match(storedImage.headers['content-type'], /image\/webp/);
    assert.ok(storedImage.body.length > 0);
  } finally {
    await disconnectDatabase();
    await database.stop();
  }
});
