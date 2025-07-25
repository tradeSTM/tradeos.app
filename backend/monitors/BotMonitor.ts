import { ethers } from 'ethers';
import { BotEvent, BotMetrics, BotStatus } from '../types';

export class BotMonitoringSystem {
    private bots: Map<string, BotStatus>;
    private provider: ethers.providers.Provider;
    private metrics: Map<string, BotMetrics>;
    
    constructor(provider: ethers.providers.Provider) {
        this.bots = new Map();
        this.metrics = new Map();
        this.provider = provider;
    }
    
    async monitorBot(botAddress: string, type: string): Promise<void> {
        const botContract = new ethers.Contract(
            botAddress,
            [
                'event Trade(address indexed token0, address indexed token1, uint256 amount)',
                'event ProfitTaken(uint256 amount)',
                'event EmergencyStop(string reason)'
            ],
            this.provider
        );
        
        // Monitor trades
        botContract.on('Trade', this.handleTrade.bind(this));
        
        // Monitor profits
        botContract.on('ProfitTaken', this.handleProfit.bind(this));
        
        // Monitor emergency stops
        botContract.on('EmergencyStop', this.handleEmergencyStop.bind(this));
        
        // Initialize bot status
        this.bots.set(botAddress, {
            status: 'active',
            lastSeen: Date.now(),
            type: type
        });
        
        // Initialize metrics
        this.metrics.set(botAddress, {
            trades: 0,
            profitsTaken: 0,
            emergencyStops: 0,
            successRate: 100
        });
        
        // Start health check interval
        setInterval(() => this.healthCheck(botAddress), 60000);
    }
    
    private async handleTrade(token0: string, token1: string, amount: ethers.BigNumber, event: ethers.Event): Promise<void> {
        const botAddress = event.address;
        const metrics = this.metrics.get(botAddress) || this.getDefaultMetrics();
        
        metrics.trades++;
        this.updateBotStatus(botAddress, 'active');
        
        // Emit monitoring event
        this.emitBotEvent({
            type: 'TRADE',
            botAddress,
            data: {
                token0,
                token1,
                amount: amount.toString(),
                txHash: event.transactionHash
            }
        });
    }
    
    private async handleProfit(amount: ethers.BigNumber, event: ethers.Event): Promise<void> {
        const botAddress = event.address;
        const metrics = this.metrics.get(botAddress) || this.getDefaultMetrics();
        
        metrics.profitsTaken++;
        this.updateBotStatus(botAddress, 'profit_taken');
        
        // Emit monitoring event
        this.emitBotEvent({
            type: 'PROFIT',
            botAddress,
            data: {
                amount: amount.toString(),
                txHash: event.transactionHash
            }
        });
    }
    
    private async handleEmergencyStop(reason: string, event: ethers.Event): Promise<void> {
        const botAddress = event.address;
        const metrics = this.metrics.get(botAddress) || this.getDefaultMetrics();
        
        metrics.emergencyStops++;
        this.updateBotStatus(botAddress, 'emergency_stopped');
        
        // Emit monitoring event
        this.emitBotEvent({
            type: 'EMERGENCY',
            botAddress,
            data: {
                reason,
                txHash: event.transactionHash
            }
        });
    }
    
    private async healthCheck(botAddress: string): Promise<void> {
        const status = this.bots.get(botAddress);
        if (!status) return;
        
        const lastSeenDiff = Date.now() - status.lastSeen;
        if (lastSeenDiff > 300000) { // 5 minutes
            this.updateBotStatus(botAddress, 'inactive');
        }
    }
    
    private updateBotStatus(botAddress: string, newStatus: string): void {
        const status = this.bots.get(botAddress);
        if (status) {
            status.status = newStatus;
            status.lastSeen = Date.now();
            this.bots.set(botAddress, status);
        }
    }
    
    private getDefaultMetrics(): BotMetrics {
        return {
            trades: 0,
            profitsTaken: 0,
            emergencyStops: 0,
            successRate: 100
        };
    }
    
    private emitBotEvent(event: BotEvent): void {
        // Implement your event emission logic here
        console.log('Bot Event:', event);
    }
    
    public getBotMetrics(botAddress: string): BotMetrics {
        return this.metrics.get(botAddress) || this.getDefaultMetrics();
    }
    
    public getBotStatus(botAddress: string): BotStatus | undefined {
        return this.bots.get(botAddress);
    }
}
