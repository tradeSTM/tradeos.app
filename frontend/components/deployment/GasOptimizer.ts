import { ethers } from 'ethers';
import { formatUnits } from '@ethersproject/units';

interface GasOptimizationResult {
  estimatedSavings: ethers.BigNumber;
  recommendations: string[];
  timing: {
    optimalBlock: number;
    expectedPrice: ethers.BigNumber;
    confidence: number;
  };
}

export class GasOptimizer {
  private provider: ethers.providers.Provider;
  private historicalPrices: ethers.BigNumber[] = [];
  private blockTimeHistory: number[] = [];
  private readonly HISTORY_SIZE = 1000;
  private lastUpdateBlock = 0;

  constructor(provider: ethers.providers.Provider) {
    this.provider = provider;
    this.startMonitoring();
  }

  private async startMonitoring(): Promise<void> {
    // Monitor new blocks for gas prices
    this.provider.on('block', async (blockNumber) => {
      if (blockNumber <= this.lastUpdateBlock) return;
      this.lastUpdateBlock = blockNumber;

      try {
        const block = await this.provider.getBlock(blockNumber);
        const baseFee = block.baseFeePerGas || await this.provider.getGasPrice();
        
        this.historicalPrices.push(baseFee);
        this.blockTimeHistory.push(block.timestamp);

        if (this.historicalPrices.length > this.HISTORY_SIZE) {
          this.historicalPrices.shift();
          this.blockTimeHistory.shift();
        }
      } catch (error) {
        console.error('Error monitoring gas prices:', error);
      }
    });
  }

  public async optimizeDeployment(
    bytecode: string,
    constructorArgs: any[] = []
  ): Promise<GasOptimizationResult> {
    const recommendations: string[] = [];
    let estimatedSavings = ethers.BigNumber.from(0);

    // Analyze bytecode size
    const bytecodeSize = (bytecode.length - 2) / 2; // Remove '0x' and convert to bytes
    if (bytecodeSize > 24576) { // 24KB standard size
      recommendations.push(
        'Contract size exceeds 24KB. Consider:' +
        '\n1. Splitting into multiple contracts' +
        '\n2. Using libraries' +
        '\n3. Optimizing storage layout'
      );
      
      // Estimate savings from optimization
      const potentialSizeReduction = bytecodeSize - 24576;
      const gasPerByte = 200; // Approximate gas cost per byte
      estimatedSavings = estimatedSavings.add(
        ethers.BigNumber.from(potentialSizeReduction * gasPerByte)
      );
    }

    // Analyze constructor
    const constructorAnalysis = this.analyzeConstructor(bytecode, constructorArgs);
    if (constructorAnalysis.recommendations.length > 0) {
      recommendations.push(...constructorAnalysis.recommendations);
      estimatedSavings = estimatedSavings.add(constructorAnalysis.savings);
    }

    // Find optimal deployment timing
    const timing = await this.findOptimalDeploymentTime();
    if (timing.confidence > 0.7) { // Only recommend if confidence is high
      const currentGas = await this.provider.getGasPrice();
      const potentialSavings = currentGas.sub(timing.expectedPrice)
        .mul(bytecodeSize)
        .mul(ethers.BigNumber.from(68)); // 68 gas per non-zero byte

      if (potentialSavings.gt(0)) {
        recommendations.push(
          `Deploy during optimal gas price window: Block ${timing.optimalBlock}` +
          `\nExpected price: ${formatUnits(timing.expectedPrice, 'gwei')} gwei` +
          `\nPotential savings: ${formatUnits(potentialSavings, 'ether')} ETH`
        );
        estimatedSavings = estimatedSavings.add(potentialSavings);
      }
    }

    return {
      estimatedSavings,
      recommendations,
      timing
    };
  }

  private analyzeConstructor(
    bytecode: string,
    constructorArgs: any[]
  ): {
    recommendations: string[];
    savings: ethers.BigNumber;
  } {
    const recommendations: string[] = [];
    let savings = ethers.BigNumber.from(0);

    // Check for large arrays in constructor
    const largeArrays = constructorArgs.filter(arg => 
      Array.isArray(arg) && arg.length > 50
    );

    if (largeArrays.length > 0) {
      recommendations.push(
        'Large arrays detected in constructor. Consider:' +
        '\n1. Using setter functions after deployment' +
        '\n2. Batch initialization' +
        '\n3. Using events for non-critical data'
      );

      // Estimate savings from optimization
      const arraySize = largeArrays.reduce((sum, arr) => sum + arr.length, 0);
      savings = savings.add(
        ethers.BigNumber.from(arraySize * 20000) // Approximate gas savings
      );
    }

    // Check for complex computations in constructor
    if (bytecode.includes('5b80')) { // JUMPDEST PUSH1 - Common in loops
      recommendations.push(
        'Complex computations detected in constructor. Consider:' +
        '\n1. Moving calculations to initialization function' +
        '\n2. Pre-computing values' +
        '\n3. Using libraries for complex operations'
      );

      savings = savings.add(
        ethers.BigNumber.from(100000) // Estimated savings from optimization
      );
    }

    return { recommendations, savings };
  }

  private async findOptimalDeploymentTime(): Promise<{
    optimalBlock: number;
    expectedPrice: ethers.BigNumber;
    confidence: number;
  }> {
    if (this.historicalPrices.length < 100) {
      return {
        optimalBlock: 0,
        expectedPrice: ethers.BigNumber.from(0),
        confidence: 0
      };
    }

    // Analyze gas price patterns
    const currentBlock = await this.provider.getBlockNumber();
    const timestamps = this.blockTimeHistory;
    const prices = this.historicalPrices;

    // Convert timestamps to hour of day
    const hourlyPrices = new Map<number, ethers.BigNumber[]>();
    timestamps.forEach((timestamp, index) => {
      const hour = new Date(timestamp * 1000).getHours();
      const price = prices[index];
      
      if (!hourlyPrices.has(hour)) {
        hourlyPrices.set(hour, []);
      }
      hourlyPrices.get(hour)!.push(price);
    });

    // Find hour with lowest average price
    let lowestAvgPrice = ethers.constants.MaxUint256;
    let bestHour = 0;
    let bestConfidence = 0;

    for (const [hour, hourPrices] of hourlyPrices.entries()) {
      const avg = hourPrices.reduce((sum, price) => sum.add(price), ethers.BigNumber.from(0))
        .div(hourPrices.length);

      // Calculate confidence based on price variance
      const variance = hourPrices.reduce((sum, price) => 
        sum.add(price.sub(avg).mul(price.sub(avg))),
        ethers.BigNumber.from(0)
      ).div(hourPrices.length);

      const confidence = 1 - Number(formatUnits(variance, 'gwei')) / Number(formatUnits(avg, 'gwei'));

      if (avg.lt(lowestAvgPrice)) {
        lowestAvgPrice = avg;
        bestHour = hour;
        bestConfidence = confidence;
      }
    }

    // Calculate blocks until optimal time
    const currentHour = new Date().getHours();
    let hoursUntilOptimal = bestHour - currentHour;
    if (hoursUntilOptimal <= 0) hoursUntilOptimal += 24;

    // Convert hours to blocks (assuming ~12 second block time)
    const blocksPerHour = 300;
    const optimalBlock = currentBlock + (hoursUntilOptimal * blocksPerHour);

    return {
      optimalBlock,
      expectedPrice: lowestAvgPrice,
      confidence: bestConfidence
    };
  }

  public stop(): void {
    this.provider.removeAllListeners('block');
  }
}
