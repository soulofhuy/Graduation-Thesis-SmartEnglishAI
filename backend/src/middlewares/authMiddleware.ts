import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../utils/jwt';

export type AuthenticatedRequest = Request & {
  userId?: string;
};

const verifyJWT = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Missing token' });
  }

  try {
    const decoded = verifyToken(token);
    const userId = decoded.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    req.userId = userId;
    next();
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'JWT_SECRET is not defined'
    ) {
      return res.status(500).json({ message: 'JWT_SECRET is not configured' });
    }

    return res.status(401).json({ message: 'Token is invalid or expired' });
  }
};

export default verifyJWT;
