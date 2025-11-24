import { prisma } from '../../../config/prisma';
import { Prisma, LeadStatus } from '@prisma/client';
import { ListLeadsQueryData, CreateLeadData, UpdateLeadData } from './lead.validation';

// Tipo interno garantindo que projectId e assignedUserId foram resolvidos
type ResolvedLeadData = CreateLeadData & {
	projectId: string;
	assignedUserId: string;
};

const leadSelect = {
	id: true,
	name: true,
	email: true,
	phone: true,
	position: true,
	requestType: true,
	status: true,
	projectId: true,
	assignedUserId: true,
	createdAt: true,
	updatedAt: true,
};

export class LeadRepository {
	async create(data: ResolvedLeadData) {
		return prisma.lead.create({
			data: {
				name: data.name,
				email: data.email,
				phone: data.phone,
				position: data.position,
				requestType: data.requestType,
				projectId: data.projectId,
				assignedUserId: data.assignedUserId,
				status: data.status, // prisma default se undefined
			},
			select: leadSelect,
		});
	}

	findById(id: string) {
		// Ignorar registros soft deletados
		return prisma.lead.findFirst({
			where: { id, deletedAt: null },
			select: {
				...leadSelect,
				history: {
					select: {
						id: true,
						fromStatus: true,
						toStatus: true,
						changedByUserId: true,
						createdAt: true,
					},
					orderBy: { createdAt: 'desc' },
				},
			},
		});
	}

	private getPagination(filters: ListLeadsQueryData) {
		const page = Number.parseInt(filters.page || '1', 10);
		const limit = Number.parseInt(filters.limit || '10', 10);
		return { page, limit, skip: (page - 1) * limit };
	}

	private parseStatuses(filters: ListLeadsQueryData): Prisma.LeadWhereInput['status'] | undefined {
		if (filters.statuses) {
			const list = filters.statuses
				.split(',')
				.map((s) => s.trim())
				.filter(Boolean) as LeadStatus[];
			if (list.length) return { in: list } as any;
		}
		if (filters.status) return filters.status as LeadStatus;
		return undefined;
	}

	private applyAssignedUserFilter(where: Prisma.LeadWhereInput, filters: ListLeadsQueryData) {
		if (filters.unassigned === 'true') {
			where.assignedUserId = null;
		} else if (filters.assignedUserId) {
			where.assignedUserId = filters.assignedUserId;
		}
	}

	private applyDateFilters(where: Prisma.LeadWhereInput, filters: ListLeadsQueryData) {
		if (filters.dateFrom || filters.dateTo) {
			where.createdAt = {
				gte: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
				lte: filters.dateTo ? new Date(filters.dateTo) : undefined,
			};
		}

		const f: any = filters;
		if (f.dateUpdatedFrom || f.dateUpdatedTo) {
			where.updatedAt = {
				gte: f.dateUpdatedFrom ? new Date(f.dateUpdatedFrom) : undefined,
				lte: f.dateUpdatedTo ? new Date(f.dateUpdatedTo) : undefined,
			};
		}
	}

	private applySearchFilter(where: Prisma.LeadWhereInput, filters: ListLeadsQueryData) {
		if (filters.search?.trim()) {
			const s = filters.search.trim();
			where.OR = [{ name: { contains: s, mode: 'insensitive' } }, { email: { contains: s, mode: 'insensitive' } }, { phone: { contains: s, mode: 'insensitive' } }];
		}
	}

	private applyTextFilters(where: Prisma.LeadWhereInput, filters: ListLeadsQueryData) {
		const f: any = filters;
		if (f.requestType) {
			where.requestType = { contains: f.requestType, mode: 'insensitive' } as any;
		}
		if (f.position) {
			where.position = { contains: f.position, mode: 'insensitive' } as any;
		}
	}

	private buildWhere(filters: ListLeadsQueryData): Prisma.LeadWhereInput {
		const where: Prisma.LeadWhereInput = { deletedAt: null };

		if (filters.projectId) where.projectId = filters.projectId;
		const statusFilter = this.parseStatuses(filters);
		if (statusFilter) where.status = statusFilter;

		this.applyAssignedUserFilter(where, filters);
		this.applyDateFilters(where, filters);
		this.applySearchFilter(where, filters);
		this.applyTextFilters(where, filters);

		return where;
	}

	private getOrderBy(filters: ListLeadsQueryData) {
		if (filters.orderBy === 'name') {
			return { name: (filters.order as Prisma.SortOrder) || 'desc' };
		}
		return { [filters.orderBy || 'createdAt']: (filters.order as Prisma.SortOrder) || 'desc' } as any;
	}

	async list(filters: ListLeadsQueryData) {
		const { page, limit, skip } = this.getPagination(filters);
		const where = this.buildWhere(filters);
		const orderBy = this.getOrderBy(filters);

		const [total, data] = await prisma.$transaction([
			prisma.lead.count({ where }),
			prisma.lead.findMany({
				where,
				select: leadSelect,
				skip,
				take: limit,
				orderBy,
			}),
		]);

		return {
			data,
			meta: {
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit) || 1,
			},
		};
	}

	/**
	 * Lista leads para exportação CSV sem paginação
	 * Inclui relações project e assignedUser para nomes
	 * Limite de 50.001 registros para validação soft
	 */
	async listForExport(filters: Omit<ListLeadsQueryData, 'page' | 'limit'>) {
		const where = this.buildWhere(filters as ListLeadsQueryData);
		const orderBy = this.getOrderBy(filters as ListLeadsQueryData);

		const leads = await prisma.lead.findMany({
			where,
			select: {
				id: true,
				name: true,
				email: true,
				phone: true,
				position: true,
				requestType: true,
				status: true,
				createdAt: true,
				updatedAt: true,
				project: {
					select: { name: true },
				},
				assignedUser: {
					select: { name: true },
				},
			},
			orderBy,
			take: 50001, // Limite soft: busca 50.001 para validar se excedeu 50k
		});

		return leads;
	}

	update(id: string, data: UpdateLeadData) {
		return prisma.lead.update({
			where: { id },
			data: {
				name: data.name,
				email: data.email,
				phone: data.phone,
				position: data.position,
				requestType: data.requestType,
				assignedUserId: data.assignedUserId,
				status: data.status as any,
			},
			select: leadSelect,
		});
	}

	softDelete(id: string) {
		return prisma.lead.update({
			where: { id },
			data: { deletedAt: new Date() },
			select: { id: true },
		});
	}

	// Duplicate check within same project by email OR phone (ignoring soft deleted)
	findDuplicateInProject(projectId: string, email?: string | null, phone?: string | null) {
		if (!email && !phone) return Promise.resolve(null);
		return prisma.lead.findFirst({
			where: {
				projectId,
				deletedAt: null,
				OR: [email ? { email: { equals: email } } : undefined, phone ? { phone: { equals: phone } } : undefined].filter(Boolean) as Prisma.LeadWhereInput[],
			},
			select: leadSelect,
		});
	}

	addHistory(leadId: string, fromStatus: LeadStatus | null, toStatus: LeadStatus, changedByUserId?: string | null, reason?: string | null) {
		return prisma.leadHistory.create({
			data: {
				leadId,
				fromStatus: fromStatus || undefined,
				toStatus,
				changedByUserId: changedByUserId || undefined,
				reason: reason || undefined,
			},
			select: {
				id: true,
				fromStatus: true,
				toStatus: true,
				changedByUserId: true,
				reason: true,
				createdAt: true,
			},
		});
	}
}

export const leadRepository = new LeadRepository();
