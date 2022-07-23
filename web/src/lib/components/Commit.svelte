<script lang="ts">
  //@ts-nocheck
  import { ethers } from 'ethers';
  import { contract } from '$lib/stores/contract';

  import { clickOutside } from '$lib/actions/layout'
  import { 
    getMetadataFromAddress, 
    isAddress, 
    createAddFacetCut } from "$lib/actions/utils";
  import {
		accountProvider,
	} from '$lib/stores/provider';
  import CircleButton from './subcomponents/CircleButton.svelte';
  import { getNotificationsContext } from 'svelte-notifications';
  const { addNotification } = getNotificationsContext();

  let showModal = false;

	let facets = [];
	function add() {
		facets = facets.concat({ address: '' });
	}
  function remove(facet) {
		facets.pop(facet);
    facets = facets;
	}
  let upgrade = {
    name: '',
    cuts: [],
    initAddr: '0x0000000000000000000000000000000000000000',
    initFunc: '0x',
    uri: ''
  }

  const handleError = (error) => {
    addNotification({
      position: 'bottom-center',
      text: error.data.message? 
      error.data.message.replace('VM Exception while processing transaction: revert','[TX REVERT]') 
      : error.message,
      type: 'danger',
      removeAfter: 4000,
    })
  }

  async function generateContract(address, provider) {
    const {name, abi} = await getMetadataFromAddress(address);
    // if no result, error to user - verify with gemcutter or sourcify!
    return new ethers.Contract(address, abi, provider);
  }

  async function submit() {
    // TODO: disallow removing and disallow conflicting selectors for core contracts in NETMAP
    const provider = new ethers.providers.Web3Provider($accountProvider);
    let contracts = []
    for (let facet of facets) {
      const contract = await generateContract(facet.address, provider);
      contracts.push(contract)
    }
    upgrade.cuts = createAddFacetCut(contracts);
    const signer = provider.getSigner()
    try { await $contract.connect(signer).commit(upgrade.name, upgrade.cuts, upgrade.initAddr, upgrade.initFunc) }
    catch (error) {
      handleError(error)
    }
  }

</script>

<div class='menu-link' on:click={() => showModal = true}>Commit</div>


{#if showModal}
	<div class="box sm-max:h-[95%] sm-min:h-[70%] sm-max:w-[92%] sm-min:w-[35rem]" use:clickOutside on:outclick={() => (showModal = false)}>
    <div class='absolute right-[-0.75em] top-[-0.75em] z-50'>
      <CircleButton func={() => {showModal = false}} char='&#10005;' />
    </div>
    <div class='relative w-full h-full overflow-y-scroll'>
      <div class='absolute w-full h-full'>
        <section>
          <input class='h-10 w-64' placeholder="repository name" bind:value={upgrade.name}/>
        </section>
        <section>
          <span>Facets:</span>
          {#each facets as facet}
            <div class='py-1 flex flex-row flex-nowrap gap-2 items-center'>
              <input
                placeholder="facet address"
                bind:value={facet.address}
              >
              <CircleButton func={() => remove(facet)} char='&#10005;' />

            </div>
          {/each}

          <CircleButton func={add} char='&#65291;' />
        </section>

        <section class='flex flex-wrap gap-2'>
          <span>Initializer:</span>
          <input class='flex-grow' placeholder="address" bind:value={upgrade.initAddr}/>
          <input placeholder="function selector" bind:value={upgrade.initFunc}/>
        </section>

        <!-- <section>
          <input class='w-72' placeholder="component URL" bind:value={upgrade.uri}/>
        </section> -->
        <!-- TODO: COMMIT FROM DIAMOND - add <select> diamond
          // if diamond is not owned by itself, require msg.sender owns diamond
          
        -->
      </div>
    </div>
    <div class='h-14 w-full flex justify-between bg-slate-200 p-2 rounded-b-2xl items-center'>
      {#if upgrade.name === ''}
        <p class='text-red-600'>A repository name is required.</p>
      {:else if (facets.length === 0 || !isAddress(facets[0].address))}
        <p class='text-red-600'>At least 1 implementation contract, or 'facet' is required</p>
      {:else}
      <p>{facets.length} {facets.length === 1? 'facet' : 'facets'} will be added to {upgrade.name}</p>
      <button on:click={submit}>Submit</button>
      {/if}
    </div>
	</div>
{/if}

<style>
  .box {
    @apply fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-100 rounded-2xl z-50 flex flex-col justify-between gap-5 shadow-2xl;
  }
  span {
    @apply font-bold text-lg w-full;
  }
  button {
    @apply p-1 px-3;
  }
  section {
    @apply m-3 py-1;
  }
</style>
