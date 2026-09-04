import Admin from '../models/Admin.js';

export async function ensureInitialAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const username = process.env.ADMIN_USERNAME?.trim().toLowerCase() || 'admin';

  // Production environments can opt in to creating the first administrator.
  // Once one exists, startup never changes its credentials.
  if (!email || !password) return;

  const existingAdmin = await Admin.exists({});
  if (existingAdmin) return;

  if (password.length < 12) {
    throw new Error('ADMIN_PASSWORD must be at least 12 characters');
  }

  const passwordHash = await Admin.hashPassword(password);
  await Admin.create({
    name: process.env.ADMIN_NAME?.trim() || 'Shop Administrator',
    email,
    username,
    passwordHash,
    role: 'admin',
    active: true,
  });

  console.log(`Initial admin account created for ${email}`);
}

