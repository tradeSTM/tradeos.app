#!/bin/bash

echo "===== Trade OS Installer (Plesk/Node 24+) ====="
set -e

if ! node -v | grep -q 'v24'; then
  echo "Node.js 24.x is required. Install via Plesk or https://nodejs.org/"
  exit 1
fi

cd backend
[ -f .env ] || cp .env.example .env
npm install
cd ..
echo "===== Install Complete ====="
echo "Start backend: node backend/server.js"
echo "Set up Node.js app in Plesk: backend/server.js"

echo
echo "===== Project Directory Tree ====="
if command -v tree >/dev/null 2>&1; then
  tree -a -I 'node_modules|build|.git|dist|__pycache__'
else
  echo "Install 'tree' to see a full directory listing (sudo apt install tree)"
fi