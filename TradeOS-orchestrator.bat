@echo off
title 🚀 TradeOS Orchestrator

echo 🔎 1) Verifying core…
powershell -ExecutionPolicy Bypass -File "%~dp0\init-core.ps1"

echo 🔁 2) Merge branches…
npx ts-node "%~dp0\mergeTradeOSBranches.ts"

echo 🎨 3) Generate widgets & auraMap…
npx ts-node "%~dp0\create-widget-relay.ts" --walletConnect --init-swap --bridge --fxGlow --sovereignBadge
npx ts-node "%~dp0\scripts\auraMap.ts"

echo 🛡️ 4) Commit & push UI changes…
powershell -Command ^
  "cd '%~dp0'; ^
   git add frontend/components/**/*.tsx frontend/utils/auraMap.ts pages/index.tsx; ^
   git commit -m '🔮 UI & quest scaffolding'; ^
   git push origin main"

echo 💻 5) Start dev server…
start cmd /k "npm run dev"

pause
