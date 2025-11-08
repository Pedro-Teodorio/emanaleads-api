import { SystemRole } from '@prisma/client';
import { prisma } from '../../../config/prisma';
import { ApiError } from '../../../utils/ApiError';
import { CreateUserData, UpdateUserData } from './user.validation';
import bcrypt from 'bcrypt';

class UserService {
	async create(data: CreateUserData) {
		const existingUser = await prisma.user.findUnique({
			where: { email: data.email },
		});

		if (existingUser) {
			throw new ApiError(400, 'Email já cadastrado');
		}

		const hashedPassword = await bcrypt.hash(data.password || '', 10);

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
	}

	getById = async (id: string) => {
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

	async listUsersAsRoot() {
		const users = await prisma.user.findMany({
			where: {
				role: {
					in: [SystemRole.ROOT, SystemRole.ADMIN],
				},
			},
			select: {
				id: true,
				name: true,
				email: true,
				phone: true,
				role: true,
				status: true,
				createdAt: true,
			},
			orderBy: {
				name: 'asc',
			},
		});
		return users;
	}

	async updateUserAsRoot(userId: string, data: UpdateUserData) {
		// 1. Buscar o usuário alvo
		const targetUser = await this.getById(userId);

		// 2. Aplicar regra de negócio
		if (targetUser.role === SystemRole.PROJECT_USER) {
			throw new ApiError(403, 'Usuários ROOT não podem gerenciar membros de projeto diretamente.');
		}

		// 3. Preparar dados (ex: hash de senha se ela foi fornecida)
		const dataToUpdate: { name?: string; email?: string; phone?: string; status?: 'ACTIVE' | 'INACTIVE'; role?: SystemRole } = {
			name: data.name,
			email: data.email,
			phone: data.phone,
			status: data.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
			role: data.role,
		};

		// 4. Atualizar o usuário
		const updatedUser = await prisma.user.update({
			where: { id: userId },
			data: dataToUpdate,
			select: {
				id: true,
				name: true,
				email: true,
				phone: true,
				status: true,
				role: true,
				updatedAt: true,
			},
		});

		return updatedUser;
	}

	async deleteUserAsRoot(userId: string) {
		const targetUser = await this.getById(userId);

		if (targetUser.role === SystemRole.PROJECT_USER) {
			throw new ApiError(403, 'Usuários ROOT não podem gerenciar membros de projeto diretamente.');
		}
		await prisma.user.delete({
			where: { id: userId },
		});

		return { message: 'Usuário deletado com sucesso.' };
	}
}

export const userService = new UserService();
