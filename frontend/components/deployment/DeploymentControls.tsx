import React from 'react';
import { useWeb3React } from '@web3-react/core';
import { SUPPORTED_NETWORKS } from '../../config/networks';
import { NetworkStats } from '../network/NetworkStats';
import { NetworkSwitcher } from '../network/NetworkSwitcher';
import { NeonCard } from '../ui/NeonComponents';

interface DeploymentControlsProps {
  onDeploy: () => Promise<void>;
  isDeploying: boolean;
}

export const DeploymentControls: React.FC<DeploymentControlsProps> = ({
  onDeploy,
  isDeploying
}) => {
  const { chainId, account } = useWeb3React();
  const [gasEstimate, setGasEstimate] = React.useState<string>('');
  const [deploymentReady, setDeploymentReady] = React.useState(false);

  const currentNetwork = chainId ? SUPPORTED_NETWORKS[chainId] : null;

  const checkNetworkRequirements = React.useCallback(async () => {
    if (!chainId || !account) {
      setDeploymentReady(false);
      return;
    }

    try {
      // Check if network supports required features
      const network = SUPPORTED_NETWORKS[chainId];
      if (!network) {
        throw new Error('Unsupported network');
      }

      // Verify account has sufficient balance
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [account, 'latest'],
      });

      const minBalance = BigInt('0x6F05B59D3B20000'); // 0.5 ETH in wei
      if (BigInt(balance) < minBalance) {
        throw new Error('Insufficient balance for deployment');
      }

      // Estimate total gas cost
      const estimatedGas = '500000'; // Base estimate
      const gasPrice = await window.ethereum.request({
        method: 'eth_gasPrice',
      });
      
      const totalCost = (BigInt(estimatedGas) * BigInt(gasPrice)).toString();
      setGasEstimate(totalCost);
      
      setDeploymentReady(true);
    } catch (error) {
      console.error('Network requirements check failed:', error);
      setDeploymentReady(false);
    }
  }, [chainId, account]);

  React.useEffect(() => {
    checkNetworkRequirements();
  }, [checkNetworkRequirements]);

  return (
    <div className="deployment-controls">
      <NeonCard title="Deployment Controls">
        <div className="controls-grid">
          <div className="network-section">
            <h3>Network Selection</h3>
            <NetworkSwitcher />
            <NetworkStats />
          </div>

          <div className="requirements-section">
            <h3>Deployment Requirements</h3>
            <ul className="requirements-list">
              <li className={account ? 'met' : 'unmet'}>
                Wallet Connected: {account ? '✓' : '✗'}
              </li>
              <li className={currentNetwork ? 'met' : 'unmet'}>
                Network Supported: {currentNetwork?.name || 'Not Selected'}
              </li>
              <li className={deploymentReady ? 'met' : 'unmet'}>
                Sufficient Balance: {deploymentReady ? '✓' : '✗'}
              </li>
            </ul>
          </div>

          <div className="gas-section">
            <h3>Estimated Deployment Cost</h3>
            <div className="gas-info">
              {gasEstimate ? (
                <>
                  <p>Total Gas: {gasEstimate} wei</p>
                  <p>≈ {(Number(gasEstimate) / 1e18).toFixed(4)} ETH</p>
                </>
              ) : (
                <p>Calculating...</p>
              )}
            </div>
          </div>

          <button
            className={`deploy-button ${deploymentReady ? 'ready' : ''}`}
            onClick={onDeploy}
            disabled={!deploymentReady || isDeploying}
          >
            {isDeploying ? 'Deploying...' : 'Deploy System'}
          </button>
        </div>
      </NeonCard>

      <style jsx>{`
        .deployment-controls {
          margin: 20px 0;
        }

        .controls-grid {
          display: grid;
          gap: 20px;
        }

        .requirements-list {
          list-style: none;
          padding: 0;
          margin: 16px 0;
        }

        .requirements-list li {
          padding: 8px 12px;
          margin: 8px 0;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.05);
          transition: all 0.3s ease;
        }

        .requirements-list li.met {
          color: #00ff9f;
          border-left: 3px solid #00ff9f;
        }

        .requirements-list li.unmet {
          color: #ff4444;
          border-left: 3px solid #ff4444;
        }

        .gas-info {
          background: rgba(0, 255, 159, 0.05);
          padding: 16px;
          border-radius: 8px;
          border: 1px solid rgba(0, 255, 159, 0.1);
        }

        .deploy-button {
          width: 100%;
          padding: 16px;
          border-radius: 8px;
          border: none;
          background: rgba(0, 255, 159, 0.1);
          color: #00ff9f;
          font-size: 1.1em;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .deploy-button.ready {
          background: rgba(0, 255, 159, 0.2);
          box-shadow: 0 0 20px rgba(0, 255, 159, 0.2);
        }

        .deploy-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .deploy-button:hover:not(:disabled) {
          background: rgba(0, 255, 159, 0.3);
          box-shadow: 0 0 30px rgba(0, 255, 159, 0.3);
        }
      `}</style>
    </div>
  );
};
