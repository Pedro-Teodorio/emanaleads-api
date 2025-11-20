import { Request, Response, NextFunction } from 'express';
import { logger } from '../../utils/logger';

interface MetricsSnapshot {
	totalRequests: number;
	totalErrors: number;
	avgLatencyMs: number;
}

const state = {
	totalRequests: 0,
	totalErrors: 0,
	totalLatencyMs: 0,
};

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
	const start = process.hrtime.bigint();
	state.totalRequests += 1;

	res.on('finish', () => {
		const end = process.hrtime.bigint();
		const durationMs = Number(end - start) / 1_000_000;
		state.totalLatencyMs += durationMs;

		if (res.statusCode >= 500) {
			state.totalErrors += 1;
		}
	});

	next();
};

// Log periódico a cada 60s
setInterval(() => {
	const avgLatencyMs = state.totalRequests ? state.totalLatencyMs / state.totalRequests : 0;
	const snapshot: MetricsSnapshot = {
		totalRequests: state.totalRequests,
		totalErrors: state.totalErrors,
		avgLatencyMs: +avgLatencyMs.toFixed(2),
	};
	logger.info(snapshot, 'metrics:snapshot');
}, 60_000).unref();

export function getMetricsSnapshot(): MetricsSnapshot {
	const avgLatencyMs = state.totalRequests ? state.totalLatencyMs / state.totalRequests : 0;
	return {
		totalRequests: state.totalRequests,
		totalErrors: state.totalErrors,
		avgLatencyMs: +avgLatencyMs.toFixed(2),
	};
}
