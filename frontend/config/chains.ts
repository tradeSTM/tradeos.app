import { ethers } from 'ethers';

export interface ChainConfig {
  id: number;
  name: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
  iconUrl: string;
  verificationApi?: string;
  apiKey?: string;
  averageBlockTime: number;
  confirmations: number;
  gasMultiplier: number;
  maxGasPrice: string;
  features: {
    eip1559: boolean;
    l2: boolean;
    sequencer?: boolean;
    optimistic?: boolean;
    zk?: boolean;
  };
}

export const CHAIN_CONFIGS: { [chainId: number]: ChainConfig } = {
  // Base Mainnet
  8453: {
    id: 8453,
    name: 'Base',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: [
      'https://mainnet.base.org',
      'https://1rpc.io/base',
      'https://base.blockpi.network/v1/rpc/public'
    ],
    blockExplorerUrls: ['https://basescan.org'],
    iconUrl: '/images/networks/base.svg',
    verificationApi: 'https://api.basescan.org/api',
    apiKey: process.env.NEXT_PUBLIC_BASESCAN_API_KEY,
    averageBlockTime: 2,
    confirmations: 15,
    gasMultiplier: 1.2,
    maxGasPrice: '100',
    features: {
      eip1559: true,
      l2: true,
      optimistic: true
    }
  },

  // Arbitrum One
  42161: {
    id: 42161,
    name: 'Arbitrum One',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: [
      'https://arb1.arbitrum.io/rpc',
      'https://1rpc.io/arb',
      'https://arbitrum-one.public.blastapi.io'
    ],
    blockExplorerUrls: ['https://arbiscan.io'],
    iconUrl: '/images/networks/arbitrum.svg',
    verificationApi: 'https://api.arbiscan.io/api',
    apiKey: process.env.NEXT_PUBLIC_ARBISCAN_API_KEY,
    averageBlockTime: 0.25,
    confirmations: 20,
    gasMultiplier: 1.1,
    maxGasPrice: '1.5',
    features: {
      eip1559: true,
      l2: true,
      optimistic: true
    }
  },

  // Optimism
  10: {
    id: 10,
    name: 'Optimism',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: [
      'https://mainnet.optimism.io',
      'https://1rpc.io/op',
      'https://optimism-mainnet.public.blastapi.io'
    ],
    blockExplorerUrls: ['https://optimistic.etherscan.io'],
    iconUrl: '/images/networks/optimism.svg',
    verificationApi: 'https://api-optimistic.etherscan.io/api',
    apiKey: process.env.NEXT_PUBLIC_OPTIMISM_API_KEY,
    averageBlockTime: 2,
    confirmations: 15,
    gasMultiplier: 1.15,
    maxGasPrice: '0.5',
    features: {
      eip1559: true,
      l2: true,
      optimistic: true
    }
  },

  // Polygon zkEVM
  1101: {
    id: 1101,
    name: 'Polygon zkEVM',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: [
      'https://zkevm-rpc.com',
      'https://1rpc.io/polygon-zkevm'
    ],
    blockExplorerUrls: ['https://zkevm.polygonscan.com'],
    iconUrl: '/images/networks/polygon-zkevm.svg',
    verificationApi: 'https://api-zkevm.polygonscan.com/api',
    apiKey: process.env.NEXT_PUBLIC_POLYGON_ZKEVM_API_KEY,
    averageBlockTime: 2,
    confirmations: 10,
    gasMultiplier: 1.3,
    maxGasPrice: '0.5',
    features: {
      eip1559: true,
      l2: true,
      zk: true
    }
  },

  // Local Hardhat Network
  31337: {
    id: 31337,
    name: 'Localhost',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['http://127.0.0.1:8545'],
    blockExplorerUrls: [],
    iconUrl: '/images/networks/ethereum.svg',
    averageBlockTime: 1,
    confirmations: 1,
    gasMultiplier: 1,
    maxGasPrice: '100',
    features: {
      eip1559: true,
      l2: false
    }
  }
};
