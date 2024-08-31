import { CartItemT, CartT } from '../types';

export const getHeaders = (token: string) => {
	return {
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
	};
};

export function getCartItemFromLocalStorage(): CartItemT[] {
	const cart = localStorage.getItem('cart');
	return cart ? JSON.parse(cart) : [];
}

export function getCartFromLocalStorage(): CartT[] {
  const cart = localStorage.getItem('cart');
  
  if (!cart) {
    return [];
  }

  const cartItems: CartItemT[] = JSON.parse(cart);
  
  // Transform CartItemT[] to CartT[]
  const transformedCart: CartT[] = cartItems.map(item => ({
    bookId: item.bookId._id, // Extract the string ID from the BookT object
    quantity: item.quantity,
  }));

  return transformedCart;
}

// 'helloWorld' => 'Hello world'
export function formatCamelToSentence(str: string): string {
	return str
		.replace(/([a-z])([A-Z])/g, '$1 $2')
		.replace(/\b\w/g, c => c.toLowerCase())
		.replace(/^\w/, c => c.toUpperCase());
}
