import { Router } from 'express';
import { getCart, updateCart, clearCart } from '../controllers/cart.controller'; 
import { authenticateJWT } from '../middlewares/jwt.middleware';

export const cartRoute = () => {
	const router = Router();

  router.get('/cart', authenticateJWT, getCart);

  router.put('/cart', authenticateJWT, updateCart);

  router.delete('/cart/clear', authenticateJWT, clearCart);

	return router;
};