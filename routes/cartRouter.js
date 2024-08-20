import { Router } from 'express';
import { addToCart } from '../controller/cartController.js';
import { removeToCart } from '../controller/cartController.js';
const router = Router();


router.post('/add-cart/:productId', addToCart);
router.post('/delete-cart/:productId', removeToCart);
export default router;