import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';

class AuthController {
	async login(req: Request, res: Response, next: NextFunction) {
		try {
			const token = await authService.login(req.body);
			res.status(200).json(token);
		} catch (error) {
			next(error);
		}
	}
}

export const authController = new AuthController();
