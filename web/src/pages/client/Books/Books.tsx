import { Alert, Breadcrumbs, Grid, Link, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { Loading, MuiPagination } from '../../../components';
import { useGetBooks } from '../../../services/book.service';
import { BookCard } from './BookCard';

export function Books() {
	const [page, setPage] = useState(1);

	const { data, isPending, isError, isSuccess } = useGetBooks(page);

	if (isPending) return <Loading />;

	if (isError) return <Alert severity='error'>An error occurred.</Alert>;

	if (isSuccess && !data) {
		return <Alert severity='warning'>No books found.</Alert>;
	}

	if (isSuccess && data) {
		const {
			data: books,
			pagination: { totalPages, totalItems },
		} = data;

		return (
			<Stack gap={2}>
				<Breadcrumbs aria-label='breadcrumb'>
					<Link underline='hover' color='inherit' href='/'>
						Home
					</Link>
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

				<MuiPagination count={totalPages} page={page} setPage={setPage} sx={{ alignSelf: 'center' }} />
			</Stack>
		);
	}
}
