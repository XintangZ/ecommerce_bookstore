import { Add, Remove } from '@mui/icons-material';
import {
	Alert,
	Breadcrumbs,
	Button,
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
import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { LinkRouter, Loading } from '../../../components';
import { useAuth, useCart } from '../../../contexts';
import { fetchCart, useUpdateCartItem } from '../../../services';
import { BookT, CartItemT } from '../../../types';
import { getCartItemFromLocalStorage } from '../../../utils';

export function ShoppingCart() {
	const navigate = useNavigate();
	const { auth } = useAuth();
	const [cart, setCart] = useState<CartItemT[]>([]);
	const [isPending, setIsPending] = useState(true);
	const [isError, setIsError] = useState(false);
	const { addToCartAndUpdateServer, removeFromCart, setCartListAndCount } = useCart();
	const updateCartMutation = useUpdateCartItem(auth?.token as string);

	const totalQuantity = useMemo(() => cart.reduce((total, item) => total + item.quantity, 0), [cart]);
	const subtotal = useMemo(() => cart.reduce((total, item) => total + item.bookId.price * item.quantity, 0), [cart]);

	useEffect(() => {
		if (auth) {
			fetchCart(auth?.token)
				.then(data => {
					setCart(data.items);
					setIsPending(false);
				})
				.catch(() => {
					setIsError(true);
					setIsPending(false);
				});
		} else {
			const items = getCartItemFromLocalStorage();
			setCartListAndCount(items);
			setCart(items);
			setIsPending(false);
		}
	}, [auth]);

	const handleQuantityChange = (bookId: string, quantity: number, stock: number) => {
		if (quantity === 0) {
			setCart(prevCart => prevCart.filter(item => item.bookId._id !== bookId));
		} else if (quantity <= stock) {
			setCart(prevCart => prevCart.map(item => (item.bookId._id === bookId ? { ...item, quantity } : item)));
		}
	};

	const removeFromCartAndUpdateServer = async (book: BookT) => {
		removeFromCart({ bookId: book, quantity: 1 });

		if (auth) {
			try {
				await updateCartMutation.mutateAsync({
					bookId: book._id,
					action: 'remove',
					quantity: 1,
				});
			} catch (error) {
				console.error('Failed to update cart', error);
			}
		}
	};

	if (isPending) return <Loading />;

	if (isError) return <Navigate to='/error' replace />;

	function priceRow(qty: number, unit: number) {
		return qty * unit;
	}

	const handleCheckout = () => {
		if (!auth) {
			navigate('/login');
		} else {
			navigate('/cart/checkout');
		}
	};

	return (
		<Stack gap={2}>
			<Breadcrumbs aria-label='breadcrumb'>
				<LinkRouter underline='hover' color='inherit' to='/'>
					Home
				</LinkRouter>
				<Typography color='text.primary'>Shopping Cart</Typography>
			</Breadcrumbs>

			<Typography color={'text.secondary'}>
				{totalQuantity} {totalQuantity > 1 ? 'items' : 'item'}
			</Typography>

			{cart.length ? (
				<TableContainer component={Paper} variant='outlined'>
					<Table sx={{ minWidth: 700 }} aria-label='spanning table'>
						<TableHead>
							<TableRow>
								<TableCell>
									<Typography fontWeight='bold' textAlign='center'>
										Item
									</Typography>
								</TableCell>
								<TableCell></TableCell>
								<TableCell>
									<Typography fontWeight='bold' textAlign='right' pr={5}>
										Price
									</Typography>
								</TableCell>
								<TableCell>
									<Typography fontWeight='bold' textAlign='center'>
										Quantity
									</Typography>
								</TableCell>
								<TableCell>
									<Typography fontWeight='bold' textAlign='right' pr={5}>
										Total
									</Typography>
								</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{cart.map(item => (
								<TableRow key={item.bookId.title}>
									<TableCell sx={{ display: 'flex', justifyContent: 'center' }}>
										<LinkRouter to={`/books/${item.bookId._id}`}>
											<img
												src={`https://covers.openlibrary.org/b/isbn/${item.bookId.isbn}-M.jpg`}
												alt={item.bookId.title}
												style={{
													maxWidth: '80px',
													height: 'auto',
													boxShadow: '0px 0px 5px rgba(0,0,0,0.1)',
												}}
											/>
										</LinkRouter>
									</TableCell>
									<TableCell>
										<LinkRouter to={`/books/${item.bookId._id}`}>
											<Typography variant='subtitle1'>{item.bookId.title}</Typography>
										</LinkRouter>
									</TableCell>
									<TableCell align='right'>
										<Typography variant='h6' pr={5}>
											${item.bookId.price.toFixed(2)}
										</Typography>
									</TableCell>
									<TableCell align='center'>
										<IconButton
											size='small'
											onClick={() => {
												handleQuantityChange(
													item.bookId._id,
													item.quantity - 1,
													item.bookId.stock
												);
												removeFromCartAndUpdateServer(item.bookId);
											}}
											sx={{
												marginRight: 1,
												color: 'black',
												backgroundColor: '#e0e0e0',
												'&:hover': { backgroundColor: '#d0d0d0' },
											}}>
											<Remove />
										</IconButton>
										<Typography component='span' variant='body1' sx={{ marginX: 1 }}>
											{item.quantity}
										</Typography>
										<IconButton
											onClick={() => {
												handleQuantityChange(
													item.bookId._id,
													item.quantity + 1,
													item.bookId.stock
												);
												addToCartAndUpdateServer(item.bookId);
											}}
											disabled={item.quantity >= item.bookId.stock}
											size='small'
											sx={{
												marginLeft: 1,
												color: 'black',
												backgroundColor: '#e0e0e0',
												'&:hover': { backgroundColor: '#d0d0d0' },
											}}>
											<Add />
										</IconButton>
									</TableCell>
									<TableCell align='right'>
										<Typography variant='h6' pr={5}>
											${priceRow(item.bookId.price, item.quantity).toFixed(2)}
										</Typography>
									</TableCell>
								</TableRow>
							))}
							<TableRow>
								<TableCell rowSpan={1} />
								<TableCell colSpan={3} align='right'>
									<Typography variant='h6'>Subtotal:</Typography>
								</TableCell>
								<TableCell align='right'>
									<Typography variant='h6' pr={5}>
										${subtotal.toFixed(2)}
									</Typography>
								</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</TableContainer>
			) : (
				<Alert severity='info'>Your cart is empty.</Alert>
			)}

			<Stack direction='row-reverse' gap={3} my={2}>
				<Button
					variant='contained'
					size='large'
					color='primary'
					onClick={handleCheckout}
					sx={{ display: cart.length ? 'block' : 'none' }}>
					Proceed to Checkout
				</Button>
				<Button variant='outlined' size='large' color='primary' onClick={() => navigate('/')}>
					Continue Shopping
				</Button>
			</Stack>
		</Stack>
	);
}
