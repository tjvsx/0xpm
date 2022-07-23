require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require('dotenv').config();
require("hardhat-diamond-abi");
require('hardhat-abi-exporter');
require('hardhat-dependency-compiler');


//tasks
require("./tasks/diamond.js");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
// task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
//   const accounts = await hre.ethers.getSigners();

//   for (const account of accounts) {
//     console.log(account.address);
//   }
// });

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

module.exports = {
  solidity: "0.8.12",
  defaultNetwork: "goerli",
  networks: {
    ganache: {
      url: "http://localhost:7545",
      /*      
        uses account 0 of the hardhat node to deploy
      */
    },
    rinkeby: {
      url: `${process.env.RINKEBY_URL}`,
      accounts: [`0x${process.env.PRIVATE_KEY}`, `0x${process.env.PRIVATE_KEY_1}`],
      gas: 21000000,
      gasPrice: 8000000000,
    },
    goerli: {
      url: `${process.env.GOERLI_URL}`,
      accounts: [`0x${process.env.PRIVATE_KEY}`, `0x${process.env.PRIVATE_KEY_1}`],
      gas: 21000000,
      gasPrice: 8000000000,
    },
  },
  settings: {
    optimizer: {
      enabled: true,
      runs: 1000,
    },
  },
  mocha: {
    timeout: 10000000
  },
  diamondAbi: {
    name: "XpmDiamond",
    include: [
      "Xpm", 
      "Erc165", 
      "Ownership", 
      "Readable",
      "Writable", 
      "Git", 
      "PackageManager",
      "DiamondFactory"
    ],
    strict: false, /// TODO: causing error -- sighash "appears twice"
  },
  abiExporter: {
    path: '../web/src/lib/abis',
    runOnCompile: true,
    clear: true,
    flat: true,
    only: [
      'XpmDiamond', 
      'Git', 
      'Writable', 
      'Erc165', 
      'Ownership', 
      'Readable',
      'PackageManager',
      'DiamondFactory',
      'Upgrade', 
      'Installer', 
      'Uninstaller',
      'XpmInit'
    ],
    spacing: 2,
    pretty: false,
  },
  dependencyCompiler: {
    paths: [
      '@solidstate/contracts',
    ],
  }
};
