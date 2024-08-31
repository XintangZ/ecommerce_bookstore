import { Alert, Button, Card, CardActions, CardContent, Grid, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Loading } from '../../../components';
import { useAuth } from '../../../contexts';
import { useGetAllOrders, useGetBooks } from '../../../services';

export function AdminDashboard() {
	const { auth } = useAuth();
	const navigate = useNavigate();

	const booksQuery = useGetBooks(1, 1);
	const outOfStockQuery = useGetBooks(1, 1, { isAvailable: false });
	const lowInStockQuery = useGetBooks(1, 1, { isLowStock: true });

	const orderQuery = useGetAllOrders(auth?.token as string, 1, 1);
	const pendingOrderQuery = useGetAllOrders(auth?.token as string, 1, 1, { status: 'Pending' });

	const stockStats = () => {
		if (outOfStockQuery.isPending || lowInStockQuery.isPending) return <Loading />;

		if (outOfStockQuery.isError || lowInStockQuery.isError)
			return (
				<Alert severity='error' sx={{ width: '100%', alignItems: 'center' }}>
					Cannot fetch book data.
				</Alert>
			);

		if (outOfStockQuery.isSuccess && lowInStockQuery.isSuccess) {
			const outOfStockCount = outOfStockQuery.data?.pagination.totalItems;
			const lowInStockCount = lowInStockQuery.data?.pagination.totalItems;

			if (!outOfStockCount && !lowInStockCount) {
				return (
					<Alert severity='success' sx={{ width: '100%', alignItems: 'center' }}>
						All books are in stock.
					</Alert>
				);
			} else {
				return (
					<Stack gap={2} width='100%'>
						{outOfStockCount ? (
							<Alert
								severity='error'
								action={
									<Button
										color='inherit'
										size='small'
										onClick={() => navigate('/books?isAvailable=false')}>
										View
									</Button>
								}>
								<b>{outOfStockCount}</b> {outOfStockCount > 1 ? 'books' : 'book'} out of stock.
							</Alert>
						) : (
							<Alert severity='success'>No book out of stock.</Alert>
						)}
						{lowInStockCount ? (
							<Alert
								severity='warning'
								action={
									<Button
										color='inherit'
										size='small'
										onClick={() => navigate(`/books?isLowStock=true`)}>
										View
									</Button>
								}>
								<b>{lowInStockCount}</b> {lowInStockCount > 1 ? 'books' : 'book'} low in stock.
							</Alert>
						) : (
							<Alert severity='success'>No book low in stock.</Alert>
						)}
					</Stack>
				);
			}
		}
	};

	const orderStats = () => {
		if (pendingOrderQuery.isPending) return <Loading />;

		if (pendingOrderQuery.isError)
			return (
				<Alert severity='error' sx={{ width: '100%', alignItems: 'center' }}>
					Cannot fetch order data.
				</Alert>
			);

		if (orderQuery.isSuccess) {
			const pendingOrderCount = pendingOrderQuery.data?.pagination.totalItems;

			return pendingOrderCount ? (
				<Alert
					severity='info'
					sx={{ width: '100%', alignItems: 'center' }}
					action={
						<Button color='inherit' size='small' onClick={() => navigate('/orders?status=Pending')}>
							View
						</Button>
					}>
					<b>{pendingOrderCount}</b> pending {pendingOrderCount > 1 ? 'orders' : 'order'} to proceed.
				</Alert>
			) : (
				<Alert severity='success' sx={{ width: '100%', alignItems: 'center' }}>
					No pending orders to proceed.
				</Alert>
			);
		}
	};

	return (
		<Stack gap={2}>
			<Typography variant='h5' mt={2}>
				Admin Dashboard
			</Typography>

			<Grid container spacing={2}>
				<Grid item xs={12} sm={6}>
					<Card variant='outlined'>
						<CardContent>
							<Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
								Inventory Management
							</Typography>
							<Typography variant='h5' component='div'>
								Books
							</Typography>
							<Stack minHeight={110} mt={2} direction='row' alignItems='stretch'>
								{stockStats()}
							</Stack>
						</CardContent>
						<CardActions sx={{ justifyContent: 'flex-end' }}>
							<Button size='small' onClick={() => navigate('/books')}>
								View All {booksQuery.data?.pagination.totalItems} Books
							</Button>
						</CardActions>
					</Card>
				</Grid>

				<Grid item xs={12} sm={6}>
					<Card variant='outlined'>
						<CardContent>
							<Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
								Business Management
							</Typography>
							<Typography variant='h5' component='div'>
								Orders
							</Typography>
							<Stack minHeight={110} mt={2} direction='row' alignItems='stretch'>
								{orderStats()}
							</Stack>
						</CardContent>
						<CardActions sx={{ justifyContent: 'flex-end' }}>
							<Button size='small' onClick={() => navigate('/orders')}>
								View All {orderQuery.data?.pagination.totalItems} Orders
							</Button>
						</CardActions>
					</Card>
				</Grid>
			</Grid>
		</Stack>
	);
}
