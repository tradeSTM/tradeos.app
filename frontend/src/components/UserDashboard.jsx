import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

export default function UserDashboard({ wallet }) {
  const [assets, setAssets] = useState([]);
  const [lpScore, setLpScore] = useState(null);

  useEffect(() => {
    if (!wallet) return setAssets([]);
    // Replace with your backend endpoint for assets & LP scoring
    fetch("/api/wallets/assets", {
      method: "POST",
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ wallets: [wallet.address] })
    })
      .then(r => r.json())
      .then(d => setAssets(d.assets || []));

    // LP position scan/scoring (use DefiLlama, backend, or on-chain)
    fetch(`/api/lp/score/${wallet.address}`)
      .then(r=>r.json()).then(d=>setLpScore(d.score));
  }, [wallet]);

  return (
    <div>
      <h2 className="mb-3">User Dashboard</h2>
      <h5 className="mt-3">Wallet Assets</h5>
      <div className="row g-2">
        {assets.map(a => (
          <div key={a.chain+a.symbol} className="col-md-4 col-6">
            <div className="card p-2">
              <span className="fw-bold">{a.symbol}</span>
              <div>{a.balance}</div>
              <small className="text-muted">{a.chain}</small>
            </div>
          </div>
        ))}
      </div>
      <h5 className="mt-4">LP Position Score</h5>
      <div className="card p-3">
        {lpScore !== null ? (
          <h6>Your LP Score: <span className="text-main">{lpScore}</span></h6>
        ) : (
          <span>Loading LP data...</span>
        )}
      </div>
    </div>
  );
}
