#!/usr/bin/env ts-node
import { ethers } from 'ethers';
import { networkConfigs } from './config/networks';
import * as dotenv from 'dotenv';
import { Command } from 'commander';

dotenv.config();

const program = new Command();

async function deployContracts(network: string, isDryRun: boolean = false) {
  console.log(`Deploying to ${network}...`);
  
  const networkConfig = networkConfigs[network];
  if (!networkConfig) {
    throw new Error(`Network ${network} not supported`);
  }

  const provider = new ethers.providers.JsonRpcProvider(networkConfig.rpc);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
  
  console.log(`Deploying from address: ${wallet.address}`);
  console.log(`Network: ${networkConfig.name} (${networkConfig.chainId})`);

  if (!isDryRun) {
    // Deploy access control
    const AccessFactory = await ethers.getContractFactory('TradeOSAccess', wallet);
    const access = await AccessFactory.deploy();
    await access.deployed();
    console.log('TradeOSAccess deployed to:', access.address);

    // Deploy badges
    const BadgesFactory = await ethers.getContractFactory('TradeOSBadges', wallet);
    const badges = await BadgesFactory.deploy(access.address);
    await badges.deployed();
    console.log('TradeOSBadges deployed to:', badges.address);

    // Deploy governance
    const GovernanceFactory = await ethers.getContractFactory('TradeOSGovernance', wallet);
    const governance = await GovernanceFactory.deploy(access.address);
    await governance.deployed();
    console.log('TradeOSGovernance deployed to:', governance.address);

    // Deploy launchpad
    const LaunchpadFactory = await ethers.getContractFactory('LaunchpadFactory', wallet);
    const launchpad = await LaunchpadFactory.deploy();
    await launchpad.deployed();
    console.log('LaunchpadFactory deployed to:', launchpad.address);

    // Deploy flash loan executor
    const FlashLoanFactory = await ethers.getContractFactory('FlashLoanExecutor', wallet);
    const flashLoan = await FlashLoanFactory.deploy();
    await flashLoan.deployed();
    console.log('FlashLoanExecutor deployed to:', flashLoan.address);

    // Save deployment info
    const deploymentInfo = {
      network: networkConfig.name,
      chainId: networkConfig.chainId,
      timestamp: new Date().toISOString(),
      contracts: {
        access: access.address,
        badges: badges.address,
        governance: governance.address,
        launchpad: launchpad.address,
        flashLoan: flashLoan.address
      }
    };

    // Save to file
    const fs = require('fs');
    const deploymentPath = `./deployments/${network}.json`;
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`Deployment info saved to ${deploymentPath}`);
  }
}

program
  .version('1.0.0')
  .description('TradeOS Deployment CLI');

program
  .command('deploy <network>')
  .option('-d, --dry-run', 'Perform a dry run without actual deployment')
  .description('Deploy contracts to specified network')
  .action(async (network: string, options) => {
    try {
      await deployContracts(network, options.dryRun);
    } catch (error) {
      console.error('Deployment failed:', error);
      process.exit(1);
    }
  });

program
  .command('verify <network> <contract>')
  .description('Verify contract on specified network')
  .action(async (network: string, contract: string) => {
    // Add verification logic
  });

program.parse(process.argv);
