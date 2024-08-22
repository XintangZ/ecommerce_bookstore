import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { Category } from '../models';
import { createCategorySchema } from '../schema';

// Create a category
const createCategory = async (req: Request, res: Response) => {
	const { user: { isAdmin = false } = {} } = res.locals;
	if (!isAdmin) {
		return res.status(403).json({ message: 'You are not authorized to perform this action.' });
	}

	try {
		const validatedData = createCategorySchema.parse(req.body);

		const newCategory = new Category(validatedData);
		const savedCategory = await newCategory.save();

		return res.status(201).json({ data: savedCategory });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return res.status(400).json({ errors: error.errors });
		}

		console.error('Error creating category:', error);
		return res.status(500).json({ message: 'Server error' });
	}
};

// Get all categories
const getAllCategories = async (req: Request, res: Response) => {
	try {
		const categories = await Category.find();

		return res.status(200).json({ data: categories });
	} catch (error) {
		console.error('Error retrieving categories:', error);
		return res.status(500).json({ message: 'Server error' });
	}
};

// Get a category by ID
const getCategory = async (req: Request, res: Response) => {
	const { id } = req.params;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).json({ message: 'Invalid category ID format.' });
	}

	try {
		const category = await Category.findById(id);

		if (!category) {
			return res.status(404).json({ message: `Category with id "${id}" not found.` });
		}

		return res.status(200).json({ data: category });
	} catch (error) {
		console.error('Error retrieving category:', error);
		return res.status(500).json({ message: 'Server error' });
	}
};

// Update a category
const updateCategory = async (req: Request, res: Response) => {
	const { user: { isAdmin = false } = {} } = res.locals;
	if (!isAdmin) {
		return res.status(403).json({ message: 'You are not authorized to perform this action.' });
	}

	const { id } = req.params;
	const updateData = req.body;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).json({ message: 'Invalid category ID format.' });
	}

	try {
		const category = await Category.findById(id);

		if (!category) {
			return res.status(404).json({ message: `Category with id "${id}" not found.` });
		}

		const validatedUpdateData = createCategorySchema.parse(updateData);

		const updatedCategory = await Category.findByIdAndUpdate(
			id,
			{ $set: validatedUpdateData },
			{ new: true, runValidators: true }
		);

		return res.status(200).json({ data: updatedCategory });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return res.status(400).json({ errors: error.errors });
		}

		console.error('Error updating category:', error);
		return res.status(500).json({ message: 'Server error' });
	}
};

// Delete a category
const deleteCategory = async (req: Request, res: Response) => {
	const { user: { isAdmin = false } = {} } = res.locals;
	if (!isAdmin) {
		return res.status(403).json({ message: 'You are not authorized to perform this action.' });
	}

	const { id } = req.params;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).json({ message: 'Invalid category ID format.' });
	}

	try {
		const category = await Category.findById(id);

		if (!category) {
			return res.status(404).json({ message: `Category with id "${id}" not found.` });
		}

		await Category.findByIdAndDelete(id);

		return res.status(200).json({ message: 'Category deleted successfully.' });
	} catch (error) {
		console.error('Error deleting category:', error);
		return res.status(500).json({ message: 'Server error' });
	}
};

export { createCategory, deleteCategory, getAllCategories, getCategory, updateCategory };
