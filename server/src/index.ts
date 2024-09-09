import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { bookRoute, cartRoute, categoryRoute, orderRoute, reviewRoute, userRoute, chatRoute } from './routes';
import { ChatService } from './services/chat.service';
import { connectDB } from './config/db';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize chat service and ensure it's ready before starting the server
const startServer = async () => {
    const chatService = ChatService.getInstance();
    chatService.initialize().catch(console.error); // Ensure initialization is complete

    const app = express();

    // Middlewares
    app.use(express.json());
    app.use(cors());

    // Set up routes
    app.use('/', bookRoute());
    app.use('/', userRoute());
    app.use('/', categoryRoute());
    app.use('/', reviewRoute());
    app.use('/', orderRoute());
    app.use('/', cartRoute());
    app.use('/', chatRoute());

    // Error handling middleware
    // app.use(errorMiddleware);

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer().catch(error => console.error('Failed to start server:', error));
