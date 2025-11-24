import { Request, Response, NextFunction } from 'express';
import { leadService } from './lead.service';
import { ApiError } from '../../../utils/ApiError';
import { generateLeadCSV } from '../../../utils/csv.util';

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

	/**
	 * Exporta leads em CSV com filtros aplicados
	 * Gera arquivo com nome dinâmico baseado em projeto e data
	 */
	async exportCSV(req: Request, res: Response, next: NextFunction) {
		try {
			if (!req.user) return next(new ApiError(401, 'Não autorizado'));

			const filters = req.query as any; // já validado pelo Zod em middleware
			const leads = await leadService.exportCSV(filters, { id: req.user.id, role: req.user.role });

			// Gera CSV
			const csvContent = generateLeadCSV(leads);

			// Determina nome do projeto para o arquivo
			let projectName = 'todos';
			if (leads.length > 0) {
				const firstProjectName = leads[0].project.name;
				// Verifica se todos os leads são do mesmo projeto
				const sameProject = leads.every((lead) => lead.project.name === firstProjectName);
				if (sameProject) {
					// Sanitiza nome do projeto removendo caracteres especiais
					projectName = firstProjectName
						.toLowerCase()
						.normalize('NFD')
						.replace(/[\u0300-\u036f]/g, '') // Remove acentos
						.replace(/[^a-z0-9]+/g, '-') // Substitui caracteres especiais por hífen
						.replace(/(?:^-+|-+$)/g, ''); // Remove hífens do início/fim
				}
			}

			// Cria nome do arquivo com data atual (YYYY-MM-DD)
			const date = new Date();
			const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
			const filename = `leads-${projectName}-${dateStr}.csv`;

			// Define headers para download de arquivo CSV
			res.setHeader('Content-Type', 'text/csv; charset=utf-8');
			res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
			res.send(csvContent);
		} catch (err) {
			next(err);
		}
	}
}

export const leadController = new LeadController();
