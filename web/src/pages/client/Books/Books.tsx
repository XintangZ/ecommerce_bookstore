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
import { Navigate, useSearchParams } from 'react-router-dom';
import { CategorySelect, FilterChips, LinkRouter, Loading, MuiPagination } from '../../../components';
import { useGetBooks } from '../../../services';
import { BookCard } from './BookCard';

export function Books() {
	const [page, setPage] = useState(1);
	const [sortBy, setSortBy] = useState('createdAt');
	const [order, setOrder] = useState<'asc' | 'desc'>('desc');
	const [searchParams, setSearchParams] = useSearchParams();
	const params = Object.fromEntries(searchParams.entries());

	const limit = 12;
	const { data, isPending, isError, isSuccess } = useGetBooks(page, limit, {
		sortBy,
		order,
		...params,
	});

	useEffect(() => {
		setPage(1);
	}, [limit, sortBy, order]);

	const onAvailabilityChange = (_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
		if (checked) {
			searchParams.set('isAvailable', 'true');
		} else {
			searchParams.delete('isAvailable');
		}
		setSearchParams(searchParams);
	};

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

				<FilterChips />

				<Grid container spacing={2}>
					<Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
						<Typography color={'text.secondary'}>
							{totalItems} {totalItems === 1 ? 'item' : 'items'}
						</Typography>

						<FormControlLabel
							control={
								<Checkbox
									size='small'
									checked={!!searchParams.get('isAvailable')}
									onChange={onAvailabilityChange}
								/>
							}
							label={<Typography variant='body2'>In Stock</Typography>}
						/>
					</Grid>

					<Grid item xs={12} sm={6}>
						<Grid container spacing={2} sx={{ display: 'flex', justifyContent: 'end' }}>
							<Grid item xs={6} md={5} lg={4}>
								<CategorySelect size='small' displayEmpty fullWidth />
							</Grid>

							<Grid item xs={6} md={5} lg={4}>
								<FormControl variant='outlined' size='small' fullWidth>
									<InputLabel>Sort By</InputLabel>
									<Select
										value={`${sortBy}_${order}`}
										onChange={e => {
											const [field, order] = (e.target.value as string).split('_');
											setSortBy(field);
											setOrder(order as 'asc' | 'desc');
										}}
										label='Sort By'>
										<MenuItem value='createdAt_desc'>New Arrival</MenuItem>
										<MenuItem value='title_asc'>Title (Asc)</MenuItem>
										<MenuItem value='title_desc'>Title (Desc)</MenuItem>
										<MenuItem value='price_asc'>Price (Asc)</MenuItem>
										<MenuItem value='price_desc'>Price (Desc)</MenuItem>
									</Select>
								</FormControl>
							</Grid>
						</Grid>
					</Grid>
				</Grid>

				{!!books.length ? (
					<>
						<Grid container spacing={3}>
							{books.map(book => (
								<Grid item key={book.isbn} xs={12} sm={6} md={4} lg={3} zeroMinWidth>
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
					</>
				) : (
					<Typography variant='h6' align='center' sx={{ my: 4, color: 'text.secondary' }}>
						No result.
					</Typography>
				)}
			</Stack>
		);
	}
}
