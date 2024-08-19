import { z } from 'zod';

export const createBookSchema = z.object({
	title: z.string().min(1, { message: 'Title is required' }),
	author: z.string().min(1, { message: 'Author is required' }),
	description: z.string().optional(),
	isbn: z.string().optional(),
	price: z.number().positive({ message: 'Price must be a positive number' }),
	category: z.string().min(1, { message: 'Category is required' }),
	stock: z.number().int().nonnegative({ message: 'Stock must be a non-negative integer' }),
	publishedDate: z.string().datetime({ message: 'Published Date must be a valid date' }).optional(),
	coverImage: z.string().optional(),
});
