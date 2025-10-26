import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';

class AuthController {
	async login(req: Request, res: Response, next: NextFunction) {
		try {
			const { token } = await authService.login(req.body);
			res.cookie('auth-token', token, {
				httpOnly: true,
				maxAge: 1000 * 60 * 60 * 24, // 1 dia
				sameSite: 'strict',
			});

			res.status(200).json({ message: 'Login realizado com sucesso' });
		} catch (error) {
			next(error);
		}
	}
}

export const authController = new AuthController();
