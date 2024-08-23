import { Router } from 'express';
import { addToCart } from '../controller/cartController.js';
import { removeToCart } from '../controller/cartController.js';
import { decodeAccessToken } from '../middleware/jwtMiddleware.js';
const router = Router();


router.post('/add-cart/:productId', decodeAccessToken, addToCart);
router.post('/delete-cart/:productId',decodeAccessToken,  removeToCart);
export default router;