"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
// [Arquivo existente, adicione/modifique o conteúdo]
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
const validateRequest_1 = require("../../middlewares/validateRequest");
const user_validation_1 = require("./user.validation");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validateRole_middleware_1 = require("../../middlewares/validateRole.middleware"); // Importe o validateRole
const router = (0, express_1.Router)();
// Rota POST /users (Criar Usuário)
// Agora protegida para apenas ROOT
router.post('/', auth_middleware_1.authMiddleware, // 1. Logado?
(0, validateRole_middleware_1.validateRole)(['ROOT']), // 2. É ROOT?
(0, validateRequest_1.validateRequest)(user_validation_1.createUserSchema), // 3. Body válido?
user_controller_1.userController.create);
// Rota GET /users (Listar Usuários)
// Regra: ROOT vê ROOTs e ADMINs
router.get('/', auth_middleware_1.authMiddleware, // 1. Logado?
(0, validateRole_middleware_1.validateRole)(['ROOT']), // 2. É ROOT?
(0, validateRequest_1.validateRequest)(user_validation_1.listUsersQuerySchema), // 3. Query params válidos?
user_controller_1.userController.listUsers);
// Rota GET /users/me (Perfil do Logado)
// Continua igual, para qualquer usuário logado
router.get('/me', auth_middleware_1.authMiddleware, user_controller_1.userController.getMe);
// Rota PUT /users/:id (Atualizar Usuário)
// Regra: ROOT atualiza ROOTs e ADMINs
router.put('/:id', auth_middleware_1.authMiddleware, // 1. Logado?
(0, validateRole_middleware_1.validateRole)(['ROOT']), // 2. É ROOT?
(0, validateRequest_1.validateRequest)(user_validation_1.updateUserSchema), // 3. Body válido?
user_controller_1.userController.updateUser);
// Rota DELETE /users/:id (Deletar Usuário)
// Regra: ROOT deleta ROOTs e ADMINs
router.delete('/:id', auth_middleware_1.authMiddleware, // 1. Logado?
(0, validateRole_middleware_1.validateRole)(['ROOT']), // 2. É ROOT?
(0, validateRequest_1.validateRequest)(user_validation_1.deleteUserParamsSchema), // 3. Param id válido?
user_controller_1.userController.deleteUser);
// Rota POST /users/:id/reset-password (Resetar senha de usuário)
// Regra: ROOT e ADMIN podem resetar senhas
router.post('/:id/reset-password', auth_middleware_1.authMiddleware, (0, validateRole_middleware_1.validateRole)(['ROOT', 'ADMIN']), (0, validateRequest_1.validateRequest)(user_validation_1.resetPasswordSchema), user_controller_1.userController.resetPassword);
exports.userRoutes = router;
