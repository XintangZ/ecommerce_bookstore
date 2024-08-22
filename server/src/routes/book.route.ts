import { Router } from 'express';
import { createBook, deleteBook, getAllBooks, getBookById, updateBook } from '../controllers';
import { authenticateJWT } from '../middlewares';

export const bookRoute = () => {
	const router = Router();

	router.get('/books', getAllBooks);

	router.get('/books/:id', getBookById);

	router.post('/books', authenticateJWT, createBook);

	router.put('/books/:id', authenticateJWT, updateBook);

	router.delete('/books/:id', authenticateJWT, deleteBook);

	return router;
};
