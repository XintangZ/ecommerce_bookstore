import { z } from 'zod';

const cartItemSchema = z.object({
  bookId: z.string().length(24, { message: 'Invalid Book ID format' }), 
  quantity: z.number().int().positive({ message: 'Quantity must be a positive integer' }),
});

const updateCartSchema = z.object({
  userId: z.string().length(24, { message: 'Invalid User ID format' }), 
  items: z.array(cartItemSchema).optional(),
});

export { updateCartSchema };