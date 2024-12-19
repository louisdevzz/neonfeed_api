require('dotenv').config();
require("@nomicfoundation/hardhat-toolbox");

const PRIVATE_KEY = process.env.PRIVATE_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    "ancient8-celestia-testnet": {
      url: "https://rpcv2-testnet.ancient8.gg",
      chainId: 28122024,
      accounts: [PRIVATE_KEY]
    }
  },
  etherscan: {
    apiKey: {
      "ancient8-celestia-testnet": "empty"
    },
    customChains: [
      {
        network: "ancient8-celestia-testnet",
        chainId: 28122024,
        urls: {
          apiURL: "https://scanv2-testnet.ancient8.gg/api",
          browserURL: "https://scanv2-testnet.ancient8.gg"
        }
      }
    ]
  }
};
