import { LeadStatus } from '@prisma/client';
import { leadRepository } from './lead.repository';
import { CreateLeadData, UpdateLeadData, UpdateLeadStatusData, ListLeadsQueryData } from './lead.validation';
import { prisma } from '../../../config/prisma';
import { ApiError } from '../../../utils/ApiError';

const allowedTransitions: Record<LeadStatus, LeadStatus[]> = {
	PRIMEIRO_CONTATO: ['REUNIAO', 'PROPOSTA_ENVIADA'],
	REUNIAO: ['PROPOSTA_ENVIADA'],
	PROPOSTA_ENVIADA: ['ANALISE_PROPOSTA', 'FECHADO_PERDIDO'],
	ANALISE_PROPOSTA: ['FECHADO_GANHO', 'FECHADO_PERDIDO'],
	FECHADO_GANHO: [],
	FECHADO_PERDIDO: [],
};

class LeadService {
	async create(data: CreateLeadData, currentUser: { id: string; role: string }) {
		const project = await prisma.project.findUnique({ where: { id: data.projectId }, select: { id: true, status: true, adminId: true } });
		if (!project) throw new ApiError(404, 'Projeto não encontrado');
		if (project.status !== 'ACTIVE') throw new ApiError(422, 'Projeto não está ativo para criação de leads');

		if (currentUser.role === 'ADMIN' && project.adminId !== currentUser.id) {
			throw new ApiError(403, 'Sem acesso a este projeto');
		}
		if (currentUser.role === 'PROJECT_USER') {
			const membership = await prisma.projectMember.findFirst({ where: { projectId: project.id, userId: currentUser.id } });
			if (!membership) throw new ApiError(403, 'Usuário não é membro do projeto');
		}

		const duplicate = await leadRepository.findDuplicateInProject(project.id, data.email, data.phone);
		if (duplicate) throw new ApiError(409, 'Lead duplicado no projeto');

		const lead = await leadRepository.create(data);
		await leadRepository.addHistory(lead.id, null, lead.status, currentUser.id, null);
		return lead;
	}

	async getById(id: string, currentUser: { id: string; role: string }) {
		const lead = await leadRepository.findById(id);
		if (!lead) throw new ApiError(404, 'Lead não encontrado');
		await this.assertCanAccessLead(lead, currentUser);
		return lead;
	}

	async list(filters: ListLeadsQueryData, currentUser: { id: string; role: string }) {
		if (currentUser.role === 'PROJECT_USER') {
			// Aplicar filtro no banco para garantir paginação consistente
			const filtered = await leadRepository.list({ ...filters, assignedUserId: currentUser.id } as any);
			return filtered;
		}
		return await leadRepository.list(filters);
	}

	async update(id: string, data: UpdateLeadData, currentUser: { id: string; role: string }) {
		const existing = await leadRepository.findById(id);
		if (!existing) throw new ApiError(404, 'Lead não encontrado');
		await this.assertCanAccessLead(existing, currentUser);

		if ((data.email || data.phone) && (data.email !== existing.email || data.phone !== existing.phone)) {
			const duplicate = await leadRepository.findDuplicateInProject(existing.projectId, data.email, data.phone);
			if (duplicate && duplicate.id !== existing.id) throw new ApiError(409, 'Lead duplicado no projeto');
		}

		const updated = await leadRepository.update(id, data);
		return updated;
	}

	async updateStatus(id: string, data: UpdateLeadStatusData, currentUser: { id: string; role: string }) {
		const lead = await leadRepository.findById(id);
		if (!lead) throw new ApiError(404, 'Lead não encontrado');
		await this.assertCanAccessLead(lead, currentUser);

		const from = lead.status;
		const to = data.toStatus as LeadStatus;
		if (from === to) throw new ApiError(400, 'Status já está definido');
		const allowed = allowedTransitions[from];
		if (!allowed.includes(to)) throw new ApiError(422, 'Transição de status inválida');

		const updated = await leadRepository.update(id, { status: to } as any);
		await leadRepository.addHistory(id, from, to, currentUser.id, data.reason || null);
		return updated;
	}

	async delete(id: string, currentUser: { id: string; role: string }) {
		const lead = await leadRepository.findById(id);
		if (!lead) throw new ApiError(404, 'Lead não encontrado');
		await this.assertCanAccessLead(lead, currentUser);
		await leadRepository.softDelete(id);
	}

	private async assertCanAccessLead(lead: { projectId: string; assignedUserId: string | null }, currentUser: { id: string; role: string }) {
		if (currentUser.role === 'ROOT') return;
		if (currentUser.role === 'ADMIN') {
			const project = await prisma.project.findUnique({ where: { id: lead.projectId }, select: { adminId: true } });
			if (!project || project.adminId !== currentUser.id) throw new ApiError(403, 'Sem acesso ao lead');
			return;
		}
		if (currentUser.role === 'PROJECT_USER') {
			if (lead.assignedUserId !== currentUser.id) throw new ApiError(403, 'Lead não atribuído ao usuário');
			return;
		}
		throw new ApiError(403, 'Perfil não autorizado');
	}
}

export const leadService = new LeadService();
