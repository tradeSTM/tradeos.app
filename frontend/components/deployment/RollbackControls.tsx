import React from 'react';
import { NeonCard } from '../ui/NeonCard';
import { RollbackManager, RollbackConfig } from './RollbackManager';
import { ethers } from 'ethers';

interface RollbackControlsProps {
  contractName: string;
  currentAddress: string;
  provider: ethers.providers.Provider;
  signer: ethers.Signer;
}

export const RollbackControls: React.FC<RollbackControlsProps> = ({
  contractName,
  currentAddress,
  provider,
  signer
}) => {
  const [history, setHistory] = React.useState<RollbackConfig[]>([]);
  const [isRollingBack, setIsRollingBack] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = React.useState<string | null>(null);

  const rollbackManager = React.useMemo(() => 
    new RollbackManager(provider, signer),
    [provider, signer]
  );

  React.useEffect(() => {
    rollbackManager.loadPersistedState();
    setHistory(rollbackManager.getDeploymentHistory(contractName));
  }, [rollbackManager, contractName]);

  const handleRollback = async () => {
    if (!selectedVersion) return;

    setIsRollingBack(true);
    setError(null);

    try {
      await rollbackManager.rollback(contractName, selectedVersion);
      setHistory(rollbackManager.getDeploymentHistory(contractName));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsRollingBack(false);
    }
  };

  if (history.length < 2) {
    return null; // Don't show rollback UI if there's no history
  }

  return (
    <NeonCard title="Deployment Rollback">
      <div className="rollback-controls">
        <div className="current-version">
          <h5>Current Deployment</h5>
          <p className="address">{currentAddress}</p>
        </div>

        <div className="version-selector">
          <h5>Rollback to Version</h5>
          <select 
            value={selectedVersion || ''} 
            onChange={e => setSelectedVersion(e.target.value)}
            disabled={isRollingBack}
          >
            <option value="">Select version...</option>
            {history.slice(0, -1).map((config, index) => (
              <option key={config.version} value={config.version}>
                v{config.version} - {config.address.slice(0, 8)}...
              </option>
            ))}
          </select>
        </div>

        {selectedVersion && (
          <div className="confirmation">
            <p className="warning">
              ⚠️ Rolling back will revert the contract to a previous state.
              This action cannot be undone.
            </p>
            <button
              className="rollback-button"
              onClick={handleRollback}
              disabled={isRollingBack}
            >
              {isRollingBack ? 'Rolling Back...' : 'Confirm Rollback'}
            </button>
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>

      <style jsx>{`
        .rollback-controls {
          padding: 16px;
        }

        .current-version {
          margin-bottom: 20px;
        }

        h5 {
          margin: 0 0 8px;
          color: #00ff9f;
        }

        .address {
          font-family: monospace;
          background: rgba(0, 0, 0, 0.2);
          padding: 8px;
          border-radius: 4px;
          margin: 0;
        }

        .version-selector select {
          width: 100%;
          padding: 8px;
          background: rgba(26, 26, 26, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          color: white;
        }

        .confirmation {
          margin-top: 20px;
        }

        .warning {
          color: #ffbb00;
          font-size: 0.9em;
          margin-bottom: 12px;
        }

        .rollback-button {
          width: 100%;
          padding: 12px;
          background: rgba(255, 68, 68, 0.1);
          border: 1px solid #ff4444;
          border-radius: 4px;
          color: #ff4444;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .rollback-button:hover:not(:disabled) {
          background: rgba(255, 68, 68, 0.2);
        }

        .rollback-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .error-message {
          margin-top: 12px;
          padding: 12px;
          background: rgba(255, 68, 68, 0.1);
          border-radius: 4px;
          color: #ff4444;
          font-size: 0.9em;
        }
      `}</style>
    </NeonCard>
  );
};
