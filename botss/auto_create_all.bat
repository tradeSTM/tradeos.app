@echo off
REM Trade OS Windows Repo Creator - run this once in your project root

REM Create folders
mkdir backend\lib
mkdir backend\abis
mkdir backend\models
mkdir backend\routes
mkdir backend\jobs
mkdir contracts
mkdir frontend\public
mkdir frontend\src\components
mkdir frontend\src\styles
mkdir installer

REM Create backend\package.json
echo { > backend\package.json
echo   "name": "trade-os-backend", >> backend\package.json
echo   "version": "1.0.0", >> backend\package.json
echo   "description": "Backend for Trade OS", >> backend\package.json
echo   "main": "server.js", >> backend\package.json
echo   "scripts": { "start": "node server.js" }, >> backend\package.json
echo   "dependencies": { >> backend\package.json
echo     "cors": "^2.8.5", >> backend\package.json
echo     "dotenv": "^16.0.3", >> backend\package.json
echo     "ethers": "^6.0.0", >> backend\package.json
echo     "express": "^4.18.2", >> backend\package.json
echo     "mongoose": "^7.0.4", >> backend\package.json
echo     "body-parser": "^1.20.2", >> backend\package.json
echo     "crypto": "^1.0.1", >> backend\package.json
echo     "node-cron": "^3.0.2", >> backend\package.json
echo     "bcrypt": "^5.1.0", >> backend\package.json
echo     "jsonwebtoken": "^9.0.0", >> backend\package.json
echo     "axios": "^1.6.2", >> backend\package.json
echo     "pm2": "^5.3.0" >> backend\package.json
echo   } >> backend\package.json
echo } >> backend\package.json

REM Repeat for each file you want (you can use echo, or powershell Out-File -Encoding ascii)

REM For big files (like server.js, App.jsx, etc), do this:
REM 1. Open Notepad, paste the code block content as provided by Copilot.
REM 2. Save directly to the correct path (e.g., backend\server.js, frontend\src\App.jsx, etc).
REM 3. Repeat for all code blocks you received from Copilot.

REM Copy install.sh and README.md from Copilot code blocks and save in repo root.

echo All folders and starter files created. Now copy code block content from Copilot into each file as indicated.
echo When done, run 'bash install.sh' on Linux server or VPS.
pause