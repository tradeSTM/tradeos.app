import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

interface TestContext {
  isAdmin: boolean;
  toggleAdmin: () => void;
  mockProvider: ethers.providers.JsonRpcProvider;
  mockAccounts: string[];
  currentAccount: string;
  switchAccount: (address: string) => void;
  mockData: {
    contracts: any[];
    transactions: any[];
    balances: Record<string, string>;
  };
}

const TestModeContext = createContext<TestContext | null>(null);

export const TestModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [mockProvider, setMockProvider] = useState<ethers.providers.JsonRpcProvider | null>(null);
  const [mockAccounts, setMockAccounts] = useState<string[]>([]);
  const [currentAccount, setCurrentAccount] = useState<string>('');
  const [mockData, setMockData] = useState({
    contracts: [],
    transactions: [],
    balances: {}
  });

  // Initialize test environment
  useEffect(() => {
    const initTestMode = async () => {
      // Connect to local test chain
      const provider = new ethers.providers.JsonRpcProvider('http://localhost:8585');
      setMockProvider(provider);

      // Get test accounts
      const accounts = await provider.listAccounts();
      setMockAccounts(accounts);
      
      // Set initial account (first account is admin)
      setCurrentAccount(accounts[0]);
      setIsAdmin(true);

      // Load mock data
      const mockDataResponse = await fetch('http://localhost:3001/api/mock-data');
      const data = await mockDataResponse.json();
      setMockData(data);
    };

    initTestMode();
  }, []);

  const toggleAdmin = () => {
    setIsAdmin(!isAdmin);
    // Switch between admin and user accounts
    setCurrentAccount(isAdmin ? mockAccounts[1] : mockAccounts[0]);
  };

  const switchAccount = (address: string) => {
    setCurrentAccount(address);
    setIsAdmin(address === mockAccounts[0]);
  };

  return (
    <TestModeContext.Provider 
      value={{
        isAdmin,
        toggleAdmin,
        mockProvider: mockProvider!,
        mockAccounts,
        currentAccount,
        switchAccount,
        mockData
      }}
    >
      {children}
      
      {/* Test Mode Controls */}
      <div className="test-mode-controls">
        <div className="test-mode-header">
          🧪 Test Mode Active
        </div>
        
        <div className="control-panel">
          <div className="account-section">
            <h4>Test Accounts</h4>
            <select 
              value={currentAccount}
              onChange={(e) => switchAccount(e.target.value)}
            >
              {mockAccounts.map((account, index) => (
                <option key={account} value={account}>
                  {index === 0 ? 'Admin' : `User ${index}`}: {account.slice(0, 6)}...
                </option>
              ))}
            </select>
          </div>

          <div className="role-toggle">
            <span>Current Role: {isAdmin ? 'Admin' : 'User'}</span>
            <button onClick={toggleAdmin}>
              Switch to {isAdmin ? 'User' : 'Admin'}
            </button>
          </div>

          <div className="network-info">
            <p>Test Network: Localhost:8545</p>
            <p>ChainId: 1337</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .test-mode-controls {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: rgba(20, 20, 20, 0.95);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 16px;
          color: white;
          z-index: 1000;
        }

        .test-mode-header {
          font-weight: bold;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .control-panel {
          display: grid;
          gap: 16px;
        }

        .account-section select {
          width: 100%;
          padding: 8px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: white;
          margin-top: 8px;
        }

        .role-toggle {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .role-toggle button {
          padding: 8px 16px;
          background: rgba(0, 255, 159, 0.1);
          border: 1px solid #00ff9f;
          border-radius: 8px;
          color: #00ff9f;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .role-toggle button:hover {
          background: rgba(0, 255, 159, 0.2);
        }

        .network-info {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
        }
      `}</style>
    </TestModeContext.Provider>
  );
};
