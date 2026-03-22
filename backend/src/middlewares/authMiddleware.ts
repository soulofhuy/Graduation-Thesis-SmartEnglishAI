import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../utils/jwt';
import Responses from '../utils/responses';

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
    return res
      .status(401)
      .json(Responses.errorResponse(new Error('Missing or invalid token')));
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res
      .status(401)
      .json(Responses.errorResponse(new Error('Missing token')));
  }

  try {
    const decoded = verifyToken(token);
    const userId = decoded.userId;

    if (!userId) {
      return res
        .status(401)
        .json(Responses.errorResponse(new Error('Invalid token payload')));
    }

    req.userId = userId;
    next();
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'JWT_SECRET is not defined'
    ) {
      return res
        .status(500)
        .json(
          Responses.errorResponse(new Error('JWT_SECRET is not configured'))
        );
    }

    return res
      .status(401)
      .json(Responses.errorResponse(new Error('Token is invalid or expired')));
  }
};

export default verifyJWT;
