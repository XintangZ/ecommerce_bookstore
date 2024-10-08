import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import {
	Box,
	Button,
	Collapse,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	IconButton,
	Paper,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
} from '@mui/material';
import { green, yellow } from '@mui/material/colors';
import { useQueryClient } from '@tanstack/react-query';
import { enqueueSnackbar } from 'notistack';
import React from 'react';
import { BookReviewDialog, LinkRouter } from '../../../components';
import { useUpdateMultipleBookStocks, useUpdateOrder } from '../../../services';
import { CreateOrderValidationT, GetAllOrdersResT } from '../../../types';

interface OrderTableProps {
	orders: GetAllOrdersResT;
	open: string | null;
	setOpen: (id: string | null) => void;
}

const OrderTable: React.FC<OrderTableProps> = ({ orders, open, setOpen }) => {
	const [openDialog, setOpenDialog] = React.useState(false);
	const [selectedOrderId, setSelectedOrderId] = React.useState<string | null>(null);
	const [isShipping, setIsShipping] = React.useState(false); // To differentiate between cancel and ship
	const token = localStorage.getItem('token') || '';
	const { mutate: updateOrder } = useUpdateOrder(token);
	const { mutate: updateStock } = useUpdateMultipleBookStocks(token);

	const user = localStorage.getItem('user');
	const isAdmin = user ? JSON.parse(user).isAdmin : false;

	const queryClient = useQueryClient();

	const handleCancelClick = (orderId: string) => {
		setSelectedOrderId(orderId);
		setIsShipping(false); // Set to false for cancel action
		setOpenDialog(true);
	};

	const handleShipClick = (orderId: string) => {
		setSelectedOrderId(orderId);
		setIsShipping(true); // Set to true for ship action
		setOpenDialog(true);
	};

	const handleDialogClose = (confirm: boolean) => {
		setOpenDialog(false);
		if (confirm && selectedOrderId) {
			const status = isShipping ? 'Shipped' : 'Cancelled';

			// Find the selected order based on selectedOrderId
			const selectedOrder = orders.data.find(order => order._id === selectedOrderId);

			if (selectedOrder) {
				updateOrder(
					{ orderId: selectedOrderId, status },
					{
						onSuccess: async () => {
							if (isShipping) {
								// Extract stock changes for each book in the order
								const stockChanges = selectedOrder.books.map(book => ({
									bookId: book.bookId,
									stockChange: -book.quantity, // Reduce stock by the order quantity
								}));

								// Update stock for each book
								for (const { bookId, stockChange } of stockChanges) {
									updateStock(
										{ bookIds: [bookId._id], stockChange },
										{
											onError: error =>
												console.error(`Error updating stock for book ID: ${bookId}`, error),
										}
									);
								}
							}
							queryClient.invalidateQueries({ queryKey: ['orders'] });
							enqueueSnackbar(`Order ${isShipping ? 'shipped' : 'cancelled'} successfully`, {
								variant: 'success',
							});
						},
						onError: error => {
							enqueueSnackbar('Something went wrong', {
								variant: 'error',
							});
							console.error('Error updating order:', error);
						},
					}
				);
			}
		}
		setSelectedOrderId(null);
	};

	const formatShippingAddress = (address: CreateOrderValidationT['shippingAddress']) => {
		return `${address.firstName} ${address.lastName}, ${address.street}, ${address.city}, ${address.province}, ${address.postalCode}, Phone: ${address.phone}`;
	};

	return (
		<>
			{orders.data.length === 0 ? (
				<Typography variant='h6' align='center' sx={{ my: 4, color: 'text.secondary' }}>
					No Orders.
				</Typography>
			) : (
				<TableContainer component={Paper} variant='outlined'>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell />
								<TableCell>Order ID</TableCell>
								<TableCell>Total Amount</TableCell>
								<TableCell>Placed At</TableCell>
								<TableCell>Status</TableCell>
								<TableCell>Shipping Address</TableCell>
								<TableCell>Action</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{orders.data.map(order => (
								<React.Fragment key={order._id}>
									<TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
										<TableCell>
											<IconButton
												size='small'
												onClick={() => setOpen(open === order._id ? null : order._id)}>
												{open === order._id ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
											</IconButton>
										</TableCell>
										<TableCell>{order._id}</TableCell>
										<TableCell>${order.totalAmount.toFixed(2)}</TableCell>
										<TableCell>
											{order.placedAt ? new Date(order.placedAt).toLocaleString() : 'N/A'}
										</TableCell>
										<TableCell
											sx={{
												fontWeight: 'bold',
												color:
													order.status === 'Pending'
														? yellow[800]
														: order.status === 'Shipped'
														? green[700]
														: 'text.secondary',
											}}>
											{order.status}
										</TableCell>
										<TableCell>{formatShippingAddress(order.shippingAddress)}</TableCell>
										<TableCell>
											{order.status === 'Pending' && (
												<Stack gap={1} justifyContent='center'>
													<Button
														size='small'
														fullWidth
														variant='outlined'
														color='error'
														onClick={() => handleCancelClick(order._id)}>
														Cancel
													</Button>
													{isAdmin && (
														<Button
															size='small'
															fullWidth
															variant='outlined'
															color='primary'
															onClick={() => handleShipClick(order._id)}>
															Ship
														</Button>
													)}
												</Stack>
											)}
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
											<Collapse in={open === order._id} timeout='auto' unmountOnExit>
												<Box sx={{ margin: 1 }}>
													<Typography variant='h6' gutterBottom component='div'>
														Order Details
													</Typography>
													<Table size='small' aria-label='order details'>
														<TableHead>
															<TableRow>
																{isAdmin && <TableCell>Book ISBN</TableCell>}
																<TableCell>Book Title</TableCell>
																<TableCell>Quantity</TableCell>
																<TableCell colSpan={2}>Price</TableCell>
															</TableRow>
														</TableHead>
														<TableBody>
															{order.books.map(book => {
																return (
																	<TableRow key={book.bookId._id}>
																		{isAdmin && (
																			<TableCell>{book.bookId.isbn}</TableCell>
																		)}
																		<TableCell>
																			<LinkRouter
																				noWrap
																				underline='hover'
																				to={`/books/${book.bookId._id}`}>
																				{book.bookId.title}
																			</LinkRouter>
																		</TableCell>
																		<TableCell>{book.quantity}</TableCell>
																		<TableCell>${book.price.toFixed(2)}</TableCell>
																		{!isAdmin && order.status === 'Shipped' && (
																			<TableCell width={170}>
																				<BookReviewDialog
																					bookId={book.bookId._id}
																					bookTitle={book.bookId.title}
																				/>
																			</TableCell>
																		)}
																	</TableRow>
																);
															})}
														</TableBody>
													</Table>
												</Box>
											</Collapse>
										</TableCell>
									</TableRow>
								</React.Fragment>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			)}

			{/* Confirmation Dialog */}
			<Dialog open={openDialog} onClose={() => handleDialogClose(false)}>
				<DialogTitle>{isShipping ? 'Confirm Shipment' : 'Confirm Cancellation'}</DialogTitle>
				<DialogContent>
					<DialogContentText>
						{isShipping
							? 'Do you want to ship this order?'
							: 'Are you sure you want to cancel this order? This action cannot be undone.'}
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => handleDialogClose(false)} color='primary'>
						No
					</Button>
					<Button onClick={() => handleDialogClose(true)} color='secondary'>
						Yes
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};

export default OrderTable;
