import { z } from 'zod';

import { LeadStatus } from '@prisma/client';

// Requer pelo menos um contato (email ou phone)
const contatoRefinement = (data: { email?: string | null; phone?: string | null }) => {
	return !!(data.email || data.phone);
};

export const createLeadSchema = z.object({
	body: z
		.object({
			name: z.string().min(1, 'Nome é obrigatório'),
			email: z.email('Email inválido').optional(),
			phone: z.string().optional(),
			position: z.string().optional(), // cargo
			requestType: z.string().optional(), // tipo de serviço solicitado
			projectId: z.uuid('Formato inválido para projectId').optional(), // inferido se omitido
			assignedUserId: z.uuid('Formato inválido para assignedUserId').optional(), // inferido se omitido
			status: z.enum(LeadStatus).optional(), // opcional, default via modelo
		})
		.superRefine((val, ctx) => {
			if (!contatoRefinement(val)) {
				ctx.addIssue({
					code: 'custom',
					message: 'Informe pelo menos um contato: email ou telefone',
					path: ['email'],
				});
			}
		}),
});

export const updateLeadSchema = z.object({
	params: z.object({
		leadId: z.uuid('Formato inválido para leadId'),
	}),
	body: z
		.object({
			name: z.string().min(1, 'Nome é obrigatório').optional(),
			email: z.email('Email inválido').optional().nullable(),
			phone: z.string().optional().nullable(),
			position: z.string().optional().nullable(),
			requestType: z.string().optional().nullable(),
			assignedUserId: z.uuid('Formato inválido para assignedUserId').optional().nullable(),
			status: z.enum(LeadStatus).optional(),
		})
		.superRefine((val, ctx) => {
			if (val.email === null) val.email = undefined as any;
			if (val.phone === null) val.phone = undefined as any;
			if (!val.email && !val.phone && (val.email !== undefined || val.phone !== undefined)) {
				ctx.addIssue({
					code: 'custom',
					message: 'Informe pelo menos um contato válido',
					path: ['email'],
				});
			}
		}),
});

export const updateLeadStatusSchema = z.object({
	params: z.object({
		leadId: z.uuid('Formato inválido para leadId'),
	}),
	body: z
		.object({
			toStatus: z.enum(LeadStatus),
			reason: z
				.string()
				.min(2, 'Motivo deve ter ao menos 2 caracteres')
				.optional()
				.refine(
					(val) => {
						if (!val) return true;
						return val.trim().length >= 2;
					},
					{ message: 'Motivo inválido' },
				),
		})
		.superRefine((val, ctx) => {
			if ((val.toStatus === 'FECHADO_PERDIDO' || val.toStatus === 'FECHADO_GANHO') && !val.reason) {
				ctx.addIssue({
					code: 'custom',
					message: 'Motivo é obrigatório para status final',
					path: ['reason'],
				});
			}
		}),
});

export const listLeadsQuerySchema = z.object({
	query: z.object({
		page: z.string().regex(/^\d+$/, 'page deve ser numérico').optional().default('1'),
		limit: z.string().regex(/^\d+$/, 'limit deve ser numérico').optional().default('10'),
		projectId: z.uuid('Formato inválido para projectId').optional(),
		status: z.enum(LeadStatus).optional(),
		search: z.string().optional(), // nome / email / telefone
		dateFrom: z.iso.datetime({ offset: true }).optional(),
		dateTo: z.iso.datetime({ offset: true }).optional(),
		orderBy: z.enum(['createdAt', 'updatedAt', 'name']).optional().default('createdAt'),
		order: z.enum(['asc', 'desc']).optional().default('desc'),
		assignedUserId: z.uuid('Formato inválido para assignedUserId').optional(),
		// Permitir múltiplos status separados por vírgula: status=REUNIAO,PROPOSTA_ENVIADA
		statuses: z.string().optional(),
		requestType: z.string().optional(),
		position: z.string().optional(),
		// Filtrar por leads sem assignedUserId (unassigned=true)
		unassigned: z.enum(['true', 'false']).optional(),
	}),
});

// Params simples para rotas que só precisam de leadId
export const leadIdParamSchema = z.object({
	params: z.object({
		leadId: z.uuid('Formato inválido para leadId'),
	}),
});

// Poderemos futuramente expor histórico dedicado
export const leadHistoryParamsSchema = leadIdParamSchema;

// Schema de exportação: reutiliza filtros de listagem mas sem paginação
export const exportLeadsSchema = z.object({
	query: listLeadsQuerySchema.shape.query.omit({ page: true, limit: true }),
});

export type CreateLeadData = z.infer<typeof createLeadSchema>['body'];
export type UpdateLeadData = z.infer<typeof updateLeadSchema>['body'];
export type UpdateLeadStatusData = z.infer<typeof updateLeadStatusSchema>['body'];
export type ListLeadsQueryData = z.infer<typeof listLeadsQuerySchema>['query'];
export type ExportLeadsQueryData = z.infer<typeof exportLeadsSchema>['query'];
export type LeadIdParams = z.infer<typeof leadIdParamSchema>['params'];
