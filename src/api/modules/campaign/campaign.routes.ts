import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validateRole } from '../../middlewares/validateRole.middleware';
import { validateRequest } from '../../middlewares/validateRequest';
import { campaignController } from './campaign.controller';
import { createCampaignSchema, listCampaignsQuerySchema, campaignIdParamsSchema, updateCampaignSchema } from './campaign.validation';

const router = Router({ mergeParams: true });

// Apenas ROOT e ADMIN (ownership validado no service)
router.post('/:projectId/campaigns', authMiddleware, validateRole(['ROOT', 'ADMIN']), validateRequest(createCampaignSchema), campaignController.create);
router.get('/:projectId/campaigns', authMiddleware, validateRole(['ROOT', 'ADMIN']), validateRequest(listCampaignsQuerySchema), campaignController.list);
router.get('/:projectId/campaigns/metrics', authMiddleware, validateRole(['ROOT', 'ADMIN']), campaignController.getMetrics);
router.get('/:projectId/campaigns/:campaignId', authMiddleware, validateRole(['ROOT', 'ADMIN']), validateRequest(campaignIdParamsSchema), campaignController.getById);
router.put('/:projectId/campaigns/:campaignId', authMiddleware, validateRole(['ROOT', 'ADMIN']), validateRequest(updateCampaignSchema), campaignController.update);
router.delete('/:projectId/campaigns/:campaignId', authMiddleware, validateRole(['ROOT', 'ADMIN']), validateRequest(campaignIdParamsSchema), campaignController.delete);

export const campaignRoutes = router;
