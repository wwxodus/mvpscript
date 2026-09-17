import { OPENROUTER_API_KEY, OPENROUTER_MODEL } from '$env/static/private';
import type { TranscriptAnalyzer } from './adapter';
import { AnalysisConfigError } from './adapter';
import { OpenRouterAnalyzer } from './openrouter';

export function getAnalyzer(): TranscriptAnalyzer {
	if (!OPENROUTER_API_KEY) throw new AnalysisConfigError('OPENROUTER_API_KEY is not set');
	if (!OPENROUTER_MODEL) throw new AnalysisConfigError('OPENROUTER_MODEL is not set');
	return new OpenRouterAnalyzer(OPENROUTER_API_KEY, OPENROUTER_MODEL);
}
