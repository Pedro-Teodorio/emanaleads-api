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
    async getMetrics(projectId, currentUser) {
        await this.assertProjectOwnership(projectId, currentUser);
        const campaigns = await prisma_1.prisma.campaign.findMany({
            where: { projectId },
            select: {
                clicks: true,
                conversions: true,
                qualified: true,
                sales: true,
                investmentTotal: true,
                approvalsRate: true,
                monthCampaign: true,
                yearCampaign: true,
            },
            orderBy: [{ yearCampaign: 'asc' }, { monthCampaign: 'asc' }],
        });
        const totalCampaigns = campaigns.length;
        const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
        const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
        const totalQualified = campaigns.reduce((sum, c) => sum + c.qualified, 0);
        const totalSales = campaigns.reduce((sum, c) => sum + c.sales, 0);
        const totalInvestment = campaigns.reduce((sum, c) => sum + Number(c.investmentTotal), 0);
        const averageConversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
        const validApprovalRates = campaigns.filter((c) => c.approvalsRate !== null).map((c) => c.approvalsRate);
        const averageApprovalRate = validApprovalRates.length > 0 ? validApprovalRates.reduce((sum, rate) => sum + rate, 0) / validApprovalRates.length : 0;
        // Séries temporais (últimos 12 meses ou todos se menos)
        const monthlySeries = campaigns.slice(-12).map((c) => ({
            month: `${String(c.monthCampaign).padStart(2, '0')}/${c.yearCampaign}`,
            clicks: c.clicks,
            conversions: c.conversions,
            sales: c.sales,
            investment: Number(c.investmentTotal),
        }));
        return {
            totalCampaigns,
            totalClicks,
            totalConversions,
            totalQualified,
            totalSales,
            totalInvestment,
            averageConversionRate,
            averageApprovalRate,
            monthlySeries,
        };
    }
}
exports.campaignService = new CampaignService();
