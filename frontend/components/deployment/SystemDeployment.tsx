import React from 'react';
import { useWeb3React } from '@web3-react/core';
import { DeploymentControls } from './DeploymentControls';
import { NeonCard, NeonProgressBar } from '../ui/NeonComponents';
import { ethers } from 'ethers';

export interface ContractMetadata {
  name: string;
  artifact: string;
  dependencies: string[];
  address?: string;
  hash?: string;
}

const SYSTEM_CONTRACTS: ContractMetadata[] = [
  {
    name: 'TradeOSAccess',
    artifact: 'TradeOSAccess',
    dependencies: []
  },
  {
    name: 'TradeOSBadges',
    artifact: 'TradeOSBadges',
    dependencies: ['TradeOSAccess']
  },
  {
    name: 'TradeOSGovernance',
    artifact: 'TradeOSGovernance',
    dependencies: ['TradeOSAccess', 'TradeOSBadges']
  },
  {
    name: 'LaunchpadFactory',
    artifact: 'LaunchpadFactory',
    dependencies: ['TradeOSAccess']
  },
  {
    name: 'VaultController',
    artifact: 'VaultController',
    dependencies: ['TradeOSAccess']
  },
  {
    name: 'LPController',
    artifact: 'LPController',
    dependencies: ['TradeOSAccess', 'VaultController']
  },
  {
    name: 'AdminControl',
    artifact: 'AdminControl',
    dependencies: ['TradeOSAccess']
  },
  {
    name: 'FeeRouter',
    artifact: 'FeeRouter',
    dependencies: ['AdminControl', 'VaultController', 'LPController']
  }
];

export const SystemDeployment: React.FC = () => {
  const { library, account } = useWeb3React();
  const [deployedContracts, setDeployedContracts] = React.useState<Record<string, ContractMetadata>>({});
  const [isDeploying, setIsDeploying] = React.useState(false);
  const [currentContract, setCurrentContract] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const getDeploymentOrder = () => {
    const deployed = new Set(Object.keys(deployedContracts));
    const pending = SYSTEM_CONTRACTS.filter(contract => !deployed.has(contract.name))
      .filter(contract => contract.dependencies.every(dep => deployed.has(dep)));
    return pending;
  };

  const deployContract = async (contract: ContractMetadata) => {
    if (!library || !account) return;

    const signer = library.getSigner(account);
    
    try {
      setCurrentContract(contract.name);
      
      // Get contract factory
      const artifact = require(`../../contracts/artifacts/${contract.artifact}.sol/${contract.artifact}.json`);
      const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);
      
      // Deploy contract
      const instance = await factory.deploy();
      await instance.deployed();

      // Update state with deployed contract
      setDeployedContracts(prev => ({
        ...prev,
        [contract.name]: {
          ...contract,
          address: instance.address,
          hash: instance.deployTransaction.hash
        }
      }));

      return instance;
    } catch (err) {
      console.error(`Failed to deploy ${contract.name}:`, err);
      setError(`Failed to deploy ${contract.name}: ${err.message}`);
      throw err;
    }
  };

  const deploySystem = async () => {
    setIsDeploying(true);
    setError(null);

    try {
      while (getDeploymentOrder().length > 0) {
        const nextContracts = getDeploymentOrder();
        await deployContract(nextContracts[0]);
      }
    } finally {
      setIsDeploying(false);
      setCurrentContract(null);
    }
  };

  const deploymentProgress = (Object.keys(deployedContracts).length / SYSTEM_CONTRACTS.length) * 100;

  return (
    <div className="system-deployment">
      <DeploymentControls 
        onDeploy={deploySystem}
        isDeploying={isDeploying}
      />

      <NeonCard title="Deployment Progress">
        <div className="progress-section">
          <NeonProgressBar progress={deploymentProgress} />
          <p className="progress-text">
            {Object.keys(deployedContracts).length} of {SYSTEM_CONTRACTS.length} contracts deployed
          </p>
          {currentContract && (
            <p className="current-contract">
              Deploying: {currentContract}...
            </p>
          )}
          {error && (
            <p className="error-message">{error}</p>
          )}
        </div>

        <div className="contracts-grid">
          {SYSTEM_CONTRACTS.map(contract => {
            const deployed = deployedContracts[contract.name];
            return (
              <div 
                key={contract.name}
                className={`contract-card ${deployed ? 'deployed' : ''}`}
              >
                <h4>{contract.name}</h4>
                {deployed && (
                  <>
                    <p className="address">Address: {deployed.address}</p>
                    <p className="hash">Tx: {deployed.hash}</p>
                  </>
                )}
                <div className="dependencies">
                  {contract.dependencies.map(dep => (
                    <span 
                      key={dep}
                      className={`dependency ${deployedContracts[dep] ? 'satisfied' : ''}`}
                    >
                      {dep}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </NeonCard>

      <style jsx>{`
        .system-deployment {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .progress-section {
          margin-bottom: 24px;
        }

        .progress-text {
          margin: 8px 0;
          color: #00ff9f;
        }

        .current-contract {
          color: rgba(0, 255, 159, 0.8);
          font-style: italic;
        }

        .error-message {
          color: #ff4444;
          padding: 12px;
          background: rgba(255, 0, 0, 0.1);
          border-radius: 6px;
          margin-top: 12px;
        }

        .contracts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
          margin-top: 24px;
        }

        .contract-card {
          padding: 16px;
          background: rgba(26, 26, 26, 0.8);
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }

        .contract-card.deployed {
          border-color: rgba(0, 255, 159, 0.3);
          box-shadow: 0 0 15px rgba(0, 255, 159, 0.1);
        }

        .contract-card h4 {
          margin: 0 0 12px;
          color: #00ff9f;
        }

        .address, .hash {
          font-size: 0.9em;
          word-break: break-all;
          margin: 4px 0;
          opacity: 0.8;
        }

        .dependencies {
          margin-top: 12px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .dependency {
          font-size: 0.8em;
          padding: 4px 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          opacity: 0.6;
        }

        .dependency.satisfied {
          background: rgba(0, 255, 159, 0.1);
          color: #00ff9f;
          opacity: 1;
        }
      `}</style>
    </div>
  );
};
