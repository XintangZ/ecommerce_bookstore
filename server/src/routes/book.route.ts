import { Router } from 'express';
import {
	createBook,
	deleteBook,
	deleteMultipleBooks,
	getAllBooks,
	getBookById,
	updateBook,
	updateBookStock,
	updateMultipleBookStocks,
} from '../controllers';
import { authenticateJWT } from '../middlewares';

export const bookRoute = () => {
	const router = Router();

	router.get('/books', getAllBooks);

	router.get('/books/:id', getBookById);

	router.post('/books', authenticateJWT, createBook);

	router.put('/books/:id', authenticateJWT, updateBook);

	router.patch('/books/:id/stocks', authenticateJWT, updateBookStock);

	router.patch('/books/stocks', authenticateJWT, updateMultipleBookStocks);

	router.delete('/books/:id', authenticateJWT, deleteBook);

	router.delete('/books', authenticateJWT, deleteMultipleBooks);

	return router;
};
