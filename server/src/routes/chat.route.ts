import express from 'express';
import cors from 'cors';
import { chatController } from '../controllers/chat.controller';
import { extractUserFromJWT } from '../middlewares';

export const chatRoute = () => {
  const router = express.Router();

  router.post('/chat',
    cors(),
    extractUserFromJWT,
    chatController.processMessage,
    (err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('Chatbot server error', err);
      res.status(500).json({ message: 'Error dealing whit chatbot' });
    }
  );

  return router;
};