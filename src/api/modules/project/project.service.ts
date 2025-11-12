import { ProjectStatus, SystemRole } from '@prisma/client';
import { prisma } from '../../../config/prisma';
import { ApiError } from '../../../utils/ApiError';
// Remova AssignAdminData da importação
import { AddMemberData, CreateProjectData, UpdateProjectData } from './project.validation';

class ProjectService {
	async create(data: CreateProjectData) {
		// A lógica transacional não é mais necessária para criar o admin

		// 1. Verificar se o usuário indicado é ADMIN
		const user = await prisma.user.findUnique({
			where: { id: data.adminId },
		});

		if (!user || user.role !== SystemRole.ADMIN) {
			throw new ApiError(400, 'Usuário indicado como admin não é um ADMIN válido.');
		}

		// 2. Criar o projeto e conectar o adminId diretamente
		const project = await prisma.project.create({
			data: {
				name: data.name,
				description: data.description,
				status: data.status || ProjectStatus.PLANNING,
				adminId: data.adminId, // Atribui o admin diretamente
			},
		});

		return project;
	}

	/**
	 * Lista todos os projetos de forma paginada.
	 * Regra: Somente ROOT pode chamar.
	 */
	async listProjectsAsRoot(search?: string, page: number = 1, limit: number = 10, statusFilter?: string) {
		const skip = (page - 1) * limit;

		const where: any = {};

		if (search) {
			where.name = { contains: search, mode: 'insensitive' };
		}

		// Filtrar por status se fornecido
		if (statusFilter) {
			where.status = statusFilter;
		}

		const [projects, total] = await Promise.all([
			prisma.project.findMany({
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
			}),
			prisma.project.count({ where }),
		]);

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

	/**
	 * Lista os 5 projetos mais recentes.
	 * Regra: Somente ROOT pode chamar.
	 */
	async listRecentProjects() {
		const projects = await prisma.project.findMany({
			orderBy: { createdAt: 'desc' },
			take: 5,
		});
		return projects;
	}

	/**
	 * Atualiza as informações de um projeto.
	 * Regra: Somente um ROOT pode chamar.
	 */
	async update(data: UpdateProjectData, projectId: string) {
		// 1. Verificar se o projeto existe
		const project = await prisma.project.findUnique({
			where: { id: projectId },
		});

		if (!project) {
			throw new ApiError(404, 'Projeto não encontrado.');
		}

		// 2. [NOVA LÓGICA] Se um novo adminId foi passado, valide-o
		if (data.adminId) {
			const newAdmin = await prisma.user.findUnique({
				where: { id: data.adminId },
			});
			if (!newAdmin || newAdmin.role !== SystemRole.ADMIN) {
				throw new ApiError(400, 'Usuário indicado como novo admin não é um ADMIN válido.');
			}
		}

		// 3. Atualizar as informações do projeto
		const updatedProject = await prisma.project.update({
			where: { id: projectId },
			data: {
				name: data.name,
				description: data.description,
				status: data.status as ProjectStatus,
				adminId: data.adminId, // Agora o update permite trocar o admin
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

	// --- Lógica para ADMIN ---

	/**
	 * Adiciona um usuário (PROJECT_USER) como membro de um projeto.
	 * Regra: Somente o ADMIN daquele projeto pode chamar.
	 */
	async addMember(data: AddMemberData, currentAdminId: string) {
		// 1. Verificar se o usuário autenticado (currentAdminId) é o admin DESTE projeto
		// A lógica de verificação mudou:
		const project = await prisma.project.findUnique({
			where: { id: data.projectId },
		});

		if (!project) {
			throw new ApiError(404, 'Projeto não encontrado.');
		}

		if (project.adminId !== currentAdminId) {
			throw new ApiError(403, 'Acesso negado. Você não é o administrador deste projeto.');
		}

		// O restante da lógica (passos 2 e 3) continua igual...
		const userToAdd = await prisma.user.findUnique({
			where: { id: data.userId },
		});

		if (!userToAdd) {
			throw new ApiError(404, 'Usuário (membro) não encontrado.');
		}

		if (userToAdd.role !== SystemRole.PROJECT_USER) {
			throw new ApiError(400, 'Apenas usuários com o papel PROJECT_USER podem ser adicionados como membros.');
		}

		const member = await prisma.projectMember.create({
			data: {
				userId: data.userId,
				projectId: data.projectId,
			},
			include: {
				user: { select: { id: true, name: true, email: true } },
				project: { select: { id: true, name: true } },
			},
		});

		return member;
	}

	/**
	 * Lista o admin e os membros de um projeto.
	 * Regra: Somente o ADMIN do projeto pode chamar.
	 */
	async listProjectUsers(projectId: string, currentAdminId: string) {
		// 1. Verificar se o usuário autenticado (currentAdminId) é o admin DESTE projeto
		const project = await prisma.project.findUnique({
			where: { id: projectId },
			include: {
				admin: {
					// Inclui o admin para verificação e retorno
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

		// 2. Buscar os Membros (ProjectUser) do projeto
		const members = await prisma.projectMember.findMany({
			where: { projectId: projectId },
			include: {
				user: {
					select: { id: true, name: true, email: true, role: true },
				},
			},
		});

		// 3. Retornar o admin (singular) e os membros
		return { admin: project.admin, members };
	}

	/**
	 * [ADMIN] Remove um MEMBRO (ProjectUser) de um projeto.
	 */
	removeMember = async (
		projectId: string,
		memberId: string, // ID do ProjectMember
		currentAdminId: string,
	) => {
		// 1. Verificar se o usuário autenticado (currentAdminId) é o admin DESTE projeto
		const project = await prisma.project.findUnique({
			where: { id: projectId },
		});

		if (!project) {
			throw new ApiError(404, 'Projeto não encontrado.');
		}

		if (project.adminId !== currentAdminId) {
			throw new ApiError(403, 'Acesso negado. Você não é administrador deste projeto.');
		}

		// O restante da lógica (passos 2 e 3) continua igual...
		const memberAssociation = await prisma.projectMember.findFirst({
			where: {
				id: memberId,
				projectId: projectId,
			},
		});

		if (!memberAssociation) {
			throw new ApiError(404, 'Membro não encontrado neste projeto ou ID de membro inválido.');
		}

		await prisma.projectMember.delete({
			where: {
				id: memberId,
			},
		});

		return { message: 'Membro removido do projeto com sucesso.' };
	};
}

export const projectService = new ProjectService();
