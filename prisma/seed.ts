import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
	console.log('🌱 Seeding database...');

	// Criar usuário ROOT
	const rootPassword = await bcrypt.hash('Root@123456', 10);
	const root = await prisma.user.upsert({
		where: { email: 'root@emanaleads.com' },
		update: {},
		create: {
			name: 'Root Admin',
			email: 'root@emanaleads.com',
			password: rootPassword,
			role: 'ROOT',
			status: 'ACTIVE',
			phone: '11999999999',
		},
	});
	console.log('✓ Usuário ROOT criado:', root.email);

	// Criar usuário ADMIN
	const adminPassword = await bcrypt.hash('Admin@123456', 10);
	const admin = await prisma.user.upsert({
		where: { email: 'admin@emanaleads.com' },
		update: {},
		create: {
			name: 'Admin User',
			email: 'admin@emanaleads.com',
			password: adminPassword,
			role: 'ADMIN',
			status: 'ACTIVE',
			phone: '11988888888',
		},
	});
	console.log('✓ Usuário ADMIN criado:', admin.email);

	// Criar usuário PROJECT_USER
	const userPassword = await bcrypt.hash('User@123456', 10);
	const user = await prisma.user.upsert({
		where: { email: 'user@emanaleads.com' },
		update: {},
		create: {
			name: 'Project User',
			email: 'user@emanaleads.com',
			password: userPassword,
			role: 'PROJECT_USER',
			status: 'ACTIVE',
			phone: '11977777777',
		},
	});
	console.log('✓ Usuário PROJECT_USER criado:', user.email);

	// Criar projeto de exemplo
	const project = await prisma.project.upsert({
		where: { id: 'def3a2c6-b0c3-4a93-95ec-61d112e044a1' },
		update: {},
		create: {
			id: 'def3a2c6-b0c3-4a93-95ec-61d112e044a1',
			name: 'Projeto Demo',
			description: 'Projeto de demonstração para testes',
			status: 'ACTIVE',
			adminId: admin.id,
		},
	});
	console.log('✓ Projeto criado:', project.name);

	// Adicionar user como membro do projeto (evita duplicar em re-seed)
	const existingMembership = await prisma.projectMember.findFirst({ where: { projectId: project.id, userId: user.id } });
	if (!existingMembership) {
		await prisma.projectMember.create({
			data: {
				projectId: project.id,
				userId: user.id,
			},
		});
		console.log('✓ Usuário adicionado ao projeto');
	} else {
		console.log('ℹ Usuário já era membro do projeto');
	}

	// Criar leads de exemplo (evitar duplicatas por email)
	const leadsData = [
		{ name: 'Alice Primeiro Contato', email: 'alice.lead@demo.com', projectId: project.id, position: 'CTO', requestType: 'consultoria', status: 'PRIMEIRO_CONTATO', assignedUserId: user.id },
		{ name: 'Bruno Reuniao', email: 'bruno.lead@demo.com', projectId: project.id, position: 'COO', requestType: 'implantacao', status: 'REUNIAO', assignedUserId: user.id },
		{ name: 'Carla Proposta Enviada', email: 'carla.lead@demo.com', projectId: project.id, position: 'CFO', requestType: 'auditoria', status: 'PROPOSTA_ENVIADA', assignedUserId: null },
		{ name: 'Davi Analise', email: 'davi.lead@demo.com', projectId: project.id, position: 'Head Marketing', requestType: 'consultoria', status: 'ANALISE_PROPOSTA', assignedUserId: user.id },
		{ name: 'Eva Ganho', email: 'eva.lead@demo.com', projectId: project.id, position: 'Diretora', requestType: 'outsourcing', status: 'FECHADO_GANHO', assignedUserId: user.id },
		{ name: 'Fabio Perdido', email: 'fabio.lead@demo.com', projectId: project.id, position: 'Gerente', requestType: 'treinamento', status: 'FECHADO_PERDIDO', assignedUserId: null },
	];

	for (const ld of leadsData) {
		const exists = await prisma.lead.findFirst({ where: { email: ld.email } });
		if (exists) continue;
		const created = await prisma.lead.create({
			data: {
				name: ld.name,
				email: ld.email,
				projectId: ld.projectId,
				position: ld.position,
				requestType: ld.requestType,
				status: ld.status as any,
				assignedUserId: ld.assignedUserId || undefined,
			},
			select: { id: true, status: true },
		});
		let reason: string | undefined;
		if (ld.status === 'FECHADO_GANHO') {
			reason = 'Venda concluída';
		} else if (ld.status === 'FECHADO_PERDIDO') {
			reason = 'Lead não seguiu';
		}

		await prisma.leadHistory.create({
			data: {
				leadId: created.id,
				fromStatus: null,
				toStatus: created.status as any,
				changedByUserId: admin.id,
				reason,
			},
		});
	}
	console.log('✓ Leads de exemplo criados (se não existiam)');

	console.log('\n✅ Seed concluído com sucesso!');
	console.log('\n📋 Credenciais de teste:');
	console.log('   ROOT:  root@emanaleads.com  / Root@123456');
	console.log('   ADMIN: admin@emanaleads.com / Admin@123456');
	console.log('   USER:  user@emanaleads.com  / User@123456');
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error('❌ Erro no seed:', e);
		await prisma.$disconnect();
		process.exit(1);
	});
