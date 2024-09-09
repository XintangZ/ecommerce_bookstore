import express from 'express';
import { chatController } from '../controllers/chat.controller';
import { extractUserFromJWT } from '../middlewares';

export const chatRoute = () => {
  const router = express.Router();
  router.post('/chat', extractUserFromJWT, chatController.processMessage);
  return router;
};