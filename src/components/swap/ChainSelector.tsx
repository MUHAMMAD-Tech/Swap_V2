import { useState } from 'react';
import { ChainConfig } from '../../types';
import { useChains, useSwapState, useSwapActions } from '../../hooks/useStore';
import './ChainSelector.css';

export function ChainSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const chains = useChains();
  const state = useSwapState();
  const { setSelectedChain } = useSwapActions();

  const handleSelect = (chain: ChainConfig) => {
    setSelectedChain(chain);
    setIsOpen(false);
  };

  return (
    <div className="chain-selector">
      <button 
        className="chain-selector-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        {state.selectedChain ? (
          <>
            <img 
              src={state.selectedChain.logoUrl} 
              alt={state.selectedChain.name}
              className="chain-logo"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/24';
              }}
            />
            <span>{state.selectedChain.name}</span>
          </>
        ) : (
          <span>Select Chain</span>
        )}
        <svg className={`chain-arrow ${isOpen ? 'open' : ''}`} width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>

      {isOpen && (
        <div className="chain-dropdown">
          {chains.map(chain => (
            <button
              key={chain.id}
              className={`chain-option ${state.selectedChain?.id === chain.id ? 'selected' : ''}`}
              onClick={() => handleSelect(chain)}
            >
              <img 
                src={chain.logoUrl} 
                alt={chain.name}
                className="chain-logo"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/24';
                }}
              />
              <div className="chain-info">
                <span className="chain-name">{chain.name}</span>
                <span className="chain-type">{chain.type.toUpperCase()}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
