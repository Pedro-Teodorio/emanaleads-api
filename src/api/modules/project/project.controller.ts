import { Request, Response, NextFunction } from 'express';
import { projectService } from './project.service';

class ProjectController {
	/**
	 * [ROOT] Cria um novo projeto
	 */
	async create(req: Request, res: Response, next: NextFunction) {
		try {
			const project = await projectService.create(req.body);
			res.status(201).json(project);
		} catch (error) {
			next(error);
		}
	}

	/**
	 * [ROOT] Lista todos os projetos
	 */
	async listProjectsAsRoot(req: Request, res: Response, next: NextFunction) {
		try {
			const projects = await projectService.listProjectsAsRoot();
			res.status(200).json(projects);
		} catch (error) {
			next(error);
		}
	}

	/**
	 * [ROOT] Atualiza um projeto
	 */
	async update(req: Request, res: Response, next: NextFunction) {
		try {
			const { projectId } = req.params;
			const updatedProject = await projectService.update(req.body, projectId);
			res.status(200).json(updatedProject);
		} catch (error) {
			next(error);
		}
	}

	/**
	 * [ROOT] Deleta um projeto
	 */
	async delete(req: Request, res: Response, next: NextFunction) {
		try {
			const { projectId } = req.params;
			await projectService.delete(projectId);
			res.status(204).send(); // 204 No Content
		} catch (error) {
			next(error);
		}
	}

	/**
	 * [ROOT] Designa um ADMIN para um projeto
	 */
	async assignAdmin(req: Request, res: Response, next: NextFunction) {
		try {
			const assignment = await projectService.assignAdmin(req.body);
			res.status(201).json(assignment);
		} catch (error) {
			next(error);
		}
	}

	/**
	 * [ADMIN] Adiciona um PROJECT_USER a um projeto
	 */
	async addMember(req: Request, res: Response, next: NextFunction) {
		try {
			// Passamos o ID do admin logado (de req.user) para o service
			const member = await projectService.addMember(req.body, req.user!.id);
			res.status(201).json(member);
		} catch (error) {
			next(error);
		}
	}

	async listProjectUsers(req: Request, res: Response, next: NextFunction) {
		try {
			const { projectId } = req.params;
			const users = await projectService.listProjectUsers(projectId, req.user!.id);
			res.status(200).json(users);
		} catch (error) {
			next(error);
		}
	}

	/**
	 * [ADMIN] Remove um membro de um projeto
	 */
	async removeMember(req: Request, res: Response, next: NextFunction) {
		try {
			const { projectId, memberId } = req.params;
			await projectService.removeMember(projectId, memberId, req.user!.id);
			res.status(204).send(); // 204 No Content
		} catch (error) {
			next(error);
		}
	}
}

export const projectController = new ProjectController();
