import { Chain } from '@web3-react/core'

export interface NetworkConfig {
  chainId: number
  name: string
  symbol: string
  rpcUrl: string
  explorerUrl: string
  iconUrl: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
}

export const SUPPORTED_NETWORKS: { [chainId: number]: NetworkConfig } = {
  1: {
    chainId: 1,
    name: 'Ethereum',
    symbol: 'ETH',
    rpcUrl: process.env.NEXT_PUBLIC_ETHEREUM_RPC || 'https://eth-mainnet.public.blastapi.io',
    explorerUrl: 'https://etherscan.io',
    iconUrl: '/assets/networks/ethereum.svg',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    }
  },
  137: {
    chainId: 137,
    name: 'Polygon',
    symbol: 'MATIC',
    rpcUrl: process.env.NEXT_PUBLIC_POLYGON_RPC || 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    iconUrl: '/assets/networks/polygon.svg',
    nativeCurrency: {
      name: 'Matic',
      symbol: 'MATIC',
      decimals: 18
    }
  },
  42161: {
    chainId: 42161,
    name: 'Arbitrum',
    symbol: 'ARB',
    rpcUrl: process.env.NEXT_PUBLIC_ARBITRUM_RPC || 'https://arb1.arbitrum.io/rpc',
    explorerUrl: 'https://arbiscan.io',
    iconUrl: '/assets/networks/arbitrum.svg',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    }
  },
  56: {
    chainId: 56,
    name: 'BNB Chain',
    symbol: 'BNB',
    rpcUrl: process.env.NEXT_PUBLIC_BSC_RPC || 'https://bsc-dataseed1.binance.org',
    explorerUrl: 'https://bscscan.com',
    iconUrl: '/assets/networks/binance.svg',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18
    }
  },
  10: {
    chainId: 10,
    name: 'Optimism',
    symbol: 'OP',
    rpcUrl: process.env.NEXT_PUBLIC_OPTIMISM_RPC || 'https://mainnet.optimism.io',
    explorerUrl: 'https://optimistic.etherscan.io',
    iconUrl: '/assets/networks/optimism.svg',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    }
  },
  // Add testnet configurations
  5: {
    chainId: 5,
    name: 'Goerli',
    symbol: 'ETH',
    rpcUrl: process.env.NEXT_PUBLIC_GOERLI_RPC || 'https://goerli.infura.io/v3/',
    explorerUrl: 'https://goerli.etherscan.io',
    iconUrl: '/assets/networks/ethereum.svg',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    }
  }
}
