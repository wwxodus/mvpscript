import { json } from '@sveltejs/kit';
import { listTranscripts } from '$lib/server/transcripts';

export function GET() {
	return json({ transcripts: listTranscripts() });
}
