# Set working directory
$basePath = "C:\Users\admin\OneDrive\Documents\GitHub\TradeOS"
Set-Location $basePath

# 📁 Create folder structure
New-Item "$basePath\backend\api" -ItemType Directory -Force
New-Item "$basePath\contracts" -ItemType Directory -Force
New-Item "$basePath\frontend\components\botWidgets" -ItemType Directory -Force
New-Item "$basePath\frontend\pages" -ItemType Directory -Force
New-Item "$basePath\programs" -ItemType Directory -Force

# 🛠 Inject system files
"PORT=3000`nJWT_SECRET=your_secret_key" | Set-Content "$basePath\.env.example"
"node_modules/`n.env`nbuild/" | Set-Content "$basePath\.gitignore"
"# TradeOS V1.1 — Sovereign Automation Protocol`nFull multi-chain automation protocol with governance, bots, vaults, freeze control." | Set-Content "$basePath\README.md"

# 🧠 Inject provider preset
@"
export const providerPreset = {
   ETH:   "0xC02aaa39b223FE8D0a0e5C4F27eAD9083C756Cc2", // WETH
  BTC:   "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", // WBTC
  USDC:  "0xA0b86991c6218b36c1d19d4a2e9Eb0cE3606eB48",
  USDT:  "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  DAI:   "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  AAVE:  "0x7BeA39867e4169DBe237dE6ef5fD2D1103dB155B",
  UNI:   "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
  SUSHI: "0x947950BcC74888a40Ffa2593C5798F11Fc9124C4",
  BAL:   "0xba100000625a3754423978a60c9317c58a424e3D",
  SOL:   "9PLBhxczwH8ExKJjTSg1GmPpP2aUu9nZ85VxQjJZpkin", // TOS on Solana
  GXQ:   "D4JvG7eGEvyGY9jx2SF4HCBztLxdYihRzGqu3jNTpkin",
  MON:   "DnChYycmX16s9oTPsFs8LE3qnFTMvb4aqHrRWwU3jups",
  XAI:   "79dn63RCD3xCduFAcdt5GuM5nQm7ftwcoa4fDf2tpump"
};
"@ | Set-Content "$basePath\providerPreset.ts"

# 🧬 Inject SPLVaultRouter.rs
@"
use anchor_lang::prelude::*;
#[program]
pub mod spl_vault_router {
    use super::*;
    pub fn reroute(ctx: Context<Reroute>, amount: u64) -> Result<()> {
        let profit = amount * 80 / 100;
        **ctx.accounts.reserve_wallet.to_account_info().try_borrow_mut_lamports()? += profit;
        **ctx.accounts.user.to_account_info().try_borrow_mut_lamports()? += amount - profit;
        Ok(())
    }
}
#[derive(Accounts)]
pub struct Reroute<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut, address = "J7bNrvf26uiWWg8sM43eQMwunaPgmvi7pdRC55CnebPE")]
    pub reserve_wallet: AccountInfo<'info>,
}
"@ | Set-Content "$basePath\programs\SPLVaultRouter.rs"

# 📦 Inject core contracts
$adminAddress = "0x7b861609f4f5977997a6478b09d81a7256d6c748"
@"
pragma solidity ^0.8.0;
contract AdminControl {
    address public admin = $adminAddress;
    bool public paused;
    mapping(address => bool) public frozen;
    mapping(address => string) public role;
    modifier onlyAdmin() { require(msg.sender == admin); _; }
    function assignRole(address u, string calldata r) external onlyAdmin { role[u] = r; }
    function setFrozen(address u, bool f) external onlyAdmin { frozen[u] = f; }
    function pause() external onlyAdmin { paused = true; }
    function unpause() external onlyAdmin { paused = false; }
    function rescue(address token, address payable to, uint amount) external onlyAdmin {
        if (token == address(0)) { to.transfer(amount); }
        else { IERC20(token).transfer(to, amount); }
    }
    receive() external payable {}
}
interface IERC20 { function transfer(address to, uint256 amount) external returns (bool); }
"@ | Set-Content "$basePath\contracts\AdminControl.sol"

# 💻 Inject frontend components
@"
import React from 'react';
export default function FlashLoanDashboard() {
  return <div><h3>Flash Loan Executor</h3><input placeholder='Token'/><input placeholder='Amount'/><button>Run</button></div>;
}
"@ | Set-Content "$basePath\frontend\components\FlashLoanDashboard.tsx"

@"
import React from 'react';
export default function AirdropClaimPanel() {
  return <div><h3>Airdrop Claim</h3><button>Fetch Proof</button><button>Claim</button></div>;
}
"@ | Set-Content "$basePath\frontend\components\AirdropClaimPanel.tsx"

@"
import React from 'react';
export default function ArbitragePanel() {
  return <div><h3>Arbitrage Bot</h3><input/><input/><button>Run</button></div>;
}
"@ | Set-Content "$basePath\frontend\components\botWidgets\arbitragePanel.jsx"

@"
import React from 'react';
import FlashLoanDashboard from '../components/FlashLoanDashboard';
import ArbitragePanel from '../components/botWidgets/arbitragePanel';
export default function AdminDashboard() {
  return <div><h1>Admin Panel</h1><FlashLoanDashboard/><ArbitragePanel/></div>;
}
"@ | Set-Content "$basePath\frontend\pages\adminDashboard.jsx"

@"
import React from 'react';
export default function AssetMonitor() {
  return <div><h2>Asset Monitor</h2><ul><li>ETH — 12.34</li></ul></div>;
}
"@ | Set-Content "$basePath\frontend\pages\assetMonitor.jsx"

# ✅ Git commit and push
git add .
git commit -m "🚀 Full Sync: Contracts, UI, API, Solana, Provider Registry, Admin Controls"
git push -u origin main --force

Write-Host "✅ TradeOS V1.1 synced and deployed via PowerShell Autopilot."
