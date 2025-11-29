import { useDisconnect, useAppKit, useAppKitAccount } from '@reown/appkit/react';
import './WalletButton.css';

export function WalletButton() {
  const { disconnect } = useDisconnect();
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };

  if (isConnected && address) {
    return (
      <div className="wallet-connected">
        <button className="wallet-address-btn" onClick={() => open({ view: 'Account' })}>
          {address.slice(0, 6)}...{address.slice(-4)}
        </button>
        <button className="wallet-disconnect-btn" onClick={handleDisconnect}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <button 
      className="wallet-connect-btn"
      onClick={() => open({ view: 'Connect' })}
    >
      Connect Wallet
    </button>
  );
}
