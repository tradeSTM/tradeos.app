#!/usr/bin/env ts-node
import { ethers } from 'ethers';
import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

async function setupLocalTestnet() {
  console.log('Setting up local testnet...');

  // Start local hardhat node
  const hardhat = exec('npx hardhat node');
  
  // Wait for node to start
  await new Promise(resolve => setTimeout(resolve, 5000));

  const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
  const accounts = await provider.listAccounts();

  console.log('Local accounts:', accounts);

  // Deploy contracts to local testnet
  try {
    await execAsync('npx ts-node scripts/deployAll.ts deploy localhost');
    console.log('Contracts deployed successfully to local testnet');

    // Setup test data
    const wallet = new ethers.Wallet(
      '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
      provider
    );

    // Create test tokens
    const TestTokenFactory = await ethers.getContractFactory('TestToken', wallet);
    const testToken = await TestTokenFactory.deploy('Test Token', 'TEST');
    await testToken.deployed();
    console.log('Test token deployed to:', testToken.address);

    // Create test pairs
    console.log('Setting up test trading pairs...');

    // Mint test tokens
    await testToken.mint(wallet.address, ethers.utils.parseEther('1000000'));

    console.log('Local testnet setup complete!');
    console.log('RPC URL: http://localhost:8545');
    console.log('Chain ID: 31337');
    
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

setupLocalTestnet().catch(console.error);
