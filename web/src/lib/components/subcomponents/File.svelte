<script lang="ts">
	//@ts-nocheck
	export let name;
</script>

<span>{name}</span>

<style>
	span {
		padding: 0 0 0 1.5em;
		background: url(@vscode/codicons/src/icons/package.svg) 0 0.1em no-repeat;
		background-size: 1em 1em;
		cursor: pointer;
	}
</style>
