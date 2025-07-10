const { ethers } = require("ethers");
const IUniswapV3Router = require("../abis/UniswapV3Router.json");
const { CHAINS } = require("../lib/constants");

// Snipe function: buy token on UniswapV3 as soon as liquidity appears
async function snipe(chainName, token, amountInEth, privateKey) {
  const chain = CHAINS[chainName];
  const provider = new ethers.JsonRpcProvider(chain.rpc);
  const wallet = new ethers.Wallet(privateKey, provider);
  const router = new ethers.Contract(chain.router, IUniswapV3Router, wallet);

  // TODO: Add mempool monitoring/sniping logic
  // This should detect when liquidity hits, then fire the swap

  // Example placeholder swap (replace with dynamic logic):
  const WETH = "0xC02aaa39b223FE8D0a0e5C4F27eAD9083C756Cc2"; // Replace per chain
  const deadline = Math.floor(Date.now() / 1000) + 600;
  const path = [WETH, token];

  // Uncomment below for live swap when logic is ready:
  // const tx = await router.swapExactETHForTokens(
  //   0,
  //   path,
  //   wallet.address,
  //   deadline,
  //   { value: ethers.parseEther(amountInEth) }
  // );
  // await tx.wait();
  // return tx.hash;

  return `Snipe initialized for ${token} on ${chainName}`;
}

module.exports = { snipe };
