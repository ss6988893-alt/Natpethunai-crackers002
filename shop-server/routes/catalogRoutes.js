import { Router } from 'express';
import { getCombo, getProduct, listCategories, listCombos, listProducts } from '../controllers/catalogController.js';
const router = Router();
router.get('/products', listProducts); router.get('/products/:id', getProduct); router.get('/categories', listCategories); router.get('/combos', listCombos); router.get('/combos/:id', getCombo);
export default router;
