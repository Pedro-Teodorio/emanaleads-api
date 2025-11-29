"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.listUsersQuerySchema = exports.deleteUserParamsSchema = exports.updateUserSchema = exports.createUserSchema = void 0;
const zod_1 = require("zod");
// Política de senha: mínimo 8 caracteres, ao menos 1 maiúscula, 1 minúscula, 1 dígito e 1 especial
const passwordPolicyRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
exports.createUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(3, 'O nome precisa ter no mínimo 3 caracteres'),
        email: zod_1.z.email('Email inválido'),
        phone: zod_1.z.string().optional(),
        password: zod_1.z.string().regex(passwordPolicyRegex, 'Senha deve ter mínimo 8 caracteres e incluir maiúscula, minúscula, número e caractere especial').optional(),
        role: zod_1.z.enum(['ROOT', 'ADMIN', 'PROJECT_USER']),
        status: zod_1.z.enum(['ACTIVE', 'INACTIVE']),
    }),
});
exports.updateUserSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.uuid('Formato de UUID inválido para o ID do usuário (id)'),
    }),
    body: zod_1.z.object({
        name: zod_1.z.string().min(3, 'O nome precisa ter no mínimo 3 caracteres').optional(),
        email: zod_1.z.email('Email inválido').optional(),
        phone: zod_1.z.string().optional(),
        status: zod_1.z.enum(['ACTIVE', 'INACTIVE']).optional(),
        role: zod_1.z.enum(['ROOT', 'ADMIN', 'PROJECT_USER']).optional(),
    }),
});
exports.deleteUserParamsSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.uuid('Formato de UUID inválido para o ID do usuário (id)'),
    }),
});
exports.listUsersQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string().regex(/^\d+$/, 'Page deve ser um número').optional().default('1'),
        limit: zod_1.z.string().regex(/^\d+$/, 'Limit deve ser um número').optional().default('10'),
        search: zod_1.z.string().optional(),
        role: zod_1.z.enum(['ROOT', 'ADMIN', 'PROJECT_USER']).optional(),
        status: zod_1.z.enum(['ACTIVE', 'INACTIVE']).optional(),
    }),
});
exports.resetPasswordSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.uuid('Formato de UUID inválido para o ID do usuário (id)'),
    }),
    body: zod_1.z.object({
        newPassword: zod_1.z.string().regex(passwordPolicyRegex, 'Senha deve ter mínimo 8 caracteres e incluir maiúscula, minúscula, número e caractere especial'),
    }),
});
