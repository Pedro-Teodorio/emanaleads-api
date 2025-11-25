"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordPolicy = exports.activateAccountSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.changePasswordSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
// Política: mínimo 8 caracteres, ao menos 1 maiúscula, 1 minúscula, 1 dígito e 1 especial
const passwordPolicyRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.email('Email inválido'),
        password: zod_1.z.string().regex(passwordPolicyRegex, 'Senha deve ter mínimo 8 caracteres e incluir maiúscula, minúscula, número e caractere especial'),
    }),
});
exports.changePasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        currentPassword: zod_1.z.string().min(1, 'Senha atual é obrigatória'),
        newPassword: zod_1.z.string().regex(passwordPolicyRegex, 'Senha deve ter mínimo 8 caracteres e incluir maiúscula, minúscula, número e caractere especial'),
    }),
});
exports.forgotPasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.email('Email inválido'),
    }),
});
exports.resetPasswordSchema = zod_1.z.object({
    params: zod_1.z.object({
        token: zod_1.z.string().min(1, 'Token é obrigatório'),
    }),
    body: zod_1.z.object({
        newPassword: zod_1.z.string().regex(passwordPolicyRegex, 'Senha deve ter mínimo 8 caracteres e incluir maiúscula, minúscula, número e caractere especial'),
    }),
});
exports.activateAccountSchema = zod_1.z.object({
    params: zod_1.z.object({
        token: zod_1.z.string().min(1, 'Token é obrigatório'),
    }),
    body: zod_1.z.object({
        password: zod_1.z.string().regex(passwordPolicyRegex, 'Senha deve ter mínimo 8 caracteres e incluir maiúscula, minúscula, número e caractere especial'),
    }),
});
exports.passwordPolicy = passwordPolicyRegex;
