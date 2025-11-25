"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    PORT: zod_1.z.coerce.number().default(3000),
    DATABASE_URL: zod_1.z.string(),
    JWT_SECRET: zod_1.z.string(),
    JWT_EXPIRES_IN: zod_1.z.string(),
    RATE_LIMIT_MAX_REQUESTS: zod_1.z.coerce.number().default(5),
    RATE_LIMIT_WINDOW_MINUTES: zod_1.z.coerce.number().default(15),
    LOG_LEVEL: zod_1.z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
    REDIS_URL: zod_1.z.string().optional(),
    // Email (Nodemailer/Mailtrap)
    SMTP_USER: zod_1.z.string().optional(),
    SMTP_PASS: zod_1.z.string().optional(),
    APP_URL: zod_1.z.string().optional(),
});
exports.env = envSchema.parse(process.env);
// Validações adicionais em produção para garantir configuração de email
if (process.env.NODE_ENV === 'production') {
    if (!exports.env.SMTP_USER || !exports.env.SMTP_PASS || !exports.env.APP_URL) {
        // Usar console.error para evitar dependência circular com logger
        console.error('[env] Configuração de email incompleta em produção. Verifique SMTP_USER, SMTP_PASS e APP_URL.');
    }
}
