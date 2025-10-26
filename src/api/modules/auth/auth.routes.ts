import { Router } from 'express';
import { authController } from './auth.controller';
import { validateRequest } from '../../middlewares/validateRequest';
import { loginSchema } from './auth.validation';

const router = Router();

router.post('/login', validateRequest(loginSchema), authController.login);
router.post('/logout', authController.logout);

export const authRoutes = router;
