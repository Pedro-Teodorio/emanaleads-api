import express from 'express';
import cors from 'cors';
import { apiRoutes } from './api/routes';
import { errorHandler } from './api/middlewares/errorHandler';

const app = express();

// Middlewares essenciais
app.use(cors()); // Permite requisições de diferentes origens
app.use(express.json()); // Habilita o parsing de JSON no corpo das requisições

// Rotas da API
app.use('/api', apiRoutes);

// Middleware de tratamento de erros (DEVE ser o último)
app.use(errorHandler);

export { app };
