import { prisma } from '../../../config/prisma';
import { Prisma } from '@prisma/client';
import { CreateCampaignData, UpdateCampaignData, ListCampaignsQueryData } from './campaign.validation';

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

export class CampaignRepository {
	async create(projectId: string, data: CreateCampaignData) {
		return prisma.campaign.create({
			data: { ...data, projectId },
			select: campaignSelect,
		});
	}

	async update(campaignId: string, data: UpdateCampaignData) {
		return prisma.campaign.update({
			where: { id: campaignId },
			data,
			select: campaignSelect,
		});
	}

	async delete(campaignId: string) {
		return prisma.campaign.delete({ where: { id: campaignId }, select: { id: true } });
	}

	async findById(campaignId: string) {
		return prisma.campaign.findUnique({ where: { id: campaignId }, select: campaignSelect });
	}

	async list(filters: ListCampaignsQueryData) {
		const page = Number(filters.page || 1);
		const limit = Number(filters.limit || 10);
		const skip = (page - 1) * limit;

		const where: Prisma.CampaignWhereInput = { projectId: filters.projectId };
		if (filters.search?.trim()) {
			where.name = { contains: filters.search.trim(), mode: 'insensitive' };
		}
		if (filters.year) where.yearCampaign = Number(filters.year);
		if (filters.month) where.monthCampaign = Number(filters.month);

		const [total, data] = await prisma.$transaction([prisma.campaign.count({ where }), prisma.campaign.findMany({ where, select: campaignSelect, skip, take: limit, orderBy: { createdAt: 'desc' } })]);

		return {
			data,
			meta: { total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) },
		};
	}
}

export const campaignRepository = new CampaignRepository();
