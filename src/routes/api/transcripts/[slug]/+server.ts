import { error, json } from '@sveltejs/kit';
import { getTranscript } from '$lib/server/transcripts';

export function GET({ params }) {
	const found = getTranscript(params.slug);
	if (!found) return error(404, 'Transcript not found.');
	return json({ meta: found.meta, content: found.content });
}
