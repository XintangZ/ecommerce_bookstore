import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { Book, Review, User } from '../models/index';
import { createReviewSchema, updateReviewSchema } from '../schema';

// Create a review
const createReview = async (req: Request, res: Response) => {
	try {
		const { bookId } = req.params;
		const userId = res.locals.user.userId;

		if (!mongoose.Types.ObjectId.isValid(userId)) {
			return res.status(400).json({ message: 'invalid_user_id' });
		}

		if (!mongoose.Types.ObjectId.isValid(bookId)) {
			return res.status(400).json({ message: 'invalid_book_id' });
		}

		const bookExists = await Book.exists({ _id: bookId });
		if (!bookExists) {
			return res.status(404).json({ message: 'book_not_found' });
		}

		const userExists = await User.exists({ _id: userId });
		if (!userExists) {
			return res.status(404).json({ message: 'user_not_found' });
		}

		const validatedData = createReviewSchema.parse(req.body);

		const newReview = new Review({ ...validatedData, userId, bookId });
		const savedReview = await newReview.save();

		return res.status(201).json({ data: savedReview });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return res.status(400).json({ errors: error.errors });
		}

		console.error('Error creating review:', error);
		return res.status(500).json({ message: 'server_error' });
	}
};

// Get reviews by book ID
const getReviewsByBook = async (req: Request, res: Response) => {
	const { bookId } = req.params;

	if (!mongoose.Types.ObjectId.isValid(bookId)) {
		return res.status(400).json({ message: 'invalid_book_id' });
	}

	try {
		const { page = 1, limit = 10 } = req.query;

		// Convert pagination parameters to numbers
		const pageNumber = parseInt(page as string, 10);
		const limitNumber = parseInt(limit as string, 10);

		// Validate pagination parameters
		if (isNaN(pageNumber) || pageNumber < 1) {
			return res.status(400).json({ message: 'invalid_page_number' });
		}
		if (isNaN(limitNumber) || limitNumber < 1) {
			return res.status(400).json({ message: 'invalid_limit_value' });
		}

		// Find reviews with pagination
		const reviews = await Review.find({ bookId })
			.sort({ createdAt: -1 })
			.skip((pageNumber - 1) * limitNumber)
			.limit(limitNumber)
			.populate('userId')
			.exec();

		// Get the total count of reviews for pagination metadata
		const totalReviews = await Review.countDocuments().exec();

		// Calculate total pages
		const totalPages = Math.ceil(totalReviews / limitNumber);

		return res.status(200).json({
			data: reviews,
			pagination: {
				page: pageNumber,
				limit: limitNumber,
				totalPages: totalPages,
				totalItems: totalReviews,
			},
		});
	} catch (error) {
		console.error('Error retrieving reviews:', error);
		return res.status(500).json({ message: 'server_error' });
	}
};

// Get reviews by userId
const getReviewsByUser = async (req: Request, res: Response) => {
	const userId = res.locals.user.userId;

	if (!mongoose.Types.ObjectId.isValid(userId)) {
		return res.status(400).json({ message: 'invalid_user_id' });
	}

	const userExists = await User.exists({ _id: userId });
	if (!userExists) {
		return res.status(404).json({ message: 'user_not_found' });
	}

	try {
		const { page = 1, limit = 10 } = req.query;

		// Convert pagination parameters to numbers
		const pageNumber = parseInt(page as string, 10);
		const limitNumber = parseInt(limit as string, 10);

		// Validate pagination parameters
		if (isNaN(pageNumber) || pageNumber < 1) {
			return res.status(400).json({ message: 'invalid_page_number' });
		}
		if (isNaN(limitNumber) || limitNumber < 1) {
			return res.status(400).json({ message: 'invalid_limit_value' });
		}

		// Find reviews with pagination
		const reviews = await Review.find({ userId })
			.sort({ createdAt: -1 })
			.skip((pageNumber - 1) * limitNumber)
			.limit(limitNumber)
			.populate('userId')
			.exec();

		// Get the total count of reviews for pagination metadata
		const totalReviews = await Review.countDocuments().exec();

		// Calculate total pages
		const totalPages = Math.ceil(totalReviews / limitNumber);

		return res.status(200).json({
			data: reviews,
			pagination: {
				page: pageNumber,
				limit: limitNumber,
				totalPages: totalPages,
				totalItems: totalReviews,
			},
		});
	} catch (error) {
		console.error('Error retrieving reviews:', error);
		return res.status(500).json({ message: 'server_error' });
	}
};

// Get a review by ID
const getReviewById = async (req: Request, res: Response) => {
	const { id: reviewId } = req.params;

	if (!mongoose.Types.ObjectId.isValid(reviewId)) {
		return res.status(400).json({ message: 'invalid_review_id' });
	}

	try {
		const review = await Review.findById(reviewId).populate('userId');

		if (!review) {
			return res.status(404).json({ message: 'review_not_found' });
		}

		return res.status(200).json({ data: review });
	} catch (error) {
		console.error('Error retrieving review:', error);
		return res.status(500).json({ message: 'server_error' });
	}
};

// Update a review
const updateReview = async (req: Request, res: Response) => {
	const { id: reviewId } = req.params;
	const userId = res.locals.user.userId;
	const updateData = req.body;

	if (!mongoose.Types.ObjectId.isValid(reviewId)) {
		return res.status(400).json({ message: 'invalid_review_id' });
	}

	if (!mongoose.Types.ObjectId.isValid(userId)) {
		return res.status(400).json({ message: 'invalid_user_id' });
	}

	try {
		const review = await Review.findById(reviewId);

		if (!review) {
			return res.status(404).json({ message: 'review_not_found' });
		}

		// Check if the authenticated user is the owner of the review
		if (review.userId.toString() !== userId) {
			return res.status(403).json({ message: 'unauthorized_action' });
		}

		const validatedUpdateData = updateReviewSchema.parse(updateData);

		const updatedReview = await Review.findByIdAndUpdate(
			reviewId,
			{ $set: validatedUpdateData },
			{ new: true, runValidators: true }
		);

		return res.status(200).json({ data: updatedReview });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return res.status(400).json({ errors: error.errors });
		}

		console.error('Error updating review:', error);
		return res.status(500).json({ message: 'server_error' });
	}
};

// Delete a review
const deleteReview = async (req: Request, res: Response) => {
	const { id: reviewId } = req.params;
	const userId = res.locals.user.userId;

	if (!mongoose.Types.ObjectId.isValid(reviewId)) {
		return res.status(400).json({ message: 'invalid_review_id' });
	}

	if (!mongoose.Types.ObjectId.isValid(userId)) {
		return res.status(400).json({ message: 'invalid_user_id' });
	}

	try {
		const review = await Review.findById(reviewId);

		if (!review) {
			return res.status(404).json({ message: 'review_not_found' });
		}

		if (review.userId.toString() !== userId) {
			return res.status(403).json({ message: 'unauthorized_action' });
		}

		await Review.findByIdAndDelete(reviewId);

		return res.status(200).json({ data: review });
	} catch (error) {
		console.error('Error deleting review:', error);
		return res.status(500).json({ message: 'server_error' });
	}
};

export { createReview, deleteReview, getReviewById, getReviewsByBook, getReviewsByUser, updateReview };
