"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = void 0;
const prisma_1 = require("../../../config/prisma");
class UserRepository {
    findByEmail(email) {
        return prisma_1.prisma.user.findUnique({
            where: { email },
        });
    }
    findById(id) {
        return prisma_1.prisma.user.findUnique({
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
    create(data, hashedPassword) {
        return prisma_1.prisma.user.create({
            data: {
                ...data,
                password: hashedPassword ?? undefined,
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
    list(where, page, limit) {
        const skip = (page - 1) * limit;
        return prisma_1.prisma.user.findMany({
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
    count(where) {
        return prisma_1.prisma.user.count({ where });
    }
    update(userId, data) {
        return prisma_1.prisma.user.update({
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
    delete(userId) {
        return prisma_1.prisma.user.delete({
            where: { id: userId },
        });
    }
    updatePassword(userId, hashedPassword) {
        return prisma_1.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
    }
}
exports.userRepository = new UserRepository();
