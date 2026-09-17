import { toJSONSchema, z } from 'zod';
import type { TranscriptAnalysis } from '$lib/types';

export const evidenceItemSchema = z.object({
	text: z.string(),
	evidence: z.array(z.string())
});

export const nextAgreedStepSchema = z.object({
	action: z.string().nullable(),
	responsible: z.string().nullable(),
	deadline: z.string().nullable(),
	deadlineRaw: z.string().nullable(),
	evidence: z.array(z.string())
});

export const nextMeetingSchema = z
	.object({
		dateTime: z.string().nullable(),
		dateTimeRaw: z.string().nullable(),
		timezone: z.string().nullable(),
		purpose: z.string().nullable(),
		evidence: z.array(z.string())
	})
	.nullable();

export const transcriptAnalysisSchema = z.object({
	conversationResult: z.string().nullable(),
	nextAgreedStep: nextAgreedStepSchema,
	nextMeeting: nextMeetingSchema,
	clientNeeds: z.array(evidenceItemSchema),
	risks: z.array(evidenceItemSchema),
	possibleManagerMistakes: z.array(evidenceItemSchema),
	managerAttention: z.array(evidenceItemSchema),
	uncertainties: z.array(z.string())
});

export type ParsedAnalysis = z.infer<typeof transcriptAnalysisSchema>;

export type AnalysisResult = z.infer<typeof transcriptAnalysisSchema>;

// Same schema as a plain JSON Schema for the model's structured-output request.
export const analysisJsonSchema = toJSONSchema(transcriptAnalysisSchema);

export function validateAnalysis(data: unknown): AnalysisResult {
	return transcriptAnalysisSchema.parse(data) as AnalysisResult;
}

export function isAnalysisShape(data: unknown): data is TranscriptAnalysis {
	return transcriptAnalysisSchema.safeParse(data).success;
}
