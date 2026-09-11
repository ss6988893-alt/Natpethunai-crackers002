import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import Admin from '../models/Admin.js';

const cookieSecurity = () => env.nodeEnv === 'production' ? '; SameSite=None; Secure' : '; SameSite=Lax';
const cookieOptions = () => `admin_token=; HttpOnly; Path=/api/admin; Max-Age=0${cookieSecurity()}`;
const publicAdmin = (admin) => ({ id: admin._id, name: admin.name, email: admin.email, username: admin.username, role: admin.role });
const createToken = (admin) => jwt.sign({ role: admin.role, ver: admin.tokenVersion || 0 }, env.jwtSecret, { subject: String(admin._id), issuer: 'natpe-thunai-api', audience: 'natpe-thunai-admin', expiresIn: env.jwtExpiresIn });
const setTokenCookie = (response, token) => response.setHeader('Set-Cookie', `admin_token=${token}; HttpOnly; Path=/api/admin; Max-Age=${env.jwtCookieSeconds}${cookieSecurity()}`);

export async function login(request, response) {
  const identity = String(request.body.identity || '').trim().toLowerCase(); const password = String(request.body.password || '');
  if (!identity || password.length < 8) return response.status(400).json({ success: false, message: 'Enter a valid username/email and password.' });
  const admin = await Admin.findOne({ $or: [{ email: identity }, { username: identity }], active: true }).select('+passwordHash');
  if (!admin || !(await admin.verifyPassword(password))) return response.status(401).json({ success: false, message: 'Invalid login details.' });
  const token = createToken(admin);
  admin.lastLoginAt = new Date(); await admin.save();
  setTokenCookie(response, token);
  response.json({ success: true, token, data: publicAdmin(admin) });
}
export function logout(request, response) { response.setHeader('Set-Cookie', cookieOptions()); response.json({ success: true }); }
export function me(request, response) { response.json({ success: true, data: request.admin }); }

export async function updateCredentials(request, response) {
  if (request.admin.role !== 'admin') return response.status(403).json({ success: false, message: 'Only the owner can change login credentials.' });

  const username = String(request.body.username || '').trim().toLowerCase();
  const currentPassword = String(request.body.currentPassword || '');
  const newPassword = String(request.body.newPassword || '');
  if (!/^[a-z0-9._-]{3,40}$/.test(username)) return response.status(400).json({ success: false, message: 'Username must be 3–40 characters using letters, numbers, dots, hyphens or underscores.' });
  if (currentPassword.length < 8) return response.status(400).json({ success: false, message: 'Enter your current password.' });
  if (newPassword && (newPassword.length < 12 || newPassword.length > 128)) return response.status(400).json({ success: false, message: 'New password must be between 12 and 128 characters.' });

  const admin = await Admin.findById(request.admin._id).select('+passwordHash');
  if (!admin || !(await admin.verifyPassword(currentPassword))) return response.status(401).json({ success: false, message: 'Current password is incorrect.' });
  if (newPassword && await admin.verifyPassword(newPassword)) return response.status(400).json({ success: false, message: 'Choose a new password different from the current password.' });

  const usernameOwner = await Admin.findOne({ username, _id: { $ne: admin._id } }).select('_id');
  if (usernameOwner) return response.status(409).json({ success: false, message: 'That username is already in use.' });

  admin.username = username;
  admin.credentialsUpdatedAt = new Date();
  if (newPassword) {
    admin.passwordHash = await Admin.hashPassword(newPassword);
    admin.tokenVersion = (admin.tokenVersion || 0) + 1;
  }
  await admin.save();

  const token = createToken(admin);
  setTokenCookie(response, token);
  response.json({ success: true, token, message: newPassword ? 'Username and password updated.' : 'Username updated.', data: publicAdmin(admin) });
}
