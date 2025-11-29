import { prisma } from '../config/prisma';
import { TokenType } from '@prisma/client';
import crypto from 'node:crypto';

class TokenService {
	/**
	 * Gera um token seguro aleatório
	 */
	private generateToken(): string {
		return crypto.randomBytes(32).toString('hex');
	}

	/**
	 * Cria token de reset de senha (válido por 1 hora)
	 */
	async createPasswordResetToken(userId: string): Promise<string> {
		// Invalidar tokens anteriores do mesmo tipo
		await prisma.token.updateMany({
			where: {
				userId,
				type: TokenType.PASSWORD_RESET,
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

		await prisma.token.create({
			data: {
				userId,
				token,
				type: TokenType.PASSWORD_RESET,
				expiresAt,
			},
		});

		return token;
	}

	/**
	 * Cria token de ativação de conta (válido por 7 dias)
	 */
	async createActivationToken(userId: string): Promise<string> {
		// Invalidar tokens anteriores do mesmo tipo
		await prisma.token.updateMany({
			where: {
				userId,
				type: TokenType.ACCOUNT_ACTIVATION,
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

		await prisma.token.create({
			data: {
				userId,
				token,
				type: TokenType.ACCOUNT_ACTIVATION,
				expiresAt,
			},
		});

		return token;
	}

	/**
	 * Valida e consome um token
	 * @returns userId se token válido, null caso contrário
	 */
	async validateAndConsumeToken(token: string, type: TokenType): Promise<string | null> {
		const tokenRecord = await prisma.token.findFirst({
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
		await prisma.token.update({
			where: { id: tokenRecord.id },
			data: { used: true },
		});

		return tokenRecord.userId;
	}

	/**
	 * Limpa tokens expirados (pode ser executado periodicamente)
	 */
	async cleanExpiredTokens(): Promise<number> {
		const result = await prisma.token.deleteMany({
			where: {
				expiresAt: {
					lt: new Date(),
				},
			},
		});

		return result.count;
	}
}

export const tokenService = new TokenService();
