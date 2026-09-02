import 'dotenv/config';

const requiredInProduction = ['MONGODB_URI', 'FRONTEND_URL'];
if (process.env.NODE_ENV === 'production') {
  const missing = requiredInProduction.filter((key) => !process.env[key]);
  if (missing.length) throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/natpe_thunai_crackers',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  shop: {
    name: process.env.SHOP_NAME || 'Natpe Thunai Crackers',
    address: process.env.SHOP_ADDRESS || 'Shop address to be configured',
    phone: process.env.SHOP_PHONE || '+91XXXXXXXXXX',
    email: process.env.SHOP_EMAIL || 'orders@example.com',
  },
  ownerEmail: process.env.OWNER_EMAIL,
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};
