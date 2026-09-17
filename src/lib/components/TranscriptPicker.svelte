<script lang="ts">
	import type { TranscriptMeta } from '$lib/types';

	interface Props {
		transcripts: TranscriptMeta[];
		selected: string | null;
		onselect: (slug: string) => void;
	}

	let { transcripts, selected, onselect }: Props = $props();
</script>

<ul class="picker">
	{#each transcripts as meta (meta.slug)}
		<li>
			<button
				class:selected={selected === meta.slug}
				type="button"
				onclick={() => onselect(meta.slug)}
			>
				<span class="name">{meta.title}</span>
				{#if meta.date}
					<span class="date">{meta.date}</span>
				{/if}
				<span class="excerpt">{meta.excerpt}</span>
			</button>
		</li>
	{/each}
</ul>

<style>
	.picker {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.6rem;
	}

	.picker button {
		text-align: left;
		width: 100%;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 0.7rem 0.9rem;
		cursor: pointer;
		font: inherit;
	}

	.picker button:hover {
		border-color: var(--accent);
		background: color-mix(in srgb, var(--accent-soft) 40%, var(--surface));
	}

	.picker button.selected {
		border-color: var(--accent);
		background: var(--accent-soft);
		box-shadow: inset 4px 0 0 var(--accent);
	}

	.name {
		display: block;
		font-size: 0.95rem;
		font-weight: 600;
		color: var(--text);
	}

	.date {
		display: inline-block;
		font-size: 0.8rem;
		color: var(--muted);
		margin-top: 0.1rem;
	}

	.excerpt {
		display: block;
		font-size: 0.8rem;
		color: var(--muted);
		margin-top: 0.35rem;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		overflow: hidden;
	}
</style>
