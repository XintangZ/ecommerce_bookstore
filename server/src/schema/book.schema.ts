import { z } from 'zod';

export const createBookSchema = z.object({
	title: z.string().min(1, { message: 'Title is required' }),
	author: z.string().min(1, { message: 'Author is required' }),
	description: z.string().optional(),
	isbn: z.string().min(1, { message: 'ISBN is required' }),
	price: z.number().positive({ message: 'Price must be a positive number' }),
	categoryId: z.string().min(1, { message: 'CategoryId is required' }),
	stock: z.number().int().nonnegative({ message: 'Stock must be a non-negative integer' }),
	publishedDate: z.string().datetime({ message: 'Published Date must be a valid date' }).optional(),
	coverImage: z.string().optional(),
});
