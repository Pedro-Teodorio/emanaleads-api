import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { apiRoutes } from './api/routes';
import { errorHandler } from './api/middlewares/errorHandler';
import { requestLogger } from './api/middlewares/requestLogger.middleware';
import { metricsMiddleware } from './api/middlewares/metrics.middleware';
import { env } from './config/env';

const app = express();

const allowedOrigins = [env.FRONTEND_URL || 'https://emanaleads-app.vercel.app', 'http://localhost:3000'];

const corsOptions = {
	origin: allowedOrigins,
	credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(metricsMiddleware);
app.use(requestLogger);

app.use('/api', apiRoutes);
app.use(errorHandler);

export { app };
export default app;
