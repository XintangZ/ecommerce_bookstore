import { Request, Response } from 'express';
import { Order } from '../models/index';
import { createOrderSchema } from '../schema';
import mongoose from 'mongoose';
import { z } from 'zod';

// Create a new order
export const createOrder = async (req: Request, res: Response) => {
    try {

        // check if the user is admin
	    const { user: { isAdmin = false } = {} } = res.locals;
	    if (isAdmin) {
		    return res.status(403).json({ message: 'Admins are forbidden from placing orders.' });
	    }

        const userId = res.locals.user.userId;
        if (!userId) {
            return res.status(400).json({ message: 'User ID not found in token' });
        }

        // Validate request body against the schema
        const validatedData = createOrderSchema.parse(req.body);

        const newOrder = new Order({...validatedData, userId});
        const savedOrder = await newOrder.save();
        return res.status(201).json({ data: savedOrder });

    } catch (error) {

        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }

        console.error('Error in creating order:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Get all orders
export const getAllOrders = async (req: Request, res: Response) => {
    
    const { page = 1, limit = 10 } = req.query;

    const { user: { isAdmin = false } = {} } = res.locals;

    const userId = res.locals.user.userId;

        if (!userId) {
            return res.status(400).json({ message: 'User ID not found in token' });
        }

    try {
        
        // Convert pagination parameters to numbers
        const pageNumber = parseInt(page as string, 10);
        const limitNumber = parseInt(limit as string, 10);

        // Validate pagination parameters
        if (isNaN(pageNumber) || pageNumber < 1) {
            return res.status(400).json({ message: 'Invalid page number.' });
        }
        if (isNaN(limitNumber) || limitNumber < 1) {
            return res.status(400).json({ message: 'Invalid limit value.' });
        }


         // Query for orders based on user's role
         const query = isAdmin ?{}:{userId};

        // Find orders with pagination
        const orders = await Order.find(query)
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber)
            .exec();

        // Get the total count of orders for pagination metadata
        const totalOrders = await Order.countDocuments(query).exec();

        return res.status(200).json({
            data: orders,
            pagination: {
                page: pageNumber,
                limit: limitNumber,
                totalOrders,
            },
        });
    } catch (error) {

        console.error('Error getting all orders:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};





// Get a single order by ID

export const getOrder = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = res.locals.user.userId;
    const { user: { isAdmin = false } = {} } = res.locals;

	if (!userId) {
		return res.status(400).json({ message: 'User ID not found in token' });
	}
    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ error: 'Invalid order ID format' });
    }

    try {
        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Check if the user is an admin
        
        if (isAdmin) {
            return res.status(200).json({ data: order });
        }

        // If the user is not an admin, check if the order's userId matches the decoded userId
        if (order.userId.toString() === userId.toString()) {
            return res.status(200).json({ data: order });
        }

        // If the user is not an admin and does not own the order, return 403 Forbidden
        return res.status(403).json({ error: 'Access forbidden' });
        
    } catch (error) {

        console.error('Error getting a single order:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};




// Update order status
export const updateOrder = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const userId = res.locals.user.userId;

    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ error: 'Invalid order ID format' });
    }

    // Validate status value
    if (!['Pending', 'Shipped', 'Cancelled'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status value' });
    }

    try {
        // Get the current order
        const currentOrder = await Order.findById(id);
        if (!currentOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const { user: { isAdmin = false } = {} } = res.locals;

        // Check current status and user role
        if (currentOrder.status === 'Cancelled') {
            return res.status(400).json({ error: 'Cannot update or cancelled order' });
        }

        if (!isAdmin) {

            if (currentOrder.userId.toString() !== userId) {
                return res.status(403).json({ message: 'Forbidden: You can only update your own orders.' });
            }

            // Non-admin can only update to Cancelled if current status is Processing
            if (currentOrder.status !== 'Pending' && status === 'Cancelled') {
                return res.status(403).json({ error: 'Only orders with status "Pending" can be cancelled by customers' });
            }
        }

        // Proceed to update the order status
        currentOrder.status = status;
        const updatedOrder = await currentOrder.save(); // Save the updated order

        return res.status(200).json({ data: updatedOrder });

    } catch (error) {

        if (error instanceof z.ZodError) {
			return res.status(400).json({ errors: error.errors });
		}

        console.error('Error updating an order:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};