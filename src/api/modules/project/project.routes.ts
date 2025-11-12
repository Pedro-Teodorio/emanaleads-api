import { Router } from 'express';
import { projectController } from './project.controller';
import { validateRequest } from '../../middlewares/validateRequest';
import { createProjectSchema, addMemberSchema, listProjectUsersSchema, removeMemberSchema, updateProjectSchema, listProjectsQuerySchema } from './project.validation';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validateRole } from '../../middlewares/validateRole.middleware';

const router = Router();

// --- Rotas de ROOT ---

// Rota para criar um projeto (Somente ROOT)
router.post(
	'/',
	authMiddleware, // 1. Está logado?
	validateRole(['ROOT']), // 2. É ROOT?
	validateRequest(createProjectSchema), // 3. O body (name) é válido?
	projectController.create, // 4. Executa
);

// Rota para listar todos os projetos (Somente ROOT)
router.get(
	'/',
	authMiddleware, // 1. Está logado?
	validateRole(['ROOT']), // 2. É ROOT?
	validateRequest(listProjectsQuerySchema), // 3. Query params válidos?
	projectController.listProjectsAsRoot, // 4. Executa
);

// Rota para listar os 5 projetos mais recentes (Somente ROOT)
router.get(
	'/recent',
	authMiddleware, // 1. Está logado?
	validateRole(['ROOT']), // 2. É ROOT?
	projectController.listRecentProjects, // 4. Executa
);



// Rota para atualizar um projeto (Somente ROOT)
router.put(
	'/:projectId',
	authMiddleware, // 1. Está logado?
	validateRole(['ROOT']), // 2. É ROOT?
	validateRequest(updateProjectSchema), // 3. O body (name, description, status) é válido?
	projectController.update, // 4. Executa
);

// Rota para deletar um projeto (Somente ROOT)
router.delete(
	'/:projectId',
	authMiddleware, // 1. Está logado?
	validateRole(['ROOT']), // 2. É ROOT?
	projectController.delete, // 4. Executa
);

// --- Rotas de ADMIN ---

// Rota para adicionar um membro a um projeto (Somente ADMIN)
router.post(
	'/:projectId/members',
	authMiddleware, // 1. Está logado?
	validateRole(['ADMIN']), // 2. É ADMIN? (A lógica no service confirma SE é admin DO projeto)
	validateRequest(addMemberSchema), // 3. O body (userId) e params (projectId) são válidos?
	projectController.addMember, // 4. Executa
);

// Rota GET /projects/:projectId/users (Listar usuários do projeto)
// Regra: ADMIN daquele projeto vê Admins e Membros
router.get(
	'/:projectId/users',
	authMiddleware, // 1. Logado?
	validateRole(['ADMIN']), // 2. É ADMIN?
	validateRequest(listProjectUsersSchema), // 3. Params válidos?
	projectController.listProjectUsers, // 4. Executa
);

// Rota DELETE /projects/:projectId/members/:memberId (Remover membro)
// Regra: ADMIN daquele projeto remove um ProjectUser
router.delete(
	'/:projectId/members/:memberId',
	authMiddleware, // 1. Logado?
	validateRole(['ADMIN']), // 2. É ADMIN?
	validateRequest(removeMemberSchema), // 3. Params válidos?
	projectController.removeMember, // 4. Executa
);

export const projectRoutes = router;
