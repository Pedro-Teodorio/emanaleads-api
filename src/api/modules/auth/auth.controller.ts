import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { env } from '../../../config/env';

class AuthController {
	async login(req: Request, res: Response, next: NextFunction) {
		try {
			const { token, user } = await authService.login(req.body);

			const isProduction = env.NODE_ENV === 'production';

			res.cookie('auth-token', token, {
				httpOnly: true,
				secure: isProduction,
				sameSite: isProduction ? 'none' : 'lax',
				maxAge: 7 * 24 * 60 * 60 * 1000,
			});

			res.status(200).json({ user });
		} catch (error) {
			next(error);
		}
	}

	async logout(req: Request, res: Response, next: NextFunction) {
		try {
			const isProduction = env.NODE_ENV === 'production';

			res.clearCookie('auth-token', {
				httpOnly: true,
				secure: isProduction,
				sameSite: isProduction ? 'none' : 'lax',
			});

			res.status(200).json({ message: 'Logout realizado com sucesso' });
		} catch (error) {
			next(error);
		}
	}

	async changePassword(req: Request, res: Response, next: NextFunction) {
		try {
			if (!req.user?.id) {
				throw new Error('Usuário não autenticado');
			}

			const result = await authService.changePassword(req.user.id, req.body);
			res.status(200).json(result);
		} catch (error) {
			next(error);
		}
	}

	async forgotPassword(req: Request, res: Response, next: NextFunction) {
		try {
			const result = await authService.forgotPassword(req.body);
			res.status(200).json(result);
		} catch (error) {
			next(error);
		}
	}

	async resetPassword(req: Request, res: Response, next: NextFunction) {
		try {
			const { token } = req.params;
			const result = await authService.resetPassword(token, req.body);
			res.status(200).json(result);
		} catch (error) {
			next(error);
		}
	}

	async activateAccount(req: Request, res: Response, next: NextFunction) {
		try {
			const { token } = req.params;
			const result = await authService.activateAccount(token, req.body);
			res.status(200).json(result);
		} catch (error) {
			next(error);
		}
	}
}

export const authController = new AuthController();
