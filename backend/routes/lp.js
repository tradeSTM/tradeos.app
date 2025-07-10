import express from "express";
import { getLPScore } from "../utils/lpScore.js";
const router = express.Router();

router.get("/score/:address", async (req, res) => {
  try {
    const score = await getLPScore(req.params.address);
    res.json({ score });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;