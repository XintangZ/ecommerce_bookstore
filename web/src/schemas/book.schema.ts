import { z } from 'zod';

export const StockSchema = z
	.string()
	.min(1, { message: 'Stock is required' })
	.transform(value => parseInt(value, 10))
	.refine(value => !isNaN(value) && Number.isInteger(value) && value >= 0, {
		message: 'Stock must be a non-negative integer',
	});

export const CreateBookSchema = z.object({
	title: z.string().min(1, { message: 'Title is required' }),
	author: z.string().min(1, { message: 'Author is required' }),
	description: z.string().optional(),
	isbn: z.string().min(1, { message: 'ISBN is required' }),
	price: z
		.string()
		.min(1, { message: 'Price is required' })
		.transform(value => parseFloat(value))
		.refine(value => !isNaN(value) && value > 0, { message: 'Price must be a positive number' }),
	categoryId: z.string().min(1, { message: 'Category is required' }),
	stock: StockSchema,
	publishedDate: z
		.string()
		.transform(value => new Date(value)) // Convert string to Date
		.refine(value => !isNaN(value.getTime()), { message: 'Published Date must be a valid date' })
		.optional(),
	coverImage: z.string().optional(),
	createdAt: z.date().default(new Date()),
});
