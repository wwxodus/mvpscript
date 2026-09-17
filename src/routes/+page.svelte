<script lang="ts">
	import { onMount } from 'svelte';
	import type { TranscriptAnalysis, TranscriptMeta } from '$lib/types';
	import TranscriptPicker from '$lib/components/TranscriptPicker.svelte';
	import TranscriptPreview from '$lib/components/TranscriptPreview.svelte';

	let transcripts: TranscriptMeta[] = $state([]);
	let transLoaded = $state(false);
	let loadError: string | null = $state(null);
	let selected: string | null = $state(null);
	let fixture: { meta: TranscriptMeta; content: string } | null = $state(null);
	let analysis: TranscriptAnalysis | null = $state(null);
	let loading = $state(false);
	let error: string | null = $state(null);

	async function init(): Promise<void> {
		try {
			const res = await fetch('/api/transcripts');
			if (!res.ok) throw new Error();
			const data = await res.json();
			transcripts = data.transcripts as TranscriptMeta[];
		} catch {
			loadError = 'Не удалось загрузить список примеров.';
		} finally {
			transLoaded = true;
		}
	}

	onMount(init);

	function hasText(): boolean {
		return (fixture?.content ?? '').trim().length >= 20;
	}

	async function select(slug: string): Promise<void> {
		if (loading) return;
		selected = slug;
		analysis = null;
		error = null;
		try {
			const res = await fetch(`/api/transcripts/${encodeURIComponent(slug)}`);
			if (!res.ok) throw new Error();
			fixture = await res.json();
		} catch {
			error = 'Не удалось загрузить стенограмму.';
		}
	}

	async function runAnalysis(): Promise<void> {
		if (!hasText() || loading) return;
		loading = true;
		error = null;
		analysis = null;
		try {
			const res = await fetch('/api/analyze', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					transcript: fixture?.content ?? '',
					conversationDate: fixture?.meta.date ?? null
				})
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data?.message ?? 'Что-то пошло не так.');
			analysis = data.analysis as TranscriptAnalysis;
		} catch (cause) {
			error = cause instanceof Error ? cause.message : 'Что-то пошло не так.';
		} finally {
			loading = false;
		}
	}
</script>

<div class="layout">
	<aside class="sidebar">
		<h2>Стенограммы</h2>
		{#if loadError}
			<p class="load-note">{loadError}</p>
		{:else if !transLoaded}
			<p class="load-note">Загрузка…</p>
		{:else}
			<TranscriptPicker {transcripts} {selected} onselect={select} />
		{/if}
	</aside>

	<main class="content">
		<header class="intro">
			<h1>Анализ переговоров</h1>
			<p>
				Выберите стенограмму слева — здесь появится её текст, результат анализа будет выведен в виде
				JSON.
			</p>
		</header>

		{#if fixture}
			<section class="meta">
				<h2>{fixture.meta.title}</h2>
				{#if fixture.meta.date}
					<p class="date">{fixture.meta.date}</p>
				{/if}
				{#if fixture.meta.participants}
					<p class="participants">{fixture.meta.participants}</p>
				{/if}
			</section>

			<TranscriptPreview meta={fixture.meta} content={fixture.content} visible={true} />

			<div class="actions">
				<button class="analyze" type="button" disabled={loading} onclick={runAnalysis}>
					Проанализировать
				</button>
				{#if loading}
					<div class="progress" role="status" aria-live="polite">
						<span class="spinner" aria-hidden="true"></span>
						<span>Анализируем стенограмму… обычно до минуты.</span>
					</div>
				{/if}
			</div>

			{#if error}
				<div class="error" role="alert">{error}</div>
			{/if}

			{#if analysis}
				<section class="result">
					<h2>Результат (JSON)</h2>
					<pre class="json">{JSON.stringify(analysis, null, 2).replace('</', '<\\/')}</pre>
				</section>
			{/if}
		{:else}
			<p class="empty">Выберите стенограмму из списка слева.</p>
		{/if}
	</main>
</div>

<style>
	.layout {
		display: grid;
		grid-template-columns: minmax(15rem, 20rem) 1fr;
		gap: 2rem;
		max-width: 1080px;
		margin: 0 auto;
		padding: 2.5rem 1.25rem;
	}

	@media (max-width: 760px) {
		.layout {
			grid-template-columns: 1fr;
		}
	}

	.sidebar h2 {
		font-size: 0.95rem;
		font-weight: 600;
		margin: 0 0 0.75rem;
	}

	.sidebar .load-note {
		font-size: 0.9rem;
		color: var(--muted);
		margin: 0.25rem 0 0;
	}

	.content .intro h1 {
		font-size: 1.4rem;
		margin: 0 0 0.4rem;
	}

	.content .intro p {
		margin: 0;
		color: var(--muted);
		font-size: 0.92rem;
	}

	.meta {
		margin-top: 1.5rem;
	}

	.meta h2 {
		font-size: 1.05rem;
		margin: 0 0 0.25rem;
	}

	.meta .date,
	.participants {
		margin: 0;
		font-size: 0.85rem;
		color: var(--muted);
	}

	.actions {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-top: 1.25rem;
		flex-wrap: wrap;
	}

	.analyze {
		font: inherit;
		font-size: 1rem;
		font-weight: 600;
		padding: 0.7rem 1.6rem;
		border-radius: var(--radius);
		border: none;
		background: var(--accent);
		color: #fff;
		cursor: pointer;
	}

	.analyze:hover:not(:disabled) {
		background: var(--accent-hover);
	}

	.analyze:disabled {
		opacity: 0.55;
		cursor: not-allowed;
	}

	.progress {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		font-size: 0.85rem;
		color: var(--muted);
	}

	.spinner {
		width: 1rem;
		height: 1rem;
		border: 2px solid var(--border);
		border-top-color: var(--accent);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	.error {
		margin-top: 1rem;
		background: color-mix(in srgb, #fdecec 60%, var(--surface));
		border: 1px solid #eab3b3;
		border-radius: var(--radius);
		padding: 0.75rem 1rem;
		color: var(--danger);
		font-size: 0.9rem;
	}

	.result h2 {
		font-size: 0.95rem;
		font-weight: 600;
		margin: 1.25rem 0 0.5rem;
	}

	.json {
		font-family: var(--mono);
		font-size: 0.78rem;
		line-height: 1.55;
		white-space: pre-wrap;
		word-break: break-word;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 1rem 1.25rem;
		max-height: 32rem;
		overflow: auto;
		color: #2c303a;
	}

	.empty {
		margin-top: 2rem;
		color: var(--muted);
		font-size: 0.95rem;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
</style>
