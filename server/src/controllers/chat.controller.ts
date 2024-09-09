import { Request, Response } from 'express';
import { ChatService } from '../services/chat.service';

export const chatController = {
  processMessage: async (req: Request, res: Response) => {
    try {
      const { message, history } = req.body;
      const chatService = ChatService.getInstance();
      const id = res.locals.user?.userId || null;
      const response = await chatService.processMessage(message, id, history);
      res.json({ botMessage: response });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'An error occurred' });
    }
  }
};