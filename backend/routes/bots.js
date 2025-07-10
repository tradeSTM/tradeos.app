import express from "express";
import { runFlashLoanArb } from "../bots/flashLoanArb.js";
import { runSandwichBot } from "../bots/sandwichBot.js";
import { runUnibot } from "../bots/unibot.js";
import { claimAirdrop } from "../bots/airdropChecker.js";
import { createGnosisSafe } from "../bots/gnosisSafe.js";
const router = express.Router();

router.post("/flashloanarb", async (req, res) => {
  try {
    const { chain, asset, amount, privKey } = req.body;
    const result = await runFlashLoanArb(chain, asset, amount, privKey);
    res.json({ success: true, result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/sandwich", async (req, res) => {
  try {
    const { chain, dex, tokenIn, tokenOut, amount, privKey } = req.body;
    const result = await runSandwichBot(chain, dex, tokenIn, tokenOut, amount, privKey);
    res.json({ success: true, result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/unibot", async (req, res) => {
  try {
    const { chain, router, path, deadline, amountETH, privKey } = req.body;
    const result = await runUnibot(chain, router, path, deadline, amountETH, privKey);
    res.json({ success: true, result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/airdrop", async (req, res) => {
  try {
    const { chain, airdrop, privKey } = req.body;
    const result = await claimAirdrop(chain, airdrop, privKey);
    res.json({ success: true, result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/gnosis", async (req, res) => {
  try {
    const { chain, singleton, initializer, salt, privKey } = req.body;
    const result = await createGnosisSafe(chain, singleton, initializer, salt, privKey);
    res.json({ success: true, result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;