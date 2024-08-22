import { z } from 'zod';

export const createCategorySchema = z.object({
	name: z.string().min(1, { message: 'Category name is required.' }),
	description: z.string().optional(),
});
