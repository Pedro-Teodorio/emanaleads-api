import { z } from 'zod';

export const createProjectSchema = z.object({
	body: z.object({
		name: z.string().min(3, 'O nome do projeto deve ter no mínimo 3 caracteres'),
	}),
});

export const assignAdminSchema = z.object({
	body: z.object({
		userId: z.uuid('Formato de UUID inválido para o ID do usuário (userId)'),
		projectId: z.uuid('Formato de UUID inválido para o ID do projeto (projectId)'),
	}),
});

// Schema para adicionar um PROJECT_USER a um projeto
export const addMemberSchema = z.object({
	body: z.object({
		userId: z.uuid('Formato de UUID inválido para o ID do usuário (userId)'),
		projectId: z.uuid('Formato de UUID inválido para o ID do projeto (projectId)'),
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

export type CreateProjectData = z.infer<typeof createProjectSchema>['body'];
export type AssignAdminData = z.infer<typeof assignAdminSchema>['body'];
export type AddMemberData = z.infer<typeof addMemberSchema>['body'];
