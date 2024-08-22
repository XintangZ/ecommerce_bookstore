import { Router } from 'express';
import { createCategory, deleteCategory, getAllCategories, getCategory, updateCategory } from '../controllers';
import { authenticateJWT } from '../middlewares';

export const categoryRoute = () => {
	const router = Router();

	router.get('/categories', getAllCategories);

	router.get('/categories/:id', getCategory);

	router.post('/categories', authenticateJWT, createCategory);

	router.put('/categories/:id', authenticateJWT, updateCategory);

	router.delete('/categories/:id', authenticateJWT, deleteCategory);

	return router;
};
