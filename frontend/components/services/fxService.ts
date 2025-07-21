// 🧠 TradeOS FX Service — Chain Context, Badge Tier, Bot Registry

export function getChainContext(): { chain: string; rpc: string } {
  const chainMap: Record<string, { chain: string; rpc: string }> = {
    // 🟢 EVM Chains
    '0x1':      { chain: 'Ethereum',        rpc: 'https://ethereum.publicnode.com' },
    '0x38':     { chain: 'BSC',             rpc: 'https://bsc-dataseed.binance.org' },
    '0x89':     { chain: 'Polygon',         rpc: 'https://polygon-rpc.com' },
    '0xa':      { chain: 'Optimism',        rpc: 'https://mainnet.optimism.io' },
    '0x2105':   { chain: 'Base',            rpc: 'https://mainnet.base.org' },
    '0x64':     { chain: 'Gnosis',          rpc: 'https://rpc.gnosischain.com' },
    '0x66eed':  { chain: 'Arbitrum Nova',   rpc: 'https://nova.arbitrum.io/rpc' },
    '0x539':    { chain: 'Localhost',       rpc: 'http://127.0.0.1:8545' },

    // 🔵 Non-EVM Placeholders (for adapter sync)
    'solana':   { chain: 'Solana',          rpc: 'https://api.mainnet-beta.solana.com' },
    'near':     { chain: 'NEAR',            rpc: 'https://rpc.mainnet.near.org' }
  };

  try {
    if (typeof window !== 'undefined' && (window as any).ethereum?.networkVersion) {
      const hexId = '0x' + parseInt((window as any).ethereum.networkVersion).toString(16);
      return chainMap[hexId] ?? { chain: 'Unknown', rpc: '' };
    }
  } catch (err) {
    console.warn('⚠️ ChainContext error:', err);
    return { chain: 'Error', rpc: '' };
  }

  return { chain: 'Offline', rpc: '' };
}

export function getUserBots(user: string): string[] {
  // 🧠 Later: Map this to badge tier or vault scanner status
  return ['BotFX1', 'VaultScanner', 'ArbitrageGhost'];
}

export function getAggregatorStatus(): string {
  // 🔄 Replace with real health check ping later
  return '✅ Online';
}

export function getFXProfile(role: string): {
  role: string;
  tier: string;
  glowColor: string;
  lastUpdate: number;
} {
  const tiers: Record<string, { tier: string; glowColor: string }> = {
    contributor: { tier: 'bronze', glowColor: '#cd7f32' },
    maintainer:  { tier: 'silver', glowColor: '#c0c0c0' },
    governor:    { tier: 'gold',   glowColor: '#ffd700' },
  };

  return {
    role,
    ...(tiers[role] || tiers.contributor),
    lastUpdate: Date.now()
  };
}
