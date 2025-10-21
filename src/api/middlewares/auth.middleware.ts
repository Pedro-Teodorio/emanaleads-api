import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { ApiError } from '../../utils/ApiError';

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string; role: string };
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(new ApiError(401, 'Token não fornecido'));
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2) {
    return next(new ApiError(401, 'Token malformado'));
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return next(new ApiError(401, 'Token malformado'));
  }

  jwt.verify(token, env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(new ApiError(401, 'Token inválido'));
    }

    req.user = decoded as { id: string; email: string, role: string };
    return next();
  });
};
