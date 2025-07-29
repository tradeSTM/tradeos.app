import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import { NetworkMonitoringDashboard } from './NetworkMonitoringDashboard';

interface CoreMetrics {
  fees: {
    total24h: number;
    averageGas: number;
    pending: number;
  };
  bots: {
    active: number;
    profits24h: number;
    activeStrategies: string[];
  };
  contracts: {
    deployed: number;
    verified: number;
    totalValue: number;
  };
  flashLoans: {
    active: number;
    volume24h: number;
    successRate: number;
  };
  tokens: {
    launched24h: number;
    totalLiquidity: number;
    topPerformers: string[];
  };
  aggregator: {
    routes: number;
    savings: number;
    volume: number;
  };
}

interface AutomationTask {
  id: string;
  type: 'bot' | 'flashloan' | 'token' | 'aggregator';
  status: 'active' | 'paused' | 'error';
  metrics: {
    success: number;
    fails: number;
    profit: number;
  };
}

export const CoreControlPanel: React.FC = () => {
  const { library: provider, account } = useWeb3React();
  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState<CoreMetrics | null>(null);
  const [automations, setAutomations] = useState<AutomationTask[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTask, setSelectedTask] = useState<AutomationTask | null>(null);

  // Fetch core metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      if (!provider || !account) return;

      try {
        // Example data - replace with actual API calls
        setMetrics({
          fees: {
            total24h: 25.5,
            averageGas: 45,
            pending: 12
          },
          bots: {
            active: 8,
            profits24h: 3.2,
            activeStrategies: ['MEV', 'Arbitrage', 'LiquiditySniper']
          },
          contracts: {
            deployed: 156,
            verified: 142,
            totalValue: 1250000
          },
          flashLoans: {
            active: 5,
            volume24h: 450000,
            successRate: 98.5
          },
          tokens: {
            launched24h: 12,
            totalLiquidity: 850000,
            topPerformers: ['TOKEN1', 'TOKEN2', 'TOKEN3']
          },
          aggregator: {
            routes: 1250,
            savings: 15.5,
            volume: 2500000
          }
        });
      } catch (error) {
        console.error('Error fetching metrics:', error);
      }
    };

    const interval = setInterval(fetchMetrics, 15000);
    fetchMetrics();
    return () => clearInterval(interval);
  }, [provider, account]);

  return (
    <div className="core-control-panel">
      <div className="control-header">
        <h2>TradeOS Core Control Panel</h2>
        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`tab-button ${activeTab === 'bots' ? 'active' : ''}`}
            onClick={() => setActiveTab('bots')}
          >
            Trading Bots
          </button>
          <button
            className={`tab-button ${activeTab === 'contracts' ? 'active' : ''}`}
            onClick={() => setActiveTab('contracts')}
          >
            Smart Contracts
          </button>
          <button
            className={`tab-button ${activeTab === 'flash' ? 'active' : ''}`}
            onClick={() => setActiveTab('flash')}
          >
            Flash Loans
          </button>
          <button
            className={`tab-button ${activeTab === 'tokens' ? 'active' : ''}`}
            onClick={() => setActiveTab('tokens')}
          >
            Token Launch
          </button>
          <button
            className={`tab-button ${activeTab === 'aggregator' ? 'active' : ''}`}
            onClick={() => setActiveTab('aggregator')}
          >
            DEX Aggregator
          </button>
        </div>
      </div>

      <div className="metrics-grid">
        {metrics && (
          <>
            <div className="metric-card primary">
              <h3>Total Value Controlled</h3>
              <div className="value">${metrics.contracts.totalValue.toLocaleString()}</div>
              <div className="sub-metrics">
                <div>
                  <span>24h Volume</span>
                  <span>${metrics.flashLoans.volume24h.toLocaleString()}</span>
                </div>
                <div>
                  <span>Active Bots</span>
                  <span>{metrics.bots.active}</span>
                </div>
              </div>
            </div>

            <div className="metric-card">
              <h3>Trading Bots</h3>
              <div className="value success">+${metrics.bots.profits24h.toFixed(2)}</div>
              <div className="strategies">
                {metrics.bots.activeStrategies.map(strategy => (
                  <span key={strategy} className="strategy-tag">{strategy}</span>
                ))}
              </div>
            </div>

            <div className="metric-card">
              <h3>Flash Loans</h3>
              <div className="value">{metrics.flashLoans.successRate}% Success</div>
              <div className="sub-text">
                {metrics.flashLoans.active} Active Operations
              </div>
            </div>

            <div className="metric-card">
              <h3>Token Launches</h3>
              <div className="value">{metrics.tokens.launched24h} Today</div>
              <div className="token-list">
                {metrics.tokens.topPerformers.map(token => (
                  <div key={token} className="token-item success">
                    {token} ↗
                  </div>
                ))}
              </div>
            </div>

            <div className="metric-card">
              <h3>DEX Aggregator</h3>
              <div className="value">{metrics.aggregator.savings}% Saved</div>
              <div className="sub-text">
                {metrics.aggregator.routes.toLocaleString()} Active Routes
              </div>
            </div>

            <div className="metric-card">
              <h3>Network Fees</h3>
              <div className="value warning">
                {metrics.fees.averageGas} Gwei
              </div>
              <div className="sub-text">
                ${metrics.fees.total24h.toFixed(2)} spent in 24h
              </div>
            </div>
          </>
        )}
      </div>

      <div className="control-section">
        <h3>Active Automations</h3>
        <div className="automation-list">
          {automations.map(task => (
            <div key={task.id} className={`automation-card ${task.status}`}>
              <div className="task-header">
                <span className="task-type">{task.type}</span>
                <span className={`status-badge ${task.status}`}>
                  {task.status}
                </span>
              </div>
              <div className="task-metrics">
                <div>Success: {task.metrics.success}</div>
                <div>Profit: ${task.metrics.profit.toFixed(2)}</div>
              </div>
              <div className="task-actions">
                <button 
                  className="action-button"
                  onClick={() => setSelectedTask(task)}
                >
                  Edit
                </button>
                <button 
                  className="action-button danger"
                  onClick={() => {/* Handle delete */}}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Network Monitoring Integration */}
      <NetworkMonitoringDashboard
        isVIP={true}
        onAlert={(alerts) => {
          // Handle alerts
          console.warn('Network Alerts:', alerts);
        }}
      />

      <style jsx>{`
        .core-control-panel {
          background: #1a1a1a;
          border-radius: 20px;
          padding: 24px;
          color: white;
        }

        .control-header {
          margin-bottom: 32px;
        }

        .tab-navigation {
          display: flex;
          gap: 12px;
          margin-top: 16px;
          overflow-x: auto;
          padding-bottom: 8px;
        }

        .tab-button {
          padding: 8px 16px;
          border-radius: 8px;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .tab-button.active {
          background: rgba(0, 255, 159, 0.1);
          border-color: #00ff9f;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }

        .metric-card {
          background: rgba(30, 30, 30, 0.5);
          border-radius: 16px;
          padding: 20px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .metric-card.primary {
          grid-column: span 2;
          background: linear-gradient(135deg, rgba(0, 255, 159, 0.1), rgba(0, 87, 255, 0.1));
        }

        .value {
          font-size: 28px;
          font-weight: bold;
          margin: 12px 0;
        }

        .value.success {
          color: #00ff9f;
        }

        .value.warning {
          color: #ffd700;
        }

        .sub-metrics {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .strategy-tag {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          background: rgba(0, 255, 159, 0.1);
          color: #00ff9f;
          margin: 4px;
          font-size: 12px;
        }

        .token-list {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .token-item {
          padding: 4px 12px;
          border-radius: 8px;
          font-size: 12px;
        }

        .token-item.success {
          background: rgba(0, 255, 159, 0.1);
          color: #00ff9f;
        }

        .automation-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }

        .automation-card {
          background: rgba(30, 30, 30, 0.5);
          border-radius: 12px;
          padding: 16px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .task-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .status-badge {
          padding: 4px 8px;
          border-radius: 8px;
          font-size: 12px;
        }

        .status-badge.active {
          background: rgba(0, 255, 159, 0.1);
          color: #00ff9f;
        }

        .status-badge.error {
          background: rgba(255, 59, 48, 0.1);
          color: #ff3b30;
        }

        .task-actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }

        .action-button {
          padding: 6px 12px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.3s ease;
        }

        .action-button.danger {
          background: rgba(255, 59, 48, 0.1);
          color: #ff3b30;
        }

        .action-button:hover {
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
};
