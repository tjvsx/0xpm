<script lang="ts">

  import { clickOutside } from '$lib/actions/layout'
  import { onMount, onDestroy } from 'svelte';
  import CircleButton from './subcomponents/CircleButton.svelte';

  export let onClose;
  export let error;

  onMount(() => {
    // animate wiggle
  })

  onDestroy(() => {
    console.log('error component destroyed...')
  })
</script>

<div class="box" use:clickOutside on:outclick={onClose}>
  <div class='absolute right-[-0.7em] top-[-0.7em] z-50'>
    <CircleButton func={onClose} char='&#10005;' />
  </div>
  <div class='w-96 h-full text-red-600 p-5 text-center'>
    <h3>ERROR</h3>
    {#if error.data}
      <p>{error.data.message}</p>
    {:else if error.message}
      <p>{error.message}</p>
    {:else}
      <p>Uncaught error</p>
    {/if}
  </div>
</div>

<style>
  .box {
    @apply fixed left-1/4 top-1/4 bg-slate-100 border-2 border-red-600 rounded-2xl shadow-2xl z-50;
  }
</style>
