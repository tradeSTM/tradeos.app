import React from 'react';
import { useWeb3React } from '@web3-react/core';
import { NeonCard } from '../ui/NeonCard';
import { DependencyGraph } from './DependencyGraph';
import { ethers } from 'ethers';
import { formatUnits, parseUnits } from '@ethersproject/units';

interface VerificationStatus {
  status: 'pending' | 'verified' | 'failed';
  timestamp: number;
  error?: string;
}

interface DeploymentStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: number;
  endTime?: number;
  txHash?: string;
  contractAddress?: string;
  verificationStatus?: VerificationStatus;
  error?: string;
  gasEstimate?: {
    gasLimit: string;
    gasPrice: string;
    totalCost: string;
  };
  dependencies: string[];
  sourceVerified?: boolean;
  localVerification?: {
    bytecodeMatch: boolean;
    abiMatch: boolean;
    constructorArgsMatch: boolean;
  };
}

interface NetworkConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
  explorerApiUrl: string;
  isLocal: boolean;
}

const NETWORKS: Record<string, NetworkConfig> = {
  localhost: {
    name: 'Localhost',
    chainId: 31337,
    rpcUrl: 'http://127.0.0.1:8545',
    explorerUrl: '',
    explorerApiUrl: '',
    isLocal: true
  },
  base: {
    name: 'Base Mainnet',
    chainId: 8453,
    rpcUrl: 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
    explorerApiUrl: 'https://api.basescan.org/api',
    isLocal: false
  }
};

export const DeploymentMonitor: React.FC = () => {
  const { library, chainId } = useWeb3React();
  const [steps, setSteps] = React.useState<DeploymentStep[]>([]);
  const [activeNetwork, setActiveNetwork] = React.useState<NetworkConfig>(
    chainId === 31337 ? NETWORKS.localhost : NETWORKS.base
  );

  const updateStep = (stepId: string, updates: Partial<DeploymentStep>) => {
    setSteps(current => 
      current.map(step => 
        step.id === stepId ? { ...step, ...updates } : step
      )
    );
  };

  const estimateGas = async (contractName: string, constructorArgs: any[] = []) => {
    if (!library) return null;
    
    try {
      const artifact = require(`../../contracts/artifacts/${contractName}.sol/${contractName}.json`);
      const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, library.getSigner());
      
      const deployTx = await factory.getDeployTransaction(...constructorArgs);
      const gasLimit = await library.estimateGas({
        data: deployTx.data,
        from: await library.getSigner().getAddress()
      });
      const gasPrice = await library.getGasPrice();
      const totalCost = gasPrice.mul(gasLimit);
      
      return {
        gasLimit: formatUnits(gasLimit, 'wei'),
        gasPrice: formatUnits(gasPrice, 'gwei'),
        totalCost: formatUnits(totalCost, 'ether')
      };
    } catch (error) {
      console.error('Gas estimation failed:', error);
      return null;
    }
  };

  const verifyLocalContract = async (step: DeploymentStep) => {
    if (!step.contractAddress || !library) return;

    try {
      const artifact = require(`../../contracts/artifacts/${step.name}.sol/${step.name}.json`);
      const deployedBytecode = await library.getCode(step.contractAddress);
      const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, library.getSigner());
      
      // Compare deployed bytecode (excluding constructor args)
      const bytecodeMatch = deployedBytecode.startsWith(artifact.deployedBytecode);
      
      // Verify ABI by trying to interact
      let abiMatch = true;
      try {
        const contract = new ethers.Contract(step.contractAddress, artifact.abi, library);
        await contract.deployed();
      } catch {
        abiMatch = false;
      }

      updateStep(step.id, {
        localVerification: {
          bytecodeMatch,
          abiMatch,
          constructorArgsMatch: true // Add constructor args verification if needed
        },
        sourceVerified: bytecodeMatch && abiMatch
      });
    } catch (error) {
      console.error('Local verification failed:', error);
    }
  };

  const verifyContract = async (step: DeploymentStep) => {
    if (!step.contractAddress) return;

    updateStep(step.id, {
      verificationStatus: { status: 'pending', timestamp: Date.now() }
    });

    if (activeNetwork.isLocal) {
      await verifyLocalContract(step);
      return;
    }

    try {
      // For Base mainnet verification
      const artifact = require(`../../contracts/artifacts/${step.name}.sol/${step.name}.json`);
      
      // Submit verification request
      const response = await fetch(`${activeNetwork.explorerApiUrl}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: step.contractAddress,
          sourceCode: artifact.source,
          constructorArguments: '', // Add constructor args if needed
          compilerVersion: `v${artifact.compiler.version}`,
          optimizationUsed: artifact.compiler.settings.optimizer.enabled ? 1 : 0
        })
      });

      if (!response.ok) {
        throw new Error('Verification submission failed');
      }

      // Check verification status
      const checkVerification = async () => {
        const status = await fetch(
          `${activeNetwork.explorerApiUrl}/check/${step.contractAddress}`
        ).then(r => r.json());

        if (status.result === 'Pending') {
          setTimeout(checkVerification, 5000);
        } else {
          updateStep(step.id, {
            verificationStatus: {
              status: status.result === 'Pass' ? 'verified' : 'failed',
              timestamp: Date.now(),
              error: status.result === 'Fail' ? status.message : undefined
            }
          });
        }
      };

      setTimeout(checkVerification, 5000);
    } catch (error) {
      updateStep(step.id, {
        verificationStatus: {
          status: 'failed',
          timestamp: Date.now(),
          error: error.message
        }
      });
    }
  };

  const monitorTransaction = async (txHash: string, stepId: string) => {
    if (!library) return;

    try {
      const receipt = await library.waitForTransaction(txHash);
      
      if (receipt.status === 1) {
        updateStep(stepId, {
          status: 'completed',
          endTime: Date.now(),
          contractAddress: receipt.contractAddress
        });

        if (!activeNetwork.isLocal && receipt.contractAddress) {
          const step = steps.find(s => s.id === stepId);
          if (step) {
            verifyContract(step);
          }
        }
      } else {
        updateStep(stepId, {
          status: 'failed',
          endTime: Date.now(),
          error: 'Transaction failed'
        });
      }
    } catch (error) {
      updateStep(stepId, {
        status: 'failed',
        endTime: Date.now(),
        error: error.message
      });
    }
  };

  return (
    <NeonCard title="Deployment Monitor">
      <div className="deployment-monitor">
        <div className="network-info">
          <h4>Network: {activeNetwork.name}</h4>
          <p className="chain-id">Chain ID: {activeNetwork.chainId}</p>
        </div>

        <DependencyGraph 
          contracts={steps.map(step => ({
            name: step.name,
            dependencies: step.dependencies || [],
            status: step.status
          }))}
        />

        <div className="steps-container">
          {steps.map(step => (
            <div 
              key={step.id}
              className={`step-item ${step.status}`}
            >
              <div className="step-header">
                <h5>{step.name}</h5>
                <span className="status">{step.status}</span>
              </div>

              {step.contractAddress && (
                <div className="contract-info">
                  <p className="address">
                    Contract: {step.contractAddress}
                    {!activeNetwork.isLocal && (
                      <a 
                        href={`${activeNetwork.explorerUrl}/address/${step.contractAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="explorer-link"
                      >
                        View on Explorer
                      </a>
                    )}
                  </p>
                </div>
              )}

              {step.verificationStatus && (
                <div className={`verification ${step.verificationStatus.status}`}>
                  <span>Verification: {step.verificationStatus.status}</span>
                  {step.verificationStatus.error && (
                    <p className="error">{step.verificationStatus.error}</p>
                  )}
                </div>
              )}

              {step.error && (
                <p className="error-message">{step.error}</p>
              )}

              {step.status === 'running' && (
                <div className="loading-indicator">
                  <div className="spinner"></div>
                  Processing...
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .deployment-monitor {
          padding: 20px;
        }

        .network-info {
          margin-bottom: 24px;
          padding: 12px;
          background: rgba(0, 255, 159, 0.1);
          border-radius: 8px;
        }

        .network-info h4 {
          margin: 0;
          color: #00ff9f;
        }

        .chain-id {
          margin: 4px 0 0;
          font-size: 0.9em;
          opacity: 0.8;
        }

        .steps-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .step-item {
          padding: 16px;
          background: rgba(26, 26, 26, 0.8);
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .step-item.completed {
          border-color: rgba(0, 255, 159, 0.3);
        }

        .step-item.failed {
          border-color: rgba(255, 68, 68, 0.3);
        }

        .step-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .step-header h5 {
          margin: 0;
          color: #00ff9f;
        }

        .status {
          font-size: 0.9em;
          padding: 4px 8px;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.1);
        }

        .contract-info {
          margin: 12px 0;
          font-size: 0.9em;
        }

        .address {
          word-break: break-all;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .explorer-link {
          color: #00ff9f;
          text-decoration: none;
          font-size: 0.9em;
          opacity: 0.8;
          transition: opacity 0.3s ease;
        }

        .explorer-link:hover {
          opacity: 1;
        }

        .verification {
          margin-top: 12px;
          padding: 8px;
          border-radius: 4px;
          font-size: 0.9em;
        }

        .verification.verified {
          background: rgba(0, 255, 159, 0.1);
          color: #00ff9f;
        }

        .verification.failed {
          background: rgba(255, 68, 68, 0.1);
          color: #ff4444;
        }

        .error-message {
          margin: 8px 0 0;
          padding: 8px;
          background: rgba(255, 68, 68, 0.1);
          border-radius: 4px;
          color: #ff4444;
          font-size: 0.9em;
        }

        .loading-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 12px;
          font-size: 0.9em;
          opacity: 0.8;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(0, 255, 159, 0.3);
          border-top-color: #00ff9f;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </NeonCard>
  );
};
