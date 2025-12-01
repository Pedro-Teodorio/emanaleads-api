import express from 'express';
import cookieParser from 'cookie-parser';
import { apiRoutes } from './api/routes';
import { errorHandler } from './api/middlewares/errorHandler';
import { requestLogger } from './api/middlewares/requestLogger.middleware';
import { metricsMiddleware } from './api/middlewares/metrics.middleware';
import { env } from './config/env';

const app = express();

const allowedOrigins = ['https://emanaleads-app.vercel.app', 'http://localhost:3000', env.FRONTEND_URL].filter(Boolean);

// Middleware CORS - DEVE ser o primeiro middleware
app.use((req, res, next) => {
	const origin = req.headers.origin;

	// Sempre permitir a origem se estiver na lista
	if (origin && allowedOrigins.includes(origin)) {
		res.setHeader('Access-Control-Allow-Origin', origin);
	}

	// SEMPRE enviar Access-Control-Allow-Credentials
	res.setHeader('Access-Control-Allow-Credentials', 'true');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
	res.setHeader('Access-Control-Expose-Headers', 'Set-Cookie');

	// Log para debug (remover depois)
	if (env.NODE_ENV === 'production') {
		console.log('[CORS] Origin:', origin, '| Allowed:', allowedOrigins.includes(origin || ''));
	}

	// Responder OPTIONS imediatamente
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
