import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser'; 
import { apiRoutes } from './api/routes';
import { errorHandler } from './api/middlewares/errorHandler';

const app = express();

const corsOptions = {
	origin: 'http://localhost:3000',
	credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

app.use('/api', apiRoutes);
app.use(errorHandler);

export { app };
