import React, { useState } from 'react';
import { ethers } from 'ethers';

interface FlashLoanOperation {
  id: string;
  asset: string;
  amount: string;
  protocol: 'Aave' | 'DyDx' | 'Balancer';
  strategy: {
    type: string;
    params: Record<string, any>;
  };
  status: 'active' | 'completed' | 'failed';
  profit?: string;
}

export const FlashLoanPanel: React.FC<{
  operations: FlashLoanOperation[];
  onExecute: (op: FlashLoanOperation) => void;
  onCancel: (id: string) => void;
}> = ({ operations, onExecute, onCancel }) => {
  const [newOperation, setNewOperation] = useState<Partial<FlashLoanOperation>>({
    protocol: 'Aave',
    strategy: {
      type: 'arbitrage',
      params: {}
    }
  });

  return (
    <div className="flash-loan-panel">
      <div className="operations-grid">
        <div className="new-operation grid-item">
          <h4>New Flash Loan</h4>
          <div className="form-group">
            <label>Asset</label>
            <select 
              value={newOperation.asset || ''} 
              onChange={e => setNewOperation({
                ...newOperation,
                asset: e.target.value
              })}
            >
              <option value="ETH">ETH</option>
              <option value="USDC">USDC</option>
              <option value="DAI">DAI</option>
              <option value="WBTC">WBTC</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Amount</label>
            <input 
              type="text"
              value={newOperation.amount || ''}
              onChange={e => setNewOperation({
                ...newOperation,
                amount: e.target.value
              })}
              placeholder="0.00"
            />
          </div>

          <div className="form-group">
            <label>Protocol</label>
            <select 
              value={newOperation.protocol || 'Aave'}
              onChange={e => setNewOperation({
                ...newOperation,
                protocol: e.target.value as any
              })}
            >
              <option value="Aave">Aave</option>
              <option value="DyDx">DyDx</option>
              <option value="Balancer">Balancer</option>
            </select>
          </div>

          <div className="form-group">
            <label>Strategy</label>
            <select 
              value={newOperation.strategy?.type || 'arbitrage'}
              onChange={e => setNewOperation({
                ...newOperation,
                strategy: {
                  type: e.target.value,
                  params: {}
                }
              })}
            >
              <option value="arbitrage">Arbitrage</option>
              <option value="liquidation">Liquidation</option>
              <option value="yield">Yield Farming</option>
            </select>
          </div>

          <button 
            className="execute-btn"
            onClick={() => newOperation.asset && newOperation.amount && 
              onExecute(newOperation as FlashLoanOperation)}
          >
            Execute Flash Loan
          </button>
        </div>

        {operations.map(op => (
          <div key={op.id} className={`operation-card ${op.status}`}>
            <div className="operation-header">
              <div className="asset-info">
                <span className="asset-icon">
                  {op.asset.slice(0, 1)}
                </span>
                <span className="asset-amount">
                  {ethers.utils.formatUnits(op.amount, 18)} {op.asset}
                </span>
              </div>
              <span className={`status-badge ${op.status}`}>
                {op.status}
              </span>
            </div>

            <div className="operation-details">
              <div className="detail-item">
                <span>Protocol</span>
                <span>{op.protocol}</span>
              </div>
              <div className="detail-item">
                <span>Strategy</span>
                <span>{op.strategy.type}</span>
              </div>
              {op.profit && (
                <div className="detail-item">
                  <span>Profit</span>
                  <span className="profit">
                    +${ethers.utils.formatUnits(op.profit, 18)}
                  </span>
                </div>
              )}
            </div>

            {op.status === 'active' && (
              <button 
                className="cancel-btn"
                onClick={() => onCancel(op.id)}
              >
                Cancel Operation
              </button>
            )}
          </div>
        ))}
      </div>

      <style jsx>{`
        .flash-loan-panel {
          padding: 20px;
        }

        .operations-grid {
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

        .form-group select,
        .form-group input {
          width: 100%;
          padding: 8px 12px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: white;
        }

        .execute-btn {
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

        .execute-btn:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        .operation-card {
          background: rgba(30, 30, 30, 0.7);
          border-radius: 16px;
          padding: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .operation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .asset-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .asset-icon {
          width: 32px;
          height: 32px;
          background: rgba(0, 255, 159, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #00ff9f;
        }

        .asset-amount {
          font-size: 18px;
          font-weight: bold;
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
        }

        .status-badge.active {
          background: rgba(0, 255, 159, 0.1);
          color: #00ff9f;
        }

        .status-badge.completed {
          background: rgba(0, 122, 255, 0.1);
          color: #007aff;
        }

        .status-badge.failed {
          background: rgba(255, 59, 48, 0.1);
          color: #ff3b30;
        }

        .operation-details {
          display: grid;
          gap: 12px;
          margin-bottom: 16px;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          color: rgba(255, 255, 255, 0.7);
        }

        .detail-item .profit {
          color: #00ff9f;
        }

        .cancel-btn {
          width: 100%;
          padding: 8px;
          background: rgba(255, 59, 48, 0.1);
          border: 1px solid #ff3b30;
          border-radius: 8px;
          color: #ff3b30;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .cancel-btn:hover {
          background: rgba(255, 59, 48, 0.2);
        }
      `}</style>
    </div>
  );
};
