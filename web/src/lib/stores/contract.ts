export const ssr = false;
import { get, writable, derived } from 'svelte/store';
import { parseCommitted, parseRegistered, parsePackages } from '$lib/actions/utils';
import {
  accountChainId,
  accountProvider,
  connected,
  walletAddress,
  networkProviders
} from '$lib/stores/provider';
import NETMAP from '$lib/state/map.json';
import XPM_ABI from '$lib/abis/XpmDiamond.json';
import { ethers } from 'ethers';
import { createAddFacetCut, isAddress, getMetadataFromAddress, getFunctionsNamesSelectorsFromFacet, getPackages } from '$lib/actions/utils';
// import { Contract, ethers } from 'ethers';
import type { Contract, Event } from 'ethers';

/* contract */
export const contract = writable<Contract>();

/* events */
export const committed = writable<Event[]>([]);
export const commits = derived(
  committed, evt => {
    return parseCommitted(evt);
  }
);

export const registered = writable<Event[]>([]);
export const registers = derived(
  registered, evt => {
    return parseRegistered(evt);
  }
);

export const upgraded = writable<Event[]>([]);

export const selectedUserDiamond = writable<any>('New Diamond');

export const userDiamonds = derived(
  [registers, walletAddress],
  ([$registers, $walletAddress]) => {
    return populateUser($registers, $walletAddress);
  }
)
export function populateUser(registers, walletAddress) {
  const addr = ethers.utils.getAddress(walletAddress);
  // TODO: use OwnershipTransferred events
  return registers.filter(d => d.owner === addr);
}



export async function populate() {
  if (!globalThis.ethereum) {
    return;
  }
  const provider = new ethers.providers.Web3Provider(globalThis.ethereum);
  const chainId = (await provider.getNetwork()).chainId;
  const XPM_ADDRESS = NETMAP[chainId]['Xpm'][0];

  contract.set(new ethers.Contract(
    XPM_ADDRESS,
    XPM_ABI,
    provider
  ));

  //get all repo commits
  committed.set(await get(contract).queryFilter(
    get(contract).filters.Committed(), 
    'earliest', 
    'latest'
  ));

  //get registered diamonds
  registered.set(await get(contract).queryFilter(
    get(contract).filters.Registered(),
    'earliest',
    'latest'
  ))
}

export async function createDiamond() {
  const provider = new ethers.providers.Web3Provider(get(accountProvider))

  let facetsToAdd = [
    "Readable", 
    "Ownership",
    "Erc165",
    "PackageManager"
  ];
  let initializerName = "XpmInit";

  let contracts = [];
  let initializer;
  for (let instance of Object.entries(NETMAP[get(accountChainId).chainId])) {
    if (facetsToAdd.includes(String(instance[0]))) {
      const abi = (await import(`../abis/${instance[0]}.json`)).default;
      const facet = new ethers.Contract(String(instance[1]), abi, provider)
      contracts.push(facet)
    }
    if (initializerName == instance[0]) {
      const abi = (await import(`../abis/${instance[0]}.json`)).default;
      initializer = new ethers.Contract(String(instance[1]), abi, provider)
    }
  }
  const cuts = createAddFacetCut(contracts);

  try {
    const signer = provider.getSigner()
    const tx = await get(contract).connect(signer).createDiamond(cuts, initializer.address, '0xe1c7392a');
    const receipt = await tx.wait()
    let evts = receipt.events?.filter((x) => {return x.event == "Registered"});
    registered.update(r => r.concat(evts))
    // let diamond, owner;
    // let registered = []
    // for (let evt of evts) {
    //   [diamond, owner] = evt.args
    //   registered.push({diamond, owner})
    // }
    // registers.update(r => r.concat(registered));
  } catch (error) {
    // await handleError(error);
  }
}

