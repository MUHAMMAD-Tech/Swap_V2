import { FEE_PERCENT, FEE_WALLETS } from '../../config/constants.js';

export interface FeeCalculation {
  inputAmount: string;
  feeAmount: string;
  feePercent: number;
  netAmount: string;
  feeWallet: string;
  chainType: 'evm' | 'solana' | 'sui';
}

export class FeeEngine {
  private readonly feePercent = FEE_PERCENT;
  private readonly feeWallets = FEE_WALLETS;

  getFeePercent(): number {
    return this.feePercent;
  }

  getFeeWallet(chainType: 'evm' | 'solana' | 'sui'): string {
    switch (chainType) {
      case 'solana':
        return this.feeWallets.solana;
      case 'sui':
        return this.feeWallets.sui;
      case 'evm':
      default:
        return this.feeWallets.evmDefault;
    }
  }

  calculateFee(inputAmount: string, decimals: number, chainType: 'evm' | 'solana' | 'sui'): FeeCalculation {
    const inputBigInt = BigInt(inputAmount);
    const feeNumerator = BigInt(Math.floor(this.feePercent * 1000000));
    const feeDenominator = BigInt(1000000);
    
    const feeAmount = (inputBigInt * feeNumerator) / feeDenominator;
    const netAmount = inputBigInt - feeAmount;

    return {
      inputAmount,
      feeAmount: feeAmount.toString(),
      feePercent: this.feePercent,
      netAmount: netAmount.toString(),
      feeWallet: this.getFeeWallet(chainType),
      chainType
    };
  }

  formatFeeDisplay(feeAmount: string, decimals: number, symbol: string): string {
    const feeValue = Number(feeAmount) / Math.pow(10, decimals);
    return `${feeValue.toFixed(6)} ${symbol}`;
  }

  getConfig() {
    return {
      feePercent: this.feePercent,
      feePercentDisplay: `${(this.feePercent * 100).toFixed(2)}%`,
      feeWallets: this.feeWallets
    };
  }
}

export const feeEngine = new FeeEngine();
