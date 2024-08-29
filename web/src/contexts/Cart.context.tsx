import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CartItemT } from '../types';

const CartContext = createContext<{
  cartItemCount: number;
  cartList: CartItemT[];
  addToCart: (item: CartItemT) => void;
  resetCart: () => void;
  getCartList: (items: CartItemT[]) => void;
  setCartItemCount: React.Dispatch<React.SetStateAction<number>>;
} | null>(null);

type CartProviderProps = {
  children: ReactNode;
};

export function CartProvider({ children }: CartProviderProps) {
  const [cartItemCount, setCartItemCount] = useState(0);
  const [cartList, setCartList] = useState<CartItemT[]>([]);

  const addToCart = (newItem: CartItemT) => {
    setCartItemCount(prevCount => prevCount + 1);
  
    setCartList(prevList => {
      if (!prevList) {
        // If there's no previous cart, initialize a new one
        const newCart: CartItemT[] = [{
          bookId: newItem.bookId,
          quantity: newItem.quantity,
        }];
        // Save to localStorage
        localStorage.setItem('cart', JSON.stringify(newCart));
        return newCart;
      }
  
      // Check if the book already exists in the cart
      const itemIndex = prevList.findIndex(cartItem => cartItem.bookId._id === newItem.bookId._id);
  
      let updatedList: CartItemT[];
  
      if (itemIndex > -1) {
        // If the book exists, update the quantity
        updatedList = prevList.map(cartItem =>
          cartItem.bookId._id === newItem.bookId._id
            ? { ...cartItem, quantity: cartItem.quantity + newItem.quantity }
            : cartItem
        );
      } else {
        // If the book doesn't exist, add the new book to the cart
        updatedList = [...prevList, newItem];
      }
  
      // Save the updated cart list to localStorage
      localStorage.setItem('cart', JSON.stringify(updatedList));
  
      return updatedList;
    });
  };

  const resetCart = () => {
    setCartItemCount(0);
    setCartList([]);
    localStorage.removeItem('cart');
  }

  const getCartList = (items: CartItemT[]) => {
    setCartList(items);
    const total = items?.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0) || 0;
    setCartItemCount(total);
    localStorage.setItem('cart', JSON.stringify(items));
  };

  return (
    <CartContext.Provider value={{ cartItemCount, addToCart, cartList, resetCart, getCartList, setCartItemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}