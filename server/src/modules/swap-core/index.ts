import axios from 'axios';
import { ZERO_X_API_URLS, JUPITER_API_URL } from '../../config/constants.js';
import { chainRegistry } from '../chain-registry/index.js';
import { tokenRegistry, TokenInfo } from '../token-registry/index.js';
import { feeEngine, FeeCalculation } from '../fee-engine/index.js';

export interface QuoteRequest {
  chainId: string;
  sellToken: string;
  buyToken: string;
  sellAmount: string;
  slippageBps?: number;
  userAddress?: string;
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

export interface SwapTransaction {
  to: string;
  data: string;
  value: string;
  gasLimit?: string;
  chainId: number;
}

export class SwapCore {
  async getQuote(request: QuoteRequest): Promise<QuoteResponse> {
    const chain = chainRegistry.getChain(request.chainId);
    if (!chain) {
      throw new Error(`Unsupported chain: ${request.chainId}`);
    }

    const sellToken = tokenRegistry.getToken(request.chainId, request.sellToken);
    const buyToken = tokenRegistry.getToken(request.chainId, request.buyToken);

    if (!sellToken || !buyToken) {
      throw new Error('Token not found');
    }

    const feeCalc = feeEngine.calculateFee(
      request.sellAmount,
      sellToken.decimals,
      chain.type
    );

    switch (chain.type) {
      case 'evm':
        return this.getEVMQuote(request, chain, sellToken, buyToken, feeCalc);
      case 'solana':
        return this.getSolanaQuote(request, chain, sellToken, buyToken, feeCalc);
      case 'sui':
        return this.getSuiQuote(request, chain, sellToken, buyToken, feeCalc);
      default:
        throw new Error(`Unsupported chain type: ${chain.type}`);
    }
  }

  private async getEVMQuote(
    request: QuoteRequest,
    chain: any,
    sellToken: TokenInfo,
    buyToken: TokenInfo,
    feeCalc: FeeCalculation
  ): Promise<QuoteResponse> {
    const chainId = chain.chainId as number;
    const apiUrl = ZERO_X_API_URLS[chainId];

    if (!apiUrl) {
      return this.getMockEVMQuote(request, chain, sellToken, buyToken, feeCalc);
    }

    try {
      const sellAddress = sellToken.isNative ? 
        '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' : 
        request.sellToken;
      const buyAddress = buyToken.isNative ? 
        '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' : 
        request.buyToken;

      const response = await axios.get(`${apiUrl}/swap/v1/quote`, {
        params: {
          sellToken: sellAddress,
          buyToken: buyAddress,
          sellAmount: feeCalc.netAmount,
          slippagePercentage: (request.slippageBps || 50) / 10000,
          takerAddress: request.userAddress
        },
        headers: {
          '0x-api-key': process.env.ZERO_X_API_KEY || ''
        }
      });

      const quote = response.data;

      return {
        chainId: request.chainId,
        sellToken,
        buyToken,
        sellAmount: request.sellAmount,
        buyAmount: quote.buyAmount,
        price: quote.price,
        priceImpact: quote.estimatedPriceImpact || '0',
        fee: feeCalc,
        estimatedGas: quote.estimatedGas,
        route: quote.sources?.map((s: any) => s.name).join(' -> ') || 'Direct',
        sources: quote.sources?.map((s: any) => s.name) || [],
        allowanceTarget: quote.allowanceTarget,
        to: quote.to,
        data: quote.data,
        value: quote.value
      };
    } catch (error) {
      console.error('0x API error:', error);
      return this.getMockEVMQuote(request, chain, sellToken, buyToken, feeCalc);
    }
  }

  private getMockEVMQuote(
    request: QuoteRequest,
    chain: any,
    sellToken: TokenInfo,
    buyToken: TokenInfo,
    feeCalc: FeeCalculation
  ): QuoteResponse {
    const sellDecimals = sellToken.decimals;
    const buyDecimals = buyToken.decimals;
    
    const mockRate = this.getMockRate(sellToken.symbol, buyToken.symbol);
    const sellAmountNum = Number(feeCalc.netAmount) / Math.pow(10, sellDecimals);
    const buyAmountNum = sellAmountNum * mockRate;
    const buyAmount = BigInt(Math.floor(buyAmountNum * Math.pow(10, buyDecimals))).toString();

    return {
      chainId: request.chainId,
      sellToken,
      buyToken,
      sellAmount: request.sellAmount,
      buyAmount,
      price: mockRate.toString(),
      priceImpact: '0.1',
      fee: feeCalc,
      estimatedGas: '150000',
      route: 'Uniswap V3',
      sources: ['Uniswap V3']
    };
  }

  private async getSolanaQuote(
    request: QuoteRequest,
    chain: any,
    sellToken: TokenInfo,
    buyToken: TokenInfo,
    feeCalc: FeeCalculation
  ): Promise<QuoteResponse> {
    try {
      const response = await axios.get(`${JUPITER_API_URL}/quote`, {
        params: {
          inputMint: request.sellToken,
          outputMint: request.buyToken,
          amount: feeCalc.netAmount,
          slippageBps: request.slippageBps || 50
        }
      });

      const quote = response.data;

      return {
        chainId: request.chainId,
        sellToken,
        buyToken,
        sellAmount: request.sellAmount,
        buyAmount: quote.outAmount,
        price: (Number(quote.outAmount) / Number(feeCalc.netAmount)).toString(),
        priceImpact: quote.priceImpactPct || '0',
        fee: feeCalc,
        route: quote.routePlan?.map((r: any) => r.swapInfo?.label).join(' -> ') || 'Jupiter',
        sources: ['Jupiter']
      };
    } catch (error) {
      console.error('Jupiter API error:', error);
      return this.getMockSolanaQuote(request, chain, sellToken, buyToken, feeCalc);
    }
  }

  private getMockSolanaQuote(
    request: QuoteRequest,
    chain: any,
    sellToken: TokenInfo,
    buyToken: TokenInfo,
    feeCalc: FeeCalculation
  ): QuoteResponse {
    const mockRate = this.getMockRate(sellToken.symbol, buyToken.symbol);
    const sellAmountNum = Number(feeCalc.netAmount) / Math.pow(10, sellToken.decimals);
    const buyAmountNum = sellAmountNum * mockRate;
    const buyAmount = BigInt(Math.floor(buyAmountNum * Math.pow(10, buyToken.decimals))).toString();

    return {
      chainId: request.chainId,
      sellToken,
      buyToken,
      sellAmount: request.sellAmount,
      buyAmount,
      price: mockRate.toString(),
      priceImpact: '0.05',
      fee: feeCalc,
      route: 'Jupiter',
      sources: ['Jupiter']
    };
  }

  private async getSuiQuote(
    request: QuoteRequest,
    chain: any,
    sellToken: TokenInfo,
    buyToken: TokenInfo,
    feeCalc: FeeCalculation
  ): Promise<QuoteResponse> {
    const mockRate = this.getMockRate(sellToken.symbol, buyToken.symbol);
    const sellAmountNum = Number(feeCalc.netAmount) / Math.pow(10, sellToken.decimals);
    const buyAmountNum = sellAmountNum * mockRate;
    const buyAmount = BigInt(Math.floor(buyAmountNum * Math.pow(10, buyToken.decimals))).toString();

    return {
      chainId: request.chainId,
      sellToken,
      buyToken,
      sellAmount: request.sellAmount,
      buyAmount,
      price: mockRate.toString(),
      priceImpact: '0.1',
      fee: feeCalc,
      route: 'Cetus (Coming Soon)',
      sources: ['Cetus'],
      error: 'Sui swaps coming soon'
    };
  }

  private getMockRate(fromSymbol: string, toSymbol: string): number {
    const prices: Record<string, number> = {
      'ETH': 3500,
      'WETH': 3500,
      'SOL': 180,
      'SUI': 3.5,
      'USDC': 1,
      'USDT': 1,
      'DAI': 1,
      'WBTC': 95000,
      'ARB': 1.2,
      'OP': 2.5,
      'JUP': 1.1
    };

    const fromPrice = prices[fromSymbol] || 1;
    const toPrice = prices[toSymbol] || 1;
    return fromPrice / toPrice;
  }

  async validateToken(chainId: string, address: string): Promise<TokenInfo | null> {
    const chain = chainRegistry.getChain(chainId);
    if (!chain) return null;

    const existingToken = tokenRegistry.getToken(chainId, address);
    if (existingToken) return existingToken;

    if (chain.type === 'evm') {
      return this.validateEVMToken(chainId, address, chain);
    }

    return null;
  }

  private async validateEVMToken(
    chainId: string,
    address: string,
    chain: any
  ): Promise<TokenInfo | null> {
    try {
      const response = await axios.post(chain.rpcUrl, {
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_call',
        params: [
          {
            to: address,
            data: '0x95d89b41'
          },
          'latest'
        ]
      });

      if (response.data.result && response.data.result !== '0x') {
        const symbolHex = response.data.result;
        let symbol = '';
        try {
          const hexStr = symbolHex.slice(2);
          if (hexStr.length >= 128) {
            const offset = parseInt(hexStr.slice(0, 64), 16) * 2;
            const length = parseInt(hexStr.slice(64, 128), 16);
            const symbolBytes = hexStr.slice(128, 128 + length * 2);
            symbol = Buffer.from(symbolBytes, 'hex').toString('utf8');
          } else {
            symbol = Buffer.from(hexStr, 'hex').toString('utf8').replace(/\0/g, '');
          }
        } catch {
          symbol = 'UNKNOWN';
        }

        const nameResponse = await axios.post(chain.rpcUrl, {
          jsonrpc: '2.0',
          id: 2,
          method: 'eth_call',
          params: [
            {
              to: address,
              data: '0x06fdde03'
            },
            'latest'
          ]
        });

        let name = symbol;
        if (nameResponse.data.result && nameResponse.data.result !== '0x') {
          try {
            const hexStr = nameResponse.data.result.slice(2);
            if (hexStr.length >= 128) {
              const length = parseInt(hexStr.slice(64, 128), 16);
              const nameBytes = hexStr.slice(128, 128 + length * 2);
              name = Buffer.from(nameBytes, 'hex').toString('utf8');
            }
          } catch {}
        }

        const decimalsResponse = await axios.post(chain.rpcUrl, {
          jsonrpc: '2.0',
          id: 3,
          method: 'eth_call',
          params: [
            {
              to: address,
              data: '0x313ce567'
            },
            'latest'
          ]
        });

        let decimals = 18;
        if (decimalsResponse.data.result) {
          decimals = parseInt(decimalsResponse.data.result, 16);
        }

        return {
          address,
          symbol: symbol.trim(),
          name: name.trim(),
          decimals,
          chainId,
          logoUrl: '',
          isUserAdded: true
        };
      }

      return null;
    } catch (error) {
      console.error('Token validation error:', error);
      return null;
    }
  }
}

export const swapCore = new SwapCore();
