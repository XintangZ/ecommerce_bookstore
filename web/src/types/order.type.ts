import { z } from 'zod';
import { createOrderSchema, placeOrderSchema } from '../schemas';
import { PaginationT } from './common.type';





export type CreateOrderValidationT = z.infer<typeof createOrderSchema> & {
	_id: string;
};

export type GetAllOrdersResT = {
	data: CreateOrderValidationT[];
	pagination: PaginationT;
};


export type placeOrderValidationT = z.infer<typeof placeOrderSchema>;
