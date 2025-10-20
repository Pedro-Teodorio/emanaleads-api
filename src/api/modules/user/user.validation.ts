import { z } from 'zod';

export const createUserSchema = z.object({
	body: z.object({
		name: z.string().min(3, 'O nome precisa ter no mínimo 3 caracteres'),
		email: z.email('Email inválido'),
		password: z.string().min(6, 'A senha precisa ter no mínimo 6 caracteres'),
		role: z.enum(['user', 'admin', 'manager', 'root']),
	}),
});
