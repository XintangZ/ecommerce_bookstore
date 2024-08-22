import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { Book } from '../models/index';
import { createBookSchema } from '../schema';

// Create a book
const createBook = async (req: Request, res: Response) => {
	// check if the user is admin
	const { user: { isAdmin = false } = {} } = res.locals;
	if (!isAdmin) {
		return res.status(403).json({ message: 'You are not authorized to perform this action.' });
	}

	try {
		// Validate request body using Zod schema
		const validatedData = createBookSchema.parse(req.body);

		const newBook = new Book(validatedData);
		const savedBook = await newBook.save();

		return res.status(201).json({ data: savedBook });
	} catch (error) {
		if (error instanceof z.ZodError) {
			// Zod validation errors
			return res.status(400).json({ errors: error.errors });
		}

		console.error('Error creating book:', error);
		return res.status(500).json({ message: 'Server error' });
	}
};

// Get all books
const getAllBooks = async (req: Request, res: Response) => {
	const { page = 1, limit = 10 } = req.query;

	try {
		// Convert pagination parameters to numbers
		const pageNumber = parseInt(page as string, 10);
		const limitNumber = parseInt(limit as string, 10);

		// Validate pagination parameters
		if (isNaN(pageNumber) || pageNumber < 1) {
			return res.status(400).json({ message: 'Invalid page number.' });
		}
		if (isNaN(limitNumber) || limitNumber < 1) {
			return res.status(400).json({ message: 'Invalid limit value.' });
		}

		// Find books with pagination
		const books = await Book.find()
			.skip((pageNumber - 1) * limitNumber)
			.limit(limitNumber)
			.exec();

		// Get the total count of books for pagination metadata
		const totalBooks = await Book.countDocuments().exec();

		return res.status(200).json({
			data: books,
			pagination: {
				page: pageNumber,
				limit: limitNumber,
				totalBooks,
			},
		});
	} catch (error) {
		console.error('Error retrieving books:', error);
		return res.status(500).json({ message: 'Server error' });
	}
};

// Get a book by ID
const getBookById = async (req: Request, res: Response) => {
	const { id } = req.params;

	// Validate the ID format
	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).json({ message: 'Invalid book ID format.' });
	}

	try {
		const book = await Book.findById(id);

		if (!book) {
			return res.status(404).json({ message: `Book with id "${id}" not found.` });
		}

		return res.status(200).json({ data: book });
	} catch (error) {
		console.error('Error retrieving book:', error);
		return res.status(500).json({ message: 'Server error' });
	}
};

// Update a book
const updateBook = async (req: Request, res: Response) => {
	const { user: { isAdmin = false } = {} } = res.locals;
	if (!isAdmin) {
		return res.status(403).json({ message: 'You are not authorized to perform this action.' });
	}

	const { id } = req.params;
	const updateData = req.body;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).json({ message: 'Invalid book ID format.' });
	}

	try {
		const book = await Book.findById(id);

		if (!book) {
			return res.status(404).json({ message: `Book with id "${id}" not found.` });
		}

		const updatedBook = await Book.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });

		return res.status(200).json({ data: updatedBook });
	} catch (error) {
		console.error('Error updating book:', error);
		return res.status(500).json({ message: 'Server error' });
	}
};

// Delete a book
const deleteBook = async (req: Request, res: Response) => {
	const { user: { isAdmin = false } = {} } = res.locals;
	if (!isAdmin) {
		return res.status(403).json({ message: 'You are not authorized to perform this action.' });
	}

	const { id } = req.params;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).json({ message: 'Invalid book ID format.' });
	}

	try {
		const book = await Book.findById(id);

		if (!book) {
			return res.status(404).json({ message: `Book with id "${id}" not found.` });
		}

		await Book.findByIdAndDelete(id);

		return res.status(200).json({ message: 'Book deleted successfully.' });
	} catch (error) {
		console.error('Error deleting book:', error);
		return res.status(500).json({ message: 'Server error' });
	}
};

export { createBook, deleteBook, getAllBooks, getBookById, updateBook };
