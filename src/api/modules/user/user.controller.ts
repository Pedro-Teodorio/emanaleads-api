// [Arquivo existente, adicione/modifique o conteúdo]
import { Request, Response, NextFunction } from 'express';
import { userService } from './user.service';
import { ApiError } from '../../../utils/ApiError';
import { tokenService } from '../../../utils/token.service';
import { emailService } from '../../../utils/email.service';
import { logger } from '../../../utils/logger';

class UserController {
	/**
	 * [ROOT] Cria um novo usuário
	 */
	async create(req: Request, res: Response, next: NextFunction) {
		try {
			// A rota (user.routes.ts) DEVE garantir que só um ROOT chegue aqui
			const newUser = await userService.create(req.body);

			// Envio de email baseado na existência da senha
			if (req.body.password == null) {
				// Usuário sem senha => precisa ativar conta
				try {
					const activationToken = await tokenService.createActivationToken(newUser.id);
					await emailService.sendActivationEmail(newUser.email, activationToken, newUser.name);
				} catch (err) {
					logger.error({ err, userId: newUser.id, email: newUser.email }, 'Falha ao enviar email de ativação (create usuário)');
				}
			} else {
				// Usuário com senha => email de boas-vindas
				try {
					await emailService.sendWelcomeEmail(newUser.email, newUser.name);
				} catch (err) {
					logger.error({ err, userId: newUser.id, email: newUser.email }, 'Falha ao enviar email de boas-vindas (create usuário)');
				}
			}

			res.status(201).json(newUser);
		} catch (error) {
			next(error);
		}
	}

	/**
	 * [LOGADO] Pega o perfil do usuário logado
	 */
	async getMe(req: Request, res: Response, next: NextFunction) {
		try {
			if (!req.user) {
				return next(new ApiError(401, 'Não autorizado'));
			}
			const user = await userService.getById(req.user.id);
			res.status(200).json(user);
		} catch (error) {
			next(error);
		}
	}

	// --- NOVOS MÉTODOS PARA O ROOT ---

	/**
	 * [ROOT] Lista usuários (ROOTs e ADMINs)
	 */
	async listUsers(req: Request, res: Response, next: NextFunction) {
		try {
			// A rota garante que só o ROOT chama isso
			const page = Number.parseInt(req.query.page as string) || 1;
			const limit = Number.parseInt(req.query.limit as string) || 10;
			const search = req.query.search as string;
			const role = req.query.role as string | undefined;
			const status = req.query.status as string | undefined;

			const users = await userService.listUsersAsRoot(search, page, limit, role, status);
			res.status(200).json(users);
		} catch (error) {
			next(error);
		}
	}

	/**
	 * [ROOT] Atualiza um usuário (ROOT ou ADMIN)
	 */
	async updateUser(req: Request, res: Response, next: NextFunction) {
		try {
			const { id } = req.params; // ID do usuário a ser atualizado
			const updatedUser = await userService.updateUserAsRoot(id, req.body);
			res.status(200).json(updatedUser);
		} catch (error) {
			next(error);
		}
	}

	/**
	 * [ROOT] Deleta um usuário (ROOT ou ADMIN)
	 */
	async deleteUser(req: Request, res: Response, next: NextFunction) {
		try {
			const { id } = req.params; // ID do usuário a ser deletado
			// Garante que o ROOT logado não pode se auto-deletar
			if (req.user?.id === id) {
				return next(new ApiError(400, 'Você não pode deletar seu próprio usuário'));
			}
			await userService.deleteUserAsRoot(id);
			res.status(204).send(); // 204 No Content
		} catch (error) {
			next(error);
		}
	}

	/**
	 * [ROOT/ADMIN] Reseta senha de um usuário
	 */
	async resetPassword(req: Request, res: Response, next: NextFunction) {
		try {
			const { id } = req.params;
			const { newPassword } = req.body;

			const result = await userService.resetPasswordAsAdmin(id, newPassword);
			res.status(200).json(result);
		} catch (error) {
			next(error);
		}
	}
}

export const userController = new UserController();
