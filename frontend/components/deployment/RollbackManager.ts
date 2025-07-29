import { ethers } from 'ethers';

export interface RollbackConfig {
  address: string;
  version: string;
  implementation?: string;
  proxyAdmin?: string;
  initData?: string;
}

export class RollbackManager {
  private deployments: Map<string, RollbackConfig[]> = new Map();
  private provider: ethers.providers.Provider;
  private signer: ethers.Signer;

  constructor(provider: ethers.providers.Provider, signer: ethers.Signer) {
    this.provider = provider;
    this.signer = signer;
  }

  public async saveDeployment(
    contractName: string, 
    config: RollbackConfig
  ): Promise<void> {
    const history = this.deployments.get(contractName) || [];
    history.push(config);
    this.deployments.set(contractName, history);

    // Save state to local storage for persistence
    this.persistState();
  }

  public async rollback(
    contractName: string,
    targetVersion?: string
  ): Promise<boolean> {
    const history = this.deployments.get(contractName);
    if (!history?.length) {
      throw new Error(`No deployment history for ${contractName}`);
    }

    const currentConfig = history[history.length - 1];
    const targetConfig = targetVersion 
      ? history.find(h => h.version === targetVersion)
      : history[history.length - 2];

    if (!targetConfig) {
      throw new Error(`Target version ${targetVersion} not found`);
    }

    try {
      // Check if this is a proxy contract
      if (currentConfig.proxyAdmin && currentConfig.implementation) {
        await this.rollbackProxy(currentConfig, targetConfig);
      } else {
        await this.rollbackStandard(currentConfig, targetConfig);
      }

      // Update deployment history
      this.deployments.set(
        contractName, 
        history.slice(0, history.indexOf(targetConfig) + 1)
      );
      this.persistState();

      return true;
    } catch (error) {
      console.error('Rollback failed:', error);
      throw error;
    }
  }

  private async rollbackProxy(
    current: RollbackConfig,
    target: RollbackConfig
  ): Promise<void> {
    if (!current.proxyAdmin || !target.implementation) {
      throw new Error('Missing proxy configuration');
    }

    // Load proxy admin contract
    const proxyAdminAbi = [
      "function upgrade(address proxy, address implementation) external",
      "function upgradeAndCall(address proxy, address implementation, bytes calldata data) external"
    ];
    
    const proxyAdmin = new ethers.Contract(
      current.proxyAdmin,
      proxyAdminAbi,
      this.signer
    );

    // Perform rollback
    if (target.initData) {
      await proxyAdmin.upgradeAndCall(
        current.address,
        target.implementation,
        target.initData
      );
    } else {
      await proxyAdmin.upgrade(current.address, target.implementation);
    }
  }

  private async rollbackStandard(
    current: RollbackConfig,
    target: RollbackConfig
  ): Promise<void> {
    // For non-proxy contracts, verify the target is still available
    const code = await this.provider.getCode(target.address);
    if (code === '0x') {
      throw new Error('Target contract no longer exists');
    }

    // Transfer any ETH balance
    const balance = await this.provider.getBalance(current.address);
    if (balance.gt(0)) {
      const tx = await this.signer.sendTransaction({
        to: target.address,
        value: balance
      });
      await tx.wait();
    }

    // Note: For full state rollback, you'd need to have stored
    // and replay all state-changing transactions
  }

  private persistState(): void {
    const state = Array.from(this.deployments.entries())
      .reduce((acc, [key, value]) => ({
        ...acc,
        [key]: value
      }), {});

    localStorage.setItem(
      'deployment-rollback-state',
      JSON.stringify(state)
    );
  }

  public loadPersistedState(): void {
    try {
      const state = localStorage.getItem('deployment-rollback-state');
      if (state) {
        const parsed = JSON.parse(state);
        this.deployments = new Map(
          Object.entries(parsed)
        );
      }
    } catch (error) {
      console.error('Failed to load rollback state:', error);
    }
  }

  public getDeploymentHistory(contractName: string): RollbackConfig[] {
    return this.deployments.get(contractName) || [];
  }
}
