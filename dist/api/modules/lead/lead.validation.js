"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportLeadsSchema = exports.leadHistoryParamsSchema = exports.leadIdParamSchema = exports.listLeadsQuerySchema = exports.updateLeadStatusSchema = exports.updateLeadSchema = exports.createLeadSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
// Requer pelo menos um contato (email ou phone)
const contatoRefinement = (data) => {
    return !!(data.email || data.phone);
};
exports.createLeadSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        name: zod_1.z.string().min(1, 'Nome é obrigatório'),
        email: zod_1.z.email('Email inválido').optional(),
        phone: zod_1.z.string().optional(),
        position: zod_1.z.string().optional(), // cargo
        requestType: zod_1.z.string().optional(), // tipo de serviço solicitado
        projectId: zod_1.z.uuid('Formato inválido para projectId').optional(), // inferido se omitido
        assignedUserId: zod_1.z.uuid('Formato inválido para assignedUserId').optional(), // inferido se omitido
        status: zod_1.z.enum(client_1.LeadStatus).optional(), // opcional, default via modelo
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
exports.updateLeadSchema = zod_1.z.object({
    params: zod_1.z.object({
        leadId: zod_1.z.uuid('Formato inválido para leadId'),
    }),
    body: zod_1.z
        .object({
        name: zod_1.z.string().min(1, 'Nome é obrigatório').optional(),
        email: zod_1.z.email('Email inválido').optional().nullable(),
        phone: zod_1.z.string().optional().nullable(),
        position: zod_1.z.string().optional().nullable(),
        requestType: zod_1.z.string().optional().nullable(),
        assignedUserId: zod_1.z.uuid('Formato inválido para assignedUserId').optional().nullable(),
        status: zod_1.z.enum(client_1.LeadStatus).optional(),
    })
        .superRefine((val, ctx) => {
        if (val.email === null)
            val.email = undefined;
        if (val.phone === null)
            val.phone = undefined;
        if (!val.email && !val.phone && (val.email !== undefined || val.phone !== undefined)) {
            ctx.addIssue({
                code: 'custom',
                message: 'Informe pelo menos um contato válido',
                path: ['email'],
            });
        }
    }),
});
exports.updateLeadStatusSchema = zod_1.z.object({
    params: zod_1.z.object({
        leadId: zod_1.z.uuid('Formato inválido para leadId'),
    }),
    body: zod_1.z
        .object({
        toStatus: zod_1.z.enum(client_1.LeadStatus),
        reason: zod_1.z
            .string()
            .min(2, 'Motivo deve ter ao menos 2 caracteres')
            .optional()
            .refine((val) => {
            if (!val)
                return true;
            return val.trim().length >= 2;
        }, { message: 'Motivo inválido' }),
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
exports.listLeadsQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string().regex(/^\d+$/, 'page deve ser numérico').optional().default('1'),
        limit: zod_1.z.string().regex(/^\d+$/, 'limit deve ser numérico').optional().default('10'),
        projectId: zod_1.z.uuid('Formato inválido para projectId').optional(),
        status: zod_1.z.enum(client_1.LeadStatus).optional(),
        search: zod_1.z.string().optional(), // nome / email / telefone
        dateFrom: zod_1.z.iso.datetime({ offset: true }).optional(),
        dateTo: zod_1.z.iso.datetime({ offset: true }).optional(),
        orderBy: zod_1.z.enum(['createdAt', 'updatedAt', 'name']).optional().default('createdAt'),
        order: zod_1.z.enum(['asc', 'desc']).optional().default('desc'),
        assignedUserId: zod_1.z.uuid('Formato inválido para assignedUserId').optional(),
        // Permitir múltiplos status separados por vírgula: status=REUNIAO,PROPOSTA_ENVIADA
        statuses: zod_1.z.string().optional(),
        requestType: zod_1.z.string().optional(),
        position: zod_1.z.string().optional(),
        // Filtrar por leads sem assignedUserId (unassigned=true)
        unassigned: zod_1.z.enum(['true', 'false']).optional(),
    }),
});
// Params simples para rotas que só precisam de leadId
exports.leadIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        leadId: zod_1.z.uuid('Formato inválido para leadId'),
    }),
});
// Poderemos futuramente expor histórico dedicado
exports.leadHistoryParamsSchema = exports.leadIdParamSchema;
// Schema de exportação: reutiliza filtros de listagem mas sem paginação
exports.exportLeadsSchema = zod_1.z.object({
    query: exports.listLeadsQuerySchema.shape.query.omit({ page: true, limit: true }),
});
