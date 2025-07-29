import React from 'react';
import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';
import { NeonCard, NeonButton, NeonProgressBar } from '../ui/NeonComponents';
import { NetworkSwitcher } from '../network/NetworkSwitcher';

interface ContractDeployment {
  name: string;
  status: 'pending' | 'deploying' | 'success' | 'failed';
  address?: string;
  hash?: string;
}

export const DeploymentDashboard: React.FC = () => {
  const { library, account, chainId } = useWeb3React();
  const [deployments, setDeployments] = React.useState<ContractDeployment[]>([
    { name: 'TradeOSAccess', status: 'pending' },
    { name: 'TradeOSBadges', status: 'pending' },
    { name: 'TradeOSGovernance', status: 'pending' },
    { name: 'LaunchpadFactory', status: 'pending' },
    { name: 'VaultController', status: 'pending' },
    { name: 'LPController', status: 'pending' },
    { name: 'AdminControl', status: 'pending' },
    { name: 'FeeRouter', status: 'pending' }
  ]);
  const [isDeploying, setIsDeploying] = React.useState(false);
  const [currentDeployment, setCurrentDeployment] = React.useState<number>(0);

  const deployContract = async (index: number) => {
    const deployment = deployments[index];
    try {
      setDeployments(prev => prev.map((d, i) => 
        i === index ? { ...d, status: 'deploying' } : d
      ));

      // Get contract artifacts and deploy
      const contractFactory = await ethers.getContractFactory(deployment.name);
      const contract = await contractFactory.deploy();
      await contract.deployed();

      setDeployments(prev => prev.map((d, i) => 
        i === index ? { 
          ...d, 
          status: 'success',
          address: contract.address,
          hash: contract.deployTransaction.hash
        } : d
      ));

      return contract;
    } catch (error) {
      setDeployments(prev => prev.map((d, i) => 
        i === index ? { ...d, status: 'failed' } : d
      ));
      throw error;
    }
  };

  const deployAll = async () => {
    if (!library || !account) return;
    setIsDeploying(true);
    
    try {
      // Deploy contracts in sequence with dependencies
      const access = await deployContract(0); // TradeOSAccess
      const badges = await deployContract(1); // TradeOSBadges
      await deployContract(2); // TradeOSGovernance
      const launchpad = await deployContract(3); // LaunchpadFactory
      const vault = await deployContract(4); // VaultController
      const lp = await deployContract(5); // LPController
      const admin = await deployContract(6); // AdminControl
      const fees = await deployContract(7); // FeeRouter

      // Configure contract relationships
      await access.setAdminControl(admin.address);
      await badges.setLaunchpadFactory(launchpad.address);
      await fees.setVaultController(vault.address);
      await fees.setLPController(lp.address);

    } catch (error) {
      console.error('Deployment failed:', error);
    } finally {
      setIsDeploying(false);
    }
  };

  const getProgressPercentage = () => {
    const completed = deployments.filter(d => d.status === 'success').length;
    return (completed / deployments.length) * 100;
  };

  if (!account) {
    return (
      <NeonCard title="System Deployment">
        <p>Please connect your wallet to deploy contracts</p>
      </NeonCard>
    );
  }

  return (
    <div className="deployment-dashboard">
      <NeonCard title="TradeOS System Deployment" className="main-card">
        <div className="network-section">
          <h3>Network Configuration</h3>
          <NetworkSwitcher />
        </div>

        <div className="progress-section">
          <h3>Deployment Progress</h3>
          <NeonProgressBar 
            progress={getProgressPercentage()} 
            className="deployment-progress"
          />
        </div>

        <div className="contracts-section">
          <h3>System Contracts</h3>
          {deployments.map((deployment, index) => (
            <div key={deployment.name} className="contract-item">
              <div className="contract-info">
                <h4>{deployment.name}</h4>
                <span className={`status ${deployment.status}`}>
                  {deployment.status}
                </span>
              </div>
              {deployment.address && (
                <div className="contract-details">
                  <p>Address: {deployment.address}</p>
                  <p>Tx Hash: {deployment.hash}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="actions-section">
          <NeonButton
            onClick={deployAll}
            disabled={isDeploying}
            className="deploy-button"
          >
            {isDeploying ? 'Deploying...' : 'Deploy All Contracts'}
          </NeonButton>
        </div>
      </NeonCard>

      <style jsx>{`
        .deployment-dashboard {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .main-card {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .network-section,
        .progress-section,
        .contracts-section,
        .actions-section {
          padding: 20px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 12px;
        }

        .contract-item {
          padding: 16px;
          margin: 8px 0;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .contract-item:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .contract-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .contract-details {
          margin-top: 8px;
          font-size: 0.9em;
          opacity: 0.8;
        }

        .status {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.9em;
        }

        .status.pending {
          background: rgba(255, 255, 255, 0.1);
        }

        .status.deploying {
          background: rgba(255, 166, 0, 0.2);
          color: orange;
        }

        .status.success {
          background: rgba(0, 255, 0, 0.1);
          color: #00ff9f;
        }

        .status.failed {
          background: rgba(255, 0, 0, 0.1);
          color: #ff4444;
        }

        .deployment-progress {
          height: 8px;
          margin: 16px 0;
        }

        .deploy-button {
          width: 100%;
          margin-top: 16px;
        }
      `}</style>
    </div>
  );
};
