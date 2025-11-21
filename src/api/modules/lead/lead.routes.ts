import { Router } from 'express';
import { leadController } from './lead.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validateRole } from '../../middlewares/validateRole.middleware';
import { validateRequest } from '../../middlewares/validateRequest';
import { createLeadSchema, updateLeadSchema, updateLeadStatusSchema, listLeadsQuerySchema, leadIdParamSchema } from './lead.validation';

const router = Router();

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
