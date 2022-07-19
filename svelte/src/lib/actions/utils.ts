
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
import GIT_ABI from '$lib/abis/Git.json';
import READABLE_ABI from '$lib/abis/Readable.json';
import UPGRADE_ABI from '$lib/abis/Upgrade.json';
import { ipfs } from "$lib/stores/ipfs";
import { get } from 'svelte/store'
import XPM_ABI from '$lib/abis/XpmDiamond.json';
import { accountChainId } from '$lib/stores/provider';

export async function getMetadataFromAddress(address) {
  const provider = new ethers.providers.Web3Provider(globalThis.ethereum);
  
  console.log('address', address)

  const fromHexString = hexString => new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
  const toHexString = bytes => bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');

  // @ts-ignore
  const bytecode = await provider.getCode(address);
  const ipfsHashLength = parseInt(`${bytecode.substring(bytecode.length - 4)}`, 16);
  const cborEncoded = bytecode.substring(bytecode.length - 4 - ipfsHashLength*2, bytecode.length - 4);
  const contractMetadata = decode(fromHexString(cborEncoded));
  const cid = bs58.encode(contractMetadata.ipfs);

  console.log('CID:', cid)
  // https://dweb.link/api/v0/cat?arg=QmbMd4GCEieKT3ZRHDdv4DqjBU3MjZPYhY7fJSAWBXVL8m
  // https://cid.ipfs.io/#QmbMd4GCEieKT3ZRHDdv4DqjBU3MjZPYhY7fJSAWBXVL8m
  // https://bafybeigbm6shg2u3lwr3ikawql43hjuuvabme4a6dgucvnq5ojwiz7gwvy.ipfs.dweb.link

  const data = uint8ArrayConcat(await all(get(ipfs).cat(String(cid))));
  const metadata = JSON.parse(uint8ArrayToString(data));
  const name = Object.values(metadata.settings.compilationTarget)[0];
  console.log('name', name)

  const abi = metadata.output.abi;
  console.log('abi', abi)

  const natspec = metadata.output.devdoc;
  console.log('natspec', natspec)
  
  return {name, abi, natspec};

  // need to keep in mind that it could take FOREVER to retrieve this data. It might be best to keep a serverside version of it?
}

export function isAddress(address) {
  try {
      ethers.utils.getAddress(address);
  } catch (e) { return false; }
  return true;
}

const action = { add: 0, replace: 1, remove: 2 }

export function createAddFacetCut(contracts: Contract[]) {
  let cuts = [];
  for (const contract of contracts) {
    cuts.push(
      {
        target: contract.address,
        action: action.add,
        selectors: Object.keys(contract.interface.functions)
        // .filter((fn) => fn != 'init()')
        .map((fn) => contract.interface.getSighash(fn),
        ),
      },
    );
  }
  return cuts;
}

export function parseCommitted(events) {
  let accounts = [];
  let _owner, _name, _upgrade;
  for (const evt of events) {
    [ _owner, _name, _upgrade ] = evt.args;
    let owners = accounts.map(o => o.name);
      if(!owners.includes(_owner)) {
        accounts.push({
          name: _owner,
          files: [{
            name: _name,
            files: [_upgrade]
          }]
        })

      } else {
        // if owner is included, add to their repo
        for (let account of accounts) {

          let titles = account.files.map(o => o.name);

          if(!titles.includes(_name) && account.name == _owner) {
            account.files.push({
              name: _name,
              files: [_upgrade]
            })
          } else if (account.name == _owner) {
            for (let repo of account.files) {
              if (repo.name == _name) {
                repo.files.push(_upgrade)
              }
            }
          }
        }
      }
  }
  return accounts;
}

export function parseRegistered(events) {
  console.log(events)
  let diamonds = [];
  let _diamond, _owner;
  for (const evt of events) {
    [ _diamond, _owner ] = evt.args;
    diamonds.push({diamond: _diamond, owner: _owner})
  }
  // TODO: and check OwnershipTransferred events
  return diamonds;
}

export function parsePackages(upgrades) {
  return upgrades.sort((a,b) => a.block - b.block)
  .filter((v,i,a)=>a.findLastIndex(v2=>['account','repo'].every(k=> v2[k] === v[k])) === i )
  .filter(e =>  
    e.package != '0x0000000000000000000000000000000000000000' 
  );
}

export async function getFunctionsNamesSelectorsFromFacet(cut, abi) {
  const provider = new ethers.providers.Web3Provider(globalThis.ethereum);
  const contract = new ethers.Contract(cut[0], abi, provider);
  const signatures = Object.keys(contract.interface.functions)
  const names = signatures.reduce((acc, val) => {
    acc.push({
      name: val,
      selector: contract.interface.getSighash(val)
    })
    return acc
  }, []);

  let selectors;
  if (cut.length === 3) {
    selectors = cut[2];
  } else {
    selectors = cut[1];
  }
  let funcs = [];
  for (let selector of selectors) {
    funcs.push(Object.values(names).find(i => i.selector == selector))
  }

  return funcs
}


export async function getPackages(diamond) {
  let _pkg, _caller, _account, _repo, _previous;

  let events = await diamond.queryFilter(
    diamond.filters.Upgraded(), 
    'earliest', 
    'latest'
  );
  let upgraded = [];
  for (const evt of events) {
    [ _account, _repo, _pkg, _previous, _caller ] = evt.args;
    upgraded.push(
      {
        account: _account,
        repo: _repo,
        package: _pkg, 
        previous: _previous,
        caller: _caller,
        block: evt.blockNumber
      }
    );
  }

  return parsePackages(upgraded)
}

export async function populateDiamond(address) {
  const provider = new ethers.providers.Web3Provider(globalThis.ethereum);
  const signer = provider.getSigner();
  let packages = [];
  let facets = [];
  if (isAddress(address)) {

    const x_packagemanager = new ethers.Contract(address, PM_ABI, provider);

    packages = await getPackages(x_packagemanager)

    for (let p of packages) {
      const upgrade = new ethers.Contract(p.package, UPGRADE_ABI, provider);
      p.files = await upgrade.connect(signer).get();
    }

    const x_readable = new ethers.Contract(address, READABLE_ABI, provider);
    facets = await x_readable.connect(signer).facets();
  }
  return [ packages, facets ];
}

export async function getFacetData(cut) {
  const {name, abi, natspec} = await getMetadataFromAddress(cut[0]);
  const funcs = await getFunctionsNamesSelectorsFromFacet(cut, abi);
  console.log('funcs', funcs);
  return {name, funcs, abi, natspec};
}

/* periodic event logs fetching */
import { onDestroy } from 'svelte';

export function onInterval(callback, milliseconds) {
	const interval = setInterval(callback, milliseconds);

	onDestroy(() => {
		clearInterval(interval);
	});
}

// export async function updateEvents() {
//   const provider = new ethers.providers.Web3Provider(globalThis.ethereum);
//   const XPM_ADDRESS = NETMAP[get(accountChainId).chainId]['Xpm'][0];
//   let filter = { // Event filter
//     address: XPM_ADDRESS,
//     topics: [
//      ethers.utils.id("Committed(address,string,address)"),
//     ]
//   }
//   provider.on(filter, () => {
//       // do whatever you want here
//       // I'm pretty sure this returns a promise, so don't forget to resolve it
//       console.log('testing contract event listener')
//   })

// }