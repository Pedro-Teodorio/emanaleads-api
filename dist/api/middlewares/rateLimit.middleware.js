"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginRateLimit = void 0;
const ApiError_1 = require("../../utils/ApiError");
const env_1 = require("../../config/env");
const logger_1 = require("../../utils/logger");
class InMemoryRateLimiter {
    constructor(options) {
        this.store = new Map();
        this.options = options;
    }
    consume(key) {
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
class RedisRateLimiter {
    // Quando for implementado: passar cliente Redis no construtor
    constructor(options) {
        this.options = options;
    }
    consume(key) {
        // Stub apenas faz log e lança fallback (não deve ser usado em produção sem implementação real)
        logger_1.logger.warn({ key }, 'RedisRateLimiter stub utilizado - fallback para in-memory');
        return { allowed: true, remaining: this.options.maxRequests - 1, resetAt: Date.now() + this.options.windowMs };
    }
}
const maxRequests = env_1.env.RATE_LIMIT_MAX_REQUESTS;
const windowMinutes = env_1.env.RATE_LIMIT_WINDOW_MINUTES;
const options = { maxRequests, windowMs: windowMinutes * 60 * 1000 };
let limiter;
if (env_1.env.REDIS_URL) {
    logger_1.logger.info({ redisUrl: env_1.env.REDIS_URL }, 'Inicializando stub RedisRateLimiter (implementação real pendente)');
    limiter = new RedisRateLimiter(options);
}
else {
    limiter = new InMemoryRateLimiter(options);
}
const loginRateLimit = (req, res, next) => {
    const ip = req.ip || 'unknown';
    const email = typeof req.body?.email === 'string' ? req.body.email : 'no-email';
    const key = `login:${ip}:${email}`;
    const result = limiter.consume(key);
    if (!result.allowed) {
        const secondsToReset = Math.ceil((result.resetAt - Date.now()) / 1000);
        return next(new ApiError_1.ApiError(429, `Muitas tentativas. Tente novamente em ${secondsToReset}s`, 'RATE_LIMIT_EXCEEDED'));
    }
    next();
};
exports.loginRateLimit = loginRateLimit;
