// const { ethers } = require("hardhat");
const axios = require('axios');
const { info } = require('console');
const fs = require("fs");
const { promises } = fs
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const { getSelectors, FacetCutAction, getSelector } = require('../scripts/libraries/diamond.js')
const DiamondDifferentiator = require('./lib/DiamondDifferentiator.js')
const {
  loupe,
  verify,
  createDiamondFileFromSources,
  getDiamondJson,
  setDiamondJson,
  getFunctionsNamesSelectorsFromFacet,
  getAddressFromArgs,
  getChainIdByNetworkName,
  getABIsFromArtifacts,
  getMetadataFromAddress,
  getFunctionSelectorFromAbi
} = require('./lib/utils.js')
const { 
  createAddFacetCut
} = require('../scripts/libraries/cuts.js')

async function runCommands(commands, args) {
  for (let i = 0; i<commands.length; i++) { 
    let command = `${commands[i]} --o ${args.o}`
    if (commands[i] == 'npx hardhat diamond:clone' || 'hh diamond:clone') {
      command = command.concat(` --address ${args.address}`)
    }
    try {
      console.log(command)
      const {stdout} = await exec(command)
      console.log(stdout)
    } catch(e) {
      if (e.toString().includes('HH108')) {
        console.error('You need to run the development environment first, try running: yarn dev:start in another terminal before running this command.')
        process.exit(1)
      } else {
        console.log(e.toString())
      }
    }
  }
}

require('dotenv').config();

task("diamond:deploy", "Deploy a new diamond")
  .addOptionalParam("o", "The diamond file to deploy", "diamond.json")
  .addFlag("new", "Deploy a new Diamond")
  .addFlag("excludeLoupe", "Exclude loupe facet from default address as remote facet")
  .addFlag("excludeOwnership", "Exclude cut facet from default address as remote facet")
  .setAction(async (args, hre) => {
    const CHAIN_ID = getChainIdByNetworkName(hre.config.defaultNetwork)

    await hre.run("clean")
    await hre.run("compile")
    
    console.log(`Deploying Diamond...`)
    let contractsToVerify = []

    let diamondJson
    if (args.new) {
      diamondJson = {
        functionSelectors: {},
        contracts: {},
      }
    } else {
      diamondJson = await getDiamondJson(args.o)
    }

    const accounts = await ethers.getSigners()
    const contractOwner = accounts[0]

    // deploy DiamondCutFacet
    let diamondCutFacetAddress
    if (args.new) {
      const DiamondCutFacet = await ethers.getContractFactory('DiamondCutFacet')
      const diamondCutFacet = await DiamondCutFacet.deploy()
      diamondCutFacetAddress = diamondCutFacet.address
      await diamondCutFacet.deployed()
  
      contractsToVerify.push({
        name: 'DiamondCutFacet',
        address: diamondCutFacetAddress
      })
    } else {
      diamondCutFacetAddress = diamondJson.contracts.DiamondCutFacet.address
    }

    // deploy Diamond
    const Diamond = await ethers.getContractFactory('Diamond')
    const diamond = await Diamond.deploy(contractOwner.address, diamondCutFacetAddress, '0x62E3133bd2BA458baBfE0b156ECf2475dF4CFa5E')
    await diamond.deployed()

    contractsToVerify.push({
      name: 'Diamond',
      address: diamond.address
    })
    
    let diamondInit
    /* if (args.new) { */
    const DiamondInit = await ethers.getContractFactory('DiamondInit')
    diamondInit = await DiamondInit.deploy()
    await diamondInit.deployed()

    diamondJson.contracts.DiamondInit = {
      "name": "DiamondInit",
      "address": diamondInit.address,
      "type": "remote"
    }
    contractsToVerify.push({
      name: 'DiamondInit',
      address: diamondInit.address
    })

    diamondJson.type = 'remote'
    diamondJson.address = diamond.address
    await setDiamondJson(diamondJson, args.o)

    console.log(`[OK] Diamond deployed at address: ${diamond.address}`)


    let diamondLoupeFacetAddress
    if (args.new) {
      const DiamondLoupeFacet = await ethers.getContractFactory('Readable')
      const diamondLoupeFacet = await DiamondLoupeFacet.deploy()
      diamondLoupeFacetAddress = diamondLoupeFacet.address
      await diamondLoupeFacet.deployed()
  
      contractsToVerify.push({
        name: 'Readable',
        address: diamondLoupeFacetAddress
      })
    } else {
      diamondLoupeFacetAddress = diamondJson.contracts.DiamondLoupeFacet.address
    }

    let ownershipFacetAddress
    if (args.new) {
      const OwnershipFacet = await ethers.getContractFactory('Ownership')
      const ownershipFacet = await OwnershipFacet.deploy()
      ownershipFacetAddress = ownershipFacet.address
      await ownershipFacet.deployed()
  
      contractsToVerify.push({
        name: 'Ownership',
        address: ownershipFacetAddress
      })
    } else {
      ownershipFacetAddress = diamondJson.contracts.OwnershipFacet.address
    }

    const res = await verify(contractsToVerify)
    
    console.log('[OK] Diamond verified')

    if (args.new) {
      await hre.run('diamond:add', {
        o: args.o,
        remote: true,
        address: diamondCutFacetAddress
      })
      await hre.run('diamond:add', {
        o: args.o,
        remote: true,
        address: diamondInit.address,
        skipFunctions: true
      })
    }


    const cut = []
    if (!args.excludeLoupe) {
      console.log('Adding Loupe Facet...')
      const facet = await ethers.getContractAt('Readable', diamondLoupeFacetAddress)
      cut.push({
        facetAddress: facet.address,
        action: FacetCutAction.Add,
        functionSelectors: getSelectors(facet)
      })
      if (args.new) {
        await hre.run('diamond:add', {
          o: args.o,
          remote: true,
          address: diamondLoupeFacetAddress
        })
      }
    }
    if (!args.excludeOwnership) {
      console.log('Adding Ownership Facet...')
      const facet = await ethers.getContractAt('Ownership', ownershipFacetAddress)
      cut.push({
        facetAddress: facet.address,
        action: FacetCutAction.Add,
        functionSelectors: getSelectors(facet)
      })
      if (args.new) {
        await hre.run('diamond:add', {
          o: args.o,
          remote: true,
          address: ownershipFacetAddress
        })
      }
    }

    if (!args.excludeLoupe || !args.excludeOwnership) {
      const diamondCut = await ethers.getContractAt('IDiamondCut', diamond.address)
      let tx
      let receipt
      // call to init function
      let functionCall = diamondInit.interface.encodeFunctionData('init')
      tx = await diamondCut.diamondCut(cut, diamondInit.address, functionCall)
      receipt = await tx.wait()
      if (!receipt.status) {
        throw Error(`[ERR] Diamond upgrade failed: ${tx.hash}`)
      }
      console.log(`[OK] Diamond cut complete`)  
    }

    await hre.run('diamond:cut', {
      o: args.o
    })

  })

task("diamond:clone", "Do stuff with diamonds")
  .addParam("address", "The diamond's address")
  .addOptionalParam("o", "The file to create", "diamond.json")
  .setAction(async (args, hre) => {
    const signer = await ethers.getSigners();
    const CHAIN_ID = getChainIdByNetworkName(hre.config.defaultNetwork)
    let output = await loupe(args.address, CHAIN_ID)

    let facets = [];
    for (const contract of Object.values(output.contracts)) {
      facets.push(await ethers.getContractAt(contract.name, contract.address));
    }
    let cuts = createAddFacetCut(facets);
    const Diamond = await ethers.getContractFactory('Diamond');
    const diamond = await Diamond.deploy(signer[0].address, cuts, ethers.constants.AddressZero, '0x');
    await diamond.deployed();
    output.address = diamond.address;

    if (args.o) {
      let filename = args.o
      await promises.writeFile('./' + filename, JSON.stringify(output, null, 2));
    } else {
      console.log(output)
    }
  });

task("diamond:status", "Compare the local diamond.json with the remote diamond")
  .addOptionalParam("address", "The diamond's address", "")
  .addOptionalParam("o", "The file to create", "diamond.json")
  .setAction(async (args) => {
    const CHAIN_ID = getChainIdByNetworkName(hre.config.defaultNetwork)
    let address = await getAddressFromArgs(args)

    let output1 = await loupe(address, CHAIN_ID)

    let output2 = await getDiamondJson(args.o)

    const differentiator = new DiamondDifferentiator(output1, output2)

    console.log('\nDiamonds:')
    console.log('\tAdd: ', differentiator.getFunctionsFacetsToAdd())
    console.log('\tRemove: ', differentiator.getFunctionsFacetsToRemove())
    console.log('\tReplace: ', differentiator.getFunctionFacetsToReplace())
    console.log('\nContracts to deploy:')
    console.log(differentiator.getContractsToDeploy())
  });


task("diamond:add", "Adds or replace facets and functions to diamond.json")
  .addFlag("remote", "Add remote facet")
  .addFlag("local", "Add local facet")
  .addOptionalParam("o", "The diamond file to output to", "diamond.json")
  .addOptionalParam("address", "The address of the remote facet to add")
  .addOptionalParam("name", "The name of the local facet to add")
  .addOptionalParam("links", "Libraries to link", "")
  .addFlag("skipFunctions", "Only add contract")
  .setAction(
  async (args, hre) => {
    const CHAIN_ID = getChainIdByNetworkName(hre.config.defaultNetwork)
    if (args.remote && args.local) {
      return console.log('remote or local, not both')
    }
    const diamondJson = await getDiamondJson(args.o)
    if (args.remote) {

      const {abi, name} = await getMetadataFromAddress(args.address)

      // return
      diamondJson.contracts[name] = {
        name,
        address: args.address,
        type: "remote"
      }
      if (!args.skipFunctions) {
        for(let obj of abi) {
          if (obj.type === 'function') {
            diamondJson.functionSelectors[getFunctionSelectorFromAbi(obj)] = name
          }
        }
      }
      await setDiamondJson(diamondJson, args.o)
      console.log(`[OK] Add facet ${name} to ${args.o}`)
    } else if (args.local) {

      await hre.run("clean")
      await hre.run("compile")

      const ABIs = await getABIsFromArtifacts()

      const FacetName = args.name

      const functionSelectors = {}
      ABIs[FacetName].filter(el => el.type==='function').forEach(el => {
        functionSelectors[getFunctionSelectorFromAbi(el)] = FacetName
      })
      
      diamondJson.contracts[FacetName] = {
        "name": FacetName,
        "type": "local"
      }

      const links = args.links.split(',').filter(link => link != "")
      if (links.length>0) {
        diamondJson.contracts[FacetName].links = links
      }

      diamondJson.functionSelectors = {...diamondJson.functionSelectors, ...functionSelectors}

      console.log(`[OK] Add facet ${FacetName} to ${args.o}`)
      await setDiamondJson(diamondJson, args.o)
    }
  });

// diamond:remove
task("diamond:remove", "Remove facets and functions to diamond.json")
  .addOptionalParam("o", "The diamond file to output to", "diamond.json")
  .addOptionalParam("name", "The name of the local facet to add")
  .setAction(
  async (args, hre) => {
    const FacetName = args.name
    const diamondJson = await getDiamondJson(args.o)
    
    let newFunctionSelectors = {}
    for (let fn in diamondJson.functionSelectors) {
      let facet = diamondJson.functionSelectors[fn]
      if (facet != FacetName) {
        newFunctionSelectors[fn] = facet
      }
    }
    diamondJson.functionSelectors = newFunctionSelectors
    console.log(`[OK] Remove facet ${FacetName} from ${args.o}`)
    await setDiamondJson(diamondJson, args.o)
  });

// diamond:replace

async function deployAndVerifyFacetsFromDiff(facetsToDeployAndVerify, CHAIN_ID) {
  /**@notice deploy new facets */
  if (facetsToDeployAndVerify.length === 0) {
    []
  }
  console.log('Deploying facets...')
  let contracts = []
  for (const contract of facetsToDeployAndVerify) {
    const FacetName = contract.name
    let Facet
    if (contract.links) {
      const libraries = {}
      for (let link of contract.links) {
        let Link = await ethers.getContractFactory(link)
        const linkDeployed = await Link.deploy()
        libraries[link] = linkDeployed.address
      }
      Facet = await ethers.getContractFactory(FacetName, { libraries })
    } else {
      Facet = await ethers.getContractFactory(FacetName)
    }
    const facet = await Facet.deploy()
    await facet.deployed()
    contracts.push({
      name: contract.name,
      address: facet.address
    })
    console.log(`[OK] Facet '${contract.name}' deployed with address ${facet.address}`)
  }

  console.log('Starting verification process on Sourcify...')
  
  const res = await verify(contracts)
  console.log('[OK] Deployed facets verified')
  return contracts
}

// deploy and verify new or changed facets
task("diamond:cut", "Compare the local diamond.json with the remote diamond")
  .addOptionalParam("address", "The diamond's address", "")
  .addOptionalParam("o", "The file to create", "diamond.json")
  .addOptionalParam("initFacet", "Facet to init", "")
  .addOptionalParam("initFn", "Function to call during init", "")
  .addOptionalParam("initParams", "Parameters to pass during init", "")
  .setAction(async (args, hre) => {
    const CHAIN_ID = getChainIdByNetworkName(hre.config.defaultNetwork)
    let address = await getAddressFromArgs(args)

    await hre.run("clean")
    await hre.run("compile")

    /**@notice get contracts to deploy by comparing local and remote diamond.json */
    console.log('Louping diamond...')
    let output1 = await loupe(address, CHAIN_ID)
    console.log('[OK] Diamond louped')
    
    const diamondJson = await getDiamondJson(args.o)
    const differentiator = new DiamondDifferentiator(output1, diamondJson)
    const facetsToDeployAndVerify = differentiator.getContractsToDeploy();

    const verifiedFacets = await deployAndVerifyFacetsFromDiff(facetsToDeployAndVerify, CHAIN_ID)

    const facetsToAdd = differentiator.getFunctionsFacetsToAdd()

    /**@notice create functionSelectors for functions needed to add */
    let cut = [];

    let diamondJsonContracts = {...diamondJson.contracts}
    verifiedFacets.forEach(vf => {
      diamondJsonContracts[vf.name] = {
        name: vf.name,
        address: vf.address,
        type: 'remote'
      }
    })
    // TOODO: let diamondJsonFunctionSelectors = {...diamondJson.functionSelectors}

    for (let f of facetsToAdd) {
      let facetAddress
      if (diamondJson.contracts[f.facet].type === 'remote') {
        facetAddress = diamondJson.contracts[f.facet].address
      } else {
        facetAddress = verifiedFacets.find(vf => vf.name === f.facet).address
      }
      const {abi} = await getMetadataFromAddress(facetAddress)
      const facet = new ethers.Contract(facetAddress, abi)
  
      let fnNamesSelectors = await getFunctionsNamesSelectorsFromFacet(facet)
      let fn = fnNamesSelectors.find(ns => ns.name === f.fn)
      let cutAddressIndex = cut.findIndex(c => c.facetAddress === facetAddress && c.action === FacetCutAction.Add)
      if(cutAddressIndex === -1) {
        cut.push({
          facetAddress: facetAddress,
          action: FacetCutAction.Add,
          functionSelectors: [fn.selector]
        })
      } else {
        cut[cutAddressIndex].functionSelectors.push(fn.selector)
      }
    }

    const facetsToReplace = differentiator.getFunctionFacetsToReplace()
    for (let f of facetsToReplace) {  
      let facetAddress
      if (diamondJson.contracts[f.facet].type === 'remote') {
        facetAddress = diamondJson.contracts[f.facet].address
      } else {
        facetAddress = verifiedFacets.find(vf => vf.name === f.facet).address
      }
      const {abi} = await getMetadataFromAddress(facetAddress)
      const facet = new ethers.Contract(facetAddress, abi)
  
      let fnNamesSelectors = await getFunctionsNamesSelectorsFromFacet(facet)
      let fn = fnNamesSelectors.find(ns => ns.name === f.fn)
      let cutAddressIndex = cut.findIndex(c => c.facetAddress === facetAddress && c.action === FacetCutAction.Add)
      if(cutAddressIndex === -1) {
        cut.push({
          facetAddress: facetAddress,
          action: FacetCutAction.Replace,
          functionSelectors: [fn.selector]
        })
      } else {
        cut[cutAddressIndex].functionSelectors.push(fn.selector)
      }
    }
    
    const facetsToRemove = differentiator.getFunctionsFacetsToRemove()
    for (let f of facetsToRemove) {
      let facetAddress
      if (diamondJson.contracts[f.facet].type === 'remote') {
        facetAddress = diamondJson.contracts[f.facet].address
      } else {
        facetAddress = verifiedFacets.find(vf => vf.name === f.facet).address
      }
      const {abi} = await getMetadataFromAddress(facetAddress)
      const facet = new ethers.Contract(facetAddress, abi)
  
      let fnNamesSelectors = await getFunctionsNamesSelectorsFromFacet(facet)
      let fn = fnNamesSelectors.find(ns => ns.name === f.fn)
      let cutAddressIndex = cut.findIndex(c => c.facetAddress === facetAddress && c.action === FacetCutAction.Add)
      if(cutAddressIndex === -1) {
        cut.push({
          facetAddress: ethers.constants.AddressZero,
          action: FacetCutAction.Remove,
          functionSelectors: [fn.selector]
        })
      } else {
        cut[cutAddressIndex].functionSelectors.push(fn.selector)
      }
      if (cut[cutAddressIndex] && cut[cutAddressIndex].functionSelectors.length === fnNamesSelectors.length) {
        delete diamondJson.contracts[FacetName]
      }
    }

    /**@notice cut in facets */
    console.log(`Cutting Diamond's facets...`)
    // do the cut
    const diamondCut = await ethers.getContractAt('IDiamondCut', address)
    let tx
    let receipt
    
    // call to init function
    let initAddress = "0x0000000000000000000000000000000000000000"
    let functionCall = []

    if (args.initFacet !== "" && args.initFn !== "") {
      initAddress = address
      let facetAddress
      if (diamondJson.contracts[args.initFacet].type === 'remote') {
        facetAddress = diamondJson.contracts[args.initFacet].address
      } else {
        facetAddress = verifiedFacets.find(vf => vf.name === args.initFacet).address
      }

      const {abi} = await getMetadataFromAddress(facetAddress)

      let iface = new ethers.utils.Interface(abi)
      let params = []
      if (args.initParams.length >= 0) {
        params = args.initParams.split(',')
      }
      functionCall = iface.encodeFunctionData(args.initFn, params)
    }
    
    tx = await diamondCut.diamondCut(cut, initAddress, functionCall, {gasLimit: 10000000})

    receipt = await tx.wait()
    if (!receipt.status) {
      throw Error(`Diamond upgrade failed: ${tx.hash}`)
    }

    diamondJson.contracts = diamondJsonContracts

    await setDiamondJson(diamondJson, args.o)

    console.log('[OK] Completed diamond cut')

    // and input facet's address and type into diamond.json
  });

task("diamond:init", "Init the diamond.json from the DIAMONDFILE")
  .addOptionalParam("o", "The file to create", "diamond.json")
  .setAction(async (args, hre) => {
    const diamondFile = fs.readFileSync('DIAMONDFILE')
    const commands = diamondFile.toString().split('\n')

    await runCommands(commands, args)
  });

module.exports = {};


