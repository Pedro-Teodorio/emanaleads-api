import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../../utils/ApiError';
import { SystemRole } from '@prisma/client'; // Importe o enum do Prisma

/**
 * Middleware para verificar se o usuário logado possui um dos papéis (roles) necessários.
 * @param roles Array de SystemRole (ex: ['ROOT', 'ADMIN'])
 */
export const validateRole = (roles: SystemRole[]) => {
	return (req: Request, res: Response, next: NextFunction) => {
		if (!req.user) {
			return next(new ApiError(401, 'Não autorizado. Token não fornecido.'));
		}

		const userRole = req.user.role as SystemRole;

		if (!roles.includes(userRole)) {
			return next(new ApiError(403, 'Acesso negado. Você não tem permissão para este recurso.'));
		}

		next();
	};
};
