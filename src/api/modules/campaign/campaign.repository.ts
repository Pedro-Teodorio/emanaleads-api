import { prisma } from '../../../config/prisma';
import { Prisma } from '@prisma/client';
import { CreateCampaignData, UpdateCampaignData, ListCampaignsQueryData, MetricsQueryData } from './campaign.validation';

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

	/**
	 * Get aggregated metrics for a project's campaigns
	 */
	async getMetrics(projectId: string, filters?: MetricsQueryData) {
		const where: Prisma.CampaignWhereInput = { projectId };

		if (filters?.year) where.yearCampaign = Number(filters.year);
		if (filters?.month) where.monthCampaign = Number(filters.month);

		const aggregation = await prisma.campaign.aggregate({
			where,
			_sum: {
				clicks: true,
				conversions: true,
				qualified: true,
				sales: true,
				investmentGoogleAds: true,
				investmentTotal: true,
			},
			_avg: {
				approvalsRate: true,
				goalQualifiedConv: true,
			},
			_count: {
				id: true,
			},
		});

		const totalCampaigns = aggregation._count.id;
		const totalClicks = aggregation._sum.clicks || 0;
		const totalConversions = aggregation._sum.conversions || 0;
		const totalQualified = aggregation._sum.qualified || 0;
		const totalSales = aggregation._sum.sales || 0;
		const totalInvestmentGoogleAds = Number(aggregation._sum.investmentGoogleAds || 0);
		const totalInvestmentTotal = Number(aggregation._sum.investmentTotal || 0);

		// Calculate derived metrics
		const ctr = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0; // Click-to-Conversion Rate
		const qualificationRate = totalConversions > 0 ? (totalQualified / totalConversions) * 100 : 0;
		const salesConversionRate = totalQualified > 0 ? (totalSales / totalQualified) * 100 : 0;
		const cpa = totalConversions > 0 ? totalInvestmentTotal / totalConversions : 0; // Cost per Acquisition
		const cpq = totalQualified > 0 ? totalInvestmentTotal / totalQualified : 0; // Cost per Qualified Lead
		const cps = totalSales > 0 ? totalInvestmentTotal / totalSales : 0; // Cost per Sale
		const googleAdsPercentage = totalInvestmentTotal > 0 ? (totalInvestmentGoogleAds / totalInvestmentTotal) * 100 : 0;

		return {
			totalCampaigns,
			totals: {
				clicks: totalClicks,
				conversions: totalConversions,
				qualified: totalQualified,
				sales: totalSales,
				investmentGoogleAds: totalInvestmentGoogleAds,
				investmentTotal: totalInvestmentTotal,
			},
			averages: {
				approvalsRate: aggregation._avg.approvalsRate || 0,
				goalQualifiedConv: aggregation._avg.goalQualifiedConv || 0,
			},
			calculated: {
				ctr: Number(ctr.toFixed(2)), // Click-to-Conversion Rate %
				qualificationRate: Number(qualificationRate.toFixed(2)), // Conversion-to-Qualified Rate %
				salesConversionRate: Number(salesConversionRate.toFixed(2)), // Qualified-to-Sales Rate %
				cpa: Number(cpa.toFixed(2)), // Cost per Acquisition
				cpq: Number(cpq.toFixed(2)), // Cost per Qualified Lead
				cps: Number(cps.toFixed(2)), // Cost per Sale
				googleAdsPercentage: Number(googleAdsPercentage.toFixed(2)), // % of investment in Google Ads
			},
		};
	}

	/**
	 * Get monthly breakdown of metrics for trend analysis
	 */
	async getMonthlyMetrics(projectId: string, year?: number) {
		const where: Prisma.CampaignWhereInput = { projectId };
		if (year) where.yearCampaign = year;

		const campaigns = await prisma.campaign.findMany({
			where,
			select: {
				monthCampaign: true,
				yearCampaign: true,
				clicks: true,
				conversions: true,
				qualified: true,
				sales: true,
				investmentGoogleAds: true,
				investmentTotal: true,
			},
			orderBy: [{ yearCampaign: 'asc' }, { monthCampaign: 'asc' }],
		});

		// Group by year-month
		const monthlyData = new Map<string, {
			year: number;
			month: number;
			clicks: number;
			conversions: number;
			qualified: number;
			sales: number;
			investmentGoogleAds: number;
			investmentTotal: number;
			campaignCount: number;
		}>();

		for (const campaign of campaigns) {
			const key = `${campaign.yearCampaign}-${campaign.monthCampaign.toString().padStart(2, '0')}`;
			const existing = monthlyData.get(key) || {
				year: campaign.yearCampaign,
				month: campaign.monthCampaign,
				clicks: 0,
				conversions: 0,
				qualified: 0,
				sales: 0,
				investmentGoogleAds: 0,
				investmentTotal: 0,
				campaignCount: 0,
			};

			existing.clicks += campaign.clicks;
			existing.conversions += campaign.conversions;
			existing.qualified += campaign.qualified;
			existing.sales += campaign.sales;
			existing.investmentGoogleAds += Number(campaign.investmentGoogleAds);
			existing.investmentTotal += Number(campaign.investmentTotal);
			existing.campaignCount += 1;

			monthlyData.set(key, existing);
		}

		return Array.from(monthlyData.values()).map((data) => ({
			period: `${data.year}-${data.month.toString().padStart(2, '0')}`,
			year: data.year,
			month: data.month,
			campaignCount: data.campaignCount,
			totals: {
				clicks: data.clicks,
				conversions: data.conversions,
				qualified: data.qualified,
				sales: data.sales,
				investmentGoogleAds: data.investmentGoogleAds,
				investmentTotal: data.investmentTotal,
			},
			calculated: {
				ctr: data.clicks > 0 ? Number(((data.conversions / data.clicks) * 100).toFixed(2)) : 0,
				qualificationRate: data.conversions > 0 ? Number(((data.qualified / data.conversions) * 100).toFixed(2)) : 0,
				salesConversionRate: data.qualified > 0 ? Number(((data.sales / data.qualified) * 100).toFixed(2)) : 0,
				cpa: data.conversions > 0 ? Number((data.investmentTotal / data.conversions).toFixed(2)) : 0,
			},
		}));
	}
}

export const campaignRepository = new CampaignRepository();
