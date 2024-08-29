import { Alert, Button, Card, CardActions, CardContent, Grid, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Loading } from '../../../components';
import { LOW_STOCK_QTY } from '../../../consts';
import { useGetBooks } from '../../../services';

export function AdminDashboard() {
	const navigate = useNavigate();

	const booksQuery = useGetBooks(1, 1);
	const outOfStockQuery = useGetBooks(1, 1, { isAvailable: false });
	const lowInStockQuery = useGetBooks(1, 1, { isAvailable: true, maxStock: LOW_STOCK_QTY });

	const bookStats = () => {
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
							<Alert severity='error'>
								<b>{outOfStockCount}</b> {outOfStockCount > 1 ? 'books' : 'book'} out of stock.
							</Alert>
						) : (
							<Alert severity='success'>No book out of stock.</Alert>
						)}
						{lowInStockCount ? (
							<Alert severity='warning'>
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
								{bookStats()}
							</Stack>
						</CardContent>
						<CardActions sx={{ justifyContent: 'flex-end' }}>
							<Button size='small' onClick={() => navigate('/admin/books')}>
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
								<Alert severity='success' sx={{ width: '100%', alignItems: 'center' }}>
									No pending orders to proceed.
								</Alert>
							</Stack>
						</CardContent>
						<CardActions sx={{ justifyContent: 'flex-end' }}>
							<Button size='small'>View All {booksQuery.data?.pagination.totalItems} Orders</Button>
						</CardActions>
					</Card>
				</Grid>
			</Grid>
		</Stack>
	);
}
