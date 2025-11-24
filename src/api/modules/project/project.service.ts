import { Prisma, ProjectStatus, SystemRole } from '@prisma/client';
import { ApiError } from '../../../utils/ApiError';
import { AddMemberData, CreateProjectData, UpdateProjectData } from './project.validation';
import { projectRepository } from './project.repository';
import { userRepository } from '../user/user.repository';
import { tokenService } from '../../../utils/token.service';
import { emailService } from '../../../utils/email.service';
import { logger } from '../../../utils/logger';

class ProjectService {
	async create(data: CreateProjectData) {
		const user = await userRepository.findById(data.adminId);

		if (!user || user.role !== SystemRole.ADMIN) {
			throw new ApiError(400, 'Usuário indicado como admin não é um ADMIN válido.');
		}

		return projectRepository.create(data);
	}

	async listProjectsAsRoot(search?: string, page: number = 1, limit: number = 10, statusFilter?: string) {
		const where: Prisma.ProjectWhereInput = {};

		if (search) {
			where.name = { contains: search, mode: 'insensitive' };
		}

		if (statusFilter) {
			where.status = statusFilter as ProjectStatus;
		}

		const [projects, total] = await Promise.all([projectRepository.list(where, page, limit), projectRepository.count(where)]);

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
		return projectRepository.listRecent();
	}

	async listProjectsAsAdmin(adminId: string) {
		// Lista todos os projetos onde adminId === current user
		const where: Prisma.ProjectWhereInput = { adminId };
		const [projects, total] = await Promise.all([projectRepository.list(where, 1, 1000), projectRepository.count(where)]);
		return { data: projects, meta: { total, page: 1, limit: 1000, totalPages: 1 } };
	}

	async update(data: UpdateProjectData, projectId: string) {
		const project = await projectRepository.findUnique({ where: { id: projectId } });

		if (!project) {
			throw new ApiError(404, 'Projeto não encontrado.');
		}

		if (data.adminId) {
			const newAdmin = await userRepository.findById(data.adminId);
			if (!newAdmin || newAdmin.role !== SystemRole.ADMIN) {
				throw new ApiError(400, 'Usuário indicado como novo admin não é um ADMIN válido.');
			}
		}

		const dataToUpdate: Prisma.ProjectUpdateInput = {
			name: data.name,
			description: data.description,
			status: data.status,
		};

		if (data.adminId) {
			dataToUpdate.admin = {
				connect: { id: data.adminId },
			};
		}

		return projectRepository.update(projectId, dataToUpdate);
	}

	async delete(projectId: string) {
		const project = await projectRepository.findUnique({ where: { id: projectId } });

		if (!project) {
			throw new ApiError(404, 'Projeto não encontrado.');
		}

		await projectRepository.delete(projectId);

		return { message: 'Projeto deletado com sucesso.' };
	}

	async addMember(data: AddMemberData, currentAdminId: string) {
		const project = await projectRepository.findUnique({ where: { id: data.projectId } });

		if (!project) {
			throw new ApiError(404, 'Projeto não encontrado.');
		}

		if (project.adminId !== currentAdminId) {
			throw new ApiError(403, 'Acesso negado. Você não é o administrador deste projeto.');
		}

		const userToAdd = await userRepository.findById(data.userId);

		if (!userToAdd) {
			throw new ApiError(404, 'Usuário (membro) não encontrado.');
		}

		if (userToAdd.role !== SystemRole.PROJECT_USER) {
			throw new ApiError(400, 'Apenas usuários com o papel PROJECT_USER podem ser adicionados como membros.');
		}

		return projectRepository.addMember(data);
	}

	async listProjectUsers(projectId: string, currentAdminId: string) {
		const project = await projectRepository.findUnique({
			where: { id: projectId },
			include: {
				admin: {
					select: { id: true, name: true, email: true, role: true },
				},
			},
		});

		if (!project) {
			throw new ApiError(404, 'Projeto não encontrado.');
		}

		if (project.adminId !== currentAdminId) {
			throw new ApiError(403, 'Acesso negado. Você não é administrador deste projeto.');
		}

		const members = await projectRepository.listMembers(projectId);

		return { admin: project.adminId, members };
	}

	async createAndAddMember(projectId: string, userData: { name: string; email: string; phone?: string; password?: string }, currentAdminId: string) {
		const project = await projectRepository.findUnique({ where: { id: projectId } });

		if (!project) {
			throw new ApiError(404, 'Projeto não encontrado.');
		}

		if (project.adminId !== currentAdminId) {
			throw new ApiError(403, 'Acesso negado. Você não é o administrador deste projeto.');
		}

		const existingUser = await userRepository.findByEmail(userData.email);
		if (existingUser) {
			throw new ApiError(400, 'Já existe um usuário com este email.');
		}

		// Se senha não fornecida, criar usuário com password null (requer ativação posterior)
		const newUser = await userRepository.create({
			name: userData.name,
			email: userData.email,
			phone: userData.phone,
			password: userData.password ?? undefined,
			role: SystemRole.PROJECT_USER,
			status: 'ACTIVE',
		});

		const member = await projectRepository.addMember({
			projectId,
			userId: newUser.id,
		});

		// Se senha não foi fornecida, enviar email de ativação
		if (userData.password) {
			try {
				await emailService.sendWelcomeEmail(newUser.email, newUser.name);
			} catch (error) {
				logger.error({ err: error, email: newUser.email }, 'Erro ao enviar email de boas-vindas');
			}
		} else {
			try {
				const activationToken = await tokenService.createActivationToken(newUser.id);
				await emailService.sendActivationEmail(newUser.email, activationToken, newUser.name);
			} catch (error) {
				logger.error({ err: error, email: newUser.email }, 'Erro ao enviar email de ativação');
			}
		}

		return member;
	}

	removeMember = async (projectId: string, memberId: string, currentAdminId: string) => {
		const project = await projectRepository.findUnique({ where: { id: projectId } });

		if (!project) {
			throw new ApiError(404, 'Projeto não encontrado.');
		}

		if (project.adminId !== currentAdminId) {
			throw new ApiError(403, 'Acesso negado. Você não é administrador deste projeto.');
		}

		const memberAssociation = await projectRepository.findMember({
			id: memberId,
			projectId: projectId,
		});

		if (!memberAssociation) {
			throw new ApiError(404, 'Membro não encontrado neste projeto ou ID de membro inválido.');
		}

		await projectRepository.removeMember(memberId);

		return { message: 'Membro removido do projeto com sucesso.' };
	};
}

export const projectService = new ProjectService();
