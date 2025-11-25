"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.campaignRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validateRole_middleware_1 = require("../../middlewares/validateRole.middleware");
const validateRequest_1 = require("../../middlewares/validateRequest");
const campaign_controller_1 = require("./campaign.controller");
const campaign_validation_1 = require("./campaign.validation");
const router = (0, express_1.Router)({ mergeParams: true });
// Apenas ROOT e ADMIN (ownership validado no service)
router.post('/:projectId/campaigns', auth_middleware_1.authMiddleware, (0, validateRole_middleware_1.validateRole)(['ROOT', 'ADMIN']), (0, validateRequest_1.validateRequest)(campaign_validation_1.createCampaignSchema), campaign_controller_1.campaignController.create);
router.get('/:projectId/campaigns', auth_middleware_1.authMiddleware, (0, validateRole_middleware_1.validateRole)(['ROOT', 'ADMIN']), (0, validateRequest_1.validateRequest)(campaign_validation_1.listCampaignsQuerySchema), campaign_controller_1.campaignController.list);
router.get('/:projectId/campaigns/:campaignId', auth_middleware_1.authMiddleware, (0, validateRole_middleware_1.validateRole)(['ROOT', 'ADMIN']), (0, validateRequest_1.validateRequest)(campaign_validation_1.campaignIdParamsSchema), campaign_controller_1.campaignController.getById);
router.put('/:projectId/campaigns/:campaignId', auth_middleware_1.authMiddleware, (0, validateRole_middleware_1.validateRole)(['ROOT', 'ADMIN']), (0, validateRequest_1.validateRequest)(campaign_validation_1.updateCampaignSchema), campaign_controller_1.campaignController.update);
router.delete('/:projectId/campaigns/:campaignId', auth_middleware_1.authMiddleware, (0, validateRole_middleware_1.validateRole)(['ROOT', 'ADMIN']), (0, validateRequest_1.validateRequest)(campaign_validation_1.campaignIdParamsSchema), campaign_controller_1.campaignController.delete);
exports.campaignRoutes = router;
