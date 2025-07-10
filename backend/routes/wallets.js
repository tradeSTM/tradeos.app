import express from "express";
import { CHAINS } from "../lib/constants.js";
import axios from "axios";
const router = express.Router();

router.post("/assets", async (req, res) => {
  const { wallets } = req.body;
  let assets = [];
  for (const chainName in CHAINS) {
    const chain = CHAINS[chainName];
    for (const wallet of wallets) {
      try {
        const { data } = await axios.post(chain.rpc, {
          jsonrpc: "2.0",
          method: "eth_getBalance",
          params: [wallet, "latest"],
          id: 1
        });
        assets.push({
          wallet,
          chain: chain.name,
          symbol: chain.symbol,
          balance: (parseInt(data.result, 16) / 1e18).toFixed(4)
        });
      } catch {}
    }
  }
  res.json({ assets });
});

export default router;