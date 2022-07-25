<script>
  import {
    accountChainId,
    accountProvider,
    connected,
    connectMetamask,
    connectWalletConnect,
    disconnect,
    walletAddress,
    networkProviders,
    switchChains
  } from '$lib/stores/provider';

</script>

{#if ($connected && $accountChainId.chainId === 5)}
  <div class='menu-link' on:click={disconnect}>Disconnect</div>
{:else}
<div class="box">
  <div class='sub-box'>
    <div class='flex flex-col text-center'>
      <h2 class="text-black font-semibold">Connect a Wallet</h2>
      {#if !$connected}
      <div class='flex flex-row flex-wrap justify-center p-3 gap-3'>
        <button
          on:click={connectMetamask}
          class="bg-orange-500 text-white"
        >🦊 MetaMask</button
        >
        <!-- if no metamask, navigate to metamask.io -->
        <!-- <button
          on:click={connectWalletConnect}
          class="bg-blue-500 text-white"
        >🤳 WalletConnect</button
        > -->
      </div>
      {:else if !$accountChainId.supportedNetwork}
        <div class='flex flex-col justify-center p-3 gap-3'>
        <p>Only available on Goerli Test Network </p>
        <button
          on:click={switchChains}
          class='bg-blue-600'
          >🎚 Switch Chains</button
          >
        </div>
      {/if}
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
    @apply max-w-[35em] min-w-[20em] h-fit fixed top-1/2 left-1/2 transform -translate-x-[44%] -translate-y-[50%] bg-black bg-opacity-70 rounded-2xl z-50 flex flex-col justify-between shadow-2xl;
  }
  .sub-box {
    @apply flex flex-col justify-center m-5 mt-[-1em] ml-[-1em] p-5 bg-slate-100 border-black border-2 rounded-2xl text-center shadow-2xl;
  }
</style>