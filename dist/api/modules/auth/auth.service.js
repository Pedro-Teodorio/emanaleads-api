"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const ApiError_1 = require("../../../utils/ApiError");
const auth_validation_1 = require("./auth.validation");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../../config/env");
const user_repository_1 = require("../user/user.repository");
const token_service_1 = require("../../../utils/token.service");
const email_service_1 = require("../../../utils/email.service");
const logger_1 = require("../../../utils/logger");
const client_1 = require("@prisma/client");
const SALT_ROUNDS = 10;
class AuthService {
    async login(data) {
        // Checagem redundante de política de senha (defesa em profundidade)
        if (!auth_validation_1.passwordPolicy.test(data.password)) {
            throw new ApiError_1.ApiError(400, 'Senha não atende à política de complexidade');
        }
        const user = await user_repository_1.userRepository.findByEmail(data.email);
        if (!user?.password) {
            throw new ApiError_1.ApiError(401, 'Email ou senha inválidos');
        }
        const isPasswordValid = await bcrypt_1.default.compare(data.password, user.password);
        if (!isPasswordValid) {
            throw new ApiError_1.ApiError(401, 'Email ou senha inválidos');
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, env_1.env.JWT_SECRET, {
            expiresIn: env_1.env.JWT_EXPIRES_IN,
        });
        return { token };
    }
    async changePassword(userId, data) {
        // findById não retorna o campo password por segurança
        const userBasic = await user_repository_1.userRepository.findById(userId);
        if (!userBasic) {
            throw new ApiError_1.ApiError(404, 'Usuário não encontrado');
        }
        // Buscar registro completo (inclui password) via email
        const fullUser = await user_repository_1.userRepository.findByEmail(userBasic.email);
        if (!fullUser?.password) {
            throw new ApiError_1.ApiError(400, 'Usuário não possui senha definida. Use o fluxo de ativação de conta.');
        }
        // Verificar senha atual
        const isCurrentPasswordValid = await bcrypt_1.default.compare(data.currentPassword, fullUser.password);
        if (!isCurrentPasswordValid) {
            throw new ApiError_1.ApiError(401, 'Senha atual incorreta');
        }
        // Verificar se nova senha é diferente da atual
        const isSamePassword = await bcrypt_1.default.compare(data.newPassword, fullUser.password);
        if (isSamePassword) {
            throw new ApiError_1.ApiError(400, 'A nova senha deve ser diferente da senha atual');
        }
        // Hash da nova senha
        const hashedNewPassword = await bcrypt_1.default.hash(data.newPassword, SALT_ROUNDS);
        // Atualizar senha
        await user_repository_1.userRepository.updatePassword(userId, hashedNewPassword);
        return { message: 'Senha alterada com sucesso' };
    }
    async forgotPassword(data) {
        const user = await user_repository_1.userRepository.findByEmail(data.email);
        // Por segurança, sempre retornar sucesso mesmo se email não existir
        // (evita enumeração de emails)
        if (!user) {
            return { message: 'Se o email existir, você receberá instruções para resetar sua senha' };
        }
        // Gerar token de reset
        const resetToken = await token_service_1.tokenService.createPasswordResetToken(user.id);
        // Enviar email
        try {
            await email_service_1.emailService.sendResetPasswordEmail(user.email, resetToken, user.name);
        }
        catch (error) {
            // Log estruturado mas não falhar (evita revelar se email existe)
            logger_1.logger.error({ err: error, email: user.email }, 'Erro ao enviar email de reset');
        }
        return { message: 'Se o email existir, você receberá instruções para resetar sua senha' };
    }
    async resetPassword(token, data) {
        // Validar e consumir token
        const userId = await token_service_1.tokenService.validateAndConsumeToken(token, client_1.TokenType.PASSWORD_RESET);
        if (!userId) {
            throw new ApiError_1.ApiError(400, 'Token inválido ou expirado');
        }
        const user = await user_repository_1.userRepository.findById(userId);
        if (!user) {
            throw new ApiError_1.ApiError(404, 'Usuário não encontrado');
        }
        // Hash da nova senha
        const hashedNewPassword = await bcrypt_1.default.hash(data.newPassword, SALT_ROUNDS);
        // Atualizar senha
        await user_repository_1.userRepository.updatePassword(userId, hashedNewPassword);
        return { message: 'Senha resetada com sucesso' };
    }
    async activateAccount(token, data) {
        // Validar e consumir token
        const userId = await token_service_1.tokenService.validateAndConsumeToken(token, client_1.TokenType.ACCOUNT_ACTIVATION);
        if (!userId) {
            throw new ApiError_1.ApiError(400, 'Token inválido ou expirado');
        }
        const user = await user_repository_1.userRepository.findById(userId);
        if (!user) {
            throw new ApiError_1.ApiError(404, 'Usuário não encontrado');
        }
        // Verificar se já tem senha
        const fullUser = await user_repository_1.userRepository.findByEmail(user.email);
        if (fullUser?.password) {
            throw new ApiError_1.ApiError(400, 'Conta já ativada');
        }
        // Hash da senha
        const hashedPassword = await bcrypt_1.default.hash(data.password, SALT_ROUNDS);
        // Definir senha
        await user_repository_1.userRepository.updatePassword(userId, hashedPassword);
        // Enviar email de boas-vindas
        try {
            await email_service_1.emailService.sendWelcomeEmail(user.email, user.name);
        }
        catch (error) {
            logger_1.logger.error({ err: error, email: user.email }, 'Erro ao enviar email de boas-vindas');
        }
        return { message: 'Conta ativada com sucesso' };
    }
}
exports.authService = new AuthService();
