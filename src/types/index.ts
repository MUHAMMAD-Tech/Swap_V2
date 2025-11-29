export interface ChainConfig {
  id: string;
  chainId: number | string;
  name: string;
  symbol: string;
  decimals: number;
  rpcUrl: string;
  explorerUrl: string;
  logoUrl: string;
  type: 'evm' | 'solana' | 'sui';
  isTestnet: boolean;
  nativeToken: TokenInfo;
}

export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  chainId?: string;
  logoUrl: string;
  isNative?: boolean;
  isUserAdded?: boolean;
}

export interface FeeCalculation {
  inputAmount: string;
  feeAmount: string;
  feePercent: number;
  netAmount: string;
  feeWallet: string;
  chainType: 'evm' | 'solana' | 'sui';
}

export interface QuoteResponse {
  chainId: string;
  sellToken: TokenInfo;
  buyToken: TokenInfo;
  sellAmount: string;
  buyAmount: string;
  price: string;
  priceImpact: string;
  fee: FeeCalculation;
  estimatedGas?: string;
  route?: string;
  sources?: string[];
  allowanceTarget?: string;
  to?: string;
  data?: string;
  value?: string;
  error?: string;
}

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

export interface SwapState {
  selectedChain: ChainConfig | null;
  sellToken: TokenInfo | null;
  buyToken: TokenInfo | null;
  sellAmount: string;
  quote: QuoteResponse | null;
  isLoadingQuote: boolean;
  slippage: number;
  txStatus: 'idle' | 'pending' | 'confirming' | 'success' | 'failed';
  txHash: string | null;
  error: string | null;
}

export type SwapView = 'swap' | 'dashboard';
