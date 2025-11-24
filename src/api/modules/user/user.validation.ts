import { z } from 'zod';

// Política de senha: mínimo 8 caracteres, ao menos 1 maiúscula, 1 minúscula, 1 dígito e 1 especial
const passwordPolicyRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const createUserSchema = z.object({
	body: z.object({
		name: z.string().min(3, 'O nome precisa ter no mínimo 3 caracteres'),
		email: z.email('Email inválido'),
		phone: z.string().optional(),
		password: z.string().regex(passwordPolicyRegex, 'Senha deve ter mínimo 8 caracteres e incluir maiúscula, minúscula, número e caractere especial').optional(),
		role: z.enum(['ROOT', 'ADMIN', 'PROJECT_USER']),
		status: z.enum(['ACTIVE', 'INACTIVE']),
	}),
});

export const updateUserSchema = z.object({
	params: z.object({
		id: z.uuid('Formato de UUID inválido para o ID do usuário (id)'),
	}),
	body: z.object({
		name: z.string().min(3, 'O nome precisa ter no mínimo 3 caracteres').optional(),
		email: z.email('Email inválido').optional(),
		phone: z.string().optional(),
		status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
		role: z.enum(['ROOT', 'ADMIN', 'PROJECT_USER']).optional(),
	}),
});

export const deleteUserParamsSchema = z.object({
	params: z.object({
		id: z.uuid('Formato de UUID inválido para o ID do usuário (id)'),
	}),
});

export const listUsersQuerySchema = z.object({
	query: z.object({
		page: z.string().regex(/^\d+$/, 'Page deve ser um número').optional().default('1'),
		limit: z.string().regex(/^\d+$/, 'Limit deve ser um número').optional().default('10'),
		search: z.string().optional(),
		role: z.enum(['ROOT', 'ADMIN', 'PROJECT_USER']).optional(),
		status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
	}),
});

export const resetPasswordSchema = z.object({
	params: z.object({
		id: z.uuid('Formato de UUID inválido para o ID do usuário (id)'),
	}),
	body: z.object({
		newPassword: z.string().regex(passwordPolicyRegex, 'Senha deve ter mínimo 8 caracteres e incluir maiúscula, minúscula, número e caractere especial'),
	}),
});

export type CreateUserData = z.infer<typeof createUserSchema>['body'];
export type UpdateUserData = z.infer<typeof updateUserSchema>['body'];
export type ListUsersQueryData = z.infer<typeof listUsersQuerySchema>['query'];
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>['body'];
