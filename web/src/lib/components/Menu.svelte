<script lang="ts">
  //@ts-nocheck
  import Folder from './subcomponents/Folder.svelte';
  import { commits } from '$lib/stores/contract';
  import Commit from './Commit.svelte';
  import CircleButton from './subcomponents/CircleButton.svelte';
  import { move, resizeX  } from '$lib/actions/layout'
  import Wallet from '$lib/components/Wallet.svelte';

  let innerWidth;

  let showMenu = true;

  let resizer = true;

  const breakpoint = () => {
    innerWidth >= 640? showMenu = true : showMenu = false;
  }

  export let offsetWidth;

</script>

<svelte:window on:resize={breakpoint} bind:innerWidth />

<!-- TODO: class:hide-menu={!showMenu} // or use action??? use:showmenu-->
{#if showMenu}
<section use:move use:resizeX bind:offsetWidth
  class='sm-min:max-w-[32rem] sm-min:min-w-[16rem] sm-max:w-full sm-min:w-64 relative h-screen select-none'
>
{#if innerWidth < 640}
<div class='absolute right-1 top-1 z-40'>
  <CircleButton func={() => {showMenu = false}} char='&#10005;' />
</div>
{/if}

<nav class:hide-resizer={!resizer}
  class='sm-min:bg-opacity-100 sm-max:bg-opacity-80'
>
  <div class='relative h-full'>
    <div class='flex flex-col m-4 overflow-x-scroll h-full pb-6 text-xl'>
    {#each $commits as {name, files}}
      <Folder {name} {files}/>
    {/each}
    </div>
  </div>
  <div class='footer text-lg'>
    <Commit />
    <Wallet />
  </div>
</nav>
</section>
{/if}
<div class='activator sm-min:hidden' 
on:click={() => {showMenu = true}}></div>

<style>
  .footer {
    @apply sticky bottom-0 rounded-br-2xl flex flex-row justify-evenly divide-x-2 border-t-2 border-slate-200 p-2 items-center w-full z-40;
  }
  .activator {
    @apply bg-repo bg-no-repeat bg-center bg-cover rounded-full w-20 h-20 bg-white border-8 z-20 drop-shadow-xl fixed left-10 bottom-10 cursor-pointer;
    background-size: 80%;
    filter: invert(1);
  }
  .activator:hover {
    @apply scale-[1.05] transition-transform duration-100;
  }
  nav {
    @apply rounded-tl-2xl rounded-br-2xl absolute overflow-hidden whitespace-nowrap m-auto left-4 right-4 top-[1em] bottom-[1em] bg-white shadow-xl z-30;
  }
</style>