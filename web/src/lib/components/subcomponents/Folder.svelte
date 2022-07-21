<script lang="ts">
	//@ts-nocheck
	import File from './File.svelte';
	import { generateTab } from '../../stores/app';

	export let expanded = false;
	export let name;
	export let files;

	function toggle() {
		expanded = !expanded;
	}

</script>

<span class:expanded on:click={toggle}>{name}</span>

{#if expanded}
	<ul>
		{#each files as file}
			<li on:click={() => generateTab(file, name)}>
				{#if file.files[0].name}
					<svelte:self {...file}/>
				{:else}
					<File {...file}/>
				{/if}
			</li>
		{/each}
	</ul>
{/if}

<style>
	span {
		padding: 0 0 0 1.5em;
		margin: 0.2em 0;
		background: url(@vscode/codicons/src/icons/repo.svg) 0 0.1em no-repeat;
		background-size: 1em 1em;
		line-height: 1em;
		font-weight: bold;
		cursor: pointer;
	}

	.expanded {
		background-image: url(@vscode/codicons/src/icons/repo-pull.svg);
	}

	ul {
		padding: 0.2em 0 0 0.5em;
		margin: 0 0 0 0.5em;
		list-style: none;
		border-left: 1px solid #eee;
	}

	li {
		padding: 0.1em 0;
	}
</style>