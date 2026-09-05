import Admin from '../models/Admin.js';

export async function ensureInitialAdmin({ AdminModel = Admin, environment = process.env } = {}) {
  const email = environment.ADMIN_EMAIL?.trim().toLowerCase();
  const password = environment.ADMIN_PASSWORD;
  const username = environment.ADMIN_USERNAME?.trim().toLowerCase() || 'admin';

  if (!email || !password) {
    console.warn('Admin login is not configured. Set ADMIN_EMAIL and ADMIN_PASSWORD.');
    return;
  }
  if (password.length < 12) {
    throw new Error('ADMIN_PASSWORD must be at least 12 characters');
  }

  const matches = await AdminModel.find({ $or: [{ email }, { username }] }).select('+passwordHash');
  if (matches.length > 1) {
    throw new Error('ADMIN_EMAIL and ADMIN_USERNAME match different administrator accounts');
  }

  const admin = matches[0] || new AdminModel();
  const passwordMatches = admin.passwordHash ? await admin.verifyPassword(password) : false;
  admin.name = environment.ADMIN_NAME?.trim() || 'Shop Administrator';
  admin.email = email;
  admin.username = username;
  admin.role = 'admin';
  admin.active = true;
  if (!passwordMatches) admin.passwordHash = await AdminModel.hashPassword(password);
  await admin.save();

  console.log(`Configured admin account ready for ${email}`);
}
