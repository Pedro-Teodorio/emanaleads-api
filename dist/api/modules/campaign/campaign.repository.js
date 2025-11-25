"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.campaignRepository = exports.CampaignRepository = void 0;
const prisma_1 = require("../../../config/prisma");
const campaignSelect = {
    id: true,
    projectId: true,
    name: true,
    monthPayment: true,
    yearPayment: true,
    monthCampaign: true,
    yearCampaign: true,
    clicks: true,
    conversions: true,
    qualified: true,
    sales: true,
    investmentGoogleAds: true,
    investmentTotal: true,
    approvalsRate: true,
    goalQualifiedConv: true,
    createdAt: true,
    updatedAt: true,
};
class CampaignRepository {
    async create(projectId, data) {
        return prisma_1.prisma.campaign.create({
            data: { ...data, projectId },
            select: campaignSelect,
        });
    }
    async update(campaignId, data) {
        return prisma_1.prisma.campaign.update({
            where: { id: campaignId },
            data,
            select: campaignSelect,
        });
    }
    async delete(campaignId) {
        return prisma_1.prisma.campaign.delete({ where: { id: campaignId }, select: { id: true } });
    }
    async findById(campaignId) {
        return prisma_1.prisma.campaign.findUnique({ where: { id: campaignId }, select: campaignSelect });
    }
    async list(filters) {
        const page = Number(filters.page || 1);
        const limit = Number(filters.limit || 10);
        const skip = (page - 1) * limit;
        const where = { projectId: filters.projectId };
        if (filters.search?.trim()) {
            where.name = { contains: filters.search.trim(), mode: 'insensitive' };
        }
        if (filters.year)
            where.yearCampaign = Number(filters.year);
        if (filters.month)
            where.monthCampaign = Number(filters.month);
        const [total, data] = await prisma_1.prisma.$transaction([prisma_1.prisma.campaign.count({ where }), prisma_1.prisma.campaign.findMany({ where, select: campaignSelect, skip, take: limit, orderBy: { createdAt: 'desc' } })]);
        return {
            data,
            meta: { total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) },
        };
    }
}
exports.CampaignRepository = CampaignRepository;
exports.campaignRepository = new CampaignRepository();
