import nodemailer, { Transporter } from 'nodemailer';
import { env } from '../config/env';
import { logger } from './logger';

class EmailService {
	private readonly transporter: Transporter | null = null;

	constructor() {
		if (env.SMTP_USER && env.SMTP_PASS) {
			this.transporter = nodemailer.createTransport({
				service: 'gmail',
				auth: {
					user: env.SMTP_USER,
					pass: env.SMTP_PASS,
				},
			});
			logger.info('Nodemailer configurado com sucesso');
		} else {
			logger.warn('Configuração SMTP incompleta. Emails não serão enviados.');
		}
	}

	public isConfigured(): boolean {
		return this.transporter !== null && !!env.SMTP_USER;
	}

	async sendResetPasswordEmail(to: string, resetToken: string, userName: string) {
		if (!this.isConfigured()) {
			logger.warn(`Email de reset de senha não enviado para ${to} (serviço não configurado)`);
			return;
		}

		const resetUrl = `${env.APP_URL}/reset-password/${resetToken}`;

		try {
			await this.transporter!.sendMail({
				from: env.SMTP_USER!,
				to,
				subject: 'Recuperação de senha - Emanaleads',
				html: `
					<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
						<h2>Olá, ${userName}!</h2>
						<p>Você solicitou a recuperação de senha da sua conta no Emanaleads.</p>
						<p>Clique no link abaixo para definir uma nova senha:</p>
						<a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
							Resetar Senha
						</a>
						<p style="color: #666; font-size: 14px;">Este link é válido por 1 hora.</p>
						<p style="color: #666; font-size: 14px;">Se você não solicitou esta recuperação, ignore este email.</p>
						<hr style="margin: 24px 0; border: none; border-top: 1px solid #ddd;">
						<p style="color: #999; font-size: 12px;">Emanaleads - Sistema de Gestão de Leads</p>
					</div>
				`,
			});

			logger.info(`Email de reset de senha enviado para ${to}`);
		} catch (error) {
			logger.error({ err: error, to }, 'Erro ao enviar email de reset de senha');
			throw error;
		}
	}

	async sendActivationEmail(to: string, activationToken: string, userName: string) {
		if (!this.isConfigured()) {
			logger.warn(`Email de ativação não enviado para ${to} (serviço não configurado)`);
			return;
		}

		const activationUrl = `${env.APP_URL}/activate/${activationToken}`;
		const termsUrl = env.TERMS_URL || (env.APP_URL ? `${env.APP_URL}/terms` : '#');
		const privacyUrl = env.PRIVACY_URL || (env.APP_URL ? `${env.APP_URL}/privacy` : '#');

		try {
			await this.transporter!.sendMail({
				from: env.SMTP_USER!,
				to,
				subject: 'Bem-vindo ao Emanaleads - Ative sua conta',
				html: `
					<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
						<h2>Bem-vindo ao Emanaleads, ${userName}!</h2>
						<p>Sua conta foi criada com sucesso. Para começar a usar o sistema, você precisa definir sua senha.</p>
						<p>Clique no link abaixo para ativar sua conta:</p>
						<a href="${activationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
							Ativar Conta
						</a>
						<p style="color: #666; font-size: 14px;">Este link é válido por 7 dias.</p>
						<p style="color: #666; font-size: 13px; line-height: 1.5;">
							Ao clicar em "Ativar Conta" você está aceitando nossos
							<a href="${termsUrl}" style="color: #007bff; text-decoration: none;">Termos de Uso</a>
							e nossa
							<a href="${privacyUrl}" style="color: #007bff; text-decoration: none;">Política de Privacidade</a>.
						</p>
						<hr style="margin: 24px 0; border: none; border-top: 1px solid #ddd;">
						<p style="color: #999; font-size: 12px;">Emanaleads - Sistema de Gestão de Leads</p>
					</div>
				`,
			});

			logger.info(`Email de ativação enviado para ${to}`);
		} catch (error) {
			logger.error({ err: error, to }, 'Erro ao enviar email de ativação');
			throw error;
		}
	}

	async sendWelcomeEmail(to: string, userName: string) {
		if (!this.isConfigured()) {
			logger.warn(`Email de boas-vindas não enviado para ${to} (serviço não configurado)`);
			return;
		}

		try {
			await this.transporter!.sendMail({
				from: env.SMTP_USER!,
				to,
				subject: 'Bem-vindo ao Emanaleads',
				html: `
					<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
						<h2>Olá, ${userName}!</h2>
						<p>Seja bem-vindo ao Emanaleads, seu sistema de gestão de leads.</p>
						<p>Sua conta foi configurada com sucesso e você já pode começar a usar o sistema.</p>
						<a href="${env.APP_URL}/login" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
							Acessar Sistema
						</a>
						<hr style="margin: 24px 0; border: none; border-top: 1px solid #ddd;">
						<p style="color: #999; font-size: 12px;">Emanaleads - Sistema de Gestão de Leads</p>
					</div>
				`,
			});

			logger.info(`Email de boas-vindas enviado para ${to}`);
		} catch (error) {
			logger.error({ err: error, to }, 'Erro ao enviar email de boas-vindas');
			throw error;
		}
	}
}

export const emailService = new EmailService();
