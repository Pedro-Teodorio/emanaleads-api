import { Prisma, SystemRole } from '@prisma/client';
import { ApiError } from '../../../utils/ApiError';
import { CreateUserData, UpdateUserData } from './user.validation';
import bcrypt from 'bcrypt';
import { userRepository } from './user.repository';
import { projectRepository } from '../project/project.repository';

class UserService {
	async create(data: CreateUserData) {
		const existingUser = await userRepository.findByEmail(data.email);

		if (existingUser) {
			throw new ApiError(400, 'Email já cadastrado');
		}

		const hashedPassword = await bcrypt.hash(data.password || '', 10);

		const user = await userRepository.create(data, hashedPassword);

		return user;
	}

	async getById(id: string) {
		const user = await userRepository.findById(id);

		if (!user) {
			throw new ApiError(404, 'Usuário não encontrado');
		}

		return user;
	}

	async listUsersAsRoot(search?: string, page: number = 1, limit: number = 10, roleFilter?: string, statusFilter?: string) {
		const where: Prisma.UserWhereInput = {};

		if (roleFilter) {
			where.role = roleFilter as SystemRole;
		} else {
			where.role = { in: [SystemRole.ROOT, SystemRole.ADMIN] };
		}

		if (statusFilter) {
			where.status = statusFilter as 'ACTIVE' | 'INACTIVE';
		}

		if (search) {
			where.name = { contains: search, mode: 'insensitive' };
		}

		const [users, total] = await Promise.all([userRepository.list(where, page, limit), userRepository.count(where)]);

		return {
			data: users,
			meta: {
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit),
			},
		};
	}

	async updateUserAsRoot(userId: string, data: UpdateUserData) {
		const targetUser = await this.getById(userId);

		const projectCount = await projectRepository.count({ adminId: userId });

		if (targetUser.role === SystemRole.PROJECT_USER) {
			throw new ApiError(403, 'Usuários ROOT não podem gerenciar membros de projeto diretamente.');
		}
		if (targetUser.role === SystemRole.ADMIN && projectCount > 0 && data.role === SystemRole.ROOT) {
			throw new ApiError(403, 'Administradores com projetos não podem ser promovidos para ROOT.');
		}

		const dataToUpdate: Prisma.UserUpdateInput = {};
		if (data.name) dataToUpdate.name = data.name;
		if (data.email) dataToUpdate.email = data.email;
		if (data.phone) dataToUpdate.phone = data.phone;
		if (data.status) dataToUpdate.status = data.status;
		if (data.role) dataToUpdate.role = data.role;

		const updatedUser = await userRepository.update(userId, dataToUpdate);

		return updatedUser;
	}

	async deleteUserAsRoot(userId: string) {
		const targetUser = await this.getById(userId);

		if (targetUser.role === SystemRole.PROJECT_USER) {
			throw new ApiError(403, 'Usuários ROOT não podem gerenciar membros de projeto diretamente.');
		}
		await userRepository.delete(userId);

		return { message: 'Usuário deletado com sucesso.' };
	}
}

export const userService = new UserService();
