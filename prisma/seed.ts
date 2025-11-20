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
		where: { id: '00000000-0000-0000-0000-000000000001' },
		update: {},
		create: {
			id: '00000000-0000-0000-0000-000000000001',
			name: 'Projeto Demo',
			description: 'Projeto de demonstração para testes',
			status: 'ACTIVE',
			adminId: admin.id,
		},
	});
	console.log('✓ Projeto criado:', project.name);

	// Adicionar user como membro do projeto
	await prisma.projectMember.create({
        data: {
            projectId: project.id,
            userId: user.id,
        }
    })
	console.log('✓ Usuário adicionado ao projeto');

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
