import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { env } from '../../../config/env';

class AuthController {
	async login(req: Request, res: Response, next: NextFunction) {
		try {
			const { token } = await authService.login(req.body);

			const isProd = env.NODE_ENV === 'production';
			// Em produção (origens diferentes) precisa sameSite none + secure.
			// COOKIE_DOMAIN opcional para compartilhar entre subdomínios.
			const cookieDomain = isProd ? env.COOKIE_DOMAIN : undefined;
			res.cookie('auth-token', token, {
				httpOnly: true,
				maxAge: 1000 * 60 * 60 * 24, // 1 dia
				path: '/',
				secure: isProd, // exige HTTPS e necessário para sameSite none
				sameSite: isProd ? 'none' : 'strict',
				domain: cookieDomain, // definir ex: emanaleads-app.vercel.app ou .seu-dominio.com
			});

			res.status(200).json({ message: 'Login realizado com sucesso' });
		} catch (error) {
			next(error);
		}
	}

	async logout(req: Request, res: Response, next: NextFunction) {
		try {
			const isProd = env.NODE_ENV === 'production';
			const cookieDomain = isProd ? env.COOKIE_DOMAIN : undefined;
			res.clearCookie('auth-token', {
				httpOnly: true,
				path: '/',
				secure: isProd,
				sameSite: isProd ? 'none' : 'strict',
				domain: cookieDomain,
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
