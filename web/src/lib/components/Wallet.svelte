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

let showModal = false;

</script>

{#if ($connected)}
  <div class='menu-link' on:click={disconnect}>Disconnect</div>
{:else}
<div class="box" use:clickOutside on:outclick={() => (showModal = false)}>
  <div class='sub-box'>
    {#if !$connected}
      <div class='flex flex-col text-center'>
        <h2 class="text-black font-semibold">Connect a Wallet</h2>
        <div class='flex flex-row flex-wrap justify-center p-3 gap-3'>
          <button
            on:click={connectMetamask}
            class="bg-orange-500 text-white"
          >🦊 MetaMask</button
          >
          <button
            on:click={connectWalletConnect}
            class="bg-blue-500 text-white"
          >🤳 WalletConnect</button
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
  <div class='sub-box'>
    <div class='flex flex-col text-center'>
      <h2 class="text-black font-semibold">Available on:</h2>
      <div class='flex flex-row flex-wrap justify-center p-3 gap-3'>
        <ul class='text-left'>
          <li>Rinkeby</li>
          <li>More coming soon...</li>
        </ul>
      </div>
    </div>
  </div>
  <div class='sub-box'>
    <div class='flex flex-col text-center'>
      <h2 class="text-black font-semibold">Support us</h2>
      <div class='flex flex-row flex-wrap justify-center p-3 gap-3'>
        <a href={'https://gitcoin.co/grants/6967/0xpm-registry-for-smart-contract-packages-dapp-com'} target="_blank"><button
          class='bg-teal-500 text-white'
        >🤝 Donate</button></a>
        <a href={'https://github.com/0xHabitat'} target="_blank"><button
          class='bg-black-500 text-white'
        >🛠 GitHub</button></a>
      </div>
    </div>
  </div>
</div>
{/if}

<style>
  .box {
    @apply max-w-[35em] min-w-[20em] h-fit fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-200 border-2 border-black rounded-2xl z-50 flex flex-col justify-between shadow-2xl;
  }
  .sub-box {
    @apply flex flex-col justify-center m-5 p-5 bg-slate-100 border-black border-2 rounded-2xl text-center;
  }
  li {
    @apply list-disc;
  }
</style>