"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRoutes = void 0;
const express_1 = require("express");
const node_os_1 = __importDefault(require("node:os"));
const user_routes_1 = require("./modules/user/user.routes");
const auth_routes_1 = require("./modules/auth/auth.routes");
const project_routes_1 = require("./modules/project/project.routes");
const lead_routes_1 = require("./modules/lead/lead.routes");
const campaign_routes_1 = require("./modules/campaign/campaign.routes");
const email_service_1 = require("../utils/email.service");
const router = (0, express_1.Router)();
// Health check público
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: Date.now(),
        memory: process.memoryUsage().rss,
        pid: process.pid,
        host: node_os_1.default.hostname(),
    });
});
// Health específico de email
router.get('/health/email', (req, res) => {
    res.json({ configured: email_service_1.emailService.isConfigured() });
});
router.use('/users', user_routes_1.userRoutes);
router.use('/auth', auth_routes_1.authRoutes);
router.use('/projects', project_routes_1.projectRoutes);
router.use('/projects', campaign_routes_1.campaignRoutes);
router.use('/leads', lead_routes_1.leadRoutes);
exports.apiRoutes = router;
