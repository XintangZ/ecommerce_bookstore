import { Router } from 'express';
import { createUser, deleteUser, login, updateUser } from '../controllers';
import { authenticateJWT } from '../middlewares/jwt.middleware';

export const userRoute = () => {
	const router = Router();

	router.post('/user/login', login);

	router.post('/user/add', createUser);

	router.put('/user/update', authenticateJWT, updateUser);

	router.delete('/user/delete/:id', authenticateJWT, deleteUser);

	return router;
};