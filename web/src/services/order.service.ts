import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BACKEND_URL } from '../consts';
import { CreateOrderValidationT, GetAllOrdersResT } from '../types';
import { getHeaders } from '../utils';

// Get all orders for a user or admin with pagination
type FilterParamsT = {
	status?: 'Pending' | 'Shipped' | 'Cancelled';
};

export const useGetAllOrders = (
	token: string,
	page: number = 1,
	limit: number = 10,
	filterParams: FilterParamsT = {}
) => {
	const { status } = filterParams;

	const queryParams = new URLSearchParams({
		page: page.toString(),
		limit: limit.toString(),
	});

	Object.entries({
		status,
	}).forEach(([key, value]) => {
		if (value !== undefined) {
			queryParams.append(key, value.toString());
		}
	});

	const queryString = queryParams.toString();

	return useQuery<GetAllOrdersResT, Error>({
		queryKey: ['orders', page, limit, filterParams],
		queryFn: async () => {
			try {
				const res = await axios.get<GetAllOrdersResT>(
					`${BACKEND_URL}/orders?${queryString}`,
					getHeaders(token)
				);
				return res.data;
			} catch (err) {
				console.error(err);
				if (axios.isAxiosError(err)) {
					console.error('Response data:', err.response?.data); // Log detailed error response
				}
				throw new Error('Failed to create order'); // Ensure the function never returns void
			}
		},
		placeholderData: keepPreviousData,
	});
};

// Get a single order by ID
export const useGetOrder = (token: string, orderId: string) => {
	return useQuery<CreateOrderValidationT, Error>({
		queryKey: ['order', orderId],
		queryFn: async () => {
			try {
				const res = await axios.get<CreateOrderValidationT>(
					`${BACKEND_URL}/orders/${orderId}`,
					getHeaders(token)
				);
				return res.data;
			} catch (err) {
				console.error(err);
				throw new Error('Failed to fetch order'); // Ensure the function never returns void
			}
		},
	});
};

// Create a new order
export const useCreateOrder = (token: string) => {
    return useMutation<CreateOrderValidationT, Error, Omit<CreateOrderValidationT, 'userId' | 'placedAt'> & { userId: string }>({
        mutationFn: async (orderData) => {
            try {
                const res = await axios.post<CreateOrderValidationT>(
                    `${BACKEND_URL}/orders/add`,
                    orderData,
                    getHeaders(token)
                );
                return res.data;
            } catch (err) {
                console.error(err);
                throw new Error('Failed to create order'); // Ensure the function never returns void
            }
        },
    });
};

export const useUpdateOrder = (token: string) => {
    return useMutation<CreateOrderValidationT, Error, { orderId: string; status: 'Pending' | 'Shipped' | 'Cancelled' }>({
        mutationFn: async ({ orderId, status }) => {
            if (!orderId) {
                console.error('Order ID is missing or invalid:', orderId);
                throw new Error('Order ID is missing or invalid');
            }

            try {
                const res = await axios.put<CreateOrderValidationT>(
                    `${BACKEND_URL}/orders/update/${orderId}`,
                    { status },
                    getHeaders(token)
                );
                return res.data;
            } catch (err) {
                console.error(err);
                throw new Error('Failed to update order');
            }
        },
    });
};
