import { z } from 'zod';
import { CreateBookSchema } from '../schemas';
import { CategoryT } from './category.type';
import { PaginationT } from './common.type';

export type CreateBookT = z.infer<typeof CreateBookSchema>;

export type BookT = CreateBookT & {
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
