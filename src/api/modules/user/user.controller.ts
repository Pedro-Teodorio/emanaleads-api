// [Arquivo existente, adicione/modifique o conteúdo]
import { Request, Response, NextFunction } from 'express';
import { userService } from './user.service';
import { ApiError } from '../../../utils/ApiError';

class UserController {
	/**
	 * [ROOT] Cria um novo usuário
	 */
	async create(req: Request, res: Response, next: NextFunction) {
		try {
			// A rota (user.routes.ts) DEVE garantir que só um ROOT chegue aqui
			const newUser = await userService.create(req.body);
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
			const users = await userService.listUsersAsRoot();
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
			if (req.user && req.user.id === id) {
				return next(new ApiError(400, 'Você não pode deletar seu próprio usuário'));
			}
			await userService.deleteUserAsRoot(id);
			res.status(204).send(); // 204 No Content
		} catch (error) {
			next(error);
		}
	}
}

export const userController = new UserController();
