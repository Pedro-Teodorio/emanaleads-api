import { Request, Response, NextFunction } from 'express';
import { logger } from '../../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
	const start = process.hrtime.bigint();
	logger.info({ method: req.method, path: req.originalUrl }, 'request:start');

	res.on('finish', () => {
		const end = process.hrtime.bigint();
		const durationMs = Number(end - start) / 1_000_000;
		logger.info({ method: req.method, path: req.originalUrl, statusCode: res.statusCode, durationMs: +durationMs.toFixed(2) }, 'request:finish');
	});

	next();
};
