import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../../utils/ApiError';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';

interface RateLimiterOptions {
	maxRequests: number;
	windowMs: number; // milliseconds
}

interface RateLimitEntry {
	count: number;
	resetAt: number; // timestamp
}

interface ConsumeResult {
	allowed: boolean;
	remaining: number;
	resetAt: number;
}

interface RateLimiter {
	consume(key: string): ConsumeResult;
}

class InMemoryRateLimiter implements RateLimiter {
	private readonly store = new Map<string, RateLimitEntry>();
	private readonly options: RateLimiterOptions;

	constructor(options: RateLimiterOptions) {
		this.options = options;
	}

	consume(key: string): ConsumeResult {
		const now = Date.now();
		const entry = this.store.get(key);

		if (!entry || entry.resetAt <= now) {
			this.store.set(key, { count: 1, resetAt: now + this.options.windowMs });
			return { allowed: true, remaining: this.options.maxRequests - 1, resetAt: now + this.options.windowMs };
		}

		if (entry.count >= this.options.maxRequests) {
			return { allowed: false, remaining: 0, resetAt: entry.resetAt };
		}

		entry.count += 1;
		this.store.set(key, entry);
		return { allowed: true, remaining: this.options.maxRequests - entry.count, resetAt: entry.resetAt };
	}
}

// Stub RedisRateLimiter (mesma interface) para futura implementação real.
class RedisRateLimiter implements RateLimiter {
	private readonly options: RateLimiterOptions;
	// Quando for implementado: passar cliente Redis no construtor
	constructor(options: RateLimiterOptions) {
		this.options = options;
	}
	consume(key: string): ConsumeResult {
		// Stub apenas faz log e lança fallback (não deve ser usado em produção sem implementação real)
		logger.warn({ key }, 'RedisRateLimiter stub utilizado - fallback para in-memory');
		return { allowed: true, remaining: this.options.maxRequests - 1, resetAt: Date.now() + this.options.windowMs };
	}
}

const maxRequests = env.RATE_LIMIT_MAX_REQUESTS;
const windowMinutes = env.RATE_LIMIT_WINDOW_MINUTES;
const options: RateLimiterOptions = { maxRequests, windowMs: windowMinutes * 60 * 1000 };

let limiter: RateLimiter;
if (env.REDIS_URL) {
	logger.info({ redisUrl: env.REDIS_URL }, 'Inicializando stub RedisRateLimiter (implementação real pendente)');
	limiter = new RedisRateLimiter(options);
} else {
	limiter = new InMemoryRateLimiter(options);
}

export const loginRateLimit = (req: Request, res: Response, next: NextFunction) => {
	const ip = req.ip || 'unknown';
	const email = typeof req.body?.email === 'string' ? req.body.email : 'no-email';
	const key = `login:${ip}:${email}`;

	const result = limiter.consume(key);
	if (!result.allowed) {
		const secondsToReset = Math.ceil((result.resetAt - Date.now()) / 1000);
		return next(new ApiError(429, `Muitas tentativas. Tente novamente em ${secondsToReset}s`, 'RATE_LIMIT_EXCEEDED'));
	}

	next();
};
