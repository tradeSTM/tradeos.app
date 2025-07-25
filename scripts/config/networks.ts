export const networkConfigs = {
  // Mainnets
  ethereum: {
    name: 'Ethereum Mainnet',
    chainId: 1,
    rpc: process.env.ETH_MAINNET_RPC || 'https://eth-mainnet.g.alchemy.com/v2/',
    explorer: 'https://etherscan.io',
    contracts: {
      aave: '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9',
      uniswap: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
      compound: '0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B'
    }
  },
  polygon: {
    name: 'Polygon Mainnet',
    chainId: 137,
    rpc: process.env.POLYGON_RPC || 'https://polygon-rpc.com',
    explorer: 'https://polygonscan.com',
    contracts: {
      aave: '0x8dFf5E27EA6b7AC08EbFdf9eB090F32ee9a30fcf',
      quickswap: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff'
    }
  },
  
  // Testnets
  goerli: {
    name: 'Goerli Testnet',
    chainId: 5,
    rpc: process.env.GOERLI_RPC || 'https://goerli.infura.io/v3/',
    explorer: 'https://goerli.etherscan.io',
    contracts: {
      aave: '0x368EedF3f56ad10b9bC57eed4Dac65B26Bb667f6',
      uniswap: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
    }
  },
  mumbai: {
    name: 'Mumbai Testnet',
    chainId: 80001,
    rpc: process.env.MUMBAI_RPC || 'https://rpc-mumbai.maticvigil.com',
    explorer: 'https://mumbai.polygonscan.com',
    contracts: {
      aave: '0x0b913A76beFF3887d35073b8e5530755D60F78C7',
      quickswap: '0x8954AfA98594b838bda56FE4C12a09D7739D179b'
    }
  }
}
