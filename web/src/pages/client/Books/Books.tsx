import {
	Alert,
	Breadcrumbs,
	Checkbox,
	FormControl,
	FormControlLabel,
	Grid,
	InputLabel,
	MenuItem,
	Select,
	Stack,
	Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { LinkRouter, Loading, MuiPagination } from '../../../components';
import { useGetBooks } from '../../../services';
import { BookCard } from './BookCard';

export function Books() {
	const [page, setPage] = useState(1);
	const [sortBy, setSortBy] = useState('title');
	const [order, setOrder] = useState<'asc' | 'desc'>('asc');
	const [isAvailable, setIsAvailable] = useState<boolean | undefined>();

	const limit = 12;
	const { data, isPending, isError, isSuccess } = useGetBooks(page, limit, {
		sortBy,
		order,
		isAvailable,
	});

	useEffect(() => {
		setPage(1);
	}, [limit, sortBy, order, isAvailable]);

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

				<Stack direction='row' justifyContent='space-between'>
					<Stack direction='row' gap={{ xs: 2, sm: 3 }} alignItems='center'>
						<Typography color={'text.secondary'}>
							{totalItems} {totalItems === 1 ? 'item' : 'items'}
						</Typography>

						<FormControlLabel
							control={
								<Checkbox
									size='small'
									checked={isAvailable || false}
									onChange={e =>
										e.target.checked ? setIsAvailable(true) : setIsAvailable(undefined)
									}
								/>
							}
							label={<Typography variant='body2'>In Stock</Typography>}
						/>
					</Stack>

					<FormControl variant='outlined' size='small' sx={{ width: 150 }}>
						<InputLabel>Sort By</InputLabel>
						<Select
							value={`${sortBy}_${order}`}
							onChange={e => {
								const [field, order] = (e.target.value as string).split('_');
								setSortBy(field);
								setOrder(order as 'asc' | 'desc');
							}}
							label='Sort By'>
							<MenuItem value='title_asc'>Title (Asc)</MenuItem>
							<MenuItem value='title_desc'>Title (Desc)</MenuItem>
							<MenuItem value='price_asc'>Price (Asc)</MenuItem>
							<MenuItem value='price_desc'>Price (Desc)</MenuItem>
						</Select>
					</FormControl>
				</Stack>

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
