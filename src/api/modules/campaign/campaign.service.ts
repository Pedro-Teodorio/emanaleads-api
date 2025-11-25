import { ApiError } from '../../../utils/ApiError';
import { campaignRepository } from './campaign.repository';
import { ListCampaignsQueryData, CreateCampaignData, UpdateCampaignData, MetricsQueryData } from './campaign.validation';
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

	/**
	 * Get aggregated metrics summary for a project's campaigns
	 */
	async getMetrics(projectId: string, filters: MetricsQueryData, currentUser: { id: string; role: string }) {
		if (currentUser.role !== 'ROOT') await this.assertProjectOwnership(projectId, currentUser);
		return campaignRepository.getMetrics(projectId, filters);
	}

	/**
	 * Get monthly breakdown of metrics for trend analysis
	 */
	async getMonthlyMetrics(projectId: string, year: number | undefined, currentUser: { id: string; role: string }) {
		if (currentUser.role !== 'ROOT') await this.assertProjectOwnership(projectId, currentUser);
		return campaignRepository.getMonthlyMetrics(projectId, year);
	}
}

export const campaignService = new CampaignService();
