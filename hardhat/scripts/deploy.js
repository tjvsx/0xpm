/* global ethers */
const fs = require("fs");
const { promises } = fs
const { 
  createAddFacetCut
} = require('./libraries/cuts.js');

const {
  setDiamondJson,
  verify,
  getChainIdByNetworkName
} = require('../tasks/lib/utils.js')

const {
  updateDiamond
} = require('../test/libraries/diamond.js');
const { ethers } = require("hardhat");

const init = '0xe1c7392a';

// @dev reusable facets - attached facets are prefixed with 'x_';

async function createDiamond(signer, cuts, initAddr) {

  const Diamond = await ethers.getContractFactory('Diamond');
  const diamond = await Diamond.connect(signer).deploy(cuts, initAddr, init);
  await diamond.deployed();
  console.log('💎 Diamond deployed:', diamond.address);

  return diamond;
}

async function create0xpm(cuts) {
  const Xpm = await ethers.getContractFactory('Xpm');
  const xpm = await Xpm.deploy(cuts, ethers.constants.AddressZero, '0x');
  await xpm.deployed();
  console.log('💎 0xpm deployed:', xpm.address);

  const x_ownership = await ethers.getContractAt('Ownership', xpm.address);
  const x_readable = await ethers.getContractAt('Readable', xpm.address);
  const x_writable = await ethers.getContractAt('Writable', xpm.address);

  let facetAddresses = [xpm.address]
  for (let cut of cuts) { facetAddresses.push(cut.target) }
  const packageManagerAddr = (await x_readable.facetAddresses()).filter((x) => {
    if (facetAddresses.indexOf(x) === -1) return x;
  })[0];
  const packagemanager = await ethers.getContractAt('PackageManager', packageManagerAddr);
  console.log('🪩  PackageManager deployed:', packageManagerAddr);

  //deploy greeter
  const Greeter = await ethers.getContractFactory('Greeter');
  const greeter = await Greeter.deploy();
  await greeter.deployed();
  console.log('👋 Greeter deployed:', greeter.address);

  //deploy git
  cuts = createAddFacetCut([greeter]);
  const Git = await ethers.getContractFactory('Git');
  const git = await Git.deploy(cuts);
  await git.deployed();
  console.log('📚 Git deployed:', git.address);

  //deploy factory
  const DiamondFactory = await ethers.getContractFactory('DiamondFactory');
  const diamondfactory = await DiamondFactory.deploy();
  await diamondfactory.deployed();
  console.log('🏭 DiamondFactory deployed:', diamondfactory.address);

  cuts = createAddFacetCut([git, diamondfactory]);

  //deploy initializer
  const XpmInit = await ethers.getContractFactory('XpmInit');
  const xpminit = await XpmInit.deploy();
  await xpminit.deployed();
  console.log('💠 0xpmInit deployed:', xpminit.address);

  await x_writable.diamondCut(cuts, xpminit.address, init);

  return [ xpm, packagemanager, git, diamondfactory, xpminit ];
}

async function deploy0xpm() {

  console.log('~~~~~  C R E A T I N G   O N T A P  ~~~~~')

  const Readable = await ethers.getContractFactory('Readable');
  const readable = await Readable.deploy();
  await readable.deployed();
  console.log('🔮 Readable deployed:', readable.address);

  const Writable = await ethers.getContractFactory('Writable');
  const writable = await Writable.deploy();
  await writable.deployed();
  console.log('✍️ Writable deployed:', writable.address);

  const Ownership = await ethers.getContractFactory('Ownership');
  const ownership = await Ownership.deploy();
  await ownership.deployed();
  console.log('💍 Ownership deployed:', ownership.address);

  const ERC165 = await ethers.getContractFactory('Erc165');
  const erc165 = await ERC165.deploy();
  await erc165.deployed();
  console.log('🗺  ERC165 deployed:', erc165.address);

  let cuts = createAddFacetCut([readable, ownership, writable, erc165]);

  const [ xpm, packagemanager, git, diamondfactory, xpminit ] = await create0xpm(cuts);

  console.log('~~~~~~  O N T A P   C R E A T E D  ~~~~~~');

  return [ xpm, readable, ownership, writable, erc165, packagemanager, git, diamondfactory, xpminit ];
}

async function deploy() {
  const CHAIN_ID = getChainIdByNetworkName(hre.config.defaultNetwork);

  await hre.run("clean")
  await hre.run("compile")

  let [ xpm, readable, ownership, writable, erc165, packagemanager, git, diamondfactory, xpminit ] = await deploy0xpm();
  contractsToVerify = [
    {
      name: 'Xpm',
      address: xpm.address
    },
    {
      name: 'Readable',
      address: readable.address
    },
    {
      name: 'Ownership',
      address: ownership.address
    },
    {
      name: 'Writable',
      address: writable.address
    },
    {
      name: 'Erc165',
      address: erc165.address
    },
    {
      name: 'PackageManager',
      address: packagemanager.address
    },
    {
      name: 'Git',
      address: git.address
    },
    {
      name: 'DiamondFactory',
      address: diamondfactory.address
    },
    {
      name: 'XpmInit',
      address: xpminit.address
    }
  ];
  await verify(contractsToVerify)
  
  console.log('[OK] 0xpm verified')

  //write addresses map
  const map = {};
  map[CHAIN_ID] = {
    'Xpm': [xpm.address],
    'Readable': [readable.address],
    'Ownership': [ownership.address],
    'Erc165': [erc165.address],
    'Writable': [writable.address],
    'PackageManager': [packagemanager.address],
    'Git': [git.address],
    'DiamondFactory': [diamondfactory.address],
    'XpmInit': [xpminit.address]/* ,
    'Multicall': [multicall2.address] */
  };

  const buffer = await promises.readFile('../svelte/src/lib/state/map.json')
  const string = buffer.toString()
  const json = JSON.parse(string)

  // overwrite at chainid
  for (const chain of Object.keys(json)) {
    if (chain != String(CHAIN_ID)) {
      map[chain] = json[chain]
    }
  }
  await promises.writeFile('../svelte/src/lib/state/map.json', JSON.stringify(map, null, 2));

  return [ xpm, readable, ownership, writable, erc165, packagemanager, git, diamondfactory, xpminit ]
}

if (require.main === module) {
  deploy()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}

exports.deploy = deploy
exports.deploy0xpm = deploy0xpm
exports.createDiamond = createDiamond;
exports.create0xpm = create0xpm;