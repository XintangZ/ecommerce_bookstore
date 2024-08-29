import { z } from 'zod';
import { createOrderSchema } from '../schemas';
import { PaginationT } from './common.type';





export type CreateOrderValidationT = z.infer<typeof createOrderSchema> & {
	_id: string;
};

export type GetAllOrdersResT = {
	data: CreateOrderValidationT[];
	pagination: PaginationT;
};

// export type OrderShippingAddress = {
//     firstName: string;
//     lastName: string;
//     street: string;
//     city: string;
//     province: string;
//     postalCode: string;
//     phone: string; 
// }


// export type OrderBook = {
//     bookId: string; 
//     quantity: number;
//     price: number;
// }


// export type Order = {
//     userId: string; 
//     books: OrderBook[]; 
//     totalAmount: number;
//     shippingAddress: OrderShippingAddress; 
//     status: 'Pending' | 'Shipped' | 'Cancelled'; 
//     placedAt: Date; 
// }
