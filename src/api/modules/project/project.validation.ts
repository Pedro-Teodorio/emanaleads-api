import { z } from 'zod';

export const createProjectSchema = z.object({
	body: z.object({
		name: z.string().min(3, 'O nome do projeto deve ter no mínimo 3 caracteres'),
		description: z.string().optional(),
		status: z.enum(['PLANNING', 'ACTIVE', 'PAUSED', 'COMPLETED']),
		adminId: z.uuid('Formato de UUID inválido para o ID do admin (adminId)'),
	}),
});

export const updateProjectSchema = z.object({
	params: z.object({
		projectId: z.uuid('Formato de UUID inválido para o ID do projeto (projectId)'),
	}),
	body: z.object({
		name: z.string().min(3, 'O nome do projeto deve ter no mínimo 3 caracteres').optional(),
		description: z.string().optional(),
		status: z.enum(['PLANNING', 'ACTIVE', 'PAUSED', 'COMPLETED']).optional(),
		adminId: z.uuid('Formato de UUID inválido para o ID do admin (adminId)').optional(),
	}),
});

export const deleteProjectParamsSchema = z.object({
	params: z.object({
		projectId: z.uuid('Formato de UUID inválido para o ID do projeto (projectId)'),
	}),
});

// Schema para adicionar um PROJECT_USER a um projeto
export const addMemberSchema = z.object({
	params: z.object({
		projectId: z.uuid('Formato de UUID inválido para o ID do projeto (projectId)'),
	}),
	body: z.object({
		projectId: z.uuid('Formato de UUID inválido para o ID do projeto (projectId)'),
		userId: z.uuid('Formato de UUID inválido para o ID do usuário (userId)'),
	}),
});

export const listProjectUsersSchema = z.object({
	params: z.object({
		projectId: z.uuid('Formato de UUID inválido para o projectId'),
	}),
});

// Schema para validar os params da remoção de membro
export const removeMemberSchema = z.object({
	params: z.object({
		projectId: z.uuid('Formato de UUID inválido para o projectId'),
		memberId: z.uuid('Formato de UUID inválido para o memberId'),
	}),
});

export const listProjectsQuerySchema = z.object({
	query: z.object({
		page: z.string().regex(/^\d+$/, 'Page deve ser um número').optional().default('1'),
		limit: z.string().regex(/^\d+$/, 'Limit deve ser um número').optional().default('10'),
		search: z.string().optional(),
		status: z.enum(['PLANNING', 'ACTIVE', 'PAUSED', 'COMPLETED']).optional(),
	}),
});

// Política de senha: mínimo 8 caracteres, ao menos 1 maiúscula, 1 minúscula, 1 dígito e 1 especial
const passwordPolicyRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

// Schema para criar novo PROJECT_USER e adicionar como membro
export const createAndAddMemberSchema = z.object({
	params: z.object({
		projectId: z.uuid('Formato de UUID inválido para o ID do projeto (projectId)'),
	}),
	body: z.object({
		name: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres'),
		email: z.string().email(),
		phone: z.string().optional(),
		password: z.string().regex(passwordPolicyRegex, 'Senha deve ter mínimo 8 caracteres e incluir maiúscula, minúscula, número e caractere especial').optional(),
	}),
});

export type CreateProjectData = z.infer<typeof createProjectSchema>['body'];
export type UpdateProjectData = z.infer<typeof updateProjectSchema>['body'];
export type AddMemberData = z.infer<typeof addMemberSchema>['body'];
export type CreateAndAddMemberData = z.infer<typeof createAndAddMemberSchema>['body'];
export type ListProjectsQueryData = z.infer<typeof listProjectsQuerySchema>['query'];
