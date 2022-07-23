<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { ethers } from 'ethers';
  import { ipfs } from '$lib/stores/ipfs';
  import { populate } from '$lib/stores/contract';
	import Menu from "$lib/components/Menu.svelte";
	import Main from "$lib/components/Main.svelte";
  import Profile from '$lib/components/Profile.svelte';
  import Background from '$lib/components/Background.svelte';
  import { connected, accountChainId } from '$lib/stores/provider';
  import Wallet from '$lib/components/Wallet.svelte';
  import { create } from 'ipfs-client';
  import Notifications from 'svelte-notifications';

	onMount(async () => {

    if (!$ipfs) {
      $ipfs = create({
        http: 'https://ipfs.infura.io:5001/api/v0'
      })
      console.log('ipfs using client...')
      // const IPFSmodule = await import('../modules/ipfs-core/ipfs-core.js');
      // const IPFS = IPFSmodule.default;
      // $ipfs = await IPFS.create();  /// TODO: set timeout?? -- does this need a local ipfs node running
      // console.log('ipfs client overridden...')
      // console.log(globalThis)
    } else {
      console.info('already initiated', $ipfs)
    }

    await populate();

    // const provider = new ethers.providers.Web3Provider(globalThis.ethereum);
    // provider.on('block', async (blockNumber) => {
    //   console.log('block', blockNumber)
    // });
    // provider.on("error", (tx) => {
    //   console.log('tx error', tx)
    // });

	});

  // onDestroy(async() => {
  //   if ($ipfs) {
  //     console.info('the ipfs node is being stopped');
  //     //@ts-ignore
  //     $ipfs.stop();
  //     globalThis.ipfsNode = null;
  //   }
  // })

  let width: number;
	let w: number;
	$: right = width <= 639? `width:100vw;` : `width:calc(100vw - ${w + 20}px);`

  $: $accountChainId, populate();

</script>

<svelte:head>
	<title>0xpm</title>
</svelte:head>


<Background />
{#if $connected && $accountChainId.chainId === 5}
<Notifications>
    <main bind:offsetWidth={width}>
        <Menu bind:offsetWidth={w}/>
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