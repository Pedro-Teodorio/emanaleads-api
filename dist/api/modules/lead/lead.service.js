"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leadService = void 0;
const lead_repository_1 = require("./lead.repository");
const prisma_1 = require("../../../config/prisma");
const ApiError_1 = require("../../../utils/ApiError");
const allowedTransitions = {
    PRIMEIRO_CONTATO: ['REUNIAO', 'PROPOSTA_ENVIADA'],
    REUNIAO: ['PROPOSTA_ENVIADA'],
    PROPOSTA_ENVIADA: ['ANALISE_PROPOSTA', 'FECHADO_PERDIDO'],
    ANALISE_PROPOSTA: ['FECHADO_GANHO', 'FECHADO_PERDIDO'],
    FECHADO_GANHO: [],
    FECHADO_PERDIDO: [],
};
class LeadService {
    async create(data, currentUser) {
        // Inferir projectId e assignedUserId do contexto se não fornecidos
        const projectId = await this.inferProjectId(data.projectId, currentUser);
        const assignedUserId = data.assignedUserId || currentUser.id;
        const project = await this.validateProjectAccess(projectId, currentUser);
        const duplicate = await lead_repository_1.leadRepository.findDuplicateInProject(project.id, data.email, data.phone);
        if (duplicate)
            throw new ApiError_1.ApiError(409, 'Lead duplicado no projeto');
        const lead = await lead_repository_1.leadRepository.create({ ...data, projectId, assignedUserId });
        await lead_repository_1.leadRepository.addHistory(lead.id, null, lead.status, currentUser.id, null);
        return lead;
    }
    async inferProjectId(providedProjectId, currentUser) {
        if (providedProjectId)
            return providedProjectId;
        if (currentUser.role === 'ROOT') {
            throw new ApiError_1.ApiError(400, 'ROOT deve especificar projectId explicitamente');
        }
        if (currentUser.role === 'ADMIN') {
            const adminProject = await prisma_1.prisma.project.findFirst({
                where: { adminId: currentUser.id, status: 'ACTIVE' },
                select: { id: true },
            });
            if (!adminProject)
                throw new ApiError_1.ApiError(422, 'Nenhum projeto ativo encontrado para este administrador');
            return adminProject.id;
        }
        if (currentUser.role === 'PROJECT_USER') {
            const membership = await prisma_1.prisma.projectMember.findFirst({
                where: { userId: currentUser.id, project: { status: 'ACTIVE' } },
                select: { projectId: true },
            });
            if (!membership)
                throw new ApiError_1.ApiError(422, 'Usuário não é membro de nenhum projeto ativo');
            return membership.projectId;
        }
        throw new ApiError_1.ApiError(403, 'Perfil não autorizado');
    }
    async validateProjectAccess(projectId, currentUser) {
        const project = await prisma_1.prisma.project.findUnique({ where: { id: projectId }, select: { id: true, status: true, adminId: true } });
        if (!project)
            throw new ApiError_1.ApiError(404, 'Projeto não encontrado');
        if (project.status !== 'ACTIVE')
            throw new ApiError_1.ApiError(422, 'Projeto não está ativo para criação de leads');
        if (currentUser.role === 'ADMIN' && project.adminId !== currentUser.id) {
            throw new ApiError_1.ApiError(403, 'Sem acesso a este projeto');
        }
        if (currentUser.role === 'PROJECT_USER') {
            const membership = await prisma_1.prisma.projectMember.findFirst({ where: { projectId: project.id, userId: currentUser.id } });
            if (!membership)
                throw new ApiError_1.ApiError(403, 'Usuário não é membro do projeto');
        }
        return project;
    }
    async getById(id, currentUser) {
        const lead = await lead_repository_1.leadRepository.findById(id);
        if (!lead)
            throw new ApiError_1.ApiError(404, 'Lead não encontrado');
        await this.assertCanAccessLead(lead, currentUser);
        return lead;
    }
    async list(filters, currentUser) {
        if (currentUser.role === 'PROJECT_USER') {
            // Aplicar filtro no banco para garantir paginação consistente
            const filtered = await lead_repository_1.leadRepository.list({ ...filters, assignedUserId: currentUser.id });
            return filtered;
        }
        return await lead_repository_1.leadRepository.list(filters);
    }
    async update(id, data, currentUser) {
        const existing = await lead_repository_1.leadRepository.findById(id);
        if (!existing)
            throw new ApiError_1.ApiError(404, 'Lead não encontrado');
        await this.assertCanAccessLead(existing, currentUser);
        if ((data.email || data.phone) && (data.email !== existing.email || data.phone !== existing.phone)) {
            const duplicate = await lead_repository_1.leadRepository.findDuplicateInProject(existing.projectId, data.email, data.phone);
            if (duplicate && duplicate.id !== existing.id)
                throw new ApiError_1.ApiError(409, 'Lead duplicado no projeto');
        }
        const updated = await lead_repository_1.leadRepository.update(id, data);
        return updated;
    }
    async updateStatus(id, data, currentUser) {
        const lead = await lead_repository_1.leadRepository.findById(id);
        if (!lead)
            throw new ApiError_1.ApiError(404, 'Lead não encontrado');
        await this.assertCanAccessLead(lead, currentUser);
        const from = lead.status;
        const to = data.toStatus;
        if (from === to)
            throw new ApiError_1.ApiError(400, 'Status já está definido');
        const allowed = allowedTransitions[from];
        if (!allowed.includes(to))
            throw new ApiError_1.ApiError(422, 'Transição de status inválida');
        const updated = await lead_repository_1.leadRepository.update(id, { status: to });
        await lead_repository_1.leadRepository.addHistory(id, from, to, currentUser.id, data.reason || null);
        return updated;
    }
    async delete(id, currentUser) {
        const lead = await lead_repository_1.leadRepository.findById(id);
        if (!lead)
            throw new ApiError_1.ApiError(404, 'Lead não encontrado');
        await this.assertCanAccessLead(lead, currentUser);
        await lead_repository_1.leadRepository.softDelete(id);
    }
    async assertCanAccessLead(lead, currentUser) {
        if (currentUser.role === 'ROOT')
            return;
        if (currentUser.role === 'ADMIN') {
            const project = await prisma_1.prisma.project.findUnique({ where: { id: lead.projectId }, select: { adminId: true } });
            if (!project || project.adminId !== currentUser.id)
                throw new ApiError_1.ApiError(403, 'Sem acesso ao lead');
            return;
        }
        if (currentUser.role === 'PROJECT_USER') {
            if (lead.assignedUserId !== currentUser.id)
                throw new ApiError_1.ApiError(403, 'Lead não atribuído ao usuário');
            return;
        }
        throw new ApiError_1.ApiError(403, 'Perfil não autorizado');
    }
    /**
     * Exporta leads em CSV aplicando mesmos filtros e RBAC do list
     * Limite soft de 50.000 registros
     */
    async exportCSV(filters, currentUser) {
        // Aplica mesma lógica de RBAC do método list
        const adjustedFilters = { ...filters };
        if (currentUser.role === 'PROJECT_USER') {
            adjustedFilters.assignedUserId = currentUser.id;
        }
        const leads = await lead_repository_1.leadRepository.listForExport(adjustedFilters);
        // Valida limite soft de 50.000 registros
        if (leads.length > 50000) {
            throw new ApiError_1.ApiError(400, 'Exportação limitada a 50.000 registros. Aplique filtros mais específicos para reduzir o volume.');
        }
        return leads;
    }
}
exports.leadService = new LeadService();
