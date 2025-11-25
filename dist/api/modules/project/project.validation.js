"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAndAddMemberSchema = exports.listProjectsQuerySchema = exports.removeMemberSchema = exports.listProjectUsersSchema = exports.addMemberSchema = exports.deleteProjectParamsSchema = exports.updateProjectSchema = exports.createProjectSchema = void 0;
const zod_1 = require("zod");
exports.createProjectSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(3, 'O nome do projeto deve ter no mínimo 3 caracteres'),
        description: zod_1.z.string().optional(),
        status: zod_1.z.enum(['PLANNING', 'ACTIVE', 'PAUSED', 'COMPLETED']),
        adminId: zod_1.z.uuid('Formato de UUID inválido para o ID do admin (adminId)'),
    }),
});
exports.updateProjectSchema = zod_1.z.object({
    params: zod_1.z.object({
        projectId: zod_1.z.uuid('Formato de UUID inválido para o ID do projeto (projectId)'),
    }),
    body: zod_1.z.object({
        name: zod_1.z.string().min(3, 'O nome do projeto deve ter no mínimo 3 caracteres').optional(),
        description: zod_1.z.string().optional(),
        status: zod_1.z.enum(['PLANNING', 'ACTIVE', 'PAUSED', 'COMPLETED']).optional(),
        adminId: zod_1.z.uuid('Formato de UUID inválido para o ID do admin (adminId)').optional(),
    }),
});
exports.deleteProjectParamsSchema = zod_1.z.object({
    params: zod_1.z.object({
        projectId: zod_1.z.uuid('Formato de UUID inválido para o ID do projeto (projectId)'),
    }),
});
// Schema para adicionar um PROJECT_USER a um projeto
exports.addMemberSchema = zod_1.z.object({
    params: zod_1.z.object({
        projectId: zod_1.z.uuid('Formato de UUID inválido para o ID do projeto (projectId)'),
    }),
    body: zod_1.z.object({
        projectId: zod_1.z.uuid('Formato de UUID inválido para o ID do projeto (projectId)'),
        userId: zod_1.z.uuid('Formato de UUID inválido para o ID do usuário (userId)'),
    }),
});
exports.listProjectUsersSchema = zod_1.z.object({
    params: zod_1.z.object({
        projectId: zod_1.z.uuid('Formato de UUID inválido para o projectId'),
    }),
});
// Schema para validar os params da remoção de membro
exports.removeMemberSchema = zod_1.z.object({
    params: zod_1.z.object({
        projectId: zod_1.z.uuid('Formato de UUID inválido para o projectId'),
        memberId: zod_1.z.uuid('Formato de UUID inválido para o memberId'),
    }),
});
exports.listProjectsQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string().regex(/^\d+$/, 'Page deve ser um número').optional().default('1'),
        limit: zod_1.z.string().regex(/^\d+$/, 'Limit deve ser um número').optional().default('10'),
        search: zod_1.z.string().optional(),
        status: zod_1.z.enum(['PLANNING', 'ACTIVE', 'PAUSED', 'COMPLETED']).optional(),
    }),
});
// Política de senha: mínimo 8 caracteres, ao menos 1 maiúscula, 1 minúscula, 1 dígito e 1 especial
const passwordPolicyRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
// Schema para criar novo PROJECT_USER e adicionar como membro
exports.createAndAddMemberSchema = zod_1.z.object({
    params: zod_1.z.object({
        projectId: zod_1.z.uuid('Formato de UUID inválido para o ID do projeto (projectId)'),
    }),
    body: zod_1.z.object({
        name: zod_1.z.string().min(3, 'O nome deve ter no mínimo 3 caracteres'),
        email: zod_1.z.string().email(),
        phone: zod_1.z.string().optional(),
        password: zod_1.z.string().regex(passwordPolicyRegex, 'Senha deve ter mínimo 8 caracteres e incluir maiúscula, minúscula, número e caractere especial').optional(),
    }),
});
