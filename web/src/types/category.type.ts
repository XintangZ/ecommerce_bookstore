import { z } from 'zod';
import { createCategorySchema } from '../../../server/src/schema';

export type CreateCategoryT = z.infer<typeof createCategorySchema>;

export type CategoryT = CreateCategoryT & {
	_id: string;
};

export type GetCategoriesResT = {
	data: CategoryT[];
};

export type CategoryResT = {
	data: CategoryT;
};
