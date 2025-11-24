import { Router, Request, Response, NextFunction } from 'express';
import { leadController } from './lead.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validateRole } from '../../middlewares/validateRole.middleware';
import { validateRequest } from '../../middlewares/validateRequest';
import { createLeadSchema, updateLeadSchema, updateLeadStatusSchema, listLeadsQuerySchema, leadIdParamSchema, exportLeadsSchema } from './lead.validation';
import { ApiError } from '../../../utils/ApiError';

const router = Router();

// Rate limiter específico para exportação (5 requisições por hora)
const exportRateLimit = (() => {
	const store = new Map<string, { count: number; resetAt: number }>();
	const maxRequests = 5;
	const windowMs = 60 * 60 * 1000; // 1 hora

	return (req: Request, res: Response, next: NextFunction) => {
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
			return next(new ApiError(429, `Limite de 5 exportações por hora excedido. Tente novamente em ${secondsToReset}s`));
		}

		entry.count += 1;
		store.set(key, entry);
		next();
	};
})();

// Exportar leads em CSV (ANTES da rota /:leadId para evitar conflito)
router.get('/export', authMiddleware, exportRateLimit, validateRole(['ROOT', 'ADMIN', 'PROJECT_USER']), validateRequest(exportLeadsSchema), leadController.exportCSV);

// Criar lead (ROOT, ADMIN, PROJECT_USER - regras de ownership no service)
router.post('/', authMiddleware, validateRole(['ROOT', 'ADMIN', 'PROJECT_USER']), validateRequest(createLeadSchema), leadController.create);

// Listar leads (filtros + paginação) - todos os perfis autenticados possuem alguma visão
router.get('/', authMiddleware, validateRole(['ROOT', 'ADMIN', 'PROJECT_USER']), validateRequest(listLeadsQuerySchema), leadController.list);

// Obter lead por id
router.get('/:leadId', authMiddleware, validateRole(['ROOT', 'ADMIN', 'PROJECT_USER']), validateRequest(leadIdParamSchema), leadController.getById);

// Atualizar lead (dados gerais)
router.put('/:leadId', authMiddleware, validateRole(['ROOT', 'ADMIN', 'PROJECT_USER']), validateRequest(updateLeadSchema), leadController.update);

// Atualizar status do lead
router.patch('/:leadId/status', authMiddleware, validateRole(['ROOT', 'ADMIN', 'PROJECT_USER']), validateRequest(updateLeadStatusSchema), leadController.updateStatus);

// Deletar (soft delete) lead
router.delete('/:leadId', authMiddleware, validateRole(['ROOT', 'ADMIN', 'PROJECT_USER']), validateRequest(leadIdParamSchema), leadController.delete);

export const leadRoutes = router;
