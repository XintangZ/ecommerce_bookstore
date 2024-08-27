import { Alert, Breadcrumbs, Grid, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { LinkRouter, Loading, MuiPagination } from '../../../components';
import { useGetBooks } from '../../../services/book.service';
import { BookCard } from './BookCard';

export function Books() {
	const [page, setPage] = useState(1);

	const limit = 12;
	const { data, isPending, isError, isSuccess } = useGetBooks(page, limit);

	if (isPending) return <Loading />;

	if (isError) return <Navigate to='/error' replace />;

	if (isSuccess && !data) {
		return <Alert severity='info'>No books found.</Alert>;
	}

	if (isSuccess && data) {
		const {
			data: books,
			pagination: { totalPages, totalItems },
		} = data;

		return (
			<Stack gap={2}>
				<Breadcrumbs aria-label='breadcrumb'>
					<LinkRouter underline='hover' color='inherit' to='/'>
						Home
					</LinkRouter>
					<Typography color='text.primary'>Books</Typography>
				</Breadcrumbs>

				<Typography color={'text.secondary'}>
					{totalItems} {totalItems === 1 ? 'item' : 'items'}
				</Typography>

				<Grid container spacing={3}>
					{books.map(book => (
						<Grid item key={book.isbn} xs={12} sm={6} md={4} lg={3}>
							<BookCard book={book} />
						</Grid>
					))}
				</Grid>

				{totalPages > 1 && (
					<MuiPagination
						count={totalPages}
						page={page}
						setPage={setPage}
						sx={{ alignSelf: 'center', my: { xs: 2, sm: 3, md: 4 } }}
					/>
				)}
			</Stack>
		);
	}
}
