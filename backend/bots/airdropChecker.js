import { ethers } from "ethers";
import abi from "../../contracts/abis/AirdropChecker.json" assert { type: "json" };

export async function claimAirdrop(chain, airdrop, privKey) {
  const provider = new ethers.JsonRpcProvider(process.env[`${chain.toUpperCase()}_RPC`]);
  const wallet = new ethers.Wallet(privKey, provider);
  const contract = new ethers.Contract(process.env.AIRDROP_CHECKER_ADDRESS, abi, wallet);
  const tx = await contract.claimAirdrop(airdrop);
  return await tx.wait();
}