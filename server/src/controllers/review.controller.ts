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

		const bookExists = await Book.exists({ _id: bookId });
		const userExists = await User.exists({ _id: userId });

		if (!bookExists) {
			return res.status(404).json({ message: 'Book not found.' });
		}
		if (!userExists) {
			return res.status(404).json({ message: 'User not found.' });
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
		return res.status(500).json({ message: 'Server error' });
	}
};

// Get reviews by book ID
const getReviewsByBook = async (req: Request, res: Response) => {
	const { bookId } = req.params;

	if (!mongoose.Types.ObjectId.isValid(bookId)) {
		return res.status(400).json({ message: 'Invalid book ID format.' });
	}

	try {
		const reviews = await Review.find({ bookId }).populate('userId');

		return res.status(200).json({ data: reviews });
	} catch (error) {
		console.error('Error retrieving reviews:', error);
		return res.status(500).json({ message: 'Server error' });
	}
};

// Get reviews by userId
const getReviewsByUser = async (req: Request, res: Response) => {
	const userId = res.locals.user.userId;

	if (!userId) {
		return res.status(400).json({ message: 'User ID not found in token' });
	}

	if (!mongoose.Types.ObjectId.isValid(userId)) {
		return res.status(400).json({ message: 'Invalid user ID format.' });
	}

	try {
		const reviews = await Review.find({ userId });

		if (reviews.length === 0) {
			return res.status(404).json({ message: `No reviews found for user with id "${userId}".` });
		}

		return res.status(200).json({ data: reviews });
	} catch (error) {
		console.error('Error retrieving reviews:', error);
		return res.status(500).json({ message: 'Server error' });
	}
};

// Get a review by ID
const getReviewById = async (req: Request, res: Response) => {
	const { id } = req.params;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).json({ message: 'Invalid review ID format.' });
	}

	try {
		const review = await Review.findById(id).populate('userId');

		if (!review) {
			return res.status(404).json({ message: `Review with id "${id}" not found.` });
		}

		return res.status(200).json({ data: review });
	} catch (error) {
		console.error('Error retrieving review:', error);
		return res.status(500).json({ message: 'Server error' });
	}
};

// Update a review
const updateReview = async (req: Request, res: Response) => {
	const { id: reviewId } = req.params;
	const userId = res.locals.user.userId;
	const updateData = req.body;

	if (!mongoose.Types.ObjectId.isValid(reviewId)) {
		return res.status(400).json({ message: 'Invalid review ID format.' });
	}

	try {
		const review = await Review.findById(reviewId);

		if (!review) {
			return res.status(404).json({ message: `Review with id "${reviewId}" not found.` });
		}

		// Check if the authenticated user is the owner of the review
		if (review.userId.toString() !== userId) {
			return res.status(403).json({ message: 'Forbidden: You can only update your own reviews.' });
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
		return res.status(500).json({ message: 'Server error' });
	}
};

// Delete a review
const deleteReview = async (req: Request, res: Response) => {
	const { id: reviewId } = req.params;
	const userId = res.locals.user.userId;

	if (!mongoose.Types.ObjectId.isValid(reviewId)) {
		return res.status(400).json({ message: 'Invalid review ID format.' });
	}

	try {
		const review = await Review.findById(reviewId);

		if (!review) {
			return res.status(404).json({ message: `Review with id "${reviewId}" not found.` });
		}

		if (review.userId.toString() !== userId) {
			return res.status(403).json({ message: 'Forbidden: You can only delete your own reviews.' });
		}

		await Review.findByIdAndDelete(reviewId);

		return res.status(200).json({ message: 'Review deleted successfully.' });
	} catch (error) {
		console.error('Error deleting review:', error);
		return res.status(500).json({ message: 'Server error' });
	}
};

export { createReview, deleteReview, getReviewById, getReviewsByBook, getReviewsByUser, updateReview };
