import React, { useState } from "react";

export default function BotPanel({ wallet }) {
  const [status, setStatus] = useState("");
  const [bot, setBot] = useState("unibot");
  const [result, setResult] = useState(null);

  async function runBot() {
    setStatus("Running...");
    let path = "", body = {};
    if (bot === "unibot") {
      path = "/api/bots/unibot";
      body = {
        chain: "Ethereum",
        router: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
        path: [],
        deadline: Math.floor(Date.now()/1000)+600,
        amountETH: "10000000000000000",
        privKey: "..."
      };
    }
    if (bot === "airdrop") {
      path = "/api/bots/airdrop";
      body = { chain: "Ethereum", airdrop: "0x...", privKey: "..." };
    }
    if (bot === "gnosis") {
      path = "/api/bots/gnosis";
      body = {
        chain: "Ethereum",
        singleton: "0x...",
        initializer: "0x",
        salt: 1,
        privKey: "..."
      };
    }
    const res = await fetch(path, {
      method: "POST",
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(body)
    });
    const data = await res.json();
    setResult(JSON.stringify(data));
    setStatus("");
  }

  return (
    <div>
      <h2>MEV/DeFi Bot Panel</h2>
      <div className="mb-2">
        <select className="form-select w-auto d-inline" value={bot} onChange={e=>setBot(e.target.value)}>
          <option value="unibot">Unibot (Snipe/Arb)</option>
          <option value="airdrop">Airdrop Auto-Claim</option>
          <option value="gnosis">Gnosis Safe Factory</option>
        </select>
        <button className="btn btn-main ms-2" onClick={runBot}>Run Bot</button>
      </div>
      {status && <span>{status}</span>}
      {result && <pre style={{background:"#23263a",color:"#fff"}}>{result}</pre>}
    </div>
  );
}
