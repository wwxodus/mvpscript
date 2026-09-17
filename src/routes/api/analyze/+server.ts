import { error, json } from '@sveltejs/kit';
import { z } from 'zod';
import { classifyError } from '$lib/server/llm/adapter';
import { getAnalyzer } from '$lib/server/llm';

const requestSchema = z.object({
	transcript: z.string().min(20, 'Transcript is too short to analyze'),
	conversationDate: z.string().nullable().optional()
});

export async function POST({ request }) {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return error(400, 'Request body must be valid JSON.');
	}

	const parsed = requestSchema.safeParse(body);
	if (!parsed.success) {
		const first = parsed.error.issues[0];
		return error(400, first?.message ?? 'Invalid request.');
	}

	try {
		const analyzer = getAnalyzer();
		const analysis = await analyzer.analyze({
			transcript: parsed.data.transcript,
			conversationDate: parsed.data.conversationDate ?? null
		});
		return json({ analysis });
	} catch (cause) {
		const { status, message } = classifyError(cause);
		return error(status, message);
	}
}
