# On-chain Library integration
> This branch focuses on integrating the Gemcutter development environment with an onchain presets library. This can be accomplished through a DiamondCutFacet that is integrated with an already-deployed diamond that stores the presets and provides a git-system for reading/writing to the library.

To understand how the contracts work, see: https://github.com/0xHabitat/ontap_contracts

## Run through the process:
1. download hardhat packages: `yarn`
2. start ganache: `yarn dev:start`
3. deploy ontap diamond and generate conract info in ./ui/contracts: `npx hardhat run scripts/deploy.js`
4. run test to make commits to the git-system: `npx hardhat test`

### What is new?
- the deploy script *deploy.js* deploys a git-diamond for the test env
- diamond:clone deploys a new diamond proxy contract, cutting the cloned facets in its constructor
- the ***runCommands(..)*** function now accepts `args` type instead of `file`

---

# Diamond Task

## Work in Progress
Everything you see is under development and it's just a prototype

## Docs
Read the docs here https://docs.0xhabitat.org/Developers/Gemcutter
(Just a part of the docs is actually implemented here)

## Getting started (testing)

0. Install the dependencies
    ```bash
    yarn
    ```
1. When you work locally using gemcutter you always need to have the development environment online. You can start it using
    ```bash
    yarn dev:start
    ```
    
2. Start the tests
    ```
    yarn test
    ```


## DIAMONDFILE

When you are satisfied with the .diamond.json file you need to save your progress into the DIAMONDFILE. You can do it manually creating a file like this

```
npx hardhat diamond:deploy --new
npx hardhat diamond:add --local --name MyToken
npx hardhat diamond:cut --init-facet MyToken --init-fn initMyToken --init-params "Habitat,HBT,8,0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1"
npx hardhat diamond:add --local --name VotingPowerFacet --links LibVotingPower
npx hardhat diamond:add --local --name TreasuryDefaultCallbackHandlerFacet
npx hardhat diamond:add --local --name TreasuryVotingFacet --links LibVotingPower
npx hardhat diamond:add --local --name TreasuryViewerFacet
npx hardhat diamond:cut
```
