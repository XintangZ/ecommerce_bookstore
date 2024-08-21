import bcrypt from 'bcrypt';
import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { User } from '../models/index';
import { createUserSchema } from '../schema';
import { generateToken } from '../services/index';

const createUser = async (req: Request, res: Response) => {
  try {
      // Validate request body using Zod schema
      const validatedData = createUserSchema.parse(req.body);

      const existingUser = await User.findOne({ email: validatedData.email });
      if (existingUser) {
          return res.status(400).json({ message: 'User with this email already exists.' });
      }

      // Hash the password before saving the user
      const saltRounds = 10; 
      const hashedPassword = await bcrypt.hash(validatedData.password, saltRounds);

      // Create a new user with the hashed password
      const newUser = new User({
          ...validatedData,
          password: hashedPassword
      });

      const savedUser = await newUser.save();

      return res.status(201).json({ data: savedUser });
  } catch (error) {
      if (error instanceof z.ZodError) {
          // Zod validation errors
          return res.status(400).json({ errors: error.errors });
      }

      console.error('Error creating user:', error);
      return res.status(500).json({ message: 'Server error' });
  }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
      const { email, password } = req.body;

      // Find the user by username
      const user = await User.findOne({ email }).exec();
      if (!user) {
          return res.status(401).json({ message: 'Unauthorized: Invalid email or password' });
      }

      // Compare provided password with the hashed password stored in the database
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
          return res.status(401).json({ message: 'Unauthorized: Invalid email or password' });
      }

      // If password matches, generate a JWT
      const secretKey = process.env.JWT_SECRET || 'default_secret_key';
      const token = generateToken(user, secretKey);

      // Return the generated token along with user info
      return res.status(200).json({
          message: 'Login successful',
          token: token,
          user: {
            name: user.name,
            email: user.email,
            address: user.address,
            cart: user.cart, 
            wishlist: user.wishlist,
            _id: user._id,
            admin: user.isAdmin,
          },
      });

  } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ message: 'Internal server error' });
  }
};

const updateUser = async (req: Request, res: Response) => {
	const { _id: id } = res.locals.user._id;
	const updateData = req.body;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).json({ message: 'Invalid user ID format.' });
	}

	try {
		const user = await User.findById(id);

		if (!user) {
			return res.status(404).json({ message: `User with id "${id}" not found.` });
		}

		const updatedUser = await User.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });

		return res.status(200).json({ data: updatedUser });
	} catch (error) {
		console.error('Error updating user:', error);
		return res.status(500).json({ message: 'Server error' });
	}
};

const deleteUser = async (req: Request, res: Response) => {
	const { id } = req.params;
  const isAdmin = res.locals.user.isAdmin;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).json({ message: 'Invalid user ID format.' });
	}

  if (!isAdmin) {
    return res.status(403).json({ message: 'You do not have permission to delete users.' });
  }

	try {
		const user = await User.findById(id);

		if (!user) {
			return res.status(404).json({ message: `User with id "${id}" not found.` });
		}

		await User.findByIdAndDelete(id);

		return res.status(200).json({ message: 'User deleted successfully.' });
	} catch (error) {
		console.error('Error deleting user:', error);
		return res.status(500).json({ message: 'Server error' });
	}
};

export { createUser, deleteUser, login, updateUser };
