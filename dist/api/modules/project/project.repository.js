"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectRepository = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../../../config/prisma");
class ProjectRepository {
    create(data) {
        return prisma_1.prisma.project.create({
            data: {
                name: data.name,
                description: data.description,
                status: data.status || client_1.ProjectStatus.PLANNING,
                adminId: data.adminId,
            },
        });
    }
    async findUnique(args) {
        return prisma_1.prisma.project.findUnique(args);
    }
    list(where, page, limit) {
        const skip = (page - 1) * limit;
        return prisma_1.prisma.project.findMany({
            where,
            include: {
                admin: {
                    select: { id: true, name: true, email: true },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            skip,
            take: limit,
        });
    }
    listRecent() {
        return prisma_1.prisma.project.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                description: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                adminId: true,
            },
            take: 5,
        });
    }
    count(where) {
        return prisma_1.prisma.project.count({ where });
    }
    update(projectId, data) {
        return prisma_1.prisma.project.update({
            where: { id: projectId },
            data,
        });
    }
    delete(projectId) {
        return prisma_1.prisma.project.delete({
            where: { id: projectId },
        });
    }
    addMember(data) {
        return prisma_1.prisma.projectMember.create({
            data: {
                userId: data.userId,
                projectId: data.projectId,
            },
            include: {
                user: { select: { id: true, name: true, email: true } },
                project: { select: { id: true, name: true } },
            },
        });
    }
    listMembers(projectId) {
        return prisma_1.prisma.projectMember.findMany({
            where: { projectId: projectId },
            include: {
                user: {
                    select: { id: true, name: true, email: true, role: true },
                },
            },
        });
    }
    findMember(where) {
        return prisma_1.prisma.projectMember.findFirst({ where });
    }
    removeMember(memberId) {
        return prisma_1.prisma.projectMember.delete({
            where: {
                id: memberId,
            },
        });
    }
}
exports.projectRepository = new ProjectRepository();
