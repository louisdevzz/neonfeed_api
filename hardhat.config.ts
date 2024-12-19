import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    'ancient8-celestia-testnet': {
      url: 'https://rpcv2-testnet.ancient8.gg',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 28122024,
    }
  },
  etherscan: {
    apiKey: {
      'ancient8-celestia-testnet': 'empty'
    },
    customChains: [
      {
        network: "ancient8-celestia-testnet",
        chainId: 28122024,
        urls: {
          apiURL: "https://scanv2-testnet.ancient8.gg/api",
          browserURL: "https://scanv2-testnet.ancient8.gg:443"
        }
      }
    ]
  },
  sourcify: {
    enabled: true
  }
};

export default config; 