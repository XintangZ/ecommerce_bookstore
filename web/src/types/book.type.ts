import { z } from 'zod';
import { createBookSchema } from '../../../server/src/schema/book.schema';
import { CategoryT } from './category.type';
import { PaginationT } from './common.type';

export type createBookT = z.infer<typeof createBookSchema>;

export type BookT = createBookT & {
	_id: string;
};

export type GetBooksResT = {
	data: BookT[];
	pagination: PaginationT;
};

export type GetBookByIdResT = {
	data: BookT & {
		categoryId: CategoryT;
	};
};
