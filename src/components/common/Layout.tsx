import { ReactNode } from 'react';
import { useView, useSwapActions } from '../../hooks/useStore';
import { WalletButton } from '../wallet/WalletButton';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const view = useView();
  const { setView } = useSwapActions();

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="16" fill="url(#logo-gradient)" />
              <path d="M10 12L16 8L22 12V20L16 24L10 20V12Z" stroke="white" strokeWidth="2" fill="none" />
              <path d="M16 14V18M14 16H18" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <defs>
                <linearGradient id="logo-gradient" x1="0" y1="0" x2="32" y2="32">
                  <stop stopColor="#6366f1" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
            <span className="logo-text">Lethex</span>
          </div>

          <nav className="nav">
            <button
              className={`nav-btn ${view === 'swap' ? 'active' : ''}`}
              onClick={() => setView('swap')}
            >
              Swap
            </button>
            <button
              className={`nav-btn ${view === 'dashboard' ? 'active' : ''}`}
              onClick={() => setView('dashboard')}
            >
              Dashboard
            </button>
          </nav>

          <div className="header-right">
            <WalletButton />
          </div>
        </div>
      </header>

      <main className="main">
        {children}
      </main>

      <footer className="footer">
        <p>Lethex - Multi-chain Swap Platform</p>
        <p className="footer-fee">Trading fee: 0.08%</p>
      </footer>
    </div>
  );
}
