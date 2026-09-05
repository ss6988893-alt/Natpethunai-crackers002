import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';

process.env.NODE_ENV = 'test';
process.env.SMTP_HOST = '';
const { app } = await import('../app.js');
const { connectDatabase, disconnectDatabase } = await import('../config/database.js');
const { ensureInitialAdmin } = await import('../utils/ensureInitialAdmin.js');
const { default: Order } = await import('../models/Order.js');

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

    const order = await Order.create({
      orderId: 'ORD-TEST-000001',
      customer: { name: 'Test Customer', mobile: '9876543210', email: 'customer@example.com', address: '1 Test Street', city: 'Chennai', state: 'Tamil Nadu', pincode: '600001' },
      items: [{ sourceType: 'product', name: 'Test Product', category: 'Test', price: 100, quantity: 1, subtotal: 100 }],
      subtotal: 100,
      total: 100,
    });
    const accepted = await request(app)
      .put(`/api/admin/orders/${order._id}/status`)
      .set('Authorization', `Bearer ${login.body.token}`)
      .send({ status: 'confirmed' });
    assert.equal(accepted.status, 200);
    assert.equal(accepted.body.data.orderStatus, 'confirmed');
    assert.equal(accepted.body.notificationStatus, 'skipped');
    assert.ok(accepted.body.data.acceptedAt);
  } finally {
    await disconnectDatabase();
    await database.stop();
  }
});
