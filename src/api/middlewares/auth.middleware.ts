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
	const authCookie = req.cookies['auth-token'];

	if (!authCookie) {
		return next(new ApiError(401, 'Token não fornecido'));
	}

	jwt.verify(authCookie, env.JWT_SECRET, (err: jwt.VerifyErrors | null, decoded: any) => {
		if (err) {
			return next(new ApiError(401, 'Token inválido'));
		}

		req.user = decoded as { id: string; email: string; role: string };
		return next();
	});
};
