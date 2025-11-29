import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
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
});

export const env = envSchema.parse(process.env);

// Validações adicionais em produção para garantir configuração de email
if (process.env.NODE_ENV === 'production') {
	if (!env.SMTP_USER || !env.SMTP_PASS || !env.APP_URL) {
		// Usar console.error para evitar dependência circular com logger
		console.error('[env] Configuração de email incompleta em produção. Verifique SMTP_USER, SMTP_PASS e APP_URL.');
	}
}
