import { Router } from 'express';
import { createUser, deleteUser, login, updateUser, getUser } from '../controllers';
import { authenticateJWT } from '../middlewares/jwt.middleware';

export const userRoute = () => {
	const router = Router();

  router.get('/users/me', authenticateJWT, getUser);

	router.post('/users/login', login);

	router.post('/users', createUser);

	router.put('/users/me', authenticateJWT, updateUser);

	router.delete('/users/me', authenticateJWT, deleteUser);

	return router;
};