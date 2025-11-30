import { ApiError } from '../../../utils/ApiError';
import { activateAccountSchema, changePasswordSchema, forgotPasswordSchema, loginSchema, passwordPolicy, resetPasswordSchema } from './auth.validation';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../../../config/env';
import { z } from 'zod';
import { userRepository } from '../user/user.repository';
import { tokenService } from '../../../utils/token.service';
import { emailService } from '../../../utils/email.service';
import { logger } from '../../../utils/logger';
import { TokenType } from '@prisma/client';

type LoginData = z.infer<typeof loginSchema>['body'];
type ChangePasswordData = z.infer<typeof changePasswordSchema>['body'];
type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>['body'];
type ResetPasswordData = z.infer<typeof resetPasswordSchema>['body'];
type ActivateAccountData = z.infer<typeof activateAccountSchema>['body'];

const SALT_ROUNDS = 10;

class AuthService {
	async login(data: LoginData) {
		// Checagem redundante de política de senha (defesa em profundidade)
		if (!passwordPolicy.test(data.password)) {
			throw new ApiError(400, 'Senha não atende à política de complexidade');
		}
		const user = await userRepository.findByEmail(data.email);

		if (!user?.password) {
			throw new ApiError(401, 'Email ou senha inválidos');
		}

		const isPasswordValid = await bcrypt.compare(data.password, user.password);

		if (!isPasswordValid) {
			throw new ApiError(401, 'Email ou senha inválidos');
		}

		const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, env.JWT_SECRET as jwt.Secret, {
			expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
		});

		const { password, ...userToReturn } = user;

		return { token, user: userToReturn };
	}

	async changePassword(userId: string, data: ChangePasswordData) {
		// findById não retorna o campo password por segurança
		const userBasic = await userRepository.findById(userId);

		if (!userBasic) {
			throw new ApiError(404, 'Usuário não encontrado');
		}

		// Buscar registro completo (inclui password) via email
		const fullUser = await userRepository.findByEmail(userBasic.email);

		if (!fullUser?.password) {
			throw new ApiError(400, 'Usuário não possui senha definida. Use o fluxo de ativação de conta.');
		}

		// Verificar senha atual
		const isCurrentPasswordValid = await bcrypt.compare(data.currentPassword, fullUser.password);

		if (!isCurrentPasswordValid) {
			throw new ApiError(401, 'Senha atual incorreta');
		}

		// Verificar se nova senha é diferente da atual
		const isSamePassword = await bcrypt.compare(data.newPassword, fullUser.password);

		if (isSamePassword) {
			throw new ApiError(400, 'A nova senha deve ser diferente da senha atual');
		}

		// Hash da nova senha
		const hashedNewPassword = await bcrypt.hash(data.newPassword, SALT_ROUNDS);

		// Atualizar senha
		await userRepository.updatePassword(userId, hashedNewPassword);

		return { message: 'Senha alterada com sucesso' };
	}

	async forgotPassword(data: ForgotPasswordData) {
		const user = await userRepository.findByEmail(data.email);

		// Por segurança, sempre retornar sucesso mesmo se email não existir
		// (evita enumeração de emails)
		if (!user) {
			return { message: 'Se o email existir, você receberá instruções para resetar sua senha' };
		}

		// Gerar token de reset
		const resetToken = await tokenService.createPasswordResetToken(user.id);

		// Enviar email
		try {
			await emailService.sendResetPasswordEmail(user.email, resetToken, user.name);
		} catch (error) {
			// Log estruturado mas não falhar (evita revelar se email existe)
			logger.error({ err: error, email: user.email }, 'Erro ao enviar email de reset');
		}

		return { message: 'Se o email existir, você receberá instruções para resetar sua senha' };
	}

	async resetPassword(token: string, data: ResetPasswordData) {
		// Validar e consumir token
		const userId = await tokenService.validateAndConsumeToken(token, TokenType.PASSWORD_RESET);

		if (!userId) {
			throw new ApiError(400, 'Token inválido ou expirado');
		}

		const user = await userRepository.findById(userId);

		if (!user) {
			throw new ApiError(404, 'Usuário não encontrado');
		}

		// Hash da nova senha
		const hashedNewPassword = await bcrypt.hash(data.newPassword, SALT_ROUNDS);

		// Atualizar senha
		await userRepository.updatePassword(userId, hashedNewPassword);

		return { message: 'Senha resetada com sucesso' };
	}

	async activateAccount(token: string, data: ActivateAccountData) {
		// Validar e consumir token
		const userId = await tokenService.validateAndConsumeToken(token, TokenType.ACCOUNT_ACTIVATION);

		if (!userId) {
			throw new ApiError(400, 'Token inválido ou expirado');
		}

		const user = await userRepository.findById(userId);

		if (!user) {
			throw new ApiError(404, 'Usuário não encontrado');
		}

		// Verificar se já tem senha
		const fullUser = await userRepository.findByEmail(user.email);
		if (fullUser?.password) {
			throw new ApiError(400, 'Conta já ativada');
		}

		// Hash da senha
		const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

		// Definir senha
		await userRepository.updatePassword(userId, hashedPassword);

		// Enviar email de boas-vindas
		try {
			await emailService.sendWelcomeEmail(user.email, user.name);
		} catch (error) {
			logger.error({ err: error, email: user.email }, 'Erro ao enviar email de boas-vindas');
		}

		return { message: 'Conta ativada com sucesso' };
	}
}

export const authService = new AuthService();
