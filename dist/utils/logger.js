"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const pino_1 = __importDefault(require("pino"));
const env_1 = require("../config/env");
// Logger estruturado usando pino com nível configurável via LOG_LEVEL.
// Pode ser estendido posteriormente para enviar logs para destinos externos.
exports.logger = (0, pino_1.default)({
    level: env_1.env.LOG_LEVEL,
    base: { service: 'emanaleads-api' },
    transport: {
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'SYS:standard' },
    },
});
