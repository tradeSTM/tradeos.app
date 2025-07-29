import { ethers } from 'ethers';
import { formatUnits } from '@ethersproject/units';

interface GasAlert {
  timestamp: number;
  threshold: number;
  currentPrice: number;
}

export class GasMonitor {
  private provider: ethers.providers.Provider;
  private alerts: GasAlert[] = [];
  private thresholds: number[] = [];
  private pollingInterval: number = 30000; // 30 seconds
  private intervalId?: NodeJS.Timeout;
  private onAlert: (alert: GasAlert) => void;
  private historicalPrices: number[] = [];
  private readonly MAX_HISTORY = 24; // Keep 24 data points

  constructor(
    provider: ethers.providers.Provider,
    onAlert: (alert: GasAlert) => void,
    initialThresholds: number[] = [30, 50, 100] // gwei
  ) {
    this.provider = provider;
    this.onAlert = onAlert;
    this.thresholds = initialThresholds;
  }

  public start(): void {
    this.checkGasPrice();
    this.intervalId = setInterval(() => this.checkGasPrice(), this.pollingInterval);
  }

  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  public setThresholds(thresholds: number[]): void {
    this.thresholds = thresholds;
  }

  public getHistoricalPrices(): number[] {
    return [...this.historicalPrices];
  }

  public getPriceStatistics() {
    if (this.historicalPrices.length === 0) return null;

    const prices = this.historicalPrices;
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      average: prices.reduce((a, b) => a + b, 0) / prices.length,
      median: prices.slice().sort((a, b) => a - b)[Math.floor(prices.length / 2)],
      volatility: this.calculateVolatility(prices)
    };
  }

  private async checkGasPrice(): Promise<void> {
    try {
      const gasPrice = await this.provider.getGasPrice();
      const gasPriceGwei = Number(formatUnits(gasPrice, 'gwei'));

      // Update historical prices
      this.historicalPrices.push(gasPriceGwei);
      if (this.historicalPrices.length > this.MAX_HISTORY) {
        this.historicalPrices.shift();
      }

      // Check thresholds and trigger alerts
      for (const threshold of this.thresholds) {
        if (gasPriceGwei >= threshold) {
          const alert: GasAlert = {
            timestamp: Date.now(),
            threshold,
            currentPrice: gasPriceGwei
          };
          this.alerts.push(alert);
          this.onAlert(alert);
        }
      }
    } catch (error) {
      console.error('Gas price monitoring error:', error);
    }
  }

  private calculateVolatility(prices: number[]): number {
    if (prices.length < 2) return 0;
    
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    const variance = prices.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / (prices.length - 1);
    return Math.sqrt(variance);
  }

  public getOptimalDeploymentWindow(): {
    startTime: number;
    endTime: number;
    expectedPrice: number;
  } | null {
    if (this.historicalPrices.length < this.MAX_HISTORY) return null;

    // Find the lowest average price window (3-hour window)
    const WINDOW_SIZE = 6; // 3 hours (with 30-min intervals)
    let lowestAvg = Infinity;
    let bestStartIndex = 0;

    for (let i = 0; i <= this.historicalPrices.length - WINDOW_SIZE; i++) {
      const windowPrices = this.historicalPrices.slice(i, i + WINDOW_SIZE);
      const avg = windowPrices.reduce((a, b) => a + b, 0) / WINDOW_SIZE;
      
      if (avg < lowestAvg) {
        lowestAvg = avg;
        bestStartIndex = i;
      }
    }

    return {
      startTime: Date.now() - ((this.historicalPrices.length - bestStartIndex) * this.pollingInterval),
      endTime: Date.now() - ((this.historicalPrices.length - (bestStartIndex + WINDOW_SIZE)) * this.pollingInterval),
      expectedPrice: lowestAvg
    };
  }
}
