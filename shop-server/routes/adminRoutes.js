import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, logout, me } from '../controllers/authController.js';
import { adminCategories, adminOrder, adminOrders, adminProducts, analytics, createCategory, createProduct, customers, dashboard, deleteCategory, deleteProduct, notifications, readNotification, updateCategory, updateOrderStatus, updateProduct } from '../controllers/adminController.js';
import { requireAdmin } from '../middleware/auth.js';
import { productUpload } from '../middleware/upload.js';

const router = Router();
const loginLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 8, standardHeaders: 'draft-8', legacyHeaders: false });
router.post('/auth/login', loginLimit, login); router.post('/auth/logout', logout); router.get('/auth/me', requireAdmin, me);
router.use(requireAdmin);
router.get('/dashboard', dashboard); router.get('/analytics', analytics); router.get('/analytics/daily', analytics); router.get('/analytics/weekly', analytics); router.get('/analytics/monthly', analytics); router.get('/analytics/top-products', analytics); router.get('/analytics/categories', analytics);
router.get('/products', adminProducts); router.post('/products', productUpload.array('images', 6), createProduct); router.put('/products/:id', productUpload.array('images', 6), updateProduct); router.delete('/products/:id', deleteProduct);
router.get('/categories', adminCategories); router.post('/categories', createCategory); router.put('/categories/:id', updateCategory); router.delete('/categories/:id', deleteCategory);
router.get('/orders', adminOrders); router.get('/orders/:id', adminOrder); router.put('/orders/:id/status', updateOrderStatus);
router.get('/customers', customers); router.get('/notifications', notifications); router.put('/notifications/:id/read', readNotification);
export default router;
