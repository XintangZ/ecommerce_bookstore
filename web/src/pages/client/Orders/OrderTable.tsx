import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Collapse,
    IconButton,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { CreateOrderValidationT } from '../../../types';
import { useUpdateOrder } from '../../../services'; // Adjust the import path as needed

interface OrderTableProps {
    orders: CreateOrderValidationT[];
    open: string | null;
    setOpen: (id: string | null) => void;
}

const OrderTable: React.FC<OrderTableProps> = ({ orders, open, setOpen }) => {
    const [openDialog, setOpenDialog] = React.useState(false);
    const [selectedOrderId, setSelectedOrderId] = React.useState<string | null>(null);

    const token = localStorage.getItem('token') || '';
    const { mutate: updateOrder } = useUpdateOrder(token);

    const handleCancelClick = (orderId: string) => {
        console.log('Selected Order ID:', orderId);
        setSelectedOrderId(orderId);
        setOpenDialog(true);
    };
    

    
    
    const handleDialogClose = (confirm: boolean) => {
        setOpenDialog(false);
        if (confirm && selectedOrderId) {
            updateOrder({ orderId: selectedOrderId, status: 'Cancelled' }); // Pass orderId directly here
        }
        setSelectedOrderId(null); // Reset selected order ID
    };

    return (
        <>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell />
                            <TableCell>Order ID</TableCell>
                            <TableCell>Total Amount</TableCell>
                            <TableCell>Placed At</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders.map(order => (
                            <React.Fragment key={order._id}>
                                <TableRow>
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
                                    <TableCell>{order.status}</TableCell>
                                    <TableCell>
                                        {order.status === 'Pending' && (
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                onClick={() => handleCancelClick(order._id)}
                                            >
                                                Cancel
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                                        <Collapse in={open === order._id} timeout="auto" unmountOnExit>
                                            <Table size="small" aria-label="order details">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Book ID</TableCell>
                                                        <TableCell>Quantity</TableCell>
                                                        <TableCell>Price</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {order.books.map(book => (
                                                        <TableRow key={book.bookId}>
                                                            <TableCell>{book.bookId}</TableCell>
                                                            <TableCell>{book.quantity}</TableCell>
                                                            <TableCell>${book.price.toFixed(2)}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </Collapse>
                                    </TableCell>
                                </TableRow>
                            </React.Fragment>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Confirmation Dialog */}
            <Dialog open={openDialog} onClose={() => handleDialogClose(false)}>
                <DialogTitle>Confirm Cancellation</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to cancel this order? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleDialogClose(false)} color="primary">
                        No
                    </Button>
                    <Button onClick={() => handleDialogClose(true)} color="secondary">
                        Yes
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default OrderTable;
