import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BACKEND_URL } from '../consts';
import { CartT, CartUpdateActionT } from '../types';
import { getHeaders } from '../utils';

// update cart
export const useUpdateCartItem = (token: string) => {
	return useMutation({
		mutationFn: async (data: CartUpdateActionT) => {
			const res = await axios.put<CartUpdateActionT>(
				`${BACKEND_URL}/cart/${data.bookId}`,
				data,
				getHeaders(token)
			);
			return res.data;
		},
	});
};

// get cart
export const fetchCart = async (token: string) => {
	const response = await axios.get(`${BACKEND_URL}/cart`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
	return response.data;
};

// update cart
export const updateCart = async (token: string, data: CartT[]): Promise<CartT[]> => {
	try {
		const res = await axios.put<CartT[]>(`${BACKEND_URL}/cart`, data, getHeaders(token));
		return res.data;
	} catch {
		throw new Error('Failed to update cart');
	}
};

// clear cart
export const useClearCart = (token: string) => {
	return useMutation({
		mutationFn: async () => {
			const config = getHeaders(token);
			const res = await axios.delete(`${BACKEND_URL}/cart/clear`, config);
			return res.data;
		},
	});
};
