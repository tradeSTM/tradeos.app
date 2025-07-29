import { ethers } from 'ethers';
import { ChainConfig } from '../config/chains';

interface NetworkMetrics {
  blockTime: number;
  gasPrice: ethers.BigNumber;
  baseFee?: ethers.BigNumber;
  priorityFee?: ethers.BigNumber;
  blockUtilization: number;
  pendingTxCount: number;
  timestamp: number;
}

interface L2Metrics {
  sequencerLatency?: number;
  batchSize?: number;
  l1GasPrice?: ethers.BigNumber;
  stateRoot?: string;
  challengePeriod?: number;
}

interface NetworkHealth {
  isResponding: boolean;
  isSynced: boolean;
  latency: number;
  peersCount?: number;
}

export class ChainMonitor {
  private provider: ethers.providers.Provider;
  private chainConfig: ChainConfig;
  private metricsHistory: NetworkMetrics[] = [];
  private l2MetricsHistory: L2Metrics[] = [];
  private healthChecks: NetworkHealth[] = [];
  private readonly MAX_HISTORY = 1000;

  private isMonitoring = false;
  private monitoringInterval?: NodeJS.Timeout;
  private readonly DEFAULT_INTERVAL = 12000; // 12 seconds

  constructor(provider: ethers.providers.Provider, chainConfig: ChainConfig) {
    this.provider = provider;
    this.chainConfig = chainConfig;
  }

  public async startMonitoring(interval: number = this.DEFAULT_INTERVAL): Promise<void> {
    if (this.isMonitoring) return;
    this.isMonitoring = true;

    const monitor = async () => {
      try {
        const [metrics, health] = await Promise.all([
          this.collectMetrics(),
          this.checkNetworkHealth()
        ]);

        this.metricsHistory.push(metrics);
        if (this.metricsHistory.length > this.MAX_HISTORY) {
          this.metricsHistory.shift();
        }

        this.healthChecks.push(health);
        if (this.healthChecks.length > this.MAX_HISTORY) {
          this.healthChecks.shift();
        }

        if (this.chainConfig.features.l2) {
          const l2Metrics = await this.collectL2Metrics();
          this.l2MetricsHistory.push(l2Metrics);
          if (this.l2MetricsHistory.length > this.MAX_HISTORY) {
            this.l2MetricsHistory.shift();
          }
        }
      } catch (error) {
        console.error(`Monitoring error on ${this.chainConfig.name}:`, error);
      }
    };

    // Initial collection
    await monitor();

    // Set up regular monitoring
    this.monitoringInterval = setInterval(monitor, interval);
  }

  public stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    this.isMonitoring = false;
  }

  private async collectMetrics(): Promise<NetworkMetrics> {
    const [block, pendingBlock] = await Promise.all([
      this.provider.getBlock('latest'),
      this.provider.getBlock('pending')
    ]);

    const metrics: NetworkMetrics = {
      blockTime: block.timestamp - (this.metricsHistory[this.metricsHistory.length - 1]?.timestamp || block.timestamp),
      gasPrice: await this.provider.getGasPrice(),
      blockUtilization: block.gasUsed.mul(100).div(block.gasLimit).toNumber(),
      pendingTxCount: pendingBlock ? pendingBlock.transactions.length : 0,
      timestamp: block.timestamp
    };

    if (this.chainConfig.features.eip1559) {
      metrics.baseFee = block.baseFeePerGas;
      const feeData = await this.provider.getFeeData();
      metrics.priorityFee = feeData.maxPriorityFeePerGas;
    }

    return metrics;
  }

  private async collectL2Metrics(): Promise<L2Metrics> {
    const metrics: L2Metrics = {};

    if (this.chainConfig.features.optimistic) {
      // For Optimistic L2s (Base, Arbitrum, Optimism)
      const l2Provider = new ethers.providers.JsonRpcProvider(this.chainConfig.rpcUrls[0]);
      
      try {
        if (this.chainConfig.id === 8453) { // Base
          metrics.sequencerLatency = await this.getBaseSequencerLatency();
        } else if (this.chainConfig.id === 42161) { // Arbitrum
          metrics.sequencerLatency = await this.getArbitrumSequencerLatency();
        } else if (this.chainConfig.id === 10) { // Optimism
          metrics.sequencerLatency = await this.getOptimismSequencerLatency();
        }

        // Get L1 gas price for all optimistic L2s
        const l1Provider = new ethers.providers.JsonRpcProvider('https://eth-mainnet.g.alchemy.com/v2/your-key');
        metrics.l1GasPrice = await l1Provider.getGasPrice();
      } catch (error) {
        console.error('Error collecting L2 metrics:', error);
      }
    } else if (this.chainConfig.features.zk) {
      // For ZK L2s (Polygon zkEVM)
      try {
        metrics.stateRoot = await this.getZkStateRoot();
        metrics.batchSize = await this.getZkBatchSize();
      } catch (error) {
        console.error('Error collecting ZK metrics:', error);
      }
    }

    return metrics;
  }

  private async checkNetworkHealth(): Promise<NetworkHealth> {
    const health: NetworkHealth = {
      isResponding: false,
      isSynced: false,
      latency: 0
    };

    try {
      const startTime = Date.now();
      const block = await this.provider.getBlock('latest');
      health.latency = Date.now() - startTime;
      health.isResponding = true;

      // Check if chain is synced
      const currentTimestamp = Math.floor(Date.now() / 1000);
      health.isSynced = currentTimestamp - block.timestamp < this.chainConfig.averageBlockTime * 5;

      // Try to get peer count if available
      try {
        const peerCount = await this.provider.send('net_peerCount', []);
        health.peersCount = parseInt(peerCount, 16);
      } catch {} // Ignore if not supported

    } catch (error) {
      console.error('Health check failed:', error);
    }

    return health;
  }

  // L2-specific metrics collection methods
  private async getBaseSequencerLatency(): Promise<number> {
    try {
      const response = await fetch('https://base-sequencer-metrics.com/latency');
      const data = await response.json();
      return data.latency;
    } catch {
      return 0;
    }
  }

  private async getArbitrumSequencerLatency(): Promise<number> {
    try {
      const response = await fetch('https://arbitrum-sequencer-metrics.com/latency');
      const data = await response.json();
      return data.latency;
    } catch {
      return 0;
    }
  }

  private async getOptimismSequencerLatency(): Promise<number> {
    try {
      const response = await fetch('https://optimism-sequencer-metrics.com/latency');
      const data = await response.json();
      return data.latency;
    } catch {
      return 0;
    }
  }

  private async getZkStateRoot(): Promise<string> {
    try {
      const response = await fetch('https://zkevm-metrics.com/state-root');
      const data = await response.json();
      return data.stateRoot;
    } catch {
      return '';
    }
  }

  private async getZkBatchSize(): Promise<number> {
    try {
      const response = await fetch('https://zkevm-metrics.com/batch-size');
      const data = await response.json();
      return data.size;
    } catch {
      return 0;
    }
  }

  // Analysis methods
  public getNetworkStatus(): {
    currentMetrics: NetworkMetrics;
    healthStatus: NetworkHealth;
    l2Status?: L2Metrics;
    alerts: string[];
  } {
    const currentMetrics = this.metricsHistory[this.metricsHistory.length - 1];
    const currentHealth = this.healthChecks[this.healthChecks.length - 1];
    const currentL2Metrics = this.l2MetricsHistory[this.l2MetricsHistory.length - 1];
    const alerts: string[] = [];

    // Check for issues
    if (!currentHealth.isResponding) {
      alerts.push(`${this.chainConfig.name} is not responding`);
    }

    if (!currentHealth.isSynced) {
      alerts.push(`${this.chainConfig.name} is not synced`);
    }

    if (currentMetrics.gasPrice.gt(ethers.utils.parseUnits(this.chainConfig.maxGasPrice, 'gwei'))) {
      alerts.push(`Gas price exceeds maximum threshold`);
    }

    if (currentMetrics.blockUtilization > 90) {
      alerts.push(`High block utilization: ${currentMetrics.blockUtilization}%`);
    }

    if (this.chainConfig.features.l2 && currentL2Metrics?.sequencerLatency && 
        currentL2Metrics.sequencerLatency > 60) {
      alerts.push(`High sequencer latency: ${currentL2Metrics.sequencerLatency}s`);
    }

    return {
      currentMetrics,
      healthStatus: currentHealth,
      l2Status: currentL2Metrics,
      alerts
    };
  }

  public getGasAnalytics(): {
    average: ethers.BigNumber;
    median: ethers.BigNumber;
    percentile95: ethers.BigNumber;
    trend: 'increasing' | 'decreasing' | 'stable';
  } {
    const gasPrices = this.metricsHistory.map(m => m.gasPrice);
    
    // Sort gas prices for percentile calculation
    const sortedPrices = [...gasPrices].sort((a, b) => a.gt(b) ? 1 : -1);

    return {
      average: gasPrices.reduce((a, b) => a.add(b), ethers.BigNumber.from(0))
        .div(gasPrices.length),
      median: sortedPrices[Math.floor(sortedPrices.length / 2)],
      percentile95: sortedPrices[Math.floor(sortedPrices.length * 0.95)],
      trend: this.calculateTrend(gasPrices)
    };
  }

  private calculateTrend(
    prices: ethers.BigNumber[]
  ): 'increasing' | 'decreasing' | 'stable' {
    if (prices.length < 2) return 'stable';

    const recent = prices.slice(-10);
    const first = recent[0];
    const last = recent[recent.length - 1];
    
    const change = last.sub(first).mul(100).div(first);
    
    if (change.gt(10)) return 'increasing';
    if (change.lt(-10)) return 'decreasing';
    return 'stable';
  }
}
