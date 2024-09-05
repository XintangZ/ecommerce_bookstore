import { z } from 'zod';

export const ReviewValidationSchema = z.object({
	rating: z.number({ message: 'Please leave your rating' }).min(0.5).max(5),
	review: z.string().optional(),
});
