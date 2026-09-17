import { OpenRouter } from '@openrouter/sdk';
import type { TranscriptAnalyzer } from './adapter';
import { AnalysisConfigError, AnalysisInvalidError, AnalysisProviderError } from './adapter';
import { buildUserPrompt, SYSTEM_PROMPT, type AnalysisInput } from '../prompts';
import { analysisJsonSchema, validateAnalysis, type AnalysisResult } from '../schema';

// Strips code fences and leading "json" labels some models add despite instructions.
function extractJson(text: string): string {
	const trimmed = text.trim();
	const fence = /```(?:json)?\s*([\s\S]*?)```/;
	const match = trimmed.match(fence);
	return match ? match[1].trim() : trimmed;
}

export class OpenRouterAnalyzer implements TranscriptAnalyzer {
	private client: OpenRouter;
	private model: string;

	constructor(apiKey: string, model: string) {
		this.client = new OpenRouter({ apiKey });
		this.model = model;
	}

	async analyze(input: AnalysisInput): Promise<AnalysisResult> {
		try {
			const response = (await this.client.chat.send({
				chatRequest: {
					model: this.model,
					temperature: 0,
					messages: [
						{ role: 'system', content: SYSTEM_PROMPT },
						{ role: 'user', content: buildUserPrompt(input) }
					],
					responseFormat: {
						type: 'json_schema',
						jsonSchema: {
							name: 'transcript_analysis',
							strict: true,
							schema: analysisJsonSchema as Record<string, unknown>
						}
					}
				}
			})) as { choices: { message: { content: unknown } }[] };

			const raw = response.choices?.[0]?.message?.content;
			let data: unknown;
			try {
				data = typeof raw === 'string' ? JSON.parse(extractJson(raw)) : raw;
			} catch {
				throw new AnalysisInvalidError('model returned non-JSON content');
			}
			return validateAnalysis(data) as AnalysisResult;
		} catch (cause) {
			if (cause instanceof AnalysisInvalidError) throw cause;
			if (cause instanceof AnalysisConfigError) throw cause;
			if (cause instanceof AnalysisProviderError) throw cause;
			throw new AnalysisProviderError(
				cause instanceof Error ? cause.message : 'provider request failed'
			);
		}
	}
}
