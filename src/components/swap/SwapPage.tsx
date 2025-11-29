import { useState, useEffect, useCallback } from 'react';
import { useAppKitAccount } from '@reown/appkit/react';
import { useSwapState, useSwapActions } from '../../hooks/useStore';
import { api } from '../../services/api';
import { parseAmount } from '../../utils/format';
import { ChainSelector } from './ChainSelector';
import { SwapInput } from './SwapInput';
import { TokenSelector } from './TokenSelector';
import { FeeBreakdown } from './FeeBreakdown';
import { Button } from '../common/Button';
import './SwapPage.css';

export function SwapPage() {
  const [sellTokenModalOpen, setSellTokenModalOpen] = useState(false);
  const [buyTokenModalOpen, setBuyTokenModalOpen] = useState(false);
  const [slippageOpen, setSlippageOpen] = useState(false);

  const { address, isConnected } = useAppKitAccount();
  const state = useSwapState();
  const actions = useSwapActions();

  useEffect(() => {
    async function loadData() {
      try {
        const chainsData = await api.getChains();
        actions.setChains(chainsData);
        actions.loadUserTokens();
      } catch (error) {
        console.error('Failed to load chains:', error);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    async function loadTokens() {
      if (state.selectedChain) {
        try {
          const tokens = await api.getTokens(state.selectedChain.id) as any[];
          actions.setTokens(state.selectedChain.id, tokens);
        } catch (error) {
          console.error('Failed to load tokens:', error);
        }
      }
    }
    loadTokens();
  }, [state.selectedChain?.id]);

  const fetchQuote = useCallback(async () => {
    if (!state.selectedChain || !state.sellToken || !state.buyToken || !state.sellAmount) {
      actions.setQuote(null);
      return;
    }

    const amountNum = parseFloat(state.sellAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      actions.setQuote(null);
      return;
    }

    actions.setLoadingQuote(true);
    actions.setError(null);

    try {
      const sellAmountWei = parseAmount(state.sellAmount, state.sellToken.decimals);
      const quote = await api.getQuote({
        chainId: state.selectedChain.id,
        sellToken: state.sellToken.address,
        buyToken: state.buyToken.address,
        sellAmount: sellAmountWei,
        slippageBps: Math.floor(state.slippage * 100),
        userAddress: address,
      });
      actions.setQuote(quote);
    } catch (error) {
      console.error('Quote error:', error);
      actions.setError(error instanceof Error ? error.message : 'Failed to get quote');
      actions.setQuote(null);
    } finally {
      actions.setLoadingQuote(false);
    }
  }, [state.selectedChain, state.sellToken, state.buyToken, state.sellAmount, state.slippage, address]);

  useEffect(() => {
    const timer = setTimeout(fetchQuote, 500);
    return () => clearTimeout(timer);
  }, [fetchQuote]);

  const handleSwap = async () => {
    if (!state.quote || !isConnected || !address) return;

    actions.setTxStatus('pending');
    actions.setError(null);

    try {
      await api.recordSwap({
        walletAddress: address,
        chainId: state.selectedChain!.id,
        fromToken: {
          address: state.sellToken!.address,
          symbol: state.sellToken!.symbol,
          amount: state.sellAmount,
          amountFormatted: state.sellAmount,
        },
        toToken: {
          address: state.buyToken!.address,
          symbol: state.buyToken!.symbol,
          amount: state.quote.buyAmount,
          amountFormatted: state.quote.buyAmount,
        },
        feeAmount: state.quote.fee.feeAmount,
        feeFormatted: state.quote.fee.feeAmount,
        status: 'pending',
      });

      actions.setTxStatus('success');
      setTimeout(() => {
        actions.resetSwap();
      }, 3000);
    } catch (error) {
      console.error('Swap error:', error);
      actions.setTxStatus('failed');
      actions.setError(error instanceof Error ? error.message : 'Swap failed');
    }
  };

  const canSwap = 
    isConnected && 
    state.selectedChain && 
    state.sellToken && 
    state.buyToken && 
    state.sellAmount && 
    state.quote && 
    !state.quote.error &&
    state.txStatus === 'idle';

  return (
    <div className="swap-page">
      <div className="swap-card">
        <div className="swap-header">
          <h2>Swap</h2>
          <button 
            className="settings-btn"
            onClick={() => setSlippageOpen(!slippageOpen)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>

        {slippageOpen && (
          <div className="slippage-panel">
            <span className="slippage-label">Slippage Tolerance</span>
            <div className="slippage-options">
              {[0.1, 0.5, 1.0].map(value => (
                <button
                  key={value}
                  className={`slippage-btn ${state.slippage === value ? 'active' : ''}`}
                  onClick={() => actions.setSlippage(value)}
                >
                  {value}%
                </button>
              ))}
              <input
                type="number"
                className="slippage-input"
                placeholder="Custom"
                value={![0.1, 0.5, 1.0].includes(state.slippage) ? state.slippage : ''}
                onChange={e => actions.setSlippage(parseFloat(e.target.value) || 0.5)}
              />
            </div>
          </div>
        )}

        <div className="chain-selector-row">
          <ChainSelector />
        </div>

        {state.selectedChain && (
          <>
            <div className="swap-inputs">
              <SwapInput
                label="You pay"
                token={state.sellToken}
                amount={state.sellAmount}
                onAmountChange={actions.setSellAmount}
                onTokenClick={() => setSellTokenModalOpen(true)}
              />

              <button className="swap-toggle" onClick={actions.swapTokens}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 16V4M7 4L3 8M7 4l4 4M17 8v12M17 20l4-4M17 20l-4-4" />
                </svg>
              </button>

              <SwapInput
                label="You receive"
                token={state.buyToken}
                amount={state.quote ? (Number(state.quote.buyAmount) / Math.pow(10, state.quote.buyToken.decimals)).toFixed(6) : ''}
                onTokenClick={() => setBuyTokenModalOpen(true)}
                readOnly
                loading={state.isLoadingQuote}
              />
            </div>

            {state.quote && !state.quote.error && (
              <FeeBreakdown quote={state.quote} />
            )}

            {state.error && (
              <div className="swap-error">
                {state.error}
              </div>
            )}

            {state.quote?.error && (
              <div className="swap-warning">
                {state.quote.error}
              </div>
            )}

            {state.txStatus === 'success' && (
              <div className="swap-success">
                Swap submitted successfully!
              </div>
            )}

            <div className="swap-action">
              {!isConnected ? (
                <appkit-button />
              ) : (
                <Button
                  size="lg"
                  onClick={handleSwap}
                  disabled={!canSwap}
                  loading={state.txStatus === 'pending'}
                >
                  {state.txStatus === 'pending' ? 'Swapping...' : 
                   !state.sellToken || !state.buyToken ? 'Select tokens' :
                   !state.sellAmount ? 'Enter amount' :
                   state.quote?.error ? 'Swap unavailable' :
                   'Swap'}
                </Button>
              )}
            </div>
          </>
        )}

        {!state.selectedChain && (
          <div className="select-chain-prompt">
            <p>Select a chain to start swapping</p>
          </div>
        )}
      </div>

      <TokenSelector
        isOpen={sellTokenModalOpen}
        onClose={() => setSellTokenModalOpen(false)}
        onSelect={actions.setSellToken}
        excludeToken={state.buyToken}
        title="Select token to sell"
      />

      <TokenSelector
        isOpen={buyTokenModalOpen}
        onClose={() => setBuyTokenModalOpen(false)}
        onSelect={actions.setBuyToken}
        excludeToken={state.sellToken}
        title="Select token to buy"
      />
    </div>
  );
}
