import { ApiError } from '../../../utils/ApiError';
import { campaignRepository } from './campaign.repository';
import { ListCampaignsQueryData, CreateCampaignData, UpdateCampaignData } from './campaign.validation';
import { prisma } from '../../../config/prisma';

class CampaignService {
	private async assertProjectOwnership(projectId: string, currentUser: { id: string; role: string }) {
		if (currentUser.role === 'ROOT') return;
		if (currentUser.role !== 'ADMIN') throw new ApiError(403, 'Acesso negado.');

		const project = await prisma.project.findUnique({ where: { id: projectId }, select: { adminId: true } });
		if (!project) throw new ApiError(404, 'Projeto não encontrado.');
		if (project.adminId !== currentUser.id) throw new ApiError(403, 'Acesso negado. Você não é o administrador deste projeto.');
	}

	async create(projectId: string, data: CreateCampaignData, currentUser: { id: string; role: string }) {
		await this.assertProjectOwnership(projectId, currentUser);
		return campaignRepository.create(projectId, data);
	}

	async update(projectId: string, campaignId: string, data: UpdateCampaignData, currentUser: { id: string; role: string }) {
		await this.assertProjectOwnership(projectId, currentUser);
		const existing = await campaignRepository.findById(campaignId);
		if (existing?.projectId !== projectId) throw new ApiError(404, 'Campanha não encontrada.');
		return campaignRepository.update(campaignId, data);
	}

	async delete(projectId: string, campaignId: string, currentUser: { id: string; role: string }) {
		await this.assertProjectOwnership(projectId, currentUser);
		const existing = await campaignRepository.findById(campaignId);
		if (existing?.projectId !== projectId) throw new ApiError(404, 'Campanha não encontrada.');
		await campaignRepository.delete(campaignId);
	}

	async getById(projectId: string, campaignId: string, currentUser: { id: string; role: string }) {
		// ROOT pode tudo; ADMIN apenas do próprio projeto
		if (currentUser.role !== 'ROOT') await this.assertProjectOwnership(projectId, currentUser);
		const c = await campaignRepository.findById(campaignId);
		if (c?.projectId !== projectId) throw new ApiError(404, 'Campanha não encontrada.');
		return c;
	}

	async list(filters: ListCampaignsQueryData, currentUser: { id: string; role: string }) {
		if (currentUser.role !== 'ROOT') await this.assertProjectOwnership(filters.projectId, currentUser);
		return campaignRepository.list(filters);
	}

	async getMetrics(projectId: string, currentUser: { id: string; role: string }) {
		await this.assertProjectOwnership(projectId, currentUser);

		type CampaignMetrics = {
			clicks: number;
			conversions: number;
			qualified: number;
			sales: number;
			investmentTotal: any; // Prisma.Decimal, usar any aqui evita necessidade de importar Prisma só para typing
			approvalsRate: number | null;
			monthCampaign: number;
			yearCampaign: number;
		};

		const campaigns: CampaignMetrics[] = await prisma.campaign.findMany({
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
		const totalClicks = campaigns.reduce<number>((sum, c) => sum + c.clicks, 0);
		const totalConversions = campaigns.reduce<number>((sum, c) => sum + c.conversions, 0);
		const totalQualified = campaigns.reduce<number>((sum, c) => sum + c.qualified, 0);
		const totalSales = campaigns.reduce<number>((sum, c) => sum + c.sales, 0);
		const totalInvestment = campaigns.reduce<number>((sum, c) => sum + Number(c.investmentTotal), 0);

		const averageConversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
		const validApprovalRates = campaigns.filter((c) => c.approvalsRate !== null).map((c) => c.approvalsRate!);
		const averageApprovalRate = validApprovalRates.length > 0 ? validApprovalRates.reduce<number>((sum, rate) => sum + rate, 0) / validApprovalRates.length : 0;

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

export const campaignService = new CampaignService();
