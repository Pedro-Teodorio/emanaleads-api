import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../../utils/ApiError';
import { logger } from '../../utils/logger';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
	const baseMeta = { method: req.method, path: req.originalUrl };

	if (err instanceof ApiError) {
		logger.warn({ ...baseMeta, statusCode: err.statusCode, code: err.code }, err.message);
		return res.status(err.statusCode).json({ code: err.code || 'ERROR', message: err.message });
	}

	logger.error({ ...baseMeta }, err.message || 'Unhandled error');
	return res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Erro interno do servidor.' });
};
