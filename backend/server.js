import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import botsRouter from "./routes/bots.js";
import walletRouter from "./routes/wallets.js";
import lpRouter from "./routes/lp.js";
import tokenRouter from "./routes/token.js";
dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use("/api/bots", botsRouter);
app.use("/api/wallets", walletRouter);
app.use("/api/lp", lpRouter);
app.use("/api/token", tokenRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log("Backend running on", PORT));