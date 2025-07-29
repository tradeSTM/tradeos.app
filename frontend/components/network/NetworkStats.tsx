import React from 'react';
import { ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import { SUPPORTED_NETWORKS } from '../../config/networks';
import { NeonCard } from '../ui/NeonComponents';

interface NetworkStatsProps {
  className?: string;
}

export const NetworkStats: React.FC<NetworkStatsProps> = ({ className }) => {
  const { library, chainId } = useWeb3React();
  const [stats, setStats] = React.useState({
    gasPrice: '',
    blockNumber: '',
    latestBlock: null,
    networkLoad: ''
  });

  const updateStats = React.useCallback(async () => {
    if (!library || !chainId) return;

    try {
      const [gasPrice, blockNumber, latestBlock] = await Promise.all([
        library.getGasPrice(),
        library.getBlockNumber(),
        library.getBlock('latest')
      ]);

      const networkLoad = latestBlock.transactions.length / 500; // Rough estimate of network load
      
      setStats({
        gasPrice: ethers.utils.formatUnits(gasPrice, 'gwei'),
        blockNumber: blockNumber.toString(),
        latestBlock,
        networkLoad: `${(networkLoad * 100).toFixed(1)}%`
      });
    } catch (error) {
      console.error('Failed to fetch network stats:', error);
    }
  }, [library, chainId]);

  React.useEffect(() => {
    updateStats();
    const interval = setInterval(updateStats, 12000); // Update every 12 seconds
    return () => clearInterval(interval);
  }, [updateStats]);

  const network = chainId ? SUPPORTED_NETWORKS[chainId] : null;

  return (
    <NeonCard className={`network-stats ${className || ''}`}>
      <h3>Network Status: {network?.name || 'Unknown'}</h3>
      <div className="stats-grid">
        <div className="stat-item">
          <label>Gas Price</label>
          <value>{stats.gasPrice} Gwei</value>
        </div>
        <div className="stat-item">
          <label>Block</label>
          <value>{stats.blockNumber}</value>
        </div>
        <div className="stat-item">
          <label>Network Load</label>
          <value>{stats.networkLoad}</value>
        </div>
        {stats.latestBlock && (
          <div className="stat-item">
            <label>Block Time</label>
            <value>
              {new Date(stats.latestBlock.timestamp * 1000).toLocaleTimeString()}
            </value>
          </div>
        )}
      </div>

      <style jsx>{`
        .network-stats {
          width: 100%;
          padding: 16px;
        }

        h3 {
          color: #00ff9f;
          margin: 0 0 16px;
          font-size: 1.2em;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 16px;
        }

        .stat-item {
          padding: 12px;
          background: rgba(0, 255, 159, 0.05);
          border-radius: 8px;
          border: 1px solid rgba(0, 255, 159, 0.1);
        }

        label {
          display: block;
          font-size: 0.9em;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 4px;
        }

        value {
          display: block;
          font-size: 1.1em;
          color: #00ff9f;
          font-family: monospace;
        }
      `}</style>
    </NeonCard>
  );
};
