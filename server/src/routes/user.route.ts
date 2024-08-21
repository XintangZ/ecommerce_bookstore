import { Router } from 'express';
import { createUser, deleteUser, login, updateUser, getUser } from '../controllers';
import { authenticateJWT } from '../middlewares/jwt.middleware';

export const userRoute = () => {
	const router = Router();

  router.get('/user/user', authenticateJWT, getUser);

	router.post('/user/login', login);

	router.post('/user/add', createUser);

	router.put('/user/update', authenticateJWT, updateUser);

	router.delete('/user/delete', authenticateJWT, deleteUser);

	return router;
};