import { Router } from 'express';
import os from 'node:os';
import { userRoutes } from './modules/user/user.routes';
import { authRoutes } from './modules/auth/auth.routes';
import { projectRoutes } from './modules/project/project.routes';

const router = Router();

// Health check público
router.get('/health', (req, res) => {
	res.json({
		status: 'ok',
		uptime: process.uptime(),
		timestamp: Date.now(),
		memory: process.memoryUsage().rss,
		pid: process.pid,
		host: os.hostname(),
	});
});

router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);

export const apiRoutes = router;
