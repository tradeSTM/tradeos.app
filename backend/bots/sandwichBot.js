import { ethers } from "ethers";
import abi from "../../contracts/abis/SandwichBot.json" assert { type: "json" };

export async function runSandwichBot(chain, dex, tokenIn, tokenOut, amount, privKey) {
  const provider = new ethers.JsonRpcProvider(process.env[`${chain.toUpperCase()}_RPC`]);
  const wallet = new ethers.Wallet(privKey, provider);
  const contract = new ethers.Contract(process.env.SANDWICH_BOT_ADDRESS, abi, wallet);
  const tx = await contract.sandwichAttack(dex, tokenIn, tokenOut, amount);
  return await tx.wait();
}