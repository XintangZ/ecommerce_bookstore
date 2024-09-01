import { Router } from 'express';
import { getCart, updateCartItem, updateCartItems, clearCart } from '../controllers/cart.controller'; 
import { authenticateJWT } from '../middlewares/jwt.middleware';

export const cartRoute = () => {
	const router = Router();

  router.get('/cart', authenticateJWT, getCart);

  router.put('/cart', authenticateJWT, updateCartItems);

  router.put('/cart/:id', authenticateJWT, updateCartItem);

  router.delete('/cart/clear', authenticateJWT, clearCart);

	return router;
};