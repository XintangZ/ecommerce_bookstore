import { z } from 'zod';

export const createReviewSchema = z.object({
	rating: z.number().min(1).max(5),
	review: z.string().optional(),
	createdAt: z.date().optional(),
});

export const updateReviewSchema = z.object({
	rating: z.number().min(1).max(5).optional(),
	review: z.string().optional(),
});
