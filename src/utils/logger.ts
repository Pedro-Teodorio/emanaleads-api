import pino from 'pino';
import { env } from '../config/env';

// Logger estruturado usando pino com nível configurável via LOG_LEVEL.
// Em desenvolvimento usa pino-pretty para logs formatados, em produção usa JSON simples.
const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = pino(
	isDevelopment
		? {
				level: env.LOG_LEVEL,
				base: { service: 'emanaleads-api' },
				transport: {
					target: 'pino-pretty',
					options: { colorize: true, translateTime: 'SYS:standard' },
				},
		  }
		: {
				level: env.LOG_LEVEL,
				base: { service: 'emanaleads-api' },
		  },
);

export type Logger = typeof logger;
