import express from 'express';
import { apiRoutes } from './api/routes';
import { errorHandler } from './api/middlewares/errorHandler';
import { requestLogger } from './api/middlewares/requestLogger.middleware';
import { metricsMiddleware } from './api/middlewares/metrics.middleware';
import { env } from './config/env';

const app = express();

const allowedOrigins = new Set(['https://emanaleads-app.vercel.app', 'http://localhost:3000', env.FRONTEND_URL].filter(Boolean));

// Middleware CORS
app.use((req, res, next) => {
	const origin = req.headers.origin;

	if (origin && allowedOrigins.has(origin)) {
		res.setHeader('Access-Control-Allow-Origin', origin);
		res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
		res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
		res.setHeader('Vary', 'Origin');
	}

	if (req.method === 'OPTIONS') {
		res.setHeader('Access-Control-Max-Age', '86400');
		return res.status(204).end();
	}

	next();
});

app.use(express.json());
app.use(metricsMiddleware);
app.use(requestLogger);

app.use('/api', apiRoutes);
app.use(errorHandler);

export { app };
export default app;
