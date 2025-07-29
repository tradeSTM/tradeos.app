import { ethers } from 'ethers';
import { formatUnits } from '@ethersproject/units';

interface StateValidation {
  storage: Map<string, string>;
  events: ethers.Event[];
  balance: ethers.BigNumber;
  nonce: number;
}

interface DependencyNode {
  address: string;
  name: string;
  dependencies: string[];
  dependents: string[];
  state?: StateValidation;
}

export class ContractStateValidator {
  private provider: ethers.providers.Provider;
  private signer: ethers.Signer;
  private dependencyGraph: Map<string, DependencyNode> = new Map();

  constructor(provider: ethers.providers.Provider, signer: ethers.Signer) {
    this.provider = provider;
    this.signer = signer;
  }

  public async addContract(
    address: string,
    name: string,
    abi: any[],
    dependencies: string[] = []
  ): Promise<void> {
    const contract = new ethers.Contract(address, abi, this.provider);
    const node: DependencyNode = {
      address,
      name,
      dependencies,
      dependents: [],
      state: await this.captureState(contract)
    };

    this.dependencyGraph.set(address, node);

    // Update dependency relationships
    for (const depAddress of dependencies) {
      const depNode = this.dependencyGraph.get(depAddress);
      if (depNode) {
        depNode.dependents.push(address);
      }
    }
  }

  private async captureState(contract: ethers.Contract): Promise<StateValidation> {
    const storage = new Map<string, string>();
    const balance = await this.provider.getBalance(contract.address);
    const nonce = await this.provider.getTransactionCount(contract.address);
    
    // Get last 1000 blocks of events
    const currentBlock = await this.provider.getBlockNumber();
    const events = await contract.queryFilter({}, currentBlock - 1000, currentBlock);

    // Capture storage slots
    try {
      const slots = await this.getStorageLayout(contract);
      for (const slot of slots) {
        const value = await this.provider.getStorageAt(contract.address, slot);
        storage.set(slot, value);
      }
    } catch (error) {
      console.warn('Failed to capture full storage state:', error);
    }

    return { storage, events, balance, nonce };
  }

  private async getStorageLayout(contract: ethers.Contract): Promise<string[]> {
    // This is a simplified version. In practice, you'd need the storage layout
    // from the compiler output or analyze the contract bytecode
    return ['0x0', '0x1', '0x2', '0x3', '0x4', '0x5'];
  }

  public async validateRollback(
    address: string,
    targetVersion: string
  ): Promise<{
    safe: boolean;
    warnings: string[];
    impacts: string[];
  }> {
    const node = this.dependencyGraph.get(address);
    if (!node) throw new Error('Contract not found in dependency graph');

    const warnings: string[] = [];
    const impacts: string[] = [];
    let safe = true;

    // Check dependents
    for (const depAddress of node.dependents) {
      const dependent = this.dependencyGraph.get(depAddress);
      if (dependent) {
        impacts.push(`Will affect dependent contract: ${dependent.name}`);
        
        // Check if dependent has active users or recent transactions
        const activity = await this.checkContractActivity(depAddress);
        if (activity.activeUsers > 0) {
          warnings.push(`Dependent contract ${dependent.name} has ${activity.activeUsers} active users`);
          safe = false;
        }
      }
    }

    // Check state changes
    const currentState = await this.captureState(
      new ethers.Contract(address, [], this.provider)
    );
    
    const stateComparison = this.compareStates(node.state!, currentState);
    if (stateComparison.significantChanges) {
      warnings.push('Significant state changes detected since deployment');
      stateComparison.changes.forEach(change => warnings.push(change));
      safe = false;
    }

    // Check for locked funds
    if (currentState.balance.gt(0)) {
      warnings.push(`Contract holds ${formatUnits(currentState.balance, 'ether')} ETH`);
      safe = false;
    }

    return { safe, warnings, impacts };
  }

  private async checkContractActivity(
    address: string
  ): Promise<{ activeUsers: number; lastActivity: number }> {
    const currentBlock = await this.provider.getBlockNumber();
    const contract = new ethers.Contract(address, [], this.provider);
    
    // Get recent transactions
    const events = await contract.queryFilter({}, currentBlock - 1000, currentBlock);
    const uniqueUsers = new Set(events.map(e => e.args?.user || e.args?.from).filter(Boolean));

    return {
      activeUsers: uniqueUsers.size,
      lastActivity: events.length > 0 ? events[events.length - 1].blockNumber : 0
    };
  }

  private compareStates(
    original: StateValidation,
    current: StateValidation
  ): {
    significantChanges: boolean;
    changes: string[];
  } {
    const changes: string[] = [];
    let significantChanges = false;

    // Compare storage
    original.storage.forEach((value, slot) => {
      if (current.storage.get(slot) !== value) {
        changes.push(`Storage slot ${slot} changed`);
        significantChanges = true;
      }
    });

    // Compare balance
    if (!current.balance.eq(original.balance)) {
      changes.push(
        `Balance changed from ${formatUnits(original.balance, 'ether')} to ${formatUnits(current.balance, 'ether')} ETH`
      );
      significantChanges = true;
    }

    // Compare nonce
    if (current.nonce !== original.nonce) {
      changes.push(`Nonce increased by ${current.nonce - original.nonce}`);
      significantChanges = current.nonce - original.nonce > 100; // Significant if many transactions
    }

    return { significantChanges, changes };
  }

  public async simulateRollback(
    address: string,
    targetVersion: string
  ): Promise<{
    success: boolean;
    errors: string[];
    gasEstimate: ethers.BigNumber;
  }> {
    const node = this.dependencyGraph.get(address);
    if (!node) throw new Error('Contract not found');

    try {
      // Create a fork of the current state
      const provider = new ethers.providers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_FORK_RPC_URL
      );

      // Simulate the rollback transaction
      const tx = await this.generateRollbackTx(address, targetVersion);
      const gasEstimate = await provider.estimateGas(tx);

      // Check post-rollback state
      const postRollbackState = await this.simulatePostRollbackState(
        address,
        targetVersion,
        provider
      );

      const errors: string[] = [];
      postRollbackState.forEach(error => errors.push(error));

      return {
        success: errors.length === 0,
        errors,
        gasEstimate
      };
    } catch (error) {
      return {
        success: false,
        errors: [error.message],
        gasEstimate: ethers.BigNumber.from(0)
      };
    }
  }

  private async generateRollbackTx(
    address: string,
    targetVersion: string
  ): Promise<ethers.PopulatedTransaction> {
    // Implementation depends on your rollback mechanism
    const contract = new ethers.Contract(address, [], this.signer);
    return await contract.populateTransaction.upgrade(targetVersion);
  }

  private async simulatePostRollbackState(
    address: string,
    targetVersion: string,
    forkProvider: ethers.providers.Provider
  ): Promise<string[]> {
    const errors: string[] = [];
    const contract = new ethers.Contract(address, [], forkProvider);

    // Simulate basic interactions
    try {
      await contract.deployed();
    } catch {
      errors.push('Contract verification failed after rollback');
    }

    // Check dependent contracts
    const node = this.dependencyGraph.get(address);
    if (node) {
      for (const depAddress of node.dependents) {
        const depContract = new ethers.Contract(depAddress, [], forkProvider);
        try {
          await depContract.deployed();
        } catch {
          errors.push(`Dependent contract ${depAddress} verification failed`);
        }
      }
    }

    return errors;
  }
}
