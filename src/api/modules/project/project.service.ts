import {  ProjectStatus, SystemRole } from '@prisma/client';
import { prisma } from '../../../config/prisma';
import { ApiError } from '../../../utils/ApiError';
import { AddMemberData, AssignAdminData, CreateProjectData, UpdateProjectData } from './project.validation';

class ProjectService {
	async create(data: CreateProjectData) {
		return await prisma.$transaction(async (tx) => {
			// 1. Criar o projeto
			const project = await tx.project.create({
				data: {
					name: data.name,
					description: data.description,
					status: data.status || ProjectStatus.PLANNING,
				},
			});

			// 2. Verificar se o usuário indicado é ADMIN
			const user = await tx.user.findUnique({
				where: { id: data.adminId },
			});

			if (!user || user.role !== SystemRole.ADMIN) {
				throw new ApiError(400, 'Usuário indicado como admin não é um ADMIN válido.');
			}

			// 3. Criar a relação ProjectAdmin
			await tx.projectAdmin.create({
				data: {
					userId: data.adminId,
					projectId: project.id,
				},
			});

			return project;
		});
	}

	/**
	 * Lista todos os projetos.
	 * Regra: Somente ROOT pode chamar.
	 */
	async listProjectsAsRoot() {
		const projects = await prisma.project.findMany({
			include: {
				admins: true,
			},
		});
		return projects;
	}

	/**
	 * Atualiza as informações de um projeto.
	 * Regra: Somente um ROOT daquele projeto pode chamar.
	 */
	async update(data: UpdateProjectData, projectId: string) {
		// 1. Verificar se o projeto existe
		const project = await prisma.project.findUnique({
			where: { id: projectId },
		});

		if (!project) {
			throw new ApiError(404, 'Projeto não encontrado.');
		}

		// 2. Atualizar as informações do projeto
		const updatedProject = await prisma.project.update({
			where: { id: projectId },
			data: {
				name: data.name,
				description: data.description,
				status: data.status as ProjectStatus,
			},
		});

		return updatedProject;
	}

	async delete(projectId: string) {
		const project = await prisma.project.findUnique({
			where: { id: projectId },
		});

		if (!project) {
			throw new ApiError(404, 'Projeto não encontrado.');
		}

		// 2. Deletar o projeto
		await prisma.project.delete({
			where: { id: projectId },
		});

		return { message: 'Projeto deletado com sucesso.' };
	}

	/**
	 * Designa um usuário (ADMIN) para administrar um projeto.
	 * Regra: Somente ROOT pode chamar.
	 * Regra: O usuário sendo designado DEVE ter a role ADMIN.
	 */
	async assignAdmin(data: AssignAdminData) {
		// 1. Verificar se o usuário a ser designado é um ADMIN
		const userToAssign = await prisma.user.findUnique({
			where: { id: data.userId },
		});

		if (!userToAssign) {
			throw new ApiError(404, 'Usuário (ADMIN) não encontrado.');
		}

		// Regra de Negócio: Somente usuários com role ADMIN podem ser designados
		if (userToAssign.role !== SystemRole.ADMIN) {
			throw new ApiError(400, 'Este usuário não é um ADMIN e não pode ser designado para administrar projetos.');
		}

		// 2. Verificar se o projeto existe
		const project = await prisma.project.findUnique({
			where: { id: data.projectId },
		});

		if (!project) {
			throw new ApiError(404, 'Projeto não encontrado.');
		}

		// 3. Criar a ligação na tabela ProjectAdmin
		const assignment = await prisma.projectAdmin.create({
			data: {
				userId: data.userId,
				projectId: data.projectId,
			},
			include: {
				user: {
					select: { id: true, name: true, email: true },
				},
				project: {
					select: { id: true, name: true },
				},
			},
		});

		return assignment;
	}

	// --- Lógica para ADMIN ---

	/**
	 * Adiciona um usuário (PROJECT_USER) como membro de um projeto.
	 * Regra: Somente um ADMIN daquele projeto pode chamar.
	 * Regra: O usuário sendo adicionado DEVE ser um PROJECT_USER.
	 */
	async addMember(data: AddMemberData, currentAdminId: string) {
		// 1. Verificar se o usuário autenticado (currentAdminId) é admin DESTE projeto
		const isAdminOfProject = await prisma.projectAdmin.findUnique({
			where: {
				userId_projectId: {
					userId: currentAdminId,
					projectId: data.projectId,
				},
			},
		});

		if (!isAdminOfProject) {
			throw new ApiError(403, 'Acesso negado. Você não é administrador deste projeto.');
		}

		// 2. Verificar o usuário a ser adicionado (Regra: "ADMIN não pode ser PROJECT_USER")
		const userToAdd = await prisma.user.findUnique({
			where: { id: data.userId },
		});

		if (!userToAdd) {
			throw new ApiError(404, 'Usuário (membro) não encontrado.');
		}

		// Regra de Negócio Crítica:
		// "Um usuário com role=ADMIN não pode ser adicionado como um PROJECT_USER"
		// Nós garantimos isso verificando se o usuário a ser adicionado tem a role correta.
		if (userToAdd.role !== SystemRole.PROJECT_USER) {
			throw new ApiError(400, 'Apenas usuários com o papel PROJECT_USER podem ser adicionados como membros.');
		}

		// 3. Adicionar o usuário à tabela ProjectMember
		const member = await prisma.projectMember.create({
			data: {
				userId: data.userId,
				projectId: data.projectId,
			},
			include: {
				user: {
					select: { id: true, name: true, email: true },
				},
				project: {
					select: { id: true, name: true },
				},
			},
		});

		return member;
	}

	/**
	 * Lista todos os administradores e membros de um projeto.
	 * Regra: Somente um ADMIN do projeto pode chamar.
	 */
	async listProjectUsers(projectId: string, currentAdminId: string) {
		// 1. Verificar se o usuário autenticado (currentAdminId) é admin DESTE projeto
		const isAdminOfProject = await prisma.projectAdmin.findUnique({
			where: {
				userId_projectId: {
					userId: currentAdminId,
					projectId: projectId,
				},
			},
		});

		if (!isAdminOfProject) {
			throw new ApiError(403, 'Acesso negado. Você não é administrador deste projeto.');
		}

		// 2. Buscar os Admins do projeto
		const admins = await prisma.projectAdmin.findMany({
			where: { projectId: projectId },
			include: {
				user: {
					select: { id: true, name: true, email: true, role: true },
				},
			},
		});

		// 3. Buscar os Membros (ProjectUser) do projeto
		const members = await prisma.projectMember.findMany({
			where: { projectId: projectId },
			include: {
				user: {
					select: { id: true, name: true, email: true, role: true },
				},
			},
		});

		return { admins, members };
	}

	/**
	 * [ADMIN] Remove um MEMBRO (ProjectUser) de um projeto.
	 * Note: O memberId é o ID da *relação* (ProjectMember), não o ID do usuário.
	 */
	removeMember = async (
		projectId: string,
		memberId: string, // ID do ProjectMember
		currentAdminId: string,
	) => {
		// 1. Verificar se o usuário autenticado (currentAdminId) é admin DESTE projeto
		const isAdminOfProject = await prisma.projectAdmin.findUnique({
			where: {
				userId_projectId: {
					userId: currentAdminId,
					projectId: projectId,
				},
			},
		});

		if (!isAdminOfProject) {
			throw new ApiError(403, 'Acesso negado. Você não é administrador deste projeto.');
		}

		// 2. Verificar se a associação 'memberId' pertence a este 'projectId'
		const memberAssociation = await prisma.projectMember.findFirst({
			where: {
				id: memberId,
				projectId: projectId,
			},
		});

		if (!memberAssociation) {
			throw new ApiError(404, 'Membro não encontrado neste projeto ou ID de membro inválido.');
		}

		// 3. Remover a associação
		await prisma.projectMember.delete({
			where: {
				id: memberId,
			},
		});

		return { message: 'Membro removido do projeto com sucesso.' };
	};
}

export const projectService = new ProjectService();
