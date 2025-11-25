import { z } from 'zod';

export const projectIdParamSchema = z.object({
	params: z.object({ projectId: z.uuid() }),
});

export const campaignIdParamsSchema = z.object({
	params: z.object({ projectId: z.uuid(), campaignId: z.uuid() }),
});

export const createCampaignSchema = z.object({
	params: z.object({ projectId: z.uuid() }),
	body: z.object({
		name: z.string().min(1),
		monthPayment: z.number().int().min(1).max(12),
		yearPayment: z.number().int().min(2000),
		monthCampaign: z.number().int().min(1).max(12),
		yearCampaign: z.number().int().min(2000),
		clicks: z.number().int().min(0).default(0),
		conversions: z.number().int().min(0).default(0),
		qualified: z.number().int().min(0).default(0),
		sales: z.number().int().min(0).default(0),
		investmentGoogleAds: z.number().min(0).default(0),
		investmentTotal: z.number().min(0).default(0),
		approvalsRate: z.number().min(0).max(100).optional(),
		goalQualifiedConv: z.number().min(0).max(100).optional(),
	}),
});

export const updateCampaignSchema = z.object({
	params: z.object({ projectId: z.uuid(), campaignId: z.uuid() }),
	body: z
		.object({
			name: z.string().min(1).optional(),
			monthPayment: z.number().int().min(1).max(12).optional(),
			yearPayment: z.number().int().min(2000).optional(),
			monthCampaign: z.number().int().min(1).max(12).optional(),
			yearCampaign: z.number().int().min(2000).optional(),
			clicks: z.number().int().min(0).optional(),
			conversions: z.number().int().min(0).optional(),
			qualified: z.number().int().min(0).optional(),
			sales: z.number().int().min(0).optional(),
			investmentGoogleAds: z.number().min(0).optional(),
			investmentTotal: z.number().min(0).optional(),
			approvalsRate: z.number().min(0).max(100).optional(),
			goalQualifiedConv: z.number().min(0).max(100).optional(),
		})
		.refine((data) => Object.keys(data).length > 0, { message: 'Nenhum campo para atualizar' }),
});

export const listCampaignsQuerySchema = z.object({
	params: z.object({ projectId: z.uuid() }),
	query: z.object({
		page: z
			.string()
			.regex(/^\d+$/)
			.transform(Number)
			.default('1' as any),
		limit: z
			.string()
			.regex(/^\d+$/)
			.transform(Number)
			.default('10' as any),
		search: z.string().optional(),
		year: z.string().regex(/^\d+$/).optional(),
		month: z.string().regex(/^\d+$/).optional(),
	}),
});

export const metricsQuerySchema = z.object({
	params: z.object({ projectId: z.uuid() }),
	query: z.object({
		year: z.string().regex(/^\d+$/).optional(),
		month: z.string().regex(/^\d+$/).optional(),
	}),
});

export const monthlyMetricsQuerySchema = z.object({
	params: z.object({ projectId: z.uuid() }),
	query: z.object({
		year: z.string().regex(/^\d+$/).optional(),
	}),
});

export type CreateCampaignData = z.infer<typeof createCampaignSchema>['body'] & { projectId: string };
export type UpdateCampaignData = z.infer<typeof updateCampaignSchema>['body'];
export type ListCampaignsQueryData = z.infer<typeof listCampaignsQuerySchema>['query'] & { projectId: string };
export type MetricsQueryData = z.infer<typeof metricsQuerySchema>['query'];
