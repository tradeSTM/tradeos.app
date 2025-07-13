$basePath = "C:\Users\admin\OneDrive\Documents\GitHub\TradeOS"
$required = @(
  "backend/api/auth.js",
  "contracts/AdminControl.sol",
  "contracts/ProfitSplitter.sol",
  "contracts/FlashLoanExecutor.sol",
  "frontend/pages/DashboardMain.jsx",
  "frontend/components/widgets/WalletScore.jsx",
  "frontend/components/widgets/JupiterWidget.jsx",
  "frontend/components/widgets/KaminoWidget.jsx",
  "frontend/components/widgets/RelayBridge.jsx",
  "frontend/components/widgets/jackpotStake.tsx",
  "utils/airdropFeeds.ts",
  "utils/signalFeeds.ts",
  "utils/whitelist-admins.json",
  "utils/neonColors.ts",
  "frontend/theme/dark.css"
)

Write-Host "`n🔎 Validating TradeOS File Tree..."

foreach ($relPath in $required) {
  $fullPath = Join-Path $basePath $relPath
  if (Test-Path $fullPath) {
    Write-Host "✅ Found:" $relPath
  } else {
    Write-Host "❌ Missing:" $relPath
    # Optional: auto-sync missing files
    # TODO: Insert restoration logic if desired
  }
}
