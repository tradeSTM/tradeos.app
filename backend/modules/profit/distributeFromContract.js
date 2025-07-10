const { ethers } = require("ethers");
const abi = require("../abis/ProfitSplitterBot.json");

const FEE_WALLET = "0xFcdfFb8465B0ed943107EfEfCE0a90930ADD7F9b";
const RESERVE_WALLET = "0x7B861609F4f5977997A6478B09d81A7256d6c748";

// Calls the splitProfit() method on deployed ProfitSplitterBot contract
async function distributeProfits(rpc, contractAddress, privateKey) {
  const provider = new ethers.JsonRpcProvider(rpc);
  const wallet = new ethers.Wallet(privateKey, provider);
  const contract = new ethers.Contract(contractAddress, abi, wallet);

  const tx = await contract.splitProfit({ value: await wallet.getBalance() }); // use wallet balance for distribution
  const receipt = await tx.wait();

  return {
    txHash: receipt.transactionHash,
    status: receipt.status,
    feeWallet: FEE_WALLET,
    reserveWallet: RESERVE_WALLET
  };
}

module.exports = { distributeProfits };
