import { CartItemT } from '../types';

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

// 'helloWorld' => 'Hello world'
export function formatCamelToSentence(str: string): string {
	return str
		.replace(/([a-z])([A-Z])/g, '$1 $2')
		.replace(/\b\w/g, c => c.toLowerCase())
		.replace(/^\w/, c => c.toUpperCase());
}
