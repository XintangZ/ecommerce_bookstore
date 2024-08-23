import { Router } from 'express';
import { createOrder, getAllOrders, getOrder, updateOrder } from '../controllers/order.controller';
import { authenticateJWT } from '../middlewares';


export const orderRoute = () => {

	const router = Router();

    router.post('/orders/add', authenticateJWT, createOrder);

    router.get('/orders', authenticateJWT, getAllOrders);

    router.get('/orders/:id', authenticateJWT, getOrder);

    router.put('/orders/update/:id', authenticateJWT, updateOrder);

	return router;
};


