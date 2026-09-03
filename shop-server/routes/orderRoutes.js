import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { createOrder, downloadEstimate, downloadOrderPdf, getOrder } from '../controllers/orderController.js';
import { validate } from '../middleware/validate.js';
import { estimateSchema, orderSchema } from '../utils/schemas.js';
const router = Router(); const submitLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 12, standardHeaders: 'draft-8', legacyHeaders: false });
router.post('/orders', submitLimit, validate(orderSchema), createOrder); router.get('/orders/:orderId', getOrder); router.get('/orders/:orderId/pdf', downloadOrderPdf); router.post('/estimate', submitLimit, validate(estimateSchema), downloadEstimate);
export default router;
