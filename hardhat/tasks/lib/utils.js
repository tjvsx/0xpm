const fs = require("fs");
const { promises } = fs
const {decode} = require('cbor-x')
const cborDecode = decode
const bs58 = require('bs58')
const IPFS = require('ipfs-http-client')

let utils = {
  getChainIdByNetworkName(networkName) {
    switch(networkName) {
      case 'ganache': return 1337
      case 'hardhat': return 31337
      case 'rinkeby': return 4
      default: throw 'Add chainId in utils.js'
    }
  },
  async getAddressFromArgs(args) {
    let address
    if (args.address !== "") {
      address = args.address
    } else {
      let diamondJson = await utils.getDiamondJson(args.o)
      address = diamondJson.address
    }
    return address
  },
  async getDiamondJson(file) {
    try {
      let diamondFile = await fs.promises.readFile(`./${file}`)
      return JSON.parse(diamondFile)
    } catch (e) {
      return false
    }
  },
  async setDiamondJson(json, filename) {
    try {
      await promises.writeFile('./' + filename, JSON.stringify(json, null, 2));
    } catch (e) {
      console.log(e)
      return false
    }
  },
  async loupe(address, CHAIN_ID) {
    const diamondLoupeFacet = await ethers.getContractAt('Readable', address)
    const facets = await diamondLoupeFacet.facets()
    
    let contracts = {}
    let functionSelectors = {}
    
    for await (const facet of facets) {
      const address = facet[0]
      
      const {abi, name} = await utils.getMetadataFromAddress(address)

      const facetObj = new ethers.Contract(address, abi)
      let fnNamesSelectors = await utils.getFunctionsNamesSelectorsFromFacet(facetObj)
      const cuttedFacets = await diamondLoupeFacet.facetFunctionSelectors(address)

      let functions = []
      for (const obj of abi) {
        try {
          if (obj.type === 'function') {
            const selector = fnNamesSelectors.find(ns => ns.name == utils.getFunctionSelectorFromAbi(obj)).selector
            if (cuttedFacets.includes(selector)) {
              functions.push(utils.getFunctionSelectorFromAbi(obj))
            }
          }
        } catch(e) {}
      }

      contracts[name] = {
        name,
        address,
        type: 'remote',
      }

      functions.forEach(fn => {
        functionSelectors[fn] = name
      })
    }

    return {
      address: address,
      chaindId: CHAIN_ID, // TODO: how to get chainId
      functionSelectors,
      contracts
    }

  },
  async getABIsFromArtifacts() {
    const buildInfo = 'artifacts/build-info'
    const files = await promises.readdir(buildInfo)

    const buffer = await promises.readFile(`${buildInfo}/${files[0]}`)
    const string = await buffer.toString()
    const json = JSON.parse(string)
    const abis = {}
    for (let path in json.output.contracts) {
      for (let contract in json.output.contracts[path]) {
        abis[contract] = json.output.contracts[path][contract].abi
      }
    }
    return abis
  },
  async verify(contracts) {
    const node = await IPFS.create()
    const buildInfo = 'artifacts/build-info'
    const files = await promises.readdir(buildInfo)

    const buildInfoBuffer = await promises.readFile(`${buildInfo}/${files[0]}`)
    const string = await buildInfoBuffer.toString()
    const buildInfoJson = JSON.parse(string)

    for (contract of contracts) {
      
      for (contractsInFile of Object.values(buildInfoJson.output.contracts)) {
        let isRight = Object.keys(contractsInFile).includes(contract.name)
        if (isRight) {
          let buildInfoContract = contractsInFile[contract.name]
          const results = await node.add(new Buffer.from(buildInfoContract.metadata))
        }
      }
    }

    return true;
  },

  createDiamondFileFromSources() {

    const facetsPath = "/contracts/facets/";
    let files = fs.readdirSync("." + facetsPath);

    let contracts = {}
    let functionSelectors = {}

    for (const file of files) {
      const name = file.replace(".sol", "");
      const abi = hre.artifacts.readArtifactSync(name).abi

      let functions = []
      let events = []
      for (const obj of abi) {
        if (obj.type === 'function') {
          functions.push(obj.name)
        }
        if (obj.type === 'event') {
          events.push(obj.name)
        }
      }

      contracts[name] = {
        name,
        type: 'local',
      }

      functions.forEach(fn => {
        functionSelectors[fn] = name
      })

    }

    return {
      functionSelectors,
      contracts
    }
  },
  async getFunctionsNamesSelectorsFromFacet(contract) {
    const signatures = Object.keys(contract.interface.functions)
    const names = signatures.reduce((acc, val) => {
      if (val !== 'init(bytes)') {
        acc.push({
          name: val,
          selector: contract.interface.getSighash(val)
        })
      }
      return acc
    }, [])
    return names
  },
  async getMetadataFromAddress(address) {
    const url = "http://localhost:8545";
    const provider = new ethers.providers.JsonRpcProvider(url);

    const fromHexString = hexString => new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

    const bytecode = await provider.getCode(address);
    const ipfsHashLength =  parseInt(`${bytecode.substr(bytecode.length - 4)}`, 16);
    const cborEncoded = bytecode.substring(bytecode.length - 4 - ipfsHashLength*2, bytecode.length - 4)
    const contractMetadata = cborDecode(fromHexString(cborEncoded))
    const toHexString = bytes => bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
    
    const node = await IPFS.create()
    
    const stream = node.cat(bs58.encode(contractMetadata.ipfs))

    let data = ''

    for await (const chunk of stream) {
      // chunks of data are returned as a Buffer, convert it back to a string
      data += chunk.toString()
    }

    const contractMetadataJSON = JSON.parse(data)
    const name = Object.values(contractMetadataJSON.settings.compilationTarget)[0]

    const abi = contractMetadataJSON.output.abi

    return {name,abi}
  },
  handleComponents(input) {
    if (input.type === 'tuple') {
      return `(${input.components.map(c => utils.handleComponents(c)).join(',')})`
    } else if (input.type === 'tuple[]') {
      return `(${input.components.map(c => utils.handleComponents(c)).join(',')})[]`
    } else {
      return input.type
    }
  },
  getFunctionSelectorFromAbi(abi) {
    let arguments = ''
    let types = abi.inputs.map(i => utils.handleComponents(i))
    return `${abi.name}(${types.join(',')})`
  }
}

module.exports = utils