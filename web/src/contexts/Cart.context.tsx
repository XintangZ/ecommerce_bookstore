import React, { createContext, useContext, useState, ReactNode } from 'react';
import { BookT, CartItemT } from '../types';
import { useUpdateCartItem } from '../services';

const CartContext = createContext<{
  cartItemCount: number;
  cartList: CartItemT[];
  addToCart: (item: CartItemT) => void;
  removeFromCart: (item: CartItemT) => void;
  resetCart: () => void;
  setCartListAndCount: (items: CartItemT[]) => void;
  setCartItemCount: React.Dispatch<React.SetStateAction<number>>;
  addToCartAndUpdateServer: (book: BookT) => void;
} | null>(null);

type CartProviderProps = {
  children: ReactNode;
};

export function CartProvider({ children }: CartProviderProps) {
  const token = localStorage.getItem('token');
  const [cartItemCount, setCartItemCount] = useState(0);
  const [cartList, setCartList] = useState<CartItemT[]>([]);
  const updateCartMutation = useUpdateCartItem(token || '');

  const addToCart = (newItem: CartItemT) => {
    setCartItemCount(prevCount => prevCount + 1);
  
    setCartList(prevList => {
      if (!prevList) {
        // If there's no previous cart, initialize a new one
        const newCart: CartItemT[] = [{
          bookId: newItem.bookId,
          quantity: 1,
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
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
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

  const removeFromCart = (itemToRemove: CartItemT) => {
    setCartItemCount(prevCount => Math.max(prevCount - 1, 0)); 
  
    setCartList(prevList => {
      if (!prevList) {
        return []; 
      }
  
      const itemIndex = prevList.findIndex(cartItem => cartItem.bookId._id === itemToRemove.bookId._id);
  
      if (itemIndex > -1) {
        let updatedList: CartItemT[];
  
        if (prevList[itemIndex].quantity > 1) {
          updatedList = prevList.map(cartItem =>
            cartItem.bookId._id === itemToRemove.bookId._id
              ? { ...cartItem, quantity: cartItem.quantity - 1 }
              : cartItem
          );
        } else {
          updatedList = prevList.filter(cartItem => cartItem.bookId._id !== itemToRemove.bookId._id);
        }
  
        localStorage.setItem('cart', JSON.stringify(updatedList));
  
        return updatedList;
      }
      return prevList; 
    });
  };

  const addToCartAndUpdateServer = async (book: BookT) => {
    const newItem: CartItemT = {
      bookId: book,
      quantity: 1,
    };

    addToCart(newItem);

    if (token) {
      try {
        await updateCartMutation.mutateAsync({
          bookId: book._id,
          action: 'add',
          quantity: 1,
        });
      } catch (error) {
        console.error('Failed to update cart', error);
      }
    }
  };

  const resetCart = () => {
    setCartItemCount(0);
    setCartList([]);
    localStorage.removeItem('cart');
  }

  const setCartListAndCount = (items: CartItemT[]) => {
    setCartList(items);
    const total = items?.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0) || 0;
    setCartItemCount(total);
    localStorage.setItem('cart', JSON.stringify(items));
  };

  return (
    <CartContext.Provider value={{ cartItemCount, addToCart, removeFromCart, cartList, resetCart, setCartListAndCount, setCartItemCount, addToCartAndUpdateServer }}>
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