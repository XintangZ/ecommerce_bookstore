import dotenv from 'dotenv';
import express from 'express';
import { connectDB } from './config/db';
import { bookRoute } from './routes/book.route';
// import routes from './routes';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Set up routes
app.use('/', bookRoute());

// Error handling middleware
// app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
