//@ts-nocheck
import { ethers } from 'ethers';
import PM_ABI from '$lib/abis/PackageManager.json';
import { contract, selectedUserDiamond } from '$lib/stores/contract';
import { get } from 'svelte/store'

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