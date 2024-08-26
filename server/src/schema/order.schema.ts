import { z } from 'zod';
import { Types } from 'mongoose';

// Zod validation schema for Order
export const createOrderSchema = z.object({

    books: z.array(
        z.object({
            bookId: z.string().min(1, { message: 'Invalid book ID format' }),
            quantity: z.number().int().positive({ message: 'Quantity must be a positive integer' }),
            price: z.number().positive({ message: 'Price must be a positive number' }),
        })
    ).nonempty({ message: 'At least one book is required' }),
    totalAmount: z.number().positive({ message: 'Total amount must be a positive number' }),
    shippingAddress: z.object({
        firstName: z.string().min(1, { message: 'First name is required' }),
        lastName: z.string().min(1, { message: 'Last name is required' }),
        street: z.string().min(1, { message: 'Street is required' }),
        city: z.string().min(1, { message: 'City is required' }),
        province: z.string().min(1, { message: 'Province is required' }),
        postalCode: z.string().min(1, { message: 'Zip code is required' }),
        phone: z.string()
            .regex(/^\d{3}-\d{3}-\d{4}$/, { message: 'Phone number must be in the format XXX-XXX-XXXX' })
            .min(12, { message: 'Phone number must be 12 characters long, including dashes' }),
    }),
    status: z.enum(['Pending', 'Shipped', 'Cancelled']).default('Pending'),
    placedAt: z.date().optional(),
});
