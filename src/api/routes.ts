import { Router } from 'express';
import os from 'node:os';
import { userRoutes } from './modules/user/user.routes';
import { authRoutes } from './modules/auth/auth.routes';
import { projectRoutes } from './modules/project/project.routes';
import { leadRoutes } from './modules/lead/lead.routes';
import { campaignRoutes } from './modules/campaign/campaign.routes';
import { emailService } from '../utils/email.service';

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

// Health específico de email
router.get('/health/email', (req, res) => {
	res.json({ configured: emailService.isConfigured() });
});

router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/projects', campaignRoutes);
router.use('/leads', leadRoutes);

export const apiRoutes = router;
