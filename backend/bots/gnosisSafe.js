import { ethers } from "ethers";
import abi from "../../contracts/abis/GnosisSafeFactory.json" assert { type: "json" };

export async function createGnosisSafe(chain, singleton, initializer, salt, privKey) {
  const provider = new ethers.JsonRpcProvider(process.env[`${chain.toUpperCase()}_RPC`]);
  const wallet = new ethers.Wallet(privKey, provider);
  const contract = new ethers.Contract(process.env.GNOSIS_FACTORY_ADDRESS, abi, wallet);
  const tx = await contract.createProxyWithNonce(singleton, initializer, salt);
  return await tx.wait();
}