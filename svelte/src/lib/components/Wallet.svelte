<script>
  import { clickOutside } from '$lib/actions/layout'
import {
  accountChainId,
  accountProvider,
  connected,
  connectMetamask,
  connectWalletConnect,
  disconnect,
  walletAddress,
  networkProviders
} from '$lib/stores/provider';

// let showModal = false;



  //TODO: remove ability to interact with UI unless you connect a wallet

</script>

<!-- {#if ($connected)}
  <div class='flex gap-1 rounded-full items-center border-2 box-content border-white pl-3'>
    <h3 class='w-20 truncate'>{$walletAddress}</h3>
    <button class='border-2 border-black' 
    on:click={disconnect}>Disconnect</button>
  </div>
{:else}
  <button class='border-2 border-black' 
  on:click={() => {showModal = true}}>Connect</button>
{/if} -->

<!-- {#if showModal} -->
<div class="box"> <!--use:clickOutside on:outclick={() => (showModal = false)}> -->
  <div class='flex flex-col justify-center m-5 p-5 bg-slate-100 border-black border-2 rounded-2xl gap-3 text-center'>
    {#if !$connected}
      <div class='flex flex-col text-center'>
        <h2 class="text-black font-semibold">Connect a Wallet</h2>
        <div class='flex flex-row justify-center p-3 gap-3'>
          <button
          on:click={connectMetamask}
          class="bg-black text-white"
          >Connect w/ MetaMask</button
          >
          <button
          on:click={connectWalletConnect}
          class="bg-black text-white"
          >Connect w/ WalletConnect</button
          >
        </div>
      </div>
    {:else}
      <div class='flex flex-col text-center'>
        <h2 class="text-black font-semibold">Your Wallet</h2>
        <div class='flex flex-row justify-center p-3 gap-3'>
          <div>Network: {$accountChainId.chainId}</div>
          <div>Address: {$walletAddress}</div>
        </div>
      </div>
    {/if}
  </div>
</div>
<!-- {/if} -->

<style>
  .box {
    @apply w-[35em] h-fit fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-200 border-2 border-black rounded-2xl z-50 flex flex-col justify-between gap-5 shadow-2xl;
  }
</style>