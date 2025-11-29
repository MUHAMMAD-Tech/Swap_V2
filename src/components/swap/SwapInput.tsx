import { TokenInfo } from '../../types';
import './SwapInput.css';

interface SwapInputProps {
  label: string;
  token: TokenInfo | null;
  amount: string;
  onAmountChange?: (value: string) => void;
  onTokenClick: () => void;
  readOnly?: boolean;
  loading?: boolean;
}

export function SwapInput({
  label,
  token,
  amount,
  onAmountChange,
  onTokenClick,
  readOnly = false,
  loading = false,
}: SwapInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      onAmountChange?.(value);
    }
  };

  return (
    <div className={`swap-input ${readOnly ? 'readonly' : ''}`}>
      <div className="swap-input-header">
        <span className="swap-input-label">{label}</span>
      </div>
      
      <div className="swap-input-content">
        <input
          type="text"
          inputMode="decimal"
          placeholder="0"
          value={loading ? '' : amount}
          onChange={handleChange}
          readOnly={readOnly}
          className="swap-amount-input"
        />
        
        {loading && (
          <div className="swap-input-loading">
            <div className="loading-pulse" />
          </div>
        )}

        <button className="token-select-btn" onClick={onTokenClick}>
          {token ? (
            <>
              <img 
                src={token.logoUrl} 
                alt={token.symbol}
                className="token-select-logo"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/24';
                }}
              />
              <span>{token.symbol}</span>
            </>
          ) : (
            <span>Select token</span>
          )}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
