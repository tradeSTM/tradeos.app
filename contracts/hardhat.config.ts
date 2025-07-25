import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-etherscan";
import * as dotenv from "dotenv";

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY || "";
const BSCSCAN_API_KEY = process.env.BSCSCAN_API_KEY || "";
const OPTIMISM_API_KEY = process.env.OPTIMISM_API_KEY || "";
const ARBISCAN_API_KEY = process.env.ARBISCAN_API_KEY || "";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    mainnet: {
      url: `https://eth-mainnet.public.blastapi.io`,
      accounts: [PRIVATE_KEY],
      chainId: 1
    },
    polygon: {
      url: `https://polygon-rpc.com`,
      accounts: [PRIVATE_KEY],
      chainId: 137
    },
    arbitrum: {
      url: `https://arb1.arbitrum.io/rpc`,
      accounts: [PRIVATE_KEY],
      chainId: 42161
    },
    optimism: {
      url: `https://mainnet.optimism.io`,
      accounts: [PRIVATE_KEY],
      chainId: 10
    },
    bsc: {
      url: `https://bsc-dataseed1.binance.org`,
      accounts: [PRIVATE_KEY],
      chainId: 56
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [PRIVATE_KEY],
      chainId: 5
    }
  },
  etherscan: {
    apiKey: {
      mainnet: ETHERSCAN_API_KEY,
      polygon: POLYGONSCAN_API_KEY,
      bsc: BSCSCAN_API_KEY,
      optimisticEthereum: OPTIMISM_API_KEY,
      arbitrumOne: ARBISCAN_API_KEY,
      goerli: ETHERSCAN_API_KEY
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};

export default config;
