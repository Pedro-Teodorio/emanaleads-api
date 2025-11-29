"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leadRepository = exports.LeadRepository = void 0;
const prisma_1 = require("../../../config/prisma");
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
class LeadRepository {
    async create(data) {
        return prisma_1.prisma.lead.create({
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
    findById(id) {
        // Ignorar registros soft deletados
        return prisma_1.prisma.lead.findFirst({
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
    getPagination(filters) {
        const page = Number.parseInt(filters.page || '1', 10);
        const limit = Number.parseInt(filters.limit || '10', 10);
        return { page, limit, skip: (page - 1) * limit };
    }
    parseStatuses(filters) {
        if (filters.statuses) {
            const list = filters.statuses
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean);
            if (list.length)
                return { in: list };
        }
        if (filters.status)
            return filters.status;
        return undefined;
    }
    applyAssignedUserFilter(where, filters) {
        if (filters.unassigned === 'true') {
            where.assignedUserId = null;
        }
        else if (filters.assignedUserId) {
            where.assignedUserId = filters.assignedUserId;
        }
    }
    applyDateFilters(where, filters) {
        if (filters.dateFrom || filters.dateTo) {
            where.createdAt = {
                gte: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
                lte: filters.dateTo ? new Date(filters.dateTo) : undefined,
            };
        }
        const f = filters;
        if (f.dateUpdatedFrom || f.dateUpdatedTo) {
            where.updatedAt = {
                gte: f.dateUpdatedFrom ? new Date(f.dateUpdatedFrom) : undefined,
                lte: f.dateUpdatedTo ? new Date(f.dateUpdatedTo) : undefined,
            };
        }
    }
    applySearchFilter(where, filters) {
        if (filters.search?.trim()) {
            const s = filters.search.trim();
            where.OR = [{ name: { contains: s, mode: 'insensitive' } }, { email: { contains: s, mode: 'insensitive' } }, { phone: { contains: s, mode: 'insensitive' } }];
        }
    }
    applyTextFilters(where, filters) {
        const f = filters;
        if (f.requestType) {
            where.requestType = { contains: f.requestType, mode: 'insensitive' };
        }
        if (f.position) {
            where.position = { contains: f.position, mode: 'insensitive' };
        }
    }
    buildWhere(filters) {
        const where = { deletedAt: null };
        if (filters.projectId)
            where.projectId = filters.projectId;
        const statusFilter = this.parseStatuses(filters);
        if (statusFilter)
            where.status = statusFilter;
        this.applyAssignedUserFilter(where, filters);
        this.applyDateFilters(where, filters);
        this.applySearchFilter(where, filters);
        this.applyTextFilters(where, filters);
        return where;
    }
    getOrderBy(filters) {
        if (filters.orderBy === 'name') {
            return { name: filters.order || 'desc' };
        }
        return { [filters.orderBy || 'createdAt']: filters.order || 'desc' };
    }
    async list(filters) {
        const { page, limit, skip } = this.getPagination(filters);
        const where = this.buildWhere(filters);
        const orderBy = this.getOrderBy(filters);
        const [total, data] = await prisma_1.prisma.$transaction([
            prisma_1.prisma.lead.count({ where }),
            prisma_1.prisma.lead.findMany({
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
    async listForExport(filters) {
        const where = this.buildWhere(filters);
        const orderBy = this.getOrderBy(filters);
        const leads = await prisma_1.prisma.lead.findMany({
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
    update(id, data) {
        return prisma_1.prisma.lead.update({
            where: { id },
            data: {
                name: data.name,
                email: data.email,
                phone: data.phone,
                position: data.position,
                requestType: data.requestType,
                assignedUserId: data.assignedUserId,
                status: data.status,
            },
            select: leadSelect,
        });
    }
    softDelete(id) {
        return prisma_1.prisma.lead.update({
            where: { id },
            data: { deletedAt: new Date() },
            select: { id: true },
        });
    }
    // Duplicate check within same project by email OR phone (ignoring soft deleted)
    findDuplicateInProject(projectId, email, phone) {
        if (!email && !phone)
            return Promise.resolve(null);
        return prisma_1.prisma.lead.findFirst({
            where: {
                projectId,
                deletedAt: null,
                OR: [email ? { email: { equals: email } } : undefined, phone ? { phone: { equals: phone } } : undefined].filter(Boolean),
            },
            select: leadSelect,
        });
    }
    addHistory(leadId, fromStatus, toStatus, changedByUserId, reason) {
        return prisma_1.prisma.leadHistory.create({
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
exports.LeadRepository = LeadRepository;
exports.leadRepository = new LeadRepository();
