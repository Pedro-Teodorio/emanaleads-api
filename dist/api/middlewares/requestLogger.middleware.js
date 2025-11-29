"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = void 0;
const logger_1 = require("../../utils/logger");
const requestLogger = (req, res, next) => {
    const start = process.hrtime.bigint();
    logger_1.logger.info({ method: req.method, path: req.originalUrl }, 'request:start');
    res.on('finish', () => {
        const end = process.hrtime.bigint();
        const durationMs = Number(end - start) / 1000000;
        logger_1.logger.info({ method: req.method, path: req.originalUrl, statusCode: res.statusCode, durationMs: +durationMs.toFixed(2) }, 'request:finish');
    });
    next();
};
exports.requestLogger = requestLogger;
