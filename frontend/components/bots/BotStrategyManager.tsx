import React from 'react';
import { ethers } from 'ethers';

interface BotStrategy {
  id: string;
  name: string;
  type: 'MEV' | 'Arbitrage' | 'LiquiditySnipe' | 'FlashLoan';
  params: {
    maxGas: number;
    minProfit: number;
    tokens: string[];
  };
  performance: {
    profit24h: number;
    trades: number;
    successRate: number;
  };
}

export const BotStrategyManager: React.FC<{
  strategies: BotStrategy[];
  onUpdate: (strategy: BotStrategy) => void;
  onDelete: (id: string) => void;
}> = ({ strategies, onUpdate, onDelete }) => {
  return (
    <div className="bot-strategy-manager">
      <div className="strategy-list">
        {strategies.map(strategy => (
          <div key={strategy.id} className="strategy-card">
            <div className="strategy-header">
              <h4>{strategy.name}</h4>
              <span className={`type-badge ${strategy.type.toLowerCase()}`}>
                {strategy.type}
              </span>
            </div>
            
            <div className="performance-metrics">
              <div className="metric">
                <span>24h Profit</span>
                <span className="value success">
                  ${strategy.performance.profit24h.toFixed(2)}
                </span>
              </div>
              <div className="metric">
                <span>Success Rate</span>
                <span className="value">
                  {strategy.performance.successRate}%
                </span>
              </div>
              <div className="metric">
                <span>Trades</span>
                <span className="value">
                  {strategy.performance.trades}
                </span>
              </div>
            </div>

            <div className="parameters">
              <div className="param-item">
                <span>Max Gas</span>
                <input
                  type="number"
                  value={strategy.params.maxGas}
                  onChange={(e) => onUpdate({
                    ...strategy,
                    params: {
                      ...strategy.params,
                      maxGas: parseInt(e.target.value)
                    }
                  })}
                />
              </div>
              <div className="param-item">
                <span>Min Profit</span>
                <input
                  type="number"
                  value={strategy.params.minProfit}
                  onChange={(e) => onUpdate({
                    ...strategy,
                    params: {
                      ...strategy.params,
                      minProfit: parseInt(e.target.value)
                    }
                  })}
                />
              </div>
            </div>

            <div className="token-list">
              {strategy.params.tokens.map((token, idx) => (
                <span key={idx} className="token-tag">{token}</span>
              ))}
            </div>

            <div className="strategy-actions">
              <button 
                className="action-btn edit"
                onClick={() => onUpdate(strategy)}
              >
                Edit Strategy
              </button>
              <button 
                className="action-btn delete"
                onClick={() => onDelete(strategy.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .bot-strategy-manager {
          padding: 20px;
        }

        .strategy-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .strategy-card {
          background: rgba(30, 30, 30, 0.7);
          border-radius: 16px;
          padding: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .strategy-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .type-badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
        }

        .type-badge.mev {
          background: rgba(255, 83, 83, 0.2);
          color: #ff5353;
        }

        .type-badge.arbitrage {
          background: rgba(0, 255, 159, 0.2);
          color: #00ff9f;
        }

        .type-badge.liquiditysnipe {
          background: rgba(83, 83, 255, 0.2);
          color: #5353ff;
        }

        .performance-metrics {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 16px;
        }

        .metric {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .value {
          font-size: 18px;
          font-weight: bold;
        }

        .value.success {
          color: #00ff9f;
        }

        .parameters {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 16px;
        }

        .param-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .param-item input {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 8px;
          color: white;
        }

        .token-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 16px;
        }

        .token-tag {
          background: rgba(0, 255, 159, 0.1);
          color: #00ff9f;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
        }

        .strategy-actions {
          display: flex;
          gap: 12px;
        }

        .action-btn {
          flex: 1;
          padding: 8px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .action-btn.edit {
          background: rgba(0, 255, 159, 0.1);
          color: #00ff9f;
        }

        .action-btn.delete {
          background: rgba(255, 59, 48, 0.1);
          color: #ff3b30;
        }
      `}</style>
    </div>
  );
};
