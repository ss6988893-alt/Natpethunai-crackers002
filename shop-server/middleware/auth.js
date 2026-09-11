import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import Admin from '../models/Admin.js';

function tokenFrom(request) {
  const bearer = request.headers.authorization?.startsWith('Bearer ') ? request.headers.authorization.slice(7) : null;
  const cookie = request.headers.cookie?.split(';').map((item) => item.trim()).find((item) => item.startsWith('admin_token='))?.split('=').slice(1).join('=');
  return bearer || cookie;
}

export async function requireAdmin(request, response, next) {
  try {
    const token = tokenFrom(request);
    if (!token) return response.status(401).json({ success: false, message: 'Admin authentication required.' });
    const payload = jwt.verify(token, env.jwtSecret, { issuer: 'natpe-thunai-api', audience: 'natpe-thunai-admin' });
    const admin = await Admin.findOne({ _id: payload.sub, active: true }).select('name email username role tokenVersion');
    if (!admin) return response.status(401).json({ success: false, message: 'Admin session is no longer valid.' });
    if ((payload.ver ?? 0) !== (admin.tokenVersion || 0)) return response.status(401).json({ success: false, message: 'Admin session is no longer valid. Please sign in again.' });
    request.admin = admin; return next();
  } catch { return response.status(401).json({ success: false, message: 'Admin session expired. Please sign in again.' }); }
}
