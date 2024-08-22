import { Router } from 'express';
import { createOrder, getAllOrders, getOrder, updateOrder } from '../controllers/order.controller';



export const orderRoute = () => {

	const router = Router();

    router.post('/orders/add', createOrder);

    router.get('/orders', getAllOrders);

    router.get('/orders/:id', getOrder);

    router.put('/orders/update/:id', updateOrder);

	return router;
};


