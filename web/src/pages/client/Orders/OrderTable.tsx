import React from 'react';
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
  Link as MuiLink,  // Import Material-UI Link
} from '@mui/material';
import { green, yellow } from '@mui/material/colors';
import { CreateOrderValidationT } from '../../../types'; // Use CreateOrderValidationT
import { Link as RouterLink } from 'react-router-dom';  // Import react-router-dom Link
import { BookReviewDialog } from '../../../components/BookReviewDialog'; // Named import for BookReviewDialog

interface OrderTableProps {
  open: string | null;
  setOpen: (id: string | null) => void;
  orders: CreateOrderValidationT[]; // Use CreateOrderValidationT[]
}

const OrderTable: React.FC<OrderTableProps> = ({ open, setOpen, orders }) => {
  const [openDialog, setOpenDialog] = React.useState(false);
  const [selectedOrderId, setSelectedOrderId] = React.useState<string | null>(null);
  const [isShipping, setIsShipping] = React.useState(false);

  const user = localStorage.getItem('user');
  const isAdmin = user ? JSON.parse(user).isAdmin : false;

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
      // Logic for handling order update (ship/cancel) goes here
    }
  };

  const formatShippingAddress = (address: CreateOrderValidationT['shippingAddress']) => {
    return `${address.firstName} ${address.lastName}, ${address.street}, ${address.city}, ${address.province}, ${address.postalCode}, Phone: ${address.phone}`;
  };

  return (
    <TableContainer component={Paper} variant="outlined">
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
          {orders.map(order => (
            <React.Fragment key={order._id}>
              <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => setOpen(open === order._id ? null : order._id)}
                  >
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
                  }}
                >
                  {order.status}
                </TableCell>
                <TableCell>{formatShippingAddress(order.shippingAddress)}</TableCell>
                <TableCell>
                  {order.status === 'Pending' && (
                    <Stack gap={1} justifyContent="center">
                      <Button
                        size="small"
                        fullWidth
                        variant="outlined"
                        color="error"
                        onClick={() => handleCancelClick(order._id)}
                      >
                        Cancel
                      </Button>
                      {isAdmin && (
                        <Button
                          size="small"
                          fullWidth
                          variant="outlined"
                          color="primary"
                          onClick={() => handleShipClick(order._id)}
                        >
                          Ship
                        </Button>
                      )}
                    </Stack>
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                  <Collapse in={open === order._id} timeout="auto" unmountOnExit>
                    <Box sx={{ margin: 1 }}>
                      <Typography variant="h6" gutterBottom component="div">
                        Order Details
                      </Typography>
                      <Table size="small" aria-label="order details">
                        <TableHead>
                          <TableRow>
                            {isAdmin && <TableCell>Book ISBN</TableCell>}
                            <TableCell>Book Title</TableCell>
                            <TableCell>Quantity</TableCell>
                            <TableCell colSpan={2}>Price</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {order.books.map((book: CreateOrderValidationT['books'][0]) => (
                            <TableRow key={book.bookId._id}>
                              {isAdmin && <TableCell>{book.bookId.isbn}</TableCell>}
                              <TableCell>
                                <MuiLink
                                  component={RouterLink}
                                  to={`/books/${book.bookId._id}`}
                                  underline="hover"
                                >
                                  {book.bookId.title}
                                </MuiLink>
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
                          ))}
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
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{isShipping ? 'Confirm Shipment' : 'Confirm Cancellation'}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {isShipping
              ? 'Do you want to ship this order?'
              : 'Are you sure you want to cancel this order? This action cannot be undone.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">No</Button>
          <Button onClick={() => handleDialogClose(true)} color="secondary">Yes</Button>
        </DialogActions>
      </Dialog>
    </TableContainer>
  );
};

export default OrderTable;
