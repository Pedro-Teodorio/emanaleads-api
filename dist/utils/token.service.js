"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenService = void 0;
const prisma_1 = require("../config/prisma");
const client_1 = require("@prisma/client");
const node_crypto_1 = __importDefault(require("node:crypto"));
class TokenService {
    /**
     * Gera um token seguro aleatório
     */
    generateToken() {
        return node_crypto_1.default.randomBytes(32).toString('hex');
    }
    /**
     * Cria token de reset de senha (válido por 1 hora)
     */
    async createPasswordResetToken(userId) {
        // Invalidar tokens anteriores do mesmo tipo
        await prisma_1.prisma.token.updateMany({
            where: {
                userId,
                type: client_1.TokenType.PASSWORD_RESET,
                used: false,
            },
            data: {
                used: true,
            },
        });
        // Criar novo token
        const token = this.generateToken();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1); // 1 hora
        await prisma_1.prisma.token.create({
            data: {
                userId,
                token,
                type: client_1.TokenType.PASSWORD_RESET,
                expiresAt,
            },
        });
        return token;
    }
    /**
     * Cria token de ativação de conta (válido por 7 dias)
     */
    async createActivationToken(userId) {
        // Invalidar tokens anteriores do mesmo tipo
        await prisma_1.prisma.token.updateMany({
            where: {
                userId,
                type: client_1.TokenType.ACCOUNT_ACTIVATION,
                used: false,
            },
            data: {
                used: true,
            },
        });
        // Criar novo token
        const token = this.generateToken();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 dias
        await prisma_1.prisma.token.create({
            data: {
                userId,
                token,
                type: client_1.TokenType.ACCOUNT_ACTIVATION,
                expiresAt,
            },
        });
        return token;
    }
    /**
     * Valida e consome um token
     * @returns userId se token válido, null caso contrário
     */
    async validateAndConsumeToken(token, type) {
        const tokenRecord = await prisma_1.prisma.token.findFirst({
            where: {
                token,
                type,
                used: false,
            },
        });
        if (!tokenRecord) {
            return null;
        }
        // Verificar se expirou
        if (new Date() > tokenRecord.expiresAt) {
            return null;
        }
        // Marcar como usado
        await prisma_1.prisma.token.update({
            where: { id: tokenRecord.id },
            data: { used: true },
        });
        return tokenRecord.userId;
    }
    /**
     * Limpa tokens expirados (pode ser executado periodicamente)
     */
    async cleanExpiredTokens() {
        const result = await prisma_1.prisma.token.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date(),
                },
            },
        });
        return result.count;
    }
}
exports.tokenService = new TokenService();
