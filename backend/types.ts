export interface BotEvent {
    type: string;
    timestamp: number;
    data: any;
}

export interface MonitorConfig {
    chain: string;
    address: string;
    interval: number;
}

export interface FlashLoanEvent {
    protocol: string;
    amount: string;
    token: string;
    user: string;
    timestamp: number;
}

export interface NetworkStatus {
    isResponding: boolean;
    latency: number;
    blockNumber: number;
}
