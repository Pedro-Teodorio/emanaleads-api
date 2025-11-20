import pino from 'pino';
import { env } from '../config/env';

// Logger estruturado usando pino com nível configurável via LOG_LEVEL.
// Pode ser estendido posteriormente para enviar logs para destinos externos.
export const logger = pino({
	level: env.LOG_LEVEL,
	base: { service: 'emanaleads-api' },
	transport: {
		target: 'pino-pretty',
		options: { colorize: true, translateTime: 'SYS:standard' },
	},
});

export type Logger = typeof logger;
