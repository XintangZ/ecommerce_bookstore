import { useEffect, useState } from 'react';
import {
    Alert,
    Breadcrumbs,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Collapse,
    IconButton,
} from '@mui/material';
import { Navigate } from 'react-router-dom';
import { LinkRouter, Loading, MuiPagination } from '../../../components';
import { useGetAllOrders } from '../../../services';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';

export function Orders() {
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState('date');
    const [order, setOrder] = useState<'asc' | 'desc'>('desc'); // Default to 'desc' for recent first
    const [open, setOpen] = useState<string | null>(null);

    const limit = 10;
    const token = localStorage.getItem('token');
    const { data, isPending, isError, isSuccess } = useGetAllOrders(token || '', page, limit);

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
            data: orders,
            pagination: { totalPages, totalItems },
        } = data;

        const sortedOrders = [...orders].sort((a, b) => {
            let comparison = 0;

            if (sortBy === 'date') {
                const dateA = a.placedAt ? new Date(a.placedAt).getTime() : 0;
                const dateB = b.placedAt ? new Date(b.placedAt).getTime() : 0;
                comparison = dateA - dateB;
            } else if (sortBy === 'status') {
                comparison = a.status.localeCompare(b.status);
            }

            return order === 'asc' ? comparison : -comparison;
        });

        return (
            <Stack gap={2}>
                <Breadcrumbs aria-label='breadcrumb'>
                    <LinkRouter underline='hover' color='inherit' to='/'>
                        Home
                    </LinkRouter>
                    <Typography color='text.primary'>Orders</Typography>
                </Breadcrumbs>

                <Stack direction='row' justifyContent='space-between'>
                    <Typography color={'text.secondary'}>
                        {totalItems} {totalItems === 1 ? 'order' : 'orders'}
                    </Typography>

                    <FormControl variant='outlined' size='small' sx={{ width: 150 }}>
                        <InputLabel>Sort By</InputLabel>
                        <Select
                            value={`${sortBy}_${order}`}
                            onChange={e => {
                                const [field, sortOrder] = (e.target.value as string).split('_');
                                setSortBy(field);
                                setOrder(sortOrder as 'asc' | 'desc');
                            }}
                            label='Sort By'>
                            <MenuItem value='date_asc'>Date (Asc)</MenuItem>
                            <MenuItem value='date_desc'>Date (Desc)</MenuItem>
                            <MenuItem value='status_asc'>Status (Asc)</MenuItem>
                            <MenuItem value='status_desc'>Status (Desc)</MenuItem>
                        </Select>
                    </FormControl>
                </Stack>

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
                            {sortedOrders.map(order => (
                                <>
                                    <TableRow key={order._id}>
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
                                                <Button variant="outlined" color="error">
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
                                </>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

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

    return null;
}
