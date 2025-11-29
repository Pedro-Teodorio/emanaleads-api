"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../config/env");
const logger_1 = require("./logger");
class EmailService {
    constructor() {
        this.transporter = null;
        if (env_1.env.SMTP_USER && env_1.env.SMTP_PASS) {
            this.transporter = nodemailer_1.default.createTransport({
                service: 'gmail',
                auth: {
                    user: env_1.env.SMTP_USER,
                    pass: env_1.env.SMTP_PASS,
                },
            });
            logger_1.logger.info('Nodemailer configurado com sucesso');
        }
        else {
            logger_1.logger.warn('Configuração SMTP incompleta. Emails não serão enviados.');
        }
    }
    isConfigured() {
        return this.transporter !== null && !!env_1.env.SMTP_USER;
    }
    async sendResetPasswordEmail(to, resetToken, userName) {
        if (!this.isConfigured()) {
            logger_1.logger.warn(`Email de reset de senha não enviado para ${to} (serviço não configurado)`);
            return;
        }
        const resetUrl = `${env_1.env.APP_URL}/reset-password/${resetToken}`;
        try {
            await this.transporter.sendMail({
                from: env_1.env.SMTP_USER,
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
            logger_1.logger.info(`Email de reset de senha enviado para ${to}`);
        }
        catch (error) {
            logger_1.logger.error({ err: error, to }, 'Erro ao enviar email de reset de senha');
            throw error;
        }
    }
    async sendActivationEmail(to, activationToken, userName) {
        if (!this.isConfigured()) {
            logger_1.logger.warn(`Email de ativacao nao enviado para ${to} (servico nao configurado)`);
            return;
        }
        const activationUrl = `${env_1.env.APP_URL}/activate/${activationToken}`;
        try {
            await this.transporter.sendMail({
                from: env_1.env.SMTP_USER,
                to,
                subject: 'Bem-vindo ao Emanaleads - Ative sua conta',
                html: `
					<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
						<h2>Bem-vindo ao Emanaleads, ${userName}!</h2>
						<p>Sua conta foi criada com sucesso. Para começar a usar o sistema, você precisa definir sua senha.</p>
						<p>Clique no link abaixo para ativar sua conta:</p>
						<a href="${activationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #28a745; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
							Ativar Conta
						</a>
						<p style="color: #666; font-size: 14px;">Este link é válido por 7 dias.</p>
						<hr style="margin: 24px 0; border: none; border-top: 1px solid #ddd;">
						<p style="color: #999; font-size: 12px;">Emanaleads - Sistema de Gestão de Leads</p>
					</div>
				`,
            });
            logger_1.logger.info(`Email de ativação enviado para ${to}`);
        }
        catch (error) {
            logger_1.logger.error({ err: error, to }, 'Erro ao enviar email de ativação');
            throw error;
        }
    }
    async sendWelcomeEmail(to, userName) {
        if (!this.isConfigured()) {
            logger_1.logger.warn(`Email de boas-vindas não enviado para ${to} (serviço não configurado)`);
            return;
        }
        try {
            await this.transporter.sendMail({
                from: env_1.env.SMTP_USER,
                to,
                subject: 'Bem-vindo ao Emanaleads',
                html: `
					<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
						<h2>Olá, ${userName}!</h2>
						<p>Seja bem-vindo ao Emanaleads, seu sistema de gestão de leads.</p>
						<p>Sua conta foi configurada com sucesso e você já pode começar a usar o sistema.</p>
						<a href="${env_1.env.APP_URL}/login" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
							Acessar Sistema
						</a>
						<hr style="margin: 24px 0; border: none; border-top: 1px solid #ddd;">
						<p style="color: #999; font-size: 12px;">Emanaleads - Sistema de Gestão de Leads</p>
					</div>
				`,
            });
            logger_1.logger.info(`Email de boas-vindas enviado para ${to}`);
        }
        catch (error) {
            logger_1.logger.error({ err: error, to }, 'Erro ao enviar email de boas-vindas');
            throw error;
        }
    }
}
exports.emailService = new EmailService();
