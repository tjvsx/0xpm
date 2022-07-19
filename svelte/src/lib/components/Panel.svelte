<script>
  import { tabs, margins, remove, navigate } from '$lib/stores/app';
  import { ethers } from 'ethers';
  import INSTALLER_ABI from '$lib/abis/installer.json';
  import { ipfs } from "$lib/stores/ipfs";
  import { getMetadataFromAddress, isAddress, getFunctionsNamesSelectorsFromFacet, getFacetData } from "$lib/actions/utils";
  import Clipboard from "./subcomponents/Clipboard.svelte";
  import { addPkg, updatePkg } from "$lib/stores/app";
  import {
		accountChainId,
		accountProvider,
		connected,
		walletAddress,
		networkProviders
	} from '$lib/stores/provider';

  export let tab;

  async function getUpgrade(address) {
    const provider = new ethers.providers.Web3Provider($accountProvider);
    const instance = new ethers.Contract(address, INSTALLER_ABI, provider);
    return await instance.get();
  }

</script>
  
<main>
  <div class='w-full h-8'>
    <div class='bar'>
      <div class='text-white font-extrabold' on:click={() => {remove(tab)}}>&#10005;</div>
      <div class='truncate' on:click={() => {navigate(tab)}}>{tab.name} ~ {tab.owner}</div>
    </div>
    <div class='h-[1px] mt-[-1px] w-full bg-white absolute border-l-2 border-black'></div>
  </div>
  <div id="window" class:selected="{$tabs.at(-1) === tab}">
    <div class='mb-36'>
      {#if isAddress(tab.files.at(-1))}
      <section>
        <div class='flex justify-between flex-wrap'>
          <h1>{tab.name}</h1>
          <button on:click={()=>addPkg(tab)}> &#43; Add </button>
        </div>
        <div class='flex flex-col gap-2'>
          <h2>Owner</h2>
          <Clipboard text={tab.owner} let:copy>{tab.owner}</Clipboard>
        </div>
      </section>
      {#await getUpgrade(tab.files.at(-1))}
      <section>Loading...</section>
      {:then cuts}
      <section>
        <h2 class='pb-3'>Facets</h2>
          {#each cuts[0] as cut}
            <div class='border-t-2 py-3 flex flex-col gap-2'>
              {#await getFacetData(cut)}
                <Clipboard text={cut[0]} let:copy >{cut[0]} </Clipboard>
                <h5>Functions</h5>
                  {#each cut[2] as selector}
                    <div>{selector}</div>
                  {/each}
              {:then {name, funcs, abi, natspec}}
                <h3>{name}</h3>
                <Clipboard text={cut[0]} let:copy >{cut[0]} </Clipboard>
                <h5>Functions</h5>
                {#each funcs as func} 
                  <div>{func.name}</div>
                {/each}
                <h5>Metadata</h5>
                <div class='bg-slate-200 overflow-scroll rounded-2xl p-5 flex flex-col gap-2'>
                  <p><b>abi:</b> {JSON.stringify(abi)}</p>
                  <p><b>devdoc:</b> {JSON.stringify(natspec)}</p>
                </div>
              {/await}
            </div>
        {/each}
      </section>
      <section class='border-t-2 pt-3'>
        <h2>Initializer</h2>
        <h4>Address: {cuts[1]}</h4>
        <h4>Function: {cuts[2]}</h4>

      </section>
      {:catch error}
      <section><p style="color: red">{error.message}</p></section>
      {/await}
        <!-- <div>Source code: trying sourcify..., trying etherscan...</div> -->
      {/if} 
    </div>
  </div>
</main>
  
  
<style>
  section {
    @apply m-3;
  }
  main {
    @apply h-full w-full;
  }
  #window {
    @apply relative h-full border-l-black border-l-2 min-h-screen overflow-y-scroll hidden bg-white bg-opacity-80;
  }
  .selected {
    /* @apply block; */
    display:block !important;
  }
  .bar {
    @apply rounded-tl-2xl text-lg bg-black flex gap-3 items-center text-white overflow-x-hidden whitespace-nowrap cursor-pointer pl-3 p-2 w-full h-full;
  }
</style>