import { useState, useEffect, useMemo } from 'react';
import { TokenInfo } from '../../types';
import { useSwapState, useSwapActions, useTokens } from '../../hooks/useStore';
import { Modal } from '../common/Modal';
import { api } from '../../services/api';
import './TokenSelector.css';

interface TokenSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (token: TokenInfo) => void;
  excludeToken?: TokenInfo | null;
  title: string;
}

export function TokenSelector({ isOpen, onClose, onSelect, excludeToken, title }: TokenSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingToken, setIsAddingToken] = useState(false);
  const [customAddress, setCustomAddress] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState('');
  
  const state = useSwapState();
  const tokens = useTokens(state.selectedChain?.id);
  const { addUserToken } = useSwapActions();

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setIsAddingToken(false);
      setCustomAddress('');
      setValidationError('');
    }
  }, [isOpen]);

  const filteredTokens = useMemo(() => {
    return tokens.filter(token => {
      if (excludeToken && token.address.toLowerCase() === excludeToken.address.toLowerCase()) {
        return false;
      }
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        token.symbol.toLowerCase().includes(query) ||
        token.name.toLowerCase().includes(query) ||
        token.address.toLowerCase().includes(query)
      );
    });
  }, [tokens, excludeToken, searchQuery]);

  const handleAddToken = async () => {
    if (!state.selectedChain || !customAddress) return;
    
    setIsValidating(true);
    setValidationError('');
    
    try {
      const token = await api.validateToken(state.selectedChain.id, customAddress);
      addUserToken(state.selectedChain.id, token);
      onSelect(token);
      onClose();
    } catch (error) {
      setValidationError('Token not found or invalid address');
    } finally {
      setIsValidating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="token-selector">
        <div className="token-search">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, symbol, or address"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {isAddingToken ? (
          <div className="add-token-form">
            <p className="add-token-label">Enter token contract address</p>
            <input
              type="text"
              className="add-token-input"
              placeholder={state.selectedChain?.type === 'evm' ? '0x...' : 'Token address'}
              value={customAddress}
              onChange={e => setCustomAddress(e.target.value)}
            />
            {validationError && <p className="add-token-error">{validationError}</p>}
            <div className="add-token-actions">
              <button 
                className="add-token-cancel"
                onClick={() => setIsAddingToken(false)}
              >
                Cancel
              </button>
              <button 
                className="add-token-submit"
                onClick={handleAddToken}
                disabled={!customAddress || isValidating}
              >
                {isValidating ? 'Validating...' : 'Add Token'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="token-list">
              {filteredTokens.length === 0 ? (
                <p className="no-tokens">No tokens found</p>
              ) : (
                filteredTokens.map(token => (
                  <button
                    key={token.address}
                    className="token-item"
                    onClick={() => {
                      onSelect(token);
                      onClose();
                    }}
                  >
                    <img 
                      src={token.logoUrl} 
                      alt={token.symbol}
                      className="token-logo"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/36';
                      }}
                    />
                    <div className="token-info">
                      <span className="token-symbol">{token.symbol}</span>
                      <span className="token-name">{token.name}</span>
                    </div>
                    {token.isUserAdded && (
                      <span className="token-badge">Custom</span>
                    )}
                  </button>
                ))
              )}
            </div>

            <button 
              className="add-custom-token"
              onClick={() => setIsAddingToken(true)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add Custom Token
            </button>
          </>
        )}
      </div>
    </Modal>
  );
}
