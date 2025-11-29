// [Arquivo existente, adicione/modifique o conteúdo]
import { Router } from 'express';
import { userController } from './user.controller';
import { validateRequest } from '../../middlewares/validateRequest';
import { createUserSchema, updateUserSchema, listUsersQuerySchema, deleteUserParamsSchema, resetPasswordSchema } from './user.validation';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validateRole } from '../../middlewares/validateRole.middleware'; // Importe o validateRole

const router = Router();

// Rota POST /users (Criar Usuário)
// Agora protegida para apenas ROOT
router.post(
	'/',
	authMiddleware, // 1. Logado?
	validateRole(['ROOT']), // 2. É ROOT?
	validateRequest(createUserSchema), // 3. Body válido?
	userController.create,
);

// Rota GET /users (Listar Usuários)
// Regra: ROOT vê ROOTs e ADMINs
router.get(
	'/',
	authMiddleware, // 1. Logado?
	validateRole(['ROOT']), // 2. É ROOT?
	validateRequest(listUsersQuerySchema), // 3. Query params válidos?
	userController.listUsers,
);

// Rota GET /users/me (Perfil do Logado)
// Continua igual, para qualquer usuário logado
router.get('/me', authMiddleware, userController.getMe);

// Rota PUT /users/:id (Atualizar Usuário)
// Regra: ROOT atualiza ROOTs e ADMINs
router.put(
	'/:id',
	authMiddleware, // 1. Logado?
	validateRole(['ROOT']), // 2. É ROOT?
	validateRequest(updateUserSchema), // 3. Body válido?
	userController.updateUser,
);

// Rota DELETE /users/:id (Deletar Usuário)
// Regra: ROOT deleta ROOTs e ADMINs
router.delete(
	'/:id',
	authMiddleware, // 1. Logado?
	validateRole(['ROOT']), // 2. É ROOT?
	validateRequest(deleteUserParamsSchema), // 3. Param id válido?
	userController.deleteUser,
);

// Rota POST /users/:id/reset-password (Resetar senha de usuário)
// Regra: ROOT e ADMIN podem resetar senhas
router.post('/:id/reset-password', authMiddleware, validateRole(['ROOT', 'ADMIN']), validateRequest(resetPasswordSchema), userController.resetPassword);

export const userRoutes = router;
