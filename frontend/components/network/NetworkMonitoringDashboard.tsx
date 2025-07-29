import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { ChainMonitor } from './ChainMonitor';
import { useWeb3React } from '@web3-react/core';
import { DashboardLayout } from '../layouts/DashboardLayout';

interface MonitoringPreset {
  name: string;
  thresholds: {
    gasPrice: number;  // in gwei
    blockTime: number; // in seconds
    blockUtilization: number; // percentage
    sequencerLatency: number; // in seconds
    minPeers: number;
    maxPendingTx: number;
  };
  isVIP?: boolean;
}

// Public presets available to all users
const PUBLIC_PRESETS: MonitoringPreset[] = [
  {
    name: 'Standard',
    thresholds: {
      gasPrice: 100, // 100 gwei
      blockTime: 15, // 15 seconds
      blockUtilization: 80, // 80%
      sequencerLatency: 120, // 2 minutes
      minPeers: 3,
      maxPendingTx: 10000
    }
  },
  {
    name: 'Conservative',
    thresholds: {
      gasPrice: 50,
      blockTime: 12,
      blockUtilization: 70,
      sequencerLatency: 60,
      minPeers: 5,
      maxPendingTx: 5000
    }
  }
];

// VIP presets with more granular controls
const VIP_PRESETS: MonitoringPreset[] = [
  {
    name: 'Ultra Low Latency',
    thresholds: {
      gasPrice: 200,
      blockTime: 10,
      blockUtilization: 90,
      sequencerLatency: 30,
      minPeers: 10,
      maxPendingTx: 20000
    },
    isVIP: true
  },
  {
    name: 'High Security',
    thresholds: {
      gasPrice: 30,
      blockTime: 8,
      blockUtilization: 60,
      sequencerLatency: 45,
      minPeers: 15,
      maxPendingTx: 3000
    },
    isVIP: true
  }
];

interface NetworkSignals {
  priceFeeds: {
    eth: number;
    gas: number;
  };
  networkLoad: {
    tps: number;
    mempool: number;
  };
  apiHealth: {
    status: 'healthy' | 'degraded' | 'down';
    latency: number;
  };
}

interface Props {
  isVIP?: boolean;
  onAlert?: (alerts: string[]) => void;
  className?: string;
}

export const NetworkMonitoringDashboard: React.FC<Props> = ({ 
  isVIP = false, 
  onAlert,
  className
}) => {
  const { library: provider, chainId } = useWeb3React();
  const [monitor, setMonitor] = useState<ChainMonitor | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<MonitoringPreset>(PUBLIC_PRESETS[0]);
  const [networkSignals, setNetworkSignals] = useState<NetworkSignals | null>(null);
  const [status, setStatus] = useState<any>(null);
  const [gasStats, setGasStats] = useState<any>(null);

  // Initialize monitor when provider is available
  useEffect(() => {
    if (provider && chainId) {
      const chainConfig = {
        name: 'Current Network',
        id: chainId,
        features: {
          eip1559: chainId === 1 || chainId === 42161 || chainId === 8453,
          l2: chainId !== 1,
          optimistic: [10, 42161, 8453].includes(chainId),
          zk: chainId === 1101
        },
        maxGasPrice: selectedPreset.thresholds.gasPrice.toString(),
        averageBlockTime: selectedPreset.thresholds.blockTime,
        rpcUrls: [provider.connection.url]
      };

      const newMonitor = new ChainMonitor(provider, chainConfig);
      setMonitor(newMonitor);
      
      newMonitor.startMonitoring(5000); // Update every 5 seconds

      return () => {
        newMonitor.stopMonitoring();
      };
    }
  }, [provider, chainId, selectedPreset]);

  // Fetch external API signals
  useEffect(() => {
    const fetchSignals = async () => {
      try {
        // Fetch price feeds
        const [ethPrice, gasPrice] = await Promise.all([
          fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')
            .then(r => r.json())
            .then(data => data.ethereum.usd),
          fetch('https://api.etherscan.io/api?module=gastracker&action=gasoracle')
            .then(r => r.json())
            .then(data => parseInt(data.result.SafeGasPrice))
        ]);

        // Get mempool stats
        const mempoolStats = await fetch('https://api.etherscan.io/api?module=proxy&action=eth_getBlockByNumber&tag=pending&boolean=false')
          .then(r => r.json());

        setNetworkSignals({
          priceFeeds: {
            eth: ethPrice,
            gas: gasPrice
          },
          networkLoad: {
            tps: await getCurrentTPS(),
            mempool: mempoolStats.result.transactions.length
          },
          apiHealth: await checkAPIHealth()
        });
      } catch (error) {
        console.error('Error fetching signals:', error);
      }
    };

    const interval = setInterval(fetchSignals, 30000); // Update every 30 seconds
    fetchSignals(); // Initial fetch

    return () => clearInterval(interval);
  }, [chainId]);

  // Monitor updates
  useEffect(() => {
    if (!monitor) return;

    const interval = setInterval(() => {
      const currentStatus = monitor.getNetworkStatus();
      const currentGasStats = monitor.getGasAnalytics();

      setStatus(currentStatus);
      setGasStats(currentGasStats);

      // Check against selected preset thresholds
      const alerts: string[] = [];
      
      if (ethers.utils.formatUnits(currentGasStats.average, 'gwei') > selectedPreset.thresholds.gasPrice) {
        alerts.push(`Gas price above threshold: ${ethers.utils.formatUnits(currentGasStats.average, 'gwei')} gwei`);
      }

      if (currentStatus.currentMetrics.blockTime > selectedPreset.thresholds.blockTime) {
        alerts.push(`Block time above threshold: ${currentStatus.currentMetrics.blockTime}s`);
      }

      if (currentStatus.currentMetrics.blockUtilization > selectedPreset.thresholds.blockUtilization) {
        alerts.push(`High block utilization: ${currentStatus.currentMetrics.blockUtilization}%`);
      }

      if (currentStatus.l2Status?.sequencerLatency && 
          currentStatus.l2Status.sequencerLatency > selectedPreset.thresholds.sequencerLatency) {
        alerts.push(`High sequencer latency: ${currentStatus.l2Status.sequencerLatency}s`);
      }

      if (alerts.length > 0 && onAlert) {
        onAlert(alerts);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [monitor, selectedPreset, onAlert]);

  // Helper function to get current TPS
  const getCurrentTPS = async (): Promise<number> => {
    if (!provider) return 0;
    try {
      const block = await provider.getBlock('latest');
      return block.transactions.length / 12; // Assuming ~12 second block time
    } catch {
      return 0;
    }
  };

  // Helper function to check API health
  const checkAPIHealth = async (): Promise<{ status: 'healthy' | 'degraded' | 'down', latency: number }> => {
    const start = Date.now();
    try {
      const response = await fetch('https://api.etherscan.io/api?module=gastracker&action=gasoracle');
      const latency = Date.now() - start;
      
      if (!response.ok) {
        return { status: 'down', latency };
      }
      
      return {
        status: latency > 1000 ? 'degraded' : 'healthy',
        latency
      };
    } catch {
      return { status: 'down', latency: 0 };
    }
  };

  return (
    <DashboardLayout>
      <div className={`network-monitoring-dashboard ${className || ''}`}>
        <div className="presets-section">
          <h3>Monitoring Presets</h3>
          <div className="preset-list">
            {PUBLIC_PRESETS.map(preset => (
              <button
                key={preset.name}
                className={`preset-button ${selectedPreset.name === preset.name ? 'active' : ''}`}
                onClick={() => setSelectedPreset(preset)}
              >
                {preset.name}
              </button>
            ))}
            {isVIP && VIP_PRESETS.map(preset => (
              <button
                key={preset.name}
                className={`preset-button vip ${selectedPreset.name === preset.name ? 'active' : ''}`}
                onClick={() => setSelectedPreset(preset)}
              >
                {preset.name} (VIP)
              </button>
            ))}
          </div>
        </div>

        {status && (
          <div className="monitoring-grid">
            <div className="grid-item">
              <h4>Network Status</h4>
              <div className={`status-indicator ${status.healthStatus.isResponding ? 'healthy' : 'error'}`}>
                {status.healthStatus.isResponding ? 'Online' : 'Offline'}
              </div>
              <p>Latency: {status.healthStatus.latency}ms</p>
            </div>

            <div className="grid-item">
              <h4>Gas Metrics</h4>
              <p>Current: {ethers.utils.formatUnits(gasStats?.average || 0, 'gwei')} gwei</p>
              <p>Trend: {gasStats?.trend}</p>
            </div>

            {status.l2Status && (
              <div className="grid-item">
                <h4>L2 Metrics</h4>
                <p>Sequencer Latency: {status.l2Status.sequencerLatency}s</p>
                {status.l2Status.batchSize && (
                  <p>Batch Size: {status.l2Status.batchSize}</p>
                )}
              </div>
            )}

            {networkSignals && (
              <div className="grid-item">
                <h4>Market Signals</h4>
                <p>ETH Price: ${networkSignals.priceFeeds.eth}</p>
                <p>Network TPS: {networkSignals.networkLoad.tps}</p>
                <p>API Status: {networkSignals.apiHealth.status}</p>
              </div>
            )}
          </div>
        )}

        {status?.alerts.length > 0 && (
          <div className="alerts-section">
            <h4>Active Alerts</h4>
            {status.alerts.map((alert: string, index: number) => (
              <div key={index} className="alert-item">
                ⚠️ {alert}
              </div>
            ))}
          </div>
        )}

        <style jsx>{`
          .network-monitoring-dashboard {
            background: rgba(20, 20, 20, 0.95);
            border-radius: 16px;
            padding: 24px;
            border: 1px solid rgba(255, 255, 255, 0.1);
          }

          .presets-section {
            margin-bottom: 24px;
          }

          .preset-list {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
          }

          .preset-button {
            padding: 8px 16px;
            border-radius: 8px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            background: transparent;
            color: white;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .preset-button:hover {
            border-color: rgba(255, 255, 255, 0.4);
          }

          .preset-button.active {
            background: rgba(0, 255, 159, 0.1);
            border-color: #00ff9f;
          }

          .preset-button.vip {
            border-color: #ffd700;
          }

          .monitoring-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 24px;
            margin-bottom: 24px;
          }

          .grid-item {
            background: rgba(30, 30, 30, 0.5);
            padding: 16px;
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.05);
          }

          .status-indicator {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            margin-bottom: 8px;
          }

          .status-indicator.healthy {
            background: rgba(0, 255, 159, 0.1);
            color: #00ff9f;
          }

          .status-indicator.error {
            background: rgba(255, 59, 48, 0.1);
            color: #ff3b30;
          }

          .alerts-section {
            background: rgba(255, 59, 48, 0.1);
            border: 1px solid #ff3b30;
            border-radius: 12px;
            padding: 16px;
          }

          .alert-item {
            margin: 8px 0;
            padding: 8px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
          }
        `}</style>
      </div>
    </DashboardLayout>
  );
};

// In _app.tsx or similar
import { TestModeProvider } from '../components/test/TestModeProvider';

function MyApp({ Component, pageProps }) {
  return (
    <TestModeProvider>
      <Component {...pageProps} />
    </TestModeProvider>
  );
}
