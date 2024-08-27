import { z } from 'zod';
import { createReviewSchema } from '../../../server/src/schema';
import { PaginationT } from './common.type';
import { UserT } from './user.type';

export type ReviewT = z.infer<typeof createReviewSchema> & {
	_id: string;
	bookId: string;
	userId: UserT;
};

export type GetReviewsResT = {
	data: ReviewT[];
	pagination: PaginationT;
};
