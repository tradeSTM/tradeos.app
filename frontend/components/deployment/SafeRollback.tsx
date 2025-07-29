import React from 'react';
import { ethers } from 'ethers';
import { NeonCard } from '../ui/NeonCard';
import { GasMonitor } from './GasMonitor';
import { ContractStateValidator } from './ContractStateValidator';

interface ValidationResult {
  safe: boolean;
  warnings: string[];
  impacts: string[];
  simulation?: {
    success: boolean;
    errors: string[];
    gasEstimate: ethers.BigNumber;
  };
}

interface SafeRollbackProps {
  contractAddress: string;
  contractName: string;
  targetVersion: string;
  abi: any[];
  provider: ethers.providers.Provider;
  signer: ethers.Signer;
  dependencies?: string[];
  onValidationComplete?: (result: ValidationResult) => void;
}

export const SafeRollback: React.FC<SafeRollbackProps> = ({
  contractAddress,
  contractName,
  targetVersion,
  abi,
  provider,
  signer,
  dependencies = [],
  onValidationComplete
}) => {
  const [validating, setValidating] = React.useState(false);
  const [result, setResult] = React.useState<ValidationResult | null>(null);
  const [gasAlerts, setGasAlerts] = React.useState<{ price: number; time: number }[]>([]);
  const [optimalWindow, setOptimalWindow] = React.useState<{
    startTime: number;
    endTime: number;
    expectedPrice: number;
  } | null>(null);

  const stateValidator = React.useMemo(
    () => new ContractStateValidator(provider, signer),
    [provider, signer]
  );

  const gasMonitor = React.useMemo(
    () => new GasMonitor(provider, (alert) => {
      setGasAlerts(prev => [...prev, { price: alert.currentPrice, time: alert.timestamp }]);
    }),
    [provider]
  );

  React.useEffect(() => {
    // Initialize contract in validator
    stateValidator.addContract(contractAddress, contractName, abi, dependencies);

    // Start gas monitoring
    gasMonitor.start();
    
    return () => {
      gasMonitor.stop();
    };
  }, []);

  const validateRollback = async () => {
    setValidating(true);
    try {
      // State validation
      const validation = await stateValidator.validateRollback(
        contractAddress,
        targetVersion
      );

      // Simulation
      const simulation = await stateValidator.simulateRollback(
        contractAddress,
        targetVersion
      );

      const result = {
        ...validation,
        simulation
      };

      setResult(result);
      onValidationComplete?.(result);

      // Update optimal deployment window
      setOptimalWindow(gasMonitor.getOptimalDeploymentWindow());
    } catch (error) {
      setResult({
        safe: false,
        warnings: [error.message],
        impacts: []
      });
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="safe-rollback">
      <NeonCard title="Rollback Safety Analysis">
        <div className="validation-section">
          <button
            className={`validate-btn ${validating ? 'loading' : ''}`}
            onClick={validateRollback}
            disabled={validating}
          >
            {validating ? 'Analyzing...' : 'Analyze Rollback Safety'}
          </button>

          {result && (
            <div className={`result ${result.safe ? 'safe' : 'unsafe'}`}>
              <h4>Analysis Results</h4>
              
              <div className="safety-status">
                Status: {result.safe ? '✓ Safe to Proceed' : '⚠ Requires Attention'}
              </div>

              {result.warnings.length > 0 && (
                <div className="warnings">
                  <h5>Warnings</h5>
                  <ul>
                    {result.warnings.map((warning, i) => (
                      <li key={i}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.impacts.length > 0 && (
                <div className="impacts">
                  <h5>Impact Analysis</h5>
                  <ul>
                    {result.impacts.map((impact, i) => (
                      <li key={i}>{impact}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.simulation && (
                <div className="simulation">
                  <h5>Simulation Results</h5>
                  <div className={`sim-status ${result.simulation.success ? 'success' : 'error'}`}>
                    {result.simulation.success ? '✓ Simulation Successful' : '× Simulation Failed'}
                  </div>
                  {result.simulation.errors.length > 0 && (
                    <ul className="sim-errors">
                      {result.simulation.errors.map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                    </ul>
                  )}
                  {result.simulation.success && (
                    <p className="gas-estimate">
                      Estimated Gas: {ethers.utils.formatUnits(result.simulation.gasEstimate, 'gwei')} gwei
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="gas-monitoring">
          <h4>Gas Price Monitoring</h4>
          
          {gasAlerts.length > 0 && (
            <div className="alerts">
              <h5>Recent Alerts</h5>
              <ul>
                {gasAlerts.slice(-3).map((alert, i) => (
                  <li key={i}>
                    {alert.price} gwei at {new Date(alert.time).toLocaleTimeString()}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {optimalWindow && (
            <div className="optimal-window">
              <h5>Optimal Deployment Window</h5>
              <p>
                Best time to deploy: {new Date(optimalWindow.startTime).toLocaleTimeString()} - {new Date(optimalWindow.endTime).toLocaleTimeString()}
              </p>
              <p>Expected gas price: {Math.round(optimalWindow.expectedPrice)} gwei</p>
            </div>
          )}
        </div>
      </NeonCard>

      <style jsx>{`
        .safe-rollback {
          margin: 20px 0;
        }

        .validation-section {
          margin-bottom: 24px;
        }

        .validate-btn {
          width: 100%;
          padding: 12px;
          background: rgba(0, 255, 159, 0.1);
          border: 1px solid #00ff9f;
          color: #00ff9f;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .validate-btn:hover:not(:disabled) {
          background: rgba(0, 255, 159, 0.2);
        }

        .validate-btn.loading {
          opacity: 0.7;
          cursor: wait;
        }

        .result {
          margin-top: 20px;
          padding: 16px;
          border-radius: 6px;
        }

        .result.safe {
          background: rgba(0, 255, 159, 0.1);
          border: 1px solid rgba(0, 255, 159, 0.3);
        }

        .result.unsafe {
          background: rgba(255, 68, 68, 0.1);
          border: 1px solid rgba(255, 68, 68, 0.3);
        }

        .safety-status {
          font-size: 1.1em;
          margin: 12px 0;
        }

        .warnings, .impacts {
          margin: 16px 0;
        }

        h5 {
          color: #00ff9f;
          margin: 0 0 8px;
        }

        ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        li {
          padding: 8px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
          margin-bottom: 4px;
        }

        .simulation {
          margin-top: 16px;
        }

        .sim-status {
          padding: 8px;
          border-radius: 4px;
          margin: 8px 0;
        }

        .sim-status.success {
          background: rgba(0, 255, 159, 0.1);
          color: #00ff9f;
        }

        .sim-status.error {
          background: rgba(255, 68, 68, 0.1);
          color: #ff4444;
        }

        .gas-estimate {
          color: #00ff9f;
          font-family: monospace;
        }

        .gas-monitoring {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 20px;
          margin-top: 20px;
        }

        .alerts ul li {
          display: flex;
          justify-content: space-between;
          font-family: monospace;
        }

        .optimal-window {
          margin-top: 16px;
          padding: 12px;
          background: rgba(0, 255, 159, 0.1);
          border-radius: 6px;
        }

        .optimal-window p {
          margin: 4px 0;
          font-family: monospace;
        }
      `}</style>
    </div>
  );
};
