import React, { useState } from "react";
import { ethers } from "ethers";

const ERC20_TEMPLATE = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
contract MyToken {
  string public name = "NAME";
  string public symbol = "SYMBOL";
  uint8 public decimals = 18;
  uint256 public totalSupply;
  mapping(address=>uint256) public balanceOf;
  constructor(uint256 supply) {
    totalSupply = supply;
    balanceOf[msg.sender] = supply;
  }
}
`;

export default function TokenDeployer({ wallet }) {
  const [form, setForm] = useState({ name: "", symbol: "", supply: 1000000 });
  const [deploying, setDeploying] = useState(false);
  const [tx, setTx] = useState();

  async function deploy() {
    if (!wallet) return;
    setDeploying(true);
    // Replace with backend endpoint for contract deployment via ethers.js
    const res = await fetch("/api/token/deploy", {
      method: "POST",
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(form)
    });
    const data = await res.json();
    setTx(data.tx || data.error);
    setDeploying(false);
  }

  return (
    <div>
      <h2>Token Deployment</h2>
      <div className="card p-3 mb-3">
        <label>Name <input className="form-control" value={form.name} onChange={e=>setForm(f=>({...f, name:e.target.value}))}/></label>
        <label>Symbol <input className="form-control" value={form.symbol} onChange={e=>setForm(f=>({...f, symbol:e.target.value}))}/></label>
        <label>Supply <input type="number" className="form-control" value={form.supply} onChange={e=>setForm(f=>({...f, supply:e.target.value}))}/></label>
        <button className="btn btn-main mt-2" disabled={deploying} onClick={deploy}>Deploy Token</button>
      </div>
      <h6>ERC20 Template:</h6>
      <pre style={{fontSize:"80%",background:"#23263a",color:"#aaffaa"}}>{ERC20_TEMPLATE}</pre>
      {tx && <div className="alert alert-info mt-3">Result: {tx}</div>}
    </div>
  );
}
