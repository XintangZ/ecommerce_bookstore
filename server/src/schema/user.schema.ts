import { z } from 'zod';

const userBaseSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  email: z.string().email({ message: 'Invalid email address' }),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  cart: z.array(z.object({
    bookId: z.string().min(1, { message: 'Book ID is required' }),
    quantity: z.number().int().positive({ message: 'Quantity must be a positive integer' }),
  })).optional(),
  wishlist: z.array(z.string()).optional(), 
  isAdmin: z.boolean().optional(),
});

export const createUserSchema = userBaseSchema.extend({
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
});

export const updateUserSchema = userBaseSchema;

export const updateWishlistSchema = z.object({
  wishlist: z.array(z.string()).optional(),
});