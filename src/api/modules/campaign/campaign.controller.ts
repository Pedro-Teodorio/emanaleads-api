import { Request, Response, NextFunction } from 'express';
import { campaignService } from './campaign.service';

class CampaignController {
	create = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { projectId } = req.params as { projectId: string };
			const created = await campaignService.create(projectId, { ...req.body, projectId }, req.user!);
			res.status(201).json(created);
		} catch (err) {
			next(err);
		}
	};

	list = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { projectId } = req.params as { projectId: string };
			const result = await campaignService.list({ ...(req.query as any), projectId }, req.user!);
			res.json(result);
		} catch (err) {
			next(err);
		}
	};

	getById = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { projectId, campaignId } = req.params as { projectId: string; campaignId: string };
			const c = await campaignService.getById(projectId, campaignId, req.user!);
			res.json(c);
		} catch (err) {
			next(err);
		}
	};

	update = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { projectId, campaignId } = req.params as { projectId: string; campaignId: string };
			const updated = await campaignService.update(projectId, campaignId, req.body, req.user!);
			res.json(updated);
		} catch (err) {
			next(err);
		}
	};

	delete = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { projectId, campaignId } = req.params as { projectId: string; campaignId: string };
			await campaignService.delete(projectId, campaignId, req.user!);
			res.status(204).send();
		} catch (err) {
			next(err);
		}
	};

	/**
	 * Get aggregated metrics summary for a project's campaigns
	 * Includes: totals, averages, and calculated KPIs (CTR, CPA, CPQ, CPS)
	 */
	getMetrics = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { projectId } = req.params as { projectId: string };
			const filters = req.query as { year?: number; month?: number };
			const metrics = await campaignService.getMetrics(projectId, filters, req.user!);
			res.json(metrics);
		} catch (err) {
			next(err);
		}
	};

	/**
	 * Get monthly breakdown of metrics for trend analysis
	 */
	getMonthlyMetrics = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { projectId } = req.params as { projectId: string };
			const year = req.query.year as number | undefined;
			const metrics = await campaignService.getMonthlyMetrics(projectId, year, req.user!);
			res.json(metrics);
		} catch (err) {
			next(err);
		}
	};
}

export const campaignController = new CampaignController();
