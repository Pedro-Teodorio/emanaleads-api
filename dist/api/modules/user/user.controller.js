"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
const user_service_1 = require("./user.service");
const ApiError_1 = require("../../../utils/ApiError");
const token_service_1 = require("../../../utils/token.service");
const email_service_1 = require("../../../utils/email.service");
const logger_1 = require("../../../utils/logger");
class UserController {
    /**
     * [ROOT] Cria um novo usuário
     */
    async create(req, res, next) {
        try {
            // A rota (user.routes.ts) DEVE garantir que só um ROOT chegue aqui
            const newUser = await user_service_1.userService.create(req.body);
            // Envio de email baseado na existência da senha
            if (req.body.password == null) {
                // Usuário sem senha => precisa ativar conta
                try {
                    const activationToken = await token_service_1.tokenService.createActivationToken(newUser.id);
                    await email_service_1.emailService.sendActivationEmail(newUser.email, activationToken, newUser.name);
                }
                catch (err) {
                    logger_1.logger.error({ err, userId: newUser.id, email: newUser.email }, 'Falha ao enviar email de ativação (create usuário)');
                }
            }
            else {
                // Usuário com senha => email de boas-vindas
                try {
                    await email_service_1.emailService.sendWelcomeEmail(newUser.email, newUser.name);
                }
                catch (err) {
                    logger_1.logger.error({ err, userId: newUser.id, email: newUser.email }, 'Falha ao enviar email de boas-vindas (create usuário)');
                }
            }
            res.status(201).json(newUser);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * [LOGADO] Pega o perfil do usuário logado
     */
    async getMe(req, res, next) {
        try {
            if (!req.user) {
                return next(new ApiError_1.ApiError(401, 'Não autorizado'));
            }
            const user = await user_service_1.userService.getById(req.user.id);
            res.status(200).json(user);
        }
        catch (error) {
            next(error);
        }
    }
    // --- NOVOS MÉTODOS PARA O ROOT ---
    /**
     * [ROOT] Lista usuários (ROOTs e ADMINs)
     */
    async listUsers(req, res, next) {
        try {
            // A rota garante que só o ROOT chama isso
            const page = Number.parseInt(req.query.page) || 1;
            const limit = Number.parseInt(req.query.limit) || 10;
            const search = req.query.search;
            const role = req.query.role;
            const status = req.query.status;
            const users = await user_service_1.userService.listUsersAsRoot(search, page, limit, role, status);
            res.status(200).json(users);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * [ROOT] Atualiza um usuário (ROOT ou ADMIN)
     */
    async updateUser(req, res, next) {
        try {
            const { id } = req.params; // ID do usuário a ser atualizado
            const updatedUser = await user_service_1.userService.updateUserAsRoot(id, req.body);
            res.status(200).json(updatedUser);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * [ROOT] Deleta um usuário (ROOT ou ADMIN)
     */
    async deleteUser(req, res, next) {
        try {
            const { id } = req.params; // ID do usuário a ser deletado
            // Garante que o ROOT logado não pode se auto-deletar
            if (req.user?.id === id) {
                return next(new ApiError_1.ApiError(400, 'Você não pode deletar seu próprio usuário'));
            }
            await user_service_1.userService.deleteUserAsRoot(id);
            res.status(204).send(); // 204 No Content
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * [ROOT/ADMIN] Reseta senha de um usuário
     */
    async resetPassword(req, res, next) {
        try {
            const { id } = req.params;
            const { newPassword } = req.body;
            const result = await user_service_1.userService.resetPasswordAsAdmin(id, newPassword);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.userController = new UserController();
