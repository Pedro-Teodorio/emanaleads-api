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

	async logout(req: Request, res: Response, next: NextFunction) {
		try {
			res.clearCookie('auth-token', {
				httpOnly: true,
				sameSite: 'strict',
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
