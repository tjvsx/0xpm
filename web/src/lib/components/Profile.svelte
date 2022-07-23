<script lang="ts">
  //@ts-nocheck
  import { ethers } from 'ethers'
  import { userDiamonds, createDiamond, selectedUserDiamond } from '$lib/stores/contract';
  import { isAddress, getFacetData, populateDiamond, getFunctionsNamesSelectorsFromFacet } from '$lib/actions/utils';
  import { cart, empty, generateTabFromUpgrade } from '$lib/stores/app';
  import { clickOutside, scalable } from '$lib/actions/layout'
  import { install, uninstall, update, latest } from '$lib/actions/calls';
  import CircleButton from './subcomponents/CircleButton.svelte'
  import { getNotificationsContext } from 'svelte-notifications';
  import { onMount } from 'svelte';
import { accountChainId } from '$lib/stores/provider';
  const { addNotification } = getNotificationsContext();

  let showModal = false;

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
  
  let iconCSS = 'bg-no-repeat bg-center bg-cover rounded-full w-8 h-8 cursor-pointer';
  let links = [
    { icon: `bg-sourcify ${iconCSS}`, url: ``},
    { icon: `bg-etherscan ${iconCSS}`, url: ``},
    // { icon: `bg-habitat ${iconCSS}`, url: ''}
  ];

  async function handleUpgrade() {
    if ($cart.action === 'install') {
      try { await install($cart.owner, $cart.name) }
      catch (error) {
        handleError(error)
      }
      empty();
    }
    else if ($cart.action === 'update') {
      try { await update($cart.owner, $cart.name, $cart.files.at(-1), $cart.installed) }
      catch (error) {
        handleError(error)
      }
      empty();
    }
    else {
      throw new Error(`Upgrade action not found`);
    }
  }

  async function handleUninstall(account, repo, pkg) {
    try { await uninstall(account, repo, pkg) }
    catch (error) {
      handleError(error)
    }
  }

  onMount(async () => {
    const provider = new ethers.providers.Web3Provider(globalThis.ethereum);
    const XPM_ADDRESS = NETMAP[get(accountChainId).chainId]['Xpm'][0];
    let filter = { // Event filter
      address: XPM_ADDRESS,
      topics: [
      ethers.utils.id("Upgraded(address,string,address,address,address)"),
      ]
    }
    provider.on(filter, async () => {
      //concat to Upgraded and filter out duplicates
    })
  })
  
</script>

<div class='activator'>
  <div class='diamond' on:click={() => {showModal = true}}></div>
  {#if $cart != null || undefined}
    <div class='badge'>1</div>
  {/if}
</div>

<svelte:window on:resize={() => showModal = false} />

{#if showModal}
	<div class="box sm-min:min-w-[26rem] sm-max:min-w-[90%] sm-min:h-96 sm-max:h-[98%]" use:scalable use:clickOutside on:outclick={() => (showModal = false)}>
    <div class='absolute right-[-0.7em] top-[-0.7em] z-50'>
      <CircleButton func={() => {showModal = false}} char='&#10005;' />
    </div>
    <section class='flex justify-between p-2 items-center'>
      <div class='flex flex-nowrap gap-1'>
        {#if (isAddress($selectedUserDiamond.diamond))}
          {#each links as link}
            <a href={link.url} class='z-50' target="_blank"><div class={link.icon}></div></a>
          {/each}
        {/if}
      </div>
      <select class='w-44 h-8 rounded-full p-1 px-4 z-50 truncate' bind:value={$selectedUserDiamond}>
        <option>New Diamond</option>
          {#each $userDiamonds as userDiamond}
            <option value={userDiamond}>
              {userDiamond.diamond}
            </option>
          {/each}
      </select>
    </section>
    <section class='overflow-scroll bg-slate-100 flex-grow'>
      <div class='overflow-hidden'>
        {#if (isAddress($selectedUserDiamond.diamond))}
          {#await populateDiamond($selectedUserDiamond.diamond)}
            <div>Loading..</div>
          {:then [ upgrades, facets ]}
            <h2>Packages: </h2>
            <div class='flex flex-col flex-wrap'>
              {#each upgrades as upgrade}
                <div class='flex flex-row flex-nowrap gap-5 m-2 p-1 justify-evenly items-center bg-slate-200 rounded-2xl w-fit'>
                  <div class='flex flex-col p-1 truncate font-bold cursor-pointer w-28' on:click={generateTabFromUpgrade(upgrade)}>
                    <div>{upgrade.repo} by</div>
                    <div class='truncate'>{upgrade.account}</div>
                  </div>
                  <div class='flex flex-col gap-1'>
                    <div class='button bg-red-600 cursor-pointer' on:click={handleUninstall(upgrade.account, upgrade.repo, upgrade.package)}><span class='font-extrabold mr-1'>&#10005;</span><span>Uninstall</span></div>
                    {#await latest(upgrade.account, upgrade.repo) then pkgAddr}
                      {#if (pkgAddr != upgrade.package)}
                        <div class='button cursor-pointer bg-green-700' on:click={generateTabFromUpgrade(upgrade)}><span>&#8593;</span><span class='mr-2'>Update</span></div> 
                      {:else}
                        <div class='button cursor-not-allowed bg-gray-400'><span>&#8593;</span><span class='mr-2'>Update</span></div> 
                      {/if}
                    {/await}
                  </div>
                </div>
              {/each}
            </div>
            <div>
              <h2>Facets: </h2>
              {#each facets as facet}
              <div class='bg-slate-200 m-2 p-2 rounded-2xl overflow-x-scroll'>
                {#await getFacetData(facet) then {name, funcs, abi, natspec}}
                  <h3>{name}</h3>
                  {#each funcs as func} 
                    <div>{func.name}</div>
                  {/each}
                {/await}
              </div>
              {/each}
            </div>
          {/await}

        {:else} <!-- TODO: diamond registration form -->
            <div>
              To deploy your new diamond, press "create".
            </div>
            <br>
            {#if $accountChainId.chainId === 5}
              <p>
                Need currency? Go to a <a href={`https://goerlifaucet.com/`}>faucet</a>, or <a href="https://twitter.com/tjvsx">ask me to send you some</a>.
              </p>
            {/if}
        {/if}
      </div>
    </section>

    <!-- footer -->
    <section class='flex flex-row justify-between w-full rounded-b-2xl items-center gap-4'>
      {#if ($cart && isAddress($selectedUserDiamond.diamond))}
        <CircleButton func={empty} char='&#10005;' />
        <div class='flex flex-col truncate grow w-72'>
          <div class='truncate'>'{$cart.name}' by {$cart.owner}</div>
          <div class='truncate'> will be {$cart.action == 'update'? 'updated on' : 'added to'} {$selectedUserDiamond.diamond}</div>
        </div>
      {:else}
        <div>No packages in cart</div>
      {/if}
      {#if (!isAddress($selectedUserDiamond.diamond))}
      <button on:click={() => createDiamond()}>Create</button>
      {:else}
      <button on:click={handleUpgrade}>Upgrade</button>
      {/if}
    </section>
	</div>
{/if}

<style>
  .box {
    @apply w-fit max-w-[80%] min-h-fit max-h-[90%] absolute bg-slate-200 border-2 border-black rounded-2xl z-30 flex flex-col justify-between shadow-2xl;
  }
  .button {
    @apply rounded-full py-0 font-medium px-2 flex items-center text-white;
  }
  .badge {
    @apply fixed right-12 bottom-24 bg-red-500 rounded-full h-7 w-7 z-30 text-white justify-center flex items-center shadow-sm;
  }
  .button:hover {
    @apply opacity-80;
  }
  .diamond {
    @apply bg-diamond bg-no-repeat bg-center bg-cover rounded-full w-20 h-20 bg-white mr-10 z-20 drop-shadow-xl;
    background-size: 80%;
    filter: invert(1);
  }
  .activator {
    @apply fixed right-2 bottom-10 cursor-pointer;
  }
  .diamond:hover {
    @apply scale-[1.05] transition-transform duration-100;
  }
  span {
    @apply font-bold text-base w-full text-center;
  }
  section {
    @apply p-3;
  }
  button {
    @apply p-2 px-3;
  }
  a {
    @apply underline text-indigo-500;
  }
</style>
