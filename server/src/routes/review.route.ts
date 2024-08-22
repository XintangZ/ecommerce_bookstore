import { Router } from 'express';
import {
	createReview,
	deleteReview,
	getReviewById,
	getReviewsByBook,
	getReviewsByUser,
	updateReview,
} from '../controllers';
import { authenticateJWT } from '../middlewares';

export const reviewRoute = () => {
	const router = Router();

	router.get('/reviews/me', authenticateJWT, getReviewsByUser);

	router.get('/reviews/:id', getReviewById);

	router.get('/books/:bookId/reviews', getReviewsByBook);

	router.post('/books/:bookId/reviews', authenticateJWT, createReview);

	router.put('/reviews/:id', authenticateJWT, updateReview);

	router.delete('/reviews/:id', authenticateJWT, deleteReview);

	return router;
};
