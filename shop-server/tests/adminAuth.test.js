import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';

process.env.NODE_ENV = 'test';
const { app } = await import('../app.js');
const { connectDatabase, disconnectDatabase } = await import('../config/database.js');
const { ensureInitialAdmin } = await import('../utils/ensureInitialAdmin.js');

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
  } finally {
    await disconnectDatabase();
    await database.stop();
  }
});
