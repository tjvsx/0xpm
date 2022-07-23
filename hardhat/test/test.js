const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const { updateDiamond } = require('./libraries/diamond.js')
const { verify } = require("../tasks/lib/utils.js");
const { createAddFacetCut } = require('../scripts/libraries/cuts.js')
const { deploy } = require('../scripts/deploy.js')
const ABI = require("../artifacts/hardhat-diamond-abi/HardhatDiamondABI.sol/XpmDiamond.json");

describe("Diamond test", async function () {

  // utils
  let signer = [];
  let cuts;

  //contracts
  let xpm; // 0xpm diamond
  let diamond; //userDiamond
  let oxpm, readable, ownership, writable, erc165, packagemanager, git, diamondfactory, xpminit; //facets and inits

  before(async () => {
    // await testEnvironmentIsReady();
    signer = await ethers.getSigners();
    [ oxpm, readable, ownership, writable, erc165, packagemanager, git, diamondfactory, xpminit ] = await deploy();
    // xpm = await updateDiamond('xpm.json', CHAIN_ID)
    // git = await ethers.getContractAt('Git', onxpmtap.contracts["Git"].address)
    xpm = await ethers.getContractAtFromArtifact(ABI, oxpm.address)
  });

  let diamondAddr;
  
  it("sould deploy new diamond", async function () {

    cuts = createAddFacetCut([readable, ownership, erc165, packagemanager]);

    let tx = await xpm.connect(signer[0]).createDiamond(cuts, xpminit.address, '0xe1c7392a');
    const receipt = await tx.wait()
    let evts = receipt.events?.filter((x) => {return x.event == "Registered"});
    let registered = []
    for (let evt of evts) {
      [diamond, owner] = evt.args
      registered.push({diamond, owner})
    }


    const events = await xpm.queryFilter(
      xpm.filters.Registered(), 
      'earliest', 
      'latest'
    );

    let diamonds = [];
    for (const evt of events) {
      const [ _diamond, _owner ] = evt.args
      diamonds.push({ diamond: _diamond, owner: _owner})
    }
    diamondAddr = diamonds[0].diamond;

    const x_readable = await ethers.getContractAt('Readable', diamondAddr)
    const facets = await x_readable.facets();
    // console.log(facets)
  });

  it("commits tons of upgrades", async function () {
    const Greeter = await ethers.getContractFactory('Greeter');
    const greeter = await Greeter.deploy();
    await greeter.deployed();

    cuts = createAddFacetCut([greeter]);
    await xpm.connect(signer[0]).commit('Greeter', cuts, ethers.constants.AddressZero, '0x');

    const MyToken = await ethers.getContractFactory('MyToken');
    const mytoken = await MyToken.deploy();
    await mytoken.deployed();
    cuts = createAddFacetCut([mytoken]);
    await xpm.connect(signer[0]).commit('MyToken', cuts, ethers.constants.AddressZero, '0x');

    cuts = createAddFacetCut([mytoken, greeter]);
    await xpm.connect(signer[0]).commit('Token + Greeter Bundle', cuts, ethers.constants.AddressZero, '0x');


    const LocalFacetTest = await ethers.getContractFactory('LocalFacetTest');
    const localfacettest = await LocalFacetTest.deploy();
    await localfacettest.deployed();
    cuts = createAddFacetCut([localfacettest]);
    await xpm.connect(signer[1]).commit('LocalFacetTest', cuts, ethers.constants.AddressZero, '0x');

    const LocalFacet = await ethers.getContractFactory('LocalFacet');
    const localfacet = await LocalFacet.deploy();
    await localfacet.deployed();

    cuts = createAddFacetCut([localfacet]);
    await xpm.connect(signer[1]).commit('LocalFacet', cuts, ethers.constants.AddressZero, '0x');

    cuts = createAddFacetCut([localfacettest, localfacet]);
    await xpm.connect(signer[1]).commit('LocalFacets Bundle Test', cuts, ethers.constants.AddressZero, '0x');

    contractsToVerify = [
      {
        name: 'Greeter',
        address: greeter.address
      },
      // {
      //   name: 'LocalFacet',
      //   address: localfacet.address
      // },
      {
        name: 'MyToken',
        address: mytoken.address
      },
      // {
      //   name: 'LocalFacetTest',
      //   address: localfacettest.address
      // },
    ];

    await verify(contractsToVerify)
    
  });

  it("fetch Commit events", async function () {
    const events = await xpm.queryFilter(
      xpm.filters.Committed(), 
      'earliest', 
      'latest'
    );

    let repos = []
    for (const evt of events) {
      const { owner, name, upgrade } = evt.args
      repos.push({ owner, name, upgrade})
    }
    // console.log(repos);
  });

  let x_packagemanager;
  it("user adds upgrades", async function () {
    x_packagemanager = await ethers.getContractAt('PackageManager', diamondAddr)
    // console.log(x_packagemanager)
    
    tx = await x_packagemanager.install(signer[0].address, 'Greeter');
    receipt = await tx.wait()
  });

  it("fetch Upgraded events", async function () {
    const events = await x_packagemanager.queryFilter(
      x_packagemanager.filters.Upgraded(), 
      'earliest', 
      'latest'
    );

    let upgrades = []
    for (const evt of events) {
      const [ account, repo, toPkg, fromPkg, caller ] = evt.args
      upgrades.push({account, repo, toPkg, fromPkg, caller})
    }
    // console.log(upgrades);
  });

  it("Updates packages", async function () {
    await xpm.connect(signer[0]).commit('Greeter', cuts, ethers.constants.AddressZero, '0x')
    // console.log(upgrades);

    // await x_packagemanager.connect(signer[0]).update()
  });



});
