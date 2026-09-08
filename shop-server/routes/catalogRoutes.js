import { Router } from 'express';
import { getCombo, getProduct, listCategories, listCombos, listProducts, serveProductImage } from '../controllers/catalogController.js';
const router = Router();
router.get('/product-images/:id', serveProductImage); router.get('/products', listProducts); router.get('/products/:id', getProduct); router.get('/categories', listCategories); router.get('/combos', listCombos); router.get('/combos/:id', getCombo);
export default router;
