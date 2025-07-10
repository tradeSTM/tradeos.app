import { ethers } from "ethers";
import abi from "../../contracts/abis/FlashLoanArb.json" assert { type: "json" };
import pools from "../data/pools.tokens.json" assert { type: "json" };

export async function runFlashLoanArb(chain, asset, amount, privKey) {
  const chainPools = pools.AaveV3[chain];
  if (!chainPools) throw new Error("No pool for this chain!");
  const provider = new ethers.JsonRpcProvider(process.env[`${chain.toUpperCase()}_RPC`]);
  const wallet = new ethers.Wallet(privKey, provider);
  const contract = new ethers.Contract(process.env.FLASHLOAN_ARB_ADDRESS, abi, wallet);
  const tx = await contract.executeArb(chainPools.pool, asset, amount, "0x");
  return await tx.wait();
}