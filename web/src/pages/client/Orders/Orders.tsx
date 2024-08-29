import { useEffect, useState } from 'react';
import {
    Alert,
    Breadcrumbs,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Typography,
} from '@mui/material';
import { Navigate } from 'react-router-dom';
import { LinkRouter, Loading, MuiPagination } from '../../../components';
import { useGetAllOrders } from '../../../services';
import OrderTable from './OrderTable'; // Import the new component
import { GetAllOrdersResT } from '../../../types';

export function Orders() {
    const [page, setPage] = useState<number>(1);
    const [sortBy, setSortBy] = useState<string>('date');
    const [order, setOrder] = useState<'asc' | 'desc'>('desc');
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
        } = data as GetAllOrdersResT;

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

                <OrderTable orders={sortedOrders} open={open} setOpen={setOpen} />

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
