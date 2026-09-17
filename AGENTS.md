## Project Configuration

- **Language**: TypeScript
- **Package Manager**: bun
- **Add-ons**: eslint, prettier, sveltekit-adapter

---

# AGENTS.md

## Project Context

Build a minimal AI-powered transcript analyzer for a B2B Saby integrator.

The product is **not** a client-facing chatbot and does not contact customers. It accepts a sales-call transcript and returns structured, evidence-based data suitable for a CRM, manager review, or later automation.

## Core Flow

1. User submits one transcript as plain text.
2. Backend sends it to an LLM with a strict extraction prompt and JSON Schema.
3. LLM extracts only information explicitly supported by the transcript.
4. App renders and/or returns validated structured JSON.

Input may include:

- Conversation date
- Participants and roles
- Natural-language dates, times, deadlines, and time zones
- Incomplete, ambiguous, or conflicting statements

## Required Output

For every transcript, return:

```ts
type TranscriptAnalysis = {
	conversationResult: string | null;
	nextAgreedStep: {
		action: string | null;
		responsible: string | null;
		deadline: string | null; // ISO-8601 if unambiguous; otherwise null
		deadlineRaw: string | null;
		evidence: string[];
	};
	nextMeeting: {
		dateTime: string | null; // ISO-8601 only if resolvable
		dateTimeRaw: string | null;
		timezone: string | null;
		purpose: string | null;
		evidence: string[];
	} | null;
	clientNeeds: EvidenceItem[];
	risks: EvidenceItem[];
	possibleManagerMistakes: EvidenceItem[];
	managerAttention: EvidenceItem[];
	uncertainties: string[];
};

type EvidenceItem = {
	text: string;
	evidence: string[];
};
```

Use `null`, empty arrays, and explicit `uncertainties` when data is absent or unclear.

## Extraction Rules

- Extract facts only from the transcript.
- Never invent dates, participants, commitments, budgets, integrations, technical capabilities, or decision-makers.
- Distinguish:
  - agreed action;
  - client request;
  - manager promise;
  - conditional future action;
  - unconfirmed assumption.
- Treat phrases such as “if confirmed,” “maybe,” “I will clarify,” and “can discuss later” as conditional, not final agreements.
- Preserve raw date/time text in `deadlineRaw` and `dateTimeRaw`.
- Populate ISO-8601 fields only when the date/time is unambiguous relative to the conversation date.
- Preserve the stated timezone; do not silently convert it.
- Every material extraction must include one or more short transcript quotations in `evidence`.
- State uncertainty explicitly instead of guessing.

## MVP Scope

Required:

- Text input for a transcript.
- `POST /analyze` endpoint or equivalent server action.
- LLM call using structured output / JSON Schema.
- Runtime validation of the model response.
- JSON response and a minimal readable result view.
- Error handling for invalid input, LLM failure, and invalid model output.
- Fixtures for the four supplied transcripts.

Not required:

- Authentication.
- Database or persistence.
- CRM integration.
- Background jobs.
- Customer messaging or call automation.
- Production infrastructure.
- Complex UI.

## Stack

- SvelteKit
- @openrouter/sdk
- Bun runtime and package manager
- Prefer small, dependency-light modules.
- Use a schema validator such as Zod for runtime validation.
- Keep LLM provider code isolated behind a small adapter interface.

## LLM Prompt Requirements

The system prompt must:

- Define the extractor role.
- Include the required output schema.
- Require JSON only.
- Require evidence for all substantive fields.
- Forbid fabrication.
- Require explicit uncertainty handling.
- Instruct the model to return `null` or `[]` when information is unavailable.

Pass the transcript date separately when available so relative dates can be resolved safely.

## Validation and Tests

Test the supplied fixtures for:

- Technical meeting date, time, timezone, and prerequisites.
- Conditional pilot decision after technical feasibility confirmation.
- Deadline commitments made by the manager.
- Client budget constraints and approval roles.
- Privacy, security, cloud, NDA, and legal restrictions.
- Explicit “do not contact” constraints.
- Deferred opportunities and follow-up timing.
- Ambiguous or unavailable dates represented as `null` plus `uncertainties`.
- No fabricated commitments or dates.

## Known Limitations

- LLM extraction can miss nuance or misclassify intent.
- Relative dates require a reliable conversation date.
- Timezone resolution may be ambiguous.
- Evidence reduces hallucination risk but does not eliminate it.
- The MVP analyzes one transcript at a time and does not retain context across calls.

## Next Iteration

- Confidence per field.
- Highlight source spans in the UI.
- Batch transcript analysis.
- Human review and correction workflow.
- Export to CRM-compatible formats.
- Analytics for recurring objections, risks, and manager coaching.
- Evaluation dataset with expected JSON and regression tests.
