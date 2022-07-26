<script>
  import Panel from "./Panel.svelte";
  import { tabs, margins } from '$lib/stores/app';

</script>

  {#if $tabs.length}
  <div style:margin-left="{$margins.at(-1)}rem">
    {#each $tabs as tab}
    <div 
      class='flex' 
      style:margin-left="-{$margins[$tabs.indexOf(tab)]}rem"
    > 
      <Panel {tab}/>
    </div>
    {/each}
  </div>
  {:else}
    <div class='mb-36'>
      <div class='p-5'>
        <h1>🏛 0xpm</h1>
        <br />
        <h2> Smart Contract Upgrade Library / Package Manager </h2>

        <p>Welcome! This is a prototype; please use test currency only! This application is a smart contract module library that is compatible with EIP-2535; commonly known as the "Diamond Standard" created by Nick Mudge. Each module is a collection of contracts that can be thought of as a "software package". These packages can be added or removed from your contract address (your diamond) to give it superpowers!</p>
        <br />

        <h3>How to use this Library</h3>
        <br />

        <h4>1. Connect your wallet!</h4>
        <p>Connect you wallet with metamask or walletconnect.</p>

        <h4>2. Deploy a diamond</h4> 
        <p>Click the diamond icon in the bottom right, and press "create". Your diamond should deploy! You can view your diamonds in the drop-down menu on the top right of this "cart" modal.</p>

        <h4>3. Install an upgrade to your diamond</h4>
        <p>Look through the left-side menu. Each address or ENS name is an account that has committed an upgrade to this library. Clicking on an account will show their repositories. Selecting a repository will display its latest commit, which include; facets, an initializer address and function, metadata, front-end components (under development), previous upgrades, and the name of the solidity contract! When you are ready to add an upgrade, press "+ Add".</p>
        <p>Now go back to your "cart" (click the diamond icon). Now we can see the package is ready to be added. Click "Upgrade", and it should add. Soon, you will see the upgrade listed in your diamond's profile.</p>

        <h4>4. Uninstall an upgrade</h4>
        <p>Uninstalling is quick and simple. Go to your diamond profile by clicking the bottom right diamond icon. Selecting your diamond will display its packages. If you'd like to remove a package and its facets from your diamond, press "uninstall" and confirm the gas-only transaction. </p>

        <h4>5. Commit an upgrade to the library</h4>
        <p>Anyone can commit an upgrade! Simply click the "Commit an upgrade" button below the left-side menu. First, name your upgrade. Now select "add" under facets. <em> Using a facet whose metadata does not exist on IPFS will not work,</em> so feel free to reuse an existing facet in the library - you can do this by going to another upgrade and clicking a facet address to copy it. Paste the facet in the "facet address" input. Do not worry about the initializers for this example. Then, press "submit". Soon, you will see the upgrade commited in the menu under your wallet address.</p>

        <h4>6. Update a package</h4>
        <p>An update for a package becomes available in your "cart" when the package owner commits a new version. In order to exemplify this, you may install one of your <em>own</em> packages on your diamond. After you'ved installed it, commit a new version by submitting a new commit at the same repo name as before. Now, your cart should display a green "Update" button. Selecting it will display the new package to be updated. You may now finalize the transaction by pressing the "Upgrade" button in your cart.</p>
      </div>
    </div>
  {/if}

<style>
  p {
    @apply p-2 pl-5;
  }
</style>