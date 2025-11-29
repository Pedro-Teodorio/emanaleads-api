import { z } from 'zod';

// Política: mínimo 8 caracteres, ao menos 1 maiúscula, 1 minúscula, 1 dígito e 1 especial
const passwordPolicyRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const loginSchema = z.object({
	body: z.object({
		email: z.email('Email inválido'),
		password: z.string().regex(passwordPolicyRegex, 'Senha deve ter mínimo 8 caracteres e incluir maiúscula, minúscula, número e caractere especial'),
	}),
});

export const changePasswordSchema = z.object({
	body: z.object({
		currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
		newPassword: z.string().regex(passwordPolicyRegex, 'Senha deve ter mínimo 8 caracteres e incluir maiúscula, minúscula, número e caractere especial'),
	}),
});

export const forgotPasswordSchema = z.object({
	body: z.object({
		email: z.email('Email inválido'),
	}),
});

export const resetPasswordSchema = z.object({
	params: z.object({
		token: z.string().min(1, 'Token é obrigatório'),
	}),
	body: z.object({
		newPassword: z.string().regex(passwordPolicyRegex, 'Senha deve ter mínimo 8 caracteres e incluir maiúscula, minúscula, número e caractere especial'),
	}),
});

export const activateAccountSchema = z.object({
	params: z.object({
		token: z.string().min(1, 'Token é obrigatório'),
	}),
	body: z.object({
		password: z.string().regex(passwordPolicyRegex, 'Senha deve ter mínimo 8 caracteres e incluir maiúscula, minúscula, número e caractere especial'),
	}),
});

export const passwordPolicy = passwordPolicyRegex;
