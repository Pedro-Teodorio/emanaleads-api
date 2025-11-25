"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectController = void 0;
const project_service_1 = require("./project.service");
class ProjectController {
    /**
     * [ROOT] Cria um novo projeto
     */
    async create(req, res, next) {
        try {
            const project = await project_service_1.projectService.create(req.body);
            res.status(201).json(project);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * [ROOT] Lista todos os projetos
     */
    async listProjectsAsRoot(req, res, next) {
        try {
            const page = Number.parseInt(req.query.page) || 1;
            const limit = Number.parseInt(req.query.limit) || 10;
            const search = req.query.search;
            const status = req.query.status;
            const projects = await project_service_1.projectService.listProjectsAsRoot(search, page, limit, status);
            res.status(200).json(projects);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * [ROOT] Lista os 5 projetos mais recentes
     */
    async listRecentProjects(req, res, next) {
        try {
            const projects = await project_service_1.projectService.listRecentProjects();
            res.status(200).json(projects);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * [ADMIN] Lista projetos administrados pelo usuário atual
     */
    async listProjectsAsAdmin(req, res, next) {
        try {
            const projects = await project_service_1.projectService.listProjectsAsAdmin(req.user.id);
            res.status(200).json(projects);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * [ROOT] Atualiza um projeto
     */
    async update(req, res, next) {
        try {
            const { projectId } = req.params;
            const updatedProject = await project_service_1.projectService.update(req.body, projectId);
            res.status(200).json(updatedProject);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * [ROOT] Deleta um projeto
     */
    async delete(req, res, next) {
        try {
            const { projectId } = req.params;
            await project_service_1.projectService.delete(projectId);
            res.status(204).send(); // 204 No Content
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * [ADMIN] Adiciona um PROJECT_USER a um projeto
     */
    async addMember(req, res, next) {
        try {
            const { projectId } = req.params;
            const { userId } = req.body;
            // Passamos o ID do admin logado (de req.user) para o service
            const member = await project_service_1.projectService.addMember({ projectId, userId }, req.user.id);
            res.status(201).json(member);
        }
        catch (error) {
            next(error);
        }
    }
    async listProjectUsers(req, res, next) {
        try {
            const { projectId } = req.params;
            const users = await project_service_1.projectService.listProjectUsers(projectId, req.user.id);
            res.status(200).json(users);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * [ADMIN] Cria novo PROJECT_USER e adiciona como membro
     */
    async createAndAddMember(req, res, next) {
        try {
            const { projectId } = req.params;
            const member = await project_service_1.projectService.createAndAddMember(projectId, req.body, req.user.id);
            res.status(201).json(member);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * [ADMIN] Remove um membro de um projeto
     */
    async removeMember(req, res, next) {
        try {
            const { projectId, memberId } = req.params;
            await project_service_1.projectService.removeMember(projectId, memberId, req.user.id);
            res.status(204).send(); // 204 No Content
        }
        catch (error) {
            next(error);
        }
    }
}
exports.projectController = new ProjectController();
