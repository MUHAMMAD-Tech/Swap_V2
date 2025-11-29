import { ChainConfig, TokenInfo, QuoteResponse, SwapRecord, FeeCalculation } from '../types';

const API_BASE = '/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  const result: ApiResponse<T> = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'API request failed');
  }

  return result.data as T;
}

export const api = {
  async getChains(): Promise<ChainConfig[]> {
    return fetchApi<ChainConfig[]>('/config/chains');
  },

  async getChain(chainId: string): Promise<ChainConfig> {
    return fetchApi<ChainConfig>(`/config/chains/${chainId}`);
  },

  async getTokens(chainId?: string): Promise<TokenInfo[] | Record<string, TokenInfo[]>> {
    const params = chainId ? `?chainId=${chainId}` : '';
    return fetchApi<TokenInfo[] | Record<string, TokenInfo[]>>(`/config/tokens${params}`);
  },

  async searchTokens(chainId: string, query: string): Promise<TokenInfo[]> {
    return fetchApi<TokenInfo[]>(`/config/tokens/search?chainId=${chainId}&query=${encodeURIComponent(query)}`);
  },

  async getFeeConfig(): Promise<{
    feePercent: number;
    feePercentDisplay: string;
    feeWallets: Record<string, string>;
  }> {
    return fetchApi('/config/fees');
  },

  async getQuote(params: {
    chainId: string;
    sellToken: string;
    buyToken: string;
    sellAmount: string;
    slippageBps?: number;
    userAddress?: string;
  }): Promise<QuoteResponse> {
    return fetchApi<QuoteResponse>('/swap/quote', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async validateToken(chainId: string, address: string): Promise<TokenInfo> {
    return fetchApi<TokenInfo>('/swap/validate-token', {
      method: 'POST',
      body: JSON.stringify({ chainId, address }),
    });
  },

  async recordSwap(params: {
    walletAddress: string;
    chainId: string;
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
  }): Promise<SwapRecord> {
    return fetchApi<SwapRecord>('/swap/record', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async updateSwapStatus(id: string, walletAddress: string, status: string, txHash?: string): Promise<void> {
    return fetchApi(`/swap/record/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ walletAddress, status, txHash }),
    });
  },

  async getSwapHistory(walletAddress: string, limit = 50, offset = 0): Promise<SwapRecord[]> {
    return fetchApi<SwapRecord[]>(`/swap/history?walletAddress=${walletAddress}&limit=${limit}&offset=${offset}`);
  },

  async getSwapStats(walletAddress?: string): Promise<any> {
    const params = walletAddress ? `?walletAddress=${walletAddress}` : '';
    return fetchApi(`/swap/stats${params}`);
  },

  async calculateFee(amount: string, decimals: number, chainType: 'evm' | 'solana' | 'sui'): Promise<FeeCalculation> {
    return fetchApi<FeeCalculation>('/swap/calculate-fee', {
      method: 'POST',
      body: JSON.stringify({ amount, decimals, chainType }),
    });
  },
};

export default api;
