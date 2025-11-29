import { QuoteResponse } from '../../types';
import { formatAmount } from '../../utils/format';
import './FeeBreakdown.css';

interface FeeBreakdownProps {
  quote: QuoteResponse;
}

export function FeeBreakdown({ quote }: FeeBreakdownProps) {
  const sellDecimals = quote.sellToken.decimals;
  const buyDecimals = quote.buyToken.decimals;

  const sellAmountFormatted = formatAmount(quote.sellAmount, sellDecimals);
  const feeAmountFormatted = formatAmount(quote.fee.feeAmount, sellDecimals);
  const netAmountFormatted = formatAmount(quote.fee.netAmount, sellDecimals);
  const buyAmountFormatted = formatAmount(quote.buyAmount, buyDecimals);

  return (
    <div className="fee-breakdown">
      <div className="fee-row">
        <span className="fee-label">You pay</span>
        <span className="fee-value">{sellAmountFormatted} {quote.sellToken.symbol}</span>
      </div>
      
      <div className="fee-row fee-highlight">
        <span className="fee-label">
          Fee ({(quote.fee.feePercent * 100).toFixed(2)}%)
        </span>
        <span className="fee-value fee-amount">-{feeAmountFormatted} {quote.sellToken.symbol}</span>
      </div>
      
      <div className="fee-row">
        <span className="fee-label">Amount swapped</span>
        <span className="fee-value">{netAmountFormatted} {quote.sellToken.symbol}</span>
      </div>
      
      <div className="fee-divider" />
      
      <div className="fee-row fee-total">
        <span className="fee-label">You receive</span>
        <span className="fee-value">{buyAmountFormatted} {quote.buyToken.symbol}</span>
      </div>

      {quote.route && (
        <div className="fee-row">
          <span className="fee-label">Route</span>
          <span className="fee-value route">{quote.route}</span>
        </div>
      )}

      {quote.priceImpact && Number(quote.priceImpact) > 0 && (
        <div className="fee-row">
          <span className="fee-label">Price Impact</span>
          <span className={`fee-value ${Number(quote.priceImpact) > 1 ? 'warning' : ''}`}>
            {Number(quote.priceImpact).toFixed(2)}%
          </span>
        </div>
      )}

      {quote.estimatedGas && (
        <div className="fee-row">
          <span className="fee-label">Estimated Gas</span>
          <span className="fee-value">{Number(quote.estimatedGas).toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}
