import { Router } from 'express';
import { userRoutes } from './modules/user/user.routes';
import { authRoutes } from './modules/auth/auth.routes';

const router = Router();

router.use('/users', userRoutes);
router.use('/auth', authRoutes);

export const apiRoutes = router;
