import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChainConfig } from '../../types';
import { useChains, useSwapState, useSwapActions } from '../../hooks/useStore';
import './ChainSelector.css';

export function ChainSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [style, setStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const chains = useChains();
  const state = useSwapState();
  const { setSelectedChain } = useSwapActions();

  // Position dropdown
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setStyle({
        position: 'fixed',
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
        zIndex: 100000
      });
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !triggerRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  const handleSelect = (chain: ChainConfig) => {
    setSelectedChain(chain);
    setIsOpen(false);
  };

  return (
    <>
      <button
        ref={triggerRef}
        className="chain-selector-trigger"
        onPointerDown={() => setIsOpen(v => !v)}
        type="button"
      >
        {state.selectedChain ? (
          <>
            <img src={state.selectedChain.logoUrl} className="chain-logo" />
            <span>{state.selectedChain.name}</span>
          </>
        ) : (
          <span>Select Chain</span>
        )}
        <svg
          className={`chain-arrow ${isOpen ? 'open' : ''}`}
          width="12"
          height="12"
          viewBox="0 0 12 12"
        >
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="2" />
        </svg>
      </button>

      {isOpen &&
        createPortal(
          <div ref={dropdownRef} className="chain-dropdown" style={style}>
            {chains.map(chain => (
              <button
                key={chain.id}
                className={`chain-option ${
                  state.selectedChain?.id === chain.id ? 'selected' : ''
                }`}
                onClick={() => handleSelect(chain)}
                type="button"
              >
                <img src={chain.logoUrl} className="chain-logo" />
                <div className="chain-info">
                  <span className="chain-name">{chain.name}</span>
                  <span className="chain-type">
                    {chain.type.toUpperCase()}
                  </span>
                </div>
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}