import { Router } from 'express';
import { authController } from './auth.controller';
import { validateRequest } from '../../middlewares/validateRequest';
import { activateAccountSchema, changePasswordSchema, forgotPasswordSchema, loginSchema, resetPasswordSchema } from './auth.validation';
import { loginRateLimit } from '../../middlewares/rateLimit.middleware';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

router.post('/login', loginRateLimit, validateRequest(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.post('/change-password', authMiddleware, validateRequest(changePasswordSchema), authController.changePassword);
router.post('/forgot-password', validateRequest(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password/:token', validateRequest(resetPasswordSchema), authController.resetPassword);
router.post('/activate/:token', validateRequest(activateAccountSchema), authController.activateAccount);

export const authRoutes = router;
