import { ethers } from "ethers";
import abi from "../../contracts/abis/Unibot.json" assert { type: "json" };

export async function runUnibot(chain, router, path, deadline, amountETH, privKey) {
  const provider = new ethers.JsonRpcProvider(process.env[`${chain.toUpperCase()}_RPC`]);
  const wallet = new ethers.Wallet(privKey, provider);
  const contract = new ethers.Contract(process.env.UNIBOT_ADDRESS, abi, wallet);
  const tx = await contract.snipe(router, path, deadline, { value: amountETH });
  return await tx.wait();
}