import { Request, Response, NextFunction } from 'express';
import { leadService } from './lead.service';
import { ApiError } from '../../../utils/ApiError';

class LeadController {
	async create(req: Request, res: Response, next: NextFunction) {
		try {
			if (!req.user) return next(new ApiError(401, 'Não autorizado'));
			const lead = await leadService.create(req.body, { id: req.user.id, role: req.user.role });
			res.status(201).json(lead);
		} catch (err) {
			next(err);
		}
	}

	async getById(req: Request, res: Response, next: NextFunction) {
		try {
			if (!req.user) return next(new ApiError(401, 'Não autorizado'));
			const lead = await leadService.getById(req.params.leadId, { id: req.user.id, role: req.user.role });
			res.status(200).json(lead);
		} catch (err) {
			next(err);
		}
	}

	async list(req: Request, res: Response, next: NextFunction) {
		try {
			if (!req.user) return next(new ApiError(401, 'Não autorizado'));
			const filters = req.query as any; // já validado pelo Zod em middleware
			const result = await leadService.list(filters, { id: req.user.id, role: req.user.role });
			res.status(200).json(result);
		} catch (err) {
			next(err);
		}
	}

	async update(req: Request, res: Response, next: NextFunction) {
		try {
			if (!req.user) return next(new ApiError(401, 'Não autorizado'));
			const lead = await leadService.update(req.params.leadId, req.body, { id: req.user.id, role: req.user.role });
			res.status(200).json(lead);
		} catch (err) {
			next(err);
		}
	}

	async updateStatus(req: Request, res: Response, next: NextFunction) {
		try {
			if (!req.user) return next(new ApiError(401, 'Não autorizado'));
			const updated = await leadService.updateStatus(req.params.leadId, req.body, { id: req.user.id, role: req.user.role });
			res.status(200).json(updated);
		} catch (err) {
			next(err);
		}
	}

	async delete(req: Request, res: Response, next: NextFunction) {
		try {
			if (!req.user) return next(new ApiError(401, 'Não autorizado'));
			await leadService.delete(req.params.leadId, { id: req.user.id, role: req.user.role });
			res.status(204).send();
		} catch (err) {
			next(err);
		}
	}
}

export const leadController = new LeadController();
