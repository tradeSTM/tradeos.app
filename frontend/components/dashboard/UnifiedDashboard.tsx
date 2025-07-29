import React, { useContext } from 'react';
import { NetworkMonitoringDashboard } from '../network/NetworkMonitoringDashboard';
import { TestModeContext } from '../test/TestModeProvider';
import { CoreControlPanel } from '../core/CoreControlPanel';
import { BotStrategyManager } from '../bots/BotStrategyManager';
import { FlashLoanPanel } from '../flash/FlashLoanPanel';
import { TokenLaunchControl } from '../tokens/TokenLaunchControl';

export const UnifiedDashboard: React.FC = () => {
  const testMode = useContext(TestModeContext);

  return (
    <div className="unified-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>TradeOS Dashboard</h1>
          <div className="connection-status">
            {testMode ? (
              <>
                <span className="test-mode">Test Mode</span>
                <span className="network">localhost:8545</span>
              </>
            ) : (
              <>
                <span className="live-mode">Live Mode</span>
                <span className="network">Connected to Mainnet</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Network Monitoring Section */}
        <div className="dashboard-section full-width">
          <NetworkMonitoringDashboard 
            isVIP={testMode?.isAdmin || false}
            onAlert={(alerts) => console.warn('Network Alerts:', alerts)}
          />
        </div>

        {/* Core Control Section */}
        <div className="dashboard-section full-width">
          <CoreControlPanel />
        </div>

        {/* Trading Bots Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Trading Bots</h2>
            {testMode?.isAdmin && (
              <button className="add-button">+ New Bot Strategy</button>
            )}
          </div>
          <BotStrategyManager 
            strategies={[]} 
            onUpdate={() => {}} 
            onDelete={() => {}}
          />
        </div>

        {/* Flash Loans Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Flash Loans</h2>
            {testMode?.isAdmin && (
              <button className="add-button">+ New Flash Loan</button>
            )}
          </div>
          <FlashLoanPanel 
            operations={[]} 
            onExecute={() => {}} 
            onCancel={() => {}}
          />
        </div>

        {/* Token Launch Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Token Launches</h2>
            {testMode?.isAdmin && (
              <button className="add-button">+ New Token</button>
            )}
          </div>
          <TokenLaunchControl 
            launches={[]} 
            onCreateLaunch={() => {}} 
            onUpdateLaunch={() => {}}
          />
        </div>

        {/* Mock API Controls (Test Mode Only) */}
        {testMode && (
          <div className="dashboard-section mock-controls">
            <div className="section-header">
              <h2>Mock API Controls</h2>
              <div className="api-status">
                <span className="status-dot online"></span>
                Mock API: http://localhost:3001
              </div>
            </div>
            <div className="mock-actions">
              <button onClick={() => fetch('http://localhost:3001/api/deploy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'Token',
                  params: { name: 'Test Token', symbol: 'TEST' }
                })
              })}>
                Deploy Test Token
              </button>
              <button onClick={() => fetch('http://localhost:3001/api/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'FlashLoan',
                  params: { amount: '1000000000000000000', asset: 'ETH' }
                })
              })}>
                Simulate Flash Loan
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .unified-dashboard {
          min-height: 100vh;
          background: #121212;
          color: white;
        }

        .dashboard-header {
          background: rgba(30, 30, 30, 0.95);
          padding: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .connection-status {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .test-mode {
          background: rgba(255, 159, 0, 0.1);
          color: #ff9f00;
          padding: 4px 12px;
          border-radius: 12px;
        }

        .live-mode {
          background: rgba(0, 255, 159, 0.1);
          color: #00ff9f;
          padding: 4px 12px;
          border-radius: 12px;
        }

        .network {
          color: rgba(255, 255, 255, 0.7);
        }

        .dashboard-grid {
          max-width: 1400px;
          margin: 0 auto;
          padding: 24px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
        }

        .dashboard-section {
          background: rgba(30, 30, 30, 0.95);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          overflow: hidden;
        }

        .dashboard-section.full-width {
          grid-column: 1 / -1;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .add-button {
          padding: 8px 16px;
          background: rgba(0, 255, 159, 0.1);
          border: 1px solid #00ff9f;
          border-radius: 8px;
          color: #00ff9f;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .add-button:hover {
          background: rgba(0, 255, 159, 0.2);
        }

        .mock-controls {
          grid-column: 1 / -1;
          background: rgba(20, 20, 20, 0.95);
        }

        .api-status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .status-dot.online {
          background: #00ff9f;
        }

        .mock-actions {
          padding: 20px;
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .mock-actions button {
          padding: 8px 16px;
          background: rgba(0, 122, 255, 0.1);
          border: 1px solid #007aff;
          border-radius: 8px;
          color: #007aff;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .mock-actions button:hover {
          background: rgba(0, 122, 255, 0.2);
        }
      `}</style>
    </div>
  );
};
