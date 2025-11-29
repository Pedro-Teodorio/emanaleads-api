"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leadRoutes = void 0;
const express_1 = require("express");
const lead_controller_1 = require("./lead.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validateRole_middleware_1 = require("../../middlewares/validateRole.middleware");
const validateRequest_1 = require("../../middlewares/validateRequest");
const lead_validation_1 = require("./lead.validation");
const ApiError_1 = require("../../../utils/ApiError");
const router = (0, express_1.Router)();
// Rate limiter específico para exportação (5 requisições por hora)
const exportRateLimit = (() => {
    const store = new Map();
    const maxRequests = 5;
    const windowMs = 60 * 60 * 1000; // 1 hora
    return (req, res, next) => {
        const userId = req.user?.id || 'anonymous';
        const key = `export:${userId}`;
        const now = Date.now();
        const entry = store.get(key);
        if (!entry || entry.resetAt <= now) {
            store.set(key, { count: 1, resetAt: now + windowMs });
            return next();
        }
        if (entry.count >= maxRequests) {
            const secondsToReset = Math.ceil((entry.resetAt - now) / 1000);
            return next(new ApiError_1.ApiError(429, `Limite de 5 exportações por hora excedido. Tente novamente em ${secondsToReset}s`));
        }
        entry.count += 1;
        store.set(key, entry);
        next();
    };
})();
// Exportar leads em CSV (ANTES da rota /:leadId para evitar conflito)
router.get('/export', auth_middleware_1.authMiddleware, exportRateLimit, (0, validateRole_middleware_1.validateRole)(['ROOT', 'ADMIN', 'PROJECT_USER']), (0, validateRequest_1.validateRequest)(lead_validation_1.exportLeadsSchema), lead_controller_1.leadController.exportCSV);
// Criar lead (ROOT, ADMIN, PROJECT_USER - regras de ownership no service)
router.post('/', auth_middleware_1.authMiddleware, (0, validateRole_middleware_1.validateRole)(['ROOT', 'ADMIN', 'PROJECT_USER']), (0, validateRequest_1.validateRequest)(lead_validation_1.createLeadSchema), lead_controller_1.leadController.create);
// Listar leads (filtros + paginação) - todos os perfis autenticados possuem alguma visão
router.get('/', auth_middleware_1.authMiddleware, (0, validateRole_middleware_1.validateRole)(['ROOT', 'ADMIN', 'PROJECT_USER']), (0, validateRequest_1.validateRequest)(lead_validation_1.listLeadsQuerySchema), lead_controller_1.leadController.list);
// Obter lead por id
router.get('/:leadId', auth_middleware_1.authMiddleware, (0, validateRole_middleware_1.validateRole)(['ROOT', 'ADMIN', 'PROJECT_USER']), (0, validateRequest_1.validateRequest)(lead_validation_1.leadIdParamSchema), lead_controller_1.leadController.getById);
// Atualizar lead (dados gerais)
router.put('/:leadId', auth_middleware_1.authMiddleware, (0, validateRole_middleware_1.validateRole)(['ROOT', 'ADMIN', 'PROJECT_USER']), (0, validateRequest_1.validateRequest)(lead_validation_1.updateLeadSchema), lead_controller_1.leadController.update);
// Atualizar status do lead
router.patch('/:leadId/status', auth_middleware_1.authMiddleware, (0, validateRole_middleware_1.validateRole)(['ROOT', 'ADMIN', 'PROJECT_USER']), (0, validateRequest_1.validateRequest)(lead_validation_1.updateLeadStatusSchema), lead_controller_1.leadController.updateStatus);
// Deletar (soft delete) lead
router.delete('/:leadId', auth_middleware_1.authMiddleware, (0, validateRole_middleware_1.validateRole)(['ROOT', 'ADMIN', 'PROJECT_USER']), (0, validateRequest_1.validateRequest)(lead_validation_1.leadIdParamSchema), lead_controller_1.leadController.delete);
exports.leadRoutes = router;
