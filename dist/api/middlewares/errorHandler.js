"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const ApiError_1 = require("../../utils/ApiError");
const logger_1 = require("../../utils/logger");
const errorHandler = (err, req, res, next) => {
    const baseMeta = { method: req.method, path: req.originalUrl };
    if (err instanceof ApiError_1.ApiError) {
        logger_1.logger.warn({ ...baseMeta, statusCode: err.statusCode, code: err.code }, err.message);
        return res.status(err.statusCode).json({ code: err.code || 'ERROR', message: err.message });
    }
    logger_1.logger.error({ ...baseMeta }, err.message || 'Unhandled error');
    return res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Erro interno do servidor.' });
};
exports.errorHandler = errorHandler;
