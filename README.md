# Upgrade Library / Package Manager:

## What is this?
This is an app whose purpose is to be an onchain upgrade library for diamond proxy contracts. With the app, users can deploy a new diamond, register an existing compatible diamond, and commit their diamondCut params as an **Upgrade Package** that can be easily reused by other registered diamonds. In the future, each package will also contain an optional front-end component / app that can be used on a diamond's homepage. 

> WIP: This project is continuously being worked on! That's the beauty of upgradeability :)

## Run the app:
1. start ganache: use the [GUI](https://trufflesuite.com/ganache/) and start a workspace with the following "server" settings...
<img width="572" alt="Screen Shot 2022-07-08 at 2 41 59 AM" src="https://user-images.githubusercontent.com/62122206/177932588-000bf8ab-f9d0-4a7a-b886-57b856d63123.png">

2. start IPFS: use [IPFS desktop](https://docs.ipfs.io/install/ipfs-desktop/#install-instructions) to automatically run an ipfs node. This is only needed for pushing contract metadata to ipfs in the deploy.js script.

3. generate [ABIs](./svelte/src/lib/abis), [address map](./svelte/src/lib/state/map.json), and dummy data into svelte project via: 
```
cd hardhat && yarn && npx hardhat test
```
... abis will be generated via: `hardat-diamond-abi` and `abi-exporter` plugins. You may also turn off ipfs desktop now if desired. 

4. start front-end: 
```
cd svelte && pnpm i && pnpm run dev
```

---
# OnTap Contracts - A Diamond for Storing Upgrade Presets

![Ownable](https://user-images.githubusercontent.com/62122206/181121026-cdc21bc3-a6e4-44c6-a336-78e9e3b7c237.png)

>This is a simple WIP / concept project and there are no immediate plans other than testing, simplifying, and optimizing the contracts further. OnTap is the diamond name we will use for this example. This readme is more digestible if you have some familiarity with EIP2535 and the [Solidstate contract library](https://github.com/solidstate-network/solidstate-solidity).

## The Upgrade contract -- storing a package -- 
Each upgrade package is an external contract address that stores data in the format of a standard diamondCut `( ( address[], uint8, bytes4[] ), initializerAddress, initializerFunction )`. A package can be installed and then uninstalled. The below image is a simplified version of this contract, which just implements a `get()` and `set()` functions. Please check out the ['external' folder](./hardhat/contracts/external/) for more info on the Install / Uninstall design. 

<img width="675" alt="Screen Shot 2022-06-08 at 12 36 18 AM" src="https://user-images.githubusercontent.com/62122206/172532551-67dda429-36da-49ea-a4ab-ce6522150bb7.png">

## Storage - A basic data structure
Moving on from the external [Upgrade.sol](./hardhat/contracts/external/Upgrade.sol) storage contract; the main [Storage library contract](./hardhat/contracts/storage/Storage.sol) contains a [solidstate](https://github.com/solidstate-network/solidstate-solidity) compatible storage layout with some internal functions for easy access. 

<img width="629" alt="Screen Shot 2022-06-08 at 12 37 52 AM" src="https://user-images.githubusercontent.com/62122206/172532754-4a8a5b1b-c5f4-4dfb-897d-6f9bb8d1ff39.png">


## The logic
The [logic folder](./hardhat/contracts/logic/) contains the two main facets and a library for sharing code between modules...

### Git contract
[Git / IGit](./hardhat/contracts/logic/Git) is the native facet of OnTap. It is the main access point for reading and writing upgrades and presets to this Diamond's storage. 

**Looking at the code:** You can see that upon deployment, an address for the Upgrade.sol model is stored immutably. This address can then be used for cheaply deploying minimal proxies (storage contracts delegating calls to a single logic implementation), as seen in `function commit(...)`. 

<img width="670" alt="Screen Shot 2022-06-08 at 12 47 28 AM" src="https://user-images.githubusercontent.com/62122206/172533865-1127cd98-9034-4354-ac03-9a7143a265d0.png">


### PackageManager contract
[PackageManager / IPackageManager](./hardhat/contracts/logic/IPackageManager) is a diamond cutting facet which integrates itself with Git. It is to be used by other diamonds. 

**Looking at the code:** Upon deployment, it stores the Diamond immutably so that our Diamond's git system can be accessed from other diamonds if they've connected this contract as a facet. It has 2 externally available methods for upgrading a diamond...
1. `function install(..)`: install the upgrade package at account `owner`'s `name`.
2. `function uninstall(..)`: uninstall the upgrade package at account `onwer`'s `name`.

<img width="546" alt="Screen Shot 2022-07-04 at 12 11 24 AM" src="https://user-images.githubusercontent.com/62122206/177080258-c8da5e09-d863-4ea0-a2c5-e466207ca623.png">


### Internal Library contract
The [Library contract](./hardhat/contracts/logic/libraries/Library.sol) contains the internal functions that all upgrades can use. These internal functions can be shared among decentralized decision-making modules. For example: when [Governance.sol](./hardhat/contracts/_library/atheneum/governance/logic/Governance.sol) calls `executeProposal(..)`, it calls the `Library._execute(..)` internal function, sending through its 'proposalContract' (a minimal proxy of Upgrade.sol) to make the upgrade. Additionally, since a `diamondCut(..)` function can perform arbitary operations via its 2nd and 3rd params `initializerAddress, initializerFunction`, this method can also do things like mint new tokens, or add/remove/update any data in *your* diamond. 

<img width="685" alt="Screen Shot 2022-06-08 at 2 42 29 PM" src="https://user-images.githubusercontent.com/62122206/172692673-ec764871-5ad1-48b3-8d29-6f0aa2b9574f.png">


## The OnTap Diamond
In the [main diamond](./hardhat/contracts/OnTap.sol), most of the work is done in the constructor. The workflow of adding each facet can be found in the [deploy script](./hardhat/scripts/deploy.js). The important bit is; Writable.sol is deployed in the constructor, because it has to store the diamond's address(this) via its *own* constructor. 

<img width="666" alt="Screen Shot 2022-06-08 at 3 05 06 PM" src="https://user-images.githubusercontent.com/62122206/172696482-aaa1f519-ab70-4db3-a187-5517a34b95f3.png">

## The User's Diamond
The [user's diamond](./hardhat/contracts/Diamond.sol) is a lightweight, simplified solidstate diamond that accepts cuts in its constructor, so that it can use existing facets on deployment.

<img width="543" alt="Screen Shot 2022-07-04 at 12 10 23 AM" src="https://user-images.githubusercontent.com/62122206/177080175-47c483a2-4d06-476c-b34d-ae454250e907.png">


These contracts have not been thoroughly tested yet, but when they do, the contracts may change slightly. 

#### Extra notes: 
- The [_library folder](./hardhat/contracts/_library) can be largely ignored, with the exception of its [governance folder](./hardhat/contracts/_library/atheneum/governance). It just contains any modules that can work with the OnTap diamond.
- The [init folder](./hardhat/contracts/init) contains the upgrade initializers. These contracts can perform arbitrary operations on the diamond via the `diamondCut(..)` 2nd and 3rd params `initializerAddress, initializerFunction`.

---
# Basic Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, a sample script that deploys that contract, and an example of a task implementation, which simply lists the available accounts.

Try running some of the following tasks:

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
node scripts/sample-script.js
npx hardhat help
```
