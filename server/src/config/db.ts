import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

// function to setup mongodb connection
export const connectDB = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URI!);
		console.log('MongoDB connected');
	} catch (error) {
		console.error('MongoDB connection error:', error);
		process.exit(1);
	}
};
