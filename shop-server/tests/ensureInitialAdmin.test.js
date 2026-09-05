import test from 'node:test';
import assert from 'node:assert/strict';
import { ensureInitialAdmin } from '../utils/ensureInitialAdmin.js';

test('configured credentials update an existing matching administrator', async () => {
  let saved = false;
  const existing = {
    passwordHash: 'old-hash',
    verifyPassword: async () => false,
    save: async () => { saved = true; },
  };
  class FakeAdmin {
    static find() { return { select: async () => [existing] }; }
    static async hashPassword(password) { return `hash:${password}`; }
  }

  await ensureInitialAdmin({
    AdminModel: FakeAdmin,
    environment: {
      ADMIN_NAME: 'Store Owner',
      ADMIN_EMAIL: 'OWNER@EXAMPLE.COM',
      ADMIN_USERNAME: 'owner',
      ADMIN_PASSWORD: 'new-secure-password',
    },
  });

  assert.equal(saved, true);
  assert.equal(existing.email, 'owner@example.com');
  assert.equal(existing.username, 'owner');
  assert.equal(existing.passwordHash, 'hash:new-secure-password');
  assert.equal(existing.active, true);
});
