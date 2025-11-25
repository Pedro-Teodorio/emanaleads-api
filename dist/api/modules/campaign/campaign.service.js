"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.campaignService = void 0;
const ApiError_1 = require("../../../utils/ApiError");
const campaign_repository_1 = require("./campaign.repository");
const prisma_1 = require("../../../config/prisma");
class CampaignService {
    async assertProjectOwnership(projectId, currentUser) {
        if (currentUser.role === 'ROOT')
            return;
        if (currentUser.role !== 'ADMIN')
            throw new ApiError_1.ApiError(403, 'Acesso negado.');
        const project = await prisma_1.prisma.project.findUnique({ where: { id: projectId }, select: { adminId: true } });
        if (!project)
            throw new ApiError_1.ApiError(404, 'Projeto não encontrado.');
        if (project.adminId !== currentUser.id)
            throw new ApiError_1.ApiError(403, 'Acesso negado. Você não é o administrador deste projeto.');
    }
    async create(projectId, data, currentUser) {
        await this.assertProjectOwnership(projectId, currentUser);
        return campaign_repository_1.campaignRepository.create(projectId, data);
    }
    async update(projectId, campaignId, data, currentUser) {
        await this.assertProjectOwnership(projectId, currentUser);
        const existing = await campaign_repository_1.campaignRepository.findById(campaignId);
        if (existing?.projectId !== projectId)
            throw new ApiError_1.ApiError(404, 'Campanha não encontrada.');
        return campaign_repository_1.campaignRepository.update(campaignId, data);
    }
    async delete(projectId, campaignId, currentUser) {
        await this.assertProjectOwnership(projectId, currentUser);
        const existing = await campaign_repository_1.campaignRepository.findById(campaignId);
        if (existing?.projectId !== projectId)
            throw new ApiError_1.ApiError(404, 'Campanha não encontrada.');
        await campaign_repository_1.campaignRepository.delete(campaignId);
    }
    async getById(projectId, campaignId, currentUser) {
        // ROOT pode tudo; ADMIN apenas do próprio projeto
        if (currentUser.role !== 'ROOT')
            await this.assertProjectOwnership(projectId, currentUser);
        const c = await campaign_repository_1.campaignRepository.findById(campaignId);
        if (c?.projectId !== projectId)
            throw new ApiError_1.ApiError(404, 'Campanha não encontrada.');
        return c;
    }
    async list(filters, currentUser) {
        if (currentUser.role !== 'ROOT')
            await this.assertProjectOwnership(filters.projectId, currentUser);
        return campaign_repository_1.campaignRepository.list(filters);
    }
}
exports.campaignService = new CampaignService();
