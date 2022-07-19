
import { Contract, ethers } from 'ethers';
import { decode } from 'cbor-x';
import bs58 from 'bs58';
import all from 'it-all'
import { concat as uint8ArrayConcat } from 'uint8arrays/concat'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import INSTALLER_ABI from '$lib/abis/installer.json';
import NETMAP from '$lib/state/map.json';
import PM_ABI from '$lib/abis/PackageManager.json';
import { accountProvider } from '$lib/stores/provider';
import { contract, selectedUserDiamond } from '$lib/stores/contract';
import { get } from 'svelte/store'

import GIT_ABI from '$lib/abis/Git.json';
import READABLE_ABI from '$lib/abis/Readable.json';
import UPGRADE_ABI from '$lib/abis/Upgrade.json';
import { ipfs } from "$lib/stores/ipfs";

export async function install(account, repo) {
  const provider = new ethers.providers.Web3Provider(globalThis.ethereum);
  const diamond = ethers.utils.getAddress(get(selectedUserDiamond).diamond);
  const x_packagemanager = new ethers.Contract(diamond, PM_ABI, provider);
  const signer = provider.getSigner();
  return await x_packagemanager.connect(signer).install(account, repo);
};

export async function uninstall(account, repo, pkg) {
  const provider = new ethers.providers.Web3Provider(globalThis.ethereum);
  const diamond = ethers.utils.getAddress(get(selectedUserDiamond).diamond);
  const x_packagemanager = new ethers.Contract(diamond, PM_ABI, provider);
  const signer = provider.getSigner();
  return await x_packagemanager.connect(signer).uninstall(account, repo, pkg);
};

export async function update(account, repo, newPkg, oldPkg) {
  const provider = new ethers.providers.Web3Provider(globalThis.ethereum);
  const diamond = ethers.utils.getAddress(get(selectedUserDiamond).diamond);
  const x_packagemanager = new ethers.Contract(diamond, PM_ABI, provider);
  const signer = provider.getSigner();
  return await x_packagemanager.connect(signer).update(account, repo, newPkg, oldPkg);
};

export async function latest(account, repo) {
  const provider = new ethers.providers.Web3Provider(globalThis.ethereum);
  const signer = provider.getSigner();
  const pkg = await get(contract).connect(signer).latest(account, repo);
  return pkg;
};