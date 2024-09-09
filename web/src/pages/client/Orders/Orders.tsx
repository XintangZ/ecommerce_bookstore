import { Alert, Breadcrumbs, FormControl, Grid, InputLabel, MenuItem, Select, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { FilterChips, LinkRouter, Loading, MuiPagination, OrderStatusSelect } from '../../../components';
import { useGetAllOrders } from '../../../services';
import { GetAllOrdersResT } from '../../../types';
import OrderTable from './OrderTable'; // Import the new component

export function Orders() {
	const [page, setPage] = useState<number>(1);
	const [sortBy, setSortBy] = useState<string>('placedAt');
	const [order, setOrder] = useState<'asc' | 'desc'>('desc');
	const [open, setOpen] = useState<string | null>(null);

	const [searchParams, _setSearchParams] = useSearchParams();
	const params = Object.fromEntries(searchParams.entries());

	const limit = 10;
	const token = localStorage.getItem('token');
	const { data, isPending, isError, isSuccess } = useGetAllOrders(token || '', page, limit, {
		sortBy,
		order,
		...params,
	});

	useEffect(() => {
		setPage(1);
	}, [limit, sortBy, order]);

	if (isPending) return <Loading />;
	if (isError) return <Navigate to='/error' replace />;
	if (isSuccess && !data) {
		return <Alert severity='info'>No orders found.</Alert>;
	}

	if (isSuccess && data) {
		const {
			pagination: { totalPages, totalItems },
		} = data as GetAllOrdersResT;

		return (
			<Stack gap={2}>
				<Breadcrumbs aria-label='breadcrumb'>
					<LinkRouter underline='hover' color='inherit' to='/'>
						Home
					</LinkRouter>
					<Typography color='text.primary'>Orders</Typography>
				</Breadcrumbs>

				<FilterChips />

				<Grid container spacing={2}>
					<Grid item xs={12} sm={6}>
						<Typography color={'text.secondary'}>
							{totalItems} {totalItems > 1 ? 'orders' : 'order'}
						</Typography>
					</Grid>

					<Grid item xs={12} sm={6}>
						<Grid container spacing={2} sx={{ display: 'flex', justifyContent: 'end' }}>
							<Grid item xs={6} md={5} lg={4}>
								<OrderStatusSelect size='small' displayEmpty fullWidth />
							</Grid>

							<Grid item xs={6} md={5} lg={4}>
								<FormControl variant='outlined' size='small' fullWidth>
									<InputLabel>Sort By</InputLabel>
									<Select
										value={`${sortBy}_${order}`}
										onChange={e => {
											const [field, sortOrder] = (e.target.value as string).split('_');
											setSortBy(field);
											setOrder(sortOrder as 'asc' | 'desc');
										}}
										label='Sort By'>
										<MenuItem value='placedAt_asc'>Date (Asc)</MenuItem>
										<MenuItem value='placedAt_desc'>Date (Desc)</MenuItem>
										<MenuItem value='status_asc'>Status (Asc)</MenuItem>
										<MenuItem value='status_desc'>Status (Desc)</MenuItem>
									</Select>
								</FormControl>
							</Grid>
						</Grid>
					</Grid>
				</Grid>

				<OrderTable orders={data} open={open} setOpen={setOpen} />

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
