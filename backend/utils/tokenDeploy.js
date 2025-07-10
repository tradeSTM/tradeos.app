import { ethers } from "ethers";
import abi from "../../contracts/abis/ERC20Deployer.json" assert { type: "json" };

export async function deployToken(name, symbol, supply) {
  const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC);
  const wallet = new ethers.Wallet(process.env.DEPLOYER_KEY, provider);
  const contractFactory = new ethers.ContractFactory(abi, abi.bytecode, wallet);
  const contract = await contractFactory.deploy(name, symbol, supply);
  return await contract.waitForDeployment();
}