import { CartItemT} from "../types";

export const getHeaders = (token: string) => {
	return {
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
	};
};

export function getCartFromLocalStorage(): CartItemT[] {
	const cart = localStorage.getItem('cart');
	return cart ? JSON.parse(cart) : [];
}
