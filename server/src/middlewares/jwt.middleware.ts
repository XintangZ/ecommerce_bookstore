import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return next(new Error('Access token is missing or invalid.'));
  }

  try {
    const secretKey = process.env.JWT_SECRET || 'default_secret_key';
    const decoded = jwt.verify(token, secretKey);
    res.locals.user = decoded;

    next();
  } catch (error) {
    next(new Error('Invalid or expired token.'));
  }
};

const extractUserFromJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers?.authorization;
  if (authHeader) {
    try {
      const token = authHeader.split(' ')[1];
      const secretKey = process.env.JWT_SECRET || 'default_secret_key';
      const decoded = jwt.verify(token, secretKey);
      res.locals.user = decoded;
    } catch (error) {
      console.error('Token verification failed:', error);
    }
  }
  next();
};

export { authenticateJWT, extractUserFromJWT };
