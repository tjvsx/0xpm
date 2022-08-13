<script lang="ts">
	import { onMount } from 'svelte';
  import { connected, accountChainId } from '$lib/stores/provider';
  import { start } from '../lib/stores/ipfs'
  import { populate } from '$lib/stores/contract';
	import Menu from "$lib/components/Menu.svelte";
	import Main from "$lib/components/Main.svelte";
  import Profile from '$lib/components/Profile.svelte';
  import Background from '$lib/components/Background.svelte';
  import Wallet from '$lib/components/Wallet.svelte';
  import Notifications from 'svelte-notifications';

	onMount(async () => {
    await start();
    await populate();
	});

  let width: number;
	let left: number;
	$: right = width <= 639? `width:100vw;` : `width:calc(100vw - ${left}px);`

  $: $accountChainId, populate();

</script>

<svelte:head>
	<title>0xpm</title>
</svelte:head>


<Background />
{#if $connected && $accountChainId.supportedNetwork}
<Notifications>
    <main bind:offsetWidth={width}>
        <Menu bind:offsetWidth={left}/>
      <section style="{right}">
        <div class='mt-4'>
          <Main/>
        </div>
      </section>
    </main>
    <Profile />
</Notifications>
{:else}
<Wallet />
{/if}

<style>
	section { @apply absolute right-0 top-0 bottom-0 h-screen overflow-auto; }
	main { @apply h-screen; }
</style>