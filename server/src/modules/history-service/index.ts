export interface SwapRecord {
  id: string;
  walletAddress: string;
  chainId: string;
  timestamp: number;
  fromToken: {
    address: string;
    symbol: string;
    amount: string;
    amountFormatted: string;
  };
  toToken: {
    address: string;
    symbol: string;
    amount: string;
    amountFormatted: string;
  };
  feeAmount: string;
  feeFormatted: string;
  txHash?: string;
  status: 'pending' | 'success' | 'failed';
}

export interface SwapStats {
  totalSwaps: number;
  totalVolume: Record<string, string>;
  totalFees: Record<string, string>;
  byChain: Record<string, {
    swaps: number;
    volume: string;
    fees: string;
  }>;
}

class HistoryService {
  private swaps: Map<string, SwapRecord[]> = new Map();
  private globalStats: SwapStats = {
    totalSwaps: 0,
    totalVolume: {},
    totalFees: {},
    byChain: {}
  };

  addSwap(record: Omit<SwapRecord, 'id'>): SwapRecord {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fullRecord: SwapRecord = { ...record, id };
    
    const walletSwaps = this.swaps.get(record.walletAddress) || [];
    walletSwaps.unshift(fullRecord);
    this.swaps.set(record.walletAddress, walletSwaps);

    this.updateStats(fullRecord);
    
    return fullRecord;
  }

  updateSwapStatus(walletAddress: string, id: string, status: SwapRecord['status'], txHash?: string): void {
    const walletSwaps = this.swaps.get(walletAddress);
    if (walletSwaps) {
      const swap = walletSwaps.find(s => s.id === id);
      if (swap) {
        swap.status = status;
        if (txHash) swap.txHash = txHash;
      }
    }
  }

  getSwapsForWallet(walletAddress: string, limit = 50, offset = 0): SwapRecord[] {
    const walletSwaps = this.swaps.get(walletAddress) || [];
    return walletSwaps.slice(offset, offset + limit);
  }

  getWalletStats(walletAddress: string): {
    totalSwaps: number;
    byChain: Record<string, number>;
  } {
    const walletSwaps = this.swaps.get(walletAddress) || [];
    const byChain: Record<string, number> = {};
    
    walletSwaps.forEach(swap => {
      byChain[swap.chainId] = (byChain[swap.chainId] || 0) + 1;
    });

    return {
      totalSwaps: walletSwaps.length,
      byChain
    };
  }

  getGlobalStats(): SwapStats {
    return this.globalStats;
  }

  private updateStats(record: SwapRecord): void {
    this.globalStats.totalSwaps++;
    
    if (!this.globalStats.byChain[record.chainId]) {
      this.globalStats.byChain[record.chainId] = {
        swaps: 0,
        volume: '0',
        fees: '0'
      };
    }
    
    const chainStats = this.globalStats.byChain[record.chainId];
    chainStats.swaps++;
    chainStats.volume = (BigInt(chainStats.volume) + BigInt(record.fromToken.amount)).toString();
    chainStats.fees = (BigInt(chainStats.fees) + BigInt(record.feeAmount)).toString();
  }

  exportForPersistence(): string {
    const data = {
      swaps: Object.fromEntries(this.swaps),
      stats: this.globalStats
    };
    return JSON.stringify(data);
  }

  importFromPersistence(json: string): void {
    try {
      const data = JSON.parse(json);
      this.swaps = new Map(Object.entries(data.swaps));
      this.globalStats = data.stats;
    } catch (error) {
      console.error('Failed to import history:', error);
    }
  }
}

export const historyService = new HistoryService();
