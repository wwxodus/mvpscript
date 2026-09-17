export interface TranscriptMeta {
	slug: string;
	title: string;
	date: string | null;
	participants: string | null;
	excerpt: string;
	chars: number;
}

export interface EvidenceItem {
	text: string;
	evidence: string[];
}

export interface NextAgreedStep {
	action: string | null;
	responsible: string | null;
	deadline: string | null;
	deadlineRaw: string | null;
	evidence: string[];
}

export interface NextMeeting {
	dateTime: string | null;
	dateTimeRaw: string | null;
	timezone: string | null;
	purpose: string | null;
	evidence: string[];
}

export interface TranscriptAnalysis {
	conversationResult: string | null;
	nextAgreedStep: NextAgreedStep;
	nextMeeting: NextMeeting | null;
	clientNeeds: EvidenceItem[];
	risks: EvidenceItem[];
	possibleManagerMistakes: EvidenceItem[];
	managerAttention: EvidenceItem[];
	uncertainties: string[];
}
