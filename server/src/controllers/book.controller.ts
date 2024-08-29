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
		return res.status(403).json({ message: 'unauthorized_action' });
	}

	try {
		// Validate request body using Zod schema
		const validatedData = createBookSchema.parse(req.body);

		// Check if a book with the same ISBN already exists
		const existingBook = await Book.findOne({ isbn: validatedData.isbn });
		if (existingBook) {
			return res.status(400).json({ message: 'isbn_already_exists' });
		}

		const newBook = new Book(validatedData);
		const savedBook = await newBook.save();

		return res.status(201).json({ data: savedBook });
	} catch (error) {
		if (error instanceof z.ZodError) {
			// Zod validation errors
			return res.status(400).json({ message: 'validation_error', errors: error.errors });
		}

		console.error('Error creating book:', error);
		return res.status(500).json({ message: 'server_error' });
	}
};

// Get all books with sorting and filtering
const getAllBooks = async (req: Request, res: Response) => {
	const {
		page = 1,
		limit = 10,
		sortBy,
		order = 'asc',
		categoryId,
		author,
		isAvailable,
		minPrice,
		maxPrice,
		search,
		maxStock,
	} = req.query;

	try {
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

		// Create a query object for filtering
		const query: any = {};

		// Filter by category if provided
		if (categoryId) {
			query.categoryId = categoryId;
		}

		// Filter by author if provided
		if (author) {
			query.author = { $regex: new RegExp(author as string, 'i') };
		}

		// Filter by availability if provided
		if (isAvailable) {
			query.stock = isAvailable === 'true' ? { $gt: 0 } : 0;
		}

		// Filter by minPrice and maxPrice if provided
		if (minPrice) {
			query.price = { ...query.price, $gte: parseFloat(minPrice as string) };
		}
		if (maxPrice) {
			query.price = { ...query.price, $lte: parseFloat(maxPrice as string) };
		}

		// Vague search
		if (search) {
			query.$or = [
				{ isbn: { $regex: new RegExp(search as string, 'i') } },
				{ title: { $regex: new RegExp(search as string, 'i') } },
				{ author: { $regex: new RegExp(search as string, 'i') } },
			];
		}

		// Filter by stock level if provided
		if (maxStock) {
			query.stock = { ...query.stock, $lte: parseInt(maxStock as string) };
		}

		// Create a sort object based on sortBy and order parameters
		const sort: any = {};
		if (sortBy) {
			sort[sortBy as string] = order === 'desc' ? -1 : 1;
		}

		// Find books with filtering, sorting, and pagination
		const books = await Book.find(query)
			.sort(sort)
			.skip((pageNumber - 1) * limitNumber)
			.limit(limitNumber)
			.exec();

		// Get the total count of books for pagination metadata
		const totalBooks = await Book.countDocuments(query).exec();

		// Calculate total pages
		const totalPages = Math.ceil(totalBooks / limitNumber);

		return res.status(200).json({
			data: books,
			pagination: {
				page: pageNumber,
				limit: limitNumber,
				totalPages: totalPages,
				totalItems: totalBooks,
			},
		});
	} catch (error) {
		console.error('Error retrieving books:', error);
		return res.status(500).json({ message: 'server_error' });
	}
};

// Get a book by ID
const getBookById = async (req: Request, res: Response) => {
	const { id } = req.params;

	// Validate the ID format
	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).json({ message: 'invalid_book_id' });
	}

	try {
		const book = await Book.findById(id).populate('categoryId');
		if (!book) {
			return res.status(404).json({ message: 'book_not_found' });
		}

		return res.status(200).json({ data: book });
	} catch (error) {
		console.error('Error retrieving book:', error);
		return res.status(500).json({ message: 'server_error' });
	}
};

// Update a book
const updateBook = async (req: Request, res: Response) => {
	const { user: { isAdmin = false } = {} } = res.locals;
	if (!isAdmin) {
		return res.status(403).json({ message: 'unauthorized_action' });
	}

	const { id } = req.params;
	const updateData = req.body;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).json({ message: 'invalid_book_id' });
	}

	try {
		const book = await Book.findById(id);

		if (!book) {
			return res.status(404).json({ message: 'book_not_found' });
		}

		const updatedBook = await Book.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });

		return res.status(200).json({ data: updatedBook });
	} catch (error) {
		console.error('Error updating book:', error);
		return res.status(500).json({ message: 'server_error' });
	}
};

// Update book stock
const updateBookStock = async (req: Request, res: Response) => {
	const { user: { isAdmin = false } = {} } = res.locals;
	if (!isAdmin) {
		return res.status(403).json({ message: 'unauthorized_action' });
	}

	const { bookId } = req.params;
	const { stockChange } = req.body; // { stockChange: number }

	if (!mongoose.Types.ObjectId.isValid(bookId)) {
		return res.status(400).json({ message: 'invalid_book_id' });
	}

	if (typeof stockChange !== 'number') {
		return res.status(400).json({ message: 'invalid_stock_change' });
	}

	try {
		const book = await Book.findById(bookId);

		if (!book) {
			return res.status(404).json({ message: 'book_not_found' });
		}

		book.stock += stockChange;
		await book.save();

		return res.status(200).json({ data: book });
	} catch (error) {
		console.error('Error updating book stock:', error);
		return res.status(500).json({ message: 'server_error' });
	}
};

// Update stock for multiple books with the same stock change
const updateMultipleBookStocks = async (req: Request, res: Response) => {
	const { user: { isAdmin = false } = {} } = res.locals;
	if (!isAdmin) {
		return res.status(403).json({ message: 'unauthorized_action' });
	}

	const { bookIds, stockChange } = req.body; // { bookIds: string[], stockChange: number }

	if (
		!Array.isArray(bookIds) ||
		bookIds.some(id => !mongoose.Types.ObjectId.isValid(id)) ||
		typeof stockChange !== 'number'
	) {
		return res.status(400).json({ message: 'invalid_input' });
	}

	try {
		const updatePromises = bookIds.map(id =>
			Book.findByIdAndUpdate(id, { $inc: { stock: stockChange } }, { new: true, runValidators: true })
		);

		const updatedBooks = await Promise.all(updatePromises);

		if (updatedBooks.some(book => !book)) {
			return res.status(404).json({ message: 'some_books_not_found' });
		}

		return res.status(200).json({ data: updatedBooks });
	} catch (error) {
		console.error('Error updating multiple book stocks:', error);
		return res.status(500).json({ message: 'server_error' });
	}
};

// Delete a book
const deleteBook = async (req: Request, res: Response) => {
	const { user: { isAdmin = false } = {} } = res.locals;
	if (!isAdmin) {
		return res.status(403).json({ message: 'unauthorized_action' });
	}

	const { bookId } = req.params;

	if (!mongoose.Types.ObjectId.isValid(bookId)) {
		return res.status(400).json({ message: 'invalid_book_id' });
	}

	try {
		const book = await Book.findById(bookId);

		if (!book) {
			return res.status(404).json({ message: 'book_not_found' });
		}

		await Book.findByIdAndDelete(bookId);

		return res.status(200).json({ data: book });
	} catch (error) {
		console.error('Error deleting book:', error);
		return res.status(500).json({ message: 'server_error' });
	}
};

// Delete multiple books
const deleteMultipleBooks = async (req: Request, res: Response) => {
	const { user: { isAdmin = false } = {} } = res.locals;
	if (!isAdmin) {
		return res.status(403).json({ message: 'unauthorized_action' });
	}

	const { bookIds } = req.body; // bookIds: string[]

	if (!Array.isArray(bookIds) || bookIds.some(id => !mongoose.Types.ObjectId.isValid(id))) {
		return res.status(400).json({ message: 'invalid_book_ids' });
	}

	try {
		const deleteResult = await Book.deleteMany({ _id: { $in: bookIds } });

		if (deleteResult.deletedCount === 0) {
			return res.status(404).json({ message: 'no_books_deleted' });
		}

		return res.status(200).json({ message: 'books_deleted', deletedCount: deleteResult.deletedCount });
	} catch (error) {
		console.error('Error deleting books:', error);
		return res.status(500).json({ message: 'server_error' });
	}
};

export {
	createBook,
	deleteBook,
	deleteMultipleBooks,
	getAllBooks,
	getBookById,
	updateBook,
	updateBookStock,
	updateMultipleBookStocks,
};
