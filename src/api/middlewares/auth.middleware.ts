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
	let token = req.cookies?.['auth-token'];

	if (!token) {
		const authHeader = req.headers.authorization;

		if (authHeader) {
			const parts = authHeader.split(' ');

			if (parts.length === 2 && parts[0] === 'Bearer') {
				token = parts[1];
			}
		}
	}

	if (!token) {
		return next(new ApiError(401, 'Token de autenticação não fornecido'));
	}

	jwt.verify(token, env.JWT_SECRET, (err: jwt.VerifyErrors | null, decoded: any) => {
		if (err) {
			return next(new ApiError(401, 'Token inválido ou expirado'));
		}

		req.user = decoded as { id: string; email: string; role: SystemRole };
		return next();
	});
};
