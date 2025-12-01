import express from 'express';
import cookieParser from 'cookie-parser';
import { apiRoutes } from './api/routes';
import { errorHandler } from './api/middlewares/errorHandler';
import { requestLogger } from './api/middlewares/requestLogger.middleware';
import { metricsMiddleware } from './api/middlewares/metrics.middleware';
import { env } from './config/env';

const app = express();

const allowedOrigins = [env.FRONTEND_URL || 'https://emanaleads-app.vercel.app', 'http://localhost:3000'];

// Middleware manual de CORS para garantir headers corretos na Vercel
app.use((req, res, next) => {
	const origin = req.headers.origin;
	if (origin && allowedOrigins.includes(origin)) {
		res.setHeader('Access-Control-Allow-Origin', origin);
		res.setHeader('Access-Control-Allow-Credentials', 'true');
		res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
		res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
	}

	// Responder imediatamente a requisições OPTIONS (preflight)
	if (req.method === 'OPTIONS') {
		return res.status(200).end();
	}

	next();
});

app.use(express.json());
app.use(cookieParser());
app.use(metricsMiddleware);
app.use(requestLogger);

app.use('/api', apiRoutes);
app.use(errorHandler);

export { app };
export default app;
