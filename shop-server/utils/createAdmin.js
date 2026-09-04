import { connectDatabase, disconnectDatabase } from '../config/database.js';
import Admin from '../models/Admin.js';

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase(); const password = process.env.ADMIN_PASSWORD; const username = process.env.ADMIN_USERNAME?.trim().toLowerCase() || 'admin';
if (!email || !password || password.length < 12) { console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD (minimum 12 characters) in the server environment.'); process.exit(1); }
await connectDatabase(); const passwordHash = await Admin.hashPassword(password); await Admin.findOneAndUpdate({ email }, { name: process.env.ADMIN_NAME || 'Administrator', email, username, passwordHash, role: 'admin', active: true }, { upsert: true, new: true, runValidators: true }); console.log(`Admin account ready for ${email}`); await disconnectDatabase();
