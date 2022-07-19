/* global ethers */
const axios = require('axios').default;

const {
  getDiamondJson,
  getMetadataFromAddress,
} = require('../../tasks/lib/utils.js')

const FacetCutAction = { Add: 0, Replace: 1, Remove: 2 }

// get function selectors from ABI
function getSelectors (contract) {
  const signatures = Object.keys(contract.interface.functions)
  const selectors = signatures.reduce((acc, val) => {
    if (val !== 'init(bytes)') {
      acc.push(contract.interface.getSighash(val))
    }
    return acc
  }, [])
  selectors.contract = contract
  selectors.remove = remove
  selectors.get = get
  return selectors
}

// get function selector from function signature
function getSelector (func) {
  const abiInterface = new ethers.utils.Interface([func])
  return abiInterface.getSighash(ethers.utils.Fragment.from(func))
}

// used with getSelectors to remove selectors from an array of selectors
// functionNames argument is an array of function signatures
function remove (functionNames) {
  const selectors = this.filter((v) => {
    for (const functionName of functionNames) {
      if (v === this.contract.interface.getSighash(functionName)) {
        return false
      }
    }
    return true
  })
  selectors.contract = this.contract
  selectors.remove = this.remove
  selectors.get = this.get
  return selectors
}

// used with getSelectors to get selectors from an array of selectors
// functionNames argument is an array of function signatures
function get (functionNames) {
  const selectors = this.filter((v) => {
    for (const functionName of functionNames) {
      if (v === this.contract.interface.getSighash(functionName)) {
        return true
      }
    }
    return false
  })
  selectors.contract = this.contract
  selectors.remove = this.remove
  selectors.get = this.get
  return selectors
}

// remove selectors using an array of signatures
function removeSelectors (selectors, signatures) {
  const iface = new ethers.utils.Interface(signatures.map(v => 'function ' + v))
  const removeSelectors = signatures.map(v => iface.getSighash(v))
  selectors = selectors.filter(v => !removeSelectors.includes(v))
  return selectors
}

// find a particular address position in the return value of diamondLoupeFacet.facets()
function findAddressPositionInFacets (facetAddress, facets) {
  for (let i = 0; i < facets.length; i++) {
    if (facets[i].facetAddress === facetAddress) {
      return i
    }
  }
}

async function updateDiamond(TEST_FILE, CHAIN_ID) {
  const diamondJson = await getDiamondJson(TEST_FILE)
  const accounts = await ethers.getSigners()
  const contractOwner = accounts[0]


  let abis = []
  for (let FacetName in diamondJson.contracts) {
    const facet = diamondJson.contracts[FacetName]
    const {abi} = await getMetadataFromAddress(facet.address)

    abis = abis.concat(abi.filter((abiElement, index, abi) => {
      if (abiElement.type === "constructor") {
        return false;
      }

      return true;
    }))
  }

  return new ethers.Contract(diamondJson.address, abis, contractOwner)
}

async function testEnvironmentIsReady() {
  let ganacheIsReady = false

  while(!ganacheIsReady) {
    if (!ganacheIsReady) {
      try {
        console.log('Waiting for ganache to be active...')
        await axios.get('http://localhost:8545')
      } catch(e) {
        if (e.code != "ECONNREFUSED" && e.response.status === 404) {
          ganacheIsReady = true
        }
      }
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  return
}

exports.getSelectors = getSelectors
exports.getSelector = getSelector
exports.FacetCutAction = FacetCutAction
exports.remove = remove
exports.removeSelectors = removeSelectors
exports.findAddressPositionInFacets = findAddressPositionInFacets
exports.updateDiamond = updateDiamond
exports.testEnvironmentIsReady = testEnvironmentIsReady