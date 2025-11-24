import { stringify } from 'csv-stringify/sync';
import { LeadStatus } from '@prisma/client';

// Tradução de status de lead para português
const STATUS_LABELS: Record<LeadStatus, string> = {
	PRIMEIRO_CONTATO: 'Primeiro Contato',
	REUNIAO: 'Reunião',
	PROPOSTA_ENVIADA: 'Proposta Enviada',
	ANALISE_PROPOSTA: 'Análise Proposta',
	FECHADO_GANHO: 'Fechado Ganho',
	FECHADO_PERDIDO: 'Fechado Perdido',
};

type LeadForExport = {
	id: string;
	name: string;
	email: string | null;
	phone: string | null;
	position: string | null;
	requestType: string | null;
	status: LeadStatus;
	createdAt: Date;
	updatedAt: Date;
	project: { name: string };
	assignedUser: { name: string } | null;
};

/**
 * Formata data para padrão brasileiro DD/MM/YYYY HH:mm
 */
function formatDateBR(date: Date): string {
	const day = String(date.getDate()).padStart(2, '0');
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const year = date.getFullYear();
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * Substitui valores nulos/undefined por "N/A"
 */
function formatValue(value: any): string {
	if (value === null || value === undefined) return 'N/A';
	return String(value);
}

/**
 * Gera CSV de leads com BOM UTF-8, headers em português, datas brasileiras e status traduzidos
 */
export function generateLeadCSV(leads: LeadForExport[]): string {
	const records = leads.map((lead) => ({
		Nome: formatValue(lead.name),
		Email: formatValue(lead.email),
		Telefone: formatValue(lead.phone),
		Cargo: formatValue(lead.position),
		'Tipo de Solicitação': formatValue(lead.requestType),
		Status: STATUS_LABELS[lead.status],
		Projeto: formatValue(lead.project.name),
		'Usuário Atribuído': formatValue(lead.assignedUser?.name),
		'Data de Criação': formatDateBR(lead.createdAt),
		'Data de Atualização': formatDateBR(lead.updatedAt),
	}));

	const csv = stringify(records, {
		header: true,
		columns: ['Nome', 'Email', 'Telefone', 'Cargo', 'Tipo de Solicitação', 'Status', 'Projeto', 'Usuário Atribuído', 'Data de Criação', 'Data de Atualização'],
		quoted: true,
		quoted_empty: true,
		record_delimiter: 'windows', // \r\n para compatibilidade com Excel no Windows
	});

	// Adiciona BOM UTF-8 para garantir que Excel abra corretamente caracteres acentuados
	return '\uFEFF' + csv;
}
