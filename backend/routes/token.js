import express from "express";
import { deployToken } from "../utils/tokenDeploy.js";
const router = express.Router();

router.post("/deploy", async (req, res) => {
  try {
    const { name, symbol, supply } = req.body;
    const tx = await deployToken(name, symbol, supply);
    res.json({ tx });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;