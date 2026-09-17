import type { AnalysisResult } from '../schema';
import type { AnalysisInput } from '../prompts';

export class AnalysisConfigError extends Error {}
export class AnalysisProviderError extends Error {}
export class AnalysisInvalidError extends Error {}

export interface TranscriptAnalyzer {
	analyze(input: AnalysisInput): Promise<AnalysisResult>;
}

// Single error surface used by the HTTP endpoint, so callers never see provider internals.
export function classifyError(err: unknown): { status: number; message: string } {
	if (err instanceof AnalysisConfigError) {
		return { status: 500, message: err.message };
	}
	if (err instanceof AnalysisInvalidError) {
		return {
			status: 502,
			message: 'The model returned data that did not match the required format.'
		};
	}
	if (err instanceof AnalysisProviderError) {
		return { status: 502, message: `The analysis provider failed: ${err.message}` };
	}
	const fallback = err instanceof Error ? err.message : 'Unknown error.';
	return { status: 500, message: `Unexpected error: ${fallback}` };
}
