import React, { useState } from 'react';
import { CHAINS, FEE_WALLET, RESERVE_WALLET } from '../../backend/lib/constants';

export default function ProfitSplitPanel({ recentProfits }) {
  const [selectedChain, setSelectedChain] = useState("base");

  return (
    <div className="card bg-dark text-light">
      <div className="card-header">Profit Split & Multi-Chain Settings</div>
      <div className="card-body">
        <div className="mb-3">
          <label>Active Chain:</label>
          <select
            className="form-select"
            value={selectedChain}
            onChange={e => setSelectedChain(e.target.value)}
          >
            {Object.entries(CHAINS).map(([key, val]) => (
              <option key={key} value={key}>{val.name}</option>
            ))}
          </select>
        </div>
        <div>Fee Wallet: <span className="text-warning">{FEE_WALLET}</span></div>
        <div>Reserve Wallet: <span className="text-success">{RESERVE_WALLET}</span></div>
        <hr />
        <h5>Recent Profits</h5>
        <table className="table table-dark table-sm">
          <thead>
            <tr>
              <th>Time</th>
              <th>Chain</th>
              <th>Profit</th>
              <th>Fee (20%)</th>
              <th>Reserve (80%)</th>
            </tr>
          </thead>
          <tbody>
            {recentProfits.map((p, i) => (
              <tr key={i}>
                <td>{p.time}</td>
                <td>{CHAINS[p.chain]?.name || p.chain}</td>
                <td>{p.profit}</td>
                <td>{p.fee}</td>
                <td>{p.reserve}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}