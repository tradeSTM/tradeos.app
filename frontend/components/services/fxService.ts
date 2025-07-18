// frontend/components/services/fxService.ts

export interface ChainContext {
  chain: string;
  chainId: number;
  network: 'ethereum' | 'polygon' | 'optimism' | 'base' | 'solana';
  type: 'EVM' | 'Solana';
  rpcUrl: string;
}

export function getChainContext(chain: string): ChainContext {
  switch (chain.toLowerCase()) {
    case 'ethereum':
      return {
        chain: 'ethereum',
        chainId: 1,
        network: 'ethereum',
        type: 'EVM',
        rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
      };
    case 'polygon':
      return {
        chain: 'polygon',
        chainId: 137,
        network: 'polygon',
        type: 'EVM',
        rpcUrl: 'https://polygon-rpc.com',
      };
    case 'optimism':
      return {
        chain: 'optimism',
        chainId: 10,
        network: 'optimism',
        type: 'EVM',
        rpcUrl: 'https://mainnet.optimism.io',
      };
    case 'base':
      return {
        chain: 'base',
        chainId: 8453,
        network: 'base',
        type: 'EVM',
        rpcUrl: 'https://mainnet.base.org', 
      };
    case 'solana':
      return {
        chain: 'solana',
        chainId: 0,            // Solana uses public key, so no numeric chainId
        network: 'solana',
        type: 'Solana',
        rpcUrl: 'https://api.mainnet-beta.solana.com',
      };
    default:
      throw new Error(`Unsupported chain: ${chain}`);
  }
}
