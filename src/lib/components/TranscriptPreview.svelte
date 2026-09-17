<script lang="ts">
	import type { TranscriptMeta } from '$lib/types';

	interface Props {
		meta: TranscriptMeta | null;
		content: string;
		visible: boolean;
	}

	let { meta, content, visible }: Props = $props();
</script>

{#if visible}
	<article class="preview">
		<header>
			<h3>{meta?.title ?? 'Свой текст'}</h3>
			{#if meta?.date}
				<p class="date">{meta.date}</p>
			{/if}
		</header>
		<pre>{content}</pre>
	</article>
{/if}

<style>
	.preview {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		display: grid;
		grid-template-rows: auto 1fr;
		max-height: 22rem;
		overflow: hidden;
	}

	header {
		padding: 0.6rem 1rem;
		border-bottom: 1px solid var(--border);
	}

	header h3 {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
	}

	.date {
		margin: 0.15rem 0 0;
		font-size: 0.8rem;
		color: var(--muted);
	}

	pre {
		font-family: var(--mono);
		font-size: 0.82rem;
		line-height: 1.5;
		padding: 0.75rem 1rem;
		margin: 0;
		white-space: pre-wrap;
		overflow-y: auto;
		color: var(--text);
		background: color-mix(in srgb, var(--bg) 50%, var(--surface));
		border-top: 1px solid var(--border);
	}
</style>
