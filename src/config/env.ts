import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
	NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
	PORT: z.coerce.number().default(3000),
	DATABASE_URL: z.string(),
	JWT_SECRET: z.string(),
	JWT_EXPIRES_IN: z.string(),
	RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(5),
	RATE_LIMIT_WINDOW_MINUTES: z.coerce.number().default(15),
	LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
	REDIS_URL: z.string().optional(),
	// Email (Nodemailer/Mailtrap)
	SMTP_USER: z.string().optional(),
	SMTP_PASS: z.string().optional(),
	APP_URL: z.string().optional(),
	// Frontend origin para CORS e domínio do cookie em produção
	FRONTEND_URL: z.string().optional(),
	COOKIE_DOMAIN: z.string().optional(),
});

export const env = envSchema.parse(process.env);

// Validações adicionais em produção para garantir configuração de email
if (process.env.NODE_ENV === 'production') {
	if (!env.SMTP_USER || !env.SMTP_PASS || !env.APP_URL) {
		// Usar console.error para evitar dependência circular com logger
		console.error('[env] Configuração de email incompleta em produção. Verifique SMTP_USER, SMTP_PASS e APP_URL.');
	}
	// Avisos úteis para autenticação cross-site
	if (!env.FRONTEND_URL) {
		console.error('[env] FRONTEND_URL ausente. Defina a URL pública do frontend para CORS (ex: https://emanaleads-app.vercel.app).');
	}
	if (!env.COOKIE_DOMAIN) {
		console.error('[env] COOKIE_DOMAIN ausente. Defina o domínio raiz (ex: emanaleads-app.vercel.app ou seu apex) se quiser compartilhar cookies entre subdomínios.');
	}
}
