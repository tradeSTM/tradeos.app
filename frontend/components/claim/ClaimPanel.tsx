import React from 'react';
import { ethers } from 'ethers';
import { NeonCard, NeonButton, NeonLoader } from '../ui/NeonComponents';
import { useWeb3React } from '@web3-react/core';

interface TokenClaim {
  tokenAddress: string;
  amount: string;
  merkleProof: string[];
}

interface ClaimPanelProps {
  claims: TokenClaim[];
  onClaim: (tokenAddress: string) => Promise<void>;
}

export const ClaimPanel: React.FC<ClaimPanelProps> = ({ claims, onClaim }) => {
  const { account, library } = useWeb3React();
  const [claimingToken, setClaimingToken] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleClaim = async (tokenAddress: string) => {
    try {
      setClaimingToken(tokenAddress);
      setError(null);
      await onClaim(tokenAddress);
    } catch (err) {
      setError(err.message);
    } finally {
      setClaimingToken(null);
    }
  };

  if (!account) {
    return (
      <NeonCard title="Token Claims" className="claim-panel">
        <p>Please connect your wallet to view claims</p>
      </NeonCard>
    );
  }

  return (
    <NeonCard title="Available Claims" className="claim-panel">
      {claims.length === 0 ? (
        <p>No claims available</p>
      ) : (
        <div className="claims-list">
          {claims.map((claim) => (
            <div key={claim.tokenAddress} className="claim-item">
              <div className="claim-info">
                <h4>Token: {claim.tokenAddress}</h4>
                <p>Amount: {ethers.utils.formatEther(claim.amount)} tokens</p>
              </div>
              <NeonButton
                onClick={() => handleClaim(claim.tokenAddress)}
                disabled={claimingToken === claim.tokenAddress}
                className="claim-button"
              >
                {claimingToken === claim.tokenAddress ? (
                  <NeonLoader size={20} />
                ) : (
                  'Claim'
                )}
              </NeonButton>
            </div>
          ))}
        </div>
      )}
      {error && (
        <div className="claim-error">
          {error}
        </div>
      )}
    </NeonCard>
  );
};

// Styles
const styles = `
.claim-panel {
  min-width: 400px;
  padding: 20px;
}

.claims-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.claim-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
}

.claim-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.claim-info h4 {
  margin: 0;
  font-size: 16px;
}

.claim-info p {
  margin: 0;
  font-size: 14px;
  opacity: 0.8;
}

.claim-button {
  min-width: 100px;
}

.claim-error {
  margin-top: 16px;
  padding: 12px;
  border-radius: 8px;
  background: rgba(255, 0, 0, 0.1);
  color: #ff4444;
}
`;
