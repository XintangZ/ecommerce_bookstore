import { useEffect, useState } from 'react';
import {
  Alert,
  Breadcrumbs,
  Button,
  Stack,
  Typography,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { LinkRouter } from '../../../components';
import { getCartItemFromLocalStorage } from '../../../utils';
import { useAuth } from '../../../contexts';
import { enqueueSnackbar } from 'notistack';
import { useCreateOrder, useClearCart, useGetUser } from '../../../services';
import { useCart } from '../../../contexts';

const provinces = [
  'Alberta',
  'British Columbia',
  'Manitoba',
  'New Brunswick',
  'Newfoundland and Labrador',
  'Northwest Territories',
  'Nova Scotia',
  'Ontario',
  'Prince Edward Island',
  'Quebec',
  'Saskatchewan',
  'Yukon',
];

const taxRates: {
  [key: string]: {
    gst?: number;
    pst?: number;
    hst?: number;
    qst?: number;
  };
} = {
  'Alberta': { gst: 0.05, pst: 0 },
  'British Columbia': { gst: 0.05, pst: 0.07 },
  'Manitoba': { gst: 0.05, pst: 0.07 },
  'New Brunswick': { gst: 0, hst: 0.15 },
  'Newfoundland and Labrador': { gst: 0, hst: 0.15 },
  'Northwest Territories': { gst: 0.05, pst: 0 },
  'Nova Scotia': { gst: 0, hst: 0.15 },
  'Nunavut': { gst: 0.05, pst: 0 },
  'Ontario': { gst: 0, hst: 0.13 },
  'Prince Edward Island': { gst: 0, hst: 0.15 },
  'Quebec': { gst: 0.05, qst: 0.09975 },
  'Saskatchewan': { gst: 0.05, pst: 0.06 },
  'Yukon': { gst: 0.05, pst: 0 }
};

export function Checkout() {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [address, setAddress] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    street: '',
    city: '',
    postalCode: '',
    province: ''
  });
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [isError, setIsError] = useState(false);
  const { data: userData } = useGetUser(auth?.token as string);
  const [phoneNumberError, setPhoneNumberError] = useState<string | null>(null);
  const [postalCodeError, setPostalCodeError] = useState<string | null>(null);

  const cart = getCartItemFromLocalStorage();

  const shippingCosts = {
    standard: 5.99, // Standard Shipping 3-4 days
    express: 12.99  // Express Shipping 1-2 days
  };

  const amountFreeShipping = 100;

  useEffect(() => {
    if (userData) {
      setAddress({
        ...address,
        street: userData.data.address?.street || '',
        city: userData.data.address?.city || '',
        postalCode: userData.data.address?.postalCode || '',
        province: userData.data.address?.province || ''
      });
    }
  }, [userData]);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'phoneNumber') {
      const phoneNumber = value.replace(/\D/g, '');

      const formattedNumber = phoneNumber.length > 0
        ? `${phoneNumber.substring(0, 3)}` +
        (phoneNumber.length > 3 ? `-${phoneNumber.substring(3, 6)}` : '') +
        (phoneNumber.length > 6 ? `-${phoneNumber.substring(6, 10)}` : '')
        : phoneNumber;

      // Check if phone number has less than 10 digits
      if (phoneNumber.length < 10) {
        setPhoneNumberError('Phone number must be at least 10 digits.');
      } else {
        setPhoneNumberError(null);
      }
      setAddress({ ...address, [name]: formattedNumber });
    } else if (name === 'postalCode') {
      // Postal Code Validation: First letter, second digit, third letter, space, digit, letter, digit
      const postalCodePattern = /^[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d$/;
      const isValid = postalCodePattern.test(value);
      setAddress({ ...address, [name]: value });
      if(!isValid) {
        setPostalCodeError('Please enter a valid postal code (e.g., A1A 1A1).');
      } else {
        setPostalCodeError(null);
      }
    } else {
      setAddress({ ...address, [name]: value });
    }
  };

  // Handle changes for Select (dropdown) elements
  const handleProvinceChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setAddress({ ...address, [name]: value });
  };

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingMethod(e.target.value);
  };

  const subtotal = cart.reduce((total, item) => {
    return total + item.bookId.price * item.quantity;
  }, 0);

  const gstRate = (taxRates[address.province]?.gst || taxRates[address.province]?.hst|| 0) * 100;
  const pstRate = (taxRates[address.province]?.pst || taxRates[address.province]?.qst || 0) * 100;
  const taxGst = (subtotal*gstRate/100);
  const taxPst = (subtotal*pstRate/100);
  const shippingCost = shippingCosts[shippingMethod as 'standard' | 'express'];
  const total = subtotal + shippingCost + taxGst + taxPst;

  // const handleSubmit = () => {
  //   if (address.street && address.city && address.postalCode && address.province) {
  //     // Proceed to payment or order confirmation
  //     navigate('/order-confirmation');
  //   } else {
  //     setIsError(true);
  //   }
  // };
  




  // submit start
const createOrderMutation = useCreateOrder(auth?.token as string);
const clearCartMutation = useClearCart(auth?.token as string); 
const { resetCart } = useCart();

const handleSubmit = async () => {
  if (!address.firstName || !address.lastName || !address.phoneNumber || !address.street || !address.city || !address.postalCode || !address.province) {
      setIsError(true);
      return;
  }

  const cart = JSON.parse(localStorage.getItem('cart') || '[]'); 

  if (cart.length === 0) {
      enqueueSnackbar('Your cart is empty. Please add items to your cart before placing an order.', { variant: 'error' });
      return;
  }

  const books = cart.map((item: any) => ({
      bookId: item.bookId._id, 
      quantity: item.quantity,
      price: item.bookId.price,
  })) as [{ bookId: string; quantity: number; price: number }]; // Assertion

  const orderData = {
      books: books, 
      totalAmount: total, 
      shippingAddress: {
          firstName: address.firstName,
          lastName: address.lastName,
          street: address.street,
          city: address.city,
          province: address.province,
          postalCode: address.postalCode,
          phone: address.phoneNumber,
      },
  };

  try {
      
      await createOrderMutation.mutateAsync(orderData);
      
      await clearCartMutation.mutateAsync();
      
      enqueueSnackbar('Order placed successfully!', { variant: 'success' });
      //localStorage.removeItem('cart'); 
      resetCart();
      navigate('/orders'); 
  } catch (error) {
      console.error('Failed to place order:', error);
      enqueueSnackbar('Failed to place order. Please try again.', { variant: 'error' });
  }
};




  // submit end








  function priceRow(qty: number, unit: number) {
    return qty * unit;
  }

  if (!cart.length) {
    navigate('/books');
    return <Alert severity="info">Your cart is empty.</Alert>;
  }

  return (
    <Stack gap={3}>
      <Breadcrumbs aria-label="breadcrumb">
        <LinkRouter underline="hover" color="inherit" to="/">
          Home
        </LinkRouter>
        <LinkRouter underline="hover" color="inherit" to="/cart">
          Shopping Cart
        </LinkRouter>
        <Typography color="text.primary">Checkout</Typography>
      </Breadcrumbs>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" mb={3}>Shipping Address</Typography>
        <Stack gap={2} mt={2}>
          <Stack direction="row" spacing={1}>
            <TextField
              label="First name"
              name="firstName"
              value={address.firstName}
              onChange={handleAddressChange}
              sx={{ width: '50%' }}
            />
            <TextField
              label="Last name"
              name="lastName"
              value={address.lastName}
              onChange={handleAddressChange}
              sx={{ width: '50%' }}
            />
          </Stack>
          <TextField
            label="Phone number"
            name="phoneNumber"
            value={address.phoneNumber}
            onChange={handleAddressChange}
            fullWidth
            error={Boolean(phoneNumberError)}
            helperText={phoneNumberError}
          />
          <TextField
            label="Street"
            name="street"
            value={address.street}
            onChange={handleAddressChange}
            fullWidth
          />
          <TextField
            label="City"
            name="city"
            value={address.city}
            onChange={handleAddressChange}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel id="province-label">Province</InputLabel>
            <Select
              labelId="province-label"
              label="Province"
              name="province"
              value={address.province}
              onChange={handleProvinceChange}
            >
              {provinces.map((province) => (
                <MenuItem key={province} value={province}>
                  {province}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Postal Code"
            name="postalCode"
            value={address.postalCode}
            onChange={handleAddressChange}
            fullWidth
            error={Boolean(postalCodeError)}
            helperText={postalCodeError}
          />
        </Stack>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" mb={3}>Shipping Method</Typography>
        <RadioGroup value={shippingMethod} onChange={handleShippingChange}>
          {subtotal >= amountFreeShipping ? <FormControlLabel
            value="standard"
            control={<Radio />}
            label="Free Shipping (3-4 days) - $0"
          /> : <FormControlLabel
            value="standard"
            control={<Radio />}
            label="Standard Shipping (3-4 days) - $5.99"
          />
          }
          <FormControlLabel
            value="express"
            control={<Radio />}
            label="Express Shipping (1-2 days) - $12.99"
          />
        </RadioGroup>
      </Paper>

      <TableContainer component={Paper}>
        <Typography variant="h6" p={3}>Order Summary</Typography>
        <Table sx={{ minWidth: 700 }} aria-label="spanning table">
          <TableHead>
            <TableRow>
              <TableCell>Item</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cart.map((item) => (
              <TableRow key={item.bookId.title}>
                <TableCell>
                  <Typography>{item.bookId.title}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography fontWeight='bold'>${item.bookId.price}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography component="span" sx={{ marginX: 2 }}>
                    {item.quantity}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography>${priceRow(item.bookId.price, item.quantity).toFixed(2)}</Typography>
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell rowSpan={5} />
              <TableCell colSpan={2}>
                <Typography>Total before tax:</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography>${subtotal.toFixed(2)}</Typography>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Typography>Estmated GST/HST:</Typography>
              </TableCell>
              <TableCell align="right">{`${gstRate}%`}</TableCell>
              <TableCell align="right">${taxGst.toFixed(2)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Typography>Estmated PST/RST/QST:</Typography>
              </TableCell>
              <TableCell align="right">{`${pstRate.toFixed(3)}%`}</TableCell>
              <TableCell align="right">${taxPst.toFixed(2)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={2}>
                <Typography>Shipping:</Typography>
              </TableCell>
              <TableCell align="right">${shippingMethod === 'standard' && subtotal > amountFreeShipping ? 'Free' : shippingCost.toFixed(2)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={2}>
                <Typography variant="h6">Order Total:</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="h6">${total.toFixed(2)}</Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {isError && <Alert severity="error">Please fill out all fields with valid format.</Alert>}

      <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ my: 1 }}>
        Place Order
      </Button>
    </Stack>
  );
}
