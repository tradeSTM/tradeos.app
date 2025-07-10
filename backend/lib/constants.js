export const CHAINS = {
  Ethereum: { name: "Ethereum", rpc: process.env.ETHEREUM_RPC, symbol: "ETH" },
  Polygon: { name: "Polygon", rpc: process.env.POLYGON_RPC, symbol: "MATIC" },
  Base: { name: "Base", rpc: process.env.BASE_RPC, symbol: "ETH" },
  Optimism: { name: "Optimism", rpc: process.env.OPTIMISM_RPC, symbol: "ETH" },
  Arbitrum: { name: "Arbitrum", rpc: process.env.ARBITRUM_RPC, symbol: "ETH" }
};