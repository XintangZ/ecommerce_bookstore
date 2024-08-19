import { Router } from 'express';
import { createBook, deleteBook, getAllBooks, getBook, updateBook } from '../controllers';

export const bookRoute = () => {
	const router = Router();

	router.get('/books', getAllBooks);

	router.get('/books/:id', getBook);

	router.post('/books/add', createBook);

	router.put('/books/update/:id', updateBook);

	router.delete('/books/delete/:id', deleteBook);

	return router;
};
