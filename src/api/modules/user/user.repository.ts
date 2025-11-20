import { Prisma } from '@prisma/client';
import { prisma } from '../../../config/prisma';
import { CreateUserData } from './user.validation';

class UserRepository {
	findByEmail(email: string) {
		return prisma.user.findUnique({
			where: { email },
		});
	}

	findById(id: string) {
		return prisma.user.findUnique({
			where: { id },
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				status: true,
				createdAt: true,
				updatedAt: true,
			},
		});
	}

	create(data: CreateUserData, hashedPassword?: string) {
		return prisma.user.create({
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
			},
		});
	}

	list(where: Prisma.UserWhereInput, page: number, limit: number) {
		const skip = (page - 1) * limit;
		return prisma.user.findMany({
			where,
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
			skip,
			take: limit,
		});
	}

	count(where: Prisma.UserWhereInput) {
		return prisma.user.count({ where });
	}

	update(userId: string, data: Prisma.UserUpdateInput) {
		return prisma.user.update({
			where: { id: userId },
			data,
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
	}

	delete(userId: string) {
		return prisma.user.delete({
			where: { id: userId },
		});
	}
}

export const userRepository = new UserRepository();
