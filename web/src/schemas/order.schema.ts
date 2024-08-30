import { z } from 'zod';

export const OrdersSchema = z.object({
    books: z.array(
        z.object({
            bookId: z.object({
                _id: z.string().min(1, { message: 'Invalid book ID format' }),
                title: z.string().min(1, { message: 'Book title is required' }),
                isbn: z.string().min(1, { message: 'ISBN is required' }),
            }),
            quantity: z.number().int().positive({ message: 'Quantity must be a positive integer' }),
            price: z.number().positive({ message: 'Price must be a positive number' }),
            _id: z.string().optional(), // The _id of the order book entry itself
        })
    ).nonempty({ message: 'At least one book is required' }),

    totalAmount: z.number().positive({ message: 'Total amount must be a positive number' }),

    shippingAddress: z.object({
        firstName: z.string().min(1, { message: 'First name is required' }),
        lastName: z.string().min(1, { message: 'Last name is required' }),
        street: z.string().min(1, { message: 'Street is required' }),
        city: z.string().min(1, { message: 'City is required' }),
        province: z.string().min(1, { message: 'Province is required' }),
        postalCode: z.string().min(1, { message: 'Postal code is required' }),
        phone: z.string()
            .regex(/^\d{3}-\d{3}-\d{4}$/, { message: 'Phone number must be in the format XXX-XXX-XXXX' })
            .min(12, { message: 'Phone number must be 12 characters long, including dashes' }),
    }),

    status: z.enum(['Pending', 'Shipped', 'Cancelled']).default('Pending'),
    placedAt: z.date().optional(),

    _id: z.string().optional(), // The _id of the order itself
    userId: z.string().optional(), // User ID associated with the order
    __v: z.number().optional(), // Version key in MongoDB
});
