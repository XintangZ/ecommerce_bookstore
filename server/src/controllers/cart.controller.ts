import { Request, Response } from 'express';
import { Cart } from '../models/cart.model';
import mongoose from 'mongoose';

// get cart by user Id
const getCart = async (req: Request, res: Response) => {
    try {
      const userId = res.locals.user.userId;
      
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: 'Invalid user ID format.' });
      }

      const cart = await Cart.findOne({ userId }).populate('items.bookId');
      if (!cart) {
          return res.status(404).json({ error: 'Cart not found' });
      }

      if (cart.items.length === 0) {
        return res.status(200).json({ message: 'Cart is empty', cart });
      }

      res.status(200).json(cart);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get cart' });
    }
};

// update cart
const updateCart = async (req: Request, res: Response) => {
  const userId = res.locals.user.userId;
  const { itemId, action, quantity } = req.body; // action: 'add' or 'remove'

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Invalid user ID format.' });
  }

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(400).json({ message: 'Invalid item ID format.' });
  }


  try {
    let cart = await Cart.findOne({ userId });

    // If no cart exists, create a new one
    if (!cart) {
      cart = new Cart({
        userId: userId,
        items: [] // Start with an empty cart
      });
    }

    if (action === 'add') {
      // Add item to cart
      const itemIndex = cart.items.findIndex(item => item.bookId.toString() === itemId);

      if (itemIndex > -1) {
          // Item already exists, update quantity
          cart.items[itemIndex].quantity += quantity;
      } else {
          // Add new item to cart
          cart.items.push({ bookId: itemId, quantity });
      }
    } else if (action === 'remove') {
      const itemIndex = cart.items.findIndex(item => item.bookId.toString() === itemId);

      if (itemIndex > -1) {
        // Item exists in the cart
        const currentQuantity = cart.items[itemIndex].quantity;

        if (quantity >= currentQuantity) {
          // If quantity to remove is greater or equal to current quantity, remove item from cart
          cart.items.splice(itemIndex, 1);
        } else {
          // Decrease item quantity
          cart.items[itemIndex].quantity -= quantity;
        }
      } else {
        return res.status(404).json({ message: 'Item not found in cart.' });
      }
    }else {
      return res.status(400).json({ message: 'Invalid action. Use "add" or "remove".' });
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
      console.error('Error updating cart:', error);
      res.status(500).json({ message: 'Server error' });
  }
};

// Clear cart
const clearCart = async (req: Request, res: Response) => {
  const userId = res.locals.user.userId; 

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Invalid user ID format.' });
  }

  try {
    const result = await Cart.findOneAndUpdate(
      { userId },
      { $set: { items: [] } }, 
      { new: true } 
    );

    if (!result) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    res.status(200).json({ message: 'Cart cleared successfully', cart: result });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export { getCart, updateCart, clearCart };
