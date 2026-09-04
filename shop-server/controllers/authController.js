import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import Admin from '../models/Admin.js';

const cookieOptions = () => `admin_token=; HttpOnly; SameSite=Strict; Path=/api/admin; Max-Age=0${env.nodeEnv === 'production' ? '; Secure' : ''}`;
export async function login(request, response) {
  const identity = String(request.body.identity || '').trim().toLowerCase(); const password = String(request.body.password || '');
  if (!identity || password.length < 8) return response.status(400).json({ success: false, message: 'Enter a valid username/email and password.' });
  const admin = await Admin.findOne({ $or: [{ email: identity }, { username: identity }], active: true }).select('+passwordHash');
  if (!admin || !(await admin.verifyPassword(password))) return response.status(401).json({ success: false, message: 'Invalid login details.' });
  const token = jwt.sign({ role: admin.role }, env.jwtSecret, { subject: String(admin._id), issuer: 'natpe-thunai-api', audience: 'natpe-thunai-admin', expiresIn: env.jwtExpiresIn });
  admin.lastLoginAt = new Date(); await admin.save();
  response.setHeader('Set-Cookie', `admin_token=${token}; HttpOnly; SameSite=Strict; Path=/api/admin; Max-Age=${env.jwtCookieSeconds}${env.nodeEnv === 'production' ? '; Secure' : ''}`);
  response.json({ success: true, data: { id: admin._id, name: admin.name, email: admin.email, role: admin.role } });
}
export function logout(request, response) { response.setHeader('Set-Cookie', cookieOptions()); response.json({ success: true }); }
export function me(request, response) { response.json({ success: true, data: request.admin }); }
