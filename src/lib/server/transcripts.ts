import path from 'node:path';
import type { TranscriptMeta } from '$lib/types';

// Emitted at build time by Vite so the .txt files are bundled into the deployment.
const FILES = import.meta.glob('../../../transcripts/*.txt', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

// Human labels so fixtures show clear names; falls back to the file slug otherwise.
const TITLES: Record<string, string> = {
	first: 'Техническая встреча и пилот',
	second: 'Маркировка товаров',
	third: 'CRM и контроль продаж',
	fourth: 'Отложенная миграция'
};

export interface TranscriptRecord {
	meta: TranscriptMeta;
	content: string;
}

function slugFromKey(key: string): string {
	return path.basename(key).replace(/\.txt$/, '');
}

function parseMeta(content: string): Pick<TranscriptMeta, 'date' | 'participants'> {
	const dateMatch = content.match(/Дата разговора:\s*(.+)/);
	const partMatch = content.match(/Участники:\s*(.+)/);
	return {
		date: dateMatch?.[1].trim() ?? null,
		participants: partMatch?.[1].trim() ?? null
	};
}

export function excerptOf(content: string, limit = 180): string {
	const body = content
		.replace(/Дата разговора:.*?\n/m, '')
		.replace(/Участники:.*?\n/m, '')
		.trim();
	const normalized = body.replace(/\s+/g, ' ');
	return normalized.length > limit ? `${normalized.slice(0, limit).trimEnd()}…` : normalized;
}

function buildRecord(key: string, content: string): TranscriptRecord {
	const slug = slugFromKey(key);
	const { date, participants } = parseMeta(content);
	return {
		meta: {
			slug,
			title: TITLES[slug] ?? slug,
			date,
			participants,
			excerpt: excerptOf(content),
			chars: content.length
		},
		content
	};
}

function records(): TranscriptRecord[] {
	return Object.entries(FILES)
		.map(([key, content]) => buildRecord(key, content))
		.sort((a, b) => a.meta.slug.localeCompare(b.meta.slug));
}

export function listTranscripts(): TranscriptMeta[] {
	return records().map((record) => record.meta);
}

export function getTranscript(slug: string): TranscriptRecord | null {
	return records().find((record) => record.meta.slug === slug) ?? null;
}
