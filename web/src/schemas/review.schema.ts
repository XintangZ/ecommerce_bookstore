import { z } from 'zod';

export const ReviewValidationSchema = z.object({
	rating: z.number().min(1).max(5),
	review: z
		.string()
		.min(10, { message: 'Your review must be at least 10 characters' })
		.max(2000, { message: 'Your review must not exceed 2000 characters' }),
});
