import { ethers } from 'ethers';
import { formatUnits } from '@ethersproject/units';

interface ChainConfig {
  chainId: number;
  provider: ethers.providers.Provider;
  confirmations: number;
  gasMultiplier: number;
}

interface ValidationResult {
  chainId: number;
  success: boolean;
  errors: string[];
  gasEstimate: ethers.BigNumber;
  state: any;
}

export class MultiChainValidator {
  private chains: Map<number, ChainConfig> = new Map();
  private validationCache: Map<string, ValidationResult> = new Map();
  private readonly cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor() {
    // Initialize cache cleanup
    setInterval(() => this.cleanCache(), this.cacheTimeout);
  }

  public addChain(config: ChainConfig): void {
    this.chains.set(config.chainId, config);
  }

  public async validateAcrossChains(
    contract: {
      address: string;
      abi: any[];
      bytecode: string;
    },
    targetChains: number[]
  ): Promise<Map<number, ValidationResult>> {
    const results = new Map<number, ValidationResult>();
    const validations = targetChains.map(async chainId => {
      const chain = this.chains.get(chainId);
      if (!chain) {
        results.set(chainId, {
          chainId,
          success: false,
          errors: ['Chain not configured'],
          gasEstimate: ethers.BigNumber.from(0),
          state: null
        });
        return;
      }

      try {
        const result = await this.validateOnChain(contract, chain);
        results.set(chainId, result);
      } catch (error) {
        results.set(chainId, {
          chainId,
          success: false,
          errors: [error.message],
          gasEstimate: ethers.BigNumber.from(0),
          state: null
        });
      }
    });

    await Promise.all(validations);
    return results;
  }

  private async validateOnChain(
    contract: {
      address: string;
      abi: any[];
      bytecode: string;
    },
    chain: ChainConfig
  ): Promise<ValidationResult> {
    const cacheKey = `${contract.address}-${chain.chainId}`;
    const cached = this.validationCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.result;
    }

    const errors: string[] = [];
    let gasEstimate = ethers.BigNumber.from(0);
    let state: any = null;

    try {
      // Validate bytecode
      const deployedBytecode = await chain.provider.getCode(contract.address);
      if (deployedBytecode === '0x') {
        errors.push('Contract not deployed on this chain');
      } else if (deployedBytecode !== contract.bytecode) {
        errors.push('Bytecode mismatch on this chain');
      }

      // Estimate gas for basic operations
      const contractInstance = new ethers.Contract(
        contract.address,
        contract.abi,
        chain.provider
      );

      try {
        gasEstimate = await contractInstance.estimateGas.deployed();
        gasEstimate = gasEstimate.mul(chain.gasMultiplier);
      } catch (error) {
        errors.push(`Gas estimation failed: ${error.message}`);
      }

      // Capture current state
      state = await this.captureContractState(contractInstance);

      // Cache result
      this.validationCache.set(cacheKey, {
        timestamp: Date.now(),
        result: {
          chainId: chain.chainId,
          success: errors.length === 0,
          errors,
          gasEstimate,
          state
        }
      });

      return {
        chainId: chain.chainId,
        success: errors.length === 0,
        errors,
        gasEstimate,
        state
      };
    } catch (error) {
      return {
        chainId: chain.chainId,
        success: false,
        errors: [...errors, error.message],
        gasEstimate,
        state
      };
    }
  }

  private async captureContractState(
    contract: ethers.Contract
  ): Promise<any> {
    try {
      const state: any = {};

      // Get all readable functions
      const functions = contract.interface.fragments.filter(
        f => f.type === 'function' && 
        (f.stateMutability === 'view' || f.stateMutability === 'pure')
      );

      // Call each function
      for (const func of functions) {
        try {
          if (func.inputs.length === 0) {
            const result = await contract[func.name]();
            state[func.name] = result;
          }
        } catch (error) {
          console.warn(`Failed to call ${func.name}:`, error);
        }
      }

      return state;
    } catch (error) {
      console.error('Failed to capture contract state:', error);
      return null;
    }
  }

  private cleanCache(): void {
    const now = Date.now();
    for (const [key, value] of this.validationCache.entries()) {
      if (now - value.timestamp > this.cacheTimeout) {
        this.validationCache.delete(key);
      }
    }
  }

  public async compareChainStates(
    contract: {
      address: string;
      abi: any[];
    },
    chainIds: number[]
  ): Promise<{
    consistent: boolean;
    differences: Record<string, any[]>;
  }> {
    const states = new Map<number, any>();

    // Collect states from all chains
    for (const chainId of chainIds) {
      const chain = this.chains.get(chainId);
      if (!chain) continue;

      const contractInstance = new ethers.Contract(
        contract.address,
        contract.abi,
        chain.provider
      );

      states.set(chainId, await this.captureContractState(contractInstance));
    }

    // Compare states
    const differences: Record<string, any[]> = {};
    let consistent = true;

    const firstState = states.get(chainIds[0]);
    if (!firstState) return { consistent: false, differences: {} };

    for (const key of Object.keys(firstState)) {
      const values = chainIds.map(chainId => {
        const state = states.get(chainId);
        return state ? state[key] : undefined;
      });

      // Check if all values are equal
      const allEqual = values.every(v => 
        JSON.stringify(v) === JSON.stringify(values[0])
      );

      if (!allEqual) {
        consistent = false;
        differences[key] = values;
      }
    }

    return { consistent, differences };
  }
}
