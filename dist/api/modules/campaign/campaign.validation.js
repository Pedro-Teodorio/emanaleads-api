"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCampaignsQuerySchema = exports.updateCampaignSchema = exports.createCampaignSchema = exports.campaignIdParamsSchema = exports.projectIdParamSchema = void 0;
const zod_1 = require("zod");
exports.projectIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({ projectId: zod_1.z.uuid() }),
});
exports.campaignIdParamsSchema = zod_1.z.object({
    params: zod_1.z.object({ projectId: zod_1.z.uuid(), campaignId: zod_1.z.uuid() }),
});
exports.createCampaignSchema = zod_1.z.object({
    params: zod_1.z.object({ projectId: zod_1.z.uuid() }),
    body: zod_1.z.object({
        name: zod_1.z.string().min(1),
        monthPayment: zod_1.z.number().int().min(1).max(12),
        yearPayment: zod_1.z.number().int().min(2000),
        monthCampaign: zod_1.z.number().int().min(1).max(12),
        yearCampaign: zod_1.z.number().int().min(2000),
        clicks: zod_1.z.number().int().min(0).default(0),
        conversions: zod_1.z.number().int().min(0).default(0),
        qualified: zod_1.z.number().int().min(0).default(0),
        sales: zod_1.z.number().int().min(0).default(0),
        investmentGoogleAds: zod_1.z.number().min(0).default(0),
        investmentTotal: zod_1.z.number().min(0).default(0),
        approvalsRate: zod_1.z.number().min(0).max(100).optional(),
        goalQualifiedConv: zod_1.z.number().min(0).max(100).optional(),
    }),
});
exports.updateCampaignSchema = zod_1.z.object({
    params: zod_1.z.object({ projectId: zod_1.z.uuid(), campaignId: zod_1.z.uuid() }),
    body: zod_1.z
        .object({
        name: zod_1.z.string().min(1).optional(),
        monthPayment: zod_1.z.number().int().min(1).max(12).optional(),
        yearPayment: zod_1.z.number().int().min(2000).optional(),
        monthCampaign: zod_1.z.number().int().min(1).max(12).optional(),
        yearCampaign: zod_1.z.number().int().min(2000).optional(),
        clicks: zod_1.z.number().int().min(0).optional(),
        conversions: zod_1.z.number().int().min(0).optional(),
        qualified: zod_1.z.number().int().min(0).optional(),
        sales: zod_1.z.number().int().min(0).optional(),
        investmentGoogleAds: zod_1.z.number().min(0).optional(),
        investmentTotal: zod_1.z.number().min(0).optional(),
        approvalsRate: zod_1.z.number().min(0).max(100).optional(),
        goalQualifiedConv: zod_1.z.number().min(0).max(100).optional(),
    })
        .refine((data) => Object.keys(data).length > 0, { message: 'Nenhum campo para atualizar' }),
});
exports.listCampaignsQuerySchema = zod_1.z.object({
    params: zod_1.z.object({ projectId: zod_1.z.uuid() }),
    query: zod_1.z.object({
        page: zod_1.z
            .string()
            .regex(/^\d+$/)
            .transform(Number)
            .default('1'),
        limit: zod_1.z
            .string()
            .regex(/^\d+$/)
            .transform(Number)
            .default('10'),
        search: zod_1.z.string().optional(),
        year: zod_1.z.string().regex(/^\d+$/).optional(),
        month: zod_1.z.string().regex(/^\d+$/).optional(),
    }),
});
