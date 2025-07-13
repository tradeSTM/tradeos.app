import React, { useState } from 'react';
import axios from 'axios';

export default function AirdropClaimPanel() {
  const [amount, setAmount] = useState(0);
  const [proof, setProof] = useState<string[]>([]);
  const [status, setStatus] = useState('');

  const fetchProof = async () => {
    const res = await axios.get(`/api/merkle-proof?user=${window.ethereum.selectedAddress}`);
    setAmount(res.data.amount);
    setProof(res.data.proof);
  };

  const claim = async () => {
    setStatus('⏳ Claiming...');
    try {
      await axios.post('/api/airdrop/claim', { proof, amount });
      setStatus('✅ Claimed!');
    } catch (e) {
      setStatus(`❌ ${e.message}`);
    }
  };

  return (
    <div>
      <h3>Airdrop Claim</h3>
      <button onClick={fetchProof}>Fetch Proof</button>
      {proof.length > 0 && (
        <>
          <p>Eligible for: {amount} tokens</p>
          <button onClick={claim}>Claim Now</button>
        </>
      )}
      <p>{status}</p>
    </div>
  );
}
