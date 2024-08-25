import { Router } from 'express';
import { createUserAndCart, deleteUser, login, updateUser, getUser, updateWishlist, logout } from '../controllers';
import { authenticateJWT } from '../middlewares/jwt.middleware';

export const userRoute = () => {
	const router = Router();

  router.get('/users/me', authenticateJWT, getUser);

	router.post('/users/login', login);

	router.post('/users', createUserAndCart);

	router.put('/users/me', authenticateJWT, updateUser);

	router.delete('/users/me', authenticateJWT, deleteUser);

	router.put('/users/me/wishlist', authenticateJWT, updateWishlist);

	router.post('/users/logout', authenticateJWT, logout);

	return router;
};