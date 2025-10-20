import { Router } from 'express';
import { userController } from './user.controller';
import { validateRequest } from '../../middlewares/validateRequest';
import { createUserSchema } from './user.validation';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

router.post(
  '/',
  validateRequest(createUserSchema), // Middleware de validação
  userController.create
);

router.get('/me', authMiddleware, userController.getMe);

// Outras rotas (GET, PUT, DELETE) viriam aqui...

export const userRoutes = router;
