import { Prisma, ProjectStatus } from '@prisma/client';
import { prisma } from '../../../config/prisma';
import { AddMemberData, CreateProjectData } from './project.validation';

class ProjectRepository {
	create(data: CreateProjectData) {
		return prisma.project.create({
			data: {
				name: data.name,
				description: data.description,
				status: data.status || ProjectStatus.PLANNING,
				adminId: data.adminId,
			},
		});
	}

	async findUnique<T extends Prisma.ProjectFindUniqueArgs>(args: Prisma.SelectSubset<T, Prisma.ProjectFindUniqueArgs>): Promise<Prisma.ProjectGetPayload<T> | null> {
		return prisma.project.findUnique(args);
	}

	list(where: Prisma.ProjectWhereInput, page: number, limit: number) {
		const skip = (page - 1) * limit;
		return prisma.project.findMany({
			where,
			include: {
				admin: {
					select: { id: true, name: true, email: true },
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
			skip,
			take: limit,
		});
	}

	listRecent() {
		return prisma.project.findMany({
			orderBy: { createdAt: 'desc' },
			select: {
				id: true,
				name: true,
				description: true,
				status: true,
				createdAt: true,
				updatedAt: true,
				adminId: true,
			},
			take: 5,
		});
	}

	count(where: Prisma.ProjectWhereInput) {
		return prisma.project.count({ where });
	}

	update(projectId: string, data: Prisma.ProjectUpdateInput) {
		return prisma.project.update({
			where: { id: projectId },
			data,
		});
	}

	delete(projectId: string) {
		return prisma.project.delete({
			where: { id: projectId },
		});
	}

	addMember(data: AddMemberData) {
		return prisma.projectMember.create({
			data: {
				userId: data.userId,
				projectId: data.projectId,
			},
			include: {
				user: { select: { id: true, name: true, email: true } },
				project: { select: { id: true, name: true } },
			},
		});
	}

	listMembers(projectId: string) {
		return prisma.projectMember.findMany({
			where: { projectId: projectId },
			include: {
				user: {
					select: { id: true, name: true, email: true, role: true },
				},
			},
		});
	}

	findMember(where: Prisma.ProjectMemberWhereInput) {
		return prisma.projectMember.findFirst({ where });
	}

	removeMember(memberId: string) {
		return prisma.projectMember.delete({
			where: {
				id: memberId,
			},
		});
	}

	async countMembers(projectId: string) {
		return prisma.projectMember.count({
			where: { projectId },
		});
	}

	async countCampaigns(projectId: string) {
		return prisma.campaign.count({
			where: { projectId },
		});
	}

	async countLeads(projectId: string) {
		return prisma.lead.count({
			where: { projectId, deletedAt: null },
		});
	}

	async getLeadsStatusDistribution(projectId: string) {
		const distribution = await prisma.lead.groupBy({
			by: ['status'],
			where: { projectId, deletedAt: null },
			_count: { status: true },
		});

		return distribution.map((item) => ({
			status: item.status,
			count: item._count.status,
		}));
	}

	async getCampaignsOverview(projectId: string) {
		const campaigns = await prisma.campaign.findMany({
			where: { projectId },
			select: {
				clicks: true,
				conversions: true,
				sales: true,
				investmentTotal: true,
			},
		});

		const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
		const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
		const totalSales = campaigns.reduce((sum, c) => sum + c.sales, 0);
		const totalInvestment = campaigns.reduce((sum, c) => sum + Number(c.investmentTotal), 0);

		return {
			totalClicks,
			totalConversions,
			totalSales,
			totalInvestment,
		};
	}
}

export const projectRepository = new ProjectRepository();
