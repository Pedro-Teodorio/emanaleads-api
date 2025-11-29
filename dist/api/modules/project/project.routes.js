"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectRoutes = void 0;
const express_1 = require("express");
const project_controller_1 = require("./project.controller");
const validateRequest_1 = require("../../middlewares/validateRequest");
const project_validation_1 = require("./project.validation");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validateRole_middleware_1 = require("../../middlewares/validateRole.middleware");
const router = (0, express_1.Router)();
// --- Rotas de ROOT ---
// Rota para criar um projeto (Somente ROOT)
router.post('/', auth_middleware_1.authMiddleware, // 1. Está logado?
(0, validateRole_middleware_1.validateRole)(['ROOT']), // 2. É ROOT?
(0, validateRequest_1.validateRequest)(project_validation_1.createProjectSchema), // 3. O body (name) é válido?
project_controller_1.projectController.create);
// Rota para listar todos os projetos (Somente ROOT)
router.get('/', auth_middleware_1.authMiddleware, // 1. Está logado?
(0, validateRole_middleware_1.validateRole)(['ROOT']), // 2. É ROOT?
(0, validateRequest_1.validateRequest)(project_validation_1.listProjectsQuerySchema), // 3. Query params válidos?
project_controller_1.projectController.listProjectsAsRoot);
// Rota para listar projetos do ADMIN atual (Somente ADMIN)
router.get('/mine', auth_middleware_1.authMiddleware, (0, validateRole_middleware_1.validateRole)(['ADMIN']), project_controller_1.projectController.listProjectsAsAdmin);
// Rota para listar os 5 projetos mais recentes (Somente ROOT)
router.get('/recent', auth_middleware_1.authMiddleware, // 1. Está logado?
(0, validateRole_middleware_1.validateRole)(['ROOT']), // 2. É ROOT?
project_controller_1.projectController.listRecentProjects);
// Rota para buscar um projeto específico (ROOT/ADMIN)
router.get('/:projectId', auth_middleware_1.authMiddleware, (0, validateRole_middleware_1.validateRole)(['ROOT', 'ADMIN']), project_controller_1.projectController.getById);
// Rota para buscar métricas de um projeto (ROOT/ADMIN)
router.get('/:projectId/metrics', auth_middleware_1.authMiddleware, (0, validateRole_middleware_1.validateRole)(['ROOT', 'ADMIN']), project_controller_1.projectController.getMetrics);
// Rota para atualizar um projeto (Somente ROOT)
router.put('/:projectId', auth_middleware_1.authMiddleware, // 1. Está logado?
(0, validateRole_middleware_1.validateRole)(['ROOT']), // 2. É ROOT?
(0, validateRequest_1.validateRequest)(project_validation_1.updateProjectSchema), // 3. Params + body válidos?
project_controller_1.projectController.update);
// Rota para deletar um projeto (Somente ROOT)
router.delete('/:projectId', auth_middleware_1.authMiddleware, // 1. Está logado?
(0, validateRole_middleware_1.validateRole)(['ROOT']), // 2. É ROOT?
(0, validateRequest_1.validateRequest)(project_validation_1.deleteProjectParamsSchema), // 3. Param válido?
project_controller_1.projectController.delete);
// --- Rotas de ADMIN ---
// Rota para adicionar um membro a um projeto (Somente ADMIN)
router.post('/:projectId/members', auth_middleware_1.authMiddleware, // 1. Está logado?
(0, validateRole_middleware_1.validateRole)(['ADMIN']), // 2. É ADMIN? (A lógica no service confirma SE é admin DO projeto)
(0, validateRequest_1.validateRequest)(project_validation_1.addMemberSchema), // 3. O body (userId) e params (projectId) são válidos?
project_controller_1.projectController.addMember);
// Rota para criar novo PROJECT_USER e adicionar como membro (Somente ADMIN)
router.post('/:projectId/members/new', auth_middleware_1.authMiddleware, (0, validateRole_middleware_1.validateRole)(['ADMIN']), (0, validateRequest_1.validateRequest)(project_validation_1.createAndAddMemberSchema), project_controller_1.projectController.createAndAddMember);
// Rota GET /projects/:projectId/users (Listar usuários do projeto)
// Regra: ADMIN daquele projeto vê Admins e Membros
router.get('/:projectId/users', auth_middleware_1.authMiddleware, // 1. Logado?
(0, validateRole_middleware_1.validateRole)(['ADMIN']), // 2. É ADMIN?
(0, validateRequest_1.validateRequest)(project_validation_1.listProjectUsersSchema), // 3. Params válidos?
project_controller_1.projectController.listProjectUsers);
// Rota DELETE /projects/:projectId/members/:memberId (Remover membro)
// Regra: ADMIN daquele projeto remove um ProjectUser
router.delete('/:projectId/members/:memberId', auth_middleware_1.authMiddleware, // 1. Logado?
(0, validateRole_middleware_1.validateRole)(['ADMIN']), // 2. É ADMIN?
(0, validateRequest_1.validateRequest)(project_validation_1.removeMemberSchema), // 3. Params válidos?
project_controller_1.projectController.removeMember);
exports.projectRoutes = router;
