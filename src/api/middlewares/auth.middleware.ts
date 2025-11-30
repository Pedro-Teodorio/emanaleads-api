import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { SystemRole } from '@prisma/client';
import { env } from '../../config/env';
import { ApiError } from '../../utils/ApiError';

declare global {
	namespace Express {
		interface Request {
			user?: { id: string; email: string; role: SystemRole };
		}
	}
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
	const authHeader = req.headers.authorization;

	if (!authHeader) {
		return next(new ApiError(401, 'Token de autenticação não fornecido'));
	}

	const parts = authHeader.split(' ');

	if (parts.length !== 2 || parts[0] !== 'Bearer') {
		return next(new ApiError(401, 'Token malformado'));
	}

	const token = parts[1];

	jwt.verify(token, env.JWT_SECRET, (err: jwt.VerifyErrors | null, decoded: any) => {
		if (err) {
			return next(new ApiError(401, 'Token inválido ou expirado'));
		}

		req.user = decoded as { id: string; email: string; role: SystemRole };
		return next();
	});
};
