import { Alert, List, Typography } from '@mui/material';
import { useState } from 'react';
import { Loading, MuiPagination } from '../../../components';
import { useGetReviewsByBook } from '../../../services';
import { ReviewItem } from './ReviewItem';

interface PropsI {
	bookId: string;
}

export function Reviews({ bookId }: PropsI) {
	const [page, setPage] = useState(1);

	const limit = 12;
	const { data, isPending, isError, isSuccess } = useGetReviewsByBook(bookId, page, limit);

	if (isPending) return <Loading />;

	if (isError) return <Alert severity='error'>An error occurred.</Alert>;

	if (isSuccess && !data?.data.length) {
		return <Typography color='text.secondary'>No reviews found.</Typography>;
	}

	if (isSuccess && data) {
		const {
			data: reviews,
			pagination: { totalPages },
		} = data;

		return (
			<div>
				<List disablePadding>
					{reviews.map(review => (
						<ReviewItem key={review._id} review={review} />
					))}
				</List>

				{totalPages > 1 && (
					<MuiPagination
						count={totalPages}
						page={page}
						setPage={setPage}
						sx={{ alignSelf: 'center', my: { xs: 2, sm: 3, md: 4 } }}
						size='small'
					/>
				)}
			</div>
		);
	}
}
