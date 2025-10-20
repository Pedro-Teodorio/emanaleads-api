import { prisma } from '../../../config/prisma';
import { ApiError } from '../../../utils/ApiError';
import { createUserSchema } from './user.validation';
import bcrypt from 'bcrypt';
import { z } from 'zod';

type CreateUserData = z.infer<typeof createUserSchema>['body'];

const create = async (data: CreateUserData) => {
	const existingUser = await prisma.user.findUnique({
		where: { email: data.email },
	});

	if (existingUser) {
		throw new ApiError(400, 'Email já cadastrado');
	}

	const hashedPassword = await bcrypt.hash(data.password, 10);

	const user = await prisma.user.create({
		data: {
			...data,
			password: hashedPassword,
		},
		select: {
			id: true,
			name: true,
			email: true,
			role: true,
			createdAt: true,
			updatedAt: true,
		},
	});

	return user;
};

const getById = async (id: string) => {
	const user = await prisma.user.findUnique({
		where: { id },
		select: {
			id: true,
			name: true,
			email: true,
      role: true,
			createdAt: true,
			updatedAt: true,
		},
	});

	if (!user) {
		throw new ApiError(404, 'Usuário não encontrado');
	}

	return user;
};

export const userService = {
	create,
	getById,
};
