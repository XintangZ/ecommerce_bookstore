import { useState, useEffect } from 'react';
import {
  Alert,
  Breadcrumbs,
  Button,
  Stack,
  Typography,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
} from '@mui/material';
import { Navigate } from 'react-router-dom';
import { fetchCart, useUpdateCart } from '../../../services'; 
import { LinkRouter, Loading } from '../../../components'; 
import { BookT, CartItemT } from '../../../types';
import { Add, Remove } from '@mui/icons-material';
import { useCart } from '../../../contexts';


export function ShoppingCart() {
  const token = localStorage.getItem('token');
	const [cart, setCart] = useState<CartItemT[]>([]);
	const [isPending, setIsPending] = useState(true);
	const [isError, setIsError] = useState(false);
  const { addToCartAndUpdateServer, removeFromCart } = useCart();
  const updateCartMutation = useUpdateCart(token || '');

	useEffect(() => {
		if (token) {
			fetchCart(token)
				.then(data => {
					setCart(data.items);
					setIsPending(false);
				})
				.catch(() => {
					setIsError(true);
					setIsPending(false);
				});
		} else {
			setIsPending(false);
			setIsError(true);
		}
	}, []);

  const handleQuantityChange = (bookId: string, quantity: number, stock: number) => {
    if (quantity === 0) {
      setCart(prevCart => prevCart.filter(item => item.bookId._id !== bookId));
    } else if (quantity <= stock) {
      setCart(prevCart =>
        prevCart.map(item =>
          item.bookId._id === bookId
            ? { ...item, quantity }
            : item
        )
      );
    }
  };

  const removeFromCartAndUpdateServer = async (book: BookT) => {
    const newItem: CartItemT = {
      bookId: book,
      quantity: 1,
    };
    removeFromCart(newItem);

    if (token) {
      try {
        await updateCartMutation.mutateAsync({
          bookId: book._id,
					action:'remove',
          quantity: 1,
        });
      } catch (error) {
        console.error('Failed to update cart', error);
      }
    }
  };

	if (isPending) return <Loading />;

	if (isError) return <Navigate to='/error' replace />;

	if (!cart.length) {
		return <Alert severity='info'>Your cart is empty.</Alert>;
	}

  function subtotal(cartItems: readonly CartItemT[]) {
    return cartItems.reduce((total, cartItem) => {
      return total + cartItem.bookId.price * cartItem.quantity;
    }, 0);
  }

  function priceRow(qty: number, unit: number) {
    return qty * unit;
  }

	return (
		<Stack gap={2}>
			<Breadcrumbs aria-label='breadcrumb'>
				<LinkRouter underline='hover' color='inherit' to='/'>
					Home
				</LinkRouter>
				<Typography color='text.primary'>Shopping Cart</Typography>
			</Breadcrumbs>


      <TableContainer component={Paper}>
      <Table sx={{ minWidth: 700 }} aria-label="spanning table">
        <TableHead>
          <TableRow>
            <TableCell>Items</TableCell>
            <TableCell></TableCell>
            <TableCell align="right">price</TableCell>
            <TableCell align="right">Unit</TableCell>
            <TableCell align="right">Sum</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {cart.map((item) => (
            <TableRow key={item.bookId.title}>
              <TableCell>
                <Typography>{item.bookId.title}</Typography>
              </TableCell>
              <TableCell>
                <img
                  src={`https://covers.openlibrary.org/b/isbn/${item.bookId.isbn}-M.jpg`}
                  alt={item.bookId.title}
                  style={{ maxWidth: '80px', height: 'auto' }}
                />
              </TableCell>
              <TableCell align="right">
                <Typography variant="h6">${item.bookId.price}</Typography>
              </TableCell>
              <TableCell align="right">
                  <IconButton
                    onClick={() => {
                      handleQuantityChange(item.bookId._id, item.quantity - 1, item.bookId.stock);
                      removeFromCartAndUpdateServer(item.bookId);
                    }}
                    sx={{
                      marginRight: 1,
                      color: 'black', 
                      backgroundColor: 'lightgray', 
                      width: '36px', 
                      height: '36px', 
                      fontSize: '20px',
                    }}
                  >
                    <Remove />
                  </IconButton>
                  <Typography component="span" variant="body1" sx={{ marginX: 2 }}>
                    {item.quantity}
                  </Typography>
                  <IconButton
                    onClick={() => {
                      handleQuantityChange(item.bookId._id, item.quantity + 1, item.bookId.stock);
                      addToCartAndUpdateServer(item.bookId);
                    }}
                    disabled={item.quantity >= item.bookId.stock}
                    sx={{
                      marginLeft: 1,
                      color: 'black', 
                      backgroundColor: 'lightgray', 
                      width: '36px', 
                      height: '36px', 
                      fontSize: '20px',
                    }}
                  >
                    <Add />
                  </IconButton>
                </TableCell>
              <TableCell align="right">
                <Typography>${priceRow(item.bookId.price, item.quantity).toFixed(2)}</Typography>
              </TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell rowSpan={3} />
            <TableCell colSpan={3}>
              <Typography>Subtotal</Typography>
            </TableCell>
            <TableCell align="right">
              <Typography>${subtotal(cart).toFixed(2)}</Typography>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>

			<Button variant="contained" color="primary" sx={{ alignSelf: 'center' }}>
				Proceed to Checkout
			</Button>
		</Stack>
	);
}
