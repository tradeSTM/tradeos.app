#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');

// Start local hardhat node
console.log('Starting Hardhat node...');
const hardhat = spawn('npx', ['hardhat', 'node'], {
  cwd: path.join(__dirname, '../contracts'),
  stdio: 'inherit'
});

// Wait for Hardhat to start
setTimeout(() => {
  // Deploy contracts
  console.log('Deploying contracts...');
  const deploy = spawn('npx', ['hardhat', 'run', 'scripts/deployAll.ts', '--network', 'localhost'], {
    cwd: path.join(__dirname, '../contracts'),
    stdio: 'inherit'
  });

  deploy.on('close', (code) => {
    if (code !== 0) {
      console.error('Contract deployment failed');
      process.exit(1);
    }

    // Start development server
    console.log('Starting development server...');
    const nextDev = spawn('npm', ['run', 'dev:hot'], {
      stdio: 'inherit'
    });

    // Handle cleanup
    const cleanup = () => {
      hardhat.kill();
      nextDev.kill();
      process.exit();
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
  });
}, 5000);
