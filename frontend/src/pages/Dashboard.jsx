import React from 'react';
import BotsPanel from './BotsPanel';
import ProfitSplitPanel from './ProfitSplitPanel';
import WalletPanel from './WalletPanel';
import ChainSelector from './ChainSelector';
import AdminPanel from './AdminPanel';
import LogPanel from './LogPanel';

export default function Dashboard() {
  return (
    <div className="container-fluid py-3" style={{ background: '#1a1c1e', minHeight: '100vh', color: '#fff' }}>
      <h2 className="mb-4 text-success">Trade OS Dashboard</h2>
      <div className="row">
        <div className="col-md-3">
          <ChainSelector />
          <WalletPanel />
        </div>
        <div className="col-md-6">
          <BotsPanel />
          <ProfitSplitPanel />
        </div>
        <div className="col-md-3">
          <AdminPanel />
          <LogPanel />
        </div>
      </div>
    </div>
  );
}
