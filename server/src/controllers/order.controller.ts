import { Request, Response } from 'express';
import { Order } from '../models/index';
import { createOrderSchema } from '../schema';
import mongoose from 'mongoose';
import { z } from 'zod';

// Create a new order
export const createOrder = async (req: Request, res: Response) => {
    try {
        // Validate request body against the schema
        createOrderSchema.parse(req.body);

        const newOrder = new Order(req.body);
        const savedOrder = await newOrder.save();
        return res.status(201).json({ data: savedOrder });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        return res.status(400).json({ error: error instanceof Error ? error.message : 'An unexpected error occurred' });
    }
};

// Get all orders
export const getAllOrders = async (req: Request, res: Response) => {
    const { page = 1, limit = 10 } = req.query;

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

        // Find orders with pagination
        const orders = await Order.find()
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber)
            .exec();

        // Get the total count of orders for pagination metadata
        const totalOrders = await Order.countDocuments().exec();

        return res.status(200).json({
            data: orders,
            pagination: {
                page: pageNumber,
                limit: limitNumber,
                totalOrders,
            },
        });
    } catch (error) {
        console.error('Error retrieving orders:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};


// Get a single order by ID
export const getOrder = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ error: 'Invalid order ID format' });
    }
    try {
        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        return res.status(200).json({ data: order });
    } catch (error) {
        return res.status(500).json({ error: error instanceof Error ? error.message : 'An unexpected error occurred' });
    }
};

// Update order status
export const updateOrder = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ error: 'Invalid order ID format' });
    }

    // Validate status value
    if (!['Pending', 'Shipped', 'Cancelled'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status value' });
    }

    try {
        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            { status },
            { new: true } // Return the updated document
        );

        if (!updatedOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }

        return res.status(200).json({ data: updatedOrder });
    } catch (error) {
        return res.status(500).json({ error: error instanceof Error ? error.message : 'An unexpected error occurred' });
    }
};
