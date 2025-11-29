"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectService = void 0;
const client_1 = require("@prisma/client");
const ApiError_1 = require("../../../utils/ApiError");
const project_repository_1 = require("./project.repository");
const user_repository_1 = require("../user/user.repository");
const token_service_1 = require("../../../utils/token.service");
const email_service_1 = require("../../../utils/email.service");
const logger_1 = require("../../../utils/logger");
class ProjectService {
    constructor() {
        this.removeMember = async (projectId, memberId, currentAdminId) => {
            const project = await project_repository_1.projectRepository.findUnique({ where: { id: projectId } });
            if (!project) {
                throw new ApiError_1.ApiError(404, 'Projeto não encontrado.');
            }
            if (project.adminId !== currentAdminId) {
                throw new ApiError_1.ApiError(403, 'Acesso negado. Você não é administrador deste projeto.');
            }
            const memberAssociation = await project_repository_1.projectRepository.findMember({
                id: memberId,
                projectId: projectId,
            });
            if (!memberAssociation) {
                throw new ApiError_1.ApiError(404, 'Membro não encontrado neste projeto ou ID de membro inválido.');
            }
            await project_repository_1.projectRepository.removeMember(memberId);
            return { message: 'Membro removido do projeto com sucesso.' };
        };
    }
    async create(data) {
        const user = await user_repository_1.userRepository.findById(data.adminId);
        if (!user || user.role !== client_1.SystemRole.ADMIN) {
            throw new ApiError_1.ApiError(400, 'Usuário indicado como admin não é um ADMIN válido.');
        }
        return project_repository_1.projectRepository.create(data);
    }
    async listProjectsAsRoot(search, page = 1, limit = 10, statusFilter) {
        const where = {};
        if (search) {
            where.name = { contains: search, mode: 'insensitive' };
        }
        if (statusFilter) {
            where.status = statusFilter;
        }
        const [projects, total] = await Promise.all([project_repository_1.projectRepository.list(where, page, limit), project_repository_1.projectRepository.count(where)]);
        return {
            data: projects,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async listRecentProjects() {
        return project_repository_1.projectRepository.listRecent();
    }
    async listProjectsAsAdmin(adminId) {
        // Lista todos os projetos onde adminId === current user
        const where = { adminId };
        const [projects, total] = await Promise.all([project_repository_1.projectRepository.list(where, 1, 1000), project_repository_1.projectRepository.count(where)]);
        return { data: projects, meta: { total, page: 1, limit: 1000, totalPages: 1 } };
    }
    async update(data, projectId) {
        const project = await project_repository_1.projectRepository.findUnique({ where: { id: projectId } });
        if (!project) {
            throw new ApiError_1.ApiError(404, 'Projeto não encontrado.');
        }
        if (data.adminId) {
            const newAdmin = await user_repository_1.userRepository.findById(data.adminId);
            if (!newAdmin || newAdmin.role !== client_1.SystemRole.ADMIN) {
                throw new ApiError_1.ApiError(400, 'Usuário indicado como novo admin não é um ADMIN válido.');
            }
        }
        const dataToUpdate = {
            name: data.name,
            description: data.description,
            status: data.status,
        };
        if (data.adminId) {
            dataToUpdate.admin = {
                connect: { id: data.adminId },
            };
        }
        return project_repository_1.projectRepository.update(projectId, dataToUpdate);
    }
    async delete(projectId) {
        const project = await project_repository_1.projectRepository.findUnique({ where: { id: projectId } });
        if (!project) {
            throw new ApiError_1.ApiError(404, 'Projeto não encontrado.');
        }
        await project_repository_1.projectRepository.delete(projectId);
        return { message: 'Projeto deletado com sucesso.' };
    }
    async addMember(data, currentAdminId) {
        const project = await project_repository_1.projectRepository.findUnique({ where: { id: data.projectId } });
        if (!project) {
            throw new ApiError_1.ApiError(404, 'Projeto não encontrado.');
        }
        if (project.adminId !== currentAdminId) {
            throw new ApiError_1.ApiError(403, 'Acesso negado. Você não é o administrador deste projeto.');
        }
        const userToAdd = await user_repository_1.userRepository.findById(data.userId);
        if (!userToAdd) {
            throw new ApiError_1.ApiError(404, 'Usuário (membro) não encontrado.');
        }
        if (userToAdd.role !== client_1.SystemRole.PROJECT_USER) {
            throw new ApiError_1.ApiError(400, 'Apenas usuários com o papel PROJECT_USER podem ser adicionados como membros.');
        }
        return project_repository_1.projectRepository.addMember(data);
    }
    async listProjectUsers(projectId, currentAdminId) {
        const project = await project_repository_1.projectRepository.findUnique({
            where: { id: projectId },
            include: {
                admin: {
                    select: { id: true, name: true, email: true, role: true },
                },
            },
        });
        if (!project) {
            throw new ApiError_1.ApiError(404, 'Projeto não encontrado.');
        }
        if (project.adminId !== currentAdminId) {
            throw new ApiError_1.ApiError(403, 'Acesso negado. Você não é administrador deste projeto.');
        }
        const members = await project_repository_1.projectRepository.listMembers(projectId);
        return { admin: project.adminId, members };
    }
    async createAndAddMember(projectId, userData, currentAdminId) {
        const project = await project_repository_1.projectRepository.findUnique({ where: { id: projectId } });
        if (!project) {
            throw new ApiError_1.ApiError(404, 'Projeto não encontrado.');
        }
        if (project.adminId !== currentAdminId) {
            throw new ApiError_1.ApiError(403, 'Acesso negado. Você não é o administrador deste projeto.');
        }
        const existingUser = await user_repository_1.userRepository.findByEmail(userData.email);
        if (existingUser) {
            throw new ApiError_1.ApiError(400, 'Já existe um usuário com este email.');
        }
        // Se senha não fornecida, criar usuário com password null (requer ativação posterior)
        const newUser = await user_repository_1.userRepository.create({
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            password: userData.password ?? undefined,
            role: client_1.SystemRole.PROJECT_USER,
            status: 'ACTIVE',
        });
        const member = await project_repository_1.projectRepository.addMember({
            projectId,
            userId: newUser.id,
        });
        // Se senha não foi fornecida, enviar email de ativação
        if (userData.password) {
            try {
                await email_service_1.emailService.sendWelcomeEmail(newUser.email, newUser.name);
            }
            catch (error) {
                logger_1.logger.error({ err: error, email: newUser.email }, 'Erro ao enviar email de boas-vindas');
            }
        }
        else {
            try {
                const activationToken = await token_service_1.tokenService.createActivationToken(newUser.id);
                await email_service_1.emailService.sendActivationEmail(newUser.email, activationToken, newUser.name);
            }
            catch (error) {
                logger_1.logger.error({ err: error, email: newUser.email }, 'Erro ao enviar email de ativação');
            }
        }
        return member;
    }
    async getById(projectId, user) {
        const project = await project_repository_1.projectRepository.findUnique({
            where: { id: projectId },
            include: {
                admin: {
                    select: { id: true, name: true, email: true, role: true },
                },
            },
        });
        if (!project) {
            throw new ApiError_1.ApiError(404, 'Projeto não encontrado.');
        }
        // ROOT pode ver qualquer projeto, ADMIN só o próprio
        if (user.role !== client_1.SystemRole.ROOT && project.adminId !== user.id) {
            throw new ApiError_1.ApiError(403, 'Acesso negado.');
        }
        return project;
    }
    async getMetrics(projectId, user) {
        const project = await project_repository_1.projectRepository.findUnique({ where: { id: projectId } });
        if (!project) {
            throw new ApiError_1.ApiError(404, 'Projeto não encontrado.');
        }
        // ROOT pode ver qualquer projeto, ADMIN só o próprio
        if (user.role !== client_1.SystemRole.ROOT && project.adminId !== user.id) {
            throw new ApiError_1.ApiError(403, 'Acesso negado.');
        }
        // Buscar métricas do projeto
        const [totalMembers, totalCampaigns, totalLeads, leadsStatusDistribution, campaignsData] = await Promise.all([
            project_repository_1.projectRepository.countMembers(projectId),
            project_repository_1.projectRepository.countCampaigns(projectId),
            project_repository_1.projectRepository.countLeads(projectId),
            project_repository_1.projectRepository.getLeadsStatusDistribution(projectId),
            project_repository_1.projectRepository.getCampaignsOverview(projectId),
        ]);
        return {
            totalMembers,
            totalCampaigns,
            totalLeads,
            leadsStatusDistribution,
            campaignsOverview: campaignsData,
        };
    }
}
exports.projectService = new ProjectService();
