import React, { useState } from 'react';
import { ethers } from 'ethers';

interface TokenLaunchData {
  id: string;
  name: string;
  symbol: string;
  supply: string;
  initialPrice: string;
  liquidityAllocation: number;
  vestingSchedule?: {
    cliff: number;
    duration: number;
    intervals: number;
  };
  status: 'draft' | 'scheduled' | 'live' | 'completed';
  metrics?: {
    holders: number;
    volume24h: number;
    price: number;
    marketCap: number;
  };
}

export const TokenLaunchControl: React.FC<{
  launches: TokenLaunchData[];
  onCreateLaunch: (launch: TokenLaunchData) => void;
  onUpdateLaunch: (id: string, data: Partial<TokenLaunchData>) => void;
}> = ({ launches, onCreateLaunch, onUpdateLaunch }) => {
  const [newLaunch, setNewLaunch] = useState<Partial<TokenLaunchData>>({
    liquidityAllocation: 60,
    status: 'draft'
  });

  return (
    <div className="token-launch-control">
      <div className="launch-grid">
        <div className="new-launch grid-item">
          <h4>New Token Launch</h4>
          <div className="form-group">
            <label>Token Name</label>
            <input
              type="text"
              value={newLaunch.name || ''}
              onChange={e => setNewLaunch({
                ...newLaunch,
                name: e.target.value
              })}
              placeholder="Token Name"
            />
          </div>

          <div className="form-group">
            <label>Symbol</label>
            <input
              type="text"
              value={newLaunch.symbol || ''}
              onChange={e => setNewLaunch({
                ...newLaunch,
                symbol: e.target.value.toUpperCase()
              })}
              placeholder="TOKEN"
              maxLength={6}
            />
          </div>

          <div className="form-group">
            <label>Initial Supply</label>
            <input
              type="text"
              value={newLaunch.supply || ''}
              onChange={e => setNewLaunch({
                ...newLaunch,
                supply: e.target.value
              })}
              placeholder="1000000"
            />
          </div>

          <div className="form-group">
            <label>Initial Price (ETH)</label>
            <input
              type="text"
              value={newLaunch.initialPrice || ''}
              onChange={e => setNewLaunch({
                ...newLaunch,
                initialPrice: e.target.value
              })}
              placeholder="0.0001"
            />
          </div>

          <div className="form-group">
            <label>Liquidity Allocation (%)</label>
            <input
              type="number"
              value={newLaunch.liquidityAllocation || 60}
              onChange={e => setNewLaunch({
                ...newLaunch,
                liquidityAllocation: parseInt(e.target.value)
              })}
              min={0}
              max={100}
            />
          </div>

          <div className="form-group">
            <label>Vesting Schedule</label>
            <div className="vesting-inputs">
              <input
                type="number"
                placeholder="Cliff (days)"
                value={newLaunch.vestingSchedule?.cliff || ''}
                onChange={e => setNewLaunch({
                  ...newLaunch,
                  vestingSchedule: {
                    ...newLaunch.vestingSchedule,
                    cliff: parseInt(e.target.value),
                    duration: newLaunch.vestingSchedule?.duration || 365,
                    intervals: newLaunch.vestingSchedule?.intervals || 12
                  }
                })}
              />
              <input
                type="number"
                placeholder="Duration (days)"
                value={newLaunch.vestingSchedule?.duration || ''}
                onChange={e => setNewLaunch({
                  ...newLaunch,
                  vestingSchedule: {
                    ...newLaunch.vestingSchedule,
                    cliff: newLaunch.vestingSchedule?.cliff || 90,
                    duration: parseInt(e.target.value),
                    intervals: newLaunch.vestingSchedule?.intervals || 12
                  }
                })}
              />
            </div>
          </div>

          <button
            className="create-btn"
            onClick={() => {
              if (newLaunch.name && newLaunch.symbol && newLaunch.supply) {
                onCreateLaunch(newLaunch as TokenLaunchData);
                setNewLaunch({
                  liquidityAllocation: 60,
                  status: 'draft'
                });
              }
            }}
          >
            Create Token Launch
          </button>
        </div>

        {launches.map(launch => (
          <div key={launch.id} className={`launch-card ${launch.status}`}>
            <div className="launch-header">
              <div className="token-info">
                <h4>{launch.name}</h4>
                <span className="symbol">{launch.symbol}</span>
              </div>
              <span className={`status-badge ${launch.status}`}>
                {launch.status}
              </span>
            </div>

            <div className="launch-details">
              <div className="detail-item">
                <span>Supply</span>
                <span>{ethers.utils.formatUnits(launch.supply, 18)}</span>
              </div>
              <div className="detail-item">
                <span>Initial Price</span>
                <span>{launch.initialPrice} ETH</span>
              </div>
              <div className="detail-item">
                <span>Liquidity</span>
                <span>{launch.liquidityAllocation}%</span>
              </div>
            </div>

            {launch.metrics && (
              <div className="metrics-section">
                <div className="metric-item">
                  <span>Holders</span>
                  <span>{launch.metrics.holders}</span>
                </div>
                <div className="metric-item">
                  <span>24h Volume</span>
                  <span>${launch.metrics.volume24h.toLocaleString()}</span>
                </div>
                <div className="metric-item">
                  <span>Price</span>
                  <span>${launch.metrics.price.toFixed(6)}</span>
                </div>
                <div className="metric-item">
                  <span>Market Cap</span>
                  <span>${launch.metrics.marketCap.toLocaleString()}</span>
                </div>
              </div>
            )}

            {launch.status === 'draft' && (
              <div className="launch-actions">
                <button
                  className="schedule-btn"
                  onClick={() => onUpdateLaunch(launch.id, { status: 'scheduled' })}
                >
                  Schedule Launch
                </button>
                <button
                  className="edit-btn"
                  onClick={() => setNewLaunch(launch)}
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <style jsx>{`
        .token-launch-control {
          padding: 20px;
        }

        .launch-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .grid-item {
          background: rgba(30, 30, 30, 0.7);
          border-radius: 16px;
          padding: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: rgba(255, 255, 255, 0.7);
        }

        .form-group input {
          width: 100%;
          padding: 8px 12px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: white;
        }

        .vesting-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .create-btn {
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #00ff9f, #00f0ff);
          border: none;
          border-radius: 8px;
          color: black;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .launch-card {
          background: rgba(30, 30, 30, 0.7);
          border-radius: 16px;
          padding: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .launch-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .token-info {
          display: flex;
          flex-direction: column;
        }

        .symbol {
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
        }

        .status-badge.draft {
          background: rgba(142, 142, 147, 0.2);
          color: #8e8e93;
        }

        .status-badge.scheduled {
          background: rgba(255, 204, 0, 0.2);
          color: #ffcc00;
        }

        .status-badge.live {
          background: rgba(0, 255, 159, 0.2);
          color: #00ff9f;
        }

        .launch-details {
          display: grid;
          gap: 12px;
          margin-bottom: 16px;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          color: rgba(255, 255, 255, 0.7);
        }

        .metrics-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          background: rgba(0, 0, 0, 0.2);
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 16px;
        }

        .metric-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .launch-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .schedule-btn {
          padding: 8px;
          background: rgba(0, 255, 159, 0.1);
          border: 1px solid #00ff9f;
          border-radius: 8px;
          color: #00ff9f;
          cursor: pointer;
        }

        .edit-btn {
          padding: 8px;
          background: rgba(0, 122, 255, 0.1);
          border: 1px solid #007aff;
          border-radius: 8px;
          color: #007aff;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};
